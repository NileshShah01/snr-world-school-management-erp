// Student Dashboard Logic - Premium Version
const GITHUB_BASE = 'https://nileshshah01.github.io/Apex-public-school-test-01';
let currentStudentID = null;
let currentStudentClass = null;
let currentStudentData = null;
let isVisitor = false;

// Check Access Control on load
function checkStudentAccess() {
    const session = localStorage.getItem('student_session');
    if (!session) {
        return false;
    }

    const sessionData = JSON.parse(session);

    // Initialize Access Control
    if (typeof ACCESS_CONTROL !== 'undefined') {
        ACCESS_CONTROL.init({
            role: 'student',
            id: sessionData.student_id,
            studentId: sessionData.student_id,
        });

        // Verify dashboard access
        if (!ACCESS_CONTROL.can('dashboard', 'read')) {
            console.error('Access denied to student dashboard');
            showToast('Access Denied', 'error');
            return false;
        }
    }

    return true;
}

document.addEventListener('DOMContentLoaded', async () => {
    // Wait for school slug → ID resolution before tenant checks and queries
    if (window.schoolBootstrapReady) {
        await window.schoolBootstrapReady;
    }

    // Check Access Control First
    if (!checkStudentAccess()) {
        const slug = getURLSlug();
        window.location.href = slug ? `/${slug}/Student-Login` : '/portal/student-login.html';
        return;
    }

    // Apply Tenant Branding First
    applyStudentBranding();

    const sessionData = JSON.parse(localStorage.getItem('student_session'));

    // SECURITY: Tenant Validation
    // Ensure the student belongs to the current school portal context
    if (sessionData.schoolId && window.CURRENT_SCHOOL_ID && sessionData.schoolId !== window.CURRENT_SCHOOL_ID) {
        console.warn(
            `Tenant Mismatch: Student belongs to ${sessionData.schoolId}, but is on ${window.CURRENT_SCHOOL_ID} portal.`
        );
        alert("Session mismatch. Please login to this school's portal.");
        localStorage.removeItem('student_session');
        const slug = getURLSlug();
        window.location.href = slug ? `/${slug}/Student-Login` : '/portal/student-login.html';
        return;
    }

    currentStudentID = sessionData.student_phone || sessionData.student_id;
    isVisitor = sessionData.role === 'visitor';

    if (!currentStudentID && !isVisitor) {
        const slug = getURLSlug();
        window.location.href = slug ? `/${slug}/Student-Login` : '/portal/student-login.html';
        return;
    }

    // Initialize UI
    fetchStudentData();
    fetchNotices();
    loadDashboardConfig();

    // Handle Hash-based Routing
    window.addEventListener('hashchange', handleRouting);
    handleRouting();

    // Event Listeners
    document.getElementById('academicYear')?.addEventListener('change', updateAcademicData);
});

/**
 * Apply dynamic branding based on school record
 */
async function applyStudentBranding() {
    try {
        const schoolDocSnap = await schoolRef().get();
        if (!schoolDocSnap.exists) return;

        const data = schoolDocSnap.data();
        const name = data.schoolName || 'Apex Public School';
        let logo = data.logo || 'ApexPublicSchoolLogo.png';

        // Detect if logo is a bare media-library filename vs an absolute path/URL.
        const isBareFilename = !logo.startsWith('/') && !logo.startsWith('../') && !logo.startsWith('http') && !logo.startsWith('data:');

        // Update Title
        if (document.getElementById('studentPortalTitle')) {
            document.getElementById('studentPortalTitle').innerText = `${name} | Student Portal`;
        }

        // Sidebar Branding
        if (document.getElementById('sidebarBrandName')) {
            document.getElementById('sidebarBrandName').innerText = name;
        }
        if (document.getElementById('sidebarLogoImg')) {
            const sidebarImg = document.getElementById('sidebarLogoImg');
            sidebarImg.style.display = 'block';
            if (isBareFilename && window.SNRMedia) {
                window.SNRMedia.getDataUrl(logo).then((url) => {
                    if (url) sidebarImg.src = url;
                });
            } else {
                const timestamp = Date.now();
                sidebarImg.src = logo.includes('?') ? logo + '&t=' + timestamp : logo + '?t=' + timestamp;
            }
        }

        // Mobile Brand
        if (document.getElementById('mobileBrandName')) {
            document.getElementById('mobileBrandName').innerText = name;
        }

        // Notice Tag
        if (document.getElementById('noticeTagText')) {
            document.getElementById('noticeTagText').innerText = `${name} Notice`;
        }

        // Footer & Loading
        if (document.getElementById('portalFooterText')) {
            document.getElementById('portalFooterText').innerText =
                `© ${new Date().getFullYear()} ${name}. Powered by Nexorasoftagency.`;
        }
        if (document.getElementById('loadingPortalText')) {
            document.getElementById('loadingPortalText').innerText = `Syncing with ${name} Registry...`;
        }

        // Favicon
        let favicon = document.querySelector('link[rel="icon"]');
        if (!favicon) {
            favicon = document.createElement('link');
            favicon.rel = 'icon';
            document.head.appendChild(favicon);
        }
        favicon.href = logo;
    } catch (e) {
        console.error('Branding failed:', e);
    }
}

// ===================== ROUTING & NAVIGATION =====================
function handleRouting() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    showPortalSection(hash, false);
}

// Refresh student data from database
async function refreshStudentData() {
    showToast('Refreshing data...', 'info');
    setLoading(true);
    try {
        const sessionData = JSON.parse(localStorage.getItem('student_session'));

        let doc = null;
        if (sessionData.student_phone) {
            const snap = await schoolData('students').where('phone', '==', sessionData.student_phone).get();
            if (!snap.empty) {
                doc =
                    snap.docs.find(
                        (d) => d.data().name.trim().toLowerCase() === sessionData.name.trim().toLowerCase()
                    ) || snap.docs[0];
                currentStudentID = doc.id;
            }
        }

        if (!doc && currentStudentID) {
            const fallbackDoc = await schoolDoc('students', currentStudentID).get();
            if (fallbackDoc.exists) doc = fallbackDoc;
        }

        if (doc) {
            currentStudentData = doc.data();
            displayStudentProfile(currentStudentData);
            showToast('Data refreshed successfully', 'success');
        }
    } catch (e) {
        console.error('Refresh error:', e);
        showToast('Failed to refresh data', 'error');
    } finally {
        setLoading(false);
    }
}

