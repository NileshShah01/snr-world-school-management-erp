// Legacy Collection Migration Tool - One-time migration helper
// Copies data from top-level collections into school subcollections

const LM_COLLECTIONS = [
  'sessions', 'classes', 'students', 'exams', 'marks',
  'gradingRules', 'schedules', 'publications', 'remarks',
  'exam_attendance', 'non_subject_marks', 'notices', 'events',
  'achievements', 'testimonials', 'holidays', 'gallery', 'staff',
  'fees', 'reports', 'admitcards', 'timetables', 'inquiries'
];

let lmStatus = {};
let lmTotalMigrated = 0;
let lmTotalSkipped = 0;

window.onModuleLoaded_tools_legacyMigration = function () {
  lmRefreshStatus();
};

function lmLog(msg) {
  const el = document.getElementById('legacyLog');
  if (el) el.textContent += '[' + new Date().toISOString().slice(11, 19) + '] ' + msg + '\n';
}

function lmShowError(msg) {
  const err = document.getElementById('legacyError');
  const errMsg = document.getElementById('legacyErrorMsg');
  if (err && errMsg) { err.style.display = 'flex'; errMsg.textContent = msg; }
}

function lmHideError() {
  const err = document.getElementById('legacyError');
  if (err) err.style.display = 'none';
}

async function lmRefreshStatus() {
  lmHideError();
  const list = document.getElementById('legacyCollectionList');
  list.innerHTML = '<p class="text-muted text-center p-2"><i class="fas fa-spinner fa-spin"></i> Scanning collections...</p>';

  try {
    const info = [];
    for (const col of LM_COLLECTIONS) {
      try {
        const snap = await db.collection(col).limit(1).get();
        const count = snap.size;
        info.push({ collection: col, count: 0, hasDocs: count > 0 });
        if (count > 0) {
          const countSnap = await db.collection(col).get();
          info[info.length - 1].count = countSnap.size;
        }
      } catch (e) {
        info.push({ collection: col, count: -1, hasDocs: false, error: e.message });
      }
    }

    let html = '<table class="table"><thead><tr><th>Collection</th><th>Documents</th><th>Status</th></tr></thead><tbody>';
    for (const item of info) {
      const status = item.count < 0 ? '<span class="text-red">Error</span>'
        : item.count === 0 ? '<span class="text-muted">Empty</span>'
        : '<span class="text-amber">' + item.count + ' docs to migrate</span>';
      html += '<tr><td>' + item.collection + '</td><td>' + (item.count < 0 ? '-' : item.count) + '</td><td>' + status + '</td></tr>';
    }
    html += '</tbody></table>';
    list.innerHTML = html;

    lmStatus = {};
    info.forEach(function (i) { lmStatus[i.collection] = { total: i.count, migrated: 0, skipped: 0 }; });

    const totalPending = info.reduce(function (a, i) { return a + (i.count > 0 ? i.count : 0); }, 0);
    document.getElementById('legacyMigrateBtn').disabled = totalPending === 0;
    document.getElementById('legacyMigrateBtn').innerHTML = '<i class="fas fa-play"></i> Migrate (' + totalPending + ' docs)';

    lmLog('Scan complete. Found ' + totalPending + ' documents across legacy collections.');
  } catch (e) {
    list.innerHTML = '<p class="text-center text-red">Error scanning: ' + e.message + '</p>';
    lmShowError(e.message);
  }
}

