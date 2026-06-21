# 07 — Timetable Module

## Purpose

Manage class-wise timetables with period definitions, subject-teacher assignments, and period PDF/image uploads. Provides a read-only timetable view for students and parents via student/class lookup.

## Current Working State

- **JS File:** `D:\Snredu\js\erp-timetable.js` (6 KB)
- **Firestore Collections:**
  - `timetable` — top-level collection. Each doc = one class timetable (contains `periods` array, `className`, `section`, `academicYear`).
  - `uploadedTimetables` — stores uploaded timetable images/PDFs per class (Base64 `fileData` + `fileType`).
- **Key Functions:**
  - `loadClasses()` — populates class dropdown from `timetable` collection.
  - `loadTimetable()` — fetches timetable doc and renders period grid.
  - `saveTimetable()` — writes updated periods array to Firestore.
  - `uploadTimetableImage()` / `viewTimetableImage()` — handles PDF/image upload & display.
- **Access:** Admin only in `portal/admin-dashboard.html`. Read-only student/parent view in student dashboard (`timetable-section` tab).
- **Current Limitations:** Pure manual entry — no auto-generation, no drag-drop, no clash detection. Teachers cannot view their own timetable without admin intervention.

## Gaps

| Priority | Gap | Notes |
|----------|-----|-------|
| P1 | No auto-timetable generation | Constraint-based scheduling (teacher availability, subject slots, room capacity) must be hand-planned. |
| P1 | No clash detection | No validation that a teacher is assigned to two periods simultaneously or a room is double-booked. |
| P2 | No drag-drop editor | Adding/editing periods requires manual text input — no visual drag-drop interface. |
| P2 | No substitution tracking | When a teacher is absent, there is no workflow to assign a substitute and log it. |
| P3 | No teacher timetable view | Teachers cannot log in and see their own weekly schedule. |
| P3 | No room scheduling | Rooms/venues are not tracked in the timetable. |
| P3 | No period substitution workflow | No process to request, approve, and record period swaps. |

## Competitor Comparison

| Feature | Education Desk | Fedena | Classe365 | SNR (Current) |
|---------|---------------|--------|-----------|---------------|
| Timetable creation | Basic table entry | Auto-generation with teacher availability | Drag-drop with clash detection | Manual entry only |
| Clash detection | No | Yes | Yes | No |
| Teacher view | Yes | Yes | Yes | No |
| Room scheduling | No | Yes | Yes | No |
| Substitution management | No | Yes | Yes | No |
| PDF/Image upload | — | — | — | Yes |

## Perfect Version

- **Constraint-based auto-generator** with configurable rules: teacher availability, subject periods per week, room capacity, lab/activity blocks.
- **Visual drag-drop editor** (fullcalendar-like or react-beautiful-dnd) for manual adjustments after generation.
- **Real-time clash detection** on save — highlights teacher/room conflicts across all timetables.
- **Teacher dashboard tab** showing personal timetable with period details (class, room, subject).
- **Room/venue scheduling** — dedicated resource collection with availability view.
- **Substitution & swap workflow** — teacher marks absent → admin reassigns → substitute notified → period log updated.
- **Print/export** — PDF timetable generation per class, teacher, or room.
- **v3 Data Model:**
  ```
  schools/{id}/timetables/{timetableId}
  schools/{id}/teachers/{teacherId}/timetable (derived view)
  schools/{id}/rooms/{roomId}/schedule (derived view)
  ```
