import React from 'react'

const DEFAULT_CARDS = [
  {
    title: 'Card one',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    gradientFrom: '#C9973A',
    gradientTo: '#7A5918',
  },
]

export default function SkewCards({ cards = DEFAULT_CARDS }) {
  return (
    <>
      <div className="flex justify-center items-center flex-wrap">
        {cards.map(({ title, desc, gradientFrom, gradientTo, icon: Icon }, idx) => (
          <div
            key={idx}
            className="group relative w-[300px] h-[380px] m-[36px_24px] transition-all duration-500"
          >
            {/* Skewed gradient panel */}
            <span
              className="absolute top-0 left-[50px] w-1/2 h-full rounded-xl transform skew-x-[15deg] transition-all duration-500 group-hover:skew-x-0 group-hover:left-[20px] group-hover:w-[calc(100%-40px)]"
              style={{ background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})` }}
            />
            {/* Blurred glow duplicate */}
            <span
              className="absolute top-0 left-[50px] w-1/2 h-full rounded-xl transform skew-x-[15deg] blur-[28px] opacity-60 transition-all duration-500 group-hover:skew-x-0 group-hover:left-[20px] group-hover:w-[calc(100%-40px)]"
              style={{ background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})` }}
            />

            {/* Corner blur blobs */}
            <span className="pointer-events-none absolute inset-0 z-10">
              <span
                className="absolute top-0 left-0 w-0 h-0 rounded-xl opacity-0 transition-all duration-300
                  group-hover:top-[-44px] group-hover:left-[44px] group-hover:w-[88px] group-hover:h-[88px] group-hover:opacity-100"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(10px)',
                  animation: 'skew-blob 2s ease-in-out infinite',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.12)',
                }}
              />
              <span
                className="absolute bottom-0 right-0 w-0 h-0 rounded-xl opacity-0 transition-all duration-500
                  group-hover:bottom-[-44px] group-hover:right-[44px] group-hover:w-[88px] group-hover:h-[88px] group-hover:opacity-100"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(10px)',
                  animationDelay: '-1s',
                  animation: 'skew-blob 2s ease-in-out infinite',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.12)',
                }}
              />
            </span>

            {/* Card content */}
            <div
              className="relative z-20 left-0 p-[20px_32px] h-full rounded-xl text-white transition-all duration-500 group-hover:left-[-20px] group-hover:p-[48px_32px] flex flex-col justify-between"
              style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
            >
              <div>
                {/* Icon */}
                {Icon && (
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                    style={{
                      background: `linear-gradient(135deg, ${gradientFrom}25, ${gradientTo}25)`,
                      border: `1px solid ${gradientFrom}40`,
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      strokeWidth={1.5}
                      style={{ color: gradientFrom }}
                    />
                  </div>
                )}

                <h2
                  className="font-display text-base font-semibold tracking-wider uppercase mb-3 leading-tight"
                  style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
                >
                  {title}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(237,232,220,0.75)' }}>
                  {desc}
                </p>
              </div>

              {/* Bottom accent line */}
              <div
                className="mt-6 h-px w-0 group-hover:w-full transition-all duration-700"
                style={{ background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`, opacity: 0.5 }}
              />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes skew-blob {
          0%, 100% { transform: translateY(8px); }
          50%       { transform: translate(-8px); }
        }
      `}</style>
    </>
  )
}
