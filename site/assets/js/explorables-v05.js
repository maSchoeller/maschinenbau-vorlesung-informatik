/* =============================================================
   explorables-v05.js – interaktive Bausteine für Termin 05 (Zweiersystem und Zählschleifen)
     data-explorable="byte"    „Acht Schalter, ein Byte“: acht Kippschalter mit den Stellenwerten 128 bis 1; zweite Betriebsart
                               „Zahl eingeben“ mit dem Knopf „Nächste Stelle“, der die Stellenwerttabelle von links abarbeitet
     data-explorable="range"   „range von Hand“: Start und Stopp mit Plus und Minus, die Zeile for i in range(…), die Zahlen als
                               Kästchen, der Stoppwert durchgestrichen, die gleichwertige while-Schleife, Knopf „Ein Durchlauf“
     data-explorable="summe"   „Summe Schritt für Schritt“: vier Punktwerte, vier Fassungen des Programms (richtig, Startwert fehlt,
                               Startwert im Rumpf, Ausgabe im Rumpf), Schalter „mitzählen“ mit >= oder >, aktive Zeile, Tabelle, Ausgabe
   Eigenständig wie alle explorables-vNN.js: keine Bibliothek, Texte per textContent.
   Der Rechenkern steht oben und ist ohne Browser prüfbar (module.exports). Python läuft hier nicht: Der Lauf von „summe“ ist
   ein nachgebautes Mini-Programm, die Werte sind gegen Python 3 geprüft (app/skripte/tests/explorables-v05.test.mjs).
   ============================================================= */
