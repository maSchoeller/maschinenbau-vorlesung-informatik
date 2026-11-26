/* =============================================================
   explorables-v04.js – interaktive Bausteine für Termin 04 (Solange es stimmt: Formeln und Schleifen)
     data-explorable="vier-schalter" „Vier Schalter, eine Presse“: Schalter A bis D, Auswahl eines von drei Ausdrücken,
                                     Lampe mit Text, Tabelle mit 16 Zeilen (0000 bis 1111) und Hilfsspalten, aktuelle Zeile markiert
     data-explorable="gleichwertig"  „Gleichwertig oder nicht?“: Auswahl eines von vier Paaren, beide Ergebnisspalten nebeneinander,
                                     Unterschiedszeilen mit Zeichen und Text markiert, Urteil darunter
     data-explorable="schleife"      „Die Schleife von Hand drehen“: Plan mit Rücksprung (KursPAP.svg), Knöpfe „Ein Schritt“ und
                                     „Bis zum Ende“, Zähler, Ausgabe, Anzahl der Durchläufe; ohne Verringern Abbruch nach 20 Schritten
   Schreibweise in den Tabellen: 1 für wahr, 0 für falsch (so auch in der Klausur).
   Eigenständig wie alle explorables-vNN.js: keine Bibliothek, Texte per textContent.
   Der Rechenkern steht oben und ist ohne Browser prüfbar (module.exports).
   ============================================================= */
