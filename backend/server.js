require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const { testConnection } = require('./config/database')

const authRoutes        = require('./routes/auth')
const walletRoutes      = require('./routes/wallets')
const transactionRoutes = require('./routes/transactions')
const exchangeRoutes    = require('./routes/exchange')
const userRoutes        = require('./routes/users')
const adminRoutes       = require('./routes/admin')
const depositRoutes     = require('./routes/deposits')
const withdrawalRoutes  = require('./routes/withdrawals')

const app  = express()
const PORT = process.env.PORT || 5000

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet())

// Allow any localhost origin in development (handles Vite auto-switching ports)
const corsOrigin = process.env.NODE_ENV === 'production'
  ? process.env.FRONTEND_URL
  : (origin, cb) => {
      if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true)
      cb(new Error('CORS: origin not allowed'))
    }

app.use(cors({ origin: corsOrigin, credentials: true }))

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: false }))

// ── Global rate limiter (200 req / 15 min) ───────────────────────────────────
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
}))

// ── Auth rate limiter (10 attempts / 15 min) ─────────────────────────────────
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts. Please try again later.' },
}))

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes)
app.use('/api/wallets',      walletRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/exchange',     exchangeRoutes)
app.use('/api/users',        userRoutes)
app.use('/api/admin',        adminRoutes)
app.use('/api/deposits',     depositRoutes)
app.use('/api/withdrawals',  withdrawalRoutes)

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', service: 'SafeLedger API', timestamp: new Date().toISOString() })
)

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ message: `${req.method} ${req.path} not found` })
)

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.stack || err.message)
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  })
})

// ── Bootstrap ─────────────────────────────────────────────────────────────────
async function start() {
  await testConnection()
  app.listen(PORT, () => {
    console.log(`\n✅  SafeLedger API  →  http://localhost:${PORT}`)
    console.log(`    Environment  : ${process.env.NODE_ENV || 'development'}`)
    console.log(`    Database     : ${process.env.DB_NAME}@${process.env.DB_HOST}\n`)
  })
}

start().catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
})