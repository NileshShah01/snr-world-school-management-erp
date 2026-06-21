# Multi-Tenant Routing Architecture

> **File:** 70_Architecture/Multi_Tenant_Routing.md
> **Related:** `firebase.json`, `js/firebase-config.js`, `js/auth-guard.js`

---

## 1. Request Lifecycle

```
Browser request:
  https://apexps.snredu-erp.web.app/Admin-Dashboard
                  │
                  ▼
  [DNS]
    ├── snredu-erp.web.app  ────▶ Firebase Hosting (platform target)
    └── apexps.snredu-erp.web.app ──▶ (not a Firebase subdomain, custom domain)
                  │
                  ▼
  [Firebase Hosting Rewrite]
    firebase.json:
      { "source": "/*/Admin-Dashboard**",
        "destination": "/portal/admin-dashboard.html" }
                  │
                  ▼
  [Client-side slug resolution]
    js/firebase-config.js:
      1. getURLSlug()              → "apexps"
      2. resolveSchoolSlug()       → Firestore: schools.where('subdomain','==','apexps')
      3. sessionStorage.setItem('CURRENT_SCHOOL_ID', 'SCH002')
                  │
                  ▼
  [AuthGuard boots]
    js/auth-guard.js:
      auth.onAuthStateChanged() → reads users/{uid}.role
                  │
                  ▼
  [App renders with school context]
    schoolData('students') → schools/SCH002/students
    applyGlobalTheme()     → schools/SCH002/settings/theme
```

---

## 2. Hosting Targets

Two Firebase Hosting targets in one project (`firebase.json`):

| Target | Public Dir | Primary URL | Purpose |
|---|---|---|---|
| `school` | `.` | `apex-public-school-portal.web.app` | Apex Public School CMS |
| `platform` | `.` | `snredu-erp.web.app` | Multi-tenant ERP + marketing |

Deploy commands:
```bash
firebase deploy --only hosting:school
firebase deploy --only hosting:platform
```

---

## 3. URL Routing Schema

### Path-based tenancy

```
/{slug}/Admin-Dashboard
/{slug}/Student-Dashboard
/{slug}/Admin-Login
/{slug}/Student-Login
/{slug}/portal/admin-dashboard.html
/{slug}/css/main.css
/{slug}/js/app.js
```

### Slug resolution (firebase-config.js:63-75)

```js
function getURLSlug() {
  const path = window.location.pathname;
  const pathParts = path.split('/').filter(p => p !== '');
  if (pathParts.length > 0) {
    const potentialSlug = pathParts[0];
    const reserved = ['portal', 'images', 'js', 'css', 'assets',
      'pdf', 'scripts', '_backups',
      'admin-login.html', 'student-login.html',
      'platform.html', 'super-admin.html', 'super-admin-pro.html'];
    if (!reserved.includes(potentialSlug.toLowerCase()) && !potentialSlug.includes('.')) {
      return potentialSlug;
    }
  }
  return null;
}
```

### Resolver priority chain (firebase-config.js:84-116)

```
getSchoolIdFromURL():
  1. ?schoolId= query param
  2. sessionStorage CURRENT_SCHOOL_ID
  3. URL slug match (sch001, apex)
  4. Subdomain hostname mapping
  5. Default → SCH001 (Apex)
```

---

## 4. Firestore Helpers

```js
// Prepends schools/{schoolId} to collection path (v3 schema)
function schoolData(collectionName) {
  return db.collection('schools').doc(CURRENT_SCHOOL_ID)
           .collection(collectionName);
}

// Single doc access within school context
function schoolDoc(collectionName, docId) {
  return db.collection('schools').doc(CURRENT_SCHOOL_ID)
           .collection(collectionName).doc(docId);
}

// Root school metadata ref
function schoolRef() {
  return db.collection('schools').doc(CURRENT_SCHOOL_ID);
}

// Adds schoolId + updatedAt to data (backward compat)
function withSchool(data) {
  return { ...data, schoolId: CURRENT_SCHOOL_ID,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
}
```

---

## 5. Data Attributes for Per-School Content

HTML elements carry `data-school-field` attributes resolved by `cms-settings.js`:

```html
<!-- school.html -->
<h1 data-school-field="name">Apex Public School</h1>
<p data-school-field="address.line1">Anjani Bazar, Saran</p>
<p data-school-field="contact.phone">+91-9876543210</p>
<img data-snr-media="logo.png" alt="School Logo">

<!-- Dynamic button routes -->
<a href="/{slug}/Admin-Dashboard" data-school-link>Dashboard</a>
<a href="/{slug}/Student-Dashboard" data-school-link>Student Portal</a>
```

---

## 6. Authentication Flow

### Custom claims architecture

