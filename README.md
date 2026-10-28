# Matthew Bloomfield portfolio

Stamp-themed portfolio. Next.js (static export), CSS-first with selective GSAP, Sanity for content, free-tier hosting.

## Run
```
npm install
npm run dev      # http://localhost:3000
npm run build    # static site in ./out
```

## Content (Sanity, free plan)
Without a Sanity project the site shows clearly marked placeholders. To connect content:
1. `cd studio && npm install && npx sanity init --env` (create a free project, dataset `production`).
2. Add `NEXT_PUBLIC_SANITY_PROJECT_ID` (and optional `NEXT_PUBLIC_SANITY_DATASET`) to Vercel / GitHub Actions env.
3. `npm run dev` in `studio/` to edit Projects, Crafts and Experience. Schemas live in `studio/schemaTypes`.
Projects and Crafts are separate document types; nothing is duplicated between them.

## Hosting
- Preview: GitHub Pages via `.github/workflows/deploy.yml` (Settings > Pages > Source: GitHub Actions).
- Production: Vercel Hobby (free). Import the repo, no settings needed; leave `NEXT_PUBLIC_BASE_PATH` unset. Then point matthewsbloomfield.com at it once the site is ready to replace the old one.
- Analytics: `@vercel/analytics` (cookieless, free on Hobby).

## Fonts
Edit `src/app/fonts.ts`. Own fonts: add files and use `next/font/local` with the same CSS variable names.

## Docs
Branding, positioning and wireframes are in `docs/`.
