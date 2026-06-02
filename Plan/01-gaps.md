# Consolidated Gaps Analysis

> All gaps found across the codebase, organized by severity and category.
> See `Plan/pages/*.md` for per-file context.
> See `Plan/02-roadmap.md` for the prioritized fix order.

---

## 🔴 P0 — Ship-Blockers (must fix before any production launch)

### Security
- **G-SEC-01**: Admin auth guards are disabled/commented out in `js/admin-auth.js:78-99`. Anyone can open `/portal/admin-dashboard.html` and access all admin functions.
  - **File**: `D:\Snredu\js\admin-auth.js`
  - **Fix**: Uncomment + harden auth checks; require custom claims (e.g., `role: 'admin'`)
- **G-SEC-02**: Student login uses **phone + name** with no password, no OTP. Any person who knows a student's mobile can log in as them.
  - **File**: `D:\Snredu\portal\student-dashboard.html`, `D:\Snredu\js\student-auth.js`
  - **Fix**: Migrate to Firebase Phone Auth (OTP) or add password + security question
- **G-SEC-03**: `/provision.html` is **publicly accessible** with no auth. Anyone can re-provision SCH001 and SCH002 schools (overwrite settings, phone, email, address).
  - **File**: `D:\Snredu\provision.html`
  - **Fix**: Delete from public hosting, or move to a Node.js admin script (see `scripts/provision-multi-school.js`)
- **G-SEC-04**: Firestore rules are in dev mode (any authenticated user can read/write most collections). No field-level validation.
  - **File**: `D:\Snredu\firestore.rules` (needs to be created/audited)
  - **Fix**: Implement least-privilege rules, role-based access, school-id scoping
- **G-SEC-05**: PII displayed in plain text on student dashboard (Aadhar, phone, address, father/mother name). Shoulder-surfing and screen-recording risk.
  - **File**: `D:\Snredu\portal\student-dashboard.html` (profile section)
  - **Fix**: Tap-to-reveal with 5-second auto-hide; redact Aadhar (show last 4 only)

### Critical UX
- **G-UX-01**: 6 admin dashboard sections display "Module Under Construction" placeholder (lines 7929-8048 of `admin-dashboard.html`):
  - `teacherTimetablesSection` — "Teacher specific timetables are currently under development"
  - `sendNotificationSection` — "Push notification services are being integrated"
  - `notificationHistorySection` — "Notification logs will be available here once the service is live"
  - `libraryTransactionsSection` — "Library transaction history is being migrated to the new database schema"
  - `addEmployeeSection` — "The HR Management module is currently under maintenance"
  - `searchEmployeeSection` — "Employee search functionality will be restored shortly"
  - `bulkEmployeeUpdateSection` — "Bulk management tools for staff are in the pipeline"
  - **Fix**: Remove from sidebar OR implement minimal viable functionality
- **G-UX-02**: Duplicate "FEES MANAGEMENT" sidebar entry in admin-dashboard.html (lines 181-207 and 266-305). First entry has 6 sub-items, second has 10. Visually breaks the sidebar.
  - **Fix**: Delete the shorter first entry (lines 181-207)
- **G-UX-03**: "Nexorasoftagency" brand is hard-coded in `super-admin.html` AND `super-admin-pro.html` (titles, sidebar) — inconsistent with platform branding "SNR Edu ERP"
  - **Fix**: Replace "Nexorasoftagency" with "SNR World" or "SNR Edu ERP" everywhere

### Missing Critical Integrations
- **G-INT-01**: **No payment gateway** (Razorpay / Cashfree / PayU). Fee collection is 100% cash. The system tracks who paid but cannot collect online.
  - **Files**: `js/erp-fees.js`, `js/services/payment-service.js`
  - **Fix**: Integrate Razorpay (best for India SMB), webhook to atomic-fee-service
- **G-INT-02**: **No SMS gateway** (MSG91 / Twilio / Karix). Welcome messages, fee reminders, attendance alerts, OTPs all go nowhere.
  - **Files**: `js/erp-notifications.js` (already exists as a stub), `contact.html` form
  - **Fix**: Integrate MSG91 (India-native, cheapest), wire to Cloud Function on collection writes
- **G-INT-03**: **No WhatsApp Business API**. Most Indian parents prefer WhatsApp for school communication.
  - **Fix**: Integrate WhatsApp Cloud API (free for first 1,000 conversations/month); templates for fee reminder / attendance / homework

### Privacy / Compliance (DPDP Act 2023)
- **G-DPDP-01**: **No privacy policy page**. Schools collecting student Aadhar, photos, addresses need an explicit privacy notice.
  - **Fix**: Create `privacy.html` + footer link
