#!/usr/bin/env node
/**
 * Copies the resume Google Doc's text into src/lib/resume.generated.ts, so phones can show it as
 * readable text in the site's own type. The Doc stays the only place the resume is edited; every
 * build runs this (npm prebuild), so each deploy carries the Doc's current text.
 *
 *   node scripts/resume/sync.mjs                  fetch the Doc's HTML export (it is shared "anyone with the link")
 *   node scripts/resume/sync.mjs export.html      read a saved export instead
 *   node scripts/resume/sync.mjs --keep-on-error  (builds) if Google can't be reached, keep the committed copy
 *
 * Never writes if the export doesn't look like the resume, so a bad fetch can't ship.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const DOC_ID = '1tzvzp20uKMOIINX3L13xJlVhdqAGL3Aw6QenmHJZ6ZU';
const KEEP = process.argv.includes('--keep-on-error');
const FILE = process.argv.slice(2).find((a) => !a.startsWith('--'));
const OUT = fileURLToPath(new URL('../../src/lib/resume.generated.ts', import.meta.url));

async function load() {
  if (FILE) return readFile(FILE, 'utf8');
  const res = await fetch(`https://docs.google.com/document/d/${DOC_ID}/export?format=html`, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Doc export returned HTTP ${res.status}`);
  return res.text();
}

const NAMED = { nbsp: '\u00a0', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", ndash: '\u2013', mdash: '\u2014', middot: '\u00b7', rsquo: '\u2019', lsquo: '\u2018', rdquo: '\u201d', ldquo: '\u201c', hellip: '\u2026', bull: '\u2022', eacute: '\u00e9', egrave: '\u00e8', ecirc: '\u00ea' };
const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) =>
  e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : +e.slice(1)) : NAMED[e.toLowerCase()] ?? m);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Google's export styles text either inline or through .cN classes; read both. */
function parseDecls(css = '') {
  const o = {};
  for (const d of css.split(';')) { const i = d.indexOf(':'); if (i > 0) o[d.slice(0, i).trim().toLowerCase()] = d.slice(i + 1).trim(); }
  return o;
}
function classRules(html) {
  const rules = {};
  for (const [, css] of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi))
    for (const [, name, body] of css.matchAll(/(?<=^|[}\s])\.([\w-]+)\s*\{([^}]*)\}/g)) rules[name] = { ...rules[name], ...parseDecls(body) };
  return rules;
}
const attr = (a, n) => (a.match(new RegExp(`${n}\\s*=\\s*"([^"]*)"`, 'i')) || [])[1];

/** Flatten the body into blocks of styled runs: { kind: 'p' | 'li', rule, size, runs: [{ text, bold, italic }] }. */
function blocks(html) {
  const rules = classRules(html);
  const body = html.slice(html.search(/<body/i));
  const out = []; let cur = null; const stack = [];
  const style = (a) => ({ ...Object.assign({}, ...(attr(a, 'class') || '').split(/\s+/).map((c) => rules[c] || {})), ...parseDecls(decode(attr(a, 'style') || '')) });
  for (const [, close, tag, a = '', text] of body.matchAll(/<(\/?)(\w+)([^>]*)>|([^<]+)/g)) {
    if (text !== undefined) {
      if (!cur) continue;
      const st = Object.assign({}, cur.style, ...stack.map((s) => s.style));
      const t = decode(text);
      if (t) cur.runs.push({ text: t, bold: +st['font-weight'] >= 600, italic: st['font-style'] === 'italic', size: parseFloat(st['font-size']) || 0 });
      continue;
    }
    const t = tag.toLowerCase();
    if (t === 'p' || t === 'li' || /^h[1-6]$/.test(t)) {
      if (close) { if (cur) out.push(cur); cur = null; stack.length = 0; continue; }
      const s = style(a);
      cur = { kind: t === 'li' ? 'li' : 'p', style: s, runs: [], rule: /solid/.test(s['border-bottom-style'] || '') && parseFloat(s['border-bottom-width']) > 0 };
    } else if (t === 'span') {
      if (close) stack.pop(); else stack.push({ style: style(a) });
    } else if (t === 'br' && cur) cur.runs.push({ text: ' ', bold: false, italic: false, size: 0 });
  }
  return out
    .map((b) => ({ ...b, text: b.runs.map((r) => r.text).join(''), size: Math.max(0, ...b.runs.map((r) => r.size)) }))
    .filter((b) => b.text.replace(/\s/g, ''));
}

