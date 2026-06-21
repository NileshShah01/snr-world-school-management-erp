/**
 * erp-homework.js - Homework Management Logic
 */

let homeworkState = {
    homeworks: [],
    editingId: null,
};

/**
 * Initialize Homework Module
 */
async function initERPHomework() {
    console.log('ERP Homework Initializing...');

    // Populate session dropdown for homework
    const sessionSelect = document.getElementById('hw_sessionSelect');
    if (sessionSelect && erpState.sessions) {
        sessionSelect.innerHTML =
            '<option value="">Select Session</option>' +
            erpState.sessions
                .map(
                    (s) =>
                        `<option value="${s.id}" data-name="${s.name}" ${s.active ? 'selected' : ''}>${s.name}</option>`
                )
                .join('');

        if (erpState.activeSessionId) {
            await loadHomeworkClasses();
        }
    }

    await loadHomeworkHistory();
}

/**
 * Load classes for homework
 */
async function loadHomeworkClasses() {
    const sessionSelect = document.getElementById('hw_sessionSelect');
    const classSelect = document.getElementById('hw_classSelect');
    if (!sessionSelect || !classSelect) return;

    const sessionId = sessionSelect.value;
    if (!sessionId) {
        classSelect.innerHTML = '<option value="">Select Class</option>';
        return;
    }

    try {
        const snapshot = await schoolData('classes')
            .where('sessionId', '==', sessionId)
            .orderBy('sortOrder', 'asc')
            .get();
        const classes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        classSelect.innerHTML =
            '<option value="">Select Class</option>' +
            classes.map((cls) => `<option value="${cls.name}" data-id="${cls.id}">${cls.name}</option>`).join('');

        // Reset section select
        const secSelect = document.getElementById('hw_sectionSelect');
        if (secSelect) secSelect.innerHTML = '<option value="">Select Section</option>';

        // Also load subjects for this session
        await loadHomeworkSubjects(sessionId);
    } catch (e) {
        console.error('Error loading homework classes:', e);
    }
}

async function loadHomeworkSubjects(sessionId) {
    const subSelect = document.getElementById('hw_subjectSelect');
    if (!subSelect) return;

    try {
        const snapshot = await schoolData('subjects').where('sessionId', '==', sessionId).get();
        const subjects = snapshot.docs.map((doc) => doc.data().name);

        subSelect.innerHTML =
            '<option value="">Select Subject</option>' +
            subjects.map((s) => `<option value="${s}">${s}</option>`).join('');
    } catch (e) {
        console.error('Error loading subjects:', e);
    }
}

function updateHomeworkSections() {
    const classSelect = document.getElementById('hw_classSelect');
    const secSelect = document.getElementById('hw_sectionSelect');
    if (!classSelect || !secSelect) return;

    const selectedOption = classSelect.options[classSelect.selectedIndex];
    const classId = selectedOption?.getAttribute('data-id');

    if (!classId) return;

    const cls = erpState.classes.find((c) => c.id === classId);
    if (!cls || !cls.sections) return;

    secSelect.innerHTML =
        '<option value="All">All Sections</option>' +
        cls.sections.map((sec) => `<option value="${sec}">${sec}</option>`).join('');
}

/**
 * Handle Homework Submission
 */
