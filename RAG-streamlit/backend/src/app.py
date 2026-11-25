import asyncio
import json
import logging
import os
import urllib.request
from typing import Any, Literal

import yaml
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings

from langgraph_agent import (
    create_agent_graph,
    run_agent_graph,
    run_agent_graph_streaming,
)
from tools import check_milvus, multiply, retrieve_context

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load prompts from YAML file
current_dir = os.path.dirname(os.path.abspath(__file__))
prompts_path = os.path.join(current_dir, "prompts.yaml")
with open(prompts_path) as stream:
    prompt_templates = yaml.safe_load(stream)

# Get the system prompt from the YAML file
assistant_system_prompt = prompt_templates["assistant_system_prompt"]

class Settings(BaseSettings):
    """Application settings."""
    # Milvus Configuration
    MILVUS_HOST: str = Field(..., description="Milvus service hostname")
    MILVUS_PORT: int = Field(..., description="Milvus service port")
    
    # Ollama Configuration
    OLLAMA_HOST: str = Field(..., description="Ollama service URL")
    OLLAMA_MODEL: str = Field(default="qwen2:7b", description="Default Ollama model to use")
    
    ALLOWED_MODELS: str = Field(
        default="",
        description="Comma-separated extra Ollama models clients may request via ChatRequest.model "
        "(OLLAMA_MODEL is always allowed)",
    )

    # RAG Configuration
    CHUNK_SIZE: int = Field(default=500, description="Size of text chunks for processing")
    CHUNK_OVERLAP: int = Field(default=100, description="Overlap between chunks")
    MAX_TOKENS: int = Field(default=2048, description="Maximum tokens for model output")
    TEMPERATURE: float = Field(default=0.7, description="Model temperature setting")
    
    # Logging Configuration
    LOG_LEVEL: str = Field(default="INFO", description="Logging level")
    
    # Security Configuration
    CORS_ORIGINS: str = Field(
        default="http://localhost:8501,http://localhost:3000",
        description="Comma-separated list of allowed CORS origins"
    )

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

    @property
    def allowed_models(self) -> list[str]:
        """Models a request may select: the default plus ALLOWED_MODELS."""
        extra = [m.strip() for m in self.ALLOWED_MODELS.split(",") if m.strip()]
        return [self.OLLAMA_MODEL, *[m for m in extra if m != self.OLLAMA_MODEL]]

    @property
    def allowed_origins(self) -> list[str]:
        """Get list of allowed CORS origins."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

# Load settings
try:
    settings = Settings()
    # Configure logging based on settings
    logging.getLogger().setLevel(settings.LOG_LEVEL)
except Exception as e:
    logger.error(f"Failed to load settings: {str(e)}")
    raise

class ChatTurn(BaseModel):
    """One earlier turn of the conversation."""
    role: Literal["user", "assistant"]
    content: str

class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    model: str | None = Field(
        default=None,
        description="Ollama model to use; must be in the server's allow-list. Defaults to OLLAMA_MODEL.",
    )
    user_prompt: str
    history: list[ChatTurn] = Field(
        default_factory=list,
        description="Earlier turns of the conversation, oldest first, excluding user_prompt.",
    )

def resolve_model(requested: str | None) -> str | None:
    """Return the model to use, or raise 400 if it is not allowed.

    None means "use the server default" and is passed through unchanged.
    """
    if requested is None or requested == settings.OLLAMA_MODEL:
        return requested
    if requested not in settings.allowed_models:
        raise HTTPException(
            status_code=400,
            detail=f"Model '{requested}' is not allowed. Allowed: {settings.allowed_models}",
        )
    return requested

class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    response: str

app = FastAPI(
    title="RAG Backend API",
    description="Backend API for RAG (Retrieval-Augmented Generation) application",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the agent graph
tools = [multiply, retrieve_context]

@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint."""
    return {"message": "Hello World from RAG Backend!"}

def check_dependencies() -> None:
    """Raise if Milvus or Ollama is unreachable."""
    try:
        check_milvus()
    except Exception as e:
        raise RuntimeError(f"Milvus unavailable: {e}") from e
    try:
        url = settings.OLLAMA_HOST.rstrip("/") + "/api/tags"
        with urllib.request.urlopen(url, timeout=5) as resp:  # noqa: S310
            if resp.status != 200:
                raise RuntimeError(f"HTTP {resp.status}")
    except Exception as e:
        raise RuntimeError(f"Ollama unavailable: {e}") from e

@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    try:
        await asyncio.to_thread(check_dependencies)
        return {"status": "healthy"}
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {e}") from e

@app.get("/config")
async def get_config() -> dict[str, Any]:
    """Get current configuration (excluding sensitive data)."""
    return {
        "milvus": {
            "host": settings.MILVUS_HOST,
            "port": settings.MILVUS_PORT
        },
        "ollama": {
            "host": settings.OLLAMA_HOST,
            "model": settings.OLLAMA_MODEL
        },
        "rag": {
            "chunk_size": settings.CHUNK_SIZE,
            "chunk_overlap": settings.CHUNK_OVERLAP,
            "max_tokens": settings.MAX_TOKENS,
            "temperature": settings.TEMPERATURE
        }
    }

def _history(request: ChatRequest) -> list[dict[str, str]]:
    return [turn.model_dump() for turn in request.history]

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """Handle chat requests with tool support.

    Args:
        request: The chat request containing model, system prompt, and user prompt.

    Returns:
        ChatResponse containing the model's response.

    Raises:
        HTTPException: If there's an error processing the request.
    """
    try:
        model_name = resolve_model(request.model)
        agent_graph = create_agent_graph(tools, assistant_system_prompt, False, model_name)
        # Use the LangGraph agent
        response = run_agent_graph(agent_graph, request.user_prompt, _history(request))
        return ChatResponse(response=response)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) from e

@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """Handle streaming chat requests with tool support."""
    try:
        model_name = resolve_model(request.model)
        agent_graph = create_agent_graph(tools, assistant_system_prompt, True, model_name)
        # Use the LangGraph agent in streaming mode
        
        async def stream_generator():
            try:
                async for chunk in run_agent_graph_streaming(agent_graph, request.user_prompt, _history(request)):
                    if chunk:
                        yield f"data: {json.dumps({'content': chunk})}\n\n"
            except Exception as e:
                logger.error(f"Error in stream generator: {str(e)}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
            finally:
                # Send an end-of-stream marker
                yield "data: [DONE]\n\n"

        return StreamingResponse(
            stream_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",  # Disable nginx buffering
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat stream: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) from e


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
