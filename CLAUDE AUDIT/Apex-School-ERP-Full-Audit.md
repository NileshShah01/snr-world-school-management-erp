# Apex Public School / SNR Edu ERP — Full Repository Audit
**Repo:** `NileshShah01/apex-public-school-New` · **Audited:** June 22, 2026 · **Commits reviewed:** 123 (default branch `ERP-Full`) + 114 (`main`)

---

## 0. Important Branch Note (read this first)

GitHub's default branch for this repo is **`ERP-Full`** — that's what loads when you open the repository URL. But it is **not** the most complete version of the project. A separate branch, **`main`**, contains a much more advanced build: a real multi-tenant SaaS shell (`platform.html`, `school.html`, `provision.html`), a Super Admin control tower (`super-admin.html` + `super-admin-pro.html`), Firestore security rules, `firebase.json` hosting config, a `package.json` with lint/format tooling, and ~15 additional ERP modules (library, transport, timetable, homework, attendance, analytics) that don't exist at all on `ERP-Full`.

Since your request asked specifically about "Full SaaS level Production Ready state and All portals," this audit covers **`main`**, with `ERP-Full` differences called out where relevant. Practically: the public GitHub page is showing a *less* finished snapshot than what's actually been built in the repo.

| | `ERP-Full` (GitHub default) | `main` (most complete) |
|---|---|---|
| Public site | index.html + 7 pages | school.html (renamed homepage) + platform.html + provision.html + 6 pages |
| Admin dashboard | 3,089 lines, ~15 JS modules | 8,053 lines, ~28 JS modules |
| Super Admin portal | Not present | `super-admin.html` + `super-admin-pro.html` |
| Firestore rules / firebase.json | Not present in repo | Present |
| Lint/format tooling | Not present | ESLint + Prettier + Stylelint configured |

---

## 1. What This Actually Is

This is not a brochure website — it's a genuine multi-tenant school-ERP SaaS in progress, branded "SNR Edu ERP" at the platform level, with "Apex Public School" as the first live tenant. The architecture is sound in concept: every Firestore document lives under `schools/{schoolId}/...`, a tenant is resolved from a URL slug, custom domain, or subdomain at runtime, and a 6-stage subscription tiering system (`js/saas-policy.js`) is meant to gate which ERP modules a given school sees based on what they're paying for. That's a real SaaS pattern, not a toy.

The codebase is large: roughly 17,000 lines of HTML across the public site and four portals, and over 700KB of JavaScript across 31 modules. There is no backend server — everything runs client-side against Firebase (Auth, Firestore, Storage) directly from the browser, which is the single biggest factor shaping both its strengths (fast to build, no DevOps) and its weaknesses (see Section 4).

---

## 2. Full Portal & Page Inventory

### 2.1 Public Marketing / School Website
Loaded as a Firebase Hosting "site" with shared `header.html`/`footer.html`/`floating-button.html` fetched into every page via `script.js`.

- **`school.html`** — tenant homepage: hero, birthday widget, upcoming events, animated stat counters, admission CTA, quick-link cards. Content (school name, logo, stats, theme colors) is pulled live from Firestore via `cms-settings.js`, so each tenant can fully rebrand without touching code.
- **`about.html`, `academics.html`, `admissions.html`, `facilities.html`, `gallery.html`, `contact.html`** — all CMS-driven the same way (text, images, staff lists, testimonials, gallery items all editable from the admin CMS panel rather than hardcoded).
- **`contact.html`** — has a real working form that writes to the `inquiries` Firestore collection.
- **`platform.html`** — separate marketing page for the SaaS product itself ("SNR Edu ERP | Advanced School Management Platform"), distinct from any single school's site.
- **`provision.html`** — *not* a real onboarding flow (see Section 4.3).

### 2.2 Student/Parent Portal (`portal/student-login.html` + `portal/student-dashboard.html`)
Login is phone number + name (no password). Dashboard has 10 sections: Dashboard home, Profile, Attendance, Fees, Exams, Results, Homework, Library, Transport, Materials. A "Guest/Visitor" demo-login button is also available.

### 2.3 Admin Portal (`portal/admin-login.html` + `portal/admin-dashboard.html`)
Email/password login via Firebase Auth. This is the core of the product — **104 distinct dashboard sections** organized into 17 collapsible sidebar categories:

