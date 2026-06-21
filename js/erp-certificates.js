/* ===================================================================
 * ERP CERTIFICATES MODULE
 * Generates Bonafide, School Leaving Certificate (SLC), and
 * Transfer Certificate (TC) with print + PDF export + history audit.
 * Collection: certificates/{certId}
 * Counter: counters/{type}_{sessionId}
 * =================================================================== */

async function initERPCertificates() {
    try {
        await Promise.all([
            loadCertSessions('bonafide'),
            loadCertSessions('slc'),
            loadCertSessions('tc'),
        ]);
    } catch (e) {
        console.error('initERPCertificates error:', e);
    }
}

async function loadCertSessions(type) {
    const el = document.getElementById(`cert_${type}_session`);
    if (!el) return;
    try {
        const snap = await schoolData('sessions').orderBy('startDate', 'desc').get();
        el.innerHTML =
            '<option value="">-- Select Session --</option>' +
            snap.docs
                .map((d) => {
                    const s = d.data();
                    return `<option value="${d.id}" data-name="${s.sessionName || s.name || ''}">${s.sessionName || s.name || d.id}</option>`;
                })
                .join('');
    } catch (e) {
        console.error('loadCertSessions error:', e);
    }
}

async function loadCertClasses(type) {
    const sessionEl = document.getElementById(`cert_${type}_session`);
    const classEl = document.getElementById(`cert_${type}_class`);
    if (!sessionEl || !classEl) return;
    const sessionId = sessionEl.value;
    if (!sessionId) {
        classEl.innerHTML = '<option value="">-- Select Class --</option>';
        return;
    }
    try {
        const snap = await schoolData('classes')
            .where('sessionId', '==', sessionId)
            .orderBy('sortOrder', 'asc')
            .get();
        classEl.innerHTML =
            '<option value="">-- Select Class --</option>' +
            snap.docs
                .filter((d) => !d.data().disabled)
                .map((d) => `<option value="${d.data().name}">${d.data().name}</option>`)
                .join('');
        const sectionEl = document.getElementById(`cert_${type}_section`);
        const studentEl = document.getElementById(`cert_${type}_student`);
        if (sectionEl) sectionEl.innerHTML = '<option value="">--</option>';
        if (studentEl) studentEl.innerHTML = '<option value="">-- Select Student --</option>';
        clearCertFields(type);
    } catch (e) {
        console.error('loadCertClasses error:', e);
    }
}

async function loadCertSections(type) {
    const classEl = document.getElementById(`cert_${type}_class`);
    const sectionEl = document.getElementById(`cert_${type}_section`);
    if (!classEl || !sectionEl) return;
    const cls = classEl.value;
    if (!cls) {
        sectionEl.innerHTML = '<option value="">--</option>';
        return;
    }
    try {
        const snap = await schoolData('classes')
            .where('name', '==', cls)
            .limit(1)
            .get();
        let sections = ['A', 'B', 'C', 'D'];
        if (!snap.empty) {
            const d = snap.docs[0].data();
            if (Array.isArray(d.sections) && d.sections.length) sections = d.sections;
        }
        sectionEl.innerHTML =
            '<option value="">-- All --</option>' + sections.map((s) => `<option value="${s}">${s}</option>`).join('');
        const studentEl = document.getElementById(`cert_${type}_student`);
        if (studentEl) studentEl.innerHTML = '<option value="">-- Select Student --</option>';
        clearCertFields(type);
    } catch (e) {
        console.error('loadCertSections error:', e);
    }
}

