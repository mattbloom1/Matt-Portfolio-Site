import type { Craft, Experience, PhotoSeries, PosterSet, Project } from './content';
import photoManifest from './photography.json';

/**
 * Content supplied by Matt (verbatim). Used until the Sanity dataset has entries.
 * Entries with only a title are real list items whose details/media are still to come.
 */
export const BIO_SHORT = [
  'Currently, I work with the GVC team at Douglas Elliman as a full-time graphic designer. I am a Creative Technology and Design BS graduate from the University of Colorado Boulder, with a minor in Computer Science that allows me to approach problems with a technical view. Previously, I worked at Trimble designing people-focused solutions for Business Systems and Change Management.',
  'I bring a dynamic approach to my pursuits and am looking to gain industry experience in software, hardware, and infrastructure. I have the passion and experience to create tools, techniques, and technologies that shape how people interact with and relate to the world.',
  // DRAFT (not yet reviewed by Matt): built only from facts already on the site (bio, Experience, Photography). Edit freely.
  'Most of my work sits between design and engineering: websites, branding, CAD and fabrication, and the systems that hold them together. Outside the studio, I have taught climbing, volunteered on the slopes with Ignite Adaptive Sports, and shot film.',
];

export const BIO_LONG = [
  'I’m Matt — a Creative Technology & Design graduate from the University of Colorado Boulder with a minor in Computer Science. I approach every project at the intersection of design and engineering, blending visual storytelling with technical execution. Whether I’m building digital experiences, prototyping physical products, or exploring new fabrication methods, I’m driven by the idea that thoughtful design can shape how people interact with the world around them.',
  'By day, I work as a graphic designer with the GVC team at Douglas Elliman, creating polished visual systems and marketing materials. Previously, I worked at Trimble designing people-focused solutions for Business Systems and Change Management. Across roles — from web developer to climbing instructor to associate project manager — I’ve learned how to think structurally, communicate clearly, and build with intention.',
  'Crafting and creating is at the core of who I am. I’m drawn to projects that bridge digital and physical spaces — CAD, fabrication, branding, systems thinking, and interaction design. I care deeply about making tools and experiences that are not only functional, but meaningful.',
];

export const EDUCATION = { year: '’25', school: 'University of Colorado Boulder', detail: 'Creative Technology and Design BS | Computer Science Minor' };
export const FUN_NOTE = 'Owner of a 2003 Eurovan!';

