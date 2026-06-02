# `school.html` — Public Home Page (Landing)

## Purpose
- Primary public landing page for school visitors & parents.
- Drives admissions inquiries (CTA, ticker, notice board, contact form indirect).
- Single source for the hero slider, school stats, principal message, and CMS-loaded dynamic blocks (events, birthdays, achievements, testimonials, gallery preview, home memories).

## File facts
- 331 lines, ~14 KB
- Static HTML + 2 CMS-injected content layers

## Scripts loaded (in order)
1. `/script.js?v=1.4` — global (loads header/footer/partials)
2. Firebase 9.23.0 compat (`firebase-app`, `firebase-firestore`)
3. `/js/firebase-config.js?v=1.4`
4. `/js/cms-settings.js?v=1.4` — populates CMS-driven slots

## CMS-driven slots (overwritten by `cms-settings.js`)
| ID/Element | Source | Purpose |
|---|---|---|
| `homeHeroTitle` / `homeHeroSubtitle` | `settings/general` | Hero headline |
| `heroSlider` (DOM) | `cms/heroSlides` collection | Image carousel |
| `admissionBadge` / `heroAdmissionBtn` | `settings/general.admissionStatus` | "Admission Open" badge |
| `dyn-marquee` | `settings/general.marquee` | Scrolling notice ticker |
| `homeIntroTitle` / `homeIntroText` / `homeIntroSubtext` | `settings/general` | About section |
| `birthdayContainer` | `students` where `dob` matches today | Birthday section (hidden by default) |
| `eventsContainer` | `cms/events` | Upcoming events |
| `stat_students` / `stat_teachers` / `stat_classrooms` / `stat_years` | `settings/general.stats` | Counter stats (data-target) |
| `homeFacilitiesTrack` | `cms/homeFacilities` | Facilities slider |
| `homeMemoriesGrid` | `cms/homeMemories` | Gallery preview |
| `achievementsContainer` | `cms/achievements` | Achievement cards |
| `testimonialsContainer` | `cms/testimonials` | Parent testimonials (hidden by default) |

## Hard-coded content
- Principal name: "Baby Kumari" (line 188)
- Static card fallbacks for Sports Excellence, Cultural Growth, Scientific Inquiry (lines 211-240)
- Safe & Supportive Campus cards (CCTV, Supervision, Medical Room)
- Static gallery fallback (hidden) at lines 271-280
- 3 achievement fallback cards (lines 290-304)
- Hard-coded dates: "Starting March 23, 2026", "March 30, 2026", "April 02, 2026" — should be CMS-driven

## Internal links
- `admissions.html` (CTA, Quick Link, footer CTA)
- `inquiry.html` (Quick Link, hero CTA)
- `about.html`, `academics.html`, `facilities.html`, `gallery.html`, `contact.html` (Quick Links)
- `portal/student-login.html` (Quick Link)
- `contact.html` (final CTA)

## JS dependencies (from `cms-settings.js` — not in this file)
- `loadHeroSlider()` → fills `#heroSlider`
- `loadEvents()` → fills `#eventsContainer`
- `loadHomeFacilities()` → fills `#homeFacilitiesTrack`
- `loadHomeMemories()` → fills `#homeMemoriesGrid`
- `loadAchievements()` → fills `#achievementsContainer`
- `loadTestimonials()` → fills `#testimonialsContainer`
- `loadBirthdays()` → fills `#birthdayContainer`
- `loadStats()` → updates counter `data-target` values
- Counter animation: inline `setTimeout` loop, 80 steps (lines 0–0 in this file — NOT in this file actually, the animation is in pages like `about.html` not `school.html`. School uses CSS reveal only)

## Security & auth
- Public page, no auth
- Read-only Firestore queries via `cms-settings.js`
- No PII exposed (school-level metadata only)

## Gaps
- **Counter animation missing on this page** (it's on `about.html`, `academics.html`, `facilities.html`). Stats may animate to 0 then stay 0 if JS fails.
- **Principal name "Baby Kumari" is hard-coded** in the page AND the CMS — duplicated truth, will drift.
- **`og:image` points to `nileshshah01.github.io/Apex-public-school-test-01/images/site-preview.jpg`** which is a separate GitHub Pages deployment (not the Firebase `apex-public-school-portal.web.app` project). The image won't resolve on the live site.
- **No Service Worker / PWA manifest** — `school.html` would be the natural entry point for PWA install. Missing = no offline capability, no "Add to Home Screen".
- **No structured data** (`application/ld+json` for `School` schema) — hurts Google for Education rich results.
- **Hero `<h1>` doesn't include "2026-27"** in static fallback — relies on CMS overwrite. If CMS down, SEO is weak.
- **Birthday & Testimonials sections are `<section class="hidden">`** — they exist but never show. Either un-hide or remove dead code.
- **`<p class="hero-loading-text">Loading...</p>` stays visible** if Firestore is slow — no skeleton styling.
- **3 CTA buttons to `inquiry.html`** (hero, quick link, CTA bottom) — good for conversion but the file `inquiry.html` is not in the repo (not read yet — needs verification). Likely a broken link.

## Recommended plan
1. Add inline counter animation to this page (copy from `about.html`).
2. Remove hard-coded "Baby Kumari" — use `id="aboutPrincipalName"` like `about.html` does.
3. Update `og:image` to a real, hosted image (Firebase Storage or public CDN).
4. Add `application/ld+json` School schema in `<head>` for SEO.
5. Add a Service Worker registration and `manifest.json` link to enable PWA install.
6. Either remove `birthdaySection` and `testimonialsSection` `hidden` flags, or wire them to a CMS toggle. Remove dead code.
7. Replace `Loading...` placeholder with a styled skeleton (image with shimmer CSS).
8. Verify `inquiry.html` exists; if not, change all 3 CTAs to `contact.html` or create a simple inquiry form page.
9. Add a `hreflang="hi"` alternate link to support future Hindi translation (NEP 2020).
