# Initial Data Model

**Status:** Logical design only. No migration has been applied.

## Identity and portfolio boundary

- `auth.users`: managed by Supabase Auth; do not duplicate credentials.
- `profiles`: optional user-facing profile metadata keyed to the auth user ID.
- `portfolios`: management grouping, created by a user.
- `portfolio_memberships`: user, portfolio, role, invitation/active/suspended status and timestamps.
- `legal_entities`: registered/legal entity details kept distinct from the portfolio grouping.
- `entity_ownership`: explicit ownership relationship, effective dates and evidence.
- `venture_entity_relationships`: describes which legal entity owns/operates/contracts for a venture; must support multiple entities where valid.

## Venture and evidence

- `ventures`: portfolio, name, description, venture type, lifecycle stage, accountable owner, status, currency preference and timestamps.
- `venture_stage_reviews`: stage before/after, decision, rationale, evidence links, budget cap, success/stop criteria, decision maker and next review date.
- `objectives` and `milestones`: measurable outcome, owner, due date, status and evidence.
- `experiments`: hypothesis, audience, method, spend/time cap, success/failure criteria and observed result.
- `evidence_items`: type, title, source, source date, collection date, owner, confidence/limitations and links to the records they support.
- `decisions`: options considered, rationale, approver, date, review date and outcome.

## Acquisition

- `customer_segments`, `offers`, `campaigns`, `prospects`, `lead_activities`, `conversions`, `onboarding_records` and `retention_events`.
- Store source/attribution method and reporting period for metrics.
- Avoid unnecessary personal information; store contact permissions/preferences and deletion/retention state where required.
- Deduplication should preserve merge provenance rather than silently deleting history.

## Financial control

- `financial_accounts`, `transactions`, `transaction_lines`, `budgets`, `commitments`, `forecast_scenarios`, `forecast_lines`, `inter_entity_balances` and `reconciliations`.
- Amounts use fixed-precision numeric types plus ISO currency.
- Actuals, budgets, commitments and forecasts must remain separate.
- Corrections to posted records use reversals/adjustments with audit history.
- Each balance or summary must be traceable to source lines and reporting rules.

## Operations and governance

- `tasks`, `sop_documents`, `contracts`, `obligations`, `risks`, `incidents`, `approvals`, `audit_events` and `documents`.
- Keep append-only audit history for material access, financial, approval and lifecycle actions.
- File storage policies must mirror portfolio authorization and avoid public buckets for sensitive documents.

## AI and integrations

- `integration_connections`: provider, scope, status and metadata only; actual secrets remain in a secret store.
- `ai_runs`: task, model/provider, run time, status and data minimization metadata.
- `ai_source_references`: exact record/document/source and version used by an output.
- `ai_recommendations`: recommendation, assumptions, uncertainty, proposed next action and human disposition.
- AI output must not overwrite verified source records or execute consequential operations without explicit approval.

## Common integrity rules

- UUID primary keys and foreign keys for relational integrity.
- Use unique constraints for idempotency keys and natural identifiers where appropriate.
- Index foreign keys and high-selectivity filter columns after examining query patterns.
- Store timestamps in UTC and render using the user's configured timezone.
- Validate status transitions in trusted server/database logic.
- Use RLS plus SQL grants; neither replaces the other.
- Do not add all entities at once. Ship a minimal, tested slice and evolve via versioned migrations.
