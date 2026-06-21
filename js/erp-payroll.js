/**
 * ERP PAYROLL & SALARY MODULE
 * Salary structures, monthly payroll, payslips
 */

// ===================== STATE =====================
let payrollState = {
    staff: [],
    salaryStructures: [],
    payrollRecords: [],
};

// ===================== INIT =====================
async function initERPPayroll() {
    console.log('ERP Payroll Module Initializing...');
    await loadSalaryStructures();
    await loadStaffForPayroll();
}

// ===================== SALARY STRUCTURE =====================
async function loadSalaryStructures() {
    const tbody = document.getElementById('salaryStructureTableBody');
    try {
        const snap = await schoolData('salaryStructures').get();
        payrollState.salaryStructures = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (tbody) {
            if (payrollState.salaryStructures.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted p-2">No salary structures defined. Click "Add Structure" to create one.</td></tr>';
                return;
            }
            tbody.innerHTML = payrollState.salaryStructures.map(s => `<tr>
                <td><strong>${s.name}</strong></td>
                <td>${s.designation || '-'}</td>
                <td class="text-right">${formatPayCurrency(s.basic || 0)}</td>
                <td class="text-right">${formatPayCurrency(s.totalEarnings || 0)}</td>
                <td class="text-center">
                    <button class="btn-portal btn-ghost" onclick="editSalaryStructure('${s.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-portal btn-ghost text-red" onclick="deleteSalaryStructure('${s.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`).join('');
        }
    } catch (e) {
        console.error('Error loading salary structures:', e);
        if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="text-center text-red p-2">Error loading structures</td></tr>';
    }
}

function openAddSalaryStructureModal() {
    const html = `
        <form id="salaryStructForm" onsubmit="saveSalaryStructure(event)">
            <div class="grid-2 gap-1">
                <div class="form-group">
                    <label>Structure Name</label>
                    <input type="text" id="ssName" class="form-control" placeholder="e.g. Teacher Scale A" required>
                </div>
                <div class="form-group">
                    <label>Designation</label>
                    <input type="text" id="ssDesignation" class="form-control" placeholder="e.g. Teacher">
                </div>
            </div>
            <h4 class="mt-1 mb-0-5 text-sm text-muted">EARNINGS</h4>
            <div class="grid-3 gap-1">
                <div class="form-group">
                    <label>Basic (₹)</label>
                    <input type="number" id="ssBasic" class="form-control" min="0" step="100" value="0">
                </div>
                <div class="form-group">
                    <label>DA (₹)</label>
                    <input type="number" id="ssDA" class="form-control" min="0" step="100" value="0">
                </div>
                <div class="form-group">
                    <label>TA (₹)</label>
                    <input type="number" id="ssTA" class="form-control" min="0" step="100" value="0">
                </div>
                <div class="form-group">
                    <label>HA (₹)</label>
                    <input type="number" id="ssHA" class="form-control" min="0" step="100" value="0">
                </div>
                <div class="form-group">
                    <label>MA (₹)</label>
                    <input type="number" id="ssMA" class="form-control" min="0" step="100" value="0">
                </div>
                <div class="form-group">
                    <label>Special Allowance (₹)</label>
                    <input type="number" id="ssSpecial" class="form-control" min="0" step="100" value="0">
                </div>
            </div>
            <h4 class="mt-1 mb-0-5 text-sm text-muted">DEDUCTIONS</h4>
            <div class="grid-3 gap-1">
                <div class="form-group">
                    <label>PF (₹)</label>
                    <input type="number" id="ssPF" class="form-control" min="0" step="100" value="0">
                </div>
                <div class="form-group">
                    <label>ESI (₹)</label>
                    <input type="number" id="ssESI" class="form-control" min="0" step="100" value="0">
                </div>
                <div class="form-group">
                    <label>Prof. Tax (₹)</label>
                    <input type="number" id="ssProfTax" class="form-control" min="0" step="100" value="0">
                </div>
                <div class="form-group">
                    <label>TDS (₹)</label>
                    <input type="number" id="ssTDS" class="form-control" min="0" step="100" value="0">
                </div>
            </div>
            <input type="hidden" id="ssEditId" value="">
            <button type="submit" class="btn-portal btn-primary w-full mt-1"><i class="fas fa-save"></i> Save Structure</button>
        </form>
    `;
    openCmsModal('Add Salary Structure', html);
}

