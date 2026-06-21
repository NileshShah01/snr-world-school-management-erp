let swCurrentStep = 1;
const SW_TOTAL_STEPS = 5;

window.onModuleLoaded_setup_schoolSetupWizard = function () {
    swInit();
};

function swInit() {
    swCurrentStep = 1;
    swShowStep(1);
}

function swShowStep(step) {
    swCurrentStep = step;
    document.querySelectorAll('.wizard-step-content').forEach(el => el.classList.add('hidden'));
    const current = document.querySelector(`.wizard-step-content[data-step="${step}"]`);
    if (current) current.classList.remove('hidden');

    document.querySelectorAll('.step-indicator').forEach(el => {
        const s = parseInt(el.dataset.step);
        el.classList.toggle('active', s === step);
        el.classList.toggle('completed', s < step);
    });

    document.querySelectorAll('.step-connector').forEach((el, i) => {
        el.classList.toggle('completed', i < step - 1);
    });

    const prevBtn = document.getElementById('swPrevBtn');
    const nextBtn = document.getElementById('swNextBtn');
    prevBtn.style.visibility = step === 1 ? 'hidden' : 'visible';

    if (step === SW_TOTAL_STEPS) {
        nextBtn.style.display = 'none';
        prevBtn.textContent = '← Previous';
        swBuildSummary();
    } else if (step === SW_TOTAL_STEPS - 1) {
        nextBtn.innerHTML = 'Save & Finish <i class="fas fa-check"></i>';
        nextBtn.style.display = 'inline-flex';
        prevBtn.textContent = '← Previous';
    } else {
        nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
        nextBtn.style.display = 'inline-flex';
        prevBtn.textContent = '← Previous';
    }

    document.getElementById('swError').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function swNextStep() {
    const err = document.getElementById('swError');

    if (swCurrentStep === 1) {
        const name = document.getElementById('swSchoolName').value.trim();
        if (!name) { err.textContent = 'Please enter the school name.'; err.style.display = 'block'; return; }
    }

    if (swCurrentStep === 2) {
        const sessionName = document.getElementById('swSessionName').value.trim();
        const start = document.getElementById('swSessionStart').value;
        const end = document.getElementById('swSessionEnd').value;
        if (!sessionName) { err.textContent = 'Please enter a session name.'; err.style.display = 'block'; return; }
        if (!start || !end) { err.textContent = 'Please select session start and end dates.'; err.style.display = 'block'; return; }
        if (new Date(end) <= new Date(start)) { err.textContent = 'End date must be after start date.'; err.style.display = 'block'; return; }
    }

    if (swCurrentStep === 3) {
        const rows = document.querySelectorAll('.sw-class-row');
        let valid = true;
        rows.forEach(row => {
            const name = row.querySelector('.sw-class-name').value.trim();
            if (!name) valid = false;
        });
        if (!valid || rows.length === 0) { err.textContent = 'Please add at least one class with a name.'; err.style.display = 'block'; return; }
    }

    if (swCurrentStep === 4) {
        const rows = document.querySelectorAll('.sw-subject-row');
        let valid = true;
        rows.forEach(row => {
            const name = row.querySelector('.sw-subject-name').value.trim();
            if (!name) valid = false;
        });
        if (!valid || rows.length === 0) { err.textContent = 'Please add at least one subject.'; err.style.display = 'block'; return; }
    }

    err.style.display = 'none';

    if (swCurrentStep < SW_TOTAL_STEPS - 1) {
        swShowStep(swCurrentStep + 1);
    } else if (swCurrentStep === SW_TOTAL_STEPS - 1) {
        swSaveAll();
    }
}

function swPrevStep() {
    if (swCurrentStep > 1) swShowStep(swCurrentStep - 1);
}

function swAddClassRow() {
    const container = document.getElementById('swClassesContainer');
    const row = document.createElement('div');
    row.className = 'sw-class-row flex gap-0-5 mb-0-75 align-center';
    row.innerHTML = `
        <input type="text" class="input sw-class-name" style="flex:1;" placeholder="Class name">
        <input type="text" class="input sw-class-sections" style="flex:1;" placeholder="Sections (comma: A,B,C)">
        <button type="button" class="btn-portal btn-sm btn-ghost" onclick="swRemoveClass(this)"><i class="fas fa-times text-rose"></i></button>`;
    container.appendChild(row);
    row.querySelector('.sw-class-name').focus();
}

function swRemoveClass(btn) {
    const row = btn.closest('.sw-class-row');
    if (document.querySelectorAll('.sw-class-row').length > 1) {
        row.remove();
    }
}

function swAddSubjectRow() {
    const container = document.getElementById('swSubjectsContainer');
    const row = document.createElement('div');
    row.className = 'sw-subject-row flex gap-0-5 mb-0-75 align-center';
    row.innerHTML = `
        <input type="text" class="input sw-subject-name" style="flex:2;" placeholder="Subject name">
        <input type="text" class="input sw-subject-code" style="flex:1;" placeholder="Code">
        <button type="button" class="btn-portal btn-sm btn-ghost" onclick="swRemoveSubject(this)"><i class="fas fa-times text-rose"></i></button>`;
    container.appendChild(row);
    row.querySelector('.sw-subject-name').focus();
}

function swRemoveSubject(btn) {
    const row = btn.closest('.sw-subject-row');
    if (document.querySelectorAll('.sw-subject-row').length > 1) {
        row.remove();
    }
}

async function swSaveAll() {
    const nextBtn = document.getElementById('swNextBtn');
    const err = document.getElementById('swError');
    nextBtn.disabled = true;
    nextBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    try {
        const schoolId = window.CURRENT_SCHOOL_ID;
        if (!schoolId) throw new Error('School context not resolved.');

        const db = window.db || firebase.firestore();
        const batch = db.batch();

        // 1. School profile (update school doc)
        const schoolRef = db.collection('schools').doc(schoolId);
        const schoolData = {
            schoolName: document.getElementById('swSchoolName').value.trim(),
            tagline: document.getElementById('swTagline').value.trim(),
            phone: document.getElementById('swPhone').value.trim(),
            email: document.getElementById('swEmail').value.trim(),
            address: document.getElementById('swAddress').value.trim(),
            setupComplete: true,
            setupCompletedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
        batch.update(schoolRef, schoolData);

        // Handle logo upload — auto-compress under 200KB
        const logoFile = document.getElementById('swLogo').files[0];
        if (logoFile) {
            let logoBase64;
            if (typeof ImageStorage !== 'undefined') {
                logoBase64 = await ImageStorage.compressImageUnder200KB(logoFile);
            } else {
                logoBase64 = await new Promise((r, j) => {
                    const reader = new FileReader();
                    reader.onload = e => r(e.target.result);
                    reader.onerror = j;
                    reader.readAsDataURL(logoFile);
                });
            }
            batch.update(schoolRef, { logo: logoBase64 });
        }

        // 2. Academic session
        const sessionRef = db.collection('schools').doc(schoolId).collection('sessions').doc();
        const sessionName = document.getElementById('swSessionName').value.trim();
        batch.set(sessionRef, {
            name: sessionName,
            startDate: document.getElementById('swSessionStart').value,
            endDate: document.getElementById('swSessionEnd').value,
            isCurrent: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

        // 3. Classes & sections
        const classRows = document.querySelectorAll('.sw-class-row');
        const addedClasses = [];
        classRows.forEach(row => {
            const className = row.querySelector('.sw-class-name').value.trim();
            const sectionsStr = row.querySelector('.sw-class-sections').value.trim();
            const sections = sectionsStr ? sectionsStr.split(',').map(s => s.trim()).filter(Boolean) : [];
            const classRef = db.collection('schools').doc(schoolId).collection('classes').doc();
            batch.set(classRef, {
                name: className,
                sections: sections,
                sessionId: sessionRef.id,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
            addedClasses.push({ name: className, sections });
        });

        // 4. Subjects
        const subjectRows = document.querySelectorAll('.sw-subject-row');
        subjectRows.forEach(row => {
            const subName = row.querySelector('.sw-subject-name').value.trim();
            const subCode = row.querySelector('.sw-subject-code').value.trim();
            const subRef = db.collection('schools').doc(schoolId).collection('subjects').doc();
            batch.set(subRef, {
                name: subName,
                code: subCode || subName.substring(0, 4).toUpperCase(),
                applicableToAll: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
        });

        await batch.commit();
        swShowStep(SW_TOTAL_STEPS);
    } catch (e) {
        console.error('Setup wizard save error:', e);
        err.textContent = 'Error saving: ' + e.message;
        err.style.display = 'block';
        nextBtn.disabled = false;
        nextBtn.innerHTML = 'Save & Finish <i class="fas fa-check"></i>';
    }
}

function swBuildSummary() {
    const summary = document.getElementById('swSummary');
    const schoolName = document.getElementById('swSchoolName').value.trim();
    const sessionName = document.getElementById('swSessionName').value.trim();
    const classCount = document.querySelectorAll('.sw-class-row').length;
    const subjectCount = document.querySelectorAll('.sw-subject-row').length;

    summary.innerHTML = `
        <div class="mb-0-5"><strong>School:</strong> ${schoolName || '—'}</div>
        <div class="mb-0-5"><strong>Session:</strong> ${sessionName || '—'}</div>
        <div class="mb-0-5"><strong>Classes:</strong> ${classCount}</div>
        <div><strong>Subjects:</strong> ${subjectCount}</div>
    `;
}

function swFinish() {
    window.showSection('dashboardOverview');
}
