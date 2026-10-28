import { urlFor } from './sanity';

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
  timeZone: 'America/New_York', // TODO: confirm
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
export interface SiteContent {
  projects: Project[]; crafts: Craft[]; experience: Experience[];
  /** Which sections still show placeholder entries. */
  placeholder: { projects: boolean; crafts: boolean; experience: boolean };
}

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
const accents = ['#c4b268', '#c9a0a0', '#8fb3c9', '#7fbf7a', '#a9c0bf'];

/** Clearly identified placeholders, used until Sanity has content. */
export const PLACEHOLDER: SiteContent = {
  placeholder: { projects: true, crafts: true, experience: true },
  projects: [
    // Real asset from Matt's Drive; selection and details are pending his decision.
    { title: 'Gearbook: Just Go Outside', slug: 'gearbook-just-go-outside', summary: 'Video for Gearbook (named from the file). Details and credits to be confirmed.', accent: '#8fb3c9',
      heroImage: `${base}/projects/gearbook-just-go-outside.jpg`, videoUrl: `${base}/projects/gearbook-just-go-outside.mp4`, href: 'https://www.gearbook.shop/catalog/matt-bloomfield', linkLabel: 'Gearbook' },
    ...[2, 3, 4].map((n) => ({ title: `Placeholder project ${n}`, slug: `placeholder-${n}`, summary: 'Project selection is deferred.', disciplines: ['Discipline'], accent: accents[n - 1] })),
  ],
  crafts: [1, 2, 3, 4, 5, 6].map((n) => ({ title: `Placeholder piece ${n}`, slug: `placeholder-craft-${n}` })),
  experience: [1, 2, 3].map((n) => ({ organization: `Organization ${n}`, role: 'Role title', startDate: 'Year', endDate: 'Year', description: 'Placeholder. Experience content has not been supplied.' })),
};

const esc = (s = '') => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
/** Allow only http(s)/relative URLs and plain CSS colours from CMS-sourced values. */
const safeUrl = (u = '') => (/^(https?:\/\/|\/|\.\/)/.test(u) ? u : '');
const safeColor = (v = '') => (/^#[0-9a-f]{3,8}$/i.test(v) ? v : '');
const todo = (t: string) => `<p class="todo">${t}</p>`;
const dates = (e: Experience) => [e.startDate, e.endDate].filter(Boolean).join(' – ');

function projectsHtml(c: SiteContent) {
  const cards = c.projects.map((p, i) => `
    <article class="card">
      <div class="card-img" style="--c:${safeColor(p.accent) || accents[i % accents.length]};${safeUrl(p.heroImage) ? `background-image:url('${encodeURI(safeUrl(p.heroImage))}');background-size:cover` : ''}"></div>
      <h3>${esc(p.title)}</h3>
      <p class="meta">${esc([p.role, p.year, ...(p.disciplines || [])].filter(Boolean).join(' · '))}</p>
      ${p.summary ? `<p>${esc(p.summary)}</p>` : ''}
      ${safeUrl(p.videoUrl) || safeUrl(p.href) ? `<p class="meta">${safeUrl(p.videoUrl) ? `<a href="${esc(safeUrl(p.videoUrl))}" target="_blank" rel="noopener">Watch</a>` : ''}${safeUrl(p.videoUrl) && safeUrl(p.href) ? ' · ' : ''}${safeUrl(p.href) ? `<a href="${esc(safeUrl(p.href))}" target="_blank" rel="noopener">${esc(p.linkLabel || 'Link')}</a>` : ''}</p>` : ''}
    </article>`).join('');
  return `<div class="cards">${cards}</div>${c.placeholder.projects ? todo('Gearbook is a draft from your Drive; the rest are placeholders. Project selection and priorities are deferred.') : ''}`;
}
function experienceHtml(c: SiteContent) {
  const items = c.experience.map((e) => `
    <li><span class="meta">${esc(dates(e))}</span><h3>${esc(e.role)}, ${esc(e.organization)}</h3>${e.description ? `<p>${esc(e.description)}</p>` : ''}</li>`).join('');
  return `<ol class="timeline">${items}</ol>${c.placeholder.experience ? todo('Placeholder timeline. Experience content has not been supplied.') : ''}`;
}
function craftsHtml(c: SiteContent) {
  const shots = c.crafts.map((k, i) => `
    <figure class="shot" style="--c:${accents[i % accents.length]};${safeUrl(k.image) ? `background-image:url('${encodeURI(safeUrl(k.image))}');background-size:cover` : ''}">
      <figcaption>${esc(k.title)}${k.year ? ` · ${k.year}` : ''}</figcaption></figure>`).join('');
  return `<p class="lead">Crafts and experiments, kept separate from Projects.</p><div class="gallery">${shots}</div>${c.placeholder.crafts ? todo('Placeholder gallery. Crafts content has not been supplied.') : ''}`;
}
function photographyHtml() {
  const shots = [1, 2, 3, 4, 5, 6].map((n, i) => `<figure class="shot" style="--c:${accents[i % accents.length]}"><figcaption>Frame ${n}</figcaption></figure>`).join('');
  return `<div class="gallery wide">${shots}</div>${todo('Placeholder gallery. Photography is not in the CMS model yet.')}`;
}
function aboutHtml() {
  const links = SITE.links.map((l) => `<li><a href="${l.href}" target="_blank" rel="noopener">${l.label}</a></li>`).join('');
  return `<p class="lead">${esc(SITE.role)}.</p>
    ${todo('Biography copy has not been supplied. Placeholder.')}
    <p class="meta">Elsewhere</p><ul class="links">${links}<li><a href="mailto:${SITE.email}">${SITE.email}</a></li></ul>`;
}

export function buildSections(c: SiteContent): Section[] {
  return [
    { id: 'projects', no: '01', label: 'Projects', stampName: 'Web & Graphic Design', orientation: 'portrait', ratio: 1130 / 1657, alt: 'Stamp 01, Web and Graphic Design, a vintage computer', html: projectsHtml(c) },
    { id: 'experience', no: '02', label: 'Experience', stampName: 'Work History', orientation: 'landscape', ratio: 1658 / 1130, alt: 'Stamp 02, Work History, a vintage suitcase', html: experienceHtml(c) },
    { id: 'about', no: '03', label: 'About', stampName: 'About', orientation: 'portrait', ratio: 1130 / 1657, alt: 'Stamp 03, About, a halftone portrait of Matt', html: aboutHtml() },
    { id: 'crafts', no: '04', label: 'Crafts', stampName: 'Crafts', orientation: 'portrait', ratio: 1130 / 1657, alt: 'Stamp 04, Crafts, six pieces of pottery', html: craftsHtml(c) },
    { id: 'photography', no: '05', label: 'Photography', stampName: 'Photography', orientation: 'landscape', ratio: 1658 / 1130, alt: 'Stamp 05, Photography, a Minolta X-700 film camera', html: photographyHtml() },
  ];
}

export { urlFor };
