# Fees, Payments & Finance

## Student Fees
Support admission fee, course fee, configurable installments, due dates, discounts, collections, outstanding balances, receipts, adjustments, refunds and history.

## Installments
Authorized admins configure installment schedules. Changes after payment activity should preserve history.

## Discounts
Superadmin controls discount authority. Discount approvals require reason and audit trail.

## Payment Methods
- Cash
- Manual UPI/bank recording
- PhonePe gateway initially
- Razorpay later through provider abstraction

Never mark a gateway payment successful only because the browser returns to a success page. Verify server-side using provider-supported status/webhook mechanisms.

## Accounting Scope
Track student fees, online course sales, other income, expenses, payroll, refunds and cash/bank/UPI movements.

## Reports
Daily collection, outstanding fees, installment dues, discount report, gateway reconciliation, expense report, income report, cashbook, payroll expense and summarized profit/loss reporting.

## Controls
Use immutable/audited correction flows for important financial records. Restrict delete operations. Every receipt has a unique identifier.
