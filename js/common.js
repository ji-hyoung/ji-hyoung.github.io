(() => {
    // Main initializer that uses separated modules (utils, themeManager, particleEngine, sliderManager)
    const { qs, qsa, safeGet } = window.AppUtils || {
        qs: (s) => document.querySelector(s),
        qsa: (s) => Array.from(document.querySelectorAll(s)),
        safeGet: (id) => document.getElementById(id),
    };
    const reduceMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    const prefersReducedMotion = () => Boolean(reduceMotionQuery && reduceMotionQuery.matches);

    document.addEventListener('DOMContentLoaded', () => {
        const contentManager = window.ContentManager;
        const contentReady = contentManager ? contentManager.loadContent() : Promise.resolve(null);

        // Theme
        const themeToggle = safeGet('themeToggle');
        const headerThemeBtns = qsa('.change_list button');
        const ThemeManagerClass = window.ThemeManager;
        const themeManager = ThemeManagerClass
            ? new ThemeManagerClass({ toggleBtn: themeToggle, selectorBtns: headerThemeBtns })
            : null;
        if (themeManager) themeManager.init();

        // Particle engine
        const ParticleClass = window.ParticleTrailEngine;
        const engine = ParticleClass
            ? new ParticleClass({ aboutSelector: '.about_skills', trailCanvasId: 'trailCanvas', particleCanvasId: 'particleCanvas', numParticles: 80 })
            : null;

        // Intersection observer: 보일 때만 애니메이션 실행
        if (engine) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (prefersReducedMotion()) {
                        engine.stop();
                        return;
                    }
                    if (entry.isIntersecting) engine.start(() => (themeManager ? themeManager.theme : 'dark'));
                    else engine.stop();
                });
            }, { threshold: 0.1 });

            const aboutSection = qs('.about_skills');
            if (aboutSection) observer.observe(aboutSection);

            if (reduceMotionQuery) {
                reduceMotionQuery.addEventListener('change', (event) => {
                    if (event.matches) {
                        engine.stop();
                    }
                });
            }
        }

        const initAOS = () => {
            if (prefersReducedMotion()) {
                document.documentElement.classList.add('aos-disabled');
                return;
            }
            AOS.init({
                disable: false,
                startEvent: 'DOMContentLoaded',
                initClassName: 'aos-init',
                animatedClassName: 'aos-animate',
                useClassNames: false,
                disableMutationObserver: false,
                debounceDelay: 50,
                throttleDelay: 99,
                offset: 150,
                delay: 0,
                duration: 1000,
                easing: 'ease',
                once: false,
                mirror: false,
                anchorPlacement: 'top-bottom',
            });
        };

        contentReady
            .catch((error) => console.error('Content loading failed:', error))
            .finally(() => {
                // Sliders
                const SliderClass = window.SliderManager;
                if (SliderClass) {
                    const sliders = new SliderClass();
                    sliders.initMainVisual && sliders.initMainVisual();
                    sliders.initMainGalleryOnLoad && sliders.initMainGalleryOnLoad();
                }

                initAOS();
                if (window.AOS && typeof window.AOS.refreshHard === 'function') {
                    window.AOS.refreshHard();
                }
            });

        const header = qs('#header');
        const getHeaderHeight = () => (header ? header.offsetHeight : 0);
        const scrollTargets = qsa('[data-scroll-target]');
        scrollTargets.forEach((trigger) => {
            trigger.addEventListener('click', (event) => {
                const href = trigger.getAttribute('href');
                if (!href || !href.startsWith('#')) return;
                const targetEl = document.querySelector(href);
                if (!targetEl) return;
                event.preventDefault();
                const top = targetEl.getBoundingClientRect().top + window.pageYOffset - getHeaderHeight();
                window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
                const previousTabIndex = targetEl.getAttribute('tabindex');
                targetEl.setAttribute('tabindex', '-1');
                targetEl.focus({ preventScroll: true });
                const removeTabIndex = () => {
                    targetEl.removeEventListener('blur', removeTabIndex);
                    if (previousTabIndex === null) {
                        targetEl.removeAttribute('tabindex');
                    } else {
                        targetEl.setAttribute('tabindex', previousTabIndex);
                    }
                };
                targetEl.addEventListener('blur', removeTabIndex);
            });
        });

        // layer open/close (global)
        window.layerOpen = function (url) {
            var bg = '<div class="layerBg"></div>';
            var frame = '<iframe class="layerFrame" src="' + url + '" frameborder="0" scrolling="no" allowtransparency="true"></iframe>';
            var wrap = '<div class="layerWrap">' + bg + frame + '</div>';
            $('body').append(wrap);
            $('.layerWrap').addClass('on');
            $('html').addClass('layerOn');
        };

        window.layerClose = function () {
            $('.layerWrap').remove();
            $('html').removeClass('layerOn');
        };

        // clock (global)
        window.updateClock = function () {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const el = document.getElementById('clock');
            if (el) el.textContent = `${hours}:${minutes}:${seconds}`;
        };
        setInterval(window.updateClock, 1000);
        window.updateClock();
    });
})();