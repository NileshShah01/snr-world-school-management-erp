# 22 Modules of a Perfect School Management System

## Reference: OpenEduCat / GegoK12 / Industry Best Practices

A perfect SMS is defined by the breadth and depth of its modules. This document defines the 22 modules that constitute a comprehensive school management system for Indian K-12, categorised by priority: Must-Have (13), Should-Have (6), and Could-Have (3). Each module includes its purpose, key features, integration points, and success metrics.

---

## MUST-HAVE MODULES (13)

---

### 1. SIS — Student Information System

**Purpose:** Central repository for all student data — the single source of truth from admission to alumni.

**Key Features:**
- Student profile with photo, documents, medical records, and academic history
- Custom fields (school can add any field)
- Bulk import/export via CSV/Excel
- Student ID generation (linked to ID card module)
- Sibling grouping for fee concessions
- Transfer certificate management
- Alumni tracking with contact details
- Document upload and verification (birth certificate, Aadhaar, etc.)
- Family dashboard (parent/guardian/sibling linkage)
- Audit log of all changes to student records

**Integration Points:** Admission (feeds into SIS), Fee Management (sibling concession, fee ledger), Attendance (daily tracking), Exam (result attached), Report Cards, ID Cards, Transport (route assignment), Library (membership)

**Success Metrics:**
- <2 minutes to create a new student record
- 100% of student data accessible from a single profile view
- Zero data duplication (one student, one record)

---

### 2. Attendance

**Purpose:** Track student and staff attendance daily with minimal teacher effort.

**Key Features:**
- One-tap "All Present" with exception marking (absent, late, leave, holiday)
- Biometric integration (fingerprint, face recognition) optional
- Period-wise attendance linked to timetable
- Auto-notification to parents for absent students (WhatsApp/SMS)
- Monthly attendance report with percentage and trend
- Attendance <75% alert to admin and parents
- Bulk SMS/WhatsApp for mass absenteeism
- Staff/teacher attendance separate from student
- Geo-tagged attendance for field staff
- Integration with smart cards / RFID for automated marking

**Integration Points:** SIS (student list), Timetable (period mapping), Communication (parent alerts), Reports & Analytics (attendance trends), Fee Management (attendance-linked fee deductions)

**Success Metrics:**
- Teacher completes attendance in <10 seconds per class
- <1% attendance data entry errors after teacher submission
- >90% of absent-student notifications delivered via WhatsApp

---

### 3. Fee Management

**Purpose:** End-to-end fee lifecycle — structure definition, invoice generation, collection, receipting, and default tracking.

**Key Features:**
- Fee structure templates (per class, per student)
- Multiple fee heads (tuition, transport, library, labs, etc.)
- Concession matrices (sibling, staff child, merit-based, need-based)
- Late fee / fine engine with configurable rules
- FIFO atomic allocation (partial payments auto-allocate to oldest dues first)
- Instalment plans with due date tracking
- UPI / credit card / net banking payment gateway integration
- Auto-receipt generation on payment confirmation
- Defaulter dashboard with smart filtering
- Accounting export (ledger, day book, receipts register)

**Integration Points:** SIS (student fee liability), Admission (fee deposit at enrollment), Communication (reminders, receipts), Reports & Analytics (collection analytics), Alumni (dues tracking)

**Success Metrics:**
- >80% of fee payments made online
- <5% fee default rate by end of term
- End-of-day fee reconciliation in <1 minute

---

### 4. Timetable

**Purpose:** Create and manage class timetables with conflict detection.

**Key Features:**
- Visual timetable builder (drag-and-drop interface)
- Automatic conflict detection (teacher, room, class)
- Multiple timetable versions (regular, exam, event-week)
- Teacher-wise timetable view
- Room / lab booking and availability
- Substitute teacher management
- Period time slots with break/lunch periods
- PDF export (class-wise, teacher-wise)
- Academic calendar integration
- Subject allocation per teacher

**Integration Points:** Attendance (period-wise marking), Exam (exam timetable), Homework (linked to period), Lesson Planning (period-linked), HR/Payroll (teacher workload)

**Success Metrics:**
- High school (30+ teachers, 20+ sections) timetable generated in <5 minutes
- Zero teacher clashes after generation
- >90% of teachers view their timetable on mobile

---

### 5. Exam & Gradebook

**Purpose:** Full exam lifecycle — planning, scheduling, marks entry, grading, and result publication.

**Key Features:**
- Exam creation (name, type: unit test, mid-term, final, board)
- Subject and syllabus mapping
- Marking scheme with weightage (per subject, per question)
- Marks entry interface (single, bulk, subject-wise)
- Auto-grade calculation (total, percentage, grade, rank)
- AI validation of marks entry (outlier detection)
- Grade book for continuous assessment
- Grade card / report card generation
- Online exam support (MCQ, subjective, timed)
- Exam analytics (pass %, topper list, subject performance)

