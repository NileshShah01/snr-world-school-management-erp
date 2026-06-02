# Master Analysis — `apex-public-school-New` / SNR Edu ERP

> Comprehensive technical and product analysis of the codebase, architecture, and product surface.
> Generated after a full read of all 19 HTML pages, all 35 JS modules, and key config files.

---

## 1. Executive Summary

**Product**: SNR Edu ERP (formerly Apex Public School portal) — a multi-tenant school management platform targeting Indian SMB / private schools (Play Group to Class 12).

**Repo**: `https://github.com/NileshShah01/apex-public-school-New.git` (default branch: `main`)

**Live deployments**:
- Public school site: `https://apex-public-school-portal.web.app` (Apex Public School, Anjani Bazar, Bihar)
- Marketing site: `https://nileshshah01.github.io/Apex-public-school-test-01` (separate GitHub Pages deployment)
- Super Admin: `/portal/super-admin-pro.html`

**Current production status**:
- ✅ **Strong**: CMS, multi-tenant data model, base64 image storage, fee engine, exam management, ID card generator, report card factory, question paper library
- ⚠️ **Medium**: Mobile UX, branding consistency, dead "under construction" placeholders
- 🔴 **P0 blockers**: Disabled auth guards, no payment gateway, no SMS/WhatsApp integration, security gaps in student login, `/provision.html` public exposure

**Recommended next focus**: Ship-blockers first (auth, payment, SMS), then UX polish, then differentiation features (PWA, Hindi, AI tools).

---

## 2. Code Metrics

### 2.1 By language
| Type | Count | Lines | KB |
|---|---|---|---|
| HTML files | 19 | ~10,800 | ~640 |
| JS files (top-level) | 35 | ~17,500 | ~785 |
| JS files (services/) | 1 | ~200 | ~8 |
| CSS files | 4 | ~5,200 | ~145 |

### 2.2 Top 10 largest JS files
| File | Lines | KB | Purpose |
|---|---|---|---|
| `admin-dashboard.js` | 3,308 | 140.1 | Main admin controller — section routing, table population, CRUD |
| `erp-exams.js` | 2,022 | 83.2 | Exam creation, scheduling, marks entry, result analytics |
| `id-card-templates.js` | 734 | 64.5 | 13+ premium CR80 ID card design templates |
| `cms-admin.js` | 1,424 | 60.7 | Website CMS — content management for public site |
| `erp-class-mgmt.js` | 1,415 | 52.6 | Sessions, classes, subjects, syllabus management |
| `student-dashboard.js` | 1,282 | 52.5 | Student portal — 9 sections of data display |
| `erp-fees.js` | 847 | 36.4 | Fee master, monthly generation, payment collection |
| `cms-settings.js` | 710 | 34.9 | Public site content loader (hero, stats, events, etc.) |
| `erp-attendance.js` | 816 | 31.3 | Daily attendance marking + reports |
| `super-admin-pro.js` | 586 | 21.7 | Super admin dashboard (Tailwind UI) |

### 2.3 Top 5 largest HTML files
| File | Lines | KB | Notes |
|---|---|---|---|
| `portal/admin-dashboard.html` | 8,053 | 435.4 | **The monolith** — should be split |
| `portal/student-dashboard.html` | 740 | 40.8 | Student SPA with 9 sections |
| `portal/super-admin-pro.html` | 693 | 38.2 | Modern super admin |
| `portal/super-admin.html` | 529 | 19.4 | Legacy super admin |
| `contact.html` | 337 | 15.0 | Public contact form |

### 2.4 Total addressable surface
- **100+ admin dashboard sections**
- **~10 public-facing pages**
- **3 portal login pages** (admin, student, super-admin)
- **30+ JS modules**

---

## 3. Architecture

### 3.1 Tech stack
- **Frontend**: Vanilla HTML5 + CSS3 + ES6+ JavaScript (no build step, no framework)
- **CSS approach**: BEM-ish custom classes + CSS custom properties (CSS variables)
- **Backend**: Firebase (Firestore + Auth + Hosting)
- **Image storage**: Base64 strings in Firestore (no Firebase Storage) — see `IMAGE_STORAGE.md`
- **Hosting**: Firebase Hosting (2 targets: `school` and `snredu-erp`)
- **External libs (CDN)**: Firebase 9.23.0 compat, Chart.js, Tailwind (admin/super-admin), FontAwesome 6, Lucide, html2pdf.js, jspdf
- **Auth**: Firebase Auth (email/password for admin, phone for student, email/password for super admin)
- **Multi-tenant**: Data scoped by `schoolId` (default `SCH001`)

