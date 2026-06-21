# Firestore Schema — Target v3 (Multi-Tenant)

> **Source:** `Project Docs/02_Firestore_Schema_v3.md`
> **Audience:** Engineers implementing the v2→v3 migration
> **Date:** June 2026

---

## 1. Schema Overview

All tenant data under `schools/{schoolId}/...`. Platform-level collections remain top-level.

```
Top-level (platform):
  users/{uid}
  schools/{schoolId}        (metadata doc)
  logs_super/{logId}
  settings_super/{key}

schools/{schoolId}/
  ├── org                   (branding, plan, academics)
  ├── members/{uid}         (role mirror of custom claims)
  ├── students/{studentId}
  ├── staff/{staffId}
  ├── classes/{classId}
  ├── subjects/{subjectId}
  ├── sessions/{sessionId}
  │   └── exams/{examId}
  │       └── marks/{studentId}
  ├── attendance/{date}
  │   └── entries/{studentId}
  ├── fees/{invoiceId}              (payments embedded array)
  ├── timetable/{slotId}
  ├── library/{bookId}
  │   └── issues/{issueId}
  ├── transport/routes/{routeId}
  ├── transport/vehicles/{vehicleId}
  ├── homework/{hwId}
  │   └── submissions/{studentId}
  ├── lessons/{lessonId}
  ├── holidays/{holidayId}
  ├── discipline/{incidentId}
  ├── notices/{noticeId}
  ├── events/{eventId}
  ├── gallery/{photoId}
  ├── testimonials/{tId}
  ├── inquiries/{inqId}
  ├── admissionApplications/{appId}
  ├── messages/{threadId}
  │   └── chats/{msgId}
  ├── payroll/{monthId}
  │   └── slips/{staffId}
  ├── auditLogs/{logId}
  ├── settings/{configKey}
  └── media/{mediaId}
```

---

## 2. Three-Tier Model

| Tier | Path | Write Pattern | Examples |
|---|---|---|---|
| **Tenant root** | `schools/{schoolId}/...` | Admin writes, member reads | students, staff, classes, fees |
| **Volatile sub** | Under tenant root | High-frequency writes | attendance/{date}/entries, marks/{examId}/{studentId} |
| **Platform** | Top-level | Super-admin only | users, schools meta, logs_super |

---

## 3. Key TypeScript Interfaces

