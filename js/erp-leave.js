/**
 * ERP LEAVE MANAGEMENT MODULE
 * Leave types, applications, approvals, balances
 */

// ===================== STATE =====================
let leaveState = {
    leaveTypes: [],
    applications: [],
    staff: [],
};

// ===================== INIT =====================
async function initERPLeave() {
    console.log('ERP Leave Module Initializing...');
    await loadLeaveTypes();
    await loadLeaveApplications();
}

// ===================== LEAVE TYPES =====================
async function loadLeaveTypes() {
    const tbody = document.getElementById('leaveTypeTableBody');
    try {
        const snap = await schoolData('leaveTypes').get();
        leaveState.leaveTypes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (tbody) {
            if (leaveState.leaveTypes.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted p-2">No leave types defined. Click "Add Leave Type" to create.</td></tr>';
                return;
            }
            tbody.innerHTML = leaveState.leaveTypes.map(lt => `<tr>
                <td><strong>${lt.name}</strong></td>
                <td>${lt.daysAllowed || 0} days/year</td>
                <td>${lt.paid ? '<span class="text-green">Paid</span>' : '<span class="text-red">Unpaid</span>'}</td>
                <td>${lt.carryForward ? '<span class="text-green">Yes</span>' : '<span class="text-muted">No</span>'}</td>
                <td class="text-center">
                    <button class="btn-portal btn-ghost" onclick="editLeaveType('${lt.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-portal btn-ghost text-red" onclick="deleteLeaveType('${lt.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`).join('');
        }
    } catch (e) {
        console.error('Error loading leave types:', e);
        if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="text-center text-red p-2">Error loading</td></tr>';
    }
}

function openAddLeaveTypeModal() {
    const html = `
        <form id="leaveTypeForm" onsubmit="saveLeaveType(event)">
            <div class="form-group">
                <label>Leave Type Name</label>
                <input type="text" id="ltName" class="form-control" placeholder="e.g. Casual Leave" required>
            </div>
            <div class="grid-2 gap-1">
                <div class="form-group">
                    <label>Days Allowed (per year)</label>
                    <input type="number" id="ltDays" class="form-control" min="0" value="12" required>
                </div>
                <div class="form-group">
                    <label>Max Consecutive Days</label>
                    <input type="number" id="ltMaxConsec" class="form-control" min="1" value="3">
                </div>
            </div>
            <div class="grid-2 gap-1">
                <div class="form-group">
                    <label class="flex items-center gap-0-5">
                        <input type="checkbox" id="ltPaid" checked> Paid Leave
                    </label>
                </div>
                <div class="form-group">
                    <label class="flex items-center gap-0-5">
                        <input type="checkbox" id="ltCarryForward"> Carry Forward
                    </label>
                </div>
            </div>
            <div class="form-group">
                <label>Description (Optional)</label>
                <textarea id="ltDesc" class="form-control" rows="2" placeholder="Rules for this leave type"></textarea>
            </div>
            <input type="hidden" id="ltEditId" value="">
            <button type="submit" class="btn-portal btn-primary w-full"><i class="fas fa-save"></i> Save Leave Type</button>
        </form>
    `;
    openCmsModal('Add Leave Type', html);
}

