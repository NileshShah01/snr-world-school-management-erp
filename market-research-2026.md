# SaaS School Management Software — Market Research 2026

**with Positioning Recommendations for SNR Edu ERP (Apex Public School Portal)**

> Author: project research
> Date: June 2026
> Scope: Global + India school ERP / SIS / LMS market, India SMB/private target segment
> Companion doc: [`competitive-analysis-report.md`](./competitive-analysis-report.md) (1:1 comparison vs Education Desk)
> Methodology: publicly available sources only (buyer guides, vendor pricing pages, comparison articles, government policy text). No private data accessed.

---

## 1. Executive Summary

The school management software market in 2026 is mature, fragmented, and clearly **bifurcated into three competitive tiers** plus an open-source / niche tier. India alone has 30+ credible vendors competing across four pricing models.

**Top-line finding:** SNR Edu ERP is **technically exceptional on the things nobody else has** (full public-website CMS, 13+ premium ID card templates, AI question formatter, FIFO atomic fee engine) but is **operationally un-shippable in 2026** because of (a) security gaps, (b) missing payment/SMS gateways, (c) no mobile/PWA experience, and (d) no published pricing — exactly the **table-stakes features** Entab, Teachmint, Fedena, and Education Desk all already have.

**Our recommended positioning** for the India SMB / private-school segment:
> *"The CMS-first, AI-enabled school platform for small and mid-size Indian private schools — a website + ERP + parent portal in one, at ₹4/student/month, on a PWA so parents don't need an app."*

Three strategic pillars, in priority order:
1. **Fix ship-blockers** (security, payment, SMS, DPDP Act, NEP 2020, pricing page) — 0–30 days.
2. **Match India market baseline** (Razorpay, MSG91, WhatsApp Business API, PWA + Web Push, bilingual UI) — 1–3 months.
3. **Defensible differentiation** (AI suite extension, GPS transport, custom NEP Holistic Progress Card) — 3–6 months.

Defer (until enterprise customer asks): SOC 2, ISO 27001, native mobile app, hostel/payroll depth.

---

## 2. Market Landscape

### 2.1 Tier 1 — Global Enterprise / District

These are 20+ year-old players selling to K-12 school districts in North America and to premium international schools worldwide. Enterprise sales motion, high-touch implementation, custom pricing.

| Vendor | HQ | Stack | Strengths | Weakness for us |
|---|---|---|---|---|
| **PowerSchool** | USA (45M+ students) | Proprietary SaaS | Industry leader; integrated SIS+Gradebook+PowerScheduler; standards-based grading; AI-driven insights | Expensive, US-centric, India workflows weak, no CMS |
| **Infinite Campus** | USA | Proprietary | District-grade compliance and state reporting; deep scheduling/grading | US-only, complex configuration |
| **Blackbaud K-12** | USA | Proprietary | Tuition billing + finance depth; 25+ years in K-12 | Enterprise-only, slow deployment |
| **Aeries** | USA | Proprietary | Strong K-12 SIS, parent portal, attendance + grading | US public-school focused |
| **Frontline Education** | USA | Proprietary | HCM + absence management for districts | HR-focused, not full ERP |
| **Illuminate Education** | USA | Proprietary | MTSS intervention workflow, assessment-driven | Best as complement, not full SIS |

### 2.2 Tier 2 — Mid-Market / Cloud-Native

Mid-market SaaS sold to charter schools, private K-12, and international schools. Modern UX, $5–25/student/year, free trials common.

| Vendor | Stack | Strengths | Weakness for us |
|---|---|---|---|
| **Alma** | Modern SaaS | Best-in-class K-12 UX | Limited multi-tenant, US-focused |
| **Gradelink** | Cloud | Simple, affordable for small private schools | Limited advanced features |
| **Classter** | SaaS + biometric/IoT | Global, all-in-one (SIS + LMS + ERP + IoT) | Pricing opaque, requires sales call |
| **Clast.io** | Modern SaaS | AI features, flat-rate unlimited users, all-in-one | Newer / less proven at scale |
| **Fedena** | Ruby on Rails (open-core) | 50+ modules, 40K+ institutions, multi-campus, CBSE/ICSE/IB/IGCSE support | Per-student add-on creep, clunky UI, weak admissions CRM |
| **OpenEduCat** | Odoo / Python (open-source) | 74+ modules, ERP breadth, free community edition | Self-host complexity |
| **OpenSIS** | PHP (open-source) | Free, mature | Outdated UI |
| **eSkooly** | SaaS | "100% free" lifetime tier | Free = limited; monetizes via SMS, ads, gateway fees |

### 2.3 Tier 3 — India-Focused (Our Competitive Set)

This is the tier that matters for our target segment. India has at least 15 credible SMB-focused vendors.

| Vendor | Pricing | Key Strength | Key Weakness |
|---|---|---|---|
| **Entab CampusCare** | ₹1.5–8L/yr + impl. | 25 yrs, 2,500+ schools, NEP 2020 built-in, GST receipts, GPS, hostel, payroll | On-premise heritage, slow to cloud, limited customization, opaque pricing |
| **Teachmint** | ₹100–300/student/yr | Mobile-first, live classes, UPI, parent app, VC-funded | ERP depth still maturing, opaque sales-call pricing, product pivots |
| **MyClassCampus** | Per-student | Broad module set, transport strength, good mid-size adoption | Generic UX, less India-specific polish |
| **Schoollog** | ₹30K–1.5L/yr | Communication-first, budget friendly, simple setup | Lightweight ERP |
| **Vidyalaya** | ₹1.5–4L/yr + AMC (~15–20%) | Established, full suite, traditional Indian schools | Legacy UX, limited customization |
| **Campus 24x7** | Quote | Native WhatsApp + UPI, NEP alignment, CBSE report cards | Newer player |
| **Fuzen** | ₹25K one-time + custom | You own the system, no annual license, faster than Entab | Smaller vendor |
| **CodePex** | Flat ₹1.5L/yr | Transparent "Unlimited Student Model", no per-student, all modules | Newer vendor |
| **EduGradUP** | ₹12K/yr flat | Cheapest credible option, unlimited students | Limited depth |
| **Schoolknot** | ₹25/student/mo | Communication, multi-branch control | Light ERP |
| **RexoCampus** | Quote | 40+ modules, all-in-one subscription, Indian compliance | Marketing-led |
| **SkoolBeep** | Quote | Parent-app-first, simple setup | ERP gaps |
| **MySmartSchool** | ₹5/student/mo | Cheapest entry point | Limited features |
| **EduSys** | ₹20K+/yr | Mid-market | Extra charges for parent app |
| **Edunext** | Custom | Security, biometrics | Enterprise sales motion |
| **SchoolERP India** | ₹5K–30K/yr (per 300 students) | Affordable Indian SMB, 100+ modules, GST invoices | Brand recognition |

