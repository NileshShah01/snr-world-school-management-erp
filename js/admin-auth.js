// Admin Authentication Logic

document.addEventListener('DOMContentLoaded', async () => {
    // Wait for slug resolution to complete FIRST
    if (window.schoolBootstrapReady) {
        await window.schoolBootstrapReady;
    }

    // Apply dynamic branding based on resolved tenant
    applyAuthBranding();

    const loginForm = document.getElementById('adminLoginForm');
    const loginError = document.getElementById('loginError');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('loginBtn');
            const btnText = document.getElementById('btnText');
            const btnSpinner = document.getElementById('btnSpinner');

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            loginError.style.display = 'none';

            // Client-side rate limit: 5 attempts per minute per email
            const limiter = (window.SNR_RATE_LIMITERS && window.SNR_RATE_LIMITERS.login) || null;
            if (limiter) {
                const r = limiter.check('login:' + (email || '').toLowerCase());
                if (!r.allowed) {
                    loginError.textContent =
                        'Too many login attempts. Please wait ' +
                        limiter.formatRetryAfter(r.retryAfterMs) +
                        ' and try again.';
                    loginError.style.display = 'block';
                    return;
                }
            }

            submitBtn.disabled = true;
            btnText.innerText = 'Authenticating...';
            if (btnSpinner) btnSpinner.style.display = 'block';

            try {
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                const user = userCredential.user;

                if (limiter) limiter.reset('login:' + email.toLowerCase());

                // Fetch user metadata for school mapping
                let userDoc = await db.collection('users').doc(user.uid).get();

                if (userDoc.exists) {
                    const userData = userDoc.data();

                    // Sync school ID to session storage (authoritative source)
                    sessionStorage.setItem('CURRENT_SCHOOL_ID', userData.schoolId);

                    // Store role + identifiers for downstream routing
                    sessionStorage.setItem('USER_ROLE', userData.role || 'admin');
                    if (userData.staffId) sessionStorage.setItem('STAFF_ID', userData.staffId);
                    if (userData.designationId) sessionStorage.setItem('DESIGNATION_ID', userData.designationId);
                    if (userData.isActive === false) {
                        throw new Error('Your account has been deactivated. Please contact your school administrator.');
                    }

                    // Redirect logic by role
                    const slug = typeof getURLSlug === 'function' ? getURLSlug() : null;
                    let redirectUrl;
                    const role = userData.role || 'admin';
                    if (role === 'teacher') {
                        redirectUrl = slug ? `/${slug}/Teacher-Dashboard` : '/portal/teacher-dashboard.html';
                    } else {
                        redirectUrl = slug ? `/${slug}/Admin-Dashboard` : '/portal/admin-dashboard.html';
                    }

                    console.log(`[Auth] Login success (role: ${role}). Redirecting to: ${redirectUrl}`);
                    window.location.href = redirectUrl;
                } else {
                    throw new Error('Account error: Your school mapping was not found in our database.');
                }
            } catch (error) {
                console.error('Authentication Error:', error);
                if (limiter) limiter.allow('login:' + (email || '').toLowerCase());
                let msg = (error && error.message) || 'Login failed. Please try again.';
                // Map common Firebase errors to user-friendly messages
                if (error && error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                    msg = 'Invalid email or password.';
                } else if (error && error.code === 'auth/too-many-requests') {
                    msg = 'Too many failed attempts. Please wait a few minutes.';
                } else if (error && error.code === 'auth/network-request-failed') {
                    msg = 'Network error. Please check your connection.';
                }
                loginError.textContent = msg;
                loginError.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                btnText.innerText = 'Sign In to Dashboard';
                if (btnSpinner) btnSpinner.style.display = 'none';
            }
        });
    }

    // Note: The admin-dashboard page-level auth guard lives in js/admin-dashboard.js
    // and the centralized js/auth-guard.js (requireAuth). The block that used to
    // live here was redundant dead code and has been removed (2026-06-02, Phase 1).
});

function logoutAdmin() {
    sessionStorage.removeItem('CURRENT_SCHOOL_ID');
    auth.signOut().then(() => {
        const slug = typeof getURLSlug === 'function' ? getURLSlug() : null;
        window.location.href = slug ? `/${slug}/Admin-Login` : '/portal/admin-login.html';
    });
}

/**
 * Apply dynamic branding based on school record
 */
async function applyAuthBranding() {
    try {
        const schoolDocSnap = await schoolRef().get();
        if (!schoolDocSnap.exists) return;

        const data = schoolDocSnap.data();
        const name = data.schoolName || 'Antigravity ERP';
        let logo = data.logo || 'ApexPublicSchoolLogo.png';

        // Path safety (only for absolute paths / URLs — leave bare filenames alone
        // so the media-loader can resolve them from Firestore)
        if (logo.startsWith('../')) logo = logo.substring(2);
        const isBareFilename = !logo.startsWith('/') && !logo.startsWith('http') && !logo.startsWith('data:');

        // Update Title & Brand
        document.title = `Admin Login | ${name}`;

        const brandNameEl = document.getElementById('portalBrandName');
        const logoImgEl = document.getElementById('schoolLogo');

        if (brandNameEl) brandNameEl.innerText = name;
        if (logoImgEl) {
            logoImgEl.alt = `${name} Logo`;
            if (isBareFilename && window.SNRMedia) {
                // Resolve from media library
                window.SNRMedia.getDataUrl(logo).then((url) => {
                    if (url) logoImgEl.src = url;
                }).catch(() => { /* leave broken-image icon */ });
            } else {
                // External URL or absolute path — add cache-busting
                const timestamp = Date.now();
                logoImgEl.src = logo.includes('?') ? logo + '&t=' + timestamp : logo + '?t=' + timestamp;
            }
        }
    } catch (e) {
        console.error('Branding failed:', e);
    }
}