async function lmStartMigration() {
  lmHideError();
  if (!await window.showConfirmModal({ title: 'Start Migration', message: 'This will COPY data from legacy collections into school subcollections. Continue?', icon: 'fa-database', confirmText: 'Start Migration' })) return;

  const btn = document.getElementById('legacyMigrateBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Migrating...';

  document.getElementById('legacyProgressCard').style.display = 'block';
  document.getElementById('legacyLogCard').style.display = 'block';
  lmTotalMigrated = 0;
  lmTotalSkipped = 0;

  try {
    for (const col of LM_COLLECTIONS) {
      if (lmStatus[col] && lmStatus[col].total > 0) {
        await lmMigrateCollection(col);
      }
    }

    lmLog('Migration complete. Migrated: ' + lmTotalMigrated + ', Skipped: ' + lmTotalSkipped);
    document.getElementById('legacyDeleteBtn').disabled = false;
  } catch (e) {
    lmShowError('Migration failed: ' + e.message);
    lmLog('ERROR: ' + e.message);
  }

  btn.innerHTML = '<i class="fas fa-play"></i> Migrate';
  btn.disabled = false;
  lmRefreshStatus();
}

async function lmMigrateCollection(colName) {
  lmLog('Migrating ' + colName + '...');
  const snap = await db.collection(colName).get();

  // Group documents by schoolId
  const grouped = {};
  var skipped = 0;
  snap.forEach(function (doc) {
    var data = doc.data();
    var schoolId = data.schoolId || data.school;
    if (!schoolId) {
      skipped++;
      return;
    }
    var entry = { docId: doc.id, data: data };
    if (!grouped[schoolId]) grouped[schoolId] = [];
    grouped[schoolId].push(entry);
  });

  // Migrate each group to corresponding school subcollection
  var migrated = 0;
  var schoolKeys = Object.keys(grouped);
  for (var s = 0; s < schoolKeys.length; s++) {
    var schoolId = schoolKeys[s];
    var entries = grouped[schoolId];
    for (var e = 0; e < entries.length; e++) {
      var entry = entries[e];
      var targetRef = db.collection('schools').doc(schoolId).collection(colName).doc(entry.docId);
      entry.data._migratedAt = firebase.firestore.FieldValue.serverTimestamp();
      try {
        await targetRef.set(entry.data);
        migrated++;
        lmTotalMigrated++;
      } catch (err) {
        lmLog('  ERROR copying ' + colName + '/' + entry.docId + ' to school ' + schoolId + ': ' + err.message);
      }
    }

    var prog = document.getElementById('legacyProgressContent');
    if (prog) {
      prog.innerHTML = '<div class="flex justify-between"><span>Migrating <strong>' + colName + '</strong>...</span><span>' + migrated + '/' + lmStatus[colName].total + '</span></div>';
    }
  }

  lmStatus[colName].migrated = migrated;
  lmStatus[colName].skipped = skipped;
  lmTotalSkipped += skipped;
  lmLog('  ' + colName + ': migrated ' + migrated + ', skipped ' + skipped);
}

async function lmVerifyMigration() {
  lmHideError();
  lmLog('Verifying migration...');
  var verified = 0;
  var errors = 0;

  for (var c = 0; c < LM_COLLECTIONS.length; c++) {
    var col = LM_COLLECTIONS[c];
    if (!lmStatus[col] || lmStatus[col].migrated === 0) continue;

    try {
      var legacySnap = await db.collection(col).get();
      var schoolCounts = {};
      legacySnap.forEach(function (doc) {
        var data = doc.data();
        var schoolId = data.schoolId || data.school;
        if (!schoolId) return;
        if (!schoolCounts[schoolId]) schoolCounts[schoolId] = 0;
        schoolCounts[schoolId]++;
      });

      var schoolKeys = Object.keys(schoolCounts);
      for (var s = 0; s < schoolKeys.length; s++) {
        var schoolId = schoolKeys[s];
        var expected = schoolCounts[schoolId];
        try {
          var targetSnap = await db.collection('schools').doc(schoolId).collection(col).get();
          var actual = targetSnap.size;
          if (actual >= expected) {
            verified++;
          } else {
            var missing = expected - actual;
            lmLog('  VERIFY ' + col + '/' + schoolId + ': expected ' + expected + ', found ' + actual + ' (' + missing + ' missing)');
            errors++;
          }
        } catch (e) {
          lmLog('  VERIFY ERROR ' + col + '/' + schoolId + ': ' + e.message);
          errors++;
        }
      }
    } catch (e) {
      lmLog('  VERIFY ERROR ' + col + ': ' + e.message);
      errors++;
    }
  }

  lmLog('Verify complete: ' + verified + ' collections verified, ' + errors + ' issues found.');
  if (errors === 0) {
    document.getElementById('legacyDeleteBtn').disabled = false;
    lmLog('All collections verified. You can now delete originals.');
  }
}

async function lmDeleteOriginals() {
  lmHideError();
  if (!await window.showConfirmModal({ title: 'Delete Originals', message: 'WARNING: This will PERMANENTLY DELETE original legacy documents. This cannot be undone. Continue?', icon: 'fa-exclamation-triangle', confirmText: 'Delete All', danger: true })) return;
  if (!await window.showConfirmModal({ title: 'Are You Sure?', message: 'Are you absolutely sure? Verify that all data has been migrated and verified first.', icon: 'fa-question-circle', confirmText: 'Yes, Delete Everything', danger: true })) return;

  var btn = document.getElementById('legacyDeleteBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';

  var deleted = 0;
  for (var c = 0; c < LM_COLLECTIONS.length; c++) {
    var col = LM_COLLECTIONS[c];
    if (!lmStatus[col] || lmStatus[col].migrated === 0) continue;

    try {
      var batch = db.batch();
      var snap = await db.collection(col).get();
      var count = 0;
      snap.forEach(function (doc) {
        var data = doc.data();
        var schoolId = data.schoolId || data.school;
        if (schoolId) {
          batch.delete(doc.ref);
          count++;
        }
      });
      if (count > 0) {
        await batch.commit();
        deleted += count;
        lmLog('  Deleted ' + count + ' from ' + col);
      }
    } catch (e) {
      lmLog('  ERROR deleting from ' + col + ': ' + e.message);
    }
  }

  lmLog('Deleted ' + deleted + ' legacy documents.');
  btn.innerHTML = '<i class="fas fa-trash-alt"></i> Delete Originals';
  await lmRefreshStatus();
}
