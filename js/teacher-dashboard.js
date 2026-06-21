var TEACHER_PERMISSIONS = {};
var TEACHER_PROFILE = null;
var TEACHER_DESIGNATION = null;

document.addEventListener('DOMContentLoaded', async () => {
    if (window.schoolBootstrapReady) {
        await window.schoolBootstrapReady;
    }

    const session = await window.AuthGuard?.requireAuth({ role: ['teacher', 'admin', 'super_admin'] });
    if (!session) return;

    // Check isActive
    const userSnap = await db.collection('users').doc(session.user.uid).get();
    const userData = userSnap.exists ? userSnap.data() : {};
    if (userData.isActive === false) {
        document.getElementById('loadingPortalText').textContent = 'Account deactivated. Contact your school admin.';
        document.getElementById('loadingOverlay').classList.remove('hidden');
        document.getElementById('loadingOverlay').style.display = 'flex';
        return;
    }

    try {
        // Load teacher profile
        const staffId = userData.staffId || sessionStorage.getItem('STAFF_ID');
        if (staffId) {
            const staffSnap = await schoolData('staff').doc(staffId).get();
            if (staffSnap.exists) {
                TEACHER_PROFILE = staffSnap.data();
                TEACHER_PROFILE.id = staffId;
            }
        }

        // Load designation permissions
        const desigId = userData.designationId || sessionStorage.getItem('DESIGNATION_ID');
        if (desigId && window.DesignationManager) {
            const desig = await DesignationManager.get(desigId);
            if (desig) {
                TEACHER_DESIGNATION = desig;
                TEACHER_PERMISSIONS = desig.permissions || {};
            }
        }

        // Populate UI
        document.getElementById('teacherName').textContent = TEACHER_PROFILE?.name || session.user.email || 'Teacher';
        document.getElementById('teacherEmail').textContent = session.user.email;
        if (TEACHER_DESIGNATION) {
            document.getElementById('teacherDesignation').textContent = TEACHER_DESIGNATION.name;
        }

        // Render sidebar based on permissions
        renderSidebar();

        // Show default section
        const initialSection = window.location.hash.replace('#', '') || 'dashboard';
        setTimeout(() => showTeacherSection(initialSection), 100);

    } catch (e) {
        console.error('[Teacher] Init failed:', e);
    } finally {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.style.display = 'none';
        }
    }
});

function renderSidebar() {
    const container = document.getElementById('teacherSidebarNav');
    if (!container) return;

    const perm = TEACHER_PERMISSIONS;

    const items = [
        { id: 'dashboard', icon: 'fa-th-large', label: 'Dashboard', always: true },
        { id: 'attendance', icon: 'fa-calendar-check', label: 'Attendance', key: 'attendance' },
        { id: 'students', icon: 'fa-users', label: 'Students', key: 'studentManagement' },
        { id: 'academic', icon: 'fa-file-alt', label: 'Academic', key: 'examManagement' },
        { id: 'homework', icon: 'fa-book-reader', label: 'Homework', key: 'homeworkAssignment' },
        { id: 'timetable', icon: 'fa-clock', label: 'Timetable', key: 'timetableView' },
        { id: 'notices', icon: 'fa-bullhorn', label: 'Notices', key: 'noticesAccess' },
        { id: 'library', icon: 'fa-book-open', label: 'Library', key: 'libraryManagement' },
        { id: 'transport', icon: 'fa-bus', label: 'Transport', key: 'transportManagement' },
        { id: 'fees', icon: 'fa-indian-rupee-sign', label: 'Fees', key: 'feeManagement' },
        { id: 'communication', icon: 'fa-comments', label: 'Communication', key: 'communication' },
        { id: 'profile', icon: 'fa-user-circle', label: 'My Profile', always: true },
    ];

    var html = '';
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.always || perm[item.key] === true) {
            html += '<a href="#' + item.id + '" class="nav-link" onclick="showTeacherSection(\'' + item.id + '\')">';
            html += '<i class="fas ' + item.icon + '"></i> <span>' + item.label + '</span>';
            html += '</a>';
        }
    }

    container.innerHTML = html;

    // Mark first as active
    const firstLink = container.querySelector('.nav-link');
    if (firstLink) firstLink.classList.add('active');
}

window.showTeacherSection = function (sectionId) {
    if (!sectionId) sectionId = 'dashboard';
    window.location.hash = sectionId;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Hide all sections
    document.querySelectorAll('.teacher-section').forEach(s => {
        s.style.display = 'none';
        s.classList.add('hidden');
        s.classList.remove('active');
    });

    // Show target
    const target = document.getElementById(sectionId + 'Section');
    if (target) {
        target.style.display = 'block';
        target.classList.remove('hidden');
        target.classList.add('active');
    }

    // Update nav active state
    document.querySelectorAll('#teacherSidebarNav .nav-link').forEach(a => a.classList.remove('active'));
    const matched = document.querySelector('#teacherSidebarNav a[href="#' + sectionId + '"]');
    if (matched) matched.classList.add('active');

    // Update header
    const sectionNames = {
        dashboard: 'Dashboard', attendance: 'Attendance', students: 'Students',
        academic: 'Academic', homework: 'Homework', timetable: 'Timetable',
        notices: 'Notices', library: 'Library', transport: 'Transport',
        fees: 'Fees', profile: 'My Profile', communication: 'Communication'
    };
    const h1 = document.getElementById('teacherSectionTitle');
    if (h1) h1.textContent = sectionNames[sectionId] || sectionId;

    // Lazy load section content
    if (sectionId === 'profile') loadTeacherProfile();
};

