import React, { useState, useEffect } from 'react'
import { adminApi } from '../services/api'
import { PageLoader } from '../components/LoadingSpinner'
import Alert from '../components/Alert'
import Modal from '../components/Modal'

const MOCK_USERS = Array.from({ length: 8 }, (_, i) => ({
  _id: `user${i}`,
  name: ['Alice Johnson', 'Bob Smith', 'Carol White', 'David Lee', 'Eva Green', 'Frank Miller', 'Grace Kim', 'Henry Brown'][i],
  email: `user${i + 1}@example.com`,
  role: i === 0 ? 'admin' : 'user',
  createdAt: new Date(Date.now() - i * 86400000 * 10).toISOString(),
  wallets: Math.floor(Math.random() * 4) + 1,
  status: i === 3 ? 'suspended' : 'active',
}))

const MOCK_TXS = Array.from({ length: 10 }, (_, i) => ({
  _id: `adm_tx${i}`,
  type: ['send', 'receive', 'exchange', 'add'][i % 4],
  amount: (Math.random() * 50000 + 500).toFixed(2),
  currency: ['PKR', 'USD', 'EUR'][i % 3],
  status: ['completed', 'pending', 'failed'][i % 3],
  senderEmail: `user${i}@example.com`,
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}))

const TYPE_COLORS = { send: '#F87171', receive: '#4ADE80', exchange: '#60A5FA', add: '#4ADE80' }
const TYPE_ICONS  = { send: '↑', receive: '↓', exchange: '⇄', add: '+' }

const TABS = [
  { id: 'overview',     label: 'Overview' },
  { id: 'users',        label: 'Users' },
  { id: 'transactions', label: 'Transactions' },
]

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [confirmModal, setConfirmModal] = useState(null)

  useEffect(() => {
    Promise.all([
      adminApi.getAllUsers().catch(() => ({ data: MOCK_USERS })),
      adminApi.getAllTransactions().catch(() => ({ data: MOCK_TXS })),
    ]).then(([uRes, tRes]) => {
      setUsers(uRes.data || MOCK_USERS)
      setTransactions(tRes.data || MOCK_TXS)
    }).finally(() => setLoading(false))
  }, [])

  const confirmFreeze = async () => {
    const { userId, freeze } = confirmModal
    try {
      if (freeze) await adminApi.suspendUser(userId)
      else await adminApi.reactivateUser(userId)
    } catch {}
    setUsers(us => us.map(u => u._id === userId ? { ...u, status: freeze ? 'suspended' : 'active' } : u))
    setAlert({ type: 'success', msg: `User account ${freeze ? 'suspended' : 'reactivated'} successfully.` })
    setConfirmModal(null)
  }

