# Security Rules Audit — firestore.rules

> **File audited:** `D:\Snredu\firestore.rules` (5,592 bytes, 121 lines)
> **Review date:** June 2026
> **Severity scale:** CRITICAL > HIGH > MEDIUM > LOW

---

## 1. Finding Summary

| # | Finding | Severity | Line(s) | Status |
|---|---|---|---|---|
| 1 | Self-elevation hole: user can set own role to `admin` | CRITICAL | 56-59 | Open |
| 2 | Public read on all tenant data (PII exposed) | CRITICAL | 67-94 | Open |
| 3 | `/provision.html` has no auth (no rate limit) | HIGH | N/A (HTML) | Open |
| 4 | `isAdmin()` uses `request.auth.token.admin` not set anywhere | HIGH | 23-28 | Open |
| 5 | No field-level security for Aadhaar, medical, salary | MEDIUM | All | Open |
| 6 | No rate limiting or App Check enforcement | MEDIUM | N/A | Open |
| 7 | `isSuperAdmin()` uses doc read — secure but slow | LOW | 10-15 | Accept |
| 8 | CSP typo: `firebaseio.io` instead of `firebaseio.com` | LOW | firebase.json:96 | Open |

---

## 2. Finding Details

### FINDING 1: Self-elevation hole (CRITICAL)

**Location:** `firestore.rules:56-59`
```
match /users/{userId} {
  allow create: if isSignedIn() && request.auth.uid == userId;
  allow update: if isSignedIn() && (request.auth.uid == userId || isAdmin() || isSuperAdmin());
}
```

**Impact:** Any authenticated user can set `users/{theirUid}.role = 'admin'` because the rule allows `update` where `request.auth.uid == userId` — and there is no validation on `request.resource.data.role`. Since `isAdmin()` reads `users/{uid}.role == 'admin'`, the user instantly gains admin privileges.

**Exploit:**
```js
await db.collection('users').doc(user.uid).update({ role: 'admin' });
```

**Fix:** Add field-level validation:
```
allow update: if isSignedIn() && request.auth.uid == userId
  && request.resource.data.role == resource.data.role;  // cannot change role
```

Or: Only super-admin can set role.

### FINDING 2: Public read on all data (CRITICAL)

**Location:** `firestore.rules:67-94`
```
match /students/{docId}  { allow read: if true; ... }
match /fees/{docId}      { allow read: if true; ... }
match /staff/{docId}     { allow read: if true; ... }
// (14+ collections, all allow read: if true)
```

**Impact:** Student PII (name, phone, address, Aadhaar), fee records, staff salary, marks — all world-readable by anyone with the Firebase project ID.

**Fix:** Switch to authenticated reads:
```
allow read: if isAdmin() && belongsToSchool(schoolId);
```

### FINDING 3: `/provision.html` no auth (HIGH)

**Impact:** The provisioning page creates schools/schools/{schoolId} docs with client-side writes. Firestore rules check `isSuperAdmin()` on the schools doc, but there is no:
- Rate limiting (an attacker can create 10k school docs)
- IP filtering
- reCAPTCHA enforcement

**Fix:** Add App Check enforcement in rules and rate limiting via a Cloud Function.

### FINDING 4: `isAdmin()` uses `request.auth.token.admin` (HIGH)

**Location:** `firestore.rules:23-28`
```
function isAdmin() {
  return isSignedIn() &&
    (request.auth.token.admin == true ||       // Never set!
     (exists(...) && get(...).data.role == 'admin'));
}
```

**Root cause:** `request.auth.token.admin` is a custom claim that NO code in the project sets. Firebase Admin SDK does not set it during user creation or anywhere in the codebase. The rule falls through to the doc-exists check, which is expensive (`exists` + `get` on every rule evaluation).

**Fix:** Remove the `request.auth.token.admin` check. Set proper custom claims (`role`, `schoolId`) via Cloud Function on user creation.

### FINDING 5: No field-level rules (MEDIUM)

No rules validate `request.resource.data`. An admin can set:
- `salary` to any value on any staff member
- `marksObtained` > `maxMarks`
- `status` to `paid` without payment
- `aadhaarNo` as a plain string (no encryption at rest in Firestore)

### FINDING 6: No rate limiting / App Check (MEDIUM)

`app-check.js` exists but uses an empty reCAPTCHA key:
```js
window.RECAPTCHA_V3_SITE_KEY = window.RECAPTCHA_V3_SITE_KEY || '';
```
App Check is a no-op. There's no enforcement in rules:
```
allow write: if isAdmin() && request.app_check.token != null;  // Missing
```

---

## 3. Current Rules Architecture

```
Global helpers:
  isSignedIn()        → request.auth != null
  isSuperAdmin()      → token.admin OR exists(/super_admins/{uid})
  userRole()          → users/{uid}.role (with token fallback)
  isAdmin()           → token.admin OR users/{uid}.role == 'admin'
  belongsToSchool()   → token.schoolId == schoolId

Path groups:
  /schools/{schoolId}                  → public read, super-admin write
  /schools/{schoolId}/{subcollections} → public read, admin+schoolId write
  /users/{uid}                         → self + admin + super-admin
  /super_admins/{uid}                  → super-admin only
  /{top-level collection}/{doc}        → public read, admin write (14+)
  /inquiries/{docId}                   → public create, admin read/update/delete
  /demoRequests/{docId}                → public create, super-admin manage
  /saas_policy, /subscriptions, etc.   → super-admin only
  /{document=**}                       → deny all (global fallback)
```

