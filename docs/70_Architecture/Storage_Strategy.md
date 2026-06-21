# Storage Strategy — Base64 in Firestore (Current) vs Firebase Storage (Target)

> **Source:** `IMAGE_STORAGE.md`, `js/image-storage.js`, `js/media-loader.js`
> **Date:** June 2026

---

## 1. Current Architecture

**ALL files are stored as Base64 data URIs inside Firestore documents.** Firebase Storage is not used. The `window.storage` getter now returns `null` with a migration warning.

### Rationale (from IMAGE_STORAGE.md)
- Single backend service (Firestore only)
- No separate `storage.rules`
- No CORS or download-URL lifecycle
- All reads are a single document fetch

### Implementation

```js
// js/image-storage.js — window.ImageStorage
async function saveFile(file, opts) {
  // 1. Compress (image only, canvas-based)
  const blob = await compressImage(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.82 });
  // 2. Convert to Base64 data URI
  const dataUri = await fileToDataUri(blob);
  // 3. Validate size (< 700KB raw, ~933KB Base64)
  validateDataUri(dataUri, 700000);
  return { dataUri, mime, name, sizeBytes, sizeKB };
}
```

### Limits

| Constraint | Value |
|---|---|
| Firestore doc limit | 1,048,576 bytes (1 MiB) |
| Safe raw input cap | 700 KB (`maxRawBytes()`) |
| Max dimensions | 1600 × 1600 px |
| JPEG quality | 0.82 |
| Base64 overhead | ~33% (4/3 × raw) |
| GIF/animations | Skipped (compression would break animation) |
| Files < 200 KB | Skipped (not worth compressing) |

### Document shape

```js
// Firestore document field
{
  fileData: 'data:image/jpeg;base64,/9j/4AAQ...',   // Base64 data URI
  fileName: 'homework.pdf',
  fileMime: 'application/pdf',
  fileSize: 123456,
}

// Homework attachment variant
{
  attachment: { name: 'hw.pdf', mime: 'application/pdf', sizeBytes: 50000, dataUri: '...' }
}

// Legacy Firebase Storage format (still supported by readers)
{
  fileUrl: 'https://firebasestorage.googleapis.com/...',
  storagePath: '...',
}
```

### Media resolution pipeline

```
HTML: <img data-snr-media="ApexPublicSchoolLogo.png">

1. media-loader.js querySelectorAll('img[data-snr-media]')
2. Preload: batch-fetch from schools/{schoolId}/media/{filename}
3. Cache: localStorage (snr_media_cache_v1, 6-hour TTL, 60-entry cap)
4. Set img.src = 'data:image/jpeg;base64,...'
5. Fallback: /images/{filename} (same-origin) if Firestore doc missing
```

### Cache behavior (media-loader.js)

```js
const STORAGE_KEY = 'snr_media_cache_v1';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const PERSISTED_CACHE_MAX = 60;           // entries

// Batched Firestore queries (max 30 per 'in' query)
async function fetchMany(filenames) {
  for (let i = 0; i < ids.length; i += 30) {
    await db.collection('schools').doc(SCHOOL_ID)
      .collection('media').where('__name__', 'in', chunk).get();
  }
}
```

---

## 2. Modules Using Base64

| File | Stores |
|---|---|
| `js/erp-homework.js` | Homework attachments |
| `js/erp-question-papers.js` | Question paper PDFs/images |
| `js/erp-report-card-tool-v2.js` | Generated PDF report cards |
| `js/erp-timetable.js` | Timetable PDFs/images |
| `js/report-card-upload.js` | Already Base64 |
| `js/cms-admin.js` | CMS images |
| `js/cms-settings.js` | CMS images |
| `js/admin-dashboard.js` | School logo, principal signature, student photos |
| `js/student-dashboard.js` | Renders Base64 `fileData` |
| `js/media-loader.js` | School media (logos, banners, favicon) |

---

## 3. Backward Compatibility

Readers accept either format:
```js
// Acceptable formats (checked at read time):
if (doc.fileData && doc.fileData.startsWith('data:'))    → Base64
if (doc.fileUrl && doc.fileUrl.startsWith('https://'))    → Legacy Firebase Storage
if (typeof doc.attachment === 'string')                    → Old format
if (doc.attachment && doc.attachment.dataUri)              → New attachment object
```

