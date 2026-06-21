/**
 * ERP FINANCE & ACCOUNTING MODULE
 * Double-entry bookkeeping, vouchers, financial reports
 */

// ===================== STATE =====================
let financeState = {
    accounts: [],
    currentFY: '',
    vouchers: [],
};

// ===================== INIT =====================
async function initERPFinance() {
    console.log('ERP Finance Module Initializing...');
    await loadFinanceAccounts();
}

// ===================== CHART OF ACCOUNTS =====================
async function loadFinanceAccounts() {
    const tbody = document.getElementById('financeAccountTableBody');
    if (!tbody) return;
    try {
        const snap = await schoolData('financeAccounts').orderBy('code').get();
        financeState.accounts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (financeState.accounts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted p-2">No accounts created yet. Click "Add Account" to set up your Chart of Accounts.</td></tr>';
            return;
        }
        tbody.innerHTML = financeState.accounts.map(a => {
            const typeBadge = { Asset: 'bg-blue-1', Liability: 'bg-red-1', Income: 'bg-green-1', Expense: 'bg-orange-1', Equity: 'bg-purple-1' };
            return `<tr>
                <td><strong>${a.code || '-'}</strong></td>
                <td>${a.name}</td>
                <td><span class="${typeBadge[a.type] || ''} p-0-5 border-radius-sm" style="font-size:0.75rem">${a.type}</span></td>
                <td class="text-right">${formatCurrency(a.openingBalance || 0)}</td>
                <td class="text-center">
                    <button class="btn-portal btn-ghost" onclick="editFinanceAccount('${a.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-portal btn-ghost text-red" onclick="deleteFinanceAccount('${a.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        }).join('');
    } catch (e) {
        console.error('Error loading finance accounts:', e);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-red p-2">Error loading accounts</td></tr>';
    }
}

function openAddFinanceAccountModal() {
    const html = `
        <form id="financeAccountForm" onsubmit="saveFinanceAccount(event)">
            <div class="grid-2 gap-1">
                <div class="form-group">
                    <label>Account Code</label>
                    <input type="text" id="finAccCode" class="form-control" placeholder="e.g. 1001" required>
                </div>
                <div class="form-group">
                    <label>Account Type</label>
                    <select id="finAccType" class="form-control" required>
                        <option value="">Select Type</option>
                        <option value="Asset">Asset</option>
                        <option value="Liability">Liability</option>
                        <option value="Income">Income</option>
                        <option value="Expense">Expense</option>
                        <option value="Equity">Equity</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Account Name</label>
                <input type="text" id="finAccName" class="form-control" placeholder="e.g. School Bank Account" required>
            </div>
            <div class="form-group">
                <label>Parent Group (Optional)</label>
                <input type="text" id="finAccGroup" class="form-control" placeholder="e.g. Current Assets">
            </div>
            <div class="form-group">
                <label>Opening Balance (₹)</label>
                <input type="number" id="finAccOpening" class="form-control" value="0" min="0" step="0.01">
            </div>
            <div class="form-group">
                <label>Note</label>
                <textarea id="finAccNote" class="form-control" rows="2" placeholder="Optional note"></textarea>
            </div>
            <input type="hidden" id="finAccEditId" value="">
            <button type="submit" class="btn-portal btn-primary w-full"><i class="fas fa-save"></i> Save Account</button>
        </form>
    `;
    openCmsModal('Add Account Head', html);
}

async function saveFinanceAccount(event) {
    event.preventDefault();
    const editId = document.getElementById('finAccEditId').value;
    const data = {
        code: document.getElementById('finAccCode').value.trim(),
        name: document.getElementById('finAccName').value.trim(),
        type: document.getElementById('finAccType').value,
        group: document.getElementById('finAccGroup').value.trim(),
        openingBalance: parseFloat(document.getElementById('finAccOpening').value) || 0,
        note: document.getElementById('finAccNote').value.trim(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    try {
        setLoading(true);
        if (editId) {
            await schoolDoc('financeAccounts', editId).update(data);
            showToast('Account updated', 'success');
        } else {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await schoolData('financeAccounts').add(withSchool(data));
            showToast('Account created', 'success');
        }
        closeCmsModal();
        await loadFinanceAccounts();
    } catch (e) {
        console.error(e);
        showToast('Error saving account: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

async function editFinanceAccount(id) {
    try {
        const doc = await schoolDoc('financeAccounts', id).get();
        if (!doc.exists) { showToast('Account not found', 'error'); return; }
        const a = doc.data();
        openAddFinanceAccountModal();
        setTimeout(() => {
            document.getElementById('cmsModalTitle').textContent = 'Edit Account Head';
            document.getElementById('finAccCode').value = a.code || '';
            document.getElementById('finAccName').value = a.name || '';
            document.getElementById('finAccType').value = a.type || '';
            document.getElementById('finAccGroup').value = a.group || '';
            document.getElementById('finAccOpening').value = a.openingBalance || 0;
            document.getElementById('finAccNote').value = a.note || '';
            document.getElementById('finAccEditId').value = id;
        }, 100);
    } catch (e) {
        console.error(e);
        showToast('Error loading account', 'error');
    }
}

async function deleteFinanceAccount(id) {
    if (!await window.showConfirmModal({ title: 'Delete Account', message: 'Delete this account? This cannot be undone.', icon: 'fa-trash-alt', confirmText: 'Delete', danger: true })) return;
    try {
        setLoading(true);
        await schoolDoc('financeAccounts', id).delete();
        showToast('Account deleted', 'success');
        await loadFinanceAccounts();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

// ===================== VOUCHERS (Journal / Payment / Receipt) =====================
async function loadFinanceVouchers() {
    const tbody = document.getElementById('financeVoucherTableBody');
    if (!tbody) return;
    try {
        const snap = await schoolData('financeVouchers').orderBy('date', 'desc').limit(100).get();
        financeState.vouchers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (financeState.vouchers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted p-2">No vouchers recorded yet.</td></tr>';
            return;
        }
        tbody.innerHTML = financeState.vouchers.map(v => {
            const typeColors = { Payment: 'text-red', Receipt: 'text-green', Journal: 'text-blue', Contra: 'text-purple' };
            return `<tr>
                <td>${v.voucherNo || '-'}</td>
                <td><span class="${typeColors[v.type] || ''}" style="font-weight:600">${v.type}</span></td>
                <td>${v.date || '-'}</td>
                <td>${v.particulars || '-'}</td>
                <td class="text-right">${formatCurrency(v.amount || 0)}</td>
                <td class="text-center">
                    <button class="btn-portal btn-ghost" onclick="viewVoucher('${v.id}')" title="View"><i class="fas fa-eye"></i></button>
                    <button class="btn-portal btn-ghost text-red" onclick="deleteVoucher('${v.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        }).join('');
    } catch (e) {
        console.error('Error loading vouchers:', e);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-red p-2">Error loading vouchers</td></tr>';
    }
}

function openAddVoucherModal() {
    const accountsHtml = financeState.accounts.map(a =>
        `<option value="${a.id}">${a.code} - ${a.name}</option>`
    ).join('');

    const html = `
        <form id="voucherForm" onsubmit="saveVoucher(event)">
            <div class="grid-2 gap-1">
                <div class="form-group">
                    <label>Voucher Type</label>
                    <select id="vouType" class="form-control" required onchange="updateVoucherLabels()">
                        <option value="Payment">Payment (Outgoing)</option>
                        <option value="Receipt">Receipt (Incoming)</option>
                        <option value="Journal">Journal (Transfer)</option>
                        <option value="Contra">Contra (Bank-Cash)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" id="vouDate" class="form-control" required>
                </div>
            </div>
            <div class="form-group">
                <label>Particulars</label>
                <input type="text" id="vouParticulars" class="form-control" placeholder="Description of transaction" required>
            </div>
            <div class="grid-2 gap-1">
                <div class="form-group">
                    <label id="vouDebitLabel">Debit Account (Dr)</label>
                    <select id="vouDebitAccount" class="form-control" required>
                        <option value="">Select Account</option>
                        ${accountsHtml}
                    </select>
                </div>
                <div class="form-group">
                    <label id="vouCreditLabel">Credit Account (Cr)</label>
                    <select id="vouCreditAccount" class="form-control" required>
                        <option value="">Select Account</option>
                        ${accountsHtml}
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Amount (₹)</label>
                <input type="number" id="vouAmount" class="form-control" min="0.01" step="0.01" required placeholder="0.00">
            </div>
            <div class="form-group">
                <label>Reference / Cheque No. (Optional)</label>
                <input type="text" id="vouRef" class="form-control" placeholder="e.g. Cheque #12345">
            </div>
            <div class="form-group">
                <label>Note (Optional)</label>
                <textarea id="vouNote" class="form-control" rows="2"></textarea>
            </div>
            <button type="submit" class="btn-portal btn-primary w-full"><i class="fas fa-save"></i> Save Voucher</button>
        </form>
    `;
    openCmsModal('New Voucher Entry', html);
    document.getElementById('vouDate').value = new Date().toISOString().split('T')[0];
}

function updateVoucherLabels() {
    const type = document.getElementById('vouType').value;
    const debitLabel = document.getElementById('vouDebitLabel');
    const creditLabel = document.getElementById('vouCreditLabel');
    if (type === 'Payment') {
        debitLabel.textContent = 'Expense / Payment To (Dr)';
        creditLabel.textContent = 'Bank / Cash (Cr)';
    } else if (type === 'Receipt') {
        debitLabel.textContent = 'Bank / Cash (Dr)';
        creditLabel.textContent = 'Income Source (Cr)';
    } else {
        debitLabel.textContent = 'Debit Account (Dr)';
        creditLabel.textContent = 'Credit Account (Cr)';
    }
}

async function saveVoucher(event) {
    event.preventDefault();
    const type = document.getElementById('vouType').value;
    const amount = parseFloat(document.getElementById('vouAmount').value);
    const debitAccId = document.getElementById('vouDebitAccount').value;
    const creditAccId = document.getElementById('vouCreditAccount').value;

    if (debitAccId === creditAccId) {
        showToast('Debit and Credit accounts must be different', 'error');
        return;
    }

    // Generate voucher number
    const counterDoc = await schoolDoc('counters', 'financeVouchers').get();
    let nextNo = 1;
    if (counterDoc.exists) {
        nextNo = (counterDoc.data().next || 1);
    }
    await schoolDoc('counters', 'financeVouchers').set({ next: nextNo + 1 }, { merge: true });

    const voucherNo = type.substring(0, 3).toUpperCase() + '-' + String(nextNo).padStart(5, '0');
    const data = {
        voucherNo,
        type,
        date: document.getElementById('vouDate').value,
        particulars: document.getElementById('vouParticulars').value.trim(),
        debitAccountId: debitAccId,
        creditAccountId: creditAccId,
        amount,
        reference: document.getElementById('vouRef').value.trim(),
        note: document.getElementById('vouNote').value.trim(),
        status: 'Posted',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    try {
        setLoading(true);
        await schoolData('financeVouchers').add(withSchool(data));
        showToast('Voucher saved: ' + voucherNo, 'success');
        closeCmsModal();
        await loadFinanceVouchers();
    } catch (e) {
        console.error(e);
        showToast('Error: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

async function viewVoucher(id) {
    try {
        const doc = await schoolDoc('financeVouchers', id).get();
        if (!doc.exists) { showToast('Voucher not found', 'error'); return; }
        const v = doc.data();
        const debitAcc = financeState.accounts.find(a => a.id === v.debitAccountId);
        const creditAcc = financeState.accounts.find(a => a.id === v.creditAccountId);
        const html = `
            <div class="card p-1-5 mb-1">
                <div class="grid-2 gap-1">
                    <div><strong>Voucher #:</strong> ${v.voucherNo}</div>
                    <div><strong>Type:</strong> ${v.type}</div>
                    <div><strong>Date:</strong> ${v.date}</div>
                    <div><strong>Amount:</strong> ${formatCurrency(v.amount)}</div>
                </div>
                <div class="mt-1"><strong>Particulars:</strong> ${v.particulars || '-'}</div>
                <div class="mt-0-5"><strong>Debit:</strong> ${debitAcc ? debitAcc.code + ' - ' + debitAcc.name : v.debitAccountId}</div>
                <div><strong>Credit:</strong> ${creditAcc ? creditAcc.code + ' - ' + creditAcc.name : v.creditAccountId}</div>
                ${v.reference ? `<div class="mt-0-5"><strong>Reference:</strong> ${v.reference}</div>` : ''}
                ${v.note ? `<div class="mt-0-5"><strong>Note:</strong> ${v.note}</div>` : ''}
            </div>
        `;
        openCmsModal('Voucher Details', html);
    } catch (e) {
        console.error(e);
        showToast('Error loading voucher', 'error');
    }
}

async function deleteVoucher(id) {
    if (!await window.showConfirmModal({ title: 'Delete Voucher', message: 'Delete this voucher? This will affect account balances.', icon: 'fa-file-invoice', confirmText: 'Delete', danger: true })) return;
    try {
        setLoading(true);
        await schoolDoc('financeVouchers', id).delete();
        showToast('Voucher deleted', 'success');
        await loadFinanceVouchers();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    } finally {
        setLoading(false);
    }
}

// ===================== FINANCIAL REPORTS =====================
async function generateTrialBalance() {
    const tbody = document.getElementById('trialBalanceBody');
    if (!tbody) return;
    try {
        const accSnap = await schoolData('financeAccounts').get();
        const vouSnap = await schoolData('financeVouchers').get();

        const accounts = accSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const vouchers = vouSnap.docs.map(d => d.data());

        const balances = {};
        accounts.forEach(a => {
            balances[a.id] = { ...a, debit: a.openingBalance || 0, credit: 0 };
        });

        vouchers.forEach(v => {
            if (balances[v.debitAccountId]) balances[v.debitAccountId].debit += v.amount || 0;
            if (balances[v.creditAccountId]) balances[v.creditAccountId].credit += v.amount || 0;
        });

        let totalDebit = 0, totalCredit = 0;
        const rows = Object.values(balances).filter(a => a.debit > 0 || a.credit > 0).map(a => {
            totalDebit += a.debit;
            totalCredit += a.credit;
            return `<tr>
                <td>${a.code || '-'}</td>
                <td>${a.name}</td>
                <td class="text-right">${formatCurrency(a.debit)}</td>
                <td class="text-right">${formatCurrency(a.credit)}</td>
            </tr>`;
        }).join('');

        if (!rows) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted p-2">No account activity found. Create vouchers first.</td></tr>';
            return;
        }
        tbody.innerHTML = rows + `<tr style="font-weight:700; border-top:2px solid var(--border)">
            <td colspan="2" class="text-right">TOTAL</td>
            <td class="text-right">${formatCurrency(totalDebit)}</td>
            <td class="text-right">${formatCurrency(totalCredit)}</td>
        </tr>
        <tr class="${totalDebit === totalCredit ? 'text-green' : 'text-red'}" style="font-weight:600">
            <td colspan="2" class="text-right">${totalDebit === totalCredit ? '✓ Balanced' : '⚠ Difference: ' + formatCurrency(Math.abs(totalDebit - totalCredit))}</td>
            <td colspan="2"></td>
        </tr>`;
    } catch (e) {
        console.error('Error generating trial balance:', e);
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-red p-2">Error generating report</td></tr>';
    }
}

async function generateProfitLoss() {
    const tbody = document.getElementById('plReportBody');
    if (!tbody) return;
    try {
        const accSnap = await schoolData('financeAccounts').get();
        const vouSnap = await schoolData('financeVouchers').get();

        const accounts = accSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const vouchers = vouSnap.docs.map(d => d.data());

        const income = {}, expense = {};
        accounts.forEach(a => {
            if (a.type === 'Income') income[a.id] = { name: a.name, code: a.code, total: 0 };
            if (a.type === 'Expense') expense[a.id] = { name: a.name, code: a.code, total: 0 };
        });

        vouchers.forEach(v => {
            if (income[v.creditAccountId]) income[v.creditAccountId].total += v.amount || 0;
            if (expense[v.debitAccountId]) expense[v.debitAccountId].total += v.amount || 0;
        });

        let totalIncome = 0, totalExpense = 0;
        let rows = '';
        Object.values(income).filter(i => i.total > 0).forEach(i => {
            totalIncome += i.total;
            rows += `<tr><td>${i.code || '-'}</td><td>${i.name}</td><td class="text-right text-green">${formatCurrency(i.total)}</td></tr>`;
        });
        rows += `<tr style="font-weight:700;border-top:1px solid var(--border)"><td colspan="2" class="text-right">Total Income</td><td class="text-right text-green">${formatCurrency(totalIncome)}</td></tr>`;

        rows += '<tr><td colspan="3" class="p-1"></td></tr>';

        Object.values(expense).filter(e => e.total > 0).forEach(e => {
            totalExpense += e.total;
            rows += `<tr><td>${e.code || '-'}</td><td>${e.name}</td><td class="text-right text-red">${formatCurrency(e.total)}</td></tr>`;
        });
        rows += `<tr style="font-weight:700;border-top:1px solid var(--border)"><td colspan="2" class="text-right">Total Expenses</td><td class="text-right text-red">${formatCurrency(totalExpense)}</td></tr>`;

        const netResult = totalIncome - totalExpense;
        rows += `<tr style="font-weight:800;border-top:2px solid var(--border);font-size:1.05em">
            <td colspan="2" class="text-right">Net ${netResult >= 0 ? 'Profit' : 'Loss'}</td>
            <td class="text-right ${netResult >= 0 ? 'text-green' : 'text-red'}">${formatCurrency(Math.abs(netResult))}</td>
        </tr>`;

        tbody.innerHTML = rows;
    } catch (e) {
        console.error('Error generating P&L:', e);
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-red p-2">Error generating report</td></tr>';
    }
}

async function generateBalanceSheet() {
    const tbody = document.getElementById('balanceSheetBody');
    if (!tbody) return;
    try {
        const accSnap = await schoolData('financeAccounts').get();
        const vouSnap = await schoolData('financeVouchers').get();

        const accounts = accSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const vouchers = vouSnap.docs.map(d => d.data());

        const assetTotal = {}, liabilityTotal = {}, equityTotal = {};
        accounts.forEach(a => {
            if (a.type === 'Asset') assetTotal[a.id] = { name: a.name, code: a.code, total: a.openingBalance || 0 };
            if (a.type === 'Liability') liabilityTotal[a.id] = { name: a.name, code: a.code, total: a.openingBalance || 0 };
            if (a.type === 'Equity') equityTotal[a.id] = { name: a.name, code: a.code, total: a.openingBalance || 0 };
        });

        vouchers.forEach(v => {
            if (assetTotal[v.debitAccountId]) assetTotal[v.debitAccountId].total += v.amount || 0;
            if (assetTotal[v.creditAccountId]) assetTotal[v.creditAccountId].total -= v.amount || 0;
            if (liabilityTotal[v.creditAccountId]) liabilityTotal[v.creditAccountId].total += v.amount || 0;
            if (liabilityTotal[v.debitAccountId]) liabilityTotal[v.debitAccountId].total -= v.amount || 0;
        });

        let totalAssets = 0, totalLiabilities = 0, totalEquity = 0;
        let rows = '';

        rows += '<tr><td colspan="3" style="font-weight:700;background:var(--bg-slate-light)">ASSETS</td></tr>';
        Object.values(assetTotal).filter(a => Math.abs(a.total) > 0).forEach(a => {
            totalAssets += a.total;
            rows += `<tr><td>${a.code || '-'}</td><td>${a.name}</td><td class="text-right">${formatCurrency(a.total)}</td></tr>`;
        });
        rows += `<tr style="font-weight:700;border-top:1px solid var(--border)"><td colspan="2" class="text-right">Total Assets</td><td class="text-right">${formatCurrency(totalAssets)}</td></tr>`;

        rows += '<tr><td colspan="3" style="font-weight:700;background:var(--bg-slate-light)">LIABILITIES</td></tr>';
        Object.values(liabilityTotal).filter(l => Math.abs(l.total) > 0).forEach(l => {
            totalLiabilities += l.total;
            rows += `<tr><td>${l.code || '-'}</td><td>${l.name}</td><td class="text-right">${formatCurrency(l.total)}</td></tr>`;
        });
        rows += `<tr style="font-weight:700;border-top:1px solid var(--border)"><td colspan="2" class="text-right">Total Liabilities</td><td class="text-right">${formatCurrency(totalLiabilities)}</td></tr>`;

        rows += '<tr><td colspan="3" style="font-weight:700;background:var(--bg-slate-light)">EQUITY</td></tr>';
        Object.values(equityTotal).filter(e => Math.abs(e.total) > 0).forEach(e => {
            totalEquity += e.total;
            rows += `<tr><td>${e.code || '-'}</td><td>${e.name}</td><td class="text-right">${formatCurrency(e.total)}</td></tr>`;
        });
        rows += `<tr style="font-weight:700;border-top:1px solid var(--border)"><td colspan="2" class="text-right">Total Equity</td><td class="text-right">${formatCurrency(totalEquity)}</td></tr>`;

        const diff = totalAssets - (totalLiabilities + totalEquity);
        rows += `<tr style="font-weight:800;border-top:2px solid var(--border);font-size:1.05em">
            <td colspan="2" class="text-right">${Math.abs(diff) < 1 ? '✓ Balanced' : '⚠ Difference'}</td>
            <td class="text-right ${Math.abs(diff) < 1 ? 'text-green' : 'text-red'}">${formatCurrency(Math.abs(diff))}</td>
        </tr>`;

        tbody.innerHTML = rows;
    } catch (e) {
        console.error('Error generating Balance Sheet:', e);
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-red p-2">Error generating report</td></tr>';
    }
}

// ===================== FINANCE DASHBOARD =====================
async function loadFinanceDashboard() {
    try {
        const vouSnap = await schoolData('financeVouchers').get();
        const accSnap = await schoolData('financeAccounts').get();
        const vouchers = vouSnap.docs.map(d => d.data());
        const accounts = accSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        let totalIncome = 0, totalExpense = 0;
        const accMap = {};
        accounts.forEach(a => { accMap[a.id] = a; });

        vouchers.forEach(v => {
            if (accMap[v.creditAccountId] && accMap[v.creditAccountId].type === 'Income') totalIncome += v.amount || 0;
            if (accMap[v.debitAccountId] && accMap[v.debitAccountId].type === 'Expense') totalExpense += v.amount || 0;
        });

        const elIncome = document.getElementById('finDashIncome');
        const elExpense = document.getElementById('finDashExpense');
        const elBalance = document.getElementById('finDashBalance');
        const elCount = document.getElementById('finDashVoucherCount');
        if (elIncome) elIncome.textContent = formatCurrency(totalIncome);
        if (elExpense) elExpense.textContent = formatCurrency(totalExpense);
        if (elBalance) elBalance.textContent = formatCurrency(totalIncome - totalExpense);
        if (elCount) elCount.textContent = vouchers.length;

        // Recent vouchers
        const recentBody = document.getElementById('finDashRecentVouchers');
        if (recentBody) {
            const recent = vouchers.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 10);
            if (recent.length === 0) {
                recentBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No vouchers yet</td></tr>';
            } else {
                recentBody.innerHTML = recent.map(v => `<tr>
                    <td>${v.voucherNo || '-'}</td>
                    <td>${v.type}</td>
                    <td>${v.date || '-'}</td>
                    <td class="text-right">${formatCurrency(v.amount)}</td>
                </tr>`).join('');
            }
        }

        // Account balances
        const balBody = document.getElementById('finDashAccountBalances');
        if (balBody) {
            const accList = accounts.filter(a => a.openingBalance);
            if (accList.length === 0) {
                balBody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No accounts with balances</td></tr>';
            } else {
                balBody.innerHTML = accList.map(a => `<tr>
                    <td>${a.code || '-'} ${a.name}</td>
                    <td>${a.type}</td>
                    <td class="text-right">${formatCurrency(a.openingBalance)}</td>
                </tr>`).join('');
            }
        }
    } catch (e) {
        console.error('Error loading finance dashboard:', e);
    }
}

async function loadFilteredVouchers(type, tbodyId) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    try {
        const snap = await schoolData('financeVouchers').where('type', '==', type).orderBy('date', 'desc').limit(100).get();
        if (snap.empty) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted p-2">No ${type.toLowerCase()} vouchers found.</td></tr>`;
            return;
        }
        const accounts = financeState.accounts;
        tbody.innerHTML = snap.docs.map(d => {
            const v = d.data();
            const acc = accounts.find(a => a.id === (type === 'Payment' ? v.debitAccountId : v.creditAccountId));
            return `<tr>
                <td>${v.voucherNo || '-'}</td>
                <td>${v.date || '-'}</td>
                <td>${acc ? acc.name : (v.particulars || '-')}</td>
                <td class="text-right">${formatCurrency(v.amount)}</td>
                <td class="text-center">
                    <button class="btn-portal btn-ghost" onclick="viewVoucher('${d.id}')" title="View"><i class="fas fa-eye"></i></button>
                </td>
            </tr>`;
        }).join('');
    } catch (e) {
        console.error('Error loading filtered vouchers:', e);
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-red p-2">Error loading ${type.toLowerCase()} vouchers</td></tr>`;
    }
}

// ===================== UTILITY =====================
function formatCurrency(amount) {
    return '\u20B9' + Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ===================== WINDOW EXPORTS =====================
window.initERPFinance = initERPFinance;
window.loadFinanceAccounts = loadFinanceAccounts;
window.openAddFinanceAccountModal = openAddFinanceAccountModal;
window.saveFinanceAccount = saveFinanceAccount;
window.editFinanceAccount = editFinanceAccount;
window.deleteFinanceAccount = deleteFinanceAccount;
window.loadFinanceVouchers = loadFinanceVouchers;
window.openAddVoucherModal = openAddVoucherModal;
window.saveVoucher = saveVoucher;
window.viewVoucher = viewVoucher;
window.deleteVoucher = deleteVoucher;
window.updateVoucherLabels = updateVoucherLabels;
window.generateTrialBalance = generateTrialBalance;
window.generateProfitLoss = generateProfitLoss;
window.generateBalanceSheet = generateBalanceSheet;
window.loadFinanceDashboard = loadFinanceDashboard;
window.loadFilteredVouchers = loadFilteredVouchers;
