"""The app has to be constructible.

This file was empty, so `test` was off, so the only check this project ran was
`poetry install`. That is how PR #1416 shipped a langgraph/langgraph-prebuilt
pairing whose install succeeds and whose `import app` raises

    ImportError: cannot import name 'ExecutionInfo' from 'langgraph.runtime'

An install proves a resolver agreed on versions. It does not prove the code can
run. These tests are the difference.
"""

from fastapi import FastAPI


def test_app_module_imports():
    import app

    assert isinstance(app.app, FastAPI)


def test_the_documented_routes_exist():
    import app

    paths = {r.path for r in app.app.routes if hasattr(r, "path")}
    for expected in ("/health", "/chat", "/chat/stream", "/config"):
        assert expected in paths, f"{expected} missing from {sorted(paths)}"


def test_agent_graph_module_imports():
    # The module that actually broke: it pulls langgraph.prebuilt, which is
    # where the version mismatch surfaced.
    import langgraph_agent

    assert hasattr(langgraph_agent, "create_agent_graph")
