# Operations runbooks

**Status:** PROPOSED; exercises have not yet been run.

## Release
1. Review scope, migrations, secrets and data impact.
2. Confirm CI and dependency/security checks pass.
3. Apply migrations to isolated staging; inspect schema and policies.
4. Deploy an immutable revision to staging.
5. Smoke-test login, portfolio isolation, venture CRUD, finance, uploads and audit.
6. Review errors, performance and costs.
7. Obtain explicit production approval.
8. Record revision, migration IDs, approver and outcome.

## Rollback
Revert application code only when compatible with the current schema. Do not assume application rollback reverses schema or data. Prefer forward-fix migrations where rollback risks data loss. Restore data only through a documented, authorized incident procedure.

## Backup and recovery
Define recovery point and recovery time objectives, verify backup coverage, restrict backup access and test restoration in isolation. Record restore evidence and integrity checks. A configured backup is not proof of recoverability.

## Security incident
Contain access, preserve logs, rotate affected credentials, assess scope, involve accountable owners and qualified advisers, meet applicable notification duties, restore known-good state, document root cause and preventive work.

Every runbook execution records timestamp, environment, operator, revision, actions, result, deviations and follow-up. Never include secrets in logs.
