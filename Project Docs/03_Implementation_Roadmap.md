# Implementation Roadmap — SNR WORLD School ERP

> **Project:** SNR WORLD School ERP (`apex-public-school-portal`)
> **Date:** June 2026
> **Horizon:** 4 phases, ~7-9 months
> **Related:** `01_SaaS_School_Management_Research.md`, `02_Firestore_Schema_v3.md`

---

## 1. Guiding Principles

1. **Ship a usable school in 8 weeks** — Phase 1 must result in a second school running on SNR WORLD within 60 days.
2. **Multi-tenant from day one** — no single-tenant shortcuts, no "we'll add tenancy later" code paths.
3. **Schema before UI** — finalize the v3 schema (`02_Firestore_Schema_v3.md`) before building feature screens.
4. **Mobile-first, but not mobile-only** — most Indian school staff work on a mix of desktop and 6-inch phone screens. Build responsive, not native.
5. **Compliance as a feature** — UDISE+ export and CBSE/ICSE report cards are must-haves for paying customers.
6. **Cost discipline** — keep monthly infra cost < ₹30 per active school.

---

## 2. Phased Summary

| Phase | Focus | Duration | Outcome |
|---|---|---|---|
| **0 — Foundation** | Repo hygiene, v3 schema, multi-tenant hardening, CI/CD | 1-2 weeks | Stable base for all phases |
| **1 — Core SIS** | Schools, Students, Staff, Classes, Subjects, Sessions, Members, Auth, Branding | 6-8 weeks | Onboard a second school in < 1 day |
| **2 — Academic** | Attendance, Marks/Exams, Timetable, Report cards (CBSE/ICSE), Homework, Lessons (NEP 2020) | 6-8 weeks | Day-to-day academic operations live |
| **3 — Finance + Comms** | Fees (UPI), WhatsApp, SMS, Email, In-app messages, Library, Transport, HR, Payroll | 8-10 weeks | Full SaaS feature parity with mid-market |
| **4 — Intelligence** | AI tutor, Predictive analytics, Adaptive testing, Parent engagement bots | 4-6 weeks | Differentiation vs Classe365 / Schoolyn |

Total: **~7-9 months** to a full SaaS product, with revenue potential from Phase 1 onwards.

---

## 3. Phase 0 — Foundation (1-2 weeks)

### Goals
Stop the bleeding in the current v2 codebase; lay the v3 ground.

### Tasks
- [ ] **Repo audit & cleanup**
  - Remove `_backups/` from tracking (git rm --cached)
  - Move `temp_super_admin/` to scripts/ or archive
  - Consolidate duplicate code in `js/` (admin-dashboard.js, super-admin-pro.js, etc.)
- [ ] **Add `firestore.indexes.json`** with the composite indexes from `02_Firestore_Schema_v3.md` §4
- [ ] **Add `firestore.rules` v3** from `02_Firestore_Schema_v3.md` §5
- [ ] **Add `storage.rules`** if/when we add Firebase Storage (currently no — Base64 only per IMAGE_STORAGE.md)
- [ ] **Migrate `firestore.rules` to v3 syntax** with helper functions (`isAuth`, `isSchoolMember`, etc.)
- [ ] **Add `Project Docs/`** ✅ (done in this work)
- [ ] **CI/CD**: GitHub Actions for `npm run lint` and `npm run format` on every PR
- [ ] **Backup script**: nightly `firestore:export` to GCS bucket `gs://apex-public-school-backups/`
- [ ] **Set up `firebase emulators`** for local dev (Auth + Firestore + Functions)

### Deliverables
- `firestore.indexes.json` committed
- `firestore.rules` v3 deployed
- CI badge green
- Backup job running

### Exit criteria
- Two-engineer team can spin up a local emulator, run `npm run dev`, and onboard a second school end-to-end.

---

## 4. Phase 1 — Core SIS (6-8 weeks)

### Goals
A second school can be created, configured, and start admitting students through the platform.

### Module breakdown

