import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Alert from '../components/Alert'
import { LoadingSpinner } from '../components/LoadingSpinner'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      navigate(user?.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-void">

      {/* ── Left panel ─────────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-5/12 relative overflow-hidden p-10"
        style={{
          background: 'linear-gradient(160deg, #08080D 0%, #0D0E16 60%, #0A0C14 100%)',
          borderRight: '1px solid rgba(201,151,58,0.1)',
        }}
      >
        {/* Grid background */}
        <div className="absolute inset-0 bg-grid pointer-events-none" />

        {/* Radial glow */}
        <div className="absolute bottom-0 left-0 w-80 h-80 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 20% 80%, rgba(201,151,58,0.07) 0%, transparent 60%)' }} />

        {/* Top art deco corner */}
        <div className="absolute top-6 right-6 w-10 h-10 pointer-events-none"
          style={{ borderTop: '1px solid rgba(201,151,58,0.25)', borderRight: '1px solid rgba(201,151,58,0.25)' }} />
        <div className="absolute bottom-6 left-6 w-10 h-10 pointer-events-none"
          style={{ borderBottom: '1px solid rgba(201,151,58,0.25)', borderLeft: '1px solid rgba(201,151,58,0.25)' }} />

        {/* Logo */}
        <Link to="/" className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center shadow-gold">
            <span className="font-display text-xs font-bold text-[#0C0800]">SL</span>
          </div>
          <div>
            <p className="font-display text-chalk text-sm font-semibold tracking-[0.12em]">SAFELEDGER</p>
            <p className="font-display text-[0.55rem] tracking-[0.15em]" style={{ color: 'rgba(201,151,58,0.55)' }}>DIGITAL VAULT</p>
          </div>
        </Link>

        {/* Main copy */}
        <div className="relative z-10">
          <div className="gold-rule mb-8 max-w-[160px]"><span className="text-gold opacity-50 text-xs">◆</span></div>

          <h2 className="font-display text-4xl font-bold text-chalk leading-tight mb-5">
            Welcome back<br/>to premium<br/><span className="gold-text">finance.</span>
          </h2>
          <p className="text-smoke text-sm leading-relaxed mb-10 max-w-xs">
            Manage your multi-currency wallets, send money globally, and exchange currencies — all in one secure vault.
          </p>

          <div className="space-y-3">
            {[
              'Mid-market rates — no hidden spread',
              'AES-256 encryption + MFA on every account',
              'P2P settlement in under 3 seconds',
              'Free accounts, zero conversion fees',
            ].map(item => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(201,151,58,0.1)', border: '1px solid rgba(201,151,58,0.25)' }}>
                  <svg className="w-2.5 h-2.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-smoke text-xs">{item}</span>
              </div>
            ))}
          </div>

          <div className="gold-rule mt-8 max-w-[160px]"><span className="text-gold opacity-50 text-xs">◆</span></div>
        </div>

        <p className="relative z-10 font-display text-ember text-[0.58rem] tracking-[0.15em] uppercase">
          © {new Date().getFullYear()} SafeLedger. All rights reserved.
        </p>
      </div>

      {/* ── Right panel ────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 relative">
        {/* Subtle background */}
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

        <div className="relative w-full max-w-sm animate-fade-up">

          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
              <span className="font-display text-[10px] font-bold text-[#0C0800]">SL</span>
            </div>
            <span className="font-display text-chalk text-sm tracking-[0.12em]">SAFELEDGER</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <p className="font-display text-[0.6rem] tracking-[0.25em] uppercase mb-3"
              style={{ color: 'rgba(201,151,58,0.6)' }}>Welcome Back</p>
            <h1 className="font-display text-3xl font-bold text-chalk tracking-wide mb-2">Sign In</h1>
            <p className="text-smoke text-sm">
              No account?{' '}
              <Link to="/register" className="text-gold hover:text-gold-light transition-colors font-medium">
                Create one free
              </Link>
            </p>
          </div>


          {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ember pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="you@example.com" required className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Password</label>
                <a href="#" className="font-display text-[0.58rem] tracking-wider uppercase text-gold hover:text-gold-light transition-colors">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ember pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPass ? 'text' : 'password'} name="password" value={form.password}
                  onChange={handleChange} placeholder="Your password" required className="input-field pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ember hover:text-smoke transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPass
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                    }
                  </svg>
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full btn-gold py-3.5 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : null}
              {loading ? 'Signing in...' : 'Sign In to Vault'}
            </button>
          </form>

          {/* Footer currencies */}
          <div className="mt-10 pt-8" style={{ borderTop: '1px solid rgba(201,151,58,0.08)' }}>
            <p className="font-display text-ember text-[0.58rem] tracking-[0.15em] uppercase text-center mb-4">
              Supported Currencies
            </p>
            <div className="flex gap-2 justify-center">
              {['PKR', 'USD', 'EUR', 'GBP', 'AED'].map(c => (
                <div key={c} className="px-3 py-1.5 rounded-lg"
                  style={{ background: 'rgba(201,151,58,0.05)', border: '1px solid rgba(201,151,58,0.12)' }}>
                  <p className="font-display text-gold text-[0.6rem] tracking-wider">{c}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
