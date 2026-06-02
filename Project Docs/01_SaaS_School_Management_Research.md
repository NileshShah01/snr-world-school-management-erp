# SaaS School Management Software — Research Report

> **Project:** SNR WORLD School ERP (`apex-public-school-portal` / `snredu-erp`)
> **Audience:** Engineers, architects, technical product owners
> **Date:** June 2026
> **Author:** SNR WORLD engineering research
> **Related:** `02_Firestore_Schema_v3.md`, `03_Implementation_Roadmap.md`

---

## 1. Executive Summary

A SaaS-grade School Management System (SMS) / School ERP is a multi-tenant cloud platform that runs the **full administrative and academic lifecycle of one or more schools** from a single codebase. In 2026 the market segments into three tiers: **enterprise K-12 platforms** (PowerSchool, Infinite Campus), **mid-market all-in-one suites** (Classe365, OpenEduCat, GegoK12, Schoolyn), and **regional / India-focused ERPs** (Campus 24x7, Fedena, Vidyanova).

For SNR WORLD, the engineering target is a **multi-tenant Firebase/Firestore SaaS** that can onboard a school in under 5 minutes, run its full day-to-day operations, and report on academic, financial, and operational health in real time. The current codebase already has the bones: 14 collections, multi-school routing, Base64 file storage, and Firestore security rules — but it covers roughly **30% of a full SaaS surface area**.

**Top-line recommendations:**

1. **Path-boundary tenancy** — anchor every read/write to `schools/{schoolId}/...` for cheap, provable isolation.
2. **Denormalize for screens, not for ERDs** — every screen should load in ≤ 2 reads.
3. **Move from collection-sprawl to a 3-tier schema** — `/schools/{id}/...` for tenant data, top-level for cross-tenant admin, sub-collections for volatile data.
4. **Phased delivery** — Phase 1 (Core SIS), Phase 2 (Academic), Phase 3 (Finance + Comms + Integrations).
5. **Compliance as a feature, not an afterthought** — UDISE+ exports, NEP 2020 reporting, CBSE/ICSE report-card templates baked into schema from day one.

---

## 2. Methodology

This report synthesizes:

- **8 public buyer guides and module lists** published in 2026 (OpenEduCat, Campus 24x7, GegoK12, AppAcademia, Classe365, Schoolyn, Vidyanova, ROAR Documentation).
- **Direct inspection of the current SNR WORLD Firestore project** — 14 top-level collections enumerated, sample documents read with the Admin SDK.
- **Multi-tenant Firestore design literature** (wild.codes, Medium integration case-studies, Google Cloud Firestore docs).
- **Codebase review** of `firebase.json`, `firestore.rules`, `js/firebase-config.js`, `scripts/provision-multi-school.js`, `README.md`, `IMAGE_STORAGE.md`.

Scoring criteria used throughout:

| Criterion | Weight | Rationale |
|---|---|---|
| Core SIS coverage (students, classes, attendance) | 25% | Backbone of every school |
| Multi-tenant architecture quality | 20% | Direct cost & isolation impact on Firestore |
| Financial / fee module maturity | 15% | Highest daily-friction in Indian schools |
| Communication (WhatsApp, SMS, push) | 10% | Adoption driver for parents |
| Compliance (UDISE+, NEP, board reports) | 10% | India-specific, non-negotiable |
| Reporting & analytics | 10% | Decision-support for principals |
| Extensibility (APIs, integrations) | 10% | Long-term survival |

---

## 3. Market Survey — 9 Vendors Profiled

### 3.1 PowerSchool (USA, enterprise K-12)
- **Scale:** 45M+ students, ~80% of North American K-12 districts.
- **Strengths:** Proven at massive scale; deep state-reporting; mature SIS + LMS + enrollment + assessment.
- **Weaknesses:** Enterprise pricing (out of reach for India private schools); US-centric compliance; heavy implementation cycles.
- **Lesson for SNR:** Their `students → enrollments → terms → sections → grades` lineage is the right model — adopt the same lineage.

