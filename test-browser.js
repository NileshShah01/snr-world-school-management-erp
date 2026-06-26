const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PORT = 9999;
const ROOT = __dirname;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const results = { pass: [], fail: [], warnings: [], jsErrors: [], networkErrors: [] };

function log(msg) { console.log(msg); }

async function run() {
  // Start embedded server
  const server = http.createServer((req, res) => {
    let urlPath = req.url.split('?')[0];
    let filePath = path.join(ROOT, urlPath === '/' ? '/school.html' : urlPath);
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found: ' + filePath);
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });

  await new Promise(resolve => server.listen(PORT, resolve));
  log(`Server running at http://localhost:${PORT}`);

  const BASE = `http://localhost:${PORT}`;
  const browser = await chromium.launch({ headless: true });

  // ========== TEST 1: ALL PUBLIC PAGES LOAD ==========
  log('\n=== TEST 1: PUBLIC PAGES LOAD CHECK ===');
  const publicPages = [
    { name: 'School Homepage', url: '/school.html' },
    { name: 'About', url: '/about.html' },
    { name: 'Academics', url: '/academics.html' },
    { name: 'Admissions', url: '/admissions.html' },
    { name: 'Facilities', url: '/facilities.html' },
    { name: 'Gallery', url: '/gallery.html' },
    { name: 'Contact', url: '/contact.html' },
    { name: 'Inquiry', url: '/inquiry.html' },
    { name: 'Privacy', url: '/privacy.html' },
    { name: 'Platform', url: '/platform.html' },
  ];

  for (const pg_info of publicPages) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const pg = await context.newPage();
    const jsErrors = [];
    const netErrors = [];
    pg.on('pageerror', err => jsErrors.push(err.message));
    pg.on('requestfailed', req => netErrors.push(`${req.url()} - ${req.failure()?.errorText}`));

    try {
      const resp = await pg.goto(BASE + pg_info.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const status = resp?.status();
      const title = await pg.title();
      if (status === 200) {
        results.pass.push(`[LOAD] ${pg_info.name} (${pg_info.url}) - ${status} - Title: "${title}"`);
      } else {
        results.fail.push(`[LOAD] ${pg_info.name} (${pg_info.url}) - Status: ${status}`);
      }
    } catch (err) {
      results.fail.push(`[LOAD] ${pg_info.name} (${pg_info.url}) - ERROR: ${err.message.substring(0, 150)}`);
    }

    if (jsErrors.length > 0) results.jsErrors.push({ page: pg_info.name, errors: jsErrors });
    if (netErrors.length > 0) results.networkErrors.push({ page: pg_info.name, errors: netErrors });
    await pg.close();
    await context.close();
  }

  // ========== TEST 2: PORTAL PAGES LOAD ==========
  log('\n=== TEST 2: PORTAL PAGES LOAD ===');
  const portalPages = [
    { name: 'Admin Login', url: '/portal/admin-login.html' },
    { name: 'Student Login', url: '/portal/student-login.html' },
    { name: 'Admin Dashboard', url: '/portal/admin-dashboard.html' },
    { name: 'Student Dashboard', url: '/portal/student-dashboard.html' },
    { name: 'Teacher Dashboard', url: '/portal/teacher-dashboard.html' },
    { name: 'Super Admin', url: '/portal/super-admin-pro.html' },
    { name: 'Question Paper Formatter', url: '/portal/tool-question-formatter.html' },
  ];

  for (const pg_info of portalPages) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const pg = await context.newPage();
    const jsErrors = [];
    pg.on('pageerror', err => jsErrors.push(err.message));

    try {
      const resp = await pg.goto(BASE + pg_info.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const status = resp?.status();
      const title = await pg.title();
      if (status === 200) {
        results.pass.push(`[PORTAL] ${pg_info.name} - ${status} - Title: "${title}"`);
      } else {
        results.fail.push(`[PORTAL] ${pg_info.name} - Status: ${status}`);
      }
    } catch (err) {
      results.fail.push(`[PORTAL] ${pg_info.name} - ERROR: ${err.message.substring(0, 150)}`);
    }

    if (jsErrors.length > 0) results.jsErrors.push({ page: pg_info.name, errors: jsErrors });
    await pg.close();
    await context.close();
  }

  // ========== TEST 3: HOMEPAGE ELEMENTS ==========
  log('\n=== TEST 3: HOMEPAGE ELEMENTS ===');
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const pg = await context.newPage();
    const jsErrors = [];
    pg.on('pageerror', err => jsErrors.push(err.message));

    await pg.goto(BASE + '/school.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await pg.waitForTimeout(2000);

    // Check for header
    const hasHeader = await pg.$('header, #header, .header, .navbar, nav');
    results.pass.push(`[HOMEPAGE] Header/nav present: ${!!hasHeader}`);

    // Check for hero section
    const hasHero = await pg.$('.hero, #hero, .slider, .carousel, .banner, [class*="hero"], [class*="slider"]');
    results.pass.push(`[HOMEPAGE] Hero/slider section present: ${!!hasHero}`);

    // Check for images
    const images = await pg.$$eval('img', imgs =>
      imgs.map(i => ({ src: i.src?.substring(0, 120), alt: i.alt, loaded: i.complete && i.naturalWidth > 0 }))
    );
    const loadedImgs = images.filter(i => i.loaded);
    const brokenImgs = images.filter(i => !i.loaded && i.src && !i.src.includes('data:'));
    results.pass.push(`[HOMEPAGE] Images: ${images.length} total, ${loadedImgs.length} loaded`);
    if (brokenImgs.length > 0) {
      results.fail.push(`[HOMEPAGE] ${brokenImgs.length} broken images: ${brokenImgs.map(i => i.src).join('\n    ')}`);
    }

    // Check all buttons
    const buttons = await pg.$$eval('button, .btn, [role="button"], input[type="submit"]', btns =>
      btns.map(b => ({
        text: (b.textContent || b.value || '').trim().substring(0, 80),
        tag: b.tagName,
        disabled: b.disabled,
        type: b.getAttribute('type'),
      }))
    );
    results.pass.push(`[HOMEPAGE] Buttons: ${buttons.length}`);
    buttons.forEach(b => {
      if (b.disabled) results.warnings.push(`[HOMEPAGE] Disabled button: "${b.text}"`);
    });

    // Check all internal links
    const links = await pg.$$eval('a[href]', anchors => {
      const seen = new Set();
      return anchors
        .map(a => ({ text: (a.textContent || '').trim().substring(0, 50), href: a.getAttribute('href') }))
        .filter(l => {
          if (!l.href || l.href.startsWith('#') || l.href.startsWith('javascript:') || l.href.startsWith('tel:') || l.href.startsWith('mailto:')) return false;
          if (seen.has(l.href)) return false;
          seen.add(l.href);
          return true;
        });
    });
    results.pass.push(`[HOMEPAGE] Unique links: ${links.length}`);

    // Test internal links
    let linksOk = 0;
    let linksBroken = 0;
    for (const link of links) {
      if (link.href.startsWith('/') || link.href.includes('localhost')) {
        try {
          const targetUrl = link.href.startsWith('http') ? link.href : BASE + link.href;
          const resp = await pg.goto(targetUrl, { timeout: 8000, waitUntil: 'domcontentloaded' });
          if (resp?.status() === 200) linksOk++;
          else { linksBroken++; results.fail.push(`[LINK] "${link.text}" -> ${link.href} - Status: ${resp?.status()}`); }
        } catch (err) {
          linksBroken++;
          results.fail.push(`[LINK] "${link.text}" -> ${link.href} - ERROR: ${err.message.substring(0, 100)}`);
        }
      }
    }
    results.pass.push(`[HOMEPAGE] Links tested: ${linksOk} OK, ${linksBroken} broken`);

    // Check footer
    await pg.goto(BASE + '/school.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await pg.waitForTimeout(1000);
    const hasFooter = await pg.$('footer, #footer, .footer');
    results.pass.push(`[HOMEPAGE] Footer present: ${!!hasFooter}`);

    // Check floating buttons
    const floatingBtns = await pg.$$eval('.floating-btn, .whatsapp-btn, .fab, [class*="float"], [class*="whatsapp"], [class*="floating"]', btns => btns.length);
    results.pass.push(`[HOMEPAGE] Floating buttons: ${floatingBtns}`);

    if (jsErrors.length > 0) results.jsErrors.push({ page: 'Homepage elements', errors: jsErrors });
    await pg.close();
    await context.close();
  }

  // ========== TEST 4: GALLERY FUNCTIONALITY ==========
  log('\n=== TEST 4: GALLERY FUNCTIONALITY ===');
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const pg = await context.newPage();
    const jsErrors = [];
    pg.on('pageerror', err => jsErrors.push(err.message));

    await pg.goto(BASE + '/gallery.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await pg.waitForTimeout(2000);

    const images = await pg.$$eval('img', imgs => imgs.filter(i => i.complete && i.naturalWidth > 0).length);
    results.pass.push(`[GALLERY] Loaded images: ${images}`);

    const filterBtns = await pg.$$eval('[data-filter], .filter-btn, .gallery-filter, .category-btn, [class*="filter"]', btns =>
      btns.map(b => b.textContent?.trim()?.substring(0, 30))
    );
    results.pass.push(`[GALLERY] Filter buttons: ${filterBtns.length} - ${filterBtns.join(', ')}`);

    // Click gallery items for lightbox test
    const galleryItems = await pg.$$('.gallery-item, .gallery-card, [class*="gallery"] img, .grid-item');
    if (galleryItems.length > 0) {
      try {
        await galleryItems[0].click();
        await pg.waitForTimeout(1000);
        const lightbox = await pg.$('.lightbox, .modal, .overlay, [class*="lightbox"], [class*="modal"], .fancybox');
        results.pass.push(`[GALLERY] Lightbox present after click: ${!!lightbox}`);
      } catch (err) {
        results.warnings.push(`[GALLERY] Lightbox test error: ${err.message.substring(0, 100)}`);
      }
    }

    if (jsErrors.length > 0) results.jsErrors.push({ page: 'Gallery', errors: jsErrors });
    await pg.close();
    await context.close();
  }

  // ========== TEST 5: FORMS ==========
  log('\n=== TEST 5: FORMS VALIDATION ===');
  const formPages = [
    { name: 'Contact', url: '/contact.html' },
    { name: 'Inquiry', url: '/inquiry.html' },
  ];

  for (const fp of formPages) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const pg = await context.newPage();
    const jsErrors = [];
    pg.on('pageerror', err => jsErrors.push(err.message));

    await pg.goto(BASE + fp.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await pg.waitForTimeout(1000);

    const forms = await pg.$$('form');
    results.pass.push(`[FORM] ${fp.name}: ${forms.length} form(s)`);

    const inputs = await pg.$$eval('input, textarea, select', els =>
      els.map(e => ({
        tag: e.tagName, type: e.type, name: e.name || e.id,
        required: e.required, placeholder: (e.placeholder || '').substring(0, 40)
      }))
    );
    results.pass.push(`[FORM] ${fp.name}: ${inputs.length} fields - ${inputs.map(i => `${i.name||i.type}`).join(', ')}`);

    // Test empty submit
    const submitBtn = await pg.$('button[type="submit"], input[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await pg.waitForTimeout(1000);
      const validationEls = await pg.$$eval(':invalid, .error, .is-invalid, [class*="error"], [class*="invalid"], .required', els =>
        els.filter(e => e.offsetParent !== null).length
      );
      results.pass.push(`[FORM] ${fp.name}: Validation elements after empty submit: ${validationEls}`);
    }

    if (jsErrors.length > 0) results.jsErrors.push({ page: `${fp.name} form`, errors: jsErrors });
    await pg.close();
    await context.close();
  }

  // ========== TEST 6: ADMIN DASHBOARD SIDEBAR & SECTIONS ==========
  log('\n=== TEST 6: ADMIN DASHBOARD DEEP CHECK ===');
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const pg = await context.newPage();
    const jsErrors = [];
    pg.on('pageerror', err => jsErrors.push(err.message));

    await pg.goto(BASE + '/portal/admin-dashboard.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await pg.waitForTimeout(3000);

    const title = await pg.title();
    results.pass.push(`[ADMIN-DASH] Title: "${title}"`);

    // Check for sidebar
    const sidebarSelectors = ['.sidebar', '#sidebar', '.nav-sidebar', '[class*="sidebar"]', '.menu', 'aside'];
    for (const sel of sidebarSelectors) {
      const el = await pg.$(sel);
      if (el) {
        const text = await el.textContent();
        results.pass.push(`[ADMIN-DASH] Sidebar found via "${sel}" - ${text?.length || 0} chars`);
        break;
      }
    }

    // Check all nav items
    const navItems = await pg.$$eval('a, [data-section], .nav-item, .menu-item', items =>
      items.map(i => ({
        text: (i.textContent || '').trim().substring(0, 50),
        href: i.getAttribute('href'),
        dataSection: i.getAttribute('data-section'),
      })).filter(i => i.text && (i.href || i.dataSection))
    );
    results.pass.push(`[ADMIN-DASH] Nav items found: ${navItems.length}`);
    navItems.slice(0, 30).forEach(i => {
      results.pass.push(`  -> "${i.text}" href=${i.href} section=${i.dataSection}`);
    });

    // Check for module registry
    const hasRegistry = await pg.evaluate(() => {
      return typeof window.moduleRegistry !== 'undefined' || 
             typeof window.MODULE_REGISTRY !== 'undefined' ||
             typeof window.loadSection === 'function' ||
             typeof window.navigateSection === 'function';
    });
    results.pass.push(`[ADMIN-DASH] Module registry/loader present: ${hasRegistry}`);

    // Check all CSS & JS loaded
    const cssCount = await pg.evaluate(() => document.styleSheets.length);
    const jsCount = await pg.evaluate(() => document.scripts.length);
    results.pass.push(`[ADMIN-DASH] Stylesheets: ${cssCount}, Scripts: ${jsCount}`);

    // Check console errors
    if (jsErrors.length > 0) results.jsErrors.push({ page: 'Admin Dashboard', errors: jsErrors });
    await pg.close();
    await context.close();
  }

  // ========== TEST 7: RESPONSIVE DESIGN ==========
  log('\n=== TEST 7: RESPONSIVE DESIGN ===');
  const viewports = [
    { name: 'Mobile-375', width: 375, height: 812 },
    { name: 'Mobile-414', width: 414, height: 896 },
    { name: 'Tablet-768', width: 768, height: 1024 },
    { name: 'Desktop-1920', width: 1920, height: 1080 },
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const pg = await context.newPage();

    for (const pageUrl of ['/school.html', '/platform.html']) {
      await pg.goto(BASE + pageUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await pg.waitForTimeout(1000);

      const overflow = await pg.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      if (overflow) {
        results.warnings.push(`[RESPONSIVE] ${vp.name} ${pageUrl}: Horizontal overflow!`);
      } else {
        results.pass.push(`[RESPONSIVE] ${vp.name} ${pageUrl}: No overflow`);
      }

      if (vp.width < 768) {
        const hamburger = await pg.$('.hamburger, .navbar-toggler, .mobile-menu, [class*="hamburger"], [class*="menu-toggle"], button[aria-label*="menu"], button[aria-label*="Menu"], .nav-toggle, [class*="nav-toggle"]');
        results.pass.push(`[RESPONSIVE] ${vp.name} ${pageUrl}: Hamburger menu: ${!!hamburger}`);
      }
    }
    await pg.close();
    await context.close();
  }

  // ========== TEST 8: PWA CHECK ==========
  log('\n=== TEST 8: PWA & SERVICE WORKER ===');
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const pg = await context.newPage();

    await pg.goto(BASE + '/school.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await pg.waitForTimeout(2000);

    const manifestLink = await pg.$eval('link[rel="manifest"]', el => el.href).catch(() => null);
    results.pass.push(`[PWA] Manifest link: ${manifestLink || 'NOT FOUND'}`);

    const swRegistered = await pg.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        return regs.length;
      }
      return -1;
    });
    results.pass.push(`[PWA] Service Worker registrations: ${swRegistered}`);

    const metaTags = await pg.$$eval('meta', metas =>
      metas.map(m => ({ name: m.name || m.getAttribute('property'), content: (m.content || '').substring(0, 80) }))
        .filter(m => m.name)
    );
    results.pass.push(`[PWA] Meta tags: ${metaTags.length}`);
    metaTags.forEach(m => results.pass.push(`  -> ${m.name}: ${m.content}`));

    await pg.close();
    await context.close();
  }

  // ========== TEST 9: GLOBAL JS ERRORS ==========
  log('\n=== TEST 9: GLOBAL JS ERROR SCAN ===');
  const allPages = [
    '/school.html', '/about.html', '/academics.html', '/admissions.html',
    '/facilities.html', '/gallery.html', '/contact.html', '/inquiry.html',
    '/privacy.html', '/platform.html', '/portal/admin-login.html',
    '/portal/student-login.html', '/portal/admin-dashboard.html',
    '/portal/student-dashboard.html', '/portal/teacher-dashboard.html',
    '/portal/super-admin-pro.html', '/portal/tool-question-formatter.html',
  ];

  for (const url of allPages) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const pg = await context.newPage();
    const jsErrors = [];
    pg.on('pageerror', err => jsErrors.push(err.message));
    const consoleErrors = [];
    pg.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    try {
      await pg.goto(BASE + url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await pg.waitForTimeout(3000);
    } catch (err) {
      // timeout is ok
    }

    if (jsErrors.length > 0) results.jsErrors.push({ page: url, errors: jsErrors });
    if (consoleErrors.length > 0) results.jsErrors.push({ page: `${url} (console)`, errors: consoleErrors });
    await pg.close();
    await context.close();
  }

  // ========== COMPILE REPORT ==========
  log('\n\n' + '='.repeat(80));
  log('COMPREHENSIVE BROWSER TEST REPORT - SNR EDU ERP');
  log('='.repeat(80));

  log(`\n✅ PASSED: ${results.pass.length}`);
  log(`❌ FAILED: ${results.fail.length}`);
  log(`⚠️  WARNINGS: ${results.warnings.length}`);
  log(`🐛 JS ERRORS: ${results.jsErrors.length} pages affected`);
  log(`🌐 NETWORK ERRORS: ${results.networkErrors.length} pages affected`);

  if (results.fail.length > 0) {
    log('\n--- FAILURES ---');
    results.fail.forEach(f => log(`  ❌ ${f}`));
  }

  if (results.warnings.length > 0) {
    log('\n--- WARNINGS ---');
    results.warnings.forEach(w => log(`  ⚠️  ${w}`));
  }

  if (results.jsErrors.length > 0) {
    log('\n--- JAVASCRIPT ERRORS ---');
    results.jsErrors.forEach(j => {
      log(`  🐛 ${j.page}:`);
      j.errors.forEach(e => log(`     - ${e.substring(0, 250)}`));
    });
  }

  if (results.networkErrors.length > 0) {
    log('\n--- NETWORK ERRORS ---');
    results.networkErrors.forEach(n => {
      log(`  🌐 ${n.page}:`);
      n.errors.forEach(e => log(`     - ${e.substring(0, 200)}`));
    });
  }

  log('\n--- ALL PASSED CHECKS ---');
  results.pass.forEach(p => log(`  ✅ ${p}`));

  await browser.close();
  server.close();
  log('\n=== TEST COMPLETE ===');
}

run().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
