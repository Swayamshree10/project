// components/ProgressView.jsx — weakness detection, prerequisite graph, bloom's taxonomy
import { useState, useCallback, useEffect } from 'react'
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import useLearnStore from '../store/useLearnStore'
import api from '../services/api'

const BLOOM_LEVELS = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create']
const BLOOM_COLORS = {
  Remember:   '#6366f1',
  Understand: '#8b5cf6',
  Apply:      '#06b6d4',
  Analyze:    '#f59e0b',
  Evaluate:   '#f97316',
  Create:     '#22c55e',
}
const DIFFICULTY_COLORS = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' }

export default function ProgressView() {
  const [tab, setTab] = useState('weakness')
  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.headerTitle}>📊 Progress & Analytics</div>
        <div style={styles.tabs}>
          {[
            { key: 'weakness', label: '🎯 Weakness' },
            { key: 'graph',    label: '🗺️ Prerequisite Graph' },
            { key: 'bloom',    label: '🧠 Bloom\'s Taxonomy' },
          ].map((t) => (
            <button key={t.key} style={{ ...styles.tabBtn, ...(tab === t.key ? styles.tabActive : {}) }} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.content}>
        {tab === 'weakness' && <WeaknessPanel />}
        {tab === 'graph'    && <GraphPanel />}
        {tab === 'bloom'    && <BloomPanel />}
      </div>
    </div>
  )
}

// ── Weakness Detection ─────────────────────────────────────────────────────
function WeaknessPanel() {
  const { topicStats, quizHistory, flashcards } = useLearnStore()

  const topics = Object.entries(topicStats).map(([topic, s]) => {
    const accuracy = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0
    const struggleScore = s.againCount * 3 + s.hardCount * 1
    const status = accuracy >= 80 ? 'strong' : accuracy >= 50 ? 'average' : 'weak'
    return { topic, accuracy, struggleScore, status, ...s }
  }).sort((a, b) => a.accuracy - b.accuracy)

  const weak    = topics.filter((t) => t.status === 'weak')
  const average = topics.filter((t) => t.status === 'average')
  const strong  = topics.filter((t) => t.status === 'strong')

  const totalQuizzes   = quizHistory.length
  const avgScore       = totalQuizzes > 0 ? Math.round(quizHistory.reduce((s, q) => s + (q.score / q.total) * 100, 0) / totalQuizzes) : 0
  const dueFlashcards  = flashcards.filter((c) => !c.dueDate || c.dueDate <= Date.now()).length

  if (topics.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>🎯</div>
        <p style={styles.emptyText}>No data yet</p>
        <p style={styles.emptySub}>Take a quiz or review flashcards to see your weakness analysis</p>
      </div>
    )
  }

  return (
    <div style={styles.panelWrap}>
      {/* Summary cards */}
      <div style={styles.statRow}>
        <StatCard label="Quizzes Taken"   value={totalQuizzes}    icon="📝" />
        <StatCard label="Avg Quiz Score"  value={`${avgScore}%`}  icon="📈" color={avgScore >= 70 ? '#22c55e' : '#ef4444'} />
        <StatCard label="Weak Topics"     value={weak.length}     icon="⚠️" color={weak.length > 0 ? '#ef4444' : '#22c55e'} />
        <StatCard label="Flashcards Due"  value={dueFlashcards}   icon="🃏" />
      </div>

      {/* Weak topics */}
      {weak.length > 0 && (
        <Section title="⚠️ Weak Topics — Need Attention" color="#fef2f2" borderColor="#ef4444">
          {weak.map((t) => <TopicBar key={t.topic} {...t} />)}
        </Section>
      )}

      {average.length > 0 && (
        <Section title="📊 Average Topics — Keep Practicing" color="#fffbeb" borderColor="#f59e0b">
          {average.map((t) => <TopicBar key={t.topic} {...t} />)}
        </Section>
      )}

      {strong.length > 0 && (
        <Section title="✅ Strong Topics" color="#f0fdf4" borderColor="#22c55e">
          {strong.map((t) => <TopicBar key={t.topic} {...t} />)}
        </Section>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>{icon}</div>
      <div style={{ ...styles.statValue, color: color || '#1e293b' }}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  )
}

function Section({ title, color, borderColor, children }) {
  return (
    <div style={{ background: color, borderLeft: `4px solid ${borderColor}`, borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: '#1e293b' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </div>
  )
}

function TopicBar({ topic, accuracy, total, againCount, hardCount, status }) {
  const color = status === 'weak' ? '#ef4444' : status === 'average' ? '#f59e0b' : '#22c55e'
  return (
    <div style={styles.topicBar}>
      <div style={styles.topicName}>{topic}</div>
      <div style={styles.barTrack}>
        <div style={{ ...styles.barFill, width: `${accuracy}%`, background: color }} />
      </div>
      <div style={{ ...styles.topicPct, color }}>{accuracy}%</div>
      <div style={styles.topicMeta}>{total} attempts · {againCount} again · {hardCount} hard</div>
    </div>
  )
}

// ── Prerequisite Graph ─────────────────────────────────────────────────────
function GraphPanel() {
  const { branch, subject, level, topicStats } = useLearnStore()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [generated, setGenerated] = useState(false)

  const weakTopics = Object.entries(topicStats)
    .filter(([, s]) => s.total > 0 && (s.correct / s.total) < 0.5)
    .map(([t]) => t)

  async function generate() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/api/roadmap/graph', { branch, subject, level, weakTopics })

      // Layout nodes in a layered grid
      const layouted = data.nodes.map((n, i) => {
        const col = i % 4
        const row = Math.floor(i / 4)
        const isWeak = weakTopics.includes(n.label)
        return {
          id: n.id,
          position: { x: col * 220 + 40, y: row * 140 + 40 },
          data: { label: <NodeLabel node={n} isWeak={isWeak} /> },
          style: {
            background: isWeak ? '#fef2f2' : '#fff',
            border: `2px solid ${isWeak ? '#ef4444' : BLOOM_COLORS[n.bloom] || '#6366f1'}`,
            borderRadius: 10,
            padding: '8px 12px',
            fontSize: 13,
            fontWeight: 600,
            width: 180,
          },
        }
      })

      const layoutedEdges = data.edges.map((e, i) => ({
        id: `e${i}`,
        source: e.source,
        target: e.target,
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed', color: '#6366f1' },
      }))

      setNodes(layouted)
      setEdges(layoutedEdges)
      setGenerated(true)
    } catch (err) {
      setError('Failed to generate graph.')
    } finally {
      setLoading(false)
    }
  }

  if (!generated) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>🗺️</div>
        <p style={styles.emptyText}>Prerequisite Graph for {subject}</p>
        <p style={styles.emptySub}>
          {weakTopics.length > 0
            ? `Weak topics detected: ${weakTopics.join(', ')} — will be highlighted in red`
            : 'Shows which topics must be learned before others'}
        </p>
        <button style={styles.btnPrimary} onClick={generate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Graph'}
        </button>
        {error && <div style={styles.errorMsg}>{error}</div>}
      </div>
    )
  }

  return (
    <div style={{ flex: 1, position: 'relative' }}>
      {/* Legend */}
      <div style={styles.legend}>
        {BLOOM_LEVELS.map((b) => (
          <span key={b} style={{ ...styles.legendItem, borderColor: BLOOM_COLORS[b] }}>
            <span style={{ ...styles.legendDot, background: BLOOM_COLORS[b] }} />{b}
          </span>
        ))}
        <span style={{ ...styles.legendItem, borderColor: '#ef4444' }}>
          <span style={{ ...styles.legendDot, background: '#ef4444' }} />Weak
        </span>
      </div>
      <button style={styles.regenerateBtn} onClick={generate} disabled={loading}>↺ Regenerate</button>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}

function NodeLabel({ node, isWeak }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: isWeak ? '#ef4444' : '#1e293b' }}>{node.label}</div>
      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
        <span style={{ fontSize: 10, background: BLOOM_COLORS[node.bloom] + '22', color: BLOOM_COLORS[node.bloom], padding: '1px 6px', borderRadius: 8, fontWeight: 600 }}>{node.bloom}</span>
        <span style={{ fontSize: 10, background: DIFFICULTY_COLORS[node.difficulty] + '22', color: DIFFICULTY_COLORS[node.difficulty], padding: '1px 6px', borderRadius: 8, fontWeight: 600 }}>{node.difficulty}</span>
      </div>
    </div>
  )
}

