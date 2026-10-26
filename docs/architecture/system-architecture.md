# System architecture

**Status:** PROPOSED. No application architecture is currently implemented.

## Verified foundation
- GitHub repository: officialdawg25-ai/Orion-Ventures, default branch main.
- Supabase project ref: blbtppjqbpcuoivvqqhe, PostgreSQL 17, region eu-central-1.
- Cloudflare Worker: orion-ventures; starter response, no inspected bindings/routes/custom domains.
- Repository currently has no application source, package manifest, tests or application migrations.

## Proposed deployment
- Responsive web client served through Cloudflare.
- Supabase Auth for identity, PostgreSQL for durable data and RLS for data boundaries.
- Server-side Worker/edge handlers where secrets, validation, rate limiting or privileged operations require them.
- Private object storage for documents with scoped access and time-limited access where appropriate.
- External providers behind adapters with timeouts, retry limits and observable failures.

## Boundaries
The browser is untrusted. Never expose service-role keys. Privileged actions validate identity, scope, input and authority server-side. Database policies remain mandatory even if application code filters queries.

## Environments
Use isolated development/staging and production projects where feasible. Separate secrets and provider accounts. Do not run destructive experiments against production. Version migrations in Git and test them against a clean database before deployment.

## Observability and release
Use structured logs, correlation IDs, error tracking, dependency health, latency, cost signals, audit events and alerts. Exclude secrets and unnecessary sensitive payloads. Build immutable revisions, run CI, deploy to staging, smoke-test critical journeys and maintain separate application rollback and database recovery plans. Worker rollback does not restore database state.
