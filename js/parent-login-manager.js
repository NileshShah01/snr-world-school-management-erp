// Parent Login Manager — Admin section for creating and managing parent login credentials
let parentLoginSearchType = 'phone';
let parentLoginSearchTimer = null;
let plLinkedStudentsData = []; // {id, name, class, section}

function plRenderLinkedStudents() {
    const container = document.getElementById('plLinkedStudents');
    if (!container) return;
    if (plLinkedStudentsData.length === 0) {
        showEmptyState(container, { icon: 'fa-user-plus', message: 'No students linked. Click Add to link students.' });
        return;
    }
    container.innerHTML = plLinkedStudentsData.map((s) => `
        <div class="flex-between p-0-5 border-bottom ${s.id === plLinkedStudentsData[0].id ? '' : ''}" data-student-id="${s.id}">
            <span class="font-600 text-sm">${s.name} <span class="text-xs text-muted">(${s.class || ''}${s.section ? ' - ' + s.section : ''})</span></span>
            <button onclick="plRemoveStudent('${s.id}')" class="btn-portal btn-sm btn-ghost" style="padding:2px 6px;font-size:0.65rem;color:var(--danger);" title="Remove"><i class="fas fa-times"></i></button>
        </div>
    `).join('');
}

window.plOpenAddStudent = function () {
    document.getElementById('plAddStudentSearch').classList.remove('hidden');
    document.getElementById('plAddStudentInput').value = '';
    document.getElementById('plAddStudentInput').focus();
    document.getElementById('plAddStudentResults').innerHTML = '';
};

window.plRemoveStudent = function (studentId) {
    plLinkedStudentsData = plLinkedStudentsData.filter((s) => s.id !== studentId);
    plRenderLinkedStudents();
};

window.plSearchStudentsToAdd = async function (query) {
    const resultsDiv = document.getElementById('plAddStudentResults');
    if (!resultsDiv) return;
    if (!query || query.length < 2) {
        resultsDiv.innerHTML = '';
        return;
    }
    resultsDiv.innerHTML = '<div class="text-xs text-muted p-0-25"><i class="fas fa-spinner fa-spin"></i></div>';
    try {
        const q = query.toLowerCase();
        const snap = await schoolData('students').limit(20).get();
        const alreadyLinked = new Set(plLinkedStudentsData.map((s) => s.id));
        const matches = [];
        snap.forEach((d) => {
            const s = { id: d.id, ...d.data() };
            if (alreadyLinked.has(d.id)) return;
            const name = (s.name || '').toLowerCase();
            const phone = s.phone || '';
            if (name.includes(q) || phone.includes(q)) {
                matches.push(s);
            }
        });
        if (matches.length === 0) {
            showEmptyState(resultsDiv, { icon: 'fa-search', message: 'No matching students found' });
            return;
        }
        resultsDiv.innerHTML = matches.map((s) => `
            <div class="flex-between p-0-25 border-bottom hover-ligh" style="cursor:pointer;" onclick="plAddStudentFromSearch('${s.id}','${(s.name||'').replace(/'/g,"\\'")}','${s.class||''}','${s.section||''}')">
                <span class="text-sm">${s.name} <span class="text-xs text-muted">(${s.class || ''}${s.section ? ' - ' + s.section : ''})</span></span>
                <i class="fas fa-plus-circle text-xs primary"></i>
            </div>
        `).join('');
    } catch (e) {
        resultsDiv.innerHTML = '<div class="text-xs text-rose-500 p-0-25">Error searching</div>';
    }
};

window.plAddStudentFromSearch = function (id, name, cls, section) {
    if (plLinkedStudentsData.some((s) => s.id === id)) return;
    plLinkedStudentsData.push({ id, name, class: cls, section });
    plRenderLinkedStudents();
    document.getElementById('plAddStudentSearch').classList.add('hidden');
    document.getElementById('plAddStudentResults').innerHTML = '';
};

