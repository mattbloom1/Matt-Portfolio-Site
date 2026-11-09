# Scene kits

Scene kits exported from Matt's mockup PSDs (read-only; originals untouched). Each `kits/<id>/` holds:

- `meta.json` - `canvas` [W,H] of the exported images, `scale` (export px / PSD px), `screens[]` (primary screen smart objects: `name`, `quad`, `content` [w,h]), plus `reflections[]` and `linked_effects[]` where the PSD has them, and `notes`.
- `bg.jpg` - flattened scene with every screen smart object (and layers clipped to it) hidden.
- `over.png` - RGBA overlay to put on top of the warped screen: glare, reflections, shadows, bezel/frame pixels near the screen edge. Restricted to the screen quad, so it is safe to composite everywhere. Derived by rendering the PSD with the screen set to black and to white and solving per pixel for colour/alpha (exact for Normal/Screen/Multiply-style layers, approximate for coloured Multiply).
- `preview.jpg` - scene with the original placeholder screen, 1200 px wide.
- `selftest.jpg` - checkerboard test image warped through the kit (bg + warp + over), to confirm the coordinate convention.

## Coordinate convention

`quad` is `[[x,y] x4]` in **export pixels** (origin top-left, y down), ordered content top-left, top-right, bottom-right, bottom-left (content corner i maps to quad[i]). Taken from the placed layer's nonAffineTransform (fallback Trnf), scaled by `scale`. In OpenCV: `M = cv2.getPerspectiveTransform([[0,0],[w,0],[w,h],[0,h]], quad)`; `cv2.warpPerspective(content, M, canvas)`. `content` is the pixel size of the smart object's embedded document, which is the size to render your screenshot at.

Composite order: `bg.jpg` -> warped screens -> optional `linked_effects` (warp the same content with the listed blend/opacity) -> `over.png`. `reflections` are mirrored copies on glossy surfaces (blend/opacity in meta, often with a fade mask in the PSD that is not exported).

Export size: long side max 2600 px. `over.png` is rebuilt at full PSD resolution and downsampled.

## Scenes

