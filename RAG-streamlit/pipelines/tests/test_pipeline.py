from pathlib import Path
from unittest.mock import MagicMock, patch

import numpy as np
import pytest  # type: ignore
import yaml

from pipeline import (
    Config,
    ConfigError,
    MarkdownProcessor,
    MilvusConnector,
    ModelError,
    load_config,
    process_documents,
)

# Test data
SAMPLE_CONFIG = {
    'embedding_model': 'all-MiniLM-L6-v2',
    'keyword_model': 'all-MiniLM-L6-v2',
    'chunk_size': 500,
    'chunk_overlap': 100,
    'markdown_folder': '../docs',
    'milvus': {
        'host': 'localhost',
        'port': 19530
    },
    'collection': {
        'name': 'test_collection',
        'schema': {
            'fields': [
                {
                    'name': 'id',
                    'data_type': 'INT64',
                    'description': 'Primary key',
                    'is_primary': True,
                    'auto_id': True
                },
                {
                    'name': 'embedding',
                    'data_type': 'FLOAT_VECTOR',
                    'description': 'Document embedding',
                    'dim': 384
                },
                {
                    'name': 'content',
                    'data_type': 'VARCHAR',
                    'description': 'Document content',
                    'max_length': 65535
                },
                {
                    'name': 'metadata',
                    'data_type': 'JSON',
                    'description': 'Document metadata'
                },
                {
                    'name': 'keywords',
                    'data_type': 'ARRAY',
                    'description': 'Document keywords',
                    'element_type': 'VARCHAR'
                },
                {
                    'name': 'created_at',
                    'data_type': 'VARCHAR',
                    'description': 'Creation timestamp'
                }
            ]
        }
    }
}

@pytest.fixture
def config():
    """Create a test configuration."""
    return Config.from_dict(SAMPLE_CONFIG)

@pytest.fixture
def mock_milvus():
    """Mock Milvus connections and collections."""
    with patch('pipeline.connections') as mock_conn, \
         patch('pipeline.Collection') as mock_collection, \
         patch('pipeline.utility') as mock_utility:
        mock_utility.has_collection.return_value = False
        mock_collection.return_value = MagicMock()
        yield mock_conn, mock_collection, mock_utility

@pytest.fixture
def mock_models():
    """Mock sentence transformers and keybert models."""
    with patch('pipeline.SentenceTransformer') as mock_st, \
         patch('pipeline.KeyBERT') as mock_kb:
        # Create a mock for the SentenceTransformer instance
        mock_st_instance = MagicMock()
        # Configure encode to return a numpy array with shape (2, 384) for two chunks
        mock_st_instance.encode.return_value = np.array([[0.1] * 384, [0.2] * 384])
        mock_st.return_value = mock_st_instance
        
        # Create a mock for the KeyBERT instance
        mock_kb_instance = MagicMock()
        mock_kb_instance.extract_keywords.return_value = [('test', 0.5)]
        mock_kb.return_value = mock_kb_instance
        
        yield mock_st, mock_kb

def test_config_validation():
    """Test configuration validation."""
    # Test missing required field
    invalid_config = SAMPLE_CONFIG.copy()
    del invalid_config['embedding_model']
    with pytest.raises(ConfigError, match="Missing required field"):
        Config.from_dict(invalid_config)

    # Test invalid chunk size
    invalid_config = SAMPLE_CONFIG.copy()
    invalid_config['chunk_size'] = -1
    with pytest.raises(ConfigError, match="chunk_size must be a positive integer"):
        Config.from_dict(invalid_config)

    # Test invalid chunk overlap
    invalid_config = SAMPLE_CONFIG.copy()
    invalid_config['chunk_overlap'] = -1
    with pytest.raises(ConfigError, match="chunk_overlap must be a non-negative integer"):
        Config.from_dict(invalid_config)

def test_milvus_connector_initialization(config, mock_milvus, mock_models):
    """Test MilvusConnector initialization."""
    connector = MilvusConnector(config)
    assert connector.config == config
    mock_milvus[0].connect.assert_called_once_with(
        "default", host=config.milvus_host, port=config.milvus_port
    )

def test_milvus_connector_collection_creation(config, mock_milvus, mock_models):
    """Test collection creation in MilvusConnector."""
    connector = MilvusConnector(config)
    connector.ensure_collection_exists()
    mock_milvus[1].assert_called_once_with(
        name=config.collection_name,
        schema=connector._create_collection_schema()
    )

