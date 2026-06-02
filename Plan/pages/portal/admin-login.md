# `portal/admin-login.html` — School Admin Login

## Purpose
- Login page for school administrators (principal, office staff, teachers with admin access).
- Dynamically branded with school logo + name from Firestore.
- Form submits to Firebase Auth.

## File facts
- 342 lines, 12.2 KB
- Self-contained — has its own dark theme styles (uses CSS vars `--bg-deep`, `--surface-low`, etc.)
- Branded as "Antigravity ERP" in title and footer

## Scripts loaded
1. Firebase 8.10.0 compat (`firebase-app`, `firebase-auth`, `firebase-firestore`) — **note: version 8.10.0** (older than rest of app which is 9.23.0)
2. `/js/firebase-config.js?v=2.0`
3. `/js/cms-settings.js?v=2.0`
4. Inline branding init script (lines 300-339) — polls for `window.CURRENT_SCHOOL_ID` then loads school doc
5. `/js/admin-auth.js?v=2.0` — handles form submit, calls `firebase.auth().signInWithEmailAndPassword`

## Form behavior
- Fields: `email` (required, type=email), `password` (required, type=password)
- On submit:
  - Disables button, shows spinner
  - Calls `signInWithEmailAndPassword`
  - On success: redirects to `admin-dashboard.html` (or per `admin-auth.js` logic)
  - On error: shows error in `#loginError` div (red shake animation)
- Has `autocomplete="username"` and `autocomplete="current-password"` (good)

## Dynamic branding
- Polls every 100ms for `window.CURRENT_SCHOOL_ID` (set by `firebase-config.js` based on URL)
- Loads `schools/{CURRENT_SCHOOL_ID}` doc from Firestore
- Sets:
  - `schoolLogo.src` (with cache-buster `?t={timestamp}`)
  - `portalBrandName.innerText`
  - `document.title` to "{schoolName} | Antigravity ERP"
- If `data.logo` is missing, falls back to `/images/ApexPublicSchoolLogo.png` (hard-coded)

## Gaps
- **🔴 Firebase SDK version mismatch** — this page uses 8.10.0, rest of app uses 9.23.0. Two SDKs loading will cause bloat and possible conflicts. Should be upgraded to 9.23.0.
- **🔴 No "Forgot password" link** — admins who forget their password are stuck (Firebase Auth has `sendPasswordResetEmail` but no UI).
- **🔴 Polling loop has no timeout** — if `window.CURRENT_SCHOOL_ID` never gets set (firebase-config.js fails to load), the `setInterval` runs forever. Memory leak.
- **🔴 "Antigravity ERP" branding** in title and footer is hard-coded — for multi-tenant reuse, this should be CMS-driven or generic.
- **🔴 `setInterval(checkInterval, 100)` with no clearTimeout fallback** — even after `CURRENT_SCHOOL_ID` is found, the interval variable scope leaks. Minor.
- **No "Sign in with Google"** — schools expect SSO.
- **No rate limiting** — brute-force possible (Firebase Auth has built-in throttling but no UI lockout).
- **No reCAPTCHA** — Firebase App Check not configured.
- **Polling-based branding load is fragile** — should use `await` on a Promise, not `setInterval`.
- **No "Continue as Visitor" option** (unlike `student-login.html`).
- **No session-timeout warning** for users who leave the dashboard open.
- **No "Need help logging in?" support link**.
- **Inline `<style>` block is 220+ lines** — could move to `portal.css` for reuse.
- **Logo fallback `/images/ApexPublicSchoolLogo.png`** is hard-coded — breaks on non-Apex tenants.

## Recommended plan
1. **🔴 Upgrade Firebase SDK to 9.23.0** (match rest of app).
2. **🔴 Replace polling loop with a Promise-based wait** for `window.CURRENT_SCHOOL_ID`.
3. **🔴 Add a `setTimeout(..., 5000)` to clear the interval** if `CURRENT_SCHOOL_ID` never appears.
4. **🔴 Make "Antigravity ERP" branding CMS-driven** (e.g., `settings/general.brandName` or `window.PLATFORM_BRAND`).
5. **Add a "Forgot password?" link** that triggers `firebase.auth().sendPasswordResetEmail(email)`.
6. **Add Firebase App Check** (reCAPTCHA v3) for bot protection.
7. **Add "Sign in with Google"** button (most Indian school admins have personal Gmail).
8. **Add session management** — `onAuthStateChanged` to redirect if already logged in, `beforeunload` warning.
9. **Move inline `<style>` to `portal.css`** for reuse across all login variants.
10. **Add a "Need help?" support link** → WhatsApp or contact form.
11. **Add structured data** (`WebPage` schema) for SEO (low priority for login page).
12. **Add a "Back to school website" link** (matches `student-login.html` UX).
