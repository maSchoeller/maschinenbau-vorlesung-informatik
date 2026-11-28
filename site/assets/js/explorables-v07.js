/* =============================================================
   explorables-v07.js – interaktive Bausteine für Termin 07 (Überlauf und Vorzeichen, Funktionen, Kommazahlen)
     data-explorable="kreis"    „Zahlenkreis“: Zähler mit 4 oder 8 Bit, +1, −1, Start setzen, Schalter „Mit Vorzeichen“ (nur bei 8 Bit);
                                Kreis mit Zeiger, die Zahl groß, die Bits in Vierergruppen, bei Überlauf „Python rechnet: 256“
     data-explorable="maschine" „Funktionsmaschine“: begruessen(name), quadrat(x), doppelt(x), ein Eingabefeld, Schalter „print statt return“,
                                Kiste mit Eingang und Ausgang, Programm mit aktiver Zeile, Tabelle für Parameter und Ergebnisvariable
     data-explorable="lupe"     „Kommazahl unter der Lupe“: zwei Zahlen addieren, so wie Python sie zeigt und mit 20 Nachkommastellen,
                                Ampel genau / nicht genau, == und round(…, 2) ==; zehnmal 0.1 aufsummieren, Schritt für Schritt
   Eigenständig wie alle explorables-vNN.js: keine Bibliothek, Texte per textContent.
   Der Rechenkern steht oben und ist ohne Browser prüfbar (module.exports, app/skripte/tests/explorables-v07.test.mjs).
   Der Zahlenkreis rechnet selbst, es gibt keine Rechenregel zum Umrechnen. Die Werte der Kommazahlen sind die von Python.
   Im Ausgangszustand steht keine Lösung: Ergebnisse erscheinen erst nach dem Ausprobieren.
   Meldungstexte ohne Gedankenstrich. Zustand steht immer auch als Wort, Zeichen oder Linienstärke da, nie nur als Farbe.
   ============================================================= */
