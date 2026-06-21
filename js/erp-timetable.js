const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIOD_COUNT = 8;

let _ttState = { subjects: [], teachers: [], editingClassId: null };

async function initERPTimetable() {
    _populateSelects();
    const visible = document.querySelector('.dashboard-section.active') || document.querySelector('.dashboard-section[style*="block"]');
    const sectionId = visible ? (visible.id || '').replace('Section', '') : window._currentSectionId || '';
    if (sectionId === 'createTimetable' || sectionId === 'viewTimetable') {
        await _initGridEditor();
    } else if (sectionId === 'classTimetables') {
        await loadTimetableList();
    } else if (sectionId === 'teacherTimetables') {
        await _initTeacherView();
    }
}

function _populateSelects() {
    const sessSelectors = ['#tt_sessionSelect', '#ttSessionSelect', '#ttSessSelect'];
    sessSelectors.forEach(sel => {
        const el = document.querySelector(sel);
        if (el && erpState.sessions) {
            el.innerHTML = '<option value="">Select Session</option>' +
                erpState.sessions.map(s => `<option value="${s.id}" ${s.active ? 'selected' : ''}>${s.name}</option>`).join('');
        }
    });
    const clsSelectors = ['#tt_classSelect', '#ttClassSelect', '#ttClsSelect'];
    clsSelectors.forEach(sel => {
        const el = document.querySelector(sel);
        if (el && erpState.classes) {
            el.innerHTML = '<option value="">Select Class</option>' +
                erpState.classes.map(c => `<option value="${c.name}" data-id="${c.id}">${c.name}</option>`).join('');
        }
    });
}

async function _initGridEditor() {
    _ttState.subjects = [];
    _ttState.teachers = [];
    _ttState.editingClassId = null;
    try {
        const sessId = document.getElementById('tt_sessionSelect')?.value || document.getElementById('ttSessSelect')?.value;
        if (sessId) {
            const [subSnap, staffSnap] = await Promise.all([
                schoolData('subjects').where('sessionId', '==', sessId).get(),
                schoolData('staff').where('role', '==', 'Teacher').get()
            ]);
            _ttState.subjects = subSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            _ttState.teachers = staffSnap.docs.map(d => ({ id: d.id, name: d.data().name || d.data().employeeName || d.id }));
        }
    } catch (e) { console.error('Error loading subjects/teachers:', e); }
    const grid = document.getElementById('timetableGridEditor');
    if (grid) grid.innerHTML = _buildGridHtml();
    document.querySelectorAll('.tt-teacher-select').forEach(sel => {
        sel.addEventListener('change', _realtimeConflictCheck);
    });
    document.querySelectorAll('.tt-subj-select').forEach(sel => {
        sel.addEventListener('change', _realtimeConflictCheck);
    });
    const classSelect = document.getElementById('tt_classSelect');
    if (classSelect) classSelect.onchange = () => _loadGridPeriods();
    const sessSelect = document.getElementById('tt_sessionSelect');
    if (sessSelect) sessSelect.onchange = () => { _populateSelects(); _initGridEditor(); };
    if (classSelect && classSelect.value) await _loadGridPeriods();
}

