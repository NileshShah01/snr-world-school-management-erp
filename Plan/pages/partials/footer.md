# `footer.html` — Site Footer Partial

## Purpose
- Renders the global footer injected via `innerHTML` into every public page's `<div id="footer">`.
- Provides: embedded Google Map, 4-column link grid, contact info, copyright.
- CMS-overridable identity fields (overwritten at runtime by `js/cms-settings.js`).

## Dependents
- Same consumers as `header.html` (every public page).

## Identity slots (CMS-overridable)
| ID | Field | Default text |
|---|---|---|
| `footer-school-name` | School name | "Apex Public School" |
| `footer-school-tagline` | Tagline | "Quality education for a brighter future" |
| `footer-address-short` | Short address | "Anjani Bazar, Parsa, Saran" |
| `footer-phone` | Phone | "📞 8084243031" |
| `footer-email` | Email | "✉ Apexpublicschool61@gmail.com" |
| `footer-address-full` | Full address | "📍 Anjani Bazar, Parsa, Saran, Bihar 841219" |
| `footer-copyright` | Copyright line | "© 2026 Apex Public School. All Rights Reserved." |
| `footer-map-iframe` | Google Maps embed URL | hard-coded URL with dummy `pb=!1m18!...` params |

## Hard-coded links
- Quick Links: Home, About, Academics, Admissions
- More Links: Facilities, Gallery, Contact, Inquiry
- **No social links** (handled in `contact.html` instead)
- **No legal pages** (Privacy Policy, Terms, DPDP compliance page) — required for Indian DPDP Act 2023.

## Gaps
- **Google Maps `src` is hard-coded** with a generic placeholder URL (`pb=!1m18!...2zMjXCsDU5...`). It displays but is not a real embed. Must be replaced with the actual `maps.google.com` embed URL of the school (or a real school `pb=!1m18!...` string).
- **No Privacy/Terms links** — DPDP Act 2023 requires explicit data-handling notice (esp. for student photos, Aadhar, phone numbers).
- **No "Powered by SNR World" attribution** — would be good marketing for multi-tenant growth.
- **Phone/email are exposed as plain text** — spam scrapers will harvest. Recommend obfuscation or a contact-form CTA instead.
- **UDISE+ displayed in header but not footer** — inconsistent; CBSE/State reporting expects it visible in both.
- **Map iframe loads on every page even when not in viewport** — performance hit, especially on mobile. Add `loading="lazy"` (already there) and consider IntersectionObserver to skip rendering until visible.

## Recommended plan
1. Replace dummy Google Maps URL with a real embed for the school's coordinates.
2. Add a "Privacy Policy" link slot (placeholder until `privacy.html` is authored for DPDP compliance).
3. Add a hidden `data-school-field` annotation for each override target.
4. Add a "Powered by SNR Edu ERP" badge linking to `platform.html` (only on multi-tenant instances, not on Apex primary).
5. Move the map into a collapsible `<details>` for mobile so it doesn't dominate scroll.
