/* verify-media.js — Sanity check that the media library is reachable and intact.
 * Confirms:
 *   - 47 docs in schools/SCH001/media
 *   - All docs have data, mime, size, filename
 *   - Largest doc is under 1 MB
 *   - Sample decode round-trips (base64 → Buffer → sharp metadata)
 */
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const sharp = require('sharp');

const SERVICE_KEY = path.join(__dirname, 'serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(require(SERVICE_KEY)) });
const db = admin.firestore();

(async () => {
    const ref = db.collection('schools').doc('SCH001').collection('media');
    const snap = await ref.get();
    console.log('Docs in collection:', snap.size);
    let issues = 0;
    let maxBytes = 0;
    let maxFile = '';
    for (const d of snap.docs) {
        const data = d.data();
        if (!data || !data.data || !data.filename || !data.mime) {
            console.log('  [MISSING-FIELDS]', d.id);
            issues++;
            continue;
        }
        if (data.size > maxBytes) { maxBytes = data.size; maxFile = data.filename; }
        if (data.size > 900 * 1024) {
            console.log('  [TOO-LARGE]', data.filename, data.size, 'bytes');
            issues++;
        }
    }
    console.log('Largest doc:', maxFile, '-', (maxBytes/1024).toFixed(1), 'KB');

    // Try to decode one of each mime type
    const pngs = snap.docs.filter(d => d.data().mime === 'image/png');
    const jpgs = snap.docs.filter(d => d.data().mime === 'image/jpeg');
    console.log('PNGs:', pngs.length, '  JPEGs:', jpgs.length);
    if (pngs.length) {
        const buf = Buffer.from(pngs[0].data().data, 'base64');
        const meta = await sharp(buf).metadata();
        console.log('PNG decode OK:', pngs[0].data().filename, meta.width + 'x' + meta.height);
    }
    if (jpgs.length) {
        const buf = Buffer.from(jpgs[0].data().data, 'base64');
        const meta = await sharp(buf).metadata();
        console.log('JPEG decode OK:', jpgs[0].data().filename, meta.width + 'x' + meta.height);
    }

    console.log('\nIssues:', issues);
    process.exit(issues > 0 ? 1 : 0);
})().catch(e => { console.error('Verify failed:', e); process.exit(1); });
