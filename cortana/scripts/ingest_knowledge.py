"""
Knowledge Ingestion Script - Load knowledge base into vector store
Run this script to populate the RAG system with exercise guides, injury info, nutrition tips
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import json
from services.vector_store import VectorStore
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def ingest_exercise_guides():
    """Load exercise guides from JSON into vector store"""

    logger.info("=" * 60)
    logger.info("🧠 Cortana Knowledge Ingestion")
    logger.info("=" * 60)

    # Initialize vector store
    vector_store = VectorStore(store_path="data/vector_store")

    # Clear existing data (optional - comment out to keep existing)
    logger.info("\n📦 Clearing existing vector store...")
    vector_store.clear()

    # Load knowledge base
    knowledge_path = os.path.join("knowledge", "exercise_guides.json")
    logger.info(f"\n📖 Loading knowledge from {knowledge_path}...")

    with open(knowledge_path, 'r', encoding='utf-8') as f:
        knowledge = json.load(f)

    texts = []
    metadatas = []

    # Process exercise guides
    logger.info("\n💪 Processing exercise guides...")
    for exercise in knowledge["exercises"]:
        # Create searchable text chunk
        text = f"Exercise: {exercise['name']}\n"
        text += f"Category: {exercise['category']}\n"
        text += f"Equipment: {exercise['equipment']}\n"
        text += f"Difficulty: {exercise['difficulty']}\n\n"
        text += exercise['content']

        texts.append(text)
        metadatas.append({
            "type": "exercise",
            "name": exercise['name'],
            "category": exercise['category'],
            "equipment": exercise['equipment'],
            "difficulty": exercise['difficulty']
        })

    logger.info(f"  ✓ Loaded {len(knowledge['exercises'])} exercise guides")

    # Process injury guides
    logger.info("\n🏥 Processing injury guides...")
    for injury_guide in knowledge["injury_guides"]:
        text = f"Injury: {injury_guide['injury']}\n\n"
        text += injury_guide['content']

        texts.append(text)
        metadatas.append({
            "type": "injury_guide",
            "injury": injury_guide['injury']
        })

    logger.info(f"  ✓ Loaded {len(knowledge['injury_guides'])} injury guides")

    # Process nutrition guides
    logger.info("\n🥗 Processing nutrition guides...")
    for nutrition_guide in knowledge["nutrition_guides"]:
        text = f"Nutrition Topic: {nutrition_guide['topic']}\n\n"
        text += nutrition_guide['content']

        texts.append(text)
        metadatas.append({
            "type": "nutrition",
            "topic": nutrition_guide['topic']
        })

    logger.info(f"  ✓ Loaded {len(knowledge['nutrition_guides'])} nutrition guides")

    # Add all documents to vector store
    logger.info(f"\n🔄 Embedding {len(texts)} documents...")
    vector_store.add_documents(texts, metadatas)

    # Show stats
    stats = vector_store.get_stats()
    logger.info("\n" + "=" * 60)
    logger.info("✅ Ingestion Complete!")
    logger.info("=" * 60)
    logger.info(f"📊 Stats:")
    logger.info(f"  • Total documents: {stats['total_documents']}")
    logger.info(f"  • Embedding model: {stats['model']}")
    logger.info(f"  • Embedding dimension: {stats['embedding_dim']}")
    logger.info(f"  • Categories: {', '.join(stats['categories'])}")
    logger.info("\n🎉 Vector store is ready for use!")


def test_search():
    """Test the vector store with sample queries"""
    logger.info("\n" + "=" * 60)
    logger.info("🔍 Testing Vector Search")
    logger.info("=" * 60)

    vector_store = VectorStore(store_path="data/vector_store")

    # Test queries
    test_queries = [
        "How do I do a squat with bad knees?",
        "What exercises are good for chest with dumbbells?",
        "What should I eat for fat loss?",
        "Shoulder pain exercises"
    ]

    for query in test_queries:
        logger.info(f"\n📝 Query: '{query}'")
        results = vector_store.search(query, top_k=3)

        for i, result in enumerate(results, 1):
            logger.info(f"\n  Result {i} (similarity: {result['similarity']:.3f}):")
            logger.info(f"    Type: {result['metadata'].get('type', 'unknown')}")
            logger.info(f"    Preview: {result['text'][:100]}...")


if __name__ == "__main__":
    try:
        # Ingest knowledge
        ingest_exercise_guides()

        # Test search
        test_search()

    except Exception as e:
        logger.error(f"\n❌ Error: {e}", exc_info=True)
        sys.exit(1)
