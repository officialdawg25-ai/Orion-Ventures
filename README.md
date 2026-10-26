# DAWG 360° — Multipreneur Portfolio Operating System

DAWG 360° is an evidence-led operating system for managing a portfolio of ventures. It helps an owner decide what to validate, launch, grow, maintain, repair, pause, restructure, sell or close — with traceable evidence behind material decisions.

## Current status

**Development foundation with a data-backed MVP slice — not production-ready.**

The development branch includes:
- Email/password sign-up and sign-in through Supabase Auth when public environment configuration is supplied.
- Portfolio creation and portfolio-scoped venture records.
- Evidence records and decision history.
- Evidence-linked stage-review proposals with owner/admin approval before lifecycle-stage transitions.
- PostgreSQL migrations, RLS policies, restricted grants, audit triggers and a disposable PostgreSQL authorization test suite.
- Product, architecture, security, lifecycle, cost and operational documentation.

The app does not yet implement the full portfolio roadmap. Customer acquisition, finance/ledger, operations, organization/role management, integrations, MFA policy configuration, production observability, staging deployment and disaster-recovery drills remain incomplete. The remote Supabase project and live Cloudflare Worker have not been modified by this branch.

## Product principles

- Evidence before scale; customer behavior is more meaningful than vanity metrics.
- No invented venture counts, financial figures, testimonials or traction.
- Distinguish portfolios, ventures, legal entities, brands and projects.
- Make cash, revenue, profit, funding, loans and commitments separately visible.
- Enforce access in the database and server, not just in the interface.
- Keep AI recommendations sourced, dated, uncertain where appropriate and subject to human approval for consequential actions.
- Preserve audit history for material financial, access and portfolio decisions.

## Technology

- React + TypeScript + Vite.
- Supabase Auth/PostgreSQL with explicit grants, RLS and versioned migrations.
- Cloudflare hosting/server-side services only after staging and deployment boundaries are verified.
- GitHub Actions for type checks, unit tests, production build and isolated PostgreSQL authorization tests.

## Local development

Requires Node.js 20.19+.

```sh
npm install
npm run typecheck
npm test
npm run build
npm run dev
```

The npm lockfile is committed on this development branch. CI uses `npm ci` against the lockfile for subsequent validation runs.

## Environment

Copy `.env.example` to `.env.local` and fill only browser-safe public values:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (publishable/legacy anon key only)

Never place a Supabase `service_role` key, provider secret or privileged credential in a `VITE_*` variable or client bundle. The application intentionally shows an unconnected preview when public configuration is absent.

## Documentation

- [Product requirements](docs/product/product-requirements.md)
- [System architecture](docs/architecture/system-architecture.md)
- [Data model](docs/architecture/data-model.md)
- [Venture lifecycle](docs/product/venture-lifecycle.md)
- [Financial control model](docs/finance/financial-control-model.md)
- [Security threat model](docs/security/threat-model.md)
- [Access-control matrix](docs/security/access-control-matrix.md)
- [Implementation roadmap](docs/roadmap/implementation-roadmap.md)
- [Verification report](docs/quality/verification-report.md)

## Release policy

A feature is not complete because a file exists. It must be built, tested, reviewed against its acceptance criteria, and verified in the target environment. Candidate migrations must be applied to an isolated Supabase staging branch and reviewed with Supabase security advisors before any remote project is changed. Production release requires separate authorization after staging and security gates pass.