---

## 4. Pros and Cons

### Pros
- No Firebase Storage rules to maintain
- No CORS configuration
- No download-URL expiry management
- Everything in one DB — simple mental model
- No separate service to monitor

### Cons
- **Cost**: Firestore charges per document read/write. A gallery page with 20 photos = 20 reads
- **No CDN**: All images served from Firestore (no edge caching, no Cloud CDN)
- **Doc size limit**: 1 MiB total. Multiple photos per doc impossible without splitting
- **Base64 inflation**: 33% overhead on storage and bandwidth
- **No parallel loading**: Images embedded in docs can't be loaded in parallel by browser
- **No lazy-loading from storage**: Can't use `<img loading="lazy">` with CDN URLs
- **localStorage cache cap**: 60 entries × 6-hour TTL means high churn for large galleries

---

## 5. Competitor Comparison

| Competitor | Storage Approach | CDN | Max File Size | Cost Efficiency |
|---|---|---|---|---|
| **SNR World (current)** | Base64 in Firestore | None | 700 KB | Low (per-read cost) |
| **Fedena** | Local disk + S3 | Optional | 10 MB | High |
| **Education Desk** | S3/GCS + CDN | CloudFront | 50 MB | High |
| **Classe365** | AWS S3 + CloudFront | Yes | 25 MB | High |
| **MyClassboard** | GCS + CDN | Yes | 100 MB | High |

---

## 6. Recommendation: Hybrid Approach

### Phase 1 — Add Firebase Storage (Week 1-2)
```bash
firebase init storage  # Deploy storage.rules
```

Add Storage bucket to `firebase-config.js`:
```js
const firebaseConfig = {
  ...,
  storageBucket: 'apex-public-school-portal.appspot.com'
};
```

### Phase 2 — New uploads to Storage (Week 3)
Update `image-storage.js`:
```js
async function saveFile(file, opts) {
  if (file.size > 100 * 1024) {  // >100KB → Storage
    const ref = storage.ref(`schools/${SCHOOL_ID}/${Date.now()}_${file.name}`);
    await ref.put(file);
    const url = await ref.getDownloadURL();
    return { dataUri: url, storagePath: ref.fullPath, ... };
  }
  // Small files still Base64
}
```

### Phase 3 — Cloud CDN (Week 4-5)
- Enable Cloud CDN on the Firebase Hosting origin
- Set Cache-Control: `public, max-age=86400` on Storage objects
- Use `https://storage.googleapis.com/{bucket}/...` URLs directly

### Phase 4 — Legacy migration (Week 6+)
- Cloud Function to migrate Base64 docs to Storage
- Update `fileData` field to contain Storage download URL
- Remove old Base64 data from Firestore (reduce doc size)

---

## 7. Cost Comparison

### Current (Base64 only) — 500 students
| Item | Volume | Cost |
|---|---|---|
| Media reads (50 gallery + 30 logo/favicon/theme) | ~5000/mo | $0.003 |
| Media writes (5 new images/mo) | ~5/mo | $0.000 |
| Storage overhead (Base64 1.33×) | ~20 MB extra | $0.001 |
| **Total** | | **~$0.004** |

### Target (Firebase Storage + CDN)
| Item | Volume | Cost |
|---|---|---|
| Storage (5 GB media for 500 schools) | 5 GB | $0.13 |
| Downloads (100k/mo) | 100k | $0.12 |
| CDN egress (100 GB/mo) | 100 GB | ~$8.00 |
| **Total** | | **~$8.25/mo** |

Storage is cheaper per-byte for large files, but Base64 in Firestore is cheaper at low volumes. The tipping point is ~100 MB storage per school or ~50k image loads/month.

---

## 8. Key Files

| File | Lines | Purpose |
|---|---|---|
| `IMAGE_STORAGE.md` | 92 | Documentation of current strategy |
| `js/image-storage.js` | 180 | SaveFile, compressImage, validateDataUri |
| `js/media-loader.js` | 241 | DOM resolution + caching |
| `js/cms-admin.js` | — | Uploads CMS images (logos, banners) |
| `js/admin-dashboard.js` | 3304 | Student photo, signature uploads |
