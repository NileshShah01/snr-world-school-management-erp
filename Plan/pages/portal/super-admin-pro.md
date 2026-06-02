# `portal/super-admin-pro.html` — Super Admin Pro (Modern)

## Purpose
- Modern replacement for `portal/super-admin.html`.
- Branded as "Nexorasoftagency | Super Admin PRO" (still inconsistent with platform branding).
- Glassmorphism dark theme, Tailwind + Lucide icons + Chart.js.
- Called "SNR World Control Tower" in the market-research docs.

## File facts
- 693 lines, 38.2 KB
- Loads Chart.js for the "Enrollment Growth" chart (line 687)
- Uses Lucide icons via `https://unpkg.com/lucide@latest`

## Scripts loaded
1. Firebase 9.22.1 compat (`firebase-app`, `firebase-firestore`, `firebase-auth`)
2. Chart.js (CDN)
3. `/js/firebase-config.js`
4. `/js/saas-policy.js`
5. `/js/super-admin-pro.js` (586 lines) — handles all logic

## Navigation (10 tabs)
| Tab | Status | Notes |
|---|---|---|
| Dashboard | ✅ Active (default) | 4 stat cards, enrollment chart, quick actions |
| Schools | ✅ Active | Table with filter, Edit modal |
| Add School | ✅ Active | Full provisioning form |
| Analytics Hub | ⚠️ Placeholder | "Advanced platform-wide analytics... will be available in the next performance update." |
| Stage Management | ✅ Active | Stage config grid (dynamic from `App.tsx` comment suggests React origin) |
| Subscriptions | ⚠️ Placeholder | "Billing and subscription lifecycle management tools are currently under maintenance." |
| Appearance | ✅ Active (basic) | Dashboard branding name + accent color picker |
| System Settings | ⚠️ Placeholder | "Global platform configuration parameters are currently locked for security updates." |
| System Health | ⚠️ Placeholder | "Real-time server monitoring and uptime statistics are being synchronized." |
| Logs | ✅ Active (empty state) | Audit log container — depends on `logsContainer` being populated |

## Add School form
- Fields: School Name, School Path/Slug, Activation Stage (1-6), School Display Name, School Logo URL, Admin Email, Admin Password
- URL pattern shown: `https://nexorasoftagency-erp.web.app/[slug]/` (line 436)
- 6 SaaS Stages shown in dropdown (matches `saas-policy.js`):
  - Stage 1: Static Site
  - Stage 2: CMS Admin
  - Stage 3: Student Portal
  - Stage 4: ERP Tools
  - Stage 5: Custom Tools
  - Stage 6: Full ERP Suite

## Modal
- Edit School modal (line 624-680): name, slug, stage, cancel/save

## Gaps
- **🔴 "Nexorasoftagency" brand inconsistency** — should be "SNR World" or "SNR Edu ERP" for consistency with `platform.html` and other docs.
- **🔴 5 of 10 tabs are placeholders** ("under construction" / "next performance update" / "locked for security"):
  - Analytics Hub, Subscriptions, System Settings, System Health, plus empty Logs
  - These are misleading — should either be removed or clearly labeled "(Coming Soon)".
- **🔴 "URL: `https://nexorasoftagency-erp.web.app/[slug]/`"** is hard-coded — for multi-domain setups, this needs to be a config var.
- **🔴 Logo URL is required as URL field** — for tenants without CDN, should accept file upload (Base64 via `image-storage.js`).
- **🔴 No subdomain availability check** — same as `super-admin.html`.
- **🔴 Admin password is plain text in the form** — no generation, no strength meter, no copy-to-clipboard.
- **🔴 No 2FA / MFA** for the super admin themselves.
- **🔴 No auth guard visible** in the HTML — relies on `super-admin-pro.js` redirect.
- **"Add School" form** doesn't ask for: school phone, address, UDISE, board affiliation, academic session, fee structure template. The provisioned school has to be configured via CMS later.
- **No bulk import** — must add schools one at a time.
- **No school deletion flow**.
- **No suspension flow** (despite Stage 0 in `saas-policy.js`).
- **Chart.js is hard-coded to a 6-month enrollment growth view** — no way to change date range.
- **"Quick Actions" panel is underutilized** — only 2 actions (Provision School, System Health which is a placeholder).
- **Notification bell** (line 246) has a blue dot but no functionality.
- **Search bar** (`#globalSearch`) is present but has no handler in HTML.
- **User profile** ("Nilesh Shah", "Super Admin") is hard-coded (line 254-255) — not dynamic.
- **No pagination on the schools table**.
- **Export CSV button** (line 379-383) has no `onclick` handler.
- **No structured data or meta tags** for SEO (low priority for admin).

## Recommended plan
1. **🔴 Rebrand to "SNR World Control Tower"** for consistency.
2. **🔴 Either implement or clearly label the 5 placeholder tabs** ("(Coming Q3 2026)").
3. **🔴 Add subdomain availability check** before form submit.
4. **🔴 Add admin password generator** with strength meter.
5. **🔴 Add MFA** for super admin (TOTP via Firebase Auth).
6. **Make the URL pattern config-driven** (`window.SAAS_DEPLOY_URL`).
7. **Add bulk import** (CSV with school metadata).
8. **Add school deletion + suspension flows**.
9. **Expand Add School form** to capture: phone, address, UDISE, board, session, fee template.
10. **Add logo file upload** (Base64 via `image-storage.js`) as alternative to URL.
11. **Wire up dead buttons**: Export CSV, globalSearch, notification bell.
12. **Add pagination + multi-page** to schools table.
13. **Add structured data** for SEO.
14. **Make the user profile dynamic** (load from auth currentUser).
