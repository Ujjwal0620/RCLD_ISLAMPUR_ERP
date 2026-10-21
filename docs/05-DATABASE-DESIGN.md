# Database Design — Conceptual Model

This document defines conceptual entities. Exact Prisma schema will be created during implementation.

## Identity & Access
User, Account/Profile, Role, Permission, UserRole, RolePermission, Session/SecurityEvent.

## Organization
Organization/Centre, SystemSetting, AcademicSession.

## Students & Admissions
Lead, AdmissionApplication, Student, StudentDocument, StudentStatusHistory, OfflineStudentAccount, OnlineStudentProfile.

## Courses
Course, CourseFee, CourseModule, Chapter, Topic, LearningResource.

## Batches
Batch, BatchFaculty, BatchEnrollment, BatchTransfer, DropoutRecord, ClassSession, StudentAttendance.

## Fees & Finance
FeePlan, FeeInstallment, Discount, DiscountApproval, Payment, PaymentAllocation, Receipt, Refund, Expense, IncomeEntry, FinancialAccount, CashbookEntry, GatewayTransaction, ReconciliationRecord.

## Employees
Employee, EmployeeRoleAssignment, EmployeeAttendance, AttendancePhoto, BreakSession, OutingSession, LeaveRequest, LeaveBalance, PayrollRun, Payslip, SalaryComponent.

## Tasks
Task, TaskAssignment, TaskChecklist, TaskComment, TaskAttachment, TaskActivity.

## Exams
Exam, ExamSection, Question, Option, ExamAttempt, Answer, Result, Certificate, CertificateIssueEvent.

## LMS
OnlineCourseOffering, OnlineOrder, OnlineEnrollment, Lesson, LessonProgress, Assignment, Submission, Quiz, Doubt, Announcement.

## CRM
LeadSource, Campaign, Lead, LeadAssignment, FollowUp, PipelineStage, LeadActivity, Conversion.

## CMS
Page, PageRevision, Banner, GalleryItem, FAQ, Testimonial, Notice, SEORecord, Translation.

## Inventory
AssetCategory, Asset, AssetAssignment, MaintenanceRecord, Book, BookIssue, Consumable, StockTransaction.

## AI
KnowledgeSource, KnowledgeDocument, KnowledgeChunk/IndexReference, AIConversation, AIMessage, AIToolAudit, AIConfiguration.

## Audit
AuditLog should capture actor, action, resource type/id, timestamp and relevant before/after metadata for sensitive operations.

## Data Rules
- Prefer status/history records over destructive deletion for operational data.
- Money uses fixed-precision decimal, never floating point.
- Store timestamps consistently.
- Student batch transfers and financial adjustments retain history.
- Registration-number format remains configurable until supplied.