**Integration Points:** SIS (student list), Timetable (exam schedule), Report Cards (grade data → report card), Communication (result notification), AI Assistant (report comments), Homework (assignment linked)

**Success Metrics:**
- 500-student exam results processed and report cards generated in <10 minutes
- Zero calculation errors in grade computation
- >80% of parents view results within 24 hours of publication

---

### 6. Parent/Student Portal

**Purpose:** Dedicated interface for parents and students to view academic data, communicate with school, and manage fee payments.

**Key Features:**
- Parent dashboard: attendance %, fee status, upcoming exams, recent results
- Student dashboard: timetable, homework, marks, report cards, attendance
- Fee payment (UPI link / gateway redirect)
- Download report cards and ID cards
- Communication: send message to class teacher / admin
- Notification history
- Multiple child support (parent sees all children)
- Multi-language support (EN, HI, regional)
- PWA for mobile accessibility

**Integration Points:** SIS (student data), Fee Management (payment link, ledger), Attendance (daily view), Exam (result view), Homework (assignment list), Communication (in-app messaging)

**Success Metrics:**
- >70% of parents log in at least once per week
- >80% of fee payments made through portal
- >4.0 average rating on parent satisfaction survey

---

### 7. Notices & Announcements

**Purpose:** Publish and manage school-wide communications — notices, circulars, events, and announcements.

**Key Features:**
- Create notice with title, body, attachments
- Target by audience (all, class, section, individual teacher/parent)
- Schedule publish date and expiry date
- Read receipt tracking (who has seen the notice)
- Priority levels (normal, important, urgent)
- Multi-channel delivery (in-app, WhatsApp, SMS, email, push)
- Circular templates (pre-formatted PDF)
- Notice board display on public website
- Archive and search

**Integration Points:** Communication (multi-channel delivery), Public Website (website display), Events (calendar-linked), Admission (new parent notices)

**Success Metrics:**
- Notice published in <1 minute
- >80% read rate within 24 hours for urgent notices
- Zero missed communications due to channel failure

---

### 8. Communication (SMS / WhatsApp / Email / Push)

**Purpose:** Multi-channel communication engine with templates, automation, and delivery tracking.

**Key Features:**
- WhatsApp Business API integration (template messages, session messages)
- SMS gateway (Twilio / MSG91 / local provider)
- Email via SMTP / SendGrid
- Push notifications for PWA / mobile app
- Template management (pre-approved WhatsApp templates)
- Automated triggers (absent → WhatsApp parent, fee due → SMS reminder)
- Delivery receipts and read receipts (WhatsApp)
- Bulk messaging to selected groups
- Two-way communication (parent can reply via WhatsApp)
- Opt-in / opt-out management

**Integration Points:** Attendance (absent alerts), Fee Management (reminders), Exam (results), Notices (broadcast), Admission (confirmation), Events (invitations)

**Success Metrics:**
- >95% delivery rate on WhatsApp messages
- <30 seconds from trigger to message delivery
- >60% read rate on WhatsApp messages within 1 hour

---

### 9. Admission Management

**Purpose:** Full admissions lifecycle — inquiry to enrollment.

**Key Features:**
- Online admission form builder (custom fields)
- Public inquiry form on school website
- Inquiry management (track, follow up, convert)
- Application fee collection online
- Document upload by parent
- Enquiry-to-admission pipeline dashboard
- Admission number auto-generation
- Bulk import of existing students
- Entrance test management (schedule, results)
- Merit list and waitlist management

**Integration Points:** Public Website (inquiry form), SIS (convert to student), Fee Management (admission fee), Communication (inquiry follow-up, confirmation), ID Cards (generate on admission)

**Success Metrics:**
- Online form completion by parent in <10 minutes
- Inquiry-to-admission conversion rate >30%
- Admission setup for new academic year in <1 day

---

### 10. Reports & Analytics

**Purpose:** Pre-built and custom reports for every stakeholder.

**Key Features:**
- Attendance reports (daily, monthly, class-wise, individual)
- Fee collection reports (day book, receipt register, defaulter list)
- Exam result analysis (pass %, subject-wise, class-wise)
- Teacher performance (classes taken, student outcomes)
- Student progression (class to class, drop-out tracking)
- Custom report builder (select fields, filters, date range)
- Export to PDF, Excel, CSV
- Dashboard widgets for principal's dashboard
- Scheduled email reports to admin
- UDISE+ data export

**Integration Points:** All modules (data source), Principal Dashboard (display widgets), Communication (scheduled reports to admin)

**Success Metrics:**
- Any standard report generated in <30 seconds
- Custom report built in <2 minutes
- UDISE+ export in 1 click

---

### 11. Role-Based Access Control (RBAC)

