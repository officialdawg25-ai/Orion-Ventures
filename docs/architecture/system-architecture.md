# DAWG 360° MPOS — System Architecture

**Status:** Proposed architecture; implementation is partial.  
**Repository:** `officialdawg25-ai/Orion-Ventures`  
**Development branch:** `docs/mpos-phase-zero-architecture`  
**Production status:** Not deployed as an application.

## Product objective

DAWG 360° is an evidence-led operating system for a portfolio of ventures. It helps an owner decide what to validate, launch, grow, maintain, repair, pause, restructure, sell, or close. Every material indicator must trace to a source record, calculation, timestamp, and definition.

## Architecture principles

1. One source of truth for each record; no parallel shadow databases.
2. Treat legal entities, portfolio groupings, ventures, brands, and projects as different concepts.
3. Tenant/portfolio boundaries enforced by database authorization, not merely hidden UI.
4. Use versioned migrations and automated positive and negative authorization tests.
5. Keep secrets and privileged operations server-side.
6. AI recommendations are proposals with source references and uncertainty, never authoritative financial or legal records.
7. Never represent sample data as live business data.
8. Stage and verify before production deployment.

## Proposed stack

- Front end: React + TypeScript + Vite, responsive web application.
- Data and identity: Supabase Auth and PostgreSQL with RLS, explicit SQL grants, versioned migrations and audit records.
- Hosting: Cloudflare Pages or Workers static assets after deployment architecture and account configuration are verified.
- Server-side integrations: narrowly scoped Cloudflare Worker/Functions or Supabase Edge Functions, chosen per use case rather than duplicated.
- Testing: TypeScript checks, unit tests, database/RLS tests, integration tests, accessibility checks and staged end-to-end smoke tests.

The current repository contains an initial front-end shell only. Supabase is not yet wired to the application. No production deployment has been made by this implementation.

## Trust boundaries

- Browser: public configuration only; never a Supabase service-role key, provider secret, or privileged credential.
- Authenticated client: only permitted operations through policies and grants; UI checks are not authorization.
- Server-side integration: validate identity, resource ownership, input schema, rate limits and allowed actions before privileged work.
- Database: RLS for row isolation, grants for object/function access, constraints for data integrity, auditability for material changes.
- AI provider: minimize data sent, treat retrieved content as untrusted input, constrain tools, log source references and require human approval for consequential actions.

## Core domain model

Initial logical entities (not yet migrated):

- Portfolio and portfolio memberships.
- Legal entities and ownership relationships.
- Ventures, lifecycle stage, stage-gate reviews and business cases.
- Objectives, milestones, experiments, evidence sources and assumptions.
- Customer segments, offers, prospects, leads, activities, campaigns, conversions and retention.
- Accounts, transactions, budgets, commitments, forecasts and inter-entity balances.
- Tasks, SOPs, contracts, obligations, decisions, approvals, risks and incidents.
- Documents, integrations, AI runs, source references and audit events.

Use UUID primary keys, explicit foreign keys, created/updated timestamps, actor attribution where applicable, and status values constrained by database enums/check constraints or reference tables. Use numeric types for money, an explicit ISO currency code, and immutable ledger entries or reversal entries for financial corrections. Do not store money in floating-point types.

## Portfolio versus legal entity

A portfolio is a management grouping. A legal entity represents a registered or otherwise legally constituted entity. A venture may be an idea, brand, product, or operating business and does not automatically represent a separate legal person. Model ownership, liabilities, bank accounts, tax registrations, and inter-entity balances explicitly; never infer that portfolio-level consolidation removes legal separation.

## Environment strategy

1. Local development with disposable local/test data.
2. Isolated staging project/database with separate credentials.
3. Production Supabase project and Cloudflare Worker remain untouched until staging acceptance.
4. Secrets are injected through environment-specific secret stores, not committed to Git.
5. Migrations are committed to Git and reviewed; do not apply experimental DDL directly to production.

The current Supabase project has no application tables or migrations reported during inspection. It does have an existing `public.rls_auto_enable()` SECURITY DEFINER event-trigger function that is executable by `anon` and `authenticated`. Resolve this finding deliberately before creating production tables; do not blindly drop the function because it is attached to an event trigger.

## Operational qualities

- Security: least privilege, RLS, explicit grants, secrets management, audit trails and rate limiting.
- Reliability: bounded retries, idempotency for integrations and payment-like operations, health checks and documented recovery.
- Performance: query pagination, indexed foreign keys/filter columns, lazy loading and measured performance budgets.
- Accessibility: semantic landmarks, keyboard operation, visible focus, contrast and reduced-motion support.
- Observability: structured errors and event logs without credentials or unnecessary personal data.
- Maintainability: strict TypeScript, documented domain rules, automated tests and small reversible migrations.