export const SEED_EXPERIENCE: Experience[] = [
  { organization: 'GVC', role: 'Graphic Design, 3D Modelling, Web Design', startDate: 'August 2025', endDate: 'Present', description: 'Full-time graphic designer on the Gasdaska Verdiglione Conlon Team at Douglas Elliman. Designs and builds marketing websites for new developments, including Le Rêve and Casa Avenida, alongside graphic design and 3D modelling for the team.' },
  { organization: 'GearBook, Boulder, CO', role: 'Co-founder & CMO', startDate: '2025', endDate: 'Present', description: 'Co-founded an affiliate gear catalog for outdoor professionals with Luke Wong. Handles design, development, content, marketing, partner integrations and the legal side, and has signed up 15 members so far.' },
  { organization: 'Trimble', role: 'Business Systems Management & Design', startDate: 'May 2025', endDate: 'August 2025', description: 'Created intranet pages for the DevOps, Change Management and Business Systems teams, and wrote posts that kept stakeholders up to date on Trimble’s software development cycle. Designed a brand identity for the Business Systems team, including a logo, marketing assets and a voice.' },
  { organization: 'Environmental Center, University of Colorado Boulder', role: 'Graphic Designer', startDate: 'May 2022', endDate: 'August 2025', description: 'Designed social posts promoting sustainability and an eco-conscious mindset across the campus community. Grew engagement by 10% and helped build the largest audience the account has had in its ten years, reaching 52,886 people in a single month.' },
  { organization: 'millerBlaker, Bronx, NY', role: 'Associate Project Manager & Intern on Engineering Team', startDate: 'May 2024', endDate: 'August 2024', description: 'Worked through the full architectural millwork workflow: client relations, drafting, engineering, estimating and in-house fabrication. Contributed to high-profile projects including Google team pods, Morgan Stanley and L’Oréal.' },
  { organization: 'Free Float Media LLC, Boulder, CO', role: 'Web Developer', startDate: 'May 2023', endDate: 'October 2023', description: 'Strengthened brand recognition and cohesion for Free Float Media across several websites and social channels, and reviewed and improved digital design and layout.' },
  { organization: 'Gravity Vault Indoor Rock Climbing, Upper Saddle River, NJ', role: 'Instructor', startDate: 'May 2022', endDate: 'August 2023' },
  { organization: 'Woodward Camps, Woodward, PA', role: 'Recreational Staff', startDate: 'May 2021', endDate: 'August 2022' },
  { organization: 'Ignite Adaptive Sports', role: 'Pro Bono Graphic Design & Event Marketing, On-Snow Volunteer', startDate: 'May 2026', endDate: 'Present', description: 'Unpaid design and event marketing work for a nonprofit that opens up snowsports to athletes of all ages, disabilities and financial circumstances at Eldora Mountain Resort, plus on-snow volunteering that supports athletes in their lessons.' },
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
    cover: asset('/websites/covers/gearbook.webp'),
    images: ['macbook-2', 'macbook-3', 'macbook-4', 'phones-gray'].map((n) => asset(`/websites/gearbook/${n}.webp`)),
    stack: { Framework: ['Next.js 16', 'React'], Styling: ['Tailwind CSS'], Data: ['Supabase (auth, Postgres, storage)'], Hosting: ['Cloudflare (OpenNext)'], Integrations: ['Impact', 'Partnerize', 'Resend'] },
    href: 'https://www.gearbook.shop/',
    linkLabel: 'Visit site',
  }),
  p('Le Reve', 'Developments', {
    role: 'Design, development & content',
    year: 2025,
    summary: 'Le Rêve is the marketing site for five luxury townhomes in downtown Boca Raton, built for the Gasdaska Verdiglione Conlon Team at Douglas Elliman. It needed to capture leads and inquiries while showing off the finishes, the available residences, and the teams behind the development: Advanced Development Group, Netta Architects and EAJ Services. Details came from several parties, so the hardest part was keeping every spec and claim accurate. Leads go straight to the MLS, and the site has brought in 23 leads so far on roughly $5 million residences. I handled the design, development and content, including the homepage hero video and the on-brand stylized elements, and edited the photography.',
    heroImage: asset('/websites/le-reve-macbook-1.webp'),
    cover: asset('/websites/covers/le-reve.webp'),
    images: ['macbook-2', 'macbook-3', 'macbook-4', 'phones'].map((n) => asset(`/websites/le-reve-${n}.webp`)),
    stack: { Framework: ['Next.js', 'React'], Hosting: ['Vercel'], Integrations: ['MLS lead capture', 'Vercel Analytics', 'Vercel Speed Insights'] },
    kit: {
      credits: [
        { label: 'Location', value: 'Boca Raton, FL' },
        { label: 'Client', value: 'Gasdaska Verdiglione Conlon Team at Douglas Elliman' },
        { label: 'Developer', value: 'Advanced Development Group' },
        { label: 'Architecture', value: 'Netta Architects' },
        { label: 'Construction', value: 'EAJ Services' },
        { label: 'Scope', value: 'Brand identity, stationery, brochures, website design, development and content, homepage video' },
        { label: 'Team', value: 'Two designers, including me' },
      ],
      brand: {
        logos: [{ src: asset('/projects/le-reve/wordmark.svg'), alt: 'Le Rêve Boca Raton wordmark', bg: '#ebf1f9', w: 34 }],
        palette: ['#38496a|Navy', '#4c5f84|Slate blue', '#d7d2cb|Warm gray'],
        fonts: ['Roquila (heading)', 'Novecento Sans Light (subheading)', 'Avenir Next (text)', 'Acumin Pro Thin'],
        note: 'A hand-lettered script wordmark in deep navy, paired with a quiet sans and a restrained navy and warm gray palette.',
      },
      sections: [
        { title: 'Brand guidelines', cols: 1, images: [
          { src: asset('/projects/le-reve/kit/brand-guide.webp'), alt: 'Le Rêve branding guide: colours, typography and logo' },
        ] },
        { title: 'Stationery', cols: 2, images: [
          { src: asset('/projects/le-reve/kit/stationery-1.webp'), alt: 'Le Rêve stationery mockup: folder, letterhead, envelope and business cards' },
          { src: asset('/projects/le-reve/kit/stationery-2.webp'), alt: 'Le Rêve stationery mockup, second layout' },
        ] },
        { title: 'Brochure', cols: 2, images: [
          { src: asset('/projects/le-reve/kit/brochure-cover.webp'), alt: 'Le Rêve brochure cover' },
          { src: asset('/projects/le-reve/kit/brochure-welcome.webp'), alt: 'Le Rêve brochure welcome panel' },
          { src: asset('/projects/le-reve/kit/brochure-residences.webp'), alt: 'Le Rêve brochure residences panel' },
          { src: asset('/projects/le-reve/kit/brochure-back.webp'), alt: 'Le Rêve brochure back panel with contacts and map' },
        ] },
        { title: 'Fact sheet', cols: 1, images: [
          { src: asset('/projects/le-reve/kit/fact-sheet.webp'), alt: 'Le Rêve fact sheet' },
        ] },
        { title: 'Location map', cols: 1, images: [
          { src: asset('/projects/le-reve/kit/map.webp'), alt: 'Le Rêve location map of Boca Raton' },
        ] },
      ],
      websiteNote: 'One site to gather leads and inquiries while showing finishes, available units and the teams behind the building.',
    },
    href: 'https://www.lerevebocaraton.com/',
    linkLabel: 'Visit site',
  }),
  p('Casa Avenida', 'Developments', {
    role: 'Design, development & content',
    year: 2025,
    summary: 'Casa Avenida is the marketing site for eight luxury townhome-style condominiums one block from Atlantic Avenue in downtown Delray Beach. I built it in early 2025 for the Gasdaska Verdiglione Conlon Team at Douglas Elliman, with the developers Kastelo Development and 4TRO Development and Capital and RWB/Linares Architecture. The site captures inquiries and leads while presenting the residences, finishes, renderings and a 360 virtual tour. It was my first real client website, so I learned a lot on the fly. I handled the design, development and content, and assisted on the renderings. Three of the eight residences have sold so far. It is public and still maintained.',
    heroImage: asset('/websites/casa-avenida-macbook-1.webp'),
    cover: asset('/websites/covers/casa-avenida.webp'),
    images: ['macbook-2', 'macbook-3', 'macbook-4', 'phones'].map((n) => asset(`/websites/casa-avenida-${n}.webp`)),
    stack: { Framework: ['Framer'], Hosting: ['Framer'], Integrations: ['Google Analytics', 'Meta Pixel'] },
    kit: {
      credits: [
        { label: 'Location', value: 'Downtown Delray Beach, FL' },
        { label: 'Client', value: 'Gasdaska Verdiglione Conlon Team at Douglas Elliman' },
        { label: 'Developers', value: 'Kastelo Development, 4TRO Development and Capital' },
        { label: 'Architecture', value: 'RWB/Linares Architecture' },
        { label: 'Interiors', value: 'Stef Leonel Interior Design, Ava Gray Interiors' },
        { label: 'Scope', value: 'Brand identity, stationery, brochures, website design, development and content; assisted on renderings' },
        { label: 'Team', value: 'Two designers, including me' },
      ],
      brand: {
        logos: [
          { src: asset('/projects/casa-avenida/logo-gold.svg'), alt: 'Casa Avenida wordmark in gold and bronze', bg: '#ffffff', w: 40 },
          { src: asset('/projects/casa-avenida/logo-white.svg'), alt: 'Casa Avenida wordmark in white', bg: '#4f2c1d', w: 55 },
          { src: asset('/projects/casa-avenida/monogram.svg'), alt: 'Casa Avenida A monogram', bg: '#373a36', w: 22 },
        ],
        palette: ['#4f2c1d|Saddle', '#373a36|Lunar', '#006a8e|Bahama Blue', '#dfd1a7|Sapling', '#ffffff|Pure White'],
        fonts: ['Quake (display)', 'Nunito Sans Light (heading)', 'Helvetica Bold (subheading)', 'Afacad Flux Light (text)'],
        note: 'A high-contrast serif wordmark with a spaced CASA above it, a bold A monogram, and a palette of saddle brown, lunar charcoal, Bahama blue and sapling gold, used as flat colour and as gradients.',
      },
      sections: [
        { title: 'Brand guidelines', cols: 1, images: [
          { src: asset('/projects/casa-avenida/kit/brand-guide.webp'), alt: 'Casa Avenida final brand guidelines: logo, colours, typography and design elements' },
        ] },
        { title: 'Stationery', mix: true, images: [
          { src: asset('/projects/casa-avenida/kit/stationery-1.webp'), alt: 'Casa Avenida letterhead, envelope and business card mockup' },
          { src: asset('/projects/casa-avenida/kit/stationery-2.webp'), alt: 'Casa Avenida stationery mockup in blue and brown' },
          { src: asset('/projects/casa-avenida/kit/stationery-3.webp'), alt: 'Casa Avenida stationery mockup in gold' },
        ] },
        { title: 'Brochure', cols: 4, images: [
          { src: asset('/projects/casa-avenida/kit/brochure-1.webp'), alt: 'Casa Avenida brochure, page 1' },
          { src: asset('/projects/casa-avenida/kit/brochure-2.webp'), alt: 'Casa Avenida brochure, page 2' },
          { src: asset('/projects/casa-avenida/kit/brochure-4.webp'), alt: 'Casa Avenida brochure, page 4' },
          { src: asset('/projects/casa-avenida/kit/brochure-5.webp'), alt: 'Casa Avenida brochure, page 5' },
          { src: asset('/projects/casa-avenida/kit/brochure-7.webp'), alt: 'Casa Avenida brochure, page 7' },
          { src: asset('/projects/casa-avenida/kit/brochure-9.webp'), alt: 'Casa Avenida brochure, page 9' },
          { src: asset('/projects/casa-avenida/kit/brochure-13.webp'), alt: 'Casa Avenida brochure, page 13' },
          { src: asset('/projects/casa-avenida/kit/brochure-14.webp'), alt: 'Casa Avenida brochure, page 14' },
        ] },
        { title: 'Fact sheet and finishes', cols: 2, images: [
          { src: asset('/projects/casa-avenida/kit/fact-sheet.webp'), alt: 'Casa Avenida fact sheet' },
          { src: asset('/projects/casa-avenida/kit/finishes-sheet.webp'), alt: 'Casa Avenida finishes tear sheet' },
        ] },
      ],
      websiteNote: 'The marketing site for the eight residences: inquiries, finishes, renderings and a 360 virtual tour.',
    },
    href: 'https://casaavenidadelray.com/',
    linkLabel: 'Visit site',
  }),
  p('The Edge Delray', 'Developments', {
    role: 'Design, development & content',
    year: 2026,
    summary: 'The Edge is the marketing site for seven luxury townhomes in two four-story buildings in Delray Beach, built for the Gasdaska Verdiglione Conlon Team at Douglas Elliman, with Advanced Development Group as developer and Netta Architects as architect. It presents the floor plans, the location and the teams behind the project, and captures inquiries ahead of launch. The site is built but not live yet. I handled the design, development and content.',
    heroImage: asset('/websites/the-edge-delray-macbook-1.webp'),
    cover: asset('/websites/covers/the-edge-delray.webp'),
    images: ['macbook-2', 'macbook-3', 'macbook-4', 'phones'].map((n) => asset(`/websites/the-edge-delray-${n}.webp`)),
    kit: {
      credits: [
        { label: 'Location', value: '602 NE 2nd St, Delray Beach, FL' },
        { label: 'Client', value: 'Gasdaska Verdiglione Conlon Team at Douglas Elliman' },
        { label: 'Developer', value: 'Advanced Development Group' },
        { label: 'Architecture', value: 'Netta Architects' },
        { label: 'Residences', value: '7 townhomes in two four-story buildings' },
      ],
      sections: [
        { title: 'Renderings', mix: true, images: [
          { src: asset('/projects/the-edge-delray/kit/rendering-1.webp'), alt: 'The Edge rendering at dusk from the street corner' },
          { src: asset('/projects/the-edge-delray/kit/rendering-2.webp'), alt: 'The Edge rendering of the two buildings and the walkway between them' },
          { src: asset('/projects/the-edge-delray/kit/rendering-3.webp'), alt: 'The Edge rendering in daylight' },
        ] },
        { title: 'Floor plans', note: 'Branded upper-floor plans for the townhomes and their rooftop pools.', cols: 1, images: [
          { src: asset('/projects/the-edge-delray/kit/floorplan-upper.webp'), alt: 'The Edge branded floor plans for floors three and four and the roof' },
        ] },
      ],
    },
    stack: { Framework: ['Framer'] },
  }),
  p('Pictorial Symbols Library', 'Websites', {
    role: 'Design & development',
    year: 2026,
    summary: 'A searchable library of 3,133 pictogram icons that I digitized from the 1976 Dover book Handbook of Pictorial Symbols. Each icon went through the same pipeline: scan, crop, vector trace, then name. The site lets you search by name, filter by category, sort, jump to a random icon, star favorites and download any icon as an SVG. A References page credits the source book. It is an archival personal project, not an openly licensed icon set.',
    heroImage: asset('/websites/pictorial-symbols/macbook-1.webp'),
    cover: asset('/websites/covers/pictorial-symbols-library.webp'),
    images: ['macbook-2', 'macbook-3', 'macbook-4', 'phones-gray'].map((n) => asset(`/websites/pictorial-symbols/${n}.webp`)),
    stack: { Framework: ['Hand-coded HTML, CSS & JavaScript'], Styling: ['Custom brand tokens', 'DM Sans', 'DM Mono', 'Instrument Serif'], Data: ['SVG files with a CSV index'], Hosting: ['GitHub Pages'] },
    extras: {
      figures: [
        { src: asset('/websites/pictorial-symbols/book-cover.webp'), alt: 'Front cover of Handbook of Pictorial Symbols: orange, yellow and purple squares of icons on olive green', caption: 'The source: Handbook of Pictorial Symbols, Rudolf Modley with William R. Myers, Dover, 1976. Front cover of my copy.' },
        { src: asset('/posters/04-pictorial-symbols.webp'), alt: 'Poster for Handbook of Pictorial Symbols with a grid of icons', caption: 'A poster I made for the book, also in Posters.' },
      ],
      stats: [
        { value: '3,133', label: 'icons' },
        { value: '132', label: 'scanned pages' },
        { value: '13', label: 'categories' },
      ],
      cursorIcons: ['steamroller', 'bellows-camera', 'cable-car', 'inkwell-with-quill', 'bus-side-o68', 'theater-masks', 'bridge', 'plumbing-tools', 'fuel', 'palm-tree', 'table-tennis', 'rowing', 'penguin', 'nails-saw-hammer-scattered', 'house', 'canoeing', 'cattle', 'tram', 'electrical-outlet', 'photographs', 'gymnastics-o68', 'wine-glass-baa-adca', 'javelin-throw', 'leafy-grain', 'beet', 'capitol-with-columns', 'ten-coin', 'prehistoric-monument', 'water-transportation-boat-x67', 'heliport-dfw', 'mining', 'reading-room', 'subway-beneath-tracks', 'recreation', 'electric-transformer-box', 'family-at-table', 'bathing', 'stepped-buildings-cluster', 'historic-building-nova-scotia', 'luggage-scale-dial-port', 'anchor', 'apple', 'agave', 'airplane', 'anvil', 'archery', 'badminton', 'awl', 'abc-book', 'ace-of-clubs'].map((n) => asset(`/websites/pictorial-symbols/icons/${n}.svg`)),
    },
    href: 'https://mattbloom1.github.io/pictorial-symbols-icons/',
    linkLabel: 'Visit site',
  }),
  p('Reseller Ledger', 'Websites', {
    role: 'Design & development',
    year: 2026,
    summary: 'A private, single-user tracker for reselling that follows each item from purchase to listing to sale. Buying ten of something creates ten individually traceable items, each with its own cost, and shared charges like tax and shipping are split across them to the penny. A four-column board (Arriving, In hand, Listed, Sold) shows what needs doing next, and an overview compares cash against profit. Amounts that are not known stay unknown instead of being guessed. The login-only app is not public, so every screen shown here uses sample data.',
    heroImage: asset('/websites/reseller-ledger/macbook-1.webp'),
    cover: asset('/websites/covers/reseller-ledger.webp'),
    images: ['macbook-2', 'macbook-3', 'macbook-4', 'phones-gray'].map((n) => asset(`/websites/reseller-ledger/${n}.webp`)),
    stack: { Framework: ['React 19', 'TypeScript', 'Vite'], Data: ['Supabase (Postgres, Auth)'], Hosting: ['Cloudflare Workers Static Assets'], Integrations: ['Vitest', 'Playwright'] },
  }),
  p('The GVC Team', 'Websites', {
    role: 'Design, development & content',
    year: 2025,
    summary: 'The home of the Gasdaska Verdiglione Conlon Real Estate Team, one of the top real estate teams working across three state markets (NY, NJ & FL). I rebuilt the site in 2025 as a single place where visitors can see what the team can do, learn who they are, and get in touch. I handled the design, development, and content, and I’ve maintained it since.',
    heroImage: asset('/websites/gvc-team-mockup.webp'),
    cover: asset('/websites/covers/the-gvc-team.webp'),
    images: ['macbook-1', 'macbook-2', 'macbook-3', 'macbook-4', 'phones-navy'].map((n) => asset(`/websites/gvc-team/${n}.webp`)),
    stack: { Framework: ['Framer'], Data: ['Framer CMS'] },
    href: 'https://gvcrealestateteam.com/',
    linkLabel: 'Visit site',
  }),
  p('GVC Workspace', 'Websites', {
    role: 'Design & development',
    year: 2026,
    summary: 'The internal workspace for the GVC Team, built so every listing, rental, pitch and new development lives in one place instead of across Drive, Asana and Douglas Elliman. Each job has its own page with its facts, stages, agents, marketing pieces, social posts and change log, and the sale or rental dates sit on a timeline. An Errors page flags where Asana, Elliman and Drive disagree, new developments carry milestones, a construction schedule and a budget, and a set of tools (showsheets, brochures, postcards, seller packages, signage, floor plans and more) makes the marketing straight from a job’s facts. A small desktop helper keeps Elliman and Asana in sync and saves finished PDFs into the right Drive folder. The workspace is login-only, so every screen shown here uses made-up sample data.',
    heroImage: asset('/websites/gvc-workspace/macbook-1.webp'),
    cover: asset('/websites/covers/gvc-workspace.webp'),
    images: ['macbook-2', 'laptop-phone-1', 'phones-gray', 'macbook-3', 'laptop-phone-2', 'screens-a', 'laptop-phone-3', 'macbook-4', 'phones-b', 'laptop-phone-4', 'screens-c', 'phones-c'].map((n) => asset(`/websites/gvc-workspace/${n}.webp`)),
    stack: { Framework: ['Hand-coded HTML, CSS & JavaScript', 'Node.js (desktop helper)'], Styling: ['Custom CSS', 'GSAP'], Data: ['Supabase (Postgres, Auth, row-level security)'], Hosting: ['GitHub Pages'], Integrations: ['Asana', 'Google Drive', 'Douglas Elliman listings', 'Playwright'] },
  }),
  p('Client Portfolio Site', 'Websites', {
    role: 'Design & development',
    year: 2026,
    summary: 'A fashion portfolio for Liv Polani, built to feel like a designer’s desk rather than a template. The home page is a paper collage of scanned scraps, lace and tape, with an ink-bleed hover effect, and the work lives in a ledger-style project register. Each project page carries a full case study (Endure, Distorted Bloom, Desert Wildflower, The Sweat Set and more) exported from Canva, and the résumé on the About page is embedded live from Canva so it never goes out of date. I handled the design and development.',
    heroImage: asset('/websites/liv-portfolio/macbook-1.webp'),
    cover: asset('/websites/covers/client-portfolio-site.webp'),
    images: ['macbook-2', 'macbook-3', 'macbook-4', 'phones-gray'].map((n) => asset(`/websites/liv-portfolio/${n}.webp`)),
    stack: { Framework: ['Next.js 15', 'React 19', 'TypeScript'], Styling: ['Custom CSS', 'SVG filters', 'Google Fonts'], Hosting: ['GitHub Pages (static export)'], Integrations: ['Canva embeds'] },
    href: 'https://livpolani.com',
    linkLabel: 'Visit site',
  }),
  p('Trimble Business Systems', 'Branding', {
    role: 'Brand identity & intranet design',
    year: 2025,
    summary: 'The Business Systems team within Trimble’s Digital Transformation group took me on as an intern to rebrand their systems and clean up their intranet pages. The result was a full rebrand for the Business Systems team of 400+ Trimble employees, built in Adobe Illustrator in line with the Trimble brand playbook, plus branded content published through a CMS. Some of the work cannot be shared, so only the public pieces are shown here.',
    heroImage: asset('/projects/trimble-business-systems/01.webp'),
    images: ['03'].map((n) => asset(`/projects/trimble-business-systems/${n}.webp`)),
  }),
  p('Opus', 'Branding', { summary: 'In progress.', hidden: true }),
  p('Essays In Bloom', 'Branding', { summary: 'In progress.', hidden: true }),
  p('CU Skate Forge', 'Projects', {
    tag: 'Community',
    role: 'Founder & President',
    year: 2023,
    summary: 'A makers and skaters club at CU Boulder whose mission is to build skateboarding obstacles from sustainable materials and make skateboarding more accessible to students on campus. As founder and president I managed the budget, navigated university approvals and training, pitched the idea to administrators, police and fire officials, handled insurance, led marketing and tabling, and cold-called sponsors. I also ran the social accounts, designed the graphics, recruited members, and built ramps and a full-sized half-pipe. In its first year the club grew to 300+ members, 200+ people attended its campus events, and it gathered 8+ sponsors, including Red Bull, Yerba Mate, 303 Boards, Satellite Boardshop, Square State Skate and Loco Skateshop.',
    heroImage: asset('/projects/cu-skate-forge/01.webp'),
    images: ['02', '03', '04', '05', '06'].map((n) => asset(`/projects/cu-skate-forge/${n}.webp`)),
    href: 'https://www.instagram.com/cuskateforge',
    linkLabel: 'Instagram',
  }),
  p('Bloc CNC', 'Projects', {
    tag: 'Hardware',
    role: 'Product designer & project manager',
    year: 2025,
    summary: 'A compact CNC machine for DIYers and makers, designed with a multidisciplinary team. It pairs gamified joystick controls with a sustainable enclosure. I led the CAD modeling, software integration and UX design, and wrote a user-friendly instructional workbook, the Bloc Innovation Guide.',
    heroImage: asset('/projects/bloc-cnc/01.webp'),
    images: ['02', '03', '04'].map((n) => asset(`/projects/bloc-cnc/${n}.webp`)),
  }),
  p('Topomaps', 'Projects', {
    tag: 'Hardware',
    role: 'Computational fabrication: Rhino, Grasshopper & fabrication',
    year: 2023,
    summary: 'Topographical maps translated into 3D structures using Grasshopper and Rhino. I turned the geographic variability of a map into a 3D model, with two deliverables: the model itself and a laser-cut template for it to sit in. In Grasshopper I laid out a grid of points, sampled the map image and sorted each point by its nearest swatch color, then extruded cylinders to matching heights. I applied a Delaunay mesh to the top points, smoothed it, turned it into a Brep solid and unioned it with a cube underneath. I finished by making custom coasters with the related topography for my family. My one change would be to 3D print the models in a color like white so the shadows and contours are more visible. My biggest problems were scope creep, trying to do more than was feasible, and list ordering in Grasshopper.',
    heroImage: asset('/projects/topomaps/01.webp'),
    images: ['03', '02', '04', '05', '06', '07'].map((n) => asset(`/projects/topomaps/${n}.webp`)),
    imageAlts: ['A color-coded elevation map of Boulder, CO turned into a red 3D terrain model', 'Nine steps showing a flat red surface becoming a Boulder terrain mesh in Grasshopper', 'A grey Rhino render of the Boulder terrain model', 'A laser-engraved bear coaster in a wood and plywood frame', 'A wood coaster engraved with a bottle, glass and bread', 'Three finished coasters stacked on a table'],
  }),
];

const craftSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const craftImg = (slug: string, n: string) => asset(`/crafts/${slug}/${n}.webp`);
export const SEED_CRAFTS: Craft[] = [
  {
    title: 'Bloom Coffee Table', slug: 'bloom-coffee-table', year: 2023, role: '3D modeling & physical fabrication',
    summary: 'A modular folding table with a built-in lazy susan, made for everyday use and compact storage. The flower shape was inspired by Tyler, The Creator’s GOLF WANG flower. The tabletop was laser cut and jigsawed, the parts were 3D printed and prototyped, and the main challenge was engineering a stable folding leg mechanism. Made at the University of Colorado Boulder.',
    cover: craftImg('bloom-coffee-table', 'cover'),
    heroImage: craftImg('bloom-coffee-table', '01'),
    images: ['03', '04', '02'].map((n) => craftImg('bloom-coffee-table', n)),
    imageAlts: ['The flower tabletop with a black lazy susan tray holding a yellow boot planter', 'The table folding and unfolding on its legs', 'The 3D printed leg mount with a yellow flower-shaped knob under the tabletop'],
  },
  {
    title: 'Skate Rings', slug: 'skate-rings', year: 2025, role: 'Sketching & fabrication',
    summary: 'Old skateboard decks turned into rings, inspired by Bauhaus and De Stijl: geometric shapes, sharp lines and bold color contrast. Each deck was stripped of grip tape, paint and stickers, then sanded to 300 grit to reveal its layers of colored veneer. Made for Aesthetics in Design, in the BTU lab at ATLAS.',
    cover: craftImg('skate-rings', 'cover'),
    heroImage: craftImg('skate-rings', '04'),
    images: ['01', '02', '03', '05', '06'].map((n) => craftImg('skate-rings', n)),
    imageAlts: ['Stripped skateboard decks and cut yellow and teal plywood pieces on a workbench', 'Close-up of the colored plywood layers in a sanded skateboard deck', 'Three finished skate rings and a pendant on a striped teal display block', 'A skate ring on a plaster hand', 'Pencil sketches of ring shapes on grid paper'],
  },
  { title: 'Pottery', slug: 'pottery', hidden: true },
  { title: 'Recycled Climbing Rope Crafts', slug: craftSlug('Recycled Climbing Rope Crafts'), hidden: true },
];


