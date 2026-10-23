# Official Course Catalogue

Source of truth for the current RCLD Islampur course names, base offline fees and active launch discounts. Fees are stored as the base offline course fee (`Course.standardFee`); any discount is applied at display and admission time through `lib/course-pricing.js`.

| Code | Official course name | Base fee (INR) | Launch discount |
| --- | --- | ---: | --- |
| CCA | Certificate in Computer Applications | 2,500 | — |
| DCA | Diploma in Computer Applications | 4,500 | — |
| ADCA | Advanced Diploma in Computer Applications | 6,000 | — |
| CCC | Certificate Course in CAD | 5,000 | — |
| CAO | Certificate in Accounts Operation | 5,500 | — |
| DWPD | Diploma in Webpage Development | 12,000 | — |
| DOM | Diploma in Office Management | 9,000 | — |
| DCST | Diploma in Computer Science & Technology | 14,000 | 50% |
| DCAP | Diploma in Computer Account Professional | 16,500 | 50% |
| DHNT | Diploma in Hardware & Networking Technology | 20,900 | 50% |

## Discount Rules

- Only users with the `SUPERADMIN` role may create, change, activate or remove a course discount.
- Discounts are generic (`PERCENTAGE` or `FIXED_AMOUNT`), not hard-coded by course code.
- Server-side pricing is authoritative. Browser-submitted final fees are not trusted for normal admissions.
- Historical pricing is snapshotted on `FeeLedger` at admission with the discount type, discount value and admission fee.
- Changing a course discount affects new admissions only; existing fee ledgers retain their snapshot.
- Online enrolment continues to use `Course.onlineFee`; course discounts apply to offline admissions and public course pricing unless a separate online-fee decision is made.

## Coding for Kids

The supplied structure is six semesters: Scratch, HTML, CSS + JavaScript, Java, Python and MIT App Inventor.

The internal code `CFK` is used provisionally because no official code or fee was supplied. The programme is seeded **inactive and unpublished** so it cannot appear publicly with an invented fee. Activate and price it after the official details are confirmed.

## Fields Still Needed

These values were not supplied and remain unset rather than guessed:

- Online fee per course.
- Admission fee per course.
- Duration and eligibility per course.
- Detailed brochure syllabus per course.
- Official Coding for Kids code, fee, duration and eligibility.

## Implementation

- Pricing calculations: `lib/course-pricing.js`
- Validation: `lib/course-validation.js`
- Admin course API: `app/api/admin/courses/route.js`, `app/api/admin/courses/[code]/route.js`
- Admin UI: `app/dashboard/admin/courses/page.js`, `course-manager.js`
- Public UI: `app/page.js`, `app/courses/page.js`, `app/courses/[code]/page.js`
- Admission snapshot: `app/api/admin/admissions/route.js`
- Seed data: `prisma/seed.js`