### 2.4 Open-Source & Niche

Fedena Community Edition, OpenEduCat Community, OpenSIS, **MySchool**, **Vedmarg**, **Camu**, **Class ON App**, **Greatify**, **QCampus ERP**, **Kajabi (education)**. These exist in a separate lane — schools with in-house IT staff that want to self-host.

---

## 3. Industry Baseline — "What every vendor has in 2026"

A cross-vendor survey of 20+ products yields a **de-facto feature baseline**. Any module in this list is *table-stakes* — missing it disqualifies a vendor from serious sales conversations.

| # | Module | Tier 1 | Tier 2 | Tier 3 India | Must-have? |
|---|---|:---:|:---:|:---:|---|
| 1 | Student Information System (SIS) | ✅ | ✅ | ✅ | Yes |
| 2 | Admissions / Enquiry CRM | ✅ | ✅ | ✅ | Yes |
| 3 | Attendance (daily/period) | ✅ | ✅ | ✅ | Yes |
| 4 | Biometric / RFID / QR attendance | 🟡 | 🟡 | 🟡 | Expected in 2026 |
| 5 | Timetable (auto + conflict-check) | ✅ | ✅ | ✅ | Yes |
| 6 | Examinations & Gradebook | ✅ | ✅ | ✅ | Yes |
| 7 | Report Cards (board-format templates) | ✅ | ✅ | ✅ | Yes |
| 8 | Fee Management (multi-head, FIFO, late-fine) | ✅ | ✅ | ✅ | Yes |
| 9 | Online Payments (gateway integration) | ✅ | ✅ | ✅ | Yes |
| 10 | Communication — SMS gateway | ✅ | ✅ | ✅ | Yes |
| 11 | Communication — WhatsApp Business API | 🟡 | 🟡 | ✅ | **Yes for India** |
| 12 | Communication — Email / push | ✅ | ✅ | 🟡 | Yes |
| 13 | Parent & Student Portal (web) | ✅ | ✅ | ✅ | Yes |
| 14 | Parent & Student App (native iOS + Android) | ✅ | 🟡 | ✅ | **Yes for India** |
| 15 | Transport & GPS tracking | ✅ | 🟡 | ✅ | Yes |
| 16 | Library management | 🟡 | ✅ | ✅ | Common |
| 17 | Hostel management | 🟡 | 🟡 | 🟡 | Only for residential schools |
| 18 | HR & Payroll | ✅ | 🟡 | 🟡 | Expected at scale |
| 19 | Inventory & Assets | 🟡 | 🟡 | 🟡 | Expected at scale |
| 20 | LMS / Online Classes | 🟡 | ✅ | 🟡 | Differentiator in 2026 |
| 21 | Reports & Analytics (BI dashboards) | ✅ | ✅ | 🟡 | Yes |
| 22 | Public Website CMS (15+ page types) | ❌ | ❌ | ❌ | **Our differentiator** |
| 23 | ID Card Generator (multi-template) | ❌ | 🟡 | ❌ | **Our differentiator** |
| 24 | AI Question Formatter | 🟡 | 🟡 | ❌ | **Our differentiator** |
| 25 | AI Auto-grading | 🟡 | 🟡 | ❌ | Differentiator |
| 26 | AI Predictive Analytics | 🟡 | 🟡 | ❌ | Differentiator |
| 27 | NEP 2020 / Holistic Progress Card | ❌ | 🟡 | 🟡 | **Yes for India by 2026–27** |
| 28 | CBSE/ICSE/State-board formats | ❌ | ✅ | ✅ | **Yes for India** |
| 29 | GST-compliant fee receipts | ❌ | ❌ | ✅ | **Yes for India** |
| 30 | UPI payment collection | ❌ | 🟡 | ✅ | **Yes for India** |
| 31 | Bilingual UI (Hindi + English) | ❌ | 🟡 | 🟡 | **Yes for India** |
| 32 | DPDP Act 2023 compliance | 🟡 | 🟡 | 🟡 | **Yes for India** |
| 33 | UDISE+ export | ❌ | 🟡 | 🟡 | Expected for state-board |
| 34 | White-label mobile app builder | ❌ | 🟡 | ❌ | Enterprise add-on |
| 35 | Public REST/GraphQL API | ✅ | 🟡 | ❌ | Enterprise add-on |
| 36 | SOC 2 / ISO 27001 | ✅ | 🟡 | ❌ | Enterprise only |
| 37 | Published pricing page | ❌ | 🟡 | 🟡 | **Yes for India SMB** |
| 38 | Self-serve free trial | ❌ | ✅ | 🟡 | **Yes for India SMB** |
| 39 | Case studies / testimonials | ✅ | ✅ | 🟡 | **Yes for India SMB** |

Legend: ✅ standard · 🟡 partial / varies · ❌ rare / none

**Pattern:** The four blocks that no India Tier-3 vendor has (rows 22, 23, 24, 25) are exactly the four differentiators SNR Edu ERP has built. The four blocks every India Tier-3 vendor has (rows 9, 10, 11, 14) are exactly where SNR Edu ERP is missing.

---

## 4. Pricing Models in India (2026)

A 2026 cross-vendor survey reveals **four pricing models** used by India-focused vendors. Real-world TCO is typically **40–60% higher** than the advertised rate once SMS packs, payment gateway fees, setup, and customization are added.

### 4.1 Per-Student Monthly / Annual

- **What:** You pay per enrolled student, monthly or annually
- **Used by:** Schoolknot, Teachmint, MyClassCampus, MySmartSchool, Fedena, SchoolERP India (for >300 students)
- **Range (2026):**

| School size | Low-end | Mid-range | Premium |
|---|---|---|---|
| Up to 300 students | ₹20–30/student/mo | ₹30–50/student/mo | ₹50–80/student/mo |
| 300–1,000 | ₹15–25/student/mo | ₹25–40/student/mo | ₹40–60/student/mo |
| 1,000–3,000 | ₹10–20/student/mo | ₹20–35/student/mo | ₹35–50/student/mo |
| 3,000+ | Negotiable | ₹15–30/student/mo | ₹25–45/student/mo |

