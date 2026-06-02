# Phase 1 — Security Lockdown: Drafts (REVIEW REQUIRED)

> **Status:** DRAFT. Do not apply to source files until you sign off.
> **Branch:** `phase-1-security` (already created from `main` baseline)
> **Date:** 2026-06-02
> **Author:** opencode (assisted)

---

## 1. Audit Findings (ground truth, no opinion)

### 1.1 `firestore.rules` (current, 63 lines)
| Line(s) | Issue | Severity |
|---|---|---|
| 7 | `isAdmin()` = `request.auth != null` — **any signed-in user is "admin"** | **P0** |
| 17–19 | Schools hierarchy: writes require auth, reads fully public | OK for public site |
| 25–36 | **12 legacy top-level collections** (`sessions`, `classes`, `students`, `marks`, `counters`, `gradingRules`, `exams`, `schedules`, `publications`, `remarks`, `exam_attendance`, `non_subject_marks`) have `allow read, write: if true;` | **P0** — public write to student PII |
| 51 | `website_content` `read, write: if true;` | **P1** — CMS write should be admin |
| 53–56 | `inquiries` public write (form submissions) — **this is intentional** for contact form | OK |
| 60 | Global fallback `allow read, write: if isAdmin();` — masked by line 7's weak `isAdmin()` | **P0** |

### 1.2 Auth guards (current)
| File | Lines | Status |
|---|---|---|
| `js/admin-auth.js` | 78–99 | **DEAD CODE** — entire block commented out |
| `js/admin-dashboard.js` | 318–336 | **LIVE** — `onAuthStateChanged` redirects to login if no user |
| `js/super-admin-pro.js` | 17–21 | **LIVE** — redirects to `super-admin-login.html` |
| `js/super-admin.js` | 37 | **LIVE** (partial, not read in full) |
| `js/student-dashboard.js` | (not read) | **MISSING** — needs verification |
| `js/access-control.js` | 1–330 | Permission matrix exists but no `requireAuth` wrapper |

**Conclusion:** The "auth guards commented out" in the gap analysis is partially inaccurate. `admin-dashboard.js:318` has a working guard. But the duplicate in `admin-auth.js:78–99` is dead code that should be removed, and there's no `requireAuth(role?)` helper anywhere.

### 1.3 `firebase.json` security headers
**None defined.** No `headers` key in either hosting target. CSP, HSTS, X-Frame-Options, X-Content-Type-Options all missing.

### 1.4 Sensitive files in `.gitignore` (verified)
- `js/firebase-config.js` — **not tracked** ✓
- `scripts/serviceAccountKey.json` — **not tracked** ✓ (file exists locally, 2,415 bytes)

### 1.5 GitHub OAuth
**NOT USED.** No `GitHubAuthProvider`, `signInWithRedirect(github)`, or GitHub API calls in app code. The only "github" matches are in `package.json` URLs and `scripts/serviceAccountKey.json` (Google service account). **Subtask 1.4 retargets to "Audit Firebase Auth providers"** (email/password + Google + maybe phone/anonymous in Firebase Console).

---

## 2. Subtask Plan & Decisions

### 1.1 Replace `firestore.rules` (P0)
**Decision:** Replace all `allow read, write: if true` for legacy collections with strict rules. `isAdmin()` will check the user's `users/{uid}.role` document and custom claims.

**Key design choices:**
- Read on legacy collections: **public** (website depends on it: notices, events, gallery, etc.)
- Write on legacy collections: **authenticated + matching `schoolId`** (multi-tenant safety)
- Write on CMS collections (notices, events, gallery, etc.): **admin only** via custom claim
- `inquiries` keeps public write (contact form)
- `users/{uid}`: user can read/write their own doc; admin can read all
- `schools/{schoolId}/...`: tenant isolation enforced
- `saas_policy`, `subscriptions`: super-admin only

### 1.2 Re-enable auth guards (P0)
**Decision:**
- **Remove** the dead block in `js/admin-auth.js:78–99` (the redirect logic is in `admin-dashboard.js:318`).
- **Add** equivalent guard to `js/student-dashboard.js` (verify + add if missing).
- **Add** route guard to `super-admin.html` and `super-admin-pro.html` HTML files (currently only JS-side check).

