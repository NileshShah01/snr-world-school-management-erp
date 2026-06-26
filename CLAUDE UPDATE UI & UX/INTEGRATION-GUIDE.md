# SNR ERP — UI/UX Integration Guide
## How to Wire All 5 New UI Files Into Your Live Codebase

**Date:** June 2026  
**Files delivered:** 6 (5 HTML prototypes + 1 CSS design system)  
**Strategy:** Section-by-section replacement — no full rewrite, no framework change  

---

## WHAT YOU HAVE

| File | What It Replaces | Priority |
|---|---|---|
| `fee-collection-ui.html` | `classFeePaymentSection` in admin-dashboard.html | 🔴 Week 1 |
| `student-management-ui.html` | `studentListSection` + student search + drawer | 🔴 Week 1 |
| `finance-dashboard-ui.html` | Finance/fees overview + defaulters table | 🟡 Week 2 |
| `admin-dashboard-home-ui.html` | `dashboardOverviewSection` home screen | 🟡 Week 2 |
| `student-portal-ui.html` | Full `portal/student-dashboard.html` | 🟡 Week 2 |
| `add-student-wizard-ui.html` | `addStudentSection` | 🟢 Week 3 |
| `snr-design-system.css` | `css/portal.css` (superset — keeps all old classes) | 🔴 Week 1 |

---

## STEP 0 — Install the Design System CSS

**Do this first. It affects everything else.**

### 0a. Copy the CSS file
```bash
cp snr-design-system.css /your-project/css/snr-design-system.css
```

### 0b. Update the `<link>` tag in `portal/admin-dashboard.html`
```html
<!-- BEFORE (line ~8): -->
<link rel="stylesheet" href="../css/portal.css">

<!-- AFTER: -->
<link rel="stylesheet" href="../css/snr-design-system.css">
<!-- Keep portal.css for now as fallback — you can remove it after testing -->
<link rel="stylesheet" href="../css/portal.css">
```

### 0c. Do the same for all portal pages:
- `portal/student-dashboard.html`
- `portal/teacher-dashboard.html`
- `portal/admin-login.html`
- `portal/student-login.html`

### 0d. Add the toast container to `portal/admin-dashboard.html`
Find `</body>` and add just before it:
```html
<!-- TOAST CONTAINER — add once, before </body> -->
<div id="snrToastContainer"></div>
```

---

## STEP 1 — Fee Collection UI

### What changes
Replace the content of `classFeePaymentSection` in `portal/admin-dashboard.html` with the new 4-step fee collection UI.

### 1a. Find the existing section
```bash
grep -n "classFeePaymentSection" portal/admin-dashboard.html
# Note the line number — typically inside a <section id="classFeePaymentSection">
```

### 1b. Replace the section inner HTML

Find this pattern in `admin-dashboard.html`:
```html
<section id="classFeePaymentSection" class="dashboard-section">
  <!-- ... existing fee content ... -->
</section>
```

Replace the **inner content** (keep the `<section>` wrapper) with:
```html
<section id="classFeePaymentSection" class="dashboard-section">

  <!-- PAGE HEADER -->
  <div style="display:flex;align-items:flex-start;gap:1rem;margin-bottom:1.75rem;flex-wrap:wrap">
    <div>
      <h1 style="font-size:1.35rem;font-weight:800;color:var(--ink)">Collect Fee Payment</h1>
      <p style="font-size:.82rem;color:var(--muted)">Search student → Select fees → Process payment → Print receipt</p>
    </div>
  </div>

  <!-- STEP PROGRESS BAR -->
  <div style="background:white;border-radius:14px;box-shadow:var(--sh-sm);padding:1rem 1.5rem;
              margin-bottom:1.75rem;display:flex;align-items:center;gap:0;overflow-x:auto">
    <div class="fee-step-item active" id="feeStep1">
      <div class="fee-step-num">1</div>
      <div><span class="fee-step-label">Find Student</span></div>
    </div>
    <div class="fee-step-line"></div>
    <div class="fee-step-item idle" id="feeStep2">
      <div class="fee-step-num">2</div>
      <div><span class="fee-step-label">Select Fees</span></div>
    </div>
    <div class="fee-step-line"></div>
    <div class="fee-step-item idle" id="feeStep3">
      <div class="fee-step-num">3</div>
      <div><span class="fee-step-label">Pay</span></div>
    </div>
    <div class="fee-step-line"></div>
    <div class="fee-step-item idle" id="feeStep4">
      <div class="fee-step-num">4</div>
      <div><span class="fee-step-label">Receipt</span></div>
    </div>
  </div>

  <!-- STUDENT SEARCH CARD -->
  <div class="card" id="feeStudentSearchCard" style="margin-bottom:1.25rem">
    <div class="card-header">
      <div class="ch-icon" style="background:var(--blue-lt);color:var(--blue)"><i class="fas fa-search"></i></div>
      <div><h2>Find Student</h2><p>Search by name, phone, registration number or father's name</p></div>
    </div>
    <div class="card-body">
      <div style="position:relative">
        <i class="fas fa-search" style="position:absolute;left:.9rem;top:50%;transform:translateY(-50%);color:var(--faint)"></i>
        <input type="text" id="feeQuickSearch"
               placeholder="Type name, phone, reg. no. or father's name…"
               style="width:100%;padding:.85rem 1rem .85rem 2.75rem;border:2px solid var(--border);
                      border-radius:14px;font-size:.95rem;outline:none;background:var(--bg)"
               oninput="feeStudentSearch(this.value)" autocomplete="off">
        <div id="feeSearchDropdown" style="display:none;position:absolute;top:calc(100% + 6px);left:0;right:0;
             background:white;border:1.5px solid var(--blue-md);border-radius:14px;
             box-shadow:var(--sh-lg);z-index:100;overflow:hidden"></div>
      </div>
      <div style="display:flex;gap:.6rem;margin-top:.6rem;flex-wrap:wrap">
        <span style="padding:.25rem .65rem;background:var(--blue-lt);color:var(--blue);border-radius:20px;font-size:.7rem;font-weight:700">By Name</span>
        <span style="padding:.25rem .65rem;background:var(--blue-lt);color:var(--blue);border-radius:20px;font-size:.7rem;font-weight:700">By Phone</span>
        <span style="padding:.25rem .65rem;background:var(--blue-lt);color:var(--blue);border-radius:20px;font-size:.7rem;font-weight:700">By Reg. No.</span>
        <span style="padding:.25rem .65rem;background:var(--blue-lt);color:var(--blue);border-radius:20px;font-size:.7rem;font-weight:700">By Father's Name</span>
      </div>
    </div>
  </div>

  <!-- SELECTED STUDENT BANNER -->
  <div id="feeStudentBanner" style="display:none;align-items:center;gap:1rem;
       padding:1rem 1.25rem;border-radius:14px;background:var(--blue-lt);
       border:1.5px solid var(--blue-md);margin-bottom:1.5rem">
    <div id="feeBannerAvatar" style="width:48px;height:48px;border-radius:50%;flex-shrink:0;
         display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.1rem;
         color:white;background:linear-gradient(135deg,#1e40af,#7c3aed)">A</div>
    <div>
      <div id="feeBannerName" style="font-size:1rem;font-weight:700;color:var(--ink)">Student Name</div>
      <div id="feeBannerMeta" style="font-size:.78rem;color:var(--muted)">Class · Reg. · Phone</div>
    </div>
    <button onclick="clearFeeStudent()" style="margin-left:auto;padding:.4rem .875rem;background:white;
            color:var(--blue);border:1.5px solid var(--blue-md);border-radius:var(--r-sm);
            font-size:.78rem;font-weight:700;cursor:pointer">Change Student</button>
  </div>

  <!-- SUMMARY BAR -->
  <div id="feeSummaryBar" style="display:none;grid-template-columns:repeat(4,1fr);gap:0;
       background:white;border-radius:14px;box-shadow:var(--sh-sm);
       overflow:hidden;margin-bottom:1.5rem;border:1px solid var(--border)">
    <div style="padding:1rem 1.25rem;border-right:1px solid var(--border);text-align:center">
      <span id="fsSumTotal" style="font-size:1.5rem;font-weight:800;display:block;color:var(--ink)">₹0</span>
      <span style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--faint)">Total</span>
    </div>
    <div style="padding:1rem 1.25rem;border-right:1px solid var(--border);text-align:center">
      <span id="fsSumPaid" style="font-size:1.5rem;font-weight:800;display:block;color:var(--green)">₹0</span>
      <span style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--faint)">Paid</span>
    </div>
    <div style="padding:1rem 1.25rem;border-right:1px solid var(--border);text-align:center">
      <span id="fsSumDisc" style="font-size:1.5rem;font-weight:800;display:block;color:var(--amber)">₹0</span>
      <span style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--faint)">Discounts</span>
    </div>
    <div style="padding:1rem 1.25rem;text-align:center">
      <span id="fsSumDue" style="font-size:1.5rem;font-weight:800;display:block;color:var(--red)">₹0</span>
      <span style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--faint)">Balance Due</span>
    </div>
  </div>

  <!-- FEE TABLE + PAYMENT PANEL (rendered by JS) -->
  <div id="feeTableContainer"></div>

  <!-- RECEIPT SECTION (rendered by JS after payment) -->
  <div id="feeReceiptContainer"></div>

</section>
```

