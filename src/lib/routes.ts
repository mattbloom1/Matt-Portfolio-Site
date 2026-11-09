import { SITE, workItems, tagOf, type SectionId, type SiteContent } from './content';

/** Real URLs: /, /projects/, /projects/gearbook/. Websites, Projects and Crafts have per-item pages. */
export const SECTION_META: Record<SectionId, { label: string; description: string }> = {
  work: { label: 'Work', description: 'Websites, developments, branding, hardware, crafts and community projects by Matthew Bloomfield.' },
  posters: { label: 'Posters', description: 'Poster and print design by Matthew Bloomfield.' },
  experience: { label: 'Experience', description: 'Work history of Matthew Bloomfield, Creative Technologist & Designer.' },
  photography: { label: 'Photography', description: '35mm film photography by Matthew Bloomfield, one roll per month.' },
  about: { label: 'About', description: 'About Matthew Bloomfield, Creative Technologist & Designer.' },
};

export interface RouteInfo { path: string[]; title: string; description: string; image?: string }

export function allRoutes(all: SiteContent): RouteInfo[] {
  const c = { ...all, projects: all.projects.filter((p) => !p.hidden), crafts: all.crafts.filter((k) => !k.hidden) };
  const out: RouteInfo[] = [{ path: [], title: `${SITE.name} · ${SITE.role}`, description: `Portfolio of ${SITE.name}, ${SITE.role}: projects, experience, crafts and photography.` }];
  (Object.keys(SECTION_META) as SectionId[]).forEach((id) => {
    const m = SECTION_META[id];
    out.push({ path: [id], title: `${m.label} · ${SITE.name}`, description: m.description });
    const items = id === 'work' ? workItems(c) : [];
    items.forEach((p) => {
      if (!p.slug) return;
      const detail = [p.role, p.year].filter(Boolean).join(', ');
      out.push({
        path: [id, p.slug],
        title: `${p.title} · ${m.label} · ${SITE.name}`,
        description: (p.summary || `${p.title}${detail ? ` (${detail})` : ''}, ${tagOf(p).toLowerCase()} work by ${SITE.name}.`).slice(0, 300),
      });
    });
  });
  return out;
}
