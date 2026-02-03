# FAISS Index Structure - Technical Diagram

## Figure 5.2: FAISS Index Structure and Vector-Metadata Correspondence

This diagram illustrates the binary index file structure with 384-dimension vectors and their critical linkage to metadata entries through positional correspondence.

---

## Diagram 1: FAISS Index and Metadata Correspondence

```mermaid
graph TB
    subgraph FAISS_Index["FAISS Binary Index (faiss.index)"]
        V0["Vector[0]<br/>384 dimensions<br/>[0.234, -0.891, 0.567, ...]"]
        V1["Vector[1]<br/>384 dimensions<br/>[0.123, 0.456, -0.234, ...]"]
        V2["Vector[2]<br/>384 dimensions<br/>[-0.678, 0.912, 0.345, ...]"]
        V3["Vector[3]<br/>384 dimensions<br/>[0.456, -0.123, 0.789, ...]"]
        Vdots["..."]
        Vn["Vector[n]<br/>384 dimensions<br/>[0.891, 0.234, -0.567, ...]"]
    end

    subgraph Metadata_File["metadata.json"]
        M0["Entry[0]<br/>{<br/>  transaction_id: 1,<br/>  user_id: 42,<br/>  description: 'Coffee at Starbucks',<br/>  category: 'Food',<br/>  amount: 5.50,<br/>  transaction_date: '2024-01-15'<br/>}"]
        M1["Entry[1]<br/>{<br/>  transaction_id: 2,<br/>  user_id: 42,<br/>  description: 'Uber ride to work',<br/>  category: 'Transport',<br/>  amount: 12.00,<br/>  transaction_date: '2024-01-15'<br/>}"]
        M2["Entry[2]<br/>{<br/>  transaction_id: 3,<br/>  user_id: 42,<br/>  description: 'Netflix subscription',<br/>  category: 'Entertainment',<br/>  amount: 15.99,<br/>  transaction_date: '2024-01-16'<br/>}"]
        M3["Entry[3]<br/>{<br/>  transaction_id: 4,<br/>  user_id: 42,<br/>  description: 'Gym membership',<br/>  category: 'Health',<br/>  amount: 50.00,<br/>  transaction_date: '2024-01-16'<br/>}"]
        Mdots["..."]
        Mn["Entry[n]<br/>{<br/>  transaction_id: n+1,<br/>  user_id: 42,<br/>  description: '...',<br/>  category: '...',<br/>  amount: ...,<br/>  transaction_date: '...'<br/>}"]
    end

    V0 -.->|"Position 0"| M0
    V1 -.->|"Position 1"| M1
    V2 -.->|"Position 2"| M2
    V3 -.->|"Position 3"| M3
    Vn -.->|"Position n"| Mn

    style FAISS_Index fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style Metadata_File fill:#fff3e0,stroke:#f57c00,stroke-width:3px
    style V0 fill:#bbdefb,stroke:#1976d2
    style V1 fill:#bbdefb,stroke:#1976d2
    style V2 fill:#bbdefb,stroke:#1976d2
    style V3 fill:#bbdefb,stroke:#1976d2
    style Vn fill:#bbdefb,stroke:#1976d2
    style M0 fill:#ffe0b2,stroke:#f57c00
    style M1 fill:#ffe0b2,stroke:#f57c00
    style M2 fill:#ffe0b2,stroke:#f57c00
    style M3 fill:#ffe0b2,stroke:#f57c00
    style Mn fill:#ffe0b2,stroke:#f57c00
```

**Key Point**: Vector position **i** in the FAISS index corresponds exactly to metadata entry **i**, establishing the critical linkage between semantic search results and actual database records.

---

## Diagram 2: Semantic Search Flow with Index-Metadata Linkage

```mermaid
sequenceDiagram
    participant User
    participant AI as AI Chat Agent
    participant Embed as Sentence Transformer<br/>(all-MiniLM-L6-v2)
    participant FAISS as FAISS Index<br/>(384-dim vectors)
    participant Meta as metadata.json
    participant DB as PostgreSQL

    User->>AI: "What did I spend on food last week?"
    AI->>Embed: Encode query to vector
    Embed-->>AI: Query vector [0.234, -0.891, ...]<br/>(384 dimensions)

    AI->>FAISS: search(query_vector, k=5)
    Note over FAISS: Performs cosine similarity<br/>on 384-dim vectors
    FAISS-->>AI: Return indices: [0, 15, 23, 8, 42]<br/>with distances: [0.92, 0.87, 0.81, 0.78, 0.75]

    AI->>Meta: Retrieve entries at indices [0, 15, 23, 8, 42]
    Note over Meta: Position i maps to Entry[i]
    Meta-->>AI: Metadata array:<br/>Entry[0]: {transaction_id: 1, ...}<br/>Entry[15]: {transaction_id: 16, ...}<br/>Entry[23]: {transaction_id: 24, ...}<br/>Entry[8]: {transaction_id: 9, ...}<br/>Entry[42]: {transaction_id: 43, ...}

    AI->>DB: SELECT * FROM finance_records<br/>WHERE id IN (1, 16, 24, 9, 43)
    DB-->>AI: Full transaction details

    AI-->>User: "Last week you spent $45.50 on food:<br/>- $5.50 at Starbucks<br/>- $12.00 at McDonald's<br/>- $28.00 at grocery store"
```

