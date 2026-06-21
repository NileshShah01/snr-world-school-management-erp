/**
 * Student List Module — Firestore-native pagination
 * Replaces the inline student list in admin-dashboard.js
 */

const SL_PAGE_SIZE = 50;
const slState = {
    items: [],
    selected: new Set(),
    cursors: [],        // Firestore document snapshots for cursor-based pagination
    currentPage: 0,
    hasMore: true,
    classFilter: '',
    searchTerm: '',
    sessionFilter: '',
};

let slInitialized = false;

window.onModuleLoaded_students_student_list = function () {
    if (slInitialized) return;
    slInitialized = true;
    slInit();
};

function slInit() {
    const searchInput = document.getElementById('slSearchInput');
    const classFilter = document.getElementById('slClassFilter');
    const selectAll = document.getElementById('slSelectAll');
    const prevBtn = document.getElementById('slPrevBtn');
    const nextBtn = document.getElementById('slNextBtn');

    if (!document.getElementById('slTableBody')) return;

    // Populate class filter from classes subcollection
    slPopulateClassFilter();

    // Event listeners
    if (searchInput) {
        searchInput.addEventListener('input', slDebounce(function () {
            slState.searchTerm = this.value.trim().toLowerCase();
            slState.currentPage = 0;
            slState.cursors = [];
            slLoadPage();
        }, 300));
    }

    if (classFilter) {
        classFilter.addEventListener('change', function () {
            slState.classFilter = this.value;
            slState.currentPage = 0;
            slState.cursors = [];
            slLoadPage();
        });
    }

    if (selectAll) {
        selectAll.addEventListener('change', function () {
            const cbs = document.querySelectorAll('.sl-student-checkbox');
            cbs.forEach(function (cb) {
                cb.checked = this.checked;
                if (this.checked) slState.selected.add(cb.value);
                else slState.selected.delete(cb.value);
            }, this);
            slUpdateBulkUI();
        });
    }

    // Keyboard shortcut: focus search on Ctrl+K or /
    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName))) {
            e.preventDefault();
            if (searchInput) searchInput.focus();
        }
    });

    slLoadPage();
}

