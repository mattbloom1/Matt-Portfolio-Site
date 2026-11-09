import { urlFor } from './sanity';
import { SEED_PHOTOGRAPHY, PROFILE_PHOTO, BIO_SHORT, EDUCATION, FUN_NOTE, SEED_CRAFTS, SEED_EXPERIENCE, SEED_POSTERS, SEED_PROJECTS } from './seed';

export type SectionId = 'projects' | 'posters' | 'experience' | 'about' | 'crafts' | 'photography';

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
  disciplines?: string[]; role?: string; heroImage?: string; /** Card cover; falls back to heroImage */ cover?: string; images?: string[]; imageAlts?: string[]; accent?: string;
  videoUrl?: string; href?: string; linkLabel?: string;
  stack?: Partial<Record<StackGroup, string[]>>;
  /** Optional case-study extras, rendered the same way on any project detail page. */
  extras?: ProjectExtras;
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
  title: string; slug: string; summary?: string; year?: number; role?: string;
  /** Card cover: one animated image (gif or animated webp). */
  cover?: string; /** Large image on the detail page. */ heroImage?: string; image?: string; notes?: string;
  images?: string[]; imageAlts?: string[];
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
function extrasHtml(p: Project) {
  const x = p.extras;
  if (!x) return '';
  const figs = (x.figures || []).filter((f) => safeUrl(f.src)).map((f) => `<figure class="xfig"><img src="${esc(encodeURI(safeUrl(f.src)))}" alt="${esc(f.alt)}" loading="lazy" decoding="async">${f.caption ? `<figcaption>${esc(f.caption)}</figcaption>` : ''}</figure>`).join('');
  const stats = (x.stats || []).map((s) => `<div class="xstat"><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`).join('');
  const notes = (x.notes || []).map((n) => `<div class="xnote"><h3>${esc(n.heading)}</h3><p>${esc(n.body)}</p></div>`).join('');
  return `<div class="detail-extra">${figs ? `<div class="xfigs">${figs}</div>` : ''}${stats ? `<dl class="xstats">${stats}</dl>` : ''}${notes ? `<div class="xnotes">${notes}</div>` : ''}</div>`;
}
const GROUPS = ['Websites', 'Branding', 'Projects', 'Ignite Adaptive Sports'];
/** Cards plus full-screen detail pages, shared by Projects and Crafts. */
function workViews(items: Project[], noun: string, defaultMeta: string) {
  const c = { projects: items };
  const bg = (p: Project, i: number) => `--c:${safeColor(p.accent) || accents[i % accents.length]};${safeUrl(p.heroImage) ? `background-image:url('${encodeURI(safeUrl(p.heroImage))}'),var(--sk-grad);background-size:cover,200% 100%;background-position:center,0 0` : ''}`;
  const links = (p: Project) => [
    safeUrl(p.videoUrl) ? `<a href="${esc(safeUrl(p.videoUrl))}" target="_blank" rel="noopener">Watch</a>` : '',
    safeUrl(p.href) ? `<a href="${esc(safeUrl(p.href))}" target="_blank" rel="noopener">${esc(p.linkLabel || 'Visit')}</a>` : '',
  ].filter(Boolean).join(' · ');
  const cardCover = (p: Project) => safeUrl(p.cover || p.heroImage);
  const card = (p: Project, i: number) => `
    <button type="button" class="card${cardCover(p) ? '' : ' no-img'}" data-detail="d-${esc(p.slug)}">
      <span class="card-img${cardCover(p) ? ' has-img' : ''}" style="--c:${safeColor(p.accent) || accents[i % accents.length]}">${cardCover(p) ? `<img class="card-photo" src="${esc(encodeURI(cardCover(p)))}" alt="" loading="lazy" decoding="async">` : ''}</span>
      <span class="card-over"><span class="card-name">${esc(p.title)}</span><span class="card-sub">${esc([p.role, p.year].filter(Boolean).join(' · '))}</span></span>
    </button>`;
  const siblings = (p: Project) => c.projects.filter((q) => (q.disciplines || [])[0] === (p.disciplines || [])[0]);
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
          ${stackHtml(p)}
          ${links(p) ? `<p class="meta detail-links">${links(p)}</p>` : ''}
        </div>
      </div>
      ${(p.images || []).filter((u) => safeUrl(u)).length ? `<div class="detail-gallery">${(p.images || []).map((u, k) => ({ u, k })).filter(({ u }) => safeUrl(u)).map(({ u, k }) => `<figure class="gimg"><img src="${esc(encodeURI(safeUrl(u)))}" alt="${esc((p.imageAlts || [])[k] || `${p.title} mockup`)}" loading="lazy" decoding="async"></figure>`).join('')}</div>` : ''}
      ${extrasHtml(p)}
    </div>`;
  return { card, detail };
}
function projectsHtml(c: SiteContent) {
  const { card, detail } = workViews(c.projects, 'project', 'Project');
  const groups = [...new Set([...GROUPS, ...c.projects.flatMap((p) => p.disciplines || [])])];
  const html = groups.map((g) => {
    const items = c.projects.filter((p) => (p.disciplines || [])[0] === g);
    return items.length ? `<section><h2 class="group"><span>${esc(g)}</span></h2><div class="cards">${items.map(card).join('')}</div></section>` : '';
  }).join('');
  return `${html}${c.projects.map(detail).join('')}${todo('Titles are from Matt’s list. Images, descriptions and links are still to come.')}`;
}
function experienceHtml(c: SiteContent) {
  const items = c.experience.map((e) => {
    const head = `<span class="meta">${esc(dates(e))}</span><h2>${esc(e.role)}, ${esc(e.organization)}</h2>`;
    return e.description
      ? `<li><details class="job"><summary>${head}<span class="job-toggle" aria-hidden="true"></span></summary><p>${esc(e.description)}</p></details></li>`
      : `<li>${head}</li>`;
  }).join('');
  const edu = `<p class="meta">Education</p><p><strong>${esc(EDUCATION.school)}</strong>, ${esc(EDUCATION.year)}<br>${esc(EDUCATION.detail)}</p>`;
  return `<ol class="timeline">${items}</ol>${edu}${c.placeholder.experience ? todo('Placeholder timeline. Experience content has not been supplied.') : ''}`;
}
function craftsHtml(c: SiteContent) {
  const items: Project[] = c.crafts.map((k) => ({ title: k.title, slug: k.slug, summary: k.summary, year: k.year, role: k.role, cover: k.cover, heroImage: k.heroImage || k.image, images: k.images, imageAlts: k.imageAlts, disciplines: ['Crafts'] }));
  const { card, detail } = workViews(items, 'craft', 'Craft');
  return `<section><div class="cards">${items.map(card).join('')}</div></section>${items.map(detail).join('')}${todo('More crafts are coming. Photos and notes for the rest are still to come.')}`;
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
    <p class="meta">Elsewhere</p><ul class="links">${links}<li><a href="mailto:${SITE.email}">${SITE.email}</a></li></ul>`;
}

