// Attendance Stats / Reports module
let attStatsData = [];

async function loadAttendanceStats() {
    const sessionEl = document.getElementById('attStatsSession');
    const classEl = document.getElementById('attStatsClass');
    const monthEl = document.getElementById('attStatsMonth');
    const tbody = document.getElementById('attStatsBody');
    const summaryEl = document.getElementById('attStatsSummary');
    if (!sessionEl || !classEl || !tbody) return;

    const session = sessionEl.value;
    const cls = classEl.value;
    const month = monthEl.value;
    if (!session || !month) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-3">Select session and month.</td></tr>';
        return;
    }

    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-3">Loading...</td></tr>';
    try {
        let q = schoolData('attendance').where('session', '==', session).where('month', '==', month);
        if (cls) q = q.where('class', '==', cls);
        const snap = await q.get();
        attStatsData = [];
        snap.forEach(doc => attStatsData.push({ id: doc.id, ...doc.data() }));

        if (attStatsData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-3">No attendance records found.</td></tr>';
            summaryEl.innerHTML = '';
            return;
        }

        let totalPresent = 0, totalAbsent = 0, totalLeave = 0, totalDays = 0;
        tbody.innerHTML = '';
        attStatsData.forEach(r => {
            const p = parseInt(r.present) || 0;
            const a = parseInt(r.absent) || 0;
            const l = parseInt(r.leave) || 0;
            const days = p + a + l;
            const pct = days > 0 ? ((p / days) * 100).toFixed(1) : '0.0';
            totalPresent += p; totalAbsent += a; totalLeave += l; totalDays += days;
            tbody.innerHTML += '<tr>' +
                '<td>' + escHtml(r.student_id || '-') + '</td>' +
                '<td>' + escHtml(r.name || '-') + '</td>' +
                '<td>' + escHtml(r.class || '-') + '</td>' +
                '<td>' + escHtml(r.section || '-') + '</td>' +
                '<td>' + p + '</td>' +
                '<td>' + a + '</td>' +
                '<td>' + l + '</td>' +
                '<td>' + pct + '%</td></tr>';
        });

        const overallPct = totalDays > 0 ? ((totalPresent / totalDays) * 100).toFixed(1) : '0.0';
        summaryEl.innerHTML =
            '<div class="stat-card"><p class="stat-value text-primary">' + totalPresent + '</p><p class="stat-label">Present</p></div>' +
            '<div class="stat-card"><p class="stat-value text-danger">' + totalAbsent + '</p><p class="stat-label">Absent</p></div>' +
            '<div class="stat-card"><p class="stat-value text-amber">' + overallPct + '%</p><p class="stat-label">Overall Attendance</p></div>';
    } catch (e) {
        console.error('loadAttendanceStats error:', e);
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger py-3">Error loading stats.</td></tr>';
    }
}

async function initViewAttendanceStats() {
    try {
        const sessionSnap = await schoolData('sessions').get();
        const sessionEl = document.getElementById('attStatsSession');
        if (sessionEl && !sessionSnap.empty) {
            sessionEl.innerHTML = '<option value="">Select Session</option>';
            sessionSnap.forEach(d => sessionEl.innerHTML += '<option value="' + d.id + '">' + d.id + '</option>');
        }

        const classSnap = await schoolData('classes').get();
        const classEl = document.getElementById('attStatsClass');
        if (classEl && !classSnap.empty) {
            classEl.innerHTML = '<option value="">All Classes</option>';
            const seen = new Set();
            classSnap.forEach(d => {
                const c = d.data().name || d.id;
                if (!seen.has(c)) { seen.add(c); classEl.innerHTML += '<option value="' + c + '">' + c + '</option>'; }
            });
        }

        const monthEl = document.getElementById('attStatsMonth');
        if (monthEl) {
            const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            monthEl.innerHTML = '<option value="">Select Month</option>';
            months.forEach((m, i) => monthEl.innerHTML += '<option value="' + (i+1) + '">' + m + '</option>');
        }
    } catch (e) {
        console.error('initViewAttendanceStats error:', e);
    }
}

function exportAttendanceReport() {
    if (attStatsData.length === 0) { alert('No data to export.'); return; }
    let csv = 'Student ID,Name,Class,Section,Present,Absent,Leave,Percentage\n';
    attStatsData.forEach(r => {
        const p = parseInt(r.present) || 0;
        const a = parseInt(r.absent) || 0;
        const l = parseInt(r.leave) || 0;
        const days = p + a + l;
        const pct = days > 0 ? ((p / days) * 100).toFixed(1) : '0.0';
        csv += '"' + (r.student_id || '') + '","' + (r.name || '') + '","' + (r.class || '') + '","' + (r.section || '') + '",' + p + ',' + a + ',' + l + ',' + pct + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'attendance_report.csv';
    link.click();
    URL.revokeObjectURL(link.href);
}

// Module loader callback (fires after script is appended, avoids DOMContentLoaded race)
if (document.getElementById('viewAttendanceStatsSection')) {
    initViewAttendanceStats();
}
window.onModuleLoaded_attendance_viewAttendanceStats = initViewAttendanceStats;
