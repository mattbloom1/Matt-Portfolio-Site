import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { display, body, mono } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Matthew Bloomfield',
  description: 'Portfolio of Matthew Bloomfield, Creative Technologist & Director: projects, experience, crafts and photography.',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#ece9e2' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        {children}
        {/* Cookieless, privacy-friendly, free on Vercel Hobby. Only rendered on Vercel (it ignores basePath elsewhere). */}
        {process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  );
}
