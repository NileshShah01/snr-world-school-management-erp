# Firestore Schema v3 — SNR WORLD School ERP

> **Project:** SNR WORLD School ERP (`apex-public-school-portal`)
> **Version:** v3 (target — replaces v2 top-level collections)
> **Audience:** Engineers, data modelers
> **Related:** `01_SaaS_School_Management_Research.md`, `03_Implementation_Roadmap.md`

---

## 1. Schema Overview (Mermaid)

```mermaid
graph TB
    ROOT[(Firestore Root)]

    ROOT --> USERS[/users/{uid}/]
    ROOT --> SCHOOLS[/schools collection/]
    ROOT --> LOGS[/logs_super/{logId}/]
    ROOT --> SETTINGS_SUPER[/settings_super/{key}/]

    SCHOOLS_META["/schools/{schoolId} (metadata doc)"]
    ROOT --> SCHOOLS_META

    SCHOOLS_META --> TENANT[/schools/{schoolId}/...]
    TENANT --> ORG[(org)]
    TENANT --> MEMBERS[/members/{uid}/]
    TENANT --> STUDENTS[/students/{studentId}/]
    TENANT --> STAFF[/staff/{staffId}/]
    TENANT --> CLASSES[/classes/{classId}/]
    TENANT --> SUBJECTS[/subjects/{subjectId}/]
    TENANT --> SESSIONS[/sessions/{sessionId}/]
    SESSIONS --> EXAMS[/exams/{examId}/]
    EXAMS --> MARKS[marks/{studentId}/]
    TENANT --> ATTENDANCE[/attendance/{date}/]
    ATTENDANCE --> ATT_ENTRIES[entries/{studentId}/]
    TENANT --> FEES[/fees/{invoiceId}/]
    TENANT --> TIMETABLE[/timetable/{slotId}/]
    TENANT --> LIBRARY[/library/{bookId}/]
    TENANT --> TRANSPORT[/transport/{routeId}/]
    TENANT --> HOMEWORK[/homework/{hwId}/]
    TENANT --> LESSONS[/lessons/{lessonId}/]
    TENANT --> HOLIDAYS[/holidays/{holidayId}/]
    TENANT --> DISCIPLINE[/discipline/{incidentId}/]
    TENANT --> NOTICES[/notices/{noticeId}/]
    TENANT --> EVENTS[/events/{eventId}/]
    TENANT --> GALLERY[/gallery/{photoId}/]
    TENANT --> TESTIMONIALS[/testimonials/{tId}/]
    TENANT --> INQUIRIES[/inquiries/{inqId}/]
    TENANT --> ADMISSIONS[/admissionApplications/{appId}/]
    TENANT --> MESSAGES[/messages/{threadId}/]
    MESSAGES --> CHATS[chats/{msgId}/]
    TENANT --> PAYROLL[/payroll/{monthId}/]
    TENANT --> AUDIT[/auditLogs/{logId}/]
    TENANT --> SETTINGS[/settings/{configKey}/]
```

---

## 2. Three-Tier Model

| Tier | Path | Audience | Examples |
|---|---|---|---|
| **Tenant root** | `schools/{schoolId}/...` | School members (admins, teachers, students, parents) | `schools/SCH001/students`, `schools/SCH001/fees` |
| **Platform admin** | Top-level | SNR WORLD super-admin | `users`, `schools` metadata, `logs_super`, `settings_super` |
| **Volatile sub-collection** | Under tenant root | High-write event data | `attendance/{date}/entries`, `marks/{examId}/entries` |

**Rule:** All tenant data is **anchored** under `schools/{schoolId}`. The schoolId is **immutable** — never writable by a non-super-admin.

---

## 3. Field-Level TypeScript Interfaces

### 3.1 Platform-Root Collections

