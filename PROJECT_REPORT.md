# ══════════════════════════════════════════════════════════
#                    SAFELEDGER 2.0
#              PROJECT REPORT & DOCUMENTATION
# ══════════════════════════════════════════════════════════

---

**Project Title:**    SafeLedger 2.0 — Multi-Currency Digital Vault
**Document Type:**    Technical Project Report
**Version:**          1.0
**Date:**             May 2026
**Institution:**      University Project — Software Engineering

---

## Team Members

| Name | Role | Student |
|---|---|---|
| Naqi Afaq | Project Lead / Full-Stack Developer | ✓ |
| Ibrahim Malhi | Backend Developer | ✓ |
| Haris Zafar | Frontend Developer | ✓ |
| Ibrahim Gulzar | Frontend / UI Designer | ✓ |

---

# TABLE OF CONTENTS

1. Executive Summary
2. Project Overview
3. Objectives & Scope
4. Technology Stack
5. System Architecture
6. Database Design
   6.1 Entity Relationship Overview
   6.2 Table Descriptions (8 Tables)
   6.3 Why NUMERIC(20,8) for Money?
   6.4 Why UUIDs Instead of Integer IDs?
   6.5 Database Indexes (18 Indexes)
   6.6 Database Triggers (3 Triggers)
   6.7 Stored Procedures (4 Procedures)
7. Security Architecture
8. Backend API Documentation
9. Frontend Application
10. Key Features
11. Challenges & Solutions
12. Testing & Quality
13. Future Enhancements
14. Conclusion

---
---

# 1. EXECUTIVE SUMMARY

SafeLedger 2.0 is a full-stack web application we built as our final software engineering project. The idea was to simulate how a real digital banking platform works — the kind of thing you see with apps like Wise or Revolut — but built from the ground up by four students who wanted to actually understand what goes on behind the scenes.

The system lets users open wallets in six different currencies (PKR, USD, EUR, GBP, AED, and SAR), send money to other registered users by entering their email, convert between currencies at rates stored in a database, and deposit or withdraw funds. On top of that, there's a full admin panel where a platform administrator can view every user and every transaction, and suspend or reactivate accounts when needed.

We used React 18 on the frontend with Vite and Tailwind CSS for styling, and Node.js with Express on the backend. The database is PostgreSQL, and we spent a significant amount of time on the database design — probably more than any other part of the project — because financial data needs to be handled with a level of care that most web apps don't require. We ended up writing stored procedures in PL/pgSQL so that balance updates would be atomic, and added row-level locks to prevent race conditions. We also implemented server-side session tracking so logout actually works properly, not just deleting the token from the browser.

The project taught us a lot, and not just technically. Managing a codebase across four people, dividing work in a way that doesn't cause merge conflicts, and testing a financial system properly were all things we had to figure out as we went.

---
---

# 2. PROJECT OVERVIEW

## 2.1 Background

The honest reason we picked a banking app is because financial systems are genuinely difficult to build correctly, and we wanted a challenge. Most tutorials show you how to make a CRUD app or a todo list — which is fine for learning — but they don't prepare you for questions like: what happens if two users send money to each other at the exact same millisecond? How do you make sure a user who logs out on one device can't have their session hijacked on another? How do you store money values without floating-point rounding errors creeping in?

We named the project SafeLedger because those two words capture what we were trying to build. Safe meaning the security and integrity of the money and the user's data. Ledger meaning every movement of funds is permanently recorded and traceable — the same way a physical accounting ledger works, except stored in PostgreSQL.

## 2.2 Visual Theme

We wanted the app to look like something you'd actually want to use, not another grey university project. The design is built around a dark background with gold accents — something that communicates trust and a bit of prestige, the way high-end banks tend to present themselves. The main background color is a near-black (#0D0D0D), and the primary accent is a warm antique gold (#C9973A). We also designed a custom logo — a hexagonal shield with a vault door in the centre — which ended up being used as both the app's browser icon and as part of the landing page header.

## 2.3 What the System Does

| Feature | Description |
|---|---|
| Multi-currency wallets | Create separate wallets for PKR, USD, EUR, GBP, AED, SAR |
| Peer-to-peer transfers | Send money to any registered user by email |
| Currency exchange | Convert between wallets using rates stored in the database |
| Deposits | Add funds to any active wallet |
| Withdrawals | Withdraw funds from any wallet with sufficient balance |
| Transaction history | Full history with type, amount, currency, status, counterparty |
| User profile | Edit name, email, and change password |
| Admin dashboard | Monitor all users and transactions, suspend or reactivate accounts |
| About Us | Team showcase with developer photos and links |

---
---

# 3. OBJECTIVES & SCOPE

## 3.1 What We Were Trying to Achieve

We had five main goals coming into this project. The first was straightforward: build something that actually works end to end, from clicking a button in the browser all the way down to a row changing in the database. A lot of projects at this level only get partway there.

The second goal was to implement financial transactions correctly — meaning the kind of atomicity and locking that prevents balances from going negative or transactions from being applied twice. This was the most technically demanding part and the one we're most proud of getting right.

Third, we wanted to apply proper security practices throughout. Not just "add a password" but actually think about what could go wrong — someone intercepting a token, someone brute-forcing passwords, someone spamming the transfer endpoint to move money faster than the system can check. We addressed all three of those.

Fourth, we wanted the UI to look professional. Ibrahim Gulzar took the lead on design and the result is something that genuinely looks like a real product.

And fifth, we wanted the code to be maintainable. Each part of the system — routes, controllers, middleware, database layer — is in its own file and does its own thing. If we had to hand this off to someone else, they'd be able to find their way around it.

## 3.2 Scope

### In Scope
- User registration, login, and session management
- Multi-currency wallet creation and management
- Peer-to-peer money transfers between registered users
- Currency exchange between a user's own wallets
- Deposit and withdrawal operations
- Full transaction history per user
- Administrative controls (view all users and transactions, suspend accounts)
- Responsive design for desktop and mobile browsers
- Mock data fallbacks so the frontend can be demoed without a live backend

### Out of Scope
- Real payment gateway integration (Stripe, PayPal, etc.)
- Real-time currency rate feeds (rates are manually seeded)
- Mobile native applications
- Email notifications
- Two-factor authentication
- KYC document verification

---
---

# 4. TECHNOLOGY STACK

## 4.1 Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI component framework |
| Vite | 5.x | Build tool and dev server |
| React Router | v6 | Client-side routing |
| Tailwind CSS | 3.x | Utility-first CSS framework |
| Axios | latest | HTTP client with interceptors |
| Framer Motion | latest | Page animations and transitions |
| react-icons | latest | Social media icons (TeamShowcase) |

