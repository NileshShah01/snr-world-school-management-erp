# `floating-button.html` — Floating CTA Buttons Partial

## Purpose
- Renders the floating vertical action button cluster injected via `innerHTML` into every public page's `<div id="floating-button">`.
- Provides 1-tap access to: Student login, Gmail compose, Inquiry form, WhatsApp chat.

## Dependents
- Same consumers as `header.html` (every public page).
- Hosted at `D:\Snredu\floating-button.html` (served as `/floating-button.html`).

## Buttons (hard-coded)
| Class | Target | Icon |
|---|---|---|
| `float-student` | `/portal/student-login.html` | `fa-user-graduate` |
| `float-email` | `https://mail.google.com/mail/?view=cm&to=apexpublicschool61@gmail.com&su=...` | `fa-envelope` |
| `float-inquiry` | `/inquiry.html` | `fa-file-lines` |
| `float-whatsapp` | `https://wa.me/918084243031` | `fa-whatsapp` |

## Gaps
- **Phone number `918084243031` and email `apexpublicschool61@gmail.com` are hard-coded** — must be CMS-overridable for multi-tenant reuse. Otherwise a tenant cannot use this partial without forking the file.
- **Gmail compose URL is hard-coded** — the `?to=` and `&su=` parameters will be wrong for any non-Apex tenant.
- **No phone-call button** (`tel:` link) — primary Indian SMB contact method, missing.
- **No "Back to top" button** — long pages (admissions, facilities) need one.
- **WhatsApp link uses `wa.me` (no pre-filled message)** — lead capture would be 5× better with a `?text=Hi%20I%20want%20to%20know%20about%20admissions%202026-27` query.
- **Z-index not set explicitly** — relies on `style.css` definition. If CSS fails to load, buttons vanish.
- **No collapse/expand behavior on mobile** — 4 buttons stacked vertically may overlap content. Add a "minimize" toggle.
- **Visual design appears to be a vertical column on the right edge** (per `float-btn-container` CSS). Verify on small screens.

## Recommended plan
1. Replace all hard-coded `apexpublicschool61@gmail.com` and `918084243031` with `data-tenant-*` attributes that the runtime populates from `firebase-config.js` + CMS.
2. Add a 5th button: `tel:` (phone-call) with a fallback `<a href="contact.html">` if `tel:` is unsupported.
3. Add a "Back to top" button (hidden until scroll > 400 px).
4. Add a `?text=` query to the WhatsApp link with the school's default message template (CMS-driven).
5. Add a "minimize" toggle on mobile (`<` / `>` chevron) that collapses the 4-button cluster into a single FAB.
6. Use a CSS variable `--fab-z: 1000;` and inject it inline so the buttons work even if `style.css` fails.