def test_milvus_connector_data_insertion(config, mock_milvus, mock_models):
    """Test data insertion in MilvusConnector."""
    connector = MilvusConnector(config)
    chunks = ["Test chunk 1", "Test chunk 2"]
    metadata_list = [{"source": "test1"}, {"source": "test2"}]
    
    connector.insert_data(chunks, metadata_list)
    
    # Verify model calls
    mock_models[0].return_value.encode.assert_called_once_with(chunks)
    assert mock_models[1].return_value.extract_keywords.call_count == len(chunks)
    
    # Verify collection operations
    collection = mock_milvus[1].return_value
    collection.insert.assert_called_once()
    collection.flush.assert_called_once()

def test_markdown_processor():
    """Test MarkdownProcessor functionality."""
    # Create test markdown file
    test_content = """---
title: Test Document
author: Test Author
---

# Test Content
This is a test document.
"""
    test_file = Path("test_docs/test.md")
    test_file.parent.mkdir(exist_ok=True)
    test_file.write_text(test_content)

    try:
        # Test parsing
        metadata, content = MarkdownProcessor.parse_markdown(str(test_file))
        assert metadata['title'] == 'Test Document'
        assert metadata['author'] == 'Test Author'
        assert '<h1>Test Content</h1>' in content

        # Test chunking
        chunks = MarkdownProcessor.chunk_text(content, chunk_size=100, overlap=20)
        assert len(chunks) > 0
        assert all(len(chunk) <= 100 for chunk in chunks)
    finally:
        # Cleanup
        test_file.unlink()
        test_file.parent.rmdir()

def test_load_config(tmp_path):
    """Test configuration loading."""
    # Create test config file
    config_file = tmp_path / "test_config.yaml"
    config_file.write_text(yaml.dump(SAMPLE_CONFIG))

    # Test loading
    config = load_config(str(config_file))
    assert config.embedding_model == SAMPLE_CONFIG['embedding_model']
    assert config.chunk_size == SAMPLE_CONFIG['chunk_size']

def test_process_documents(config, mock_milvus, mock_models, tmp_path):
    """Test document processing pipeline."""
    # Create test markdown files
    docs_dir = tmp_path / "test_docs"
    docs_dir.mkdir()
    
    test_files = [
        ("doc1.md", "Test document 1"),
        ("doc2.md", "Test document 2")
    ]
    
    for filename, content in test_files:
        file_path = docs_dir / filename
        file_path.write_text(f"---\ntitle: {filename}\n---\n\n{content}")

    # Update config with test directory
    config.markdown_folder = str(docs_dir)
    
    # Create connector and process documents
    connector = MilvusConnector(config)
    process_documents(config, connector)
    
    # Verify collection operations
    collection = mock_milvus[1].return_value
    # Each document is processed and inserted separately
    assert collection.insert.call_count == len(test_files)
    # Flush is called after each document insertion
    assert collection.flush.call_count == len(test_files)

def test_error_handling():
    """Test error handling in various components."""
    # Test ConfigError
    with pytest.raises(ConfigError):
        Config.from_dict({})

    # Test MilvusError
    with patch('pipeline.connections') as mock_conn:
        mock_conn.connect.side_effect = Exception("Connection failed")
        with pytest.raises(ModelError):
            MilvusConnector(Config.from_dict(SAMPLE_CONFIG))

    # Test ModelError
    with patch('pipeline.SentenceTransformer') as mock_st:
        mock_st.side_effect = Exception("Model loading failed")
        with pytest.raises(ModelError):
            MilvusConnector(Config.from_dict(SAMPLE_CONFIG)) 
def test_process_markdown_strips_front_matter(tmp_path):
    """Front matter is metadata, not prose, so it must not reach the embeddings.

    process_markdown used to read the file raw, which left "---",
    "title: ..." and "author: ..." in the chunk text that gets embedded and
    inserted into Milvus. test_process_documents could not see this: it only
    counts insert and flush calls, never looking at what was inserted.
    """
    doc = tmp_path / "doc.md"
    doc.write_text(
        "---\n"
        "title: Test Document\n"
        "author: Test Author\n"
        "---\n"
        "\n"
        "# Heading\n"
        "\n"
        "The only body text.\n"
    )

    processor = MarkdownProcessor(chunk_size=500, chunk_overlap=100)
    chunks = processor.process_markdown(str(doc))

    assert chunks, "expected at least one chunk"
    body = "\n".join(chunk["content"] for chunk in chunks)
    assert "The only body text." in body
    assert "title: Test Document" not in body
    assert "author: Test Author" not in body
    assert "---" not in body

    # The heading is lifted out of the body into the chunk's header hierarchy.
    assert chunks[0]["metadata"]["headers"] == {"1": "Heading"}
    assert chunks[0]["metadata"]["source"] == str(doc)


