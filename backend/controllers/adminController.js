const bcrypt = require('bcryptjs')
const { query } = require('../config/database')
const { send, fail } = require('../utils/response')
const { formatUser } = require('./authController')

// ── Middleware: admin gate ────────────────────────────────────────────────────

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return fail(res, 'Admin access required.', 403)
  next()
}

// ── GET /api/admin/users ──────────────────────────────────────────────────────

const getAllUsers = async (req, res) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit)  || 50, 500)
    const offset = parseInt(req.query.offset) || 0

    const { rows } = await query(
      `SELECT u.*,
              (SELECT COUNT(*) FROM wallets w WHERE w.user_id = u.user_id)::int AS wallet_count
         FROM users u
        ORDER BY u.created_at DESC
        LIMIT $1 OFFSET $2`,
      [limit, offset]
    )
    return send(res, rows.map(r => ({
      _id:      r.user_id,
      ...formatUser(r),
      wallets:  r.wallet_count,
      status:   r.is_active ? 'active' : 'suspended',
    })))
  } catch (err) {
    console.error('[admin.getAllUsers]', err.message)
    return fail(res, 'Failed to fetch users.')
  }
}

// ── GET /api/admin/transactions ───────────────────────────────────────────────

const getAllTransactions = async (req, res) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit)  || 100, 500)
    const offset = parseInt(req.query.offset) || 0

    const { rows } = await query(
      `SELECT
          t.transaction_id,
          t.transaction_type AS type,
          t.amount,
          COALESCE(fw.currency_type, tw.currency_type) AS currency,
          t.status,
          su.email AS sender_email,
          ru.email AS receiver_email,
          t.metadata,
          t.created_at
        FROM transactions t
        LEFT JOIN wallets fw ON t.from_wallet_id = fw.wallet_id
        LEFT JOIN wallets tw ON t.to_wallet_id   = tw.wallet_id
        LEFT JOIN users   su ON fw.user_id        = su.user_id
        LEFT JOIN users   ru ON tw.user_id        = ru.user_id
        ORDER BY t.created_at DESC
        LIMIT $1 OFFSET $2`,
      [limit, offset]
    )
    return send(res, rows.map(r => ({
      _id:           r.transaction_id,
      type:          r.type,
      amount:        parseFloat(r.amount),
      currency:      r.currency,
      status:        r.status === 'success' ? 'completed' : r.status,
      senderEmail:   r.sender_email,
      receiverEmail: r.receiver_email,
      createdAt:     r.created_at,
    })))
  } catch (err) {
    console.error('[admin.getAllTransactions]', err.message)
    return fail(res, 'Failed to fetch transactions.')
  }
}

// ── PATCH /api/admin/wallets/:id/freeze ───────────────────────────────────────

const freezeWallet = async (req, res) => {
  try {
    const { rows } = await query(
      "UPDATE wallets SET status = 'frozen' WHERE wallet_id = $1 RETURNING wallet_id",
      [req.params.id]
    )
    if (!rows[0]) return fail(res, 'Wallet not found.', 404)

    await query(
      `INSERT INTO audit_log (user_id, action, details)
       VALUES ($1, 'ADMIN_FREEZE_WALLET', $2)`,
      [req.user.user_id, JSON.stringify({ wallet_id: req.params.id })]
    )
    return send(res, { success: true })
  } catch (err) {
    return fail(res, 'Failed to freeze wallet.')
  }
}

// ── PATCH /api/admin/wallets/:id/unfreeze ────────────────────────────────────

const unfreezeWallet = async (req, res) => {
  try {
    const { rows } = await query(
      "UPDATE wallets SET status = 'active' WHERE wallet_id = $1 RETURNING wallet_id",
      [req.params.id]
    )
    if (!rows[0]) return fail(res, 'Wallet not found.', 404)

    await query(
      `INSERT INTO audit_log (user_id, action, details)
       VALUES ($1, 'ADMIN_UNFREEZE_WALLET', $2)`,
      [req.user.user_id, JSON.stringify({ wallet_id: req.params.id })]
    )
    return send(res, { success: true })
  } catch (err) {
    return fail(res, 'Failed to unfreeze wallet.')
  }
}

