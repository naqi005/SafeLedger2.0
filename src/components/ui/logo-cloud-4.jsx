import { InfiniteSlider } from './infinite-slider'
import { ProgressiveBlur } from './progressive-blur'

// Global payment networks & financial infrastructure SafeLedger operates within
// Rendered as typographic wordmarks — reliable on any connection, no broken-image risk
export const SAFELEDGER_PARTNERS = [
  { name: 'VISA',          sub: 'Payment Network'    },
  { name: 'MASTERCARD',    sub: 'Global Network'     },
  { name: 'SWIFT',         sub: 'International Wire' },
  { name: 'STRIPE',        sub: 'Payment Rails'      },
  { name: 'PAYPAL',        sub: 'Digital Payments'   },
  { name: 'WISE',          sub: 'FX Infrastructure'  },
  { name: 'PAYONEER',      sub: 'Cross-Border'       },
  { name: 'WESTERN UNION', sub: 'Global Remittance'  },
  { name: 'RAAST',         sub: 'SBP Fast Payments'  },
  { name: '1LINK',         sub: 'Pakistan Network'   },
]

export function LogoCloud({ partners = SAFELEDGER_PARTNERS }) {
  return (
    <div
      className="relative mx-auto max-w-3xl py-7 md:border-x"
      style={{
        background: `linear-gradient(to right, #08080A, transparent, #08080A)`,
        borderColor: 'rgba(201,151,58,0.12)',
      }}
    >
      {/* Top border line — full-bleed */}
      <div
        className="-translate-x-1/2 -top-px pointer-events-none absolute left-1/2 w-screen border-t"
        style={{ borderColor: 'rgba(201,151,58,0.1)' }}
      />

      <InfiniteSlider gap={56} reverse speed={55} speedOnHover={18}>
        {partners.map((p) => (
          <div
            key={p.name}
            className="flex flex-col items-center gap-0.5 select-none group cursor-default"
          >
            {/* Brand wordmark */}
            <span
              className="font-display text-[0.7rem] tracking-[0.22em] uppercase transition-colors duration-300"
              style={{ color: 'rgba(237,232,220,0.45)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(201,151,58,0.9)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(237,232,220,0.45)' }}
            >
              {p.name}
            </span>
            {/* Sub-label */}
            <span
              className="font-mono-custom text-[0.48rem] tracking-widest uppercase"
              style={{ color: 'rgba(74,70,64,0.7)' }}
            >
              {p.sub}
            </span>
          </div>
        ))}
      </InfiniteSlider>

      {/* Progressive blur — left fade */}
      <ProgressiveBlur
        blurIntensity={1}
        className="pointer-events-none absolute top-0 left-0 h-full w-[160px]"
        direction="left"
      />
      {/* Progressive blur — right fade */}
      <ProgressiveBlur
        blurIntensity={1}
        className="pointer-events-none absolute top-0 right-0 h-full w-[160px]"
        direction="right"
      />

      {/* Bottom border line — full-bleed */}
      <div
        className="-translate-x-1/2 -bottom-px pointer-events-none absolute left-1/2 w-screen border-b"
        style={{ borderColor: 'rgba(201,151,58,0.1)' }}
      />
    </div>
  )
}
