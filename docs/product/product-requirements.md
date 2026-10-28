# Product Requirements — Orion Ventures Operating System (OVOS)

**Version:** 0.1 foundation draft  
**Status:** Requirements drafted; implementation is partial.

## Product promise

Give Orion Ventures, the holding company, a single trustworthy operating view of its venture portfolio: what is verified, what is uncertain, what needs attention, where capital and management time are committed, and which next decision is justified by evidence.

The product is not a generic project dashboard, spreadsheet clone, accounting replacement, or AI that autonomously decides the fate of businesses.

## Primary user jobs

1. Capture and compare venture ideas without prematurely treating them as businesses.
2. Run bounded, low-cost validation experiments and preserve negative evidence.
3. Track each venture's lifecycle stage, owner, constraints, milestones and next gate.
4. Build repeatable customer acquisition and retention workflows.
5. Understand cash, costs, commitments, forecasts and inter-entity transfers without conflating them.
6. Surface overdue decisions, cash pressure, stalled validation, risks and owner attention needs.
7. Record decisions with evidence, alternatives, rationale, approver and review date.
8. Reuse playbooks and lessons across ventures without incorrectly mixing legal ownership or sensitive data.
9. Receive AI-assisted summaries and suggestions with sources and uncertainty, retaining human control.

## Experience requirements

- Responsive desktop/mobile experience with clear keyboard focus and semantic controls.
- Premium, calm, high-contrast visual hierarchy; no noisy gradients, excessive cards or fake analytics.
- Real empty states explain what data is missing and how it will be sourced.
- Every metric displays definition, timeframe, currency/unit, freshness and a route to underlying records.
- Clear distinction between verified, partial, inferred, proposed and blocked information.
- Errors explain recovery steps without exposing secrets or database internals.
- Navigation opens distinct workflows; avoid one giant scrolling page.
- No irreversible or consequential action triggered solely by AI output.

## Functional requirements

### Portfolio and venture registry
- Create and manage portfolio groupings and membership roles.
- Distinguish legal entities from ventures, brands, products and projects.
- Store venture owner, lifecycle stage, model, audience, offer, constraints, risks, goals and evidence.
- Support stage-gate reviews with spend caps, success/stop criteria and next review.
- Preserve lifecycle and ownership history.

### Evidence and decisions
- Store source type, source reference, observed date, captured date, owner, limitations and confidence.
- Link evidence to experiments, metrics, stage gates and decisions.
- Record decision maker, timestamp, rationale, alternatives, status and follow-up date.
- Do not silently overwrite material decision history.

### Customer acquisition
- Model segments, offers, campaigns, prospects, follow-up activities, conversions, onboarding and retention.
- Support channel/source attribution and duplicate handling.
- Keep actual customer outcomes separate from vanity engagement.
- Respect contact preferences, opt-outs and applicable privacy rules.

### Financial control
- Separate cash, revenue, costs, owner funding, distributions, commitments, budgets, forecasts and inter-entity balances.
- Support explicit currency, precise amounts, source references, approvals and reconciliation.
- Use reversal/adjustment history for posted transaction corrections.
- Do not present forecast as actual or portfolio cash as accounting profit.

### Operations and governance
- Manage tasks, SOPs, obligations, contracts, incidents, risks and approvals.
- Track owner, due date, status, evidence and escalation.
- Keep audit history for permission changes and consequential records.
- Support exports with scoped authorization and logged activity.

### Intelligence
- Provide source-linked research summaries, risk flags and forecasts with dates and limitations.
- Separate generated output from verified records.
- Require human approval for material financial, legal, employment, access or venture-exit actions.
- Treat documents and external sources as untrusted input; prevent prompt injection from granting tool access.

## Non-functional requirements

- Tenant/portfolio isolation enforced with RLS, SQL grants and server-side authorization.
- No service-role key or provider secret in browser bundles or Git.
- Versioned, reviewable migrations and clean-database replay.
- CI for type checks, unit tests, build and secret/dependency scanning.
- Automated negative authorization tests.
- Backups and demonstrated restore procedure.
- Observability with sensitive data minimization.
- Accessibility checks, responsive testing and performance budgets.
- Privacy/retention and data export/deletion processes appropriate to applicable law.
- Human-readable incident and release runbooks.

## MVP scope

**First usable slice:** authentication and recovery, portfolio membership, venture registry, evidence items, lifecycle stage-gate reviews, decisions, auditability and a dashboard that derives its indicators from persisted records.

**Explicitly later:** full accounting, automated messaging, paid campaigns, payment collection, broad AI agents, multi-provider integrations, payroll, and automated legal/tax advice. These require separate requirements, security reviews and business validation.

## Success measures

Define success only after instrumentation and a baseline exist. Candidate measures include time to make a portfolio review, share of active ventures with current evidence and review dates, time from prospect to follow-up, experiment cost per useful learning, and forecast-versus-actual error. Do not populate target values or claim improvement until measured.

## Release acceptance

- Core records persist and can be exported under authorized access.
- A second unrelated user cannot read or mutate the first user's portfolio.
- Every portfolio indicator is reproducible from source records.
- Financial concepts are not conflated.
- Stage-gate decisions require evidence references and explicit rationale.
- Invalid input, duplicate submission, unauthorized access and transient failure are handled safely.
- Clean test database migration replay and staging smoke tests pass.
- No unresolved critical security finding.
- The release has a verified rollback/recovery plan and explicit authorization.
