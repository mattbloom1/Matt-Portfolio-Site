import Portfolio from '@/components/Portfolio';
import { getContent } from '@/lib/getContent';
import { outlineHtml } from '@/lib/content';

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
