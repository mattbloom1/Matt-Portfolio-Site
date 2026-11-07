import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { display, body, mono, footer } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Matthew Bloomfield',
  description: 'Portfolio of Matthew Bloomfield, Creative Technologist & Designer: projects, experience, crafts and photography.',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#ece9e2' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable} ${footer.variable}`}>
      <body>
        {children}
        {/* Cookieless, privacy-friendly, free on Vercel Hobby. Only rendered on Vercel (it ignores basePath elsewhere). */}
        {process.env.VERCEL ? <Analytics /> : null}
        {process.env.VERCEL ? <SpeedInsights /> : null}
      </body>
    </html>
  );
}
