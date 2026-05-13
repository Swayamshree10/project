// pages/Login.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useLearnStore from '../store/useLearnStore'

// ── Animated Canvas Background ──────────────────────────────────────────────
function AnimatedBG() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let W, H, animId, t = 0

    function resize() {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Nodes for network graph
    const nodes = Array.from({ length: 28 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r: 2 + Math.random() * 3,
      pulse: Math.random() * Math.PI * 2,
    }))

    // Shooting stars
    const stars = Array.from({ length: 6 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H * 0.5,
      len: 80 + Math.random() * 120,
      speed: 4 + Math.random() * 6,
      opacity: 0,
      active: false,
      timer: Math.random() * 200,
    }))

    // Orbiting rings
    const rings = [
      { cx: W * 0.12, cy: H * 0.2,  r: 90,  speed: 0.008, color: '#6366f1', angle: 0 },
      { cx: W * 0.88, cy: H * 0.75, r: 120, speed: 0.006, color: '#8b5cf6', angle: 2 },
      { cx: W * 0.5,  cy: H * 0.85, r: 70,  speed: 0.012, color: '#06b6d4', angle: 4 },
    ]

    function draw() {
      t += 0.01
      ctx.clearRect(0, 0, W, H)

      // ── Background gradient ──
      const bg = ctx.createRadialGradient(W * 0.3, H * 0.3, 0, W * 0.5, H * 0.5, W * 0.8)
      bg.addColorStop(0, 'rgba(15,10,40,1)')
      bg.addColorStop(0.5, 'rgba(8,8,20,1)')
      bg.addColorStop(1, 'rgba(5,5,15,1)')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // ── Animated wave bands ──
      for (let i = 0; i < 4; i++) {
        ctx.beginPath()
        ctx.moveTo(0, H * 0.3 + i * 60)
        for (let x = 0; x <= W; x += 4) {
          const y = H * 0.3 + i * 60 + Math.sin((x / W) * Math.PI * 3 + t + i) * 30
          ctx.lineTo(x, y)
        }
        ctx.strokeStyle = `rgba(99,102,241,${0.04 - i * 0.008})`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // ── Orbiting rings ──
      rings.forEach(ring => {
        ring.angle += ring.speed
        // Ring itself
        ctx.beginPath()
        ctx.arc(ring.cx, ring.cy, ring.r, 0, Math.PI * 2)
        ctx.strokeStyle = ring.color + '22'
        ctx.lineWidth = 1
        ctx.stroke()
        // Orbiting dot
        const ox = ring.cx + Math.cos(ring.angle) * ring.r
        const oy = ring.cy + Math.sin(ring.angle) * ring.r
        ctx.beginPath()
        ctx.arc(ox, oy, 4, 0, Math.PI * 2)
        ctx.fillStyle = ring.color
        ctx.shadowBlur = 12
        ctx.shadowColor = ring.color
        ctx.fill()
        ctx.shadowBlur = 0
        // Trailing arc
        ctx.beginPath()
        ctx.arc(ring.cx, ring.cy, ring.r, ring.angle - 1.2, ring.angle)
        ctx.strokeStyle = ring.color + '88'
        ctx.lineWidth = 2
        ctx.stroke()
      })

      // ── Network nodes + connections ──
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy
        n.pulse += 0.04
        if (n.x < 0 || n.x > W) n.vx *= -1
        if (n.y < 0 || n.y > H) n.vy *= -1
      })

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y)
          if (d < 130) {
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(99,102,241,${0.18 * (1 - d / 130)})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      // Draw nodes
      nodes.forEach(n => {
        const pulse = 0.5 + 0.5 * Math.sin(n.pulse)
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r + pulse, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(139,92,246,${0.5 + pulse * 0.4})`
        ctx.shadowBlur = 8 * pulse
        ctx.shadowColor = '#6366f1'
        ctx.fill()
        ctx.shadowBlur = 0
      })

      // ── Shooting stars ──
      stars.forEach(star => {
        star.timer--
        if (star.timer <= 0 && !star.active) {
          star.x = Math.random() * W
          star.y = Math.random() * H * 0.4
          star.opacity = 1
          star.active = true
          star.timer = 0
        }
        if (star.active) {
          star.x += star.speed * 2
          star.y += star.speed
          star.opacity -= 0.018
          if (star.opacity <= 0) {
            star.active = false
            star.timer = 100 + Math.random() * 200
          }
          const grad = ctx.createLinearGradient(star.x, star.y, star.x - star.len, star.y - star.len * 0.5)
          grad.addColorStop(0, `rgba(255,255,255,${star.opacity})`)
          grad.addColorStop(1, 'rgba(255,255,255,0)')
          ctx.beginPath()
          ctx.moveTo(star.x, star.y)
          ctx.lineTo(star.x - star.len, star.y - star.len * 0.5)
          ctx.strokeStyle = grad
          ctx.lineWidth = 1.5
          ctx.stroke()
          // Star head glow
          ctx.beginPath()
          ctx.arc(star.x, star.y, 2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,255,255,${star.opacity})`
          ctx.fill()
        }
      })

      // ── Floating glowing orbs ──
      const orbs = [
        { x: W * 0.1 + Math.sin(t * 0.5) * 60,  y: H * 0.15 + Math.cos(t * 0.3) * 40,  r: 180, color: '99,102,241' },
        { x: W * 0.9 + Math.cos(t * 0.4) * 50,  y: H * 0.8  + Math.sin(t * 0.6) * 50,  r: 200, color: '139,92,246' },
        { x: W * 0.5 + Math.sin(t * 0.7) * 80,  y: H * 0.5  + Math.cos(t * 0.5) * 60,  r: 150, color: '6,182,212'  },
      ]
      orbs.forEach(orb => {
        const g = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r)
        g.addColorStop(0, `rgba(${orb.color},0.12)`)
        g.addColorStop(1, `rgba(${orb.color},0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2)
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0 }} />
}

// ── Typewriter ──────────────────────────────────────────────────────────────
function Typewriter({ texts }) {
  const [display, setDisplay] = useState('')
  const [idx, setIdx] = useState(0)
  const [typing, setTyping] = useState(true)
  const [charIdx, setCharIdx] = useState(0)
  useEffect(() => {
    const current = texts[idx]
    let t
    if (typing) {
      if (charIdx < current.length) t = setTimeout(() => { setDisplay(current.slice(0, charIdx + 1)); setCharIdx(c => c + 1) }, 65)
      else t = setTimeout(() => setTyping(false), 2000)
    } else {
      if (charIdx > 0) t = setTimeout(() => { setDisplay(current.slice(0, charIdx - 1)); setCharIdx(c => c - 1) }, 35)
      else { setIdx(i => (i + 1) % texts.length); setTyping(true) }
    }
    return () => clearTimeout(t)
  }, [charIdx, typing, idx])
  return <span><span style={{ color: '#a5b4fc', fontWeight: 600 }}>{display}</span><span style={{ color: '#6366f1', animation: 'blink 1s step-end infinite' }}>|</span></span>
}

const FEATURES = [
  { icon: '🧠', label: 'AI Chat Tutor' },
  { icon: '📊', label: 'Smart Quizzes' },
  { icon: '🃏', label: 'Flashcards'    },
  { icon: '🗺️', label: 'Roadmap'       },
  { icon: '📚', label: 'Doc Q&A'       },
  { icon: '📓', label: 'Notebook'      },
]

export default function Login() {
  const navigate = useNavigate()
  const { setUser, setToken } = useLearnStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState('')

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) return setError('Please fill in all fields.')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) return setError(data.message || 'Login failed.')
      setToken(data.token)
      setUser(data.user)
      if (data.user.onboarded) {
        useLearnStore.setState({ branch: data.user.branch, subject: data.user.subject, level: data.user.level, interests: data.user.interests || [] })
        navigate('/app')
      } else {
        navigate('/onboarding')
      }
    } catch {
      setError('Server error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <AnimatedBG />

      <div style={s.card}>
        <div style={s.topBar} />

        <div style={s.logoRow}>
          <span style={s.logoIcon}>🧠</span>
          <span className="gradient-text" style={s.logoText}>Mind Trail</span>
        </div>

        <div style={s.typeRow}>
          <Typewriter texts={['Learn Engineering with AI', 'Master Any Subject', 'Study Smarter Today', 'Your AI Tutor Awaits']} />
        </div>

        <div style={s.pills}>
          {FEATURES.map(f => (
            <div key={f.label} style={s.pill}>
              <span>{f.icon}</span><span>{f.label}</span>
            </div>
          ))}
        </div>

        <div style={s.divider} />
        <h2 style={s.heading}>Welcome back</h2>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <div style={{ ...s.inputWrap, borderColor: focused === 'email' ? '#6366f1' : 'rgba(99,102,241,0.2)', boxShadow: focused === 'email' ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none' }}>
              <span style={s.inputIcon}>✉️</span>
              <input style={s.input} type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} onFocus={() => setFocused('email')} onBlur={() => setFocused('')} autoFocus />
              {form.email.includes('@') && <span style={s.check}>✓</span>}
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Password</label>
            <div style={{ ...s.inputWrap, borderColor: focused === 'password' ? '#6366f1' : 'rgba(99,102,241,0.2)', boxShadow: focused === 'password' ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none' }}>
              <span style={s.inputIcon}>🔒</span>
              <input style={s.input} type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} onFocus={() => setFocused('password')} onBlur={() => setFocused('')} />
              {form.password.length >= 6 && <span style={s.check}>✓</span>}
            </div>
          </div>

          {error && <div style={s.errorBox}>⚠️ {error}</div>}

          <button style={s.btn} type="submit" disabled={loading}>
            <div style={s.btnShimmer} />
            {loading
              ? <span style={s.loadRow}><span className="spin" style={s.spinner} />Signing in...</span>
              : <span style={s.btnInner}>Sign In <span>→</span></span>
            }
          </button>
        </form>

        <p style={s.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={s.link}>Create one</Link>
        </p>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes topBarFlow { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        @keyframes shimmerBtn { 0%{left:-100%} 100%{left:200%} }
      `}</style>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080810', fontFamily: "'Inter', system-ui, sans-serif", position: 'relative', overflow: 'hidden' },

  card: { width: '100%', maxWidth: 440, borderRadius: 24, padding: '40px 36px', background: 'rgba(10,10,22,0.82)', backdropFilter: 'blur(32px)', border: '1px solid rgba(99,102,241,0.28)', boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 40px rgba(99,102,241,0.08)', position: 'relative', zIndex: 1, overflow: 'hidden' },

  topBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4,#22c55e,#6366f1)', backgroundSize: '200% 100%', animation: 'topBarFlow 3s linear infinite' },

  logoRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  logoIcon: { fontSize: 26 },
  logoText: { fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' },
  typeRow: { fontSize: 13, color: '#475569', marginBottom: 16, minHeight: 20 },

  pills: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  pill: { display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: '#94a3b8' },

  divider: { height: 1, background: 'linear-gradient(90deg,transparent,rgba(99,102,241,0.3),transparent)', margin: '18px 0' },
  heading: { fontSize: 20, fontWeight: 700, color: '#e2e8f0', marginBottom: 20 },

  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: { fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8 },
  inputWrap: { display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(99,102,241,0.06)', border: '1px solid', borderRadius: 12, padding: '0 14px', transition: 'all 0.25s ease' },
  inputIcon: { fontSize: 15, flexShrink: 0 },
  input: { flex: 1, background: 'transparent', border: 'none', color: '#e2e8f0', fontSize: 14, padding: '13px 0', outline: 'none', fontFamily: 'inherit' },
  check: { color: '#22c55e', fontSize: 14, fontWeight: 700 },

  errorBox: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: 10, padding: '10px 14px', fontSize: 13 },

  btn: { padding: '14px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 24px rgba(99,102,241,0.4)', marginTop: 4, position: 'relative', overflow: 'hidden', transition: 'transform 0.15s, box-shadow 0.15s' },
  btnShimmer: { position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)', animation: 'shimmerBtn 2.5s infinite', pointerEvents: 'none' },
  btnInner: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, position: 'relative', zIndex: 1 },
  loadRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, position: 'relative', zIndex: 1 },
  spinner: { width: 17, height: 17, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block' },

  footer: { marginTop: 22, textAlign: 'center', fontSize: 14, color: '#475569' },
  link: { color: '#a5b4fc', fontWeight: 700, textDecoration: 'none' },
}