function showPortalSection(sectionId, updateHash = true) {
    if (updateHash) window.location.hash = sectionId;

    // Hide all sections
    document.querySelectorAll('.portal-section').forEach((s) => (s.style.display = 'none'));

    // Show target
    const target = document.getElementById(sectionId + 'Section');
    if (target) {
        target.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update Sidebar Links
    document.querySelectorAll('.sidebar .nav-link').forEach((l) => {
        l.classList.remove('active');
        if (l.getAttribute('href') === `#${sectionId}`) {
            l.classList.add('active');
        }
    });

    // Load section specific data if needed
    if (sectionId === 'homework') fetchHomework();
    if (sectionId === 'fees') fetchDuesAndReceipts();
    if (sectionId === 'attendance') fetchAttendance();
    if (sectionId === 'transport') fetchTransport();
    if (sectionId === 'library') fetchLibrary();
    if (sectionId === 'materials') loadExamMaterials();
    if (sectionId === 'results' || sectionId === 'exams') fetchUnifiedReports();
    if (sectionId === 'certificates') loadStudentCertificates();

    // Visitor Access Logic
    if (isVisitor) {
        const privateSections = [
            'homework',
            'attendance',
            'profile',
            'fees',
            'exams',
            'results',
            'library',
            'transport',
        ];
        if (privateSections.includes(sectionId)) {
            const sectionEl = document.getElementById(sectionId + 'Section');
            if (sectionEl) {
                sectionEl.innerHTML = `
                    <div class="card p-4 text-center">
                        <i class="fas fa-lock text-4xl mb-1 opacity-20"></i>
                        <h2 class="text-2xl mb-1">Authenticated Access Required</h2>
                        <p class="text-muted mb-2">Detailed ${sectionId} records are only available for registered students.</p>
                        <hr class="mb-2 opacity-10">
                        <div class="flex gap-1 justify-center">
                            <a href="/portal/student-login.html${getURLSlug() ? '?s=' + getURLSlug() : ''}" class="btn-portal primary">Student Login</a>
                            <a href="/admissions.html" class="btn-portal">Apply for Admission</a>
                        </div>
                    </div>
                `;
            }
        }
    }

    // Parent Section Restriction
    const pSession = JSON.parse(localStorage.getItem('student_session') || '{}');
    if (pSession.role === 'parent' && pSession.allowedSections && pSession.allowedSections.length > 0) {
        if (!pSession.allowedSections.includes(sectionId) && sectionId !== 'dashboard') {
            const sectionEl = document.getElementById(sectionId + 'Section');
            if (sectionEl) {
                sectionEl.style.display = 'block';
                sectionEl.innerHTML = `
                    <div class="card p-4 text-center">
                        <i class="fas fa-lock text-4xl mb-1 opacity-20"></i>
                        <h2 class="text-2xl mb-1">Access Restricted</h2>
                        <p class="text-muted mb-2">This section is not available for your account. Contact the school office if you need access.</p>
                    </div>
                `;
                return;
            }
        }
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('active');
}

// ===================== DATA FETCHING =====================

async function loadDashboardConfig() {
    try {
        const doc = await schoolDoc('settings', 'studentPortal').get();
        if (!doc.exists) return; // Use default visibility
        const d = doc.data();

        // 1. Exam Banner
        const banner = document.getElementById('examAnnouncementBanner');
        if (d.examHeading && banner) {
            document.getElementById('examAnnouncementTitle').textContent = d.examHeading;
            document.getElementById('examAnnouncementNotice').textContent = d.examNotice || '';
            banner.style.display = 'block';
        } else if (banner) {
            banner.style.display = 'none';
        }

        // 2. Sidebar Visibility Controls
        const moduleMap = {
            homework: d.showHomework,
            fees: d.showFees,
            exams: d.showExams,
            materials: d.showMaterials,
        };

        Object.entries(moduleMap).forEach(([m, show]) => {
            const link = document.querySelector(`.nav-link[href="#${m}"]`);
            if (link) {
                link.style.display = show !== false ? 'flex' : 'none';
            }
        });

        // 3. Home Dash Widgets
        const attWidget = document.getElementById('attendanceWidget');
        if (attWidget) {
            if (d.showAttendance) {
                attWidget.style.display = 'block';
                fetchAttendance();
            } else {
                attWidget.style.display = 'none';
            }
        }

        const priWidget = document.getElementById('principalMessageWidget');
        if (priWidget) {
            if (d.showPrincipalMessage && d.principalMessage) {
                priWidget.style.display = 'block';
                document.getElementById('principalMessageText').textContent = d.principalMessage;
            } else {
                priWidget.style.display = 'none';
            }
        }

        const linksWidget = document.getElementById('importantLinksWidget');
        const list = document.getElementById('linksList');
        if (linksWidget && list) {
            if (d.importantLinks && d.importantLinks.length > 0) {
                linksWidget.style.display = 'block';
                list.innerHTML = d.importantLinks
                    .map(
                        (l) => `
                    <a href="${l.url}" target="_blank" class="nav-link" style="padding: 0.5rem; justify-content: flex-start; color: var(--primary);">
                        <i class="fas fa-external-link-square-alt"></i> ${l.title}
                    </a>
                `
                    )
                    .join('');
            } else {
                linksWidget.style.display = 'none';
            }
        }
    } catch (e) {
        console.warn('Student portal config load failed:', e.message);
    }
}

async function fetchStudentData() {
    setLoading(true);
    try {
        if (isVisitor) {
            displayGuestProfile();
            return;
        }
        const sessionData = JSON.parse(localStorage.getItem('student_session'));
        const CACHE_KEY = `student_profile_${sessionData.student_phone || sessionData.student_id || sessionData.currentStudentId}`;

        let doc = null;

        if (sessionData.role === 'parent') {
            // Parent: use currentStudentId from session
            const studentId = sessionData.currentStudentId;
            if (studentId) {
                const parentDoc = await schoolDoc('students', studentId).get();
                if (parentDoc.exists) {
                    doc = parentDoc;
                    currentStudentID = studentId;
                }
            }
        }

        if (!doc && sessionData.student_phone) {
            const snap = await schoolData('students').where('phone', '==', sessionData.student_phone).get();
            if (!snap.empty) {
                doc =
                    snap.docs.find(
                        (d) => d.data().name.trim().toLowerCase() === sessionData.name.trim().toLowerCase()
                    ) || snap.docs[0];
                currentStudentID = doc.id;
            }
        }

        if (!doc && currentStudentID) {
            const fallbackDoc = await schoolDoc('students', currentStudentID).get();
            if (fallbackDoc.exists) doc = fallbackDoc;
        }

        if (doc) {
            currentStudentData = doc.data();
            displayStudentProfile(currentStudentData);
            // Fetch initial fee status for home dashboard
            fetchHomeDues();
        } else {
            alert('Record not found.');
            logoutStudent();
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        setLoading(false);
    }
}

function displayStudentProfile(data) {
    // Top Profile Card
    document.getElementById('disp_student_name').textContent = data.name;
    document.getElementById('disp_student_id').textContent = data.studentId || data.admNo || 'N/A';
    currentStudentClass = data.class || '';
    document.getElementById('disp_class').textContent = `Class ${currentStudentClass}`;
    document.getElementById('disp_section').textContent = data.section || 'N/A';

    // Sidebar & Mobile Profile
    document.getElementById('sidebarStudentName').textContent = data.name;
    document.getElementById('sidebarStudentClass').textContent =
        `Class ${currentStudentClass} - ${data.section || 'N/A'}`;

    // Parent role: override sidebar to show parent info
    const sess = JSON.parse(localStorage.getItem('student_session') || '{}');
    if (sess.role === 'parent') {
        const avatarIcon = document.getElementById('sidebarAvatarIcon');
        const parentIcon = document.getElementById('sidebarParentIcon');
        const parentLabel = document.getElementById('sidebarParentLabel');
        const subLabel = document.getElementById('sidebarStudentSubLabel');
        const nameEl = document.getElementById('sidebarStudentName');
        if (avatarIcon) avatarIcon.style.display = 'none';
        if (parentIcon) parentIcon.style.display = 'flex';
        if (parentLabel) {
            parentLabel.style.display = 'block';
            parentLabel.textContent = sess.parentName + ' (' + (sess.relation || 'Parent') + ')';
        }
        if (nameEl) nameEl.textContent = sess.studentName || data.name;
        if (subLabel) {
            subLabel.style.display = 'block';
            subLabel.textContent = 'Viewing: ' + (sess.studentName || data.name);
        }

        // Child switcher dropdown (only if multiple children)
        const childSwitcher = document.getElementById('parentChildSwitcher');
        if (childSwitcher && sess.linkedStudents && sess.linkedStudents.length > 1) {
            childSwitcher.style.display = 'block';
            childSwitcher.innerHTML = '<option value="">Switch Child...</option>' +
                sess.linkedStudents.map((s) =>
                    `<option value="${s.id}" ${s.id === sess.currentStudentId ? 'selected' : ''}>${s.name} (${s.class || ''})</option>`
                ).join('');
            childSwitcher.onchange = function () {
                if (this.value) switchStudent(this.value);
            };
        } else if (childSwitcher) {
            childSwitcher.style.display = 'none';
        }

        // Show change password button for parents
        const cpBtn = document.getElementById('changePwdBtn');
        if (cpBtn) cpBtn.style.display = 'flex';
    } else {
        const cpBtn = document.getElementById('changePwdBtn');
        if (cpBtn) cpBtn.style.display = 'none';
    }

    // Personal Info Section
    document.getElementById('p_name').textContent = data.name;
    document.getElementById('p_dob').textContent = data.dob || data.dateOfBirth || 'N/A';
    document.getElementById('p_father').textContent = data.fatherName || data.father_name || 'N/A';
    document.getElementById('p_mother').textContent = data.motherName || data.mother_name || 'N/A';
    document.getElementById('p_adm').textContent = data.studentId || data.admNo || 'N/A';
    document.getElementById('p_phone').textContent = data.phone || data.mobile || 'N/A';
    document.getElementById('p_address').textContent = data.address || data.permanent_address || 'N/A';

    // Additional fields - set textContent or update elements if they exist
    const rfidEl = document.getElementById('p_rfid');
    if (rfidEl) {
        rfidEl.textContent = data.rfid_no || data.rfid || data.smart_card_no || 'N/A';
    }

    const transportEl = document.getElementById('p_transport');
    if (transportEl) {
        transportEl.textContent = data.transport === 'yes' ? 'Yes' : data.transport === 'true' ? 'Yes' : 'No';
    }

    const hostelEl = document.getElementById('p_hostel');
    if (hostelEl) {
        hostelEl.textContent = data.hostel === 'yes' ? 'Yes' : data.hostel === 'true' ? 'Yes' : 'No';
    }

    // Photo handling
    const photoUrl = data.photo_url || `${GITHUB_BASE}/images/students/${data.studentId || data.admNo}.jpg`;
    updateStudentPhoto(photoUrl);

    // Dynamic Section Visibility (if not already handled by loadDashboardConfig)
    updateResultLink();
}

function applyVisitorSidebarFilter() {
    const navLinks = document.querySelectorAll('.nav-link');
    const allowedHashes = ['#dashboard', '#materials', '#inquiry', '#support'];

    navLinks.forEach((link) => {
        const hash = link.getAttribute('href');
        if (hash && hash.startsWith('#') && !allowedHashes.includes(hash)) {
            link.style.opacity = '0.4';
            link.classList.add('pointer-events-none');
            // link.classList.add('locked-item'); // Could add a lock icon via CSS if desired
            const span = link.querySelector('span');
            if (span && !span.innerHTML.includes('<i class="fas fa-lock ml-0-5"></i>')) {
                span.innerHTML += ' <i class="fas fa-lock ml-0-25 text-xs"></i>';
            }
        }
    });

    // Update Logout Button
    const logoutBtn = document.querySelector('button[onclick="logoutStudent()"]');
    if (logoutBtn) {
        const span = logoutBtn.querySelector('span');
        if (span) span.textContent = 'Exit Visitor Mode';
        logoutBtn.classList.remove('text-red-300');
        logoutBtn.classList.add('text-secondary');
    }
}

function displayGuestProfile() {
    // Top Profile Card
    document.getElementById('disp_student_name').textContent = 'Guest Visitor';
    document.getElementById('disp_student_id').textContent = 'VISITOR-GUEST';
    document.getElementById('disp_class').textContent = 'Prospective Student';
    document.getElementById('disp_section').textContent = 'GUEST';

    // Sidebar & Mobile Profile
    document.getElementById('sidebarStudentName').textContent = 'Guest Visitor';
    document.getElementById('sidebarStudentClass').textContent = 'Visitor Mode';

    // Reset parent-specific elements if they exist
    const pi = document.getElementById('sidebarParentIcon');
    const pl = document.getElementById('sidebarParentLabel');
    const sl = document.getElementById('sidebarStudentSubLabel');
    const ai = document.getElementById('sidebarAvatarIcon');
    if (ai) ai.style.display = 'flex';
    if (pi) pi.style.display = 'none';
    if (pl) pl.style.display = 'none';
    if (sl) sl.style.display = 'none';

    // Personal Info Section
    document.getElementById('p_name').textContent = 'Guest Visitor';
    document.getElementById('p_dob').textContent = 'N/A';
    document.getElementById('p_father').textContent = 'N/A';
    document.getElementById('p_mother').textContent = 'N/A';
    document.getElementById('p_adm').textContent = 'GUEST-001';
    document.getElementById('p_phone').textContent = 'N/A';
    document.getElementById('p_address').textContent = 'Anonymous Access';

    // Photo handling
    const placeholderUrl = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
    updateStudentPhoto(placeholderUrl);

    // Disable fee balance on home
    const feeBal = document.getElementById('homeFeeBalance');
    if (feeBal) feeBal.textContent = '₹ --';
}

function updateStudentPhoto(url) {
    const divs = ['sidebarStudentPhoto', 'mobileStudentPhoto', 'studentPhotoCard', 'profilePhotoLarge'];
    const img = new Image();
    img.onload = () => {
        divs.forEach((did) => {
            const el = document.getElementById(did);
            if (el) el.innerHTML = `<img src="${url}" style="width:100%; height:100%; object-fit:cover;">`;
        });
    };
    img.onerror = () => {
        /* Keep placeholders */
    };
    img.src = url;
}

// ===================== HOMEWORK MODULE =====================
async function fetchHomework() {
    const grid = document.getElementById('homeworkGrid');
    const empty = document.getElementById('noHomeworkMsg');
    if (!grid || !currentStudentClass) return;

    // Premium Skeleton Loading
    grid.innerHTML = `
        <div class="skeleton-card" style="height: 180px; border-radius: 1rem;"></div>
        <div class="skeleton-card" style="height: 180px; border-radius: 1rem;"></div>
        <div class="skeleton-card" style="height: 180px; border-radius: 1rem;"></div>
    `;

    try {
        const currentStudentSection = currentStudentData?.section || 'A';
        const snap = await schoolData('homework')
            .where('class', '==', currentStudentClass)
            .where('section', 'in', ['All', currentStudentSection])
            .orderBy('date', 'desc')
            .limit(10)
            .get();

        if (snap.empty) {
            grid.innerHTML = '';
            empty.style.display = 'block';
            return;
        }

        empty.style.display = 'none';
        grid.innerHTML = '';
        const hwIds = snap.docs.map(d => d.id);
        const subResults = await Promise.all(hwIds.map(id =>
            schoolData('homework').doc(id).collection('submissions').doc(currentStudentID).get()
        ));
        const subMap = {};
        subResults.forEach((sr, i) => { if (sr.exists) subMap[hwIds[i]] = { id: sr.id, ...sr.data() }; });
        snap.docs.forEach((doc) => {
            const d = doc.data();
            const hwId = doc.id;
            const dateStr = d.date ? new Date(d.date.seconds * 1000).toLocaleDateString() : 'N/A';
            const sub = subMap[hwId];
            let subHtml = '';
            if (sub) {
                if (sub.status === 'graded') {
                    subHtml = `<div style="margin-top:0.75rem;padding:0.75rem;background:rgba(34,197,94,0.08);border-radius:0.5rem;border:1px solid rgba(34,197,94,0.2);">
                        <span class="badge" style="background:#22c55e;color:white;"><i class="fas fa-check-circle"></i> Graded: ${sub.marks ?? '-'}</span>
                        ${sub.feedback ? `<p style="font-size:0.8rem;color:var(--text-muted);margin-top:0.25rem;"><strong>Feedback:</strong> ${sub.feedback}</p>` : ''}
                    </div>`;
                } else {
                    subHtml = `<div style="margin-top:0.75rem;padding:0.75rem;background:rgba(245,158,11,0.08);border-radius:0.5rem;border:1px solid rgba(245,158,11,0.2);">
                        <span class="badge" style="background:#f59e0b;color:white;"><i class="fas fa-clock"></i> Submitted ${sub.submittedAt ? new Date(sub.submittedAt.seconds*1000).toLocaleDateString() : ''}</span>
                        ${sub.fileData ? `<a href="${sub.fileData}" target="_blank" class="btn-portal btn-ghost btn-sm" style="margin-left:0.5rem;"><i class="fas fa-file"></i> View</a>` : ''}
                    </div>`;
                }
            } else {
                subHtml = `<div id="hwSubmitArea_${hwId}" style="margin-top:0.75rem;padding-top:0.75rem;border-top:1px solid var(--border-color);">
                    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:flex-start;">
                        <input type="file" id="hwFile_${hwId}" class="form-control" style="flex:1;min-width:120px;font-size:0.75rem;padding:4px 8px;" accept="image/*,application/pdf,text/plain" />
                        <input type="text" id="hwText_${hwId}" placeholder="Write your answer..." style="flex:2;min-width:200px;font-size:0.8rem;padding:6px 10px;border:1px solid var(--border-color);border-radius:0.375rem;background:var(--bg-main);color:var(--text-main);" />
                        <button onclick="submitHomeworkResponse('${hwId}')" class="btn-portal btn-primary btn-sm"><i class="fas fa-paper-plane"></i> Submit</button>
                    </div>
                </div>`;
            }
            const card = `
                <div class="card hover-translate transition-all-500" style="padding: 1.5rem; position: relative; overflow: hidden; border: 1px solid var(--glass-border); background: var(--glass-bg); backdrop-filter: blur(8px);">
                    <span class="badge" style="position: absolute; top: 1rem; right: 1rem; background: var(--primary); color: white;">${d.subject}</span>
                    <h4 style="margin-bottom: 0.5rem; color: var(--secondary); font-weight: 700;">${d.title}</h4>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;"><i class="far fa-calendar-alt mr-0-25"></i> Published: ${dateStr}</p>
                    <div style="font-size: 0.9rem; line-height: 1.5; color: var(--text-main); margin-bottom: 1.5rem; opacity: 0.8;">${d.content || d.description}</div>
                    ${d.attachment ? `<a href="${d.attachment.dataUri || d.attachment}" target="_blank" class="btn-portal btn-ghost" style="width: 100%; justify-content: center; border-radius: 0.5rem;"><i class="fas fa-paperclip"></i> View Attachment</a>` : ''}
                    ${subHtml}
                </div>
            `;
            grid.innerHTML += card;
        });

        // Update Home Preview
        const preview = document.getElementById('homeHomeworkPreview');
        if (preview) {
            const latest = snap.docs[0].data();
            preview.innerHTML = `
                <div style="background: var(--bg-gray); padding: 1rem; border-radius: 0.75rem;">
                    <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.5rem;">
                        <span class="badge" style="background: var(--primary); color: white;">${latest.subject}</span>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">${new Date(latest.date.seconds * 1000).toLocaleDateString()}</span>
                    </div>
                    <h4 style="font-size: 0.9rem; margin-bottom: 0.25rem;">${latest.title}</h4>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">${(latest.content || latest.description).substring(0, 60)}...</p>
                </div>
            `;
        }
    } catch (e) {
        console.error('Homework error:', e);
        grid.innerHTML =
            '<p style="grid-column: 1/-1; text-align:center; color: var(--danger);">Failed to load homework.</p>';
    }
}

async function submitHomeworkResponse(homeworkId) {
    const fileInput = document.getElementById('hwFile_' + homeworkId);
    const textInput = document.getElementById('hwText_' + homeworkId);
    if (!textInput || (!fileInput?.files?.length && !textInput.value.trim())) {
        showToast('Add a file or write your answer before submitting', 'error');
        return;
    }
    try {
        showLoading(true);
        let fileData = null, fileName = '', fileMime = '', fileSize = 0;
        if (fileInput && fileInput.files.length > 0) {
            const saved = await window.ImageStorage.saveFile(fileInput.files[0], { fieldName: 'HW_Submission' });
            fileData = saved.dataUri;
            fileName = saved.name;
            fileMime = saved.mime;
            fileSize = saved.sizeBytes;
        }
        const subData = {
            studentId: currentStudentID,
            studentName: currentStudentData?.name || currentStudentData?.studentName || 'Student',
            class: currentStudentClass,
            section: currentStudentData?.section || '',
            fileData, fileName, fileMime, fileSize,
            textResponse: textInput.value.trim(),
            status: 'submitted',
            submittedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await schoolData('homework').doc(homeworkId).collection('submissions').doc(currentStudentID).set(subData);
        showToast('Homework submitted successfully!');
        await fetchHomework();
    } catch (e) {
        showToast('Error submitting: ' + e.message, 'error');
    } finally {
        showLoading(false);
    }
}

// ===================== FEES MODULE =====================
async function fetchHomeDues() {
    if (!currentStudentID) return;
    try {
        const feesSnap = await schoolData('fees')
            .where('studentId', '==', currentStudentID)
            .where('status', 'in', ['pending', 'partial'])
            .get();
        let totalBalance = 0;
        feesSnap.forEach(doc => {
            const f = doc.data();
            totalBalance += (f.amount || 0) - (f.paidAmount || 0);
        });
        document.getElementById('homeFeeBalance').textContent = `\u20B9${totalBalance.toLocaleString()}`;

        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December',
        ];
        const currentMonth = months[new Date().getMonth()];
        document.getElementById('homeNextDue').textContent = `${currentMonth} 10th`;
    } catch (e) {
        /* silent */
    }
}

async function fetchDuesAndReceipts() {
    const timeline = document.getElementById('feeReceiptsTimeline');
    const noReceiptsMsg = document.getElementById('noFeeReceiptsMsg');
    const accordion = document.getElementById('feeLedgerAccordion');
    const noLedgerMsg = document.getElementById('noFeeLedgerMsg');
    if (!timeline || !currentStudentID) return;

    timeline.innerHTML = '<div class="flex-center p-3 text-muted">Loading receipts...</div>';
    accordion.innerHTML = '<div class="flex-center p-3 text-muted">Loading ledger...</div>';

    try {
        // 1. Fetch ALL fee records for this student (live from fees collection)
        const feesSnap = await schoolData('fees')
            .where('studentId', '==', currentStudentID)
            .get();

        const feeRecords = feesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Compute totals
        const totalPayable = feeRecords.reduce((sum, f) => sum + (f.amount || 0), 0);
        const totalPaid = feeRecords.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
        const totalBalance = totalPayable - totalPaid;

        document.getElementById('feeTotalPayable').textContent = `\u20B9${totalPayable.toLocaleString()}`;
        document.getElementById('feeTotalPaid').textContent = `\u20B9${totalPaid.toLocaleString()}`;
        document.getElementById('feeTotalBalance').textContent = `\u20B9${totalBalance.toLocaleString()}`;

        // 2. Render Fee Ledger as Accordion grouped by month
        const sortedMonths = [
            'April', 'May', 'June', 'July', 'August', 'September',
            'October', 'November', 'December', 'January', 'February', 'March',
        ];

        const feesByMonth = {};
        feeRecords.forEach(f => {
            const m = f.month;
            if (!feesByMonth[m]) feesByMonth[m] = [];
            feesByMonth[m].push(f);
        });

        const renderedMonths = new Set();
        let accordionHtml = '';
        sortedMonths.forEach(m => {
            if (feesByMonth[m]) {
                const monthRecords = feesByMonth[m];
                const monthYear = monthRecords[0]?.year || '';
                const monthTotal = monthRecords.reduce((s, f) => s + (f.amount || 0), 0);
                const monthPaid = monthRecords.reduce((s, f) => s + (f.paidAmount || 0), 0);
                const monthBalance = monthTotal - monthPaid;
                const monthStatus = monthBalance <= 0 ? 'paid' : (monthPaid > 0 ? 'partial' : 'pending');
                const statusBadge = monthStatus === 'paid'
                    ? '<span class="badge badge-success">PAID</span>'
                    : monthStatus === 'partial'
                    ? '<span class="badge badge-warning">PARTIAL</span>'
                    : '<span class="badge badge-danger">PENDING</span>';

                const detailsHtml = monthRecords.map(f => {
                    const balance = (f.amount || 0) - (f.paidAmount || 0);
                    const fStatus = f.status === 'paid' ? 'PAID' : f.status === 'partial' ? 'PARTIAL' : 'PENDING';
                    const fBadge = f.status === 'paid' ? 'badge-success' : f.status === 'partial' ? 'badge-warning' : 'badge-danger';
                    return `
                        <div class="p-1 border-top text-sm flex-between">
                            <span>${f.feeType || 'Monthly Fee'}</span>
                            <span class="flex items-center gap-1">
                                <span class="text-muted">₹${(f.amount || 0).toLocaleString()}</span>
                                <span class="font-600 text-primary">₹${(f.paidAmount || 0).toLocaleString()}</span>
                                <span class="font-700 ${balance > 0 ? 'text-rose-500' : ''}">₹${balance.toLocaleString()}</span>
                                <span class="badge ${fBadge}">${fStatus}</span>
                            </span>
                        </div>
                    `;
                }).join('');

                accordionHtml += `
                    <details class="accordion-item" ${monthStatus === 'pending' ? 'open' : ''}>
                        <summary class="accordion-header flex-between p-1-5 cursor-pointer">
                            <div class="flex items-center gap-1-5">
                                <i class="fas fa-calendar-alt text-primary"></i>
                                <div>
                                    <strong>${m} ${monthYear}</strong>
                                    <span class="text-sm text-muted ms-1">Total: ₹${monthTotal.toLocaleString()} | Paid: ₹${monthPaid.toLocaleString()}</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-1">
                                ${statusBadge}
                                ${monthBalance > 0 ? `<button class="btn-portal btn-sm btn-primary" onclick="payOnline('${m}', ${monthBalance * 100 || 0}, '${monthYear}')" title="Pay Online"><i class="fas fa-credit-card"></i> Pay</button>` : ''}
                                <i class="fas fa-chevron-down text-muted"></i>
                            </div>
                        </summary>
                        <div class="accordion-body p-1 bg-gray-50">${detailsHtml}</div>
                    </details>
                `;
                renderedMonths.add(m);
            }
        });

        // Render any months not in academic order
        Object.keys(feesByMonth).forEach(m => {
            if (!renderedMonths.has(m)) {
                const monthRecords = feesByMonth[m];
                const monthYear = monthRecords[0]?.year || '';
                const monthTotal = monthRecords.reduce((s, f) => s + (f.amount || 0), 0);
                const monthPaid = monthRecords.reduce((s, f) => s + (f.paidAmount || 0), 0);
                const monthBalance = monthTotal - monthPaid;
                const monthStatus = monthBalance <= 0 ? 'paid' : (monthPaid > 0 ? 'partial' : 'pending');
                const statusBadge = monthStatus === 'paid'
                    ? '<span class="badge badge-success">PAID</span>'
                    : monthStatus === 'partial'
                    ? '<span class="badge badge-warning">PARTIAL</span>'
                    : '<span class="badge badge-danger">PENDING</span>';

                const detailsHtml = monthRecords.map(f => {
                    const balance = (f.amount || 0) - (f.paidAmount || 0);
                    const fStatus = f.status === 'paid' ? 'PAID' : f.status === 'partial' ? 'PARTIAL' : 'PENDING';
                    const fBadge = f.status === 'paid' ? 'badge-success' : f.status === 'partial' ? 'badge-warning' : 'badge-danger';
                    return `
                        <div class="p-1 border-top text-sm flex-between">
                            <span>${f.feeType || 'Monthly Fee'}</span>
                            <span class="flex items-center gap-1">
                                <span class="text-muted">₹${(f.amount || 0).toLocaleString()}</span>
                                <span class="font-600 text-primary">₹${(f.paidAmount || 0).toLocaleString()}</span>
                                <span class="font-700 ${balance > 0 ? 'text-rose-500' : ''}">₹${balance.toLocaleString()}</span>
                                <span class="badge ${fBadge}">${fStatus}</span>
                            </span>
                        </div>
                    `;
                }).join('');

                accordionHtml += `
                    <details class="accordion-item" ${monthStatus === 'pending' ? 'open' : ''}>
                        <summary class="accordion-header flex-between p-1-5 cursor-pointer">
                            <div class="flex items-center gap-1-5">
                                <i class="fas fa-calendar-alt text-primary"></i>
                                <div>
                                    <strong>${m} ${monthYear}</strong>
                                    <span class="text-sm text-muted ms-1">Total: ₹${monthTotal.toLocaleString()} | Paid: ₹${monthPaid.toLocaleString()}</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-1">
                                ${statusBadge}
                                ${monthBalance > 0 ? `<button class="btn-portal btn-sm btn-primary" onclick="payOnline('${m}', ${monthBalance * 100 || 0}, '${monthYear}')" title="Pay Online"><i class="fas fa-credit-card"></i> Pay</button>` : ''}
                                <i class="fas fa-chevron-down text-muted"></i>
                            </div>
                        </summary>
                        <div class="accordion-body p-1 bg-gray-50">${detailsHtml}</div>
                    </details>
                `;
            }
        });

        if (feeRecords.length === 0) {
            accordion.innerHTML = '';
            noLedgerMsg.style.display = 'block';
        } else {
            noLedgerMsg.style.display = 'none';
            accordion.innerHTML = accordionHtml;
        }

        // 3. Fetch Payments (Receipts) from feePayments collection - render as TIMELINE
        const paySnap = await schoolData('feePayments')
            .where('studentId', '==', currentStudentID)
            .orderBy('createdAt', 'desc')
            .get();

        if (paySnap.empty) {
            timeline.innerHTML = '';
            noReceiptsMsg.style.display = 'block';
        } else {
            noReceiptsMsg.style.display = 'none';
            timeline.innerHTML = paySnap.docs.map((doc, idx) => {
                const p = doc.data();
                const d = p.createdAt ? new Date(p.createdAt.seconds * 1000).toLocaleDateString() : 'N/A';
                const amt = p.amount || p.amountPaid || 0;
                const mode = p.paymentMode || 'unknown';
                const modeIcon = mode === 'cash' ? 'fa-money-bill-wave' : mode === 'online' ? 'fa-credit-card' : mode === 'cheque' ? 'fa-university' : mode === 'upi' ? 'fa-qrcode' : 'fa-money-bill';
                return `
                <div class="timeline-item" style="position:relative; padding-left:2rem; padding-bottom:1.5rem; border-left:2px solid var(--border);">
                    <div style="position:absolute; left:-0.65rem; top:0.25rem; width:1rem; height:1rem; border-radius:50%; background:var(--primary); border:3px solid var(--bg);"></div>
                    <div class="card p-1-5 hover-lift">
                        <div class="flex-between mb-0-5">
                            <div class="flex items-center gap-1">
                                <div class="icon-box bg-primary-light text-primary"><i class="fas ${modeIcon}"></i></div>
                                <div>
                                    <strong class="text-primary">${p.receiptNo}</strong>
                                    <span class="text-sm text-muted ms-1">${d}</span>
                                </div>
                            </div>
                            <strong class="text-xl text-primary">₹${amt.toLocaleString()}</strong>
                        </div>
                        <div class="flex-between text-sm">
                            <span class="text-muted">${mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
                            <div class="flex gap-0-5">
                                <button onclick="printStudentReceipt('${doc.id}')" class="btn-portal btn-ghost btn-sm" title="View Receipt"><i class="fas fa-print"></i></button>
                                <button onclick="downloadStudentReceiptPDF('${doc.id}')" class="btn-portal btn-primary btn-sm" title="Download PDF"><i class="fas fa-file-pdf"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
                `;
            }).join('');
        }
    } catch (e) {
        console.error('Fee fetch error:', e);
        timeline.innerHTML = `<div class="card p-3 text-center text-rose-500">Error loading fee data.</div>`;
        accordion.innerHTML = '';
    }
}

async function printStudentReceipt(paymentId) {
    setLoading(true);
    try {
        const payDoc = await schoolData('feePayments').doc(paymentId).get();
        if (!payDoc.exists) return;
        const p = payDoc.data();

        const schoolSnap = await schoolRef().get();
        const sc = schoolSnap.data() || {};

        const modal = document.getElementById('portalModal');
        const body = document.getElementById('modalBody');

        const receiptHtml = `
            <div class="premium-receipt">
                <div class="receipt-header">
                    <div class="receipt-logo">
                        <img src="${sc.logo || 'ApexPublicSchoolLogo.png'}" alt="Logo" onerror="if(window.SNRMedia){window.SNRMedia.getDataUrl('ApexPublicSchoolLogo.png').then(u=>{this.src=u||''})}">
                        <div>
                            <h2 style="margin:0; color:var(--primary); font-size:1.4rem;">${sc.schoolName || 'Apex Public School'}</h2>
                            <p style="margin:0; font-size:0.75rem; color:var(--text-muted);">${sc.address || 'School Campus Address'}</p>
                        </div>
                    </div>
                    <div class="receipt-title-box">
                        <h1>FEE RECEIPT</h1>
                        <p style="margin:0; font-weight:700;">No: ${p.receiptNo}</p>
                    </div>
                </div>

                <div class="receipt-grid">
                    <div class="info-group">
                        <label>Student Name</label>
                        <p>${currentStudentData.name}</p>
                    </div>
                    <div class="info-group">
                        <label>Student ID / Admission No</label>
                        <p>${currentStudentData.studentId || currentStudentData.admNo}</p>
                    </div>
                    <div class="info-group">
                        <label>Class & Section</label>
                        <p>Class ${currentStudentClass} - ${currentStudentData.section || 'N/A'}</p>
                    </div>
                    <div class="info-group">
                        <label>Payment Date</label>
                        <p>${p.paymentDate ? new Date(p.paymentDate.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                    </div>
                </div>

                <table class="receipt-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align:right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>School Fee Payment (${p.paymentMode})</td>
                            <td style="text-align:right; font-weight:700;">\u20B9${(p.amount || 0).toLocaleString()}</td>
                        </tr>
                        <tr class="total-row">
                            <td>TOTAL AMOUNT PAID</td>
                            <td style="text-align:right;">\u20B9${(p.amount || 0).toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>

                <div style="margin-bottom: 2rem;">
                    <p style="font-size: 0.85rem; color: var(--text-muted);">Amount in Words: <b style="color:var(--secondary); text-transform:capitalize;">${numberToWords(p.amount || 0)} Rupees Only</b></p>
                </div>

                <div class="receipt-footer">
                    <div class="seal-area">SCHOOL SEAL</div>
                    <div class="signature-box">
                        <div class="signature-line">Authorized Signatory</div>
                    </div>
                </div>

                <div style="margin-top:2rem; font-size:0.65rem; color:#aaa; text-align:center;">
                    This is a computer generated receipt and does not require a physical signature.
                </div>
            </div>
        `;

        body.innerHTML = receiptHtml;
        modal.classList.remove('hidden');
    } catch (e) {
        console.error('Receipt preview failed:', e);
        showToast('Failed to generate receipt preview.', 'error');
    } finally {
        setLoading(false);
    }
}

function closePortalModal() {
    document.getElementById('portalModal').classList.add('hidden');
}

function numberToWords(amount) {
    // Simple enough for 5 digits for now
    const words = [
        '',
        'One',
        'Two',
        'Three',
        'Four',
        'Five',
        'Six',
        'Seven',
        'Eight',
        'Nine',
        'Ten',
        'Eleven',
        'Twelve',
        'Thirteen',
        'Fourteen',
        'Fifteen',
        'Sixteen',
        'Seventeen',
        'Eighteen',
        'Nineteen',
    ];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (amount === 0) return 'Zero';

    if (amount < 20) return words[amount];

    if (amount < 100) return tens[Math.floor(amount / 10)] + (amount % 10 !== 0 ? ' ' + words[amount % 10] : '');

    if (amount < 1000)
        return (
            words[Math.floor(amount / 100)] +
            ' Hundred' +
            (amount % 100 !== 0 ? ' and ' + numberToWords(amount % 100) : '')
        );

    if (amount < 100000)
        return (
            numberToWords(Math.floor(amount / 1000)) +
            ' Thousand' +
            (amount % 1000 !== 0 ? ' ' + numberToWords(amount % 1000) : '')
        );

    return amount.toString(); // Fallback
}

// ===================== OTHER UPDATES =====================
function updateAcademicData() {
    updateResultLink();
    fetchDuesAndReceipts();
}

async function fetchAttendance() {
    if (!currentStudentID) return;
    const grid = document.getElementById('attendanceCardsGrid');
    const emptyMsg = document.getElementById('noAttendanceMsg');
    if (!grid) return;

    grid.innerHTML = `
        <div class="skeleton-card" style="height: 120px; border-radius: 1rem;"></div>
        <div class="skeleton-card" style="height: 120px; border-radius: 1rem;"></div>
        <div class="skeleton-card" style="height: 120px; border-radius: 1rem;"></div>
    `;
    emptyMsg.style.display = 'none';

    try {
        const snap = await schoolData('attendance')
            .where('studentId', '==', currentStudentID)
            .orderBy('date', 'desc')
            .get();

        if (snap.empty) {
            grid.innerHTML = '';
            emptyMsg.style.display = 'block';
            return;
        }

        emptyMsg.style.display = 'none';

        let total = 0;
        let present = 0;
        let absent = 0;

        grid.innerHTML = snap.docs.map((doc) => {
            const d = doc.data();
            total++;
            if (d.status === 'present' || d.status === 'late') present++;
            if (d.status === 'absent') absent++;

            const statusInfo = {
                present: { icon: 'fa-check-circle', color: 'text-success', bg: 'bg-success-light', label: 'Present' },
                absent: { icon: 'fa-times-circle', color: 'text-rose-500', bg: 'bg-rose-50', label: 'Absent' },
                late: { icon: 'fa-clock', color: 'text-amber-500', bg: 'bg-amber-50', label: 'Late' },
                leave: { icon: 'fa-plane-departure', color: 'text-blue-500', bg: 'bg-blue-50', label: 'On Leave' },
            }[d.status] || { icon: 'fa-question', color: 'text-muted', bg: 'bg-gray-50', label: d.status };

            const dateStr = d.date ? new Date(d.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

            return `
            <div class="card p-1-5 hover-lift flex-col gap-1">
                <div class="flex-between">
                    <div class="flex items-center gap-1">
                        <div class="icon-box ${statusInfo.bg} ${statusInfo.color}"><i class="fas ${statusInfo.icon}"></i></div>
                        <div>
                            <h4 class="font-700 text-sm mb-0">${dateStr}</h4>
                            <p class="text-xs text-muted mb-0">${statusInfo.label}${d.remarks ? ' - ' + d.remarks : ''}</p>
                        </div>
                    </div>
                    <span class="badge ${statusInfo.color === 'text-success' ? 'badge-success' : statusInfo.color === 'text-rose-500' ? 'badge-danger' : statusInfo.color === 'text-amber-500' ? 'badge-warning' : 'badge-info'}">${statusInfo.label}</span>
                </div>
            </div>
            `;
        }).join('');

        // Update Stats
        const percent = Math.round((present / total) * 100) || 0;
        document.getElementById('att_presentDays').textContent = present;
        document.getElementById('att_absentDays').textContent = absent;
        document.getElementById('att_percentage').textContent = `${percent}%`;

        // Update Home Widget if exists
        const homePercent = document.getElementById('attendancePercent');
        const homeCircle = document.getElementById('attendanceCircle');
        const homeStatus = document.getElementById('attendanceStatusText');
        if (homePercent) homePercent.textContent = `${percent}%`;
        if (homeCircle) homeCircle.setAttribute('stroke-dasharray', `${percent}, 100`);
        if (homeStatus) homeStatus.textContent = `Regularity: ${percent}%`;
    } catch (e) {
        console.error('Attendance fetch error:', e);
        grid.innerHTML = `<div class="card p-3 text-center text-rose-500">Error loading attendance.</div>`;
        emptyMsg.style.display = 'none';
    }
}

async function updateResultLink() {
    const year = document.getElementById('academicYear').value;
    const resultArea = document.getElementById('resultStatusArea');
    const admitArea = document.getElementById('admitCardStatusArea');
    const timetableArea = document.getElementById('timetableStatusArea');

    if (resultArea) resultArea.innerHTML = '<span class="badge">Checking...</span>';
    if (admitArea) admitArea.innerHTML = '<span class="badge">Checking...</span>';

    loadExamMaterials();

    // Check Result Card (Manual Upload or Generated)
    try {
        // Priority 1: Check for manual uploads in reports collection
        const manualSnap = await schoolData('reports')
            .where('studentId', '==', currentStudentID)
            .where('session', '==', year)
            .where('published', '==', true)
            .orderBy('uploadedAt', 'desc')
            .limit(1)
            .get();

        if (!manualSnap.empty) {
            const reportData = manualSnap.docs[0].data();
            resultArea.innerHTML = `<a href="${reportData.fileData}" download="${reportData.fileName || 'ReportCard.pdf'}" class="btn-portal btn-primary" style="width: 100%; justify-content: center;"><i class="fas fa-file-download"></i> Download Report</a>`;
        } else {
            // Priority 2: Check for generated report card (Legacy/Phase 5 auto-gen)
            const docRef = await schoolDoc('reports', `${currentStudentID}_${year}`).get();
            if (docRef.exists) {
                const pubSnap = await schoolData('publications')
                    .where('className', '==', currentStudentClass)
                    .where('published', '==', true)
                    .get();
                if (!pubSnap.empty) {
                    resultArea.innerHTML = `<a href="${docRef.data().fileData}" download class="btn-portal btn-primary" style="width: 100%; justify-content: center;"><i class="fas fa-download"></i> Result</a>`;
                } else {
                    resultArea.innerHTML = '<div style="font-size:0.8rem; color:#b45309;">Processing...</div>';
                }
            } else {
                resultArea.innerHTML = '<div style="font-size:0.8rem; color:var(--text-muted);">Not published</div>';
            }
        }
    } catch (e) {
        console.error('Result check error:', e);
        if (resultArea)
            resultArea.innerHTML = '<div style="font-size:0.8rem; color:var(--text-muted);">Not published</div>';
    }

    if (timetableArea && currentStudentClass) {
        try {
            const classId = currentStudentClass.toLowerCase().replace(/\s+/g, '-');
            const ttDoc = await schoolDoc('timetables', classId).get();
            const pSnap = await schoolData('timetables').doc(classId).collection('periods').limit(1).get();
            if (!pSnap.empty) {
                const allPeriods = await schoolData('timetables').doc(classId).collection('periods').get();
                const periods = {};
                allPeriods.docs.forEach(d => { periods[d.id] = d.data(); });
                const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
                let html = '<div style="overflow-x:auto;font-size:0.75rem;"><table style="width:100%;border-collapse:collapse;min-width:600px;">';
                html += '<thead><tr style="background:var(--bg-gray);"><th style="padding:4px 6px;text-align:left;border:1px solid var(--border-color);">Day</th>';
                for (let p = 1; p <= 8; p++) html += `<th style="padding:4px 6px;border:1px solid var(--border-color);">P${p}</th>`;
                html += '</tr></thead><tbody>';
                days.forEach(day => {
                    html += `<tr><td style="font-weight:600;padding:4px 6px;border:1px solid var(--border-color);">${day.slice(0,3)}</td>`;
                    for (let p = 1; p <= 8; p++) {
                        const data = periods[`${day}_${p}`];
                        if (data) html += `<td style="padding:3px 4px;border:1px solid var(--border-color);"><div style="font-weight:500;">${data.subject||''}</div><div style="color:var(--text-muted);font-size:0.65rem;">${data.teacherName||''}${data.room?' · '+data.room:''}</div></td>`;
                        else html += `<td style="padding:3px 4px;border:1px solid var(--border-color);text-align:center;color:#ccc;">-</td>`;
                    }
                    html += '</tr>';
                });
                html += '</tbody></table></div>';
                timetableArea.innerHTML = html;
            } else if (ttDoc.exists && ttDoc.data().fileData) {
                timetableArea.innerHTML = `<a href="${ttDoc.data().fileData}" download class="btn-portal" style="background:#0d9488;color:white;width:auto;justify-content:center;"><i class="fas fa-download"></i> View Timetable</a>`;
            } else {
                throw new Error('404');
            }
        } catch (e) {
            timetableArea.innerHTML = '<span style="font-size:0.8rem;color:var(--text-muted);padding:0.5rem;display:block;background:var(--bg-gray);border-radius:0.5rem;">Class timetable not uploaded yet.</span>';
        }
    }
}

/**
 * Unified logic to fetch both auto-generated and manual report cards
 */
async function fetchUnifiedReports() {
    const manualArea = document.getElementById('manualResultsArea');
    const examResultArea = document.getElementById('resultStatusArea');
    if (!manualArea && !examResultArea) return;

    const year = document.getElementById('academicYear').value;
    const skeleton = `
        <div class="skeleton-card" style="height: 60px; margin-bottom: 0.75rem; border-radius: 0.75rem;"></div>
        <div class="skeleton-card" style="height: 60px; margin-bottom: 0.75rem; border-radius: 0.75rem;"></div>
    `;

    if (manualArea) manualArea.innerHTML = skeleton;
    if (examResultArea) examResultArea.innerHTML = '<span class="text-xs opacity-50">Syncing...</span>';

    try {
        // 1. Fetch Manual Uploads
        const manualSnap = await schoolData('reports')
            .where('studentId', 'in', [
                currentStudentData.studentId || '',
                currentStudentData.admNo || '',
                currentStudentID,
            ])
            .where('published', '==', true)
            .get();

        // 2. Check Auto-Generated (Legacy format or specific term reports)
        const autoDoc = await schoolDoc('reports', `${currentStudentID}_${year}`).get();
        let pubStatus = false;
        if (autoDoc.exists) {
            const pubSnap = await schoolData('publications')
                .where('className', '==', currentStudentClass)
                .where('published', '==', true)
                .get();
            pubStatus = !pubSnap.empty;
        }

        // Logic for "Exams" Section (Latest Result)
        if (examResultArea) {
            if (pubStatus && autoDoc.exists) {
                examResultArea.innerHTML = `<a href="${autoDoc.data().fileData}" download="Report_${year}.pdf" class="btn-portal btn-primary w-full justify-center"><i class="fas fa-download"></i> Latest Result</a>`;
            } else if (!manualSnap.empty) {
                const latest = manualSnap.docs[0].data();
                examResultArea.innerHTML = `<a href="${latest.fileData}" download="${latest.title || 'Result'}.pdf" class="btn-portal btn-primary w-full justify-center"><i class="fas fa-download"></i> View Report</a>`;
            } else {
                examResultArea.innerHTML = '<div class="text-xs opacity-50 py-1">No active reports</div>';
            }
        }

        // Logic for "My Report Card" Section (List)
        if (manualArea) {
            let reportsHtml = '';

            // Add auto-gen if published
            if (pubStatus && autoDoc.exists) {
                reportsHtml += renderReportRow({
                    title: `Annual Report Card ${year}`,
                    session: year,
                    fileData: autoDoc.data().fileData,
                    uploadedAt: autoDoc.data().generatedAt || null,
                    type: 'System Generated',
                });
            }

            // Add manuals
            manualSnap.forEach((doc) => {
                reportsHtml += renderReportRow({
                    ...doc.data(),
                    type: 'Official Upload',
                });
            });

            if (reportsHtml === '') {
                manualArea.innerHTML = `
                    <div class="flex-center p-4 text-muted border-radius-1 bg-secondary dashed">
                        <p class="m-0 italic">No published reports currently available.</p>
                    </div>
                `;
            } else {
                manualArea.innerHTML = reportsHtml;
            }
        }
    } catch (e) {
        console.error('Unified Report Fetch Error:', e);
        if (manualArea) manualArea.innerHTML = '<p class="text-xs text-danger">Failed to load reports archive.</p>';
    }
}

function renderReportRow(r) {
    const dateStr = r.uploadedAt
        ? r.uploadedAt.toDate
            ? r.uploadedAt.toDate().toLocaleDateString()
            : new Date(r.uploadedAt).toLocaleDateString()
        : 'Institutional Record';
    return `
        <div class="card flex-between p-1 border-left-primary bg-white shadow-sm hover-translate transition-all" style="margin-bottom: 0.75rem;">
            <div class="flex align-center gap-1">
                <div class="w-10 h-10 bg-blue-light text-primary flex-center border-radius-0-75 text-lg">
                    <i class="fas fa-file-pdf"></i>
                </div>
                <div class="text-left">
                    <h4 class="m-0 secondary text-sm fw-700">${r.title || 'Academic Record'}</h4>
                    <p class="text-xs text-muted m-0">${r.type} | ${dateStr}</p>
                </div>
            </div>
            <button onclick="downloadReport('${r.fileData}', '${r.title || 'ReportCard'}')" class="btn-portal btn-white shadow-sm font-bold text-xs p-0-5-1">
                <i class="fas fa-download mr-0-5"></i>
            </button>
        </div>
    `;
}

async function loadExamMaterials() {
    const list = document.getElementById('paperDownloadList');
    const status = document.getElementById('examMaterialsStatusArea');

    // Determine search class
    let searchClass = currentStudentClass;
    if (isVisitor) searchClass = 'Sample'; // Default for visitors

    if (!list || (!searchClass && !isVisitor)) return;

    list.innerHTML = '<p class="text-center p-2">Looking for practice materials...</p>';
    try {
        const year = document.getElementById('academicYear').value;
        const sessionId = `${year - 1}_${year.toString().slice(-2)}`;

        let query = schoolData('questionPapers').where('published', '==', true);

        if (searchClass) {
            query = query.where('class', '==', searchClass);
        }

        const snap = await query.orderBy('createdAt', 'desc').get();

        if (snap.empty) {
            list.innerHTML = '<p class="text-center text-muted p-2">No practice papers published yet.</p>';
            if (status) status.innerHTML = '<span class="badge">No papers yet</span>';
            return;
        }

        if (status)
            status.innerHTML = `<span class="badge" style="background:#dcfce7; color:#166534;">${snap.size} Materials Available</span>`;

        list.innerHTML = '';
        snap.forEach((doc) => {
            const d = doc.data();
            const card = document.createElement('div');
            card.className = 'card p-1-25 flex-col gap-0-75';
            card.style.background = 'rgba(255,255,255,0.05)';

            const url = d.fileUrl || '#';
            const isManual = d.paperType === 'manualUpload';

            card.innerHTML = `
                <div class="flex justify-between align-start">
                    <div>
                        <h4 class="mb-0-25 text-sm">${d.subject}</h4>
                        <p class="text-xs opacity-60">${d.examId || 'Practice Test'}</p>
                    </div>
                    <i class="fas fa-file-pdf text-xl" style="color:#ef4444;"></i>
                </div>
                <a href="${url}" target="_blank" class="btn-portal btn-ghost btn-sm" style="width: 100%; justify-content: center; margin-top: auto;">
                    <i class="fas fa-download"></i> Download PDF
                </a>
            `;
            list.appendChild(card);
        });
    } catch (e) {
        console.error('Materials load failed:', e);
        list.innerHTML = '<p class="text-center text-danger p-2">Error loading materials.</p>';
    }
}

async function fetchNotices() {
    const container = document.getElementById('noticesContainer');
    if (!container) return;
    try {
        const snap = await schoolData('notifications').orderBy('sentAt', 'desc').limit(10).get();

        if (snap.empty) {
            container.innerHTML =
                '<div class="text-center py-3 opacity-05"><i class="fas fa-bell-slash text-2xl mb-1 block"></i><p class="text-sm">No recent notifications.</p></div>';
            return;
        }

        container.innerHTML = snap.docs
            .map((doc) => {
                const d = doc.data();
                const date = d.sentAt
                    ? new Date(d.sentAt.seconds * 1000).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                      })
                    : 'Just now';

                // Filter target (optional but good for privacy/relevance)
                // If class is specified and doesn't match current student, skip (unless target is 'All')
                if (d.target && d.target.class !== 'All' && d.target.class !== currentStudentClass) {
                    return '';
                }

                return `
                <div class="notice-item p-1 border-bottom-soft">
                    <div class="flex justify-between align-start mb-0-25">
                        <h4 class="text-sm font-bold text-secondary">${d.type === 'WhatsApp' ? '<i class="fab fa-whatsapp text-success mr-0-5"></i>' : ''}${d.title || 'Notification'}</h4>
                        <span class="text-xs opacity-50 font-mono">${date}</span>
                    </div>
                    <p class="text-xs line-height-1-5 opacity-90">${d.message}</p>
                </div>
            `;
            })
            .join('');
    } catch (error) {
        console.error('Notice fetch failed:', error);
    }
}

async function fetchTransport() {
    const area = document.getElementById('transportInfoArea');
    if (!area || !currentStudentData) return;

    if (currentStudentData.is_transport_user === 'Yes') {
        area.innerHTML = `
            <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--secondary);">${currentStudentData.transport_route || 'Not Set'}</h2>
            <p style="font-size: 1.1rem; color: var(--primary); font-weight: 700;">Pickup Point: ${currentStudentData.transport_stop || 'Main Gate'}</p>
            <div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg-gray); border-radius: 0.5rem; font-size: 0.85rem; color: var(--text-muted);">
                <i class="fas fa-info-circle"></i> Please be at the stop 5 minutes early.
            </div>
        `;
    } else {
        area.innerHTML = `
            <p style="color: var(--text-muted); margin-bottom: 1.5rem;">You are not registered for school transport.</p>
            <button class="btn-portal btn-ghost">Apply for Transport</button>
        `;
    }
}

async function fetchLibrary() {
    const grid = document.getElementById('libraryCardsGrid');
    const emptyMsg = document.getElementById('noLibraryBooksMsg');
    if (!grid || !currentStudentID) return;

    grid.innerHTML = `
        <div class="skeleton-card" style="height: 180px; border-radius: 1rem;"></div>
        <div class="skeleton-card" style="height: 180px; border-radius: 1rem;"></div>
        <div class="skeleton-card" style="height: 180px; border-radius: 1rem;"></div>
    `;
    emptyMsg.style.display = 'none';

    try {
        const snap = await schoolData('library_transactions')
            .where('studentId', '==', currentStudentID)
            .where('status', '==', 'Issued')
            .get();

        if (snap.empty) {
            grid.innerHTML = '';
            emptyMsg.style.display = 'block';
            return;
        }

        emptyMsg.style.display = 'none';
        grid.innerHTML = snap.docs
            .map((doc) => {
                const d = doc.data();
                const issueDate = d.issueDate ? new Date(d.issueDate.seconds * 1000).toLocaleDateString() : 'N/A';
                const dueDate = d.expectedReturnDate ? new Date(d.expectedReturnDate.seconds * 1000).toLocaleDateString() : 'N/A';
                const isOverdue = d.expectedReturnDate && new Date(d.expectedReturnDate.seconds * 1000) < new Date();
                return `
                <div class="card p-1-5 hover-lift flex-col gap-1">
                    <div class="flex-between">
                        <div class="flex items-center gap-1">
                            <div class="icon-box bg-blue-50 text-blue-600"><i class="fas fa-book"></i></div>
                            <div>
                                <h4 class="font-700 text-sm mb-0">${d.bookTitle}</h4>
                                <p class="text-xs text-muted mb-0">Issued: ${issueDate}</p>
                            </div>
                        </div>
                        <span class="badge ${isOverdue ? 'badge-danger' : 'badge-warning'}">${isOverdue ? 'Overdue' : 'Issued'}</span>
                    </div>
                    <div class="flex-between pt-0-5 border-top">
                        <div class="text-sm">
                            <span class="text-muted">Due:</span>
                            <span class="font-600 ${isOverdue ? 'text-rose-500' : ''}">${dueDate}</span>
                        </div>
                        ${d.bookId ? `<button class="btn-portal btn-sm btn-primary" onclick="window.open('/library/book?id=${d.bookId}', '_blank', 'noopener,noreferrer')"><i class="fas fa-external-link-alt"></i> View</button>` : ''}
                    </div>
                </div>
                `;
            })
            .join('');
    } catch (e) {
        console.error(e);
        grid.innerHTML = `<div class="card p-3 text-center text-rose-500">Error loading library data.</div>`;
        emptyMsg.style.display = 'none';
    }
}

function setLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = show ? 'flex' : 'none';
}

function logoutStudent() {
    localStorage.removeItem('student_session');
    const slug = getURLSlug();
    window.location.href = slug ? `/${slug}/Student-Login` : '/portal/student-login.html';
}

// ===================== CERTIFICATES =====================
async function loadStudentCertificates() {
    const grid = document.getElementById('certificatesCardsGrid');
    const noMsg = document.getElementById('noCertificatesMsg');
    if (!grid) return;

    grid.innerHTML = `
        <div class="skeleton-card" style="height: 200px; border-radius: 1rem;"></div>
        <div class="skeleton-card" style="height: 200px; border-radius: 1rem;"></div>
        <div class="skeleton-card" style="height: 200px; border-radius: 1rem;"></div>
    `;
    noMsg.style.display = 'none';

    try {
        const fromAdmin = schoolData('certificates')
            .where('studentId', '==', currentStudentID)
            .where('status', 'in', ['active', 'issued'])
            .get();
        const fromStudent = schoolData('studentCertificates')
            .where('studentId', '==', currentStudentID)
            .get();
        const [adminSnap, studentSnap] = await Promise.all([fromAdmin, fromStudent]);

        const certs = [];
        adminSnap.forEach((d) => certs.push({ id: d.id, source: 'admin', ...d.data() }));
        studentSnap.forEach((d) => certs.push({ id: d.id, source: 'student', ...d.data() }));

        if (certs.length === 0) {
            grid.innerHTML = '';
            noMsg.style.display = 'block';
            return;
        }

        noMsg.style.display = 'none';
        grid.innerHTML = certs.map((c) => {
            const date = c.createdAt
                ? new Date(c.createdAt.seconds * 1000).toLocaleDateString()
                : c.issueDate || '-';
            const certType = c.certificateType || c.type || 'Certificate';
            const refNo = c.certificateNumber || c.referenceNo || '-';
            const status = c.status === 'active' || c.status === 'issued';
            const pdfUrl = c.pdfUrl || c.downloadUrl || '';
            const hasPdf = pdfUrl && pdfUrl.startsWith('data:');

            const iconMap = {
                'Bonafide': 'fa-id-card',
                'SLC': 'fa-file-alt',
                'TC': 'fa-file-alt',
                'Transfer': 'fa-exchange-alt',
                'Character': 'fa-user-check',
                'Migration': 'fa-plane-departure',
                'Sports': 'fa-trophy',
            };
            const icon = Object.keys(iconMap).find(k => certType.toLowerCase().includes(k.toLowerCase()))
                ? iconMap[Object.keys(iconMap).find(k => certType.toLowerCase().includes(k.toLowerCase()))]
                : 'fa-certificate';

            return `
            <div class="card p-1-5 hover-lift flex-col gap-1 ${status ? 'border-left-success' : ''}">
                <div class="flex-between mb-0-5">
                    <div class="flex items-center gap-1">
                        <div class="icon-box ${status ? 'bg-success-light text-success' : 'bg-gray-50 text-muted'}"><i class="fas ${icon}"></i></div>
                        <div>
                            <h4 class="font-700 text-sm mb-0">${certType}</h4>
                            <p class="text-xs text-muted mb-0">${date}</p>
                        </div>
                    </div>
                    <span class="badge ${status ? 'badge-success' : 'badge-warning'}">${status ? 'Issued' : (c.status || 'Draft')}</span>
                </div>
                <div class="flex-between pt-0-5 border-top text-xs">
                    <span class="text-muted">${refNo !== '-' ? 'Ref: ' + refNo : ''}</span>
                    <div class="flex gap-0-5">
                        ${hasPdf ? `<button onclick="downloadCertPDF('${pdfUrl.replace(/'/g, "\\'")}','${certType.replace(/'/g, "\\'")}')" class="btn-portal btn-sm btn-primary" title="Download"><i class="fas fa-download"></i></button>` : ''}
                        ${c.id ? `<button onclick="viewStudentCertPDF('${c.id}','${c.source}')" class="btn-portal btn-sm" title="View"><i class="fas fa-eye"></i></button>` : ''}
                    </div>
                </div>
            </div>
            `;
        }).join('');
    } catch (e) {
        console.error('Certificates load error:', e);
        grid.innerHTML = `<div class="card p-4 text-center text-rose-500">Error loading certificates: ${e.message}</div>`;
        noMsg.style.display = 'none';
    }
}

window.requestCertificate = async function (type) {
    const studentName = currentStudentData?.name || 'Student';
    const msg = type === 'bonafide'
        ? 'Request Bonafide Certificate for ' + studentName + '? This will be reviewed by the school office.'
        : 'Request SLC/TC for ' + studentName + '? This will be reviewed by the school office.';
    if (await window.showConfirmModal({ title: 'Request Certificate', message: msg, icon: 'fa-certificate', confirmText: 'Submit' })) {
        showToast('Request submitted to school office', 'success');
    }
};

window.downloadCertPDF = function (dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${filename.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

window.viewStudentCertPDF = async function (certId, source) {
    try {
        const doc = source === 'admin'
            ? await schoolDoc('certificates', certId).get()
            : await schoolDoc('studentCertificates', certId).get();
        if (!doc.exists) { showToast('Certificate not found', 'error'); return; }
        const data = doc.data();
        if (data.pdfUrl) {
            window.open(data.pdfUrl, '_blank', 'noopener,noreferrer');
        } else {
            showToast('PDF not available for this certificate', 'info');
        }
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    }
};

// ===================== PDF RECEIPT DOWNLOAD =====================
window.downloadStudentReceiptPDF = async function (paymentId) {
    try {
        setLoading(true);
        const payDoc = await schoolData('feePayments').doc(paymentId).get();
        if (!payDoc.exists) { showToast('Receipt not found', 'error'); return; }
        const p = payDoc.data();

        const schoolSnap = await schoolRef().get();
        const sc = schoolSnap.data() || {};

        if (typeof window.jspdf === 'undefined') {
            showToast('PDF library not loaded. Use Print instead.', 'warning');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        const pageW = doc.internal.pageSize.getWidth();
        const margin = 15;
        let y = 18;

        // School Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(sc.schoolName || 'School Name', pageW / 2, y, { align: 'center' });
        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(sc.address || '', pageW / 2, y, { align: 'center' });
        y += 4;
        doc.text(`Phone: ${sc.phone || '--'} | Email: ${sc.email || '--'}`, pageW / 2, y, { align: 'center' });
        y += 6;

        doc.setLineWidth(0.4);
        doc.line(margin, y, pageW - margin, y);
        y += 7;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.text('FEE RECEIPT', pageW / 2, y, { align: 'center' });
        y += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const student = currentStudentData || {};
        const meta = [
            ['Receipt No:', p.receiptNo || paymentId.substring(0, 8).toUpperCase()],
            ['Date:', p.createdAt ? new Date(p.createdAt.seconds * 1000).toLocaleDateString() : '--'],
            ['Student:', student.name || '--'],
            ['Class:', `${currentStudentClass || ''} ${student.section || ''}`],
            ['Payment Mode:', p.paymentMode || 'Cash'],
        ];
        meta.forEach(([k, v]) => {
            doc.setFont('helvetica', 'bold');
            doc.text(k, margin, y);
            doc.setFont('helvetica', 'normal');
            doc.text(String(v), margin + 35, y);
            y += 6;
        });

        y += 3;
        // Amount table
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Description', margin, y);
        doc.text('Amount', pageW - margin, y, { align: 'right' });
        y += 2;
        doc.setLineWidth(0.2);
        doc.line(margin, y, pageW - margin, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`School Fee Payment (${p.paymentMode})`, margin, y);
        doc.text(`\u20B9${(p.amount || 0).toLocaleString()}`, pageW - margin, y, { align: 'right' });
        y += 2;
        doc.setLineWidth(0.2);
        doc.line(margin, y, pageW - margin, y);
        y += 5;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('TOTAL AMOUNT PAID', margin, y);
        doc.text(`\u20B9${(p.amount || 0).toLocaleString()}`, pageW - margin, y, { align: 'right' });
        y += 8;

        // Amount in words
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const inWords = `Amount in Words: ${numberToWords(p.amount || 0)} Rupees Only`;
        doc.text(inWords, margin, y);
        y += 10;

        // Footer
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150);
        doc.text('This is a computer generated receipt.', pageW / 2, y, { align: 'center' });

        doc.save(`Receipt_${p.receiptNo || paymentId.substring(0, 8)}.pdf`);
        showToast('PDF downloaded successfully', 'success');
    } catch (e) {
        console.error('PDF export error:', e);
        showToast('Failed to generate PDF: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
};

async function switchStudent(studentId) {
    const sess = JSON.parse(localStorage.getItem('student_session') || '{}');
    if (!sess.linkedStudents) return;
    const target = sess.linkedStudents.find((s) => s.id === studentId);
    if (!target) return;
    sess.currentStudentId = studentId;
    sess.studentName = target.name;
    sess.studentClass = target.class;
    sess.name = target.name;
    localStorage.setItem('student_session', JSON.stringify(sess));
    currentStudentID = studentId;
    setLoading(true);
    await fetchStudentData();

    // Refresh all section data for the new child
    await Promise.allSettled([
        fetchHomework(),
        fetchDuesAndReceipts(),
        fetchAttendance(),
        fetchTransport(),
        fetchLibrary(),
        loadExamMaterials(),
        fetchUnifiedReports(),
        typeof loadStudentCertificates === 'function' ? loadStudentCertificates() : Promise.resolve(),
    ]);

    setLoading(false);
    showToast('Switched to ' + target.name, 'success');
}

window.showPortalSection = showPortalSection;
window.toggleSidebar = toggleSidebar;
window.logoutStudent = logoutStudent;
window.printStudentReceipt = printStudentReceipt;
window.closePortalModal = closePortalModal;
window.switchStudent = switchStudent;

/**
 * Redundant - Handled by fetchUnifiedReports
 */
async function fetchManualReports() {
    return fetchUnifiedReports();
}

function downloadReport(base64, filename) {
    const link = document.createElement('a');
    link.href = base64;
    link.download = `${filename.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ===================== CHANGE PASSWORD (Parent) =====================

window.openChangePwdModal = function () {
    const sess = JSON.parse(localStorage.getItem('student_session') || '{}');
    if (sess.role !== 'parent') return;
    document.getElementById('cpUsername').value = sess.username || '';
    document.getElementById('cpOldPassword').value = '';
    document.getElementById('cpNewPassword').value = '';
    document.getElementById('cpConfirmPassword').value = '';
    document.getElementById('cpError').style.display = 'none';
    document.getElementById('cpSubmitBtn').disabled = false;
    document.getElementById('cpSubmitBtn').innerHTML = '<i class="fas fa-save"></i> Update Password';
    document.getElementById('changePwdModal').classList.remove('hidden');
};

window.closeChangePwdModal = function () {
    document.getElementById('changePwdModal').classList.add('hidden');
};

window.submitChangePassword = async function () {
    const username = document.getElementById('cpUsername').value.trim();
    const oldPwd = document.getElementById('cpOldPassword').value;
    const newPwd = document.getElementById('cpNewPassword').value;
    const confirmPwd = document.getElementById('cpConfirmPassword').value;
    const errorEl = document.getElementById('cpError');
    const btn = document.getElementById('cpSubmitBtn');

    errorEl.style.display = 'none';

    if (!oldPwd) { showError('Please enter your current password'); return; }
    if (!newPwd || newPwd.length < 6) { showError('New password must be at least 6 characters'); return; }
    if (newPwd !== confirmPwd) { showError('New passwords do not match'); return; }
    if (newPwd === oldPwd) { showError('New password must be different from current password'); return; }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';

    try {
        const snap = await schoolData('parentUsers').where('username', '==', username).get();
        if (snap.empty) {
            showError('Username not found. Please contact the school office.');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Update Password';
            return;
        }

        let matched = false;
        snap.forEach(d => {
            if (d.data().password === oldPwd) {
                matched = d;
            }
        });

        if (!matched) {
            showError('Current password is incorrect.');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Update Password';
            return;
        }

        await schoolDoc('parentUsers', matched.id).update({
            password: newPwd,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

        showToast('Password updated successfully', 'success');
        closeChangePwdModal();
    } catch (e) {
        console.error('Password change error:', e);
        showError('Failed to update password: ' + e.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Update Password';
    }

    function showError(msg) {
        errorEl.textContent = msg;
        errorEl.style.display = 'block';
    }
};

function payOnlineTotal() {
    const balanceEl = document.getElementById('feeTotalBalance');
    if (!balanceEl) return;
    const balanceText = balanceEl.textContent.replace(/[^0-9]/g, '');
    const balance = parseInt(balanceText, 10) || 0;
    if (balance <= 0) {
        showToast('No outstanding balance to pay', 'info');
        return;
    }
    payOnline('Total', balance * 100, '');
}

async function payOnline(month, amountPaise, year) {
    const studentYear = year || currentStudentData?.academicYear || new Date().getFullYear();
    try {
        const functions = firebase.functions();
        const createOrder = functions.httpsCallable('createRazorpayOrder');
        const result = await createOrder({
            amount: amountPaise,
            currency: 'INR',
            receipt: `fee_${currentStudentID}_${month}_${studentYear}_${Date.now()}`,
            notes: {
                studentId: currentStudentID,
                month: month,
                year: String(studentYear),
                schoolId: localStorage.getItem('schoolId') || ''
            }
        });
        const order = result.data;
        if (!order || !order.id) {
            showToast('Failed to create payment order', 'error');
            return;
        }
        const options = {
            key: order.key_id,
            amount: order.amount,
            currency: order.currency,
            name: 'SNR EDU ERP',
            description: `Fee Payment - ${month} ${studentYear}`,
            order_id: order.id,
            prefill: {
                name: currentStudentData?.studentName || '',
                contact: currentStudentData?.phone || ''
            },
            handler: async function (response) {
                try {
                    const verifyPayment = functions.httpsCallable('verifyRazorpayPayment');
                    const verifyResult = await verifyPayment({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        studentId: currentStudentID,
                        month: month,
                        year: String(studentYear)
                    });
                    if (verifyResult.data.success) {
                        showToast(`Payment of ₹${(amountPaise / 100).toLocaleString()} successful!`, 'success');
                        fetchDuesAndReceipts();
                    } else {
                        showToast('Payment verification failed', 'error');
                    }
                } catch (verifyErr) {
                    console.error('Payment verification error:', verifyErr);
                    showToast('Payment verification failed: ' + verifyErr.message, 'error');
                }
            },
            modal: {
                ondismiss: function () {
                    showToast('Payment cancelled', 'warning');
                }
            }
        };
        const rzp = new Razorpay(options);
        rzp.open();
    } catch (e) {
        console.error('PayOnline error:', e);
        showToast('Failed to initiate payment: ' + e.message, 'error');
    }
}
