# RCLD Islampur ERP — Master Build TODO

> Legend: `[x]` completed and verified, `[ ]` pending.  
> Development policy: keep the active development branch as `main`; complete and verify one scope before moving to the next.

## 0. Engineering & Release Control

- [x] Keep one active development branch: `main`
- [x] Establish the initial baseline restore point
- [x] Record restore points in repository documentation
- [x] Add a master checkbox-based build tracker
- [ ] Add a restore point after every major verified build
- [ ] Keep database migration history aligned with application releases
- [x] Add automated production-readiness checks to CI
- [ ] Add release/changelog documentation for every major milestone

## 1. Foundation & Security

- [x] Next.js + React application foundation
- [x] Prisma + PostgreSQL/Neon data layer
- [x] ERP authentication
- [x] Online student authentication
- [x] Role/permission framework
- [x] Superadmin permission bypass
- [x] Protected dashboard routes
- [x] Audit logging foundation
- [ ] Complete security hardening and authorization review
- [ ] Add rate limiting for authentication and sensitive APIs
- [x] Add security headers and production configuration review

## 2. Public Website

- [x] Public homepage
- [x] Public navbar/footer
- [x] About page
- [x] Learning page
- [x] FAQ page
- [x] Contact page
- [x] Public course listing
- [x] Public course details
- [x] SEO metadata
- [x] Sitemap
- [x] Robots configuration
- [ ] Final responsive/mobile UX pass\n- [x] ERP loading/error resilience states
- [ ] Final SEO/GEO content pass
- [ ] Public enquiry/lead capture integration

## 3. Online Student Platform

- [x] Student registration
- [x] Student login/logout
- [x] Student dashboard
- [x] Course enrollment API foundation
- [x] Pending enrollment state
- [x] Active enrollment access control
- [x] Protected course workspace
- [x] Protected lesson player
- [x] YouTube lesson support
- [x] Lesson completion/progress tracking
- [ ] Enrollment confirmation workflow
- [x] Payment gateway abstraction
- [ ] PhonePe integration
- [ ] Payment callback/webhook verification
- [ ] Paid enrollment activation
- [ ] Payment failure/retry handling
- [ ] Course progress dashboard
- [ ] Notes/PDF resources
- [ ] Assignments
- [ ] Quizzes
- [ ] Downloads
- [ ] Notices
- [ ] Doubt/question workflow
- [ ] Online student profile management

## 4. LMS Administration

- [x] Course content manager
- [x] Module creation
- [x] Module editing
- [x] Module publish/draft control
- [x] Module deletion
- [x] Lesson creation
- [x] Lesson editing
- [x] Lesson publish/draft control
- [x] Lesson deletion
- [x] YouTube URL validation
- [x] LMS audit logging
- [ ] Course-level publishing controls
- [ ] Drag/reorder modules and lessons
- [ ] Rich lesson resources management
- [ ] PDF/document upload management
- [ ] Assignment management
- [ ] Quiz/question management
- [ ] Teacher/faculty content permissions
- [ ] Content preview before publishing

## 5. Admission & Student ERP

- [ ] Public admission/enquiry form
- [x] Student master record
- [x] Offline vs online student separation
- [x] Course selection
- [x] Admission fee configuration
- [x] Discount approval by Superadmin
- [x] Installment fee configuration
- [x] Payment receipt generation
- [x] Batch assignment
- [x] Faculty assignment
- [x] Student transfer workflow
- [ ] Dropout workflow
- [ ] Student status lifecycle

## 6. Courses & Batches

- [x] Initial course catalogue
- [x] Course settings CRUD
- [ ] Course fee management
- [ ] Course eligibility management
- [ ] Course duration management
- [x] Batch creation
- [x] Batch capacity management
- [ ] Batch faculty assignment
- [ ] Batch transfer workflow
- [ ] Batch status management

## 7. Attendance

- [x] Manual student attendance
- [x] Attendance correction workflow
- [x] Attendance reports
- [x] Employee attendance
- [x] Employee attendance location evidence
- [x] Employee attendance image evidence
- [x] No GPS/live tracking requirement

## 8. Exams & Results

- [x] Exam creation
- [x] MCQ questions
- [x] Descriptive questions
- [x] Negative marking configuration
- [x] Exam timer
- [x] Pass-mark configuration
- [x] Retake rules
- [x] Automatic result calculation
- [x] Result publishing
- [x] Result reports

## 9. Certificates

- [ ] Certificate template management
- [x] Automatic certificate eligibility
- [x] Certificate number generation
- [x] QR verification
- [x] Public certificate verification page
- [x] Faculty certificate issuance workflow
- [x] Certificate download

## 10. Roles, Employees & Permissions

- [x] Role/permission foundation
- [ ] Employee master
- [ ] Multiple roles per employee
- [ ] Custom role creation
- [ ] Custom permission assignment
- [ ] Teacher/faculty permissions
- [ ] Employee dashboard
- [ ] Permission audit/reporting

## 11. CRM

