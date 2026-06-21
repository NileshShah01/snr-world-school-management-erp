(function (global) {
    'use strict';

    var COLLECTION = 'settings/designations';
    var COLL_EMPLOYEE = 'staff';

    var DEFAULT_PERMISSIONS = {
        studentManagement: false,
        attendance: false,
        examManagement: false,
        resultManagement: false,
        homeworkAssignment: false,
        timetableView: false,
        noticesAccess: false,
        libraryManagement: false,
        transportManagement: false,
        feeManagement: false,
        websiteCMS: false,
        employeeView: false,
        settingsAccess: false,
        admissionAccess: false,
        academicTools: false,
        communication: false
    };

    var PERMISSION_LABELS = {
        studentManagement: 'Student Management',
        attendance: 'Attendance',
        examManagement: 'Exam Management',
        resultManagement: 'Result Management',
        homeworkAssignment: 'Homework Assignment',
        timetableView: 'Timetable View',
        noticesAccess: 'Notices',
        libraryManagement: 'Library Management',
        transportManagement: 'Transport Management',
        feeManagement: 'Fee Management',
        websiteCMS: 'Website CMS',
        employeeView: 'Employee View',
        settingsAccess: 'Settings Access',
        admissionAccess: 'Admission Access',
        academicTools: 'Academic Tools',
        communication: 'Communication'
    };

    function ref(designationId) {
        return schoolData(COLLECTION).doc(designationId);
    }

    function generateId() {
        return 'desig_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    async function create(name, description, permissions) {
        var id = generateId();
        var data = {
            name: name,
            description: description || '',
            isActive: true,
            permissions: Object.assign({}, DEFAULT_PERMISSIONS, permissions || {}),
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await ref(id).set(data);
        return id;
    }

    async function update(designationId, data) {
        if (data.permissions) {
            var merged = Object.assign({}, DEFAULT_PERMISSIONS, data.permissions);
            data.permissions = merged;
        }
        data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        await ref(designationId).update(data);
    }

    async function resign(designationId) {
        await ref(designationId).update({
            isActive: false,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    async function reactivate(designationId) {
        await ref(designationId).update({
            isActive: true,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    async function list() {
        var snap = await schoolData(COLLECTION).orderBy('createdAt', 'asc').get();
        var results = [];
        snap.forEach(function (doc) {
            var d = doc.data();
            d.id = doc.id;
            results.push(d);
        });
        return results;
    }

    async function get(designationId) {
        var doc = await ref(designationId).get();
        if (!doc.exists) return null;
        var d = doc.data();
        d.id = doc.id;
        return d;
    }

    async function getByStaffId(staffId) {
        var staffSnap = await schoolData(COLL_EMPLOYEE).doc(staffId).get();
        if (!staffSnap.exists) return null;
        var staff = staffSnap.data();
        if (!staff.designationId) return null;
        return get(staff.designationId);
    }

    async function assign(staffId, designationId) {
        await schoolData(COLL_EMPLOYEE).doc(staffId).update({
            designationId: designationId,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    async function getStaffCount(designationId) {
        var snap = await schoolData(COLL_EMPLOYEE).where('designationId', '==', designationId).get();
        return snap.size;
    }

    function renderPermissionGrid(containerId, permissions, onChange) {
        var container = document.getElementById(containerId);
        if (!container) return;

        var html = '<div class="permission-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:0.75rem;">';
        var allKeys = Object.keys(DEFAULT_PERMISSIONS);
        for (var i = 0; i < allKeys.length; i++) {
            var key = allKeys[i];
            var label = PERMISSION_LABELS[key] || key;
            var checked = permissions && permissions[key] === true ? 'checked' : '';
            html += '<label class="permission-toggle" style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem 1rem;background:var(--bg-card,#1e293b);border:1px solid var(--border,#334155);border-radius:0.5rem;cursor:pointer;transition:all 0.2s;">';
            html += '<span style="font-size:0.9rem;font-weight:500;color:var(--text,#e2e8f0);">' + label + '</span>';
            html += '<div class="toggle-switch" style="position:relative;width:44px;height:24px;flex-shrink:0;">';
            html += '<input type="checkbox" data-perm-key="' + key + '" ' + checked + ' style="opacity:0;width:0;height:0;position:absolute;" onchange="var lbl=this.closest(\'.permission-toggle\');lbl.style.borderColor=this.checked?\'var(--primary,#3b82f6)\':\'var(--border,#334155)\';">';
            html += '<span class="toggle-slider" style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:' + (checked ? 'var(--primary,#3b82f6)' : '#475569') + ';border-radius:24px;transition:0.3s;pointer-events:none;"></span>';
            html += '<span class="toggle-knob" style="position:absolute;height:18px;width:18px;left:3px;bottom:3px;background:white;border-radius:50%;transition:0.3s;transform:' + (checked ? 'translateX(20px)' : 'translateX(0)') + ';pointer-events:none;"></span>';
            html += '</div></label>';
        }
        html += '</div>';
        container.innerHTML = html;

        var inputs = container.querySelectorAll('input[type="checkbox"]');
        for (var j = 0; j < inputs.length; j++) {
            (function (input) {
                var key = input.getAttribute('data-perm-key');
                var toggle = input.nextElementSibling;
                var knob = toggle.nextElementSibling;
                var lbl = input.closest('.permission-toggle');
                input.addEventListener('change', function () {
                    if (typeof onChange === 'function') onChange();
                });
            })(inputs[j]);
        }
    }

    function collectPermissions(containerId) {
        var container = document.getElementById(containerId);
        if (!container) return {};
        var inputs = container.querySelectorAll('input[type="checkbox"]');
        var result = {};
        for (var i = 0; i < inputs.length; i++) {
            var key = inputs[i].getAttribute('data-perm-key');
            result[key] = inputs[i].checked;
        }
        return result;
    }

    var DesignationManager = {
        DEFAULT_PERMISSIONS: DEFAULT_PERMISSIONS,
        PERMISSION_LABELS: PERMISSION_LABELS,
        create: create,
        update: update,
        resign: resign,
        reactivate: reactivate,
        list: list,
        get: get,
        getByStaffId: getByStaffId,
        assign: assign,
        getStaffCount: getStaffCount,
        renderPermissionGrid: renderPermissionGrid,
        collectPermissions: collectPermissions
    };

    global.DesignationManager = DesignationManager;
})(window);
