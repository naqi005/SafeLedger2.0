import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  {
    to: '/dashboard', label: 'Dashboard',
    icon: <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    to: '/wallets', label: 'Wallets',
    icon: <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  },
  {
    to: '/send', label: 'Send Money',
    icon: <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  },
  {
    to: '/exchange', label: 'Exchange',
    icon: <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
  },
  {
    to: '/transactions', label: 'Transactions',
    icon: <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  },
  {
    to: '/profile', label: 'Profile',
    icon: <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  },
  {
    to: '/about', label: 'About Us',
    icon: <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
]

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <aside
      className="flex flex-col h-screen shrink-0 fixed lg:relative z-30 lg:z-auto transition-all duration-300"
      style={{
        width: collapsed ? '72px' : '240px',
        background: 'rgba(10, 10, 14, 0.97)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(201,151,58,0.1)',
        transform: mobileOpen ? 'translateX(0)' : undefined,
      }}
    >
      {/* Mobile transform override */}
      <style>{`
        @media (max-width: 1023px) {
          aside {
            transform: ${mobileOpen ? 'translateX(0)' : 'translateX(-100%)'} !important;
          }
        }
      `}</style>

      {/* Subtle vertical gold line at right edge */}
      <div className="absolute right-0 top-1/4 bottom-1/4 w-px"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(201,151,58,0.15), transparent)' }} />

      {/* ── Logo ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-5"
        style={{ borderBottom: '1px solid rgba(201,151,58,0.08)' }}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center shadow-gold shrink-0">
              <span className="font-display text-[10px] font-bold text-[#0C0800]">SL</span>
            </div>
            <div>
              <p className="font-display text-white text-xs font-semibold tracking-[0.12em] leading-none">SAFELEDGER</p>
              <p className="font-display text-[0.55rem] tracking-[0.15em] mt-0.5"
                style={{ color: 'rgba(201,151,58,0.6)' }}>DIGITAL VAULT</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center shadow-gold mx-auto">
            <span className="font-display text-[10px] font-bold text-[#0C0800]">SL</span>
          </div>
        )}

        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="hidden lg:flex p-1.5 rounded-lg transition-colors"
          style={{ color: 'rgba(201,151,58,0.4)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(201,151,58,0.9)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(201,151,58,0.4)'}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {collapsed
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            }
          </svg>
        </button>

        {/* Mobile close */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-ember hover:text-chalk transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {!collapsed && (
          <p className="font-display text-[0.55rem] tracking-[0.2em] uppercase px-4 pb-3 pt-1"
            style={{ color: 'rgba(201,151,58,0.3)' }}>Navigation</p>
        )}

        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              isActive ? 'nav-link-active' : 'nav-link'
            }
            style={collapsed ? { justifyContent: 'center', padding: '10px' } : undefined}
          >
            {item.icon}
            {!collapsed && (
              <span className="text-[0.85rem] font-medium">{item.label}</span>
            )}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            {!collapsed && (
              <p className="font-display text-[0.55rem] tracking-[0.2em] uppercase px-4 pb-3 pt-5"
                style={{ color: 'rgba(201,151,58,0.3)' }}>Admin</p>
            )}
            {collapsed && <div className="my-3 mx-2 h-px" style={{ background: 'rgba(201,151,58,0.1)' }} />}
            <NavLink
              to="/admin"
              onClick={onClose}
              title={collapsed ? 'Admin Panel' : undefined}
              className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}
              style={collapsed ? { justifyContent: 'center', padding: '10px' } : undefined}
            >
              <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {!collapsed && <span className="text-[0.85rem] font-medium">Admin Panel</span>}
            </NavLink>
          </>
        )}
      </nav>

      {/* ── User ──────────────────────────────────────────────────────── */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(201,151,58,0.08)' }}>
        {!collapsed ? (
          <div className="flex items-center gap-3 p-2 rounded-xl transition-colors"
            style={{ cursor: 'default' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center shrink-0">
              <span className="font-display text-[10px] font-bold text-[#0C0800]">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-chalk text-[0.8rem] font-medium truncate leading-tight">{user?.name || 'User'}</p>
              <p className="font-mono-custom text-ember text-[0.65rem] truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 rounded-lg transition-colors shrink-0"
              style={{ color: 'rgba(74,70,64,0.8)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#F87171'; e.currentTarget.style.background = 'rgba(192,57,43,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(74,70,64,0.8)'; e.currentTarget.style.background = 'transparent' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex justify-center p-2.5 rounded-xl transition-colors"
            style={{ color: 'rgba(74,70,64,0.8)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#F87171'; e.currentTarget.style.background = 'rgba(192,57,43,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(74,70,64,0.8)'; e.currentTarget.style.background = 'transparent' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        )}
      </div>
    </aside>
  )
}