def _overlap(a: str, b: str) -> int:
    """Length of the longest suffix of a that is also a prefix of b."""
    return max((k for k in range(1, min(len(a), len(b)) + 1) if b.startswith(a[-k:])), default=0)


def test_long_single_line_respects_chunk_size_and_overlap(tmp_path):
    """A 5000-char line used to become one oversized chunk with no overlap."""
    doc = tmp_path / "long.md"
    doc.write_text("# Title\n\n" + " ".join(f"word{i:04d}" for i in range(556)) + "\n")  # ~5000 chars, one line

    chunks = MarkdownProcessor(chunk_size=500, chunk_overlap=100).process_markdown(str(doc))

    assert len(chunks) > 1
    assert all(len(c["content"]) <= 500 for c in chunks)
    for prev, nxt in zip(chunks, chunks[1:]):
        assert 0 < _overlap(prev["content"], nxt["content"]) <= 100
        assert _overlap(prev["content"], nxt["content"]) >= 80
    assert all(c["metadata"]["headers"] == {"1": "Title"} for c in chunks)


def test_sections_keep_their_own_headers(tmp_path):
    doc = tmp_path / "sections.md"
    doc.write_text("# A\n\nfirst body\n\n## B\n\nsecond body\n")

    chunks = MarkdownProcessor(chunk_size=500, chunk_overlap=100).process_markdown(str(doc))

    assert [(c["content"], c["metadata"]["headers"]) for c in chunks] == [
        ("first body", {"1": "A"}),
        ("second body", {"1": "A", "2": "B"}),
    ]


def test_index_metric_matches_backend_search(config, mock_milvus, mock_models):
    """The index metric must equal the one the backend searches with (COSINE).

    Milvus rejects a search whose metric differs from the index metric.
    """
    connector = MilvusConnector(config)
    connector.ensure_collection_exists()

    collection = mock_milvus[1].return_value
    collection.create_index.assert_called_once()
    kwargs = collection.create_index.call_args.kwargs
    assert kwargs["field_name"] == "embedding"
    assert kwargs["index_params"]["metric_type"] == "COSINE"


def test_metric_type_is_configurable():
    cfg = Config.from_dict({**SAMPLE_CONFIG, 'metric_type': 'IP'})
    assert cfg.metric_type == 'IP'
    assert Config.from_dict(SAMPLE_CONFIG).metric_type == 'COSINE'


# --- idempotency, schema handling and failure reporting -----------------

import pipeline as pipeline_module  # noqa: E402
from pipeline import IngestionError, SchemaMismatchError  # noqa: E402


def _existing_collection(mock_milvus, schema):
    _, mock_collection, mock_utility = mock_milvus
    mock_utility.has_collection.return_value = True
    mock_collection.return_value.schema = schema
    return mock_collection, mock_utility


def test_schema_match_ignores_description_and_order(config, mock_milvus, mock_models):
    connector = MilvusConnector(config)
    schema = connector._create_collection_schema()
    # Same fields, different order and collection/field descriptions.
    reordered = pipeline_module.CollectionSchema(
        fields=list(reversed(schema.fields)), description="something else entirely"
    )
    _, mock_utility = _existing_collection(mock_milvus, reordered)
    connector.ensure_collection_exists()
    mock_utility.drop_collection.assert_not_called()


def test_schema_mismatch_without_recreate_raises_and_drops_nothing(config, mock_milvus, mock_models):
    connector = MilvusConnector(config)
    wrong = connector._create_collection_schema()
    next(f for f in wrong.fields if f.name == "embedding").params["dim"] = 768
    _, mock_utility = _existing_collection(mock_milvus, wrong)
    with pytest.raises(SchemaMismatchError, match="--recreate"):
        connector.ensure_collection_exists()
    mock_utility.drop_collection.assert_not_called()


