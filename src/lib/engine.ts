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
/** Wide screens: section pages are a full-screen split, with the other stamps in the dark left column. */
const isSplit = () => window.innerWidth >= 900;
const colWidth = () => Math.max(300, stage.clientWidth * 0.32);
const restRotation = (id: SectionId) => (state === 'nav' ? tilt[id] : 0);
const img = (id: SectionId) => `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/stamps/${id}.webp`;
/** The horizontal artwork used in the section-page column (Experience and Photography are already horizontal). */
const HRATIO = 1000 / 682;
const imgH = (id: SectionId) => (byId(id).ratio >= 1 ? img(id) : `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/stamps/${id}-h.webp`);
/** Swap a stamp between its home-page artwork and its horizontal column artwork. */
function setArt(id: SectionId, horizontal: boolean) {
  const im = stampEls.get(id)?.querySelector('img');
  if (!im) return;
  const src = horizontal ? imgH(id) : img(id);
  if (!im.src.endsWith(src)) im.src = src;
  const landscape = horizontal || byId(id).ratio >= 1;
  im.width = landscape ? 1000 : 682;
  im.height = landscape ? 682 : 1000;
}

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
  crafts: { x: 0.54, y: 0.57, w: 0.155 },
  photography: { x: 0.7, y: 0.42, w: 0.19 },
  about: { x: 0.86, y: 0.58, w: 0.14 },
};
const navMobile: Record<SectionId, NavSpot> = {
  projects: { x: 0.3, y: 0.2, w: 0.38 },
  experience: { x: 0.68, y: 0.33, w: 0.5 },
  crafts: { x: 0.3, y: 0.5, w: 0.38 },
  photography: { x: 0.64, y: 0.66, w: 0.5 },
  about: { x: 0.3, y: 0.85, w: 0.34 },
};

function buildStamps() {
  for (const s of SECTIONS) new Image().src = imgH(s.id); // warm the horizontal art so the column never pops
  for (const s of SECTIONS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'stamp';
    b.dataset.id = s.id;
    b.setAttribute('aria-label', `${s.label}, stamp ${s.no}`);
    b.innerHTML = `<img src="${img(s.id)}" alt="${s.alt}" width="${s.ratio >= 1 ? 1000 : 682}" height="${s.ratio >= 1 ? 682 : 1000}" draggable="false" /><span class="tag">${s.label}</span>`;
    b.addEventListener('click', () => { if (!justDragged) select(s.id); });
    b.addEventListener('pointermove', (e) => { if (!dragging) nudge(b, s.id, e.clientX, e.clientY); });
    enableDrag(b, s.id);
    b.addEventListener('pointerleave', () => unnudge(b, s.id));
    b.addEventListener('focus', () => nudge(b, s.id));
    b.addEventListener('blur', () => unnudge(b, s.id));
    stampsEl.appendChild(b);
    stampEls.set(s.id, b);
  }
}

