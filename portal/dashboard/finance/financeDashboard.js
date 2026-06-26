/**
 * Finance Dashboard Module — Fee collection, dues tracking, and financial analytics
 */

const fdState = {
    monthIdx: new Date().getMonth(),
    year: new Date().getFullYear(),
    monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    shortMonths: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    allFees: [],
    allPayments: [],
    studentMap: {},
    filteredDues: [],
    activeFilter: 'all',
    searchTerm: ''
};

window.onModuleLoaded_finance_financeDashboard = function () {};

window.loadFinanceDashboard = async function () {
    fdState.monthIdx = new Date().getMonth();
    fdState.year = new Date().getFullYear();
    await fdLoadData();
};

async function fdLoadData() {
    fdUpdateMonthLabel();
    fdShowLoadingStates();

    try {
        const [feeSnap, paySnap, stuSnap] = await Promise.all([
            schoolData('fees').get().catch(() => null),
            schoolData('feePayments').orderBy('createdAt', 'desc').limit(500).get().catch(() => null),
            schoolData('students').get().catch(() => null)
        ]);

        fdState.studentMap = {};
        if (stuSnap) {
            stuSnap.forEach(d => {
                const s = d.data();
                fdState.studentMap[s.studentId || d.id] = s;
            });
        }

        fdState.allFees = [];
        if (feeSnap) {
            feeSnap.forEach(d => {
                const f = d.data();
                fdState.allFees.push({ _id: d.id, ...f });
            });
        }

        fdState.allPayments = [];
        if (paySnap) {
            paySnap.forEach(d => {
                const p = d.data();
                fdState.allPayments.push({ _id: d.id, ...p });
            });
        }

        fdBuildKPIs();
        fdBuildBarChart();
        fdBuildFeeBreakdown();
        fdBuildReminderStrip();
        fdBuildDuesTable();
        fdSetupFilters();

    } catch (e) {
        console.error('[FinDash] Load error:', e);
        const grid = document.getElementById('fdKpiGrid');
        if (grid) grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-exclamation-triangle" style="color:var(--red)"></i>Failed to load data. <button onclick="loadFinanceDashboard()" class="btn btn-outline" style="margin-top:.5rem;display:inline-flex">Retry</button></div>';
    }
}

function fdShowLoadingStates() {
    var el = document.getElementById('fdKpiGrid');
    if (el) el.innerHTML = '<div class="fd-loader" style="grid-column:1/-1"><i class="fas fa-spinner fa-spin"></i>Loading finance data...</div>';
    el = document.getElementById('fdBarChartBody');
    if (el) el.innerHTML = '<div class="fd-loader"><i class="fas fa-spinner fa-spin"></i></div>';
    el = document.getElementById('fdFeeBreakdownBody');
    if (el) el.innerHTML = '<div class="fd-loader"><i class="fas fa-spinner fa-spin"></i></div>';
    el = document.getElementById('fdDuesBody');
    if (el) el.innerHTML = '<tr><td colspan="10" class="empty-state"><i class="fas fa-spinner fa-spin"></i>Loading defaulters...</td></tr>';
    el = document.getElementById('fdTableInfo');
    if (el) el.textContent = 'Loading...';
    el = document.getElementById('fdTableTotal');
    if (el) el.textContent = '\u2014';
}

function fdUpdateMonthLabel() {
    var el = document.getElementById('fdMonthLabel');
    if (el) el.textContent = fdState.monthNames[fdState.monthIdx] + ' ' + fdState.year;
}

window.fdPrevMonth = function () {
    fdState.monthIdx--;
    if (fdState.monthIdx < 0) { fdState.monthIdx = 11; fdState.year--; }
    fdUpdateMonthLabel();
    fdBuildKPIs();
    fdBuildFeeBreakdown();
    fdBuildReminderStrip();
};

window.fdNextMonth = function () {
    fdState.monthIdx++;
    if (fdState.monthIdx > 11) { fdState.monthIdx = 0; fdState.year++; }
    fdUpdateMonthLabel();
    fdBuildKPIs();
    fdBuildFeeBreakdown();
    fdBuildReminderStrip();
};

