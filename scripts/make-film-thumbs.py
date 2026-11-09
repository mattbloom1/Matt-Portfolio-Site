"""Pick the most contrasty frame of each film roll and save a small 3:2 crop as public/photography/<slug>/thumb.webp
(used by the sticky film strip on the Photography page). Usage: python3 scripts/make-film-thumbs.py"""
import glob, os
from PIL import Image, ImageStat

for d in sorted(glob.glob('public/photography/*/')):
    best, score = None, -1
    for f in sorted(glob.glob(d + '[0-9][0-9]-800.webp')):
        im = Image.open(f).convert('L')
        s = ImageStat.Stat(im).stddev[0]
        if s > score: best, score = f, s
    if not best: continue
    im = Image.open(best).convert('RGB')
    w, h = im.size
    tw, th = 3, 2
    if w / h > tw / th:
        nw = int(h * tw / th); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:
        nh = int(w * th / tw); im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    im = im.resize((240, 160), Image.LANCZOS)
    im.save(d + 'thumb.webp', quality=70)
    print(d, os.path.basename(best), round(score, 1), os.path.getsize(d + 'thumb.webp'))
