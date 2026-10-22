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
- [ ] Add automated production-readiness checks to CI
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
- [ ] Add security headers and production configuration review

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
- [ ] Final responsive/mobile UX pass
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
- [ ] Payment receipt generation
- [x] Batch assignment
- [ ] Faculty assignment
- [ ] Student transfer workflow
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

- [ ] Manual student attendance
- [ ] Attendance correction workflow
- [ ] Attendance reports
- [ ] Employee attendance
- [ ] Employee attendance location evidence
- [ ] Employee attendance image evidence
- [x] No GPS/live tracking requirement

## 8. Exams & Results

- [ ] Exam creation
- [ ] MCQ questions
- [ ] Descriptive questions
- [ ] Negative marking configuration
- [ ] Exam timer
- [ ] Pass-mark configuration
- [ ] Retake rules
- [ ] Automatic result calculation
- [ ] Result publishing
- [ ] Result reports

## 9. Certificates

- [ ] Certificate template management
- [ ] Automatic certificate eligibility
- [ ] Certificate number generation
- [ ] QR verification
- [ ] Public certificate verification page
- [ ] Faculty certificate issuance workflow
- [ ] Certificate download

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
- [ ] Receipts/invoices

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

- [ ] AI tutor restricted to enrolled course/syllabus
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

## Current Build Queue

> Stabilization update (2026-10-22): fixed ERP topbar build syntax, migrated Next.js middleware to proxy, fixed the student login redirect loop, removed unnecessary forced-dynamic flags from shared dashboard/student shells, and added the Admissions operations workspace. Performance and operational ERP build now proceed before payment completion.

1. [x] Verify enrollment/payment foundation in CI.\n2. [x] Build the first premium academic course/batch operations workspace.
3. [x] Separate offline students, online students and employees into dedicated operational pages.
4. [x] Add real offline admission-to-fee-ledger transaction foundation and payment validation.
5. [ ] Apply and verify the new Prisma fee schema on the production Neon database.
3. [x] Record the verified enrollment/payment foundation restore point.
4. [x] Build pending online enrollment state.
5. [x] Add PhonePe/Razorpay-ready payment provider abstraction and configuration checks.
6. [ ] Implement PhonePe checkout creation using the current official API.
7. [ ] Implement payment callback/webhook verification.
8. [ ] Activate enrollment only after verified payment.
9. [ ] Add payment failure/retry handling.
10. [ ] Add enrollment/payment student UI.
11. [ ] Verify CI and record the next restore point.

## Restore Point Policy

A restore point is created only after the relevant build has passed verification. The restore point records the exact Git commit and scope. Future work must not silently replace or rewrite an existing checkpoint.
