import React, { useState, useEffect } from 'react'
import { walletApi, depositApi, withdrawalApi } from '../services/api'
import WalletCard from '../components/WalletCard'
import Modal from '../components/Modal'
import Alert from '../components/Alert'
import { PageLoader, LoadingSpinner } from '../components/LoadingSpinner'

const CURRENCIES = ['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'JPY', 'CAD', 'AUD', 'CHF']
const MOCK_WALLETS = [
  { _id: '1', currency: 'PKR', balance: 245000, status: 'active' },
  { _id: '2', currency: 'USD', balance: 1280.50, status: 'active' },
  { _id: '3', currency: 'EUR', balance: 430.20, status: 'active' },
]

const CURRENCY_FLAGS = { PKR: '🇵🇰', USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', AED: '🇦🇪', SAR: '🇸🇦', JPY: '🇯🇵', CAD: '🇨🇦', AUD: '🇦🇺', CHF: '🇨🇭' }

export default function Wallets() {
  const [wallets, setWallets] = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [addMoneyOpen, setAddMoneyOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [newCurrency, setNewCurrency] = useState('USD')
  const [addAmount, setAddAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [alert, setAlert] = useState(null)

  const fetchWallets = () => {
    walletApi.getAll()
      .then(res => setWallets(res.data))
      .catch(() => setWallets(MOCK_WALLETS))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchWallets() }, [])

  const handleCreate = async () => {
    setSubmitting(true)
    try {
      await walletApi.create(newCurrency)
      setCreateOpen(false)
      setAlert({ type: 'success', msg: `${newCurrency} wallet created successfully!` })
      fetchWallets()
    } catch (err) {
      setAlert({ type: 'error', msg: err.response?.data?.message || 'Failed to create wallet.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddMoney = async () => {
    if (!addAmount || isNaN(addAmount) || Number(addAmount) <= 0) {
      setAlert({ type: 'error', msg: 'Please enter a valid amount.' })
      return
    }
    setSubmitting(true)
    try {
      await depositApi.create({ walletId: selectedWallet._id, amount: Number(addAmount) })
      setAddMoneyOpen(false)
      setAddAmount('')
      setAlert({ type: 'success', msg: `${addAmount} ${selectedWallet.currency} deposited successfully!` })
      fetchWallets()
    } catch (err) {
      setAlert({ type: 'error', msg: err.response?.data?.message || 'Deposit failed.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(withdrawAmount) || Number(withdrawAmount) <= 0) {
      setAlert({ type: 'error', msg: 'Please enter a valid amount.' })
      return
    }
    setSubmitting(true)
    try {
      await withdrawalApi.create({ walletId: selectedWallet._id, amount: Number(withdrawAmount) })
      setWithdrawOpen(false)
      setWithdrawAmount('')
      setAlert({ type: 'success', msg: `${withdrawAmount} ${selectedWallet.currency} withdrawn successfully!` })
      fetchWallets()
    } catch (err) {
      setAlert({ type: 'error', msg: err.response?.data?.message || 'Withdrawal failed.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async (wallet) => {
    const next = wallet.status === 'active' ? 'frozen' : 'active'
    try { await walletApi.toggleStatus(wallet._id) } catch {}
    setWallets(ws => ws.map(w => w._id === wallet._id ? { ...w, status: next } : w))
    setAlert({ type: 'success', msg: `Wallet ${next === 'frozen' ? 'frozen' : 'unfrozen'} successfully.` })
  }

  const existing = new Set(wallets.map(w => w.currency))

  if (loading) return <PageLoader />

  return (
    <div className="p-5 sm:p-6 space-y-6 animate-fade-in">
      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-[0.6rem] tracking-[0.25em] uppercase mb-1"
            style={{ color: 'rgba(201,151,58,0.6)' }}>Accounts</p>
          <h2 className="font-display text-chalk text-xl font-bold tracking-wide">
            My Wallets
            <span className="font-mono-custom text-sm font-normal text-ember ml-3">
              {wallets.length} active
            </span>
          </h2>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-gold flex items-center gap-2 text-sm py-2.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-display tracking-wider">New Wallet</span>
        </button>
      </div>

      {/* ── Wallet Grid ─────────────────────────────────────────────────── */}
      {wallets.length === 0 ? (
        <div className="card-deco flex flex-col items-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: 'rgba(201,151,58,0.06)', border: '1px solid rgba(201,151,58,0.15)' }}>
            <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <p className="font-display text-chalk text-sm font-semibold tracking-widest uppercase mb-2">No Wallets</p>
          <p className="text-smoke text-xs leading-relaxed mb-8 max-w-xs">
            Create your first multi-currency wallet to start sending and receiving money globally.
          </p>
          <button onClick={() => setCreateOpen(true)} className="btn-gold text-sm py-2.5">
            Create First Wallet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {wallets.map(w => (
            <div key={w._id} className="space-y-2.5">
              <WalletCard wallet={w} />
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => { setSelectedWallet(w); setAddMoneyOpen(true) }}
                  className="btn-outline text-xs py-2 flex items-center justify-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Deposit
                </button>
                <button
                  onClick={() => { setSelectedWallet(w); setWithdrawOpen(true) }}
                  className="text-xs py-2 rounded-xl font-display tracking-wider uppercase transition-all duration-200 border flex items-center justify-center gap-1"
                  style={{ borderColor: 'rgba(201,151,58,0.25)', color: '#C9973A', background: 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,151,58,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4m0 0l6-6m-6 6l6 6" />
                  </svg>
                  Withdraw
                </button>
                <button
                  onClick={() => handleToggleStatus(w)}
                  className="text-xs py-2 rounded-xl font-display tracking-wider uppercase transition-all duration-200 border"
                  style={w.status === 'active'
                    ? { borderColor: 'rgba(239,68,68,0.3)', color: '#F87171', background: 'transparent' }
                    : { borderColor: 'rgba(74,222,128,0.3)', color: '#4ADE80', background: 'transparent' }
                  }
                  onMouseEnter={e => { e.currentTarget.style.background = w.status === 'active' ? 'rgba(239,68,68,0.08)' : 'rgba(74,222,128,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  {w.status === 'active' ? 'Freeze' : 'Unfreeze'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Summary Table ───────────────────────────────────────────────── */}
      {wallets.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(201,151,58,0.08)' }}>
            <p className="font-display text-[0.62rem] tracking-[0.2em] uppercase text-smoke">Wallet Summary</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(201,151,58,0.06)' }}>
                  {['Currency', 'Balance', 'Status', 'Action'].map(h => (
                    <th key={h} className="table-header px-5 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {wallets.map((w, i) => (
                  <tr
                    key={w._id}
                    style={{ borderBottom: i < wallets.length - 1 ? '1px solid rgba(201,151,58,0.04)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,151,58,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{CURRENCY_FLAGS[w.currency] || '💰'}</span>
                        <span className="font-display text-gold text-sm tracking-wider">{w.currency}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono-custom text-chalk text-sm">
                      {w.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={w.status === 'active' ? 'badge-success' : 'badge-failed'}>{w.status}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => { setSelectedWallet(w); setAddMoneyOpen(true) }}
                        className="font-display text-[0.6rem] tracking-widest uppercase text-gold hover:text-gold-light transition-colors"
                      >
                        Add Funds →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Create Wallet Modal ─────────────────────────────────────────── */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create New Wallet">
        <div className="space-y-5">
          <div>
            <label className="label">Select Currency</label>
            <select
              value={newCurrency}
              onChange={e => setNewCurrency(e.target.value)}
              className="select-field"
            >
              {CURRENCIES.filter(c => !existing.has(c)).map(c => (
                <option key={c} value={c}>{CURRENCY_FLAGS[c] || ''} {c}</option>
              ))}
            </select>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'rgba(201,151,58,0.04)', border: '1px solid rgba(201,151,58,0.1)' }}>
            <p className="text-smoke text-xs leading-relaxed">
              A new <span className="text-gold font-medium">{newCurrency}</span> wallet will be created.
              You can add funds immediately after creation.
            </p>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setCreateOpen(false)} className="flex-1 btn-outline">Cancel</button>
            <button onClick={handleCreate} disabled={submitting} className="flex-1 btn-gold flex items-center justify-center gap-2">
              {submitting && <LoadingSpinner size="sm" />}
              Create Wallet
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Add Money Modal ─────────────────────────────────────────────── */}
      <Modal isOpen={addMoneyOpen} onClose={() => { setAddMoneyOpen(false); setAddAmount('') }} title="Add Funds">
        <div className="space-y-5">
          {selectedWallet && (
            <div className="p-4 rounded-xl" style={{ background: 'rgba(201,151,58,0.04)', border: '1px solid rgba(201,151,58,0.12)' }}>
              <p className="font-display text-[0.58rem] tracking-[0.15em] uppercase text-gold mb-2">Destination</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{CURRENCY_FLAGS[selectedWallet.currency] || '💰'}</span>
                <div>
                  <p className="font-display text-chalk text-lg font-bold">{selectedWallet.currency} Wallet</p>
                  <p className="font-mono-custom text-ember text-xs">
                    Balance: {selectedWallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} {selectedWallet.currency}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div>
            <label className="label">Amount ({selectedWallet?.currency})</label>
            <input
              type="number"
              value={addAmount}
              onChange={e => setAddAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              className="input-field font-mono-custom text-lg"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[100, 500, 1000, 5000].map(amt => (
              <button
                key={amt}
                onClick={() => setAddAmount(String(amt))}
                className="py-2 rounded-lg font-display text-[0.6rem] tracking-wider uppercase transition-all duration-200 border"
                style={addAmount === String(amt)
                  ? { background: 'rgba(201,151,58,0.15)', borderColor: 'rgba(201,151,58,0.4)', color: '#C9973A' }
                  : { background: 'transparent', borderColor: 'rgba(201,151,58,0.1)', color: 'rgba(138,130,120,0.7)' }
                }
              >
                +{amt}
              </button>
            ))}
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => { setAddMoneyOpen(false); setAddAmount('') }} className="flex-1 btn-outline">Cancel</button>
            <button onClick={handleAddMoney} disabled={submitting} className="flex-1 btn-gold flex items-center justify-center gap-2">
              {submitting && <LoadingSpinner size="sm" />}
              Add Funds
            </button>
          </div>
        </div>
      </Modal>
      {/* ── Withdraw Modal ───────────────────────────────────────────────────── */}
      <Modal isOpen={withdrawOpen} onClose={() => { setWithdrawOpen(false); setWithdrawAmount('') }} title="Withdraw Funds">
        <div className="space-y-5">
          {selectedWallet && (
            <div className="p-4 rounded-xl" style={{ background: 'rgba(201,151,58,0.04)', border: '1px solid rgba(201,151,58,0.12)' }}>
              <p className="font-display text-[0.58rem] tracking-[0.15em] uppercase text-gold mb-2">From Wallet</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{CURRENCY_FLAGS[selectedWallet.currency] || '💰'}</span>
                <div>
                  <p className="font-display text-chalk text-lg font-bold">{selectedWallet.currency} Wallet</p>
                  <p className="font-mono-custom text-ember text-xs">
                    Available: {selectedWallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} {selectedWallet.currency}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div>
            <label className="label">Amount ({selectedWallet?.currency})</label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              max={selectedWallet?.balance}
              className="input-field font-mono-custom text-lg"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[100, 500, 1000, 5000].map(amt => (
              <button
                key={amt}
                onClick={() => setWithdrawAmount(String(amt))}
                className="py-2 rounded-lg font-display text-[0.6rem] tracking-wider uppercase transition-all duration-200 border"
                style={withdrawAmount === String(amt)
                  ? { background: 'rgba(201,151,58,0.15)', borderColor: 'rgba(201,151,58,0.4)', color: '#C9973A' }
                  : { background: 'transparent', borderColor: 'rgba(201,151,58,0.1)', color: 'rgba(138,130,120,0.7)' }
                }
              >
                {amt}
              </button>
            ))}
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => { setWithdrawOpen(false); setWithdrawAmount('') }} className="flex-1 btn-outline">Cancel</button>
            <button onClick={handleWithdraw} disabled={submitting} className="flex-1 btn-gold flex items-center justify-center gap-2">
              {submitting && <LoadingSpinner size="sm" />}
              Withdraw
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
