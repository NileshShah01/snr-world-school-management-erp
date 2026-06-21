# Parent Login Flow — Complete Implementation
Apply in order: 1, 2, 3, 4, 5

## 1. student-auth.js — Full file rewrite
Replace entire D:\Snredu\js\student-auth.js with:

let loginMode = 'student';

function switchLoginMode(mode) {
    loginMode = mode;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    document.getElementById('studentFields').style.display = mode === 'student' ? 'block' : 'none';
    document.getElementById('parentFields').style.display = mode === 'parent' ? 'block' : 'none';
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('loginBtnText').textContent = mode === 'student' ? 'Login Securely' : 'Parent Login';
    // Toggle required attrs so validation matches visible fields
    document.getElementById('student_phone').required = mode === 'student';
    document.getElementById('student_name').required = mode === 'student';
    document.getElementById('parent_username').required = mode === 'parent';
    document.getElementById('parent_password').required = mode === 'parent';
}

function togglePassword() {
    const pwd = document.getElementById('parent_password');
    const icon = document.getElementById('pwdToggleIcon');
    const isPassword = pwd.type === 'password';
    pwd.type = isPassword ? 'text' : 'password';
    icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
}

document.addEventListener('DOMContentLoaded', async () => {
    if (window.schoolBootstrapReady) await window.schoolBootstrapReady;
    applyAuthBranding();

    const loginForm = document.getElementById('studentLoginForm');
    const loginError = document.getElementById('loginError');
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const originalBtnHtml = loginSubmitBtn.innerHTML;
            loginSubmitBtn.disabled = true;
            loginSubmitBtn.innerHTML = '<i class=\"fas fa-spinner fa-spin\"></i> <span>Authenticating...</span>';
            loginError.style.display = 'none';

            try {
                if (!db) throw new Error('System initialization pending. Please wait a moment and try again.');

                if (loginMode === 'student') {
                    // --- STUDENT AUTH (unchanged) ---
                    const studentPhone = document.getElementById('student_phone').value.trim();
                    const studentName = document.getElementById('student_name').value.trim();

                    const snapshot = await schoolData('students').where('phone', '==', studentPhone).get();
                    if (snapshot.empty) throw new Error('Mobile Number not found. Please contact your school administrator.');

                    let matchedDoc = null;
                    for (let i = 0; i < snapshot.docs.length; i++) {
                        const doc = snapshot.docs[i];
                        if (doc.data().name.trim().toLowerCase() === studentName.trim().toLowerCase()) {
                            matchedDoc = doc;
                            break;
                        }
                    }
                    if (!matchedDoc) throw new Error('Student name does not match our records for this mobile number.');

                    const data = matchedDoc.data();
                    if (data.schoolId && window.CURRENT_SCHOOL_ID && data.schoolId !== window.CURRENT_SCHOOL_ID) {
                        throw new Error('This account is registered with a different school portal.');
                    }

                    localStorage.setItem('student_session', JSON.stringify({
                        student_phone: studentPhone,
                        student_id: data.student_id || matchedDoc.id,
                        name: data.name,
                        schoolId: window.CURRENT_SCHOOL_ID,
                        role: 'student',
                    }));

                    if (typeof ACCESS_CONTROL !== 'undefined') {
                        ACCESS_CONTROL.init({ role: 'student', id: data.student_id || matchedDoc.id, studentId: data.student_id || matchedDoc.id });
                    }
                } else {
                    // --- PARENT AUTH ---
                    const username = document.getElementById('parent_username').value.trim();
                    const password = document.getElementById('parent_password').value.trim();

                    const snap = await schoolData('parentUsers').where('username', '==', username).get();
                    if (snap.empty) throw new Error('Parent account not found. Contact the school to get your login credentials.');

                    let matchedDoc = null;
                    for (let i = 0; i < snap.docs.length; i++) {
                        const d = snap.docs[i];
                        if (d.data().password === password) { matchedDoc = d; break; }
                    }
                    if (!matchedDoc) throw new Error('Invalid password. Please try again.');

                    const pu = matchedDoc.data();
                    if (pu.status !== 'active') throw new Error('This account is disabled. Please contact the school office.');

                    // Tenant check
                    // Fetch student to populate session
                    let studentName = pu.studentName || '';
                    let studentClass = pu.studentClass || '';
                    let studentId = pu.studentId || '';
                    if (pu.studentId) {
                        try {
                            const sDoc = await schoolDoc('students', pu.studentId).get();
                            if (sDoc.exists) {
                                const s = sDoc.data();
                                studentName = s.name || studentName;
                                studentClass = s.class + (s.section ? ' - ' + s.section : '');
                                studentId = s.student_id || pu.studentId;
                            }
                        } catch (e) { /* use parentUser stored values */ }
                    }

                    const parentSession = {
                        role: 'parent',
                        parentName: pu.parentName || 'Parent',
                        relation: pu.relation || 'Guardian',
                        username: pu.username,
                        studentId: studentId,
                        studentName: studentName,
                        studentClass: studentClass,
                        name: studentName,
                        schoolId: window.CURRENT_SCHOOL_ID,
                        allowedSections: pu.allowedSections && pu.allowedSections.length ? pu.allowedSections : [],
                    };

                    localStorage.setItem('student_session', JSON.stringify(parentSession));

                    if (typeof ACCESS_CONTROL !== 'undefined') {
                        ACCESS_CONTROL.init({ role: 'parent', id: pu.studentId || pu.id, studentId: pu.studentId || pu.id });
                    }
                }

                // Redirect (same for both modes)
                loginSubmitBtn.innerHTML = '<i class=\"fas fa-check\"></i> <span>Identifying...</span>';
                setTimeout(() => {
                    const slug = typeof getURLSlug === 'function' ? getURLSlug() : null;
                    const redirectUrl = slug ? \/\/Student-Dashboard\ : '/portal/student-dashboard.html';
                    window.location.href = redirectUrl;
                }, 800);
            } catch (error) {
                console.error('Login Error:', error);
                loginError.textContent = error.message;
                loginError.style.display = 'block';
                loginSubmitBtn.disabled = false;
                loginSubmitBtn.innerHTML = originalBtnHtml;
            }
        });
    }

    const isDashboard = window.location.pathname.includes('student-dashboard.html') || window.location.pathname.toLowerCase().endsWith('/student-dashboard');
    // Dashboard protection commented out as in original
});

