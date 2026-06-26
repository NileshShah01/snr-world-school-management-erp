/**
 * Student List Module — New UI with avatars, action menus, drawer, KPIs
 */

const SL_PAGE_SIZE = 50;
const slState = {
    items: [],
    selected: new Set(),
    cursors: [],
    currentPage: 0,
    hasMore: true,
    classFilter: '',
    sectionFilter: '',
    searchTerm: '',
    sessionFilter: '',
    chipFilter: 'all',
    totalCount: 0,
};

var slInitialized = false;
var _slKpiData = null;

window.onModuleLoaded_students_student_list = function () {
    if (slInitialized) return;
    slInitialized = true;
    slInit();
};

function slInit() {
    var searchInput = document.getElementById('slSearchInput');
    var classFilter = document.getElementById('slClassFilter');
    var sectionFilter = document.getElementById('slSectionFilter');
    var selectAll = document.getElementById('slSelectAll');
    var prevBtn = document.getElementById('slPrevBtn');
    var nextBtn = document.getElementById('slNextBtn');
    var pageSize = document.getElementById('slPageSize');

    if (!document.getElementById('slTableBody')) return;

    slPopulateClassFilter();
    slLoadKPIs();

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

    if (sectionFilter) {
        sectionFilter.addEventListener('change', function () {
            slState.sectionFilter = this.value;
            slState.currentPage = 0;
            slState.cursors = [];
            slLoadPage();
        });
    }

    if (selectAll) {
        selectAll.addEventListener('change', function () {
            var cbs = document.querySelectorAll('.sl-student-checkbox');
            cbs.forEach(function (cb) {
                cb.checked = this.checked;
                if (this.checked) slState.selected.add(cb.value);
                else slState.selected.delete(cb.value);
            }, this);
            slUpdateBulkUI();
        });
    }

    if (pageSize) {
        pageSize.addEventListener('change', function () {
            slState.currentPage = 0;
            slState.cursors = [];
            slLoadPage();
        });
    }

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
        var snap = await schoolData('classes').get();
        var sel = document.getElementById('slClassFilter');
        if (!sel) return;
        sel.innerHTML = '<option value="">All Classes</option>';
        var classes = [];
        snap.forEach(function (d) {
            var c = d.data();
            if (c.name) classes.push(c.name);
        });
        classes.sort(function (a, b) { return a - b || a.localeCompare(b); });
        classes.forEach(function (c) {
            sel.innerHTML += '<option value="' + c.replace(/"/g, '&quot;') + '">Class ' + c + '</option>';
        });
    } catch (e) {
        console.warn('[SL] Failed to load class filter:', e);
    }
}

async function slLoadKPIs() {
    try {
        var allSnap = await schoolData('students').get();
        var total = allSnap.size;
        var now = new Date();
        var thisMonth = allSnap.docs.filter(function(d) {
            var c = d.data().createdAt;
            if (!c) return false;
            var t = c.toDate ? c.toDate() : new Date(c);
            return t.getMonth() === now.getMonth() && t.getFullYear() === now.getFullYear();
        }).length;

        document.getElementById('slKpiTotal').textContent = total;
        document.getElementById('slKpiNewCount').textContent = thisMonth;
        document.getElementById('slKpiNew').textContent = '\u2191 ' + thisMonth + ' this month';
        slState.totalCount = total;
    } catch (e) {
        console.warn('[SL] KPI load error:', e);
    }
}

