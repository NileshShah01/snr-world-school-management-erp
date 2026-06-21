# Phase 3: Finance + Communication (8-10 weeks)

> School office operations: fees, communication, library, transport, HR/payroll, compliance.
> **Effort:** 32-40 engineer-weeks (2-3 devs, 8-10 weeks)
> **Depends on:** Phase 1 (Core SIS — students, staff, classes must exist) + Phase 2 (attendance for payroll integration)

---

## Task Checklist

### Week 1-4: Fees (Revenue-Impact Module)
- [ ] Fee head master: tuition, admission, annual, development, lab, library, transport, exam, activity
- [ ] `schools/{id}/fees/{invoiceId}` CRUD
- [ ] Class-wise fee structure config (`schools/{id}/settings/feeStructure`)
- [ ] Auto-generate invoices: start-of-term, monthly, or per-event
- [ ] Discount engine: sibling discount, scholarship, RTE quota, manual override
- [ ] Late fee calculator: configurable rules (₹X/day after due date, max cap)
- [ ] UPI payment integration (Razorpay / Cashfree):
  - Generate order → redirect to checkout
  - Webhook handler for payment confirmation
  - Auto-receipt PDF generation (jsPDF)
- [ ] Defaulter dashboard: status, days overdue, total outstanding by class/student
- [ ] Receipt printing: thermal-printer-friendly format
- [ ] Daily collection report: cash vs online, class-wise summary
- [ ] Tally export: CSV in Tally-compatible format
- [ ] Parent portal: view invoices, pay online, download receipts
- [ ] Refund workflow: initiate → approve → process

### Week 5-6: Communication
- [ ] **WhatsApp Business API** (Interakt / Wati / AiSensy):
  - Template message registration (fee reminder, attendance, homework, exam, notice)
  - Delivery + read receipts tracking
  - Two-way messaging for parent-teacher
- [ ] **SMS** integration (MSG91 / Textlocal): fallback for non-WhatsApp parents
- [ ] **Email** (SendGrid / Mailgun): notices, report cards, bulk communication
- [ ] **Push notifications** via FCM: mobile-web push for in-app users
- [ ] **In-app messages**: `schools/{id}/messages/{threadId}/chats/{msgId}`
- [ ] **Notice board**: schedule delivery, audience targeting (class/section/all), multi-channel
- [ ] **Delivery history**: per-message status (sent/delivered/read/failed), drill-down per recipient
- [ ] **Parent notification preferences**: toggle per channel and per type

### Week 7: Library
- [ ] `schools/{id}/library/books/{bookId}` CRUD
- [ ] `schools/{id}/library/issues/{issueId}` sub-collection
- [ ] Barcode/QR scanning via mobile camera
- [ ] Issue/return workflow with due-date tracking
- [ ] Fine calculation on overdue (configurable per day)
- [ ] Inventory: total copies, available copies, lost/damaged
- [ ] Library card generation (PDF)
- [ ] Student library history in portal

### Week 7-8: Transport
- [ ] `schools/{id}/transport/routes/{routeId}` CRUD (stops, timing, fare)
- [ ] `schools/{id}/transport/vehicles/{vehicleId}` CRUD (capacity, registration)
- [ ] Student-to-route assignment with pickup/drop points
- [ ] GPS tracking integration (external GPS vendor webhook — optional)
- [ ] Driver/conductor PWA: bus attendance, route verification
- [ ] Pickup/drop notifications to parents (SMS/WhatsApp)
- [ ] Vehicle document tracking: insurance expiry, fitness, permit

### Week 8-9: HR & Payroll
- [ ] Staff salary structure: basic, HRA, DA, allowances
- [ ] `schools/{id}/payroll/{monthId}` processing:
  - Attendance integration: days present, absent, leave
  - Earnings calculation
  - Deductions: PF, ESI, TDS, PT, loan/advance
- [ ] `schools/{id}/payroll/{monthId}/slips/{staffId}` sub-collection
- [ ] Payslip PDF generation (jsPDF with school branding)
- [ ] Bank file generation (NEFT format CSV)
- [ ] Year-end Form 16 generation
- [ ] Payroll history: monthly, annual, per-staff reports

### Week 9-10: Compliance
- [ ] **UDISE+ export**: CSV in exact DCF format for state portal upload
- [ ] **NEP 2020 holistic progress card**: co-scholastic + scholastic
- [ ] **RTE 25% report**: admissions under RTE quota for the year
- [ ] **State board report cards**: per-state templates (Bihar, UP, etc.)
- [ ] **Audit logs**: every CRUD action on student, staff, fee, marks logged to `auditLog`
- [ ] **Data retention policy** enforcement: soft-delete past retention dates
- [ ] **DPDP compliance**: privacy policy, consent records, DSR workflow

---

## Modules Involved

| Module | Scope |
|--------|-------|
| Fees | Invoice generation, UPI payment, discounts, late fees, reports, Tally export |
| Communication | WhatsApp, SMS, Email, Push, In-app, Notice Board, Delivery History |
| Library | Book CRUD, issue/return, barcode scanning, fines, inventory |
| Transport | Routes, vehicles, GPS, driver PWA, notifications |
| HR & Payroll | Salary structure, payroll processing, payslips, NEFT, Form 16 |
| Compliance | UDISE+, NEP 2020, RTE reports, audit logs, DPDP |

---

## JS Files to Create/Modify