---

## Diagram 3: FAISS Binary Index Internal Structure

```mermaid
graph LR
    subgraph File_System["File System"]
        IndexFile["📄 faiss.index<br/>(Binary File)"]
        MetaFile["📄 metadata.json<br/>(JSON Array)"]
    end

    subgraph FAISS_Binary["FAISS Index Binary Structure"]
        Header["Index Header<br/>- Index type: IndexFlatIP<br/>- Dimensions: 384<br/>- Number of vectors: n<br/>- Metric: Inner Product"]
        VectorData["Vector Data Block<br/>- Float32 array<br/>- Size: n × 384 × 4 bytes<br/>- Contiguous memory<br/>- Row-major order"]
    end

    subgraph Vector_Layout["384-Dimensional Vector Layout"]
        Dim0["dim[0]<br/>float32"]
        Dim1["dim[1]<br/>float32"]
        Dim2["dim[2]<br/>float32"]
        DimDots["..."]
        Dim383["dim[383]<br/>float32"]
    end

    subgraph Metadata_Structure["Metadata JSON Structure"]
        MetaArray["[\n  Entry 0,\n  Entry 1,\n  Entry 2,\n  ...,\n  Entry n\n]"]
        EntryStruct["Entry Structure:<br/>{<br/>  'transaction_id': int,<br/>  'user_id': int,<br/>  'description': str,<br/>  'category': str,<br/>  'amount': float,<br/>  'transaction_date': str<br/>}"]
    end

    IndexFile --> Header
    IndexFile --> VectorData
    VectorData --> Vector_Layout
    MetaFile --> MetaArray
    MetaArray --> EntryStruct

    style File_System fill:#f5f5f5,stroke:#616161,stroke-width:2px
    style FAISS_Binary fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style Metadata_Structure fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style Vector_Layout fill:#c5e1a5,stroke:#689f38,stroke-width:2px
    style Header fill:#90caf9,stroke:#1976d2
    style VectorData fill:#90caf9,stroke:#1976d2
    style MetaArray fill:#ffcc80,stroke:#f57c00
    style EntryStruct fill:#ffcc80,stroke:#f57c00
```

---

## Diagram 4: Vector Addition and Index Update Process

```mermaid
flowchart TD
    Start([New Transaction Created]) --> Extract[Extract Transaction Data<br/>transaction_id: 100<br/>description: 'Dinner at Italian restaurant'<br/>category: 'Food'<br/>amount: 45.00]

    Extract --> Encode[Encode Description to Vector<br/>Using Sentence Transformer<br/>Input: 'Dinner at Italian restaurant'<br/>Output: 384-dim vector]

    Encode --> CheckIndex{FAISS Index<br/>Exists?}

    CheckIndex -->|No| CreateIndex[Create New Index<br/>faiss.IndexFlatIP(384)]
    CheckIndex -->|Yes| LoadIndex[Load Existing Index<br/>from faiss.index]

    CreateIndex --> AddVector
    LoadIndex --> AddVector[Add Vector to Index<br/>index.add(vector)<br/>New position: n]

    AddVector --> CreateMeta[Create Metadata Entry<br/>{<br/>  transaction_id: 100,<br/>  user_id: 42,<br/>  description: 'Dinner...',<br/>  category: 'Food',<br/>  amount: 45.00,<br/>  transaction_date: '2024-01-20'<br/>}]

    CreateMeta --> AppendMeta[Append to metadata.json<br/>at position n]

    AppendMeta --> SaveIndex[Save FAISS Index<br/>faiss.write_index]

    SaveIndex --> SaveMeta[Save metadata.json<br/>with new entry]

    SaveMeta --> Verify{Verify:<br/>len(vectors) ==<br/>len(metadata)?}

    Verify -->|Yes| Success([✅ Index Updated<br/>Vector[n] ↔ Entry[n]])
    Verify -->|No| Error([❌ Synchronization Error])

    style Start fill:#c8e6c9,stroke:#388e3c,stroke-width:2px
    style Success fill:#c8e6c9,stroke:#388e3c,stroke-width:2px
    style Error fill:#ffcdd2,stroke:#d32f2f,stroke-width:2px
    style Verify fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style AddVector fill:#bbdefb,stroke:#1976d2,stroke-width:2px
    style AppendMeta fill:#ffe0b2,stroke:#f57c00,stroke-width:2px
```

