# Admissions Page — `admissions.html`

> **Type:** Public marketing — admissions information
> **CMS-Driven:** Partial (fee structure, facility images)
> **Location:** `D:\Snredu\admissions.html`
> **Plan ref:** `Plan/pages/public/admissions.md`
> **Date:** June 2026

---

## 1. Purpose

School admissions page with process documentation, required documents, fee structure, facility galleries, and admission FAQ.

---

## 2. Current Working State

### Sections (7)
1. **Page header** + admission banner row (2 CMS banners with data-snr-media)
2. **Admission Process** — 4 cards (Visit School / Fill Form / Submit Documents / Pay Fees) — links to `inquiry.html` (MISSING) and Google Maps
3. **Required Documents** — 6 items (Aadhar, Birth Certificate, Photos, TC, Previous Result, Migration)
4. **Fee Structure table** — CMS-driven (`#feeStructureSection`), fallback "Loading fee structure..."
5. **Facilities for Students** — 5 expandable toggle-panels with CMS image galleries
6. **Admission FAQ** — 3 collapsible FAQs (static)
7. **CTA** → `contact.html` "Admission Inquiry"

### Data Attributes
- `data-snr-media` — 2 banner images
- `aria-expanded` — toggle panels for facility galleries

### Forms/CTAs
- "Admission Inquiry" → contact.html
- Links to `inquiry.html` (MISSING — 404 error)
- Links to Google Maps (school location)

---

## 3. Gaps & Mismatches

| Gap | Severity | Detail |
|---|---|---|
| inquiry.html MISSING | **P0** | All "Fill Form" links go to inquiry.html which doesn't exist |
| Fee table shows "Loading fee structure..." | P2 | No CMS content loaded for fee → shows persistent loading |
| Admission process mentions "Pay Fees" before even applying | P2 | Wrong order — pay after admission, not before filling form |
| No online admission form | **P1** | No embedded admission form; redirects to missing page |
| FAQ is static (3 items) | P2 | Not CMS-editable |
| No RTE 25% quota mention | P1 | RTE quota is mandatory for Indian private schools |
| No age eligibility criteria | P2 | Not documented per class level |
| No TC (Transfer Certificate) process | P2 | No section on how to obtain TC |
| No admission timeline/deadline | P2 | "Admission Open 2026-27" but no closing date |

---

## 4. Competitor Comparison

| Feature | SNR WORLD | Education Desk | Fedena | Classe365 |
|---|---|---|---|---|
| Online admission form | ✗ (404 link) | ✓ | ✓ | ✓ |
| Fee structure display | ✓ (CMS) | ✓ | ✓ | ✓ |
| Required documents list | ✓ (static) | ✓ | ✓ | ✓ |
| Facility gallery | ✓ (expandable) | ✗ | ✗ | ✗ |
| FAQ section | ✓ (static, 3 items) | ✓ | ✓ | ✓ |
| RTE quota tracking | ✗ | ✗ | ✗ | Partial |
| Online application tracking | ✗ | ✗ | ✓ | ✓ |

**Upper Hand:** Facility gallery expansion with CMS images is unique. Fee structure from CMS is good.

---

## 5. Perfect Version

1. **Working online admission form** posting to `admissionApplications` collection
2. **RTE 25% quota section** with eligibility criteria + application link
3. **CMS-editable FAQ** (admin adds Q&A pairs)
4. **Age eligibility grid** (Class → Min Age → Max Age as of March 31)
5. **Admission timeline** with CMS-controlled dates
6. **Downloadable admission form** (PDF)
7. **Merit list / shortlist** for competitive classes
8. **TC application workflow** for outgoing students
9. **Schema.org `EducationEvent`** structured data