#### 1.1 School Onboarding (Week 1)
- [ ] Super-admin `OnboardSchool` flow:
  1. Enter school metadata (name, board, address, admin contact)
  2. Generate `schoolId` (auto: `SCH001`, `SCH002`, ...)
  3. Create admin user + send invite email
  4. Auto-generate `schools/{id}/org` doc with defaults
  5. Apply branding (logo, colors)
- [ ] Map subdomain (`apexps.snredu-erp.web.app`) via `schools/{id}.subdomain`
- [ ] Custom domain support via `schools/{id}.domain` + Firebase Hosting rewrites

#### 1.2 Authentication & Members (Week 2)
- [ ] Firebase Auth (email/password + phone OTP)
- [ ] Custom claims: `schoolId`, `role`, `classIds`, `subjectIds`
- [ ] `schools/{id}/members/{uid}` mirror doc
- [ ] Invite flow with email link
- [ ] Bulk import via CSV (Papa Parse)
- [ ] Self-service: parent signs up via `?invite=TOKEN` link from school admin

#### 1.3 Classes & Sections (Week 3)
- [ ] `schools/{id}/classes/{classId}` CRUD
- [ ] Bulk create: "Class 1-A through Class 8-C" via single action
- [ ] Class-teacher assignment
- [ ] Subject-to-class mapping (with periods/week)
- [ ] Promotion tool: end-of-year "promote all Class 5 to Class 6"

#### 1.4 Subjects (Week 3)
- [ ] `schools/{id}/subjects/{subjectId}` CRUD
- [ ] Pre-populated subject library (CBSE, ICSE, State)
- [ ] Subject-to-stage mapping (e.g., "Mathematics" → stages 1-12)
- [ ] Subject types: core / elective / language / vocational

#### 1.5 Academic Sessions (Week 4)
- [ ] `schools/{id}/sessions/{sessionId}` CRUD
- [ ] Term management (2-term, 3-term, semester)
- [ ] "Start new session" wizard: copy structure from previous, set new dates
- [ ] Session switch in UI: all screens filter by `?sessionId=`

#### 1.6 Students (Week 4-5)
- [ ] `schools/{id}/students/{studentId}` CRUD
- [ ] Bulk import via CSV (with validation)
- [ ] Photo upload (Base64 via `ImageStorage` helper, < 500 KiB)
- [ ] Family details: father, mother, guardian
- [ ] Auto-generate `studentId`, `admissionNo`, `rollNoInClass`
- [ ] Aadhaar field with field-level Rules (admin-only read)
- [ ] RTE flag + 25% quota tracking
- [ ] UDISE+ ID field
- [ ] Transfer certificate flow
- [ ] Alumni status (post-graduation)

#### 1.7 Staff (Week 5-6)
- [ ] `schools/{id}/staff/{staffId}` CRUD
- [ ] Designations, departments
- [ ] Joining/leaving dates, employment type
- [ ] Subject and class assignment
- [ ] Bulk import via CSV

#### 1.8 Branding & Portal (Week 6-7)
- [ ] `applyGlobalTheme()` reads from `schools/{id}/settings/theme`
- [ ] School logo, colors, principal message on landing
- [ ] Public website: `apex-public-school-portal.web.app` (hosting target: `school`)
- [ ] Multi-tenant portal: `snredu-erp.web.app/{subdomain}` (hosting target: `platform`)
- [ ] URL resolution: subdomain → `schoolId` via `js/firebase-config.js` `resolveSchoolSlug()`

#### 1.9 Notices, Events, Gallery, Testimonials, Inquiries (Week 7-8)
- [ ] `schools/{id}/notices/{noticeId}` CRUD
- [ ] `schools/{id}/events/{eventId}` CRUD
- [ ] `schools/{id}/gallery/{photoId}` CRUD (with Base64 ImageStorage)
- [ ] `schools/{id}/testimonials/{tId}` CRUD
- [ ] `schools/{id}/inquiries/{inqId}` public form + admin dashboard

### Deliverables
- 2 schools onboarded and live on the platform
- 500+ students imported via CSV
- 30+ staff accounts active
- All 9 CMS modules live

### Exit criteria
- A new school admin can: log in, see only their school's data, manage students, post a notice, upload a gallery photo, accept an inquiry, and configure branding — **without engineering help**.

