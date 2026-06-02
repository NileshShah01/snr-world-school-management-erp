# `admissions.html` — Admissions Page

## Purpose
- Primary conversion page for parents considering enrollment.
- Lists admission process, required documents, fee structure, facility previews, FAQ.
- Drives both phone calls (Google Maps) and form submissions (`inquiry.html`).

## File facts
- 323 lines, ~14 KB
- Has the most inline `<style>` and inline scripts of any public page (FAQ toggle, facility panel toggle, mouse parallax)

## Scripts loaded
1. `/script.js`
2. Firebase 9.23.0 compat
3. `/js/firebase-config.js`
4. `/js/cms-settings.js`
5. Inline FAQ toggle (lines 308-313)
6. Inline mousemove parallax (lines 315-320) — performance concern

## CMS-driven slots
| ID | Source | Purpose |
|---|---|---|
| `admissionsHeaderTitle` | `settings/general` | Page hero |
| `admissionsHeaderSubtitle` | `settings/general` | "Play Group to Class 8" |
| `admissionsVisitText` | `settings/general` | Visit card text |
| `admissionsDoc1`–`6` | `settings/general` | Document names |
| `feesListAdmin` (DOM) | `cms/feeStructure` | Fee table rows |
| `facility_smart_class` / `_computer_lab` / `_sports` / `_security` / `_transport` (DOM) | `cms/facilities` | Facility photo grids |
| `admissionsCtaTitle` / `Subtitle` / `Btn` | `settings/general` | Final CTA |

## Hard-coded content
- 2 admission banner images (lines 120-121)
- 5 process cards (Visit School, Fill Form, Submit Documents, Pay Fees) — hard-coded
- 6 document cards
- 5 facility cards with `<div id="facility_xxx">` placeholders
- 3 FAQ items
- Google Maps link to `https://maps.app.goo.gl/57JbzsYH6jLvVf9b9` (line 128) — school-specific

## Gaps
- **No CMS slots for process steps** — "Visit School / Fill Form / Submit Documents / Pay Fees" hard-coded
- **No online fee calculator** — fee structure is read-only display; no "Calculate my fees" widget
- **No admission form on this page** — relies on `inquiry.html` (which is in repo but not analyzed yet)
- **FAQ has only 3 items** — should be 8-12 to address common parent concerns (transport cost, sibling discount, etc.)
- **Inline mousemove parallax** (lines 315-320) — runs on every mouse move, sets CSS custom property on body. Causes repaints on every page. Bad for mobile (no real benefit), and on scroll-locked pages. Should be debounced or removed.
- **Facility panel toggle** (lines 259-270) closes all panels before opening the clicked one — good UX but uses inline JS, should be in `script.js`
- **No "Download Admission Form" PDF** — most Indian parents expect to print and submit physically
- **Banner images are 450px max** — line 36-40 says `max-width: 450px` in inline CSS. Tiny on desktop. Should be full-width hero.
- **No deadline/session date** — "Admissions Open 2026-2027" is hard-coded
- **No "Limited Seats" urgency** — small schools use this to convert; missing here

## Recommended plan
1. Move the mousemove parallax into `script.js` with `{passive: true}` and a 60 FPS throttle. Or remove entirely.
2. Move facility panel toggle and FAQ toggle into `script.js`.
3. Add a "Calculate Your Fee" widget (class picker → shows annual + monthly + transport).
4. Add a "Download Admission Form" PDF link.
5. Expand FAQ to 8+ items, make it CMS-driven (`cms/admissionFAQ`).
6. Add admission process steps to CMS (current 4 are hard-coded).
7. Make banner images full-width or 800px max (not 450px).
8. Add structured data (`FAQPage` schema) for Google rich snippets.
9. Add a "Limited Seats: XX remaining" widget if data available.
10. Verify `inquiry.html` exists; add a fallback inline form on this page if not.
