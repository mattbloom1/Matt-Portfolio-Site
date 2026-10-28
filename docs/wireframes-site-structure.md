# Wireframes and Site Structure (v1)

## Decisions carried over
Five stamps. Nav labels use the stamp names: Projects (01 Web & Graphic Design), Experience (02 Work History), About (03), Crafts (04), Photography (05). Logo, opener stamp and micrographs are placeholders until Matt supplies them.

## Site map
One page app with a state machine, no page reloads. Each state has a URL hash for deep links and back button.
- `#/` Opener, then Nav stamps
- `#/projects`, `#/experience`, `#/about`, `#/crafts`, `#/photography`
Content lives in plain JSON/Markdown files, one per section.

## States and transitions
| State | What the visitor sees | Transition out |
|---|---|---|
| S0 Opener | Centered opener stamp (logo, name, date) on paper, footer visible, Skip button | After 4 s or Skip: stamp scales up with blur and ink bleed to full screen, then fades |
| S1 Nav | Five stamps at varied sizes and rotations, blown in from left and right edges (staggered, 0 to 400 ms), settle with shadow and corner lift | Hover: nudge 4 to 8 px away from cursor, slight rotate. Click: S2 |
| S2 Page | Selected stamp scales up and ink-bleeds into a heavily blurred background. Other four fly to a top-left mini nav. Content fades in. Home button top right | Click mini stamp: active stamp shrinks into the mini nav and swaps places, new page loads. Home: back to S1 |

## Wireframes (desktop 1440x900)

S0 Opener
```
+--------------------------------------------------+
|                                                  |
|                 +--------------+                 |
|                 |  [logo]      |                 |
|                 |  MATT        |                 |
|                 |  BLOOMFIELD  |                 |
|                 |  date        |      [Skip]     |
|                 +--------------+                 |
| micrographs · name · email        micrographs·time|
+--------------------------------------------------+
```

S1 Nav
```
+--------------------------------------------------+
|                                                  |
|    [02]    [01]      [03]    [04]    [05]        |
|     ┌──┐    ┌─┐       ┌─┐     ┌─┐   ┌────┐       |
|   staggered heights, sizes, small rotations      |
| micrographs · name · email        micrographs·time|
+--------------------------------------------------+
```

S2 Page
```
+--------------------------------------------------+
| [mini][mini][mini][mini]                    [home]|
|                                                  |
|        section content over blurred stamp        |
|                                                  |
| micrographs · name · email        micrographs·time|
+--------------------------------------------------+
```

## Section content layouts
- Projects: grid of project cards (image, title, role, year), modeled on the moodboard projects page. Click opens a project detail overlay.
- Experience: vertical timeline, role, company, dates, bullets.
- About: portrait, short bio, skills, contact links.
- Crafts: masonry gallery of pottery and other work with captions.
- Photography: film-strip style gallery with lightbox.

## Responsive
- Tablet: nav stamps in two rows, same blow-in.
- Mobile: stamps stacked in a loose vertical scatter, blow-in from sides kept but shorter; mini nav becomes a horizontal scroll strip at top; footer collapses to two lines.
- Reduced motion: no blow-in or bleed, 200 ms crossfades.

## Components
Footer (name, email, live local time), MiniNav, Stamp (perforated mask, grain, shadow), InkBleedTransition, OpenerStamp, HomeButton, ProjectCard, Timeline, Gallery, Lightbox.

## Tech structure
Vite + TypeScript, GSAP, hash router, SVG filters. Folders: `src/components`, `src/sections`, `src/content`, `src/styles`, `public/stamps` (optimized WebP of the five exports), `docs/` (these planning docs).
Note: stamp PNGs are 2 to 3 MB each, so optimize them to WebP at about 1200 px.

## Accessibility
Stamps are links with names like "Projects, stamp 01", visible focus ring, focus moves to page heading on change, Skip control on opener, content readable without animation.

## Audit follow-ups (Haiku audit, v1)
- Routing: `#/` is the opener once per session (sessionStorage flag), then the nav. Back, reload or a deep link such as `#/projects` skips the opener and plays only a short stamp entrance. Opener hold is 4 s, paused while the tab is hidden. Unknown hashes go to `#/`.
- Fan entrance: each nav stamp is its own artwork with a fixed origin side (alternating left and right), a 12 to 25 degree arc, rotation settling to a small fixed tilt, and a 60 ms stagger. Landing positions are fixed per breakpoint in a layout table, written during the build.
- S2: the blurred background is the selected stamp image scaled to cover, blur about 60 px, at 0.9 opacity under a paper tint. Ink bleed 700 ms, ease-out. The displaced active stamp takes the clicked mini stamp's slot. Clicks during a transition are ignored.
- Overlays (project detail, lightbox) get a hash (`#/projects/slug`), Escape and back close them, and focus returns to the trigger.
- Home: from S2 it returns to S1 with the blow-in replayed. On mobile it stays top right and the mini nav strip sits below it.
- Breakpoints: mobile under 640 px, tablet 640 to 1024 px. Footer is sticky on S0 and S1 and static at the end of the content on S2. Mobile footer: line 1 name and email, line 2 time.
- Hover nudge has a keyboard-focus equivalent (same nudge), and tap on touch. Reduced motion skips the auto-advance only if Skip is used; otherwise the opener crossfades after 4 s.
- Content: one JSON file per section with title, year, image, alt, caption, body. Footer clock shows Matt's local time zone (America/New_York, to confirm). Opener date is static.
- Build budget: images decoded lazily with a paper-coloured placeholder, SVG filter used only in transitions, CSS blur fallback on Safari and mobile.
