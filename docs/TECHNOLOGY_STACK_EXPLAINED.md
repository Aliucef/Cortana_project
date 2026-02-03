# Technology Stack Explained

Quick reference for technologies used in Cortana and why they were chosen.

---

## Core Technologies

### FAISS (Facebook AI Similarity Search)
**What it is**: Vector database for similarity search and clustering of dense vectors.

**How we used it**:
- Stores 384-dimensional embeddings of financial transactions
- Enables semantic search over transaction history
- Each user has their own FAISS index (user_1/faiss.index)
- Powers the RAG (Retrieval-Augmented Generation) system
- Allows natural language queries like "What did I spend on food last week?"
- Uses IndexFlatIP for exact inner product search (cosine similarity)

**Why FAISS**:
- Extremely fast similarity search
- Works offline (no external API calls)
- Lightweight and efficient
- Perfect for small to medium datasets (1K-100K vectors)

---

### Sentence-BERT (all-MiniLM-L6-v2)
**What it is**: Pre-trained transformer model that converts sentences to fixed-size embeddings.

**How we used it**:
- Encodes transaction descriptions into 384-dimensional vectors
- Encodes user queries for semantic search
- Powers the personal context understanding
- Enables finding similar transactions based on meaning, not just keywords

**Example**:
- Query: "restaurant expenses" → matches "dinner at Italian place", "lunch at cafe", etc.
- Traditional keyword search would miss these

**Why this model**:
- Fast inference (~50ms per sentence)
- Good balance between quality and speed
- Compact 384-dim vectors (vs 768+ for larger models)
- Optimized for semantic similarity tasks

---

### SQLAlchemy ORM
**What it is**: Python Object-Relational Mapping library for database operations.

**How we used it**:
- Defines database models (User, FinanceRecord, WorkoutPlan, etc.)
- Handles all PostgreSQL database operations
- Provides type-safe queries and relationships
- Manages database sessions and connections

**Example**:
```python
# Instead of raw SQL
user = db.query(User).filter(User.id == user_id).first()

# Relationships
user.finance_records  # Auto-loaded related records
```

**Why SQLAlchemy**:
- Python-native database abstraction
- Type-safe and prevents SQL injection
- Automatic relationship handling
- Works seamlessly with FastAPI
- Alembic integration for migrations

---

### Zustand
**What it is**: Lightweight state management library for React.

**How we used it**:
- Manages global state in React dashboard
- Stores user authentication state
- Caches API responses
- Handles loading/error states

**Example**:
```typescript
const useAuthStore = create((set) => ({
  user: null,
  login: (userData) => set({ user: userData }),
  logout: () => set({ user: null }),
}))
```

**Why Zustand**:
- Simpler than Redux (less boilerplate)
- TypeScript-friendly
- No context providers needed
- Small bundle size (~1KB)
- Perfect for small to medium apps

---

### Recharts
**What it is**: React charting library built on D3.

**How we used it**:
- Financial analytics charts (spending over time)
- Category breakdown pie charts
- Budget progress bars
- Health progress graphs

**Why Recharts**:
- React-native (declarative components)
- Responsive out of the box
- Good TypeScript support
- Easy to customize
- No need to learn D3 directly

---

### Vite
**What it is**: Next-generation frontend build tool.

**How we used it**:
- Powers the React dashboard build process
- Development server with hot module replacement (HMR)
- Production optimization and bundling

**Why Vite**:
- Extremely fast development server
- Instant HMR (faster than Webpack)
- Native ES modules support
- Optimized production builds
- Better developer experience

---

### APScheduler
**What it is**: Advanced Python scheduling library for background tasks.

**How we used it**:
- Daily financial summaries (runs at midnight)
- Recurring expense processing
- Proactive notification generation
- News aggregation jobs
- Daily data consolidation

**Example**:
```python
scheduler.add_job(
    func=process_recurring_expenses,
    trigger='cron',
    hour=0,
    minute=0
)
```

**Why APScheduler**:
- Python-native scheduling
- Cron-like syntax
- Persistent job store support
- Works with FastAPI
- No external dependencies (like Celery + Redis)

---

### JWT Authentication
**What it is**: JSON Web Tokens for stateless authentication.

**How we used it**:
- User login returns JWT token
- Token stored in client (localStorage/secure storage)
- Sent with every API request in Authorization header
- Backend validates token and extracts user_id

**Token structure**:
```
Header.Payload.Signature
{user_id: 42, exp: timestamp}
```

**Why JWT**:
- Stateless (no server-side session storage)
- Scalable (no session database needed)
- Cross-platform (works on web, mobile)
- Secure when properly implemented
- Industry standard

---

### bcrypt
**What it is**: Password hashing algorithm designed for security.

**How we used it**:
- Hash passwords before storing in database
- Verify passwords during login
- Used via passlib's CryptContext

