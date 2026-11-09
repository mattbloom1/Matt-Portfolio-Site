import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { display, body, mono, footer } from './fonts';
import './globals.css';

const DESCRIPTION = 'Portfolio of Matthew Bloomfield, Creative Technologist & Designer: projects, posters, experience, crafts and photography.';
export const metadata: Metadata = {
  metadataBase: new URL('https://www.matthewsbloomfield.com'),
  title: 'Matthew Bloomfield · Creative Technologist & Designer',
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: { title: 'Matthew Bloomfield · Creative Technologist & Designer', description: DESCRIPTION, url: '/', siteName: 'Matthew Bloomfield', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Matthew Bloomfield · Creative Technologist & Designer', description: DESCRIPTION },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#ece9e2' };

const PERSON = {
  '@context': 'https://schema.org', '@type': 'Person', name: 'Matthew Bloomfield', jobTitle: 'Creative Technologist & Designer',
  url: 'https://www.matthewsbloomfield.com/', email: 'mailto:matthewb3333@gmail.com',
  sameAs: ['https://www.linkedin.com/in/mattsbloomfield/', 'https://github.com/mattbloom1/'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable} ${footer.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON) }} />
        {children}
        {/* Cookieless, privacy-friendly, free on Vercel Hobby. Only rendered on Vercel (it ignores basePath elsewhere). */}
        {process.env.VERCEL ? <Analytics /> : null}
        {process.env.VERCEL ? <SpeedInsights /> : null}
      </body>
    </html>
  );
}
