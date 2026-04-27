const { Pool } = require('pg')

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'safeledger',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD,
  max:               20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 3_000,
})

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message)
})

async function testConnection() {
  const client = await pool.connect()
  try {
    const { rows } = await client.query('SELECT NOW() AS ts, current_database() AS db')
    console.log(`✅  PostgreSQL connected — ${rows[0].db} @ ${rows[0].ts}`)
  } finally {
    client.release()
  }
}

// Parameterised query helper
const query = (text, params) => pool.query(text, params)

// Manual transaction client
const getClient = () => pool.connect()

module.exports = { pool, query, getClient, testConnection }