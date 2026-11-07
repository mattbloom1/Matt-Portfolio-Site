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
  { organization: 'GVC', role: 'Graphic Design, 3D Modelling, Web Design', startDate: 'August 2025', endDate: 'Present', description: 'Full-time graphic designer on the Gasdaska Verdiglione Conlon Team at Douglas Elliman. I design and build marketing websites for new developments, including Le Rêve and Casa Avenida,, alongside graphic design and 3D modelling for the team.' },
  { organization: 'Trimble', role: 'Business Systems Management & Design', startDate: 'May 2025', endDate: 'August 2025', description: 'Created intranet pages for the DevOps, Change Management and Business Systems teams, and wrote posts that kept stakeholders up to date on Trimble’s software development cycle. Designed a brand identity for the Business Systems team, including a logo, marketing assets and a voice.' },
  { organization: 'Environmental Center, University of Colorado Boulder', role: 'Graphic Designer', startDate: 'May 2022', endDate: 'August 2025', description: 'Designed social posts promoting sustainability and an eco-conscious mindset across the campus community. Grew engagement by 10% and helped build the largest audience the account has had in its ten years, reaching 52,886 people in a single month.' },
  { organization: 'millerBlaker, Bronx, NY', role: 'Associate Project Manager & Intern on Engineering Team', startDate: 'May 2024', endDate: 'August 2024', description: 'Worked through the full architectural millwork workflow: client relations, drafting, engineering, estimating and in-house fabrication. Contributed to high-profile projects including Google team pods, Morgan Stanley and L’Oréal.' },
  { organization: 'Free Float Media LLC, Boulder, CO', role: 'Web Developer', startDate: 'May 2023', endDate: 'October 2023', description: 'Strengthened brand recognition and cohesion for Free Float Media across several websites and social channels, and reviewed and improved digital design and layout.' },
  { organization: 'Gravity Vault Indoor Rock Climbing, Upper Saddle River, NJ', role: 'Instructor', startDate: 'May 2022', endDate: 'August 2023' },
  { organization: 'Woodward Camps, Woodward, PA', role: 'Recreational Staff', startDate: 'May 2021', endDate: 'August 2022' },
  { organization: 'Ignite Adaptive Sports', role: 'Pro Bono Graphic Design & Event Marketing, On-Snow Volunteer', description: 'Unpaid design and event marketing work for a nonprofit that opens up snowsports to athletes of all ages, disabilities and financial circumstances at Eldora Mountain Resort. I also volunteer on the snow, supporting athletes in their lessons.' },
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
    images: ['macbook-2', 'macbook-3', 'macbook-4', 'phones-gray'].map((n) => asset(`/websites/gearbook/${n}.webp`)),
    stack: { Framework: ['Next.js 16', 'React'], Styling: ['Tailwind CSS'], Data: ['Supabase (auth, Postgres, storage)'], Hosting: ['Cloudflare (OpenNext)'], Integrations: ['Impact', 'Partnerize', 'Resend'] },
    href: 'https://www.gearbook.shop/',
    linkLabel: 'Visit site',
  }),
  p('Le Reve', 'Websites', {
    role: 'Design, development & content',
    year: 2025,
    summary: 'Le Rêve is the marketing site for five luxury townhomes in downtown Boca Raton, built for the Gasdaska Verdiglione Conlon Team at Douglas Elliman. It needed to capture leads and inquiries while showing off the finishes, the available residences, and the teams behind the development: Advanced Development Group, Netta Architects and EAJ Services. Details came from several parties, so the hardest part was keeping every spec and claim accurate. Leads go straight to the MLS, and the site has brought in 23 leads so far on roughly $5 million residences. I handled the design, development and content, including the homepage hero video and the on-brand stylized elements, and edited the photography.',
    heroImage: asset('/websites/le-reve-macbook-1.webp'),
    images: ['macbook-2', 'macbook-3', 'macbook-4', 'phones'].map((n) => asset(`/websites/le-reve-${n}.webp`)),
    stack: { Framework: ['Next.js', 'React'], Hosting: ['Vercel'], Integrations: ['MLS lead capture', 'Vercel Analytics', 'Vercel Speed Insights'] },
    href: 'https://www.lerevebocaraton.com/',
    linkLabel: 'Visit site',
  }),
  p('Casa Avenida', 'Websites', {
    role: 'Design, development & content',
    year: 2025,
    summary: 'Casa Avenida is the marketing site for eight luxury townhome-style condominiums one block from Atlantic Avenue in downtown Delray Beach. I built it in early 2025 for the Gasdaska Verdiglione Conlon Team at Douglas Elliman, with the developers Kastelo Development and 4TRO Development and Capital and RWB/Linares Architecture. The site captures inquiries and leads while presenting the residences, finishes, renderings and a 360 virtual tour. It was my first real client website, so I learned a lot on the fly. I handled the design, development and content, and assisted on the renderings. Three of the eight residences have sold so far. It is public and still maintained.',
    heroImage: asset('/websites/casa-avenida-macbook-1.webp'),
    images: ['macbook-2', 'macbook-3', 'macbook-4', 'phones'].map((n) => asset(`/websites/casa-avenida-${n}.webp`)),
    stack: { Framework: ['Next.js 14', 'React'], Styling: ['Tailwind CSS', 'Motion'], Data: ['JSON content files'], Hosting: ['Vercel'], Integrations: ['Resend', 'Google Sheets', 'MailerLite', 'Google Maps', 'reCAPTCHA', 'Vercel Analytics'] },
    href: 'https://casaavenidadelray.com/',
    linkLabel: 'Visit site',
  }),
  p('The Edge Delray', 'Websites', {
    role: 'Design, development & content',
    year: 2026,
    summary: 'The Edge is the marketing site for seven luxury townhomes in two four-story buildings in Delray Beach, built for the Gasdaska Verdiglione Conlon Team at Douglas Elliman, with Advanced Development Group as developer and Netta Architects as architect. It presents the floor plans, the location and the teams behind the project, and captures inquiries ahead of launch. The site is built but not live yet. I handled the design, development and content.',
    heroImage: asset('/websites/the-edge-delray-macbook-1.webp'),
    images: ['macbook-2', 'macbook-3', 'macbook-4', 'phones'].map((n) => asset(`/websites/the-edge-delray-${n}.webp`)),
    stack: { Framework: ['Framer'] },
  }),
  p('Pictorial Symbols Library', 'Websites', {
    role: 'Design & development',
    year: 2026,
    summary: 'A searchable library of 3,133 pictogram icons that I digitized from the 1976 Dover book Handbook of Pictorial Symbols. Each icon went through the same pipeline: scan, crop, vector trace, then name. The site lets you search by name, filter by category, sort, jump to a random icon, star favorites and download any icon as an SVG. A References page credits the source book. It is an archival personal project, not an openly licensed icon set.',
    heroImage: asset('/websites/pictorial-symbols/macbook-1.webp'),
    images: ['macbook-2', 'macbook-3', 'macbook-4', 'phones-gray'].map((n) => asset(`/websites/pictorial-symbols/${n}.webp`)),
    stack: { Framework: ['Hand-coded HTML, CSS & JavaScript'], Styling: ['Custom brand tokens', 'DM Sans', 'DM Mono', 'Instrument Serif'], Data: ['SVG files with a CSV index'], Hosting: ['GitHub Pages'] },
    href: 'https://mattbloom1.github.io/pictorial-symbols-icons/',
    linkLabel: 'Visit site',
  }),
  p('Reseller Ledger', 'Websites', {
    role: 'Design & development',
    year: 2026,
    summary: 'A private, single-user tracker for reselling that follows each item from purchase to listing to sale. Buying ten of something creates ten individually traceable items, each with its own cost, and shared charges like tax and shipping are split across them to the penny. A four-column board (Arriving, In hand, Listed, Sold) shows what needs doing next, and an overview compares cash against profit. Amounts that are not known stay unknown instead of being guessed. The login-only app is not public, so every screen shown here uses sample data.',
    heroImage: asset('/websites/reseller-ledger/macbook-1.webp'),
    images: ['macbook-2', 'macbook-3', 'macbook-4', 'phones-gray'].map((n) => asset(`/websites/reseller-ledger/${n}.webp`)),
    stack: { Framework: ['React 19', 'TypeScript', 'Vite'], Data: ['Supabase (Postgres, Auth)'], Hosting: ['Cloudflare Workers Static Assets'], Integrations: ['Vitest', 'Playwright'] },
  }),
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
  p('Client Portfolio Site', 'Websites', {
    role: 'Design & development',
    year: 2026,
    summary: 'A fashion portfolio for Liv Polani, built to feel like a designer’s desk rather than a template. The home page is a paper collage of scanned scraps, lace and tape, with an ink-bleed hover effect, and the work lives in a ledger-style project register. Each project page carries a full case study (Endure, Distorted Bloom, Desert Wildflower, The Sweat Set and more) exported from Canva, and the résumé on the About page is embedded live from Canva so it never goes out of date. I handled the design and development.',
    heroImage: asset('/websites/liv-portfolio/macbook-1.webp'),
    images: ['macbook-2', 'macbook-3', 'macbook-4', 'phones-gray'].map((n) => asset(`/websites/liv-portfolio/${n}.webp`)),
    stack: { Framework: ['Next.js 15', 'React 19', 'TypeScript'], Styling: ['Custom CSS', 'SVG filters', 'Google Fonts'], Hosting: ['GitHub Pages (static export)'], Integrations: ['Canva embeds'] },
    href: 'https://livpolani.com',
    linkLabel: 'Visit site',
  }),
  ...([
    ['Variex', '01-type-specimen', 'Poster'],
    ['Improve Your Golf', '02-golfer', 'Poster'],
    ['The Frog', '03-frog', 'Poster'],
    ['Handbook of Pictorial Symbols', '04-pictorial-symbols', 'Poster'],
    ['I’m Going to the Mountains', '05-mountain-helicopter', 'Poster'],
  ] as const).map(([t, f, d]) => p(t, 'Posters', { summary: d, heroImage: asset(`/posters/${f}.webp`) })),
  ...([
    ['Bookmark Cutout', 'bookmark-cutout'],
    ['Evan Text', 'evan-text'],
    ['Item Grid', 'item-grid'],
    ['Luke', 'luke'],
    ['Skier Bookmark', 'skier-bookmark'],
    ['Skiers Walking', 'skiers-walking'],
  ] as const).map(([t, f]) => p(t, 'GearBook Pre-Launch Posters', { summary: 'GearBook pre-launch poster', heroImage: asset(`/posters/gearbook/${f}.webp`) })),
  p('Signup Deal', 'GearBook Post-Launch Posters', { summary: 'GearBook post-launch poster', heroImage: asset('/posters/gearbook/posters-signupdeal.webp') }),
  ...['Le Reve', 'Casa Avenida', 'Trimble Business Systems'].map((t) => p(t, 'Branding')),
  p('Opus', 'Branding', { summary: 'In progress.' }),
  p('Essays In Bloom', 'Branding', { summary: 'In progress.' }),
  ...['CU Skate Forge', 'Bloom Coffee Table', 'Bloc CNC', 'Topomaps'].map((t) => p(t, 'Projects')),
];

export const SEED_CRAFTS: Craft[] = ['Pottery', 'Skate Rings', 'Recycled Climbing Rope Crafts'].map((title) => ({ title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') }));
