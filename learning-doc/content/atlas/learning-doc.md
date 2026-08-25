---
title: Engineering Atlas (this site)
description: The Nuxt Content platform that renders the Atlas and the course material.
project: learning-doc
track: tooling
stack: [Nuxt 4, Nuxt Content, Tailwind, Pinia, PocketBase]
status: reference
compare: [astro-starter, nuxt-clean-architecture]
---

You are reading its output. Included in the Atlas because a documentation
platform is a real application with real architectural decisions, and because
this one is the reason the rest of the repository can explain itself.

## What problem shape is this for?

Long-form technical content that needs search, progress tracking, authenticated
users, and a design system — where the content is files in git rather than rows
in a CMS.

## The layer map

```
content/
  atlas/          one entry per project in this monorepo
  courses/        rust, golang, redis, fastapi, docker, flutter, gin,
                  supabase, raspberry, nextjs, korean
components/
  ui/  common/  content/  course/  docs/  custom/
composables/      useAuth  useTheme  useProgress  useExam  useComments
services/         pocketbase.ts, comments/
utils/
  atlas.ts        the project registry this site renders
  academy.ts      course disciplines and technology tokens
assets/css/       courses.css — the design tokens
server/api/
pocketbase-docker/
```

`composables/` → `services/` is the boundary that matters: components call
composables, composables call services, and `services/pocketbase.ts` is the only
file that knows PocketBase exists. Replacing the backend is one file.

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

- PocketBase runs locally via Docker and is not deployed. Auth and progress are
  real features against a local backend.
- No i18n routing, though `public/locales/` exists.
- `src_legacy/` is a previous Next.js implementation, kept for reference and not
  routed. It is not dead code to be tidied away without a decision.

## Running it

```bash
cd learning-doc
npm install
cd pocketbase-docker && docker compose up -d && cd ..
npm run dev          # http://localhost:3000
npm run build
```

## Read alongside

- [`astro-starter`](/atlas/astro-starter) — the same problem with a smaller JavaScript budget.
- [`nuxt-clean-architecture`](/atlas/nuxt-clean-architecture) — the same framework, layered deliberately.
