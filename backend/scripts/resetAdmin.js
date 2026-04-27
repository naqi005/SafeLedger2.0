require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const bcrypt = require('bcryptjs')
const { query } = require('../config/database')

async function main() {
  const password = 'Admin@SafeLedger2024'
  const rounds   = parseInt(process.env.BCRYPT_ROUNDS) || 12
  const hash     = await bcrypt.hash(password, rounds)

  await query(
    `INSERT INTO users (name, email, password_hash, role, is_active)
     VALUES ('SafeLedger Admin', 'admin@safeledger.com', $1, 'admin', true)
     ON CONFLICT (email)
     DO UPDATE SET password_hash = $1, role = 'admin', is_active = true`,
    [hash]
  )

  // Clear any stale sessions for admin
  const { rows } = await query(
    `SELECT user_id FROM users WHERE email = 'admin@safeledger.com'`
  )
  if (rows[0]) {
    await query(
      `UPDATE user_sessions SET is_active = false WHERE user_id = $1`,
      [rows[0].user_id]
    )
  }

  console.log('✅  Admin account ready')
  console.log('    Email   : admin@safeledger.com')
  console.log('    Password: Admin@SafeLedger2024')
  process.exit(0)
}

main().catch(err => {
  console.error('❌  Error:', err.message)
  process.exit(1)
})