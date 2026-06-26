var addStudentStep = 1;
var _addStudentInitialized = false;

window.onModuleLoaded_students_addStudent = function () {
    if (_addStudentInitialized) return;
    _addStudentInitialized = true;
    loadSessions();
    loadClasses();
    document.getElementById('f_admDate').value = new Date().toISOString().split('T')[0];
};

async function loadSessions() {
    var sel = document.getElementById('f_session');
    if (!sel) return;
    try {
        var snap = await schoolData('sessions').get();
        sel.innerHTML = '<option value="">Select session</option>';
        snap.forEach(function (d) {
            var s = d.data().name || d.data().session || d.id;
            sel.innerHTML += '<option value="' + escHtml(s) + '">' + escHtml(s) + '</option>';
        });
        if (snap.empty) {
            sel.innerHTML += '<option value="2026-27">2026-27</option><option value="2025-26">2025-26</option>';
        }
    } catch (e) {
        sel.innerHTML += '<option value="2026-27">2026-27</option><option value="2025-26">2025-26</option>';
    }
}

async function loadClasses() {
    var sel = document.getElementById('f_class');
    if (!sel) return;
    try {
        var snap = await schoolData('classes').get();
        sel.innerHTML = '<option value="">Select class</option>';
        snap.forEach(function (d) {
            var c = d.data().name || d.id;
            sel.innerHTML += '<option value="' + escHtml(c) + '">' + escHtml(c) + '</option>';
        });
    } catch (e) {
        sel.innerHTML += '<option>Class I</option><option>Class II</option><option>Class III</option><option>Class IV</option><option>Class V</option><option>Class VI</option><option>Class VII</option><option>Class VIII</option>';
    }
}

function loadSections() {
    var sel = document.getElementById('f_section');
    if (!sel) return;
    sel.innerHTML = '<option value="">Select section</option><option>A</option><option>B</option><option>C</option>';
}

// ── STEP NAVIGATION ──
var STEP_LABELS = ['Basic Info', 'Academic Info', 'Guardian Info', 'Review & Save'];
var NEXT_LABELS = ['Next: Academic Info', 'Next: Guardian Info', 'Next: Review', 'Save Student'];

function goStep(step) {
    if (step > addStudentStep) return;
    addStudentStep = step;
    renderStep();
}

function nextStep() {
    if (addStudentStep < 4) {
        document.getElementById('wsStep' + addStudentStep).className = 'ws-step done';
        document.getElementById('wsNum' + addStudentStep).innerHTML = '<i class="fas fa-check" style="font-size:.65rem"></i>';
        addStudentStep++;
        renderStep();
    } else {
        submitStudentForm();
    }
}

function prevStep() {
    if (addStudentStep > 1) {
        document.getElementById('wsStep' + addStudentStep).className = 'ws-step idle';
        document.getElementById('wsNum' + addStudentStep).textContent = addStudentStep;
        addStudentStep--;
        renderStep();
    }
}

