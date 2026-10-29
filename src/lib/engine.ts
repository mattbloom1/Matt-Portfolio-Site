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
const openerEl = $('opener');
const openerStamp = $('opener-stamp');
const skipBtn = $<HTMLButtonElement>('skip');
const homeBtn = $<HTMLButtonElement>('home');
const contentEl = $('content');
const bgEl = $('bg');
const bleedLayer = $('bleed-layer');
const dispEl = document.getElementById('bleed-disp') as unknown as SVGElement;

type State = 'opener' | 'nav' | 'page';
let state: State = 'opener';
let active: SectionId | null = null;
let order: SectionId[] = []; // ids in mini-nav slots, left to right
let busy = false;
let clockTimer = 0;
let disposed = false;
let openerTimer = 0;
let openerDone = false;
/** End a transition, then re-sync with the URL/viewport if they changed meanwhile. */
function done() {
  busy = false;
  if (disposed) return;
  if (state === 'opener') return;
  const id = parseHash();
  if (id !== active) enterInstant(id);
  else if (state === 'nav') layoutNav();
  else if (state === 'page') layoutMini();
}

const byId = (id: SectionId) => SECTIONS.find((s) => s.id === id) as Section;
const isMobile = () => window.innerWidth < 640;
const img = (id: SectionId) => `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/stamps/${id}.webp`;

