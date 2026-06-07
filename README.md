# SafeLedger 2.0

**SafeLedger** is a full-stack digital wallet and peer-to-peer money transfer platform built for the modern web. It supports multi-currency wallets, real-time currency exchange, deposits, withdrawals, and a comprehensive admin dashboard — all wrapped in a sleek dark-gold interface with complete mobile responsiveness.

> Live Demo: [safe-ledger2-0.vercel.app](https://safe-ledger2-0.vercel.app) &nbsp;|&nbsp; API: [safeledger-api.onrender.com](https://safeledger-api.onrender.com/api/health)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Security](#security)

---

## Features

### User-Facing
- **Multi-Currency Wallets** — Create and manage wallets in USD, EUR, GBP, PKR, AED, SAR, JPY, CAD, AUD, CHF, SGD, and HKD
- **Peer-to-Peer Transfers** — Send money instantly to any registered user by email
- **Currency Exchange** — Convert between supported currencies at live-approximated rates
- **Deposits & Withdrawals** — Add funds or withdraw to external accounts
- **Transaction History** — Full paginated log of all activity with type, status, and timestamp
- **Responsive Design** — Fully optimized for mobile, tablet, and desktop

### Admin-Facing
- **User Management** — View, activate, deactivate, and manage all registered users
- **Transaction Oversight** — Monitor all platform transactions across users
- **Platform Analytics** — Key metrics including total users, wallets, volume, and activity

### Security & Compliance
- **JWT Authentication** — Stateless token-based auth with configurable expiry
- **Bcrypt Password Hashing** — Industry-standard password storage (12 rounds)
- **Fraud Detection** — Two-layer protection:
  - Rapid-fire rate limiting (max 5 transactions/minute per user via sliding window)
  - Daily transfer cap ($10,000 USD equivalent with cross-currency conversion)
- **Helmet.js** — Secure HTTP headers on all responses
- **CORS Policy** — Strict origin allowlist in production
- **Global Rate Limiting** — 200 requests / 15 minutes per IP; 10 auth attempts / 15 minutes

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI library |
| Vite | 5 | Build tool & dev server |
| Tailwind CSS | 3 | Utility-first styling |
| React Router | v6 | Client-side routing |
| Axios | 1.6 | HTTP client with interceptors |
| Framer Motion | 12 | Animations |
| Lucide React | latest | Icon library |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 4 | Web framework |
| PostgreSQL | 15 | Relational database |
| `pg` | 8 | PostgreSQL client |
| bcryptjs | 2 | Password hashing |
| jsonwebtoken | 9 | JWT auth |
| express-validator | 7 | Input validation |
| helmet | 7 | Security headers |
| express-rate-limit | 7 | Rate limiting |

### Infrastructure
| Service | Purpose |
|---|---|
| Neon | Serverless PostgreSQL (cloud database) |
| Render | Backend hosting (Node.js web service) |
| Vercel | Frontend hosting (static + CDN) |
| GitHub | Source control & CI/CD trigger |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client (Browser)                  │
│           React 18 + Vite · Tailwind CSS             │
│                  Vercel (CDN/Edge)                   │
└────────────────────────┬────────────────────────────┘
                         │ HTTPS (REST API)
                         │ Authorization: Bearer <jwt>
┌────────────────────────▼────────────────────────────┐
│              Express REST API (Node.js)              │
│                 Render Web Service                   │
│                                                      │
│   /api/auth        /api/wallets    /api/transactions │
│   /api/deposits    /api/withdrawals /api/exchange    │
│   /api/users       /api/admin                        │
│                                                      │
│   Middleware: helmet · cors · rate-limit · JWT auth  │
│   Fraud:      rapid-fire window · daily USD cap      │
└────────────────────────┬────────────────────────────┘
                         │ TLS (SSL)
┌────────────────────────▼────────────────────────────┐
│              PostgreSQL 15 (Neon Serverless)          │
│                                                      │
│  Tables: users · wallets · transactions              │
│          deposits · withdrawals · audit_log          │
│          user_sessions                               │
│  Procedures: process_deposit · process_withdrawal   │
│  Triggers:   wallet status audit log                 │
└─────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 15 (local) **or** a [Neon](https://neon.tech) account (cloud)

### 1. Clone the repository

```bash
git clone https://github.com/naqi005/SafeLedger2.0.git
cd SafeLedger2.0
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Configure environment variables

```bash
# Frontend
cp .env.example .env

# Backend
cp backend/.env.example backend/.env
```

Edit both `.env` files with your values (see [Environment Variables](#environment-variables)).

### 5. Set up the database

```bash
# Using psql locally:
psql -U postgres -d safeledger -f backend/config/schema.sql

# Or paste the contents of backend/config/schema.sql into your Neon SQL editor
```

This creates all tables, stored procedures, triggers, and a default admin account.

### 6. Run the development servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

**Default admin credentials:**
```
Email:    admin@safeledger.com
Password: Admin@1234
```
> Change the admin password immediately after first login.

---

## Environment Variables

### Frontend (`/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

### Backend (`/backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_URL` | Neon/PostgreSQL connection string (takes priority) | `postgresql://user:pass@host/db?sslmode=require` |
| `DB_HOST` | Local DB host (fallback) | `localhost` |
| `DB_PORT` | Local DB port (fallback) | `5432` |
| `DB_NAME` | Local DB name (fallback) | `safeledger` |
| `DB_USER` | Local DB user (fallback) | `postgres` |
| `DB_PASSWORD` | Local DB password (fallback) | `yourpassword` |
| `JWT_SECRET` | Secret key for signing JWTs | `long_random_string` |
| `JWT_EXPIRES_IN` | Token expiry duration | `7d` |
| `BCRYPT_ROUNDS` | Password hash cost factor | `12` |
| `MAX_TRANSACTIONS_PER_MINUTE` | Fraud: per-user rate cap | `5` |
| `DAILY_TRANSFER_LIMIT_USD` | Fraud: daily USD cap | `10000` |
| `FRONTEND_URL` | Allowed CORS origin in production | `https://yourapp.vercel.app` |

---

## Database Setup

The schema is located at [`backend/config/schema.sql`](backend/config/schema.sql).

### Tables

| Table | Description |
|---|---|
| `users` | Registered user accounts with role (`user` / `admin`) |
| `user_sessions` | Active JWT session records with IP and device info |
| `wallets` | Per-user, per-currency wallets with balance and status |
| `transactions` | Immutable ledger of all monetary movements |
| `deposits` | Inbound fund requests linked to wallets |
| `withdrawals` | Outbound fund requests linked to wallets |
| `audit_log` | Append-only log of sensitive actions |

### Stored Procedures

| Procedure | Description |
|---|---|
| `process_deposit(deposit_id, wallet_id, amount, user_id)` | Atomically credits wallet, records transaction, and logs audit entry |
| `process_withdrawal(withdrawal_id, wallet_id, amount, user_id)` | Atomically debits wallet with balance check, records transaction, and logs audit entry |

---

## API Reference

All endpoints are prefixed with `/api`. Protected routes require:
```
Authorization: Bearer <token>
```

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Register a new user | Public |
| POST | `/auth/login` | Login and receive JWT | Public |
| POST | `/auth/logout` | Invalidate session | Required |

### Wallets

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/wallets` | List all wallets for current user | Required |
| POST | `/wallets` | Create a new currency wallet | Required |
| GET | `/wallets/:id` | Get single wallet details | Required |

### Transactions

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/transactions` | Get transaction history | Required |
| POST | `/transactions/send` | Send money to another user | Required |

### Deposits & Withdrawals

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/deposits` | Initiate a deposit | Required |
| GET | `/deposits` | List user deposits | Required |
| POST | `/withdrawals` | Initiate a withdrawal | Required |
| GET | `/withdrawals` | List user withdrawals | Required |

### Exchange

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/exchange/rates` | Get current conversion rates | Required |
| POST | `/exchange` | Execute a currency exchange | Required |

### Admin

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/admin/users` | List all users | Admin |
| PATCH | `/admin/users/:id/status` | Activate / deactivate a user | Admin |
| GET | `/admin/transactions` | View all platform transactions | Admin |
| GET | `/admin/stats` | Platform-wide statistics | Admin |

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Service and uptime check |

---

## Deployment

### Backend — Render

1. Connect your GitHub repository on [render.com](https://render.com)
2. Create a **Web Service** with:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
3. Add all backend environment variables in the **Environment** tab
4. Deploy

### Frontend — Vercel

1. Import your GitHub repository on [vercel.com](https://vercel.com)
2. Framework preset: **Vite** | Root Directory: `/`
3. Add environment variable: `VITE_API_URL=https://<your-render-url>/api`
4. Deploy

### Database — Neon

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string
3. Run `backend/config/schema.sql` in the Neon SQL editor
4. Set `DATABASE_URL` in Render environment variables

---

## Security

- Passwords are hashed with **bcrypt** (cost factor 12) — never stored in plaintext
- JWTs are signed with a secret key and expire after 7 days
- All database queries use **parameterized statements** — SQL injection is not possible
- **Helmet.js** sets `Content-Security-Policy`, `X-Frame-Options`, `HSTS`, and other headers
- Rate limiting prevents brute-force attacks on auth endpoints
- CORS is locked to the configured `FRONTEND_URL` in production
- Fraud detection runs on every outbound transaction

---

## Project Structure

```
SafeLedger2.0/
├── src/                        # React frontend
│   ├── App.jsx                 # Router + auth guards
│   ├── context/AuthContext.jsx
│   ├── services/api.js         # Axios instance + API helpers
│   ├── layouts/AppLayout.jsx   # Sidebar + Topbar shell
│   ├── components/             # Reusable UI components
│   └── pages/                  # Route-level page components
├── backend/                    # Node.js/Express backend
│   ├── server.js               # App entry point
│   ├── config/
│   │   ├── database.js         # PostgreSQL pool
│   │   └── schema.sql          # Full DB schema + seed
│   ├── controllers/            # Route handler logic
│   ├── middlewares/            # Auth, fraud detection
│   └── routes/                 # Express routers
├── vercel.json                 # Vercel deployment config
└── README.md
```

---

## License

This project is licensed under the MIT License.