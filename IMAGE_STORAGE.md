# Image & File Storage

All images and uploaded files in this project are stored as **Base64 data URIs**
inside Firestore documents. **Firebase Storage is not used** anywhere.

## Why

- One backend service to manage (Firestore only).
- No separate `storage.rules` to maintain.
- No CORS or download-URL lifecycle issues.
- All reads are a single document fetch.

## Limits

| Constraint                     | Value                              |
| ------------------------------ | ---------------------------------- |
| Firestore document size limit  | 1,048,576 bytes (1 MiB)            |
| Our safe raw input cap         | **700 KB** (`ImageStorage.maxRawBytes()`) |
| Base64 overhead                | ~4/3 of raw bytes                  |
| Effective max raw upload       | ~700 KB                            |
| Image compression defaults     | max 1600 × 1600 px, JPEG quality 0.82 |
| Skipped                        | GIFs (animation), files < 200 KB   |

If a file is rejected, the upload UI must show a clear error suggesting the
user supply a smaller file.

## API (`window.ImageStorage`)

```js
// Convert a File (image) to a Base64 data URI safe for Firestore.
const saved = await ImageStorage.saveFile(file, {
    compress: true,         // default true for images
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 0.82,
    maxBytes: 700_000,      // override default cap
    fieldName: 'Logo',      // included in error messages
});
// saved = { dataUri, mime, name, sizeBytes, sizeKB }

// Low-level helpers
const dataUri = await ImageStorage.fileToDataUri(file);
const blob    = await ImageStorage.compressImage(file, opts);
const check   = ImageStorage.validateDataUri(dataUri, 700_000);
//            = { ok, reason, sizeBytes, sizeKB }

ImageStorage.formatBytes(123456);   // "120.6 KB"
ImageStorage.maxRawBytes();         // 700000
ImageStorage.firestoreLimit();      // 1048576
```

## Document shape

```js
// Old (Firebase Storage):
{ fileUrl: 'https://firebasestorage.googleapis.com/...', storagePath: '...' }

// New (Base64 in Firestore):
{
    fileData:   'data:image/jpeg;base64,/9j/4AAQ...',
    fileName:   'homework.pdf',
    fileMime:   'application/pdf',
    fileSize:   123456,   // decoded raw bytes
}
```

For homework attachments the field is `attachment: { name, mime, sizeBytes, dataUri }`.

## Backward compatibility

Readers (e.g. student-dashboard.js, erp-timetable.js list view) still accept
either:

- a Base64 data URI (`fileData`, `attachment.dataUri`, or `attachment` as string), or
- a legacy `https://` download URL.

This means the codebase can roll forward without a data migration; old records
just keep working until they're updated.

## Migrated modules

| File                            | What it stores                   |
| ------------------------------- | -------------------------------- |
| `js/erp-homework.js`            | Homework attachments             |
| `js/erp-question-papers.js`     | Manual question-paper PDFs/images |
| `js/erp-report-card-tool-v2.js` | Generated PDF report cards       |
| `js/erp-timetable.js`           | Timetable PDFs/images            |

The following were already Base64 (no migration needed):
`report-card-upload.js`, `cms-admin.js`, `cms-settings.js`,
`admin-dashboard.js` (school logo, principal signature, student photos),
`student-dashboard.js` (renders Base64 `fileData`).
