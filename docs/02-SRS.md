# Software Requirements Specification (SRS)

## Scope
The system combines a public website/CMS, ERP, CRM, HR/payroll, finance, examination/certification, LMS, inventory/assets, communications and AI capabilities.

## Functional Requirements

### Authentication & Accounts
- Secure login/logout and account recovery.
- Separate offline-student and online-student accounts.
- Employees can hold multiple roles.
- Superadmin controls roles and granular permissions.
- Session and security events must be auditable.

### Offline Student Lifecycle
Lead/Admission -> Student Profile -> Course -> Discount -> Fee Plan -> Payment -> Batch -> Attendance -> Learning Resources -> Exam -> Result -> Certificate.

### Course Management
Superadmin-authorized users can create, edit, archive and configure courses, duration, eligibility, fee structures, syllabus/modules and delivery modes. Course selection uses database-driven dropdowns.

### Batch Management
- Default maximum capacity: 50; configurable.
- Faculty may teach multiple batches.
- Students may transfer batches.
- Transfer history records old/new batch and faculty, date, reason and approver.
- Dropout status and history must be retained.

### Student Attendance
Teachers manually record student attendance by batch/session. Corrections require permission and audit history.

### Fees & Payments
Admission fees and installment plans are supported. Installment rules are configurable by authorized admin users. Superadmin controls discount authority. Cash, UPI/manual and gateway payments must be recordable. PhonePe is the initial online gateway; provider abstraction should permit Razorpay later.

### Employee Operations
Employee web attendance, centre-location validation, attendance image, breaks, office/personal out-time, returns, leave, payroll, task tracking and performance reports.

### Examinations
Faculty configures exam rules including question set, timing, pass marks and optional negative marking. Initial online assessment emphasis is MCQ; the model must remain extensible for other question types.

### Certificates
After qualifying conditions are met, faculty can issue a generated certificate. Certificate records should support unique certificate number, QR verification and public verification.

### Online LMS
Separate online registration/profile, course catalog, one-time purchase initially, enrollment, recorded lessons, PDFs, assignments, quizzes, downloads, doubt questions, notices, progress and exams/certificates. Offline users do not automatically share online accounts.

### CRM
Lead capture, source/campaign, assignment, pipeline, follow-up, counselling, reminders, notes, conversion/lost reason and conversion-to-admission.

### CMS
Permission-controlled management of pages, banners, courses, gallery, notices, FAQs, testimonials, contact/social information and SEO metadata. Publishing is permission-controlled by Superadmin.

### Inventory
Assets/books/computers/lab equipment/consumables, issue/return, assignment, maintenance and lifecycle tracking.

### Communication
Prepare provider architecture for Email, SMS and WhatsApp. Email is first priority.

### Languages
English, Hindi and Bengali.

### AI
AI Knowledge Center, course-aware student tutor, employee assistant, faculty assistance and permission-aware Superadmin analytics.

## Non-Functional Requirements
- Responsive desktop/mobile UI.
- Strong RBAC and server-side authorization.
- Input validation and secure secret handling.
- Audit logs for sensitive operations.
- Reliable financial transaction handling and reconciliation.
- Search/filter/pagination for operational tables.
- Accessibility and performance-conscious glassmorphism.
- SEO-friendly public pages.
- Backup/restore procedures.
- Modular, documented JavaScript codebase.