```ts
// /users/{uid}
interface User {
  uid: string;
  email: string;
  phone?: string;
  displayName: string;
  photoURL?: string;
  schoolId?: string;         // present for tenant users; absent for super-admin
  role: 'superAdmin' | 'schoolAdmin' | 'teacher' | 'student' | 'parent' | 'accountant' | 'librarian' | 'transportStaff';
  status: 'active' | 'invited' | 'suspended' | 'archived';
  lastLoginAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  fcmTokens?: string[];      // for push notifications
}

// /schools/{schoolId}  (metadata only — the "directory entry")
interface SchoolMetadata {
  schoolId: string;          // "SCH001"
  name: string;              // "Apex Public School"
  shortName: string;         // "APS"
  stage: number;             // 1..12
  board?: 'CBSE' | 'ICSE' | 'State' | 'IB' | 'IGCSE';
  status: 'trial' | 'active' | 'suspended' | 'archived';
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  subdomain?: string;        // "apexps" -> apexps.snredu-erp.web.app
  domain?: string;           // "apexpublicschool.in" custom domain
  adminEmail: string;
  createdDate: Timestamp;
  trialEndsAt?: Timestamp;
  logoUrl?: string;          // Base64 data URI (per IMAGE_STORAGE.md)
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
  };
  limits: {
    students: number;
    staff: number;
    storageMB: number;
  };
}

// /logs_super/{logId}
interface SuperAdminLog {
  type: 'schoolCreate' | 'schoolUpdate' | 'schoolSuspend' | 'planChange' | 'superAdminAction' | 'systemError';
  detail: string;
  admin: string;             // uid
  timestamp: Timestamp;
  schoolId?: string;
  metadata?: Record<string, any>;
}

// /settings_super/{key}
interface PlatformSetting {
  key: string;
  value: any;
  updatedAt: Timestamp;
  updatedBy: string;
}
```

### 3.2 Tenant Root — Org & Members

```ts
// /schools/{schoolId}/org
interface SchoolOrg {
  schoolId: string;
  name: string;
  shortName: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  affiliation: {
    board: 'CBSE' | 'ICSE' | 'State' | 'IB' | 'IGCSE';
    affiliationNo?: string;
    udisePlusId?: string;    // UDISE+ code
    registrationNo?: string;
  };
  academics: {
    currentSessionId: string;        // FK → sessions
    sessionsOffered: ('PrePrimary' | 'Primary' | 'Middle' | 'Secondary' | 'SeniorSecondary')[];
    medium: string[];                 // ['English', 'Hindi']
    shifts?: ('Morning' | 'Evening')[];
  };
  timings: {
    schoolStart: string;              // "08:50"
    schoolEnd: string;                // "14:30"
    periodDurationMin: number;
    periodsPerDay: number;
    breakPeriods: number[];
  };
  branding: {
    logoUrl?: string;                // Base64
    faviconUrl?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  status: 'trial' | 'active' | 'suspended' | 'archived';
  createdDate: Timestamp;
  updatedAt: Timestamp;
}

// /schools/{schoolId}/members/{uid}
interface SchoolMember {
  uid: string;
  email: string;
  displayName: string;
  role: 'schoolAdmin' | 'teacher' | 'student' | 'parent' | 'accountant' | 'librarian' | 'transportStaff';
  status: 'active' | 'invited' | 'suspended';
  // Role-specific links:
  staffId?: string;          // if role in [teacher, accountant, librarian, transportStaff]
  studentId?: string;         // if role == 'student'
  parentOf?: string[];       // studentIds if role == 'parent'
  classIds?: string[];       // classes this teacher is class-teacher of
  subjectIds?: string[];     // subjects this teacher teaches
  joinedAt: Timestamp;
  invitedBy: string;
}
```

### 3.3 Academic Core

```ts
// /schools/{schoolId}/classes/{classId}
interface SchoolClass {
  classId: string;
  name: string;                 // "Class 6", "Grade 8"
  stage: number;                // 1..12
  section: string;              // "A", "B", "C"
  classTeacherId?: string;      // staffId
  room?: string;
  capacity: number;
  studentIds: string[];         // for fast class-roster lookup
  academicSessionId: string;    // FK → sessions
  subjects: { subjectId: string; teacherId: string; periodsPerWeek: number }[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// /schools/{schoolId}/subjects/{subjectId}
interface Subject {
  subjectId: string;
  name: string;                 // "Mathematics"
  code: string;                 // "MATH"
  type: 'core' | 'elective' | 'language' | 'co-curricular' | 'vocational';
  applicableStages: number[];   // [6,7,8]
  maxMarksPerExam: number;
  hasPractical: boolean;
  color?: string;               // for timetable UI
  createdAt: Timestamp;
}

// /schools/{schoolId}/sessions/{sessionId}
interface AcademicSession {
  sessionId: string;            // "2025-2026"
  name: string;                 // "Academic Year 2025-2026"
  startDate: Timestamp;
  endDate: Timestamp;
  terms: {
    termId: string;
    name: string;               // "Term 1", "Semester 1"
    startDate: Timestamp;
    endDate: Timestamp;
  }[];
  status: 'upcoming' | 'active' | 'closed';
  isCurrent: boolean;
  createdAt: Timestamp;
}
```