async function initERPParentLogin() {
    console.log('ERP Parent Login Manager Initialized');

    // Ensure school context is resolved before querying student data
    if (window.schoolBootstrapReady) {
        await window.schoolBootstrapReady;
    }

    const searchTypeRadios = document.querySelectorAll('input[name="parentLoginSearchType"]');
    searchTypeRadios.forEach((r) => {
        r.addEventListener('change', () => {
            parentLoginSearchType = r.value;
            document.getElementById('parentLoginPhoneSearch').style.display = parentLoginSearchType === 'phone' ? 'block' : 'none';
            document.getElementById('parentLoginClassSearch').style.display = parentLoginSearchType === 'class' ? 'block' : 'none';
        });
    });

    const phoneInput = document.getElementById('parentLoginPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', () => {
            clearTimeout(parentLoginSearchTimer);
            parentLoginSearchTimer = setTimeout(searchStudentsForParentLogin, 500);
        });
    }

    document.getElementById('parentLoginClass')?.addEventListener('change', () => {
        loadParentLoginSections();
        if (document.getElementById('parentLoginClass').value) searchStudentsForParentLogin();
    });

    document.getElementById('parentLoginSection')?.addEventListener('change', () => {
        searchStudentsForParentLogin();
    });

    if (typeof initSearchableSelect === 'function' && document.getElementById('parentLoginClass')) {
        initSearchableSelect('parentLoginStudentSelect', window.allStudents || [], (s) => {
            document.getElementById('parentLoginStudentId').value = s.studentId || s.student_id || s.id;
            document.getElementById('parentLoginStudentName').value = s.name;
            openCreateParentLoginModal(s);
        });
    }

    populateParentLoginSessionDropdown();
}

async function populateParentLoginSessionDropdown() {
    const sel = document.getElementById('parentLoginSession');
    if (!sel) return;
    try {
        const snap = await schoolData('sessions').orderBy('name', 'desc').get();
        sel.innerHTML = '<option value="">All Sessions</option>';
        snap.forEach((d) => {
            const s = d.data();
            sel.innerHTML += `<option value="${d.id}">${s.name || d.id}</option>`;
        });
        sel.addEventListener('change', loadParentLoginClasses);
        loadParentLoginClasses();
    } catch (e) {
        console.warn('Failed to load sessions:', e);
    }
}

async function loadParentLoginClasses() {
    const sel = document.getElementById('parentLoginClass');
    if (!sel) return;
    const sessionId = document.getElementById('parentLoginSession')?.value;
    sel.innerHTML = '<option value="">Select Class</option>';
    try {
        const classes = await getDistinctStudentClasses(sessionId);
        classes.forEach((c) => {
            sel.innerHTML += `<option value="${c}">${c}</option>`;
        });
    } catch (e) {
        console.warn('Failed to load classes:', e);
    }
}

async function loadParentLoginSections() {
    const cls = document.getElementById('parentLoginClass')?.value;
    const sectionSel = document.getElementById('parentLoginSection');
    if (!sectionSel) return;
    sectionSel.innerHTML = '<option value="">All Sections</option>';
    if (!cls) return;
    try {
        const sessionId = document.getElementById('parentLoginSession')?.value;
        let classQuery = schoolData('classes').where('name', '==', cls);
        if (sessionId) classQuery = classQuery.where('sessionId', '==', sessionId);
        const classSnap = await classQuery.limit(1).get();
        const sections = [];
        classSnap.forEach((d) => {
            const c = d.data();
            if (c.sections) sections.push(...c.sections);
        });
        Array.from(sections).sort().forEach((sec) => {
            sectionSel.innerHTML += `<option value="${sec}">${sec}</option>`;
        });
    } catch (e) {
        console.warn('Failed to load sections:', e);
    }
}

async function getDistinctStudentClasses(sessionId) {
    const classes = new Set();
    try {
        let query = schoolData('classes');
        if (sessionId) query = query.where('sessionId', '==', sessionId);
        const snap = await query.get();
        snap.forEach((d) => {
            const c = d.data();
            if (c.name) classes.add(c.name);
        });
    } catch (e) {
        console.warn('Failed to fetch student classes:', e);
    }
    return Array.from(classes).sort();
}

