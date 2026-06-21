# Platform Marketing Page — `platform.html`

> **Type:** SaaS marketing — SNR Edu ERP sales page
> **CMS-Driven:** Partial (branding, tier names)
> **Location:** `D:\Snredu\platform.html`
> **Plan ref:** `Plan/pages/public/platform.md`
> **Date:** June 2026

---

## 1. Purpose

The SNR Edu ERP marketing landing page. Describes the SaaS product, features, pricing tiers, and captures demo leads. Served at `snredu-erp.web.app/platform.html`.

---

## 2. Current Working State

### Sections (10)
1. **Glass-header sticky nav** — Features, Pricing, Book Demo, Customers, Login, Super Admin
2. **Hero** — "Empower Your Institution with Intelligent ERP", Enterprise Edition v3 badge
3. **Trust strip** — 5 logo placeholders (unnamed schools/partners)
4. **Stats counter** — 3 schools, 1200 students, 22 modules, 99% uptime
5. **9-card Features grid**:
   - Multi-Tenant CMS, Live Analytics, Secured Infrastructure, Fee Management, ID Card Generator, Notice Board, Question Paper Formatter, Parent Portal, Bilingual (EN/HI)
6. **Product video embed** — YouTube placeholder (`dQw4w9WgXcQ` — Rick Roll!)
7. **Feature comparison table** — SNR vs Legacy ERPs vs Generic SaaS (8 rows)
8. **Pricing section** — 3 tiers:
   - **Starter** ₹4,999/mo (≤500 students)
   - **Growth** ₹14,999/mo (≤5,000 students, "Most Popular")
   - **Enterprise** Custom
9. **Testimonials** — 3 placeholder cards
10. **"Book Demo" form** — Name, Role, School Name, #Students, Email, Mobile, Message, Consent

### Form Details
Writes to `demoRequests` Firestore collection. Client-side only — no Cloud Function. Rate-limited: 2/hr per email.

### Data Attributes
- `data-i18n-title="site.title"` (single usage)

---

## 3. Gaps (CRITICAL)

| Gap | Severity | Detail |
|---|---|---|
| **YouTube video is a Rick Roll** | **P0** | Video embed is Rick Astley — not a product demo |
| **Stats are hardcoded** | P1 | "3 schools, 1200 students" — should be dynamic |
| **Testimonials are placeholder cards** | P1 | No real customer quotes |
| **Trust strip has unnamed logos** | P2 | No partner names |
| **No actual product screenshots** | P1 | No screenshots of admin dashboard, fee module, etc. |
| **No self-serve signup** | **P0** | No "Start Free Trial" flow |
| **No pricing page with checkout** | P1 | Pricing listed but no payment flow |
| **Super Admin nav link exposed** | **P0** | Public nav shows "Super Admin" link |

---

## 4. Competitor Comparison

| Feature | SNR WORLD | Fedena | Classe365 | MyClassboard |
|---|---|---|---|---|
| Published pricing | ✓ | ✓ | ✓ | ✓ |
| Self-serve trial | ✗ | ✓ (14-day) | ✓ | ✓ |
| Online checkout | ✗ | ✓ | ✓ | ✓ |
| Product screenshots | ✗ | ✓ | ✓ | ✓ |
| Customer testimonials | ✗ (placeholder) | ✓ | ✓ | ✓ |
| Product video | ✗ (Rick Roll) | ✓ | ✓ | ✓ |

**Upper Hand:** The 9-card features grid is genuine and SNR-unique (ID card generator, question formatter, multi-tenant CMS). Everything else is placeholder or broken.

---

## 5. Perfect Version

1. **Real product demo video** — screen recording of admin dashboard workflow
2. **Dynamic live stats** from Firestore (actual school/student/module counts)
3. **Real testimonials** from CMS (same as school.html testimonials section)
4. **Product screenshots** — actual screenshots of each feature module
5. **Self-serve signup** — "Start Free Trial" → provisions a new tenant in <5 min
6. **Comparison table data-driven** — from a Firestore `comparisonData` doc
7. **FAQ accordion** — pricing, features, onboarding questions
8. **Remove Super Admin link** from public nav
9. **Chat widget** — embedded chatbot or WhatsApp for sales queries
