# Users, Roles & RBAC

## Core Account Types
1. Superadmin
2. Employee/Admin user
3. Offline student
4. Online student

## Authorization Model
Use RBAC with many-to-many user-role assignment and role-permission assignment. A single employee may hold multiple roles.

Example custom roles:
- Faculty
- Accountant
- Receptionist
- Counsellor
- Exam Controller
- HR
- Inventory Manager
- CMS Editor

These are examples, not hard-coded permanent roles.

## Superadmin
Superadmin can manage users, roles, permissions, courses, discount authority, system configuration, CMS publishing rights, integrations, audit access and AI governance.

## Permission Domains
Suggested permission naming:
- students.view/create/update/archive
- admissions.manage
- courses.view/manage
- discounts.approve
- batches.manage/transfer
- attendance.student.manage/correct
- fees.view/collect/adjust/refund
- finance.view/manage
- crm.view/manage/assign
- employees.view/manage
- attendance.employee.review
- leave.approve
- payroll.manage
- tasks.create/assign/review
- exams.create/manage/publish
- certificates.issue/revoke
- lms.content.manage
- cms.edit/publish
- inventory.manage
- reports.view/export
- ai.knowledge.manage
- ai.analytics.organization
- roles.manage
- audit.view

## Rules
- UI visibility is not security; permissions must be enforced server-side.
- Sensitive operations require audit events.
- Financial permissions should be separated from ordinary content permissions.
- Superadmin may grant/revoke CMS publishing rights.
- Students can access only records belonging to their account/enrollments.
