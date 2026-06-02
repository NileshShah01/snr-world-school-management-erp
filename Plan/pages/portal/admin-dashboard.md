# `portal/admin-dashboard.html` — School Admin Dashboard

## Purpose
- The ERP control center for a single school's admin/principal/staff.
- Hosts 100+ feature sections across class management, students, admissions, attendance, fees, exams, results, library, transport, employees, academic tools, CMS, settings.
- Loaded by 30+ JS modules (one per major feature area).
- **THE most complex page in the project** (8,053 lines / 445 KB).

## File facts
- 8,053 lines, 435 KB
- ~100 section IDs in `<section id="XxxSection">` blocks
- 30 JS modules loaded at bottom (see below)
- Mobile + Desktop responsive (sidebar collapses)
- Has a 12-second fail-safe loader hide timer (lines 26-33)

## Scripts loaded
```
/js/admin-auth.js?v=1.5
/js/admin-dashboard.js?v=1.5
/js/admin-tools.js?v=1.5
/js/cms-admin.js?v=1.5
/js/cms-settings.js?v=2.0
/js/dashboard-analytics.js?v=1.5
/js/demand-receipt.js
/js/erp-admission.js?v=1.5
/js/erp-analytics.js?v=1.5
/js/erp-attendance.js?v=1.5
/js/erp-class-mgmt.js?v=1.5
/js/erp-exams.js?v=1.5
/js/erp-fees.js?v=1.5
/js/erp-homework.js?v=1.5
/js/erp-id-cards.js?v=1.5
/js/erp-library.js?v=1.5
/js/erp-notifications.js?v=1.5
/js/erp-question-papers.js?v=1.5
/js/erp-report-card-tool-v2.js
/js/erp-timetable.js?v=1.5
/js/erp-transport.js?v=1.5
/js/fee-dues-tool.js?v=1.5
/js/firebase-config.js?v=1.5
/js/id-card-templates.js?v=1.5
/js/image-storage.js?v=1.0
/js/report-card-factory.js?v=1.5
/js/report-card-upload.js
/js/saas-policy.js
/js/services/payment-service.js?v=1.0
```

## Section organization (sidebar groups)
1. **HOME** — `dashboardOverview` (stats, charts, recent admissions, notices)
2. **CLASS MANAGEMENT** — Sessions, Classes, Subjects, Syllabus
3. **STUDENT MANAGEMENT** — Add, Search, Bulk Import, Elective Mapping, Promotions, Bulk Update, RFID Update, Hostel/Transport Reports, Pickup ID Print
4. **ADMISSION** — Enquiry, Search, Admission Form
5. **ATTENDANCE** — Mark Daily, Reports
6. **FEES MANAGEMENT** (DUPLICATE entry 1: lines 181-207) — Collect Fee, Generate Monthly, Collection Dashboard, Fee Master, Search Dues, Send Message
7. **EXAM MANAGEMENT** — Grading, Create Exams, Timetable, View Date-Sheet, Publish, Admit Card, Exam Attendance
8. **RESULT MANAGEMENT** — Bulk Marks, View Report Card, Publish Results, Bulk Result, Analytics, Manage Results, Remarks
9. **FEES MANAGEMENT** (DUPLICATE entry 2: lines 266-305) — expanded list (Student Fee Payment, Monthly Generation, Add Fee Payment, Demand Receipt, Bulk Discount, Bulk Add Extra Fee, Late Fee Rule, Fee Master, Search Dues, Send Message)
10. **NOTIFICATION SYSTEM** — Send Bulk, Delivery History
11. **LIBRARY MANAGEMENT** — Catalog, Issue/Return, Circulation History
12. **TRANSPORT MANAGEMENT** — Routes, Assign Students
13. **EMPLOYEE** — Add, Search, Bulk Update, ID Print
14. **ACADEMIC TOOLS** — Question Formatter (external), Parents Not Paid Tool, Report Card Upload
15. **WEBSITE CMS: GLOBAL** — Hero, Theme, Admission Status, Stats, Gallery, Staff, Holidays, Events, Achievements, Testimonials, Student Portal Controls
16. **WEBSITE CMS: IMAGES** — Home Hero, Facilities List, Memories Grid, About Banner, Admissions Photos, Facilities Page Media
17. **WEBSITE CMS: TEXT** — Home, About, Academics, Admissions, Facilities, Gallery, Contact, Inquiry page text
18. **SETTINGS** — Global Settings, School Statistics, Admin Portal CMS
19. **LOGOUT**

## Special sections (not in sidebar)
- `studentIdPrintSection` — Premium ID Card Generator (template picker, individual + batch)
- `bulkResultGenerator` — Bulk PDF report card tool
- `classTimetables` / `createTimetable` — Timetable management
- `questionPaperLibrary` / `addManualPaper` — Question paper library
- `pickupIdPrint` — Pickup ID cards for parents