## 4.2 Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | JavaScript runtime |
| Express.js | 4.x | Web framework and routing |
| pg (node-postgres) | latest | PostgreSQL client with connection pooling |
| bcryptjs | latest | Password hashing (bcrypt algorithm) |
| jsonwebtoken | latest | JWT signing and verification |
| express-validator | latest | Input validation and sanitization |
| dotenv | latest | Environment variable management |
| nodemon | latest | Auto-restart during development |

## 4.3 Database

| Technology | Version | Purpose |
|---|---|---|
| PostgreSQL | 15+ | Primary relational database |
| PL/pgSQL | — | Stored procedures for atomic money operations |

## 4.4 Development Tools

| Tool | Purpose |
|---|---|
| VS Code | Primary code editor |
| pgAdmin | PostgreSQL GUI administration |
| Postman | API endpoint testing |
| Git | Version control |
| JIRA | Project and sprint management |

---
---

# 5. SYSTEM ARCHITECTURE

## 5.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                  │
│                                                                  │
│   React 18 + Vite                 Tailwind CSS + Custom Theme   │
│   ┌──────────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│   │ Auth Context │  │  Router  │  │  Pages   │  │Components │ │
│   │(sessionStore)│  │(v6 Guards│  │(10 views)│  │(Modal etc)│ │
│   └──────┬───────┘  └────┬─────┘  └────┬─────┘  └───────────┘ │
│          │               │              │                        │
│          └───────────────┴──────────────┘                       │
│                          │                                       │
│                  services/api.js                                 │
│              (Axios + interceptors)                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │  HTTP/JSON  (Vite proxy /api → :5000)
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    EXPRESS.JS SERVER (:5000)                     │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────────┐│
│  │  Middleware  │  │   Routes    │  │      Controllers          ││
│  │─────────────│  │─────────────│  │──────────────────────────││
│  │ cors         │  │/auth        │  │ authController            ││
│  │ express.json │  │/wallets     │  │ walletController          ││
│  │ auth.js      │  │/transactions│  │ transactionController     ││
│  │ validate.js  │  │/exchange    │  │ exchangeController        ││
│  │ fraudDetect  │  │/deposits    │  │ depositController         ││
│  └─────────────┘  │/withdrawals │  │ withdrawalController      ││
│                   │/users       │  │ userController            ││
│                   │/admin       │  │ adminController           ││
│                   └─────────────┘  └──────────────────────────┘│
└──────────────────────────┬──────────────────────────────────────┘
                           │  pg Pool (connection pool)
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                      POSTGRESQL DATABASE                         │
│                                                                  │
│  Tables:                    Stored Procedures:                   │
│  ┌──────────────┐           ┌───────────────────────────────┐   │
│  │ users         │           │ transfer_money()              │   │
│  │ wallets       │           │ exchange_currency()           │   │
│  │ transactions  │     ←─── │ process_deposit()             │   │
│  │ exchange_rates│           │ process_withdrawal()          │   │
│  │ audit_log     │           └───────────────────────────────┘   │
│  │ user_sessions │                                               │
│  │ deposits      │                                               │
│  │ withdrawals   │                                               │
│  └──────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
```

## 5.2 Request Lifecycle

To give a concrete sense of how the layers connect, here's what happens when a user clicks "Confirm" on the Send Money page:

```
1. Browser          →  User clicks "Confirm" on the Send Money modal

2. api.js           →  axios.post('/transactions/send', { fromWalletId,
                         recipientEmail, amount })
                        Request interceptor attaches: Authorization: Bearer <jwt>

3. Vite Proxy       →  /api/transactions/send  →  localhost:5000/api/transactions/send

4. Express Router   →  POST /api/transactions/send  →  transactionController.sendMoney

5. auth middleware  →  Verify JWT → Hash token → Query user_sessions → attach req.user

6. validate MW      →  Check express-validator results → 422 if invalid

7. Controller       →  checkRapidFire → ownership check → daily limit check
                        → recipient lookup → wallet match check

8. Database         →  client.query('SELECT transfer_money($1,$2,$3,$4)', [...])
                        Stored proc: FOR UPDATE lock → balance check → debit/credit
                        → INSERT transactions → INSERT audit_log → COMMIT

9. Controller       →  return send(res, { _id, type, amount, status, ... })

10. Browser         →  Axios receives response → page updates wallet balance
                        → shows success alert
```

## 5.3 Folder Structure

```
SafeLedger2.0/
│
├── backend/                          ← Node.js / Express API
│   ├── config/
│   │   ├── database.js               ← pg Pool, query(), getClient()
│   │   ├── schema.sql                ← All tables + stored procedures + seed data
│   │   └── migrations.sql            ← Added tables (sessions, deposits, withdrawals)
│   ├── controllers/
│   │   ├── authController.js         ← register, login, logout, me
│   │   ├── walletController.js       ← CRUD + toggleStatus
│   │   ├── transactionController.js  ← getAll, sendMoney
│   │   ├── exchangeController.js     ← getRates, convert
│   │   ├── depositController.js      ← createDeposit, getDeposits
│   │   ├── withdrawalController.js   ← createWithdrawal, getWithdrawals
│   │   ├── userController.js         ← getProfile, updateProfile, changePassword
│   │   └── adminController.js        ← getAllUsers, getAllTransactions, suspend, etc.
│   ├── middlewares/
│   │   ├── auth.js                   ← JWT + user_sessions check
│   │   ├── validate.js               ← express-validator error handler
│   │   └── fraudDetection.js         ← rapid-fire + daily limit checks
│   ├── routes/
│   │   ├── auth.js, wallets.js, transactions.js
│   │   ├── exchange.js, deposits.js, withdrawals.js
│   │   ├── users.js, admin.js
│   ├── utils/
│   │   └── response.js               ← send() and fail() helpers
│   ├── scripts/
│   │   └── resetAdmin.js             ← safely resets admin password
│   └── server.js                     ← Express app entry point
│
└── src/                              ← React 18 Frontend
    ├── App.jsx                       ← Router + route guards
    ├── main.jsx                      ← ReactDOM entry point
    ├── index.css                     ← Global styles + custom classes
    ├── context/
    │   └── AuthContext.jsx           ← Global auth state (sessionStorage)
    ├── services/
    │   └── api.js                    ← Axios instance + all API modules
    ├── layouts/
    │   └── AppLayout.jsx             ← Sidebar + Topbar + <Outlet>
    ├── components/
    │   ├── Sidebar.jsx, Topbar.jsx
    │   ├── WalletCard.jsx, Modal.jsx
    │   ├── Alert.jsx, LoadingSpinner.jsx
    │   └── ui/                       ← Advanced UI components
    │       ├── TeamShowcase.jsx
    │       ├── credit-card-1.jsx
    │       └── (+ 10 more components)
    ├── pages/
    │   ├── Landing.jsx               ← Public marketing page
    │   ├── Login.jsx, Register.jsx
    │   ├── Dashboard.jsx
    │   ├── Wallets.jsx
    │   ├── SendMoney.jsx
    │   ├── Exchange.jsx
    │   ├── Transactions.jsx
    │   ├── Profile.jsx
    │   ├── AdminDashboard.jsx
    │   └── About.jsx
    ├── assets/
    │   ├── safeledger-logo.svg       ← Horizontal wordmark
    │   ├── safeledger-icon.svg       ← Square emblem icon
    │   └── team/                     ← Developer photos
    └── lib/
        └── utils.js                  ← cn() class merging utility
```

---
---

# 6. DATABASE DESIGN

## 6.1 Entity Relationship Overview

```
users  ──< wallets ──< transactions (from_wallet_id)
                   └─< transactions (to_wallet_id)
                   └─< deposits
                   └─< withdrawals
users  ──< user_sessions
users  ──< audit_log
exchange_rates  (standalone lookup table)
```

## 6.2 Table Descriptions

The database has eight tables in total. Five of them are defined in schema.sql — the core tables that the system couldn't run without. The other three came in through migrations.sql once we realised partway through development that sessions and separate deposit/withdrawal tracking needed their own tables rather than being shoehorned into the transactions table.

### users

This is the central table. Every wallet, every session, and every audit trail entry traces back to a row here. We went with UUID as the primary key rather than a serial integer — more on why in section 6.4.

| Column | Type | Notes |
|---|---|---|
| user_id | UUID | Primary key, auto-generated via gen_random_uuid() |
| name | VARCHAR(255) | Display name shown in the UI |
| email | VARCHAR(255) | Unique — used for login and P2P recipient lookup |
| phone | VARCHAR(30) | Optional, not required at registration |
| password_hash | VARCHAR(255) | bcrypt hash, 12 rounds — never the raw password |
| role | VARCHAR(20) | Either 'user' or 'admin' — enforced by CHECK constraint |
| is_active | BOOLEAN | Set to false when an admin suspends the account |
| created_at | TIMESTAMPTZ | Timestamp with time zone, defaults to NOW() |

### wallets

One row per currency per user. The UNIQUE constraint on (user_id, currency_type) means you cannot accidentally create two PKR wallets for the same person — the database just rejects it.

| Column | Type | Notes |
|---|---|---|
| wallet_id | UUID | Primary key |
| user_id | UUID | Foreign key → users (CASCADE delete) |
| currency_type | VARCHAR(10) | PKR, USD, EUR, GBP, AED, SAR, etc. |
| balance | NUMERIC(20,8) | 8 decimal places, CHECK constraint enforces >= 0 |
| status | VARCHAR(20) | 'active', 'frozen', or 'closed' |
| created_at | TIMESTAMPTZ | When the wallet was opened |
| UNIQUE | (user_id, currency_type) | One wallet per currency per user |

### transactions

This is the permanent ledger. Every single movement of money — whether it's a transfer, an exchange, a deposit, or a withdrawal — creates a row here. We never delete from this table.

| Column | Type | Notes |
|---|---|---|
| transaction_id | UUID | Primary key |
| from_wallet_id | UUID | FK → wallets, NULL for deposits (money comes from outside) |
| to_wallet_id | UUID | FK → wallets, NULL for withdrawals (money goes outside) |
| amount | NUMERIC(20,8) | Always positive, CHECK > 0 |
| transaction_type | VARCHAR(20) | transfer / exchange / deposit / withdrawal |
| status | VARCHAR(20) | pending / success / failed |
| metadata | JSONB | Stores extra info like exchange rate, deposit_id, etc. |
| created_at | TIMESTAMPTZ | When the transaction was initiated |

### exchange_rates

A simple lookup table for currency conversion rates. The rates are seeded manually and would ideally be updated by a scheduled job pulling from a live API — but for this project they're fixed values that are realistic as of early 2026.

| Column | Type | Notes |
|---|---|---|
| rate_id | UUID | Primary key, auto-generated |
| from_currency | VARCHAR(10) | Source currency code (e.g. 'USD') |
| to_currency | VARCHAR(10) | Target currency code (e.g. 'PKR') |
| rate | NUMERIC(20,8) | Multiply source amount by this to get converted amount |
| updated_at | TIMESTAMPTZ | When this rate was last set |
| UNIQUE | (from_currency, to_currency) | One rate per directional pair |

We seeded 47 pairs covering 12 currencies: PKR, USD, EUR, GBP, AED, SAR, JPY, CAD, AUD, CHF, SGD, and HKD. All six of the primary currencies have full bidirectional coverage, meaning you can exchange in either direction between any two of them.

### user_sessions

This table is what makes real logout possible. When a user logs in, we store a SHA-256 hash of their JWT here. On every authenticated request, the middleware hashes the incoming token and checks this table. If the session has been deactivated — because the user logged out or an admin forced them out — the request is rejected even if the JWT itself hasn't expired yet.

| Column | Type | Notes |
|---|---|---|
| session_id | UUID | Primary key, auto-generated |
| user_id | UUID | FK → users (CASCADE delete) |
| token_hash | TEXT | SHA-256 hash of the JWT — not the raw token itself |
| ip_address | INET | Client IP at time of login |
| device_info | TEXT | User-Agent string |
| is_active | BOOLEAN | Flipped to false on logout |
| created_at | TIMESTAMPTZ | Login timestamp |
| expires_at | TIMESTAMPTZ | Mirrors the JWT expiry time |

### deposits

Whenever a user deposits funds into a wallet, a row is created here first, then the process_deposit() stored procedure processes it and marks it completed. This separation means we have a full history of every top-up attempt, including ones that failed.

| Column | Type | Notes |
|---|---|---|
| deposit_id | UUID | Primary key, auto-generated |
| wallet_id | UUID | FK → wallets (CASCADE delete) |
| amount | NUMERIC(20,8) | Deposit amount, CHECK > 0 |
| method | VARCHAR(50) | 'manual' by default — would be 'bank' or 'card' in a real system |
| status | VARCHAR(20) | pending / completed / failed |
| reference_id | VARCHAR(100) | Optional external reference number, nullable |
| metadata | JSONB | Flexible field for extra data (currency, source details) |
| created_at | TIMESTAMPTZ | When the deposit request was created |
| completed_at | TIMESTAMPTZ | Set by the stored procedure when processing succeeds |

### withdrawals

Mirrors the deposits table but for outgoing cash-outs. The same lifecycle applies — a row is created, then processed atomically by process_withdrawal().

| Column | Type | Notes |
|---|---|---|
| withdrawal_id | UUID | Primary key, auto-generated |
| wallet_id | UUID | FK → wallets (CASCADE delete) |
| amount | NUMERIC(20,8) | Withdrawal amount, CHECK > 0 |
| method | VARCHAR(50) | 'manual' by default |
| status | VARCHAR(20) | pending / completed / failed |
| reference_id | VARCHAR(100) | Optional external reference number, nullable |
| metadata | JSONB | Flexible field for destination details |
| created_at | TIMESTAMPTZ | When the withdrawal request was created |
| completed_at | TIMESTAMPTZ | Set by the stored procedure on completion |

### audit_log

Every sensitive operation in the system writes a record here. Status changes on wallets, successful and failed transactions, admin actions — all of it ends up in this table, either through the controllers or automatically through database triggers. The idea is that if something goes wrong, you can always trace what happened and when.

| Column | Type | Notes |
|---|---|---|
| log_id | UUID | Primary key, auto-generated |
| transaction_id | UUID | FK → transactions, nullable (some actions have no transaction) |
| user_id | UUID | Who performed the action (nullable for system-generated entries) |
| action | VARCHAR(100) | TRANSFER_SUCCESS, DEPOSIT_SUCCESS, WALLET_STATUS_CHANGED, etc. |
| details | JSONB | Amounts, wallet IDs, before/after states |
| ip_address | INET | The request IP address |
| timestamp | TIMESTAMPTZ | When the action occurred |

## 6.3 Why NUMERIC(20,8) for Money?

This is something we learned the hard way when testing early versions of the exchange feature. JavaScript's standard floating-point number type — and PostgreSQL's FLOAT type — cannot represent all decimal fractions exactly. The classic example is that 0.1 + 0.2 in floating-point gives you 0.30000000000000004, not 0.3.

For most applications that's a minor annoyance. For a financial application it's a serious problem, because those tiny errors accumulate across thousands of transactions and you end up with balances that don't add up. NUMERIC(20,8) stores exact decimal values with no rounding error at all. The 20 digits of precision and 8 decimal places also give us room to work with currencies that have very different scales — PKR amounts in the hundreds of thousands and USD amounts with cents both fit comfortably.

## 6.4 Why UUIDs Instead of Integer IDs?

Serial integer IDs (1, 2, 3...) are convenient but they expose information you probably don't want to expose. If a user discovers the URL /api/transactions/42, it takes no effort at all to guess that /api/transactions/43 and /api/transactions/41 also exist and start probing them. Even with proper authentication checks, it gives attackers a roadmap.

UUIDs like 3f2504e0-4f89-11d3-9a0c-0305e82c3301 are 128-bit randomly generated values. There are so many possible UUIDs that guessing a valid one is effectively impossible. This doesn't replace authentication checks, but it removes an entire class of enumeration attacks before they can even start.

## 6.5 Database Indexes

Without indexes, every query that looks up rows by a column other than the primary key has to scan the entire table from top to bottom. For a table with thousands of rows that becomes slow quickly. We defined 18 indexes across all eight tables, each targeting a specific query pattern we knew the application would run frequently.

| Index Name | Table | Column(s) | Purpose |
|---|---|---|---|
| idx_wallets_user | wallets | user_id | Load all wallets for a user |
| idx_txn_from_wallet | transactions | from_wallet_id | Outgoing transaction history |
| idx_txn_to_wallet | transactions | to_wallet_id | Incoming transaction history |
| idx_txn_created_at | transactions | created_at DESC | Chronological transaction listing |
| idx_txn_status | transactions | status | Filter pending or failed transactions |
| idx_audit_txn | audit_log | transaction_id | Audit entries for a specific transaction |
| idx_audit_user | audit_log | user_id | Audit trail for a specific user |
| idx_audit_timestamp | audit_log | timestamp DESC | Chronological audit listing |
| idx_rates_pair | exchange_rates | (from_currency, to_currency) | Rate lookup by currency pair |
| idx_sessions_user | user_sessions | user_id | All sessions belonging to a user |
| idx_sessions_token | user_sessions | token_hash | Auth middleware token validation |
| idx_sessions_active | user_sessions | (is_active, expires_at) | Filter active non-expired sessions |
| idx_deposits_wallet | deposits | wallet_id | Deposit history for a specific wallet |
| idx_deposits_status | deposits | status | Filter pending or completed deposits |
| idx_deposits_created | deposits | created_at DESC | Chronological deposit listing |
| idx_withdrawals_wallet | withdrawals | wallet_id | Withdrawal history for a wallet |
| idx_withdrawals_status | withdrawals | status | Filter pending or completed withdrawals |
| idx_withdrawals_created | withdrawals | created_at DESC | Chronological withdrawal listing |

The three most critical ones in practice are idx_sessions_token (hit on every single authenticated HTTP request), idx_txn_from_wallet and idx_txn_to_wallet (used together to build a user's transaction history), and idx_rates_pair (looked up every time a currency conversion happens and also during the fraud detection daily-limit calculation).

## 6.6 Database Triggers

Triggers are one of those PostgreSQL features you don't really think about until you realise they solve a problem elegantly. Instead of relying on every single controller to remember to write an audit log entry or check for negative balances, we put that logic directly in the database where nothing can bypass it.

We have three triggers.

### Trigger 1 — trg_prevent_negative_balance

This one fires before every balance update on the wallets table. The table already has a CHECK constraint (balance >= 0), but in some edge cases a direct UPDATE can slip past a CHECK. This trigger is a second line of defence — if any operation would result in a balance below zero, it raises an exception immediately and rolls back the entire transaction.

```sql
IF NEW.balance < 0 THEN
    RAISE EXCEPTION 'NEGATIVE_BALANCE: wallet % cannot have balance %',
        NEW.wallet_id, NEW.balance;
END IF;
```

### Trigger 2 — trg_wallet_status_change

This fires after any update to the status column on wallets. Any time a wallet gets frozen, unfrozen, or closed — whether by the user or by an admin — the trigger automatically writes a record to audit_log with the wallet ID, the currency, the old status, and the new status. We don't need to remember to add audit logging in every place that might change a wallet status; the database handles it.

```sql
IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO audit_log (user_id, action, details)
    VALUES (
        NEW.user_id,
        'WALLET_STATUS_CHANGED',
        jsonb_build_object(
            'wallet_id',  NEW.wallet_id,
            'currency',   NEW.currency_type,
            'old_status', OLD.status,
            'new_status', NEW.status
        )
    );
END IF;
```

### Trigger 3 — trg_transaction_failure

When a transaction transitions from pending to failed, this trigger fires and writes a record to audit_log with the transaction type and amount. Failures are just as important to log as successes — if something keeps failing in a suspicious pattern, you want a record of it.

```sql
IF OLD.status = 'pending' AND NEW.status = 'failed' THEN
    INSERT INTO audit_log (transaction_id, action, details)
    VALUES (
        NEW.transaction_id,
        'TRANSACTION_FAILED',
        jsonb_build_object('type', NEW.transaction_type, 'amount', NEW.amount)
    );
END IF;
```

## 6.7 Stored Procedures

This is probably the most important design decision in the entire project. We made a rule early on: no JavaScript code is ever allowed to directly update a wallet balance. Every single balance change — transfer, exchange, deposit, withdrawal — goes through a stored procedure in PL/pgSQL.

The reason is atomicity. A transfer involves at least six steps: acquire locks, validate both wallets, deduct from sender, add to receiver, record the transaction, write the audit log. If any one of those steps fails for any reason, the entire thing has to roll back. If we were doing this in JavaScript, we'd have to manage a transaction manually with BEGIN/COMMIT/ROLLBACK and be very careful that no code path could exit without committing or rolling back. Doing it in a stored procedure means the database handles all of that automatically.

### Procedure 1 — transfer_money()

Moves a specified amount from one wallet to another wallet of the same currency.

```sql
transfer_money(
    p_from_wallet_id  UUID,
    p_to_wallet_id    UUID,
    p_amount          NUMERIC(20,8),
    p_initiated_by    UUID
) RETURNS UUID
```

The steps it runs atomically: acquire row locks in UUID sort order, validate both wallets exist and are active, confirm they share the same currency, check the sender has enough balance, insert a pending transaction record, deduct from sender, add to receiver, mark the transaction successful, write an audit log entry, and return the transaction ID. If anything goes wrong between the first step and the last, everything rolls back and the balances are untouched.

The UUID sort order for locking is worth explaining. Deadlocks happen when transaction A holds a lock on row 1 and waits for row 2, while transaction B holds a lock on row 2 and waits for row 1. By always locking the wallet with the smaller UUID first — regardless of which is the sender — we guarantee that two concurrent transfers involving the same pair of wallets will always try to acquire locks in the same order, which breaks the deadlock cycle.

### Procedure 2 — exchange_currency()

Converts an amount from one currency wallet to a different currency wallet, both owned by the same user.

```sql
exchange_currency(
    p_from_wallet_id  UUID,
    p_to_wallet_id    UUID,
    p_amount          NUMERIC(20,8),
    p_exchange_rate   NUMERIC(20,8),
    p_initiated_by    UUID
) RETURNS UUID
```

The main addition compared to transfer_money is the conversion calculation: the converted amount is computed as ROUND(p_amount * p_exchange_rate, 8), and the procedure validates that the two wallets have different currencies rather than the same one. The exchange rate and converted amount are stored in the transaction's metadata JSONB field so there's a permanent record of what rate was applied.

### Procedure 3 — process_deposit()

Credits a wallet when a user makes a deposit.

```sql
process_deposit(
    p_deposit_id UUID,
    p_wallet_id  UUID,
    p_amount     NUMERIC(20,8),
    p_user_id    UUID
) RETURNS UUID
```

It locks the wallet row, validates that the wallet is active, adds the amount to the balance, records a success transaction, marks the deposit record as completed with a timestamp, and writes to the audit log. One thing that's slightly different from the transfer procedures is that there's no "from" wallet — the money is coming from outside the system, so from_wallet_id on the transaction is left NULL.

### Procedure 4 — process_withdrawal()

Debits a wallet for a withdrawal request, with balance validation before anything is touched.

```sql
process_withdrawal(
    p_withdrawal_id UUID,
    p_wallet_id     UUID,
    p_amount        NUMERIC(20,8),
    p_user_id       UUID
) RETURNS UUID
```

Same structure as process_deposit but in reverse — it locks the wallet, checks the balance is sufficient, deducts the amount (which triggers the negative balance trigger as a safety net), records the transaction, marks the withdrawal completed, and writes the audit entry. Because of the FOR UPDATE lock, two simultaneous withdrawal requests on the same wallet cannot both pass the balance check — the second one waits for the first to commit and then re-reads the updated balance.

---
---

# 7. SECURITY ARCHITECTURE

We thought about security at five separate layers. The idea is defence in depth — if one layer is somehow bypassed, there are still four more standing between an attacker and the user's money.

## 7.1 Layer 1 — Password Security (bcrypt)

User passwords are never stored in plaintext anywhere — not in the database, not in logs, not anywhere. When someone registers, their password goes through bcrypt with 12 rounds before it ever touches the database.

```
plaintext: "MyPassword123!"
             ↓  bcrypt.hash(password, 12 rounds)
stored:    "$2a$12$LQv3c1yqBWVH..."  ← one-way hash, cannot be reversed
```

Twelve rounds means each hash takes roughly 300 milliseconds to compute. That might sound slow, but it's intentional — if an attacker steals the database and tries to crack passwords by brute force, each attempt costs them 300ms, which makes large-scale cracking impractical.

## 7.2 Layer 2 — JWT Authentication

After a successful login, the server creates a JSON Web Token that the client sends with every subsequent request.

```json
Header:  { "alg": "HS256", "typ": "JWT" }
Payload: { "user_id": "uuid...", "role": "user", "exp": 1735689600 }
Signature: HMACSHA256(base64(header) + "." + base64(payload), JWT_SECRET)
```

The token is signed with a secret key that only the server knows. If anyone tampers with the payload — say, trying to change "role": "user" to "role": "admin" — the signature check fails and the request is rejected. The client stores the token in sessionStorage rather than localStorage, which we'll cover in section 7.7.

## 7.3 Layer 3 — Server-Side Session Validation

JWTs have a well-known limitation: once issued, they're valid until they expire. If a user logs out and someone else captures their token, standard JWT authentication won't stop them from using it. We solved this by storing a SHA-256 hash of every issued token in the user_sessions table. Every authenticated request goes through this check:

```
auth middleware:
  1. Verify JWT signature         → 401 if tampered or expired
  2. Hash the token (SHA-256)     → prevents raw token storage
  3. Query user_sessions          → 401 if session is_active = false
  4. Check expires_at > NOW()     → 401 if manually expired
```

When a user logs out, their session row gets marked is_active = false. The token they were using becomes immediately invalid — not after it expires, right now. This also means admins can force-logout any user by deactivating all their sessions.

## 7.4 Layer 4 — Input Validation

Every endpoint that accepts data from the user runs it through express-validator before the request reaches a controller. Things like:

```js
body('amount').isFloat({ gt: 0, max: 1_000_000 })
body('walletId').isUUID()
body('email').isEmail().normalizeEmail()
```

If validation fails, a 422 response goes back before any business logic runs. This blocks SQL injection, type confusion attacks, and attempts to submit impossibly large values.

## 7.5 Layer 5 — Fraud Detection

Two independent checks run before money can leave an account.

The first is a rapid-fire check that runs entirely in memory. It tracks how many outgoing transactions each user initiates per minute. If someone hits more than five in sixty seconds, they get a 429 Too Many Requests response. This stops scripts that try to drain an account by firing hundreds of small transactions simultaneously.

The second is a daily volume limit that queries the database. It sums all outgoing transactions for the user in the past 24 hours, converts everything to a USD equivalent using the exchange_rates table, and blocks the transaction if the total exceeds a configured threshold (set to $5,000 USD by default). This catches slower-moving automated attacks that stay under the per-minute limit.

## 7.6 Layer 6 — Database-Level Protection

The stored procedures described in section 6.7 are ultimately what guarantees financial integrity. No controller reads a balance, decides if it's sufficient, and then updates it — that pattern is vulnerable to race conditions:

```
UNSAFE pattern (race condition possible):
   Controller reads balance: 100
   Two concurrent requests both see: 100 >= 80  → ALLOW
   Both deduct 80 → balance becomes -60

SAFE pattern (stored procedure with FOR UPDATE):
   Stored proc acquires row lock on wallet
   Second concurrent request WAITS
   First request commits, balance = 20
   Second request reads balance: 20 < 80  → REJECT
```

## 7.7 Multi-Tab Security (sessionStorage)

This came up when we were testing and noticed a problem: if two browser tabs both pointed to the app and you logged in as different users in each tab, the second login would overwrite the first tab's token in localStorage, effectively logging out the first tab silently. sessionStorage is scoped to a single tab — each tab has its own completely independent storage — so both sessions can coexist without interfering with each other.

---
---

# 8. BACKEND API DOCUMENTATION

## 8.1 Base URL
```
Development:  http://localhost:5000/api
Frontend Proxy: /api  →  http://localhost:5000/api
```

## 8.2 Authentication
All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

## 8.3 Response Format

Every endpoint returns the same JSON envelope structure, which made it straightforward to write a single error-handling interceptor on the frontend:

```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "message": "Human-readable error description" }
```

## 8.4 Endpoint Reference

### Authentication — /api/auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /auth/register | No | Create new account |
| POST | /auth/login | No | Sign in, get JWT |
| GET | /auth/me | Yes | Get current user info |
| POST | /auth/logout | No | Invalidate current session |
| POST | /auth/logout-all | Yes | Invalidate all sessions |

### Wallets — /api/wallets

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /wallets | Yes | Get all wallets for logged-in user |
| POST | /wallets | Yes | Create wallet { currency } |
| GET | /wallets/:id | Yes | Get single wallet |
| PATCH | /wallets/:id/toggle | Yes | Freeze or unfreeze wallet |

### Transactions — /api/transactions

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /transactions | Yes | Transaction history (paginated) |
| POST | /transactions/send | Yes | Send money { fromWalletId, recipientEmail, amount } |

### Exchange — /api/exchange

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /exchange/rates?from=USD&to=PKR | No | Get exchange rate for a specific pair |
| GET | /exchange/rates | No | Get all rates |
| POST | /exchange/convert | Yes | Exchange { fromWalletId, toWalletId, amount } |

### Deposits — /api/deposits

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /deposits | Yes | Deposit { walletId, amount } |
| GET | /deposits | Yes | Get deposit history |

### Withdrawals — /api/withdrawals

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /withdrawals | Yes | Withdraw { walletId, amount } |
| GET | /withdrawals | Yes | Get withdrawal history |

### Users — /api/users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /users/profile | Yes | Get user profile |
| PUT | /users/profile | Yes | Update name and email |
| PUT | /users/change-password | Yes | Change password |

### Admin — /api/admin (Admin role required)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /admin/users | Admin | All users with wallet count |
| GET | /admin/transactions | Admin | All transactions |
| GET | /admin/audit-log | Admin | Full audit trail |
| PATCH | /admin/wallets/:id/freeze | Admin | Freeze a wallet |
| PATCH | /admin/wallets/:id/unfreeze | Admin | Unfreeze a wallet |
| PATCH | /admin/users/:id/suspend | Admin | Suspend a user account |
| PATCH | /admin/users/:id/reactivate | Admin | Reactivate a user account |

## 8.5 Error Codes

| HTTP Code | Meaning | When Used |
|---|---|---|
| 200 | OK | Successful GET, PATCH |
| 201 | Created | Successful POST creating a new resource |
| 400 | Bad Request | Business logic error (insufficient balance, etc.) |
| 401 | Unauthorized | Missing, invalid, or expired token |
| 403 | Forbidden | Authenticated but wrong role |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate (email already registered, currency wallet already exists) |
| 422 | Unprocessable | Input validation failed |
| 429 | Too Many Requests | Fraud detection triggered |
| 500 | Server Error | Unexpected database or server error |

---
---

# 9. FRONTEND APPLICATION

## 9.1 Page Structure

### Public Pages (no login required)
| Page | Route | Description |
|---|---|---|
| Landing | / | Marketing page with hero, features, FAQ, and testimonials |
| Login | /login | Sign in form |
| Register | /register | Account creation form |

### Authenticated Pages (login required)
| Page | Route | Description |
|---|---|---|
| Dashboard | /dashboard | Balance overview, wallet cards, recent transactions |
| Wallets | /wallets | All wallets, deposit/withdraw/freeze controls |
| Send Money | /send | P2P transfer form |
| Exchange | /exchange | Currency conversion form with live rates |
| Transactions | /transactions | Full transaction history table |
| Profile | /profile | Edit name, email, change password |
| About Us | /about | Team showcase with developer photos |

### Admin Only
| Page | Route | Description |
|---|---|---|
| Admin Dashboard | /admin | User management, all transactions, audit log |

## 9.2 Route Guard System

React Router v6 doesn't have built-in route guards, so we wrote three wrapper components that check auth state before rendering:

```jsx
App.jsx route structure:
│
├── <PublicRoute>     ← redirect to /dashboard if already logged in
│   ├── /            → Landing
│   ├── /login       → Login
│   └── /register    → Register
│
├── <PrivateRoute>    ← redirect to /login if not authenticated
│   └── <AppLayout>  ← Sidebar + Topbar wraps everything below
│       ├── /dashboard      → Dashboard
│       ├── /wallets        → Wallets
│       ├── /send           → SendMoney
│       ├── /exchange       → Exchange
│       ├── /transactions   → Transactions
│       ├── /profile        → Profile
│       └── /about          → About
│
└── <AdminRoute>      ← redirect to /dashboard if not admin role
    └── <AppLayout>
        └── /admin    → AdminDashboard