function renderStep() {
    document.querySelectorAll('.step-panel').forEach(function (p) { p.classList.remove('active'); });
    document.getElementById('stepPanel' + addStudentStep).classList.add('active');
    var ws = document.getElementById('wsStep' + addStudentStep);
    if (ws.className !== 'ws-step done') ws.className = 'ws-step active';
    document.getElementById('progressFill').style.width = (addStudentStep / 4 * 100) + '%';
    var prevBtn = document.getElementById('prevBtn');
    if (prevBtn) prevBtn.style.display = addStudentStep > 1 ? 'flex' : 'none';
    document.getElementById('currentStepNum').textContent = addStudentStep;
    var nextBtn = document.getElementById('nextBtn');
    if (addStudentStep < 4) {
        nextBtn.innerHTML = 'Next: ' + STEP_LABELS[addStudentStep] + ' <i class="fas fa-arrow-right"></i>';
        nextBtn.className = 'btn btn-primary';
    } else {
        nextBtn.innerHTML = '<i class="fas fa-check"></i> Save Student Record';
        nextBtn.className = 'btn btn-success';
    }
    if (addStudentStep === 4) syncReview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── FORM HELPERS ──
function syncReview() {
    var fn = (document.getElementById('f_firstName') && document.getElementById('f_firstName').value) || '';
    var ln = (document.getElementById('f_lastName') && document.getElementById('f_lastName').value) || '';
    var fullName = (fn + ' ' + ln).trim() || '—';
    var rvName = document.getElementById('rvName');
    var rvName2 = document.getElementById('rv_name');
    if (rvName) rvName.textContent = fullName;
    if (rvName2) rvName2.textContent = fullName;
    var avatar = document.getElementById('rvAvatar');
    if (avatar) avatar.textContent = fn ? fn[0].toUpperCase() : 'A';
    var cls = (document.getElementById('f_class') && document.getElementById('f_class').value) || '';
    var sec = (document.getElementById('f_section') && document.getElementById('f_section').value) || '';
    var sess = (document.getElementById('f_session') && document.getElementById('f_session').value) || '';
    var rvClass = document.getElementById('rvClass');
    if (rvClass) rvClass.textContent = cls && sec ? cls + ' — ' + sec + ' · Session ' + sess : 'Not selected';
    var rvC = document.getElementById('rv_class');
    var rvS = document.getElementById('rv_sec');
    var rvSn = document.getElementById('rv_session');
    if (rvC) rvC.textContent = cls || '—';
    if (rvS) rvS.textContent = sec || '—';
    if (rvSn) rvSn.textContent = sess || '—';
    var roll = document.getElementById('f_roll');
    var rvRoll = document.getElementById('rv_roll');
    if (rvRoll) rvRoll.textContent = (roll && roll.value) || 'Auto-assign';
    var dob = document.getElementById('f_dob');
    var rvDob = document.getElementById('rv_dob');
    if (rvDob && dob && dob.value) rvDob.textContent = new Date(dob.value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    var rvBlood = document.getElementById('rv_blood');
    if (rvBlood) rvBlood.textContent = (document.getElementById('f_bloodGroup') && document.getElementById('f_bloodGroup').value) || '—';
    var rvCat = document.getElementById('rv_cat');
    if (rvCat) rvCat.textContent = (document.getElementById('f_category') && document.getElementById('f_category').value) || '—';
    var genderEl = document.querySelector('input[name="gender"]:checked');
    var rvGen = document.getElementById('rv_gender');
    if (rvGen) rvGen.textContent = genderEl ? genderEl.value : '—';
    var rvAddr = document.getElementById('rv_addr');
    if (rvAddr) rvAddr.textContent = (document.getElementById('f_city') && document.getElementById('f_city').value) || '—';
    var rvFa = document.getElementById('rv_father');
    if (rvFa) rvFa.textContent = (document.getElementById('f_fatherName') && document.getElementById('f_fatherName').value) || '—';
    var rvFp = document.getElementById('rv_fPhone');
    if (rvFp) rvFp.textContent = (document.getElementById('f_fatherPhone') && document.getElementById('f_fatherPhone').value) || '—';
    var rvMo = document.getElementById('rv_mother');
    if (rvMo) rvMo.textContent = (document.getElementById('f_motherName') && document.getElementById('f_motherName').value) || '—';
    var rvEm = document.getElementById('rv_emerg');
    if (rvEm) rvEm.textContent = (document.getElementById('f_emergName') && document.getElementById('f_emergName').value) || '—';
}

function calcAge() {
    var dob = document.getElementById('f_dob') && document.getElementById('f_dob').value;
    var hint = document.getElementById('ageHint');
    if (!dob || !hint) return;
    var age = Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 3600 * 1000));
    hint.textContent = age > 0 ? 'Age: ' + age + ' years' : '';
}

