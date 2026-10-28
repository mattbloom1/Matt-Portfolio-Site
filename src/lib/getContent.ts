import { client, urlFor } from './sanity';
import { PLACEHOLDER, type SiteContent } from './content';

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function getContent(): Promise<SiteContent> {
  if (!client) return PLACEHOLDER;
  try {
    const [projects, crafts, experience] = await Promise.all([
      client.fetch(`*[_type=="project"]|order(coalesce(year,0) desc){title,"slug":slug.current,summary,featured,year,disciplines,role,accent,heroMedia}`),
      client.fetch(`*[_type=="craft"]|order(coalesce(year,0) desc){title,"slug":slug.current,summary,year,media,notes}`),
      client.fetch(`*[_type=="experience"]|order(coalesce(sortOrder,9999) asc){organization,role,startDate,endDate,description}`),
    ]);
    return {
      // Each section falls back to its own placeholders until it has CMS entries.
      placeholder: { projects: !projects.length, crafts: !crafts.length, experience: !experience.length },
      projects: projects.length ? projects.map((p: any) => ({ ...p, heroImage: urlFor(p.heroMedia) })) : PLACEHOLDER.projects,
      crafts: crafts.length ? crafts.map((k: any) => ({ ...k, image: urlFor(k.media) })) : PLACEHOLDER.crafts,
      experience: experience.length ? experience : PLACEHOLDER.experience,
    };
  } catch (err) {
    console.warn('Sanity fetch failed, using placeholders:', err);
    return PLACEHOLDER; // never break the build on a CMS hiccup
  }
}
