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
const TSTORE = 'fontSwitcher.tweaks.v1';

type Tweak =
  | { key: string; label: string; group: string; type: 'range'; min: number; max: number; step: number; def: number; unit?: string }
  | { key: string; label: string; group: string; type: 'color'; def: string; cssVar: string }
  | { key: string; label: string; group: string; type: 'select'; def: string; options: string[] };

const TWEAKS: Tweak[] = [
  { key: 'scale', group: 'Type', label: 'Type scale', type: 'range', min: 0.7, max: 1.5, step: 0.01, def: 1, unit: 'x' },
  { key: 'headWeight', group: 'Type', label: 'Heading weight', type: 'range', min: 100, max: 900, step: 50, def: 500 },
  { key: 'bodyWeight', group: 'Type', label: 'Body weight', type: 'range', min: 100, max: 900, step: 50, def: 400 },
  { key: 'leading', group: 'Type', label: 'Body line height', type: 'range', min: 1.1, max: 2, step: 0.05, def: 1.5 },
  { key: 'headLeading', group: 'Type', label: 'Heading line height', type: 'range', min: 0.8, max: 1.5, step: 0.02, def: 1.05 },
  { key: 'headTrack', group: 'Type', label: 'Heading letter spacing', type: 'range', min: -0.06, max: 0.2, step: 0.005, def: 0, unit: 'em' },
  { key: 'labelTrack', group: 'Type', label: 'Label letter spacing', type: 'range', min: 0, max: 0.4, step: 0.01, def: 0.14, unit: 'em' },
  { key: 'labelCase', group: 'Type', label: 'Label case', type: 'select', def: 'uppercase', options: ['uppercase', 'none', 'lowercase', 'capitalize'] },
  { key: 'paper', group: 'Color', label: 'Paper', type: 'color', def: '#ece9e2', cssVar: '--paper' },
  { key: 'ink', group: 'Color', label: 'Ink', type: 'color', def: '#141414', cssVar: '--ink' },
  { key: 'ochre', group: 'Color', label: 'Ochre', type: 'color', def: '#c4b268', cssVar: '--ochre' },
  { key: 'rose', group: 'Color', label: 'Rose', type: 'color', def: '#c9a0a0', cssVar: '--rose' },
  { key: 'sky', group: 'Color', label: 'Sky', type: 'color', def: '#8fb3c9', cssVar: '--sky' },
  { key: 'green', group: 'Color', label: 'Green', type: 'color', def: '#7fbf7a', cssVar: '--green' },
  { key: 'sage', group: 'Color', label: 'Sage', type: 'color', def: '#a9c0bf', cssVar: '--sage' },
  { key: 'grainOn', group: 'Grain', label: 'Grain', type: 'select', def: 'on', options: ['on', 'off'] },
  { key: 'grainOpacity', group: 'Grain', label: 'Grain strength', type: 'range', min: 0, max: 1, step: 0.01, def: 0.22 },
  { key: 'grainSize', group: 'Grain', label: 'Grain size', type: 'range', min: 0.3, max: 4, step: 0.1, def: 1, unit: 'x' },
  { key: 'grainBlend', group: 'Grain', label: 'Grain blend', type: 'select', def: 'multiply', options: ['multiply', 'normal', 'overlay', 'soft-light', 'screen', 'difference'] },
  { key: 'grainContrast', group: 'Grain', label: 'Grain contrast', type: 'range', min: 0.5, max: 3, step: 0.05, def: 1 },
  { key: 'grainBright', group: 'Grain', label: 'Grain brightness', type: 'range', min: 0.3, max: 2, step: 0.05, def: 1 },
  { key: 'bgBlur', group: 'Background', label: 'Background blur', type: 'range', min: 0, max: 120, step: 1, def: 46, unit: 'px' },
  { key: 'bgSat', group: 'Background', label: 'Background saturation', type: 'range', min: 0, max: 2.5, step: 0.05, def: 1.05 },
  { key: 'rowH', group: 'Layout', label: 'Header row height', type: 'range', min: 60, max: 180, step: 2, def: 112, unit: 'px' },
  { key: 'footH', group: 'Layout', label: 'Footer height', type: 'range', min: 32, max: 100, step: 2, def: 46, unit: 'px' },
  { key: 'radius', group: 'Layout', label: 'Corner radius', type: 'range', min: 0, max: 40, step: 1, def: 0, unit: 'px' },
  { key: 'border', group: 'Layout', label: 'Line thickness', type: 'range', min: 0, max: 4, step: 0.5, def: 1, unit: 'px' },
  { key: 'motion', group: 'Layout', label: 'Transition speed', type: 'range', min: 0, max: 3, step: 0.1, def: 1, unit: 'x' },
];