- [ ] Lead capture
- [ ] Enquiry management
- [ ] Lead source tracking
- [ ] Counsellor assignment
- [ ] Follow-up scheduling
- [ ] Conversion tracking
- [ ] Admission conversion analytics

## 12. Finance & Payments

- [x] Fee ledger
- [x] Installment management
- [x] Cash payment
- [x] UPI/manual payment
- [ ] PhonePe
- [x] Razorpay-ready abstraction
- [ ] Refund workflow
- [ ] Payment reconciliation
- [ ] Financial reports
- [x] Receipts/invoices

## 13. Communication

- [ ] Transactional email foundation
- [ ] Admission email
- [ ] Payment confirmation email
- [ ] Course enrollment email
- [ ] Notice email
- [ ] SMS provider abstraction
- [ ] WhatsApp provider abstraction
- [ ] Communication templates

## 14. Library, Inventory & Assets

- [ ] Library management
- [ ] Book issue/return
- [ ] Inventory management
- [ ] Asset register
- [ ] Lab equipment register
- [ ] Asset assignment
- [ ] Maintenance records

## 15. Payroll & Leave

- [ ] Employee salary structure
- [ ] Payroll processing
- [ ] Payslip generation
- [ ] Leave types
- [ ] Leave requests
- [ ] Leave approval
- [ ] Leave balance

## 16. AI Features

- [x] Workspace AI assistant foundation across ERP sections\n- [ ] AI tutor restricted to enrolled course/syllabus
- [ ] Faculty knowledge ingestion
- [ ] Admin knowledge ingestion
- [ ] Employee assistant
- [ ] Organization analytics assistant
- [ ] AI access permissions
- [ ] AI usage/audit controls

## 17. Localization

- [ ] English
- [ ] Hindi
- [ ] Bengali
- [ ] Language selector
- [ ] Translation management

## 18. Storage & Media

- [x] YouTube video embedding
- [ ] Neon object storage integration
- [ ] Secure file upload
- [ ] Course resource storage
- [ ] Document lifecycle management
- [ ] Image/media management

## 19. Quality & Deployment

- [x] GitHub Actions build
- [x] Prisma client generation in CI
- [x] Next.js production build verification
- [ ] Production environment variable audit
- [ ] Neon production schema migration
- [ ] Vercel deployment verification against current `main`
- [ ] Production smoke tests
- [ ] Authentication smoke tests
- [ ] Enrollment smoke tests
- [ ] LMS smoke tests
- [ ] Payment sandbox tests
- [ ] Restore/rollback drill
- [ ] Final production readiness checklist

## UI / Theme Modernization

- [x] Premium ERP workspace theme primitives
- [x] Premium certificate operations UI
- [x] Dark premium ERP and student authentication experiences
- [x] Public credential verification dark experience
- [ ] Complete public website dark/premium visual pass
- [ ] Complete ERP module-by-module visual consistency pass
- [ ] Complete student portal visual consistency pass
- [ ] Accessibility, keyboard and responsive polish pass

## Current Build Queue

> Audit update (2026-10-22): current development remains on `main`. The latest audit identified and fixed a missing navigation icon import that could fail the Vercel build. Global ERP/student workspace assistant support, loading/error resilience, production headers and Prisma validation in CI have been added. Vercel verification is still pending.

1. [x] Verify enrollment/payment foundation in CI.
2. [x] Build premium academic course/batch operations workspace.
3. [x] Separate offline students, online students and employees into dedicated operational pages.
4. [x] Add offline admission-to-fee-ledger transaction foundation.
5. [x] Add installment overpayment validation.
6. [x] Add global workspace assistant without exposing implementation/model details.
7. [x] Add dashboard/student loading and error recovery states.
8. [x] Add production security headers and compression.
9. [x] Add Prisma schema validation to CI.
10. [ ] Apply and verify the fee schema against the production Neon database.
11. [ ] Verify the current Vercel deployment successfully.
12. [ ] Promote a new verified restore point after CI + Vercel pass.
13. [ ] Implement PhonePe checkout creation using the current official API.
14. [ ] Implement payment callback/webhook verification.
15. [ ] Activate online enrollment only after verified payment.
16. [ ] Add payment failure/retry handling.
17. [x] Build fee collection UI and printable receipts.
18. [x] Build faculty assignment and batch transfer workflow.
19. [x] Build manual student attendance and reports.
20. [x] Build employee attendance and evidence workflow.
21. [x] Build exams/results.
22. [x] Build certificates and public QR verification.
23. [ ] Build CRM lead/follow-up/conversion workflow.
24. [ ] Build communication, inventory, payroll and leave modules.
25. [ ] Build AI tutor knowledge restrictions, admin analytics and employee assistant workflows.
26. [ ] Complete localization, object storage and production smoke tests.
27. [ ] Complete final production readiness and rollback drill.

## Restore Point Policy

A restore point is promoted only after the relevant build passes verification. The currently documented safe rollback point is recorded in `docs/RESTORE_POINTS.md`; unverified changes remain explicitly marked as such.