### 3.4 Students & Staff

```ts
// /schools/{schoolId}/students/{studentId}
interface Student {
  studentId: string;            // "STU0001"
  admissionNo: string;          // "ADM/2024/0042"
  rollNo: number;
  name: {
    first: string;
    middle?: string;
    last: string;
  };
  dateOfBirth: Timestamp;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  nationality: string;
  religion?: string;
  category?: 'General' | 'OBC' | 'SC' | 'ST';
  aadhaarNo?: string;           // sensitive — protect in rules
  photoUrl?: string;            // Base64

  // Current placement
  classId: string;
  section: string;
  academicSessionId: string;
  rollNoInClass: number;
  status: 'active' | 'alumni' | 'transferred' | 'suspended' | 'tcIssued';

  // Family
  father: {
    name: string;
    occupation?: string;
    phone: string;
    email?: string;
    aadhaar?: string;
  };
  mother: {
    name: string;
    occupation?: string;
    phone?: string;
    email?: string;
    aadhaar?: string;
  };
  guardian?: { name: string; relation: string; phone: string };
  parentUserIds: string[];      // uids of parent accounts

  // Address
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };

  // Transport
  transport?: {
    routeId: string;
    pickupPoint: string;
    vehicleId: string;
  };

  // Medical
  medical?: {
    allergies?: string[];
    conditions?: string[];
    medications?: string[];
    emergencyContact?: { name: string; phone: string; relation: string };
  };

  // RTE
  rte?: {
    isRTE: boolean;
    applicationNo?: string;
    admittedUnderRTE: boolean;
  };

  // Compliance
  udisePlusId?: string;

  // House
  house?: 'Red' | 'Blue' | 'Green' | 'Yellow';

  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Denormalized for fast reads
  displayName: string;          // "Rahul Kumar"
  className: string;            // "Class 6-A"
}

// /schools/{schoolId}/staff/{staffId}
interface Staff {
  staffId: string;              // "STF0001"
  employeeId: string;
  name: { first: string; middle?: string; last: string };
  dateOfBirth: Timestamp;
  gender: 'Male' | 'Female' | 'Other';
  designation: 'Principal' | 'VicePrincipal' | 'PGT' | 'TGT' | 'PRT' | 'NTT' | 'AdminStaff' | 'Accountant' | 'Librarian' | 'Peon' | 'Driver' | 'Conductor' | 'Security' | 'Other';
  department?: 'Teaching' | 'Administration' | 'Accounts' | 'Library' | 'Transport' | 'Maintenance' | 'Security';
  subjects?: string[];          // subjectIds
  classes?: string[];           // classIds (if class teacher)
  dateOfJoining: Timestamp;
  dateOfLeaving?: Timestamp;
  employmentType: 'Permanent' | 'Contract' | 'Temporary' | 'Visiting' | 'Guest';
  status: 'active' | 'onLeave' | 'suspended' | 'resigned' | 'retired';

  contact: { phone: string; email: string; emergencyContact?: { name: string; phone: string } };
  address: { line1: string; city: string; state: string; pincode: string };

  // Payroll
  salary?: {
    basic: number;
    hra: number;
    da: number;
    allowances: number;
    pf: number;
    gross: number;
    net: number;
    bankAccount?: { bank: string; accountNo: string; ifsc: string };
  };

  qualifications?: { degree: string; institution: string; year: number }[];
  udisePlusId?: string;

  userId?: string;              // linked auth user
  displayName: string;          // denormalized

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3.5 Attendance, Marks, Exams

```ts
// /schools/{schoolId}/attendance/{date}  (e.g., 2026-06-02)
interface AttendanceDay {
  date: string;                 // "2026-06-02"
  classId: string;              // attendance is per class per day
  sessionId: string;            // academic session
  markedBy: string;             // staffId
  markedAt: Timestamp;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  // Sub-collection for individual entries (avoids hot-doc):
  // /schools/{schoolId}/attendance/{date}/entries/{studentId}
}

