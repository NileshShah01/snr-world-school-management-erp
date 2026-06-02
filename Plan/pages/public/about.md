# `about.html` — About Page

## Purpose
- Tells the school's story: history, vision, mission, principal message, facilities, journey timeline, staff directory.
- Persuades prospective parents (vision/mission/principal message are trust signals).
- Hosts the "Meet Our Staff" section driven by CMS.

## File facts
- 248 lines, ~12 KB

## Scripts loaded
1. `/script.js` (header/footer/partials)
2. Firebase 9.23.0 compat
3. `/js/firebase-config.js`
4. `/js/cms-settings.js` — populates CMS-driven slots
5. Inline counter animation (lines 230-246)

## CMS-driven slots
| ID | Source | Purpose |
|---|---|---|
| `aboutVision` | `settings/general` | Vision text (default: "To become a leading school…") |
| `aboutMission` | `settings/general` | Mission text |
| `aboutPrincipalContent` (HTML) | `settings/general.principalMessage` | Principal message (multi-paragraph) |
| `aboutPrincipalName` | `settings/general.principalName` | "Baby Kumari" |
| `stat_students` / `stat_teachers` / `stat_classrooms` / `stat_years` | `settings/general.stats` | Counter data-targets |
| `staffSection` (hidden by default) | `cms/staff` | Staff directory cards |

## Hard-coded content
- Vision text (line 38-40)
- Mission text (line 45-47)
- Principal message fallback (lines 58-65)
- Principal name "Baby Kumari" (line 68)
- Stats: 300 students, 15 teachers, 12 classrooms, 8 years (lines 77-91)
- 6 facility cards (Smart Class, Computer Lab, Sports, CCTV, Transport, Playground) with hard-coded `/images/...` paths and Unsplash placeholders
- Timeline: 2018, 2020, 2023, 2026
- 6 static gallery images in "School Activities" section
- `staffSection` is `<section class="hidden">` (line 201) — dead by default

## Gaps
- **"About Us" hero section (line 14-19) has no CMS slot** — the headline "About Apex Public School" and "Quality Education with Discipline Since 2018" are hard-coded.
- **CCTV card uses Unsplash external image** (line 134) — should be local or CMS-driven for reliability.
- **Transport card uses Unsplash external image** (line 142) — same issue.
- **Timeline "2026 — Science Laboratory Planned" is hard-coded** — should be CMS-driven or made into a roadmap toggle.
- **`staffSection` is hidden by default** — staff directory never shows. Either remove dead code or wire to `cmsStaff` admin section.
- **Inline counter animation script is duplicated** in `academics.html` and `facilities.html` — should be in `script.js` or `cms-settings.js`.
- **No "Achievements" or "Awards" section** — page is missing social proof beyond the principal message.
- **Vision/Mission text is wrapped in `<p id="...">`, but the CMS overwrite uses `.textContent`** — works but loses any inline formatting.
- **No `lang` attribute on HTML** — line 2: `<html lang="en">` exists, good. But no `dir="ltr"` explicit.

## Recommended plan
1. Add CMS slots for the hero (`id="aboutHeroTitle"`, `id="aboutHeroSubtitle"`).
2. Replace 2 Unsplash images with local CMS images.
3. Move timeline into CMS (use a `cms/timeline` collection with year + event + date).
4. Remove `hidden` from `staffSection` (or add a CMS toggle).
5. Extract the inline counter animation into `cms-settings.js` (or a new `js/counters.js`) and remove the duplication.
6. Add an "Awards & Recognitions" section backed by `cms/achievements` (reuses school.html's section).
7. Add `application/ld+json` `AboutPage` + `Person` (principal) schema for SEO.
8. Add a "Download Brochure" CTA button (PDF from CMS).
