# Firestore Schema — Current State (v2)

> **File:** 70_Architecture/Firestore_Schema_Current.md
> **Date:** June 2026
> **Status:** As-deployed on Firestore (apex-public-school-portal)

---

## 1. Overview

The current schema uses **flat top-level collections** (14+), each containing documents that carry a `schoolId` field for tenant identity. All 14 collections were originally single-tenant (Apex Public School, SCH001), then tagged with `schoolId` by `scripts/migrate-to-saas.js`.

**Tenant isolation today:** `schoolId` field on each document (not path-based). Rules allow public read on all collections. Writes require `isAdmin()`.

---

## 2. Collection Diagram

```
Firestore Root
│
├── students/{studentId}          # 500+ docs
├── fees/{feeId}                  # 2000+ docs (per-invoice)
├── payments/{paymentId}          # 4000+ docs (transaction log)
├── notices/{noticeId}            # ~50 docs
├── events/{eventId}              # ~30 docs
├── gallery/{photoId}             # ~100 docs
├── admissions/{appId}            # ~20 docs
├── inquiries/{inqId}             # ~100 docs
├── staff/{staffId}               # ~40 docs
├── timetables/{slotId}           # ~200 docs
├── exams/{examId}                # ~30 docs
├── results/{resultId}            # ~500 docs
├── admitcards/{acId}             # ~500 docs
├── reports/{reportId}            # ~20 docs
├── testimonials/{tId}            # ~15 docs
├── settings/{key}                # ~10 docs
├── gradingRules/{ruleId}         # ~10 docs
├── remarks/{remarkId}            # ~100 docs
├── holidays/{holidayId}          # ~25 docs
├── achievements/{achievementId}  # ~50 docs
├── non_subject_marks/{entryId}   # ~200 docs
├── exam_attendance/{entryId}     # ~200 docs
├── sessions/{sessionId}          # ~3 docs
├── classes/{classId}             # ~12 docs
├── counters/{counterId}          # ~5 docs
├── schedules/{scheduleId}        # ~50 docs
├── publications/{pubId}          # ~10 docs
├── website_content/{contentId}   # ~20 docs
├── demoRequests/{reqId}          # ~5 docs
├── super_admins/{uid}            # ~2 docs
├── users/{uid}                   # ~50 docs
└── schools/{schoolId}            # metadata only (SCH001)
    └── media/{mediaId}           # ~50 docs (Base64 media)
```

---

## 3. Field Listing Per Collection

### students
| Field | Type | Example |
|---|---|---|
| `studentId` | string | `STU001` |
| `admissionNo` | string | `ADM/2024/001` |
| `name` | string | `Rahul Kumar` |
| `fatherName` | string | `Rajan Kumar` |
| `motherName` | string | `Sumitra Devi` |
| `class` | string | `6` |
| `section` | string | `A` |
| `rollNo` | number | `12` |
| `phone` | string | `9876543210` |
| `schoolId` | string | `SCH001` |
| `_migration_v2` | bool | `true` |
| `photo` | string | `data:image/jpeg;base64,...` (Base64) |
| `address` | string | (line1, city, state, pincode) |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

### fees
| Field | Type | Notes |
|---|---|---|
| `feeId` / `studentId` | string | Per-invoice |
| `month` | string | `2025-04` |
| `totalFees` / `paidFees` | number | |
| `status` | string | `paid`, `pending`, `partial` |
| `schoolId` | string | `SCH001` |
| `invoiceNumber` | string | |
| `dueDate` | timestamp | |

### notices
| Field | Type | Notes |
|---|---|---|
| `title` | string | |
| `message` | string | Rich text |
| `category` | string | `general`, `exam`, `holiday` |
| `date` | timestamp | |
| `expiryDate` | timestamp | |
| `schoolId` | string | |

### events
| Field | Type | Notes |
|---|---|---|
| `title` | string | |
| `description` | string | |
| `eventDate` | timestamp | |
| `venue` | string | |
| `category` | string | |
| `schoolId` | string | |

### staff
| Field | Type | Notes |
|---|---|---|
| `name` | string | |
| `designation` | string | |
| `phone` | string | |
| `email` | string | |
| `salary` | number | |
| `schoolId` | string | |

### timetables
| Field | Type | Notes |
|---|---|---|
| `classId` | string | |
| `day` | string | MON–SAT |
| `period` | number | 1–8 |
| `subject` | string | |
| `teacher` | string | |
| `schoolId` | string | |

### exams
| Field | Type | Notes |
|---|---|---|
| `examName` | string | |
| `examType` | string | `midTerm`, `final` |
| `classId` | string | |
| `subject` | string | |
| `date` | timestamp | |
| `maxMarks` | number | |
| `schoolId` | string | |

### results / marks
| Field | Type | Notes |
|---|---|---|
| `studentId` | string | |
| `examId` | string | |
| `marks` | object | `{subject: marks}` |
| `total` | number | |
| `percentage` | number | |
| `grade` | string | |
| `schoolId` | string | |

