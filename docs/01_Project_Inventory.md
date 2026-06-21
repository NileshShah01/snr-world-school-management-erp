# Project Inventory — Complete File Manifest

> **Document:** 01_Project_Inventory.md
> **Type:** File-by-file index with sizes, purposes, and dependencies
> **Migration Source:** Consolidates `Plan/00-master-analysis.md` sections 2-3 + live `ls` scan
> **Date:** June 2026

---

## 1. Root Files

| File | Size | Purpose |
|---|---|---|
| `firebase.json` | 7,973 B | Hosting config (school + platform targets), rewrites, CSP/HSTS headers |
| `firestore.rules` | 5,592 B | Security rules v2 (top-level public reads, admin writes) |
| `.firebaserc` | 310 B | Default project `apex-public-school-portal`, 2 hosting targets |
| `package.json` | 1,011 B | Lint/format scripts (ESLint + Prettier + Stylelint), no build step |
| `style.css` | 45,492 B | Main public stylesheet (design tokens, responsive, animations) |
| `eslint.config.js` | 2,485 B | ESLint flat config |
| `.stylelintrc.json` | 267 B | Stylelint config |
| `.prettierrc` | 113 B | Prettier config |
| `.gitignore` | 344 B | Ignores node_modules, .firebase, serviceAccountKey, firebase-config.js |
| `README.md` | 1,104 B | Project overview + deploy commands + storage model |
| `IMAGE_STORAGE.md` | 3,384 B | Base64-in-Firestore storage contract |
| `sections.txt` | 15,095 B | Auto-generated section IDs from admin-dashboard.html |
| `robots.txt` | 362 B | Allows all crawlers, disallows /portal/, /scripts/, /Super-Admin |
| `sitemap.xml` | 1,949 B | 10 URLs (public pages + platform + login) |

---

## 2. Public Marketing Site (Root HTML)

| File | Size | Lines | CMS-Driven | Data Attrs |
|---|---|---|---|---|
| `school.html` (homepage) | 16,012 B | 327 | Yes | data-snr-media, data-snr-favicon, data-i18n, data-school-field |
| `about.html` | 10,947 B | 231 | Yes | data-snr-media, data-target |
| `academics.html` | 7,730 B | 196 | Partial | data-target |
| `admissions.html` | 13,768 B | 325 | Partial | data-snr-media, aria-expanded |
| `facilities.html` | 11,851 B | 282 | Yes | data-snr-media, data-target |
| `gallery.html` | 11,419 B | 323 | Yes | data-filter, loading=lazy |
| `contact.html` | 14,656 B | 362 | Yes | data-i18n, data-i18n-attr, data-school-field |
| `platform.html` | 45,966 B | 774 | Partial | data-i18n-title |
| `provision.html` | 4,383 B | 80 | No | None |
| `header.html` | 3,204 B | 39 | Yes | data-school-field, data-i18n |
| `footer.html` | 2,595 B | 54 | Yes | data-school-field, data-i18n |
| `floating-button.html` | 955 B | 29 | Yes | data-school-field |
| `about.html` | 10,947 B | 231 | Yes | data-snr-media, data-target |

---

## 3. Portal Pages

| File | Size | Lines | Dependencies |
|---|---|---|---|
| `portal/admin-login.html` | 22,253 B | ~500 | firebase-config.js, app-check.js, auth-guard.js, admin-auth.js, rate-limiter.js |
| `portal/admin-dashboard.html` | 445,912 B | 8,053 | auth-guard.js, admin-dashboard.js, 18 erp-*.js, cms-*.js, id-card-templates.js, report-card-factory.js, access-control.js, dashboard-analytics.js, image-storage.js, media-loader.js, i18n.js, payment-service.js |
| `portal/student-login.html` | 9,275 B | ~200 | firebase-config.js, auth-guard.js, student-auth.js |
| `portal/student-dashboard.html` | 41,822 B | 740 | auth-guard.js, student-dashboard.js, access-control.js, image-storage.js, media-loader.js, i18n.js |
| `portal/super-admin.html` | 19,897 B | 529 | auth-guard.js, super-admin.js |
| `portal/super-admin-pro.html` | 39,199 B | 693 | auth-guard.js, super-admin-pro.js, saas-policy.js, i18n.js |
| `portal/tool-question-formatter.html` | 16,214 B | 323 | auth-guard.js, tool-question-formatter.js, saas-policy.js, i18n.js |