---

## 5. Phase 2 — Academic (6-8 weeks)

### Goals
Teachers spend 80% of their day in SNR WORLD: attendance, marks, timetable, report cards.

### Module breakdown

#### 2.1 Attendance (Week 1-2)
- [ ] `schools/{id}/attendance/{date}/entries/{studentId}` write API
- [ ] Teacher UI: class roster grid, one-tap toggle, period-wise for middle/secondary
- [ ] Parent SMS/WhatsApp alert on absence (auto-trigger Cloud Function)
- [ ] Monthly calendar view: % attendance per student
- [ ] Defaulters list (< 75% in a month)
- [ ] Late arrival tracking
- [ ] Bulk-mark "all present" + exceptions
- [ ] CSV export for state reporting

#### 2.2 Exams (Week 3-4)
- [ ] `schools/{id}/sessions/{sessionId}/exams/{examId}` CRUD
- [ ] Exam types: formative, summative, mid-term, final, unit test, practical, annual
- [ ] Subject-wise schedule with date, time, duration, max marks
- [ ] Admit card generation (PDF via jsPDF, with school branding)
- [ ] Exam seating arrangement (optional)

#### 2.3 Marks & Gradebook (Week 4-5)
- [ ] `schools/{id}/sessions/{sessionId}/exams/{examId}/marks/{studentId}` write API
- [ ] Teacher UI: grid entry (rows = students, cols = subjects)
- [ ] Auto-grade from `schools/{id}/settings/grading` rules (e.g., 90-100 = A+, 80-89 = A, ...)
- [ ] Bulk import via CSV
- [ ] Verification workflow: teacher enters → class-teacher verifies → admin publishes
- [ ] Class-wise / subject-wise analytics (toppers, average, distribution)

#### 2.4 Report Cards (Week 5-6)
- [ ] `schools/{id}/settings/reportCardTemplate` per board
- [ ] CBSE template: scholastic + co-scholastic areas (NEP 2020)
- [ ] ICSE template: subjects + activities
- [ ] State board template per state (Bihar, UP, etc.)
- [ ] PDF generation (jsPDF + html2canvas)
- [ ] Bulk print: "Class 6-A, all students, Mid-Term 2025-26"
- [ ] Parent download via parent portal

#### 2.5 Timetable (Week 6-7)
- [ ] `schools/{id}/timetable/{slotId}` CRUD
- [ ] Auto-generator: constraint-based (teacher availability, room capacity, subject per week)
- [ ] Manual drag-drop editor
- [ ] Period substitutions: "Mr. X is absent, who's free for Class 6-A P3?"
- [ ] Print: class timetable, teacher timetable, room timetable

#### 2.6 Homework (Week 7)
- [ ] `schools/{id}/homework/{hwId}` CRUD
- [ ] `schools/{id}/homework/{hwId}/submissions/{studentId}` sub-collection
- [ ] Teacher posts: title, description, attachment (Base64), due date
- [ ] Student/parent view: pending, submitted, late, graded
- [ ] Auto-notify parents on new homework via WhatsApp

#### 2.7 Lesson Plans (NEP 2020) (Week 7-8)
- [ ] `schools/{id}/lessons/{lessonId}` CRUD
- [ ] Competency mapping: each lesson maps to ≥ 1 NEP 2020 competency
- [ ] Library of pre-built lesson templates (CBSE/NCERT)
- [ ] Weekly plan: "Class 6-A, Math, Week of 2026-06-02"

#### 2.8 Discipline (Week 8)
- [ ] `schools/{id}/discipline/{incidentId}` CRUD
- [ ] Categories: misbehavior, bullying, absence, uniform, academic dishonesty
- [ ] Severity levels: minor, moderate, major, critical
- [ ] Action tracking: warning, counseling, parent meeting, suspension
- [ ] Parent notification log

### Deliverables
- A school runs a full academic term in SNR WORLD
- 1 exam conducted end-to-end (entry → verification → publish → report card download)
- 1 month of attendance tracked with parent SMS alerts

### Exit criteria
- A teacher spends 0 minutes in Excel/pen-paper during a normal school day.

---