// /schools/{schoolId}/attendance/{date}/entries/{studentId}
interface AttendanceEntry {
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'halfDay' | 'onLeave';
  arrivalTime?: string;         // "08:55"
  remarks?: string;
  markedBy: string;
  markedAt: Timestamp;
  // Period-wise for middle/secondary:
  periods?: { period: number; subjectId: string; status: 'present' | 'absent' | 'late' }[];
}

// /schools/{schoolId}/sessions/{sessionId}/exams/{examId}
interface Exam {
  examId: string;
  name: string;                 // "Mid-Term 2025-26"
  type: 'formative' | 'summative' | 'midTerm' | 'final' | 'unitTest' | 'practical' | 'annual';
  termId: string;               // FK → sessions.terms
  applicableClassIds: string[];
  subjects: { subjectId: string; date: Timestamp; startTime: string; durationMin: number; maxMarks: number; passMarks: number }[];
  startDate: Timestamp;
  endDate: Timestamp;
  status: 'scheduled' | 'ongoing' | 'grading' | 'published' | 'archived';
  reportCardTemplateId?: string;  // CBSE / ICSE / State
  createdBy: string;
  createdAt: Timestamp;
  publishedAt?: Timestamp;
}

// /schools/{schoolId}/sessions/{sessionId}/exams/{examId}/marks/{studentId}
interface Marks {
  studentId: string;
  classId: string;
  subjects: {
    subjectId: string;
    marksObtained: number;
    maxMarks: number;
    grade?: string;             // auto-computed
    remarks?: string;
    isAbsent: boolean;
  }[];
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

### 3.6 Finance — Fees

```ts
// /schools/{schoolId}/fees/{invoiceId}
interface FeeInvoice {
  invoiceId: string;            // "INV/2025-26/0001"
  invoiceNo: string;
  studentId: string;
  classId: string;
  sessionId: string;
  academicTerm: string;         // "Term 1"
  issueDate: Timestamp;
  dueDate: Timestamp;
  lineItems: {
    head: 'tuition' | 'admission' | 'registration' | 'annual' | 'development' | 'lab' | 'library' | 'sports' | 'computer' | 'exam' | 'transport' | 'hostel' | 'meal' | 'uniform' | 'books' | 'misc';
    description: string;
    amount: number;
  }[];
  subTotal: number;
  discount: { reason: string; amount: number; approvedBy: string };
  lateFee: number;
  total: number;
  paid: number;
  balance: number;
  status: 'draft' | 'issued' | 'partial' | 'paid' | 'overdue' | 'waived' | 'cancelled';
  payments: {                  // sub-collection
    paymentId: string;
    amount: number;
    method: 'cash' | 'upi' | 'card' | 'netbanking' | 'cheque' | 'dd' | 'neft' | 'wallet';
    transactionId: string;
    gateway: 'razorpay' | 'payu' | 'cashfree' | 'phonepe' | 'manual';
    paidAt: Timestamp;
    receivedBy?: string;        // staffId if cash/cheque
    receiptUrl?: string;        // Base64
  }[];
  remindersSent: number;
  lastReminderAt?: Timestamp;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3.7 Timetable

```ts
// /schools/{schoolId}/timetable/{slotId}
interface TimetableSlot {
  slotId: string;               // "MON-P3-CL001-MATH"
  classId: string;
  day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT';
  period: number;               // 1..8
  startTime: string;            // "09:40"
  endTime: string;              // "10:25"
  subjectId: string;
  teacherId: string;
  room?: string;
  sessionId: string;
  // Substitution tracking:
  substitutions?: {
    date: string;
    originalTeacherId: string;
    substituteTeacherId: string;
    reason: string;
  }[];
}
```

### 3.8 Library

```ts
// /schools/{schoolId}/library/{bookId}
interface LibraryBook {
  bookId: string;               // "BK0001"
  accessionNo: string;          // barcode
  isbn?: string;
  title: string;
  authors: string[];
  publisher?: string;
  year?: number;
  category: 'Textbook' | 'Reference' | 'Fiction' | 'Non-Fiction' | 'Periodical' | 'Other';
  subject?: string;
  classIds?: string[];          // if textbook
  totalCopies: number;
  availableCopies: number;
  shelfLocation?: string;
  price?: number;
  status: 'available' | 'archived' | 'lost';
  // Issues are stored as a sub-collection:
  // /schools/{schoolId}/library/{bookId}/issues/{issueId}
}

// /schools/{schoolId}/library/{bookId}/issues/{issueId}
interface BookIssue {
  issueId: string;
  bookId: string;
  issuedTo: string;             // studentId or staffId
  issuedToType: 'student' | 'staff';
  issuedBy: string;             // librarian staffId
  issuedAt: Timestamp;
  dueAt: Timestamp;
  returnedAt?: Timestamp;
  fineAmount?: number;
  finePaid?: boolean;
  remarks?: string;
}
```

### 3.9 Transport

```ts
// /schools/{schoolId}/transport/{routeId}
interface TransportRoute {
  routeId: string;
  routeName: string;            // "Route A - North Saran"
  vehicleId: string;            // "BUS001"
  driverId: string;             // staffId
  conductorId?: string;
  stops: {
    stopId: string;
    name: string;
    pickupTime: string;         // "07:15"
    dropTime: string;           // "14:45"
    latitude?: number;
    longitude?: number;
    studentIds: string[];
  }[];
  monthlyFee: number;
  status: 'active' | 'inactive';
}

// /schools/{schoolId}/transport/vehicles/{vehicleId}
interface Vehicle {
  vehicleId: string;
  registrationNo: string;
  type: 'bus' | 'van' | 'auto';
  capacity: number;
  gpsDeviceId?: string;
  insurance: { provider: string; policyNo: string; validTill: Timestamp };
  fitness: { validTill: Timestamp };
  permit: { validTill: Timestamp };
  status: 'active' | 'maintenance' | 'retired';
}
```

### 3.10 Homework & Lessons (NEP 2020)

```ts
// /schools/{schoolId}/homework/{hwId}
interface Homework {
  hwId: string;
  classId: string;
  section?: string;
  subjectId: string;
  teacherId: string;
  title: string;
  description: string;
  attachments?: { name: string; dataUri: string }[];
  assignedDate: Timestamp;
  dueDate: Timestamp;
  // Submissions as sub-collection:
  // /schools/{schoolId}/homework/{hwId}/submissions/{studentId}
}

// /schools/{schoolId}/homework/{hwId}/submissions/{studentId}
interface HomeworkSubmission {
  studentId: string;
  submittedAt?: Timestamp;
  status: 'pending' | 'submitted' | 'late' | 'graded';
  attachments?: { name: string; dataUri: string }[];
  marks?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: Timestamp;
}

// /schools/{schoolId}/lessons/{lessonId}
interface LessonPlan {
  lessonId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  date: Timestamp;
  duration: number;             // minutes
  topic: string;
  subTopics: string[];
  objectives: string[];         // NEP 2020 competencies
  methodology: string;
  resources: string[];
  homeworkId?: string;
  status: 'planned' | 'delivered' | 'reviewed';
}
```

### 3.11 HR & Payroll

```ts
// /schools/{schoolId}/payroll/{monthId}  (e.g., 2026-05)
interface PayrollMonth {
  monthId: string;              // "2026-05"
  month: string;
  sessionId: string;
  status: 'draft' | 'approved' | 'paid';
  processedBy: string;
  processedAt: Timestamp;
  totalAmount: number;
  // Sub-collection:
  // /schools/{schoolId}/payroll/{monthId}/slips/{staffId}
}

// /schools/{schoolId}/payroll/{monthId}/slips/{staffId}
interface SalarySlip {
  staffId: string;
  month: string;
  earnings: { head: string; amount: number }[];
  deductions: { head: 'PF' | 'ESI' | 'TDS' | 'PT' | 'Loan' | 'Advance'; amount: number }[];
  grossEarnings: number;
  totalDeductions: number;
  netPay: number;
  daysPresent: number;
  daysAbsent: number;
  daysLeave: number;
  generatedAt: Timestamp;
  paidAt?: Timestamp;
  paymentMethod?: string;
  transactionId?: string;
}
```

### 3.12 Communication & CMS

```ts
// /schools/{schoolId}/notices/{noticeId}
interface Notice {
  noticeId: string;
  title: string;
  message: string;              // rich text or markdown
  category: 'general' | 'academic' | 'exam' | 'event' | 'urgent' | 'holiday' | 'fee';
  audience: 'all' | 'parents' | 'students' | 'staff' | ('class:' + classId)[];
  publishAt: Timestamp;
  expireAt?: Timestamp;
  attachments?: { name: string; dataUri: string }[];
  channels: { sms: boolean; email: boolean; whatsapp: boolean; push: boolean; inApp: boolean };
  deliveryStatus?: { channel: string; sent: number; delivered: number; read: number; failed: number }[];
  createdBy: string;
  createdAt: Timestamp;
}

// /schools/{schoolId}/messages/{threadId}
// e.g., threadId = "PARENT_TEACHER_STU001_STF001"
interface MessageThread {
  threadId: string;
  participants: string[];       // uids
  type: 'parent-teacher' | 'parent-admin' | 'student-teacher' | 'group' | 'announcement';
  contextRef?: { type: 'student' | 'class' | 'exam'; id: string };
  lastMessage: { text: string; sentBy: string; sentAt: Timestamp };
  unreadCount: { [uid: string]: number };
  status: 'active' | 'archived' | 'closed';
  createdAt: Timestamp;
}

// /schools/{schoolId}/messages/{threadId}/chats/{msgId}
interface ChatMessage {
  msgId: string;
  sentBy: string;
  text: string;
  attachments?: { name: string; dataUri: string; mimeType: string }[];
  sentAt: Timestamp;
  readBy: string[];             // uids
  reactions?: { [uid: string]: string };  // emoji
  replyTo?: string;             // msgId
}

// /schools/{schoolId}/events/{eventId}
interface SchoolEvent {
  eventId: string;
  title: string;
  description?: string;
  category: 'academic' | 'sports' | 'cultural' | 'holiday' | 'meeting' | 'exam' | 'other';
  startDate: Timestamp;
  endDate: Timestamp;
  audience: string[];
  venue?: string;
  attachments?: { name: string; dataUri: string }[];
  createdBy: string;
  createdAt: Timestamp;
}

// /schools/{schoolId}/gallery/{photoId}
interface GalleryItem {
  photoId: string;
  title?: string;
  caption?: string;
  category: 'campus' | 'events' | 'sports' | 'academics' | 'achievements' | 'general';
  dataUri: string;              // Base64 (per IMAGE_STORAGE.md)
  mimeType: string;
  sizeBytes: number;
  tags: string[];
  uploadedBy: string;
  uploadedAt: Timestamp;
}

// /schools/{schoolId}/testimonials/{tId}
interface Testimonial {
  tId: string;
  name: string;
  relation: 'parent' | 'student' | 'alumni' | 'staff';
  studentName?: string;
  quote: string;
  photoUrl?: string;
  rating?: number;              // 1..5
  isPublished: boolean;
  createdAt: Timestamp;
}

// /schools/{schoolId}/inquiries/{inqId}
interface Inquiry {
  inqId: string;
  parentName: string;
  studentName: string;
  classSought: string;
  mobile: string;
  email?: string;
  village?: string;
  message?: string;
  source: 'website' | 'phone' | 'walk-in' | 'referral' | 'social';
  status: 'new' | 'contacted' | 'visit-scheduled' | 'applied' | 'enrolled' | 'lost';
  assignedTo?: string;          // staffId
  followUps: { date: Timestamp; note: string; by: string }[];
  createdAt: Timestamp;
}

// /schools/{schoolId}/admissionApplications/{appId}
interface AdmissionApplication {
  appId: string;
  academicSessionId: string;
  classSought: string;
  applicantName: string;
  dateOfBirth: Timestamp;
  gender: 'Male' | 'Female' | 'Other';
  fatherName: string;
  motherName: string;
  contact: { phone: string; email?: string };
  previousSchool?: { name: string; board: string; class: string; tcIssued: boolean };
  documents: { name: string; dataUri: string; uploadedAt: Timestamp }[];
  isRTE: boolean;
  rteDetails?: { income: number; category: string; certificateNo: string };
  status: 'submitted' | 'under-review' | 'shortlisted' | 'merit-listed' | 'admitted' | 'rejected' | 'wait-listed';
  meritRank?: number;
  entranceScore?: number;
  interviewNotes?: string;
  decisionBy?: string;
  decisionAt?: Timestamp;
  createdAt: Timestamp;
}
```

### 3.13 Discipline, Holidays, Settings, Audit

```ts
// /schools/{schoolId}/discipline/{incidentId}
interface DisciplineIncident {
  incidentId: string;
  studentId: string;
  reportedBy: string;           // staffId
  date: Timestamp;
  category: 'misbehavior' | 'bullying' | 'absence' | 'uniform' | 'academic-dishonesty' | 'other';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  description: string;
  action: 'warning' | 'counseling' | 'parent-meeting' | 'suspension' | 'expulsion' | 'community-service' | 'other';
  actionBy?: string;
  actionAt?: Timestamp;
  parentNotified: boolean;
  parentNotifiedAt?: Timestamp;
  status: 'open' | 'resolved' | 'escalated';
}

// /schools/{schoolId}/holidays/{holidayId}
interface Holiday {
  holidayId: string;
  name: string;
  date: Timestamp;
  type: 'national' | 'state' | 'religious' | 'school' | 'vacation' | 'optional';
  description?: string;
  sessionId: string;
}

// /schools/{schoolId}/settings/{configKey}
interface SchoolSetting {
  key: string;                  // "fee.structure.CLS001", "grading.scale", "reportCard.template"
  value: any;
  updatedAt: Timestamp;
  updatedBy: string;
}

// /schools/{schoolId}/auditLogs/{logId}
interface AuditLog {
  action: string;
  actor: string;                // uid
  target: { collection: string; docId: string };
  before?: any;
  after?: any;
  ip?: string;
  userAgent?: string;
  timestamp: Timestamp;
}
```

---

## 4. Composite Indexes

Indexes to deploy with `firestore.indexes.json`:

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
  ],
  "fieldOverrides": []
}
```

---

## 5. Security Rules v3 (skeleton)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuth() { return request.auth != null; }
    function isSuperAdmin() { return isAuth() && request.auth.token.role == 'superAdmin'; }
    function isSchoolMember(schoolId) {
      return isAuth() && request.auth.token.schoolId == schoolId;
    }
    function isSchoolAdmin(schoolId) {
      return isAuth() && request.auth.token.schoolId == schoolId
             && request.auth.token.role in ['schoolAdmin', 'superAdmin'];
    }
    function isTeacherOf(schoolId, classId) {
      return isAuth() && request.auth.token.schoolId == schoolId
             && (request.auth.token.role == 'schoolAdmin'
                 || (request.auth.token.role == 'teacher'
                     && classId in request.auth.token.classIds));
    }