def test_schema_mismatch_with_recreate_drops_and_rebuilds(config, mock_milvus, mock_models):
    connector = MilvusConnector(config)
    wrong = connector._create_collection_schema()
    next(f for f in wrong.fields if f.name == "embedding").params["dim"] = 768
    mock_collection, mock_utility = _existing_collection(mock_milvus, wrong)
    connector.ensure_collection_exists(recreate=True)
    mock_utility.drop_collection.assert_called_once_with(config.collection_name)
    assert mock_collection.return_value.create_index.called


def test_missing_field_is_a_mismatch(config, mock_milvus, mock_models):
    connector = MilvusConnector(config)
    full = connector._create_collection_schema()
    partial = pipeline_module.CollectionSchema(fields=full.fields[:-1])
    _, mock_utility = _existing_collection(mock_milvus, partial)
    with pytest.raises(SchemaMismatchError, match="created_at"):
        connector.ensure_collection_exists()
    mock_utility.drop_collection.assert_not_called()


def test_insert_replaces_existing_chunks_of_source(config, mock_milvus, mock_models):
    connector = MilvusConnector(config)
    connector.insert_data(
        ["a", "b"], [{"source": "x.md"}, {"source": "x.md"}], replace_source="x.md"
    )
    collection = mock_milvus[1].return_value
    collection.delete.assert_called_once_with('metadata["source"] == "x.md"')
    # delete happens before insert, so a re-run cannot leave duplicates
    names = [c[0] for c in collection.method_calls if c[0] in ("delete", "insert")]
    assert names == ["delete", "insert"]


def test_running_twice_deletes_each_source_each_time(config, mock_milvus, mock_models, tmp_path):
    (tmp_path / "d.md").write_text("some text")
    config.markdown_folder = str(tmp_path)
    connector = MilvusConnector(config)
    mock_models[0].return_value.encode.return_value = np.array([[0.1] * 384])
    process_documents(config, connector)
    process_documents(config, connector)
    collection = mock_milvus[1].return_value
    assert collection.delete.call_count == 2
    expected = f'metadata["source"] == "{tmp_path / "d.md"}"'
    assert all(c.args == (expected,) for c in collection.delete.call_args_list)


def test_failed_file_raises_ingestion_error_after_trying_all(config, mock_milvus, mock_models, tmp_path):
    (tmp_path / "bad.md").write_text("bad")
    (tmp_path / "good.md").write_text("good")
    config.markdown_folder = str(tmp_path)
    connector = MilvusConnector(config)
    mock_models[0].return_value.encode.return_value = np.array([[0.1] * 384])
    real = connector.insert_data

    def flaky(chunks, metadata, replace_source=None):
        if replace_source.endswith("bad.md"):
            raise ModelError("boom")
        return real(chunks, metadata, replace_source=replace_source)

    connector.insert_data = flaky
    with pytest.raises(IngestionError, match="bad.md"):
        process_documents(config, connector)
    assert mock_milvus[1].return_value.insert.call_count == 1  # good.md still ingested


def test_main_exits_nonzero_when_a_file_fails(config):
    with patch("pipeline.load_config", return_value=config), \
         patch("pipeline.MilvusConnector"), \
         patch("pipeline.connections"), \
         patch("pipeline.process_documents", side_effect=IngestionError("1 file(s) failed")):
        with pytest.raises(SystemExit) as exc:
            pipeline_module.main([])
    assert exc.value.code == 1


def test_main_exits_nonzero_on_schema_mismatch_and_passes_recreate(config):
    with patch("pipeline.load_config", return_value=config), \
         patch("pipeline.MilvusConnector"), \
         patch("pipeline.connections"), \
         patch("pipeline.process_documents", side_effect=SchemaMismatchError("nope")) as pd:
        with pytest.raises(SystemExit) as exc:
            pipeline_module.main([])
        assert exc.value.code == 1
        assert pd.call_args.kwargs["recreate"] is False
        with pytest.raises(SystemExit):
            pipeline_module.main(["--recreate"])
        assert pd.call_args.kwargs["recreate"] is True


def test_main_succeeds_with_exit_zero(config):
    with patch("pipeline.load_config", return_value=config), \
         patch("pipeline.MilvusConnector"), \
         patch("pipeline.connections"), \
         patch("pipeline.process_documents"):
        assert pipeline_module.main([]) is None
