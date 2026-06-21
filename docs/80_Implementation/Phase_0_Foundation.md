# Phase 0: Foundation (1-2 weeks)

> Pre-requisites before building features. Every later phase depends on this.
> **Effort:** 4 engineer-weeks (2 devs, 1 week)

---

## Task Checklist

### 0.1 Backup & Version Control
- [ ] Tag current `main`: `git tag pre-master-plan-2026-06-02 -m "State before Master Plan execution"`
- [ ] Create backup zip: `Compress-Archive -Path D:\Snredu\* -DestinationPath D:\Snredu-backup-YYYY-MM-DD.zip`
- [ ] Export current Firestore: `firebase firestore:export gs://apex-public-school-portal.appspot.com/backups/YYYY-MM-DD`
- [ ] Copy current `firestore.rules` to `firestore.rules.backup-YYYY-MM-DD`

### 0.2 Branch Strategy
- [ ] Create phases branches from `main`: `phase-1`, `phase-2`, `phase-3`, `phase-4`
- [ ] Set branch protection rules on `main` (require PR, require lint passing)
- [ ] Add `.gitignore` entries for `_backups/`, `temp_super_admin/`, `*.zip`, `*.log`

### 0.3 Repo Cleanup
- [ ] Remove `_backups/` from git tracking: `git rm --cached -r _backups/`
- [ ] Move `temp_super_admin/` to `scripts/` or archive
- [ ] Consolidate duplicate code in `js/` (admin-dashboard.js, super-admin-pro.js overlap)
- [ ] Standardize Firebase SDK to 9.23.0 across all pages

### 0.4 Firebase Infrastructure
- [ ] Set up Firebase Emulators locally (Auth + Firestore + Functions)
- [ ] Add `firestore.indexes.json` with v3 composite indexes from `Project Docs/02_Firestore_Schema_v3.md §4`
- [ ] Deploy `firestore.rules` v3 (fix self-elevation hole — see schema doc §5)
- [ ] Add `storage.rules` (when Firebase Storage is added; currently Base64-only per `IMAGE_STORAGE.md`)
- [ ] Enable Firestore backups: nightly `firebase firestore:export gs://apex-public-school-backups/`

### 0.5 CI/CD
- [ ] GitHub Actions workflow: lint + format on every PR
- [ ] GitHub Actions workflow: deploy to staging on `main` merge
- [ ] Add backup script: nightly Firestore export to GCS bucket

### 0.6 Documentation Review
- [ ] Read `Plan/00-master-analysis.md` (architecture overview)
- [ ] Read `Plan/01-gaps.md` (all 98 gaps, severity-coded)
- [ ] Read `Plan/02-roadmap.md` (strategic priorities, OKRs)
- [ ] Read `IMAGE_STORAGE.md` (Base64 contract)
- [ ] Read `Project Docs/01_SaaS_School_Management_Research.md`
- [ ] Read `Project Docs/02_Firestore_Schema_v3.md`
- [ ] Read `Project Docs/03_Implementation_Roadmap.md`

### 0.7 Local Dev Environment
- [ ] Node.js ≥ 18 installed
- [ ] Firebase CLI ≥ 13 installed
- [ ] Git configured (user.name, user.email)
- [ ] Test `firebase serve` / `firebase emulators:start` works locally
- [ ] Verify emulator connects to test project

---

## Modules Involved

| Module | Scope |
|--------|-------|
| Repo | git branches, .gitignore, file cleanup |
| Infrastructure | Firebase project config, emulators, index files |
| Security | firestore.rules v3 rewrite, storage.rules |
| CI/CD | GitHub Actions, backup scripts |
| Docs | All Plan/ and Project Docs/ files |

---

## JS Files to Create/Modify

| File | Action |
|------|--------|
| `firestore.rules` | Rewrite to v3 with helper functions (isAuth, isSuperAdmin, isSchoolMember) |
| `firestore.indexes.json` | Create with v3 composite indexes |
| `storage.rules` | Create (if storage added later) |
| `firebase.json` | Update emulator config, hosting rewrites |
| `.github/workflows/ci.yml` | Create: lint + format on PR |
| `.github/workflows/deploy-staging.yml` | Create: deploy to staging |
| `scripts/backup-firestore.js` | Create: nightly export script |
| `scripts/cleanup-backups.js` | Create: rotate old backups |

---

## Firestore Collections

| Collection | Action |
|------------|--------|
| N/A (Phase 0 is infrastructure, no new collections) | — |

---

## Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| Node.js | ≥ 18 | Runtime |
| Firebase CLI | ≥ 13 | Emulators, deploy |
| Git | latest | Version control |
| GitHub Actions | — | CI/CD |
| GCS bucket | — | Nightly backups |

---

## Estimated Effort (Dev-Days)

| Task | Dev-Days | Dependencies |
|------|----------|--------------|
| 0.1 Backup & tag | 0.5 | — |
| 0.2 Branches | 0.25 | 0.1 |
| 0.3 Repo cleanup | 1 | 0.1 |
| 0.4 Firebase infrastructure | 3 | 0.3 |
| 0.5 CI/CD | 1 | 0.4 |
| 0.6 Docs review | 0.5 | — |
| 0.7 Local env | 0.5 | 0.4 |
| **Total** | **~7** | |

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| firestore.rules v3 breaks existing queries | Medium | Critical | Test all queries against emulator before deploy |
| Emulator setup blocks devs | Medium | High | Write setup script; document in README |
| Backup export fails (permissions) | Low | High | Test export command manually first |
| Branch protection blocks workflow | Low | Medium | Set up after first PR merge |

---

## Success Criteria / Exit Gate

- [ ] 2-engineer team can spin up local emulator, run `npm run dev`, and onboard a school
- [ ] `firestore.rules` v3 deployed and passing all query tests
- [ ] `firestore.indexes.json` committed with all required composite indexes
- [ ] CI pipeline green on a test PR
- [ ] Nightly backup script runs without error
- [ ] `_backups/` and `temp_super_admin/` removed from git tracking
- [ ] All supporting docs read and understood by team
