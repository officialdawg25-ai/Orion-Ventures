# DAWG 360° — Multipreneur Portfolio Operating System

DAWG 360° is an evidence-led operating system for managing a portfolio of ventures. Its purpose is to help the owner decide what to validate, launch, grow, maintain, repair, pause, restructure, sell or close — with traceable evidence behind material decisions.

## Current status

**Foundation preview — not production-ready.**

The current branch contains an initial React/TypeScript interface shell and architecture/security/roadmap documentation. The app is not connected to live Supabase records. Authentication, database migrations, authorization policies, financial workflows, acquisition workflows, CI execution, staging and production deployment are not complete. The live Cloudflare Worker remains separate and must not be treated as the deployed app.

## Product principles

- Evidence before scale; customer behavior is more meaningful than vanity metrics.
- No invented venture counts, financial figures, testimonials or traction.
- Distinguish portfolios, ventures, legal entities, brands and projects.
- Make cash, revenue, profit, funding, loans and commitments separately visible.
- Enforce access in the database and server, not just in the interface.
- Keep AI recommendations sourced, dated, uncertain where appropriate and subject to human approval for consequential actions.
- Preserve audit history for material financial, access and portfolio decisions.

## Technology direction

- React + TypeScript + Vite.
- Supabase Auth/PostgreSQL with explicit grants, RLS and versioned migrations.
- Cloudflare hosting/server-side services only after staging and deployment boundaries are verified.
- Automated type, unit, integration, authorization, accessibility and release checks.

## Development

Requires Node.js 20.19+.

```sh
npm install
npm run typecheck
npm test
npm run build
npm run dev
```

The lockfile and successful execution of these commands must be added/verified before treating this as a reproducible build.

## Environment variables

Copy `.env.example` to `.env.local` for local development and fill only browser-safe public values. Never place a Supabase `service_role` key, provider secret or privileged credential in a `VITE_*` variable or client bundle.

## Documentation

- [System architecture](docs/architecture/system-architecture.md)
- [Security threat model](docs/security/threat-model.md)
- [Venture lifecycle](docs/product/venture-lifecycle.md)
- [Implementation roadmap](docs/roadmap/implementation-roadmap.md)

## Release policy

A feature is not complete because a file exists. It must be built, tested, reviewed against its acceptance criteria, and verified in the target environment. Production release requires a separate authorization after staging and security gates pass.
