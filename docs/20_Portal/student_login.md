# Student Login — `portal/student-login.html`

> **Type:** Portal — student/parent authentication (WEAK)
> **Location:** `D:\Snredu\portal/student-login.html`
> **Script:** `D:\Snredu\js\student-auth.js`
> **Plan ref:** `Plan/pages/portal/student-login.md`
> **Date:** June 2026

---

## 1. Purpose

Student/parent login page. Uses a phone+name match against Firestore — **no password, no OTP**.

---

## 2. Current Working State

### Login Mechanism
- Student enters phone number and full name
- System queries `schoolData('students')` where `phone == input` and case-insensitive name match
- If match found: stores session in `localStorage.student_session`
- **No Firebase Auth involved** — purely a Firestore read with localStorage session

### Working Logic
```
Student submits phone + name
  → resolveSchoolSlug() gets current schoolId
  → Query: schoolData('students').where('phone', '==', inputPhone).get()
  → If no match: error "Student not found"
  → If match: case-insensitive name comparison
  → If names match AND student.schoolId === CURRENT_SCHOOL_ID:
    → localStorage.setItem('student_session', JSON.stringify({...}))
    → Redirect to /{slug}/Student-Dashboard
  → If schoolId mismatch: "Invalid school" error
```

### Security Model
- **No password** — anyone who knows a student's name and phone can access their data
- **No session expiration** — localStorage persists until cleared
- **No rate limiting** — unlike admin login
- **No Firebase Auth** — no user account, no custom claims, no AuthGuard

---

## 3. Gaps (CRITICAL)

| Gap | Severity | Detail |
|---|---|---|
| **No password / No OTP** | **P0 🔴** | Phone+name is trivially guessable — no authentication |
| **No session expiry** | P1 | localStorage persists forever |
| **No rate limiting** | P1 | Unlimited login attempts — brute-forceable |
| **No Firebase Auth integration** | P1 | Attacker only needs phone+name to access grades, fees, personal data |
| **No parent account linking** | P2 | No way for parent to have multiple children linked |
| **No forgot/lost phone flow** | P2 | If phone changes, no way to recover access |
| **CSV phone numbers are discoverable** | P1 | If attacker knows a few families at the school, can brute-force |

---

## 4. Competitor Comparison

| Feature | SNR WORLD | Education Desk | Fedena | Classe365 |
|---|---|---|---|---|
| Password-based login | ✗ | ✓ | ✓ | ✓ |
| OTP-based login | ✗ | ✓ | ✓ | ✓ |
| Google/Apple SSO | ✗ | ✗ | Partial | ✓ |
| Biometric | ✗ | ✗ | ✗ | ✗ |
| Session management | ✗ (localStorage) | ✓ | ✓ | ✓ |
| Forgot password | ✗ | ✓ | ✓ | ✓ |

**SNR is uniquely weak here.** Every competitor has proper authentication.

---

## 5. Perfect Version

1. **Firebase Auth** email+password or phone OTP for parents
2. **Parent portal** with multiple children linked to one account
3. **Session management** with expiry (7 days, refreshable)
4. **Forgot password** flow via registered email/SMS
5. **Rate limiting** on failed attempts
6. **Guest mode** limited to notices + events only (no personal data)
7. **QR-based login** from school-issued ID card