### 1c. Add CSS for step indicators (add to `snr-design-system.css` or inline in `<head>`):
```css
.fee-step-item { display:flex;align-items:center;gap:.6rem;flex:1;min-width:0 }
.fee-step-num { width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:800;flex-shrink:0;transition:all .2s }
.fee-step-item.idle   .fee-step-num { background:#e2e8f0;color:#94a3b8 }
.fee-step-item.active .fee-step-num { background:#1e40af;color:white;box-shadow:0 0 0 4px #bfdbfe }
.fee-step-item.done   .fee-step-num { background:#059669;color:white }
.fee-step-label { font-size:.72rem;font-weight:700;white-space:nowrap }
.fee-step-item.idle   .fee-step-label { color:#94a3b8 }
.fee-step-item.active .fee-step-label { color:#1e40af }
.fee-step-item.done   .fee-step-label { color:#059669 }
.fee-step-line { width:32px;height:2px;background:#e2e8f0;flex-shrink:0;margin:0 .25rem }
```

### 1d. Update `js/erp-fees.js` — Replace `initClassFeePaymentUI()` render logic

Find the function `initClassFeePaymentUI` (or `window.initClassFeePaymentUI`) and add the new student-search render at the top:

```javascript
// ── ADD to top of initClassFeePaymentUI() ──────────────────
// Replace or augment the existing search UI with the new pattern

window.feeStudentSearch = async function(query) {
    const dropdown = document.getElementById('feeSearchDropdown');
    if (!dropdown) return;
    if (!query || query.length < 2) { dropdown.style.display = 'none'; return; }

    dropdown.style.display = 'block';
    dropdown.innerHTML = '<div style="padding:1rem;color:#94a3b8;font-size:.83rem">Searching...</div>';

    try {
        // Search by name, phone, studentCode
        const q = query.toLowerCase().trim();
        const snap = await schoolData('students')
            .orderBy('name')
            .startAt(q.charAt(0).toUpperCase() + q.slice(1))
            .endAt(q.charAt(0).toUpperCase() + q.slice(1) + '\uf8ff')
            .limit(8).get();

        // Also search by phone
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
            dropdown.innerHTML = `<div style="padding:1.5rem;text-align:center;color:#94a3b8;font-size:.85rem">No students found for "${query}"</div>`;
            return;
        }

        dropdown.innerHTML = results.map(s => {
            const initial = (s.name || '?')[0].toUpperCase();
            const colors = ['#3b82f6,#7c3aed','#ec4899,#f97316','#10b981,#06b6d4','#f59e0b,#ef4444'];
            const color = colors[s.name?.charCodeAt(0) % colors.length] || colors[0];
            return `
                <div onclick="feeSelectStudent('${s.id}')"
                     style="display:flex;align-items:center;gap:.875rem;padding:.875rem 1.1rem;
                            cursor:pointer;border-bottom:1px solid #f8fafc;transition:background .1s"
                     onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background=''">
                    <div style="width:38px;height:38px;border-radius:50%;flex-shrink:0;
                                display:flex;align-items:center;justify-content:center;
                                font-weight:800;font-size:.85rem;color:white;
                                background:linear-gradient(135deg,${color})">${initial}</div>
                    <div>
                        <div style="font-weight:700;font-size:.88rem;color:#1e293b">${s.name || 'Unknown'}</div>
                        <div style="font-size:.75rem;color:#64748b">${s.class || ''} ${s.section ? '— ' + s.section : ''} · Reg: ${s.studentCode || s.registrationNumber || s.id.slice(-4)} · ${s.phone || s.fatherPhone || ''}</div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (e) {
        dropdown.innerHTML = `<div style="padding:1rem;color:#dc2626;font-size:.83rem">Error: ${e.message}</div>`;
    }
};