---

## Diagram 5: Index-Metadata Correspondence Guarantee

```mermaid
graph TB
    subgraph Invariant["Critical Invariant - Always Maintained"]
        Rule["RULE: index.ntotal == len(metadata)<br/><br/>For all i where 0 ≤ i < index.ntotal:<br/>Vector[i] in FAISS ⟷ Entry[i] in metadata.json"]
    end

    subgraph Operations["Operations That Preserve Invariant"]
        Add["ADD Operation<br/>1. Encode description → vector<br/>2. index.add(vector)<br/>3. metadata.append(entry)<br/>4. Save both files<br/>✅ Atomic operation"]

        Search["SEARCH Operation<br/>1. Encode query → vector<br/>2. index.search(vector, k)<br/>3. Get indices [i₁, i₂, ..., iₖ]<br/>4. metadata[i₁], metadata[i₂], ...<br/>✅ Read-only, cannot break invariant"]

        Delete["DELETE Operation<br/>NOT IMPLEMENTED<br/>⚠️ Would require:<br/>- Remove vector at index i<br/>- Remove metadata[i]<br/>- Reindex all j > i<br/>❌ Complex, avoided"]
    end

    subgraph Validation["Synchronization Validation"]
        Check["On Load:<br/>assert index.ntotal == len(metadata)<br/>On Add:<br/>assert index.ntotal == len(metadata)"]
    end

    Rule --> Add
    Rule --> Search
    Rule --> Delete
    Add --> Check
    Delete --> Check

    style Invariant fill:#ffebee,stroke:#c62828,stroke-width:3px
    style Rule fill:#ffcdd2,stroke:#c62828,stroke-width:2px,font-size:12px
    style Operations fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style Add fill:#c8e6c9,stroke:#388e3c
    style Search fill:#c8e6c9,stroke:#388e3c
    style Delete fill:#ffe0b2,stroke:#ef6c00
    style Validation fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    style Check fill:#b3e5fc,stroke:#0277bd
```

---

## Technical Specifications

### FAISS Index Configuration
```python
# Index Initialization
dimension = 384  # Sentence Transformer output dimension
index = faiss.IndexFlatIP(dimension)  # Inner Product (cosine similarity)

# Index Properties
- Type: IndexFlatIP (exact search, no quantization)
- Metric: Inner Product (normalized vectors = cosine similarity)
- Dimension: 384 (all-MiniLM-L6-v2 model)
- Storage: Binary format (.index file)
- Search: Exhaustive (100% recall)
```

### Metadata Structure
```python
# metadata.json format
[
    {
        "transaction_id": 1,          # Primary key from finance_records table
        "user_id": 42,                # User identifier
        "description": "Coffee shop", # Transaction description
        "category": "Food",           # Expense category
        "amount": 5.50,               # Transaction amount
        "transaction_date": "2024-01-15"  # Date string (YYYY-MM-DD)
    },
    # ... more entries
]
```

### Storage Requirements
- **Vector Storage**: n vectors × 384 dimensions × 4 bytes (float32) = n × 1,536 bytes
- **Metadata Storage**: n entries × ~200 bytes average (JSON) = n × 200 bytes
- **Example**: 1,000 transactions = ~1.5 MB (vectors) + ~200 KB (metadata) = ~1.7 MB total

### Performance Characteristics
- **Search Complexity**: O(n × d) where n = number of vectors, d = 384
- **Search Time**: ~1-5ms for 1,000 vectors on typical hardware
- **Memory Usage**: Entire index loaded into RAM for fast access
- **Accuracy**: 100% recall (exact search, no approximation)

---

## Usage Example

