-- ============================================================
--  SafeLedger — Migration: Sessions, Deposits, Withdrawals
--  Run ONCE on an existing database:
--    psql -U postgres -d safeledger -f config/migrations.sql
-- ============================================================

-- ─────────────────────────────────────────────────────────────
--  1. user_sessions
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_sessions (
    session_id   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash   TEXT        NOT NULL,
    ip_address   INET,
    device_info  TEXT,
    is_active    BOOLEAN     NOT NULL DEFAULT true,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at   TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user   ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token  ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON user_sessions(is_active, expires_at);

-- ─────────────────────────────────────────────────────────────
--  2. deposits
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS deposits (
    deposit_id    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id     UUID          NOT NULL REFERENCES wallets(wallet_id) ON DELETE CASCADE,
    amount        NUMERIC(20,8) NOT NULL CHECK (amount > 0),
    method        VARCHAR(50)   NOT NULL DEFAULT 'manual',
    status        VARCHAR(20)   NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','completed','failed')),
    reference_id  VARCHAR(100),
    metadata      JSONB         NOT NULL DEFAULT '{}',
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    completed_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_deposits_wallet  ON deposits(wallet_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status  ON deposits(status);
CREATE INDEX IF NOT EXISTS idx_deposits_created ON deposits(created_at DESC);

-- ─────────────────────────────────────────────────────────────
--  3. withdrawals
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS withdrawals (
    withdrawal_id UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id     UUID          NOT NULL REFERENCES wallets(wallet_id) ON DELETE CASCADE,
    amount        NUMERIC(20,8) NOT NULL CHECK (amount > 0),
    method        VARCHAR(50)   NOT NULL DEFAULT 'manual',
    status        VARCHAR(20)   NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','completed','failed')),
    reference_id  VARCHAR(100),
    metadata      JSONB         NOT NULL DEFAULT '{}',
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    completed_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_wallet  ON withdrawals(wallet_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status  ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created ON withdrawals(created_at DESC);

-- ─────────────────────────────────────────────────────────────
--  4. Stored Procedure: process_deposit
--     Locks wallet → credits balance → records transaction →
--     marks deposit completed → writes audit log
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION process_deposit(
    p_deposit_id UUID,
    p_wallet_id  UUID,
    p_amount     NUMERIC(20,8),
    p_user_id    UUID
) RETURNS UUID LANGUAGE plpgsql AS $$
DECLARE
    v_txn_id   UUID;
    v_currency VARCHAR(10);
    v_status   VARCHAR(20);
BEGIN
    -- Acquire row lock
    SELECT currency_type, status
      INTO v_currency, v_status
      FROM wallets WHERE wallet_id = p_wallet_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet not found';
    END IF;

    IF v_status <> 'active' THEN
        RAISE EXCEPTION 'Wallet is not active (status: %)', v_status;
    END IF;

    -- Credit balance
    UPDATE wallets SET balance = balance + p_amount WHERE wallet_id = p_wallet_id;

    -- Record in transactions
    INSERT INTO transactions (to_wallet_id, amount, transaction_type, status, metadata)
    VALUES (
        p_wallet_id,
        p_amount,
        'deposit',
        'success',
        jsonb_build_object('deposit_id', p_deposit_id, 'currency', v_currency)
    )
    RETURNING transaction_id INTO v_txn_id;

    -- Mark deposit completed
    UPDATE deposits
       SET status = 'completed', completed_at = NOW()
     WHERE deposit_id = p_deposit_id;

    -- Audit trail
    INSERT INTO audit_log (transaction_id, user_id, action, details)
    VALUES (
        v_txn_id,
        p_user_id,
        'DEPOSIT_SUCCESS',
        jsonb_build_object(
            'wallet_id', p_wallet_id,
            'amount',    p_amount,
            'currency',  v_currency
        )
    );

    RETURN v_txn_id;
END;
$$;

-- ─────────────────────────────────────────────────────────────
--  5. Stored Procedure: process_withdrawal
--     Locks wallet → validates balance → debits balance →
--     records transaction → marks withdrawal completed → audit
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION process_withdrawal(
    p_withdrawal_id UUID,
    p_wallet_id     UUID,
    p_amount        NUMERIC(20,8),
    p_user_id       UUID
) RETURNS UUID LANGUAGE plpgsql AS $$
DECLARE
    v_txn_id   UUID;
    v_currency VARCHAR(10);
    v_status   VARCHAR(20);
    v_balance  NUMERIC(20,8);
BEGIN
    -- Acquire row lock
    SELECT currency_type, status, balance
      INTO v_currency, v_status, v_balance
      FROM wallets WHERE wallet_id = p_wallet_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet not found';
    END IF;

    IF v_status <> 'active' THEN
        RAISE EXCEPTION 'Wallet is not active (status: %)', v_status;
    END IF;

    IF v_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance: available %, required %', v_balance, p_amount;
    END IF;

    -- Debit balance (negative-balance trigger fires as safety net)
    UPDATE wallets SET balance = balance - p_amount WHERE wallet_id = p_wallet_id;

    -- Record in transactions
    INSERT INTO transactions (from_wallet_id, amount, transaction_type, status, metadata)
    VALUES (
        p_wallet_id,
        p_amount,
        'withdrawal',
        'success',
        jsonb_build_object('withdrawal_id', p_withdrawal_id, 'currency', v_currency)
    )
    RETURNING transaction_id INTO v_txn_id;

    -- Mark withdrawal completed
    UPDATE withdrawals
       SET status = 'completed', completed_at = NOW()
     WHERE withdrawal_id = p_withdrawal_id;

    -- Audit trail
    INSERT INTO audit_log (transaction_id, user_id, action, details)
    VALUES (
        v_txn_id,
        p_user_id,
        'WITHDRAWAL_SUCCESS',
        jsonb_build_object(
            'wallet_id', p_wallet_id,
            'amount',    p_amount,
            'currency',  v_currency
        )
    );

    RETURN v_txn_id;
END;
$$;