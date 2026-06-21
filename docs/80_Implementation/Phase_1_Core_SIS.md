# Phase 1: Core SIS (6-8 weeks)

> Essential school operations: onboarding, auth, students, staff, classes, subjects, branding, CMS.
> **Effort:** 24-32 engineer-weeks (2-3 devs, 6-8 weeks)
> **Depends on:** Phase 0 (Foundation)

---

## Task Checklist

### Week 1: School Onboarding
- [ ] Super-admin `OnboardSchool` flow:
  - Enter school metadata (name, board, address, admin contact)
  - Auto-generate `schoolId` (SCH001, SCH002, ...)
  - Create admin user + send invite email
  - Auto-generate `schools/{id}/org` doc with defaults
  - Apply branding (logo, colors)
- [ ] Subdomain mapping: `{subdomain}.snredu-erp.web.app` → schoolId
- [ ] Custom domain support via `schools/{id}.domain` + Firebase Hosting rewrites
- [ ] Plan/limits assignment at creation time

### Week 2: Auth & Members
- [ ] Firebase Auth (email/password + phone OTP per Phase 1 security)
- [ ] Custom claims: `schoolId`, `role`, `classIds`, `subjectIds`
- [ ] `schools/{id}/members/{uid}` mirror doc (on user create)
- [ ] Invite flow: admin sends email invite → user clicks → account created
- [ ] Bulk CSV import for members (Papa Parse)
- [ ] Parent signup via `?invite=TOKEN` link
- [ ] Role-based UI: schoolAdmin vs teacher vs student vs parent views

### Week 3: Classes & Sections
- [ ] `schools/{id}/classes/{classId}` CRUD
- [ ] Bulk create: "Class 1-A through Class 8-C" in one action
- [ ] Class-teacher assignment (staffId on class doc)
- [ ] Subject-to-class mapping with periods/week
- [ ] Promotion tool: "Promote all Class 5 to Class 6" at year-end

### Week 3b: Subjects
- [ ] `schools/{id}/subjects/{subjectId}` CRUD
- [ ] Pre-populated subject library: CBSE, ICSE, State board
- [ ] Subject-to-stage mapping (e.g., Mathematics → stages 1-12)
- [ ] Subject types: core, elective, language, vocational, co-curricular
- [ ] Color coding for timetable UI

### Week 4: Academic Sessions
- [ ] `schools/{id}/sessions/{sessionId}` CRUD
- [ ] Term management: 2-term, 3-term, semester config
- [ ] "Start new session" wizard: copy structure from previous session
- [ ] Session switch in UI: all screens filter by `?sessionId=`
- [ ] Status flow: upcoming → active → closed

### Week 4-5: Students
- [ ] `schools/{id}/students/{studentId}` CRUD
- [ ] Bulk CSV import with field validation
- [ ] Photo upload (Base64 via `ImageStorage`, < 500 KiB)
- [ ] Family details: father, mother, guardian
- [ ] Auto-generate studentId, admissionNo, rollNoInClass
- [ ] Aadhaar field with field-level security rules (admin-only read)
- [ ] RTE flag + 25% quota tracking
- [ ] UDISE+ ID field for government reporting
- [ ] Transfer certificate flow
- [ ] Alumni status post-graduation
- [ ] Field-level PII redaction (Aadhaar: last 4 only, tap to reveal)

### Week 5-6: Staff
- [ ] `schools/{id}/staff/{staffId}` CRUD
- [ ] Designations, departments, employment type
- [ ] Joining/leaving dates
- [ ] Subject and class assignment per staff member
- [ ] Bulk CSV import
- [ ] Staff directory in admin dashboard

### Week 6-7: Branding & Portal
- [ ] `applyGlobalTheme()` reads from `schools/{id}/settings/theme`
- [ ] School logo, favicon, primary/secondary/accent colors
- [ ] Principal message on public landing
- [ ] Multi-tenant portal: `snredu-erp.web.app/{subdomain}`
- [ ] URL resolution: subdomain → schoolId via `resolveSchoolSlug()`
- [ ] Public website renders per-school branding

### Week 7-8: CMS (Notices, Events, Gallery, Testimonials, Inquiries)
- [ ] `schools/{id}/notices/{noticeId}` CRUD (title, body, attachment, publish date)
- [ ] `schools/{id}/events/{eventId}` CRUD (date, description, venue)
- [ ] `schools/{id}/gallery/{photoId}` CRUD (Base64 ImageStorage)
- [ ] `schools/{id}/testimonials/{tId}` CRUD (author, content, rating)
- [ ] `schools/{id}/inquiries/{inqId}` public form + admin dashboard
- [ ] CMS-driven public pages (school.html, about.html, etc.)

---

## Modules Involved

| Module | Scope |
|--------|-------|
| School Onboarding | Super-admin flow, schoolId generation, plan assignment |
| Auth & Members | Firebase Auth, custom claims, invite, CSV import |
| Classes | CRUD, bulk create, teacher assignment, promotion |
| Subjects | CRUD, pre-populated library, stage mapping |
| Academic Sessions | CRUD, term management, session switch |
| Students | CRUD, CSV import, photos, family, RTE, Aadhaar, TC |
| Staff | CRUD, designation, department, assignment |
| Branding | Theme engine, logo, colors, multi-tenant portal |
| CMS | Notices, Events, Gallery, Testimonials, Inquiries |

