# Admin Login — `portal/admin-login.html`

> **Type:** Portal — authentication
> **Location:** `D:\Snredu\portal/admin-login.html`
> **Plan ref:** `Plan/pages/portal/admin-login.md`
> **Date:** June 2026

---

## 1. Purpose

Admin email/password login page. Entry point for school staff (admins, teachers, accountants, librarians) to access the ERP dashboard.

---

## 2. Current Working State

### Page Design
- Dark glassmorphism theme
- Recaptcha meta tag with empty site key
- Responsive layout

### Script Dependencies
- `firebase-config.js`, `app-check.js`, `auth-guard.js`, `admin-auth.js`, `rate-limiter.js`

### Working Logic
```
Page load
  → await schoolBootstrapReady (resolves schoolId from URL slug)
  → applyAuthBranding() sets school name, logo on login form
  → Check for existing session → redirect to dashboard if logged in
Login attempt
  → Check rate limiter (login: 5/min)
  → Firebase auth.signInWithEmailAndPassword(email, password)
  → On success: create/update users/{uid} doc
  → Custom claims: role inferred from doc
  → Redirect to /{slug}/Admin-Dashboard
```

### Admin Login Safety Net
If the user is `nileshshah84870@gmail.com` and no `users/{uid}` doc exists, auto-creates a SCH001 admin record. This is a bootstrapping mechanism.

---

## 3. Gaps & Mismatches

| Gap | Severity | Detail |
|---|---|---|
| **No reCAPTCHA** | **P0** | reCAPTCHA site key is empty — can be brute-forced |
| **No forgot password flow** | P1 | No "Forgot Password?" link anywhere |
| **No multi-factor auth** | P2 | 2FA not implemented for schoolAdmin |
| **"Super Admin" safety net is hardcoded** | P2 | Only works for nileshshah84870@gmail.com |
| **No rate limit on failed attempts server-side** | P2 | Rate limiter is client-side only |
| **No invite-only registration** | P1 | Anyone with email can theoretically create an account (if safety net triggers) |
| **No session timeout warning** | P3 | No idle session timeout |

---

## 4. Perfect Version

1. **reCAPTCHA v3** with configured site key
2. **Forgot Password** link → Firebase Auth password reset email
3. **2FA** for schoolAdmin role (TOTP or SMS)
4. **Server-side rate limiting** via Firebase Functions middleware
5. **Invite-only** — school admin creates teacher accounts from dashboard
6. **Session timeout** with 15-minute warning
7. **Magic link login** option (email link)
8. **SSO** for enterprise schools (Google Workspace, Microsoft 365)
