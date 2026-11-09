import type { Metadata } from 'next';
import Portfolio from '@/components/Portfolio';
import { getContent } from '@/lib/getContent';
import { allRoutes } from '@/lib/routes';
import { outlineHtml } from '@/lib/content';

export const dynamicParams = false;

export async function generateStaticParams() {
  return allRoutes(await getContent()).map((r) => ({ route: r.path }));
}

export async function generateMetadata({ params }: { params: { route?: string[] } }): Promise<Metadata> {
  const path = params.route || [];
  const r = allRoutes(await getContent()).find((x) => x.path.join('/') === path.join('/'));
  if (!r) return {};
  const url = `/${path.length ? path.join('/') + '/' : ''}`;
  return {
    title: r.title,
    description: r.description,
    alternates: { canonical: url },
    openGraph: { title: r.title, description: r.description, url, type: 'website' },
    twitter: { title: r.title, description: r.description },
  };
}

export default async function Page() {
  const content = await getContent();
  return (
    <>
      <Portfolio content={content} />
      {/* Text version of the whole site in the static HTML, for crawlers, link readers and visitors without JavaScript. */}
      <noscript><div dangerouslySetInnerHTML={{ __html: outlineHtml(content) }} style={{ padding: 24, maxWidth: 760 }} /></noscript>
    </>
  );
}
