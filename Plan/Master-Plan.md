# Master Plan — Step-by-Step Execution

> **The single source of truth for "what to do next" in SNR Edu ERP.**
> Consolidates `00-master-analysis.md`, `01-gaps.md`, and `02-roadmap.md` into a concrete, ordered, checkable action plan.
>
> **How to use this file**: Work top-to-bottom within a phase, then move to the next phase. Each task has a checkbox, a file path, an effort estimate, and a verification step.
> **Do not skip tasks within a phase** — later tasks often depend on earlier ones.

---

## Table of Contents
- [Phase 0: Pre-Flight (Day 0)](#phase-0-pre-flight-day-0)
- [Phase 1: Security Lockdown (Weeks 1-2)](#phase-1-security-lockdown-weeks-1-2)
- [Phase 2: Quick Wins & Dead Code (Week 3)](#phase-2-quick-wins--dead-code-week-3)
- [Phase 3: Privacy & Compliance (Week 4)](#phase-3-privacy--compliance-week-4)
- [Phase 4: Critical Integrations (Weeks 5-6)](#phase-4-critical-integrations-weeks-5-6)
- [Phase 5: Marketing & Lead Capture (Weeks 7-8)](#phase-5-marketing--lead-capture-weeks-7-8)
- [Phase 6: Multi-Tenant Cleanup (Weeks 9-10)](#phase-6-multi-tenant-cleanup-weeks-9-10)
- [Phase 7: Communication (Weeks 11-12)](#phase-7-communication-weeks-11-12)
- [Phase 8: PWA & Mobile (Weeks 13-16)](#phase-8-pwa--mobile-weeks-13-16)
- [Phase 9: ExamCraft AI (Weeks 17-20)](#phase-9-examcraft-ai-weeks-17-20)
- [Phase 10: Tech Debt (Weeks 21-24)](#phase-10-tech-debt-weeks-21-24)
- [Cross-Phase: Decision Log](#cross-phase-decision-log)
- [Cross-Phase: Testing Checklist](#cross-phase-testing-checklist)
- [Cross-Phase: Definition of Done](#cross-phase-definition-of-done)

---

## Phase 0: Pre-Flight (Day 0)

> **Goal**: Set up branches, backups, and verification environment before touching anything.
> **Effort**: 1 day
> **Owner**: Tech lead

### 0.1 Backup the current state
- [ ] Tag the current `main` branch: `git tag pre-master-plan-2026-06-02 -m "State before Master Plan execution"`
- [ ] Create a backup zip of the project: `Compress-Archive -Path D:\Snredu\* -DestinationPath D:\Snredu-backup-2026-06-02.zip`
- [ ] Export the Firestore data: `firebase firestore:export gs://apex-public-school-portal.appspot.com/backups/2026-06-02`
- [ ] Note the current Firestore rules file: copy `firestore.rules` (if exists) to `firestore.rules.backup-2026-06-02`

### 0.2 Create working branches
- [ ] `git checkout -b phase-1-security`
- [ ] `git checkout -b phase-2-quickwins`
- [ ] `git checkout -b phase-3-privacy`
- [ ] `git checkout -b phase-4-integrations`
- [ ] `git checkout main` (base)

### 0.3 Verify local environment
- [ ] Node.js installed (`node --version` → ≥ 18)
- [ ] Firebase CLI installed (`firebase --version` → ≥ 13)
- [ ] Git configured (`git config user.name` / `user.email`)
- [ ] VS Code / preferred editor with markdown preview
- [ ] Test `firebase serve` works locally (no deploy yet)

### 0.4 Read the supporting docs
- [ ] `D:\Snredu\Plan\00-master-analysis.md` (architecture overview)
- [ ] `D:\Snredu\Plan\01-gaps.md` (all 98 gaps, severity-coded)
- [ ] `D:\Snredu\Plan\02-roadmap.md` (strategic priorities, OKRs)
- [ ] `D:\Snredu\IMAGE_STORAGE.md` (Base64 contract — recently changed)
- [ ] `D:\Snredu\market-research-2026.md` (competitive positioning)

**🚦 Phase 0 Exit Gate**: All 4 docs read, backup taken, branches created. Don't start Phase 1 without this.

---

## Phase 1: Security Lockdown (Weeks 1-2)

> **Goal**: Eliminate all P0 security gaps so the app can be safely deployed to any tenant.
> **Effort**: 10 working days (2 devs, 1 week each)
> **Owner**: Backend lead + Frontend lead
> **Branch**: `phase-1-security`
> **Blocks**: Any production deploy

### 1.1 Re-enable admin auth guards
- **File**: `D:\Snredu\js\admin-auth.js` (lines 78-99)
- **Action**:
  - Uncomment the auth check block
  - Verify `firebase.auth().onAuthStateChanged` redirects to `/portal/admin-login.html` when no user
  - Verify the user has `customClaims.role === 'admin'` or `'super_admin'`
  - Add a 5-minute idle timeout (auto-logout)
- **Effort**: 0.5 day
- **Verify**: Open `admin-dashboard.html` in incognito → should redirect to login
- **Verify**: Log in with valid admin → should see dashboard
- **Verify**: Wait 5 min idle → should auto-logout

### 1.2 Migrate student auth to Firebase Phone (OTP)
- **Files**:
  - `D:\Snredu\portal\student-login.html` (UI)
  - `D:\Snredu\js\student-auth.js` (logic)
- **Action**:
  - Add reCAPTCHA invisible widget to the login form
  - Replace phone+name auth with phone+OTP (`firebase.auth().signInWithPhoneNumber`)
  - Keep "Continue as Visitor" but limit to non-PII data
  - Update `student-dashboard.html` auth check to use new auth state
- **Effort**: 1 week
- **Verify**: Login with a test phone receives OTP via SMS
- **Verify**: Wrong OTP is rejected
- **Verify**: OTP expires after 5 minutes
- **Verify**: Visitor mode shows only template data, no real student PII

### 1.3 Remove `/provision.html` from public hosting
- **Files**:
  - `D:\Snredu\provision.html` (delete from hosting)
  - `D:\Snredu\firebase.json` (add rewrite)
  - `D:\Snredu\scripts\provision-multi-school.js` (verify exists; if not, create)
- **Action**:
  - In `firebase.json`, add: `{"source": "/provision.html", "destination": "/404.html"}` under `rewrites` or `redirects`
  - Move the provisioning logic to `scripts/provision-multi-school.js` (Node.js, run with admin credentials locally)
  - Update README to document the new provisioning command
- **Effort**: 0.5 day
- **Verify**: `curl https://apex-public-school-portal.web.app/provision.html` returns 404
- **Verify**: Running `node scripts/provision-multi-school.js` with admin creds provisions SCH001 and SCH002

### 1.4 Tighten Firestore rules
- **File**: `D:\Snredu\firestore.rules` (create if missing)
- **Action**: Implement the following ruleset (read in order):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: is the user authenticated?
    function isAuth() { return request.auth != null; }

    // Helper: is the user a super admin?
    function isSuperAdmin() {
      return isAuth() && request.auth.token.role == 'super_admin';
    }

    // Helper: is the user an admin of this school?
    function isSchoolAdmin(schoolId) {
      return isAuth() && (
        request.auth.token.role == 'super_admin' ||
        request.auth.token.schoolId == schoolId
      );
    }

    // Public school settings (read-only for everyone)
    match /schools/{schoolId}/settings/general {
      allow read: if true;
      allow write: if isSchoolAdmin(schoolId);
    }

    // Public CMS content
    match /schools/{schoolId}/cms/{document=**} {
      allow read: if true;
      allow write: if isSchoolAdmin(schoolId);
    }

    // Students: read by school admin, write by school admin, read by self (student)
    match /schools/{schoolId}/students/{studentId} {
      allow read: if isSchoolAdmin(schoolId) ||
                     (isAuth() && request.auth.token.studentId == studentId);
      allow create, update: if isSchoolAdmin(schoolId);
      allow delete: if isSuperAdmin();
    }

    // Fees, payments, exams, results, attendance, library, transport:
    // Read by school admin, write by school admin
    match /schools/{schoolId}/{collection}/{doc=**} {
      allow read, write: if isSchoolAdmin(schoolId);
    }

    // Public inquiries: anyone can create, only admin can read/update
    match /inquiries/{inquiryId} {
      allow create: if true;
      allow read, update, delete: if isSuperAdmin() ||
                                   (isAuth() && resource.data.schoolId == request.auth.token.schoolId);
    }

    // Super admin collections
    match /{document=**} {
      allow read, write: if isSuperAdmin();
    }
  }
}
```

- **Effort**: 3 days (write + test)
- **Verify**: Try to read another school's data → denied
- **Verify**: Unauthenticated user can read `schools/SCH001/settings/general` and CMS, nothing else
- **Verify**: Deploy rules: `firebase deploy --only firestore:rules`

### 1.5 Add PII redaction on student profile
- **File**: `D:\Snredu\portal\student-dashboard.html` (profile section, lines 434-499)
- **Action**:
  - Aadhar: show `XXXX-XXXX-{last4}` with "Tap to reveal" → expands to full
  - Phone: show as `98XXX XXXXX` (mask middle 4)
  - Address: show "Tap to reveal" → expands
  - Auto-hide after 10 seconds
  - Log a `pii_view` event to `auditLog` for DPDP compliance
- **Effort**: 1 day
- **Verify**: Take a screenshot, run OCR → can't extract Aadhar/phone
- **Verify**: Audit log entry is created when PII is revealed

**🚦 Phase 1 Exit Gate**:
- [ ] `git tag phase-1-security-complete`
- [ ] Run `firebase deploy --only firestore:rules,hosting` to staging environment
- [ ] Manual QA: log in as admin → all features work
- [ ] Manual QA: log in as student with OTP → can see own data, can't see other students
- [ ] Penetration test: try SQL-injection-style attacks on contact form → rejected

---

## Phase 2: Quick Wins & Dead Code (Week 3)

> **Goal**: Eliminate UI debt that confuses users and admins. No design needed, no integration needed.
> **Effort**: 5 working days (1 dev)
> **Owner**: Frontend lead
> **Branch**: `phase-2-quickwins`
> **Can run in parallel with Phase 1 if separate dev**

### 2.1 Remove 6 "Module Under Construction" placeholders
- **File**: `D:\Snredu\portal\admin-dashboard.html` (lines 7929-8048)
- **Action**:
  - Open the file, find the 6 sections (search for `data-lucide="construction"`)
  - For each section, **remove the `<section>` block entirely**
  - Also remove the corresponding `nav-link` from the sidebar (search for `showSection('teacherTimetables')` etc.)
  - For HR/Employee items (3 sections): add a roadmap note in the page header: "Employee management is on the Q3 2026 roadmap"
  - For Notifications (2 sections): add a roadmap note
  - For Library Transactions: keep the section, hide it from sidebar, document why
  - For Teacher Timetables: same
- **Effort**: 0.5 day
- **Verify**: No `data-lucide="construction"` in HTML
- **Verify**: Sidebar doesn't show "Teacher Timetables", "Send Notification", etc.

### 2.2 Fix duplicate "FEES MANAGEMENT" sidebar entry
- **File**: `D:\Snredu\portal\admin-dashboard.html`
- **Action**:
  - Find the two `<div class="nav-category" id="navFees">` blocks (lines 181-207 and 266-305)
  - Delete the **shorter** one (lines 181-207, the first occurrence with 6 sub-items)
  - Keep the longer one (lines 266-305, with 10 sub-items)
  - The shorter one is likely a copy-paste leftover
- **Effort**: 0.25 day
- **Verify**: Only one "Fees Management" category in sidebar
- **Verify**: All 10 sub-items present and clickable

### 2.3 Rebrand "Nexorasoftagency" → "SNR World"
- **Files** (search all for the string "Nexorasoftagency"):
  - `D:\Snredu\portal\super-admin.html` (line 6, 282, 309, 265, etc.)
  - `D:\Snredu\portal\super-admin-pro.html` (line 6, 138, 436)
  - `D:\Snredu\js\super-admin.js`
  - `D:\Snredu\js\super-admin-pro.js`
  - Any other file referencing it
- **Action**:
  - Global find/replace `Nexorasoftagency` → `SNR World`
  - Update page titles from "Nexorasoftagency | Super Administrator" → "SNR World | Super Administrator"
  - Update footer from "Powered by Nexorasoftagency Cloud" → "Powered by SNR World Cloud"
- **Effort**: 0.5 day
- **Verify**: `grep -r "Nexorasoftagency" D:\Snredu` returns 0 results

### 2.4 Create missing files: `inquiry.html`, `staff.html`, `holidays.html`
- **Files to create** (referenced from `student-dashboard.html` lines 246, 252, 259 and 4+ other places):
  - `D:\Snredu\inquiry.html` (admission inquiry form, similar to `contact.html`)
  - `D:\Snredu\staff.html` (staff directory, similar to `gallery.html` but with bios)
  - `D:\Snredu\holidays.html` (holiday calendar, table view)
- **Action for each**:
  - Copy `school.html` as template
  - Replace the content sections
  - Use the same header/footer/partials
  - Link to `cms-settings.js` for CMS-driven content
  - Add a CMS collection if needed (`cms/holidays`, `cms/staff`)
- **Effort**: 1.5 days (0.5 day each)
- **Verify**: All 3 files open in browser, render content, link back to other pages
- **Verify**: No 404s in the student-dashboard.html quick-actions hub

### 2.5 Remove dead `<section class="hidden">` blocks
- **Files & sections to evaluate**:
  - `school.html` line 81: `birthdaySection` → if CMS toggle exists, wire it; else remove
  - `school.html` line 309: `testimonialsSection` → same
  - `about.html` line 201: `staffSection` → un-hide (staff is on the about page anyway)
  - `academics.html` line 169: `holidaysSection` → un-hide (now that `holidays.html` exists, link it)
  - `student-dashboard.html` line 300: `importantLinksWidget` → wire to CMS `cms/studentDashboardLinks`
  - `student-dashboard.html` line 313: `attendanceWidget` → un-hide, fill with real data
- **Action**:
  - For each: either remove the section or wire to CMS
  - If wiring: ensure CMS collection exists, test with sample data
- **Effort**: 1 day
- **Verify**: Sections either render real content OR are removed (no silent dead code)

### 2.6 Centralize inline counter animation
- **Files** (duplicated animation script):
  - `D:\Snredu\about.html` (lines 230-246)
  - `D:\Snredu\academics.html` (lines 193-209)
  - `D:\Snredu\facilities.html` (lines 281-296)
  - `D:\Snredu\school.html` (missing! Add it)
- **Action**:
  - Move the counter logic to `D:\Snredu\js\cms-settings.js` (or new `js/counters.js`)
  - Remove the 3 inline scripts
  - Add a single `<script>` call in `school.html`
- **Effort**: 0.5 day
- **Verify**: All 4 pages with `.counter` elements animate correctly
- **Verify**: No duplicate code in any file

### 2.7 Fix small content bugs
- **File**: `D:\Snredu\facilities.html` (line 228)
  - Change `data-target="10"` → `data-target="8"` (school founded 2018, current year 2026 = 8 years)
- **File**: `D:\Snredu\contact.html` (lines 265-267)
  - Replace `href="#"` social links with real URLs OR remove the "Follow Us" section
- **File**: `D:\Snredu\school.html` (line 18)
  - Update `og:image` to a real, hosted image (not the GitHub Pages URL)
- **File**: `D:\Snredu\admissions.html` (line 36)
  - Change `.ad-banner { max-width: 450px }` → `max-width: 800px`
- **Effort**: 0.25 day
- **Verify**: No `data-target="10"`, no `href="#"`, no broken og:image

### 2.8 Fix inline mousemove parallax
- **Files**:
  - `D:\Snredu\admissions.html` (lines 315-320)
  - `D:\Snredu\contact.html` (lines 329-335)
- **Action**:
  - Either remove the script entirely (simpler, no functional loss)
  - OR move to `script.js` with `requestAnimationFrame` + 60ms throttle
- **Recommendation**: Remove entirely
- **Effort**: 0.25 day
- **Verify**: Page scroll is smooth, no `mousemove` perf hit in DevTools Performance tab

### 2.9 Standardize Firebase SDK to 9.23.0
- **Files**:
  - `D:\Snredu\portal\admin-login.html` (currently 8.10.0, lines 293-295)
  - `D:\Snredu\provision.html` (currently 8.10.1, lines 6-7) — this file is being removed in Phase 1
  - `D:\Snredu\portal\super-admin.html` (currently 9.22.1, lines 512-514)
  - `D:\Snredu\portal\super-admin-pro.html` (currently 9.22.1, lines 683-685)
  - `D:\Snredu\portal\tool-question-formatter.html` (currently 9.22.1, lines 315-316)
- **Action**: Replace SDK URL with `https://www.gstatic.com/firebasejs/9.23.0/firebase-{service}-compat.js`
- **Effort**: 0.5 day
- **Verify**: All pages load, no console errors
- **Verify**: `grep -r "firebasejs/8" D:\Snredu` returns 0
- **Verify**: `grep -r "firebasejs/9.22" D:\Snredu` returns 0

### 2.10 Add favicon + basic meta tags to all pages
- **Files**: All 19 HTML files
- **Action**: Add to `<head>` of every page:
  ```html
  <link rel="icon" href="/images/favicon.png" />
  <meta name="theme-color" content="#1e40af" />
  ```
- **Effort**: 0.25 day
- **Verify**: Browser tab shows favicon on every page

**🚦 Phase 2 Exit Gate**:
- [ ] `git tag phase-2-quickwins-complete`
- [ ] No "Module Under Construction" in production
- [ ] No dead `<section class="hidden">` blocks
- [ ] All 3 missing files exist
- [ ] Branding is consistent
- [ ] Lighthouse score ≥ 80 (mobile)

---

## Phase 3: Privacy & Compliance (Week 4)

> **Goal**: DPDP Act 2023 compliance. Avoid legal risk for any school adopting the platform.
> **Effort**: 5 working days (1 dev + legal review)
> **Owner**: Backend lead + Legal counsel
> **Branch**: `phase-3-privacy`

### 3.1 Create `privacy.html`
- **File to create**: `D:\Snredu\privacy.html`
- **Content sections** (use a privacy policy generator like Termly + customize):
  1. **Introduction** — what data we collect
  2. **Data We Collect** — student name, DOB, Aadhar (optional), parent contact, photos, academic records
  3. **How We Use Data** — academic tracking, communication, statutory reporting
  4. **Data Sharing** — never sold, shared only with school + statutory bodies
  5. **Data Storage & Security** — Firebase (Google Cloud), India region
  6. **Your Rights** — access, correction, deletion, portability
  7. **Children's Data** — parental consent required for under-18
  8. **Cookies & Tracking** — none used currently
  9. **Contact DPO** — `{dpoEmail}` from school settings
  10. **Last Updated** — date
- **Effort**: 2-3 days (mostly writing; involve legal for review)
- **Verify**: Page renders, links from footer, all 10 sections present

### 3.2 Add consent checkbox to admission form
- **File**: `D:\Snredu\portal\admin-dashboard.html` (admission section, `addEnquirySection` / `studentAdmissionSection`)
- **Action**:
  - Add a `<input type="checkbox" required>` with label "I consent to the collection and processing of my child's data as per the [Privacy Policy](/privacy.html)"
  - On submit, write to Firestore: `consentGiven: true`, `consentTimestamp: serverTimestamp()`, `consentVersion: '1.0'`
  - Validate the checkbox is checked (HTML `required` handles this)
- **Effort**: 0.5 day
- **Verify**: Submitting without checking shows an error
- **Verify**: Firestore record has the consent fields

### 3.3 Add DPO contact to school settings + footer
- **Files**:
  - `D:\Snredu\js\firebase-config.js` (no change needed; DPO is per-school)
  - `D:\Snredu\js\cms-settings.js` (load DPO from `schools/{id}/settings/general`)
  - `D:\Snredu\footer.html` (add DPO slot, line ~45)
- **Action**:
  - Add `dpoEmail` and `dpoPhone` fields to school settings schema
  - Load them in `cms-settings.js` and populate new IDs in footer (`#footer-dpo-email`, `#footer-dpo-phone`)
  - In `footer.html`, add a new line: `<p>Data Protection Officer: <span id="footer-dpo-email"></span> | <span id="footer-dpo-phone"></span></p>`
- **Effort**: 0.5 day
- **Verify**: Footer shows DPO email + phone on every page
- **Verify**: DPO info is editable in CMS

### 3.4 Build Data Subject Request (DSR) workflow
- **Files**:
  - `D:\Snredu\portal\admin-dashboard.html` (add a new section: `dsrSection` in Settings)
  - `D:\Snredu\js\admin-dashboard.js` (handler for the section)
  - New collection: `dsrRequests`
- **Action**:
  - Create a new admin section "Data Subject Requests"
  - Show list of pending requests (parent/guardian name, request type, date)
  - Types: "Access my data" / "Delete my data" / "Export my data"
  - Buttons: "Approve & Export" (generates JSON of all data) / "Approve & Delete" (soft-deletes) / "Reject"
  - Log all decisions in `auditLog`
- **Effort**: 1.5 days
- **Verify**: Submit a DSR via Firestore console → appears in admin section
- **Verify**: Approve & Export generates a valid JSON of all student data
- **Verify**: Audit log has the decision

### 3.5 Document data retention policy
- **File**: `D:\Snredu\privacy.html` (add section)
- **Content**:
  - Active student records: kept for duration of enrollment + 7 years
  - Graduated students: archived after 7 years
  - Financial records: 8 years (Indian tax law)
  - Inquiries: 1 year
  - Audit logs: 3 years
- **Action**: Add a Cloud Function scheduled task (daily) to soft-delete records past their retention date
- **Effort**: 0.5 day (mostly documentation; Cloud Function is 1-2 days extra)
- **Verify**: Privacy page has the retention policy
- **Verify**: A test record with old `retentionUntil` gets flagged for deletion (don't auto-delete in dev)

**🚦 Phase 3 Exit Gate**:
- [ ] Privacy policy live
- [ ] Consent checkbox on admission form
- [ ] DPO contact in footer
- [ ] DSR workflow functional
- [ ] Retention policy documented
- [ ] Legal counsel sign-off

---

## Phase 4: Critical Integrations (Weeks 5-6)

> **Goal**: Enable online fee collection and SMS notifications — the two most-requested missing features.
> **Effort**: 10 working days (2 devs)
> **Owner**: Backend lead
> **Branch**: `phase-4-integrations`
> **External dependencies**: Razorpay account, MSG91 account

### 4.1 Integrate Razorpay payment gateway
- **Files to modify**:
  - `D:\Snredu\js\erp-fees.js` (add "Pay Now" button + Razorpay modal)
  - `D:\Snredu\js\services\payment-service.js` (integrate with Razorpay API)
  - `D:\Snredu\portal\student-dashboard.html` (fees section, add "Pay Online" button)
- **Prerequisites**:
  - Razorpay account created: https://dashboard.razorpay.com
  - API keys (test + live) obtained
  - Webhook URL configured: `https://us-central1-apex-public-school-portal.cloudfunctions.net/razorpayWebhook`
- **Action**:
  - Add Razorpay checkout script: `<script src="https://checkout.razorpay.com/v1/checkout.js"></script>` to student-dashboard.html
  - In `erp-fees.js`, on "Pay Online" click:
    1. Create a Razorpay order via Cloud Function (server-side, with API secret)
    2. Open Razorpay checkout with order_id
    3. On success, get `payment_id` + `signature`
    4. Verify signature server-side via Cloud Function
    5. Update `payments` collection in Firestore atomically
  - In `payment-service.js`, ensure the atomic FIFO logic still works (it must, even with online payment)
- **Cloud Functions to create** (in `functions/` directory):
  - `createRazorpayOrder` (callable) — creates order, returns order_id
  - `verifyRazorpayPayment` (callable) — verifies signature, updates Firestore
  - `razorpayWebhook` (HTTP) — handles async events (refund, dispute)
- **Effort**: 1 week
- **Verify**: Pay ₹1 in test mode → fee balance decreases, receipt generated
- **Verify**: Failed payment shows error, fee balance unchanged
- **Verify**: Webhook signature verification works
- **Verify**: Refund flow works (manual from Razorpay dashboard)

### 4.2 Integrate MSG91 SMS gateway
- **Files to modify**:
  - `D:\Snredu\functions\sendSms.js` (new Cloud Function)
  - `D:\Snredu\portal\contact.html` (inquiry form trigger)
  - `D:\Snredu\js\erp-fees.js` (fee payment trigger)
  - `D:\Snredu\js\erp-attendance.js` (absent student trigger)
- **Prerequisites**:
  - MSG91 account: https://msg91.com
  - Auth key obtained
  - DLT registration done (required for India SMS)
  - SMS templates registered (welcome, fee-reminder, absent, etc.)
- **Action**:
  - Create `sendSms({to, template, data})` Cloud Function
  - Use Firestore triggers:
    - `inquiries/{id} onCreate` → SMS to school admin
    - `payments/{id} onCreate` → SMS receipt to parent
    - `attendance/{id} onCreate` (with `status: 'absent'`) → SMS to parent
  - Store API key in Firebase Functions config: `firebase functions:config:set msg91.key="..."`
- **Effort**: 3-5 days
- **Verify**: Submit contact form → school admin gets SMS
- **Verify**: Pay fee online → parent gets receipt SMS
- **Verify**: Mark student absent → parent gets SMS
- **Verify**: MSG91 dashboard shows messages sent

### 4.3 (Optional) Integrate WhatsApp Cloud API
- **Decision**: Defer to Phase 7 if time-constrained. P1 priority.
- **If doing now**:
  - Create Meta Business account
  - Apply for WhatsApp Cloud API access
  - Register message templates (fee-reminder, attendance, homework, exam)
  - Cloud Function: `sendWhatsapp({to, template, params})`
- **Effort**: 1-2 weeks (separate workstream)

**🚦 Phase 4 Exit Gate**:
- [ ] Razorpay live in test mode
- [ ] MSG91 sends test SMS successfully
- [ ] 3 automated triggers (inquiry, payment, absent) work
- [ ] All SMS visible in MSG91 dashboard
- [ ] Error handling for failed SMS / payments
- [ ] Cost monitoring: log SMS sent, log payment volume

---

## Phase 5: Marketing & Lead Capture (Weeks 7-8)

> **Goal**: Convert traffic on `platform.html` into demo bookings. This is the GTM engine.
> **Effort**: 10 working days (1 dev + 1 designer)
> **Owner**: Marketing lead + Frontend
> **Branch**: `phase-5-marketing`
> **Requires decision**: Pricing (see Decision Log)

### 5.1 Make pricing decision
- **File**: New: `D:\Snredu\docs\pricing-decision.md`
- **Decision needed**:
  - Confirm or revise ₹4/student/month for Basic tier
  - Confirm tier structure (Free / Basic / Standard / Premium)
  - Decide if free tier is truly free or freemium
- **Stakeholders**: Founder, Sales lead, Finance
- **Effort**: 2-3 days (decision + financial model)
- **Verify**: `pricing-decision.md` signed off

### 5.2 Rebuild `platform.html` with full marketing content
- **File**: `D:\Snredu\platform.html`
- **Sections to add/replace**:
  1. Hero (existing) — keep
  2. **Trust strip** — 5-10 customer logos (placeholders OK initially)
  3. **Pain points** — "Running a school on registers? You need..." (3-4 pain points)
  4. **Solution overview** — animated GIF or short video
  5. **Features grid** (existing) — expand to 9 features
  6. **Customer story** — 1 detailed case study (Apex Public School)
  7. **Pricing** — 4-tier table (per 5.1 decision)
  8. **Comparison** — SNR vs Teachmint vs Fedena vs Education Desk
  9. **FAQ** — 8-10 common questions
  10. **Final CTA** — "Book a Demo"
- **Effort**: 1 week
- **Verify**: All sections render, links work, mobile-responsive

### 5.3 Add "Book Demo" lead capture form
- **Files**:
  - `D:\Snredu\platform.html` (add the form)
  - New: `D:\Snredu\js\demo-request.js` (form handler)
  - New Cloud Function: `notifyDemoRequest` (emails super admin)
- **Form fields**:
  - School name
  - Contact person (name + role)
  - Email
  - Phone
  - Student count (dropdown: <200, 200-500, 500-1000, 1000+)
  - Current system (text, optional)
  - Preferred demo time (3 date slots)
- **Action**:
  - Form writes to `demoRequests` collection
  - Cloud Function on `demoRequests` create → emails `super@snreduerp.com` with details
  - Show success page with calendar link
- **Effort**: 1.5 days
- **Verify**: Submit form → email arrives within 5 minutes
- **Verify**: Lead appears in `demoRequests` collection

### 5.4 Add 2-min product demo video
- **Files**:
  - `D:\Snredu\platform.html` (embed)
  - YouTube video (need to record)
- **Action**:
  - Record a 2-min walkthrough of admin dashboard + student portal (use Loom or OBS)
  - Upload to YouTube (unlisted or public)
  - Embed in `platform.html` with a thumbnail
- **Effort**: 1-2 days (recording + editing)
- **Verify**: Video plays, autoplay disabled (per UX best practice)

### 5.5 Add `sitemap.xml` + `robots.txt`
- **Files to create**:
  - `D:\Snredu\sitemap.xml` (list all public URLs)
  - `D:\Snredu\robots.txt` (allow all + sitemap reference)
- **Action**:
  - Generate `sitemap.xml` with all 9 public pages
  - For multi-tenant: add a note that each tenant gets their own sitemap
- **Effort**: 0.5 day
- **Verify**: Submit sitemap to Google Search Console
- **Verify**: `curl https://apex-public-school-portal.web.app/sitemap.xml` returns valid XML

### 5.6 Add structured data to public pages
- **Files**: All 9 public pages
- **Action**:
  - `school.html` — `School` schema (name, address, phone, logo, geo)
  - `about.html` — `AboutPage` + `Person` (principal) schema
  - `academics.html` — `Course` schema
  - `admissions.html` — `FAQPage` schema
  - `contact.html` — `ContactPage` schema
  - `platform.html` — `SoftwareApplication` schema
  - All pages — `Organization` schema (school as organization)
- **Use**: https://schema.org for schema definitions
- **Test with**: https://search.google.com/test/rich-results
- **Effort**: 2-3 days
- **Verify**: Rich results test passes for all pages

**🚦 Phase 5 Exit Gate**:
- [ ] `platform.html` has 10 marketing sections
- [ ] Demo form captures leads → super admin gets email
- [ ] Video plays
- [ ] Sitemap submitted to Google
- [ ] Structured data passes rich results test
- [ ] Lighthouse SEO score ≥ 95

---

## Phase 6: Multi-Tenant Cleanup (Weeks 9-10)

> **Goal**: Make `SCH002` (or any new tenant) deployable without code changes. This is what unlocks paid customers.
> **Effort**: 10 working days (2 devs)
> **Owner**: Frontend lead + Backend lead
> **Branch**: `phase-6-multitenant`

### 6.1 Add `data-school-field` annotation system
- **Files**: `D:\Snredu\js\cms-settings.js`
- **Action**:
  - Replace all `getElementById('footer-school-name').innerText = data.name` with a generic loop:
    ```js
    document.querySelectorAll('[data-school-field]').forEach(el => {
      const field = el.dataset.schoolField;
      if (data[field]) el.textContent = data[field];
    });
    ```
  - Convert all hard-coded identity slots to use this pattern
- **Effort**: 1 day
- **Verify**: All CMS-driven slots work via the new pattern
- **Verify**: No regressions on Apex (data matches)

### 6.2 Remove hard-coded Apex values from partials
- **Files**:
  - `D:\Snredu\header.html` — UDISE+reg default
  - `D:\Snredu\footer.html` — copyright, address, phone, email
  - `D:\Snredu\floating-button.html` — phone, email, WhatsApp
  - `D:\Snredu\contact.html` — phone, email, address
- **Action**:
  - Replace hard-coded text with `<span data-school-field="phone">` etc.
  - For images (logo, banners): use `data-school-field="logoUrl"` on `<img>` tags
- **Effort**: 1 day
- **Verify**: Switch school context in firebase-config.js to test → partials update correctly

### 6.3 Centralize counter animation (already done in 2.6 — verify)
- **Verify** all 4 pages use the centralized version

### 6.4 Add subdomain availability check
- **Files**:
  - `D:\Snredu\js\super-admin-pro.js` (Add School form)
  - `D:\Snredu\js\super-admin.js` (legacy)
- **Action**:
  - On subdomain input, query Firestore for `schools` where subdomain == value
  - Show green check or red X
  - Disable submit if taken
- **Effort**: 0.5 day
- **Verify**: Try to add a school with existing subdomain → blocked

### 6.5 Add Firebase App Check (reCAPTCHA v3)
- **Files**:
  - `D:\Snredu\js\firebase-config.js` (initialize App Check)
  - `D:\Snredu\portal\admin-login.html`, `student-login.html` (already covered by Phase 1.2)
  - `D:\Snredu\portal\contact.html` (form)
  - `D:\Snredu\portal\super-admin-pro.html` (Add School form)
- **Action**:
  - Register reCAPTCHA v3 key in Firebase Console
  - Add `firebase.appCheck().activate('reCAPTCHA-v3-site-key', true)` to firebase-config.js
  - Verify Cloud Functions enforce App Check tokens
- **Effort**: 1-2 days
- **Verify**: Bot submission to contact form is rejected
- **Verify**: Human submission still works

### 6.6 Add rate limiting
- **Files**:
  - `D:\Snredu\functions\rateLimit.js` (new Cloud Function helper)
  - `D:\Snredu\portal\contact.html` (client-side debounce)
  - `D:\Snredu\portal\admin-login.html` (client-side lockout after 5 fails)
- **Action**:
  - Cloud Function: count requests per IP per hour, return 429 if over limit
  - Client-side: 3-second debounce on submit buttons
  - Login: lockout for 15 min after 5 failed attempts
- **Effort**: 1-2 days
- **Verify**: 100 rapid submits → only 10 succeed, rest get rate-limited

### 6.7 Add "Forgot password" flow
- **File**: `D:\Snredu\portal\admin-login.html`
- **Action**:
  - Add "Forgot password?" link below password field
  - On click: show email input, call `firebase.auth().sendPasswordResetEmail(email)`
  - Show success message
- **Effort**: 0.5 day
- **Verify**: Trigger password reset → email received

### 6.8 Test full multi-tenant flow
- **Action**:
  - Spin up SCH002 in Firestore (use `scripts/provision-multi-school.js`)
  - Switch `firebase-config.js` to use SCH002
  - Load `https://apex-public-school-portal.web.app/?schoolId=SCH002`
  - Verify all public pages render with SCH002 branding
  - Log in as SCH002 admin → only SCH002 data visible
- **Effort**: 1 day
- **Verify**: Zero hard-coded Apex values leak into SCH002 view

**🚦 Phase 6 Exit Gate**:
- [ ] `SCH002` fully functional without code changes
- [ ] All hard-coded Apex values removed
- [ ] Subdomain availability check works
- [ ] App Check enabled
- [ ] Rate limiting on forms
- [ ] Password reset works

---

## Phase 7: Communication (Weeks 11-12)

> **Goal**: Multi-channel parent communication (SMS + WhatsApp + portal in one action).
> **Effort**: 10 working days (1 dev)
> **Owner**: Backend lead
> **Branch**: `phase-7-communication`

### 7.1 Build "Bulk Message" admin flow
- **Files**:
  - `D:\Snredu\portal\admin-dashboard.html` (re-implement `sendNotificationSection` with real functionality)
  - `D:\Snredu\js\erp-notifications.js` (currently a stub; implement)
- **Action**:
  - Add a form: target audience (all parents / specific class / specific section), message text, channels (SMS / WhatsApp / Portal)
  - Preview before send (count of recipients, sample message)
  - Send → writes to `notifications` collection → Cloud Function dispatches
- **Effort**: 1 week
- **Verify**: Send a test message to 5 parents → all 3 channels deliver

### 7.2 Build "Delivery History" view
- **Files**:
  - `D:\Snredu\portal\admin-dashboard.html` (re-implement `notificationHistorySection`)
  - Same JS as above
- **Action**:
  - Table: timestamp, audience, channels, delivery status (sent/failed/pending), per-recipient drill-down
  - Filter by date range, channel, status
  - Re-send button for failed messages
- **Effort**: 3 days
- **Verify**: Sent messages appear in history with correct status

### 7.3 Add automatic triggers
- **Files**: New Cloud Functions in `functions/`
- **Action**:
  - `onHomeworkCreate` → notify parents of class (WhatsApp + portal)
  - `onResultPublish` → notify parents of new result (SMS + portal)
  - `onAttendanceMarked` (with absent) → notify parents (SMS — already in Phase 4)
  - `onExamSchedule` → notify parents of exam dates (WhatsApp + portal)
- **Effort**: 1 week
- **Verify**: Each trigger fires on the expected event
- **Verify**: Parents can opt out per channel (settings page)

### 7.4 Add parent notification preferences
- **File**: `D:\Snredu\portal\student-dashboard.html` (new section: Notification Settings)
- **Action**:
  - Toggle per channel: SMS / WhatsApp / Portal
  - Toggle per type: Homework / Results / Attendance / Exams / Fee / General
  - Default: all on
- **Effort**: 1-2 days
- **Verify**: Parent disables SMS for homework → no SMS sent on new homework

**🚦 Phase 7 Exit Gate**:
- [ ] Bulk message sends to 3 channels
- [ ] Delivery history accurate
- [ ] 4 automated triggers work
- [ ] Parents can opt out

---

## Phase 8: PWA & Mobile (Weeks 13-16)

> **Goal**: Installable app, offline mode, push notifications. This is the differentiator.
> **Effort**: 20 working days (1-2 devs)
> **Owner**: Frontend lead
> **Branch**: `phase-8-pwa`
> **Mobile testing**: Required on real Android + iOS devices

### 8.1 Create PWA manifest
- **File to create**: `D:\Snredu\manifest.json`
- **Content**:
  ```json
  {
    "name": "SNR Edu ERP",
    "short_name": "SNR ERP",
    "description": "School management portal for parents, students, and staff",
    "start_url": "/?utm_source=pwa",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#1e40af",
    "icons": [
      { "src": "/images/icon-192.png", "sizes": "192x192", "type": "image/png" },
      { "src": "/images/icon-512.png", "sizes": "512x512", "type": "image/png" },
      { "src": "/images/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
    ]
  }
  ```
- **Files to create**: 3 icon PNGs (192px, 512px, 512px maskable)
- **Effort**: 0.5 day (designer for icons, dev for manifest)
- **Verify**: Lighthouse PWA audit passes

### 8.2 Create service worker
- **File to create**: `D:\Snredu\sw.js`
- **Action**:
  - Cache static assets: HTML, CSS, JS, images
  - Network-first for HTML, cache-first for assets
  - Versioned cache (bust on deploy)
  - Fallback page when offline
- **Files to modify**:
  - All HTML files: add `<script>navigator.serviceWorker.register('/sw.js')</script>`
- **Effort**: 2-3 days
- **Verify**: Disable network → app loads from cache
- **Verify**: Reload → updated version loads

### 8.3 Add IndexedDB for offline data
- **Files**:
  - New: `D:\Snredu\js\offline-store.js` (IndexedDB wrapper)
  - `D:\Snredu\js\student-dashboard.js` (cache last-known data)
  - `D:\Snredu\js\admin-dashboard.js` (cache current section data)
- **Action**:
  - On data load, write to IndexedDB
  - On load (online), read from IndexedDB first, then fetch fresh
  - On form submit while offline, queue for later sync
- **Effort**: 1-2 weeks
- **Verify**: View dashboard offline → last data shown
- **Verify**: Submit form offline → queued
- **Verify**: Reconnect → queued form submits

### 8.4 Add Web Push Notifications
- **Files**:
  - New: `D:\Snredu\functions\sendPush.js` (Cloud Function)
  - `D:\Snredu\sw.js` (handle push events)
  - `D:\Snredu\portal\student-dashboard.html` (subscribe on login)
- **Action**:
  - On student login: get push subscription, save to Firestore
  - Cloud Function: send push via FCM (Firebase Cloud Messaging)
  - Service worker: show notification on receive, focus app on click
  - Integrate with Phase 7 communication triggers
- **Effort**: 1-2 weeks
- **Verify**: Subscribe on Chrome → send push from server → notification appears
- **Verify**: Click notification → opens app to relevant section

### 8.5 Add "Add to Home Screen" prompt
- **Files**: All PWA pages
- **Action**:
  - Detect if app is installable (`beforeinstallprompt` event)
  - Show a custom "Install SNR Edu ERP" banner
  - On click, trigger the native install prompt
  - Remember dismissal (localStorage)
- **Effort**: 1-2 days
- **Verify**: Banner appears on supported browsers
- **Verify**: Install succeeds, app opens in standalone mode

### 8.6 Mobile UX polish
- **Files**: All portal pages
- **Action**:
  - Test on real devices (Android 8+, iOS 14+)
  - Fix any layout breaks at 360px, 414px, 768px
  - Add touch-friendly tap targets (min 44x44px)
  - Fix sidebar behavior on mobile
  - Add iOS-specific meta tags (`apple-touch-icon`, `apple-mobile-web-app-capable`)
- **Effort**: 1 week
- **Verify**: Manual QA on 3+ devices
- **Verify**: Lighthouse mobile score ≥ 90

**🚦 Phase 8 Exit Gate**:
- [ ] App installable on Android + iOS
- [ ] Works offline (last-known data)
- [ ] Push notifications delivered
- [ ] Lighthouse PWA score 100/100
- [ ] Mobile UX polished

---

## Phase 9: ExamCraft AI (Weeks 17-20)

> **Goal**: Differentiate via AI-powered question paper generation.
> **Effort**: 20 working days (1-2 devs)
> **Owner**: Full-stack lead + AI engineer
> **Branch**: `phase-9-examcraft`
> **External dependencies**: Gemini API key (or Cloud Vision)

### 9.1 Implement AI Question Extractor
- **Files**:
  - `D:\Snredu\portal\tool-question-formatter.html` (remove `disabled` from "Extract with AI" button, line 119)
  - `D:\Snredu\js\tool-question-formatter.js` (wire upload handler, call Cloud Function)
  - New Cloud Function: `extractQuestionsFromImages` (calls Gemini Vision)
- **Action**:
  - On file upload: preview images in `#uploadPreview`
  - Enable "Extract with AI" button when 1+ images uploaded
  - On click: call Cloud Function with images
  - Cloud Function: sends to Gemini Vision API, returns structured questions
  - Populate question sections in the editor
- **API key management**:
  - Store Gemini API key in Firebase Functions config (not frontend)
  - Add a per-tenant key override in `schools/{id}/settings/general.aiApiKey`
- **Effort**: 1.5 weeks
- **Verify**: Upload handwritten photo → extracted text appears in editor
- **Verify**: Accuracy ≥ 80% on test photos

### 9.2 Add Question Bank
- **Files**:
  - `D:\Snredu\portal\tool-question-formatter.html` (add Question Bank panel)
  - `D:\Snredu\js\tool-question-formatter.js` (save/load questions)
  - New collection: `questionBank` (per school)
- **Action**:
  - "Save to Bank" button on each question
  - Question Bank panel: searchable, filterable by subject/class/difficulty
  - Drag-and-drop from bank into paper editor
- **Effort**: 1 week
- **Verify**: Save 5 questions → reload page → they're in bank
- **Verify**: Drag a question into a new paper → it appears

### 9.3 Add math rendering (KaTeX)
- **Files**:
  - `D:\Snredu\portal\tool-question-formatter.html` (add KaTeX CSS + JS CDN)
  - `D:\Snredu\js\tool-question-formatter.js` (parse `$$...$$` for math)
  - Update preview rendering
- **Action**:
  - Add `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">`
  - Add `<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>`
  - In question text, detect `$$...$$` or `\[...\]` blocks, render with KaTeX
  - Add an "Insert Equation" button with a visual editor (or just a textarea with live preview)
- **Effort**: 1 week
- **Verify**: Enter `$$x^2 + y^2 = z^2$$` → renders as Pythagorean theorem
- **Verify**: PDF export preserves math

### 9.4 Add image insertion in questions
- **Files**:
  - `D:\Snredu\portal\tool-question-formatter.html`
  - `D:\Snredu\js\tool-question-formatter.js` (use `image-storage.js` Base64)
- **Action**:
  - "Insert Image" button on each question
  - File picker → uses `ImageStorage.saveFile` to convert to Base64
  - Inserts `<img src="data:image/...">` into question text
  - Validate total paper size ≤ 1 MB (Firestore limit)
- **Effort**: 0.5 week
- **Verify**: Insert a diagram → renders in preview and PDF

### 9.5 Add "Answer Key" mode
- **Files**:
  - `D:\Snredu\portal\tool-question-formatter.html` (add toggle)
  - `D:\Snredu\js\tool-question-formatter.js` (separate layout)
- **Action**:
  - Toggle: "Question Paper" / "Answer Key"
  - In Answer Key mode: questions shown with answer text below each
  - PDF export: separate paper for answers
- **Effort**: 0.5 week
- **Verify**: Toggle works, both PDFs generate

**🚦 Phase 9 Exit Gate**:
- [ ] AI Extractor works on 10 test photos
- [ ] Question Bank has 50+ sample questions
- [ ] Math renders correctly
- [ ] Images embed successfully
- [ ] Answer Key generates separately

---

## Phase 10: Tech Debt (Weeks 21-24)

> **Goal**: Make the codebase maintainable for the next 2-3 years.
> **Effort**: 20 working days (2 devs)
> **Owner**: Tech lead
> **Branch**: `phase-10-techdebt`
> **Risk**: High — do in a feature flag, test thoroughly

### 10.1 Add `package.json` + dependency management
- **File to create**: `D:\Snredu\package.json`
- **Content**:
  - Dev dependencies: vite, eslint, prettier, vitest, @types/node
  - Scripts: `dev`, `build`, `test`, `lint`, `format`
- **Action**:
  - Run `npm init -y`
  - Add dependencies
  - Move CDN libs (Tailwind, Chart.js) to npm packages
  - Configure Vite for the project structure
- **Effort**: 0.5 week
- **Verify**: `npm install` works, `npm run dev` starts a local server
- **Verify**: `npm run build` produces a `dist/` folder

### 10.2 Set up Vite for build + minification
- **File to create**: `D:\Snredu\vite.config.js`
- **Action**:
  - Configure Vite for multi-page app
  - Move HTML files to `src/` (or keep at root, configure as needed)
  - Configure code splitting per page
  - Set up environment variables (Firebase config, API keys)
- **Effort**: 1 week
- **Verify**: `npm run build` produces minified assets
- **Verify**: Initial JS payload per page < 200 KB

### 10.3 Migrate from CDN Tailwind to compiled CSS
- **Files**:
  - `D:\Snredu\portal\admin-login.html` (Tailwind CDN)
  - `D:\Snredu\portal\student-login.html` (Tailwind CDN)
  - `D:\Snredu\portal\super-admin-pro.html` (Tailwind CDN)
  - `D:\Snredu\platform.html` (Tailwind CDN)
  - `D:\Snredu\portal\tool-question-formatter.html` (Tailwind CDN)
- **Action**:
  - Configure Tailwind via `tailwind.config.js`
  - Replace CDN `<script>` with compiled CSS
  - Use only utility classes actually used (PurgeCSS does this)
- **Effort**: 1-2 days
- **Verify**: Same visual output, much smaller CSS payload (from 1.4 MB to <50 KB)

### 10.4 Refactor `admin-dashboard.html` (the monolith)
- **Files**:
  - `D:\Snredu\portal\admin-dashboard.html` (8,053 lines → <500 lines)
  - New: `D:\Snredu\portal\partials\*.html` (per-section partials)
- **Action**:
  - Extract each `<section id="XxxSection">` into a separate HTML file
  - Use a template loader (or `fetch().then(html => inject())`)
  - Move `<script>` tags to import the section's handler dynamically
- **Effort**: 2-3 weeks (high risk; do in isolation branch)
- **Verify**: All 100+ sections still work
- **Verify**: Initial page load < 2s (from 6s+)

### 10.5 Add lazy loading for JS modules
- **File**: `D:\Snredu\js\admin-dashboard.js`
- **Action**:
  - Replace static `<script src="...">` tags with dynamic `import()` on section show
  - Use `import()` from `js/admin-dashboard.js` when `showSection()` is called
- **Effort**: 1 week
- **Verify**: Initial page load smaller
- **Verify**: Sections still load correctly on click

### 10.6 Add unit tests
- **Files**:
  - `D:\Snredu\package.json` (add vitest)
  - New: `D:\Snredu\tests\*.test.js`
- **Start with**:
  - `tests\payment-service.test.js` (FIFO atomic logic)
  - `tests\saas-policy.test.js` (stage permission mapping)
  - `tests\image-storage.test.js` (Base64 conversion + validation)
- **Action**:
  - Write 5+ tests per critical module
  - Set up CI to run tests on PR
- **Effort**: 1 week
- **Verify**: `npm test` passes
- **Verify**: Coverage report shows ≥80% on critical modules

### 10.7 Add ESLint + Prettier
- **Files**:
  - `D:\Snredu\.eslintrc.json`
  - `D:\Snredu\.prettierrc`
  - `D:\Snredu\.editorconfig`
- **Action**:
  - Configure ESLint with Airbnb style guide
  - Configure Prettier with 4-space indent, single quotes
  - Add pre-commit hook via husky
- **Effort**: 0.5 day
- **Verify**: `npm run lint` runs without errors
- **Verify**: `npm run format` reformats code

**🚦 Phase 10 Exit Gate**:
- [ ] Build step working (`npm run build`)
- [ ] Tailwind compiled (not CDN)
- [ ] Admin dashboard < 500 lines
- [ ] Initial page load < 2s
- [ ] Unit test coverage ≥ 80% on critical modules
- [ ] Linter passes
- [ ] All 100+ admin sections still work (full QA)

---

## Cross-Phase: Decision Log

> Decisions that need to be made before / during execution. Block work if unresolved.

| # | Decision | Owner | Deadline | Status |
|---|---|---|---|---|
| D1 | Brand name (SNR Edu ERP vs SNR World vs new) | Founder | Phase 2 start | ⏳ Pending |
| D2 | Pricing validation (₹4/student/month confirmed?) | Founder + Finance | Phase 5 start | ⏳ Pending |
| D3 | Multi-tenant hosting: one Firebase project with school-id (current) vs one project per tenant | Tech lead | Phase 6 start | ⏳ Pending |
| D4 | PWA only, or also React Native? | Tech lead | Phase 8 start | ⏳ Pending |
| D5 | WhatsApp provider: Cloud API vs MSG91 | Backend lead | Phase 7 start | ⏳ Pending |
| D6 | SMS provider: MSG91 vs Karix vs Twilio | Backend lead | Phase 4 start | ⏳ Pending |
| D7 | DPDP legal review: internal or external counsel? | Founder | Phase 3 start | ⏳ Pending |
| D8 | Two super-admin pages: merge or keep both? | Tech lead | Phase 2 end | ⏳ Pending |
| D9 | Admin dashboard refactor: per-section partials vs migrate to Vue/React/Svelte? | Tech lead | Phase 10 start | ⏳ Pending |
| D10 | Razorpay vs Cashfree vs PayU as payment gateway? | Backend lead | Phase 4 start | ⏳ Pending |
| D11 | SCH002 deployment: actually deploy or remove from codebase? | Founder | Phase 0 | ⏳ Pending |
| D12 | Hindi translation scope: public only or also portal? | Product | Phase 5 start | ⏳ Pending |

**Update this table weekly. Block phases where decisions are unresolved.**

---

## Cross-Phase: Testing Checklist

> Run this checklist at the end of every phase. Do not advance without green.

### Functional Testing
- [ ] All public pages load on Chrome, Firefox, Safari, Edge
- [ ] All portal pages load on the same
- [ ] Mobile responsive at 360px, 414px, 768px, 1024px
- [ ] All CMS-driven slots populate correctly
- [ ] All forms submit and validate
- [ ] All error states show user-friendly messages
- [ ] All success states confirm action

### Security Testing
- [ ] Unauthenticated user cannot access admin dashboard
- [ ] Unauthenticated user cannot read/write restricted Firestore collections
- [ ] Student can only see their own data
- [ ] Admin can only see their school's data
- [ ] No API keys exposed in frontend (except Firebase config — acceptable)
- [ ] CSP headers set
- [ ] App Check blocks bots
- [ ] Rate limiting prevents abuse

### Performance Testing
- [ ] Lighthouse mobile score ≥ 90
- [ ] Lighthouse desktop score ≥ 95
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Initial JS payload < 200 KB
- [ ] No layout shifts (CLS < 0.1)

### Accessibility Testing
- [ ] Lighthouse accessibility score ≥ 95
- [ ] All images have alt text
- [ ] All form fields have labels
- [ ] Keyboard navigation works
- [ ] Screen reader friendly (test with NVDA or VoiceOver)
- [ ] Color contrast ≥ 4.5:1 for normal text
- [ ] Skip-to-content link present

### Compatibility Testing
- [ ] Works on Android 8+ Chrome
- [ ] Works on iOS 14+ Safari
- [ ] Works on desktop Chrome, Firefox, Safari, Edge
- [ ] No polyfills needed for evergreen browsers

### Integration Testing
- [ ] Razorpay test payment succeeds
- [ ] Razorpay test refund works
- [ ] MSG91 SMS delivers to test numbers
- [ ] WhatsApp message delivers (if integrated)
- [ ] Cloud Functions respond within 5s
- [ ] Firestore rules deny unauthorized access
- [ ] Firebase Auth state persists across page reloads

---

## Cross-Phase: Definition of Done

> A feature is "done" when ALL of these are true:

1. **Code complete** — All files written, no TODOs left
2. **Tested** — Manual QA done on Chrome, Firefox, Safari, mobile
3. **Documented** — Any new CMS collections documented; any new JS APIs have JSDoc
4. **Reviewed** — At least one other dev has reviewed the PR
5. **Deployed to staging** — `firebase deploy` to a staging environment
6. **No new console errors or warnings** — Verified in DevTools
7. **No new accessibility issues** — Lighthouse a11y ≥ 95
8. **No new performance regressions** — Lighthouse perf ≥ 90
9. **Linter passes** — `npm run lint` clean
10. **Tests pass** — `npm test` green (for new code)
11. **CHANGELOG updated** — `CHANGELOG.md` entry added
12. **Product owner sign-off** — Demo'd to PO, accepted

**A phase is "done" when all its features are done + the phase exit gate passes.**

---

## Summary: 6-Month Execution Plan

| Phase | Weeks | Theme | Effort (dev-days) | Exit Gate |
|---|---|---|---|---|
| 0 | Day 0 | Pre-Flight | 1 | Backup + branches |
| 1 | 1-2 | Security Lockdown | 10 | No P0 security gap |
| 2 | 3 | Quick Wins & Dead Code | 5 | Clean UI |
| 3 | 4 | Privacy & Compliance | 5 | DPDP compliant |
| 4 | 5-6 | Critical Integrations | 10 | Razorpay + SMS live |
| 5 | 7-8 | Marketing & Lead Capture | 10 | Demo form working |
| 6 | 9-10 | Multi-Tenant Cleanup | 10 | SCH002 deployable |
| 7 | 11-12 | Communication | 10 | 3-channel messaging |
| 8 | 13-16 | PWA & Mobile | 20 | Installable + offline |
| 9 | 17-20 | ExamCraft AI | 20 | AI extractor + Q bank |
| 10 | 21-24 | Tech Debt | 20 | Build step + tests |
| **Total** | **24 weeks (~6 months)** | | **121 dev-days** | **Production-ready v2.0** |

**After 6 months, you should have**:
- A secure, production-ready platform
- 3-5 paying tenants beyond Apex
- PWA installable on all devices
- ExamCraft AI as a differentiator
- Test coverage on critical modules
- A maintainable codebase for the next 2 years

---

## Quick Reference: File Locations

```
D:\Snredu\
├── Plan\
│   ├── 00-master-analysis.md        ← Codebase overview
│   ├── 01-gaps.md                   ← 98 gaps catalog
│   ├── 02-roadmap.md                ← Strategic plan + OKRs
│   ├── Master-Plan.md               ← THIS FILE (step-by-step)
│   └── pages\
│       ├── public\*.md              ← 9 public site plans
│       ├── portal\*.md              ← 7 portal plans
│       └── partials\*.md            ← 3 shared partial plans
├── js\                              ← 35 JS modules
├── portal\                          ← 7 portal HTML files
├── *.html                           ← 9 public HTML files
├── *-partial.html                   ← 3 shared partials
├── firebase.json
├── firestore.rules
├── market-research-2026.md
├── IMAGE_STORAGE.md
├── competitive-analysis-report.md
└── README.md
```

---

**Last Updated**: 2026-06-02
**Status**: Ready for execution
**Next Action**: Complete Phase 0 (Pre-Flight) today, then start Phase 1