window.feeSelectStudent = async function(studentId) {
    document.getElementById('feeSearchDropdown').style.display = 'none';
    document.getElementById('feeStudentSearchCard').style.display = 'none';

    const doc = await schoolData('students').doc(studentId).get();
    if (!doc.exists) return showToast('Student not found', 'error');
    const s = { id: doc.id, ...doc.data() };

    // Show banner
    const banner = document.getElementById('feeStudentBanner');
    banner.style.display = 'flex';
    document.getElementById('feeBannerAvatar').textContent = (s.name || '?')[0].toUpperCase();
    document.getElementById('feeBannerName').textContent = s.name || 'Unknown Student';
    document.getElementById('feeBannerMeta').textContent =
        [s.class, s.section ? '— ' + s.section : '', s.studentCode ? '· Reg: ' + s.studentCode : '', s.phone || s.fatherPhone ? '· ' + (s.phone || s.fatherPhone) : ''].filter(Boolean).join(' ');

    // Load fee data
    await loadStudentFeeTable(studentId, s);
};

window.clearFeeStudent = function() {
    document.getElementById('feeStudentSearchCard').style.display = 'block';
    document.getElementById('feeStudentBanner').style.display = 'none';
    document.getElementById('feeSummaryBar').style.display = 'none';
    document.getElementById('feeTableContainer').innerHTML = '';
    document.getElementById('feeReceiptContainer').innerHTML = '';
    document.getElementById('feeQuickSearch').value = '';
    // Reset step indicators
    ['feeStep1','feeStep2','feeStep3','feeStep4'].forEach((id,i) => {
        document.getElementById(id).className = 'fee-step-item ' + (i===0 ? 'active' : 'idle');
    });
};