async function searchStudentsForParentLogin() {
    const resultsDiv = document.getElementById('parentLoginResults');
    if (!resultsDiv) return;

    if (parentLoginSearchType === 'phone') {
        const phone = document.getElementById('parentLoginPhone')?.value.trim();
        if (!phone || phone.length < 4) {
            resultsDiv.innerHTML = '<div class="p-3 text-center text-muted text-sm">Enter at least 4 digits to search</div>';
            return;
        }
        resultsDiv.innerHTML = '<div class="p-3 text-center"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
        try {
            const snap = await schoolData('students')
                .where('phone', '>=', phone)
                .where('phone', '<=', phone + '\uf8ff')
                .limit(50)
                .get();
            const students = [];
            snap.forEach((d) => students.push({ id: d.id, ...d.data() }));
            renderParentLoginResults(students);
        } catch (e) {
            resultsDiv.innerHTML = `<div class="p-3 text-center text-rose-500">Error: ${e.message}</div>`;
        }
    } else {
        const cls = document.getElementById('parentLoginClass')?.value;
        const section = document.getElementById('parentLoginSection')?.value;
        if (!cls) {
            resultsDiv.innerHTML = '<div class="p-3 text-center text-muted text-sm">Select a class to search</div>';
            return;
        }
        resultsDiv.innerHTML = '<div class="p-3 text-center"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
        try {
            let query = schoolData('students').where('class', '==', cls);
            if (section) query = query.where('section', '==', section);
            const snap = await query.limit(50).get();
            const students = [];
            snap.forEach((d) => students.push({ id: d.id, ...d.data() }));
            renderParentLoginResults(students);
        } catch (e) {
            resultsDiv.innerHTML = `<div class="p-3 text-center text-rose-500">Error: ${e.message}</div>`;
        }
    }
}

