import type { Craft, Experience, Project } from './content';

/**
 * Content supplied by Matt (verbatim). Used until the Sanity dataset has entries.
 * Entries with only a title are real list items whose details/media are still to come.
 */
export const BIO_SHORT = [
  'Currently, I work with the GVC team at Douglas Elliman as a full-time graphic designer. I am a Creative Technology and Design BS graduate from the University of Colorado Boulder, with a minor in Computer Science that allows me to approach problems with a technical view. Previously, I worked at Trimble designing people-focused solutions for Business Systems and Change Management.',
  'I bring a dynamic approach to my pursuits and am looking to gain industry experience in software, hardware, and infrastructure. I have the passion and experience to create tools, techniques, and technologies that shape how people interact with and relate to the world.',
];

export const BIO_LONG = [
  'I’m Matt — a Creative Technology & Design graduate from the University of Colorado Boulder with a minor in Computer Science. I approach every project at the intersection of design and engineering, blending visual storytelling with technical execution. Whether I’m building digital experiences, prototyping physical products, or exploring new fabrication methods, I’m driven by the idea that thoughtful design can shape how people interact with the world around them.',
  'By day, I work as a graphic designer with the GVC team at Douglas Elliman, creating polished visual systems and marketing materials. Previously, I worked at Trimble designing people-focused solutions for Business Systems and Change Management. Across roles — from web developer to climbing instructor to associate project manager — I’ve learned how to think structurally, communicate clearly, and build with intention.',
  'Crafting and creating is at the core of who I am. I’m drawn to projects that bridge digital and physical spaces — CAD, fabrication, branding, systems thinking, and interaction design. I care deeply about making tools and experiences that are not only functional, but meaningful.',
];

export const EDUCATION = { year: '’25', school: 'University of Colorado Boulder', detail: 'Creative Technology and Design BS | Computer Science Minor' };
export const FUN_NOTE = 'Owner of a 2003 Eurovan!';

export const SEED_EXPERIENCE: Experience[] = [
  { organization: 'GVC', role: 'Graphic Design, 3D Modelling, Web Design', startDate: 'August 2025', endDate: 'Present' },
  { organization: 'Trimble', role: 'Business Systems Management & Design', startDate: 'May 2025', endDate: 'August 2025' },
  { organization: 'Environmental Center, University of Colorado Boulder', role: 'Graphic Designer', startDate: 'August 2023', endDate: 'May 2025' },
  { organization: 'millerBlaker, Bronx, NY', role: 'Associate Project Manager & Intern on Engineering Team', startDate: 'May 2024', endDate: 'August 2024' },
  { organization: 'Free Float Media LLC, Boulder, CO', role: 'Web Developer', startDate: 'May 2023', endDate: 'October 2023' },
  { organization: 'Gravity Vault Indoor Rock Climbing, Upper Saddle River, NJ', role: 'Instructor', startDate: 'May 2022', endDate: 'August 2023' },
  { organization: 'Woodward Camps, Woodward, PA', role: 'Recreational Staff', startDate: 'May 2021', endDate: 'August 2022' },
  { organization: 'Ignite Adaptive Sports', role: 'Volunteer: Graphic Design and On the Slopes' },
];

const p = (title: string, group: string, extra: Partial<Project> = {}): Project => ({ title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), disciplines: [group], ...extra });

export const SEED_PROJECTS: Project[] = [
  ...['GearBook', 'Le Reve', 'Casa Avenida', 'The Edge Delray', 'The GVC Team', 'Liv Portfolio Site', 'GVC Workspace', 'Essays In Bloom'].map((t) => p(t, 'Websites')),
  p('Posters', 'Posters', { summary: 'A selection to come.' }),
  ...['Le Reve', 'Casa Avenida', 'Trimble Business Systems'].map((t) => p(t, 'Branding')),
  p('Opus', 'Branding', { summary: 'In progress.' }),
  p('Essays In Bloom', 'Branding', { summary: 'In progress.' }),
  ...['CU Skate Forge', 'Bloom Coffee Table', 'Bloc CNC', 'Topomaps'].map((t) => p(t, 'Projects')),
];

export const SEED_CRAFTS: Craft[] = ['Pottery', 'Skate Rings', 'Recycled Climbing Rope Crafts'].map((title) => ({ title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') }));