- **G-DPDP-02**: **No consent flow**. Parents must explicitly consent to data collection (especially biometric/RFID if added).
  - **Fix**: Add consent checkbox to admission form; store `consentGiven: true` + `consentTimestamp` on student record
- **G-DPDP-03**: **No data export / deletion flow**. Under DPDP, parents can request their data or its deletion.
  - **Fix**: Build a "Data Subject Request" workflow in super-admin + student portal
- **G-DPDP-04**: **No data retention policy**. How long are student records kept after graduation?
  - **Fix**: Add a `retentionUntil` field on student record; auto-archive after 7 years
- **G-DPDP-05**: **No Data Protection Officer (DPO) contact**. DPDP requires a named DPO for any data processor.
  - **Fix**: Add `dpoEmail` / `dpoPhone` to school settings + footer display

---

## 🟡 P1 — Critical for Go-to-Market (next 30 days)

### UX & Content
- **G-UX-04**: Counter animation script is **duplicated inline** in 3 pages (`about.html` 230-246, `academics.html` 193-209, `facilities.html` 281-296). `school.html` has none.
  - **Fix**: Centralize in `js/cms-settings.js` or new `js/counters.js`
- **G-UX-05**: `birthdaySection` (school.html), `testimonialsSection` (school.html), `staffSection` (about.html), `holidaysSection` (academics.html), `importantLinksWidget` (student-dashboard), `attendanceWidget` (student-dashboard) are **all `<section class="hidden">` by default** — dead UI
  - **Fix**: Wire to CMS toggles, or remove dead code
- **G-UX-06**: 3 social media links on `contact.html` (lines 265-267) point to `href="#"` — broken
  - **Fix**: Replace with real URLs or remove the "Follow Us" section
- **G-UX-07**: `data-target="10"` on `facilities.html` stat (line 228) — inconsistent with other pages showing "8 years" (school founded 2018, current year 2026)
  - **Fix**: Change to `data-target="8"`
- **G-UX-08**: `og:image` in `school.html` points to a non-existent GitHub Pages URL
  - **Fix**: Use a real, hosted image (or remove the meta tag)
- **G-UX-09**: `inquiry.html` is referenced 4+ times across the codebase but **not in the repo** (likely broken link)
  - **Fix**: Create `inquiry.html` (simple form), or redirect to `contact.html`
- **G-UX-10**: `staff.html` and `holidays.html` referenced from `student-dashboard.html` (lines 252, 246) are **not in the repo**
  - **Fix**: Create both files, or change links
- **G-UX-11**: Inline mousemove parallax on `admissions.html` (315-320) and `contact.html` (329-335) causes repaints on every mousemove — bad performance
  - **Fix**: Remove or use `requestAnimationFrame` + 60ms throttle
- **G-UX-12**: Banner images on `admissions.html` are `max-width: 450px` (line 36) — too small on desktop
  - **Fix**: Increase to 800px or make full-width
- **G-UX-13**: No structured data (`application/ld+json`) on any public page — poor Google rich results
  - **Fix**: Add `School`, `FAQPage`, `Course` schemas to relevant pages
- **G-UX-14**: No favicon declared in many pages
  - **Fix**: Add `<link rel="icon" href="/images/favicon.png">` to all pages
- **G-UX-15**: No `lang="hi"` alternate link — NEP 2020 requires Hindi support
  - **Fix**: Add `<link rel="alternate" hreflang="hi" href="?lang=hi">` to public pages

### Functional
- **G-FN-01**: No "Forgot password" flow on `admin-login.html`
  - **Fix**: Add `firebase.auth().sendPasswordResetEmail(email)` UI
- **G-FN-02**: No "Apply for Leave" workflow in student portal
  - **Fix**: New section in `student-dashboard.html` + admin approval flow
- **G-FN-03**: No "Pay Fees Online" button — fee card shows balance but no payment link
  - **Fix**: Add Razorpay button → depends on G-INT-01
- **G-FN-04**: No "Multi-child" support in student portal — parents with 2+ kids can't switch
  - **Fix**: Add child selector in sidebar; store `selectedStudentId` in sessionStorage
- **G-FN-05**: No bulk import for most modules (classes, subjects, exams, holidays, library books) — only student bulk import exists
  - **Fix**: Add CSV upload + validation for each module
- **G-FN-06**: No CSV export for most modules (only student list)
  - **Fix**: Add export to all table views
- **G-FN-07**: No "Apply for TC" (Transfer Certificate) workflow
  - **Fix**: Add form + admin approval + PDF generation
- **G-FN-08**: No "Mark attendance via GPS" for older students with phones
  - **Fix**: Use `navigator.geolocation` + reverse-geocode school location; radius check
