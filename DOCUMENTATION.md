# LearnAI — Project Documentation

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Architecture](#4-architecture)
5. [Frontend](#5-frontend)
6. [Node/Express Backend](#6-nodeexpress-backend)
7. [Python RAG Backend](#7-python-rag-backend)
8. [AI & Algorithms](#8-ai--algorithms)
9. [Environment Variables](#9-environment-variables)
10. [How to Run](#10-how-to-run)
11. [API Reference](#11-api-reference)
12. [What's Not Built Yet](#12-whats-not-built-yet)

---

## 1. Project Overview

LearnAI is a full-stack AI-powered engineering learning companion. It helps engineering students learn through:

- **AI Chat** — personalized tutoring powered by NVIDIA NIM (Qwen 3.5)
- **AI Quiz** — auto-generated MCQs with Bloom's Taxonomy tagging
- **Flashcards** — spaced repetition using the FSRS-5 algorithm
- **Engineering Tutor** — RAG-based Q&A grounded in uploaded curriculum documents
- **Progress Analytics** — weakness detection, prerequisite graph, Bloom's taxonomy tracking

---

## 2. Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.2.0 | UI framework |
| Vite | 5.1.4 | Build tool and dev server |
| React Router | 6.22.0 | Client-side routing |
| Zustand | 4.5.2 | Global state management |
| Axios | 1.6.7 | HTTP client |
| @xyflow/react | 12.3.6 | Interactive prerequisite graph |

### Node/Express Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 24.x | Runtime |
| Express | 4.18.3 | HTTP server |
| OpenAI SDK | 4.47.1 | NVIDIA NIM API (OpenAI-compatible) |
| dotenv | 16.4.5 | Environment variables |
| cors | 2.8.5 | Cross-origin requests |
| nodemon | 3.1.0 | Dev auto-restart |

### Python RAG Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.13 | Runtime |
| FastAPI | latest | HTTP server |
| uvicorn | latest | ASGI server |
| LangChain | latest | RAG orchestration |
| langchain-openai | latest | OpenAI embeddings + LLM |
| langchain-chroma | latest | ChromaDB integration |
| ChromaDB | latest | Local vector database |
| pypdf | latest | PDF document loading |
| python-docx | 1.1.2 | Word document loading |
| python-multipart | 0.0.9 | File upload handling |
| tiktoken | latest | Token counting |

### AI Models
| Model | Provider | Used For |
|---|---|---|
| qwen/qwen3.5-122b-a10b | NVIDIA NIM | Chat, Quiz, Flashcard generation, Roadmap |
| text-embedding-3-small | OpenAI | Document embeddings for RAG |

---

## 3. Folder Structure

```
learnai/
├── client/                          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── FlashcardsView.jsx   # Flashcard deck + review UI
│   │   │   ├── ProgressView.jsx     # Weakness, graph, Bloom's UI
│   │   │   ├── QuizView.jsx         # Quiz generation + submission UI
│   │   │   └── RAGView.jsx          # Eng. Tutor chat + file upload UI
│   │   ├── hooks/
│   │   │   ├── useChat.js           # Chat state + API calls
│   │   │   ├── useFlashcards.js     # Flashcard state + FSRS integration
│   │   │   ├── useQuiz.js           # Quiz state + API calls
│   │   │   └── useRAGChat.js        # RAG chat state + API calls
│   │   ├── lib/
│   │   │   └── fsrs.js              # FSRS-5 spaced repetition algorithm
│   │   ├── pages/
│   │   │   ├── AppShell.jsx         # Main app layout + tab navigation
│   │   │   └── Onboarding.jsx       # 4-step onboarding wizard
│   │   ├── services/
│   │   │   └── api.js               # Axios instance for Node backend
│   │   ├── store/
│   │   │   └── useLearnStore.js     # Zustand global store
│   │   ├── types/
│   │   │   └── index.js             # Type placeholders
│   │   ├── App.jsx                  # React Router routes
│   │   ├── index.css                # Global styles + typing animation
│   │   └── main.jsx                 # React entry point
│   ├── .env.local                   # VITE_API_URL
│   ├── index.html                   # Vite HTML entry
│   ├── package.json
│   └── vite.config.js               # Vite config + /api proxy
│
├── server/                          # Node.js + Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── cors.js              # CORS config
│   │   │   ├── db.js                # DB placeholder
│   │   │   └── env.js               # Env exports
│   │   ├── controllers/
│   │   │   ├── chatController.js    # Chat logic
│   │   │   ├── flashcardsController.js  # Flashcard generation
│   │   │   ├── quizController.js    # Quiz generation + grading
│   │   │   └── roadmapController.js # Prerequisite graph generation
│   │   ├── middleware/
│   │   │   ├── auth.js              # Auth guard (empty)
│   │   │   ├── errorHandler.js      # Global error handler
│   │   │   └── rateLimiter.js       # Rate limiter (empty)
│   │   ├── models/
│   │   │   ├── Flashcard.js         # Prisma placeholder
│   │   │   ├── Progress.js          # Prisma placeholder
│   │   │   ├── Quiz.js              # Prisma placeholder
│   │   │   └── User.js              # Prisma placeholder
│   │   ├── routes/
│   │   │   ├── auth.js              # Auth routes (empty)
│   │   │   ├── chat.js              # POST /api/chat
│   │   │   ├── flashcards.js        # POST /api/flashcards/generate
│   │   │   ├── quiz.js              # POST /api/quiz/generate, /submit
│   │   │   └── roadmap.js           # POST /api/roadmap/graph
│   │   ├── services/
│   │   │   └── claudeService.js     # NVIDIA NIM wrapper (callClaude)
│   │   ├── .env                     # NVIDIA_API_KEY, PORT
│   │   └── app.js                   # Express app setup
│   ├── package.json
│   └── server.js                    # Entry point
│
├── rag-server/                      # Python FastAPI RAG backend
│   ├── documents/                   # Curriculum documents
│   │   ├── physics/                 # physics_curriculum.txt
│   │   ├── os/                      # os_curriculum.txt
│   │   ├── dbms/                    # dbms_curriculum.txt
│   │   ├── programming/             # dsa_curriculum.txt
│   │   ├── networks/                # networks_curriculum.txt
│   │   ├── electronics/             # electronics_curriculum.txt
│   │   ├── mathematics/             # (empty — add textbooks)
│   │   ├── chemistry/               # (empty — add textbooks)
│   │   └── software_engineering/    # (empty — add textbooks)
│   ├── chroma_db/                   # ChromaDB vector store (auto-created)
│   │   └── chroma.sqlite3
│   ├── scripts/
│   │   └── ingest.py                # Document ingestion script
│   ├── src/
│   │   ├── main.py                  # FastAPI app
│   │   └── rag_pipeline.py          # LangChain RAG chain
│   ├── .env                         # NVIDIA_API_KEY, OPENAI_API_KEY
│   ├── .env.example
│   └── requirements.txt
│
├── shared/                          # Shared constants and types
│   ├── constants.js                 # BRANCHES, LEVELS, SUBJECTS
│   ├── types.js                     # Type placeholders
│   └── package.json
│
├── .gitignore
├── package-lock.json
└── package.json                     # Root workspace + concurrently
```

---

## 4. Architecture

```
Browser (localhost:5173)
        │
        ├── /api/*  ──────────────────► Node/Express (localhost:3001)
        │                                      │
        │   /api/chat                           ├── claudeService.js
        │   /api/quiz/generate                  │       │
        │   /api/quiz/submit                    │       └── NVIDIA NIM API
        │   /api/flashcards/generate            │           (qwen3.5-122b)
        │   /api/roadmap/graph                  │
        │                                       └── Returns JSON response
        │
        └── http://localhost:8000 ───► FastAPI (localhost:8000)
                                               │
            /query                             ├── rag_pipeline.py
            /upload                            │       │
            /health                            │       ├── OpenAI Embeddings
                                               │       │   (text-embedding-3-small)
                                               │       │
                                               │       ├── ChromaDB (local)
                                               │       │   similarity search k=4
                                               │       │
                                               │       └── NVIDIA NIM
                                               │           (qwen3.5-122b)
                                               │
                                               └── Returns answer + sources
```

---

## 5. Frontend

### Pages

#### Onboarding (`/`)
A 4-step wizard that collects the student's profile:
- **Step 1** — Engineering branch (Computer Science, Electrical, Electronics, Mechanical, Civil, Chemical)
- **Step 2** — Subject (filtered by branch)
- **Step 3** — Level (Beginner, Intermediate, Advanced)
- **Step 4** — Interests (free-text tags, press Enter to add)

On completion, saves to Zustand store and navigates to `/app`.

#### AppShell (`/app`)
Main application layout with:
- **Sidebar** — logo, profile display, tab navigation, Change Profile button
- **Tab navigation** — Chat, Quiz, Eng. Tutor, Flashcards, Progress
- Redirects to `/` if no profile is set in store

### Components

#### ChatView (inside AppShell)
- Message bubbles (user right in purple, AI left in white)
- Typing indicator animation (CSS bouncing dots)
- Suggested starter questions based on subject
- Enter to send, Shift+Enter for new line
- Auto-scroll to latest message
- Empty state with clickable suggestions

#### QuizView
- Generate 5 MCQs button
- Questions with 4 options each (A/B/C/D)
- Selected answer highlighted in purple
- Submit button activates only when all 5 answered
- Results screen: score card, per-question review, explanations
- Each question tagged with Bloom's level and topic
- Try Another Quiz button

#### FlashcardsView
- **Deck view** — grid of all cards showing due status and rep count
- **AI Generate** — generates 10 cards for current subject/level
- **Add Manually** — custom front/back input
- **Review session** — flip card, rate 1-4, FSRS schedules next review
- Progress bar during review
- Session complete screen

#### RAGView
- **Chat tab** — ask questions grounded in uploaded documents
  - Shows source file and snippet for every answer
  - Suggested engineering questions
- **Upload tab** — drag & drop file upload
  - Supports PDF, TXT, DOCX
  - Subject folder selector
  - Upload multiple files at once
  - Shows chunks indexed per file

#### ProgressView
Three sub-tabs:

**Weakness Detection**
- Pulls data from quiz history AND flashcard ratings
- Groups topics into Weak / Average / Strong
- Color-coded accuracy bars per topic
- Summary stats: quizzes taken, avg score, weak topics, flashcards due

**Prerequisite Graph**
- AI generates 8-12 topic nodes with prerequisite edges
- Interactive — drag, zoom, pan (react-flow / @xyflow/react)
- Weak topics highlighted in red
- Each node shows Bloom's level + difficulty badge
- Color-coded by Bloom's level with legend
- MiniMap for navigation

**Bloom's Taxonomy**
- 6 cards for each cognitive level (Remember → Create)
- Accuracy bar per level
- Summary bar chart across all levels
- "Not tested yet" for untouched levels

### Hooks

#### useChat
- Manages messages array in Zustand
- Sends to `POST /api/chat` with branch, subject, level, interests
- Handles loading and error states

#### useQuiz
- Manages questions, answers, results
- Sends to `POST /api/quiz/generate` and `POST /api/quiz/submit`
- On submit, saves topic+bloom+correct data to Zustand for analytics

#### useFlashcards
- Manages flashcard deck and review queue
- Calls `POST /api/flashcards/generate`
- Integrates FSRS algorithm for scheduling
- Records flashcard ratings to Zustand topic stats

#### useRAGChat
- Separate axios instance pointing to `http://localhost:8000`
- Sends to `POST /query`
- Stores messages with sources array

### State Management (Zustand — useLearnStore)

```javascript
{
  // Profile
  branch, subject, level, interests,

  // Chat
  messages,

  // Quiz
  quizHistory,           // [{ subject, score, total, date, questions: [{topic, bloom, correct}] }]

  // Flashcards
  flashcards,            // FSRS card objects

  // Analytics
  topicStats,            // { [topic]: { correct, total, againCount, hardCount } }
}
```

### FSRS-5 Algorithm (`lib/fsrs.js`)

Full implementation of the FSRS-5 spaced repetition algorithm:

- **4 ratings**: Again (1), Hard (2), Good (3), Easy (4)
- **Stability** — how long memory persists
- **Difficulty** — how hard the card is (0–1)
- **Retrievability** — probability of recall at review time
- **Interval** — days until next review (targets 90% retention)
- **Lapses** — count of Again ratings

Key functions:
- `schedule(card, rating)` — returns updated card with new interval/dueDate
- `getDueCards(cards)` — returns cards due for review today
- `newCard(front, back, id)` — creates a blank new card

---

## 6. Node/Express Backend

**Port:** 3001  
**Entry:** `server/server.js`  
**App setup:** `server/src/app.js`

### Middleware
- `cors` — allows `http://localhost:5173`
- `express.json()` — parses JSON bodies
- `errorHandler.js` — global error handler

### claudeService.js
Wrapper around NVIDIA NIM using the OpenAI-compatible SDK:

```javascript
callClaude(messages, systemPrompt, maxTokens)
```

- Model: `qwen/qwen3.5-122b-a10b`
- Base URL: `https://integrate.api.nvidia.com/v1`
- Temperature: 0.2
- Converts `ai` role to `assistant` for OpenAI format

### Routes & Controllers

#### POST /api/chat
- Builds personalized system prompt from student profile
- Calls `callClaude` with message history
- Returns `{ reply: string }`

#### POST /api/quiz/generate
- Generates 5 MCQs with Bloom's taxonomy + topic tags
- Supports optional `bloomLevel` filter
- Strips markdown fences from AI response
- Returns `{ questions: [...] }`

Each question:
```json
{
  "id": 1,
  "topic": "Binary Search Trees",
  "bloom": "Understand",
  "question": "...",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "answer": "A",
  "explanation": "..."
}
```

#### POST /api/quiz/submit
- Grades submitted answers against correct answers
- Returns `{ score, total, results: [{id, topic, bloom, correct, chosen, answer, explanation}] }`

#### POST /api/flashcards/generate
- Generates 10 flashcards for subject/level
- Returns `{ flashcards: [{front, back}] }`

#### POST /api/roadmap/graph
- Generates prerequisite topic graph
- Accepts `weakTopics` array to highlight in UI
- Returns `{ nodes: [...], edges: [...] }`

Each node:
```json
{
  "id": "topic_id",
  "label": "Topic Name",
  "bloom": "Apply",
  "difficulty": "medium"
}
```

#### GET /health
Returns `{ status: "ok" }`

---

## 7. Python RAG Backend

**Port:** 8000  
**Entry:** `rag-server/src/main.py`  
**Run from:** `rag-server/src/` directory

### rag_pipeline.py

**Embeddings:** OpenAI `text-embedding-3-small`  
**LLM:** NVIDIA NIM `qwen/qwen3.5-122b-a10b`  
**Vector store:** ChromaDB (local, persisted to `rag-server/chroma_db/`)  
**Collection:** `learnai_engineering`  
**Retrieval:** Top-4 similarity search

RAG chain (LangChain LCEL):
```
question → retriever (k=4) → format_docs → prompt → LLM → StrOutputParser
```

System prompt instructs the model to:
- Answer only from retrieved context
- Say "I don't have that topic" if not found
- Include formulas, definitions, and examples

### main.py Endpoints

#### GET /health
Returns `{ status: "ok" }`

#### POST /query
```json
{ "question": "What is Newton's Second Law?" }
```
Returns:
```json
{
  "answer": "...",
  "sources": [{ "source": "filename.txt", "snippet": "..." }],
  "retrieval_debug": { "chunks_retrieved": 4 }
}
```

#### POST /upload
- Accepts multipart form with `file` and `subject` fields
- Supports `.pdf`, `.txt`, `.docx`
- Splits into 1000-char chunks (200 overlap)
- Embeds and adds to ChromaDB immediately
- Returns `{ message, chunks, subject }`

### ingest.py
One-time script to bulk-load all documents:
```cmd
cd rag-server
python scripts/ingest.py
```
- Scans all `.txt`, `.pdf`, `.docx` in `rag-server/documents/`
- Splits, embeds, stores in ChromaDB
- Runs smoke test query at the end

### Pre-loaded Curriculum Documents

| Subject | File | Topics Covered |
|---|---|---|
| Physics | physics_curriculum.txt | Newton's Laws, Thermodynamics, Electromagnetism, Waves |
| OS | os_curriculum.txt | Deadlocks, Memory Management, CPU Scheduling |
| DBMS | dbms_curriculum.txt | Normalization, SQL, ACID, Transactions |
| DSA | dsa_curriculum.txt | Big O, Sorting, Data Structures, Dynamic Programming |
| Networks | networks_curriculum.txt | OSI Model, TCP/UDP, IP, HTTP/DNS, Routing |
| Electronics | electronics_curriculum.txt | Circuit Theory, Digital Logic, Semiconductors |

Empty folders (add your own textbooks):
- `mathematics/`, `chemistry/`, `software_engineering/`

---

## 8. AI & Algorithms

### NVIDIA NIM Integration
Both backends use NVIDIA NIM's OpenAI-compatible API:
- **Endpoint:** `https://integrate.api.nvidia.com/v1`
- **Model:** `qwen/qwen3.5-122b-a10b`
- **Node SDK:** `openai` npm package with custom `baseURL`
- **Python SDK:** `langchain-openai` `ChatOpenAI` with custom `base_url`

### FSRS-5 Spaced Repetition
Implementation in `client/src/lib/fsrs.js`:

| Rating | Label | Next Interval |
|---|---|---|
| 1 | Again | < 1 day (reset) |
| 2 | Hard | ~1 day |
| 3 | Good | ~3 days |
| 4 | Easy | ~9 days |

Intervals grow exponentially based on stability. Target retrievability: **90%**.

### Bloom's Taxonomy Integration
All quiz questions are tagged by AI with one of 6 cognitive levels:

| Level | Description |
|---|---|
| Remember | Recall facts and basic concepts |
| Understand | Explain ideas or concepts |
| Apply | Use information in new situations |
| Analyze | Draw connections among ideas |
| Evaluate | Justify a decision or course of action |
| Create | Produce new or original work |

### Weakness Detection Algorithm
For each topic, tracks:
- `correct` — number of correct answers
- `total` — total attempts
- `againCount` — flashcard Again ratings
- `hardCount` — flashcard Hard ratings

Classification:
- **Strong** — accuracy ≥ 80%
- **Average** — accuracy 50–79%
- **Weak** — accuracy < 50%

---

## 9. Environment Variables

### server/src/.env
```
NVIDIA_API_KEY=nvapi-your_key_here
PORT=3001
```

### rag-server/.env
```
NVIDIA_API_KEY=nvapi-your_key_here
OPENAI_API_KEY=sk-your_openai_key_here
```

### client/.env.local
```
VITE_API_URL=http://localhost:3001
```

> ⚠️ Never commit `.env` files. They are listed in `.gitignore`.

---

## 10. How to Run

### Prerequisites
- Node.js 18+
- Python 3.13
- npm
- pip

### Step 1 — Install Node dependencies
```cmd
cd c:\Users\DELL\learnai
npm install
```

### Step 2 — Install Python dependencies
```cmd
cd c:\Users\DELL\learnai\rag-server
pip install -r requirements.txt
pip install langchain-chroma
```

### Step 3 — Set environment variables
- Add NVIDIA API key to `server/src/.env`
- Add NVIDIA + OpenAI API keys to `rag-server/.env`

### Step 4 — Ingest documents into ChromaDB
```cmd
cd c:\Users\DELL\learnai\rag-server
python scripts/ingest.py
```

### Step 5 — Start Node server + React frontend
```cmd
cd c:\Users\DELL\learnai
npm run dev
```
- Frontend: http://localhost:5173
- Node API: http://localhost:3001

### Step 6 — Start RAG server (separate terminal)
```cmd
cd c:\Users\DELL\learnai\rag-server\src
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Step 7 — Verify all servers
```cmd
curl http://localhost:3001/health   # { "status": "ok" }
curl http://localhost:8000/health   # { "status": "ok" }
```

### Adding More Documents
Drop `.pdf`, `.txt`, or `.docx` files into any subject folder under `rag-server/documents/`, then re-run:
```cmd
python scripts/ingest.py
```
Or use the **📤 Upload** tab in the Eng. Tutor UI to upload directly from the browser.

---

## 11. API Reference

### Node/Express (port 3001)

| Method | Endpoint | Body | Response |
|---|---|---|---|
| GET | /health | — | `{ status }` |
| POST | /api/chat | `{ messages, branch, subject, level, interests }` | `{ reply }` |
| POST | /api/quiz/generate | `{ branch, subject, level, interests, bloomLevel? }` | `{ questions }` |
| POST | /api/quiz/submit | `{ questions, answers }` | `{ score, total, results }` |
| POST | /api/flashcards/generate | `{ branch, subject, level }` | `{ flashcards }` |
| POST | /api/roadmap/graph | `{ branch, subject, level, weakTopics }` | `{ nodes, edges }` |

### FastAPI RAG (port 8000)

| Method | Endpoint | Body | Response |
|---|---|---|---|
| GET | /health | — | `{ status }` |
| POST | /query | `{ question }` | `{ answer, sources, retrieval_debug }` |
| POST | /upload | `multipart: file, subject` | `{ message, chunks, subject }` |

---