async function loadStudentFeeTable(studentId, studentData) {
    // Mark step 1 done, step 2 active
    document.getElementById('feeStep1').className = 'fee-step-item done';
    document.getElementById('feeStep2').className = 'fee-step-item active';

    const container = document.getElementById('feeTableContainer');
    container.innerHTML = '<div style="text-align:center;padding:2rem;color:#94a3b8"><i class="fas fa-spinner fa-spin"></i> Loading fee records…</div>';

    const feesSnap = await schoolData('fees').where('studentId', '==', studentId).orderBy('month', 'desc').get();
    const fees = feesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Calculate summary
    const total = fees.reduce((s, f) => s + (f.amount || 0), 0);
    const paid  = fees.reduce((s, f) => s + (f.paid  || 0), 0);
    const disc  = fees.reduce((s, f) => s + (f.discount || 0), 0);
    const due   = total - paid - disc;

    // Show summary bar
    const sb = document.getElementById('feeSummaryBar');
    sb.style.display = 'grid';
    document.getElementById('fsSumTotal').textContent = '₹' + total.toLocaleString('en-IN');
    document.getElementById('fsSumPaid').textContent  = '₹' + paid.toLocaleString('en-IN');
    document.getElementById('fsSumDisc').textContent  = '₹' + disc.toLocaleString('en-IN');
    document.getElementById('fsSumDue').textContent   = '₹' + due.toLocaleString('en-IN');

    // Render table
    const dueRows = fees.filter(f => (f.amount || 0) - (f.paid || 0) - (f.discount || 0) > 0);
    const paidRows = fees.filter(f => (f.amount || 0) - (f.paid || 0) - (f.discount || 0) <= 0);

    container.innerHTML = `
    <div class="card" style="margin-bottom:1.25rem">
      <div class="card-header">
        <div class="ch-icon" style="background:var(--amber-lt);color:var(--amber)"><i class="fas fa-receipt"></i></div>
        <div><h2>Fee Ledger</h2><p>Select fees to include in this payment</p></div>
        <button onclick="selectAllDueFees()" class="btn btn-outline btn-sm" style="margin-left:auto">
          <i class="fas fa-check-double"></i> Select All Due
        </button>
      </div>
      <div class="card-body" style="padding:0">
        <div style="margin:.875rem;padding:.5rem .875rem;background:var(--blue-lt);
                    border-radius:10px;border:1.5px solid var(--blue-md);
                    display:flex;align-items:center;gap:.75rem">
          <input type="checkbox" id="masterFeeCb" style="width:16px;height:16px;accent-color:var(--blue);cursor:pointer" onchange="toggleAllFeeRows(this)">
          <label for="masterFeeCb" style="cursor:pointer;font-weight:700;color:var(--blue);font-size:.83rem">Select all pending fees</label>
          <span id="selectedFeeDisplay" style="margin-left:auto;font-size:.82rem;font-weight:700;color:var(--ink-2)">₹0 selected</span>
        </div>
        <div style="overflow-x:auto">
          <table class="data-table">
            <thead><tr>
              <th style="width:44px"><input type="checkbox" onchange="toggleAllFeeRows(this)" style="accent-color:var(--blue)"></th>
              <th>Fee Type</th><th>Period</th><th>Due Date</th>
              <th>Amount</th><th>Paid</th><th>Balance</th><th>Status</th><th>Fine</th>
            </tr></thead>
            <tbody>
              ${dueRows.map(f => renderFeeRow(f, true)).join('')}
              ${paidRows.map(f => renderFeeRow(f, false)).join('')}
            </tbody>
          </table>
        </div>
        <!-- Payment panel -->
        <div style="padding:0 1.25rem 1.25rem">
          <div id="paymentPanel" style="background:var(--ink-2);color:white;border-radius:14px;padding:1.25rem 1.5rem;margin-top:1rem">
            <div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8;margin-bottom:1rem">Process Payment</div>
            <div style="display:flex;align-items:flex-end;gap:1rem;flex-wrap:wrap">
              <div style="flex:1;min-width:140px">
                <div style="font-size:.72rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.4rem">Amount (₹)</div>
                <div style="position:relative">
                  <span style="position:absolute;left:.875rem;top:50%;transform:translateY(-50%);color:#94a3b8;font-size:1rem;font-weight:600">₹</span>
                  <input type="number" id="feePayAmount" min="1"
                         style="width:100%;padding:.75rem .875rem .75rem 1.75rem;border-radius:10px;border:2px solid rgba(255,255,255,.1);background:rgba(255,255,255,.08);color:white;font-size:1.1rem;font-weight:700;outline:none"
                         oninput="updatePayBtn()">
                </div>
              </div>
              <div style="flex:2;min-width:200px">
                <div style="font-size:.72rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.4rem">Payment Method</div>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem">
                  ${[['mCash','Cash','fa-money-bill-wave'],['mUPI','UPI','fa-mobile-alt'],['mCheque','Cheque','fa-university'],['mOnline','Online','fa-credit-card']].map(([id,label,icon]) => `
                    <div><input type="radio" name="payMethod" id="${id}" value="${label}" style="display:none" ${label==='Cash'?'checked':''}>
                    <label for="${id}" style="display:flex;flex-direction:column;align-items:center;gap:.3rem;padding:.6rem .4rem;border-radius:10px;cursor:pointer;border:2px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);font-size:.72rem;font-weight:600;color:#94a3b8;transition:all .15s">
                      <i class="fas ${icon}" style="font-size:1.1rem"></i>${label}
                    </label></div>
                  `).join('')}
                </div>
              </div>
              <div style="text-align:right">
                <div style="font-size:.72rem;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.05em">Paying Now</div>
                <div id="payPanelTotal" style="font-size:1.8rem;font-weight:800;color:white">₹0</div>
              </div>
            </div>
            <input type="text" id="feePayRemarks" placeholder="Remarks — cheque no., transaction ID (optional)"
                   style="width:100%;margin-top:.875rem;padding:.6rem .875rem;border-radius:10px;border:2px solid rgba(255,255,255,.1);background:rgba(255,255,255,.07);color:white;font-size:.85rem;outline:none">
            <button id="confirmPayBtn" onclick="confirmFeePayment('${studentId}')"
                    style="width:100%;padding:1rem;margin-top:1rem;border:none;border-radius:10px;
                           background:linear-gradient(135deg,#10b981,#059669);color:white;
                           font-size:1rem;font-weight:800;cursor:pointer;display:flex;
                           align-items:center;justify-content:center;gap:.6rem">
              <i class="fas fa-check-circle"></i>
              Confirm Payment · <span id="payBtnAmt">₹0</span>
            </button>
          </div>
        </div>
      </div>
    </div>`;

    // Sync method radio styles
    document.querySelectorAll('input[name="payMethod"]').forEach(radio => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('input[name="payMethod"]').forEach(r => {
                r.nextElementSibling.style.borderColor = r.checked ? '#10b981' : 'rgba(255,255,255,.1)';
                r.nextElementSibling.style.background  = r.checked ? 'rgba(16,185,129,.15)' : 'rgba(255,255,255,.05)';
                r.nextElementSibling.style.color       = r.checked ? '#6ee7b7' : '#94a3b8';
            });
        });
    });
    // Apply initial Cash selection style
    document.getElementById('mCash')?.dispatchEvent(new Event('change'));
    updateFeeTotal();
}

function renderFeeRow(fee, isDue) {
    const balance = (fee.amount || 0) - (fee.paid || 0) - (fee.discount || 0);
    const isOverdue = isDue && fee.dueDate && new Date(fee.dueDate) < new Date();
    const statusLabel = balance <= 0 ? 'Paid' : isOverdue ? 'Overdue' : (fee.paid > 0 ? 'Partial' : 'Pending');
    const statusClass = balance <= 0 ? 'pill-paid' : isOverdue ? 'pill-overdue' : (fee.paid > 0 ? 'pill-partial' : 'pill-due');
    const fine = fee.fine || 0;
    return `
    <tr id="feeRow_${fee.id}" class="${isDue && balance > 0 ? 'selected' : ''}" style="${balance<=0 ? 'opacity:.55' : ''}">
      <td><input type="checkbox" class="fee-row-cb" data-due="${balance}" data-fee-id="${fee.id}"
                 ${isDue && balance > 0 ? 'checked' : ''} ${balance<=0 ? 'disabled' : ''}
                 style="width:15px;height:15px;accent-color:var(--blue);cursor:pointer" onchange="updateFeeTotal()"></td>
      <td><div class="cell-name">${fee.feeType || 'Tuition Fee'}</div><div class="cell-meta">${fee.category || 'Monthly'}</div></td>
      <td>${fee.month || fee.period || '—'}</td>
      <td style="${isOverdue ? 'color:var(--red);font-weight:600' : ''}">${fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—'}</td>
      <td style="font-weight:700">₹${(fee.amount||0).toLocaleString('en-IN')}</td>
      <td style="color:var(--green);font-weight:600">₹${(fee.paid||0).toLocaleString('en-IN')}</td>
      <td style="font-weight:700;color:${balance>0 ? 'var(--red)' : 'var(--green)'}">₹${Math.max(0,balance).toLocaleString('en-IN')}</td>
      <td><span class="pill ${statusClass}">${statusLabel}</span></td>
      <td style="color:${fine>0?'var(--amber)':'var(--faint)'};font-weight:600">${fine > 0 ? '+₹'+fine : '—'}</td>
    </tr>`;
}

