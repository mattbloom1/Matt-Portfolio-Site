import type { Metadata } from 'next';
import { preload } from 'react-dom';
import Portfolio from '@/components/Portfolio';
import { getContent } from '@/lib/getContent';
import { allRoutes } from '@/lib/routes';
import { heroImages, outlineHtml } from '@/lib/content';
import { OG_IMAGE } from '@/lib/og';

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
    openGraph: { title: r.title, description: r.description, url, type: 'website', images: [OG_IMAGE] },
    twitter: { card: 'summary_large_image', title: r.title, description: r.description, images: [OG_IMAGE] },
  };
}

export default async function Page({ params }: { params: { route?: string[] } }) {
  const content = await getContent();
  // The page is drawn by script; start fetching its main image from the static HTML instead of waiting for it.
  for (const img of heroImages(content, params.route || [])) {
    preload(img.href, { as: 'image', fetchPriority: 'high', imageSrcSet: img.srcSet, imageSizes: img.sizes });
  }
  return (
    <>
      <Portfolio content={content} />
      {/* Text version of the whole site in the static HTML, for crawlers, link readers and visitors without JavaScript. */}
      <noscript><div dangerouslySetInnerHTML={{ __html: outlineHtml(content) }} style={{ padding: 24, maxWidth: 760 }} /></noscript>
    </>
  );
}