---

## 4. JavaScript Modules

### 4.1 Core Infrastructure

| File | Size | Lines | Purpose |
|---|---|---|---|
| `js/firebase-config.js` | 10,642 B | ~300 | Firebase init, multi-tenant resolver, theme, school helpers |
| `js/auth-guard.js` | 2,502 B | ~100 | Auth middleware: boot, requireAuth, getRole, signOut |
| `js/access-control.js` | 13,548 B | ~350 | RBAC matrix (8 roles, 13 modules) |
| `js/app-check.js` | 2,276 B | ~60 | App Check stub — NO-OP (empty key) |
| `js/rate-limiter.js` | 4,114 B | ~120 | Client-side rate limiter (5 limiters, localStorage) |
| `js/i18n.js` | 14,707 B | ~400 | EN/HI bilingual engine with DOM binding |
| `js/image-storage.js` | 7,079 B | ~200 | Base64 compression + storage helper |
| `js/media-loader.js` | 9,285 B | ~250 | Resolves data-snr-media from Firestore |
| `js/saas-policy.js` | 1,979 B | ~50 | Stage-based module gating (6 tiers) |

### 4.2 Authentication

| File | Size | Lines | Purpose |
|---|---|---|---|
| `js/admin-auth.js` | 6,659 B | ~180 | Admin email/password login handler |
| `js/student-auth.js` | 7,796 B | ~200 | Student phone+name login (weak, no OTP) |

### 4.3 Admin Dashboard (Monolith — 143 KB)

| File | Size | Lines | Purpose |
|---|---|---|---|
| `js/admin-dashboard.js` | 143,145 B | 3,304 | All-in-one: sidebar nav, 120 sections, student mgmt, fees, exams, CMS, ID cards, theme, bulk import, report cards, analytics |
| `js/admin-tools.js` | 10,146 B | ~250 | Small admin utilities (helper functions) |

### 4.4 ERP Modules (Modular)

| File | Size | Lines | Module |
|---|---|---|---|
| `js/erp-class-mgmt.js` | 53,872 B | ~1,200 | Sessions, classes, sections, subjects, non-subject skills, syllabus |
| `js/erp-attendance.js` | 32,080 B | ~800 | Daily attendance marking, reports, stats |
| `js/erp-fees.js` | 37,211 B | ~950 | Fee master, monthly generation, payment, dues, late fee, discounts |
| `js/erp-exams.js` | 85,201 B | ~2,000 | Exam CRUD, scheduling, grading, datesheet, attendance |
| `js/erp-homework.js` | 10,847 B | ~250 | Homework CRUD, submissions, attachments |
| `js/erp-question-papers.js` | 12,892 B | ~300 | Question paper library, manual upload |
| `js/erp-report-card-tool-v2.js` | 6,067 B | ~150 | PDF report card v2 generation |
| `js/erp-report-card-tool.js` | 1,761 B | ~50 | Earlier report card tool (superseded) |
| `js/erp-timetable.js` | 5,967 B | ~150 | Class timetables, list view, PDF/image upload |
| `js/erp-id-cards.js` | 19,880 B | ~500 | ID card generation (individual + bulk) |
| `js/erp-library.js` | 8,176 B | ~200 | Book catalog, issue/return, history |
| `js/erp-notifications.js` | 5,668 B | ~150 | Send bulk message, delivery history |
| `js/erp-transport.js` | 5,650 B | ~150 | Route management, student mapping |
| `js/erp-admission.js` | 3,209 B | ~80 | Enquiry, admission form, elective mapping |
| `js/erp-analytics.js` | 6,340 B | ~150 | Result analytics |

### 4.5 CMS Modules

