# Product requirements

**Status:** PROPOSED; owner review required before implementation.

## Users
Portfolio owner/principal; portfolio operator; venture lead; finance operator/accountant; read-only adviser; later, scoped employees, contractors and collaborators.

## Core journeys
1. Create a portfolio and describe its legal/operating structure.
2. Register a venture with owner, stage, offer and evidence.
3. Set a measurable milestone with budget, owner, due date and acceptance criteria.
4. Record a lead, follow-up, outcome and acquisition cost.
5. Record financial events with currency, category, date, source and audit trail.
6. Review venture health and record an explicit decision.
7. Attach/link a classified document with access controls.
8. Grant/revoke scoped access and inspect audit history.

## Functional requirements
- Portfolio and venture registry with lifecycle state machine.
- Objectives, milestones, tasks, decisions, evidence and reviews.
- Leads, acquisition channels, campaigns, follow-up and funnel metrics.
- Budgets, actuals, commitments, cash forecasts and reconciliation support.
- Risk/obligation register, document metadata, expiry reminders and incidents.
- Dashboard based only on persisted records and documented calculations.
- Exportable records and documented retention/deletion workflows.
- AI assistance only after access checks, with sources and human confirmation.

## Non-functional requirements
- Tenant/portfolio isolation enforced server-side and by PostgreSQL RLS.
- Accessible responsive UI with real loading, empty and error states.
- Logs omit secrets and unnecessary personal data.
- Versioned migrations, repeatable builds, automated tests and staged release.
- Graceful integration failure handling, data portability and time-zone-safe dates.
- No fake metrics, fake testimonials, inert controls or silent destructive actions.

## Acceptance
Authorization-negative tests pass; totals reconcile; workflows persist and reload; migrations replay on a clean test database; CI and staging smoke tests pass; backup/restore is exercised; critical security issues are resolved or explicitly block release.
