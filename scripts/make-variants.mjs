// Prebuild: smaller WebP variants for covers, galleries, posters and stamps, plus a manifest (width, height,
// variant widths) the markup reads for srcset, width/height and loading placeholders.
// Runs on `npm run build` (prebuild). Safe to run again: only missing variants are written.
import sharp from 'sharp';
import { globSync } from 'node:fs';
import { existsSync, writeFileSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, basename, relative } from 'node:path';

const PUB = 'public';
const OUT = 'src/lib/variants.json';
const WIDTHS = [400, 800];
const STAMP_WIDTHS = [300];
const isVariant = (f) => /-\d{3,4}\.webp$/.test(f);

const groups = [
  { files: globSync(`${PUB}/websites/covers/*.webp`), widths: WIDTHS },
  { files: globSync(`${PUB}/projects/*/*.webp`), widths: WIDTHS },
  { files: globSync(`${PUB}/crafts/*/*.webp`), widths: WIDTHS },
  { files: globSync(`${PUB}/stamps/*.webp`), widths: STAMP_WIDTHS },
  // Posters, print pieces and mockups carry fine type, so their variants keep a higher quality.
  { files: globSync(`${PUB}/posters/**/*.webp`), widths: WIDTHS, quality: 92 },
  { files: globSync(`${PUB}/projects/*/kit/*.webp`), widths: WIDTHS, quality: 92 },
  { files: globSync(`${PUB}/websites/*.webp`), widths: WIDTHS, quality: 92 },
  { files: globSync(`${PUB}/websites/*/*.webp`).filter((f) => !f.includes('/covers/')), widths: WIDTHS, quality: 92 },
];

const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};
const manifest = {};
let made = 0;
for (const g of groups) {
  for (const file of g.files.filter((f) => !isVariant(f)).sort()) {
    const key = '/' + relative(PUB, file).split('\\').join('/');
    const meta = await sharp(file).metadata();
    const w = meta.width || 0, h = meta.height || 0;
    const v = [];
    // widths an earlier run already left out for this exact file
    const skipped = prev[key]?.w === w && prev[key]?.h === h ? g.widths.filter((x) => !prev[key].v.includes(x)) : [];
    for (const width of g.widths) {
      if (width >= w || skipped.includes(width)) continue; // never upscale
      const out = join(dirname(file), basename(file, '.webp') + `-${width}.webp`);
      if (!existsSync(out)) {
        const buf = await sharp(file).resize({ width }).webp({ quality: g.quality || 82 }).toBuffer();
        if (buf.length > statSync(file).size * 0.9) continue; // saves under 10%: not worth a separate request
        writeFileSync(out, buf); made++;
      }
      v.push(width);
    }
    // stamps already ship a -600 variant made by hand
    if (key.startsWith('/stamps/') && w > 600) v.push(600);
    manifest[key] = { w, h, v: v.sort((a, b) => a - b) };
  }
}
if (JSON.stringify(manifest) !== JSON.stringify(prev)) writeFileSync(OUT, JSON.stringify(manifest, null, 0) + '\n');
console.log(`variants: ${Object.keys(manifest).length} sources, ${made} new files`);
