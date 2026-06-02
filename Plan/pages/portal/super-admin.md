# `portal/super-admin.html` — Super Admin (Legacy)

## Purpose
- **Legacy** super admin dashboard for SNR World SaaS Control Tower.
- Used to provision new school instances (register, edit, search schools).
- Replaced by `portal/super-admin-pro.html` (Tailwind, modern UI).
- This file should be considered for **deprecation or merging** with the pro version.

## File facts
- 529 lines, 19.4 KB
- Branded as "Nexorasoftagency" (note: brand inconsistency with `super-admin-pro.html` and `platform.html` which use "SNR")
- Self-contained styles (glassmorphism dark theme)

## Scripts loaded
1. Firebase 9.22.1 compat (slightly older than 9.23.0 used elsewhere)
2. `/js/firebase-config.js`
3. `/js/saas-policy.js`
4. `/js/super-admin.js` (328 lines) — handles table population, modal logic

## Features
- **3 stat cards**: Schools On-boarded, Total Students, Stage 5 Instances
- **Schools table** (filterable by name/ID):
  - Columns: School ID, School Name, Subdomain, Stage, Status, Actions
  - Search by name/ID via `filterSchools()`
- **Register New School modal**: Name, Subdomain, Admin Email, Logo URL, Initial Password, Activation Stage
- **Edit School modal**: Name, Subdomain, SaaS Stage
- **Recent Activity Log** section
- **Logout** link (calls `auth.signOut()`)

## SaaS Stages (5 stages, not 6)
- Stage 1: Static Site
- Stage 2: CMS Admin
- Stage 3: Student Portal
- Stage 4: ERP Tools
- Stage 5: Full ERP Suite
- (Note: `saas-policy.js` defines 6 stages including STAGE_0 = Suspended. This page skips STAGE_0 and uses only 1-5.)

## Gaps
- **🔴 "Nexorasoftagency" brand is inconsistent** — rest of the platform uses "SNR World" / "SNR Edu ERP". This file should be re-branded or removed.
- **🔴 Has only 5 SaaS stages** in the UI dropdown; `saas-policy.js` defines 6 (including STAGE_0 Suspended).
- **🔴 No auth guard visible** — page loads `super-admin.js` which presumably checks auth, but the HTML has no client-side gate.
- **🔴 Sidebar nav links (`#`)** — "Dashboard", "Schools", "Users", "Platform Settings" — all `href="#"`, no actual page logic for non-Dashboard tabs.
- **🔴 "Users" and "Platform Settings" nav items** — clickable but no destination.
- **🔴 "Logo URL" is required to be a URL** — for tenants without a CDN, this is a friction. Should accept file upload (Base64 via `image-storage.js`).
- **🔴 No subdomain availability check** — duplicate subdomains will silently collide.
- **🔴 No school deletion flow** — once added, a school can't be removed (must manually delete from Firestore).
- **🔴 Modal "open/close" logic uses inline JS** (lines 521-526) — should be in `super-admin.js`.
- **Recent Activity Log** (`#activityLog`) is empty — relies on `super-admin.js` to populate, but there's no audit log collection defined.
- **"Filter Schools" search is client-side only** — fine for <100 schools, but won't scale.
- **No bulk actions** (provision 5 schools at once, export to CSV).
- **No usage analytics** per school (active users, storage, last login).
- **No suspension / reactivation flow** despite STAGE_0 being defined in `saas-policy.js`.
- **Title says "Super Administrator"** but sidebar says "Nexorasoftagency" — internal naming inconsistency.

## Recommended plan
1. **🔴 Decide: deprecate or unify with `super-admin-pro.html`** — having two super-admin panels is confusing.
2. **🔴 If keeping: rebrand to "SNR World" / "SNR Edu ERP"** for consistency.
3. **🔴 If keeping: add SaaS Stage 0 (Suspended) + Stage 6 (Full ERP)** to match `saas-policy.js`.
4. **🔴 Add subdomain availability check** before allowing form submit.
5. **🔴 Add school deletion flow** (with confirmation + audit log entry).
6. **Add bulk provisioning** (CSV import of 10+ schools at once).
7. **Add per-school usage analytics** (active users, last login, document count).
8. **Add suspension / reactivation flow** for delinquent tenants.
9. **Move inline modal JS** into `super-admin.js`.
10. **Wire up the dead "Users" and "Platform Settings" nav items** or remove them.
11. **Add a school logo upload field** that uses `image-storage.js` (Base64).
12. **Add an audit log** (`super_admin_audit` collection) for every CUD operation.
