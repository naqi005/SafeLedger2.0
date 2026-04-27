import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PAGE_META = {
  '/dashboard':    { title: 'Dashboard',           sub: 'Overview' },
  '/wallets':      { title: 'My Wallets',          sub: 'Accounts' },
  '/send':         { title: 'Send Money',           sub: 'Transfer' },
  '/exchange':     { title: 'Currency Exchange',    sub: 'Convert' },
  '/transactions': { title: 'Transaction History',  sub: 'Ledger' },
  '/profile':      { title: 'My Profile',           sub: 'Account' },
  '/admin':        { title: 'Admin Dashboard',      sub: 'Control' },
}

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const page = PAGE_META[pathname] || { title: 'SafeLedger', sub: '' }

  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-3 gap-3"
      style={{
        background: 'rgba(8,8,10,0.88)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(201,151,58,0.08)',
      }}
    >
      {/* Left side */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg transition-colors"
          style={{ color: 'rgba(138,130,120,0.8)' }}
          onMouseEnter={e => e.currentTarget.style.color = '#C9973A'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(138,130,120,0.8)'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Page title */}
        <div className="min-w-0 flex items-center gap-3">
          <div>
            <p className="font-display text-[0.55rem] tracking-[0.2em] uppercase leading-none mb-1"
              style={{ color: 'rgba(201,151,58,0.5)' }}>{page.sub}</p>
            <h1 className="font-display text-chalk text-base font-semibold tracking-wide leading-none">{page.title}</h1>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Date — desktop */}
        <span className="font-mono-custom text-ember text-xs hidden lg:block mr-2">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>

        {/* Notification */}
        <button
          className="relative p-2 rounded-lg transition-colors"
          style={{ color: 'rgba(74,70,64,0.9)' }}
          onMouseEnter={e => e.currentTarget.style.color = '#C9973A'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(74,70,64,0.9)'}
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {/* Gold dot */}
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-gold" />
        </button>

        {/* Separator */}
        <div className="w-px h-5 mx-1" style={{ background: 'rgba(201,151,58,0.1)' }} />

        {/* Avatar */}
        <Link
          to="/profile"
          className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-colors"
          style={{ color: 'rgba(138,130,120,0.8)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div className="w-7 h-7 rounded-full gold-gradient flex items-center justify-center shrink-0 shadow-gold">
            <span className="font-display text-[9px] font-bold text-[#0C0800]">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-chalk text-xs font-medium leading-tight">{user?.name?.split(' ')[0]}</p>
            <p className="font-display text-[0.55rem] tracking-[0.1em] uppercase"
              style={{ color: 'rgba(201,151,58,0.5)' }}>{user?.role || 'User'}</p>
          </div>
        </Link>
      </div>
    </header>
  )
}
