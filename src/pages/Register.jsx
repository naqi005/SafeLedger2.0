import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Alert from '../components/Alert'
import { LoadingSpinner } from '../components/LoadingSpinner'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    if (form.password.length < 6) return 'Password must be at least 6 characters.'
    if (form.password !== form.confirmPassword) return 'Passwords do not match.'
    return null
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const strength = (() => {
    const p = form.password
    if (!p) return 0
    let s = 0
    if (p.length >= 6) s++
    if (p.length >= 10) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()

  const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][strength]
  const strengthColor = ['', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#10B981'][strength]

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
        <div className="absolute inset-0 bg-grid pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 80% 20%, rgba(201,151,58,0.06) 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 20% 80%, rgba(201,151,58,0.05) 0%, transparent 60%)' }} />

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

        {/* Copy */}
        <div className="relative z-10">
          <div className="gold-rule mb-8 max-w-[160px]"><span className="text-gold opacity-50 text-xs">◆</span></div>
          <h2 className="font-display text-4xl font-bold text-chalk leading-tight mb-5">
            Begin your<br />journey to<br /><span className="gold-text">financial freedom.</span>
          </h2>
          <p className="text-smoke text-sm leading-relaxed mb-10 max-w-xs">
            Your vault is live in under 2 minutes. No branch visits, no SWIFT delays, no hidden spreads — 30+ currencies, one account.
          </p>

          <div className="space-y-3">
            {[
              { num: '01', label: 'Open your vault — free, instant, no paperwork' },
              { num: '02', label: 'Fund wallets in PKR, USD, EUR, AED & more' },
              { num: '03', label: 'Send globally at mid-market rates in <3 seconds' },
            ].map(step => (
              <div key={step.num} className="flex items-center gap-4">
                <span className="font-display text-[0.6rem] tracking-[0.15em]" style={{ color: 'rgba(201,151,58,0.4)' }}>
                  {step.num}
                </span>
                <div className="flex-1 h-px" style={{ background: 'rgba(201,151,58,0.12)' }} />
                <span className="text-smoke text-xs">{step.label}</span>
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
      <div className="flex-1 flex items-center justify-center px-6 py-16 relative overflow-y-auto">
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
              style={{ color: 'rgba(201,151,58,0.6)' }}>New Account</p>
            <h1 className="font-display text-3xl font-bold text-chalk tracking-wide mb-2">Create Vault</h1>
            <p className="text-smoke text-sm">
              Already a member?{' '}
              <Link to="/login" className="text-gold hover:text-gold-light transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>

          {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ember pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="Your full name" required className="input-field pl-10"
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Phone */}
            <div>
              <label className="label">Phone <span className="text-ember text-[0.65rem]">(optional)</span></label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ember pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <input
                  type="tel" name="phone" value={form.phone} onChange={handleChange}
                  placeholder="+92 300 1234567" className="input-field pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ember pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPass ? 'text' : 'password'} name="password" value={form.password}
                  onChange={handleChange} placeholder="Minimum 6 characters" required className="input-field pl-10 pr-10"
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

              {form.password && (
                <div className="mt-2.5">
                  <div className="flex gap-1 mb-1.5">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="h-0.5 flex-1 rounded-full transition-all duration-500"
                        style={{ background: i <= strength ? strengthColor : 'rgba(201,151,58,0.1)' }} />
                    ))}
                  </div>
                  <p className="font-display text-[0.6rem] tracking-[0.1em] uppercase" style={{ color: strengthColor }}>
                    {strengthLabel}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ember pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </span>
                <input
                  type={showPass ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword}
                  onChange={handleChange} placeholder="Re-enter password" required className="input-field pl-10 pr-10"
                />
                {form.confirmPassword && (
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {form.password === form.confirmPassword
                      ? <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      : <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    }
                  </span>
                )}
              </div>
            </div>

            <p className="text-smoke text-xs leading-relaxed" style={{ color: 'rgba(138,130,120,0.5)' }}>
              By creating an account you agree to our{' '}
              <a href="#" className="text-gold hover:text-gold-light transition-colors">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-gold hover:text-gold-light transition-colors">Privacy Policy</a>.
            </p>

            <button
              type="submit" disabled={loading}
              className="w-full btn-gold py-3.5 mt-1 flex items-center justify-center gap-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : null}
              {loading ? 'Creating vault...' : 'Open Your Vault'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
