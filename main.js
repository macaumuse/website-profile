(function() {
    'use strict';

    const config = {
        networkTimeout: 10000,
        retryAttempts: 3,
        retryDelay: 1000,
        translationsCacheKey: 'translations_cache_v7',
        translationsCacheExpiry: 7 * 24 * 60 * 60 * 1000,
        defaultLang: 'en-US',
        rtlLanguages: ['ar-SA', 'he-IL']
    };

    const state = {
        translations: {},
        currentLang: config.defaultLang,
        isInitialized: false,
        componentsLoaded: false,
        scrollDebounceTimer: null
    };

    const languages = {
        'en-US': 'English',
        'zh-CN': '简体中文',
        'zh-TW': '繁體中文',
        'ja-JP': '日本語',
        'ko-KR': '한국어',
        'ru-RU': 'Русский',
        'ar-SA': 'العربية',
        'he-IL': 'עברית',
        'vi-VN': 'Tiếng Việt',
        'th-TH': 'ภาษาไทย',
        'de-DE': 'Deutsch',
        'fr-FR': 'Français',
        'es-ES': 'Español',
        'it-IT': 'Italiano'
    };

    const sharedComponents = {
        header: `
        <a class="skip-link" href="#main-content" data-i18n="layout.skip">Skip to content</a>
        <header class="site-header w-full px-6 py-4 border-b border-gray-300 dark:border-gray-700">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <p class="site-name text-3xl font-bold text-primary-dark dark:text-gray-100 mb-1">
                        <a href="index.html" class="hover:underline">Zigan Wang</a>
                    </p>
                    <p class="text-gray-700 dark:text-gray-300" data-i18n="title" data-region-profile="zju" hidden>Professor, Zhejiang University</p>
                    <p class="text-gray-700 dark:text-gray-300" data-i18n="layout.profile" data-region-fallback="zju">Academic Profile</p>
                </div>
                <nav aria-label="Main navigation" class="flex flex-wrap items-center gap-2 text-sm">
                    <a href="index.html" class="text-primary dark:text-blue-400 hover:underline font-medium" data-i18n="nav.home">Home</a>
                    <span class="text-gray-400">|</span>
                    <a href="pub.html" class="text-primary dark:text-blue-400 hover:underline font-medium" data-i18n="nav.publications">Publications</a>
                    <span class="text-gray-400">|</span>
                    <a href="teaching.html" class="text-primary dark:text-blue-400 hover:underline font-medium" data-i18n="nav.teaching">Teaching</a>
                    <!-- Research link hidden per request; restore by uncommenting the two lines below
                    <span class="text-gray-400">|</span>
                    <a href="/research/assetbubble" class="text-primary dark:text-blue-400 hover:underline font-medium" data-i18n="nav.research">Research</a>
                    -->
                    <span class="text-gray-400">|</span>
                    <a href="slides.html" class="text-primary dark:text-blue-400 hover:underline font-medium" data-i18n="nav.slides">Slides</a>
                    <span class="text-gray-400">|</span>
                    <div class="site-preferences">
                    <select id="langSelect" aria-label="Language selection" class="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 focus:border-transparent">
                        ${Object.entries(languages).map(([code, name]) => `<option value="${code}">${name}</option>`).join('')}
                    </select>
                    <span class="text-gray-400">|</span>
                    <div class="theme-toggle inline-flex bg-gray-200 dark:bg-gray-600 rounded-full p-0.5">
                        <button data-theme="light" title="Light theme" aria-label="Switch to light theme" class="p-1.5 rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"></path>
                            </svg>
                        </button>
                        <button data-theme="dark" title="Dark theme" aria-label="Switch to dark theme" class="p-1.5 rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                            </svg>
                        </button>
                    </div>
                    </div>
                </nav>
            </div>
        </header>`,

        sidebar: `
        <aside class="site-sidebar w-full md:w-80 lg:w-96 bg-gray-50 dark:bg-gray-800 p-6 md:border-r border-gray-300 dark:border-gray-700">
            <div class="sidebar-sticky">
            <button type="button" class="profile-photo" aria-label="Show alternate portrait" aria-pressed="false"><img src="assets/avatar-restored.webp" alt="Zigan Wang" class="w-48 h-48 mx-auto mb-6 rounded-lg shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300 object-cover avatar-image" loading="eager" fetchpriority="high" width="192" height="192" data-original="assets/avatar-restored.webp" data-hover="assets/smile-restored.webp"></button>
            <div class="space-y-4">
                <div id="contact-emails" class="space-y-2">
                    <a href="mailto:wangzigan@zju.edu.cn" class="contact-email text-primary dark:text-blue-400 hover:underline flex items-center text-sm">
                        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                        </svg>
                        <span class="contact-email-text">wangzigan@zju.edu.cn</span>
                    </a>
                <ul class="sidebar-links">
                    <li><span class="sidebar-links-label">ORCID</span><a href="https://orcid.org/0000-0002-1311-1493" target="_blank" rel="noopener" data-label="ORCID" aria-label="ORCID"><span class="profile-id">0000-0002-1311-1493</span></a></li>
                    <li><span class="sidebar-links-label">Google Scholar</span><a href="https://scholar.google.com/citations?user=BiX-nnEAAAAJ" target="_blank" rel="noopener" data-label="Google Scholar" aria-label="Google Scholar"><span class="profile-id">BiX-nnEAAAAJ</span></a></li>
                    <li><span class="sidebar-links-label">SSRN</span><a href="https://papers.ssrn.com/sol3/cf_dev/AbsByAuth.cfm?per_id=2196855" target="_blank" rel="noopener" data-label="SSRN" aria-label="SSRN"><span class="profile-id">2196855</span></a></li>
                    <li><span class="sidebar-links-label">DBLP</span><a href="https://dblp.org/pid/278/3865.html" target="_blank" rel="noopener" data-label="DBLP" aria-label="DBLP"><span class="profile-id">278/3865</span></a></li>
                </ul>
            </div>
            </div>
            </div>
        </aside>`,

        footer: `
        <footer class="site-footer bg-gray-50 dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700 mt-auto">
            <div class="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                © ${new Date().getFullYear()} Zigan Wang. All rights reserved.
            </div>
        </footer>`,

        backToTopButton: `
        <button id="backToTop" class="fixed bottom-8 right-8 p-3 rounded-full shadow-lg hidden bg-primary dark:bg-blue-600 text-white hover:bg-primary-dark dark:hover:bg-blue-700 hover:scale-105 transition-all duration-200 z-50" aria-label="Back to top">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd"></path>
            </svg>
        </button>`
    };

    async function fetchWithRetry(url, options = {}, retries = config.retryAttempts) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.networkTimeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (!response.ok && retries > 0) {
                await sleep(config.retryDelay);
                return fetchWithRetry(url, options, retries - 1);
            }
            
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (retries > 0 && (error.name === 'AbortError' || error.name === 'TypeError')) {
                await sleep(config.retryDelay);
                return fetchWithRetry(url, options, retries - 1);
            }
            
            throw error;
        }
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function getCachedTranslations() {
        try {
            const cached = localStorage.getItem(config.translationsCacheKey);
            if (!cached) return null;
            
            const { data, timestamp } = JSON.parse(cached);
            const now = Date.now();
            
            if (now - timestamp > config.translationsCacheExpiry) {
                localStorage.removeItem(config.translationsCacheKey);
                return null;
            }
            
            return data;
        } catch (e) {
            return null;
        }
    }

    function setCachedTranslations(data) {
        try {
            localStorage.setItem(config.translationsCacheKey, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.warn('Failed to cache translations:', e);
        }
    }

    async function loadTranslation(lang) {
        try {
            const response = await fetchWithRetry(`i18n/${lang}.json?v=20260914e`);
            if (!response.ok) throw new Error(`Failed to load ${lang} translations`);
            return await response.json();
        } catch (error) {
            console.error(`Error loading translation for ${lang}:`, error);
            return null;
        }
    }

    async function initializeTranslations() {
        if (state.isInitialized) return;
        
        const storedLang = sessionStorage.getItem('language') || config.defaultLang;
        state.currentLang = storedLang;
        
        const cachedTranslations = getCachedTranslations();
        if (cachedTranslations) {
            state.translations = cachedTranslations;
            state.isInitialized = true;
            updateLanguage(state.currentLang);
            
            loadAllTranslationsInBackground();
            return;
        }
        
        const primaryTranslation = await loadTranslation(state.currentLang);
        if (primaryTranslation) {
            state.translations[state.currentLang] = primaryTranslation;
        }
        
        const englishTranslation = state.currentLang !== 'en-US' ? await loadTranslation('en-US') : null;
        if (englishTranslation) {
            state.translations['en-US'] = englishTranslation;
        }
        
        if (Object.keys(state.translations).length > 0) {
            state.isInitialized = true;
            updateLanguage(state.currentLang);
            loadAllTranslationsInBackground();
        }
    }

    async function loadAllTranslationsInBackground() {
        const languagesToLoad = Object.keys(languages).filter(lang => !state.translations[lang]);
        
        for (const lang of languagesToLoad) {
            const translation = await loadTranslation(lang);
            if (translation) {
                state.translations[lang] = translation;
            }
        }
        
        if (Object.keys(state.translations).length === Object.keys(languages).length) {
            setCachedTranslations(state.translations);
        }
    }

    function updateLanguage(lang) {
        if (!state.translations[lang]) {
            if (state.translations['en-US']) {
                lang = 'en-US';
            } else {
                console.error(`Translation not available for ${lang}`);
                return;
            }
        }
        
        state.currentLang = lang;
        sessionStorage.setItem('language', lang);
        document.documentElement.lang = lang;
        
        if (config.rtlLanguages.includes(lang)) {
            document.documentElement.dir = 'rtl';
            document.body.classList.add('rtl');
        } else {
            document.documentElement.dir = 'ltr';
            document.body.classList.remove('rtl');
        }
        
        const langSelect = document.getElementById('langSelect');
        if (langSelect && langSelect.value !== lang) {
            langSelect.value = lang;
        }
        
        requestAnimationFrame(() => {
            updateTranslations();
        });
    }

    function updateTranslations() {
        renderRegionContent();
        const elements = document.querySelectorAll('[data-i18n]');
        const translations = state.translations[state.currentLang];
        
        if (!translations) return;
        
        for (const element of elements) {
            const keys = element.getAttribute('data-i18n').split('.');
            let value = translations;
            
            for (const key of keys) {
                if (value && value[key]) {
                    value = value[key];
                } else {
                    value = null;
                    break;
                }
            }
            
            if (typeof value === 'string' && element.textContent !== value) {
                element.textContent = value;
            }
        }
        formatCourses();
    }

    function formatCourses() {
        document.querySelectorAll('.course-list > li').forEach(item => {
            const text = item.textContent;
            const match = text.match(/[,，]\s*/);
            if (!match) return;
            const title = createNode('span', 'course-title', text.slice(0, match.index));
            const meta = createNode('span', 'course-meta', text.slice(match.index + match[0].length));
            item.replaceChildren(title, createNode('span', 'course-separator', match[0]), meta);
        });
    }

    function loadComponents() {
        if (state.componentsLoaded) return;
        
        const componentMap = {
            'header': sharedComponents.header,
            'sidebar': sharedComponents.sidebar,
            'footer': sharedComponents.footer,
            'back-to-top': sharedComponents.backToTopButton
        };
        
        for (const [id, html] of Object.entries(componentMap)) {
            const element = document.getElementById(id);
            if (element && !element.innerHTML.trim()) {
                element.innerHTML = html;
            }
        }
        
        const currentPage = location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.site-header nav > a').forEach(link => {
            if (link.getAttribute('href') === currentPage) link.setAttribute('aria-current', 'page');
        });
        state.componentsLoaded = true;
        
        requestAnimationFrame(() => {
            setupEventListeners();
            if (state.isInitialized) {
                updateTranslations();
            }
        });
    }

    function setupEventListeners() {
        const langSelect = document.getElementById('langSelect');
        if (langSelect && !langSelect.dataset.initialized) {
            langSelect.addEventListener('change', (e) => {
                changeLanguage(e.target.value);
            });
            langSelect.dataset.initialized = 'true';
        }
        
        const themeButtons = document.querySelectorAll('.theme-toggle button');
        themeButtons.forEach(btn => {
            if (!btn.dataset.initialized) {
                btn.addEventListener('click', () => {
                    setTheme(btn.dataset.theme);
                });
                btn.dataset.initialized = 'true';
            }
        });
        
        const avatarImage = document.querySelector('.avatar-image');
        const photoButton = document.querySelector('.profile-photo');
        if (avatarImage && photoButton && !avatarImage.dataset.initialized) {
            const originalSrc = avatarImage.dataset.original;
            const hoverSrc = avatarImage.dataset.hover;
            let selected = false;
            const alternate = new Image();
            alternate.src = hoverSrc;
            photoButton.addEventListener('pointerenter', e => {
                if (e.pointerType === 'mouse') avatarImage.src = hoverSrc;
            });
            photoButton.addEventListener('pointerleave', () => {
                avatarImage.src = selected ? hoverSrc : originalSrc;
            });
            photoButton.addEventListener('click', () => {
                selected = !selected;
                photoButton.setAttribute('aria-pressed', String(selected));
                avatarImage.src = selected ? hoverSrc : originalSrc;
            });
            avatarImage.dataset.initialized = 'true';
        }
    }

    async function changeLanguage(lang) {
        if (!state.translations[lang]) {
            const translation = await loadTranslation(lang);
            if (translation) {
                state.translations[lang] = translation;
            }
        }
        updateLanguage(lang);
    }

    function initTheme() {
        const savedTheme = sessionStorage.getItem('theme') || localStorage.getItem('theme');
        
        if (savedTheme) {
            applyTheme(savedTheme);
        } else {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const defaultTheme = systemPrefersDark ? 'dark' : 'light';
            setTheme(defaultTheme);
        }
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeToggle(theme);
    }

    function setTheme(theme) {
        sessionStorage.setItem('theme', theme);
        localStorage.setItem('theme', theme);
        applyTheme(theme);
    }

    function updateThemeToggle(theme) {
        requestAnimationFrame(() => {
            document.querySelectorAll('.theme-toggle button').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === theme);
                btn.setAttribute('aria-pressed', String(btn.dataset.theme === theme));
            });
        });
    }

    function initBackToTop() {
        const backToTopButton = document.getElementById('backToTop');
        if (!backToTopButton) return;
        
        let isVisible = false;
        
        function handleScroll() {
            if (state.scrollDebounceTimer) {
                clearTimeout(state.scrollDebounceTimer);
            }
            
            state.scrollDebounceTimer = setTimeout(() => {
                const shouldShow = window.pageYOffset > 100;
                
                if (shouldShow !== isVisible) {
                    isVisible = shouldShow;
                    backToTopButton.classList.toggle('hidden', !shouldShow);
                }
            }, 100);
        }
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        });
    }

    // ---------- Region-specific profile content ----------
    // Some profile details are shown only to visitors outside mainland China, Hong Kong,
    // Macau and Taiwan, and are fetched from assets/intl.json only for those visitors.
    // The visitor's country comes from Cloudflare's /cdn-cgi/trace on this domain;
    // The ZJU appointment is hidden for AU and while the country is unknown.
    // These rules control presentation, not access to the public static assets.
    const region = {
        baseOnlyCountries: ['CN', 'HK', 'MO', 'TW'],
        data: null,
        country: null,
        requestId: 0
    };

    async function detectCountry() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        try {
            const response = await fetch('/cdn-cgi/trace', { cache: 'no-store', signal: controller.signal });
            if (!response.ok) return null;
            const match = (await response.text()).match(/^loc=([A-Z]{2})$/m);
            if (!match) return null;
            return match[1];
        } catch (error) {
            return null;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    function renderRegionProfile() {
        const showZju = Boolean(region.country) && region.country !== 'AU';
        document.querySelectorAll('[data-region-profile="zju"]').forEach(node => {
            node.hidden = !showZju;
        });
        document.querySelectorAll('[data-region-fallback="zju"]').forEach(node => {
            node.hidden = showZju;
        });
    }

    function resetRegionContent() {
        region.requestId += 1;
        region.country = null;
        region.data = null;
        document.querySelectorAll('[data-region="email"]').forEach(node => node.remove());
        const slot = document.querySelector('[data-region-slot="employment"]');
        if (slot) { slot.hidden = true; slot.textContent = ''; }
        renderRegionProfile();
        return region.requestId;
    }

    async function initRegionContent() {
        // Recheck the current connection; an earlier visit's country can be stale.
        const requestId = resetRegionContent();
        const country = await detectCountry();
        if (requestId !== region.requestId) return;
        if (!country || country === 'XX' || country === 'T1') return;
        region.country = country;
        renderRegionProfile();
        if (region.baseOnlyCountries.includes(country)) return;
        try {
            const response = await fetch('assets/intl.json?v=20260914e', { cache: 'no-cache' });
            if (!response.ok) return;
            const data = await response.json();
            if (requestId !== region.requestId) return;
            region.data = data;
            renderRegionContent();
        } catch (error) {
            console.warn('Region content unavailable:', error);
        }
    }

    function createNode(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function renderRegionContent() {
        renderRegionProfile();
        const data = region.data;
        if (!data) return;

        const emailList = document.getElementById('contact-emails');
        const baseEmail = emailList && emailList.querySelector('.contact-email');
        if (baseEmail && data.email && !emailList.querySelector('[data-region="email"]')) {
            const link = baseEmail.cloneNode(true);
            link.href = 'mailto:' + data.email;
            link.setAttribute('data-region', 'email');
            link.querySelector('.contact-email-text').textContent = data.email;
            emailList.insertBefore(link, baseEmail);
        }

        const slot = document.querySelector('[data-region-slot="employment"]');
        const extra = data.employment;
        if (slot && extra) {
            const strings = extra.i18n[state.currentLang] || extra.i18n['en-US'];
            slot.textContent = '';
            slot.appendChild(createNode('div', 'emp-org', strings.name));
            extra.roles.forEach(role => {
                const row = createNode('div', 'emp-row');
                row.appendChild(createNode('span', 'emp-years', role.years));
                const details = createNode('div');
                details.appendChild(createNode('div', 'emp-role', strings[role.key]));
                details.appendChild(createNode('div', 'emp-unit', strings[role.key + '_unit']));
                row.appendChild(details);
                slot.appendChild(row);
            });
            slot.hidden = false;
        }
    }

    function init() {
        initTheme();
        loadComponents();
        initRegionContent();
        initializeTranslations();
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initBackToTop);
        } else {
            initBackToTop();
        }
    }

    init();

    window.addEventListener('pageshow', event => {
        if (event.persisted) initRegionContent();
    });
    // Do not retain a previous connection's appointments in the back/forward cache.
    window.addEventListener('pagehide', resetRegionContent);

    window.changeLanguage = changeLanguage;
    window.setTheme = setTheme;
})();
