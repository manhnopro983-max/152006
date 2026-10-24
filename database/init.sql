-- ============================================================
-- Expense Tracker — Database Schema
-- Loaded automatically by PostgreSQL on first container start
-- ============================================================

-- Categories table
CREATE TABLE categories (
    id          SERIAL       PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    type        VARCHAR(7)   NOT NULL CHECK (type IN ('income', 'expense')),
    color       VARCHAR(7)   NOT NULL DEFAULT '#6366f1',
    icon        VARCHAR(10)  DEFAULT '📁',
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
    id           SERIAL        PRIMARY KEY,
    category_id  INTEGER       NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    type         VARCHAR(7)    NOT NULL CHECK (type IN ('income', 'expense')),
    amount       NUMERIC(15,0) NOT NULL CHECK (amount > 0),
    occurred_on  DATE          NOT NULL,
    note         VARCHAR(500),
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_transactions_occurred_on  ON transactions(occurred_on);
CREATE INDEX idx_transactions_type         ON transactions(type);
CREATE INDEX idx_transactions_category_id  ON transactions(category_id);
CREATE INDEX idx_transactions_type_date    ON transactions(type, occurred_on);

-- Trigger: auto-update updated_at on transaction changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Trigger: ensure transaction type matches category type
CREATE OR REPLACE FUNCTION check_category_type()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT type FROM categories WHERE id = NEW.category_id) != NEW.type THEN
        RAISE EXCEPTION 'Transaction type must match category type';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_category_type
    BEFORE INSERT OR UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION check_category_type();