    // Tenant root — strict isolation
    match /schools/{schoolId}/{document=**} {
      allow read: if isSchoolMember(schoolId) || isSuperAdmin();

      // Org metadata: only school admins
      match /org {
        allow write: if isSchoolAdmin(schoolId);
      }

      // Members: school admins manage; users can read own
      match /members/{uid} {
        allow read: if isSchoolMember(schoolId) || isSuperAdmin();
        allow write: if isSchoolAdmin(schoolId) || (isAuth() && request.auth.uid == uid);
      }

      // Students: parents see their own, teachers see their class, admins all
      match /students/{studentId} {
        allow read: if isSchoolAdmin(schoolId)
                    || (isAuth() && request.auth.token.role == 'teacher'
                        && request.auth.token.classIds.hasAny([resource.data.classId]))
                    || (isAuth() && request.auth.token.role == 'parent'
                        && studentId in request.auth.token.studentIds);
        allow write: if isSchoolAdmin(schoolId);
      }

      // Attendance: teachers can mark their class, parents can read their child
      match /attendance/{date}/entries/{studentId} {
        allow read: if isSchoolAdmin(schoolId)
                    || (isAuth() && request.auth.token.role == 'parent'
                        && studentId in request.auth.token.studentIds);
        allow write: if isSchoolAdmin(schoolId)
                     || (isAuth() && request.auth.token.role == 'teacher');
      }

      // Fees: school admin + accountant write; parents read own
      match /fees/{invoiceId} {
        allow read: if isSchoolAdmin(schoolId)
                    || (isAuth() && request.auth.token.role == 'parent'
                        && resource.data.studentId in request.auth.token.studentIds);
        allow write: if isSchoolAdmin(schoolId)
                     || (isAuth() && request.auth.token.role == 'accountant');
      }

      // Audit logs: append-only, read by school admin
      match /auditLogs/{logId} {
        allow read: if isSchoolAdmin(schoolId);
        allow create: if isSchoolMember(schoolId);
        allow update, delete: if false;
      }
    }

