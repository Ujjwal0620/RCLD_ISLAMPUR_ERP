# Restore Points

This file records stable Git commits that can be used as restore points for the RCLD Islampur ERP.

## Restore Point: LMS Content Manager v0.3

- **Commit:** `867798bfd2d491349e2f8d3574de426e007023b4`
- **Date:** 2026-10-21
- **Status:** Stable checkpoint
- **Scope:** LMS module/lesson create, edit, publish/draft, delete, YouTube validation, audit logging and admin content-management UI.
- **Branch:** `main`

### Restore procedure

If a future build must be rolled back, restore `main` to the exact checkpoint commit after reviewing the changes made after it. Database changes must be handled separately and must never be assumed reversible from a Git rollback alone.

### Rule

Every major completed build should receive a documented restore point before the next major feature area is started. Do not overwrite an existing restore point.


## Restore Point: Enrollment & Payment Foundation v0.4

- **Commit:** `af710dd340941ff9d40cf4110161e48c44889304`
- **Date:** 2026-10-21
- **Status:** Stable checkpoint — GitHub Actions build passed
- **Scope:** Pending online enrollment state, authenticated enrollment API foundation, enrollment UI state handling, payment-provider abstraction/configuration checks, and PhonePe/Razorpay environment placeholders.
- **Branch:** `main`
- **CI:** Workflow run `39555629133` completed successfully, including dependency install, Prisma client generation, and Next.js production build.

### Database note

The application schema now expects new online enrollments to default to `PENDING`. Git rollback does not roll back the Neon production database. Production schema alignment must be handled and verified separately before payment activation is treated as production-ready.
