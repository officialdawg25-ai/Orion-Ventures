# Access-Control Matrix (Initial Proposal)

This is a proposed product policy, not yet enforced in the database.

| Capability | Owner | Admin | Editor | Viewer |
|---|---:|---:|---:|---:|
| View permitted portfolio records | Yes | Yes | Yes | Yes |
| Manage portfolio settings | Yes | Yes, scoped | No | No |
| Invite/change member roles | Yes | Only if explicitly delegated | No | No |
| Create/update venture plans | Yes | Yes | Yes | No |
| Approve lifecycle stage changes | Yes | If delegated | Propose only | No |
| View financial records | Yes | If delegated | Scoped | If delegated |
| Post/correct financial records | Yes | If delegated | No by default | No |
| Approve material financial changes | Yes | If delegated | No | No |
| View audit/decision history | Yes | Yes, scoped | Relevant records | Relevant records |
| Delete audit history | No routine UI capability | No | No | No |

## Enforcement requirements

- Membership is scoped to a portfolio; roles do not automatically apply across portfolios.
- Legal-entity access may need to be narrower than portfolio access.
- Authorization is enforced by RLS, SQL grants and server-side checks.
- UI visibility is a usability feature, not a security boundary.
- Verify SELECT, INSERT, UPDATE and DELETE separately with both permitted and forbidden actors.
- Test cross-portfolio IDs, inactive members, changed roles, expired sessions and anonymous requests.
- Use a controlled invitation/role-change workflow; never let a user assign themselves elevated roles by editing a client payload.
- Log access grants/revocations and consequential changes.