| id | source zip (psd) | canvas | screens | content size(s) | over coverage |
|---|---|---|---|---|---|
| air-01 | laptop-mockup-2026-10-22-13-37-42-utc.zip (01_macbook air mockup.psd) | 2600x1733 | 1 | 2880x1864 | 0.099 |
| air-02 | laptop-mockup-2026-10-22-13-37-42-utc.zip (02_macbook air mockup.psd) | 2600x1733 | 1 | 2880x1864 | 0.193 |
| air-03 | laptop-mockup-2026-10-22-13-37-42-utc.zip (03_macbook air mockup.psd) | 2600x1733 | 1 | 2880x1864 | 0.098 |
| air-04 | laptop-mockup-2026-10-22-13-37-42-utc.zip (04_macbook air mockup.psd) | 2600x1733 | 1 | 2880x1864 | 0.083 |
| cafe | laptop-mockup-desk-setup-cafe-2026-10-22-10-11-59-utc.zip (cafe_Baby-Laptop-Desk-Setup-Cafe.psd) | 2600x2600 | 1 | 3475x2121 | 0.080 |
| chair-mustard | laptop-mockup-2026-10-23-03-16-55-utc.zip (02. Laptop Mockup.psd) | 2600x1950 | 1 | 2560x1600 | 0.081 |
| chair-red | laptop-mockup-2026-10-23-03-16-55-utc.zip (01. Laptop Mockup.psd) | 2600x1950 | 1 | 2560x1600 | 0.162 |
| chair-teal | laptop-mockup-2026-10-23-03-16-55-utc.zip (03. Laptop Mockup.psd) | 2600x1950 | 1 | 2560x1600 | 0.124 |
| desk-01 | website-mockup-2026-10-23-03-56-13-utc.zip (01. Laptop Mockup.psd) | 2600x1950 | 1 + 1 reflection | 3456x2234 | 0.155 |
| desk-02 | website-mockup-2026-10-23-03-56-13-utc.zip (02. Laptop Mockup.psd) | 2600x1950 | 1 | 3456x2234 | 0.168 |
| desk-03 | website-mockup-2026-10-23-03-56-13-utc.zip (03. Laptop Mockup.psd) | 2600x1950 | 1 + 1 reflection | 3456x2234 | 0.108 |
| f-2a | laptop-mockup-2026-10-22-10-11-27-utc.zip (Macbook Mockup F.2a.psd) | 2600x1733 | 1 + 2 linked effect | 3456x2234 | 0.123 |
| f-2b | laptop-mockup-2026-10-22-10-11-27-utc.zip (Macbook Mockup F.2b.psd) | 2600x1733 | 1 + 2 linked effect | 3456x2234 | 0.143 |
| float-phone-4hh | floating-smartphone-mockup-with-colorful-gradient-2026-10-22-23-17-43-utc.zip (gradient_Phone-Mockup-4hh.psd) | 2600x1734 | 1 | 1858x4022 | 0.047 |
| float-phone-5hh | floating-smartphone-mockup-with-colorful-gradient-2026-10-22-23-17-43-utc.zip (gradient_Phone-Mockup-5hh.psd) | 2600x1734 | 1 | 1858x4022 | 0.035 |
| float-phone-6hh | floating-smartphone-mockup-with-colorful-gradient-2026-10-22-23-17-43-utc.zip (gradient_Phone-Mockup-6hh.psd) | 2600x1734 | 1 | 1858x4022 | 0.064 |
| iphone-rock-1 | outdoor-iphone-pro-max-mockup-2026-10-22-08-31-23-utc.zip (Realistic Outdoor iPhone 14 Pro Max Mockup 1.psd) | 2600x1733 | 1 | 987x2128 | 0.036 |
| iphone-rock-2 | outdoor-iphone-pro-max-mockup-2026-10-22-08-31-23-utc.zip (Realistic Outdoor iPhone 14 Pro Max Mockup 2.psd) | 2600x1733 | 1 | 987x2128 | 0.006 |
| iphone-rock-3 | outdoor-iphone-pro-max-mockup-2026-10-22-08-31-23-utc.zip (Realistic Outdoor iPhone 14 Pro Max Mockup 3.psd) | 2600x1733 | 1 | 987x2128 | 0.006 |
| m3-1 | laptop-mockup-2026-10-23-01-31-35-utc.zip (Macbook Pro M3 Mockup_1.psd) | 2600x1950 | 1 + 1 reflection | 2343x1566 | 0.107 |
| m3-2 | laptop-mockup-2026-10-23-01-31-35-utc.zip (Macbook Pro M3 Mockup_2.psd) | 2600x1950 | 1 + 1 reflection | 2343x1566 | 0.101 |
| poster-01 | outdoor-mockup-2026-10-23-03-47-54-utc.zip (01. Outdoor 3 Poster Mockup.psd) | 2600x1950 | 3 | 1017x1439; 1017x1439; 1017x1439 | 0.256 |
| poster-02 | outdoor-mockup-2026-10-23-03-47-54-utc.zip (02. Outdoor 3 Poster Mockup.psd) | 2600x1950 | 3 | 1017x1439; 1017x1439; 1017x1439 | 0.229 |
| poster-03 | outdoor-mockup-2026-10-23-03-47-54-utc.zip (03. Outdoor 3 Poster Mockup.psd) | 2600x1950 | 3 | 1017x1439; 1017x1439; 1017x1439 | 0.221 |
| vintage-01 | laptop-on-vintage-chair-with-green-plant-mockup-2026-10-22-07-57-14-utc.zip (chair_labtop-mockup-01.psd) | 2600x1733 | 1 | 2560x1600 | 0.090 |
| vintage-02 | laptop-on-vintage-chair-with-green-plant-mockup-2026-10-22-07-57-14-utc.zip (chair_labtop-mockup-02.psd) | 2600x1733 | 1 | 2560x1600 | 0.092 |
| vintage-03 | laptop-on-vintage-chair-with-green-plant-mockup-2026-10-22-07-57-14-utc.zip (chair_labtop-mockup-03.psd) | 2600x1733 | 1 | 2560x1600 | 0.274 |
| web-01 | website-mockup-2026-10-23-03-57-20-utc.zip (01. Website Mockup.psd) | 2600x1950 | 1 + 1 reflection | 2302x1496 | 0.003 |
| web-02 | website-mockup-2026-10-23-03-57-20-utc.zip (02. Website Showcase Mockup.psd) | 2600x1950 | 1 + 1 reflection | 2302x1496 | 0.003 |
| web-03 | website-mockup-2026-10-23-03-57-20-utc.zip (03. Website Showcase Mockup.psd) | 2600x1950 | 1 | 2302x1496 | 0.010 |

