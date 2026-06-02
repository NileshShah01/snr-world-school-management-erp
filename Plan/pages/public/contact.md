# `contact.html` — Contact Page

## Purpose
- Single page combining contact info (phone, email, address, hours) and a contact form that writes to `inquiries` collection in Firestore.
- The form is the school's primary lead-capture mechanism (alternative to phone/WhatsApp).

## File facts
- 337 lines, ~15 KB
- Most self-contained of public pages (form is inlined, not loaded from a separate JS)

## Scripts loaded
1. `/script.js`
2. Firebase 9.23.0 compat
3. `/js/firebase-config.js`
4. `/js/cms-settings.js`
5. Inline form submit handler (lines 282-324)
6. Inline mousemove parallax (lines 329-335) — performance concern

## CMS-driven slots
| ID | Source | Purpose |
|---|---|---|
| `contactHeaderTitle` / `Subtitle` | `settings/general` | Hero |
| `dyn-phone` (class) | `settings/general` | Phone display |
| `dyn-email` (class) | `settings/general` | Email display |
| `contactAddress` | `settings/general` | Full address |

## Hard-coded content
- Phone "8084243031" (line 190) — also in CMS via `.dyn-phone` class
- Email "Apexpublicschool61@gmail.com" (line 196) — also in CMS
- Address "Anjani Bazar / Near SBI Branch / Parsa, Saran / Bihar 841219" (lines 202-207)
- Office hours: "Monday – Saturday, 9:00 AM – 2:30 PM" (lines 213-215)
- 3 social links: Facebook, Instagram, YouTube (lines 265-267) — all `href="#"` — **dead links**

## Form (`#contactForm`)
- Fields: `con_name`, `con_mobile`, `con_message`
- Client-side validation: mobile must be 10 digits (numeric)
- On submit, writes to Firestore `inquiries` collection with fields:
  ```
  parent: <name>
  student: "N/A (General Contact)"
  mobile: <10 digits>
  class: "N/A"
  village: "N/A"
  message: <text>
  status: "New"
  submittedAt: serverTimestamp()
  ```
- Shows success/error status box (`#con_status`)

## Gaps
- **3 social media links are `href="#"`** — broken. They should link to actual Facebook/Instagram/YouTube pages or be removed.
- **Form is "General Contact" only** — no class selector, no "Apply for Class X" option. The school uses `inquiry.html` (separate page) for actual admissions.
- **No CAPTCHA** — form is spammable. Firebase App Check not configured.
- **No reCAPTCHA / honeypot** — easy target for spam bots that will pollute `inquiries` collection.
- **Mousemove parallax** (lines 329-335) — sets `background-position` on every mousemove = full repaint. Worse than `admissions.html` because it targets body. Should be debounced or removed.
- **No email/SMS notification to school** — form data sits in Firestore and nothing else. School owner must log in to admin to see it. No "send_email" Cloud Function trigger.
- **No rate limiting** — client-side only. A bot can submit 10,000 entries in minutes.
- **Phone validation is too loose** — `isNaN(mobile)` passes for "0000000000" or "1111111111". Should validate against real Indian mobile prefixes (6, 7, 8, 9).
- **`parent:`, `student:`, `class:`, `village:`** — wrong field names for a *contact* form (these are admission inquiry fields). Field model is leaky.
- **No CSRF protection** — N/A for static site but should consider Firebase App Check.

## Recommended plan
1. Replace `#` social links with real URLs (or remove the "Follow Us" section).
2. Add a Firebase Cloud Function trigger on `inquiries` collection create → send email to school + SMS via Twilio/MSG91.
3. Add Firebase App Check (reCAPTCHA v3) to the form's submit handler.
4. Add a honeypot field (`<input name="website" class="hidden">` — bots fill it, humans don't).
5. Add client-side rate limiting (debounce submit button + disabled state for 30s after submit).
6. Improve phone validation: `/^[6-9]\d{9}$/` regex.
7. Remove mousemove parallax or debounce to 60ms / use `requestAnimationFrame`.
8. Add 3 more form fields: `childName` (optional), `classApplying` (dropdown), `preferredContact` (call/WhatsApp/email).
9. Rename fields to match `inquiries` schema (parent → contactName, mobile → phone, etc.) — fix the leaky field model.
10. Add structured data (`ContactPage` schema).
