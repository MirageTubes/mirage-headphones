# Mirage — Headphone Concept

> The city hums in one key. You walk in yours.

An interactive, scroll-driven website for an independent headphone concept by **Mirage**. It is a design study, not an official product site.

**Live site:** https://mirage-headphones.vercel.app

## What's inside

- **A walk, in step** (`/`): a 300-frame walking animation that plays as you scroll, drawn on a canvas and loaded progressively.
- **Product intro**: a transparent product render with scroll-cued typography.
- **Design story** (`/design`): an interactive chameleon portrait. Its eyes follow your cursor and its head turns toward it, using a WebGL warp with SVG-masked iris layers. It stays still on touch devices and for visitors who prefer reduced motion.

## Tech

- [Next.js 16](https://nextjs.org) (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS v4
- WebGL for the head movement, plus canvas and SVG for the frame sequence and eyes

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Project layout

```
src/app/page.tsx                  Home: hero, product intro, scroll walk
src/app/design/page.tsx           Design story chapter
src/components/ScrollWalk.tsx     Scroll-driven frame sequence
src/components/InteractiveChameleon.tsx   Cursor-tracking eyes and head
src/lib/headWarp.ts               WebGL head-turn warp
src/lib/chameleonEyes.ts          Eye and head positions on the image
public/images/                    Frames and artwork
```

## Deploy

Every push to `main` deploys automatically to Vercel.

---

© Mirage. An independent concept, not affiliated with any brand shown.
