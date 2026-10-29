import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { SITE, buildSections, type Section, type SectionId, type SiteContent } from './content';

gsap.registerPlugin(Flip);

export function initPortfolio(content: SiteContent): () => void {
const SECTIONS = buildSections(content);
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const T = (s: number) => (reduce ? Math.min(0.2, s) : s);
const $ = <E extends HTMLElement>(id: string) => document.getElementById(id) as E;

const stage = $('stage');
const stampsEl = $('stamps');
const homeBtn = $<HTMLButtonElement>('home');
const contentEl = $('content');
const bgEl = $('bg');
const bleedLayer = $('bleed-layer');
const dispEl = document.getElementById('bleed-disp') as unknown as SVGElement;

type State = 'nav' | 'page';
let state: State = 'nav';
let active: SectionId | null = null;
let order: SectionId[] = []; // ids in mini-nav slots, left to right
let busy = false;
let clockTimer = 0;
let disposed = false;
/** End a transition, then re-sync with the URL/viewport if they changed meanwhile. */
function done() {
  busy = false;
  if (disposed) return;
  const id = parseHash();
  if (id !== active) enterInstant(id);
  else if (state === 'nav') layoutNav();
  else if (state === 'page') layoutMini();
}

const byId = (id: SectionId) => SECTIONS.find((s) => s.id === id) as Section;
const isMobile = () => window.innerWidth < 640;
const img = (id: SectionId) => `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/stamps/${id}.webp`;

/* ---------- logo explosion (home button) ---------- */
interface LogoSprite { width: number; height: number; frames: string[] }
let logoSprite: LogoSprite | null = null;
let logoPromise: Promise<LogoSprite> | null = null;
const loadLogo = () => (logoPromise ??= fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/logo/sprite.json`).then((r) => r.json() as Promise<LogoSprite>));
function mountLogo() {
  const svgNS = 'http://www.w3.org/2000/svg';
  homeBtn.textContent = '';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'logo');
  svg.setAttribute('aria-hidden', 'true');
  homeBtn.appendChild(svg);
  const frame = { i: 0, target: 0, last: 0, raf: 0 };
  const draw = () => { if (logoSprite) svg.innerHTML = logoSprite.frames[frame.i]; };
  const tick = (now: number) => {
    frame.raf = 0;
    if (!logoSprite) return;
    frame.target = Math.min(frame.target, logoSprite.frames.length - 1);
    if (now - frame.last >= 25) {
      frame.last = now;
      frame.i += Math.sign(frame.target - frame.i);
      draw();
    }
    if (frame.i !== frame.target) frame.raf = requestAnimationFrame(tick);
  };
  const go = (t: number) => {
    if (reduce) return; // static logo for reduced motion
    frame.target = t;
    if (!frame.raf) frame.raf = requestAnimationFrame(tick);
  };
  loadLogo().then((s) => {
    logoSprite = s;
    svg.setAttribute('viewBox', `0 0 ${s.width} ${s.height}`);
    draw();
    if (frame.i !== frame.target && !frame.raf) frame.raf = requestAnimationFrame(tick); // hover happened while loading
  }).catch(() => { homeBtn.textContent = '\u2302'; });
  const over = () => go((logoSprite?.frames.length ?? 49) - 1);
  const out = () => go(0);
  homeBtn.addEventListener('pointerenter', over);
  homeBtn.addEventListener('pointerleave', out);
  homeBtn.addEventListener('focus', over);
  homeBtn.addEventListener('blur', out);
  logoCleanup = () => {
    cancelAnimationFrame(frame.raf);
    homeBtn.removeEventListener('pointerenter', over);
    homeBtn.removeEventListener('pointerleave', out);
    homeBtn.removeEventListener('focus', over);
    homeBtn.removeEventListener('blur', out);
  };
}
let logoCleanup = () => {};

/* ---------- stamps ---------- */
const stampEls = new Map<SectionId, HTMLButtonElement>();
const tilt: Record<SectionId, number> = { projects: -4, experience: 3, about: -2, crafts: 4, photography: -3 };

interface NavSpot { x: number; y: number; w: number }
const navDesktop: Record<SectionId, NavSpot> = {
  projects: { x: 0.2, y: 0.5, w: 0.15 },
  experience: { x: 0.37, y: 0.4, w: 0.19 },
  about: { x: 0.54, y: 0.57, w: 0.14 },
  crafts: { x: 0.69, y: 0.42, w: 0.155 },
  photography: { x: 0.85, y: 0.58, w: 0.19 },
};
const navMobile: Record<SectionId, NavSpot> = {
  projects: { x: 0.3, y: 0.2, w: 0.38 },
  experience: { x: 0.68, y: 0.33, w: 0.5 },
  about: { x: 0.3, y: 0.5, w: 0.36 },
  crafts: { x: 0.7, y: 0.66, w: 0.38 },
  photography: { x: 0.42, y: 0.86, w: 0.52 },
};

function buildStamps() {
  for (const s of SECTIONS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'stamp';
    b.dataset.id = s.id;
    b.setAttribute('aria-label', `${s.label}, stamp ${s.no}`);
    b.innerHTML = `<img src="${img(s.id)}" alt="${s.alt}" width="${s.ratio >= 1 ? 1000 : 682}" height="${s.ratio >= 1 ? 682 : 1000}" draggable="false" /><span class="tag">${s.label}</span>`;
    b.addEventListener('click', () => select(s.id));
    b.addEventListener('pointermove', (e) => nudge(b, s.id, e.clientX, e.clientY));
    b.addEventListener('pointerleave', () => unnudge(b, s.id));
    b.addEventListener('focus', () => nudge(b, s.id));
    b.addEventListener('blur', () => unnudge(b, s.id));
    stampsEl.appendChild(b);
    stampEls.set(s.id, b);
  }
}

function nudge(el: HTMLElement, id: SectionId, cx?: number, cy?: number) {
  if (state !== 'nav' || busy || reduce) return;
  const r = el.getBoundingClientRect();
  const dx = cx === undefined ? 0 : cx - (r.left + r.width / 2);
  const dy = cy === undefined ? -1 : cy - (r.top + r.height / 2);
  const k = Math.min(r.width, 200) / 200;
  gsap.to(el, { x: -dx * 0.12 * k, y: -dy * 0.12 * k - 4, rotation: tilt[id] + dx * 0.03, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
}
function unnudge(el: HTMLElement, id: SectionId) {
  if (state !== 'nav' || busy) return;
  gsap.to(el, { x: 0, y: 0, rotation: tilt[id], duration: 0.6, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
}

function sizeOf(id: SectionId, w: number) {
  return { w, h: w / byId(id).ratio };
}

function placeNav(id: SectionId) {
  const spots = isMobile() ? navMobile : navDesktop;
  const sp = spots[id];
  const W = stage.clientWidth, H = stage.clientHeight;
  const { w, h } = sizeOf(id, sp.w * W);
  gsap.set(stampEls.get(id)!, { left: sp.x * W - w / 2, top: sp.y * H - h / 2, width: w, rotation: tilt[id], x: 0, y: 0, opacity: 1, scale: 1 });
}
function placeMini(id: SectionId, slot: number) {
  const hgt = isMobile() ? 46 : 62;
  const gap = isMobile() ? 8 : 12;
  const w = hgt * byId(id).ratio;
  // x offset: sum of widths of previous slots
  let left = isMobile() ? 14 : 20;
  for (let i = 0; i < slot; i++) left += hgt * byId(order[i]).ratio + gap;
  gsap.set(stampEls.get(id)!, { left, top: isMobile() ? 14 : 18, width: w, rotation: 0, x: 0, y: 0, opacity: 1, scale: 1 });
}
function layoutNav() { SECTIONS.forEach((s) => placeNav(s.id)); stampsEl.dataset.mode = 'nav'; }
function layoutMini() {
  stampsEl.dataset.mode = 'mini';
  order.forEach((id, i) => placeMini(id, i));
  stampEls.forEach((el) => el.removeAttribute('tabindex'));
  if (active) {
    const a = stampEls.get(active)!;
    gsap.set(a, { opacity: 0, pointerEvents: 'none' });
    a.tabIndex = -1;
  }
}

/* ---------- ink bleed ---------- */
interface Geo { cx: number; cy: number; w: number; h: number; rot: number }
/** The stamp's real (unrotated) size and centre, so the overlay matches it exactly. */
function captureGeo(el: HTMLElement): Geo {
  const sr = stage.getBoundingClientRect();
  const r = el.getBoundingClientRect(); // rotation keeps the centre
  return { cx: r.left + r.width / 2 - sr.left, cy: r.top + r.height / 2 - sr.top, w: el.offsetWidth, h: el.offsetHeight, rot: Number(gsap.getProperty(el, 'rotation')) || 0 };
}

function bleedGrow(id: SectionId, g: Geo): Promise<void> {
  return new Promise((resolve) => {
    const W = stage.clientWidth, H = stage.clientHeight;
    // Padded wrapper so the displacement filter never clips at the stamp's bounding box.
    const pad = 1.8;
    const el = document.createElement('div');
    el.className = 'bleed';
    const im = document.createElement('img');
    im.src = img(id);
    im.alt = '';
    im.style.cssText = `width:${g.w}px;height:${g.h}px;display:block;`;
    el.appendChild(im);
    bleedLayer.appendChild(el);
    gsap.set(el, { width: g.w * pad, height: g.h * pad, left: g.cx - (g.w * pad) / 2, top: g.cy - (g.h * pad) / 2, rotation: g.rot, transformOrigin: '50% 50%' });
    const p = { disp: 0, blur: 0 };
    const apply = () => {
      dispEl.setAttribute('scale', String(p.disp));
      el.style.filter = `url(#bleed) blur(${p.blur}px)`;
    };
    bgEl.style.backgroundImage = `url(${img(id)})`;
    const dur = T(1.1);
    const scale = Math.max(W / g.w, H / g.h) * 1.25;
    const tl = gsap.timeline({ onComplete: () => { el.remove(); dispEl.setAttribute('scale', '0'); resolve(); } });
    if (!reduce) tl.to(el, { x: W / 2 - g.cx, y: H / 2 - g.cy, scale, rotation: 0, duration: dur, ease: 'power3.in' }, 0);
    tl.to(p, { disp: reduce ? 0 : 30, blur: reduce ? 0 : 10, duration: dur, ease: 'power2.in', onUpdate: apply }, 0)
      .to(bgEl, { opacity: 0.95, duration: dur * 0.7, ease: 'power1.inOut' }, dur * 0.3)
      .to(el, { opacity: 0, duration: dur * 0.45, ease: 'power1.out' }, dur * 0.55);
  });
}
function swapBackground(id: SectionId) {
  bgEl.style.backgroundImage = `url(${img(id)})`;
}

