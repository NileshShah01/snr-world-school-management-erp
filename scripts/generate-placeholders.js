/* generate-placeholders.js — Create small placeholder PNGs for files the
 * portal pages reference that weren't in the original /images folder.
 *
 *   logo.png            — generic SNR text logo (200x60)
 *   school-logo.png     — generic school building icon (200x60)
 *   default-avatar.png  — person silhouette (200x200, transparent)
 *   principal-sign.png  — stylized signature (400x150, transparent)
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT_DIR = path.join(__dirname, 'compressed');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const placeholders = {
    'logo.png': Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60">
        <rect width="200" height="60" rx="8" fill="#1e3a8a"/>
        <text x="100" y="38" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="22" font-weight="800" fill="white">SNR</text>
    </svg>`),
    'school-logo.png': Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60">
        <rect width="200" height="60" rx="8" fill="#0f172a"/>
        <text x="100" y="30" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="11" font-weight="700" fill="#60a5fa">YOUR</text>
        <text x="100" y="46" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="11" font-weight="700" fill="white">SCHOOL</text>
    </svg>`),
    'default-avatar.png': Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="100" fill="#e2e8f0"/>
        <circle cx="100" cy="80" r="36" fill="#94a3b8"/>
        <path d="M 30 200 Q 30 140 100 140 Q 170 140 170 200 Z" fill="#94a3b8"/>
    </svg>`),
    'principal-sign.png': Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="150" viewBox="0 0 400 150">
        <text x="200" y="100" text-anchor="middle" font-family="Brush Script MT, Comic Sans MS, cursive" font-size="64" font-style="italic" fill="#1e3a8a">Principal</text>
    </svg>`),
};

(async () => {
    for (const [name, svg] of Object.entries(placeholders)) {
        const png = await sharp(svg).png().toBuffer();
        const data = png.toString('base64');
        const meta = await sharp(png).metadata();
        const out = {
            filename: name,
            mime: 'image/png',
            size: png.length,
            width: meta.width,
            height: meta.height,
            data,
            category: name.includes('avatar') ? 'avatar' : name.includes('sign') ? 'sign' : 'logo',
        };
        fs.writeFileSync(path.join(OUT_DIR, name + '.json'), JSON.stringify(out));
        console.log(`  ${name}  ${png.length} bytes  ${meta.width}x${meta.height}`);
    }
    console.log('\nDone. Re-run upload-media.js to push to Firestore.');
})();
