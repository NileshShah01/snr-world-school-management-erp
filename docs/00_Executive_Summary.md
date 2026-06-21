# SNR WORLD School ERP — Executive Summary

> **Document:** 00_Executive_Summary.md
> **Type:** Project overview, current-state snapshot, gap highlights, perfect-SMS vision
> **Migration Source:** Consolidates `Project Docs/01_SaaS_School_Management_Research.md`, `Plan/00-master-analysis.md`, `Plan/Master-Plan.md`
> **Date:** June 2026

---

## 1. What Is SNR WORLD?

SNR WORLD is a **multi-tenant, Firebase/Firestore-based school management platform** being built for Indian private K-12 schools. It has two hosting targets in one Firebase project:

| Target | URL | Purpose |
|---|---|---|
| **school** | `apex-public-school-portal.web.app` | Public marketing website for Apex Public School (CMS-driven) |
| **platform** | `snredu-erp.web.app` | SaaS school ERP marketing + admin dashboards + multi-tenant provisioning |

**Primary stakeholder:** Apex Public School (Anjani Bazar, Saran, Bihar) — currently the only live tenant.

---

## 2. Codebase Snapshot

| Metric | Count | Largest |
|---|---|---|
| **HTML files** | 19 (12 root + 7 portal) | `portal/admin-dashboard.html` — 446 KB / 8,053 lines |
| **JS modules** | 41 (in `js/` + `js/services/`) | `js/admin-dashboard.js` — 143 KB / 3,304 lines |
| **CSS files** | 4 (root `style.css`, `css/portal.css`, `css/id-cards.css`, `css/id-card-premium.css`) | `style.css` 45 KB + `portal.css` 47 KB |
| **Node scripts** | 6 in `scripts/` | Compression + upload + migration tools |
| **Admin dashboard sections** | ~120 | Mapped in `sections.txt` |
| **Firestore collections (current)** | 14 top-level | `students`, `fees`, `notices`, `events`, `gallery`, etc. |
| **Target schema (v3)** | 30+ nested collections | All under `schools/{schoolId}/...` |
| **Git branches** | `main`, `phase-1-security`, `phase-2-quickwins`, `phase-3-privacy`, `phase-4-integrations` | Active: `phase-1-security` |

**Stack:** Vanilla HTML5/CSS3/ES6 + Firebase SDK 8.10.0 (web) + firebase-admin (scripts) + Tailwind CDN + Chart.js + jsPDF + Lucide Icons

---

## 3. Current Feature Coverage (22-Module Matrix)

| # | Module | Status | Notes |
|---|---|---|---|
| 1 | Student Information System (SIS) | Partial | `students` collection exists, CRUD in admin dashboard, bulk import via CSV |
| 2 | Attendance | ✓ | Period + daily, teacher UI, monthly reports, defaulter list |
| 3 | Fee Management | ✓ | Fee master, monthly generation, FIFO allocation, demand receipt, late fee, discounts |
| 4 | Timetable | Partial | Class timetables, list view, PDF/image upload (no auto-generator) |
| 5 | Exam & Gradebook | ✓ | Full exam CRUD, grading rules, admit cards, marks entry, analytics |
| 6 | Parent + Student Portal | Partial | `student-dashboard.html` with 9 sections; phone-only login (weak auth) |
| 7 | Notices & Announcements | ✓ | Notice CRUD, public ticker on school.html |
| 8 | Communication (SMS/Email/WhatsApp/Push) | ✗ | Only `wa.me/` links; no gateway integrations |
| 9 | Admission Management | Partial | Inquiries collection, admission form, search; automated workflow missing |
| 10 | Reports & Analytics | Partial | Result analytics, fee collection bar chart, enrollment chart (hardcoded demo data) |
| 11 | Role-Based Access | Partial | 8 roles defined in `access-control.js`; self-elevation hole in Firestore rules |
| 12 | Multi-Tenant School Management | ✓ | Path-based tenancy with URL slug routing |
| 13 | Library | Partial | Book catalog, issue/return, circulation history |
| 14 | Transport | Partial | Route management, student mapping (no GPS) |
| 15 | HR + Payroll | Partial | Staff CRUD, salary structure (no payroll processing) |
| 16 | Homework / Assignments | ✓ | Assignment CRUD, submissions, attachments (Base64) |
| 17 | Lesson Planning | ✗ | Not implemented |
| 18 | Events & Calendar | Partial | Events CRUD, public display on school.html |
| 19 | Gallery / Media | ✓ | Gallery CRUD with Base64 images, lightbox, categories |
| 20 | Testimonials | Partial | Testimonials CRUD, displayed on school.html |
| 21 | Holidays & Academic Calendar | Partial | Holidays collection exists, CMS-managed |
| 22 | Discipline / Remarks | Partial | Remarks collection, discipline module |

