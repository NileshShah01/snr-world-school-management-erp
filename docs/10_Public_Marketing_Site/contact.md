# Contact Page — `contact.html`

> **Type:** Public marketing — contact + inquiry form
> **CMS-Driven:** Yes (contact info, inquiry form submission to Firestore)
> **Location:** `D:\Snredu\contact.html`
> **Plan ref:** `Plan/pages/public/contact.md`
> **Date:** June 2026

---

## 1. Purpose

School contact page with contact information display and a public inquiry form that writes to the `inquiries` Firestore collection.

---

## 2. Current Working State

### Sections (4)
1. **Page header** — `#schoolName` dynamic from CMS
2. **Contact Information** — 4 cards (Phone, Email, Address, Office Hours Mon–Sat 9:00–2:30)
3. **"Send Inquiry" form** — Name, Mobile, Message with validation
4. **Social links** — Facebook, Instagram, YouTube (all `href="#"` — placeholder)

### Form Details
| Field | Type | Validation |
|---|---|---|
| Name | text | Required |
| Mobile | text | 10-digit Indian phone number regex |
| Message | textarea | Required |
| Submit | button | Calls `inquiries` collection write |

Rate-limited via `SNR_RATE_LIMITERS.inquiry` — 2 per minute per mobile number.

### Data Attributes
- `data-i18n`, `data-i18n-attr` — bilingual text
- `data-school-field` — schoolName, phone, email, address_full, schoolLocation

### Working Logic
```
Form submit
  → Validate mobile (10 digits)
  → Check rate limiter (inquiry: 2/min/mobile)
  → Write to Firestore: /inquiries/{autoId}
    → {parentName, mobile, message, source:'website', status:'new', createdAt}
  → Show success toast
  → Rate limiter increments
```

---

## 3. Gaps & Mismatches

| Gap | Severity | Detail |
|---|---|---|
| Social links all `href="#"` | P2 | LinkedIn, Instagram, YouTube all placeholder |
| No email auto-response | P2 | Inquiry submitted but no confirmation email sent |
| No admin notification on new inquiry | P2 | No push/SMS/email to school admin |
| No Google Maps CMS field | P2 | Map is hardcoded iframe |
| No reCAPTCHA (meta tag empty) | P1 | Contact form can be spammed |
| No WhatsApp contact link | P2 | Social section has no WhatsApp CTA |
| Office hours not CMS-editable | P2 | Hardcoded "Mon–Sat 9:00–2:30" |

---

## 4. Competitor Comparison

| Feature | SNR WORLD | Education Desk | Fedena |
|---|---|---|---|
| Public inquiry form | ✓ → Firestore | ✓ | ✓ |
| Rate limiting | ✓ (client-side) | ✗ | ✗ |
| Admin notification | ✗ | ✓ (email) | ✓ (dashboard) |
| reCAPTCHA | ✗ (empty meta) | ✓ | ✓ |
| Social links | ✓ (placeholder) | ✓ | ✓ |
| Google Maps | ✓ (cms-driven iframe) | ✓ | ✓ |

**Upper Hand:** Rate limiting + Firestore integration is good. Missing reCAPTCHA and admin notifications are critical gaps.

---

## 5. Perfect Version

1. **reCAPTCHA v3** on inquiry form (prevent spam)
2. **Admin notification** — Cloud Function triggers email/SMS on new inquiry
3. **Auto-response email** to parent ("Thank you for your inquiry...")
4. **Real social URLs** via CMS (not `href="#"`)
5. **WhatsApp click-to-chat** button with school number
6. **Office hours CMS-editable**
7. **Google Maps iframe from CMS** (mapIframeUrl data-school-field)
8. **Multi-language acknowledgment** (EN/HI)
