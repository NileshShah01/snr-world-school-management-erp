# `portal/student-login.html` — Student/Parent Login

## Purpose
- Login page for students/parents.
- Uses **phone + name** as credentials (NOT email/password) — see `student-auth.js` for the matching logic.
- "Continue as Visitor" option allows prospective parents to see a demo view.

## File facts
- 267 lines, 9 KB
- Self-contained dark theme (CSS vars `--accent-primary`, `--glass-bg`, etc.)
- Tailwind CDN loaded (for utility classes only)

## Scripts loaded
1. Firebase 9.23.0 compat (`firebase-app`, `firebase-firestore`)
2. `/js/firebase-config.js`
3. `/js/student-auth.js` — handles form submit

## Form behavior
- Fields:
  - `student_phone` — 10-digit mobile, numeric only (regex-stripped via `oninput`)
  - `student_name` — full name as registered
- On submit: `student-auth.js` queries Firestore `students` collection for matching phone + name, then sets local session.
- "Continue as Visitor" button (`loginAsGuest()`) — shows demo data without auth.

## Branding
- Logo + name pulled dynamically (the same polling pattern as `admin-login.html`, but using a `<div id="schoolLogoContainer">` placeholder with a FontAwesome icon fallback)
- Title: "Student Portal | Login" (line 6, with `id="portalTitle"` for dynamic update)

## Gaps
- **🔴 Phone + name auth is weak** — no password, no OTP. Security gap. See `student-dashboard.md` for full analysis.
- **🔴 No "Forgot name" recovery flow** — if parent forgets the exact spelling, they're locked out.
- **🔴 No rate limiting** — brute-force enumeration of phone numbers is possible.
- **🔴 No Firebase App Check / reCAPTCHA** — bot-friendly.
- **🔴 `loginAsGuest()` exposes real student data shapes** — visitor mode likely just shows template data, but should be verified.
- **No "Sign up" link** — how does a new parent create an account? Only through the school's admin adding them.
- **No "Help / Support" link** (besides the "Back to School Website" link).
- **No language toggle**.
- **Tailwind CDN** (line 14) — production should compile locally.
- **Decorative `<div class="blob blob-1/2">`** — uses heavy `filter: blur(120px)` which is GPU-intensive on mobile.
- **Logo placeholder is a static FontAwesome icon** — will be replaced by `student-auth.js` branding loader, but if the JS fails, user sees the default icon with no indication of which school they're logging into.
- **Form has no `autocomplete`** attributes — browser password manager can't save.

## Recommended plan
1. **🔴 Migrate to phone + OTP auth** (Firebase Phone Auth provider).
2. **🔴 Add "Forgot name?" flow** that sends a hint to the registered phone via SMS.
3. **🔴 Add rate limiting** (3 attempts per 5 minutes per phone number).
4. **🔴 Add Firebase App Check** (reCAPTCHA v3).
5. **Verify `loginAsGuest()` doesn't leak real data** — should only render template/sample data, never live student data.
6. **Add a "New student? Contact school" CTA** below the form.
7. **Add `autocomplete="tel"` and `autocomplete="name"`** to the form fields.
8. **Add "Help / WhatsApp Support" link** below the form.
9. **Remove the Tailwind CDN** — move to compiled CSS.
10. **Add a Hindi language toggle** (NEP 2020).
11. **Reduce blob blur radius** (120px is excessive; 60-80px is enough) for mobile performance.
12. **Add structured data** (`WebPage` schema).
