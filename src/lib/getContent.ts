import { client, urlFor } from './sanity';
import { PLACEHOLDER, type SiteContent } from './content';

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function getContent(): Promise<SiteContent> {
  if (!client) return PLACEHOLDER;
  try {
    const [projects, crafts, experience] = await Promise.all([
      client.fetch(`*[_type=="project"]|order(coalesce(year,0) desc){title,"slug":slug.current,summary,featured,year,disciplines,role,accent,heroMedia}`),
      client.fetch(`*[_type=="craft"]|order(coalesce(year,0) desc){title,"slug":slug.current,summary,year,media,notes}`),
      client.fetch(`*[_type=="experience"]|order(sortOrder asc){organization,role,startDate,endDate,description}`),
    ]);
    const hasAny = projects.length + crafts.length + experience.length > 0;
    if (!hasAny) return PLACEHOLDER;
    return {
      placeholder: false,
      projects: projects.map((p: any) => ({ ...p, heroImage: urlFor(p.heroMedia) })),
      crafts: crafts.map((k: any) => ({ ...k, image: urlFor(k.media) })),
      experience,
    };
  } catch {
    return PLACEHOLDER; // never break the build on a CMS hiccup
  }
}
