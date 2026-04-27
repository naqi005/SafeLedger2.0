import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TextScramble } from '../components/ui/text-scramble'
import { StaggerTestimonials } from '../components/ui/stagger-testimonials'
import { LogoCloud } from '../components/ui/logo-cloud-4'
import { HeroSection } from '../components/ui/hero-section'
import { FeatureCard } from '../components/ui/grid-feature-cards'
import SkewCards from '../components/ui/gradient-card-showcase'
import { motion, useReducedMotion } from 'motion/react'
import {
  ShieldCheck, Zap, CreditCard, ArrowLeftRight, ClipboardList, Users,
  UserPlus, Wallet, Globe
} from 'lucide-react'
import { PixelCanvas } from '../components/ui/pixel-canvas'
import { FaqsSection } from '../components/ui/faqs-1'

const CURRENCIES = ['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'JPY', 'CHF', 'CAD', 'AUD', 'SGD', 'HKD', 'PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'JPY', 'CHF', 'CAD', 'AUD', 'SGD', 'HKD']

const FEATURES = [
  {
    title: 'Sovereign Security',
    icon: ShieldCheck,
    description: 'AES-256 encryption, multi-factor authentication, and a cryptographic audit trail that is admissible in regulatory filings. Bank-grade protection — not startup-grade.',
    gradientFrom: '#C9973A',
    gradientTo:   '#7A5918',
  },
  {
    title: 'Instant P2P Transfers',
    icon: Zap,
    description: 'Send to any SafeLedger user by email. Funds settle in under 3 seconds — no routing numbers, no SWIFT delays, no correspondent bank fees eating your balance.',
    gradientFrom: '#E8C97A',
    gradientTo:   '#F97316',
  },
  {
    title: '30+ Currency Wallets',
    icon: CreditCard,
    description: 'Hold PKR, USD, EUR, GBP, AED, SAR, JPY, and 24 more currencies in separate wallets. Switch between them instantly — without losing value to forced conversion.',
    gradientFrom: '#C9973A',
    gradientTo:   '#0EA5E9',
  },
  {
    title: 'Live Exchange Rates',
    icon: ArrowLeftRight,
    description: 'Real-time mid-market rates with zero hidden spreads. Unlike banks that charge 2–5% above interbank rates, what you see is exactly what you get — always.',
    gradientFrom: '#10B981',
    gradientTo:   '#C9973A',
  },
  {
    title: 'Immutable Audit Trail',
    icon: ClipboardList,
    description: 'Every transaction carries a cryptographic timestamp and an unalterable chain of custody. Compliance officers and regulators trust the ledger — because no one can alter it.',
    gradientFrom: '#C9973A',
    gradientTo:   '#8B5CF6',
  },
  {
    title: 'Peer-to-Peer',
    icon: Users,
    description: 'No bank required between sender and receiver. SafeLedger connects users directly — cutting out the intermediaries who add latency, fees, and opacity to every transfer.',
    gradientFrom: '#3B82F6',
    gradientTo:   '#C9973A',
  },
]

// Adapter: map FEATURES to the shape SkewCards expects
const SKEW_CARDS = FEATURES.map(f => ({
  title:        f.title,
  desc:         f.description,
  gradientFrom: f.gradientFrom,
  gradientTo:   f.gradientTo,
  icon:         f.icon,
}))