function _buildGridHtml() {
    const subjects = _ttState.subjects;
    const teachers = _ttState.teachers;
    let html = `<div class="timetable-grid-wrapper" style="overflow-x:auto;"><table class="portal-table timetable-grid" style="min-width:900px;font-size:0.85rem;">
        <thead><tr><th style="width:100px;min-width:100px;">Day</th>`;
    for (let p = 1; p <= PERIOD_COUNT; p++) html += `<th style="min-width:160px;">Period ${p}</th>`;
    html += `</tr></thead><tbody>`;
    DAYS.forEach(day => {
        html += `<tr><td class="tt-day-label" style="font-weight:600;vertical-align:middle;">${day}</td>`;
        for (let p = 1; p <= PERIOD_COUNT; p++) {
            html += `<td class="tt-cell" data-day="${day}" data-period="${p}" style="padding:4px;vertical-align:top;">
                <select class="tt-subj-select form-control" style="font-size:0.75rem;padding:2px 4px;margin-bottom:2px;">
                    <option value="">--</option>
                    ${subjects.map(s => `<option value="${s.id}">${s.name || s.id}</option>`).join('')}
                </select>
                <select class="tt-teacher-select form-control" style="font-size:0.75rem;padding:2px 4px;margin-bottom:2px;">
                    <option value="">--</option>
                    ${teachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                </select>
                <input type="text" class="tt-room-input form-control" placeholder="Rm" style="font-size:0.75rem;padding:2px 4px;width:100%;" />
                <span class="tt-conflict-badge" style="display:none;color:#ef4444;font-size:0.65rem;"><i class="fas fa-exclamation-triangle"></i> Same teacher</span>
            </td>`;
        }
        html += `</tr>`;
    });
    html += `</tbody></table></div>
    <div style="margin-top:0.5rem;display:flex;gap:0.5rem;flex-wrap:wrap;">
        <button class="btn-portal btn-primary" onclick="_saveAllPeriods()"><i class="fas fa-save mr-1"></i> Save All Periods</button>
        <button class="btn-portal btn-ghost" onclick="_clearGrid()"><i class="fas fa-eraser mr-1"></i> Clear Grid</button>
        <span id="ttSaveStatus" style="flex:1;text-align:right;font-size:0.85rem;color:var(--text-muted);align-self:center;"></span>
    </div>`;
    return html;
}

function _realtimeConflictCheck() {
    const cells = document.querySelectorAll('.tt-cell');
    cells.forEach(cell => {
        const badge = cell.querySelector('.tt-conflict-badge');
        const teacherSel = cell.querySelector('.tt-teacher-select');
        if (badge) badge.style.display = 'none';
        cell.style.boxShadow = '';
        if (!teacherSel || !teacherSel.value) return;
        const day = cell.dataset.day;
        const period = cell.dataset.period;
        const teacherId = teacherSel.value;
        cells.forEach(other => {
            if (other === cell) return;
            if (other.dataset.day !== day || other.dataset.period !== period) return;
            const otherTeacher = other.querySelector('.tt-teacher-select');
            if (otherTeacher && otherTeacher.value === teacherId) {
                const b = other.querySelector('.tt-conflict-badge');
                if (b) b.style.display = 'inline';
                other.style.boxShadow = 'inset 0 0 0 2px #ef4444';
                if (badge) badge.style.display = 'inline';
                cell.style.boxShadow = 'inset 0 0 0 2px #ef4444';
            }
        });
    });
}

async function _loadGridPeriods() {
    const classSelect = document.getElementById('tt_classSelect');
    if (!classSelect || !classSelect.value) return;
    const className = classSelect.value;
    const classId = className.toLowerCase().replace(/\s+/g, '-');
    _ttState.editingClassId = classId;
    try {
        const snap = await schoolData('timetables').doc(classId).collection('periods').get();
        const periods = {};
        snap.docs.forEach(d => { periods[d.id] = d.data(); });
        document.querySelectorAll('.tt-cell').forEach(cell => {
            const day = cell.dataset.day;
            const period = cell.dataset.period;
            const key = `${day}_${period}`;
            const data = periods[key];
            const subjSel = cell.querySelector('.tt-subj-select');
            const teacherSel = cell.querySelector('.tt-teacher-select');
            const roomInput = cell.querySelector('.tt-room-input');
            if (data) {
                if (subjSel) subjSel.value = data.subjectId || '';
                if (teacherSel) teacherSel.value = data.teacherId || '';
                if (roomInput) roomInput.value = data.room || '';
            } else {
                if (subjSel) subjSel.value = '';
                if (teacherSel) teacherSel.value = '';
                if (roomInput) roomInput.value = '';
            }
        });
        _realtimeConflictCheck();
    } catch (e) { console.error('Error loading periods:', e); }
}

