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

const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${path}`;
export const PROFILE_PHOTO = { src: asset('/about/profile.webp'), alt: 'Portrait of Matt in front of a rock wall' };

const p = (title: string, group: string, extra: Partial<Project> = {}): Project => ({ title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), disciplines: [group], ...extra });

export const SEED_PROJECTS: Project[] = [
  p('GearBook', 'Websites', {
    role: 'Co-founder & CMO: design, development & marketing',
    year: 2025,
    summary: 'GearBook is an affiliate gear catalog for outdoor professionals. Members pick the gear they actually use, GearBook builds the tracked affiliate link behind each product, hosts their catalog page, lists their picks on a public marketplace, and pays their share of every sale each month. It is built for professionals (instructors, athletes, educators and others who work in the field) and for enthusiasts who know their gear, and shoppers buy from people who actually use it. Outdoor professionals rarely have the time or the income to market themselves, so GearBook does that work for them. I am the co-founder and CMO, and I built the site with my co-founder Luke Wong, based in Boulder, CO. It is live, actively maintained, and 15 members have signed up so far.',
    heroImage: asset('/websites/gearbook/macbook-1.webp'),
    images: ['macbook-2', 'macbook-3', 'macbook-4', 'phones-white'].map((n) => asset(`/websites/gearbook/${n}.webp`)),
    stack: { Framework: ['Next.js 16', 'React'], Styling: ['Tailwind CSS'], Data: ['Supabase (auth, Postgres, storage)'], Hosting: ['Cloudflare (OpenNext)'], Integrations: ['Impact', 'Partnerize', 'Resend'] },
    href: 'https://www.gearbook.shop/',
    linkLabel: 'Visit site',
  }),
  p('Le Reve', 'Websites', {
    role: 'Design, development & content',
    year: 2025,
    summary: 'Le Rêve is the marketing site for five luxury townhomes in downtown Boca Raton, built for the Gasdaska Verdiglione Conlon Team at Douglas Elliman. It needed to capture leads and inquiries while showing off the finishes, the available residences, and the teams behind the development: Advanced Development Group, Netta Architects and EAJ Services. Details came from several parties, so the hardest part was keeping every spec and claim accurate. Leads go straight to the MLS. I handled the design, development and content, and edited the photography.',
    stack: { Framework: ['Next.js'], Hosting: ['Vercel'], Integrations: ['MLS lead capture'] },
    href: 'https://www.lerevebocaraton.com/',
    linkLabel: 'Visit site',
  }),
  ...['Casa Avenida', 'The Edge Delray'].map((t) => p(t, 'Websites')),
  p('The GVC Team', 'Websites', {
    role: 'Design, development & content',
    year: 2025,
    summary: 'The home of the Gasdaska Verdiglione Conlon Real Estate Team, one of the top real estate teams working across three state markets (NY, NJ & FL). I rebuilt the site in 2025 as a single place where visitors can see what the team can do, learn who they are, and get in touch. I handled the design, development, and content, and I’ve maintained it since.',
    heroImage: asset('/websites/gvc-team-mockup.webp'),
    images: ['macbook-1', 'macbook-2', 'macbook-3', 'macbook-4', 'phones-navy'].map((n) => asset(`/websites/gvc-team/${n}.webp`)),
    stack: { Framework: ['Framer'], Data: ['Framer CMS'] },
    href: 'https://gvcrealestateteam.com/',
    linkLabel: 'Visit site',
  }),
  ...['Liv Portfolio Site', 'GVC Workspace', 'Essays In Bloom'].map((t) => p(t, 'Websites')),
  ...([
    ['Variex', '01-type-specimen', 'Poster'],
    ['Improve Your Golf', '02-golfer', 'Poster'],
    ['The Frog', '03-frog', 'Poster'],
    ['Handbook of Pictorial Symbols', '04-pictorial-symbols', 'Poster'],
    ['I’m Going to the Mountains', '05-mountain-helicopter', 'Poster'],
  ] as const).map(([t, f, d]) => p(t, 'Posters', { summary: d, heroImage: asset(`/posters/${f}.webp`) })),
  ...['Le Reve', 'Casa Avenida', 'Trimble Business Systems'].map((t) => p(t, 'Branding')),
  p('Opus', 'Branding', { summary: 'In progress.' }),
  p('Essays In Bloom', 'Branding', { summary: 'In progress.' }),
  ...['CU Skate Forge', 'Bloom Coffee Table', 'Bloc CNC', 'Topomaps'].map((t) => p(t, 'Projects')),
];

export const SEED_CRAFTS: Craft[] = ['Pottery', 'Skate Rings', 'Recycled Climbing Rope Crafts'].map((title) => ({ title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') }));