async function loadCertStudents(type) {
    const classEl = document.getElementById(`cert_${type}_class`);
    const sectionEl = document.getElementById(`cert_${type}_section`);
    const studentEl = document.getElementById(`cert_${type}_student`);
    if (!classEl || !studentEl) return;
    const cls = classEl.value;
    const sec = sectionEl ? sectionEl.value : '';
    if (!cls) {
        studentEl.innerHTML = '<option value="">-- Select Student --</option>';
        return;
    }
    try {
        let q = schoolData('students').where('class', '==', cls);
        if (sec) q = q.where('section', '==', sec);
        const snap = await q.orderBy('roll_no', 'asc').get();
        studentEl.innerHTML =
            '<option value="">-- Select Student --</option>' +
            snap.docs
                .map((d) => {
                    const s = d.data();
                    const sid = s.studentId || s.student_id || d.id;
                    const roll = s.roll_no || s.rollNo || '';
                    return `<option value="${sid}" data-doc-id="${d.id}" data-name="${(s.name || '').replace(/"/g, '&quot;')}" data-father="${(s.fatherName || s.father_name || '').replace(/"/g, '&quot;')}" data-mother="${(s.motherName || s.mother_name || '').replace(/"/g, '&quot;')}" data-dob="${s.dob || s.dateOfBirth || ''}" data-roll="${roll}" data-admission="${s.admissionDate || s.admission_date || ''}">${s.name || sid}${roll ? ' (' + roll + ')' : ''}</option>`;
                })
                .join('');
        clearCertFields(type);
    } catch (e) {
        console.error('loadCertStudents error:', e);
    }
}

function clearCertFields(type) {
    const fields = [
        'name', 'father', 'mother', 'dob', 'roll', 'admission',
        'purpose', 'leaving_date', 'character', 'reason',
        'attendance_p', 'attendance_r', 'extra', 'due', 'conduct', 'remarks',
    ];
    fields.forEach((f) => {
        const el = document.getElementById(`cert_${type}_${f}`);
        if (el) el.value = '';
    });
    const hint = document.getElementById(`cert_${type}_due_hint`);
    if (hint) hint.textContent = '';
}

async function populateCertStudent(type) {
    const sel = document.getElementById(`cert_${type}_student`);
    if (!sel) return;
    const opt = sel.options[sel.selectedIndex];
    if (!opt || !opt.value) {
        clearCertFields(type);
        return;
    }
    document.getElementById(`cert_${type}_name`).value = opt.dataset.name || '';
    document.getElementById(`cert_${type}_father`).value = opt.dataset.father || '';
    document.getElementById(`cert_${type}_mother`).value = opt.dataset.mother || '';
    document.getElementById(`cert_${type}_dob`).value = formatDateForInput(opt.dataset.dob);
    document.getElementById(`cert_${type}_roll`).value = opt.dataset.roll || '';
    document.getElementById(`cert_${type}_admission`).value = formatDateForInput(opt.dataset.admission);
    if (type === 'slc') {
        const due = await computeStudentDue(opt.value);
        const dueEl = document.getElementById('cert_slc_due');
        if (dueEl) dueEl.value = due.toFixed(2);
        const hint = document.getElementById('cert_slc_due_hint');
        if (hint) hint.textContent = 'Auto-computed from outstanding fees';
    }
}

function formatDateForInput(val) {
    if (!val) return '';
    if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}/)) return val.substring(0, 10);
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().substring(0, 10);
}

async function computeStudentDue(studentId) {
    try {
        const feesSnap = await schoolData('fees').where('studentId', '==', studentId).get();
        let due = 0;
        feesSnap.forEach((d) => {
            const f = d.data();
            if (f.status === 'reverted' || f.status === 'voided') return;
            const outstanding = (f.amount || 0) - (f.paidAmount || 0);
            if (outstanding > 0) due += outstanding;
        });
        return due;
    } catch (e) {
        console.error('computeStudentDue error:', e);
        return 0;
    }
}

