import { urlFor } from './sanity';
import { SEED_PHOTOGRAPHY, PROFILE_PHOTO, BIO_SHORT, EDUCATION, FUN_NOTE, SEED_CRAFTS, SEED_EXPERIENCE, SEED_PROJECTS } from './seed';

export type SectionId = 'projects' | 'experience' | 'about' | 'crafts' | 'photography';

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
  openerDate: 'OCT 2026',
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mattsbloomfield/' },
    { label: 'GitHub', href: 'https://github.com/mattbloom1/' },
    { label: 'Gearbook', href: 'https://www.gearbook.shop/catalog/matt-bloomfield', linkLabel: 'Gearbook' },
  ],
};

/* ---------- CMS content model (mirrors studio/schemaTypes) ---------- */
/** Tech stack shown the same way on every website card, always in this order. */
export const STACK_GROUPS = ['Framework', 'Styling', 'Data', 'Hosting', 'Integrations'] as const;
export type StackGroup = typeof STACK_GROUPS[number];
export interface Project {
  title: string; slug: string; summary?: string; featured?: boolean; year?: number;
  disciplines?: string[]; role?: string; heroImage?: string; /** Card cover; falls back to heroImage */ cover?: string; images?: string[]; accent?: string;
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
  title: string; slug: string; summary?: string; year?: number; image?: string; notes?: string;
  images?: { src: string; alt: string; w?: number; h?: number }[];
}
export interface Experience {
  organization: string; role: string; startDate?: string; endDate?: string; description?: string;
}
export interface PhotoSeries {
  title: string; slug: string; summary?: string; year?: number; cover?: string; frames?: { image?: string; alt?: string; caption?: string; w?: number; h?: number }[];
}
export interface SiteContent {
  projects: Project[]; crafts: Craft[]; experience: Experience[]; photography: PhotoSeries[];
  /** Which sections still show placeholder entries. */
  placeholder: { projects: boolean; crafts: boolean; experience: boolean; photography: boolean };
}

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
const accents = ['#c4b268', '#c9a0a0', '#8fb3c9', '#7fbf7a', '#a9c0bf'];

