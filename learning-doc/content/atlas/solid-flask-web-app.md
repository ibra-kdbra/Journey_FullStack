---
title: SOLID Flask Web App
description: The same principles in a dynamically typed language, where inversion is convention rather than a checked contract.
project: solid-flask-web-app
track: solid
stack: [Python, Flask, Docker, Nginx, Vite]
status: reference
compare: [nodejs-s.o.l.i.d, RAG-streamlit]
---

The most operationally complete project in the repository — three Docker
compositions, a reverse proxy per environment, background tasks, and migrations —
and the only one that applies SOLID without a type system enforcing any of it.

## What problem shape is this for?

A conventional web application that actually has to be deployed: separate dev,
staging, and production topologies, asynchronous work, and a frontend served
beside the API.

## The layer map

```
api/
  app/resources/       HTTP resources (Flask-RESTful)
  app/db/              models and session management
  app/tasks/           background jobs
  migrations/versions/ Alembic
  tests/               mirrors app/ directory for directory
  email_templates/  scripts/
ui/                    Vite frontend, its own package.json
docker-compose.dev.yml
docker-compose.staging.yml
docker-compose.prod.yml
nginx.staging.conf  nginx.prod.conf
```

`tests/` mirroring `app/` one-to-one — `tests/resources/`, `tests/db/`,
`tests/tasks/` — is worth copying. It makes a missing test suite visible as a
missing directory.

## The idea it demonstrates most clearly

**What SOLID costs without a compiler.** In `nodejs-s.o.l.i.d` an interface is
checked; here it is an agreement. Duck typing means an "implementation" that
silently omits a method fails at call time, in production, rather than at build
time.

The compensating mechanism is the test suite. That is the real lesson: in a
dynamically typed language, tests are not extra assurance on top of the type
system — they *are* the type system, and the layering only holds because
`tests/` mirrors `app/`.

The three compose files make a separate architectural point: environment
differences belong in composition, not in application code. There is no
`if ENVIRONMENT == "production"` branch anywhere in `app/`.

## What it deliberately does not do

- No type hints or mypy. Adding them would remove exactly the contrast that makes
  this project worth reading next to the TypeScript ones.
- The Python API is not yet covered by CI — only the `ui/` frontend is. Recorded
  in the manifest as a known gap.

## Running it

```bash
cd solid-flask-web-app
docker compose -f docker-compose.dev.yml up
make test
cd ui && npm install && npm run dev
```

## Read alongside

- [`nodejs-s.o.l.i.d`](/atlas/nodejs-solid) — the same principles, statically checked.
- [`RAG-streamlit`](/atlas/rag-streamlit) — Python structured for a different problem.