## 6. Phase 3 — Finance + Comms (8-10 weeks)

### Goals
Become the system's primary tool for the school office: fee collection, payroll, library, transport, communication.

### Module breakdown

#### 3.1 Fees (Week 1-4) — biggest revenue-impact module
- [ ] `schools/{id}/fees/{invoiceId}` CRUD
- [ ] Fee head master: tuition, admission, annual, development, lab, library, transport, exam, etc.
- [ ] Class-wise fee structure (`schools/{id}/settings/feeStructure`)
- [ ] Auto-generate invoices: start of term, monthly, or per-event
- [ ] Discount engine: sibling discount, scholarship, RTE quota, manual override (with approval)
- [ ] Late fee calculator: configurable rules (e.g., ₹50/day after due date)
- [ ] **UPI payment integration** (Razorpay / Cashfree):
  - Generate UPI deep-link with invoice amount
  - Webhook handler for payment confirmation
  - Auto-receipt PDF generation
  - Defaulter dashboard: status, days overdue, total outstanding
- [ ] Receipt printing: thermal printer-friendly format
- [ ] Daily collection report
- [ ] Tally export (CSV in Tally format)
- [ ] Parent portal: view invoices, pay via UPI, download receipts

#### 3.2 Communication (Week 5-6)
- [ ] **WhatsApp Business API** integration (via Interakt / Wati / AiSensy)
  - Template messages: notice, fee reminder, attendance, homework, result
  - Delivery + read receipts
  - Two-way messaging for parent-teacher
- [ ] **SMS** integration (MSG91 / Textlocal) — fallback for non-WhatsApp parents
- [ ] **Email** via SendGrid / Mailgun — for notices and report cards
- [ ] **Push notifications** via FCM — mobile-web push for in-app users
- [ ] In-app messages: `schools/{id}/messages/{threadId}/chats/{msgId}`
- [ ] Notice board: schedule, audience targeting, multi-channel delivery

#### 3.3 Library (Week 7)
- [ ] `schools/{id}/library/{bookId}` CRUD
- [ ] `schools/{id}/library/{bookId}/issues/{issueId}` sub-collection
- [ ] Barcode/QR scanning (mobile camera)
- [ ] Issue/return workflow with due-date tracking
- [ ] Fine calculation on overdue
- [ ] Inventory: total copies, available, lost

#### 3.4 Transport (Week 7-8)
- [ ] `schools/{id}/transport/routes/{routeId}` CRUD
- [ ] `schools/{id}/transport/vehicles/{vehicleId}` CRUD
- [ ] Student-to-route assignment
- [ ] GPS tracking integration (optional: external GPS vendor → webhook)
- [ ] Driver/conductor app (or PWA) for attendance on bus
- [ ] Pickup/drop notifications to parents
- [ ] Vehicle document tracking: insurance, fitness, permit expiry alerts

#### 3.5 HR & Payroll (Week 8-9)
- [ ] `schools/{id}/staff/{staffId}` extended with salary structure
- [ ] `schools/{id}/payroll/{monthId}` processing
- [ ] `schools/{id}/payroll/{monthId}/slips/{staffId}` sub-collection
- [ ] Attendance integration: days present, absent, leave
- [ ] Earnings: basic, HRA, DA, allowances
- [ ] Deductions: PF, ESI, TDS, PT, loan/advance
- [ ] Payslip PDF generation
- [ ] Bank file generation (NEFT format)
- [ ] Year-end Form 16 generation

#### 3.6 Holidays & Calendar (Week 9)
- [ ] `schools/{id}/holidays/{holidayId}` CRUD
- [ ] Pre-populated India holiday library
- [ ] School-specific holidays (annual day, sports day, etc.)
- [ ] Calendar view: month / list / print
- [ ] Auto-publish holidays as notices

#### 3.7 Compliance (Week 10)
- [ ] **UDISE+ export**: CSV in the exact DCF format for state upload
- [ ] **NEP 2020 report**: holistic progress card per student
- [ ] **RTE 25% report**: admissions under RTE for the year
- [ ] **State board report cards**: per-state templates
- [ ] **Audit logs**: every privileged action logged

