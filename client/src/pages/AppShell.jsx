import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChat } from '../hooks/useChat'
import useLearnStore from '../store/useLearnStore'
import useThemeStore, { THEMES } from '../store/useThemeStore'
import QuizView from '../components/QuizView'
import RAGView from '../components/RAGView'
import FlashcardsView from '../components/FlashcardsView'
import ProgressView from '../components/ProgressView'
import RoadmapView from '../components/RoadmapView'
import Notebook from './Notebook'

const NAV = [
  { id: 'chat',       icon: '💬', label: 'Chat'        },
  { id: 'quiz',       icon: '🧠', label: 'Quiz'        },
  { id: 'rag',        icon: '📚', label: 'Eng. Tutor'  },
  { id: 'flashcards', icon: '🃏', label: 'Flashcards'  },
  { id: 'notebook',   icon: '📓', label: 'Notebook'    },
  { id: 'roadmap',    icon: '🗺️', label: 'Roadmap'     },
  { id: 'progress',   icon: '📊', label: 'Progress'    },
]

function Particles() {
  return (
    <div className="particles">
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="particle" style={{
          left: `${Math.random() * 100}%`,
          animationDuration: `${8 + Math.random() * 12}s`,
          animationDelay: `${Math.random() * 8}s`,
          width: `${1 + Math.random() * 2}px`,
          height: `${1 + Math.random() * 2}px`,
          opacity: 0.1 + Math.random() * 0.3,
        }} />
      ))}
    </div>
  )
}

