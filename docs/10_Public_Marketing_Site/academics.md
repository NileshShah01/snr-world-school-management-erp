# Academics Page — `academics.html`

> **Type:** Public marketing — academics overview
> **CMS-Driven:** Partial (curriculum focus areas)
> **Location:** `D:\Snredu\academics.html`
> **Plan ref:** `Plan/pages/public/academics.md`
> **Date:** June 2026

---

## 1. Purpose

Showcases school's academic structure, curriculum, subjects, teaching methodology, examination system, and educational activities.

---

## 2. Current Working State

### Sections (9)
1. **Page header** — CMS-driven title/subtitle
2. **Class Structure** — 6 cards (Play Group, Nursery, LKG, UKG, Class 1-5, Class 6-8)
3. **Subjects Offered** — 8 subject cards (English, Hindi, Maths, Science, Social Science, Computer, GK, Moral Education)
4. **Teaching Methodology** — 6 cards (Activity-based, Concept-based, Interactive, etc.)
5. **Academic Strength stats bar** — animated counters (data-target)
6. **Curriculum Overview tables** — `#academicsFocusPlay`, `#academicsFocusPrimary`, `#academicsFocusMiddle` (CMS-driven)
7. **Examination System** — static (Monthly Tests, Half Yearly, Annual, Continuous Assessment)
8. **School Academic Journey** — timeline (same as about.html, duplicated)
9. **Educational Activities** — static list (Science Exhibitions, Quiz, Tours, Sports, Cultural)

### Data Attributes
- `data-target` — counter animation
- **No data-snr-media, no data-i18n** — most content is static

### Forms/CTAs
- "Admission Inquiry" → `contact.html`

---

## 3. Gaps & Mismatches

| Gap | Severity | Detail |
|---|---|---|
| Class structure hardcoded to Play Group — Class 8 | P2 | Not CMS-editable; will break for K-12 schools with Class 9-12 |
| Subjects hardcoded to 8 specific subjects | P2 | Not CMS-driven; CBSE/ICSE/State have different subject sets |
| Teaching methodology static cards | P2 | Not editable via CMS |
| Examination system static | P2 | Only describes Apex's current system |
| Journey timeline duplicates about.html | P3 | DRY violation — same timeline in 2 files |
| No holiday calendar integration | P2 | Holidays section hidden by default |
| No NCERT/CBSE syllabus references | P2 | Doesn't mention compliance with national curriculum |
| No NEP 2020 mention | P1 | NEP is key differentiator for India 2026 |

---

## 4. Perfect Version

1. **CMS-driven class structure** — admin adds/removes class levels; system generates cards
2. **Subject library from Firestore** — subjects fetched from `schools/{id}/subjects`
3. **Teaching methodology editable** via CMS text
4. **Examination system reflects actual exam configuration** (terms, types from Firestore)
5. **Integrated holiday calendar** from CMS holidays
6. **Syllabus download** — links to CMS-uploaded syllabus PDFs per class/subject
7. **NEP 2020 badge** — "NEP 2020 Aligned School" with competency details
8. **CBSE/ICSE/State board reference** — dynamic per school's board