function logoutStudent() {
    localStorage.removeItem('student_session');
    if (typeof ACCESS_CONTROL !== 'undefined') ACCESS_CONTROL.clear();
    const slug = typeof getURLSlug === 'function' ? getURLSlug() : null;
    window.location.href = slug ? \/\/Student-Login\ : '/portal/student-login.html';
}

function loginAsGuest() {
    localStorage.setItem('student_session', JSON.stringify({
        role: 'visitor', name: 'Guest Visitor', schoolId: window.CURRENT_SCHOOL_ID,
    }));
    const slug = typeof getURLSlug === 'function' ? getURLSlug() : null;
    window.location.href = slug ? \/\/Student-Dashboard\ : '/portal/student-dashboard.html';
}

async function applyAuthBranding() {
    try {
        const schoolDocSnap = await schoolRef().get();
        if (!schoolDocSnap.exists) { console.warn('[StudentAuth] School record not found:', window.CURRENT_SCHOOL_ID); return; }
        const data = schoolDocSnap.data();
        const name = data.schoolName || 'Apex Public School';
        let logo = data.logo || 'ApexPublicSchoolLogo.png';
        const isBareFilename = !logo.startsWith('/') && !logo.startsWith('http') && !logo.startsWith('data:');
        let resolvedLogo = logo;
        if (logo.startsWith('../')) resolvedLogo = logo.substring(2);
        if (!isBareFilename && !resolvedLogo.startsWith('/') && !resolvedLogo.startsWith('http')) resolvedLogo = '/' + resolvedLogo;

        document.title = name + ' | Student Portal';
        const brandName = document.getElementById('portalBrandName');
        const brandDesc = document.getElementById('portalDesc');
        const logoContainer = document.getElementById('schoolLogoContainer');
        if (brandName) brandName.innerText = name;
        if (brandDesc) brandDesc.innerText = 'Student Learning Portal Access';
        if (logoContainer) {
            if (isBareFilename && window.SNRMedia) {
                window.SNRMedia.getDataUrl(logo).then((url) => {
                    logoContainer.innerHTML = '<img src=\"' + (url || '') + '\" alt=\"' + name + '\" style=\"height:64px;margin-bottom:20px;object-fit:contain;\">';
                });
            } else {
                const ts = Date.now();
                const l = resolvedLogo.includes('?') ? resolvedLogo + '&t=' + ts : resolvedLogo + '?t=' + ts;
                logoContainer.innerHTML = '<img src=\"' + l + '\" alt=\"' + name + '\" style=\"height:64px;margin-bottom:20px;object-fit:contain;\">';
            }
        }
    } catch (e) { console.error('[StudentAuth] Branding failed:', e); }
}

// Expose globally for HTML onclick
window.switchLoginMode = switchLoginMode;
window.togglePassword = togglePassword;
window.logoutStudent = logoutStudent;
window.loginAsGuest = loginAsGuest;

