# Performance & Cost Analysis

> **File:** 70_Architecture/Performance_Cost.md
> **Target audience:** Engineering leads, budget planning
> **Date:** June 2026

---

## 1. Page Load Performance

### Admin Dashboard (largest page)
| Metric | Value |
|---|---|
| HTML size | 446 KB (8,053 lines) |
| JS bundle (admin-dashboard.js) | 143 KB (3,304 lines) |
| CSS (portal.css) | 47 KB |
| Total critical path | ~589 KB (uncached) |
| JS files loaded | 31 synchronous `<script>` tags |
| Module system | None (vanilla ES5-compatible) |
| Code splitting | None |
| Lazy loading | None (all JS loads on page start) |

### Script loading order (admin-dashboard.html)
```
1. firebase-app.js          (Firebase SDK 8.10.0)
2. firebase-auth.js
3. firebase-firestore.js
4. firebase-functions.js
5. firebase-config.js
6. image-storage.js
7. app-check.js
8. auth-guard.js
9. access-control.js
10. media-loader.js
11. i18n.js
12-31. erp-*.js, cms-*.js   (20+ ERP module files)
```

**Problem:** All scripts are render-blocking. User cannot interact until all 31 JS files download, parse, and execute. At ~1.5 MB total JS (gzipped ~400 KB), this is 2-3 seconds on 4G.

### CMS pages (school.html, about.html, etc.)
| Metric | Value |
|---|---|
| HTML size | ~30-50 KB each |
| JS (cms-settings.js) | ~80 KB |
| CSS (style.css) | 45 KB |
| Total | ~100-150 KB |
| Scripts loaded | 8-10 |

Better, but still synchronous. Media images resolve after DOMContentLoaded via `media-loader.js`.

---

## 2. Firestore Usage Profile

### Per school (500 students, 30 staff, 100 active parents)

| Operation | Monthly Volume | Breakdown |
|---|---|---|
| Reads | 500,000 | Dashboard list views (60%), student profiles (20%), notices/events (10%), reports (10%) |
| Writes | 150,000 | Attendance (60k), marks/exams (20k), fee invoices (10k), homework (5k), other (55k) |
| Deletes | 5,000 | Old notices, cleanup |
| Storage | 50 MiB | Student photos (30 MiB), gallery (10 MiB), docs/fees (10 MiB) |

### Read amplification examples
- Admin dashboard "Students" tab: `db.collection('students').get()` (no limit!) = 500 reads
- Fee overdue list: `db.collection('fees').get()` = 2000+ reads
- Attendance monthly report: 30 daily attendance docs

---

## 3. Cost Estimation

### Per school/month (Firestore paid tier)

| School Size | Reads | Writes | Storage | Total |
|---|---|---|---|---|
| 200 students | 250k | 80k | 25 MB | ~$0.15 |
| 500 students | 500k | 150k | 50 MB | ~$0.30 |
| 2000 students | 1.5M | 500k | 200 MB | ~$1.00 |

### Formula (Firestore pricing after free tier)
```
Reads:   first 50k/day free, then $0.036/100k reads
Writes:  first 20k/day free, then $0.108/100k writes
Storage: $0.18/GiB stored
```

### Hosting
- Firebase Hosting: 10 GB storage, 100 GB bandwidth/mo free
- Free tier covers ~100 schools at current traffic levels

### Authentication
- First 50k MAU: free
- 50k-100k MAU: $0.0055/MAU
- At 100 schools × 100 users = 10k MAU → free

### At scale (500 schools × 500 students)

| Item | Cost |
|---|---|
| Firestore reads | $90.00 |
| Firestore writes | $81.00 |
| Firestore storage | $2.70 |
| Hosting | Free |
| Auth | Free |
| **Total infra** | **~$150.00/month** |

### Revenue model (proposed)
| Metric | Value |
|---|---|
| Revenue/school | ₹500/month ($6.00) |
| Revenue goal | ₹4/student/month ($0.05) |
| At 500 schools × 500 students | $12,500/month |
| **Gross margin** | **~98.8%** |

---

## 4. Performance Optimization Recommendations

### P1 — Bundle optimization (Week 1-2)
- Current: 31 manual script tags
- Target: Vite or Rollup bundle → 1-2 optimized JS files
- Expected: 60% reduction in HTTP requests, 40% smaller total payload

