// Student & Parent Authentication Logic
let loginMode = 'student';

window.switchLoginMode = function (mode) {
    loginMode = mode;
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
    document.getElementById('studentFields').style.display = mode === 'student' ? 'block' : 'none';
    document.getElementById('parentFields').style.display = mode === 'parent' ? 'block' : 'none';
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('loginBtnText').textContent = mode === 'student' ? 'Login Securely' : 'Parent Login';
    document.getElementById('student_phone').required = mode === 'student';
    document.getElementById('student_name').required = mode === 'student';
    document.getElementById('parent_username').required = mode === 'parent';
    document.getElementById('parent_password').required = mode === 'parent';
};

window.togglePassword = function () {
    const pwd = document.getElementById('parent_password');
    const icon = document.getElementById('pwdToggleIcon');
    const isPassword = pwd.type === 'password';
    pwd.type = isPassword ? 'text' : 'password';
    icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
};

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
            loginSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Authenticating...</span>';
            loginError.style.display = 'none';

            try {
                if (!db) {
                    throw new Error('System initialization pending. Please wait a moment and try again.');
                }

                if (loginMode === 'student') {
                    // ============ STUDENT AUTH ============
                    const studentPhone = document.getElementById('student_phone').value.trim();
                    const studentName = document.getElementById('student_name').value.trim();

                    const snapshot = await schoolData('students').where('phone', '==', studentPhone).get();

                    if (snapshot.empty) {
                        throw new Error('Mobile Number not found. Please contact your school administrator.');
                    }

                    let matchedDoc = null;
                    for (let i = 0; i < snapshot.docs.length; i++) {
                        const doc = snapshot.docs[i];
                        if (doc.data().name.trim().toLowerCase() === studentName.trim().toLowerCase()) {
                            matchedDoc = doc;
                            break;
                        }
                    }

                    if (!matchedDoc) {
                        throw new Error('Student name does not match our records for this mobile number.');
                    }

                    const data = matchedDoc.data();

                    // SaaS Tenant Validation
                    if (data.schoolId && window.CURRENT_SCHOOL_ID && data.schoolId !== window.CURRENT_SCHOOL_ID) {
                        throw new Error(
                            "This account is registered with a different school portal. Please login at your school's official website."
                        );
                    }

                    // Firebase Auth verification (if account exists — fall back to legacy)
                    if (data.authEmail && typeof firebase !== 'undefined') {
                        try {
                            await firebase.auth().signInWithEmailAndPassword(data.authEmail, studentPhone);
                            console.log('[Auth] Firebase Auth verified for student');
                        } catch (authErr) {
                            console.warn('[Auth] Firebase Auth failed, falling back to legacy auth:', authErr.message);
                            // Legacy flow continued below
                        }
                    }

                    localStorage.setItem(
                        'student_session',
                        JSON.stringify({
                            student_phone: studentPhone,
                            student_id: data.student_id || matchedDoc.id,
                            name: data.name,
                            schoolId: window.CURRENT_SCHOOL_ID,
                            role: 'student',
                        })
                    );

                    if (typeof ACCESS_CONTROL !== 'undefined') {
                        ACCESS_CONTROL.init({
                            role: 'student',
                            id: data.student_id || matchedDoc.id,
                            studentId: data.student_id || matchedDoc.id,
                        });
                    }
                } else {
                    // ============ PARENT AUTH ============
                    const username = document.getElementById('parent_username').value.trim();
                    const password = document.getElementById('parent_password').value.trim();

                    // Query parentUsers within current school tenant
                    const snap = await schoolData('parentUsers').where('username', '==', username).get();

                    if (snap.empty) {
                        throw new Error('Parent account not found. Contact the school to get your login credentials.');
                    }

                    let matchedDoc = null;
                    let parentAuthSuccess = false;
                    for (let i = 0; i < snap.docs.length; i++) {
                        const d = snap.docs[i];
                        const stored = d.data();

                        // Firebase Auth (primary method)
                        if (stored.authEmail) {
                            try {
                                await firebase.auth().signInWithEmailAndPassword(stored.authEmail, password);
                                matchedDoc = d;
                                parentAuthSuccess = true;
                                break;
                            } catch (authErr) {
                                console.warn('[Auth] Firebase Auth failed for parent, trying legacy:', authErr.message);
                            }
                        }

                        // Legacy: SHA-256 hash comparison
                        if (!parentAuthSuccess && stored.passwordHash) {
                            const inputHash = await hashPassword(password);
                            if (stored.passwordHash === inputHash) {
                                matchedDoc = d;
                                break;
                            }
                        }

                        // Legacy: plaintext password — migrate on successful match
                        if (!parentAuthSuccess && stored.password && stored.password === password) {
                            matchedDoc = d;
                            const hash = await hashPassword(password);
                            d.ref.update({ passwordHash: hash, password: firebase.firestore.FieldValue.delete() }).catch(() => {});
                            break;
                        }
                    }

                    if (!matchedDoc) {
                        throw new Error('Invalid password. Please try again.');
                    }

                    const pu = matchedDoc.data();

                    if (pu.status !== 'active') {
                        throw new Error('This account is disabled. Please contact the school office.');
                    }

                    // Fetch all linked students (batched, avoids N+1)
                    const rawIds = pu.studentIds && Array.isArray(pu.studentIds) ? pu.studentIds : (pu.studentId ? [{ id: pu.studentId }] : []);
                    const linkedStudents = [];
                    const studentIds = rawIds.map(e => typeof e === 'string' ? e : e.id).filter(Boolean);

                    // Batch in chunks of 10 (Firestore 'in' limit)
                    for (let i = 0; i < studentIds.length; i += 10) {
                        const chunk = studentIds.slice(i, i + 10);
                        try {
                            const sSnap = await schoolData('students').where(firebase.firestore.FieldPath.documentId(), 'in', chunk).get();
                            const studentMap = {};
                            sSnap.forEach(d => { studentMap[d.id] = d.data(); });
                            chunk.forEach(sid => {
                                const s = studentMap[sid];
                                if (s) {
                                    linkedStudents.push({
                                        id: sid,
                                        name: s.name || sid,
                                        class: (s.class || '') + (s.section ? ' - ' + s.section : ''),
                                        section: s.section || '',
                                    });
                                } else {
                                    linkedStudents.push({ id: sid, name: sid, class: '', section: '' });
                                }
                            });
                        } catch (e) {
                            console.warn('Failed to fetch student batch:', e);
                            chunk.forEach(sid => linkedStudents.push({ id: sid, name: sid, class: '', section: '' }));
                        }
                    }

                    const currentStudent = linkedStudents[0] || {};
                    const studentName = currentStudent.name || '';
                    const studentClass = currentStudent.class || '';

                    localStorage.setItem(
                        'student_session',
                        JSON.stringify({
                            role: 'parent',
                            parentName: pu.parentName || 'Parent',
                            relation: pu.relation || 'Guardian',
                            username: pu.username,
                            linkedStudents: linkedStudents,
                            currentStudentId: currentStudent.id || '',
                            studentName: studentName,
                            studentClass: studentClass,
                            name: studentName,
                            schoolId: window.CURRENT_SCHOOL_ID,
                            allowedSections: pu.allowedSections && pu.allowedSections.length ? pu.allowedSections : [],
                        })
                    );

                    if (typeof ACCESS_CONTROL !== 'undefined') {
                        ACCESS_CONTROL.init({
                            role: 'parent',
                            id: currentStudent.id || matchedDoc.id,
                            studentId: currentStudent.id || matchedDoc.id,
                        });
                    }
                }

                // Redirect (same for student and parent)
                loginSubmitBtn.innerHTML = '<i class="fas fa-check"></i> <span>Identifying...</span>';

                setTimeout(() => {
                    const slug = typeof getURLSlug === 'function' ? getURLSlug() : null;
                    const redirectUrl = slug ? `/${slug}/Student-Dashboard` : '/portal/student-dashboard.html';
                    console.log(`[Auth] Login success. Redirecting to: ${redirectUrl}`);
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
});

window.logoutStudent = function () {
    localStorage.removeItem('student_session');
    if (typeof ACCESS_CONTROL !== 'undefined') ACCESS_CONTROL.clear();
    const slug = typeof getURLSlug === 'function' ? getURLSlug() : null;
    window.location.href = slug ? `/${slug}/Student-Login` : '/portal/student-login.html';
};

window.loginAsGuest = function () {
    localStorage.setItem(
        'student_session',
        JSON.stringify({
            role: 'visitor',
            name: 'Guest Visitor',
            schoolId: window.CURRENT_SCHOOL_ID,
        })
    );
    const slug = typeof getURLSlug === 'function' ? getURLSlug() : null;
    const redirectUrl = slug ? `/${slug}/Student-Dashboard` : '/portal/student-dashboard.html';
    window.location.href = redirectUrl;
};

async function applyAuthBranding() {
    try {
        const schoolDocSnap = await schoolRef().get();
        if (!schoolDocSnap.exists) {
            console.warn('[Auth] School record not found for:', window.CURRENT_SCHOOL_ID);
            return;
        }

        const data = schoolDocSnap.data();
        const name = data.schoolName || 'Apex Public School';
        let logo = data.logo || 'ApexPublicSchoolLogo.png';

        const isBareFilename = !logo.startsWith('/') && !logo.startsWith('http') && !logo.startsWith('data:');
        let resolvedLogo = logo;
        if (logo.startsWith('../')) resolvedLogo = logo.substring(2);
        if (!isBareFilename && !resolvedLogo.startsWith('/') && !resolvedLogo.startsWith('http')) resolvedLogo = '/' + resolvedLogo;

        document.title = `${name} | Student Portal`;

        const brandName = document.getElementById('portalBrandName');
        const brandDesc = document.getElementById('portalDesc');
        const logoContainer = document.getElementById('schoolLogoContainer');

        if (brandName) brandName.innerText = name;
        if (brandDesc) brandDesc.innerText = 'Student Learning Portal Access';
        if (logoContainer) {
            if (isBareFilename && window.SNRMedia) {
                window.SNRMedia.getDataUrl(logo).then((url) => {
                    logoContainer.innerHTML = `<img src="${url || ''}" alt="${name}" style="height:64px;margin-bottom:20px;object-fit:contain;">`;
                });
            } else {
                const ts = Date.now();
                const cacheLogo = resolvedLogo.includes('?') ? resolvedLogo + '&t=' + ts : resolvedLogo + '?t=' + ts;
                logoContainer.innerHTML = `<img src="${cacheLogo}" alt="${name}" style="height:64px;margin-bottom:20px;object-fit:contain;">`;
            }
        }
    } catch (e) {
        console.error('[Auth] Branding failed:', e);
    }
}
