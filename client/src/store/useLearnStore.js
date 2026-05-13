// store/useLearnStore.js — global Zustand store
import { create } from 'zustand'

const useLearnStore = create((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  logout: () => set({ user: null, token: null, branch: null, subject: null, level: null, interests: [], messages: [], quizHistory: [], flashcards: [], topicStats: {} }),

  branch: null,
  subject: null,
  level: null,
  interests: [],
  messages: [],
  quizHistory: [],
  flashcards: [],

  // weakness: { [topic]: { correct, total, againCount, hardCount } }
  topicStats: {},

  setBranch: (branch) => set({ branch }),
  setSubject: (subject) => set({ subject }),
  setLevel: (level) => set({ level }),
  setInterests: (interests) => set({ interests }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),

  // Quiz result: { subject, score, total, date, questions: [{topic, bloom, correct}] }
  addQuizResult: (result) => set((s) => {
    const stats = { ...s.topicStats }
    ;(result.questions || []).forEach(({ topic, correct }) => {
      if (!topic) return
      const t = stats[topic] || { correct: 0, total: 0, againCount: 0, hardCount: 0 }
      stats[topic] = { ...t, correct: t.correct + (correct ? 1 : 0), total: t.total + 1 }
    })
    return { quizHistory: [...s.quizHistory, result], topicStats: stats }
  }),

  // Flashcard rating: track Again/Hard per topic
  recordFlashcardRating: (topic, rating) => set((s) => {
    if (!topic) return {}
    const stats = { ...s.topicStats }
    const t = stats[topic] || { correct: 0, total: 0, againCount: 0, hardCount: 0 }
    stats[topic] = {
      ...t,
      total: t.total + 1,
      correct: rating >= 3 ? t.correct + 1 : t.correct,
      againCount: rating === 1 ? t.againCount + 1 : t.againCount,
      hardCount: rating === 2 ? t.hardCount + 1 : t.hardCount,
    }
    return { topicStats: stats }
  }),

  setFlashcards: (flashcards) => set({ flashcards }),
  updateFlashcard: (updated) => set((s) => ({
    flashcards: s.flashcards.map((c) => c.id === updated.id ? updated : c),
  })),
  addFlashcard: (card) => set((s) => ({ flashcards: [...s.flashcards, card] })),
  deleteFlashcard: (id) => set((s) => ({ flashcards: s.flashcards.filter((c) => c.id !== id) })),
}))

export default useLearnStore
