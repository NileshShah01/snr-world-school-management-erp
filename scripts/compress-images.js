/* Compress every file in /images to <=100 KB.
 * Output: scripts/compressed/{filename}.json with { mime, data, width, height, size }.
 * Skips zero-byte files with a warning.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC_DIR  = path.join(__dirname, '..', 'images');
const OUT_DIR  = path.join(__dirname, 'compressed');
const TARGET_KB = 100;
const MAX_WIDTH = 1280;   // for photos
const LOGO_MAX_WIDTH = 512;
const FACILITY_MAX_WIDTH = 800;

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Categories drive compression strategy.
// Match by filename pattern; fallback to 'photo'.
function categorize(name) {
    const n = name.toLowerCase();
    if (n.includes('logo') || n.includes('favicon'))   return 'logo';
    if (n.includes('banner') || n.includes('admission')) return 'banner';
    if (n.includes('facilities-slide'))                  return 'facility';
    if (n.includes('classroom') || n.includes('school-building')) return 'facility';
    if (n.includes('computer'))                          return 'facility';
    return 'photo';
}

async function compressOne(filename) {
    const src = path.join(SRC_DIR, filename);
    const stat = fs.statSync(src);
    if (stat.size === 0) {
        console.warn(`  [SKIP] ${filename} is 0 bytes (broken file)`);
        return null;
    }
    const cat = categorize(filename);
    const ext = path.extname(filename).toLowerCase();
    const isPng = ext === '.png';
    const buf = fs.readFileSync(src);

    let pipeline = sharp(buf, { failOn: 'none' });
    const meta = await pipeline.metadata();
    const origW = meta.width || 1000;
    const origH = meta.height || 1000;
    const origKB = Math.round(stat.size / 1024);
    console.log(`  ${filename}  ${origKB} KB  ${origW}x${origH}  [${cat}]`);

    // For logos, keep PNG (transparency matters).
    // For everything else, output JPEG.
    const wantPng = (cat === 'logo' || cat === 'favicon') && isPng;
    const maxW = cat === 'logo' ? LOGO_MAX_WIDTH
               : cat === 'facility' ? FACILITY_MAX_WIDTH
               : MAX_WIDTH;

    // Try quality levels until <= TARGET_KB.
    const candidates = wantPng
        ? [
            { format: 'png',  compressionLevel: 9,  options: { palette: true } },
            { format: 'png',  compressionLevel: 9 },
            { format: 'jpeg', quality: 80 },
            { format: 'jpeg', quality: 65 },
          ]
        : [
            { format: 'jpeg', quality: 78 },
            { format: 'jpeg', quality: 65 },
            { format: 'jpeg', quality: 50 },
            { format: 'jpeg', quality: 40 },
          ];

    let best = null;
    for (const c of candidates) {
        let p = sharp(buf, { failOn: 'none' }).resize({
            width: Math.min(maxW, origW),
            withoutEnlargement: true,
        });
        let out;
        if (c.format === 'png') {
            const pngOpts = { compressionLevel: c.compressionLevel };
            if (c.options) Object.assign(pngOpts, c.options);
            out = await p.png(pngOpts).toBuffer();
        } else {
            out = await p.jpeg({ quality: c.quality, mozjpeg: true }).toBuffer();
        }
        const outKB = Math.round(out.length / 1024);
        if (outKB <= TARGET_KB) {
            best = { buffer: out, mime: c.format === 'png' ? 'image/png' : 'image/jpeg', kb: outKB };
            break;
        }
        // Keep the smallest so far
        if (!best || out.length < best.buffer.length) {
            best = { buffer: out, mime: c.format === 'png' ? 'image/png' : 'image/jpeg', kb: outKB };
        }
    }

    if (!best) throw new Error(`Failed to compress ${filename}`);

    // If still over 100KB even with aggressive settings, accept and warn.
    if (best.kb > TARGET_KB) {
        console.warn(`    ! ${filename} ended at ${best.kb} KB (target was ${TARGET_KB})`);
    } else {
        console.log(`    -> ${best.kb} KB  ${best.mime}`);
    }

    // Get final dimensions
    const finalMeta = await sharp(best.buffer).metadata();

    return {
        filename: filename,
        mime: best.mime,
        size: best.buffer.length,
        width: finalMeta.width,
        height: finalMeta.height,
        data: best.buffer.toString('base64'),
        category: cat,
    };
}

(async () => {
    const files = fs.readdirSync(SRC_DIR).filter(f => /\.(jpe?g|png)$/i.test(f));
    console.log(`Compressing ${files.length} images to <= ${TARGET_KB} KB...\n`);

    const results = [];
    const failures = [];
    for (const f of files) {
        try {
            const r = await compressOne(f);
            if (r) {
                results.push(r);
                fs.writeFileSync(path.join(OUT_DIR, f + '.json'), JSON.stringify(r));
            } else {
                failures.push(f);
            }
        } catch (e) {
            console.error(`  [FAIL] ${f}: ${e.message}`);
            failures.push(f);
        }
    }

    console.log(`\nDone: ${results.length} compressed, ${failures.length} failed.`);
    if (failures.length) {
        console.log('Failed files:', failures.join(', '));
    }
    fs.writeFileSync(path.join(OUT_DIR, '_index.json'), JSON.stringify({ results: results.map(r => ({ filename: r.filename, mime: r.mime, size: r.size, width: r.width, height: r.height, category: r.category })), failures }, null, 2));
    console.log(`\nManifest: ${path.join(OUT_DIR, '_index.json')}`);
})();
