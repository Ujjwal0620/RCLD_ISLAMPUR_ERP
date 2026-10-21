# v0.1 Implementation Guide

## Current Foundation
The repository now contains a Next.js JavaScript application foundation with:
- Public glassmorphism landing page
- Login UI
- JWT-based HTTP-only cookie session foundation
- Protected dashboard route
- Prisma + Neon PostgreSQL schema foundation
- Superadmin/role/permission seed
- Initial course master seed
- Audit-log foundation
- Environment variable template

## Local Setup
1. Install Node.js 20+.
2. Copy `.env.example` to `.env.local`.
3. Configure `DATABASE_URL` and a strong `AUTH_SECRET`.
4. Set seed Superadmin values.
5. Run `npm install`.
6. Run `npm run db:generate`.
7. Run `npm run db:push`.
8. Run `npm run db:seed`.
9. Run `npm run dev`.

Never commit `.env.local` or real credentials.

## Coding Rules
- JavaScript only.
- Prefer Server Components by default.
- Use Client Components only for interactive browser behavior.
- Keep business logic outside presentation components.
- Use server-side authorization for every protected operation.
- Validate external/user input.
- Use Prisma for database access.
- Keep integrations behind provider/service adapters.
- Never put API keys in client code.
- Avoid destructive deletion for business records.
- Add audit events for sensitive changes.
- Update documentation when business rules or architecture change.

## Module Boundaries
Future implementation should organize code around domain modules rather than one large generic utility layer.

Recommended:
`src/modules/<domain>` or a similarly consistent structure, with route handlers/server actions calling domain services.

## v0.1 Acceptance Criteria
- Application starts with valid environment variables.
- Public landing page renders.
- Unauthenticated access to /dashboard redirects to /login.
- Seeded Superadmin can sign in.
- Authenticated user can reach dashboard.
- Superadmin role has all seeded permissions.
- Initial course codes exist after seeding.
- Audit log is written on successful login.

## Next Build Slice
Implement the Superadmin control plane:
- dashboard navigation
- user management
- role management
- permission management
- course management
- system settings
- audit log viewer

Then proceed to CRM/admission and student/batch workflows.