/* ---------- content ---------- */
function renderContent(id: SectionId) {
  const s = byId(id);
  contentEl.hidden = false;
  contentEl.innerHTML = `<div class="panel"><div class="no">${s.no} · ${s.stampName}</div><h1 tabindex="-1">${s.label}</h1>${s.html}</div>`;
  contentEl.scrollTop = 0;
  document.title = `${s.label} · ${SITE.name}`;
}
function showContent(focus: boolean) {
  gsap.fromTo(contentEl, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: T(0.6), ease: 'power2.out' });
  if (focus) (contentEl.querySelector('h1') as HTMLElement | null)?.focus({ preventScroll: true });
}

/* ---------- state transitions ---------- */
function setHash(h: string) {
  if (location.hash !== h) history.pushState(null, '', h || location.pathname);
}

async function select(id: SectionId) {
  if (busy || id === active) return;
  setHash(`#/${id}`);
  if (state === 'nav') await navToPage(id);
  else await pageSwap(id);
}

async function navToPage(id: SectionId) {
  busy = true;
  gsap.killTweensOf([...stampEls.values()]);
  const clicked = stampEls.get(id)!;
  gsap.set([...stampEls.values()], { x: 0, y: 0, rotation: (_i: number, t: Element) => tilt[(t as HTMLElement).dataset.id as SectionId] });
  const geo = captureGeo(clicked);
  active = id;
  order = SECTIONS.map((s) => s.id).filter((x) => x !== id);
  const others = order.map((x) => stampEls.get(x)!);
  const flipState = Flip.getState(others);
  layoutMini();
  gsap.set(clicked, { opacity: 0 });
  Flip.from(flipState, { duration: T(0.9), ease: 'power3.inOut', stagger: reduce ? 0 : 0.05, absolute: false });
  state = 'page';
  stage.dataset.state = 'page';
  homeBtn.hidden = false;
  gsap.fromTo(homeBtn, { opacity: 0 }, { opacity: 1, duration: T(0.5), delay: T(0.6) });
  await bleedGrow(id, geo);
  renderContent(id);
  showContent(true);
  done();
}