async function renderParentLoginResults(students) {
    const resultsDiv = document.getElementById('parentLoginResults');
    if (!resultsDiv) return;

    if (students.length === 0) {
        resultsDiv.innerHTML = '<div class="p-3 text-center text-muted"><i class="fas fa-search text-2xl opacity-20 mb-1"></i><p>No students found</p></div>';
        return;
    }

    // Batch check parent login status for all students
    const studentIds = students.map((s) => s.id);
    const parentLoginMap = {};
    try {
        // Query parentUsers that have any of these student IDs
        // We need separate queries since Firestore 'in' only supports array fields with array-contains-any
        const snap = await schoolData('parentUsers').get();
        snap.forEach((d) => {
            const data = d.data();
            const ids = data.studentIds ? data.studentIds.map((s) => (typeof s === 'string' ? s : s.id)) : (data.studentId ? [data.studentId] : []);
            const match = ids.find((id) => studentIds.includes(id));
            if (match) {
                parentLoginMap[match] = { id: d.id, ...data };
            }
        });
    } catch (e) {
        console.warn('Batch parent login fetch failed:', e);
    }

    const isMobile = window.innerWidth < 768;
    if (isMobile) {
        resultsDiv.innerHTML = students
            .map((s) => {
                const pl = parentLoginMap[s.id];
                const statusBadge = pl
                    ? pl.status === 'active'
                        ? '<span class="badge badge-success">Active</span>'
                        : '<span class="badge badge-warning">Inactive</span>'
                    : '<span class="badge badge-default">None</span>';
                const parentName = pl ? pl.parentName || '-' : '-';
                const childCount = pl && pl.studentIds ? pl.studentIds.length : (pl && pl.studentId ? 1 : 0);
                const displayParent = childCount > 1 ? `${parentName} (${childCount} children)` : parentName;
                const actions = pl
                    ? `<button onclick="openEditParentLoginModal('${pl.id}')" class="btn-portal btn-sm" title="Edit"><i class="fas fa-edit"></i></button>
                       <button onclick="toggleParentLoginStatus('${pl.id}', '${pl.status === 'active' ? 'inactive' : 'active'}')" class="btn-portal btn-sm ${pl.status === 'active' ? 'btn-warning' : 'btn-success'}" title="${pl.status === 'active' ? 'Disable' : 'Enable'}">
                         <i class="fas ${pl.status === 'active' ? 'fa-pause' : 'fa-play'}"></i>
                       </button>`
                    : `<button onclick="openCreateParentLoginModal('${s.id}')" class="btn-portal btn-sm btn-primary"><i class="fas fa-plus"></i> Create</button>`;
                return `
                <div class="card p-1 mb-1">
                    <div class="flex-between mb-0-5">
                        <div>
                            <p class="font-700 text-sm">${s.name || 'Unknown'}</p>
                            <p class="text-xs text-muted">${s.class || ''}${s.section ? ' - ' + s.section : ''} | ${s.phone || '-'}</p>
                            ${pl ? `<p class="text-xs text-muted">${displayParent}</p>` : ''}
                        </div>
                        <div>${statusBadge}</div>
                    </div>
                    <div class="flex gap-0-5 justify-end mt-1 pt-0-5 border-top">${actions}</div>
                </div>`;
            })
            .join('');
    } else {
        let html = `<div class="table-container"><table class="portal-table">
            <thead><tr>
                <th>#</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Phone</th>
                <th>Parent Name</th>
                <th>Login Status</th>
                <th class="text-right">Actions</th>
            </tr></thead><tbody>`;
        students.forEach((s, idx) => {
            const pl = parentLoginMap[s.id];
            const statusBadge = pl
                ? pl.status === 'active'
                    ? '<span class="badge badge-success">Active</span>'
                    : '<span class="badge badge-warning">Inactive</span>'
                : '<span class="badge badge-default">None</span>';
            const parentName = pl ? pl.parentName || '-' : '-';
            const childCount = pl && pl.studentIds ? pl.studentIds.length : (pl && pl.studentId ? 1 : 0);
            const displayParent = childCount > 1 ? `${parentName} (${childCount} children)` : parentName;
            const actions = pl
                ? `<button onclick="openEditParentLoginModal('${pl.id}')" class="btn-portal btn-sm" title="Edit"><i class="fas fa-edit"></i></button>
                   <button onclick="toggleParentLoginStatus('${pl.id}', '${pl.status === 'active' ? 'inactive' : 'active'}')" class="btn-portal btn-sm ${pl.status === 'active' ? 'btn-warning' : 'btn-success'}" title="${pl.status === 'active' ? 'Disable' : 'Enable'}">
                     <i class="fas ${pl.status === 'active' ? 'fa-pause' : 'fa-play'}"></i>
                   </button>
                   <button onclick="confirmDeleteParentLogin('${pl.id}')" class="btn-portal btn-sm btn-danger" title="Delete"><i class="fas fa-trash"></i></button>`
                : `<button onclick="openCreateParentLoginModal('${s.id}')" class="btn-portal btn-sm btn-primary"><i class="fas fa-plus"></i> Create</button>`;
            html += `<tr>
                <td>${idx + 1}</td>
                <td class="font-600">${s.name || 'Unknown'}</td>
                <td>${s.class || ''}${s.section ? ' - ' + s.section : ''}</td>
                <td>${s.phone || '-'}</td>
                <td>${displayParent}</td>
                <td>${statusBadge}</td>
                <td class="text-right whitespace-nowrap">${actions}</td>
            </tr>`;
        });
        html += '</tbody></table></div>';
        resultsDiv.innerHTML = html;
    }
}

window.openCreateParentLoginModal = async function (studentOrId) {
    let student;
    if (typeof studentOrId === 'string') {
        const doc = await schoolDoc('students', studentOrId).get();
        if (!doc.exists) {
            showToast('Student not found', 'error');
            return;
        }
        student = { id: doc.id, ...doc.data() };
    } else {
        student = studentOrId;
    }

    plLinkedStudentsData = [{ id: student.id, name: student.name || '', class: student.class || '', section: student.section || '' }];
    plRenderLinkedStudents();

    document.getElementById('plModalTitle').textContent = `Create Login — ${student.name || 'Student'}`;
    document.getElementById('plParentName').value = student.fatherName || student.parentName || '';
    document.getElementById('plRelation').value = 'Father';
    document.getElementById('plUsername').value = student.phone || '';
    document.getElementById('plPassword').value = '';
    document.getElementById('plStatus').checked = true;
    document.getElementById('plDocId').value = '';
    document.getElementById('plAddStudentSearch').classList.add('hidden');

    document.getElementById('plAllSections').checked = true;
    document.querySelectorAll('.pl-section-checkbox').forEach((cb) => (cb.checked = true));

    document.getElementById('plDeleteBtn').style.display = 'none';
    document.getElementById('plModalOverlay').classList.remove('hidden');
    document.getElementById('plModal').classList.remove('hidden');
};