```
User signs up → Cloud Function onCreate:
  setCustomUserClaims(uid, {
    schoolId: 'SCH001',
    role: 'teacher',
    classIds: ['CLS001', 'CLS002'],
    studentIds: []  // for parents
  })

Client reads claims:
  const token = await user.getIdTokenResult();
  // token.claims.schoolId, token.claims.role
```

### Current auth flow (pre-custom-claims)

```
1. Login: auth.signInWithEmailAndPassword(email, password)
2. AuthGuard boots: auth.onAuthStateChanged(user)
3. Role lookup: db.collection('users').doc(user.uid).get() → .data().role
4. Session: sessionStorage.setItem('USER_ROLE', role)
5. AccessControl.can(module, action) checks role permissions
```

**Problem:** The role lookup is a Firestore read on every page load. Custom claims eliminate this read.

### Current role hierarchy (access-control.js)

```
admin       → Full access to all modules
teacher     → Read students, write attendance/exams/homework
student     → Read own data only
parent      → Read own child's data
accountant  → Fees module only
librarian   → Library module only
transport   → Transport module only
viewer      → Read-only on most modules
```

---

## 7. Custom Domain Flow

```
1. School admin requests custom domain (e.g., apexpublicschool.in)
2. Super-admin in platform UI:
   - Adds CNAME record: apexpublicschool.in → snredu-erp.web.app
   - Sets school.domain = 'apexpublicschool.in' in Firestore
3. resolveSchoolSlug() queries schools.where('domain','==', host)
4. Returns schoolId → Stored in sessionStorage
```

---

## 8. Theme Application

```js
async function applyGlobalTheme() {
  await window.schoolBootstrapReady;
  const themeDoc = await schoolDoc('settings', 'theme').get();
  // Fallback: db.collection('settings').doc('theme').get()
  if (themeDoc.exists) {
    const theme = themeDoc.data();
    document.documentElement.style.setProperty('--primary', theme.primaryColor);
    document.documentElement.style.setProperty('--secondary', theme.sidebarColor);
  }
}
```

Theme is applied from `schools/{schoolId}/settings/theme` doc with CSS custom properties.

---

## 9. CSP Headers (firebase.json)

### Current CSP
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com
  https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com
  https://cdn.sheetjs.com https://cdn.tailwindcss.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com data:;
img-src 'self' data: blob: https:;
connect-src 'self' https://*.googleapis.com https://*.firebaseio.com
  wss://*.firebaseio.com https://*.firebaseio.io     ← TYPO
  https://firestore.googleapis.com https://identitytoolkit.googleapis.com;
frame-src 'self' https://*.firebaseapp.com;
```

### TYPO: `firebaseio.io` → should be `firebaseio.com`

Line 96 of `firebase.json` (platform target only):
```
https://*.firebaseio.io wss://*.firebaseio.io
```
The school target (line 35) correctly has `firebaseio.com`. The platform target has the typo. This can cause WebSocket connection failures for Firestore real-time listeners on the platform target.

---

## 10. Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    USER BROWSER                          │
│  https://apexps.snredu-erp.web.app/Admin-Dashboard      │
└──────────┬──────────────────────────────────────────────┘
           │ DNS
           ▼
┌─────────────────────────────────────────────────────────┐
│              FIREBASE HOSTING (platform)                 │
│  Rewrite: /*/Admin-Dashboard → /portal/admin-dashboard  │
│  CSP: script-src 'self' 'unsafe-inline' ...             │
└──────────┬──────────────────────────────────────────────┘
           │ Serve static HTML
           ▼
┌─────────────────────────────────────────────────────────┐
│         CLIENT-SIDE BOOT STRAP                           │
│                                                          │
│  ┌─────────────┐  ┌─────────────────┐  ┌────────────┐  │
│  │ firebase-    │  │ resolveSchool-  │  │ applyGlobal│  │
│  │ config.js    │──▶ Slug()          │──▶ Theme()    │  │
│  │ init Firebase│  │ query Firestore │  │ CSS vars   │  │
│  └─────────────┘  │ for school match│  └────────────┘  │
│                   └───────┬─────────┘                   │
│                           │ sessionStorage               │
│                           ▼ CURRENT_SCHOOL_ID            │
│  ┌─────────────┐  ┌─────────────────┐                   │
│  │ auth-guard  │  │ admin-dashboard │                   │
│  │ .js         │  │ .js             │                   │
│  │ role check  │  │ schoolData()    │                   │
│  └─────────────┘  │ helpers         │                   │
│                   └─────────────────┘                   │
└─────────────────────────────────────────────────────────┘
           │ Firestore reads/writes
           ▼
┌─────────────────────────────────────────────────────────┐
│            FIRESTORE (apex-public-school-portal)          │
│                                                          │
│  schools/SCH002/                                          │
│    ├── students/{studentId}                               │
│    ├── fees/{invoiceId}                                   │
│    ├── attendance/{date}/entries/{studentId}             │
│    └── ...                                                │
└─────────────────────────────────────────────────────────┘
```