// ── Bloom's Taxonomy ───────────────────────────────────────────────────────
function BloomPanel() {
  const { quizHistory, flashcards } = useLearnStore()

  // Aggregate bloom stats from quiz history
  const bloomStats = {}
  BLOOM_LEVELS.forEach((b) => { bloomStats[b] = { correct: 0, total: 0 } })

  quizHistory.forEach((quiz) => {
    ;(quiz.questions || []).forEach(({ bloom, correct }) => {
      if (bloom && bloomStats[bloom]) {
        bloomStats[bloom].total++
        if (correct) bloomStats[bloom].correct++
      }
    })
  })

  // Aggregate bloom from flashcards (use topic as proxy if bloom not set)
  const totalAttempted = Object.values(bloomStats).reduce((s, b) => s + b.total, 0)

  if (totalAttempted === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>🧠</div>
        <p style={styles.emptyText}>No Bloom's data yet</p>
        <p style={styles.emptySub}>Take quizzes to see your performance across all 6 cognitive levels</p>
      </div>
    )
  }

  return (
    <div style={styles.panelWrap}>
      <div style={styles.bloomGrid}>
        {BLOOM_LEVELS.map((level, i) => {
          const s = bloomStats[level]
          const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : null
          const color = BLOOM_COLORS[level]
          return (
            <div key={level} style={{ ...styles.bloomCard, borderTop: `4px solid ${color}` }}>
              <div style={styles.bloomLevel}>Level {i + 1}</div>
              <div style={{ ...styles.bloomName, color }}>{level}</div>
              <div style={styles.bloomDesc}>{BLOOM_DESC[level]}</div>
              {s.total > 0 ? (
                <>
                  <div style={styles.bloomBarTrack}>
                    <div style={{ ...styles.bloomBarFill, width: `${pct}%`, background: color }} />
                  </div>
                  <div style={{ ...styles.bloomPct, color }}>{pct}% ({s.correct}/{s.total})</div>
                </>
              ) : (
                <div style={styles.bloomNoData}>Not tested yet</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Radar-style summary */}
      <div style={styles.bloomSummary}>
        <div style={styles.summaryTitle}>Cognitive Level Distribution</div>
        <div style={styles.summaryBars}>
          {BLOOM_LEVELS.map((level) => {
            const s = bloomStats[level]
            const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0
            return (
              <div key={level} style={styles.summaryBar}>
                <div style={styles.summaryBarLabel}>{level}</div>
                <div style={styles.summaryBarTrack}>
                  <div style={{ ...styles.summaryBarFill, width: `${pct}%`, background: BLOOM_COLORS[level] }} />
                </div>
                <div style={styles.summaryBarPct}>{s.total > 0 ? `${pct}%` : '—'}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const BLOOM_DESC = {
  Remember:   'Recall facts and basic concepts',
  Understand: 'Explain ideas or concepts',
  Apply:      'Use information in new situations',
  Analyze:    'Draw connections among ideas',
  Evaluate:   'Justify a decision or course of action',
  Create:     'Produce new or original work',
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' },
  header: { padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#fff', flexShrink: 0 },
  headerTitle: { fontWeight: 700, fontSize: 16, color: '#1e293b', marginBottom: 12 },
  tabs: { display: 'flex', gap: 8 },
  tabBtn: { padding: '7px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, color: '#64748b', cursor: 'pointer', fontWeight: 500 },
  tabActive: { background: '#6366f1', color: '#fff', borderColor: '#6366f1' },
  content: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' },

  panelWrap: { flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 },

  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, textAlign: 'center', padding: 40 },
  emptyIcon: { fontSize: 52 },
  emptyText: { fontSize: 16, fontWeight: 600, color: '#1e293b', margin: 0 },
  emptySub: { fontSize: 13, color: '#64748b', margin: 0, maxWidth: 400 },
  btnPrimary: { padding: '10px 24px', borderRadius: 10, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginTop: 8 },
  errorMsg: { color: '#ef4444', fontSize: 13, marginTop: 8 },

  // Weakness
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  statCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px', textAlign: 'center' },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statValue: { fontSize: 24, fontWeight: 800, color: '#1e293b' },
  statLabel: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  topicBar: { display: 'grid', gridTemplateColumns: '140px 1fr 44px', gap: 8, alignItems: 'center', rowGap: 2 },
  topicName: { fontSize: 13, fontWeight: 600, color: '#1e293b', gridColumn: 1 },
  barTrack: { height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden', gridColumn: 2 },
  barFill: { height: '100%', borderRadius: 4, transition: 'width 0.4s' },
  topicPct: { fontSize: 13, fontWeight: 700, textAlign: 'right', gridColumn: 3 },
  topicMeta: { fontSize: 11, color: '#94a3b8', gridColumn: '1 / -1' },

  // Graph
  legend: { position: 'absolute', top: 12, left: 12, zIndex: 10, display: 'flex', flexWrap: 'wrap', gap: 6, background: 'rgba(255,255,255,0.95)', padding: '8px 12px', borderRadius: 10, border: '1px solid #e2e8f0' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#374151', border: '1px solid', borderRadius: 6, padding: '2px 8px' },
  legendDot: { width: 8, height: 8, borderRadius: '50%' },
  regenerateBtn: { position: 'absolute', top: 12, right: 12, zIndex: 10, padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 600, color: '#6366f1' },

  // Bloom
  bloomGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 },
  bloomCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px', display: 'flex', flexDirection: 'column', gap: 6 },
  bloomLevel: { fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
  bloomName: { fontSize: 16, fontWeight: 800 },
  bloomDesc: { fontSize: 12, color: '#64748b', lineHeight: 1.4 },
  bloomBarTrack: { height: 6, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden', marginTop: 4 },
  bloomBarFill: { height: '100%', borderRadius: 4 },
  bloomPct: { fontSize: 13, fontWeight: 700 },
  bloomNoData: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic' },
  bloomSummary: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px' },
  summaryTitle: { fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 16 },
  summaryBars: { display: 'flex', flexDirection: 'column', gap: 10 },
  summaryBar: { display: 'grid', gridTemplateColumns: '100px 1fr 44px', gap: 10, alignItems: 'center' },
  summaryBarLabel: { fontSize: 13, fontWeight: 600, color: '#374151' },
  summaryBarTrack: { height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden' },
  summaryBarFill: { height: '100%', borderRadius: 5, transition: 'width 0.4s' },
  summaryBarPct: { fontSize: 13, fontWeight: 700, color: '#64748b', textAlign: 'right' },
}
