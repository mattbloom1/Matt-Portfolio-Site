"""Second stamp pass (Websites / Projects split, Experience rename, numbers 01-07).
Run from the repo root: python3 -I scripts/restructure-stamps.py PostageStamps-renumbered.pdf
Edits public/stamps/*.webp in place (the PDF is only used to borrow the TheSeasons-Bold font), so run it once on the
pre-split stamps: projects.webp becomes websites.webp, a new projects.webp is built, and every -600.webp is rebuilt."""
import sys, os, shutil, numpy as np
from PIL import Image
sys.argv = [sys.argv[0], sys.argv[1], 'public/stamps']
import importlib.util
spec = importlib.util.spec_from_file_location('ms', 'scripts/make-stamps.py'); ms = importlib.util.module_from_spec(spec); spec.loader.exec_module(ms)
ST = 'public/stamps/'; K = ms.K

def fill(img, box, src_box):
    """Cover box with paper tiled (mirrored) from a clean source box of the same image."""
    a = np.array(img); x0, y0, x1, y1 = box; sx0, sy0, sx1, sy1 = src_box
    src = a[sy0:sy1, sx0:sx1]
    reps_x = -(-(x1 - x0) // src.shape[1]); reps_y = -(-(y1 - y0) // src.shape[0])
    row = np.concatenate([src if i % 2 == 0 else src[:, ::-1] for i in range(reps_x)], 1)
    tile = np.concatenate([row if i % 2 == 0 else row[::-1] for i in range(reps_y)], 0)
    a[y0:y1, x0:x1] = tile[:y1 - y0, :x1 - x0]
    return Image.fromarray(a)

# 1. Websites: old stamp art, new name
im = Image.open(ST + 'projects.webp').convert('RGBA')
im = fill(im, (60, 80, 470, 335), (520, 40, 900, 165))
im = ms.draw_text(im, 'Websites', 17.3, 76, 150)
im.save(ST + 'websites.webp', quality=90, method=6)

# 2. Projects: new stamp (blue paper, dithered Bloc CNC photo and Skate Forge poster)
alpha = np.array(Image.open(ST + 'websites.webp').convert('RGBA'))[..., 3]
paper = fill(Image.open(ST + 'websites.webp').convert('RGBA'), (0, 0, 1000, 682), (520, 40, 900, 165))
pa = np.array(paper).astype(float)
target = np.array([143, 179, 201.0]); pa[..., :3] = np.clip(pa[..., :3] * (target / np.median(pa[..., :3].reshape(-1, 3), 0)), 0, 255)
paper = Image.fromarray(np.dstack([pa[..., :3], alpha]).astype('uint8'), 'RGBA')
def ink(path, w, angle, seed):
    g = Image.open(path).convert('L'); g = g.resize((w, int(g.height * w / g.width)), Image.LANCZOS)
    a = np.clip((np.array(g).astype(float) - 80) * 1.5 + 80, 0, 255)
    dark = a + np.random.default_rng(seed).normal(0, 38, a.shape) < 128
    rgba = np.zeros(a.shape + (4,), 'uint8'); rgba[..., :3] = (10, 12, 10); rgba[..., 3] = np.where(dark, 255, 0)
    sheet = Image.new('RGBA', g.size, (226, 236, 242, 255)); sheet.alpha_composite(Image.fromarray(rgba, 'RGBA'))
    return sheet.rotate(angle, expand=True, resample=Image.BICUBIC)
for path, w, ang, cx, cy, seed in [('public/projects/bloc-cnc/01.webp', 440, 5, 500, 385, 3), ('public/projects/cu-skate-forge/01.webp', 255, -6, 790, 360, 5)]:
    p = ink(path, w, ang, seed); paper.alpha_composite(p, (int(cx - p.width / 2), int(cy - p.height / 2)))
arr = np.array(paper); arr[..., 3] = alpha; out = Image.fromarray(arr)
out = ms.draw_text(out, 'Projects', 17.3, 20 * K, 40 * K)
out = ms.draw_text(out, '02', 24.4, 18 * K, 170 * K)
out.save(ST + 'projects.webp', quality=90, method=6); print('projects')

# 3. Experience: rename; numbers shifted for everything after Projects
im = Image.open(ST + 'experience.webp').convert('RGBA')
im = fill(im, (700, 505, 955, 655), (440, 505, 695, 655))
im = ms.draw_text(im, 'Experience', 17.3, 938, 600, right=True)
im.save(ST + 'experience.webp', quality=90, method=6)
for name, new, left in [('websites', None, True), ('posters', '03', True), ('experience', '04', True), ('crafts', '05', True), ('photography', '06', False), ('about', '07', True)]:
    if new: ms.renumber(name, new, left, ST[:-1])
for n in ['websites', 'projects', 'posters', 'experience', 'crafts', 'photography', 'about']:
    i = Image.open(ST + n + '.webp'); i.resize((600, round(600 * i.height / i.width)), Image.LANCZOS).save(ST + n + '-600.webp', quality=88, method=6)