// ── KPI CARDS ──────────────────────────────────────────────

function fdBuildKPIs() {
    var grid = document.getElementById('fdKpiGrid');
    if (!grid) return;

    var monthName = fdState.monthNames[fdState.monthIdx];
    var yearStr = String(fdState.year);

    // Fees for current month
    var monthFees = fdState.allFees.filter(function (f) {
        return String(f.month) === monthName && String(f.year) === yearStr;
    });

    var totalDemand = 0, totalPending = 0, totalPaid = 0, pendingFees = [], uniqueDefaulters = {};
    monthFees.forEach(function (f) {
        var amt = Number(f.amount) || 0;
        totalDemand += amt;
        if (f.status === 'paid') {
            totalPaid += amt;
        } else {
            var due = amt - (Number(f.paidAmount) || 0);
            totalPending += Math.max(due, 0);
            if (due > 0) {
                pendingFees.push(f);
                uniqueDefaulters[f.studentId || f._id] = true;
            }
        }
    });

    // Payments this month (by createdAt)
    var collectedThisMonth = 0, paymentCount = 0;
    fdState.allPayments.forEach(function (p) {
        var ts = p.createdAt;
        if (!ts) return;
        var d = ts.toDate ? ts.toDate() : new Date(ts);
        if (d.getMonth() === fdState.monthIdx && d.getFullYear() === fdState.year) {
            collectedThisMonth += Number(p.amount) || 0;
            paymentCount++;
        }
    });

    var collPct = totalDemand > 0 ? Math.round(collectedThisMonth / totalDemand * 100) : 0;
    var pendPct = totalDemand > 0 ? Math.round(totalPending / totalDemand * 100) : 0;

    // Defaulter count across all months
    var allDefaulters = {}, overdue90 = 0;
    fdState.allFees.forEach(function (f) {
        if (f.status !== 'paid') {
            var sid = f.studentId || f._id;
            allDefaulters[sid] = true;
            // Estimate overdue: check if fee month is older
            var feeMonthIdx = fdState.monthNames.indexOf(String(f.month));
            var feeYear = parseInt(String(f.year)) || 0;
            var monthsDiff = (fdState.year - feeYear) * 12 + (fdState.monthIdx - feeMonthIdx);
            if (monthsDiff >= 3) overdue90++;
        }
    });
    var defaulterCount = Object.keys(allDefaulters).length;

    // Previous month collection for trend
    var prevMonthIdx = fdState.monthIdx === 0 ? 11 : fdState.monthIdx - 1;
    var prevYear = fdState.monthIdx === 0 ? fdState.year - 1 : fdState.year;
    var prevCollected = 0;
    fdState.allPayments.forEach(function (p) {
        var ts = p.createdAt;
        if (!ts) return;
        var d = ts.toDate ? ts.toDate() : new Date(ts);
        if (d.getMonth() === prevMonthIdx && d.getFullYear() === prevYear) {
            prevCollected += Number(p.amount) || 0;
        }
    });
    var trendPct = prevCollected > 0 ? Math.round((collectedThisMonth - prevCollected) / prevCollected * 100) : 0;

    grid.innerHTML =
        '<div class="kpi-card kc-collected">' +
            '<div class="kpi-top">' +
                '<div class="kpi-icon" style="background:var(--green-lt);color:var(--green)"><i class="fas fa-check-circle"></i></div>' +
                (trendPct !== 0 ? '<div class="kpi-trend ' + (trendPct >= 0 ? 'up' : 'down') + '"><i class="fas fa-arrow-' + (trendPct >= 0 ? 'up' : 'down') + '"></i> ' + Math.abs(trendPct) + '%</div>' : '') +
            '</div>' +
            '<div class="kpi-val">' + fdFmt(collectedThisMonth) + '</div>' +
            '<div class="kpi-lbl">Collected This Month</div>' +
            '<div class="kpi-sub" style="color:var(--green)">' + paymentCount + ' payment' + (paymentCount !== 1 ? 's' : '') + ' processed</div>' +
            '<div class="kpi-progress"><div class="kpi-progress-bar" style="width:' + collPct + '%;background:var(--green)"></div></div>' +
        '</div>' +
        '<div class="kpi-card kc-pending">' +
            '<div class="kpi-top">' +
                '<div class="kpi-icon" style="background:var(--red-lt);color:var(--red)"><i class="fas fa-exclamation-circle"></i></div>' +
                (totalPending > 0 ? '<div class="kpi-trend down">' + fdFmt(totalPending) + ' due</div>' : '') +
            '</div>' +
            '<div class="kpi-val">' + fdFmt(totalPending) + '</div>' +
            '<div class="kpi-lbl">Pending This Month</div>' +
            '<div class="kpi-sub" style="color:var(--red)">' + pendingFees.length + ' fee record' + (pendingFees.length !== 1 ? 's' : '') + ' unpaid</div>' +
            '<div class="kpi-progress"><div class="kpi-progress-bar" style="width:' + pendPct + '%;background:var(--red)"></div></div>' +
        '</div>' +
        '<div class="kpi-card kc-total">' +
            '<div class="kpi-top">' +
                '<div class="kpi-icon" style="background:var(--blue-lt);color:var(--blue)"><i class="fas fa-chart-bar"></i></div>' +
                '<div style="display:flex;align-items:center;gap:.3rem"><span style="font-size:1.1rem;font-weight:800;color:var(--blue)">' + collPct + '%</span><span style="font-size:.7rem;color:var(--faint)">collected</span></div>' +
            '</div>' +
            '<div class="kpi-val">' + fdFmt(totalDemand) + '</div>' +
            '<div class="kpi-lbl">Total Demand This Month</div>' +
            '<div class="kpi-sub">For ' + monthFees.length + ' fee record' + (monthFees.length !== 1 ? 's' : '') + '</div>' +
            '<div class="kpi-progress"><div class="kpi-progress-bar" style="width:' + collPct + '%;background:var(--blue)"></div></div>' +
        '</div>' +
        '<div class="kpi-card kc-defaulters">' +
            '<div class="kpi-top">' +
                '<div class="kpi-icon" style="background:var(--amber-lt);color:var(--amber)"><i class="fas fa-user-times"></i></div>' +
                (overdue90 > 0 ? '<div class="kpi-trend down" style="background:var(--amber-lt);color:var(--amber)"><i class="fas fa-arrow-up"></i> ' + overdue90 + ' overdue 90+</div>' : '') +
            '</div>' +
            '<div class="kpi-val">' + defaulterCount + '</div>' +
            '<div class="kpi-lbl">Fee Defaulters</div>' +
            '<div class="kpi-sub">3+ months outstanding: <strong style="color:var(--red)">' + overdue90 + '</strong></div>' +
            '<div class="kpi-progress"><div class="kpi-progress-bar" style="width:' + (totalDemand > 0 ? pendPct : 0) + '%;background:var(--amber)"></div></div>' +
        '</div>';
}

