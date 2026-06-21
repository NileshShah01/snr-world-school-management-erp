// Data Subject Request (DSR) Workflow — DPDP Act 2023 compliance
let dsrRequests = [];
let dsrExportData = null;

async function loadDsrRequests() {
    const tbody = document.getElementById('dsrTableBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-3">Loading...</td></tr>';
    try {
        const snap = await schoolData('dsrRequests').orderBy('createdAt', 'desc').get();
        dsrRequests = [];
        let pending = 0, approved = 0, rejected = 0;
        snap.forEach(doc => {
            const r = { id: doc.id, ...doc.data() };
            dsrRequests.push(r);
            if (r.status === 'pending') pending++;
            else if (r.status === 'approved') approved++;
            else if (r.status === 'rejected') rejected++;
        });

        document.getElementById('dsrPendingCount').textContent = pending;
        document.getElementById('dsrApprovedCount').textContent = approved;
        document.getElementById('dsrRejectedCount').textContent = rejected;

        if (dsrRequests.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-3">No data subject requests found.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        dsrRequests.forEach(r => {
            const date = r.createdAt ? new Date(r.createdAt.toMillis()).toLocaleDateString() : '—';
            const statusBadge = r.status === 'pending' ? 'badge-warning' : r.status === 'approved' ? 'badge-success' : 'badge-danger';
            tbody.innerHTML += '<tr>' +
                '<td class="text-sm">' + escHtml(date) + '</td>' +
                '<td>' + escHtml(r.requesterName || '—') + '</td>' +
                '<td>' + escHtml(r.contact || '—') + '</td>' +
                '<td><span class="badge badge-info">' + escHtml(r.requestType || '—') + '</span></td>' +
                '<td><span class="badge ' + statusBadge + '">' + escHtml(r.status || 'pending') + '</span></td>' +
                '<td class="flex gap-0-5">' +
                    (r.status === 'pending' ? renderPendingActions(r) : '<span class="text-xs text-muted">' + escHtml(r.resolvedBy || '') + ' on ' + (r.resolvedAt ? new Date(r.resolvedAt.toMillis()).toLocaleDateString() : '—') + '</span>') +
                '</td></tr>';
        });
    } catch (e) {
        console.error('loadDsrRequests error:', e);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-3">Error loading requests.</td></tr>';
    }
}

function renderPendingActions(r) {
    let actions = '';
    if (r.requestType === 'Access my data' || r.requestType === 'Export my data') {
        actions += '<button class="btn-portal btn-sm btn-success" onclick="approveAndExport(\'' + r.id + '\')" title="Approve & Export"><i class="fas fa-file-export"></i></button>';
    }
    if (r.requestType === 'Delete my data') {
        actions += '<button class="btn-portal btn-sm btn-danger" onclick="approveAndDelete(\'' + r.id + '\')" title="Approve & Delete"><i class="fas fa-trash"></i></button>';
    }
    actions += '<button class="btn-portal btn-sm btn-ghost" onclick="rejectDsr(\'' + r.id + '\')" title="Reject"><i class="fas fa-times"></i></button>';
    return actions;
}

async function approveAndExport(requestId) {
    if (!await window.showConfirmModal({ title: 'Approve & Export', message: 'Export all data for this requester?', confirmText: 'Export', icon: 'fa-file-export' })) return;
    const r = dsrRequests.find(x => x.id === requestId);
    if (!r) return;
    try {
        // Collect all data for this requester (by contact phone/email)
        const contact = r.contact;
        const studentsSnap = await schoolData('students').where('phone', '==', contact).get();
        const parentSnap = await schoolData('students').where('guardian_phone', '==', contact).get();
        const allRecords = [];
        studentsSnap.forEach(d => allRecords.push({ collection: 'students', id: d.id, ...d.data() }));
        parentSnap.forEach(d => {
            if (!allRecords.find(x => x.id === d.id)) allRecords.push({ collection: 'students', id: d.id, ...d.data() });
        });

        dsrExportData = {
            exportedAt: new Date().toISOString(),
            requestId: requestId,
            requesterName: r.requesterName,
            contact: r.contact,
            records: allRecords,
        };

        document.getElementById('dsrExportPreview').textContent = JSON.stringify(dsrExportData, null, 2);
        document.getElementById('dsrExportModal').classList.remove('hidden');

        await resolveDsrRequest(requestId, 'approved');
        await logDsrAudit(requestId, 'approved', 'export');
    } catch (e) {
        console.error('approveAndExport error:', e);
        alert('Error exporting data: ' + e.message);
    }
}

function downloadDsrExport() {
    if (!dsrExportData) return;
    const blob = new Blob([JSON.stringify(dsrExportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'dsr-export-' + dsrExportData.requestId + '.json';
    link.click();
    URL.revokeObjectURL(link.href);
}

function closeDsrModal() {
    document.getElementById('dsrExportModal').classList.add('hidden');
}

async function approveAndDelete(requestId) {
    if (!await window.showConfirmModal({ title: 'Approve & Delete', message: 'This will permanently delete all associated student data. This cannot be undone!', confirmText: 'Delete All', danger: true, icon: 'fa-trash' })) return;
    const r = dsrRequests.find(x => x.id === requestId);
    if (!r) return;
    try {
        const contact = r.contact;
        const studentsSnap = await schoolData('students').where('phone', '==', contact).get();
        const batch = (window.db || firebase.firestore()).batch();
        studentsSnap.forEach(d => batch.delete(schoolDoc('students', d.id)));
        await batch.commit();
        await resolveDsrRequest(requestId, 'approved');
        await logDsrAudit(requestId, 'approved', 'delete');
        alert('Data deleted successfully.');
        loadDsrRequests();
    } catch (e) {
        console.error('approveAndDelete error:', e);
        alert('Error deleting data: ' + e.message);
    }
}

async function rejectDsr(requestId) {
    if (!await window.showConfirmModal({ title: 'Reject Request', message: 'Are you sure you want to reject this request?', confirmText: 'Reject', danger: true, icon: 'fa-ban' })) return;
    await resolveDsrRequest(requestId, 'rejected');
    await logDsrAudit(requestId, 'rejected', null);
    loadDsrRequests();
}

async function resolveDsrRequest(requestId, status) {
    const user = firebase.auth().currentUser;
    await schoolDoc('dsrRequests', requestId).update({
        status: status,
        resolvedBy: user ? user.email || user.uid : 'unknown',
        resolvedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
}

async function logDsrAudit(requestId, action, type) {
    const user = firebase.auth().currentUser;
    await schoolData('auditLog').add({
        collection: 'dsrRequests',
        documentId: requestId,
        action: 'dsr_' + action,
        type: type || 'none',
        performedBy: user ? user.email || user.uid : 'unknown',
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        schoolId: CURRENT_SCHOOL_ID,
    });
}

// Module loader callback (fires after script is appended, avoids DOMContentLoaded race)
if (document.getElementById('dsrRequestsSection')) {
    loadDsrRequests();
}
window.onModuleLoaded_tools_dsrRequests = loadDsrRequests;
window.loadDsrRequests = loadDsrRequests;
