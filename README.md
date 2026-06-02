# apex-public-school

Apex Public School — official website & SNR World School ERP.

## Quick links

- [`IMAGE_STORAGE.md`](./IMAGE_STORAGE.md) — how images/files are stored (Base64 in Firestore, no Firebase Storage)
- [`competitive-analysis-report.md`](./competitive-analysis-report.md) — SNR Edu ERP vs Education Desk
- [`firebase.json`](./firebase.json) — Firebase Hosting rewrites & multi-tenant routing
- [`firestore.rules`](./firestore.rules) — Firestore security rules

## Storage model

All uploaded files (images, PDFs) are stored as **Base64 data URIs** inside
Firestore documents. Firebase Storage is **not** used. See
[`IMAGE_STORAGE.md`](./IMAGE_STORAGE.md) for the contract, limits, and the
shared `ImageStorage` helper.

## Local dev

```bash
npm install
npm run lint     # ESLint + Stylelint
npm run format   # Prettier
```

Firebase Hosting targets:

- `school`   → apex-public-school-portal (single-tenant public site)
- `platform` → snredu-erp (multi-tenant SaaS portal)

Deploy:

```bash
firebase deploy --only hosting:school
firebase deploy --only hosting:platform
```