(function () {
  'use strict';

  var MINUS = '−';
  function klemme(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
  /* Zahl für die Anzeige: Minuszeichen statt Bindestrich */
  function zahlText(n) { return n < 0 ? MINUS + String(-n) : String(n); }
  /* In Code-Zeilen steht der ASCII-Bindestrich, nicht das typografische Minus */
  function codeZahl(n) { return String(n); }
  function ganz(text) {
    var t = String(text === undefined || text === null ? '' : text).trim().replace(/−/g, '-');
    return /^-?\d+$/.test(t) ? Number(t) : null;
  }

  /* ── Rechenkern: Zahlenkreis (ohne DOM) ───────────────────── */
  var BITS = [4, 8];
  function anzahl(bits) { return Math.pow(2, bits); }
  /* Mit Vorzeichen gibt es nur bei 8 Bit */
  function vzErlaubt(bits) { return bits === 8; }
  function bereich(bits, mitVz) {
    var n = anzahl(bits);
    return mitVz && vzErlaubt(bits) ? { min: -n / 2, max: n / 2 - 1 } : { min: 0, max: n - 1 };
  }
  /* Was die Bits (als Zahl u von 0 bis 2^bits − 1) bedeuten */
  function lesen(u, bits, mitVz) {
    var n = anzahl(bits);
    return (mitVz && vzErlaubt(bits) && u >= n / 2) ? u - n : u;
  }
  /* Umgekehrt: welche Bits gehören zu einer Zahl im Bereich */
  function bitsVon(wert, bits) { return wert < 0 ? wert + anzahl(bits) : wert; }
  function ziffern(u, bits) { var s = u.toString(2); while (s.length < bits) s = '0' + s; return s; }
  function gruppen(u, bits) { var s = ziffern(u, bits), g = []; for (var i = 0; i < s.length; i += 4) g.push(s.substr(i, 4)); return g; }
  function bitsText(u, bits) { return gruppen(u, bits).join(' '); }
  function istNegativ(u, bits, mitVz) { return lesen(u, bits, mitVz) < 0; }

  function zustand(bits, mitVz, u) { return { bits: bits, mitVz: !!(mitVz && vzErlaubt(bits)), u: u }; }
  /* Startwerte, die nicht schon der Überlauf sind: weit genug vor dem Rand, damit man ein paarmal zählen muss */
  function startZustand(bits, mitVz) { return zustand(bits, mitVz, bits === 8 ? 250 : 13); }

  /* Ein Schritt (+1 oder −1): neuer Zustand, bei Überlauf die Meldung dazu */
  function schritt(z, d) {
    var n = anzahl(z.bits), r = bereich(z.bits, z.mitVz);
    var alt = lesen(z.u, z.bits, z.mitVz), python = alt + d;
    var u = ((z.u + d) % n + n) % n, neu = lesen(u, z.bits, z.mitVz);
    var ueberlauf = python < r.min || python > r.max;
    var rechnung = zahlText(alt) + (d > 0 ? ' + 1' : ' ' + MINUS + ' 1');
    return {
      zustand: zustand(z.bits, z.mitVz, u), alt: alt, neu: neu, ueberlauf: ueberlauf,
      zeile1: ueberlauf ? 'Überlauf: ' + rechnung + ' ergibt ' + zahlText(neu) : '',
      zeile2: ueberlauf ? 'Der Platz reicht nicht, der Zähler springt auf die andere Seite.' : '',
      satz: ueberlauf ? ('Überlauf: ' + rechnung + ' ergibt ' + zahlText(neu) + '. Der Platz reicht nicht, der Zähler springt auf die andere Seite.') : (rechnung + ' ergibt ' + zahlText(neu) + '.')
    };
  }
  /* Der Wechsel des Schalters: dieselben Bits, eine andere Lesart */
  function lesartWechsel(z, mitVzNeu) {
    var neu = zustand(z.bits, mitVzNeu, z.u);
    var vorher = lesen(z.u, z.bits, z.mitVz), jetzt = lesen(neu.u, neu.bits, neu.mitVz);
    return {
      zustand: neu, vorher: vorher, jetzt: jetzt, geaendert: vorher !== jetzt,
      satz: vorher === jetzt
        ? 'Dieselben Bits ' + bitsText(z.u, z.bits) + ', in beiden Lesarten ' + zahlText(jetzt) + '.'
        : 'Dieselben Bits ' + bitsText(z.u, z.bits) + ', andere Lesart: eben noch ' + zahlText(vorher) + ', jetzt ' + zahlText(jetzt) + '.'
    };
  }
  var MELDUNG_START = 'Schreib eine ganze Zahl im Bereich des Zählers.';
  function pruefeStart(text, bits, mitVz) {
    var r = bereich(bits, mitVz), n = ganz(text);
    if (n === null) return { ok: false, meldung: MELDUNG_START + ' Hier: ' + zahlText(r.min) + ' bis ' + r.max + '.' };
    if (n < r.min || n > r.max) return { ok: false, meldung: 'Der Zähler zeigt nur Zahlen von ' + zahlText(r.min) + ' bis ' + r.max + '.' };
    return { ok: true, zahl: n, u: bitsVon(n, bits) };
  }
  /* Ort auf dem Kreis: 0 oben, im Uhrzeigersinn; Winkel in Grad */
  function winkel(u, bits) { return 360 * u / anzahl(bits); }
  function punkt(u, bits, radius, mx, my) {
    var w = winkel(u, bits) * Math.PI / 180;
    return { x: mx + radius * Math.sin(w), y: my - radius * Math.cos(w) };
  }
  /* Beschriftete Stellen am Kreis: Viertel. Mit Vorzeichen fehlt die Beschriftung bei der Hälfte, dort wird nur abgelesen. */
  function marken(bits, mitVz) {
    var n = anzahl(bits), m = [], k;
    for (k = 0; k < 4; k++) {
      var u = n * k / 4;
      if (mitVz && k === 2) continue;
      m.push({ u: u, text: zahlText(lesen(u, bits, mitVz)) });
    }
    return m;
  }
  function ansichtKreis(z) {
    var w = lesen(z.u, z.bits, z.mitVz), r = bereich(z.bits, z.mitVz);
    return {
      wert: w, bits: bitsText(z.u, z.bits), ziffern: ziffern(z.u, z.bits), negativ: w < 0, bereich: r,
      satz: 'Der Zähler zeigt ' + zahlText(w) + '. Die Bits sind ' + bitsText(z.u, z.bits) + '. ' +
        (z.mitVz ? 'Lesart mit Vorzeichen.' : 'Lesart ohne Vorzeichen, der Bereich reicht von 0 bis ' + r.max + '.')
    };
  }

  /* ── Rechenkern: Funktionsmaschine ────────────────────────── */
  var FUNKTIONEN = {
    begruessen: { kopf: 'begruessen(name)', param: 'name', art: 'text', start: 'Tom' },
    quadrat: { kopf: 'quadrat(x)', param: 'x', art: 'zahl', start: '4', var: 'ergebnis', rumpf: 'x * x', rechne: function (n) { return n * n; } },
    doppelt: { kopf: 'doppelt(x)', param: 'x', art: 'zahl', start: '3', var: 'b', rumpf: 'x * 2', rechne: function (n) { return n * 2; } }
  };
  var NAMEN = ['begruessen', 'quadrat', 'doppelt'];
  var MELDUNG_NAME = 'Schreib einen Namen mit 1 bis 10 Buchstaben, ohne Anführungszeichen.';
  var MELDUNG_ZAHL = 'Schreib eine ganze Zahl von ' + MINUS + '99 bis 99.';
  function pruefeEingabe(f, text) {
    var t = String(text === undefined || text === null ? '' : text).trim();
    if (FUNKTIONEN[f].art === 'text') {
      if (!/^[A-Za-zÄÖÜäöüß]{1,10}$/.test(t)) return { ok: false, meldung: MELDUNG_NAME };
      return { ok: true, wert: t };
    }
    var n = ganz(t);
    if (n === null || n < -99 || n > 99) return { ok: false, meldung: MELDUNG_ZAHL };
    return { ok: true, wert: n };
  }
  /* Das Programm als Zeilen mit Einrückung. Bei begruessen sind es zwei Aufrufe, der erste mit "Lea", der zweite mit dem Eingabewert. */
  function programm(f, wert, mitPrint) {
    var F = FUNKTIONEN[f], z = [];
    if (f === 'begruessen') {
      z.push({ ein: 0, text: 'def begruessen(name):' });
      z.push({ ein: 1, text: 'print(f"Hallo {name}, viel Spaß!")' });
      z.push({ ein: 0, text: '' });
      z.push({ ein: 0, text: 'begruessen("Lea")' });
      z.push({ ein: 0, text: 'begruessen("' + wert + '")' });
      return z;
    }
    z.push({ ein: 0, text: 'def ' + F.kopf + ':' });
    z.push({ ein: 1, text: (mitPrint ? 'print(' + F.rumpf + ')' : 'return ' + F.rumpf) });
    z.push({ ein: 0, text: '' });
    if (f === 'quadrat') {
      z.push({ ein: 0, text: 'ergebnis = quadrat(' + codeZahl(wert) + ')' });
      z.push({ ein: 0, text: 'print(ergebnis)' });
    } else {
      z.push({ ein: 0, text: 'zahl = ' + codeZahl(wert) });
      z.push({ ein: 0, text: 'b = doppelt(zahl)' });
      z.push({ ein: 0, text: 'print(b)' });
    }
    return z;
  }
  /* Die Schritte. Jeder Schritt: aktiv (Zeilen), satz, setzt (Werte der Tabelle), ausgabe (neue Zeile), eingang, ausgang. */
  function schritte(f, wert, mitPrint) {
    var F = FUNKTIONEN[f], s = [];
    if (f === 'begruessen') {
      [['Lea', 3], ['' + wert, 4]].forEach(function (a, k) {
        var nm = a[0], zl = a[1];
        s.push({ aktiv: [zl], satz: (k === 0 ? 'Erster' : 'Zweiter') + ' Aufruf in Zeile ' + (zl + 1) + ': begruessen("' + nm + '") startet die Funktion.', setzt: {}, eingang: nm });
        s.push({ aktiv: [0], satz: 'Der Parameter name bekommt den Wert "' + nm + '".', setzt: { param: '"' + nm + '"' }, eingang: nm });
        s.push({ aktiv: [1], satz: 'Der Rumpf läuft: print zeigt den Gruß.', setzt: {}, ausgabe: 'Hallo ' + nm + ', viel Spaß!', eingang: nm, ausgang: 'Gruß angezeigt' });
      });
      return s;
    }
    var erg = F.rechne(wert), argTxt = zahlText(wert), ergTxt = zahlText(erg);
    var haupt = f === 'quadrat' ? 3 : 4, vor = f === 'doppelt';
    var kopfTxt = f + '(' + (vor ? 'zahl' : codeZahl(wert)) + ')';
    if (vor) s.push({ aktiv: [3], satz: 'Die Variable zahl bekommt den Wert ' + argTxt + '.', setzt: { zahl: argTxt }, eingang: '' });
    s.push({ aktiv: [haupt], satz: 'Aufruf in Zeile ' + (haupt + 1) + ': ' + kopfTxt + ' startet die Funktion. Der Wert ' + argTxt + ' geht in die Kiste.', setzt: {}, eingang: argTxt });
    s.push({ aktiv: [0], satz: 'Der Parameter x bekommt den Wert ' + argTxt + '.', setzt: { param: argTxt }, eingang: argTxt });
    s.push({ aktiv: [1], satz: 'Der Rumpf läuft: ' + F.rumpf.replace('x', argTxt).replace('x', argTxt) + ' ergibt ' + ergTxt + '.', setzt: {}, eingang: argTxt });
    if (mitPrint) {
      s.push({ aktiv: [1], satz: 'print zeigt ' + ergTxt + ' in der Ausgabe an. Zurück gibt die Funktion nichts.', setzt: {}, ausgabe: ergTxt, eingang: argTxt, ausgang: 'nichts' });
      s.push({ aktiv: [haupt], satz: 'Der Aufruf liefert nichts zurück. In ' + F.var + ' steht None.', setzt: { var: 'None' }, eingang: argTxt, ausgang: 'nichts' });
      s.push({ aktiv: [haupt + 1], satz: 'print(' + F.var + ') zeigt None.', setzt: {}, ausgabe: 'None', eingang: argTxt, ausgang: 'nichts' });
    } else {
      s.push({ aktiv: [1], satz: 'return gibt ' + ergTxt + ' zurück, an die Stelle des Aufrufs.', setzt: {}, eingang: argTxt, ausgang: ergTxt });
      s.push({ aktiv: [haupt], satz: 'Der zurückgegebene Wert landet in ' + F.var + ': ' + F.var + ' ist ' + ergTxt + '.', setzt: { var: ergTxt }, eingang: argTxt, ausgang: ergTxt });
      s.push({ aktiv: [haupt + 1], satz: 'print(' + F.var + ') zeigt ' + ergTxt + '.', setzt: {}, ausgabe: ergTxt, eingang: argTxt, ausgang: ergTxt });
    }
    return s;
  }
  /* Zustand nach p Schritten: Tabelle, Ausgabe, aktive Zeile, Kiste */
  function stand(f, wert, mitPrint, p) {
    var st = schritte(f, wert, mitPrint), t = { zahl: null, param: null, var: null }, aus = [], aktiv = [], satz = '', eingang = '', ausgang = '';
    for (var i = 0; i < p && i < st.length; i++) {
      var x = st[i];
      if (x.setzt.zahl !== undefined) t.zahl = x.setzt.zahl;
      if (x.setzt.param !== undefined) t.param = x.setzt.param;
      if (x.setzt.var !== undefined) t.var = x.setzt.var;
      if (x.ausgabe !== undefined) aus.push(x.ausgabe);
      aktiv = x.aktiv; satz = x.satz; eingang = x.eingang || ''; ausgang = x.ausgang || '';
    }
    return { tabelle: t, ausgabe: aus, aktiv: aktiv, satz: satz, eingang: eingang, ausgang: ausgang, fertig: p >= st.length, gesamt: st.length };
  }
  function spaltenKopf(f) {
    var F = FUNKTIONEN[f];
    if (f === 'begruessen') return [{ schluessel: 'param', text: 'name (in der Funktion)' }];
    var k = [];
    if (f === 'doppelt') k.push({ schluessel: 'zahl', text: 'zahl (Hauptprogramm)' });
    k.push({ schluessel: 'param', text: 'x (in der Funktion)' });
    k.push({ schluessel: 'var', text: F.var + ' (Hauptprogramm)' });
    return k;
  }

  /* ── Rechenkern: Kommazahlen ──────────────────────────────── */
  /* Zahlen zur Auswahl als Hundertstel; 25 und 75 für die Halben und Viertel */
  var WERTE = [10, 20, 30, 40, 50, 60, 70, 80, 90, 25, 75];
  function dezimal(h) { return h % 10 === 0 ? (h / 100).toFixed(1) : (h / 100).toFixed(2); }
  /* Anzeige der Zahl wie Python: float, immer mit Punkt; ganze Werte mit .0 */
  function pyText(x) {
    var s = String(x);
    return /^-?\d+$/.test(s) ? s + '.0' : s;
  }
  function zwanzig(x) { return x.toFixed(20); }
  /* Eine Addition: Werte wie Python (IEEE 754, doppelte Genauigkeit); erwartet wird die Summe so, wie man sie von Hand schreibt */
  function addiere(ha, hb) {
    var a = ha / 100, b = hb / 100, summe = a + b, erwartet = (ha + hb) / 100;
    var gleich = summe === erwartet, gerundet = Math.round(summe * 100) / 100;
    return {
      a: a, b: b, aText: dezimal(ha), bText: dezimal(hb), erwartetText: dezimal(ha + hb), summe: summe,
      summeText: pyText(summe), summe20: zwanzig(summe), a20: zwanzig(a), b20: zwanzig(b), erwartet20: zwanzig(erwartet),
      genau: gleich, gleich: gleich,
      rundenGleich: round2(summe) === erwartet, rundeText: pyText(round2(summe)),
      ampel: gleich ? 'genau' : 'nicht genau'
    };
  }
  function round2(x) { return Math.round(x * 100) / 100; }
  function satzAddition(r) {
    return r.aText + ' + ' + r.bText + ' zeigt Python als ' + r.summeText + '. Mit 20 Nachkommastellen: ' + r.summe20 + '. Die Summe ist ' + r.ampel +
      '. Der Vergleich == mit ' + r.erwartetText + ' ergibt ' + (r.gleich ? 'True' : 'False') + ', der Vergleich mit round(…, 2) ergibt ' + (r.rundenGleich ? 'True' : 'False') + '.';
  }
  /* Zehnmal 0.1 aufsummieren, ein elfter Schritt zeigt, dass x nie 1.0 trifft */
  var SCHRITTE_SUMME = 11;
  function summenfolge(n) {
    var x = 0.0, f = [];
    for (var i = 0; i < (n === undefined ? SCHRITTE_SUMME : n); i++) { x = x + 0.1; f.push({ nr: i + 1, x: x, text: pyText(x), text20: zwanzig(x), ungleich: x !== 1.0 }); }
    return f;
  }
  function satzSumme(f, p) {
    if (p === 0) return 'Noch kein Schritt. x ist 0.0.';
    var e = f[p - 1];
    var s = 'Schritt ' + p + ': x ist ' + e.text + '. Ist x != 1.0? ' + (e.ungleich ? 'Ja.' : 'Nein.');
    if (p === 10) s += ' Nach zehnmal 0.1 steht dort nicht 1.0.';
    if (p === f.length) s += ' Die Schleife while x != 1.0 würde nie enden.';
    return s;
  }
  var MELDUNG_GENAU = 'Genau heißt: Die Summe ist dieselbe Zahl wie die erwartete.';

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      MINUS: MINUS, klemme: klemme, zahlText: zahlText, codeZahl: codeZahl, ganz: ganz,
      BITS: BITS, anzahl: anzahl, vzErlaubt: vzErlaubt, bereich: bereich, lesen: lesen, bitsVon: bitsVon, ziffern: ziffern, gruppen: gruppen, bitsText: bitsText,
      istNegativ: istNegativ, zustand: zustand, startZustand: startZustand, schritt: schritt, lesartWechsel: lesartWechsel, pruefeStart: pruefeStart,
      winkel: winkel, punkt: punkt, marken: marken, ansichtKreis: ansichtKreis,
      FUNKTIONEN: FUNKTIONEN, NAMEN: NAMEN, pruefeEingabe: pruefeEingabe, programm: programm, schritte: schritte, stand: stand, spaltenKopf: spaltenKopf,
      WERTE: WERTE, dezimal: dezimal, pyText: pyText, zwanzig: zwanzig, addiere: addiere, round2: round2, satzAddition: satzAddition,
      SCHRITTE_SUMME: SCHRITTE_SUMME, summenfolge: summenfolge, satzSumme: satzSumme, MELDUNG_GENAU: MELDUNG_GENAU
    };
  }
  if (typeof document === 'undefined') return;

  /* ── DOM-Hilfen ───────────────────────────────────────────── */
  var nr = 0;
  var SVGNS = 'http://www.w3.org/2000/svg';
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
  function sv(tag, attrs, text) {
    var n = document.createElementNS(SVGNS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function aktion(text, leise) { return el('button', { type: 'button', class: 'v07-aktion' + (leise ? ' v07-aktion--leise' : ''), text: text }); }
  function sperre(b, aus) { b.setAttribute('aria-disabled', aus ? 'true' : 'false'); b.classList.toggle('is-aus', !!aus); }
  function schalterKnopf(text, fn) {
    var b = el('button', { type: 'button', class: 'v07-schalter', role: 'switch', 'aria-checked': 'false' });
    var z = el('span', { class: 'v07-schalter__zustand', 'aria-hidden': 'true' });
    b.appendChild(el('span', { class: 'v07-schalter__name', text: text }));
    b.appendChild(el('span', { class: 'v07-schalter__hebel', 'aria-hidden': 'true' }));
    b.appendChild(z);
    b.addEventListener('click', function () { if (b.getAttribute('aria-disabled') === 'true') return; fn(); });
    return { knopf: b, zustand: z };
  }
  function setzeSchalter(s, an, gesperrt) {
    s.knopf.setAttribute('aria-checked', an ? 'true' : 'false');
    s.knopf.setAttribute('aria-disabled', gesperrt ? 'true' : 'false');
    s.knopf.classList.toggle('is-an', !!an);
    s.knopf.classList.toggle('is-aus', !!gesperrt);
    s.zustand.textContent = an ? 'an' : 'aus';
  }
  /* Auswahl mit einem Wert (Radio-Knöpfe), Pfeiltasten wechseln */
  function wahl(label, optionen, fn) {
    var knoepfe = [], host = el('div', { class: 'v07-wahl', role: 'radiogroup', 'aria-label': label });
    optionen.forEach(function (o, k) {
      var b = el('button', { type: 'button', class: 'v07-knopf v07-wahl__knopf', role: 'radio', 'aria-checked': 'false', tabindex: k === 0 ? '0' : '-1', text: o.text });
      b.addEventListener('click', function () { setze(o.wert); fn(o.wert); });
      b.addEventListener('keydown', function (e) {
        var d = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var n = optionen[(k + d + optionen.length) % optionen.length];
        setze(n.wert); fn(n.wert); knoepfe[(k + d + optionen.length) % optionen.length].focus();
      });
      knoepfe.push(b); host.appendChild(b);
    });
    function setze(w) {
      optionen.forEach(function (o, k) {
        var an = o.wert === w;
        knoepfe[k].setAttribute('aria-checked', an ? 'true' : 'false'); knoepfe[k].classList.toggle('is-an', an); knoepfe[k].tabIndex = an ? 0 : -1;
      });
    }
    return { host: host, setze: setze };
  }

  /* ── kreis ────────────────────────────────────────────────── */
  function initKreis(host) {
    var id = 'v07-kreis-' + (++nr);
    var bits = 8, mitVz = false, z = startZustand(bits, mitVz), ueber = null, lesartSatz = '';
    host.textContent = '';
    var bitsWahl = wahl('Bits des Zählers', [{ wert: 4, text: '4 Bit' }, { wert: 8, text: '8 Bit' }], function (b) {
      bits = b; if (!vzErlaubt(bits)) mitVz = false; z = startZustand(bits, mitVz); ueber = null; lesartSatz = ''; setzeStartFeld(); zeige(true, bits + ' Bit. Der Zähler steht auf ' + zahlText(lesen(z.u, z.bits, z.mitVz)) + '. ');
    });
    bitsWahl.setze(bits);
    var vz = schalterKnopf('Mit Vorzeichen lesen', function () {
      if (!vzErlaubt(bits)) return;
      var w = lesartWechsel(z, !mitVz); mitVz = !mitVz; z = w.zustand; ueber = null; lesartSatz = w.satz; setzeStartFeld(); zeige(true, mitVz ? 'Mit Vorzeichen. ' : 'Ohne Vorzeichen. ');
    });
    var vzHinweis = el('p', { class: 'v07-hinweis k-small k-muted', text: 'Mit Vorzeichen gibt es den Schalter nur bei 8 Bit.' });
    var plus = aktion('+1'), minus = aktion(String.fromCharCode(0x2212) + '1');
    plus.setAttribute('aria-label', 'Plus 1'); minus.setAttribute('aria-label', 'Minus 1');
    plus.addEventListener('click', function () { gehe(1); });
    minus.addEventListener('click', function () { gehe(-1); });
    function gehe(d) { var r = schritt(z, d); z = r.zustand; ueber = r.ueberlauf ? r : null; lesartSatz = ''; zeige(true, r.satz + ' '); setzeStartFeld(); }
    var startFeld = el('input', { type: 'text', id: id + '-start', class: 'v07-feld v07-feld--eng', inputmode: 'numeric', autocomplete: 'off', spellcheck: 'false', 'aria-describedby': id + '-starthilfe' });
    var startMeld = el('p', { class: 'v07-meldung', role: 'alert', hidden: '' });
    var startHilfe = el('p', { id: id + '-starthilfe', class: 'k-small k-muted' });
    var startKnopf = aktion('Start setzen', true);
    function setzeStartFeld() { startFeld.value = String(lesen(z.u, z.bits, z.mitVz)).replace('-', MINUS); }
    function startSetzen() {
      var p = pruefeStart(startFeld.value, bits, mitVz);
      if (!p.ok) { startFeld.setAttribute('aria-invalid', 'true'); startMeld.textContent = p.meldung; startMeld.hidden = false; return; }
      startFeld.removeAttribute('aria-invalid'); startMeld.hidden = true;
      z = zustand(bits, mitVz, p.u); ueber = null; lesartSatz = ''; zeige(true, 'Start gesetzt. ');
    }
    startKnopf.addEventListener('click', startSetzen);
    startFeld.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); startSetzen(); } });
    startFeld.addEventListener('input', function () { startFeld.removeAttribute('aria-invalid'); startMeld.hidden = true; });
    var svg = sv('svg', { class: 'v07-kreis__svg', viewBox: '0 0 260 260', role: 'img' });
    var zahlEl = el('p', { class: 'v07-zahl' });
    var lesartEl = el('p', { class: 'v07-lesart' });
    var bitsEl = el('p', { class: 'v07-bits', 'aria-label': 'Die Bits in Vierergruppen' });
    var wechselEl = el('p', { class: 'v07-hinweis' });
    var ueberEl = el('div', { class: 'v07-ueber', role: 'group', 'aria-label': 'Überlauf', hidden: '' });
    var ueber1 = el('p', { class: 'v07-ueber__zeile' }), ueber2 = el('p', { class: 'v07-ueber__zeile v07-ueber__zeile--py' });
    ueberEl.appendChild(ueber1); ueberEl.appendChild(ueber2);
    var status = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    var MX = 130, MY = 130, R = 86;
    function baueKreis() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var n = anzahl(bits), k, p, q;
      var w = lesen(z.u, bits, mitVz);
      svg.setAttribute('aria-label', 'Zahlenkreis mit ' + n + ' Stellen. Der Zeiger steht bei ' + zahlText(w) + '.');
      if (mitVz) {
        /* rechte Hälfte (0 bis 127) positiv, linke Hälfte negativ, mit Wort */
        svg.appendChild(sv('path', { d: 'M ' + MX + ' ' + (MY - R) + ' A ' + R + ' ' + R + ' 0 0 1 ' + MX + ' ' + (MY + R), class: 'v07-ring v07-ring--pos', fill: 'none' }));
        svg.appendChild(sv('path', { d: 'M ' + MX + ' ' + (MY + R) + ' A ' + R + ' ' + R + ' 0 0 1 ' + MX + ' ' + (MY - R), class: 'v07-ring v07-ring--neg', fill: 'none' }));
        svg.appendChild(sv('text', { x: MX + 30, y: MY, class: 'v07-kreis__wort', 'text-anchor': 'middle' }, 'positiv'));
        svg.appendChild(sv('text', { x: MX - 30, y: MY, class: 'v07-kreis__wort', 'text-anchor': 'middle' }, 'negativ'));
      } else {
        svg.appendChild(sv('circle', { cx: MX, cy: MY, r: R, class: 'v07-ring', fill: 'none' }));
      }
      var schritt4 = n === 16 ? 1 : 4;
      for (k = 0; k < n; k += schritt4) {
        p = punkt(k, bits, R, MX, MY);
        if (n === 16) svg.appendChild(sv('circle', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: 4, class: 'v07-stelle' }));
        else { q = punkt(k, bits, R - 7, MX, MY); svg.appendChild(sv('line', { x1: p.x.toFixed(1), y1: p.y.toFixed(1), x2: q.x.toFixed(1), y2: q.y.toFixed(1), class: 'v07-strich' })); }
      }
      marken(bits, mitVz).forEach(function (m) {
        var t = punkt(m.u, bits, R + 24, MX, MY);
        svg.appendChild(sv('text', { x: t.x.toFixed(1), y: (t.y + 5).toFixed(1), class: 'v07-marke', 'text-anchor': 'middle' }, m.text));
      });
      p = punkt(z.u, bits, R, MX, MY);
      svg.appendChild(sv('line', { x1: MX, y1: MY, x2: p.x.toFixed(1), y2: p.y.toFixed(1), class: 'v07-zeiger' }));
      svg.appendChild(sv('circle', { cx: MX, cy: MY, r: 5, class: 'v07-nabe' }));
      svg.appendChild(sv('circle', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: 9, class: 'v07-spitze' + (w < 0 ? ' is-neg' : '') }));
    }
    function zeige(ansagen, vorsatz) {
      var a = ansichtKreis(z), r = bereich(bits, mitVz);
      baueKreis();
      zahlEl.textContent = zahlText(a.wert);
      zahlEl.classList.toggle('is-neg', a.negativ);
      lesartEl.textContent = mitVz ? ('mit Vorzeichen' + (a.negativ ? ', negativ' : ', nicht negativ')) : ('ohne Vorzeichen, 0 bis ' + r.max);
      bitsEl.textContent = a.bits;
      wechselEl.textContent = lesartSatz; wechselEl.hidden = !lesartSatz;
      ueberEl.hidden = !ueber;
      if (ueber) { ueber1.textContent = ueber.zeile1; ueber2.textContent = ueber.zeile2; }
      setzeSchalter(vz, mitVz, !vzErlaubt(bits));
      vzHinweis.hidden = vzErlaubt(bits);
      startHilfe.textContent = mitVz ? 'Erlaubt: eine ganze Zahl, die in 8 Bit passt.' : 'Erlaubt: ' + zahlText(r.min) + ' bis ' + r.max + '.';
      if (document.activeElement !== startFeld) setzeStartFeld();
      if (ansagen) status.textContent = (vorsatz || '') + a.satz + (lesartSatz ? ' ' + lesartSatz : '');
    }
    setzeStartFeld(); zeige(false);
    host.appendChild(el('div', { class: 'v07-kreis' }, [
      el('div', { class: 'v07-kreis__links' }, [
        el('p', { class: 'v07-titel', text: 'Zähler einstellen' }), bitsWahl.host,
        el('div', { class: 'v07-schalterreihe' }, [vz.knopf]), vzHinweis,
        el('div', { class: 'v07-aktionen' }, [minus, plus]),
        el('div', { class: 'v07-feldzeile' }, [el('label', { for: id + '-start', text: 'Start auf diese Zahl setzen' }), startFeld, startHilfe]),
        startKnopf, startMeld
      ]),
      el('div', { class: 'v07-kreis__rechts' }, [
        el('div', { class: 'v07-kreis__bild' }, [svg]),
        el('div', { class: 'v07-kreis__anzeige' }, [zahlEl, lesartEl, el('p', { class: 'v07-titel', text: 'Die Bits in Vierergruppen' }), bitsEl, wechselEl, ueberEl, status])
      ])
    ]));
  }

  /* ── maschine ─────────────────────────────────────────────── */
  function initMaschine(host) {
    var id = 'v07-masch-' + (++nr);
    var f = 'begruessen', eing = { begruessen: FUNKTIONEN.begruessen.start, quadrat: FUNKTIONEN.quadrat.start, doppelt: FUNKTIONEN.doppelt.start };
    var wert = pruefeEingabe(f, eing[f]).wert, mitPrint = false, p = 0;
    host.textContent = '';
    var auswahl = wahl('Funktion', NAMEN.map(function (n) { return { wert: n, text: FUNKTIONEN[n].kopf }; }), function (n) {
      f = n; if (f === 'begruessen') mitPrint = false;
      feld.value = eing[f]; feld.removeAttribute('aria-invalid'); meld.hidden = true; wert = pruefeEingabe(f, eing[f]).wert; p = 0;
      zeige(true, 'Funktion ' + FUNKTIONEN[f].kopf + '. Das Programm steht am Anfang. ');
    });
    auswahl.setze(f);
    var feldName = el('label', { for: id + '-wert' });
    var feld = el('input', { type: 'text', id: id + '-wert', class: 'v07-feld v07-feld--mittel', autocomplete: 'off', spellcheck: 'false', maxlength: '12' });
    feld.value = eing[f];
    var meld = el('p', { class: 'v07-meldung', role: 'alert', hidden: '' });
    feld.addEventListener('input', function () {
      var pr = pruefeEingabe(f, feld.value);
      if (pr.ok) { eing[f] = feld.value.trim(); wert = pr.wert; p = 0; feld.removeAttribute('aria-invalid'); meld.hidden = true; zeige(true, 'Neuer Wert. Das Programm steht am Anfang. '); }
      else { feld.setAttribute('aria-invalid', 'true'); meld.textContent = pr.meldung; meld.hidden = false; }
    });
    feld.addEventListener('change', function () { feld.value = eing[f]; feld.removeAttribute('aria-invalid'); meld.hidden = true; });
    var sw = schalterKnopf('print statt return', function () {
      if (f === 'begruessen') return;
      mitPrint = !mitPrint; p = 0; zeige(true, mitPrint ? 'print statt return. ' : 'return. ');
    });
    var swHinweis = el('p', { class: 'v07-hinweis k-small k-muted', text: 'Bei begruessen gibt es kein return. Wähle quadrat oder doppelt, dann kannst du umschalten.' });
    var einer = aktion('Ein Schritt'), zurueck = aktion('Von vorn', true);
    einer.addEventListener('click', function () { var s = stand(f, wert, mitPrint, p); if (s.fertig) return; p++; zeige(true, ''); });
    zurueck.addEventListener('click', function () { if (p === 0) return; p = 0; zeige(true, 'Von vorn. '); });
    var codeEl = el('div', { class: 'v07-prog', role: 'region', 'aria-label': 'Das Programm, die aktive Zeile ist markiert', tabindex: '0' });
    var kiste = el('div', { class: 'v07-kiste', role: 'group', 'aria-label': 'Die Kiste mit Eingang und Ausgang' });
    var kEin = el('span', { class: 'v07-kiste__wert' }), kAus = el('span', { class: 'v07-kiste__wert' }), kName = el('span', { class: 'v07-kiste__name' });
    kiste.appendChild(el('div', { class: 'v07-kiste__seite' }, [el('span', { class: 'v07-kiste__titel', text: 'Eingang' }), kEin]));
    kiste.appendChild(el('span', { class: 'v07-kiste__pfeil', 'aria-hidden': 'true', text: '→' }));
    kiste.appendChild(el('div', { class: 'v07-kiste__mitte' }, [kName]));
    kiste.appendChild(el('span', { class: 'v07-kiste__pfeil', 'aria-hidden': 'true', text: '→' }));
    kiste.appendChild(el('div', { class: 'v07-kiste__seite' }, [el('span', { class: 'v07-kiste__titel', text: 'Ausgang' }), kAus]));
    var satzEl = el('p', { class: 'v07-jetzt' });
    var tabHost = el('div', { class: 'v07-tabelle-host', tabindex: '0', role: 'region', 'aria-label': 'Die Werte der Variablen' });
    var ausEl = el('pre', { class: 'v07-ausgabe', tabindex: '0', 'aria-label': 'Ausgabe des Programms' });
    var status = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    function zeige(ansagen, vorsatz) {
      var s = stand(f, wert, mitPrint, p), prog = programm(f, wert, mitPrint);
      feldName.textContent = f === 'begruessen' ? 'Name für den zweiten Aufruf' : 'Zahl für den Aufruf (' + MINUS + '99 bis 99)';
      if (document.activeElement !== feld) feld.value = eing[f];
      codeEl.textContent = '';
      prog.forEach(function (zl, k) {
        var on = s.aktiv.indexOf(k) >= 0;
        var r = el('div', { class: 'v07-zeile' + (on ? ' is-jetzt' : '') }, [
          el('span', { class: 'v07-zeile__nr', 'aria-hidden': 'true', text: String(k + 1) }),
          el('span', { class: 'v07-zeile__text', text: new Array(zl.ein + 1).join('    ') + zl.text })
        ]);
        if (on) r.setAttribute('aria-current', 'true');
        codeEl.appendChild(r);
      });
      kName.textContent = FUNKTIONEN[f].kopf;
      kEin.textContent = s.eingang || '';
      kAus.textContent = s.ausgang || '';
      kEin.classList.toggle('is-leer', !s.eingang); kAus.classList.toggle('is-leer', !s.ausgang);
      satzEl.textContent = p === 0 ? 'Noch nichts ist gelaufen. Drück auf „Ein Schritt“.' : 'Schritt ' + p + ' von ' + s.gesamt + ': ' + s.satz;
      var kopf = spaltenKopf(f);
      tabHost.textContent = '';
      tabHost.appendChild(el('table', { class: 'k-types v07-tabelle' }, [
        el('caption', { class: 'k-sr', text: 'Die Werte im Hauptprogramm und in der Funktion, getrennt' }),
        el('thead', {}, [el('tr', {}, kopf.map(function (c) { return el('th', { scope: 'col', text: c.text }); }))]),
        el('tbody', {}, [el('tr', {}, kopf.map(function (c) {
          var v = s.tabelle[c.schluessel];
          return el('td', { class: v === null ? 'is-leer' : '', text: v === null ? 'noch leer' : v });
        }))])
      ]));
      ausEl.textContent = s.ausgabe.length ? s.ausgabe.join('\n') : 'noch nichts ausgegeben';
      ausEl.classList.toggle('is-leer', !s.ausgabe.length);
      setzeSchalter(sw, mitPrint, f === 'begruessen');
      swHinweis.hidden = f !== 'begruessen';
      sperre(einer, s.fertig); sperre(zurueck, p === 0);
      if (ansagen) status.textContent = (vorsatz || '') + (p === 0 ? 'Das Programm steht am Anfang.' : s.satz);
    }
    zeige(false);
    host.appendChild(el('div', { class: 'v07-maschine' }, [
      el('div', { class: 'v07-maschine__links' }, [
        el('p', { class: 'v07-titel', text: 'Funktion wählen' }), auswahl.host,
        el('div', { class: 'v07-feldzeile' }, [feldName, feld]), meld,
        el('div', { class: 'v07-schalterreihe' }, [sw.knopf]), swHinweis,
        codeEl, el('div', { class: 'v07-aktionen' }, [einer, zurueck])
      ]),
      el('div', { class: 'v07-maschine__rechts' }, [
        el('p', { class: 'v07-titel', text: 'Die Kiste' }), kiste, satzEl,
        el('p', { class: 'v07-titel', text: 'Werte, getrennt nach Hauptprogramm und Funktion' }), tabHost,
        el('p', { class: 'v07-titel', text: 'Ausgabe' }), ausEl, status
      ])
    ]));
  }

  /* ── lupe ─────────────────────────────────────────────────── */
  function initLupe(host) {
    var id = 'v07-lupe-' + (++nr);
    var ha = 10, hb = 20, ergebnis = null, ps = 0, folge = summenfolge();
    host.textContent = '';
    function auswahlFeld(name, wert, fn) {
      var s = el('select', { id: id + '-' + name, class: 'v07-feld v07-feld--eng' });
      WERTE.forEach(function (h) { var o = el('option', { value: String(h), text: dezimal(h) }); if (h === wert) o.selected = true; s.appendChild(o); });
      s.addEventListener('change', function () { fn(Number(s.value)); });
      return s;
    }
    var selA = auswahlFeld('a', ha, function (h) { ha = h; leere('Zahl a ist ' + dezimal(h) + '. '); });
    var selB = auswahlFeld('b', hb, function (h) { hb = h; leere('Zahl b ist ' + dezimal(h) + '. '); });
    var addiere1 = aktion('Addieren');
    addiere1.addEventListener('click', function () { ergebnis = addiere(ha, hb); zeige1(true); });
    var leer1 = el('p', { class: 'v07-hinweis', text: 'Noch nicht gerechnet. Wähle zwei Zahlen, vermute, und drück auf „Addieren“.' });
    var erg1 = el('div', { class: 'v07-erg', hidden: '' });
    var rechnungEl = el('p', { class: 'v07-rechnung' });
    var zeile1 = el('p', { class: 'v07-erg__zeile' }), zeile2 = el('p', { class: 'v07-erg__zeile' });
    var ampel = el('p', { class: 'v07-ampel', role: 'img' });
    var ampelWort = el('span', { class: 'v07-ampel__wort' }), ampelPunkt = el('span', { class: 'v07-ampel__punkt', 'aria-hidden': 'true' });
    ampel.appendChild(ampelPunkt); ampel.appendChild(ampelWort);
    var genauHinweis = el('p', { class: 'k-small k-muted', text: MELDUNG_GENAU });
    var vergl1 = el('p', { class: 'v07-erg__zeile' }), vergl2 = el('p', { class: 'v07-erg__zeile' });
    [rechnungEl, zeile1, zeile2, ampel, genauHinweis, vergl1, vergl2].forEach(function (x) { erg1.appendChild(x); });
    var status1 = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    function leere(vorsatz) { ergebnis = null; zeige1(true, vorsatz + 'Noch nicht gerechnet. '); }
    function zeige1(ansagen, vorsatz) {
      leer1.hidden = !!ergebnis; erg1.hidden = !ergebnis;
      if (ergebnis) {
        var r = ergebnis;
        rechnungEl.textContent = r.aText + ' + ' + r.bText;
        zeile1.textContent = 'Python zeigt: ' + r.summeText;
        zeile2.textContent = 'Mit 20 Nachkommastellen: ' + r.summe20;
        ampelWort.textContent = r.genau ? 'genau' : 'nicht genau';
        ampel.classList.toggle('is-genau', r.genau); ampel.classList.toggle('is-nicht', !r.genau);
        ampel.setAttribute('aria-label', 'Ampel: Die Summe ist ' + r.ampel + '.');
        vergl1.textContent = rechnungEl.textContent + ' == ' + r.erwartetText + ' ergibt ' + (r.gleich ? 'True' : 'False');
        vergl2.textContent = 'round(' + r.aText + ' + ' + r.bText + ', 2) == ' + r.erwartetText + ' ergibt ' + (r.rundenGleich ? 'True' : 'False');
      }
      if (ansagen) status1.textContent = (vorsatz || '') + (ergebnis ? satzAddition(ergebnis) : '');
    }
    /* Teil 2 */
    var einer = aktion('Ein Schritt'), zurueck = aktion('Von vorn', true);
    einer.addEventListener('click', function () { if (ps >= folge.length) return; ps++; zeige2(true); });
    zurueck.addEventListener('click', function () { if (ps === 0) return; ps = 0; zeige2(true, 'Von vorn. '); });
    var progEl = el('div', { class: 'v07-prog', role: 'region', 'aria-label': 'Die Schleife', tabindex: '0' });
    [['x = 0.0', 0], ['while x != 1.0:', 0], ['x = x + 0.1', 1], ['print(x)', 1]].forEach(function (zl, k) {
      progEl.appendChild(el('div', { class: 'v07-zeile' }, [el('span', { class: 'v07-zeile__nr', 'aria-hidden': 'true', text: String(k + 1) }), el('span', { class: 'v07-zeile__text', text: new Array(zl[1] + 1).join('    ') + zl[0] })]));
    });
    var jetzt2 = el('p', { class: 'v07-jetzt' });
    var tabHost = el('div', { class: 'v07-tabelle-host', tabindex: '0', role: 'region', 'aria-label': 'Die Werte von x nach jedem Schritt' });
    var status2 = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    function zeige2(ansagen, vorsatz) {
      var zl = [], q;
      for (q = 1; q <= ps; q++) {
        var e = folge[q - 1];
        var tr = el('tr', { class: q === ps ? 'is-jetzt' : '' }, [el('th', { scope: 'row', text: String(e.nr) }), el('td', { class: 'v07-tabelle__x', text: e.text }), el('td', { text: e.ungleich ? 'ja' : 'nein' })]);
        if (q === ps) tr.setAttribute('aria-current', 'true');
        zl.push(tr);
      }
      tabHost.textContent = '';
      tabHost.appendChild(el('table', { class: 'k-types v07-tabelle' }, [
        el('caption', { class: 'k-sr', text: 'Der Wert von x nach jedem Schritt und die Frage, ob x ungleich 1.0 ist' }),
        el('thead', {}, [el('tr', {}, [el('th', { scope: 'col', text: 'Schritt' }), el('th', { scope: 'col', text: 'x' }), el('th', { scope: 'col', text: 'x != 1.0 ?' })])]),
        el('tbody', {}, zl.length ? zl : [el('tr', {}, [el('td', { colspan: '3', text: 'Noch kein Schritt.' })])])
      ]));
      jetzt2.textContent = satzSumme(folge, ps);
      sperre(einer, ps >= folge.length); sperre(zurueck, ps === 0);
      if (ansagen) status2.textContent = (vorsatz || '') + satzSumme(folge, ps);
    }
    zeige1(false); zeige2(false);
    host.appendChild(el('div', { class: 'v07-lupe' }, [
      el('div', { class: 'v07-lupe__teil' }, [
        el('p', { class: 'v07-titel', text: 'Zwei Zahlen addieren' }),
        el('div', { class: 'v07-wahlzeile' }, [el('label', { for: id + '-a', text: 'Erste Zahl' }), selA, el('span', { class: 'v07-plus', 'aria-hidden': 'true', text: '+' }), el('label', { for: id + '-b', text: 'Zweite Zahl' }), selB]),
        el('div', { class: 'v07-aktionen' }, [addiere1]), leer1, erg1, status1
      ]),
      el('div', { class: 'v07-lupe__teil' }, [
        el('p', { class: 'v07-titel', text: 'Zehnmal 0.1 aufsummieren' }), progEl,
        el('div', { class: 'v07-aktionen' }, [einer, zurueck]), jetzt2, tabHost, status2
      ])
    ]));
  }

  function init() {
    var map = { kreis: initKreis, maschine: initMaschine, lupe: initLupe };
    Object.keys(map).forEach(function (k) {
      Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="' + k + '"]'), function (host) {
        if (host._v07) return;
        host._v07 = true;
        map[k](host);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