function tweakCss(v: Record<string, string | number>): string {
  const n = (k: string) => Number(v[k]);
  const out: string[] = [];
  out.push(`:root{--row-h:${n('rowH')}px;--footer-h:${n('footH')}px}`);
  out.push(`body{line-height:${n('leading')};font-weight:${n('bodyWeight')}}`);
  out.push(`.panel,.detail{zoom:${n('scale')}}`);
  out.push(`h1,h2,h3,.lead,.series,.card-name,.opener-stamp text{font-weight:${n('headWeight')}!important;letter-spacing:${n('headTrack')}em!important}`);
  out.push(`.panel h1,.detail-text h2{line-height:${n('headLeading')}!important}`);
  out.push(`.meta,.no,.card-sub,.skip,.group,.more summary,.shot figcaption,.stamp .tag,.detail-close,.todo{letter-spacing:${n('labelTrack')}em!important;text-transform:${v.labelCase}!important}`);
  out.push(`.grain{display:${v.grainOn === 'off' ? 'none' : 'block'};opacity:${n('grainOpacity')};mix-blend-mode:${v.grainBlend};background-size:${220 * n('grainSize')}px;filter:contrast(${n('grainContrast')}) brightness(${n('grainBright')})}`);
  out.push(`.bg{filter:blur(${n('bgBlur')}px) saturate(${n('bgSat')})!important}`);
  out.push(`.home,.detail-close,.skip,.card,.timeline{border-radius:${n('radius')}px}`);
  out.push(`.group,.panel h1,.timeline{border-width:${n('border')}px}`);
  const m = n('motion');
  out.push(m === 1 ? '' : m === 0 ? '*{transition-duration:0s!important;animation-duration:0s!important}' : `*{transition-duration:${0.25 / m}s!important}`);
  return out.join('\n');
}

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
  head.type = 'button'; head.className = 'fontsw-head'; head.textContent = 'Design'; head.setAttribute('aria-expanded', 'false');
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

  // ---- design tweaks ----
  let tw: Record<string, string | number> = {};
  try { tw = JSON.parse(localStorage.getItem(TSTORE) || '{}') || {}; } catch { /* ignore */ }
  const vals: Record<string, string | number> = {};
  for (const t of TWEAKS) vals[t.key] = tw[t.key] ?? t.def;
  const style = document.createElement('style');
  style.id = 'fontsw-tweaks';
  document.head.appendChild(style);
  const refresh = () => {
    style.textContent = tweakCss(vals);
    for (const t of TWEAKS) if (t.type === 'color') root.style.setProperty(t.cssVar, String(vals[t.key]));
    try { localStorage.setItem(TSTORE, JSON.stringify(vals)); } catch { /* ignore */ }
  };
  const widgets: Record<string, { set: (x: string | number) => void }> = {};
  let lastGroup = '';
  for (const t of TWEAKS) {
    if (t.group !== lastGroup) {
      const h = document.createElement('h4'); h.className = 'fontsw-group'; h.textContent = t.group; body.appendChild(h); lastGroup = t.group;
    }
    const row = document.createElement('label'); row.className = 'fontsw-tw';
    const name = document.createElement('span'); name.textContent = t.label;
    const readout = document.createElement('output');
    let input: HTMLInputElement | HTMLSelectElement;
    if (t.type === 'select') {
      const sel = document.createElement('select');
      for (const o of t.options) { const op = document.createElement('option'); op.value = o; op.textContent = o; sel.appendChild(op); }
      input = sel;
    } else {
      const inp = document.createElement('input'); inp.type = t.type;
      if (t.type === 'range') { inp.min = String(t.min); inp.max = String(t.max); inp.step = String(t.step); }
      input = inp;
    }
    const show = () => { readout.textContent = t.type === 'range' ? `${vals[t.key]}${t.unit ?? ''}` : t.type === 'color' ? String(vals[t.key]) : ''; };
    input.value = String(vals[t.key]); show();
    input.addEventListener('input', () => { vals[t.key] = t.type === 'range' ? Number(input.value) : input.value; show(); refresh(); });
    input.addEventListener('keydown', (e) => e.stopPropagation());
    widgets[t.key] = { set: (x) => { vals[t.key] = x; input.value = String(x); show(); } };
    row.append(name, readout, input);
    body.appendChild(row);
  }
  refresh();
  const resetAll = document.createElement('button');
  resetAll.type = 'button'; resetAll.className = 'fontsw-reset'; resetAll.textContent = 'Reset all tweaks';
  resetAll.addEventListener('click', () => { for (const t of TWEAKS) widgets[t.key].set(t.def); for (const t of TWEAKS) if (t.type === 'color') root.style.removeProperty(t.cssVar); refresh(); });
  const copy = document.createElement('button');
  copy.type = 'button'; copy.className = 'fontsw-reset'; copy.textContent = 'Copy settings';
  copy.addEventListener('click', async () => {
    const out = JSON.stringify({ fonts: saved, tweaks: vals }, null, 2);
    try { await navigator.clipboard.writeText(out); status.textContent = 'Copied. Paste it to Claude to make these the defaults.'; } catch { status.textContent = out; }
  });

  body.append(load, status, reset, resetAll, copy);
  panel.append(head, body, dl);
  document.body.appendChild(panel);
  return () => {
    panel.remove();
    style.remove();
    for (const t of TWEAKS) if (t.type === 'color') root.style.removeProperty(t.cssVar);
    for (const s of SLOTS) root.style.removeProperty(s.cssVar);
  };
}