async function _saveAllPeriods() {
    const classId = _ttState.editingClassId;
    if (!classId) { showToast('Please select a class first', 'error'); return; }
    const className = document.getElementById('tt_classSelect')?.value;
    if (!className) return;
    const sessId = document.getElementById('tt_sessionSelect')?.value || document.getElementById('ttSessSelect')?.value;
    showLoading(true);
    const statusEl = document.getElementById('ttSaveStatus');
    let saved = 0;
    const batch = firebase.firestore().batch();
    const ttRef = schoolData('timetables').doc(classId);
    batch.set(ttRef, withSchool({
        className, sessionId: sessId || '',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }), { merge: true });
    const cells = document.querySelectorAll('.tt-cell');
    for (const cell of cells) {
        const day = cell.dataset.day;
        const period = cell.dataset.period;
        const subjSel = cell.querySelector('.tt-subj-select');
        const teacherSel = cell.querySelector('.tt-teacher-select');
        const roomInput = cell.querySelector('.tt-room-input');
        const subjectName = subjSel ? subjSel.options[subjSel.selectedIndex]?.text || '' : '';
        const teacherName = teacherSel ? teacherSel.options[teacherSel.selectedIndex]?.text || '' : '';
        const subjectVal = subjSel ? subjSel.value : '';
        const teacherVal = teacherSel ? teacherSel.value : '';
        const room = roomInput ? roomInput.value.trim() : '';
        const periodRef = ttRef.collection('periods').doc(`${day}_${period}`);
        if (subjectVal || teacherVal || room) {
            batch.set(periodRef, {
                day, periodNumber: parseInt(period),
                subjectId: subjectVal, subject: subjectName,
                teacherId: teacherVal, teacherName,
                room
            });
            saved++;
        } else {
            batch.delete(periodRef);
        }
    }
    try {
        await batch.commit();
        if (statusEl) statusEl.textContent = `Saved ${saved} periods for ${className}`;
        showToast(`Timetable saved for ${className}`);
    } catch (e) {
        showToast('Error saving timetable: ' + e.message, 'error');
    } finally {
        showLoading(false);
    }
}

function _clearGrid() {
    document.querySelectorAll('.tt-cell').forEach(cell => {
        const subjSel = cell.querySelector('.tt-subj-select');
        const teacherSel = cell.querySelector('.tt-teacher-select');
        const roomInput = cell.querySelector('.tt-room-input');
        if (subjSel) subjSel.value = '';
        if (teacherSel) teacherSel.value = '';
        if (roomInput) roomInput.value = '';
        const badge = cell.querySelector('.tt-conflict-badge');
        if (badge) badge.style.display = 'none';
        cell.style.boxShadow = '';
    });
}

