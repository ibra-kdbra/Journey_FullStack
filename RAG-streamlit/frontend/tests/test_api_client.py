import asyncio
from unittest.mock import patch

import pytest

from src.api_client import APIClientError, RAGAPIClient


class FakeContent:
    def __init__(self, lines, fail_after_lines=False):
        self.lines = lines
        self.fail = fail_after_lines

    def __aiter__(self):
        async def gen():
            for line in self.lines:
                yield line
            if self.fail:
                raise ConnectionResetError("stream dropped")
        return gen()


class FakeResponse:
    def __init__(self, status=200, lines=(), fail=False, body=None):
        self.status = status
        self.content = FakeContent(list(lines), fail)
        self._body = body or {"response": "ok"}

    async def text(self):
        return f"status {self.status}"

    async def json(self):
        return self._body

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False


class FakeSession:
    def __init__(self, responses):
        self.responses = responses
        self.calls = 0

    def post(self, url, json=None, headers=None):
        resp = self.responses[min(self.calls, len(self.responses) - 1)]
        self.calls += 1
        return resp

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False


def _client():
    return RAGAPIClient(base_url="http://test", max_retries=3, retry_delay=0)


def _chunk(text):
    return f'data: {{"content": "{text}"}}\n'.encode()


def test_422_raises_on_first_attempt():
    session = FakeSession([FakeResponse(status=422)])
    with patch("src.api_client.aiohttp.ClientSession", return_value=session):
        with pytest.raises(APIClientError, match="422"):
            asyncio.run(_client()._get_response_async("hi"))
    assert session.calls == 1


def test_streaming_422_raises_on_first_attempt():
    session = FakeSession([FakeResponse(status=422)])

    async def consume():
        return [c async for c in _client()._get_streaming_response_async("hi")]

    with patch("src.api_client.aiohttp.ClientSession", return_value=session):
        with pytest.raises(APIClientError, match="422"):
            asyncio.run(consume())
    assert session.calls == 1


def test_5xx_is_still_retried():
    session = FakeSession([FakeResponse(status=503), FakeResponse(status=200)])
    with patch("src.api_client.aiohttp.ClientSession", return_value=session):
        assert asyncio.run(_client()._get_response_async("hi")) == "ok"
    assert session.calls == 2


def test_stream_failure_after_chunk_does_not_replay():
    session = FakeSession([
        FakeResponse(lines=[_chunk("a"), _chunk("b")], fail=True),
        FakeResponse(lines=[_chunk("a"), _chunk("b"), b"data: [DONE]\n"]),
    ])
    seen = []

    async def consume():
        async for c in _client()._get_streaming_response_async("hi"):
            seen.append(c)

    with patch("src.api_client.aiohttp.ClientSession", return_value=session):
        with pytest.raises(APIClientError):
            asyncio.run(consume())
    assert seen == ["a", "b"]
    assert session.calls == 1


def test_stream_failure_before_first_chunk_is_retried():
    session = FakeSession([
        FakeResponse(lines=[], fail=True),
        FakeResponse(lines=[_chunk("a"), b"data: [DONE]\n"]),
    ])

    async def consume():
        return [c async for c in _client()._get_streaming_response_async("hi")]

    with patch("src.api_client.aiohttp.ClientSession", return_value=session):
        assert asyncio.run(consume()) == ["a"]
    assert session.calls == 2


def test_history_is_sent_in_payload():
    sent = []

    class Spy(FakeSession):
        def post(self, url, json=None, headers=None):
            sent.append(json)
            return super().post(url, json=json, headers=headers)

    history = [{"role": "user", "content": "a"}, {"role": "assistant", "content": "b"}]
    with patch("src.api_client.aiohttp.ClientSession", return_value=Spy([FakeResponse()])):
        asyncio.run(_client()._get_response_async("c", history))
    assert sent == [{"user_prompt": "c", "history": history}]


def test_no_history_sends_empty_list():
    assert RAGAPIClient._build_payload("q", None) == {"user_prompt": "q", "history": []}


def test_api_key_is_sent_as_header():
    seen = []

    class Spy(FakeSession):
        def post(self, url, json=None, headers=None):
            seen.append(headers)
            return super().post(url, json=json, headers=headers)

    client = RAGAPIClient(base_url="http://test", max_retries=1, retry_delay=0, api_key="k" * 16)
    with patch("src.api_client.aiohttp.ClientSession", return_value=Spy([FakeResponse()])):
        asyncio.run(client._get_response_async("hi"))
    assert seen == [{"X-API-Key": "k" * 16}]
