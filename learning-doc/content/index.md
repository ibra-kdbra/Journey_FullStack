---
title: Journey FullStack
description: Eighteen applications, five ecosystems, one set of architectural ideas.
---

# Journey FullStack

A **polyrepo living in one repository**: eighteen independent applications across
five ecosystems, with no shared build and no workspace file. That independence is
deliberate — it is what makes the comparison possible.

The same handful of ideas — dependency inversion, layer separation, testable
boundaries — are worked through in React, Vue, Nuxt, Angular, Svelte, Astro,
React Native, NestJS, Express, Hono, Flask, and Spring Boot. Where they land
differently, the difference is the lesson.

## Two ways in

**[The Engineering Atlas](/atlas)** — one entry per project, each answering the
same five questions: what problem shape it is for, what its layer map actually
looks like, which idea it demonstrates most clearly, what it deliberately does
not do, and how to run it.

**[Courses](/courses)** — long-form material on Rust, Go, Redis, FastAPI, Docker,
Flutter, Gin, Supabase, Raspberry Pi, Next.js, and Korean.

## Where to start

| If you want… | Read |
|:---|:---|
| The clearest worked refactor toward Clean Architecture | [`nuxt-clean-architecture`](/atlas/nuxt-clean-architecture) |
| The most literal layer map | [`rn_clean_architecture`](/atlas/rn-clean-architecture) |
| SOLID with no framework helping you | [`nodejs-s.o.l.i.d`](/atlas/nodejs-solid) |
| SOLID where the framework does help | [`nestjs-s.o.l.i.d`](/atlas/nestjs-solid) |
| A domain with real business rules | [`API_s.o.l.i.d_TS`](/atlas/api-solid-ts) |
| Service decomposition across deployables | [`hospital-management`](/atlas/hospital-management) |
| A counter-example — knowing when not to abstract | [`vercel-cleaner`](/atlas/vercel-cleaner) |

## On honesty

Entries describe what the code *is*, not what its directory name promises. Where
a project has not yet been built out — [`vue3-clean-architecture`](/atlas/vue3-clean-architecture)
is currently the `create-vue` scaffold — the entry says so. Documentation a
reader cannot trust is worse than none.
