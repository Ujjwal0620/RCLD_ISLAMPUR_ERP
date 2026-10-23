# Roadmap & Open Decisions

## Delivery Roadmap
1. Foundation: Next.js, database, auth, RBAC, layout, settings, audit.
2. CRM + admission + students + courses + batches.
3. Fees + PhonePe + finance.
4. Employee HR + attendance + breaks/out-time + tasks + leave + payroll.
5. Exams + results + certificates.
6. Online LMS.
7. CMS + public site + multilingual + SEO/GEO.
8. AI Knowledge Center + tutors/assistants/analytics.
9. Inventory/assets + advanced reports/accounting.
10. Communications, hardening, production migration and launch.

## Known Decisions
- One physical centre now.
- Future multi-branch expansion should remain possible.
- JavaScript, not TypeScript.
- Next.js + Neon PostgreSQL.
- Default batch capacity 50.
- Student attendance is teacher-recorded.
- Employee attendance uses web + centre-location validation + image.
- No continuous employee GPS tracking.
- PhonePe first; Razorpay later.
- Email first; SMS and WhatsApp prepared for later activation.
- English, Hindi and Bengali.
- Separate online/offline student accounts.
- Superadmin-controlled multi-role RBAC.
- Vercel testing; Hostinger intended later.
- Groq initial AI provider.
- Official course names and base offline fees are recorded in `docs/COURSES.md`.
- Course discounts are generic percentage/fixed amounts and Superadmin-only.
- Existing fee ledgers preserve the pricing snapshot taken at admission.

## Open Decisions / Inputs Required
- Official admission form fields.
- Course duration, eligibility, online fees, admission fees and detailed syllabus (official names and base offline fees are in `docs/COURSES.md`).
- Official Coding for Kids code and fee; current `CFK` code is provisional and the course remains unpublished.
- Official student registration-number format.
- Final certificate-number format/template.
- Exact institute coordinates and permitted attendance geofence.
- Final PhonePe integration/account configuration.
- Email/SMS/WhatsApp providers and sender configuration.
- Final domain and production hosting configuration.
- YouTube/video privacy strategy.
- Exact accounting policies, tax/GST requirements if applicable.
- Salary/leave policy details.
- Official certificate design.
- Data retention policy for attendance images and documents.

These open items must remain configurable and must not be guessed into permanent business logic.
