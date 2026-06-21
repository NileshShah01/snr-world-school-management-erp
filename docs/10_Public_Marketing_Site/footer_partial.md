# Footer Partial — `footer.html`

> **Type:** Partial — shared footer
> **CMS-Driven:** Yes (school info, map, copyright)
> **Location:** `D:\Snredu\footer.html`
> **Plan ref:** `Plan/pages/partials/footer.md`
> **Date:** June 2026

---

## 1. Purpose

Shared footer for all public school pages: Google Maps embed, school info, links, contact, copyright.

---

## 2. Current Working State

### Content (54 lines)
- **Google Maps iframe** — `#footer-map-iframe` with `data-school-field="mapIframeUrl"`
- **4-column container**: School Info, Quick Links, More Links (DUPLICATE), Contact Info
- **Copyright line** — `data-school-field="copyright"`

### Data Attributes
- `data-school-field` — schoolName, tagline, address_short, address_full, phoneLabel, emailLabel, copyright, mapIframeUrl
- `data-i18n`, `data-i18n-attr`

---

## 3. Gaps & Mismatches

| Gap | Severity | Detail |
|---|---|---|
| "More Links" duplicates Quick Links | P2 | Both columns have identical links |
| No social media icons | P2 | Unlike contact.html, footer has no social icons |
| No WhatsApp click-to-chat | P2 | Missing |
| No "Admission Open" CTA | P2 | No conversion CTA |
| No privacy/terms links | **P1** | DPDP Act requires Privacy Policy + ToS |
| Copyright date static | P2 | Should auto-update year |
| No back-to-top button | P3 | Missing |

---

## 4. Perfect Version

1. **Unique "More Links"** — admission, schedule visit, download forms
2. **Social media icons** with real URLs
3. **WhatsApp CTA**
4. **Privacy Policy + Terms of Service** links (DPDP Act)
5. **Dynamic copyright year** via JS
6. **Back-to-top button**