- **Real TCO example** (500-student school, advertised ₹25/student/mo):

| Line item | Monthly | Annual |
|---|---|---|
| Base ERP license (500 × ₹25) | ₹12,500 | ₹1,50,000 |
| SMS pack (2,000 SMS/mo) | ₹1,500 | ₹18,000 |
| WhatsApp Business API | ₹2,000 | ₹24,000 |
| Payment gateway fees (~1.8% of ₹15L collection) | ~₹2,250 | ₹27,000 |
| **Real monthly/annual cost** | **₹18,250** | **₹2,19,000** |
| **Real per-student per-month** | **₹36.5** | — |

- **Pro:** Scales with success
- **Con:** "Growth penalty" — your software cost goes up as your school grows

### 4.2 Annual Flat-Rate Subscription

- **What:** Fixed yearly fee regardless of student count (up to a cap)
- **Used by:** EduGradUP (₹12K flat, unlimited), CodePex (₹1.5L flat, unlimited), RexoCampus (enterprise tier)
- **Range:**

| Tier | Annual | Student cap | Modules |
|---|---|---|---|
| Basic | ₹25K–50K | Up to 500 | Fees, attendance, basic comms |
| Standard | ₹60K–1.2L | Up to 1,000 | All core + exams, report cards, parent app |
| Premium | ₹1.2L–2.5L | Up to 2,000 | Full suite + transport, hostel, inventory, LMS |
| Enterprise | ₹2.5L–5L+ | Unlimited / multi-campus | All + API + dedicated CSM |

- **Pro:** Predictable budgeting
- **Con:** Cross-subsidizes — small schools overpay, large schools underpay

### 4.3 One-Time License + Annual Maintenance (AMC)

- **What:** One-time license + 15–20%/yr for support/updates
- **Used by:** Fuzen (₹25K one-time), Vidyalaya, older Entab models, custom builds

| School size | One-time | Annual AMC (18% avg) | 3-yr TCO |
|---|---|---|---|
| Small (<500) | ₹1–2L | ₹18K–36K | ₹1.4–2.7L |
| Medium (500–1,500) | ₹2–4L | ₹36K–72K | ₹2.7–5.4L |
| Large (1,500+) | ₹3.5–8L | ₹63K–1.4L | ₹4.8–10.9L |

- **Pro:** You own the system; lower long-term TCO
- **Con:** High upfront cost; you self-host and maintain

### 4.4 Freemium + Paid Add-ons

- **What:** Base product free, revenue from premium features / SMS / gateway / ads
- **Used by:** eSkooly, SchoolERP India Startup tier, OpenEduCat Community
- **Real cost (500-student school):** Typically ₹40K–80K/yr once SMS packs and gateway fees are added

### 4.5 Enterprise / Quote-Only

- **What:** "Contact sales" — typical of older ERPs (Entab, PowerSchool, Classter)
- **Typical cost:** ₹2–8L+/yr; long-term contracts with early-exit penalties

### 4.6 Hidden-Cost Patterns (across all models)

1. **Setup / implementation:** ₹25K–1L (waived in 2026 promotions)
2. **Data migration from old ERP:** Often billed hourly
3. **SMS packs:** ₹0.10–1.50/SMS, ₹0.10–0.30/WhatsApp
4. **Payment gateway fees:** 1.5–2.5% of collection
5. **AMC:** 15–20% of license / yr
6. **Parent app:** Often a paid add-on (₹1.2L–2.4L/yr)
7. **Custom report cards / certificates:** ₹5K–10K per template
8. **Training:** First-year bundled, year-2+ extra

### 4.7 Our Pricing Direction (Recorded, Not Implemented)

See section 10.

---

## 5. India-Specific Differentiators

These are the **table-stakes-for-India** features that global Tier-1 vendors don't need and many India Tier-2 vendors treat as add-ons.

### 5.1 NEP 2020 (National Education Policy)

- **Status:** Mandatory rollout for CBSE schools by 2026–27 academic year
- **What it requires:**
  - Competency-based assessment (not just marks)
  - Holistic Progress Card (HPC) replacing traditional report cards for primary
  - Skill subjects, vocational education, art integration
  - Continuous formative assessment
  - Parent-teacher meetings every quarter
- **Vendors with NEP-native support:** Entab CampusCare (NEP built in), Campus 24x7, Fedena (CBSE/ICSE templates)
- **Our status:** ❌ Not yet implemented. We have custom report card templates only.

### 5.2 CBSE / ICSE / State-Board Report Card Formats

- **Status:** Mandatory. A school on a non-CBSE template will not buy your ERP.
- **What it requires:** Pre-built report card templates for at least 5 major boards, with the exact grade-mapping rules per board.
- **Our status:** 🟡 Marks entry supports; report card templates are generic (Himalayan, Emerald, Premium Elite), not board-specific.

### 5.3 GST-Compliant Fee Receipts

- **Status:** Mandatory for any school collecting fees above ₹20L/yr
- **What it requires:** GSTIN, HSN/SAC codes, CGST/SGST/IGST split, sequential receipt numbering, monthly GST return export
- **Our status:** 🟡 Generic receipts (R-XXXXXX), not GST-formatted.

### 5.4 UPI / Razorpay / Cashfree / PayU

- **Status:** Default payment method in India
- **What it requires:** Direct UPI deep-link, UPI QR at fee counter, auto-reconciliation
- **Our status:** ❌ No payment gateway. `payment-service.js` is internal FIFO only.

### 5.5 WhatsApp Business API

- **Status:** Preferred parent communication channel in India (450M+ users)
- **What it requires:** Automated fee receipt, attendance, admit card, notice-board delivery
- **Our status:** 🟡 `wa.me/` deep-links only. No Business API integration.

### 5.6 Bilingual UI (Hindi + English) and Regional Language Support

- **Status:** Expected in CBSE Hindi-medium schools
- **What it requires:** i18n framework, translated content, language switcher
- **Our status:** 🟡 `cms-settings.js` is structurally language-aware (uses `data-en`/`data-hi` patterns in some files), but no language switcher or i18n bundle.

### 5.7 DPDP Act 2023 Compliance

- **Status:** Legal requirement, enforced in phases from 2024–2026
- See section 9 for detailed compliance roadmap.

### 5.8 UDISE+ Integration

- **Status:** Required for government reporting (state-board schools)
- **What it requires:** Export school + student + staff + infrastructure data in the UDISE+ DCF format
- **Our status:** 🟡 Manual CSV/Excel export only; no UDISE+ format.

