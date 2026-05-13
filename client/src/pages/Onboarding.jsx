// pages/Onboarding.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useLearnStore from '../store/useLearnStore'

const BRANCHES = [
  { label: 'Computer Science', icon: '💻' },
  { label: 'Electrical',       icon: '⚡' },
  { label: 'Electronics',      icon: '🔌' },
  { label: 'Mechanical',       icon: '⚙️' },
  { label: 'Civil',            icon: '🏗️' },
  { label: 'Chemical',         icon: '🧪' },
]

const SUBJECTS = {
  'Computer Science': ['Data Structures','Algorithms','Operating Systems','Databases','Networks','Machine Learning'],
  'Electrical':       ['Circuit Theory','Signals & Systems','Power Systems','Control Systems','Electromagnetics'],
  'Electronics':      ['Analog Circuits','Digital Electronics','VLSI Design','Embedded Systems','Communication Systems'],
  'Mechanical':       ['Thermodynamics','Fluid Mechanics','Strength of Materials','Machine Design','Manufacturing'],
  'Civil':            ['Structural Analysis','Geotechnical Engineering','Fluid Mechanics','Transportation','Surveying'],
  'Chemical':         ['Thermodynamics','Mass Transfer','Heat Transfer','Reaction Engineering','Process Control'],
}

const LEVELS = [
  { label: 'Beginner',     icon: '🌱', desc: 'Just starting out' },
  { label: 'Intermediate', icon: '🔥', desc: 'Know the basics'   },
  { label: 'Advanced',     icon: '⚡', desc: 'Deep knowledge'    },
]

const STEPS = ['Branch', 'Subject', 'Level', 'Interests']

