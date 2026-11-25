import logging
from collections.abc import AsyncGenerator
from typing import Annotated, Any, TypedDict

from langchain_core.messages import AIMessage, AnyMessage, HumanMessage, SystemMessage
from langchain_core.tools import BaseTool
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition

from models import OllamaModelFactory

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgentState(TypedDict, total=False):
    """State for the agent graph."""
    messages: Annotated[list[AnyMessage], add_messages]
    streamed_output: AsyncGenerator[str, None]

def build_prompt(state: AgentState, system_prompt: str) -> list[AnyMessage]:
    """Return the model input: the system prompt first, then the history.

    Builds a new list so the graph state is never mutated.
    """
    return [SystemMessage(content=system_prompt), *state["messages"]]

def assistant(
    state: AgentState,
    tools: list[BaseTool],
    system_prompt: str,
    model_name: str | None = None,
) -> dict[str, Any]:
    logger.info("Running assistant node")
    logger.info(f"Current messages: {[msg.type for msg in state['messages']]}")
    messages = build_prompt(state, system_prompt)

    chat_model = OllamaModelFactory().create_model(model_name=model_name, format=None)
    chat_with_tools = chat_model.bind_tools(tools)
    response = chat_with_tools.invoke(messages)

    logger.info(f"Assistant response: {getattr(response, 'content', '[no content]')}")
    return {"messages": [response]}

async def final_answer_async(
    state: AgentState, system_prompt: str, model_name: str | None = None
) -> dict[str, Any]:
    logger.debug("Running final answer async (streaming) node")
    messages = build_prompt(state, system_prompt)

    chat_model = OllamaModelFactory().create_model(model_name=model_name, format=None)
    stream = chat_model.astream(messages)

    async def wrapped_stream():
        logger.debug("Running streaming wrapper...")
        async for chunk in stream:
            logger.debug(f"Streamed chunk: {chunk}")
            if hasattr(chunk, "content"):
                yield chunk.content
            elif isinstance(chunk, str):
                yield chunk

    return {"streamed_output": wrapped_stream()}

def final_answer_sync(
    state: AgentState, system_prompt: str, model_name: str | None = None
) -> dict[str, Any]:
    logger.debug("Running final answer sync node")
    messages = build_prompt(state, system_prompt)

    chat_model = OllamaModelFactory().create_model(model_name=model_name, format=None)
    response = chat_model.invoke(messages)

    return {"messages": [response]}

def create_agent_graph(
    tools: list[BaseTool],
    system_prompt: str,
    streaming: bool = False,
    model_name: str | None = None,
) -> StateGraph:
    builder = StateGraph(AgentState)
    
    # Define nodes
    builder.add_node("assistant", lambda s: assistant(s, tools, system_prompt, model_name))
    builder.add_node("tools", ToolNode(tools))
    if streaming:
        async def final_answer(state: AgentState) -> dict[str, Any]:
            return await final_answer_async(state, system_prompt, model_name)
    else:
        def final_answer(state: AgentState) -> dict[str, Any]:
            return final_answer_sync(state, system_prompt, model_name)
    builder.add_node("final_answer", final_answer)

    # Define edges
    builder.add_edge(START, "assistant")
    builder.add_conditional_edges("assistant", tools_condition)
    builder.add_edge("tools", "final_answer")
    builder.add_edge("final_answer", END)
    
    return builder.compile()

def history_to_messages(history: list[dict[str, str]] | None) -> list[AnyMessage]:
    """Turn ``[{"role": ..., "content": ...}]`` turns into LangChain messages."""
    messages: list[AnyMessage] = []
    for turn in history or []:
        if turn["role"] == "assistant":
            messages.append(AIMessage(content=turn["content"]))
        else:
            messages.append(HumanMessage(content=turn["content"]))
    return messages

def run_agent_graph(
        graph,
        user_prompt: str,
        history: list[dict[str, str]] | None = None) -> str:
    initial_state = {
        "messages": [*history_to_messages(history), HumanMessage(content=user_prompt)],
    }
    final_state = graph.invoke(initial_state)
    final_response = final_state["messages"][-1]
    logger.info(f"Final response: {getattr(final_response, 'content', '[no content]')}")
    return final_response.content if hasattr(final_response, 'content') else str(final_response)

async def run_agent_graph_streaming(
        graph,
        user_prompt: str,
        history: list[dict[str, str]] | None = None,
        ) -> AsyncGenerator[str, None]:
    initial_state = {
        "messages": [*history_to_messages(history), HumanMessage(content=user_prompt)],
    }
    try:
        logger.debug("Running the Agent Graph Streaming Function...")
        final_state = await graph.ainvoke(initial_state) # Run full graph
        stream = final_state.get("streamed_output", None)
        logger.debug(f'Debug Stream: {stream}')

        if hasattr(stream, "__aiter__"): 
            async for chunk in stream:
                logger.debug(f"Debug Chunk: {chunk}")
                yield chunk
        else:
            # No tool was called, so the graph went assistant -> END and the
            # streaming node never ran. The assistant's own answer is the last
            # message in the final state; forward that instead.
            last_message = final_state["messages"][-1]
            content = getattr(last_message, "content", None)
            if isinstance(content, str) and content:
                yield content
            else:
                yield "No stream available."
    except Exception as e:
        logger.exception("Error during agent graph streaming")
        yield f"Error: {str(e)}"
