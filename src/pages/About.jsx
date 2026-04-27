import React from 'react'
import TeamShowcase from '../components/ui/TeamShowcase'

export default function About() {
  return (
    <div className="p-5 sm:p-6 space-y-10 animate-fade-in">

      {/* ── Header ── */}
      <div className="text-center space-y-3 pt-2">
        <p className="font-display text-[0.6rem] tracking-[0.3em] uppercase"
          style={{ color: 'rgba(201,151,58,0.6)' }}>The People Behind</p>
        <h2 className="font-display text-chalk text-2xl sm:text-3xl font-bold tracking-wide">
          Meet The <span style={{ background: 'linear-gradient(135deg,#D4AF37,#C9973A)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Team</span>
        </h2>
        <p className="text-smoke text-sm leading-relaxed max-w-md mx-auto">
          SafeLedger 2.0 was built by four developers passionate about secure, modern financial technology.
        </p>
      </div>

      {/* ── Divider ── */}
      <div className="flex items-center gap-4 max-w-4xl mx-auto px-4">
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(201,151,58,0.2))' }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(201,151,58,0.5)' }} />
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(201,151,58,0.2))' }} />
      </div>

      {/* ── Team Showcase ── */}
      <TeamShowcase />

      {/* ── Footer note ── */}
      <div className="text-center pb-4">
        <p className="font-display text-[0.6rem] tracking-[0.2em] uppercase" style={{ color: 'rgba(201,151,58,0.25)' }}>
          SafeLedger 2.0 &mdash; Built with precision
        </p>
      </div>
    </div>
  )
}
