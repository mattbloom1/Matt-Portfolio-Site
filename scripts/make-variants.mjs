// Prebuild: smaller WebP variants for card covers and home stamps, plus a manifest the markup reads.
// Runs on `npm run build` (prebuild). Safe to run again: only missing variants are written.
import sharp from 'sharp';
import { globSync } from 'node:fs';
import { existsSync, writeFileSync, readFileSync } from 'node:fs';
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
];

const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};
const manifest = {};
let made = 0;
for (const g of groups) {
  for (const file of g.files.filter((f) => !isVariant(f)).sort()) {
    const key = '/' + relative(PUB, file).split('\\').join('/');
    const meta = await sharp(file).metadata();
    const w = meta.width || 0;
    const v = [];
    for (const width of g.widths) {
      if (width >= w) continue; // never upscale
      const out = join(dirname(file), basename(file, '.webp') + `-${width}.webp`);
      if (!existsSync(out)) { await sharp(file).resize({ width }).webp({ quality: 82 }).toFile(out); made++; }
      v.push(width);
    }
    // stamps already ship a -600 variant made by hand
    if (key.startsWith('/stamps/') && w > 600) v.push(600);
    manifest[key] = { w, v: v.sort((a, b) => a - b) };
  }
}
if (JSON.stringify(manifest) !== JSON.stringify(prev)) writeFileSync(OUT, JSON.stringify(manifest, null, 0) + '\n');
console.log(`variants: ${Object.keys(manifest).length} sources, ${made} new files`);