Class & Session Setup (Sessions, Classes, Subjects, Syllabus) · Student Management (Add, List/Search, Bulk Upload, Elective Mapping, Promotions, Bulk Update, RFID Update, Hostel Report, Transport Report, Pickup ID Print) · Admission (New Enquiry, Enquiry Search, Student Admission) · Attendance (Mark/Manage, Stats) · Fees — *appears twice, see Section 4.1* (Search Student Ledger, Monthly Fee Generation, Class Fee Payment, Demand Receipt, Bulk Discount, Bulk Extra Fee, Late Fee Rules, Fee Master, Search Dues, Send Fee Reminder) · Exams (Grading Rules, Create Exam, Schedule, View/Publish Schedule, Admit Card, Exam Attendance Card) · Results (Add Result, View Report Card, Publish Results, Bulk Generator, Analytics, Manage All Results, Remarks) · Notifications (Send, History) · Library (Book Catalog, Issue/Return, Transactions) · Transport (Routes, Map Transport) · Employees (Add, Search, Bulk Update, ID Print) · Academic Tools (Parents-Not-Paid report, Manual Report Card Upload) · Website CMS (Hero Slider, Theme, Admission settings, Global Stats, Gallery, Staff, Holidays, Events, Achievements, Testimonials, Student Dashboard config) · Page Imagery (6 image-zone managers) · Page Content/Text (8 page-text editors) · Settings (Website Settings, Global Stats, Admin Portal CMS).

This also pulls in a separately-routed **Question Paper Formatter** tool (AI-assisted question formatting, exports to PDF) and a **Demand Receipt** generator.

### 2.4 Super Admin (Platform Owner) Portal
- **`super-admin.html`** — base control tower: lists every tenant school, lets the platform owner view/search/edit schools, with activity logging.
- **`super-admin-pro.html`** — a more advanced "Pro" rebuild of the same concept (Tailwind/Lucide-based), described in commit history as adding stage-based permission controls and a "luxury UI."

### 2.5 Orphaned Code
- **`temp_super_admin/`** — a fully separate React 19 + TypeScript + Vite scaffold (1,104-line `App.tsx`) with its own `package.json`, including a Google Gemini AI SDK dependency. It is not referenced by `firebase.json`, not linked from any page, and not built/deployed anywhere. It's dead weight sitting in the repo — either an abandoned rewrite attempt or an experiment that never got wired in.
- **`Competitors/`** (1.5MB of competitor product screenshots) and **`Question Paper Template/`** (1.6MB of sample docx/pdf files) are committed to the repo root and are *not* excluded in `firebase.json`'s hosting `ignore` list — meaning they would be publicly deployed and accessible at your live URL, exposing internal competitive-research material to anyone who finds the path.

---

## 3. Connectivity Audit — Buttons, Links & Function Calls

I cross-referenced every `onclick="..."` handler and every internal `href` against the actual JS function definitions and HTML files in the repo. Most of it checks out — all 87 sidebar `showSection()` targets in the admin dashboard resolve correctly, and the student dashboard, super-admin pages, and question formatter tool have zero broken handlers. But several concrete breakages exist:

| # | Issue | Where | Effect |
|---|---|---|---|
| 1 | Sitewide dead link to `inquiry.html`, a page that doesn't exist on this branch | Header, footer, and floating "Inquiry" button (on **every** public page), plus 2 CTAs on the homepage, plus the admission-inquiry card on `admissions.html` | Every primary "submit an inquiry" call-to-action across the entire site 404s. (`contact.html` has a working form, but it's not what these buttons point to.) |
| 2 | `onclick="downloadPreviewPdf()"` — function never defined anywhere in the codebase | Admin → Results → Report Card PDF Tool, "Download Sample PDF" button | Throws a JS error on click; button is fully non-functional |
| 3 | `onclick="generateEmployeeIdCard()"` — function never defined | Admin → Employees → Employee ID Card Generator | The entire employee-ID-card feature is non-functional (student ID cards work fine via a different, correctly-wired function) |
| 4 | `onclick="printIdPreview()"` — function never defined | Admin → Student ID Card tool, "Direct Print" button | Non-functional; "Download Selected ID" next to it does work |
| 5 | `href="/holidays.html"` and `href="/staff.html"` — neither page exists | Student dashboard quick-action links ("View School Holidays", "Meet Our Teachers") | Both 404. Holiday/staff data is fully managed in the CMS but has no public page rendering it. |
| 6 | `href="question-formatter/index.html"` (relative, wrong path) | Two places inside the admin dashboard | 404 — the real tool lives at `/portal/tool-question-formatter.html` per `firebase.json`'s own rewrite rules, so even the routing config disagrees with the link |
| 7 | The "Fees" sidebar category is duplicated outright — `id="navFees"` appears twice with two overlapping-but-different sets of fee tools | Admin sidebar | Confusing UX, and an HTML spec violation (duplicate IDs break `getElementById`/CSS-id-selector reliability). Git history shows this was "fixed" once already and has resurfaced. |

Outside of these seven items, the link/function graph is in solid shape for a project this size — that's a meaningfully better hit rate than most codebases this large.

---

## 4. Critical Security Findings

