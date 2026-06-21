# P3 — Future & Tech Debt

> **Severity:** Low — Address after GTM launch. These are quality-of-life, refactoring, and tech-debt items.  
> **Count:** 28 gaps  
> **Target resolution:** v2.1 — v3.0.

---

## Tech Debt / Code Quality (7)

| # | Gap ID | Title | Type | Effort (h) | Priority Order | Description & Resolution |
|---|--------|-------|------|------------|---------------|--------------------------|
| 1 | P3-TD-01 | **Monolithic admin-dashboard.js (143 KB)** | Tech Debt | 20 | 1 | Single file contains all admin logic. **Resolution:** Split by module (students.js, fees.js, attendance.js, settings.js). Use ES modules with `<script type="module">`. |
| 2 | P3-TD-02 | **All JS in global scope (no modules)** | Tech Debt | 12 | 2 | Every script pollutes `window`. Name collisions likely. **Resolution:** Wrap each module in IIFE or ES module. Use `import`/`export`. |
| 3 | P3-TD-03 | **4 overlapping CSS files with inconsistent design tokens** | Tech Debt | 8 | 3 | Colors, spacing, fonts scattered across style.css, dashboard.css, portal.css, auth.css. **Resolution:** Create design-tokens.css with CSS custom properties. Remove all hardcoded values. Prune dead styles. |
| 4 | P3-TD-04 | **Hash-based routing — URL doesn't update** | Tech Debt | 6 | 4 | `window.location.hash` used for routing. No History API. **Resolution:** Migrate to History API (`pushState`/`popState`). Update all route handlers. |
| 5 | P3-TD-05 | **Hardcoded GitHub Pages URL in admin-dashboard.js** | Tech Debt | 1 | 5 | Base URL hardcoded as `https://snredu.github.io/snredu/`. **Resolution:** Move to config object or detect from `window.location.origin`. |
| 6 | P3-TD-06 | **Duplicate journey timeline (about.html + academics.html)** | Tech Debt | 2 | 6 | Same timeline/carousel duplicated. **Resolution:** Extract to shared component, include via JS or server-side include. |
| 7 | P3-TD-07 | **upload-media.js batch reuse bug** | Bug | 4 | 7 | Batch reference reused across uploads without reset. **Resolution:** Create new batch for each upload operation instead of reusing. |

---

## Build & Tooling (4)

| # | Gap ID | Title | Type | Effort (h) | Priority Order | Description & Resolution |
|---|--------|-------|------|------------|---------------|--------------------------|
| 8 | P3-BLD-01 | **No build step (vanilla HTML/JS)** | Tooling | 16 | 1 | No bundler, no minification, no tree-shaking. **Resolution:** Set up Vite (lightweight) or Webpack. Configure HTML/CSS/JS build pipeline. Add `build` script to package.json. |
| 9 | P3-BLD-02 | **Firebase SDK 8.10.0 (v9 modular not used)** | Dependency | 8 | 2 | Using namespaced SDK (v8). v9 is 50% smaller with tree-shaking. **Resolution:** Migrate all imports to modular v9 syntax (`getFirestore()`, `collection()`, etc.). |
| 10 | P3-BLD-03 | **No bundle optimization** | Performance | 6 | 3 | No code-splitting, no lazy loading. **Resolution:** Dynamic imports for admin modules. Vendor chunk for Firebase SDK. Analyze bundle with `vite-bundle-analyzer`. |
| 11 | P3-BLD-04 | **No CI/CD pipeline** | DevOps | 8 | 4 | Manual deploy. No lint/typecheck gate. **Resolution:** GitHub Actions: lint → test → deploy to Firebase Hosting. Branch protection for `main`. |

---

## Testing & Quality (3)

| # | Gap ID | Title | Type | Effort (h) | Priority Order | Description & Resolution |
|---|--------|-------|------|------------|---------------|--------------------------|
| 12 | P3-TST-01 | **No unit tests (echo "no tests" in package.json)** | Testing | 24 | 1 | Zero test coverage. **Resolution:** Set up Jest + jsdom. Write tests for: auth guard utility, fee calculation, date formatting, Firestore rule validation. Target 30% coverage. |
| 13 | P3-TST-02 | **No emulators configured** | Tooling | 4 | 2 | All development hits production Firestore. **Resolution:** Configure Firebase Emulator Suite (Firestore, Auth, Functions, Storage). Add `firebase emulators:start` script. |
| 14 | P3-TST-03 | **No integration / e2e tests** | Testing | 20 | 3 | No cross-module or UI tests. **Resolution:** Set up Cypress or Playwright. Write e2e flows: login → add student → record fee → generate report card. |

---

## Infrastructure & Cloud (5)