### 3.2 Data model (Firestore collections)
```
schools/{schoolId}/                              # Multi-tenant root
  ├─ settings/general                            # School metadata (name, phone, address, etc.)
  ├─ students/                                   # Student records
  ├─ staff/                                      # Teacher/employee records
  ├─ classes/                                    # Class definitions
  ├─ subjects/                                   # Subject definitions
  ├─ sessions/                                   # Academic sessions (2024-25, 2025-26, etc.)
  ├─ fees/                                       # Fee structure
  ├─ payments/                                   # Payment records (FIFO atomic via payment-service.js)
  ├─ attendance/                                 # Daily attendance
  ├─ exams/                                      # Exam definitions
  ├─ marks/                                      # Marks per exam
  ├─ results/                                    # Published results
  ├─ library/books/                              # Library catalog
  ├─ library/transactions/                       # Issue/return records
  ├─ transport/routes/                           # Bus routes
  ├─ homework/                                   # Assignments
  ├─ notifications/                              # Notice board
  └─ cms/                                        # Website content
      ├─ heroSlides/                             # Home hero images
      ├─ events/                                 # Upcoming events
      ├─ achievements/                           # Achievement cards
      ├─ testimonials/                           # Parent testimonials
      ├─ galleryImages/                          # Photo gallery
      ├─ facilities/                             # Facility cards
      └─ staff/                                  # Staff directory

inquiries/                                       # Public contact form submissions
auditLog/                                        # (Recommended, not yet implemented)
demoRequests/                                    # (Recommended, not yet implemented)
```

### 3.3 Multi-tenant resolution (`firebase-config.js`)
Resolution order:
1. `?schoolId=` query param
2. `sessionStorage.schoolId`
3. URL slug (`/Apexps/...`)
4. Subdomain (`apex.nexorasoftagency.com`)
5. Hostname pattern match
6. Default: `SCH001`

### 3.4 SaaS Tier model (`saas-policy.js`)
6 tiers:
- `STAGE_0`: Suspended/Inactive
- `STAGE_1`: Basic Website
- `STAGE_2`: CMS Admin
- `STAGE_3`: Pro Portal
- `STAGE_4`: ERP Basic
- `STAGE_6`: Full ERP

Sidebar nav → minimum required tier mapping is defined in `MODULE_PERMISSIONS`. UI enforcement is incomplete.

### 3.5 Hosting configuration (`firebase.json`)
Two hosting targets:
- `school` → `apex-public-school-portal` project → public site
- `snredu-erp` → `apex-public-school-portal` project (same project) → platform / super admin

Rewrites for SPA-like behavior, cache headers for `/images/`, `/js/`, `/css/`.

---

## 4. Module Coverage Matrix

| Module | File(s) | Implemented? | Tested? | Documented? | Gaps |
|---|---|---|---|---|---|
| Public site (CMS-driven) | `cms-settings.js`, `cms-admin.js` | ✅ Yes | ❌ No | ⚠️ Partial | See per-page plans |
| Class management | `erp-class-mgmt.js` (1,415 L) | ✅ Yes | ❌ No | ❌ No | No bulk import, no archiving |
| Student management | `admin-dashboard.js` (student section) | ✅ Yes | ❌ No | ❌ No | No bulk update, no CSV import (other than bulkImport section) |
| Admission enquiry | `erp-admission.js` (90 L) | ⚠️ Thin | ❌ No | ❌ No | Only 90 lines — minimal logic |
| Attendance | `erp-attendance.js` (816 L) | ✅ Yes | ❌ No | ❌ No | No biometric/GPS integration |
| Fees | `erp-fees.js` (847 L) + `payment-service.js` | ✅ Yes | ❌ No | ❌ No | No payment gateway, no SMS receipt |
| Exams | `erp-exams.js` (2,022 L) | ✅ Yes | ❌ No | ❌ No | Largest module; needs refactor |
| Results / Report cards | `erp-report-card-tool-v2.js` + `report-card-factory.js` + `report-card-upload.js` | ✅ Yes | ❌ No | ❌ No | 3 separate files — high duplication risk |
| ID cards | `erp-id-cards.js` + `id-card-templates.js` (734 L) | ✅ Yes (13+ templates) | ❌ No | ❌ No | Template gallery, batch PDF |
| Timetable | `erp-timetable.js` (168 L) | ⚠️ Basic | ❌ No | ❌ No | Only 168 lines; teacher timetable is "Under construction" |
| Library | `erp-library.js` (226 L) | ⚠️ Basic | ❌ No | ❌ No | Transactions section is "Under construction" |
| Transport | `erp-transport.js` (155 L) | ⚠️ Basic | ❌ No | ❌ No | Only 155 lines; no GPS tracking |
| Homework | `erp-homework.js` (279 L) | ✅ Yes | ❌ No | ❌ No | No push notifications, no submission flow |
| Question papers | `erp-question-papers.js` (318 L) | ✅ Yes | ❌ No | ❌ No | Base64 in Firestore; library + manual upload |
| Question formatter (AI) | `tool-question-formatter.js` (310 L) | ⚠️ UI only | ❌ No | ❌ No | AI extract is non-functional (button disabled) |
| Notifications | `erp-notifications.js` (142 L) | ❌ No | ❌ No | ❌ No | **Two sections are "Under construction"** |
| Employees / HR | (in admin-dashboard.js) | ❌ No | ❌ No | ❌ No | **3 sections are "Under construction"** |
| Payments (gateway) | ❌ | ❌ | ❌ | ❌ | **Not implemented** — only manual collection |
| SMS / WhatsApp | ❌ | ❌ | ❌ | ❌ | **Not implemented** |
| Biometric / RFID | `studentRfidUpdate` section | ⚠️ UI only | ❌ No | ❌ No | Field exists, no hardware integration |
| Mobile app | ❌ | ❌ | ❌ | ❌ | Web app only (PWA is roadmap) |
| PWA / offline | ❌ | ❌ | ❌ | ❌ | **Not implemented** |
| Hindi / i18n | ❌ | ❌ | ❌ | ❌ | **Not implemented** |
| Privacy / DPDP | ❌ | ❌ | ❌ | ❌ | No privacy policy, no data export, no consent flow |
| Super admin | `super-admin.js` (legacy) + `super-admin-pro.js` (modern) | ⚠️ Two versions | ❌ No | ❌ No | 5 of 10 pro tabs are placeholders |