This is the part of the audit I'd treat as urgent, not cosmetic. The client-side role system in `js/access-control.js` is well-designed on paper — a clean permission matrix for admin/teacher/student/parent/accountant/librarian/transport/viewer roles — but it is **only enforced in the browser's JavaScript**. The actual gatekeeper, Firestore Security Rules, doesn't back it up.

### 4.1 `firestore.rules` is wide open
```
match /schools/{schoolId} {
  allow read: if true;
  match /{allSubcollections=**} {
    allow read: if true;
    allow write: if request.auth != null;
  }
}
```
Two separate problems here. First, `allow read: if true` on every school's every subcollection means **anyone on the internet, logged in or not, can read every tenant's entire dataset** — student names, phone numbers, marks, attendance, fee payment history — just by calling the Firestore SDK directly with the public API key that's already sitting in `js/firebase-config.js` (that part is normal for Firebase, but it only stays safe if rules are locked down, and these aren't). Second, `allow write: if request.auth != null` means *any* authenticated user — including a student account, since student login also uses Firebase concepts loosely tied to auth — can write to *any* school's data, not just their own. There's no check that the user's `schoolId` matches the document's `schoolId`, and no custom-claims-based role check; `isAdmin()` is literally just `request.auth != null`.

A dozen more top-level collections (`students`, `marks`, `exams`, `fees`, `website_content`, etc.) are set to `allow read, write: if true` with **no authentication required at all**.

### 4.2 Route guards are disabled, not missing
Both `js/admin-auth.js` and `js/student-auth.js` contain a complete, correctly-written `onAuthStateChanged` redirect-if-not-logged-in block for protecting the dashboard pages — **wrapped entirely in a `/* ... */` comment**. As shipped, anyone can navigate straight to `/portal/admin-dashboard.html` or `/portal/student-dashboard.html` with no session at all; the page will render and, because of the open Firestore rules above, will successfully load and display real school data.

### 4.3 Student "authentication" has no real credential
Student login is a name + phone-number lookup against the (publicly readable) `students` collection — there is no password and no Firebase Auth account behind it. Anyone who knows or guesses a student's registered phone number can log in as that student.

