import { urlFor } from './sanity';
import { SEED_PHOTOGRAPHY, PROFILE_PHOTO, BIO_SHORT, EDUCATION, FUN_NOTE, SEED_CRAFTS, SEED_EXPERIENCE, SEED_POSTERS, SEED_PROJECTS } from './seed';

export type SectionId = 'work' | 'posters' | 'experience' | 'about' | 'photography';

export interface Section {
  id: SectionId;
  no: string;
  label: string;
  stampName: string;
  orientation: 'portrait' | 'landscape';
  /** width / height of the stamp artwork */
  ratio: number;
  alt: string;
  html: string;
}

/** Resume PDF, generated from scripts/resume/resume.html (see README there). */
export const RESUME_PDF = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/resume/Matthew-Bloomfield-Resume.pdf`;

export const SITE = {
  name: 'Matthew Bloomfield',
  role: 'Creative Technologist & Designer',
  email: 'matthewb3333@gmail.com',
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mattsbloomfield/' },
    { label: 'GitHub', href: 'https://github.com/mattbloom1/' },
    { label: 'Gearbook', href: 'https://www.gearbook.shop/catalog/matt-bloomfield' },
  ],
};

/* ---------- CMS content model (mirrors studio/schemaTypes) ---------- */
/** Tech stack shown the same way on every website card, always in this order. */
export const STACK_GROUPS = ['Framework', 'Styling', 'Data', 'Hosting', 'Integrations'] as const;
export type StackGroup = typeof STACK_GROUPS[number];
export interface Project {
  title: string; slug: string; summary?: string; featured?: boolean; year?: number;
  disciplines?: string[]; /** Extra filter chips this project also appears under (the first discipline or `tag` stays its main one). */ alsoTags?: string[]; role?: string; heroImage?: string; /** Card cover; falls back to heroImage */ cover?: string; /** Landscape cover for the full-width lead tile on the Work grid (desktop). */ coverWide?: string; images?: string[]; imageAlts?: string[]; accent?: string;
  videoUrl?: string; href?: string; linkLabel?: string;
  /** Kept in the data but not shown anywhere until it has content. */
  hidden?: boolean;
  /** Filter chip on the Work page; defaults to the first discipline. */
  tag?: string;
  stack?: Partial<Record<StackGroup, string[]>>;
  /** Optional case-study extras, rendered the same way on any project detail page. */
  extras?: ProjectExtras;
  /** Full project kit (credits, brand identity) rendered above the website mockups, in the style of a studio case study. */
  kit?: ProjectKit;
}
export interface ProjectKit {
  /** Credit lines shown beside the story, e.g. Location, Architecture. */
  credits?: { label: string; value: string }[];
  brand?: {
    /** Logos shown on a coloured field. */
    logos: { src: string; alt: string; bg: string; w?: number }[];
    palette?: string[];
    fonts?: string[];
    note?: string;
  };
  /** Collateral sections (guidelines, stationery, brochures...) shown after the brand identity, in order. */
  sections?: { title: string; note?: string; /** columns on desktop; images keep their own aspect ratio */ cols?: 1 | 2 | 3 | 4; /** first image full width, the rest in pairs */ mix?: boolean; images: { src: string; alt: string }[] }[];
  /** Heading above the website mockups. */
  websiteNote?: string;
}
export interface ProjectExtras {
  /** Large figures with captions (e.g. a photo of a physical object). */
  figures?: { src: string; alt: string; caption?: string }[];
  /** Headline numbers shown in a row above the notes. */
  stats?: { value: string; label: string }[];
  /** "Worth a closer look" notes: a short heading and a paragraph each. */
  notes?: { heading: string; body: string }[];
  /** Replaces the mouse pointer on this page with a random one of these images. */
  cursorIcons?: string[];
}
export interface Craft {
  /** Kept in the data but not shown until it has content. */
  hidden?: boolean;
  title: string; slug: string; summary?: string; year?: number; role?: string;
  /** Card cover: one animated image (gif or animated webp). */
  cover?: string; /** Large image on the detail page. */ heroImage?: string; image?: string; notes?: string;
  images?: string[]; imageAlts?: string[];
  extras?: ProjectExtras;
}
export interface Experience {
  organization: string; role: string; startDate?: string; endDate?: string; description?: string;
}
export interface PhotoSeries {
  title: string; slug: string; summary?: string; year?: number; cover?: string; frames?: { image?: string; alt?: string; caption?: string; w?: number; h?: number }[];
}
export interface PosterSet { title: string; items: { title: string; src: string; alt: string; w: number; h: number }[] }
export interface SiteContent {
  projects: Project[]; posters: PosterSet[]; crafts: Craft[]; experience: Experience[]; photography: PhotoSeries[];
  /** Which sections still show placeholder entries. */
  placeholder: { projects: boolean; crafts: boolean; experience: boolean; photography: boolean };
}

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
const accents = ['#c4b268', '#c9a0a0', '#8fb3c9', '#7fbf7a', '#a9c0bf'];

/** Matt's supplied content (src/lib/seed.ts); used until Sanity has entries. */
export const PLACEHOLDER: SiteContent = {
  placeholder: { projects: false, crafts: false, experience: false, photography: !SEED_PHOTOGRAPHY.length },
  projects: SEED_PROJECTS,
  posters: SEED_POSTERS,
  crafts: SEED_CRAFTS,
  experience: SEED_EXPERIENCE,
  photography: SEED_PHOTOGRAPHY.length ? SEED_PHOTOGRAPHY : [{ title: 'Placeholder series', slug: 'placeholder-series', summary: 'Photography content has not been supplied.' }],
};

const esc = (s = '') => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
/** Allow only http(s)/relative URLs and plain CSS colours from CMS-sourced values. */
const safeUrl = (u = '') => (/^(https?:\/\/|\/|\.\/)/.test(u) ? u : '');
const safeColor = (v = '') => (/^#[0-9a-f]{3,8}$/i.test(v) ? v : '');
const todo = (t: string) => `<p class="todo">${t}</p>`;
const dates = (e: Experience) => [e.startDate, e.endDate].filter(Boolean).join(' – ');

function stackHtml(p: Project) {
  const rows = STACK_GROUPS.filter((g) => (p.stack?.[g] || []).length)
    .map((g) => `<div class="stack-row"><dt>${esc(g)}</dt><dd>${(p.stack![g] || []).map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</dd></div>`).join('');
  return rows ? `<dl class="stack" aria-label="Tech stack"><p class="meta">Built with</p>${rows}</dl>` : '';
}
/** Black or white text, whichever reads better on a #rrggbb swatch. */
const inkOn = (hex: string) => { const h = hex.replace('#', ''); const f = h.length === 3 ? h.replace(/./g, '$&$&') : h; const [r, g, b] = [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16) || 0); return (r * 299 + g * 587 + b * 114) / 1000 > 140 ? '#111' : '#fff'; };
function kitHtml(p: Project) {
  const b = p.kit?.brand;
  const brand = b ? (() => {
    const logos = b.logos.filter((l) => safeUrl(l.src)).map((l) => `<figure class="kit-logo" style="background:${safeColor(l.bg) || '#fff'}"><img src="${esc(encodeURI(safeUrl(l.src)))}" alt="${esc(l.alt)}" style="max-width:${l.w || 60}%" loading="lazy" decoding="async"></figure>`).join('');
    const sw = (b.palette || []).map((c) => c.split('|')).filter(([c]) => safeColor(c)).map(([c, n]) => `<li style="--sw:${c};--sw-ink:${inkOn(c)}"><span>${n ? `${esc(n)}<br>` : ''}${esc(c.toUpperCase())}</span></li>`).join('');
    return `<section class="kit-brand"><div class="kit-head"><p class="meta">Brand identity</p>${b.note ? `<p>${esc(b.note)}</p>` : ''}</div><div class="kit-logos">${logos}</div>${sw ? `<ul class="kit-palette" aria-label="Colour palette">${sw}</ul>` : ''}${(b.fonts || []).length ? `<p class="meta kit-fonts">Type: ${(b.fonts || []).map(esc).join(' · ')}</p>` : ''}</section>`;
  })() : '';
  const secs = (p.kit?.sections || []).map((sec) => {
    const figs = sec.images.filter((i) => safeUrl(i.src)).map((i) => `<figure class="kit-fig"><img src="${esc(encodeURI(safeUrl(i.src)))}" alt="${esc(i.alt)}" loading="lazy" decoding="async"></figure>`).join('');
    return `<section class="kit-sec"><div class="kit-head"><p class="meta">${esc(sec.title)}</p>${sec.note ? `<p>${esc(sec.note)}</p>` : ''}</div><div class="kit-grid ${sec.mix ? 'kit-mix' : `c${sec.cols || 2}`}">${figs}</div></section>`;
  }).join('');
  const web = p.images?.length ? `<div class="kit-head kit-web"><p class="meta">Website</p>${p.kit?.websiteNote ? `<p>${esc(p.kit.websiteNote)}</p>` : ''}</div>` : '';
  return `${brand}${secs}${web}`;
}
function extrasHtml(p: Project) {
  const x = p.extras;
  if (!x) return '';
  const figs = (x.figures || []).filter((f) => safeUrl(f.src)).map((f) => `<figure class="xfig"><img src="${esc(encodeURI(safeUrl(f.src)))}" alt="${esc(f.alt)}" loading="lazy" decoding="async">${f.caption ? `<figcaption>${esc(f.caption)}</figcaption>` : ''}</figure>`).join('');
  const stats = (x.stats || []).map((s) => `<div class="xstat"><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`).join('');
  const notes = (x.notes || []).map((n) => `<div class="xnote"><h3>${esc(n.heading)}</h3>${n.body.split('\n\n').map((t) => `<p>${esc(t)}</p>`).join('')}</div>`).join('');
  return `<div class="detail-extra">${figs ? `<div class="xfigs">${figs}</div>` : ''}${stats ? `<dl class="xstats">${stats}</dl>` : ''}${notes ? `<div class="xnotes">${notes}</div>` : ''}</div>`;
}
/** Cards plus full-screen detail pages, shared by Projects and Crafts. */
function workViews(items: Project[], noun: string, defaultMeta: string) {
  const c = { projects: items };
  const bg = (p: Project, i: number) => `--c:${safeColor(p.accent) || accents[i % accents.length]};${safeUrl(p.heroImage) ? `background-image:url('${encodeURI(safeUrl(p.heroImage))}'),var(--sk-grad);background-size:cover,200% 100%;background-position:center,0 0` : ''}`;
  const links = (p: Project) => [
    safeUrl(p.videoUrl) ? `<a href="${esc(safeUrl(p.videoUrl))}" target="_blank" rel="noopener">Watch</a>` : '',
    safeUrl(p.href) ? `<a href="${esc(safeUrl(p.href))}" target="_blank" rel="noopener">${esc(p.linkLabel || 'Visit')}</a>` : '',
  ].filter(Boolean).join(' · ');
  const cardCover = (p: Project) => safeUrl(p.cover || p.heroImage);
  // Layout: the developments lead the grid (two half-width tiles, then one full-width), everything else runs three across.
  const devs = items.filter((p) => tagOf(p) === 'Developments').map((p) => p.slug);
  const lead = (p: Project) => { const k = devs.indexOf(p.slug); return k < 0 || devs.length < 3 ? '' : k === 2 ? ' lead lead-wide' : ' lead'; };
  const photo = (p: Project) => {
    const src = cardCover(p), wide = safeUrl(p.coverWide);
    if (!src) return '';
    const img = `<img class="card-photo" src="${esc(encodeURI(src))}" alt="" loading="lazy" decoding="async">`;
    return wide && lead(p).includes('wide') ? `<picture><source media="(min-width: 900px)" srcset="${esc(encodeURI(wide))}">${img}</picture>` : img;
  };
  const card = (p: Project, i: number) => `
    <button type="button" class="card${cardCover(p) ? '' : ' no-img'}${lead(p)}" data-detail="d-${esc(p.slug)}" data-tag="${esc(tagOf(p))}" data-tags="${esc(allTags(p).join("|"))}">
      <span class="card-img${cardCover(p) ? ' has-img' : ''}" style="--c:${safeColor(p.accent) || accents[i % accents.length]}">${photo(p)}</span>
      <span class="card-cap"><span class="card-name">${esc(p.title)}</span><span class="card-sub">${esc([p.role, p.year].filter(Boolean).join(' · '))}</span></span>
    </button>`;
  const siblings = (_p: Project) => c.projects;
  const stepper = (p: Project) => {
    const sib = siblings(p);
    if (sib.length < 2) return '';
    const k = sib.findIndex((q) => q.slug === p.slug);
    const prev = sib[(k - 1 + sib.length) % sib.length], next = sib[(k + 1) % sib.length];
    return `<nav class="detail-steps" aria-label="Other ${noun}s"><button type="button" class="detail-step prev" data-step="d-${esc(prev.slug)}" aria-label="Previous ${noun}: ${esc(prev.title)}"><span class="step-dir">previous</span></button><button type="button" class="detail-step next" data-step="d-${esc(next.slug)}" aria-label="Next ${noun}: ${esc(next.title)}"><span class="step-dir">next</span></button></nav>`;
  };
  const detail = (p: Project, i: number) => `
    <div class="detail" id="d-${esc(p.slug)}"${(p.extras?.cursorIcons || []).length ? ` data-icon-cursor="${esc(JSON.stringify(p.extras!.cursorIcons!.filter((u) => safeUrl(u)).map((u) => encodeURI(safeUrl(u)))))}"` : ''} role="dialog" aria-modal="true" aria-label="${esc(p.title)}" hidden>
      <button type="button" class="detail-close" data-close aria-label="Close details">Close ×</button>
      ${stepper(p)}
      <div class="detail-inner">
        <div class="detail-img${safeUrl(p.heroImage) ? ' has-img' : ''}" style="${bg(p, i)}"></div>
        <div class="detail-text">
          <p class="meta">${esc((p.disciplines || [])[0] || defaultMeta)}</p>
          <h2 tabindex="-1">${esc(p.title)}</h2>
          <p class="meta">${esc([p.role, p.year].filter(Boolean).join(' · '))}</p>
          ${p.summary ? `<p class="detail-sum">${esc(p.summary)}</p>` : `<p class="todo">The story, images and details for this ${noun} are still to come.</p>`}
          ${p.kit?.credits?.length ? `<dl class="kit-credits">${p.kit.credits.map((c) => `<div><dt>${esc(c.label)}</dt><dd>${esc(c.value)}</dd></div>`).join('')}</dl>` : ''}
          ${stackHtml(p)}
          ${links(p) ? `<p class="meta detail-links">${links(p)}</p>` : ''}
        </div>
      </div>
      ${kitHtml(p)}
      ${(p.images || []).filter((u) => safeUrl(u)).length ? `<div class="detail-gallery">${(p.images || []).map((u, k) => ({ u, k })).filter(({ u }) => safeUrl(u)).map(({ u, k }) => `<figure class="gimg"><img src="${esc(encodeURI(safeUrl(u)))}" alt="${esc((p.imageAlts || [])[k] || `${p.title} mockup`)}" loading="lazy" decoding="async"></figure>`).join('')}</div>` : ''}
      ${extrasHtml(p)}
    </div>`;
  return { card, detail };
}
/** Everything on the Work page: projects, websites and crafts as one list, ordered by filter tag. */
const TAG_ORDER = ['Developments', 'Websites', 'Branding', 'Hardware', 'Apps', 'Community', 'Crafts'];
export const allTags = (p: Project) => [tagOf(p), ...(p.alsoTags || [])];
export const tagOf = (p: Project) => p.tag || (p.disciplines || [])[0] || 'Work';
export function workItems(c: SiteContent): Project[] {
  const crafts: Project[] = c.crafts.map((k) => ({ title: k.title, slug: k.slug, summary: k.summary, year: k.year, role: k.role, cover: k.cover, heroImage: k.heroImage || k.image, images: k.images, imageAlts: k.imageAlts, extras: k.extras, disciplines: ['Crafts'], tag: 'Crafts' }));
  const rank = (p: Project) => { const i = TAG_ORDER.indexOf(tagOf(p)); return i < 0 ? TAG_ORDER.length : i; };
  return [...c.projects, ...crafts].map((p, i) => ({ p, i })).sort((x, y) => rank(x.p) - rank(y.p) || x.i - y.i).map(({ p }) => p);
}
function workHtml(c: SiteContent) {
  const items = workItems(c);
  const { card, detail } = workViews(items, 'project', 'Project');
  const tags = TAG_ORDER.filter((t) => items.some((p) => allTags(p).includes(t))).concat([...new Set(items.flatMap(allTags))].filter((t) => !TAG_ORDER.includes(t)));
  const chips = tags.length > 1 ? `<div class="filters" role="group" aria-label="Filter work by topic">${['All', ...tags].map((t, i) => `<button type="button" class="filter" data-filter="${i ? esc(t) : ''}" aria-pressed="${i ? 'false' : 'true'}">${esc(t)}</button>`).join('')}</div>` : '';
  return `${chips}<section><div class="cards">${items.map(card).join('')}</div></section>${items.map(detail).join('')}${todo('More work is on the way.')}`;
}
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
/** "August 2025" -> a sortable number; missing or unreadable dates give -1. */
const when = (d = '') => { const m = d.match(/([a-z]{3})[a-z]*\.?\s+(\d{4})/i); const y = d.match(/\d{4}/); return m ? +m[2] * 12 + Math.max(0, MONTHS.indexOf(m[1].toLowerCase())) : y ? +y[0] * 12 : -1; };
const isOpen = (e: Experience) => !e.endDate || /present|current|now/i.test(e.endDate);
/** Open roles first, then by end date (newest first); ties go to the later start. */
const byEnd = (a: Experience, b: Experience) => (+isOpen(b) - +isOpen(a)) || (isOpen(a) ? 0 : when(b.endDate) - when(a.endDate)) || when(b.startDate) - when(a.startDate);
function experienceHtml(c: SiteContent) {
  const items = [...c.experience].sort(byEnd).map((e) => {
    const head = `<span class="meta">${esc(dates(e))}</span><h2>${esc(e.role)}, ${esc(e.organization)}</h2>`;
    return e.description
      ? `<li><details class="job"><summary>${head}<span class="job-toggle" aria-hidden="true"></span></summary><p>${esc(e.description)}</p></details></li>`
      : `<li>${head}</li>`;
  }).join('');
  const edu = `<p class="meta">Education</p><p><strong>${esc(EDUCATION.school)}</strong>, ${esc(EDUCATION.year)}<br>${esc(EDUCATION.detail)}</p>`;
  const resume = `<section class="resume"><div class="resume-head"><p class="meta">Resume</p><span><a href="${RESUME_PDF}" download>Download PDF</a><a href="${RESUME_PDF}" target="_blank" rel="noopener">Open full size</a></span></div><iframe class="resume-frame" src="${RESUME_PDF}#toolbar=0&navpanes=0&view=FitH" title="Matthew Bloomfield resume (PDF)" loading="lazy"></iframe></section>`;
  return `<ol class="timeline">${items}</ol>${edu}${resume}${c.placeholder.experience ? todo('Placeholder timeline. Experience content has not been supplied.') : ''}`;
}
function photographyHtml(c: SiteContent) {
  const series = c.photography.map((s) => {
    const frames = (s.frames || []).filter((f) => safeUrl(f.image));
    if (!frames.length) return `<section><h2 class="series">${esc(s.title)}</h2><div class="gallery wide"><figure class="shot"></figure></div></section>`;
    const imgs = frames.map((f, idx) => {
      // 800px variant for small slots (pairs, phones); the full file is used when the slot is wide or the screen is dense.
      const full = encodeURI(safeUrl(f.image));
      const single = idx % 3 === 2 || (idx === frames.length - 1 && idx % 3 === 0);
      const srcset = /\/photography\/.+\.webp$/.test(full) ? ` srcset="${esc(full.replace(/\.webp$/, '-400.webp'))} 400w, ${esc(full.replace(/\.webp$/, '-800.webp'))} 800w, ${esc(full)} ${f.w || 1600}w" sizes="${single ? '(max-width: 560px) 100vw, 700px' : '(max-width: 560px) 50vw, 400px'}"` : '';
      return `<figure class="gimg"><img src="${esc(full)}"${srcset} alt="${esc(f.alt || `${s.title} film roll`)}"${f.w && f.h ? ` width="${f.w}" height="${f.h}"` : ''} loading="lazy" decoding="async"></figure>`;
    }).join('');
    return `<section class="roll" id="roll-${esc(s.slug)}"><h2 class="series">${esc(s.title)}${s.year ? ` <span class="series-year">${s.year}</span>` : ''}</h2>${s.summary ? `<p>${esc(s.summary)}</p>` : ''}<div class="detail-gallery roll-gallery">${imgs}</div></section>`;
  }).join('');
  const rolls = c.photography.filter((s) => (s.frames || []).some((f) => safeUrl(f.image)));
  const frameNo = (i: number) => String(i + 1).padStart(2, '0');
  // Sticky film strip: one frame per roll, in order. engine.ts wires up the scroll tracking and the jump-to-roll clicks.
  const strip = rolls.length > 1 ? `<nav class="filmstrip" aria-label="Film rolls"><div class="fs-holes" aria-hidden="true"></div><ol class="fs-track">${rolls.map((s, i) => {
    const thumb = encodeURI(safeUrl((s.frames || [])[0].image)).replace(/\/[^/]+\.webp$/, '/thumb.webp');
    return `<li><a class="fs-frame" href="#roll-${esc(s.slug)}" data-roll="roll-${esc(s.slug)}" aria-label="${esc(s.title)}${s.year ? ' ' + s.year : ''}, roll ${i + 1}"><span class="fs-no" aria-hidden="true">${frameNo(i)}</span><span class="fs-img"><img src="${esc(thumb)}" alt="" width="120" height="80" loading="lazy" decoding="async"></span><span class="fs-lbl" aria-hidden="true">${esc(s.title.slice(0, 3))}${s.year ? ` ’${String(s.year).slice(2)}` : ''}</span></a></li>`;
  }).join('')}</ol><div class="fs-holes fs-holes-b" aria-hidden="true"></div></nav>` : '';
  return `${series}${c.placeholder.photography ? todo('Placeholder. Photography content has not been supplied.') : ''}${strip}`;
}
function postersHtml(c: SiteContent) {
  return c.posters.map((set) => `<section class="roll"><h2 class="series">${esc(set.title)}</h2><div class="detail-gallery poster-gallery">${set.items.filter((i) => safeUrl(i.src)).map((i) => `<figure class="gimg"><img src="${esc(encodeURI(safeUrl(i.src)))}" alt="${esc(i.alt)}" width="${i.w}" height="${i.h}" loading="lazy" decoding="async"></figure>`).join('')}</div></section>`).join('');
}
function aboutHtml() {
  const links = SITE.links.map((l) => `<li><a href="${l.href}" target="_blank" rel="noopener">${l.label}</a></li>`).join('');
  const paras = (a: string[]) => a.map((t) => `<p>${esc(t)}</p>`).join('');
  return `<div class="about-top"><img class="portrait" src="${esc(PROFILE_PHOTO.src)}" srcset="${esc(PROFILE_PHOTO.src.replace(/\.webp$/, '-800.webp'))} 800w, ${esc(PROFILE_PHOTO.src)} 1600w" sizes="(max-width: 760px) 100vw, 45vw" alt="${esc(PROFILE_PHOTO.alt)}" width="1600" height="1061" loading="lazy" decoding="async" /><div><p class="lead">${esc(SITE.role)}.</p>
    ${paras(BIO_SHORT)}</div></div>
    <p class="fun">${esc(FUN_NOTE)}</p>
    <section class="contact"><p class="meta letter-label">Write me a letter</p>
    <div class="letter"><form class="letter-form"><div class="sheet">
      <label>Your name<input name="name" type="text" required maxlength="100" autocomplete="name"></label>
      <label>Your email<input name="email" type="email" required maxlength="200" autocomplete="email"></label>
      <label>Message<textarea name="message" required minlength="2" maxlength="5000" rows="6"></textarea></label>
      <input class="hp" name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button type="submit" class="letter-send">Send</button>
    </div></form>
    <div class="letter-done"><p>Your letter is on its way.</p><button type="button" class="letter-again">Write another</button>
    <svg class="letter-trail" viewBox="0 0 520 220" aria-hidden="true" focusable="false"><defs><filter id="blot" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.5"/></filter></defs>
      <g filter="url(#blot)" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path class="trail" pathLength="100" d="M6 150 C 60 160, 110 120, 150 90 C 190 60, 250 40, 280 80 C 305 115, 262 150, 232 128 C 205 105, 255 62, 330 74 C 400 85, 440 100, 496 70"/><path class="head" d="M470 52 L498 68 L476 92"/></g></svg></div></div>
    <p class="letter-status" role="status" aria-live="polite"></p></section>
    <p class="meta">Elsewhere</p><ul class="links">${links}<li><a href="mailto:${SITE.email}">${SITE.email}</a></li></ul>`;
}

/** Drops entries flagged hidden. */
const visible = (c: SiteContent): SiteContent => ({ ...c, projects: c.projects.filter((p) => !p.hidden), crafts: c.crafts.filter((k) => !k.hidden) });

/** Plain, text-only outline of the whole site, rendered into the static HTML (inside <noscript>) for crawlers, link readers and no-JS visitors. */
export function outlineHtml(all: SiteContent): string {
  const c = visible(all);
  const li = (t: string, d?: string) => `<li><strong>${esc(t)}</strong>${d ? ` ${esc(d)}` : ''}</li>`;
  return `<h1>${esc(SITE.name)}, ${esc(SITE.role)}</h1>
<h2>About</h2>${BIO_SHORT.map((t) => `<p>${esc(t)}</p>`).join('')}
<h2>Work</h2><ul>${workItems(c).map((p) => li(p.title, [tagOf(p), p.role, p.year].filter(Boolean).join(', '))).join('')}</ul>
<h2>Experience</h2><ul>${[...c.experience].sort(byEnd).map((e) => li(`${e.role}, ${e.organization}`, dates(e))).join('')}</ul>
<h2>Elsewhere</h2><ul>${SITE.links.map((l) => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('')}<li><a href="mailto:${SITE.email}">${SITE.email}</a></li></ul>`;
}

export function buildSections(all: SiteContent): Section[] {
  const c = visible(all);
  const L = (id: SectionId, no: string, label: string, stampName: string, art: string, html: string): Section => ({ id, no, label, stampName, orientation: 'landscape', ratio: 1658 / 1130, alt: `${stampName} stamp, ${art}`, html });
  return [
    L('work', '01', 'Work', 'Work', 'a vintage computer', workHtml(c)),
    L('posters', '02', 'Posters', 'Posters', 'two printed posters', postersHtml(c)),
    L('experience', '03', 'Experience', 'Experience', 'a vintage suitcase', experienceHtml(c)),
    L('photography', '04', 'Photography', 'Photography', 'a Minolta X-700 film camera', photographyHtml(c)),
    L('about', '05', 'About', 'About', 'a halftone portrait of Matt', aboutHtml()),
  ];
}

export { urlFor };
