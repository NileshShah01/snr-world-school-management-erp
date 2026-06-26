/**
 * Module: classFeePayment
 * Fee Collection UI — 4-step workflow: Search → Select → Pay → Receipt
 */

window.onModuleLoaded_fees_classFeePayment = function () {
    // Module loaded — ready for interactions
};

window.feeStudentSearch = async function(query) {
    const dropdown = document.getElementById('feeSearchDropdown');
    if (!dropdown) return;
    if (!query || query.length < 2) { dropdown.style.display = 'none'; return; }

    dropdown.style.display = 'block';
    dropdown.innerHTML = '<div style="padding:1rem;color:#94a3b8;font-size:.83rem">Searching...</div>';

    try {
        const q = query.toLowerCase().trim();
        const snap = await schoolData('students')
            .orderBy('name')
            .startAt(q.charAt(0).toUpperCase() + q.slice(1))
            .endAt(q.charAt(0).toUpperCase() + q.slice(1) + '\uf8ff')
            .limit(8).get();

        const phoneSnap = await schoolData('students')
            .where('phone', '>=', q)
            .where('phone', '<=', q + '\uf8ff')
            .limit(4).get();

        const results = [];
        const seen = new Set();
        [...snap.docs, ...phoneSnap.docs].forEach(doc => {
            if (!seen.has(doc.id)) { seen.add(doc.id); results.push({ id: doc.id, ...doc.data() }); }
        });

        if (!results.length) {
            dropdown.innerHTML = '<div style="padding:1.5rem;text-align:center;color:#94a3b8;font-size:.85rem">No students found for "' + query + '"</div>';
            return;
        }

        dropdown.innerHTML = results.map(function(s) {
            var initial = (s.name || '?')[0].toUpperCase();
            var colors = ['#3b82f6,#7c3aed','#ec4899,#f97316','#10b981,#06b6d4','#f59e0b,#ef4444'];
            var color = colors[(s.name || 'A').charCodeAt(0) % colors.length] || colors[0];
            return '<div onclick="feeSelectStudent(\'' + s.id + '\')"'
                 + ' style="display:flex;align-items:center;gap:.875rem;padding:.875rem 1.1rem;cursor:pointer;border-bottom:1px solid #f8fafc;transition:background .1s"'
                 + ' onmouseover="this.style.background=\'#eff6ff\'" onmouseout="this.style.background=\'\'">'
                 + '<div style="width:38px;height:38px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.85rem;color:white;background:linear-gradient(135deg,' + color + ')">' + initial + '</div>'
                 + '<div>'
                 + '<div style="font-weight:700;font-size:.88rem;color:#1e293b">' + escHtml(s.name || 'Unknown') + '</div>'
                 + '<div style="font-size:.75rem;color:#64748b">' + (s.class || '') + ' ' + (s.section ? '— ' + s.section : '') + ' · Reg: ' + (s.studentCode || s.registrationNumber || s.id.slice(-4)) + ' · ' + (s.phone || s.fatherPhone || '') + '</div>'
                 + '</div></div>';
        }).join('');
    } catch (e) {
        dropdown.innerHTML = '<div style="padding:1rem;color:#dc2626;font-size:.83rem">Error: ' + escHtml(e.message) + '</div>';
    }
};

window.feeSelectStudent = async function(studentId) {
    document.getElementById('feeSearchDropdown').style.display = 'none';
    document.getElementById('feeStudentSearchCard').style.display = 'none';

    var doc = await schoolData('students').doc(studentId).get();
    if (!doc.exists) return showToast('Student not found', 'error');
    var s = { id: doc.id, ...doc.data() };

    var banner = document.getElementById('feeStudentBanner');
    banner.style.display = 'flex';
    document.getElementById('feeBannerAvatar').textContent = (s.name || '?')[0].toUpperCase();
    document.getElementById('feeBannerName').textContent = s.name || 'Unknown Student';
    document.getElementById('feeBannerMeta').textContent = [s.class, s.section ? '— ' + s.section : '', s.studentCode ? '· Reg: ' + s.studentCode : '', s.phone || s.fatherPhone ? '· ' + (s.phone || s.fatherPhone) : ''].filter(Boolean).join(' ');

    await loadStudentFeeTable(studentId, s);
};

