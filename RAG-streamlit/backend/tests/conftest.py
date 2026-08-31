"""Settings the app requires at import time.

app.Settings and models.OllamaSettings are pydantic-settings models with
required fields, so importing either module without these raises
ValidationError. Set here rather than in CI so the suite is self-contained.
"""

import os
import sys
from pathlib import Path

# The modules import each other by bare name (`from tools import ...`), so src/
# has to be the import root - the same arrangement the Dockerfile makes by
# copying src/ to the image root.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

os.environ.setdefault("MILVUS_HOST", "localhost")
os.environ.setdefault("MILVUS_PORT", "19530")
os.environ.setdefault("OLLAMA_HOST", "http://localhost:11434")
os.environ.setdefault("OLLAMA_MODEL", "qwen2:7b")
os.environ.setdefault("MAX_TOKENS", "2048")
os.environ.setdefault("TEMPERATURE", "0.7")
