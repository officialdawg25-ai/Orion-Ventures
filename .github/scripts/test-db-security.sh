#!/usr/bin/env bash
set -euo pipefail

: "${PGHOST:=localhost}"
: "${PGPORT:=5432}"
: "${PGUSER:=postgres}"
: "${PGPASSWORD:=postgres}"
: "${PGDATABASE:=postgres}"
export PGHOST PGPORT PGUSER PGPASSWORD PGDATABASE

psql -v ON_ERROR_STOP=1 -f .github/scripts/test-db-bootstrap.sql
psql -v ON_ERROR_STOP=1 -f supabase/migrations/20261026150000_initial_portfolio_schema.sql
psql -v ON_ERROR_STOP=1 -f supabase/migrations/20261026151000_harden_rls_auto_enable.sql
psql -v ON_ERROR_STOP=1 -f .github/scripts/test-db-security.sql
