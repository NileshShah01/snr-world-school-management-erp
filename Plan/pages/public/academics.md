# `academics.html` — Academics Page

## Purpose
- Lists the school's class structure (Play Group → Class 8), subjects taught, teaching methodology, examination system, and academic journey.
- Reassures parents about the curriculum.

## File facts
- 211 lines, ~9 KB
- Most content is static (the school is Play-8, which is unlikely to change)
- Counter animation duplicated inline (lines 193-209)

## Scripts loaded
1. `/script.js`
2. Firebase 9.23.0 compat
3. `/js/firebase-config.js`
4. `/js/cms-settings.js`
5. Inline counter animation

## CMS-driven slots
| ID | Source | Purpose |
|---|---|---|
| `academicsHeaderSubtitle` | `settings/general` | Hero subtitle |
| `academicsFocusPlay` / `academicsFocusPrimary` / `academicsFocusMiddle` | `settings/general` | Per-level focus text |
| `academicsExam1` / `2` / `3` / `4` | `settings/general` | Exam types (Monthly, Half-Yearly, Annual, Continuous) |
| `academicsCtaTitle` / `Subtitle` / `Btn` | `settings/general` | Final CTA |
| `holidaysSection` (hidden by default) | `cms/holidays` | Holiday calendar |

## Hard-coded content
- 6 class cards (Play Group, Nursery, LKG, UKG, Class 1-5, Class 6-8)
- 8 subject cards (English, Hindi, Math, Science, Social Science, Computer, GK, Moral Ed)
- 6 methodology cards (Activity-Based, Concept-Based, etc.)
- 4 exam type cards
- Static timeline (2018, 2020, 2023) — missing 2026 entry that `about.html` has
- 5 educational activities cards
- Holiday section is `class="hidden"` (line 169) — dead by default

## Gaps
- **No per-subject detail page or syllabus PDF link** — parents/parents can't download class syllabus
- **No CBSE/State board alignment** — the page implies local/state board but doesn't say which
- **Holiday section hidden by default** — same issue as `about.html` staff section
- **Static timeline** (lines 152-154) is incomplete vs. `about.html` (missing 2026 "Science Laboratory Planned")
- **Counter animation duplicated** inline — same 17-line script as `about.html`
- **No "Academic Calendar"** PDF download CTA
- **No "Results" or "Toppers" highlight** — academic page is missing social proof
- **Subject cards are icon-only** — no description, no teacher attribution

## Recommended plan
1. Add a per-subject detail expand/collapse (or link to syllabus PDF in CMS).
2. Add a "Curriculum Alignment" badge: "Aligned with SCERT Bihar / NCERT Framework" (CMS-driven).
3. Add "Academic Toppers" section backed by `cms/academicToppers` collection.
4. Add "Download Academic Calendar" CTA (PDF in CMS).
5. Move timeline into CMS and sync with `about.html`.
6. Remove inline counter animation; centralize in `cms-settings.js`.
7. Add structured data (`Course` schema) for SEO.
8. Un-hide `holidaysSection` (or remove dead code).