async function pageSwap(id: SectionId) {
  busy = true;
  const prev = active as SectionId;
  const slot = order.indexOf(id);
  const slotEl = stampEls.get(id)!;
  const geo = captureGeo(slotEl);
  order[slot] = prev;
  active = id;
  gsap.to(contentEl, { opacity: 0, duration: T(0.25) });
  const prevEl = stampEls.get(prev)!;
  gsap.set(prevEl, { opacity: 1, pointerEvents: 'auto' });
  const flipState = Flip.getState([...stampEls.values()]);
  layoutMini(); // re-pack every slot: stamp widths differ
  Flip.from(flipState, { duration: T(0.8), ease: 'power3.inOut', absolute: false });
  gsap.fromTo(prevEl, { opacity: 0 }, { opacity: 1, duration: T(0.6), ease: 'power1.out' });
  gsap.set(bgEl, { opacity: 0.95 });
  await bleedGrow(id, geo);
  renderContent(id);
  showContent(true);
  done();
}

async function goHome(replay = true) {
  if (busy || state !== 'page') return;
  busy = true;
  gsap.to(contentEl, { opacity: 0, duration: T(0.25), onComplete: () => { contentEl.hidden = true; } });
  gsap.to(bgEl, { opacity: 0, duration: T(0.7) });
  gsap.to(homeBtn, { opacity: 0, duration: T(0.3), onComplete: () => { homeBtn.hidden = true; } });
  const activeEl = stampEls.get(active as SectionId)!;
  active = null;
  state = 'nav';
  stage.dataset.state = 'nav';
  const all = [...stampEls.values()];
  const flipState = Flip.getState(all);
  layoutNav();
  gsap.set(activeEl, { pointerEvents: 'auto' });
  activeEl.removeAttribute('tabindex');
  activeEl.focus({ preventScroll: true });
  Flip.from(flipState, { duration: T(0.9), ease: 'power3.inOut', stagger: reduce ? 0 : 0.04, absolute: false });
  gsap.fromTo(activeEl, { opacity: 0 }, { opacity: 1, duration: T(0.8), delay: T(0.2) });
  document.title = SITE.name;
  setHash('#/');
  if (!replay) { /* reserved */ }
  await new Promise((r) => setTimeout(r, T(1) * 1000));
  done();
}

