/**
 * Postmarks: every section you open gets cancelled, like real mail.
 * Open a section, come back, and its stamp lands a rubber-stamp postmark dated with your local day.
 * Saved per browser; purely decorative (aria-hidden, no pointer events).
 */
const KEY = 'postmarks.v1';
type Marks = Record<string, string>; // section id -> ISO date of first visit

const load = (): Marks => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } };
const save = (m: Marks) => { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* private mode: marks last for the visit */ } };

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const rot = (id: string) => { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 360; return (h % 21) - 10; };

function markSvg(iso: string, id: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const mon = MONTHS[d.getMonth()];
  const yr = d.getFullYear();
  const uid = `pm-${id}`;
  // Ring text on a circle path, a date block in the middle, and wavy cancellation lines running off to the right.
  return `<svg viewBox="0 0 220 110" aria-hidden="true" focusable="false">
    <defs><path id="${uid}" d="M 55,55 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"/></defs>
    <g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
      <circle cx="55" cy="55" r="48"/><circle cx="55" cy="55" r="27" stroke-width="1.4"/>
      <path d="M104 36c10-7 20 7 30 0s20 7 30 0 20 7 30 0"/>
      <path d="M104 52c10-7 20 7 30 0s20 7 30 0 20 7 30 0"/>
      <path d="M104 68c10-7 20 7 30 0s20 7 30 0 20 7 30 0"/>
    </g>
    <text font-family="var(--font-mono), monospace" font-size="10" font-weight="500" fill="currentColor"><textPath href="#${uid}" startOffset="0" textLength="226" lengthAdjust="spacing">MATTHEW BLOOMFIELD · VISITED ·</textPath></text>
    <text x="55" y="52" text-anchor="middle" font-family="var(--font-mono), monospace" font-size="15" font-weight="500" fill="currentColor">${day}</text>
    <text x="55" y="66" text-anchor="middle" font-family="var(--font-mono), monospace" font-size="9" letter-spacing="1" fill="currentColor">${mon} ${yr}</text>
  </svg>`;
}

export function initPostmarks(): () => void {
  const stage = document.getElementById('stage');
  const stamps = document.getElementById('stamps');
  if (!stage || !stamps) return () => {};
  const marks = load();
  const idFromHash = () => location.hash.match(/^#\/([a-z]+)$/)?.[1] || null;

  const apply = (fresh?: string) => {
    for (const el of Array.from(stamps.querySelectorAll<HTMLElement>('.stamp'))) {
      const id = el.dataset.id as string;
      const iso = marks[id];
      let pm = el.querySelector<HTMLElement>('.postmark');
      if (!iso) { pm?.remove(); continue; }
      if (!pm) {
        pm = document.createElement('span');
        pm.className = 'postmark';
        pm.setAttribute('aria-hidden', 'true');
        pm.style.setProperty('--pm-rot', `${rot(id) - 8}deg`);
        pm.innerHTML = markSvg(iso, id);
        el.appendChild(pm);
        if (id === fresh) { pm.classList.add('thump'); pm.addEventListener('animationend', () => pm?.classList.remove('thump'), { once: true }); }
      }
    }
  };

  let pending: string | null = null;
  const onHash = () => {
    const id = idFromHash();
    if (id && !marks[id]) { marks[id] = new Date().toISOString(); save(marks); pending = id; }
  };
  const obs = new MutationObserver(() => {
    if (stage.dataset.state === 'page') onHash(); // the engine uses pushState, which fires no hashchange
    if (stage.dataset.state === 'nav') { const f = pending || undefined; pending = null; window.setTimeout(() => apply(f), f ? 450 : 0); }
  });
  obs.observe(stage, { attributes: true, attributeFilter: ['data-state'] });
  window.addEventListener('hashchange', onHash);
  onHash();
  // Stamps are built by the engine after mount; wait a beat, then paint marks from earlier visits.
  const t = window.setTimeout(() => apply(), 400);
  return () => { obs.disconnect(); window.removeEventListener('hashchange', onHash); clearTimeout(t); };
}
