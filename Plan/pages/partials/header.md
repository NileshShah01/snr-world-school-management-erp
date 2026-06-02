# `header.html` — Site Header Partial

## Purpose
- Renders the global top navigation bar injected via `innerHTML` into every public page's `<div id="header">`.
- Single source of truth for: logo, school name, location, UDISE+reg #, and primary nav links.
- Loaded by `/script.js` (the public site's global script).

## Dependents
- Consumed by every public-facing page: `school.html`, `about.html`, `academics.html`, `admissions.html`, `facilities.html`, `gallery.html`, `contact.html`, `inquiry.html` (and any future static page).
- Hosted at `D:\Snredu\header.html` (relative path, served as `/header.html`).
- ID targets overridden at runtime by `js/cms-settings.js` from `schools/{SCH001}/settings/general`.

## Identity slots (CMS-overridable)
| ID | Field | Default text |
|---|---|---|
| `header-logo` | Logo image | `/images/ApexPublicSchoolLogo.png` |
| `header-school-name` | School name | "Apex Public School" |
| `header-school-location` | Short location | "Anjani Bazar" |
| `header-school-udise-reg` | UDISE + Reg # | "UDISE: 10171706503 \| Registration: 2111449" |
| `mobile-header-logo` | Mobile logo | same as header |
| `mobile-school-name` | Mobile name | "Apex Public School" |

## Hard-coded nav links
- Home (`./`), About, Academics, Admissions, Facilities, Gallery, Contact, Inquiry
- Student portal button → `portal/student-login.html`
- Admin portal button → `portal/admin-login.html`

## Gaps
- **No "Apply Now" or "Fee Structure" CTA** in main nav (only in hero CTAs).
- **No language toggle** (Hindi/English) — required for NEP 2020 + rural reach.
- **Hard-coded Apex UDISE** — must be removed for multi-tenant reuse (currently relies on `cms-settings.js` overwrite at runtime, which silently fails if CMS is down → user sees `UDISE: 10171706503` on every page).
- **No skip-to-content link** — accessibility blocker (WCAG 2.4.1).
- **No `aria-current="page"` on active link** — minor a11y issue.
- **Logo path is relative (`./images/...`)** which breaks on the public site when served from `https://school.com/` but works on `file://`. Recommend absolute `/images/...`.
- **Login buttons assume the user is at `/`** — on deep links they still resolve to `portal/student-login.html` (root-relative, OK), but a new tenant deployed at `tenant.apex.com/school/` would have the link pointing to the tenant root, not the platform root. Needs `<base href>` or absolute.

## Recommended plan
1. Replace relative `images/...` with absolute `/images/...` for logo and mobile logo.
2. Inject `data-school-field` attributes on identity slots so the CMS overwrite logic is declarative and testable.
3. Add a `lang-toggle` slot (placeholder, no JS yet) and a `main-content` skip link.
4. Add a `tenancy-aware base` resolution: read `window.SCHOOL_BASE` from `firebase-config.js` and prefix portal/landing links.
5. Keep Apex branding as visual fallback when CMS is unreachable; log a console warning.