async function slLoadPage() {
    var tbody = document.getElementById('slTableBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="8" class="text-center p-2 text-muted"><i class="fas fa-spinner fa-spin mr-1"></i> Loading...</td></tr>';

    try {
        var query = schoolData('students');
        query = query.orderBy(firebase.firestore.FieldPath.documentId());

        if (slState.classFilter) {
            query = query.where('class', '==', slState.classFilter);
        }

        var size = parseInt(document.getElementById('slPageSize')?.value || '50', 10);
        query = query.limit(size + 1);

        if (slState.currentPage > 0 && slState.cursors[slState.currentPage - 1]) {
            query = query.startAfter(slState.cursors[slState.currentPage - 1]);
        }

        var snapshot = await query.get();
        var docs = snapshot.docs;
        slState.hasMore = docs.length > size;

        if (slState.hasMore && docs.length > 0) {
            slState.cursors[slState.currentPage] = docs[size - 1];
        }

        var pageDocs = docs.slice(0, size);
        slState.items = pageDocs.map(function (d) { return { id: d.id, ...d.data() }; });

        var displayItems = slState.items;
        if (slState.searchTerm) {
            displayItems = slState.items.filter(function (s) {
                var name = (s.name || '').toLowerCase();
                var sid = (s.studentCode || s.student_id || '').toLowerCase();
                var roll = (s.rollNumber || s.roll_no || '').toLowerCase();
                var reg = (s.registrationNumber || s.reg_no || '').toLowerCase();
                var phone = (s.phone || s.mobile || s.fatherPhone || '').toLowerCase();
                var father = (s.fatherName || s.father_name || '').toLowerCase();
                return name.includes(slState.searchTerm) ||
                    sid.includes(slState.searchTerm) ||
                    roll.includes(slState.searchTerm) ||
                    reg.includes(slState.searchTerm) ||
                    phone.includes(slState.searchTerm) ||
                    father.includes(slState.searchTerm);
            });
            if (displayItems.length === 0 && slState.hasMore) {
                slState.currentPage++;
                return slLoadPage();
            }
        }

        if (slState.chipFilter === 'boys') {
            displayItems = displayItems.filter(function(s) { return (s.gender || '').toLowerCase() === 'male'; });
        } else if (slState.chipFilter === 'girls') {
            displayItems = displayItems.filter(function(s) { return (s.gender || '').toLowerCase() === 'female'; });
        } else if (slState.chipFilter === 'hostel') {
            displayItems = displayItems.filter(function(s) { return s.hostel && s.hostel !== 'No' && s.hostel !== ''; });
        } else if (slState.chipFilter === 'transport') {
            displayItems = displayItems.filter(function(s) { return s.transportRoute && s.transportRoute !== ''; });
        }

        slRenderTable(displayItems);
        slUpdatePageControls();
    } catch (e) {
        console.error('[SL] Load error:', e);
        tbody.innerHTML = '<tr><td colspan="8" class="text-center p-2 text-danger">Error: ' + escHtml(e.message) + '</td></tr>';
    }
}

function slRenderTable(items) {
    var tbody = document.getElementById('slTableBody');
    if (!tbody) return;

    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center p-4 text-muted"><i class="fas fa-users text-2xl mb-1 opacity-30 block"></i> No students found.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    items.forEach(function (s) {
        var initial = (s.name || '?')[0].toUpperCase();
        var colors = ['linear-gradient(135deg,#3b82f6,#7c3aed)','linear-gradient(135deg,#ec4899,#f97316)','linear-gradient(135deg,#10b981,#06b6d4)','linear-gradient(135deg,#f59e0b,#ef4444)'];
        var bg = colors[(s.name || 'A').charCodeAt(0) % colors.length];

        var attPct = s.attendancePercent || 0;
        var attColor = attPct >= 75 ? 'var(--green)' : attPct >= 60 ? 'var(--amber)' : 'var(--red)';

        var balance = (s.feeBalance || 0);
        var feeStatus = balance <= 0 ? 'paid' : (s.partialPaid ? 'partial' : 'due');
        var feeLabel = { paid:'Paid', partial:'Partial', due:'Overdue' }[feeStatus];

        var tr = document.createElement('tr');
        tr.id = 'srow_' + s.id;
        tr.innerHTML =
            '<td><input type="checkbox" class="sl-student-checkbox" value="' + s.id + '" onchange="slToggleSelect(\'' + s.id + '\')" ' + (slState.selected.has(s.id) ? 'checked' : '') + ' style="width:15px;height:15px;accent-color:var(--blue);cursor:pointer"></td>' +
            '<td><div class="avatar-cell"><div class="avatar-sm" style="background:' + bg + '">' + initial + '</div><div><div class="cell-name">' + escHtml(s.name || '—') + '</div>' +
            '<div class="cell-meta">' + (s.fatherName || s.father_name ? 'Father: ' + escHtml(s.fatherName || s.father_name) : '') + '</div>' +
            '<div class="cell-mono">#' + escHtml(s.studentCode || s.student_id || s.id.slice(-4)) + '</div></div></div></td>' +
            '<td><span style="font-weight:600">' + escHtml(s.class || '—') + ' ' + (s.section ? '— ' + s.section : '') + '</span><div class="cell-meta">Roll: ' + escHtml(s.rollNumber || s.roll_no || '—') + '</div></td>' +
            '<td><div style="font-size:.82rem">' + escHtml(s.phone || s.mobile || s.fatherPhone || '—') + '</div></td>' +
            '<td><div style="display:flex;align-items:center;gap:.5rem"><div style="flex:1;height:6px;background:var(--bg);border-radius:20px;overflow:hidden;min-width:50px"><div style="height:100%;width:' + attPct + '%;background:' + attColor + ';border-radius:20px"></div></div><span style="font-size:.75rem;font-weight:700;color:' + attColor + '">' + attPct + '%</span></div></td>' +
            '<td><span class="pill pill-' + feeStatus + '">' + feeLabel + '</span></td>' +
            '<td style="font-weight:700;color:' + (balance > 0 ? 'var(--red)' : 'var(--green)') + '">' + (balance > 0 ? '\u20B9' + balance.toLocaleString('en-IN') : '\u20B90') + '</td>' +
            '<td><div style="position:relative">' +
            '<button onclick="slToggleMenu(\'rm_' + s.id + '\')" style="width:30px;height:30px;border-radius:50%;border:none;background:transparent;cursor:pointer;color:var(--ghost);display:flex;align-items:center;justify-content:center;transition:all .15s" onmouseover="this.style.background=\'var(--bg)\'" onmouseout="this.style.background=\'transparent\'"><i class="fas fa-ellipsis-v"></i></button>' +
            '<div id="rm_' + s.id + '" style="display:none;position:absolute;right:0;top:110%;background:white;border-radius:14px;box-shadow:var(--sh-lg);border:1px solid var(--border);min-width:180px;z-index:50;overflow:hidden">' +
            '<div onclick="slOpenDrawer(\'' + s.id + '\')" style="display:flex;align-items:center;gap:.65rem;padding:.65rem 1rem;font-size:.83rem;cursor:pointer;color:var(--ink-3)" onmouseover="this.style.background=\'var(--bg)\'" onmouseout="this.style.background=\'\'"><i class="fas fa-eye" style="width:16px;color:var(--muted)"></i> View Profile</div>' +
            '<div onclick="window.feeSelectStudent ? (feeSelectStudent(\'' + s.id + '\'),window.showSection(\'classFeePayment\')) : window.showSection(\'searchStudentFeeSection\')" style="display:flex;align-items:center;gap:.65rem;padding:.65rem 1rem;font-size:.83rem;cursor:pointer;color:var(--ink-3)" onmouseover="this.style.background=\'var(--bg)\'" onmouseout="this.style.background=\'\'"><i class="fas fa-rupee-sign" style="width:16px;color:var(--muted)"></i> Collect Fee</div>' +
            '<div onclick="window.showSection(\'addStudent\')" style="display:flex;align-items:center;gap:.65rem;padding:.65rem 1rem;font-size:.83rem;cursor:pointer;color:var(--ink-3)" onmouseover="this.style.background=\'var(--bg)\'" onmouseout="this.style.background=\'\'"><i class="fas fa-edit" style="width:16px;color:var(--muted)"></i> Edit Details</div>' +
            '<div onclick="slSendSMS(\'' + (s.fatherPhone || s.phone || '') + '\',\'' + (s.name || '') + '\')" style="display:flex;align-items:center;gap:.65rem;padding:.65rem 1rem;font-size:.83rem;cursor:pointer;color:var(--ink-3)" onmouseover="this.style.background=\'var(--bg)\'" onmouseout="this.style.background=\'\'"><i class="fas fa-sms" style="width:16px;color:var(--muted)"></i> Send SMS</div>' +
            '<hr style="border:none;border-top:1px solid var(--border);margin:0">' +
            '<div onclick="slDeleteStudent(\'' + s.id + '\')" style="display:flex;align-items:center;gap:.65rem;padding:.65rem 1rem;font-size:.83rem;cursor:pointer;color:var(--red)" onmouseover="this.style.background=\'var(--red-lt)\'" onmouseout="this.style.background=\'\'"><i class="fas fa-trash" style="width:16px;color:var(--red)"></i> Remove Student</div>' +
            '</div></div></td>';
        tbody.appendChild(tr);
    });
}

