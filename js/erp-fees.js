// ERP Fees Module - Comprehensive Version
async function initERPFees() {
    console.log('ERP Fees Module Initialized');

    // 1. Legacy Fee Support (from settings)
    const doc = await schoolDoc('settings', 'fees').get();
    if (doc.exists) {
        window.feeStructure = doc.data();
    }

    // 2. Initialize Searchable Selects
    if (typeof initSearchableSelect === 'function') {
        // 1. Fee Search Select
        initSearchableSelect('feeSearchSidContainer', window.allStudents || [], (s) => {
            document.getElementById('feeSearchSid').value = s.studentId || s.student_id;
            if (typeof searchStudentFees === 'function') searchStudentFees();
        });

        // 2. Fee Collection Select (only if container exists and is visible)
        const collectorContainer = document.getElementById('feeCollectorSidContainer');
        if (collectorContainer) {
            initSearchableSelect('feeCollectorSidContainer', window.allStudents || [], (s) => {
                document.getElementById('feeCollectorSid').value = s.studentId || s.student_id;
                if (typeof loadStudentLedgerData === 'function') loadStudentLedgerData(s.studentId || s.student_id);
            });
        }
    }

    // 3. Initialize Shared Session Dropdowns
    const duesSession = document.getElementById('duesSessionFilter');
    const pnpSession = document.getElementById('pnpSessionFilter');
    const fmSession = document.getElementById('feeMasterSessionFilter');
    const bdSession = document.getElementById('bdSession');
    const cfFromSession = document.getElementById('cfFromSession');
    const cfToSession = document.getElementById('cfToSession');
    const mpvSession = document.getElementById('mpvSession');
    const mpvClass = document.getElementById('mpvClass');

    if (duesSession || pnpSession || fmSession) {
        try {
            const snap = await schoolData('sessions').orderBy('name', 'desc').get();
            const sessionHtml =
                '<option value="">Select Session</option>' +
                snap.docs.map((doc) => `<option value="${doc.id}">${doc.data().name}</option>`).join('');

            if (duesSession) duesSession.innerHTML = sessionHtml;
            if (fmSession) fmSession.innerHTML = sessionHtml;
            if (pnpSession) pnpSession.innerHTML = sessionHtml;
            if (bdSession) bdSession.innerHTML = sessionHtml;
            if (cfFromSession) cfFromSession.innerHTML = sessionHtml;
            if (cfToSession) cfToSession.innerHTML = sessionHtml;
            if (mpvSession) mpvSession.innerHTML = sessionHtml;

            // Session Change Listeners
            [duesSession, pnpSession, fmSession, mpvSession].forEach((el) => {
                if (!el) return;
                el.addEventListener('change', async () => {
                    // For mpvSession, target is mpvClass
                    if (el.id === 'mpvSession') {
                        if (mpvClass && el.value) {
                            const classSnap = await schoolData('classes')
                                .where('sessionId', '==', el.value)
                                .orderBy('sortOrder', 'asc')
                                .get();
                            mpvClass.innerHTML =
                                '<option value="">All Classes</option>' +
                                classSnap.docs
                                    .filter((c) => !c.data().disabled)
                                    .map((c) => `<option value="${c.data().name}">${c.data().name}</option>`)
                                    .join('');
                        }
                        return;
                    }
                    const prefix = el.id.replace('SessionFilter', '');
                    const classEl = document.getElementById(`${prefix}ClassFilter`);
                    if (classEl && el.value) {
                        const classSnap = await schoolData('classes')
                            .where('sessionId', '==', el.value)
                            .orderBy('sortOrder', 'asc')
                            .get();
                        classEl.innerHTML =
                            '<option value="">All Classes</option>' +
                            classSnap.docs
                                .filter((c) => !c.data().disabled)
                                .map((c) => `<option value="${c.data().name}">${c.data().name}</option>`)
                                .join('');
                    }
                    if (el.id === 'feeMasterSessionFilter') loadFeeMaster();
                });
            });
        } catch (e) {
            console.error('Error loading sessions:', e);
        }
    }

    // 4. Load Fine Rules
    loadFineRules();
    loadFineRulesWithEnforce();
}

// ===================== FEE SELECTION & MANUAL ALLOCATION =====================

function toggleAllFeeSelection(masterCb) {
    document.querySelectorAll('.fee-select-cb').forEach(cb => {
        cb.checked = masterCb.checked;
    });
    updateSelectedFeeTotal();
}

function updateSelectedFeeTotal() {
    let total = 0;
    document.querySelectorAll('.fee-select-cb:checked').forEach(cb => {
        total += parseFloat(cb.dataset.due) || 0;
    });
    const el = document.getElementById('selectedFeeTotal');
    if (el) el.textContent = '\u20B9' + total.toLocaleString();
    // Auto-fill payment amount
    const amtInput = document.getElementById('payAmount');
    if (amtInput && total > 0) amtInput.value = total;
}

function getSelectedFeeIds() {
    const ids = [];
    document.querySelectorAll('.fee-select-cb:checked').forEach(cb => {
        ids.push(cb.dataset.feeId);
    });
    return ids;
}

// ===================== DUAL STUDENT SEARCH (matches Education Desk) =====================

function toggleFeeSearchMode(mode) {
    const quickBox = document.getElementById('feeQuickSearchBox');
    const dropdownBox = document.getElementById('feeDropdownSearchBox');
    if (mode === 'quick') {
        quickBox.classList.remove('hidden');
        dropdownBox.classList.add('hidden');
    } else {
        quickBox.classList.add('hidden');
        dropdownBox.classList.remove('hidden');
    }
}

let feeQuickSearchTimeout = null;
async function handleFeeQuickSearch(query) {
    const resultsDiv = document.getElementById('feeQuickSearchResults');
    const sidInput = document.getElementById('feeCollectorSid');
    if (!query || query.length < 2) {
        resultsDiv.classList.add('hidden');
        resultsDiv.innerHTML = '';
        return;
    }

    clearTimeout(feeQuickSearchTimeout);
    feeQuickSearchTimeout = setTimeout(async () => {
        try {
            const q = query.toLowerCase();
            const snap = await schoolData('students').limit(50).get();
            const matches = snap.docs.filter(doc => {
                const s = doc.data();
                const searchable = [
                    s.name, s.studentId, s.student_id, s.admNo,
                    s.fatherName, s.mobile, s.phone, s.fatherPhone
                ].filter(Boolean).join(' ').toLowerCase();
                return searchable.includes(q);
            }).slice(0, 15);

            if (matches.length === 0) {
                resultsDiv.innerHTML = '<div class="p-1 text-sm text-muted">No students found</div>';
                resultsDiv.classList.remove('hidden');
                return;
            }

            resultsDiv.innerHTML = matches.map(doc => {
                const s = doc.data();
                const sid = s.studentId || s.student_id || doc.id;
                return `<div class="p-1 cursor-pointer" style="border-bottom:1px solid var(--border)"
                    onclick="selectFeeQuickStudent('${sid}', '${(s.name || '').replace(/'/g, '\\\'')}', '${(s.class || '')}')"
                    onmouseover="this.style.background='var(--bg-slate-light)'"
                    onmouseout="this.style.background='transparent'">
                    <div class="font-bold text-sm">${s.name || 'Unknown'}</div>
                    <div class="text-xs text-muted">${sid} | ${s.class || ''} | ${s.fatherName || ''} | ${s.mobile || ''}</div>
                </div>`;
            }).join('');
            resultsDiv.classList.remove('hidden');
        } catch (e) {
            console.error('Quick search error:', e);
        }
    }, 300);
}

async function selectFeeQuickStudent(sid, name, cls) {
    const resultsDiv = document.getElementById('feeQuickSearchResults');
    const input = document.getElementById('feeQuickSearchInput');
    const sidInput = document.getElementById('feeCollectorSid');
    input.value = `${name} (${sid})`;
    sidInput.value = sid;
    resultsDiv.classList.add('hidden');
    // Load the student's ledger
    if (typeof loadStudentLedgerData === 'function') {
        loadStudentLedgerData(sid);
    }
}

// ===================== LEGACY FEE GENERATION & SEARCH =====================

async function loadClassesForDues() {
    const session = document.getElementById('duesSessionFilter').value;
    const classFilter = document.getElementById('duesClassFilter');
    if (!classFilter) return;
    if (!session) {
        classFilter.innerHTML = '<option value="">Select Session First</option>';
        return;
    }
    try {
        const snap = await schoolData('classes')
            .where('sessionId', '==', session)
            .orderBy('sortOrder', 'asc')
            .get();
        classFilter.innerHTML = '<option value="">All Classes</option>' +
            snap.docs.filter(c => !c.data().disabled).map(c =>
                `<option value="${c.data().name}">${c.data().name}</option>`
            ).join('');
    } catch (e) {
        console.error('Error loading classes for dues:', e);
        classFilter.innerHTML = '<option value="">Error loading classes</option>';
    }
}