### 4.4 `provision.html` is a live, unauthenticated write script
This isn't a UI for onboarding new tenants — it's a hardcoded script (two schools' worth of data baked directly into the file) that **runs automatically on page load** (`window.onload = provision`) and writes to Firestore with no login check and no confirmation prompt. It isn't excluded from Firebase Hosting's deploy, so if it's live, anyone who hits that URL re-triggers a Firestore write.

**Net effect:** the access-control design is genuinely good thinking, but right now it's decorative. None of it is backed by server-side enforcement, so it should be treated as a UI convenience, not a security boundary, until the rules and the commented-out guards are fixed. This is the single highest-priority item in this whole audit — it affects real student PII across every tenant school on the platform, not just Apex.

---

## 5. SaaS / Production-Readiness Assessment

**What's genuinely there and well-built:**
- True multi-tenant data isolation pattern (`schools/{id}/...`), with slug → schoolId resolution via custom domain, subdomain, or path, cached in `sessionStorage`.
- A real 6-stage subscription/feature-tiering model (`saas-policy.js`) mapping sidebar modules to minimum plan stage — exactly the mechanism a real SaaS needs to gate Basic vs. Pro vs. Full-ERP customers.
- A genuinely correct fee-payment ledger (`payment-service.js`) using Firestore transactions with FIFO allocation across a student's outstanding fee months — this is non-trivial business logic, done properly.
- CMS-driven content and theming, so onboarding a new school's *public website* doesn't require a code change.
- Defensive coding touches: a global `window.onerror` handler and a 10-second "loading watchdog" in the admin dashboard specifically to stop the UI from getting stuck on a spinner if a module throws.

**What's missing or simulated, despite the SaaS framing:**
- **No payment gateway.** There is no Razorpay/Stripe/PayU/Paytm integration anywhere in the codebase — "fee collection" means an admin manually typing in a cash/cheque amount. For a school-fees product this is a major gap if real online parent payments are part of the pitch.
- **Notifications are fake.** "Send Notification" (SMS/WhatsApp/Push tabs in the UI) writes a Firestore document and immediately marks it `status: 'Delivered'` — no SMS/WhatsApp/email provider (Twilio, MSG91, SendGrid, etc.) is wired up anywhere. Nothing is actually sent to a parent's phone; the UI just claims it was.
- **No self-serve tenant onboarding.** `provision.html` (see 4.4) is a one-off dev script, not a "sign up your school" flow. For a SaaS product, new-tenant provisioning should be a guarded, dynamic Super Admin action, not a hardcoded HTML file.
- **`cdn.tailwindcss.com` is loaded directly in `platform.html`, `super-admin-pro.html`, and the question-formatter tool** — this is the Tailwind Play CDN build, which Tailwind's own docs explicitly say not to use in production (no purging, larger payload, and it prints a console warning on every load).
- Firebase SDK versions are inconsistent across the app (v9.23.0 on the main site/admin/student portals, v9.22.1 on the super-admin pages, and old v8.10.1 syntax in `provision.html`) — not breaking, but a sign nothing enforces a shared dependency baseline.
- Three different Excel/XLSX libraries (`cdn.sheetjs.com`, `cdnjs xlsx 0.18.5`, and `xlsx-js-style`) are all loaded on the same admin dashboard page — redundant and a real risk of global-namespace collisions between competing `XLSX` objects.
- Repo bloat that ships to production unfiltered: 1.5MB of competitor-product screenshots and 1.6MB of sample question-paper files sit in the repo root and aren't excluded by `firebase.json`'s hosting ignore rules, so they'd deploy as publicly browsable assets.

**Bottom line on "production ready":** the *data model and business logic* are SaaS-grade and well thought through. The *security posture* is not — it's the kind of thing that's fine for a single-developer demo but would be a serious liability the moment a second real school's data goes into this database. I'd treat Section 4 as a blocking issue, not a nice-to-have, before calling this production-ready in any multi-tenant sense.

---

## 6. UI/UX Quality

The visual language is consistent and considered rather than templated: a defined CSS custom-property theme (primary/secondary colors swappable per-tenant from Firestore), card-based layouts, a collapsible-category sidebar pattern repeated identically across admin and student portals, animated counters on the homepage, and toast notifications (`showToast`) instead of jarring `alert()` calls for most feedback. The admin dashboard's loading-watchdog and global error handler are UX decisions, not just engineering ones — they exist specifically so a crashed module doesn't leave an admin staring at a frozen spinner.

Responsive coverage exists but is thin for an app this size — only 8 media-query breakpoints in the main stylesheet and 5 in the portal stylesheet, mostly at 768px/992px. A 104-section, table-heavy ERP dashboard is a genuinely hard thing to make work well on a phone screen, and the breakpoint coverage here suggests mobile admin use hasn't been a major design target (which may be a reasonable call for an internal-admin tool, but is worth confirming intentional).

The student-facing side is simpler and benefits from it — 10 sections, clear iconography, a guest/demo login path for evaluation, all good practice for a portal aimed at less technical users (and parents).

---

## 7. Code Quality Notes

The codebase mixes plain multi-page HTML/CSS/JS (the school site and admin/student portals) with one orphaned React/TypeScript app (`temp_super_admin`) that never got connected — that inconsistency is worth resolving one way or the other (finish migrating to it, or delete it). `main` branch does have ESLint, Prettier, and Stylelint configured (`package.json`), which `ERP-Full` lacks entirely — a meaningful gap if `ERP-Full` is the branch anyone's actually deploying from.

Logging is heavy but not unreasonable for the current stage: 188 `console.error`, 40 `console.log`, 24 `console.warn` calls across the JS modules — the `console.error` volume is mostly legitimate error-path logging rather than leftover debug noise, but the 40 plain `console.log` calls (tenant-resolution tracing, theme application, etc.) should be stripped or gated behind a debug flag before a real production cutover.

No secrets beyond the standard (and normally-safe-to-expose) Firebase web config were found hardcoded anywhere — that's a genuine positive, and distinct from the Firestore-rules issue in Section 4, which is the actual exposure vector.

---

## 8. Priority Fix List

1. **Lock down `firestore.rules`** — require `request.auth.token.schoolId == schoolId` (via custom claims) for any write, and stop defaulting student/PII reads to public. This is the one item I'd fix before anything else touches real student data.
2. **Re-enable the commented-out auth guards** in `admin-auth.js` and `student-auth.js`.
3. **Remove or relocate `provision.html`** out of the publicly hosted directory, or gate it behind Super Admin auth.
4. Fix the six dead links/functions in Section 3, starting with `inquiry.html` since it's hit on every single page load.
5. Decide the fate of `temp_super_admin/`, `Competitors/`, and `Question Paper Template/` — either wire the React app in or delete it, and exclude the screenshot/template folders from `firebase.json`'s hosting `ignore` list.
6. Replace the simulated "Delivered" notification status with a real provider integration (or relabel it honestly as "Logged" / "In-App Only" until one exists).
7. Swap the Tailwind Play CDN for a proper built Tailwind pipeline before calling `platform.html`/`super-admin-pro.html` production-ready.

---

*This audit was produced by cloning and statically analyzing the repository (git history, file structure, HTML/JS cross-referencing of every onclick handler and internal link, and a full read of the Firestore rules and auth modules). It does not include a live runtime/browser test against a deployed Firebase project, since no live URL was provided.*
