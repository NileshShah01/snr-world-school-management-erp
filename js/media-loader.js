/* media-loader.js — Resolve <img data-snr-media="filename.ext"> to base64 data URIs.
 *
 * Source of truth: Firestore `schools/{schoolId}/media/{id}` collection.
 *   Each doc: { filename, mime, size, width, height, category, data (base64) }
 *
 * Resolves three kinds of references in the DOM:
 *   1. <img data-snr-media="X">  → set src to data URL
 *   2. <link rel="icon" data-snr-favicon="X"> → set href to data URL
 *   3. CSS `url('/images/X')` or `url('images/X')` inside <style> tags
 *      → replace with data URL (limited to single-quoted forms to keep it safe)
 *
 * Caches all media in memory + localStorage (6-hr TTL). Subsequent references
 * are instant. Gallery pages with 20+ images do ONE batched Firestore read.
 *
 * Public API:
 *   - HTML:  <img data-snr-media="filename.ext">
 *            <link rel="icon" data-snr-favicon="filename.ext" href="data:,">
 *   - JS:    await SNRMedia.getDataUrl('ApexPublicSchoolLogo.png')
 *            await SNRMedia.getDoc('ApexPublicSchoolLogo.png')
 *            await SNRMedia.preload(['img1.jpg', 'img2.jpg'])
 *
 * Falls back to /images/{filename} on the same origin if the Firestore doc
 * is missing — so the page does not break if uploads are out-of-sync.
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'snr_media_cache_v1';
    const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
    const SCHOOL_ID = (window.CURRENT_SCHOOL_ID) || 'SCH001';
    // Cap on persisted cache to keep localStorage under 5 MB.
    const PERSISTED_CACHE_MAX = 60;

    /** @type {Map<string, {mime:string, data:string, expires:number}>} */
    const cache = new Map();
    let inflight = null;

    function docIdFromFilename(filename) {
        return String(filename).replace(/\./g, '_').replace(/\s+/g, '_');
    }

    // ====== localStorage cache ======
    function loadPersistent() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const obj = JSON.parse(raw);
            const now = Date.now();
            Object.keys(obj).forEach(k => {
                const e = obj[k];
                if (e && e.expires > now) cache.set(k, e);
            });
        } catch (e) { /* corrupt cache — ignore */ }
    }

    function savePersistent() {
        try {
            const obj = {};
            cache.forEach((v, k) => { obj[k] = v; });
            const keys = Object.keys(obj);
            if (keys.length > PERSISTED_CACHE_MAX) {
                keys.sort((a, b) => obj[b].expires - obj[a].expires);
                const trimmed = {};
                keys.slice(0, PERSISTED_CACHE_MAX).forEach(k => { trimmed[k] = obj[k]; });
                localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
            } else {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
            }
        } catch (e) {
            try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
        }
    }

    function remember(filename, mime, data) {
        const entry = { mime: mime, data: data, expires: Date.now() + CACHE_TTL_MS };
        cache.set(filename, entry);
        savePersistent();
    }

    // ====== Firestore fetch ======
    async function fetchOne(filename) {
        if (!window.db) throw new Error('Firestore not ready');
        const id = docIdFromFilename(filename);
        const snap = await window.db
            .collection('schools').doc(SCHOOL_ID)
            .collection('media').doc(id)
            .get();
        if (!snap.exists) return null;
        const d = snap.data();
        if (!d || !d.data) return null;
        remember(filename, d.mime || 'image/jpeg', d.data);
        return cache.get(filename);
    }

    async function fetchMany(filenames) {
        if (!window.db) throw new Error('Firestore not ready');
        const ids = filenames.map(docIdFromFilename);
        // Firestore `in` query limit is 30 — chunk
        const chunks = [];
        for (let i = 0; i < ids.length; i += 30) chunks.push(ids.slice(i, i + 30));
        const fetched = [];
        for (const chunk of chunks) {
            const qs = await window.db
                .collection('schools').doc(SCHOOL_ID)
                .collection('media')
                .where(firebase.firestore.FieldPath.documentId(), 'in', chunk)
                .get();
            qs.forEach(d => {
                const data = d.data();
                if (data && data.filename) {
                    remember(data.filename, data.mime || 'image/jpeg', data.data);
                    fetched.push(data.filename);
                }
            });
        }
        return fetched;
    }

    // ====== Public API ======
    async function getDoc(filename) {
        if (cache.has(filename)) return cache.get(filename);
        return await fetchOne(filename);
    }

    async function getDataUrl(filename) {
        const d = await getDoc(filename);
        if (!d) return null;
        return 'data:' + d.mime + ';base64,' + d.data;
    }

    async function preload(filenames) {
        if (inflight) return inflight;
        const unique = Array.from(new Set(filenames)).filter(f => f && !cache.has(f));
        if (unique.length === 0) return Promise.resolve();
        inflight = (async () => {
            try { await fetchMany(unique); }
            catch (e) { console.warn('[SNRMedia] preload failed:', e && e.message); }
            finally { inflight = null; }
        })();
        return inflight;
    }

    // ====== DOM: img tags ======
    async function resolveImages() {
        const imgs = document.querySelectorAll('img[data-snr-media]');
        if (imgs.length === 0) return [];
        const names = Array.from(imgs).map(i => i.getAttribute('data-snr-media')).filter(Boolean);
        await preload(names);
        imgs.forEach((img) => {
            const name = img.getAttribute('data-snr-media');
            if (!name) return;
            const entry = cache.get(name);
            if (entry) {
                img.src = 'data:' + entry.mime + ';base64,' + entry.data;
                img.removeAttribute('data-snr-media');
                img.setAttribute('data-snr-loaded', '1');
            } else {
                img.src = 'images/' + name;
                img.setAttribute('data-snr-fallback', '1');
            }
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        });
        return names;
    }

    // ====== DOM: favicon ======
    async function resolveFavicon() {
        const link = document.querySelector('link[rel~="icon"][data-snr-favicon]');
        if (!link) return null;
        const name = link.getAttribute('data-snr-favicon');
        await preload([name]);
        const entry = cache.get(name);
        if (entry) {
            link.href = 'data:' + entry.mime + ';base64,' + entry.data;
            link.setAttribute('data-snr-loaded', '1');
        }
        return name;
    }

    // ====== DOM: CSS url() inside <style> tags ======
    async function resolveCssUrls() {
        // Find every url('/images/FILENAME') or url('images/FILENAME') inside
        // a <style> block (handles single-quote form only — keeps it safe).
        // Collect filenames, fetch, then patch.
        const re = /url\(\s*['"]\/?images\/([\w\s().-]+\.(?:jpe?g|png))['"]\s*\)/gi;
        const seen = new Set();
        const blocks = Array.from(document.querySelectorAll('style'));
        blocks.forEach((s) => {
            const text = s.textContent || '';
            let m;
            while ((m = re.exec(text)) !== null) seen.add(m[1]);
        });
        if (seen.size === 0) return [];

        const names = Array.from(seen);
        await preload(names);
        // Patch every style block by replacing the url(...) string with the data URL.
        blocks.forEach((s) => {
            let text = s.textContent || '';
            text = text.replace(re, (full, name) => {
                const entry = cache.get(name);
                if (entry) {
                    return "url('data:" + entry.mime + ";base64," + entry.data + "')";
                }
                return full; // leave fallback
            });
            s.textContent = text;
        });
        return names;
    }

    async function resolveAll() {
        const names = new Set();
        const a = await resolveImages();
        const b = await resolveFavicon();
        const c = await resolveCssUrls();
        [a, b, c].forEach(arr => {
            if (!arr) return;
            if (typeof arr === 'string') names.add(arr);
            else arr.forEach(n => names.add(n));
        });
        return names;
    }

    // ====== Bootstrap ======
    loadPersistent();
    window.SNRMedia = { getDoc, getDataUrl, preload, resolveAll, SCHOOL_ID };

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    ready(() => {
        resolveAll().catch(e => console.warn('[SNRMedia] resolve failed:', e && e.message));
        // Re-resolve when other scripts (e.g. cms-settings.js) inject new images
        // into the DOM after the initial load.
        document.addEventListener('snr:dom-changed', () => {
            resolveAll().catch(e => console.warn('[SNRMedia] re-resolve failed:', e && e.message));
        });
    });
})();