async function saveSalaryStructure(event) {
    event.preventDefault();
    const editId = document.getElementById('ssEditId').value;
    const basic = parseFloat(document.getElementById('ssBasic').value) || 0;
    const da = parseFloat(document.getElementById('ssDA').value) || 0;
    const ta = parseFloat(document.getElementById('ssTA').value) || 0;
    const ha = parseFloat(document.getElementById('ssHA').value) || 0;
    const ma = parseFloat(document.getElementById('ssMA').value) || 0;
    const special = parseFloat(document.getElementById('ssSpecial').value) || 0;
    const pf = parseFloat(document.getElementById('ssPF').value) || 0;
    const esi = parseFloat(document.getElementById('ssESI').value) || 0;
    const profTax = parseFloat(document.getElementById('ssProfTax').value) || 0;
    const tds = parseFloat(document.getElementById('ssTDS').value) || 0;

    const data = {
        name: document.getElementById('ssName').value.trim(),
        designation: document.getElementById('ssDesignation').value.trim(),
        basic, da, ta, ha, ma, special,
        totalEarnings: basic + da + ta + ha + ma + special,
        pf, esi, profTax, tds,
        totalDeductions: pf + esi + profTax + tds,
        netPay: (basic + da + ta + ha + ma + special) - (pf + esi + profTax + tds),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    try {
        setLoading(true);
        if (editId) {
            await schoolDoc('salaryStructures', editId).update(data);
            showToast('Structure updated', 'success');
        } else {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await schoolData('salaryStructures').add(withSchool(data));
            showToast('Structure created', 'success');
        }
        closeCmsModal();
        await loadSalaryStructures();
    } catch (e) {
        console.error(e);
        showToast('Error: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

async function editSalaryStructure(id) {
    try {
        const doc = await schoolDoc('salaryStructures', id).get();
        if (!doc.exists) { showToast('Not found', 'error'); return; }
        const s = doc.data();
        openAddSalaryStructureModal();
        setTimeout(() => {
            document.getElementById('cmsModalTitle').textContent = 'Edit Salary Structure';
            document.getElementById('ssName').value = s.name || '';
            document.getElementById('ssDesignation').value = s.designation || '';
            document.getElementById('ssBasic').value = s.basic || 0;
            document.getElementById('ssDA').value = s.da || 0;
            document.getElementById('ssTA').value = s.ta || 0;
            document.getElementById('ssHA').value = s.ha || 0;
            document.getElementById('ssMA').value = s.ma || 0;
            document.getElementById('ssSpecial').value = s.special || 0;
            document.getElementById('ssPF').value = s.pf || 0;
            document.getElementById('ssESI').value = s.esi || 0;
            document.getElementById('ssProfTax').value = s.profTax || 0;
            document.getElementById('ssTDS').value = s.tds || 0;
            document.getElementById('ssEditId').value = id;
        }, 100);
    } catch (e) {
        console.error(e);
        showToast('Error loading structure', 'error');
    }
}

async function deleteSalaryStructure(id) {
    if (!await window.showConfirmModal({ title: 'Delete Salary Structure', message: 'Delete this salary structure?', icon: 'fa-trash-alt', confirmText: 'Delete', danger: true })) return;
    try {
        setLoading(true);
        await schoolDoc('salaryStructures', id).delete();
        showToast('Structure deleted', 'success');
        await loadSalaryStructures();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

// ===================== STAFF SALARY ASSIGNMENT =====================
async function loadStaffForPayroll() {
    const tbody = document.getElementById('staffSalaryTableBody');
    if (!tbody) return;
    try {
        const snap = await schoolData('staff').get();
        payrollState.staff = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (payrollState.staff.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted p-2">No staff found.</td></tr>';
            return;
        }
        tbody.innerHTML = payrollState.staff.map(s => {
            const assigned = payrollState.salaryStructures.find(st => st.designation === s.designation);
            return `<tr>
                <td><strong>${s.name || s.employeeId || '-'}</strong></td>
                <td>${s.designation || '-'}</td>
                <td>${s.department || '-'}</td>
                <td>${assigned ? assigned.name : '<span class="text-muted">Not assigned</span>'}</td>
                <td class="text-right">${assigned ? formatPayCurrency(assigned.netPay) : '-'}</td>
                <td class="text-center">
                    <button class="btn-portal btn-ghost" onclick="assignSalaryToStaff('${s.id}')" title="Assign Structure">
                        <i class="fas fa-link"></i>
                    </button>
                </td>
            </tr>`;
        }).join('');
    } catch (e) {
        console.error('Error loading staff:', e);
    }
}

function assignSalaryToStaff(staffId) {
    const staff = payrollState.staff.find(s => s.id === staffId);
    if (!staff) return;
    const options = payrollState.salaryStructures.map(s =>
        `<option value="${s.id}" ${staff.salaryStructureId === s.id ? 'selected' : ''}>${s.name} (${formatPayCurrency(s.netPay)})</option>`
    ).join('');
    const html = `
        <div class="form-group">
            <label>Assign salary structure to: <strong>${staff.name}</strong></label>
            <select id="assignStructId" class="form-control">
                <option value="">-- Select Structure --</option>
                ${options}
            </select>
        </div>
        <button class="btn-portal btn-primary w-full" onclick="saveStaffSalaryAssignment('${staffId}')">
            <i class="fas fa-save"></i> Save Assignment
        </button>
    `;
    openCmsModal('Assign Salary Structure', html);
}

async function saveStaffSalaryAssignment(staffId) {
    const structId = document.getElementById('assignStructId').value;
    if (!structId) { showToast('Select a structure', 'error'); return; }
    try {
        setLoading(true);
        await schoolDoc('staff', staffId).update({
            salaryStructureId: structId,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        showToast('Salary structure assigned', 'success');
        closeCmsModal();
        await loadStaffForPayroll();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

// ===================== MONTHLY PAYROLL =====================
async function loadMonthlyPayroll() {
    const tbody = document.getElementById('monthlyPayrollTableBody');
    if (!tbody) return;
    const month = document.getElementById('payrollMonth')?.value;
    if (!month) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted p-2">Select a month to view payroll.</td></tr>';
        return;
    }
    try {
        const snap = await schoolData('payroll').where('month', '==', month).get();
        if (snap.empty) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted p-2">No payroll generated for ${month}. Click "Generate Payroll" to create.</td></tr>`;
            return;
        }
        tbody.innerHTML = snap.docs.map(d => {
            const p = d.data();
            return `<tr>
                <td><strong>${p.staffName || '-'}</strong></td>
                <td>${p.designation || '-'}</td>
                <td class="text-right">${formatPayCurrency(p.earnings || 0)}</td>
                <td class="text-right">${formatPayCurrency(p.deductions || 0)}</td>
                <td class="text-right"><strong>${formatPayCurrency(p.netPay || 0)}</strong></td>
                <td><span class="badge ${p.status === 'Paid' ? 'bg-green-1' : 'bg-orange-1'}">${p.status || 'Pending'}</span></td>
                <td class="text-center">
                    <button class="btn-portal btn-ghost" onclick="viewPayslip('${d.id}')" title="View Payslip"><i class="fas fa-file-invoice"></i></button>
                    ${p.status !== 'Paid' ? `<button class="btn-portal btn-ghost text-green" onclick="markSalaryPaid('${d.id}')" title="Mark Paid"><i class="fas fa-check-circle"></i></button>` : ''}
                </td>
            </tr>`;
        }).join('');
    } catch (e) {
        console.error('Error loading payroll:', e);
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-red p-2">Error loading payroll</td></tr>';
    }
}

async function generateMonthlyPayroll() {
    const month = document.getElementById('payrollMonth')?.value;
    if (!month) { showToast('Select a month first', 'error'); return; }
    if (!await window.showConfirmModal({ title: 'Generate Payroll', message: 'Generate payroll for all staff for ' + month + '?', icon: 'fa-calculator', confirmText: 'Generate' })) return;

    setLoading(true);
    try {
        const staffSnap = await schoolData('staff').get();
        const structSnap = await schoolData('salaryStructures').get();
        const existingSnap = await schoolData('payroll').where('month', '==', month).get();
        const existingIds = new Set(existingSnap.docs.map(d => d.data().staffId));

        const structures = {};
        structSnap.docs.forEach(d => { structures[d.id] = { id: d.id, ...d.data() }; });

        let count = 0;
        const batch = (window.db || firebase.firestore()).batch();

        staffSnap.docs.forEach(staffDoc => {
            const s = staffDoc.data();
            if (existingIds.has(staffDoc.id)) return;
            if (!s.salaryStructureId || !structures[s.salaryStructureId]) return;

            const struct = structures[s.salaryStructureId];
            const payrollData = {
                staffId: staffDoc.id,
                staffName: s.name || s.employeeId,
                designation: s.designation || '-',
                department: s.department || '-',
                month,
                earnings: struct.totalEarnings || 0,
                basic: struct.basic || 0,
                da: struct.da || 0,
                ta: struct.ta || 0,
                ha: struct.ha || 0,
                ma: struct.ma || 0,
                special: struct.special || 0,
                deductions: struct.totalDeductions || 0,
                pf: struct.pf || 0,
                esi: struct.esi || 0,
                profTax: struct.profTax || 0,
                tds: struct.tds || 0,
                netPay: struct.netPay || 0,
                status: 'Pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            };
            batch.set(schoolData('payroll').doc(), withSchool(payrollData));
            count++;
        });

        if (count === 0) {
            showToast('No new payroll to generate (all staff already have payroll or no structure assigned)', 'info');
            setLoading(false);
            return;
        }

        await batch.commit();
        showToast(`Payroll generated for ${count} staff members`, 'success');
        await loadMonthlyPayroll();
    } catch (e) {
        console.error('Error generating payroll:', e);
        showToast('Error: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

async function markSalaryPaid(payrollId) {
    if (!await window.showConfirmModal({ title: 'Mark as Paid', message: 'Mark this salary as paid?', icon: 'fa-check-double', confirmText: 'Mark Paid' })) return;
    try {
        setLoading(true);
        await schoolDoc('payroll', payrollId).update({
            status: 'Paid',
            paidAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        showToast('Marked as Paid', 'success');
        await loadMonthlyPayroll();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

async function viewPayslip(payrollId) {
    try {
        const doc = await schoolDoc('payroll', payrollId).get();
        if (!doc.exists) { showToast('Payslip not found', 'error'); return; }
        const p = doc.data();
        const html = `
            <div class="card p-1-5" style="border:2px solid var(--primary)">
                <div class="text-center mb-1">
                    <h3 class="m-0">SALARY SLIP</h3>
                    <p class="text-muted text-sm m-0">Month: ${p.month}</p>
                </div>
                <div class="grid-2 gap-1 mb-1" style="border-bottom:1px dashed var(--border);padding-bottom:0.5rem">
                    <div><strong>Employee:</strong> ${p.staffName}</div>
                    <div><strong>Designation:</strong> ${p.designation}</div>
                    <div><strong>Department:</strong> ${p.department}</div>
                    <div><strong>Status:</strong> ${p.status}</div>
                </div>
                <div class="grid-2 gap-1">
                    <div>
                        <h4 class="text-sm text-muted mb-0-5">EARNINGS</h4>
                        <div class="text-sm">Basic: ${formatPayCurrency(p.basic)}</div>
                        <div class="text-sm">DA: ${formatPayCurrency(p.da)}</div>
                        <div class="text-sm">TA: ${formatPayCurrency(p.ta)}</div>
                        <div class="text-sm">HA: ${formatPayCurrency(p.ha)}</div>
                        <div class="text-sm">MA: ${formatPayCurrency(p.ma)}</div>
                        <div class="text-sm">Special: ${formatPayCurrency(p.special)}</div>
                        <div class="text-sm font-bold mt-0-5">Total: ${formatPayCurrency(p.earnings)}</div>
                    </div>
                    <div>
                        <h4 class="text-sm text-muted mb-0-5">DEDUCTIONS</h4>
                        <div class="text-sm">PF: ${formatPayCurrency(p.pf)}</div>
                        <div class="text-sm">ESI: ${formatPayCurrency(p.esi)}</div>
                        <div class="text-sm">Prof. Tax: ${formatPayCurrency(p.profTax)}</div>
                        <div class="text-sm">TDS: ${formatPayCurrency(p.tds)}</div>
                        <div class="text-sm font-bold mt-0-5">Total: ${formatPayCurrency(p.deductions)}</div>
                    </div>
                </div>
                <div class="text-center mt-1 p-1" style="background:var(--bg-slate-light);border-radius:var(--radius)">
                    <strong style="font-size:1.2em">NET PAY: ${formatPayCurrency(p.netPay)}</strong>
                </div>
            </div>
        `;
        openCmsModal('Payslip - ' + p.staffName, html);
    } catch (e) {
        console.error(e);
        showToast('Error loading payslip', 'error');
    }
}

// ===================== UTILITY =====================
function formatPayCurrency(amount) {
    return '\u20B9' + Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ===================== WINDOW EXPORTS =====================
window.initERPPayroll = initERPPayroll;
window.loadSalaryStructures = loadSalaryStructures;
window.openAddSalaryStructureModal = openAddSalaryStructureModal;
window.saveSalaryStructure = saveSalaryStructure;
window.editSalaryStructure = editSalaryStructure;
window.deleteSalaryStructure = deleteSalaryStructure;
window.loadStaffForPayroll = loadStaffForPayroll;
window.assignSalaryToStaff = assignSalaryToStaff;
window.saveStaffSalaryAssignment = saveStaffSalaryAssignment;
window.loadMonthlyPayroll = loadMonthlyPayroll;
window.generateMonthlyPayroll = generateMonthlyPayroll;
window.markSalaryPaid = markSalaryPaid;
window.viewPayslip = viewPayslip;
window.loadPayrollHistory = loadPayrollHistory;
window.loadPayslipForStaff = loadPayslipForStaff;
window.loadSalaryReport = loadSalaryReport;
window.populatePayslipStaffSelect = populatePayslipStaffSelect;

// ===================== PAYSLIP STAFF SELECT =====================
async function populatePayslipStaffSelect() {
    const select = document.getElementById('payslipStaffSelect');
    if (!select) return;
    try {
        if (payrollState.staff.length === 0) {
            const snap = await schoolData('staff').get();
            payrollState.staff = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
        select.innerHTML = '<option value="">-- Select Employee --</option>' +
            payrollState.staff.map(s => `<option value="${s.id}">${s.name || s.employeeId}</option>`).join('');
    } catch (e) {
        console.error('Error populating staff select:', e);
    }
}

// ===================== PAYROLL HISTORY =====================
async function loadPayrollHistory() {
    const tbody = document.getElementById('payrollHistoryBody');
    if (!tbody) return;
    const month = document.getElementById('payrollHistoryMonth')?.value;
    let query = schoolData('payroll').orderBy('month', 'desc').limit(200);
    if (month) query = schoolData('payroll').where('month', '==', month).orderBy('createdAt', 'desc');
    try {
        const snap = await query.get();
        if (snap.empty) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted p-2">No payroll records found.</td></tr>';
            return;
        }
        tbody.innerHTML = snap.docs.map(d => {
            const p = d.data();
            return `<tr>
                <td><strong>${p.staffName || '-'}</strong></td>
                <td>${p.month || '-'}</td>
                <td class="text-right">${formatPayCurrency(p.earnings)}</td>
                <td class="text-right">${formatPayCurrency(p.deductions)}</td>
                <td class="text-right"><strong>${formatPayCurrency(p.netPay)}</strong></td>
                <td><span class="badge ${p.status === 'Paid' ? 'bg-green-1' : 'bg-orange-1'}">${p.status || 'Pending'}</span></td>
                <td class="text-center">
                    <button class="btn-portal btn-ghost" onclick="viewPayslip('${d.id}')" title="View Payslip"><i class="fas fa-file-invoice"></i></button>
                </td>
            </tr>`;
        }).join('');
    } catch (e) {
        console.error('Error loading payroll history:', e);
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-red p-2">Error loading history</td></tr>';
    }
}

// ===================== PAYSLIP VIEW =====================
async function loadPayslipForStaff() {
    const area = document.getElementById('payslipDisplayArea');
    if (!area) return;
    const staffId = document.getElementById('payslipStaffSelect')?.value;
    const month = document.getElementById('payslipMonth')?.value;
    if (!staffId || !month) {
        area.innerHTML = '<p class="text-center text-muted">Select employee and month to view payslip.</p>';
        return;
    }
    try {
        const snap = await schoolData('payroll').where('staffId', '==', staffId).where('month', '==', month).limit(1).get();
        if (snap.empty) {
            area.innerHTML = '<p class="text-center text-muted">No payslip found for this employee/month.</p>';
            return;
        }
        const p = snap.docs[0].data();
        area.innerHTML = `
            <div class="card p-2" style="border:2px solid var(--primary);max-width:600px;margin:0 auto">
                <div class="text-center mb-1">
                    <h3 class="m-0">SALARY SLIP</h3>
                    <p class="text-muted text-sm m-0">Month: ${p.month}</p>
                </div>
                <div class="grid-2 gap-1 mb-1" style="border-bottom:1px dashed var(--border);padding-bottom:0.5rem">
                    <div><strong>Employee:</strong> ${p.staffName}</div>
                    <div><strong>Designation:</strong> ${p.designation}</div>
                    <div><strong>Department:</strong> ${p.department}</div>
                    <div><strong>Status:</strong> ${p.status}</div>
                </div>
                <div class="grid-2 gap-1">
                    <div>
                        <h4 class="text-sm text-muted mb-0-5">EARNINGS</h4>
                        <div class="text-sm">Basic: ${formatPayCurrency(p.basic)}</div>
                        <div class="text-sm">DA: ${formatPayCurrency(p.da)}</div>
                        <div class="text-sm">TA: ${formatPayCurrency(p.ta)}</div>
                        <div class="text-sm">HA: ${formatPayCurrency(p.ha)}</div>
                        <div class="text-sm">MA: ${formatPayCurrency(p.ma)}</div>
                        <div class="text-sm">Special: ${formatPayCurrency(p.special)}</div>
                        <div class="text-sm font-bold mt-0-5">Total: ${formatPayCurrency(p.earnings)}</div>
                    </div>
                    <div>
                        <h4 class="text-sm text-muted mb-0-5">DEDUCTIONS</h4>
                        <div class="text-sm">PF: ${formatPayCurrency(p.pf)}</div>
                        <div class="text-sm">ESI: ${formatPayCurrency(p.esi)}</div>
                        <div class="text-sm">Prof. Tax: ${formatPayCurrency(p.profTax)}</div>
                        <div class="text-sm">TDS: ${formatPayCurrency(p.tds)}</div>
                        <div class="text-sm font-bold mt-0-5">Total: ${formatPayCurrency(p.deductions)}</div>
                    </div>
                </div>
                <div class="text-center mt-1 p-1" style="background:var(--bg-slate-light);border-radius:var(--radius)">
                    <strong style="font-size:1.2em">NET PAY: ${formatPayCurrency(p.netPay)}</strong>
                </div>
            </div>
        `;
    } catch (e) {
        console.error('Error loading payslip:', e);
        area.innerHTML = '<p class="text-center text-red">Error loading payslip.</p>';
    }
}

// ===================== SALARY REPORTS =====================
async function loadSalaryReport() {
    const tbody = document.getElementById('salaryReportBody');
    if (!tbody) return;
    const month = document.getElementById('salaryReportMonth')?.value;
    if (!month) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted p-2">Select a month</td></tr>';
        return;
    }
    try {
        const snap = await schoolData('payroll').where('month', '==', month).get();
        if (snap.empty) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted p-2">No payroll data for this month.</td></tr>';
            document.getElementById('salRepPaidCount').textContent = '0';
            document.getElementById('salRepTotalExpend').textContent = '\u20B90';
            return;
        }
        const records = snap.docs.map(d => d.data());
        const deptMap = {};
        let totalExpend = 0, paidCount = 0;
        records.forEach(r => {
            const dept = r.department || 'Unassigned';
            if (!deptMap[dept]) deptMap[dept] = { count: 0, earnings: 0, deductions: 0, netPay: 0 };
            deptMap[dept].count++;
            deptMap[dept].earnings += r.earnings || 0;
            deptMap[dept].deductions += r.deductions || 0;
            deptMap[dept].netPay += r.netPay || 0;
            totalExpend += r.netPay || 0;
            if (r.status === 'Paid') paidCount++;
        });

        document.getElementById('salRepPaidCount').textContent = paidCount;
        document.getElementById('salRepTotalExpend').textContent = formatPayCurrency(totalExpend);

        tbody.innerHTML = Object.entries(deptMap).map(([dept, d]) => `<tr>
            <td><strong>${dept}</strong></td>
            <td class="text-center">${d.count}</td>
            <td class="text-right">${formatPayCurrency(d.earnings)}</td>
            <td class="text-right">${formatPayCurrency(d.deductions)}</td>
            <td class="text-right"><strong>${formatPayCurrency(d.netPay)}</strong></td>
        </tr>`).join('');
    } catch (e) {
        console.error('Error loading salary report:', e);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-red p-2">Error loading report</td></tr>';
    }
}
