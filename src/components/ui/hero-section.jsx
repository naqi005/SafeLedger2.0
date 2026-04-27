import { useRef, useEffect, useCallback } from 'react'

/* ─── Animated word-by-word headline ──────────────────────────────────────── */
function AnimatedWords({ text, baseDelay = 200, className = '', wordClassName = '' }) {
  return (
    <div className={`overflow-hidden block ${className}`}>
      {text.split(' ').map((word, wi) => (
        <span
          key={wi}
          className={`word mr-[0.28em] ${wordClassName}`}
          style={{ animationDelay: `${baseDelay + wi * 80}ms` }}
        >
          {word}
        </span>
      ))}
    </div>
  )
}

/* ─── SVG ambient grid ─────────────────────────────────────────────────────── */
function AmbientGrid() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="hero-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(201,151,58,0.055)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hero-grid)" />
      <line className="grid-line" x1="0" y1="33%" x2="100%" y2="33%"
        stroke="rgba(201,151,58,0.08)" strokeWidth="0.5" style={{ animationDelay: '0.4s' }} />
      <line className="grid-line" x1="0" y1="66%" x2="100%" y2="66%"
        stroke="rgba(201,151,58,0.08)" strokeWidth="0.5" style={{ animationDelay: '0.7s' }} />
      <line className="grid-line" x1="25%" y1="0" x2="25%" y2="100%"
        stroke="rgba(201,151,58,0.06)" strokeWidth="0.5" style={{ animationDelay: '1.0s' }} />
      <line className="grid-line" x1="50%" y1="0" x2="50%" y2="100%"
        stroke="rgba(201,151,58,0.05)" strokeWidth="0.5" style={{ animationDelay: '1.3s' }} />
      <line className="grid-line" x1="75%" y1="0" x2="75%" y2="100%"
        stroke="rgba(201,151,58,0.06)" strokeWidth="0.5" style={{ animationDelay: '1.6s' }} />
    </svg>
  )
}

/* ─── Floating ambient orbs ────────────────────────────────────────────────── */
const FLOATERS = [
  { size: 320, top: '5%',  left: '2%',  color: 'rgba(201,151,58,0.055)', delay: '0s',   dur: '9s'  },
  { size: 200, top: '58%', left: '78%', color: 'rgba(201,151,58,0.04)',  delay: '2s',   dur: '11s' },
  { size: 130, top: '18%', left: '72%', color: 'rgba(232,201,122,0.04)', delay: '4s',   dur: '7s'  },
  { size: 100, top: '74%', left: '12%', color: 'rgba(201,151,58,0.065)', delay: '1.5s', dur: '13s' },
]

/* ─── Detail dots ──────────────────────────────────────────────────────────── */
const DOTS = [
  { top: '21%', left: '17%',  delay: '0s'   },
  { top: '44%', left: '87%',  delay: '0.8s' },
  { top: '69%', left: '61%',  delay: '1.6s' },
  { top: '14%', left: '54%',  delay: '2.4s' },
  { top: '81%', left: '34%',  delay: '0.4s' },
  { top: '37%', left: '7%',   delay: '1.2s' },
]