### Deliverables
- UPI fee collection live for 1 school, ₹X collected
- WhatsApp messages reaching 90%+ parents
- 1 full payroll cycle run

### Exit criteria
- A school office handles a normal week's work entirely through SNR WORLD: fees, messages, library issues, transport roster, payroll run.

---

## 7. Phase 4 — Intelligence (4-6 weeks)

### Goals
Differentiate vs Classe365 and Schoolyn with AI-driven insights.

### Module breakdown

#### 4.1 Predictive Analytics (Week 1-2)
- [ ] Student drop-out risk: based on attendance, marks trend, fee payment pattern
- [ ] Fee default prediction: based on historical payment timing
- [ ] Teacher workload balancer: "Mr. X is over-allocated, redistribute"
- [ ] Early warning dashboard: red/amber/green per student

#### 4.2 AI-Powered Reports (Week 3)
- [ ] Auto-generate report card comments: "Rahul shows strong analytical skills in Mathematics..."
- [ ] Auto-summarize student progress for parent meetings
- [ ] Smart notice drafting: teacher types bullet points → polished notice

#### 4.3 Personalized Learning Paths (Week 4-5) — optional
- [ ] For each student: identify weak topics, recommend practice
- [ ] Adaptive quizzes: difficulty adjusts to performance
- [ ] Integration with optional LMS module (video lessons, quizzes)

#### 4.4 AI Tutor (Week 5-6) — premium add-on
- [ ] 24/7 chatbot for students
- [ ] Multilingual (English, Hindi, regional)
- [ ] Powered by OpenAI / Claude / Gemini
- [ ] Topic-bounded: refuses off-topic questions
- [ ] Parent-facing version: "explain my child's progress in plain language"

#### 4.5 Smart Communication (Week 6)
- [ ] Best-time-to-message: send WhatsApp when parents are most likely to read
- [ ] Auto-translate: notice in English → parent receives in Hindi
- [ ] Sentiment analysis: detect upset parents from message tone, alert school admin

### Deliverables
- AI tutor in beta with 1 school
- Predictive analytics dashboard live

### Exit criteria
- 1 customer pays premium for AI features.

---

## 8. Cross-cutting Concerns (all phases)

### 8.1 Performance
- [ ] Lazy-load non-critical screens
- [ ] `limit(25)` + cursor pagination on every list view
- [ ] Client-side cache for read-only screens (notices, gallery)
- [ ] Service worker for offline support (PWA)
- [ ] Image lazy-loading + WebP conversion

### 8.2 Security
- [ ] **App Check** enforcement on all clients
- [ ] Field-level Rules for sensitive data (Aadhaar, medical, marks)
- [ ] Rate limiting on auth + writes (Cloud Functions middleware)
- [ ] 2FA for schoolAdmin
- [ ] Annual security review

### 8.3 Observability
- [ ] Cloud Logging from all Cloud Functions
- [ ] Error tracking: Sentry / Firebase Crashlytics
- [ ] Performance monitoring: Firebase Performance
- [ ] Uptime checks: Firebase Hosting + Cloud Functions
- [ ] Custom dashboards: school-admin activity, fee collection, attendance rate

### 8.4 Testing
- [ ] Unit tests: Vitest for utilities
- [ ] Integration tests: Firebase Emulator Suite
- [ ] E2E tests: Playwright for critical user journeys
- [ ] Load tests: simulate 100 concurrent schools during peak (fee collection day)

### 8.5 Documentation
- [ ] **API reference** for all Cloud Functions
- [ ] **Admin guide** (one PDF per module)
- [ ] **Teacher guide** (quick-start per role)
- [ ] **Parent guide** (parent-portal only, multi-lingual)
- [ ] **Developer setup** (`README.md` + `CONTRIBUTING.md`)

### 8.6 Compliance
- [ ] Privacy policy + Terms of Service
- [ ] Cookie consent banner
- [ ] Data Processing Agreement (DPA) for schools
- [ ] DPDP Act 2023 compliance audit
- [ ] Annual third-party security audit

---

## 9. Team & Estimates

