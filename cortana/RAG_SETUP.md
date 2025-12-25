# RAG System Setup Guide

## 🎯 What is RAG?

**RAG (Retrieval-Augmented Generation)** enhances Cortana's AI by giving it access to a knowledge base of exercise guides, injury modifications, and nutrition tips. It combines:
1. **Vector Search** - Find relevant knowledge quickly
2. **AI Generation** - Generate personalized answers using that knowledge + your profile

## 📦 Step 1: Install Dependencies

```powershell
cd D:\Final-Project\cortana
.\venv\Scripts\pip install -r rag_requirements.txt
```

This installs:
- `sentence-transformers` - Converts text to vectors (embeddings)
- `faiss-cpu` - Fast similarity search
- `chromadb` - Alternative vector database
- `pypdf`, `python-docx` - Document processing

**Time:** ~5-10 minutes (downloads models)

## 🧠 Step 2: Ingest Knowledge Base

```powershell
cd D:\Final-Project\cortana
python scripts/ingest_knowledge.py
```

This will:
1. Load exercise guides from `knowledge/exercise_guides.json`
2. Convert them to vector embeddings
3. Store in `data/vector_store/` for fast search
4. Run test queries to verify it works

**Expected output:**
```
🧠 Cortana Knowledge Ingestion
📦 Clearing existing vector store...
📖 Loading knowledge from knowledge/exercise_guides.json...
💪 Processing exercise guides...
  ✓ Loaded 7 exercise guides
🏥 Processing injury guides...
  ✓ Loaded 3 injury guides
🥗 Processing nutrition guides...
  ✓ Loaded 2 nutrition guides
🔄 Embedding 12 documents...
✅ Ingestion Complete!
📊 Stats:
  • Total documents: 12
  • Embedding model: all-MiniLM-L6-v2
  • Embedding dimension: 384
```

**Time:** ~2-3 minutes (downloads embedding model first time)

## 🚀 Step 3: Restart Cortana Server

The RAG service is now integrated! Just restart your server:

```powershell
# Kill current server (Ctrl+C)
python main.py
```

## 💬 Step 4: Test RAG in Telegram

Try these queries to test the RAG system:

### Exercise Form Questions:
- "How do I do dumbbell squats?"
- "Show me how to do push-ups"
- "What's proper form for rows?"

### Injury-Specific Questions:
- "What exercises are safe for bad knees?"
- "I have shoulder pain, what should I avoid?"
- "Alternative exercises for lower back pain"

### Nutrition Questions:
- "What should I eat for fat loss?"
- "Nutrition advice for muscle gain"
- "How much protein do I need?"

### Equipment-Based:
- "Best chest exercises with dumbbells"
- "Bodyweight exercises for back"

## 🔍 How It Works

When you ask a question:

1. **Vector Search** finds 3 most relevant documents from knowledge base
2. **User Context** is retrieved (your profile, injuries, goals)
3. **Combined Prompt** is sent to AI:
   - Your question
   - Retrieved knowledge
   - Your personal profile
4. **AI Response** is personalized to YOU

Example:
```
User: "How do I do squats with bad knees?"

RAG retrieves:
- Dumbbell squat guide
- Knee injury modifications
- Your profile (bad knee, home gym)

AI responds:
"Based on your knee issues and home gym setup, here's how to safely do squats:
1. Use box squats to control depth
2. Don't go below parallel
3. Keep weight in heels..."
```

## 📊 Architecture

```
cortana/
├── data/
│   └── vector_store/          # FAISS index + documents
│       ├── faiss.index        # Vector embeddings
│       └── documents.pkl      # Original text + metadata
├── knowledge/
│   └── exercise_guides.json   # Knowledge base (exercise, injury, nutrition)
├── scripts/
│   └── ingest_knowledge.py    # Load knowledge → vectors
└── services/
    ├── vector_store.py        # FAISS vector database
    ├── rag_service.py         # RAG query engine
    └── ai_service.py          # AI integration (existing)
```

## 🎓 Adding More Knowledge

To add new knowledge:

1. **Edit** `knowledge/exercise_guides.json`:
   - Add new exercises
   - Add injury guides
   - Add nutrition tips

2. **Re-ingest**:
   ```powershell
   python scripts/ingest_knowledge.py
   ```

3. **Restart server**

## 🐛 Troubleshooting

### "ModuleNotFoundError: No module named 'sentence_transformers'"
→ Run Step 1 again (install dependencies)

### "No relevant documents found"
→ Run Step 2 (ingest knowledge base)

### "Vector store is empty"
→ Check that `data/vector_store/faiss.index` exists
→ Re-run ingestion script

### Slow first query
→ Normal! Model loads on first use (~5-10 seconds)
→ Subsequent queries are fast (<1 second)

## 📈 Next Steps

1. Test the RAG system with various questions
2. Add more exercise guides to knowledge base
3. Consider adding:
   - Workout program templates
   - Progressive overload strategies
   - Cardio guidance
   - Mobility/flexibility guides

## 🎉 Benefits

- ✅ **Personalized** - Considers YOUR profile and injuries
- ✅ **Fast** - Vector search is instant
- ✅ **Accurate** - AI has verified knowledge, not hallucinations
- ✅ **Expandable** - Easy to add more knowledge
- ✅ **Offline** - Works without external APIs (except AI)