async function getNextCertRefNumber(type, sessionId) {
    const counterId = `cert_${type}_${sessionId || 'default'}`;
    const counterRef = schoolDoc('counters', counterId);
    try {
        const snap = await counterRef.get();
        if (!snap.exists) {
            await counterRef.set({ runNo: 1, type: `cert_${type}`, sessionId: sessionId || '', updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
            return formatCertRefNo(type, 1);
        }
        const current = snap.data().runNo || 0;
        const next = current + 1;
        await counterRef.update({ runNo: next, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        return formatCertRefNo(type, next);
    } catch (e) {
        console.error('getNextCertRefNumber error:', e);
        const fallback = `TEMP-${type.toUpperCase()}-${Date.now().toString().slice(-6)}`;
        return fallback;
    }
}

function formatCertRefNo(type, n) {
    const prefix = { bonafide: 'BNF', slc: 'SLC', tc: 'TC' }[type] || 'CRT';
    return `${prefix}-${String(n).padStart(4, '0')}`;
}

async function generateCertificate(type) {
    try {
        setLoading(true);
        const sessionEl = document.getElementById(`cert_${type}_session`);
        const classEl = document.getElementById(`cert_${type}_class`);
        const sectionEl = document.getElementById(`cert_${type}_section`);
        const studentEl = document.getElementById(`cert_${type}_student`);
        const sessionId = sessionEl?.value || '';
        const sessionName = sessionEl?.options[sessionEl.selectedIndex]?.dataset.name || sessionEl?.options[sessionEl.selectedIndex]?.textContent || '';
        const cls = classEl?.value || '';
        const sec = sectionEl?.value || '';
        const studentId = studentEl?.value || '';
        if (!sessionId || !cls || !studentId) {
            showToast('Please select session, class and student', 'error');
            return;
        }
        const opt = studentEl.options[studentEl.selectedIndex];
        const studentName = opt.dataset.name || '';
        const refNo = await getNextCertRefNumber(type, sessionId);
        const today = new Date().toISOString().substring(0, 10);
        const data = {
            type: type,
            refNo: refNo,
            sessionId: sessionId,
            sessionName: sessionName,
            class: cls,
            section: sec,
            studentId: studentId,
            studentName: studentName,
            fatherName: document.getElementById(`cert_${type}_father`)?.value || '',
            motherName: document.getElementById(`cert_${type}_mother`)?.value || '',
            dob: document.getElementById(`cert_${type}_dob`)?.value || '',
            rollNo: document.getElementById(`cert_${type}_roll`)?.value || '',
            admissionDate: document.getElementById(`cert_${type}_admission`)?.value || '',
            purpose: document.getElementById(`cert_${type}_purpose`)?.value || '',
            leavingDate: document.getElementById(`cert_${type}_leaving_date`)?.value || today,
            character: document.getElementById(`cert_${type}_character`)?.value || '',
            reason: document.getElementById(`cert_${type}_reason`)?.value || '',
            probableAttendance: document.getElementById(`cert_${type}_attendance_p`)?.value || '',
            actualAttendance: document.getElementById(`cert_${type}_attendance_r`)?.value || '',
            extraActivity: document.getElementById(`cert_${type}_extra`)?.value || '',
            dueAmount: parseFloat(document.getElementById(`cert_${type}_due`)?.value || 0),
            conduct: document.getElementById(`cert_${type}_conduct`)?.value || '',
            remarks: document.getElementById(`cert_${type}_remarks`)?.value || '',
            generatedBy: firebase.auth?.currentUser?.email || 'admin',
            generatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'issued',
        };
        const docRef = await schoolData('certificates').add(data);
        const refNoEl = document.getElementById(`cert_${type}_refno`);
        if (refNoEl) refNoEl.value = refNo;
        await showCertPreview(type, { id: docRef.id, ...data });
        showToast(`Certificate ${refNo} generated`, 'success');
    } catch (e) {
        console.error('generateCertificate error:', e);
        showToast('Error generating certificate: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

async function showCertPreview(type, data) {
    const area = document.getElementById('certificatePrintTemplate');
    if (!area) return;
    const map = {
        bonafide: { title: 'BONAFIDE CERTIFICATE', refLabel: 'Ref' },
        slc: { title: 'SCHOOL LEAVING CERTIFICATE', refLabel: 'SLC No' },
        tc: { title: 'TRANSFER CERTIFICATE', refLabel: 'TC No' },
    };
    const cfg = map[type];
    try {
        const schSnap = await schoolRef().get();
        const sch = schSnap.exists ? schSnap.data() : {};
        const nameEl = document.getElementById('crtSchoolName');
        const addrEl = document.getElementById('crtSchoolAddress');
        const contactEl = document.getElementById('crtSchoolContact');
        if (nameEl) nameEl.textContent = sch.schoolName || 'School Name';
        if (addrEl) addrEl.textContent = sch.address || '';
        if (contactEl) contactEl.textContent = `Contact: ${sch.phone || '--'} | ${sch.email || '--'}`;
    } catch (e) {
        console.error('School info load error:', e);
    }
    document.getElementById('crtTitle').textContent = cfg.title;
    document.getElementById('crtRefNo').textContent = data.refNo;
    document.getElementById('crtDate').textContent = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    document.getElementById('crtStudentName').textContent = data.studentName || '--';
    document.getElementById('crtClass').textContent = `${data.class || ''} ${data.section || ''}`.trim();
    document.getElementById('crtSession').textContent = data.sessionName || '';
    document.getElementById('crtFather').textContent = data.fatherName || '--';
    document.getElementById('crtDob').textContent = formatDisplayDate(data.dob);
    document.getElementById('crtRoll').textContent = data.rollNo || '--';
    document.getElementById('crtAdmNo').textContent = data.studentId;
    document.getElementById('crtBody').innerHTML = buildCertBody(type, data);
    area.classList.remove('hidden');
    area.style.display = 'block';
    area.dataset.certType = type;
    area.dataset.certId = data.id;
    area.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function buildCertBody(type, d) {
    if (type === 'bonafide') {
        return `
            <p style="text-indent: 50px; line-height: 1.8; font-size: 14px; text-align: justify;">
                This is to certify that <b>${d.studentName || '__________'}</b>,
                S/o or D/o <b>${d.fatherName || '__________'}</b>,
                is a bonafide student of this school, studying in
                <b>Class ${d.class || '___'} ${d.section || ''}</b>
                during the academic session <b>${d.sessionName || '____'}</b>.
                His/Her Date of Birth is <b>${formatDisplayDate(d.dob)}</b>
                as per the school records.
            </p>
            <p style="text-indent: 50px; line-height: 1.8; font-size: 14px; text-align: justify;">
                This certificate is being issued on the request of the student / parent
                ${d.purpose ? 'for the purpose of <b>' + d.purpose + '</b>' : ''}.
            </p>
            <p style="margin-top: 30px; line-height: 1.8; font-size: 13px;">
                <b>Remarks:</b> ${d.remarks || 'NIL'}
            </p>
        `;
    }
    if (type === 'slc') {
        return `
            <table class="crt-info-table">
                <tr><td>1. Name of Pupil</td><td>: <b>${d.studentName || '--'}</b></td></tr>
                <tr><td>2. Father's / Guardian's Name</td><td>: ${d.fatherName || '--'}</td></tr>
                <tr><td>3. Nationality / Religion</td><td>: Indian / __________</td></tr>
                <tr><td>4. Whether the candidate belongs to SC/ST/OBC</td><td>: __________</td></tr>
                <tr><td>5. Date of Birth (in Christian Era)</td><td>: <b>${formatDisplayDate(d.dob)}</b></td></tr>
                <tr><td>6. Date of first admission in school</td><td>: ${formatDisplayDate(d.admissionDate)}</td></tr>
                <tr><td>7. Class in which the pupil last studied</td><td>: Class ${d.class || '--'} ${d.section || ''}</td></tr>
                <tr><td>8. School / Board Annual Examination last taken</td><td>: __________</td></tr>
                <tr><td>9. Whether failed, if so, subjects</td><td>: No</td></tr>
                <tr><td>10. Subjects studied</td><td>: __________</td></tr>
                <tr><td>11. Whether qualified for promotion to higher class</td><td>: Yes</td></tr>
                <tr><td>12. Whether the pupil paid all fees due</td><td>: ${(d.dueAmount > 0 ? 'No (Due: ₹' + d.dueAmount.toLocaleString() + ')' : 'Yes')}</td></tr>
                <tr><td>13. Probable attendance in the academic session</td><td>: ${d.probableAttendance || '____'}%</td></tr>
                <tr><td>14. Actual attendance in the academic session</td><td>: ${d.actualAttendance || '____'}%</td></tr>
                <tr><td>15. Extra-curricular activities</td><td>: ${d.extraActivity || '--'}</td></tr>
                <tr><td>16. General conduct</td><td>: ${d.character || 'Good'}</td></tr>
                <tr><td>17. Date of leaving school</td><td>: <b>${formatDisplayDate(d.leavingDate)}</b></td></tr>
                <tr><td>18. Reason for leaving school</td><td>: ${d.reason || '--'}</td></tr>
            </table>
        `;
    }
    if (type === 'tc') {
        return `
            <table class="crt-info-table">
                <tr><td>1. Name of Pupil</td><td>: <b>${d.studentName || '--'}</b></td></tr>
                <tr><td>2. Mother's Name</td><td>: ${d.motherName || '--'}</td></tr>
                <tr><td>3. Father's / Guardian's Name</td><td>: ${d.fatherName || '--'}</td></tr>
                <tr><td>4. Nationality</td><td>: Indian</td></tr>
                <tr><td>5. Date of Birth (in Christian Era)</td><td>: <b>${formatDisplayDate(d.dob)}</b></td></tr>
                <tr><td>6. Admission No</td><td>: ${d.studentId}</td></tr>
                <tr><td>7. Date of first admission</td><td>: ${formatDisplayDate(d.admissionDate)}</td></tr>
                <tr><td>8. Class at time of leaving</td><td>: Class ${d.class || '--'} ${d.section || ''}</td></tr>
                <tr><td>9. Last examination passed</td><td>: __________</td></tr>
                <tr><td>10. Whether qualified for promotion</td><td>: Yes</td></tr>
                <tr><td>11. Whether all fees paid</td><td>: ${(d.dueAmount > 0 ? 'No (Due: ₹' + d.dueAmount.toLocaleString() + ')' : 'Yes')}</td></tr>
                <tr><td>12. Date of leaving</td><td>: <b>${formatDisplayDate(d.leavingDate)}</b></td></tr>
                <tr><td>13. Reason for transfer</td><td>: ${d.reason || '--'}</td></tr>
                <tr><td>14. Conduct</td><td>: ${d.conduct || d.character || 'Good'}</td></tr>
                <tr><td>15. Remarks</td><td>: ${d.remarks || 'NIL'}</td></tr>
            </table>
        `;
    }
    return '';
}

function formatDisplayDate(val) {
    if (!val) return '--';
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

function closeCertPreview() {
    const area = document.getElementById('certificatePrintTemplate');
    if (area) {
        area.style.display = 'none';
        area.classList.add('hidden');
    }
}

function printCert() {
    window.print();
}

async function exportCertPDF() {
    const area = document.getElementById('certificatePrintTemplate');
    if (!area || !area.dataset.certType) {
        showToast('No certificate to export', 'error');
        return;
    }
    const type = area.dataset.certType;
    const certId = area.dataset.certId;
    try {
        setLoading(true);
        const docSnap = await schoolDoc('certificates', certId).get();
        if (!docSnap.exists) throw new Error('Certificate not found');
        const d = docSnap.data();
        const schSnap = await schoolRef().get();
        const sch = schSnap.exists ? schSnap.data() : {};

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
        const pageW = pdf.internal.pageSize.getWidth();
        const margin = 18;
        let y = 18;

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.text(sch.schoolName || 'School Name', pageW / 2, y, { align: 'center' });
        y += 6;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.text(sch.address || '', pageW / 2, y, { align: 'center' });
        y += 4;
        pdf.text(`Contact: ${sch.phone || '--'} | ${sch.email || '--'}`, pageW / 2, y, { align: 'center' });
        y += 4;
        pdf.setLineWidth(0.5);
        pdf.line(margin, y, pageW - margin, y);
        y += 10;

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        const title = { bonafide: 'BONAFIDE CERTIFICATE', slc: 'SCHOOL LEAVING CERTIFICATE', tc: 'TRANSFER CERTIFICATE' }[type];
        pdf.text(title, pageW / 2, y, { align: 'center' });
        y += 5;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        const refLabel = { bonafide: 'Ref', slc: 'SLC No', tc: 'TC No' }[type];
        pdf.text(`${refLabel}: ${d.refNo}    Date: ${new Date().toLocaleDateString('en-IN')}`, pageW / 2, y, { align: 'center' });
        y += 10;

        if (type === 'bonafide') {
            const para1 = `This is to certify that ${d.studentName || '__________'}, S/o or D/o ${d.fatherName || '__________'}, is a bonafide student of this school, studying in Class ${d.class || '___'} ${d.section || ''} during the academic session ${d.sessionName || '____'}. His/Her Date of Birth is ${formatDisplayDate(d.dob)} as per the school records.`;
            const para2 = `This certificate is being issued on the request of the student / parent ${d.purpose ? 'for the purpose of ' + d.purpose : ''}.`;
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(11);
            const split1 = pdf.splitTextToSize(para1, pageW - 2 * margin);
            pdf.text(split1, margin, y);
            y += split1.length * 6 + 4;
            const split2 = pdf.splitTextToSize(para2, pageW - 2 * margin);
            pdf.text(split2, margin, y);
            y += split2.length * 6 + 6;
            if (d.remarks) {
                pdf.text(`Remarks: ${d.remarks}`, margin, y);
                y += 8;
            }
        } else {
            const fields = type === 'slc'
                ? [
                      ['1. Name of Pupil', d.studentName || '--'],
                      ['2. Father\'s / Guardian\'s Name', d.fatherName || '--'],
                      ['3. Nationality / Religion', 'Indian / --'],
                      ['4. Whether SC/ST/OBC', '--'],
                      ['5. Date of Birth', formatDisplayDate(d.dob)],
                      ['6. Date of first admission', formatDisplayDate(d.admissionDate)],
                      ['7. Class last studied', `Class ${d.class || '--'} ${d.section || ''}`],
                      ['8. Last exam taken', '--'],
                      ['9. Whether failed', 'No'],
                      ['10. Subjects studied', '--'],
                      ['11. Qualified for promotion', 'Yes'],
                      ['12. All fees paid', d.dueAmount > 0 ? `No (Due: Rs.${d.dueAmount.toLocaleString()})` : 'Yes'],
                      ['13. Probable attendance', (d.probableAttendance || '--') + '%'],
                      ['14. Actual attendance', (d.actualAttendance || '--') + '%'],
                      ['15. Extra-curricular activities', d.extraActivity || '--'],
                      ['16. General conduct', d.character || 'Good'],
                      ['17. Date of leaving', formatDisplayDate(d.leavingDate)],
                      ['18. Reason for leaving', d.reason || '--'],
                  ]
                : [
                      ['1. Name of Pupil', d.studentName || '--'],
                      ['2. Mother\'s Name', d.motherName || '--'],
                      ['3. Father\'s / Guardian\'s Name', d.fatherName || '--'],
                      ['4. Nationality', 'Indian'],
                      ['5. Date of Birth', formatDisplayDate(d.dob)],
                      ['6. Admission No', d.studentId],
                      ['7. Date of first admission', formatDisplayDate(d.admissionDate)],
                      ['8. Class at time of leaving', `Class ${d.class || '--'} ${d.section || ''}`],
                      ['9. Last exam passed', '--'],
                      ['10. Qualified for promotion', 'Yes'],
                      ['11. All fees paid', d.dueAmount > 0 ? `No (Due: Rs.${d.dueAmount.toLocaleString()})` : 'Yes'],
                      ['12. Date of leaving', formatDisplayDate(d.leavingDate)],
                      ['13. Reason for transfer', d.reason || '--'],
                      ['14. Conduct', d.conduct || d.character || 'Good'],
                      ['15. Remarks', d.remarks || 'NIL'],
                  ];
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            fields.forEach(([k, v]) => {
                pdf.setFont('helvetica', 'normal');
                pdf.text(k, margin, y);
                pdf.text(`: ${v}`, margin + 70, y);
                y += 6;
                if (y > 270) {
                    pdf.addPage();
                    y = 20;
                }
            });
        }

        y = Math.max(y + 30, 240);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.text('Date: ' + new Date().toLocaleDateString('en-IN'), margin, y);
        pdf.text('Authorized Signatory', pageW - margin, y, { align: 'right' });
        y += 4;
        pdf.setFontSize(8);
        pdf.text('Principal', pageW - margin, y + 4, { align: 'right' });

        const filename = `${d.refNo}-${d.studentName.replace(/\s+/g, '_')}.pdf`;
        pdf.save(filename);
        showToast('PDF saved: ' + filename, 'success');
    } catch (e) {
        console.error('exportCertPDF error:', e);
        showToast('Error generating PDF: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

async function loadCertHistory() {
    const tbody = document.getElementById('certHistoryTableBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
    try {
        const type = document.getElementById('certHistoryType')?.value || '';
        const classFilter = document.getElementById('certHistoryClass')?.value || '';
        const fromDate = document.getElementById('certHistoryFrom')?.value || '';
        const toDate = document.getElementById('certHistoryTo')?.value || '';
        let q = schoolData('certificates').orderBy('generatedAt', 'desc').limit(200);
        if (type) q = q.where('type', '==', type);
        if (classFilter) q = q.where('class', '==', classFilter);
        const snap = await q.get();
        let rows = snap.docs.map((doc) => {
            const d = doc.data();
            return { id: doc.id, ...d };
        });
        if (fromDate) {
            const from = new Date(fromDate);
            rows = rows.filter((r) => r.generatedAt && r.generatedAt.toDate && r.generatedAt.toDate() >= from);
        }
        if (toDate) {
            const to = new Date(toDate);
            to.setHours(23, 59, 59);
            rows = rows.filter((r) => r.generatedAt && r.generatedAt.toDate && r.generatedAt.toDate() <= to);
        }
        if (rows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted p-2">No certificates found</td></tr>';
            return;
        }
        const typeLabels = { bonafide: 'Bonafide', slc: 'SLC', tc: 'Transfer' };
        tbody.innerHTML = rows
            .map((r) => {
                const dateStr = r.generatedAt ? new Date(r.generatedAt.seconds * 1000).toLocaleDateString() : '--';
                const status = r.status === 'voided'
                    ? '<span class="badge" style="background:#ef4444;color:white">VOIDED</span>'
                    : '<span class="badge" style="background:#10b981;color:white">ISSUED</span>';
                return `<tr>
                    <td><strong>${r.refNo}</strong></td>
                    <td>${typeLabels[r.type] || r.type}</td>
                    <td>${r.studentName}<br><small class="text-muted">${r.studentId}</small></td>
                    <td>${r.class || ''} ${r.section || ''}</td>
                    <td>${dateStr}</td>
                    <td>${status}</td>
                    <td>
                        <button class="btn-icon" onclick="reprintCert('${r.id}')" title="Reprint"><i class="fas fa-print"></i></button>
                        <button class="btn-icon" onclick="exportHistoryCertPDF('${r.id}')" title="Download PDF"><i class="fas fa-file-pdf"></i></button>
                        ${r.status !== 'voided' ? `<button class="btn-icon text-red" onclick="voidCert('${r.id}')" title="Void"><i class="fas fa-ban"></i></button>` : ''}
                    </td>
                </tr>`;
            })
            .join('');
    } catch (e) {
        console.error('loadCertHistory error:', e);
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-red p-2">Error: ' + e.message + '</td></tr>';
    }
}

async function reprintCert(id) {
    try {
        setLoading(true);
        const snap = await schoolDoc('certificates', id).get();
        if (!snap.exists) throw new Error('Certificate not found');
        const d = snap.data();
        await showCertPreview(d.type, { id, ...d });
    } catch (e) {
        showToast('Error reprinting: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

async function exportHistoryCertPDF(id) {
    try {
        setLoading(true);
        const area = document.getElementById('certificatePrintTemplate');
        area.dataset.certType = (await schoolDoc('certificates', id).get()).data().type;
        area.dataset.certId = id;
        await exportCertPDF();
    } finally {
        setLoading(false);
    }
}

async function voidCert(id) {
    const reason = prompt('Reason for voiding this certificate:');
    if (!reason) return;
    try {
        setLoading(true);
        await schoolDoc('certificates', id).update({
            status: 'voided',
            voidedAt: firebase.firestore.FieldValue.serverTimestamp(),
            voidedBy: firebase.auth?.currentUser?.email || 'admin',
            voidReason: reason,
        });
        showToast('Certificate voided', 'success');
        await loadCertHistory();
    } catch (e) {
        showToast('Error voiding: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

window.initERPCertificates = initERPCertificates;
window.loadCertSessions = loadCertSessions;
window.loadCertClasses = loadCertClasses;
window.loadCertSections = loadCertSections;
window.loadCertStudents = loadCertStudents;
window.populateCertStudent = populateCertStudent;
window.generateCertificate = generateCertificate;
window.printCert = printCert;
window.exportCertPDF = exportCertPDF;
window.closeCertPreview = closeCertPreview;
window.loadCertHistory = loadCertHistory;
window.reprintCert = reprintCert;
window.exportHistoryCertPDF = exportHistoryCertPDF;
window.voidCert = voidCert;
