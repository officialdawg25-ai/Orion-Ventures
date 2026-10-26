# Application foundation — implementation note

**Status:** Initial UI scaffold proposed on branch foundation/app-shell. Not production-ready.

## Included in this revision
- React + TypeScript + Vite application shell.
- Responsive navigation for overview, ventures, customer acquisition, financial control, operations/risk, intelligence and setup.
- Explicit empty states; no fabricated venture/customer/financial records.
- Foundation checklist showing that authentication, database persistence, RLS, recovery and release verification remain pending.
- CI workflow intended to typecheck and build the project on pull requests and selected pushes.
- Environment example contains empty public-client placeholders only; no secrets.

## Explicitly not implemented
- Authentication or account recovery.
- Supabase client initialization, database schema, RLS policies or persistence.
- Venture creation, CRM, accounting, uploads, AI, emails or integrations.
- Production hosting configuration, custom domains, secrets or deployment.
- Lockfile and locally executed build/test evidence.

## Safety
Do not deploy this shell as an operational business platform. The Supabase security finding must be reviewed and resolved through a controlled, separately authorized migration process before sensitive data is introduced. Generate and commit a lockfile, run CI successfully, and review dependencies before release.
