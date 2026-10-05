# Engineering Atlas

The documentation platform for this monorepo, built with Nuxt 4 and Nuxt Content.
It renders two things:

- **The Atlas** (`content/atlas/`) — one entry per project in the repository,
  each answering the same five questions so entries stay comparable across
  frameworks that share no vocabulary.
- **Courses** (`content/courses/`) — long-form material on Rust, Go, Redis,
  FastAPI, Docker, Flutter, Gin, Supabase, Raspberry Pi, Next.js, and Korean.

## Why it is shaped this way

The Atlas is bound to `.github/projects.json` at the repository root: each entry
carries a `project:` field, and `check-manifest.mjs` fails CI when the Atlas and
the manifest disagree. Documentation drift is a build failure rather than a slow
lie. See [ADR-0003](../docs/decisions/0003-atlas-replaces-course-site.md).

## Structure

```
content/
  atlas/            one entry per project — the schema in content.config.ts is enforced
  courses/          the course lessons - not in git; fetched before a build (see Courses)
components/
  ui/  common/  content/  course/  docs/  custom/
composables/        useTheme  useCodeInputAnalysis
utils/
  atlas.ts          the project registry this site renders
  academy.ts        the course registry — checked against content/courses/
assets/css/
  courses.css       the design tokens; DESIGN.md at the repo root documents them
pages/
  atlas/            index and entry routes
  courses/  docs/
server/api/
```

Every page resolves through `queryCollection`, so `content/` is the only source
of routes and the site is servable as static output. There is no backend and no
runtime configuration to supply.

## Setup

```bash
npm install
export COURSES_TOKEN=...   # read access to the lessons (see Courses), or COURSES_SKIP=1
npm run dev        # http://localhost:3000
npm run build
npm run preview
```

## Courses

The course lessons are not in this repository. They live in a private GitLab
repository together with the tooling that runs them: in the Redis, Supabase,
Docker and Go courses every transcript is a test, replayed against the real
tools, and a lesson must show exactly what its commands print. That is why
this project's manifest entry has `test: false` - the lessons are tested
there, not here.

[`scripts/fetch-courses.mjs`](scripts/fetch-courses.mjs) copies the lessons
into `content/courses/` (ignored by git). npm runs it before `dev`, `build` and
`generate`, and CI runs it before `check-courses.mjs`.

- `COURSES_TOKEN` - a GitLab token with `read_repository` on the lessons'
  repository. CI reads it from the `LEARNING_DOC_COURSES_TOKEN` secret.
- Without a token, a `content/courses/` fetched earlier is reused. With
  neither, the build fails rather than producing a site without its courses;
  `COURSES_SKIP=1` builds without them on purpose.
- `COURSES_REF` fetches another branch or tag, to preview lessons before they
  are merged there.

## Adding an Atlas entry

1. Add the project to `.github/projects.json` at the repository root.
2. Add it to `atlasProjects` in [`utils/atlas.ts`](utils/atlas.ts), including an
   explicit `slug`.
3. Create `content/atlas/<slug>.md` with the required frontmatter — `project`,
   `track`, `stack`, `status`, `compare`. The schema in
   [`content.config.ts`](content.config.ts) is enforced at build time.
4. Add a row to the root [`README.md`](../README.md) index.
5. Run `node ../.github/scripts/check-manifest.mjs`.

### The rule that matters

**Verify before you write.** Every stack claim, path and command in an entry must be
checked against the actual directory — never inferred from its name. Documentation
describing a directory that no longer exists is worse than none, because a reader
trusts it.

Every entry answers the same five questions, which is what makes the Atlas
comparable across frameworks:

1. What problem shape is this project for?
2. What is the layer map, concretely, in real directory names?
3. Which principle or pattern does it demonstrate most clearly?
4. What does it deliberately *not* do?
5. How do you run it?

State trade-offs, not virtues. "Uses Clean Architecture" says nothing; "repository
interfaces live with the use cases so the domain can be tested without Postgres, at
the cost of more files per feature" says something. Strike "comprehensive",
"production-ready", "cutting-edge", "powerful" and "seamless" on sight. If a project
is unfinished, the entry says so.

## UI changes

Every colour resolves through a CSS custom property in
[`assets/css/courses.css`](assets/css/courses.css). Literal hex values in
components are a review blocker. The contract and its checklist are both in
[`DESIGN.md`](../DESIGN.md#9-review-checklist).
