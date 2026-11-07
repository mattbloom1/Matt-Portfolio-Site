#!/usr/bin/env python3
"""Resize film-roll photos for the web and write src/lib/photography.json.

Usage: python3 scripts/process-film.py <roll-slug> <input-dir>
  roll-slug: one of the ROLLS in src/lib/seed.ts (e.g. aug-2026, apr-2026)
Photos are sorted by filename (shoot order), converted to webp, long edge 1800px.
"""
import json, sys, pathlib
from PIL import Image, ImageOps

ROOT = pathlib.Path(__file__).resolve().parent.parent
MANIFEST = ROOT / 'src/lib/photography.json'
EXT = {'.jpg', '.jpeg', '.png', '.heic', '.tif', '.tiff', '.webp'}
LONG = 1800

def main(slug, src):
    files = sorted(p for p in pathlib.Path(src).rglob('*') if p.suffix.lower() in EXT and not p.name.startswith('.'))
    out = ROOT / 'public/photography' / slug
    out.mkdir(parents=True, exist_ok=True)
    for old in out.glob('*.webp'): old.unlink()
    frames = []
    for i, f in enumerate(files, 1):
        im = ImageOps.exif_transpose(Image.open(f)).convert('RGB')
        im.thumbnail((LONG, LONG), Image.LANCZOS)
        im.save(out / f'{i:02d}.webp', 'WEBP', quality=80, method=6)
        frames.append({'w': im.width, 'h': im.height})
    data = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
    data[slug] = frames
    MANIFEST.write_text(json.dumps(data, indent=1, sort_keys=True) + '\n')
    print(f'{slug}: {len(frames)} photos')

if __name__ == '__main__':
    main(*sys.argv[1:3])
