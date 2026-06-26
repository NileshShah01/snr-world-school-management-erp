const { chromium } = require('playwright');

const BASE = 'http://localhost:8080';
const results = { pass: [], fail: [], warnings: [], jsErrors: [], networkErrors: [] };

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });

  // Collect JS errors globally
  const allJsErrors = [];

  // ========== TEST 1: ALL PUBLIC PAGES LOAD ==========
  console.log('\n=== TEST 1: PUBLIC PAGES LOAD CHECK ===');
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

  for (const page of publicPages) {
    const pg = await context.newPage();
    const jsErrors = [];
    const netErrors = [];
    pg.on('pageerror', err => jsErrors.push(err.message));
    pg.on('requestfailed', req => netErrors.push(`${req.url()} - ${req.failure()?.errorText}`));

    try {
      const resp = await pg.goto(BASE + page.url, { waitUntil: 'networkidle', timeout: 15000 });
      const status = resp?.status();
      if (status === 200) {
        results.pass.push(`[LOAD] ${page.name} (${page.url}) - ${status}`);
      } else {
        results.fail.push(`[LOAD] ${page.name} (${page.url}) - Status: ${status}`);
      }
    } catch (err) {
      results.fail.push(`[LOAD] ${page.name} (${page.url}) - ERROR: ${err.message}`);
    }

    if (jsErrors.length > 0) {
      results.jsErrors.push({ page: page.name, errors: jsErrors });
    }
    if (netErrors.length > 0) {
      results.networkErrors.push({ page: page.name, errors: netErrors });
    }
    await pg.close();
  }

  // ========== TEST 2: PORTAL LOGIN PAGES ==========
  console.log('\n=== TEST 2: PORTAL LOGIN PAGES ===');
  const portalPages = [
    { name: 'Admin Login', url: '/portal/admin-login.html' },
    { name: 'Student Login', url: '/portal/student-login.html' },
  ];

  for (const page of portalPages) {
    const pg = await context.newPage();
    const jsErrors = [];
    pg.on('pageerror', err => jsErrors.push(err.message));

    try {
      const resp = await pg.goto(BASE + page.url, { waitUntil: 'networkidle', timeout: 15000 });
      const status = resp?.status();
      if (status === 200) {
        results.pass.push(`[PORTAL] ${page.name} - ${status}`);
      } else {
        results.fail.push(`[PORTAL] ${page.name} - Status: ${status}`);
      }
    } catch (err) {
      results.fail.push(`[PORTAL] ${page.name} - ERROR: ${err.message}`);
    }

    if (jsErrors.length > 0) {
      results.jsErrors.push({ page: page.name, errors: jsErrors });
    }
    await pg.close();
  }

  // ========== TEST 3: NAVIGATION LINKS ON HOMEPAGE ==========
  console.log('\n=== TEST 3: NAVIGATION LINKS (HOMEPAGE) ===');
  {
    const pg = await context.newPage();
    await pg.goto(BASE + '/school.html', { waitUntil: 'networkidle', timeout: 15000 });

    // Check header navigation links
    const navLinks = await pg.$$eval('nav a, .navbar a, header a, #header a, .nav-link', links =>
      links.map(a => ({ text: a.textContent?.trim(), href: a.getAttribute('href') })).filter(l => l.href && !l.href.startsWith('#') && !l.href.startsWith('javascript'))
    );
    
    if (navLinks.length > 0) {
      results.pass.push(`[NAV] Found ${navLinks.length} navigation links`);
      for (const link of navLinks) {
        if (link.href && (link.href.startsWith('/') || link.href.includes('localhost'))) {
          try {
            const resp = await pg.goto(BASE + (link.href.startsWith('/') ? link.href : '/' + link.href), { timeout: 10000 });
            if (resp?.status() === 200) {
              results.pass.push(`[NAV] Link "${link.text}" -> ${link.href} - OK`);
            } else {
              results.fail.push(`[NAV] Link "${link.text}" -> ${link.href} - Status: ${resp?.status()}`);
            }
          } catch (err) {
            results.fail.push(`[NAV] Link "${link.text}" -> ${link.href} - ERROR: ${err.message}`);
          }
        }
      }
    } else {
      results.warnings.push('[NAV] No navigation links found with standard selectors');
    }

    // Check footer links
    const footerLinks = await pg.$$eval('footer a, #footer a, .footer a', links =>
      links.map(a => ({ text: a.textContent?.trim(), href: a.getAttribute('href') })).filter(l => l.href && !l.href.startsWith('#'))
    );
    results.pass.push(`[NAV] Found ${footerLinks.length} footer links`);

    await pg.goto(BASE + '/school.html', { waitUntil: 'networkidle', timeout: 15000 });

    // Check floating buttons
    const floatingBtns = await pg.$$eval('.floating-btn, .whatsapp, .fab, [class*="float"], [class*="whatsapp"], [class*="floating"]', btns =>
      btns.map(b => ({ text: b.textContent?.trim()?.substring(0, 50), tag: b.tagName, href: b.getAttribute('href') }))
    );
    results.pass.push(`[NAV] Found ${floatingBtns.length} floating action buttons`);

    await pg.close();
  }

  // ========== TEST 4: ALL BUTTONS & CLICKABLE ELEMENTS ON HOMEPAGE ==========
  console.log('\n=== TEST 4: BUTTONS & CLICKABLE ELEMENTS (HOMEPAGE) ===');
  {
    const pg = await context.newPage();
    const jsErrors = [];
    pg.on('pageerror', err => jsErrors.push(err.message));

    await pg.goto(BASE + '/school.html', { waitUntil: 'networkidle', timeout: 15000 });

    // All buttons
    const buttons = await pg.$$eval('button, .btn, [role="button"], input[type="submit"], input[type="button"]', btns =>
      btns.map(b => ({
        text: b.textContent?.trim()?.substring(0, 80),
        type: b.getAttribute('type'),
        disabled: b.disabled,
        classes: b.className?.substring(0, 100),
      }))
    );
    results.pass.push(`[BUTTONS] Found ${buttons.length} buttons on homepage`);
    
    // Check for disabled buttons
    const disabledBtns = buttons.filter(b => b.disabled);
    if (disabledBtns.length > 0) {
      results.warnings.push(`[BUTTONS] ${disabledBtns.length} disabled buttons found: ${disabledBtns.map(b => b.text).join(', ')}`);
    }

    // Check all clickable links on homepage
    const allLinks = await pg.$$eval('a[href]', links => {
      const unique = new Map();
      links.forEach(a => {
        const href = a.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
          unique.set(href, { text: a.textContent?.trim()?.substring(0, 50), href });
        }
      });
      return Array.from(unique.values());
    });
    results.pass.push(`[BUTTONS] Found ${allLinks.length} unique links on homepage`);

    // Test each internal link
    for (const link of allLinks) {
      if (link.href.startsWith('/') || link.href.includes('localhost:3000')) {
        try {
          const targetUrl = link.href.startsWith('http') ? link.href : BASE + link.href;
          const resp = await pg.goto(targetUrl, { timeout: 8000, waitUntil: 'domcontentloaded' });
          if (resp?.status() !== 200) {
            results.fail.push(`[LINK] "${link.text}" -> ${link.href} - Status: ${resp?.status()}`);
          }
        } catch (err) {
          results.fail.push(`[LINK] "${link.text}" -> ${link.href} - BROKEN: ${err.message?.substring(0, 100)}`);
        }
      }
    }

    if (jsErrors.length > 0) {
      results.jsErrors.push({ page: 'Homepage buttons/links', errors: jsErrors });
    }
    await pg.close();
  }

  // ========== TEST 5: GALLERY PAGE FUNCTIONALITY ==========
  console.log('\n=== TEST 5: GALLERY PAGE ===');
  {
    const pg = await context.newPage();
    const jsErrors = [];
    pg.on('pageerror', err => jsErrors.push(err.message));

    await pg.goto(BASE + '/gallery.html', { waitUntil: 'networkidle', timeout: 15000 });

    // Check gallery images
    const images = await pg.$$eval('img', imgs =>
      imgs.map(i => ({ src: i.src?.substring(0, 100), alt: i.alt, loaded: i.complete && i.naturalWidth > 0 }))
    );
    const loadedImages = images.filter(i => i.loaded);
    const brokenImages = images.filter(i => !i.loaded && i.src);
    results.pass.push(`[GALLERY] Total images: ${images.length}, Loaded: ${loadedImages.length}`);
    if (brokenImages.length > 0) {
      results.fail.push(`[GALLERY] ${brokenImages.length} broken images: ${brokenImages.map(i => i.src).join(', ')}`);
    }

    // Check filter buttons
    const filterBtns = await pg.$$eval('.filter-btn, .gallery-filter, [data-filter], .category-btn, button[class*="filter"]', btns =>
      btns.map(b => b.textContent?.trim())
    );
    results.pass.push(`[GALLERY] Found ${filterBtns.length} filter buttons: ${filterBtns.join(', ')}`);

    // Click each filter and check if gallery updates
    for (const filterBtn of await pg.$$('.filter-btn, .gallery-filter, [data-filter], .category-btn')) {
      try {
        await filterBtn.click();
        await pg.waitForTimeout(500);
        results.pass.push(`[GALLERY] Filter click: "${await filterBtn.textContent()}" - OK`);
      } catch (err) {
        results.fail.push(`[GALLERY] Filter click failed: ${err.message}`);
      }
    }

    // Check lightbox
    const galleryItems = await pg.$$('.gallery-item, .gallery-card, .grid-item, [class*="gallery"] img');
    if (galleryItems.length > 0) {
      try {
        await galleryItems[0].click();
        await pg.waitForTimeout(1000);
        const lightbox = await pg.$('.lightbox, .modal, .overlay, [class*="lightbox"], [class*="modal"]');
        if (lightbox) {
          results.pass.push('[GALLERY] Lightbox opens on image click');
        } else {
          results.warnings.push('[GALLERY] No lightbox/modal detected after image click');
        }
      } catch (err) {
        results.warnings.push(`[GALLERY] Lightbox test: ${err.message}`);
      }
    }

    if (jsErrors.length > 0) {
      results.jsErrors.push({ page: 'Gallery', errors: jsErrors });
    }
    await pg.close();
  }

  // ========== TEST 6: CONTACT & INQUIRY FORMS ==========
  console.log('\n=== TEST 6: FORMS VALIDATION ===');
  const formPages = [
    { name: 'Contact Form', url: '/contact.html', selectors: ['form', 'input[name], input[type="text"], input[type="email"], input[type="tel"], textarea'] },
    { name: 'Inquiry Form', url: '/inquiry.html', selectors: ['form', 'input[name], input[type="text"], input[type="email"], input[type="tel"], textarea'] },
  ];

  for (const fp of formPages) {
    const pg = await context.newPage();
    const jsErrors = [];
    pg.on('pageerror', err => jsErrors.push(err.message));

    await pg.goto(BASE + fp.url, { waitUntil: 'networkidle', timeout: 15000 });

    // Find forms
    const forms = await pg.$$('form');
    results.pass.push(`[FORM] ${fp.name}: Found ${forms.length} form(s)`);

    // Find inputs
    const inputs = await pg.$$eval('input, textarea, select', els =>
      els.map(e => ({ tag: e.tagName, type: e.type, name: e.name, required: e.required, placeholder: e.placeholder?.substring(0, 50) }))
    );
    results.pass.push(`[FORM] ${fp.name}: Found ${inputs.length} form fields`);

    // Try submitting empty form to test validation
    const submitBtn = await pg.$('button[type="submit"], input[type="submit"], button:not([type])');
    if (submitBtn) {
      try {
        await submitBtn.click();
        await pg.waitForTimeout(1000);
        // Check for validation messages
        const validationMsgs = await pg.$$eval(':invalid, .error, .invalid, [class*="error"], .required-error, .validation', els =>
          els.filter(e => e.textContent?.trim()).map(e => e.textContent?.trim()?.substring(0, 80))
        );
        if (validationMsgs.length > 0) {
          results.pass.push(`[FORM] ${fp.name}: Validation messages appear: ${validationMsgs.length}`);
        } else {
          results.warnings.push(`[FORM] ${fp.name}: No visible validation messages on empty submit`);
        }
      } catch (err) {
        results.warnings.push(`[FORM] ${fp.name}: Submit test: ${err.message}`);
      }
    }

    // Fill form with test data
    const textInputs = await pg.$$('input[type="text"], input[type="email"], input[type="tel"], textarea');
    for (const input of textInputs) {
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      if (type === 'email') await input.fill('test@test.com');
      else if (type === 'tel') await input.fill('9999999999');
      else await input.fill('Test Data');
    }
    results.pass.push(`[FORM] ${fp.name}: Filled ${textInputs.length} fields with test data`);

    if (jsErrors.length > 0) {
      results.jsErrors.push({ page: fp.name, errors: jsErrors });
    }
    await pg.close();
  }

  // ========== TEST 7: ADMIN DASHBOARD SECTIONS ==========
  console.log('\n=== TEST 7: ADMIN DASHBOARD MODULE LOADING ===');
  {
    const pg = await context.newPage();
    const jsErrors = [];
    pg.on('pageerror', err => jsErrors.push(err.message));

    await pg.goto(BASE + '/portal/admin-dashboard.html', { waitUntil: 'networkidle', timeout: 15000 });

    // Check if dashboard page loads
    const title = await pg.title();
    results.pass.push(`[DASHBOARD] Admin dashboard page title: "${title}"`);

    // Check for sidebar/navigation elements
    const sidebarItems = await pg.$$eval('.sidebar a, .nav-item, .menu-item, [class*="sidebar"] a, [class*="nav"] a', items =>
      items.map(i => ({ text: i.textContent?.trim()?.substring(0, 50), href: i.getAttribute('href') }))
    );
    results.pass.push(`[DASHBOARD] Found ${sidebarItems.length} sidebar/navigation items`);

    // Check for main content area
    const mainContent = await pg.$('#main-content, .main-content, .content, #content, main');
    if (mainContent) {
      results.pass.push('[DASHBOARD] Main content area found');
    } else {
      results.warnings.push('[DASHBOARD] Main content area not found with standard selectors');
    }

    // Check for dynamic section loading mechanism
    const hasSectionLoader = await pg.evaluate(() => {
      return typeof window.loadSection === 'function' || 
             typeof window.navigateSection === 'function' ||
             document.querySelector('[data-section]') !== null ||
             document.querySelector('.section-container') !== null;
    });
    results.pass.push(`[DASHBOARD] Dynamic section loader present: ${hasSectionLoader}`);

    if (jsErrors.length > 0) {
      results.jsErrors.push({ page: 'Admin Dashboard', errors: jsErrors });
    }
    await pg.close();
  }

  // ========== TEST 8: STUDENT & TEACHER DASHBOARDS ==========
  console.log('\n=== TEST 8: STUDENT & TEACHER DASHBOARDS ===');
  const dashboards = [
    { name: 'Student Dashboard', url: '/portal/student-dashboard.html' },
    { name: 'Teacher Dashboard', url: '/portal/teacher-dashboard.html' },
  ];

  for (const dash of dashboards) {
    const pg = await context.newPage();
    const jsErrors = [];
    pg.on('pageerror', err => jsErrors.push(err.message));

    try {
      const resp = await pg.goto(BASE + dash.url, { waitUntil: 'networkidle', timeout: 15000 });
      if (resp?.status() === 200) {
        results.pass.push(`[DASHBOARD] ${dash.name} - loads (200)`);
        const sidebarItems = await pg.$$eval('.sidebar a, .nav-item, .menu-item, [class*="sidebar"] a', items =>
          items.map(i => i.textContent?.trim()?.substring(0, 50))
        );
        results.pass.push(`[DASHBOARD] ${dash.name} - ${sidebarItems.length} nav items`);
      } else {
        results.fail.push(`[DASHBOARD] ${dash.name} - Status: ${resp?.status()}`);
      }
    } catch (err) {
      results.fail.push(`[DASHBOARD] ${dash.name} - ERROR: ${err.message}`);
    }

    if (jsErrors.length > 0) {
      results.jsErrors.push({ page: dash.name, errors: jsErrors });
    }
    await pg.close();
  }

  // ========== TEST 9: SUPER ADMIN PAGE ==========
  console.log('\n=== TEST 9: SUPER ADMIN PAGE ===');
  {
    const pg = await context.newPage();
    const jsErrors = [];
    pg.on('pageerror', err => jsErrors.push(err.message));

    try {
      const resp = await pg.goto(BASE + '/portal/super-admin-pro.html', { waitUntil: 'networkidle', timeout: 15000 });
      if (resp?.status() === 200) {
        results.pass.push('[SUPER-ADMIN] Page loads (200)');
      } else {
        results.fail.push(`[SUPER-ADMIN] Status: ${resp?.status()}`);
      }
    } catch (err) {
      results.fail.push(`[SUPER-ADMIN] ERROR: ${err.message}`);
    }

    if (jsErrors.length > 0) {
      results.jsErrors.push({ page: 'Super Admin', errors: jsErrors });
    }
    await pg.close();
  }

  // ========== TEST 10: QUESTION PAPER FORMATTER ==========
  console.log('\n=== TEST 10: QUESTION PAPER FORMATTER ===');
  {
    const pg = await context.newPage();
    const jsErrors = [];
    pg.on('pageerror', err => jsErrors.push(err.message));

    try {
      const resp = await pg.goto(BASE + '/portal/tool-question-formatter.html', { waitUntil: 'networkidle', timeout: 15000 });
      if (resp?.status() === 200) {
        results.pass.push('[TOOL] Question Paper Formatter loads (200)');
        // Check for form elements
        const formEls = await pg.$$eval('input, textarea, select, button', els =>
          els.map(e => ({ tag: e.tagName, type: e.type, text: e.textContent?.trim()?.substring(0, 30) }))
        );
        results.pass.push(`[TOOL] Found ${formEls.length} interactive elements`);
      } else {
        results.fail.push(`[TOOL] Status: ${resp?.status()}`);
      }
    } catch (err) {
      results.fail.push(`[TOOL] ERROR: ${err.message}`);
    }

    if (jsErrors.length > 0) {
      results.jsErrors.push({ page: 'Question Paper Formatter', errors: jsErrors });
    }
    await pg.close();
  }

  // ========== TEST 11: CSS & RESOURCE LOADING ==========
  console.log('\n=== TEST 11: CSS & RESOURCES ===');
  {
    const pg = await context.newPage();
    const failedResources = [];
    pg.on('requestfailed', req => failedResources.push(`${req.url()} - ${req.failure()?.errorText}`));

    await pg.goto(BASE + '/school.html', { waitUntil: 'networkidle', timeout: 15000 });

    // Check CSS files loaded
    const cssLoaded = await pg.evaluate(() => {
      return Array.from(document.styleSheets).map(s => s.href).filter(Boolean);
    });
    results.pass.push(`[CSS] ${cssLoaded.length} stylesheets loaded on homepage`);

    if (failedResources.length > 0) {
      results.networkErrors.push({ page: 'Homepage resources', errors: failedResources });
    }

    // Check for broken CSS on other pages
    for (const url of ['/about.html', '/academics.html', '/admissions.html', '/facilities.html']) {
      const pg2 = await context.newPage();
      const pageFailed = [];
      pg2.on('requestfailed', req => pageFailed.push(`${req.url()}`));
      await pg2.goto(BASE + url, { waitUntil: 'networkidle', timeout: 15000 });
      if (pageFailed.length > 0) {
        results.networkErrors.push({ page: url, errors: pageFailed });
      }
      await pg2.close();
    }

    await pg.close();
  }

  // ========== TEST 12: RESPONSIVE DESIGN ==========
  console.log('\n=== TEST 12: RESPONSIVE DESIGN ===');
  const viewports = [
    { name: 'Mobile', width: 375, height: 812 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 },
  ];

  for (const vp of viewports) {
    const pg = await context.newPage();
    await pg.setViewportSize({ width: vp.width, height: vp.height });

    await pg.goto(BASE + '/school.html', { waitUntil: 'networkidle', timeout: 15000 });

    // Check for horizontal overflow
    const hasOverflow = await pg.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    if (hasOverflow) {
      results.warnings.push(`[RESPONSIVE] ${vp.name} (${vp.width}x${vp.height}): Horizontal overflow detected`);
    } else {
      results.pass.push(`[RESPONSIVE] ${vp.name} (${vp.width}x${vp.height}): No horizontal overflow`);
    }

    // Check mobile menu/hamburger
    if (vp.width < 768) {
      const hamburger = await pg.$('.hamburger, .navbar-toggler, .mobile-menu, [class*="hamburger"], [class*="menu-toggle"], button[aria-label*="menu"], button[aria-label*="Menu"]');
      if (hamburger) {
        results.pass.push(`[RESPONSIVE] Mobile: Hamburger menu found`);
      } else {
        results.warnings.push(`[RESPONSIVE] Mobile: No hamburger menu detected`);
      }
    }

    await pg.close();
  }

  // ========== TEST 13: PWA & SERVICE WORKER ==========
  console.log('\n=== TEST 13: PWA & SERVICE WORKER ===');
  {
    const pg = await context.newPage();
    await pg.goto(BASE + '/school.html', { waitUntil: 'networkidle', timeout: 15000 });

    const swRegistered = await pg.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        return regs.length > 0;
      }
      return false;
    });
    results.pass.push(`[PWA] Service Worker registered: ${swRegistered}`);

    const manifest = await pg.evaluate(() => {
      const link = document.querySelector('link[rel="manifest"]');
      return link ? link.href : null;
    });
    if (manifest) {
      results.pass.push(`[PWA] Manifest linked: ${manifest}`);
    } else {
      results.warnings.push('[PWA] No manifest link found');
    }

    await pg.close();
  }

  // ========== TEST 14: ADMIN DASHBOARD DYNAMIC SECTIONS ==========
  console.log('\n=== TEST 14: ADMIN DASHBOARD SECTION MODULES ===');
  {
    const pg = await context.newPage();
    await pg.goto(BASE + '/portal/admin-dashboard.html', { waitUntil: 'networkidle', timeout: 15000 });

    // Try to find and click sidebar items to load sections
    const sidebarLinks = await pg.$$('.sidebar a[href], .nav-item a, [class*="sidebar"] a[href], [data-section]');
    results.pass.push(`[SECTIONS] Found ${sidebarLinks.length} sidebar links in admin dashboard`);

    // Try clicking first few sidebar items
    let sectionsLoaded = 0;
    let sectionsFailed = 0;
    for (let i = 0; i < Math.min(sidebarLinks.length, 15); i++) {
      try {
        const text = await sidebarLinks[i].textContent();
        await sidebarLinks[i].click();
        await pg.waitForTimeout(1000);
        const content = await pg.$('#main-content, .main-content, .content-area');
        if (content) {
          const html = await content.innerHTML();
          if (html.length > 50) {
            sectionsLoaded++;
          } else {
            sectionsFailed++;
            results.warnings.push(`[SECTIONS] Section "${text?.trim()}" loaded but content is empty`);
          }
        }
      } catch (err) {
        sectionsFailed++;
      }
    }
    results.pass.push(`[SECTIONS] Tested ${Math.min(sidebarLinks.length, 15)} sections: ${sectionsLoaded} loaded, ${sectionsFailed} failed`);

    await pg.close();
  }

  // ========== TEST 15: GLOBAL JS ERRORS CHECK ==========
  console.log('\n=== TEST 15: GLOBAL JS ERROR CHECK ===');
  {
    const criticalPages = [
      '/school.html', '/about.html', '/academics.html', '/admissions.html',
      '/facilities.html', '/gallery.html', '/contact.html', '/inquiry.html',
      '/platform.html', '/portal/admin-login.html', '/portal/student-login.html',
    ];

    for (const url of criticalPages) {
      const pg = await context.newPage();
      const jsErrors = [];
      pg.on('pageerror', err => jsErrors.push(err.message));

      await pg.goto(BASE + url, { waitUntil: 'networkidle', timeout: 15000 });
      await pg.waitForTimeout(2000);

      if (jsErrors.length > 0) {
        results.jsErrors.push({ page: url, errors: jsErrors });
      }
      await pg.close();
    }
  }

  // ========== COMPILE REPORT ==========
  console.log('\n\n' + '='.repeat(80));
  console.log('COMPREHENSIVE TEST REPORT - SNR EDU ERP');
  console.log('='.repeat(80));

  console.log(`\n✅ PASSED: ${results.pass.length}`);
  console.log(`❌ FAILED: ${results.fail.length}`);
  console.log(`⚠️  WARNINGS: ${results.warnings.length}`);
  console.log(`🐛 JS ERRORS: ${results.jsErrors.length} pages affected`);
  console.log(`🌐 NETWORK ERRORS: ${results.networkErrors.length} pages affected`);

  if (results.fail.length > 0) {
    console.log('\n--- FAILURES ---');
    results.fail.forEach(f => console.log(`  ❌ ${f}`));
  }

  if (results.warnings.length > 0) {
    console.log('\n--- WARNINGS ---');
    results.warnings.forEach(w => console.log(`  ⚠️  ${w}`));
  }

  if (results.jsErrors.length > 0) {
    console.log('\n--- JAVASCRIPT ERRORS ---');
    results.jsErrors.forEach(j => {
      console.log(`  🐛 ${j.page}:`);
      j.errors.forEach(e => console.log(`     - ${e.substring(0, 200)}`));
    });
  }

  if (results.networkErrors.length > 0) {
    console.log('\n--- NETWORK ERRORS ---');
    results.networkErrors.forEach(n => {
      console.log(`  🌐 ${n.page}:`);
      n.errors.forEach(e => console.log(`     - ${e.substring(0, 200)}`));
    });
  }

  if (results.pass.length > 0) {
    console.log('\n--- PASSED CHECKS (summary) ---');
    results.pass.forEach(p => console.log(`  ✅ ${p}`));
  }

  await browser.close();
  console.log('\n=== TEST COMPLETE ===');
}

run().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
