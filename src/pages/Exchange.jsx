import React, { useState, useEffect, useCallback } from 'react'
import { walletApi, exchangeApi } from '../services/api'
import Alert from '../components/Alert'
import Modal from '../components/Modal'
import { LoadingSpinner } from '../components/LoadingSpinner'

const CURRENCIES = ['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR']
const DEMO_RATES = { USD: 1, PKR: 278, EUR: 0.92, GBP: 0.79, AED: 3.67, SAR: 3.75 }
const CURRENCY_FLAGS = { PKR: '🇵🇰', USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', AED: '🇦🇪', SAR: '🇸🇦' }
const CURRENCY_SYMBOLS = { PKR: '₨', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ', SAR: '﷼' }

function calcRate(from, to) { return DEMO_RATES[to] / DEMO_RATES[from] }

export default function Exchange() {
  const [wallets, setWallets] = useState([])
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('PKR')
  const [amount, setAmount] = useState('')
  const [converted, setConverted] = useState(null)
  const [rate, setRate] = useState(null)
  const [rateLoading, setRateLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    walletApi.getAll().then(res => setWallets(res.data || [])).catch(() => {})
  }, [])

  const fetchRate = useCallback(() => {
    if (from === to) { setRate(1); setConverted(amount ? Number(amount) : null); return }
    setRateLoading(true)
    exchangeApi.getRates(from, to)
      .then(res => {
        const r = res.data?.rate || calcRate(from, to)
        setRate(r)
        if (amount) setConverted((Number(amount) * r).toFixed(4))
      })
      .catch(() => {
        const r = calcRate(from, to)
        setRate(r)
        if (amount) setConverted((Number(amount) * r).toFixed(4))
      })
      .finally(() => setRateLoading(false))
  }, [from, to, amount])

  useEffect(() => { fetchRate() }, [from, to])
  useEffect(() => {
    if (rate && amount) setConverted((Number(amount) * rate).toFixed(4))
    else setConverted(null)
  }, [amount, rate])

  const swap = () => { setFrom(to); setTo(from); setAmount(''); setConverted(null) }

  const handleConfirm = async () => {
    setSubmitting(true)
    setConfirmOpen(false)
    try {
      let fromWallet = wallets.find(w => w.currency === from)
      let toWallet   = wallets.find(w => w.currency === to)

      // Auto-create source wallet if missing
      if (!fromWallet) {
        const res = await walletApi.create(from)
        fromWallet = res.data
        setWallets(prev => [...prev, fromWallet])
      }

      // Auto-create destination wallet if missing (e.g. EUR wallet for USD→EUR)
      if (!toWallet) {
        const res = await walletApi.create(to)
        toWallet = res.data
        setWallets(prev => [...prev, toWallet])
      }

      await exchangeApi.convert({
        fromWalletId: fromWallet._id,
        toWalletId:   toWallet._id,
        amount:       Number(amount),
      })

      // Refresh wallet balances
      walletApi.getAll().then(r => setWallets(r.data || [])).catch(() => {})

      setAlert({ type: 'success', msg: `Exchanged ${amount} ${from} → ${converted} ${to}!` })
      setAmount('')
      setConverted(null)
    } catch (err) {
      const msg = err.response?.data?.message || 'Exchange failed. Please try again.'
      setAlert({ type: 'error', msg })
    } finally {
      setSubmitting(false)
    }
  }

  const fromWallet = wallets.find(w => w.currency === from)

  return (
    <div className="p-5 sm:p-6 animate-fade-in">
      <div className="max-w-xl mx-auto space-y-6">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div>
          <p className="font-display text-[0.6rem] tracking-[0.25em] uppercase mb-1"
            style={{ color: 'rgba(201,151,58,0.6)' }}>Convert</p>
          <h2 className="font-display text-chalk text-xl font-bold tracking-wide">Currency Exchange</h2>
        </div>

        {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

        {/* ── Live Rate Banner ───────────────────────────────────────────── */}
        {rate && from !== to && (
          <div className="relative overflow-hidden rounded-2xl px-5 py-4 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #0A0B0F 0%, #0F1018 100%)', border: '1px solid rgba(201,151,58,0.15)' }}>
            <div className="absolute top-0 inset-x-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(201,151,58,0.4), transparent)' }} />
            <div>
              <p className="font-display text-[0.55rem] tracking-[0.2em] uppercase text-ember mb-1.5">Live Rate</p>
              <p className="font-mono-custom text-chalk text-sm">
                1 <span className="text-gold">{from}</span>
                {' = '}
                <span className="font-bold text-gold">{rate?.toFixed(4)}</span>
                {' '}{to}
              </p>
            </div>
            <button
              onClick={fetchRate} disabled={rateLoading}
              className="p-2 rounded-lg transition-colors text-ember hover:text-gold"
              style={{ background: 'rgba(201,151,58,0.05)' }}
              title="Refresh rate"
            >
              {rateLoading
                ? <LoadingSpinner size="sm" />
                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
              }
            </button>
          </div>
        )}

        {/* ── Exchange Form ──────────────────────────────────────────────── */}
        <div className="card space-y-5">

          {/* From */}
          <div>
            <label className="label">From</label>
            <div className="flex gap-3">
              <div className="relative shrink-0" style={{ width: '130px' }}>
                <select value={from} onChange={e => setFrom(e.target.value)} className="select-field pr-8">
                  {CURRENCIES.map(c => (
                    <option key={c} value={c}>{CURRENCY_FLAGS[c]} {c}</option>
                  ))}
                </select>
              </div>
              <input
                type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0.00" min="0.01" step="0.01"
                className="input-field flex-1 font-mono-custom"
              />
            </div>
            {fromWallet && (
              <div className="mt-1.5 flex items-center justify-between px-1">
                <p className="font-display text-[0.55rem] tracking-wider uppercase text-ember">Wallet balance</p>
                <p className="font-mono-custom text-gold text-xs">
                  {CURRENCY_SYMBOLS[from] || ''}{fromWallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex items-center justify-center">
            <button
              onClick={swap}
              className="relative w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center group"
              style={{ background: 'rgba(201,151,58,0.06)', border: '1px solid rgba(201,151,58,0.2)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,151,58,0.12)'; e.currentTarget.style.borderColor = 'rgba(201,151,58,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,151,58,0.06)'; e.currentTarget.style.borderColor = 'rgba(201,151,58,0.2)' }}
            >
              <svg className="w-4 h-4 text-gold transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          {/* To */}
          <div>
            <label className="label">To</label>
            <div className="flex gap-3">
              <div className="relative shrink-0" style={{ width: '130px' }}>
                <select value={to} onChange={e => setTo(e.target.value)} className="select-field pr-8">
                  {CURRENCIES.map(c => (
                    <option key={c} value={c}>{CURRENCY_FLAGS[c]} {c}</option>
                  ))}
                </select>
              </div>
              <div className="input-field flex-1 flex items-center cursor-default">
                {converted
                  ? <span className="font-mono-custom text-gold font-bold text-lg">{converted}</span>
                  : <span style={{ color: 'rgba(74,70,64,0.5)' }}>—</span>
                }
              </div>
            </div>
          </div>

          {/* Summary */}
          {amount && converted && from !== to && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(201,151,58,0.1)' }}>
              {[
                { label: 'You send', value: `${amount} ${from}` },
                { label: 'Rate', value: `1 ${from} = ${rate?.toFixed(4)} ${to}` },
                { label: 'Fee', value: 'Free', color: '#4ADE80' },
              ].map((row, i) => (
                <div key={row.label}
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{ background: i % 2 === 0 ? 'rgba(15,16,21,0.5)' : 'transparent' }}>
                  <span className="font-display text-[0.58rem] tracking-[0.1em] uppercase text-ember">{row.label}</span>
                  <span className="font-mono-custom text-xs" style={{ color: row.color || '#8A8278' }}>{row.value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-3"
                style={{ background: 'rgba(201,151,58,0.04)', borderTop: '1px solid rgba(201,151,58,0.08)' }}>
                <span className="font-display text-[0.6rem] tracking-[0.12em] uppercase text-gold">You receive</span>
                <span className="font-mono-custom text-gold font-bold">{converted} {to}</span>
              </div>
            </div>
          )}

          <button
            disabled={!amount || !converted || submitting || from === to}
            onClick={() => setConfirmOpen(true)}
            className="w-full btn-gold py-3.5 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? <LoadingSpinner size="sm" /> : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            )}
            {submitting ? 'Processing...' : 'Exchange Now'}
          </button>
        </div>

        {/* ── Rate Grid ─────────────────────────────────────────────────── */}
        <div className="card">
          <p className="font-display text-[0.62rem] tracking-[0.2em] uppercase text-smoke mb-4">Rates vs USD</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CURRENCIES.filter(c => c !== 'USD').map(c => (
              <div
                key={c}
                className="p-3 rounded-xl text-center cursor-pointer transition-all duration-200"
                style={{ background: 'rgba(15,16,21,0.8)', border: '1px solid rgba(201,151,58,0.08)' }}
                onClick={() => { setFrom('USD'); setTo(c) }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,151,58,0.25)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(201,151,58,0.08)'}
              >
                <span className="text-xl block mb-1">{CURRENCY_FLAGS[c]}</span>
                <p className="font-display text-gold text-xs tracking-wider">{c}</p>
                <p className="font-mono-custom text-chalk text-sm mt-0.5">{DEMO_RATES[c].toFixed(2)}</p>
                <p className="font-display text-ember text-[0.55rem] tracking-wider uppercase">per USD</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Confirm Modal ─────────────────────────────────────────────────── */}
      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm Exchange">
        <div className="space-y-5">
          <div className="text-center py-3">
            <p className="font-display text-[0.55rem] tracking-[0.2em] uppercase text-ember mb-3">Exchange Summary</p>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="font-mono-custom text-chalk text-2xl font-bold">{amount}</p>
                <p className="font-display text-gold text-xs tracking-widest uppercase mt-0.5">{from}</p>
              </div>
              <svg className="w-6 h-6 text-ember shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <div className="text-center">
                <p className="font-mono-custom gold-shimmer-text text-2xl font-bold">{converted}</p>
                <p className="font-display text-gold text-xs tracking-widest uppercase mt-0.5">{to}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(201,151,58,0.04)', border: '1px solid rgba(201,151,58,0.1)' }}>
            <p className="font-mono-custom text-smoke text-xs">Rate: 1 {from} = {rate?.toFixed(4)} {to}</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setConfirmOpen(false)} className="flex-1 btn-outline">Cancel</button>
            <button onClick={handleConfirm} className="flex-1 btn-gold">Confirm Exchange</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