// ── BAR CHART ──────────────────────────────────────────────

function fdBuildBarChart() {
    var body = document.getElementById('fdBarChartBody');
    if (!body) return;

    var months = [];
    for (var i = 5; i >= 0; i--) {
        var m = fdState.monthIdx - i;
        var y = fdState.year;
        if (m < 0) { m += 12; y--; }
        months.push({ idx: m, year: y, name: fdState.monthNames[m], short: fdState.shortMonths[m] });
    }

    var maxDemand = 0;
    var chartData = months.map(function (m) {
        var demand = 0, collected = 0;
        fdState.allFees.forEach(function (f) {
            if (String(f.month) === m.name && String(f.year) === String(m.year)) {
                demand += Number(f.amount) || 0;
            }
        });
        fdState.allPayments.forEach(function (p) {
            var ts = p.createdAt;
            if (!ts) return;
            var d = ts.toDate ? ts.toDate() : new Date(ts);
            if (d.getMonth() === m.idx && d.getFullYear() === m.year) {
                collected += Number(p.amount) || 0;
            }
        });
        if (demand > maxDemand) maxDemand = demand;
        return { label: m.short, demand: demand, collected: collected, isCurrent: m.idx === fdState.monthIdx && m.year === fdState.year };
    });

    if (maxDemand === 0) {
        body.innerHTML = '<div class="empty-state"><i class="fas fa-chart-bar"></i>No fee data available for chart</div>';
        return;
    }

    var html = '<div class="bar-chart">';
    chartData.forEach(function (d) {
        var collH = maxDemand > 0 ? Math.round(d.collected / maxDemand * 100) : 0;
        var pendH = maxDemand > 0 ? Math.round((d.demand - d.collected) / maxDemand * 100) : 0;
        if (collH < 2 && d.collected > 0) collH = 2;
        if (pendH < 2 && (d.demand - d.collected) > 0) pendH = 2;
        var totalH = collH + pendH;
        if (totalH > 100) { pendH = Math.max(0, 100 - collH); }
        html +=
            '<div class="bc-group">' +
                '<div class="bc-bars" style="height:100px">' +
                    (collH > 0 ? '<div class="bc-bar collected" style="height:' + collH + '%"></div>' : '') +
                    (pendH > 0 ? '<div class="bc-bar pending" style="height:' + pendH + '%"></div>' : '') +
                    (collH === 0 && pendH === 0 ? '<div style="height:2px;width:100%;background:var(--ghost);align-self:flex-end"></div>' : '') +
                '</div>' +
                '<div class="bc-lbl"' + (d.isCurrent ? ' style="color:var(--blue);font-weight:800"' : '') + '>' + d.label + '</div>' +
            '</div>';
    });
    html += '</div>';
    html += '<div class="bc-legend"><span><i class="fas fa-square" style="color:var(--green)"></i> Collected</span><span><i class="fas fa-square" style="color:var(--red-md)"></i> Pending</span></div>';

    body.innerHTML = html;
}

