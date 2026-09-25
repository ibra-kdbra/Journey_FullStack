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
npm run dev        # http://localhost:3000
npm run build
npm run preview
npm test           # replays the Redis, Supabase and Docker course transcripts (see below)
```

## Course transcripts are tests

Every fenced block in `content/courses/redis/` whose first line starts with the
`127.0.0.1:6379> ` prompt is a test. `npm test` runs
[`scripts/verify-redis-transcripts.mjs`](scripts/verify-redis-transcripts.mjs),
which starts a throwaway `redis-server` on a unix socket, replays each lesson's
commands in order on one connection, and fails if any reply differs from what the
lesson prints. It never connects to a Redis you already run.

- A line starting `# wait 1500ms` pauses, so expiry can be shown happening.
- Any other `#` line is a comment for the reader.
- There is no opt-out. Output that is not reproducible — timings, unordered
  `SMEMBERS` replies, glob `CONFIG GET` — does not belong in a transcript.

When a lesson fails, the verifier prints what the lesson shows next to what Redis
returned. Fix the lesson, not the verifier.

The Supabase course works the same way for `psql`. Every fenced block in
`content/courses/supabase/` whose first line starts with a psql prompt
(`postgres=# `, `postgres=> `, `postgres=*# `, ...) is a test.
[`scripts/verify-psql-transcripts.mjs`](scripts/verify-psql-transcripts.mjs)
creates a throwaway PostgreSQL 16 cluster with `initdb` in a temp directory
(unix socket only), types each prompted line into a real interactive `psql`
running under `script(1)`, and compares the whole transcript — prompts included,
since `=*#`, `=!#` and `=>` tell the reader about transactions and roles.

- Lessons run in order against one database: the course builds one schema, so
  a later lesson relies on what an earlier one created.
- It needs PostgreSQL 16's server binaries (`/usr/lib/postgresql/16/bin`, or set
  `PG_BINDIR`), the `wal2json` plugin (`postgresql-16-wal2json`) and `script`
  from util-linux, and it must run as a non-root user, because `initdb` refuses
  to run as root.
- There is no opt-out here either. Clock times, random UUIDs and unordered rows
  do not belong in a transcript: select other columns, use fixed IDs, `order by`.

The Docker course is checked by
[`scripts/verify-docker-transcripts.mjs`](scripts/verify-docker-transcripts.mjs)
against a real Docker daemon. A block starting with `$ ` is a transcript; a block
whose info string names a path (```` ```dockerfile [hello/Dockerfile] ````) is a
file the lesson creates, written before the commands after it run. Each lesson
runs in its own temporary directory, in one `bash` session, so `cd`, variables
and `$?` carry between commands.

- `[...]` in expected output matches any text within one line. It is for values
  Docker generates at random — new container, network and image IDs — and
  nothing else. Use `--format`, `-q` and `docker pull -q` to keep everything
  else exact.
- Containers, volumes and networks a lesson creates are removed afterwards.
  Images are kept: each image is pulled once, in the lesson that introduces it,
  so lessons run in order, and Docker Hub's rate limit on anonymous pulls is not
  spent on every run.
- It needs a Docker daemon, the Compose plugin, `curl` and `python3`.

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