// ── GET /api/admin/audit-log ──────────────────────────────────────────────────

const getAuditLog = async (req, res) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit)  || 100, 500)
    const offset = parseInt(req.query.offset) || 0

    const { rows } = await query(
      `SELECT al.*, u.email AS user_email
         FROM audit_log al
         LEFT JOIN users u ON al.user_id = u.user_id
        ORDER BY al.timestamp DESC
        LIMIT $1 OFFSET $2`,
      [limit, offset]
    )
    return send(res, rows.map(r => ({
      _id:           r.log_id,
      transactionId: r.transaction_id,
      userEmail:     r.user_email || 'system',
      action:        r.action,
      details:       r.details,
      ipAddress:     r.ip_address,
      timestamp:     r.timestamp,
    })))
  } catch (err) {
    return fail(res, 'Failed to fetch audit log.')
  }
}

// ── PATCH /api/admin/users/:id/suspend ───────────────────────────────────────

const suspendUser = async (req, res) => {
  try {
    if (req.params.id === req.user.user_id)
      return fail(res, 'Cannot suspend your own account.', 400)

    const { rows } = await query(
      'UPDATE users SET is_active = false WHERE user_id = $1 RETURNING user_id',
      [req.params.id]
    )
    if (!rows[0]) return fail(res, 'User not found.', 404)

    await query(
      `INSERT INTO audit_log (user_id, action, details)
       VALUES ($1, 'ADMIN_SUSPEND_USER', $2)`,
      [req.user.user_id, JSON.stringify({ target_user_id: req.params.id })]
    )
    return send(res, { message: 'User suspended.' })
  } catch (err) {
    return fail(res, 'Failed to suspend user.')
  }
}

// ── PATCH /api/admin/users/:id/reactivate ────────────────────────────────────

const reactivateUser = async (req, res) => {
  try {
    const { rows } = await query(
      'UPDATE users SET is_active = true WHERE user_id = $1 RETURNING user_id',
      [req.params.id]
    )
    if (!rows[0]) return fail(res, 'User not found.', 404)

    await query(
      `INSERT INTO audit_log (user_id, action, details)
       VALUES ($1, 'ADMIN_REACTIVATE_USER', $2)`,
      [req.user.user_id, JSON.stringify({ target_user_id: req.params.id })]
    )
    return send(res, { message: 'User reactivated.' })
  } catch (err) {
    return fail(res, 'Failed to reactivate user.')
  }
}

// ── POST /api/admin/users/:id/reset-password ─────────────────────────────────

const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body
    if (!newPassword || newPassword.length < 6)
      return fail(res, 'Password must be at least 6 characters.', 400)

    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12
    const hash   = await bcrypt.hash(newPassword, rounds)

    const { rows } = await query(
      'UPDATE users SET password_hash = $1 WHERE user_id = $2 RETURNING user_id, email',
      [hash, req.params.id]
    )
    if (!rows[0]) return fail(res, 'User not found.', 404)

    // Invalidate all existing sessions so the user must log in with new password
    await query(
      'UPDATE user_sessions SET is_active = false WHERE user_id = $1',
      [req.params.id]
    )

    await query(
      `INSERT INTO audit_log (user_id, action, details)
       VALUES ($1, 'ADMIN_RESET_PASSWORD', $2)`,
      [req.user.user_id, JSON.stringify({ target_user_id: req.params.id, target_email: rows[0].email })]
    )

    return send(res, { message: `Password reset for ${rows[0].email}.` })
  } catch (err) {
    console.error('[admin.resetPassword]', err.message)
    return fail(res, 'Failed to reset password.')
  }
}

module.exports = {
  adminOnly, getAllUsers, getAllTransactions,
  freezeWallet, unfreezeWallet, getAuditLog, suspendUser, reactivateUser,
}