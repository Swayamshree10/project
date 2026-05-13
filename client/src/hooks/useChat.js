// hooks/useChat.js — manages chat messages and sends them to the backend
import { useState } from 'react'
import api from '../services/api'
import useLearnStore from '../store/useLearnStore'

export function useChat() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { messages, addMessage, branch, subject, level, interests } = useLearnStore()

  async function send(text) {
    const userMsg = { role: 'user', content: text }
    addMessage(userMsg)
    setLoading(true)
    setError(null)

    try {
      const { data } = await api.post('/api/chat', {
        messages: [...messages, userMsg],
        branch,
        subject,
        level,
        interests: interests.join(', '),
      })
      addMessage({ role: 'ai', content: data.reply })
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Unknown error'
      console.error('[useChat error]', msg)
      setError(`Error: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  return { messages, send, loading, error }
}