- **G-FN-09**: No "Real-time" anything — all Firestore queries are one-shot reads
  - **Fix**: Use `onSnapshot()` for notices, attendance, fee balance

### Performance
- **G-PERF-01**: `admin-dashboard.html` is 8,053 lines / 445 KB — impossible to maintain, slow to load
  - **Fix**: Split into per-section partials loaded via `fetch().then(inject)`. Use `<template>` tags.
- **G-PERF-02**: Tailwind CSS loaded via CDN on `admin-login.html`, `student-login.html`, `super-admin-pro.html`, `platform.html`, `tool-question-formatter.html` — 1.4 MB+ download
  - **Fix**: Compile Tailwind locally; ship only used classes
- **G-PERF-03**: All admin dashboard JS modules load on every page load (even hidden sections)
  - **Fix**: Lazy-load modules on section show (`import()` dynamic imports)
- **G-PERF-04**: No service worker / offline mode — admins on flaky networks get stuck on the 12-second fail-safe
  - **Fix**: Add PWA manifest + service worker for portal pages
- **G-PERF-05**: Google Maps iframe in footer loads on every page even when not in viewport
  - **Fix**: Use IntersectionObserver; only inject when scrolled into view

---

## 🟢 P2 — Differentiation (next 90 days)

### Mobile & PWA
- **G-PWA-01**: No PWA manifest — cannot "Add to Home Screen"
  - **Fix**: Add `manifest.json`, service worker, app icons (192px, 512px)
- **G-PWA-02**: No offline mode for any page
  - **Fix**: Cache static assets + last-known data in IndexedDB
- **G-PWA-03**: No push notification support (Web Push API + FCM)
  - **Fix**: Add Web Push subscription, send via FCM; integrate with `erp-notifications.js` (currently a stub)
- **G-MOBILE-01**: Sidebar toggle behavior on mobile is hidden in JS — should be tested on real devices
  - **Fix**: Verify UX on 360x640 to 414x896 screens

### Internationalization
- **G-I18N-01**: No i18n system — all content is English
  - **Fix**: Add `lang` toggle, use `data-i18n` attributes, support `?lang=hi`
- **G-I18N-02**: No Hindi translations of any CMS-driven content
  - **Fix**: Add `titleHi`, `subtitleHi` fields to CMS; show based on `lang`
- **G-I18N-03**: No support for Devanagari script rendering in the report card factory
  - **Fix**: Use a Devanagari font in PDF generation

### Analytics & Reporting
- **G-AN-01**: No audit log of admin actions
  - **Fix**: Create `auditLog` collection; write on every CUD operation
- **G-AN-02**: No school-level analytics (active users, page views, popular features)
  - **Fix**: Add `analytics` collection; track page views, button clicks via `gtag.js` or Plausible
- **G-AN-03**: No super-admin-level analytics (revenue, churn, growth)
  - **Fix**: Build on top of `auditLog` + per-school metrics
- **G-AN-04**: No usage dashboard for schools ("you've used X GB of storage, X messages sent")
  - **Fix**: Add "Usage" card to super-admin-pro dashboard

### Differentiator Features
- **G-DIFF-01**: AI Question Extractor in `tool-question-formatter.html` is **non-functional** (button is disabled, no AI wired up)
  - **Fix**: Integrate Gemini Vision API or Cloud Vision; add API key management
- **G-DIFF-02**: No "Question Bank" — common questions must be re-typed
  - **Fix**: Add `questionBank` collection; drag-drop into paper editor
- **G-DIFF-03**: No math equation rendering (KaTeX/MathJax) — math/science questions poorly formatted
  - **Fix**: Integrate KaTeX; add equation editor
- **G-DIFF-04**: No "Answer Key" mode in `tool-question-formatter.html` — paper and answers in one doc
  - **Fix**: Add toggle between Question Paper and Answer Sheet layouts
- **G-DIFF-05**: No "360° Virtual Tour" on `facilities.html`
  - **Fix**: Add Panoee or Kuula embed (CMS-driven)
- **G-DIFF-06**: No "Campus Tour Video" on `facilities.html`
  - **Fix**: Add YouTube/Vimeo embed (CMS-driven URL)
- **G-DIFF-07**: No "Parent-Teacher Meeting" scheduler
  - **Fix**: New module in admin dashboard
- **G-DIFF-08**: No "Live Class" / video conferencing
  - **Fix**: Integrate Jitsi (free) or Zoom SDK
- **G-DIFF-09**: No "Online Exam" mode (CBT — Computer Based Testing)
  - **Fix**: New `exam-online` module; auto-grading for MCQ

### Documentation
- **G-DOC-01**: No JSDoc / TypeScript on any JS file
  - **Fix**: Add JSDoc to all exported functions
- **G-DOC-02**: No API documentation for Firestore collections
  - **Fix**: Create `docs/firestore-schema.md`
