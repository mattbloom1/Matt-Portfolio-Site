import localFont from 'next/font/local';
import { Lora, Cormorant_Infant } from 'next/font/google';

/**
 * Type pairing (swap here to use Matt's own fonts):
 *   display: Lora
 *   body:    Newsreader, quiet readable serif
 *   mono:    IBM Plex Mono, for micrographics and captions
 *
 * To add an owner font, drop the files in src/app/fonts/ and use next/font/local:
 *   import localFont from 'next/font/local';
 *   export const display = Lora({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-display', display: 'swap' });
 * then keep the same CSS variable name; nothing else changes.
 */
export const display = Lora({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-display', display: 'swap' });
/** Body: Newsreader with its optical-size axis (replaces Windows-only Sitka). */
/** Self-hosted (@fontsource-variable/newsreader, SIL OFL): fetching it from Google at build time failed intermittently in CI. */
export const body = localFont({
  src: [{ path: './fonts/newsreader-latin-opsz-normal.woff2', weight: '200 800', style: 'normal' }],
  variable: '--font-body',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
});
/** Labels: Cormorant Infant, a thin calligraphic face (replaces Windows-only Himalaya), self-hosted by next/font. */
export const mono = Cormorant_Infant({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-mono', display: 'swap' });

/** Footer text (Afacad Flux, SIL OFL), self-hosted from @fontsource. */
export const footer = localFont({
  src: [
    { path: './fonts/afacad-flux-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/afacad-flux-latin-500-normal.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-footer',
  display: 'swap',
});