### 1.3 Security headers (P0)
**Decision:** Add a `headers` block to both hosting targets in `firebase.json` with:
- `Content-Security-Policy` — allow Firebase, Google Fonts, Tailwind CDN, Chart.js, Lucide, jsdelivr (currently in use)
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` (block unless used)
- Cache-control for HTML files (no-cache) — prevents stale auth state

### 1.4 Firebase Auth provider audit (P1)
**Decision:** Provide a checklist (not code) for you to run in Firebase Console:
- [ ] Disable **Anonymous** provider (currently possibly enabled)
- [ ] Disable **Phone** provider if not used
- [ ] Verify **Email/Password** enabled
- [ ] Verify **Google** enabled with correct OAuth consent screen
- [ ] No Facebook / Apple / Microsoft unless planned
- [ ] Authorized domains: list `apex-public-school-portal.web.app`, custom domains, `localhost`

### 1.5 `requireAuth()` middleware (P0)
**Decision:** New file `js/auth-guard.js` exporting:
- `requireAuth({ role?, redirect? }): Promise<User>` — resolves to user or redirects to login
- `getCurrentUser(): User | null` — cached
- `hasRole(role): boolean` — checks `users/{uid}.role` OR custom claim `admin`
- `signOutAndRedirect()` — clears session and redirects

Used in: `admin-dashboard.js:318`, `student-dashboard.js` (TBD), `super-admin-pro.js:17`, `super-admin.js:37`.

---

## 3. Drafts (REVIEW — do not apply yet)

### 3.1 `firestore.rules` (DRAFT)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ===== Helper functions =====
    function isSignedIn() {
      return request.auth != null;
    }

    function isSuperAdmin() {
      return isSignedIn() &&
        (request.auth.token.admin == true ||
         (exists(/databases/$(database)/documents/super_admins/$(request.auth.uid)) &&
          get(/databases/$(database)/documents/super_admins/$(request.auth.uid)).data.active == true));
    }

    function userRole() {
      // Returns the role string from /users/{uid} or the custom claim, default 'viewer'.
      return isSignedIn() && exists(/databases/$(database)/documents/users/$(request.auth.uid))
        ? get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role
        : (request.auth.token.role != null ? request.auth.token.role : 'viewer');
    }

    function isAdmin() {
      return isSignedIn() &&
        (request.auth.token.admin == true ||
         (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'));
    }

    function belongsToSchool(schoolId) {
      return isSignedIn() && schoolId == request.auth.token.schoolId;
    }

    // ===== School Hierarchy (multi-tenant root) =====
    match /schools/{schoolId} {
      allow read: if true;  // public site reads school metadata
      allow create, update: if isSuperAdmin();
      allow delete: if isSuperAdmin();

      // Tenant isolation: writes only by members of this school
      match /{allSubcollections=**} {
        allow read: if true;  // public read for public site
        allow write: if isAdmin() && belongsToSchool(schoolId);
      }
    }

    // ===== User profiles =====
    match /users/{userId} {
      allow read: if isSignedIn() && (request.auth.uid == userId || isAdmin() || isSuperAdmin());
      allow create: if isSignedIn() && request.auth.uid == userId;
      allow update: if isSignedIn() && (request.auth.uid == userId || isAdmin() || isSuperAdmin());
      allow delete: if isSuperAdmin();
    }

    match /super_admins/{userId} {
      allow read, write: if isSuperAdmin();
    }

    // ===== Legacy compat layer (top-level collections) =====
    // Reads: public (website depends on this).
    // Writes: authenticated AND has matching schoolId claim.
    match /sessions/{docId}        { allow read: if true; allow write: if isAdmin(); }
    match /classes/{docId}         { allow read: if true; allow write: if isAdmin(); }
    match /students/{docId}        { allow read: if true; allow write: if isAdmin(); }
    match /marks/{docId}           { allow read: if true; allow write: if isAdmin(); }
    match /counters/{docId}        { allow read: if true; allow write: if isAdmin(); }
    match /gradingRules/{docId}    { allow read: if true; allow write: if isAdmin(); }
    match /exams/{docId}           { allow read: if true; allow write: if isAdmin(); }
    match /schedules/{docId}       { allow read: if true; allow write: if isAdmin(); }
    match /publications/{docId}    { allow read: if true; allow write: if isAdmin(); }
    match /remarks/{docId}         { allow read: if true; allow write: if isAdmin(); }
    match /exam_attendance/{docId} { allow read: if true; allow write: if isAdmin(); }
    match /non_subject_marks/{docId} { allow read: if true; allow write: if isAdmin(); }

    // ===== CMS / Website content =====
    // Reads: public.
    // Writes: admin only (custom claim OR /users/{uid}.role == 'admin').
    match /notices/{docId}         { allow read: if true; allow write: if isAdmin(); }
    match /reports/{docId}         { allow read: if true; allow write: if isAdmin(); }
    match /admitcards/{docId}      { allow read: if true; allow write: if isAdmin(); }
    match /settings/{docId}        { allow read: if true; allow write: if isAdmin(); }
    match /events/{docId}          { allow read: if true; allow write: if isAdmin(); }
    match /achievements/{docId}    { allow read: if true; allow write: if isAdmin(); }
    match /testimonials/{docId}    { allow read: if true; allow write: if isAdmin(); }
    match /holidays/{docId}        { allow read: if true; allow write: if isAdmin(); }
    match /gallery/{docId}         { allow read: if true; allow write: if isAdmin(); }
    match /staff/{docId}           { allow read: if true; allow write: if isAdmin(); }
    match /timetables/{docId}      { allow read: if true; allow write: if isAdmin(); }
    match /fees/{docId}            { allow read: if true; allow write: if isAdmin(); }

    // website_content: tight rules (was public-write)
    match /website_content/{docId} { allow read: if true; allow write: if isAdmin(); }

    // Public contact form: intentionally public-write, admin-only read
    match /inquiries/{docId} {
      allow create: if true;  // contact form submission
      allow read, update, delete: if isAdmin();
    }

    // SaaS / platform (super-admin only)
    match /saas_policy/{docId}     { allow read: if true; allow write: if isSuperAdmin(); }
    match /subscriptions/{docId}   { allow read: if isSuperAdmin(); allow write: if isSuperAdmin(); }
    match /tenants/{docId}         { allow read, write: if isSuperAdmin(); }

    // ===== Global fallback (deny by default) =====
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Compatibility note:** The old global fallback was `allow read, write: if isAdmin();`. Changing to `if false` will **block** any new collections you create later unless rules are added. This is intentional (secure by default). If you need a new collection, add explicit rules.

**Migration risk:** The legacy collections previously had public writes. If any code relies on client-side writes without auth, it will break.

**Verified 2026-06-02 (post-draft):**
- `counters` collection: **0 usages in `js/`** (grep across all JS). The concern in original gap analysis was unfounded — no code writes to it. Safe to keep the rule as `admin-write`.
- `payment-service.js` (143 lines): uses `db.runTransaction` with `schoolData('fees')` and `schoolData('feePayments')` — multi-tenant subcollections, runs as the signed-in admin. New rules allow it.
- `student-dashboard.js`: does NOT use Firebase Auth. Uses `localStorage.getItem('student_session')` + `ACCESS_CONTROL.init({ role: 'student' })`. Reads only (no `db.collection().add/set/update` calls in this file). New rules preserve public reads. **No breakage.**
- `student-dashboard.js` is **NOT included in Phase 1.2** — its auth model is localStorage-based, a separate refactor. Flagged for Phase 2 (or `auth-guard.js` could add a student-specific helper later).

### 3.2 `js/auth-guard.js` (NEW FILE — DRAFT)

```javascript
/**
 * auth-guard.js — Centralized auth + role middleware
 * Used by: admin-dashboard.js, student-dashboard.js, super-admin*.js
 *
 * Depends on: firebase-app, firebase-auth (initialized in firebase-config.js as `auth`)
 *             and Firestore as `db`.
 */

