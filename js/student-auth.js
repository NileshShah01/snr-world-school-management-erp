/* global db, firebase, schoolData, schoolRef, getURLSlug, ACCESS_CONTROL */

// Student & Parent Authentication Logic (Mobile + Birth Year)
var loginMode = 'student';

// Helper: extract year from a date string (dd/mm/yyyy, yyyy-mm-dd, etc.)
function extractBirthYear(dob) {
    if (!dob) return '';
    var cleaned = String(dob).replace(/[^0-9/.-]/g, '');
    // try yyyy-mm-dd or yyyy/mm/dd
    var m = cleaned.match(/(\d{4})[/.-]\d{1,2}[/.-]\d{1,2}/);
    if (m) return m[1];
    // try dd/mm/yyyy or dd-mm-yyyy
    m = cleaned.match(/(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/);
    if (m) return m[3];
    // try raw 4-digit
    m = cleaned.match(/^(\d{4})$/);
    if (m) return m[1];
    return '';
}

window.switchLoginMode = function (mode) {
    loginMode = mode;
    document.querySelectorAll('.tab-btn').forEach(function (b) { return b.classList.toggle('active', b.dataset.mode === mode); });
    document.getElementById('studentFields').style.display = mode === 'student' ? 'block' : 'none';
    document.getElementById('parentFields').style.display = mode === 'parent' ? 'block' : 'none';
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('loginBtnText').textContent = mode === 'student' ? 'Login Securely' : 'Parent Login';
    document.getElementById('student_phone').required = mode === 'student';
    document.getElementById('student_password').required = mode === 'student';
    document.getElementById('parent_phone').required = mode === 'parent';
    document.getElementById('parent_password').required = mode === 'parent';
};

window.toggleStudentPassword = function () {
    var pwd = document.getElementById('student_password');
    var icon = document.getElementById('studentPwdToggleIcon');
    var isPassword = pwd.type === 'password';
    pwd.type = isPassword ? 'text' : 'password';
    icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
};

window.toggleParentPassword = function () {
    var pwd = document.getElementById('parent_password');
    var icon = document.getElementById('parentPwdToggleIcon');
    var isPassword = pwd.type === 'password';
    pwd.type = isPassword ? 'text' : 'password';
    icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
};

document.addEventListener('DOMContentLoaded', async function () {
    if (window.schoolBootstrapReady) await window.schoolBootstrapReady;

    applyAuthBranding();

    var loginForm = document.getElementById('studentLoginForm');
    var loginError = document.getElementById('loginError');
    var loginSubmitBtn = document.getElementById('loginSubmitBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            var originalBtnHtml = loginSubmitBtn.innerHTML;
            loginSubmitBtn.disabled = true;
            loginSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Authenticating...</span>';
            loginError.style.display = 'none';

            try {
                if (!db) {
                    throw new Error('System initialization pending. Please wait a moment and try again.');
                }

                if (loginMode === 'student') {
                    // ============ STUDENT AUTH ============
                    var studentPhone = document.getElementById('student_phone').value.trim();
                    var studentPassword = document.getElementById('student_password').value.trim();

                    if (!studentPassword) {
                        throw new Error('Please enter your password (default: birth year).');
                    }

                    var snapshot = await schoolData('students').where('phone', '==', studentPhone).get();

                    if (snapshot.empty) {
                        throw new Error('Mobile Number not found. Please contact your school administrator.');
                    }

                    // Try each matching document — find one whose birth year matches
                    var matchedDoc = null;
                    var matchedData = null;
                    for (var i = 0; i < snapshot.docs.length; i++) {
                        var doc = snapshot.docs[i];
                        var data = doc.data();
                        var expectedYear = extractBirthYear(data.dob || data.dateOfBirth || '');
                        if (expectedYear && expectedYear === studentPassword) {
                            matchedDoc = doc;
                            matchedData = data;
                            break;
                        }
                    }

                    if (!matchedDoc) {
                        throw new Error('Password does not match. Default password is your birth year (YYYY). Try "2012" or contact the school.');
                    }

                    // SaaS Tenant Validation
                    if (matchedData.schoolId && window.CURRENT_SCHOOL_ID && matchedData.schoolId !== window.CURRENT_SCHOOL_ID) {
                        throw new Error(
                            'This account is registered with a different school portal. Please login at your school\'s official website.'
                        );
                    }

                    // Firebase Auth verification (if account exists)
                    if (matchedData.authEmail && typeof firebase !== 'undefined') {
                        try {
                            await firebase.auth().signInWithEmailAndPassword(matchedData.authEmail, studentPassword);
                            console.log('[Auth] Firebase Auth verified for student');
                        } catch (authErr) {
                            console.warn('[Auth] Firebase Auth failed, falling back to legacy auth:', authErr.message);
                        }
                    }

                    localStorage.setItem(
                        'student_session',
                        JSON.stringify({
                            student_phone: studentPhone,
                            student_id: matchedData.student_id || matchedDoc.id,
                            name: matchedData.name,
                            schoolId: window.CURRENT_SCHOOL_ID,
                            role: 'student',
                        })
                    );

                    if (typeof ACCESS_CONTROL !== 'undefined') {
                        ACCESS_CONTROL.init({
                            role: 'student',
                            id: matchedData.student_id || matchedDoc.id,
                            studentId: matchedData.student_id || matchedDoc.id,
                        });
                    }
                } else {
                    // ============ PARENT AUTH ============
                    var parentPhone = document.getElementById('parent_phone').value.trim();
                    var parentPassword = document.getElementById('parent_password').value.trim();

                    if (!parentPassword) {
                        throw new Error('Please enter your password (default: your child\'s birth year).');
                    }

                    // Find students where guardian_phone matches
                    var snap = await schoolData('students').where('guardian_phone', '==', parentPhone).get();

                    if (snap.empty) {
                        throw new Error('No students linked to this mobile number. Contact the school office to register as a parent.');
                    }

                    // Build linked students list and verify password against first child's birth year
                    var matchedStudentId = null;
                    var linkedStudents = [];
                    var parentVerified = false;
                    var puData = null;

                    snap.forEach(function (sDoc) {
                        var sData = sDoc.data();
                        linkedStudents.push({
                            id: sDoc.id,
                            name: sData.name || sDoc.id,
                            class: (sData.class || '') + (sData.section ? ' - ' + sData.section : ''),
                            section: sData.section || '',
                        });
                        // Verify password using birth year of any linked student
                        if (!parentVerified) {
                            var expectedYear = extractBirthYear(sData.dob || sData.dateOfBirth || '');
                            if (expectedYear && expectedYear === parentPassword) {
                                parentVerified = true;
                                matchedStudentId = sDoc.id;
                            }
                        }
                    });

                    if (!parentVerified) {
                        throw new Error('Invalid password. Default password is your child\'s birth year (YYYY). Contact the school if you need help.');
                    }

                    // Try parentUsers lookup for additional profile data (admin-managed)
                    try {
                        var puSnap = await schoolData('parentUsers').where('username', '==', parentPhone).get();
                        if (!puSnap.empty) {
                            puData = puSnap.docs[0].data();
                        }
                    } catch (e) {
                        console.warn('[Auth] parentUsers lookup skipped (admin-only):', e.message);
                    }

                    var currentStudent = linkedStudents[0] || {};

                    localStorage.setItem(
                        'student_session',
                        JSON.stringify({
                            role: 'parent',
                            parentName: (puData && puData.parentName) || 'Parent',
                            relation: (puData && puData.relation) || 'Guardian',
                            username: parentPhone,
                            linkedStudents: linkedStudents,
                            currentStudentId: matchedStudentId || currentStudent.id || '',
                            studentName: currentStudent.name || '',
                            studentClass: currentStudent.class || '',
                            name: currentStudent.name || '',
                            schoolId: window.CURRENT_SCHOOL_ID,
                            allowedSections: (puData && puData.allowedSections && puData.allowedSections.length) ? puData.allowedSections : [],
                        })
                    );

                    if (typeof ACCESS_CONTROL !== 'undefined') {
                        ACCESS_CONTROL.init({
                            role: 'parent',
                            id: matchedStudentId || currentStudent.id,
                            studentId: matchedStudentId || currentStudent.id,
                        });
                    }
                }

                // Redirect (same for student and parent)
                loginSubmitBtn.innerHTML = '<i class="fas fa-check"></i> <span>Identifying...</span>';

                setTimeout(function () {
                    var slug = typeof getURLSlug === 'function' ? getURLSlug() : null;
                    var redirectUrl = slug ? '/' + slug + '/Student-Dashboard' : '/portal/student-dashboard.html';
                    console.log('[Auth] Login success. Redirecting to:', redirectUrl);
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
    var slug = typeof getURLSlug === 'function' ? getURLSlug() : null;
    window.location.href = slug ? '/' + slug + '/Student-Login' : '/portal/student-login.html';
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
    var slug = typeof getURLSlug === 'function' ? getURLSlug() : null;
    var redirectUrl = slug ? '/' + slug + '/Student-Dashboard' : '/portal/student-dashboard.html';
    window.location.href = redirectUrl;
};

async function applyAuthBranding() {
    try {
        var schoolDocSnap = await schoolRef().get();
        if (!schoolDocSnap.exists) {
            console.warn('[Auth] School record not found for:', window.CURRENT_SCHOOL_ID);
            return;
        }

        var data = schoolDocSnap.data();
        var name = data.schoolName || 'Apex Public School';
        var logo = data.logo || 'ApexPublicSchoolLogo.png';

        var isBareFilename = !logo.startsWith('/') && !logo.startsWith('http') && !logo.startsWith('data:');
        var resolvedLogo = logo;
        if (logo.startsWith('../')) resolvedLogo = logo.substring(2);
        if (!isBareFilename && !resolvedLogo.startsWith('/') && !resolvedLogo.startsWith('http')) resolvedLogo = '/' + resolvedLogo;

        document.title = name + ' | Student Portal';

        var brandName = document.getElementById('portalBrandName');
        var brandDesc = document.getElementById('portalDesc');
        var logoContainer = document.getElementById('schoolLogoContainer');

        if (brandName) brandName.innerText = name;
        if (brandDesc) brandDesc.innerText = 'Student Learning Portal Access';
        if (logoContainer) {
            if (isBareFilename && window.SNRMedia) {
                window.SNRMedia.getDataUrl(logo).then(function (url) {
                    logoContainer.innerHTML = '<img src="' + (url || '') + '" alt="' + name + '" style="height:64px;margin-bottom:20px;object-fit:contain;">';
                });
            } else {
                var ts = Date.now();
                var cacheLogo = resolvedLogo.includes('?') ? resolvedLogo + '&t=' + ts : resolvedLogo + '?t=' + ts;
                logoContainer.innerHTML = '<img src="' + cacheLogo + '" alt="' + name + '" style="height:64px;margin-bottom:20px;object-fit:contain;">';
            }
        }
    } catch (e) {
        console.error('[Auth] Branding failed:', e);
    }
}
