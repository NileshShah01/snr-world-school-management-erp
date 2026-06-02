/**
 * auth-guard.js — Centralized auth + role middleware
 * Used by: admin-dashboard.js, super-admin.js, super-admin-pro.js
 *
 * Depends on globals from firebase-config.js: `auth` (firebase.auth()) and `db` (firebase.firestore()).
 */
(function (global) {
  'use strict';

  let _cachedUser = null;
  let _cachedRole = null;
  let _bootPromise = null;

  function boot() {
    if (_bootPromise) return _bootPromise;
    _bootPromise = new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        unsubscribe();
        if (!user) return resolve(null);
        _cachedUser = user;
        try {
          const userDoc = await db.collection('users').doc(user.uid).get();
          _cachedRole = userDoc.exists ? (userDoc.data().role || 'viewer') : 'viewer';
          resolve({ user, role: _cachedRole });
        } catch (e) {
          console.error('[auth-guard] role lookup failed:', e);
          _cachedRole = 'viewer';
          resolve({ user, role: 'viewer' });
        }
      });
    });
    return _bootPromise;
  }

  function getCurrentUser() { return _cachedUser; }
  function getRole() { return _cachedRole; }

  function hasRole(required) {
    if (!_cachedRole) return false;
    if (_cachedRole === 'admin' || _cachedRole === 'super_admin') return true;
    if (Array.isArray(required)) return required.includes(_cachedRole);
    return _cachedRole === required;
  }

  async function requireAuth(opts = {}) {
    const redirect = opts.redirect || '/portal/admin-login.html';
    const session = await boot();
    if (!session) {
      const slug = typeof getURLSlug === 'function' ? getURLSlug() : null;
      window.location.href = slug ? `/${slug}/Admin-Login` : redirect;
      return null;
    }
    if (opts.role && !hasRole(opts.role)) {
      console.warn(`[auth-guard] role ${JSON.stringify(opts.role)} required, got ${_cachedRole}`);
      window.location.href = redirect;
      return null;
    }
    return session;
  }

  async function signOutAndRedirect(redirect = '/portal/admin-login.html') {
    _cachedUser = null;
    _cachedRole = null;
    _bootPromise = null;
    sessionStorage.removeItem('CURRENT_SCHOOL_ID');
    try { await auth.signOut(); } catch (e) { console.error(e); }
    const slug = typeof getURLSlug === 'function' ? getURLSlug() : null;
    window.location.href = slug ? `/${slug}/Admin-Login` : redirect;
  }

  global.AuthGuard = { boot, requireAuth, getCurrentUser, getRole, hasRole, signOutAndRedirect };
})(window);
