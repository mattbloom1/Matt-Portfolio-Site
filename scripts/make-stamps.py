"""Renumber the home stamps and build the Posters stamp.
Run from the repo root: python3 -I scripts/make-stamps.py PostageStamps-renumbered.pdf original-stamps-dir
Only needs the PDF to borrow the TheSeasons-Bold font; the stamps themselves are edited in place."""
import sys, pymupdf, numpy as np
from PIL import Image, ImageFilter
ST = 'public/stamps/'
pdf = pymupdf.open(sys.argv[1])
_, _, _, buf = pdf.extract_font(64)
font = pymupdf.Font(fontbuffer=buf)
K = 1000 / 265.113  # pdf points -> stamp pixels

def text_img(t, size, rot=0):
    d = pymupdf.open(); pg = d.new_page(width=265.113, height=180.681)
    tw = pymupdf.TextWriter(pg.rect); tw.append((0, 0), t, font=font, fontsize=size)
    tw.write_text(pg, color=(0, 0, 0))
    pm = pg.get_pixmap(dpi=round(72 * K), alpha=True)
    return Image.frombytes('RGBA', (pm.width, pm.height), pm.samples)

def draw_text(img, t, size, x, base, right=False):
    """Draw t with its baseline at pixel y=base, left (or right) edge at x."""
    d = pymupdf.open(); pg = d.new_page(width=265.113, height=180.681)
    tw = pymupdf.TextWriter(pg.rect); tw.append((x / K, base / K), t, font=font, fontsize=size)
    if right:
        r = tw.text_rect; tw = pymupdf.TextWriter(pg.rect); tw.append((x / K - r.width, base / K), t, font=font, fontsize=size)
    tw.write_text(pg, color=(0.04, 0.04, 0.04))
    pm = pg.get_pixmap(dpi=round(72 * K), alpha=True)
    layer = Image.frombytes('RGBA', (pm.width, pm.height), pm.samples).resize(img.size, Image.LANCZOS)
    return Image.alpha_composite(img, layer)

def ink_bbox(a, box):
    x0, y0, x1, y1 = box
    ys, xs = np.where(a[y0:y1, x0:x1, :3].mean(2) < 70)
    return xs.min() + x0, ys.min() + y0, xs.max() + x0, ys.max() + y0

def renumber(name, new, left, src_dir):
    im = Image.open(f'{src_dir}/{name}.webp').convert('RGBA'); a = np.array(im)
    # the old number sits in a bottom corner; find it by its dark pixels
    x0, y0, x1, y1 = ink_bbox(a, (60, 560, 260, 660) if left else (830, 550, 960, 625))
    pad = 10
    cx0, cy0, cx1, cy1 = x0 - pad, y0 - pad, x1 + pad, y1 + pad
    w = cx1 - cx0
    # clone clean paper from the same band, shifted sideways, over the old number
    sx = cx0 + (w + 40 if left else -(w + 220))
    patch = a[cy0:cy1, sx:sx + w].copy()
    assert patch[..., :3].mean(2).min() > 90, (name, 'source patch not clean')
    a[cy0:cy1, cx0:cx1] = patch
    out = Image.fromarray(a)
    # baseline = bottom of the first '0' (later digits may hang below it in this old-style font)
    ys, _ = np.where(np.array(im)[y0:y1 + 1, x0:x0 + 40, :3].mean(2) < 70)
    base = y0 + ys.max()
    out = draw_text(out, new, 24.4, x0, base) if left else draw_text(out, new, 24.4, x1 + 2, base, right=True)
    out.save(ST + name + '.webp', quality=90, method=6)
    print(name, new)

def posters_stamp(src_dir):
    """New Posters stamp: paper cloned from the Photography stamp, recoloured, with two dithered posters."""
    base = np.array(Image.open(f'{src_dir}/photography.webp').convert('RGBA')).astype(float)
    alpha = base[..., 3].copy()
    strip = base[40:510, 880:960, :3]                    # blank paper
    assert strip.mean(2).min() > 90
    # tile the strip with mirrors to cover the whole stamp
    row = np.concatenate([strip if i % 2 == 0 else strip[:, ::-1] for i in range(14)], 1)[:, :1000]
    full = np.concatenate([row if i % 2 == 0 else row[::-1] for i in range(3)], 0)[:682]
    full = full[:682, :1000]
    target = np.array([188, 168, 198.0])                  # soft lilac
    full = np.clip(full * (target / np.median(full.reshape(-1, 3), 0)), 0, 255)
    paper = Image.fromarray(np.dstack([full, alpha]).astype('uint8'), 'RGBA')
    # two posters, ink-dithered, tilted
    def ink(path, w, angle):
        g = Image.open(path).convert('L'); g = g.resize((w, int(g.height * w / g.width)), Image.LANCZOS)
        a = np.array(g).astype(float)
        a = np.clip((a - 90) * 1.5 + 90, 0, 255)
        noise = np.random.default_rng(7).normal(0, 38, a.shape)
        dark = (a + noise < 128)
        rgba = np.zeros(a.shape + (4,), 'uint8'); rgba[..., :3] = (10, 12, 10); rgba[..., 3] = np.where(dark, 255, 0)
        # white-ish sheet behind the ink so the poster reads as a rectangle
        im = Image.fromarray(rgba, 'RGBA')
        sheet = Image.new('RGBA', im.size, (240, 232, 244, 255))
        sheet.alpha_composite(im)
        edge = Image.new('RGBA', im.size, (0, 0, 0, 0))
        return sheet.rotate(angle, expand=True, resample=Image.BICUBIC)
    for path, w, ang, cx, cy in [("public/posters/04-pictorial-symbols.webp", 290, 6, 745, 335), ("public/posters/02-golfer.webp", 295, -6, 565, 345)]:
        p = ink(path, w, ang)
        paper.alpha_composite(p, (cx - p.width // 2, cy - p.height // 2)) if False else None
        shadow = Image.new('RGBA', p.size, (0, 0, 0, 0))
        paper.alpha_composite(p, (int(cx - p.width / 2), int(cy - p.height / 2)))
    # keep the perforated edge
    arr = np.array(paper); arr[..., 3] = alpha.astype('uint8'); out = Image.fromarray(arr)
    out = draw_text(out, 'Posters', 17.3, 20 * K, 40 * K)
    out = draw_text(out, '02', 24.4, 18 * K, 170 * K)
    out.save(ST + 'posters.webp', quality=90, method=6)
    print('posters')

if __name__ == '__main__':
    for name, new, left in [('experience', '03', True), ('crafts', '04', True), ('photography', '05', False), ('about', '06', True)]:
        renumber(name, new, left, sys.argv[2])
    posters_stamp(sys.argv[2])