function AnimatedContainer({ className, delay = 0.1, children }) {
  const shouldReduceMotion = useReducedMotion()
  if (shouldReduceMotion) return children
  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Operational stats — distinct from hero trust metrics (users/volume/currencies/uptime)
const STATS = [
  { value: '142+',  label: 'Countries'       },
  { value: '<3s',   label: 'Transfer Speed'  },
  { value: '$0',    label: 'Hidden Fees'     },
  { value: '24/7',  label: 'Support'         },
]

function StatCounter({ value, label, delay }) {
  return (
    <div
      className="text-center animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="font-display text-4xl sm:text-5xl font-bold gold-shimmer-text leading-none mb-2">{value}</p>
      <p className="text-smoke text-xs font-display uppercase tracking-widest">{label}</p>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-void overflow-x-hidden">

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 px-6 pt-3">
        <div className="mx-auto max-w-5xl px-6 py-3.5 flex items-center justify-between rounded-2xl"
          style={{
            background: 'rgba(15, 16, 21, 0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(201,151,58,0.12)',
          }}>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center shadow-gold">
              <span className="font-display text-xs font-bold text-[#0C0800]">SL</span>
            </div>
            <span className="font-display text-white text-sm font-semibold tracking-wider">SAFELEDGER</span>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link to="/login"
              className="text-smoke hover:text-chalk text-sm font-medium transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link to="/register" className="btn-gold text-xs py-2.5 px-5">
              Open Account
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <HeroSection
        onGetStarted={() => navigate('/register')}
        onLearnMore={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
      />

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(201,151,58,0.04), transparent)' }} />
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(201,151,58,0.3), transparent)' }} />
        <div className="absolute inset-x-0 bottom-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(201,151,58,0.3), transparent)' }} />

        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12">
          {STATS.map((s, i) => (
            <StatCounter key={s.label} value={s.value} label={s.label} delay={i * 100} />
          ))}
        </div>
      </section>

      {/* ── Payment Network ──────────────────────────────────────────────── */}
      <section className="relative py-16 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center mb-8">
          <p className="text-smoke text-xs font-display tracking-[0.3em] uppercase mb-2">
            Payment Ecosystem
          </p>
          <h2 className="font-display font-black text-2xl md:text-3xl tracking-tight">
            <span className="gold-text">Global Financial Infrastructure</span>
          </h2>
          <p className="text-ember text-xs font-display tracking-wider mt-2">
            Operating within the world's leading payment networks
          </p>
        </div>
        <LogoCloud />
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-28 px-6 relative">
        <div className="mx-auto w-full max-w-5xl space-y-8 px-4">
          <AnimatedContainer className="mx-auto max-w-3xl text-center">
            <p className="font-display text-gold text-xs tracking-[0.25em] uppercase mb-5">Why SafeLedger</p>
            <h2 className="font-display text-3xl font-bold tracking-wide text-balance md:text-4xl lg:text-5xl xl:font-extrabold text-chalk">
              Everything You Need.<br/>
              <span className="gold-text">Nothing You Don't.</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-sm tracking-wide text-balance md:text-base">
              A complete financial toolkit engineered for speed, security, and elegance.
            </p>
          </AnimatedContainer>

          <AnimatedContainer delay={0.4}>
            <SkewCards cards={SKEW_CARDS} />
          </AnimatedContainer>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Section header */}
          <AnimatedContainer className="text-center mb-16">
            <p className="font-display text-gold text-xs tracking-[0.25em] uppercase mb-5">Process</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-chalk">
              Three Steps to<br/><span className="gold-text">Financial Freedom</span>
            </h2>
          </AnimatedContainer>

          {/* Step cards */}
          <AnimatedContainer delay={0.35} className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">

            {[
              {
                step: 'I',
                icon: UserPlus,
                title: 'Create Account',
                desc: 'Register with your email in under 2 minutes — no branch visits, no paperwork, no waiting. Your vault is ready instantly.',
                colors: ['#C9973A', '#E8C97A', '#7A5918', '#A87830'],
              },
              {
                step: 'II',
                icon: Wallet,
                title: 'Fund Your Wallets',
                desc: 'Open wallets in PKR, USD, EUR, GBP, AED and 26 more currencies. Each wallet holds and tracks your balance independently.',
                colors: ['#E8C97A', '#C9973A', '#F0D890', '#B8861A'],
              },
              {
                step: 'III',
                icon: Globe,
                title: 'Transact Globally',
                desc: 'Send by email, exchange at live mid-market rates, and receive from anywhere in the world — all settled in under 3 seconds.',
                colors: ['#7A5918', '#C9973A', '#E8C97A', '#5A3D08'],
              },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div
                  key={item.step}
                  className="group relative overflow-hidden rounded-2xl cursor-default transition-all duration-500 focus:outline-none"
                  style={{
                    background: '#0F1015',
                    border: '1px solid rgba(201,151,58,0.14)',
                  }}
                  tabIndex={0}
                >
                  {/* Pixel canvas — fills card on hover */}
                  <PixelCanvas
                    gap={8}
                    speed={30}
                    colors={item.colors}
                    variant="icon"
                  />

                  {/* Hover border glow */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ border: '1px solid rgba(201,151,58,0.5)', boxShadow: '0 0 32px rgba(201,151,58,0.12) inset' }}
                  />

                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center text-center p-8 pt-10">

                    {/* Icon container */}
                    <div className="relative mb-6">
                      {/* Art Deco corner brackets on the icon */}
                      <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 border-t border-l border-[#C9973A] opacity-40 group-hover:opacity-80 transition-opacity duration-300" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 border-b border-r border-[#C9973A] opacity-40 group-hover:opacity-80 transition-opacity duration-300" />

                      <div
                        className="w-[72px] h-[72px] rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-300 group-hover:shadow-gold"
                        style={{
                          background: 'linear-gradient(135deg, #7A5918 0%, #C9973A 50%, #E8C97A 100%)',
                        }}
                      >
                        <span className="font-display text-[10px] font-bold text-[#0C0800] tracking-widest opacity-70 leading-none">
                          {item.step}
                        </span>
                        <Icon className="w-6 h-6 text-[#0C0800]" strokeWidth={1.5} />
                      </div>
                    </div>

                    <h3 className="font-display text-sm font-semibold text-chalk tracking-wider uppercase mb-3 group-hover:text-gold transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-smoke text-sm leading-relaxed group-hover:text-chalk/80 transition-colors duration-300">
                      {item.desc}
                    </p>

                    {/* Bottom accent line */}
                    <div
                      className="mt-8 w-8 h-px opacity-0 group-hover:opacity-100 group-hover:w-16 transition-all duration-500"
                      style={{ background: 'linear-gradient(90deg, transparent, #C9973A, transparent)' }}
                    />
                  </div>
                </div>
              )
            })}
          </AnimatedContainer>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="py-28 px-6 relative overflow-hidden">
        {/* Section header */}
        <div className="max-w-6xl mx-auto mb-6 text-center">
          <p className="font-display text-gold text-xs tracking-[0.25em] uppercase mb-5">User Stories</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-chalk leading-tight mb-4">
            Real Users.<br/>
            <span className="gold-text">Real Results.</span>
          </h2>
          <p className="text-smoke text-sm max-w-lg mx-auto mb-2">
            From Pakistani freelancers billing in USD to global finance directors managing 8-country payroll — this is what SafeLedger makes possible.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <StaggerTestimonials />
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        {/* top separator */}
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(201,151,58,0.25), transparent)' }} />

        <AnimatedContainer>
          <FaqsSection />
        </AnimatedContainer>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card-deco p-12 sm:p-16 hover:shadow-gold transition-shadow duration-500">
            {/* Top gold accent */}
            <div className="absolute top-0 inset-x-0 h-px gold-gradient-h opacity-60" />

            <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-8 shadow-gold">
              <span className="font-display text-base font-bold text-[#0C0800]">SL</span>
            </div>

            <div className="gold-rule mb-8"><span className="text-gold opacity-60">◆</span></div>

            <h2 className="font-display text-3xl sm:text-4xl font-bold text-chalk mb-5 leading-tight">
              Your Money Moves<br/>at the Speed of Trust.
            </h2>
            <p className="text-smoke mb-10 max-w-md mx-auto">
              No hidden fees. No SWIFT delays. No bank intermediaries. Open your SafeLedger vault in under 2 minutes and start transacting globally today.
            </p>
            <Link to="/register" className="btn-gold text-xs py-4 px-12">
              Open Free Account
            </Link>

            <div className="gold-rule mt-10"><span className="text-gold opacity-60">◆</span></div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="px-6 pt-20 pb-10" style={{ borderTop: '1px solid rgba(201,151,58,0.1)' }}>
        <div className="max-w-7xl mx-auto">

          {/* ── Main footer grid ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-14"
            style={{ borderBottom: '1px solid rgba(201,151,58,0.07)' }}>

            {/* Brand column */}
            <div className="lg:col-span-2 space-y-5">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center shadow-gold">
                  <span className="font-display text-[10px] font-bold text-[#0C0800]">SL</span>
                </div>
                <div>
                  <p className="font-display text-chalk text-sm font-semibold tracking-wider">SAFELEDGER</p>
                  <p className="font-display text-[0.52rem] tracking-[0.15em] uppercase" style={{ color: 'rgba(201,151,58,0.5)' }}>
                    Digital Vault
                  </p>
                </div>
              </Link>

              <p className="text-smoke text-sm leading-relaxed max-w-xs">
                A premium peer-to-peer digital wallet and multi-currency exchange. Move money globally with institutional-grade security and zero hidden fees.
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-2">
                {['AES-256 Encrypted', 'ISO 27001', 'P2P Secured', 'Zero Fees'].map(badge => (
                  <span key={badge}
                    className="font-display text-[0.55rem] tracking-[0.12em] uppercase px-2.5 py-1 rounded-md"
                    style={{ background: 'rgba(201,151,58,0.06)', border: '1px solid rgba(201,151,58,0.14)', color: 'rgba(201,151,58,0.7)' }}>
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Product links */}
            <div>
              <p className="font-display text-[0.6rem] tracking-[0.2em] uppercase text-smoke mb-5">Product</p>
              <ul className="space-y-3">
                {[
                  { label: 'Dashboard',           to: '/dashboard'    },
                  { label: 'Multi-Currency Wallets', to: '/wallets'   },
                  { label: 'Send Money',            to: '/send'       },
                  { label: 'Live Exchange',         to: '/exchange'   },
                  { label: 'Transaction History',   to: '/transactions'},
                ].map(link => (
                  <li key={link.label}>
                    <Link to={link.to}
                      className="text-smoke text-xs hover:text-gold transition-colors duration-200 font-medium">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company & legal links */}
            <div>
              <p className="font-display text-[0.6rem] tracking-[0.2em] uppercase text-smoke mb-5">Company</p>
              <ul className="space-y-3">
                {[
                  'Security Overview',
                  'Help Center',
                  'Privacy Policy',
                  'Terms of Service',
                  'Contact Us',
                ].map(label => (
                  <li key={label}>
                    <a href="#"
                      className="text-smoke text-xs hover:text-gold transition-colors duration-200 font-medium">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Bottom bar ───────────────────────────────────────────────── */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">

            {/* Copyright */}
            <div className="flex items-center gap-3">
              <span className="font-display text-ember text-[0.6rem] tracking-[0.18em] uppercase">
                © {new Date().getFullYear()} SafeLedger, Inc. · All rights reserved.
              </span>
            </div>

            {/* Kinetic nav — right-aligned */}
            <div className="flex flex-wrap items-center justify-center gap-8">
              <Link to="/register"><TextScramble text="GET STARTED" className="text-[0.65rem]" /></Link>
              <Link to="/login"><TextScramble text="SIGN IN" className="text-[0.65rem]" /></Link>
              <a href="#features"><TextScramble text="FEATURES" className="text-[0.65rem]" /></a>
            </div>

            {/* Tagline */}
            <p className="font-display text-ember text-[0.55rem] tracking-[0.25em] uppercase hidden sm:block">
              Secure · Fast · Global · Private
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