- **G-DOC-03**: No developer setup guide (only README)
  - **Fix**: Create `CONTRIBUTING.md` with dev env setup
- **G-DOC-04**: No architecture diagram
  - **Fix**: Add to `docs/architecture.md` (Mermaid.js)
- **G-DOC-05**: No changelog
  - **Fix**: Add `CHANGELOG.md` (Keep a Changelog format)

---

## ⚪ P3 — Defer (6+ months)

### Enterprise
- **G-ENT-01**: SOC 2 / ISO 27001 compliance — not needed for SMB, defer to enterprise customers
- **G-ENT-02**: COPPA compliance — not needed for India (covered by DPDP)
- **G-ENT-03**: SAML SSO — defer to enterprise
- **G-ENT-04**: Custom domain per school — defer to paid tier
- **G-ENT-05**: White-label branding per school — partial via CMS, defer fully white-label

### Advanced Modules
- **G-ADV-01**: Biometric attendance (fingerprint/face) — defer
- **G-ADV-02**: RFID integration for bus tracking — defer
- **G-ADV-03**: GPS bus tracking for parents — defer
- **G-ADV-04**: Hostel management — defer (Apex is day school)
- **G-ADV-05**: Cafeteria / canteen management — defer
- **G-ADV-06**: Inventory management (school store) — defer
- **G-ADV-07**: Accounting / Tally integration — defer
- **G-ADV-08**: HR / payroll — defer (employee modules are "Under construction" anyway)

### Tech Debt
- **G-TD-01**: No `package.json` at root — no dependency management
- **G-TD-02**: No build step — all CSS/JS hand-written, no minification
- **G-TD-03**: No unit tests, integration tests, or e2e tests
- **G-TD-04**: No CI/CD (only `firebase deploy` is manual)
- **G-TD-05**: No ESLint config in repo (only ad-hoc checks)
- **G-TD-06**: No Prettier config
- **G-TD-07**: No `.editorconfig`
- **G-TD-08**: Duplicate "FEES MANAGEMENT" sidebar (also in P0)
- **G-TD-09**: Two super-admin pages (`super-admin.html` legacy + `super-admin-pro.html` modern)
- **G-TD-10**: Three report card files (`erp-report-card-tool.js` v1 44 lines, `erp-report-card-tool-v2.js` 147 lines, `report-card-factory.js` 479 lines, `report-card-upload.js` 206 lines) — high duplication

### Multi-tenant Cleanup
- **G-MT-01**: `provision.html` is Apex-specific (hard-coded phone, email) — should not exist
- **G-MT-02**: `contact.html` has Apex-specific phone, email hard-coded in the page (also in CMS)
- **G-MT-03**: `floating-button.html` has Apex phone + email hard-coded
- **G-MT-04**: `header.html` has Apex UDISE+reg hard-coded as default
- **G-MT-05**: `footer.html` has Apex copyright hard-coded

---

## Gap Summary by Category

| Category | 🔴 P0 | 🟡 P1 | 🟢 P2 | ⚪ P3 | Total |
|---|---|---|---|---|---|
| Security | 5 | 0 | 0 | 0 | 5 |
| Privacy / DPDP | 5 | 0 | 0 | 0 | 5 |
| Integration | 3 | 3 | 0 | 0 | 6 |
| UX & Content | 3 | 12 | 0 | 0 | 15 |
| Functional | 0 | 9 | 0 | 0 | 9 |
| Performance | 0 | 5 | 0 | 0 | 5 |
| PWA / Mobile | 0 | 0 | 4 | 0 | 4 |
| i18n | 0 | 0 | 3 | 0 | 3 |
| Analytics | 0 | 0 | 4 | 0 | 4 |
| Differentiator | 0 | 0 | 9 | 0 | 9 |
| Documentation | 0 | 0 | 5 | 0 | 5 |
| Enterprise | 0 | 0 | 0 | 5 | 5 |
| Advanced Modules | 0 | 0 | 0 | 8 | 8 |
| Tech Debt | 0 | 0 | 0 | 10 | 10 |
| Multi-tenant | 0 | 0 | 0 | 5 | 5 |
| **Total** | **16** | **29** | **25** | **28** | **98** |

---

## Effort Estimate

| Severity | Estimated total effort | Suggested timeline |
|---|---|---|
| 🔴 P0 (16 items) | ~6-8 weeks (1-2 devs) | 0-2 months |
| 🟡 P1 (29 items) | ~12-16 weeks (2-3 devs) | 2-6 months |
| 🟢 P2 (25 items) | ~16-24 weeks (3-4 devs) | 6-12 months |
| ⚪ P3 (28 items) | TBD | 12+ months |
