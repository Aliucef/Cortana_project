"""
Vector Store Service - Manages embedding storage and retrieval for RAG
Uses FAISS for fast similarity search
"""

import os
import json
import pickle
import numpy as np
from typing import List, Dict, Any, Optional
from sentence_transformers import SentenceTransformer
import faiss
import logging

logger = logging.getLogger(__name__)


class VectorStore:
    """
    Vector database using FAISS for efficient similarity search

    Features:
    - Store text chunks with embeddings
    - Fast similarity search
    - Metadata filtering
    - Persistence to disk
    """

    def __init__(self, store_path: str = "data/vector_store"):
        """
        Initialize vector store

        Args:
            store_path: Directory to store index and metadata
        """
        self.store_path = store_path
        os.makedirs(store_path, exist_ok=True)

        # Initialize embedding model (all-MiniLM-L6-v2: fast, good quality, 384 dimensions)
        logger.info("Loading sentence transformer model...")
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.embedding_dim = 384

        # Initialize FAISS index
        self.index = None
        self.documents = []  # Store actual text and metadata

        # Load existing index if available
        self._load_index()

    def add_documents(self, texts: List[str], metadatas: Optional[List[Dict]] = None):
        """
        Add documents to vector store

        Args:
            texts: List of text chunks to add
            metadatas: Optional metadata for each chunk (e.g., source, category)
        """
        if not texts:
            return

        logger.info(f"Adding {len(texts)} documents to vector store...")

        # Generate embeddings
        embeddings = self.embedding_model.encode(texts, show_progress_bar=True)
        embeddings = np.array(embeddings).astype('float32')

        # Initialize index if not exists
        if self.index is None:
            self.index = faiss.IndexFlatL2(self.embedding_dim)  # L2 distance

        # Add to FAISS index
        self.index.add(embeddings)

        # Store documents with metadata
        if metadatas is None:
            metadatas = [{}] * len(texts)

        for text, metadata in zip(texts, metadatas):
            self.documents.append({
                "text": text,
                "metadata": metadata
            })

        logger.info(f"Total documents in store: {len(self.documents)}")

        # Auto-save after adding
        self._save_index()

    def search(self, query: str, top_k: int = 5, filter_metadata: Optional[Dict] = None) -> List[Dict[str, Any]]:
        """
        Search for similar documents

        Args:
            query: Search query text
            top_k: Number of results to return
            filter_metadata: Optional metadata filters (e.g., {"category": "exercises"})

        Returns:
            List of documents with similarity scores
        """
        if self.index is None or len(self.documents) == 0:
            logger.warning("Vector store is empty")
            return []

        # Generate query embedding
        query_embedding = self.embedding_model.encode([query])
        query_embedding = np.array(query_embedding).astype('float32')

        # Search in FAISS
        # Get more results if filtering, so we have enough after filter
        search_k = top_k * 3 if filter_metadata else top_k
        distances, indices = self.index.search(query_embedding, min(search_k, len(self.documents)))

        # Format results
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx >= len(self.documents):  # Safety check
                continue

            doc = self.documents[idx]

            # Apply metadata filtering if specified
            if filter_metadata:
                match = all(
                    doc["metadata"].get(key) == value
                    for key, value in filter_metadata.items()
                )
                if not match:
                    continue

            results.append({
                "text": doc["text"],
                "metadata": doc["metadata"],
                "score": float(dist),  # L2 distance (lower is better)
                "similarity": 1 / (1 + float(dist))  # Convert to similarity (higher is better)
            })

            if len(results) >= top_k:
                break

        return results

    def clear(self):
        """Clear all documents from store"""
        self.index = None
        self.documents = []
        logger.info("Vector store cleared")

    def _save_index(self):
        """Save index and documents to disk"""
        try:
            if self.index is not None:
                # Save FAISS index
                index_path = os.path.join(self.store_path, "faiss.index")
                faiss.write_index(self.index, index_path)

                # Save documents metadata
                docs_path = os.path.join(self.store_path, "documents.pkl")
                with open(docs_path, 'wb') as f:
                    pickle.dump(self.documents, f)

                logger.info(f"Saved vector store to {self.store_path}")
        except Exception as e:
            logger.error(f"Error saving vector store: {e}")

    def _load_index(self):
        """Load index and documents from disk"""
        try:
            index_path = os.path.join(self.store_path, "faiss.index")
            docs_path = os.path.join(self.store_path, "documents.pkl")

            if os.path.exists(index_path) and os.path.exists(docs_path):
                # Load FAISS index
                self.index = faiss.read_index(index_path)

                # Load documents metadata
                with open(docs_path, 'rb') as f:
                    self.documents = pickle.load(f)

                logger.info(f"Loaded {len(self.documents)} documents from {self.store_path}")
        except Exception as e:
            logger.error(f"Error loading vector store: {e}")
            self.index = None
            self.documents = []

    def get_stats(self) -> Dict[str, Any]:
        """Get statistics about the vector store"""
        return {
            "total_documents": len(self.documents),
            "embedding_dim": self.embedding_dim,
            "model": "all-MiniLM-L6-v2",
            "categories": list(set(
                doc["metadata"].get("category", "unknown")
                for doc in self.documents
            ))
        }
