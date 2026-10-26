# MPOS Implementation Roadmap

**Current phase:** Initial front-end foundation on a development branch.  
**Not complete:** Supabase integration, migrations, authentication, production deployment, automated tests and production security review.

## Phase 0 — Foundation and evidence
- Inspect GitHub, Supabase and Cloudflare configuration.
- Capture a baseline and record blocked checks.
- Establish product, architecture, lifecycle, security and cost documentation.
- Keep production resources unchanged.

## Phase 1 — Build and verification workflow
- Pin supported Node/runtime and dependency versions.
- Commit a lockfile from a real install.
- Add CI for dependency installation, typecheck, unit tests, build and secret scanning.
- Add lint/format policy and branch/review rules where available.
- Verify all checks by running them; never claim success from configuration alone.

## Phase 2 — Identity and portfolio boundary
- Design user profile and portfolio membership schema.
- Test Supabase auth/recovery and privileged MFA settings.
- Review and remediate the SECURITY DEFINER warning in an isolated environment.
- Implement RLS and explicit grants with cross-portfolio negative tests.
- Do not apply migrations to the existing project until isolated tests pass and change authorization is explicit.

## Phase 3 — Core venture registry
- Create portfolio, legal entity, venture, stage-gate and evidence records.
- Add ownership, lifecycle, status constraints and audit trail.
- Implement create/read/update workflows with validation and permission checks.
- Verify empty states and errors; do not seed fabricated business data.

## Phase 4 — Operating workflows
- Objectives, milestones, experiments, tasks, SOPs, obligations and decisions.
- Evidence-backed attention queue with visible formulas and source links.
- Notifications only after preference, delivery and retry behavior are designed.

## Phase 5 — Customer acquisition
- Target segments, offers, prospects, lead source, follow-up, conversion and retention.
- Campaign attribution and deduplication rules.
- Funnel measures with denominator definitions, dates and source records.

## Phase 6 — Financial control
- Accounts, transactions, budgets, commitments, forecasts and inter-entity balances.
- Explicit currency and decimal precision; corrections by reversal/adjustment rather than silent overwrite.
- Reconciliation tests and clear distinction between cash, revenue, profit, funding and loans.
- Accounting/tax integrations only after jurisdiction and provider workflows are verified.

## Phase 7 — Intelligence and integrations
- AI summaries/recommendations with sources, timestamps, uncertainty and data minimization.
- Human approval for consequential actions.
- Add integrations one at a time with least-privilege credentials, idempotency and revocation procedures.

## Phase 8 — Staging and release
- Deploy a distinct staging target; verify no production route/binding is reused.
- Test auth, RLS, workflows, responsive UI, accessibility, performance and error handling.
- Verify backup/restore and incident runbooks.
- Security review and explicit production release authorization.

## Minimum acceptance gates

- No cross-portfolio data leakage under negative tests.
- Financial totals reconcile to underlying entries.
- Every material metric has a formula, timeframe and source.
- Clean database migration replay succeeds in an isolated environment.
- Failed authorization, duplicate requests and invalid input fail safely.
- CI fails on type, test, build or secret-scan failures.
- Staging smoke tests and recovery checks pass.
- No unresolved critical security findings.
- No real-looking fake metrics or testimonials.
- Claims of build/test/deploy/production readiness are supported by captured evidence.
