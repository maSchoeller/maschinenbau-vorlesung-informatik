/* =============================================================
   explorables-v08.js – interaktive Bausteine für Termin 08 (Zahl oder Text, lokale Namen, Funktionen mit Antwort)
     data-explorable="umwandler" „Umwandler“: Teil 1 int, float, str auf 5, "5" oder 3.7 anwenden (Ausgabe und Typ);
                                 Teil 2 zwei Werte mit + zusammensetzen, je als Zahl oder als Text (bei Text plus Zahl die Meldung von Python)
     data-explorable="raeume"   „Zwei Räume“: Programm A (quadrat, NameError draußen) oder B (x an zwei Plätzen) Schritt für Schritt,
                                 Kasten für das Hauptprogramm und, solange die Funktion läuft, ein zweiter Kasten
     data-explorable="kette"    „Aufrufkette“: sieger(summe) ruft ist_gerade, Stapel aus bis zu drei Kästen, Summe 5, 7, 8 oder 10
   Eigenständig wie alle explorables-vNN.js: keine Bibliothek, Texte per textContent.
   Der Rechenkern steht oben und ist ohne Browser prüfbar (module.exports, app/skripte/tests/explorables-v08.test.mjs).
   Die Werte des Umwandlers sind eine feste Tabelle der Python-Ergebnisse (JavaScript schreibt 5.0 als 5, deshalb wird nicht gerechnet).
   Die Schrittlisten von raeume und kette sind fest; die Zeilenfolgen sind mit sys.settrace in Python 3.13 nachgeprüft.
   Im Ausgangszustand steht keine Lösung: Ergebnisse, Kästen und Meldungen erscheinen erst nach dem Ausprobieren.
   Meldungstexte ohne Gedankenstrich. Zustand steht immer auch als Wort, Zeichen oder Linienstärke da, nie nur als Farbe.
   ============================================================= */