### P2 — Lazy-load ERP modules (Week 2-4)
- Current: All 20 ERP JS files loaded on page start
- Target: `import('./erp-fees.js')` on-demand when user clicks "Fees" tab
- Pattern for admin-dashboard.html:
```js
const MODULES = {
  fees:      () => import('./erp-fees.js'),
  exams:     () => import('./erp-exams.js'),
  attendance: () => import('./erp-attendance.js'),
  students:  () => import('./js/students.js'),
};
dashboardSection.onclick = async () => {
  const module = await MODULES[section]();
  module.render();
};
```

### P3 — Pagination on all list views
- Current: `.get()` without limit
- Target: `.limit(25).orderBy(...).startAfter(lastDoc)`
- Expected: 20× fewer reads per list view (500→25)

### P4 — Client-side cache for read-only screens
- Notices, events, gallery, holidays: cache in localStorage with 5-minute TTL
- Avoid re-reading on every tab switch
- Invalidate on write (optimistic UI)

### P5 — Service worker (PWA)
- Cache static assets (JS, CSS, HTML) on install
- Cache Firestore reads for offline-capable CMS pages
- Register: `navigator.serviceWorker.register('/sw.js')`

### P6 — Image optimization
- Move from Base64 to Firebase Storage + CDN
- Use WebP format with AVIF fallback
- Implement `<img loading="lazy">`
- Use `srcset` for responsive images

### P7 — Firestore indexes
- Currently no `firestore.indexes.json` deployed
- Result: Firestore auto-indexes single fields only
- Composite queries (classId + rollNo) require index creation
- Deploy indexes **before** enabling pagination

---

## 5. Technical Debt Items

| Item | Impact | Effort |
|---|---|---|
| 31 synchronous script tags | 2-3s page load | 2 weeks (Vite migration) |
| No code splitting | 589 KB initial payload | 2 weeks |
| No Firestore pagination | 500+ reads per list view | 3 weeks (per-module) |
| Base64 images | No CDN, 1.33x storage | 4 weeks (Storage migration) |
| No PWA/service worker | No offline, no cache | 1 week |
| No BigQuery export | Aggregates in Firestore | 2 weeks |
| No sharded counters | Roll number, invoice number | 3 days |
| No firestore.indexes.json | Inefficient queries | 1 day |
| admin-dashboard.js monolith | 3304 lines, hard to maintain | 4 weeks (module split) |

---

## 6. BigQuery Export Recommendation

For analytics (enrollment trends, fee collection rates, exam pass %):
- Use Firestore Export to BigQuery (native extension or scheduled Cloud Function)
- Run aggregates in BigQuery SQL, not Firestore queries
- Dashboards read from BigQuery materialized views

```sql
-- Example: monthly fee collection rate
SELECT
  DATE_TRUNC(paidAt, MONTH) as month,
  SUM(amount) as collected,
  COUNT(DISTINCT invoiceId) as invoicesPaid
FROM `apex-public-school-portal.school_fees.payments`
GROUP BY 1
ORDER BY 1
```

---

## 7. Sharded Counters

For roll numbers, invoice numbers, admission numbers:
```js
// Counter document: counters/{counterName}
// Use distributed counter (10 shards)
async function nextRollNo(classId) {
  const shard = Math.floor(Math.random() * 10);
  const ref = db.collection('counters')
    .doc(`${classId}_rollno_shard_${shard}`);
  const result = await ref.update({
    count: firebase.firestore.FieldValue.increment(1)
  });
  // Read sum of all shards when needed
}
```

---

## 8. Cost Optimization for Scale

| Strategy | Savings | Effort |
|---|---|---|
| Pagination (limit 25) | 80% read reduction on list views | 3 weeks |
| Client-side cache | 50% read reduction on CMS | 1 week |
| Custom claims (no doc read) | 1 read per page load per user | 1 week |
| BigQuery for analytics | Eliminate Firestore aggregation reads | 2 weeks |
| Bundle optimization | Lower bandwidth (Hosting egress) | 2 weeks |
| **Total potential savings** | **~60% of Firestore costs** | |

At 500 schools: $150/mo → **$60/mo** after optimizations.

---

## 9. Current Pain Points

1. Admin dashboard loads all ERP modules upfront — 2-3 second blank screen
2. No pagination means first load reads ALL documents in a collection
3. Base64 images block rendering (data URIs are inline, not parallel)
4. No CDN means every image request hits Firestore (50ms+ vs 5ms from CDN edge)
5. No service worker means no offline access and no caching strategy
6. Monolithic admin-dashboard.js (3,304 lines, 143 KB) is unmaintainable
7. No bundle build step means raw ES6 with CDN imports — no tree-shaking