---

## 6. Feature Matrix — Our Project vs Industry Baseline

✅ = present & solid · 🟡 = partial / works but rough · ❌ = missing

| # | Module | Our State | Notes |
|---|---|---|---|
| 1 | SIS (enrollment, demographics, photos) | ✅ | Bulk Excel import, 25+ column search, custom fields |
| 2 | Admissions / Enquiry CRM | 🟡 | Has enquiry module + search + convert; no lead pipeline / auto follow-up |
| 3 | Attendance (daily/period) | ✅ | Daily/period, Excel upload, mark-all-present, monthly reports |
| 3b | Biometric / RFID / QR attendance | ❌ | — |
| 4 | Timetable | 🟡 | Class & teacher views; no auto conflict-solver |
| 5 | Examinations & Gradebook | ✅ | Grading rules, exam timetable, admit card, marks, result analytics |
| 6 | Report Cards | ✅ | **Premium Elite** PDF (multi-graph, A4), multiple templates |
| 7 | Fee Management | ✅ | **FIFO atomic transactions**, multi-head, late-fine, concessions, partial, R-XXXXXX ledger |
| 8 | Online Payments (gateway) | ❌ | No Razorpay/Cashfree/PayU/Stripe — major gap |
| 9 | Communication — SMS gateway | ❌ | No MSG91/Twilio gateway |
| 10 | Communication — WhatsApp | 🟡 | `wa.me/` deep-links only; no Business API |
| 11 | Communication — Email | 🟡 | `mailto:` deep-links only |
| 12 | Communication — Push | ❌ | No FCM / web-push |
| 13 | Parent & Student Portal (web) | 🟡 | Functional, no PWA / no offline |
| 14 | Parent & Student App (native iOS + Android) | ❌ | None. (PWA + Web Push will close this gap for ₹0) |
| 15 | Transport & GPS | 🟡 | Routes + assign only; no live GPS |
| 16 | Library | ✅ | Catalog, issue/return, history — **Fedena/Entab have it; Education Desk doesn't** |
| 17 | Hostel | ❌ | No module |
| 18 | HR & Payroll | 🟡 | Staff CRUD + ID print; no payslip, leave, payroll |
| 19 | Inventory & Assets | 🟡 | Light; no barcode/RFID |
| 20 | LMS / Online Classes | 🟡 | Homework + assignment distribution; no live classes |
| 21 | Reports & Analytics | 🟡 | Chart.js for Super Admin; Analytics Hub "under maintenance" |
| 22 | **Public Website CMS** | ✅ | **15+ page types, hero slider, marquee, gallery, events, testimonials, staff, holidays, dynamic branding** — most ERP vendors don't have this |
| 23 | **ID Card Generator** | ✅ | **13+ premium CR80 templates, individual + batch PDF** — no major competitor has this |
| 24 | **AI Question Formatter** | ✅ | **ExamCraft AI with Gemini, PDF/DOCX export** — no major competitor has this |
| 25 | AI Auto-grading | ❌ | None (Classter, Clast.io, Illuminate have) |
| 26 | AI Predictive Analytics | ❌ | None (Clast.io, PowerSchool have) |
| 27 | **NEP 2020** | ❌ | Not in scope yet (mandatory for Indian K-12 by 2026–27) |
| 28 | CBSE/ICSE/State-board formats | 🟡 | Marks entry supports; templates are generic |
| 29 | GST-compliant fee receipts | 🟡 | Generic receipts, not GST-formatted |
| 30 | UPI / Razorpay | ❌ | No payment gateway |
| 31 | Bilingual UI (Hindi + English) | ❌ | English only |
| 32 | DPDP Act 2023 compliance | ❌ | No documented compliance |
| 33 | UDISE+ export | ❌ | None |
| 34 | White-label mobile app builder | ❌ | None |
| 35 | Public REST/GraphQL API | ❌ | None documented |
| 36 | SOC 2 / ISO 27001 | ❌ | None |
| 37 | Pricing page | ❌ | Not published |
| 38 | Self-serve free trial | ❌ | Not exposed |
| 39 | Case studies / testimonials | ❌ | None |

### Score Breakdown

| Category | Present | Partial | Missing | % Complete |
|---|---|---|---|---|
| **Core ERP (rows 1–21)** | 4 | 8 | 6 | **40%** ✅🟡 |
| **Differentiators (rows 22–26)** | 3 | 2 | 0 | **83%** ✅🟡 (very strong) |
| **India-Specific (rows 27–33)** | 0 | 2 | 7 | **11%** ❌ |
| **Go-to-Market (rows 34–39)** | 0 | 1 | 6 | **7%** ❌ |

**Bottom line:** We are a **Differentiator-rich, India-Baseline-poor** product.

---

## 7. SWOT — Our Project (SNR Edu ERP)

| | **Positive** | **Negative** |
|---|---|---|
| **Internal** | **S — Strengths**<br>• Full public-website CMS (15+ page types)<br>• 13+ premium ID card templates (CR80 spec)<br>• AI question formatter (Gemini)<br>• FIFO atomic fee engine (technically superior to most)<br>• Multi-tenant SaaS with 6-stage provisioning<br>• Firebase infrastructure (offline, real-time, CDN, auto-scale)<br>• Comprehensive student portal<br>• Dynamic per-tenant theming<br>• Role-based access control (8 roles)<br>• 80% of file flows already on Base64 in Firestore (post-migration) | **W — Weaknesses**<br>• Auth guards commented out (security)<br>• 6 modules showing `data-lucide="construction"` ("under maintenance")<br>• No mobile app or PWA<br>• No payment / SMS / WhatsApp gateway<br>• No NEP 2020 / CBSE templates<br>• No GST-formatted receipts<br>• No Hindi UI<br>• No public pricing<br>• No case studies / testimonials<br>• Loose Firestore rules (dev-mode)<br>• `firestore.rules` exposes a fallback match-all-true block<br>• Firebase API key checked into public repo |
| **External** | **O — Opportunities**<br>• Indian K-12 market is large and under-digitized<br>• NEP 2020 forces digitization in 2026–27<br>• Firebase lowers infra cost to near-zero<br>• AI + CMS combination is unique in the market<br>• 6-stage SaaS model supports freemium-to-enterprise pipeline<br>• Razorpay / MSG91 / WhatsApp APIs are now mature and cheap to integrate<br>• PWA gives "mobile app feel" without separate codebase<br>• The competitor analysis we already have is rare and valuable | **T — Threats**<br>• Entab has 2,500 schools and 25-year brand<br>• Education Desk has 1M+ students and Play Store presence<br>• Teachmint is VC-funded and aggressively priced<br>• New flat-fee players (EduGradUP ₹12K, CodePex ₹1.5L) compete on price<br>• Fedena open-source threat if schools want to self-host<br>• DPDP Act fines up to ₹250 crore for serious breaches<br>• Firebase vendor lock-in risk |

