import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { walletApi, transactionApi } from '../services/api'
import WalletCard from '../components/WalletCard'
import { PageLoader } from '../components/LoadingSpinner'
import Alert from '../components/Alert'
import CreditCard from '../components/ui/credit-card-1'

const MOCK_WALLETS = [
  { _id: 'wlt_001', currency: 'PKR', balance: 245800.50, status: 'active' },
  { _id: 'wlt_002', currency: 'USD', balance: 1280.75,   status: 'active' },
  { _id: 'wlt_003', currency: 'EUR', balance: 430.20,    status: 'active' },
]
const MOCK_TXS = [
  { _id: 'tx_abc001', type: 'send',    amount: 5000,  currency: 'PKR', status: 'completed', createdAt: new Date(Date.now()-86400000*0) },
  { _id: 'tx_abc002', type: 'receive', amount: 200,   currency: 'USD', status: 'completed', createdAt: new Date(Date.now()-86400000*1) },
  { _id: 'tx_abc003', type: 'exchange',amount: 100,   currency: 'EUR', status: 'pending',   createdAt: new Date(Date.now()-86400000*2) },
  { _id: 'tx_abc004', type: 'add',     amount: 10000, currency: 'PKR', status: 'completed', createdAt: new Date(Date.now()-86400000*3) },
  { _id: 'tx_abc005', type: 'send',    amount: 75,    currency: 'USD', status: 'failed',    createdAt: new Date(Date.now()-86400000*4) },
]

const STATUS_BADGE = {
  completed: 'badge-success',
  pending:   'badge-pending',
  failed:    'badge-failed',
}
const TYPE_ICON = {
  send: { icon: '↑', color: '#F87171' },
  receive: { icon: '↓', color: '#4ADE80' },
  exchange: { icon: '⇄', color: '#60A5FA' },
  add: { icon: '+', color: '#4ADE80' },
}

