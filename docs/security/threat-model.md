# MPOS Security Threat Model

**Status:** Initial review; not a security certification.

## Assets to protect

- Portfolio and venture plans.
- Customer/prospect personal information and communications.
- Financial records, bank/cash positions, forecasts and documents.
- Authentication identities, sessions, recovery channels and privileged roles.
- API credentials, integration tokens, AI-provider keys and signing secrets.
- Audit history and decision evidence.

## Primary threat scenarios

| Threat | Required controls | Verification evidence |
|---|---|---|
| Cross-portfolio data access | RLS, explicit grants, server-side ownership checks | Negative tests with two unrelated users/portfolios |
| Anonymous execution of privileged database function | Remove unintended execute grants or move function out of exposed schema; preserve required trigger behavior | Catalog/ACL review, RPC denial test, event-trigger regression test |
| Service-role key exposed to browser | Server-only secrets, repository secret scan, deployment environment review | Bundle scan and secret scanning |
| Forged role or portfolio ID | Derive identity from trusted session; authorize every operation | Tampered-ID API and database tests |
| Unauthorized financial mutation | Append-only transaction model/reversals, approval controls, audit events | Integrity and permission tests |
| Malicious document/prompt injection | Treat external content as data; isolate instructions; restrict AI tools and output actions | Adversarial fixture tests |
| Account takeover | Secure recovery, MFA for privileged roles, session management and rate limits | Auth configuration review and recovery tests |
| Data loss or accidental migration | Backups, tested restore, migration review, staging first | Restore drill and migration replay |
| Sensitive data in logs | Structured redaction and minimum collection | Log review with seeded secrets |
| Abuse of public endpoints | Schema validation, rate limits, quotas and abuse monitoring | Load/abuse tests |

## Existing database finding

The Supabase security advisor reports that `public.rls_auto_enable()` is a SECURITY DEFINER function callable by `anon` and `authenticated` through the Data API. It is attached to a `ddl_command_end` event trigger named `ensure_rls`, apparently intended to enable RLS on newly created public tables. This is a verified configuration finding, not proof of a successful exploit.

Required actions before production:
1. Read and review the complete function definition and event-trigger scope.
2. Confirm whether direct RPC execution is necessary; event triggers are invoked by DDL and do not generally need public RPC access.
3. In an isolated test database, revoke inappropriate function EXECUTE grants from `PUBLIC`, `anon` and `authenticated`, while preserving the trigger's ability to invoke the function as required.
4. Create a disposable test table and verify the trigger still enables RLS.
5. Verify anonymous/authenticated direct RPC attempts fail.
6. Re-run Supabase security advisors and capture results.
7. Apply a reviewed migration only after test evidence and authorization.

Do not drop the function or event trigger as a shortcut: doing so could remove a safeguard.

## Authorization model

- Default deny.
- RLS on every user-owned or portfolio-owned table.
- Explicit grants only to the roles and operations that need them.
- RLS predicates should rely on authenticated identity and validated membership rows.
- Never rely on client-side filters or hidden controls for access control.
- Test insert, select, update and delete separately.
- Test object/function privileges separately from row policies.
- Elevated server operations must authenticate, authorize, validate and audit each action.

## Release blockers

Do not label the platform production-ready while any of these remain unresolved:
- Unintended public execution of SECURITY DEFINER functions.
- Missing tenant-isolation tests.
- Secrets present in browser bundle or Git history.
- Unreviewed production migration or untested rollback/recovery.
- Critical/high vulnerability without an accepted mitigation.
- Missing auditability for material financial or permission changes.
