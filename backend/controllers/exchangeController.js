/**
 * Exchange Controller
 *
 * Architecture (Option B — stored procedure owns ALL money logic):
 *   Backend  →  ownership check + same-currency guard + fraud detection + rate lookup
 *   DB proc  →  FOR UPDATE lock → balance check → deduct → credit → audit
 *
 * The stored procedure exchange_currency() is the ONLY place that:
 *   - Reads balance with a row lock
 *   - Validates sufficiency
 *   - Updates both wallet balances atomically
 * The backend never reads balance to decide whether to proceed.
 */

const { body }                            = require('express-validator')
const { query, getClient }                = require('../config/database')
const { send, fail }                      = require('../utils/response')
const { checkRapidFire, checkDailyLimit } = require('../middlewares/fraudDetection')

// ── GET /api/exchange/rates?from=USD&to=PKR ───────────────────────────────────

const getRates = async (req, res) => {
  try {
    const { from, to } = req.query

    if (from && to) {
      const { rows } = await query(
        'SELECT * FROM exchange_rates WHERE from_currency = $1 AND to_currency = $2',
        [from.toUpperCase(), to.toUpperCase()]
      )
      if (!rows[0]) return fail(res, `Rate for ${from}→${to} not available.`, 404)
      const r = rows[0]
      return send(res, {
        from:      r.from_currency,
        to:        r.to_currency,
        rate:      parseFloat(r.rate),
        updatedAt: r.updated_at,
      })
    }

    const { rows } = await query(
      'SELECT * FROM exchange_rates ORDER BY from_currency, to_currency'
    )
    return send(res, rows.map(r => ({
      from:      r.from_currency,
      to:        r.to_currency,
      rate:      parseFloat(r.rate),
      updatedAt: r.updated_at,
    })))
  } catch (err) {
    console.error('[getRates]', err.message)
    return fail(res, 'Failed to fetch exchange rates.')
  }
}

// ── POST /api/exchange/convert ────────────────────────────────────────────────
//
// Flow:
//  1. Ownership check  — both wallets must belong to this user
//  2. Currency guard   — from ≠ to (app-level, no lock needed)
//  3. Fraud gate       — rapid-fire + daily limit
//  4. Rate lookup      — fetch live rate from exchange_rates table
//  5. exchange_currency — stored procedure acquires FOR UPDATE locks,
//                         validates balance, deducts source, credits destination,
//                         and writes audit log
//
// Note: we do NOT read balance here. Only the stored procedure touches
// balance under a row lock — no race condition possible.

const convert = async (req, res) => {
  const client = await getClient()
  try {
    await client.query('BEGIN')

    const { fromWalletId, toWalletId, amount } = req.body
    const userId       = req.user.user_id
    const parsedAmount = parseFloat(amount)

    // 1. Ownership — confirm both wallets belong to the authenticated user
    //    (currency_type only — no balance read)
    const { rows: fw } = await client.query(
      'SELECT wallet_id, currency_type FROM wallets WHERE wallet_id = $1 AND user_id = $2',
      [fromWalletId, userId]
    )
    if (!fw[0]) {
      await client.query('ROLLBACK')
      return fail(res, 'Source wallet not found.', 404)
    }

    const { rows: tw } = await client.query(
      'SELECT wallet_id, currency_type FROM wallets WHERE wallet_id = $1 AND user_id = $2',
      [toWalletId, userId]
    )
    if (!tw[0]) {
      await client.query('ROLLBACK')
      return fail(res, 'Destination wallet not found.', 404)
    }

    // 2. Same-currency guard
    if (fw[0].currency_type === tw[0].currency_type) {
      await client.query('ROLLBACK')
      return fail(res, 'Source and destination currencies must be different.', 400)
    }

    // 3. Fraud gate (app-level checks before acquiring DB locks)
    const rapid = checkRapidFire(userId)
    if (rapid.blocked) {
      await client.query('ROLLBACK')
      return fail(res, rapid.reason, 429)
    }

    const daily = await checkDailyLimit(userId, parsedAmount, fw[0].currency_type, {
      query: (t, p) => client.query(t, p),
    })
    if (daily.blocked) {
      await client.query('ROLLBACK')
      return fail(res, daily.reason, 429)
    }

    // 4. Rate lookup
    const { rows: rr } = await client.query(
      'SELECT rate FROM exchange_rates WHERE from_currency = $1 AND to_currency = $2',
      [fw[0].currency_type, tw[0].currency_type]
    )
    if (!rr[0]) {
      await client.query('ROLLBACK')
      return fail(res, `Exchange rate for ${fw[0].currency_type}→${tw[0].currency_type} is not available.`, 404)
    }

    const rate      = parseFloat(rr[0].rate)
    // Use NUMERIC-safe arithmetic: round to 8 decimal places
    const converted = parseFloat((parsedAmount * rate).toFixed(8))

    // 5. Delegate ALL money movement to stored procedure
    //    Inside: FOR UPDATE lock → balance check → deduct → credit → audit log
    const { rows: sp } = await client.query(
      'SELECT exchange_currency($1, $2, $3, $4, $5) AS txn_id',
      [fw[0].wallet_id, tw[0].wallet_id, parsedAmount, rate, userId]
    )

    await client.query('COMMIT')

    return send(res, {
      _id:             sp[0].txn_id,
      type:            'exchange',
      amount:          parsedAmount,
      convertedAmount: converted,
      currency:        fw[0].currency_type,
      toCurrency:      tw[0].currency_type,
      rate,
      status:          'completed',
      createdAt:       new Date().toISOString(),
    })

  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[exchange]', err.message)

    // Translate stored-procedure exceptions into user-friendly messages
    if (/insufficient balance/i.test(err.message))
      return fail(res, 'Insufficient balance.', 400)
    if (/not active/i.test(err.message))
      return fail(res, 'Wallet is frozen or closed.', 400)
    if (/negative/i.test(err.message))
      return fail(res, 'Transaction would result in a negative balance.', 400)

    return fail(res, 'Exchange failed. Please try again.')
  } finally {
    client.release()
  }
}

// ── Validation rules ──────────────────────────────────────────────────────────

const convertRules = [
  body('fromWalletId').isUUID().withMessage('Valid source wallet ID required'),
  body('toWalletId').isUUID().withMessage('Valid destination wallet ID required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
]

module.exports = { getRates, convert, convertRules }