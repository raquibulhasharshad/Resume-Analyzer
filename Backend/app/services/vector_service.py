import logging
from typing import List, Tuple
import numpy as np
import faiss
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.services.embedding_service import get_embeddings, get_embedding

logger = logging.getLogger(__name__)

class ResumeVectorStore:
    """FAISS vector store for resume text chunk indexing and RAG retrieval."""

    def __init__(self, chunk_size: int = 400, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
        self.chunks: List[str] = []
        self.index: faiss.IndexFlatIP = None  # Inner product for normalized embeddings (Cosine sim)

    def create_index_from_text(self, text: str) -> int:
        """Split text into chunks, generate embeddings, and build FAISS index."""
        self.chunks = self.text_splitter.split_text(text)
        if not self.chunks:
            self.chunks = [text]

        logger.info(f"Split resume text into {len(self.chunks)} chunks for FAISS index.")
        
        embeddings = get_embeddings(self.chunks)
        embeddings_np = np.array(embeddings, dtype=np.float32)

        dimension = embeddings_np.shape[1]
        self.index = faiss.IndexFlatIP(dimension)
        self.index.add(embeddings_np)
        
        logger.info(f"FAISS index built successfully with {self.index.ntotal} vectors.")
        return len(self.chunks)

    def similarity_search(self, query: str, k: int = 4) -> List[Tuple[str, float]]:
        """Retrieve top k relevant resume chunks for a query with similarity scores."""
        if not self.index or self.index.ntotal == 0:
            return []

        query_vector = np.array([get_embedding(query)], dtype=np.float32)
        top_k = min(k, self.index.ntotal)
        scores, indices = self.index.search(query_vector, top_k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if 0 <= idx < len(self.chunks):
                results.append((self.chunks[idx], float(score)))

        return results

    def get_context_for_rag(self, job_description: str, k: int = 4) -> str:
        """Helper to get concatenated relevant context for RAG prompt."""
        top_results = self.similarity_search(job_description, k=k)
        relevant_chunks = [chunk for chunk, _ in top_results]
        return "\n---\n".join(relevant_chunks)