(function () {
  'use strict';

  /* ── Rechenkern: Logik (ohne DOM) ─────────────────────────── */
  function und(a, b) { return a && b ? 1 : 0; }
  function oder(a, b) { return a || b ? 1 : 0; }
  function nicht(x) { return x ? 0 : 1; }
  function bits(i, n) {
    var r = [];
    for (var k = n - 1; k >= 0; k--) r.push((i >> k) & 1);
    return r;
  }
  function liste(teile) {
    if (teile.length <= 1) return teile.join('');
    return teile.slice(0, -1).join(', ') + ' und ' + teile[teile.length - 1];
  }

  /* ── Vier Variablen: Ausdrücke mit zwei Hilfsspalten ──────── */
  var VARIABLEN = [
    { name: 'A', text: 'Taster links' },
    { name: 'B', text: 'Taster rechts' },
    { name: 'C', text: 'Schutztür' },
    { name: 'D', text: 'Druck' }
  ];
  var AUSDRUECKE = [
    { id: 'f', text: 'F = (A UND B) UND (C UND D)', spalte: 'F', lampe: 'Hub frei', hilf: ['A UND B', 'C UND D'],
      rechne: function (a, b, c, d) { return [und(a, b), und(c, d)]; }, ergebnis: function (h) { return und(h[0], h[1]); } },
    { id: 'y', text: 'Y = (A UND B) ODER (C UND D)', spalte: 'Y', lampe: 'Lampe Y', hilf: ['A UND B', 'C UND D'],
      rechne: function (a, b, c, d) { return [und(a, b), und(c, d)]; }, ergebnis: function (h) { return oder(h[0], h[1]); } },
    { id: 's', text: 'Stör = (NICHT C) ODER (NICHT D)', spalte: 'Stör', lampe: 'Störlampe', hilf: ['NICHT C', 'NICHT D'],
      rechne: function (a, b, c, d) { return [nicht(c), nicht(d)]; }, ergebnis: function (h) { return oder(h[0], h[1]); } }
  ];
  function ausdruckMit(id) { return AUSDRUECKE.filter(function (a) { return a.id === id; })[0] || AUSDRUECKE[0]; }
  /* Die 16 Zeilen in der Reihenfolge 0000 bis 1111: D wechselt jede Zeile, C alle 2, B alle 4, A alle 8 */
  function zeilenVier(ausdruck) {
    var r = [];
    for (var i = 0; i < 16; i++) {
      var v = bits(i, 4), h = ausdruck.rechne(v[0], v[1], v[2], v[3]);
      r.push({ a: v[0], b: v[1], c: v[2], d: v[3], hilf: h, y: ausdruck.ergebnis(h) });
    }
    return r;
  }
  function zeileVonVier(a, b, c, d) { return a * 8 + b * 4 + c * 2 + d; }
  function anzahlEinsen(ausdruck) { return zeilenVier(ausdruck).filter(function (z) { return z.y === 1; }).length; }
  function satzVier(ausdruck, a, b, c, d) {
    var z = zeilenVier(ausdruck)[zeileVonVier(a, b, c, d)];
    return ausdruck.text + '. A = ' + a + ', B = ' + b + ', C = ' + c + ', D = ' + d + '. ' + ausdruck.lampe + ': ' + (z.y ? 'leuchtet' : 'aus') + ', ' + ausdruck.spalte + ' = ' + z.y + '.';
  }

  /* ── Gleichwertig: vier Paare ─────────────────────────────── */
  var PAARE = [
    { id: 'sperre', titel: 'Sperre', vars: ['C', 'D'],
      links: 'NICHT (C UND D)', rechts: '(NICHT C) ODER (NICHT D)',
      f1: function (v) { return nicht(und(v[0], v[1])); }, f2: function (v) { return oder(nicht(v[0]), nicht(v[1])); } },
    { id: 'ruhe', titel: 'Ruhezustand', vars: ['A', 'B'],
      links: 'NICHT (A ODER B)', rechts: '(NICHT A) UND (NICHT B)',
      f1: function (v) { return nicht(oder(v[0], v[1])); }, f2: function (v) { return und(nicht(v[0]), nicht(v[1])); } },
    { id: 'falle', titel: 'Falle', vars: ['C', 'D'],
      links: 'NICHT (C UND D)', rechts: '(NICHT C) UND (NICHT D)',
      f1: function (v) { return nicht(und(v[0], v[1])); }, f2: function (v) { return und(nicht(v[0]), nicht(v[1])); } },
    { id: 'vorrang', titel: 'Vorrang', vars: ['A', 'B', 'C'],
      links: '(A ODER B) UND C', rechts: 'A ODER (B UND C)',
      f1: function (v) { return und(oder(v[0], v[1]), v[2]); }, f2: function (v) { return oder(v[0], und(v[1], v[2])); } }
  ];
  function paarMit(id) { return PAARE.filter(function (p) { return p.id === id; })[0] || PAARE[0]; }
  function zeilenPaar(paar) {
    var n = paar.vars.length, r = [];
    for (var i = 0; i < (1 << n); i++) {
      var v = bits(i, n), l = paar.f1(v), rr = paar.f2(v);
      r.push({ werte: v, name: v.join(''), links: l, rechts: rr, anders: l !== rr });
    }
    return r;
  }
  function unterschiede(paar) { return zeilenPaar(paar).filter(function (z) { return z.anders; }).map(function (z) { return z.name; }); }
  function urteil(paar) {
    var u = unterschiede(paar);
    if (!u.length) return 'gleichwertig';
    return 'nicht gleichwertig, Unterschied in Zeile ' + liste(u);
  }
  function spalteText(paar, seite) { return zeilenPaar(paar).map(function (z) { return z[seite]; }).join(' '); }
  function satzPaar(paar) {
    return paar.titel + ': ' + paar.links + ' hat die Spalte ' + spalteText(paar, 'links') + ', ' + paar.rechts + ' hat die Spalte ' + spalteText(paar, 'rechts') + '. Urteil: ' + urteil(paar) + '.';
  }

  /* ── Schleife: Rechenkern ─────────────────────────────────── */
  var STARTWERTE = [0, 1, 3, 5];
  var VERGLEICHE = ['>', '>='];
  var GRENZE = 20;   /* Schritte, nach denen ein Lauf ohne Verringern als Endlosschleife gilt */
  var ALS_NAECHSTES = { start: 'Start', init: 'Zähler setzen', frage: 'Schleifenbedingung prüfen', ausgabe: 'Zähler ausgeben', verringern: 'Zähler verringern', schluss: 'Start! ausgeben', ende: 'Ende' };
  function standard() { return { start: 3, op: '>', verr: true }; }
  function bedingung(cfg) { return 'zaehler ' + cfg.op + ' 0'; }
  function wahrBei(zaehler, op) { return op === '>=' ? zaehler >= 0 : zaehler > 0; }
  function neu() { return { pos: 'start', zaehler: null, ausgabe: [], rumpf: 0, schritte: 0, fertig: false, endlos: false, frage: null, letzte: 'Der Plan steht am Start.' }; }
  function schritt(z, cfg) {
    if (z.fertig || z.endlos) return z;
    var n = { pos: z.pos, zaehler: z.zaehler, ausgabe: z.ausgabe.slice(), rumpf: z.rumpf, schritte: z.schritte + 1, fertig: false, endlos: false, frage: z.frage, letzte: '' };
    if (z.pos === 'start') { n.pos = 'init'; n.letzte = 'Start.'; }
    else if (z.pos === 'init') { n.zaehler = cfg.start; n.pos = 'frage'; n.letzte = 'zaehler = ' + cfg.start + '.'; }
    else if (z.pos === 'frage') {
      var w = wahrBei(z.zaehler, cfg.op);
      n.frage = { text: z.zaehler + ' ' + cfg.op + ' 0', wahr: w };
      n.pos = w ? 'ausgabe' : 'schluss';
      n.letzte = n.frage.text + ' ist ' + (w ? 'wahr: Weg ja, der Rumpf läuft.' : 'falsch: Weg nein, die Schleife ist zu Ende.');
    } else if (z.pos === 'ausgabe') {
      n.ausgabe.push(String(z.zaehler)); n.rumpf = z.rumpf + 1;
      n.pos = cfg.verr ? 'verringern' : 'frage';
      n.letzte = 'Ausgabe ' + z.zaehler + '.' + (cfg.verr ? '' : ' Zurück zur Raute.');
    } else if (z.pos === 'verringern') {
      n.zaehler = z.zaehler - 1; n.pos = 'frage';
      n.letzte = 'zaehler = ' + n.zaehler + '. Zurück zur Raute.';
    } else if (z.pos === 'schluss') {
      n.ausgabe.push('Start!'); n.pos = 'ende'; n.fertig = true; n.letzte = 'Ausgabe Start!. Der Plan ist zu Ende.';
    }
    if (!n.fertig && !cfg.verr && n.schritte >= GRENZE) { n.endlos = true; n.letzte += ' Das wäre eine Endlosschleife.'; }
    return n;
  }
  function bisEnde(z, cfg) {
    var s = z, k = 0;
    while (!s.fertig && !s.endlos && k < 1000) { s = schritt(s, cfg); k++; }
    return s;
  }
  function rumpfText(z) { return 'Der Rumpf lief ' + z.rumpf + '-mal.'; }
  function satzSchleife(z) {
    var t = z.letzte + ' Zähler: ' + (z.zaehler === null ? 'noch nicht gesetzt' : z.zaehler) + '. ' + rumpfText(z);
    if (z.ausgabe.length) t += ' Bisherige Ausgabe: ' + z.ausgabe.join(', ') + '.';
    return t;
  }
  /* Der Plan für pap-engine.js (P = window.KursPAP.P); ohne Verringern fehlt der Knoten im Rumpf */
  function planSpec(P, cfg) {
    var rumpf = [P.io('Ausgabe: zaehler', 'ausgabe')];
    if (cfg.verr) rumpf.push(P.op('zaehler = zaehler - 1', 'verringern'));
    return [
      P.start('start'),
      P.op('zaehler = ' + cfg.start, 'init'),
      P.whil(bedingung(cfg) + '?', rumpf, 'frage'),
      P.io('Ausgabe: "Start!"', 'schluss'),
      P.end('ende')
    ];
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      und: und, oder: oder, nicht: nicht, bits: bits, liste: liste,
      VARIABLEN: VARIABLEN, AUSDRUECKE: AUSDRUECKE, ausdruckMit: ausdruckMit, zeilenVier: zeilenVier, zeileVonVier: zeileVonVier, anzahlEinsen: anzahlEinsen, satzVier: satzVier,
      PAARE: PAARE, paarMit: paarMit, zeilenPaar: zeilenPaar, unterschiede: unterschiede, urteil: urteil, spalteText: spalteText, satzPaar: satzPaar,
      STARTWERTE: STARTWERTE, VERGLEICHE: VERGLEICHE, GRENZE: GRENZE, ALS_NAECHSTES: ALS_NAECHSTES, standard: standard, bedingung: bedingung, wahrBei: wahrBei,
      neu: neu, schritt: schritt, bisEnde: bisEnde, rumpfText: rumpfText, satzSchleife: satzSchleife, planSpec: planSpec
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
  function markiere(tr, an) {
    tr.classList.toggle('is-jetzt', an);
    if (an) tr.setAttribute('aria-current', 'true'); else tr.removeAttribute('aria-current');
  }
  /* Knopfgruppe mit „gedrückt“-Zustand */
  function knopfgruppe(label, eintraege, aktiv, fn) {
    var gruppe = el('div', { class: 'v04-knoepfe', role: 'group', 'aria-label': label }), knoepfe = [];
    eintraege.forEach(function (e) {
      var b = el('button', { type: 'button', class: 'v04-knopf' + (e.code ? ' is-code' : ''), 'aria-pressed': 'false', text: e.text });
      if (e.aria) b.setAttribute('aria-label', e.aria);
      b.addEventListener('click', function () { setze(e.wert); fn(e.wert); });
      knoepfe.push({ b: b, wert: e.wert });
      gruppe.appendChild(b);
    });
    function setze(wert) { knoepfe.forEach(function (k) { k.b.setAttribute('aria-pressed', k.wert === wert ? 'true' : 'false'); }); }
    setze(aktiv);
    return gruppe;
  }
  function schalterKnopf(text, fn) {
    var b = el('button', { type: 'button', class: 'v04-schalter', role: 'switch', 'aria-checked': 'false' });
    var z = el('span', { class: 'v04-schalter__zustand' });
    b.appendChild(el('span', { class: 'v04-schalter__name', text: text }));
    b.appendChild(el('span', { class: 'v04-schalter__hebel', 'aria-hidden': 'true' }));
    b.appendChild(z);
    b.addEventListener('click', fn);
    return { knopf: b, zustand: z };
  }
  function setzeSchalter(s, an) {
    s.knopf.setAttribute('aria-checked', an ? 'true' : 'false');
    s.knopf.classList.toggle('is-an', !!an);
    s.zustand.textContent = (an ? 'an' : 'aus') + ' · ' + (an ? 1 : 0);
  }

  /* ── Vier Schalter ────────────────────────────────────────── */
  function initVier(host) {
    var id = 'v04-vier-' + (++nr);
    var wert = { A: 0, B: 0, C: 0, D: 0 }, aktuell = AUSDRUECKE[0];
    var NAMEN = ['A', 'B', 'C', 'D'];
    host.textContent = '';
    var schalter = {};
    VARIABLEN.forEach(function (v) {
      schalter[v.name] = schalterKnopf(v.name + ' ' + v.text, function () { wert[v.name] = wert[v.name] ? 0 : 1; zeige(true); });
      schalter[v.name].knopf.setAttribute('aria-label', 'Schalter ' + v.name + ', ' + v.text);
    });
    var auswahl = el('select', { id: id, class: 'v04-auswahl' }, AUSDRUECKE.map(function (a) { return el('option', { value: a.id, text: a.text }); }));
    var auswahlZeile = el('div', { class: 'v04-auswahlzeile' }, [el('label', { for: id, text: 'Ausdruck' }), auswahl]);
    var lz = el('span', { class: 'v04-lampe__zustand' }), ln = el('span', { class: 'v04-lampe__name' });
    var lampe = el('div', { class: 'v04-lampe' }, [el('span', { class: 'v04-lampe__licht', 'aria-hidden': 'true' }), ln, lz]);
    var tabelleHost = el('div', { class: 'v04-tabelle-host' });
    var status = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    var zeilen = [];
    function baueTabelle() {
      zeilen = zeilenVier(aktuell).map(function (z) {
        var zellen = [z.a, z.b, z.c, z.d].map(function (v) { return el('th', { scope: 'row' }, [String(v)]); })
          .concat(z.hilf.map(function (v) { return el('td', {}, [String(v)]); }), [el('td', { class: 'v04-ergebnis' }, [String(z.y)])]);
        return el('tr', {}, zellen);
      });
      var kopf = ['A', 'B', 'C', 'D'].concat(aktuell.hilf, [aktuell.spalte]);
      tabelleHost.textContent = '';
      tabelleHost.appendChild(el('table', { class: 'k-types v04-tabelle' }, [
        el('caption', { class: 'k-sr', text: 'Wahrheitstabelle mit 16 Zeilen für ' + aktuell.text + ' mit Hilfsspalten; die Zeile der aktuellen Schalterstellung ist markiert' }),
        el('thead', {}, [el('tr', {}, kopf.map(function (t) { return el('th', { scope: 'col', text: t }); }))]),
        el('tbody', {}, zeilen)
      ]));
    }
    function zeige(ansagen) {
      NAMEN.forEach(function (n) { setzeSchalter(schalter[n], wert[n]); });
      var i = zeileVonVier(wert.A, wert.B, wert.C, wert.D), y = zeilenVier(aktuell)[i].y;
      lampe.classList.toggle('is-an', !!y);
      ln.textContent = aktuell.lampe;
      lz.textContent = (y ? 'leuchtet' : 'aus') + ' · ' + y;
      zeilen.forEach(function (tr, k) { markiere(tr, k === i); });
      if (ansagen) status.textContent = satzVier(aktuell, wert.A, wert.B, wert.C, wert.D);
    }
    auswahl.addEventListener('change', function () { aktuell = ausdruckMit(auswahl.value); baueTabelle(); zeige(true); });
    baueTabelle(); zeige(false);
    host.appendChild(el('div', { class: 'v04-bau v04-vier-bau' }, [
      el('div', { class: 'v04-bau__links' }, [
        auswahlZeile,
        el('div', { class: 'v04-schalterreihe', role: 'group', 'aria-label': 'Schalter' }, NAMEN.map(function (n) { return schalter[n].knopf; })),
        el('div', { class: 'v04-lampen' }, [lampe])
      ]),
      el('div', { class: 'v04-bau__rechts' }, [tabelleHost]),
      status
    ]));
  }

  /* ── Gleichwertig ─────────────────────────────────────────── */
  function initGleichwertig(host) {
    var id = 'v04-gleich-' + (++nr);
    var aktuell = PAARE[0];
    host.textContent = '';
    var auswahl = el('select', { id: id, class: 'v04-auswahl' }, PAARE.map(function (p) { return el('option', { value: p.id, text: p.titel + ': ' + p.links + ' und ' + p.rechts }); }));
    var auswahlZeile = el('div', { class: 'v04-auswahlzeile' }, [el('label', { for: id, text: 'Paar' }), auswahl]);
    var tabelleHost = el('div', { class: 'v04-tabelle-host' });
    var urteilEl = el('p', { class: 'v04-urteil' });
    var status = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    function zeige(ansagen) {
      var daten = zeilenPaar(aktuell), u = unterschiede(aktuell);
      var zeilen = daten.map(function (z) {
        return el('tr', { class: z.anders ? 'is-anders' : '' }, z.werte.map(function (v) { return el('th', { scope: 'row' }, [String(v)]); })
          .concat([el('td', {}, [String(z.links)]), el('td', {}, [String(z.rechts)]),
            el('td', { class: 'v04-vergleich' }, [z.anders ? '≠ anders' : '= gleich'])]));
      });
      tabelleHost.textContent = '';
      tabelleHost.appendChild(el('table', { class: 'k-types v04-tabelle' }, [
        el('caption', { class: 'k-sr', text: 'Wahrheitstabelle für ' + aktuell.links + ' und ' + aktuell.rechts + '; Zeilen mit unterschiedlichem Ergebnis stehen mit „anders“ in der letzten Spalte' }),
        el('thead', {}, [el('tr', {}, aktuell.vars.concat([aktuell.links, aktuell.rechts, 'Vergleich']).map(function (t) { return el('th', { scope: 'col', text: t }); }))]),
        el('tbody', {}, zeilen)
      ]));
      urteilEl.textContent = 'Urteil: ' + urteil(aktuell);
      urteilEl.classList.toggle('is-gleich', !u.length);
      urteilEl.classList.toggle('is-ungleich', u.length > 0);
      if (ansagen) status.textContent = satzPaar(aktuell);
    }
    auswahl.addEventListener('change', function () { aktuell = paarMit(auswahl.value); zeige(true); });
    zeige(false);
    host.appendChild(el('div', { class: 'v04-gleich' }, [auswahlZeile, tabelleHost, urteilEl, status]));
  }

  /* ── Schleife ─────────────────────────────────────────────── */
  function initSchleife(host) {
    var K = window.KursPAP;
    if (!K) { host.textContent = 'Der Programmablaufplan konnte nicht geladen werden.'; return; }
    var P = K.P || K;
    var cfg = standard(), z = neu();
    host.textContent = '';
    var bild = el('div', { class: 'pap-wrap v04-schleife__plan' });
    var startKnoepfe = knopfgruppe('Startwert des Zählers', STARTWERTE.map(function (w) { return { wert: w, text: String(w), aria: 'Startwert ' + w }; }), cfg.start, function (w) { cfg.start = w; reset(true); });
    var vergleichKnoepfe = knopfgruppe('Vergleich in der Schleifenbedingung', VERGLEICHE.map(function (o) { return { wert: o, text: o, code: true, aria: o === '>' ? 'größer als (>)' : 'größer oder gleich (>=)' }; }), cfg.op, function (o) { cfg.op = o; reset(true); });
    var verrSchalter = schalterKnopf('Zähler im Rumpf verringern', function () { cfg.verr = !cfg.verr; reset(true); });
    var einer = el('button', { type: 'button', class: 'v04-aktion', text: 'Ein Schritt' });
    var ende = el('button', { type: 'button', class: 'v04-aktion', text: 'Bis zum Ende' });
    var zurueck = el('button', { type: 'button', class: 'v04-aktion v04-aktion--leise', text: 'Von vorn' });
    var jetzt = el('p', { class: 'v04-jetzt' });
    var zaehlerEl = el('strong', { class: 'v04-wert' }), rumpfEl = el('p', { class: 'v04-rumpf' });
    var ausgabeEl = el('pre', { class: 'v04-ausgabe', 'aria-label': 'Bisherige Ausgabe' });
    var meldung = el('p', { class: 'v04-meldung', hidden: '' });
    var status = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    function baue() {
      var spec = planSpec(P, cfg);
      bild.innerHTML = K.svg(spec, { label: 'Plan der Schleife: ' + K.describe(spec), cls: 'pap--run v04-pap', minw: 0.6 });
    }
    function aus() { return z.fertig || z.endlos; }
    function zeige(ansagen) {
      Array.prototype.forEach.call(bild.querySelectorAll('.pap-n'), function (k) {
        var an = k.getAttribute('data-id') === z.pos && !z.endlos;
        k.classList.toggle('is-aktiv', an);
        k.classList.toggle('is-ruhe', !an);
      });
      setzeSchalter(verrSchalter, cfg.verr);
      jetzt.textContent = z.endlos ? 'Der Plan steht still.' : (z.fertig ? 'Fertig: Das Ende ist erreicht.' : 'Als Nächstes: ' + ALS_NAECHSTES[z.pos] + '.');
      zaehlerEl.textContent = z.zaehler === null ? 'noch nicht gesetzt' : String(z.zaehler);
      rumpfEl.textContent = rumpfText(z);
      ausgabeEl.textContent = z.ausgabe.length ? z.ausgabe.join('\n') : '(noch nichts)';
      meldung.hidden = !z.endlos;
      meldung.textContent = z.endlos ? 'Das wäre eine Endlosschleife. Nach ' + GRENZE + ' Schritten hört der Baustein auf. Der Zähler ändert sich nie, die Bedingung bleibt wahr.' : '';
      [einer, ende].forEach(function (b) { b.setAttribute('aria-disabled', aus() ? 'true' : 'false'); b.classList.toggle('is-aus', aus()); });
      if (ansagen) status.textContent = satzSchleife(z);
    }
    function reset(ansagen) {
      z = neu(); baue(); zeige(false);
      if (ansagen) status.textContent = 'Neu eingestellt: Startwert ' + cfg.start + ', Bedingung ' + bedingung(cfg) + ', Zähler ' + (cfg.verr ? 'wird' : 'wird nicht') + ' verringert. Der Plan steht am Start.';
    }
    einer.addEventListener('click', function () { if (aus()) return; z = schritt(z, cfg); zeige(true); });
    ende.addEventListener('click', function () { if (aus()) return; z = bisEnde(z, cfg); zeige(true); });
    zurueck.addEventListener('click', function () { reset(true); });
    reset(false);
    host.appendChild(el('div', { class: 'v04-schleife' }, [
      el('div', { class: 'v04-schleife__links' }, [
        el('p', { class: 'v04-titel', text: 'Startwert' }), startKnoepfe,
        el('p', { class: 'v04-titel', text: 'Vergleich' }), vergleichKnoepfe,
        el('div', { class: 'v04-schalterreihe' }, [verrSchalter.knopf]),
        bild
      ]),
      el('div', { class: 'v04-schleife__rechts' }, [
        el('div', { class: 'v04-aktionen' }, [einer, ende, zurueck]),
        jetzt,
        el('p', { class: 'v04-titel', text: 'Zähler' }), el('p', { class: 'v04-zaehler' }, [el('code', { class: 'k-i', text: 'zaehler' }), ' = ', zaehlerEl]),
        el('p', { class: 'v04-titel', text: 'Bisherige Ausgabe' }), ausgabeEl,
        rumpfEl, meldung, status
      ])
    ]));
  }

  function init() {
    var map = { 'vier-schalter': initVier, gleichwertig: initGleichwertig, schleife: initSchleife };
    Object.keys(map).forEach(function (k) {
      Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="' + k + '"]'), function (host) {
        if (host._v04) return;
        host._v04 = true;
        map[k](host);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
