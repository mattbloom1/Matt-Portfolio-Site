import localFont from 'next/font/local';

/**
 * Type pairing (swap here to use Matt's own fonts):
 *   display: Lora
 *   body:    Newsreader, quiet readable serif
 *   mono:    Cormorant Infant, for micrographics and captions
 *
 * Every face is self-hosted from @fontsource (SIL OFL) in src/app/fonts/.
 * Fetching from Google Fonts at build time failed intermittently in CI (Newsreader on Nov 11,
 * Cormorant Infant on Nov 19), which failed the build and skipped the Pages deploy.
 *
 * To add an owner font, drop the files in src/app/fonts/ and use next/font/local with the
 * same CSS variable name; nothing else changes.
 */
/** Display: Lora, variable weight 400 to 700, roman and italic. */
export const display = localFont({
  src: [
    { path: './fonts/lora-latin-wght-normal.woff2', weight: '400 700', style: 'normal' },
    { path: './fonts/lora-latin-wght-italic.woff2', weight: '400 700', style: 'italic' },
  ],
  variable: '--font-display',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
});
/** Body: Newsreader with its optical-size axis (replaces Windows-only Sitka). */
export const body = localFont({
  src: [{ path: './fonts/newsreader-latin-opsz-normal.woff2', weight: '200 800', style: 'normal' }],
  variable: '--font-body',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
});
/** Labels: Cormorant Infant, a thin calligraphic face (replaces Windows-only Himalaya). */
export const mono = localFont({
  src: [
    { path: './fonts/cormorant-infant-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/cormorant-infant-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-mono',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
});

/** Footer text (Afacad Flux, SIL OFL), self-hosted from @fontsource. */
export const footer = localFont({
  src: [
    { path: './fonts/afacad-flux-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/afacad-flux-latin-500-normal.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-footer',
  display: 'swap',
});

/** Brand Motion screen labels (Afacad Flux SemiBold). Only one project page uses it, so it isn't preloaded. */
export const label = localFont({
  src: [{ path: './fonts/afacad-flux-latin-600-normal.woff2', weight: '600', style: 'normal' }],
  variable: '--font-label',
  display: 'swap',
  preload: false,
});
