import { Fraunces, Newsreader, IBM_Plex_Mono } from 'next/font/google';

/**
 * Type pairing (swap here to use Matt's own fonts):
 *   display: Cormorant Garamond, high-contrast serif close to the stamp artwork
 *   body:    Newsreader, quiet readable serif
 *   mono:    IBM Plex Mono, for micrographics and captions
 *
 * To add an owner font, drop the files in src/app/fonts/ and use next/font/local:
 *   import localFont from 'next/font/local';
 *   export const display = Fraunces({ subsets: ['latin'], axes: ['SOFT', 'WONK'], style: ['normal', 'italic'], variable: '--font-display', display: 'swap' });
 * then keep the same CSS variable name; nothing else changes.
 */
export const display = Fraunces({ subsets: ['latin'], axes: ['SOFT', 'WONK'], style: ['normal', 'italic'], variable: '--font-display', display: 'swap' });
export const body = Newsreader({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
export const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' });
