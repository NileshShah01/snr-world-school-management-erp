# Super Admin (Legacy) — `portal/super-admin.html`

> **Type:** Portal — legacy super admin dashboard
> **Location:** `D:\Snredu\portal/super-admin.html`
> **Script:** `D:\Snredu\js\super-admin.js` (11.9 KB)
> **Plan ref:** `Plan/pages/portal/super-admin.md`
> **Date:** June 2026

---

## 1. Purpose

Legacy super admin dashboard. Manage schools: list, add, edit, suspend. Activity log.

---

## 2. Current Working State

- Protected by `AuthGuard.requireAuth({role:'super_admin'})`
- Lists schools with name, status, stage, admin email
- Add school modal: name, short name, address, contact, board, admin email, plan, stage
- Edit school modal
- Suspend/activate toggle
- Activity log showing recent `logs_super` entries
- Search/filter schools by name

### Dead Code
`checkSuperAdminAuth()` function hardcodes `nileshshah84870@gmail.com` but is never called — `AuthGuard` handles gatekeeping.

---

## 3. Gaps

| Gap | Severity | Detail |
|---|---|---|
| Replaced by super-admin-pro.html | P2 | Pro version has more features; legacy should be removed |
| No bulk operations | P2 | Can only add/edit one school at a time |
| No analytics/dashboard | P2 | No system-wide stats (total students, storage, API calls) |
| No billing management | P2 | No plan/usage tracking |
| No notification to school admins | P2 | Can't send messages to all school admins |

---

## 4. Perfect Version

**Deprecate and redirect to super-admin-pro.html.** All features already exist in the Pro version.