## Notes per scene

### air-01 - MacBook Air sand/rock scene 1
- "DESIGN" is a linked copy at opacity 0 (ignored)
- layer "Your Design Here" has a raster mask (screen shape, e.g. rounded corners)
- smart object "Your Design Here" has no rasterised pixels in the PSD (empty bbox); screen drawn as black in PSD composites; quad still valid
- smart object "DESIGN" has no rasterised pixels in the PSD (empty bbox); screen drawn as black in PSD composites; quad still valid
- "DESIGN" (linked_effect) uses blend=normal opacity=0.0
- also hid layer "DESIGN" (path [3]) (unused duplicate)

### air-02 - MacBook Air sand/rock scene 2
- "DESIGN" is a linked copy at opacity 0 (ignored)
- layer "Your Design Here" has a raster mask (screen shape, e.g. rounded corners)
- smart object "Your Design Here" has no rasterised pixels in the PSD (empty bbox); screen drawn as black in PSD composites; quad still valid
- smart object "DESIGN" has no rasterised pixels in the PSD (empty bbox); screen drawn as black in PSD composites; quad still valid
- "DESIGN" (linked_effect) uses blend=normal opacity=0.0
- also hid layer "DESIGN" (path [3]) (unused duplicate)

### air-03 - MacBook Air sand/rock scene 3
- "DESIGN" is a linked copy at opacity 0 (ignored)
- layer "Your Design Here" has a raster mask (screen shape, e.g. rounded corners)
- smart object "Your Design Here" has no rasterised pixels in the PSD (empty bbox); screen drawn as black in PSD composites; quad still valid
- smart object "DESIGN" has no rasterised pixels in the PSD (empty bbox); screen drawn as black in PSD composites; quad still valid
- "DESIGN" (linked_effect) uses blend=normal opacity=0.0
- also hid layer "DESIGN" (path [3]) (unused duplicate)

### air-04 - MacBook Air sand/rock scene 4
- "DESIGN" is a linked copy at opacity 0 (ignored)
- layer "Your design Here" has a raster mask (screen shape, e.g. rounded corners)
- smart object "Your design Here" has no rasterised pixels in the PSD (empty bbox); screen drawn as black in PSD composites; quad still valid
- smart object "DESIGN" has no rasterised pixels in the PSD (empty bbox); screen drawn as black in PSD composites; quad still valid
- "DESIGN" (linked_effect) uses blend=normal opacity=0.0
- also hid layer "DESIGN" (path [3]) (unused duplicate)

### cafe - Cafe desk setup laptop
- layer "Your Design Here" has a raster mask (screen shape, e.g. rounded corners)

### chair-mustard - Laptop on velvet chair (mustard)
- layer "Wallpaper Design" has a raster mask (screen shape, e.g. rounded corners)
- also hid layer "Color" (path [1]) (solid colour fill under screen)

### chair-red - Laptop on velvet chair (red)
- layer "Wallpaper Design" has a raster mask (screen shape, e.g. rounded corners)
- also hid layer "Color" (path [1]) (solid colour fill under screen)

### chair-teal - Laptop on velvet chair (teal)
- layer "Wallpaper Design" has a raster mask (screen shape, e.g. rounded corners)
- also hid layer "Color" (path [1]) (solid colour fill under screen)

### desk-01 - Dark desk laptop 1
- layer "Place Your Design Here (Double Click to Edit)" has a raster mask (screen shape, e.g. rounded corners)
- layer "Duplicate (Don't Edit)" has a raster mask
- "Duplicate (Don't Edit)" (reflection) uses blend=linear_dodge opacity=1.0
- "Duplicate (Don't Edit)" is a reflection/secondary quad; quad order follows content corners (content TL -> quad[0]); mirrored=True

