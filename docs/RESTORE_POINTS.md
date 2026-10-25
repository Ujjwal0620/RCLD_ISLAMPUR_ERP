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



## Recovery Checkpoint: Exam Build Repair — 2026-10-22

- **Commit:** `0ee9f64cb49d4067e53a34d45de18094938e6ee9`
- **Date:** 2026-10-22
- **Status:** Recovery checkpoint — CI verification in progress; do not treat as a stable production checkpoint until CI passes.
- **Scope:** Repairs the malformed JSX in the exam management studio that caused the GitHub Actions production build to fail. This checkpoint preserves the current ERP state through exams/results, attendance, fee collection, batch/faculty workflows and the global workspace assistant.
- **Branch:** `main`
- **CI run:** `39720917878` — currently in progress.
- **Vercel:** Deployment remains rate-limited by the Vercel account/build limit; this is external to the application source and cannot be cleared by a code change.

## Restore Point: Enrollment & Payment Foundation v0.4

- **Commit:** `af710dd340941ff9d40cf4110161e48c44889304`
- **Date:** 2026-10-21
- **Status:** Stable checkpoint — GitHub Actions build passed
- **Scope:** Pending online enrollment state, authenticated enrollment API foundation, enrollment UI state handling, payment-provider abstraction/configuration checks, and PhonePe/Razorpay environment placeholders.
- **Branch:** `main`
- **CI:** Workflow run `39555629133` completed successfully, including dependency install, Prisma client generation, and Next.js production build.

### Database note

The application schema now expects new online enrollments to default to `PENDING`. Git rollback does not roll back the Neon production database. Production schema alignment must be handled and verified separately before payment activation is treated as production-ready.


## Recovery Checkpoint: Pre V1 Deep Business Logic — 2026-10-25

- **Commit:** `605b552bb06b637125b5fccac22235e921d51ec9`
- **Branch:** `restore/2026-10-25-pre-v1-deep-business-logic`
- **Status:** Recovery checkpoint (not promoted as a new stable production restore point)
- **Scope:** State immediately before required-skill mapping, chapter-progress tracking, substitution logic and timetable-history work.
- **Purpose:** Allows code rollback if the current deep-business-logic build needs to be abandoned.
- **Database note:** Git rollback does not reverse PostgreSQL schema/data changes. Database changes must be handled separately.

A post-development restore point must only be promoted after Prisma validation, production build and local runtime checks pass.
