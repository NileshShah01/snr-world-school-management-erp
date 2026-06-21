# School Homepage — `school.html`

> **Type:** Public marketing — homepage
> **CMS-Driven:** Yes (via `cms-settings.js` and `cms-admin.js`)
> **Location:** `D:\Snredu\school.html`
> **Plan ref:** `Plan/pages/public/school.md`
> **Date:** June 2026

---

## 1. Purpose

Main school website homepage. Serves as the public face for Apex Public School (and any other tenant school via CMS). Displays school info, notices, events, gallery, testimonials, achievements, and CTAs for admissions and portals.

---

## 2. Current Working State

### Sections (20 total)
1. **Hero Banner** — `#heroSlider` dynamic, school name/tagline, CTAs ("Admission Open 2026-27")
2. **Notice Board ticker** — `#dyn-marquee` with CMS-driven scrolling notices
3. **School Introduction** — `#homeIntroTitle`, `#homeIntroText`, `#homeIntroSubtext`
4. **Birthday Section** — `#birthdaySection` (hidden by default — CMS toggles)
5. **Upcoming Events** — `#eventsContainer` with 3 hard-coded fallback cards
6. **Quick Stats counter bar** — 300 students, 15 teachers, 12 classes, 8 years (hardcoded fallback, CMS overrides)
7. **Quick Links** — 8 nav-cards (About, Academics, Facilities, Gallery, Admissions, Contact, Inquiry, Student Portal)
8. **Principal's Message** — testimonial card with CMS-driven content
9. **Facilities Slider** — `#homeFacilitiesTrack` auto-scrolling
10. **Student Activities** — 3 cards (Sports, Cultural, Scientific)
11. **Safe Campus** — CCTV/Supervision/Medical info cards
12. **Gallery Preview** — `#homeMemoriesGrid` with 8 fallback images
13. **Achievements** — `#achievementsContainer` with 3 fallback premium cards
14. **Testimonials** — `#testimonialsSection` (hidden by default — CMS toggles)
15. **CTA** — "Admission Open 2026 to 2027"

### Data Attributes
- `data-snr-favicon="favicon.png"` — favicon from Firestore media
- `data-snr-media` — 10+ image sources
- `data-i18n` — text internationalization hooks
- `data-school-field` — school-level branding values

### Forms/CTAs
- **CTAs:** 5 main buttons: "Learn More" (About), "Explore" (Academics), "View Details" (Facilities), "Apply Now" (Admissions), "Student Portal"
- **Forms:** None directly on homepage
- **Inquiry connection:** "Inquiry Now" → `inquiry.html` (⚠️ FILE MISSING — 404 error)

### Working Logic Flow
```
Page load
  → schoolBootstrapReady resolves schoolId
  → cms-settings.js applyCMSSettings()
    → Loads hero slides → populates #heroSlider
    → Loads notices → #dyn-marquee ticker
    → Loads events → #eventsContainer
    → Loads gallery → #homeMemoriesGrid
    → Loads achievements → #achievementsContainer
    → Loads testimonials → #testimonialsSection
    → Loads staff → principal message
    → Loads stats → counter bar
    → Loads birthdays → #birthdaySection
  → Header.html + footer.html loaded via server-side include
  → Floating button.html loaded
```

---

## 3. Gaps

| Gap | Severity | Detail |
|---|---|---|
| Missing inquiry.html | **P0** | All "Inquiry" links lead to a 404 |
| Hardcoded stats fallback | P2 | Falls back to hardcoded numbers if CMS not loaded |
| No SEO meta tags managed | P2 | OG images use GitHub Pages URLs (broken) |
| Testimonials section hidden by default | P2 | Must be CMS-enabled to show |
| No structured data (Schema.org) | P2 | No LocalBusiness or School schema |
| Hero has no CTA for "Book Demo" | P1 | Only school-focused; no SaaS lead capture |
| No loading skeleton | P3 | Sections pop in as CMS loads — not smooth |

---

## 4. Mismatch Logic

- **Stat counter** uses both `data-target` animation AND CMS text replacement — the CMS text replaces the static counter but the animation runs on the original value. Conflicting UI patterns.
- **Events fallback** shows 3 hard-coded cards — but these cards are for Apex Public School specifically (with Bihar Museum, Science Centre, Republic Day imagery). A different tenant would show incorrect local event data.

---

## 5. Competitor Comparison

| Feature | SNR WORLD | Education Desk | Fedena | Classe365 |
|---|---|---|---|---|
| CMS-driven homepage | ✓ Full 12-page CMS | ✗ Static | ✗ Static | ✗ Static |
| Dynamic notice board | ✓ | ✓ | ✓ | ✓ |
| Event calendar on homepage | ✓ (CMS) | ✓ | ✓ | ✓ |
| Photo gallery on homepage | ✓ (CMS) | Partial | ✓ | Partial |
| Principal message editable | ✓ (CMS) | ✗ | ✗ | ✗ |
| Testimonials from CRM | ✓ (CMS) | ✗ | ✗ | ✗ |
| Multi-tenant branding | ✓ (data-school-field) | ✗ | ✗ | ✗ |
| Mobile-optimized | ✓ (responsive CSS) | ✓ (app) | ✓ (app) | ✓ (app) |

**Upper Hand:** SNR's **CMS-driven homepage** is unique — every school gets its own branded website managed from the same dashboard. Competitors like Fedena and Classe365 don't bundle a full public website CMS with their ERP.

---

## 6. Perfect Version

A perfect school homepage would:
1. Load in <2 seconds with skeleton placeholders
2. Show **tenant-specific branding** (logo, colors, principal photo, school name) — ✓ already works
3. Have a **Book Demo/Enquire Now** floating CTA for lead capture
4. Show **real-time stats** from Firestore (not hardcoded fallbacks)
5. Have **Schema.org School structured data** for SEO
6. Show **upcoming events countdown** instead of static cards
7. Integrate **WhatsApp click-to-chat** with actual school number
8. Have a **ADMISSIONS OPEN** badge with countdown to deadline

---

## 7. Files Wired

| File | Role |
|---|---|
| `school.html` | The page |
| `header.html` | Navigation + branding |
| `footer.html` | Footer + map + contacts |
| `floating-button.html` | WhatsApp/Gmail/Inquiry/Student-Login FABs |
| `js/firebase-config.js` | Multi-tenant resolver |
| `js/cms-settings.js` | CMS consumer (populates all dynamic content) |
| `js/media-loader.js` | Resolves data-snr-media images |
| `js/i18n.js` | EN/HI bilingual |
| `js/image-storage.js` | Image utilities |
| `style.css` | All styling |
| `js/services/payment-service.js` | (not used on homepage) |
