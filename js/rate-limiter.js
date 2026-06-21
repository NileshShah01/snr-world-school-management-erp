// rate-limiter.js — Simple client-side rate limiter for auth, forms, and sensitive actions.
// Prevents accidental double-submits and reduces spam bot impact.
//
// Usage:
//   const limiter = new RateLimiter({ maxAttempts: 5, windowMs: 60_000 });
//   if (!limiter.allow('login:' + email)) {
//       showError('Too many attempts. Please wait 60s.');
//       return;
//   }
//   await auth.signInWithEmailAndPassword(email, password);
//   limiter.reset('login:' + email);
//
// Storage: localStorage so the limit persists across page reloads and tabs.

(function () {
    'use strict';

    function RateLimiter(options) {
        this.maxAttempts = (options && options.maxAttempts) || 5;
        this.windowMs = (options && options.windowMs) || 60_000;
        this.storageKey = (options && options.storageKey) || 'snr_rate_limit';
    }

    RateLimiter.prototype._load = function () {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        } catch (e) {
            return {};
        }
    };

    RateLimiter.prototype._save = function (state) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(state));
        } catch (e) {
            // localStorage may be disabled (private mode, quota). Fail open.
        }
    };

    /**
     * Check if an action is allowed for a given key.
     * Returns { allowed: boolean, retryAfterMs: number, attempts: number }
     */
    RateLimiter.prototype.check = function (key) {
        const state = this._load();
        const now = Date.now();
        const entry = state[key];

        if (!entry) {
            return { allowed: true, retryAfterMs: 0, attempts: 0 };
        }

        // Window expired → reset
        if (now - entry.firstAt > this.windowMs) {
            delete state[key];
            this._save(state);
            return { allowed: true, retryAfterMs: 0, attempts: 0 };
        }

        const attempts = entry.count || 0;
        if (attempts >= this.maxAttempts) {
            const retryAfterMs = this.windowMs - (now - entry.firstAt);
            return { allowed: false, retryAfterMs, attempts };
        }

        return { allowed: true, retryAfterMs: 0, attempts };
    };

    /**
     * Record an attempt and return whether it's allowed.
     */
    RateLimiter.prototype.allow = function (key) {
        const state = this._load();
        const now = Date.now();
        const entry = state[key];

        if (!entry || now - entry.firstAt > this.windowMs) {
            state[key] = { firstAt: now, count: 1 };
        } else {
            state[key].count = (entry.count || 0) + 1;
        }
        this._save(state);
        return this.check(key).allowed;
    };

    /**
     * Reset the limit for a key (e.g. after a successful action).
     */
    RateLimiter.prototype.reset = function (key) {
        const state = this._load();
        delete state[key];
        this._save(state);
    };

    /**
     * Format retryAfterMs as a human string (e.g. "60s", "2m 15s").
     */
    RateLimiter.prototype.formatRetryAfter = function (ms) {
        if (ms < 1000) return 'a moment';
        const sec = Math.ceil(ms / 1000);
        if (sec < 60) return sec + 's';
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return s ? m + 'm ' + s + 's' : m + 'm';
    };

    // Pre-configured limiters for common actions.
    // Each instance has its own localStorage key so they don't interfere.
    window.SNR_RATE_LIMITERS = {
        login: new RateLimiter({ maxAttempts: 5, windowMs: 60_000, storageKey: 'snr_rl_login' }),
        contact: new RateLimiter({ maxAttempts: 3, windowMs: 5 * 60_000, storageKey: 'snr_rl_contact' }),
        forgotPassword: new RateLimiter({ maxAttempts: 3, windowMs: 5 * 60_000, storageKey: 'snr_rl_forgot' }),
        inquiry: new RateLimiter({ maxAttempts: 2, windowMs: 60_000, storageKey: 'snr_rl_inquiry' }),
        demo: new RateLimiter({ maxAttempts: 2, windowMs: 60 * 60_000, storageKey: 'snr_rl_demo' }),
    };
})();
