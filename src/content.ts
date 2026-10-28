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

// Placeholder copy: swap for real content (one block per section).
const todo = (t: string) => `<p class="todo">${t}</p>`;

export const SITE = {
  name: 'Matt Bloomfield',
  email: 'email@example.com', // TODO: real address
  timeZone: 'America/New_York', // TODO: confirm
  openerDate: 'OCT 2026',
};

export const SECTIONS: Section[] = [
  {
    id: 'projects', no: '01', label: 'Projects', stampName: 'Web & Graphic Design',
    orientation: 'portrait', ratio: 1130 / 1657, alt: 'Stamp 01, Web and Graphic Design, a vintage computer',
    html: `<div class="cards">${[1, 2, 3, 4].map((n) => `
      <article class="card"><div class="card-img" style="--n:${n}"></div>
      <h3>Project title ${n}</h3><p class="meta">Role · Year</p></article>`).join('')}</div>
      ${todo('Placeholder projects. Add images, titles, roles and links.')}`,
  },
  {
    id: 'experience', no: '02', label: 'Experience', stampName: 'Work History',
    orientation: 'landscape', ratio: 1658 / 1130, alt: 'Stamp 02, Work History, a vintage suitcase',
    html: `<ol class="timeline">${[1, 2, 3].map((n) => `
      <li><span class="meta">Years</span><h3>Role title, Company ${n}</h3><p>What you did and shipped.</p></li>`).join('')}</ol>
      ${todo('Placeholder timeline. Add real roles and dates.')}`,
  },
  {
    id: 'about', no: '03', label: 'About', stampName: 'About',
    orientation: 'portrait', ratio: 1130 / 1657, alt: 'Stamp 03, About, a halftone portrait of Matt',
    html: `<p class="lead">Designer and maker. Short, specific introduction goes here.</p>
      <p>A paragraph about how you work, what you care about, and what you are looking for.</p>
      ${todo('Placeholder bio. Add real copy.')}`,
  },
  {
    id: 'crafts', no: '04', label: 'Crafts', stampName: 'Crafts',
    orientation: 'portrait', ratio: 1130 / 1657, alt: 'Stamp 04, Crafts, six pieces of pottery',
    html: `<p class="lead">Pottery and other things made by hand.</p>
      <div class="gallery">${[1, 2, 3, 4, 5, 6].map((n) => `<figure class="shot" style="--n:${n}"><figcaption>Piece ${n}</figcaption></figure>`).join('')}</div>
      ${todo('Placeholder gallery. Add photos with captions and alt text.')}`,
  },
  {
    id: 'photography', no: '05', label: 'Photography', stampName: 'Photography',
    orientation: 'landscape', ratio: 1658 / 1130, alt: 'Stamp 05, Photography, a Minolta X-700 film camera',
    html: `<p class="lead">Shot on film, mostly.</p>
      <div class="gallery wide">${[1, 2, 3, 4, 5, 6].map((n) => `<figure class="shot" style="--n:${n}"><figcaption>Frame ${n}</figcaption></figure>`).join('')}</div>
      ${todo('Placeholder gallery. Add photos with captions and alt text.')}`,
  },
];
