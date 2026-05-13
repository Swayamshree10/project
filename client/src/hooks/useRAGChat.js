// hooks/useRAGChat.js — sends questions to RAG backend, falls back to NVIDIA NIM
import { useState } from 'react'
import api from '../services/api'
import useLearnStore from '../store/useLearnStore'

export function useRAGChat() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { branch, subject, level } = useLearnStore()

  async function ask(question) {
    const userMsg = { role: 'user', content: question }
    setMessages((m) => [...m, userMsg])
    setLoading(true)
    setError(null)

    // Try RAG server first (port 8000)
    try {
      const res = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
        signal: AbortSignal.timeout(4000),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages((m) => [...m, { role: 'ai', content: data.answer, sources: data.sources }])
        setLoading(false)
        return
      }
    } catch { /* fall through */ }

    // Fallback: Node.js /api/rag/query (uses uploaded docs + NVIDIA NIM)
    try {
      const { data } = await api.post('/api/rag/query', { question })
      setMessages((m) => [...m, { role: 'ai', content: data.answer, sources: data.sources || [] }])
    } catch {
      setError('Could not get a response. Make sure the server is running.')
    } finally {
      setLoading(false)
    }
  }

  function clear() { setMessages([]); setError(null) }

  return { messages, loading, error, ask, clear }
}