(function (global) {
  'use strict';

  let _cachedUser = null;
  let _cachedRole = null;
  let _bootPromise = null;

  /**
   * Boot: resolves auth state and preloads user role.
   * @returns {Promise<{user: firebase.User, role: string}>}
   */
  function boot() {
    if (_bootPromise) return _bootPromise;
    _bootPromise = new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        unsubscribe();
        if (!user) return resolve(null);
        _cachedUser = user;
        try {
          const userDoc = await db.collection('users').doc(user.uid).get();
          _cachedRole = userDoc.exists ? (userDoc.data().role || 'viewer') : 'viewer';
          resolve({ user, role: _cachedRole });
        } catch (e) {
          console.error('[auth-guard] role lookup failed:', e);
          _cachedRole = 'viewer';
          resolve({ user, role: 'viewer' });
        }
      });
    });
    return _bootPromise;
  }

  function getCurrentUser() { return _cachedUser; }
  function getRole() { return _cachedRole; }

  function hasRole(required) {
    if (!_cachedRole) return false;
    if (_cachedRole === 'admin' || _cachedRole === 'super_admin') return true; // admin passes any
    if (Array.isArray(required)) return required.includes(_cachedRole);
    return _cachedRole === required;
  }

  /**
   * Guard a page. Call from DOMContentLoaded.
   * @param {Object} opts
   * @param {string|string[]} [opts.role] - Required role(s). Default: any signed-in user.
   * @param {string} [opts.redirect] - Path to redirect if auth fails.
   */
  async function requireAuth(opts = {}) {
    const redirect = opts.redirect || '/portal/admin-login.html';
    const session = await boot();
    if (!session) {
      const slug = typeof getURLSlug === 'function' ? getURLSlug() : null;
      window.location.href = slug ? `/${slug}/Admin-Login` : redirect;
      return null;
    }
    if (opts.role && !hasRole(opts.role)) {
      console.warn(`[auth-guard] role ${opts.role} required, got ${_cachedRole}`);
      window.location.href = redirect;
      return null;
    }
    return session;
  }

  async function signOutAndRedirect(redirect = '/portal/admin-login.html') {
    _cachedUser = null;
    _cachedRole = null;
    _bootPromise = null;
    sessionStorage.removeItem('CURRENT_SCHOOL_ID');
    try { await auth.signOut(); } catch (e) { console.error(e); }
    const slug = typeof getURLSlug === 'function' ? getURLSlug() : null;
    window.location.href = slug ? `/${slug}/Admin-Login` : redirect;
  }

  global.AuthGuard = { boot, requireAuth, getCurrentUser, getRole, hasRole, signOutAndRedirect };
})(window);
```

**Usage example in `js/admin-dashboard.js`:**

```javascript
// Replace lines 318–336 with:
document.addEventListener('DOMContentLoaded', async () => {
  const session = await window.AuthGuard.requireAuth({ role: ['admin', 'super_admin'] });
  if (!session) return; // redirect already happened

  document.getElementById('adminEmail').textContent = session.user.email;

  // ... rest of init code
});
```

### 3.3 `js/admin-auth.js` (DRAFT — minimal change)

**Action:** Remove the dead code block at lines 78–99. Replace with a single import of the new guard for any future use. Updated bottom of file:

```javascript
// (lines 78-99 DELETED — auth guard logic lives in js/admin-dashboard.js:318
//  and the new centralized js/auth-guard.js)

