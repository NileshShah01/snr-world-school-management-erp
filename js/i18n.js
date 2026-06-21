/* SNR Bilingual (English / Hindi) — minimal v1
 * Adds ?lang=hi URL switch + EN/HI toggle button.
 * Translates:
 *   - elements with [data-i18n="key"]            (text content)
 *   - elements with [data-i18n-attr="attr:key"]   (attribute, e.g. placeholder)
 *   - <title> when [data-i18n-title="key"] is set on <html> or <head>
 *
 * To extend: add a new key in SNR_I18N.en + SNR_I18N.hi and mark elements
 * in the corresponding HTML with data-i18n.
 */
(function () {
    'use strict';

    // ====== DICTIONARY ======
    // Keep keys snake_case and grouped by area (nav.*, hero.*, footer.*, etc).
    // Add new keys here as you mark elements with data-i18n.
    const SNR_I18N = {
        en: {
            'site.title':         'SNR School Portal',
            'site.tagline':       'Modern School Management Platform',

            'nav.home':           'Home',
            'nav.about':          'About',
            'nav.academics':      'Academics',
            'nav.admissions':     'Admissions',
            'nav.facilities':     'Facilities',
            'nav.gallery':        'Gallery',
            'nav.contact':        'Contact',
            'nav.inquiry':        'Inquiry',
            'nav.student':        'Student',
            'nav.admin':          'Admin',
            'nav.title.home':     'Go to Home',
            'nav.title.about':    'Learn more About Us',
            'nav.title.academics':'View Academic Programs',
            'nav.title.admissions':'Admission Information',
            'nav.title.facilities':'Our Facilities',
            'nav.title.gallery':  'View Gallery',
            'nav.title.contact':  'Contact Us',
            'nav.title.inquiry':  'Submit Inquiry',
            'nav.privacy':        'Privacy',
            'nav.title.privacy':  'Privacy Policy',
            'nav.title.student':  'Student/Parent Portal Login',
            'nav.title.admin':    'Administrator Login',

            'lang.switch_to_hi':  'हिन्दी',
            'lang.switch_to_en':  'EN',

            'cta.book_demo':      'Book a Demo',
            'cta.contact_us':     'Contact Us',
            'cta.apply_now':      'Apply Now',
            'cta.learn_more':     'Learn More',
            'cta.view_all':       'View All',
            'cta.submit_inquiry': 'Submit Inquiry',

            'footer.quick_links': 'Quick Links',
            'footer.more_links':  'More Links',
            'footer.contact_info':'Contact Info',
            'footer.find_us':     '📍 Find Us Here',
            'footer.copyright':   '© 2026 SNR. All rights reserved.',

            'contact.title':      'Contact Us',
            'contact.subtitle':   'We would love to hear from you',
            'contact.name':       'Your Name',
            'contact.email':      'Your Email',
            'contact.phone':      'Mobile Number',
            'contact.message':    'Your Message',
            'contact.send':       'Send Message',
            'contact.sent_ok':    '✅ Message sent successfully! We will contact you soon.',
            'contact.err_rate':   '⚠️ Too many submissions. Please wait a minute and try again.',
            'contact.err_mobile': 'Please enter a valid 10-digit mobile number.',
            'contact.err_send':   'Failed to send message. Please try calling us instead.',

            'inquiry.title':      'Admission Inquiry',
            'inquiry.subtitle':   'Tell us about your child and we will reach out within 24 hours.',
            'inquiry.parent_name':'Parent / Guardian Name',
            'inquiry.student_name':'Student Name',
            'inquiry.class_applying':'Class Applying For',
            'inquiry.submit':     'Submit Inquiry',

            'common.loading':     'Loading…',
            'common.required':    'Required',
            'common.optional':    'Optional',
            'common.years_experience':'Years Experience',
            'common.happy_students':'Happy Students',
            'common.schools':     'Schools',
            'common.qualified_teachers':'Qualified Teachers'
        },
        hi: {
            'site.title':         'एसएनआर स्कूल पोर्टल',
            'site.tagline':       'आधुनिक स्कूल प्रबंधन मंच',

            'nav.home':           'मुखपृष्ठ',
            'nav.about':          'परिचय',
            'nav.academics':      'शैक्षणिक',
            'nav.admissions':     'प्रवेश',
            'nav.facilities':     'सुविधाएँ',
            'nav.gallery':        'गैलरी',
            'nav.contact':        'संपर्क',
            'nav.inquiry':        'पूछताछ',
            'nav.privacy':        'गोपनीयता',
            'nav.student':        'विद्यार्थी',
            'nav.admin':          'एडमिन',
            'nav.title.home':     'मुखपृष्ठ पर जाएँ',
            'nav.title.about':    'हमारे बारे में और जानें',
            'nav.title.academics':'शैक्षणिक कार्यक्रम देखें',
            'nav.title.admissions':'प्रवेश जानकारी',
            'nav.title.facilities':'हमारी सुविधाएँ',
            'nav.title.gallery':  'गैलरी देखें',
            'nav.title.contact':  'हमसे संपर्क करें',
            'nav.title.inquiry':  'पूछताछ भेजें',
            'nav.title.privacy':  'गोपनीयता नीति',
            'nav.title.student':  'विद्यार्थी/अभिभावक पोर्टल लॉगिन',
            'nav.title.admin':    'व्यवस्थापक लॉगिन',

            'lang.switch_to_hi':  'हिन्दी',
            'lang.switch_to_en':  'EN',

            'cta.book_demo':      'डेमो बुक करें',
            'cta.contact_us':     'संपर्क करें',
            'cta.apply_now':      'अभी आवेदन करें',
            'cta.learn_more':     'और जानें',
            'cta.view_all':       'सभी देखें',
            'cta.submit_inquiry': 'पूछताछ भेजें',

            'footer.quick_links': 'त्वरित लिंक',
            'footer.more_links':  'अन्य लिंक',
            'footer.contact_info':'संपर्क जानकारी',
            'footer.find_us':     '📍 हमें यहाँ खोजें',
            'footer.copyright':   '© 2026 एसएनआर. सर्वाधिकार सुरक्षित।',

            'contact.title':      'हमसे संपर्क करें',
            'contact.subtitle':   'हम आपसे सुनना चाहेंगे',
            'contact.name':       'आपका नाम',
            'contact.email':      'आपका ईमेल',
            'contact.phone':      'मोबाइल नंबर',
            'contact.message':    'आपका संदेश',
            'contact.send':       'संदेश भेजें',
            'contact.sent_ok':    '✅ संदेश सफलतापूर्वक भेजा गया! हम जल्द ही आपसे संपर्क करेंगे।',
            'contact.err_rate':   '⚠️ बहुत अधिक प्रयास। कृपया एक मिनट प्रतीक्षा करके पुनः प्रयास करें।',
            'contact.err_mobile': 'कृपया एक मान्य 10-अंकीय मोबाइल नंबर दर्ज करें।',
            'contact.err_send':   'संदेश भेजने में विफल। कृपया हमें कॉल करें।',

            'inquiry.title':      'प्रवेश पूछताछ',
            'inquiry.subtitle':   'अपने बच्चे के बारे में बताएँ, हम 24 घंटों के भीतर संपर्क करेंगे।',
            'inquiry.parent_name':'अभिभावक का नाम',
            'inquiry.student_name':'विद्यार्थी का नाम',
            'inquiry.class_applying':'कक्षा जिसके लिए आवेदन',
            'inquiry.submit':     'पूछताछ भेजें',

            'common.loading':     'लोड हो रहा है…',
            'common.required':    'आवश्यक',
            'common.optional':    'वैकल्पिक',
            'common.years_experience':'वर्षों का अनुभव',
            'common.happy_students':'खुश विद्यार्थी',
            'common.schools':     'स्कूल',
            'common.qualified_teachers':'योग्य शिक्षक'
        }
    };

    // ====== STATE ======
    const STORAGE_KEY = 'snr_lang';
    const VALID = ['en', 'hi'];
    const DEFAULT_LANG = 'en';

    function detectInitialLang() {
        // 1) Explicit ?lang=xx
        try {
            const params = new URLSearchParams(window.location.search);
            const q = (params.get('lang') || '').toLowerCase();
            if (VALID.indexOf(q) > -1) {
                try { localStorage.setItem(STORAGE_KEY, q); } catch (e) {}
                return q;
            }
        } catch (e) { /* IE no URLSearchParams */ }
        // 2) Stored preference
        try {
            const stored = (localStorage.getItem(STORAGE_KEY) || '').toLowerCase();
            if (VALID.indexOf(stored) > -1) return stored;
        } catch (e) {}
        // 3) Browser language
        const browser = (navigator.language || navigator.userLanguage || '').toLowerCase();
        if (browser.indexOf('hi') === 0) return 'hi';
        return DEFAULT_LANG;
    }

    let currentLang = detectInitialLang();

    // ====== TRANSLATION ENGINE ======
    function translateElement(el) {
        const key = el.getAttribute('data-i18n');
        if (!key) return;
        const txt = lookup(key, currentLang);
        if (txt != null) el.textContent = txt;
    }

    function translateAttribute(el) {
        const spec = el.getAttribute('data-i18n-attr');
        if (!spec) return;
        // Format: "attr:key" (one) or "attr1:key1|attr2:key2" (multiple)
        spec.split('|').forEach(function (pair) {
            const idx = pair.indexOf(':');
            if (idx < 1) return;
            const attr = pair.substring(0, idx).trim();
            const key = pair.substring(idx + 1).trim();
            const txt = lookup(key, currentLang);
            if (txt != null) el.setAttribute(attr, txt);
        });
    }

    function lookup(key, lang) {
        if (SNR_I18N[lang] && SNR_I18N[lang][key] != null) return SNR_I18N[lang][key];
        if (SNR_I18N[DEFAULT_LANG][key] != null) return SNR_I18N[DEFAULT_LANG][key];
        return null; // missing key — don't clobber content
    }

    function translateDocument() {
        // <html lang=...>
        document.documentElement.setAttribute('lang', currentLang);
        // <title> via [data-i18n-title] on <html> or <head>
        const titleEl = document.querySelector('[data-i18n-title]');
        if (titleEl) {
            const t = lookup(titleEl.getAttribute('data-i18n-title'), currentLang);
            if (t != null) document.title = t;
        }
        // text nodes
        const textEls = document.querySelectorAll('[data-i18n]');
        for (let i = 0; i < textEls.length; i++) translateElement(textEls[i]);
        // attributes
        const attrEls = document.querySelectorAll('[data-i18n-attr]');
        for (let i = 0; i < attrEls.length; i++) translateAttribute(attrEls[i]);
    }

    // ====== SWITCHER UI ======
    // Injects a small EN/हिन्दी toggle into the existing header. If the page
    // already has a [data-i18n-toggle] placeholder, the toggle is rendered there;
    // otherwise it is appended to the header (or body if no header).
    function injectSwitcher() {
        // Use a placeholder if present, else header > div.header-buttons, else body
        let mount = document.querySelector('[data-i18n-toggle]');
        if (!mount) {
            const btnBox = document.querySelector('.header-buttons');
            if (btnBox) {
                mount = document.createElement('div');
                mount.className = 'lang-switcher';
                btnBox.parentNode.insertBefore(mount, btnBox);
            } else {
                mount = document.body;
            }
        }
        if (mount.dataset.i18nInjected === '1') return;
        mount.dataset.i18nInjected = '1';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'lang-switcher-btn';
        btn.setAttribute('aria-label', 'Toggle language');
        mount.appendChild(btn);
        btn.addEventListener('click', toggleLang);
        renderSwitcher(btn);
    }

    function renderSwitcher(btn) {
        btn.textContent = currentLang === 'en' ? 'हिन्दी' : 'EN';
    }

    function toggleLang() {
        currentLang = currentLang === 'en' ? 'hi' : 'en';
        try { localStorage.setItem(STORAGE_KEY, currentLang); } catch (e) {}
        // Reflect in URL (replaceState — does not push history entry)
        try {
            const url = new URL(window.location.href);
            url.searchParams.set('lang', currentLang);
            window.history.replaceState({}, '', url);
        } catch (e) { /* old browsers */ }
        translateDocument();
        // Re-render the toggle button itself
        const btn = document.querySelector('.lang-switcher-btn');
        if (btn) renderSwitcher(btn);
        // Notify other scripts (e.g. CMS dynamic content)
        document.dispatchEvent(new CustomEvent('snr:i18n:changed', { detail: { lang: currentLang } }));
    }

    // ====== EXPOSE ======
    // Public API for other scripts (e.g. cms-settings.js, contact form) to
    // get the current language or translate a key on demand.
    window.SNR_I18N = window.SNR_I18N || {};
    window.SNR_I18N.t = function (key, fallback) {
        const v = lookup(key, currentLang);
        return v != null ? v : (fallback != null ? fallback : key);
    };
    window.SNR_I18N.lang = function () { return currentLang; };
    window.SNR_I18N.translate = translateDocument;

    // ====== BOOTSTRAP ======
    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        translateDocument();
        injectSwitcher();
    });
})();
