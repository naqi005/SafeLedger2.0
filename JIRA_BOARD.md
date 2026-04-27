# SafeLedger 2.0 — JIRA Project Board
## Ordered by Build Progression · 25 Tickets · 4 Members

---

## Team Members

| ID | Name | Role |
|---|---|---|
| **NA** | Naqi Afaq | Project Lead / Full-Stack |
| **IM** | Ibrahim Malhi | Backend Developer |
| **HZ** | Haris Zafar | Frontend Developer |
| **IG** | Ibrahim Gulzar | Frontend / UI Designer |

---
---

# PHASE 1 — PROJECT SETUP
> Before writing any feature code, we set up the folder structure, install
> dependencies, and make sure both the frontend and backend can run locally.

---

## SL-01 · Initialize Project Structure & Install Dependencies
**Assignee:** Naqi Afaq | **Priority:** Highest | **Sprint:** 1

### What & Why
Every project starts here. We create two separate folders — `backend/` for the
Node.js/Express API and `src/` for the React frontend. We install the libraries
each side needs and make sure both servers start without errors before touching
any real feature code.

### Files Created
```
backend/
  package.json          ← express, pg, bcryptjs, jsonwebtoken, dotenv, nodemon
  .env.example          ← template for environment variables
  server.js             ← bare Express app (just "hello world" at this stage)

(root)/
  package.json          ← react, vite, tailwindcss, axios, react-router-dom
  vite.config.js        ← dev server on port 5173, proxy /api → localhost:5000
  tailwind.config.js    ← custom colors (gold, void, chalk, smoke, ember)
  index.html
```

### What We Did Step by Step
1. Created `/backend` folder, ran `npm init -y`, installed Express and other packages
2. Created root Vite + React project with `npm create vite@latest`
3. Installed Tailwind CSS and configured the gold/dark color palette
4. Set up the Vite proxy so `/api` calls in the browser hit the backend without CORS errors
5. Wrote `.env.example` listing every environment variable the project needs

### Acceptance Criteria
- [ ] `npm run dev` in root starts the React app on `http://localhost:5173`
- [ ] `npm run dev` in `/backend` starts the API on `http://localhost:5000`
- [ ] Visiting `http://localhost:5173/api/health` returns `{ ok: true }` (proxied through Vite)
- [ ] `.env.example` documents: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `BCRYPT_ROUNDS`

---

## SL-02 · Connect to PostgreSQL Database
**Assignee:** Ibrahim Malhi | **Priority:** Highest | **Sprint:** 1

### What & Why
The backend needs to talk to the database. Before creating any tables we write the
connection code that every controller will use. We use a **connection pool** so that
multiple API requests can run database queries at the same time without waiting for
each other.

### Files Created
```
backend/
  config/
    database.js     ← pg Pool, query() helper, getClient() for transactions
  .env              ← real DB credentials (gitignored)
```

### What We Did Step by Step
1. Created a PostgreSQL database called `safeledger` using pgAdmin
2. Wrote `database.js` using the `pg` library's `Pool` class
3. Exported two helpers:
   - `query(sql, params)` — for simple single queries
   - `getClient()` — returns a connected client for multi-step transactions (BEGIN/COMMIT/ROLLBACK)
4. Added a startup test: when the server boots it runs `SELECT NOW()` to confirm the DB is reachable
5. Stored DB credentials in `.env` (never committed to git)

### Acceptance Criteria
- [ ] Server logs "PostgreSQL connected" on startup
- [ ] Server logs an error (and exits gracefully) if DB credentials are wrong
- [ ] `query()` and `getClient()` are exported and usable in any controller
- [ ] `.env` file is in `.gitignore`

---
---

# PHASE 2 — DATABASE TABLES
> Now that the DB connection works, we create tables one by one — starting with the
> most fundamental (users) and building toward the more complex ones that depend on them.

---

## SL-03 · Create the Users Table
**Assignee:** Ibrahim Malhi | **Priority:** Highest | **Sprint:** 1

### What & Why
The `users` table is the foundation of the entire app — every other table eventually
links back to a user. We create it first because wallets, sessions, and transactions
all need a `user_id` foreign key to reference.

### Files Modified
```
backend/config/schema.sql     ← users table definition
```

