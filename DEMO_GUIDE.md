# SafeLedger 2.0 — Presentation & Demo Script
## CS232 Database Management Systems — Semester Project

---

## Setup Before the Demo (5 Minutes Before)

1. Start the backend:
   ```
   cd backend
   npm run dev
   ```
   Should print: `Server running on port 5000` and `PostgreSQL connected`

2. Start the frontend:
   ```
   cd ..
   npm run dev
   ```
   Should print: `Local: http://localhost:5173`

3. Open two browser windows side by side (for the live transfer demo)

4. Have pgAdmin open to show the live database during queries

---

## Demo Flow (Suggested 15-Minute Script)

---

### Section 1 — Project Overview (2 min)
**Who speaks:** Naqi

"SafeLedger is a multi-currency digital wallet system built on PostgreSQL with a
Node.js backend and React frontend. The core design principle is that all money
movement happens inside database stored procedures — never in application code.
This guarantees ACID compliance even under concurrent requests."

Key points to mention:
- 8 database tables
- 4 stored procedures (transfer, exchange, deposit, withdrawal)
- 3 triggers (negative balance prevention, status audit, failure logging)
- 18 indexes for query performance
- Fraud detection: rate limiting + daily $5,000 USD cap

---

### Section 2 — Database Schema (3 min)
**Who speaks:** Ibrahim Malhi

Open pgAdmin and show the table list. Walk through:

1. **users table** — "UUID primary keys instead of integers, bcrypt password_hash,
   role column for admin/user separation"

2. **wallets table** — "NUMERIC(20,8) for exact arithmetic, CHECK(balance >= 0)
   as a last line of defense, UNIQUE(user_id, currency_type) for one wallet per
   currency per user"

3. **transactions table** — "Central ledger. from_wallet_id is NULL for deposits,
   to_wallet_id is NULL for withdrawals. JSONB metadata stores exchange rates and
   other context"

4. Show the **normalization** — "No repeating groups, all single-column UUID PKs
   so 2NF partial dependency is impossible, no transitive dependencies so 3NF is
   satisfied"

Run this query live in pgAdmin to show the schema:
```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

---

### Section 3 — Stored Procedures & ACID Demo (4 min)
**Who speaks:** Ibrahim Gulzar

**Show the transfer_money procedure:**
"The procedure acquires FOR UPDATE row locks in UUID sort order — this is the
deadlock prevention strategy. If two requests come in simultaneously, they always
lock wallets in the same order, so neither can deadlock."

**Live demo — open two browser tabs:**
- Tab 1: Log in as user A (e.g. test@test.com)
- Tab 2: Log in as user B (e.g. admin@safeledger.com)

Steps:
1. In Tab 1: deposit 500 PKR into wallet
2. In Tab 1: send 200 PKR to user B's email
3. Switch to pgAdmin — run:
   ```sql
   SELECT t.transaction_type, t.amount, t.status, t.created_at,
          fw.currency_type, al.action
   FROM transactions t
   LEFT JOIN wallets fw ON fw.wallet_id = t.from_wallet_id
   LEFT JOIN audit_log al ON al.transaction_id = t.transaction_id
   ORDER BY t.created_at DESC LIMIT 5;
   ```
4. Show the audit_log entry was automatically created by the stored procedure

**Show the trigger:**
```sql
-- trg_prevent_negative_balance fires on UPDATE to wallets
-- This would fail even if the stored procedure had a bug:
UPDATE wallets SET balance = -1 WHERE wallet_id = '<any id>';
-- Expected: ERROR: Wallet balance cannot go negative
```

---

### Section 4 — SQL Queries & Analytics (2 min)
**Who speaks:** Haris

Run these live in pgAdmin:

**Query 1 — Transaction summary per user:**
```sql
SELECT u.name, u.email,
       COUNT(t.transaction_id) AS total_txns,
       SUM(t.amount) FILTER (WHERE t.transaction_type = 'deposit') AS total_deposited,
       SUM(t.amount) FILTER (WHERE t.transaction_type = 'withdrawal') AS total_withdrawn
