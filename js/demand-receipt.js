/* ===================================================================
 * DEMAND FEE RECEIPT SYSTEM
 * Batch & single demand slip generation with print and PDF export.
 * Filters: session, class, section, student (optional), month range.
 * =================================================================== */

/* ───── Dropdown Loaders ───── */

async function loadDemandSessions() {
    try {
        const snap = await schoolData('sessions').orderBy('startDate', 'desc').get();
        const sel = document.getElementById('demandSessionSelect');
        if (!sel) return;
        sel.innerHTML =
            '<option value="">-- Session --</option>' +
            snap.docs.map((d) => {
                const s = d.data();
                return `<option value="${d.id}">${s.sessionName || s.name || d.id}</option>`;
            }).join('');
    } catch (e) {
        console.error('loadDemandSessions:', e);
    }
}

async function loadDemandClasses() {
    const sessionEl = document.getElementById('demandSessionSelect');
    const classEl = document.getElementById('demandClassSelect');
    if (!sessionEl || !classEl) return;
    const sessionId = sessionEl.value;
    if (!sessionId) {
        classEl.innerHTML = '<option value="">-- Class --</option>';
        clearDemandStudent();
        return;
    }
    try {
        const snap = await schoolData('classes')
            .where('sessionId', '==', sessionId)
            .orderBy('sortOrder', 'asc')
            .get();
        classEl.innerHTML =
            '<option value="">-- Class --</option>' +
            snap.docs
                .filter((d) => !d.data().disabled)
                .map((d) => `<option value="${d.data().name}">${d.data().name}</option>`)
                .join('');
        clearDemandStudent();
    } catch (e) {
        console.error('loadDemandClasses:', e);
    }
}

async function loadDemandSections() {
    const classEl = document.getElementById('demandClassSelect');
    const sectionEl = document.getElementById('demandSectionSelect');
    if (!classEl || !sectionEl) return;
    const cls = classEl.value;
    if (!cls) {
        sectionEl.innerHTML = '<option value="">-- Section --</option>';
        clearDemandStudent();
        return;
    }
    try {
        const snap = await schoolData('classes').where('name', '==', cls).limit(1).get();
        let sections = ['A', 'B', 'C', 'D'];
        if (!snap.empty && Array.isArray(snap.docs[0].data().sections) && snap.docs[0].data().sections.length) {
            sections = snap.docs[0].data().sections;
        }
        sectionEl.innerHTML =
            '<option value="">All Sections</option>' +
            sections.map((s) => `<option value="${s}">${s}</option>`).join('');
        clearDemandStudent();
    } catch (e) {
        console.error('loadDemandSections:', e);
    }
}

async function loadDemandStudents() {
    const classEl = document.getElementById('demandClassSelect');
    const sectionEl = document.getElementById('demandSectionSelect');
    const studentEl = document.getElementById('demandStudentSelect');
    if (!classEl || !studentEl) return;
    const cls = classEl.value;
    if (!cls) {
        studentEl.innerHTML = '<option value="">All Students</option>';
        return;
    }
    const sec = sectionEl?.value || '';
    try {
        let q = schoolData('students').where('class', '==', cls);
        if (sec) q = q.where('section', '==', sec);
        const snap = await q.orderBy('roll_no', 'asc').get();
        studentEl.innerHTML =
            '<option value="">All Students</option>' +
            snap.docs.map((d) => {
                const s = d.data();
                const sid = s.studentId || s.student_id || d.id;
                return `<option value="${sid}">${s.name || sid} (${sid})</option>`;
            }).join('');
    } catch (e) {
        console.error('loadDemandStudents:', e);
    }
}

function clearDemandStudent() {
    const el = document.getElementById('demandStudentSelect');
    if (el) el.innerHTML = '<option value="">All Students</option>';
}

/* ───── Generate ───── */