### Adding a Transaction to Index
```python
# Step 1: Create transaction in database
transaction = {
    'id': 100,
    'user_id': 42,
    'description': 'Dinner at Italian restaurant',
    'category': 'Food',
    'amount': 45.00,
    'transaction_date': '2024-01-20'
}

# Step 2: Encode description to vector
vector = sentence_transformer.encode(transaction['description'])
# Result: array of 384 float32 values

# Step 3: Add to FAISS index
index.add(vector.reshape(1, -1))
# Vector now at position index.ntotal - 1

# Step 4: Add metadata entry at same position
metadata.append({
    'transaction_id': transaction['id'],
    'user_id': transaction['user_id'],
    'description': transaction['description'],
    'category': transaction['category'],
    'amount': transaction['amount'],
    'transaction_date': transaction['transaction_date']
})

# Step 5: Save both files
faiss.write_index(index, 'faiss.index')
with open('metadata.json', 'w') as f:
    json.dump(metadata, f)
```

### Searching the Index
```python
# Step 1: Encode query
query = "What did I spend on restaurants?"
query_vector = sentence_transformer.encode(query)

# Step 2: Search FAISS index
k = 5  # Top 5 results
distances, indices = index.search(query_vector.reshape(1, -1), k)

# Step 3: Retrieve metadata using indices
results = []
for idx in indices[0]:
    results.append(metadata[idx])  # Direct array access using index

# Step 4: Fetch full details from database
transaction_ids = [m['transaction_id'] for m in results]
full_records = db.query(FinanceRecord).filter(
    FinanceRecord.id.in_(transaction_ids)
).all()
```

---

## Key Insights

1. **Positional Correspondence**: The index position in FAISS is the ONLY link between vectors and metadata. No identifiers are stored in the FAISS index itself.

2. **Synchronization Critical**: Both files (faiss.index and metadata.json) must always have the same number of entries at corresponding positions.

3. **No Deletion**: To maintain synchronization, individual record deletion is not implemented. This avoids reindexing complexity.

4. **Atomic Operations**: All add operations must be atomic - either both vector and metadata are added, or neither.

5. **User Isolation**: Each user has separate index and metadata files (user_1/, user_2/, etc.) for data isolation and privacy.

6. **Embedding Model**: The 384-dimension vectors are produced by the `all-MiniLM-L6-v2` Sentence Transformer model, specifically chosen for:
   - Fast encoding (~50ms per sentence)
   - Good semantic understanding
   - Compact representation (384 vs 768+ dimensions)
   - Optimized for semantic similarity tasks

---

## Rendering Instructions

### For Mermaid Live Editor
1. Visit https://mermaid.live
2. Copy each diagram code block separately
3. Paste into the editor
4. Export as PNG or SVG

### For VS Code (with Mermaid extension)
1. Install "Markdown Preview Mermaid Support" extension
2. Open this file in VS Code
3. Use Markdown preview (Ctrl+Shift+V)
4. Right-click diagram → "Export to PNG/SVG"

### For Command Line (mermaid-cli)
```bash
# Install mermaid-cli
npm install -g @mermaid-js/mermaid-cli

# Convert each diagram
mmdc -i diagram1.mmd -o figure_5_2_correspondence.png
mmdc -i diagram2.mmd -o figure_5_2_search_flow.png
mmdc -i diagram3.mmd -o figure_5_2_binary_structure.png
mmdc -i diagram4.mmd -o figure_5_2_update_process.png
mmdc -i diagram5.mmd -o figure_5_2_invariant.png
```

### For LaTeX/Academic Papers
1. Export diagrams as PDF using Mermaid Live
2. Include in LaTeX with:
```latex
\begin{figure}[htbp]
    \centering
    \includegraphics[width=0.9\textwidth]{figure_5_2_correspondence.pdf}
    \caption{FAISS Index Structure: Vector position \textit{i} in the index corresponds to metadata entry \textit{i}, establishing the critical linkage between semantic search results and actual database records. Each metadata entry contains: transaction\_id, user\_id, description, category, amount, and transaction\_date.}
    \label{fig:faiss_structure}
\end{figure}
```

---

## File Structure in Cortana System

```
cortana/
└── data/
    └── personal_context/
        ├── user_1/
        │   ├── faiss.index        # Binary vector index (user 1)
        │   ├── metadata.json      # Metadata array (user 1)
        │   └── documents.pkl      # Document cache (optional)
        ├── user_2/
        │   ├── faiss.index        # Binary vector index (user 2)
        │   ├── metadata.json      # Metadata array (user 2)
        │   └── documents.pkl
        └── user_n/
            ├── faiss.index
            ├── metadata.json
            └── documents.pkl
```

Each user's directory maintains the critical index-metadata correspondence independently.

---

**Figure 5.2: FAISS Index Structure**
*Technical diagram showing binary index file structure with 384-dimension vectors and metadata.json mappings. The positional correspondence (Vector[i] ↔ Entry[i]) is the fundamental mechanism enabling semantic search over financial transactions.*