**Purpose:** Granular permissions for every user role.

**Key Features:**
- Pre-defined roles: Super Admin, School Admin, Principal, Vice Principal, Teacher, Class Teacher, Parent, Student, Accountant, Librarian, Transport Coordinator
- Custom role creation with individual permission toggles
- Module-level access (e.g., teacher can view attendance but not fee data)
- CRUD-level permissions (create, read, update, delete per module)
- Class/section-level data scoping
- Audit trail of all admin actions
- Session management (device tracking, force logout)
- Two-factor authentication for sensitive roles

**Integration Points:** All modules (permission enforcement), Audit Log (action tracking), Multi-Tenant (cross-tenant isolation)

**Success Metrics:**
- New role created and assigned in <2 minutes
- Zero cases of unauthorised data access
- Complete audit trail for every financial transaction

---

### 12. Multi-Tenant Infrastructure

**Purpose:** Serve multiple schools from a single codebase with data isolation.

**Key Features:**
- Tenant ID on every document (Firestore security rules enforce isolation)
- Per-school branding (logo, colours, school name in UI)
- Per-school feature toggle (enable/disable modules per school)
- Per-school pricing plan (usage tracking, billing)
- Cross-school analytics (for super-admin only)
- Tenant onboarding wizard
- Usage dashboard (storage, reads/writes, API calls per school)
- Tenant-level backup and restore

**Integration Points:** RBAC (super-admin vs school-admin), All modules (tenant-scoped data), Pricing (usage-based billing)

**Success Metrics:**
- New school provisioned in <5 minutes
- Zero cross-tenant data leaks
- Per-school infrastructure cost <$0.50/month

---

### 13. AI Assistant

**Purpose:** AI-powered features across the platform for automation, personalisation, and insights.

**Key Features:**
- AI report card comment generator (teacher marks → personalised paragraph)
- AI question paper preparation (import from image/PDF, auto-tag by subject/chapter)
- AI tutor chatbot (student asks questions via WhatsApp/website → LLM answers with curriculum context)
- Fee defaulter prediction (pattern analysis → risk score per parent)
- At-risk student detection (attendance + marks + behaviour → early warning)
- AI grading assistant (MCQ auto-grade, subjective answer scoring guidance)
- NLP search across student records, notices, communications
- Automated lesson plan suggestions (based on syllabus, past performance)
- AI-powered timetable optimisation
- Smart notifications (send message at optimal time for parent engagement)

**Integration Points:** Exam (report comments), Question Formatter (AI extraction), Communication (chatbot), Fee Management (prediction), Attendance + Exam (at-risk detection), Reports (AI insights)

**Success Metrics:**
- >50% of report card comments generated by AI (teacher-reviewed)
- >80% of question papers created or assisted by AI
- Fee default prediction accuracy >80%
- AI tutor answers >70% of student queries correctly on first attempt

---

## SHOULD-HAVE MODULES (6)

---

### 14. Library

**Purpose:** Manage library catalogue, issue/return, and member tracking.

**Key Features:**
- Book catalogue with ISBN, author, publisher, category
- Issue/return with barcode / QR scanning
- Member management (students, staff)
- Due date reminders and fine calculation for late returns
- Book reservation by students
- Purchase and inventory tracking
- Digital book / e-book links
- Reading history per student
- Library usage analytics

**Integration Points:** SIS (student members), Communication (overdue reminders), Fee Management (library fines), ID Cards (barcode for checkout)

**Success Metrics:**
- Book issue/return processed in <30 seconds
- <5% overdue rate due to auto-reminders
- Online catalogue searchable by students

---

### 15. Transport

**Purpose:** Manage school transport — routes, vehicles, stops, and student assignments.

**Key Features:**
- Route creation with stop sequence and timing
- Vehicle master (registration, capacity, insurance, fitness)
- Driver details and assignment
- Student route and stop assignment per semester
- GPS tracking integration (real-time bus location)
- Attendance on bus (driver marks via mobile)
- Transport fee calculation (per route, per term)
- Parent notification (bus arrived, bus delayed, emergency)
- Route optimisation suggestions

**Integration Points:** SIS (student assignment), Fee Management (transport fee), Communication (bus alerts), Attendance (bus attendance), HR/Payroll (driver salary)

**Success Metrics:**
- Route-to-student assignment in <1 minute per batch
- Parent notification delivered within 30 seconds of bus status change
- Transport fee collection >90%

---

### 16. HR / Payroll

**Purpose:** Staff management, attendance, salary processing, and compliance.

**Key Features:**
- Staff master (personal info, documents, qualifications, experience)
- Staff attendance and leave management
- Payroll structure (basic, HRA, allowances, deductions)
- Salary calculation with TDS, PF, ESI compliance
- Payslip generation (monthly)
- Loan / advance management (disbursement, repayment)
- Appraisal and performance tracking
- Staff ID card generation
- Resignation / separation workflow

