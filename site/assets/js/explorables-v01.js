/* =============================================================
   explorables-v01.js – interaktive Bausteine für Termin 01 (Ablauf und erste Programme)
     data-explorable="eva"         Eingabe, Verarbeitung, Ausgabe am Trinkgeld-Rechner: zwei Regler
     data-explorable="papschritt"  den Programmablaufplan Schritt für Schritt ablaufen (braucht pap-engine.js)
     data-explorable="schachteln"  Variablen als Schachteln: Zuweisungen anklicken und zusehen
   Eigenständig wie alle explorables-vNN.js: keine gemeinsame Bibliothek, Texte per textContent.
   Der Rechenkern steht oben und ist ohne Browser prüfbar (module.exports).
   ============================================================= */
(function () {
  'use strict';

  /* ── Rechenkern (ohne DOM) ────────────────────────────────── */
  function trinkgeld(betrag, prozent) { return betrag * prozent / 100; }
  function gesamt(betrag, prozent) { return betrag + trinkgeld(betrag, prozent); }
  /* Zahl wie im Deutschen: 44,5 -> "44,50" */
  function euro(x) { return x.toFixed(2).replace('.', ','); }
  /* Zahl ohne unnötige Nachkommastellen: 4 -> "4", 4.5 -> "4,5" */
  function zahl(x) { return String(Math.round(x * 100) / 100).replace('.', ','); }

  /* Schritte des Trinkgeld-Plans: welcher Knoten, welche Art, was passiert, welche Variable bekommt welchen Wert */
  function planSchritte(betrag, prozent) {
    var t = trinkgeld(betrag, prozent), g = gesamt(betrag, prozent);
    return [
      { id: 's', art: 'grenze', text: 'Hier beginnt der Ablauf. Jeder Plan hat genau einen Start.' },
      { id: 'e1', art: 'ein', text: 'Der Rechnungsbetrag kommt von außen in den Ablauf und wird unter dem Namen betrag gemerkt.', setze: ['betrag', betrag] },
      { id: 'e2', art: 'ein', text: 'Auch der Prozentsatz kommt von außen. Er wird unter dem Namen prozent gemerkt.', setze: ['prozent', prozent] },
      { id: 'r1', art: 'tun', text: 'Aus betrag und prozent wird das Trinkgeld berechnet: ' + zahl(betrag) + ' · ' + zahl(prozent) + ' / 100 = ' + zahl(t) + '.', setze: ['trinkgeld', t] },
      { id: 'r2', art: 'tun', text: 'Betrag und Trinkgeld werden addiert: ' + zahl(betrag) + ' + ' + zahl(t) + ' = ' + zahl(g) + '.', setze: ['gesamt', g] },
      { id: 'a1', art: 'aus', text: 'Die Ergebnisse gehen nach außen, zum Beispiel auf den Bildschirm: Trinkgeld ' + euro(t) + ' €, zu zahlen ' + euro(g) + ' €.' },
      { id: 'e', art: 'grenze', text: 'Hier endet der Ablauf. Jeder Plan hat genau ein Ende.' }
    ];
  }
  var SYMBOL = {
    grenze: 'Grenzstelle (abgerundet): Start oder Ende',
    ein: 'Parallelogramm: Eingabe',
    aus: 'Parallelogramm: Ausgabe',
    tun: 'Rechteck: Verarbeitung'
  };

  /* Zuweisungen für die Schachteln: rechts ausrechnen, dann links ablegen */
  var ZUWEISUNGEN = [
    { code: 'a = 5', ziel: 'a', rechne: function () { return 5; }, rechts: function () { return '5'; } },
    { code: 'b = a', ziel: 'b', braucht: ['a'], rechne: function (v) { return v.a; }, rechts: function (v) { return 'a hat den Wert ' + v.a; } },
    { code: 'a = a + 1', ziel: 'a', braucht: ['a'], rechne: function (v) { return v.a + 1; }, rechts: function (v) { return v.a + ' + 1 = ' + (v.a + 1); } },
    { code: 'b = b * 2', ziel: 'b', braucht: ['b'], rechne: function (v) { return v.b * 2; }, rechts: function (v) { return v.b + ' · 2 = ' + (v.b * 2); } },
    { code: 'a = b', ziel: 'a', braucht: ['b'], rechne: function (v) { return v.b; }, rechts: function (v) { return 'b hat den Wert ' + v.b; } }
  ];
  /* Führt eine Zuweisung aus. -> {werte, text} oder {fehler} (Name noch nicht belegt) */
  function zuweisen(werte, z) {
    var fehlt = (z.braucht || []).filter(function (n) { return werte[n] === undefined; })[0];
    if (fehlt) return { fehler: 'NameError: Die Variable ' + fehlt + ' gibt es noch nicht. Rechts vom = darf nur stehen, was schon einen Wert hat.' };
    var neu = { a: werte.a, b: werte.b };
    var rechts = z.rechts(werte);
    neu[z.ziel] = z.rechne(werte);
    return { werte: neu, text: 'Rechts: ' + rechts + '. Das Ergebnis ' + neu[z.ziel] + ' kommt in die Schachtel ' + z.ziel + '. Die andere Schachtel bleibt, wie sie ist.' };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { trinkgeld: trinkgeld, gesamt: gesamt, euro: euro, zahl: zahl, planSchritte: planSchritte, ZUWEISUNGEN: ZUWEISUNGEN, zuweisen: zuweisen };
  }
  if (typeof document === 'undefined') return;

  /* ── DOM-Hilfen ───────────────────────────────────────────── */
  var nr = 0;
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
  function knopf(text, klasse, fn) {
    var b = el('button', { type: 'button', class: 'k-btn k-btn--small ' + (klasse || 'k-btn--ghost'), text: text });
    b.addEventListener('click', fn);
    return b;
  }
  function regler(text, einheit, min, max, schritt, wert, fn) {
    var id = 'v01-r' + (++nr);
    var aus = el('output', { for: id, text: zahl(wert) + ' ' + einheit });
    var inp = el('input', { type: 'range', id: id, min: String(min), max: String(max), step: String(schritt), value: String(wert) });
    inp.addEventListener('input', function () { aus.textContent = zahl(Number(inp.value)) + ' ' + einheit; fn(Number(inp.value)); });
    return el('div', { class: 'k-field' }, [el('label', { for: id }, [text + ': ', aus]), inp]);
  }

  /* ── 1. Eingabe, Verarbeitung, Ausgabe ────────────────────── */
  function initEva(host) {
    var betrag = 40, prozent = 10;
    host.textContent = '';
    var rechnung = el('p', { class: 'v01-eva__zeile' }), summe = el('p', { class: 'v01-eva__zeile' });
    var ausT = el('p', { class: 'v01-eva__aus' }), ausG = el('p', { class: 'v01-eva__aus' });
    function zeige() {
      var t = trinkgeld(betrag, prozent), g = gesamt(betrag, prozent);
      rechnung.textContent = 'trinkgeld = ' + zahl(betrag) + ' · ' + zahl(prozent) + ' / 100 = ' + zahl(t);
      summe.textContent = 'gesamt = ' + zahl(betrag) + ' + ' + zahl(t) + ' = ' + zahl(g);
      ausT.textContent = 'Trinkgeld: ' + euro(t) + ' €';
      ausG.textContent = 'Zu zahlen: ' + euro(g) + ' €';
    }
    var spalte = function (titel, art, kinder, live) {
      var s = el('div', { class: 'v01-eva__teil v01-eva__teil--' + art }, [el('h4', { text: titel })].concat(kinder));
      if (live) { s.setAttribute('role', 'status'); s.setAttribute('aria-live', 'polite'); }
      return s;
    };
    host.appendChild(el('div', { class: 'v01-eva' }, [
      spalte('Eingabe', 'ein', [
        regler('Rechnungsbetrag', '€', 5, 150, 5, betrag, function (v) { betrag = v; zeige(); }),
        regler('Trinkgeld', '%', 0, 20, 1, prozent, function (v) { prozent = v; zeige(); })
      ]),
      el('span', { class: 'v01-eva__pfeil', 'aria-hidden': 'true', text: '→' }),
      spalte('Verarbeitung', 'tun', [rechnung, summe]),
      el('span', { class: 'v01-eva__pfeil', 'aria-hidden': 'true', text: '→' }),
      spalte('Ausgabe', 'aus', [ausT, ausG], true)
    ]));
    zeige();
  }

  /* ── 2. Programmablaufplan Schritt für Schritt ────────────── */
  function initPapschritt(host) {
    var K = window.KursPAP;
    if (!K) { host.textContent = 'Der Programmablaufplan konnte nicht geladen werden.'; return; }
    var P = K.P || K;
    var betrag = 40, prozent = 10, pos = 0;
    var spec = [P.start('s'), P.io('Eingabe: betrag', 'e1'), P.io('Eingabe: prozent', 'e2'),
      P.op('trinkgeld = betrag · prozent / 100', 'r1', { wrapAt: 40 }), P.op('gesamt = betrag + trinkgeld', 'r2', { wrapAt: 40 }),
      P.io('Ausgabe: trinkgeld, gesamt', 'a1', { wrapAt: 40 }), P.end('e')];
    host.textContent = '';
    var plan = el('div', { class: 'pap-wrap v01-pap__plan' });
    plan.innerHTML = K.svg(spec, { label: 'Programmablaufplan des Trinkgeld-Rechners', cls: 'pap--run', minw: 0.85 });
    var symbol = el('p', { class: 'v01-pap__symbol' }), text = el('p', { class: 'v01-pap__text' });
    var tabelle = el('tbody');
    var zaehler = el('span', { class: 'k-small k-muted' });
    var zurueck = knopf('Zurück', '', function () { geh(pos - 1); });
    var weiter = knopf('Nächster Schritt', 'k-btn--primaer', function () { geh(pos + 1); });
    weiter.className = 'k-btn k-btn--small';
    var neu = knopf('Von vorn', 'k-btn--link', function () { geh(0); });
    host.appendChild(el('div', { class: 'v01-pap' }, [
      plan,
      el('div', { class: 'v01-pap__seite' }, [
        el('div', { class: 'v01-pap__erkl', role: 'status', 'aria-live': 'polite' }, [symbol, text]),
        el('table', { class: 'k-types v01-pap__werte' }, [
          el('caption', { class: 'k-sr', text: 'Werte der Variablen nach diesem Schritt' }),
          el('thead', {}, [el('tr', {}, [el('th', { scope: 'col', text: 'Name' }), el('th', { scope: 'col', text: 'Wert' })])]),
          tabelle
        ]),
        el('div', { class: 'k-controls' }, [zurueck, weiter, neu, zaehler])
      ])
    ]));
    function geh(n) {
      var schritte = planSchritte(betrag, prozent);
      pos = Math.max(0, Math.min(schritte.length - 1, n));
      var s = schritte[pos];
      Array.prototype.forEach.call(plan.querySelectorAll('.pap-n'), function (k) {
        var i = schritte.map(function (x) { return x.id; }).indexOf(k.getAttribute('data-id'));
        k.classList.toggle('is-active', i === pos);
        k.classList.toggle('is-done', i >= 0 && i < pos);
      });
      Array.prototype.forEach.call(plan.querySelectorAll('.pap-e'), function (k) {
        var ziel = schritte.map(function (x) { return x.id; }).indexOf(k.getAttribute('data-to'));
        k.classList.toggle('is-on', ziel === pos);
        k.classList.toggle('is-past', ziel >= 0 && ziel < pos);
      });
      symbol.textContent = SYMBOL[s.art];
      text.textContent = s.text;
      tabelle.textContent = '';
      var werte = [];
      schritte.slice(0, pos + 1).forEach(function (x) { if (x.setze) werte.push(x.setze); });
      if (!werte.length) tabelle.appendChild(el('tr', {}, [el('td', { colspan: '2', class: 'k-muted', text: 'Noch ist nichts gemerkt.' })]));
      werte.forEach(function (w, i) {
        tabelle.appendChild(el('tr', { class: i === werte.length - 1 && s.setze ? 'is-neu' : '' }, [el('th', { scope: 'row' }, [el('code', { class: 'k-i', text: w[0] })]), el('td', { text: zahl(w[1]) })]));
      });
      zaehler.textContent = 'Schritt ' + (pos + 1) + ' von ' + schritte.length;
      zurueck.disabled = pos === 0;
      weiter.disabled = pos === schritte.length - 1;
    }
    /* Ein Klick auf ein Symbol springt zu diesem Schritt */
    plan.addEventListener('click', function (e) {
      var k = e.target.closest ? e.target.closest('.pap-n') : null;
      if (!k) return;
      var i = planSchritte(betrag, prozent).map(function (x) { return x.id; }).indexOf(k.getAttribute('data-id'));
      if (i >= 0) geh(i);
    });
    geh(0);
  }

  /* ── 3. Variablen als Schachteln ──────────────────────────── */
  function initSchachteln(host) {
    var werte = { a: undefined, b: undefined }, verlauf = [];
    host.textContent = '';
    var boxen = {};
    var reihe = el('div', { class: 'v01-box__reihe' }, ['a', 'b'].map(function (n) {
      var wert = el('span', { class: 'v01-box__wert' });
      boxen[n] = wert;
      return el('div', { class: 'v01-box' }, [el('span', { class: 'v01-box__name' }, [el('code', { class: 'k-i', text: n })]), wert]);
    }));
    var meldung = el('p', { class: 'v01-box__meldung', role: 'status', 'aria-live': 'polite' });
    var programm = el('ol', { class: 'v01-box__programm' });
    var leer = el('p', { class: 'k-small k-muted', text: 'Dein Programm ist noch leer. Klick auf eine Zeile.' });
    function zeige(geaendert) {
      ['a', 'b'].forEach(function (n) {
        boxen[n].textContent = werte[n] === undefined ? 'leer' : String(werte[n]);
        boxen[n].parentNode.classList.toggle('is-leer', werte[n] === undefined);
        boxen[n].parentNode.classList.toggle('is-neu', n === geaendert);
      });
      programm.textContent = '';
      verlauf.forEach(function (c) { programm.appendChild(el('li', {}, [el('code', { class: 'k-i', text: c })])); });
      leer.hidden = verlauf.length > 0;
    }
    var knoepfe = el('div', { class: 'k-controls v01-box__zeilen', role: 'group', 'aria-label': 'Zeile ausführen' }, ZUWEISUNGEN.map(function (z) {
      var b = knopf(z.code, '', function () {
        var r = zuweisen(werte, z);
        if (r.fehler) { meldung.textContent = r.fehler; meldung.classList.add('is-fehler'); return; }
        werte = r.werte; verlauf.push(z.code);
        meldung.classList.remove('is-fehler');
        meldung.textContent = z.code + '  →  ' + r.text;
        zeige(z.ziel);
      });
      b.classList.add('v01-box__zeile');
      return b;
    }));
    var neu = knopf('Von vorn', 'k-btn--link', function () {
      werte = { a: undefined, b: undefined }; verlauf = [];
      meldung.classList.remove('is-fehler');
      meldung.textContent = 'Beide Schachteln sind wieder leer.';
      zeige(null);
    });
    host.appendChild(el('div', { class: 'v01-boxen' }, [
      el('div', {}, [reihe, meldung]),
      el('div', {}, [el('p', { class: 'v01-box__titel', text: 'Zeile ausführen' }), knoepfe, el('p', { class: 'v01-box__titel', text: 'Dein Programm bisher' }), leer, programm, neu])
    ]));
    zeige(null);
    meldung.textContent = 'Beide Schachteln sind leer. Welche Zeile geht als erste?';
  }

  function init() {
    var map = { eva: initEva, papschritt: initPapschritt, schachteln: initSchachteln };
    Object.keys(map).forEach(function (k) {
      Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="' + k + '"]'), function (host) {
        if (host._v01) return;
        host._v01 = true;
        map[k](host);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
