# Student Dashboard — `portal/student-dashboard.html`

> **Type:** Portal — student/parent self-service
> **Location:** `D:\Snredu\portal/student-dashboard.html`
> **Script:** `D:\Snredu\js\student-dashboard.js` (53.7 KB, ~1,200 lines)
> **Plan ref:** `Plan/pages/portal/student-dashboard.md`
> **Date:** June 2026

---

## 1. Purpose

Student and parent self-service portal. View homework, attendance, fees, exam results, syllabus, library, transport, notices, and profile.

---

## 2. Current Working State

### Dashboard Sections (9)
1. **Dashboard Overview** — student info card, key metrics
2. **Homework** — pending, submitted, late, graded
3. **Attendance** — monthly calendar view with %
4. **Fees & Receipts** — invoice list, payment history, download receipt
5. **Exams** — upcoming schedule, exam calendar
6. **Results** — published exam results, marks breakdown
7. **Syllabus** — syllabus for each subject
8. **Library** — issued books, due dates, fines
9. **Transport** — assigned route, pickup/drop points
10. **Notices** — school notices targeting student/parent
11. **Profile** — personal info, family details, photo

### Working Logic
```
Page load
  → Read student_session from localStorage
  → Validate schoolId matches CURRENT_SCHOOL_ID
  → Initialize ACCESS_CONTROL for student role
  → Firestore reads scoped to this student:
    → homework (where studentId == X)
    → attendanceEntries
    → feePayments
    → marks
    → syllabus
    → library issues
    → transport route
    → notices (audience contains 'students' or 'parents')
    → student profile
```

### Auth Model
- Uses `localStorage.student_session` (same weak auth as student-login)
- Tenant validation checks `schoolId` match
- **No AuthGuard** — relies on session in localStorage

---

## 3. Gaps & Mismatches

| Gap | Severity | Detail |
|---|---|---|
| **No proper auth** | **P0** | Same weakness as student login |
| No push notifications | P1 | No web push for homework/results/fee reminders |
| No parent-teacher messaging | P1 | No in-app chat with teachers |
| No AI tutor / homework help | P2 | No "Ask AI" feature |
| No offline support | P2 | App doesn't work without internet connection |
| No customizable dashboard | P3 | Parents can't reorder/rearrange sections |
| No download of report cards | P2 | Results show marks but no PDF download |
| No fee payment via dashboard | P1 | Fees are view-only — no UPI payment link in dashboard |

---

## 4. Perfect Version

1. **Firebase Auth** — proper parent/student account
2. **Push notifications** — new homework, attendance, results, fee reminders via FCM
3. **In-app payment** — UPI deep-link button for fee invoices
4. **Parent-teacher chat** — messaging with teachers
5. **Report card PDF download** — directly from dashboard
6. **Offline mode** — service worker caches notices, timetable, syllabus
7. **Multi-student switch** — parent with >1 child can switch profile
8. **AI homework helper** — student can ask questions about homework
9. **Dark mode** — toggle for student comfort
