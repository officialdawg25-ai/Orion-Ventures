# Access control matrix

**Status:** PROPOSED; roles must be validated against operating needs.

| Capability | Portfolio owner | Portfolio operator | Venture lead | Finance role | Adviser/read-only |
|---|---|---|---|---|---|
| Portfolio settings | Manage | Scoped manage | No | No | Read if granted |
| Venture profile | Portfolio scope | Assigned scope | Assigned venture | Assigned scope | Read if granted |
| Stage-gate decision | Approve | Prepare | Propose | Financial review | Read if granted |
| Tasks/playbooks | Manage | Manage | Assigned venture | Assigned scope | Read if granted |
| Leads/customers | Scoped manage | Scoped manage | Assigned venture | No by default | No by default |
| Financial records | Authorize | Limited if granted | Limited if granted | Manage within scope | Explicit read-only |
| Audit/approvals | Authorized scope | Scoped | Own/assigned scope | Financial scope | Read if granted |
| Access administration | Manage | Delegate only if authorized | No | No | No |

## Enforcement
Default deny. Derive authorization from trusted membership records, never client-supplied role names. Enforce in database and server; hiding UI elements is not security. Separate view/create/update/approve/export/archive/delete/access-management privileges. Finance access does not imply customer or employee access. Audit access changes and privileged actions. Test anonymous, unauthenticated, wrong-portfolio, wrong-venture, revoked-member and privilege-escalation cases.

Knowing a record UUID or URL must never grant access.
