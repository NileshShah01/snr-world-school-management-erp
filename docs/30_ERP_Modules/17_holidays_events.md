# Module 17: Holidays & Events

**Firebase Project:** `apex-public-school-portal`
**Status:** ✅ Live & Functional — Basic display on public website; limited admin features

---

## Purpose

Manage school holidays and events. Holidays are displayed on the public website (school.html, configurable visibility per school). Events appear as upcoming event cards with a 3-item fallback mechanism. Admin CRUD for both collections lives in the CMS dashboard.

---

## Current Working State

### Firestore Collections (Top-Level)
| Collection | Document | Usage |
|---|---|---|
| `holidays` | `{holidayId}` | Holiday records: `name`, `date`, `type` (gazetted/restricted), `schoolId` |
| `events` | `{eventId}` | Event records: `title`, `date`, `description`, `image`, `schoolId` |
| `schools` | `{schoolId}` | School-level CMS settings on which modules are visible |

### JavaScript Files
| File | Path | Size | Role |
|---|---|---|---|
| `cms-admin.js` | `D:\Snredu\js\cms-admin.js` | 62.1 KB | Holiday & Event CRUD in admin CMS dashboard |
| `cms-settings.js` | `D:\Snredu\js\cms-settings.js` | 45.0 KB | Visibility toggles (show/hide holidays on school.html, show/hide events) |
| `i18n.js` | `D:\Snredu\js\i18n.js` | 14.7 KB | Bilingual labels for holiday/event display |

### Portal Pages
| Page | Path | Usage |
|---|---|---|
| `school.html` | `D:\Snredu\portal\school.html` | Displays upcoming events (up to 3 fallback cards), holidays list |
| CMS Dashboard | Embedded in admin | Add/edit/delete holidays and events |

### Key Functions
- `getUpcomingEvents(schoolId, limit)` — fetches next N events (3 fallback cards on school.html)
- `getHolidays(schoolId, academicYear)` — fetches holiday list for selected year
- `addHoliday(holidayData)` — admin: creates new holiday in Firestore
- `addEvent(eventData)` — admin: creates new event with optional image
- `toggleHolidayVisibility(schoolId, hidden)` — CMS setting to hide holidays on school.html
- `renderEventCards(events)` — renders event cards to DOM; shows "No upcoming events" fallback if empty

### Current Features (Working)
- Holiday CRUD (name, date, type)
- Event CRUD (title, date, description, image)
- Upcoming events display on school.html (3 cards max)
- Holiday list on school.html (with visibility toggle per school)
- CMS settings to show/hide holidays per school

---

## Gaps

| Priority | Gap | Details |
|---|---|---|
| P2 | No academic calendar view | No month/year calendar grid showing all events + holidays in a unified view |
| P2 | No holiday auto-publish as notice | Holidays are displayed on website but not auto-published as a notice on student/parent dashboards |
| P3 | No event registration/RSVP | Students/parents cannot RSVP to events (e.g., sports day, annual day) |
| P2 | No recurrence for events | Events are single-date only; cannot set weekly, monthly, or yearly recurring events |
| P3 | No integration with timetable | Events don't show up in timetable or period adjustments |
| P2 | No multi-day events properly handled | `date` field is a single date; no `startDate` / `endDate` for multi-day events |
| P2 | No event reminders | No email/SMS/push notification before an event |
| P3 | No export to Google Calendar | No iCal/Google Calendar export for holidays and events |
| P2 | No event categories | No type classification (academic, cultural, sports, co-curricular, holiday) |
| P2 | No attendance at events | Cannot mark who attended an event |

---

## Competitor Comparison

| Feature | SNR World | Education Desk | Fedena | Classe365 |
|---|---|---|---|---|
| Holiday Management | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Event Management | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Academic Calendar View | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| Event Recurrence | ❌ No | ❌ No | ✅ Yes | ✅ Yes |
| Event RSVP/Registration | ❌ No | ❌ No | ✅ Yes | ❌ No |
| Event Reminders | ❌ No | ❌ No | ✅ Yes | ✅ Yes |
| Google Calendar Sync | ❌ No | ❌ No | ✅ Yes | ✅ Yes |
| Calendar Integration (Timetable) | ❌ No | ❌ No | ✅ Yes | ❌ No |

**SNR's Holidays & Events module is basic.** Education Desk, Fedena, and Classe365 all offer richer calendar views, recurrence, and event management features.

---

## Perfect Version

1. **Academic calendar view** — month/grid calendar showing holidays, events, exam dates, term boundaries, and fee due dates in a unified interface
2. **Recurring events** — support daily, weekly, monthly, yearly recurrence with optional end date
3. **Multi-day events** — `startDate` + `endDate` fields; display as date range
4. **Event categories** — configurable categories (academic, cultural, sports, holiday, exam) with color coding on calendar
5. **Event RSVP** — students/parents can RSVP (Going / Maybe / Not Going); admin sees headcount
6. **Event reminders** — configurable email/SMS/push notification N days/hours before event
7. **Auto-publish as notice** — when a holiday is added, auto-generate a notice visible on student/parent dashboards
8. **Google Calendar / iCal export** — one-click export of holidays/events to personal calendar apps
9. **Event attendance** — mark attendance at events (who attended sports day, annual day, etc.)
10. **Timetable integration** — block periods for events; show event overlays on teacher/class timetables