(function () {
  'use strict';

  /* ── Rechenkern: Byte (ohne DOM) ──────────────────────────── */
  var WERTE = [128, 64, 32, 16, 8, 4, 2, 1];
  function gueltig(z) { return typeof z === 'number' && isFinite(z) && z === Math.floor(z) && z >= 0 && z <= 255; }
  /* die acht Bits einer Zahl von 0 bis 255, links der Stellenwert 128 */
  function bits(z) {
    var r = [];
    for (var k = 7; k >= 0; k--) r.push((z >> k) & 1);
    return r;
  }
  function wertVon(b) { return b.reduce(function (s, x, k) { return s + (x ? WERTE[k] : 0); }, 0); }
  /* zwei Vierergruppen: 0010 1101 */
  function gruppen(b) { return b.slice(0, 4).join('') + ' ' + b.slice(4).join(''); }
  /* die Stellenwerte unter den Einsen: 32 + 8 + 4 + 1 = 45 */
  function rechnung(b) {
    var teile = [];
    b.forEach(function (x, k) { if (x) teile.push(WERTE[k]); });
    return teile.length ? teile.join(' + ') + ' = ' + wertVon(b) : 'Kein Schalter an: 0';
  }
  /* dezimal → binär mit der Stellenwerttabelle, von links: Passt der Stellenwert in den Rest? */
  function stellenwertSchritte(z) {
    var rest = z, r = [];
    WERTE.forEach(function (w) {
      var vorher = rest, passt = w <= rest;
      if (passt) rest -= w;
      r.push({
        wert: w, passt: passt, bit: passt ? 1 : 0, restVorher: vorher, rest: rest,
        satz: 'Passt ' + w + ' in den Rest ' + vorher + '? ' + (passt ? 'Ja' : 'Nein') + ': Bit ' + (passt ? 1 : 0) + ', Rest ' + rest + '.'
      });
    });
    return r;
  }
  /* Eingabe prüfen: gibt die Zahl oder eine Meldung zurück */
  function pruefeEingabe(text) {
    var t = String(text === undefined || text === null ? '' : text).replace(/\s+/g, '');
    if (t === '' || !/^-?\d+(\.\d+)?$/.test(t)) return { ok: false, meldung: 'Gib eine ganze Zahl von 0 bis 255 ein.' };
    var n = Number(t);
    if (n !== Math.floor(n) || n < 0) return { ok: false, meldung: 'Gib eine ganze Zahl von 0 bis 255 ein.' };
    if (n > 255) return { ok: false, meldung: 'Ein Byte reicht von 0 bis 255.' };
    return { ok: true, zahl: n };
  }
  function hinweis(z) {
    if (z === 255) return 'Alle acht Schalter an ergeben 255, die größte Zahl eines Bytes.';
    if (z === 128) return 'Nur der linke Schalter an ergibt 128, eins mehr als alle sieben anderen zusammen (127).';
    if (z === 0) return 'Alle Schalter aus ergeben 0.';
    return '';
  }
  /* Betriebsart „Schalter“: aus den acht Schaltern */
  function ansichtSchalter(b) {
    var z = wertVon(b);
    return { bits: b.slice(), wert: z, gruppen: gruppen(b), rechnung: rechnung(b), hinweis: hinweis(z), satz: 'Byte ' + gruppen(b) + '. ' + rechnung(b) + '.' };
  }
  /* Betriebsart „Zahl eingeben“ nach k Schritten der Stellenwerttabelle (0 bis 8) */
  function ansichtZahl(z, k) {
    var s = stellenwertSchritte(z), b = s.map(function (x, i) { return i < k ? x.bit : 0; });
    var satz;
    if (k === 0) satz = 'Noch kein Schritt. Der Rest ist ' + z + '. Als Nächstes: Stellenwert 128.';
    else if (k < 8) satz = s[k - 1].satz + ' Als Nächstes: Stellenwert ' + s[k].wert + '.';
    else satz = s[7].satz + ' Fertig: ' + gruppen(b) + '. Probe: ' + rechnung(b) + '.';
    return {
      bits: b, wert: z, gruppen: gruppen(b), schritte: s, k: k, fertig: k >= 8, satz: satz,
      rechnung: (k >= 8 ? 'Probe: ' : 'Bisher: ') + rechnung(b), hinweis: k >= 8 ? hinweis(z) : ''
    };
  }

  /* ── Rechenkern: range ────────────────────────────────────── */
  var START_MAX = 5, STOPP_MAX = 10;
  function klemme(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
  function zahlenVon(start, stopp) {
    var r = [];
    for (var i = start; i < stopp; i++) r.push(i);
    return r;
  }
  function durchlaeufe(start, stopp) { return Math.max(0, stopp - start); }
  function forZeile(start, stopp) { return 'for i in range(' + start + ', ' + stopp + '):'; }
  function kurzForm(start, stopp) { return start === 0 ? 'kurz: range(' + stopp + ')' : ''; }
  /* gleichwertige while-Schleife (drei Teile: Startwert, Bedingung, Weiterzählen) */
  function whileZeilen(start, stopp) { return ['i = ' + start, 'while i <= ' + (stopp - 1) + ':', '    # Rumpf', '    i = i + 1']; }
  function rautenText(start, stopp) { return durchlaeufe(start, stopp) === 0 ? 'gleich beim ersten Mal nein' : 'i von ' + start + ' bis ' + (stopp - 1) + '?'; }
  function rechnungDurchlaeufe(start, stopp) {
    var n = durchlaeufe(start, stopp);
    return 'Durchläufe: ' + (n > 0 ? stopp + ' − ' + start + ' = ' + n : '0');
  }
  var KEINE_ZAHL = 'Keine Zahl. Der Rumpf läuft nie.';
  function satzRange(start, stopp, k) {
    var n = durchlaeufe(start, stopp);
    if (n === 0) return forZeile(start, stopp) + ' ' + KEINE_ZAHL;
    var t = forZeile(start, stopp) + ' ' + n + (n === 1 ? ' Durchlauf' : ' Durchläufe') + ': ' + zahlenVon(start, stopp).join(', ') + '. ' + stopp + ' gehört nicht dazu.';
    if (k > 0) t = 'Durchlauf ' + k + ' von ' + n + ': i ist ' + (start + k - 1) + '. ' + t;
    return t;
  }

  /* ── Rechenkern: summe ────────────────────────────────────── */
  var PUNKTE = [8, 10, 4, 8];
  var FASSUNGEN = [
    { id: 'richtig', text: 'richtig' },
    { id: 'startfehlt', text: 'Startwert fehlt' },
    { id: 'startimrumpf', text: 'Startwert im Rumpf' },
    { id: 'ausgabeimrumpf', text: 'Ausgabe im Rumpf' }
  ];
  var VERGLEICHE = ['>=', '>'];
  var NAME_ERROR = "NameError: name 'summe' is not defined";
  var ZEILENTEXT = {
    start: 'summe = 0',
    anzahl0: 'anzahl = 0',
    'for': 'for i in range(1, 5):',
    eingabe: 'punkte = int(input(f"Punkte Blatt {i}: "))',
    add: 'summe = summe + punkte',
    'anzahl+': 'anzahl = anzahl + 1',
    mittel: 'mittel = summe / 4',
    ausgabe: 'print(f"Summe: {summe}, Durchschnitt: {mittel:.1f}")',
    ausgabeA: 'print(f"Blätter mit mindestens 8 Punkten: {anzahl}")'
  };
  function fassungMit(id) {
    for (var k = 0; k < FASSUNGEN.length; k++) if (FASSUNGEN[k].id === id) return FASSUNGEN[k];
    return FASSUNGEN[0];
  }
  function standard() { return { werte: PUNKTE.slice(), fassung: 'richtig', zaehlen: false, op: '>=' }; }
  /* Das Programm als Zeilenliste (id, text, Einrückungsstufe) und die Teile vor der Schleife, im Rumpf, danach */
  function programm(cfg) {
    var f = fassungMit(cfg.fassung).id, mit = !!cfg.zaehlen, op = cfg.op === '>' ? '>' : '>=';
    var vor = [], rumpf = [], nach = [];
    if (f !== 'startfehlt' && f !== 'startimrumpf') vor.push('start');
    if (mit) vor.push('anzahl0');
    if (f === 'startimrumpf') rumpf.push('start');
    rumpf.push('eingabe', 'add');
    if (mit) rumpf.push('if');
    if (f === 'ausgabeimrumpf') rumpf.push('mittel', 'ausgabe'); else nach.push('mittel', 'ausgabe');
    if (mit) nach.push('ausgabeA');
    var zeilen = [];
    function dazu(id, ein) { zeilen.push({ id: id, text: id === 'if' ? 'if punkte ' + op + ' 8:' : ZEILENTEXT[id], ein: ein }); }
    vor.forEach(function (id) { dazu(id, 0); });
    dazu('for', 0);
    rumpf.forEach(function (id) { dazu(id, 1); if (id === 'if') dazu('anzahl+', 2); });
    nach.forEach(function (id) { dazu(id, 0); });
    return { zeilen: zeilen, vor: vor, rumpf: rumpf, nach: nach, op: op };
  }
  /* Python-Schreibweise von summe / 4 */
  function mittelText(summe) {
    var v = summe / 4;
    return Number.isInteger(v) ? v + '.0' : String(v);
  }
  /* f"{summe / 4:.1f}": Gleichstände (x,25 und x,75 sind genau darstellbar) gehen wie in Python zur geraden Stelle */
  function eineStelle(summe) {
    var t = summe * 2.5, f = Math.floor(t), r = (t - f === 0.5) ? (f % 2 === 0 ? f : f + 1) : f, g = Math.floor(r / 10);
    return g + '.' + (r - g * 10);
  }
  function kopie(s) { return { i: s.i, punkte: s.punkte, summe: s.summe, anzahl: s.anzahl, ausgabe: s.ausgabe.slice() }; }
  /* Der ganze Lauf als Liste von Ereignissen: jede ausgeführte Zeile mit dem Zustand danach */
  function lauf(cfg) {
    var werte = (cfg.werte && cfg.werte.length === 4 ? cfg.werte : PUNKTE).slice();
    var prog = programm(cfg), index = {}, op = prog.op;
    prog.zeilen.forEach(function (z, k) { index[z.id] = k; });
    var s = { i: null, punkte: null, summe: null, anzahl: null, ausgabe: [] }, ev = [];
    function ereignis(id, satz, fehler) { ev.push({ zeile: index[id], id: id, satz: satz, nachher: kopie(s), fehler: fehler || null }); }
    function fuehre(id) {
      if (id === 'start') { s.summe = 0; ereignis(id, 'summe wird 0.'); }
      else if (id === 'anzahl0') { s.anzahl = 0; ereignis(id, 'anzahl wird 0.'); }
      else if (id === 'eingabe') { s.punkte = werte[s.i - 1]; ereignis(id, 'Eingabe ' + s.punkte + ' für „Punkte Blatt ' + s.i + ':“. punkte wird ' + s.punkte + '.'); }
      else if (id === 'add') {
        if (s.summe === null) { ereignis(id, 'summe hat noch keinen Wert. Python kennt den Namen nicht, der Lauf bricht ab.', NAME_ERROR); return false; }
        var alt = s.summe; s.summe = alt + s.punkte;
        ereignis(id, 'summe wird ' + alt + ' + ' + s.punkte + ' = ' + s.summe + '.');
      } else if (id === 'if') {
        var wahr = op === '>=' ? s.punkte >= 8 : s.punkte > 8;
        ereignis(id, s.punkte + ' ' + op + ' 8 ist ' + (wahr ? 'wahr: Weg ja, der Wert zählt.' : 'falsch: Weg nein, nichts passiert, die Schleife geht weiter.'));
        if (wahr) { var a = s.anzahl; s.anzahl = a + 1; ereignis('anzahl+', 'anzahl wird ' + a + ' + 1 = ' + s.anzahl + '.'); }
      } else if (id === 'mittel') {
        if (s.summe === null) { ereignis(id, 'summe hat noch keinen Wert. Python kennt den Namen nicht, der Lauf bricht ab.', NAME_ERROR); return false; }
        ereignis(id, 'mittel wird ' + s.summe + ' / 4 = ' + mittelText(s.summe) + '.');
      } else if (id === 'ausgabe') {
        var zeile = 'Summe: ' + s.summe + ', Durchschnitt: ' + eineStelle(s.summe);
        s.ausgabe.push(zeile); ereignis(id, 'Ausgabe: ' + zeile);
      } else if (id === 'ausgabeA') {
        var za = 'Blätter mit mindestens 8 Punkten: ' + s.anzahl;
        s.ausgabe.push(za); ereignis(id, 'Ausgabe: ' + za);
      }
      return true;
    }
    var ok = true, k, j;
    for (k = 0; ok && k < prog.vor.length; k++) ok = fuehre(prog.vor[k]);
    for (var i = 1; ok && i <= 4; i++) {
      s.i = i; ereignis('for', 'i wird ' + i + '.');
      for (j = 0; ok && j < prog.rumpf.length; j++) ok = fuehre(prog.rumpf[j]);
    }
    if (ok) {
      ereignis('for', 'range hat keine Zahl mehr: Weg nein, die Schleife ist zu Ende. i bleibt ' + s.i + '.');
      for (k = 0; ok && k < prog.nach.length; k++) ok = fuehre(prog.nach[k]);
    }
    var letzter = ev[ev.length - 1];
    return { zeilen: prog.zeilen, ereignisse: ev, fehler: letzter && letzter.fehler ? letzter.fehler : null, ende: letzter ? letzter.nachher : null };
  }
  /* Zustand nach p ausgeführten Zeilen (0 = ganz am Anfang) */
  var LEER = { i: null, punkte: null, summe: null, anzahl: null, ausgabe: [] };
  function zustandNach(l, p) { return p <= 0 ? kopie(LEER) : kopie(l.ereignisse[Math.min(p, l.ereignisse.length) - 1].nachher); }
  function satzSumme(l, p) {
    if (p <= 0) return 'Noch keine Zeile ausgeführt.';
    var e = l.ereignisse[Math.min(p, l.ereignisse.length) - 1];
    return 'Zeile ' + (e.zeile + 1) + ': ' + e.satz + (e.fehler ? ' ' + e.fehler : '') + (p >= l.ereignisse.length && !e.fehler ? ' Das Programm ist zu Ende.' : '');
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      WERTE: WERTE, gueltig: gueltig, bits: bits, wertVon: wertVon, gruppen: gruppen, rechnung: rechnung, stellenwertSchritte: stellenwertSchritte,
      pruefeEingabe: pruefeEingabe, hinweis: hinweis, ansichtSchalter: ansichtSchalter, ansichtZahl: ansichtZahl,
      START_MAX: START_MAX, STOPP_MAX: STOPP_MAX, klemme: klemme, zahlenVon: zahlenVon, durchlaeufe: durchlaeufe, forZeile: forZeile, kurzForm: kurzForm,
      whileZeilen: whileZeilen, rautenText: rautenText, rechnungDurchlaeufe: rechnungDurchlaeufe, KEINE_ZAHL: KEINE_ZAHL, satzRange: satzRange,
      PUNKTE: PUNKTE, FASSUNGEN: FASSUNGEN, VERGLEICHE: VERGLEICHE, NAME_ERROR: NAME_ERROR, standard: standard, programm: programm,
      mittelText: mittelText, eineStelle: eineStelle, lauf: lauf, zustandNach: zustandNach, satzSumme: satzSumme
    };
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
  /* Knopfgruppe mit „gedrückt“-Zustand */
  function knopfgruppe(label, eintraege, aktiv, fn) {
    var gruppe = el('div', { class: 'v05-knoepfe', role: 'group', 'aria-label': label }), knoepfe = [];
    eintraege.forEach(function (e) {
      var b = el('button', { type: 'button', class: 'v05-knopf' + (e.code ? ' is-code' : ''), 'aria-pressed': 'false', text: e.text });
      if (e.aria) b.setAttribute('aria-label', e.aria);
      b.addEventListener('click', function () { setze(e.wert); fn(e.wert); });
      knoepfe.push({ b: b, wert: e.wert });
      gruppe.appendChild(b);
    });
    function setze(wert) { knoepfe.forEach(function (k) { k.b.setAttribute('aria-pressed', k.wert === wert ? 'true' : 'false'); }); }
    setze(aktiv);
    return { gruppe: gruppe, setze: setze };
  }
  function schalterKnopf(text, fn) {
    var b = el('button', { type: 'button', class: 'v05-schalter', role: 'switch', 'aria-checked': 'false' });
    var z = el('span', { class: 'v05-schalter__zustand', 'aria-hidden': 'true' });
    b.appendChild(el('span', { class: 'v05-schalter__name', text: text }));
    b.appendChild(el('span', { class: 'v05-schalter__hebel', 'aria-hidden': 'true' }));
    b.appendChild(z);
    b.addEventListener('click', fn);
    return { knopf: b, zustand: z };
  }
  function setzeSchalter(s, an) {
    s.knopf.setAttribute('aria-checked', an ? 'true' : 'false');
    s.knopf.classList.toggle('is-an', !!an);
    s.zustand.textContent = an ? 'an' : 'aus';
  }
  function aktion(text, leise) { return el('button', { type: 'button', class: 'v05-aktion' + (leise ? ' v05-aktion--leise' : ''), text: text }); }
  function sperre(b, aus) { b.setAttribute('aria-disabled', aus ? 'true' : 'false'); b.classList.toggle('is-aus', !!aus); }

  /* ── Byte ─────────────────────────────────────────────────── */
  function initByte(host) {
    var id = 'v05-byte-' + (++nr);
    var modus = 'schalter', an = [0, 0, 0, 0, 0, 0, 0, 0], zahl = 45, k = 0, gueltigEingabe = true;
    host.textContent = '';
    var knoepfe = [];
    var reihe = el('div', { class: 'v05-bitreihe', role: 'group', 'aria-label': 'Acht Schalter, links der Stellenwert 128, rechts 1' });
    [0, 1].forEach(function (g) {
      var gr = el('div', { class: 'v05-bitgruppe' });
      WERTE.slice(g * 4, g * 4 + 4).forEach(function (w, j) {
        var pos = g * 4 + j;
        var b = el('button', { type: 'button', class: 'v05-bit', role: 'switch', 'aria-checked': 'false' });
        var bitZahl = el('span', { class: 'v05-bit__ziffer' });
        b.appendChild(el('span', { class: 'v05-bit__wert', text: String(w) }));
        b.appendChild(el('span', { class: 'v05-bit__hebel', 'aria-hidden': 'true' }));
        b.appendChild(bitZahl);
        b.addEventListener('click', function () {
          if (modus !== 'schalter') return;
          an[pos] = an[pos] ? 0 : 1;
          zeige(true, 'Schalter ' + w + (an[pos] ? ' an. ' : ' aus. '));
        });
        knoepfe.push({ b: b, ziffer: bitZahl, wert: w });
        gr.appendChild(b);
      });
      reihe.appendChild(gr);
    });
    var modusWahl = knopfgruppe('Betriebsart', [{ wert: 'schalter', text: 'Schalter einstellen' }, { wert: 'zahl', text: 'Zahl eingeben' }], modus, function (m) {
      modus = m; k = 0;
      if (m === 'zahl') { var p = pruefeEingabe(feld.value); gueltigEingabe = p.ok; if (p.ok) zahl = p.zahl; else fehler.textContent = p.meldung; }
      zeige(true, m === 'zahl' ? 'Betriebsart Zahl eingeben. ' : 'Betriebsart Schalter einstellen. ');
    });
    var feld = el('input', { type: 'number', id: id + '-zahl', class: 'v05-feld', min: '0', max: '255', step: '1', inputmode: 'numeric' });
    feld.value = String(zahl);
    var feldZeile = el('div', { class: 'v05-feldzeile' }, [el('label', { for: id + '-zahl', text: 'Zahl von 0 bis 255' }), feld]);
    var fehler = el('p', { class: 'v05-meldung', hidden: '' });
    var weiter = aktion('Nächste Stelle'), vonVorn = aktion('Von vorn', true);
    var aktionen = el('div', { class: 'v05-aktionen' }, [weiter, vonVorn]);
    var gross = el('strong', { class: 'v05-gross' });
    var bytes = el('code', { class: 'v05-byte' });
    var rechnungEl = el('p', { class: 'v05-rechnung' });
    var schrittEl = el('p', { class: 'v05-jetzt' });
    var hinweisEl = el('p', { class: 'v05-hinweis' });
    var status = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    function zeige(ansagen, vorsatz) {
      var a = modus === 'schalter' ? ansichtSchalter(an) : ansichtZahl(zahl, k);
      knoepfe.forEach(function (x, pos) {
        var on = a.bits[pos] === 1;
        x.b.setAttribute('aria-checked', on ? 'true' : 'false');
        x.b.classList.toggle('is-an', on);
        x.b.setAttribute('aria-label', 'Stellenwert ' + x.wert);
        x.b.setAttribute('aria-disabled', modus === 'schalter' ? 'false' : 'true');
        x.ziffer.textContent = on ? '1' : '0';
      });
      var zahlModus = modus === 'zahl';
      feldZeile.hidden = !zahlModus; aktionen.hidden = !zahlModus;
      var ok = !zahlModus || gueltigEingabe;
      fehler.hidden = ok;
      gross.textContent = ok ? String(a.wert) : '?';
      bytes.textContent = ok ? a.gruppen : '';
      rechnungEl.textContent = ok ? a.rechnung : '';
      schrittEl.textContent = zahlModus && ok ? a.satz : '';
      schrittEl.hidden = !(zahlModus && ok);
      hinweisEl.textContent = ok ? a.hinweis : '';
      sperre(weiter, !ok || (zahlModus && a.fertig));
      sperre(vonVorn, !ok || (zahlModus && k === 0));
      if (ansagen) status.textContent = (vorsatz || '') + (ok ? (zahlModus ? a.satz : a.satz) : fehler.textContent);
    }
    feld.addEventListener('input', function () {
      var p = pruefeEingabe(feld.value);
      gueltigEingabe = p.ok; k = 0;
      if (p.ok) { zahl = p.zahl; feld.removeAttribute('aria-invalid'); } else { feld.setAttribute('aria-invalid', 'true'); fehler.textContent = p.meldung; }
      zeige(true, '');
    });
    weiter.addEventListener('click', function () { if (!gueltigEingabe || k >= 8) return; k++; zeige(true, ''); });
    vonVorn.addEventListener('click', function () { if (!gueltigEingabe || k === 0) return; k = 0; zeige(true, 'Von vorn. '); });
    zeige(false);
    host.appendChild(el('div', { class: 'v05-byte-bau' }, [
      el('p', { class: 'v05-titel', text: 'Betriebsart' }), modusWahl.gruppe, feldZeile, fehler, aktionen,
      reihe,
      el('div', { class: 'v05-anzeige' }, [
        el('p', { class: 'v05-titel', text: 'Dezimal' }), el('p', { class: 'v05-grossweg' }, [gross]),
        el('p', { class: 'v05-titel', text: 'Byte in Vierergruppen' }), el('p', { class: 'v05-bytezeile' }, [bytes]),
        rechnungEl, schrittEl, hinweisEl, status
      ])
    ]));
  }

  /* ── range von Hand ───────────────────────────────────────── */
  function stepper(label, wert, lo, hi, fn) {
    var minus = el('button', { type: 'button', class: 'v05-knopf v05-stufe', text: '−', 'aria-label': label + ' verkleinern' });
    var plus = el('button', { type: 'button', class: 'v05-knopf v05-stufe', text: '+', 'aria-label': label + ' vergrößern' });
    var zeigt = el('output', { class: 'v05-stufe__wert', 'aria-label': label });
    var w = wert;
    function setze(x) { w = klemme(x, lo, hi); zeigt.textContent = String(w); sperre(minus, w <= lo); sperre(plus, w >= hi); }
    minus.addEventListener('click', function () { if (w > lo) { setze(w - 1); fn(w); } });
    plus.addEventListener('click', function () { if (w < hi) { setze(w + 1); fn(w); } });
    setze(wert);
    return { zeile: el('div', { class: 'v05-stufen', role: 'group', 'aria-label': label }, [el('span', { class: 'v05-stufen__name', text: label }), minus, zeigt, plus]), setze: setze };
  }
  function initRange(host) {
    var start = 3, stopp = 8, k = 0;
    host.textContent = '';
    var sSt = stepper('Start', start, 0, START_MAX, function (w) { start = w; reset(); });
    var sSp = stepper('Stopp', stopp, 0, STOPP_MAX, function (w) { stopp = w; reset(); });
    var forEl = el('code', { class: 'v05-forzeile' });
    var kurz = el('p', { class: 'v05-kurz' });
    var kaesten = el('ol', { class: 'v05-kaesten', 'aria-label': 'Die Zahlen, die i annimmt' });
    var rechnungEl = el('p', { class: 'v05-rechnung' });
    var rauteEl = el('p', { class: 'v05-raute' });
    var whileEl = el('pre', { class: 'v05-code', 'aria-label': 'Gleichwertige while-Schleife' });
    var leer = el('p', { class: 'v05-meldung', hidden: '' });
    var ein = aktion('Ein Durchlauf'), von = aktion('Von vorn', true);
    var status = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    function zeige(ansagen) {
      var n = durchlaeufe(start, stopp), zahlen = zahlenVon(start, stopp);
      forEl.textContent = forZeile(start, stopp);
      kurz.textContent = kurzForm(start, stopp); kurz.hidden = !kurz.textContent;
      kaesten.textContent = '';
      zahlen.forEach(function (z, j) {
        var li = el('li', { class: 'v05-kasten' + (j < k - 1 ? ' is-fertig' : '') + (j === k - 1 ? ' is-jetzt' : ''), text: String(z) });
        if (j === k - 1) li.setAttribute('aria-current', 'true');
        kaesten.appendChild(li);
      });
      kaesten.appendChild(el('li', { class: 'v05-kasten v05-kasten--stopp' }, [el('s', { text: String(stopp) }), el('span', { class: 'v05-kasten__text', text: 'gehört nicht dazu' })]));
      rechnungEl.textContent = rechnungDurchlaeufe(start, stopp);
      rauteEl.textContent = 'Raute im Plan: ' + rautenText(start, stopp);
      whileEl.textContent = whileZeilen(start, stopp).join('\n');
      leer.hidden = n > 0; leer.textContent = n > 0 ? '' : KEINE_ZAHL;
      sperre(ein, k >= n); sperre(von, k === 0);
      if (ansagen) status.textContent = satzRange(start, stopp, k);
    }
    function reset() { k = 0; zeige(true); }
    ein.addEventListener('click', function () { if (k >= durchlaeufe(start, stopp)) return; k++; zeige(true); });
    von.addEventListener('click', function () { if (k === 0) return; reset(); });
    zeige(false);
    host.appendChild(el('div', { class: 'v05-range-bau' }, [
      el('div', { class: 'v05-range-bau__links' }, [sSt.zeile, sSp.zeile, el('p', { class: 'v05-titel', text: 'Zählschleife' }), el('p', { class: 'v05-forwrap' }, [forEl]), kurz, kaesten, rechnungEl, leer,
        el('div', { class: 'v05-aktionen' }, [ein, von])]),
      el('div', { class: 'v05-range-bau__rechts' }, [el('p', { class: 'v05-titel', text: 'Dasselbe mit while' }), whileEl, rauteEl, status])
    ]));
  }

  /* ── Summe Schritt für Schritt ────────────────────────────── */
  function initSumme(host) {
    var id = 'v05-summe-' + (++nr);
    var cfg = standard(), l = null, p = 0;
    host.textContent = '';
    var auswahl = el('select', { id: id, class: 'v05-auswahl' }, FASSUNGEN.map(function (f) { return el('option', { value: f.id, text: f.text }); }));
    var auswahlZeile = el('div', { class: 'v05-auswahlzeile' }, [el('label', { for: id, text: 'Fassung des Programms' }), auswahl]);
    var felder = cfg.werte.map(function (w, j) {
      var f = el('input', { type: 'number', id: id + '-p' + j, class: 'v05-feld v05-feld--eng', min: '0', max: '10', step: '1', inputmode: 'numeric' });
      f.value = String(w); f.setAttribute('aria-describedby', id + '-hinweis');
      f.addEventListener('input', function () {
        var q = Number(f.value);
        if (f.value !== '' && q === Math.floor(q) && q >= 0 && q <= 10) { cfg.werte[j] = q; f.removeAttribute('aria-invalid'); reset(''); }
        else f.setAttribute('aria-invalid', 'true');
      });
      /* Die Ansage kommt erst beim Verlassen des Feldes, nicht bei jeder Ziffer. */
      f.addEventListener('change', function () {
        var q = Number(f.value), gueltigW = f.value !== '' && q === Math.floor(q) && q >= 0 && q <= 10;
        f.value = String(cfg.werte[j]); f.removeAttribute('aria-invalid');
        if (gueltigW) reset('Punkte geändert. ');
      });
      return { feld: f, zelle: el('div', { class: 'v05-feldzeile v05-feldzeile--eng' }, [el('label', { for: id + '-p' + j, text: 'Blatt ' + (j + 1) }), f]) };
    });
    var werteZeile = el('div', { class: 'v05-werte', role: 'group', 'aria-label': 'Punkte der vier Übungsblätter, je 0 bis 10' }, felder.map(function (x) { return x.zelle; }));
    var zaehlen = schalterKnopf('mitzählen, wie viele mindestens 8 haben', function () { cfg.zaehlen = !cfg.zaehlen; reset(cfg.zaehlen ? 'Zählen ist an. ' : 'Zählen ist aus. '); });
    var vergleich = knopfgruppe('Vergleich in der Bedingung', VERGLEICHE.map(function (o) { return { wert: o, text: o, code: true, aria: o === '>' ? 'größer als (>)' : 'größer oder gleich (>=)' }; }), cfg.op, function (o) { cfg.op = o; reset('Vergleich ' + o + '. '); });
    var vergleichZeile = el('div', { class: 'v05-vergleich' }, [el('p', { class: 'v05-titel', text: 'Vergleich' }), vergleich.gruppe]);
    var codeEl = el('div', { class: 'v05-prog', role: 'region', 'aria-label': 'Das Programm, die zuletzt ausgeführte Zeile ist markiert', tabindex: '0' });
    var einer = aktion('Ein Schritt'), ende = aktion('Bis zum Ende'), zurueck = aktion('Von vorn', true);
    var jetzt = el('p', { class: 'v05-jetzt' });
    var tabelleHost = el('div', { class: 'v05-tabelle-host', tabindex: '0', role: 'region', 'aria-label': 'Werte nach jeder Zeile' });
    var ausgabeEl = el('pre', { class: 'v05-ausgabe', 'aria-label': 'Bisherige Ausgabe' });
    var meldung = el('p', { class: 'v05-meldung', hidden: '' });
    var status = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    var zeilenEl = [];
    function baueCode() {
      codeEl.textContent = ''; zeilenEl = [];
      l.zeilen.forEach(function (z, j) {
        var r = el('div', { class: 'v05-zeile' }, [el('span', { class: 'v05-zeile__nr', 'aria-hidden': 'true', text: String(j + 1) }), el('span', { class: 'v05-zeile__text', text: new Array(z.ein + 1).join('    ') + z.text })]);
        zeilenEl.push(r); codeEl.appendChild(r);
      });
    }
    function wertText(v) { return v === null ? 'noch leer' : String(v); }
    function zeige(ansagen, vorsatz) {
      var aktiv = p > 0 ? l.ereignisse[p - 1].zeile : -1, z = zustandNach(l, p), fertig = p >= l.ereignisse.length, fehlerNun = fertig && l.fehler;
      zeilenEl.forEach(function (r, j) {
        r.classList.toggle('is-jetzt', j === aktiv);
        r.classList.toggle('is-fehler', j === aktiv && !!fehlerNun);
        if (j === aktiv) r.setAttribute('aria-current', 'true'); else r.removeAttribute('aria-current');
      });
      setzeSchalter(zaehlen, cfg.zaehlen); vergleichZeile.hidden = !cfg.zaehlen;
      auswahl.value = cfg.fassung;
      var spalten = ['Zeile', 'i', 'punkte', 'summe'].concat(cfg.zaehlen ? ['anzahl'] : []);
      var zeilen = [];
      for (var q = 1; q <= p; q++) {
        var e = l.ereignisse[q - 1], s = e.nachher;
        var zellen = [e.zeile + 1, wertText(s.i), wertText(s.punkte), wertText(s.summe)].concat(cfg.zaehlen ? [wertText(s.anzahl)] : []);
        var tr = el('tr', { class: q === p ? 'is-jetzt' : '' }, zellen.map(function (t, c) { return c === 0 ? el('th', { scope: 'row', text: String(t) }) : el('td', { text: String(t) }); }));
        if (q === p) tr.setAttribute('aria-current', 'true');
        zeilen.push(tr);
      }
      tabelleHost.textContent = '';
      tabelleHost.appendChild(el('table', { class: 'k-types v05-tabelle' }, [
        el('caption', { class: 'k-sr', text: 'Werte der Variablen nach jeder ausgeführten Zeile; die letzte Zeile ist markiert' }),
        el('thead', {}, [el('tr', {}, spalten.map(function (t) { return el('th', { scope: 'col', text: t }); }))]),
        el('tbody', {}, zeilen.length ? zeilen : [el('tr', {}, [el('td', { colspan: String(spalten.length), text: 'Noch nichts ausgeführt.' })])])
      ]));
      ausgabeEl.textContent = z.ausgabe.length ? z.ausgabe.join('\n') : '(noch nichts)';
      meldung.hidden = !fehlerNun;
      meldung.textContent = '';
      if (fehlerNun) { meldung.appendChild(el('span', { text: fehlerNun })); meldung.appendChild(el('br')); meldung.appendChild(el('span', { text: 'So bricht Python ab: Die Zeile benutzt summe, bevor summe einen Wert hat.' })); }
      jetzt.textContent = p === 0 ? 'Noch keine Zeile ausgeführt.' : (fertig ? (fehlerNun ? 'Abbruch mit Fehlermeldung.' : 'Fertig: Das Programm ist zu Ende.') : 'Zuletzt ausgeführt: Zeile ' + (aktiv + 1) + '.');
      sperre(einer, fertig); sperre(ende, fertig); sperre(zurueck, p === 0);
      if (ansagen) status.textContent = (vorsatz || '') + satzSumme(l, p);
    }
    function reset(vorsatz) { l = lauf(cfg); p = 0; baueCode(); zeige(!!vorsatz, vorsatz ? vorsatz + 'Das Programm steht am Anfang. ' : ''); }
    auswahl.addEventListener('change', function () { cfg.fassung = auswahl.value; reset('Fassung ' + fassungMit(cfg.fassung).text + '. '); });
    einer.addEventListener('click', function () { if (p >= l.ereignisse.length) return; p++; zeige(true); });
    ende.addEventListener('click', function () { if (p >= l.ereignisse.length) return; p = l.ereignisse.length; zeige(true); });
    zurueck.addEventListener('click', function () { if (p === 0) return; reset('Von vorn. '); });
    reset('');
    host.appendChild(el('div', { class: 'v05-summe' }, [
      el('div', { class: 'v05-summe__links' }, [
        auswahlZeile, el('p', { class: 'v05-titel', text: 'Punkte der vier Blätter' }), werteZeile, el('p', { id: id + '-hinweis', class: 'k-small k-muted', text: '0 bis 10, ganze Zahl' }),
        el('div', { class: 'v05-schalterreihe' }, [zaehlen.knopf]), vergleichZeile, codeEl
      ]),
      el('div', { class: 'v05-summe__rechts' }, [
        el('div', { class: 'v05-aktionen' }, [einer, ende, zurueck]), jetzt,
        el('p', { class: 'v05-titel', text: 'Werte nach jeder Zeile' }), tabelleHost,
        el('p', { class: 'v05-titel', text: 'Bisherige Ausgabe' }), ausgabeEl, meldung, status
      ])
    ]));
  }

  function init() {
    var map = { byte: initByte, range: initRange, summe: initSumme };
    Object.keys(map).forEach(function (k) {
      Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="' + k + '"]'), function (host) {
        if (host._v05) return;
        host._v05 = true;
        map[k](host);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
