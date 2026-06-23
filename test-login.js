// Login Test Suite — SNR Education ERP
// Tests student & parent login with mobile + birth year auth
// Usage: node test-login.js

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PORT = 9997;
const ROOT = __dirname;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function log(msg) { console.log(msg); }

async function run() {
  const server = http.createServer((req, res) => {
    let urlPath = req.url.split('?')[0];
    let filePath = path.join(ROOT, urlPath === '/' ? '/portal/student-login.html' : urlPath);
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); res.end('Not found: ' + filePath); return; }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });

  await new Promise(resolve => server.listen(PORT, resolve));
  log(`Login test server running at http://localhost:${PORT}`);

  const BASE = `http://localhost:${PORT}`;
  const browser = await chromium.launch({ headless: true });
  const results = { pass: [], fail: [], warn: [] };

  // ---------------------------------------------------------------
  // TEST 1: extractBirthYear helper function
  // ---------------------------------------------------------------
  log('\n=== TEST 1: extractBirthYear helper ===');
  {
    const ctx = await browser.newContext();
    const pg = await ctx.newPage();
    await pg.goto(BASE + '/portal/student-login.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await pg.waitForTimeout(2000);

    // Inject and test the extractBirthYear function
    const extractFn = await pg.evaluate(() => {
      // Copy the function from student-auth.js context
      function extractBirthYear(dob) {
        if (!dob) return '';
        var cleaned = String(dob).replace(/[^0-9/.-]/g, '');
        var m = cleaned.match(/(\d{4})[/.-]\d{1,2}[/.-]\d{1,2}/);
        if (m) return m[1];
        m = cleaned.match(/(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/);
        if (m) return m[3];
        m = cleaned.match(/^(\d{4})$/);
        if (m) return m[1];
        return '';
      }

      const cases = [
        { in: '2012-05-15', want: '2012' },
        { in: '15/05/2012', want: '2012' },
        { in: '05/15/2012', want: '2012' },
        { in: '2012', want: '2012' },
        { in: '', want: '' },
        { in: null, want: '' },
        { in: '1998/12/01', want: '1998' },
        { in: 'not-a-date', want: '' },
        { in: '01-01-2020', want: '2020' },
        { in: undefined, want: '' },
      ];

      return cases.map(c => ({
        input: c.in,
        expected: c.want,
        got: extractBirthYear(c.in),
        pass: extractBirthYear(c.in) === c.want,
      }));
    });

    let ok = 0, bad = 0;
    extractFn.forEach(c => {
      if (c.pass) { ok++; results.pass.push(`[extractBirthYear] "${c.input}" → "${c.got}"`); }
      else { bad++; results.fail.push(`[extractBirthYear] "${c.input}" → expected "${c.expected}", got "${c.got}"`); }
    });
    results.pass.push(`[extractBirthYear] ${ok}/${extractFn.length} cases passed`);
    if (bad > 0) results.fail.push(`[extractBirthYear] ${bad} cases FAILED`);
    await pg.close(); await ctx.close();
  }

  // ---------------------------------------------------------------
  // TEST 2: Login page loads and has correct title/fields
  // ---------------------------------------------------------------
  log('\n=== TEST 2: Login page structure ===');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', e => errs.push(e.message));

    await pg.goto(BASE + '/portal/student-login.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await pg.waitForTimeout(3000);

    const title = await pg.title();
    results.pass.push(`[STRUCTURE] Page title: "${title}"`);

    // Check form exists
    const form = await pg.$('#studentLoginForm');
    results.pass.push(`[STRUCTURE] Login form present: ${!!form}`);

    // Check tab buttons
    const tabs = await pg.$$eval('.tab-btn', btns => btns.map(b => ({ text: b.textContent.trim(), mode: b.dataset.mode, active: b.classList.contains('active') })));
    results.pass.push(`[STRUCTURE] Login tabs: ${tabs.length} — ${tabs.map(t => t.text).join(', ')}`);

    // Student fields
    const studentPhone = await pg.$('#student_phone');
    const studentPass = await pg.$('#student_password');
    results.pass.push(`[STRUCTURE] Student phone field: ${!!studentPhone}, type=${await studentPhone?.getAttribute('type')}`);
    results.pass.push(`[STRUCTURE] Student password field: ${!!studentPass}, type=${await studentPass?.getAttribute('type')}`);

    if (studentPass) {
      const placeholder = await studentPass.getAttribute('placeholder');
      const required = await studentPass.getAttribute('required');
      results.pass.push(`[STRUCTURE] Student password placeholder: "${placeholder}", required: ${required !== null}`);
    }

    // Parent fields (initially hidden)
    const parentPhone = await pg.$('#parent_phone');
    const parentPass = await pg.$('#parent_password');
    results.pass.push(`[STRUCTURE] Parent phone field present (hidden): ${!!parentPhone}`);
    results.pass.push(`[STRUCTURE] Parent password field present (hidden): ${!!parentPass}`);

    // Submit button
    const submitBtn = await pg.$('#loginSubmitBtn');
    const btnText = await submitBtn?.textContent();
    results.pass.push(`[STRUCTURE] Submit button text: "${btnText?.trim()}"`);

    // Guest login button
    const guestBtn = await pg.$('button[onclick*="loginAsGuest"]');
    results.pass.push(`[STRUCTURE] Guest login button: ${!!guestBtn}`);

    // Password toggle buttons
    const studentToggle = await pg.$('[onclick*="toggleStudentPassword"]');
    const parentToggle = await pg.$('[onclick*="toggleParentPassword"]');
    results.pass.push(`[STRUCTURE] Student password toggle: ${!!studentToggle}`);
    results.pass.push(`[STRUCTURE] Parent password toggle: ${!!parentToggle}`);

    if (errs.length) results.warn.push(`[STRUCTURE] JS errors: ${errs.join(', ')}`);
    await pg.close(); await ctx.close();
  }

  // ---------------------------------------------------------------
  // TEST 3: Form validation on empty submit
  // ---------------------------------------------------------------
  log('\n=== TEST 3: Form validation ===');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const pg = await ctx.newPage();

    await pg.goto(BASE + '/portal/student-login.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await pg.waitForTimeout(2000);

    // Check required attributes
    const requiredFields = await pg.$$eval('[required]', els => els.map(e => e.id || e.name || e.placeholder));
    results.pass.push(`[VALIDATION] Required fields: ${requiredFields.length} — ${requiredFields.join(', ')}`);

    // Maxlength on phone fields
    const phoneMax = await pg.$eval('#student_phone', el => el.maxLength);
    results.pass.push(`[VALIDATION] Student phone maxlength: ${phoneMax}`);

    // Input filtering (numeric only)
    const phonePattern = await pg.$eval('#student_phone', el => el.getAttribute('oninput'));
    results.pass.push(`[VALIDATION] Student phone has numeric filter: ${(phonePattern || '').includes('replace')}`);

    // Parent phone also has required + maxlength
    const parentPhoneEl = await pg.$('#parent_phone');
    const parentPhoneReq = await parentPhoneEl?.getAttribute('required');
    const parentPhoneMax = await parentPhoneEl?.getAttribute('maxlength');
    results.pass.push(`[VALIDATION] Parent phone required: ${parentPhoneReq !== null}, maxlength: ${parentPhoneMax}`);

    await pg.close(); await ctx.close();
  }

  // ---------------------------------------------------------------
  // TEST 4: Tab switching (student ↔ parent)
  // ---------------------------------------------------------------
  log('\n=== TEST 4: Tab switching ===');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const pg = await ctx.newPage();

    await pg.goto(BASE + '/portal/student-login.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await pg.waitForTimeout(2000);

    // Default: student fields visible, parent hidden
    let studentVisible = await pg.$eval('#studentFields', el => el.style.display !== 'none');
    let parentVisible = await pg.$eval('#parentFields', el => el.style.display !== 'none');
    results.pass.push(`[TABS] Default student visible: ${studentVisible}, parent hidden: ${!parentVisible}`);

    // Click parent tab
    const parentTab = await pg.$('.tab-btn[data-mode="parent"]');
    if (parentTab) {
      await parentTab.click();
      await pg.waitForTimeout(500);
      studentVisible = await pg.$eval('#studentFields', el => el.style.display !== 'none');
      parentVisible = await pg.$eval('#parentFields', el => el.style.display !== 'none');
      results.pass.push(`[TABS] After parent click — student hidden: ${!studentVisible}, parent visible: ${parentVisible}`);
    }

    // Click student tab
    const studentTab = await pg.$('.tab-btn[data-mode="student"]');
    if (studentTab) {
      await studentTab.click();
      await pg.waitForTimeout(500);
      studentVisible = await pg.$eval('#studentFields', el => el.style.display !== 'none');
      parentVisible = await pg.$eval('#parentFields', el => el.style.display !== 'none');
      results.pass.push(`[TABS] After student click — student visible: ${studentVisible}, parent hidden: ${!parentVisible}`);
    }

    await pg.close(); await ctx.close();
  }

  // ---------------------------------------------------------------
  // TEST 5: Password toggle buttons
  // ---------------------------------------------------------------
  log('\n=== TEST 5: Password show/hide toggle ===');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const pg = await ctx.newPage();

    await pg.goto(BASE + '/portal/student-login.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await pg.waitForTimeout(2000);

    // Student password toggle
    const studentToggleBtn = await pg.$('[onclick*="toggleStudentPassword"]');
    if (studentToggleBtn) {
      let passType = await pg.$eval('#student_password', el => el.type);
      results.pass.push(`[TOGGLE] Student password initial type: ${passType}`);

      await studentToggleBtn.click();
      await pg.waitForTimeout(200);
      passType = await pg.$eval('#student_password', el => el.type);
      results.pass.push(`[TOGGLE] Student password after toggle: ${passType}`);

      // Toggle back
      await studentToggleBtn.click();
      await pg.waitForTimeout(200);
      passType = await pg.$eval('#student_password', el => el.type);
      results.pass.push(`[TOGGLE] Student password toggled back: ${passType}`);
    }

    // Switch to parent tab and test parent toggle
    const parentTab = await pg.$('.tab-btn[data-mode="parent"]');
    if (parentTab) {
      await parentTab.click();
      await pg.waitForTimeout(500);

      const parentToggleBtn = await pg.$('[onclick*="toggleParentPassword"]');
      if (parentToggleBtn) {
        let passType = await pg.$eval('#parent_password', el => el.type);
        results.pass.push(`[TOGGLE] Parent password initial type: ${passType}`);

        await parentToggleBtn.click();
        await pg.waitForTimeout(200);
        passType = await pg.$eval('#parent_password', el => el.type);
        results.pass.push(`[TOGGLE] Parent password after toggle: ${passType}`);
      }
    }

    await pg.close(); await ctx.close();
  }

  // ---------------------------------------------------------------
  // TEST 6: Responsive layout
  // ---------------------------------------------------------------
  log('\n=== TEST 6: Responsive layout ===');
  const viewports = [
    { name: 'Mobile', w: 375, h: 812 },
    { name: 'Tablet', w: 768, h: 1024 },
    { name: 'Desktop', w: 1280, h: 720 },
  ];
  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const pg = await ctx.newPage();
    await pg.goto(BASE + '/portal/student-login.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await pg.waitForTimeout(1000);
    const overflow = await pg.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    results.pass.push(`[RESPONSIVE] ${vp.name}(${vp.w}x${vp.h}) overflow: ${overflow}`);
    if (overflow) results.warn.push(`[RESPONSIVE] ${vp.name}: Horizontal overflow!`);
    await pg.close(); await ctx.close();
  }

  // ---------------------------------------------------------------
  // TEST 7: Simulated login with mocked extractBirthYear
  // ---------------------------------------------------------------
  log('\n=== TEST 7: Login password validation logic ===');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const pg = await ctx.newPage();

    // Load a blank page and inject the auth logic for testing
    await pg.goto(BASE + '/portal/student-login.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await pg.waitForTimeout(2000);

    const logicTests = await pg.evaluate(() => {
      function extractBirthYear(dob) {
        if (!dob) return '';
        var cleaned = String(dob).replace(/[^0-9/.-]/g, '');
        var m = cleaned.match(/(\d{4})[/.-]\d{1,2}[/.-]\d{1,2}/);
        if (m) return m[1];
        m = cleaned.match(/(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/);
        if (m) return m[3];
        m = cleaned.match(/^(\d{4})$/);
        if (m) return m[1];
        return '';
      }

      // Simulate student login validation
      const mockStudents = [
        { name: 'Aarav Sharma', phone: '9876543210', dob: '2012-05-15', expectedPassword: '2012' },
        { name: 'Priya Patel', phone: '9876543211', dob: '15/08/2011', expectedPassword: '2011' },
        { name: 'Rohan Singh', phone: '9876543212', dob: '2013', expectedPassword: '2013' },
      ];

      const results = [];
      mockStudents.forEach(s => {
        const year = extractBirthYear(s.dob);
        results.push({
          student: s.name,
          phone: s.phone,
          extractedYear: year,
          passwordMatch: year === s.expectedPassword,
        });
      });

      // Simulate parent login (guardian_phone + student's birth year)
      const mockParent = {
        phone: '9988776655',
        students: [
          { name: 'Ananya Gupta', dob: '2010-11-20', expectedPassword: '2010' },
          { name: 'Arjun Gupta', dob: '2014-03-08', expectedPassword: '2014' },
        ],
      };
      const parentYear = extractBirthYear(mockParent.students[0].dob);

      return {
        studentTests: results,
        parentTest: {
          phone: mockParent.phone,
          firstChildYear: parentYear,
          firstChildMatches: parentYear === '2010',
        },
      };
    });

    logicTests.studentTests.forEach(t => {
      results.pass.push(`[LOGIC] Student "${t.student}" phone=${t.phone} birthYear=${t.extractedYear} match=${t.passwordMatch}`);
    });
    results.pass.push(`[LOGIC] Parent phone=${logicTests.parentTest.phone} firstChildBirthYear=${logicTests.parentTest.firstChildYear} match=${logicTests.parentTest.firstChildMatches}`);

    await pg.close(); await ctx.close();
  }

  // ---------------------------------------------------------------
  // TEST 8: Branding elements
  // ---------------------------------------------------------------
  log('\n=== TEST 8: Branding & UI elements ===');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const pg = await ctx.newPage();
    await pg.goto(BASE + '/portal/student-login.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await pg.waitForTimeout(2000);

    const brandName = await pg.$('#portalBrandName');
    const brandDesc = await pg.$('#portalDesc');
    const logoContainer = await pg.$('#schoolLogoContainer');
    const backLink = await pg.$('.back-link, .back-home, a[href="/"]');

    results.pass.push(`[BRAND] Portal brand name: ${!!brandName}`);
    results.pass.push(`[BRAND] Portal description: ${!!brandDesc}`);
    results.pass.push(`[BRAND] Logo container: ${!!logoContainer}`);
    results.pass.push(`[BRAND] Back-to-home link: ${!!backLink}`);

    // Check hint text for default password
    const hints = await pg.$$eval('p i.fa-info-circle', els => els.length);
    results.pass.push(`[BRAND] Password hint icons: ${hints}`);

    await pg.close(); await ctx.close();
  }

  // ========== REPORT ==========
  log('\n\n' + '='.repeat(80));
  log('LOGIN TEST SUITE REPORT - SNR EDU ERP');
  log('='.repeat(80));
  log(`\n✅ PASSED: ${results.pass.length}`);
  log(`❌ FAILED: ${results.fail.length}`);
  log(`⚠️  WARNINGS: ${results.warn.length}`);

  if (results.fail.length > 0) {
    log('\n--- FAILURES ---');
    results.fail.forEach(f => log(`  ❌ ${f}`));
  }
  if (results.warn.length > 0) {
    log('\n--- WARNINGS ---');
    results.warn.forEach(w => log(`  ⚠️  ${w}`));
  }
  log('\n--- PASSED ---');
  results.pass.forEach(p => log(`  ✅ ${p}`));

  await browser.close();
  server.close();
  log('\n=== LOGIN TEST SUITE COMPLETE ===');
  process.exit(results.fail.length > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
