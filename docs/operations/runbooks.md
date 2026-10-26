# Operational Runbooks

These are required operating procedures; several are still to be implemented and exercised.

## Deployment

1. Confirm the target branch, account, environment and exact deployment destination.
2. Review changes and migration diff; verify no production secrets or destructive operations.
3. Run install, typecheck, unit tests, build, security checks and relevant integration/RLS tests.
4. Deploy to the isolated staging target.
5. Run smoke tests for authentication, authorization, critical workflows and error states.
6. Verify logs and health indicators without exposing sensitive values.
7. Obtain explicit production release authorization.
8. Deploy with a rollback plan and verify the public route/version.
9. Record deployed commit, environment, checks, operator and timestamp.

## Database migration

1. Read the migration and dependencies; identify locks, data transforms and rollback limitations.
2. Take/verify an appropriate backup and recovery path.
3. Apply to a disposable/isolated database.
4. Run clean replay, integrity checks, positive and negative RLS tests, and advisor review.
5. Review query plans and indexes where relevant.
6. Apply to staging and smoke-test.
7. Apply to production only with authorization; record result.
8. Do not claim rollback is possible if a migration is destructive or irreversible.

## Suspected security incident

1. Preserve relevant timestamps and logs; do not delete evidence.
2. Restrict affected credentials/access where authorized and proportionate.
3. Identify affected resources, accounts, data scope and exposure window.
4. Rotate/revoke compromised secrets; check logs and dependent integrations.
5. Assess legal/privacy notification duties with qualified advice.
6. Restore trusted state, validate controls and monitor for recurrence.
7. Record root cause, impact, remediation and follow-up actions.

## Backup and recovery

- Define RPO/RTO targets before relying on a backup plan.
- Confirm the backup covers database, storage objects, configuration and required metadata.
- Run scheduled restore drills into an isolated environment.
- Validate record counts, constraints, access policies and application smoke tests after restore.
- Document who can restore and how credentials are rotated.
- A backup that has never been restored is not verified recovery capability.

## Access review

- Review owner/admin membership and privileged credentials periodically and after personnel changes.
- Remove access promptly when no longer required.
- Confirm MFA/recovery settings for privileged identities.
- Review service credentials, scopes, age and rotation/revocation procedures.
- Check that logs do not contain secrets or unnecessary personal information.

## Current known blockers

- Initial CI workflow is present but no successful run has been verified.
- Dependency lockfile is not yet committed.
- No isolated database environment has been established for security remediation and migration testing.
- Supabase security advisor still reports public execution of `public.rls_auto_enable()` by `anon` and `authenticated`.
- No staging or production application deployment has been verified.
