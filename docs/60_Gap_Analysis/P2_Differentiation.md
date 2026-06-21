# P2 — Differentiation & Growth

> **Severity:** Medium — Tables-stakes features that competitors already offer.  
> **Count:** 25 gaps  
> **Target resolution:** Within 6 months of launch (v2.0).

---

## AI & Automation (3)

| # | Gap ID | Title | Competitive Impact | Effort (h) | Resolution Steps |
|---|--------|-------|--------------------|------------|------------------|
| 1 | P2-AI-01 | **No AI tutor / chatbot** | High — Byju's, Vedantu, Khan Academy all have AI tutors. Parents expect instant homework help. | 40 | 1. Integrate OpenAI / Gemini API for Q&A. 2. Build chatbot UI in student portal. 3. Subject-specific context. 4. Usage limits per student per day. |
| 2 | P2-AI-02 | **No predictive analytics** | High — Fee default prediction, drop-out risk, at-risk student identification. Competitors: Feemanager, Teachmint. | 30 | 1. Build ML model (or rules engine) for fee default prediction. 2. Dashboard for "At-Risk Students". 3. Auto-flag students with attendance < 75%. |
| 3 | P2-AI-03 | **No auto-grade for objective questions** | Medium — Reduces teacher workload. Manual grading is a friction point. | 16 | 1. Build MCQ test interface. 2. Auto-grade on submit. 3. Analytics: class average, per-question difficulty, time taken. |

---

## Operations & Administration (8)

| # | Gap ID | Title | Competitive Impact | Effort (h) | Resolution Steps |
|---|--------|-------|--------------------|------------|------------------|
| 4 | P2-OPS-01 | **No GPS tracking for transport** | High — Parents demand real-time bus tracking. Safety concern #1 after fees. | 24 | 1. Integrate Google Maps / MapMyIndia API. 2. GPS device integration (IoT or driver app). 3. Parent app shows live bus location, ETA, route. |
| 5 | P2-OPS-02 | **No timetable auto-generator** | High — Manual timetable creation is painful for schools. Competitors: Timetable Generator, Asc Timetables. | 20 | 1. Input: teachers, subjects, classes, periods, constraints. 2. GA / constraint-satisfaction algorithm. 3. Export to PDF/CSV. 4. Publish to student/parent portals. |
| 6 | P2-OPS-03 | **No hostel management module** | Medium — Required for residential schools. Competitors: Hostelio, MyHostel. | 24 | 1. Room allocation (room types, capacity, gender split). 2. Attendance for hostelers. 3. Complaints/maintenance. 4. Mess menu. 5. Leave management. |
| 7 | P2-OPS-04 | **No inventory management** | Medium — Stationery, uniforms, lab equipment tracking. | 16 | 1. Add inventory items, categories, suppliers. 2. Stock in/out tracking. 3. Low-stock alerts. 4. Purchase order generation. |
| 8 | P2-OPS-05 | **No alumni management** | Low-Medium — Network effect for school reputation. | 12 | 1. Alumni directory (batch, profession, location). 2. Event invite system. 3. Donation collection (see payment gateway P0). 4. Success story spotlights. |
| 9 | P2-OPS-06 | **No staff leave management** | Medium — Replaces paper leave applications. | 8 | 1. Leave types (sick, casual, earned, unpaid). 2. Apply/approve/reject flow. 3. Calendar view. 4. Leave balance dashboard. |
| 10 | P2-OPS-07 | **No payslip generation** | Medium — Staff expectation. Competitors: SalaryBox, OkStaff. | 12 | 1. Payroll config (CTC, deductions, allowances). 2. Monthly payslip auto-generation. 3. Email/WhatsApp payslip to staff. 4. TDS/Form 16 export. |
| 11 | P2-OPS-08 | **No event registration / RSVP** | Low-Medium — Sports day, PTM, annual day. | 8 | 1. Event creation (date, venue, capacity). 2. Parent RSVP via portal. 3. QR code check-in on event day. 4. Attendance report. |

---

## Academics & Assessment (5)

