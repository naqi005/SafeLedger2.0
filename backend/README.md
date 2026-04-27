# SafeLedger Backend

Node.js + Express + PostgreSQL API for the SafeLedger P2P wallet platform.

## Quick Start

### 1. Create the PostgreSQL database

```bash
psql -U postgres -c "CREATE DATABASE safeledger;"
```

### 2. Run the schema (tables + stored procedures + triggers + seed data)

```bash
psql -U postgres -d safeledger -f config/schema.sql
```

### 3. Configure environment

Edit `backend/.env` and fill in your DB password and a strong JWT secret:

```env
DB_PASSWORD=your_postgres_password
JWT_SECRET=change_this_to_a_long_random_string
```

### 4. Install and run

```bash
npm install
npm run dev       # development (nodemon)
npm start         # production
```

API will be available at **http://localhost:5000**

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, get JWT |
| GET | `/api/auth/me` | ✓ | Get current user |
| GET | `/api/wallets` | ✓ | List user wallets |
| POST | `/api/wallets` | ✓ | Create wallet |
| GET | `/api/wallets/:id` | ✓ | Get wallet |
| PATCH | `/api/wallets/:id/toggle` | ✓ | Freeze / unfreeze |
| GET | `/api/transactions` | ✓ | Transaction history |
| POST | `/api/transactions/send` | ✓ | P2P transfer |
| GET | `/api/transactions/:id` | ✓ | Single transaction |
| GET | `/api/exchange/rates` | ✓ | Exchange rates |
| POST | `/api/exchange/convert` | ✓ | Currency exchange |
| GET | `/api/users/profile` | ✓ | Get profile |
| PUT | `/api/users/profile` | ✓ | Update profile |
| PUT | `/api/users/change-password` | ✓ | Change password |
| POST | `/api/users/add-money` | ✓ | Deposit funds |
| GET | `/api/admin/users` | Admin | All users |
| GET | `/api/admin/transactions` | Admin | All transactions |
| GET | `/api/admin/audit-log` | Admin | Audit log |
| PATCH | `/api/admin/wallets/:id/freeze` | Admin | Freeze wallet |
| PATCH | `/api/admin/wallets/:id/unfreeze` | Admin | Unfreeze wallet |
| PATCH | `/api/admin/users/:id/suspend` | Admin | Suspend user |

---

## Default Admin Account

After running the schema:

| Field | Value |
|-------|-------|
| Email | `admin@safeledger.com` |
| Password | `Admin@SafeLedger2024` |

**Change this immediately in production.**

---

## Architecture

```
backend/
  server.js               — Express bootstrap, middleware stack, route mounting
  config/
    database.js           — pg Pool, query helper, transaction client
    schema.sql            — Tables, indexes, stored procedures, triggers, seed data
  middlewares/
    auth.js               — JWT verification, user lookup
    validate.js           — express-validator error handler
    fraudDetection.js     — Rapid-fire check + daily USD limit
  controllers/
    authController.js     — register, login, /me
    walletController.js   — CRUD + toggle status
    transactionController.js — history, P2P send
    exchangeController.js — rate lookup, currency exchange
    userController.js     — profile, password, deposit
    adminController.js    — admin-only operations
  routes/
    auth.js | wallets.js | transactions.js
    exchange.js | users.js | admin.js
  utils/
    response.js           — send() and fail() helpers
```

## Security Features

- **bcrypt** password hashing (12 rounds)
- **JWT** authentication on all protected routes
- **Parameterised queries** throughout — no raw string interpolation
- **helmet** security headers
- **CORS** locked to frontend origin
- **Rate limiting** — 200 req/15 min global, 10 auth attempts/15 min
- **Input validation** via express-validator on every mutating route
- **Fraud detection** — 5 transactions/min + $10,000/day USD equivalent limit

## Database Features

- **Stored procedures** — `transfer_money()` and `exchange_currency()` for ACID-compliant balance operations
- **Triggers** — `trg_prevent_negative_balance`, `trg_wallet_status_change`, `trg_transaction_failure`
- **Row-level locking** — consistent lock ordering in stored procedures prevents deadlocks
- **Audit log** — every transfer, exchange, deposit, login, and admin action is recorded