# Roadmap — SNR Edu ERP

> Prioritized plan from P0 (ship-blockers) to P3 (defer).
> Effort estimates assume 1-2 senior devs, no new hires.
> See `Plan/01-gaps.md` for full gap details and `Plan/pages/*.md` for per-page context.
> See `market-research-2026.md` for the competitive analysis driving priorities.

---

## P0 — Ship-Blockers (Weeks 1-4)

> These MUST be done before any production launch to Apex or any new tenant.

### Milestone: "Secure & Compliant" (2 weeks)

#### Security
1. **🔒 Re-enable admin auth guards** in `js/admin-auth.js` (uncomment + harden)
   - Owner: Backend lead
   - Effort: 2-3 days
   - Acceptance: Visiting `/portal/admin-dashboard.html` without auth → redirect to `/portal/admin-login.html`
2. **🔒 Migrate student auth to Firebase Phone (OTP)**
   - Files: `portal/student-login.html`, `js/student-auth.js`
   - Effort: 5-7 days
   - Acceptance: Login requires OTP sent to phone, not just name match
3. **🔒 Remove `/provision.html` from public hosting**
   - Add `firebase.json` rewrite to redirect `/provision.html` → `/404.html`
   - Move logic to `scripts/provision-multi-school.js` (Node.js, runs locally)
   - Effort: 0.5 day
4. **🔒 Tighten Firestore rules** to least-privilege
   - File: `firestore.rules`
   - Apply role-based access, school-id scoping, field-level validation
   - Effort: 3-5 days
   - Acceptance: Unauthenticated users can only read `schools/{id}/settings/general` and `cms/*` public collections
5. **🔒 Add PII redaction** on student profile
   - File: `portal/student-dashboard.html` (profile section)
   - Effort: 1-2 days
   - Acceptance: Aadhar shows last 4 only; phone/address require tap-to-reveal with 5s auto-hide

#### Privacy / DPDP
6. **📜 Create `privacy.html`**
   - Privacy policy, data collected, contact info, DPDP compliance statement
   - Link from footer of every page
   - Effort: 2-3 days (mostly content writing)
7. **📜 Add consent checkbox** to admission form
   - Files: `portal/admin-dashboard.html` (admission section), `js/erp-admission.js`
   - Store `consentGiven: true` + `consentTimestamp` on student record
   - Effort: 1 day
8. **📜 Add `dpoEmail` / `dpoPhone` to school settings** + display in footer
   - File: `footer.html`, `js/cms-settings.js`
   - Effort: 0.5 day

#### Critical UX
9. **🛠️ Remove 6 "Module Under Construction" placeholders** from admin sidebar
   - File: `portal/admin-dashboard.html` (lines 7929-8048)
   - Either remove from sidebar, hide behind feature flag, or implement MVP
   - Effort: 1 day
10. **🛠️ Fix duplicate "FEES MANAGEMENT" sidebar entry** (lines 181-207)
    - Delete the shorter entry
    - Effort: 0.25 day
11. **🛠️ Rebrand "Nexorasoftagency"** to "SNR Edu ERP" / "SNR World" everywhere
    - Files: `portal/super-admin.html`, `portal/super-admin-pro.html`, `portal/super-admin-pro.js`
    - Effort: 0.5 day
12. **🛠️ Verify/create `inquiry.html`, `staff.html`, `holidays.html`**
    - 3 missing files referenced from public pages and student portal
    - Effort: 1-2 days (create minimal versions)

#### Critical Integrations (P0)
13. **💳 Integrate Razorpay payment gateway**
    - Files: `js/erp-fees.js`, `js/services/payment-service.js`
    - Add "Pay Now" button to student fees section
    - Webhook via Cloud Function to mark payment received
    - Effort: 5-7 days
14. **📱 Integrate MSG91 SMS gateway**
    - For: contact form submissions, fee reminders, attendance alerts
    - Cloud Function on `inquiries` + `payments` collection writes
    - Effort: 3-5 days

### Milestone: "Demo Ready" (2 weeks after Secure & Compliant)

15. **🎨 Add structured data** (`application/ld+json`) to public pages
    - `School`, `FAQPage`, `Course`, `Organization` schemas
    - Effort: 2-3 days
16. **🎨 Add favicon + meta tags** to all pages
    - Effort: 0.5 day
17. **🎨 Fix `og:image`** in `school.html` (line 18)
    - Use a real hosted image
    - Effort: 0.25 day
18. **🎨 Fix `data-target="10"`** on `facilities.html` (line 228)
    - Change to "8" to match other pages
    - Effort: 0.1 day
