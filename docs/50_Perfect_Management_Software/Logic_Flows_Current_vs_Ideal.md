# Business Logic Flows — Current vs Ideal

This document compares 5 critical business logic flows as they currently work in SNR vs how they should work in a perfect school management system. Each flow includes a Mermaid sequence diagram of both current and ideal states.

---

## Flow 1: Student Onboarding

### Current SNR Flow

The current onboarding process is admin-driven and manual:

1. Parent fills a paper/PDF form (offline) or sends details via phone
2. Admin manually enters student details into the SNR dashboard
3. Admin creates a student record, assigns an admission number
4. Student record is written to Firestore
5. No automated communication to parent
6. Student appears in class roster after admin manually assigns to section

```mermaid
sequenceDiagram
    actor Parent
    actor Admin
    participant Dashboard
    participant Firestore

    Parent->>Admin: Submits paper/PDF form (offline)
    Admin->>Dashboard: Opens student creation form
    Admin->>Dashboard: Types student details manually
    Admin->>Dashboard: Assigns class, section, roll no
    Dashboard->>Firestore: Writes student document
    Admin->>Parent: Manual call/message "student created"
    Note over Parent,Admin: No automated welcome, no self-service
```

**Problems:**
- Parent has no self-service option
- Admin spends 5-10 minutes per student on data entry
- No automated admission number or roll number generation
- No welcome communication to parent
- Manual errors in spelling, dates, document numbers

### Ideal Flow

The ideal process is parent self-service with admin approval:

1. Parent visits school website → fills online admission inquiry form
2. System auto-creates an inquiry record with unique ID
3. Email/SMS sent to admission admin: "New inquiry received"
4. Admin reviews inquiry → approves or requests more documents
5. On approval: system auto-creates student record, generates admission number, assigns roll number, creates parent login
6. Welcome WhatsApp sent to parent with login credentials and instructions
7. Student appears in class roster and all modules (attendance, fee, exam)
8. ID card PDF auto-generated and available for download

```mermaid
sequenceDiagram
    actor Parent
    actor Admin
    participant Website
    participant System
    participant Firestore
    participant WhatsApp

    Parent->>Website: Fills online admission form
    Website->>System: Creates inquiry record
    System->>Firestore: Saves inquiry with status "pending"
    System->>Admin: Email/SMS "New inquiry from [Student Name]"
    Admin->>System: Reviews & approves inquiry
    System->>Firestore: Creates student record
    System->>Firestore: Generates admission no, roll no
    System->>Firestore: Creates parent login credentials
    System->>WhatsApp: Sends welcome message with login link
    WhatsApp->>Parent: "Welcome! Your child is admitted. Login here."
    System->>Admin: Confirmation "Student onboarded successfully"
```

**Metrics:**
- Total time from form submission to student active in system: <15 minutes (mostly admin review)
- Admin effort per student: <2 minutes (review + approve)
- Parent satisfaction: instant confirmation, digital welcome

---

## Flow 2: Daily Attendance

### Current SNR Flow

The current attendance flow is web-based and sequential:

1. Teacher logs into SNR web dashboard (laptop/desktop)
2. Navigates to Attendance module
3. Selects class, section, and date
4. Sees the student roster list
5. Marks each student individually as Present, Absent, or Leave
6. Clicks "Save" button
7. Data is written to Firestore
8. No automated parent notification for absent students

```mermaid
sequenceDiagram
    actor Teacher
    participant Dashboard
    participant Firestore

    Teacher->>Dashboard: Logs in (web, laptop/desktop)
    Teacher->>Dashboard: Navigates to Attendance
    Teacher->>Dashboard: Selects class, section, date
    Teacher->>Dashboard: Marks each student present/absent/leave
    Teacher->>Dashboard: Clicks Save
    Dashboard->>Firestore: Writes attendance records
    Note over Teacher,Firestore: No parent notification
```

