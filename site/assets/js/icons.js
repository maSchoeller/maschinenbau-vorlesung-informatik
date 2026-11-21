/* =============================================================
   icons.js – zentrale Icon-Hilfe. Die Symbole liegen in assets/img/icons.svg.
   window.KIcon('check')            -> <svg class="k-ic"><use href=".../icons.svg#i-check"/></svg>
   window.KIcon('star', 'k-ic--fill')
   Immer aria-hidden: der Text daneben trägt die Bedeutung.
   ============================================================= */
(function () {
  'use strict';
  var base = '';
  var s = document.currentScript;
  if (s && s.src) base = s.src.replace(/js\/icons\.js[^/]*$/, 'img/icons.svg');
  var NS = 'http://www.w3.org/2000/svg';
  window.KIcon = function (id, cls) {
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'k-ic' + (cls ? ' ' + cls : ''));
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var use = document.createElementNS(NS, 'use');
    use.setAttribute('href', base + '#i-' + id);
    svg.appendChild(use);
    return svg;
  };
  /* Sterne der Schwierigkeit: n gefüllt, Rest (bis max) leer */
  window.KStars = function (n, max) {
    max = max || 4;
    var w = document.createElement('span');
    w.className = 'k-stars';
    w.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < max; i++) w.appendChild(window.KIcon('star', i < n ? 'k-ic--fill' : 'k-ic--empty'));
    return w;
  };
})();