// ── FEE BREAKDOWN ──────────────────────────────────────────

function fdBuildFeeBreakdown() {
    var body = document.getElementById('fdFeeBreakdownBody');
    if (!body) return;

    var monthName = fdState.monthNames[fdState.monthIdx];
    var yearStr = String(fdState.year);

    var feeTypes = {};
    var totalAmt = 0;
    fdState.allFees.forEach(function (f) {
        if (String(f.month) === monthName && String(f.year) === yearStr) {
            var type = f.feeType || 'Other';
            var amt = Number(f.amount) || 0;
            if (!feeTypes[type]) feeTypes[type] = 0;
            feeTypes[type] += amt;
            totalAmt += amt;
        }
    });

    var typeKeys = Object.keys(feeTypes);
    if (typeKeys.length === 0 || totalAmt === 0) {
        body.innerHTML = '<div class="empty-state"><i class="fas fa-pie-chart"></i>No fee data for this month</div>';
        return;
    }

    var colors = ['#1e40af','#10b981','#f59e0b','#8b5cf6','#ef4444','#0891b2','#ec4899'];
    var html = '';

    // Donut
    var donutHtml = '';
    var offset = 0;
    typeKeys.forEach(function (type, i) {
        var pct = feeTypes[type] / totalAmt;
        var circumference = 2 * Math.PI * 40;
        var len = circumference * pct;
        var color = colors[i % colors.length];
        donutHtml += '<circle cx="55" cy="55" r="40" fill="none" stroke="' + color + '" stroke-width="18" stroke-dasharray="' + len + ' ' + circumference + '" stroke-dashoffset="' + (-offset) + '" transform="rotate(-90 55 55)"/>';
        offset += len;
    });
    var collPct = totalAmt > 0 ? Math.round(typeKeys.reduce(function (s, t) {
        return s + fdState.allFees.filter(function (f) { return String(f.month) === monthName && String(f.year) === yearStr && f.feeType === t && f.status === 'paid'; }).reduce(function (a, f) { return a + (Number(f.amount) || 0); }, 0);
    }, 0) / totalAmt * 100) : 0;

    html +=
        '<div style="display:flex;justify-content:center;margin-bottom:.875rem">' +
            '<div style="position:relative;width:110px;height:110px">' +
                '<svg width="110" height="110" viewBox="0 0 110 110">' +
                    '<circle cx="55" cy="55" r="40" fill="none" stroke="#e2e8f0" stroke-width="18"/>' +
                    donutHtml +
                '</svg>' +
                '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">' +
                    '<div style="font-size:1.1rem;font-weight:800;color:var(--ink)">' + collPct + '%</div>' +
                    '<div style="font-size:.6rem;color:var(--faint);font-weight:700">collected</div>' +
                '</div>' +
            '</div>' +
        '</div>';

    // Legend bars
    html += '<div class="pie-items">';
    typeKeys.forEach(function (type, i) {
        var pct = Math.round(feeTypes[type] / totalAmt * 100);
        var color = colors[i % colors.length];
        html +=
            '<div class="pie-item">' +
                '<div class="pie-dot" style="background:' + color + '"></div>' +
                '<span class="pie-label">' + escHtml(type) + '</span>' +
                '<div class="pie-bar-bg"><div class="pie-bar-fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
                '<span class="pie-pct">' + pct + '%</span>' +
            '</div>';
    });
    html += '</div>';

    body.innerHTML = html;
}

