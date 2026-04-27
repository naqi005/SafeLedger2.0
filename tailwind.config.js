/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // backward-compat aliases used across pages
        dark: {
          DEFAULT: '#08080A',
          card: '#0F1015',
          border: 'rgba(201,151,58,0.12)',
          hover: '#141620',
        },
        gold: {
          DEFAULT: '#C9973A',
          light: '#E8C97A',
          dark: '#7A5918',
        },
        // shadcn-compat aliases — used by /components/ui components
        primary: {
          DEFAULT: '#C9973A',
          foreground: '#0C0800',
        },
        foreground: '#EDE8DC',
        background: '#08080A',
        muted: {
          DEFAULT: '#141620',
          foreground: '#8A8278',
        },
        card: {
          DEFAULT: '#0F1015',
          foreground: '#EDE8DC',
        },
        secondary: {
          DEFAULT: '#0F1015',
          foreground: '#8A8278',
        },
        ring: '#C9973A',
        input: 'rgba(201,151,58,0.25)',
        accent: {
          DEFAULT: '#141620',
          foreground: '#EDE8DC',
        },
        destructive: {
          DEFAULT: '#C0392B',
          foreground: '#EDE8DC',
        },
        border: 'rgba(201,151,58,0.18)',
        popover: {
          DEFAULT: '#0F1015',
          foreground: '#EDE8DC',
        },
        // new design tokens
        void: '#08080A',
        obsidian: '#0F1015',
        graphite: '#141620',
        chalk: '#EDE8DC',
        smoke: '#8A8278',
        ember: '#4A4640',
      },
      fontFamily: {
        sans:    ['"DM Sans"',  'system-ui', 'sans-serif'],
        display: ['Cinzel',    'Georgia',   'serif'],
        mono:    ['"DM Mono"', 'monospace'],
      },
      boxShadow: {
        gold:       '0 0 24px rgba(201,151,58,0.18)',
        'gold-lg':  '0 0 48px rgba(201,151,58,0.22)',
        card:       '0 2px 12px rgba(0,0,0,0.6)',
        'inner-gold': 'inset 0 1px 0 rgba(201,151,58,0.15)',
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-out both',
        'fade-up':    'fadeUp 0.6s ease-out both',
        'slide-up':   'slideUp 0.4s ease-out both',
        'scale-in':   'scaleIn 0.35s ease-out both',
        'shimmer':    'shimmerSweep 3.5s linear infinite',
        'pulse-gold': 'pulseGold 2.5s ease-in-out infinite',
        'float':      'float 7s ease-in-out infinite',
        'marquee':           'marquee 22s linear infinite',
        'accordion-down':   'accordionDown 0.2s ease-out',
        'accordion-up':     'accordionUp 0.2s ease-out',
      },
      keyframes: {
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeUp:   { from: { opacity: '0', transform: 'translateY(28px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideUp:  { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:  { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
        shimmerSweep: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        pulseGold: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(201,151,58,0)' },
          '50%':     { boxShadow: '0 0 24px 4px rgba(201,151,58,0.2)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-10px)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        accordionDown: {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        accordionUp: {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
      },
    },
  },
  plugins: [],
}