19. **🎨 Replace `#` social links** on `contact.html` (lines 265-267)
    - Use real URLs or remove section
    - Effort: 0.25 day
20. **🛠️ Remove dead `<section class="hidden">` blocks**
    - 6 dead sections (birthday, testimonials, staff, holidays, important links, attendance)
    - Wire to CMS toggles OR remove
    - Effort: 1 day

### P0 Acceptance Criteria
- [ ] No P0 security gap exists
- [ ] Privacy policy is live
- [ ] Razorpay payment flow works end-to-end for at least one tenant
- [ ] SMS notifications fire on contact form submit and fee payment
- [ ] No "Under Construction" UI in production
- [ ] Branding is consistent across all pages
- [ ] All broken internal links resolve
- [ ] Lighthouse score ≥ 80 (mobile)

---

## P1 — Go-to-Market Critical (Weeks 5-12)

> Required to acquire the first 5-10 paying tenants beyond Apex.

### Milestone: "Multi-Tenant Ready" (4 weeks)

21. **🔧 Multi-tenant cleanup**
    - Remove all hard-coded Apex values from `header.html`, `footer.html`, `floating-button.html`, `contact.html`
    - Add `data-school-field` attributes; populate from `firebase-config.js` + CMS
    - Effort: 3-5 days
22. **🔧 Centralize inline counter animation** in `js/cms-settings.js`
    - Remove from `about.html`, `academics.html`, `facilities.html`; add to all 4 stat-bar pages
    - Effort: 1 day
23. **🔧 Standardize Firebase SDK to 9.23.0** across all pages
    - Files: `portal/admin-login.html` (currently 8.10.0), `provision.html` (8.10.1)
    - Effort: 1-2 days
24. **🔧 Add Firebase App Check (reCAPTCHA v3)**
    - To login pages, contact form, add-school form
    - Effort: 2-3 days
25. **🔧 Add rate limiting** on auth + form submissions
    - Client-side (debounce) + server-side (Cloud Function)
    - Effort: 2-3 days
26. **🔧 Add "Forgot password" flow** to admin login
    - `firebase.auth().sendPasswordResetEmail`
    - Effort: 1 day

### Milestone: "Marketing Engine" (3 weeks)

27. **📢 Rebuild `platform.html` (SNR Edu ERP marketing)**
    - Add: customer logos, pricing placeholder, feature comparison table, "Book Demo" form
    - Note: ₹4/student/month pricing is a **roadmap idea, not yet validated** — needs business sign-off
    - Effort: 1-2 weeks
28. **📢 Add "Book Demo" lead capture form** to `platform.html`
    - Writes to `demoRequests` collection; emails super admin
    - Effort: 1-2 days
29. **📢 Add 2-min product video** (YouTube embed) to `platform.html`
    - Effort: 0.5 day
30. **📢 Add customer logo strip** + testimonials
    - Even with placeholder logos ("Trusted by 5+ schools in Bihar")
    - Effort: 1 day
31. **📢 Add `sitemap.xml` + `robots.txt`**
    - Effort: 0.5 day
32. **📢 Add Hindi language toggle** (`?lang=hi`)
    - NEP 2020 compliance + rural reach
    - Effort: 1 week (CMS schema + i18n helper)

### Milestone: "Communication" (2 weeks)

33. **💬 Integrate WhatsApp Cloud API**
    - Templates: fee reminder, attendance alert, homework notification, exam schedule
    - First 1,000 conversations/month are free
    - Effort: 1-2 weeks
34. **💬 Build "Notice Board" + "Bulk Message" flows**
    - Admin sends via SMS + WhatsApp + portal in one action
    - Effort: 1 week (depends on MSG91 + WhatsApp)

### P1 Acceptance Criteria
- [ ] Can onboard a new tenant (SCH002 or external) without code changes
- [ ] Firebase SDK is consistent
- [ ] Hindi translation works on all public pages
- [ ] Demo booking → super admin email within 5 min
- [ ] WhatsApp fee reminder sends successfully to 10 test parents
- [ ] Lighthouse score ≥ 90 (mobile)

---

## P2 — Differentiation (Weeks 13-24)

> Features that differentiate SNR Edu ERP from Teachmint / Fedena / Education Desk.

### Milestone: "Differentiate" (6 weeks)

35. **📱 PWA + Offline Mode**
    - `manifest.json`, service worker, app icons
    - Cache static assets + last-known data in IndexedDB
    - "Add to Home Screen" prompt
    - Effort: 1-2 weeks
36. **🔔 Web Push Notifications**
    - Subscribe via service worker; send via FCM
    - Integrate with `erp-notifications.js` (currently a stub)
    - Effort: 1-2 weeks
