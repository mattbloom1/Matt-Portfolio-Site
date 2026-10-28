# Matt Bloomfield Portfolio: Branding and Positioning (v1)

## Concept
A drawer of collected postage stamps. Each section of the site is a stamp Matt "issued": tactile, printed, slightly imperfect. Digital craft with an analog soul.

## Positioning
Matt Bloomfield is a designer and maker who works across web and graphic design, photography, and hands-on crafts (pottery). The site shows range held together by one consistent hand. Tone: warm, curious, quietly confident, not corporate.

Working tagline options (pick one): "Collected works." / "Issued by Matt Bloomfield." / "Small things, made well."

## Audience
1. Hiring managers and studios (design / web roles)
2. Freelance and collaboration prospects
3. Peers and friends who want to see the craft side

## Sections (stamp numbering from Matt's artwork)
| No. | Stamp | Orientation | Nav name | Ground colour (approx.) | Motif |
|---|---|---|---|---|---|
| 01 | Web & Graphic Design | portrait | Projects | ochre #C4B268 | CRT computer |
| 02 | Work History | landscape | Experience | dusty rose #C9A0A0 | suitcase |
| 03 | About | portrait | About | sky blue #8FB3C9 | halftone portrait |
| 04 | Crafts | portrait | Crafts | green #7FBF7A | pottery |
| 05 | Photography | landscape | Photography | sage #A9C0BF | Minolta X-700 |

Open question: the brief lists four sections (Experience, Projects, Crafts, About) but the artwork has five (adds Photography). Proposal: keep Photography as a fifth stamp.

## Visual language (from the moodboard and stamps)
- Perforated stamp edges, paper grain, mixed portrait and landscape sizes
- One-colour halftone/grain photography in near-black ink on a flat coloured ground
- Large numerals (01 to 05) as catalogue numbers
- Micrographics footer (tiny marks, signature, coordinates, time) like postal cancellation marks
- Moodboard references: North Star Safari stamp mark, the six-stamp set on black, Studio Ping Pong's big list nav with tiny italic captions, bold type collage

## Palette
- Paper: #ECE9E2 (warm grey off-white, textured). Light only for v1; no dark mode (the stamps are the colour).
- Ink: #141414
- Stamp grounds: the five colours above (desaturated, vintage)
- Accent for hover/focus: Ink on paper only; colour belongs to the stamps

## Typography
- Display and stamp labels: high-contrast didone/old-style serif, as in the stamp artwork (Matt to confirm exact font from the .ai file). Free stand-in: Cormorant Garamond or Playfair Display.
- Micrographics and UI captions: small monospace or condensed sans, uppercase, wide tracking (e.g. IBM Plex Mono, Space Mono)
- Body: a quiet serif or neutral sans (e.g. Newsreader or Inter) at generous size

## Voice
Short, dry, specific. Captions like postal notes: "Issued 2026", "Cancelled in New Jersey". Avoid buzzwords.

## Motion principles (from wireframe brief)
1. Opener stamp (logo, name, date) holds 3 to 5 s, then scales up and fades with gaussian blur and ink bleed
2. Nav stamps blow in from left and right sides as if by a fan, each with unique size, texture, shadow and corner lift
3. Hover nudges the stamp as if pushed
4. Selecting a stamp blows the others to the top-left as a mini nav while the chosen stamp scales up with ink bleed into the page; page background is that stamp, heavily blurred
5. Home button top right returns to the opener/nav view
6. Persistent footer: micrographics + name + email (left), micrographics + live time (right)
7. Respect prefers-reduced-motion with simple crossfades

## Proposed tech (for the next phase)
Vite + vanilla TypeScript or Astro, GSAP (motion), SVG filters (feTurbulence/feDisplacementMap for ink bleed), CSS for perforation masks, deployed via GitHub Pages or Cloudflare Pages.

## Assets found (Google Drive, "Stamps" folder)
Exports for all five stamps (PNG), plus source PSD/AI files and a "Gearbook - Just Go Outside" video. Missing: logo, opener stamp, micrographic set.

## Audit follow-ups (Haiku audit, v1)
- Dark mode dropped for v1 (ink on #151515 would be about 1:1).
- Ink #141414 on all five grounds measures roughly 7.9:1 to 9.6:1 (AAA). Exact hexes to be sampled from the final PNGs; keep a rendered-contrast floor of 4.5:1 after grain and blur.
- Opener: fixed 4 s hold with a visible Skip control; skipped automatically for reduced motion.
- Reduced motion: no blow-in, nudge, bleed or blur animation; use 200 ms crossfades and static stamps.
- Nav stamps are real links with accessible names (e.g. "Projects, stamp 01"), logical tab order, and a 3 px paper-and-ink double focus ring (3:1 over any ground). Focus moves to the page heading on navigation.
- Open decisions for Matt: tagline, display font, 4 vs 5 sections, "Experience" vs "Work History" naming.
- Still needed: logo, opener stamp, micrograph set. Footer minimum text size 11 px at 4.5:1.
- Performance: animate transforms and opacity first; SVG ink-bleed filter only during transitions; CSS blur fallback for Safari and mobile.
