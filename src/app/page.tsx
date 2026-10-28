import Portfolio from '@/components/Portfolio';
import { getContent } from '@/lib/getContent';

export default async function Page() {
  const content = await getContent();
  return <Portfolio content={content} />;
}
