// themeContrastCheck.js
// Small helper to compute WCAG contrast ratios for a set of selectors.
// Run in browser console or include temporarily to page to log contrast results.

(function () {
  function luminance(r, g, b) {
    var a = [r, g, b].map(function (v) {
      v = v / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }

  function rgbFromCss(color) {
    if (!color) return null;
    var m;
    if ((m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i))) {
      return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
    }
    if ((m = color.match(/#([0-9a-f]{6})/i))) {
      var hex = m[1];
      return [parseInt(hex.substr(0,2),16), parseInt(hex.substr(2,2),16), parseInt(hex.substr(4,2),16)];
    }
    return null; // unsupported format
  }

  function contrastRatio(fg, bg) {
    var L1 = luminance(fg[0], fg[1], fg[2]);
    var L2 = luminance(bg[0], bg[1], bg[2]);
    var lighter = Math.max(L1, L2);
    var darker = Math.min(L1, L2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function checkSelectors(selectors) {
    var root = document.documentElement;
    selectors.forEach(function (sel) {
      var el = document.querySelector(sel);
      if (!el) {
        console.log('[contrast] not found:', sel);
        return;
      }
      var style = getComputedStyle(el);
      var fg = style.color;
      var bg = style.backgroundColor;
      // if background is transparent, climb until find non-transparent
      var node = el;
      while (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
        node = node.parentElement;
        if (!node) break;
        bg = getComputedStyle(node).backgroundColor;
      }
      var fgRgb = rgbFromCss(fg) || [0,0,0];
      var bgRgb = rgbFromCss(bg) || [255,255,255];
      var ratio = contrastRatio(fgRgb, bgRgb).toFixed(2);
      console.log('[contrast]', sel, 'fg=', fg, 'bg=', bg, 'ratio=', ratio, (ratio >= 4.5 ? 'PASS' : 'FAIL (<4.5)'));
    });
  }

  window.ThemeContrastCheck = {
    run: function () {
      // core selectors to validate
      var selectors = [
        '.mainVisual_wrap .hero-title',
        '.mainVisual_wrap .hero-sub',
        '#header .logo',
        '#footer .site_info .myinfo .name',
        '.galleryModal .modalBody',
        '.main_side .side_list li .t_box .tit'
      ];
      checkSelectors(selectors);
    }
  };
})();
