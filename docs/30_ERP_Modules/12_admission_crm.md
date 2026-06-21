# 12 — Admission CRM Module

## Purpose

Manage the student admission lifecycle from inquiry to enrollment. Includes inquiry capture (via public form), inquiry tracking, elective subject mapping, and the admission process itself.

## Current Working State

- **JS File:** `D:\Snredu\js\erp-admission.js` (3.2 KB — very small, minimal functionality)
- **Firestore Collections:**
  - `inquiries` — top-level collection. Captures admission inquiries with fields: (`name`, `email`, `phone`, `studentName`, `classApplyingFor`, `academicYear`, `message`, `status`: new/contacted/converted/closed, `createdAt`, `source`: website/walk-in/reference).
  - `students` — collection of enrolled students (shared across ERP). Admission-related fields: `admissionNo`, `admissionDate`, `class`, `section`, `electiveSubjects`, `previousSchool`, `rteQuota`.
  - `electiveMapping` — maps classes to available elective subject choices (used in admission form).
- **Key Functions:**
  - `loadInquiries()` — fetches inquiry list filtered by status/date.
  - `addInquiry()` / `saveInquiry()` — creates/updates inquiry records.
  - `searchInquiry()` — search by name, email, or phone.
  - `convertToStudent()` — converts inquiry to student admission (mark as converted, create student record).
  - `loadElectives()` — loads elective mapping for a given class.
  - `saveElectiveMapping()` — updates elective subjects per class.
- **Public Inquiry Form:** `contact.html` at `D:\Snredu\portal\contact.html` writes to `inquiries` collection.
- **inquiry.html:** Referenced in navigation but **file missing** — results in 404. This page was intended to be a dedicated admission inquiry form.
- **Access:** Admin manages inquiries and admissions in admin dashboard. Public submits via contact form.

## Gaps

| Priority | Gap | Notes |
|----------|-----|-------|
| P0 | inquiry.html missing | Navigation link exists but file is not created — 404 on access. |
| P0 | No online admission form with document upload | No dedicated multi-step admission form; contact form is too basic for formal admission applications. |
| P1 | No RTE 25% quota tracking | Cannot track or manage Right to Education act reserved seats. |
| P2 | No automated follow-up reminders | No scheduled reminders to contact unconverted inquiries. |
| P2 | No merit list generation | No mechanism to generate rank-ordered merit lists for competitive admissions. |
| P2 | No entrance exam scheduling | No interface to schedule, manage, or record entrance exam results. |
| P2 | No enrollment confirmation workflow | No formal workflow for accept → pay fee → confirm enrollment. |
| P2 | No document verification system | No upload, verify, and approve workflow for admission documents (birth certificate, address proof, marksheets). |
| P3 | No interview scheduling | No calendar-based interview scheduling for nursery/pre-primary admissions. |

## Competitor Comparison

| Feature | Education Desk | Fedena | Classe365 | SNR (Current) |
|---------|---------------|--------|-----------|---------------|
| Inquiry capture | Yes | Yes | Yes | Yes (basic) |
| Online admission form | Yes | Yes | Yes | No (missing page) |
| Document upload | Yes | Yes | Yes | No |
| Merit list generation | No | Yes | Yes | No |
| Entrance exam management | No | Yes | Yes | No |
| Interview scheduling | No | No | Yes | No |
| RTE quota tracking | India-specific | India-specific | No | No |
| Enrollment workflow | Yes | Yes | Yes | No |
| Automated follow-ups | No | No | Yes | No |

## Perfect Version

- **Multi-step online admission form** — wizard-style: student details, parent details, address, previous school, documents upload, elective selection, declaration. Mobile-responsive.
- **Document verification system** — upload documents → admin verifies (approve/reject with reason) → status tracked per applicant. Cloud Storage for files.
- **RTE 25% quota module** — dedicated flag on inquiry/student. Auto-track quota seat availability. Generate RTE reports for compliance.
- **Automated follow-up engine** — configurable email/WhatsApp sequences for unconverted inquiries (Day 1, Day 3, Day 7). Triggered via cloud functions.
- **Entrance exam module** — schedule exam date/time/venue, record scores, auto-rank by class, generate merit list with tie-breaking rules.
- **Interview scheduler** — for nursery/pre-primary: admin sets slots → parents book online → confirmation sent → interview result recorded.
- **Enrollment confirmation workflow** — offer letter generation → parent accepts → fee payment → enrollment confirmed → student record auto-created. Status tracking: Applied → Shortlisted → Offer Sent → Accepted → Enrolled.
- **Dashboard analytics** — inquiry funnel (sources, conversion rate), stage-wise applicant count, RTE quota fill %, average time-to-enroll.
- **v3 Data Model:**
  ```
  schools/{id}/admission/inquiries/{inquiryId}
  schools/{id}/admission/inquiries/{inquiryId}/documents/{docId}
  schools/{id}/admission/sessions/{academicYear}/quotas (RTE tracking)
  schools/{id}/admission/entranceExams/{examId}/results/{applicantId}
  schools/{id}/students/{studentId} (enrolled student record)
  ```
- **Fix immediately:** Create `inquiry.html` at `D:\Snredu\portal\inquiry.html` with basic form matching `contact.html` structure to resolve the 404.
