const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PORT = 9998;
const ROOT = __dirname;
const mimeTypes = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

async function run() {
  const server = http.createServer((req, res) => {
    let urlPath = req.url.split('?')[0];
    let filePath = path.join(ROOT, urlPath === '/' ? '/school.html' : urlPath);
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream' });
      res.end(data);
    });
  });
  await new Promise(r => server.listen(PORT, r));
  const BASE = `http://localhost:${PORT}`;
  const browser = await chromium.launch({ headless: true });
  const R = { pass: [], fail: [], warn: [], jsErr: [], netErr: [] };

  // Helper: test page quickly
  async function testPage(name, url) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', e => errs.push(e.message));
    try {
      const resp = await pg.goto(BASE + url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      const title = await pg.title();
      const s = resp?.status();
      if (s === 200) R.pass.push(`${name}: OK (${s}) Title="${title}"`);
      else R.fail.push(`${name}: Status ${s}`);
      if (errs.length) R.jsErr.push({ page: name, errors: errs });
    } catch (e) { R.fail.push(`${name}: ${e.message.substring(0,120)}`); }
    await pg.close(); await ctx.close();
  }

  // TEST 1: All pages load
  console.log('TEST 1: Page loads...');
  const pages = [
    ['School Home', '/school.html'], ['About', '/about.html'], ['Academics', '/academics.html'],
    ['Admissions', '/admissions.html'], ['Facilities', '/facilities.html'], ['Gallery', '/gallery.html'],
    ['Contact', '/contact.html'], ['Inquiry', '/inquiry.html'], ['Privacy', '/privacy.html'],
    ['Platform', '/platform.html'], ['Admin Login', '/portal/admin-login.html'],
    ['Student Login', '/portal/student-login.html'], ['Admin Dashboard', '/portal/admin-dashboard.html'],
    ['Student Dashboard', '/portal/student-dashboard.html'], ['Teacher Dashboard', '/portal/teacher-dashboard.html'],
    ['Super Admin', '/portal/super-admin-pro.html'], ['QPaper Tool', '/portal/tool-question-formatter.html'],
  ];
  for (const [n, u] of pages) await testPage(n, u);

  // TEST 2: Homepage deep check
  console.log('TEST 2: Homepage deep check...');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(BASE + '/school.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await pg.waitForTimeout(2000);

    // Header
    const header = await pg.$('header, #header, .header, .navbar, nav');
    R.pass.push(`Header: ${!!header}`);

    // Hero
    const hero = await pg.$('.hero, #hero, .slider, .carousel, .banner, [class*="hero"], [class*="slider"]');
    R.pass.push(`Hero/Slider: ${!!hero}`);

    // Images
    const imgs = await pg.$$eval('img', is => ({ total: is.length, loaded: is.filter(i => i.complete && i.naturalWidth > 0).length, broken: is.filter(i => !i.complete && i.src && !i.src.startsWith('data:')).map(i => i.src?.substring(0,100)) }));
    R.pass.push(`Images: ${imgs.loaded}/${imgs.total} loaded`);
    if (imgs.broken.length) R.fail.push(`Broken images: ${imgs.broken.join(', ')}`);

    // Buttons
    const btns = await pg.$$eval('button, .btn, [role="button"]', bs => bs.length);
    R.pass.push(`Buttons: ${btns}`);

    // Links
    const links = await pg.$$eval('a[href]', as => { const s = new Set(); return as.map(a => a.getAttribute('href')).filter(h => h && !h.startsWith('#') && !h.startsWith('javascript') && !h.startsWith('tel') && !h.startsWith('mailto') && !s.has(h) && s.add(h)).length; });
    R.pass.push(`Unique links: ${links}`);

    // Footer
    const footer = await pg.$('footer, #footer, .footer');
    R.pass.push(`Footer: ${!!footer}`);

    // Floating
    const floating = await pg.$$eval('[class*="float"], [class*="whatsapp"], [class*="fab"]', bs => bs.length);
    R.pass.push(`Floating buttons: ${floating}`);

    if (errs.length) R.jsErr.push({ page: 'Homepage', errors: errs });
    await pg.close(); await ctx.close();
  }

  // TEST 3: Gallery
  console.log('TEST 3: Gallery...');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(BASE + '/gallery.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await pg.waitForTimeout(2000);
    const imgs = await pg.$$eval('img', is => is.filter(i => i.complete && i.naturalWidth > 0).length);
    R.pass.push(`Gallery images loaded: ${imgs}`);
    const filters = await pg.$$eval('[data-filter], .filter-btn, .category-btn', bs => bs.map(b => b.textContent?.trim()?.substring(0,30)));
    R.pass.push(`Gallery filters: ${filters.length} [${filters.join(', ')}]`);
    const items = await pg.$$('.gallery-item, .gallery-card, [class*="gallery"] img, .grid-item');
    if (items.length) {
      try { await items[0].click(); await pg.waitForTimeout(500);
        const lb = await pg.$('.lightbox, .modal, .overlay, [class*="lightbox"], [class*="modal"], .fancybox');
        R.pass.push(`Lightbox: ${!!lb}`);
      } catch(e) { R.warn.push(`Gallery click: ${e.message.substring(0,80)}`); }
    }
    if (errs.length) R.jsErr.push({ page: 'Gallery', errors: errs });
    await pg.close(); await ctx.close();
  }

  // TEST 4: Forms
  console.log('TEST 4: Forms...');
  for (const [name, url] of [['Contact', '/contact.html'], ['Inquiry', '/inquiry.html']]) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(BASE + url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await pg.waitForTimeout(1000);
    const formCount = await pg.$$eval('f', fs => fs.length);
    const fieldCount = await pg.$$eval('input, textarea, select', els => els.length);
    const fieldNames = await pg.$$eval('input, textarea, select', els => els.map(e => e.name || e.id || e.type).filter(Boolean).join(', '));
    R.pass.push(`${name} form: ${formCount} form(s), ${fieldCount} fields [${fieldNames}]`);
    const submit = await pg.$('button[type="submit"], input[type="submit"]');
    if (submit) {
      await submit.click(); await pg.waitForTimeout(500);
      const invalids = await pg.$$eval(':invalid', els => els.filter(e => e.offsetParent !== null).length);
      R.pass.push(`${name} validation (empty submit): ${invalids} invalid elements`);
    }
    if (errs.length) R.jsErr.push({ page: `${name} form`, errors: errs });
    await pg.close(); await ctx.close();
  }

  // TEST 5: Admin Dashboard sidebar
  console.log('TEST 5: Admin Dashboard sidebar...');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(BASE + '/portal/admin-dashboard.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await pg.waitForTimeout(3000);
    const sidebar = await pg.$$eval('aside a, .sidebar a, [class*="sidebar"] a, .nav-item a, .menu-item a', is => is.map(i => ({ text: i.textContent?.trim()?.substring(0,40), href: i.getAttribute('href') })));
    R.pass.push(`Admin sidebar links: ${sidebar.length}`);
    sidebar.slice(0, 20).forEach(s => R.pass.push(`  -> "${s.text}" href=${s.href}`));
    const loader = await pg.evaluate(() => typeof window.loadSection === 'function' || typeof window.navigateSection === 'function' || typeof window.moduleRegistry !== 'undefined');
    R.pass.push(`Section loader: ${loader}`);
    const cssCount = await pg.evaluate(() => document.styleSheets.length);
    const jsCount = await pg.evaluate(() => document.scripts.length);
    R.pass.push(`Admin dash: ${cssCount} CSS, ${jsCount} JS`);
    if (errs.length) R.jsErr.push({ page: 'Admin Dashboard', errors: errs });
    await pg.close(); await ctx.close();
  }

  // TEST 6: Responsive
  console.log('TEST 6: Responsive...');
  for (const [name, w, h] of [['Mobile',375,812],['Tablet',768,1024],['Desktop',1920,1080]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const pg = await ctx.newPage();
    await pg.goto(BASE + '/school.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await pg.waitForTimeout(500);
    const overflow = await pg.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    R.pass.push(`${name}(${w}x${h}): overflow=${overflow}`);
    if (overflow) R.warn.push(`${name}: Horizontal overflow detected!`);
    await pg.close(); await ctx.close();
  }

  // TEST 7: PWA
  console.log('TEST 7: PWA...');
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const pg = await ctx.newPage();
    await pg.goto(BASE + '/school.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await pg.waitForTimeout(1000);
    const manifest = await pg.$eval('link[rel="manifest"]', e => e.href).catch(() => 'NONE');
    R.pass.push(`Manifest: ${manifest}`);
    const sw = await pg.evaluate(async () => { if('serviceWorker' in navigator) { const r = await navigator.serviceWorker.getRegistrations(); return r.length; } return -1; });
    R.pass.push(`Service Worker: ${sw} registrations`);
    await pg.close(); await ctx.close();
  }

  // TEST 8: JS errors across all pages
  console.log('TEST 8: JS errors scan...');
  for (const [name, url] of pages) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', e => errs.push(e.message));
    const consoleErrs = [];
    pg.on('console', m => { if (m.type() === 'error') consoleErrs.push(m.text()); });
    try { await pg.goto(BASE + url, { waitUntil: 'domcontentloaded', timeout: 8000 }); await pg.waitForTimeout(2000); } catch(e) {}
    if (errs.length) R.jsErr.push({ page: name, errors: errs });
    if (consoleErrs.length) R.jsErr.push({ page: `${name} (console)`, errors: consoleErrs });
    await pg.close(); await ctx.close();
  }

  // REPORT
  console.log('\n' + '='.repeat(80));
  console.log('COMPREHENSIVE BROWSER TEST REPORT - SNR EDU ERP');
  console.log('='.repeat(80));
  console.log(`\n✅ PASSED: ${R.pass.length}`);
  console.log(`❌ FAILED: ${R.fail.length}`);
  console.log(`⚠️  WARNINGS: ${R.warn.length}`);
  console.log(`🐛 JS ERRORS: ${R.jsErr.length} pages`);

  if (R.fail.length) { console.log('\n--- FAILURES ---'); R.fail.forEach(f => console.log(`  ❌ ${f}`)); }
  if (R.warn.length) { console.log('\n--- WARNINGS ---'); R.warn.forEach(w => console.log(`  ⚠️  ${w}`)); }
  if (R.jsErr.length) {
    console.log('\n--- JS ERRORS ---');
    R.jsErr.forEach(j => { console.log(`  🐛 ${j.page}:`); j.errors.forEach(e => console.log(`     ${e.substring(0,200)}`)); });
  }
  if (R.netErr.length) {
    console.log('\n--- NETWORK ERRORS ---');
    R.netErr.forEach(n => { console.log(`  🌐 ${n.page}:`); n.errors.forEach(e => console.log(`     ${e.substring(0,200)}`)); });
  }
  console.log('\n--- PASSED ---');
  R.pass.forEach(p => console.log(`  ✅ ${p}`));

  await browser.close(); server.close();
  console.log('\n=== DONE ===');
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
