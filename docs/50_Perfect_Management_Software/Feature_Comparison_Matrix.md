# Feature Comparison Matrix — SNR vs 10 Competitors

## Scoring Guide

| Score | Meaning |
|-------|---------|
| **0** | Feature absent / not available |
| **1** | Basic — exists but minimal functionality |
| **2** | Partial — functional but lacks depth |
| **3** | Good — covers most standard requirements |
| **4** | Excellent — comprehensive and well-implemented |
| **5** | Best-in-class — benchmark for the industry |

## 22-Module Comparison

| # | Module | Edu Desk | Fedena | Classe 365 | MyClass board | Entab | Teach mint | Neev Learn | School Deck | MyClass Campus | MySmart School | **SNR Current** | **SNR v3 Target** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | SIS | 4 | 4 | 4 | 3 | 5 | 3 | 2 | 3 | 3 | 2 | 4 | **5** |
| 2 | Attendance | 4 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 3 | 3 | 4 | **5** |
| 3 | Fee Management | 3 | 3 | 4 | 3 | 4 | 2 | 2 | 2 | 2 | 1 | 4 | **5** |
| 4 | Timetable | 3 | 4 | 3 | 2 | 4 | 2 | 2 | 2 | 2 | 1 | 3 | **4** |
| 5 | Exam & Gradebook | 4 | 4 | 4 | 3 | 4 | 3 | 2 | 2 | 2 | 2 | 3 | **5** |
| 6 | Parent/Student Portal | 3 | 3 | 4 | 2 | 3 | 3 | 2 | 3 | 3 | 1 | 2 | **4** |
| 7 | Notices & Announcements | 4 | 4 | 3 | 3 | 4 | 3 | 2 | 3 | 3 | 2 | 3 | **5** |
| 8 | Communication (SMS/WA/Email) | 3 | 2 | 3 | 2 | 3 | 3 | 4 | 4 | 2 | 1 | 2 | **5** |
| 9 | Admission Management | 4 | 4 | 3 | 3 | 4 | 3 | 2 | 3 | 3 | 2 | 3 | **4** |
| 10 | Reports & Analytics | 4 | 4 | 4 | 3 | 4 | 2 | 2 | 2 | 2 | 1 | 3 | **4** |
| 11 | RBAC | 3 | 3 | 3 | 2 | 4 | 2 | 2 | 2 | 2 | 1 | 4 | **5** |
| 12 | Multi-Tenant | 2 | 1 | 2 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 5 | **5** |
| 13 | AI Assistant | 1 | 1 | 1 | 0 | 1 | 2 | 4 | 0 | 0 | 0 | 1 | **4** |
| 14 | Library | 3 | 3 | 3 | 2 | 4 | 1 | 0 | 0 | 2 | 0 | 2 | **3** |
| 15 | Transport | 3 | 2 | 3 | 2 | 3 | 1 | 0 | 0 | 2 | 0 | 1 | **3** |
| 16 | HR / Payroll | 3 | 2 | 3 | 1 | 3 | 0 | 0 | 0 | 0 | 0 | 1 | **1** |
| 17 | Homework | 2 | 2 | 3 | 1 | 2 | 3 | 1 | 1 | 1 | 0 | 1 | **4** |
| 18 | Lesson Planning (NEP) | 2 | 1 | 2 | 0 | 2 | 2 | 1 | 0 | 0 | 0 | 0 | **4** |
| 19 | Events & Calendar | 3 | 3 | 3 | 2 | 3 | 2 | 1 | 2 | 2 | 1 | 3 | **4** |
| 20 | Gallery / Media | 1 | 0 | 1 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 2 | **5** |
| 21 | Testimonials | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | **4** |
| 22 | Discipline | 1 | 1 | 1 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 1 | **3** |
| | **TOTAL (out of 110)** | **61** | **55** | **61** | **38** | **67** | **44** | **35** | **33** | **33** | **19** | **57** | **93** |

## Key Takeaways

### Where SNR Already Leads (Current)
| Module | SNR Score | Best Competitor | SNR Advantage |
|---|---|---|---|
| Multi-Tenant | **5** | Edu Desk (2) | **+3** — Structural advantage, Firestore-native |
| Testimonials | **2** | All competitors (0) | **+2** — Only platform with this module |
| RBAC | **4** | Entab (4) | Tie — Well-implemented role system |
| Fee Management | **4** | Classe365 (4), Entab (4) | Tie — FIFO atomic engine is differentiator |

