# P1 — Go-to-Market Critical

> **Severity:** High — Must resolve before first paying customer signs up.  
> **Count:** 29 gaps  
> **Target resolution:** Before public launch / paid tier announcement.

---

## Self-Serve & Onboarding (4)

| # | Gap ID | Title | Category | Effort (h) | Resolution Steps |
|---|--------|-------|----------|------------|------------------|
| 1 | P1-ONB-01 | **No self-serve signup / trial flow** | Onboarding | 16 | 1. Build signup flow (school name, admin name, email, phone, password). 2. Create school document + admin user in transaction. 3. Auto-create default classes, sections, fee templates. 4. Redirect to guided onboarding wizard. |
| 2 | P1-ONB-02 | **No published pricing page** | Marketing | 6 | Create `pricing.html` with tiered plans (Free/Basic/Pro/Enterprise), feature comparison table, CTA to signup/demo. Update nav and footer links. |
| 3 | P1-ONB-03 | **Manual school provisioning only** | Operations | 8 | Implement self-service flow (P1-ONB-01). Deprecate manual `/provision.html`. Existing schools migrated to new structure. |
| 4 | P1-ONB-04 | **No trial expiry / conversion flow** | Retention | 6 | 1. Add `trialEndsAt` field to school doc. 2. Cloud Function (scheduled daily) checks expiry, disables features, sends upgrade emails/SMS. 3. Payment gate opens on upgrade. |

---

## Communication & Notifications (6)

| # | Gap ID | Title | Category | Effort (h) | Resolution Steps |
|---|--------|-------|----------|------------|------------------|
| 5 | P1-COM-01 | **No email service** | Notifications | 8 | 1. Integrate SendGrid or Mailgun. 2. Email templates: welcome, fee reminder, invoice, password reset, weekly digest. 3. Cloud Function for transactional email queue. |
| 6 | P1-COM-02 | **No push notifications (FCM)** | Notifications | 10 | 1. Implement Firebase Cloud Messaging. 2. Service worker for web push. 3. Notifications for: new homework, fee due, attendance marked, exam schedule. |
| 7 | P1-COM-03 | **No parent notification on new homework** | Notifications | 4 | 1. Add Cloud Function trigger on `homeworks.create`. 2. Push notification + email + SMS (if gateway integrated) to parent linked to student. |
| 8 | P1-COM-04 | **No parent notification on attendance** | Notifications | 4 | Same pattern as P1-COM-03. Trigger on `attendance.create` where status = absent. Notify parent with subject, date, time. |
| 9 | P1-COM-05 | **No parent notification on fees** | Notifications | 4 | Trigger on fee due date approaching (scheduled function). Notify parent 7, 3, 1 day before due. Also notify on payment success. |
| 10 | P1-COM-06 | **No multi-language auto-response to inquiries** | CRM | 6 | Auto-respond to inquiry form submissions via email/SMS in English + Hindi (detect language or user preference). Template: "Thank you for your interest. We will contact you within 24 hours." |

---

## Student / Parent Experience (5)

| # | Gap ID | Title | Category | Effort (h) | Resolution Steps |
|---|--------|-------|----------|------------|------------------|
| 11 | P1-SPX-01 | **Weak student/parent authentication** | Security | 6 | Replace phone+name login with: (a) OTP-based login via SMS/email, or (b) parent portal with proper password. Link parent to student via verified relation. |
| 12 | P1-SPX-02 | **No mobile app / PWA** | Platform | 12 | Convert web app to PWA: service worker, manifest.json, offline fallback page, app install prompt. Alternatively build Flutter/React Native wrapper. |
| 13 | P1-SPX-03 | **No bilingual UI (Hindi)** | i18n | 20 | 1. Audit existing i18n.js — ~30% keys translated. 2. Complete Hindi translation for all UI strings. 3. Add language switcher in header. 4. Store preference in localStorage and user profile. |
| 14 | P1-SPX-04 | **No 404 handling** | UX | 2 | Create custom 404.html with brand styling, navigation links, and search bar. Configure Firebase Hosting redirects to 404.html. |
| 15 | P1-SPX-05 | **No loading skeletons on portal pages** | UX | 6 | Replace blank/empty states during Firestore reads with skeleton loaders. Apply to: dashboard, student list, fees page, attendance page. |

---

## Academic / Compliance (4)