window.updateFeeTotal = window.updatePayBtn = function() {
    let total = 0;
    document.querySelectorAll('.fee-row-cb:checked').forEach(cb => {
        total += parseFloat(cb.dataset.due || 0);
    });
    const fmt = v => '₹' + v.toLocaleString('en-IN');
    const el = document.getElementById('feePayAmount');
    if (el) el.value = total;
    const pp = document.getElementById('payPanelTotal');
    if (pp) pp.textContent = fmt(total);
    const pb = document.getElementById('payBtnAmt');
    if (pb) pb.textContent = fmt(total);
    const sd = document.getElementById('selectedFeeDisplay');
    if (sd) sd.textContent = fmt(total) + ' selected';
};

window.toggleAllFeeRows = function(cb) {
    document.querySelectorAll('.fee-row-cb:not(:disabled)').forEach(c => {
        if (c !== cb) c.checked = cb.checked;
    });
    updateFeeTotal();
};

window.selectAllDueFees = function() {
    document.querySelectorAll('.fee-row-cb:not(:disabled)').forEach(c => c.checked = true);
    document.getElementById('masterFeeCb') && (document.getElementById('masterFeeCb').checked = true);
    updateFeeTotal();
};

window.confirmFeePayment = async function(studentId) {
    const amount = parseFloat(document.getElementById('feePayAmount').value);
    if (!amount || amount <= 0) return showToast('Enter a valid payment amount', 'error');

    const method = document.querySelector('input[name="payMethod"]:checked')?.value || 'Cash';
    const remarks = document.getElementById('feePayRemarks')?.value || '';
    const selectedFeeIds = [...document.querySelectorAll('.fee-row-cb:checked')].map(cb => cb.dataset.feeId);

    if (!selectedFeeIds.length) return showToast('Select at least one fee to pay', 'error');

    // Mark step 3 active
    document.getElementById('feeStep2').className = 'fee-step-item done';
    document.getElementById('feeStep3').className = 'fee-step-item active';
    document.getElementById('confirmPayBtn').disabled = true;
    document.getElementById('confirmPayBtn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing…';

    try {
        // Use your existing PaymentService
        const receiptNo = await PaymentService.recordPayment({
            studentId, amount, method, remarks,
            feeIds: selectedFeeIds,
            recordedBy: firebase.auth().currentUser?.uid || 'admin',
        });
        document.getElementById('feeStep3').className = 'fee-step-item done';
        document.getElementById('feeStep4').className = 'fee-step-item active';
        renderFeeReceipt(studentId, amount, method, receiptNo, remarks);
        showToast('Payment Recorded', 'success', '₹' + amount.toLocaleString('en-IN') + ' · Receipt #' + receiptNo);
    } catch(e) {
        document.getElementById('confirmPayBtn').disabled = false;
        document.getElementById('confirmPayBtn').innerHTML = '<i class="fas fa-check-circle"></i> Confirm Payment · <span id="payBtnAmt">₹' + amount.toLocaleString('en-IN') + '</span>';
        showToast('Payment failed: ' + e.message, 'error');
    }
};

function renderFeeReceipt(studentId, amount, method, receiptNo, remarks) {
    const name = document.getElementById('feeBannerName')?.textContent || 'Student';
    const meta = document.getElementById('feeBannerMeta')?.textContent || '';
    const now = new Date().toLocaleString('en-IN', {day:'numeric',month:'short',year:'numeric',hour:'numeric',minute:'2-digit'});
    const schoolName = document.getElementById('sidebarSchoolName')?.textContent || 'School';

    document.getElementById('feeTableContainer').style.display = 'none';
    document.getElementById('feeSummaryBar').style.display = 'none';

    document.getElementById('feeReceiptContainer').innerHTML = `
    <div style="background:white;border-radius:14px;box-shadow:var(--sh-md);padding:1.5rem;border-top:4px solid var(--green)">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:.5rem;margin-bottom:1rem">
        <div>
          <div style="font-weight:800;font-size:1rem;color:var(--ink)">${schoolName}</div>
          <div style="font-size:.75rem;color:var(--muted)">Receipt No: <strong>#${receiptNo}</strong> · ${now}</div>
        </div>
        <span style="background:var(--green-lt);color:var(--green);border-radius:var(--r-sm);padding:.3rem .75rem;font-size:.75rem;font-weight:700"><i class="fas fa-check-circle"></i> Payment Confirmed</span>
      </div>
      <hr style="border:none;border-top:1.5px dashed var(--border);margin:.875rem 0">
      <div style="display:flex;flex-direction:column;gap:.3rem;font-size:.83rem">
        <div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Student</span><span style="font-weight:600">${name}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Class / Reg.</span><span style="font-weight:600">${meta}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Payment Mode</span><span style="font-weight:600">${method}</span></div>
        ${remarks ? `<div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Remarks</span><span style="font-weight:600">${remarks}</span></div>` : ''}
      </div>
      <hr style="border:none;border-top:2px solid var(--border);margin:.875rem 0">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:.88rem;font-weight:700;color:var(--ink)">Amount Paid</span>
        <span style="font-size:1.3rem;font-weight:800;color:var(--green)">₹${amount.toLocaleString('en-IN')}</span>
      </div>
      <div style="display:flex;gap:.75rem;margin-top:1.25rem">
        <button onclick="window.print()" class="btn btn-outline" style="flex:1"><i class="fas fa-print"></i> Print Receipt</button>
        <button onclick="sendReceiptSMS('${studentId}', '${receiptNo}')" class="btn" style="flex:1;background:var(--green-lt);color:var(--green);border:1.5px solid var(--green-md)"><i class="fas fa-sms"></i> SMS Parent</button>
        <button onclick="clearFeeStudent()" class="btn btn-primary" style="flex:1"><i class="fas fa-plus"></i> Next Student</button>
      </div>
    </div>`;
}

window.sendReceiptSMS = async function(studentId, receiptNo) {
    try {
        await firebase.functions().httpsCallable('sendSmsNotification')({
            studentId, type: 'feeReceipt', receiptNo, schoolId: window.SCHOOL_ID
        });
        showToast('SMS sent to parent', 'success');
    } catch(e) {
        showToast('SMS failed: ' + e.message, 'error');
    }
};
```

---

## STEP 2 — Student Management UI

### What changes
Replace the `studentListSection` render function and add the slide-out drawer HTML.

### 2a. Add drawer HTML to `portal/admin-dashboard.html` (just before `</body>`):
```html
<!-- STUDENT DETAIL DRAWER — add once before </body> -->
<div id="studentDrawerOverlay" onclick="closeStudentDrawer()"
     style="display:none;position:fixed;inset:0;background:rgba(15,23,42,.4);z-index:200;backdrop-filter:blur(2px)"></div>
<div id="studentDrawer" class="drawer" style="width:480px">
  <div class="modal-header">
    <i class="fas fa-user-circle" style="color:var(--blue);font-size:1.1rem"></i>
    <h3>Student Profile</h3>
    <button class="modal-close" onclick="closeStudentDrawer()"><i class="fas fa-times"></i></button>
  </div>
  <div class="modal-body" id="studentDrawerBody">
    <!-- populated by openStudentDrawer() -->
  </div>
  <div class="modal-footer">
    <button class="btn btn-primary" id="drawerFeeBtn"><i class="fas fa-rupee-sign"></i> Collect Fee</button>
    <button class="btn btn-outline" id="drawerEditBtn"><i class="fas fa-edit"></i> Edit</button>
    <button class="btn btn-outline" id="drawerIdBtn"><i class="fas fa-id-card"></i> ID Card</button>
    <button class="btn btn-outline" id="drawerSmsBtn"><i class="fas fa-sms"></i> SMS</button>
  </div>
</div>
```

### 2b. Add these functions to `js/admin-dashboard.js`:
```javascript
// ── STUDENT DRAWER ──────────────────────────────────────────
window.openStudentDrawer = async function(studentId) {
    document.getElementById('studentDrawer').classList.add('open');
    document.getElementById('studentDrawerOverlay').style.display = 'block';
    document.body.style.overflow = 'hidden';
    document.getElementById('studentDrawerBody').innerHTML =
        '<div style="padding:3rem;text-align:center;color:#94a3b8"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';

    const doc = await schoolData('students').doc(studentId).get();
    const s = { id: doc.id, ...doc.data() };
    const initial = (s.name || '?')[0].toUpperCase();

    document.getElementById('studentDrawerBody').innerHTML = `
      <div style="display:flex;align-items:center;gap:1rem;padding:1.25rem;
                  background:linear-gradient(135deg,var(--blue-lt),#f0f9ff);
                  border-radius:var(--r-lg);border:1.5px solid var(--blue-md);margin-bottom:1.25rem">
        <div style="width:56px;height:56px;border-radius:50%;flex-shrink:0;display:flex;
                    align-items:center;justify-content:center;font-weight:800;font-size:1.3rem;
                    color:white;background:linear-gradient(135deg,#1e40af,#7c3aed);
                    box-shadow:0 4px 12px rgba(30,64,175,.3)">${initial}</div>
        <div>
          <div style="font-size:1.05rem;font-weight:800;color:var(--ink)">${s.name || '—'}</div>
          <div style="font-size:.78rem;color:var(--muted)">${s.class || ''} ${s.section ? '— ' + s.section : ''} · Roll: ${s.rollNumber || '—'} · Reg: ${s.studentCode || s.id.slice(-4)}</div>
          <div style="display:flex;gap:.35rem;margin-top:.4rem;flex-wrap:wrap">
            <span class="pill pill-active">Active</span>
            ${s.hostel ? `<span class="pill pill-info">${s.hostel}</span>` : ''}
            ${s.transportRoute ? `<span class="pill pill-info">${s.transportRoute}</span>` : ''}
          </div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-bottom:1rem">
        ${[['DOB', s.dob ? new Date(s.dob).toLocaleDateString('en-IN') : '—'],
           ['Gender', s.gender || '—'],
           ['Blood Group', s.bloodGroup || '—'],
           ['Category', s.category || '—'],
           ['Father', s.fatherName || '—'],
           ['Father Phone', s.fatherPhone || s.phone || '—'],
           ['Mother', s.motherName || '—'],
           ['Mother Phone', s.motherPhone || '—'],
        ].map(([l,v]) => `
          <div style="background:var(--bg);border-radius:var(--r-md);padding:.65rem .875rem">
            <div style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--faint)">${l}</div>
            <div style="font-size:.85rem;font-weight:600;color:var(--ink-2);margin-top:2px">${v}</div>
          </div>
        `).join('')}
        <div style="grid-column:1/-1;background:var(--bg);border-radius:var(--r-md);padding:.65rem .875rem">
          <div style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--faint)">Address</div>
          <div style="font-size:.85rem;font-weight:600;color:var(--ink-2);margin-top:2px">${s.address || '—'}</div>
        </div>
      </div>`;

    // Wire drawer buttons
    document.getElementById('drawerFeeBtn').onclick = () => { closeStudentDrawer(); showSection('classFeePayment'); setTimeout(() => feeSelectStudent(studentId), 400); };
    document.getElementById('drawerEditBtn').onclick = () => { closeStudentDrawer(); showSection('addStudent'); };
    document.getElementById('drawerIdBtn').onclick = () => generateStudentIdCard(studentId);
    document.getElementById('drawerSmsBtn').onclick = () => sendDirectSMS(s.fatherPhone || s.phone, s.name);
};