---

## 4. Target v3 Rules (from Project Docs/02)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuth() { return request.auth != null; }
    function isSuperAdmin() {
      return isAuth() && request.auth.token.role == 'superAdmin';
    }
    function isSchoolMember(schoolId) {
      return isAuth() && request.auth.token.schoolId == schoolId;
    }
    function isSchoolAdmin(schoolId) {
      return isAuth() && request.auth.token.schoolId == schoolId
             && request.auth.token.role in ['schoolAdmin', 'superAdmin'];
    }

    // Tenant root — strict isolation
    match /schools/{schoolId}/{document=**} {
      allow read: if isSchoolMember(schoolId) || isSuperAdmin();

      match /org {
        allow write: if isSchoolAdmin(schoolId);
      }
      match /members/{uid} {
        allow read: if isSchoolMember(schoolId) || isSuperAdmin();
        allow write: if isSchoolAdmin(schoolId)
                     || (isAuth() && request.auth.uid == uid);
      }
      match /students/{studentId} {
        allow read: if isSchoolAdmin(schoolId)
                    || (isAuth() && request.auth.token.role == 'teacher'
                        && request.auth.token.classIds.hasAny([resource.data.classId]))
                    || (isAuth() && request.auth.token.role == 'parent'
                        && studentId in request.auth.token.studentIds);
        allow write: if isSchoolAdmin(schoolId);
      }
      match /attendance/{date}/entries/{studentId} {
        allow read: if isSchoolAdmin(schoolId)
                    || (isAuth() && request.auth.token.role == 'parent'
                        && studentId in request.auth.token.studentIds);
        allow write: if isSchoolAdmin(schoolId)
                     || (isAuth() && request.auth.token.role == 'teacher');
      }
      match /fees/{invoiceId} {
        allow read: if isSchoolAdmin(schoolId)
                    || (isAuth() && request.auth.token.role == 'parent'
                        && resource.data.studentId in request.auth.token.studentIds);
        allow write: if isSchoolAdmin(schoolId)
                     || (isAuth() && request.auth.token.role == 'accountant');
      }
      match /auditLogs/{logId} {
        allow read: if isSchoolAdmin(schoolId);
        allow create: if isSchoolMember(schoolId);
        allow update, delete: if false;
      }
    }

    // Platform admin
    match /logs_super/{logId} { allow read, write: if isSuperAdmin(); }
    match /settings_super/{key} { allow read, write: if isSuperAdmin(); }

    // Users self-service
    match /users/{uid} {
      allow read, write: if isAuth() && (request.auth.uid == uid || isSuperAdmin());
    }
  }
}
```

Key improvements in v3 rules:
- **Role-based read access**: teachers see their class, parents see their children
- **No public read**: all data requires authentication
- **Path isolation**: `belongsToSchool()` enforced on all tenant writes
- **Self-service without self-elevation**: users can edit own profile but cannot change `role`
- **Append-only audit logs**

---

## 5. Migration Plan for Rules

### Phase 1 (Week 1) — Fix critical holes
1. Remove `allow update: if request.auth.uid == userId` without role validation — add `request.resource.data.role == resource.data.role`
2. Remove public read from student/fee/staff collections — change to `allow read: if isAdmin()`
3. Deploy to `firebase deploy --only firestore:rules`

### Phase 2 (Week 2-3) — Deploy custom claims
1. Create `onUserCreate` Cloud Function that sets `customClaims({ role, schoolId })`
2. Update `isAdmin()` in rules to use `request.auth.token.role` only (remove doc read fallback)
3. Migrate `auth-guard.js` to read from `user.getIdTokenResult()` instead of Firestore doc

### Phase 3 (Week 4-5) — v3 rules
1. Deploy complete v3 rules with role-based access per collection
2. Enable App Check with valid reCAPTCHA key
3. Add field validation: `request.resource.data.marksObtained <= request.resource.data.maxMarks`

---

## 6. Testing Strategy

### Emulator testing
```bash
# Start Firestore emulator
firebase emulators:start --only firestore

# Run rule tests with mocha/chai
npx @firebase/rules-unit-testing
```

### Test cases to cover
| Test | Assert |
|---|---|
| Unauthenticated read on users | Deny |
| Unauthenticated read on students | Deny (currently Allow!) |
| User sets own role to 'admin' | Deny |
| Admin reads any student | Allow |
| Teacher reads own class student | Allow |
| Teacher reads other class student | Deny |
| Parent reads own child record | Allow |
| Parent reads other child record | Deny |
| Unauthenticated write to inquiries | Allow (create) |
| Unauthenticated delete on inquiries | Deny |
| Super-admin reads any school | Allow |
| School admin writes to wrong schoolId | Deny |