### Team size (recommended)
- 1 Tech Lead / Architect (full-time, all phases)
- 2 Full-stack engineers (Firestore + frontend)
- 1 Frontend specialist (UI/UX heavy, Phase 2-3)
- 1 Mobile / PWA engineer (Phase 2-3)
- 1 QA engineer (part-time, ramps up Phase 2)
- 1 DevOps / SRE (part-time)
- 1 Product Manager (half-time)

### Rough estimates
| Phase | Engineer-weeks |
|---|---|
| Phase 0 | 4 |
| Phase 1 | 24-32 |
| Phase 2 | 24-32 |
| Phase 3 | 32-40 |
| Phase 4 | 16-24 |
| Cross-cutting | ongoing, ~20% of any phase |
| **Total** | **~120-150 engineer-weeks** |

At 3 engineers + 1 tech lead = **~7-9 months** of full-team work.

---

## 10. Commercial Model

### Tiered SaaS pricing (proposed)

| Plan | Price / month | Schools | Students | Modules |
|---|---|---|---|---|
| **Free** | ₹0 | 1 | ≤ 100 | SIS, Notices, Gallery, Events, Inquiries, Branding |
| **Starter** | ₹999 | 1 | ≤ 500 | + Attendance, Timetable, Homework, Discipline |
| **Pro** | ₹2,499 | 1 | ≤ 2000 | + Fees (UPI), Exams, Report Cards, Library, Transport, Communication |
| **Enterprise** | ₹5,999+ | Multi-campus | Unlimited | + HR, Payroll, AI Tutor, Predictive Analytics, Custom integrations |

### Revenue projection (conservative)
- Year 1: 20 schools, avg ₹1,500/month = **₹3.6L/year = ~$4,300 ARR**
- Year 2: 100 schools, avg ₹2,000/month = **₹24L/year = ~$29,000 ARR**
- Year 3: 500 schools, avg ₹2,500/month = **₹1.5Cr/year = ~$180,000 ARR**

Infra cost at 500 schools: ~₹15,000/month = **< 5% of revenue**. Healthy SaaS economics.

---

## 11. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Multi-tenant data leak via Rules bug | Low | Critical | Strict path-boundary Rules, integration tests on every change, quarterly security review |
| UPI payment reconciliation errors | Medium | High | Idempotent webhooks, manual reconciliation UI, daily reports |
| WhatsApp API cost spike (Meta price hike) | Medium | Medium | Multi-provider abstraction (Wati ↔ AiSensy), SMS fallback |
| Slow adoption by school staff | High | High | Onsite training, WhatsApp-based helpdesk, in-app tutorials |
| Firebase quota limits hit | Low | Medium | Set budget alerts, implement caching, design for BigQuery export |
| Schema migration breaks existing data | Medium | High | Dual-write, backfill, feature-flag reads, 30-day rollback window |
| Competitive pressure (free open-source) | Medium | Medium | Differentiate on UX, support, and India-specific compliance |

---

## 12. Success Metrics (KPIs)

### Phase 1
- 2 schools onboarded
- 1000 students in system
- 50 staff actively using daily

### Phase 2
- 5 schools live
- 1 exam conducted end-to-end per school
- 90% attendance marked on time

### Phase 3
- 10 schools, 5 paying (₹999+/month)
- 1 full UPI fee collection cycle
- 80% parent reach via WhatsApp

### Phase 4
- 1 school on Pro plan
- 100 paying schools
- NPS > 40
- < 5% monthly churn

---

## 13. Immediate Next Steps (this week)

1. ✅ Create `Project Docs/` folder
2. ✅ Write `01_SaaS_School_Management_Research.md`
3. ✅ Write `02_Firestore_Schema_v3.md`
4. ✅ Write `03_Implementation_Roadmap.md` (this file)
5. ⏭ Commit `Project Docs/` to Git
6. ⏭ Open 3 GitHub issues: "Phase 0: Add firestore.indexes.json", "Phase 0: Refactor firestore.rules to v3", "Phase 0: Set up Firebase emulators for local dev"
7. ⏭ Schedule kickoff meeting: assign Phase 0 owners
8. ⏭ Start Phase 0 work

---

**End of Roadmap.**
