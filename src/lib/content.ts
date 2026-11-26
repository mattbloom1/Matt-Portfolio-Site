import variants from './variants.json';
import { RESUME_PAGES, RESUME_TEXT_HTML } from './resume.generated';
import { SEED_PHOTOGRAPHY, PROFILE_PHOTO, BIO_SHORT, FUN_NOTE, SEED_CRAFTS, SEED_EXPERIENCE, SEED_POSTERS, SEED_PROJECTS } from './seed';

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

/** The resume is one Google Doc. Wide screens embed it live; Google's embed shows the whole page scaled to fit,
 *  so on a phone its 10pt text would be about 5px. Phones get the Doc's text instead, set in the site's type
 *  (resume.generated.ts, copied from the Doc on every build by scripts/resume/sync.mjs).
 *  The Doc must stay shared as "Anyone with the link: Viewer" for the embed, the PDF link and the sync to work. */
const RESUME_DOC = 'https://docs.google.com/document/d/1tzvzp20uKMOIINX3L13xJlVhdqAGL3Aw6QenmHJZ6ZU';
export const RESUME_PDF = `${RESUME_DOC}/export?format=pdf`;

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
  disciplines?: string[]; /** Extra filter chips this project also appears under (the first discipline or `tag` stays its main one). */ alsoTags?: string[]; role?: string; heroImage?: string; /** Card cover; falls back to heroImage */ cover?: string; images?: string[]; imageAlts?: string[]; accent?: string;
  videoUrl?: string; href?: string; linkLabel?: string;
  /** Kept in the data but not shown anywhere until it has content. */
  hidden?: boolean;
  /** Sorts to the very end of the Work grid, whatever its tag. */
  last?: boolean;
  /** Filter chip on the Work page; defaults to the first discipline. */
  tag?: string;
  stack?: Partial<Record<StackGroup, string[]>>;
  /** Optional case-study extras, rendered the same way on any project detail page. */
  extras?: ProjectExtras;
  /** Full project kit (credits, brand identity) rendered above the website mockups, in the style of a studio case study. */
  kit?: ProjectKit;
  /** A bank of short muted looping clips shown as a channel-surfing screen wall. */
  motion?: { note?: string; clips: { title: string; src: string; poster: string }[] };
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
/** Smaller WebP variants made by scripts/make-variants.mjs (prebuild). Keys are paths without the base path. */
const VARIANTS = variants as Record<string, { w: number; h: number; v: number[] }>;
const variantsOf = (src: string) => VARIANTS[src.startsWith(base) ? src.slice(base.length) : src];
/** The srcset value for an image that has generated variants; empty when it has none. */
function srcsetValue(src: string): string {
  const m = variantsOf(src);
  if (!m || !m.v.length) return '';
  return [...m.v.map((w) => `${encodeURI(src.replace(/\.webp$/, `-${w}.webp`))} ${w}w`), `${encodeURI(src)} ${m.w}w`].join(', ');
}
/** srcset + sizes attributes for an image that has generated variants; empty when it has none. */
export function srcsetFor(src: string, sizes: string): string {
  const set = srcsetValue(src);
  return set ? ` srcset="${esc(set)}" sizes="${sizes}"` : '';
}
/** width/height attributes (so the browser reserves the space) and the matching placeholder ratio. */
const dimsFor = (src: string) => { const m = variantsOf(src); return m?.h ? ` width="${m.w}" height="${m.h}"` : ''; };
const ratioFor = (src: string) => { const m = variantsOf(src); return m?.h ? ` style="--ar:${m.w}/${m.h}"` : ''; };
/** First images on a page load straight away; the rest wait until they're near the screen. */
const priority = (first: boolean) => (first ? 'fetchpriority="high"' : 'loading="lazy"');

