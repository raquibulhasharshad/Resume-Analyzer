import logging
import numpy as np
from typing import List
from sentence_transformers import SentenceTransformer
from app.config import settings

logger = logging.getLogger(__name__)

_model_instance = None

def get_embedding_model():
    """Singleton pattern to lazy-load the SentenceTransformer model."""
    global _model_instance
    if _model_instance is None:
        model_name = settings.EMBEDDING_MODEL
        logger.info(f"Loading SentenceTransformer embedding model: {model_name}")
        _model_instance = SentenceTransformer(model_name)
    return _model_instance

def get_embedding(text: str) -> List[float]:
    """Generate embedding vector for a single string."""
    model = get_embedding_model()
    vector = model.encode(text, convert_to_numpy=True, normalize_embeddings=True)
    return vector.tolist()

def get_embeddings(texts: List[str]) -> List[List[float]]:
    """Generate embedding vectors for a list of strings."""
    if not texts:
        return []
    model = get_embedding_model()
    vectors = model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
    return vectors.tolist()

def compute_cosine_similarity(text1: str, text2: str) -> float:
    """
    Compute realistic domain similarity score (0.0 to 1.0) between two text snippets.
    Recalibrates Sentence-Transformer raw cosine distribution for accurate recruitment matching.
    """
    if not text1.strip() or not text2.strip():
        return 0.0

    model = get_embedding_model()
    emb1 = model.encode(text1, normalize_embeddings=True)
    emb2 = model.encode(text2, normalize_embeddings=True)
    raw_sim = float(np.dot(emb1, emb2))
    
    # Recalibrate raw cosine similarity for NLP domain alignment
    if raw_sim <= 0.15:
        # Unrelated domains (e.g., Software Engineering vs Sales/Marketing)
        scaled_sim = max(0.0, raw_sim * 1.2)
    elif raw_sim <= 0.35:
        # Low/Weak overlap
        scaled_sim = 0.18 + (raw_sim - 0.15) * 1.35
    else:
        # Moderate to high domain match
        scaled_sim = 0.45 + (raw_sim - 0.35) * 0.84

    return max(0.0, min(1.0, scaled_sim))