/* ---------- opener (placeholder stamp: logo, name, date) ---------- */
function perforatedPath(w: number, h: number, r: number, pitch: number): string {
  let d = `M0 0H${w}V${h}H0Z`;
  const holes = (len: number) => Math.round(len / pitch);
  const nx = holes(w), ny = holes(h);
  const hole = (cx: number, cy: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  for (let i = 0; i <= nx; i++) { d += hole((i * w) / nx, 0) + hole((i * w) / nx, h); }
  for (let j = 1; j < ny; j++) { d += hole(0, (j * h) / ny) + hole(w, (j * h) / ny); }
  return d;
}
function buildOpener() {
  const w = 300, h = 400;
  openerStamp.innerHTML = `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${SITE.name}, ${SITE.openerDate}">
    <path d="${perforatedPath(w, h, 6, 20)}" fill="#c9553d" fill-rule="evenodd"/>
    <rect x="22" y="22" width="${w - 44}" height="${h - 44}" fill="none" stroke="#141414" stroke-width="2"/>
    <circle cx="150" cy="150" r="62" fill="none" stroke="#141414" stroke-width="2"/>
    <text x="150" y="176" text-anchor="middle" font-size="78" font-weight="600">M</text>
    <text x="150" y="268" text-anchor="middle" font-size="30" font-weight="600" letter-spacing="3">MATT</text>
    <text x="150" y="300" text-anchor="middle" font-size="30" font-weight="600" letter-spacing="3">BLOOMFIELD</text>
    <text x="150" y="344" text-anchor="middle" font-size="15" letter-spacing="4">${SITE.openerDate}</text>
  </svg>`;
}

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
function bleedGrow(id: SectionId, from: DOMRect): Promise<void> {
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.className = 'bleed';
    el.style.backgroundImage = `url(${img(id)})`;
    bleedLayer.appendChild(el);
    const sr = stage.getBoundingClientRect();
    const W = sr.width, H = sr.height;
    gsap.set(el, { left: from.left - sr.left, top: from.top - sr.top, width: from.width, height: from.height });
    const p = { disp: 0, blur: 0 };
    const apply = () => {
      dispEl.setAttribute('scale', String(p.disp));
      el.style.filter = `url(#bleed) blur(${p.blur}px)`;
    };
    bgEl.style.backgroundImage = `url(${img(id)})`;
    const dur = T(1.1);
    const tl = gsap.timeline({ onComplete: () => { el.remove(); dispEl.setAttribute('scale', '0'); resolve(); } });
    if (reduce) gsap.set(el, { left: 0, top: 0, width: W, height: H });
    tl.to(el, reduce ? { duration: dur } : { left: -W * 0.05, top: -H * 0.05, width: W * 1.1, height: H * 1.1, duration: dur, ease: 'power3.in' }, 0)
      .to(p, { disp: reduce ? 0 : 60, blur: reduce ? 0 : 20, duration: dur, ease: 'power2.in', onUpdate: apply }, 0)
      .to(bgEl, { opacity: 0.95, duration: dur * 0.7, ease: 'power1.inOut' }, dur * 0.3)
      .to(el, { opacity: 0, duration: dur * 0.5, ease: 'power1.out' }, dur * 0.9);
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
  if (busy || id === active || state === 'opener') return;
  setHash(`#/${id}`);
  if (state === 'nav') await navToPage(id);
  else await pageSwap(id);
}

async function navToPage(id: SectionId) {
  busy = true;
  gsap.killTweensOf([...stampEls.values()]);
  const clicked = stampEls.get(id)!;
  const from = clicked.getBoundingClientRect();
  gsap.set([...stampEls.values()], { x: 0, y: 0, rotation: (_i: number, t: Element) => tilt[(t as HTMLElement).dataset.id as SectionId] });
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
  await bleedGrow(id, from);
  renderContent(id);
  showContent(true);
  done();
}

async function pageSwap(id: SectionId) {
  busy = true;
  const prev = active as SectionId;
  const slot = order.indexOf(id);
  const slotEl = stampEls.get(id)!;
  const from = slotEl.getBoundingClientRect();
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
  await bleedGrow(id, from);
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

function openerExit(): Promise<void> {
  return new Promise((resolve) => {
    const p = { disp: 0, blur: 0 };
    const apply = () => {
      dispEl.setAttribute('scale', String(p.disp));
      openerStamp.style.filter = `url(#bleed) blur(${p.blur}px)`;
    };
    const dur = T(1.6);
    gsap.timeline({ onComplete: () => { openerEl.hidden = true; dispEl.setAttribute('scale', '0'); resolve(); } })
      .to(openerStamp, { scale: reduce ? 1 : 5, duration: dur, ease: 'power3.in' }, 0)
      .to(p, { disp: reduce ? 0 : 60, blur: reduce ? 0 : 14, duration: dur, ease: 'power2.in', onUpdate: apply }, 0)
      .to(openerStamp, { opacity: 0, duration: dur * 0.5, ease: 'power1.in' }, dur * 0.55)
      .to(skipBtn, { opacity: 0, duration: 0.2 }, 0);
  });
}

async function runOpener() {
  if (openerDone) return;
  openerDone = true;
  clearTimeout(openerTimer);
  busy = true;
  await openerExit();
  try { sessionStorage.setItem('opener-seen', '1'); } catch { /* storage may be blocked */ }
  state = 'nav';
  stage.dataset.state = 'nav';
  layoutNav();
  fanIn();
  stampsEl.inert = false;
  await new Promise((r) => setTimeout(r, T(1.5) * 1000));
  done();
}
function startOpenerClock() {
  let left = 4000;
  let last = performance.now();
  const tick = () => {
    const now = performance.now();
    if (!document.hidden) left -= now - last; // pause while the tab is hidden
    last = now;
    if (openerDone) return;
    if (left <= 0) { runOpener(); return; }
    openerTimer = window.setTimeout(tick, 100);
  };
  tick();
}

/* ---------- routing ---------- */
function parseHash(): SectionId | null {
  const m = location.hash.match(/^#\/([a-z]+)$/);
  const id = m?.[1] as SectionId | undefined;
  return id && SECTIONS.some((s) => s.id === id) ? id : null;
}
function enterInstant(id: SectionId | null) {
  openerEl.hidden = true;
  openerDone = true;
  clearTimeout(openerTimer);
  try { sessionStorage.setItem('opener-seen', '1'); } catch { /* ignore */ }
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
const crosshair = `<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1"><circle cx="11" cy="11" r="8"/><path d="M11 0v22M0 11h22"/></svg>`;
const barcode = `<svg viewBox="0 0 40 22" fill="currentColor">${[0, 3, 5, 9, 11, 14, 18, 20, 24, 26, 30, 33, 36].map((x, i) => `<rect x="${x}" y="2" width="${i % 3 === 0 ? 2 : 1}" height="18"/>`).join('')}</svg>`;
const cancel = `<svg viewBox="0 0 64 22" fill="none" stroke="currentColor" stroke-width="1"><circle cx="11" cy="11" r="9"/><path d="M20 7h40M20 11h40M20 15h40"/></svg>`;
function buildFooter() {
  $('micro-l').innerHTML = crosshair + barcode;
  $('micro-r').innerHTML = cancel;
  $('email').textContent = SITE.email;
  ($('email') as HTMLAnchorElement).href = `mailto:${SITE.email}`;
  const clock = $<HTMLTimeElement>('clock');
  const fmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' /* visitor's local time */ });
  const tick = () => { const d = new Date(); clock.textContent = fmt.format(d); clock.dateTime = d.toISOString(); };
  tick();
  clockTimer = window.setInterval(tick, 15000);
}

/* ---------- replay ---------- */
function replayIntro() {
  if (busy || state === 'opener') return;
  enterInstant(null);
  history.replaceState(null, '', '#/');
  openerDone = false;
  state = 'opener';
  stage.dataset.state = 'opener';
  openerEl.hidden = false;
  gsap.set(openerStamp, { clearProps: 'all' });
  openerStamp.style.filter = '';
  gsap.set(skipBtn, { opacity: 1 });
  stampEls.forEach((el) => gsap.set(el, { opacity: 0 }));
  stampsEl.inert = true;
  startOpenerClock();
}

/* ---------- boot ---------- */
buildOpener();
buildStamps();
buildFooter();
homeBtn.textContent = '\u2302';
const replayBtn = document.getElementById('replay');
const onHome = () => goHome();
const onSkip = () => runOpener();
const onHash = () => {
  if (busy || state === 'opener') return; // done() re-syncs when a transition ends
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
skipBtn.addEventListener('click', onSkip);
replayBtn?.addEventListener('click', replayIntro);
window.addEventListener('hashchange', onHash);
window.addEventListener('resize', onResize);
document.addEventListener('keydown', onKey);

{
  const hashId = parseHash();
  let seen = false;
  try { seen = sessionStorage.getItem('opener-seen') === '1'; } catch { /* ignore */ }
  if (hashId) enterInstant(hashId);
  else if (seen) { enterInstant(null); fanIn(); }
  else { layoutNav(); stampEls.forEach((el) => gsap.set(el, { opacity: 0 })); stampsEl.inert = true; startOpenerClock(); }
}

return () => {
  clearTimeout(openerTimer);
  cancelAnimationFrame(resizeRaf);
  clearInterval(clockTimer);
  homeBtn.removeEventListener('click', onHome);
  skipBtn.removeEventListener('click', onSkip);
  replayBtn?.removeEventListener('click', replayIntro);
  window.removeEventListener('hashchange', onHash);
  window.removeEventListener('resize', onResize);
  document.removeEventListener('keydown', onKey);
  disposed = true;
  gsap.killTweensOf([...stampEls.values(), contentEl, bgEl, openerStamp, homeBtn, skipBtn]);
  stampsEl.replaceChildren();
  bleedLayer.replaceChildren();
  openerStamp.replaceChildren();
  document.title = 'Matthew Bloomfield';
};
}
