# Official Course Catalogue

This document is the source of truth for the RCLD Islampur course catalogue supplied from the institute brochure.

| Code | Official course name | Duration | Base fee (INR) | Launch discount |
| --- | --- | --- | ---: | --- |
| CCA | Certificate in Computer Application | 6 Months | 2,500 | — |
| DCA | Diploma in Computer Application | 12 Months | 4,500 | — |
| ADCA | Advance Diploma in Computer Application | 12 Months | 6,000 | — |
| CCC | Certificate Course in CAD | 3 Months | 5,000 | — |
| CAO | Certificate in Accounts Operation | 6 Months | 5,500 | — |
| DWPD | Diploma in Webpage Development | 12 Months | 12,000 | — |
| DOM | Diploma in Office Management | 12 Months | 9,000 | — |
| DCST | Diploma in Computer Science & Technology | 12 Months | 14,000 | 50% |
| DCAP | Diploma in Computer Account Professional | 12 Months | 16,500 | 50% |
| DHNT | Diploma in Hardware Networking Technology | 12 Months | 20,900 | 50% |

## Curriculum supplied by the RCLD brochure

### CCA
- Computer Fundamentals (Basic)
- MS-DOS
- MS-Windows
- MS-Office (Word, Excel, PowerPoint)
- Internet & E-mail

### DCA
- Computer Fundamentals (Basic)
- MS-Windows, MS-DOS
- MS-Office (Word, Excel, PowerPoint & Access)
- Blue Java, HTML, Internet & E-mail

### ADCA
- Computer Fundamentals (Basic), MS-DOS
- MS-Windows
- MS-Office (Word, Excel, PowerPoint, Access)
- Basics of C, Visual Basic 6.0, VB.NET
- Internet & E-mail

### CCC
- Computer Fundamentals (Basic)
- MS-Windows
- Introduction to AutoCAD
- Concept of Drawing Using AutoCAD
- Internet & E-mail

### CAO
- Computer Fundamentals (Basic)
- MS-Windows
- Concept of Accountancy
- Tally, Fact (Accounting Software)
- Internet & Email

### DWPD
- Computer Fundamentals (Basic)
- MS-Windows
- PHP, HTML, CSS
- Java Script / J-Queries, My-SQL

### DOM
- Computer Fundamentals (Basic), MS-Windows, MS-DOS
- MS-Office (Word, Excel, PowerPoint, Access, Outlook)
- CorelDraw, Photoshop, Tally with GST, Generative AI Tools
- Hardware, Networking & Sharing, CCTV Installation
- Cyber Security, Internet, E-mail & Online works

### DCST
- Computer Fundamentals (Basic), MS-Windows, MS-DOS
- MS Office (Word, Excel, PowerPoint, Access)
- C Programming, Java Script Programming
- HTML, Python, SQL, Internet & E-mail

### DCAP
- Computer Fundamentals (Basic), MS-Windows, MS-DOS
- MS-Office (Word, Excel, PowerPoint, Access)
- Concept of Accountancy
- Tally with GST (Project)
- Accord, Corporate Banking, Taxation, Internet

### DHNT
- Computer Fundamentals (Basic), MS-Windows, MS-DOS
- MS-Office (Word, Excel, PowerPoint)
- Basic of Hardware (Assembling & Troubleshooting)
- Networking (LAN, Cabling, IP Addressing, Sharing, Troubleshooting)
- O/S & Software Installation, Maintenance, Internet & Email

## Discount Rules

- Only users with the SUPERADMIN role may create, change, activate or remove a course discount.
- Discounts are generic: PERCENTAGE or FIXED_AMOUNT.
- Server-side pricing is authoritative. Browser-submitted final fees are not trusted for normal admissions.
- Historical pricing is snapshotted on FeeLedger at admission.
- Changing a course discount affects new admissions only; existing fee ledgers retain their snapshot.
- The brochure's 50% offers for DCST, DCAP and DHNT are stored through the generic discount system, not hard-coded in UI logic.

## Coding for Kids

The supplied structure is six semesters:

1. Scratch
2. HTML
3. CSS + JavaScript
4. Java
5. Python
6. MIT App Inventor

The internal code CFK is used provisionally because no official code or final fee was supplied. It remains inactive/unpublished until the official details are confirmed.

## Still to confirm

- Online fee per course.
- Admission fee per course.
- Official Coding for Kids code, fee, duration and eligibility.
- Any brochure wording that is visually unclear, such as the DCA syllabus item printed as “Blue Java”.

## Implementation

Course pricing is database-driven and controlled through the existing course pricing/validation layer. The Super Admin course manager controls discount configuration. Seed data contains the supplied base fees, durations and brochure curriculum so local database seeding can populate the course catalogue.