**Problems:**
- Requires laptop/desktop (no mobile option)
- Manual marking for each student (even if all present)
- 30-60 seconds per class of 40 students
- No parent notification for absences
- No integration with timetable (teacher selects class manually)
- No real-time attendance % dashboard update

### Ideal Flow

The ideal flow is mobile-first, one-tap, and automated:

1. Teacher opens PWA on phone (or clicks WhatsApp notification)
2. Auto-login via session token / biometric
3. Sees "Today's Attendance" for assigned class from timetable
4. Taps "Mark All Present" — default action
5. Marks exceptions (absent students) — optional, automatic absent detection via classroom check
6. Confirms — data synced to Firestore in <2 seconds
7. Cloud Function triggered: checks absent students
8. WhatsApp notification sent to parents of absent students: "[Student] was absent today. Reason: ___"
9. Attendance % updated in real-time principal dashboard
10. Alert triggered if any student's monthly attendance drops below 75%

```mermaid
sequenceDiagram
    actor Teacher
    actor Parent
    participant PWA
    participant Firestore
    participant CloudFn
    participant WhatsApp
    participant Dashboard

    Teacher->>PWA: Opens app (auto-detects class from timetable)
    PWA->>Firestore: Fetches class roster
    PWA->>Teacher: Shows roster with "All Present" button
    Teacher->>PWA: Taps "Mark All Present"
    Teacher->>PWA: Marks exceptions (2 absent students)
    Teacher->>PWA: Confirms attendance
    PWA->>Firestore: Bulk-writes attendance (40 records, <2s)
    Firestore->>CloudFn: Triggers on new attendance write
    CloudFn->>CloudFn: Identifies absent students
    CloudFn->>WhatsApp: Sends absent notification to parents
    WhatsApp->>Parent: "[Student Name] was absent today"
    Firestore->>Dashboard: Updates attendance % widget
    Note over Firestore,Dashboard: Real-time refresh, <5s latency
```

**Metrics:**
- Teacher completes attendance in <5 seconds (all present) or <15 seconds (with exceptions)
- Parent notified of absence within <30 seconds of marking
- Principal sees updated attendance % in <5 seconds

---

## Flow 3: Fee Collection

### Current SNR Flow

The current fee process is largely offline and admin-intensive:

1. Admin manually generates fee for each student (or batch-generates via dashboard)
2. Admin prints or sends manual fee notice to parent
3. Parent visits school with cash/cheque
4. Admin receives payment at school office
5. Admin logs into dashboard and records payment
6. Admin updates student fee ledger manually
7. Admin issues handwritten or printed receipt
8. If parent defaults: admin manually tracks and follows up

```mermaid
sequenceDiagram
    actor Admin
    actor Parent
    participant Dashboard
    participant Firestore

    Admin->>Dashboard: Generates fee for month
    Dashboard->>Firestore: Creates fee records (status: unpaid)
    Admin->>Parent: Manual fee notice (paper/phone)
    Parent->>Admin: Visits school, pays cash/cheque
    Admin->>Dashboard: Records payment in system
    Dashboard->>Firestore: Updates fee ledger
    Admin->>Parent: Issues receipt (manual/printed)
    Note over Admin,Parent: Full cycle requires physical presence
```

**Problems:**
- Parent must physically visit school to pay
- No online payment option
- Admin spends hours on reconciliation
- Receipt is manual/printed paper
- Defaulter tracking is manual
- No auto-reminders before due date
- No auto-invoicing

### Ideal Flow

The ideal flow is fully digital, auto-triggered, and completes in under 60 seconds:

1. On 1st of every month: Cloud Function auto-generates fee invoices for all active students
2. WhatsApp message sent to each parent with personalised invoice and UPI payment link
3. Parent taps UPI link → UPI app opens → authenticates with fingerprint/UPC → payment confirmed
4. Payment gateway webhook (Razorpay/PhonePe) hits SNR Cloud Function
5. Cloud Function: verifies payment → creates receipt → updates fee ledger (FIFO allocation) → marks invoice as paid
6. Parent receives WhatsApp receipt: "Fee of ₹X,000 paid successfully. Receipt #INV-2026-001"
7. Defaulter dashboard updated in real-time — paid student removed from defaulter list
8. On 5th of month: auto-reminder to unpaid parents
9. On 10th of month: late fee auto-applied
10. On 15th of month: escalated message to defaulters with late fee breakdown

