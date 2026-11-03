/**
 * Dev tool for trying type combos with the fonts installed on this computer.
 * Only appears when the URL has ?fonts (e.g. https://matthewsbloomfield.com/?fonts).
 * Uses the Local Font Access API (Chrome/Edge desktop); elsewhere you can still type a font name.
 */
const SLOTS = [
  { key: 'display', label: 'Headings', cssVar: '--serif', fallback: "Georgia, serif" },
  { key: 'body', label: 'Body', cssVar: '--body', fallback: "Georgia, serif" },
  { key: 'mono', label: 'Labels', cssVar: '--mono', fallback: "ui-monospace, Menlo, monospace" },
] as const;
const STORE = 'fontSwitcher.v1';

export function initFontSwitcher(): () => void {
  if (!new URLSearchParams(location.search).has('fonts')) return () => {};
  const root = document.documentElement;
  let families: string[] = [];
  let saved: Record<string, string> = {};
  try { saved = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch { /* ignore */ }

  const panel = document.createElement('aside');
  panel.className = 'fontsw';
  panel.setAttribute('aria-label', 'Font switcher');
  const dl = document.createElement('datalist');
  dl.id = 'fontsw-list';
  const inputs: Record<string, HTMLInputElement> = {};

  const apply = (slot: (typeof SLOTS)[number], family: string) => {
    if (family) root.style.setProperty(slot.cssVar, `"${family.replace(/"/g, '')}", ${slot.fallback}`);
    else root.style.removeProperty(slot.cssVar);
    saved[slot.key] = family;
    try { localStorage.setItem(STORE, JSON.stringify(saved)); } catch { /* ignore */ }
  };

  const head = document.createElement('button');
  head.type = 'button'; head.className = 'fontsw-head'; head.textContent = 'Fonts'; head.setAttribute('aria-expanded', 'false');
  const body = document.createElement('div');
  body.className = 'fontsw-body';
  head.addEventListener('click', () => head.setAttribute('aria-expanded', String(panel.classList.toggle('open'))));

  for (const slot of SLOTS) {
    const row = document.createElement('div');
    row.className = 'fontsw-row';
    const lab = document.createElement('label');
    lab.textContent = slot.label;
    const inp = document.createElement('input');
    inp.setAttribute('list', 'fontsw-list');
    inp.placeholder = 'default';
    inp.value = saved[slot.key] || '';
    inp.autocomplete = 'off';
    inp.spellcheck = false;
    inputs[slot.key] = inp;
    lab.appendChild(inp);
    const step = (dir: number) => {
      if (!families.length) return;
      const i = families.indexOf(inp.value);
      inp.value = families[(i + dir + families.length) % families.length];
      apply(slot, inp.value);
    };
    const prev = document.createElement('button'); prev.type = 'button'; prev.textContent = '‹'; prev.setAttribute('aria-label', `Previous ${slot.label} font`);
    const next = document.createElement('button'); next.type = 'button'; next.textContent = '›'; next.setAttribute('aria-label', `Next ${slot.label} font`);
    prev.addEventListener('click', () => step(-1));
    next.addEventListener('click', () => step(1));
    inp.addEventListener('change', () => apply(slot, inp.value.trim()));
    inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') apply(slot, inp.value.trim()); });
    row.append(lab, prev, next);
    body.appendChild(row);
    if (saved[slot.key]) apply(slot, saved[slot.key]);
  }

  const status = document.createElement('p');
  status.className = 'fontsw-status';
  const load = document.createElement('button');
  load.type = 'button'; load.className = 'fontsw-load'; load.textContent = 'Load my installed fonts';
  const q = (window as unknown as { queryLocalFonts?: () => Promise<{ family: string }[]> }).queryLocalFonts;
  if (!q) {
    load.hidden = true;
    status.textContent = 'Listing installed fonts needs Chrome or Edge on desktop. You can still type a font name.';
  }
  load.addEventListener('click', async () => {
    try {
      status.textContent = 'Reading fonts…';
      const list = await q!.call(window);
      families = [...new Set(list.map((f) => f.family))].sort((a, b) => a.localeCompare(b));
      dl.replaceChildren(...families.map((f) => { const o = document.createElement('option'); o.value = f; return o; }));
      status.textContent = `${families.length} fonts. Type to search, or use ‹ › to flip through.`;
      load.hidden = true;
    } catch {
      status.textContent = 'Permission was blocked. Allow "Fonts" in the site settings and try again.';
    }
  });
  const reset = document.createElement('button');
  reset.type = 'button'; reset.className = 'fontsw-reset'; reset.textContent = 'Reset to defaults';
  reset.addEventListener('click', () => { for (const s of SLOTS) { inputs[s.key].value = ''; apply(s, ''); } });

  body.append(load, status, reset);
  panel.append(head, body, dl);
  document.body.appendChild(panel);
  return () => {
    panel.remove();
    for (const s of SLOTS) root.style.removeProperty(s.cssVar);
  };
}
