import React, { useState, useEffect } from 'react'
import { walletApi, transactionApi } from '../services/api'
import Alert from '../components/Alert'
import Modal from '../components/Modal'
import { LoadingSpinner } from '../components/LoadingSpinner'

const MOCK_WALLETS = [
  { _id: '1', currency: 'PKR', balance: 245000, status: 'active' },
  { _id: '2', currency: 'USD', balance: 1280.50, status: 'active' },
  { _id: '3', currency: 'EUR', balance: 430.20, status: 'active' },
]

const CURRENCY_SYMBOLS = { PKR: '₨', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ', SAR: '﷼' }

export default function SendMoney() {
  const [wallets, setWallets] = useState([])
  const [form, setForm] = useState({ walletId: '', receiverEmail: '', amount: '' })
  const [loading, setLoading] = useState(false)
  const [walletLoading, setWalletLoading] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [alert, setAlert] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    walletApi.getAll()
      .then(res => setWallets(res.data?.filter(w => w.status === 'active') || []))
      .catch(() => setWallets(MOCK_WALLETS))
      .finally(() => setWalletLoading(false))
  }, [])

  const selectedWallet = wallets.find(w => w._id === form.walletId)
  const sym = selectedWallet ? (CURRENCY_SYMBOLS[selectedWallet.currency] || selectedWallet.currency) : ''

  const handleChange = e => { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setAlert(null) }

  const handlePreSubmit = e => {
    e.preventDefault()
    if (!form.walletId) { setAlert({ type: 'error', msg: 'Please select a wallet.' }); return }
    if (!form.receiverEmail) { setAlert({ type: 'error', msg: 'Please enter receiver email.' }); return }
    if (!form.amount || Number(form.amount) <= 0) { setAlert({ type: 'error', msg: 'Please enter a valid amount.' }); return }
    if (selectedWallet && Number(form.amount) > selectedWallet.balance) {
      setAlert({ type: 'error', msg: 'Insufficient balance.' }); return
    }
    setConfirmOpen(true)
  }

  const handleConfirm = async () => {
    setLoading(true)
    setConfirmOpen(false)
    try {
      await transactionApi.send({
        fromWalletId:   form.walletId,
        recipientEmail: form.receiverEmail,
        amount:         Number(form.amount),
      })
      // Refresh wallet balances so the deducted amount shows immediately
      walletApi.getAll()
        .then(res => setWallets(res.data?.filter(w => w.status === 'active') || []))
        .catch(() => {})
      setSuccess(true)
      setAlert({ type: 'success', msg: `Sent ${form.amount} ${selectedWallet?.currency} to ${form.receiverEmail}!` })
      setForm({ walletId: '', receiverEmail: '', amount: '' })
    } catch (err) {
      setAlert({ type: 'error', msg: err.response?.data?.message || 'Transfer failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-5 sm:p-6 animate-fade-in">
      <div className="max-w-xl mx-auto space-y-6">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div>
          <p className="font-display text-[0.6rem] tracking-[0.25em] uppercase mb-1"
            style={{ color: 'rgba(201,151,58,0.6)' }}>Transfer</p>
          <h2 className="font-display text-chalk text-xl font-bold tracking-wide">Send Money</h2>
        </div>

        {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

        {/* ── Success State ──────────────────────────────────────────────── */}
        {success && (
          <div className="relative overflow-hidden rounded-2xl px-6 py-12 text-center"
            style={{ background: 'linear-gradient(135deg, #0A140C 0%, #0C1A10 100%)', border: '1px solid rgba(74,222,128,0.2)' }}>
            <div className="absolute top-0 inset-x-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(74,222,128,0.5), transparent)' }} />
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)' }}>
              <svg className="w-8 h-8" style={{ color: '#4ADE80' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-display text-chalk text-lg font-bold tracking-wide mb-2">Transfer Complete</p>
            <p className="text-smoke text-sm mb-8">Your funds are on their way.</p>
            <button onClick={() => setSuccess(false)} className="btn-gold text-sm py-2.5 px-8">Send Again</button>
          </div>
        )}

        {/* ── Form ──────────────────────────────────────────────────────── */}
        {!success && (
          <form onSubmit={handlePreSubmit} className="space-y-5">

            {/* From Wallet */}
            <div>
              <label className="label">From Wallet</label>
              <select
                name="walletId" value={form.walletId} onChange={handleChange}
                required disabled={walletLoading} className="select-field"
              >
                <option value="">Select source wallet</option>
                {wallets.map(w => (
                  <option key={w._id} value={w._id}>
                    {w.currency} — {w.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </option>
                ))}
              </select>
              {selectedWallet && (
                <div className="mt-2 flex items-center justify-between px-1">
                  <p className="font-display text-[0.58rem] tracking-[0.1em] uppercase text-ember">Available</p>
                  <p className="font-mono-custom text-gold text-xs">
                    {sym}{selectedWallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>

            {/* Receiver */}
            <div>
              <label className="label">Receiver's Email</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ember pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="email" name="receiverEmail" value={form.receiverEmail} onChange={handleChange}
                  placeholder="recipient@example.com" required className="input-field pl-10"
                />
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="label">Amount</label>
              <div className="relative">
                {selectedWallet && (
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-display text-[0.6rem] tracking-wider text-gold uppercase">
                    {selectedWallet.currency}
                  </span>
                )}
                <input
                  type="number" name="amount" value={form.amount} onChange={handleChange}
                  placeholder="0.00" min="0.01" step="0.01" required
                  className={`input-field font-mono-custom ${selectedWallet ? 'pl-14' : ''}`}
                />
              </div>
              {selectedWallet && form.amount && Number(form.amount) > 0 && (
                <div className="mt-2 flex items-center justify-between px-1">
                  <p className="font-display text-[0.58rem] tracking-[0.1em] uppercase"
                    style={{ color: Number(form.amount) > selectedWallet.balance ? '#F87171' : 'rgba(74,70,64,0.7)' }}>
                    {Number(form.amount) > selectedWallet.balance ? 'Exceeds balance' : 'After transfer'}
                  </p>
                  {Number(form.amount) <= selectedWallet.balance && (
                    <p className="font-mono-custom text-smoke text-xs">
                      {sym}{(selectedWallet.balance - Number(form.amount)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex items-start gap-3 p-4 rounded-xl"
              style={{ background: 'rgba(201,151,58,0.04)', border: '1px solid rgba(201,151,58,0.1)' }}>
              <svg className="w-4 h-4 text-gold shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="space-y-0.5">
                <p className="text-smoke text-xs">Transfers are processed instantly with zero fees.</p>
                <p className="text-smoke text-xs">Receiver must have an active SafeLedger account.</p>
              </div>
            </div>

            <button
              type="submit" disabled={loading || walletLoading}
              className="w-full btn-gold py-3.5 flex items-center justify-center gap-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
              {loading ? 'Sending...' : 'Review Transfer'}
            </button>
          </form>
        )}
      </div>

      {/* ── Confirm Modal ──────────────────────────────────────────────── */}
      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm Transfer">
        <div className="space-y-5">
          {/* Amount display */}
          <div className="text-center py-4">
            <p className="font-display text-[0.58rem] tracking-[0.2em] uppercase text-ember mb-2">You're sending</p>
            <p className="font-mono-custom font-bold gold-shimmer-text" style={{ fontSize: '2.5rem' }}>
              {sym}{Number(form.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="font-display text-ember text-xs tracking-widest uppercase mt-1">{selectedWallet?.currency}</p>
          </div>

          <div className="space-y-2 p-4 rounded-xl" style={{ background: 'rgba(15,16,21,0.9)', border: '1px solid rgba(201,151,58,0.08)' }}>
            {[
              { label: 'From', value: `${selectedWallet?.currency} Wallet` },
              { label: 'To', value: form.receiverEmail },
              { label: 'Fee', value: 'Free', color: '#4ADE80' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-1.5"
                style={{ borderBottom: '1px solid rgba(201,151,58,0.04)' }}>
                <span className="font-display text-[0.58rem] tracking-[0.12em] uppercase text-ember">{row.label}</span>
                <span className="font-mono-custom text-xs" style={{ color: row.color || '#EDE8DC' }}>{row.value}</span>
              </div>
            ))}
          </div>

          <p className="font-display text-[0.58rem] tracking-[0.1em] uppercase text-center text-ember">
            Once confirmed, this transfer cannot be reversed.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmOpen(false)} className="flex-1 btn-outline">Cancel</button>
            <button onClick={handleConfirm} className="flex-1 btn-gold">Confirm Send</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
