/**
 * Dynamic Section Module Loader
 * Loads dashboard section HTML + JS on-demand from sub-folder files.
 * Usage: window.loadSectionModule('students/student-list')
 */

window.SECTION_MODULES = {};
window.MODULE_BASE = '/portal/dashboard';

window.loadSectionModule = async function (modulePath, sectionId) {
    const cacheKey = modulePath;
    if (window.SECTION_MODULES[cacheKey]) return;

    const container = document.getElementById('dynamicSectionContainer');
    if (!container) return;

    // Show skeleton placeholder while loading
    const skelId = 'skel_' + (sectionId || modulePath.replace('/', '_'));
    var skelHtml = '';
    if (typeof window.showSkeleton === 'function') {
        var skelDiv = document.createElement('div');
        skelDiv.id = skelId;
        container.appendChild(skelDiv);
        window.showSkeleton(skelDiv, 4, 'card');
    } else {
        skelHtml = '<div id="' + skelId + '" class="p-3"><div class="skeleton-card" style="padding:1.25rem;background:var(--skeleton-bg,#334155);border-radius:0.75rem;animation:skeleton-loading 1.5s infinite;margin-bottom:0.75rem;"><div class="skeleton-text" style="height:14px;width:50%;background:var(--skeleton-highlight,#475569);border-radius:6px;margin-bottom:10px;"></div><div class="skeleton-text-sm" style="height:10px;width:80%;background:var(--skeleton-highlight,#475569);border-radius:4px;"></div></div>'.repeat(4) + '</div>';
        container.insertAdjacentHTML('beforeend', skelHtml);
    }

    try {
        const htmlResp = await fetch(window.MODULE_BASE + '/' + modulePath + '.html');
        if (!htmlResp.ok) throw new Error('HTTP ' + htmlResp.status);
        const html = await htmlResp.text();

        // Remove skeleton
        var skel = document.getElementById(skelId);
        if (skel && skel.parentNode) skel.parentNode.removeChild(skel);

        const sectionEl = document.createElement('section');
        sectionEl.id = sectionId || (modulePath.replace('/', '-') + 'Section');
        sectionEl.className = 'dashboard-section hidden';
        sectionEl.innerHTML = html;
        container.appendChild(sectionEl);

        const script = document.createElement('script');
        script.src = window.MODULE_BASE + '/' + modulePath + '.js';
        script.onload = function () {
            window.SECTION_MODULES[cacheKey] = true;
            if (window['onModuleLoaded_' + cacheKey.replace('/', '_')]) {
                window['onModuleLoaded_' + cacheKey.replace('/', '_')]();
            }
            var pendingId = sessionStorage.getItem('_pendingModuleSection');
            if (pendingId && sectionId && sectionId.replace('Section', '') === pendingId) {
                sessionStorage.removeItem('_pendingModuleSection');
                window.showSection(pendingId, true);
            }
        };
        script.onerror = function () {
            console.error('[Module] Failed to load JS: ' + modulePath + '.js');
            sectionEl.innerHTML = '<div class="p-4 text-center text-danger"><i class="fas fa-exclamation-triangle" style="font-size:2rem;display:block;margin-bottom:0.5rem;"></i>Failed to load section. <button onclick="location.reload()" class="btn-portal btn-ghost" style="margin-top:0.5rem;">Reload</button></div>';
        };
        document.body.appendChild(script);
    } catch (e) {
        console.error('[Module] Failed to load section module: ' + modulePath, e);
        var skel2 = document.getElementById(skelId);
        if (skel2) skel2.outerHTML = '<div class="p-4 text-center text-danger"><i class="fas fa-exclamation-triangle" style="font-size:2rem;display:block;margin-bottom:0.5rem;"></i>Error loading section: ' + modulePath + '. <button onclick="location.reload()" class="btn-portal btn-ghost" style="margin-top:0.5rem;">Reload</button></div>';
    }
};

window.preloadSectionModule = function (modulePath, sectionId) {
    if (window.SECTION_MODULES[modulePath]) return;
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = `${window.MODULE_BASE}/${modulePath}.html`;
    document.head.appendChild(link);
};
