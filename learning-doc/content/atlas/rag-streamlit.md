---
title: RAG Streamlit
description: Retrieval, backend and frontend as three separate Poetry projects so the pipeline can be tested alone.
project: RAG-streamlit
track: ai-rag
stack: [Python, Streamlit, Poetry, Docker]
status: reference
compare: [solid-flask-web-app]
---

The one project here that has to stay testable with a language model in the
middle of it — which turns out to be an ordinary dependency-inversion problem
wearing an unfamiliar hat.

## What problem shape is this for?

Retrieval-augmented generation: ingest documents, embed them, retrieve on a
query, and let a model answer from what came back.

## The layer map

Three **independent Poetry projects**, each with its own `pyproject.toml`,
`poetry.lock`, and `tests/`:

```
pipelines/     ingestion, chunking, embedding — runs offline
backend/       retrieval and generation API
frontend/      Streamlit UI
deployment/    Docker composition
docs/
```

The separation is the design. Ingestion runs on a different schedule, needs
different dependencies, and fails in different ways than a request handler.
Sharing one dependency graph between them would force the API to carry the
ingestion stack.

## The idea it demonstrates most clearly

**The model is an injected dependency, not an ambient fact.** Because
`pipelines/` is its own project with its own test suite, chunking and embedding
logic can be tested on fixtures without calling an API. That is the whole trick
for keeping AI applications testable: push the non-deterministic part to the
edge and keep the boundary explicit.

The three-lockfile arrangement makes a second, less obvious point — dependency
isolation *is* an architectural boundary. If `frontend` cannot import from
`backend` because it is a different project, the constraint is enforced by
packaging rather than by discipline.

## What it deliberately does not do

- No vector-store abstraction layer yet — the retrieval implementation is direct.
- No evaluation harness. Retrieval quality is not measured, only produced.
- Not yet covered by CI: Dependabot tracks all three projects, but no build or
  test job runs. That gap is recorded in the CI manifest rather than hidden.

## Running it

```bash
cd RAG-streamlit/backend && poetry install && poetry run pytest
cd ../pipelines          && poetry install && poetry run pytest
cd ../frontend           && poetry install && poetry run streamlit run src/app.py
# or:
cd RAG-streamlit/deployment && docker compose up
```

## Read alongside

- [`solid-flask-web-app`](/atlas/solid-flask-web-app) — the other Python project, structured for a conventional web app.