### Table Structure We Built
```sql
CREATE TABLE users (
    user_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,          -- bcrypt hash, NEVER plaintext
    phone         VARCHAR(20),
    role          VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user','admin')),
    is_active     BOOLEAN DEFAULT true,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### Why These Design Choices
- **UUID** instead of integer IDs — harder to guess, safer for a financial app
- **password_hash** column — passwords are ALWAYS stored as bcrypt hashes, never plaintext
- **role** column — lets us distinguish regular users from admins without a separate table
- **is_active** flag — instead of deleting accounts we deactivate them (preserves history)

### Acceptance Criteria
- [ ] Table created with `psql -U postgres -d safeledger -f schema.sql`
- [ ] `email` column has a UNIQUE constraint (no duplicate accounts)
- [ ] `password_hash` column has no default and is NOT NULL
- [ ] Inserting a user with a duplicate email raises a proper constraint error

---

## SL-04 · Create the Wallets Table
**Assignee:** Ibrahim Malhi | **Priority:** Highest | **Sprint:** 1

### What & Why
A single user can hold multiple wallets — one per currency (PKR, USD, EUR, etc.).
The `wallets` table stores each wallet as a separate row and links back to its
owner via `user_id`. We create this right after `users` because transactions will
need wallet IDs.

### Files Modified
```
backend/config/schema.sql     ← wallets table definition
```

### Table Structure We Built
```sql
CREATE TABLE wallets (
    wallet_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    currency_type VARCHAR(10) NOT NULL,
    balance       NUMERIC(20,8) NOT NULL DEFAULT 0
                  CHECK (balance >= 0),          -- prevents negative balances at DB level
    status        VARCHAR(20) DEFAULT 'active'
                  CHECK (status IN ('active','frozen','closed')),
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, currency_type)               -- one wallet per currency per user
);
```

### Why These Design Choices
- **NUMERIC(20,8)** — stores money with 8 decimal places, no floating-point rounding errors
- **CHECK (balance >= 0)** — even if code has a bug, the DB will never let a wallet go negative
- **UNIQUE(user_id, currency_type)** — one PKR wallet, one USD wallet, etc. per user
- **ON DELETE CASCADE** — if a user is deleted, their wallets are deleted too

### Acceptance Criteria
- [ ] Cannot insert two USD wallets for the same user (UNIQUE constraint)
- [ ] Cannot set balance below 0 (CHECK constraint)
- [ ] Deleting a user automatically deletes their wallets (CASCADE)
- [ ] `balance` column uses NUMERIC type, not FLOAT

---

## SL-05 · Create Transactions, Exchange Rates & Audit Log Tables
**Assignee:** Ibrahim Malhi | **Priority:** High | **Sprint:** 1

### What & Why
These three tables record everything that happens with money. `transactions` is the
permanent ledger of every transfer, exchange, deposit, and withdrawal. `exchange_rates`
stores the current currency rates. `audit_log` tracks every sensitive admin action for
compliance purposes.

### Files Modified
```
backend/config/schema.sql     ← transactions, exchange_rates, audit_log tables
```

### Tables We Built

**transactions**
```sql
CREATE TABLE transactions (
    transaction_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_wallet_id  UUID REFERENCES wallets(wallet_id),   -- NULL for deposits
    to_wallet_id    UUID REFERENCES wallets(wallet_id),   -- NULL for withdrawals
    amount          NUMERIC(20,8) NOT NULL CHECK (amount > 0),
    transaction_type VARCHAR(30) NOT NULL
                    CHECK (transaction_type IN ('transfer','exchange','deposit','withdrawal')),
    status          VARCHAR(20) DEFAULT 'pending'
                    CHECK (status IN ('pending','success','failed')),
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

**exchange_rates**
```sql
CREATE TABLE exchange_rates (
    rate_id         SERIAL PRIMARY KEY,
    from_currency   VARCHAR(10) NOT NULL,
    to_currency     VARCHAR(10) NOT NULL,
    rate            NUMERIC(20,8) NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(from_currency, to_currency)
);
```

**audit_log**
```sql
CREATE TABLE audit_log (
    log_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(transaction_id),
    user_id        UUID REFERENCES users(user_id),
    action         VARCHAR(100) NOT NULL,
    details        JSONB DEFAULT '{}',
    ip_address     INET,
    timestamp      TIMESTAMPTZ DEFAULT NOW()
);
```

### Acceptance Criteria
- [ ] All three tables created successfully
- [ ] `transactions` allows NULL for `from_wallet_id` (deposits have no sender)
- [ ] `exchange_rates` seeded with rates for: PKR, USD, EUR, GBP, AED, SAR (all bidirectional pairs)
- [ ] `audit_log` stores IP address as INET type

---

## SL-06 · Create Sessions, Deposits & Withdrawals Tables
**Assignee:** Naqi Afaq | **Priority:** High | **Sprint:** 1

### What & Why
These three tables were added later as the project grew. `user_sessions` lets us
invalidate tokens server-side (real logout). `deposits` and `withdrawals` give us
a dedicated record of every top-up and cash-out, separate from the main transactions
ledger. This file is run as a **migration** on an already-existing database.

### Files Created
```
backend/config/migrations.sql     ← run AFTER schema.sql on an existing database
```

### Tables We Built

**user_sessions**
```sql
CREATE TABLE IF NOT EXISTS user_sessions (
    session_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash   TEXT NOT NULL,       -- SHA-256 of the JWT (never store the raw token)
    ip_address   INET,
    device_info  TEXT,
    is_active    BOOLEAN DEFAULT true,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    expires_at   TIMESTAMPTZ NOT NULL
);
```

**deposits** and **withdrawals** (same structure)
```sql
CREATE TABLE IF NOT EXISTS deposits (
    deposit_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id    UUID NOT NULL REFERENCES wallets(wallet_id) ON DELETE CASCADE,
    amount       NUMERIC(20,8) NOT NULL CHECK (amount > 0),
    method       VARCHAR(50) DEFAULT 'manual',
    status       VARCHAR(20) DEFAULT 'pending'
                 CHECK (status IN ('pending','completed','failed')),
    metadata     JSONB DEFAULT '{}',
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
```

### Why Separate Tables for Deposits/Withdrawals?
Rather than stuffing everything into `transactions`, having dedicated tables lets
us track the lifecycle (pending → completed/failed), attach payment method info,
and query deposit history independently of peer-to-peer transfers.

### Acceptance Criteria
- [ ] Migration script uses `CREATE TABLE IF NOT EXISTS` — safe to re-run
- [ ] `token_hash` stores a SHA-256 hash of the JWT, not the raw token
- [ ] Indexes created on `user_sessions(token_hash)` for fast session lookups
- [ ] Indexes created on `deposits(wallet_id)` and `withdrawals(wallet_id)`

---
---

# PHASE 3 — BACKEND SERVER & BASIC API
> With tables in place, we build the Express server and the first API endpoints.
> We start with the simplest possible server, then add one feature at a time.

---

## SL-07 · Set Up Express Server & Utility Helpers
**Assignee:** Naqi Afaq | **Priority:** Highest | **Sprint:** 1

### What & Why
Before writing any business logic we need the Express server configured with the
correct middleware (JSON parsing, CORS, security headers) and a reusable response
helper so every API endpoint returns data in the same format.

### Files Created
```
backend/
  server.js           ← Express app, middleware setup, route mounting
  utils/response.js   ← send() and fail() helpers
```

### What We Built

**server.js — the entry point**
```js
const app = express()
app.use(express.json())
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
// Routes mounted here as they are built:
app.use('/api/auth',         authRoutes)
app.use('/api/wallets',      walletRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/exchange',     exchangeRoutes)
app.use('/api/deposits',     depositRoutes)
app.use('/api/withdrawals',  withdrawalRoutes)
app.use('/api/users',        userRoutes)
app.use('/api/admin',        adminRoutes)
```

**utils/response.js — consistent API responses**
```js
// Every success:  { success: true, data: { ... } }
// Every error:    { success: false, message: "..." }
const send = (res, data, status = 200) =>
  res.status(status).json({ success: true, data })

const fail = (res, message, status = 500) =>
  res.status(status).json({ success: false, message })
```

### Why a Response Helper?
Without it, different endpoints return data in different shapes. Clients would
need special-case code for every endpoint. With `send()` and `fail()`, the
frontend always knows where to find the data and whether the request succeeded.

### Acceptance Criteria
- [ ] `GET /api/health` returns `{ success: true, data: { status: "ok" } }`
- [ ] CORS configured to allow requests from `http://localhost:5173` only
- [ ] Unknown routes return `{ success: false, message: "Not found" }` with 404
- [ ] All controllers use `send()` and `fail()` — no raw `res.json()` calls

---

## SL-08 · User Registration & Login API
**Assignee:** Ibrahim Malhi | **Priority:** Highest | **Sprint:** 1

### What & Why
This is the first real feature — users need to be able to create an account and
sign in. We implement two endpoints: **register** (creates user, returns token)
and **login** (checks password, returns token). We also create a session record
in `user_sessions` on every successful login so we can invalidate tokens later.

### Files Created
```
backend/
  controllers/authController.js   ← register, login, me, logout, logoutAll
  routes/auth.js                  ← POST /register, POST /login, GET /me, etc.
```

### How Registration Works (Step by Step)
1. Receive `{ name, email, password }` from the request body
2. Check if email already exists in `users` table — return 409 if so
3. Hash the password with `bcrypt.hash(password, 12)` — **never store plaintext**
4. Insert the new user into the `users` table
5. Sign a JWT: `jwt.sign({ user_id, role }, JWT_SECRET, { expiresIn: '7d' })`
6. Insert a row into `user_sessions` (token_hash, ip, device_info, expires_at)
7. Return `{ token, user: { id, name, email, role } }`

### How Login Works
1. Find user by email — return 401 if not found
2. `bcrypt.compare(password, user.password_hash)` — return 401 if no match
3. Check `is_active` — return 403 if account is suspended
4. Sign JWT + create session (same as registration steps 5-6)
5. Return `{ token, user }`

### Acceptance Criteria
- [ ] `POST /api/auth/register` with duplicate email returns 409
- [ ] `POST /api/auth/login` with wrong password returns 401
- [ ] Passwords are NEVER stored as plaintext — only bcrypt hashes
- [ ] A row is inserted into `user_sessions` on every successful login
- [ ] `POST /api/auth/logout` marks the session as `is_active = false`

---

## SL-09 · Auth Middleware & Input Validation
**Assignee:** Naqi Afaq | **Priority:** Highest | **Sprint:** 1

### What & Why
Every protected route needs to verify the caller is logged in. The `auth`
middleware runs on every protected request, checks the JWT, and also queries
`user_sessions` to confirm the token hasn't been logged out. The `validate`
middleware catches bad input before it ever reaches the controller.

### Files Created
```
backend/
  middlewares/auth.js       ← JWT verification + session check
  middlewares/validate.js   ← express-validator error handler
```

### How auth.js Works
```
Request comes in with: "Authorization: Bearer <jwt>"
                               ↓
Step 1: Extract token from header
                               ↓
Step 2: jwt.verify(token, JWT_SECRET) — catches expired/tampered tokens
                               ↓
Step 3: Hash the token with SHA-256
                               ↓
Step 4: Query user_sessions WHERE token_hash = ? AND is_active = true AND expires_at > NOW()
                               ↓
Step 5: If no session found → 401 "Session expired or logged out"
                               ↓
Step 6: Attach req.user = { user_id, email, role } and call next()
```

### Why Check the Database on Every Request?
JWTs are self-contained — once issued, they are valid until they expire even
if the user logs out. By checking `user_sessions` on every request we can
immediately invalidate a token the moment the user clicks "Logout."

### Acceptance Criteria
- [ ] Request with no token returns 401
- [ ] Request with expired JWT returns 401
- [ ] Request with a logged-out token (session is_active=false) returns 401
- [ ] `req.user` has `user_id`, `email`, `role` after passing auth
- [ ] Validation errors from `express-validator` return 422 with field-level messages

---
---

# PHASE 4 — WALLET & MONEY MANAGEMENT APIs
> With auth working, we build the money features. The pattern is always the same:
> stored procedure first (owns the money logic), then the controller that calls it.

---

## SL-10 · Wallet Management API
**Assignee:** Ibrahim Malhi | **Priority:** High | **Sprint:** 2

### What & Why
Users need to create wallets for each currency they want to hold. The wallet API
handles creating, listing, and freezing wallets. These are the simplest money
operations because they don't move any funds.

### Files Created
```
backend/
  controllers/walletController.js   ← getAll, create, getById, toggleStatus
  routes/wallets.js                 ← GET /, POST /, GET /:id, PATCH /:id/toggle
```

### Endpoints We Built
| Method | Route | What It Does |
|--------|-------|------|
| GET | `/api/wallets` | Returns all wallets for the logged-in user |
| POST | `/api/wallets` | Creates a new wallet for a given currency |
| GET | `/api/wallets/:id` | Returns a single wallet by ID |
| PATCH | `/api/wallets/:id/toggle` | Freezes or unfreezes a wallet |

### Important Detail — Field Name Mapping
The database stores `currency_type` and `wallet_id`, but the frontend expects
`currency` and `_id`. The controller maps them:
```js
const fmt = (row) => ({
  _id:      row.wallet_id,
  currency: row.currency_type,   // ← mapped here
  balance:  parseFloat(row.balance),
  status:   row.status,
})
```

### Acceptance Criteria
- [ ] Cannot create two wallets with the same currency for the same user (409 error)
- [ ] Supported currencies: PKR, USD, EUR, GBP, AED, SAR, JPY, CAD, AUD, CHF
- [ ] Response uses `_id` and `currency` field names (not `wallet_id` and `currency_type`)
- [ ] All routes require the `auth` middleware

---

## SL-11 · Stored Procedures — The Money Movement Engine
**Assignee:** Ibrahim Gulzar | **Priority:** Highest | **Sprint:** 2

### What & Why
This is the most critical part of the entire backend. We write four PostgreSQL
stored procedures that own ALL balance changes. No controller ever reads a
balance and decides whether to proceed — only the stored procedure does that,
under a row lock. This prevents a **race condition** where two requests could
both pass a balance check and both deduct money, resulting in a negative balance.

### Files Modified
```
backend/config/schema.sql     ← 4 stored procedures
backend/config/migrations.sql ← process_deposit, process_withdrawal
```

### The 4 Stored Procedures

**transfer_money(from_wallet, to_wallet, amount, user_id)**
```
1. SELECT ... FROM wallets WHERE wallet_id = from_wallet FOR UPDATE  ← acquires row lock
2. SELECT ... FROM wallets WHERE wallet_id = to_wallet   FOR UPDATE  ← acquires row lock
3. Check: both wallets are 'active'
4. Check: from_wallet.balance >= amount
5. UPDATE wallets SET balance = balance - amount WHERE wallet_id = from_wallet
6. UPDATE wallets SET balance = balance + amount WHERE wallet_id = to_wallet
7. INSERT INTO transactions (...)
8. INSERT INTO audit_log (...)
9. RETURN transaction_id
```

**exchange_currency(from_wallet, to_wallet, amount, rate, user_id)**
- Same locking pattern, but credits `amount * rate` to the destination wallet

**process_deposit(deposit_id, wallet_id, amount, user_id)**
- Locks wallet → credits balance → marks deposit 'completed' → audit log

**process_withdrawal(withdrawal_id, wallet_id, amount, user_id)**
- Locks wallet → checks balance → debits → marks withdrawal 'completed' → audit log

### Why FOR UPDATE?
Without `FOR UPDATE`, two simultaneous requests could both read the same balance,
both decide there's enough money, and both deduct — leaving the wallet negative.
`FOR UPDATE` makes the second request wait until the first one commits.

### Acceptance Criteria
- [ ] Concurrent transfer test: sending the same money twice simultaneously only succeeds once
- [ ] Attempting to transfer more than the balance raises `RAISE EXCEPTION 'Insufficient balance'`
- [ ] Every money movement creates an `audit_log` entry
- [ ] No controller reads balance to decide whether to proceed — only the stored proc does

---

## SL-12 · Send Money API (Peer-to-Peer Transfer)
**Assignee:** Ibrahim Malhi | **Priority:** High | **Sprint:** 2

### What & Why
The core feature of SafeLedger — sending money to another user by email address.
This controller does all the safety checks before calling the stored procedure.

### Files Created
```
backend/
  controllers/transactionController.js   ← getAll, sendMoney
  routes/transactions.js                 ← GET /, POST /send
```

### How sendMoney Works (6 Steps)
```
1. FRAUD CHECK  → checkRapidFire() — is this user sending too fast?
2. OWNERSHIP    → Is fromWalletId actually owned by the logged-in user?
3. DAILY LIMIT  → checkDailyLimit() — has the user exceeded $5000 today?
4. RECIPIENT    → Find the recipient by recipientEmail — does this user exist?
5. WALLET MATCH → Does the recipient have an active wallet in the same currency?
6. TRANSFER     → Call transfer_money() stored procedure
```

### Acceptance Criteria
- [ ] Sending to yourself returns 400 "Cannot send money to yourself"
- [ ] Sending to a non-existent email returns 404 "Recipient not found"
- [ ] Sending to someone with no matching currency wallet returns 400
- [ ] Transaction history (`GET /api/transactions`) returns sender/receiver emails

---

## SL-13 · Currency Exchange API
**Assignee:** Naqi Afaq | **Priority:** High | **Sprint:** 2

### What & Why
Users can exchange money between their own wallets (e.g. convert USD to PKR).
The rate comes from the `exchange_rates` table — not hardcoded. This controller
also validates that both wallets belong to the same user and that the rate exists
for the chosen currency pair.

### Files Created
```
backend/
  controllers/exchangeController.js   ← getRates, convert
  routes/exchange.js                  ← GET /rates, POST /convert
```

### How convert Works
```
1. Verify fromWallet belongs to logged-in user
2. Verify toWallet belongs to logged-in user
3. Check fromCurrency ≠ toCurrency (can't exchange PKR for PKR)
4. Fraud gate (rapid-fire + daily limit)
5. Look up rate from exchange_rates table
   → If rate not found: return 404 "Exchange rate not available"
6. Calculate convertedAmount = amount × rate
7. Call exchange_currency() stored procedure
```

### Important: All 6 Supported Currencies Must Have Rates
When we first seeded the exchange_rates table, we missed several SAR pairs.
Later we added: SAR↔EUR, SAR↔GBP, SAR↔AED (all directions).

### Acceptance Criteria
- [ ] `GET /api/exchange/rates?from=USD&to=PKR` returns the rate from the database
- [ ] Exchanging an unsupported currency pair returns 404
- [ ] Both wallets must belong to the authenticated user
- [ ] Rate stored in DB as NUMERIC(20,8) — no floating point errors

---

## SL-14 · Deposit & Withdrawal API
**Assignee:** Ibrahim Malhi | **Priority:** High | **Sprint:** 2

### What & Why
Before deposits and withdrawals existed, there was no way for users to add money
to their wallets. These two controllers are nearly identical in structure —
they verify wallet ownership, create a pending record, then call the stored
procedure to complete the operation atomically.

### Files Created
```
backend/
  controllers/depositController.js    ← createDeposit, getDeposits
  controllers/withdrawalController.js ← createWithdrawal, getWithdrawals
  routes/deposits.js
  routes/withdrawals.js
```

### How createDeposit Works
```
BEGIN transaction
  1. Verify walletId belongs to this user
  2. INSERT INTO deposits (...) status='pending'
  3. SELECT process_deposit(depositId, walletId, amount, userId)
     ← stored procedure: locks wallet → credits balance → marks completed → audit
COMMIT

Return: { depositId, newBalance, currency, deposited }
```

### How createWithdrawal Works
```
1. checkRapidFire() — rate limiting
BEGIN transaction
  2. Verify wallet ownership
  3. checkDailyLimit()
  4. INSERT INTO withdrawals (...) status='pending'
  5. SELECT process_withdrawal(...)
     ← stored procedure: locks wallet → checks balance → debits → marks completed
COMMIT
```

### Acceptance Criteria
- [ ] Depositing into a frozen wallet returns 400 "Wallet is frozen or closed"
- [ ] Withdrawing more than the balance returns 400 "Insufficient balance"
- [ ] Both operations create a row in the `transactions` table (via stored proc)
- [ ] Maximum single deposit/withdrawal: 1,000,000 (validated by express-validator)

---

## SL-15 · Fraud Detection Middleware
**Assignee:** Naqi Afaq | **Priority:** High | **Sprint:** 2

### What & Why
A financial app needs to detect suspicious behavior. We implement two independent
checks: a fast in-memory rate limiter (no DB needed) and a daily volume limit
that queries the database.

### Files Created
```
backend/
  middlewares/fraudDetection.js   ← checkRapidFire, checkDailyLimit
```

### Check 1 — Rapid Fire (In-Memory)
```js
// Stored in a Map: userId → [timestamp, timestamp, ...]
// If more than 5 transactions in the last 60 seconds → block
checkRapidFire(userId)
→ { blocked: true,  reason: "Too many requests. Please wait." }
→ { blocked: false }
```

### Check 2 — Daily USD Limit (Database Query)
```js
// Converts all currencies to USD using exchange_rates table
// Sums all transactions in the last 24 hours for this user
// If total > $5000 USD equivalent → block
checkDailyLimit(userId, amount, currency, dbClient)
→ { blocked: true,  reason: "Daily transfer limit of $5000 exceeded." }
→ { blocked: false }
```

### Where These Are Used
Both checks run before acquiring any database locks in:
`sendMoney` → `exchange/convert` → `createWithdrawal`

### Acceptance Criteria
- [ ] More than 5 API calls in 60 seconds returns 429 Too Many Requests
- [ ] Daily limit check converts currencies correctly before comparing
- [ ] Blocked requests return 429 (not 400 or 500)
- [ ] In-memory store is per-server (documented limitation)

---

## SL-16 · User Profile & Admin Controllers
**Assignee:** Ibrahim Malhi | **Priority:** Medium | **Sprint:** 2

### What & Why
Users need to be able to view and update their profile. Admins need extra
endpoints to manage all users and transactions. We also add the `adminOnly`
middleware that blocks non-admins from the `/admin` routes.

### Files Created
```
backend/
  controllers/userController.js    ← getProfile, updateProfile, changePassword
  controllers/adminController.js   ← getAllUsers, getAllTransactions, freezeWallet,
                                      unfreezeWallet, suspendUser, reactivateUser,
                                      getAuditLog, adminOnly
  routes/users.js
  routes/admin.js
  scripts/resetAdmin.js            ← safely resets admin password via Node.js bcrypt
```

### Key Design Decision — getAllUsers Returns `_id` Not `id`
Most of the codebase uses `_id` (matching MongoDB conventions). `formatUser()`
was written to return `id` for auth responses (smaller payload), but the admin
dashboard needs `_id` for its Suspend/Reactivate buttons to work. We add `_id`
explicitly in the admin response:
```js
{ _id: r.user_id, ...formatUser(r), wallets: r.wallet_count, status: ... }
```

### resetAdmin.js — Why Does This Exist?
When running bcrypt hash insertion via PowerShell with double-quoted strings,
PowerShell interprets `$2a$12$...` as variable substitution and corrupts the hash.
This script uses Node.js directly — no shell variable expansion, no corruption.

### Acceptance Criteria
- [ ] Non-admin users get 403 on all `/api/admin/*` routes
- [ ] `GET /api/admin/users` returns `_id` field (not `id`)
- [ ] Admin cannot suspend their own account (returns 400)
- [ ] `node scripts/resetAdmin.js` successfully resets the admin password
- [ ] Every admin action (suspend, freeze, unfreeze) writes to `audit_log`

---
---

# PHASE 5 — FRONTEND APPLICATION
> The database and API are complete. Now we build the React frontend — starting
> with the app shell (router, layout) and working toward individual pages.

---

## SL-17 · Axios API Service Layer
**Assignee:** Haris Zafar | **Priority:** Highest | **Sprint:** 2

### What & Why
Before building any React page we create a central file that handles all HTTP
communication with the backend. Every page imports from this file — no page
ever uses `fetch()` or creates its own Axios instance.

### Files Created
```
src/
  services/api.js   ← Axios instance + all API modules
```

### What We Built

**The Axios Instance**
```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 8000,
})
```

**Request Interceptor** — attaches the auth token automatically:
```js
config.headers['Authorization'] = `Bearer ${sessionStorage.getItem('sl_token')}`
```

**Response Interceptor** — handles expired sessions:
```js
if (error.response?.status === 401) {
  sessionStorage.removeItem('sl_token')
  window.location.href = '/login'
}
```

**API Modules Exported**
```
authApi        → /auth/login, /auth/logout, /auth/logout-all
walletApi      → /wallets (CRUD + toggle)
transactionApi → /transactions (list + send)
exchangeApi    → /exchange/rates, /exchange/convert
depositApi     → /deposits (create + list)
withdrawalApi  → /withdrawals (create + list)
userApi        → /users/profile, change-password
adminApi       → /admin/users, /admin/transactions, suspend, reactivate, freeze
```

### Mock Data Fallbacks
Every API method has a `.catch()` fallback with realistic mock data. This allows
the frontend to be developed and demonstrated even when the backend is offline.

### Why `sessionStorage` Instead of `localStorage`?
`localStorage` is shared across all browser tabs. If two tabs are open with
different users logged in, switching users in Tab 2 would break Tab 1. `sessionStorage`
is per-tab — each tab has its own independent session.

### Acceptance Criteria
- [ ] All API modules exported as named exports
- [ ] Token attached automatically to every request — no page needs to set headers manually
- [ ] 401 response triggers automatic redirect to `/login`
- [ ] `sessionStorage` used everywhere — not `localStorage`
- [ ] Mock fallbacks return data in the same shape as the real API

---

## SL-18 · React App Bootstrap, Auth Context & Route Guards
**Assignee:** Haris Zafar | **Priority:** Highest | **Sprint:** 2

### What & Why
This sets up the React app's skeleton: the router, the authentication state
manager (AuthContext), and the route guard components that prevent unauthorized
access to protected pages.

### Files Created
```
src/
  main.jsx                   ← ReactDOM.render, wraps App in BrowserRouter
  App.jsx                    ← all routes defined here
  context/AuthContext.jsx    ← global auth state + login/logout/register functions
```

### The Three Route Guards
```jsx
// 1. PrivateRoute — redirect to /login if not authenticated
<Route element={<PrivateRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
  ...
</Route>

// 2. AdminRoute — redirect to /dashboard if not admin
<Route element={<AdminRoute />}>
  <Route path="/admin" element={<AdminDashboard />} />
</Route>

// 3. PublicRoute — redirect to /dashboard if already logged in
<Route element={<PublicRoute />}>
  <Route path="/login"    element={<Login />} />
  <Route path="/register" element={<Register />} />
</Route>
```

### AuthContext Provides
```js
{ user, token, isAuthenticated, login(), logout(), register(), updateUser() }
```
All state persisted to `sessionStorage` so it survives a browser refresh.

### Acceptance Criteria
- [ ] Visiting `/dashboard` while logged out redirects to `/login`
- [ ] Visiting `/admin` as a regular user redirects to `/dashboard`
- [ ] Visiting `/login` while already logged in redirects to `/dashboard`
- [ ] Refreshing the page keeps the user logged in (state restored from sessionStorage)
- [ ] All 10 routes registered: `/`, `/login`, `/register`, `/dashboard`, `/wallets`, `/send`, `/exchange`, `/transactions`, `/profile`, `/admin`, `/about`

---

## SL-19 · App Layout — Sidebar, Topbar & Navigation Shell
**Assignee:** Ibrahim Gulzar | **Priority:** High | **Sprint:** 2

### What & Why
All authenticated pages share the same outer shell: a sidebar on the left with
navigation links, and a topbar at the top with the page title and user info.
We build this once as `AppLayout` and all pages render inside its `<Outlet>`.

### Files Created
```
src/
  layouts/AppLayout.jsx      ← sidebar + topbar + <Outlet>
  components/Sidebar.jsx     ← logo, nav links, logout button
  components/Topbar.jsx      ← page title, user name + role badge
```

### Sidebar Navigation Links
| Icon | Label | Route | Visible To |
|------|-------|-------|------------|
| Grid | Dashboard | `/dashboard` | All users |
| Wallet | My Wallets | `/wallets` | All users |
| Send | Send Money | `/send` | All users |
| Exchange | Exchange | `/exchange` | All users |
| List | Transactions | `/transactions` | All users |
| User | Profile | `/profile` | All users |
| People | About Us | `/about` | All users |
| Shield | Admin | `/admin` | Admin only |

### Active Link Styling
The currently active route gets a gold left border and gold text color:
```jsx
className={isActive ? 'nav-link-active' : 'nav-link'}
```

### Acceptance Criteria
- [ ] Admin nav item only appears when `user.role === 'admin'`
- [ ] Active page is highlighted in the sidebar
- [ ] Logout button calls `authApi.logout()` then clears sessionStorage
- [ ] Layout is responsive — sidebar collapses on screens smaller than 1024px

---

## SL-20 · Login & Register Pages (Frontend)
**Assignee:** Haris Zafar | **Priority:** High | **Sprint:** 2

### What & Why
The first pages users see. We build two polished pages using the gold/dark theme
with a two-column layout on desktop (branding panel left, form right).

### Files Created
```
src/pages/
  Login.jsx      ← email, password, show/hide toggle, loading state
  Register.jsx   ← name, email, password, confirm password
```

### Login Page Features
- Left panel (hidden on mobile): grid background, gold radial glow, branding copy, feature list
- Right panel: email + password fields, show/hide password eye button
- Loading spinner on submit button while API call is in progress
- Error alert if credentials are wrong
- Redirects to `/dashboard` (users) or `/admin` (admins) after login

### Key Implementation — Two Tabs, Two Users
```js
// Using sessionStorage means Tab 1 and Tab 2 are completely independent
const token = sessionStorage.getItem('sl_token')  // ← per-tab, not shared
```

### Acceptance Criteria
- [ ] Error message displayed for wrong credentials
- [ ] Loading spinner shown while waiting for API response
- [ ] Admin users redirected to `/admin`, regular users to `/dashboard`
- [ ] Password field has show/hide toggle button
- [ ] Two browser tabs can log in as different users simultaneously

---

## SL-21 · Dashboard & Wallets Pages
**Assignee:** Haris Zafar | **Priority:** High | **Sprint:** 3

### What & Why
The Dashboard is the home screen after login — it gives an overview of balances,
recent transactions, and wallet cards. The Wallets page is where users manage their
individual wallets and add/withdraw funds.

### Files Modified
```
src/pages/
  Dashboard.jsx   ← stat cards, wallet carousel, recent transactions
  Wallets.jsx     ← wallet grid, deposit modal, withdraw modal, freeze button
src/components/
  WalletCard.jsx  ← animated credit card display for each wallet
```

### Dashboard Stat Cards
The 4 stat cards calculate totals from the loaded wallets:
- **Total Balance** — sum of all wallets converted to USD
- **Active Wallets** — count of wallets with status 'active'
- **Sent This Month** — filtered from transactions
- **Received This Month** — filtered from transactions

### Wallets Page — The Deposit Flow
```
User clicks "Deposit" button on a wallet card
      ↓
Modal opens showing wallet name and current balance
      ↓
User enters amount (or clicks quick-select: 100 / 500 / 1000 / 5000)
      ↓
depositApi.create({ walletId: wallet._id, amount })  ← calls POST /api/deposits
      ↓
On success: close modal + show success alert + fetchWallets() refreshes all balances
```

### Acceptance Criteria
- [ ] Dashboard loads wallet and transaction data in parallel (Promise.all)
- [ ] Deposit modal updates the wallet balance after success
- [ ] Withdraw modal shows an error if amount exceeds available balance
- [ ] Wallet cards show currency flag, balance, and status badge

---

## SL-22 · Send Money & Transactions History Pages
**Assignee:** Haris Zafar | **Priority:** High | **Sprint:** 3

### What & Why
Send Money is the P2P transfer screen. Transactions History is the record of
everything that ever happened in the user's account.

### Files Modified
```
src/pages/
  SendMoney.jsx     ← wallet selector, recipient email, amount, confirm modal
  Transactions.jsx  ← paginated table, type icons, status badges
```

### Send Money — The Confirm-Before-Send Pattern
Rather than sending immediately on form submit, we show a confirmation modal:
```
Form submit → validate inputs → open confirm modal
      ↓
Confirm modal shows:
  "Send 100 USD to alice@example.com from your USD Wallet"
      ↓
User clicks "Confirm" → transactionApi.send({ fromWalletId, recipientEmail, amount })
```
This prevents accidental transfers.

### Transactions History — Type Icons
| DB Type | Display | Icon | Color |
|---------|---------|------|-------|
| `transfer` (sender) | Send | ↑ | Red |
| `transfer` (receiver) | Receive | ↓ | Green |
| `exchange` | Exchange | ⇄ | Blue |
| `deposit` | Add | + | Green |
| `withdrawal` | Withdraw | − | Orange |

### Acceptance Criteria
- [ ] Cannot submit Send Money if amount exceeds wallet balance
- [ ] Confirmation modal shows full transfer summary before submission
- [ ] After successful send, wallet balance updates automatically
- [ ] Transaction list correctly distinguishes "Send" vs "Receive" for the same DB row

---

## SL-23 · Currency Exchange Page & User Profile Page
**Assignee:** Ibrahim Gulzar | **Priority:** High | **Sprint:** 3

### What & Why
The Exchange page lets users convert between their own wallets at live rates.
The Profile page lets users update their personal information and change their password.

### Files Modified
```
src/pages/
  Exchange.jsx   ← from/to selectors, amount input, rate banner, confirm modal
  Profile.jsx    ← edit name/email form, change password form
```

### Exchange Page — Live Rate Banner
```
On currency selection change:
  exchangeApi.getRates(from, to)
        ↓
  If API returns rate → use it (from exchange_rates table)
  If API fails → use demo DEMO_RATES fallback (for offline demo)
        ↓
  Display: "1 USD = 278.5000 PKR"  ← with refresh button
```

### Exchange Page — Auto-Create Wallet
If the user doesn't have a wallet for the destination currency, the app
creates it automatically before performing the exchange:
```js
if (!toWallet) {
  const res = await walletApi.create(to)
  toWallet = res.data
}
```

### Profile Page
- Edit name and email (PUT `/api/users/profile`)
- Change password: current password + new password + confirm new password
- Changing password invalidates all other sessions (security feature)

### Acceptance Criteria
- [ ] Exchange rate fetched from the API on every currency change
- [ ] Destination wallet auto-created if it doesn't exist
- [ ] Confirm modal shows exact amounts before exchange executes
- [ ] Profile changes persist after page refresh
- [ ] Password change requires entering the current password first

---

## SL-24 · Admin Dashboard Page
**Assignee:** Naqi Afaq | **Priority:** High | **Sprint:** 3

### What & Why
The admin dashboard gives SafeLedger administrators a bird's-eye view of the
platform — all users, all transactions, and controls to suspend or reactivate accounts.

### Files Modified
```
src/pages/AdminDashboard.jsx
```

### Three Tabs

**Tab 1 — Overview**
- 4 stat cards: Total Users, Total Transactions, Transaction Volume, Active Users
- Recent Users list (last 5 registered)
- Recent Transactions list (last 5 transactions)

**Tab 2 — Users**
Full table of all users with:
- Name + email, Role badge (admin/user), Wallet count, Status badge, Join date
- **Suspend / Reactivate** action button
  - Opens a confirm modal: "Are you sure you want to suspend Alice Johnson?"
  - Calls `adminApi.suspendUser(user._id)` → `PATCH /api/admin/users/:id/suspend`
  - Calls `adminApi.reactivateUser(user._id)` → `PATCH /api/admin/users/:id/reactivate`

**Tab 3 — Transactions**
Full table of all transactions across all users: ID, type, amount, currency, user email, status, date.

### Bug We Fixed During Build
The original code was calling `adminApi.freezeWallet(userId)` for the Suspend button —
wrong endpoint (takes a wallet ID, not a user ID) and wrong action (freezes a wallet,
not the account). Fixed to call `adminApi.suspendUser(userId)`.

### Acceptance Criteria
- [ ] All three tabs load data from the real API (not just mock data)
- [ ] Confirm modal shown before every suspend/reactivate action
- [ ] Suspend button correctly calls `/admin/users/:id/suspend` (not the wallet endpoint)
- [ ] Admin cannot suspend themselves (backend enforces, frontend shows error)

---

## SL-25 · Landing Page, About Us, Reusable Components & Logo
**Assignee:** Ibrahim Gulzar | **Priority:** Medium | **Sprint:** 3

### What & Why
The final polish sprint: the public-facing landing page, the About Us page
with team photos, all reusable UI components, and the professional logo.

### Files Created / Modified
```
src/
  pages/Landing.jsx                     ← full marketing page
  pages/About.jsx                       ← Meet The Team
  components/ui/TeamShowcase.jsx        ← photo cards + social links
  components/Modal.jsx                  ← reusable modal dialog
  components/Alert.jsx                  ← success/error/warning banners
  components/LoadingSpinner.jsx         ← animated loading indicator
  assets/safeledger-logo.svg            ← horizontal wordmark (480×160)
  assets/safeledger-icon.svg            ← square icon (100×100)
  assets/team/naqi_afaq.jpg
  assets/team/ibrahim_Malhi.jpg
  assets/team/haris_zafar.jpg
  assets/team/ibrahim_gulzar.jpg
  lib/utils.js                          ← cn() class merging helper
  index.css                             ← all global CSS classes and theme variables
```

### Landing Page Sections (Top to Bottom)
1. **Navbar** — centered pill with backdrop blur, logo, nav links, Sign In + Get Started CTAs
2. **Hero** — large headline with animated text, currency slider, two CTA buttons
3. **Features Grid** — 6 cards: multi-currency, P2P transfer, exchange, security, deposits, withdrawals
4. **Testimonials** — staggered cards from mock users
5. **FAQ** — accordion with 6 questions
6. **Footer** — copyright, links

### TeamShowcase Component
Displays the 4 developers with:
- Grayscale photo that transitions to color on hover
- Gold border glow on hover
- Name, role title, gold indicator bar
- Social buttons: LinkedIn, GitHub, Email (using `react-icons`)

### Logo Design Concept
- **Emblem**: hexagon shield (security) with vault door circle inside (finance)
  - 6 vertex dots mark the hexagon corners
  - 8 tick marks on the vault dial
  - "SL" monogram at center
- **Wordmark**: "SAFELEDGER" in serif display font with gold gradient
- **Tagline**: "DIGITAL VAULT" in spaced small caps below

### Acceptance Criteria
- [ ] Landing page is fully responsive from 375px to 1920px
- [ ] Navbar pill is centered (not full-width)
- [ ] About Us page shows all 4 team members with correct photos and social links
- [ ] Modal closes on backdrop click and Escape key
- [ ] Alert component has 4 types: success (green), error (red), warning (yellow), info (blue)
- [ ] Logo SVG renders correctly in all major browsers

---
---

# Execution Order & Dependencies

```
SPRINT 1 (Build the Foundation):
SL-01 Setup → SL-02 DB Connect → SL-03 Users Table → SL-04 Wallets Table
→ SL-05 Txn+Rates+Audit Tables → SL-06 Sessions+Deposits+Withdrawals Tables
→ SL-07 Express Server → SL-08 Auth API → SL-09 Auth Middleware

SPRINT 2 (Build the Features):
SL-10 Wallet API → SL-11 Stored Procedures → SL-12 Send Money API
→ SL-13 Exchange API → SL-14 Deposit/Withdrawal API → SL-15 Fraud Detection
→ SL-16 Profile+Admin API → SL-17 Axios Service → SL-18 React Router+AuthContext

SPRINT 3 (Build the UI & Polish):
SL-19 App Shell → SL-20 Login+Register → SL-21 Dashboard+Wallets
→ SL-22 Send+Transactions → SL-23 Exchange+Profile → SL-24 Admin Dashboard
→ SL-25 Landing+About+Logo
```

---

# Final Assignment Summary

| Ticket | Title | Assignee |
|--------|-------|----------|
| SL-01 | Project Setup & Dependencies | Naqi Afaq |
| SL-02 | PostgreSQL Connection | Ibrahim Malhi |
| SL-03 | Users Table | Ibrahim Malhi |
| SL-04 | Wallets Table | Ibrahim Malhi |
| SL-05 | Transactions, Rates & Audit Tables | Ibrahim Malhi |
| SL-06 | Sessions, Deposits & Withdrawals Tables | Naqi Afaq |
| SL-07 | Express Server & Response Helpers | Naqi Afaq |
| SL-08 | Registration & Login API | Ibrahim Malhi |
| SL-09 | Auth Middleware & Validation | Naqi Afaq |
| SL-10 | Wallet Management API | Ibrahim Malhi |
| SL-11 | Stored Procedures (Money Engine) | Ibrahim Gulzar |
| SL-12 | Send Money API | Ibrahim Malhi |
| SL-13 | Currency Exchange API | Naqi Afaq |
| SL-14 | Deposit & Withdrawal API | Ibrahim Malhi |
| SL-15 | Fraud Detection Middleware | Naqi Afaq |
| SL-16 | User Profile & Admin Controllers | Ibrahim Malhi |
| SL-17 | Axios API Service Layer | Haris Zafar |
| SL-18 | React Router, Auth Context & Guards | Haris Zafar |
| SL-19 | App Layout — Sidebar, Topbar | Ibrahim Gulzar |
| SL-20 | Login & Register Pages | Haris Zafar |
| SL-21 | Dashboard & Wallets Pages | Haris Zafar |
| SL-22 | Send Money & Transactions Pages | Haris Zafar |
| SL-23 | Exchange Page & Profile Page | Ibrahim Gulzar |
| SL-24 | Admin Dashboard Page | Naqi Afaq |
| SL-25 | Landing, About, Components & Logo | Ibrahim Gulzar |

| Member | Tickets | Count |
|--------|---------|-------|
| Naqi Afaq | SL-01, 06, 07, 09, 13, 15, 24 | 7 |
| Ibrahim Malhi | SL-02, 03, 04, 05, 08, 10, 12, 14, 16 | 9 |
| Haris Zafar | SL-17, 18, 20, 21, 22 | 5 |
| Ibrahim Gulzar | SL-11, 19, 23, 25 | 4 |