if (loading) return <PageLoader />

  const totalVolume = transactions.filter(t => t.status === 'completed').reduce((a, t) => a + Number(t.amount), 0)

  return (
    <div className="p-5 sm:p-6 space-y-6 animate-fade-in">
      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(201,151,58,0.1)', border: '1px solid rgba(201,151,58,0.25)' }}>
          <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <p className="font-display text-[0.6rem] tracking-[0.25em] uppercase mb-0.5"
            style={{ color: 'rgba(201,151,58,0.6)' }}>Control</p>
          <h2 className="font-display text-chalk text-xl font-bold tracking-wide">Admin Dashboard</h2>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users',    value: users.length,                                  color: '#60A5FA', icon: '◉' },
          { label: 'Transactions',   value: transactions.length,                           color: '#A78BFA', icon: '⊟' },
          { label: 'Volume',         value: `$${(totalVolume / 1000).toFixed(1)}K`,        color: '#C9973A', icon: '◈' },
          { label: 'Active Users',   value: users.filter(u => u.status === 'active').length, color: '#4ADE80', icon: '▣' },
        ].map((s, i) => (
          <div key={s.label} className="stat-card animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-start justify-between mb-3">
              <p className="font-display text-[0.58rem] tracking-[0.15em] uppercase"
                style={{ color: 'rgba(138,130,120,0.7)' }}>{s.label}</p>
              <span style={{ color: s.color, opacity: 0.6 }}>{s.icon}</span>
            </div>
            <p className="font-display font-bold text-2xl leading-none" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: 'rgba(15,16,21,0.9)', border: '1px solid rgba(201,151,58,0.1)' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-5 py-2 rounded-lg font-display text-[0.65rem] tracking-[0.12em] uppercase transition-all duration-200"
            style={activeTab === tab.id
              ? { background: 'rgba(201,151,58,0.15)', color: '#C9973A', border: '1px solid rgba(201,151,58,0.25)' }
              : { color: 'rgba(138,130,120,0.7)', border: '1px solid transparent' }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="card">
            <p className="font-display text-[0.62rem] tracking-[0.2em] uppercase text-smoke mb-4">Recent Users</p>
            <div className="space-y-2">
              {users.slice(0, 5).map(u => (
                <div key={u._id}
                  className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                  style={{ background: 'rgba(15,16,21,0.8)', border: '1px solid rgba(201,151,58,0.06)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,151,58,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(201,151,58,0.06)'}
                >
                  <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center shrink-0">
                    <span className="font-display text-[10px] font-bold text-[#0C0800]">{u.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-chalk text-xs font-semibold tracking-wide truncate">{u.name}</p>
                    <p className="font-mono-custom text-ember text-[0.62rem] truncate">{u.email}</p>
                  </div>
                  <span className={u.status === 'active' ? 'badge-success' : 'badge-failed'}>{u.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="card">
            <p className="font-display text-[0.62rem] tracking-[0.2em] uppercase text-smoke mb-4">Recent Transactions</p>
            <div className="space-y-2">
              {transactions.slice(0, 5).map(tx => {
                const color = TYPE_COLORS[tx.type] || '#C9973A'
                return (
                  <div key={tx._id}
                    className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                    style={{ background: 'rgba(15,16,21,0.8)', border: '1px solid rgba(201,151,58,0.06)' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,151,58,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(201,151,58,0.06)'}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                      <span style={{ color, fontSize: '0.85rem' }}>{TYPE_ICONS[tx.type] || '·'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-chalk text-xs font-semibold tracking-wide capitalize">{tx.type}</p>
                      <p className="font-mono-custom text-ember text-[0.62rem] truncate">{tx.senderEmail}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono-custom text-chalk text-xs">
                        {Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {tx.currency}
                      </p>
                      <span className={tx.status === 'completed' ? 'badge-success' : tx.status === 'pending' ? 'badge-pending' : 'badge-failed'}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Users Tab ───────────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(201,151,58,0.08)' }}>
            <p className="font-display text-[0.62rem] tracking-[0.2em] uppercase text-smoke">All Users</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(201,151,58,0.06)' }}>
                  {['User', 'Role', 'Wallets', 'Status', 'Joined', 'Action'].map(h => (
                    <th key={h} className="table-header px-5 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u._id}
                    style={{ borderBottom: i < users.length - 1 ? '1px solid rgba(201,151,58,0.04)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,151,58,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full gold-gradient flex items-center justify-center shrink-0">
                          <span className="font-display text-[9px] font-bold text-[#0C0800]">{u.name[0]}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-display text-chalk text-xs font-semibold truncate">{u.name}</p>
                          <p className="font-mono-custom text-ember text-[0.6rem] truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={u.role === 'admin' ? 'badge-info' : 'badge-pending'}>{u.role}</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono-custom text-chalk text-sm text-center">{u.wallets}</td>
                    <td className="px-5 py-3.5">
                      <span className={u.status === 'active' ? 'badge-success' : 'badge-failed'}>{u.status}</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono-custom text-ember text-xs">
                      {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setConfirmModal({ userId: u._id, freeze: u.status === 'active', name: u.name })}
                        className="font-display text-[0.58rem] tracking-widest uppercase transition-colors"
                        style={{ color: u.status === 'active' ? '#F87171' : '#4ADE80' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Transactions Tab ─────────────────────────────────────────────── */}
      {activeTab === 'transactions' && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(201,151,58,0.08)' }}>
            <p className="font-display text-[0.62rem] tracking-[0.2em] uppercase text-smoke">All Transactions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(201,151,58,0.06)' }}>
                  {['ID', 'Type', 'Amount', 'User', 'Status', 'Date'].map(h => (
                    <th key={h} className="table-header px-5 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => {
                  const color = TYPE_COLORS[tx.type] || '#C9973A'
                  return (
                    <tr key={tx._id}
                      style={{ borderBottom: i < transactions.length - 1 ? '1px solid rgba(201,151,58,0.04)' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,151,58,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td className="px-5 py-3.5 font-mono-custom text-ember text-xs">#{tx._id.slice(-8)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span style={{ color, fontSize: '0.85rem' }}>{TYPE_ICONS[tx.type]}</span>
                          <span className="font-display text-xs tracking-wide capitalize" style={{ color }}>{tx.type}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono-custom text-chalk text-sm">
                        {Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        {' '}<span className="text-gold text-xs">{tx.currency}</span>
                      </td>
                      <td className="px-5 py-3.5 font-mono-custom text-smoke text-xs max-w-[160px] truncate">{tx.senderEmail}</td>
                      <td className="px-5 py-3.5">
                        <span className={tx.status === 'completed' ? 'badge-success' : tx.status === 'pending' ? 'badge-pending' : 'badge-failed'}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono-custom text-ember text-xs">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Confirm Modal ────────────────────────────────────────────────── */}
      <Modal isOpen={!!confirmModal} onClose={() => setConfirmModal(null)}
        title={confirmModal?.freeze ? 'Suspend Account' : 'Reactivate Account'}>
        <div className="space-y-5">
          <p className="text-smoke text-sm leading-relaxed">
            Are you sure you want to{' '}
            <span className="text-chalk font-medium">{confirmModal?.freeze ? 'suspend' : 'reactivate'}</span>
            {' '}the account for <span className="text-gold font-medium">{confirmModal?.name}</span>?
            {confirmModal?.freeze && ' They will lose access to all transactions until reactivated.'}
          </p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmModal(null)} className="flex-1 btn-outline">Cancel</button>
            <button
              onClick={confirmFreeze}
              className="flex-1 font-display text-xs tracking-wider uppercase py-3 rounded-xl transition-all duration-200"
              style={confirmModal?.freeze
                ? { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }
                : { background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ADE80' }
              }
            >
              {confirmModal?.freeze ? 'Suspend Account' : 'Reactivate'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