| File | Size | Lines | Purpose |
|---|---|---|---|
| `js/cms-admin.js` | 62,094 B | ~1,500 | Admin CMS editor (hero, theme, gallery, staff, holidays, events, achievements, testimonials, page text, page imagery, global stats) |
| `js/cms-settings.js` | 44,950 B | ~1,100 | Public CMS consumer (populates all SEO, text, images, stats) |

### 4.6 Dashboards

| File | Size | Lines | Purpose |
|---|---|---|---|
| `js/student-dashboard.js` | 53,736 B | ~1,200 | Student/parent portal (homework, attendance, fees, exams, results, syllabus, library, transport, notices) |
| `js/super-admin.js` | 11,937 B | ~300 | Legacy super admin dashboard |
| `js/super-admin-pro.js` | 22,340 B | ~550 | Premium "Control Tower" super admin |
| `js/dashboard-analytics.js` | 3,726 B | ~100 | Chart.js fee + enrollment charts (hardcoded demo data) |

### 4.7 Specialized

| File | Size | Lines | Purpose |
|---|---|---|---|
| `js/report-card-factory.js` | 19,661 B | ~500 | Premium report card PDF generation (jsPDF) |
| `js/id-card-templates.js` | 66,144 B | ~1,500 | 13+ ID card templates (CR80 format) |
| `js/report-card-upload.js` | 8,211 B | ~200 | Manual report card PDF upload |
| `js/tool-question-formatter.js` | 11,636 B | ~300 | ExamCraft AI formatter (disabled AI extraction) |
| `js/demand-receipt.js` | 8,238 B | ~200 | Fee demand & receipt printing |
| `js/fee-dues-tool.js` | 13,146 B | ~350 | Search and report fee dues |

### 4.8 Services

| File | Size | Lines | Purpose |
|---|---|---|---|
| `js/services/payment-service.js` | 5,767 B | ~150 | FIFO atomic fee allocation using Firestore transactions |

---

## 5. CSS Files

| File | Size | Lines | Purpose |
|---|---|---|---|
| `style.css` | 45,492 B | 2,404 | Main public site: design tokens, layout, hero, cards, tables, slider, gallery, footer, responsive |
| `css/portal.css` | 47,133 B | 2,354 | Dashboard design system: sidebar, stats grid, form controls, modals, skeletons, glassmorphism |
| `css/id-cards.css` | 3,838 B | 172 | CR80 ID card templates (13+ designs) |
| `css/id-card-premium.css` | 1,441 B | 52 | Premium card overlays, security seals, glass effects |

---

## 6. Node Scripts

| File | Size | Purpose |
|---|---|---|
| `scripts/provision-multi-school.js` | 3,079 B | One-time school seed (SCH001 + SCH002) via firebase-admin |
| `scripts/migrate-to-saas.js` | 4,000 B | Browser console migration v2→v3 (tags docs with schoolId) |
| `scripts/compress-images.js` | 5,549 B | Sharp-based image compression to ≤100 KB → base64 JSON |
| `scripts/generate-placeholders.js` | 2,948 B | Placeholder SVG→PNG→base64 for logo, avatar, signature |
| `scripts/replace-img-paths.js` | 4,916 B | Rewrites HTML to use data-snr-media attributes |
| `scripts/upload-media.js` | 2,828 B | Uploads compressed images to Firestore media collection |
| `scripts/verify-media.js` | 2,285 B | Validates media docs in Firestore |
| `scripts/serviceAccountKey.json` | 2,375 B | 🔴 REAL Firebase Admin SDK key (git-ignored but on disk) |
| `scripts/compressed/` | 47 files | Pre-compressed image JSONs (47 items) |
| `scripts/node_modules/` | — | Local sharp installation |

---

## 7. Existing Documentation (to be migrated into docs/)

### Project Docs/ (3 files)

| File | Size | Coverage |
|---|---|---|
| `Project Docs/01_SaaS_School_Management_Research.md` | 26,440 B | Market survey (9 vendors), 22-module matrix, multi-tenant best practices, compliance, gap analysis, security strategy, roadmap |
| `Project Docs/02_Firestore_Schema_v3.md` | 33,491 B | Schema overview (Mermaid), 3-tier model, TypeScript interfaces (20+ types), composite indexes, security rules v3, migration plan, cost estimation |
| `Project Docs/03_Implementation_Roadmap.md` | 21,122 B | 4-phase plan (27 weeks), commercial model, risk register, success KPIs, team estimates |