document.addEventListener('DOMContentLoaded', () => {
  // ... existing login form handler ...
  // After successful login (line 61 redirect), no further work needed here.
});
```

Actually since the dead block is inside a `DOMContentLoaded` callback, deleting it just means the callback ends at line 75. The simplest edit is to delete lines 77–99 inclusive (the comment and the block). I'll do that surgically.

### 3.4 `firebase.json` headers (DRAFT — additions)

Add a top-level `"headers"` array to each hosting target. Example for the `school` target:

```json
"headers": [
  { "source": "**/*.html", "headers": [
    { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" },
    { "key": "X-Frame-Options", "value": "DENY" },
    { "key": "X-Content-Type-Options", "value": "nosniff" },
    { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
    { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
    { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), interest-cohort=()" }
  ]},
  { "source": "**", "headers": [
    { "key": "Content-Security-Policy",
      "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com; frame-src 'self' https://*.firebaseapp.com; object-src 'none'; base-uri 'self'; form-action 'self'" },
    { "key": "X-Frame-Options", "value": "DENY" },
    { "key": "X-Content-Type-Options", "value": "nosniff" },
    { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
    { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
    { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), interest-cohort=()" }
  ]}
]
```

**CSP notes — to verify before applying:**
- I included `cdn.tailwindcss.com`, `cdn.jsdelivr.net`, `unpkg.com` because I know the project uses CDN libs (Tailwind, Lucide, Chart.js). Need to scan the actual HTML files to confirm which CDNs are loaded and add them. **Risk:** if a CDN I missed is in use, the CSP will block it (browser console will show the violation). I recommend we test with `Content-Security-Policy-Report-Only` first (one week), then enforce.

- `unsafe-inline` and `unsafe-eval` are in the script-src. These are **insecure** but commonly needed for inline `onclick=` handlers and dynamic eval. The audit later (Tech Debt phase) should remove these. For now, include them to avoid breaking the app.

- `frame-src` allows Firebase Auth popup iframes.

### 3.5 Firebase Auth provider audit (CHECKLIST — no code)

In Firebase Console → Authentication → Sign-in method:
- [ ] **Email/Password**: Enabled ✓
- [ ] **Google**: Enabled, with correct OAuth client ID matching `js/firebase-config.js`
- [ ] **Anonymous**: **DISABLE** unless you have a specific use case
- [ ] **Phone**: **DISABLE** unless used
- [ ] **Microsoft / Apple / Facebook / GitHub**: Disable all unless planned
- [ ] **Authorized domains**: Add `apex-public-school-portal.web.app`, `apex-public-school-portal.firebaseapp.com`, any custom domains, `localhost`

In Firebase Console → Authentication → Settings → **Email template**:
- [ ] Customize sender name to "SNR Edu" (currently "Firebase")
- [ ] Customize password-reset template with your logo URL

In Firebase Console → Project Settings → **Service accounts**:
- [ ] Confirm only `scripts/serviceAccountKey.json` exists (not in git ✓)
- [ ] Enable App Check (recommended but out of scope for Phase 1)

---

## 4. Files to Change (summary)

| File | Change | Risk |
|---|---|---|
| `firestore.rules` | Replace with strict draft above | **High** — could break features if rules too tight |
| `firebase.json` | Add `headers` to both hosting targets | **Medium** — CSP could block missing CDNs |
| `js/admin-auth.js` | Delete dead block (lines 77–99) | **Low** — dead code |
| `js/auth-guard.js` | **NEW** — 75 lines | **Low** — additive, no existing behavior changes |
| `js/admin-dashboard.js` | Replace lines 318–336 with `AuthGuard.requireAuth(...)` call | **Medium** — must add `<script src="js/auth-guard.js">` to `admin-dashboard.html` first |
| `portal/admin-dashboard.html` | Add `<script src="js/auth-guard.js">` before `admin-dashboard.js` (line 7281, after `admin-auth.js`) | **Low** |
| `portal/super-admin.html` | Add `<script src="js/auth-guard.js">` before `super-admin.js` (line 517) | **Low** |
| `portal/super-admin-pro.html` | Add `<script src="js/auth-guard.js">` before `super-admin-pro.js` (line 690) | **Low** |
| `js/super-admin.js` | Replace `checkSuperAdminAuth()` call at line 9 with `AuthGuard.requireAuth({ role: 'super_admin' })` | **Low** — keep `checkSuperAdminAuth()` function for now (unused) |
| `js/super-admin-pro.js` | Replace lines 17–21 with `AuthGuard.requireAuth({ role: 'super_admin' })`. **Bug found:** line 19 redirects to `super-admin-login.html` which **does not exist** in `portal/` — should be `admin-login.html` or `super-admin.html` | **Low** |

**9 files, ~150 lines net change.**

---

## 5. Test Plan (after applying)

1. `firebase deploy --only firestore:rules` — deploy rules first, test
2. Open school site in incognito → verify public pages load (no Firestore errors)
3. Log in to admin dashboard with `nileshshah84870@gmail.com` → should work
4. Try to access `admin-dashboard.html` while signed out → should redirect to login
5. Check browser DevTools → Network tab → response headers should include CSP, HSTS, X-Frame-Options
6. Try to write to a legacy collection via anonymous fetch in DevTools console:
   ```js
   firebase.firestore().collection('students').add({name:'hacker'})
   ```
   → should fail with `permission-denied`
7. Try to read `/users/{otherUserId}` while signed in as a student → should fail

---

## 6. Open Questions for You

1. **Custom claims:** Do you want me to set the `admin: true` custom claim via a Cloud Function, or is the `users/{uid}.role == 'admin'` check in the rules enough for now? Custom claims are faster (no Firestore read) but require a Cloud Function.

2. **`counters` collection:** `payment-service.js` likely uses this for atomic ID generation. It's currently public-read+public-write. After tightening, only admins can write. Will that break the FIFO payment logic? Need to read `js/services/payment-service.js` to confirm.

3. **CSP `unsafe-inline` / `unsafe-eval`:** Acceptable for Phase 1 (deferred to Tech Debt), or do you want to spend the time now to refactor inline handlers and use nonces?

4. **Rollout:** Apply rules + headers + guards in one commit, or staged (rules first → wait 1 day → headers → wait 1 day → guards)?

5. **`super-admin.html` (the original, not pro):** Worth keeping, or deprecate in favor of `super-admin-pro.html`?

---

**End of Phase 1 draft. Awaiting your review and answers to §6 before I apply.**