### 3.2 Infinite Campus (USA, public districts)
- **Strengths:** Best-in-class state compliance, parent portal.
- **Weaknesses:** UI dated; rigid data model; not multi-tenant SaaS in the modern sense (per-district installs).
- **Lesson for SNR:** Compliance-driven schemas win long-term — we need UDISE+ fields in the student doc from day one.

### 3.3 Classe365 (India + global mid-market)
- **Strengths:** Unified SIS + LMS + CRM + Finance; multi-campus; built-in payment gateway & accounting; open API.
- **Weaknesses:** API documentation is decent but not world-class; UI increasingly complex at scale.
- **Lesson for SNR:** This is the closest comparable business model to SNR WORLD — multi-tenant SaaS for schools of all sizes. Their **unified platform** stance (no add-on silos) is the right positioning.

### 3.4 OpenEduCat (open-source, Odoo-based)
- **Strengths:** Free core, 20+ modules, full source access, integrated LMS + SIS + Finance; enterprise tier.
- **Weaknesses:** Odoo inheritance is heavy; customization requires Python expertise; mobile experience weak.
- **Lesson for SNR:** Their **module catalog** (Faculty, Student, Admission, Examination, Fee, Library, Transport, HR, Payroll, etc.) is the canonical "what a full SMS looks like" reference. Use it as the module checklist.

### 3.5 GegoK12 (open-source, 23+ modules)
- **Strengths:** Free core (Settings, Holiday, Leave, Staff, Class, Subject, Student, Attendance, Homework, Communication, Lesson, ID Card, Dashboard, Library, Account, Event, Notice, Media, Discipline, Telephone, Class Wall, Promotion, Admission, Activity Log, Reception); paid add-ons (Exam, Fee, Alumni, Video, Transport, Quiz, Inventory, Chat, Certificate).
- **Weaknesses:** Community support only on core; UI feels like 2018.
- **Lesson for SNR:** Their **core vs add-on split** is a great commercial pattern — ship the daily-essential modules for free, monetize specialty modules. For SNR WORLD's first year, ship the **core 15 modules** as the SaaS baseline.

### 3.6 Schoolyn (AI-forward SaaS, mid-market)
- **Strengths:** AI-native: AI tutor (24/7 multilingual), AI assessment generation, AI report-card comments, predictive drop-out/fee-default analytics, personalized learning paths; FERPA + GDPR + COPPA + EU AI Act compliant; native iOS/Android/Huawei apps.
- **Weaknesses:** Newer entrant; pricing premium; AI features need data volume to be useful.
- **Lesson for SNR:** AI is now table-stakes for the next generation — plan for an AI add-on layer (Phase 4) once the data model is stable. Compliance posture is also the right baseline.

### 3.7 Fedena (Ruby on Rails, open-source + paid)
- **Strengths:** Long history; broad module coverage; community edition free.
- **Weaknesses:** Monolith; modernization is slow; not Firestore-native.
- **Lesson for SNR:** Open-source is a viable go-to-market but the operational burden of running Rails + Postgres clusters is real. Firestore-native gives us a different cost profile (pay-per-use) and lower ops.

### 3.8 Vidyanova (India K-12, principles-focused)
- **Strengths:** Practical checklist of 12+ modules tuned for Indian schools; explicit focus on implementation pitfalls, demo tasks, vendor scoring, pilots.
- **Weaknesses:** More of a methodology than a product; their product depth is average.
- **Lesson for SNR:** Their **practical checklist** (parent fee payment under 60s, one-tap attendance, board report-card auto-generation, WhatsApp delivery + read status) is exactly the kind of micro-benchmark that makes parents and principals love (or hate) a product.

