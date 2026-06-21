// app-check.js — Firebase App Check initialization (reCAPTCHA v3)
// NOTE: Activation is handled in firebase-config.js via firebase.appCheck().activate()
// This file only exports the App Check state flag for other modules.
//
// Setup required (one-time, in Firebase Console):
//   1. Firebase Console → Project Settings → App Check
//   2. Register web app, provider = reCAPTCHA v3
//   3. Get reCAPTCHA v3 site key from https://www.google.com/recaptcha/admin
//   4. Set via <meta name="recaptcha-site-key" content="YOUR_KEY">
//   5. Set _APP_CHECK_ENABLED = true in firebase-config.js
//   6. After Firebase enforces App Check, unverified requests are rejected

(function initAppCheck() {
    if (typeof window === 'undefined') return;

    const siteKey = window.RECAPTCHA_V3_SITE_KEY ||
        document.querySelector('meta[name="recaptcha-site-key"]')?.getAttribute('content') || '';

    if (!siteKey) {
        console.warn(
            '[AppCheck] No reCAPTCHA v3 site key. App Check is DISABLED. ' +
            'Set <meta name="recaptcha-site-key"> or window.RECAPTCHA_V3_SITE_KEY.'
        );
        window.SNR_APP_CHECK_ENABLED = false;
        return;
    }

    // Activation is performed in firebase-config.js — this file only reports status
    window.SNR_APP_CHECK_ENABLED = window.SNR_APP_CHECK_ENABLED || false;
    if (window.SNR_APP_CHECK_ENABLED) {
        console.log('[AppCheck] Already activated via firebase-config.js');
    }
})();