### admitcards, reports, gallery, holidays
All contain `schoolId`. Gallery uses `dataUri` (Base64). All have `createdAt`/`updatedAt`.

### inquiries
| Field | Type | Notes |
|---|---|---|
| `parentName` | string | |
| `studentName` | string | |
| `classSought` | string | |
| `mobile` | string | |
| `status` | string | `new`, `contacted`, `enrolled` |
| `schoolId` | string | |

---

## 4. Read/Write Estimation

Per school (500 students, 30 staff, 100 active parents):

| Collection | Reads/mo | Writes/mo | Notes |
|---|---|---|---|
| students | 50,000 | 500 | List views, profile views |
| fees | 80,000 | 4,000 | Invoice generation, payment recording |
| payments | 40,000 | 4,000 | Transaction log |
| attendance | 60,000 | 10,000 | Daily mark + monthly report |
| notices | 30,000 | 50 | CMS reads |
| events | 20,000 | 20 | |
| gallery | 15,000 | 30 | |
| exams | 10,000 | 100 | |
| marks/results | 40,000 | 2,000 | Per exam cycle |
| staff | 10,000 | 100 | |
| timetables | 30,000 | 50 | |
| **Total** | **~500,000** | **~150,000** | |

---

## 5. Composite Indexes

**Currently deployed:** `firestore.indexes.json` — NOT deployed. Firestore auto-indexes single-field queries only.

**Required indexes (missing):**

| Collection | Fields | Reason |
|---|---|---|
| students | classId ASC, rollNo ASC | Class roll-number sort |
| students | status ASC, name.last ASC | Alumni list |
| fees | status ASC, dueDate ASC | Overdue fee listing |
| marks | classId ASC, percentage DESC | Rank computation |
| timetable | classId ASC, day ASC, period ASC | Timetable view |
| attendance/entries | studentId ASC, markedAt DESC | Student attendance history |

---

## 6. Cost Calculation

### Per-school/month at 500 students

| Item | Volume | Rate | Cost |
|---|---|---|---|
| Reads | 500,000 | $0.06/100k | $0.300 |
| Writes | 150,000 | $0.18/100k | $0.270 |
| Deletes | 5,000 | $0.02/100k | $0.001 |
| Storage | 50 MiB | $0.18/GiB | $0.009 |
| **Total** | | | **~$0.58** |

Pricing at no-free-tier (paid tier after 50k reads/day free):
- Reads: 500k × $0.036/100k (after free quota) ≈ **$0.18**
- Writes: 150k × $0.108/100k (after free quota) ≈ **$0.162**

**Actual after free quota: ~$0.30/school/month**

---

## 7. Challenges

### 7.1 Hot-spotting on attendance
Attendance is stored as `/attendance/{date}` doc — if 500+ students, the single doc is read/written by all. Risk of contention and 1 MiB limit breach.

**Mitigation needed:** Sub-collection `/attendance/{date}/entries/{studentId}` (v3 approach).

### 7.2 No pagination on large collections
All list views use `.get()` without `limit()` + cursor. At 2000+ fees docs, this causes:
- High latency on admin dashboard
- Risk of OOM on mobile clients
- Excess read costs (reading docs user never sees)

### 7.3 Public read exposes PII
```
match /{collection}/{doc} { allow read: if true; }
```
Student names, phone numbers, addresses, Aadhaar, fee records — all world-readable.

### 7.4 No validation on writes
Any admin can write any field. No `request.resource.data` validation in rules. Fields like `salary`, `role` can contain arbitrary values.

### 7.5 Base64 bloat
Images stored as Base64 data URIs inflate storage ~1.33×. Gallery docs with multiple photos risk hitting 1 MiB limit. No CDN for image delivery.

---

## 8. Rule Excerpt (firestore.rules lines 66–94)

```
// Legacy compat layer (top-level collections)
match /students/{docId}     { allow read: if true; allow write: if isAdmin(); }
match /fees/{docId}         { allow read: if true; allow write: if isAdmin(); }
match /marks/{docId}        { allow read: if true; allow write: if isAdmin(); }
match /staff/{docId}        { allow read: if true; allow write: if isAdmin(); }
// ... 14+ collections all "read: if true"
```

---

## 9. Collection Count Source

From `scripts/migrate-to-saas.js`:
```js
const collectionsToMigrate = [
    'students', 'fees', 'payments', 'notices', 'events',
    'gallery', 'admissions', 'inquiries', 'staff',
    'timetables', 'exams', 'results', 'admitcards',
    'reports', 'testimonials', 'settings',
    // Additional collections discovered in firestore.rules:
    'gradingRules', 'remarks', 'holidays', 'achievements',
    'non_subject_marks', 'exam_attendance',
    'sessions', 'classes', 'counters', 'schedules',
    'publications', 'website_content', 'demoRequests'
];
```
