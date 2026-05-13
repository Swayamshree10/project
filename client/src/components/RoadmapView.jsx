// components/RoadmapView.jsx — AI-generated learning roadmap with prerequisite graph
import { useState } from 'react'
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import useLearnStore from '../store/useLearnStore'
import api from '../services/api'

const BLOOM_COLORS = {
  Remember:   '#6366f1',
  Understand: '#8b5cf6',
  Apply:      '#06b6d4',
  Analyze:    '#f59e0b',
  Evaluate:   '#f97316',
  Create:     '#22c55e',
}
const DIFFICULTY_COLORS = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' }
const BLOOM_LEVELS = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create']

export default function RoadmapView() {
  const { branch, subject, level, topicStats } = useLearnStore()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [generated, setGenerated] = useState(false)
  const [roadmapInfo, setRoadmapInfo] = useState(null)

  const weakTopics = Object.entries(topicStats)
    .filter(([, s]) => s.total > 0 && (s.correct / s.total) < 0.5)
    .map(([t]) => t)

  async function generate() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/api/roadmap/graph', { branch, subject, level, weakTopics })

      const layouted = data.nodes.map((n, i) => {
        const col = i % 4
        const row = Math.floor(i / 4)
        const isWeak = weakTopics.includes(n.label)
        return {
          id: n.id,
          position: { x: col * 240 + 40, y: row * 160 + 40 },
          data: { label: <NodeLabel node={n} isWeak={isWeak} /> },
          style: {
            background: isWeak ? '#fef2f2' : '#fff',
            border: `2px solid ${isWeak ? '#ef4444' : BLOOM_COLORS[n.bloom] || '#6366f1'}`,
            borderRadius: 12,
            padding: '10px 14px',
            fontSize: 13,
            fontWeight: 600,
            width: 190,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
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
      setRoadmapInfo({ total: data.nodes.length, weak: weakTopics.length })
      setGenerated(true)
    } catch {
      setError('Failed to generate roadmap. Make sure the server is running.')
    } finally {
      setLoading(false)
    }
  }

  if (!generated) {
    return (
      <div style={s.wrap}>
        <div style={s.header}>
          <div style={s.headerTitle}>🗺️ Learning Roadmap</div>
          <div style={s.headerSub}>AI-generated prerequisite graph for {subject}</div>
        </div>
        <div style={s.emptyWrap}>
          <div style={s.emptyIcon}>🗺️</div>
          <p style={s.emptyTitle}>Prerequisite Roadmap for <span style={{ color: '#6366f1' }}>{subject}</span></p>
          <p style={s.emptySub}>
            {weakTopics.length > 0
              ? `${weakTopics.length} weak topic${weakTopics.length > 1 ? 's' : ''} detected — will be highlighted in red`
              : 'Shows which topics must be mastered before moving to the next'}
          </p>

          {/* Info cards */}
          <div style={s.infoRow}>
            <div style={s.infoCard}>
              <div style={s.infoIcon}>📚</div>
              <div style={s.infoLabel}>Subject</div>
              <div style={s.infoValue}>{subject}</div>
            </div>
            <div style={s.infoCard}>
              <div style={s.infoIcon}>🎓</div>
              <div style={s.infoLabel}>Level</div>
              <div style={s.infoValue}>{level}</div>
            </div>
            <div style={s.infoCard}>
              <div style={s.infoIcon}>⚠️</div>
              <div style={s.infoLabel}>Weak Topics</div>
              <div style={{ ...s.infoValue, color: weakTopics.length > 0 ? '#ef4444' : '#22c55e' }}>
                {weakTopics.length > 0 ? weakTopics.length : 'None'}
              </div>
            </div>
          </div>

          {weakTopics.length > 0 && (
            <div style={s.weakList}>
              <div style={s.weakTitle}>⚠️ Topics to focus on:</div>
              <div style={s.weakTags}>
                {weakTopics.map((t) => (
                  <span key={t} style={s.weakTag}>{t}</span>
                ))}
              </div>
            </div>
          )}

          <button style={s.btn} onClick={generate} disabled={loading}>
            {loading ? '⏳ Generating...' : '🗺️ Generate Roadmap'}
          </button>
          {error && <div style={s.error}>{error}</div>}
        </div>
      </div>
    )
  }

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <div style={s.headerTitle}>🗺️ Learning Roadmap — {subject}</div>
          <div style={s.headerSub}>{roadmapInfo?.total} topics · {roadmapInfo?.weak} weak highlighted in red</div>
        </div>
        <button style={s.regenBtn} onClick={generate} disabled={loading}>
          {loading ? '⏳' : '↺ Regenerate'}
        </button>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        {/* Legend */}
        <div style={s.legend}>
          {BLOOM_LEVELS.map((b) => (
            <span key={b} style={{ ...s.legendItem, borderColor: BLOOM_COLORS[b] }}>
              <span style={{ ...s.legendDot, background: BLOOM_COLORS[b] }} />{b}
            </span>
          ))}
          <span style={{ ...s.legendItem, borderColor: '#ef4444' }}>
            <span style={{ ...s.legendDot, background: '#ef4444' }} />Weak
          </span>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background color="#e2e8f0" gap={20} />
          <Controls />
          <MiniMap nodeColor={(n) => n.style?.border?.includes('#ef4444') ? '#ef4444' : '#6366f1'} />
        </ReactFlow>
      </div>
    </div>
  )
}

function NodeLabel({ node, isWeak }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: isWeak ? '#ef4444' : '#1e293b', marginBottom: 4 }}>{node.label}</div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, background: (BLOOM_COLORS[node.bloom] || '#6366f1') + '22', color: BLOOM_COLORS[node.bloom] || '#6366f1', padding: '1px 6px', borderRadius: 8, fontWeight: 600 }}>
          {node.bloom}
        </span>
        <span style={{ fontSize: 10, background: (DIFFICULTY_COLORS[node.difficulty] || '#94a3b8') + '22', color: DIFFICULTY_COLORS[node.difficulty] || '#94a3b8', padding: '1px 6px', borderRadius: 8, fontWeight: 600 }}>
          {node.difficulty}
        </span>
      </div>
    </div>
  )
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' },
  header: { padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 },
  headerTitle: { fontWeight: 700, fontSize: 16, color: '#1e293b' },
  headerSub: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  regenBtn: { padding: '7px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, color: '#6366f1', fontWeight: 600, cursor: 'pointer' },

  emptyWrap: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center', padding: '40px 24px' },
  emptyIcon: { fontSize: 64 },
  emptyTitle: { fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 },
  emptySub: { fontSize: 14, color: '#64748b', margin: 0, maxWidth: 440 },

  infoRow: { display: 'flex', gap: 16, marginTop: 8 },
  infoCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 24px', textAlign: 'center', minWidth: 110 },
  infoIcon: { fontSize: 24, marginBottom: 6 },
  infoLabel: { fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 16, fontWeight: 700, color: '#1e293b', marginTop: 2 },

  weakList: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', maxWidth: 480, width: '100%' },
  weakTitle: { fontSize: 13, fontWeight: 700, color: '#dc2626', marginBottom: 8 },
  weakTags: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  weakTag: { background: '#fee2e2', color: '#dc2626', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 },

  btn: { padding: '12px 32px', borderRadius: 12, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 4 },
  error: { color: '#ef4444', fontSize: 13, background: '#fef2f2', padding: '10px 16px', borderRadius: 8 },

  legend: { position: 'absolute', top: 12, left: 12, zIndex: 10, display: 'flex', flexWrap: 'wrap', gap: 6, background: 'rgba(255,255,255,0.95)', padding: '8px 12px', borderRadius: 10, border: '1px solid #e2e8f0' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#374151', border: '1px solid', borderRadius: 6, padding: '2px 8px' },
  legendDot: { width: 8, height: 8, borderRadius: '50%' },
}