/* ---------- entrances ---------- */
function fanIn() {
  const W = stage.clientWidth;
  SECTIONS.forEach((s, i) => {
    const el = stampEls.get(s.id)!;
    const side = i % 2 === 0 ? -1 : 1;
    if (reduce) { gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.2 }); return; }
    gsap.fromTo(el,
      { x: side * W * 0.9, y: gsap.utils.random(-120, 120), rotation: tilt[s.id] + side * gsap.utils.random(25, 60), opacity: 0 },
      { x: 0, y: 0, rotation: tilt[s.id], opacity: 1, duration: T(1.4), delay: i * 0.08 * (reduce ? 0 : 1), ease: 'power3.out', overwrite: 'auto' });
  });
}

/* ---------- routing ---------- */
function parseHash(): SectionId | null {
  const m = location.hash.match(/^#\/([a-z]+)$/);
  const id = m?.[1] as SectionId | undefined;
  return id && SECTIONS.some((s) => s.id === id) ? id : null;
}
function enterInstant(id: SectionId | null) {
  stampsEl.inert = false;
  gsap.killTweensOf([...stampEls.values(), contentEl, bgEl]);
  stampEls.forEach((el) => { gsap.set(el, { pointerEvents: 'auto', opacity: 1 }); el.removeAttribute('tabindex'); });
  if (id) {
    state = 'page';
    active = id;
    order = SECTIONS.map((s) => s.id).filter((x) => x !== id);
    layoutMini();
    stage.dataset.state = 'page';
    homeBtn.hidden = false;
    gsap.set(homeBtn, { opacity: 1 });
    swapBackground(id);
    gsap.set(bgEl, { opacity: 0.95 });
    renderContent(id);
    gsap.set(contentEl, { opacity: 1, y: 0 });
  } else {
    state = 'nav';
    active = null;
    stage.dataset.state = 'nav';
    layoutNav();
    gsap.set(bgEl, { opacity: 0 });
    contentEl.hidden = true;
    homeBtn.hidden = true;
    document.title = SITE.name;
  }
  busy = false;
}

/* ---------- footer ---------- */
function buildFooter() {
  $('email').textContent = SITE.email;
  ($('email') as HTMLAnchorElement).href = `mailto:${SITE.email}`;
  const clock = $<HTMLTimeElement>('clock');
  const fmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' /* visitor's local time */ });
  const tick = () => { const d = new Date(); clock.textContent = fmt.format(d); clock.dateTime = d.toISOString(); };
  tick();
  clockTimer = window.setInterval(tick, 15000);
}

