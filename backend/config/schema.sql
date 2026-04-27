-- ============================================================
--  SafeLedger — PostgreSQL Schema
--  Run:  psql -U postgres -d safeledger -f config/schema.sql
-- ============================================================

-- Requires pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─────────────────────────────────────────────────────────────
--  TABLES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    user_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    phone         VARCHAR(30),
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'user'
                  CHECK (role IN ('user','admin')),
    is_active     BOOLEAN      NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallets (
    wallet_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID         NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    currency_type VARCHAR(10)  NOT NULL,
    balance       NUMERIC(20,8) NOT NULL DEFAULT 0
                  CHECK (balance >= 0),              -- enforced by DB + trigger
    status        VARCHAR(20)  NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','frozen','closed')),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, currency_type)
);

CREATE TABLE IF NOT EXISTS transactions (
    transaction_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_wallet_id   UUID REFERENCES wallets(wallet_id),
    to_wallet_id     UUID REFERENCES wallets(wallet_id),
    amount           NUMERIC(20,8) NOT NULL
                     CHECK (amount > 0),
    transaction_type VARCHAR(20)  NOT NULL
                     CHECK (transaction_type IN ('transfer','deposit','withdrawal','exchange')),
    status           VARCHAR(20)  NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','success','failed')),
    metadata         JSONB        NOT NULL DEFAULT '{}',
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exchange_rates (
    rate_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_currency VARCHAR(10)   NOT NULL,
    to_currency   VARCHAR(10)   NOT NULL,
    rate          NUMERIC(20,8) NOT NULL CHECK (rate > 0),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    UNIQUE (from_currency, to_currency)
);

CREATE TABLE IF NOT EXISTS audit_log (
    log_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID        REFERENCES transactions(transaction_id),
    user_id        UUID        REFERENCES users(user_id),
    action         VARCHAR(100) NOT NULL,
    details        JSONB        NOT NULL DEFAULT '{}',
    ip_address     INET,
    timestamp      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
--  INDEXES
-- ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_wallets_user       ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_txn_from_wallet    ON transactions(from_wallet_id);
CREATE INDEX IF NOT EXISTS idx_txn_to_wallet      ON transactions(to_wallet_id);
CREATE INDEX IF NOT EXISTS idx_txn_created_at     ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_txn_status         ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_audit_txn          ON audit_log(transaction_id);
CREATE INDEX IF NOT EXISTS idx_audit_user         ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp    ON audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_rates_pair         ON exchange_rates(from_currency, to_currency);

-- ─────────────────────────────────────────────────────────────
--  TRIGGER: prevent negative balance (failsafe on top of CHECK)
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_prevent_negative_balance()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.balance < 0 THEN
        RAISE EXCEPTION
            'NEGATIVE_BALANCE: wallet % cannot have balance %',
            NEW.wallet_id, NEW.balance;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_negative_balance ON wallets;
CREATE TRIGGER trg_prevent_negative_balance
    BEFORE UPDATE OF balance ON wallets
    FOR EACH ROW EXECUTE FUNCTION fn_prevent_negative_balance();

-- ─────────────────────────────────────────────────────────────
--  TRIGGER: auto-audit wallet status changes
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_log_wallet_status_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO audit_log (user_id, action, details)
        VALUES (
            NEW.user_id,
            'WALLET_STATUS_CHANGED',
            jsonb_build_object(
                'wallet_id',   NEW.wallet_id,
                'currency',    NEW.currency_type,
                'old_status',  OLD.status,
                'new_status',  NEW.status
            )
        );
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_wallet_status_change ON wallets;
CREATE TRIGGER trg_wallet_status_change
    AFTER UPDATE OF status ON wallets
    FOR EACH ROW EXECUTE FUNCTION fn_log_wallet_status_change();

-- ─────────────────────────────────────────────────────────────
--  TRIGGER: auto-audit failed transactions
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_log_transaction_failure()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF OLD.status = 'pending' AND NEW.status = 'failed' THEN
        INSERT INTO audit_log (transaction_id, action, details)
        VALUES (
            NEW.transaction_id,
            'TRANSACTION_FAILED',
            jsonb_build_object(
                'type',   NEW.transaction_type,
                'amount', NEW.amount
            )
        );
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_transaction_failure ON transactions;
CREATE TRIGGER trg_transaction_failure
    AFTER UPDATE OF status ON transactions
    FOR EACH ROW EXECUTE FUNCTION fn_log_transaction_failure();

-- ─────────────────────────────────────────────────────────────
--  STORED PROCEDURE: transfer_money
--  Handles the full ACID lifecycle:
--    BEGIN → lock rows → validate → deduct → credit →
--    mark success → audit → COMMIT / ROLLBACK on error
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION transfer_money(
    p_from_wallet_id  UUID,
    p_to_wallet_id    UUID,
    p_amount          NUMERIC(20,8),
    p_initiated_by    UUID
) RETURNS UUID LANGUAGE plpgsql AS $$
DECLARE
    v_txn_id        UUID;
    v_from_balance  NUMERIC(20,8);
    v_from_status   VARCHAR(20);
    v_to_status     VARCHAR(20);
    v_from_currency VARCHAR(10);
    v_to_currency   VARCHAR(10);
BEGIN
    -- Acquire row locks in consistent order to prevent deadlocks
    IF p_from_wallet_id < p_to_wallet_id THEN
        SELECT balance, status, currency_type
          INTO v_from_balance, v_from_status, v_from_currency
          FROM wallets WHERE wallet_id = p_from_wallet_id FOR UPDATE;

        SELECT status, currency_type
          INTO v_to_status, v_to_currency
          FROM wallets WHERE wallet_id = p_to_wallet_id FOR UPDATE;
    ELSE
        SELECT status, currency_type
          INTO v_to_status, v_to_currency
          FROM wallets WHERE wallet_id = p_to_wallet_id FOR UPDATE;

        SELECT balance, status, currency_type
          INTO v_from_balance, v_from_status, v_from_currency
          FROM wallets WHERE wallet_id = p_from_wallet_id FOR UPDATE;
    END IF;

    -- Validations
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet not found';
    END IF;

    IF p_from_wallet_id = p_to_wallet_id THEN
        RAISE EXCEPTION 'Cannot transfer to the same wallet';
    END IF;

    IF v_from_status <> 'active' THEN
        RAISE EXCEPTION 'Source wallet is not active (status: %)', v_from_status;
    END IF;

    IF v_to_status <> 'active' THEN
        RAISE EXCEPTION 'Destination wallet is not active (status: %)', v_to_status;
    END IF;

    IF v_from_currency <> v_to_currency THEN
        RAISE EXCEPTION 'Currency mismatch — use /exchange for cross-currency transfers';
    END IF;

    IF v_from_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance: available %, required %', v_from_balance, p_amount;
    END IF;

    -- Insert pending transaction record
    INSERT INTO transactions (from_wallet_id, to_wallet_id, amount, transaction_type, status)
    VALUES (p_from_wallet_id, p_to_wallet_id, p_amount, 'transfer', 'pending')
    RETURNING transaction_id INTO v_txn_id;

    -- Execute balance changes (negative-balance trigger fires here as safety net)
    UPDATE wallets SET balance = balance - p_amount WHERE wallet_id = p_from_wallet_id;
    UPDATE wallets SET balance = balance + p_amount WHERE wallet_id = p_to_wallet_id;

    -- Mark success
    UPDATE transactions SET status = 'success' WHERE transaction_id = v_txn_id;

    -- Audit trail
    INSERT INTO audit_log (transaction_id, user_id, action, details)
    VALUES (
        v_txn_id,
        p_initiated_by,
        'TRANSFER_SUCCESS',
        jsonb_build_object(
            'from_wallet', p_from_wallet_id,
            'to_wallet',   p_to_wallet_id,
            'currency',    v_from_currency,
            'amount',      p_amount
        )
    );

    RETURN v_txn_id;
END;
$$;

-- ─────────────────────────────────────────────────────────────
--  STORED PROCEDURE: exchange_currency
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION exchange_currency(
    p_from_wallet_id  UUID,
    p_to_wallet_id    UUID,
    p_amount          NUMERIC(20,8),
    p_exchange_rate   NUMERIC(20,8),
    p_initiated_by    UUID
) RETURNS UUID LANGUAGE plpgsql AS $$
DECLARE
    v_txn_id          UUID;
    v_converted       NUMERIC(20,8);
    v_from_balance    NUMERIC(20,8);
    v_from_status     VARCHAR(20);
    v_to_status       VARCHAR(20);
    v_from_currency   VARCHAR(10);
    v_to_currency     VARCHAR(10);
BEGIN
    v_converted := ROUND(p_amount * p_exchange_rate, 8);

    -- Acquire row locks
    IF p_from_wallet_id < p_to_wallet_id THEN
        SELECT balance, status, currency_type
          INTO v_from_balance, v_from_status, v_from_currency
          FROM wallets WHERE wallet_id = p_from_wallet_id FOR UPDATE;

        SELECT status, currency_type
          INTO v_to_status, v_to_currency
          FROM wallets WHERE wallet_id = p_to_wallet_id FOR UPDATE;
    ELSE
        SELECT status, currency_type
          INTO v_to_status, v_to_currency
          FROM wallets WHERE wallet_id = p_to_wallet_id FOR UPDATE;

        SELECT balance, status, currency_type
          INTO v_from_balance, v_from_status, v_from_currency
          FROM wallets WHERE wallet_id = p_from_wallet_id FOR UPDATE;
    END IF;

    IF v_from_status <> 'active' THEN
        RAISE EXCEPTION 'Source wallet is not active';
    END IF;

    IF v_to_status <> 'active' THEN
        RAISE EXCEPTION 'Destination wallet is not active';
    END IF;

    IF v_from_currency = v_to_currency THEN
        RAISE EXCEPTION 'Source and destination currencies must be different';
    END IF;

    IF v_from_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance: available %, required %', v_from_balance, p_amount;
    END IF;

    -- Pending transaction
    INSERT INTO transactions (from_wallet_id, to_wallet_id, amount, transaction_type, status, metadata)
    VALUES (
        p_from_wallet_id,
        p_to_wallet_id,
        p_amount,
        'exchange',
        'pending',
        jsonb_build_object(
            'exchange_rate',      p_exchange_rate,
            'converted_amount',   v_converted,
            'from_currency',      v_from_currency,
            'to_currency',        v_to_currency
        )
    )
    RETURNING transaction_id INTO v_txn_id;

    -- Execute exchange
    UPDATE wallets SET balance = balance - p_amount     WHERE wallet_id = p_from_wallet_id;
    UPDATE wallets SET balance = balance + v_converted  WHERE wallet_id = p_to_wallet_id;

    -- Mark success
    UPDATE transactions SET status = 'success' WHERE transaction_id = v_txn_id;

    -- Audit
    INSERT INTO audit_log (transaction_id, user_id, action, details)
    VALUES (
        v_txn_id,
        p_initiated_by,
        'EXCHANGE_SUCCESS',
        jsonb_build_object(
            'from_wallet',    p_from_wallet_id,
            'to_wallet',      p_to_wallet_id,
            'from_currency',  v_from_currency,
            'to_currency',    v_to_currency,
            'amount',         p_amount,
            'rate',           p_exchange_rate,
            'converted',      v_converted
        )
    );

    RETURN v_txn_id;
END;
$$;

-- ─────────────────────────────────────────────────────────────
--  SEED: exchange rates (USD base)
-- ─────────────────────────────────────────────────────────────

INSERT INTO exchange_rates (from_currency, to_currency, rate) VALUES
    -- From USD
    ('USD','PKR', 278.50), ('USD','EUR', 0.92000), ('USD','GBP', 0.79000),
    ('USD','AED', 3.67000), ('USD','SAR', 3.75000), ('USD','JPY', 149.500),
    ('USD','CAD', 1.36000), ('USD','AUD', 1.53000), ('USD','CHF', 0.89000),
    ('USD','SGD', 1.34000), ('USD','HKD', 7.82000),
    -- From PKR
    ('PKR','USD', 0.003590), ('PKR','EUR', 0.003306), ('PKR','GBP', 0.002837),
    ('PKR','AED', 0.013177), ('PKR','SAR', 0.013459),
    -- From EUR
    ('EUR','USD', 1.08700), ('EUR','PKR', 302.720), ('EUR','GBP', 0.85870),
    ('EUR','AED', 3.98890), ('EUR','SAR', 4.07625), ('EUR','CHF', 0.96700),
    -- From GBP
    ('GBP','USD', 1.26580), ('GBP','PKR', 352.530), ('GBP','EUR', 1.16450),
    ('GBP','AED', 4.64450), ('GBP','SAR', 4.74675),
    -- From AED
    ('AED','USD', 0.27230), ('AED','PKR', 75.8800), ('AED','EUR', 0.25070),
    ('AED','GBP', 0.21530), ('AED','SAR', 1.02100),
    -- From SAR
    ('SAR','USD', 0.26670), ('SAR','PKR', 74.2700),
    ('SAR','EUR', 0.24540), ('SAR','GBP', 0.21070), ('SAR','AED', 0.97800),
    -- From JPY
    ('JPY','USD', 0.00669),
    -- From CAD
    ('CAD','USD', 0.73530),
    -- From AUD
    ('AUD','USD', 0.65360),
    -- From CHF
    ('CHF','USD', 1.12360), ('CHF','EUR', 1.03410),
    -- From SGD
    ('SGD','USD', 0.74630),
    -- From HKD
    ('HKD','USD', 0.12790)
ON CONFLICT (from_currency, to_currency) DO UPDATE SET rate = EXCLUDED.rate, updated_at = NOW();

-- ─────────────────────────────────────────────────────────────
--  SEED: default admin user
--  Password: Admin@SafeLedger2024  (bcrypt hash — rounds 12)
--  Change this immediately in production!
-- ─────────────────────────────────────────────────────────────

INSERT INTO users (name, email, password_hash, role)
VALUES (
    'SafeLedger Admin',
    'admin@safeledger.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeAHjUxfpqxbFGbNW',
    'admin'
)
ON CONFLICT (email) DO NOTHING;
