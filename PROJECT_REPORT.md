# ══════════════════════════════════════════════════════════
#                    SAFELEDGER 2.0
#              PROJECT REPORT & DOCUMENTATION
# ══════════════════════════════════════════════════════════

---

**Project Title:**    SafeLedger 2.0 — Multi-Currency Digital Vault
**Document Type:**    Technical Project Report
**Version:**          1.0
**Date:**             April 2026
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

SafeLedger 2.0 is a full-stack web application that simulates a modern
multi-currency digital banking platform. The system allows users to create
wallets in multiple currencies (PKR, USD, EUR, GBP, AED, SAR), send money
peer-to-peer by email address, exchange currencies at live rates, and
deposit or withdraw funds.

The project was built using a React 18 frontend (Vite + Tailwind CSS) and
a Node.js/Express backend connected to a PostgreSQL relational database.
Security is enforced at multiple layers: bcrypt password hashing, JWT
authentication with server-side session validation, input validation,
fraud detection, and ACID-compliant stored procedures that prevent
double-spending through row-level locking.

An administrative dashboard allows platform administrators to monitor all
users and transactions and suspend or reactivate accounts.

The project demonstrates industry-standard practices in full-stack web
development including RESTful API design, relational database modeling,
secure authentication, and modern React patterns.

---
---

# 2. PROJECT OVERVIEW

## 2.1 Background

Traditional banking applications are complex, monolithic, and hard to
learn from. SafeLedger 2.0 was designed as an educational full-stack
project that mirrors the core functionality of real digital payment
platforms (like Wise, Revolut, or PayPal) while remaining approachable
enough to build in an academic setting.

The name "SafeLedger" reflects two core ideas:
- **Safe** — every financial operation is secured with industry-standard
  cryptography, row-level database locking, and server-side session management
- **Ledger** — every transaction is permanently recorded and traceable
  through an audit log

## 2.2 Project Theme