/* ─── Main HeroSection export ──────────────────────────────────────────────── */
export function HeroSection({ onGetStarted, onLearnMore }) {
  const containerRef = useRef(null)
  const gradientRef  = useRef(null)
  const rafRef       = useRef(null)

  /* Mouse-tracking gradient */
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current || !gradientRef.current) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const rect = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width)  * 100
      const y = ((e.clientY - rect.top)  / rect.height) * 100
      gradientRef.current.style.background =
        `radial-gradient(ellipse 700px 520px at ${x}% ${y}%, rgba(201,151,58,0.1) 0%, transparent 65%)`
    })
  }, [])

  /* Click ripple */
  const handleClick = useCallback((e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const ripple = document.createElement('span')
    ripple.style.cssText = `
      position:absolute; left:${x}px; top:${y}px;
      width:60px; height:60px; margin-left:-30px; margin-top:-30px;
      border-radius:50%; pointer-events:none; z-index:5;
      background:radial-gradient(circle, rgba(201,151,58,0.25) 0%, rgba(201,151,58,0) 70%);
      animation:ripple-expand 0.9s cubic-bezier(0.2,0.8,0.4,1) forwards;
    `
    containerRef.current.appendChild(ripple)
    ripple.addEventListener('animationend', () => ripple.remove())
  }, [])

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#08080A', cursor: 'default' }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {/* Ambient SVG grid */}
      <AmbientGrid />

      {/* Mouse-tracking gradient */}
      <div
        ref={gradientRef}
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 700px 520px at 50% 38%, rgba(201,151,58,0.07) 0%, transparent 65%)' }}
      />

      {/* Static radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 35%, rgba(201,151,58,0.045) 0%, transparent 70%)' }}
      />

      {/* Floating orbs */}
      {FLOATERS.map((f, i) => (
        <div key={i} className="floating-element" style={{
          width: f.size, height: f.size, top: f.top, left: f.left,
          background: `radial-gradient(circle, ${f.color} 0%, transparent 70%)`,
          animationDelay: f.delay, animationDuration: f.dur,
        }} />
      ))}

      {/* Detail dots */}
      {DOTS.map((d, i) => (
        <div key={i} className="detail-dot" style={{ top: d.top, left: d.left, animationDelay: d.delay }} />
      ))}

      {/* Corner ornaments */}
      <div className="corner-element corner-element--tl" />
      <div className="corner-element corner-element--tr" />
      <div className="corner-element corner-element--bl" />
      <div className="corner-element corner-element--br" />

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-28 pb-24 max-w-6xl mx-auto w-full">

        {/* Eyebrow */}
        <span
          className="word inline-flex items-center gap-2.5 mb-10 px-5 py-2 rounded-full"
          style={{
            animationDelay: '0ms',
            background: 'rgba(201,151,58,0.07)',
            border: '1px solid rgba(201,151,58,0.22)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9973A] animate-pulse" />
          <span className="font-display text-[#C9973A] text-[0.62rem] tracking-[0.22em] uppercase">
            Trusted by 2.4 Million Users Worldwide
          </span>
        </span>

        {/* Top rule */}
        <div className="word w-full max-w-xs mb-8" style={{ animationDelay: '80ms' }}>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,151,58,0.35))' }} />
            <span className="text-[#C9973A] text-xs opacity-60">◆</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(201,151,58,0.35), transparent)' }} />
          </div>
        </div>

        {/* Headline line 1 — chalk */}
        <AnimatedWords
          text="THE FUTURE OF"
          baseDelay={160}
          className="font-display font-bold text-[#EDE8DC] text-5xl sm:text-6xl lg:text-8xl leading-none tracking-wide mb-3"
          wordClassName="opacity-90"
        />

        {/* Headline line 2 — gold shimmer */}
        <AnimatedWords
          text="DIGITAL FINANCE"
          baseDelay={400}
          className="font-display font-bold text-5xl sm:text-6xl lg:text-8xl leading-none tracking-wide mb-3"
          wordClassName="gold-shimmer-text"
        />

        {/* Bottom rule */}
        <div className="word w-full max-w-xs mb-10 mt-4" style={{ animationDelay: '600ms' }}>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,151,58,0.35))' }} />
            <span className="text-[#C9973A] text-xs opacity-60">◆</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(201,151,58,0.35), transparent)' }} />
          </div>
        </div>

        {/* Subheadline */}
        <p className="word text-[#8A8278] text-lg max-w-xl leading-relaxed mb-14" style={{ animationDelay: '680ms' }}>
          Send, receive, and exchange money globally with institutional-grade security.
          Your premium digital vault for the modern era.
        </p>

        {/* CTAs */}
        <div className="word flex flex-col sm:flex-row gap-4 items-center justify-center mb-14" style={{ animationDelay: '760ms' }}>
          {onGetStarted && (
            <button className="btn-gold text-xs py-4 px-10" onClick={(e) => { e.stopPropagation(); onGetStarted() }}>
              Open Free Account
            </button>
          )}
          {onLearnMore && (
            <button className="btn-outline text-xs py-4 px-10" onClick={(e) => { e.stopPropagation(); onLearnMore() }}>
              Explore Features →
            </button>
          )}
        </div>

        {/* Trust metrics */}
        <div className="word flex flex-wrap items-center justify-center gap-8 sm:gap-14" style={{ animationDelay: '840ms' }}>
          {[
            { value: '2.4M+',  label: 'Users'      },
            { value: '$8.2B',  label: 'Volume'     },
            { value: '30+',    label: 'Currencies' },
            { value: '99.97%', label: 'Uptime'     },
          ].map((m) => (
            <div key={m.label} className="flex flex-col items-center gap-0.5">
              <span
                className="font-display text-2xl font-bold gold-shimmer-text"
                style={{ animationDelay: '840ms' }}
              >
                {m.value}
              </span>
              <span className="font-display text-[#8A8278] text-[0.6rem] tracking-[0.2em] uppercase">
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="word absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ animationDelay: '1000ms' }}>
        <span className="font-display text-[0.55rem] tracking-[0.3em] text-[#4A4640] uppercase">Scroll</span>
        <div className="w-4 h-7 rounded-full flex justify-center pt-1.5" style={{ border: '1px solid #4A4640' }}>
          <div className="w-0.5 h-2 rounded-full" style={{ background: '#C9973A', animation: 'float-ambient 1.8s ease-in-out infinite' }} />
        </div>
      </div>
    </section>
  )
}
