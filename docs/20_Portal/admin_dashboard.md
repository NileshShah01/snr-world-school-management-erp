# Admin Dashboard — `portal/admin-dashboard.html`

> **Type:** Portal — main ERP admin UI (MONOLITH)
> **Location:** `D:\Snredu\portal/admin-dashboard.html`
> **Script:** `D:\Snredu\js\admin-dashboard.js` (143 KB, 3,304 lines)
> **Plan ref:** `Plan/pages/portal/admin-dashboard.md`
> **Date:** June 2026

---

## 1. Purpose

The single-page ERP admin dashboard. 120+ sections covering all school operations: students, fees, exams, results, attendance, CMS, ID cards, reports, analytics, settings, and more.

---

## 2. Current Working State

This is the **heart of the ERP** — a 446 KB / 8,053 line monolithic HTML page with 143 KB of inline+external JS.

### Modules Covered (by admin-dashboard.js)

| Module | Sections | JS File | Lines in JS |
|---|---|---|---|
| **Student Management** | 8 | `admin-dashboard.js` (integrated) | ~200 |
| **Class & Session Management** | 5 | `erp-class-mgmt.js` | 53,872 B |
| **Attendance** | 3 | `erp-attendance.js` | 32,080 B |
| **Fees** | 12 | `erp-fees.js` | 37,211 B |
| **Exams** | 8 | `erp-exams.js` | 85,201 B |
| **Homework** | 2 | `erp-homework.js` | 10,847 B |
| **Library** | 3 | `erp-library.js` | 8,176 B |
| **Transport** | 2 | `erp-transport.js` | 5,650 B |
| **ID Cards** | 3 | `erp-id-cards.js` | 19,880 B |
| **Timetable** | 2 | `erp-timetable.js` | 5,967 B |
| **Notifications** | 2 | `erp-notifications.js` | 5,668 B |
| **Report Cards** | 6 | `report-card-factory.js` + 2 more | 27,489 B total |
| **Website CMS** | 30+ | `cms-admin.js` | 62,094 B |
| **Analytics** | 2 | `dashboard-analytics.js` + `erp-analytics.js` | 10,066 B total |
| **Admission** | 4 | `erp-admission.js` | 3,209 B |
| **Question Papers** | 2 | `erp-question-papers.js` | 12,892 B |
| **Dashboard Overview** | 1 | `admin-dashboard.js` | ~150 |

### Script Dependencies Loaded
```
auth-guard.js, admin-dashboard.js, erp-class-mgmt.js, erp-attendance.js,
erp-fees.js, erp-exams.js, erp-homework.js, erp-question-papers.js,
erp-report-card-tool-v2.js, erp-report-card-tool.js, erp-timetable.js,
erp-id-cards.js, erp-library.js, erp-notifications.js, erp-transport.js,
erp-admission.js, erp-analytics.js, cms-admin.js, cms-settings.js,
id-card-templates.js, report-card-factory.js, access-control.js,
dashboard-analytics.js, image-storage.js, media-loader.js, i18n.js,
payment-service.js, report-card-upload.js, demand-receipt.js, fee-dues-tool.js
```

That's **31 JS files** loaded on a single page.

### Navigation Categories (Sidebar)
1. **Dashboard** — overview stats + charts
2. **Class Management** — sessions, classes, sections, subjects, syllabus
3. **Student Management** — CRUD, bulk import, bulk update, RFID update, promotions
4. **Admission Management** — enquiries, admission, elective mapping
5. **Attendance** — daily marking, reports
6. **Fees Management** — master, generation, collection, dues, discounts, late fee, carry forward
7. **Exams & Results** — scheduling, grading, marks entry, admit cards, results, analytics
8. **Homework** — assign, history
9. **Library** — catalog, issue/return, transactions
10. **Transport** — routes, mapping, reports
11. **Employee Management** — CRUD, bulk update
12. **Reports & Analytics** — result analytics, fee analytics
13. **Website CMS** — hero, theme, gallery, staff, holidays, events, achievements, testimonials, page text, page imagery, global stats
14. **Settings** — theme, branding, global settings
15. **Tools** — ID cards, question papers, timetable, notifications

---

## 3. Gaps & Mismatches

| Gap | Severity | Detail |
|---|---|---|
| **Monolithic page (446 KB)** | P2 | Massive load time, poor mobile performance |
| **Duplicate FEES MANAGEMENT** | P0 | Sidebar has two "Fees Management" entries — second one shadows the first |
| **6 "Under Construction" modules** | P0 | Placeholder sections with "Module Under Maintenance" text |
| **No lazy loading** | P2 | All 31 JS files load on every page load |
| **Hardcoded demo data in charts** | P2 | `dashboard-analytics.js` has hardcoded fee/enrollment numbers |
| **12-second loader watchdog** | P3 | Inline script kills loader after 12s — poor UX for slow connections |
| **Firebase SDK 8.10.0** | P3 | Old; should use v9 modular |
| **All JS in global scope** | P3 | No modules/imports — all window.* globals |
| **Hash-based routing** | P3 | URL doesn't change when navigating sections |
| **No undo/confirm on destructive actions** | P2 | Bulk delete, fee waiver, student status changes lack confirmation dialog |

---

## 4. Perfect Version

1. **Lazy-loaded modules** — load JS only when user navigates to that tab
2. **Component-based architecture** — split admin-dashboard.js into proper modules (React, Vue, or Web Components)
3. **Real-time data** — Firestore onSnapshot for live dashboard updates
4. **Permission-aware sidebar** — teachers see only their modules (attendance, marks), accountants see fees
5. **Mobile-responsive** — sidebar collapses, tables horizontal-scroll
6. **Undo/confirm modals** on destructive actions
7. **Keyboard shortcuts** for power users
8. **Dark mode toggle**
9. **Notification badge** on sidebar for new inquiries, pending fee reminders
10. **Searchable navigation** — Ctrl+K palette to jump to any section
