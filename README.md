<div align="center">

# Journey FullStack

**One set of architectural ideas, worked through in twelve framework cultures.**

[![CI](https://github.com/ibra-kdbra/Journey_FullStack/actions/workflows/ci.yml/badge.svg)](https://github.com/ibra-kdbra/Journey_FullStack/actions/workflows/ci.yml)
[![Hygiene](https://github.com/ibra-kdbra/Journey_FullStack/actions/workflows/hygiene.yml/badge.svg)](https://github.com/ibra-kdbra/Journey_FullStack/actions/workflows/hygiene.yml)

[Engineering Atlas](learning-doc/content/atlas/) ·
[Architecture](ARCHITECTURE.md) ·
[The Development Way](docs/ENGINEERING.md) ·
[Design System](DESIGN.md) ·
[Decisions](docs/decisions/)

</div>

---

## What this is

A **polyrepo living in one repository**: eighteen independent applications across
five ecosystems, with no workspace file and no shared `node_modules`. That
independence is deliberate — it is what makes the comparison possible.

Most architectural advice is framework-shaped. "Use a repository pattern" means
something different in NestJS, where a DI container makes it nearly free, than in
Express, where you wire it by hand, than in Flask, where nothing checks that your
implementation matches the contract. The only way to see which parts of the advice
are essential and which are framework folklore is to build the same thing several
ways and read them side by side.

**Where they land differently, the difference is the lesson.**

## Start here

| If you want… | Read |
|:---|:---|
| The clearest worked refactor toward Clean Architecture | [`nuxt-clean-architecture`](nuxt-clean-architecture/) |
| The most literal layer map | [`rn_clean_architecture`](rn_clean_architecture/) |
| SOLID with no framework helping you | [`nodejs-s.o.l.i.d`](nodejs-s.o.l.i.d/) |
| SOLID where the framework does help | [`nestjs-s.o.l.i.d`](nestjs-s.o.l.i.d/) |
| A domain with real business rules | [`API_s.o.l.i.d_TS`](API_s.o.l.i.d_TS/) |
| Service decomposition across deployables | [`hospital-management`](hospital-management/) |
| A counter-example — knowing when *not* to abstract | [`vercel-cleaner`](vercel-cleaner/) |

Each project has an [Atlas entry](learning-doc/content/atlas/) answering the same
five questions: what problem shape it is for, what its layer map actually looks
like, which idea it demonstrates most clearly, what it deliberately does not do,
and how to run it.

---

## The projects

Status is `reference` when the code delivers what the name claims, and
`in progress` when it does not yet. That distinction is enforced, not decorative —
see [`.github/projects.json`](.github/projects.json).

### Clean Architecture

| Project | Stack | Demonstrates | Status |
|:---|:---|:---|:---|
| [`nuxt-clean-architecture`](nuxt-clean-architecture/) | Nuxt 3, Vitest | A six-stage refactor from naive component to use case behind a repository interface, each stage its own Nuxt layer | reference |
| [`rn_clean_architecture`](rn_clean_architecture/) | React Native, TypeScript | `domain` / `data` / `presentation` / `di` / `common` as sibling directories | reference |
| [`nestjs-s.o.l.i.d`](nestjs-s.o.l.i.d/) | NestJS, Prisma, PostgreSQL | Modules named after the principle each demonstrates, on a framework where inversion is the default | reference |
| [`next-prisma-starter`](next-prisma-starter/) | Next.js 16, Prisma, RTK | What you get when a generated data layer becomes the domain model — the baseline the layered projects argue against | reference |
| [`vue3-clean-architecture`](vue3-clean-architecture/) | Vue 3, Vite, Pinia, Vitest | A lending library with the domain/ports/use-case split in a plain SPA, no meta-framework; 42 unit tests | reference |

### SOLID principles

| Project | Stack | Demonstrates | Status |
|:---|:---|:---|:---|
| [`nodejs-s.o.l.i.d`](nodejs-s.o.l.i.d/) | Node.js, Express, Sequelize | Open/Closed via a real export handler; in-memory repositories beside the real ones | reference |
| [`API_s.o.l.i.d_TS`](API_s.o.l.i.d_TS/) | Node.js, TypeORM, Tsyringe | Feature modules with `dtos` / `repositories` / `useCases` / `infra`, over a domain with genuine invariants | reference |
| [`react-s.o.l.i.d`](react-s.o.l.i.d/) | React 19, TanStack Query | Each principle as a paired demo — the violating version beside the conforming one | reference |
| [`angular-s.o.l.i.d-advanced`](angular-s.o.l.i.d-advanced/) | Angular 22, RxJS | Where DI is free, Interface Segregation becomes the expensive principle | reference |
| [`vue.js-s.o.l.i.d`](vue.js-s.o.l.i.d/) | Vue, Vite | The smallest treatment here — the right first read | reference |
| [`solid-flask-web-app`](solid-flask-web-app/) | Python, Flask, Docker, Nginx | What SOLID costs without a compiler; three compose topologies; [`ui/`](solid-flask-web-app/ui/) is a separate Vite frontend | reference |

### Edge & modern runtimes

| Project | Stack | Demonstrates | Status |
|:---|:---|:---|:---|
| [`Hono-Postgres`](Hono-Postgres/) | Hono, Bun, Drizzle | No build step, so no abstraction can hide; feature colocation over technical layering | reference |
| [`sveltekit`](sveltekit/) | Svelte 5, Drizzle, Turso, R2 | A boundary the compiler enforces (`$lib/server`) beats one you agree to | in progress |

### Distributed systems

| Project | Stack | Demonstrates | Status |
|:---|:---|:---|:---|
| [`hospital-management`](hospital-management/) | Java, Spring Boot, Eureka | One clinical domain across services, each with a hexagonal core and a `web/mapper` keeping DTOs out of it | in progress |

### AI & retrieval

| Project | Stack | Demonstrates | Status |
|:---|:---|:---|:---|
| [`RAG-streamlit`](RAG-streamlit/) | Python, Streamlit, Poetry | Three separate Poetry projects — [`backend`](RAG-streamlit/backend/), [`frontend`](RAG-streamlit/frontend/), [`pipelines`](RAG-streamlit/pipelines/) — so the ingestion pipeline is testable without a model | reference |

### Tooling & delivery

| Project | Stack | Demonstrates | Status |
|:---|:---|:---|:---|
| [`astro-starter`](astro-starter/) | Astro 7, React, Tailwind v4 | Islands as dependency inversion for the browser | reference |
| [`learning-doc`](learning-doc/) | Nuxt 4, Nuxt Content, PocketBase | The Engineering Atlas itself — content as a validated collection | reference |
| [`vercel-cleaner`](vercel-cleaner/) | Node.js | Knowing when *not* to apply the patterns in the rest of this repository | reference |

---

## Running a project

Every project is self-contained. There is no root install.

```bash
cd <project>
npm install          # or: bun install · poetry install · ./mvnw
npm run dev
```

Check the repository's structural invariants without installing anything:

```bash
node .github/scripts/check-manifest.mjs
```

---

## How this repository is engineered

CI is driven by [`.github/projects.json`](.github/projects.json), which records
per project which checks are known to pass. **A check is enabled only after it has
been observed passing** — which is what keeps a green badge meaningful.

- [`ci.yml`](.github/workflows/ci.yml) diffs the change and runs a `fail-fast: false`
  matrix over only the affected projects.
- [`hygiene.yml`](.github/workflows/hygiene.yml) fails when the manifest, the
  filesystem, this README, the Atlas, and `dependabot.yml` disagree — or when a
  workflow file defines no `on:` triggers.

That last check exists because it is exactly how this repository broke. The full
account is in [docs/ENGINEERING.md](docs/ENGINEERING.md#postmortem-how-the-repository-went-red);
the short version is that a commented-out workflow is an *invalid* workflow, every
push failed in zero seconds for months, red stopped meaning anything, and
unverified dependency majors left four projects unable to install and six unable
to build.

**Further reading**

- [docs/ENGINEERING.md](docs/ENGINEERING.md) — the project contract, dependency policy, and known open work
- [ARCHITECTURE.md](ARCHITECTURE.md) — SOLID and Clean Architecture reference with code
- [DESIGN.md](DESIGN.md) — the design-system contract, in [awesome-design-md](https://github.com/VoltAgent/awesome-design-md) format
- [docs/DEPENDENCIES.md](docs/DEPENDENCIES.md) — dependency policy and the catalogue of breakages already suffered
- [docs/decisions/](docs/decisions/) — architecture decision records

---

## Live demos

- [iPhone 3D Animation](https://iphone-3d-animate-vnext.vercel.app)
- [Terminal Portfolio](https://terminal-theme-resume.netlify.app/)
- [Web Avatar Creator](https://avatar-web-blend.netlify.app/)
- [LeetCode Clone](https://leetcode-copy.netlify.app)

---

<div align="center">
<sub>Entries describe what the code <em>is</em>, not what its directory name promises.</sub>
</div>
