# Phase 2: Academic (6-8 weeks)

> Day-to-day teaching operations: attendance, exams, marks, report cards, timetable, homework, lesson plans, discipline.
> **Effort:** 24-32 engineer-weeks (2-3 devs, 6-8 weeks)
> **Depends on:** Phase 1 (Core SIS — students, classes, subjects, sessions must exist)

---

## Task Checklist

### Week 1-2: Attendance
- [ ] `schools/{id}/attendance/{date}/entries/{studentId}` write API
- [ ] Teacher UI: class roster grid, one-tap present/absent toggle
- [ ] Period-wise attendance for middle/secondary classes
- [ ] Parent SMS/WhatsApp alert on absence (auto-trigger Cloud Function)
- [ ] Monthly calendar view with % attendance per student
- [ ] Defaulters list (< 75% attendance in a month)
- [ ] Late arrival tracking with time stamp
- [ ] Bulk-mark "all present" with exceptions per student
- [ ] CSV export for state reporting
- [ ] Attendance analytics: class-wise %, trend over terms

### Week 3-4: Exams
- [ ] `schools/{id}/sessions/{sessionId}/exams/{examId}` CRUD
- [ ] Exam types: formative, summative, mid-term, final, unit test, practical, annual
- [ ] Subject-wise schedule with date, time, duration, max marks
- [ ] Admit card generation (jsPDF with school branding)
- [ ] Exam seating arrangement (optional, by roll number)
- [ ] Exam results publish/unpublish workflow

### Week 4-5: Marks & Gradebook
- [ ] `schools/{id}/sessions/{sessionId}/exams/{examId}/marks/{studentId}` write API
- [ ] Teacher UI: grid entry (rows = students, cols = subjects)
- [ ] Auto-grade calculation from grading rules config
- [ ] Bulk CSV import for marks
- [ ] Verification workflow: teacher enters → class-teacher verifies → admin publishes
- [ ] Analytics: subject-wise toppers, class average, grade distribution
- [ ] Re-evaluation / correction request workflow

### Week 5-6: Report Cards
- [ ] `schools/{id}/settings/reportCardTemplate` per board
- [ ] CBSE template: scholastic + co-scholastic areas (NEP 2020)
- [ ] ICSE template: subjects + activities + projects
- [ ] State board templates (Bihar, UP, Maharashtra, etc.)
- [ ] PDF generation (jsPDF + html2canvas)
- [ ] Bulk print: "Class 6-A, all students, Mid-Term 2025-26"
- [ ] Parent download via parent portal
- [ ] Auto-generate report card comments (AI — Phase 4 enhancement)

### Week 6-7: Timetable
- [ ] `schools/{id}/timetable/{slotId}` CRUD
- [ ] Auto-generator: constraint-based (teacher availability, room capacity, subject periods/week)
- [ ] Manual drag-drop editor in admin dashboard
- [ ] Period substitutions: "Mr. X is absent, suggest replacement from free teachers"
- [ ] Export/Print: class timetable, teacher timetable, room timetable
- [ ] Timetable view for students/parents in portal

### Week 7: Homework
- [ ] `schools/{id}/homework/{hwId}` CRUD
- [ ] `schools/{id}/homework/{hwId}/submissions/{studentId}` sub-collection
- [ ] Teacher posts: title, description, attachment (Base64), due date
- [ ] Student/parent view: pending, submitted, late, graded
- [ ] Auto-notify parents on new homework via WhatsApp/SMS
- [ ] Teacher grading on submissions with comments

### Week 7-8: Lesson Plans (NEP 2020)
- [ ] `schools/{id}/lessons/{lessonId}` CRUD
- [ ] Competency mapping: each lesson maps to ≥ 1 NEP 2020 competency
- [ ] Pre-built lesson templates (CBSE/NCERT based)
- [ ] Weekly plan: "Class 6-A, Math, Week of 2026-06-09"
- [ ] Lesson status: draft → published → completed

### Week 8: Discipline
- [ ] `schools/{id}/discipline/{incidentId}` CRUD
- [ ] Categories: misbehavior, bullying, absence, uniform violation, academic dishonesty
- [ ] Severity levels: minor, moderate, major, critical
- [ ] Action tracking: warning, counseling, parent meeting, suspension
- [ ] Parent notification log
- [ ] Discipline report: per-class, per-student history

---

## Modules Involved

| Module | Scope |
|--------|-------|
| Attendance | Daily tracking, period-wise, alerts, analytics |
| Exams | CRUD, types, schedule, admit cards, seating |
| Marks & Gradebook | Entry, auto-grade, verification, analytics |
| Report Cards | Board templates, PDF generation, bulk print |
| Timetable | Auto-generator, drag-drop editor, substitutions |
| Homework | CRUD, submissions, grading, notifications |
| Lesson Plans | NEP 2020 competencies, templates, weekly plans |
| Discipline | Incidents, severity, actions, reporting |