| # | Gap ID | Title | Type | Effort (h) | Priority Order | Description & Resolution |
|---|--------|-------|------|------------|---------------|--------------------------|
| 15 | P3-CLD-01 | **No Cloud Functions for server-side logic** | Architecture | 16 | 1 | All logic client-side. No secure API endpoints. **Resolution:** Identify: payment verification, SMS sending, PDF generation, data export. Write as Firebase Cloud Functions. |
| 16 | P3-CLD-02 | **serviceAccountKey.json on disk** | Security | 1 | 2 | Service account JSON present in repository. **Resolution:** Remove from disk. Use `firebase-admin` with `FIREBASE_CONFIG` env var. Add to `.gitignore`. Rotate key. |
| 17 | P3-CLD-03 | **No rate limiting on Cloud Functions** | Security | 4 | 3 | Functions (once created) are unprotected. **Resolution:** Apply `firebase-functions-rate-limiter` to each callable function. |
| 18 | P3-CLD-04 | **No BigQuery export** | Analytics | 8 | 4 | No data analysis pipeline. **Resolution:** Configure Firebase-to-BigQuery export for Analytics + Crashlytics. Schedule queries for weekly reports. |
| 19 | P3-CLD-05 | **No backup strategy** | Reliability | 4 | 5 | No Firestore export schedule. **Resolution:** Schedule `gcloud firestore export` via Cloud Scheduler (daily). Store in Cloud Storage with 30-day retention. |

---

## UI / Accessibility (3)

| # | Gap ID | Title | Type | Effort (h) | Priority Order | Description & Resolution |
|---|--------|-------|------|------------|---------------|--------------------------|
| 20 | P3-UI-01 | **Missing alt text on many images** | Accessibility | 4 | 1 | Logos, icons, profile photos missing `alt` attributes. **Resolution:** Audit all `<img>` tags. Add descriptive alt text. Decorative images get `alt=""`. |
| 21 | P3-UI-02 | **No proper loading states on CMS sections** | UX | 4 | 2 | CMS sections show blank until data loads. **Resolution:** Add spinner/skeleton for: student list, fee records, attendance grid. Handle empty and error states. |
| 22 | P3-UI-03 | **Color contrast issues** | Accessibility | 3 | 3 | Light text on light backgrounds in several screens. **Resolution:** Audit with axe DevTools or Lighthouse. Fix all AA-level contrast failures. |

---

## Content & Docs (3)

| # | Gap ID | Title | Type | Effort (h) | Priority Order | Description & Resolution |
|---|--------|-------|------|------------|---------------|--------------------------|
| 23 | P3-CNT-01 | **CSP typo: wss://\*.firebaseio.io** | Security | 1 | 1 | Content Security Policy has `*.firebaseio.io` instead of `*.firebaseio.com`. **Resolution:** Fix typo in firebase.json headers. |
| 24 | P3-CNT-02 | **sitemap.xml has only 10 URLs** | SEO | 2 | 2 | Missing most pages. **Resolution:** Regenerate with all 25+ public URLs. Add lastmod, changefreq, priority. |
| 25 | P3-CNT-03 | **No proper README / developer docs** | Documentation | 4 | 3 | README lacks setup instructions, architecture docs. **Resolution:** Write README with: prerequisites, setup steps, folder structure, deployment guide. |

---

## Deprecated / Dead Code (3)

| # | Gap ID | Title | Type | Effort (h) | Priority Order | Description & Resolution |
|---|--------|-------|------|------------|---------------|--------------------------|
| 26 | P3-DEP-01 | **3 redundant report card tools (v1, v2, factory)** | Dead Code | 4 | 1 | Three separate implementations of report card generation. **Resolution:** Audit each. Keep the best one. Delete the other two. Consolidate imports. |
| 27 | P3-DEP-02 | **3 report card directories** | Dead Code | 2 | 2 | `report-card-v1/`, `report-card-v2/`, `report-card-factory/`. **Resolution:** After P3-DEP-01, move winner to `modules/report-card/`. Remove old dirs. |
| 28 | P3-DEP-03 | **Dead demo pages / placeholder modules** | Dead Code | 3 | 3 | Several demo pages referenced nowhere. **Resolution:** Grep for pages not linked from any nav/sidebar. Delete or redirect. |

---

## Summary

| Sub-category | Count | Est. Effort (h) |
|--------------|-------|-----------------|
| Tech Debt / Code Quality | 7 | 53 |
| Build & Tooling | 4 | 38 |
| Testing & Quality | 3 | 48 |
| Infrastructure & Cloud | 5 | 33 |
| UI / Accessibility | 3 | 11 |
| Content & Docs | 3 | 7 |
| Deprecated / Dead Code | 3 | 9 |
| **Total** | **28** | **199** |