### 3.9 Campus 24x7 (India 2026, mobile-first)
- **Strengths:** UPI-native fee collection, WhatsApp Business API, CBSE/ICSE/DISE+/NEP 2020 compliance built in, mobile-first design.
- **Weaknesses:** Less mature outside India; limited LMS depth.
- **Lesson for SNR:** **UPI is non-negotiable** for India — fees module must integrate UPI deep-links, auto-receipts, late-fee rules, and defaulter dashboards. WhatsApp Business API with read-receipts is a feature, not a nice-to-have.

### 3.10 Summary table

| Vendor | Tenancy | SIS | Fees | Comms | Compliance | AI | Best for |
|---|---|---|---|---|---|---|---|
| PowerSchool | Single-district | ★★★★★ | ★★★ | ★★★ | US state | ★ | US public |
| Infinite Campus | Per-district | ★★★★★ | ★★★ | ★★★ | US state | ★ | US compliance |
| Classe365 | Multi-tenant | ★★★★ | ★★★★ | ★★★★ | Global | ★★ | Mid-market SaaS |
| OpenEduCat | Self-host | ★★★★ | ★★★★ | ★★★ | Configurable | ★ | Tech-savvy schools |
| GegoK12 | Self-host | ★★★★ | ★★★ (paid) | ★★★ | Light | ★ | Open-source seekers |
| Schoolyn | Multi-tenant | ★★★★ | ★★★★ | ★★★★ | EU/US | ★★★★★ | AI-first adopters |
| Fedena | Self-host/SaaS | ★★★ | ★★★ | ★★ | Light | ★ | Budget buyers |
| Vidyanova | SaaS | ★★★ | ★★★ | ★★★ | India | ★ | India K-12 |
| Campus 24x7 | SaaS | ★★★★ | ★★★★★ | ★★★★★ | India | ★★ | India mobile-first |
| **SNR WORLD (target)** | **Multi-tenant Firestore** | **★★★** | **★ (planned)** | **★★** | **India (planned)** | **—** | **India private schools** |

---

## 4. Core Module Matrix (22 modules)

Scored for K-12 India private-school market:

| # | Module | Priority | Indian context | SNR WORLD today |
|---|---|---|---|---|
| 1 | Student Information System (SIS) | **Must** | Core of everything | ✓ partial (students collection) |
| 2 | Attendance (period + daily, parent SMS) | **Must** | One-tap, RFID/QR ready | ✗ |
| 3 | Fee management (UPI, receipts, late-fee) | **Must** | UPI non-negotiable | ✗ |
| 4 | Timetable / substitution | **Must** | Manual = weeks wasted | ✗ |
| 5 | Exam & gradebook (CBSE/ICSE templates) | **Must** | Report cards drive parent satisfaction | Partial (gradingRules, reports) |
| 6 | Parent + student portal | **Must** | Reduces office load 60%+ | Partial (portal/) |
| 7 | Notices & announcements | **Must** | Daily driver | ✓ (notices) |
| 8 | Communication (SMS, email, WhatsApp, push) | **Must** | WhatsApp Business API | ✗ |
| 9 | Admission management (online forms, merit list) | **Must** | Seasonal volume spike | ✗ |
| 10 | Reports & analytics | **Must** | Principal decision-support | Partial (dashboardConfig) |
| 11 | Role-based access (Admin, Teacher, Student, Parent) | **Must** | Security baseline | Partial (users, isAdmin) |
| 12 | Multi-tenant school management | **Must** | SaaS core | ✓ (schools/{id}) |
| 13 | Library management | Should | Mid-size schools only | ✗ |
| 14 | Transport / GPS tracking | Should | Major safety ask | ✗ |
| 15 | HR + payroll (staff) | Should | 20+ staff schools | ✗ |
| 16 | Homework / assignments | Should | Engagement driver | ✗ |
| 17 | Lesson planning | Should | NEP 2020 alignment | ✗ |
| 18 | Events & calendar | Should | Reuse from notices | ✓ (events) |
| 19 | Gallery / media | Should | Marketing | ✓ (gallery) |
| 20 | Testimonials | Should | Marketing | ✓ (testimonials) |
| 21 | Holidays & academic calendar | Should | Compliance | ✗ |
| 22 | Discipline / remarks | Could | Behavior tracking | ✓ (remarks) |