**Coverage:** 16/22 present (73%), ~5/22 fully production-ready.

---

## 4. Architecture Decisions

### Multi-Tenancy
- **Path-boundary:** `schools/{schoolId}/...` for all tenant data
- **Routing:** Firebase Hosting rewrites `/{slug}/*` → apps; client-side `resolveSchoolSlug()` maps slug → schoolId
- **Isolation:** Firestore rules check `request.auth.token.schoolId == schoolId`
- **Current pain:** All 14 collections are top-level; v3 migration planned (dual-write → backfill → cutover)

### Storage
- **All files as Base64 data URIs inside Firestore docs** — no Firebase Storage
- Cap: ~700 KB raw, ~1 MB Base64-encoded (Firestore 1 MiB doc limit)
- Uses `ImageStorage` helper with canvas-based compression (JPEG q=0.82, max 1600×1600)
- **Trade-off:** Simple but expensive (no CDN, no lazy-load from storage, larger Firestore bills)

### Security
- Firestore rules use `isAdmin()`, `isSuperAdmin()`, `belongsToSchool()` helpers
- **Critical self-elevation hole:** A user can write `users/{ownUid}.role = 'admin'` — the `update` rule allows `request.auth.uid == userId`
- Top-level collections have `read: if true` — student PII world-readable
- `/provision.html` publicly accessible (can create schools)
- App Check is a no-op (empty reCAPTCHA key)

---

## 5. Competitor Landscape

### Primary competitors (India K-12)
| Competitor | Pricing | Schools | Key Strength | SNR vs Them |
|---|---|---|---|---|
| **Education Desk** | ₹5/student/mo | 800+ | Existing Apex vendor, mobile app | SNR leads on CMS, ID cards, multi-tenant; lags on comms, app, gateways |
| **Fedena** | ₹15K+/yr | 40K+ | 100+ modules, 20 languages, open-source | SNR more modern stack; Fedena has far more features |
| **Classe365** | ₹15-50/student/yr | 10K+ | All-in-one SIS+LMS+CRM+Finance | Closest business model; SNR lags on breadth |
| **Entab CampusCare** | Custom | 2,500+ | 23 years in market, India ERP leader | SNR more modern tech; Entab has proven scale |
| **MyClassboard** | ₹18K+/yr | 5,000+ | Mobile apps, integrated platform | SNR leads on CMS; MyClassboard has payments live |
| **NeevLearn** | ₹13K/yr | New | AI-first, Hindi support | SNR has more modules; NeevLearn AI is live |
| **Teachmint** | Moderate | Large | Hybrid school focus | SNR more ERP-focused; Teachmint more LMS |

### Where SNR wins
- **Public Website CMS** (full 12-page dynamic website — unique in ERP space)
- **13+ premium ID card templates** with CR80 print support
- **AI Question Formatter** (ExamCraft AI, though extractor disabled)
- **FIFO atomic fee engine** with transaction-based allocation
- **Multi-tenant SaaS** on Firebase (lower ops cost than self-hosted alternatives)

### Where SNR loses
- **No payment gateway** (Razorpay/Cashfree/PayU) — UPI is table-stakes in India 2026
- **No SMS/WhatsApp Business API** — only `wa.me/` deep links
- **No mobile app/PWA** — `platform.html` claims "PWA roadmap" but nothing built
- **No NEP 2020 / CBSE/ICSE report card templates**
- **No published pricing** — no self-serve signup
- **No bilingual UI** (i18n engine exists but Hindi dictionary incomplete)

---

## 6. Critical Gap Summary (98 gaps)

| Priority | Count | Key Items |
|---|---|---|
| **P0 — Ship-Blockers** | 16 | Auth guards disabled, `/provision.html` public, self-elevation hole, PII readable, no DPDP consent, missing `inquiry.html`, 6 "Under Construction" modules, duplicate Fees nav, no demo/signup flow |
| **P1 — Go-to-Market** | 29 | No payment/SMS/WhatsApp gateways, no mobile app, no pricing, no bilingual, no NEP 2020, no UDISE+ export, weak student auth, manual onboarding |
| **P2 — Differentiation** | 25 | No AI tutor, no predictive analytics, no auto-grading, no GPS tracking, no hostel, weak reporting, no automated workflows |
| **P3 — Tech Debt** | 28 | No unit tests, no build step, 4 brand names, Firebase SDK drift, no CI/CD, monolith admin-dashboard.js, dead code |

