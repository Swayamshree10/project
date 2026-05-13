// hooks/useQuiz.js — manages quiz generation, answer tracking, and submission
import { useState } from 'react'
import api from '../services/api'
import useLearnStore from '../store/useLearnStore'

export function useQuiz() {
  const { branch, subject, level, interests, addQuizResult } = useLearnStore()
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function generate() {
    setLoading(true)
    setError(null)
    setQuestions([])
    setAnswers({})
    setResult(null)
    try {
      const { data } = await api.post('/api/quiz/generate', {
        branch, subject, level, interests: interests.join(', '),
      })
      setQuestions(data.questions)
    } catch {
      setError('Failed to generate quiz. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function choose(questionId, option) {
    // Extract just the letter e.g. "A" from "A) option text"
    const letter = option.charAt(0)
    setAnswers((a) => ({ ...a, [questionId]: letter }))
  }

  async function submit() {
    setLoading(true)
    try {
      const { data } = await api.post('/api/quiz/submit', { questions, answers })
      setResult(data)
      addQuizResult({
        subject,
        score: data.score,
        total: data.total,
        date: new Date().toISOString(),
        questions: data.results.map((r) => ({ topic: r.topic, bloom: r.bloom, correct: r.correct })),
      })
    } catch {
      setError('Failed to submit quiz.')
    } finally {
      setLoading(false)
    }
  }

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id] !== undefined)

  return { questions, answers, result, loading, error, generate, choose, submit, allAnswered }
}
