/**
 * Fraud detection helpers.
 *
 * 1. Rapid-fire detection  — tracks transaction timestamps per user in memory.
 *    If a user exceeds MAX_TRANSACTIONS_PER_MINUTE within a 60-second window,
 *    the transaction is blocked with HTTP 429.
 *
 * 2. Daily transfer limit  — queries the DB for the user's total outbound
 *    value today (in USD equivalent) and blocks if it would exceed the limit.
 */

// In-memory window: userId → [timestamp, ...]
const windows = new Map()
const WINDOW_MS  = 60_000
const MAX_PER_MIN = parseInt(process.env.MAX_TRANSACTIONS_PER_MINUTE) || 5
const DAILY_LIMIT = parseFloat(process.env.DAILY_TRANSFER_LIMIT_USD)  || 10_000

// Static USD conversion rates for the daily-limit check (approximate)
const TO_USD = {
  USD: 1,       PKR: 0.003590, EUR: 1.08700, GBP: 1.26580,
  AED: 0.27230, SAR: 0.26670,  JPY: 0.00669, CAD: 0.73530,
  AUD: 0.65360, CHF: 1.12360,  SGD: 0.74630, HKD: 0.12790,
}

function toUSD(amount, currency) {
  return amount * (TO_USD[currency?.toUpperCase()] ?? 1)
}

// ── 1. Rapid-fire check ──────────────────────────────────────────────────────

function checkRapidFire(userId) {
  const now = Date.now()
  const ts  = (windows.get(userId) ?? []).filter(t => now - t < WINDOW_MS)

  if (ts.length >= MAX_PER_MIN) {
    return {
      blocked: true,
      reason:  `Fraud check: maximum ${MAX_PER_MIN} transactions per minute exceeded.`,
    }
  }

  ts.push(now)
  windows.set(userId, ts)
  return { blocked: false }
}

// ── 2. Daily limit check ─────────────────────────────────────────────────────

async function checkDailyLimit(userId, amount, currency, db) {
  const usdValue = toUSD(parseFloat(amount), currency)
  if (!usdValue) return { blocked: false }

  const dayStart = new Date()
  dayStart.setHours(0, 0, 0, 0)

  // Sum all outbound transfers + exchanges today
  const { rows } = await db.query(
    `SELECT fw.currency_type, COALESCE(SUM(t.amount), 0) AS total
       FROM transactions t
       JOIN wallets fw ON t.from_wallet_id = fw.wallet_id
      WHERE fw.user_id       = $1
        AND t.transaction_type IN ('transfer','exchange')
        AND t.status           = 'success'
        AND t.created_at      >= $2
      GROUP BY fw.currency_type`,
    [userId, dayStart.toISOString()]
  )

  const usedUSD = rows.reduce((sum, r) => sum + toUSD(parseFloat(r.total), r.currency_type), 0)

  if (usedUSD + usdValue > DAILY_LIMIT) {
    return {
      blocked: true,
      reason:  `Daily transfer limit of $${DAILY_LIMIT.toLocaleString()} USD equivalent exceeded.`,
    }
  }
  return { blocked: false }
}

module.exports = { checkRapidFire, checkDailyLimit, toUSD }