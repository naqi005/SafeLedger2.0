/**
 * Authentication Controller
 *
 * Handles user registration, login, logout, and identity (me) endpoints.
 * All successful logins/registrations create a row in user_sessions so that
 * tokens can be invalidated server-side without waiting for JWT expiry.
 *
 * Security notes:
 *  - Passwords are hashed with bcrypt (12 rounds by default)
 *  - JWTs are never stored raw — only their SHA-256 hash goes into user_sessions
 *  - Every protected request checks user_sessions.is_active, enabling true logout
 */

const bcrypt   = require('bcryptjs')
const jwt      = require('jsonwebtoken')
const crypto   = require('crypto')
const { body } = require('express-validator')
const { query } = require('../config/database')
const { send, fail } = require('../utils/response')

/** Returns SHA-256 hex digest of a JWT — used for safe session storage */
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

// Calculate session expiry from JWT_EXPIRES_IN (e.g. '7d', '24h')
/** Parses JWT_EXPIRES_IN env var (e.g. '7d', '24h') into an absolute Date */
function sessionExpiresAt() {
  const raw = process.env.JWT_EXPIRES_IN || '7d'
  const m   = /^(\d+)([smhd])$/.exec(raw)
  if (!m) return new Date(Date.now() + 7 * 86400000)
  const ms = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[m[2]]
  return new Date(Date.now() + parseInt(m[1]) * ms)
}

/**
 * Inserts a new active session row linked to the given JWT.
 * @param {string} userId - UUID of the user
 * @param {string} token  - Raw JWT (will be hashed before storage)
 * @param {import('express').Request} req
 */
async function createSession(userId, token, req) {
  const ip         = req.ip || req.socket?.remoteAddress || null
  const deviceInfo = req.headers['user-agent']?.slice(0, 255) || null
  await query(
    `INSERT INTO user_sessions (user_id, token_hash, ip_address, device_info, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, hashToken(token), ip, deviceInfo, sessionExpiresAt()]
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatUser = (row) => ({
  id:        row.user_id,
  name:      row.name,
  email:     row.email,
  phone:     row.phone  || '',
  role:      row.role,
  createdAt: row.created_at,
})

const signToken = (userId, role) =>
  jwt.sign({ user_id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

// ── POST /api/auth/register ───────────────────────────────────────────────────

/**
 * Creates a new user account, seeds a default PKR wallet, and returns a JWT.
 * @route POST /api/auth/register
 * @body  {name, email, password, phone?}
 * @returns {token, user}
 */
const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body

    const exists = await query('SELECT user_id FROM users WHERE email = $1', [email])
    if (exists.rows[0]) return fail(res, 'An account with this email already exists.', 409)

    const rounds       = parseInt(process.env.BCRYPT_ROUNDS) || 12
    const passwordHash = await bcrypt.hash(password, rounds)

    const { rows } = await query(
      `INSERT INTO users (name, email, phone, password_hash)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name.trim(), email.toLowerCase(), phone?.trim() || null, passwordHash]
    )
    const user = rows[0]

    // Give every new user a default PKR wallet
    await query(
      `INSERT INTO wallets (user_id, currency_type, balance)
       VALUES ($1, 'PKR', 0) ON CONFLICT DO NOTHING`,
      [user.user_id]
    )

    await query(
      `INSERT INTO audit_log (user_id, action, details)
       VALUES ($1, 'USER_REGISTERED', $2)`,
      [user.user_id, JSON.stringify({ email: user.email })]
    )

    const token = signToken(user.user_id, user.role)
    await createSession(user.user_id, token, req)
    return send(res, { token, user: formatUser(user) }, 201)
  } catch (err) {
    console.error('[register]', err.message)
    return fail(res, 'Registration failed. Please try again.')
  }
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────

/**
 * Validates credentials and returns a JWT + session record.
 * Returns 401 for wrong password/unknown email; 403 for suspended accounts.
 * @route POST /api/auth/login
 * @body  {email, password}
 * @returns {token, user}
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])
    const user = rows[0]

    if (!user)           return fail(res, 'Invalid email or password.', 401)
    if (!user.is_active) return fail(res, 'Account suspended. Contact support.', 403)

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return fail(res, 'Invalid email or password.', 401)

    await query(
      `INSERT INTO audit_log (user_id, action, details) VALUES ($1, 'USER_LOGIN', '{}')`,
      [user.user_id]
    )

    const token = signToken(user.user_id, user.role)
    await createSession(user.user_id, token, req)
    return send(res, { token, user: formatUser(user) })
  } catch (err) {
    console.error('[login]', err.message)
    return fail(res, 'Login failed. Please try again.')
  }
}

// ── POST /api/auth/logout ─────────────────────────────────────────────────────

/**
 * Marks the current session inactive so the token is rejected on future requests.
 * @route POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    const header = req.headers.authorization
    if (header?.startsWith('Bearer ')) {
      const hash = hashToken(header.slice(7))
      await query(
        'UPDATE user_sessions SET is_active = false WHERE token_hash = $1',
        [hash]
      )
    }
    return send(res, { message: 'Logged out successfully.' })
  } catch (err) {
    console.error('[logout]', err.message)
    return fail(res, 'Logout failed.')
  }
}

// ── POST /api/auth/logout-all ─────────────────────────────────────────────────

/**
 * Invalidates every active session for the authenticated user (all devices).
 * @route POST /api/auth/logout-all
 */
const logoutAll = async (req, res) => {
  try {
    await query(
      'UPDATE user_sessions SET is_active = false WHERE user_id = $1',
      [req.user.user_id]
    )
    return send(res, { message: 'All sessions terminated.' })
  } catch (err) {
    console.error('[logoutAll]', err.message)
    return fail(res, 'Failed to terminate sessions.')
  }
}

// ── GET /api/auth/me ──────────────────────────────────────────────────────────

/**
 * Returns the authenticated user's profile (id, name, email, role).
 * @route GET /api/auth/me
 */
const me = async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM users WHERE user_id = $1', [req.user.user_id])
    if (!rows[0]) return fail(res, 'User not found.', 404)
    return send(res, formatUser(rows[0]))
  } catch (err) {
    return fail(res, 'Failed to fetch user.')
  }
}

// ── Validation rules ──────────────────────────────────────────────────────────

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional({ nullable: true }).isMobilePhone().withMessage('Invalid phone number'),
]

const loginRules = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password required'),
]

module.exports = { register, login, me, logout, logoutAll, registerRules, loginRules, formatUser, signToken, hashToken }