// ── REMINDER STRIP ─────────────────────────────────────────

function fdBuildReminderStrip() {
    var strip = document.getElementById('fdReminderStrip');
    var title = document.getElementById('fdReminderTitle');
    var sub = document.getElementById('fdReminderSub');
    if (!strip) return;

    var monthName = fdState.monthNames[fdState.monthIdx];
    var yearStr = String(fdState.year);

    var pendingThisMonth = 0, pendingCount = 0, studentSet = {};
    fdState.allFees.forEach(function (f) {
        if (String(f.month) === monthName && String(f.year) === yearStr && f.status !== 'paid') {
            var due = (Number(f.amount) || 0) - (Number(f.paidAmount) || 0);
            if (due > 0) {
                pendingThisMonth += due;
                pendingCount++;
                studentSet[f.studentId || f._id] = true;
            }
        }
    });

    // Overdue 90+
    var overdue90 = 0;
    fdState.allFees.forEach(function (f) {
        if (f.status !== 'paid') {
            var feeMonthIdx = fdState.monthNames.indexOf(String(f.month));
            var feeYear = parseInt(String(f.year)) || 0;
            var monthsDiff = (fdState.year - feeYear) * 12 + (fdState.monthIdx - feeMonthIdx);
            if (monthsDiff >= 3) overdue90++;
        }
    });

    var uniqueStudents = Object.keys(studentSet).length;

    if (pendingCount === 0) {
        strip.style.display = 'none';
        return;
    }

    strip.style.display = 'flex';
    if (title) title.textContent = uniqueStudents + ' student' + (uniqueStudents !== 1 ? 's have' : ' has') + ' pending fees this month';
    if (sub) sub.textContent = fdFmt(pendingThisMonth) + ' outstanding \u00B7 ' + overdue90 + ' student' + (overdue90 !== 1 ? 's' : '') + ' overdue 90+ days \u00B7 Send reminder now';
}

// ── DUES TABLE ─────────────────────────────────────────────