(function () {
  'use strict';

  var NICHTS = 'Noch nichts ausgeführt. Vermute, wähle und drück auf Ausführen.';

  /* ── Rechenkern: Umwandler ────────────────────────────────── */
  /* Werte zur Auswahl (so, wie sie im Code stehen) */
  var UMW_WERTE = ['5', '"5"', '3.7'];
  var UMW_FUNKTIONEN = ['int', 'float', 'str'];
  /* Python 3.13: print(f(w)) ergibt aus, type(f(w)).__name__ ergibt typ, repr(f(w)) ergibt wert */
  var UMW = {
    '5|int': { aus: '5', typ: 'int', wert: '5' },
    '5|float': { aus: '5.0', typ: 'float', wert: '5.0' },
    '5|str': { aus: '5', typ: 'str', wert: "'5'" },
    '"5"|int': { aus: '5', typ: 'int', wert: '5' },
    '"5"|float': { aus: '5.0', typ: 'float', wert: '5.0' },
    '"5"|str': { aus: '5', typ: 'str', wert: "'5'" },
    '3.7|int': { aus: '3', typ: 'int', wert: '3' },
    '3.7|float': { aus: '3.7', typ: 'float', wert: '3.7' },
    '3.7|str': { aus: '3.7', typ: 'str', wert: "'3.7'" }
  };
  function umwandle(wert, fn) {
    var e = UMW[wert + '|' + fn];
    if (!e) return null;
    return { zeile: 'print(' + fn + '(' + wert + '))', ausgabe: e.aus, typ: e.typ, wert: e.wert, fehler: '' };
  }
  function satzUmwandle(r) {
    return r.zeile + ' zeigt ' + r.ausgabe + '. Der Typ des Ergebnisses ist ' + r.typ + '.';
  }
  /* Teil 2: erste Zahl 5 oder "5", zweite 3 oder "3" */
  var SUM_ERSTE = ['5', '"5"'];
  var SUM_ZWEITE = ['3', '"3"'];
  var MELDUNG_ABBRUCH = 'Das Programm bricht in dieser Zeile ab.';
  var SUM = {
    '5|3': { aus: '8', fehler: '' },
    '"5"|"3"': { aus: '53', fehler: '' },
    '5|"3"': { aus: '', fehler: "TypeError: unsupported operand type(s) for +: 'int' and 'str'" },
    '"5"|3': { aus: '', fehler: 'TypeError: can only concatenate str (not "int") to str' }
  };
  function summe(a, b) {
    var e = SUM[a + '|' + b];
    if (!e) return null;
    return { zeile: 'print(' + a + ' + ' + b + ')', ausgabe: e.aus, fehler: e.fehler, abbruch: e.fehler ? MELDUNG_ABBRUCH : '' };
  }
  function satzSumme(r) {
    return r.fehler ? r.zeile + ' meldet ' + r.fehler + '. ' + MELDUNG_ABBRUCH : r.zeile + ' zeigt ' + r.ausgabe + '.';
  }

  /* ── Rechenkern: Läufe mit Kästen (raeume und kette) ──────── */
  /* Programmzeile: ein = Einrückung, ausf = erzeugt ein Zeilenereignis (def, Rechnung, return, print; nicht else und Leerzeile) */
  function zl(ein, text, ausf) { return { ein: ein, text: text, ausf: !!ausf }; }
  /* Schritt: zeile (1-basiert), satz, stapel (Kästen von unten nach oben), pfeil (Rückgabewert unterwegs), ausgabe, meldung, rechnung */
  function kasten(titel, vars) { return { titel: titel, vars: vars || [] }; }
  function hauptK(vars) { return kasten('Hauptprogramm', vars); }
  function schr(zeile, satz, stapel, extra) {
    var s = { zeile: zeile, satz: satz, stapel: stapel, pfeil: null, ausgabe: undefined, meldung: '', rechnung: '' };
    Object.keys(extra || {}).forEach(function (k) { s[k] = extra[k]; });
    return s;
  }

  var RAEUME_NAMEN = ['A', 'B'];
  var RAEUME_TEXT = { A: 'Programm A', B: 'Programm B' };
  var MELDUNG_NAMEERROR = "NameError: name 'ergebnis' is not defined";
  function raeumeProgramm(id) {
    if (id === 'A') {
      return [zl(0, 'def quadrat(x):', 1), zl(1, 'ergebnis = x * x', 1), zl(1, 'return ergebnis', 1), zl(0, '', 0),
        zl(0, 'zahl = quadrat(4)', 1), zl(0, 'print(zahl)', 1), zl(0, 'print(ergebnis)', 1)];
    }
    return [zl(0, 'def verdoppeln(x):', 1), zl(1, 'x = x * 2', 1), zl(1, 'return x', 1), zl(0, '', 0),
      zl(0, 'x = 5', 1), zl(0, 'y = verdoppeln(x)', 1), zl(0, 'print(x)', 1), zl(0, 'print(y)', 1)];
  }
  function raeumeSchritte(id) {
    if (id === 'A') {
      return [
        schr(1, 'Zeile 1: Die Funktion quadrat wird bekannt gemacht. Sie läuft noch nicht.', [hauptK()]),
        schr(5, 'Zeile 5: Der Aufruf quadrat(4) startet die Funktion. Sie bekommt einen eigenen Kasten, darin der Parameter x mit dem Wert 4.',
          [hauptK(), kasten('quadrat', [['x', '4']])]),
        schr(2, 'Zeile 2: In der Funktion bekommt ergebnis den Wert 16. Der Name entsteht im Kasten von quadrat.',
          [hauptK(), kasten('quadrat', [['x', '4'], ['ergebnis', '16']])]),
        schr(3, 'Zeile 3: return gibt 16 zurück. Die Funktion ist fertig, ihr Kasten ist weg, mit x und ergebnis.',
          [hauptK()], { pfeil: '16' }),
        schr(5, 'Zeile 5: Der zurückgegebene Wert wird im Hauptprogramm in zahl gespeichert. zahl ist 16.',
          [hauptK([['zahl', '16']])]),
        schr(6, 'Zeile 6: print(zahl) zeigt 16.', [hauptK([['zahl', '16']])], { ausgabe: '16' }),
        schr(7, 'Zeile 7: print(ergebnis) sucht den Namen ergebnis im Hauptprogramm. Dort steht nur zahl. Das Programm bricht hier ab.',
          [hauptK([['zahl', '16']])], { meldung: MELDUNG_NAMEERROR })
      ];
    }
    return [
      schr(1, 'Zeile 1: Die Funktion verdoppeln wird bekannt gemacht. Sie läuft noch nicht.', [hauptK()]),
      schr(5, 'Zeile 5: Im Hauptprogramm bekommt x den Wert 5.', [hauptK([['x', '5']])]),
      schr(6, 'Zeile 6: Der Aufruf verdoppeln(x) startet die Funktion. Sie bekommt einen eigenen Kasten, darin der Parameter x mit dem Wert 5.',
        [hauptK([['x', '5']]), kasten('verdoppeln', [['x', '5']])]),
      schr(2, 'Zeile 2: In der Funktion wird ihr eigenes x auf 10 gesetzt. Das x im Hauptprogramm ist ein anderer Platz.',
        [hauptK([['x', '5']]), kasten('verdoppeln', [['x', '10']])]),
      schr(3, 'Zeile 3: return gibt 10 zurück. Die Funktion ist fertig, ihr Kasten ist weg.',
        [hauptK([['x', '5']])], { pfeil: '10' }),
      schr(6, 'Zeile 6: Der zurückgegebene Wert wird im Hauptprogramm in y gespeichert. y ist 10.',
        [hauptK([['x', '5'], ['y', '10']])]),
      schr(7, 'Zeile 7: print(x) zeigt das x aus dem Hauptprogramm: 5.', [hauptK([['x', '5'], ['y', '10']])], { ausgabe: '5' }),
      schr(8, 'Zeile 8: print(y) zeigt 10.', [hauptK([['x', '5'], ['y', '10']])], { ausgabe: '10' })
    ];
  }

  var KETTE_SUMMEN = [5, 7, 8, 10];
  var KETTE_START = 7;
  function ketteProgramm(n) {
    return [zl(0, 'def ist_gerade(n):', 1), zl(1, 'if n % 2 == 0:', 1), zl(2, 'return True', 1), zl(1, 'else:', 0), zl(2, 'return False', 1),
      zl(0, '', 0), zl(0, 'def sieger(summe):', 1), zl(1, 'if ist_gerade(summe):', 1), zl(2, 'return "Anna"', 1), zl(1, 'else:', 0),
      zl(2, 'return "Ben"', 1), zl(0, '', 0), zl(0, 'print(sieger(' + n + '))', 1)];
  }
  function ketteGerade(n) { return n % 2 === 0; }
  function ketteSchritte(n) {
    var gerade = ketteGerade(n), rest = n % 2, N = String(n);
    var h = hauptK(), sg = kasten('sieger', [['summe', N]]), ig = kasten('ist_gerade', [['n', N]]);
    var rechnung = N + ' % 2 ist ' + rest + '. ' + (gerade ? 'Der Rest ist 0, der Vergleich mit 0 stimmt.' : 'Der Rest ist nicht 0.');
    var ergebnis = gerade ? 'True' : 'False', name = gerade ? 'Anna' : 'Ben';
    var igMit = kasten('ist_gerade', [['n', N]]); igMit.rechnung = rechnung;
    return [
      schr(1, 'Zeile 1: Die Funktion ist_gerade wird bekannt gemacht. Sie läuft noch nicht.', [h]),
      schr(7, 'Zeile 7: Die Funktion sieger wird bekannt gemacht. Sie läuft noch nicht.', [h]),
      schr(13, 'Zeile 13: Der Aufruf sieger(' + N + ') startet die Funktion. Sie bekommt einen Kasten, darin summe mit dem Wert ' + N + '.', [h, sg]),
      schr(8, 'Zeile 8: sieger ruft ist_gerade(summe) auf. Der Wert ' + N + ' geht in einen neuen Kasten, darin n mit dem Wert ' + N + '.', [h, sg, ig]),
      schr(2, 'Zeile 2: ' + rechnung + ' Die Bedingung ergibt ' + ergebnis + '.', [h, sg, igMit], { rechnung: rechnung }),
      schr(gerade ? 3 : 5, 'Zeile ' + (gerade ? 3 : 5) + ': return ' + ergebnis + '. ist_gerade ist fertig, ihr Kasten ist weg. Der Wert ' + ergebnis + ' geht zurück an sieger.', [h, sg], { pfeil: ergebnis }),
      schr(gerade ? 9 : 11, 'Zeile ' + (gerade ? 9 : 11) + ': return "' + name + '". sieger ist fertig, ihr Kasten ist weg.', [h], { pfeil: '"' + name + '"' }),
      schr(13, 'Zeile 13: print zeigt ' + name + '.', [h], { ausgabe: name })
    ];
  }

  /* Zustand nach p Schritten (für beide Läufe) */
  function laufStand(programm, steps, p) {
    var aus = [], gelaufen = {}, i, last = null;
    for (i = 0; i < p && i < steps.length; i++) {
      var s = steps[i];
      if (s.ausgabe !== undefined) aus.push(s.ausgabe);
      gelaufen[s.zeile] = true; last = s;
    }
    var fertig = p >= steps.length, grau = [];
    if (fertig) programm.forEach(function (z, k) { if (z.ausf && !gelaufen[k + 1]) grau.push(k + 1); });
    return {
      aktiv: last ? last.zeile : 0, satz: last ? last.satz : '', stapel: last ? last.stapel : [], pfeil: last ? last.pfeil : null,
      meldung: last ? last.meldung : '', ausgabe: aus, fertig: fertig, gesamt: steps.length, grau: grau
    };
  }
  function raeumeStand(id, p) { return laufStand(raeumeProgramm(id), raeumeSchritte(id), p); }
  function ketteStand(n, p) { return laufStand(ketteProgramm(n), ketteSchritte(n), p); }
  function maxKaesten(steps) { return steps.reduce(function (m, s) { return Math.max(m, s.stapel.length); }, 0); }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      NICHTS: NICHTS, UMW_WERTE: UMW_WERTE, UMW_FUNKTIONEN: UMW_FUNKTIONEN, UMW: UMW, umwandle: umwandle, satzUmwandle: satzUmwandle,
      SUM_ERSTE: SUM_ERSTE, SUM_ZWEITE: SUM_ZWEITE, SUM: SUM, summe: summe, satzSumme: satzSumme, MELDUNG_ABBRUCH: MELDUNG_ABBRUCH,
      RAEUME_NAMEN: RAEUME_NAMEN, raeumeProgramm: raeumeProgramm, raeumeSchritte: raeumeSchritte, raeumeStand: raeumeStand, MELDUNG_NAMEERROR: MELDUNG_NAMEERROR,
      KETTE_SUMMEN: KETTE_SUMMEN, KETTE_START: KETTE_START, ketteProgramm: ketteProgramm, ketteSchritte: ketteSchritte, ketteStand: ketteStand,
      laufStand: laufStand, maxKaesten: maxKaesten
    };
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
  function aktion(text, leise) { return el('button', { type: 'button', class: 'v08-aktion' + (leise ? ' v08-aktion--leise' : ''), text: text }); }
  function sperre(b, aus) { b.setAttribute('aria-disabled', aus ? 'true' : 'false'); b.classList.toggle('is-aus', !!aus); }
  /* Auswahl mit einem Wert (Radio-Knöpfe), Pfeiltasten wechseln. optionen: [{wert, text}], fn bekommt den Wert. */
  function wahl(label, optionen, start, fn) {
    var knoepfe = [], host = el('div', { class: 'v08-wahl', role: 'radiogroup', 'aria-label': label });
    optionen.forEach(function (o, k) {
      var b = el('button', { type: 'button', class: 'v08-knopf v08-wahl__knopf', role: 'radio', 'aria-checked': 'false', tabindex: '-1', text: o.text });
      b.addEventListener('click', function () { setze(o.wert); fn(o.wert); });
      b.addEventListener('keydown', function (e) {
        var d = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var i = (k + d + optionen.length) % optionen.length;
        setze(optionen[i].wert); fn(optionen[i].wert); knoepfe[i].focus();
      });
      knoepfe.push(b); host.appendChild(b);
    });
    function setze(w) {
      optionen.forEach(function (o, k) {
        var an = o.wert === w;
        knoepfe[k].setAttribute('aria-checked', an ? 'true' : 'false'); knoepfe[k].classList.toggle('is-an', an); knoepfe[k].tabIndex = an ? 0 : -1;
      });
    }
    setze(start);
    return { host: host, setze: setze };
  }

  /* ── umwandler ────────────────────────────────────────────── */
  function initUmwandler(host) {
    host.textContent = '';
    var w1 = '5', f1 = 'int', r1 = null, a2 = '5', b2 = '3', r2 = null;
    var codeOpt = function (liste) { return liste.map(function (x) { return { wert: x, text: x }; }); };
    var status = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });

    /* Teil 1 */
    var wahlW = wahl('Wert', codeOpt(UMW_WERTE), w1, function (w) { w1 = w; r1 = null; zeige1(true, 'Wert ' + w + '. '); });
    var wahlF = wahl('Funktion', codeOpt(UMW_FUNKTIONEN), f1, function (f) { f1 = f; r1 = null; zeige1(true, 'Funktion ' + f + '. '); });
    var los1 = aktion('Ausführen');
    los1.addEventListener('click', function () { r1 = umwandle(w1, f1); zeige1(true, ''); });
    var leer1 = el('p', { class: 'v08-hinweis', text: NICHTS });
    var erg1 = el('div', { class: 'v08-erg', hidden: '' });
    var zeile1 = el('p', { class: 'v08-code v08-erg__zeile' }), aus1 = el('p', { class: 'v08-erg__zeile' }), typ1 = el('p', { class: 'v08-erg__zeile' }), wert1 = el('p', { class: 'v08-erg__zeile' });
    [zeile1, aus1, typ1, wert1].forEach(function (x) { erg1.appendChild(x); });
    function zeige1(ansagen, vorsatz) {
      leer1.hidden = !!r1; erg1.hidden = !r1;
      if (r1) {
        zeile1.textContent = r1.zeile;
        aus1.textContent = 'Ausgabe: ' + r1.ausgabe;
        typ1.textContent = 'Typ des Ergebnisses: ' + r1.typ;
        wert1.textContent = 'Als Wert geschrieben: ' + r1.wert;
        erg1.classList.toggle('is-text', r1.typ === 'str');
      }
      if (ansagen) status.textContent = (vorsatz || '') + (r1 ? satzUmwandle(r1) : 'Noch nichts ausgeführt.');
    }

    /* Teil 2 */
    var wahlA = wahl('Erste Zahl', codeOpt(SUM_ERSTE), a2, function (a) { a2 = a; r2 = null; zeige2(true, 'Erster Wert ' + a + '. '); });
    var wahlB = wahl('Zweite Zahl', codeOpt(SUM_ZWEITE), b2, function (b) { b2 = b; r2 = null; zeige2(true, 'Zweiter Wert ' + b + '. '); });
    var los2 = aktion('Ausführen');
    los2.addEventListener('click', function () { r2 = summe(a2, b2); zeige2(true, ''); });
    var leer2 = el('p', { class: 'v08-hinweis', text: NICHTS });
    var erg2 = el('div', { class: 'v08-erg', hidden: '' });
    var zeile2 = el('p', { class: 'v08-code v08-erg__zeile' }), aus2 = el('p', { class: 'v08-erg__zeile' }), abbruch2 = el('p', { class: 'v08-erg__zeile' });
    [zeile2, aus2, abbruch2].forEach(function (x) { erg2.appendChild(x); });
    function zeige2(ansagen, vorsatz) {
      leer2.hidden = !!r2; erg2.hidden = !r2;
      if (r2) {
        zeile2.textContent = r2.zeile;
        aus2.textContent = r2.fehler ? r2.fehler : 'Ausgabe: ' + r2.ausgabe;
        aus2.classList.toggle('is-fehler', !!r2.fehler);
        abbruch2.textContent = r2.abbruch; abbruch2.hidden = !r2.abbruch;
        erg2.classList.toggle('is-fehler', !!r2.fehler);
      }
      if (ansagen) status.textContent = (vorsatz || '') + (r2 ? satzSumme(r2) : 'Noch nichts ausgeführt.');
    }

    zeige1(false); zeige2(false);
    host.appendChild(el('div', { class: 'v08-umwandler' }, [
      el('div', { class: 'v08-umwandler__teil' }, [
        el('p', { class: 'v08-titel', text: 'Umwandeln' }),
        el('p', { class: 'v08-label', text: 'Wert' }), wahlW.host,
        el('p', { class: 'v08-label', text: 'Funktion' }), wahlF.host,
        el('div', { class: 'v08-aktionen' }, [los1]), leer1, erg1
      ]),
      el('div', { class: 'v08-umwandler__teil' }, [
        el('p', { class: 'v08-titel', text: 'Zusammenrechnen' }),
        el('p', { class: 'v08-label', text: 'Erster Wert' }), wahlA.host,
        el('p', { class: 'v08-label', text: 'Zweiter Wert' }), wahlB.host,
        el('div', { class: 'v08-aktionen' }, [los2]), leer2, erg2
      ]),
      status
    ]));
  }

  /* ── Lauf mit Kästen (raeume und kette) ───────────────────── */
  function initLauf(host, cfg) {
    host.textContent = '';
    var wert = cfg.start, p = 0;
    var auswahl = wahl(cfg.label, cfg.optionen, wert, function (w) { wert = w; p = 0; zeige(true, cfg.text(w) + '. Das Programm steht am Anfang. '); });
    var einer = aktion('Ein Schritt'), zurueck = aktion('Von vorn', true);
    einer.addEventListener('click', function () { if (cfg.stand(wert, p).fertig) return; p++; zeige(true, ''); });
    zurueck.addEventListener('click', function () { if (p === 0) return; p = 0; zeige(true, 'Von vorn. '); });
    var codeEl = el('div', { class: 'v08-prog', role: 'region', 'aria-label': 'Das Programm, die aktive Zeile ist markiert', tabindex: '0' });
    var satzEl = el('p', { class: 'v08-jetzt' });
    var stapelEl = el('div', { class: 'v08-stapel', role: 'group', 'aria-label': cfg.stapelLabel });
    var pfeilEl = el('p', { class: 'v08-pfeil' });
    var ausEl = el('pre', { class: 'v08-ausgabe', tabindex: '0', 'aria-label': 'Ausgabe des Programms' });
    var meldEl = el('p', { class: 'v08-meldung', role: 'alert', hidden: '' });
    var status = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    function zeige(ansagen, vorsatz) {
      var s = cfg.stand(wert, p), prog = cfg.programm(wert);
      codeEl.textContent = '';
      prog.forEach(function (z, k) {
        var on = s.aktiv === k + 1, grau = s.grau.indexOf(k + 1) >= 0;
        var r = el('div', { class: 'v08-zeile' + (on ? ' is-jetzt' : '') + (grau ? ' is-grau' : '') }, [
          el('span', { class: 'v08-zeile__nr', 'aria-hidden': 'true', text: String(k + 1) }),
          el('span', { class: 'v08-zeile__text', text: new Array(z.ein + 1).join('    ') + z.text }),
          grau ? el('span', { class: 'v08-zeile__marke', text: 'lief nicht' }) : null
        ]);
        if (on) r.setAttribute('aria-current', 'true');
        codeEl.appendChild(r);
      });
      stapelEl.textContent = '';
      if (!s.stapel.length) stapelEl.appendChild(el('p', { class: 'v08-leer', text: cfg.leerText }));
      s.stapel.forEach(function (k, i) {
        var oben = i === s.stapel.length - 1 && s.stapel.length > 1;
        var inhalt = [el('p', { class: 'v08-kasten__titel', text: k.titel + (oben ? ' (läuft gerade)' : '') })];
        if (k.vars.length) {
          k.vars.forEach(function (v) { inhalt.push(el('p', { class: 'v08-kasten__zeile' }, [el('span', { class: 'v08-kasten__name', text: v[0] }), ' = ', el('span', { class: 'v08-kasten__wert', text: v[1] })])); });
        } else inhalt.push(el('p', { class: 'v08-kasten__zeile v08-kasten__zeile--leer', text: 'keine Namen' }));
        if (k.rechnung) inhalt.push(el('p', { class: 'v08-kasten__rechnung', text: 'Rechnung: ' + k.rechnung }));
        var box = el('div', { class: 'v08-kasten' + (oben ? ' is-oben' : ''), style: 'margin-left:' + (i * 20) + 'px' }, inhalt);
        stapelEl.appendChild(box);
      });
      pfeilEl.textContent = s.pfeil ? 'Rückgabewert unterwegs: ' + s.pfeil : '';
      pfeilEl.hidden = !s.pfeil;
      satzEl.textContent = p === 0 ? 'Noch nichts ist gelaufen. Drück auf „Ein Schritt“.' : 'Schritt ' + p + ' von ' + s.gesamt + ': ' + s.satz;
      ausEl.textContent = s.ausgabe.length ? s.ausgabe.join('\n') : 'noch nichts ausgegeben';
      ausEl.classList.toggle('is-leer', !s.ausgabe.length);
      meldEl.textContent = s.meldung; meldEl.hidden = !s.meldung;
      sperre(einer, s.fertig); sperre(zurueck, p === 0);
      if (ansagen) status.textContent = (vorsatz || '') + (p === 0 ? 'Das Programm steht am Anfang.' : s.satz + (s.meldung ? ' ' + s.meldung : ''));
    }
    zeige(false);
    host.appendChild(el('div', { class: 'v08-lauf' }, [
      el('div', { class: 'v08-lauf__links' }, [
        el('p', { class: 'v08-titel', text: cfg.titelWahl }), auswahl.host, codeEl, el('div', { class: 'v08-aktionen' }, [einer, zurueck])
      ]),
      el('div', { class: 'v08-lauf__rechts' }, [
        satzEl, el('p', { class: 'v08-titel', text: cfg.titelStapel }), stapelEl, pfeilEl,
        el('p', { class: 'v08-titel', text: 'Ausgabe' }), ausEl, meldEl, status
      ])
    ]));
  }
  function initRaeume(host) {
    initLauf(host, {
      start: 'A', label: 'Programm', titelWahl: 'Programm wählen', titelStapel: 'Die Namen, getrennt nach Räumen', stapelLabel: 'Die Kästen mit den Namen',
      leerText: 'Noch läuft nichts. Hier erscheinen die Namen des Hauptprogramms und der Funktion.',
      optionen: RAEUME_NAMEN.map(function (n) { return { wert: n, text: n === 'A' ? 'Programm A' : 'Programm B' }; }),
      text: function (w) { return 'Programm ' + w; }, programm: raeumeProgramm, stand: raeumeStand
    });
  }
  function initKette(host) {
    initLauf(host, {
      start: KETTE_START, label: 'Summe für sieger', titelWahl: 'Summe wählen', titelStapel: 'Der Stapel der laufenden Funktionen', stapelLabel: 'Die Kästen der laufenden Funktionen',
      leerText: 'Noch läuft nichts. Hier erscheinen die Kästen der laufenden Funktionen.',
      optionen: KETTE_SUMMEN.map(function (n) { return { wert: n, text: String(n) }; }),
      text: function (w) { return 'Summe ' + w; }, programm: ketteProgramm, stand: ketteStand
    });
  }

  function init() {
    var map = { umwandler: initUmwandler, raeume: initRaeume, kette: initKette };
    Object.keys(map).forEach(function (k) {
      Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="' + k + '"]'), function (host) {
        if (host._v08) return;
        host._v08 = true;
        map[k](host);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
