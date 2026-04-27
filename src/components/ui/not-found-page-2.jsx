import { motion } from 'framer-motion'
import { Compass, Home } from 'lucide-react'
import { Button } from './button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from './empty'

const PRIMARY_ORB_HORIZONTAL_OFFSET = 40
const PRIMARY_ORB_VERTICAL_OFFSET   = 20

export function NotFoundPage() {
  return (
    <div className="w-full relative flex min-h-screen items-center justify-center overflow-hidden text-foreground"
      style={{
        background: 'radial-gradient(circle at center, rgba(201,151,58,0.07) 0%, transparent 70%)',
        backgroundColor: '#08080A',
      }}
    >
      {/* Animated ambient orbs */}
      <div aria-hidden className="-z-10 absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0,  PRIMARY_ORB_HORIZONTAL_OFFSET, -PRIMARY_ORB_HORIZONTAL_OFFSET, 0],
            y: [0,  PRIMARY_ORB_VERTICAL_OFFSET,   -PRIMARY_ORB_VERTICAL_OFFSET,   0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/3 h-72 w-72 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(201,151,58,0.14) 0%, rgba(122,89,24,0.08) 70%)' }}
        />
        <motion.div
          animate={{
            x: [0, -PRIMARY_ORB_HORIZONTAL_OFFSET,  PRIMARY_ORB_HORIZONTAL_OFFSET, 0],
            y: [0, -PRIMARY_ORB_VERTICAL_OFFSET,     PRIMARY_ORB_VERTICAL_OFFSET,   0],
          }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="absolute right-1/4 bottom-1/3 h-80 w-80 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(232,201,122,0.08) 0%, rgba(201,151,58,0.04) 70%)' }}
        />
        {/* Fine grid overlay */}
        <div
          className="absolute inset-0 opacity-100"
          style={{
            backgroundImage:
              'linear-gradient(rgba(201,151,58,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,151,58,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <Empty>
        <EmptyHeader>
          {/* 404 numeral */}
          <EmptyTitle
            className="font-extrabold text-8xl font-display tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #7A5918 0%, #C9973A 40%, #E8C97A 65%, #C9973A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            404
          </EmptyTitle>

          {/* Gold rule */}
          <div className="flex items-center gap-3 w-48 my-1">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,151,58,0.4))' }} />
            <span className="text-[#C9973A] text-xs opacity-60">◆</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(201,151,58,0.4), transparent)' }} />
          </div>

          <EmptyDescription className="text-nowrap text-smoke">
            The page you're looking for might have been <br />
            moved or doesn't exist.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent>
          <div className="flex gap-3">
            <Button asChild>
              <a href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/#features">
                <Compass className="mr-2 h-4 w-4" />
                Explore
              </a>
            </Button>
          </div>

          {/* Brand mark */}
          <div className="flex items-center gap-2 mt-4 opacity-40">
            <div className="w-4 h-4 rounded gold-gradient flex items-center justify-center">
              <span className="font-display text-[7px] font-bold text-[#0C0800]">SL</span>
            </div>
            <span className="font-display text-smoke text-[0.6rem] tracking-widest uppercase">SafeLedger</span>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  )
}