### desk-02 - Dark desk laptop 2
- layer "Place Your Design Here (Double Click to Edit)" has a raster mask (screen shape, e.g. rounded corners)

### desk-03 - Dark desk laptop 3
- layer "Place Your Design Here (Double Click to Edit)" has a raster mask (screen shape, e.g. rounded corners)
- layer "Duplicate (Don't Edit)" has a raster mask
- "Duplicate (Don't Edit)" (reflection) uses blend=linear_dodge opacity=1.0
- "Duplicate (Don't Edit)" is a reflection/secondary quad; quad order follows content corners (content TL -> quad[0]); mirrored=True

### f-2a - Florida MacBook on boulder with palms (F.2a)
- "Screen Glow" is a linked copy of the screen content (blend=screen opacity=0.2); hidden in bg and not in over.png; composite it yourself: warp the same content with that blend/opacity; the PSD copy is blurred (glow) - approximate with a gaussian blur
- "FX Screen Brightness" is a linked copy of the screen content (blend=screen opacity=0.4); hidden in bg and not in over.png; composite it yourself: warp the same content with that blend/opacity
- layer "Design Place (Do Not Modify)" has a raster mask (screen shape, e.g. rounded corners)
- layer "Screen Glow" has a raster mask
- "Screen Glow" (linked_effect) uses blend=screen opacity=0.2
- layer "FX Screen Brightness" has a raster mask
- "FX Screen Brightness" (linked_effect) uses blend=screen opacity=0.4
- layers clipped to the screen layer, hidden in bg: FX Screen Brightness

### f-2b - Florida MacBook on boulder with palms (F.2b)
- "Screen Glow" is a linked copy of the screen content (blend=screen opacity=0.2); hidden in bg and not in over.png; composite it yourself: warp the same content with that blend/opacity; the PSD copy is blurred (glow) - approximate with a gaussian blur
- "FX Screen Brightness" is a linked copy of the screen content (blend=screen opacity=0.4); hidden in bg and not in over.png; composite it yourself: warp the same content with that blend/opacity
- layer "Design Place (Do Not Modify)" has a raster mask (screen shape, e.g. rounded corners)
- layer "Screen Glow" has a raster mask
- "Screen Glow" (linked_effect) uses blend=screen opacity=0.2
- layer "FX Screen Brightness" has a raster mask
- "FX Screen Brightness" (linked_effect) uses blend=screen opacity=0.4
- layers clipped to the screen layer, hidden in bg: FX Screen Brightness

### float-phone-4hh - Floating smartphone colorful gradient (Phone Mockup_4hh)
- "Your Design" (screen) uses blend=multiply opacity=1.0
- also hid layer "Your Design" (path [0]) (unused duplicate)
- Screen is a Multiply-blend smart object clipped onto the phone's "Screen" pixel layer (design multiplies over that base); selftest applies a plain warp, so colours in the real PSD would be darker on dark base. A second hidden duplicate "Your Design" sat at the very bottom of the PSD under an opaque Background and was ignored.

### float-phone-5hh - Floating smartphone colorful gradient (Phone Mockup_5hh)
- "Your Design" (screen) uses blend=multiply opacity=1.0
- also hid layer "Your Design" (path [0]) (unused duplicate)
- Screen is a Multiply-blend smart object clipped onto the phone's "Screen" pixel layer (design multiplies over that base); selftest applies a plain warp, so colours in the real PSD would be darker on dark base. A second hidden duplicate "Your Design" sat at the very bottom of the PSD under an opaque Background and was ignored.

### float-phone-6hh - Floating smartphone colorful gradient (Phone Mockup_6hh)
- "Your Design" (screen) uses blend=multiply opacity=1.0
- also hid layer "Your Design" (path [0]) (unused duplicate)
- Screen is a Multiply-blend smart object clipped onto the phone's "Screen" pixel layer (design multiplies over that base); selftest applies a plain warp, so colours in the real PSD would be darker on dark base. A second hidden duplicate "Your Design" sat at the very bottom of the PSD under an opaque Background and was ignored.

