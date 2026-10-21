# System Architecture

## Stack
- Next.js App Router
- JavaScript
- Neon PostgreSQL
- Prisma ORM
- Tailwind CSS
- Validation layer such as Zod
- Neon-compatible object storage for documents/images, subject to final integration verification
- YouTube links for recorded video initially
- Groq API behind an internal AI provider abstraction
- PhonePe first payment provider; Razorpay-ready abstraction
- Vercel for testing; Hostinger-targeted production deployment subject to final hosting capabilities

## Architecture Style
Start as a modular monolith. Keep modules separated by domain while sharing one application and database. Avoid premature microservices.

## Suggested Application Domains
auth, users, roles, students, admissions, courses, batches, attendance, fees, payments, finance, crm, employees, leave, payroll, tasks, exams, certificates, lms, cms, inventory, notifications, ai, audit, reports, settings.

## Integration Rule
External services must be accessed through adapters/provider interfaces. Business logic should not depend directly on PhonePe, Groq, email vendors or storage implementation.

## Video Note
Do not assume YouTube Private videos work for arbitrary enrolled users. Final video access strategy must be validated. Application authorization must never be represented as equivalent to YouTube privacy.

## Environment
Secrets live in environment variables and never in Git. Maintain .env.example with names only.

## Future Readiness
Keep a centre/organization boundary in important records where practical so future multi-branch migration does not require rewriting all domains, while V1 UI remains single-centre.
