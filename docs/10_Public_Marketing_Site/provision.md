# Provision Page — `provision.html`

> **Type:** Utility — school provisioning script (SHOULD BE DELETED)
> **CMS-Driven:** No
> **Location:** `D:\Snredu\provision.html`
> **Plan ref:** `Plan/pages/public/provision.md`
> **Date:** June 2026

---

## 1. Purpose

One-time school provisioning script. Creates 2 school records (SCH001 = Apex Public School, SCH002 = SNR World School Patna) in Firestore. **Should not be accessible in production.**

---

## 2. Current Working State

- Minimal HTML showing status of school creation
- Inline JavaScript that writes to Firestore via client SDK
- **No AuthGuard.requireAuth()** — anyone can trigger this
- Hardcoded: Apex phone `8084243031`, email `Apexpublicschool61@gmail.com`, UDISE `10171706503`
- Hardcoded: SNR World Patna phone `9724649971`, Boring Road

---

## 3. Gaps (CRITICAL)

| Gap | Severity | Detail |
|---|---|---|
| **No auth protection** | **P0 🔴** | Anyone landing on this URL can create schools |
| **Public URL** | **P0 🔴** | Indexed or discovered via Firebase Hosting |
| **Hardcoded credentials** | P1 | Phone/email/UDISE in client-side JS |
| **Creates duplicate record if run twice** | P1 | No idempotency check |

---

## 4. Perfect Action

**DELETE THIS FILE.** The provisioning should exist only in `portal/super-admin-pro.html` with:
- AuthGuard.requireAuth({role:'super_admin'})
- Confirmation modal
- Cloud Function (Admin SDK), not client-side Firestore
- Audit logging to `logs_super`