The visual identity is built around a **premium dark gold** aesthetic — deep
near-black backgrounds (#0D0D0D), warm gold accents (#C9973A), and an
art-deco typographic style. This communicates trust, security, and
financial prestige — similar to how high-end financial institutions present
themselves.

## 2.3 What the System Does

| Feature | Description |
|---|---|
| Multi-currency wallets | Create separate wallets for PKR, USD, EUR, GBP, AED, SAR |
| Peer-to-peer transfers | Send money to any registered user by email |
| Currency exchange | Convert between wallets using live database rates |
| Deposits | Add funds to any active wallet |
| Withdrawals | Withdraw funds from any wallet with sufficient balance |
| Transaction history | Full history with type, amount, currency, status, counterparty |
| User profile | Edit name, email, and change password |
| Admin dashboard | Monitor all users and transactions, suspend/reactivate accounts |
| About Us | Team showcase with developer photos and social links |

---
---

# 3. OBJECTIVES & SCOPE

## 3.1 Primary Objectives

1. **Build a working full-stack web application** that demonstrates the
   complete request lifecycle from browser to database and back
2. **Implement secure financial transactions** using database-level locking
   to prevent race conditions and double-spending
3. **Apply industry-standard security practices**: bcrypt, JWT, server-side
   session validation, input sanitization, fraud detection
4. **Design a professional user interface** that matches the quality standard
   of real-world fintech applications
5. **Produce maintainable, modular code** with clear separation between
   routes, controllers, middleware, and the database layer

## 3.2 Scope

### In Scope
- User registration, login, and session management
- Multi-currency wallet creation and management
- Peer-to-peer money transfers between registered users
- Currency exchange between a user's own wallets
- Deposit and withdrawal operations
- Full transaction history for each user
- Administrative controls (view all users/transactions, suspend accounts)
- Responsive design for desktop and mobile browsers
- Mock data fallbacks for frontend demo without a live backend

### Out of Scope
- Real payment gateway integration (Stripe, PayPal, etc.)
- Real-time currency rate feeds (rates are manually seeded)
- Mobile native applications (iOS / Android)
- Email notifications
- Two-factor authentication (MFA)
- KYC (Know Your Customer) document verification

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
| PostgreSQL | 18 | Primary relational database |
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

A typical authenticated request (e.g. "Send Money") goes through these layers:

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

### users
The central entity. Every wallet, session, and audit trail traces back here.

| Column | Type | Notes |
|---|---|---|
| user_id | UUID | Primary key, auto-generated |
| name | VARCHAR(100) | Display name |
| email | VARCHAR(150) | Unique, used for login and P2P lookup |
| password_hash | TEXT | bcrypt hash — never plaintext |
| phone | VARCHAR(20) | Optional |
| role | VARCHAR(20) | 'user' or 'admin' |
| is_active | BOOLEAN | false = suspended account |
| created_at | TIMESTAMPTZ | Registration timestamp |

### wallets
One row per currency per user.

| Column | Type | Notes |
|---|---|---|
| wallet_id | UUID | Primary key |
| user_id | UUID | FK → users |
| currency_type | VARCHAR(10) | PKR, USD, EUR, GBP, AED, SAR... |
| balance | NUMERIC(20,8) | 8 decimal places, CHECK ≥ 0 |
| status | VARCHAR(20) | 'active', 'frozen', 'closed' |
| UNIQUE | (user_id, currency_type) | One wallet per currency per user |

### transactions
The permanent ledger of every money movement.

| Column | Type | Notes |
|---|---|---|
| transaction_id | UUID | Primary key |
| from_wallet_id | UUID | FK → wallets (NULL for deposits) |
| to_wallet_id | UUID | FK → wallets (NULL for withdrawals) |
| amount | NUMERIC(20,8) | Always positive |
| transaction_type | VARCHAR(30) | transfer / exchange / deposit / withdrawal |
| status | VARCHAR(20) | pending / success / failed |
| metadata | JSONB | Exchange rate, deposit_id, etc. |

### exchange_rates
Live currency conversion rates.

| Column | Type | Notes |
|---|---|---|
| from_currency | VARCHAR(10) | Source currency code |
| to_currency | VARCHAR(10) | Target currency code |
| rate | NUMERIC(20,8) | Multiply source amount by this |
| UNIQUE | (from_currency, to_currency) | One rate per pair |

**Seeded pairs include all combinations of:** PKR, USD, EUR, GBP, AED, SAR
(plus JPY, CAD, AUD, CHF, SGD, HKD for extended coverage)

### user_sessions
Enables true server-side logout — JWTs can be invalidated before expiry.

| Column | Type | Notes |
|---|---|---|
| session_id | UUID | Primary key |
| user_id | UUID | FK → users |
| token_hash | TEXT | SHA-256 of the JWT (not the raw token) |
| ip_address | INET | Client IP |
| device_info | TEXT | User-Agent string |
| is_active | BOOLEAN | false = logged out |
| expires_at | TIMESTAMPTZ | Mirrors JWT expiry |

### deposits / withdrawals
Dedicated lifecycle tracking for top-ups and cash-outs.

| Column | Type | Notes |
|---|---|---|
| deposit_id / withdrawal_id | UUID | Primary key |
| wallet_id | UUID | FK → wallets |
| amount | NUMERIC(20,8) | CHECK > 0 |
| method | VARCHAR(50) | 'manual', 'bank', 'card', etc. |
| status | VARCHAR(20) | pending / completed / failed |
| metadata | JSONB | Extra info (reference number etc.) |
| completed_at | TIMESTAMPTZ | Set when stored proc completes |

### audit_log
Immutable record of every sensitive operation for compliance.

| Column | Type | Notes |
|---|---|---|
| log_id | UUID | Primary key |
| transaction_id | UUID | FK → transactions (nullable) |
| user_id | UUID | Who performed the action |
| action | VARCHAR(100) | DEPOSIT_SUCCESS, ADMIN_SUSPEND_USER, etc. |
| details | JSONB | Amounts, wallet IDs, target users |
| ip_address | INET | Request IP |
| timestamp | TIMESTAMPTZ | When it happened |

## 6.3 Why NUMERIC(20,8) for Money?

Floating-point types (FLOAT, DOUBLE) cannot represent all decimal fractions
exactly. For example, `0.1 + 0.2` in floating-point equals `0.30000000000000004`,
not `0.3`. In a financial application this rounding error accumulates across
transactions. `NUMERIC(20,8)` stores exact decimal values with no rounding error.

## 6.4 Why UUIDs Instead of Integer IDs?

Integer IDs (1, 2, 3...) are predictable. An attacker who discovers
`/api/transactions/42` might try `/api/transactions/43`, `/44`, etc. UUIDs
(e.g. `3f2504e0-4f89-11d3-9a0c-0305e82c3301`) are 128-bit random values —
practically impossible to guess. This adds a layer of security through obscurity
on top of the authentication checks.

---
---

# 7. SECURITY ARCHITECTURE

SafeLedger 2.0 implements security at five independent layers. An attacker
who bypasses one layer still faces the others.

## 7.1 Layer 1 — Password Security (bcrypt)

User passwords are **never stored in plaintext**. When a user registers:
```
plaintext: "MyPassword123!"
             ↓  bcrypt.hash(password, 12 rounds)
stored:    "$2a$12$LQv3c1yqBWVH..."  ← one-way hash, cannot be reversed
```

bcrypt with 12 rounds takes ~300ms to hash, making brute-force attacks
computationally expensive. Even if the database is stolen, passwords cannot
be recovered.

## 7.2 Layer 2 — JWT Authentication

After login the server issues a **JSON Web Token**:
```json
Header:  { "alg": "HS256", "typ": "JWT" }
Payload: { "user_id": "uuid...", "role": "user", "exp": 1735689600 }
Signature: HMACSHA256(base64(header) + "." + base64(payload), JWT_SECRET)
```

The client stores this token in `sessionStorage` and sends it with every
request: `Authorization: Bearer <token>`. The server verifies the signature
using the secret key — a tampered token will fail verification.

## 7.3 Layer 3 — Server-Side Session Validation

JWTs are stateless by design — once issued they are valid until expiry, even
if the user logs out. We solve this by storing a SHA-256 hash of every token
in the `user_sessions` table. On every protected request:

```
auth middleware:
  1. Verify JWT signature         → 401 if tampered or expired
  2. Hash the token (SHA-256)     → prevents raw token storage
  3. Query user_sessions          → 401 if session is_active = false
  4. Check expires_at > NOW()     → 401 if manually expired
```

This enables:
- **True logout** — deactivate the session, token is immediately invalid
- **Logout from all devices** — deactivate all sessions for a user
- **Forced logout** — admin can invalidate a user's sessions

## 7.4 Layer 4 — Input Validation

Every API endpoint that accepts user input uses `express-validator` rules:
```js
body('amount').isFloat({ gt: 0, max: 1_000_000 })
body('walletId').isUUID()
body('email').isEmail().normalizeEmail()
```
Invalid input is rejected with 422 before reaching any controller or database.
This prevents SQL injection, type confusion, and unexpected large values.

## 7.5 Layer 5 — Fraud Detection

Two independent checks run before any money leaves an account:

**Rapid-Fire Check (in-memory)**
- Tracks how many transactions a user initiates per minute
- Blocks if more than 5 transactions in 60 seconds
- Returns HTTP 429 Too Many Requests

**Daily Volume Limit (database query)**
- Sums all outgoing transactions in the past 24 hours
- Converts all currencies to USD equivalent using exchange_rates
- Blocks if total exceeds the configured daily limit (default: $5,000 USD)

## 7.6 Layer 6 — Database-Level Protection (Stored Procedures)

The most critical security guarantee: **no controller ever reads a balance
and decides whether to allow a transaction**. This prevents the classic
time-of-check/time-of-use (TOCTOU) race condition.

```
❌ UNSAFE pattern (race condition possible):
   Controller reads balance: 100
   Two concurrent requests both see: 100 >= 80 → ALLOW
   Both deduct 80 → balance becomes -60

✅ SAFE pattern (stored procedure with FOR UPDATE):
   Stored proc acquires row lock on wallet
   Second concurrent request WAITS
   First request commits, balance = 20
   Second request reads balance: 20 < 80 → REJECT
```

The stored procedure also enforces:
- `CHECK (balance >= 0)` at the table level
- Status check: frozen wallets cannot send or receive
- Atomic operation: debit + credit + audit happen in one transaction or all roll back

## 7.7 Multi-Tab Security (sessionStorage)

`localStorage` is shared across all browser tabs on the same domain. If two
tabs are open — one logged in as Alice, one logged in as Bob — storing the
token in `localStorage` means Bob's login would overwrite Alice's session in
Tab 1. By using `sessionStorage`, each browser tab has its own completely
independent session.

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
All endpoints return a consistent JSON envelope:
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
| POST | /wallets | Yes | Create wallet `{ currency }` |
| GET | /wallets/:id | Yes | Get single wallet |
| PATCH | /wallets/:id/toggle | Yes | Freeze or unfreeze wallet |

### Transactions — /api/transactions

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /transactions | Yes | Transaction history (paginated) |
| POST | /transactions/send | Yes | Send money `{ fromWalletId, recipientEmail, amount }` |

### Exchange — /api/exchange

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /exchange/rates?from=USD&to=PKR | No | Get exchange rate |
| GET | /exchange/rates | No | Get all rates |
| POST | /exchange/convert | Yes | Exchange `{ fromWalletId, toWalletId, amount }` |

### Deposits — /api/deposits

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /deposits | Yes | Deposit `{ walletId, amount }` |
| GET | /deposits | Yes | Get deposit history |

### Withdrawals — /api/withdrawals

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /withdrawals | Yes | Withdraw `{ walletId, amount }` |
| GET | /withdrawals | Yes | Get withdrawal history |

### Users — /api/users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /users/profile | Yes | Get user profile |
| PUT | /users/profile | Yes | Update name/email |
| PUT | /users/change-password | Yes | Change password |

### Admin — /api/admin *(Admin role required)*

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /admin/users | Admin | All users with wallet count |
| GET | /admin/transactions | Admin | All transactions |
| GET | /admin/audit-log | Admin | Full audit trail |
| PATCH | /admin/wallets/:id/freeze | Admin | Freeze a wallet |
| PATCH | /admin/wallets/:id/unfreeze | Admin | Unfreeze a wallet |
| PATCH | /admin/users/:id/suspend | Admin | Suspend a user account |
| PATCH | /admin/users/:id/reactivate | Admin | Reactivate a user account |

## 8.5 Error Codes Used

| HTTP Code | Meaning | When Used |
|---|---|---|
| 200 | OK | Successful GET, PATCH |
| 201 | Created | Successful POST (new resource) |
| 400 | Bad Request | Business logic error (insufficient balance, etc.) |
| 401 | Unauthorized | Missing/invalid/expired token |
| 403 | Forbidden | Authenticated but wrong role |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate (email, currency wallet) |
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
| Landing | `/` | Marketing page with hero, features, FAQ, testimonials |
| Login | `/login` | Sign in form |
| Register | `/register` | Account creation form |

### Authenticated Pages (login required)
| Page | Route | Description |
|---|---|---|
| Dashboard | `/dashboard` | Balance overview, wallet cards, recent transactions |
| Wallets | `/wallets` | All wallets, deposit/withdraw/freeze controls |
| Send Money | `/send` | P2P transfer form |
| Exchange | `/exchange` | Currency conversion form with live rates |
| Transactions | `/transactions` | Full transaction history table |
| Profile | `/profile` | Edit name, email, change password |
| About Us | `/about` | Team showcase with developer photos |

### Admin Only
| Page | Route | Description |
|---|---|---|
| Admin Dashboard | `/admin` | User management, all transactions, audit log |

## 9.2 Route Guard System

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

The project uses **React Context** for global state rather than Redux.
This keeps the codebase smaller and easier to understand.

**AuthContext** is the only global state store. It holds:
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

All other state (wallet lists, transaction history, etc.) is **local to each
page component** using `useState` and `useEffect` — fetched fresh when the
page mounts.

## 9.4 API Integration Pattern

Every page follows the same data-fetching pattern:

```jsx
const [data, setData]     = useState([])
const [loading, setLoading] = useState(true)
const [error, setError]   = useState(null)

useEffect(() => {
  walletApi.getAll()
    .then(res => setData(res.data))
    .catch(err => setError(err.response?.data?.message || 'Failed to load'))
    .finally(() => setLoading(false))
}, [])

if (loading) return <PageLoader />
```

## 9.5 Design System

The entire UI is built on a custom Tailwind theme with these design tokens:

| Token | Value | Used For |
|---|---|---|
| `void` | #09090F | Page backgrounds |
| `card` (bg) | #111118 | Card and panel backgrounds |
| `gold` | #C9973A | Primary accent, buttons, highlights |
| `chalk` | #F5F0E8 | Primary text |
| `smoke` | #8A8278 | Secondary/muted text |
| `ember` | #6A6058 | Tertiary/placeholder text |

Custom CSS component classes defined in `index.css`:

| Class | Description |
|---|---|
| `.btn-gold` | Primary gold gradient button |
| `.btn-outline` | Ghost button with gold border |
| `.card` | Standard dark card container |
| `.input-field` | Form input with gold focus ring |
| `.select-field` | Dropdown with gold styling |
| `.badge-success` | Green status badge |
| `.badge-failed` | Red status badge |
| `.badge-pending` | Yellow status badge |
| `.gold-gradient` | Gold radial background fill |
| `.gold-text` | Gold text color with gradient |

---
---

# 10. KEY FEATURES (Detailed)

## 10.1 Multi-Currency Wallets

Users can hold up to 10 different currency wallets. Each wallet is an
independent row in the `wallets` table with its own balance. The system
enforces a one-wallet-per-currency rule (UNIQUE constraint on `user_id` +
`currency_type`).

**Supported Currencies:** PKR · USD · EUR · GBP · AED · SAR · JPY · CAD · AUD · CHF

When a wallet is **frozen**, it cannot send or receive funds. The stored
procedures check `status = 'active'` before proceeding with any money movement.

## 10.2 Peer-to-Peer Money Transfer

Users send money by entering the recipient's email address and choosing the
source wallet. The system:
1. Resolves the email to a user account
2. Finds the recipient's wallet in the same currency
3. Calls `transfer_money()` stored procedure
4. Returns the transaction record with both sender and receiver email

**Edge cases handled:**
- Cannot send to yourself
- Recipient doesn't exist → 404 with friendly message
- Recipient has no wallet in that currency → 400 with instructions
- Insufficient balance → 400 (enforced by stored procedure)

## 10.3 Currency Exchange

Users convert money between their own wallets. The rate is fetched from the
`exchange_rates` database table. The frontend shows a live rate banner that
refreshes on demand.

**Auto-wallet creation:** If the user doesn't have a wallet in the destination
currency, the Exchange page creates one automatically before executing the
conversion.

## 10.4 Deposits & Withdrawals

- **Deposit:** Instantly credits a wallet. No daily limit. Maximum single
  deposit: 1,000,000 units.
- **Withdrawal:** Checks balance before proceeding. Subject to fraud
  detection checks (rapid-fire + daily limit).

Both operations use stored procedures for atomic execution — if any step
fails, the entire operation rolls back and the balance remains unchanged.

## 10.5 Admin Dashboard

Accessible only to users with `role = 'admin'`. Provides:
- **Overview tab:** Platform statistics and recent activity
- **Users tab:** Full user list with Suspend/Reactivate controls
- **Transactions tab:** All transactions across all users

Every admin action (suspend, freeze, reactivate) is recorded in `audit_log`
with the admin's user_id, the target user/wallet, and the timestamp.

---
---

# 11. CHALLENGES & SOLUTIONS

## 11.1 Race Condition in Money Transfers

**Challenge:** If two requests arrive simultaneously, both could read the
same balance, both pass the balance check, and both deduct money — resulting
in a negative balance.

**Solution:** All balance reads and writes are performed exclusively inside
PostgreSQL stored procedures using `SELECT ... FOR UPDATE`. This acquires a
row lock so the second request must wait until the first one commits.

## 11.2 JWT Logout Problem

**Challenge:** JWTs are stateless — once issued they are valid until expiry.
Standard logout (just deleting the token on the client) doesn't actually
invalidate the token. Anyone who captured the token could still use it.

**Solution:** We store a SHA-256 hash of every token in `user_sessions`.
The `auth` middleware checks this table on every request. When the user
logs out, the session row is marked `is_active = false`. The token is
immediately invalid, even before its JWT expiry.

## 11.3 Multi-Tab Login Collision

**Challenge:** `localStorage` is shared across browser tabs on the same
domain. Opening two tabs and logging in as different users caused the second
login to overwrite the first tab's session.

**Solution:** Switched from `localStorage` to `sessionStorage` everywhere
(AuthContext, api.js interceptors). `sessionStorage` is tab-scoped — each
tab maintains its own independent session.

## 11.4 PowerShell bcrypt Hash Corruption

**Challenge:** When trying to insert the admin account's bcrypt hash via
PowerShell, the `$` characters in the hash string (`$2a$12$...`) were
interpreted by PowerShell as variable expansion, corrupting the hash.

**Solution:** Created `backend/scripts/resetAdmin.js` — a Node.js script
that generates the bcrypt hash and inserts it directly using the `pg`
library. Node.js has no special treatment of `$` characters in strings.

## 11.5 Missing Exchange Rate Pairs

**Challenge:** The initial exchange rate seed data was missing several SAR
combinations (SAR↔EUR, SAR↔GBP, SAR↔AED). The frontend showed a calculated
demo rate for these pairs, but the backend looked them up in the database and
returned 404 when any SAR pair was involved.

**Solution:** Added all missing bidirectional SAR pairs to both the
`schema.sql` seed data and the live database. Full coverage verified by
testing every possible currency combination in the UI.

## 11.6 Admin User Management Bug

**Challenge:** The Admin Dashboard "Suspend" button was calling
`adminApi.freezeWallet(userId)` — passing a user ID to an endpoint that
expects a wallet ID. This failed silently (the `.catch()` fallback returned
success) so the UI appeared to work but the database was never updated.

**Solution:** Added `adminApi.suspendUser()` and `adminApi.reactivateUser()`
functions that call the correct endpoints (`/admin/users/:id/suspend` and
`/admin/users/:id/reactivate`). Also added the `reactivateUser` endpoint to
the backend which was missing entirely.

## 11.7 User ID Field Inconsistency

**Challenge:** The `formatUser()` helper returned `id` (not `_id`), while
every other entity in the system uses `_id`. The Admin Dashboard looked for
`u._id` which was `undefined` when using real API data — breaking the
Suspend/Reactivate feature.

**Solution:** Modified `getAllUsers` in the admin controller to explicitly
include `_id: r.user_id` in the response, alongside `...formatUser(r)`.

---
---

# 12. TESTING & QUALITY

## 12.1 API Testing
All endpoints were manually tested using Postman covering:
- Happy path (valid inputs, expected success)
- Authentication failures (missing token, expired token, logged-out token)
- Validation failures (missing fields, wrong types, out-of-range values)
- Business logic failures (insufficient balance, duplicate currency, self-transfer)
- Fraud detection (rapid-fire limit, daily limit)

## 12.2 Frontend Build Verification
The production build was verified using `npm run build` (Vite).

**Build output:**
```
✓ 2257 modules transformed
dist/index.html         0.81 kB  │ gzip: 0.45 kB
dist/assets/index.css  50.31 kB  │ gzip: 10.13 kB
dist/assets/index.js  566.19 kB  │ gzip: 167.61 kB
✓ Built in 7.08s
```
Zero TypeScript/JSX compilation errors. Zero unused import warnings.

## 12.3 Database Constraint Testing
Verified all CHECK and UNIQUE constraints:
- Duplicate email registration rejected (409)
- Duplicate currency wallet rejected (409)
- Negative balance rejected by DB CHECK constraint
- Insufficient balance rejected by stored procedure exception

## 12.4 Known Limitations
| Limitation | Impact | Mitigation |
|---|---|---|
| In-memory fraud detection | Resets on server restart, not shared across multiple server instances | Acceptable for single-server academic project |
| Manual exchange rates | Rates don't update in real-time | Seeded with realistic current values |
| No automated test suite | Manual testing only | Covered by thorough manual Postman testing |
| Mock data fallbacks | Frontend shows demo data if backend is offline | Clearly mock data, appropriate for demo purposes |

---
---

# 13. FUTURE ENHANCEMENTS

If this project were to be extended into a production system, the following
improvements would be prioritized:

| Enhancement | Priority | Description |
|---|---|---|
| Real payment gateways | High | Integrate Stripe / PayPal for real card deposits |
| Live exchange rates | High | Connect to an exchange rate API (Open Exchange Rates, Fixer.io) |
| Email notifications | Medium | Send confirmation emails for transfers and deposits |
| Two-factor authentication | Medium | TOTP-based 2FA for login and large transfers |
| Redis session store | Medium | Move fraud detection state to Redis for multi-server deployments |
| Automated test suite | Medium | Jest + Supertest for API, React Testing Library for UI |
| WebSockets | Low | Real-time balance updates without page refresh |
| Mobile app | Low | React Native version sharing the same API |
| KYC verification | Low | Document upload and identity verification flow |
| Blockchain audit trail | Low | Hash-chain linking of transactions (each tx stores hash of previous tx) |

---
---

# 14. CONCLUSION

SafeLedger 2.0 successfully demonstrates the construction of a complete,
production-quality full-stack web application with a financial domain focus.

## What Was Achieved

**Technical:**
- A fully functional REST API with 25+ endpoints across 8 route groups
- A PostgreSQL database with 8 tables, 4 stored procedures, and complete
  referential integrity
- Six independent security layers protecting user funds and data
- ACID-compliant money operations that cannot produce negative balances even
  under concurrent load
- A React application with 10 pages, a custom design system, and full
  responsive support

**Process:**
- The project was organized into 25 JIRA tickets across 3 sprints
- Work was distributed across 4 team members by feature domain
- Bugs discovered during development were documented and fixed systematically

## Key Learning Outcomes

| Area | What Was Learned |
|---|---|
| Database design | NUMERIC vs FLOAT for money, UUID PKs, normalized schema, stored procedures |
| Security | bcrypt, JWT, session invalidation, input validation, row-level locking |
| Backend | RESTful design, middleware chaining, connection pooling, error handling |
| Frontend | React Context, route guards, Axios interceptors, sessionStorage isolation |
| Full-stack | The complete request lifecycle from user click to database and back |
| Team | JIRA sprint planning, feature ownership, code integration |

## Final Statement

The project proves that a small team of four developers, working with
modern open-source technologies and disciplined engineering practices,
can build a secure, feature-complete financial platform within an academic
timeframe. The architecture choices made here — stored procedures for money
movement, server-side session validation, and per-tab sessionStorage — are
the same patterns used by real financial institutions to protect user funds.

---

*SafeLedger 2.0 — Final Project Report*
*Prepared by: Naqi Afaq, Ibrahim Malhi, Haris Zafar, Ibrahim Gulzar*
*April 2026*

---