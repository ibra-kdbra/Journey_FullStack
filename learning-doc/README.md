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
  courses/          long-form course material
components/
  ui/  common/  content/  course/  docs/  custom/
composables/        useAuth  useTheme  useProgress  useExam  useComments
services/           pocketbase.ts, comments/ — the only files that know the backend
utils/
  atlas.ts          the project registry this site renders
  academy.ts        course disciplines and technology tokens
assets/css/
  courses.css       the design tokens; DESIGN.md at the repo root documents them
pages/
  atlas/            index and entry routes
  courses/  docs/  auth/
server/api/
pocketbase-docker/  local backend
src_legacy/         a previous Next.js implementation, kept for reference, not routed
```

`composables/` → `services/` is the boundary that matters: components call
composables, composables call services, and `services/pocketbase.ts` is the only
file that names PocketBase.

## Setup

```bash
npm install

# Local backend (auth + progress tracking)
cd pocketbase-docker && docker compose up -d && cd ..

npm run dev        # http://localhost:3000
npm run build
npm run preview
```

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
