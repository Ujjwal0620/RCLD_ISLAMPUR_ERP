# RCLD Islampur ERP

A unified digital platform for **RCLD Islampur** covering the public website/CMS, offline student ERP, CRM, admissions, courses and batches, fees and finance, employee HR/payroll, tasks, exams/certificates, online LMS, inventory and AI-assisted workflows.

## Documentation

The project requirements and architecture are maintained in **[docs/README.md](./docs/README.md)**.

> The `/docs` directory is the project's permanent source of truth. Major business-rule, permission, architecture and integration changes must be documented there.

## Initial User Types

- **Superadmin** — complete system governance, roles, permissions and configuration.
- **Employees / Teachers / Admin users** — may hold multiple Superadmin-configured roles.
- **Offline Students** — admission, batch, attendance, fees, learning, exams and certificates.
- **Online Students** — separate accounts for online course purchase and LMS access.

## Initial Course Codes

CCA, DCA, ADCA, CCC, CAO, DWPD, DOM, DCST, DCAP and DHNT.

Course details are configurable and will be finalized later.

## Planned Stack

- Next.js App Router
- JavaScript
- Neon PostgreSQL
- Prisma
- Tailwind CSS
- Object storage for images/documents
- YouTube-hosted recorded lessons initially
- PhonePe initially, with payment-provider abstraction for Razorpay
- Groq API through an AI-provider abstraction
- Vercel for testing; production hosting finalized later

## Status

**SDLC Phase: Requirements & System Design**

Implementation should follow the approved documentation and phased roadmap in `/docs`.
