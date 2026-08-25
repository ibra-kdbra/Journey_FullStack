---
title: Astro Starter
description: Content-first rendering with islands, where the constraint is how little JavaScript reaches the browser.
project: astro-starter
track: tooling
stack: [Astro 7, React, Tailwind v4, Sitemap]
status: reference
compare: [learning-doc, sveltekit]
---

The only project here whose architecture is driven by a *deletion* budget: every
kilobyte of JavaScript that reaches the browser has to be justified.

## What problem shape is this for?

Content-heavy sites — marketing pages, documentation, blogs — where most of the
page is static and interactivity is localised to a few components.

## The layer map

```
src/
  layouts/        global.css lives here, and is where Tailwind is configured
  pages/          file-based routes
  components/     .astro (zero JS) and .tsx (islands)
astro.config.mjs  react, svgr, sitemap, compression
tailwind.config.cjs
```

The meaningful boundary is not a directory — it is the file extension. `.astro`
components render to HTML and ship nothing; `.tsx` components ship a runtime and
must opt in with a `client:*` directive. The architecture is enforced by which
extension you reach for.

## The idea it demonstrates most clearly

**Islands are dependency inversion for the browser.** The page does not depend on
React; it depends on "a component", and only the islands bring a runtime. Adding
interactivity to one widget does not change the cost of the rest of the page.

The design system in `tailwind.config.cjs` is the second thing worth reading: a
full typographic scale, container padding per breakpoint, and named animations —
the same vocabulary the repository's [DESIGN.md](https://github.com/ibra-kdbra/Journey_FullStack/blob/main/DESIGN.md)
formalises.

## What it deliberately does not do

- No CMS. Content is files.
- No SSR adapter — it builds static output, which is the case Astro is strongest for.

## Running it

```bash
cd astro-starter
npm install
npm run dev          # http://localhost:4321
npm run build
npm run preview
```

## Notes from the last repair pass

The project had already moved to Tailwind v4 via `@tailwindcss/vite`, but a
leftover `postcss.config.js` remained — CommonJS syntax inside a `"type": "module"`
package, which crashed the build before it started. It is deleted. The v3 theme
config survives as `tailwind.config.cjs`, loaded through an `@config` directive in
`global.css`, so none of the design tokens were lost.

## Read alongside

- [`learning-doc`](/atlas/learning-doc) — the same content-site problem, solved with Nuxt.
- [`sveltekit`](/atlas/sveltekit) — the opposite end: an app where nearly everything is interactive.
