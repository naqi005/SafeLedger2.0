const { body }         = require('express-validator')
const { query, getClient } = require('../config/database')
const { send, fail }   = require('../utils/response')

// ── POST /api/deposits ────────────────────────────────────────────────────────

const createDeposit = async (req, res) => {
  const { walletId, amount, method = 'manual' } = req.body
  const parsedAmount = parseFloat(amount)
  const client = await getClient()

  try {
    await client.query('BEGIN')

    // Verify wallet belongs to this user
    const { rows: wRows } = await client.query(
      'SELECT wallet_id, currency_type FROM wallets WHERE wallet_id = $1 AND user_id = $2',
      [walletId, req.user.user_id]
    )
    if (!wRows[0]) {
      await client.query('ROLLBACK')
      return fail(res, 'Wallet not found.', 404)
    }

    // Insert pending deposit record
    const { rows: dRows } = await client.query(
      `INSERT INTO deposits (wallet_id, amount, method, status)
       VALUES ($1, $2, $3, 'pending') RETURNING deposit_id`,
      [walletId, parsedAmount, method]
    )
    const depositId = dRows[0].deposit_id

    // Stored procedure handles: lock → credit → transaction record → mark completed → audit
    const { rows: procRows } = await client.query(
      'SELECT process_deposit($1, $2, $3, $4) AS txn_id',
      [depositId, walletId, parsedAmount, req.user.user_id]
    )

    await client.query('COMMIT')

    // Return fresh wallet balance
    const { rows: wallet } = await query(
      'SELECT balance, currency_type FROM wallets WHERE wallet_id = $1',
      [walletId]
    )

    return send(res, {
      depositId,
      transactionId: procRows[0].txn_id,
      currency:      wRows[0].currency_type,
      deposited:     parsedAmount,
      newBalance:    parseFloat(wallet[0].balance),
    }, 201)
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[createDeposit]', err.message)

    if (err.message.includes('not active'))
      return fail(res, 'Wallet is frozen or closed.', 400)

    return fail(res, 'Deposit failed. Please try again.')
  } finally {
    client.release()
  }
}

// ── GET /api/deposits ─────────────────────────────────────────────────────────

const getDeposits = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT d.deposit_id, d.amount, d.method, d.status,
              d.created_at, d.completed_at,
              w.currency_type AS currency
         FROM deposits d
         JOIN wallets  w ON w.wallet_id = d.wallet_id
        WHERE w.user_id = $1
        ORDER BY d.created_at DESC
        LIMIT 100`,
      [req.user.user_id]
    )
    return send(res, rows.map(r => ({
      id:          r.deposit_id,
      amount:      parseFloat(r.amount),
      currency:    r.currency,
      method:      r.method,
      status:      r.status,
      createdAt:   r.created_at,
      completedAt: r.completed_at,
    })))
  } catch (err) {
    console.error('[getDeposits]', err.message)
    return fail(res, 'Failed to fetch deposits.')
  }
}

// ── Validation ────────────────────────────────────────────────────────────────

const createDepositRules = [
  body('walletId').isUUID().withMessage('Valid wallet ID required'),
  body('amount').isFloat({ gt: 0, max: 1_000_000 }).withMessage('Amount must be between 0 and 1,000,000'),
  body('method').optional().isIn(['manual','bank','card','easypaisa','jazzcash']).withMessage('Invalid method'),
]

module.exports = { createDeposit, getDeposits, createDepositRules }