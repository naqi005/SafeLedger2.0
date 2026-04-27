import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'

const SQRT_5000 = Math.sqrt(5000)

// Testimonials — real fintech use cases: freelancers, diaspora, importers/exporters, remote workers, compliance officers
const testimonials = [
  {
    tempId: 0,
    testimonial: "As a freelancer billing US clients, SafeLedger lets me hold USD and convert to PKR at real market rates — no hidden bank spreads eating my income.",
    by: "Ayesha R., Freelance UX Designer, Lahore",
    imgSrc: "https://i.pravatar.cc/150?img=1",
  },
  {
    tempId: 1,
    testimonial: "We wire supplier payments to six countries every month. SafeLedger cut our FX costs by 40% and eliminated the 3-day SWIFT delays we used to suffer.",
    by: "Omar A., Director of Operations, Karachi Textiles",
    imgSrc: "https://i.pravatar.cc/150?img=2",
  },
  {
    tempId: 2,
    testimonial: "I send money home to Pakistan every week. SafeLedger beats my bank's rate every single time, and the money lands in minutes — not 3 business days.",
    by: "Tariq M., Software Engineer, Dubai",
    imgSrc: "https://i.pravatar.cc/150?img=3",
  },
  {
    tempId: 3,
    testimonial: "Running a cross-border e-commerce store, I hold EUR, GBP, and USD balances simultaneously. No other platform made multi-currency this simple.",
    by: "Elena V., E-Commerce Founder, London",
    imgSrc: "https://i.pravatar.cc/150?img=4",
  },
  {
    tempId: 4,
    testimonial: "SafeLedger's immutable audit trail saved us during a compliance review. Every transaction timestamped, every chain of custody intact — admissible in regulatory filings.",
    by: "David L., CFO, RegTech Ventures",
    imgSrc: "https://i.pravatar.cc/150?img=5",
  },
  {
    tempId: 5,
    testimonial: "I get paid in USD by my US employer but live in Pakistan. SafeLedger gives me the best PKR conversion rate and it's instant. It changed my financial life.",
    by: "Hamza K., Remote Software Developer, Islamabad",
    imgSrc: "https://i.pravatar.cc/150?img=6",
  },
  {
    tempId: 6,
    testimonial: "We manage payroll for 200+ employees across 8 countries. SafeLedger handles our entire global compensation cycle with zero friction.",
    by: "Sarah J., Global HR Director, ScaleUp Co.",
    imgSrc: "https://i.pravatar.cc/150?img=7",
  },
  {
    tempId: 7,
    testimonial: "The exchange rates are completely transparent — no hidden spreads. I always know exactly what I'm getting. That kind of honesty is rare in financial services.",
    by: "Priya S., CFO, GlobalEdge Imports",
    imgSrc: "https://i.pravatar.cc/150?img=8",
  },
  {
    tempId: 8,
    testimonial: "Our import business converts large PKR amounts to AED and USD regularly. SafeLedger's live rates have saved us millions in annual spread costs alone.",
    by: "Zara B., Trade Finance Manager, Karachi",
    imgSrc: "https://i.pravatar.cc/150?img=9",
  },
  {
    tempId: 9,
    testimonial: "I've used Wise, PayPal, and Remitly. SafeLedger beats all three on the Pakistan corridor — better rates, faster settlement, cleaner UX. No comparison.",
    by: "Asad N., Business Analyst, Islamabad",
    imgSrc: "https://i.pravatar.cc/150?img=10",
  },
  {
    tempId: 10,
    testimonial: "As a Pakistani expat in Saudi Arabia, I send money home every month. SafeLedger is 3× cheaper than Western Union and the transfer is instant.",
    by: "Bilal F., Civil Engineer, Riyadh",
    imgSrc: "https://i.pravatar.cc/150?img=11",
  },
  {
    tempId: 11,
    testimonial: "AES-256 encryption and a cryptographic audit trail. This is bank-grade security — our CISO approved it in 30 minutes. That never happens.",
    by: "Michael T., VP Engineering, FinSec Solutions",
    imgSrc: "https://i.pravatar.cc/150?img=12",
  },
  {
    tempId: 12,
    testimonial: "I invoice in USD, receive in EUR, and spend in GBP — all from one vault. SafeLedger is the only platform that handles this elegantly without charging a fortune.",
    by: "Sophie R., Digital Consultant, Berlin",
    imgSrc: "https://i.pravatar.cc/150?img=13",
  },
  {
    tempId: 13,
    testimonial: "Real-time rates, zero hidden spreads. For the first time I genuinely feel I'm being treated fairly by a financial service. That says everything.",
    by: "James K., Import-Export Director, Lahore",
    imgSrc: "https://i.pravatar.cc/150?img=14",
  },
  {
    tempId: 14,
    testimonial: "We onboarded our entire finance team in one afternoon. The interface is intuitive even for team members who aren't remotely tech-savvy.",
    by: "Rosa M., Finance Manager, StartupBridge",
    imgSrc: "https://i.pravatar.cc/150?img=15",
  },
  {
    tempId: 15,
    testimonial: "The P2P transfers are genuinely instant. Money leaves my account and arrives at the recipient in under 3 seconds. I've timed it dozens of times.",
    by: "Usman Q., Product Manager, PakFinance",
    imgSrc: "https://i.pravatar.cc/150?img=16",
  },
  {
    tempId: 16,
    testimonial: "SafeLedger's cryptographic timestamps are now part of our compliance backbone. Every cross-border remittance is documented to the millisecond.",
    by: "Nadia H., Compliance Officer, FinReg Asia",
    imgSrc: "https://i.pravatar.cc/150?img=17",
  },
  {
    tempId: 17,
    testimonial: "I manage investments across three continents. SafeLedger keeps my FX exposure minimal and my portfolio truly borderless. This is what modern finance looks like.",
    by: "Chen W., Private Investor, Hong Kong",
    imgSrc: "https://i.pravatar.cc/150?img=18",
  },
  {
    tempId: 18,
    testimonial: "The PKR-to-USD corridor has always been painful in Pakistan. SafeLedger finally fixed it. I saved over ₨500,000 in bank fees this year alone.",
    by: "Faisal A., Online Business Owner, Karachi",
    imgSrc: "https://i.pravatar.cc/150?img=19",
  },
  {
    tempId: 19,
    testimonial: "Institutional-grade security with a consumer-grade UX. That balance is incredibly rare. Worth every minute we spent migrating away from our old provider.",
    by: "Mariam O., Head of Treasury, Emirates Trade Co.",
    imgSrc: "https://i.pravatar.cc/150?img=20",
  },
]

