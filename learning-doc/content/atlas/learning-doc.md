---
title: Engineering Atlas (this site)
description: The Nuxt Content platform that renders the Atlas and the course material.
project: learning-doc
track: tooling
stack: [Nuxt 4, Nuxt Content, Tailwind, Pinia]
status: reference
compare: [astro-starter, nuxt-clean-architecture]
---

You are reading its output. Included in the Atlas because a documentation
platform is a real application with real architectural decisions, and because
this one is the reason the rest of the repository can explain itself.

## What problem shape is this for?

Long-form technical content that needs navigation, cross-referencing and a
design system — where the content is files in git rather than rows in a CMS,
and where every page is servable as static output with no backend behind it.

## The layer map

```
content/
  atlas/          one entry per project in this monorepo
  courses/        rust, golang, redis, fastapi, docker, flutter, gin,
                  supabase, raspberry, nextjs, korean
components/
  ui/  common/  content/  course/  docs/  custom/
composables/      useTheme  useCodeInputAnalysis
utils/
  atlas.ts        the project registry this site renders
  academy.ts      the course registry, checked against content/courses/
assets/css/       courses.css — the design tokens
server/api/
```

Every route resolves through `queryCollection`, so the content tree is the only
source of pages. That is a deliberate correction: the course section used to
read its lessons from a PocketBase collection instead, which meant 129 markdown
files were carried in the repository while every lesson URL returned HTTP 500.

## The idea it demonstrates most clearly

**Content as a typed collection.** `content.config.ts` defines the schema, so a
malformed Atlas entry is a build failure rather than a broken page. The Atlas
entries carry a `project:` field, and the repository's
`check-manifest.mjs` cross-validates it against `.github/projects.json` — which
means documentation drift fails CI.

That is the design goal worth stealing: the docs are not a parallel artifact that
rots, they are checked against the same source of truth CI uses.

`assets/css/courses.css` is the second piece. Every colour in this site resolves
through a custom property defined there; `DESIGN.md` at the repository root
documents that token set so coding agents can generate matching UI.

## What it deliberately does not do

- No authentication, comments, progress tracking or exams. That surface existed
  and was removed: it pointed at `127.0.0.1:8090`, so a deployed build served a
  sign-in form that could not succeed.
- No i18n routing, though `public/locales/` exists.

## Running it

```bash
cd learning-doc
npm install
npm run dev          # http://localhost:3000
npm run build
```

## Read alongside

- [`astro-starter`](/atlas/astro-starter) — the same problem with a smaller JavaScript budget.
- [`nuxt-clean-architecture`](/atlas/nuxt-clean-architecture) — the same framework, layered deliberately.