/** Plain, text-only outline of the whole site, rendered into the static HTML (inside <noscript>) for crawlers, link readers and no-JS visitors. */
export function outlineHtml(c: SiteContent): string {
  const li = (t: string, d?: string) => `<li><strong>${esc(t)}</strong>${d ? ` ${esc(d)}` : ''}</li>`;
  const groups = [...new Set(c.projects.flatMap((p) => (p.disciplines || [])[0] || []))];
  return `<h1>${esc(SITE.name)}, ${esc(SITE.role)}</h1>
<h2>About</h2>${BIO_SHORT.map((t) => `<p>${esc(t)}</p>`).join('')}
<h2>Projects</h2>${groups.map((g) => `<h3>${esc(g)}</h3><ul>${c.projects.filter((p) => (p.disciplines || [])[0] === g).map((p) => li(p.title, [p.role, p.year].filter(Boolean).join(', '))).join('')}</ul>`).join('')}
<h2>Experience</h2><ul>${c.experience.map((e) => li(`${e.role}, ${e.organization}`, dates(e))).join('')}</ul>
<h2>Crafts</h2><ul>${c.crafts.map((k) => li(k.title, k.role)).join('')}</ul>
<h2>Elsewhere</h2><ul>${SITE.links.map((l) => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('')}<li><a href="mailto:${SITE.email}">${SITE.email}</a></li></ul>`;
}

export function buildSections(c: SiteContent): Section[] {
  const L = (id: SectionId, no: string, label: string, stampName: string, art: string, html: string): Section => ({ id, no, label, stampName, orientation: 'landscape', ratio: 1658 / 1130, alt: `${stampName} stamp, ${art}`, html });
  return [
    L('projects', '01', 'Projects', 'Web & Graphic Design', 'a vintage computer', projectsHtml(c)),
    L('posters', '02', 'Posters', 'Posters', 'two printed posters', postersHtml(c)),
    L('experience', '03', 'Experience', 'Work History', 'a vintage suitcase', experienceHtml(c)),
    L('crafts', '04', 'Crafts', 'Crafts', 'six pieces of pottery', craftsHtml(c)),
    L('photography', '05', 'Photography', 'Photography', 'a Minolta X-700 film camera', photographyHtml(c)),
    L('about', '06', 'About', 'About', 'a halftone portrait of Matt', aboutHtml()),
  ];
}

export { urlFor };
