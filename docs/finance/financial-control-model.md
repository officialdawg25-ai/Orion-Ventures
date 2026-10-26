# Financial Control Model

## Accounting concepts that must remain distinct

- **Cash balance:** actual balance at a stated date and account scope.
- **Revenue:** recognized sales under the applicable accounting policy; not automatically equal to cash received.
- **Expense/cost:** incurred cost with category, period and supporting record.
- **Owner contribution:** funds added by an owner; not sales revenue.
- **Owner draw/distribution:** funds paid to owners; not an operating expense by default.
- **Inter-venture loan/transfer:** one entity's receivable may be another entity's payable; not consolidated revenue.
- **Commitment:** expected or contractually committed future outflow; not necessarily paid.
- **Forecast:** scenario or estimate, explicitly labeled and dated.
- **Profit:** calculated according to a defined accounting basis; never inferred from bank balance alone.

## Data rules

- Store amounts as fixed-precision decimal/numeric values, not binary floating point.
- Store ISO currency code with every monetary amount; do not silently sum different currencies.
- Preserve transaction date, posting date, period, source/reference, account, category, counterparty when appropriate, entity/venture allocation, creator and correction history.
- Corrections should use reversal/adjustment entries with a reason; avoid silently overwriting posted financial facts.
- Import processes need deduplication keys, reconciliation totals and explicit handling for pending/failed records.
- Separate actuals, budgets, commitments and forecast scenarios in the UI.
- Each aggregate must expose its formula, reporting period, currency and included/excluded statuses.

## Initial entities (design only)

- Financial account and entity/venture allocation.
- Transaction and transaction line.
- Category/account mapping.
- Budget and budget line.
- Commitment.
- Forecast scenario and forecast line.
- Inter-entity balance and reconciliation record.
- Evidence/attachment reference and audit event.

## Controls

- Role-based permissions for viewing, creating, approving, correcting and exporting financial records.
- Optional dual approval for configurable thresholds and sensitive operations.
- Audit all changes to posted entries, permissions, export actions and reconciliation outcomes.
- Never store banking credentials or card secrets in general application tables.
- Financial summaries must reconcile to source entries and show stale/missing data warnings.
- Tax and accounting workflows require jurisdiction-specific review; the product must not imply that reminders alone establish compliance.

## Release gates

No live financial workflow until data model, currency handling, authorization tests, audit trail, reconciliation behavior, backups and restore procedure have been reviewed in staging.