```mermaid
sequenceDiagram
    actor Parent
    participant WhatsApp
    participant CloudFn
    participant Firestore
    participant Gateway

    Note over CloudFn: 1st of month, 6:00 AM
    CloudFn->>Firestore: Reads all active students with fee structure
    CloudFn->>Firestore: Creates fee invoices (status: unpaid)
    CloudFn->>WhatsApp: Sends invoice with UPI link to each parent
    WhatsApp->>Parent: "Fee due: ₹X,000. Pay here: [UPI link]"
    Parent->>Gateway: Taps link → UPI app → authenticates → pays
    Gateway->>CloudFn: Webhook: payment success
    CloudFn->>Firestore: Verifies payment, allocates FIFO
    CloudFn->>Firestore: Creates receipt, marks invoice paid
    CloudFn->>WhatsApp: Sends confirmation receipt
    WhatsApp->>Parent: "Payment of ₹X,000 received. Receipt #..."
    Note over CloudFn,Firestore: Entire cycle <60 seconds for parent
```

**Metrics:**
- Parent completes payment in <60 seconds (end-to-end)
- Auto-receipt generated in <5 seconds of webhook confirmation
- Defaulter list updated in real-time
- >80% of payments made online within first 5 days of month
- <5% default rate at end of term

---

## Flow 4: Exam & Result Cycle

### Current SNR Flow

The current exam flow is functional but manual in critical steps:

1. Admin creates exam in dashboard (name, class, subjects, max marks, date)
2. Admin manually adds exam schedule
3. Teacher logs in → navigates to Marks Entry → selects subject, class, exam
4. Teacher enters marks for each student manually
5. System auto-calculates totals, percentages, grades
6. Teacher submits marks
7. Admin publishes results
8. Report cards generated one-by-one via jsPDF (admin clicks "Generate PDF" per student)
9. Admin must manually distribute report cards (print + hand over)

```mermaid
sequenceDiagram
    actor Admin
    actor Teacher
    participant Dashboard
    participant Firestore
    participant PDF

    Admin->>Dashboard: Creates exam, adds schedule
    Dashboard->>Firestore: Saves exam config
    Teacher->>Dashboard: Logs in → Marks Entry
    Teacher->>Dashboard: Selects subject, class, exam
    Teacher->>Dashboard: Enters marks for each student
    Dashboard->>Firestore: Saves marks
    Admin->>Dashboard: Publishes results
    Admin->>PDF: Generates report cards (one by one)
    Note over Admin,PDF: Manual, time-consuming
```

**Problems:**
- Report cards generated one-by-one (time-consuming for 500+ students)
- No AI validation of marks (outliers not flagged)
- No WhatsApp delivery of results
- No NEP 2020 holistic progress card format
- No auto-generation of report card comments
- No exam analytics dashboard updated automatically

### Ideal Flow

The ideal flow is automated, AI-assisted, and multi-channel:

1. Admin creates exam with blueprint (marks distribution per subject, per question type, competency mapping)
2. Schedule auto-published to teachers, students, and parents via WhatsApp
3. Teacher opens mobile PWA → marks entry interface
4. AI validates marks entry: flags outliers (e.g., student scored 95 in all subjects but 20 in one → alert teacher to verify)
5. Auto-grading: total, percentage, grade, percentile, rank calculated instantly
6. AI generates personalised report card comments per student based on marks and teacher notes
7. Admin clicks "Publish Results" (one click)
8. Cloud Function triggers:
   a. Generates all report card PDFs in bulk (500 PDFs in <30 seconds)
   b. WhatsApp message to each parent with result summary + PDF link
   c. Updates exam analytics dashboard (pass %, subject toppers, class comparison)