/* Rendered slot widths, so phones fetch a smaller file. They err wide: a slot never gets a file below its size. */
const SIZES = {
  stamp: '(max-width: 640px) 45vw, 24vw',
  card: '(max-width: 640px) 50vw, (max-width: 899px) 33vw, 26vw',
  poster: '(max-width: 899px) 50vw, 34vw',
  // project pages: max 1400px wide with 4vw gutters
  full: '(max-width: 1400px) 92vw, 1300px',
  // phones crop gallery pairs to zoomed squares, so they need more than half the screen
  pair: '(max-width: 560px) 90vw, (max-width: 1400px) 46vw, 650px',
  half: '(max-width: 760px) 92vw, (max-width: 1400px) 46vw, 650px',
  third: '(max-width: 760px) 46vw, (max-width: 1400px) 31vw, 440px',
  quarter: '(max-width: 760px) 46vw, (max-width: 1400px) 23vw, 330px',
};
const KIT_SIZES = { 1: SIZES.full, 2: SIZES.half, 3: SIZES.third, 4: SIZES.quarter } as const;
/** A gallery's 2 / 2 / 1 rhythm: every third image, and a lone last one, runs full width. */
const isSingle = (idx: number, count: number) => idx % 3 === 2 || (idx === count - 1 && idx % 3 === 0);

const stampSrc = (id: SectionId, w?: number) => `${base}/stamps/${id}${w ? `-${w}` : ''}.webp`;
/** Home stamp artwork: src, srcset and sizes, shared by the stamp buttons and the home page preload. */
export const stampImage = (id: SectionId) => ({ src: stampSrc(id), srcSet: `${stampSrc(id, 300)} 300w, ${stampSrc(id, 600)} 600w, ${stampSrc(id)} 1000w`, sizes: SIZES.stamp });
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
const dates = (e: Experience) => [e.startDate, e.endDate].filter(Boolean).join(' – ');

