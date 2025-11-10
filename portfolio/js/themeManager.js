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
                    const t = btn.classList.contains('light') ? 'light' : 'dark';
                    this.setTheme(t);
                });
            });
        }

        _restore() {
            const saved = localStorage.getItem(lsKey);
            if (saved) {
                this.setTheme(saved, false);
                return;
            }
            const hasLightOn = qs('.change_list a.light.on');
            this.setTheme(hasLightOn ? 'light' : 'dark', false);
        }

        setTheme(theme, persist = true) {
            this.theme = theme;
            document.body.dataset.theme = theme;

            if (this.toggleBtn) this.toggleBtn.textContent = theme === 'dark' ? 'Light' : 'Dark';

            if (this.selectorBtns && this.selectorBtns.length) {
                this.selectorBtns.forEach((btn) => {
                    if (btn.classList.contains('light')) btn.classList.toggle('on', theme === 'light');
                    if (btn.classList.contains('dark')) btn.classList.toggle('on', theme === 'dark');
                });
            }

            if (persist) localStorage.setItem(lsKey, theme);
        }

        toggle() {
            this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
        }
    }

    window.ThemeManager = ThemeManager;
})();
