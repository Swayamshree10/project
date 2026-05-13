// components/FlashcardsView.jsx — flashcard UI with FSRS-powered review sessions
import { useState } from 'react'
import { useFlashcards } from '../hooks/useFlashcards'
import { newCard } from '../lib/fsrs'
import useLearnStore from '../store/useLearnStore'

const RATINGS = [
  { value: 1, label: 'Again', color: '#ef4444', hint: '< 1 day' },
  { value: 2, label: 'Hard',  color: '#f97316', hint: '~1 day'  },
  { value: 3, label: 'Good',  color: '#22c55e', hint: '~3 days' },
  { value: 4, label: 'Easy',  color: '#6366f1', hint: '~9 days' },
]

export default function FlashcardsView() {
  const { subject } = useLearnStore()
  const {
    flashcards, loading, error,
    generate, deleteFlashcard,
    currentCard, currentIndex, reviewQueue,
    flipped, flip, rate,
    sessionDone, startReview, dueCount,
  } = useFlashcards()

  const [tab, setTab] = useState('deck') // 'deck' | 'review' | 'add'
  const [newFront, setNewFront] = useState('')
  const [newBack, setNewBack]   = useState('')
  const { addFlashcard } = useFlashcards()

  function handleAdd() {
    if (!newFront.trim() || !newBack.trim()) return
    addFlashcard(newCard(newFront.trim(), newBack.trim(), `manual-${Date.now()}`))
    setNewFront('')
    setNewBack('')
  }

  // ── Review session ──────────────────────────────────────────
  if (tab === 'review') {
    if (sessionDone || reviewQueue.length === 0) {
      return (
        <div style={styles.wrap}>
          <div style={styles.sessionDone}>
            <div style={styles.doneIcon}>🎉</div>
            <div style={styles.doneTitle}>Session Complete!</div>
            <div style={styles.doneSub}>You reviewed {reviewQueue.length} card{reviewQueue.length !== 1 ? 's' : ''}.</div>
            <button style={styles.btnPrimary} onClick={() => setTab('deck')}>Back to Deck</button>
          </div>
        </div>
      )
    }

    return (
      <div style={styles.wrap}>
        <div style={styles.reviewHeader}>
          <button style={styles.backBtn} onClick={() => setTab('deck')}>← Back</button>
          <span style={styles.reviewProgress}>{currentIndex + 1} / {reviewQueue.length}</span>
        </div>

        {/* Progress bar */}
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${((currentIndex) / reviewQueue.length) * 100}%` }} />
        </div>

        {/* Card */}
        <div style={styles.cardWrap} onClick={flip}>
          <div style={styles.card}>
            <div style={styles.cardSide}>{flipped ? 'Answer' : 'Question'}</div>
            <div style={styles.cardText}>{flipped ? currentCard.back : currentCard.front}</div>
            {!flipped && <div style={styles.tapHint}>Tap to reveal answer</div>}
          </div>
        </div>

        {/* Rating buttons — only show after flip */}
        {flipped && (
          <div style={styles.ratings}>
            <div style={styles.ratingsLabel}>How well did you know this?</div>
            <div style={styles.ratingBtns}>
              {RATINGS.map((r) => (
                <button key={r.value} style={{ ...styles.ratingBtn, borderColor: r.color }} onClick={() => rate(r.value)}>
                  <span style={{ color: r.color, fontWeight: 700 }}>{r.label}</span>
                  <span style={styles.ratingHint}>{r.hint}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Deck view ───────────────────────────────────────────────
  return (
    <div style={styles.wrap}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitle}>🃏 Flashcards — {subject}</div>
          <div style={styles.headerSub}>{flashcards.length} cards · {dueCount} due today</div>
        </div>
        <div style={styles.headerBtns}>
          <button style={styles.btnSecondary} onClick={() => setTab('add')}>+ Add Card</button>
          <button style={{ ...styles.btnSecondary, opacity: loading ? 0.5 : 1 }} onClick={generate} disabled={loading}>
            {loading ? 'Generating...' : '✨ AI Generate'}
          </button>
          {dueCount > 0 && (
            <button style={styles.btnPrimary} onClick={() => { startReview(); setTab('review') }}>
              Review {dueCount} due
            </button>
          )}
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* Add card form */}
      {tab === 'add' && (
        <div style={styles.addForm}>
          <textarea style={styles.addInput} placeholder="Front (question / concept)" value={newFront} onChange={(e) => setNewFront(e.target.value)} rows={3} />
          <textarea style={styles.addInput} placeholder="Back (answer / explanation)" value={newBack}  onChange={(e) => setNewBack(e.target.value)}  rows={3} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={styles.btnPrimary} onClick={handleAdd}>Add Card</button>
            <button style={styles.btnSecondary} onClick={() => setTab('deck')}>Cancel</button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {flashcards.length === 0 && tab !== 'add' && (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🃏</div>
          <p style={styles.emptyText}>No flashcards yet for <strong>{subject}</strong></p>
          <p style={styles.emptySub}>Generate AI flashcards or add your own</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={styles.btnPrimary} onClick={generate} disabled={loading}>
              {loading ? 'Generating...' : '✨ Generate with AI'}
            </button>
            <button style={styles.btnSecondary} onClick={() => setTab('add')}>+ Add Manually</button>
          </div>
        </div>
      )}

      {/* Card grid */}
      {flashcards.length > 0 && tab !== 'add' && (
        <div style={styles.grid}>
          {flashcards.map((card) => {
            const isDue = !card.dueDate || card.dueDate <= Date.now()
            return (
              <div key={card.id} style={styles.deckCard}>
                <div style={styles.deckCardFront}>{card.front}</div>
                <div style={styles.deckCardBack}>{card.back}</div>
                <div style={styles.deckCardMeta}>
                  <span style={{ ...styles.dueBadge, background: isDue ? '#fef2f2' : '#f0fdf4', color: isDue ? '#ef4444' : '#16a34a' }}>
                    {isDue ? 'Due' : `In ${card.interval}d`}
                  </span>
                  {card.reps > 0 && <span style={styles.repsBadge}>×{card.reps}</span>}
                  <button style={styles.deleteBtn} onClick={() => deleteFlashcard(card.id)}>🗑</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' },
  header: { padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 },
  headerTitle: { fontWeight: 700, fontSize: 16, color: '#1e293b' },
  headerSub: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  headerBtns: { display: 'flex', gap: 8 },
  btnPrimary: { padding: '8px 18px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' },
  btnSecondary: { padding: '8px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 600, fontSize: 13, cursor: 'pointer' },
  error: { margin: '12px 24px', color: '#ef4444', fontSize: 13, background: '#fef2f2', padding: '10px 14px', borderRadius: 8 },

  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, textAlign: 'center', padding: 40 },
  emptyIcon: { fontSize: 52 },
  emptyText: { fontSize: 16, color: '#1e293b', margin: 0 },
  emptySub: { fontSize: 13, color: '#64748b', margin: 0 },

  grid: { flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, alignContent: 'start' },
  deckCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 },
  deckCardFront: { fontSize: 14, fontWeight: 600, color: '#1e293b', lineHeight: 1.4 },
  deckCardBack: { fontSize: 13, color: '#64748b', lineHeight: 1.5 },
  deckCardMeta: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 },
  dueBadge: { fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10 },
  repsBadge: { fontSize: 11, color: '#94a3b8' },
  deleteBtn: { marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: 0.5 },

  addForm: { padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 },
  addInput: { padding: '12px 14px', borderRadius: 10, border: '2px solid #e2e8f0', fontSize: 14, resize: 'vertical', outline: 'none', fontFamily: 'inherit' },

  // Review
  reviewHeader: { padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderBottom: '1px solid #e2e8f0', flexShrink: 0 },
  backBtn: { background: 'none', border: 'none', color: '#6366f1', fontWeight: 600, fontSize: 14, cursor: 'pointer' },
  reviewProgress: { fontSize: 13, color: '#64748b', fontWeight: 600 },
  progressBar: { height: 4, background: '#e2e8f0', flexShrink: 0 },
  progressFill: { height: '100%', background: '#6366f1', transition: 'width 0.3s' },
  cardWrap: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', cursor: 'pointer' },
  card: { background: '#fff', border: '2px solid #e2e8f0', borderRadius: 20, padding: '40px 36px', maxWidth: 560, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 200, justifyContent: 'center' },
  cardSide: { fontSize: 11, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1 },
  cardText: { fontSize: 18, fontWeight: 600, color: '#1e293b', lineHeight: 1.6 },
  tapHint: { fontSize: 12, color: '#94a3b8', marginTop: 8 },
  ratings: { padding: '16px 24px 24px', background: '#fff', borderTop: '1px solid #e2e8f0', flexShrink: 0 },
  ratingsLabel: { fontSize: 12, color: '#94a3b8', fontWeight: 600, textAlign: 'center', marginBottom: 12 },
  ratingBtns: { display: 'flex', gap: 10, justifyContent: 'center' },
  ratingBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 20px', borderRadius: 10, border: '2px solid', background: '#fff', cursor: 'pointer', minWidth: 72 },
  ratingHint: { fontSize: 11, color: '#94a3b8' },

  sessionDone: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center' },
  doneIcon: { fontSize: 56 },
  doneTitle: { fontSize: 24, fontWeight: 700, color: '#1e293b' },
  doneSub: { fontSize: 14, color: '#64748b' },
}
