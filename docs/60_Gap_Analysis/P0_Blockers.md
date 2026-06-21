# P0 — Ship-Blockers

> **Severity:** Critical — Product is unshippable until resolved.  
> **Count:** 16 gaps  
> **Target resolution:** Before MVP launch.

---

## Security (6)

| # | Gap ID | Title | Affected Files | Effort (h) | Resolution Steps | Verification |
|---|--------|-------|----------------|------------|------------------|--------------|
| 1 | G-SEC-01 | **Auth guards disabled** | admin-dashboard.html, super-admin.html, /provision.html, admin-dashboard.js | 8 | 1. Add `AuthGuard.requireAuth()` to every admin/super-admin page. 2. Remove `/provision.html`. 3. Gate all admin routes behind `onAuthStateChanged`. | Navigate to each admin page unauthenticated — must redirect to login. |
| 2 | G-SEC-02 | **Self-elevation hole in firestore.rules** | firestore.rules | 2 | Change users update rule: replace `request.auth.uid == userId` with `isAdmin()`. Only allow `role` field mutation by admins/superAdmins. | Attempt `db.collection('users').doc(ownUid).update({role:'admin'})` via console — must fail. |
| 3 | G-SEC-03 | **Student PII world-readable** | firestore.rules, all collection reads | 12 | 1. Move students, fees, marks under `schools/{schoolId}/`. 2. Replace `read: if true` with `read: if isSchoolMember()`. 3. Create `isSchoolMember()` function checking `schools/{schoolId}/members/{uid}`. | Read any student document without auth token — must be denied. |
| 4 | G-SEC-04 | **`/provision.html` publicly accessible** | /provision.html | 2 | Delete the file. Move school provisioning to super-admin-pro.html behind auth + Cloud Functions call. | Visit `/provision.html` — must 404. |
| 5 | G-SEC-05 | **App Check no-op** | all HTML files, firebase-config.js | 3 | 1. Register reCAPTCHA v3 site key in Firebase Console. 2. Add `activate()` call in all pages. 3. Enforce App Check in firestore.rules + Functions. | Firebase console App Check dashboard shows enforcement active. |
| 6 | G-SEC-06 | **No rate limiting on auth endpoints** | Cloud Functions (planned) | 4 | Add rate-limiting middleware to Functions using `firebase-functions-rate-limiter`. Prevent brute-force on password reset, signup, inquiry submissions. | Fire 100 rapid signup requests — only first N succeed. |

---

## DPDP Act / Privacy (5)

| # | Gap ID | Title | Affected Files | Effort (h) | Resolution Steps | Verification |
|---|--------|-------|----------------|------------|------------------|--------------|
| 7 | G-DPDP-01 | **No DPDP Act consent on forms** | contact.html, demo.html, inquiry.html | 4 | Add mandatory checkbox: "I consent to collection of personal data as per Privacy Policy" + link to privacy.html to all data-collection forms. | Submit form without checkbox — must be blocked. Checkbox label visible. |
| 8 | G-DPDP-02 | **No Privacy Policy page** | — (new file) | 6 | Create `privacy.html` with: data collected, purpose, retention period, third-party sharing, DSR contact, DPDP Act compliance statement, cookie policy. | Navigate to `/privacy.html` — full policy rendered. Link in footer. |
| 9 | G-DPDP-03 | **No data retention / auto-purge** | Cloud Functions, inquiries collection | 4 | 1. Add `createdAt` timestamp to inquiry docs. 2. Write Cloud Function (scheduled, monthly) that deletes inquiries older than 12 months. 3. Apply same for demo requests. | Check inquiries collection — docs older than 12 months are removed. |
| 10 | G-DPDP-04 | **No DSR workflow** | admin-dashboard, new DSR page | 8 | 1. Add "Data Subject Requests" section in admin panel. 2. CRUD for incoming DSRs (access, delete, correct). 3. Cloud Function to export user data as JSON. 4. Log to audit collection. | Submit DSR via form → appears in admin DSR panel → admin can export/delete. |
| 11 | G-DPDP-05 | **No cookie consent banner** | all public pages | 3 | Add cookie consent banner (CSS + JS) that: 1. Shows on first visit. 2. Links to privacy.html. 3. Stores consent in localStorage. 4. Defers non-essential trackers. | Clear site data → visit homepage → banner appears. Accept → banner disappears, cookie set. |

---

## UX / Professionalism (3)

| # | Gap ID | Title | Affected Files | Effort (h) | Resolution Steps | Verification |
|---|--------|-------|----------------|------------|------------------|--------------|
| 12 | G-UX-01 | **`inquiry.html` missing (404 link)** | all pages with inquiry CTA | 2 | Create `inquiry.html` with an inquiry form connected to Firestore inquiries collection. Alternatively set CTA to redirect to `contact.html`. | Click every "Inquiry" button on site — all land on a working form. |
| 13 | G-UX-02 | **6 "Under Construction" modules** | admin-dashboard.js sidebar config | 6 | Either: (a) complete each module, or (b) remove menu items whose linked pages show "Module Under Maintenance". Update sidebar configuration. | Navigate to every sidebar item — none show "Under Construction" or "Under Maintenance". |
| 14 | G-UX-03 | **Duplicate FEES MANAGEMENT in sidebar** | admin-dashboard.js | 1 | Remove duplicate entry. The second occurrence (usually pointing to fees-management.html) overwrites the first in rendering. | Sidebar shows exactly one "Fees Management" entry. |

---

## Integration / Infrastructure (2)

| # | Gap ID | Title | Affected Files | Effort (h) | Resolution Steps | Verification |
|---|--------|-------|----------------|------------|------------------|--------------|
| 15 | G-INT-01 | **No payment gateway** | admin-dashboard, fees pages, Cloud Functions | 24 | 1. Integrate Razorpay (preferred for India) or Cashfree. 2. Create order API endpoint in Functions. 3. Build fee-payment UI with UPI/Credit/Debit/NET. 4. Webhook handler for payment confirmation. 5. Update fee records on success. | Complete full fee payment flow end-to-end in test mode — fee record updated. |
| 16 | G-INT-02 | **No SMS gateway** | Cloud Functions, notification system | 12 | 1. Integrate MSG91 (India-optimized). 2. SMS templates for: fee due, homework alert, attendance alert, admit card. 3. Cloud Function to queue and send SMS. | Trigger fee due event — SMS received on registered parent phone within 30s. |
| 17 (bonus) | G-INT-03 | **No WhatsApp Business API** | Cloud Functions, notification system | 12 | 1. Integrate Wati or Interakt. 2. Template messaging for fee reminders, homework, attendance. 3. Delivery and read receipt logging. | Send WhatsApp notification — delivery receipt logged in Firestore. |

---

## Summary

| Category | Count | Est. Effort (h) |
|----------|-------|-----------------|
| Security | 6 | 31 |
| DPDP Act / Privacy | 5 | 25 |
| UX / Professionalism | 3 | 9 |
| Integration / Infrastructure | 3 | 48 |
| **Total** | **17** | **113** |
