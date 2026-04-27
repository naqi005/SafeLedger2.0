/**
 * Transaction Controller
 *
 * Architecture (Option B — stored procedure owns ALL money logic):
 *   Backend  →  ownership check + fraud detection + recipient resolution
 *   DB proc  →  FOR UPDATE lock → balance check → deduct → credit → audit
 *
 * The stored procedure transfer_money() is the ONLY place that:
 *   - Reads balance with a row lock
 *   - Validates sufficiency
 *   - Updates balances
 * The backend never reads balance to decide whether to proceed — that
 * avoids the classic unlocked-read race condition.
 */

const { body }                            = require('express-validator')
const { query, getClient }                = require('../config/database')
const { send, fail }                      = require('../utils/response')
const { checkRapidFire, checkDailyLimit } = require('../middlewares/fraudDetection')

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtStatus = (s) => (s === 'success' ? 'completed' : s)

const fmtTxn = (row) => ({
  _id:           row.transaction_id,
  type:          row.type,
  amount:        parseFloat(row.amount),
  currency:      row.currency,
  status:        fmtStatus(row.status),
  senderEmail:   row.sender_email   || null,
  receiverEmail: row.receiver_email || null,
  metadata:      row.metadata       || {},
  createdAt:     row.created_at,
})

const TXN_SELECT = `
  SELECT
    t.transaction_id,
    CASE
      WHEN t.transaction_type = 'exchange'   THEN 'exchange'
      WHEN t.transaction_type = 'deposit'    THEN 'add'
      WHEN t.transaction_type = 'withdrawal' THEN 'withdrawal'
      WHEN fw.user_id = $1                   THEN 'send'
      ELSE 'receive'
    END AS type,
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
  LEFT JOIN users   su ON fw.user_id       = su.user_id
  LEFT JOIN users   ru ON tw.user_id       = ru.user_id
`

// ── GET /api/transactions ─────────────────────────────────────────────────────

const getAll = async (req, res) => {
  try {
    const userId = req.user.user_id
    const limit  = Math.min(parseInt(req.query.limit)  || 50, 200)
    const offset = parseInt(req.query.offset) || 0

    const { rows } = await query(
      `${TXN_SELECT}
       WHERE (fw.user_id = $1 OR tw.user_id = $1)
       ORDER BY t.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    )
    return send(res, rows.map(fmtTxn))
  } catch (err) {
    console.error('[getTransactions]', err.message)
    return fail(res, 'Failed to fetch transactions.')
  }
}

// ── POST /api/transactions/send ───────────────────────────────────────────────
//
// Flow:
//  1. Fraud gate      — rapid-fire + daily limit (app-level, no DB lock needed)
//  2. Ownership check — confirm fromWalletId belongs to this user
//  3. Recipient check — confirm recipient exists and is active
//  4. Wallet match    — confirm recipient has an active wallet in the same currency
//  5. transfer_money  — stored procedure acquires FOR UPDATE locks,
//                       validates balance, deducts, credits, and writes audit
//
// Note: we do NOT read balance here. The stored procedure is the only place
// that checks balance under a row lock — eliminating the race condition where
// two concurrent requests could both pass an unlocked pre-check.

const sendMoney = async (req, res) => {
  const client = await getClient()
  try {
    await client.query('BEGIN')

    const { recipientEmail, amount, fromWalletId } = req.body
    const userId       = req.user.user_id
    const parsedAmount = parseFloat(amount)

    // 1. Rapid-fire fraud gate (in-memory, before hitting DB)
    const rapid = checkRapidFire(userId)
    if (rapid.blocked) {
      await client.query('ROLLBACK')
      return fail(res, rapid.reason, 429)
    }

    // 2. Ownership — verify this wallet belongs to the authenticated user
    //    (only SELECT, no balance read — stored proc owns that decision)
    const { rows: sw } = await client.query(
      'SELECT wallet_id, currency_type FROM wallets WHERE wallet_id = $1 AND user_id = $2',
      [fromWalletId, userId]
    )
    if (!sw[0]) {
      await client.query('ROLLBACK')
      return fail(res, 'Sender wallet not found.', 404)
    }

    // 3. Daily USD-equivalent limit (DB query but no balance lock)
    const daily = await checkDailyLimit(userId, parsedAmount, sw[0].currency_type, {
      query: (t, p) => client.query(t, p),
    })
    if (daily.blocked) {
      await client.query('ROLLBACK')
      return fail(res, daily.reason, 429)
    }

    // 4. Recipient lookup
    const { rows: ru } = await client.query(
      'SELECT user_id, email FROM users WHERE email = $1 AND is_active = true',
      [recipientEmail.toLowerCase().trim()]
    )
    if (!ru[0]) {
      await client.query('ROLLBACK')
      return fail(res, 'Recipient not found. Check the email address.', 404)
    }
    if (ru[0].user_id === userId) {
      await client.query('ROLLBACK')
      return fail(res, 'Cannot send money to yourself.', 400)
    }

    // 5. Recipient must have an active wallet in the same currency
    const { rows: rw } = await client.query(
      "SELECT wallet_id FROM wallets WHERE user_id = $1 AND currency_type = $2 AND status = 'active'",
      [ru[0].user_id, sw[0].currency_type]
    )
    if (!rw[0]) {
      await client.query('ROLLBACK')
      return fail(res, `Recipient has no active ${sw[0].currency_type} wallet.`, 400)
    }

    // 6. Delegate ALL money movement to stored procedure
    //    Inside: FOR UPDATE lock → balance check → deduct → credit → audit log
    const { rows: sp } = await client.query(
      'SELECT transfer_money($1, $2, $3, $4) AS txn_id',
      [sw[0].wallet_id, rw[0].wallet_id, parsedAmount, userId]
    )

    await client.query('COMMIT')

    return send(res, {
      _id:           sp[0].txn_id,
      type:          'send',
      amount:        parsedAmount,
      currency:      sw[0].currency_type,
      status:        'completed',
      senderEmail:   req.user.email,
      receiverEmail: ru[0].email,
      createdAt:     new Date().toISOString(),
    }, 201)

  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[sendMoney]', err.message)

    // Translate stored-procedure exceptions into user-friendly messages
    if (/insufficient balance/i.test(err.message))
      return fail(res, 'Insufficient balance.', 400)
    if (/not active/i.test(err.message))
      return fail(res, 'Wallet is frozen or closed.', 400)
    if (/same wallet/i.test(err.message))
      return fail(res, 'Cannot transfer to the same wallet.', 400)
    if (/currency mismatch/i.test(err.message))
      return fail(res, 'Currency mismatch between wallets.', 400)

    return fail(res, 'Transfer failed. Please try again.')
  } finally {
    client.release()
  }
}

// ── GET /api/transactions/:id ─────────────────────────────────────────────────

const getById = async (req, res) => {
  try {
    const userId = req.user.user_id
    const { rows } = await query(
      `${TXN_SELECT}
       WHERE t.transaction_id = $2
         AND (fw.user_id = $1 OR tw.user_id = $1)`,
      [userId, req.params.id]
    )
    if (!rows[0]) return fail(res, 'Transaction not found.', 404)
    return send(res, fmtTxn(rows[0]))
  } catch (err) {
    return fail(res, 'Failed to fetch transaction.')
  }
}

// ── Validation rules ──────────────────────────────────────────────────────────

const sendRules = [
  body('recipientEmail').isEmail().withMessage('Valid recipient email required').normalizeEmail(),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('fromWalletId').isUUID().withMessage('Valid wallet ID required'),
]

module.exports = { getAll, sendMoney, getById, sendRules }