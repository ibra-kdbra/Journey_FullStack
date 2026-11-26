"""Auth, error hygiene and input limits on the backend API."""

import pytest
from fastapi.testclient import TestClient

import app as backend

KEY = backend.settings.API_KEY
AUTH = {"X-API-Key": KEY}


@pytest.fixture
def client():
    return TestClient(backend.app, raise_server_exceptions=False)


@pytest.mark.parametrize("path", ["/chat", "/chat/stream"])
def test_chat_requires_key(client, path):
    assert client.post(path, json={"user_prompt": "hi"}).status_code == 401
    r = client.post(path, json={"user_prompt": "hi"}, headers={"X-API-Key": "wrong-key-wrong-key"})
    assert r.status_code == 401


def test_config_requires_key_and_hides_hosts(client):
    assert client.get("/config").status_code == 401
    r = client.get("/config", headers=AUTH)
    assert r.status_code == 200
    body = r.text
    assert backend.settings.MILVUS_HOST not in body
    assert backend.settings.OLLAMA_HOST not in body


def test_health_is_public_and_generic(client, monkeypatch):
    def boom():
        raise RuntimeError("Milvus unavailable: secret-host:19530")

    monkeypatch.setattr(backend, "check_dependencies", boom)
    r = client.get("/health")
    assert r.status_code == 503
    assert "secret-host" not in r.text


def test_500_does_not_leak_exception_text(client, monkeypatch):
    def boom(*a, **k):
        raise RuntimeError("db password is hunter2")

    monkeypatch.setattr(backend, "create_agent_graph", boom)
    r = client.post("/chat", json={"user_prompt": "hi"}, headers=AUTH)
    assert r.status_code == 500
    assert "hunter2" not in r.text


def test_prompt_length_is_capped(client):
    r = client.post(
        "/chat",
        json={"user_prompt": "x" * (backend.MAX_PROMPT_CHARS + 1)},
        headers=AUTH,
    )
    assert r.status_code == 422