/* ---------- boot ---------- */
buildStamps();
buildFooter();
mountLogo();
const onHome = () => goHome();
const onHash = () => {
  if (busy) return; // done() re-syncs when a transition ends
  const id = parseHash();
  if (location.hash && !id) history.replaceState(null, '', '#/');
  if (id === active) return;
  enterInstant(id);
};
let resizeRaf = 0;
// Re-lay out every frame while the window changes size so the stamps track it live.
const onResize = () => {
  if (resizeRaf) return;
  resizeRaf = requestAnimationFrame(() => {
    resizeRaf = 0;
    if (busy) return; // done() re-syncs when the transition ends
    if (state === 'nav') layoutNav();
    else if (state === 'page') layoutMini();
  });
};
const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && state === 'page') goHome(); };
homeBtn.addEventListener('click', onHome);
window.addEventListener('hashchange', onHash);
window.addEventListener('resize', onResize);
document.addEventListener('keydown', onKey);

{
  const hashId = parseHash();
  if (hashId) enterInstant(hashId);
  else { enterInstant(null); fanIn(); }
}

return () => {
  cancelAnimationFrame(resizeRaf);
  clearInterval(clockTimer);
  homeBtn.removeEventListener('click', onHome);
  window.removeEventListener('hashchange', onHash);
  window.removeEventListener('resize', onResize);
  document.removeEventListener('keydown', onKey);
  disposed = true;
  logoCleanup();
  gsap.killTweensOf([...stampEls.values(), contentEl, bgEl, homeBtn]);
  stampsEl.replaceChildren();
  bleedLayer.replaceChildren();
  document.title = 'Matthew Bloomfield';
};
}
