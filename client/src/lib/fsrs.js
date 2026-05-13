// lib/fsrs.js — FSRS-5 spaced repetition algorithm
// Ratings: 1=Again, 2=Hard, 3=Good, 4=Easy

const DECAY = -0.5
const FACTOR = 0.9 ** (1 / DECAY) - 1

// Default stability values per rating for new cards
const INIT_STABILITY = { 1: 0.4, 2: 1.0, 3: 2.9, 4: 9.0 }
const INIT_DIFFICULTY = { 1: 0.7, 2: 0.5, 3: 0.3, 4: 0.1 }

// Retrievability given stability and elapsed days
function retrievability(stability, elapsedDays) {
  return (1 + FACTOR * (elapsedDays / stability)) ** DECAY
}

// Next interval in days targeting 90% retrievability
function nextInterval(stability) {
  return Math.max(1, Math.round((stability / FACTOR) * (0.9 ** (1 / DECAY) - 1)))
}

// Update stability after a review
function nextStability(stability, difficulty, r, rating) {
  if (rating === 1) {
    // Lapse — reset
    return Math.max(0.4, stability * 0.2)
  }
  const hardPenalty = rating === 2 ? 0.8 : 1
  const easyBonus = rating === 4 ? 1.3 : 1
  return stability * (
    Math.exp(0.9) *
    (11 - difficulty) *
    (stability ** -0.228) *
    (Math.exp((1 - r) * 1.05) - 1) *
    hardPenalty *
    easyBonus
  )
}

// Update difficulty after a review (0–1 scale)
function nextDifficulty(difficulty, rating) {
  const delta = rating === 1 ? 0.2 : rating === 2 ? 0.1 : rating === 3 ? 0 : -0.1
  return Math.min(1, Math.max(0, difficulty + delta))
}

// Main schedule function — takes a card and rating, returns updated card
export function schedule(card, rating) {
  const now = Date.now()
  const isNew = !card.stability

  let stability, difficulty

  if (isNew) {
    stability = INIT_STABILITY[rating]
    difficulty = INIT_DIFFICULTY[rating]
  } else {
    const elapsedDays = (now - card.lastReview) / 86400000
    const r = retrievability(card.stability, elapsedDays)
    stability = nextStability(card.stability, card.difficulty, r, rating)
    difficulty = nextDifficulty(card.difficulty, rating)
  }

  const interval = nextInterval(stability)
  const dueDate = now + interval * 86400000

  return {
    ...card,
    stability,
    difficulty,
    interval,
    dueDate,
    lastReview: now,
    reps: (card.reps || 0) + 1,
    lapses: rating === 1 ? (card.lapses || 0) + 1 : (card.lapses || 0),
  }
}

// Returns cards due for review today
export function getDueCards(cards) {
  const now = Date.now()
  return cards.filter((c) => !c.dueDate || c.dueDate <= now)
}

// Creates a blank new card
export function newCard(front, back, id) {
  return {
    id,
    front,
    back,
    stability: null,
    difficulty: null,
    interval: null,
    dueDate: null,
    lastReview: null,
    reps: 0,
    lapses: 0,
  }
}
