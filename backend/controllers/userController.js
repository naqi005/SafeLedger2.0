const bcrypt   = require('bcryptjs')
const { body } = require('express-validator')
const { query } = require('../config/database')
const { send, fail } = require('../utils/response')
const { formatUser } = require('./authController')

// ── GET /api/users/profile ────────────────────────────────────────────────────

const getProfile = async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM users WHERE user_id = $1', [req.user.user_id])
    if (!rows[0]) return fail(res, 'User not found.', 404)
    return send(res, formatUser(rows[0]))
  } catch (err) {
    return fail(res, 'Failed to fetch profile.')
  }
}

// ── PUT /api/users/profile ────────────────────────────────────────────────────

const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body
    const { rows } = await query(
      `UPDATE users
         SET name  = COALESCE(NULLIF($1, ''), name),
             phone = COALESCE(NULLIF($2, ''), phone)
       WHERE user_id = $3 RETURNING *`,
      [name?.trim() || null, phone?.trim() || null, req.user.user_id]
    )
    return send(res, formatUser(rows[0]))
  } catch (err) {
    console.error('[updateProfile]', err.message)
    return fail(res, 'Failed to update profile.')
  }
}

// ── PUT /api/users/change-password ────────────────────────────────────────────

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    const { rows } = await query('SELECT * FROM users WHERE user_id = $1', [req.user.user_id])
    const user = rows[0]

    const valid = await bcrypt.compare(currentPassword, user.password_hash)
    if (!valid) return fail(res, 'Current password is incorrect.', 400)

    const rounds  = parseInt(process.env.BCRYPT_ROUNDS) || 12
    const newHash = await bcrypt.hash(newPassword, rounds)
    await query('UPDATE users SET password_hash = $1 WHERE user_id = $2', [newHash, user.user_id])

    await query(
      `INSERT INTO audit_log (user_id, action, details)
       VALUES ($1, 'PASSWORD_CHANGED', '{}')`,
      [user.user_id]
    )

    return send(res, { message: 'Password changed successfully.' })
  } catch (err) {
    console.error('[changePassword]', err.message)
    return fail(res, 'Failed to change password.')
  }
}

// ── POST /api/users/add-money (deposit) ───────────────────────────────────────

const addMoney = async (req, res) => {
  try {
    const { walletId, amount } = req.body
    const parsedAmount = parseFloat(amount)

    const { rows: wrows } = await query(
      'SELECT * FROM wallets WHERE wallet_id = $1 AND user_id = $2',
      [walletId, req.user.user_id]
    )
    if (!wrows[0]) return fail(res, 'Wallet not found.', 404)

    const wallet = wrows[0]
    if (wallet.status !== 'active') return fail(res, 'Wallet is not active.', 400)

    await query(
      'UPDATE wallets SET balance = balance + $1 WHERE wallet_id = $2',
      [parsedAmount, walletId]
    )

    const { rows: txRows } = await query(
      `INSERT INTO transactions (to_wallet_id, amount, transaction_type, status)
       VALUES ($1, $2, 'deposit', 'success') RETURNING transaction_id`,
      [walletId, parsedAmount]
    )

    await query(
      `INSERT INTO audit_log (transaction_id, user_id, action, details)
       VALUES ($1, $2, 'DEPOSIT', $3)`,
      [
        txRows[0].transaction_id,
        req.user.user_id,
        JSON.stringify({ wallet_id: walletId, amount: parsedAmount, currency: wallet.currency_type }),
      ]
    )

    const { rows: updated } = await query('SELECT * FROM wallets WHERE wallet_id = $1', [walletId])
    return send(res, {
      walletId,
      currency:   wallet.currency_type,
      deposited:  parsedAmount,
      newBalance: parseFloat(updated[0].balance),
    })
  } catch (err) {
    console.error('[addMoney]', err.message)
    return fail(res, 'Failed to add funds.')
  }
}

// ── Validation rules ──────────────────────────────────────────────────────────

const updateProfileRules = [
  body('name').optional().trim().notEmpty().isLength({ max: 100 }),
  body('phone').optional({ nullable: true }).isMobilePhone(),
]

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
]

const addMoneyRules = [
  body('walletId').isUUID().withMessage('Valid wallet ID required'),
  body('amount').isFloat({ gt: 0, max: 100_000 }).withMessage('Amount must be between 0 and 100,000'),
]

module.exports = {
  getProfile, updateProfile, changePassword, addMoney,
  updateProfileRules, changePasswordRules, addMoneyRules,
}