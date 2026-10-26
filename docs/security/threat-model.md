# Threat model

**Status:** PROPOSED; not a completed penetration test.

## Assets
Portfolio strategy, financial records, customer/employee personal information, contracts, sessions, provider credentials, audit history and uploaded documents.

## Trust boundaries
Browser/application API; application/database; application/external providers; user/uploaded files; AI/retrieved content/tools; development/staging/production.

## Threats and controls
- Cross-portfolio exposure: RLS, grants, scoped server checks and negative tests.
- Privileged key theft: server-only secrets, least privilege, rotation and no secrets in bundles/logs.
- SECURITY DEFINER abuse: inventory, narrow grants, safe search path, reviewed function body and isolated tests.
- Prompt injection/data exfiltration: treat retrieved text as untrusted; minimize context; authorize tools outside the model.
- Account takeover: secure recovery, MFA for privileged roles, session controls and rate limits.
- Financial fraud: approval workflow, audit history, reconciliation and anomaly review.
- Malicious uploads: type/size limits, private storage, scanning where available and safe download headers.
- Supply-chain compromise: lockfiles, dependency scans, restricted CI permissions and pinned actions where practical.
- Destructive release: staging gates, backups, migration review, rollback and restore exercises.
- Privacy violations: purpose limitation, minimization, retention, access logs and incident response.

## Existing finding
Supabase advisor reports public.rls_auto_enable() is SECURITY DEFINER and executable by anon and authenticated. A registered ensure_rls event trigger calls it for table creation events. This is a verified configuration finding, not proof of exploit. Do not invoke or alter it in production during investigation. Review behavior/grants in isolation and remediate through reviewed migrations only after authorization.

## Release blockers
Unresolved critical/high risks; failed cross-tenant tests; exposed secrets; unreviewed privileged function; untested recovery; or missing auditability for sensitive actions.
