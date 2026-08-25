# ADR-0001: Drive CI from a checked-in project manifest

- **Status:** accepted
- **Date:** 2026-08-25
- **Scope:** `repo`

## Context

This repository holds seventeen independent applications across five ecosystems
(npm, Bun, Poetry, Maven, pip). There is no workspace tooling to enumerate them,
and no single command that builds everything.

Its only workflow, `deploy.yml`, had been commented out rather than deleted. A
workflow file with no `on:` triggers is not inert — GitHub parses it, finds no
triggers, and fails the run instantly. Every push to `main` therefore produced a
zero-second failure with no jobs, for months.

Because the only signal was permanently red, red stopped meaning anything.
Dependabot kept merging unattended, including majors. An audit found **4 of 16**
Node projects could not install and **6 of 16** could not build. None of those
breakages came from a code change.

So the requirement was not "add CI". It was: add CI that is **green on the day it
lands**, because a red badge nobody trusts is what caused this in the first place.

## Decision

CI reads [`.github/projects.json`](../../.github/projects.json). Each project
declares its ecosystem, package manager, toolchain version, and a `checks` object
of booleans.

**A check is set to `true` only after it has been observed passing.** Every
`false` carries a `notes` string naming the blocker.

`ci.yml` diffs the change, intersects it with the manifest, and runs a
`fail-fast: false` matrix over only the affected projects. `hygiene.yml`
validates that the manifest, the filesystem, `README.md`, the Atlas, and
`dependabot.yml` all describe the same set of projects — and that no workflow
file lacks `on:` triggers.

## Consequences

**What this buys us.** CI is green from day one and stays meaningful. Adding
coverage is a one-line manifest change plus the fix that earned it. Documentation
drift becomes a build failure rather than a slow lie. A docs-only change runs no
build jobs at all, which is what makes per-project CI affordable across seventeen
toolchains.

**What it costs us.** The manifest is a second place to update when a project
changes, and it can lag reality — mitigated by `check-manifest.mjs` failing when
it does. Broken projects are visible-but-unchecked rather than loudly red, which
is a deliberate trade: we would rather have a trustworthy green signal plus a
written list of known gaps than a red badge everyone learns to ignore.

**What it forecloses.** There is no single "build everything" command, and there
will not be one until every project can actually build.

## Alternatives considered

| Option | Why not |
|:---|:---|
| Full build matrix over every project | Would have landed red on day one for six projects — recreating the exact failure being fixed. |
| Hygiene checks only, no builds | Cheap and always green, but would not have caught any of the six real breakages. |
| Convert to a real monorepo (Nx, Turborepo, pnpm workspaces) | Forces one package manager and one Node version on seventeen projects whose *independence is the point*. Would also break the Bun, Poetry, and Maven projects outright. |
| `paths:` filters per project in separate workflows | Seventeen near-identical workflow files; the drift problem moves rather than disappearing. |

## Revisit when

Every project in the manifest has `install: true` and `build: true`, or a build
orchestrator becomes worth its constraints — whichever comes first.