/** One 35mm roll per month, newest first. Photos are produced by scripts/process-film.py into public/photography/<slug>/NN.webp. */
const ROLLS: { slug: string; month: string; year: number }[] = [
  { slug: 'aug-2026', month: 'August', year: 2026 },
  { slug: 'jun-2026', month: 'June', year: 2026 },
  { slug: 'apr-2026', month: 'April', year: 2026 },
  { slug: 'feb-2026', month: 'February', year: 2026 },
  { slug: 'jan-2026', month: 'January', year: 2026 },
  { slug: 'dec-2025', month: 'December', year: 2025 },
  { slug: 'oct-2025', month: 'October', year: 2025 },
  { slug: 'aug-2025', month: 'August', year: 2025 },
];
const manifest = photoManifest as Record<string, { w: number; h: number }[]>;
/** Rolls that have photos yet; the rest stay hidden. */
export const SEED_PHOTOGRAPHY: PhotoSeries[] = ROLLS.filter((r) => (manifest[r.slug] || []).length).map((r) => ({
  title: r.month, slug: r.slug, year: r.year,
  frames: manifest[r.slug].map((f, i) => ({ image: asset(`/photography/${r.slug}/${String(i + 1).padStart(2, '0')}.webp`), alt: `${r.month} ${r.year} film roll, frame ${i + 1}`, w: f.w, h: f.h })),
}));

/** Posters get their own stamp and page: personal pieces first, then the GearBook set. */
const poster = (title: string, file: string, w: number, h: number) => ({ title, src: asset(`/posters/${file}.webp`), alt: `${title} poster`, w, h });
export const SEED_POSTERS: PosterSet[] = [
  { title: 'Personal', items: [
    poster('Variex', '01-type-specimen', 1035, 1600),
    poster('Improve Your Golf', '02-golfer', 1224, 1584),
    poster('The Frog', '03-frog', 1224, 1584),
    poster('Handbook of Pictorial Symbols', '04-pictorial-symbols', 1236, 1600),
    poster('I’m Going to the Mountains', '05-mountain-helicopter', 1236, 1600),
  ] },
  { title: 'GearBook', items: [
    ['Sign-up Deal', 'posters-signupdeal'], ['Skier Bookmark', 'skier-bookmark'], ['Skiers Walking', 'skiers-walking'], ['Luke', 'luke'],
    ['Evan Text', 'evan-text'], ['Item Grid', 'item-grid'], ['Bookmark Cutout', 'bookmark-cutout'],
  ].map(([t, f]) => poster(`GearBook ${t}`, `gearbook/${f}`, 1167, 1500)) },
];