| # | Gap ID | Title | Competitive Impact | Effort (h) | Resolution Steps |
|---|--------|-------|--------------------|------------|------------------|
| 12 | P2-ACA-01 | **No customizable report card templates** | High — Every school wants its own report card design. | 20 | 1. Drag-and-drop report card builder. 2. Pre-built templates (NEP, CBSE, ICSE, State Board). 3. Custom fields, grading scales. 4. Preview and save. |
| 13 | P2-ACA-02 | **No marks verification workflow** | Medium — Teachers verify each other's marks before publishing. | 8 | 1. Teacher submits marks → "Pending Verification" status. 2. HOD/Principal reviews and approves/rejects. 3. Audit log of changes. |
| 14 | P2-ACA-03 | **No bulk PDF download for report cards** | Medium — Principal wants to print all report cards at term end. | 6 | 1. Select class/section/term. 2. Generate PDFs server-side (Cloud Function). 3. Zip and email download link. 4. Progress bar for large batches. |
| 15 | P2-ACA-04 | **No question bank** | High — Teachers need a repository of questions. | 16 | 1. Subject/chapter/topic hierarchy. 2. Question types: MCQ, short, long, match, fill-in. 3. Difficulty level, marks. 4. Search + filter. 5. Export for test paper. |
| 16 | P2-ACA-05 | **No student document storage** | Medium — Aadhaar, birth cert, transfer cert, photo management. | 12 | 1. Per-student document upload. 2. Categories (ID proof, academic, medical). 3. Access control (admin, class teacher). 4. Expiry alerts for documents. |

---

## Library (1)

| # | Gap ID | Title | Competitive Impact | Effort (h) | Resolution Steps |
|---|--------|-------|--------------------|------------|------------------|
| 17 | P2-LIB-01 | **No library barcode/scanning** | Low-Medium — Niche; larger schools need it. | 12 | 1. Barcode generation for books. 2. Scanner integration (mobile camera / USB). 3. Issue/return workflow. 4. Late-fee calculation. 5. Book availability search. |

---

## Content & CMS (4)

| # | Gap ID | Title | Competitive Impact | Effort (h) | Resolution Steps |
|---|--------|-------|--------------------|------------|------------------|
| 18 | P2-CMS-01 | **No blog / news module** | Medium — School website needs notices and updates. | 8 | 1. Blog post editor (WYSIWYG). 2. Categories, tags. 3. Publish schedule. 4. Display on homepage. |
| 19 | P2-CMS-02 | **No CMS page editor** | High — Schools want to manage their own site pages. | 16 | 1. Page list CRUD. 2. Block-based editor (text, image, video, gallery, table). 3. Menu management. 4. Publish/draft workflow. |
| 20 | P2-CMS-03 | **No media library** | Medium — Shared image/video repository for CMS. | 8 | 1. Upload to Firebase Storage. 2. Thumbnail generation. 3. Search by name/tag. 4. Usage tracker. |
| 21 | P2-CMS-04 | **No custom report builder** | High — School admin wants custom analytics (fee collection by class, attendance trends, etc.). | 16 | 1. Drag-and-drop report builder. 2. Data sources: fees, attendance, marks, students. 3. Filters, grouping, aggregation. 4. Export PDF/Excel/CSV. |

---

## Platform & UX (3)

| # | Gap ID | Title | Competitive Impact | Effort (h) | Resolution Steps |
|---|--------|-------|--------------------|------------|------------------|
| 22 | P2-PLT-01 | **No offline support (PWA service worker)** | Medium — Schools in low-connectivity areas. Competitors: Teachmint offline mode. | 16 | 1. Service worker with cache-first strategy. 2. Sync queue for writes. 3. Critical data (timetable, contacts) cached. 4. Offline indicator UI. |
| 23 | P2-PLT-02 | **No dark mode** | Low — User preference, growing expectation. | 4 | 1. CSS custom properties for theme. 2. `prefers-color-scheme` media query. 3. Manual toggle + localStorage. 4. Audit all pages for contrast. |
| 24 | P2-PLT-03 | **No keyboard shortcuts** | Low — Power users (data entry operators). | 4 | 1. Common shortcuts: Ctrl+N (new student), Ctrl+S (save), Ctrl+F (search). 2. Cheatsheet modal (? key). 3. Configurable per module. |

---

## Marketing & Growth (1)

| # | Gap ID | Title | Competitive Impact | Effort (h) | Resolution Steps |
|---|--------|-------|--------------------|------------|------------------|
| 25 | P2-MKT-01 | **No referral / affiliate program** | Medium — Word-of-mouth growth channel. | 8 | 1. Referral code per school. 2. Reward structure (discount, free month). 3. Tracking dashboard. 4. Share via WhatsApp/email. |

---

## Summary

| Sub-category | Count | Est. Effort (h) |
|--------------|-------|-----------------|
| AI & Automation | 3 | 86 |
| Operations & Administration | 8 | 124 |
| Academics & Assessment | 5 | 62 |
| Library | 1 | 12 |
| Content & CMS | 4 | 48 |
| Platform & UX | 3 | 24 |
| Marketing & Growth | 1 | 8 |
| **Total** | **25** | **364** |