---

## 5. Security Posture (Summary)

| Concern | Status | Notes |
|---|---|---|
| Admin auth | 🔴 **Disabled** | `admin-auth.js:78-99` has auth guards commented out per project context |
| Student auth | 🔴 **Weak** | Phone + name, no password, no OTP — see `student-dashboard.md` |
| Firestore rules | 🔴 **Permissive** | Project is in dev mode (any authenticated user can read/write most collections) |
| API keys in frontend | 🟡 **Exposed** | `firebase-config.js` contains the API key (acceptable since Firestore rules are the boundary) |
| `/provision.html` public | 🔴 **P0** | No auth gate — anyone can re-provision schools |
| XSS via CMS | 🟡 **Possible** | CMS-driven content uses `innerHTML` in places; needs audit |
| File upload validation | 🟡 **Partial** | `image-storage.js` validates size but not EXIF or content-type |
| Rate limiting | ❌ None | No client-side or server-side rate limits on auth, contact form, etc. |
| PII exposure (student) | 🔴 **High** | Aadhar, phone, address displayed in plain text on student dashboard |
| Audit log | ❌ None | No record of admin actions |
| CSRF | N/A | Static site, no cookies; Firebase App Check recommended |
| CSP headers | ❌ None | No Content-Security-Policy declared |
| HTTPS | ✅ Yes | Firebase Hosting enforces |
| Dependency CVEs | ⚠️ Unknown | No `package.json` at root, no `npm audit`, no SCA tool |

---

## 6. Per-Page Plan Index

See individual files in `Plan/pages/`:

### Public site
- `Plan/pages/public/school.md` — Landing
- `Plan/pages/public/about.md` — About
- `Plan/pages/public/academics.md` — Academics
- `Plan/pages/public/admissions.md` — Admissions (highest conversion value)
- `Plan/pages/public/contact.md` — Contact form
- `Plan/pages/public/facilities.md` — Facilities
- `Plan/pages/public/gallery.md` — Photo gallery
- `Plan/pages/public/platform.md` — SNR Edu ERP marketing
- `Plan/pages/public/provision.md` — **Deprecated provisioning script (security risk)**

### Portal
- `Plan/pages/portal/admin-dashboard.md` — **The monolith (8,053 lines)**
- `Plan/pages/portal/admin-login.md` — Admin login (auth weak)
- `Plan/pages/portal/student-dashboard.md` — Student/parent portal
- `Plan/pages/portal/student-login.md` — Student login (phone+name, weak)
- `Plan/pages/portal/super-admin.md` — **Legacy super admin (consider deprecation)**
- `Plan/pages/portal/super-admin-pro.md` — Modern super admin (5/10 tabs placeholders)
- `Plan/pages/portal/tool-question-formatter.md` — ExamCraft AI (UI only, AI not wired)

### Partials
- `Plan/pages/partials/header.md` — Site header
- `Plan/pages/partials/footer.md` — Site footer
- `Plan/pages/partials/floating-button.md` — Floating CTAs

---

## 7. Cross-Cutting Concerns

