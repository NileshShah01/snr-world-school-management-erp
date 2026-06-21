# 08 — Homework Module

## Purpose

Allow teachers to create, assign, and grade homework. Students submit work as sub-collection documents; parents view assignments and submission status in the student dashboard.

## Current Working State

- **JS File:** `D:\Snredu\js\erp-homework.js` (10.8 KB)
- **Firestore Collections:**
  - `homework` — top-level collection. Each doc represents one homework assignment (`classId`, `subject`, `title`, `description`, `dueDate`, `teacherId`, `attachments` array of Base64-encoded files).
  - `homework/{homeworkId}/submissions` — sub-collection. Per-student submission doc (`studentId`, `studentName`, `submittedAt`, `status`: pending/submitted/late/graded, `grade`, `feedback`, `fileData` Base64).
- **Key Functions:**
  - `loadHomework()` — fetches homework list filtered by class/subject.
  - `saveHomework()` — creates/updates homework doc.
  - `deleteHomework()` — removes homework and its submissions sub-collection.
  - `submitHomework()` — student uploads submission file (Base64).
  - `gradeSubmission()` — teacher assigns grade + feedback.
- **Access:** Teachers create/manage homework in admin dashboard. Students/parents view and submit in student dashboard (`homework-section`).
- **Attachment Handling:** Files stored as Base64 strings directly in Firestore docs (max ~700 KB raw per file). Refer to `IMAGE_STORAGE.md` for details on the no-storage-bucket approach.

## Gaps

| Priority | Gap | Notes |
|----------|-----|-------|
| P1 | No auto-notify parents on new homework | Parents must manually check dashboard; no push/email/SMS notification. |
| P2 | No submission deadline reminders | No automatic reminder to students before due date or alert to teachers on late submissions. |
| P2 | No homework analytics | No visibility into assignment frequency by subject, average submission rates, overdue trends. |
| P2 | No bulk assign to multiple classes | Teachers must create separate homework for each class section. |
| P2 | No attachment size enforcement | Hard Firestore doc limit (~1 MB); Base64 payloads over ~700 KB cause silent failures. |
| P3 | No plagiarism check | No integration with plagiarism detection tools. |

## Competitor Comparison

| Feature | Education Desk | Fedena | Classe365 | SNR (Current) |
|---------|---------------|--------|-----------|---------------|
| Homework CRUD | Yes | Yes | Yes | Yes |
| Submissions with grading | Yes | Yes | Yes | Yes (basic) |
| Attachments | Yes | Yes | Yes | Yes (Base64) |
| Deadline reminders | Yes | No | Yes | No |
| Bulk assign to classes | No | No | Yes | No |
| Plagiarism check | No | No | Third-party | No |
| Analytics / Reports | No | Basic | Yes | No |
| Auto parent notification | No | Yes (email) | Yes (multi) | No |

## Perfect Version

- **Homework creation wizard** — title, description, due date, class(es), subject, optional rubric, multiple file attachments.
- **Bulk assign** — select multiple class sections in a single homework creation flow.
- **Attachment storage in Cloud Storage** — files uploaded to Firebase Storage (or GCS), Firestore stores only download URL. Enforce per-file size limits (e.g., 10 MB) on client side.
- **Auto-notify parents** — trigger cloud function on `homework` create → send via WhatsApp/Email/SMS through the notification engine.
- **Deadline reminders** — scheduled cloud function runs daily at 8 AM, checks homework due within 24h, sends reminders to pending students and their parents.
- **Submission review UI** — gallery view of submissions with side-by-side grading (rubric or point-based), typed feedback, optional audio comment.
- **Analytics dashboard** — assignment frequency by subject, submission rate trends, average grades, teacher workload.
- **Plagiarism integration** — optional Turnitin/Unicheck API hook for text-based submissions.
- **v3 Data Model:**
  ```
  schools/{id}/homework/{homeworkId}
  schools/{id}/homework/{homeworkId}/submissions/{submissionId}
  schools/{id}/classes/{classId}/homework (derived)
  ```