function previewPhoto(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var p = document.getElementById('photoPreview');
            if (p) p.innerHTML = '<img src="' + e.target.result + '">';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// ── SUBMIT ──
async function submitStudentForm() {
    var consent = document.getElementById('dpdpConsent') && document.getElementById('dpdpConsent').checked;
    if (!consent) { showToast('Please confirm DPDP consent before saving.', 'error'); return; }
    var firstName = (document.getElementById('f_firstName') && document.getElementById('f_firstName').value) || '';
    var lastName = (document.getElementById('f_lastName') && document.getElementById('f_lastName').value) || '';
    var name = (firstName + ' ' + lastName).trim();
    var father = (document.getElementById('f_fatherName') && document.getElementById('f_fatherName').value) || '';
    var phone = (document.getElementById('f_fatherPhone') && document.getElementById('f_fatherPhone').value) || '';
    if (!name || !father || !phone) { showToast('Please fill Name, Father Name, and Father\'s Phone', 'error'); return; }
    var cls = (document.getElementById('f_class') && document.getElementById('f_class').value) || '';
    var sec = (document.getElementById('f_section') && document.getElementById('f_section').value) || '';
    var sess = (document.getElementById('f_session') && document.getElementById('f_session').value) || '';
    if (!cls || !sec || !sess) { showToast('Please select Class, Section, and Session', 'error'); return; }

    window.setLoading && window.setLoading(true);
    try {
        var photoData = '';
        var photoInput = document.getElementById('photoInput');
        if (photoInput && photoInput.files && photoInput.files[0]) {
            photoData = await new Promise(function (r) {
                var reader = new FileReader();
                reader.onload = function (e) { r(e.target.result); };
                reader.readAsDataURL(photoInput.files[0]);
            });
        }

        var studentId = await window.getGlobalStudentId ? window.getGlobalStudentId() : String(Date.now());

        var data = {
            studentId: studentId,
            name: name,
            firstName: firstName,
            lastName: lastName,
            fatherName: father,
            fatherPhone: phone,
            motherName: (document.getElementById('f_motherName') && document.getElementById('f_motherName').value) || '',
            motherPhone: (document.getElementById('f_motherPhone') && document.getElementById('f_motherPhone').value) || '',
            phone: phone,
            mobile: phone,
            class: cls,
            section: sec,
            session: sess,
            rollNumber: (document.getElementById('f_roll') && document.getElementById('f_roll').value) || '',
            roll_no: (document.getElementById('f_roll') && document.getElementById('f_roll').value) || '',
            admissionDate: (document.getElementById('f_admDate') && document.getElementById('f_admDate').value) || '',
            admissionYear: sess,
            dob: (document.getElementById('f_dob') && document.getElementById('f_dob').value) || '',
            dateOfBirth: (document.getElementById('f_dob') && document.getElementById('f_dob').value) || '',
            gender: document.querySelector('input[name="gender"]:checked') ? document.querySelector('input[name="gender"]:checked').value : '',
            bloodGroup: (document.getElementById('f_bloodGroup') && document.getElementById('f_bloodGroup').value) || '',
            religion: (document.getElementById('f_religion') && document.getElementById('f_religion').value) || '',
            category: (document.getElementById('f_category') && document.getElementById('f_category').value) || '',
            address: (document.getElementById('f_address') && document.getElementById('f_address').value) || '',
            city: (document.getElementById('f_city') && document.getElementById('f_city').value) || '',
            state: (document.getElementById('f_state') && document.getElementById('f_state').value) || '',
            pin: (document.getElementById('f_pin') && document.getElementById('f_pin').value) || '',
            transportRoute: (document.getElementById('f_transport') && document.getElementById('f_transport').value) || '',
            hostel: (document.getElementById('f_hostel') && document.getElementById('f_hostel').value) || '',
            house: (document.getElementById('f_house') && document.getElementById('f_house').value) || '',
            emergencyContact: (document.getElementById('f_emergName') && document.getElementById('f_emergName').value) || '',
            emergencyPhone: (document.getElementById('f_emergPhone') && document.getElementById('f_emergPhone').value) || '',
            medicalInfo: (document.getElementById('f_medical') && document.getElementById('f_medical').value) || '',
            fatherOccupation: (document.getElementById('f_fatherOcc') && document.getElementById('f_fatherOcc').value) || '',
            fatherEmail: (document.getElementById('f_fatherEmail') && document.getElementById('f_fatherEmail').value) || '',
            nationality: (document.getElementById('f_nationality') && document.getElementById('f_nationality').value) || '',
            photo: photoData,
            consentGiven: true,
            isActive: true,
            studentCode: studentId,
            student_id: studentId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (typeof withSchool === 'function') Object.assign(data, withSchool({}));
        await schoolData('students').doc(studentId).set(data);
        if (window.adjustStudentCounter) adjustStudentCounter(1);

        // Show success
        document.getElementById('stepFooter').style.display = 'none';
        document.getElementById('stepPanel4').style.display = 'none';
        document.getElementById('successScreen').classList.add('visible');
        document.querySelectorAll('.ws-step').forEach(function (s) {
            s.className = 'ws-step done';
            var num = s.querySelector('.ws-num');
            if (num) num.innerHTML = '<i class="fas fa-check" style="font-size:.65rem"></i>';
        });
        document.getElementById('progressFill').style.width = '100%';
        document.getElementById('successSub').textContent = name + ' has been enrolled in ' + cls + ' — ' + sec + ' for Session ' + sess + '.';
        document.getElementById('successCard').innerHTML =
            '<div class="ss-card-row"><span class="scl">Student Name</span><span class="scr">' + escHtml(name) + '</span></div>' +
            '<div class="ss-card-row"><span class="scl">Class & Section</span><span class="scr">' + escHtml(cls) + ' — ' + escHtml(sec) + '</span></div>' +
            '<div class="ss-card-row"><span class="scl">Roll Number</span><span class="scr">' + (data.rollNumber || 'Auto-assigned') + '</span></div>' +
            '<div class="ss-card-row"><span class="scl">Registration No.</span><span class="scr" style="font-family:monospace">#' + escHtml(studentId.slice(-6)) + '</span></div>' +
            '<div class="ss-card-row"><span class="scl">Father\u2019s Phone</span><span class="scr">' + escHtml(phone) + '</span></div>';
        showToast('Student Added: ' + name, 'success');
    } catch (e) {
        showToast('Save failed: ' + e.message, 'error');
        console.error('[addStudent] Submit error:', e);
    } finally {
        window.setLoading && window.setLoading(false);
    }
}

function resetStudentForm() {
    location.reload();
}

function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
