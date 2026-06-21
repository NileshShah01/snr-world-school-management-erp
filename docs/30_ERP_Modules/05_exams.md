# Module: Exam Management

## Purpose
Create and manage exams — scheduling, grading rules, datesheet publishing, admit card generation, seating arrangements, and question paper formatting.

## Current Working State

### Firestore Collections (Top-Level)
| Collection | Document ID | Fields |
|---|---|---|
| `exams` | `{examId}` | `name`, `type` (formative/summative/mid-term/final/unit-test/practical/annual), `classId`, `section`, `startDate`, `endDate`, `syllabus`, `maxMarks`, `passingMarks`, `subjectSchedule[]` (subject, date, time, room), `status` |
| `gradingRules` | `{ruleId}` | `name`, `marksRange[]` (min, max, grade, gradePoint), `isActive` |
| `examResults` | `{resultId}` | `examId`, `studentId`, `subjectMarks[]` (subject, marksObtained, maxMarks, grade), `totalMarks`, `percentage`, `rank`, `result` (Pass/Fail) |

### JS Files
| File | Purpose |
|---|---|
| `js/erp-exams.js` | (~85 KB — largest module) Exam CRUD, scheduling, date sheet, admit card, seating, result entry |
| `js/admin-dashboard.js` | Exam management UI sections |
| `js/tool-question-formatter.js` | Question paper formatting tool |

### Portal Pages
- `portal/admin-dashboard.html` — Exam management sections
- `portal/tool-question-formatter.html` — Standalone question paper formatter

### Key Operations
- **Exam CRUD**: Create/edit exam with type, dates, class, subjects. Assign max marks per subject.
- **Datesheet**: Publish schedule view showing subject-wise date, time, room.
- **Seating Arrangement**: Auto-generate seating plan per room (student rollNo → seat number).
- **Admit Card**: jsPDF-generated admit card with student photo, exam schedule, instructions.
- **Result Entry**: Teacher enters marks per subject per student. Grade auto-calculated from `gradingRules`.
- **Exam Attendance**: Track which students appeared for each subject.

## Gaps

| Priority | Gap | Impact |
|---|---|---|
| P1 | **No admit card SMS to parents** — admit cards only downloadable from dashboard | Parents unaware of exam schedule |
| P2 | **No online exam mode** — no computer-based test interface | Can't conduct online exams |
| P2 | **No auto-grading for objective questions** — all marking is manual | Teacher workload high |
| P2 | **No exam analytics dashboard** — no class-wise performance trends, subject weak areas | No data-driven insights |
| P2 | **No schedule conflict detection** — overlapping exams/rooms not flagged | Scheduling errors possible |
| P2 | **No marks verification workflow** — no "teacher enters → HoD verifies → principal approves" flow | Data integrity risk |
| P3 | **No practical exam management** — no separate flow for practical exams with internal/external evaluators | Incomplete coverage |

## Competitor Comparison

| Feature | Education Desk | Fedena | Classe365 | SNR WORLD (Current) |
|---|---|---|---|---|
| Exam scheduling | Basic | Full | Full | Full |
| Gradebook | No | Yes | Yes | Yes |
| Admit card | Yes (PDF) | Yes (PDF) | Yes (PDF + SMS) | PDF (no SMS) |
| Datesheet | Yes | Yes | Yes | Yes |
| Seating plan | No | Yes | Yes | Yes |
| Online exam | No | No | Yes | **No** |
| Auto-grading | No | No | Objective only | **No** |
| Analytics | Basic | Yes | Advanced | **No** |
| Marks verification | No | Yes | Yes | **No** |

## Perfect Version

- **Exam Types**: Current types + pre-board, term-I/II, quarterly, half-yearly, competitive (NTSE, Olympiad).
- **Scheduling**: Drag-and-drop datesheet builder. Auto-conflict detection (teacher assigned to two rooms, room double-booked, student in two exams). Email/SMS notification on publish.
- **Admit Cards**: Auto-generate PDF with QR code (scannable for verification). Push to parent WhatsApp/SMS via Cloud Function on exam publish. Student signature + parent signature fields.
- **Seating Arrangement**: Algorithm — distribute students evenly per room, maintain class integrity, randomize seats. Export room-wise PDF seating charts.
- **Result Entry**: Teacher enters marks per subject. Grade auto-calculated from grading rules. Marks verification workflow: Teacher → HoD review → Principal approval → publish. Audit log on every change.
- **Online Exam**: Optional computer-based test for objective subjects (MCQ). Timer, auto-submit, auto-grading, anti-cheating (tab switch detection, camera proctoring placeholder).
- **Analytics Dashboard**: Class/subject-wise pass %, topper list, average marks trend (exam-to-exam), subject weak areas, student performance percentile. Export to CSV.
- **Practical Exam**: Separate practical entry with internal (teacher) and external (examiner) marks. Combined result = theory + practical.
- **Question Formatter**: Rich text question paper editor with marks allocation, section headers, blueprint. Export to PDF/DOCX.