FROM users u
LEFT JOIN wallets w ON w.user_id = u.user_id
LEFT JOIN transactions t ON t.to_wallet_id = w.wallet_id
    OR t.from_wallet_id = w.wallet_id
GROUP BY u.user_id, u.name, u.email
ORDER BY total_txns DESC NULLS LAST;
```

**Query 2 — Fraud detection: daily volume check:**
```sql
SELECT u.name, u.email,
       COALESCE(SUM(t.amount * COALESCE(
           (SELECT rate FROM exchange_rates
            WHERE from_currency = w.currency_type AND to_currency = 'USD'), 1.0
       )), 0) AS outgoing_usd_24h
FROM transactions t
JOIN wallets w ON w.wallet_id = t.from_wallet_id
JOIN users u ON u.user_id = w.user_id
WHERE t.status = 'success'
  AND t.created_at >= NOW() - INTERVAL '24 hours'
  AND t.transaction_type IN ('transfer', 'withdrawal', 'exchange')
GROUP BY u.user_id, u.name, u.email
ORDER BY outgoing_usd_24h DESC;
```

---

### Section 5 — Security Features (2 min)
**Who speaks:** Naqi

"Three security layers work together:"

1. **Authentication** — bcrypt (12 rounds) + JWT + server-side session validation.
   Show in code: the auth middleware queries user_sessions on every request.
   "Even if someone steals a JWT, logging out immediately invalidates it."

2. **Fraud Detection** — open `backend/middlewares/fraudDetection.js`
   - checkRapidFire: in-memory Map, blocks >5 transactions per 60 seconds
   - checkDailyLimit: SQL query, converts all currencies to USD, blocks if >$5,000

3. **Input Validation** — open any route file, show express-validator rules.
   "All user input is validated before it reaches the controller."

---

### Section 6 — Frontend Walkthrough (2 min)
**Who speaks:** Ibrahim Gulzar or Haris

Walk through in the browser:
1. Landing page — show the gold/dark theme, features list
2. Register a new account — show the form validation
3. Dashboard — wallet cards, recent transactions
4. Send Money — confirm modal before submission
5. Exchange — live rate displayed, auto-creates destination wallet
6. Admin Dashboard — suspend a user, show audit log

---

## Answers to Likely Examiner Questions

**Q: Why PostgreSQL instead of MySQL?**
A: PostgreSQL supports NUMERIC(20,8) with exact precision, row-level FOR UPDATE locking
inside stored procedures, JSONB for flexible metadata, and gen_random_uuid() natively.

**Q: What happens if two users transfer from the same wallet simultaneously?**
A: The stored procedure uses SELECT ... FOR UPDATE which acquires an exclusive row lock.
The second transaction waits until the first commits. The wallet can never go negative
because the balance check happens under the lock.

**Q: Why store exchange rate in transaction metadata?**
A: The exchange_rates table gets updated over time. If we only stored the wallet IDs,
we'd lose the historical rate. The JSONB metadata in the transaction record preserves
the exact rate that was applied at the time of the exchange.

**Q: How does logout work if JWTs are stateless?**
A: We store a SHA-256 hash of every JWT in user_sessions. The auth middleware checks
this table on every request. When a user logs out, we set is_active=false. The next
request with that token gets rejected even though the JWT itself hasn't expired.

**Q: How does the fraud detection handle multiple servers?**
A: The in-memory rapid-fire check is per-server — a known limitation documented in the
code. For a production multi-server deployment, we included a DB-backed alternative
query in fraud_detection.sql that counts transactions in the last 60 seconds from the
database instead.

**Q: Explain 3NF in your schema.**
A: No transitive dependencies. User name/email lives only in users — wallets stores
user_id (FK), not the user's name. If a user changes their email, only one row in
one table needs updating. Exchange rates live only in exchange_rates — the historical
rate at time of exchange is in transaction metadata JSONB, not a FK.