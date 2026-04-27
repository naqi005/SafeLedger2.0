import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { userApi } from '../services/api'
import Alert from '../components/Alert'
import Modal from '../components/Modal'
import { LoadingSpinner } from '../components/LoadingSpinner'

function Section({ title, children }) {
  return (
    <div className="card space-y-4">
      <p className="font-display text-[0.62rem] tracking-[0.2em] uppercase text-smoke pb-3"
        style={{ borderBottom: '1px solid rgba(201,151,58,0.08)' }}>
        {title}
      </p>
      {children}
    </div>
  )
}

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [pwForm, setPwForm] = useState({ current: '', newPass: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)

  const handleProfileSave = async () => {
    setSaving(true)
    try {
      await userApi.updateProfile(form)
    } catch {}
    updateUser(form)
    setEditing(false)
    setAlert({ type: 'success', msg: 'Profile updated successfully!' })
    setSaving(false)
  }

  const handlePasswordChange = async () => {
    if (pwForm.newPass !== pwForm.confirm) { setAlert({ type: 'error', msg: 'New passwords do not match.' }); return }
    if (pwForm.newPass.length < 6) { setAlert({ type: 'error', msg: 'Password must be at least 6 characters.' }); return }
    setSaving(true)
    try {
      await userApi.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.newPass })
      setPwOpen(false)
      setPwForm({ current: '', newPass: '', confirm: '' })
      setAlert({ type: 'success', msg: 'Password changed successfully!' })
    } catch (err) {
      setAlert({ type: 'error', msg: err.response?.data?.message || 'Password change failed.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-5 sm:p-6 space-y-6 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <p className="font-display text-[0.6rem] tracking-[0.25em] uppercase mb-1"
          style={{ color: 'rgba(201,151,58,0.6)' }}>Account</p>
        <h2 className="font-display text-chalk text-xl font-bold tracking-wide">My Profile</h2>
      </div>

      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      {/* ── Profile Hero ────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-8"
        style={{
          background: 'linear-gradient(135deg, #0A0B0F 0%, #0F1018 50%, #0D0E15 100%)',
          border: '1px solid rgba(201,151,58,0.15)',
        }}>
        <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(201,151,58,0.4), transparent)' }} />
        <div className="absolute top-4 left-4 w-5 h-5 pointer-events-none"
          style={{ borderTop: '1px solid rgba(201,151,58,0.3)', borderLeft: '1px solid rgba(201,151,58,0.3)' }} />
        <div className="absolute bottom-4 right-4 w-5 h-5 pointer-events-none"
          style={{ borderBottom: '1px solid rgba(201,151,58,0.3)', borderRight: '1px solid rgba(201,151,58,0.3)' }} />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl gold-gradient flex items-center justify-center shadow-gold">
              <span className="font-display text-3xl font-black text-[#0C0800]">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            {user?.role === 'admin' && (
              <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(201,151,58,0.9)' }}>
                <span className="font-display text-[0.5rem] tracking-widest uppercase text-[#0C0800] font-bold">Admin</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-chalk text-2xl font-bold tracking-wide truncate">{user?.name}</h3>
            <p className="font-mono-custom text-smoke text-sm mt-0.5 truncate">{user?.email}</p>
            {user?.phone && <p className="font-mono-custom text-ember text-xs mt-1">{user.phone}</p>}
          </div>

          {/* Edit button */}
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn-outline text-xs py-2 px-4 flex items-center gap-2 shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="font-display tracking-wider uppercase text-[0.6rem]">Edit</span>
            </button>
          )}
        </div>

        {/* Edit form */}
        {editing && (
          <div className="relative mt-6 pt-5 space-y-4" style={{ borderTop: '1px solid rgba(201,151,58,0.1)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  type="tel" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+92 300 1234567"
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditing(false)} className="btn-outline text-sm py-2 px-5">Cancel</button>
              <button onClick={handleProfileSave} disabled={saving} className="btn-gold text-sm py-2 px-6 flex items-center gap-2">
                {saving && <LoadingSpinner size="sm" />}
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Stat pills */}
        {!editing && (
          <div className="relative mt-5 pt-5 grid grid-cols-2 gap-3" style={{ borderTop: '1px solid rgba(201,151,58,0.08)' }}>
            {[
              { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently' },
              { label: 'Account Type', value: (user?.role || 'Standard').charAt(0).toUpperCase() + (user?.role || 'Standard').slice(1) },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(201,151,58,0.08)' }}>
                <p className="font-display text-[0.55rem] tracking-[0.15em] uppercase text-ember mb-1">{s.label}</p>
                <p className="font-display text-chalk text-sm font-semibold">{s.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Account Details ──────────────────────────────────────────────── */}
      <Section title="Account Details">
        <div className="space-y-0">
          {[
            { label: 'Email', value: user?.email, badge: 'badge-success', badgeText: 'Verified' },
            { label: 'User ID', value: `#${(user?._id || user?.id || Math.random().toString(36).slice(2, 10)).slice(-8).toUpperCase()}` },
            { label: 'Role', value: user?.role || 'user' },
          ].map((row, i) => (
            <div key={row.label}
              className="flex items-center justify-between py-3.5"
              style={{ borderBottom: i < 2 ? '1px solid rgba(201,151,58,0.06)' : 'none' }}>
              <span className="font-display text-[0.6rem] tracking-[0.15em] uppercase text-smoke">{row.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono-custom text-chalk text-xs">{row.value}</span>
                {row.badge && <span className={row.badge}>{row.badgeText}</span>}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Security ─────────────────────────────────────────────────────── */}
      <Section title="Security">
        <div className="space-y-3">
          {/* Password row */}
          <div className="flex items-center justify-between p-4 rounded-xl transition-colors"
            style={{ background: 'rgba(15,16,21,0.8)', border: '1px solid rgba(201,151,58,0.08)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(201,151,58,0.06)', border: '1px solid rgba(201,151,58,0.12)' }}>
                <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="font-display text-chalk text-xs font-semibold tracking-wide">Password</p>
                <p className="font-mono-custom text-ember text-[0.65rem]">Last changed recently</p>
              </div>
            </div>
            <button onClick={() => setPwOpen(true)} className="btn-outline text-xs py-1.5 px-4">
              <span className="font-display tracking-wider uppercase text-[0.6rem]">Change</span>
            </button>
          </div>

          {/* 2FA row */}
          <div className="flex items-center justify-between p-4 rounded-xl"
            style={{ background: 'rgba(15,16,21,0.8)', border: '1px solid rgba(201,151,58,0.08)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(201,151,58,0.06)', border: '1px solid rgba(201,151,58,0.12)' }}>
                <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="font-display text-chalk text-xs font-semibold tracking-wide">Two-Factor Auth</p>
                <p className="font-mono-custom text-ember text-[0.65rem]">Extra layer of protection</p>
              </div>
            </div>
            <span className="badge-info">Soon</span>
          </div>
        </div>
      </Section>

      {/* ── Danger Zone ──────────────────────────────────────────────────── */}
      <div className="card" style={{ borderColor: 'rgba(239,68,68,0.15)' }}>
        <p className="font-display text-[0.62rem] tracking-[0.2em] uppercase pb-3 mb-4"
          style={{ color: 'rgba(248,113,113,0.7)', borderBottom: '1px solid rgba(239,68,68,0.08)' }}>
          Danger Zone
        </p>
        <p className="text-smoke text-xs leading-relaxed mb-5 max-w-sm">
          Once deleted, your account, all wallets, and transaction history are permanently removed. There is no going back.
        </p>
        <button
          className="font-display text-[0.6rem] tracking-wider uppercase px-5 py-2.5 rounded-xl transition-all duration-200"
          style={{ border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          Delete Account
        </button>
      </div>

      {/* ── Change Password Modal ─────────────────────────────────────────── */}
      <Modal isOpen={pwOpen} onClose={() => setPwOpen(false)} title="Change Password">
        <div className="space-y-4">
          {[
            { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
            { key: 'newPass', label: 'New Password', placeholder: 'At least 6 characters' },
            { key: 'confirm', label: 'Confirm New Password', placeholder: 'Re-enter new password' },
          ].map(f => (
            <div key={f.key}>
              <label className="label">{f.label}</label>
              <input
                type="password"
                value={pwForm[f.key]}
                onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="input-field"
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setPwOpen(false)} className="flex-1 btn-outline">Cancel</button>
            <button onClick={handlePasswordChange} disabled={saving} className="flex-1 btn-gold flex items-center justify-center gap-2">
              {saving && <LoadingSpinner size="sm" />}
              Update Password
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