export default function Onboarding() {
  const navigate = useNavigate()
  const { setBranch, setSubject, setLevel, setInterests } = useLearnStore()
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState({ branch: '', subject: '', level: '', interests: [] })
  const [tagInput, setTagInput] = useState('')

  function pick(key, value) { setSelected(s => ({ ...s, [key]: value })) }

  function addTag(e) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const tag = tagInput.trim().replace(/,$/, '')
      if (!selected.interests.includes(tag))
        setSelected(s => ({ ...s, interests: [...s.interests, tag] }))
      setTagInput('')
    }
  }

  function removeTag(tag) {
    setSelected(s => ({ ...s, interests: s.interests.filter(t => t !== tag) }))
  }

  function canNext() {
    if (step === 0) return !!selected.branch
    if (step === 1) return !!selected.subject
    if (step === 2) return !!selected.level
    return true
  }

  function finish() {
    setBranch(selected.branch)
    setSubject(selected.subject)
    setLevel(selected.level)
    setInterests(selected.interests)
    const { user, token } = useLearnStore.getState()
    if (user && token) {
      fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id, branch: selected.branch, subject: selected.subject, level: selected.level, interests: selected.interests }),
      }).catch(() => {})
    }
    navigate('/app')
  }

  const progress = ((step) / (STEPS.length - 1)) * 100

  return (
    <div style={s.page}>
      {/* Background orbs */}
      <div style={{ ...s.orb, top: '-20%', left: '-10%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />
      <div style={{ ...s.orb, bottom: '-20%', right: '-10%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }} />

      <div style={s.card} className="glass fade-in">
        {/* Header */}
        <div style={s.header}>
          <div style={s.logoRow}>
            <span style={s.logoIcon}>🧠</span>
            <span className="gradient-text" style={s.logoText}>Mind Trail</span>
          </div>
          <p style={s.subtitle}>Set up your personalized learning path</p>
        </div>

        {/* Progress bar */}
        <div style={s.progressTrack}>
          <div style={{ ...s.progressFill, width: `${progress}%` }} className="progress-bar-animated" />
        </div>

        {/* Step indicators */}
        <div style={s.steps}>
          {STEPS.map((label, i) => (
            <div key={label} style={s.stepItem}>
              <div style={{
                ...s.stepDot,
                background: i < step ? '#22c55e' : i === step ? '#6366f1' : 'rgba(99,102,241,0.1)',
                border: i === step ? '2px solid #6366f1' : '2px solid transparent',
                boxShadow: i === step ? '0 0 12px rgba(99,102,241,0.5)' : 'none',
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span style={{ ...s.stepLabel, color: i === step ? '#a5b4fc' : '#475569' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Step 0 — Branch */}
        {step === 0 && (
          <div className="fade-in">
            <h2 style={s.stepTitle}>What's your engineering branch?</h2>
            <div style={s.branchGrid}>
              {BRANCHES.map(({ label, icon }) => (
                <button key={label} style={{ ...s.branchCard, ...(selected.branch === label ? s.branchActive : {}) }} onClick={() => pick('branch', label)}>
                  <span style={s.branchIcon}>{icon}</span>
                  <span style={s.branchLabel}>{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 — Subject */}
        {step === 1 && (
          <div className="fade-in">
            <h2 style={s.stepTitle}>Which subject in {selected.branch}?</h2>
            <div style={s.chipGrid}>
              {(SUBJECTS[selected.branch] || []).map(sub => (
                <button key={sub} style={{ ...s.chip, ...(selected.subject === sub ? s.chipActive : {}) }} onClick={() => pick('subject', sub)}>
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Level */}
        {step === 2 && (
          <div className="fade-in">
            <h2 style={s.stepTitle}>What's your current level?</h2>
            <div style={s.levelGrid}>
              {LEVELS.map(({ label, icon, desc }) => (
                <button key={label} style={{ ...s.levelCard, ...(selected.level === label ? s.levelActive : {}) }} onClick={() => pick('level', label)}>
                  <span style={s.levelIcon}>{icon}</span>
                  <span style={s.levelLabel}>{label}</span>
                  <span style={s.levelDesc}>{desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Interests */}
        {step === 3 && (
          <div className="fade-in">
            <h2 style={s.stepTitle}>Any specific interests? <span style={{ color: '#475569', fontSize: 14 }}>(optional)</span></h2>
            <input
              style={s.input}
              placeholder="Type a topic and press Enter (e.g. sorting algorithms)"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={addTag}
              autoFocus
            />
            <div style={s.tags}>
              {selected.interests.map(tag => (
                <span key={tag} style={s.tag}>
                  {tag}
                  <button style={s.tagX} onClick={() => removeTag(tag)}>×</button>
                </span>
              ))}
              {selected.interests.length === 0 && <span style={{ color: '#475569', fontSize: 13 }}>No interests added yet — that's fine!</span>}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={s.nav}>
          {step > 0 && (
            <button style={s.btnSecondary} onClick={() => setStep(s => s - 1)}>← Back</button>
          )}
          {step < 3 ? (
            <button style={{ ...s.btnPrimary, opacity: canNext() ? 1 : 0.4 }} disabled={!canNext()} onClick={() => setStep(s => s + 1)}>
              Continue →
            </button>
          ) : (
            <button style={s.btnPrimary} onClick={finish}>
              🚀 Start Learning
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: "'Inter', system-ui, sans-serif", position: 'relative', overflow: 'hidden' },
  orb: { position: 'absolute', width: '60vw', height: '60vw', borderRadius: '50%', pointerEvents: 'none' },
  card: { width: '100%', maxWidth: 560, borderRadius: 24, padding: '40px 40px 36px', position: 'relative', zIndex: 1 },
  header: { marginBottom: 28 },
  logoRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  logoIcon: { fontSize: 26 },
  logoText: { fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' },
  subtitle: { color: '#64748b', fontSize: 14 },
  progressTrack: { height: 3, background: 'rgba(99,102,241,0.15)', borderRadius: 3, marginBottom: 24, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, transition: 'width 0.5s ease' },
  steps: { display: 'flex', gap: 6, marginBottom: 28, alignItems: 'center' },
  stepItem: { display: 'flex', alignItems: 'center', gap: 6, flex: 1 },
  stepDot: { width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0, transition: 'all 0.3s ease' },
  stepLabel: { fontSize: 11, fontWeight: 600, transition: 'color 0.3s' },
  stepTitle: { fontSize: 17, fontWeight: 700, color: '#e2e8f0', marginBottom: 18 },

  branchGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 8 },
  branchCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 10px', borderRadius: 14, border: '1px solid rgba(99,102,241,0.15)', background: 'rgba(99,102,241,0.05)', cursor: 'pointer', transition: 'all 0.2s' },
  branchActive: { border: '1px solid #6366f1', background: 'rgba(99,102,241,0.15)', boxShadow: '0 0 16px rgba(99,102,241,0.2)' },
  branchIcon: { fontSize: 28 },
  branchLabel: { fontSize: 12, fontWeight: 600, color: '#a5b4fc', textAlign: 'center' },

  chipGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 8 },
  chip: { padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(99,102,241,0.15)', background: 'rgba(99,102,241,0.05)', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#94a3b8', textAlign: 'left', transition: 'all 0.2s' },
  chipActive: { border: '1px solid #6366f1', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' },

  levelGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 8 },
  levelCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '20px 10px', borderRadius: 14, border: '1px solid rgba(99,102,241,0.15)', background: 'rgba(99,102,241,0.05)', cursor: 'pointer', transition: 'all 0.2s' },
  levelActive: { border: '1px solid #6366f1', background: 'rgba(99,102,241,0.15)', boxShadow: '0 0 16px rgba(99,102,241,0.2)' },
  levelIcon: { fontSize: 28 },
  levelLabel: { fontSize: 13, fontWeight: 700, color: '#a5b4fc' },
  levelDesc: { fontSize: 11, color: '#64748b' },

  input: { width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.05)', color: '#e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 14 },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 8, minHeight: 36 },
  tag: { display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 500, border: '1px solid rgba(99,102,241,0.25)' },
  tagX: { background: 'none', border: 'none', cursor: 'pointer', color: '#a5b4fc', fontSize: 16, padding: 0, lineHeight: 1 },

  nav: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 28 },
  btnPrimary: { padding: '11px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' },
  btnSecondary: { padding: '11px 24px', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)', background: 'transparent', color: '#64748b', fontWeight: 600, fontSize: 14, cursor: 'pointer' },
}
