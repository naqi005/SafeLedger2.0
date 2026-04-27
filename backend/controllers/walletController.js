const { body } = require('express-validator')
const { query } = require('../config/database')
const { send, fail } = require('../utils/response')

const SUPPORTED = [
  'PKR','USD','EUR','GBP','AED','SAR','JPY','CAD','AUD','CHF','SGD','HKD',
]

const fmt = (row) => ({
  _id:       row.wallet_id,
  currency:  row.currency_type,
  balance:   parseFloat(row.balance),
  status:    row.status,
  createdAt: row.created_at,
})

// ── GET /api/wallets ──────────────────────────────────────────────────────────

const getAll = async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT * FROM wallets WHERE user_id = $1 ORDER BY created_at ASC',
      [req.user.user_id]
    )
    return send(res, rows.map(fmt))
  } catch (err) {
    console.error('[getWallets]', err.message)
    return fail(res, 'Failed to fetch wallets.')
  }
}

// ── POST /api/wallets ─────────────────────────────────────────────────────────

const create = async (req, res) => {
  try {
    const curr = req.body.currency?.toUpperCase()

    if (!SUPPORTED.includes(curr))
      return fail(res, `Unsupported currency. Supported: ${SUPPORTED.join(', ')}`, 400)

    const exists = await query(
      'SELECT wallet_id FROM wallets WHERE user_id = $1 AND currency_type = $2',
      [req.user.user_id, curr]
    )
    if (exists.rows[0]) return fail(res, `You already have a ${curr} wallet.`, 409)

    const { rows } = await query(
      'INSERT INTO wallets (user_id, currency_type) VALUES ($1, $2) RETURNING *',
      [req.user.user_id, curr]
    )
    return send(res, fmt(rows[0]), 201)
  } catch (err) {
    console.error('[createWallet]', err.message)
    return fail(res, 'Failed to create wallet.')
  }
}

// ── GET /api/wallets/:id ──────────────────────────────────────────────────────

const getById = async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT * FROM wallets WHERE wallet_id = $1 AND user_id = $2',
      [req.params.id, req.user.user_id]
    )
    if (!rows[0]) return fail(res, 'Wallet not found.', 404)
    return send(res, fmt(rows[0]))
  } catch (err) {
    return fail(res, 'Failed to fetch wallet.')
  }
}

// ── PATCH /api/wallets/:id/toggle ─────────────────────────────────────────────

const toggleStatus = async (req, res) => {
  try {
    const { rows: found } = await query(
      'SELECT * FROM wallets WHERE wallet_id = $1 AND user_id = $2',
      [req.params.id, req.user.user_id]
    )
    if (!found[0]) return fail(res, 'Wallet not found.', 404)

    const wallet = found[0]
    if (wallet.status === 'closed') return fail(res, 'Closed wallets cannot be reactivated.', 400)

    const next = wallet.status === 'active' ? 'frozen' : 'active'
    const { rows } = await query(
      'UPDATE wallets SET status = $1 WHERE wallet_id = $2 RETURNING *',
      [next, wallet.wallet_id]
    )
    return send(res, fmt(rows[0]))
  } catch (err) {
    console.error('[toggleWallet]', err.message)
    return fail(res, 'Failed to update wallet.')
  }
}

const createRules = [
  body('currency').notEmpty().withMessage('Currency is required'),
]

module.exports = { getAll, create, getById, toggleStatus, createRules, SUPPORTED }