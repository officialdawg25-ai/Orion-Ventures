# Data model and invariants

**Status:** PROPOSED logical model.

## Core entities
Portfolio, membership, role and scope; legal entity and ownership relationship; venture and stage transition; objective, milestone and review; task, procedure and decision; evidence and document metadata; customer, lead, consent/permission, campaign and experiment; financial transaction/lines, budget, commitment, forecast and reconciliation; risk, obligation, incident, approval and audit event; AI run, source reference, recommendation and human decision.

## Invariants
- Every private record has an owner scope and server-enforced authorization path.
- Legal entities are distinct from ventures and informal folders.
- Money is decimal and currency-explicit; cross-currency totals require dated FX provenance.
- Audit events are append-oriented and not editable by ordinary users.
- Stage transitions reference evidence and an accountable decision maker.
- Archive/deletion follows documented retention and referential-integrity rules.
- AI recommendations never implicitly approve transactions or legal decisions.
- Personal data is not copied across ventures without a lawful purpose and access justification.

## Database requirements
Use foreign keys, uniqueness/check constraints, indexes and transaction boundaries. Avoid generic untyped JSON as the primary representation for finance or authorization. Test direct API access, not only UI flows. RLS policies need explicit, reviewed read/write behavior.

## Open decisions
Exact schema, membership cardinality, legal-entity consolidation, accounting integrations, storage retention and soft-delete strategy require review before migrations are authored.