async function handleHomeworkSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const session =
        document.getElementById('hw_sessionSelect').options[document.getElementById('hw_sessionSelect').selectedIndex]
            .text;
    const className = document.getElementById('hw_classSelect').value;
    const section = document.getElementById('hw_sectionSelect').value;
    const subject = document.getElementById('hw_subjectSelect').value;
    const title = document.getElementById('hw_title').value.trim();
    const description = document.getElementById('hw_description').value.trim();
    const date = document.getElementById('hw_date').value || new Date().toISOString().split('T')[0];
    const fileInput = document.getElementById('hw_file');

    if (!className || !subject || !title || !description) {
        showToast('Please fill all mandatory fields', 'error');
        return;
    }

    try {
        showLoading(true);
        let attachment = null;

        // Handle File Upload if exists (Base64 in Firestore, no Firebase Storage)
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const saved = await window.ImageStorage.saveFile(file, { fieldName: 'Attachment' });
            attachment = {
                name: saved.name,
                mime: saved.mime,
                sizeBytes: saved.sizeBytes,
                dataUri: saved.dataUri,
            };
        }

        const hwData = withSchool({
            session,
            class: className,
            section,
            subject,
            title,
            description,
            content: description, // Backward compatibility for student dashboard
            date: firebase.firestore.Timestamp.fromDate(new Date(date)),
            attachment, // Base64 object {name, mime, sizeBytes, dataUri} or null
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });

        if (homeworkState.editingId) {
            await schoolDoc('homework', homeworkState.editingId).update(hwData);
            showToast('Homework updated successfully');
        } else {
            await schoolData('homework').add(hwData);
            showToast('Homework assigned successfully');
        }

        form.reset();
        homeworkState.editingId = null;
        document.getElementById('hw_formSubmitBtn').innerHTML = '<i class="fas fa-paper-plane"></i> Assign Homework';
        await loadHomeworkHistory();
    } catch (e) {
        console.error('Error saving homework:', e);
        showToast('Error saving homework', 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Load History
 */
async function loadHomeworkHistory() {
    const list = document.getElementById('homeworkHistoryList');
    if (!list) return;

    try {
        const snap = await schoolData('homework').orderBy('timestamp', 'desc').limit(20).get();

        if (snap.empty) {
            showEmptyState(list, { icon: 'fa-history', message: 'No homework history found.' });
            return;
        }

        list.innerHTML = snap.docs
            .map((doc) => {
                const d = doc.data();
                const dateStr = d.date ? new Date(d.date.seconds * 1000).toLocaleDateString() : 'N/A';
                // Backward-compat: old records stored a download URL string.
                // New records store { name, mime, sizeBytes, dataUri }.
                const att = d.attachment;
                const attHref = att && typeof att === 'object' && att.dataUri
                    ? att.dataUri
                    : (typeof att === 'string' ? att : '');
                const attLabel = att && typeof att === 'object' && att.name
                    ? att.name
                    : (att ? 'Attachment' : '');
                const attBadge = attHref
                    ? `<a href="${attHref}" target="_blank" rel="noopener" class="badge" style="background:var(--accent); color:white; text-decoration:none;"><i class="fas fa-paperclip"></i> ${attLabel}</a>`
                    : '';
                return `
                <div class="card" style="margin-bottom: 1rem; border-left: 4px solid var(--primary);">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <div>
                            <span class="badge" style="background:var(--bg-gray);">${d.subject}</span>
                            <span class="badge" style="background:var(--primary); color:white;">Class ${d.class} (${d.section})</span>
                            <h4 style="margin: 0.5rem 0 0.25rem;">${d.title}</h4>
                            <p style="font-size:0.8rem; color:var(--text-muted);">For Date: ${dateStr}</p>
                            ${attBadge}
                        </div>
                        <div style="display:flex; gap:0.5rem;">
                            <button onclick="editHomework('${doc.id}')" class="btn-portal btn-ghost btn-sm" title="Edit"><i class="fas fa-edit"></i></button>
                            <button onclick="deleteHomework('${doc.id}')" class="btn-portal btn-ghost btn-sm btn-danger" title="Delete"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            `;
            })
            .join('');
    } catch (e) {
        console.error('Error loading history:', e);
    }
}

async function deleteHomework(id) {
    if (!await window.showConfirmModal({ title: 'Delete Homework', message: 'Are you sure you want to delete this homework?', icon: 'fa-book-open', confirmText: 'Delete', danger: true })) return;
    try {
        showLoading(true);
        await schoolDoc('homework', id).delete();
        showToast('Homework deleted');
        await loadHomeworkHistory();
    } catch (e) {
        showToast('Error deleting homework', 'error');
    } finally {
        showLoading(false);
    }
}

async function editHomework(id) {
    try {
        showLoading(true);
        const doc = await schoolDoc('homework', id).get();
        if (!doc.exists) return;
        const d = doc.data();

        homeworkState.editingId = id;
        document.getElementById('hw_title').value = d.title;
        document.getElementById('hw_description').value = d.description;
        document.getElementById('hw_subjectSelect').value = d.subject;
        document.getElementById('hw_classSelect').value = d.class;
        updateHomeworkSections();
        document.getElementById('hw_sectionSelect').value = d.section;

        document.getElementById('hw_formSubmitBtn').innerHTML = '<i class="fas fa-save"></i> Update Homework';
        showSection('assignHomework');
    } catch (e) {
        console.error(e);
    } finally {
        showLoading(false);
    }
}

async function initHomeworkGrading() {
    _populateGradingFilters();
    await loadHomeworkWithStats();
}

function _populateGradingFilters() {
    const sel = document.getElementById('hwGradeSession');
    if (sel && erpState.sessions) {
        sel.innerHTML = '<option value="">All Sessions</option>' +
            erpState.sessions.map(s => `<option value="${s.id}" ${s.active?'selected':''}>${s.name}</option>`).join('');
    }
    const clsSel = document.getElementById('hwGradeClass');
    if (clsSel && erpState.classes) {
        clsSel.innerHTML = '<option value="">All Classes</option>' +
            erpState.classes.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    }
}

async function loadHomeworkWithStats() {
    const list = document.getElementById('gradeHomeworkList');
    if (!list) return;
    try {
        list.innerHTML = '<div style="text-align:center;padding:2rem;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
        const sessFilter = document.getElementById('hwGradeSession')?.value;
        const clsFilter = document.getElementById('hwGradeClass')?.value;
        let snap = await schoolData('homework').orderBy('timestamp', 'desc').limit(50).get();
        let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (sessFilter) docs = docs.filter(d => d.session === sessFilter || d.sessionId === sessFilter);
        if (clsFilter) docs = docs.filter(d => d.class === clsFilter);
        if (docs.length === 0) {
            showEmptyState(list, { icon: 'fa-book-open', message: 'No homework found.' });
            return;
        }
        for (const d of docs) {
            const subSnap = await schoolData('homework').doc(d.id).collection('submissions').get();
            d._totalSubmissions = subSnap.size;
            d._gradedCount = subSnap.docs.filter(s => s.data().status === 'graded').length;
        }
        list.innerHTML = docs.map(d => {
            const subInfo = d._totalSubmissions > 0
                ? `<span style="font-size:0.8rem;color:var(--text-muted);">${d._gradedCount}/${d._totalSubmissions} graded</span>`
                : '<span style="font-size:0.8rem;color:var(--text-muted);">No submissions</span>';
            return `<div class="card" style="margin-bottom:0.75rem;border-left:4px solid ${d._totalSubmissions > 0 ? (d._gradedCount === d._totalSubmissions ? '#22c55e' : '#f59e0b') : '#6b7280'};cursor:pointer;" onclick="toggleSubmissionsPanel('${d.id}')">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <span class="badge" style="background:var(--bg-gray);">${escHtml(d.subject)}</span>
                        <span class="badge" style="background:var(--primary);color:white;">${escHtml(d.class)} (${escHtml(d.section||'All')})</span>
                        <h4 style="margin:0.25rem 0 0;">${escHtml(d.title)}</h4>
                        ${subInfo}
                    </div>
                    <div><i class="fas fa-chevron-down" style="color:var(--text-muted);transition:transform 0.2s;"></i></div>
                </div>
                <div id="subPanel_${d.id}" class="hidden" style="margin-top:0.75rem;padding-top:0.75rem;border-top:1px solid var(--border-color);">
                    <div style="text-align:center;padding:1rem;"><i class="fas fa-spinner fa-spin"></i></div>
                </div>
            </div>`;
        }).join('');
    } catch (e) {
        console.error('Error loading homework stats:', e);
        list.innerHTML = '<p style="text-align:center;color:var(--danger);padding:2rem;">Error loading homework.</p>';
    }
}

async function toggleSubmissionsPanel(homeworkId) {
    const panel = document.getElementById('subPanel_' + homeworkId);
    if (!panel) return;
    const isHidden = panel.classList.contains('hidden');
    document.querySelectorAll('[id^="subPanel_"]').forEach(p => { if (p.id !== 'subPanel_' + homeworkId) p.classList.add('hidden'); });
    if (isHidden) {
        panel.classList.remove('hidden');
        await loadSubmissionsForHomework(homeworkId);
    } else {
        panel.classList.add('hidden');
    }
}

async function loadSubmissionsForHomework(homeworkId) {
    const panel = document.getElementById('subPanel_' + homeworkId);
    if (!panel) return;
    try {
        const subSnap = await schoolData('homework').doc(homeworkId).collection('submissions').orderBy('submittedAt', 'desc').get();
        if (subSnap.empty) {
            showEmptyState(panel, { icon: 'fa-inbox', message: 'No submissions yet.' });
            return;
        }
        panel.innerHTML = subSnap.docs.map(sd => {
            const s = sd.data();
            const statusBadge = s.status === 'graded'
                ? `<span class="badge" style="background:#22c55e;color:white;">Graded: ${s.marks ?? '-'}</span>`
                : `<span class="badge" style="background:#f59e0b;color:white;">Pending</span>`;
            const subDate = s.submittedAt ? new Date(s.submittedAt.seconds * 1000).toLocaleString() : 'N/A';
            const fileLink = s.fileData ? `<a href="${s.fileData}" target="_blank" class="btn-portal btn-ghost btn-sm"><i class="fas fa-file"></i> View</a>` : '';
            const feedbackHtml = s.feedback ? `<p style="font-size:0.8rem;color:var(--text-muted);margin-top:0.25rem;"><strong>Feedback:</strong> ${escHtml(s.feedback)}</p>` : '';
            const gradeForm = s.status === 'graded' ? '' : `
                <div style="margin-top:0.5rem;display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;">
                    <input type="number" id="marks_${homeworkId}_${sd.id}" placeholder="Marks" style="width:80px;padding:4px 8px;font-size:0.8rem;border:1px solid var(--border-color);border-radius:0.375rem;" />
                    <input type="text" id="feedback_${homeworkId}_${sd.id}" placeholder="Feedback" style="flex:1;min-width:120px;padding:4px 8px;font-size:0.8rem;border:1px solid var(--border-color);border-radius:0.375rem;" />
                    <button onclick="saveGrade('${homeworkId}','${sd.id}')" class="btn-portal btn-primary btn-sm"><i class="fas fa-check"></i> Grade</button>
                </div>`;
            return `<div style="padding:0.5rem 0;border-bottom:1px solid var(--border-color);">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;">
                    <span style="font-weight:600;">${escHtml(s.studentName || sd.id)}</span>
                    ${statusBadge}
                    <span style="font-size:0.75rem;color:var(--text-muted);">${subDate}</span>
                    ${fileLink}
                </div>
                ${s.textResponse ? `<p style="font-size:0.85rem;margin:0.25rem 0 0;color:var(--text-main);">${escHtml(s.textResponse)}</p>` : ''}
                ${feedbackHtml}
                ${gradeForm}
            </div>`;
        }).join('');
    } catch (e) {
        console.error('Error loading submissions:', e);
        panel.innerHTML = '<p style="color:var(--danger);padding:0.5rem;">Error loading submissions.</p>';
    }
}

async function saveGrade(homeworkId, submissionId) {
    const marks = document.getElementById(`marks_${homeworkId}_${submissionId}`)?.value;
    const feedback = document.getElementById(`feedback_${homeworkId}_${submissionId}`)?.value;
    if (marks === '' || marks === null) { showToast('Please enter marks', 'error'); return; }
    try {
        showLoading(true);
        await schoolData('homework').doc(homeworkId).collection('submissions').doc(submissionId).update({
            marks: parseFloat(marks),
            feedback: feedback || '',
            status: 'graded',
            gradedAt: firebase.firestore.FieldValue.serverTimestamp(),
            gradedBy: window.currentUserId || 'admin'
        });
        showToast('Grade saved');
        await loadSubmissionsForHomework(homeworkId);
        await loadHomeworkWithStats();
    } catch (e) {
        showToast('Error saving grade: ' + e.message, 'error');
    } finally {
        showLoading(false);
    }
}

function escHtml(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

window.initERPHomework = initERPHomework;
window.loadHomeworkClasses = loadHomeworkClasses;
window.updateHomeworkSections = updateHomeworkSections;
window.handleHomeworkSubmit = handleHomeworkSubmit;
window.deleteHomework = deleteHomework;
window.editHomework = editHomework;
window.loadHomeworkHistory = loadHomeworkHistory;
window.initHomeworkGrading = initHomeworkGrading;
window.loadHomeworkWithStats = loadHomeworkWithStats;
window.toggleSubmissionsPanel = toggleSubmissionsPanel;
window.saveGrade = saveGrade;