async function handleMonthlyFeeGenerate(e) {
    e.preventDefault();
    const sclass = document.getElementById('genFeeClass').value;
    const month = document.getElementById('genFeeMonth').value;

    if (!sclass || !month) {
        showToast('Please select class and month', 'error');
        return;
    }

    const [year, monthNum] = month.split('-');
    const monthName = new Date(year, monthNum - 1).toLocaleString('default', { month: 'long' });

    setLoading(true);
    try {
        const studentsSnap = await schoolData('students').where('class', '==', sclass).get();
        if (studentsSnap.empty) {
            showToast('No students found in this class', 'error');
            setLoading(false);
            return;
        }

        // Read fee amounts from feeStructures collection (not legacy settings/fees)
        const feeStructSnap = await schoolData('feeStructures')
            .where('class', '==', sclass)
            .get();
        const feeAmounts = {};
        feeStructSnap.forEach(doc => {
            const fs = doc.data();
            feeAmounts[fs.feeType] = fs.amount || 0;
        });

        // Fallback: if no feeStructures defined for this class, try legacy settings
        if (Object.keys(feeAmounts).length === 0) {
            const safeId = sclass.replace(/\s+/g, '_').toLowerCase();
            const legacyAmount = (window.feeStructure && window.feeStructure[safeId + '_monthly']) || 0;
            if (legacyAmount > 0) {
                feeAmounts['Tuition Fee'] = legacyAmount;
            } else {
                showToast('No fee structure found for this class. Define fees in Fee Master first.', 'error');
                setLoading(false);
                return;
            }
        }

        const batch = (window.db || firebase.firestore()).batch();
        let count = 0;

        studentsSnap.forEach((doc) => {
            const student = doc.data();
            const sid = student.studentId || student.student_id;

            // Create a fee record for each fee type defined in feeStructures
            Object.entries(feeAmounts).forEach(([feeType, amount]) => {
                if (amount <= 0) return;
                const feeId = `${sid}_${month}_${feeType.replace(/\s+/g, '_')}`;
                const feeRef = schoolDoc('fees', feeId);
                batch.set(
                    feeRef,
                    withSchool({
                        studentId: sid,
                        class: sclass,
                        month: monthName,
                        year: year,
                        amount: amount,
                        paidAmount: 0,
                        status: 'pending',
                        feeType: feeType,
                        frequency: 'Monthly',
                        dueDate: `${year}-${monthNum}-10`,
                        discount: 0
                    }),
                    { merge: true }
                );
                count++;
            });
        });

        await batch.commit();
        showToast(`Generated ${count} fee records for ${monthName} ${year}`);
    } catch (e) {
        showToast('Error generating fees: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

async function searchStudentFees() {
    const sid = document.getElementById('feeSearchSid').value.trim();
    if (!sid) return;
    const resultsDiv = document.getElementById('feeSearchResults');
    resultsDiv.innerHTML = '<div class="p-4 text-center"><i class="fas fa-spinner fa-spin"></i> Fetching lifecycle data...</div>';

    try {
        const data = await PaymentService.getStudentLedger(sid);
        if (data.ledger.length === 0) {
            resultsDiv.innerHTML = '<div class="p-4 text-center">No fee records found for this student.</div>';
            return;
        }

        // Summary Bar (Competitor benchmark)
        let html = `
            <div class="grid-4 gap-1 p-1-5 bg-slate-50 border-bottom">
                <div class="text-center"><p class="text-xs text-muted mb-0-25">Total Payable</p><p class="font-700 text-lg">₹${data.summary.total}</p></div>
                <div class="text-center"><p class="text-xs text-muted mb-0-25">Total Paid</p><p class="font-700 text-lg text-emerald-600">₹${data.summary.paid}</p></div>
                <div class="text-center"><p class="text-xs text-muted mb-0-25">Discounts</p><p class="font-700 text-lg text-amber-600">₹${data.summary.discount}</p></div>
                <div class="text-center"><p class="text-xs text-muted mb-0-25">Balance Due</p><p class="font-800 text-lg text-rose-600">₹${data.summary.balance}</p></div>
            </div>
            <div class="table-container">
                <table class="portal-table">
                    <thead>
                        <tr>
                            <th>Fee Type</th>
                            <th>Freq</th>
                            <th>Month/Year</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Amount</th>
                            <th>Paid</th>
                            <th>Discount</th>
                            <th>Due</th>
                            <th class="text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.ledger.forEach((f) => {
            const statusColor = f.status === 'paid' ? '#10b981' : f.status === 'partial' ? '#f59e0b' : '#ef4444';
            const due = f.amount - (f.paidAmount || 0) - (f.discount || 0);
            
            html += `
                <tr>
                    <td class="font-600">${f.feeType}</td>
                    <td><span class="text-xs px-0-5 py-0-25 bg-slate-100 border-radius-4">${f.frequency}</span></td>
                    <td class="whitespace-nowrap">${f.month} ${f.year}</td>
                    <td>${f.dueDate}</td>
                    <td><span class="badge" style="background:${statusColor}; color:white;">${f.status}</span></td>
                    <td class="font-600">₹${f.amount}</td>
                    <td class="text-emerald-500">₹${f.paidAmount || 0}</td>
                    <td class="text-amber-500">₹${f.discount || 0}</td>
                    <td class="text-rose-500 font-700">₹${due > 0 ? due : 0}</td>
                    <td class="text-right">
                        ${due > 0 ? `<button onclick="openPaymentModal('${f.id}', ${f.amount}, ${f.paidAmount || 0})" class="btn-portal btn-sm btn-primary">Pay</button>` : '<i class="fas fa-check-circle text-emerald-500"></i>'}
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        resultsDiv.innerHTML = html;
    } catch (e) {
        resultsDiv.innerHTML = `<div class="p-4 text-center text-rose-500">Error: ${e.message}</div>`;
    }
}

function openPaymentModal(feeId, total, paid) {
    const due = total - paid;
    const html = `
        <div class="form-group"><label>Amount to Pay (Due: ₹${due})</label><input type="number" id="payAmountInput" value="${due}" max="${due}" min="1"></div>
        <div class="form-group"><label>Payment Method</label><select id="payMethodInput"><option value="Cash">Cash</option><option value="UPI">UPI / Online</option><option value="Bank">Bank Transfer</option></select></div>
        <button onclick="submitFeePayment('${feeId}')" class="btn-portal btn-primary" style="width:100%;">Confirm Payment</button>
    `;
    if (typeof openCmsModal === 'function') {
        document.getElementById('cmsModalTitle').textContent = 'Process Payment';
        document.getElementById('cmsModalBody').innerHTML = html;
        document.getElementById('cmsModal').style.display = 'block';
    }
}

async function submitFeePayment(feeId) {
    const amountToPay = parseFloat(document.getElementById('payAmountInput').value);
    const method = document.getElementById('payMethodInput').value;
    if (isNaN(amountToPay) || amountToPay <= 0) {
        showToast('Invalid amount', 'error');
        return;
    }

    // Find studentId from the fee record
    const feeDoc = await schoolDoc('fees', feeId).get();
    if (!feeDoc.exists) {
        showToast('Fee record not found', 'error');
        return;
    }
    const feeData = feeDoc.data();
    const studentId = feeData.studentId;

    if (!studentId) {
        showToast('Student ID not found in fee record', 'error');
        return;
    }

    setLoading(true);
    try {
        // Use unified PaymentService (writes to feePayments only)
        const result = await PaymentService.recordPayment({
            studentId: studentId,
            amount: amountToPay,
            method: method,
            session: feeData.session || '',
            reference: '',
            remarks: 'Quick Payment'
        });

        showToast('Payment recorded: ' + result.receiptNo, 'success');
        if (typeof closeCmsModal === 'function') closeCmsModal();
        searchStudentFees();
    } catch (e) {
        showToast('Payment failed: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

// ===================== FEE DUES / DEFAULTER TOOL =====================

async function loadFeeDues() {
    const session = document.getElementById('duesSessionFilter').value;
    const cls = document.getElementById('duesClassFilter').value;
    const fromDate = document.getElementById('duesFromDate').value;
    const toDate = document.getElementById('duesToDate').value;
    const includePrev = document.getElementById('duesIncludePrevYear').checked;
    const viewMode = document.getElementById('duesViewMode').value;
    const body = document.getElementById('feeDuesTableBody');
    const summary = document.getElementById('duesSummaryBar');

    if (!session) {
        showToast('Please select a session', 'error');
        return;
    }
    body.innerHTML =
        '<tr><td colspan="8" style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> Analyzing arrears...</td></tr>';

    try {
        let studentQuery = schoolData('students');
        if (cls) studentQuery = studentQuery.where('class', '==', cls);
        const studentSnap = await studentQuery.get();
        const studentMap = {};
        studentSnap.forEach((doc) => {
            const d = doc.data();
            studentMap[d.studentId || d.student_id] = d;
        });

        let feeQuery = schoolData('fees').where('status', 'in', ['pending', 'partial']);
        if (cls) feeQuery = feeQuery.where('class', '==', cls);
        const feeSnap = await feeQuery.get();

        // In-memory date filtering
        let feeDocs = [];
        feeSnap.forEach((doc) => {
            const f = { docId: doc.id, ...doc.data() };
            if (fromDate) {
                const genAt = f.generatedAt?.toDate ? f.generatedAt.toDate() : new Date(f.generatedAt);
                if (isNaN(genAt.getTime()) || genAt < new Date(fromDate)) return;
            }
            if (toDate) {
                const genAt = f.generatedAt?.toDate ? f.generatedAt.toDate() : new Date(f.generatedAt);
                const end = new Date(toDate);
                end.setHours(23, 59, 59);
                if (isNaN(genAt.getTime()) || genAt > end) return;
            }
            feeDocs.push(f);
        });

        // Build defaulter data
        const defaulters = {};
        let totalOutstanding = 0;

        feeDocs.forEach((f) => {
            const sid = f.studentId;
            if (!sid) return;
            if (!defaulters[sid]) {
                defaulters[sid] = {
                    sid: sid,
                    totalDue: 0,
                    months: [],
                    student: studentMap[sid] || { name: 'Unknown Student', fatherName: 'N/A', mobile: 'N/A' },
                };
            }
            const due = (f.amount || 0) - (f.paidAmount || 0);
            if (due <= 0) return;
            defaulters[sid].totalDue += due;
            defaulters[sid].months.push({ ...f, docId: f.docId, dueAmount: due });
            totalOutstanding += due;
        });

        const defaulterList = Object.values(defaulters).sort((a, b) => b.totalDue - a.totalDue);
        if (defaulterList.length === 0) {
            body.innerHTML = '<tr><td colspan="8" style="text-align:center;">No pending dues found.</td></tr>';
            summary.style.display = 'none';
            return;
        }

        summary.style.display = 'grid';
        document.getElementById('duesTotalDefaulters').textContent = defaulterList.length;
        document.getElementById('duesTotalAmount').textContent = `\u20B9${totalOutstanding.toLocaleString()}`;
        window.currentDefaulters = defaulterList;

        if (viewMode === 'fee') {
            // Fee-wise: each row is a fee type for a student
            const flatRows = [];
            defaulterList.forEach((d) => {
                d.months.forEach((m) => {
                    flatRows.push({ student: d.student, sid: d.sid, feeType: m.feeType, month: m.month, amount: m.amount, dueAmount: m.dueAmount });
                });
            });
            body.innerHTML = flatRows
                .map((item) => {
                    const s = item.student;
                    return `<tr>
                        <td>${item.sid}</td>
                        <td>${s.name || '--'}</td>
                        <td>${s.class || '--'}</td>
                        <td>${s.fatherName || '--'}</td>
                        <td>${s.mobile || '--'}</td>
                        <td>${item.feeType} ${item.month ? '(' + item.month.substring(0, 3) + ')' : ''}: \u20B9${item.dueAmount.toLocaleString()}</td>
                        <td><input type="text" class="form-control form-control-sm" placeholder="Remark" id="remarks_${item.sid}" style="width:100px" /></td>
                        <td class="text-right">
                            <button class="btn-icon" onclick="saveStudentRemarks('${item.sid}')" title="Save remark"><i class="fas fa-save"></i></button>
                            <button class="btn-icon" onclick="sendSmsAlert('${item.sid}', '${(s.mobile || '').replace(/'/g, '\\\'')}')" title="Send SMS"><i class="fas fa-sms"></i></button>
                        </td>
                    </tr>`;
                })
                .join('');
        } else {
            // Student-wise (default)
            body.innerHTML = defaulterList
                .map((item) => {
                    const s = item.student;
                    return `<tr>
                        <td>${item.sid}</td>
                        <td><strong>${s.name || '--'}</strong></td>
                        <td>${s.class || '--'}</td>
                        <td>${s.fatherName || '--'}</td>
                        <td>${s.mobile || '--'}</td>
                        <td>\u20B9${item.totalDue.toLocaleString()}</td>
                        <td><input type="text" class="form-control form-control-sm" placeholder="Remark" id="remarks_${item.sid}" style="width:100px" /></td>
                        <td class="text-right">
                            <button class="btn-icon" onclick="saveStudentRemarks('${item.sid}')" title="Save remark"><i class="fas fa-save"></i></button>
                            <button class="btn-icon" onclick="sendSmsAlert('${item.sid}', '${(s.mobile || '').replace(/'/g, '\\\'')}')" title="Send SMS"><i class="fas fa-sms"></i></button>
                            <button onclick="viewDuesBreakdown('${item.sid}')" class="btn-portal btn-sm">Detail</button>
                        </td>
                    </tr>`;
                })
                .join('');
        }
    } catch (e) {
        console.error(e);
        body.innerHTML = '<tr><td colspan="8" class="text-center text-red">Error loading dues</td></tr>';
    }
}

async function viewDuesBreakdown(sid) {
    const d = window.currentDefaulters?.find((def) => def.sid === sid);
    if (!d) return;
    const body = d.months
        .map(
            (f) =>
                `<tr><td>${f.month} ${f.year}</td><td>\u20B9${f.amount}</td><td>\u20B9${f.paidAmount || 0}</td><td>\u20B9${f.dueAmount}</td></tr>`
        )
        .join('');
    const html = `<table class="portal-table"><thead><tr><th>Month</th><th>Amount</th><th>Paid</th><th>Due</th></tr></thead><tbody>${body}</tbody></table>`;
    if (typeof openCmsModal === 'function') {
        document.getElementById('cmsModalTitle').textContent = `Breakdown: ${d.student.name}`;
        document.getElementById('cmsModalBody').innerHTML = html;
        document.getElementById('cmsModal').style.display = 'block';
    }
}

function exportDuesToExcel() {
    if (!window.currentDefaulters || window.currentDefaulters.length === 0) {
        showToast('No data to export', 'warning');
        return;
    }
    const viewMode = document.getElementById('duesViewMode').value;
    let data;
    if (viewMode === 'fee') {
        const flatRows = [];
        window.currentDefaulters.forEach((d) => {
            d.months.forEach((m) => {
                flatRows.push({
                    'Student ID': d.sid,
                    Name: d.student.name || '--',
                    Class: d.student.class || '--',
                    'Father\'s Name': d.student.fatherName || '--',
                    Phone: d.student.mobile || '--',
                    'Fee Type': m.feeType,
                    Month: m.month,
                    Amount: m.amount,
                    'Due Amount': m.dueAmount,
                });
            });
        });
        data = flatRows;
    } else {
        data = window.currentDefaulters.map((d) => ({
            'Student ID': d.sid,
            Name: d.student.name || '--',
            Class: d.student.class || '--',
            'Father\'s Name': d.student.fatherName || '--',
            Phone: d.student.mobile || '--',
            'Outstanding (INR)': d.totalDue,
            'Fee Types': d.months.map((m) => m.feeType).filter((v, i, a) => a.indexOf(v) === i).join(', '),
        }));
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    const sheetName = viewMode === 'fee' ? 'DueDetail' : 'Defaulters';
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `DefaulterList_${new Date().toISOString().substring(0, 10)}.xlsx`);
    showToast('Excel exported', 'success');
}

// ===================== PAYMENT REMARKS =====================

async function saveStudentRemarks(sid) {
    const input = document.getElementById(`remarks_${sid}`);
    if (!input) return;
    const remark = input.value.trim();
    if (!remark) {
        showToast('Enter a remark first', 'warning');
        return;
    }
    try {
        const existing = await schoolDoc('studentPaymentRemarks', sid).get();
        const base = existing.exists ? existing.data() : {};
        await schoolDoc('studentPaymentRemarks', sid).set(
            { ...base, sid: sid, remark: remark, updatedAt: firebase.firestore.FieldValue.serverTimestamp(), updatedBy: firebase.auth?.currentUser?.email || 'admin' },
            { merge: true }
        );
        showToast('Remark saved for ' + sid, 'success');
        input.dataset.saved = '1';
    } catch (e) {
        console.error('saveStudentRemarks:', e);
        showToast('Error saving remark', 'error');
    }
}

async function loadStudentRemarks(sid) {
    try {
        const snap = await schoolDoc('studentPaymentRemarks', sid).get();
        if (snap.exists) {
            const d = snap.data();
            const input = document.getElementById(`remarks_${sid}`);
            if (input) input.value = d.remark || '';
        }
    } catch (e) {
        // Silently fail
    }
}

// ===================== SMS ALERT PLACEHOLDER =====================

function sendSmsAlert(sid, mobile) {
    if (!mobile || mobile === 'N/A' || mobile === '--') {
        showToast('No mobile number available for ' + sid, 'warning');
        return;
    }
    showToast(`SMS will be sent to ${mobile} (future: Communication module)`, 'info');
}

// ===================== NEW COMPREHENSIVE FEE SYSTEM =====================

async function loadFeeMaster() {
    const session = document.getElementById('feeMasterSessionFilter').value;
    const cls = document.getElementById('feeMasterClassFilter').value;
    const tbody = document.getElementById('feeMasterTableBody');
    if (!session) return;
    tbody.innerHTML =
        '<tr><td colspan="7" class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
    try {
        let query = schoolData('feeStructures').where('sessionId', '==', session);
        if (cls) query = query.where('class', '==', cls);
        const snap = await query.get();
        if (snap.empty) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No structures found.</td></tr>';
            return;
        }
        tbody.innerHTML = snap.docs
            .map((doc) => {
                const d = doc.data();
                return `<tr><td><b>${d.feeType}</b></td><td>${d.class}</td><td>₹${d.amount}</td><td>${d.frequency || 'Monthly'}</td><td>${d.dueMonth || 'N/A'}</td><td>Active</td><td class="text-center"><button onclick="deleteFeeStructure('${doc.id}')" style="color:red;"><i class="fas fa-trash"></i></button></td></tr>`;
            })
            .join('');
    } catch (e) {
        console.error(e);
    }
}

function openAddFeeStructureModal() {
    const session = document.getElementById('feeMasterSessionFilter').value;
    if (!session) {
        showToast('Select session first', 'error');
        return;
    }
    const content = `
        <div style="padding:1rem;">
            <div class="form-group"><label>Fee Type</label><input type="text" id="mfName" class="form-control"></div>
            <div class="form-group"><label>Class</label><select id="mfClass" class="form-control">${document.getElementById('feeMasterClassFilter').innerHTML}</select></div>
            <div class="form-group"><label>Amount (₹)</label><input type="number" id="mfAmount" class="form-control"></div>
            <div class="form-group"><label>Frequency</label><select id="mfFreq" class="form-control"><option value="Monthly">Monthly</option><option value="Quarterly">Quarterly</option><option value="Yearly">Yearly</option></select></div>
            <button class="btn-portal btn-primary" style="width:100%;" onclick="saveFeeStructure()">Save</button>
        </div>
    `;
    openCmsModal('Add Fee Structure', content);
}

async function saveFeeStructure() {
    const data = {
        sessionId: document.getElementById('feeMasterSessionFilter').value,
        feeType: document.getElementById('mfName').value,
        class: document.getElementById('mfClass').value,
        amount: parseFloat(document.getElementById('mfAmount').value),
        frequency: document.getElementById('mfFreq').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    if (!data.feeType || !data.class || isNaN(data.amount)) return;
    try {
        await schoolData('feeStructures').add(data);
        closeCmsModal();
        loadFeeMaster();
    } catch (e) {
        console.error(e);
    }
}

async function deleteFeeStructure(id) {
    if (!await window.showConfirmModal({ title: 'Delete Fee Structure', message: 'Delete this fee structure?', icon: 'fa-coins', confirmText: 'Delete', danger: true })) return;
    try {
        await schoolDoc('feeStructures', id).delete();
        loadFeeMaster();
    } catch (e) {
    }
}

// ===================== COLLECTION DASHBOARD (Ledger & Payments) =====================

let activeStudentLedger = null;

async function loadStudentLedgerData(sid) {
    const infoBox = document.getElementById('fcStudentQuickInfo');
    const ledgerTable = document.getElementById('fcLedgerTableBody');
    const historyTable = document.getElementById('fcPaymentsTableBody');
    
    infoBox.style.display = 'none';
    ledgerTable.innerHTML = '<tr><td colspan="6" class="text-center">Loading...</td></tr>';
    
    try {
        // 1. Fetch Student Info (UI optimization: check if already in window.allStudents)
        const studentSnap = await schoolData('students').where('studentId', '==', sid).limit(1).get();
        if (studentSnap.empty) {
            ledgerTable.innerHTML = '<tr><td colspan="6" class="text-center">Student not found.</td></tr>';
            return;
        }
        const s = studentSnap.docs[0].data();
        document.getElementById('fcStudentName').textContent = s.name;
        document.getElementById('fcStudentClassSection').textContent = `Class ${s.class}`;
        infoBox.style.display = 'block';

        // 2. Fetch Ledger via Service
        const data = await PaymentService.getStudentLedger(sid);
        
        // 3. Render Ledger with checkboxes for pending/partial fees
        const pendingFees = data.ledger.filter(f => f.status !== 'paid');
        ledgerTable.innerHTML = data.ledger.length > 0
            ? (pendingFees.length > 0 ? `
                <tr style="background:var(--bg-slate-light)">
                    <td><input type="checkbox" id="selectAllFees" onchange="toggleAllFeeSelection(this)" /></td>
                    <td colspan="5" class="font-bold text-sm">
                        Select fees to pay:
                        <span id="selectedFeeTotal" class="text-primary ml-1">\u20B90</span>
                    </td>
                </tr>` : '') +
            data.ledger.map(f => {
                const due = f.amount - (f.paidAmount || 0);
                const canSelect = f.status !== 'paid' && due > 0;
                return `<tr>
                    <td>${canSelect ? `<input type="checkbox" class="fee-select-cb" data-fee-id="${f.id}" data-due="${due}" data-type="${f.feeType || 'Fee'}" data-month="${f.month}" data-year="${f.year || ''}" onchange="updateSelectedFeeTotal()" />` : ''}</td>
                    <td class="whitespace-nowrap">${f.month} ${f.year || ''}</td>
                    <td class="font-semibold">${f.feeType || 'Tuition Fee'}</td>
                    <td class="font-bold">\u20B9${f.amount}</td>
                    <td class="text-emerald-500">\u20B9${f.paidAmount || 0}</td>
                    <td class="text-rose-500">\u20B9${due}</td>
                    <td><span class="badge" style="background: ${f.status==='paid'?'#10b981':f.status==='partial'?'#f59e0b':'#ef4444'}">${f.status}</span></td>
                </tr>`;}).join('')
            : '<tr><td colspan="7" class="text-center p-8 text-slate-500">No fee records found for this student.</td></tr>';

        // 4. Render History
        historyTable.innerHTML = data.history.length > 0
            ? data.history.map(p => `
                <tr>
                    <td>${p.receiptNo}</td>
                    <td>${p.createdAt ? new Date(p.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                    <td>₹${p.amount}</td>
                    <td>${p.paymentMode}</td>
                    <td>
                        ${p.status === 'reverted'
                            ? '<span class="badge bg-red-1">REVERTED</span>'
                            : `<button onclick="printReceipt('${p.id}')" class="btn-icon" title="Print"><i class="fas fa-print"></i></button>
                               <button onclick="revertPayment('${p.id}')" class="btn-icon text-red" title="Revert"><i class="fas fa-undo"></i></button>`}
                    </td>
                </tr>`).join('')
            : '<tr><td colspan="5" class="text-center">No history</td></tr>';

        // 5. Update Totals
        document.getElementById('fcTotalFee').textContent = `₹${data.summary.total}`;
        document.getElementById('fcTotalPaid').textContent = `₹${data.summary.paid}`;
        document.getElementById('fcTotalBalance').textContent = `₹${data.summary.balance}`;

        activeStudentLedger = { sid, balance: data.summary.balance };

        // Load payment remarks
        const remarksTextarea = document.getElementById('studentPaymentRemarks');
        if (remarksTextarea) {
            const remarks = await loadStudentPaymentRemarks(sid);
            remarksTextarea.value = remarks;
        }

    } catch (e) {
        console.error('Error loading ledger:', e);
        showToast('Error loading ledger records', 'error');
    }
}

async function handleFeePayment(e) {
    if(e) e.preventDefault();
    if (!activeStudentLedger) {
        showToast('No student selected', 'error');
        return;
    }

    const amount = parseFloat(document.getElementById('payAmount').value);
    const mode = document.getElementById('payMode').value;
    const reference = document.getElementById('payRef')?.value || '';
    const remarks = document.getElementById('payRemarks')?.value || 'Dashboard Payment';
    const session = document.getElementById('feeMasterSessionFilter')?.value || '';

    // Get manually selected fee IDs (if any checkboxes are checked)
    const selectedFeeIds = getSelectedFeeIds();

    if (isNaN(amount) || amount <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }

    try {
        setLoading(true, 'Processing Payment...');
        const result = await PaymentService.recordPayment({
            studentId: activeStudentLedger.sid,
            amount: amount,
            method: mode,
            session: session,
            reference: reference,
            remarks: remarks,
            feeIds: selectedFeeIds.length > 0 ? selectedFeeIds : null
        });

        showToast(`Payment Recorded: ${result.receiptNo}`, 'success');
        
        // Refresh UI
        loadStudentLedgerData(activeStudentLedger.sid);
        
        // Print Receipt
        printReceipt(result.paymentId);
        
        // Clear input
        document.getElementById('payAmount').value = '';
        if (document.getElementById('payRef')) document.getElementById('payRef').value = '';
        if (document.getElementById('payRemarks')) document.getElementById('payRemarks').value = '';
    } catch (e) {
        console.error('Payment Error:', e);
        showToast('Failed to record payment: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

// ===================== RECEIPT & WORDS =====================

async function printReceipt(pid) {
    try {
        setLoading(true);
        window.currentReceiptId = pid;
        const pSnap = await schoolDoc('feePayments', pid).get();
        if (!pSnap.exists) throw new Error('Payment record not found');
        const p = pSnap.data();
        
        const sSnap = await schoolData('students').where('studentId', '==', p.studentId).limit(1).get();
        if (sSnap.empty) throw new Error('Student record not found');
        const s = sSnap.docs[0].data();
        
        const schSnap = await schoolRef().get();
        const sch = schSnap.exists ? schSnap.data() : {};

        // Populate School Info
        document.getElementById('rtcSchoolName').textContent = sch.schoolName || 'Our School';
        document.getElementById('rtcSchoolAddress').textContent = sch.address || 'School Address Not Set';
        document.getElementById('rtcSchoolContact').textContent = `Contact: ${sch.phone || '--'} | ${sch.email || '--'}`;
        
        // Populate Receipt Meta
        document.getElementById('rtcNo').textContent = p.receiptNo || pid.substring(0,8).toUpperCase();
        document.getElementById('rtcDate').textContent = p.createdAt ? new Date(p.createdAt.seconds * 1000).toLocaleDateString() : '--/--/----';
        document.getElementById('rtcSession').textContent = p.session || '2023-24';
        document.getElementById('rtcPayId').textContent = pid;
        document.getElementById('rtcMode').textContent = p.paymentMode || 'Cash';
        
        // Populate Student Info
        document.getElementById('rtcName').textContent = s.name;
        document.getElementById('rtcClass').textContent = `Class ${s.class || '--'} ${s.section || ''}`;
        document.getElementById('rtcAdm').textContent = s.studentId || s.student_id;
        document.getElementById('rtcFName').textContent = s.fatherName || '--';
        if (document.getElementById('rtcRoll')) document.getElementById('rtcRoll').textContent = s.rollNo || '--';
        
        // Populate Table (Itemized Allocations)
        const tableBody = document.getElementById('rtcTableBody');
        const allocations = p.allocations || [];
        
        if (allocations.length > 0) {
            tableBody.innerHTML = allocations.map((alt, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${alt.feeType} - ${alt.month} ${alt.year}</td>
                    <td style="text-align: right;">₹${alt.amount}</td>
                    <td style="text-align: right;">₹0</td>
                    <td style="text-align: right;">₹${alt.remainingAfter + alt.paidNow}</td>
                    <td style="text-align: right; font-weight: bold;">₹${alt.paidNow}</td>
                </tr>
            `).join('');
        } else {
            tableBody.innerHTML = `
                <tr>
                    <td>1</td>
                    <td>School Fee Payment (Towards Outstanding Dues)</td>
                    <td style="text-align: right;">₹${p.amount}</td>
                    <td style="text-align: right;">₹0</td>
                    <td style="text-align: right;">₹${p.amount}</td>
                    <td style="text-align: right; font-weight: bold;">₹${p.amount}</td>
                </tr>
            `;
        }
        
        // Totals & Footer Info
        const currentBalance = (window.activeStudentLedger && window.activeStudentLedger.balance) || 0;
        document.getElementById('rtcTotalFee').textContent = `₹${p.amount}`;
        document.getElementById('rtcPaid').textContent = `₹${p.amount}`;
        document.getElementById('rtcAmountWords').textContent = numberToWords(p.amount) + ' Rupees Only';
        document.getElementById('rtcRemarks').textContent = p.remarks || 'Payment received with thanks.';
        document.getElementById('rtcTime').textContent = p.createdAt ? new Date(p.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
        
        // Match competitor's data points
        if (document.getElementById('rtcCurrentDues')) document.getElementById('rtcCurrentDues').textContent = `₹${currentBalance}`;
        if (document.getElementById('rtcReceivedAmount')) document.getElementById('rtcReceivedAmount').textContent = `₹${p.amount}`;

        const area = document.getElementById('feeReceiptPrintTemplate');
        area.classList.remove('hidden');
        area.style.display = 'block';
        
        setTimeout(() => {
            window.print();
            area.style.display = 'none';
            area.classList.add('hidden');
        }, 500);

    } catch (e) {
        console.error('printReceipt error:', pid, e);
        showToast('Error printing receipt: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

// ===================== PDF RECEIPT EXPORT =====================

async function exportReceiptPDF(pid) {
    try {
        setLoading(true);
        const pSnap = await schoolDoc('feePayments', pid).get();
        if (!pSnap.exists) throw new Error('Payment record not found');
        const p = pSnap.data();

        const sSnap = await schoolData('students').where('studentId', '==', p.studentId).limit(1).get();
        if (sSnap.empty) throw new Error('Student record not found');
        const s = sSnap.docs[0].data();

        const schSnap = await schoolRef().get();
        const sch = schSnap.exists ? schSnap.data() : {};

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        const pageW = doc.internal.pageSize.getWidth();
        const margin = 15;
        let y = 18;

        // School Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(sch.schoolName || 'School Name', pageW / 2, y, { align: 'center' });
        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(sch.address || 'School Address', pageW / 2, y, { align: 'center' });
        y += 4;
        doc.text(`Contact: ${sch.phone || '--'} | ${sch.email || '--'}`, pageW / 2, y, { align: 'center' });
        y += 6;

        // Divider
        doc.setLineWidth(0.4);
        doc.line(margin, y, pageW - margin, y);
        y += 7;

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.text('FEE RECEIPT', pageW / 2, y, { align: 'center' });
        y += 8;

        // Meta Info
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const meta = [
            ['Receipt No:', p.receiptNo || pid.substring(0, 8).toUpperCase()],
            ['Date:', p.createdAt ? new Date(p.createdAt.seconds * 1000).toLocaleDateString() : '--'],
            ['Session:', p.session || '--'],
            ['Payment Mode:', p.paymentMode || 'Cash'],
            ['Transaction ID:', p.transactionId || '--'],
        ];
        meta.forEach(([k, v]) => {
            doc.setFont('helvetica', 'bold');
            doc.text(k, margin, y);
            doc.setFont('helvetica', 'normal');
            doc.text(String(v), margin + 35, y);
            y += 5;
        });
        y += 3;

        // Student Info
        doc.setFont('helvetica', 'bold');
        doc.text('Student Details', margin, y);
        y += 5;
        doc.setLineWidth(0.2);
        doc.line(margin, y, pageW - margin, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        const studentInfo = [
            ['Name:', s.name],
            ['Admission No:', s.studentId || s.student_id || '--'],
            ['Class:', `${s.class || '--'} ${s.section || ''}`],
            ['Father\'s Name:', s.fatherName || '--'],
            ['Roll No:', s.rollNo || '--'],
        ];
        studentInfo.forEach(([k, v]) => {
            doc.setFont('helvetica', 'bold');
            doc.text(k, margin, y);
            doc.setFont('helvetica', 'normal');
            doc.text(String(v), margin + 35, y);
            y += 5;
        });
        y += 3;

        // Allocations Table
        const allocations = p.allocations || [];
        let body = [];
        if (allocations.length > 0) {
            body = allocations.map((alt, i) => [
                i + 1,
                `${alt.feeType} - ${alt.month} ${alt.year}`,
                `\u20B9${(alt.amount || 0).toLocaleString()}`,
                `\u20B9${(alt.paidNow || 0).toLocaleString()}`,
            ]);
        } else {
            body = [[1, 'School Fee Payment', `\u20B9${(p.amount || 0).toLocaleString()}`, `\u20B9${(p.amount || 0).toLocaleString()}`]];
        }

        doc.autoTable({
            startY: y,
            head: [['#', 'Fee Description', 'Amount', 'Paid']],
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
            margin: { left: margin, right: margin },
            styles: { fontSize: 9, cellPadding: 2 },
            columnStyles: { 0: { cellWidth: 10 }, 2: { halign: 'right' }, 3: { halign: 'right' } },
        });

        y = doc.lastAutoTable.finalY + 6;

        // Totals
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(`Total Paid: \u20B9${(p.amount || 0).toLocaleString()}`, pageW - margin, y, { align: 'right' });
        y += 6;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.text(`In Words: ${numberToWords(p.amount || 0)} Rupees Only`, margin, y);
        y += 5;
        doc.text(`Remarks: ${p.remarks || 'Payment received with thanks.'}`, margin, y);
        y += 10;

        // Footer
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, y);
        doc.text('Authorized Signatory', pageW - margin, y, { align: 'right' });

        // Save
        const filename = `Receipt-${p.receiptNo || pid.substring(0, 8)}-${s.name.replace(/\s+/g, '_')}.pdf`;
        doc.save(filename);
        showToast('PDF downloaded: ' + filename, 'success');
    } catch (e) {
        console.error('exportReceiptPDF error:', e);
        showToast('Error generating PDF: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

function closeReceipt() {
    const area = document.getElementById('feeReceiptPrintTemplate');
    if (area) {
        area.style.display = 'none';
        area.classList.add('hidden');
    }
    window.currentReceiptId = null;
}

window.exportReceiptPDF = exportReceiptPDF;
window.closeReceipt = closeReceipt;

function numberToWords(n) {
    const a = [
        '',
        'One ',
        'Two ',
        'Three ',
        'Four ',
        'Five ',
        'Six ',
        'Seven ',
        'Eight ',
        'Nine ',
        'Ten ',
        'Eleven ',
        'Twelve ',
        'Thirteen ',
        'Fourteen ',
        'Fifteen ',
        'Sixteen ',
        'Seventeen ',
        'Eighteen ',
        'Nineteen ',
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    let num = n.toString();
    if (num.length > 9) return 'overflow';
    let grps = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!grps) return '';
    let str = '';
    str += grps[1] != 0 ? (a[Number(grps[1])] || b[grps[1][0]] + ' ' + a[grps[1][1]]) + 'Crore ' : '';
    str += grps[2] != 0 ? (a[Number(grps[2])] || b[grps[2][0]] + ' ' + a[grps[2][1]]) + 'Lakh ' : '';
    str += grps[3] != 0 ? (a[Number(grps[3])] || b[grps[3][0]] + ' ' + a[grps[3][1]]) + 'Thousand ' : '';
    str += grps[4] != 0 ? (a[Number(grps[4])] || b[grps[4][0]] + ' ' + a[grps[4][1]]) + 'Hundred ' : '';
    str += grps[5] != 0 ? (str != '' ? 'and ' : '') + (a[Number(grps[5])] || b[grps[5][0]] + ' ' + a[grps[5][1]]) : '';
    return str.trim();
}

// ===================== BULK EXTRA FEE & FINE RULES =====================

async function applyBulkExtraFee() {
    const session = document.getElementById('befSession').value;
    const cls = document.getElementById('befClass').value;
    const type = document.getElementById('befType').value;
    const amount = parseFloat(document.getElementById('befAmount').value);
    const dueDate = document.getElementById('befDueDate').value;

    if (!session || !cls || !type || isNaN(amount)) {
        showToast('Please fill all fields correctly', 'error');
        return;
    }

    if (!await window.showConfirmModal({ title: 'Apply Bulk Charge', message: 'Apply charge of \u20B9' + amount + ' (' + type + ') to all students in ' + cls + '?', icon: 'fa-money-bill-wave', confirmText: 'Apply' })) return;

    setLoading(true, 'Applying bulk charges...');
    try {
        const studentsSnap = await schoolData('students').where('class', '==', cls).get();
        if (studentsSnap.empty) {
            showToast('No students found in this class', 'error');
            return;
        }

        // Deduplication: check for existing extra fees of same type in current month
        const now = new Date();
        const monthName = now.toLocaleString('default', { month: 'long' });
        const year = String(now.getFullYear());
        const existingFeesSnap = await schoolData('fees')
            .where('class', '==', cls)
            .where('month', '==', monthName)
            .where('year', '==', year)
            .where('feeType', '==', type)
            .where('frequency', '==', 'One-off')
            .get();

        const existingStudentIds = new Set();
        existingFeesSnap.forEach(doc => {
            existingStudentIds.add(doc.data().studentId);
        });

        if (existingStudentIds.size > 0) {
            const proceed = confirm(
                `${type} already exists for ${existingStudentIds.size} student(s) in ${monthName} ${year}. ` +
                'Adding again will create duplicate charges. Continue anyway?'
            );
            if (!proceed) {
                setLoading(false);
                return;
            }
        }

        const batch = (window.db || firebase.firestore()).batch();
        const monthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' });
        const [month, yr] = monthYear.split(' ');

        studentsSnap.forEach(doc => {
            const sid = doc.data().studentId || doc.data().student_id;
            const feeId = `${sid}_EXTRA_${Date.now()}_${Math.floor(Math.random()*1000)}`;
            const feeRef = schoolDoc('fees', feeId);
            
            batch.set(feeRef, withSchool({
                studentId: sid,
                class: cls,
                month: month,
                year: yr,
                amount: amount,
                paidAmount: 0,
                status: 'pending',
                feeType: type,
                frequency: 'One-off',
                dueDate: dueDate || '--',
                discount: 0
            }));
        });

        await batch.commit();
        showToast(`Successfully added "${type}" to ${studentsSnap.size} students`);
        
        // Reset form
        document.getElementById('befType').value = '';
        document.getElementById('befAmount').value = '';
    } catch (e) {
        showToast('Operation failed: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

async function saveFineRule() {
    const name = document.getElementById('lfrName').value;
    const grace = parseInt(document.getElementById('lfrGrace').value);
    const type = document.getElementById('lfrType').value;
    const amount = parseFloat(document.getElementById('lfrAmount').value);

    if (!name || isNaN(grace) || isNaN(amount)) {
        showToast('Please fill all rule fields', 'error');
        return;
    }

    setLoading(true);
    try {
        await schoolData('fineRules').add(withSchool({
            name, graceDays: grace, fineType: type, amount, active: true
        }));
        showToast('Fine rule saved successfully');
        loadFineRules();
    } catch (e) {
        showToast('Error saving rule: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

async function loadFineRules() {
    const tbody = document.getElementById('fineRulesTableBody');
    if (!tbody) return;
    try {
        const snap = await schoolData('fineRules').get();
        if (snap.empty) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center p-4">No rules defined</td></tr>';
            return;
        }
        tbody.innerHTML = snap.docs.map(doc => {
            const r = doc.data();
            return `
                <tr>
                    <td><b>${r.name}</b></td>
                    <td>${r.graceDays} Days</td>
                    <td class="capitalize">${r.fineType.replace('_', ' ')}</td>
                    <td>${r.fineType === 'percent' ? r.amount + '%' : '₹' + r.amount}</td>
                    <td class="text-center">
                        <button onclick="deleteFineRule('${doc.id}')" class="text-rose-500 btn-icon"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (e) {
        console.error(e);
    }
}

async function deleteFineRule(id) {
    if (!await window.showConfirmModal({ title: 'Delete Rule', message: 'Delete this rule?', icon: 'fa-ban', confirmText: 'Delete', danger: true })) return;
    try {
        await schoolDoc('fineRules', id).delete();
        loadFineRules();
    } catch (e) {}
}

// ===================== PARENTS NOT PAID TOOL =====================

async function loadParentsNotPaidTool() {
    const session = document.getElementById('pnpSessionFilter').value;
    const cls = document.getElementById('pnpClassFilter').value;
    const grid = document.getElementById('pnpArrearsGrid');
    if (!session) return;
    grid.innerHTML = 'Loading...';
    try {
        const studentSnap = await schoolData('students').get();
        const studentMap = {};
        studentSnap.forEach((d) => (studentMap[d.data().studentId || d.data().student_id] = d.data()));
        const feeSnap = await schoolData('fees').where('status', '!=', 'paid').get();
        const def = {};
        feeSnap.forEach((d) => {
            const f = d.data();
            const sid = f.studentId;
            if (!def[sid]) def[sid] = { sid, due: 0, s: studentMap[sid] };
            def[sid].due += f.amount - (f.paidAmount || 0);
        });
        const list = Object.values(def).filter((x) => x.s);
        grid.innerHTML = list
            .map(
                (i) =>
                    `<div class="card p-3"><b>${i.s.name}</b><br>Due: ₹${i.due}<br><a href="tel:${i.s.mobile}" class="btn-portal btn-sm mt-2">Call Parent</a></div>`
            )
            .join('');
    } catch (e) {
        console.error(e);
    }
}

// Exports
window.initERPFees = initERPFees;
window.handleMonthlyFeeGenerate = handleMonthlyFeeGenerate;
window.loadClassesForDues = loadClassesForDues;
window.searchStudentFees = searchStudentFees;
window.openPaymentModal = openPaymentModal;
window.submitFeePayment = submitFeePayment;
window.loadFeeDues = loadFeeDues;
window.viewDuesBreakdown = viewDuesBreakdown;
window.exportDuesToExcel = exportDuesToExcel;
window.loadFeeMaster = loadFeeMaster;
window.openAddFeeStructureModal = openAddFeeStructureModal;
window.saveFeeStructure = saveFeeStructure;
window.deleteFeeStructure = deleteFeeStructure;
window.loadStudentLedgerData = loadStudentLedgerData;
window.handleFeePayment = handleFeePayment;
window.saveStudentPaymentRemarks = saveStudentPaymentRemarks;
window.loadStudentPaymentRemarks = loadStudentPaymentRemarks;
window.revertPayment = revertPayment;
window.loadRevertedPayments = loadRevertedPayments;
window.saveStudentRemarks = saveStudentRemarks;
window.sendSmsAlert = sendSmsAlert;
window.loadMonthlyPaymentView = loadMonthlyPaymentView;

// ===================== MONTHLY PAYMENT VIEW =====================

async function loadMonthlyPaymentView() {
    const tbody = document.getElementById('monthlyPaymentViewBody');
    if (!tbody) return;
    const session = document.getElementById('mpvSession')?.value;
    const month = document.getElementById('mpvMonth')?.value;
    const cls = document.getElementById('mpvClass')?.value;

    if (!session || !month) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted p-2">Select session and month</td></tr>';
        return;
    }

    tbody.innerHTML = '<tr><td colspan="6" class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';

    try {
        // Get all students
        let studentQuery = schoolData('students');
        if (cls) studentQuery = studentQuery.where('class', '==', cls);
        const studentSnap = await studentQuery.get();

        // Get all fee records for this month
        let feeQuery = schoolData('fees')
            .where('session', '==', session)
            .where('month', '==', month);
        const feeSnap = await feeQuery.get();

        // Group fees by student
        const feesByStudent = {};
        feeSnap.forEach(doc => {
            const f = doc.data();
            if (f.status === 'reverted') return; // Skip reverted
            if (!feesByStudent[f.studentId]) {
                feesByStudent[f.studentId] = { totalDue: 0, totalPaid: 0, status: 'unpaid' };
            }
            feesByStudent[f.studentId].totalDue += (f.amount || 0);
            feesByStudent[f.studentId].totalPaid += (f.paidAmount || 0);
        });

        // Mark status
        Object.keys(feesByStudent).forEach(sid => {
            const f = feesByStudent[sid];
            f.status = f.totalPaid >= f.totalDue ? 'paid' : f.totalPaid > 0 ? 'partial' : 'unpaid';
        });

        // Render all students
        let paidCount = 0, unpaidCount = 0;
        const rows = studentSnap.docs.map(doc => {
            const s = doc.data();
            const sid = s.studentId || s.student_id || doc.id;
            const feeData = feesByStudent[sid] || { totalDue: 0, totalPaid: 0, status: 'no-fee' };
            if (feeData.status === 'paid') paidCount++;
            else if (feeData.status !== 'no-fee') unpaidCount++;

            const statusBadge = {
                paid: '<span class="badge" style="background:#10b981;color:white">PAID</span>',
                partial: '<span class="badge" style="background:#f59e0b;color:white">PARTIAL</span>',
                unpaid: '<span class="badge" style="background:#ef4444;color:white">UNPAID</span>',
                'no-fee': '<span class="text-muted">--</span>',
            }[feeData.status] || feeData.status;

            return `<tr>
                <td><strong>${sid}</strong></td>
                <td>${s.name || '--'}</td>
                <td>${s.class || '--'}</td>
                <td>${statusBadge}</td>
                <td class="text-right">\u20B9${feeData.totalDue.toLocaleString()}</td>
                <td class="text-right">\u20B9${feeData.totalPaid.toLocaleString()}</td>
            </tr>`;
        });

        tbody.innerHTML = rows.join('') || '<tr><td colspan="6" class="text-center text-muted p-2">No students found</td></tr>';

        // Update summary
        const totalEl = document.getElementById('mpvTotal');
        const paidEl = document.getElementById('mpvPaid');
        const unpaidEl = document.getElementById('mpvUnpaid');
        if (totalEl) totalEl.textContent = studentSnap.size;
        if (paidEl) paidEl.textContent = paidCount;
        if (unpaidEl) unpaidEl.textContent = unpaidCount;
    } catch (e) {
        console.error('Monthly view error:', e);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-red p-2">Error: ' + e.message + '</td></tr>';
    }
}

// ===================== RECEIPT REVERT/UNDO =====================

async function revertPayment(paymentId) {
    const reason = prompt('Enter reason for reverting this payment (required for audit):');
    if (!reason || reason.trim() === '') {
        showToast('Reason is required', 'error');
        return;
    }
    if (!await window.showConfirmModal({ title: 'Revert Payment', message: 'This will REVERSE the payment and restore the fee balances. The payment record will be marked as REVERTED but kept for audit. Continue?', icon: 'fa-undo-alt', confirmText: 'Revert', danger: true })) return;

    setLoading(true, 'Reverting payment...');
    try {
        const paySnap = await schoolDoc('feePayments', paymentId).get();
        if (!paySnap.exists) throw new Error('Payment not found');
        const payment = paySnap.data();

        if (payment.status === 'reverted') {
            showToast('Payment already reverted', 'error');
            setLoading(false);
            return;
        }

        const db = window.db || firebase.firestore();

        await db.runTransaction(async (transaction) => {
            // 1. Reverse each fee allocation
            const allocations = payment.allocations || [];
            for (const alloc of allocations) {
                if (!alloc.feeId) continue;
                const feeRef = schoolData('fees').doc(alloc.feeId);
                const feeDoc = await transaction.get(feeRef);
                if (!feeDoc.exists) continue;

                const fee = feeDoc.data();
                const newPaidAmount = Math.max(0, (fee.paidAmount || 0) - (alloc.paidNow || 0));
                const newStatus = newPaidAmount <= 0 ? 'pending' :
                    newPaidAmount < (fee.amount || 0) ? 'partial' : 'paid';

                transaction.update(feeRef, {
                    paidAmount: newPaidAmount,
                    status: newStatus,
                    lastRevertedAt: firebase.firestore.FieldValue.serverTimestamp(),
                });
            }

            // 2. Mark payment as reverted (don't delete - audit trail)
            transaction.update(schoolDoc('feePayments', paymentId), {
                status: 'reverted',
                revertedAt: firebase.firestore.FieldValue.serverTimestamp(),
                revertedBy: 'Admin',
                revertReason: reason.trim(),
            });
        });

        showToast('Payment reverted successfully. Fee balances restored.', 'success');
    } catch (e) {
        console.error('Revert error:', e);
        showToast('Error: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

async function loadRevertedPayments() {
    const tbody = document.getElementById('revertedPaymentsTableBody');
    if (!tbody) return;
    const startDate = document.getElementById('revertStartDate')?.value;
    const endDate = document.getElementById('revertEndDate')?.value;

    tbody.innerHTML = '<tr><td colspan="6" class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';

    try {
        let query = schoolData('feePayments')
            .where('status', '==', 'reverted')
            .orderBy('revertedAt', 'desc')
            .limit(100);

        const snap = await query.get();
        if (snap.empty) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted p-2">No reverted payments found.</td></tr>';
            return;
        }
        tbody.innerHTML = snap.docs.map(d => {
            const p = d.data();
            const revertDate = p.revertedAt ? new Date(p.revertedAt.seconds * 1000).toLocaleDateString() : '--';
            const payDate = p.createdAt ? new Date(p.createdAt.seconds * 1000).toLocaleDateString() : '--';
            return `<tr>
                <td><strong>${p.receiptNo}</strong></td>
                <td>${p.studentId || '--'}</td>
                <td>\u20B9${(p.amount || 0).toLocaleString()}</td>
                <td>${revertDate}</td>
                <td>${p.revertReason || 'No reason'}</td>
                <td>${p.revertedBy || '--'}</td>
            </tr>`;
        }).join('');
    } catch (e) {
        console.error('Error loading reverted payments:', e);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-red p-2">Error loading</td></tr>';
    }
}

// ===================== PAYMENT REMARKS =====================

async function loadStudentPaymentRemarks(sid) {
    try {
        const snap = await schoolData('studentPaymentRemarks').doc(sid).get();
        if (snap.exists) {
            return snap.data().remarks || '';
        }
        return '';
    } catch (e) {
        console.error('Error loading remarks:', e);
        return '';
    }
}

async function saveStudentPaymentRemarks() {
    if (!activeStudentLedger || !activeStudentLedger.sid) {
        showToast('Select a student first', 'error');
        return;
    }
    const remarks = document.getElementById('studentPaymentRemarks')?.value.trim() || '';
    if (!remarks) {
        showToast('Enter remarks first', 'error');
        return;
    }
    try {
        setLoading(true);
        await schoolData('studentPaymentRemarks').doc(activeStudentLedger.sid).set(withSchool({
            studentId: activeStudentLedger.sid,
            remarks,
            updatedBy: 'Admin',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        }));
        showToast('Payment remarks saved', 'success');
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}
window.printReceipt = printReceipt;
window.loadParentsNotPaidTool = loadParentsNotPaidTool;
window.applyBulkExtraFee = applyBulkExtraFee;
window.saveFineRule = saveFineRule;
window.loadFineRules = loadFineRules;
window.deleteFineRule = deleteFineRule;
window.toggleFeeSearchMode = toggleFeeSearchMode;
window.handleFeeQuickSearch = handleFeeQuickSearch;
window.selectFeeQuickStudent = selectFeeQuickStudent;
window.toggleAllFeeSelection = toggleAllFeeSelection;
window.updateSelectedFeeTotal = updateSelectedFeeTotal;
window.loadBulkDiscountClasses = loadBulkDiscountClasses;
window.applyBulkDiscount = applyBulkDiscount;
window.previewCarryForward = previewCarryForward;
window.executeCarryForward = executeCarryForward;
window.enforceLateFees = enforceLateFees;
window.loadFineRulesWithEnforce = loadFineRulesWithEnforce;

// ===================== LATE FEE AUTO-ENFORCEMENT =====================

async function enforceLateFees() {
    if (!await window.showConfirmModal({ title: 'Enforce Late Fees', message: 'Scan and apply late fees to all overdue pending fees? This will create additional "Late Fee" charge records for students with overdue payments based on configured rules.', icon: 'fa-clock', confirmText: 'Enforce', danger: true })) return;

    setLoading(true, 'Scanning overdue fees...');
    try {
        // Load active fine rules
        const rulesSnap = await schoolData('fineRules').where('active', '==', true).get();
        const rules = rulesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        if (rules.length === 0) {
            showToast('No active fine rules found. Create a rule first.', 'error');
            setLoading(false);
            return;
        }

        const today = new Date();
        const feesSnap = await schoolData('fees').where('status', 'in', ['pending', 'partial']).get();
        const batch = (window.db || firebase.firestore()).batch();
        let chargesCreated = 0;
        let totalAmount = 0;

        feesSnap.forEach(doc => {
            const f = doc.data();
            const due = (f.amount || 0) - (f.paidAmount || 0);
            if (due <= 0) return;

            // Find applicable rule
            const rule = rules.find(r => !r.feeType || r.feeType === f.feeType || r.feeType === 'All');
            if (!rule) return;

            // Check if past grace period
            const dueDate = f.dueDate && f.dueDate !== '--' ? new Date(f.dueDate) : null;
            if (!dueDate) return;

            const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
            if (daysOverdue <= (rule.graceDays || 0)) return;

            // Calculate fine amount
            let fineAmount = 0;
            const chargeableDays = daysOverdue - (rule.graceDays || 0);
            if (rule.fineType === 'fixed') {
                fineAmount = rule.amount || 0;
            } else if (rule.fineType === 'per_day') {
                fineAmount = (rule.amount || 0) * chargeableDays;
            } else if (rule.fineType === 'percent') {
                fineAmount = Math.round(due * (rule.amount || 0) / 100);
            }

            if (fineAmount <= 0) return;

            // Check for existing late fee charge to avoid duplicates
            const lateFeeId = `${f.studentId}_${f.month}_LATEFEE_${(f.feeType || '').replace(/\s+/g, '_')}`;
            const lateFeeRef = schoolDoc('fees', lateFeeId);

            batch.set(lateFeeRef, withSchool({
                studentId: f.studentId,
                class: f.class,
                month: f.month,
                year: f.year,
                amount: fineAmount,
                paidAmount: 0,
                status: 'pending',
                feeType: 'Late Fee - ' + (f.feeType || 'Fee'),
                frequency: 'One-off',
                dueDate: today.toISOString().split('T')[0],
                discount: 0,
                originalFeeId: doc.id,
                ruleApplied: rule.id,
                daysOverdue: chargeableDays,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            }), { merge: true });
            chargesCreated++;
            totalAmount += fineAmount;
        });

        if (chargesCreated === 0) {
            showToast('No overdue fees found that match active rules', 'info');
            setLoading(false);
            return;
        }

        await batch.commit();
        showToast(`Created ${chargesCreated} late fee charges totaling \u20B9${totalAmount.toLocaleString()}`, 'success');
    } catch (e) {
        console.error('Enforcement error:', e);
        showToast('Error: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

async function loadFineRulesWithEnforce() {
    await loadFineRules();
    // Add enforce button if not already there
    const header = document.getElementById('lateFeeRulesSection')?.querySelector('.header');
    if (header && !document.getElementById('enforceLateFeeBtn')) {
        const btn = document.createElement('button');
        btn.id = 'enforceLateFeeBtn';
        btn.className = 'btn-portal btn-primary';
        btn.innerHTML = '<i class="fas fa-bolt"></i> Enforce Late Fees Now';
        btn.onclick = enforceLateFees;
        header.appendChild(btn);
    }
}

// ===================== FEE CARRY FORWARD =====================

async function previewCarryForward() {
    const fromSession = document.getElementById('cfFromSession').value;
    const cls = document.getElementById('cfClass').value;
    if (!fromSession) {
        showToast('Select a source session', 'error');
        return;
    }

    const previewDiv = document.getElementById('cfPreview');
    previewDiv.classList.remove('hidden');
    previewDiv.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> Scanning pending dues...</div>';

    try {
        let feeQuery = schoolData('fees')
            .where('session', '==', fromSession)
            .where('status', 'in', ['pending', 'partial']);

        // Note: Can't add class filter to compound query without index, filter in code
        const snap = await feeQuery.get();
        const duesByStudent = {};

        snap.forEach(doc => {
            const f = doc.data();
            if (cls && f.class !== cls) return;
            const due = (f.amount || 0) - (f.paidAmount || 0);
            if (due <= 0) return;

            if (!duesByStudent[f.studentId]) {
                duesByStudent[f.studentId] = { studentId: f.studentId, class: f.class, totalDue: 0, months: [] };
            }
            duesByStudent[f.studentId].totalDue += due;
            duesByStudent[f.studentId].months.push(f.month + ' ' + (f.year || ''));
        });

        const totalStudents = Object.keys(duesByStudent).length;
        const totalDue = Object.values(duesByStudent).reduce((sum, s) => sum + s.totalDue, 0);

        previewDiv.innerHTML = `
            <div class="card bg-blue-50 p-1-5" style="border:1px solid #bfdbfe">
                <h4 class="text-sm font-bold text-blue-800 mb-1">Preview</h4>
                <div class="grid-2 gap-1 text-sm">
                    <div>Students with pending dues: <strong>${totalStudents}</strong></div>
                    <div>Total amount to carry forward: <strong>\u20B9${totalDue.toLocaleString()}</strong></div>
                </div>
                ${totalStudents > 0 ? `
                    <details class="mt-1">
                        <summary class="cursor-pointer text-sm font-bold">View Student List</summary>
                        <div class="mt-0-5" style="max-height:200px;overflow-y:auto">
                            ${Object.values(duesByStudent).slice(0, 20).map(s =>
                                `<div class="text-xs p-0-5" style="border-bottom:1px solid #bfdbfe">${s.studentId} (${s.class}) - \u20B9${s.totalDue.toLocaleString()} (${s.months.join(', ')})</div>`
                            ).join('')}
                            ${totalStudents > 20 ? `<div class="text-xs p-0-5 text-muted">... and ${totalStudents - 20} more</div>` : ''}
                        </div>
                    </details>
                ` : ''}
            </div>
        `;
    } catch (e) {
        console.error('Preview error:', e);
        previewDiv.innerHTML = '<div class="text-red text-sm">Error: ' + e.message + '</div>';
    }
}

async function executeCarryForward() {
    const fromSession = document.getElementById('cfFromSession').value;
    const toSession = document.getElementById('cfToSession').value;
    const cls = document.getElementById('cfClass').value;

    if (!fromSession || !toSession) {
        showToast('Select both source and target sessions', 'error');
        return;
    }
    if (fromSession === toSession) {
        showToast('Source and target sessions must be different', 'error');
        return;
    }

    if (!await window.showConfirmModal({ title: 'Carry Forward Dues', message: 'Carry forward pending dues from session ' + fromSession + ' to ' + toSession + '?', icon: 'fa-forward', confirmText: 'Carry Forward' })) return;

    setLoading(true, 'Carrying forward dues...');
    try {
        let feeQuery = schoolData('fees')
            .where('session', '==', fromSession)
            .where('status', 'in', ['pending', 'partial']);

        const snap = await feeQuery.get();
        const batch = (window.db || firebase.firestore()).batch();
        let count = 0;

        snap.forEach(doc => {
            const f = doc.data();
            if (cls && f.class !== cls) return;
            const due = (f.amount || 0) - (f.paidAmount || 0);
            if (due <= 0) return;

            const feeId = `${f.studentId}_${f.month}_${(f.feeType || 'Fee').replace(/\s+/g, '_')}_CF`;
            const feeRef = schoolDoc('fees', feeId);

            batch.set(feeRef, withSchool({
                studentId: f.studentId,
                class: f.class,
                month: f.month,
                year: f.year,
                amount: due, // Only carry forward the outstanding amount
                paidAmount: 0,
                status: 'pending',
                feeType: f.feeType || 'Tuition Fee',
                frequency: f.frequency || 'Monthly',
                dueDate: f.dueDate || '--',
                discount: 0,
                session: toSession,
                carriedFrom: fromSession,
                originalFeeId: doc.id,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            }), { merge: true });
            count++;
        });

        if (count === 0) {
            showToast('No pending dues to carry forward', 'info');
            setLoading(false);
            return;
        }

        await batch.commit();
        showToast(`Carried forward ${count} fee records to session ${toSession}`, 'success');

        const previewDiv = document.getElementById('cfPreview');
        if (previewDiv) {
            previewDiv.innerHTML = `<div class="card bg-green-50 p-1-5 text-green-800 text-sm" style="border:1px solid #86efac">
                <i class="fas fa-check-circle"></i> Successfully carried forward ${count} fee records.
            </div>`;
        }
    } catch (e) {
        console.error('Carry forward error:', e);
        showToast('Error: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

// ===================== BULK FEE DISCOUNT =====================

async function loadBulkDiscountClasses() {
    const session = document.getElementById('bdSession').value;
    const classSelect = document.getElementById('bdClass');
    if (!session) {
        classSelect.innerHTML = '<option value="">Select Session First</option>';
        return;
    }
    try {
        const snap = await schoolData('classes').where('sessionId', '==', session).orderBy('sortOrder', 'asc').get();
        classSelect.innerHTML = '<option value="">-- Select Class --</option>' +
            snap.docs.filter(c => !c.data().disabled).map(c =>
                `<option value="${c.data().name}">${c.data().name}</option>`
            ).join('');
    } catch (e) {
        console.error('Error loading classes:', e);
    }
}

async function applyBulkDiscount() {
    const session = document.getElementById('bdSession').value;
    const cls = document.getElementById('bdClass').value;
    const feeType = document.getElementById('bdFeeType').value;
    const month = document.getElementById('bdMonth').value;
    const amount = parseFloat(document.getElementById('bdAmount').value);
    const discountType = document.getElementById('bdType').value;
    const remarks = document.getElementById('bdRemarks').value.trim();

    if (!session || !cls || isNaN(amount) || amount <= 0) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    const confirmMsg = discountType === 'percent'
        ? 'Apply ' + amount + '% discount to ' + cls + ' students' + (feeType ? ' for ' + feeType : '') + (month ? ' in ' + month : '') + '?'
        : 'Apply \u20B9' + amount + ' discount to ' + cls + ' students' + (feeType ? ' for ' + feeType : '') + (month ? ' in ' + month : '') + '?';

    if (!await window.showConfirmModal({ title: 'Apply Bulk Discount', message: confirmMsg, icon: 'fa-percentage', confirmText: 'Apply' })) return;

    setLoading(true, 'Applying discounts...');
    try {
        let feeQuery = schoolData('fees')
            .where('class', '==', cls)
            .where('status', 'in', ['pending', 'partial']);

        // Note: Firestore doesn't support != 0 filter, so we filter in code
        const snap = await feeQuery.get();
        let count = 0;
        const batch = (window.db || firebase.firestore()).batch();

        snap.forEach(doc => {
            const f = doc.data();
            const due = (f.amount || 0) - (f.paidAmount || 0);
            if (due <= 0) return; // Skip fully paid

            // Apply filters
            if (feeType && f.feeType !== feeType) return;
            if (month && f.month !== month) return;

            const discountAmount = discountType === 'percent'
                ? Math.round((f.amount || 0) * amount / 100)
                : Math.min(amount, due); // Don't discount more than due

            const newPaidAmount = (f.paidAmount || 0) + discountAmount;
            const newStatus = newPaidAmount >= (f.amount || 0) ? 'paid' : 'partial';

            batch.update(doc.ref, {
                paidAmount: newPaidAmount,
                status: newStatus,
                discount: (f.discount || 0) + discountAmount,
                discountRemarks: remarks || 'Bulk Discount',
                lastDiscountDate: firebase.firestore.FieldValue.serverTimestamp(),
            });
            count++;
        });

        if (count === 0) {
            showToast('No matching pending fees found for this class/filter', 'info');
            setLoading(false);
            return;
        }

        await batch.commit();
        showToast(`Discount applied to ${count} fee records`, 'success');

        // Reset
        document.getElementById('bdAmount').value = '';
        document.getElementById('bdRemarks').value = '';
    } catch (e) {
        console.error('Error applying discount:', e);
        showToast('Error: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}
