# Super Admin Pro — `portal/super-admin-pro.html`

> **Type:** Portal — premium "Control Tower" super admin
> **Location:** `D:\Snredu\portal/super-admin-pro.html`
> **Script:** `D:\Snredu\js\super-admin-pro.js` (22.3 KB)
> **Plan ref:** `Plan/pages/portal/super-admin-pro.md`
> **Date:** June 2026

---

## 1. Purpose

Premium super admin dashboard ("Control Tower"). Modern Tailwind+Lucide UI with tabs for Schools, Stages, Logs, Appearance.

---

## 2. Current Working State

### Tabs
1. **Schools** — list, search, add, edit, suspend. Provisioning flow creates admin user via **secondary Firebase app** without logging super admin out. Batch writes: `users/{uid}`, `schools/{id}`, `settings/access`, `settings/general`, `settings/homeHero`, `pageText/home`, `settings/globalStats`.
2. **Stages** — grid showing 6 SaaS stages (0-4, 6; stage 5 skipped) with descriptions
3. **Logs** — recent super admin activity from `logs_super`
4. **Appearance** — global theme config in `settings_super/appearance`
5. **6 more tabs** — PLACEHOLDER (no content)

### Data Usage
- Hardcoded demo enrollment numbers `[45000, 52000, 48000, 61000, 75000, 82000]`
- Charts are sample data, not aggregated from Firestore

### SaaS Policy Tie-in
- Uses `saas-policy.js` `getModulesForStage(stage)` to compute enabled modules per school
- Each school gets a "stage" (0-6) determining feature access

---

## 3. Gaps & Mismatches

| Gap | Severity | Detail |
|---|---|---|
| **6 of 10 tabs are empty** | P1 | Only 4 tabs have content (Schools, Stages, Logs, Appearance) |
| **Chart data hardcoded** | P2 | Enrollment and revenue charts use demo numbers |
| **"Nexorasoftagency" branding** | P2 | Brand name inconsistent with "SNR WORLD" / "SNR Edu ERP" |
| **Provisioning lacks Cloud Functions** | P1 | User creation + batch writes happen client-side (should use Firebase Functions for security) |
| **No billing/subscription management** | P2 | No integration with Stripe/Razorpay for plan management |
| **No system monitoring** | P2 | No API usage, Firestore read/write quotas, error rates |
| **No school-level backup/restore** | P3 | Cannot restore a single school's data |
| **No activity export** | P3 | No CSV/PDF export of school list or activity logs |

---

## 4. Perfect Version

1. **All 10 tabs functional**: Schools, Stages, Logs, Appearance, Billing, Usage, Analytics, Support, AI Config, Settings
2. **Real-time system analytics** — Firestore usage, auth MAU, hosting bandwidth
3. **Cloud Functions for provisioning** — create user via Admin SDK server-side
4. **Billing dashboard** — Stripe/Razorpay integration, plan upgrades, invoice history
5. **School-level operations** — backup, restore, data export, delete
6. **Bulk operations** — CSV import of schools, bulk plan change, bulk notification
7. **Global settings** — default fee structure, grading scale, report card templates
8. **Audit log with search/filter** — filter by school, action type, date range