window.openEditParentLoginModal = async function (docId) {
    try {
        const doc = await schoolDoc('parentUsers', docId).get();
        if (!doc.exists) {
            showToast('Parent login record not found', 'error');
            return;
        }
        const pl = doc.data();

        // Support both old (studentId string) and new (studentIds array) schema
        let linkedStudents = [];
        if (pl.studentIds && Array.isArray(pl.studentIds)) {
            linkedStudents = pl.studentIds.map((s) => (typeof s === 'string' ? { id: s } : s));
        } else if (pl.studentId) {
            linkedStudents = [{ id: pl.studentId }];
        }

        // Fetch student names/classes for display (batched, avoids N+1)
        const idsToFetch = linkedStudents.filter(ls => !ls.name && ls.id).map(ls => ls.id);
        for (let i = 0; i < idsToFetch.length; i += 10) {
            const chunk = idsToFetch.slice(i, i + 10);
            try {
                const sSnap = await schoolData('students').where(firebase.firestore.FieldPath.documentId(), 'in', chunk).get();
                const studentMap = {};
                sSnap.forEach(d => { studentMap[d.id] = d.data(); });
                linkedStudents.forEach(ls => {
                    const s = studentMap[ls.id];
                    if (s) {
                        ls.name = s.name || ls.id;
                        ls.class = s.class || '';
                        ls.section = s.section || '';
                    }
                });
            } catch (e) { console.warn('Failed to batch fetch students:', e); }
        }

        plLinkedStudentsData = linkedStudents;
        plRenderLinkedStudents();

        const displayName = linkedStudents.length ? linkedStudents[0].name : pl.parentName;
        document.getElementById('plModalTitle').textContent = `Edit Login — ${displayName}`;
        document.getElementById('plParentName').value = pl.parentName || '';
        document.getElementById('plRelation').value = pl.relation || 'Father';
        document.getElementById('plUsername').value = pl.username || '';
        document.getElementById('plPassword').value = '';
        document.getElementById('plPassword').placeholder = 'Leave blank to keep current';
        document.getElementById('plStatus').checked = pl.status === 'active';
        document.getElementById('plDocId').value = docId;
        document.getElementById('plAddStudentSearch').classList.add('hidden');

        const sections = pl.allowedSections || [];
        const allCbs = document.querySelectorAll('.pl-section-checkbox');
        if (!sections.length || sections.length === 0) {
            document.getElementById('plAllSections').checked = true;
            allCbs.forEach((cb) => (cb.checked = true));
        } else {
            document.getElementById('plAllSections').checked = false;
            allCbs.forEach((cb) => {
                cb.checked = sections.includes(cb.value);
            });
        }

        document.getElementById('plDeleteBtn').style.display = 'inline-flex';
        document.getElementById('plModalOverlay').classList.remove('hidden');
        document.getElementById('plModal').classList.remove('hidden');
    } catch (e) {
        showToast('Error loading record: ' + e.message, 'error');
    }
};

window.closeParentLoginModal = function () {
    document.getElementById('plModalOverlay').classList.add('hidden');
    document.getElementById('plModal').classList.add('hidden');
};