/** Pick a stamp up and move it; on release it springs back to its spot. */
let dragging = false;
let justDragged = false;
function enableDrag(el: HTMLButtonElement, id: SectionId) {
  let pid = -1, sx = 0, sy = 0, ox = 0, oy = 0, moved = false;
  el.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || busy || pid !== -1) return;
    pid = e.pointerId; sx = e.clientX; sy = e.clientY; moved = false;
    ox = Number(gsap.getProperty(el, 'x')) || 0; oy = Number(gsap.getProperty(el, 'y')) || 0;
  });
  el.addEventListener('pointermove', (e) => {
    if (e.pointerId !== pid) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (!moved) {
      if (Math.hypot(dx, dy) < 6) return;
      moved = true; dragging = true;
      el.setPointerCapture(pid);
      el.classList.add('held');
      gsap.killTweensOf(el);
      gsap.to(el, { scale: 1.08, duration: 0.2, ease: 'power2.out', overwrite: 'auto' });
    }
    gsap.set(el, { x: ox + dx, y: oy + dy, rotation: restRotation(id) + Math.max(-8, Math.min(8, e.movementX * 0.6)) });
  });
  const end = (e: PointerEvent) => {
    if (e.pointerId !== pid) return;
    pid = -1;
    if (!moved) return;
    dragging = false;
    justDragged = true;
    setTimeout(() => { justDragged = false; }, 0);
    el.classList.remove('held');
    gsap.to(el, { x: 0, y: 0, scale: 1, rotation: restRotation(id), duration: reduce ? 0.2 : 0.8, ease: reduce ? 'power2.out' : 'elastic.out(1, 0.55)', overwrite: 'auto' });
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
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
  setArt(id, false);
  gsap.set(stampEls.get(id)!, { left: sp.x * W - w / 2, top: sp.y * H - h / 2, width: w, rotation: tilt[id], x: 0, y: 0, opacity: 1, scale: 1 });
}
/** Label font size (px) and the width a slot needs so neighbouring labels never collide. */
const labelPx = () => (isMobile() ? 9 : 12);
function miniSlots() {
  const hgt = isMobile() ? 46 : 62;
  const gap = isMobile() ? 6 : 20;
  const slots = order.map((id) => {
    const sw = hgt * byId(id).ratio;
    const lw = byId(id).label.length * labelPx() * 0.78;
    return { id, sw, w: Math.max(sw, lw) };
  });
  const total = slots.reduce((t, x) => t + x.w, 0) + gap * (slots.length - 1);
  let left = Math.max(8, (stage.clientWidth - total) / 2);
  return slots.map((x) => { const o = { ...x, left: left + (x.w - x.sw) / 2 }; left += x.w + gap; return o; });
}
function placeMini(id: SectionId, slot: number) {
  if (isSplit()) {
    // One column down the left of the dark panel, all five stamps in fixed slots, above the heading.
    const cw = colWidth(), H = stage.clientHeight;
    const pad = Math.min(44, Math.max(24, stage.clientWidth * 0.03));
    const top = 48, bottom = 210, label = 14;
    const slotH = Math.max(70, (H - top - bottom) / order.length);
    const r = HRATIO;
    setArt(id, true);
    const w = Math.min((cw - pad * 2) * 0.55, (slotH - label) * r);
    const h = w / r;
    gsap.set(stampEls.get(id)!, { left: pad, top: top + slot * slotH + (slotH - label - h) / 2, width: w, rotation: 0, x: 0, y: 0, scale: 1 });
    return;
  }
  setArt(id, false);
  const hgt = isMobile() ? 46 : 62;
  const sp = miniSlots()[slot];
  gsap.set(stampEls.get(id)!, { left: sp.left, top: isMobile() ? 14 : 18, width: hgt * byId(id).ratio, rotation: 0, x: 0, y: 0, opacity: 1, scale: 1 });
}
function layoutNav() { SECTIONS.forEach((s) => placeNav(s.id)); stampsEl.dataset.mode = 'nav'; }
function layoutMini() {
  stampsEl.dataset.mode = 'mini';
  order.forEach((id, i) => placeMini(id, i));
  stampEls.forEach((el, id) => {
    el.removeAttribute('tabindex');
    gsap.set(el, { opacity: id === active ? 1 : 0.6, pointerEvents: 'auto' });
    if (id === active) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
  });
}

function swapBackground(id: SectionId) {
  bgEl.style.backgroundImage = `url(${img(id)})`;
}

/* ---------- content ---------- */
function renderContent(id: SectionId) {
  const s = byId(id);
  contentEl.hidden = false;
  contentEl.innerHTML = `<div class="panel"><header class="panel-head"><div class="no">${s.no} · ${s.stampName}</div><h1 tabindex="-1">${s.label}</h1></header><div class="panel-body">${s.html}</div></div>`;
  contentEl.scrollTop = 0;
  document.title = `${s.label} · ${SITE.name}`;
}
function showContent(focus: boolean, swap = false) {
  if (swap) {
    // Section to section: the page frame stays put, only the body fades in, so the background never shows through.
    const body = contentEl.querySelector('.panel-body');
    if (body) gsap.fromTo(body, { opacity: 0 }, { opacity: 1, duration: T(0.4), ease: 'power1.out' });
    if (focus) (contentEl.querySelector('h1') as HTMLElement | null)?.focus({ preventScroll: true });
    return;
  }
  gsap.fromTo(contentEl, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: T(0.6), ease: 'power2.out', onComplete: () => { gsap.set(contentEl, { clearProps: 'transform' }); } });
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