---

## JS Files to Create/Modify

| File | Action |
|------|--------|
| `js/erp-attendance.js` | Attendance entry, roster grid, period-wise, alerts |
| `js/erp-exams.js` | Exam CRUD, schedule, admit card, seating |
| `js/erp-marks.js` | Marks entry grid, auto-grade, CSV import, verification |
| `js/erp-gradebook.js` | Grading rules config, analytics, distribution |
| `js/erp-report-cards.js` | Template engine, PDF gen, bulk print |
| `js/erp-timetable.js` | Timetable CRUD, auto-generator, drag-drop editor |
| `js/erp-homework.js` | Homework CRUD, submissions, grading |
| `js/erp-lessons.js` | Lesson plans, competency mapping, templates |
| `js/erp-discipline.js` | Incident CRUD, severity, actions, reports |
| `functions/attendance-alert.js` | Cloud Function: SMS/WhatsApp on absence |
| `functions/homework-notify.js` | Cloud Function: notify on new homework |
| `portal/admin-dashboard.html` | Add sections for all academic modules |
| `portal/student-dashboard.html` | Homework view, timetable view, report cards |
| `portal/teacher-dashboard.html` | Teacher-specific UI (if separate) |

---

## Firestore Collections

| Collection | Document | Key Fields |
|------------|----------|------------|
| `schools/{id}/attendance/{date}/entries/{studentId}` | AttendanceEntry | status, period, lateMinutes, timestamp |
| `schools/{id}/sessions/{sessionId}/exams/{examId}` | Exam | name, type, schedule, maxMarks, status |
| `schools/{id}/sessions/{sessionId}/exams/{examId}/marks/{studentId}` | MarksEntry | subjectMarks, total, grade, verifiedBy |
| `schools/{id}/settings/grading` | GradingRules | gradeBoundaries, passCriteria |
| `schools/{id}/settings/reportCardTemplate` | ReportCardTemplate | board, layout, fields |
| `schools/{id}/timetable/{slotId}` | TimetableSlot | day, period, subjectId, teacherId, room |
| `schools/{id}/homework/{hwId}` | Homework | title, description, dueDate, attachments |
| `schools/{id}/homework/{hwId}/submissions/{studentId}` | Submission | status, fileUrl, grade, teacherComment |
| `schools/{id}/lessons/{lessonId}` | LessonPlan | title, competencies, week, status |
| `schools/{id}/discipline/{incidentId}` | DisciplineIncident | category, severity, action, studentId |

---

## Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| jsPDF | 2.x | Report cards, admit cards, timetable PDF |
| html2canvas | 1.x | Screenshot-to-PDF for report cards |
| Papa Parse | 5.x | CSV import for marks |
| Chart.js | 4.x | Attendance/monthly analytics charts |
| Firebase Functions | — | Attendance/homework alerts |
| MSG91 / WhatsApp API | — | Parent notifications (Phase 3 enhancement) |

---

## Estimated Effort (Dev-Days)

| Week | Module | Dev-Days | Dependencies |
|------|--------|----------|--------------|
| 1-2 | Attendance | 8 | Phase 1 (students, classes) |
| 3-4 | Exams | 5 | Week 2 (sessions, subjects) |
| 4-5 | Marks & Gradebook | 7 | Weeks 3-4 (exams) |
| 5-6 | Report Cards | 7 | Week 5 (marks, grading rules) |
| 6-7 | Timetable | 5 | Week 5 (subjects, teachers) |
| 7 | Homework | 4 | Week 6 (students, classes) |
| 7-8 | Lesson Plans | 3 | Week 4 (subjects) |
| 8 | Discipline | 2 | Week 2 (students) |
| **Total** | | **~41** | |

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Attendance alert costs spike (SMS/WhatsApp) | Medium | Medium | Batch alerts; per-parent opt-in; daily digest |
| Report card templates vary widely across boards | High | High | Build template engine; start with CBSE, add others per demand |
| Timetable auto-generator complexity | High | Medium | Ship manual editor first; auto-generator as V2 |
| Marks entry grid performance with 40+ student rows | Medium | Medium | Virtual scrolling; paginate by section |

---

## Success Criteria / Exit Gate

- [ ] A teacher spends 0 minutes in Excel/pen-paper during a normal school day
- [ ] 1 exam conducted end-to-end (entry → verification → publish → report card download)
- [ ] 1 month of attendance tracked with parent SMS alerts
- [ ] Teacher can mark attendance in < 2 min for a 40-student class
- [ ] Timetable auto-generated and editable with drag-drop
- [ ] Homework posted and submissions tracked
- [ ] Lesson plans created with NEP 2020 competency mapping
- [ ] Discipline incidents logged and actionable
