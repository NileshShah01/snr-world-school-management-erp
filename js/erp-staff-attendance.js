/**
 * ERP STAFF ATTENDANCE MODULE
 * Daily staff attendance marking and reports
 */

// ===================== INIT =====================
async function initERPStaffAttendance() {
    console.log('ERP Staff Attendance Initializing...');
    loadStaffAttendanceDate();
}

// ===================== STAFF ATTENDANCE MARKING =====================
function loadStaffAttendanceDate() {
    const dateInput = document.getElementById('staffAttDate');
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
}

async function loadStaffForAttendance() {
    const tbody = document.getElementById('staffAttendanceTableBody');
    if (!tbody) return;
    const date = document.getElementById('staffAttDate')?.value;
    if (!date) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted p-2">Select a date first.</td></tr>';
        return;
    }
    try {
        const staffSnap = await schoolData('staff').get();
        const attSnap = await schoolData('staffAttendance').where('date', '==', date).get();
        const existingAtt = {};
        attSnap.docs.forEach(d => {
            const a = d.data();
            existingAtt[a.staffId] = { id: d.id, ...a };
        });

        const staffList = staffSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (staffList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted p-2">No staff found.</td></tr>';
            return;
        }

        tbody.innerHTML = staffList.map(s => {
            const att = existingAtt[s.id];
            const status = att ? att.status : 'None';
            const colors = { Present: 'text-green', Absent: 'text-red', Late: 'text-orange', HalfDay: 'text-purple', 'On Leave': 'text-blue', None: 'text-muted' };
            return `<tr>
                <td><strong>${s.name || s.employeeId || '-'}</strong></td>
                <td>${s.designation || '-'}</td>
                <td><span class="${colors[status] || ''} font-bold">${status}</span></td>
                <td class="text-center">
                    <button class="btn-portal btn-ghost ${status === 'Present' ? 'text-green' : ''}" onclick="markStaffAttendance('${s.id}', 'Present', '${date}')" title="Present"><i class="fas fa-check-circle"></i></button>
                    <button class="btn-portal btn-ghost ${status === 'Absent' ? 'text-red' : ''}" onclick="markStaffAttendance('${s.id}', 'Absent', '${date}')" title="Absent"><i class="fas fa-times-circle"></i></button>
                    <button class="btn-portal btn-ghost ${status === 'Late' ? 'text-orange' : ''}" onclick="markStaffAttendance('${s.id}', 'Late', '${date}')" title="Late"><i class="fas fa-clock"></i></button>
                    <button class="btn-portal btn-ghost ${status === 'HalfDay' ? 'text-purple' : ''}" onclick="markStaffAttendance('${s.id}', 'HalfDay', '${date}')" title="Half Day"><i class="fas fa-adjust"></i></button>
                </td>
            </tr>`;
        }).join('');
    } catch (e) {
        console.error('Error loading staff for attendance:', e);
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-red p-2">Error loading staff</td></tr>';
    }
}

async function markStaffAttendance(staffId, status, date) {
    try {
        const existing = await schoolData('staffAttendance')
            .where('staffId', '==', staffId)
            .where('date', '==', date)
            .limit(1)
            .get();

        if (existing.empty) {
            await schoolData('staffAttendance').add(withSchool({
                staffId,
                date,
                status,
                markedAt: firebase.firestore.FieldValue.serverTimestamp(),
            }));
        } else {
            await schoolDoc('staffAttendance', existing.docs[0].id).update({
                status,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
        }
        showToast(`Marked as ${status}`, 'success');
        await loadStaffForAttendance();
    } catch (e) {
        console.error('Error marking attendance:', e);
        showToast('Error: ' + e.message, 'error');
    }
}

// ===================== STAFF ATTENDANCE REPORT =====================
async function loadStaffAttendanceReport() {
    const tbody = document.getElementById('staffAttReportBody');
    if (!tbody) return;
    const month = document.getElementById('staffAttReportMonth')?.value;
    if (!month) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted p-2">Select a month.</td></tr>';
        return;
    }
    try {
        const staffSnap = await schoolData('staff').get();
        const [year, mon] = month.split('-');
        const startDate = `${year}-${mon}-01`;
        const endMonth = parseInt(mon) === 12 ? '01' : String(parseInt(mon) + 1).padStart(2, '0');
        const endYear = parseInt(mon) === 12 ? String(parseInt(year) + 1) : year;
        const endDate = `${endYear}-${endMonth}-01`;

        const attSnap = await schoolData('staffAttendance')
            .where('date', '>=', startDate)
            .where('date', '<', endDate)
            .get();

        const staffList = staffSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const attByStaff = {};
        attSnap.docs.forEach(d => {
            const a = d.data();
            if (!attByStaff[a.staffId]) attByStaff[a.staffId] = { Present: 0, Absent: 0, Late: 0, HalfDay: 0, 'On Leave': 0 };
            attByStaff[a.staffId][a.status] = (attByStaff[a.staffId][a.status] || 0) + 1;
        });

        if (staffList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted p-2">No staff found.</td></tr>';
            return;
        }

        tbody.innerHTML = staffList.map(s => {
            const att = attByStaff[s.id] || { Present: 0, Absent: 0, Late: 0, HalfDay: 0, 'On Leave': 0 };
            const total = att.Present + att.Absent + att.Late + att.HalfDay;
            return `<tr>
                <td><strong>${s.name || s.employeeId || '-'}</strong></td>
                <td>${s.designation || '-'}</td>
                <td class="text-center text-green">${att.Present}</td>
                <td class="text-center text-red">${att.Absent}</td>
                <td class="text-center text-orange">${att.Late}</td>
                <td class="text-center">${total}</td>
            </tr>`;
        }).join('');
    } catch (e) {
        console.error('Error loading attendance report:', e);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-red p-2">Error loading report</td></tr>';
    }
}

// ===================== WINDOW EXPORTS =====================
window.initERPStaffAttendance = initERPStaffAttendance;
window.loadStaffForAttendance = loadStaffForAttendance;
window.markStaffAttendance = markStaffAttendance;
window.loadStaffAttendanceReport = loadStaffAttendanceReport;
