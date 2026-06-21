// cms-settings.js — Loads all CMS data from Firestore and populates the live website pages.
// Included on all public pages after firebase-config.js

(function applyCMSSettings() {
    async function tryApply() {
        if (typeof db === 'undefined' || !db) {
            setTimeout(tryApply, 200);
            return;
        }

        // Wait for school slug → ID resolution before querying school data
        if (window.schoolBootstrapReady) {
            await window.schoolBootstrapReady;
        }

        const page = window.location.pathname.split('/').pop() || 'school.html';
        const pageKey = page.replace('.html', '') || 'school';
        // Map 'school' or 'index' to 'home'
        const normalizedKey = (pageKey === 'school' || pageKey === 'index') ? 'home' : pageKey;
        applyPageText(normalizedKey);

        // Inject SEO meta tags (canonical, sitemap, robots) on every public page.
        injectSEOMeta();

        loadGeneralSettings();
        updateHeaderLoginLinks();
        loadBirthdays();
        loadEvents();
        loadAchievements();
        loadTestimonials();
        loadGalleryPage();
        loadStaff();
        loadHolidays();
        loadAdmissionFacilities();
        loadFees();
        loadHomeFacilities();
        loadHomeMemories();
        loadHeroSlider();
        loadAboutHero();
        loadFacilitiesPageData();
        loadGlobalStats();
    }

    // ===================== SEO META INJECTION =====================
    // Adds canonical, sitemap, robots, and hreflang alternates to the page <head>
    // when missing. Idempotent: safe to call on every page load.
    function injectSEOMeta() {
        const head = document.head;
        if (!head) return;

        const path = window.location.pathname;
        const cleanPath = path.endsWith('/') ? path : path + '/';
        const origin = window.location.origin;
        const canonical = origin + (path === '/' ? '/' : cleanPath);

        addLink('canonical', canonical);
        // Sitemap pointer (helps crawlers discover the sitemap)
        if (!document.querySelector('link[rel="sitemap"]')) {
            addLink('sitemap', origin + '/sitemap.xml');
        }
        // hreflang alternates (English default, Hindi to be enabled in i18n pass)
        addHreflang('en', canonical);
        addHreflang('hi', canonical + (canonical.indexOf('?') > -1 ? '&' : '?') + 'lang=hi');
        addHreflang('x-default', canonical);
    }

    function addLink(rel, href) {
        if (document.querySelector('link[rel="' + rel + '"]')) return;
        const l = document.createElement('link');
        l.rel = rel;
        l.href = href;
        document.head.appendChild(l);
    }

    function addHreflang(lang, href) {
        if (document.querySelector('link[rel="alternate"][hreflang="' + lang + '"]')) return;
        const l = document.createElement('link');
        l.rel = 'alternate';
        l.hreflang = lang;
        l.href = href;
        document.head.appendChild(l);
    }

    // ===================== ERROR HANDLING UI =====================
    function handleLoadError(containerId, error) {
        console.warn(`[CMS] Error loading ${containerId}:`, error);
        const el = document.getElementById(containerId);
        if (el && (el.innerHTML.includes('Loading') || el.innerHTML === '')) {
            el.innerHTML = `<div class="p-6 text-center text-slate-400 bg-slate-50/5 rounded-xl border border-dashed border-slate-200 glass-card">
                <i class="fas fa-wifi-slash mb-3 text-xl opacity-50"></i>
                <p class="text-xs font-medium">Content temporarily unavailable</p>
                <p class="text-[10px] opacity-70 mt-1">Please check your connection</p>
            </div>`;
        }
    }

    // ===================== ABOUT PAGE HERO =====================
    async function loadAboutHero() {
        const hero = document.getElementById('aboutHeroSection');
        if (!hero) return;

        try {
            const doc = await schoolDoc('settings', 'aboutPage').get();
            if (doc.exists && doc.data().heroUrl) {
                hero.style.backgroundImage = `url("${ensureAbsoluteUrl(doc.data().heroUrl)}")`;
            }
        } catch (e) {
            handleLoadError('aboutHeroSection', e);
        }
    }

    // ===================== FACILITIES PAGE =====================
    async function loadFacilitiesPageData() {
        const hero = document.getElementById('facilitiesHero');
        const sliderTrack = document.getElementById('facilitiesSliderTrack');
        const hoverGrid = document.getElementById('facilitiesHoverGrid');
        const gallerySliderTrack = document.getElementById('facilitiesGallerySliderTrack');

        if (!hero && !sliderTrack && !hoverGrid && !gallerySliderTrack) return;

        try {
            const doc = await schoolDoc('settings', 'facilitiesPage').get();
            if (!doc.exists) return;
            const data = doc.data();

            // 1. Hero
            if (hero && data.heroUrl) hero.style.backgroundImage = `url("${ensureAbsoluteUrl(data.heroUrl)}")`;

            // 2. Top Slider (Campus Life)
            if (sliderTrack && data.sliderUrls && data.sliderUrls.length > 0) {
                const imgHtml = data.sliderUrls.map((url) => `<img src="${ensureAbsoluteUrl(url)}" alt="Campus">`).join('');
                sliderTrack.innerHTML = imgHtml + imgHtml; // Duplicate for infinite loop
            }

            // 3. Hover Features
            if (hoverGrid && data.featureUrls && data.featureUrls.length > 0) {
                const featureImages = hoverGrid.querySelectorAll('.facility-panel img');
                data.featureUrls.forEach((url, i) => {
                    if (featureImages[i] && url) featureImages[i].src = ensureAbsoluteUrl(url);
                });
            }

            // 4. Bottom Gallery Slider
            if (gallerySliderTrack && data.galleryUrls && data.galleryUrls.length > 0) {
                const imgHtml = data.galleryUrls
                    .map((url) => `<img src="${ensureAbsoluteUrl(url)}" loading="lazy" alt="Facility Photo">`)
                    .join('');
                gallerySliderTrack.innerHTML = imgHtml + imgHtml; // Duplicate for infinite loop
            }
        } catch (e) {
            handleLoadError('facilitiesPage', e);
        }
    }

    // ===================== GLOBAL STATS =====================
    async function loadGlobalStats() {
        try {
            const doc = await schoolDoc('settings', 'globalStats').get();
            if (doc.exists) {
                const data = doc.data();
                const map = {
                    stat_students: data.students,
                    stat_teachers: data.teachers,
                    stat_classrooms: data.classrooms,
                    stat_years: data.years,
                };

                for (const [id, val] of Object.entries(map)) {
                    const el = document.getElementById(id);
                    if (el && val !== undefined) {
                        el.setAttribute('data-target', val);
                        if (el.innerText === '0' || el.innerText === '') el.innerText = val + '+';
                    }
                }
            }
        } catch (e) {
            handleLoadError('globalStats', e);
        }
    }

    // ===================== PAGE TEXT CUSTOMIZATION =====================
    async function applyPageText(pageKey) {
        try {
            const doc = await schoolDoc('pageText', pageKey).get();
            if (doc.exists) {
                const data = doc.data();
                const pagePrefix = pageKey.charAt(0).toLowerCase() + pageKey.slice(1);

                for (const [dbKey, value] of Object.entries(data)) {
                    if (!value || dbKey === 'updatedAt' || dbKey === 'schoolId') continue;

                    // Try multiple ID mapping strategies
                    const possibleIds = [
                        dbKey, // exact match
                        pagePrefix + dbKey.charAt(0).toUpperCase() + dbKey.slice(1), // academicsHeaderSubtitle
                        'text' + pageKey.charAt(0).toUpperCase() + pageKey.slice(1) + dbKey.charAt(0).toUpperCase() + dbKey.slice(1) // textAcademicsHeaderSubtitle (for admin)
                    ];

                    for (const id of possibleIds) {
                        const el = document.getElementById(id);
                        if (el) {
                            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.value = value;
                            else el.innerText = value;
                            break; // found and applied
                        }
                    }
                }
            }
        } catch (e) {
            console.error(`Error applying text for ${pageKey}:`, e);
        }
    }
    // ===================== HOME PAGE HERO SLIDER =====================
    async function loadHeroSlider() {
        const slider = document.getElementById('heroSlider');
        const dotsContainer = document.getElementById('heroSliderDots');
        if (!slider || !dotsContainer) return;

        try {
            const doc = await schoolDoc('settings', 'homeHero').get();
            let urls = [];
            if (doc.exists) {
                urls = doc.data().urls || [];
            }

            if (urls.length === 0) {
                // Fallback defaults
                if (window.CURRENT_SCHOOL_ID === 'SCH001') {
                    urls = [
                        'School-Building.jpeg',
                        'Bihar-Museum-img4.jpeg',
                        'Science-centre-Patna-img15.jpeg',
                        'Republic-Day-img1.jpeg',
                    ];
                } else {
                    urls = [
                        'https://images.unsplash.com/photo-1523050853064-dbad350e700a?auto=format&fit=crop&w=1200&q=80',
                        'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=1200&q=80'
                    ];
                }
            }

            slider.innerHTML = '';
            dotsContainer.innerHTML = '';
            urls.forEach((url, i) => {
                const img = document.createElement('img');
                const fname = mediaFilenameFromUrl(url);
                if (fname) {
                    img.setAttribute('data-snr-media', fname);
                } else {
                    img.src = ensureAbsoluteUrl(url);
                }
                img.className = i === 0 ? 'slide active' : 'slide';
                img.id = `slide_${i + 1}`;
                slider.appendChild(img);

                const dot = document.createElement('span');
                dot.className = i === 0 ? 'dot active' : 'dot';
                dotsContainer.appendChild(dot);
            });
            notifyDomChanged();

            // Re-init slider logic from script.js
            if (typeof initHeroSlider === 'function') {
                initHeroSlider();
            }
        } catch (e) {
            handleLoadError('heroSlider', e);
        }
    }

    // Helper to ensure image URLs are root-relative
    function ensureAbsoluteUrl(url) {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('/')) return url;
        const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
        return '/' + cleanUrl;
    }

    // Extract a media-library filename from a url string, or null if not a local
    // media reference. Used to convert <img src="images/X"> into
    // <img data-snr-media="X"> so media-loader.js can resolve to a base64 data URL.
    function mediaFilenameFromUrl(url) {
        if (!url) return null;
        // Already a data URL or external — leave alone.
        if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) return null;
        // Strip leading ./, /, images/ prefix.
        const stripped = url.replace(/^(\.\/|\/)+/, '').replace(/^images\//, '');
        // Must be a recognizable image file
        if (/\.(jpe?g|png)$/i.test(stripped)) return stripped;
        return null;
    }

    // Dispatched after dynamic content has been written to the DOM so the
    // media-loader.js can resolve any newly-injected [data-snr-media] tags.
    function notifyDomChanged() {
        document.dispatchEvent(new Event('snr:dom-changed'));
    }

    // ===================== HOME PAGE MEMORIES =====================
    async function loadHomeMemories() {
        const grid = document.getElementById('homeMemoriesGrid');
        if (!grid) return;

        try {
            const doc = await schoolDoc('settings', 'homeMemories').get();
            if (doc.exists) {
                const urls = doc.data().urls || [];
                if (urls.length > 0) {
                    grid.innerHTML = '';
                    urls.forEach((url) => {
                        const fname = mediaFilenameFromUrl(url);
                        if (fname) {
                            grid.innerHTML += `<img data-snr-media="${fname}" loading="lazy" onclick="openLightbox(this)" style="cursor:pointer;">`;
                        } else {
                            grid.innerHTML += `<img src="${ensureAbsoluteUrl(url)}" loading="lazy" onclick="openLightbox(this)" style="cursor:pointer;">`;
                        }
                    });
                    notifyDomChanged();
                    return;
                }
            }
            // Fallback to static defaults
            grid.innerHTML = `
                <img  data-snr-media="Bihar-Museum-img1.jpeg" onclick="openLightbox(this)">
                <img  data-snr-media="Science-centre-Patna-img3.jpeg" onclick="openLightbox(this)">
                <img  data-snr-media="Republic-Day-img1.jpeg" onclick="openLightbox(this)">
                <img  data-snr-media="Sports-Event-Prize-Distribution-img1.jpeg" onclick="openLightbox(this)">
                <img  data-snr-media="Bihar-Museum-img4.jpeg" onclick="openLightbox(this)">
                <img  data-snr-media="Bihar-Museum-img7.jpeg" onclick="openLightbox(this)">
                <img  data-snr-media="Science-centre-Patna-img1.jpeg" onclick="openLightbox(this)">
                <img  data-snr-media="Republic-Day-img2.jpeg" onclick="openLightbox(this)">
            `;
        } catch (e) {
            handleLoadError('homeMemoriesGrid', e);
        }
    }

    // ===================== HOME PAGE FACILITIES =====================
    async function loadHomeFacilities() {
        const track = document.getElementById('homeFacilitiesTrack');
        if (!track) return;

        try {
            const doc = await schoolDoc('settings', 'homeFacilities').get();
            if (doc.exists) {
                const data = doc.data().facilities || [];
                if (data.length > 0) {
                    track.innerHTML = '';
                    data.forEach((item) => {
                        const fname = mediaFilenameFromUrl(item.url);
                        if (fname) {
                            track.innerHTML += `
                                <div class="facility-slide">
                                    <img data-snr-media="${fname}" loading="lazy">
                                    <div class="facility-name">${item.name}</div>
                                </div>`;
                        } else {
                            track.innerHTML += `
                                <div class="facility-slide">
                                    <img src="${ensureAbsoluteUrl(item.url)}" loading="lazy">
                                    <div class="facility-name">${item.name}</div>
                                </div>`;
                        }
                    });
                    notifyDomChanged();
                    return;
                }
            }
            // Fallback to defaults
            track.innerHTML = `
                <div class="facility-slide"><img  data-snr-media="Classroom-img1.jpeg"><div class="facility-name">Smart Classrooms</div></div>
                <div class="facility-slide"><img  data-snr-media="School-Building.jpeg"><div class="facility-name">Computer Lab</div></div>
                <div class="facility-slide"><img  data-snr-media="Sports-Event-Prize-Distribution-img1.jpeg"><div class="facility-name">Sports Ground</div></div>
                <div class="facility-slide"><img  data-snr-media="Classroom-img1.jpeg"><div class="facility-name">CCTV Security</div></div>
            `;
            notifyDomChanged();
        } catch (e) {
            handleLoadError('homeFacilitiesTrack', e);
        }
    }

    // ===================== ADMISSION FACILITIES (admissions.html) =====================
    function loadAdmissionFacilities() {
        const grid = document.getElementById('admissionsFacilitiesGrid');
        if (!grid) return;

        schoolDoc('settings', 'admissions')
            .get()
            .then((doc) => {
                const d = doc.exists ? doc.data() : {};

                const mapping = {
                    facility_smart_class: d.smart_class_urls,
                    facility_computer_lab: d.computer_lab_urls,
                    facility_sports: d.sports_urls,
                    facility_security: d.security_urls,
                    facility_transport: d.transport_urls,
                };

                Object.entries(mapping).forEach(([id, urls]) => {
                    const container = document.getElementById(id);
                    if (container && urls && urls.length > 0) {
                        container.innerHTML = '';
                        urls.forEach((url) => {
                            const fname = mediaFilenameFromUrl(url);
                            if (fname) {
                                container.innerHTML += `<img data-snr-media="${fname}" style="width:100px; height:80px; object-fit:cover; border-radius:0.5rem; cursor:pointer;" onclick="event.stopPropagation(); openLightbox(this)">`;
                            } else {
                                container.innerHTML += `<img src="${ensureAbsoluteUrl(url)}" style="width:100px; height:80px; object-fit:cover; border-radius:0.5rem; cursor:pointer;" onclick="event.stopPropagation(); openLightbox({src:'${ensureAbsoluteUrl(url)}'})">`;
                            }
                        });
                    } else if (container) {
                        container.innerHTML =
                            '<p style="grid-column:1/-1; font-size:0.8rem; color:#94a3b8; text-align:center;">No photos yet.</p>';
                    }
                });
                notifyDomChanged();
            })
            .catch((e) => handleLoadError('admissionsFacilitiesGrid', e));
    }

    // ===================== GENERAL SETTINGS =====================
    function loadGeneralSettings() {
        Promise.all([
            schoolDoc('settings', 'general').get(),
            schoolRef().get(),
        ])
            .then(function ([settingsDoc, metaDoc]) {
                if (!settingsDoc.exists && !metaDoc.exists) return;

                // Merge: settings doc wins; fall back to school metadata for missing fields.
                const s = settingsDoc.exists ? settingsDoc.data() : {};
                const m = metaDoc.exists ? metaDoc.data() : {};
                const d = Object.assign(
                    {
                        // Defaults from school metadata
                        name: m.schoolName || m.name,
                        schoolName: m.schoolName || m.name,
                        location: m.schoolLocation,
                        schoolLocation: m.schoolLocation,
                        logoUrl: m.logo,
                        schoolLogo: m.logo,
                        email: m.adminEmail,
                        phone: m.phone,
                    },
                    s
                );

                // 1. Branding: Names & Text
                const textMap = {
                    'header-school-name': d.schoolName || d.name,
                    'mobile-school-name': d.schoolName || d.name,
                    'footer-school-name': d.schoolName || d.name,
                    'header-school-location': d.schoolLocation || d.location,
                    'header-school-udise-reg': d.udise_reg || d.schoolUdiseReg || `UDISE: ${d.schoolUdise || d.udise || '-'} | Registration: ${d.schoolReg || d.reg || '-'}`,
                    'footer-school-tagline': d.tagline,
                    'footer-address-short': d.address_short || d.schoolLocation || d.location,
                    'footer-address-full': d.address_full || d.address,
                    'footer-copyright': d.copyright || `© ${new Date().getFullYear()} ${d.schoolName || d.name || 'School'}. All Rights Reserved.`,
                    'dyn-phone': d.phone,
                    'footer-phone': d.phone ? `📞 ${d.phone}` : '',
                    'dyn-email': d.email,
                    'footer-email': d.email ? `✉ ${d.email}` : '',
                };

                Object.entries(textMap).forEach(([id, val]) => {
                    if (!val) return;
                    document.querySelectorAll(`#${id}, .${id}`).forEach(el => el.textContent = val);
                });

                // 2. Branding: Logos
                const logoUrl = d.schoolLogo || d.logoUrl;
                if (logoUrl) {
                    const logoIds = ['header-logo', 'mobile-header-logo'];
                    logoIds.forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.src = ensureAbsoluteUrl(logoUrl);
                    });
                }

                // 3. Map
                if (d.mapIframeUrl) {
                    const mapEl = document.getElementById('footer-map-iframe');
                    if (mapEl) mapEl.src = d.mapIframeUrl;
                }

                // Marquee
                if (d.marquee)
                    document
                        .querySelectorAll('.dyn-marquee, #dyn-marquee, marquee')
                        .forEach((el) => (el.textContent = d.marquee));

                // WhatsApp Link
                if (d.phone) {
                    document
                        .querySelectorAll('.float-whatsapp')
                        .forEach((el) => (el.href = 'https://wa.me/' + d.phone.replace(/[^0-9]/g, '')));
                }

                // Stats
                const stats = {
                    stat_students: d.stat_students,
                    stat_teachers: d.stat_teachers,
                    stat_classrooms: d.stat_classrooms,
                    stat_years: d.stat_years,
                };
                Object.entries(stats).forEach(([id, val]) => {
                    const el = document.getElementById(id);
                    if (el && val) {
                        el.setAttribute('data-target', val);
                        el.textContent = val + '+';
                    }
                });

                // Admission Status
                const badge = document.getElementById('admissionBadge');
                const btn = document.getElementById('heroAdmissionBtn');
                if (badge) {
                    const isOpen = d.admissionStatus !== 'closed';
                    badge.style.background = isOpen ? '#10b981' : '#ef4444';
                    badge.textContent = isOpen ? '✅ Admission Open' : '❌ Admission Closed';
                }
                if (btn && d.admissionSession) btn.textContent = 'Admission Open ' + d.admissionSession;

                // 4. Generic data-school-field attribute handler (multi-tenant)
                applySchoolFieldAttributes(d);
            })
            .catch((e) => console.warn('General settings:', e.message));
    }

    // ===================== DATA-SCHOOL-FIELD ATTRIBUTE HANDLER =====================
    // Populates any element with [data-school-field="<key>"] from the settings doc.
    // Supports text content (default), href (links), and src (images/iframes).
    // For convenience, derives: phoneLabel, emailLabel, whatsappLink, gmailLink, address_full, copyright, schoolUdiseReg, address_short, schoolLocation, schoolName, etc.
    function applySchoolFieldAttributes(d) {
        const year = new Date().getFullYear();
        const derivedUdiseReg = d.schoolUdiseReg
            || d.udise_reg
            || (d.schoolUdise || d.udise
                ? `UDISE: ${d.schoolUdise || d.udise}${d.schoolReg || d.reg ? ' | Registration: ' + (d.schoolReg || d.reg) : ''}`
                : '');
        const fields = {
            schoolName: d.schoolName || d.name,
            schoolLocation: d.schoolLocation || d.location,
            schoolUdiseReg: derivedUdiseReg,
            schoolUdise: d.schoolUdise || d.udise,
            schoolReg: d.schoolReg || d.reg,
            tagline: d.tagline,
            address_short: d.address_short || d.schoolLocation || d.location,
            address_full: d.address_full || d.address,
            copyright: d.copyright || `© ${year} ${d.schoolName || d.name || 'School'}. All Rights Reserved.`,
            phone: d.phone,
            email: d.email,
            phoneLabel: d.phone ? `📞 ${d.phone}` : '📞 —',
            emailLabel: d.email ? `✉ ${d.email}` : '✉ —',
            dpoEmail: d.dpoEmail,
            dpoPhone: d.dpoPhone,
            logoUrl: d.schoolLogo || d.logoUrl,
            mapIframeUrl: d.mapIframeUrl,
            marquee: d.marquee,
            whatsappLink: d.phone ? 'https://wa.me/' + String(d.phone).replace(/[^0-9]/g, '') : '#',
            gmailLink: d.email ? `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(d.email)}&su=Inquiry%20-%20${encodeURIComponent(d.schoolName || d.name || 'School')}` : '#',
        };

        document.querySelectorAll('[data-school-field]').forEach((el) => {
            const key = el.getAttribute('data-school-field');
            const val = fields[key];
            if (val === undefined || val === null || val === '') return;

            // <a> elements → href; <img>/<iframe> → src; everything else → text
            if (el.tagName === 'A') {
                el.setAttribute('href', String(val));
            } else if (el.tagName === 'IMG' || el.tagName === 'IFRAME') {
                el.setAttribute('src', String(val));
            } else {
                el.textContent = String(val);
            }
        });
    }

    // ===================== BIRTHDAYS =====================
    function loadBirthdays() {
        const section = document.getElementById('birthdaySection');
        const container = document.getElementById('birthdayContainer');
        if (!container || !section) return;

        const today = new Date();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const mm_dd = `${mm}-${dd}`;

        const colors = ['#ff6b6b', '#4dabf7', '#51cf66', '#fcc419', '#cc5de8'];

        schoolData('students')
            .get()
            .then((snap) => {
                if (snap.empty) return;
                let birthdayStudents = [];
                snap.forEach((doc) => {
                    const s = doc.data();
                    if (s.dob && s.dob.endsWith(mm_dd)) {
                        birthdayStudents.push(s);
                    }
                });

                if (birthdayStudents.length > 0) {
                    section.style.display = 'block';
                    container.innerHTML = '';
                    birthdayStudents.forEach((d, i) => {
                        const c = colors[i % colors.length];
                        let iconHtml = `<i class="fas fa-cake-candles" style="color: ${c}; font-size: 2.5rem; background: ${c}22; width: 80px; height: 80px; line-height: 80px; border-radius: 50%;"></i>`;
                        if (d.photo_url) {
                            iconHtml = `<img src="${d.photo_url}" alt="${d.name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 1.5rem; border: 3px solid ${c}; box-shadow: 0 4px 10px ${c}40;">`;
                        }
                        container.innerHTML += `<div class="premium-card">${iconHtml}<h3>${d.name}</h3><p>Class ${d.class || '-'}</p></div>`;
                    });
                } else {
                    section.style.display = 'none';
                }
            })
            .catch((e) => handleLoadError('birthdayContainer', e));
    }

    // ===================== EVENTS =====================
    function loadEvents() {
        const container = document.getElementById('eventsContainer');
        if (!container) return;
        const icons = ['fa-calendar-day', 'fa-hand-holding-heart', 'fa-door-open', 'fa-star', 'fa-flag', 'fa-graduation-cap'];
        schoolData('events')
            .orderBy('createdAt', 'asc')
            .get()
            .then((snap) => {
                if (snap.empty) return;
                container.innerHTML = '';
                let i = 0;
                snap.forEach((doc) => {
                    const d = doc.data();
                    container.innerHTML += `<div class="premium-card">
                    <i class="fas ${icons[i % icons.length]}" style="color:var(--primary); font-size:2.5rem;"></i>
                    <h3>${d.title}</h3>
                    <p>${d.date}${d.subtitle ? ' · ' + d.subtitle : ''}</p>
                </div>`;
                    i++;
                });
            })
            .catch((e) => handleLoadError('eventsContainer', e));
    }

    // ===================== ACHIEVEMENTS =====================
    function loadAchievements() {
        const container = document.getElementById('achievementsContainer');
        if (!container) return;
        const colors = ['#f1c40f', '#e67e22', '#3498db', '#10b981', '#e74c3c'];
        const icons = ['fa-trophy', 'fa-medal', 'fa-star', 'fa-award', 'fa-certificate'];
        schoolData('achievements')
            .orderBy('createdAt', 'asc')
            .get()
            .then((snap) => {
                if (snap.empty) return;
                container.innerHTML = '';
                let i = 0;
                snap.forEach((doc) => {
                    const d = doc.data();
                    const c = colors[i % colors.length];
                    container.innerHTML += `<div class="premium-card">
                    <i class="fas ${icons[i % icons.length]}" style="color:${c}; font-size:2.5rem; background:${c}22; width:80px; height:80px; line-height:80px; border-radius:50%;"></i>
                    <h3>${d.title}</h3>
                    <p>${d.description || ''}</p>
                </div>`;
                    i++;
                });
            })
            .catch((e) => handleLoadError('achievementsContainer', e));
    }

    // ===================== TESTIMONIALS =====================
    function loadTestimonials() {
        const section = document.getElementById('testimonialsSection');
        const container = document.getElementById('testimonialsContainer');
        if (!container || !section) return;
        schoolData('testimonials')
            .orderBy('createdAt', 'asc')
            .get()
            .then((snap) => {
                if (snap.empty) return;
                section.style.display = 'block';
                container.innerHTML = '';
                snap.forEach((doc) => {
                    const d = doc.data();
                    container.innerHTML += `<div class="premium-card" style="text-align:left; padding:2rem;">
                    <i class="fas fa-quote-left" style="color:var(--primary-light); font-size:1.5rem; margin-bottom:1rem;"></i>
                    <p style="font-style:italic; color:var(--text-muted); margin-bottom:1.5rem; line-height:1.7;">"${d.quote}"</p>
                    <div style="display:flex; align-items:center; gap:0.75rem;">
                        <div style="width:42px; height:42px; background:var(--primary); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:700;">${(d.name || '?')[0]}</div>
                        <div><b style="display:block;">${d.name}</b><span style="font-size:0.8rem; color:var(--text-muted);">${d.relation || ''}</span></div>
                    </div>
                </div>`;
                });
            })
            .catch((e) => handleLoadError('testimonialsContainer', e));
    }

    // ===================== GALLERY PAGE =====================
    function loadGalleryPage() {
        const container = document.getElementById('galleryDynamicGrid');
        const filters = document.getElementById('galleryFilters');
        if (!container) return;

        let allImages = [];
        if (window.CURRENT_SCHOOL_ID === 'SCH001') {
            const legacyImages = [
                { url: 'Facilities-Slide-img1.jpeg', category: 'Facilities' },
                { url: 'Computer Lap.jpeg', category: 'Facilities' },
                { url: 'Facilities-Slide-img2.jpeg', category: 'Facilities' },
                { url: 'Facilities-Slide-img3.jpeg', category: 'Facilities' },
                { url: 'Facilities-Slide-img4.jpeg', category: 'Facilities' },
                { url: 'Classroom-img1.jpeg', category: 'Facilities' },
                { url: 'Bihar-Museum-img1.jpeg', category: 'Museum' },
                { url: 'Bihar-Museum-img2.jpeg', category: 'Museum' },
                { url: 'Bihar-Museum-img3.jpeg', category: 'Museum' },
                { url: 'Bihar-Museum-img4.jpeg', category: 'Museum' },
                { url: 'Bihar-Museum-img5.jpeg', category: 'Museum' },
                { url: 'Bihar-Museum-img6.jpeg', category: 'Museum' },
                { url: 'Bihar-Museum-img7.jpeg', category: 'Museum' },
                { url: 'Bihar-Museum-img8.jpeg', category: 'Museum' },
                { url: 'Bihar-Museum-img10.jpeg', category: 'Museum' },
                { url: 'Science-centre-Patna-img3.jpeg', category: 'Science' },
                { url: 'Republic-Day-img1.jpeg', category: 'Events' },
                { url: 'Republic-Day-img2.jpeg', category: 'Events' },
                { url: 'Republic-Day-img3.jpeg', category: 'Events' },
                { url: 'Sports-Event-Prize-Distribution-img1.jpeg', category: 'Sports' },
                { url: 'Sports-Event-Prize-Distribution-img2.jpeg', category: 'Sports' },
                { url: 'Vaisali-School-Trip-img1.jpeg', category: 'Trip' },
                { url: 'Vaisali-School-Trip-img2.jpeg', category: 'Trip' },
                { url: 'Vaisali-School-Trip-img3.jpeg', category: 'Trip' },
                { url: 'Science-centre-Patna-img1.jpeg', category: 'Science' },
                { url: 'Science-centre-Patna-img2.jpeg', category: 'Science' },
                { url: 'Science-centre-Patna-img4.jpeg', category: 'Science' },
                { url: 'Science-centre-Patna-img5.jpeg', category: 'Science' },
                { url: 'Science-centre-Patna-img6.jpeg', category: 'Science' },
                { url: 'Science-centre-Patna-img7.jpeg', category: 'Science' },
                { url: 'Science-centre-Patna-img8.jpeg', category: 'Science' },
                { url: 'Science-centre-Patna-img9.jpeg', category: 'Science' },
                { url: 'Science-centre-Patna-img10.jpeg', category: 'Science' },
                { url: 'Science-centre-Patna-img11.jpeg', category: 'Science' },
                { url: 'Science-centre-Patna-img12.jpeg', category: 'Science' },
                { url: 'Science-centre-Patna-img13.jpeg', category: 'Science' },
                { url: 'Science-centre-Patna-img14.jpeg', category: 'Science' },
                { url: 'Science-centre-Patna-img15.jpeg', category: 'Science' },
                { url: 'Science-centre-Patna-img16.jpeg', category: 'Science' },
                { url: 'Science-centre-Patna-img35.jpeg', category: 'Science' },
            ];
            allImages = [...legacyImages];
        }

        schoolData('gallery')
            .orderBy('createdAt', 'desc')
            .get()
            .then((snap) => {
                snap.forEach((doc) => allImages.push(doc.data()));
                const defaultFilter = filters ? filters.querySelector('.active').getAttribute('data-filter') : 'Sports';
                renderGallery(defaultFilter);

                if (filters) {
                    filters.addEventListener('click', (e) => {
                        if (e.target.tagName === 'BUTTON') {
                            document.querySelectorAll('.filter-btn').forEach((btn) => {
                                btn.style.background = 'transparent';
                                btn.style.color = '#475569';
                                btn.classList.remove('active');
                            });
                            e.target.style.background = '#1E40AF';
                            e.target.style.color = 'white';
                            e.target.classList.add('active');
                            renderGallery(e.target.getAttribute('data-filter'));
                        }
                    });
                }
            })
            .catch(() => renderGallery('Sports'));

        function renderGallery(filter) {
            container.innerHTML = '';
            const filteredImages = allImages.filter((img) => (img.category || 'Others') === filter);
            if (filteredImages.length === 0) {
                container.innerHTML = `<p style="text-align:center; color:#94a3b8; padding:5rem; width:100%;">No images found in this category.</p>`;
                return;
            }
            filteredImages.forEach((d) => {
                const catBadge = d.category ? `<span class="card-category">${d.category}</span>` : '';
                const fname = mediaFilenameFromUrl(d.url);
                if (fname) {
                    container.innerHTML += `
                        <div class="gallery-card" data-img-fname="${fname}" data-img-caption="${d.caption || 'Gallery'}">
                            <img data-snr-media="${fname}" alt="${d.caption || 'Gallery'}" loading="lazy">
                            ${catBadge}
                            <div class="card-overlay">${d.caption ? `<div class="card-caption">${d.caption}</div>` : ''}</div>
                        </div>`;
                } else {
                    const absUrl = ensureAbsoluteUrl(d.url);
                    container.innerHTML += `
                        <div class="gallery-card" onclick="openLightbox({src:'${absUrl}'})">
                            <img src="${absUrl}" alt="${d.caption || 'Gallery'}" loading="lazy">
                            ${catBadge}
                            <div class="card-overlay">${d.caption ? `<div class="card-caption">${d.caption}</div>` : ''}</div>
                        </div>`;
                }
            });
            // Wire lightbox + resolve media after render
            container.querySelectorAll('.gallery-card').forEach((card) => {
                const fname = card.getAttribute('data-img-fname');
                if (fname) {
                    card.addEventListener('click', () => {
                        // Read the now-resolved src from the <img>
                        const img = card.querySelector('img');
                        if (img) openLightbox({ src: img.src });
                    });
                }
            });
            notifyDomChanged();
        }
    }

    // ===================== STAFF (about.html) =====================
    function loadStaff() {
        const section = document.getElementById('staffSection');
        const container = document.getElementById('staffListAdmin');
        if (!container || !section) return;
        schoolData('staff')
            .orderBy('createdAt', 'asc')
            .get()
            .then((snap) => {
                if (snap.empty) return;
                section.style.display = 'block';
                container.innerHTML = '';
                snap.forEach((doc) => {
                    const d = doc.data();
                    const fname = mediaFilenameFromUrl(d.photoUrl);
                    const imgTag = fname
                        ? `<img data-snr-media="${fname}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; margin-bottom:1rem; border:3px solid var(--primary-light);">`
                        : `<img src="${ensureAbsoluteUrl(d.photoUrl || 'default-avatar.png')}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; margin-bottom:1rem; border:3px solid var(--primary-light);">`;
                    container.innerHTML += `<div class="premium-card" style="padding:1.5rem; text-align:center;">
                    ${imgTag}
                    <h3 style="font-size:1.1rem; margin-bottom:0.25rem;">${d.name}</h3>
                    <p style="color:var(--primary); font-weight:600; font-size:0.9rem;">${d.role}</p>
                    ${d.qualifications ? `<p style="font-size:0.8rem; color:var(--text-muted); margin-top:0.5rem;">${d.qualifications}</p>` : ''}
                </div>`;
                });
                notifyDomChanged();
            })
            .catch((e) => handleLoadError('staffListAdmin', e));
    }

    // ===================== HOLIDAYS (academics.html) =====================
    function loadHolidays() {
        const section = document.getElementById('holidaysSection');
        const container = document.getElementById('holidaysListAdmin');
        if (!container || !section) return;
        schoolData('holidays')
            .orderBy('dateStr', 'asc')
            .get()
            .then((snap) => {
                if (snap.empty) return;
                section.style.display = 'block';
                container.innerHTML = '';
                snap.forEach((doc) => {
                    const d = doc.data();
                    container.innerHTML += `<div class="premium-card" style="display:flex; align-items:center; gap:1rem; padding:1.25rem; text-align:left;">
                    <div style="background:var(--primary-light); color:var(--primary); width:50px; height:50px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.5rem;"><i class="fas fa-umbrella-beach"></i></div>
                    <div><h3 style="margin:0; font-size:1rem;">${d.name}</h3><p style="margin:0; font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;">${d.dateStr}</p></div>
                </div>`;
                });
            })
            .catch((e) => handleLoadError('holidaysListAdmin', e));
    }

    // ===================== FEE STRUCTURE (admissions.html) =====================
    function loadFees() {
        const container = document.getElementById('feesListAdmin');
        if (!container) return;
        const classOrder = { 'play-group': 1, nursery: 2, lkg: 3, ukg: 4, 'class-1': 5, 'class-2': 6, 'class-3': 7, 'class-4': 8, 'class-5': 9, 'class-6': 10, 'class-7': 11, 'class-8': 12 };
        
        schoolData('fees')
            .get()
            .then((snap) => {
                if (snap.empty) {
                    container.innerHTML = '<p class="text-center text-muted p-5">Fee structure not updated yet.</p>';
                    return;
                }
                let docs = [];
                snap.forEach((d) => { const data = d.data(); data.id = d.id; docs.push(data); });
                docs.sort((a, b) => (classOrder[a.id] || 99) - (classOrder[b.id] || 99));

                let html = `<table class="fee-table"><thead><tr><th>Class</th><th>Monthly Fee (₹)</th><th>Annual Fee / Misc (₹)</th></tr></thead><tbody>`;
                docs.forEach((d) => {
                    html += `<tr><td style="font-weight:600;">${d.id.replace(/-/g, ' ').toUpperCase()}</td><td>₹${d.monthly || 0}</td><td>₹${d.annual || 0}</td></tr>`;
                });
                html += `</tbody></table>`;
                container.innerHTML = html;
            })
            .catch((e) => handleLoadError('feesListAdmin', e));
    }

    window.openLightbox = window.openLightbox || function (img) { const src = img.src || img; window.open(src, '_blank', 'noopener,noreferrer'); };

    function updateHeaderLoginLinks() {
        const slug = (typeof getURLSlug === 'function') ? getURLSlug() : null;
        if (!slug) return;
        const links = [
            'headerStudentLogin',
            'headerAdminLogin',
            'homeStudentLogin',
            'floatingStudentLogin'
        ];
        links.forEach(function (id) {
            const el = document.getElementById(id);
            if (!el) return;
            if (id === 'headerAdminLogin') {
                el.href = '/' + slug + '/Admin-Login';
            } else {
                el.href = '/' + slug + '/Student-Login';
            }
        });
    }

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', tryApply); } else { tryApply(); }
})();