async function loadTimetableList() {
    const list = document.getElementById('timetableListBody');
    if (!list) return;
    try {
        const sessFilter = document.getElementById('ttSessionSelect')?.value || document.getElementById('ttSessSelect')?.value;
        const classFilter = document.getElementById('ttClassSelect')?.value || document.getElementById('ttClsSelect')?.value;
        let snap = await schoolData('timetables').get();
        let docs = snap.docs.map(d => ({ id: d.id, ...d.data(), _hasPeriods: false }));
        for (const d of docs) {
            const pSnap = await schoolData('timetables').doc(d.id).collection('periods').limit(1).get();
            d._hasPeriods = !pSnap.empty;
        }
        if (sessFilter) docs = docs.filter(d => d.sessionId === sessFilter);
        if (classFilter) docs = docs.filter(d => d.className === classFilter);
        if (docs.length === 0) {
            list.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:2rem;">No timetables found for the selected criteria.</td></tr>';
            return;
        }
        list.innerHTML = docs.map(d => {
            const date = d.updatedAt ? new Date(d.updatedAt.seconds * 1000).toLocaleDateString() : (d.uploadedAt ? new Date(d.uploadedAt.seconds * 1000).toLocaleDateString() : 'N/A');
            const hasGrid = d._hasPeriods;
            return `<tr>
                <td><strong>${d.className}</strong> ${hasGrid ? '<span style="color:#22c55e;font-size:0.75rem;"><i class="fas fa-table"></i> Grid</span>' : ''}</td>
                <td>${date}</td>
                <td><span style="font-size:0.75rem;color:var(--text-muted);">${hasGrid ? 'Structured' : (d.fileName ? d.fileName : 'N/A')}</span></td>
                <td style="text-align:right;white-space:nowrap;">
                    ${hasGrid ? `<button onclick="viewClassGrid('${d.id}')" class="btn-portal btn-ghost btn-sm"><i class="fas fa-th"></i></button>` : ''}
                    ${d.fileUrl ? `<a href="${d.fileUrl}" target="_blank" class="btn-portal btn-ghost btn-sm"><i class="fas fa-file-pdf"></i></a>` : ''}
                    <button onclick="deleteTimetable('${d.id}')" class="btn-portal btn-ghost btn-sm btn-danger"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        }).join('');
    } catch (e) { console.error('Error loading timetables:', e); }
}

async function viewClassGrid(classId) {
    const modal = document.getElementById('modalOverlay') || _ensureModal();
    modal.style.display = 'flex';
    modal.innerHTML = `<div class="modal-content" style="max-width:95vw;max-height:90vh;overflow:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 1rem;">
            <h3 style="margin:0;">Timetable: ${classId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
            <button onclick="this.closest('#modalOverlay').style.display='none'" class="btn-portal btn-ghost btn-sm"><i class="fas fa-times"></i></button>
        </div>
        <div id="classGridView" style="padding:1rem;"><div style="text-align:center;padding:2rem;"><i class="fas fa-spinner fa-spin"></i> Loading...</div></div>
    </div>`;
    try {
        const pSnap = await schoolData('timetables').doc(classId).collection('periods').get();
        const periods = {};
        pSnap.docs.forEach(d => { periods[d.id] = d.data(); });
        let html = `<table class="portal-table" style="font-size:0.8rem;min-width:700px;"><thead><tr><th>Day</th>`;
        for (let p = 1; p <= PERIOD_COUNT; p++) html += `<th>P${p}</th>`;
        html += `</tr></thead><tbody>`;
        DAYS.forEach(day => {
            html += `<tr><td style="font-weight:600;">${day}</td>`;
            for (let p = 1; p <= PERIOD_COUNT; p++) {
                const key = `${day}_${p}`;
                const data = periods[key];
                if (data) {
                    html += `<td style="font-size:0.75rem;padding:4px 6px;">
                        <div style="font-weight:600;">${escHtml(data.subject || '')}</div>
                        <div style="color:var(--text-muted);font-size:0.7rem;">${escHtml(data.teacherName || '')}</div>
                        ${data.room ? `<div style="color:var(--text-muted);font-size:0.65rem;">Rm ${escHtml(data.room)}</div>` : ''}
                    </td>`;
                } else {
                    html += `<td style="color:#ccc;font-size:0.7rem;text-align:center;">-</td>`;
                }
            }
            html += `</tr>`;
        });
        html += `</tbody></table>`;
        document.getElementById('classGridView').innerHTML = html;
    } catch (e) {
        document.getElementById('classGridView').innerHTML = '<div style="color:var(--danger);padding:1rem;">Error loading timetable</div>';
    }
}

function _ensureModal() {
    let modal = document.getElementById('modalOverlay');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalOverlay';
        modal.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;align-items:center;justify-content:center;';
        modal.onclick = function (e) { if (e.target === this) this.style.display = 'none'; };
        document.body.appendChild(modal);
    }
    return modal;
}

async function handleTimetableUpload(event) {
    event.preventDefault();
    const className = document.getElementById('ttClsSelect')?.value || document.getElementById('tt_classSelect')?.value;
    const fileInput = document.getElementById('tt_file');
    if (!className || fileInput.files.length === 0) {
        showToast('Please select a class and a file', 'error');
        return;
    }
    try {
        showLoading(true);
        const file = fileInput.files[0];
        const saved = await window.ImageStorage.saveFile(file, {
            fieldName: 'Timetable',
            compress: file.type && file.type.startsWith('image/'),
        });
        const sessionId = document.getElementById('ttSessSelect')?.value || document.getElementById('tt_sessionSelect')?.value;
        const classId = className.toLowerCase().replace(/\s+/g, '-');
        await schoolDoc('timetables', classId).set(withSchool({
            className, sessionId: sessionId || '',
            fileData: saved.dataUri, fileUrl: saved.dataUri,
            fileName: saved.name, fileMime: saved.mime,
            fileSize: saved.sizeBytes,
            uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
        }), { merge: true });
        showToast(`Timetable for ${className} uploaded successfully!`);
        event.target.reset();
        await loadTimetableList();
    } catch (e) {
        showToast('Error uploading timetable: ' + e.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function deleteTimetable(id) {
    if (!await window.showConfirmModal({ title: 'Delete Timetable', message: 'Delete this timetable?', icon: 'fa-calendar-alt', confirmText: 'Delete', danger: true })) return;
    try {
        showLoading(true);
        const ref = schoolData('timetables').doc(id);
        const pSnap = await ref.collection('periods').get();
        const batch = firebase.firestore().batch();
        pSnap.docs.forEach(d => batch.delete(d.ref));
        batch.delete(ref);
        await batch.commit();
        showToast('Timetable deleted');
        await loadTimetableList();
    } catch (e) {
        showToast('Error deleting timetable', 'error');
    } finally {
        showLoading(false);
    }
}

async function _initTeacherView() {
    const sessSelect = document.getElementById('ttSessSelect') || document.getElementById('ttSessionSelect');
    const teacherSelect = document.getElementById('ttTeacherSelect');
    if (!teacherSelect) return;
    try {
        const staffSnap = await schoolData('staff').where('role', '==', 'Teacher').get();
        teacherSelect.innerHTML = '<option value="">Select Teacher</option>' +
            staffSnap.docs.map(d => {
                const data = d.data();
                return `<option value="${d.id}">${escHtml(data.name || data.employeeName || d.id)}</option>`;
            }).join('');
    } catch (e) { console.error('Error loading teachers:', e); }
    if (sessSelect) sessSelect.onchange = () => _populateSelects();
    teacherSelect.onchange = () => _loadTeacherGrid();
    if (teacherSelect.value) await _loadTeacherGrid();
}

async function _loadTeacherGrid() {
    const teacherId = document.getElementById('ttTeacherSelect')?.value;
    const tbody = document.getElementById('teacherTimetableBody');
    if (!teacherId || !tbody) {
        if (tbody) tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-4">Select a teacher to view their timetable.</td></tr>';
        return;
    }
    try {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center py-4"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
        const snap = await schoolData('timetables').get();
        const teacherPeriods = {};
        for (const doc of snap.docs) {
            const className = doc.data().className || doc.id;
            const pSnap = await doc.ref.collection('periods').where('teacherId', '==', teacherId).get();
            pSnap.docs.forEach(pd => {
                const data = pd.data();
                const key = `${data.day}_${data.periodNumber}`;
                teacherPeriods[key] = { className, subject: data.subject || '', room: data.room || '' };
            });
        }
        let html = '';
        DAYS.forEach(day => {
            html += `<tr><td style="font-weight:600;">${day}</td>`;
            for (let p = 1; p <= PERIOD_COUNT; p++) {
                const key = `${day}_${p}`;
                const tp = teacherPeriods[key];
                if (tp) {
                    html += `<td style="font-size:0.75rem;padding:4px 6px;background:rgba(34,197,94,0.08);">
                        <div style="font-weight:600;">${escHtml(tp.subject)}</div>
                        <div style="font-size:0.65rem;color:var(--text-muted);">${escHtml(tp.className)}${tp.room ? ' · Rm '+escHtml(tp.room) : ''}</div>
                    </td>`;
                } else {
                    html += `<td style="color:#ccc;text-align:center;font-size:0.7rem;">-</td>`;
                }
            }
            html += `</tr>`;
        });
        tbody.innerHTML = html;
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-danger py-4">Error loading timetable</td></tr>';
    }
}

function escHtml(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

window.initERPTimetable = initERPTimetable;
window.handleTimetableUpload = handleTimetableUpload;
window.deleteTimetable = deleteTimetable;
window.loadTimetableList = loadTimetableList;
window.viewClassGrid = viewClassGrid;