**Coverage today:** 8 of 22 = **36%**. Target for Phase 1+2: **17 of 22 = 77%**.

---

## 5. Feature Comparison — SNR WORLD vs Market

| Module | PowerSchool | Classe365 | GegoK12 | Schoolyn | Campus 24x7 | **SNR WORLD (today)** | **SNR WORLD (target v3)** |
|---|---|---|---|---|---|---|---|
| Multi-tenant SaaS | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Firestore-native (no SQL) | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Custom domain per school | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ (subdomain) | ✓ + custom domain |
| SIS | ✓ | ✓ | ✓ | ✓ | ✓ | Partial | Full |
| Attendance | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | Full |
| Fees + UPI | ✓ | ✓ | Paid add-on | ✓ | ✓ | ✗ | Full |
| Exam + CBSE/ICSE | ✓ | ✓ | Paid add-on | ✓ | ✓ | Partial | Full |
| WhatsApp Business | Partial | ✓ | ✗ | ✓ | ✓ | ✗ | Full |
| LMS / video | ✓ | ✓ | Paid add-on | ✓ | Partial | ✗ | Optional add-on |
| AI tutor / assessment | Partial | ✗ | ✗ | ✓ | ✗ | ✗ | Phase 4 |
| Library | ✓ | ✓ | ✓ | ✓ | Partial | ✗ | Phase 3 |
| Transport GPS | ✓ | ✓ | Paid add-on | ✓ | Partial | ✗ | Phase 3 |
| HR + payroll | ✓ | ✓ | ✓ | ✓ | Partial | ✗ | Phase 3 |
| UDISE+ export | ✗ | ✓ | ✗ | ✗ | ✓ | ✗ | Phase 2 |
| NEP 2020 report | ✗ | Partial | ✗ | Partial | ✓ | ✗ | Phase 2 |
| Free / open-source | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ | Freemium model |

---

## 6. Multi-Tenant Firestore Architecture — Best Practices

The architecture decisions below are the **highest-leverage** technical choices in the project. Get them right once, save months of refactoring.

### 6.1 Path-boundary tenancy (root it)

```
schools/{schoolId}/
    ├── org (doc: metadata, branding, limits)
    ├── members/{uid}        (role + custom claims mirror)
    ├── students/{studentId}
    ├── staff/{staffId}
    ├── classes/{classId}
    ├── subjects/{subjectId}
    ├── sessions/{sessionId}/exams/{examId}
    ├── attendance/{date}
    ├── marks/{examId}
    ├── fees/{invoiceId}
    ├── timetable/{slotId}
    ├── notices/{noticeId}
    ├── events/{eventId}
    ├── gallery/{photoId}
    ├── library/{bookId}
    ├── transport/{routeId}
    ├── payroll/{monthId}
    ├── reports/{reportId}
    ├── logs/{logId}
    └── settings/{configKey}   (theme, branding, fee-structure)
```

**Why:** Rules evaluate top-down per path. With `schools/{schoolId}/...`, every read/write passes one predictable tenant check. The "global" collections stay for platform admins only.

### 6.2 Three-tier model

| Tier | Path | Audience | Example |
|---|---|---|---|
| Tenant root | `schools/{schoolId}/...` | School users (teachers, students, parents, school admin) | `schools/SCH001/students` |
| Platform admin | Top-level (gated) | SNR WORLD super-admin | `users`, `schools` (metadata only), `logs_super`, `settings_super` |
| Volatile append-only | Sub-collections | High-write events | `schools/{id}/attendance/{date}`, `schools/{id}/marks/{examId}/entries/{entryId}` |

### 6.3 Denormalization for screens, not ERDs

Every UI screen should load in **≤ 2 reads**. Denormalize:

- `student.name`, `student.className`, `student.rollNo` into `marks` documents (so report cards don't need a join).
- `staff.name`, `staff.subject` into `timetable` slots.
- `school.name`, `school.logo` into every parent-facing response (cached in sessionStorage).

**Tradeoff:** controlled duplication, kept consistent by Cloud Functions triggers or client fan-out on write.

### 6.4 IDs and ordering

- Default to **random IDs** for even write distribution.
- For time-ordered lists, add a **sortable `createdAt` timestamp** and a composite index `(schoolId, createdAt desc)`.
- For high-contention counters (roll numbers, invoice numbers), use a **sharded counter** under `schools/{id}/counters/{shard}`.

### 6.5 Indexes — only what you query

Don't ship 50 composite indexes. Build indexes from **actual screen queries**:

- `students` list filtered by class & ordered by name → `(schoolId, classId, name asc)`
- `attendance` by student & date range → `(schoolId, studentId, date desc)`
- `fees` defaulter dashboard → `(schoolId, status, dueDate asc)`

A precomputed `statusPriority` synthetic field (e.g., `unpaid_overdue`) collapses multi-filter screens into single-field indexes.

### 6.6 Security Rules — one sentence

Rules should read as a single sentence: *"Authenticated? Member of `{schoolId}`? Authorized for this resource?"*

```js
match /schools/{schoolId}/{document=**} {
  allow read, write: if isAuth()
    && request.auth.token.schoolId == schoolId
    && hasRole(getRoleForPath(request.path));
}
```

Keep role data **close to the path** (in `schools/{id}/members/{uid}`) or as **custom auth claims**. Never traverse collections inside a rule.

### 6.7 Cost control

- **Pagination by default** on every list view (`limit(25)` + cursor).
- **Client-side caching** for read-only screens (notices, gallery, events).
- **Batch writes** for bulk operations (bulk attendance, bulk marks import).
- **BigQuery export** for analytics — don't run cross-tenant aggregates in Firestore.
- **Append-only event logs** — never update an event doc, write a new one.

### 6.8 Hot-tenant sharding

For a school with 5,000+ students, `attendance/{date}` becomes a single document with thousands of nested fields. **Don't do that.** Instead:

```
schools/{schoolId}/attendance/{date}/entries/{studentId}
```

One document per student per day. Writes are independent, no contention. Queries use `collectionGroup('entries')` with `where studentId == X`.

---

## 7. Compliance & Standards

| Standard | Applies to | Implementation in SNR WORLD |
|---|---|---|
| **UDISE+** | All India schools (govt reporting) | `students.udisePlusId`, `staff.udisePlusId`, bulk export job to CSV with the 2025+ field schema |
| **NEP 2020** | Curriculum & assessment | Multi-grade `competencies` on report cards, `continuousAssessment` marks type, 360° holistic progress card |
| **CBSE report cards** | CBSE schools | Template engine: `reportCards/templates/cbse-2025.json` with dynamic field mapping |
| **ICSE report cards** | ICSE schools | Same engine, different template |
| **State board** | Bihar, UP, etc. | Template per state, with year-specific schema (e.g., Bihar 2024-25 has new grade scale) |
| **GDPR / FERPA** | If you ever go international | Data export endpoint, right-to-delete, audit log |
| **DPDP Act 2023** | India data protection | Same as GDPR; explicit consent for parent data; data fiduciary designation |
| **RTE 25% quota** | Private schools in India | Separate `rteApplications` collection, merit-list generator, government reporting |

---

## 8. Gap Analysis — Current 14 Collections vs SaaS Standard

| Current collection | Maps to SaaS module | Status | Action |
|---|---|---|---|
| `admitcards` | Exam | Partial | Move under `schools/{id}/exams/{examId}/admitCards` |
| `events` | Calendar | Partial | Move under `schools/{id}/events` |
| `gallery` | CMS | Partial | Move under `schools/{id}/gallery` |
| `gradingRules` | Exam config | Partial | Move under `schools/{id}/settings/grading` |
| `inquiries` | Admission | Partial | Move under `schools/{id}/inquiries` |
| `logs_super` | Super-admin audit | OK | Keep top-level (platform admin) |
| `notices` | Communication | Partial | Move under `schools/{id}/notices` |
| `reports` | Exam result | Partial | Move under `schools/{id}/reports` |
| `schools` | Tenant metadata | OK | Keep top-level (platform) |
| `settings` | School config | OK | Move under `schools/{id}/settings` |
| `settings_super` | Platform config | OK | Keep top-level |
| `students` | SIS | Partial | Move under `schools/{id}/students` |
| `testimonials` | CMS | Partial | Move under `schools/{id}/testimonials` |
| `users` | Auth | OK | Keep top-level (cross-tenant user lookup) |

**Missing collections (priority order):**
1. `staff` (HR, payroll)
2. `classes` & `sections`
3. `subjects`
4. `sessions` (academic year + term)
5. `attendance` (daily + period-wise)
6. `marks` (per exam)
7. `fees` (invoices, payments, receipts)
8. `timetable` (slots, substitutions)
9. `library` (books, issues, returns)
10. `transport` (routes, vehicles, GPS)
11. `homework` / `assignments`
12. `lessons` (lesson plans, NEP 2020)
13. `payroll` (staff salary slips)
14. `holidays` (academic calendar)
15. `discipline` / `remarks` (already have remarks — move under school)
16. `inquiries` (already exists — move under school)
17. `admissionApplications` (RTE + general)
18. `messages` (in-app communication log)
19. `auditLogs` (per-school activity log)

**Migration strategy:**
- v2 (current): top-level collections, `_migration_v2` flag visible on docs.
- v3 (target): nested under `schools/{id}/...` with **dual-write** during transition (write both, read from new), then **backfill** via Cloud Function, then **deprecate v2**.

---

## 9. Proposed Target Schema v3

See **`02_Firestore_Schema_v3.md`** for the full collection tree, Mermaid diagram, field-level TypeScript interfaces, and composite index recommendations.

Top-level shape:

```
/                              (platform root)
├── schools/{schoolId}         (tenant root — all school data lives here)
│   ├── org                    (doc: metadata, branding, plan, limits)
│   ├── members/{uid}          (doc: role mirror of custom claims)
│   ├── students/{studentId}   (sub: attendance, marks, fees)
│   ├── staff/{staffId}        (sub: payroll, leaves)
│   ├── classes/{classId}
│   ├── subjects/{subjectId}
│   ├── sessions/{sessionId}
│   │   └── exams/{examId}
│   │       └── marks/{studentId}
│   ├── attendance/{date}
│   │   └── entries/{studentId}
│   ├── fees/{invoiceId}
│   ├── timetable/{slotId}
│   ├── library/{bookId}
│   ├── transport/{routeId}
│   ├── homework/{hwId}
│   ├── lessons/{lessonId}
│   ├── holidays/{holidayId}
│   ├── discipline/{incidentId}
│   ├── notices/{noticeId}
│   ├── events/{eventId}
│   ├── gallery/{photoId}
│   ├── testimonials/{tId}
│   ├── inquiries/{inqId}
│   ├── admissionApplications/{appId}
│   ├── messages/{threadId}
│   │   └── chats/{msgId}
│   ├── payroll/{monthId}
│   ├── auditLogs/{logId}
│   └── settings/{configKey}
├── users/{uid}                (auth + cross-tenant lookup)
├── schools (collection)        (metadata only — platform admin)
├── logs_super/{logId}         (super-admin audit)
└── settings_super/{key}       (platform config, billing plans)
```

---

## 10. Security Rules Strategy

### 10.1 Custom claims for fast tenant check

On user creation, set custom claims:

```js
{
  schoolId: 'SCH001',
  role: 'teacher' | 'student' | 'parent' | 'schoolAdmin' | 'superAdmin',
  classIds: ['CLS001', 'CLS002']  // for teachers
}
```

### 10.2 Rule template

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuth() { return request.auth != null; }
    function isSuperAdmin() { return isAuth() && request.auth.token.role == 'superAdmin'; }
    function isSchoolMember(schoolId) {
      return isAuth() && request.auth.token.schoolId == schoolId;
    }
    function hasRole(...roles) {
      return isAuth() && request.auth.token.role in roles;
    }

    // Tenant root
    match /schools/{schoolId}/{document=**} {
      allow read: if isSchoolMember(schoolId) || isSuperAdmin();
      allow write: if (isSchoolMember(schoolId) && hasRole('schoolAdmin', 'teacher'))
                   || isSuperAdmin();
    }

    // Platform admin only
    match /logs_super/{logId} { allow read, write: if isSuperAdmin(); }
    match /settings_super/{key} { allow read, write: if isSuperAdmin(); }
    match /schools/{schoolId} { allow read, write: if isSuperAdmin(); }

    // User self-service
    match /users/{uid} {
      allow read, write: if isAuth() && (request.auth.uid == uid || isSuperAdmin());
    }
  }
}
```

### 10.3 Hardening checklist

- [ ] No `allow read, write: if true` anywhere (current rules have several — refactor)
- [ ] All writes validate `schoolId` immutability on update
- [ ] Field-level rules for sensitive data (Aadhaar, medical info, marks)
- [ ] Rate-limiting via App Check
- [ ] Audit log on every privileged write (schoolAdmin, superAdmin)

---

## 11. Implementation Roadmap

See **`03_Implementation_Roadmap.md`** for the detailed phased plan with module-level estimates.

**Headline:**

| Phase | Duration | Modules | Outcome |
|---|---|---|---|
| Phase 1 — Core SIS | 6-8 weeks | Students, Classes, Subjects, Sessions, Staff, Auth, Multi-tenant hardening | Onboard a second school in < 1 day |
| Phase 2 — Academic | 6-8 weeks | Attendance, Marks, Timetable, Report cards (CBSE/ICSE), Homework | Day-to-day academic operations live |
| Phase 3 — Finance + Comms | 8-10 weeks | Fees (UPI), WhatsApp Business API, SMS, Email, In-app messages, Library, Transport, HR, Payroll | Full SaaS feature parity with mid-market |
| Phase 4 — Intelligence | 4-6 weeks | AI tutor (optional), Predictive analytics, Personalized learning, Adaptive testing | Differentiation vs Classe365 / Schoolyn |

---

## 12. References

1. OpenEduCat — *School Management Software Buyer's Guide 2026*: https://openeducat.org/articles/school-management-software-buyers-guide/
2. Campus 24x7 — *15 Must-Have Features in School ERP Software (2026)*: https://campus24x7.in/blogs/top-features-school-management-software-india-2026
3. GegoK12 — *List of Modules*: https://docs.gegok12.com/documentation/list-of-modules
4. AppAcademia — *School Management Software Checklist 2026*: https://myappacademia.com/blog/how-to-choose-school-management-software-checklist.html
5. Classe365 — *10 Questions to Ask Before Buying a School Management Software (2026)*: https://www.classe365.com/blog/10-questions-to-ask-before-buying-a-school-management-software-expert-buyers-guide/
6. Schoolyn — *Features*: https://schoolyn.ai/features/
7. Vidyanova — *School ERP Features Checklist for Principals & Administrators*: https://vidyanova.com/blog/school-erp-implementation
8. Wild.Codes — *How do you model Firestore multi-tenant data for speed and safety?*: https://wild.codes/candidate-toolkit-question/how-do-you-model-firestore-multi-tenant-data-for-speed-and-safety
9. ROAR Documentation — *Admin Database Schema (Firestore multi-tenant reference)*: https://yeatmanlab.github.io/roar-docs/developer/databases/admin.html
10. Medium / Omar Sharif — *How I Integrated Firestore Into a Multitenant Spring Boot Microservice*: https://medium.com/@osharif/how-i-integrated-firestore-into-a-multitenant-spring-boot-microservice-with-an-unconventional-318040b8bb3f