**Integration Points:** SIS (staff as users), Attendance (staff attendance), Timetable (teacher allocation), Communication (staff notices), ID Cards (staff cards), Fee Management (salary as expense)

**Success Metrics:**
- Monthly payroll processed for 50 staff in <1 hour
- Zero TDS/ESI calculation errors
- 100% of staff receive digital payslips

---

### 17. Homework

**Purpose:** Assign, submit, and grade homework digitally.

**Key Features:**
- Homework creation (title, description, due date, subject, class/section)
- File attachments (PDF, images, documents)
- Student submission (upload file, type text)
- Teacher review and grading
- Overdue submission tracking
- Parent notification (homework assigned, due tomorrow, overdue)
- Homework analytics (submission rate, average score)
- Integration with lesson plan

**Integration Points:** Timetable (period-linked), Communication (parent notification), Exam (grading linkage), Lesson Planning (curriculum mapping), Parent Portal (assignment view)

**Success Metrics:**
- Homework created in <1 minute
- >90% submission rate with parent reminders
- Teacher grades homework in <2 minutes per student

---

### 18. Lesson Planning (NEP 2020)

**Purpose:** Create and manage lesson plans aligned with NEP 2020 competency framework.

**Key Features:**
- Lesson plan template (learning objectives, activities, resources, assessment)
- Syllabus mapping (chapter, topic, competency, learning outcome)
- NEP 2020 competency framework linkage
- Lesson plan sharing among teachers
- Lesson plan approval workflow
- Progress tracking (% syllabus covered)
- Resource attachment (videos, worksheets, PPTs)
- Weekly / monthly planner view
- Integration with timetable (period-level planning)

**Integration Points:** Timetable (period allocation), Homework (linked assignments), Exam (syllabus completion), Reports (coverage analytics), Communication (notify HOD)

**Success Metrics:**
- Lesson plan created in <5 minutes per week
- >80% syllabus coverage tracked in system
- NEP competency mapping available for all subjects

---

### 19. Events & Calendar

**Purpose:** School event management and shared calendar.

**Key Features:**
- Event creation (name, date, time, venue, description)
- Event categories (academic, sports, cultural, holiday, exam, PTM)
- Calendar view (day, week, month, agenda)
- Invitation and RSVP management
- Event reminders (WhatsApp/SMS to parents/teachers)
- Recurring events (weekly assembly, monthly PTM)
- Holiday list management
- Academic calendar publishing (PDF)
- Event photo/media gallery integration

**Integration Points:** Communication (invitations, reminders), Gallery (event photos), Notices (event announcements), Timetable (calendar integration)

**Success Metrics:**
- Event created and notified in <2 minutes
- >60% RSVP response rate for parent events
- Academic calendar published before start of session

---

## COULD-HAVE MODULES (3)

---

### 20. Gallery / Media

**Purpose:** School photo and video gallery for events, sports, and activities.

**Key Features:**
- Photo and video upload (admin/teacher)
- Album creation (event name, date, description)
- Public gallery on school website
- Parent download of photos
- Face tagging (auto-group photos by student)
- Photo approval workflow (principal approves before publishing)
- Media storage optimisation (Firebase Storage + CDN)

**Integration Points:** Public Website (public gallery), Events (album auto-creation), Student Portal (child's photos), Notices (album-linked)

**Success Metrics:**
- Album created in <1 minute
- >50% of events have an associated gallery
- Zero unauthorised photo downloads (privacy compliance)

---

### 21. Testimonials

**Purpose:** Collect and display parent and alumni testimonials.

**Key Features:**
- Testimonial submission form (on public website)
- Admin approval workflow
- Display on public website (carousel, grid, featured)
- Categorisation (by event, by year, by class)
- Alumni spotlight (featured alumni with career updates)
- Star rating system
- Social media share integration

**Integration Points:** Public Website (display), SIS (alumni data), Admission (social proof for prospects)

**Success Metrics:**
- Testimonial submission in <2 minutes
- >50 testimonials published by end of first year
- Testimonial visible on website within 24 hours of approval

---

### 22. Discipline

**Purpose:** Track student behaviour, infractions, and rewards.

**Key Features:**
- Behavioural incident logging (date, type, severity, description)
- Categorisation (minor, major, violation)
- Student discipline record (cumulative log per student)
- Reward / appreciation tracking (good behaviour, achievements)
- Parent notification for serious incidents
- Detention or corrective action tracking
- Discipline reports (per class, per student, trends)
- Integration with behaviour improvement programmes

**Integration Points:** SIS (student record), Communication (parent notification), Reports (discipline analytics)

**Success Metrics:**
- Incident logged in <1 minute
- Parent notified within 5 minutes of serious incident
- Discipline trends visible in monthly report