const tidy = (s) => s.replace(/[\s\u00a0]+/g, ' ');
function inline(runs) {
  // merge neighbouring runs with the same weight so <strong> spans whole phrases
  const m = [];
  for (const r of runs) { const l = m[m.length - 1]; if (l && l.bold === r.bold && l.italic === r.italic) l.text += r.text; else m.push({ ...r }); }
  let s = m.map((r) => { const t = esc(tidy(r.text)); return r.bold && t.trim() ? `<strong>${t}</strong>` : r.italic && t.trim() ? `<em>${t}</em>` : t; }).join('');
  return s.trim().replace(/\s+(<\/(?:strong|em)>)/g, '$1 ').replace(/(<(?:strong|em)>)\s+/g, ' $1').replace(/\s{2,}/g, ' ').trim();
}

function render(bs) {
  const html = []; let inList = false; let seenSection = false; let name = 0, sections = 0, items = 0;
  const top = Math.max(...bs.map((b) => b.size));
  for (const b of bs) {
    if (b.kind !== 'li' && inList) { html.push('</ul>'); inList = false; }
    if (b.kind === 'li') {
      if (!inList) { html.push('<ul>'); inList = true; }
      html.push(`<li>${inline(b.runs)}</li>`); items++;
    } else if (b.size === top && b.size >= 16 && !seenSection) {
      html.push(`<p class="r-name">${esc(tidy(b.text).trim())}</p>`); name++;
    } else if (b.rule) {
      html.push(`<h3 class="r-sec">${esc(tidy(b.text).trim())}</h3>`); sections++; seenSection = true;
    } else if (!seenSection) {
      html.push(`<p class="r-sub">${inline(b.runs)}</p>`);
    } else if (/\S(?:\u00a0|\s){2,}\S|\t/.test(b.text.trim())) {
      // "Organisation      Dates": the Doc lines the dates up with a run of spaces or a tab
      const t = b.text.trim(); const at = [...t.matchAll(/(?:\u00a0|\s){2,}|\t/g)].pop();
      html.push(`<p class="r-entry"><strong>${esc(tidy(t.slice(0, at.index)).trim())}</strong> <span class="r-date">${esc(tidy(t.slice(at.index)).trim())}</span></p>`);
    } else if (b.runs.every((r) => r.italic || !r.text.trim())) {
      html.push(`<p class="r-role">${esc(tidy(b.text).trim())}</p>`);
    } else if (b.runs.every((r) => r.bold || !r.text.trim())) {
      html.push(`<p class="r-head">${esc(tidy(b.text).trim())}</p>`);
    } else {
      html.push(`<p>${inline(b.runs)}</p>`);
    }
  }
  if (inList) html.push('</ul>');
  if (name !== 1 || sections < 3 || items < 10) throw new Error(`Export doesn't look like the resume (name ${name}, sections ${sections}, bullets ${items}); not writing.`);
  return html.join('');
}

let html;
try {
  html = render(blocks(await load()));
} catch (err) {
  if (!KEEP) throw err;
  console.warn(`Resume sync skipped, keeping the committed text: ${err.message}`);
  process.exit(0);
}
const file = `// Generated by scripts/resume/sync.mjs from the resume Google Doc. Don't edit by hand: edit the Doc.\nexport const RESUME_TEXT_HTML = ${JSON.stringify(html)};\n`;
const prev = await readFile(OUT, 'utf8').catch(() => '');
if (prev === file) console.log('Resume text is already up to date with the Doc.');
else { await writeFile(OUT, file); console.log(`Resume text updated from the Doc (${html.length} characters).`); }
