# Module: Authentication

## Purpose
Handle all authentication flows for the SNR WORLD School ERP: admin/staff login via email/password (Firebase Auth), student login via phone+name (no password — pure Firestore query match), and route gating via middleware + RBAC.

## Current Working State

### Firestore Collections (Top-Level)
| Collection | Document ID | Key Fields |
|---|---|---|
| `users` | `{uid}` | email, role, schoolId, classIds, displayName, phone, isActive, createdAt |
| `students` | `{studentId}` | name, phone, classId, section, rollNo, isActive |

### Auth Flows
- **Admin Auth**: `admin-auth.js` — email/password via `firebase.auth().signInWithEmailAndPassword()`. Writes claims to `users/{uid}` on first login. Redirects to `admin-dashboard.html`.
- **Student Auth**: `student-auth.js` — phone + name form. Queries `students` collection for matching `phone` + `name` + `isActive == true`. If found, maps student record to a temporary session in `sessionStorage`. No Firebase Auth user created — the session is purely client-side.
- **Auth Guard**: `auth-guard.js` — intercepts page loads, checks `sessionStorage` or `onAuthStateChanged`. Redirects to login if unauthenticated.
- **Access Control**: `access-control.js` — RBAC with 8 roles: `admin`, `teacher`, `student`, `parent`, `accountant`, `librarian`, `transport`, `viewer`. Role-based UI element show/hide. Uses custom claims (`schoolId`, `role`, `classIds`) from Firebase Auth token for admin users.

### JS Files
| File | Purpose |
|---|---|
| `js/firebase-config.js` | Firebase init config (project: `apex-public-school-portal`) |
| `js/auth-guard.js` | Route guard middleware |
| `js/access-control.js` | RBAC role/permission checks |
| `js/admin-auth.js` | Admin login flow |
| `js/student-auth.js` | Student phone+name login |
| `js/app-check.js` | App Check (NO-OP — empty reCAPTCHA key) |
| `js/rate-limiter.js` | Client-side rate limiter (not enforced server-side) |

### Portal Pages
- `portal/admin-login.html` — Admin login form
- `portal/student-login.html` — Student phone+name login form

## Gaps

| Priority | Gap | Impact |
|---|---|---|
| P0 | **Self-elevation hole**: `firestore.rules` allows user to write `users/{uid}.role` because update rule checks `request.auth.uid == userId` — any user can set their own role to `admin` | Full privilege escalation |
| P0 | **Student auth has no password/OTP** — pure Firestore query match on phone+name. Anyone who knows a student's name and phone can impersonate them. No session token, no Firebase Auth user. | Zero authentication security |
| P0 | **reCAPTCHA meta tag in login HTML is empty** — `App Check` debug token is placeholder. No bot protection. | Anyone can script login attempts |
| P1 | **App Check is NO-OP** — empty reCAPTCHA site key in `app-check.js`. No attestation. | No protection against abuse |
| P1 | **No forgot password flow** — no link or mechanism for admin/staff password reset | Admin lockout risk |
| P2 | **No 2FA / multi-factor authentication** | Weak credential security |
| P2 | **Rate limiting is client-side only** — `rate-limiter.js` can be bypassed by direct API/Firestore calls | No server-side brute force protection |
| P3 | **No session timeout / idle logout** — admin sessions persist indefinitely | Physical access risk on shared machines |

## Competitor Comparison

| Feature | Education Desk | Fedena | Classe365 | SNR WORLD (Current) |
|---|---|---|---|---|
| Admin login | Email+Password | Email+Password | Email+Password + Google SSO | Email+Password |
| Student login | OTP to registered phone | Credentials from school | SSO / OTP | Phone+Name (NO PASSWORD) |
| Forgot password | Yes | Yes | Yes | **No** |
| 2FA | No | No | Yes (optional) | **No** |
| reCAPTCHA / Bot protection | Yes | Yes | Yes | **No (empty key)** |
| Role-based access | Admin/Teacher/Student/Parent | Admin/Teacher/Student | Full RBAC | 8 roles (not enforced in rules) |
| Session management | Timeout + refresh | Timeout | Timeout + device tracking | **None** |

## Perfect Version

- **Admin Auth**: Firebase Auth email/password + reCAPTCHA v3 (backend verification). Forgot password via `sendPasswordResetEmail()`. Optional 2FA via TOTP (Firebase Auth MFA).
- **Student/Parent Auth**: Phone-based OTP via Firebase Auth `signInWithPhoneNumber()`. Create a real Firebase Auth user per student. Link student record to `uid`.
- **Firestore Rules**: Granular role-based rules — `users/{uid}` write restricted to `admin` role only. Student data readable by self + teachers + parents. No self-elevation possible.
- **App Check**: reCAPTCHA Enterprise or App Attest with valid keys enforced on all Firestore writes.
- **RBAC Enforcement**: Security rules enforce role checks on every document read/write. Front-end `access-control.js` mirrors rules for UX but never trusted for security.
- **Session Management**: 30-minute idle timeout with warning dialog. Firebase Auth token refresh enforced. Device session tracking for admin.
- **Rate Limiting**: Server-side via Firebase Functions + Firestore write limits. Block after 5 failed login attempts per IP/device for 15 minutes.