window.clearFeeStudent = function() {
    document.getElementById('feeStudentSearchCard').style.display = 'block';
    document.getElementById('feeStudentBanner').style.display = 'none';
    document.getElementById('feeSummaryBar').style.display = 'none';
    document.getElementById('feeTableContainer').innerHTML = '';
    document.getElementById('feeReceiptContainer').innerHTML = '';
    document.getElementById('feeQuickSearch').value = '';
    ['feeStep1','feeStep2','feeStep3','feeStep4'].forEach(function(id, i) {
        document.getElementById(id).className = 'fee-step-item ' + (i===0 ? 'active' : 'idle');
    });
};

async function loadStudentFeeTable(studentId, studentData) {
    document.getElementById('feeStep1').className = 'fee-step-item done';
    document.getElementById('feeStep2').className = 'fee-step-item active';

    var container = document.getElementById('feeTableContainer');
    container.innerHTML = '<div style="text-align:center;padding:2rem;color:#94a3b8"><i class="fas fa-spinner fa-spin"></i> Loading fee records…</div>';

    var feesSnap = await schoolData('fees').where('studentId', '==', studentId).orderBy('month', 'desc').get();
    var fees = feesSnap.docs.map(function(d) { return { id: d.id, ...d.data() }; });

    var total = fees.reduce(function(s, f) { return s + (f.amount || 0); }, 0);
    var paid  = fees.reduce(function(s, f) { return s + (f.paid  || 0); }, 0);
    var disc  = fees.reduce(function(s, f) { return s + (f.discount || 0); }, 0);
    var due   = total - paid - disc;

    var sb = document.getElementById('feeSummaryBar');
    sb.style.display = 'grid';
    document.getElementById('fsSumTotal').textContent = '\u20B9' + total.toLocaleString('en-IN');
    document.getElementById('fsSumPaid').textContent  = '\u20B9' + paid.toLocaleString('en-IN');
    document.getElementById('fsSumDisc').textContent  = '\u20B9' + disc.toLocaleString('en-IN');
    document.getElementById('fsSumDue').textContent   = '\u20B9' + due.toLocaleString('en-IN');

    var dueRows = fees.filter(function(f) { return (f.amount || 0) - (f.paid || 0) - (f.discount || 0) > 0; });
    var paidRows = fees.filter(function(f) { return (f.amount || 0) - (f.paid || 0) - (f.discount || 0) <= 0; });

    container.innerHTML = '<div class="card" style="margin-bottom:1.25rem">'
      + '<div class="card-header">'
      + '<div class="ch-icon" style="background:var(--amber-lt);color:var(--amber)"><i class="fas fa-receipt"></i></div>'
      + '<div><h2>Fee Ledger</h2><p>Select fees to include in this payment</p></div>'
      + '<button onclick="selectAllDueFees()" class="btn btn-outline btn-sm" style="margin-left:auto"><i class="fas fa-check-double"></i> Select All Due</button>'
      + '</div><div class="card-body" style="padding:0">'
      + '<div style="margin:.875rem;padding:.5rem .875rem;background:var(--blue-lt);border-radius:10px;border:1.5px solid var(--blue-md);display:flex;align-items:center;gap:.75rem">'
      + '<input type="checkbox" id="masterFeeCb" style="width:16px;height:16px;accent-color:var(--blue);cursor:pointer" onchange="toggleAllFeeRows(this)">'
      + '<label for="masterFeeCb" style="cursor:pointer;font-weight:700;color:var(--blue);font-size:.83rem">Select all pending fees</label>'
      + '<span id="selectedFeeDisplay" style="margin-left:auto;font-size:.82rem;font-weight:700;color:var(--ink-2)">\u20B90 selected</span>'
      + '</div><div style="overflow-x:auto"><table class="data-table"><thead><tr>'
      + '<th style="width:44px"><input type="checkbox" onchange="toggleAllFeeRows(this)" style="accent-color:var(--blue)"></th>'
      + '<th>Fee Type</th><th>Period</th><th>Due Date</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Status</th><th>Fine</th>'
      + '</tr></thead><tbody>'
      + dueRows.map(function(f) { return renderFeeRow(f, true); }).join('')
      + paidRows.map(function(f) { return renderFeeRow(f, false); }).join('')
      + '</tbody></table></div>'
      + '<div style="padding:0 1.25rem 1.25rem">'
      + '<div id="paymentPanel" style="background:var(--ink-2);color:white;border-radius:14px;padding:1.25rem 1.5rem;margin-top:1rem">'
      + '<div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8;margin-bottom:1rem">Process Payment</div>'
      + '<div style="display:flex;align-items:flex-end;gap:1rem;flex-wrap:wrap">'
      + '<div style="flex:1;min-width:140px">'
      + '<div style="font-size:.72rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.4rem">Amount (\u20B9)</div>'
      + '<div style="position:relative">'
      + '<span style="position:absolute;left:.875rem;top:50%;transform:translateY(-50%);color:#94a3b8;font-size:1rem;font-weight:600">\u20B9</span>'
      + '<input type="number" id="feePayAmount" min="1"'
      + ' style="width:100%;padding:.75rem .875rem .75rem 1.75rem;border-radius:10px;border:2px solid rgba(255,255,255,.1);background:rgba(255,255,255,.08);color:white;font-size:1.1rem;font-weight:700;outline:none"'
      + ' oninput="updatePayBtn()">'
      + '</div></div>'
      + '<div style="flex:2;min-width:200px">'
      + '<div style="font-size:.72rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.4rem">Payment Method</div>'
      + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem">'
      + [['mCash','Cash','fa-money-bill-wave'],['mUPI','UPI','fa-mobile-alt'],['mCheque','Cheque','fa-university'],['mOnline','Online','fa-credit-card']].map(function(a) {
        return '<div><input type="radio" name="payMethod" id="' + a[0] + '" value="' + a[1] + '" style="display:none" ' + (a[1]==='Cash'?'checked':'') + '>'
          + '<label for="' + a[0] + '" style="display:flex;flex-direction:column;align-items:center;gap:.3rem;padding:.6rem .4rem;border-radius:10px;cursor:pointer;border:2px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);font-size:.72rem;font-weight:600;color:#94a3b8;transition:all .15s">'
          + '<i class="fas ' + a[2] + '" style="font-size:1.1rem"></i>' + a[1] + '</label></div>';
      }).join('')
      + '</div></div>'
      + '<div style="text-align:right">'
      + '<div style="font-size:.72rem;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.05em">Paying Now</div>'
      + '<div id="payPanelTotal" style="font-size:1.8rem;font-weight:800;color:white">\u20B90</div>'
      + '</div></div>'
      + '<input type="text" id="feePayRemarks" placeholder="Remarks \u2014 cheque no., transaction ID (optional)"'
      + ' style="width:100%;margin-top:.875rem;padding:.6rem .875rem;border-radius:10px;border:2px solid rgba(255,255,255,.1);background:rgba(255,255,255,.07);color:white;font-size:.85rem;outline:none">'
      + '<button id="confirmPayBtn" onclick="confirmFeePayment(\'' + studentId + '\')"'
      + ' style="width:100%;padding:1rem;margin-top:1rem;border:none;border-radius:10px;background:linear-gradient(135deg,#10b981,#059669);color:white;font-size:1rem;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.6rem">'
      + '<i class="fas fa-check-circle"></i> Confirm Payment · <span id="payBtnAmt">\u20B90</span>'
      + '</button></div></div></div></div>';

    document.querySelectorAll('input[name="payMethod"]').forEach(function(radio) {
        radio.addEventListener('change', function() {
            document.querySelectorAll('input[name="payMethod"]').forEach(function(r) {
                r.nextElementSibling.style.borderColor = r.checked ? '#10b981' : 'rgba(255,255,255,.1)';
                r.nextElementSibling.style.background  = r.checked ? 'rgba(16,185,129,.15)' : 'rgba(255,255,255,.05)';
                r.nextElementSibling.style.color       = r.checked ? '#6ee7b7' : '#94a3b8';
            });
        });
    });
    var cashEl = document.getElementById('mCash');
    if (cashEl) cashEl.dispatchEvent(new Event('change'));
    updateFeeTotal();
}

