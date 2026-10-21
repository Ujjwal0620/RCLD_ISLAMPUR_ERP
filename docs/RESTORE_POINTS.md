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