37. **📚 Question Bank + Math Rendering** (ExamCraft AI upgrade)
    - Integrate KaTeX; add equation editor
    - Save frequently-used questions in `questionBank` collection
    - Drag-drop into paper editor
    - Effort: 2 weeks
38. **🤖 AI Question Extractor** (ExamCraft AI)
    - Integrate Gemini Vision API for handwritten OCR
    - Add API key management
    - Effort: 2 weeks
39. **📊 School-level analytics dashboard** (for tenants)
    - Page views, popular features, user engagement
    - Use Plausible (privacy-friendly) or build on Firestore
    - Effort: 1-2 weeks
40. **📊 Super Admin analytics** (for SaaS operator)
    - MRR, churn, active tenants, top features
    - Built on `auditLog` + per-school metrics
    - Effort: 1 week
41. **🛡️ Audit log** for all admin actions
    - Create `auditLog` collection; write on every CUD
    - View in super-admin-pro > Logs
    - Effort: 1 week
42. **👨‍👩‍👧 Multi-child support** in student portal
    - Parent account → switch between students
    - Store `selectedStudentId` in sessionStorage
    - Effort: 1 week
43. **📍 GPS attendance** for older students
    - `navigator.geolocation` + reverse-geocode school
    - Radius check (e.g., 200m)
    - Effort: 1 week
44. **📋 CSV import/export** for all data-entry modules
    - Classes, subjects, exams, holidays, library books
    - Effort: 1-2 weeks
45. **📜 Apply for TC** (Transfer Certificate) workflow
    - Parent form → admin approval → PDF generation
    - Effort: 1 week

### Milestone: "Operational Excellence" (3 weeks)

46. **🔧 Refactor `admin-dashboard.html`** (8,053 lines → <500 lines)
    - Split into per-section partials loaded via `fetch().then(inject)`
    - Use `<template>` tags
    - Effort: 2-3 weeks (high risk; do in isolation branch)
47. **🔧 Build step + minification** (Vite or esbuild)
    - Add `package.json`, `vite.config.js`
    - Migrate from CDN Tailwind to compiled CSS
    - Effort: 1 week
48. **🔧 Lazy-load admin JS modules** on section show
    - Use `import()` dynamic imports
    - Effort: 0.5 week
49. **🔧 Add unit tests** (Jest or Vitest)
    - Start with `payment-service.js` (FIFO atomic) and `saas-policy.js`
    - Effort: 1 week

### P2 Acceptance Criteria
- [ ] PWA installable on Android + iOS
- [ ] Web push notifications work end-to-end
- [ ] Question Bank has 50+ sample questions
- [ ] AI Question Extractor has ≥80% accuracy on handwritten test photos
- [ ] Admin dashboard initial load < 2s (from 6s+)
- [ ] 80% test coverage on payment + auth modules

---

## P3 — Defer (6+ months)

> Features for enterprise customers or future paid tiers.
> Not in current 12-month plan.

### Enterprise / Compliance
- SOC 2 / ISO 27001 certification
- COPPA compliance (US market)
- SAML SSO
- Custom domain per school (`schoolname.snreduerp.com`)
- Full white-label branding per school

### Advanced Modules
- Biometric attendance (fingerprint/face)
- RFID integration for bus tracking
- GPS bus tracking for parents
- Hostel management
- Cafeteria / canteen
- Inventory management
- Accounting / Tally integration
- HR / payroll

### Differentiator (Future)
- Live class / video conferencing (Jitsi)
- Online exam mode (CBT)
- Parent-Teacher Meeting scheduler
- 360° virtual tour
- Voice/video notes for teachers

### Tech Debt
- Add `package.json` + dependency management
- ESLint + Prettier + `.editorconfig`
- CI/CD (GitHub Actions)
- Two super-admin pages → merge to one
- Three report card files → consolidate to one

---

## Pricing Strategy (Roadmap — NOT YET VALIDATED)

> ⚠️ **Caution**: The following pricing ideas are from `market-research-2026.md` and are **roadmap concepts only**. They need business validation and a financial model before being published.

### Target customer
- Indian SMB / private schools
- Play Group to Class 12
- 200-2,000 students
- Annual revenue ₹5L-₹5Cr
- Currently using paper registers or a competitor (Teachmint, Fedena, MySchool, Education Desk)

### Proposed tiers (preliminary)
| Tier | Price | Includes |
|---|---|---|
| **Free** | ₹0 | Static website + CMS (Stage 1-2) |
| **Basic** | ₹4/student/month | + Student portal (Stage 3) |
| **Standard** | ₹8/student/month | + Core ERP: fees, attendance, results (Stage 4) |
| **Premium** | ₹15/student/month | + Full ERP: library, transport, exams, AI tools (Stage 6) |
| **Enterprise** | Custom | + White-label, custom domain, dedicated support |