### iphone-rock-1 - iPhone 14 Pro Max outdoor on rock 1
- layer "iPhone 14 Pro Max" has a raster mask (screen shape, e.g. rounded corners)

### iphone-rock-2 - iPhone 14 Pro Max outdoor on rock 2
- layer "iPhone 14 Pro Max" has a raster mask (screen shape, e.g. rounded corners)

### iphone-rock-3 - iPhone 14 Pro Max outdoor on rock 3
- layer "iPhone 14 Pro Max" has a raster mask (screen shape, e.g. rounded corners)

### m3-1 - MacBook Pro M3 plinth with flowering branch 1
- layer "Your Design Here" has a raster mask (screen shape, e.g. rounded corners)
- layer "Your Design Here" has a raster mask
- "Your Design Here" (reflection) uses blend=multiply opacity=0.169
- "Your Design Here" is a reflection/secondary quad; quad order follows content corners (content TL -> quad[0]); mirrored=True
- also hid layer "DELETE THIS LAYER" (path [4]) (unused duplicate)
- Top-level pixel layer "DELETE THIS LAYER" (white card saying it is for size optimisation) was hidden everywhere, including preview.jpg; the embedded Photoshop preview shows only that card.

### m3-2 - MacBook Pro M3 plinth with flowering branch 2
- layer "Your Design Here" has a raster mask (screen shape, e.g. rounded corners)
- layer "Your Design Here" has a raster mask
- "Your Design Here" (reflection) uses blend=multiply opacity=0.169
- "Your Design Here" is a reflection/secondary quad; quad order follows content corners (content TL -> quad[0]); mirrored=True
- also hid layer "DELETE THIS LAYER" (path [4]) (unused duplicate)
- Top-level pixel layer "DELETE THIS LAYER" (white card saying it is for size optimisation) was hidden everywhere, including preview.jpg; the embedded Photoshop preview shows only that card.

### poster-01 - Outdoor 3-poster board 1
- layer "Place Your Design Here (Double Click to Edit)" has a raster mask (screen shape, e.g. rounded corners)
- layer "Place Your Design Here (Double Click to Edit)" has a raster mask (screen shape, e.g. rounded corners)
- layer "Place Your Design Here (Double Click to Edit)" has a raster mask (screen shape, e.g. rounded corners)

### poster-02 - Outdoor 3-poster board 2
- layer "Place Your Design Here (Double Click to Edit)" has a raster mask (screen shape, e.g. rounded corners)
- layer "Place Your Design Here (Double Click to Edit)" has a raster mask (screen shape, e.g. rounded corners)
- layer "Place Your Design Here (Double Click to Edit)" has a raster mask (screen shape, e.g. rounded corners)

### poster-03 - Outdoor 3-poster board 3
- layer "Place Your Design Here (Double Click to Edit)" has a raster mask (screen shape, e.g. rounded corners)
- layer "Place Your Design Here (Double Click to Edit)" has a raster mask (screen shape, e.g. rounded corners)
- layer "Place Your Design Here (Double Click to Edit)" has a raster mask (screen shape, e.g. rounded corners)

### vintage-01 - Laptop on vintage chair with green plant 1
- none

### vintage-02 - Laptop on vintage chair with green plant 2
- none

### vintage-03 - Laptop on vintage chair with green plant 3
- none

### web-01 - Website mockup 01
- layer "Place Your Design Here (Double Click to Edit)" has a raster mask (screen shape, e.g. rounded corners)
- layer "Place Your Design Here (Double Click to Edit)" has a raster mask
- "Place Your Design Here (Double Click to Edit)" is a reflection/secondary quad; quad order follows content corners (content TL -> quad[0]); mirrored=True

### web-02 - Website showcase 02
- layer "Place Your Design Here (Double Click to Edit)" has a raster mask (screen shape, e.g. rounded corners)
- layer "Place Your Design Here (Double Click to Edit)" has a raster mask
- "Place Your Design Here (Double Click to Edit)" is a reflection/secondary quad; quad order follows content corners (content TL -> quad[0]); mirrored=True

### web-03 - Website showcase 03
- layer "Place Your Design Here (Double Click to Edit)" has a raster mask (screen shape, e.g. rounded corners)