window.closeStudentDrawer = function() {
    document.getElementById('studentDrawer').classList.remove('open');
    document.getElementById('studentDrawerOverlay').style.display = 'none';
    document.body.style.overflow = '';
};
```

### 2c. Update table row rendering in `js/admin-dashboard.js` (inside `filterAndDisplayStudents` or your render function):

Find where student rows are rendered (look for `<tr>` creation) and update to use the new avatar + action menu pattern:

```javascript
// ── NEW row template — replace your existing row HTML ──
function buildStudentRow(s) {
    const initial = (s.name || '?')[0].toUpperCase();
    const colors = ['linear-gradient(135deg,#3b82f6,#7c3aed)','linear-gradient(135deg,#ec4899,#f97316)',
                    'linear-gradient(135deg,#10b981,#06b6d4)','linear-gradient(135deg,#f59e0b,#ef4444)'];
    const bg = colors[(s.name?.charCodeAt(0) || 65) % colors.length];

    const attPct = s.attendancePercent || 0;
    const attColor = attPct >= 75 ? 'var(--green)' : attPct >= 60 ? 'var(--amber)' : 'var(--red)';

    const balance = (s.feeBalance || 0);
    const feeStatus = balance <= 0 ? 'paid' : (s.partialPaid ? 'partial' : 'due');
    const feeLabel = { paid:'Paid', partial:'Partial', due:'Overdue' }[feeStatus];

    return `<tr id="srow_${s.id}">
      <td><input type="checkbox" class="row-select" data-id="${s.id}" style="width:15px;height:15px;accent-color:var(--blue);cursor:pointer" onchange="updateBulkActions()"></td>
      <td>
        <div class="avatar-cell">
          <div class="avatar-sm" style="background:${bg}">${initial}</div>
          <div>
            <div class="cell-name">${s.name || '—'}</div>
            <div class="cell-meta">${s.fatherName ? 'Father: ' + s.fatherName : ''}</div>
            <div class="cell-mono">#${s.studentCode || s.id.slice(-4)}</div>
          </div>
        </div>
      </td>
      <td><span style="font-weight:600">${s.class || '—'} ${s.section ? '— ' + s.section : ''}</span><div class="cell-meta">Roll: ${s.rollNumber || '—'}</div></td>
      <td><div style="font-size:.82rem">${s.phone || s.fatherPhone || '—'}</div></td>
      <td>
        <div style="display:flex;align-items:center;gap:.5rem">
          <div style="flex:1;height:6px;background:var(--bg);border-radius:20px;overflow:hidden;min-width:50px">
            <div style="height:100%;width:${attPct}%;background:${attColor};border-radius:20px"></div>
          </div>
          <span style="font-size:.75rem;font-weight:700;color:${attColor}">${attPct}%</span>
        </div>
      </td>
      <td><span class="pill pill-${feeStatus}">${feeLabel}</span></td>
      <td style="font-weight:700;color:${balance > 0 ? 'var(--red)' : 'var(--green)'}">
        ${balance > 0 ? '₹' + balance.toLocaleString('en-IN') : '₹0'}
      </td>
      <td>
        <div style="position:relative">
          <button onclick="toggleRowMenu('rm_${s.id}')" style="width:30px;height:30px;border-radius:50%;border:none;background:transparent;cursor:pointer;color:var(--ghost);display:flex;align-items:center;justify-content:center;transition:all .15s" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background='transparent'">
            <i class="fas fa-ellipsis-v"></i>
          </button>
          <div id="rm_${s.id}" style="display:none;position:absolute;right:0;top:110%;background:white;border-radius:14px;box-shadow:var(--sh-lg);border:1px solid var(--border);min-width:180px;z-index:50;overflow:hidden">
            <div onclick="openStudentDrawer('${s.id}')" style="display:flex;align-items:center;gap:.65rem;padding:.65rem 1rem;font-size:.83rem;cursor:pointer;color:var(--ink-3)" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''"><i class="fas fa-eye" style="width:16px;color:var(--muted)"></i> View Profile</div>
            <div onclick="feeSelectStudent('${s.id}');showSection('classFeePayment')" style="display:flex;align-items:center;gap:.65rem;padding:.65rem 1rem;font-size:.83rem;cursor:pointer;color:var(--ink-3)" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''"><i class="fas fa-rupee-sign" style="width:16px;color:var(--muted)"></i> Collect Fee</div>
            <div style="display:flex;align-items:center;gap:.65rem;padding:.65rem 1rem;font-size:.83rem;cursor:pointer;color:var(--ink-3)" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''"><i class="fas fa-edit" style="width:16px;color:var(--muted)"></i> Edit Details</div>
            <div onclick="sendDirectSMS('${s.fatherPhone||s.phone}','${s.name}')" style="display:flex;align-items:center;gap:.65rem;padding:.65rem 1rem;font-size:.83rem;cursor:pointer;color:var(--ink-3)" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''"><i class="fas fa-sms" style="width:16px;color:var(--muted)"></i> Send SMS</div>
            <hr style="border:none;border-top:1px solid var(--border);margin:0">
            <div style="display:flex;align-items:center;gap:.65rem;padding:.65rem 1rem;font-size:.83rem;cursor:pointer;color:var(--red)" onmouseover="this.style.background='var(--red-lt)'" onmouseout="this.style.background=''"><i class="fas fa-trash" style="width:16px;color:var(--red)"></i> Remove Student</div>
          </div>
        </div>
      </td>
    </tr>`;
}

