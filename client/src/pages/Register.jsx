// pages/Register.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useLearnStore from '../store/useLearnStore'

export default function Register() {
  const navigate = useNavigate()
  const { setUser, setToken } = useLearnStore()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.password) return setError('Please fill in all fields.')
    if (form.password !== form.confirm) return setError('Passwords do not match.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) return setError(data.message || 'Registration failed.')
      setToken(data.token)
      setUser(data.user)
      navigate('/onboarding')
    } catch {
      setError('Server error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.orb1} /><div style={s.orb2} />
      <div style={s.card} className="glass fade-in">
        <div style={s.logoRow}>
          <span style={s.logoIcon}>🧠</span>
          <span className="gradient-text" style={s.logoText}>Mind Trail</span>
        </div>
        <p style={s.subtitle}>Your AI-powered engineering companion</p>
        <div style={s.divider} />
        <h2 style={s.heading}>Create your account</h2>
        <form onSubmit={handleSubmit} style={s.form}>
          {[
            { name: 'name',     type: 'text',     label: 'Full Name',        placeholder: 'John Doe'           },
            { name: 'email',    type: 'email',    label: 'Email',            placeholder: 'you@example.com'    },
            { name: 'password', type: 'password', label: 'Password',         placeholder: 'Min. 6 characters'  },
            { name: 'confirm',  type: 'password', label: 'Confirm Password', placeholder: '••••••••'           },
          ].map(f => (
            <div key={f.name} style={s.field}>
              <label style={s.label}>{f.label}</label>
              <input style={s.input} type={f.type} name={f.name} placeholder={f.placeholder} value={form[f.name]} onChange={handleChange} autoFocus={f.name === 'name'} />
            </div>
          ))}
          {error && <div style={s.error}>⚠️ {error}</div>}
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? <><span className="spin" style={s.spinner} /> Creating account...</> : 'Create Account →'}
          </button>
        </form>
        <p style={s.footer}>
          Already have an account? <Link to="/" style={s.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: "'Inter', system-ui, sans-serif", position: 'relative', overflow: 'hidden', padding: '20px' },
  orb1: { position: 'absolute', top: '-20%', right: '-15%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' },
  orb2: { position: 'absolute', bottom: '-20%', left: '-15%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' },
  card: { width: '100%', maxWidth: 420, borderRadius: 24, padding: '36px 36px 32px', position: 'relative', zIndex: 1 },
  logoRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  logoIcon: { fontSize: 26 },
  logoText: { fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' },
  subtitle: { color: '#64748b', fontSize: 13 },
  divider: { height: 1, background: 'rgba(99,102,241,0.15)', margin: '20px 0' },
  heading: { fontSize: 20, fontWeight: 700, color: '#e2e8f0', marginBottom: 20 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  field: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { padding: '11px 14px', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.05)', color: '#e2e8f0', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' },
  error: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: 10, padding: '10px 14px', fontSize: 13 },
  btn: { padding: '13px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 20px rgba(99,102,241,0.3)' },
  spinner: { width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block' },
  footer: { marginTop: 20, textAlign: 'center', fontSize: 14, color: '#64748b' },
  link: { color: '#a5b4fc', fontWeight: 700, textDecoration: 'none' },
}