async function slPopulateClassFilter() {
    try {
        const snap = await schoolData('classes').get();
        const sel = document.getElementById('slClassFilter');
        if (!sel) return;
        const current = sel.value;
        sel.innerHTML = '<option value="">All Classes</option>';
        const classes = [];
        snap.forEach(function (d) {
            const c = d.data();
            if (c.name) classes.push(c.name);
        });
        classes.sort(function (a, b) { return a - b || a.localeCompare(b); });
        classes.forEach(function (c) {
            sel.innerHTML += '<option value="' + c.replace(/"/g, '&quot;') + '">Class ' + c + '</option>';
        });
        if (current) sel.value = current;
    } catch (e) {
        console.warn('[SL] Failed to load class filter:', e);
    }
}

async function slLoadPage() {
    const tbody = document.getElementById('slTableBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="27" class="text-center text-muted p-2"><i class="fas fa-spinner fa-spin mr-1"></i> Loading...</td></tr>';

    try {
        let query = schoolData('students');
        query = query.orderBy(firebase.firestore.FieldPath.documentId());

        if (slState.classFilter) {
            query = query.where('class', '==', slState.classFilter);
        }

        query = query.limit(SL_PAGE_SIZE + 1);

        // Apply cursor for pages beyond 0
        if (slState.currentPage > 0 && slState.cursors[slState.currentPage - 1]) {
            query = query.startAfter(slState.cursors[slState.currentPage - 1]);
        }

        const snapshot = await query.get();
        const docs = snapshot.docs;
        slState.hasMore = docs.length > SL_PAGE_SIZE;

        // Store cursor for next page
        if (slState.hasMore && docs.length > 0) {
            slState.cursors[slState.currentPage] = docs[SL_PAGE_SIZE - 1];
        }

        // Take only SL_PAGE_SIZE items
        const pageDocs = docs.slice(0, SL_PAGE_SIZE);
        slState.items = pageDocs.map(function (d) { return { id: d.id, ...d.data() }; });

        // If search term is active, filter client-side on the current page
        let displayItems = slState.items;
        if (slState.searchTerm) {
            displayItems = slState.items.filter(function (s) {
                const name = (s.name || '').toLowerCase();
                const sid = (s.student_id || '').toLowerCase();
                const roll = (s.roll_no || '').toLowerCase();
                const reg = (s.reg_no || '').toLowerCase();
                const phone = (s.phone || s.mobile || '').toLowerCase();
                const father = (s.father_name || '').toLowerCase();
                return name.includes(slState.searchTerm) ||
                    sid.includes(slState.searchTerm) ||
                    roll.includes(slState.searchTerm) ||
                    reg.includes(slState.searchTerm) ||
                    phone.includes(slState.searchTerm) ||
                    father.includes(slState.searchTerm);
            });
            // If no results on current page and hasMore, try next page recursively (search across pages)
            if (displayItems.length === 0 && slState.hasMore) {
                slState.currentPage++;
                return slLoadPage();
            }
        }

        slRenderTable(displayItems);
        slUpdatePageControls();
    } catch (e) {
        console.error('[SL] Load error:', e);
        tbody.innerHTML = '<tr><td colspan="27" class="text-center text-danger p-2">Error loading students: ' + e.message + '</td></tr>';
    }
}

function slRenderTable(items) {
    const tbody = document.getElementById('slTableBody');
    if (!tbody) return;

    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="27" class="text-center text-muted p-4"><i class="fas fa-users text-2xl mb-1 opacity-30 block"></i> No students found. <button class="btn-portal btn-ghost mt-1" onclick="window.showSection(\'addStudent\')">Add your first student</button></td></tr>';
        return;
    }

    tbody.innerHTML = '';
    items.forEach(function (student) {
        const tr = document.createElement('tr');
        tr.innerHTML =
            '<td><input type="checkbox" class="sl-student-checkbox" value="' + student.id + '" onchange="slToggleSelect(\'' + student.id + '\')" ' + (slState.selected.has(student.id) ? 'checked' : '') + '></td>' +
            '<td>' + (escHtml(student.student_id || '-')) + '</td>' +
            '<td>' + (escHtml(student.roll_no || '-')) + '</td>' +
            '<td>' + (escHtml(student.reg_no || '-')) + '</td>' +
            '<td><b>' + (escHtml(student.name || '-')) + '</b></td>' +
            '<td><span class="badge" style="background:#f1f5f9;color:#475569;">' + (escHtml(student.class || '-')) + ' / ' + (escHtml(student.section || '-')) + '</span></td>' +
            '<td>' + (escHtml(student.session || '-')) + '</td>' +
            '<td>' + (escHtml(student.father_name || '-')) + '</td>' +
            '<td>' + (escHtml(student.mother_name || '-')) + '</td>' +
            '<td>' + (escHtml(student.phone || student.mobile || '-')) + '</td>' +
            '<td>' + (escHtml(student.dob || '-')) + '</td>' +
            '<td>' + (escHtml(student.gender || '-')) + '</td>' +
            '<td>' + (escHtml(student.category || '-')) + '</td>' +
            '<td>' + (escHtml(student.caste || '-')) + '</td>' +
            '<td>' + (escHtml(student.religion || '-')) + '</td>' +
            '<td>' + (escHtml(student.aadhar || '-')) + '</td>' +
            '<td>' + (escHtml(student.pen || '-')) + '</td>' +
            '<td>' + (escHtml(student.rfid_no || student.rfid || student.smart_card_no || '-')) + '</td>' +
            '<td>' + (escHtml(student.guardian_name || '-')) + '</td>' +
            '<td>' + (escHtml(student.guardian_phone || '-')) + '</td>' +
            '<td>' + (escHtml(student.address || '-')) + '</td>' +
            '<td>' + (escHtml(student.permanent_address || '-')) + '</td>' +
            '<td>' + (escHtml(student.city || '-')) + '</td>' +
            '<td>' + (escHtml(student.hostel || '-')) + '</td>' +
            '<td>' + (escHtml(student.transport || '-')) + '</td>' +
            '<td>' + (escHtml(student.join_date || '-')) + '</td>' +
            '<td><div style="display:flex;gap:0.5rem;">' +
            '<button class="btn-portal btn-ghost btn-sm" onclick="window.slViewStudent(\'' + student.id + '\')" title="View Profile"><i class="fas fa-eye"></i></button>' +
            '<button class="btn-portal btn-ghost btn-sm" onclick="window.slEditStudent(\'' + student.id + '\')" title="Edit"><i class="fas fa-edit"></i></button>' +
            '<button class="btn-portal btn-ghost btn-sm btn-danger" onclick="window.slDeleteStudent(\'' + student.id + '\')" title="Delete"><i class="fas fa-trash"></i></button>' +
            '</div></td>';
        tbody.appendChild(tr);
    });
}

function slUpdatePageControls() {
    const pageInfo = document.getElementById('slPageInfo');
    const prevBtn = document.getElementById('slPrevBtn');
    const nextBtn = document.getElementById('slNextBtn');
    const totalInfo = document.getElementById('slTotalInfo');

    if (pageInfo) pageInfo.textContent = 'Page ' + (slState.currentPage + 1);
    if (prevBtn) prevBtn.disabled = slState.currentPage === 0;
    if (nextBtn) nextBtn.disabled = !slState.hasMore;
    if (totalInfo) {
        totalInfo.textContent = slState.hasMore ? '(more available)' : '';
    }
}

function slGoToPage(dir) {
    if (dir === 'next' && slState.hasMore) {
        slState.currentPage++;
        slLoadPage();
    } else if (dir === 'prev' && slState.currentPage > 0) {
        slState.currentPage--;
        slLoadPage();
    }
}

function slToggleSelect(id) {
    if (slState.selected.has(id)) slState.selected.delete(id);
    else slState.selected.add(id);
    slUpdateBulkUI();
}

function slUpdateBulkUI() {
    const btn = document.getElementById('slBulkDeleteBtn');
    const count = document.getElementById('slSelectedCount');
    if (btn && count) {
        if (slState.selected.size > 0) {
            btn.classList.remove('hidden');
            count.textContent = slState.selected.size;
        } else {
            btn.classList.add('hidden');
        }
    }
}

async function slHandleBulkDelete() {
    const size = slState.selected.size;
    if (!size) return;
    if (!await window.showConfirmModal({ title: 'Bulk Delete', message: 'Delete ' + size + ' selected students? This cannot be undone.', icon: 'fa-user-slash', confirmText: 'Delete All', danger: true })) return;

    setLoading(true);
    try {
        const batch = db.batch();
        slState.selected.forEach(function (id) { batch.delete(schoolDoc('students', id)); });
        await batch.commit();
        adjustStudentCounter(-slState.selected.size);
        slState.selected.clear();
        slUpdateBulkUI();
        slLoadPage();
        showToast('Deleted ' + size + ' students', 'success');
    } catch (e) {
        showToast('Delete failed: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

async function slDeleteStudent(id) {
    if (!await window.showConfirmModal({ title: 'Delete Student', message: 'Delete this student profile? This cannot be undone.', icon: 'fa-user-minus', confirmText: 'Delete', danger: true })) return;
    setLoading(true);
    try {
        await schoolDoc('students', id).delete();
        adjustStudentCounter(-1);
        slState.selected.delete(id);
        slLoadPage();
        showToast('Student deleted', 'success');
    } catch (e) {
        showToast('Delete failed: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

window.slViewStudent = function (id) {
    window.viewStudent(id);
};

window.slEditStudent = function (id) {
    window.editStudent(id);
};

window.slExportStudentData = function () {
    window.exportToCSV('students');
};

// Debounce helper
function slDebounce(fn, delay) {
    let timer;
    return function () {
        var ctx = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () { fn.apply(ctx, args); }, delay);
    };
}