window.toggleRowMenu = function(id) {
    document.querySelectorAll('[id^="rm_"]').forEach(m => { if (m.id !== id) m.style.display = 'none'; });
    const el = document.getElementById(id);
    if (el) el.style.display = el.style.display === 'block' ? 'none' : 'block';
};
document.addEventListener('click', e => {
    if (!e.target.closest('[id^="rm_"]') && !e.target.closest('button[onclick*="toggleRowMenu"]')) {
        document.querySelectorAll('[id^="rm_"]').forEach(m => m.style.display = 'none');
    }
});
```

---

## STEP 3 — Admin Dashboard Home

### What changes
Replace the dashboard overview section content with live KPI cards.

### 3a. Find `dashboardOverviewSection` in `portal/admin-dashboard.html`

### 3b. Add this div inside it where your KPI cards currently are:
```html
<div id="liveKPICards" style="display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1.5rem">
  <!-- Populated by loadLiveDashboardKPIs() -->
  <div class="kpi-card" style="border-top-color:#3b82f6"><div class="skeleton skeleton-card"></div></div>
  <div class="kpi-card" style="border-top-color:#059669"><div class="skeleton skeleton-card"></div></div>
  <div class="kpi-card" style="border-top-color:#d97706"><div class="skeleton skeleton-card"></div></div>
  <div class="kpi-card" style="border-top-color:#7c3aed"><div class="skeleton skeleton-card"></div></div>
