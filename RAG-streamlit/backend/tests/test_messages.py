"""The agent must send [system, *history] to the model and leave state alone."""

from typing import Any

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage

SYSTEM = "system prompt"


class RecordingModel:
    """Fake chat model that records every message list it is invoked with."""

    def __init__(self) -> None:
        self.calls: list[list[Any]] = []

    def bind_tools(self, tools: Any, **kwargs: Any) -> "RecordingModel":
        return self

    def invoke(self, messages: list[Any], **kwargs: Any) -> AIMessage:
        self.calls.append(list(messages))
        return AIMessage(content="answer")


def _install(monkeypatch) -> RecordingModel:
    import langgraph_agent

    model = RecordingModel()

    class Factory:
        def create_model(self, *args: Any, **kwargs: Any) -> RecordingModel:
            return model

    monkeypatch.setattr(langgraph_agent, "OllamaModelFactory", Factory)
    return model


def test_assistant_sends_system_message_first_and_does_not_mutate_state(monkeypatch):
    import langgraph_agent

    model = _install(monkeypatch)
    human = HumanMessage(content="hi")
    state = {"messages": [human]}

    langgraph_agent.assistant(state, [], SYSTEM)

    sent = model.calls[0]
    assert isinstance(sent[0], SystemMessage)
    assert sent[0].content == SYSTEM
    assert sent[1:] == [human]
    assert state["messages"] == [human]


def test_final_answer_has_no_fake_assistant_turn_and_does_not_mutate_state(monkeypatch):
    import langgraph_agent

    model = _install(monkeypatch)
    history = [
        HumanMessage(content="hi"),
        AIMessage(content="", tool_calls=[{"name": "t", "args": {}, "id": "1"}]),
        ToolMessage(content="result", tool_call_id="1"),
    ]
    state = {"messages": list(history)}

    langgraph_agent.final_answer_sync(state, SYSTEM)

    sent = model.calls[0]
    assert isinstance(sent[0], SystemMessage)
    assert sent[1:] == history
    assert all("Finalizing answer..." not in str(m.content) for m in sent)
    assert state["messages"] == history
