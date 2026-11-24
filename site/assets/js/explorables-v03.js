/* =============================================================
   explorables-v03.js – interaktive Bausteine für Termin 03 (Und, oder: mehr als zwei Wege)
     data-explorable="schalter"    „Zwei Schalter, zwei Lampen“: Schalter A und B, Lampe für A UND B und für A ODER B,
                                   daneben die Wahrheitstabelle mit markierter aktueller Zeile
   „weiche“ (mit dem Plan der Ampel) liegt in explorables-v02.js; die Seite lädt beide Dateien.
   Schreibweise in der Tabelle: 1 für wahr, 0 für falsch (so auch in der Klausur).
   Eigenständig wie alle explorables-vNN.js: keine Bibliothek, Texte per textContent.
   Der Rechenkern steht oben und ist ohne Browser prüfbar (module.exports).
   ============================================================= */
(function () {
  'use strict';

  /* ── Rechenkern (ohne DOM) ────────────────────────────────── */
  function und(a, b) { return a && b ? 1 : 0; }
  function oder(a, b) { return a || b ? 1 : 0; }
  /* Die vier Zeilen der Wahrheitstabelle in der Reihenfolge 00, 01, 10, 11 */
  var TABELLE = [[0, 0], [0, 1], [1, 0], [1, 1]].map(function (z) { return { a: z[0], b: z[1], und: und(z[0], z[1]), oder: oder(z[0], z[1]) }; });
  /* Welche Zeile (0 bis 3) gehört zur Stellung der Schalter? */
  function zeileVon(a, b) { return a * 2 + b; }
  /* In wie vielen der vier Stellungen leuchtet die Lampe? */
  function anzahlAn(spalte) { return TABELLE.filter(function (z) { return z[spalte] === 1; }).length; }
  function satz(a, b) {
    var z = TABELLE[zeileVon(a, b)];
    return 'A = ' + a + ', B = ' + b + '. Lampe A UND B: ' + (z.und ? 'an' : 'aus') + '. Lampe A ODER B: ' + (z.oder ? 'an' : 'aus') + '.';
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { und: und, oder: oder, TABELLE: TABELLE, zeileVon: zeileVon, anzahlAn: anzahlAn, satz: satz };
  }
  if (typeof document === 'undefined') return;

  /* ── DOM-Hilfen ───────────────────────────────────────────── */
  function el(tag, attrs, kinder) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kinder || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }

  /* ── Zwei Schalter, zwei Lampen ───────────────────────────── */
  function initSchalter(host) {
    var wert = { A: 0, B: 0 };
    host.textContent = '';
    var knoepfe = {}, zustand = {};
    ['A', 'B'].forEach(function (n) {
      var b = el('button', { type: 'button', class: 'v03-schalter', role: 'switch', 'aria-checked': 'false' });
      var z = el('span', { class: 'v03-schalter__zustand' });
      b.appendChild(el('span', { class: 'v03-schalter__name', text: 'Schalter ' + n }));
      b.appendChild(el('span', { class: 'v03-schalter__hebel', 'aria-hidden': 'true' }));
      b.appendChild(z);
      b.addEventListener('click', function () { wert[n] = wert[n] ? 0 : 1; zeige(true); });
      knoepfe[n] = b; zustand[n] = z;
    });
    function lampe(titel) {
      var z = el('span', { class: 'v03-lampe__zustand' });
      var n = el('div', { class: 'v03-lampe' }, [el('span', { class: 'v03-lampe__licht', 'aria-hidden': 'true' }), el('span', { class: 'v03-lampe__name', text: titel }), z]);
      return { knoten: n, zustand: z };
    }
    var lUnd = lampe('Lampe A UND B'), lOder = lampe('Lampe A ODER B');
    var zeilen = TABELLE.map(function (z) {
      return el('tr', {}, [z.a, z.b, z.und, z.oder].map(function (v, i) { return el(i < 2 ? 'th' : 'td', i < 2 ? { scope: 'row' } : {}, [String(v)]); }));
    });
    var tabelle = el('table', { class: 'k-types v03-tabelle' }, [
      el('caption', { class: 'k-sr', text: 'Wahrheitstabelle für A UND B und A ODER B; die Zeile der aktuellen Schalterstellung ist markiert' }),
      el('thead', {}, [el('tr', {}, ['A', 'B', 'A UND B', 'A ODER B'].map(function (t) { return el('th', { scope: 'col', text: t }); }))]),
      el('tbody', {}, zeilen)
    ]);
    var status = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    function zeige(ansagen) {
      ['A', 'B'].forEach(function (n) {
        knoepfe[n].setAttribute('aria-checked', wert[n] ? 'true' : 'false');
        knoepfe[n].classList.toggle('is-an', !!wert[n]);
        zustand[n].textContent = (wert[n] ? 'an' : 'aus') + ' · ' + wert[n];
      });
      var i = zeileVon(wert.A, wert.B), z = TABELLE[i];
      [[lUnd, z.und], [lOder, z.oder]].forEach(function (p) {
        p[0].knoten.classList.toggle('is-an', !!p[1]);
        p[0].zustand.textContent = (p[1] ? 'leuchtet' : 'aus') + ' · ' + p[1];
      });
      zeilen.forEach(function (tr, k) {
        tr.classList.toggle('is-jetzt', k === i);
        if (k === i) tr.setAttribute('aria-current', 'true'); else tr.removeAttribute('aria-current');
      });
      if (ansagen) status.textContent = satz(wert.A, wert.B);
    }
    zeige(false);
    host.appendChild(el('div', { class: 'v03-schalter-bau' }, [
      el('div', { class: 'v03-schalter-bau__links' }, [
        el('div', { class: 'v03-schalterreihe', role: 'group', 'aria-label': 'Schalter' }, [knoepfe.A, knoepfe.B]),
        el('div', { class: 'v03-lampen' }, [lUnd.knoten, lOder.knoten])
      ]),
      el('div', { class: 'v03-schalter-bau__rechts' }, [tabelle]),
      status
    ]));
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="schalter"]'), function (host) {
      if (host._v03) return;
      host._v03 = true;
      initSchalter(host);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
