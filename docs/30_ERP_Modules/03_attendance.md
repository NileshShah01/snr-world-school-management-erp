# Module: Attendance Management

## Purpose
Track student attendance daily and period-wise, generate monthly reports, identify defaulters (<75%), and manage late-arrival records.

## Current Working State

### Firestore Collections (Top-Level)
| Collection | Document ID | Fields |
|---|---|---|
| `attendance` | `{attendanceId}` | `date`, `classId`, `section`, `studentId`, `status` (Present/Absent/Late/Holiday), `periods[]`, `markedBy`, `markedAt`, `lateMinutes` |
| `defaulters` | `{defaulterId}` | `studentId`, `classId`, `section`, `percentage`, `month`, `year` |
| (v3 target) | `schools/{id}/attendance/{date}/entries/{studentId}` | — not yet implemented |

### JS Files
| File | Purpose |
|---|---|
| `js/erp-attendance.js` | (~32 KB) Core attendance logic — mark, edit, bulk actions, reports, defaulter list |
| `js/admin-dashboard.js` | Attendance UI sections — class roster grid, date picker, period selector |

### Portal Pages
- `portal/admin-dashboard.html` — Teacher/Admin attendance marking UI

### Key Operations
- **Daily Attendance**: Select class → section → date → mark each student Present/Absent/Late.
- **Bulk "All Present"**: Set all students to Present, then edit exceptions.
- **Period-wise**: For middle/secondary sections — mark per-period attendance (Period 1–8).
- **Monthly Reports**: Calculate per-student attendance percentage for a given month/year.
- **Defaulter List**: Students with attendance < 75%. Auto-generated monthly.
- **Late Arrival**: Track time of arrival and late minutes.

## Gaps

| Priority | Gap | Impact |
|---|---|---|
| P1 | **No parent SMS/WhatsApp alert on absence** — parents not notified when child is absent | Safety/compliance risk |
| P1 | **No mobile app attendance** — teachers must use desktop browser | Inconvenient for field/PTA use |
| P2 | **No biometric/RFID integration** — manual marking only | Time-consuming, error-prone |
| P2 | **No real-time attendance dashboard for principal** — no overview of today's attendance across classes | No operational visibility |
| P3 | **No GPS attendance for transport** — can't verify student boarding bus | Transport safety gap |
| P3 | **No self-attendance for students** — students can't mark own arrival (e.g., library study) | Limited flexibility |

## Competitor Comparison

| Feature | Education Desk | Fedena | Classe365 | SNR WORLD (Current) |
|---|---|---|---|---|
| Daily attendance | Yes | Yes | Yes | Yes |
| Period-wise | Yes | Yes | Yes | Yes |
| Bulk mark | Yes | Yes | Yes | Yes |
| Absence alert | SMS + Email | SMS + Email | SMS + Email + App | **No** |
| Biometric/RFID | Yes (integrated) | Yes (bio-metric) | RFID app | **No** |
| Mobile app | Yes | Yes | Yes | **No** |
| Real-time dashboard | Yes | Yes | Yes | **No** |
| GPS transport | No | Yes | Yes | **No** |

## Perfect Version

- **Attendance Marking**: Teacher dashboard with class roster grid, date picker, period tabs, and bulk actions. Touch-friendly for tablet use.
- **Biometric/RFID Integration**: Student taps RFID card on school-entry reader → auto-mark Present. Real-time sync to Firestore via Cloud Functions + IoT endpoint.
- **Absence Alerts**: Cloud Function triggers on attendance write. If status == "Absent" and time > 9:30 AM → push SMS (Twilio) + WhatsApp (Gupshup/WhatsApp Business API) to parent's registered phone. Configurable alert window.
- **Defaulter Management**: Auto-calculate monthly. Send warning SMS to parents of defaulters. Block exam admit card if < 75% (configurable threshold).
- **Real-time Dashboard**: Principal overview — today's attendance % per class, trend graph, absent count vs total. Updated on every attendance write via `onSnapshot`.
- **Period Tracking**: Array of periods with subject + teacher. Late arrival marked with timestamp and late minutes.
- **GPS Transport**: Student scans QR on bus → GPS coords logged. Parents get "bus arrived at stop" notification. `transportAttendance` subcollection.
- **Mobile App**: PWA or Flutter app for teachers to mark attendance on-the-go. Camera QR scan for student identification.
- **Data Model** (v3): `schools/{schoolId}/attendance/{date}/entries/{studentId}` — efficient queries per date. Denormalized monthly summary on student doc.