function slUpdatePageControls() {
    var start = slState.currentPage * slState.items.length + 1;
    var end = start + slState.items.length - 1;
    var pInfoStart = document.getElementById('slPageInfoStart');
    var pInfoEnd = document.getElementById('slPageInfoEnd');
    var pInfoTotal = document.getElementById('slPageInfoTotal');
    var pageNum = document.getElementById('slPageNum');
    var prevBtn = document.getElementById('slPrevBtn');
    var nextBtn = document.getElementById('slNextBtn');

    if (pInfoStart) pInfoStart.textContent = slState.items.length ? start : 0;
    if (pInfoEnd) pInfoEnd.textContent = end;
    if (pInfoTotal) pInfoTotal.textContent = slState.totalCount || '—';
    if (pageNum) pageNum.textContent = 'Page ' + (slState.currentPage + 1);
    if (prevBtn) prevBtn.disabled = slState.currentPage === 0;
    if (nextBtn) nextBtn.disabled = !slState.hasMore;
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

function slToggleAll(cb) {
    document.querySelectorAll('.sl-student-checkbox').forEach(function(c) {
        c.checked = cb.checked;
        if (cb.checked) slState.selected.add(c.value);
        else slState.selected.delete(c.value);
    });
    slUpdateBulkUI();
}

function slUpdateBulkUI() {
    var bulk = document.getElementById('slBulkActions');
    var count = document.getElementById('slSelectedCount');
    if (bulk && count) {
        if (slState.selected.size > 0) {
            bulk.classList.add('visible');
            count.textContent = slState.selected.size + ' selected';
        } else {
            bulk.classList.remove('visible');
        }
    }
}

// ── ACTION MENUS ──
window.slToggleMenu = function(id) {
    document.querySelectorAll('[id^="rm_"]').forEach(function(m) { if (m.id !== id) m.style.display = 'none'; });
    var el = document.getElementById(id);
    if (el) el.style.display = el.style.display === 'block' ? 'none' : 'block';
};
document.addEventListener('click', function(e) {
    if (!e.target.closest('[id^="rm_"]') && !e.target.closest('button[onclick*="slToggleMenu"]')) {
        document.querySelectorAll('[id^="rm_"]').forEach(function(m) { m.style.display = 'none'; });
    }
});

// ── DRAWER ──
window.slOpenDrawer = async function(studentId) {
    var drawer = document.getElementById('slStudentDrawer');
    var overlay = document.getElementById('slDrawerOverlay');
    if (!drawer || !overlay) return;
    drawer.classList.add('open');
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
    document.getElementById('slDrawerBody').innerHTML = '<div style="padding:3rem;text-align:center;color:#94a3b8"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';

    try {
        var doc = await schoolData('students').doc(studentId).get();
        if (!doc.exists) {
            document.getElementById('slDrawerBody').innerHTML = '<div style="padding:2rem;text-align:center;color:var(--red)">Student not found</div>';
            return;
        }
        var s = { id: doc.id, ...doc.data() };
        var initial = (s.name || '?')[0].toUpperCase();

        document.getElementById('slDrawerBody').innerHTML =
          '<div style="display:flex;align-items:center;gap:1rem;padding:1.25rem;background:linear-gradient(135deg,var(--blue-lt),#f0f9ff);border-radius:var(--r-lg);border:1.5px solid var(--blue-md);margin-bottom:1.25rem">' +
          '<div style="width:56px;height:56px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.3rem;color:white;background:linear-gradient(135deg,#1e40af,#7c3aed);box-shadow:0 4px 12px rgba(30,64,175,.3)">' + initial + '</div>' +
          '<div><div style="font-size:1.05rem;font-weight:800;color:var(--ink)">' + escHtml(s.name || '—') + '</div>' +
          '<div style="font-size:.78rem;color:var(--muted)">' + (s.class || '') + ' ' + (s.section ? '— ' + s.section : '') + ' · Roll: ' + (s.rollNumber || s.roll_no || '—') + ' · Reg: ' + (s.studentCode || s.student_id || s.id.slice(-4)) + '</div>' +
          '<div style="display:flex;gap:.35rem;margin-top:.4rem;flex-wrap:wrap">' +
          '<span class="pill pill-active">Active</span>' +
          (s.hostel && s.hostel !== 'No' && s.hostel !== '' ? '<span class="pill pill-info">' + escHtml(s.hostel) + '</span>' : '') +
          (s.transportRoute ? '<span class="pill pill-info">' + escHtml(s.transportRoute) + '</span>' : '') +
          '</div></div></div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-bottom:1rem">' +
          [['DOB', s.dob ? new Date(s.dob).toLocaleDateString('en-IN') : '—'],
           ['Gender', s.gender || '—'],
           ['Blood Group', s.bloodGroup || '—'],
           ['Category', s.category || '—'],
           ['Father', s.fatherName || s.father_name || '—'],
           ['Father Phone', s.fatherPhone || s.phone || s.mobile || '—'],
           ['Mother', s.motherName || s.mother_name || '—'],
           ['Mother Phone', s.motherPhone || '—'],
          ].map(function(a) {
            return '<div style="background:var(--bg);border-radius:var(--r-md);padding:.65rem .875rem"><div style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--faint)">' + a[0] + '</div><div style="font-size:.85rem;font-weight:600;color:var(--ink-2);margin-top:2px">' + escHtml(a[1]) + '</div></div>';
          }).join('') +
          '<div style="grid-column:1/-1;background:var(--bg);border-radius:var(--r-md);padding:.65rem .875rem"><div style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--faint)">Address</div><div style="font-size:.85rem;font-weight:600;color:var(--ink-2);margin-top:2px">' + escHtml(s.address || '—') + '</div></div>' +
          '</div>';

        document.getElementById('slDrawerFeeBtn').onclick = function() { slCloseDrawer(); window.showSection('classFeePayment'); };
        document.getElementById('slDrawerEditBtn').onclick = function() { slCloseDrawer(); window.showSection('addStudent'); };
        document.getElementById('slDrawerIdBtn').onclick = function() { slCloseDrawer(); window.generateStudentIdCard ? generateStudentIdCard(studentId) : showToast('ID card function not available', 'info'); };
        document.getElementById('slDrawerSmsBtn').onclick = function() { slSendSMS(s.fatherPhone || s.phone, s.name); };
    } catch (e) {
        document.getElementById('slDrawerBody').innerHTML = '<div style="padding:2rem;text-align:center;color:var(--red)">Error: ' + escHtml(e.message) + '</div>';
    }
};

window.slCloseDrawer = function() {
    var drawer = document.getElementById('slStudentDrawer');
    var overlay = document.getElementById('slDrawerOverlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
};

// ── CHIP / KPI FILTER ──
function slSetChip(el, type) {
    document.querySelectorAll('.chip').forEach(function(c) { c.classList.remove('active'); });
    el.classList.add('active');
    slState.chipFilter = type;
}

function slFilterKPI(type) {
    document.querySelectorAll('.kpi').forEach(function(k) { k.classList.remove('active'); });
    event.currentTarget.classList.add('active');
}

// ── VIEW TOGGLE ──
function slSetView(v) {
    var tblView = document.getElementById('slTableView');
    var cardView = document.getElementById('slCardView');
    var tblBtn = document.getElementById('slTblViewBtn');
    var cardBtn = document.getElementById('slCardViewBtn');
    if (tblView) tblView.style.display = v === 'table' ? 'block' : 'none';
    if (cardView) cardView.style.display = v === 'card' ? 'grid' : 'none';
    if (tblBtn) tblBtn.classList.toggle('active', v === 'table');
    if (cardBtn) cardBtn.classList.toggle('active', v === 'card');
}

// ── BULK ACTIONS ──
function slBulkSMS() {
    showToast('Bulk SMS — wire to your SMS API', 'info');
}

function slBulkPromote() {
    window.showSection('promotions');
}

async function slHandleBulkDelete() {
    var size = slState.selected.size;
    if (!size) return;
    if (!await window.showConfirmModal({ title: 'Bulk Delete', message: 'Delete ' + size + ' selected students? This cannot be undone.', icon: 'fa-user-slash', confirmText: 'Delete All', danger: true })) return;
    setLoading(true);
    try {
        var batch = db.batch();
        slState.selected.forEach(function (id) { batch.delete(schoolDoc('students', id)); });
        await batch.commit();
        if (window.adjustStudentCounter) adjustStudentCounter(-slState.selected.size);
        slState.selected.clear();
        slUpdateBulkUI();
        slLoadPage();
        slLoadKPIs();
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
        if (window.adjustStudentCounter) adjustStudentCounter(-1);
        slState.selected.delete(id);
        slLoadPage();
        slLoadKPIs();
        showToast('Student deleted', 'success');
    } catch (e) {
        showToast('Delete failed: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

function slSendSMS(phone, name) {
    if (!phone) return showToast('No phone number available', 'error');
    showToast('SMS to ' + name + ' at ' + phone + ' — wire to your SMS service', 'info');
}

window.slExportStudentData = function () {
    if (window.exportToCSV) {
        window.exportToCSV('students');
    } else {
        showToast('Export — wire to exportToCSV()', 'info');
    }
};

function slDebounce(fn, delay) {
    var timer;
    return function () {
        var ctx = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () { fn.apply(ctx, args); }, delay);
    };
}
