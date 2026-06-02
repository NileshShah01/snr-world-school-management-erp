# `provision.html` — Multi-School Provisioning Script (Legacy)

## Purpose
- **One-time setup utility** to provision two school instances (SCH001 = Apex Public School, SCH002 = SNR World School) in Firestore.
- Writes school metadata to `schools/{SCH001|SCH002}` and `schools/{id}/settings/general`.
- Meant to be opened in a browser and run once, then never used again.

## File facts
- 80 lines, ~3 KB
- Uses **Firebase 8.10.1** (older version than rest of codebase which uses 9.23.0)
- No UI — just a `<h1>` and a `<div id="status">` for output

## ⚠️ CRITICAL SECURITY ISSUE
- This page has **no authentication**.
- Anyone who navigates to `/provision.html` can re-run the script and **overwrite school settings for both SCH001 and SCH002** (the `merge: true` means it doesn't delete data, but it can change names, phones, emails, etc.).
- This is a **P0 security vulnerability** if deployed to production.

## What it does
- Iterates over 2 hard-coded school objects
- For each school, writes to:
  - `schools/{SCH001}/settings/general` (the full settings document)
  - `schools/{SCH001}` (just `name`, `status: 'active'`, `updatedAt: serverTimestamp()`)
- Shows status: "Provisioning {SCH001}..." → "Provisioning Complete! Schools SCH001 and SCH002 are ready."

## Hard-coded data
- SCH001 = Apex Public School (Anjani Bazar, phone 8084243031, email Apexpublicschool61@gmail.com)
- SCH002 = SNR World School (Patna, phone 9724649971, email info@snrworld.edu.in)
- Both have: tagline, location, addresses, UDISE+reg, logoUrl, mapIframeUrl, copyright, admissionStatus, admissionSession, marquee
- **Note: SCH002's `logoUrl` is empty** (`logoUrl: ''` line 47) — comment says "Will generate in next step"

## Gaps
- **🔴 No auth gate** — anyone can run. This is a P0 ship-blocker.
- **🔴 Outdated Firebase SDK** (8.10.1 vs 9.23.0 elsewhere) — should be removed entirely
- **🔴 SCH002 provisioning is incomplete** — `logoUrl: ''` with TODO comment
- **🔴 SCH002 doesn't appear to be actively used** — the rest of the codebase only references SCH001 as the fallback
- **`window.onload = provision`** — no manual trigger, no confirmation dialog
- **No way to provision a 3rd school** — would require editing the HTML
- **No idempotency check** — running twice produces the same result (OK with `merge: true`)
- **No error rollback** — if SCH001 succeeds and SCH002 fails, SCH001 stays provisioned
- **No `description` / `address_short` validation**
- **Map URL uses generic `pb=!1m18!` pattern** — same as the dummy in `footer.html`
- **No migration script for the `super_admin` role assignment** — a provisioned school has no admin user until manually created

## Recommended plan
1. **🔴 DELETE this file or move it to a `/scripts/` subfolder that's not deployed** (it's a one-time tool, not a public page).
2. **Add Firebase Hosting rewrite** to deny access: in `firebase.json`, add `{"source": "/provision.html", "destination": "/404.html"}` or remove the file from the `public/` directory entirely.
3. **Replace with a Node.js script** (`scripts/provision-multi-school.js` already exists per project context — verify it does the same thing) and document in README how to run it via `node` locally with admin credentials.
4. **Move the actual provisioning logic** into `portal/super-admin-pro.html` "Add School" form (already exists at lines 408-505 — verify it does the same writes).
5. **Remove the SCH002 placeholder** if SNR World School is not actually being deployed.
6. If kept: add a Cloud Function `provisionSchoolCallable` that requires Firebase Auth + custom claim `super_admin`, so only authorized operators can call it.
