# HR, Attendance, Leave, Tasks & Payroll

## Employee Attendance
Web attendance must validate that check-in/out occurs within the configured centre geofence and capture an attendance image. Location is used for attendance verification, not continuous GPS tracking.

Store check-in, check-out, verification coordinates/accuracy where permitted, image reference, device/session metadata where appropriate and review status.

## Break & Out Tracking
Track break start/end and duration. Outing types include OFFICE_WORK and PERSONAL. Store reason, out time, expected return, actual return and duration.

## Leave
Employee request -> authorized approval/rejection -> leave balance/status update. Support leave types and history.

## Tasks
Admin-authorized users create/assign tasks. Suggested statuses:
TODO -> IN_PROGRESS -> BLOCKED -> REVIEW -> COMPLETED.

Tasks support priority, due date, checklist, comments, attachments, activity timeline and reviewer.

## Performance
Reports may summarize attendance, punctuality, working time, break/out duration and task metrics. AI may summarize patterns but must not autonomously make disciplinary/employment decisions.

## Payroll
Support employee salary structure, components, payroll periods, deductions/adjustments, payslips and payment status. Payroll postings integrate with finance.
