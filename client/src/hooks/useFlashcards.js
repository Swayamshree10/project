// hooks/useFlashcards.js — manages flashcard generation, review sessions using FSRS
import { useState } from 'react'
import api from '../services/api'
import useLearnStore from '../store/useLearnStore'
import { schedule, getDueCards, newCard } from '../lib/fsrs'

export function useFlashcards() {
  const { branch, subject, level, flashcards, setFlashcards, updateFlashcard, addFlashcard, deleteFlashcard, recordFlashcardRating } = useLearnStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [reviewQueue, setReviewQueue] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [sessionDone, setSessionDone] = useState(false)

  // Generate new flashcards from AI
  async function generate() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/api/flashcards/generate', { branch, subject, level })
      const cards = data.flashcards.map((f, i) =>
        newCard(f.front, f.back, `${Date.now()}-${i}`)
      )
      setFlashcards([...flashcards, ...cards])
    } catch {
      setError('Failed to generate flashcards.')
    } finally {
      setLoading(false)
    }
  }

  // Start a review session with due cards
  function startReview() {
    const due = getDueCards(flashcards)
    if (due.length === 0) return
    setReviewQueue(due)
    setCurrentIndex(0)
    setFlipped(false)
    setSessionDone(false)
  }

  // Rate current card and advance
  function rate(rating) {
    const card = reviewQueue[currentIndex]
    const updated = schedule(card, rating)
    updateFlashcard(updated)
    recordFlashcardRating(card.topic || card.front?.split(' ').slice(0, 3).join(' '), rating)

    const next = currentIndex + 1
    if (next >= reviewQueue.length) {
      setSessionDone(true)
    } else {
      setCurrentIndex(next)
      setFlipped(false)
    }
  }

  function flip() { setFlipped((f) => !f) }

  const dueCount = getDueCards(flashcards).length
  const currentCard = reviewQueue[currentIndex] || null

  return {
    flashcards, loading, error,
    generate, addFlashcard, deleteFlashcard,
    reviewQueue, currentCard, currentIndex,
    flipped, flip, rate,
    sessionDone, startReview, dueCount,
  }
}