// ── Corner cut clip-path ──────────────────────────────────────────────────────
const CLIP = `polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)`

function TestimonialCard({ position, testimonial, handleMove, cardSize }) {
  const isCenter = position === 0

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer border-2 p-8 transition-all duration-500 ease-in-out",
        isCenter
          ? "z-10"
          : "z-0 hover:border-gold/50"
      )}
      style={{
        width: cardSize,
        height: cardSize,
        clipPath: CLIP,
        background: isCenter ? '#C9973A' : '#0F1015',
        borderColor: isCenter ? '#C9973A' : 'rgba(201,151,58,0.18)',
        transform: `
          translate(-50%, -50%)
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        boxShadow: isCenter
          ? '0px 8px 0px 4px rgba(201,151,58,0.22)'
          : '0px 0px 0px 0px transparent',
      }}
    >
      {/* Art Deco corner cut diagonal line */}
      <span
        className="absolute block origin-top-right rotate-45"
        style={{
          background: isCenter ? 'rgba(12,8,0,0.2)' : 'rgba(201,151,58,0.18)',
          right: -2,
          top: 48,
          width: SQRT_5000,
          height: 2,
        }}
      />

      {/* Avatar */}
      <img
        src={testimonial.imgSrc}
        alt={testimonial.by.split(',')[0]}
        className="mb-4 h-14 w-12 object-cover object-top"
        style={{
          boxShadow: `3px 3px 0px #08080A`,
        }}
      />

      {/* Quote */}
      <h3
        className={cn(
          "text-base sm:text-xl font-medium leading-snug",
          isCenter ? "text-[#0C0800]" : "text-chalk"
        )}
      >
        "{testimonial.testimonial}"
      </h3>

      {/* Author */}
      <p
        className={cn(
          "absolute bottom-8 left-8 right-8 mt-2 text-sm italic font-display tracking-wide",
          isCenter ? "text-[#0C0800]/70" : "text-smoke"
        )}
      >
        — {testimonial.by}
      </p>
    </div>
  )
}

export function StaggerTestimonials() {
  const [cardSize, setCardSize] = useState(365)
  const [testimonialsList, setTestimonialsList] = useState(testimonials)

  const handleMove = (steps) => {
    const newList = [...testimonialsList]
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift()
        if (!item) return
        newList.push({ ...item, tempId: Math.random() })
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop()
        if (!item) return
        newList.unshift({ ...item, tempId: Math.random() })
      }
    }
    setTestimonialsList(newList)
  }

  useEffect(() => {
    const updateSize = () => {
      setCardSize(window.matchMedia("(min-width: 640px)").matches ? 365 : 290)
    }
    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: 600,
        background: 'rgba(15,16,21,0.4)',
      }}
    >
      {testimonialsList.map((testimonial, index) => {
        const position = testimonialsList.length % 2
          ? index - (testimonialsList.length + 1) / 2
          : index - testimonialsList.length / 2
        return (
          <TestimonialCard
            key={testimonial.tempId}
            testimonial={testimonial}
            handleMove={handleMove}
            position={position}
            cardSize={cardSize}
          />
        )
      })}

      {/* Navigation */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        <button
          onClick={() => handleMove(-1)}
          className="flex h-14 w-14 items-center justify-center transition-all duration-200 border-2 hover:bg-gold hover:text-[#0C0800] focus-visible:outline-none"
          style={{
            background: '#08080A',
            borderColor: 'rgba(201,151,58,0.25)',
            color: '#8A8278',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9973A' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,151,58,0.25)'; e.currentTarget.style.color = '#8A8278' }}
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => handleMove(1)}
          className="flex h-14 w-14 items-center justify-center transition-all duration-200 border-2 hover:bg-gold hover:text-[#0C0800] focus-visible:outline-none"
          style={{
            background: '#08080A',
            borderColor: 'rgba(201,151,58,0.25)',
            color: '#8A8278',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9973A' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,151,58,0.25)'; e.currentTarget.style.color = '#8A8278' }}
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