9. Parent receives: "Results for [Student], Class X — Passed with 85%. Report card: [link]. Download or view in app."

```mermaid
sequenceDiagram
    actor Admin
    actor Teacher
    actor Parent
    participant System
    participant Firestore
    participant CloudFn
    participant WhatsApp
    participant Dashboard

    Admin->>System: Creates exam with blueprint
    System->>Firestore: Saves exam config
    System->>WhatsApp: Publishes exam schedule to all
    Teacher->>System: Opens PWA → enters marks
    System->>System: AI validates marks (outlier check)
    System->>Firestore: Saves validated marks
    System->>System: Auto-grades (total, %, grade, rank)
    System->>System: AI generates report comments
    Admin->>System: Clicks "Publish Results"
    System->>CloudFn: Triggers bulk report card generation
    CloudFn->>CloudFn: Generates 500 PDFs in parallel
    CloudFn->>Firestore: Saves PDF URLs to student records
    CloudFn->>WhatsApp: Sends result to each parent
    WhatsApp->>Parent: "Results published! [Name]: 85%. Report: [PDF link]"
    Firestore->>Dashboard: Updates exam analytics
    Note over CloudFn,Dashboard: Full cycle <5 minutes for 500 students
```

**Metrics:**
- Admin publishes results in 1 click
- 500 report card PDFs generated in <30 seconds
- 500 parents receive WhatsApp result notification in <60 seconds
- Zero marks calculation errors (AI-validated)
- AI generates >50% of report card comments (teacher reviews and edits)

---

## Flow 5: Parent Engagement

### Current SNR Flow

Parent engagement in current SNR is minimal and passive:

1. Parent receives login credentials (phone number + name-based)
2. Parent opens web browser → visits SNR school website → logs in
3. Parent views student dashboard: attendance %, fee status, upcoming exams
4. No proactive notifications
5. No WhatsApp communication
6. No fee payment in app/portal
7. No homework notifications
8. No result notifications
9. No teacher messaging

```mermaid
sequenceDiagram
    actor Parent
    participant Website
    participant Dashboard

    Parent->>Website: Visits school website
    Parent->>Dashboard: Logs in (phone + name)
    Dashboard->>Parent: Shows student dashboard
    Note over Parent,Dashboard: Passive — parent must initiate
    Note over Parent,Dashboard: No WhatsApp, no notifications
```

