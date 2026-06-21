const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.cert(require(path.join(__dirname, 'serviceAccountKey.json'))) });
const db = admin.firestore();

(async () => {
    const snap = await db.collection('schools').doc('SCH001').collection('media').get();
    const inFirestore = new Set(snap.docs.map(d => d.data().filename));
    console.log('In Firestore:', inFirestore.size);

    // Scan all HTML + JS files for data-snr-media="X" attributes
    const files = [
        ...fs.readdirSync('.').filter(f => f.endsWith('.html')).map(f => '../' + f),
        ...fs.readdirSync('./js').filter(f => f.endsWith('.js')).map(f => '../js/' + f),
        ...fs.readdirSync('./portal').filter(f => f.endsWith('.html')).map(f => '../portal/' + f),
    ];
    const re = /data-snr-media="([^"]+)"/g;
    const reFav = /data-snr-favicon="([^"]+)"/g;
    const referenced = new Set();
    for (const f of files) {
        const fp = path.join(__dirname, f);
        if (!fs.existsSync(fp)) continue;
        const content = fs.readFileSync(fp, 'utf8');
        let m;
        while ((m = re.exec(content)) !== null) referenced.add(m[1]);
        while ((m = reFav.exec(content)) !== null) referenced.add(m[1]);
    }
    console.log('Referenced from code:', referenced.size);

    // Also scan media-loader.js preload calls and cms-settings.js string defaults
    const extraChecks = [
        '../js/cms-settings.js',
        '../js/media-loader.js',
        '../js/admin-auth.js',
        '../js/admin-dashboard.js',
        '../js/cms-admin.js',
        '../js/student-auth.js',
        '../js/student-dashboard.js',
        '../js/erp-id-cards.js',
        '../js/id-card-templates.js',
    ];
    const literalRe = /['"](ApexPublicSchoolLogo\.[a-z]+|logo\.png|school-logo\.png|default-avatar\.png|principal-sign\.png)['"]/g;
    for (const f of extraChecks) {
        const fp = path.join(__dirname, f);
        if (!fs.existsSync(fp)) continue;
        const content = fs.readFileSync(fp, 'utf8');
        let m;
        while ((m = literalRe.exec(content)) !== null) referenced.add(m[1]);
    }
    console.log('Total referenced (with literal defaults):', referenced.size);

    // Cross-check
    const missing = [];
    for (const r of referenced) {
        if (!inFirestore.has(r)) missing.push(r);
    }
    if (missing.length === 0) {
        console.log('\nAll references resolve in Firestore.');
    } else {
        console.log('\nMissing in Firestore:');
        missing.forEach(m => console.log('  -', m));
    }
    process.exit(missing.length > 0 ? 1 : 0);
})();
