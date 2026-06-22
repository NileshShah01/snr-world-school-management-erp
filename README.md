# SNR Edu ERP — Apex Public School

Official website & multi-tenant school management platform.

## Live URLs

| Target | URL |
|--------|-----|
| **School site** | https://apex-public-school-portal.web.app |
| **Platform (SaaS)** | https://snredu-erp.web.app |

## Quick Links

- [`IMAGE_STORAGE.md`](./IMAGE_STORAGE.md) — Base64-in-Firestore storage contract
- [`docs/`](./docs/) — Architecture, modules, gap analysis, competitor comparison
- [`firebase.json`](./firebase.json) — Hosting rewrites, CSP, caching headers
- [`firestore.rules`](./firestore.rules) — Multi-tenant security rules (DPDP compliant)
- [`functions/index.js`](./functions/index.js) — Cloud Functions (Razorpay, MSG91)

## Storage Model

All uploaded files (images, PDFs) are stored as **Base64 data URIs** inside Firestore documents. Firebase Storage is **not** used. See [`IMAGE_STORAGE.md`](./IMAGE_STORAGE.md) for the contract, limits, and the shared `ImageStorage` helper.

## Project Structure

```
├── portal/           # Admin, Student, Teacher dashboards (SPA)
├── js/               # Core modules (auth, fees, exams, CMS, etc.)
├── css/              # portal.css, style.css, id-cards.css
├── functions/        # Cloud Functions (Node 18) — Razorpay, MSG91
├── docs/             # 80+ markdown docs (architecture, gaps, competitors)
├── scripts/          # Build-time utilities (media loader, validators)
├── sw.js             # Service Worker (offline caching)
├── manifest.json     # PWA manifest
└── firebase.json     # Hosting config (2 targets, CSP, cache headers)
```

## Phase Completion (7/7)

| Phase | Scope | Status |
|-------|-------|--------|
| 0 | Emergency fixes (secrets, gitignore, auto-provision) | ✅ |
| 1 | Security (CSP, Firestore rules, XSS, App Check) | ✅ |
| 2 | Core functionality (nav, attendance, fees, teacher tools) | ✅ |
| 3 | Privacy/DPDP (consent, DPO, DSR, i18n) | ✅ |
| 4 | Integrations (Razorpay, MSG91 — scaffolding only) | ⏭️ Skipped |
| 5 | Infra/Hosting (ignore list, build scripts, caching) | ✅ |
| 6 | Performance (caching, defer/async, SW, lazy images) | ✅ |
| 7 | Docs cleanup (removed 300KB archived plans) | ✅ |

## Local Development

```bash
npm install
npm run lint     # ESLint + Stylelint
npm run format   # Prettier
npm run prebuild # Validates firebase-config.js
npm run build    # No-op (vanilla JS, no bundler)
```

## Deploy

```bash
# Hosting only (both targets)
npm run deploy

# Individual targets
npm run deploy:school
npm run deploy:platform

# Functions (after setting config)
firebase functions:config:set razorpay.key_id="..." razorpay.key_secret="..."
firebase functions:config:set msg91.auth_key="..." msg91.sender_id="SNREDU"
firebase functions:config:set school.admin_phone="+9198XXXXXXXX"
firebase deploy --only functions
```

## Key Tech

- **Frontend**: Vanilla HTML/CSS/JS (ES2020), no framework
- **Backend**: Firebase (Auth, Firestore, Functions, Hosting)
- **Auth**: Phone-based (legacy), Firebase Auth migration planned
- **Multi-tenant**: `schools/{schoolId}` subcollections
- **Compliance**: DPDP Act 2023 (consent, DSR, DPO, audit log)

## License

ISC