/* replace-img-paths.js — One-shot script to rewrite all image references.
 *
 * Replacements (per file, in this order):
 *   1. HTML:  <img src="/images/X" ...>   →  <img data-snr-media="X" ...>
 *   2. HTML:  <img src="./images/X" ...>  →  <img data-snr-media="X" ...>
 *   3. HTML:  <link rel="icon" href="/images/favicon.png"> → add data-snr-favicon
 *   4. JS:    'images/X'  →  'X'   (in cms-settings.js only)
 *
 * Skipped:
 *   - og:image / twitter:image meta tags (keep external github URL)
 *   - Empty / 0-byte source images
 *
 * Run once. Idempotent (safe to re-run): if data-snr-media is already set, skipped.
 */
const fs = require('fs');
const path = require('path');

const HTML_FILES = [
    'school.html', 'about.html', 'academics.html', 'admissions.html',
    'facilities.html', 'gallery.html', 'contact.html', 'platform.html',
];
const JS_FILES = ['js/cms-settings.js'];

const REPLACEMENTS = [
    // <img src="/images/X" alt="..."> → <img data-snr-media="X" alt="...">
    {
        re: /<img\s+([^>]*?)src="\/images\/([\w\s().-]+\.(?:jpe?g|png))"([^>]*?)>/gi,
        fn: (m, before, fname, after) => {
            // Skip if already converted
            if (/\bdata-snr-media\s*=/.test(before + after)) return m;
            return '<img ' + before.trim() + ' data-snr-media="' + fname + '"' + (after ? ' ' + after.trim() : '') + '>';
        }
    },
    // <img src="./images/X" alt="..."> → <img data-snr-media="X" alt="...">
    {
        re: /<img\s+([^>]*?)src="\.\/images\/([\w\s().-]+\.(?:jpe?g|png))"([^>]*?)>/gi,
        fn: (m, before, fname, after) => {
            if (/\bdata-snr-media\s*=/.test(before + after)) return m;
            return '<img ' + before.trim() + ' data-snr-media="' + fname + '"' + (after ? ' ' + after.trim() : '') + '>';
        }
    },
    // <link rel="icon" href="/images/favicon.png" ...> → add data-snr-favicon
    {
        re: /<link\s+rel="icon"\s+href="\/images\/([\w\s().-]+\.(?:jpe?g|png))"([^>]*?)>/gi,
        fn: (m, fname, after) => {
            if (/\bdata-snr-favicon\s*=/.test(after)) return m;
            return '<link rel="icon" data-snr-favicon="' + fname + '" href="data:,"' + (after ? ' ' + after.trim() : '') + '>';
        }
    },
];

const JS_REPLACEMENTS = [
    // 'images/X' → 'X'  (only for image extensions; only the path prefix)
    {
        re: /'images\/([\w\s().-]+\.(?:jpe?g|png))'/g,
        fn: (m, fname) => "'" + fname + "'"
    },
    // "images/X" → "X"
    {
        re: /"images\/([\w\s().-]+\.(?:jpe?g|png))"/g,
        fn: (m, fname) => '"' + fname + '"'
    },
    // HTML inside template literals: <img src="./images/X" ...> → data-snr-media
    {
        re: /<img\s+([^>]*?)src="\.\/images\/([\w\s().-]+\.(?:jpe?g|png))"([^>]*?)>/g,
        fn: (m, before, fname, after) => {
            if (/\bdata-snr-media\s*=/.test(before + after)) return m;
            return '<img ' + before.trim() + ' data-snr-media="' + fname + '"' + (after ? ' ' + after.trim() : '') + '>';
        }
    },
    {
        re: /<img\s+([^>]*?)src="\/images\/([\w\s().-]+\.(?:jpe?g|png))"([^>]*?)>/g,
        fn: (m, before, fname, after) => {
            if (/\bdata-snr-media\s*=/.test(before + after)) return m;
            return '<img ' + before.trim() + ' data-snr-media="' + fname + '"' + (after ? ' ' + after.trim() : '') + '>';
        }
    },
];

let totalHtmlChanges = 0;
let totalJsChanges = 0;

for (const f of HTML_FILES) {
    const fp = path.join(__dirname, '..', f);
    if (!fs.existsSync(fp)) { console.log('  skip ' + f + ' (not found)'); continue; }
    let content = fs.readFileSync(fp, 'utf8');
    let before = content;
    let count = 0;
    for (const r of REPLACEMENTS) {
        content = content.replace(r.re, (...args) => {
            const out = r.fn(...args);
            if (out !== args[0]) count++;
            return out;
        });
    }
    if (content !== before) {
        fs.writeFileSync(fp, content);
        console.log('  ' + f + ' — ' + count + ' replacements');
        totalHtmlChanges += count;
    } else {
        console.log('  ' + f + ' — no changes');
    }
}

for (const f of JS_FILES) {
    const fp = path.join(__dirname, '..', f);
    if (!fs.existsSync(fp)) continue;
    let content = fs.readFileSync(fp, 'utf8');
    let before = content;
    let count = 0;
    for (const r of JS_REPLACEMENTS) {
        content = content.replace(r.re, (...args) => {
            const out = r.fn(...args);
            if (out !== args[0]) count++;
            return out;
        });
    }
    if (content !== before) {
        fs.writeFileSync(fp, content);
        console.log('  ' + f + ' — ' + count + ' replacements');
        totalJsChanges += count;
    } else {
        console.log('  ' + f + ' — no changes');
    }
}

console.log('\nTotal: ' + totalHtmlChanges + ' HTML, ' + totalJsChanges + ' JS replacements.');
