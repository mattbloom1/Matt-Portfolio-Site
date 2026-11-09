import type { MetadataRoute } from 'next';
import { getContent } from '@/lib/getContent';
import { allRoutes } from '@/lib/routes';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return allRoutes(await getContent()).map((r) => ({
    url: `https://www.matthewsbloomfield.com/${r.path.length ? r.path.join('/') + '/' : ''}`,
    changeFrequency: 'monthly',
    priority: r.path.length === 0 ? 1 : r.path.length === 1 ? 0.8 : 0.6,
  }));
}
