# Financial control model

**Status:** PROPOSED management model, not a substitute for statutory accounting.

## Principles
- Use precise decimal amounts and explicit currency.
- Distinguish transaction, posting, settlement and forecast dates.
- Preserve source, category, counterparty, entity/venture, creator, approval, attachment and correction history.
- Separate actuals, commitments, budgets and forecasts.
- Distinguish revenue, receipts, expenses, payments, owner contributions, loans, taxes and inter-entity transfers.
- Never silently overwrite posted transactions; use traceable correction/reversal events.

## Minimum concepts
Transaction and lines, account/category mapping, budget, commitment, invoice/reference, payment/settlement, cash snapshot, forecast assumption, funding request, intercompany balance and reconciliation record.

## Controls
Validate amount semantics and currencies; enforce scope; use configurable approval thresholds; flag possible duplicates for review; reconcile to source rows; track classification/forecast changes; label estimates; support export and accounting reconciliation.

## Dashboard definitions
Cash is not profit. Profit is not necessarily cash. Revenue is not necessarily collected. Inter-entity transfers must not count as consolidated external revenue. Each metric needs a definition, period, inclusion/exclusion rules, FX method and source drill-down.

Tax, VAT, payroll, statutory reporting and financial statements require current qualified advice and/or specialist accounting software. Do not market the MVP as tax-compliant accounting without independent validation.
