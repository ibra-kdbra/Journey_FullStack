# ADR-0002: Group Dependabot updates and isolate majors

- **Status:** accepted
- **Date:** 2026-08-25
- **Scope:** `repo`

## Context

The previous `dependabot.yml` declared one ungrouped `npm` entry per project on a
weekly schedule, with no `open-pull-requests-limit` and no grouping. That produces
one pull request per dependency per project per week. The repository reached
roughly 1,200 merged dependency pull requests.

With no working CI (see [ADR-0001](0001-manifest-driven-ci.md)), every one of
those merged without verification. Six projects broke as a direct result:

- TypeScript 7 removed `moduleResolution: node10`, `target: ES5`, and `baseUrl`,
  and dropped the programmatic compiler API the Nest CLI depends on.
- Tailwind v4 moved its PostCSS plugin to a separate package.
- Prisma 7 removed the datasource `url` from `schema.prisma`.
- `@vue/tsconfig` 0.9 renamed its presets.
- Angular 22 raised the Node floor.

Every one of those is a **major**. Not one minor or patch bump caused a failure.

The config also targeted `/task-manager`, a directory that no longer exists — so
that update job failed on every run — and declared `package-ecosystem: "poetry"`,
which is not a valid ecosystem (Poetry projects are handled by `pip`).

## Decision

1. **Group minor and patch updates per project** into one pull request per
   project per week, with `open-pull-requests-limit: 5`.
2. **Exclude framework packages from those groups** — `next`, `@angular/*`,
   `@nestjs/*`, `react-native`, `@react-native/*`, `nuxt`, `@nuxt/*`, `react`,
   `react-dom` — so every major arrives alone and reviewable.
3. **Never auto-merge.** A dependency pull request merges only with a green run
   for the project it touches.
4. **Every `directory` must exist and contain a manifest for its ecosystem.**
   `hygiene.yml` enforces this.
5. **Pin toolchain floors in `.github/projects.json`**, not in CI logs.
6. **A held dependency needs a written reason and a clearing condition** in
   [`docs/ENGINEERING.md`](../ENGINEERING.md#known-open-work).

## Consequences

**What this buys us.** Weekly pull request volume drops by roughly an order of
magnitude. Majors — the only category that has ever broken this repository —
arrive one at a time against working CI. Dependabot's own update jobs stop
failing on stale targets.

**What it costs us.** A grouped pull request that fails is harder to bisect than
a single-dependency one; the fix is to split the group temporarily rather than to
abandon grouping. Majors now queue up behind human review instead of merging
themselves, so the repository will sit further behind latest — which is the point.

**What it forecloses.** Fully unattended dependency maintenance. That was never
actually working; it just looked like it was.

## Alternatives considered

| Option | Why not |
|:---|:---|
| Keep per-dependency PRs, add CI | CI alone fixes verification but leaves the 1,200-PR review load, which is why nothing was reviewed. |
| Group everything including majors | Merges a breaking change inside a "chore(deps)" batch — exactly how TypeScript 7 landed unnoticed. |
| Disable Dependabot | Trades breakage for unpatched security issues. |
| Monthly instead of weekly | Larger, harder-to-bisect batches with no reduction in total change. |

## Revisit when

Grouped pull requests routinely fail for reasons that per-dependency ones would
have isolated, or every project reaches `build: true` and full auto-merge on
green becomes defensible.
