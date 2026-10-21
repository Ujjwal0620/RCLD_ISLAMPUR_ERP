# Security & Audit

## Principles
Least privilege, server-side authorization, defense in depth, validation, secure defaults, auditability and minimal data exposure.

## Authentication
Secure password hashing, session protection, recovery controls, rate limiting and security-event logging. Consider MFA for Superadmin before production.

## Authorization
RBAC checks occur on server actions/routes/data access, not only UI.

## Sensitive Data
Keep secrets outside source control. Limit exposure of personal, attendance-image, payroll and financial data.

## Uploads
Validate file type/size, generate safe object names, restrict access, and scan/inspect as appropriate before AI ingestion or user distribution.

## Finance
Verify gateway events server-side, use idempotency where applicable, audit adjustments/refunds and reconcile provider transactions.

## Attendance Location/Image
Collect only for attendance verification, disclose purpose to employees, define retention/access policy, and do not implement continuous tracking.

## Audit Events
Prioritize authentication/security changes, role/permission changes, discounts, fee adjustments, refunds, batch transfers, attendance corrections, payroll, certificate issuance/revocation, CMS publishing, AI knowledge changes and configuration changes.

## Data Lifecycle
Prefer archive/status/history over destructive deletion for business records. Define backup and retention policies before production.