```

## 9.3 State Management

We used React Context rather than Redux. For a project this size, Redux would have been overkill — the global state we actually need is just the auth information, and everything else is local to whatever page is currently rendered.

AuthContext holds:
```js
{
  user:            { id, name, email, role },
  token:           "eyJhbGc...",
  isAuthenticated: true,
  login(email, password),       // calls API, stores to sessionStorage
  logout(),                     // calls API, clears sessionStorage
  register(name, email, pass),  // calls API, stores to sessionStorage
  updateUser(data),             // updates local user info after profile edit
}
```

All other state — wallet lists, transaction history, form inputs — lives locally in each page component using useState and useEffect, fetched fresh on mount.

## 9.4 API Integration Pattern

Every page follows the same loading pattern:

```jsx
const [data, setData]       = useState([])
const [loading, setLoading] = useState(true)
const [error, setError]     = useState(null)

useEffect(() => {
  walletApi.getAll()
    .then(res => setData(res.data))
    .catch(err => setError(err.response?.data?.message || 'Failed to load'))
    .finally(() => setLoading(false))
}, [])

if (loading) return <PageLoader />
```

We also built mock data fallbacks into every API call in api.js. If the backend is offline, the frontend falls back to realistic hardcoded data so the UI can still be demonstrated. The mock data is clearly labelled and doesn't pretend to be real.

## 9.5 Design System

The entire UI uses a custom Tailwind configuration with these design tokens:

| Token | Value | Used For |
|---|---|---|
| void | #09090F | Page backgrounds |
| card | #111118 | Card and panel backgrounds |
| gold | #C9973A | Primary accent, buttons, highlights |
| chalk | #F5F0E8 | Primary text |
| smoke | #8A8278 | Secondary or muted text |
| ember | #6A6058 | Tertiary or placeholder text |

Custom CSS classes defined in index.css:

| Class | Description |
|---|---|
| .btn-gold | Primary gold gradient button |
| .btn-outline | Ghost button with gold border |
| .card | Standard dark card container |
| .input-field | Form input with gold focus ring |
| .select-field | Dropdown with gold styling |
| .badge-success | Green status badge |
| .badge-failed | Red status badge |
| .badge-pending | Yellow status badge |
| .gold-gradient | Gold radial background fill |
| .gold-text | Gold text color with gradient |

---
---

# 10. KEY FEATURES (Detailed)

## 10.1 Multi-Currency Wallets

Each wallet is an independent row in the wallets table with its own balance. The system enforces one wallet per currency per user through a UNIQUE constraint — you can't create a second USD wallet accidentally. We support up to ten currencies: PKR, USD, EUR, GBP, AED, SAR, JPY, CAD, AUD, and CHF.

When a wallet is frozen, the stored procedures check for status = 'active' before processing any money movement. A frozen wallet can neither send nor receive. Closed wallets are treated the same way but are intended to be permanent.

## 10.2 Peer-to-Peer Money Transfer

Sending money works by entering the recipient's email address rather than their wallet ID. We thought this was more natural — you know someone's email, you probably don't know their wallet UUID. The system resolves the email to an account, finds the matching currency wallet, and calls transfer_money(). If the recipient doesn't have a wallet in that currency, the user gets a clear error message explaining why.

A few edge cases we specifically handled: you can't send to yourself (the stored procedure rejects it), you can't send more than your balance, and the recipient's wallet must be active. Frozen wallets can't receive funds either.

## 10.3 Currency Exchange

The Exchange page lets users convert between their own wallets. The rate gets fetched from the exchange_rates table and displayed before the user confirms. If the user doesn't have a wallet in the destination currency yet, the page creates one automatically before calling exchange_currency().

The conversion uses full NUMERIC(20,8) precision throughout, so the converted amount is exact. The applied rate is stored in the transaction's metadata field, which means you can always look back at any exchange and see exactly what rate was used.

## 10.4 Deposits and Withdrawals

Deposits are processed instantly and have no daily limit — the maximum single deposit is one million units, which we felt was reasonable for a demo system. Withdrawals go through the fraud detection checks and are subject to the daily volume limit.

Both operations use stored procedures so the entire lifecycle — from creating the pending record to marking it completed and writing the audit log — happens atomically. There's no intermediate state where the balance has changed but the transaction hasn't been recorded.

## 10.5 Admin Dashboard

The admin panel is only accessible to users with role = 'admin'. It has three tabs: an overview with platform-wide statistics, a users tab showing every registered account with the ability to suspend or reactivate them, and a transactions tab showing all transactions across all users.

Every admin action writes to audit_log with the admin's user_id, so there's always a record of who did what and when. The suspend/reactivate feature was actually broken in an early version — it was calling the wrong API endpoint — and we had to track down and fix both the frontend call and the backend controller. Details in section 11.

---
---

# 11. CHALLENGES & SOLUTIONS

## 11.1 Race Condition in Money Transfers

This was the problem we spent the most time thinking about before writing a single line of code. The scenario is: two HTTP requests arrive at almost the same time, both trying to send from the same wallet. Both read the balance, both see it's sufficient, both proceed. The result is a balance that goes negative.

The solution is SELECT ... FOR UPDATE inside the stored procedures. This places a row-level lock on the wallet row. The second request can't even read the balance until the first one has committed. By the time it does, the balance has already been reduced, and if there isn't enough left, the stored procedure raises an exception and rolls back. We also lock wallets in UUID sort order to prevent the deadlock variant of this problem, where two transfers involving the same pair of wallets could each hold one lock and wait for the other.

## 11.2 JWT Logout Problem

Standard JWTs are stateless by design. Once the server issues one, it's valid until it expires — deleting it from the client doesn't actually invalidate it. If someone captured the token out of the browser's developer tools before logout, they could keep using it.

The solution was the user_sessions table. We hash every JWT with SHA-256 before storing it, so the database never holds a raw token. On every authenticated request, the middleware hashes the incoming token and looks it up. If the session has been deactivated — either by normal logout or by an admin — the token is rejected immediately, regardless of its expiry time.

## 11.3 Multi-Tab Login Collision

During testing we opened two browser tabs and logged in as different users. The second login overwrote the first tab's token in localStorage, causing the first tab to silently start making API calls as the second user. This is a real bug in any app that uses localStorage for auth state.

Switching to sessionStorage fixed it. Each browser tab gets its own completely separate sessionStorage — opening tab 2 and logging in there has no effect on what's stored in tab 1.

## 11.4 PowerShell Corrupting bcrypt Hashes

When setting up the default admin account, we tried to INSERT the bcrypt hash directly in a PowerShell command. PowerShell treated the dollar signs in the hash string ($2a$12$...) as variable names and tried to expand them, which corrupted the hash completely and the login would fail with no obvious error message.

The fix was to write a small Node.js script (backend/scripts/resetAdmin.js) that generates a fresh hash and inserts it using the pg library. Node.js doesn't do anything special with dollar signs in strings, so the hash arrives in the database intact.

## 11.5 Missing SAR Exchange Rate Pairs

When we first built the exchange feature, the seed data had full coverage for most currency pairs but was missing several SAR combinations — specifically SAR to and from EUR, GBP, and AED. The frontend calculated a rough demo rate for those pairs, so they appeared to work in development. But the backend went to the database, couldn't find the rate, and returned a 404. Users trying to exchange between SAR and those currencies would get an error that looked like a server crash.

The fix was straightforward once we identified it — we added all the missing bidirectional pairs to the seed data in schema.sql and inserted them into the live database. After that we tested every possible currency combination in the UI to make sure nothing else was missing.

## 11.6 Admin Suspend Button Calling Wrong Endpoint

The Admin Dashboard Suspend button was wired up to call adminApi.freezeWallet(userId), which sends a request to /admin/wallets/:id/freeze. That endpoint expects a wallet ID, not a user ID. The effect was that it sent the user ID as if it were a wallet ID, the backend didn't find a matching wallet, but the frontend's error handling swallowed the failure and showed a success message anyway. So the UI said the user was suspended but the database was unchanged.

We added proper suspendUser and reactivateUser functions to the API service that call the correct endpoints, and rewrote the confirmFreeze handler in AdminDashboard to use them. We also discovered that the reactivateUser endpoint didn't exist in the backend at all and had to add it.

## 11.7 User ID Field Inconsistency

The formatUser() helper function in the backend returned the field as id (without underscore), but the Admin Dashboard was looking for u._id (with underscore and underscore prefix). Using real API data, u._id was always undefined, which meant the Suspend and Reactivate buttons couldn't determine which user to act on. The workaround was straightforward — we explicitly added _id: r.user_id to the getAllUsers response alongside the rest of the formatted user data.

---
---

# 12. TESTING & QUALITY

## 12.1 API Testing

All endpoints were tested manually through Postman. We covered the happy path for each one, but also made sure to test failure cases: what happens with a missing or expired token, what happens if you submit invalid data types, what happens if you try to send more than your balance. The fraud detection endpoints required some extra work to test because we had to either trigger the in-memory rapid-fire counter or simulate a large daily transaction volume.

## 12.2 Frontend Build Verification

We ran npm run build before submission to make sure the production bundle compiled without errors.

```
2257 modules transformed
dist/index.html         0.81 kB  │ gzip: 0.45 kB
dist/assets/index.css  50.31 kB  │ gzip: 10.13 kB
dist/assets/index.js  566.19 kB  │ gzip: 167.61 kB
Built in 7.08s
```

No JSX compilation errors, no unused import warnings, no type errors.

## 12.3 Database Constraint Testing

We verified each of the database's constraints by deliberately trying to break them. Registering with a duplicate email returns 409. Creating a second wallet in the same currency returns 409. Attempting to set a negative balance triggers the CHECK constraint and the backup trigger. Trying to send more than the wallet holds raises an exception from the stored procedure. All of these behaved correctly.

## 12.4 Known Limitations

| Limitation | Impact | Mitigation |
|---|---|---|
| In-memory fraud detection | Resets on server restart, not shared across multiple instances | Acceptable for a single-server project |
| Manual exchange rates | Rates don't update in real time | Seeded with realistic current values |
| No automated test suite | Manual testing only | Covered by thorough Postman testing |
| Mock data fallbacks | Frontend shows demo data if backend is offline | Clearly labelled mock data, appropriate for demos |

---
---

# 13. FUTURE ENHANCEMENTS

If we were to take this further — which honestly we'd like to — these are the areas we'd tackle first:

| Enhancement | Priority | Description |
|---|---|---|
| Real payment gateways | High | Integrate Stripe or PayPal for actual card deposits |
| Live exchange rates | High | Connect to an API like Open Exchange Rates or Fixer.io |
| Email notifications | Medium | Confirmation emails for transfers and deposits |
| Two-factor authentication | Medium | TOTP-based 2FA for login and large transfers |
| Redis session store | Medium | Move fraud detection state to Redis for multi-server setups |
| Automated test suite | Medium | Jest and Supertest for the API, React Testing Library for the UI |
| WebSockets | Low | Real-time balance updates without refreshing the page |
| Mobile app | Low | React Native version sharing the same backend API |
| KYC verification | Low | Document upload and identity verification |
| Blockchain audit trail | Low | Hash-linking transactions so the audit trail is tamper-evident |

---
---

# 14. CONCLUSION

We set out to build a full-stack financial platform that actually worked correctly, not just one that looked like it worked. Looking back, we think we managed that.

## What Was Achieved

On the technical side, we ended up with a REST API covering over 25 endpoints across 8 route groups, a PostgreSQL database with 8 tables, 4 stored procedures, 3 triggers, and 18 indexes, six independent security layers protecting user data and funds, and a React frontend with 10 pages built on a fully custom design system. The ACID guarantees on the money operations are genuine — we tested concurrent transactions and confirmed that the row locking works as intended.

On the process side, we organised the work into 25 JIRA tickets spread across three sprints, divided responsibilities by feature domain so people weren't constantly stepping on each other's work, and documented bugs properly as we found them rather than just quietly fixing them.

## What We Learned

| Area | What We Took Away |
|---|---|
| Database design | Why NUMERIC beats FLOAT for money, when and why to use UUIDs, how to structure a normalised schema, and how to write stored procedures that actually guarantee atomicity |
| Security | The full chain from password hashing to JWT signing to session invalidation to input validation to database-level locking — and why each layer matters independently |
| Backend | RESTful API design principles, how middleware chaining works, connection pooling, and proper error handling that doesn't leak internal details |
| Frontend | React Context and when it's enough, writing route guards properly, Axios interceptors, and why sessionStorage matters for multi-tab security |
| Full-stack thinking | How to trace a single user action all the way from browser click to database row and back, and what can go wrong at each step |
| Teamwork | How to divide work on a shared codebase without creating merge nightmares, and why documenting bugs matters as much as fixing them |

## Final Thoughts

This project is the closest thing to a production system we've built as students. The architecture choices we made — stored procedures for money movement, server-side session validation, per-tab sessionStorage — aren't academic exercises. They're the patterns real financial services use, adapted to a scale we could actually build and understand. That gap between "it compiles and runs" and "it handles concurrent users, bad inputs, and edge cases correctly" is where most of the real learning happened, and it's the part we're most glad we pushed through.

---

*SafeLedger 2.0 — Final Project Report*
*Prepared by: Naqi Afaq, Ibrahim Malhi, Haris Zafar, Ibrahim Gulzar*
*May 2026*

---