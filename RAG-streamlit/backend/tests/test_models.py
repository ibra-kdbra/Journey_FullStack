"""Model and tool modules import without reaching the network.

tools.py used to build a ContextRetriever at module scope, which downloads a
SentenceTransformer model and opens a Milvus connection. Importing it therefore
needed both. It is lazy now, and this test fails if that regresses.
"""


def test_models_module_imports():
    import models

    assert hasattr(models, "OllamaModelFactory")


def test_tools_import_builds_nothing():
    import tools

    assert tools._context_retriever is None, (
        "importing tools constructed the retriever; it downloads a model and "
        "connects to Milvus, so it must stay lazy"
    )
    assert hasattr(tools, "retrieve_context")