function fdBuildDuesTable() {
    fdState.filteredDues = [];
    var seen = {};

    fdState.allFees.forEach(function (f) {
        if (f.status === 'paid') return;
        var due = (Number(f.amount) || 0) - (Number(f.paidAmount) || 0);
        if (due <= 0) return;

        var feeMonthIdx = fdState.monthNames.indexOf(String(f.month));
        var feeYear = parseInt(String(f.year)) || 0;
        var overdueDays = 0;
        var now = new Date();
        if (feeYear > 0 && feeMonthIdx >= 0) {
            var dueDate = new Date(feeYear, feeMonthIdx, 11);
            overdueDays = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
        }

        var sid = f.studentId || f._id;
        var student = fdState.studentMap[sid] || {};

        fdState.filteredDues.push({
            studentId: sid,
            studentName: student.studentName || student.name || student.firstName + ' ' + (student.lastName || '') || 'Unknown',
            parentName: student.fatherName || student.parentName || '—',
            phone: student.fatherPhone || student.phone || '—',
            class: f.class || student.class || '—',
            section: student.section || '',
            feeType: f.feeType || 'Fee',
            month: f.month,
            year: f.year,
            dueSince: new Date(feeYear, feeMonthIdx, 10),
            overdueDays: Math.max(overdueDays, 0),
            amount: due,
            fine: Number(f.fine) || 0,
            total: due + (Number(f.fine) || 0),
            initials: ((student.studentName || student.name || 'S')[0] || 'S').toUpperCase(),
            feeMonthIdx: feeMonthIdx,
            feeYear: feeYear
        });
    });

    fdState.filteredDues.sort(function (a, b) { return b.overdueDays - a.overdueDays; });

    fdPopulateDuesTable(fdState.filteredDues);
}

function fdPopulateDuesTable(rows) {
    var tbody = document.getElementById('fdDuesBody');
    var info = document.getElementById('fdTableInfo');
    var total = document.getElementById('fdTableTotal');
    var countEl = document.getElementById('fdDefaulterCount');
    if (!tbody) return;

    if (rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="empty-state"><i class="fas fa-check-circle" style="color:var(--green)"></i>No pending fees found</td></tr>';
        if (info) info.textContent = 'No defaulters to show';
        if (total) total.textContent = '\u20B90';
        if (countEl) countEl.textContent = '0';
        return;
    }

    var totalDue = 0;
    var html = '';
    var avatarColors = ['linear-gradient(135deg,#dc2626,#f97316)','linear-gradient(135deg,#7c3aed,#ec4899)','linear-gradient(135deg,#0891b2,#3b82f6)','linear-gradient(135deg,#059669,#10b981)','linear-gradient(135deg,#d97706,#f59e0b)'];

    rows.forEach(function (r) {
        totalDue += r.total;
        var overdueLabel = 'ob-low';
        if (r.overdueDays >= 60) overdueLabel = 'ob-high';
        else if (r.overdueDays >= 30) overdueLabel = 'ob-med';

        var bg = avatarColors[r.studentName.charCodeAt(0) % avatarColors.length] || avatarColors[0];

        html +=
            '<tr>' +
                '<td><input type="checkbox" class="fd-due-cb" data-sid="' + r.studentId + '" style="accent-color:var(--blue);cursor:pointer"></td>' +
                '<td><div class="da-cell"><div class="da-avatar" style="background:' + bg + '">' + escHtml(r.initials) + '</div><div><div class="da-name">' + escHtml(r.studentName) + '</div><div class="da-class">' + escHtml(r.parentName) + ' \u00B7 ' + escHtml(r.phone) + '</div></div></div></td>' +
                '<td><span style="font-weight:600">' + escHtml(r.class) + (r.section ? ' \u2014 ' + escHtml(r.section) : '') + '</span></td>' +
                '<td>' + escHtml(r.feeType) + '<br><span style="font-size:.7rem;color:var(--muted)">' + escHtml(r.month) + ' ' + r.year + '</span></td>' +
                '<td><span style="color:var(--red);font-weight:600;font-size:.82rem">' + fdFormatDate(r.dueSince) + '</span></td>' +
                '<td><span class="overdue-badge ' + overdueLabel + '">' + r.overdueDays + ' days</span></td>' +
                '<td class="due-amt">' + fdFmt(r.amount) + '</td>' +
                '<td' + (r.fine > 0 ? ' style="color:var(--amber);font-weight:700"' : ' style="color:var(--faint);font-weight:600"') + '>' + (r.fine > 0 ? '+' + fdFmt(r.fine) : '\u2014') + '</td>' +
                '<td style="font-weight:800;color:var(--red)">' + fdFmt(r.total) + '</td>' +
                '<td><div class="action-group"><button class="ag-btn collect" onclick="showSection(\'classFeePayment\')"><i class="fas fa-rupee-sign"></i> Collect</button><button class="ag-btn sms"><i class="fas fa-sms"></i> SMS</button></div></td>' +
            '</tr>';
    });

    tbody.innerHTML = html;
    if (info) info.textContent = 'Showing ' + rows.length + ' of ' + fdState.filteredDues.length + ' defaulters';
    if (total) total.textContent = 'Total Pending: ' + fdFmt(totalDue);
    if (countEl) countEl.textContent = fdState.filteredDues.length;
}