---

## 7. Perfect Management Software Vision

The "perfect" school management system for Indian K-12 (CBSE/ICSE/State Board) must deliver:

1. **5-minute school onboarding** — super-admin provisions school, admin logs in, 500 students imported via CSV in 1 click
2. **One-tap attendance** — teacher opens app, taps "Mark All Present", exceptions → parent gets WhatsApp notification in 5 seconds
3. **UPI fee payment under 60 seconds** — parent receives invoice link → pays via UPI → auto-receipt → ledger updated → defaulter dashboard refreshes
4. **CBSE/ICSE report cards in 3 clicks** — publish exam → auto-calculate grades → generate report cards (PDF) → bulk download or WhatsApp
5. **80% parent engagement** — daily attendance, homework, fee reminders, exam results pushed via WhatsApp with read receipts
6. **NEP 2020 / UDISE+ compliant** — holistic progress cards, competency mapping, government export formats
7. **Mobile-first** — parents on WhatsApp/phone, teachers on mobile PWA, admin on desktop
8. **Real-time analytics** — principal dashboard shows attendance %, fee collection %, exam pass %, drop-out risk in 1 screen
9. **Multi-tenant at scale** — 500 schools in one Firebase project, < $0.30/school/month infra
10. **AI assistant** — 24/7 tutor for students, auto-generate report card comments, predict fee defaulters

---

## 8. Decision Log (Top Open Questions)

| # | Question | Options | Status |
|---|---|---|---|
| 1 | Pricing model? | ₹4/student/mo vs ₹999-₹5,999 flat tier | Proposed in market-research but not decided |
| 2 | Payment gateway? | Razorpay vs Cashfree vs PhonePe | Not integrated |
| 3 | WhatsApp provider? | Interakt vs Wati vs AiSensy vs direct API | Not integrated |
| 4 | Mobile app or PWA? | PWA (faster, no store) vs React Native | "PWA roadmap" in platform.html only |
| 5 | Open-source community edition? | Yes (like Fedena) vs pure SaaS | Not decided |
| 6 | School brand name? | SNR World vs SNR Edu ERP vs Nexorasoftagency | 4 brand names in code — needs unification |
| 7 | Firestore vs SQL for reporting? | Firestore-native vs BigQuery export vs PostgreSQL | Current: Firestore-only |

---

## 9. Key File Reference

| File | Purpose |
|---|---|
| `firebase.json` | 2 hosting targets, multi-tenant rewrites, CSP headers |
| `firestore.rules` | Security rules with self-elevation hole |
| `js/firebase-config.js` | Firebase init, multi-tenant context resolver, theme applier |
| `js/auth-guard.js` | Auth middleware (gates admin/super-admin pages) |
| `js/access-control.js` | 8-role RBAC matrix |
| `js/admin-dashboard.js` | Monolithic 143 KB ERP admin (students, fees, exams, CMS, ID cards) |
| `js/cms-settings.js` | Public-side CMS consumer (populates all public pages) |
| `js/cms-admin.js` | Admin-side CMS editor |
| `js/image-storage.js` | Base64 image compression/storage helper |
| `js/media-loader.js` | Resolves `data-snr-media` attributes → Firestore media docs |
| `js/saas-policy.js` | Stage-based module gating (6 tiers) |
| `js/i18n.js` | English/Hindi bilingual engine |
| `js/services/payment-service.js` | FIFO atomic fee allocation (Firestore transactions) |
| `portal/admin-dashboard.html` | 446 KB monolith with 120+ sections |
| `portal/super-admin-pro.html` | Premium "Control Tower" super admin |
| `scripts/provision-multi-school.js` | One-time school seed script |
| `scripts/migrate-to-saas.js` | Browser-console migration v2→v3 |

---

## 10. Cross-References

- `01_Project_Inventory.md` — complete file-by-file manifest
- `10_Public_Marketing_Site/` — per-page audits (12 files)
- `20_Portal/` — portal page audits (7 files)
- `30_ERP_Modules/` — module deep-dives (18 files)
- `40_Competitor_Comparison/` — competitor profiles (11 files)
- `50_Perfect_Management_Software/` — gold-standard definition (5 files)
- `60_Gap_Analysis/` — detailed gap tracking (4 files)
- `70_Architecture/` — technical architecture docs (6 files)
- `80_Implementation/` — phased execution plans (5 files)
