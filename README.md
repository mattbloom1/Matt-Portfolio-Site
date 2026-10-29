# Matthew Bloomfield portfolio

Stamp-themed portfolio. Next.js (static export), CSS-first with selective GSAP, Sanity for content, free-tier hosting.

## Run
```
npm install
npm run dev      # http://localhost:3000
npm run build    # static site in ./out
```

## Content (Sanity, free plan)
Project `6zrc4vv3`, dataset `production`. The site reads it at build time (public id, no token needed); each section shows marked placeholders until it has entries.
- Edit content: `cd studio && npm install && npm run dev`. Document types: Project, Craft / experiment, Experience entry, Photography series (`studio/schemaTypes`).
- Add the studio's origin to the project's CORS list only if you later query from the browser. Static builds do not need it.
- Rebuild the site after publishing (Vercel deploy hook or push; a Sanity webhook to the hook can automate it).
Projects and Crafts are separate document types; nothing is duplicated between them.

## Hosting
- Preview: GitHub Pages via `.github/workflows/deploy.yml` (Settings > Pages > Source: GitHub Actions).
- Production: Vercel Hobby (free). Import the repo, no settings needed; leave `NEXT_PUBLIC_BASE_PATH` unset. Then point matthewsbloomfield.com at it once the site is ready to replace the old one.
- Analytics: `@vercel/analytics` (cookieless, free on Hobby).

## Fonts
Edit `src/app/fonts.ts`. Own fonts: add files and use `next/font/local` with the same CSS variable names.

## Docs
Branding, positioning and wireframes are in `docs/`.