// ── FILTERS & SEARCH ───────────────────────────────────────

function fdSetupFilters() {
    // Chip filters
    document.querySelectorAll('#financeDashboardSection .df-chip').forEach(function (c) {
        c.onclick = function () {
            document.querySelectorAll('#financeDashboardSection .df-chip').forEach(function (x) { x.classList.remove('active'); });
            this.classList.add('active');
            fdState.activeFilter = this.getAttribute('data-filter') || 'all';
            fdApplyFilters();
        };
    });

    // Search input
    var searchInput = document.getElementById('fdSearchInput');
    if (searchInput) {
        searchInput.oninput = function () {
            fdState.searchTerm = this.value.trim().toLowerCase();
            fdApplyFilters();
        };
    }
}

function fdApplyFilters() {
    var rows = fdState.filteredDues.filter(function (r) {
        // Text search
        if (fdState.searchTerm && r.studentName.toLowerCase().indexOf(fdState.searchTerm) === -1 &&
            r.class.toLowerCase().indexOf(fdState.searchTerm) === -1 &&
            r.feeType.toLowerCase().indexOf(fdState.searchTerm) === -1) {
            return false;
        }
        // Filter chip
        if (fdState.activeFilter === 'current') {
            if (String(r.month) !== fdState.monthNames[fdState.monthIdx] || String(r.year) !== String(fdState.year)) return false;
        } else if (fdState.activeFilter === 'overdue30') {
            if (r.overdueDays < 30) return false;
        } else if (fdState.activeFilter === 'overdue60') {
            if (r.overdueDays < 60) return false;
        } else if (fdState.activeFilter === 'overdue90') {
            if (r.overdueDays < 90) return false;
        }
        return true;
    });
    fdPopulateDuesTable(rows);
}

// ── EXPORT ─────────────────────────────────────────────────

window.fdExportDues = function () {
    var rows = fdState.filteredDues;
    if (rows.length === 0) { if (typeof showToast === 'function') showToast('No data to export', 'warning'); return; }

    var csv = 'Student Name,Class,Section,Fee Type,Month,Year,Due Since,Overdue Days,Amount Due,Fine,Total\n';
    rows.forEach(function (r) {
        csv += '"' + r.studentName + '","' + r.class + '","' + r.section + '","' + r.feeType + '","' + r.month + '","' + r.year + '","' + fdFormatDate(r.dueSince) + '",' + r.overdueDays + ',' + r.amount + ',' + r.fine + ',' + r.total + '\n';
    });

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'fee_defaulters_' + fdState.monthNames[fdState.monthIdx] + '_' + fdState.year + '.csv';
    link.click();
    URL.revokeObjectURL(link.href);
};

// ── HELPERS ────────────────────────────────────────────────

function fdFmt(amount) {
    return '\u20B9' + Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fdFormatDate(d) {
    if (!d) return '\u2014';
    if (typeof d === 'string') return d;
    var date = d.toDate ? d.toDate() : new Date(d);
    return date.getDate() + ' ' + fdState.monthNames[date.getMonth()] + ' ' + date.getFullYear();
}
