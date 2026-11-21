/* =============================================================
   begriff.js – Begriffs-Hinweise (DESIGN.md Regel 15)
   Markup:  <abbr class="k-begriff" data-erklaerung="1–2 Sätze">Bit</abbr>
   Hover, Tastatur-Fokus und Klick/Tippen öffnen ein Popover; Escape oder Klick daneben schließt.
   Barrierearm: abbr bekommt tabindex, role="button", aria-expanded und aria-describedby (versteckter
   Beschreibungstext, immer vorhanden); das sichtbare Popover ist role="tooltip".
   Wird von kurs.js nachgeladen, sobald ein abbr.k-begriff auf der Seite steht.
   ============================================================= */
(function () {
  'use strict';
  if (window.KursBegriff) return;

  var seq = 0, pop = null, popText = null, popTitle = null, openFor = null, pinned = false, hoverT = null, leaveT = null;
  var canHover = window.matchMedia ? window.matchMedia('(hover: hover)').matches : true;

  function el(tag, attrs) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { if (k === 'class') n.className = attrs[k]; else n.setAttribute(k, attrs[k]); });
    return n;
  }

  function ensurePop() {
    if (pop) return;
    popTitle = el('strong', { class: 'k-pop__t' });
    popText = el('span', { class: 'k-pop__x' });
    pop = el('div', { class: 'k-pop', role: 'tooltip', id: 'k-pop-live', hidden: '' });
    pop.appendChild(popTitle); pop.appendChild(popText);
    document.body.appendChild(pop);
    pop.addEventListener('mouseenter', function () { clearTimeout(leaveT); });
    pop.addEventListener('mouseleave', function () { if (!pinned) scheduleClose(); });
  }

  function place(t) {
    var r = t.getBoundingClientRect(), vw = document.documentElement.clientWidth, vh = window.innerHeight, m = 8;
    pop.style.maxWidth = Math.min(320, vw - 2 * m) + 'px';
    pop.style.left = '0px'; pop.style.top = '0px';
    var w = pop.offsetWidth, h = pop.offsetHeight;
    var left = Math.min(Math.max(m, r.left + r.width / 2 - w / 2), vw - w - m);
    var below = r.bottom + 8 + h <= vh - m || r.top - 8 - h < m;
    var top = below ? r.bottom + 8 : r.top - 8 - h;
    pop.classList.toggle('is-above', !below);
    pop.style.left = (left + window.pageXOffset) + 'px';
    pop.style.top = (top + window.pageYOffset) + 'px';
    pop.style.setProperty('--k-pop-arrow', Math.round(Math.min(Math.max(14, r.left + r.width / 2 - left), w - 14)) + 'px');
  }

  function show(t, pin) {
    clearTimeout(hoverT); clearTimeout(leaveT);
    ensurePop();
    if (openFor && openFor !== t) { openFor.setAttribute('aria-expanded', 'false'); openFor.removeAttribute('data-open'); }
    openFor = t; pinned = !!pin;
    popTitle.textContent = t.textContent;
    popText.textContent = t.getAttribute('data-erklaerung') || '';
    pop.hidden = false;
    t.setAttribute('aria-expanded', 'true'); t.setAttribute('data-open', '');
    place(t);
  }
  function hide() {
    clearTimeout(hoverT); clearTimeout(leaveT);
    if (openFor) { openFor.setAttribute('aria-expanded', 'false'); openFor.removeAttribute('data-open'); }
    if (pop) pop.hidden = true;
    openFor = null; pinned = false;
  }
  function scheduleClose() { clearTimeout(leaveT); leaveT = setTimeout(function () { if (!pinned) hide(); }, 180); }

  function enhance(t) {
    if (t._kb) return;
    var text = t.getAttribute('data-erklaerung');
    if (!text) return;
    t._kb = true;
    if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '0');
    t.setAttribute('role', 'button');
    t.setAttribute('aria-expanded', 'false');
    var id = 'k-begriff-' + (++seq);
    var d = el('span', { class: 'k-sr', id: id });
    d.textContent = text;
    document.body.appendChild(d);
    t.setAttribute('aria-describedby', id);
    t.addEventListener('click', function (e) {
      e.preventDefault();
      if (openFor === t && pinned) hide(); else show(t, true);
    });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (openFor === t && pinned) hide(); else show(t, true); }
    });
    t.addEventListener('focus', function () { if (!t.matches(':focus-visible')) return; show(t, false); });
    t.addEventListener('blur', function () { if (openFor === t && !pinned) hide(); });
    if (canHover) {
      t.addEventListener('mouseenter', function () { clearTimeout(leaveT); clearTimeout(hoverT); if (openFor !== t) hoverT = setTimeout(function () { show(t, false); }, 150); });
      t.addEventListener('mouseleave', function () { clearTimeout(hoverT); if (!pinned) scheduleClose(); });
    }
  }

  function scan(root) {
    root = root || document;
    if (root.nodeType !== 1 && root.nodeType !== 9) return;
    if (root.matches && root.matches('abbr.k-begriff')) enhance(root);
    if (root.querySelectorAll) Array.prototype.forEach.call(root.querySelectorAll('abbr.k-begriff'), enhance);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && openFor) { var t = openFor; hide(); if (document.activeElement !== t) { try { t.focus({ preventScroll: true }); } catch (x) { /* egal */ } } }
  });
  document.addEventListener('pointerdown', function (e) {
    if (!openFor) return;
    if (openFor.contains(e.target) || (pop && pop.contains(e.target))) return;
    hide();
  }, true);
  window.addEventListener('resize', function () { if (openFor) place(openFor); });
  window.addEventListener('scroll', function () { if (openFor) place(openFor); }, true);

  window.KursBegriff = { scan: scan, hide: hide };
  scan(document);
  if (window.MutationObserver) {
    new MutationObserver(function (muts) {
      muts.forEach(function (m) { Array.prototype.forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1) scan(n); }); });
    }).observe(document.body, { childList: true, subtree: true });
  }
})();