function stackHtml(p: Project) {
  const rows = STACK_GROUPS.filter((g) => (p.stack?.[g] || []).length)
    .map((g) => `<div class="stack-row"><dt>${esc(g)}</dt><dd>${(p.stack![g] || []).map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</dd></div>`).join('');
  return rows ? `<div class="stack"><p class="meta">Built with</p><dl aria-label="Tech stack">${rows}</dl></div>` : '';
}
/** Black or white text, whichever reads better on a #rrggbb swatch. */
const inkOn = (hex: string) => { const h = hex.replace('#', ''); const f = h.length === 3 ? h.replace(/./g, '$&$&') : h; const [r, g, b] = [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16) || 0); return (r * 299 + g * 587 + b * 114) / 1000 > 140 ? '#111' : '#fff'; };
function motionHtml(p: Project) {
  const clips = (p.motion?.clips || []).filter((c) => safeUrl(c.src) && safeUrl(c.poster));
  if (!clips.length) return '';
  const u = (v: string) => esc(encodeURI(safeUrl(v)));
  const n = (i: number) => String(i + 1).padStart(2, '0');
  const first = clips[0];
  const bank = clips.map((c, i) => `<li><button type="button" class="tv-tile" data-i="${i}" data-src="${u(c.src)}" data-poster="${u(c.poster)}" data-title="${esc(c.title)}" aria-label="Tune to channel ${n(i)}, ${esc(c.title)}"${i === 0 ? ' aria-pressed="true"' : ' aria-pressed="false"'}><video src="${u(c.src)}" poster="${u(c.poster)}" muted loop playsinline preload="none" tabindex="-1" aria-hidden="true"></video><span class="tv-no">${n(i)}</span></button></li>`).join('');
  return `<section class="kit-sec motion" data-motion><div class="kit-head"><p class="meta">Channel surfing</p><p>${esc(p.motion?.note || 'Pick a channel. It flips through the loops on its own until you do.')}</p></div><div class="tv"><video class="tv-main" src="${u(first.src)}" poster="${u(first.poster)}" muted loop playsinline preload="none" aria-label="Now playing"></video><span class="tv-hud"><span class="tv-ch">CH ${n(0)}</span><span class="tv-name">${esc(first.title)}</span></span><span class="tv-snow" aria-hidden="true"></span></div><ul class="tv-bank" aria-label="Channels">${bank}</ul></section>`;
}
function kitHtml(p: Project) {
  const b = p.kit?.brand;
  const brand = b ? (() => {
    const logos = b.logos.filter((l) => safeUrl(l.src)).map((l) => `<figure class="kit-logo" style="background:${safeColor(l.bg) || '#fff'}"><img src="${esc(encodeURI(safeUrl(l.src)))}" alt="${esc(l.alt)}" style="max-width:${l.w || 60}%" loading="lazy" decoding="async"></figure>`).join('');
    const sw = (b.palette || []).map((c) => c.split('|')).filter(([c]) => safeColor(c)).map(([c, n]) => `<li style="--sw:${c};--sw-ink:${inkOn(c)}"><span>${n ? `${esc(n)}<br>` : ''}${esc(c.toUpperCase())}</span></li>`).join('');
    return `<section class="kit-brand"><div class="kit-head"><p class="meta">Brand identity</p>${b.note ? `<p>${esc(b.note)}</p>` : ''}</div><div class="kit-logos">${logos}</div>${sw ? `<ul class="kit-palette" aria-label="Colour palette">${sw}</ul>` : ''}${(b.fonts || []).length ? `<p class="meta kit-fonts">Type: ${(b.fonts || []).map(esc).join(' · ')}</p>` : ''}</section>`;
  })() : '';
  const secs = (p.kit?.sections || []).map((sec) => {
    const sizes = (k: number) => (sec.mix && k === 0 ? SIZES.full : sec.mix ? SIZES.half : KIT_SIZES[sec.cols || 2]);
    const figs = sec.images.filter((i) => safeUrl(i.src)).map((i, k) => `<figure class="kit-fig"><img src="${esc(encodeURI(safeUrl(i.src)))}"${srcsetFor(i.src, sizes(k))}${dimsFor(i.src)} alt="${esc(i.alt)}" loading="lazy" decoding="async"></figure>`).join('');
    return `<section class="kit-sec"><div class="kit-head"><p class="meta">${esc(sec.title)}</p>${sec.note ? `<p>${esc(sec.note)}</p>` : ''}</div><div class="kit-grid ${sec.mix ? 'kit-mix' : `c${sec.cols || 2}`}">${figs}</div></section>`;
  }).join('');
  // only a site's screenshots are a "Website"; floor plans, crafts and hardware get a plain gallery label
  const galleryLabel = allTags(p).includes('Websites') || p.kit?.websiteNote ? 'Website' : 'Gallery';
  const web = p.images?.length ? `<div class="kit-head kit-web"><p class="meta">${galleryLabel}</p>${p.kit?.websiteNote ? `<p>${esc(p.kit.websiteNote)}</p>` : ''}</div>` : '';
  return `${brand}${motionHtml(p)}${secs}${web}`;
}
function extrasHtml(p: Project) {
  const x = p.extras;
  if (!x) return '';
  const figs = (x.figures || []).filter((f) => safeUrl(f.src)).map((f) => `<figure class="xfig"><img src="${esc(encodeURI(safeUrl(f.src)))}"${srcsetFor(f.src, SIZES.half)}${dimsFor(f.src)} alt="${esc(f.alt)}" loading="lazy" decoding="async">${f.caption ? `<figcaption>${esc(f.caption)}</figcaption>` : ''}</figure>`).join('');
  const stats = (x.stats || []).map((s) => `<div class="xstat"><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`).join('');
  const notes = (x.notes || []).map((n) => `<div class="xnote"><h2>${esc(n.heading)}</h2><div class="xnote-body">${n.body.split('\n\n').map((t) => `<p>${esc(t)}</p>`).join('')}</div></div>`).join('');
  return `<div class="detail-extra">${figs ? `<div class="xfigs">${figs}</div>` : ''}${stats ? `<dl class="xstats">${stats}</dl>` : ''}${notes ? `<div class="xnotes">${notes}</div>` : ''}</div>`;
}
/** Cards plus full-screen detail pages, shared by Projects and Crafts. */
function workViews(items: Project[], noun: string, defaultMeta: string) {
  const bg = (p: Project, i: number) => `--c:${safeColor(p.accent) || accents[i % accents.length]};${safeUrl(p.heroImage) ? `background-image:url('${encodeURI(safeUrl(p.heroImage))}'),var(--sk-grad);background-size:cover,200% 100%;background-position:center,0 0` : ''}`;
  const links = (p: Project) => [
    safeUrl(p.videoUrl) ? `<a href="${esc(safeUrl(p.videoUrl))}" target="_blank" rel="noopener">Watch</a>` : '',
    safeUrl(p.href) ? `<a href="${esc(safeUrl(p.href))}" target="_blank" rel="noopener">${esc(p.linkLabel || 'Visit')}</a>` : '',
  ].filter(Boolean).join(' · ');
  const cardCover = (p: Project) => safeUrl(p.cover || p.heroImage);
  // Everything runs three across; the three developments come first, so they fill the first row.
  const photo = (p: Project, i: number) => {
    const src = cardCover(p);
    return src ? `<img class="card-photo" src="${esc(encodeURI(src))}"${srcsetFor(src, SIZES.card)} alt="" ${priority(i < 3)} decoding="async">` : '';
  };
  const card = (p: Project, i: number) => `
    <button type="button" class="card${cardCover(p) ? '' : ' no-img'}" data-detail="d-${esc(p.slug)}" data-tag="${esc(tagOf(p))}" data-tags="${esc(allTags(p).join("|"))}">
      <span class="card-img${cardCover(p) ? ' has-img' : ''}" style="--c:${safeColor(p.accent) || accents[i % accents.length]}">${photo(p, i)}</span>
      <span class="card-cap"><span class="card-name">${esc(p.title)}</span><span class="card-sub">${esc([p.role, p.year].filter(Boolean).join(' · '))}</span></span>
    </button>`;
  const stepper = (p: Project) => {
    const sib = items;
    if (sib.length < 2) return '';
    const k = sib.findIndex((q) => q.slug === p.slug);
    const prev = sib[(k - 1 + sib.length) % sib.length], next = sib[(k + 1) % sib.length];
    return `<nav class="detail-steps" aria-label="Other ${noun}s"><button type="button" class="detail-step prev" data-step="d-${esc(prev.slug)}" aria-label="Previous ${noun}: ${esc(prev.title)}"><span class="step-dir">previous</span></button><button type="button" class="detail-step next" data-step="d-${esc(next.slug)}" aria-label="Next ${noun}: ${esc(next.title)}"><span class="step-dir">next</span></button></nav>`;
  };
  const galleryHtml = (p: Project) => {
    const shots = (p.images || []).map((u, k) => ({ u, alt: (p.imageAlts || [])[k] || `${p.title} mockup` })).filter(({ u }) => safeUrl(u));
    if (!shots.length) return '';
    return `<div class="detail-gallery">${shots.map(({ u, alt }, k) => `<figure class="gimg"${ratioFor(u)}><img src="${esc(encodeURI(safeUrl(u)))}"${srcsetFor(u, isSingle(k, shots.length) ? SIZES.full : SIZES.pair)}${dimsFor(u)} alt="${esc(alt)}" loading="lazy" decoding="async"></figure>`).join('')}</div>`;
  };
  const detail = (p: Project, i: number) => `
    <div class="detail" id="d-${esc(p.slug)}"${(p.extras?.cursorIcons || []).length ? ` data-icon-cursor="${esc(JSON.stringify(p.extras!.cursorIcons!.filter((u) => safeUrl(u)).map((u) => encodeURI(safeUrl(u)))))}"` : ''} role="dialog" aria-modal="true" aria-label="${esc(p.title)}" hidden>
      <button type="button" class="detail-close" data-close aria-label="Close details">Close ×</button>
      ${stepper(p)}
      <div class="detail-inner">
        <div class="detail-img${safeUrl(p.heroImage) ? ' has-img' : ''}" style="${bg(p, i)}"></div>
        <div class="detail-text">
          <p class="meta">${esc((p.disciplines || [])[0] || defaultMeta)}</p>
          <h1 tabindex="-1">${esc(p.title)}</h1>
          <p class="meta">${esc([p.role, p.year].filter(Boolean).join(' · '))}</p>
          ${p.summary ? `<p class="detail-sum">${esc(p.summary)}</p>` : ''}
          ${p.kit?.credits?.length ? `<dl class="kit-credits">${p.kit.credits.map((c) => `<div><dt>${esc(c.label)}</dt><dd>${esc(c.value)}</dd></div>`).join('')}</dl>` : ''}
          ${stackHtml(p)}
          ${links(p) ? `<p class="meta detail-links">${links(p)}</p>` : ''}
        </div>
      </div>
      ${kitHtml(p)}
      ${galleryHtml(p)}
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
  const rank = (p: Project) => { const i = TAG_ORDER.indexOf(tagOf(p)); return (p.last ? 100 : 0) + (i < 0 ? TAG_ORDER.length : i); };
  return [...c.projects, ...crafts].map((p, i) => ({ p, i })).sort((x, y) => rank(x.p) - rank(y.p) || x.i - y.i).map(({ p }) => p);
}
function workHtml(c: SiteContent) {
  const items = workItems(c);
  const { card, detail } = workViews(items, 'project', 'Project');
  const tags = TAG_ORDER.filter((t) => items.some((p) => allTags(p).includes(t))).concat([...new Set(items.flatMap(allTags))].filter((t) => !TAG_ORDER.includes(t)));
  const chips = tags.length > 1 ? `<div class="filters" role="group" aria-label="Filter work by topic">${['All', ...tags].map((t, i) => `<button type="button" class="filter" data-filter="${i ? esc(t) : ''}" aria-pressed="${i ? 'false' : 'true'}">${esc(t)}</button>`).join('')}</div>` : '';
  return `${chips}<section><div class="cards">${items.map(card).join('')}</div></section>${items.map(detail).join('')}`;
}
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
/** "August 2025" -> a sortable number; missing or unreadable dates give -1. */
const when = (d = '') => { const m = d.match(/([a-z]{3})[a-z]*\.?\s+(\d{4})/i); const y = d.match(/\d{4}/); return m ? +m[2] * 12 + Math.max(0, MONTHS.indexOf(m[1].toLowerCase())) : y ? +y[0] * 12 : -1; };
const isOpen = (e: Experience) => !e.endDate || /present|current|now/i.test(e.endDate);
/** Open roles first, then by end date (newest first); ties go to the later start. */
const byEnd = (a: Experience, b: Experience) => (+isOpen(b) - +isOpen(a)) || (isOpen(a) ? 0 : when(b.endDate) - when(a.endDate)) || when(b.startDate) - when(a.startDate);
/** Experience is the resume alone: the Doc already lists every job, so the page doesn't repeat them. */
function experienceHtml() {
  return `<section class="resume"><div class="resume-head"><p class="meta">Resume</p><a class="resume-dl" href="${RESUME_PDF}" aria-label="Download resume PDF" title="Download resume PDF"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3.5v12"/><path d="M6.5 10.5 12 16l5.5-5.5"/><path d="M4 20.5h16"/></svg></a></div><div class="resume-doc" style="--pages:${RESUME_PAGES}"><iframe src="${RESUME_DOC}/preview" title="Resume of Matthew Bloomfield" loading="lazy"></iframe></div><article class="resume-text" aria-label="Resume">${RESUME_TEXT_HTML}</article></section>`;
}
/** Film frames ship with 400px and 800px copies (scripts/photography); the full file is used when the slot is wide or the screen is dense. */
const frameSrcset = (f: { image?: string; w?: number }) => {
  const full = encodeURI(safeUrl(f.image));
  return /\/photography\/.+\.webp$/.test(full) ? `${full.replace(/\.webp$/, '-400.webp')} 400w, ${full.replace(/\.webp$/, '-800.webp')} 800w, ${full} ${f.w || 1600}w` : '';
};
const FRAME_SIZES = { single: '(max-width: 899px) 100vw, 68vw', pair: '(max-width: 899px) 48vw, 34vw' };
function photographyHtml(c: SiteContent) {
  const firstRoll = c.photography.find((s) => (s.frames || []).some((f) => safeUrl(f.image)));
  const series = c.photography.map((s) => {
    const first = s === firstRoll;
    const frames = (s.frames || []).filter((f) => safeUrl(f.image));
    if (!frames.length) return `<section><h2 class="series">${esc(s.title)}</h2><div class="gallery wide"><figure class="shot"></figure></div></section>`;
    const imgs = frames.map((f, idx) => {
      const full = encodeURI(safeUrl(f.image));
      const set = frameSrcset(f);
      const srcset = set ? ` srcset="${esc(set)}" sizes="${isSingle(idx, frames.length) ? FRAME_SIZES.single : FRAME_SIZES.pair}"` : '';
      const dims = f.w && f.h ? ` width="${f.w}" height="${f.h}"` : '';
      return `<figure class="gimg"${f.w && f.h ? ` style="--ar:${f.w}/${f.h}"` : ''}><img src="${esc(full)}"${srcset} alt="${esc(f.alt || `${s.title} film roll`)}" tabindex="0" role="button"${dims} ${priority(first && idx < 2)} decoding="async"></figure>`;
    }).join('');
    return `<section class="roll" id="roll-${esc(s.slug)}"><h2 class="series">${esc(s.title)}${s.year ? ` <span class="series-year">${s.year}</span>` : ''}</h2>${s.summary ? `<p>${esc(s.summary)}</p>` : ''}<div class="detail-gallery roll-gallery">${imgs}</div></section>`;
  }).join('');
  const rolls = c.photography.filter((s) => (s.frames || []).some((f) => safeUrl(f.image)));
  const frameNo = (i: number) => String(i + 1).padStart(2, '0');
  // Sticky film strip: one frame per roll, in order. engine.ts wires up the scroll tracking and the jump-to-roll clicks.
  const strip = rolls.length > 1 ? `<nav class="filmstrip" aria-label="Film rolls"><div class="fs-holes" aria-hidden="true"></div><ol class="fs-track">${rolls.map((s, i) => {
    const thumb = encodeURI(safeUrl((s.frames || [])[0].image)).replace(/\/[^/]+\.webp$/, '/thumb.webp');
    return `<li><a class="fs-frame" href="#roll-${esc(s.slug)}" data-roll="roll-${esc(s.slug)}"><span class="fs-no">${frameNo(i)}</span><span class="fs-img"><img src="${esc(thumb)}" alt="" width="120" height="80" loading="lazy" decoding="async"></span><span class="fs-lbl">${esc(s.title.slice(0, 3))}${s.year ? ` ’${String(s.year).slice(2)}` : ''}</span><span class="sr-only">, ${esc(s.title)}${s.year ? ' ' + s.year : ''}</span></a></li>`;
  }).join('')}</ol><div class="fs-holes fs-holes-b" aria-hidden="true"></div></nav>` : '';
  return `${series}${strip}`;
}
function postersHtml(c: SiteContent) {
  return c.posters.map((set, n) => `<section class="roll"><h2 class="series">${esc(set.title)}</h2><div class="detail-gallery poster-gallery">${set.items.filter((i) => safeUrl(i.src)).map((i, k) => `<figure class="gimg" style="--ar:${i.w}/${i.h}"><img src="${esc(encodeURI(safeUrl(i.src)))}"${srcsetFor(i.src, SIZES.poster)} alt="${esc(i.alt)}" width="${i.w}" height="${i.h}" tabindex="0" role="button" ${priority(n === 0 && k < 2)} decoding="async"></figure>`).join('')}</div></section>`).join('');
}
const PORTRAIT_SRCSET = `${PROFILE_PHOTO.src.replace(/\.webp$/, '-800.webp')} 800w, ${PROFILE_PHOTO.src} 1600w`;
const PORTRAIT_SIZES = '(max-width: 760px) 100vw, 45vw';
function aboutHtml() {
  const links = SITE.links.map((l) => `<li><a href="${l.href}" target="_blank" rel="noopener">${l.label}</a></li>`).join('');
  const paras = (a: string[]) => a.map((t) => `<p>${esc(t)}</p>`).join('');
  return `<div class="about-top"><img class="portrait" src="${esc(PROFILE_PHOTO.src)}" srcset="${esc(PORTRAIT_SRCSET)}" sizes="${PORTRAIT_SIZES}" alt="${esc(PROFILE_PHOTO.alt)}" width="1600" height="1061" fetchpriority="high" decoding="async" /><div><p class="lead">${esc(SITE.role)}.</p>
    ${paras(BIO_SHORT)}</div></div>
    <p class="fun">${esc(FUN_NOTE)}</p>
    <section class="contact"><p class="meta letter-label">Write me a letter</p>
    <div class="letter"><form class="letter-form" novalidate><div class="card"><div class="sheet">
      <label>Your name<input name="name" type="text" required maxlength="100" autocomplete="name"></label>
      <label>Your email<input name="email" type="email" required maxlength="200" autocomplete="email"></label>
      <label>Message<textarea name="message" required minlength="2" maxlength="5000" rows="6"></textarea></label>
      <input class="hp" name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button type="submit" class="letter-send">Send</button>
    </div>
    <div class="sheet card-back" inert>
      <div class="pc-left"><p class="pc-from"></p><p class="pc-note">Your letter is on its way.</p><button type="button" class="letter-again">Write another</button></div>
      <div class="pc-right" aria-hidden="true">
        <div class="pc-post"><img class="pc-stamp" src="${base}/stamps/about-600.webp" alt="" width="600" height="409" loading="lazy" decoding="async">
          <svg class="pc-mark" viewBox="0 0 180 84"><circle cx="42" cy="42" r="34"/><circle cx="42" cy="42" r="30"/><text class="pc-day" x="42" y="40"></text><text class="pc-year" x="42" y="54"></text><path d="M82 22q8-7 16 0t16 0 16 0 16 0 16 0 16 0M82 35q8-7 16 0t16 0 16 0 16 0 16 0 16 0M82 48q8-7 16 0t16 0 16 0 16 0 16 0 16 0M82 61q8-7 16 0t16 0 16 0 16 0 16 0 16 0"/></svg></div>
        <div class="pc-to"><span>${esc(SITE.name)}</span><span>matthewsbloomfield.com</span><span></span></div>
      </div>
    </div></div></form></div>
    <p class="letter-status" role="status" aria-live="polite"></p></section>
    <p class="meta">Elsewhere</p><ul class="links">${links}<li><a href="mailto:${SITE.email}">${SITE.email}</a></li></ul>`;
}