</div>
```

### 3c. Add to `js/admin-dashboard.js` (inside your section-switch handler):
```javascript
// When dashboardOverview section becomes active:
if (normalizedId === 'dashboardOverview') {
    loadLiveDashboardKPIs();
    loadRecentPayments();
    loadTodayAttendanceSummary();
}
```

Add the full `loadLiveDashboardKPIs` function from the previous implementation guide (Fix 12 in UI-UX-Code-Implementation-Guide.md).

---

## STEP 4 — Add Student Wizard

### What changes
Convert the single-screen 28-field form into a 4-step wizard.

### 4a. Add the wizard HTML to `addStudentSection` in `admin-dashboard.html`

The wizard HTML is entirely self-contained in `add-student-wizard-ui.html`. Copy everything from `<div class="progress-track">` to the end of `</div><!-- /wizard -->` into your `addStudentSection`.

### 4b. Wire the submit function to your actual Firestore save

Replace the demo `submitForm()` function with:
```javascript
async function submitStudentForm() {
    const data = {
        name: (document.getElementById('f_firstName').value + ' ' + document.getElementById('f_lastName').value).trim(),
        firstName: document.getElementById('f_firstName').value,
        lastName: document.getElementById('f_lastName').value,
        dob: document.getElementById('f_dob').value,
        gender: document.querySelector('input[name="gender"]:checked')?.value || '',
        bloodGroup: document.getElementById('f_bloodGroup').value,
        religion: document.getElementById('f_religion').value,
        category: document.getElementById('f_category').value,
        address: document.getElementById('f_address').value,
        city: document.getElementById('f_city').value,
        state: document.getElementById('f_state').value,
        pin: document.getElementById('f_pin').value,
        class: document.getElementById('f_class').value,
        section: document.getElementById('f_section').value,
        session: document.getElementById('f_session').value,
        rollNumber: document.getElementById('f_roll').value || null,
        admissionDate: document.getElementById('f_admDate').value,
        house: document.getElementById('f_house').value,
        transportRoute: document.getElementById('f_transport').value,
        hostel: document.getElementById('f_hostel').value,
        fatherName: document.getElementById('f_fatherName').value,
        fatherPhone: document.getElementById('f_fatherPhone').value,
        fatherOccupation: document.getElementById('f_fatherOcc').value,
        fatherEmail: document.getElementById('f_fatherEmail').value,
        motherName: document.getElementById('f_motherName').value,
        motherPhone: document.getElementById('f_motherPhone').value,
        emergencyContact: document.getElementById('f_emergName').value,
        emergencyPhone: document.getElementById('f_emergPhone').value,
        medicalInfo: document.getElementById('f_medical').value,
        isActive: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        ...withSchool({}),
    };

    // Auto-generate studentCode
    const count = (await schoolData('students').get()).size;
    data.studentCode = String(1000 + count + 1);

    await schoolData('students').add(data);
    showToast('Student Added', 'success', data.name + ' enrolled in ' + data.class + ' — ' + data.section);
}
```

---

## STEP 5 — Student Portal Replacement

### What changes
Replace `portal/student-dashboard.html` entirely.

### 5a. Copy the file:
```bash
# Backup original
cp portal/student-dashboard.html portal/student-dashboard.html.bak

# Copy new file
cp student-portal-ui.html portal/student-dashboard.html
```

### 5b. Update `js/firebase-config.js` reference in the new file:
The new student-portal-ui.html loads Firebase from CDN. Update the config block at the top to match your `js/firebase-config.js`:
```html
<!-- Replace the placeholder config with your real config -->
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
<script src="/js/firebase-config.js"></script>
<script src="/js/access-control.js"></script>
<script src="/js/auth-guard.js"></script>
<script src="/js/student-dashboard.js"></script>
```

### 5c. Wire each tab to `js/student-dashboard.js` data-load functions:
```javascript
// In the switchTab() function in the new student-portal-ui.html,
// add data-loading calls after tab switch:
const TAB_LOADERS = {
    home:       () => loadStudentHomeSummary(),
    fees:       () => loadStudentFees(),
    attendance: () => loadStudentAttendance(),
    exams:      () => loadStudentExams(),
    results:    () => loadStudentResults(),
    homework:   () => loadStudentHomework(),
    library:    () => loadStudentLibrary(),
    transport:  () => loadStudentTransport(),
    materials:  () => loadStudentMaterials(),
    profile:    () => loadStudentProfile(),
    certificates: () => loadStudentCertificates(),
};

// Inside switchTab():
if (TAB_LOADERS[tab]) TAB_LOADERS[tab]();
```

---

## TESTING CHECKLIST

After each integration step, verify:

**Fee Collection:**
- [ ] Student search dropdown shows results from Firestore
- [ ] Clicking a result populates the banner
- [ ] Fee table loads with correct balances
- [ ] Selecting checkboxes updates the "Paying Now" total
- [ ] Confirm payment writes to Firestore and shows receipt
- [ ] SMS button calls Cloud Function

**Student Management:**
- [ ] Table renders with avatar + status pill pattern
- [ ] 3-dot menu opens and all items work
- [ ] Clicking "View Profile" opens the drawer
- [ ] Drawer shows correct student data from Firestore
- [ ] Drawer "Collect Fee" navigates to fee section with student pre-selected
- [ ] Export CSV downloads correctly

**Dashboard Home:**
- [ ] KPI cards show live counts from Firestore
- [ ] Attendance % is today's actual data
- [ ] Trend arrows show vs. last month

**Add Student:**
- [ ] Step 1→2→3→4 navigation works
- [ ] Review panel populates from form fields in real time
- [ ] Back navigation returns to correct step
- [ ] DPDP consent checkbox required before final save
- [ ] Save writes to Firestore `schools/{id}/students`

**Student Portal:**
- [ ] Mobile bottom nav shows on screens < 768px
- [ ] Fee tab shows real outstanding amounts
- [ ] Attendance tab shows subject-wise chart from Firestore
- [ ] Download PDF button works for results/admit card
- [ ] Logout works

---

## DEPLOYMENT

```bash
# After all integrations:
npm run lint     # Check for JS errors
firebase deploy  # Deploy to production
```

**Estimated integration time per section:**
- Design system CSS: 30 minutes
- Fee collection: 3–4 hours
- Student management: 3–4 hours
- Dashboard home KPIs: 2 hours
- Add student wizard: 2–3 hours
- Student portal: 2–3 hours

**Total: 12–16 hours of focused integration work**