## 2. student-dashboard.html — Sidebar + section changes
--- a/portal/student-dashboard.html
+++ b/portal/student-dashboard.html
@@ -34,11 +34,18 @@
 
                 <!-- Student Mini Profile in Sidebar -->
                 <div class="sidebar-profile">
-                    <div id="sidebarStudentPhoto" class="sidebar-avatar">
-                        <i class="fas fa-user-graduate"></i>
+                    <div id="sidebarStudentPhoto" class="sidebar-avatar" style="display:flex;">
+                        <i class="fas fa-user-graduate" id="sidebarAvatarIcon"></i>
+                        <i class="fas fa-users" id="sidebarParentIcon" style="display:none;"></i>
                     </div>
-                    <h4 id="sidebarStudentName">Loading...</h4>
-                    <p id="sidebarStudentClass" class="text-xs uppercase letter-spacing-1">Class - Sec</p>
+                    <div style="flex:1;min-width:0;">
+                        <h4 id="sidebarStudentName">Loading...</h4>
+                        <p id="sidebarParentLabel" class="text-xs text-muted" style="display:none;">Parent</p>
+                        <p id="sidebarStudentClass" class="text-xs uppercase letter-spacing-1">Class - Sec</p>
+                        <p id="sidebarStudentSubLabel" class="text-xs text-muted" style="display:none;"></p>
+                    </div>
+                    <!-- Keep existing sidebar profile structure but add parent-aware elements -->

## 3. student-dashboard.js — Parent role handling
In showPortalSection(), AFTER the visitor check block (around line 255), ADD:

    // Parent Section Restriction
    const pSession = JSON.parse(localStorage.getItem('student_session') || '{}');
    if (pSession.role === 'parent' && pSession.allowedSections && pSession.allowedSections.length > 0) {
        if (!pSession.allowedSections.includes(sectionId) && sectionId !== 'dashboard') {
            const sectionEl = document.getElementById(sectionId + 'Section');
            if (sectionEl) {
                sectionEl.style.display = 'block';
                sectionEl.innerHTML = '<div class=\"card p-4 text-center\"><i class=\"fas fa-lock text-4xl mb-1 opacity-20\"></i><h2 class=\"text-2xl mb-1\">Access Restricted</h2><p class=\"text-muted mb-2\">This section is not available for your account. Contact the school office if you need access.</p></div>';
                return;
            }
        }
    }

In applyStudentBranding() or fetchStudentData(), AFTER displaying student profile, ADD:
    // Parent role: update sidebar to show parent info
    const session = JSON.parse(localStorage.getItem('student_session') || '{}');
    if (session.role === 'parent') {
        const avatarIcon = document.getElementById('sidebarAvatarIcon');
        const parentIcon = document.getElementById('sidebarParentIcon');
        const parentLabel = document.getElementById('sidebarParentLabel');
        const subLabel = document.getElementById('sidebarStudentSubLabel');
        if (avatarIcon) avatarIcon.style.display = 'none';
        if (parentIcon) parentIcon.style.display = 'flex';
        if (parentLabel) { parentLabel.style.display = 'block'; parentLabel.textContent = session.parentName + ' (' + (session.relation || 'Parent') + ')'; }
        if (subLabel) { subLabel.style.display = 'block'; subLabel.textContent = 'Viewing: ' + (session.studentName || ''); }
    }

## 4. student-login.html — Form changes (already reviewed above)
Changes to the form inside <form id="studentLoginForm">:
1. ADD login-tabs div BEFORE existing .input-group elements
2. WRAP existing phone+name in #studentFields div
3. ADD #parentFields div with username + password inputs + toggle
4. ADD inline JS functions at bottom (right before </body>)
See the full content presented earlier for the exact HTML.

## 5. portal.css — Add to end of file
.login-tabs { display:flex; gap:4px; margin-bottom:24px; background:rgba(255,255,255,0.03); border-radius:12px; padding:4px; border:1px solid rgba(255,255,255,0.06); }
.tab-btn { flex:1; padding:10px 16px; border:none; border-radius:10px; background:transparent; color:var(--text-dim); font-family:'Inter',sans-serif; font-size:14px; font-weight:500; cursor:pointer; transition:all 0.3s; display:flex; align-items:center; justify-content:center; gap:8px; }
.tab-btn:hover { color:var(--text-main); background:rgba(255,255,255,0.05); }
.tab-btn.active { background:var(--accent-primary); color:white; box-shadow:0 4px 12px rgba(59,130,246,0.3); }
.tab-btn i { font-size:15px; }
.pwd-toggle { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--text-dim); cursor:pointer; padding:6px; border-radius:8px; transition:all 0.2s; z-index:1; }
.pwd-toggle:hover { color:var(--accent-secondary); background:rgba(255,255,255,0.05); }
