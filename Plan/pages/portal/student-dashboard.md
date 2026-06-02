# `portal/student-dashboard.html` — Student/Parent Portal

## Purpose
- The student-facing portal: dashboard, homework, attendance, profile, fees, exams, results, materials, transport, library.
- Read-only view of the student's academic data (no write actions except profile refresh).
- Authenticated via student phone + name (not email/password — see `student-auth.js`).

## File facts
- 740 lines, 40.8 KB
- Loads `student-dashboard.js` (53 KB, 1,282 lines) — the second-largest JS file
- Uses FontAwesome (loaded), Inter font (Google Fonts)
- Has a 9-section SPA architecture (single HTML, show/hide via JS)

## Scripts loaded
1. Firebase 9.23.0 compat
2. `/js/firebase-config.js`
3. `/js/access-control.js`
4. `/js/student-auth.js` — handles login (phone + name, not email)
5. `/js/student-dashboard.js` — populates all sections

## Sections (single-page app)
| Section ID | Purpose | JS-populated by |
|---|---|---|
| `dashboardSection` | Home — profile banner, fees, homework preview, notice board, principal message, attendance %, quick actions | `student-dashboard.js` |
| `homeworkSection` | Today's assignments + history | `loadHomeworkSection()` |
| `attendanceSection` | Stats + history table | `loadAttendanceSection()` |
| `profileSection` | Student dossier (name, DOB, parents, address, RFID, transport, hostel) | `loadProfileSection()` |
| `feesSection` | Total payable, paid, outstanding + receipts table + ledger | `loadFeesSection()` |
| `examsSection` | Assessment center (report card, admit card, timetable) | `loadExamsSection()` |
| `resultsSection` | Manual report card downloads | `loadResultsSection()` |
| `materialsSection` | Question papers, study resources | `loadMaterialsSection()` |
| `transportSection` | Bus route, pickup stop | `loadTransportSection()` |
| `librarySection` | Currently issued books | `loadLibrarySection()` |

## Section navigation
- Sidebar with `nav-link` anchors (`#dashboard`, `#homework`, etc.)
- `showPortalSection(sectionId)` toggles `portal-section` class, hides others
- Mobile sidebar toggle via `toggleSidebar()`

## Dashboard widgets
- **Profile banner** with photo, name, class, section
- **Exam announcement banner** (hidden by default, shown when exams are announced)
- **Fee balance card** — outstanding + next due date
- **Homework preview** — today's assignments
- **Quick support hub** — Help Desk (contact), Holidays, Directory, Logout
- **Notice board** — synced from CMS `notices`
- **Principal's desk** — message from CMS
- **Important links** — CMS-driven custom links
- **Attendance mini-tracking** — circular progress %

## Gaps
- **🔴 Phone + name auth is weak** — anyone who knows a student's mobile number can log in as them. No OTP, no password, no 2FA. Major security/PII risk.
- **🔴 No "Change password" or "Logout all devices"** — once a parent/guardian has the credentials, they persist forever.
- **🔴 `student-auth.js` (192 lines) is the only thing between public and full student PII** — needs to be hardened.
- **No PII redaction** — Aadhar, phone, address are displayed in plain text on the profile section. A shoulder-surfer or screen recording can capture all of it.
- **No "Mark attendance via selfie" / GPS** — common in modern Indian school apps.
- **No "Apply for leave" workflow** — students have to call/WhatsApp the school.
- **No "Pay fees online" button** — fee card shows balance but no payment gateway link. Cash only.
- **No real-time notifications** — when a new homework is posted or a notice is published, the student doesn't get a push.
- **"Important Links" widget is hidden by default** (`#importantLinksWidget hidden`) — relies on CMS toggle.
- **"Attendance Mini Tracking" widget is hidden by default** — same.
- **No "Academic Calendar" / "Upcoming Events" widget** on the home dashboard.
- **No "Download TC" (Transfer Certificate) workflow** — common parent ask.
- **No "Report Card Preview" for the current term** — only manual report card uploads shown.
- **`admitCardStatusArea` and `resultStatusArea` divs are empty placeholders** — `loadExamsSection()` may not populate them.
- **No "Apply for Hostel / Transport change"** — common parent request.
- **No "Print Receipt" button on the fees table** — must open modal first.
- **No PWA / offline mode** for parents on flaky networks.
- **No "Multi-child" support** — parents with 2+ children at the school can't switch between them.
- **No Hindi language toggle** — NEP 2020 requires.
- **No "My Timetable" widget** — only the class timetable, not personal.

## Recommended plan
1. **🔴 Switch to OTP-based auth** (phone + OTP via Firebase Auth phone provider) — P0 for student data safety.
2. **🔴 Add a "Logout all devices" option** in profile.
3. **🔴 Add PII redaction** on profile section (tap to reveal Aadhar, address, phone).
4. **Add a "Pay Fees Online" button** → integrates with payment gateway (Razorpay/Cashfree — see roadmap).
5. **Add push notification support** (Web Push API + FCM for web).
6. **Add "Apply for Leave" workflow** (parent submits → admin approves).
7. **Add "Multi-child" account switching** in sidebar (for parents with siblings).
8. **Add "My Timetable" widget** on dashboard.
9. **Add Hindi translation** (NEP 2020 + rural India).
10. **Un-hide `importantLinksWidget` and `attendanceWidget`** by default, or remove the dead code.
11. **Add PWA / service worker** for offline access.
12. **Add "Download TC" form** (TC generation workflow).
13. **Add structured data + open graph tags** for shareable profile URLs.
14. **Add "Mark attendance via GPS"** for older students with phones.