---

## 8. Competitive Positioning

### 8.1 Tier-by-Tier Gap Analysis

| Gap | vs Tier 1 (PowerSchool) | vs Tier 2 (Fedena) | vs Tier 3 India (Entab, Teachmint) |
|---|---|---|---|
| Mobile app / PWA | Behind (none) | Behind (none) | **Critical gap** (every India vendor has Android app at minimum) |
| Payment gateway | Behind (none) | Behind (Razorpay integrated) | **Critical gap** (Razorpay is table-stakes) |
| SMS / WhatsApp gateway | Behind | Behind (MSG91) | **Critical gap** |
| NEP 2020 / CBSE formats | N/A (US) | Behind (Fedena has CBSE) | **Critical gap** for India sales |
| Parent communication channels | Behind (multi-channel) | Behind | **Critical gap** |
| Biometric / GPS / RFID | Behind | Behind | **High gap** |
| DPDP Act compliance | Behind | Behind | Behind |
| LMS / online classes | Behind | Behind (Fedena + Moodle) | Behind (Teachmint strong) |
| Library | Parity | Parity | Parity |
| **CMS / Public site** | **Ahead** (most don't have) | **Ahead** | **Ahead** |
| **ID card generator** | **Far ahead** (most don't have) | **Far ahead** | **Far ahead** |
| **AI question formatter** | **Far ahead** | **Far ahead** | **Far ahead** |
| **FIFO fees (atomic)** | **Ahead** technically | **Ahead** technically | **Ahead** technically |

### 8.2 Where We Win

1. **Full public website CMS** — unique in school ERP market. Most ERP vendors treat the school website as out-of-scope. We get the school for life.
2. **13+ premium ID card templates** — no major competitor offers this. Schools print 100s–1000s of cards/year. Each print is a "wow" moment.
3. **AI question formatter (Gemini)** — first-mover in 2026. Education Desk, Entab, Teachmint don't have it.
4. **FIFO atomic fee engine** — technically the most correct implementation in this niche. Banks trust this. Auditors trust this.

### 8.3 Where We Lose (and how to fix)

| Loss | Fix | Effort |
|---|---|---|
| No mobile / PWA | Ship PWA + Web Push using existing `temp_super_admin/` React/Vite side-car as the mobile shell | 2 weeks |
| No payment gateway | Razorpay (India) integration; plumb into `payment-service.js` | 1 week |
| No SMS / WhatsApp | MSG91 + WhatsApp Business API | 1 week |
| No NEP 2020 | Add NEP Holistic Progress Card template to `report-card-factory.js` | 2 weeks |
| No CBSE templates | Add 5 board templates to the report card factory | 2 weeks |
| No GST receipts | Update `demand-receipt.js` to GST format (HSN/SAC, CGST/SGST/IGST) | 3 days |
| No Hindi UI | Add i18n bundle + language switcher | 1 week |
| No public pricing | Publish a 3-tier pricing page mapped to the 6 SaaS stages | 3 days |
| No case studies | Document Apex Public School deployment | 1 week |
| Auth guards off | Re-enable `js/admin-auth.js:78-99` | 1 hour |

---

## 9. Compliance Roadmap — India SMB / Web App / No Paid Customers

### 9.1 DPDP Act 2023 — What It Requires of Us

The Digital Personal Data Protection Act, 2023 is India's GDPR-equivalent. Enforced in phases from 2024–2026. **For our target (Indian SMB private schools processing children's data), the following is mandatory:**

| DPDP requirement | What we must do | Effort |
|---|---|---|
| **Privacy notice** | A `/privacy` page listing what data we collect, why, how long, with whom we share | 1 day |
| **Verifiable parental consent** | A consent checkbox on the admission form, with a record of consent per child in Firestore | 2 days |
| **Data Subject Rights — Access** | A "Download my data" button in the parent portal that exports the child's full record as JSON | 3 days |
| **Data Subject Rights — Erasure** | A "Delete my data" workflow that soft-deletes the child record and audit-logs the action | 2 days |
| **Data Subject Rights — Correction** | Already supported (parents can update contact info via portal) | 0 |
| **Grievance officer** | An email address (`grievance@snredu.com` or similar) listed in privacy notice; respond within 30 days | 1 hour |
| **Breach notification** | Process doc + 72-hour notification template for the Data Protection Board of India | 1 day |
| **Data minimization** | Audit our Firestore collections; remove fields we don't actually use | 1 week |
| **Children's data** | Default to "minor" classification for all student records; require explicit parental consent flag | 2 days |
| **Data Processing Agreement (DPA)** | Standard template schools can sign with us; covers our role as "Data Processor" | 2 days |

**Total DPDP effort: ~3 weeks, ~₹0 cash cost.** The penalty for non-compliance is up to ₹250 crore per breach — making this trivially worth doing.

### 9.2 NEP 2020 — What It Requires of Us

| NEP requirement | What we must do | Effort |
|---|---|---|
| **Competency-based assessment** | Update marks entry UI to allow "competency level" alongside marks (e.g., A/B/C/D or 1–5) | 1 week |
| **Holistic Progress Card (HPC)** | New report card template in `report-card-factory.js` for primary classes (1–5): scholastic + co-scholastic + observation | 2 weeks |
| **Skill subjects & vocational education** | Subject master allows "skill" type subjects; report card groups them separately | 1 week |
| **Continuous formative assessment** | Marks entry supports multiple assessments per term (not just 1 mid + 1 final) | 3 days |
| **Parent-teacher meeting tracking** | Add a PTM scheduling + minute-taking module | 1 week |
| **Annual / 360° feedback** | Optional survey module | 2 weeks |

**Total NEP effort: ~6 weeks. This is the single biggest go-to-market unlock for CBSE schools.**

### 9.3 UDISE+ — Minimal Compliance

UDISE+ (Unified District Information System for Education Plus) is the government school census. We don't need to integrate; we just need to be able to **export** the right shape of data on demand.

| UDISE+ requirement | What we must do | Effort |
|---|---|---|
| **School profile export** | JSON export of school metadata (UDISE code, address, principal, contact) | 1 day |
| **Student DCF export** | CSV export of all student records in the UDISE+ DCF format | 2 days |
| **Staff DCF export** | Same, for staff | 1 day |
| **Infrastructure DCF export** | Same, for school infrastructure | 1 day |

**Total UDISE+ effort: ~1 week. Done once, runs annually.**

### 9.4 What We Are Deferring (and Why)

| Standard | Cost | When needed | Decision |
|---|---|---|---|
| **SOC 2 Type I** | ₹15–40L audit + ₹5L/yr | Only if US/enterprise customer asks | **Defer** |
| **SOC 2 Type II** | Same as Type I, annual | Same | **Defer** |
| **ISO 27001** | ₹8–15L initial + ₹3L/yr | Only if enterprise customer asks | **Defer** |
| **ISO 27017 / 27018** (cloud / PII) | Same | Only if cloud enterprise | **Defer** |
| **COPPA** (US under-13) | ₹0 (UI + policy) | Only if US expansion | **Skip** unless we cross the Pacific |
| **GDPR** (EU) | ₹0 (UI + policy) | Only if EU expansion | **Skip** for now; structure is GDPR-friendly |
| **PCI-DSS** (card data) | We don't store cards (Razorpay does) | Never | **N/A** |
| **HIPAA** (health data) | We're not in US healthcare | Never | **N/A** |

**Rule of thumb:** No Indian SMB school will ask for SOC 2 or ISO 27001 in 2026. Defer until the first enterprise ask, and you'll save ₹15–40L of unnecessary compliance cost.

---

## 10. Pricing Thought (Recorded, Not Implemented)

> **Status: roadmap idea only. Not implemented. Not in any UI. Not in any module.**

### 10.1 The Idea

**₹4 per student per month**, billed monthly or annually.

- All-inclusive: every module, every stage, unlimited users, no SMS/gateway fees on top
- 6-stage SaaS model maps naturally:
  - Stage 1 (Basic Website): Free
  - Stage 2 (CMS Admin): ₹2/student/mo
  - Stage 3 (Pro Portal): ₹3/student/mo
  - Stage 4 (Core ERP): ₹4/student/mo
  - Stage 6 (Full ERP): ₹5/student/mo (with optional per-school premium add-on for GPS, biometrics)

### 10.2 The Math

| School size | Monthly (₹4/student) | Annual | Per-student annual |
|---|---|---|---|
| 100 students | ₹400 | ₹4,800 | ₹48 |
| 300 students | ₹1,200 | ₹14,400 | ₹48 |
| 500 students | ₹2,000 | ₹24,000 | ₹48 |
| 1,000 students | ₹4,000 | ₹48,000 | ₹48 |
| 2,000 students | ₹8,000 | ₹96,000 | ₹48 |

### 10.3 Competitive Position

| Competitor | Per-student per-month | Per-student per-year | Our position (₹4/mo) |
|---|---|---|---|
| EduGradUP (flat) | — | ~₹40 (300 students, ₹12K flat) | We are **cheaper** for 100–300 students |
| Schoolknot | ₹25 | ₹300 | **6.25× cheaper** |
| MySmartSchool | ₹5–10 | ₹60–120 | **1.25–2.5× cheaper** |
| SchoolERP India (premium) | ₹100 | ₹1,200 | **25× cheaper** |
| Teachmint | ~₹8–25 | ₹100–300 | **2–6× cheaper** |
| Fedena (500 students) | — | ~₹132 (₹5,500/mo ÷ 500 × 12) | **2.75× cheaper** |
| Entab CampusCare | — | ₹150–800+ | **3–17× cheaper** |
| PowerSchool | — | Quote (typically ₹500+) | **10×+ cheaper** |

### 10.4 Why ₹4 Works as a Position (Not Just a Price)

1. **Razor-thin margin, but huge scale potential** — at 1,000 schools × 500 students × ₹4/mo = ₹2 crore/month = ₹24 crore/year. India has 250,000+ private schools. 0.4% market share = ₹2.4 crore/yr.
2. **No SMS / gateway fees on top** — we build the cost of Razorpay (1.8%) and MSG91 (₹0.20/SMS) into the ₹4. Schools hate nickel-and-diming.
3. **No setup fee** — match EduGradUP / Fuzen. Schools can self-onboard.
4. **No annual lock-in** — monthly billing. Schools can leave. This builds trust.
5. **NEP 2020 / DPDP Act included** — schools don't have to pay compliance consultants.
6. **"All stages, all modules"** — schools grow into stages without renegotiating.

### 10.5 What We Need Before We Can Charge ₹4

- [ ] Razorpay integration (1 week)
- [ ] MSG91 integration (1 week)
- [ ] WhatsApp Business API (1 week)
- [ ] NEP 2020 + CBSE templates (6 weeks)
- [ ] DPDP Act compliance (3 weeks)
- [ ] Bilingual UI (1 week)
- [ ] PWA + Web Push (2 weeks)
- [ ] Public pricing page (3 days)
- [ ] At least 3 case studies from existing pilot (Apex Public School + 2 more) (2 weeks)
- [ ] Auth guards re-enabled (1 hour)
- [ ] Firestore rules tightened (1 day)

**Total: ~14 weeks of focused work to be ₹4-shippable.**

### 10.6 Decision Record

- **Decision date:** June 2026
- **Decided by:** project owner
- **Status:** Direction, not implementation
- **Next step:** Re-evaluate after the P0/P1 items in section 11 are complete

---

## 11. Strategic Recommendations

### 11.1 P0 — Ship-Blockers (0–30 days)

These are credibility-killers that must be fixed before any sales motion. None of them require new features — they're all "finish what we started" or "remove what's broken."

| # | Action | Impact | Effort |
|---|---|---|---|
| 1 | **Re-enable auth guards** in `js/admin-auth.js:78-99` and the student-dashboard equivalent | Critical — security | 1 hour |
| 2 | **Tighten `firestore.rules`** — remove the match-all `if isAdmin()` block at the bottom, enforce per-school isolation on writes | Critical — security | 1 day |
| 3 | **Remove or complete the 6 "under maintenance" modules** (the `data-lucide="construction"` icons in `portal/admin-dashboard.html` lines 7936–8040) | High — credibility | 1 day |
| 4 | **DPDP Act 2023 basics** — privacy notice, consent capture, data-export, data-deletion, grievance email | Critical — legal | 3 weeks |
| 5 | **NEP 2020 + CBSE report card templates** | High — India sales | 6 weeks |
| 6 | **Publish pricing page** (3 tiers mapped to 6 SaaS stages) | High — sales | 3 days |
| 7 | **Document the Apex Public School deployment** as a public case study | High — social proof | 1 week |

### 11.2 P1 — GTM-Critical for India (1–3 months)

| # | Action | Impact | Effort |
|---|---|---|---|
| 1 | **Razorpay integration** — plumbed into existing `payment-service.js` FIFO engine. Use Razorpay Standard Checkout, server-to-server webhook for confirmation, atomic Firestore transaction for fee allocation (the FIFO logic is already there). | High — enables real fee collection | 1 week |
| 2 | **MSG91 SMS gateway** — wire into attendance alerts, fee reminders, admission confirmations, OTP for parent login | High | 1 week |
| 3 | **WhatsApp Business API** (via Interakt / Wati / AiSensy) — automated fee receipt, attendance, admit card, notice-board delivery | High | 1 week |
| 4 | **PWA + Web Push** — service worker, manifest, install-to-home-screen, push notifications via FCM (free) or OneSignal (easier) | High — closes mobile gap for ₹0 | 2 weeks |
| 5 | **Hindi + English bilingual UI** — i18n bundle, language switcher, translated copy | High — CBSE Hindi-medium | 1 week |
| 6 | **GST-formatted fee receipts** — update `demand-receipt.js` to include HSN/SAC, CGST/SGST/IGST, GSTIN | Medium — legal for ₹20L+ fee schools | 3 days |
| 7 | **UDISE+ export** — CSV/JSON exports in the DCF format | Medium — state-board sales | 1 week |
| 8 | **Self-serve signup** — a `/get-started` flow that lets a school register itself, picks a slug, gets a free Stage 1 site | High — removes sales friction | 2 weeks |

### 11.3 P2 — Defensible Differentiation (3–6 months)

| # | Action | Impact | Effort |
|---|---|---|---|
| 1 | **GPS transport tracking** — driver app (PWA), parent view, route replay | High — feature parity with Entab/Education Desk | 4 weeks |
| 2 | **AI suite extension** — auto-grading (objective Qs), predictive analytics (at-risk students), lesson-plan suggestions | High — unique in India | 6 weeks |
| 3 | **NEP Holistic Progress Card** (HPC) for primary classes (1–5) | High — CBSE mandate | 4 weeks |
| 4 | **Biometric / RFID / QR attendance integration** | Medium | 4 weeks |
| 5 | **Public REST API** — first-party API for third-party integrations (Tally, payment gateways, accounting) | Medium | 4 weeks |
| 6 | **White-label mobile app builder** — turnkey React Native shell, schools rebrand and publish | Medium | 8 weeks |
| 7 | **District / trust model** — for school groups and chains | Medium | 4 weeks |

### 11.4 P3 — Defer (until enterprise customer asks)

- **SOC 2 Type I/II** — ₹15–40L audit + ₹5L/yr. No Indian SMB school will ask.
- **ISO 27001** — same economics, slightly more globally recognized.
- **Native mobile app** — PWA + Web Push covers 90% of the use case for ₹0.
- **Hostel management depth** — partner with a Tally-style payroll add-on.
- **Payroll depth** — partner with Tally / Zoho Payroll.
- **Inventory / Asset management depth** — partner.
- **LMS / live classes** — partner with Teachmint or build with Daily.co / 100ms.

### 11.5 What We Will NOT Build

- **District-grade US K-12 features** (state reporting, IEPs, MTSS) — out of scope.
- **Higher-ed features** (research admin, course catalog, registrar workflow) — out of scope.
- **HR / payroll depth** — partner, don't rebuild.
- **Live class / video conferencing** — partner, don't rebuild.

---

## 12. Open Questions

1. **PWA push provider** — Firebase Cloud Messaging (FCM, free, ties to our stack) vs OneSignal (easier UI, $0–$99/mo). Recommend FCM.
2. **Brand split** — Should we market the product as "SNR Edu ERP" (a brand separate from Apex Public School) or as "Apex Public School Platform" (the school as the marquee customer)? Recommend a separate brand site at `snredu.com` with Apex as the flagship case study.
3. **Pilot expansion** — How many paying pilot schools do we need before launching publicly? Recommend 3 (Apex + 2 new) covering CBSE, ICSE, and state-board.
4. **First payment gateway** — Razorpay (India, ~1.8% fee, ₹0 setup) vs Cashfree (similar) vs PayU (similar). Recommend Razorpay.
5. **First SMS gateway** — MSG91 (India, ₹0.20/SMS, ₹500 setup) vs Twilio (international, ~$0.05/SMS, no setup). Recommend MSG91 for India.
6. **First WhatsApp provider** — Interakt (₹999/mo + ₹0.50/msg) vs Wati (similar) vs AiSensy (similar). Recommend Interakt.
7. **Hosting region** — Firebase project is `apex-public-school-portal` in `asia-south1` (Mumbai). Confirm and stay.
8. **DPDP grievance officer** — who? Recommend project owner as the named officer, with a dedicated email.
9. **When to publish pricing** — before or after the P0 list? Recommend after, to avoid re-pricing.
10. **Public roadmap** — should we publish a `/roadmap` page to build trust? Recommend yes — Trello-style Kanban is sufficient.

---

## 13. Sources & Evidence Log

| # | Source | URL | Data Extracted | Reliability |
|---|---|---|---|---|
| 1 | Gitnux — Top 10 School Management Software 2026 | https://gitnux.org/best/school-management-software/ | Vendor shortlist, comparison scoring (PowerSchool, Blackbaud, Fedena, SchoolERP) | High |
| 2 | Gitnux — Top 10 School ERP Software 2026 | https://gitnux.org/best/school-erp-software/ | ERP comparison (PowerSchool, Blackbaud K-12, SIS365, TeroTix, Fedena, OpenEduCat) | High |
| 3 | Gitnux — Best K12 School Management Software 2026 | https://gitnux.org/best/k12-school-management-software/ | K-12 vendor review (PowerSchool, Illuminate, Blackbaud, Infinite Campus, Frontline) | High |
| 4 | OpenEduCat — School Management Software Buyer's Guide 2026 | https://openeducat.org/articles/school-management-software-buyers-guide/ | Module baseline, feature list, vendor selection methodology | High |
| 5 | Zipdo — Best School Management System Software 2026 | https://zipdo.co/best-school-management-system-software/ | Vendor comparison scoring | High |
| 6 | IJONIS — School Software Comparison 2026 (DACH market) | https://ijonis.com/en/school-software-comparison | 22 German-speaking providers, GDPR context, pricing, AI trends | High |
| 7 | Gradelink — 15 Best School Management Software 2026 | https://gradelink.com/15-best-school-management-software-for-2026/ | Vendor categorization (Enterprise / Small / Mid-Market / LMS / International) | High |
| 8 | Koalendar — Best School Management Software 2026 | https://koalendar.com/blog/best-school-management-software | Module baseline, integration landscape, payment gateway list | High |
| 9 | Campus 24x7 — 10 Best School ERP Software in India 2026 | https://campus24x7.in/blogs/best-school-erp-india-2026 | India-specific top 10 (Campus 24x7, Entab, MyClassCampus, Fedena, Schoollog, Teachmint, EazyERP, SkoolBeep, MyClassboard, PowerSchool) | High |
| 10 | Fuzen — Fuzen vs Entab, Fedena, Teachmint, Vidyalaya 2026 | https://www.fuzen.io/posts/school-management-software-comparison-fuzen-vs-entab-fedena-teachmint | Detailed pricing comparison for India vendors | High |
| 11 | Techjockey — Best School ERP Platforms 2026 | https://www.techjockey.com/blog/erp-software-for-school | India pricing (Schoolknot, Fedena, EduplusCampus, Campus 365, Edunext) | High |
| 12 | Entab — Top 10 Best School ERP Software in India 2026 | https://www.entab.in/top-10-best-school-erp-software-in-india.html | India market analysis, NEP 2020 framing | High |
| 13 | Saashub — Fedena vs Teachmint comparison | https://www.saashub.com/compare-fedena-vs-teachmint | Fedena + Teachmint features and pricing | Medium |
| 14 | Clast.io — 7 Best School ERP Software 2026 | https://clast.io/blog/best-erp-software-for-schools-in-2026-top-7-systems-compared | Vendor scoring (Clast.io, Fedena, Alma, Classter, Infinite Campus, Entab, SchoolMint) | High |
| 15 | Entab — School ERP Software & SIS | https://www.entab.in/school-erp-software.html | Entab CampusCare features, NEP 2020, 2,500+ schools | High |
| 16 | RexoCampus — AI-Powered School ERP India | https://www.rexocampus.com/solutions/school-erp-software | India SMB market: 40+ modules, 500+ schools, mobile apps | Medium |
| 17 | MySmartSchool — School ERP Pricing Guide 2026 | https://mysmartschool.co.in/blog/school-erp-pricing-guide/ | Pricing model breakdown, TCO analysis | High |
| 18 | CodePex — School ERP Pricing in India 2026 | https://codepex.com/knowledge-base/school-erp-pricing-india-2026 | "Fair Price Manifesto", TCO analysis, hidden cost epidemic | High |
| 19 | Campus On Click — School ERP Pricing 2026 | https://campusonclick.co.in/blog/school-erp-software-pricing-in-2026 | Real TCO from 150+ implementations, 40–60% hidden cost premium | High |
| 20 | EduGradUP — School ERP Pricing | https://schoolsoftwareindia.com/pricing | Flat ₹12K/yr unlimited-students model | High |
| 21 | AI EDU ERP — School Management System Cost in India | https://aieduerp.com/school-erp-software/ai-pricing/ | ₹0–7.81/student/mo India pricing range | High |
| 22 | Vidya Nova — School ERP Pricing India TCO | https://vidyanova.com/blog/school-erp-pricing | 5-year TCO model for small/medium/large schools | High |
| 23 | Pathshala ERP — How to Evaluate School ERP Pricing | https://pathshalaerp.in/blog/how-to-evaluate-school-erp-pricing | "Growth penalty" analysis, per-student vs flat-fee | High |
| 24 | School ERP India — Pricing | https://schoolerpindia.com/pricing.php | India tiered pricing (Startup ₹5K → Enterprise Plus ₹30K+) | High |
| 25 | Lexmetech — School Management Software | https://www.lexmetech.com/products/school-management-software | Generic module list, 25-module school ERP scope | Medium |
| 26 | iSystem — School ERP Modules | https://isystemtechnologies.com/school-erp | India module list, biometric/RFID integration, GPS transport | Medium |
| 27 | Fuzen — School Management Software (full report) | https://www.fuzen.io/posts/school-management-software-comparison-fuzen-vs-entab-fedena-teachmint | Detailed feature comparison table | High |
| 28 | Government of India — Digital Personal Data Protection Act 2023 | https://www.meity.gov.in/data-protection-framework | DPDP Act text, children's data provisions, penalty structure | High |
| 29 | Government of India — NEP 2020 | https://www.education.gov.in/nep | NEP text, competency-based assessment, Holistic Progress Card | High |
| 30 | Firebase Documentation | https://firebase.google.com/docs | Firestore limits, security rules, FCM, hosting | High |
| 31 | Internal — `competitive-analysis-report.md` | (this repo) | SNR Edu ERP vs Education Desk 1:1 comparison | High |
| 32 | Internal — repo source code | (this repo) | Full feature inventory, architecture, data model, known gaps | High |

---

## 14. Uncertainty Notes

- **Entab CampusCare's actual pricing, deployment timeline, and technical stack are not fully public.** Some figures are based on aggregator data and customer reviews.
- **Teachmint's pricing is opaque** (sales-call-only). Per-student estimates are derived from community discussions and may be ±50% off.
- **Some Tier-3 Indian vendors have changed pricing in 2026** (promotional rates, COVID-era free trials, etc.). Quotes are point-in-time.
- **Razorpay / MSG91 / WhatsApp Business API** pricing in 2026 may shift as the RBI / Telecom Regulatory Authority of India updates guidelines.
- **DPDP Act enforcement specifics** are still being clarified by the Data Protection Board of India; some provisions may be amended in 2026–27.
- **Our project's actual production load** is not measured (Apex Public School is a single school, ~500 students). Multi-tenant cost projections assume Firebase auto-scale holds.
- **PWA push notification reach** on iOS Safari is still limited (iOS 16.4+ supports it, but the install-to-home-screen adoption is lower than Android). Real-world impact TBD.

---

_Report generated June 2026. All assessments based on publicly available information as of this date. Recommendations should be validated against internal product strategy and market conditions._