**Problems:**
- Parent must proactively log in (no push)
- Authentication is weak (phone + name — easily guessable)
- No WhatsApp channel (India's primary communication app)
- No fee payment in portal
- No real-time notifications (attendance, homework, results)
- No two-way communication (parent cannot message teacher)
- Engagement is near-zero: <5% of parents log in more than once a month

### Ideal Flow

The ideal parent engagement flow is WhatsApp-first, proactive, and bi-directional:

1. Admission → Parent auto-enrolled in WhatsApp messaging (opt-in via consent form)
2. Daily at 2 PM: Parent receives attendance notification for their child
   - "Good afternoon! [Student Name] was PRESENT today. Attendance this month: 92%."
   - If absent: "[Student] was ABSENT today. Click to mark reason."
3. Weekly: Homework summary — "Homework assigned: Maths (p. 45-47), Science (project due Fri)"
4. Monthly: Fee invoice via WhatsApp with UPI link — "Fee of ₹2,500 due by 10th. Pay now: [UPI link]"
5. Exam results: Instant WhatsApp notification with marks summary and report card PDF link
6. Events: PTM reminders, holiday alerts, sports day invitations via WhatsApp
7. Parent replies via WhatsApp:
   - "ABSENT" → logs reason for absence
   - "HOMEWORK" → shows current homework
   - "FEES" → shows fee status + payment link
   - "RESULTS" → sends latest result
   - "RECEIPT" → sends latest fee receipt PDF
8. Teacher messaging: Parent can type message → forwarded to class teacher via dashboard → teacher replies → parent receives response
9. Admin dashboard: parent engagement analytics — delivery %, read %, reply %, opt-out %
10. Target: >80% parent engagement (at least one interaction per week per parent)

```mermaid
sequenceDiagram
    actor Parent
    actor Teacher
    participant WhatsApp
    participant System
    participant Firestore
    participant Dashboard

    Note over System: Daily 2:00 PM
    System->>Firestore: Fetches today's attendance
    System->>WhatsApp: Sends attendance update to each parent
    WhatsApp->>Parent: "[Student] was PRESENT. Monthly: 92%"
    Note over System: Fee due in 3 days
    System->>WhatsApp: Sends fee reminder with UPI link
    WhatsApp->>Parent: "Fee of ₹2,500 due on 10th. Pay: [link]"
    Parent->>WhatsApp: Replies "FEES"
    WhatsApp->>System: Forwards parent message
    System->>Firestore: Looks up fee status
    System->>WhatsApp: Sends fee details + payment link
    WhatsApp->>Parent: "Fee status: ₹2,500 due. Pay now: [link]"
    Note over System: Exam result published
    System->>WhatsApp: Sends result notification
    WhatsApp->>Parent: "[Student] scored 85%. Report card: [PDF link]"
    Parent->>WhatsApp: Types "Need to speak with class teacher"
    WhatsApp->>System: Forwards parent query
    System->>Dashboard: Creates message for teacher
    Teacher->>Dashboard: Types reply
    Dashboard->>System: Sends teacher response
    System->>WhatsApp: Delivers teacher reply to parent
    WhatsApp->>Parent: "Teacher says: Your child is doing well. Let's discuss in PTM."
    Note over System,Dashboard: Two-way communication via WhatsApp
```

**Metrics:**
- >80% of parents interact with school via WhatsApp at least once per week
- >95% delivery rate for WhatsApp messages
- >60% read rate within 1 hour of sending
- <1% opt-out rate (parents choosing to leave WhatsApp group)
- Parent satisfaction: >4.0/5.0 on annual survey
- Fee default rate: <5% (proactive reminders reduce defaults)

---

## Comparison Summary

| Flow | Current State | Ideal State | Improvement |
|---|---|---|---|
| **Student Onboarding** | Admin types data manually → no automated comms | Parent self-service form → auto-create → welcome WhatsApp | **90% reduction in admin effort** |
| **Daily Attendance** | Web-only, manual marking, no notifications | PWA one-tap, auto-WA to absent parents | **3x faster marking, instant parent alerts** |
| **Fee Collection** | Offline cash/cheque, manual receipts, admin reconciliation | UPI payment in <60s, auto-receipt, FIFO allocation | **100% digital, parent-driven** |
| **Exam & Result Cycle** | Manual PDF gen, no bulk, no WhatsApp delivery | 1-click publish, bulk PDF (500 in 30s), WA delivery | **From hours to minutes** |
| **Parent Engagement** | Passive web login, <5% monthly active | WhatsApp-first, >80% weekly active, two-way comms | **From near-zero to >80% engagement** |

## Implementation Priority

| Flow | Effort | Impact | Priority |
|---|---|---|---|
| Fee Collection (UPI + gateway) | Medium | ⭐⭐⭐⭐⭐ | **P0 — Revenue critical** |
| Parent Engagement (WhatsApp) | Medium | ⭐⭐⭐⭐⭐ | **P0 — Parent satisfaction** |
| Daily Attendance (PWA + WA) | Low-Medium | ⭐⭐⭐⭐ | **P1 — Daily visibility** |
| Exam & Result (bulk + WA) | Medium-High | ⭐⭐⭐⭐ | **P1 — Faculty productivity** |
| Student Onboarding (self-service) | Medium | ⭐⭐⭐ | **P2 — Growth enabler** |
