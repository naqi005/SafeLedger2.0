const { body }             = require('express-validator')
const { query, getClient } = require('../config/database')
const { send, fail }       = require('../utils/response')
const { checkRapidFire, checkDailyLimit } = require('../middlewares/fraudDetection')

// ── POST /api/withdrawals ─────────────────────────────────────────────────────

const createWithdrawal = async (req, res) => {
  const { walletId, amount, method = 'manual' } = req.body
  const parsedAmount = parseFloat(amount)
  const userId = req.user.user_id
  const client = await getClient()

  try {
    // Fraud checks before opening DB transaction
    const rapidFire = checkRapidFire(userId)
    if (rapidFire.blocked) return fail(res, rapidFire.reason, 429)

    await client.query('BEGIN')

    // Verify wallet ownership and get currency
    const { rows: wRows } = await client.query(
      'SELECT wallet_id, currency_type FROM wallets WHERE wallet_id = $1 AND user_id = $2',
      [walletId, userId]
    )
    if (!wRows[0]) {
      await client.query('ROLLBACK')
      return fail(res, 'Wallet not found.', 404)
    }

    const currency = wRows[0].currency_type

    // Daily limit check
    const daily = await checkDailyLimit(userId, parsedAmount, currency, { query })
    if (daily.blocked) {
      await client.query('ROLLBACK')
      return fail(res, daily.reason, 429)
    }

    // Insert pending withdrawal record
    const { rows: wdRows } = await client.query(
      `INSERT INTO withdrawals (wallet_id, amount, method, status)
       VALUES ($1, $2, $3, 'pending') RETURNING withdrawal_id`,
      [walletId, parsedAmount, method]
    )
    const withdrawalId = wdRows[0].withdrawal_id

    // Stored procedure handles: lock → validate balance → debit → transaction record → mark completed → audit
    const { rows: procRows } = await client.query(
      'SELECT process_withdrawal($1, $2, $3, $4) AS txn_id',
      [withdrawalId, walletId, parsedAmount, userId]
    )

    await client.query('COMMIT')

    // Return fresh wallet balance
    const { rows: wallet } = await query(
      'SELECT balance FROM wallets WHERE wallet_id = $1',
      [walletId]
    )

    return send(res, {
      withdrawalId,
      transactionId: procRows[0].txn_id,
      currency,
      withdrawn:     parsedAmount,
      newBalance:    parseFloat(wallet[0].balance),
    }, 201)
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[createWithdrawal]', err.message)

    if (err.message.includes('Insufficient balance'))
      return fail(res, 'Insufficient balance in wallet.', 400)
    if (err.message.includes('not active'))
      return fail(res, 'Wallet is frozen or closed.', 400)

    return fail(res, 'Withdrawal failed. Please try again.')
  } finally {
    client.release()
  }
}

// ── GET /api/withdrawals ──────────────────────────────────────────────────────

const getWithdrawals = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT wd.withdrawal_id, wd.amount, wd.method, wd.status,
              wd.created_at, wd.completed_at,
              w.currency_type AS currency
         FROM withdrawals wd
         JOIN wallets     w  ON w.wallet_id = wd.wallet_id
        WHERE w.user_id = $1
        ORDER BY wd.created_at DESC
        LIMIT 100`,
      [req.user.user_id]
    )
    return send(res, rows.map(r => ({
      id:          r.withdrawal_id,
      amount:      parseFloat(r.amount),
      currency:    r.currency,
      method:      r.method,
      status:      r.status,
      createdAt:   r.created_at,
      completedAt: r.completed_at,
    })))
  } catch (err) {
    console.error('[getWithdrawals]', err.message)
    return fail(res, 'Failed to fetch withdrawals.')
  }
}

// ── Validation ────────────────────────────────────────────────────────────────

const createWithdrawalRules = [
  body('walletId').isUUID().withMessage('Valid wallet ID required'),
  body('amount').isFloat({ gt: 0, max: 1_000_000 }).withMessage('Amount must be between 0 and 1,000,000'),
  body('method').optional().isIn(['manual','bank','atm','card']).withMessage('Invalid method'),
]

module.exports = { createWithdrawal, getWithdrawals, createWithdrawalRules }