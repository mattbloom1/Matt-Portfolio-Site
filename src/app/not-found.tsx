import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Not found · Matthew Bloomfield', robots: { index: false } };

/** Static 404 (out/404.html): same paper, same type, one way back to the desk. */
export default function NotFound() {
  return (
    <main className="nf">
      <p className="meta">four oh four</p>
      <h1>This one got lost in the mail.</h1>
      <p>There is no page at this address. The desk is one step back.</p>
      <p><Link href="/">Back to the desk</Link></p>
    </main>
  );
}
