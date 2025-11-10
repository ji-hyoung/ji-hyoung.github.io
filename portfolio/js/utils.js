(function () {
    // 브라우저 전역에서 사용할 유틸
    window.AppUtils = {
        lsKey: 'site-theme',
        qs: function (sel, ctx) { return (ctx || document).querySelector(sel); },
        qsa: function (sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); },
        safeGet: function (id) { return document.getElementById(id); }
    };
})();
