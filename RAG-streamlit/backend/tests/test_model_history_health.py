"""model/history are honoured, retrieval failures are visible, /health checks deps."""

from typing import Any

import pytest
from fastapi.testclient import TestClient
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage


class RecordingModel:
    def __init__(self) -> None:
        self.calls: list[list[Any]] = []

    def bind_tools(self, tools: Any, **kwargs: Any) -> "RecordingModel":
        return self

    def invoke(self, messages: list[Any], **kwargs: Any) -> AIMessage:
        self.calls.append(list(messages))
        return AIMessage(content="answer")


def _install(monkeypatch):
    import langgraph_agent

    model = RecordingModel()
    created: list[dict[str, Any]] = []

    class Factory:
        def create_model(self, *args: Any, **kwargs: Any) -> RecordingModel:
            created.append(kwargs)
            return model

    monkeypatch.setattr(langgraph_agent, "OllamaModelFactory", Factory)
    return model, created


def test_model_name_reaches_factory(monkeypatch):
    import langgraph_agent

    _, created = _install(monkeypatch)
    graph = langgraph_agent.create_agent_graph([], "sys", False, "llama3:8b")
    langgraph_agent.run_agent_graph(graph, "hi")
    assert created and all(c["model_name"] == "llama3:8b" for c in created)


def test_history_is_sent_to_model_before_prompt(monkeypatch):
    import langgraph_agent

    model, _ = _install(monkeypatch)
    graph = langgraph_agent.create_agent_graph([], "sys", False)
    history = [
        {"role": "user", "content": "My name is Ada."},
        {"role": "assistant", "content": "Hello Ada."},
    ]
    langgraph_agent.run_agent_graph(graph, "What is my name?", history)
    sent = model.calls[0]
    assert isinstance(sent[0], SystemMessage)
    assert [type(m) for m in sent[1:]] == [HumanMessage, AIMessage, HumanMessage]
    assert sent[1].content == "My name is Ada."
    assert sent[-1].content == "What is my name?"


def test_chat_endpoint_passes_model_and_history(monkeypatch):
    import app

    seen: dict[str, Any] = {}

    def fake_create(tools, prompt, streaming=False, model_name=None):
        seen["model"] = model_name
        return object()

    def fake_run(graph, prompt, history=None):
        seen["history"] = history
        return "ok"

    monkeypatch.setattr(app, "create_agent_graph", fake_create)
    monkeypatch.setattr(app, "run_agent_graph", fake_run)
    monkeypatch.setattr(app.settings, "ALLOWED_MODELS", "other:1b")
    client = TestClient(app.app)

    r = client.post(
        "/chat",
        json={
            "model": "other:1b",
            "user_prompt": "q",
            "history": [{"role": "user", "content": "a"}],
        },
    )
    assert r.status_code == 200
    assert seen["model"] == "other:1b"
    assert seen["history"] == [{"role": "user", "content": "a"}]

    r = client.post("/chat", json={"model": "evil:70b", "user_prompt": "q"})
    assert r.status_code == 400


def test_openapi_documents_history_and_model():
    import app

    props = app.app.openapi()["components"]["schemas"]["ChatRequest"]["properties"]
    assert "history" in props and "model" in props


def test_retrieve_context_failure_is_explicit_error(monkeypatch):
    import tools

    class Boom:
        def retrieve(self, *a: Any, **k: Any):
            raise RuntimeError("milvus down")

    monkeypatch.setattr(tools, "get_context_retriever", lambda: Boom())
    result = tools.retrieve_context.invoke({"query": "x"})
    assert isinstance(result, str)
    assert result.startswith(tools.RETRIEVAL_ERROR_PREFIX)
    assert "milvus down" in result


def test_search_releases_collection_on_error(monkeypatch):
    import tools

    class Coll:
        released = False

        def load(self):
            pass

        def search(self, **kw):
            raise RuntimeError("boom")

        def release(self):
            Coll.released = True

    svc = tools.MilvusService.__new__(tools.MilvusService)
    monkeypatch.setattr(svc, "get_collection", lambda name: Coll(), raising=False)
    with pytest.raises(RuntimeError):
        svc.search("c", [0.1])
    assert Coll.released


def test_health_ok_and_503(monkeypatch):
    import app

    client = TestClient(app.app)
    monkeypatch.setattr(app, "check_dependencies", lambda: None)
    assert client.get("/health").status_code == 200

    def down():
        raise RuntimeError("Milvus unavailable: refused")

    monkeypatch.setattr(app, "check_dependencies", down)
    r = client.get("/health")
    assert r.status_code == 503
    assert "Milvus" in r.json()["detail"]
