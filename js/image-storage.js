/**
 * Image / File Storage Utility
 * ------------------------------------------------------------------
 * Stores files as Base64 data URIs inside Firestore documents.
 * Replaces Firebase Storage entirely.
 *
 * Firestore has a hard 1 MiB (1,048,576 bytes) document size limit.
 * Base64 inflates raw bytes by ~4/3, so we cap inputs at ~700 KB
 * of decoded Base64 (≈ 900 KB raw). For images we additionally
 * downscale to a safe dimension + JPEG quality before encoding.
 *
 * Exports (window.ImageStorage):
 *   - fileToDataUri(file)                 -> Promise<string>             "data:...;base64,XXX"
 *   - compressImage(file, opts)           -> Promise<Blob>               image-only, resizes
 *   - saveFile(file, opts)                -> Promise<{dataUri, mime, name, sizeBytes, sizeKB}>
 *   - validateDataUri(dataUri, maxBytes)  -> {ok, sizeBytes, sizeKB, reason}
 *   - maxRawBytes()                       -> number                      700_000
 *   - formatBytes(bytes)                  -> string
 */

(function (global) {
    'use strict';

    // Firestore limit: 1,048,576 bytes. Keep some headroom for other fields.
    const FIRESTORE_DOC_LIMIT = 1048576;
    const SAFE_RAW_LIMIT = 700000;       // ~700 KB raw, ~933 KB Base64, well under 1 MiB
    const DEFAULT_MAX_WIDTH = 1600;      // px
    const DEFAULT_MAX_HEIGHT = 1600;     // px
    const DEFAULT_JPEG_QUALITY = 0.82;

    /**
     * Read a File / Blob as a Base64 data URI.
     */
    function fileToDataUri(file) {
        return new Promise((resolve, reject) => {
            if (!file) return reject(new Error('No file provided'));
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Compress an image File to a smaller Blob using a canvas.
     * Preserves PNG transparency; falls back to JPEG otherwise.
     * Non-image files are returned unchanged.
     */
    async function compressImage(file, opts) {
        opts = opts || {};
        const maxWidth = opts.maxWidth || DEFAULT_MAX_WIDTH;
        const maxHeight = opts.maxHeight || DEFAULT_MAX_HEIGHT;
        const quality = typeof opts.quality === 'number' ? opts.quality : DEFAULT_JPEG_QUALITY;

        if (!file || !file.type || !file.type.startsWith('image/')) {
            return file; // not an image – hand back untouched
        }
        // Skip GIFs (animation would be lost) and very small files (< 200 KB).
        if (file.type === 'image/gif' || file.size < 200 * 1024) {
            return file;
        }

        const dataUri = await fileToDataUri(file);
        const img = await new Promise((resolve, reject) => {
            const i = new Image();
            i.onload = () => resolve(i);
            i.onerror = () => reject(new Error('Image decode failed'));
            i.src = dataUri;
        });

        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const isPng = file.type === 'image/png';
        const outType = isPng ? 'image/png' : 'image/jpeg';
        const blob = await new Promise((resolve) => {
            canvas.toBlob((b) => resolve(b), outType, isPng ? undefined : quality);
        });
        return blob || file;
    }

    /**
     * Read a File as an Image element (for canvas operations).
     */
    function fileToImage(file) {
        return fileToDataUri(file).then(dataUri => new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Image decode failed'));
            img.src = dataUri;
        }));
    }

    /**
     * Compress an image iteratively until its Base64 size is under targetSizeKB.
     * Strategy: reduce JPEG quality first (1.0 → 0.1), then reduce max dimension (1600 → 400).
     * Returns a data URI string.
     */
    async function compressImageUnder(file, targetSizeKB) {
        targetSizeKB = targetSizeKB || 200;
        if (!file || !file.type || !file.type.startsWith('image/')) {
            const uri = await fileToDataUri(file);
            return uri;
        }
        if (file.type === 'image/gif') {
            return await fileToDataUri(file);
        }

        const img = await fileToImage(file);
        let quality = 0.85;
        let maxDim = 1600;
        const minDim = 400;
        const step = 0.05;

        while (true) {
            let w = img.width;
            let h = img.height;
            if (w > maxDim || h > maxDim) {
                const ratio = Math.min(maxDim / w, maxDim / h);
                w = Math.round(w * ratio);
                h = Math.round(h * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
            if (!blob) return await fileToDataUri(file);

            const uri = await fileToDataUri(blob);
            const v = validateDataUri(uri, targetSizeKB * 1024);
            if (v.ok) return uri;

            // Reduce quality first
            if (quality > 0.1) {
                quality = Math.max(0.1, quality - step);
                continue;
            }
            // Then reduce dimensions
            if (maxDim > minDim) {
                quality = 0.85;
                maxDim = Math.max(minDim, maxDim - 200);
                continue;
            }
            // Give up — return best effort
            return uri;
        }
    }

    /**
     * Convenience wrapper: compress to 200 KB.
     */
    function compressImageUnder200KB(file) {
        return compressImageUnder(file, 200);
    }

    /**
     * Validate a Base64 data URI's decoded size.
     */
    function validateDataUri(dataUri, maxBytes) {
        maxBytes = maxBytes || SAFE_RAW_LIMIT;
        if (!dataUri || typeof dataUri !== 'string' || !dataUri.startsWith('data:')) {
            return { ok: false, reason: 'Not a valid data URI', sizeBytes: 0, sizeKB: 0 };
        }
        const commaIdx = dataUri.indexOf(',');
        if (commaIdx < 0) return { ok: false, reason: 'Malformed data URI', sizeBytes: 0, sizeKB: 0 };
        const b64 = dataUri.substring(commaIdx + 1);
        const padding = (b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0);
        const sizeBytes = Math.floor((b64.length * 3) / 4) - padding;
        const ok = sizeBytes <= maxBytes;
        return {
            ok,
            reason: ok ? null : `File too large (${formatBytes(sizeBytes)} > ${formatBytes(maxBytes)})`,
            sizeBytes,
            sizeKB: Math.round(sizeBytes / 1024),
        };
    }

    function formatBytes(bytes) {
        if (bytes == null || isNaN(bytes)) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    }

    /**
     * Main entry point: convert a File to a Base64 data URI safe for Firestore.
     * - For images: compresses via canvas first
     * - For PDFs / other files: passes through, then validates size
     *
     * Options:
     *   compress:    true|false (default true for images)
     *   maxWidth, maxHeight, quality: see compressImage
     *   maxBytes:    override SAFE_RAW_LIMIT
     *   fieldName:   the Firestore field name (used in error messages)
     *
     * Returns: { dataUri, mime, name, sizeBytes, sizeKB }
     * Throws on size limit or decode failure.
     */
    async function saveFile(file, opts) {
        opts = opts || {};
        if (!file) throw new Error('No file provided');

        const isImage = file.type && file.type.startsWith('image/');
        const doCompress = opts.compress !== false && isImage;

        let working = file;
        if (doCompress) {
            working = await compressImage(working, opts);
        }
        const dataUri = await fileToDataUri(working);

        const maxBytes = opts.maxBytes || SAFE_RAW_LIMIT;
        const v = validateDataUri(dataUri, maxBytes);
        if (!v.ok) {
            const hint = isImage
                ? ' Try a smaller image.'
                : ' PDFs and other files must be under ' + formatBytes(maxBytes) + '.';
            throw new Error((opts.fieldName ? opts.fieldName + ': ' : '') + v.reason + hint);
        }

        return {
            dataUri,
            mime: working.type || file.type,
            name: file.name,
            sizeBytes: v.sizeBytes,
            sizeKB: v.sizeKB,
        };
    }

    const api = {
        fileToDataUri,
        compressImage,
        compressImageUnder,
        compressImageUnder200KB,
        saveFile,
        validateDataUri,
        formatBytes,
        maxRawBytes: () => SAFE_RAW_LIMIT,
        firestoreLimit: () => FIRESTORE_DOC_LIMIT,
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    } else {
        global.ImageStorage = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
