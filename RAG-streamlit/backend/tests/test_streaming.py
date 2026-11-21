"""The streaming agent has to answer whether or not a tool is called.

With streaming on, the graph only reaches the streaming `final_answer` node
after a tool call. A plain question goes assistant -> END, and the runner used
to answer it with "No stream available.".
"""

import asyncio
from typing import Any

import pytest
from langchain_core.language_models.fake_chat_models import FakeMessagesListChatModel
from langchain_core.messages import AIMessage
from langchain_core.tools import tool


class FakeChatModel(FakeMessagesListChatModel):
    """Replays canned messages; accepts bind_tools like a real chat model."""

    def bind_tools(self, tools: Any, **kwargs: Any) -> "FakeChatModel":
        return self


@tool
def echo(text: str) -> str:
    """Echo the text back."""
    return text


def _install_fake_model(monkeypatch, responses: list[AIMessage]):
    import langgraph_agent

    model = FakeChatModel(responses=responses)

    class FakeFactory:
        def create_model(self, *args: Any, **kwargs: Any) -> FakeChatModel:
            return model

    monkeypatch.setattr(langgraph_agent, "OllamaModelFactory", FakeFactory)


def _stream(prompt: str) -> list[str]:
    import langgraph_agent

    graph = langgraph_agent.create_agent_graph([echo], "system prompt", True)

    async def collect() -> list[str]:
        return [c async for c in langgraph_agent.run_agent_graph_streaming(graph, prompt)]

    return asyncio.run(collect())


def test_streaming_without_tool_call_returns_the_model_answer(monkeypatch):
    _install_fake_model(monkeypatch, [AIMessage(content="Hello from the model")])

    chunks = _stream("Hi")

    assert "".join(chunks) == "Hello from the model"
    assert "No stream available." not in chunks


def test_streaming_with_tool_call_streams_the_final_answer(monkeypatch):
    tool_call = AIMessage(
        content="",
        tool_calls=[{"name": "echo", "args": {"text": "ping"}, "id": "call-1"}],
    )
    _install_fake_model(monkeypatch, [tool_call, AIMessage(content="Tool says ping")])

    chunks = _stream("Use the tool")

    assert "".join(chunks) == "Tool says ping"


@pytest.mark.parametrize("content", ["", None])
def test_streaming_with_empty_answer_falls_back(monkeypatch, content):
    _install_fake_model(monkeypatch, [AIMessage(content=content or "")])

    assert _stream("Hi") == ["No stream available."]