/** Drops entries flagged hidden. */
const visible = (c: SiteContent): SiteContent => ({ ...c, projects: c.projects.filter((p) => !p.hidden), crafts: c.crafts.filter((k) => !k.hidden) });

export interface HeroImage { href: string; srcSet?: string; sizes?: string }
/** The image a page shows biggest on first paint. The page markup is built by script, so the static HTML
 *  preloads this to start the download straight away. Must match the markup's src/srcset/sizes exactly. */
export function heroImages(all: SiteContent, path: string[]): HeroImage[] {
  const c = visible(all);
  const withSet = (src: string, sizes: string): HeroImage => { const href = encodeURI(src), srcSet = srcsetValue(src); return srcSet ? { href, srcSet, sizes } : { href }; };
  const [section, slug] = path;
  if (!section) return buildSections(c).map((s) => { const st = stampImage(s.id); return { href: st.src, srcSet: st.srcSet, sizes: st.sizes }; });
  if (section === 'work') {
    const items = workItems(c);
    if (slug) { const hero = safeUrl(items.find((p) => p.slug === slug)?.heroImage); return hero ? [{ href: encodeURI(hero) }] : []; }
    const first = items.map((p) => safeUrl(p.cover || p.heroImage)).find(Boolean);
    return first ? [withSet(first, SIZES.card)] : [];
  }
  if (section === 'posters') { const first = c.posters[0]?.items.find((i) => safeUrl(i.src)); return first ? [withSet(first.src, SIZES.poster)] : []; }
  if (section === 'photography') {
    const roll = c.photography.find((s) => (s.frames || []).some((f) => safeUrl(f.image)));
    const frames = (roll?.frames || []).filter((f) => safeUrl(f.image));
    if (!frames.length) return [];
    const set = frameSrcset(frames[0]);
    return [set ? { href: encodeURI(safeUrl(frames[0].image)), srcSet: set, sizes: isSingle(0, frames.length) ? FRAME_SIZES.single : FRAME_SIZES.pair } : { href: encodeURI(safeUrl(frames[0].image)) }];
  }
  if (section === 'about') return [{ href: PROFILE_PHOTO.src, srcSet: PORTRAIT_SRCSET, sizes: PORTRAIT_SIZES }];
  return [];
}

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
    L('experience', '03', 'Experience', 'Experience', 'a vintage suitcase', experienceHtml()),
    L('photography', '04', 'Photography', 'Photography', 'a Minolta X-700 film camera', photographyHtml(c)),
    L('about', '05', 'About', 'About', 'a halftone portrait of Matt', aboutHtml()),
  ];
}