export default function AppShell() {
  const navigate = useNavigate()
  const { messages, send, loading, error } = useChat()
  const { branch, subject, level, user, logout } = useLearnStore()
  const { theme, setTheme } = useThemeStore()
  const [input, setInput] = useState('')
  const [activeTab, setActiveTab] = useState('chat')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { if (!branch) navigate('/onboarding') }, [branch])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  // Apply theme class to body
  useEffect(() => {
    document.body.className = `theme-${theme}`
    const vars = THEMES[theme]
    Object.entries(vars).forEach(([k, v]) => { if (k.startsWith('--')) document.documentElement.style.setProperty(k, v) })
  }, [theme])

  function handleSend() {
    if (!input.trim() || loading) return
    send(input.trim())
    setInput('')
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div style={s.shell}>
      <Particles />

      {/* Sidebar */}
      <aside style={{ ...s.sidebar, width: sidebarCollapsed ? 64 : 230 }}>
        {/* Logo */}
        <div style={s.logoRow}>
          {!sidebarCollapsed && (
            <div style={s.logo}>
              <span style={s.logoIcon}>🧠</span>
              <span className="gradient-text" style={s.logoText}>Mind Trail</span>
            </div>
          )}
          <button style={s.collapseBtn} onClick={() => setSidebarCollapsed(v => !v)}>
            {sidebarCollapsed ? '›' : '‹'}
          </button>
        </div>

        {/* Sidebar glow line */}
        <div style={s.glowLine} />

        {/* Profile */}
        {!sidebarCollapsed && (
          <div style={s.profile} className="glass">
            <div style={s.avatar}>{user?.name?.[0]?.toUpperCase() || '👤'}</div>
            <div style={s.profileInfo}>
              <div style={s.profileName}>{user?.name || 'Student'}</div>
              <div style={s.profileMeta}>{branch} · {level}</div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={s.nav}>
          {NAV.map(({ id, icon, label }) => (
            <button
              key={id}
              className={`nav-item ${activeTab === id ? 'active' : ''}`}
              style={{
                ...s.navItem,
                ...(activeTab === id ? s.navActive : {}),
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              }}
              onClick={() => setActiveTab(id)}
              data-tooltip={sidebarCollapsed ? label : undefined}
            >
              <span style={s.navIcon}>{icon}</span>
              {!sidebarCollapsed && <span style={s.navLabel}>{label}</span>}
              {!sidebarCollapsed && activeTab === id && <span style={s.navPing} />}
            </button>
          ))}
        </nav>

        {/* Bottom buttons */}
        <div style={s.sidebarBottom}>
          {/* Theme switcher */}
          {!sidebarCollapsed && (
            <div style={s.themeRow}>
              {Object.entries(THEMES).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  style={{
                    ...s.themeBtn,
                    background: theme === key ? 'var(--primary)' : 'transparent',
                    border: `1px solid ${theme === key ? 'var(--primary)' : 'var(--border)'}`,
                    color: theme === key ? '#fff' : 'var(--text3)',
                    boxShadow: theme === key ? 'var(--glow)' : 'none',
                  }}
                  data-tooltip={t.name}
                >
                  {t.icon}
                </button>
              ))}
            </div>
          )}
          {sidebarCollapsed && (
            <button
              style={s.iconBtn}
              onClick={() => {
                const keys = Object.keys(THEMES)
                const next = keys[(keys.indexOf(theme) + 1) % keys.length]
                setTheme(next)
              }}
              data-tooltip={`Theme: ${THEMES[theme].name}`}
            >
              {THEMES[theme].icon}
            </button>
          )}
          {!sidebarCollapsed && (
            <>
              <button style={s.outlineBtn} onClick={() => navigate('/onboarding')}>⚙️ Change Profile</button>
              <button style={s.dangerBtn} onClick={() => { logout(); navigate('/') }}>↩ Sign Out</button>
            </>
          )}
          {sidebarCollapsed && (
            <>
              <button style={s.iconBtn} onClick={() => navigate('/onboarding')} data-tooltip="Change Profile">⚙️</button>
              <button style={s.iconBtn} onClick={() => { logout(); navigate('/') }} data-tooltip="Sign Out">↩</button>
            </>
          )}
        </div>
      </aside>

      {/* Main */}
      <main style={s.main}>
        {activeTab === 'chat' && (
          <div style={s.chatWrap}>
            {/* Header */}
            <header style={s.header}>
              <div style={s.headerLeft}>
                <div style={s.headerTitle}>Chat with Mind Trail</div>
                <div style={s.headerSub}>
                  <span style={s.dot} />
                  {subject} · {level}
                </div>
              </div>
              <div style={s.headerRight}>
                <div style={s.statusBadge}>
                  <span style={s.statusDot} />
                  AI Online
                </div>
              </div>
            </header>

            {/* Messages */}
            <div style={s.messages}>
              {messages.length === 0 && (
                <div style={s.empty} className="fade-in">
                  <div style={s.emptyOrb}>🤖</div>
                  <h2 style={s.emptyTitle}>Ask me anything about <span className="gradient-text">{subject}</span></h2>
                  <p style={s.emptySub}>I'm your AI tutor, powered by NVIDIA NIM</p>
                  <div style={s.suggestions}>
                    {getSuggestions(subject).map((sg, i) => (
                      <button key={sg} className="fade-in" style={{ ...s.suggestion, animationDelay: `${i * 0.1}s` }} onClick={() => send(sg)}>
                        <span style={s.suggestionArrow}>→</span> {sg}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className="bubble-in" style={{
                  ...s.bubble,
                  ...(msg.role === 'user' ? s.userBubble : s.aiBubble),
                  animationDelay: `${i * 0.05}s`,
                }}>
                  <div style={s.bubbleRole}>
                    {msg.role === 'user'
                      ? <span style={s.userRole}>You</span>
                      : <span style={s.aiRole}>🧠 Mind Trail</span>
                    }
                  </div>
                  <div style={s.bubbleText}>{msg.content}</div>
                </div>
              ))}

              {loading && (
                <div style={{ ...s.bubble, ...s.aiBubble }} className="bubble-in">
                  <div style={s.aiRole}>🧠 Mind Trail</div>
                  <div className="typing" style={{ marginTop: 8 }}><span /><span /><span /></div>
                </div>
              )}

              {error && (
                <div style={s.errorBanner} className="fade-in">
                  ⚠️ {error}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={s.inputRow}>
              <div style={s.inputWrap}>
                <textarea
                  style={s.textarea}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={`Ask about ${subject}... (Enter to send)`}
                  rows={1}
                />
                <button
                  style={{ ...s.sendBtn, ...((!input.trim() || loading) ? s.sendBtnDisabled : {}) }}
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="pulse"
                >
                  {loading ? <span className="spin" style={s.spinner} /> : '➤'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quiz'       && <QuizView />}
        {activeTab === 'rag'        && <RAGView />}
        {activeTab === 'flashcards' && <FlashcardsView />}
        {activeTab === 'notebook'   && <Notebook />}
        {activeTab === 'roadmap'    && <RoadmapView />}
        {activeTab === 'progress'   && <ProgressView />}
      </main>
    </div>
  )
}

function getSuggestions(subject) {
  const map = {
    'Data Structures': ['Explain linked lists with examples', 'What is a binary search tree?', 'How does a hash table work?'],
    'Algorithms': ['What is Big O notation?', 'Explain merge sort step by step', 'What is dynamic programming?'],
    'Machine Learning': ['What is gradient descent?', 'Explain overfitting and underfitting', 'What is a neural network?'],
    'Operating Systems': ['What is a deadlock?', 'Explain process scheduling', 'What is virtual memory?'],
    'Databases': ['What is normalization?', 'Explain ACID properties', 'What is an index in SQL?'],
  }
  return map[subject] || ['Explain the core concepts', 'Give me a real-world example', 'What should I learn first?']
}

const s = {
  shell: { display: 'flex', height: '100vh', fontFamily: "'Inter', system-ui, sans-serif", background: 'var(--bg)', overflow: 'hidden', position: 'relative' },

  // Sidebar
  sidebar: { background: 'var(--sidebar-bg)', display: 'flex', flexDirection: 'column', padding: '20px 12px', gap: 12, flexShrink: 0, borderRight: '1px solid var(--border)', transition: 'width 0.3s ease', overflow: 'hidden', position: 'relative', zIndex: 10 },
  logoRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  logo: { display: 'flex', alignItems: 'center', gap: 8 },
  logoIcon: { fontSize: 22 },
  logoText: { fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' },
  collapseBtn: { background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  glowLine: { height: 1, background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)', margin: '4px 0' },
  profile: { borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0 },
  profileInfo: { overflow: 'hidden' },
  profileName: { fontSize: 13, fontWeight: 700, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  profileMeta: { fontSize: 11, color: '#64748b', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  nav: { display: 'flex', flexDirection: 'column', gap: 2, flex: 1 },
  navItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, color: '#64748b', fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', background: 'transparent', width: '100%', textAlign: 'left', position: 'relative', overflow: 'hidden' },
  navActive: { background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' },
  navIcon: { fontSize: 16, flexShrink: 0 },
  navLabel: { fontSize: 13, fontWeight: 500 },
  navPing: { marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 6px #6366f1' },
  sidebarBottom: { display: 'flex', flexDirection: 'column', gap: 6 },
  themeRow: { display: 'flex', gap: 6, marginBottom: 4 },
  themeBtn: { flex: 1, padding: '7px 4px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.2s ease' },
  outlineBtn: { background: 'transparent', border: '1px solid rgba(99,102,241,0.25)', color: '#64748b', borderRadius: 8, padding: '8px 12px', fontSize: 12, cursor: 'pointer', textAlign: 'left', width: '100%' },
  dangerBtn: { background: 'transparent', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', borderRadius: 8, padding: '8px 12px', fontSize: 12, cursor: 'pointer', textAlign: 'left', width: '100%' },
  iconBtn: { background: 'transparent', border: '1px solid rgba(99,102,241,0.2)', color: '#64748b', borderRadius: 8, padding: '8px', fontSize: 16, cursor: 'pointer', width: '100%' },

  // Main
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1 },
  chatWrap: { display: 'flex', flexDirection: 'column', height: '100%' },

  // Header
  header: { padding: '16px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--header-bg)', backdropFilter: 'blur(20px)', flexShrink: 0 },
  headerLeft: {},
  headerTitle: { fontWeight: 700, fontSize: 16, color: '#e2e8f0' },
  headerSub: { fontSize: 12, color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' },
  headerRight: {},
  statusBadge: { display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#22c55e', fontWeight: 600 },
  statusDot: { width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' },

  // Messages
  messages: { flex: 1, overflowY: 'auto', padding: '28px', display: 'flex', flexDirection: 'column', gap: 16 },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40, gap: 12 },
  emptyOrb: { fontSize: 64, animation: 'float 3s ease-in-out infinite', display: 'block' },
  emptyTitle: { fontSize: 22, fontWeight: 700, color: '#e2e8f0', marginTop: 8 },
  emptySub: { fontSize: 14, color: '#64748b' },
  suggestions: { display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 420, marginTop: 8 },
  suggestion: { background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12, padding: '11px 16px', fontSize: 13, color: '#a5b4fc', cursor: 'pointer', textAlign: 'left', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 },
  suggestionArrow: { color: '#6366f1', fontWeight: 700 },

  bubble: { maxWidth: '74%', borderRadius: 16, padding: '12px 16px' },
  userBubble: { alignSelf: 'flex-end', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' },
  aiBubble: { alignSelf: 'flex-start', background: 'var(--bubble-ai)', border: '1px solid var(--border)', color: 'var(--text)', backdropFilter: 'blur(10px)' },
  bubbleRole: { marginBottom: 6 },
  userRole: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 },
  aiRole: { fontSize: 11, fontWeight: 700, color: '#a5b4fc', letterSpacing: 0.5 },
  bubbleText: { fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' },
  errorBanner: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: 10, padding: '10px 16px', fontSize: 13 },

  // Input
  inputRow: { padding: '16px 28px', borderTop: '1px solid var(--border)', background: 'var(--header-bg)', backdropFilter: 'blur(20px)', flexShrink: 0 },
  inputWrap: { display: 'flex', gap: 10, alignItems: 'flex-end', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 16, padding: '8px 8px 8px 16px' },
  textarea: { flex: 1, background: 'transparent', border: 'none', color: '#e2e8f0', fontSize: 14, resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6, maxHeight: 120, padding: '4px 0' },
  sendBtn: { width: 40, height: 40, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 16, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  spinner: { width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block' },
}