function QuickAction({ label, to, icon, accent }) {
  return (
    <Link
      to={to}
      className="group flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 text-center"
      style={{
        background: 'rgba(15,16,21,0.9)',
        border: `1px solid rgba(201,151,58,0.1)`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.border = `1px solid rgba(201,151,58,0.3)`
        e.currentTarget.style.boxShadow = '0 0 24px rgba(201,151,58,0.08)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.border = `1px solid rgba(201,151,58,0.1)`
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
        style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}>
        <span style={{ color: accent, fontSize: '1.1rem', lineHeight: 1 }}>{icon}</span>
      </div>
      <span className="font-display text-[0.65rem] tracking-[0.12em] uppercase text-smoke group-hover:text-chalk transition-colors">
        {label}
      </span>
    </Link>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [wallets, setWallets] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      walletApi.getAll().catch(() => ({ data: MOCK_WALLETS })),
      transactionApi.getAll({ limit: 5 }).catch(() => ({ data: MOCK_TXS })),
    ]).then(([wRes, tRes]) => {
      setWallets(wRes.data || MOCK_WALLETS)
      setTransactions(tRes.data || MOCK_TXS)
    }).catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false))
  }, [])

  const totalUSD = wallets.reduce((acc, w) => {
    const rates = { PKR: 0.0036, USD: 1, EUR: 1.08, GBP: 1.27, AED: 0.27, SAR: 0.27 }
    return acc + (w.balance * (rates[w.currency] || 1))
  }, 0)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  if (loading) return <PageLoader />

  return (
    <div className="p-5 sm:p-6 space-y-6 animate-fade-in">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* ── Portfolio Hero ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-10 sm:py-14 text-center"
        style={{
          background: 'linear-gradient(135deg, #0A0B0F 0%, #0F1018 50%, #0D0E15 100%)',
          border: '1px solid rgba(201,151,58,0.15)',
        }}
      >
        {/* Background grid */}
        <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />

        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-40 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(201,151,58,0.08) 0%, transparent 70%)' }} />

        {/* Top accent */}
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(201,151,58,0.5), transparent)' }} />

        {/* Art Deco corners */}
        <div className="absolute top-4 left-4 w-6 h-6" style={{ borderTop: '1px solid rgba(201,151,58,0.35)', borderLeft: '1px solid rgba(201,151,58,0.35)' }} />
        <div className="absolute top-4 right-4 w-6 h-6" style={{ borderTop: '1px solid rgba(201,151,58,0.35)', borderRight: '1px solid rgba(201,151,58,0.35)' }} />
        <div className="absolute bottom-4 left-4 w-6 h-6" style={{ borderBottom: '1px solid rgba(201,151,58,0.35)', borderLeft: '1px solid rgba(201,151,58,0.35)' }} />
        <div className="absolute bottom-4 right-4 w-6 h-6" style={{ borderBottom: '1px solid rgba(201,151,58,0.35)', borderRight: '1px solid rgba(201,151,58,0.35)' }} />

        <div className="relative z-10">
          <p className="font-display text-smoke text-xs tracking-[0.2em] uppercase mb-2">{greeting},</p>
          <p className="font-display text-chalk text-lg font-semibold tracking-wide mb-6">{user?.name || 'Valued Member'}</p>

          <div className="gold-rule mb-5 max-w-xs mx-auto"><span className="text-gold opacity-50">◆</span></div>

          <p className="font-display text-smoke text-[0.62rem] tracking-[0.25em] uppercase mb-3">Total Portfolio Value</p>
          <p className="font-display font-bold gold-shimmer-text leading-none"
            style={{ fontSize: 'clamp(3rem, 8vw, 5rem)' }}>
            ${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="font-mono-custom text-ember text-xs tracking-wider mt-3">USD Equivalent · {wallets.length} Active Wallets</p>

          <div className="gold-rule mt-5 max-w-xs mx-auto"><span className="text-gold opacity-50">◆</span></div>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Wallets',    value: wallets.length,                  sub: 'Active accounts',   color: '#C9973A', icon: '▣' },
          { label: 'Transactions',     value: transactions.length,             sub: 'Recent activity',   color: '#60A5FA', icon: '⊟' },
          { label: 'Currencies',       value: [...new Set(wallets.map(w => w.currency))].length, sub: 'Held currencies',   color: '#A78BFA', icon: '◈' },
          { label: 'Account Status',   value: 'Active',                        sub: 'All systems go',    color: '#4ADE80', icon: '◉' },
        ].map((s, i) => (
          <div key={s.label} className="stat-card animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-start justify-between mb-3">
              <p className="font-display text-[0.58rem] tracking-[0.15em] uppercase"
                style={{ color: 'rgba(138,130,120,0.7)' }}>{s.label}</p>
              <span className="text-base" style={{ color: s.color, opacity: 0.6 }}>{s.icon}</span>
            </div>
            <p className="font-display text-chalk text-2xl font-bold leading-none" style={{ color: s.color }}>
              {s.value}
            </p>
            <p className="font-mono-custom text-ember text-[0.65rem] mt-1.5 tracking-wide">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ───────────────────────────────────────────────── */}
      <div>
        <p className="font-display text-[0.62rem] tracking-[0.2em] uppercase text-smoke mb-4">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction label="Send Money"   to="/send"         icon="↑" accent="#60A5FA" />
          <QuickAction label="Add Funds"    to="/wallets"      icon="+" accent="#4ADE80" />
          <QuickAction label="Exchange"     to="/exchange"     icon="⇄" accent="#A78BFA" />
          <QuickAction label="History"      to="/transactions" icon="≡" accent="#C9973A" />
        </div>
      </div>

      {/* ── Wallets ─────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <p className="font-display text-[0.62rem] tracking-[0.2em] uppercase text-smoke">My Wallets</p>
          <Link to="/wallets"
            className="font-display text-[0.62rem] tracking-[0.12em] uppercase text-gold hover:text-gold-light transition-colors flex items-center gap-1">
            View All
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {wallets.length === 0 ? (
          <div className="card-deco flex flex-col items-center py-12 text-center">
            <p className="font-display text-smoke text-xs tracking-widest uppercase mb-3">No Wallets</p>
            <Link to="/wallets" className="btn-gold text-xs py-2.5">Create Wallet</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

            {/* Featured card — primary wallet */}
            <div
              className="relative rounded-2xl flex items-center justify-center py-8 px-4 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #0A0B0E 0%, #0F1018 60%, #0D0E15 100%)',
                border: '1px solid rgba(201,151,58,0.13)',
              }}
            >
              {/* Subtle grid bg */}
              <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
              {/* Radial glow */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(201,151,58,0.06) 0%, transparent 70%)' }}
              />
              {/* Art Deco corners */}
              <div className="absolute top-3 left-3 w-4 h-4" style={{ borderTop: '1px solid rgba(201,151,58,0.3)', borderLeft: '1px solid rgba(201,151,58,0.3)' }} />
              <div className="absolute top-3 right-3 w-4 h-4" style={{ borderTop: '1px solid rgba(201,151,58,0.3)', borderRight: '1px solid rgba(201,151,58,0.3)' }} />
              <div className="absolute bottom-3 left-3 w-4 h-4" style={{ borderBottom: '1px solid rgba(201,151,58,0.3)', borderLeft: '1px solid rgba(201,151,58,0.3)' }} />
              <div className="absolute bottom-3 right-3 w-4 h-4" style={{ borderBottom: '1px solid rgba(201,151,58,0.3)', borderRight: '1px solid rgba(201,151,58,0.3)' }} />

              <div className="relative z-10">
                <CreditCard
                  cardHolder={(user?.name || 'Valued Member').toUpperCase()}
                  currency={wallets[0]?.currency || 'USD'}
                  cardNumber={`4532 ${wallets[0]?._id?.slice(-4)?.padStart(4, '0') || '0000'} 5678 9010`}
                  expiryDate="12/28"
                  cvv="123"
                  variant="gradient"
                />
              </div>
            </div>

            {/* Wallet list */}
            <div className="flex flex-col gap-3">
              {wallets.slice(0, 3).map((w, i) => (
                <motion.div
                  key={w._id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.2, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <WalletCard wallet={w} compact onClick={() => navigate('/wallets')} />
                </motion.div>
              ))}
              {wallets.length > 3 && (
                <Link
                  to="/wallets"
                  className="font-display text-[0.62rem] tracking-[0.18em] uppercase text-smoke hover:text-gold transition-colors text-center py-3 rounded-xl"
                  style={{ border: '1px dashed rgba(201,151,58,0.15)' }}
                >
                  +{wallets.length - 3} more wallet{wallets.length - 3 !== 1 ? 's' : ''} →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Recent Transactions ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="font-display text-[0.62rem] tracking-[0.2em] uppercase text-smoke">Recent Transactions</p>
          <Link to="/transactions"
            className="font-display text-[0.62rem] tracking-[0.12em] uppercase text-gold hover:text-gold-light transition-colors flex items-center gap-1">
            View All
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="card p-0 overflow-hidden">
          {/* Table header */}
          <div className="px-4 py-3 flex items-center gap-4"
            style={{ borderBottom: '1px solid rgba(201,151,58,0.08)' }}>
            {['Transaction', 'Amount', 'Status', 'Date'].map(h => (
              <p key={h} className="table-header flex-1 first:flex-[2]">{h}</p>
            ))}
          </div>

          {transactions.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="font-display text-smoke text-xs tracking-widest uppercase">No transactions</p>
            </div>
          ) : (
            <div>
              {transactions.slice(0, 5).map((tx, i) => {
                const meta = TYPE_ICON[tx.type] || TYPE_ICON.send
                const isCredit = tx.type === 'receive' || tx.type === 'add'
                return (
                  <div
                    key={tx._id}
                    className="px-4 py-3.5 flex items-center gap-4 cursor-pointer transition-colors animate-fade-up"
                    style={{
                      borderBottom: i < 4 ? '1px solid rgba(201,151,58,0.06)' : 'none',
                      animationDelay: `${i * 50}ms`,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,151,58,0.025)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Type indicator */}
                    <div className="flex items-center gap-3 flex-[2] min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}25` }}>
                        <span style={{ color: meta.color, fontSize: '0.85rem' }}>{meta.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-chalk text-xs font-semibold tracking-wide capitalize">{tx.type}</p>
                        <p className="font-mono-custom text-ember text-[0.62rem] truncate">#{tx._id.slice(-8)}</p>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="flex-1">
                      <p className="font-mono-custom text-sm font-medium"
                        style={{ color: isCredit ? '#4ADE80' : '#F87171' }}>
                        {isCredit ? '+' : '-'}{Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="font-display text-ember text-[0.58rem] tracking-wider uppercase">{tx.currency}</p>
                    </div>

                    {/* Status */}
                    <div className="flex-1">
                      <span className={STATUS_BADGE[tx.status] || 'badge-info'}>{tx.status}</span>
                    </div>

                    {/* Date */}
                    <div className="flex-1 text-right">
                      <p className="font-mono-custom text-ember text-xs">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