### Student
```ts
interface Student {
  studentId: string;            // "STU0001"
  admissionNo: string;
  rollNo: number;
  name: { first: string; middle?: string; last: string };
  dateOfBirth: Timestamp;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  nationality: string;
  religion?: string;
  category?: 'General' | 'OBC' | 'SC' | 'ST';
  aadhaarNo?: string;           // PII — protect in rules
  photoUrl?: string;            // Base64
  classId: string;
  section: string;
  academicSessionId: string;
  rollNoInClass: number;
  status: 'active' | 'alumni' | 'transferred' | 'suspended' | 'tcIssued';
  father: { name: string; occupation?: string; phone: string; email?: string };
  mother: { name: string; occupation?: string; phone?: string; email?: string };
  guardian?: { name: string; relation: string; phone: string };
  parentUserIds: string[];
  address: { line1: string; line2?: string; city: string; state: string; pincode: string };
  transport?: { routeId: string; pickupPoint: string; vehicleId: string };
  medical?: { allergies?: string[]; conditions?: string[]; medications?: string[] };
  rte?: { isRTE: boolean; applicationNo?: string; admittedUnderRTE: boolean };
  udisePlusId?: string;
  house?: 'Red' | 'Blue' | 'Green' | 'Yellow';
  displayName: string;          // denormalized "Rahul Kumar"
  className: string;            // denormalized "Class 6-A"
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Staff
```ts
interface Staff {
  staffId: string;
  employeeId: string;
  name: { first: string; middle?: string; last: string };
  dateOfBirth: Timestamp;
  gender: 'Male' | 'Female' | 'Other';
  designation: 'Principal' | 'VicePrincipal' | 'PGT' | 'TGT' | 'PRT' | 'NTT' | 'AdminStaff' | 'Accountant' | 'Librarian' | 'Peon' | 'Driver' | 'Conductor' | 'Security' | 'Other';
  department?: 'Teaching' | 'Administration' | 'Accounts' | 'Library' | 'Transport' | 'Maintenance' | 'Security';
  subjects?: string[];
  classes?: string[];
  dateOfJoining: Timestamp;
  dateOfLeaving?: Timestamp;
  employmentType: 'Permanent' | 'Contract' | 'Temporary' | 'Visiting' | 'Guest';
  status: 'active' | 'onLeave' | 'suspended' | 'resigned' | 'retired';
  contact: { phone: string; email: string; emergencyContact?: { name: string; phone: string } };
  address: { line1: string; city: string; state: string; pincode: string };
  salary?: { basic: number; hra: number; da: number; allowances: number; pf: number; gross: number; net: number; bankAccount?: { bank: string; accountNo: string; ifsc: string } };
  qualifications?: { degree: string; institution: string; year: number }[];
  udisePlusId?: string;
  userId?: string;
  displayName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### FeeInvoice
```ts
interface FeeInvoice {
  invoiceId: string;
  invoiceNo: string;
  studentId: string;
  classId: string;
  sessionId: string;
  academicTerm: string;
  issueDate: Timestamp;
  dueDate: Timestamp;
  lineItems: { head: 'tuition' | 'admission' | 'registration' | 'annual' | 'development' | 'lab' | 'library' | 'sports' | 'computer' | 'exam' | 'transport' | 'hostel' | 'meal' | 'uniform' | 'books' | 'misc'; description: string; amount: number }[];
  subTotal: number;
  discount: { reason: string; amount: number; approvedBy: string };
  lateFee: number;
  total: number;
  paid: number;
  balance: number;
  status: 'draft' | 'issued' | 'partial' | 'paid' | 'overdue' | 'waived' | 'cancelled';
  payments: { paymentId: string; amount: number; method: string; transactionId: string; gateway: string; paidAt: Timestamp; receivedBy?: string }[];
  remindersSent: number;
  lastReminderAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Exam & Marks
```ts
interface Exam {
  examId: string;
  name: string;
  type: 'formative' | 'summative' | 'midTerm' | 'final' | 'unitTest' | 'practical' | 'annual';
  termId: string;
  applicableClassIds: string[];
  subjects: { subjectId: string; date: Timestamp; startTime: string; durationMin: number; maxMarks: number; passMarks: number }[];
  startDate: Timestamp;
  endDate: Timestamp;
  status: 'scheduled' | 'ongoing' | 'grading' | 'published' | 'archived';
  reportCardTemplateId?: string;
  createdBy: string;
  createdAt: Timestamp;
  publishedAt?: Timestamp;
}

interface Marks {
  studentId: string;
  classId: string;
  subjects: { subjectId: string; marksObtained: number; maxMarks: number; grade?: string; remarks?: string; isAbsent: boolean }[];
  totalMarks: number;
  totalMaxMarks: number;
  percentage: number;
  overallGrade?: string;
  rank?: number;
  resultStatus: 'pass' | 'fail' | 'compartment' | 'absent';
  enteredBy: string;
  enteredAt: Timestamp;
  verifiedBy?: string;
  verifiedAt?: Timestamp;
  publishedAt?: Timestamp;
}
```

### AttendanceDay & AttendanceEntry
```ts
interface AttendanceDay {
  date: string;              // "2026-06-02"
  classId: string;
  sessionId: string;
  markedBy: string;          // staffId
  markedAt: Timestamp;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
}

interface AttendanceEntry {
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'halfDay' | 'onLeave';
  arrivalTime?: string;
  remarks?: string;
  markedBy: string;
  markedAt: Timestamp;
  periods?: { period: number; subjectId: string; status: 'present' | 'absent' | 'late' }[];
}
```

---

## 4. Composite Indexes (v3)

```json
{
  "indexes": [
    {
      "collectionGroup": "students",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "classId", "order": "ASCENDING" },
        { "fieldPath": "rollNoInClass", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "students",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "name.last", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "entries",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "studentId", "order": "ASCENDING" },
        { "fieldPath": "markedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "marks",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "classId", "order": "ASCENDING" },
        { "fieldPath": "percentage", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "fees",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "dueDate", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "timetable",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "classId", "order": "ASCENDING" },
        { "fieldPath": "day", "order": "ASCENDING" },
        { "fieldPath": "period", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "notices",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "publishAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 5. Migration Plan v2 → v3

### 5.1 Strategy: Dual-write → Backfill → Cutover

```
Phase 1 — Dual-write (Week 1-2)
  ┌──────────────┐      ┌──────────────┐
  │ Client write  │─────▶│ v2 (top-level)│
  │              │─────▶│ v3 (nested)   │
  └──────────────┘      └──────────────┘

Phase 2 — Backfill (Week 3-4)
  Cloud Function migrateV2toV3:
    - Reads all v2 docs with !_migrated_v3
    - Writes to v3 path
    - Marks v2 doc: _migrated_v3: true

Phase 3 — Read Switch (Week 5)
  - Deploy code change: all schoolData() → v3 paths
  - Monitor error rates
  - Verify read parity

Phase 4 — Cleanup (Week 6+)
  - Delete v2 docs after 30 days stable
  - Remove dual-write code
```

### 5.2 Dual-write helper pattern
```js
// Current: const ref = db.collection('students').doc(id);
// Dual-write:
async function writeStudent(id, data) {
  const batch = db.batch();
  batch.set(db.collection('students').doc(id), data);
  batch.set(
    db.collection('schools').doc(SCHOOL_ID)
      .collection('students').doc(id),
    data
  );
  await batch.commit();
}
```

### 5.3 Firestore function for backfill
```js
exports.migrateV2toV3 = functions.https.onCall(async (data, context) => {
  // Verify super-admin
  // Process in batches of 500
  // For each doc with schoolId field:
  //   Write to schools/{schoolId}/{collection}/{docId}
  //   Mark original: _migrated_v3: true
  //   Log to auditLogs
});
```

### 5.4 Rollback
Keep dual-write active for 60 days. Toggle reads via feature flag:
```js
const USE_V3 = localStorage.getItem('USE_V3_SCHEMA') === 'true';
const col = USE_V3 ? schoolData('students') : db.collection('students');
```

---

## 6. Cost Comparison v2 vs v3

| Factor | v2 (flat) | v3 (nested) | Delta |
|---|---|---|---|
| Read cost | Public read = full doc scan risk | Scoped to school = smaller result sets | 30-50% fewer reads |
| Write cost | Same | Same (same doc write) | Neutral |
| Storage | Base64 same | Base64 same + indexes | ~5% more (indexes) |
| Security overhead | No validation | Field + path validation in rules | No direct cost |
| Perf: list views | `limit()` not used | `limit(25)` + cursor enforced | Faster UX |
| Hot-spot risk | High (attendance single doc) | Low (sub-collection per date) | Eliminated |

**Estimated savings per school: ~$0.10/month** from pagination + reduced reads.

---

## 7. Key Architectural Decisions

1. **Attendance as sub-collection**: `/attendance/{date}/entries/{studentId}` avoids the hot-doc problem. Reading daily attendance for a class of 50 students requires 51 reads (day doc + 50 entries), but avoids contention.

2. **Payments as embedded array in fee invoices**: `fees/{invoiceId}.payments[]` keeps the transaction log with the invoice. For high-volume schools (>2000 invoices), migrate to a sub-collection `fees/{invoiceId}/payments/{paymentId}`.

3. **Marks under exam path**: `sessions/{sessionId}/exams/{examId}/marks/{studentId}` ensures natural scope for grade computation. Cleaner than the flat `marks/{docId}`.

4. **Denormalized displayName/className on students**: Avoids joins. `className` is `"Class 6-A"`. Updated by Cloud Function when class/section changes.

5. **Messages as thread + chats**: Two-level deep (`messages/{threadId}/chats/{msgId}`). Avoids the 1 MiB limit on chat history. Thread doc stores metadata + last message for inbox listing.
