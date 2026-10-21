# Testing, Deployment & Restore

## Environments
Local development -> Vercel/testing environment -> production target (Hostinger, subject to final Next.js runtime/database/storage compatibility).

Keep production and test data/configuration separate.

## Testing
- Unit tests for business rules.
- Integration tests for database/services.
- Authorization tests for every sensitive module.
- Payment webhook/status tests.
- End-to-end tests for critical journeys.
- Accessibility/responsive checks.
- Security and upload validation tests.

Critical journeys include admission, fee collection, batch transfer, attendance, exam/result, certificate issue, CRM conversion, employee attendance, payroll, online purchase/enrollment and permission changes.

## Restore Points
Use Git history plus milestone tags/releases rather than backup folders committed into source.

Suggested milestones:
v0.1-foundation
v0.2-admission-crm
v0.3-fees-finance
v0.4-hr-tasks
v0.5-exams-certificates
v0.6-lms
v0.7-cms
v0.8-ai
v0.9-hardening
v1.0-production

## Database Backup
Git does not back up the database or object storage. Before production, document Neon backup/restore capabilities, retention, exports and object-storage recovery procedures, and test restoration.

## Change Management
Update documentation with significant architecture/business-rule changes. Maintain changelog/release notes for milestones.