---

## JS Files to Create/Modify

| File | Action |
|------|--------|
| `js/super-admin-pro.js` | Add OnboardSchool flow, schoolId gen |
| `js/firebase-config.js` | Add resolveSchoolSlug(), getSchoolConfig() |
| `js/admin-auth.js` | Auth guards, custom claims, idle timeout |
| `js/student-auth.js` | Phone OTP auth, visitor mode |
| `js/erp-classes.js` | CRUD, bulk create, promotion tool |
| `js/erp-subjects.js` | CRUD, subject library, stage mapping |
| `js/erp-sessions.js` | CRUD, term management, session switch |
| `js/erp-students.js` | CRUD, CSV import, photo upload, TC |
| `js/erp-staff.js` | CRUD, CSV import, assignment |
| `js/erp-cms.js` | Notices, Events, Gallery, Testimonials, Inquiries CRUD |
| `js/erp-admission.js` | Admission form, consent tracking |
| `js/image-storage.js` | Base64 upload, compression, validation |
| `js/saas-policy.js` | Stage-to-plan mapping, feature gating |
| `portal/admin-dashboard.html` | Add all sections for Phase 1 modules |
| `portal/student-dashboard.html` | Student profile, PII redaction |

---

## Firestore Collections

| Collection | Document | Key Fields |
|------------|----------|------------|
| `schools/{schoolId}` | SchoolMetadata | name, board, subdomain, plan, status |
| `schools/{schoolId}/org` | SchoolOrg | address, contact, affiliation, branding, timings |
| `schools/{schoolId}/members/{uid}` | SchoolMember | role, staffId, studentId, parentOf, classIds |
| `schools/{schoolId}/classes/{classId}` | SchoolClass | name, stage, section, classTeacherId, studentIds |
| `schools/{schoolId}/subjects/{subjectId}` | Subject | name, code, type, applicableStages |
| `schools/{schoolId}/sessions/{sessionId}` | AcademicSession | name, terms, startDate, endDate, isCurrent |
| `schools/{schoolId}/students/{studentId}` | Student | name, DOB, classId, aadhaarNo, photoUrl, RTE |
| `schools/{schoolId}/staff/{staffId}` | Staff | name, designation, department, subjectIds |
| `schools/{schoolId}/notices/{noticeId}` | Notice | title, body, attachment, publishDate |
| `schools/{schoolId}/events/{eventId}` | Event | title, date, venue, description |
| `schools/{schoolId}/gallery/{photoId}` | GalleryPhoto | caption, imageUrl (Base64), uploadDate |
| `schools/{schoolId}/testimonials/{tId}` | Testimonial | author, content, rating, date |
| `schools/{schoolId}/inquiries/{inqId}` | Inquiry | name, email, phone, message, read |
| `schools/{schoolId}/settings/theme` | ThemeSettings | logoUrl, primaryColor, secondaryColor, accentColor |
| `users/{uid}` | User | email, phone, displayName, schoolId, role, status |

---

## Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| Firebase Auth | 9.23.0 | Email/password + phone OTP |
| Firestore | 9.23.0 | All data storage |
| Papa Parse | 5.x | CSV parsing for bulk import |
| ImageStorage | internal | Base64 photo handling |
| jsPDF | 2.x | TC PDF generation |
| Firebase Functions | — | Invite email, auth triggers |

---

## Estimated Effort (Dev-Days)

| Week | Module | Dev-Days | Dependencies |
|------|--------|----------|--------------|
| 1 | School Onboarding | 5 | Phase 0 |
| 2 | Auth & Members | 5 | Week 1 |
| 3 | Classes & Sections | 3 | Week 2 |
| 3 | Subjects | 2 | Week 2 |
| 4 | Academic Sessions | 2 | Week 3 |
| 4-5 | Students | 8 | Weeks 3-4 |
| 5-6 | Staff | 5 | Weeks 4-5 |
| 6-7 | Branding & Portal | 5 | Weeks 5-6 |
| 7-8 | CMS | 5 | Weeks 6-7 |
| **Total** | | **~40** | |

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Custom claims size limit (1,000 bytes) | Medium | High | Keep minimal claims; store bulk data in members doc |
| CSV import with bad data corrupts records | Medium | High | Validate every row; preview before commit |
| Multi-tenant branding leaks between schools | Low | Critical | Test resolveSchoolSlug() with multiple schools |
| PII redaction missed on some fields | Medium | High | Audit all student fields; field-level firestore rules |

---

## Success Criteria / Exit Gate

- [ ] A new school admin can log in, see only their school's data
- [ ] Admin can manage students (CRUD + bulk CSV import)
- [ ] Admin can post a notice, upload a gallery photo, accept an inquiry
- [ ] Admin can configure branding (logo, colors) — no engineering help needed
- [ ] Students can log in via phone OTP and view own profile
- [ ] Teacher can view assigned classes and student roster
- [ ] 2 schools onboarded and live on platform
- [ ] 500+ students imported via CSV
- [ ] 30+ staff accounts active
- [ ] All 9 CMS modules (notices, events, gallery, testimonials, inquiries, branding) live
