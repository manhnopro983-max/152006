#!/bin/bash
set -e

# ============================================================
# Create a limited application database user (hardening)
# This user can only SELECT, INSERT, UPDATE, DELETE
# Cannot CREATE/DROP tables, ALTER schema, or manage roles
# ============================================================

APP_USER="${APP_DB_USER:-expense_app}"
APP_PASS="${APP_DB_PASSWORD:-change_me_app_password}"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v app_user="$APP_USER" -v app_pass="$APP_PASS" <<'EOSQL'

-- Create limited app user
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'app_user', :'app_pass')\gexec

-- Grant connect to database
SELECT format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), :'app_user')\gexec

-- Grant usage on public schema
SELECT format('GRANT USAGE ON SCHEMA public TO %I', :'app_user')\gexec

-- Grant CRUD only on existing tables
SELECT format('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO %I', :'app_user')\gexec

-- Grant sequence usage (for SERIAL/auto-increment)
SELECT format('GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO %I', :'app_user')\gexec

-- Set default privileges for future tables
SELECT format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO %I', :'app_user')\gexec
SELECT format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO %I', :'app_user')\gexec

EOSQL

echo "✅ App user '$APP_USER' created with limited permissions (CRUD only, no DDL)"