## "Module Under Construction" placeholders (🔴 P0 cleanup)
6 sections use `data-lucide="construction"` icon + "Module Under Construction" message:
| Lines | Section ID | Title | "Under maintenance" reason |
|---|---|---|---|
| 7929-7944 | `teacherTimetablesSection` | Teacher Timetables | "Teacher specific timetables are currently under development." |
| 7946-7961 | `sendNotificationSection` | Send Notification | "Push notification services are being integrated." |
| 7963-7978 | `notificationHistorySection` | Notification History | "Notification logs will be available here once the service is live." |
| 7980-7997 | `libraryTransactionsSection` | Library Transactions | "Library transaction history is being migrated to the new database schema." |
| 7999-8014 | `addEmployeeSection` | Add Employee | "The HR Management module is currently under maintenance." |
| 8016-8031 | `searchEmployeeSection` | Search Employee | "Employee search functionality will be restored shortly." |
| 8033-8048 | `bulkEmployeeUpdateSection` | Bulk Employee Update | "Bulk management tools for staff are in the pipeline." |

## Gaps
- **🔴 6 "Module Under Construction" placeholders** ship-block UI in production. Either implement, redirect to a roadmap page, or remove from sidebar.
- **🔴 Duplicate "FEES MANAGEMENT" sidebar entry** (lines 181-207 AND 266-305). Likely a copy-paste error; first entry has 6 items, second has 10. The first entry's `navFees` will conflict with the second.
- **🔴 `admin-auth.js` is loaded but auth guards are commented out** (per project context — line 78-99 of admin-auth.js). Anyone can open the dashboard. P0 ship-blocker.
- **🔴 `navAcademic` shows 3 sub-links but only 1 (`manualReportCardUpload`) is defined** — others are TODO.
- **`sectionMetadata` in `admin-dashboard.js`** (lines 97-160) has only 60 entries but there are 100+ sections — many sections don't get a title/subtitle update on show.
- **Massive monolithic HTML** — 8,053 lines is impossible to maintain. Should be split into per-section partials loaded via fetch/inject.
- **No route guards** — even with auth on, deep links (`#addStudentSection`) work without permission check.
- **No audit log** — critical admin actions (delete student, edit fee) leave no trace.
- **Mixed icon libraries** — FontAwesome (`fas fa-...`) is loaded but some `data-lucide="construction"` icons are used in the placeholders (Lucide isn't actually loaded → icons won't render).
- **Favicon not set** in `<head>`.
- **No CSP / security headers** declared in meta (relies on `firebase.json`).
- **No service worker / offline mode** — admins on flaky networks (common in rural India) get stuck on the 12-second fail-safe.
- **Sidebar toggle button appears twice** in markup (line 79-87 and at line 527 comment) — duplicate.
- **`<style>` blocks inline** for gradients, glass effects — not in `portal.css`; hard to theme.
- **Image upload for student photos** uses `image-storage.js` (Base64) — good, but no client-side EXIF stripping.
- **Bulk delete (line 798-804) is hidden by default** (`class="hidden"`) — never shows unless bulk select is enabled elsewhere. Dead UI.
- **`Page Size = 20` hard-coded** (line 6 of admin-dashboard.js) — no UI to change.
- **No CSV import/export for most modules** — student bulk import exists, but classes/subjects/exams don't have equivalent.
- **No backup/restore** — single-tenant data is in one Firestore project; one mistake = data loss.

## Recommended plan
1. **🔴 Implement auth guards** in `admin-auth.js` (uncomment + harden) — P0 ship-blocker.
2. **🔴 Remove or implement the 6 construction placeholders** — either remove from sidebar or implement basic functionality.
3. **🔴 Fix the duplicate "FEES MANAGEMENT" sidebar** — delete lines 181-207 (the shorter one).
4. **Refactor into per-section partials** — split the 8,053-line HTML into `<section>` files loaded via `fetch().then(inject)`. Reduces file by 80%.
5. **Remove the dead `navAcademic` items** that point to undefined sections.
6. **Add a `sectionMetadata` auto-generation** — derive title/sub from `data-section-title` attributes on the sections themselves.
7. **Add CSP meta tag**: `<meta http-equiv="Content-Security-Policy" content="...">`.
8. **Add a service worker** for offline admin access (PWA for admins).
9. **Add an audit log collection** (`auditLog` in Firestore) — writes on every CUD operation.
10. **Add CSV import/export** to all data-entry modules.
11. **Fix the broken `bulkDeleteBtn`** — either wire it up or remove it.
12. **Add a route guard layer** that checks the user's role against the required permission per section.
13. **Consolidate inline `<style>`** into `portal.css`.
14. **Add a "Help / Tooltip" system** for first-time admins.