### Plan/ (5 master + 19 per-page plans)

| File | Size | Coverage |
|---|---|---|
| `Plan/Master-Plan.md` | 53,407 B | 10-phase execution plan, testing checklist, definition of done, 121 dev-days |
| `Plan/00-master-analysis.md` | 17,452 B | Executive summary, code metrics, architecture, 25-module coverage matrix, 98 gaps, quick-wins |
| `Plan/01-gaps.md` | 16,700 B | 98 gaps (16 P0, 29 P1, 25 P2, 28 P3) with effort estimates |
| `Plan/02-roadmap.md` | 16,806 B | 4-priority roadmap, pricing strategy, OKRs, risk log |
| `Plan/Phase-1-Drafts.md` | 23,438 B | Security lockdown draft code + subtask plan + test plan |
| `Plan/pages/public/*` (9 files) | ~5-10 KB each | Per-page plan for each public HTML file |
| `Plan/pages/portal/*` (7 files) | ~5-10 KB each | Per-page plan for each portal HTML file |
| `Plan/pages/partials/*` (3 files) | ~5-10 KB each | Per-page plan for header/footer/floating-button |

### Market Research (2 files)

| File | Size | Coverage |
|---|---|---|
| `market-research-2026.md` | 46,675 B | 14 sections, 39-row feature matrix, 15+ India competitors, pricing analysis, SWOT, compliance roadmap, 32 sources |
| `competitive-analysis-report.md` | 44,651 B | SNR vs Education Desk, 25-row matrix, 5 workflow analyses, SWOT both sides, 12-month roadmap |

### Competitors/ Folder

| File | Count | Type |
|---|---|---|
| `URLS.txt` | 1 | Education Desk feature URL index (18 entries) |
| Screenshots (PNG) | 17 | Education Desk UI captures (fee, timetable, subject, receipts, student, ID card, promote) |

---

## 8. Other Folders

| Folder | Contents |
|---|---|
| `images/` | Source images (logos, banners, facility slides, trip photos) — tracked in git? partially |
| `_backups/` | `pre-master-plan-2026-06-02.zip` (17.5 MB) + `tmp_section_ids.txt` — untracked |
| `temp_super_admin/` | React+Vite+TypeScript prototype (52 KB App.tsx, Gemini SDK, Recharts) — gitignored |
| `.firebase/` | `hosting..cache` — local deploy cache, gitignored |
| `Question Paper Template/` | 9 .docx + 2 .pdf samples (Class 1-6, GK + Computer) |
| `.vscode/` | Editor settings |
| `node_modules/` | ESLint + Prettier + Stylelint (dev-only) |

---

## 9. Git Status

| Metric | Value |
|---|---|
| Active branch | `phase-1-security` |
| Last commit | Phase 1: Security lockdown — strict Firestore rules, AuthGuard middleware, CSP/HSTS headers |
| Modified files | 32 (HTML + JS + CSS + rules + json) |
| Untracked | `images/README.md`, `robots.txt`, `sitemap.xml`, `js/app-check.js`, `js/i18n.js`, `js/media-loader.js`, `js/rate-limiter.js`, scripts/ |

---

## 10. Key Cross-Cutting Concerns

1. **4 brand names in code:** Apex Public School (CMS), SNR World, SNR Edu ERP, Nexorasoftagency (super-admin pages)
2. **No build step:** Vanilla HTML/JS delivered directly via Firebase Hosting
3. **Firebase SDK 8.10.0** (modular v9 compat) — outdated; v9/modular not used
4. **2 hosting targets** sharing same root directory — `school` and `platform` sites read same files
5. **100+ admin sections** in one monolithic HTML file (446 KB) — extreme loading time
6. **Base64-everywhere storage** — no Firebase Storage, no CDN, no image optimization