### Where SNR Must Improve (v3 Targets)
| Module | Current | Target | Urgency | Key Action |
|---|---|---|---|---|
| Communication | **2** | **5** | ⚠️ Critical | Add WhatsApp API, SMS gateway, automation triggers |
| AI Assistant | **1** | **4** | ⚠️ Critical | Fix question formatter, add report comments, defaulter prediction |
| Gallery / Media | **2** | **5** | 🔶 High | Photo albums, event galleries, public website display |
| Homework | **1** | **4** | 🔶 High | Student submission, teacher grading, parent notifications |
| Lesson Planning (NEP) | **0** | **4** | 🔶 High | NEP 2020 competency mapping, syllabus tracking |
| Attendance (mobile) | **4** | **5** | 🔶 Medium | PWA for one-tap marking, biometric optional |
| Exam & Gradebook | **3** | **5** | 🔶 Medium | AI validation, bulk report cards, WhatsApp delivery |
| ID Cards | — | — | ✅ Already strong | 13+ templates, barcode, photo — maintain leadership |

### Competitor Landscape Analysis

| Competitor | Total Score | Position | Threat Level | SNR Strategy |
|---|---|---|---|---|
| **Entab** | 67 | Premium leader | 🔴 HIGH | Beat on multi-tenant, AI, CMS, pricing flexibility |
| **Education Desk** | 61 | Strong full-ERP | 🔴 HIGH | Beat on multi-tenant, AI, lower TCO |
| **Classe365** | 61 | Intl + India | 🟡 MEDIUM | Beat on India-specific compliance, CMS, ID cards |
| **SNR Current** | 57 | Mid-tier | — | Baseline to improve |
| **Fedena** | 55 | Established OSS | 🟡 MEDIUM | Beat on SaaS, multi-tenant, modern UI, AI |
| **Teachmint** | 44 | LMS-first | 🟡 MEDIUM | Beat on ERP depth, CMS, ID cards (partner, don't compete on LMS) |
| **MyClassboard** | 38 | Mid-tier | 🟢 LOW | Feature superiority in every module |
| **NeevLearn** | 35 | AI budget | 🟡 MEDIUM | Beat on feature depth, CMS, ID cards (match AI urgently) |
| **SchoolDeck** | 33 | Affordable modern | 🟡 MEDIUM | Beat on depth, CMS, ID cards (match WhatsApp urgently) |
| **MyClassCampus** | 33 | Mid-tier | 🟢 LOW | Out-feature across all modules |
| **MySmartSchool** | 19 | Budget basic | 🟢 LOW | Overwhelming feature superiority |

## Module-Specific Deep Dives

### SIS (Current: 4 → Target: 5)
SNR's SIS is already strong with custom fields, document upload, and bulk import. To reach 5:
- Add automated TC (Transfer Certificate) generation
- Improve alumni tracking module
- Add family dashboard with sibling grouping UI
- Implement student progression (auto-promote at year-end)

### Attendance (Current: 4 → Target: 5)
SNR attendance is web-based and functional. To reach 5:
- Build a PWA for mobile attendance marking
- Add "Mark All Present" with exception-only marking
- Integrate WhatsApp notification for absent students
- Optional biometric/RFID integration

### Fee Management (Current: 4 → Target: 5)
SNR already has the best fee engine among competitors (FIFO, atomic, fine engine). To reach 5:
- Add UPI / credit card payment gateway integration
- Add auto-invoicing on scheduled dates
- Add defaulter prediction (AI/rule-based)
- Add accounting export (Tally-compatible, GST-ready)

### Timetable (Current: 3 → Target: 4)
Basic timetable exists. To reach 4:
- Add drag-and-drop visual builder
- Add conflict detection
- Add period-wise attendance integration
- Add room/lab booking

### Exam & Gradebook (Current: 3 → Target: 5)
Functional but manual. To reach 5:
- AI validation of marks entry (outlier detection)
- Bulk PDF report card generation via Cloud Functions
- WhatsApp delivery of results
- NEP 2020 holistic progress card format
- Online exam support (MCQ, timed, auto-graded)

### Parent/Student Portal (Current: 2 → Target: 4)
Weak authentication (phone+name), limited features. To reach 4:
- Proper auth (OTP-based login)
- Multi-child dashboard
- Fee payment in portal
- Document download (report cards, ID cards)
- Mobile-responsive PWA

### Notices & Announcements (Current: 3 → Target: 5)
Functional but basic delivery. To reach 5:
- Multi-channel delivery (WhatsApp primary, SMS fallback, email, in-app)
- Read receipt tracking
- Targeted by class/section/individual
- Schedule publish and expiry

### Communication (Current: 2 → Target: 5)
This is SNR's biggest gap. To reach 5:
- WhatsApp Business API integration
- SMS gateway (Twilio/MSG91)
- Automated triggers for attendance, fees, exams, notices
- Template management for WhatsApp
- Two-way messaging (parent reply)
- Delivery and read receipt tracking

### Admission Management (Current: 3 → Target: 4)
Functional but needs polish. To reach 4:
- Online form builder with custom fields
- Public inquiry form on website
- Inquiry-to-admission pipeline dashboard
- Entrance test management

### Reports & Analytics (Current: 3 → Target: 4)
Basic reports exist. To reach 4:
- Consolidated principal dashboard
- Custom report builder
- UDISE+ export (1-click)
- Scheduled email reports

### RBAC (Current: 4 → Target: 5)
Strong implementation. To reach 5:
- Add role cloning
- Field-level permissions (not just module-level)
- Two-factor authentication for admin roles

### Multi-Tenant (Current: 5 → Target: 5)
Already best-in-class. Maintain with:
- Per-school usage dashboard
- Refined security rules
- Usage-based billing implementation

### AI Assistant (Current: 1 → Target: 4)
Critical gap. To reach 4:
- Fix question formatter immediately
- AI report card comments (Gemini API)
- Fee defaulter prediction (rule-based MVP)
- At-risk student detection (attendance + marks trends)

### Library (Current: 2 → Target: 3)
Basic. Reach target with:
- Barcode/QR scanning for issue/return
- Fine calculation auto-reminders
- Student online catalogue

### Transport (Current: 1 → Target: 3)
Very basic. Reach target with:
- Route and stop management
- Student assignment to routes
- GPS tracking integration

### HR / Payroll (Current: 1 → Target: 1)
SNR does NOT aim to compete on HR/Payroll. Maintain basic staff management. Schools needing payroll will use specialised tools.

### Homework (Current: 1 → Target: 4)
Significant upgrade needed:
- Teacher creates homework with description and attachments
- Student submits online (file upload, text)
- Teacher grades and returns
- Parent receives notification

### Lesson Planning NEP (Current: 0 → Target: 4)
Build from scratch:
- NEP 2020 competency framework
- Syllabus mapping to lessons
- Progress tracking (% covered)
- Integration with timetable

### Events & Calendar (Current: 3 → Target: 4)
Functional. Add:
- Event creation with invitation/RSVP
- Recurring events
- Academic calendar publish

### Gallery / Media (Current: 2 → Target: 5)
Unique strength — build on it:
- Photo albums per event
- Public gallery on school website
- Parent download (privacy-controlled)
- Face tagging (optional)

### Testimonials (Current: 2 → Target: 4)
Unique module. Enhance:
- Public submission form on website
- Admin approval workflow
- Carousel display on website

### Discipline (Current: 1 → Target: 3)
Basic. Enhance:
- Incident logging with severity
- Cumulative student discipline record
- Parent notification for serious incidents

## Summary: SNR v3 Target Score Distribution

| Score Range | Count | Modules |
|---|---|---|
| **5 (Best-in-class)** | 7 | SIS, Attendance, Fee Mgmt, Notices, Comms, RBAC, Multi-Tenant, Gallery |
| **4 (Excellent)** | 8 | Timetable, Parent Portal, Admission, Reports, AI, Homework, Lesson Planning, Events, Testimonials |
| **3 (Good)** | 3 | Library, Transport, Discipline |
| **1 (Basic)** | 1 | HR/Payroll |
| **0 (None)** | 0 | — |

**Total modules rated:** 22 (some dual-rated, overall 22 unique modules)  
**Total score (out of 110):** 93 → 84.5% of maximum  
**Rank vs competitors:** 1st (next closest: Entab at 67)
