const jwt    = require('jsonwebtoken')
const crypto = require('crypto')
const { query } = require('../config/database')
const { fail }  = require('../utils/response')

/**
 * JWT authentication middleware.
 * 1. Verifies JWT signature
 * 2. Confirms session is still active in user_sessions
 * 3. Confirms user exists and is not suspended
 * Attaches req.user = { user_id, name, email, role } on success.
 */
module.exports = async (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return fail(res, 'Access denied. No token provided.', 401)
  }

  const token = header.slice(7)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Check session is still active (enables logout + logout-all)
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const { rows: sessions } = await query(
      `SELECT session_id FROM user_sessions
        WHERE token_hash = $1
          AND is_active  = true
          AND expires_at > NOW()`,
      [tokenHash]
    )
    if (!sessions[0]) return fail(res, 'Session expired or logged out. Please log in again.', 401)

    // Verify user still exists and is active
    const { rows } = await query(
      'SELECT user_id, name, email, role, is_active FROM users WHERE user_id = $1',
      [decoded.user_id]
    )
    if (!rows[0])           return fail(res, 'Token invalid: user not found.', 401)
    if (!rows[0].is_active) return fail(res, 'Account is suspended.', 403)

    req.user = rows[0]
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return fail(res, 'Token has expired. Please log in again.', 401)
    return fail(res, 'Invalid token.', 401)
  }
}