### Free tier strategy
- Static website + CMS is the **lead generator**
- Schools outgrow free → upgrade for portal → upgrade for ERP
- Network effect: more schools on the platform = better data, better features

### Revenue model
- MRR = sum(school.studentCount × tierPrice)
- At 100 schools × 500 students × ₹4 average = ₹2,00,000 MRR (~₹24L ARR)
- At 1,000 schools × 500 students × ₹4 average = ₹20,00,000 MRR (~₹2.4Cr ARR)

### Cost structure
- Firebase: ~₹25/student/year (Firestore + Auth at scale)
- SMS/WhatsApp: ~₹5/student/year
- Cloud Functions: ~₹2/student/year
- Engineering salaries (the big one)
- **Gross margin at ₹4/student/month: ~70%**

### Validation needed
- [ ] Confirm ₹4 is profitable at 100-school scale
- [ ] Test willingness to pay with 10 prospect interviews
- [ ] Compare to Teachmint's pricing (₹5-₹10/student/month)
- [ ] Decide if Basic tier is enough or if "Free" should be more limited
- [ ] Validate payment terms (monthly vs. annual with discount)

---

## OKRs for Next 90 Days

### Objective 1: Ship a secure, production-ready v1.0
- **KR1.1**: All P0 security gaps resolved (16 items) — by week 4
- **KR1.2**: Razorpay + MSG91 integrated and tested — by week 4
- **KR1.3**: Privacy policy live, DPDP compliance checklist passed — by week 4
- **KR1.4**: Zero "Under Construction" UI in production — by week 4

### Objective 2: Onboard 3 paying tenants beyond Apex
- **KR2.1**: Marketing site rebuilt with lead capture — by week 8
- **KR2.2**: Demo booking → close workflow defined — by week 8
- **KR2.3**: 3 tenants signed and using portal daily — by week 12

### Objective 3: Differentiate via PWA + AI tools
- **KR3.1**: PWA installable, offline mode works — by week 16
- **KR3.2**: Web push notifications end-to-end — by week 16
- **KR3.3**: Question Bank + KaTeX in ExamCraft — by week 20
- **KR3.4**: AI Question Extractor with ≥80% accuracy — by week 24

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Auth re-enable breaks tenant logins | High | High | Test on SCH001 + SCH002 staging; gradual rollout |
| Razorpay integration delayed | Medium | High | Start integration in parallel with P0; have Cashfree as backup |
| Multi-tenant refactor breaks Apex | High | Critical | Refactor in feature flag; Apex stays on hard-coded for 1 month |
| Hindi translation scope creep | Medium | Medium | Limit to public pages in P1; portal in P2 |
| Firebase Storage costs spike if Base64 hits limits | Low | High | Already mitigated; 700KB cap, auto-compress |
| DPDP enforcement surprise | Low | High | Get legal review before publishing privacy policy |
| Competitor (Teachmint) drops price to ₹0 | Medium | High | Differentiate on CMS + multi-tenant + AI tools; build moat |
| Devs quit mid-project | Medium | High | Document everything; pair-program; reduce bus factor |

---

## Decision Log (Open Questions)

- [ ] **Brand name**: "SNR Edu ERP" or "SNR World" or new name?
- [ ] **Pricing**: Validate ₹4/student/month with financial model
- [ ] **Multi-tenant hosting**: One Firebase project with school-id scoping (current) vs. one project per tenant (more isolation, more cost)
- [ ] **PWA or Native**: PWA (current plan) vs. React Native (better UX, much more cost)
- [ ] **WhatsApp provider**: Cloud API (free tier) vs. MSG91 (cheaper at scale)
- [ ] **SMS provider**: MSG91 vs. Karix vs. Twilio
- [ ] **DPDP legal review**: Internal or external counsel?
- [ ] **Two super-admin pages**: Merge or keep both?
- [ ] **`admin-dashboard.html` refactor**: Per-section partials vs. migrate to a framework (Vue/React/Svelte)?
- [ ] **Tech debt**: Vite migration yes/no? When?

---

## See Also

- `Plan/00-master-analysis.md` — Codebase overview, module matrix
- `Plan/01-gaps.md` — All 98 gaps with detail
- `Plan/pages/*.md` — Per-page analysis
- `market-research-2026.md` — Competitive analysis
- `competitive-analysis-report.md` — vs. Education Desk
- `IMAGE_STORAGE.md` — Base64 storage contract
- `README.md` — Dev/deploy quick links