window.saveParentLogin = async function () {
    const docId = document.getElementById('plDocId').value;
    const parentName = document.getElementById('plParentName').value.trim();
    const relation = document.getElementById('plRelation').value;
    const username = document.getElementById('plUsername').value.trim();
    const password = document.getElementById('plPassword').value.trim();
    const status = document.getElementById('plStatus').checked ? 'active' : 'inactive';

    if (!parentName) { showToast('Please enter parent/guardian name', 'error'); return; }
    if (!username) { showToast('Please enter a username', 'error'); return; }
    if (plLinkedStudentsData.length === 0) { showToast('Please link at least one student', 'error'); return; }
    if (!docId && !password) { showToast('Please enter a password for new login', 'error'); return; }

    const sectionCbs = document.querySelectorAll('.pl-section-checkbox:checked');
    const allowedSections = Array.from(sectionCbs).map((cb) => cb.value);
    const allChecked = document.getElementById('plAllSections').checked;

    const studentIds = plLinkedStudentsData.map((s) => ({
        id: s.id,
        name: s.name || '',
        class: s.class || '',
        section: s.section || '',
    }));

    const data = {
        studentIds,
        parentName,
        relation,
        username,
        status,
        allowedSections: allChecked ? [] : allowedSections,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    if (password) {
        data.passwordHash = await hashPassword(password);
    }

    try {
        if (docId) {
            await schoolDoc('parentUsers', docId).update(data);
            showToast('Parent login updated successfully', 'success');
        } else {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            data.lastLogin = null;
            const docRef = await schoolData('parentUsers').add(data);

            // Create Firebase Auth account for parent (non-blocking)
            if (password && typeof window.createFirebaseUser === 'function') {
                try {
                    const safeUser = username.replace(/[^a-zA-Z0-9._-]/g, '_');
                    const authEmail = `p.${CURRENT_SCHOOL_ID}.${safeUser}@snredu.app`;
                    const authUid = await window.createFirebaseUser(authEmail, password, {
                        role: 'parent',
                        schoolId: CURRENT_SCHOOL_ID,
                    });
                    await docRef.update({
                        authUid: authUid,
                        authEmail: authEmail,
                    });
                    console.log(`[Auth] Firebase Auth user created for parent ${username} (${authEmail})`);
                } catch (authErr) {
                    console.warn('[Auth] Could not create Firebase Auth user:', authErr);
                    showToast('Login created. Note: Firebase Auth account could not be created.', 'warning');
                }
            }
            showToast('Parent login created successfully', 'success');
        }
        closeParentLoginModal();
        searchStudentsForParentLogin();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    }
};

window.toggleParentLoginStatus = async function (docId, newStatus) {
    try {
        await schoolDoc('parentUsers', docId).update({ status: newStatus, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        showToast(`Login ${newStatus === 'active' ? 'enabled' : 'disabled'} successfully`, 'success');
        searchStudentsForParentLogin();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    }
};

window.confirmDeleteParentLogin = async function (docId) {
    if (!await window.showConfirmModal({ title: 'Delete Parent Login', message: 'Are you sure you want to delete this parent login? This action cannot be undone.', icon: 'fa-user-slash', confirmText: 'Delete', danger: true })) return;
    try {
        await schoolDoc('parentUsers', docId).delete();
        showToast('Parent login deleted', 'success');
        searchStudentsForParentLogin();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    }
};

window.generatePassword = function () {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let pwd = '';
    for (let i = 0; i < 8; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('plPassword').value = pwd;
};

window.toggleAllParentLoginSections = function (checked) {
    document.querySelectorAll('.pl-section-checkbox').forEach((cb) => {
        cb.checked = checked;
        cb.disabled = checked;
    });
};

// Initialize section checkboxes when DOM is ready
(function initParentLoginCheckboxes() {
    const cbs = document.querySelectorAll('.pl-section-checkbox');
    if (cbs.length > 0) {
        cbs.forEach((cb) => {
            cb.addEventListener('change', () => {
                const all = document.querySelectorAll('.pl-section-checkbox');
                const anyUnchecked = Array.from(all).some((c) => !c.checked);
                document.getElementById('plAllSections').checked = !anyUnchecked;
            });
        });
    }
})();

window.initERPParentLogin = initERPParentLogin;
window.searchStudentsForParentLogin = searchStudentsForParentLogin;
window.toggleAllParentLoginSections = toggleAllParentLoginSections;
