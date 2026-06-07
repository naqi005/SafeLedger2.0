-- ============================================================
--  SafeLedger — Full PostgreSQL Schema
--  Run this once on your Neon database to create all tables,
--  stored procedures, and triggers.
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1. USERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  user_id       UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  phone         VARCHAR(30),
  password_hash TEXT          NOT NULL,
  role          VARCHAR(20)   NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  is_active     BOOLEAN       NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── 2. USER SESSIONS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_sessions (
  session_id  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  token_hash  TEXT        NOT NULL UNIQUE,
  ip_address  INET,
  device_info VARCHAR(255),
  expires_at  TIMESTAMPTZ NOT NULL,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sessions_user  ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token_hash);

-- ── 3. WALLETS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallets (
  wallet_id     UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID           NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  currency_type VARCHAR(10)    NOT NULL,
  balance       NUMERIC(18,4)  NOT NULL DEFAULT 0 CHECK (balance >= 0),
  status        VARCHAR(20)    NOT NULL DEFAULT 'active' CHECK (status IN ('active','frozen','closed')),
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, currency_type)
);
CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);

-- ── 4. TRANSACTIONS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  transaction_id   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  from_wallet_id   UUID          REFERENCES wallets(wallet_id) ON DELETE SET NULL,
  to_wallet_id     UUID          REFERENCES wallets(wallet_id) ON DELETE SET NULL,
  transaction_type VARCHAR(30)   NOT NULL CHECK (transaction_type IN ('send','receive','exchange','add','withdraw')),
  amount           NUMERIC(18,4) NOT NULL CHECK (amount > 0),
  status           VARCHAR(20)   NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','failed')),
  metadata         JSONB         NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_txn_from ON transactions(from_wallet_id);
CREATE INDEX IF NOT EXISTS idx_txn_to   ON transactions(to_wallet_id);
CREATE INDEX IF NOT EXISTS idx_txn_date ON transactions(created_at DESC);

-- ── 5. DEPOSITS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deposits (
  deposit_id    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id     UUID          NOT NULL REFERENCES wallets(wallet_id) ON DELETE CASCADE,
  amount        NUMERIC(18,4) NOT NULL CHECK (amount > 0),
  method        VARCHAR(30)   NOT NULL DEFAULT 'manual',
  status        VARCHAR(20)   NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed')),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_deposits_wallet ON deposits(wallet_id);

-- ── 6. WITHDRAWALS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS withdrawals (
  withdrawal_id UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id     UUID          NOT NULL REFERENCES wallets(wallet_id) ON DELETE CASCADE,
  amount        NUMERIC(18,4) NOT NULL CHECK (amount > 0),
  method        VARCHAR(30)   NOT NULL DEFAULT 'manual',
  status        VARCHAR(20)   NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed')),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_withdrawals_wallet ON withdrawals(wallet_id);

-- ── 7. AUDIT LOG ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  log_id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        REFERENCES users(user_id) ON DELETE SET NULL,
  transaction_id UUID        REFERENCES transactions(transaction_id) ON DELETE SET NULL,
  action         VARCHAR(60) NOT NULL,
  details        JSONB       NOT NULL DEFAULT '{}',
  ip_address     INET,
  timestamp      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_user      ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp DESC);

-- ============================================================
--  STORED PROCEDURES
-- ============================================================

-- ── process_deposit ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION process_deposit(
  p_deposit_id  UUID,
  p_wallet_id   UUID,
  p_amount      NUMERIC,
  p_user_id     UUID
) RETURNS UUID AS $$
DECLARE
  v_txn_id  UUID;
  v_status  TEXT;
BEGIN
  SELECT status INTO v_status
    FROM wallets WHERE wallet_id = p_wallet_id FOR UPDATE;

  IF v_status <> 'active' THEN
    RAISE EXCEPTION 'Wallet is not active';
  END IF;

  UPDATE wallets SET balance = balance + p_amount WHERE wallet_id = p_wallet_id;

  INSERT INTO transactions (to_wallet_id, transaction_type, amount, status, metadata)
  VALUES (p_wallet_id, 'add', p_amount, 'success',
          jsonb_build_object('deposit_id', p_deposit_id))
  RETURNING transaction_id INTO v_txn_id;

  UPDATE deposits
     SET status = 'completed', completed_at = NOW()
   WHERE deposit_id = p_deposit_id;

  INSERT INTO audit_log (user_id, transaction_id, action, details)
  VALUES (p_user_id, v_txn_id, 'DEPOSIT_COMPLETED',
          jsonb_build_object('amount', p_amount, 'wallet_id', p_wallet_id));

  RETURN v_txn_id;
END;
$$ LANGUAGE plpgsql;

-- ── process_withdrawal ───────────────────────────────────────
CREATE OR REPLACE FUNCTION process_withdrawal(
  p_withdrawal_id UUID,
  p_wallet_id     UUID,
  p_amount        NUMERIC,
  p_user_id       UUID
) RETURNS UUID AS $$
DECLARE
  v_txn_id  UUID;
  v_status  TEXT;
  v_balance NUMERIC;
BEGIN
  SELECT status, balance INTO v_status, v_balance
    FROM wallets WHERE wallet_id = p_wallet_id FOR UPDATE;

  IF v_status <> 'active' THEN
    RAISE EXCEPTION 'Wallet is not active';
  END IF;

  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  UPDATE wallets SET balance = balance - p_amount WHERE wallet_id = p_wallet_id;

  INSERT INTO transactions (from_wallet_id, transaction_type, amount, status, metadata)
  VALUES (p_wallet_id, 'withdraw', p_amount, 'success',
          jsonb_build_object('withdrawal_id', p_withdrawal_id))
  RETURNING transaction_id INTO v_txn_id;

  UPDATE withdrawals
     SET status = 'completed', completed_at = NOW()
   WHERE withdrawal_id = p_withdrawal_id;

  INSERT INTO audit_log (user_id, transaction_id, action, details)
  VALUES (p_user_id, v_txn_id, 'WITHDRAWAL_COMPLETED',
          jsonb_build_object('amount', p_amount, 'wallet_id', p_wallet_id));

  RETURN v_txn_id;
END;
$$ LANGUAGE plpgsql;

-- ── Trigger: log wallet status changes ───────────────────────
CREATE OR REPLACE FUNCTION trg_wallet_status_change_fn() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status <> OLD.status THEN
    INSERT INTO audit_log (user_id, action, details)
    VALUES (NEW.user_id, 'WALLET_STATUS_CHANGED',
            jsonb_build_object('wallet_id', NEW.wallet_id,
                               'from', OLD.status, 'to', NEW.status));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_wallet_status_change ON wallets;
CREATE TRIGGER trg_wallet_status_change
  AFTER UPDATE OF status ON wallets
  FOR EACH ROW EXECUTE FUNCTION trg_wallet_status_change_fn();

-- ============================================================
--  SEED: default admin account
--  Email   : admin@safeledger.com
--  Password: Admin@1234   ← change this after first login!
-- ============================================================
INSERT INTO users (name, email, password_hash, role)
VALUES (
  'SafeLedger Admin',
  'admin@safeledger.com',
  '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
  'admin'
) ON CONFLICT (email) DO NOTHING;