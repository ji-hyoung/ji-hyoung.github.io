(function () {
    const { qs, qsa, safeGet, lsKey } = window.AppUtils;

    // function toggleClassOnAnchorList(list, cls) {
    //     (list || []).forEach((el) => el.classList.remove(cls));
    // }

    class ThemeManager {
        constructor({ toggleBtn = null, selectorBtns = [] } = {}) {
            this.toggleBtn = toggleBtn;
            this.selectorBtns = selectorBtns;
            this.theme = 'dark';
            this.userDefined = false;
        }

        init() {
            this._bindToggle();
            this._bindSelectorBtns();
            this._restore();
        }

        _bindToggle() {
            if (!this.toggleBtn) return;
            this.toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggle();
            });
        }

        _bindSelectorBtns() {
            if (!this.selectorBtns || !this.selectorBtns.length) return;
            this.selectorBtns.forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const t = btn.dataset.themeValue || (btn.classList.contains('light') ? 'light' : 'dark');
                    this.setTheme(t);
                });
            });
        }

        _restore() {
            let saved = null;
            try {
                saved = localStorage.getItem(lsKey);
            } catch (e) { /* ignore storage errors */ }
            if (saved) {
                this.userDefined = true;
                this.setTheme(saved, false);
                return;
            }

            let defaultTheme = 'dark';
            const activeBtn = (this.selectorBtns || []).find((btn) => btn.classList.contains('on'));
            if (activeBtn && activeBtn.dataset.themeValue) {
                defaultTheme = activeBtn.dataset.themeValue;
            } else if (window.matchMedia) {
                const mq = window.matchMedia('(prefers-color-scheme: light)');
                if (mq.matches) {
                    defaultTheme = 'light';
                }
                const listener = (event) => {
                    if (!this.userDefined) {
                        this.setTheme(event.matches ? 'light' : 'dark', false);
                    }
                };
                if (mq.addEventListener) {
                    mq.addEventListener('change', listener);
                } else if (mq.addListener) {
                    mq.addListener(listener);
                }
            }
            this.setTheme(defaultTheme, false);
        }

        setTheme(theme, persist = true) {
            this.theme = theme;
            document.body.dataset.theme = theme;
            document.documentElement.dataset.theme = theme;

            if (this.toggleBtn) this.toggleBtn.textContent = theme === 'dark' ? 'Light' : 'Dark';

            if (this.selectorBtns && this.selectorBtns.length) {
                this.selectorBtns.forEach((btn) => {
                    const targetTheme = btn.dataset.themeValue || (btn.classList.contains('light') ? 'light' : 'dark');
                    const isActive = targetTheme === theme;
                    btn.classList.toggle('on', isActive);
                    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
                });
            }

            if (persist) {
                try {
                    localStorage.setItem(lsKey, theme);
                    this.userDefined = true;
                } catch (e) { /* ignore storage errors */ }
            }
        }

        toggle() {
            this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
        }
    }

    window.ThemeManager = ThemeManager;
})();
