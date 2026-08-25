# ADR-0003: Reframe `learning-doc` as the Engineering Atlas

- **Status:** accepted
- **Date:** 2026-08-25
- **Scope:** `learning-doc`

## Context

`learning-doc/` is a Nuxt 4 + Nuxt Content application with a genuinely good
foundation: a discipline-centric navigation model, a token-driven design system,
Pinia state, PocketBase-backed auth and progress tracking, and Shiki-highlighted
content.

What it *contained* did not match the repository around it. Its homepage was the
unmodified Nuxt Content starter — "Welcome to Nuxt Content Starter", linking to
`github.com/nuxt/starter`. Its content tree held personal course notes on Rust,
Go, Redis, FastAPI, Docker, Flutter, Raspberry Pi and Korean.

Meanwhile the repository's actual substance — seventeen applications
demonstrating SOLID and Clean Architecture across React, Vue, Nuxt, Angular,
Svelte, Astro, React Native, NestJS, Hono, Flask, and Spring Boot — was
documented only as a table of links in `README.md`.

The most interesting thing this repository contains is the *comparison*: the same
architectural ideas rendered in eleven framework cultures. Nothing surfaced that.

## Decision

Reframe the application as the **Engineering Atlas**: the canonical, navigable
explanation of what each project in this monorepo demonstrates and why.

- Keep the stack, components, design tokens, auth, and progress tracking. This is
  a reframing, not a rewrite.
- Add `content/atlas/`, one entry per project, on a fixed five-question structure
  so entries are comparable across frameworks.
- Replace `utils/academy.ts`'s generic disciplines with **tracks** derived from
  what the repository actually contains: `clean-architecture`, `solid`,
  `edge-runtime`, `microservices`, `ai-rag`, `tooling`.
- Keep the existing courses as a secondary section. They are real work and they
  are not the headline.
- Bind the Atlas to `.github/projects.json` so `hygiene.yml` fails when the two
  disagree.

## Consequences

**What this buys us.** The repository explains itself. A reader can compare how
`vue3-clean-architecture` and `nuxt-clean-architecture` model the same domain,
rather than inferring it from directory names. Documentation drift becomes a CI
failure. The site stops advertising the Nuxt starter template.

**What it costs us.** Every new project now owes an Atlas entry — a real
maintenance obligation, deliberately enforced. The five-question structure
constrains how entries are written; that constraint is what makes them
comparable.

**What it forecloses.** The application is no longer a general-purpose LMS. If a
future course needs features the Atlas framing does not want, they diverge.

## Alternatives considered

| Option | Why not |
|:---|:---|
| Delete `learning-doc` entirely | Discards a working Nuxt 4 app with a real design system, and the courses in it are legitimate work. |
| Rebuild the Atlas from scratch | The existing foundation is sound; the content was the problem. |
| Rename the directory to `atlas/` | Cosmetic, and it breaks `dependabot.yml`, deep links, and external references for no functional gain. Deferred. |
| Put the Atlas in `README.md` and `docs/` | Loses search, cross-linked comparison, per-project navigation, and the design system — the things that make a comparison browsable. |

## Revisit when

The courses and the Atlas develop genuinely conflicting requirements, or the
directory rename becomes worth its cost.