    // Platform admin only
    match /logs_super/{logId} { allow read, write: if isSuperAdmin(); }
    match /settings_super/{key} { allow read, write: if isSuperAdmin(); }
    match /schools/{schoolId} { allow read, write: if isSuperAdmin(); }

    // Users self-service
    match /users/{uid} {
      allow read, write: if isAuth() && (request.auth.uid == uid || isSuperAdmin());
    }
  }
}
```

---

## 6. Migration Plan v2 → v3

### 6.1 Strategy
- **Dual-write** during transition: every write goes to both old (top-level) and new (nested) paths.
- **Read switch** after backfill: change all read paths to new nested path.
- **Backfill** via Cloud Function `migrateV2toV3` that:
  1. Lists all docs in old collections.
  2. Re-writes them under `schools/{schoolId}/...` using the `schoolId` field on each doc.
  3. Marks the old doc with `_migrated_v3: true`.
  4. Logs to `auditLogs`.
- **Cleanup**: after 30 days of stable new-path reads, delete old docs.

### 6.2 Timeline
| Week | Activity |
|---|---|
| 1 | Add `_migration_v3` flag to all new writes |
| 2 | Deploy Cloud Function `migrateV2toV3` (read-only) |
| 3 | Run backfill in batches of 500 |
| 4 | Verify counts (old vs new match) |
| 5 | Switch all client reads to new path |
| 6 | Delete old top-level docs |

### 6.3 Rollback
Keep dual-write for 60 days. If errors spike, switch reads back to old path with a feature flag.

---

## 7. Storage Notes

Per `IMAGE_STORAGE.md`, **all files are stored as Base64 data URIs inside Firestore documents**, not in Firebase Storage. This means:

- Maximum doc size: 1 MiB (Firestore hard limit) — keep individual images < 500 KiB after compression.
- Use `IMAGE_STORAGE.md` `ImageStorage` helper for all uploads.
- For multi-file docs (gallery, homework, admit cards), store as **arrays of `{ name, dataUri }`** and split across multiple docs if total exceeds 1 MiB.

---

## 8. Cost Estimation (per active school / month)

Assumptions: 500 students, 30 staff, ~100 daily active parents, 1 exam per term, 4 fee invoices per student per year.

| Operation | Estimate | Firestore cost |
|---|---|---|
| Reads | ~500k/month (list views, dashboards) | $0.18 |
| Writes | ~150k/month (attendance, marks, fees) | $0.11 |
| Deletes | ~5k/month | $0.004 |
| Storage | ~50 MiB total (Base64 is heavy — count 1.33×) | $0.006 |
| **Total / school / month** | | **~$0.30** |

Authentication: free for first 50k MAU.

At 100 schools: **~$30/month** in Firestore. Revenue target: ₹500/school/month minimum → ₹50,000/month = ~$600. **~95% gross margin on infra.**
