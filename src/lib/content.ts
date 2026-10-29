import { urlFor } from './sanity';
import { PROFILE_PHOTO, BIO_SHORT, EDUCATION, FUN_NOTE, SEED_CRAFTS, SEED_EXPERIENCE, SEED_PROJECTS } from './seed';

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
  role: 'Creative Technologist & Director',
  email: 'matthewb3333@gmail.com',
  openerDate: 'OCT 2026',
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mattsbloomfield/' },
    { label: 'GitHub', href: 'https://github.com/mattbloom1/' },
    { label: 'Gearbook', href: 'https://www.gearbook.shop/catalog/matt-bloomfield', linkLabel: 'Gearbook' },
  ],
};

/* ---------- CMS content model (mirrors studio/schemaTypes) ---------- */
export interface Project {
  title: string; slug: string; summary?: string; featured?: boolean; year?: number;
  disciplines?: string[]; role?: string; heroImage?: string; accent?: string;
  videoUrl?: string; href?: string; linkLabel?: string;
}
export interface Craft {
  title: string; slug: string; summary?: string; year?: number; image?: string; notes?: string;
}
export interface Experience {
  organization: string; role: string; startDate?: string; endDate?: string; description?: string;
}
export interface PhotoSeries {
  title: string; slug: string; summary?: string; year?: number; cover?: string; frames?: { image?: string; alt?: string; caption?: string }[];
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
  placeholder: { projects: false, crafts: false, experience: false, photography: true },
  projects: SEED_PROJECTS,
  crafts: SEED_CRAFTS,
  experience: SEED_EXPERIENCE,
  photography: [{ title: 'Placeholder series', slug: 'placeholder-series', summary: 'Photography content has not been supplied.' }],
};

const esc = (s = '') => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
/** Allow only http(s)/relative URLs and plain CSS colours from CMS-sourced values. */
const safeUrl = (u = '') => (/^(https?:\/\/|\/|\.\/)/.test(u) ? u : '');
const safeColor = (v = '') => (/^#[0-9a-f]{3,8}$/i.test(v) ? v : '');
const todo = (t: string) => `<p class="todo">${t}</p>`;
const dates = (e: Experience) => [e.startDate, e.endDate].filter(Boolean).join(' – ');

const GROUPS = ['Websites', 'Posters', 'Branding', 'Projects', 'Ignite Adaptive Sports'];
function projectsHtml(c: SiteContent) {
  const card = (p: Project, i: number) => `
    <article class="card">
      <div class="card-img" role="img" aria-label="${esc(p.title)}" style="--c:${safeColor(p.accent) || accents[i % accents.length]};${safeUrl(p.heroImage) ? `background-image:url('${encodeURI(safeUrl(p.heroImage))}');background-size:cover` : ''}"></div>
      <h3>${esc(p.title)}</h3>
      <p class="meta">${esc([p.role, p.year].filter(Boolean).join(' · '))}</p>
      ${p.summary ? `<p>${esc(p.summary)}</p>` : ''}
      ${safeUrl(p.videoUrl) || safeUrl(p.href) ? `<p class="meta">${safeUrl(p.videoUrl) ? `<a href="${esc(safeUrl(p.videoUrl))}" target="_blank" rel="noopener">Watch</a>` : ''}${safeUrl(p.videoUrl) && safeUrl(p.href) ? ' · ' : ''}${safeUrl(p.href) ? `<a href="${esc(safeUrl(p.href))}" target="_blank" rel="noopener">${esc(p.linkLabel || 'Link')}</a>` : ''}</p>` : ''}
    </article>`;
  const groups = [...new Set([...GROUPS, ...c.projects.flatMap((p) => p.disciplines || [])])];
  const html = groups.map((g) => {
    const items = c.projects.filter((p) => (p.disciplines || [])[0] === g);
    return items.length ? `<section><h2 class="group">${esc(g)}</h2><div class="cards">${items.map(card).join('')}</div></section>` : '';
  }).join('');
  return `${html}${todo('Titles are from Matt’s list. Images, descriptions and links are still to come.')}`;
}
function experienceHtml(c: SiteContent) {
  const items = c.experience.map((e) => `
    <li><span class="meta">${esc(dates(e))}</span><h3>${esc(e.role)}, ${esc(e.organization)}</h3>${e.description ? `<p>${esc(e.description)}</p>` : ''}</li>`).join('');
  const edu = `<p class="meta">Education</p><p><strong>${esc(EDUCATION.school)}</strong>, ${esc(EDUCATION.year)}<br>${esc(EDUCATION.detail)}</p>`;
  return `<ol class="timeline">${items}</ol>${edu}${c.placeholder.experience ? todo('Placeholder timeline. Experience content has not been supplied.') : ''}`;
}
function craftsHtml(c: SiteContent) {
  const shots = c.crafts.map((k, i) => `
    <figure class="shot" style="--c:${accents[i % accents.length]};${safeUrl(k.image) ? `background-image:url('${encodeURI(safeUrl(k.image))}');background-size:cover` : ''}">
      <figcaption>${esc(k.title)}${k.year ? ` · ${k.year}` : ''}</figcaption></figure>`).join('');
  return `<div class="gallery">${shots}</div>${todo('Titles are from Matt’s list; photos and notes are still to come.')}`;
}
function photographyHtml(c: SiteContent) {
  const series = c.photography.map((s) => {
    const frames = (s.frames?.length ? s.frames : s.cover ? [{ image: s.cover, alt: s.title }] : []);
    const shots = (frames.length ? frames : [1, 2, 3].map(() => ({}) as { image?: string; alt?: string; caption?: string })).map((f, i) => `
      <figure class="shot" style="--c:${accents[i % accents.length]};${safeUrl(f.image) ? `background-image:url('${encodeURI(safeUrl(f.image))}');background-size:cover` : ''}" ${f.alt ? `role="img" aria-label="${esc(f.alt)}"` : ''}>
        ${f.caption ? `<figcaption>${esc(f.caption)}</figcaption>` : ''}</figure>`).join('');
    return `<section><h3 class="series">${esc(s.title)}${s.year ? ` · ${s.year}` : ''}</h3>${s.summary ? `<p>${esc(s.summary)}</p>` : ''}<div class="gallery wide">${shots}</div></section>`;
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
    { id: 'projects', no: '01', label: 'Projects', stampName: 'Web & Graphic Design', orientation: 'portrait', ratio: 1130 / 1657, alt: 'Stamp 01, Web and Graphic Design, a vintage computer', html: projectsHtml(c) },
    { id: 'experience', no: '02', label: 'Experience', stampName: 'Work History', orientation: 'landscape', ratio: 1658 / 1130, alt: 'Stamp 02, Work History, a vintage suitcase', html: experienceHtml(c) },
    { id: 'about', no: '03', label: 'About', stampName: 'About', orientation: 'portrait', ratio: 1130 / 1657, alt: 'Stamp 03, About, a halftone portrait of Matt', html: aboutHtml() },
    { id: 'crafts', no: '04', label: 'Crafts', stampName: 'Crafts', orientation: 'portrait', ratio: 1130 / 1657, alt: 'Stamp 04, Crafts, six pieces of pottery', html: craftsHtml(c) },
    { id: 'photography', no: '05', label: 'Photography', stampName: 'Photography', orientation: 'landscape', ratio: 1658 / 1130, alt: 'Stamp 05, Photography, a Minolta X-700 film camera', html: photographyHtml(c) },
  ];
}

export { urlFor };