| # | Gap ID | Title | Category | Effort (h) | Resolution Steps |
|---|--------|-------|----------|------------|------------------|
| 16 | P1-ACA-01 | **No NEP 2020 report card templates** | Academics | 8 | Create report card template compliant with NEP 2020: competency-based grading, holistic progress card (HPC), 3-language formula, co-scholastic areas. |
| 17 | P1-ACA-02 | **No CBSE/ICSE report card templates** | Academics | 6 | Create format-specific templates for CBSE (Continuous Comprehensive Evaluation) and ICSE (Indian Certificate of Secondary Education) report cards. |
| 18 | P1-ACA-03 | **No UDISE+ export** | Compliance | 8 | 1. Map internal data model to UDISE+ fields. 2. Build export to CSV/Excel in UDISE+ format. 3. Add bulk data validation before export. 4. Generate UDISE+ XML for upload. |
| 19 | P1-ACA-04 | **Hardcoded demo data in dashboards** | UX | 4 | Remove all hardcoded demo/lorem-ipsum data from admin dashboard cards, charts, and tables. Replace with real Firestore queries or meaningful empty states. |

---

## Marketing & Branding (5)

| # | Gap ID | Title | Category | Effort (h) | Resolution Steps |
|---|--------|-------|----------|------------|------------------|
| 20 | P1-MKT-01 | **No SEO meta tags managed per page** | Marketing | 4 | Add dynamic `<title>`, `<meta name="description">`, Open Graph tags to all pages. Use a meta-tag manager object per page path. |
| 21 | P1-MKT-02 | **No demo video (Rick Roll instead)** | Marketing | 3 | Replace the Rick Roll YouTube link with a real product demo video. Produce 2–3 min screencast. Embed on homepage and platform.html. |
| 22 | P1-MKT-03 | **No customer testimonials on platform.html** | Marketing | 4 | Add testimonials section with: photo, name, school name, quote. Use Firestore `testimonials` collection for CMS management. |
| 23 | P1-MKT-04 | **Inconsistent branding (4 brand names)** | Branding | 6 | Audit all pages for brand name usage. Pick one: SmartSchool, Snredu, SNREDU, SmartEdu. Standardize across logo, title tags, favicon, footer, colors. |
| 24 | P1-MKT-05 | **sitemap.xml has only 10 URLs** | SEO | 2 | Regenerate sitemap.xml with all public-facing pages (min 25 URLs). Submit to Google Search Console. |

---

## Monitoring & Reliability (4)

| # | Gap ID | Title | Category | Effort (h) | Resolution Steps |
|---|--------|-------|----------|------------|------------------|
| 25 | P1-MON-01 | **No error tracking (Sentry/Crashlytics)** | Monitoring | 4 | Integrate Sentry for JavaScript. Add `Sentry.init()` in main app. Configure source maps. Set up alerting for unhandled errors. |
| 26 | P1-MON-02 | **No analytics events** | Analytics | 6 | Integrate Google Analytics 4 (GA4). Track key events: signup, login, fee payment, report card download, inquiry submit. |
| 27 | P1-MON-03 | **No CSP headers** | Security | 2 | Add Content-Security-Policy header in firebase.json headers config. Fix existing typo `wss://*.firebaseio.io` → `wss://*.firebaseio.com`. |
| 28 | P1-MON-04 | **No uptime monitoring** | Reliability | 2 | Set up Better Uptime or Upptime (free) to monitor public pages. Configure Slack/email alerts for downtime. |

---

## Payment & Commerce (1)

| # | Gap ID | Title | Category | Effort (h) | Resolution Steps |
|---|--------|-------|----------|------------|------------------|
| 29 | P1-PAY-01 | **No published pricing / payment plan** | Revenue | 8 | 1. Design pricing tiers. 2. Create pricing.html. 3. Integrate payment gateway (see P0-INT-01). 4. Build upgrade flow from trial to paid. 5. Invoice generation. |

> **Note:** G-INT-01 (Payment Gateway), G-INT-02 (SMS Gateway), and G-INT-03 (WhatsApp API) are P0 gaps tracked in P0_Blockers.md but are also GTM-critical.

---

## Summary

| Sub-category | Count | Est. Effort (h) |
|--------------|-------|-----------------|
| Self-Serve & Onboarding | 4 | 36 |
| Communication & Notifications | 6 | 36 |
| Student / Parent Experience | 5 | 46 |
| Academic / Compliance | 4 | 26 |
| Marketing & Branding | 5 | 19 |
| Monitoring & Reliability | 4 | 14 |
| Payment & Commerce | 1 | 8 |
| **Total** | **29** | **185** |