**Example**:
```python
# Register
hashed = pwd_context.hash(plain_password)

# Login
pwd_context.verify(plain_password, hashed)
```

**Why bcrypt**:
- Designed to be slow (prevents brute force)
- Adaptive cost factor (can increase as hardware improves)
- Salt automatically included
- Industry standard for password hashing
- Better than MD5, SHA1, SHA256 for passwords

---

## Technology Choices - The "Why"

### Why FastAPI?

**Chosen over**: Django, Flask, Express.js

**Reasons**:
1. **Performance**: Async/await support, one of the fastest Python frameworks
2. **Type Safety**: Built-in Pydantic validation catches bugs early
3. **Auto Documentation**: Swagger UI generated automatically
4. **Modern Python**: Uses Python 3.10+ features (type hints)
5. **WebSocket Support**: Real-time features for chat
6. **Easy Integration**: Works great with AI/ML libraries
7. **Developer Experience**: Less boilerplate than Django

**Perfect for**:
- AI/ML backend services
- Real-time applications
- APIs that need strict validation
- Projects requiring high performance

---

### Why React and TypeScript?

**Chosen over**: Vue, Angular, plain JavaScript

**Reasons**:

**React**:
1. **Component-Based**: Reusable UI components
2. **Large Ecosystem**: Tons of libraries and tools
3. **Virtual DOM**: Efficient updates
4. **Industry Standard**: Most jobs, most resources
5. **Flexibility**: Can integrate with any backend
6. **Great Developer Tools**: React DevTools, hot reload

**TypeScript**:
1. **Type Safety**: Catches errors at compile time
2. **Better IDE Support**: Autocomplete, refactoring
3. **Self-Documenting**: Types serve as inline documentation
4. **Scales Better**: Large codebases are more maintainable
5. **Prevents Runtime Errors**: Many bugs caught before deployment
6. **Industry Trend**: Most modern React projects use TypeScript

**Why not alternatives**:
- Vue: Smaller ecosystem, less job demand
- Angular: Too heavy, steeper learning curve
- Plain JS: No type safety, harder to maintain

---

### Why Flutter?

**Chosen over**: React Native, Native iOS/Android, Ionic

**Reasons**:
1. **Single Codebase**: iOS and Android from one codebase
2. **Native Performance**: Compiles to native ARM code
3. **Beautiful UI**: Material Design and Cupertino widgets out of the box
4. **Hot Reload**: See changes instantly
5. **Growing Ecosystem**: Strong community and packages
6. **Backed by Google**: Long-term support guaranteed
7. **Less Bridge Overhead**: No JavaScript bridge like React Native

**Dart Language Benefits**:
- Easy to learn (familiar syntax)
- Strongly typed (catches errors)
- Async/await built-in
- Fast compilation

**Why not alternatives**:
- React Native: JavaScript bridge overhead, platform-specific bugs
- Native: Would need to write iOS (Swift) and Android (Kotlin) separately
- Ionic: Web view performance issues, not truly native feel

**Perfect for**:
- Startups needing fast MVP
- Teams wanting cross-platform with native feel
- Apps requiring good performance
- Projects with limited mobile developers

---

## Technology Stack Summary

### Backend (Python + FastAPI)
- **FastAPI**: API framework
- **SQLAlchemy**: Database ORM
- **PostgreSQL**: Relational database
- **FAISS**: Vector database
- **Sentence-BERT**: Text embeddings
- **APScheduler**: Background tasks
- **bcrypt**: Password hashing
- **JWT**: Authentication

### Frontend Web (React + TypeScript)
- **React**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Zustand**: State management
- **Recharts**: Data visualization
- **Tailwind CSS**: Styling

### Mobile (Flutter + Dart)
- **Flutter**: Cross-platform framework
- **Dart**: Programming language
- **Provider**: State management
- **go_router**: Navigation

### AI/ML
- **Groq API**: LLM inference (Llama 3.1)
- **Sentence Transformers**: Embeddings
- **FAISS**: Vector search
- **Whisper**: Speech-to-text

### Infrastructure
- **PostgreSQL**: Primary database
- **FAISS**: Vector database (file-based)
- **JWT**: Stateless auth
- **CORS**: Cross-origin support

---

## Design Philosophy

### Keep It Simple
- Use proven technologies
- Avoid over-engineering
- Choose tools that work well together

### Developer Experience
- Fast development cycles
- Good tooling and debugging
- Clear error messages
- Type safety where possible

### Performance
- Async/await for I/O operations
- Efficient vector search with FAISS
- Optimized builds with Vite
- Native mobile performance with Flutter

### Scalability
- Stateless authentication (JWT)
- Horizontal scaling ready
- Separate services (backend, web, mobile)
- Per-user data isolation

---

**Last Updated**: February 2026
