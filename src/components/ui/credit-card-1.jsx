import * as React from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Eye, EyeOff, Wifi } from 'lucide-react'
import { cn } from '../../lib/utils'

const PERSPECTIVE = 1000
const CARD_ANIMATION_DURATION = 0.6
const INITIAL_DELAY = 0.2

/* ─── Variant styles ─────────────────────────────────────────────────────── */
const VARIANT_STYLES = {
  gradient: 'bg-gradient-to-br from-[#2A1500] via-[#7A5918] to-[#C9973A]',
  dark:     'bg-gradient-to-br from-[#08080A] via-[#0F1015] to-[#1C1E2A]',
  glass:    'backdrop-blur-xl',
}

const VARIANT_INLINE = {
  gradient: {},
  dark:     { border: '1px solid rgba(201,151,58,0.2)' },
  glass:    { background: 'rgba(201,151,58,0.08)', border: '1px solid rgba(201,151,58,0.2)' },
}

/* ─── Currency accent colors ─────────────────────────────────────────────── */
const CURRENCY_ACCENT = {
  PKR: '#4ADE80',
  USD: '#60A5FA',
  EUR: '#A78BFA',
  GBP: '#F472B6',
  AED: '#34D399',
  SAR: '#FBBF24',
  JPY: '#FB923C',
  CAD: '#F87171',
  AUD: '#22D3EE',
  CHF: '#A3E635',
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function getMaskedNumber(number) {
  const cleaned = number.replace(/\s/g, '')
  return `•••• •••• •••• ${cleaned.slice(-4)}`
}

/* ─── CreditCard component ───────────────────────────────────────────────── */
export default function CreditCard({
  cardNumber  = '4532 1234 5678 9010',
  cardHolder  = 'VALUED MEMBER',
  expiryDate  = '12/28',
  cvv         = '123',
  variant     = 'gradient',
  currency    = 'USD',
  className,
  ...props
}) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [isFlipped,  setIsFlipped]  = React.useState(false)
  const [isClicked,  setIsClicked]  = React.useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-100, 100], [10, -10])
  const rotateY = useTransform(x, [-100, 100], [-10, 10])

  const accent = CURRENCY_ACCENT[currency] || '#C9973A'

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    x.set(e.clientX - (rect.left + rect.width  / 2))
    y.set(e.clientY - (rect.top  + rect.height / 2))
  }
  const handleMouseLeave = () => { x.set(0); y.set(0) }

  return (
    <div className={cn('relative', className)} {...props}>
      {/* Card 3D container */}
      <motion.div
        className="relative w-80 sm:w-96 h-52 sm:h-56"
        style={{ perspective: PERSPECTIVE }}
        initial={{ opacity: 0, scale: 0.85, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: CARD_ANIMATION_DURATION, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="relative w-full h-full cursor-pointer"
          style={{
            transformStyle: 'preserve-3d',
            rotateX,
            rotateY: isFlipped ? 180 : rotateY,
          }}
          animate={{ scale: isClicked ? 0.96 : 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 120, damping: 22 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => {
            setIsClicked(true)
            setTimeout(() => setIsClicked(false), 200)
            setTimeout(() => setIsFlipped(f => !f), 100)
          }}
        >
          {/* ── Card Front ──────────────────────────────────────────────── */}
          <motion.div
            className={cn(
              'absolute inset-0 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden',
              VARIANT_STYLES[variant] || VARIANT_STYLES.gradient,
            )}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              ...VARIANT_INLINE[variant],
            }}
          >
            {/* Shimmer sweep */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.07) 50%, transparent 60%)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['-100% 0', '200% 0'] }}
                transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2, ease: 'linear' }}
              />
            </div>

            {/* Currency accent bar — top edge */}
            <div
              className="absolute top-0 inset-x-0 h-[2px] rounded-t-2xl"
              style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, opacity: 0.7 }}
            />

            <div className="relative h-full flex flex-col justify-between text-white">
              {/* Top row */}
              <div className="flex justify-between items-start">
                <motion.div
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: INITIAL_DELAY }}
                >
                  {/* Chip */}
                  <div
                    className="w-10 h-8 rounded-md shadow-inner flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #E8C97A 0%, #C9973A 40%, #7A5918 100%)',
                    }}
                  >
                    <div className="w-5 h-4 rounded-sm border border-[rgba(0,0,0,0.25)] grid grid-cols-2 gap-0.5 p-0.5">
                      <div className="bg-[rgba(0,0,0,0.15)] rounded-sm" />
                      <div className="bg-[rgba(0,0,0,0.15)] rounded-sm" />
                      <div className="bg-[rgba(0,0,0,0.15)] rounded-sm col-span-2" />
                    </div>
                  </div>
                  <Wifi className="w-5 h-5 rotate-90 opacity-80" />
                </motion.div>

                {/* Eye toggle */}
                <motion.button
                  className="p-1.5 rounded-full transition-colors"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 15 }}
                  whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.25)' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); setIsVisible(v => !v) }}
                >
                  {isVisible
                    ? <EyeOff className="w-3.5 h-3.5" />
                    : <Eye    className="w-3.5 h-3.5" />}
                </motion.button>
              </div>

              {/* Card number */}
              <motion.div
                className="font-mono tracking-[0.18em] text-sm sm:text-base"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {isVisible ? cardNumber : getMaskedNumber(cardNumber)}
              </motion.div>

              {/* Bottom row */}
              <div className="flex justify-between items-end">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="text-[0.58rem] opacity-60 mb-0.5 tracking-widest uppercase">Card Holder</div>
                  <div className="font-display text-xs sm:text-sm font-semibold tracking-wider">
                    {cardHolder}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <div className="text-[0.58rem] opacity-60 mb-0.5 tracking-widest uppercase">Expires</div>
                  <div className="font-mono text-xs sm:text-sm">{isVisible ? expiryDate : '••/••'}</div>
                </motion.div>

                {/* Brand mark — currency badge */}
                <motion.div
                  className="flex flex-col items-end gap-0.5"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                >
                  <div
                    className="font-display text-lg sm:text-xl font-bold tracking-widest"
                    style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
                  >
                    SL
                  </div>
                  <div
                    className="font-display text-[0.55rem] tracking-widest font-semibold px-1.5 py-0.5 rounded"
                    style={{ background: `${accent}25`, color: accent, border: `1px solid ${accent}40` }}
                  >
                    {currency}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* ── Card Back ───────────────────────────────────────────────── */}
          <motion.div
            className={cn(
              'absolute inset-0 rounded-2xl shadow-2xl overflow-hidden',
              VARIANT_STYLES[variant] || VARIANT_STYLES.gradient,
            )}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              ...VARIANT_INLINE[variant],
            }}
          >
            {/* Magnetic strip */}
            <div className="absolute top-7 inset-x-0 h-10 bg-black/80" />

            {/* Signature + CVV panel */}
            <div className="absolute top-[4.5rem] left-5 right-5 h-9 rounded flex items-center justify-between px-3"
              style={{ background: 'rgba(255,255,255,0.92)' }}>
              <div className="flex gap-1">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-3 h-3 rounded-sm"
                    style={{ background: i % 3 === 0 ? '#C9973A' : i % 3 === 1 ? '#7A5918' : '#E8C97A', opacity: 0.6 }} />
                ))}
              </div>
              <motion.div
                className="font-mono font-bold text-black text-sm tracking-widest"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {isVisible ? cvv : '•••'}
              </motion.div>
            </div>

            {/* Card info */}
            <div className="absolute bottom-5 left-6 right-6 text-white/60 text-[0.6rem] space-y-1">
              <p className="font-display tracking-wider uppercase">SafeLedger Digital Wallet</p>
              <p>This card represents your {currency} wallet. Authorized use only.</p>
              <p className="flex items-center gap-2 mt-1">
                <span className="font-display tracking-wider">SAFELEDGER.IO</span>
                <span className="opacity-40">·</span>
                <span>Support: 24/7</span>
              </p>
            </div>

            {/* Currency accent */}
            <div
              className="absolute bottom-0 inset-x-0 h-[2px] rounded-b-2xl"
              style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, opacity: 0.5 }}
            />
          </motion.div>
        </motion.div>

        {/* Ambient orbs — follow click state */}
        <motion.div
          className="absolute -top-3 -right-3 w-16 h-16 rounded-full blur-2xl pointer-events-none"
          style={{ background: `${accent}30` }}
          animate={{
            scale:   isClicked ? [1, 1.8, 1] : [1, 1.3, 1],
            opacity: isClicked ? [0.3, 0.7, 0.3] : [0.3, 0.5, 0.3],
          }}
          transition={{ duration: isClicked ? 0.4 : 3.5, repeat: isClicked ? 0 : Infinity }}
        />
        <motion.div
          className="absolute -bottom-3 -left-3 w-20 h-20 rounded-full blur-2xl pointer-events-none"
          style={{ background: 'rgba(201,151,58,0.2)' }}
          animate={{
            scale:   isClicked ? [1, 2, 1] : [1, 1.4, 1],
            opacity: isClicked ? [0.2, 0.5, 0.2] : [0.2, 0.35, 0.2],
          }}
          transition={{ duration: isClicked ? 0.4 : 4.5, repeat: isClicked ? 0 : Infinity }}
        />

        {/* Click ripple */}
        {isClicked && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            initial={{ scale: 0.85, opacity: 0.4 }}
            animate={{ scale: 1.08, opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ border: '1px solid rgba(201,151,58,0.6)' }}
          />
        )}
      </motion.div>

      {/* Hint */}
      <motion.p
        className="text-center font-display text-[0.58rem] tracking-[0.18em] uppercase mt-4"
        style={{ color: 'rgba(138,130,120,0.5)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Click to flip · Hover to tilt · Eye reveals details
      </motion.p>
    </div>
  )
}
