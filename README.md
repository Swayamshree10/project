# 🧠 Mind Trail-AI-Powered Engineering Learning Platform

## ✨ Features

| Feature | Description |
|---------|-------------|
| 💬 **AI Chat Tutor** | Ask anything about your subject — powered by NVIDIA NIM (Llama 3.1) |
| 🧠 **Smart Quizzes** | AI-generated MCQs with Bloom's Taxonomy tagging |
| 🃏 **Flashcards** | FSRS-5 spaced repetition algorithm for optimal memory retention |
| 📚 **Engineering Tutor** | Upload PDFs and ask questions about your documents (RAG pipeline) |
| 📓 **Smart Notebook** | Write notes or generate AI study notes on any topic |
| 🗺️ **Learning Roadmap** | AI-generated prerequisite graph showing what to learn first |
| 📊 **Progress Analytics** | Weakness detection, Bloom's taxonomy breakdown, topic performance |
| 🎨 **3 Themes** | Dark, Antigravity (sci-fi), and Light themes |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + Vite
- **Zustand** — state management
- **React Router v7**
- **@xyflow/react** — interactive roadmap graphs

### Backend
- **Node.js** + Express
- **NVIDIA NIM API** — Llama 3.1 8B for all AI features
- **Multer** + **pdfjs-dist** — PDF upload and text extraction
- **JWT** — authentication
- **bcryptjs** — password hashing

### RAG Server (optional)
- **Python** + FastAPI
- **LangChain** + **ChromaDB**
- **OpenAI Embeddings** (text-embedding-3-small)
- **Uvicorn**

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+ (for RAG server)
- NVIDIA NIM API key → [build.nvidia.com](https://build.nvidia.com)

### 1. Clone the repo
```bash
git clone https://github.com/Swayamshree10/project.git
cd project
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create `server/src/.env`:
```env
NVIDIA_API_KEY=your_nvidia_api_key_here
JWT_SECRET=your_random_secret_here
PORT=3001
```

### 4. Run the app
```bash
npm run dev
```

- Frontend → http://localhost:5173
- Backend → http://localhost:3001

### 5. (Optional) Run the RAG server
```bash
cd rag-server
pip install -r requirements.txt
```
Create `rag-server/.env`:
```env
NVIDIA_API_KEY=your_nvidia_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```
```bash
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 📁 Project Structure

```
Mind-Trail/
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── components/     # QuizView, FlashcardsView, RAGView, etc.
│       ├── pages/          # AppShell, Login, Register, Onboarding
│       ├── hooks/          # useChat, useQuiz, useFlashcards, useRAGChat
│       ├── store/          # Zustand stores (useLearnStore, useThemeStore)
│       └── lib/            # FSRS algorithm
├── server/                 # Node.js + Express backend
│   └── src/
│       ├── controllers/    # auth, chat, quiz, flashcards, roadmap, notebook
│       ├── routes/         # API routes
│       └── services/       # NVIDIA NIM service
├── rag-server/             # Python FastAPI RAG server
│   ├── src/                # main.py, rag_pipeline.py
│   └── documents/          # Curriculum documents
└── shared/                 # Shared constants and types
```

---

## 🔑 API Keys Required

| Key | Where to get |
|-----|-------------|
| `NVIDIA_API_KEY` | [build.nvidia.com](https://build.nvidia.com) — Free tier available |
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) — Only for RAG embeddings |

---

## 🎨 Themes

| Theme | Description |
|-------|-------------|
| 🌑 **Dark** | Deep indigo/purple dark theme |
| 🚀 **Antigravity** | Cyan/teal sci-fi space theme with scanlines |
| ☀️ **Light** | Clean white with indigo accents |

---

## 📸 Screenshots

> Login Page · Onboarding · Chat · Quiz · Flashcards · Roadmap · Progress

---