async function saveLeaveType(event) {
    event.preventDefault();
    const editId = document.getElementById('ltEditId').value;
    const data = {
        name: document.getElementById('ltName').value.trim(),
        daysAllowed: parseInt(document.getElementById('ltDays').value) || 0,
        maxConsecutive: parseInt(document.getElementById('ltMaxConsec').value) || 3,
        paid: document.getElementById('ltPaid').checked,
        carryForward: document.getElementById('ltCarryForward').checked,
        description: document.getElementById('ltDesc').value.trim(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    try {
        setLoading(true);
        if (editId) {
            await schoolDoc('leaveTypes', editId).update(data);
            showToast('Leave type updated', 'success');
        } else {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await schoolData('leaveTypes').add(withSchool(data));
            showToast('Leave type created', 'success');
        }
        closeCmsModal();
        await loadLeaveTypes();
    } catch (e) {
        console.error(e);
        showToast('Error: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

async function editLeaveType(id) {
    try {
        const doc = await schoolDoc('leaveTypes', id).get();
        if (!doc.exists) { showToast('Not found', 'error'); return; }
        const lt = doc.data();
        openAddLeaveTypeModal();
        setTimeout(() => {
            document.getElementById('cmsModalTitle').textContent = 'Edit Leave Type';
            document.getElementById('ltName').value = lt.name || '';
            document.getElementById('ltDays').value = lt.daysAllowed || 0;
            document.getElementById('ltMaxConsec').value = lt.maxConsecutive || 3;
            document.getElementById('ltPaid').checked = lt.paid !== false;
            document.getElementById('ltCarryForward').checked = lt.carryForward === true;
            document.getElementById('ltDesc').value = lt.description || '';
            document.getElementById('ltEditId').value = id;
        }, 100);
    } catch (e) {
        console.error(e);
        showToast('Error', 'error');
    }
}

async function deleteLeaveType(id) {
    if (!await window.showConfirmModal({ title: 'Delete Leave Type', message: 'Delete this leave type?', icon: 'fa-calendar-times', confirmText: 'Delete', danger: true })) return;
    try {
        setLoading(true);
        await schoolDoc('leaveTypes', id).delete();
        showToast('Deleted', 'success');
        await loadLeaveTypes();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

// ===================== LEAVE APPLICATIONS =====================
async function loadLeaveApplications() {
    const tbody = document.getElementById('leaveApplicationTableBody');
    if (!tbody) return;
    try {
        const snap = await schoolData('leaveApplications').orderBy('appliedOn', 'desc').limit(100).get();
        leaveState.applications = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (leaveState.applications.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted p-2">No leave applications found.</td></tr>';
            return;
        }
        tbody.innerHTML = leaveState.applications.map(app => {
            const statusBadge = { Pending: 'bg-orange-1', Approved: 'bg-green-1', Rejected: 'bg-red-1', Cancelled: 'bg-gray-1' };
            return `<tr>
                <td><strong>${app.staffName || '-'}</strong></td>
                <td>${app.leaveType || '-'}</td>
                <td>${app.fromDate || '-'} to ${app.toDate || '-'}</td>
                <td class="text-center">${app.days || 0}</td>
                <td><span class="${statusBadge[app.status] || ''} p-0-5 border-radius-sm" style="font-size:0.75rem">${app.status || 'Pending'}</span></td>
                <td class="text-center">
                    ${app.status === 'Pending' ? `
                        <button class="btn-portal btn-ghost text-green" onclick="approveLeave('${app.id}')" title="Approve"><i class="fas fa-check"></i></button>
                        <button class="btn-portal btn-ghost text-red" onclick="rejectLeave('${app.id}')" title="Reject"><i class="fas fa-times"></i></button>
                    ` : `
                        <button class="btn-portal btn-ghost" onclick="viewLeaveApplication('${app.id}')" title="View"><i class="fas fa-eye"></i></button>
                    `}
                </td>
            </tr>`;
        }).join('');
    } catch (e) {
        console.error('Error loading leave applications:', e);
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-red p-2">Error loading</td></tr>';
    }
}

async function approveLeave(appId) {
    if (!await window.showConfirmModal({ title: 'Approve Leave', message: 'Approve this leave application?', icon: 'fa-check-circle', confirmText: 'Approve' })) return;
    try {
        setLoading(true);
        await schoolDoc('leaveApplications', appId).update({
            status: 'Approved',
            approvedBy: 'Admin',
            approvedOn: firebase.firestore.FieldValue.serverTimestamp(),
        });
        showToast('Leave approved', 'success');
        await loadLeaveApplications();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

async function rejectLeave(appId) {
    const reason = prompt('Reason for rejection (optional):');
    if (reason === null) return;
    try {
        setLoading(true);
        await schoolDoc('leaveApplications', appId).update({
            status: 'Rejected',
            rejectedBy: 'Admin',
            rejectionReason: reason,
            rejectedOn: firebase.firestore.FieldValue.serverTimestamp(),
        });
        showToast('Leave rejected', 'success');
        await loadLeaveApplications();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

async function viewLeaveApplication(appId) {
    try {
        const doc = await schoolDoc('leaveApplications', appId).get();
        if (!doc.exists) { showToast('Not found', 'error'); return; }
        const app = doc.data();
        const html = `
            <div class="card p-1-5">
                <div class="grid-2 gap-1 mb-1">
                    <div><strong>Employee:</strong> ${app.staffName}</div>
                    <div><strong>Leave Type:</strong> ${app.leaveType}</div>
                    <div><strong>From:</strong> ${app.fromDate}</div>
                    <div><strong>To:</strong> ${app.toDate}</div>
                    <div><strong>Days:</strong> ${app.days}</div>
                    <div><strong>Status:</strong> ${app.status}</div>
                </div>
                <div><strong>Reason:</strong> ${app.reason || 'Not provided'}</div>
                ${app.rejectionReason ? `<div class="mt-0-5"><strong>Rejection Reason:</strong> ${app.rejectionReason}</div>` : ''}
            </div>
        `;
        openCmsModal('Leave Application Details', html);
    } catch (e) {
        console.error(e);
        showToast('Error', 'error');
    }
}

// ===================== LEAVE BALANCE =====================
async function loadLeaveBalances() {
    const tbody = document.getElementById('leaveBalanceTableBody');
    if (!tbody) return;
    try {
        const staffSnap = await schoolData('staff').get();
        const ltSnap = await schoolData('leaveTypes').get();
        const appSnap = await schoolData('leaveApplications').where('status', '==', 'Approved').get();

        const leaveTypes = ltSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const applications = appSnap.docs.map(d => d.data());
        const staffList = staffSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        if (staffList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted p-2">No staff found.</td></tr>';
            return;
        }

        const currentYear = new Date().getFullYear();
        tbody.innerHTML = staffList.map(s => {
            let cols = `<td><strong>${s.name || s.employeeId || '-'}</strong></td><td>${s.designation || '-'}</td>`;
            let balanceCells = '';
            leaveTypes.forEach(lt => {
                const used = applications
                    .filter(a => a.staffId === s.id && a.leaveType === lt.name && a.fromDate && a.fromDate.startsWith(String(currentYear)))
                    .reduce((sum, a) => sum + (a.days || 0), 0);
                const remaining = (lt.daysAllowed || 0) - used;
                balanceCells += `<td class="text-center"><span class="${remaining < 0 ? 'text-red' : 'text-green'}">${remaining}</span> / ${lt.daysAllowed || 0}</td>`;
            });
            return `<tr>${cols}${balanceCells}</tr>`;
        }).join('');

        // Update header
        const thead = document.querySelector('#leaveBalanceTableBody')?.closest('table')?.querySelector('thead tr');
        if (thead) {
            thead.innerHTML = '<th>Employee</th><th>Designation</th>' +
                leaveTypes.map(lt => `<th class="text-center">${lt.name}</th>`).join('');
        }
    } catch (e) {
        console.error('Error loading leave balances:', e);
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-red p-2">Error loading balances</td></tr>';
    }
}

// ===================== LEAVE REPORTS =====================
async function loadLeaveReport() {
    const tbody = document.getElementById('leaveReportBody');
    if (!tbody) return;
    const year = document.getElementById('leaveReportYear')?.value || new Date().getFullYear();
    try {
        const snap = await schoolData('leaveApplications').where('status', '==', 'Approved').get();
        const apps = snap.docs.map(d => d.data()).filter(a => a.fromDate && a.fromDate.startsWith(String(year)));

        if (apps.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted p-2">No approved leaves for this year.</td></tr>';
            return;
        }

        const summary = {};
        apps.forEach(a => {
            const name = a.staffName || 'Unknown';
            if (!summary[name]) summary[name] = { total: 0, byType: {} };
            summary[name].total += a.days || 0;
            summary[name].byType[a.leaveType] = (summary[name].byType[a.leaveType] || 0) + (a.days || 0);
        });

        const leaveTypeNames = [...new Set(apps.map(a => a.leaveType))];
        const thead = document.querySelector('#leaveReportBody')?.closest('table')?.querySelector('thead tr');
        if (thead) {
            thead.innerHTML = '<th>Employee</th>' +
                leaveTypeNames.map(lt => `<th class="text-center">${lt}</th>`).join('') +
                '<th class="text-center">Total</th>';
        }

        tbody.innerHTML = Object.entries(summary).map(([name, s]) => {
            const cells = leaveTypeNames.map(lt => `<td class="text-center">${s.byType[lt] || 0}</td>`).join('');
            return `<tr><td><strong>${name}</strong></td>${cells}<td class="text-center font-bold">${s.total}</td></tr>`;
        }).join('');
    } catch (e) {
        console.error('Error loading leave report:', e);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-red p-2">Error loading report</td></tr>';
    }
}

/**
 * Leave Calendar — displays approved leaves in table format
 */
async function loadLeaveCalendar() {
    const tbody = document.getElementById('calLeaveBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
    try {
        if (!leaveState.applications || leaveState.applications.length === 0) {
            await loadLeaveApplications();
        }
        let apps = leaveState.applications.filter(a => a.status === 'approved');
        const staffFilter = document.getElementById('calStaffFilter')?.value;
        if (staffFilter) apps = apps.filter(a => a.staffId === staffFilter);
        if (apps.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted p-2">No approved leaves found.</td></tr>';
            return;
        }
        apps.sort((a, b) => (b.fromDate || '').localeCompare(a.fromDate || ''));
        tbody.innerHTML = apps.map(a => {
            const days = a.days || 1;
            return `<tr>
                <td><strong>${a.staffName || 'Unknown'}</strong></td>
                <td>${a.leaveType || '-'}</td>
                <td>${a.fromDate || '-'}</td>
                <td>${a.toDate || '-'}</td>
                <td class="text-center">${days}</td>
                <td>${(a.reason || '').substring(0, 60)}</td>
                <td><span class="badge" style="background:#22c55e;color:white;">Approved</span></td>
            </tr>`;
        }).join('');
    } catch (e) {
        console.error('Error loading leave calendar:', e);
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-red p-2">Error loading data</td></tr>';
    }
}

// ===================== WINDOW EXPORTS =====================
window.initERPLeave = initERPLeave;
window.loadLeaveTypes = loadLeaveTypes;
window.openAddLeaveTypeModal = openAddLeaveTypeModal;
window.saveLeaveType = saveLeaveType;
window.editLeaveType = editLeaveType;
window.deleteLeaveType = deleteLeaveType;
window.loadLeaveApplications = loadLeaveApplications;
window.approveLeave = approveLeave;
window.rejectLeave = rejectLeave;
window.viewLeaveApplication = viewLeaveApplication;
window.loadLeaveBalances = loadLeaveBalances;
window.loadLeaveReport = loadLeaveReport;
window.loadLeaveCalendar = loadLeaveCalendar;
