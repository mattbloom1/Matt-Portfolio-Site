// Generates studio/seed/content.ndjson from src/lib/seed.ts. Run: npx tsx studio/seed/make-seed.ts
import { writeFileSync } from 'node:fs';
import { SEED_CRAFTS, SEED_EXPERIENCE, SEED_PROJECTS } from '../../src/lib/seed';

const id = (t: string, s: string, i: number) => `${t}-${s}-${i}`;
const lines = [
  ...SEED_PROJECTS.map((p, i) => ({ _id: id('project', p.slug, i), _type: 'project', title: p.title, slug: { _type: 'slug', current: `${p.slug}-${i}` }, summary: p.summary, disciplines: p.disciplines })),
  ...SEED_CRAFTS.map((c, i) => ({ _id: id('craft', c.slug, i), _type: 'craft', title: c.title, slug: { _type: 'slug', current: c.slug } })),
  ...SEED_EXPERIENCE.map((e, i) => ({ _id: `experience-${i}`, _type: 'experience', organization: e.organization, role: e.role, startDate: e.startDate, endDate: e.endDate, sortOrder: i + 1 })),
];
writeFileSync(new URL('./content.ndjson', import.meta.url), lines.map((l) => JSON.stringify(l)).join('\n') + '\n');
