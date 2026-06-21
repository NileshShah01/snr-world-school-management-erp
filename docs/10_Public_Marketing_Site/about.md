# About Page — `about.html`

> **Type:** Public marketing — about the school
> **CMS-Driven:** Yes (hero, vision, mission, principal message, staff, journey)
> **Location:** `D:\Snredu\about.html`
> **Plan ref:** `Plan/pages/public/about.md`
> **Date:** June 2026

---

## 1. Purpose

School "About Us" page. Covers school introduction, vision/mission, principal's message, academic strength stats, facilities overview, school journey timeline, staff section, and activities gallery.

---

## 2. Current Working State

### Sections (10)
1. **About Hero** — `#aboutHeroSection` CMS-driven
2. **School Introduction** — static text (Play Group to Class 8, Anjani Bazar, Parsa, Saran)
3. **Vision & Mission** — 2 cards editable via CMS
4. **Principal's Message** — Baby Kumari, CMS-driven content + photo
5. **Academic Strength stats bar** — animated counters
6. **Facilities hover panel** — 6 facilities (Smart Class, Computer Lab, Sports, CCTV, Transport, Playground)
7. **Our Journey timeline** — 2018 / 2020 / 2023 / 2026 (static)
8. **School Activities gallery** — 6 images with data-snr-media
9. **Staff section** — `#staffSection` (hidden by default, CMS-driven)
10. **CTA** — "Apply Now" → `admissions.html`

### Data Attributes
- `data-snr-media` — 10 images (hero, activities)
- `data-target` — stat counters
- `data-i18n` — text hooks

### Forms/CTAs
- "Apply Now" → `admissions.html`
- No forms on this page

---

## 3. Gaps & Mismatches

| Gap | Severity | Detail |
|---|---|---|
| Staff section hidden by default | P2 | Must be CMS-enabled to show |
| Journey timeline hardcoded | P2 | Not CMS-editable (2018/2020/2023/2026 dates) |
| No principal photo CMS field | P2 | Principal message section has no image placeholder |
| Static introduction text | P2 | "Play Group to Class 8" is Apex-specific — not tenant-generic |
| No school leadership beyond principal | P2 | No head boy/girl, prefects, or management committee |
| No accreditation badges | P2 | No CBSE/ICSE/State board logos or affiliation numbers |

---

## 4. Competitor Comparison

| Feature | SNR WORLD | Education Desk | Fedena |
|---|---|---|---|
| CMS about hero | ✓ | ✗ | ✗ |
| History timeline | ✓ (static) | ✗ | ✗ |
| Staff directory | ✓ (CMS, hidden) | ✓ | ✓ |
| Principal message | ✓ (CMS) | ✗ | ✗ |
| Facilities grid | ✓ (6 items) | ✓ | ✓ |
| SEO optimization | Partial | ✗ | ✗ |

**Upper Hand:** CMS-driven about page is rare among school ERPs. Most competitors have a static, one-time-designed about page.

---

## 5. Perfect Version

1. CMS-editable timeline (add school milestones dynamically)
2. Staff show by default (admin toggles individual visibility)
3. Accreditation/affiliation badges (CBSE/ICSE/State with affiliation no.)
4. School management committee section
5. Video tour embed (YouTube)
6. Downloadable school brochure (PDF) via CMS upload
7. Schema.org `EducationalOrganization` structured data