### 7.1 Branding inconsistency
The codebase has at least 4 different "brand" names:
- **Apex Public School** (school-specific, in CMS)
- **SNR World** (used in `student-dashboard.html` line 710 footer, `school.html` script version, `saas-policy.js` comment)
- **SNR Edu ERP** (used in `platform.html`, `super-admin-pro.html` brand)
- **Nexorasoftagency** (used in `super-admin.html` AND `super-admin-pro.html` title and pages)

**Decision needed**: Pick one brand for the platform. Recommendation: "SNR Edu ERP" for the platform, "Apex Public School" for the school's branded surface (already CMS-driven).

### 7.2 Firebase SDK version drift
- Most pages: 9.23.0
- `admin-login.html`: 8.10.0 (outdated)
- `provision.html`: 8.10.1 (outdated)
- `super-admin.html` and `super-admin-pro.html`: 9.22.1 (slightly behind)

**Action**: Standardize on 9.23.0 (or upgrade to 10.x if stable).

### 7.3 Inline counter animation duplication
The same ~17-line `setTimeout` counter animation is inlined in:
- `about.html` (lines 230-246)
- `academics.html` (lines 193-209)
- `facilities.html` (lines 281-296)
- `school.html` has none (gap)

**Action**: Move to `cms-settings.js` or new `js/counters.js`.

### 7.4 "Under construction" pattern
6 admin dashboard sections use `data-lucide="construction"` icon + "Module Under Construction" message (lines 7929-8048). Lucide isn't actually loaded, so the icons don't render. This is misleading UI.

**Action**: Either implement or remove from sidebar.

### 7.5 Dead/missing content
- `birthdaySection` and `testimonialsSection` in `school.html` are `<section class="hidden">` — never visible
- `staffSection` in `about.html` is `class="hidden"`
- `holidaysSection` in `academics.html` is `class="hidden"`
- `importantLinksWidget` and `attendanceWidget` in `student-dashboard.html` are hidden

**Action**: Either wire to CMS toggles or remove dead code.

### 7.6 Missing files
- `inquiry.html` referenced 4+ times but **not found in repo** (likely a broken link — needs verification)
- `staff.html` referenced in `student-dashboard.html` line 252 — **not found in repo**
- `holidays.html` referenced in `student-dashboard.html` line 246 — **not found in repo**
- `sms` / `whatsapp` integration files — not present

---

## 8. Recent Changes (this session)

| Date | Change | Reason |
|---|---|---|
| Session start | Cloned repo | Working from `D:\Snredu\` |
| Earlier session | Removed Firebase Storage, added `js/image-storage.js` (Base64 utility) | Cost reduction, simpler stack |
| Earlier session | Migrated 4 files to Base64: `erp-homework.js`, `erp-question-papers.js`, `erp-report-card-tool-v2.js`, `erp-timetable.js` | Remove Storage dependency |
| Earlier session | Removed `firebase-storage-compat.js` from `admin-dashboard.html`; added `/js/image-storage.js?v=1.0` | Replace Storage with Base64 |
| Earlier session | Created `IMAGE_STORAGE.md` (storage contract, limits, API) | Document new pattern |
| Earlier session | Rewrote `README.md` (quick links, storage model, dev/deploy) | Update docs |
| Earlier session | Created `market-research-2026.md` (46 KB, 666 lines, 14 sections) | Competitive analysis |
| Earlier session | Realigned file locations from `D:\Snredu\apex-public-school-New\` to `D:\Snredu\` | Path cleanup |
| This session | Created `Plan/` folder with 19 per-page plans + 3 master docs | Project planning |

---

## 9. Quick-Win Opportunities

Items that can be done in 1-2 hours each, no design needed:

1. **Remove 6 "Module Under Construction" placeholders** from sidebar (or hide them)
2. **Remove dead `<section class="hidden">` blocks** (birthday, testimonials, staff, holidays, important links, attendance)
3. **Fix the duplicate "FEES MANAGEMENT" sidebar** in admin-dashboard.html
4. **Add `<title>` and meta description** to all public pages (SEO)
5. **Add favicon** to all pages
6. **Standardize Firebase SDK** to 9.23.0
7. **Move inline counter animation** to `cms-settings.js`
8. **Add `lang="hi"` alternate link** to all public pages
9. **Fix `og:image`** in school.html to a real URL
10. **Add `data-school-field` attributes** to header/footer identity slots

---

## 10. See Also

- `Plan/01-gaps.md` — Consolidated gap analysis (this folder)
- `Plan/02-roadmap.md` — Prioritized roadmap (P0 → P3)
- `market-research-2026.md` — Competitive landscape (35+ vendors, 32 sources)
- `competitive-analysis-report.md` — vs. Education Desk
- `IMAGE_STORAGE.md` — Base64 storage contract
- `README.md` — Dev/deploy quick links