const wait = (sec: number) => new Promise<void>((r) => { gsap.delayedCall(sec, r); });

async function navToPage(id: SectionId) {
  busy = true;
  gsap.killTweensOf([...stampEls.values()]);
  gsap.set([...stampEls.values()], { x: 0, y: 0, rotation: (_i: number, t: Element) => tilt[(t as HTMLElement).dataset.id as SectionId] });
  active = id;
  order = SECTIONS.map((s) => s.id); // all five stamps stay, in fixed slots
  const flipState = Flip.getState([...stampEls.values()]);
  state = 'page';
  stage.dataset.state = 'page'; // the footer leaves and the stage fills the screen before the column is laid out
  layoutMini();
  Flip.from(flipState, { duration: T(0.8), ease: 'power3.inOut', stagger: reduce ? 0 : 0.04, absolute: false });
  homeBtn.hidden = false;
  gsap.fromTo(homeBtn, { opacity: 0 }, { opacity: 1, duration: T(0.5), delay: T(0.5) });
  await wait(T(0.35));
  renderContent(id);
  showContent(true);
  done();
}

async function pageSwap(id: SectionId) {
  busy = true;
  const prev = active as SectionId;
  active = id;
  // Stamps never move: just light up the new one. Only the page body swaps, the dark column stays.
  gsap.to(stampEls.get(prev)!, { opacity: 0.6, duration: T(0.3) });
  gsap.to(stampEls.get(id)!, { opacity: 1, duration: T(0.3) });
  stampEls.get(prev)!.removeAttribute('aria-current');
  stampEls.get(id)!.setAttribute('aria-current', 'page');
  gsap.to(contentEl.querySelector('.panel-body'), { opacity: 0, duration: T(0.2) });
  await wait(T(0.25));
  renderContent(id);
  showContent(true, true);
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
    order = SECTIONS.map((s) => s.id);
    stage.dataset.state = 'page';
    layoutMini();
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
const openDetail = () => contentEl.querySelector<HTMLElement>('.detail:not([hidden])');
const closeDetail = () => {
  const d = openDetail();
  if (!d) return false;
  d.hidden = true;
  delete stage.dataset.detailOpen;
  const opener = contentEl.querySelector<HTMLElement>(`[data-detail="${d.id}"]`);
  opener?.focus({ preventScroll: true });
  return true;
};
const onContentClick = (e: MouseEvent) => {
  const t = e.target as HTMLElement;
  const card = t.closest<HTMLElement>('[data-detail]');
  if (card) {
    const d = contentEl.querySelector<HTMLElement>(`#${card.dataset.detail}`);
    if (d) { gsap.set(contentEl, { clearProps: 'transform' }); d.hidden = false; stage.dataset.detailOpen = '1'; d.scrollTop = 0; gsap.fromTo(d, { opacity: 0 }, { opacity: 1, duration: T(0.35) }); d.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true }); }
    return;
  }
  if (t.closest('[data-close]') || t.classList.contains('detail')) closeDetail();
};
const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && state === 'page' && !closeDetail()) goHome(); };
contentEl.addEventListener('click', onContentClick);
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
  contentEl.removeEventListener('click', onContentClick);
  disposed = true;
  dragging = false; justDragged = false;
  logoCleanup();
  gsap.killTweensOf([...stampEls.values(), contentEl, bgEl, homeBtn]);
  stampsEl.replaceChildren();
  bleedLayer.replaceChildren();
  document.title = 'Matthew Bloomfield';
};
}