| File | Action |
|------|--------|
| `js/erp-fees.js` | Fee structure, invoice gen, payment integration, discounts |
| `js/erp-fees-reports.js` | Collection reports, defaulter dashboard, Tally export |
| `js/services/payment-service.js` | Razorpay/Cashfree integration, FIFO atomic logic |
| `js/erp-notifications.js` | Communication engine: WhatsApp, SMS, Email, Push |
| `js/erp-messages.js` | In-app messaging, threads, chat UI |
| `js/erp-library.js` | Book CRUD, issue/return, fines, barcode scanning |
| `js/erp-transport.js` | Routes, vehicles, student assignment, GPS |
| `js/erp-payroll.js` | Salary structure, payroll processing, payslip gen |
| `js/erp-compliance.js` | UDISE+ export, RTE reports, audit logs |
| `js/erp-audit.js` | Audit log writer, audit log viewer |
| `functions/createRazorpayOrder.js` | Server-side order creation |
| `functions/verifyRazorpayPayment.js` | Signature verification + Firestore update |
| `functions/razorpayWebhook.js` | Async webhook: refund, dispute |
| `functions/sendSms.js` | MSG91 API integration |
| `functions/sendWhatsApp.js` | WhatsApp Business API integration |
| `functions/sendEmail.js` | SendGrid/Mailgun integration |
| `functions/sendPush.js` | FCM push notification dispatch |
| `functions/onPaymentCreate.js` | Auto-receipt gen, SMS/WhatsApp notify |
| `functions/onHomeworkCreate.js` | Notify parents on homework |
| `functions/onResultPublish.js` | Notify parents on result publish |
| `portal/admin-dashboard.html` | Add fees, library, transport, payroll, compliance sections |
| `portal/student-dashboard.html` | Fee payment, library history, transport info |

---

## Firestore Collections

| Collection | Document | Key Fields |
|------------|----------|------------|
| `schools/{id}/fees/{invoiceId}` | Invoice | studentId, amount, dueDate, status, paidDate |
| `schools/{id}/settings/feeStructure` | FeeStructure | classId, feeHeads, amounts, dueDates |
| `schools/{id}/payments/{paymentId}` | Payment | invoiceId, amount, method, razorpayOrderId, status |
| `schools/{id}/messages/{threadId}/chats/{msgId}` | ChatMessage | sender, content, timestamp, readAt |
| `schools/{id}/notifications/{notifId}` | Notification | audience, channels, template, status, recipientStats |
| `schools/{id}/library/books/{bookId}` | Book | title, author, isbn, totalCopies, available |
| `schools/{id}/library/issues/{issueId}` | Issue | bookId, studentId, issueDate, dueDate, returnedDate |
| `schools/{id}/transport/routes/{routeId}` | TransportRoute | name, stops, timing, fare, vehicleId |
| `schools/{id}/transport/vehicles/{vehicleId}` | Vehicle | registrationNo, capacity, insuranceExpiry |
| `schools/{id}/payroll/{monthId}` | PayrollMonth | month, year, totalEarnings, totalDeductions, status |
| `schools/{id}/payroll/{monthId}/slips/{staffId}` | Payslip | earnings, deductions, netPay, bankDetails |
| `schools/{id}/auditLogs/{logId}` | AuditLog | action, actor, target, timestamp, details |
| `demoRequests/{reqId}` | DemoRequest | schoolName, contact, email, phone, studentCount |

---

## Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| Razorpay SDK | 2.x | UPI payment gateway |
| Cashfree SDK | 2.x | Backup payment gateway |
| MSG91 API | — | SMS gateway |
| WhatsApp Business API | — | WhatsApp messaging |
| SendGrid / Mailgun | — | Email delivery |
| FCM | — | Push notifications |
| jsPDF | 2.x | Receipts, payslips, library cards |
| Papa Parse | 5.x | Tally export, compliance CSV |

---

## Estimated Effort (Dev-Days)

| Week | Module | Dev-Days | Dependencies |
|------|--------|----------|--------------|
| 1-4 | Fees | 15 | Phase 1 (students, classes) |
| 5-6 | Communication | 10 | Phase 2 (attendance for triggers) |
| 7 | Library | 5 | Week 5 (students) |
| 7-8 | Transport | 5 | Week 6 (students) |
| 8-9 | HR & Payroll | 7 | Week 2 (staff, attendance) |
| 9-10 | Compliance | 5 | All prior modules |
| **Total** | | **~47** | |

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| UPI payment reconciliation errors | Medium | High | Idempotent webhooks, manual reconciliation UI, daily reports |
| WhatsApp API cost spike (Meta price change) | Medium | Medium | Multi-provider abstraction, SMS fallback |
| Library barcode scanning on mobile camera | Medium | Low | Progressive enhancement: manual entry always works |
| Payroll calculation errors (PF/ESI/TDS) | High | High | Test with real CA; built-in validation rules |
| Parent notification opt-out missing | Medium | Medium | Default all-on; per-channel and per-type toggles |

---

## Success Criteria / Exit Gate

- [ ] A school office handles a normal week's work entirely through SNR WORLD: fees, messages, library issues, transport roster, payroll run
- [ ] UPI fee collection live for 1 school with test payment flow end-to-end
- [ ] WhatsApp messages reaching 90%+ parents
- [ ] 1 full payroll cycle run with accurate deductions
- [ ] Library issue/return workflow works with barcode scanning
- [ ] Transport routes assigned and parent notifications live
- [ ] UDISE+ export generates valid DCF-format CSV
- [ ] Audit logs recording all privileged actions