function renderFeeRow(fee, isDue) {
    var balance = (fee.amount || 0) - (fee.paid || 0) - (fee.discount || 0);
    var isOverdue = isDue && fee.dueDate && new Date(fee.dueDate) < new Date();
    var statusLabel = balance <= 0 ? 'Paid' : isOverdue ? 'Overdue' : (fee.paid > 0 ? 'Partial' : 'Pending');
    var statusClass = balance <= 0 ? 'pill-paid' : isOverdue ? 'pill-overdue' : (fee.paid > 0 ? 'pill-partial' : 'pill-due');
    var fine = fee.fine || 0;
    return '<tr id="feeRow_' + fee.id + '" class="' + (isDue && balance > 0 ? 'selected' : '') + '" style="' + (balance<=0 ? 'opacity:.55' : '') + '">'
      + '<td><input type="checkbox" class="fee-row-cb" data-due="' + balance + '" data-fee-id="' + fee.id + '"'
      + ' ' + (isDue && balance > 0 ? 'checked' : '') + ' ' + (balance<=0 ? 'disabled' : '') + ''
      + ' style="width:15px;height:15px;accent-color:var(--blue);cursor:pointer" onchange="updateFeeTotal()"></td>'
      + '<td><div class="cell-name">' + escHtml(fee.feeType || 'Tuition Fee') + '</div><div class="cell-meta">' + escHtml(fee.category || 'Monthly') + '</div></td>'
      + '<td>' + escHtml(fee.month || fee.period || '—') + '</td>'
      + '<td style="' + (isOverdue ? 'color:var(--red);font-weight:600' : '') + '">' + (fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—') + '</td>'
      + '<td style="font-weight:700">\u20B9' + (fee.amount||0).toLocaleString('en-IN') + '</td>'
      + '<td style="color:var(--green);font-weight:600">\u20B9' + (fee.paid||0).toLocaleString('en-IN') + '</td>'
      + '<td style="font-weight:700;color:' + (balance>0 ? 'var(--red)' : 'var(--green)') + '">\u20B9' + Math.max(0,balance).toLocaleString('en-IN') + '</td>'
      + '<td><span class="pill ' + statusClass + '">' + statusLabel + '</span></td>'
      + '<td style="color:' + (fine>0?'var(--amber)':'var(--faint)') + ';font-weight:600">' + (fine > 0 ? '+\u20B9'+fine : '—') + '</td></tr>';
}

window.updateFeeTotal = window.updatePayBtn = function() {
    var total = 0;
    document.querySelectorAll('.fee-row-cb:checked').forEach(function(cb) {
        total += parseFloat(cb.dataset.due || 0);
    });
    var fmt = function(v) { return '\u20B9' + v.toLocaleString('en-IN'); };
    var el = document.getElementById('feePayAmount');
    if (el) el.value = total;
    var pp = document.getElementById('payPanelTotal');
    if (pp) pp.textContent = fmt(total);
    var pb = document.getElementById('payBtnAmt');
    if (pb) pb.textContent = fmt(total);
    var sd = document.getElementById('selectedFeeDisplay');
    if (sd) sd.textContent = fmt(total) + ' selected';
};

window.toggleAllFeeRows = function(cb) {
    document.querySelectorAll('.fee-row-cb:not(:disabled)').forEach(function(c) {
        if (c !== cb) c.checked = cb.checked;
    });
    updateFeeTotal();
};

window.selectAllDueFees = function() {
    document.querySelectorAll('.fee-row-cb:not(:disabled)').forEach(function(c) { c.checked = true; });
    var master = document.getElementById('masterFeeCb');
    if (master) master.checked = true;
    updateFeeTotal();
};

window.confirmFeePayment = async function(studentId) {
    var amount = parseFloat(document.getElementById('feePayAmount').value);
    if (!amount || amount <= 0) return showToast('Enter a valid payment amount', 'error');

    var method = document.querySelector('input[name="payMethod"]:checked');
    method = method ? method.value : 'Cash';
    var remarks = document.getElementById('feePayRemarks') ? document.getElementById('feePayRemarks').value : '';
    var selectedFeeIds = [];
    document.querySelectorAll('.fee-row-cb:checked').forEach(function(cb) {
        selectedFeeIds.push(cb.dataset.feeId);
    });

    if (!selectedFeeIds.length) return showToast('Select at least one fee to pay', 'error');

    document.getElementById('feeStep2').className = 'fee-step-item done';
    document.getElementById('feeStep3').className = 'fee-step-item active';
    var btn = document.getElementById('confirmPayBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing…';

    try {
        var receiptNo = await PaymentService.recordPayment({
            studentId: studentId,
            amount: amount,
            method: method,
            remarks: remarks,
            feeIds: selectedFeeIds,
            recordedBy: firebase.auth().currentUser ? firebase.auth().currentUser.uid : 'admin',
        });
        document.getElementById('feeStep3').className = 'fee-step-item done';
        document.getElementById('feeStep4').className = 'fee-step-item active';
        renderFeeReceipt(studentId, amount, method, receiptNo, remarks);
        showToast('Payment Recorded', 'success', '\u20B9' + amount.toLocaleString('en-IN') + ' · Receipt #' + receiptNo);
    } catch (e) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check-circle"></i> Confirm Payment · <span id="payBtnAmt">\u20B9' + amount.toLocaleString('en-IN') + '</span>';
        showToast('Payment failed: ' + e.message, 'error');
    }
};

function renderFeeReceipt(studentId, amount, method, receiptNo, remarks) {
    var name = document.getElementById('feeBannerName') ? document.getElementById('feeBannerName').textContent : 'Student';
    var meta = document.getElementById('feeBannerMeta') ? document.getElementById('feeBannerMeta').textContent : '';
    var now = new Date().toLocaleString('en-IN', {day:'numeric',month:'short',year:'numeric',hour:'numeric',minute:'2-digit'});
    var schoolNameEl = document.getElementById('sidebarSchoolName');
    var schoolName = schoolNameEl ? schoolNameEl.textContent : 'School';

    document.getElementById('feeTableContainer').style.display = 'none';
    document.getElementById('feeSummaryBar').style.display = 'none';

    document.getElementById('feeReceiptContainer').innerHTML =
      '<div style="background:white;border-radius:14px;box-shadow:var(--sh-md);padding:1.5rem;border-top:4px solid var(--green)">'
      + '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:.5rem;margin-bottom:1rem">'
      + '<div>'
      + '<div style="font-weight:800;font-size:1rem;color:var(--ink)">' + escHtml(schoolName) + '</div>'
      + '<div style="font-size:.75rem;color:var(--muted)">Receipt No: <strong>#' + escHtml(receiptNo) + '</strong> · ' + now + '</div>'
      + '</div>'
      + '<span style="background:var(--green-lt);color:var(--green);border-radius:var(--r-sm);padding:.3rem .75rem;font-size:.75rem;font-weight:700"><i class="fas fa-check-circle"></i> Payment Confirmed</span>'
      + '</div>'
      + '<hr style="border:none;border-top:1.5px dashed var(--border);margin:.875rem 0">'
      + '<div style="display:flex;flex-direction:column;gap:.3rem;font-size:.83rem">'
      + '<div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Student</span><span style="font-weight:600">' + escHtml(name) + '</span></div>'
      + '<div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Class / Reg.</span><span style="font-weight:600">' + escHtml(meta) + '</span></div>'
      + '<div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Payment Mode</span><span style="font-weight:600">' + escHtml(method) + '</span></div>'
      + (remarks ? '<div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Remarks</span><span style="font-weight:600">' + escHtml(remarks) + '</span></div>' : '')
      + '</div>'
      + '<hr style="border:none;border-top:2px solid var(--border);margin:.875rem 0">'
      + '<div style="display:flex;justify-content:space-between;align-items:center">'
      + '<span style="font-size:.88rem;font-weight:700;color:var(--ink)">Amount Paid</span>'
      + '<span style="font-size:1.3rem;font-weight:800;color:var(--green)">\u20B9' + amount.toLocaleString('en-IN') + '</span>'
      + '</div>'
      + '<div style="display:flex;gap:.75rem;margin-top:1.25rem">'
      + '<button onclick="window.print()" class="btn btn-outline" style="flex:1"><i class="fas fa-print"></i> Print Receipt</button>'
      + '<button onclick="sendReceiptSMS(\'' + studentId + '\', \'' + receiptNo + '\')" class="btn" style="flex:1;background:var(--green-lt);color:var(--green);border:1.5px solid var(--green-md)"><i class="fas fa-sms"></i> SMS Parent</button>'
      + '<button onclick="clearFeeStudent()" class="btn btn-primary" style="flex:1"><i class="fas fa-plus"></i> Next Student</button>'
      + '</div></div>';
}

window.sendReceiptSMS = async function(studentId, receiptNo) {
    try {
        await firebase.functions().httpsCallable('sendSmsNotification')({
            studentId: studentId,
            type: 'feeReceipt',
            receiptNo: receiptNo,
            schoolId: window.CURRENT_SCHOOL_ID || window.SCHOOL_ID,
        });
        showToast('SMS sent to parent', 'success');
    } catch (e) {
        showToast('SMS failed: ' + e.message, 'error');
    }
};
