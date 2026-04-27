import React, { useState, useEffect } from 'react'
import { transactionApi } from '../services/api'
import { PageLoader } from '../components/LoadingSpinner'
import Alert from '../components/Alert'
import Modal from '../components/Modal'

const MOCK_TXS = Array.from({ length: 15 }, (_, i) => ({
  _id: `tx${String(i + 1).padStart(8, '0')}`,
  type: ['send', 'receive', 'exchange', 'add'][i % 4],
  amount: (Math.random() * 10000 + 100).toFixed(2),
  currency: ['PKR', 'USD', 'EUR', 'GBP'][i % 4],
  status: ['completed', 'completed', 'pending', 'failed'][i % 4],
  senderEmail: 'you@example.com',
  receiverEmail: `user${i + 1}@example.com`,
  createdAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
}))

const STATUS_BADGE = { completed: 'badge-success', pending: 'badge-pending', failed: 'badge-failed', processing: 'badge-info' }
const TYPE_META = {
  send:     { icon: '↑', color: '#F87171', label: 'Send' },
  receive:  { icon: '↓', color: '#4ADE80', label: 'Receive' },
  exchange: { icon: '⇄', color: '#60A5FA', label: 'Exchange' },
  add:      { icon: '+', color: '#4ADE80', label: 'Add' },
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    transactionApi.getAll()
      .then(res => { setTransactions(res.data || []); setFiltered(res.data || []) })
      .catch(() => { setTransactions(MOCK_TXS); setFiltered(MOCK_TXS) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let data = [...transactions]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(t =>
        t._id.toLowerCase().includes(q) || t.type.toLowerCase().includes(q) ||
        t.currency.toLowerCase().includes(q) || t.senderEmail?.toLowerCase().includes(q) ||
        t.receiverEmail?.toLowerCase().includes(q)
      )
    }
    if (typeFilter !== 'all') data = data.filter(t => t.type === typeFilter)
    if (statusFilter !== 'all') data = data.filter(t => t.status === statusFilter)
    setFiltered(data)
  }, [search, typeFilter, statusFilter, transactions])

  const exportCSV = () => {
    const csv = [
      ['ID', 'Type', 'Amount', 'Currency', 'Status', 'Date'],
      ...filtered.map(t => [t._id, t.type, t.amount, t.currency, t.status, new Date(t.createdAt).toLocaleDateString()])
    ].map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'transactions.csv'
    a.click()
  }

  if (loading) return <PageLoader />

  return (
    <div className="p-5 sm:p-6 space-y-6 animate-fade-in">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-display text-[0.6rem] tracking-[0.25em] uppercase mb-1"
            style={{ color: 'rgba(201,151,58,0.6)' }}>Ledger</p>
          <h2 className="font-display text-chalk text-xl font-bold tracking-wide">
            Transaction History
            <span className="font-mono-custom text-sm font-normal text-ember ml-3">
              {filtered.length}/{transactions.length}
            </span>
          </h2>
        </div>
        <button onClick={exportCSV}
          className="btn-outline text-xs py-2 px-4 flex items-center gap-2 self-start">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="font-display tracking-wider uppercase text-[0.6rem]">Export CSV</span>
        </button>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ember pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, email, currency..."
            className="input-field pl-10"
          />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="select-field sm:w-40">
          <option value="all">All Types</option>
          <option value="send">Send</option>
          <option value="receive">Receive</option>
          <option value="exchange">Exchange</option>
          <option value="add">Add Money</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="select-field sm:w-40">
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        {(search || typeFilter !== 'all' || statusFilter !== 'all') && (
          <button
            onClick={() => { setSearch(''); setTypeFilter('all'); setStatusFilter('all') }}
            className="btn-outline text-xs py-2 px-4 shrink-0"
          >
            <span className="font-display tracking-wider uppercase">Clear</span>
          </button>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="card p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg className="w-10 h-10 mb-4" style={{ color: 'rgba(74,70,64,0.4)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="font-display text-smoke text-xs tracking-widest uppercase mb-1">No transactions found</p>
            {search && <p className="text-ember text-xs">Try adjusting your filters</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Table header */}
            <div className="px-4 py-3 grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 items-center"
              style={{ borderBottom: '1px solid rgba(201,151,58,0.08)' }}>
              {['Transaction', 'Amount', 'Status', 'Date', ''].map(h => (
                <p key={h} className="table-header">{h}</p>
              ))}
            </div>

            <div>
              {filtered.map((tx, i) => {
                const meta = TYPE_META[tx.type] || TYPE_META.send
                const isCredit = tx.type === 'receive' || tx.type === 'add'
                return (
                  <div
                    key={tx._id}
                    className="px-4 py-3.5 grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 items-center cursor-pointer animate-fade-up"
                    style={{
                      borderBottom: i < filtered.length - 1 ? '1px solid rgba(201,151,58,0.04)' : 'none',
                      animationDelay: `${i * 30}ms`,
                    }}
                    onClick={() => setSelected(tx)}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,151,58,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Type */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${meta.color}12`, border: `1px solid ${meta.color}25` }}>
                        <span style={{ color: meta.color, fontSize: '0.9rem', lineHeight: 1 }}>{meta.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-chalk text-xs font-semibold tracking-wide capitalize">{tx.type}</p>
                        <p className="font-mono-custom text-ember text-[0.6rem] truncate">#{tx._id.slice(-8)}</p>
                      </div>
                    </div>

                    {/* Amount */}
                    <div>
                      <p className="font-mono-custom text-sm font-medium"
                        style={{ color: isCredit ? '#4ADE80' : '#F87171' }}>
                        {isCredit ? '+' : '-'}{Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="font-display text-ember text-[0.55rem] tracking-wider uppercase">{tx.currency}</p>
                    </div>

                    {/* Status */}
                    <span className={STATUS_BADGE[tx.status] || 'badge-info'}>{tx.status}</span>

                    {/* Date */}
                    <p className="font-mono-custom text-ember text-xs">
                      {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>

                    {/* View */}
                    <button className="text-ember hover:text-gold transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Modal ────────────────────────────────────────────────── */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Transaction Details">
        {selected && (() => {
          const isCredit = selected.type === 'receive' || selected.type === 'add'
          const meta = TYPE_META[selected.type] || TYPE_META.send
          return (
            <div className="space-y-5">
              {/* Amount hero */}
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: `${meta.color}12`, border: `1px solid ${meta.color}25` }}>
                  <span style={{ color: meta.color, fontSize: '1.4rem' }}>{meta.icon}</span>
                </div>
                <p className="font-mono-custom font-bold text-3xl" style={{ color: isCredit ? '#4ADE80' : '#F87171' }}>
                  {isCredit ? '+' : '-'}{Number(selected.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="font-display text-ember text-xs tracking-widest uppercase mt-1">{selected.currency}</p>
              </div>

              {/* Details */}
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(201,151,58,0.1)' }}>
                {[
                  { label: 'Transaction ID', value: selected._id },
                  { label: 'Type', value: selected.type },
                  { label: 'Status', value: <span className={STATUS_BADGE[selected.status]}>{selected.status}</span> },
                  { label: 'From', value: selected.senderEmail || '—' },
                  { label: 'To', value: selected.receiverEmail || '—' },
                  { label: 'Date', value: new Date(selected.createdAt).toLocaleString() },
                ].map((row, i) => (
                  <div key={row.label}
                    className="flex items-center justify-between px-4 py-3"
                    style={{
                      borderBottom: i < 5 ? '1px solid rgba(201,151,58,0.04)' : 'none',
                      background: i % 2 === 0 ? 'rgba(15,16,21,0.5)' : 'transparent',
                    }}>
                    <span className="font-display text-[0.58rem] tracking-[0.1em] uppercase text-ember shrink-0">{row.label}</span>
                    <span className="font-mono-custom text-chalk text-xs text-right max-w-[55%] truncate">{row.value}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => setSelected(null)} className="w-full btn-outline">Close</button>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
