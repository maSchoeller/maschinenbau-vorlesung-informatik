/* =============================================================
   explorables-v22.js – Code-Walkthroughs und Klausurtraining V22
   (1) Variablentabelle zum Mitschreiben (data-explorable="vartabelle"): Schleife des Beispiels
       briefing/v22-beispiel.py Durchlauf für Durchlauf, Eingaben prüfen, Zeile zeigen.
   (2) PAP des Beispiels (data-explorable="pap", data-pap="bewerte" | "haupt") über KursPAP.
   (3) Zeitplan nach Punkten (data-explorable="zeitplan") für die Probeklausur.
   (4) Links auf noch nicht veröffentlichte Seiten (data-v22-pruefen) werden zu Text „folgt“.
   Reines JS, kein Framework. Der Rechenkern (bewerteSchritte) ist ohne DOM per node testbar.
   ============================================================= */
(function (root) {
  'use strict';

  /* ── Kern ohne DOM: genau die Logik von briefing/v22-beispiel.py ─── */
  var MESSWERTE = [20.01, 20.03, 19.97, 20.00, 20.02];
  function bewerte(d, nenn, tol) {
    nenn = nenn === undefined ? 20.0 : nenn; tol = tol === undefined ? 0.02 : tol;
    var abw = d - nenn;
    if (Math.abs(abw) <= tol) return 'gut';
    if (abw > 0) return 'nacharbeit';
    return 'ausschuss';
  }
  function schritte(werte) {
    var z = { gut: 0, nacharbeit: 0, ausschuss: 0 }, out = [];
    werte.forEach(function (d) {
      var e = bewerte(d);
      z[e] = z[e] + 1;
      out.push({ d: d, ergebnis: e, gut: z.gut, nacharbeit: z.nacharbeit, ausschuss: z.ausschuss });
    });
    return out;
  }
  var core = { bewerte: bewerte, schritte: schritte, MESSWERTE: MESSWERTE };
  core.zeitplan = function (d, p) { return zeitplan(d, p); };
  if (typeof module !== 'undefined' && module.exports) module.exports = core;
  if (typeof document === 'undefined') return;

  /* ── Hilfen ───────────────────────────────────────────── */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'class') n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function icon(id) { return root.KIcon ? root.KIcon(id) : null; }
  function fmt2(d) { return d.toFixed(2); }

  /* ══════════════════════════════════════════════════════════
     (1) Variablentabelle
     ══════════════════════════════════════════════════════════ */
  var CODE_LINES = [
    'for d in messwerte:',
    '    ergebnis = bewerte(d)',
    '    zaehler[ergebnis] = zaehler[ergebnis] + 1',
    '    print(f"{d:.2f} mm -> {ergebnis}")'
  ];
  var FELDER = [['e', 'ergebnis'], ['gut', 'gut'], ['nacharbeit', 'nacharbeit'], ['ausschuss', 'ausschuss']];

  function initVartabelle(host) {
    var soll = schritte(MESSWERTE), N = soll.length;
    var k = 0;                                   // sichtbare Durchläufe
    var werte = soll.map(function () { return { e: '', gut: '', nacharbeit: '', ausschuss: '' }; });
    var marken = soll.map(function () { return {}; });

    var codeBox = el('div', { class: 'v22-vt__codewrap' }, [
      el('p', { class: 'v22-vt__cap', text: 'Ausschnitt aus dem Programm (Schleife im Hauptprogramm)' })
    ]);
    var ul = el('ul', { class: 'k-codelines v22-vt__code', 'aria-label': 'Schleife des Programms' });
    CODE_LINES.forEach(function (z) { ul.appendChild(el('li', null, [el('code', { text: z })])); });
    codeBox.appendChild(ul);

    var status = el('p', { class: 'v22-vt__status', role: 'status', 'aria-live': 'polite' });
    var tableWrap = el('div', { class: 'k-tablewrap' });
    var fb = el('p', { class: 'v22-vt__fb', role: 'status', 'aria-live': 'polite' });
    var summary = el('p', { class: 'v22-vt__sum', role: 'status', 'aria-live': 'polite' });

    function btn(text, cls, fn) {
      var b = el('button', { type: 'button', class: 'k-btn ' + cls, text: text });
      b.addEventListener('click', fn); return b;
    }
    var bZurueck = btn('Schritt zurück', 'k-btn--ghost', function () { if (k > 0) { k--; fb.textContent = ''; render(); } });
    var bVor = btn('Schritt vor', '', function () { if (k < N) { k++; fb.textContent = ''; render(true); } });
    var bPruef = btn('Meine Eingaben prüfen', 'k-btn--ghost', pruefen);
    var bZeige = btn('Zeile zeigen', 'k-btn--ghost', zeigen);
    var bReset = btn('Zurücksetzen', 'k-btn--ghost k-btn--small', function () {
      k = 0;
      werte.forEach(function (w) { w.e = w.gut = w.nacharbeit = w.ausschuss = ''; });
      marken = soll.map(function () { return {}; });
      fb.textContent = ''; render();
    });
    var knoepfe = el('p', { class: 'v22-vt__knoepfe' }, [bZurueck, bVor, bPruef, bZeige, bReset]);

    function norm(s) { return String(s).trim().toLowerCase().replace(/["'„“”]/g, ''); }
    function richtig(i, f) {
      var s = soll[i];
      if (f === 'e') return norm(werte[i].e) === s.ergebnis;
      var t = String(werte[i][f]).trim();
      return /^\d+$/.test(t) && parseInt(t, 10) === s[f];
    }
    function pruefen() {
      var ok = 0, falsch = 0, leer = 0, bad = [];
      for (var i = 0; i < k; i++) {
        FELDER.forEach(function (F) {
          var f = F[0];
          if (String(werte[i][f]).trim() === '') { leer++; marken[i][f] = null; return; }
          if (richtig(i, f)) { ok++; marken[i][f] = 'ok'; }
          else { falsch++; marken[i][f] = 'bad'; bad.push('Durchlauf ' + (i + 1) + ', ' + F[1]); }
        });
      }
      if (k === 0) fb.textContent = 'Klicke zuerst auf „Schritt vor“, dann hast du eine Zeile zum Ausfüllen.';
      else if (falsch === 0 && leer === 0) fb.textContent = 'Alle ' + ok + ' Felder stimmen.' + (k < N ? ' Weiter mit „Schritt vor“.' : ' Die Tabelle ist vollständig.');
      else fb.textContent = ok + ' richtig, ' + falsch + ' falsch' + (leer ? ', ' + leer + ' noch leer' : '') + (bad.length ? '. Prüfe: ' + bad.join('; ') + '.' : '.');
      render();
    }
    function zeigen() {
      if (k === 0) { fb.textContent = 'Klicke zuerst auf „Schritt vor“.'; return; }
      var i = k - 1, s = soll[i];
      werte[i].e = s.ergebnis; werte[i].gut = String(s.gut); werte[i].nacharbeit = String(s.nacharbeit); werte[i].ausschuss = String(s.ausschuss);
      FELDER.forEach(function (F) { marken[i][F[0]] = 'ok'; });
      fb.textContent = 'Durchlauf ' + (i + 1) + ' eingetragen: d = ' + fmt2(s.d) + ' ergibt „' + s.ergebnis + '“. Die Zähler stehen danach auf ' + s.gut + ', ' + s.nacharbeit + ' und ' + s.ausschuss + '.';
      render();
    }

    function zelle(i, F) {
      var f = F[0], td = el('td', { class: 'v22-vt__zelle' });
      var inp = el('input', { type: 'text', class: 'v22-vt__in', autocomplete: 'off', autocapitalize: 'none', spellcheck: 'false',
        'aria-label': 'Durchlauf ' + (i + 1) + ', ' + F[1], 'data-i': String(i), 'data-f': f });
      if (f !== 'e') inp.setAttribute('inputmode', 'numeric');
      inp.value = werte[i][f];
      inp.addEventListener('input', function () { werte[i][f] = inp.value; marken[i][f] = null; inp.classList.remove('is-ok', 'is-bad'); });
      var m = marken[i][f];
      if (m) {
        inp.classList.add(m === 'ok' ? 'is-ok' : 'is-bad');
        inp.setAttribute('aria-invalid', m === 'bad' ? 'true' : 'false');
        td.appendChild(inp);
        var ic = icon(m === 'ok' ? 'check' : 'x'); if (ic) { ic.classList.add('v22-vt__ic', m === 'ok' ? 'is-ok' : 'is-bad'); td.appendChild(ic); }
        td.appendChild(el('span', { class: 'k-sr', text: m === 'ok' ? 'richtig' : 'falsch' }));
      } else td.appendChild(inp);
      return td;
    }

    function render(fokus) {
      tableWrap.textContent = '';
      var table = el('table', { class: 'v22-vt__tab' });
      table.appendChild(el('caption', { class: 'k-sr', text: 'Variablentabelle der Schleife: je Durchlauf d, ergebnis und die drei Zähler nach dem Durchlauf' }));
      var thead = el('thead'), tr = el('tr');
      ['Durchlauf', 'd (mm)', 'ergebnis', 'zaehler gut', 'zaehler nacharbeit', 'zaehler ausschuss'].forEach(function (h) { tr.appendChild(el('th', { scope: 'col', text: h })); });
      thead.appendChild(tr); table.appendChild(thead);
      var tb = el('tbody');
      var r0 = el('tr', { class: 'v22-vt__vor' });
      r0.appendChild(el('th', { scope: 'row', text: 'vor der Schleife' }));
      r0.appendChild(el('td', { text: '–' })); r0.appendChild(el('td', { text: '–' }));
      for (var c = 0; c < 3; c++) r0.appendChild(el('td', { text: '0' }));
      tb.appendChild(r0);
      for (var i = 0; i < N; i++) {
        var r = el('tr', { class: i < k ? (i === k - 1 ? 'is-aktuell' : '') : 'is-offen' });
        r.appendChild(el('th', { scope: 'row', text: String(i + 1) }));
        if (i < k) {
          r.appendChild(el('td', { text: fmt2(soll[i].d) }));
          FELDER.forEach(function (F) { r.appendChild(zelle(i, F)); });
        } else {
          for (var c2 = 0; c2 < 5; c2++) r.appendChild(el('td', { class: 'k-muted', text: '…' }));
        }
        tb.appendChild(r);
      }
      table.appendChild(tb); tableWrap.appendChild(table);

      var lis = ul.children;
      for (var j = 0; j < lis.length; j++) lis[j].classList.toggle('v22-aktiv', k > 0);
      if (k === 0) status.textContent = 'Vor der Schleife: Das Dictionary zaehler steht auf 0, 0, 0. Klicke auf „Schritt vor“, um den ersten Durchlauf zu beginnen.';
      else status.textContent = 'Durchlauf ' + k + ' von ' + N + ': d = ' + fmt2(soll[k - 1].d) + '. Was liefert bewerte(d), und wie stehen die Zähler danach?';
      bZurueck.disabled = k === 0; bVor.disabled = k === N;
      var sl = soll[N - 1];
      summary.textContent = k === N ? 'Nach der Schleife: print(zaehler) gibt {\'gut\': ' + sl.gut + ', \'nacharbeit\': ' + sl.nacharbeit + ', \'ausschuss\': ' + sl.ausschuss + '}. Gutanteil: ' + sl.gut + ' / ' + N + ' · 100 = ' + Math.round(sl.gut / N * 100) + ' %.' : '';
      if (fokus) { var f1 = tableWrap.querySelector('tr.is-aktuell input'); if (f1) f1.focus(); }
    }

    host.appendChild(codeBox); host.appendChild(status); host.appendChild(tableWrap);
    host.appendChild(knoepfe); host.appendChild(fb); host.appendChild(summary);
    render();
  }

  /* ══════════════════════════════════════════════════════════
     (2) PAP des Beispiels
     ══════════════════════════════════════════════════════════ */
  function startN(P, text) { var n = P.start('s'); n.text = text; return n; }
  function papSpecs(P) {
    return {
      bewerte: {
        label: 'PAP des Unterprogramms bewerte: Start mit Funktionsname, Operation abweichung gleich d minus nenn, Verzweigung Betrag der Abweichung kleiner oder gleich tol. Bei ja Rückgabe gut. Bei nein Verzweigung Abweichung größer null: bei ja Rückgabe nacharbeit, bei nein Rückgabe ausschuss.',
        spec: function () {
          return [startN(P, 'bewerte(d, nenn, tol)'), P.op('abweichung = d - nenn', 'o1'),
            P.iff('abs(abweichung) ≤ tol?', [P.end('e1', 'Rückgabe: "gut"')],
              [P.iff('abweichung > 0?', [P.end('e2', 'Rückgabe: "nacharbeit"')], [P.end('e3', 'Rückgabe: "ausschuss"')], 'd2')], 'd1')];
        }
      },
      haupt: {
        label: 'PAP des Hauptprogramms: Start, Zähler gut, nacharbeit, ausschuss auf null, Schleife über alle Messwerte mit Aufruf des Unterprogramms bewerte, Zähler erhöhen und Ausgabe der Zeile. Nach der Schleife Gutanteil berechnen und ausgeben, Ende.',
        spec: function () {
          return [P.start('s'), P.op('zaehler: gut, nacharbeit, ausschuss = 0', 'o1', { wrapAt: 30 }),
            P.whil('weiterer Messwert d?', [
              P.sub('ergebnis = bewerte(d)', 'u1', { wrapAt: 30 }),
              P.op('Zähler zu ergebnis + 1', 'o2'),
              P.io('Ausgabe: d, ergebnis', 'i1')
            ], 'w1'),
            P.op('anteil = gut / Anzahl · 100', 'o3'),
            P.io('Ausgabe: zaehler, anteil', 'i2'), P.end('e')];
        }
      }
    };
  }
  function initPap(host) {
    var K = root.KursPAP;
    if (!K || !K.P) { host.appendChild(el('p', { class: 'k-small k-muted', text: 'Der Programmablaufplan braucht pap-engine.js.' })); return; }
    var d = papSpecs(K.P)[host.getAttribute('data-pap')];
    if (!d) return;
    var wrap = el('div', { class: 'pap-wrap' });
    wrap.innerHTML = K.svg(d.spec(), { label: d.label, minw: 0.85 });
    host.appendChild(wrap);
  }

  /* ══════════════════════════════════════════════════════════
     (3) Zeitplan nach Punkten
     ══════════════════════════════════════════════════════════ */
  var AUFGABEN = [
    ['A1', 'Zahlensysteme und Datentypen', 10], ['A2', 'Boolesche Logik', 8], ['A3', 'Netzwerk, Sicherheit und Datenbanken', 9],
    ['A4', 'KI, Testen und Laufzeit', 8], ['B1', 'PAP in Python übertragen', 10], ['B2', 'Python-Programm als PAP', 10],
    ['B3', 'Programmausgabe bestimmen', 10], ['B4', 'Code-Review: Fehler finden', 10], ['B5', 'Kurze Programmieraufgaben', 15]
  ];
  function zeitplan(dauer, puffer) {
    var summe = 0; AUFGABEN.forEach(function (a) { summe += a[2]; });
    var proPunkt = (dauer - puffer) / summe, t = 0;
    return { summe: summe, proPunkt: proPunkt, zeilen: AUFGABEN.map(function (a) { var m = a[2] * proPunkt; t += m; return { nr: a[0], thema: a[1], punkte: a[2], min: m, ende: t }; }) };
  }
  function initZeitplan(host) {
    var idD = 'v22-zp-dauer', idP = 'v22-zp-puffer';
    var inD = el('input', { type: 'number', id: idD, class: 'v22-zp__in', min: '30', max: '300', step: '5', value: '90', inputmode: 'numeric' });
    var inP = el('input', { type: 'number', id: idP, class: 'v22-zp__in', min: '0', max: '60', step: '5', value: '10', inputmode: 'numeric' });
    var felder = el('div', { class: 'v22-zp__felder' }, [
      el('label', { for: idD }, ['Dauer in Minuten ', inD]), el('label', { for: idP }, ['Puffer am Ende in Minuten ', inP])
    ]);
    var info = el('p', { class: 'v22-zp__info', role: 'status', 'aria-live': 'polite' });
    var wrap = el('div', { class: 'k-tablewrap' });
    function render() {
      var dauer = parseFloat(inD.value), puffer = parseFloat(inP.value);
      wrap.textContent = '';
      if (!(dauer >= 30 && dauer <= 300) || !(puffer >= 0) || puffer >= dauer) { info.textContent = 'Bitte eine Dauer von 30 bis 300 Minuten und einen kleineren Puffer eingeben.'; return; }
      var z = zeitplan(dauer, puffer);
      info.textContent = 'Du hast ' + z.proPunkt.toFixed(2).replace('.', ',') + ' Minuten je Punkt. Ab Minute ' + Math.round(dauer - puffer) + ' beginnt der Puffer zum Kontrollieren.';
      var table = el('table', { class: 'v22-zp__tab' });
      table.appendChild(el('caption', { class: 'k-sr', text: 'Zeitplan der Probeklausur: Punkte, Richtzeit und Endzeit je Aufgabe' }));
      var tr = el('tr'); ['Aufgabe', 'Thema', 'Punkte', 'Richtzeit', 'fertig bis Minute'].forEach(function (h) { tr.appendChild(el('th', { scope: 'col', text: h })); });
      table.appendChild(el('thead', null, [tr]));
      var tb = el('tbody');
      z.zeilen.forEach(function (r) {
        tb.appendChild(el('tr', null, [el('th', { scope: 'row', text: r.nr }), el('td', { text: r.thema }), el('td', { text: String(r.punkte) }),
          el('td', { text: Math.round(r.min) + ' Min' }), el('td', { text: String(Math.round(r.ende)) })]));
      });
      tb.appendChild(el('tr', { class: 'v22-zp__sum' }, [el('th', { scope: 'row', text: 'Summe' }), el('td', { text: 'plus Puffer ' + Math.round(puffer) + ' Min' }), el('td', { text: String(z.summe) }),
        el('td', { text: Math.round(dauer - puffer) + ' Min' }), el('td', { text: String(Math.round(dauer)) })]));
      table.appendChild(tb); wrap.appendChild(table);
    }
    inD.addEventListener('input', render); inP.addEventListener('input', render);
    host.appendChild(felder); host.appendChild(info); host.appendChild(wrap); render();
  }

  /* ══════════════════════════════════════════════════════════
     (4) Links auf noch nicht veröffentlichte Seiten
     ══════════════════════════════════════════════════════════ */
  function pruefeLinks() {
    if (!root.fetch || location.protocol === 'file:') return;
    var cache = {};
    Array.prototype.forEach.call(document.querySelectorAll('a[data-v22-pruefen]'), function (a) {
      var url = a.getAttribute('href').split('#')[0];
      if (!cache[url]) cache[url] = fetch(url, { method: 'HEAD' }).then(function (r) { return r.ok; }, function () { return true; });
      cache[url].then(function (ok) {
        if (ok) return;
        var sp = el('span', { class: 'k-muted', text: a.textContent + ' (folgt)' });
        a.parentNode.replaceChild(sp, a);
      });
    });
  }

  function init() {
    var map = { vartabelle: initVartabelle, pap: initPap, zeitplan: initZeitplan };
    Object.keys(map).forEach(function (k) { Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="' + k + '"]'), map[k]); });
    pruefeLinks();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : globalThis);
