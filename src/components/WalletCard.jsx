import React from 'react'

const WALLET_CONFIG = {
  PKR: { flag: '🇵🇰', gradient: 'linear-gradient(135deg, #0C1A14 0%, #0F2518 50%, #142E1D 100%)', accent: '#1A9B5A', accentDim: 'rgba(26,155,90,0.2)' },
  USD: { flag: '🇺🇸', gradient: 'linear-gradient(135deg, #0A1220 0%, #0D1830 50%, #0F1E38 100%)', accent: '#2B7FE0', accentDim: 'rgba(43,127,224,0.2)' },
  EUR: { flag: '🇪🇺', gradient: 'linear-gradient(135deg, #11101E 0%, #16143A 50%, #1A1844 100%)', accent: '#5B5EC9', accentDim: 'rgba(91,94,201,0.2)' },
  GBP: { flag: '🇬🇧', gradient: 'linear-gradient(135deg, #170A1E 0%, #200E2C 50%, #2A1236 100%)', accent: '#9B5BD9', accentDim: 'rgba(155,91,217,0.2)' },
  AED: { flag: '🇦🇪', gradient: 'linear-gradient(135deg, #1A0A0A 0%, #2A1010 50%, #341414 100%)', accent: '#E04B2B', accentDim: 'rgba(224,75,43,0.2)' },
  SAR: { flag: '🇸🇦', gradient: 'linear-gradient(135deg, #091609 0%, #0F2410 50%, #122E13 100%)', accent: '#28A745', accentDim: 'rgba(40,167,69,0.2)' },
  JPY: { flag: '🇯🇵', gradient: 'linear-gradient(135deg, #1A0A0A 0%, #280E0E 50%, #320E0E 100%)', accent: '#E03030', accentDim: 'rgba(224,48,48,0.2)' },
  DEFAULT: { flag: '💰', gradient: 'linear-gradient(135deg, #141410 0%, #1C1C16 50%, #202018 100%)', accent: '#C9973A', accentDim: 'rgba(201,151,58,0.2)' },
}

const CURRENCY_SYMBOLS = { PKR: '₨', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ', SAR: '﷼', JPY: '¥' }

function formatBalance(amount) {
  if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(2) + 'M'
  if (amount >= 10_000)    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(amount)
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
}

export default function WalletCard({ wallet, onClick, compact = false }) {
  const cfg    = WALLET_CONFIG[wallet.currency] || WALLET_CONFIG.DEFAULT
  const symbol = CURRENCY_SYMBOLS[wallet.currency] || wallet.currency
  const isFrozen = wallet.status === 'frozen'

  if (compact) {
    return (
      <div
        onClick={onClick}
        className="group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300"
        style={{
          background: cfg.gradient,
          border: `1px solid rgba(255,255,255,0.06)`,
          padding: '16px',
        }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${cfg.accent}, transparent)`, opacity: 0.7 }} />

        {/* Shimmer on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)' }} />

        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg">{cfg.flag}</span>
            <span className="font-display text-[0.6rem] tracking-widest uppercase"
              style={{ color: cfg.accent }}>{wallet.currency}</span>
          </div>
          <p className="font-mono-custom text-xl text-chalk font-medium leading-none">
            {symbol}{formatBalance(wallet.balance)}
          </p>
          <p className="text-[0.62rem] tracking-wider uppercase mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Available
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-400 hover:-translate-y-1"
      style={{
        background: cfg.gradient,
        border: `1px solid rgba(255,255,255,0.06)`,
        padding: '24px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-[2px] transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${cfg.accent}, transparent)`, opacity: 0.65 }} />

      {/* Art Deco corners */}
      <div className="absolute top-3 left-3 w-4 h-4 opacity-30 group-hover:opacity-70 transition-opacity duration-300"
        style={{ borderTop: `1px solid ${cfg.accent}`, borderLeft: `1px solid ${cfg.accent}` }} />
      <div className="absolute bottom-3 right-3 w-4 h-4 opacity-30 group-hover:opacity-70 transition-opacity duration-300"
        style={{ borderBottom: `1px solid ${cfg.accent}`, borderRight: `1px solid ${cfg.accent}` }} />

      {/* Background glow orb */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full pointer-events-none opacity-30"
        style={{ background: `radial-gradient(circle, ${cfg.accentDim}, transparent 70%)` }} />
      <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full pointer-events-none opacity-20"
        style={{ background: `radial-gradient(circle, ${cfg.accentDim}, transparent 70%)` }} />

      {/* Shimmer sweep */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.04) 50%, transparent 70%)' }} />

      <div className="relative z-10">
        {/* Header row */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{cfg.flag}</span>
            <div>
              <p className="font-display text-[0.62rem] tracking-[0.15em] uppercase"
                style={{ color: cfg.accent }}>{wallet.currency} Wallet</p>
            </div>
          </div>
          {isFrozen ? (
            <span className="font-display text-[0.58rem] tracking-widest uppercase px-2.5 py-1 rounded-full border"
              style={{ color: '#F87171', background: 'rgba(192,57,43,0.12)', borderColor: 'rgba(192,57,43,0.25)' }}>
              Frozen
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.accent }} />
              <span className="font-display text-[0.55rem] tracking-[0.1em] uppercase"
                style={{ color: 'rgba(255,255,255,0.35)' }}>Active</span>
            </div>
          )}
        </div>

        {/* Balance */}
        <div className="mb-6">
          <p className="font-mono-custom text-3xl font-light text-chalk leading-none tracking-tight">
            {symbol}{formatBalance(wallet.balance)}
          </p>
          <p className="font-display text-[0.58rem] tracking-[0.2em] uppercase mt-1.5"
            style={{ color: 'rgba(255,255,255,0.25)' }}>
            Available Balance
          </p>
        </div>

        {/* Footer */}
        <div className="pt-4 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <span className="font-mono-custom text-[0.65rem]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            #{wallet._id?.slice(-8) || '--------'}
          </span>
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="font-display text-[0.58rem] tracking-wider uppercase"
              style={{ color: cfg.accent, opacity: 0.8 }}>View</span>
            <svg className="w-3 h-3" style={{ color: cfg.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