/** Matt's supplied content (src/lib/seed.ts); used until Sanity has entries. */
export const PLACEHOLDER: SiteContent = {
  placeholder: { projects: false, crafts: false, experience: false, photography: !SEED_PHOTOGRAPHY.length },
  projects: SEED_PROJECTS,
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
const GROUPS = ['Websites', 'Posters', 'GearBook Posters', 'Branding', 'Projects', 'Ignite Adaptive Sports'];
function projectsHtml(c: SiteContent) {
  const bg = (p: Project, i: number) => `--c:${safeColor(p.accent) || accents[i % accents.length]};${safeUrl(p.heroImage) ? `background-image:url('${encodeURI(safeUrl(p.heroImage))}'),var(--sk-grad);background-size:cover,200% 100%;background-position:center,0 0` : ''}`;
  const links = (p: Project) => [
    safeUrl(p.videoUrl) ? `<a href="${esc(safeUrl(p.videoUrl))}" target="_blank" rel="noopener">Watch</a>` : '',
    safeUrl(p.href) ? `<a href="${esc(safeUrl(p.href))}" target="_blank" rel="noopener">${esc(p.linkLabel || 'Visit')}</a>` : '',
  ].filter(Boolean).join(' · ');
  const card = (p: Project, i: number) => `
    <button type="button" class="card${safeUrl(p.cover || p.heroImage) ? '' : ' no-img'}" data-detail="d-${esc(p.slug)}" aria-label="${esc(p.title)}: view details">
      <span class="card-img${safeUrl(p.cover || p.heroImage) ? ' has-img' : ''}" style="${bg({ ...p, heroImage: p.cover || p.heroImage }, i)}"></span>
      <span class="card-over"><span class="card-name">${esc(p.title)}</span><span class="card-sub">${esc([p.role, p.year].filter(Boolean).join(' · '))}</span></span>
    </button>`;
  const siblings = (p: Project) => c.projects.filter((q) => (q.disciplines || [])[0] === (p.disciplines || [])[0]);
  const stepper = (p: Project) => {
    const sib = siblings(p);
    if (sib.length < 2) return '';
    const k = sib.findIndex((q) => q.slug === p.slug);
    const prev = sib[(k - 1 + sib.length) % sib.length], next = sib[(k + 1) % sib.length];
    return `<nav class="detail-steps" aria-label="Other projects"><button type="button" class="detail-step prev" data-step="d-${esc(prev.slug)}" aria-label="Previous project: ${esc(prev.title)}"><span class="step-dir">previous</span></button><button type="button" class="detail-step next" data-step="d-${esc(next.slug)}" aria-label="Next project: ${esc(next.title)}"><span class="step-dir">next</span></button></nav>`;
  };
  const detail = (p: Project, i: number) => `
    <div class="detail" id="d-${esc(p.slug)}"${(p.extras?.cursorIcons || []).length ? ` data-icon-cursor="${esc(JSON.stringify(p.extras!.cursorIcons!.filter((u) => safeUrl(u)).map((u) => encodeURI(safeUrl(u)))))}"` : ''} role="dialog" aria-modal="true" aria-label="${esc(p.title)}" hidden>
      <button type="button" class="detail-close" data-close aria-label="Close details">Close ×</button>
      ${stepper(p)}
      <div class="detail-inner">
        <div class="detail-img${safeUrl(p.heroImage) ? ' has-img' : ''}" style="${bg(p, i)}"></div>
        <div class="detail-text">
          <p class="meta">${esc((p.disciplines || [])[0] || 'Project')}</p>
          <h2 tabindex="-1">${esc(p.title)}</h2>
          <p class="meta">${esc([p.role, p.year].filter(Boolean).join(' · '))}</p>
          ${p.summary ? `<p class="detail-sum">${esc(p.summary)}</p>` : '<p class="todo">The story, images and details for this project are still to come.</p>'}
          ${stackHtml(p)}
          ${links(p) ? `<p class="meta detail-links">${links(p)}</p>` : ''}
        </div>
      </div>
      ${(p.images || []).filter((u) => safeUrl(u)).length ? `<div class="detail-gallery">${(p.images || []).filter((u) => safeUrl(u)).map((u) => `<figure class="gimg"><img onload="this.parentNode.classList.add('ld')" onerror="this.parentNode.classList.add('ld')" src="${esc(encodeURI(safeUrl(u)))}" alt="${esc(p.title)} mockup" loading="lazy" decoding="async"></figure>`).join('')}</div>` : ''}
      ${extrasHtml(p)}
    </div>`;
  const groups = [...new Set([...GROUPS, ...c.projects.flatMap((p) => p.disciplines || [])])];
  const html = groups.map((g) => {
    const items = c.projects.filter((p) => (p.disciplines || [])[0] === g);
    return items.length ? `<section><h2 class="group"><span>${esc(g)}</span></h2><div class="cards">${items.map(card).join('')}</div></section>` : '';
  }).join('');
  return `${html}${c.projects.map(detail).join('')}${todo('Titles are from Matt’s list. Images, descriptions and links are still to come.')}`;
}
function experienceHtml(c: SiteContent) {
  const items = c.experience.map((e) => {
    const head = `<span class="meta">${esc(dates(e))}</span><h3>${esc(e.role)}, ${esc(e.organization)}</h3>`;
    return e.description
      ? `<li><details class="job"><summary>${head}<span class="job-toggle" aria-hidden="true"></span></summary><p>${esc(e.description)}</p></details></li>`
      : `<li>${head}</li>`;
  }).join('');
  const edu = `<p class="meta">Education</p><p><strong>${esc(EDUCATION.school)}</strong>, ${esc(EDUCATION.year)}<br>${esc(EDUCATION.detail)}</p>`;
  return `<ol class="timeline">${items}</ol>${edu}${c.placeholder.experience ? todo('Placeholder timeline. Experience content has not been supplied.') : ''}`;
}
function craftsHtml(c: SiteContent) {
  const done = c.crafts.filter((k) => k.images?.length);
  const rest = c.crafts.filter((k) => !k.images?.length);
  const sections = done.map((k) => {
    const imgs = (k.images || []).filter((f) => safeUrl(f.src)).map((f) => `<figure class="gimg"><img onload="this.parentNode.classList.add('ld')" onerror="this.parentNode.classList.add('ld')" src="${esc(encodeURI(safeUrl(f.src)))}" alt="${esc(f.alt)}"${f.w && f.h ? ` width="${f.w}" height="${f.h}"` : ''} loading="lazy" decoding="async"></figure>`).join('');
    return `<section class="roll"><h3 class="series">${esc(k.title)}${k.year ? ` <span class="series-year">${k.year}</span>` : ''}</h3>${k.summary ? `<p>${esc(k.summary)}</p>` : ''}${k.notes ? `<p class="meta">${esc(k.notes)}</p>` : ''}<div class="detail-gallery roll-gallery">${imgs}</div></section>`;
  }).join('');
  const tiles = rest.map((k, i) => `
    <figure class="shot${safeUrl(k.image) ? ' has-img' : ''}" style="--c:${accents[i % accents.length]};${safeUrl(k.image) ? `background-image:url('${encodeURI(safeUrl(k.image))}'),var(--sk-grad);background-size:cover,200% 100%;background-position:center,0 0` : ''}">
      <figcaption>${esc(k.title)}${k.year ? ` · ${k.year}` : ''}</figcaption></figure>`).join('');
  return `${sections}${tiles ? `<div class="gallery">${tiles}</div>` : ''}${rest.length ? todo('More crafts are coming. Photos and notes for the rest are still to come.') : ''}`;
}
function photographyHtml(c: SiteContent) {
  const series = c.photography.map((s) => {
    const frames = (s.frames || []).filter((f) => safeUrl(f.image));
    if (!frames.length) return `<section><h3 class="series">${esc(s.title)}</h3><div class="gallery wide"><figure class="shot"></figure></div></section>`;
    const imgs = frames.map((f) => `<figure class="gimg"><img onload="this.parentNode.classList.add('ld')" onerror="this.parentNode.classList.add('ld')" src="${esc(encodeURI(safeUrl(f.image)))}" alt="${esc(f.alt || `${s.title} film roll`)}"${f.w && f.h ? ` width="${f.w}" height="${f.h}"` : ''} loading="lazy" decoding="async"></figure>`).join('');
    return `<section class="roll"><h3 class="series">${esc(s.title)}${s.year ? ` <span class="series-year">${s.year}</span>` : ''}</h3>${s.summary ? `<p>${esc(s.summary)}</p>` : ''}<div class="detail-gallery roll-gallery">${imgs}</div></section>`;
  }).join('');
  return `${series}${c.placeholder.photography ? todo('Placeholder. Photography content has not been supplied.') : ''}`;
}
function aboutHtml() {
  const links = SITE.links.map((l) => `<li><a href="${l.href}" target="_blank" rel="noopener">${l.label}</a></li>`).join('');
  const paras = (a: string[]) => a.map((t) => `<p>${esc(t)}</p>`).join('');
  return `<div class="about-top"><img class="portrait" src="${esc(PROFILE_PHOTO.src)}" alt="${esc(PROFILE_PHOTO.alt)}" width="1600" height="1061" loading="lazy" decoding="async" /><div><p class="lead">${esc(SITE.role)}.</p>
    ${paras(BIO_SHORT)}</div></div>
    <p class="fun">${esc(FUN_NOTE)}</p>
    <p class="meta">Elsewhere</p><ul class="links">${links}<li><a href="mailto:${SITE.email}">${SITE.email}</a></li></ul>`;
}

export function buildSections(c: SiteContent): Section[] {
  return [
    { id: 'projects', no: '01', label: 'Projects', stampName: 'Web & Graphic Design', orientation: 'landscape', ratio: 1658 / 1130, alt: 'Stamp 01, Web and Graphic Design, a vintage computer', html: projectsHtml(c) },
    { id: 'experience', no: '02', label: 'Experience', stampName: 'Work History', orientation: 'landscape', ratio: 1658 / 1130, alt: 'Stamp 02, Work History, a vintage suitcase', html: experienceHtml(c) },
    { id: 'crafts', no: '03', label: 'Crafts', stampName: 'Crafts', orientation: 'landscape', ratio: 1658 / 1130, alt: 'Stamp 03, Crafts, six pieces of pottery', html: craftsHtml(c) },
    { id: 'photography', no: '04', label: 'Photography', stampName: 'Photography', orientation: 'landscape', ratio: 1658 / 1130, alt: 'Stamp 04, Photography, a Minolta X-700 film camera', html: photographyHtml(c) },
    { id: 'about', no: '05', label: 'About', stampName: 'About', orientation: 'landscape', ratio: 1658 / 1130, alt: 'Stamp 05, About, a halftone portrait of Matt', html: aboutHtml() },
  ];
}

export { urlFor };