async function generateBatchDemandReceipts() {
    const sessionId = document.getElementById('demandSessionSelect').value;
    const cls = document.getElementById('demandClassSelect').value;
    const sec = document.getElementById('demandSectionSelect').value;
    const sid = document.getElementById('demandStudentSelect').value;
    const dueDate = document.getElementById('demandDueDate').value;
    const fromMonthIdx = parseInt(document.getElementById('demandFromMonth').value);
    const tillMonthIdx = parseInt(document.getElementById('demandTillMonth').value);
    const includePrev = document.getElementById('demandIncludePrevious').checked;
    const combine = document.getElementById('demandCombineFees').checked;

    if (!sessionId || !cls || !dueDate || isNaN(tillMonthIdx)) {
        showToast('Please select Session, Class, Due Date, and Till Month', 'error');
        return;
    }
    setLoading(true);
    try {
        // Get session info
        const sessSnap = await schoolDoc('sessions', sessionId).get();
        const sessionName = sessSnap.exists ? (sessSnap.data().sessionName || sessSnap.data().name || sessionId) : sessionId;

        // Get school info
        const schSnap = await schoolRef().get();
        const sch = schSnap.exists ? schSnap.data() : {};

        // Get students
        let studentQuery = schoolData('students').where('class', '==', cls);
        if (sec) studentQuery = studentQuery.where('section', '==', sec);
        if (sid) studentQuery = studentQuery.where('studentId', '==', sid);
        const studentSnap = await studentQuery.get();

        if (studentSnap.empty) {
            showToast('No students found for this criteria', 'warning');
            setLoading(false);
            return;
        }

        const students = studentSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Process each student
        const receipts = [];
        for (const student of students) {
            const studentId = student.studentId || student.student_id || student.id;
            const dues = await fetchStudentDuesForDemand(studentId, fromMonthIdx, tillMonthIdx, includePrev);
            if (dues.length === 0) continue;
            receipts.push({ student, dues });
        }

        if (receipts.length === 0) {
            showToast('No pending dues found for selected criteria', 'info');
            setLoading(false);
            return;
        }

        // Generate HTML grid
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const fromLabel = !isNaN(fromMonthIdx) ? monthNames[fromMonthIdx] : monthNames[0];
        const tillLabel = monthNames[tillMonthIdx];
        const rows = [];
        for (let i = 0; i < receipts.length; i += 4) {
            const chunk = receipts.slice(i, i + 4);
            const cards = chunk.map((r) => generateSingleDemandReceiptHtml(sch, r.student, sessionName, r.dues, dueDate, combine)).join('');
            rows.push(`<div class="demand-print-page">${cards}</div>`);
        }

        const container = document.getElementById('demandReceiptPrintContainer');
        container.innerHTML = rows.join('');
        container.style.display = 'block';

        // Store for PDF export
        window._demandData = { sch, sessionName, receipts, dueDate, combine, fromLabel, tillLabel };

        showToast(`${receipts.length} demand receipts generated`, 'success');
    } catch (e) {
        console.error('generateBatchDemandReceipts:', e);
        showToast('Error: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

/* ───── Fetch Dues ───── */

async function fetchStudentDuesForDemand(studentId, fromMonthIdx, tillMonthIdx, includePrev) {
    try {
        const snap = await schoolData('fees')
            .where('studentId', '==', studentId)
            .where('status', 'in', ['pending', 'partial'])
            .get();

        const monthMap = { January: 0, February: 1, March: 2, April: 3, May: 4, June: 5, July: 6, August: 7, September: 8, October: 9, November: 10, December: 11 };
        const dues = [];
        snap.forEach((doc) => {
            const f = { docId: doc.id, ...doc.data() };
            const mIdx = monthMap[f.month];
            if (mIdx === undefined) return;
            const isInRange = !isNaN(fromMonthIdx) ? (mIdx >= fromMonthIdx && mIdx <= tillMonthIdx) : (mIdx <= tillMonthIdx);
            if (isInRange) {
                dues.push({ ...f, dueAmount: (f.amount || 0) - (f.paidAmount || 0) });
            } else if (includePrev && mIdx <= tillMonthIdx) {
                dues.push({ ...f, dueAmount: (f.amount || 0) - (f.paidAmount || 0) });
            }
        });

        return dues.sort((a, b) => (monthMap[a.month] || 0) - (monthMap[b.month] || 0));
    } catch (e) {
        console.error('fetchStudentDuesForDemand:', e);
        return [];
    }
}

/* ───── HTML Generation ───── */

function generateSingleDemandReceiptHtml(school, student, sessionName, dues, dueDate, combine) {
    const items = combine ? combineDues(dues) : dues;
    let total = 0;
    let feeRows = '';
    items.forEach((item) => {
        const amt = item.dueAmount || item.amount || 0;
        total += amt;
        feeRows += `<tr><td>${item.feeType}${!combine ? ' (' + item.month.substring(0, 3) + ')' : ''}</td><td class="text-right">${amt.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td></tr>`;
    });

    const now = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const dueDateStr = new Date(dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    return `
        <div class="demand-receipt-card">
            <div class="dr-header">
                <div class="dr-school-info">
                    <h2>${school.schoolName || 'APEX PUBLIC SCHOOL'}</h2>
                    <p>${school.address || ''}</p>
                    <p>Phone: ${school.phone || ''}</p>
                </div>
                <div class="dr-label">
                    <h3>Demand Receipt</h3>
                    <p>Date: ${now}</p>
                </div>
            </div>
            <div class="dr-student-grid dr-grid-header">
                <div>Student Name</div>
                <div>Reg No</div>
                <div>Roll</div>
                <div>Father's Name</div>
                <div>Session</div>
            </div>
            <div class="dr-student-grid">
                <div style="font-weight:700">${student.name || '--'}</div>
                <div>${student.studentId || student.admissionNo || '--'}</div>
                <div>${student.rollNo || student.roll_no || '--'}</div>
                <div>${student.fatherName || student.father_name || '--'}</div>
                <div>${sessionName}</div>
            </div>
            <table class="dr-table">
                <thead><tr><th>Fee Name</th><th class="text-right" style="width:80px">Due</th></tr></thead>
                <tbody>${feeRows}</tbody>
            </table>
            <div class="dr-summary">
                <div class="dr-total-row"><span>Total Due: ${total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span></div>
                <div class="dr-note">Dear Parent, kindly pay total dues of <b>${total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</b> before <b>${dueDateStr}</b>.</div>
            </div>
            <div class="dr-footer">
                <div style="font-size:7pt;color:#94a3b8;">* This is a computer generated demand receipt.</div>
                <div style="border-top:1px solid #1e293b;width:100px;text-align:center;font-size:8pt;padding-top:1mm;">Authorized Sign</div>
            </div>
        </div>`;
}

function combineDues(dues) {
    const map = {};
    dues.forEach((d) => {
        if (!map[d.feeType]) map[d.feeType] = { feeType: d.feeType, dueAmount: 0 };
        map[d.feeType].dueAmount += (d.dueAmount || d.amount || 0);
    });
    return Object.values(map);
}

/* ───── Print ───── */

function printDemandReceipts() {
    window.print();
}

/* ───── PDF Export ───── */

async function exportDemandPDF() {
    const data = window._demandData;
    if (!data || !data.receipts || data.receipts.length === 0) {
        showToast('Generate demand receipts first', 'error');
        return;
    }
    try {
        setLoading(true);
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        const pageW = doc.internal.pageSize.getWidth();
        const margin = 15;
        let y = 18;

        // School header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text(data.sch.schoolName || 'School Name', pageW / 2, y, { align: 'center' });
        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(data.sch.address || '', pageW / 2, y, { align: 'center' });
        y += 4;
        doc.text(`Contact: ${data.sch.phone || '--'}`, pageW / 2, y, { align: 'center' });
        y += 8;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('DEMAND FEE RECEIPTS', pageW / 2, y, { align: 'center' });
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Session: ${data.sessionName}  |  ${data.fromLabel} to ${data.tillLabel}  |  Due: ${new Date(data.dueDate).toLocaleDateString('en-IN')}`, pageW / 2, y, { align: 'center' });
        y += 10;

        for (let i = 0; i < data.receipts.length; i++) {
            const r = data.receipts[i];
            const student = r.student;
            const items = data.combine ? combineDues(r.dues) : r.dues;
            let total = 0;

            // Student header
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text(`${student.name || '--'} (${student.studentId || student.student_id || '--'})`, margin, y);
            y += 4;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text(`${data.sch.schoolName || ''} | Class: ${student.class || ''} | Roll: ${student.rollNo || student.roll_no || '--'}`, margin, y);
            y += 6;

            // Fees table
            const body = items.map((item) => {
                const amt = item.dueAmount || item.amount || 0;
                total += amt;
                return [`${item.feeType}${!data.combine ? ' (' + item.month.substring(0, 3) + ')' : ''}`, amt.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })];
            });
            body.push(['TOTAL', total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })]);

            doc.autoTable({
                startY: y,
                head: [['Fee Name', 'Due Amount']],
                body: body,
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
                margin: { left: margin, right: margin },
                styles: { fontSize: 9, cellPadding: 2 },
                columnStyles: { 0: { cellWidth: 'auto' }, 1: { halign: 'right', cellWidth: 40 } },
                footStyles: { fontStyle: 'bold', fillColor: [248, 250, 252] },
            });

            y = doc.lastAutoTable.finalY + 6;
            if (y > 255) {
                doc.addPage();
                y = 18;
            }
        }

        doc.save(`Demand-Receipts-${data.sessionName.replace(/\s+/g, '_')}.pdf`);
        showToast('PDF exported', 'success');
    } catch (e) {
        console.error('exportDemandPDF:', e);
        showToast('PDF error: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

/* ───── Window Exports ───── */

window.loadDemandSessions = loadDemandSessions;
window.loadDemandClasses = loadDemandClasses;
window.loadDemandSections = loadDemandSections;
window.loadDemandStudents = loadDemandStudents;
window.generateBatchDemandReceipts = generateBatchDemandReceipts;
window.printDemandReceipts = printDemandReceipts;
window.exportDemandPDF = exportDemandPDF;
