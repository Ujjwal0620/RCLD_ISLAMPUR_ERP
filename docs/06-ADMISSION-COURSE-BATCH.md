# Admission, Course & Batch Management

## Admission
Temporary V1 admission form may include name, DOB, gender, phone, email, address, guardian details, education, selected course, documents, admission date and notes. Final fields will be replaced/extended when the official form is supplied.

## Course Master
Initial course codes:
CCA, DCA, ADCA, CCC, CAO, DWPD, DOM, DCST, DCAP, DHNT.

Fields should include code, full name, description, duration, eligibility, standard fee, admission fee, online fee, active status, syllabus and delivery availability. Placeholder values may be seeded but must be clearly identified as placeholders.

## Discounts
Only users explicitly authorized by Superadmin can approve discounts. Record original amount, discount type/value, reason, approver and timestamp.

## Batch
Fields: batch code/name, course, academic session, start/end dates, schedule, room/lab, capacity (default 50), status and faculty assignments.

## Transfer
Students can change batch. Never overwrite the original enrollment without history. Store old/new batch, old/new faculty context, reason, request/approval information and effective date.

## Dropouts
Track dropout date, reason, last batch, fee position, remarks and status. Dropout records remain reportable.

## Paper Batch Sheet Reference
The existing paper batch sheet supplied during requirements gathering is a workflow reference. The digital system should make batch rosters, student identifiers, course/admission details, contact/fee information, attendance/payment status and remarks searchable and reportable rather than duplicating the paper layout exactly.
