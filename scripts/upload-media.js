/* Upload all compressed images to Firestore.
 * Path: schools/SCH001/media/{filename-with-dots-replaced}
 * Per doc: { filename, mime, size, width, height, category, data (base64), uploadedAt }
 */
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const COMPRESSED_DIR = path.join(__dirname, 'compressed');
const SERVICE_KEY = path.join(__dirname, 'serviceAccountKey.json');
const SCHOOL_ID = 'SCH001';

if (!fs.existsSync(SERVICE_KEY)) {
    console.error('Service account key not found at', SERVICE_KEY);
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert(require(SERVICE_KEY)),
});
const db = admin.firestore();

function docIdFromFilename(filename) {
    // Firestore doc IDs cannot contain '.' or '/'. Replace with '_'.
    return filename.replace(/\./g, '_').replace(/\s+/g, '_');
}

(async () => {
    const files = fs.readdirSync(COMPRESSED_DIR)
        .filter(f => f.endsWith('.json') && f !== '_index.json');
    console.log(`Uploading ${files.length} media files to schools/${SCHOOL_ID}/media/ ...\n`);

    const collectionRef = db.collection('schools').doc(SCHOOL_ID).collection('media');
    let count = 0;
    let totalBytes = 0;
    let failed = 0;
    const batch = db.batch();
    let batchCount = 0;
    const BATCH_LIMIT = 400; // Firestore batch write limit is 500

    for (const f of files) {
        const data = JSON.parse(fs.readFileSync(path.join(COMPRESSED_DIR, f), 'utf8'));
        const id = docIdFromFilename(data.filename);
        const docRef = collectionRef.doc(id);

        const docData = {
            filename: data.filename,
            mime: data.mime,
            size: data.size,
            width: data.width,
            height: data.height,
            category: data.category,
            data: data.data,                 // pure base64 (no data: prefix)
            uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        batch.set(docRef, docData, { merge: false });
        batchCount++;
        totalBytes += data.size;
        count++;

        if (batchCount >= BATCH_LIMIT) {
            await batch.commit();
            console.log(`  committed ${batchCount} docs (running total: ${count})`);
            // Note: can't reuse same batch, create new one
            // Re-create by re-binding
        }
    }

    if (batchCount > 0) {
        await batch.commit();
        console.log(`  committed final ${batchCount} docs.`);
    }

    console.log(`\nDone. ${count} files uploaded, ${(totalBytes/1024).toFixed(1)} KB total.`);

    // Quick verify
    const snapshot = await collectionRef.count().get();
    console.log(`Verify: collection now has ${snapshot.data().count} docs.`);

    process.exit(0);
})().catch(e => { console.error('Upload failed:', e); process.exit(1); });
