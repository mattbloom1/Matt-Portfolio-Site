import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { SITE, buildSections, type Section, type SectionId, type SiteContent } from './content';

gsap.registerPlugin(Flip);

export function initPortfolio(content: SiteContent): () => void {
const HOME_TITLE = `${SITE.name} · ${SITE.role}`;
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
  const { id, slug } = parseRoute();
  if (id !== active) enterInstant(id, slug);
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
const imgSmall = (id: SectionId) => `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/stamps/${id}-600.webp`;
/* ---------- close button (home): a hand-drawn-style X, matching the footer tool icons ---------- */
function mountLogo() {
  homeBtn.innerHTML = '<svg class="x-icon" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>';
  homeBtn.setAttribute('aria-label', 'Close');
  logoCleanup = () => {};
}
let logoCleanup = () => {};

/* ---------- stamps ---------- */
const stampEls = new Map<SectionId, HTMLButtonElement>();
const tilt: Record<SectionId, number> = { projects: -4, posters: 2, experience: 3, about: -2, crafts: 4, photography: -3 };

interface NavSpot { x: number; y: number; w: number }
const navDesktop: Record<SectionId, NavSpot> = {
  projects: { x: 0.2, y: 0.32, w: 0.21 },
  posters: { x: 0.5, y: 0.27, w: 0.21 },
  experience: { x: 0.8, y: 0.34, w: 0.21 },
  crafts: { x: 0.22, y: 0.7, w: 0.21 },
  photography: { x: 0.5, y: 0.72, w: 0.21 },
  about: { x: 0.79, y: 0.68, w: 0.21 },
};
const navMobile: Record<SectionId, NavSpot> = {
  projects: { x: 0.25, y: 0.2, w: 0.4 },
  posters: { x: 0.75, y: 0.17, w: 0.4 },
  experience: { x: 0.25, y: 0.49, w: 0.4 },
  crafts: { x: 0.75, y: 0.52, w: 0.4 },
  photography: { x: 0.25, y: 0.8, w: 0.4 },
  about: { x: 0.75, y: 0.83, w: 0.4 },
};
/* Phones: a slight random tilt for each stamp (2 to 5 degrees, either way), fresh on every load. */
if (window.innerWidth < 640) for (const id of Object.keys(tilt) as SectionId[]) tilt[id] = (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 3);

function buildStamps() {
  for (const s of SECTIONS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'stamp';
    b.dataset.id = s.id;
    b.setAttribute('aria-label', s.label);
    b.innerHTML = `<img src="${img(s.id)}" srcset="${imgSmall(s.id)} 600w, ${img(s.id)} 1000w" sizes="(max-width: 640px) 45vw, 24vw" alt="${s.alt}" width="${s.ratio >= 1 ? 1000 : 682}" height="${s.ratio >= 1 ? 682 : 1000}" draggable="false" /><span class="tag">${s.label}</span>`;
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

/* Where the visitor has dragged each home-page stamp, as fractions of the stage so it survives resizes. */
const POS_KEY = 'stampPositions.v1';
/* Phones and tablets: stamps spring back to their spot on release and nothing is saved. */
const isTouchDevice = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
const moved: Partial<Record<SectionId, { fx: number; fy: number }>> = (() => {
  if (isTouchDevice()) return {};
  try { return JSON.parse(localStorage.getItem(POS_KEY) || '{}'); } catch { return {}; }
})();
const savePositions = () => { try { localStorage.setItem(POS_KEY, JSON.stringify(moved)); } catch { /* private mode: positions last for the visit only */ } };
/** Keep a (dragged) home stamp fully inside the stage, whatever the viewport or the saved position. */
function clampOffset(id: SectionId, x: number, y: number) {
  const sp = (isMobile() ? navMobile : navDesktop)[id];
  const W = stage.clientWidth, H = stage.clientHeight;
  const { w, h } = sizeOf(id, sp.w * W);
  const pad = 10;
  const left = sp.x * W - w / 2, top = sp.y * H - h / 2;
  const cl = (v: number, lo: number, hi: number) => (lo > hi ? (lo + hi) / 2 : Math.max(lo, Math.min(hi, v)));
  return { x: cl(x, pad - left, W - pad - (left + w)), y: cl(y, pad - top, H - pad - (top + h)) };
}
const offsetOf = (id: SectionId) => clampOffset(id, (moved[id]?.fx || 0) * stage.clientWidth, (moved[id]?.fy || 0) * stage.clientHeight);
function enableDrag(el: HTMLButtonElement, id: SectionId) {
  let pid = -1, sx = 0, sy = 0, ox = 0, oy = 0, drag = false, vx = 0, vy = 0, touch = false;
  el.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || busy || pid !== -1) return;
    touch = e.pointerType === 'touch' || isTouchDevice();
    pid = e.pointerId; sx = e.clientX; sy = e.clientY; drag = false; vx = 0; vy = 0;
    ox = Number(gsap.getProperty(el, 'x')) || 0; oy = Number(gsap.getProperty(el, 'y')) || 0;
  });
  el.addEventListener('pointermove', (e) => {
    if (e.pointerId !== pid) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (!drag) {
      if (Math.hypot(dx, dy) < 6) return;
      drag = true; dragging = true;
      el.setPointerCapture(pid);
      el.classList.add('held');
      gsap.killTweensOf(el);
      gsap.to(el, { scale: 1.08, duration: 0.2, ease: 'power2.out', overwrite: 'auto' });
    }
    vx = vx * 0.6 + e.movementX * 0.4; vy = vy * 0.6 + e.movementY * 0.4;
    gsap.set(el, { x: ox + dx, y: oy + dy, rotation: restRotation(id) + Math.max(-8, Math.min(8, e.movementX * 0.6)) });
  });
  const end = (e: PointerEvent) => {
    if (e.pointerId !== pid) return;
    pid = -1;
    if (!drag) return;
    dragging = false;
    justDragged = true;
    setTimeout(() => { justDragged = false; }, 0);
    el.classList.remove('held');
    if (state !== 'nav' || touch) {
      gsap.to(el, { x: 0, y: 0, scale: 1, rotation: restRotation(id), duration: reduce ? 0.2 : 0.8, ease: reduce ? 'power2.out' : 'elastic.out(1, 0.55)', overwrite: 'auto' });
      return;
    }
    // Home page: the stamp stays where it is dropped, with a little throw and an elastic settle.
    const W = stage.clientWidth, H = stage.clientHeight;
    const cap = (v: number) => Math.max(-26, Math.min(26, v * 4));
    let x = Number(gsap.getProperty(el, 'x')) + (reduce ? 0 : cap(vx));
    let y = Number(gsap.getProperty(el, 'y')) + (reduce ? 0 : cap(vy));
    // keep the whole stamp on screen, so it can never be lost or clipped
    ({ x, y } = clampOffset(id, x, y));
    moved[id] = { fx: x / W, fy: y / H };
    savePositions();
    gsap.to(el, { x, y, scale: 1, rotation: restRotation(id), duration: reduce ? 0.2 : 0.9, ease: reduce ? 'power2.out' : 'elastic.out(1, 0.5)', overwrite: 'auto' });
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
  const o = offsetOf(id);
  gsap.to(el, { x: o.x - dx * 0.12 * k, y: o.y - dy * 0.12 * k - 4, rotation: tilt[id] + dx * 0.03, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
}
function unnudge(el: HTMLElement, id: SectionId) {
  if (state !== 'nav' || busy) return;
  const o = offsetOf(id);
  gsap.to(el, { x: o.x, y: o.y, rotation: tilt[id], duration: 0.6, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
}

function sizeOf(id: SectionId, w: number) {
  return { w, h: w / byId(id).ratio };
}

function placeNav(id: SectionId) {
  const spots = isMobile() ? navMobile : navDesktop;
  const sp = spots[id];
  const W = stage.clientWidth, H = stage.clientHeight;
  const { w, h } = sizeOf(id, sp.w * W);
  gsap.set(stampEls.get(id)!, { left: sp.x * W - w / 2, top: sp.y * H - h / 2, width: w, rotation: tilt[id], x: offsetOf(id).x, y: offsetOf(id).y, opacity: 1, scale: 1 });
  gsap.set(stampEls.get(id)!.querySelector('img'), { opacity: 1 });
}
/** Label font size (px) and the width a slot needs so neighbouring labels never collide. */
const labelPx = () => (isMobile() ? 10 : 12);
const measuredLabel = (id: SectionId) => stampEls.get(id)?.querySelector<HTMLElement>('.tag')?.offsetWidth || 0;
function miniSlots() {
  const mob = isMobile();
  const gap = mob ? (stage.clientWidth < 360 ? 3 : 6) : 20;
  const build = (hgt: number) => {
    const slots = order.map((id) => {
      const sw = hgt * byId(id).ratio;
      const lw = measuredLabel(id) || byId(id).label.length * labelPx() * 0.78; // real rendered width when available
      return { id, sw, w: Math.max(sw, lw) };
    });
    return { slots, total: slots.reduce((t, x) => t + x.w, 0) + gap * (slots.length - 1) };
  };
  let hgt = mob ? 46 : 62;
  let { slots, total } = build(hgt);
  // shrink the stamps on narrow screens until the whole row fits
  for (let i = 0; i < 12 && total > stage.clientWidth - 16 && hgt > 24; i++) { hgt -= 3; ({ slots, total } = build(hgt)); }
  let left = Math.max(8, (stage.clientWidth - total) / 2);
  return slots.map((x) => { const o = { ...x, left: left + (x.w - x.sw) / 2 }; left += x.w + gap; return o; });
}
function placeMini(id: SectionId, slot: number) {
  if (isSplit()) {
    // One column down the left of the dark panel, all six stamps in fixed slots, above the heading.
    const cw = colWidth(), H = stage.clientHeight;
    const pad = Math.min(44, Math.max(24, stage.clientWidth * 0.03));
    const top = 48, bottom = 210, label = 14;
    const slotH = Math.max(70, (H - top - bottom) / order.length);
    const r = byId(id).ratio;
    const w = Math.min((cw - pad * 2) * 0.55, (slotH - label) * r);
    const h = w / r;
    gsap.set(stampEls.get(id)!, { left: pad, top: top + slot * slotH + (slotH - label - h) / 2, width: w, rotation: 0, x: 0, y: 0, scale: 1 });
    return;
  }
  const sp = miniSlots()[slot];
  gsap.set(stampEls.get(id)!, { left: sp.left, top: isMobile() ? 14 : 18, width: sp.sw, rotation: 0, x: 0, y: 0, opacity: 1, scale: 1 });
}
function layoutNav() { SECTIONS.forEach((s) => placeNav(s.id)); stampsEl.dataset.mode = 'nav'; }
function layoutMini() {
  stampsEl.dataset.mode = 'mini';
  order.forEach((id, i) => placeMini(id, i));
  stampEls.forEach((el, id) => {
    el.removeAttribute('tabindex');
    gsap.set(el, { opacity: 1, pointerEvents: 'auto' });
    gsap.set(el.querySelector('img'), { opacity: id === active ? 1 : 0.6 });
    if (id === active) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
  });
}

function swapBackground(id: SectionId) {
  bgEl.style.backgroundImage = `url(${imgSmall(id)})`; // blurred backdrop: the small file is plenty
}

/* ---------- content ---------- */
function renderContent(id: SectionId) {
  const s = byId(id);
  contentEl.hidden = false;
  contentEl.innerHTML = `<div class="panel"><header class="panel-head"><div class="no">${s.stampName}</div><h1 tabindex="-1">${s.label}</h1></header><div class="panel-body">${s.html}</div></div>`;
  contentEl.scrollTop = 0;
  document.title = `${s.label} · ${SITE.name}`;
  stopFilmStrip();
  if (id === 'photography') startFilmStrip();
}
/* ---------- photography film strip: highlights the roll in view, advances the film as you scroll, jumps to a roll on tap ---------- */
let stopStrip: (() => void) | null = null;
function stopFilmStrip() { stopStrip?.(); stopStrip = null; }
function startFilmStrip() {
  const strip = contentEl.querySelector<HTMLElement>('.filmstrip');
  if (!strip) return;
  const track = strip.querySelector<HTMLElement>('.fs-track')!;
  const frames = [...strip.querySelectorAll<HTMLAnchorElement>('.fs-frame')];
  const rolls = frames.map((f) => contentEl.querySelector<HTMLElement>('#' + f.dataset.roll));
  let cur = -1, raf = 0, last = contentEl.scrollTop, lock = -1;
  const timers: number[] = [];
  const unlock = () => { lock = -1; timers.splice(0).forEach(clearTimeout); };
  const center = (i: number, smooth: boolean) => {
    const f = frames[i];
    if (!f || track.scrollWidth <= track.clientWidth) return;
    track.scrollTo({ left: f.offsetLeft - (track.clientWidth - f.offsetWidth) / 2, behavior: smooth && !reduce ? 'smooth' : 'auto' });
  };
  const set = (i: number, smooth = true) => {
    if (i === cur) return;
    cur = i;
    frames.forEach((f, k) => { if (k === i) f.setAttribute('aria-current', 'true'); else f.removeAttribute('aria-current'); });
    center(i, smooth);
  };
  const update = () => {
    raf = 0;
    const top = contentEl.getBoundingClientRect().top;
    const line = top + contentEl.clientHeight * 0.4;
    let i = 0;
    rolls.forEach((r, k) => { if (r && r.getBoundingClientRect().top <= line) i = k; });
    // At the very bottom the last roll wins even if it is short.
    if (contentEl.scrollTop + contentEl.clientHeight >= contentEl.scrollHeight - 4) i = rolls.length - 1;
    if (lock >= 0) i = lock;
    set(i);
    // Film advance: the sprocket holes crawl along with the scroll, and the strip leans slightly in the direction of travel.
    const y = contentEl.scrollTop;
    strip.style.setProperty('--adv', `${(-y * 0.6).toFixed(1)}px`);
    strip.dataset.dir = y > last + 1 ? 'down' : y < last - 1 ? 'up' : strip.dataset.dir || '';
    last = y;
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
  const onClick = (e: Event) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('.fs-frame');
    if (!a) return;
    e.preventDefault();
    const i = frames.indexOf(a);
    set(i);
    strip.classList.remove('click');
    void strip.offsetWidth;
    strip.classList.add('click');
    // Lazy images above the target change its position as they load, so jump, then re-align a few times unless the reader takes over.
    unlock();
    lock = i;
    const go = () => rolls[i]?.scrollIntoView({ behavior: 'auto', block: 'start' });
    go();
    [250, 700, 1500].forEach((ms) => timers.push(window.setTimeout(go, ms)));
    timers.push(window.setTimeout(unlock, 1600));
    rolls[i]?.querySelector<HTMLElement>('h2')?.setAttribute('tabindex', '-1');
    rolls[i]?.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
  };
  const takeOver = () => unlock();
  contentEl.addEventListener('wheel', takeOver, { passive: true });
  contentEl.addEventListener('touchstart', takeOver, { passive: true });
  contentEl.addEventListener('keydown', takeOver);
  contentEl.addEventListener('scroll', onScroll, { passive: true });
  strip.addEventListener('click', onClick);
  window.addEventListener('resize', onScroll);
  update();
  center(Math.max(cur, 0), false);
  stopStrip = () => {
    unlock();
    contentEl.removeEventListener('wheel', takeOver);
    contentEl.removeEventListener('touchstart', takeOver);
    contentEl.removeEventListener('keydown', takeOver);
    contentEl.removeEventListener('scroll', onScroll);
    strip.removeEventListener('click', onClick);
    window.removeEventListener('resize', onScroll);
    if (raf) cancelAnimationFrame(raf);
  };
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
  gsap.set([...stampEls.values()], { x: (_i: number, t: Element) => offsetOf((t as HTMLElement).dataset.id as SectionId).x, y: (_i: number, t: Element) => offsetOf((t as HTMLElement).dataset.id as SectionId).y, rotation: (_i: number, t: Element) => tilt[(t as HTMLElement).dataset.id as SectionId] });
  active = id;
  order = SECTIONS.map((s) => s.id); // all six stamps stay, in fixed slots
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
  gsap.to(stampEls.get(prev)!.querySelector('img'), { opacity: 0.6, duration: T(0.3) });
  gsap.to(stampEls.get(id)!.querySelector('img'), { opacity: 1, duration: T(0.3) });
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
  gsap.to(contentEl, { opacity: 0, duration: T(0.25), onComplete: () => { contentEl.hidden = true; stopFilmStrip(); } });
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
  document.title = HOME_TITLE;
  setHash('#/');
  if (!replay) { /* reserved */ }
  await new Promise((r) => setTimeout(r, T(1) * 1000));
  done();
}

/* ---------- entrances ---------- */
function fanIn() {
  const W = stage.clientWidth;
  if (!reduce) {
    gsap.set([...stampEls.values()], { pointerEvents: 'none' });
    gsap.delayedCall(T(1.4) + SECTIONS.length * 0.08 + 0.05, () => { if (!disposed && state === 'nav') gsap.set([...stampEls.values()], { pointerEvents: 'auto' }); });
  }
  SECTIONS.forEach((s, i) => {
    const el = stampEls.get(s.id)!;
    const side = i % 2 === 0 ? -1 : 1;
    if (reduce) { gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.2 }); return; }
    gsap.fromTo(el,
      { x: side * W * 0.9, y: gsap.utils.random(-120, 120), rotation: tilt[s.id] + side * gsap.utils.random(25, 60), opacity: 0 },
      { x: offsetOf(s.id).x, y: offsetOf(s.id).y, rotation: tilt[s.id], opacity: 1, duration: T(1.4), delay: i * 0.08 * (reduce ? 0 : 1), ease: 'power3.out', overwrite: 'auto' });
  });
}

/* ---------- routing ---------- */
/** #/projects, or #/projects/gearbook for one open project. */
function parseRoute(): { id: SectionId | null; slug: string | null } {
  const m = location.hash.match(/^#\/([a-z]+)(?:\/([a-z0-9-]+))?\/?$/);
  const id = m?.[1] as SectionId | undefined;
  return id && SECTIONS.some((s) => s.id === id) ? { id, slug: m![2] || null } : { id: null, slug: null };
}
const parseHash = () => parseRoute().id;
function enterInstant(id: SectionId | null, slug: string | null = null) {
  delete stage.dataset.detailOpen; // a leftover open project would keep the stamps hidden (blank page)
  contentEl.querySelectorAll<HTMLElement>('.detail').forEach((d) => { d.hidden = true; });
  setModal(false);
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
    gsap.set(bgEl, { opacity: 0 });
    renderContent(id);
    gsap.set(contentEl, { opacity: 1, y: 0 });
    if (slug) syncDetail(slug);
  } else {
    state = 'nav';
    active = null;
    stage.dataset.state = 'nav';
    layoutNav();
    gsap.set(bgEl, { opacity: 0 });
    contentEl.hidden = true;
    stopFilmStrip();
    homeBtn.hidden = true;
    document.title = HOME_TITLE;
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
  const { id, slug } = parseRoute();
  if (location.hash && !id) history.replaceState(null, '', '#/');
  if (id === active) { if (id) syncDetail(slug); return; }
  enterInstant(id, slug);
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
const footerEl = document.querySelector<HTMLElement>('.footer');
/** While a project is open everything behind it is inert: Tab stays inside the dialog and screen readers skip the page. */
function setModal(on: boolean) {
  const behind: (HTMLElement | null)[] = [stampsEl, homeBtn, footerEl, ...contentEl.querySelectorAll<HTMLElement>('.panel-head, .panel-body > :not(.detail)')];
  behind.forEach((e) => { if (e) e.inert = on; });
}
const sectionTitle = () => (active ? `${byId(active).label} · ${SITE.name}` : HOME_TITLE);
const detailHash = (d: HTMLElement) => `#/${active}/${d.id.slice(2)}`;
const hideDetail = () => {
  const d = openDetail();
  if (!d) return false;
  d.hidden = true;
  setModal(false);
  delete stage.dataset.detailOpen;
  document.title = sectionTitle();
  const opener = contentEl.querySelector<HTMLElement>(`[data-detail="${d.id}"]`);
  opener?.focus({ preventScroll: true });
  return true;
};
const showDetail = (d: HTMLElement) => {
  gsap.set(contentEl, { clearProps: 'transform' });
  d.hidden = false;
  setModal(true);
  stage.dataset.detailOpen = '1';
  document.title = `${d.getAttribute('aria-label')} · ${sectionTitle()}`;
  d.scrollTop = 0;
  gsap.fromTo(d, { opacity: 0 }, { opacity: 1, duration: T(0.35) });
  d.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
};
/** Make the open project match a URL slug (null = none). */
function syncDetail(slug: string | null) {
  const cur = openDetail();
  const d = slug ? contentEl.querySelector<HTMLElement>(`#${CSS.escape('d-' + slug)}`) : null;
  if (d === cur) return;
  if (cur) hideDetail();
  if (d) showDetail(d);
}
// Each open project is its own history entry and its own URL (#/projects/gearbook), so back closes it and it can be shared.
const closeDetail = () => {
  if (!openDetail()) return false;
  if (history.state && history.state.detail) history.back();
  else { hideDetail(); if (active) history.replaceState(null, '', `#/${active}`); }
  return true;
};
const onPop = () => {
  if (state !== 'page' || busy) return;
  const r = parseRoute();
  if (r.id === active) syncDetail(r.slug);
};
const onContentClick = (e: MouseEvent) => {
  const t = e.target as HTMLElement;
  const card = t.closest<HTMLElement>('[data-detail]');
  if (card) {
    const d = contentEl.querySelector<HTMLElement>(`#${CSS.escape(card.dataset.detail!)}`);
    if (d) { history.pushState({ detail: d.id }, '', detailHash(d)); showDetail(d); }
    return;
  }
  const step = t.closest<HTMLElement>('[data-step]');
  if (step) {
    const d = contentEl.querySelector<HTMLElement>(`#${CSS.escape(step.dataset.step!)}`);
    // replace (not push) the history entry so back still closes the project
    if (d) { history.replaceState({ detail: d.id }, '', detailHash(d)); hideDetail(); showDetail(d); }
    return;
  }
  if (t.closest('[data-close]') || t.classList.contains('detail')) closeDetail();
};
const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && state === 'page' && !closeDetail()) goHome(); };
const onImgDone = (e: Event) => { if (e.target instanceof HTMLImageElement) e.target.closest('.gimg, .card-img')?.classList.add('ld'); };
contentEl.addEventListener('load', onImgDone, true);
contentEl.addEventListener('error', onImgDone, true);
contentEl.addEventListener('click', onContentClick);
homeBtn.addEventListener('click', onHome);
window.addEventListener('hashchange', onHash);
window.addEventListener('popstate', onPop);
window.addEventListener('resize', onResize);
document.addEventListener('keydown', onKey);

{
  const route = parseRoute();
  if (route.id) enterInstant(route.id, route.slug);
  else { enterInstant(null); fanIn(); }
}

return () => {
  cancelAnimationFrame(resizeRaf);
  clearInterval(clockTimer);
  homeBtn.removeEventListener('click', onHome);
  window.removeEventListener('hashchange', onHash);
  window.removeEventListener('popstate', onPop);
  window.removeEventListener('resize', onResize);
  document.removeEventListener('keydown', onKey);
  contentEl.removeEventListener('click', onContentClick);
  contentEl.removeEventListener('load', onImgDone, true);
  contentEl.removeEventListener('error', onImgDone, true);
  disposed = true;
  dragging = false; justDragged = false;
  logoCleanup();
  gsap.killTweensOf([...stampEls.values(), contentEl, bgEl, homeBtn]);
  stampsEl.replaceChildren();
  bleedLayer.replaceChildren();
  document.title = HOME_TITLE;
};
}
