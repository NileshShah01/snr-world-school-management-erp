# `facilities.html` — Facilities Page

## Purpose
- Showcases the school's physical and digital infrastructure (smart classrooms, computer lab, sports ground, transport, CCTV, playground).
- Builds trust with parents evaluating infrastructure quality.

## File facts
- 298 lines, ~14 KB
- Has inline `<style>` for hero, slider, and gallery preview

## Scripts loaded
1. `/script.js`
2. Firebase 9.23.0 compat
3. `/js/firebase-config.js`
4. `/js/cms-settings.js`
5. Inline counter animation (lines 281-296)

## CMS-driven slots
| ID | Source | Purpose |
|---|---|---|
| `facilitiesHeroSubtitle` | `settings/general` | Hero subtitle |
| `facilitiesDescSmart` / `_Computer` / `_Sports` / `_Security` / `_Transport` / `_Playground` | `settings/general` | Per-facility description |
| `facilitiesGallerySliderTrack` (DOM) | `cms/facilitiesGallery` | Bottom gallery slider |
| `stat_students` / `_teachers` / `_classrooms` / `_years` | `settings/general.stats` | Counter stats |

## Hard-coded content
- 6 facility cards (Smart Class, Computer Lab, Sports, CCTV, Transport, Playground) with hard-coded `/images/...` paths
- 3 hard-coded images in `#facilitiesSliderTrack` (lines 114-122) — duplicated 4 times for infinite scroll effect
- 6 hard-coded images in `#facilitiesGallerySliderTrack` (lines 203-208)
- 8 years stat (line 228) — **inconsistent** with `school.html`/`about.html`/`academics.html` (8 years) and `footer.html` (2026 = 8 years from 2018). The "10 years" here is a **data bug**.
- 3 hard-coded "info" cards (Safe Campus, Learning, Sports)

## Gaps
- **`stat_years` data-target="10"** is wrong — school established 2018, current year 2026 = 8 years. Inconsistent with other pages.
- **6 facility images are hard-coded** in `facilities-hover` grid — should be CMS-driven via the `cms/facilities` collection (which `admissions.html` already uses for the same data).
- **Infinite-scroll slider duplicates the same 4 images** (lines 120-122) — visible pattern repetition, looks amateur
- **No video content** — most school websites now include 30-60s campus tour videos
- **No "Virtual Tour" / 360° view** — a differentiator for SMB schools
- **`background-attachment: fixed`** on hero (line 26) — disabled on iOS Safari, causes performance issues
- **No "Safety" detail page** — CCTV/security is mentioned but no proof (sample footage, certifications)
- **Inline counter animation duplicated** (same as 2 other pages)
- **No `aria-label`** on facility cards — accessibility gap

## Recommended plan
1. Fix the `stat_years` data-target to "8" (matches other pages).
2. Move facility cards to CMS (`cms/facilities` collection — already exists per `admissions.html`).
3. Replace duplicated slider images with CMS-loaded gallery of 12+ unique photos.
4. Add a "Campus Tour" video embed (YouTube/Vimeo via CMS URL).
5. Add a 360° virtual tour (Panoee / Kuula embed) for differentiation.
6. Remove `background-attachment: fixed` and use a static background with parallax via JS.
7. Extract inline counter animation into `cms-settings.js` (eliminate 3x duplication).
8. Add `aria-label` to all facility cards.
9. Add a "Safety & Compliance" subsection (fire NOC, building safety cert, child-safety policy).
10. Add structured data (`Place` schema) for local SEO.