// Profile dropdown toggle
function toggleTeacherProfileDropdown() {
    const dropdown = document.getElementById('teacherProfileDropdown');
    if (!dropdown) return;
    dropdown.classList.toggle('hidden');
}

// Close dropdown on outside click
document.addEventListener('click', function (e) {
    const dropdown = document.getElementById('teacherProfileDropdown');
    const trigger = document.getElementById('teacherProfileTrigger');
    if (dropdown && !dropdown.classList.contains('hidden')) {
        if (trigger && !trigger.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    }
});

// Profile section
async function loadTeacherProfile() {
    const container = document.getElementById('teacherProfileContent');
    if (!container) return;
    if (container.dataset.loaded === 'true') return;

    var p = TEACHER_PROFILE;
    if (!p) {
        container.innerHTML = '<p class="text-muted py-3">Profile data not available.</p>';
        return;
    }

    var photoHtml = p.photo
        ? '<img src="' + escHtml(p.photo) + '" alt="Photo" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid var(--primary,#3b82f6);">'
        : '<div style="width:100px;height:100px;border-radius:50%;background:var(--bg-card,#1e293b);display:flex;align-items:center;justify-content:center;font-size:2.5rem;color:var(--primary,#3b82f6);border:3px solid var(--primary,#3b82f6);"><i class="fas fa-user"></i></div>';

    container.innerHTML = '' +
        '<div style="display:flex;gap:2rem;align-items:start;flex-wrap:wrap;">' +
        '  <div style="text-align:center;">' + photoHtml + '</div>' +
        '  <div style="flex:1;min-width:250px;">' +
        '    <table class="portal-table" style="width:100%;">' +
        '      <tr><td style="font-weight:600;padding:0.5rem 0.75rem;width:140px;">Name</td><td style="padding:0.5rem 0.75rem;">' + escHtml(p.name || '-') + '</td></tr>' +
        '      <tr><td style="font-weight:600;padding:0.5rem 0.75rem;">Staff ID</td><td style="padding:0.5rem 0.75rem;">' + escHtml(p.staffId || p.id || '-') + '</td></tr>' +
        '      <tr><td style="font-weight:600;padding:0.5rem 0.75rem;">Designation</td><td style="padding:0.5rem 0.75rem;">' + escHtml(TEACHER_DESIGNATION?.name || p.designation || '-') + '</td></tr>' +
        '      <tr><td style="font-weight:600;padding:0.5rem 0.75rem;">Email</td><td style="padding:0.5rem 0.75rem;">' + escHtml(p.email || '-') + '</td></tr>' +
        '      <tr><td style="font-weight:600;padding:0.5rem 0.75rem;">Phone</td><td style="padding:0.5rem 0.75rem;">' + escHtml(p.phone || '-') + '</td></tr>' +
        '      <tr><td style="font-weight:600;padding:0.5rem 0.75rem;">Department</td><td style="padding:0.5rem 0.75rem;">' + escHtml(p.department || '-') + '</td></tr>' +
        '      <tr><td style="font-weight:600;padding:0.5rem 0.75rem;">Qualification</td><td style="padding:0.5rem 0.75rem;">' + escHtml(p.qualification || '-') + '</td></tr>' +
        '      <tr><td style="font-weight:600;padding:0.5rem 0.75rem;">Date of Joining</td><td style="padding:0.5rem 0.75rem;">' + escHtml(p.dateOfJoining || p.doj || '-') + '</td></tr>' +
        '    </table>' +
        '  </div>' +
        '</div>' +
        '<p class="text-xs text-muted mt-2"><i class="fas fa-info-circle"></i> Profile is read-only. Contact admin for changes.</p>';

    container.dataset.loaded = 'true';
}

async function loadTeacherStudents() {
    const classVal = document.getElementById('teacherStudentClassFilter')?.value;
    const sectionVal = document.getElementById('teacherStudentSectionFilter')?.value;
    const tbody = document.getElementById('teacherStudentListBody');
    if (!classVal || !sectionVal || !tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">Loading...</td></tr>';
    try {
        let q = schoolData('students').where('class', '==', classVal).where('section', '==', sectionVal);
        const snap = await q.get();
        if (snap.empty) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No students found.</td></tr>';
            return;
        }
        tbody.innerHTML = '';
        snap.forEach(doc => {
            const s = doc.data();
            tbody.innerHTML += '<tr>' +
                '<td>' + escHtml(s.student_id || '-') + '</td>' +
                '<td>' + escHtml(s.name || '-') + '</td>' +
                '<td>' + escHtml(s.class || '-') + '</td>' +
                '<td>' + escHtml(s.section || '-') + '</td>' +
                '<td>' + escHtml(s.roll_no || s.rollNo || '-') + '</td>' +
                '</tr>';
        });
    } catch (e) {
        console.error('loadTeacherStudents error:', e);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-3">Error loading students.</td></tr>';
    }
}

function logoutTeacher() {
    if (window.AuthGuard) {
        AuthGuard.signOutAndRedirect('/portal/admin-login.html');
    } else {
        sessionStorage.clear();
        firebase.auth().signOut().then(() => {
            window.location.href = '/portal/admin-login.html';
        });
    }
}

function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Export
window.toggleTeacherProfileDropdown = toggleTeacherProfileDropdown;
window.loadTeacherProfile = loadTeacherProfile;
window.logoutTeacher = logoutTeacher;
window.loadTeacherStudents = loadTeacherStudents;
window.showTeacherSection = window.showTeacherSection;
