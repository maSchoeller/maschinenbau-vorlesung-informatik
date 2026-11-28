/* =============================================================
   explorables-v09.js – interaktive Bausteine für Termin 09 (Rechneraufbau, Programm zerlegen, Spielzeug-Rechner)
     data-explorable="bauteile"  „Rechner-Baukasten“: Schema mit Prozessor, Arbeitsspeicher, SSD, Eingabe und Ausgabe und einem Bus;
                                 sechs Knöpfe (Spiel starten, Taste drücken, Rechnen, Ergebnis zeigen, Spielstand speichern, Strom aus),
                                 je Knopf leuchten die beteiligten Bauteile und Pfeile am Bus auf, ein Satz sagt, was passiert
     data-explorable="zerlegen"  „Programm zerlegen“: Getränkeautomat (Getränk 1 bis 3, Geld 0 bis 5 Euro in halben Euro),
                                 langes Programm mit drei Gruppen, „Zerlegen“ bildet die Funktionen preis_von und antwort,
                                 „Beide laufen lassen“ zeigt unter beiden Fassungen die Ausgabe, beim zerlegten Programm die nächste Zeile
     data-explorable="spielzeug" „Spielzeug-Rechner“: vier Zellen A bis D, Rechenplatz, vier Befehle (LADE, ADDIERE, SPEICHERE, STOPP),
                                 zwei feste Programme, Knöpfe „Ein Takt“, „Ein Befehl“, „Von vorn“, drei Lämpchen für holen, entschlüsseln, ausführen
   Eigenständig wie alle explorables-vNN.js: keine Bibliothek, Texte per textContent.
   Der Rechenkern steht oben und ist ohne Browser prüfbar (module.exports, app/skripte/tests/explorables-v09.test.mjs).
   Im Ausgangszustand steht keine Lösung: Ergebnisse erscheinen erst nach dem Ausprobieren.
   Meldungstexte ohne Gedankenstrich. Zustand steht immer auch als Wort, Zeichen oder Linienstärke da, nie nur als Farbe.
   ============================================================= */
(function () {
  'use strict';

  /* ── Rechenkern: bauteile ─────────────────────────────────── */
  var BAUTEIL_NAMEN = { prozessor: 'Prozessor', ram: 'Arbeitsspeicher', ssd: 'SSD', ea: 'Eingabe und Ausgabe' };
  /* Kanten: Richtung 'zum_bus' (vom Bauteil auf den Bus), 'vom_bus' (vom Bus zum Bauteil) oder 'beide' */
  var SZENARIEN = [
    { id: 'starten', knopf: 'Spiel starten' },
    { id: 'taste', knopf: 'Taste drücken' },
    { id: 'rechnen', knopf: 'Rechnen' },
    { id: 'ergebnis', knopf: 'Ergebnis zeigen' },
    { id: 'speichern', knopf: 'Spielstand speichern' },
    { id: 'strom_aus', knopf: 'Strom aus' }
  ];
  var MELDUNG_AUS = 'Der Rechner ist aus und der Arbeitsspeicher ist leer. Drück „Spiel starten“, dann geht der Rechner wieder an.';
  /* Ausgangszustand: Auf der SSD liegt Level 3, im Arbeitsspeicher läuft das Spiel bei Level 5 */
  function startBau() { return { ssd: 3, ram: 5 }; }
  function laeuft(z) { return z.ram !== null; }
  function stromAus(z) { return { ssd: z.ssd, ram: null }; }
  function speichern(z) { return laeuft(z) ? { ssd: z.ram, ram: z.ram } : { ssd: z.ssd, ram: z.ram }; }
  function laden(z) { return laeuft(z) ? { ssd: z.ssd, ram: z.ram } : { ssd: z.ssd, ram: z.ssd }; }
  function ssdText(z) { return 'Spielstand: Level ' + z.ssd; }
  function ramText(z) { return laeuft(z) ? 'Spiel läuft: Level ' + z.ram : 'leer'; }
  function kanten(spec) { return spec; }
  /* Ein Knopf: neuer Zustand, beteiligte Bauteile, Kanten am Bus, Satz */
  function anwenden(z, id) {
    var aus = { zustand: z, boxen: [], kanten: [], satz: MELDUNG_AUS, geaendert: false };
    if (id === 'starten') {
      if (laeuft(z)) return {
        zustand: z, boxen: ['ssd', 'ram'], kanten: kanten([{ box: 'ssd', richtung: 'zum_bus' }, { box: 'ram', richtung: 'vom_bus' }]),
        satz: 'Beim Start kam das Spiel von der SSD über den Bus in den Arbeitsspeicher. Es läuft schon.', geaendert: false
      };
      var n = laden(z);
      return {
        zustand: n, boxen: ['ssd', 'ram'], kanten: kanten([{ box: 'ssd', richtung: 'zum_bus' }, { box: 'ram', richtung: 'vom_bus' }]),
        satz: 'Das Spiel wird von der SSD in den Arbeitsspeicher geladen. Es startet bei Level ' + n.ram + '.', geaendert: true
      };
    }
    if (id === 'strom_aus') {
      var s = stromAus(z);
      return {
        zustand: s, boxen: [], kanten: [],
        satz: laeuft(z) ? 'Strom aus. Der Arbeitsspeicher ist leer. Die SSD zeigt weiter: ' + ssdText(s) + '.' : 'Der Strom war schon aus. Die SSD zeigt weiter: ' + ssdText(s) + '.',
        geaendert: laeuft(z)
      };
    }
    if (!laeuft(z)) return aus;
    if (id === 'taste') {
      return { zustand: z, boxen: ['ea', 'prozessor'], kanten: kanten([{ box: 'ea', richtung: 'zum_bus' }, { box: 'prozessor', richtung: 'vom_bus' }]), satz: 'Die Taste geht über die Eingabe und den Bus zum Prozessor.', geaendert: false };
    }
    if (id === 'rechnen') {
      return {
        zustand: z, boxen: ['prozessor', 'ram'], kanten: kanten([{ box: 'prozessor', richtung: 'beide' }, { box: 'ram', richtung: 'beide' }]),
        satz: 'Der Prozessor holt Befehle und Daten aus dem Arbeitsspeicher, rechnet und legt Zwischenergebnisse dort wieder ab.', geaendert: false
      };
    }
    if (id === 'ergebnis') {
      return {
        zustand: z, boxen: ['prozessor', 'ram', 'ea'], kanten: kanten([{ box: 'prozessor', richtung: 'zum_bus' }, { box: 'ram', richtung: 'vom_bus' }, { box: 'ea', richtung: 'vom_bus' }]),
        satz: 'Das Ergebnis geht über den Bus zum Arbeitsspeicher und weiter zur Ausgabe.', geaendert: false
      };
    }
    if (id === 'speichern') {
      var g = speichern(z);
      return {
        zustand: g, boxen: ['ram', 'ssd'], kanten: kanten([{ box: 'ram', richtung: 'zum_bus' }, { box: 'ssd', richtung: 'vom_bus' }]),
        satz: 'Der Spielstand Level ' + g.ssd + ' wird vom Arbeitsspeicher auf die SSD kopiert.', geaendert: g.ssd !== z.ssd
      };
    }
    return aus;
  }

  /* ── Rechenkern: zerlegen ─────────────────────────────────── */
  var GRUPPEN = { eingabe: 'Eingabe', preis: 'Preis bestimmen', antwort: 'Antwort bilden' };
  var GRUPPEN_KURZ = { eingabe: 'Eingabe', preis: 'Preis', antwort: 'Antwort' };
  var GRUPPEN_ID = ['eingabe', 'preis', 'antwort'];
  var Z_WAHL = 'wahl = int(input("Getränk (1 Cola, 2 Wasser, 3 Saft): "))';
  var Z_GELD = 'geld = float(input("Geld in Euro: "))';
  var Z_BITTE = 'f"Bitte sehr. Wechselgeld: {rest:.2f} Euro"';
  var Z_FEHLT = 'f"Es fehlen {fehlt:.2f} Euro"';
  /* Das lange Programm (14 Zeilen ohne Kommentar) */
  var LANG = [
    { ein: 0, text: Z_WAHL, gruppe: 'eingabe' },
    { ein: 0, text: Z_GELD, gruppe: 'eingabe' },
    { ein: 0, text: 'if wahl == 1:', gruppe: 'preis' },
    { ein: 1, text: 'preis = 2.5', gruppe: 'preis' },
    { ein: 0, text: 'elif wahl == 2:', gruppe: 'preis' },
    { ein: 1, text: 'preis = 1.0', gruppe: 'preis' },
    { ein: 0, text: 'else:', gruppe: 'preis' },
    { ein: 1, text: 'preis = 2.0', gruppe: 'preis' },
    { ein: 0, text: 'if geld >= preis:', gruppe: 'antwort' },
    { ein: 1, text: 'rest = geld - preis', gruppe: 'antwort' },
    { ein: 1, text: 'print(' + Z_BITTE + ')', gruppe: 'antwort' },
    { ein: 0, text: 'else:', gruppe: 'antwort' },
    { ein: 1, text: 'fehlt = preis - geld', gruppe: 'antwort' },
    { ein: 1, text: 'print(' + Z_FEHLT + ')', gruppe: 'antwort' }
  ];
  /* Das zerlegte Programm; teil: wohin die Zeile gehört (preis_von, antwort, haupt); leer: Leerzeile */
  var ZERLEGT = [
    { ein: 0, text: 'def preis_von(nr):', gruppe: 'preis', teil: 'preis_von' },
    { ein: 1, text: 'if nr == 1:', gruppe: 'preis', teil: 'preis_von' },
    { ein: 2, text: 'return 2.5', gruppe: 'preis', teil: 'preis_von' },
    { ein: 1, text: 'elif nr == 2:', gruppe: 'preis', teil: 'preis_von' },
    { ein: 2, text: 'return 1.0', gruppe: 'preis', teil: 'preis_von' },
    { ein: 1, text: 'else:', gruppe: 'preis', teil: 'preis_von' },
    { ein: 2, text: 'return 2.0', gruppe: 'preis', teil: 'preis_von' },
    { ein: 0, text: '', leer: true, teil: 'trenn' },
    { ein: 0, text: 'def antwort(geld, preis):', gruppe: 'antwort', teil: 'antwort' },
    { ein: 1, text: 'if geld >= preis:', gruppe: 'antwort', teil: 'antwort' },
    { ein: 2, text: 'rest = geld - preis', gruppe: 'antwort', teil: 'antwort' },
    { ein: 2, text: 'return ' + Z_BITTE, gruppe: 'antwort', teil: 'antwort' },
    { ein: 1, text: 'else:', gruppe: 'antwort', teil: 'antwort' },
    { ein: 2, text: 'fehlt = preis - geld', gruppe: 'antwort', teil: 'antwort' },
    { ein: 2, text: 'return ' + Z_FEHLT, gruppe: 'antwort', teil: 'antwort' },
    { ein: 0, text: '', leer: true, teil: 'trenn' },
    { ein: 0, text: Z_WAHL, gruppe: 'eingabe', teil: 'haupt' },
    { ein: 0, text: Z_GELD, gruppe: 'eingabe', teil: 'haupt' },
    { ein: 0, text: 'preis = preis_von(wahl)', gruppe: 'preis', teil: 'haupt' },
    { ein: 0, text: 'print(antwort(geld, preis))', gruppe: 'antwort', teil: 'haupt' }
  ];
  var TEIL_NAMEN = { preis_von: 'Funktion preis_von', antwort: 'Funktion antwort', haupt: 'Hauptprogramm' };
  var GETRAENKE = [{ wert: 1, text: '1 Cola' }, { wert: 2, text: '2 Wasser' }, { wert: 3, text: '3 Saft' }];
  var GELD_WERTE = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
  function pyFloat(x) { return Number.isInteger(x) ? x.toFixed(1) : String(x); }
  function anzahlCode(zeilen) { return zeilen.filter(function (z) { return !z.leer; }).length; }
  function hauptZeilen() { return ZERLEGT.filter(function (z) { return z.teil === 'haupt'; }).length; }
  function einr(z) { return new Array(z.ein + 1).join('    ') + z.text; }
  function codeText(zeilen) { return zeilen.map(einr).join('\n'); }
  function preisLang(wahl) { if (wahl === 1) return 2.5; if (wahl === 2) return 1.0; return 2.0; }
  /* Das lange Programm: nur das, was print ausgibt */
  function ausgabeLang(wahl, geld) {
    var preis = preisLang(wahl);
    if (geld >= preis) { var rest = geld - preis; return 'Bitte sehr. Wechselgeld: ' + rest.toFixed(2) + ' Euro'; }
    var fehlt = preis - geld; return 'Es fehlen ' + fehlt.toFixed(2) + ' Euro';
  }
  /* Das zerlegte Programm mit echten Funktionen */
  function preisVon(nr) { if (nr === 1) return 2.5; else if (nr === 2) return 1.0; else return 2.0; }
  function antwortVon(geld, preis) {
    if (geld >= preis) { var rest = geld - preis; return 'Bitte sehr. Wechselgeld: ' + rest.toFixed(2) + ' Euro'; }
    var fehlt = preis - geld; return 'Es fehlen ' + fehlt.toFixed(2) + ' Euro';
  }
  function ausgabeZerlegt(wahl, geld) { var preis = preisVon(wahl); return antwortVon(geld, preis); }
  /* Ablauf des zerlegten Programms: welche Zeile (Index in ZERLEGT) als Nächstes dran ist */
  function ablauf(wahl, geld) {
    var preis = preisVon(wahl), s = [];
    function add(zeile, satz) { s.push({ zeile: zeile, wo: ZERLEGT[zeile].teil, satz: satz }); }
    add(16, 'Hauptprogramm: wahl wird eingelesen.');
    add(17, 'Hauptprogramm: geld wird eingelesen.');
    add(18, 'Hauptprogramm: Der Aufruf preis_von(wahl) springt in die Funktion.');
    add(1, 'In preis_von: Ist nr gleich 1?');
    if (wahl === 1) add(2, 'In preis_von: return gibt ' + pyFloat(preis) + ' zurück.');
    else {
      add(3, 'In preis_von: Ist nr gleich 2?');
      add(wahl === 2 ? 4 : 6, 'In preis_von: return gibt ' + pyFloat(preis) + ' zurück.');
    }
    add(18, 'Zurück im Hauptprogramm: preis ist jetzt ' + pyFloat(preis) + '.');
    add(19, 'Hauptprogramm: print ruft antwort(geld, preis) auf.');
    add(9, 'In antwort: Ist geld >= preis?');
    if (geld >= preis) {
      add(10, 'In antwort: rest wird ausgerechnet.');
      add(11, 'In antwort: return gibt den Text zurück.');
    } else {
      add(13, 'In antwort: fehlt wird ausgerechnet.');
      add(14, 'In antwort: return gibt den Text zurück.');
    }
    add(19, 'Zurück im Hauptprogramm: print gibt den Text aus.');
    return s;
  }
  function satzAblauf(s, p) {
    if (p >= s.length) return 'Das Programm ist zu Ende.';
    return 'Als Nächstes: ' + s[p].satz;
  }
  function geldText(g) { return pyFloat(g) + ' Euro'; }
  function eingabeText(wahl, geld) { return 'Eingabe: Getränk ' + wahl + ', Geld ' + geldText(geld); }

  /* ── Rechenkern: spielzeug ────────────────────────────────── */
  var ZELLEN = ['A', 'B', 'C', 'D'];
  var LAMPEN = ['holen', 'entschlüsseln', 'ausführen'];
  var PROGRAMME = {
    beispiel: { name: 'Beispiel (Summe)', zellen: { A: 5, B: 3, C: 0, D: 0 }, zeilen: ['LADE A', 'ADDIERE B', 'SPEICHERE C', 'STOPP'] },
    vermutung: { name: 'Vermutungsprogramm', zellen: { A: 4, B: 0, C: 0, D: 0 }, zeilen: ['LADE A', 'ADDIERE A', 'SPEICHERE B', 'ADDIERE B', 'SPEICHERE D', 'STOPP'] }
  };
  var PROGRAMM_IDS = ['beispiel', 'vermutung'];
  var TAKTE_PRO_BEFEHL = 3;
  function kopie(o) { var n = {}; Object.keys(o).forEach(function (k) { n[k] = o[k]; }); return n; }
  function neuSpielzeug(id) {
    var p = PROGRAMME[id];
    return { id: id, pc: 0, aktiv: -1, phase: -1, takte: 0, platz: 0, zellen: kopie(p.zellen), geholt: '', halt: false };
  }
  function teile(befehl) { var t = befehl.split(' '); return { op: t[0], zelle: t[1] }; }
  function bedeutung(befehl) {
    var b = teile(befehl);
    if (b.op === 'LADE') return 'Der Rechenplatz bekommt den Wert der Zelle ' + b.zelle + '.';
    if (b.op === 'ADDIERE') return 'Zum Rechenplatz kommt der Wert der Zelle ' + b.zelle + ' dazu.';
    if (b.op === 'SPEICHERE') return 'Die Zelle ' + b.zelle + ' bekommt den Wert des Rechenplatzes.';
    return 'Der Rechner hält an.';
  }
  /* Ein Takt: holen, entschlüsseln oder ausführen. Der Pfeil „nächster Befehl“ rückt beim Holen weiter. */
  function takt(z) {
    if (z.halt) return { zustand: z, satz: 'Der Rechner hat angehalten. Mit „Von vorn“ startet das Programm neu.', getan: false };
    var zeilen = PROGRAMME[z.id].zeilen;
    var n = kopie(z); n.zellen = kopie(z.zellen);
    var ph = (z.phase + 1) % 3, satz, b;
    n.phase = ph; n.takte = z.takte + 1;
    var vorn = 'Takt ' + n.takte + ', ' + LAMPEN[ph] + ': ';
    if (ph === 0) {
      n.aktiv = z.pc; n.geholt = zeilen[z.pc]; n.pc = z.pc + 1;
      satz = vorn + 'Der Prozessor holt den Befehl ' + n.geholt + '.';
    } else if (ph === 1) {
      satz = vorn + n.geholt + ' heißt: ' + bedeutung(n.geholt);
    } else {
      b = teile(z.geholt);
      if (b.op === 'LADE') { n.platz = z.zellen[b.zelle]; satz = vorn + 'Der Rechenplatz bekommt ' + n.platz + '.'; }
      else if (b.op === 'ADDIERE') { n.platz = z.platz + z.zellen[b.zelle]; satz = vorn + 'Der Rechenplatz ist jetzt ' + n.platz + '.'; }
      else if (b.op === 'SPEICHERE') { n.zellen[b.zelle] = z.platz; satz = vorn + 'Die Zelle ' + b.zelle + ' bekommt ' + z.platz + '.'; }
      else { n.halt = true; satz = vorn + 'Der Rechner hält an. Das Programm ist zu Ende.'; }
    }
    return { zustand: n, satz: satz, getan: true };
  }
  /* Ein Befehl: bis zum Ende des Dreischritts (mitten im Befehl wird er zu Ende geführt) */
  function befehl(z) {
    var r = takt(z), n = r.zustand, saetze = [r.satz];
    if (!r.getan) return { zustand: z, satz: r.satz, getan: false };
    while (n.phase !== 2 && !n.halt) { r = takt(n); n = r.zustand; saetze.push(r.satz); }
    return { zustand: n, satz: saetze[saetze.length - 1], getan: true };
  }
  function laufen(z) {
    var n = z, guard = 0;
    while (!n.halt && guard++ < 200) n = takt(n).zustand;
    return n;
  }
  function schlussSatz(z) {
    if (!z.halt) return '';
    return z.id === 'beispiel' ? 'Das Programm hat C aus A und B berechnet, so wie die Python-Zeile c = a + b.' : 'Das Programm ist zu Ende.';
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      BAUTEIL_NAMEN: BAUTEIL_NAMEN, SZENARIEN: SZENARIEN, MELDUNG_AUS: MELDUNG_AUS, startBau: startBau, laeuft: laeuft, stromAus: stromAus, speichern: speichern,
      laden: laden, ssdText: ssdText, ramText: ramText, anwenden: anwenden,
      GRUPPEN: GRUPPEN, GRUPPEN_KURZ: GRUPPEN_KURZ, LANG: LANG, ZERLEGT: ZERLEGT, TEIL_NAMEN: TEIL_NAMEN, GETRAENKE: GETRAENKE, GELD_WERTE: GELD_WERTE,
      pyFloat: pyFloat, anzahlCode: anzahlCode, hauptZeilen: hauptZeilen, einr: einr, codeText: codeText,
      ausgabeLang: ausgabeLang, ausgabeZerlegt: ausgabeZerlegt, ablauf: ablauf, satzAblauf: satzAblauf, geldText: geldText, eingabeText: eingabeText,
      ZELLEN: ZELLEN, LAMPEN: LAMPEN, PROGRAMME: PROGRAMME, PROGRAMM_IDS: PROGRAMM_IDS, TAKTE_PRO_BEFEHL: TAKTE_PRO_BEFEHL,
      neuSpielzeug: neuSpielzeug, bedeutung: bedeutung, takt: takt, befehl: befehl, laufen: laufen, schlussSatz: schlussSatz
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
  function aktion(text, leise) { return el('button', { type: 'button', class: 'v09-aktion' + (leise ? ' v09-aktion--leise' : ''), text: text }); }
  function sperre(b, aus) { b.setAttribute('aria-disabled', aus ? 'true' : 'false'); b.classList.toggle('is-aus', !!aus); }
  /* Gesperrte Knöpfe bleiben im Tab-Fluss, tun aber nichts */
  function klick(b, fn) { b.addEventListener('click', function () { if (b.getAttribute('aria-disabled') === 'true') return; fn(); }); }
  /* Auswahl mit einem Wert (Radio-Knöpfe), Pfeiltasten wechseln */
  function wahl(label, optionen, fn) {
    var knoepfe = [], host = el('div', { class: 'v09-wahl', role: 'radiogroup', 'aria-label': label });
    optionen.forEach(function (o, k) {
      var b = el('button', { type: 'button', class: 'v09-knopf v09-wahl__knopf', role: 'radio', 'aria-checked': 'false', tabindex: k === 0 ? '0' : '-1', text: o.text });
      b.addEventListener('click', function () { setze(o.wert); fn(o.wert); });
      b.addEventListener('keydown', function (e) {
        var d = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var m = (k + d + optionen.length) % optionen.length;
        setze(optionen[m].wert); fn(optionen[m].wert); knoepfe[m].focus();
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

  /* ── bauteile ─────────────────────────────────────────────── */
  var BOX = {
    ea: { x: 20, y: 30, b: 170, h: 100, oben: true },
    prozessor: { x: 235, y: 30, b: 170, h: 100, oben: true },
    ram: { x: 450, y: 30, b: 170, h: 100, oben: true },
    ssd: { x: 235, y: 230, b: 170, h: 100, oben: false }
  };
  var BUS_Y = 170, BUS_H = 20;
  function initBauteile(host) {
    var z = startBau(), aktivBoxen = [], aktivKanten = [], satz = '', gedrueckt = null;
    host.textContent = '';
    var svg = sv('svg', { class: 'v09-bau__svg', viewBox: '0 0 640 360', role: 'img' });
    var satzEl = el('p', { class: 'v09-satz', 'aria-live': 'off' });
    var status = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    var knoepfe = {};
    function dreieck(cx, cy, nachUnten) {
      var d = nachUnten ? [[cx - 9, cy - 8], [cx + 9, cy - 8], [cx, cy + 8]] : [[cx - 9, cy + 8], [cx + 9, cy + 8], [cx, cy - 8]];
      return sv('polygon', { points: d.map(function (p) { return p.join(','); }).join(' '), class: 'v09-pfeil' });
    }
    function baue() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var busAktiv = aktivKanten.length > 0;
      svg.setAttribute('aria-label', 'Schema eines Rechners: Prozessor, Arbeitsspeicher, SSD sowie Eingabe und Ausgabe, verbunden durch den Bus. Arbeitsspeicher: ' + ramText(z) + '. SSD: ' + ssdText(z) + '.');
      /* Leitungen zwischen Boxen und Bus */
      Object.keys(BOX).forEach(function (id) {
        var b = BOX[id], cx = b.x + b.b / 2, kante = null;
        aktivKanten.forEach(function (k) { if (k.box === id) kante = k; });
        var y1 = b.oben ? b.y + b.h : BUS_Y + BUS_H, y2 = b.oben ? BUS_Y : b.y;
        svg.appendChild(sv('line', { x1: cx, y1: y1, x2: cx, y2: y2, class: 'v09-leitung' + (kante ? ' is-aktiv' : '') }));
        if (kante) {
          var my = (y1 + y2) / 2, r = kante.richtung;
          /* zum_bus: bei oberen Boxen nach unten, bei der unteren nach oben */
          if (r === 'zum_bus' || r === 'beide') svg.appendChild(dreieck(cx - (r === 'beide' ? 14 : 0), my, b.oben));
          if (r === 'vom_bus' || r === 'beide') svg.appendChild(dreieck(cx + (r === 'beide' ? 14 : 0), my, !b.oben));
        }
      });
      svg.appendChild(sv('rect', { x: 20, y: BUS_Y, width: 600, height: BUS_H, rx: 4, class: 'v09-bus' + (busAktiv ? ' is-aktiv' : '') }));
      svg.appendChild(sv('text', { x: 430, y: BUS_Y + 14, class: 'v09-bus__text', 'text-anchor': 'middle' }, busAktiv ? 'Bus (in Benutzung)' : 'Bus'));
      Object.keys(BOX).forEach(function (id) {
        var b = BOX[id], an = aktivBoxen.indexOf(id) >= 0, leer = id === 'ram' && !laeuft(z);
        svg.appendChild(sv('rect', { x: b.x, y: b.y, width: b.b, height: b.h, rx: 6, class: 'v09-box' + (an ? ' is-aktiv' : '') + (leer ? ' is-leer' : '') }));
        svg.appendChild(sv('text', { x: b.x + b.b / 2, y: b.y + 28, class: 'v09-box__name', 'text-anchor': 'middle' }, BAUTEIL_NAMEN[id]));
        var inhalt = id === 'ram' ? ramText(z) : id === 'ssd' ? ssdText(z) : id === 'ea' ? 'Tastatur, Bildschirm' : '';
        if (inhalt) svg.appendChild(sv('text', { x: b.x + b.b / 2, y: b.y + 58, class: 'v09-box__inhalt', 'text-anchor': 'middle' }, inhalt));
        if (an) svg.appendChild(sv('text', { x: b.x + b.b / 2, y: b.y + b.h - 12, class: 'v09-box__marke', 'text-anchor': 'middle' }, 'beteiligt'));
      });
    }
    function zeige(ansagen, vorsatz) {
      baue();
      satzEl.textContent = satz || 'Drück einen Knopf. Hier steht, was im Rechner passiert.';
      SZENARIEN.forEach(function (s) { knoepfe[s.id].setAttribute('aria-pressed', gedrueckt === s.id ? 'true' : 'false'); knoepfe[s.id].classList.toggle('is-an', gedrueckt === s.id); });
      if (ansagen) status.textContent = (vorsatz || '') + satz;
    }
    var reihe = el('div', { class: 'v09-aktionen', role: 'group', 'aria-label': 'Was der Rechner tun soll' });
    SZENARIEN.forEach(function (s) {
      var b = aktion(s.knopf, true);
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        var r = anwenden(z, s.id);
        z = r.zustand; aktivBoxen = r.boxen; aktivKanten = r.kanten; satz = r.satz; gedrueckt = s.id; zeige(true);
      });
      knoepfe[s.id] = b; reihe.appendChild(b);
    });
    var zurueck = aktion('Von vorn', true);
    zurueck.addEventListener('click', function () { z = startBau(); aktivBoxen = []; aktivKanten = []; satz = ''; gedrueckt = null; zeige(true, 'Von vorn. Der Rechner steht wieder wie am Anfang. '); });
    reihe.appendChild(zurueck);
    zeige(false);
    host.appendChild(el('div', { class: 'v09-bau' }, [
      el('p', { class: 'v09-titel', text: 'Was soll der Rechner tun?' }), reihe,
      el('div', { class: 'v09-bau__bild' }, [svg]), satzEl, status
    ]));
  }

  /* ── zerlegen ─────────────────────────────────────────────── */
  function codeZeile(z, k, extra) {
    var cls = 'v09-zeile' + (z.gruppe ? ' v09-gruppe--' + z.gruppe : '') + (z.leer ? ' is-leer' : '') + (extra ? ' ' + extra : '');
    return el('div', { class: cls, 'data-zeile': String(k) }, [
      el('span', { class: 'v09-zeile__nr', 'aria-hidden': 'true', text: z.leer ? '' : String(k + 1) }),
      el('span', { class: 'v09-zeile__pfeil', 'aria-hidden': 'true' }),
      el('span', { class: 'v09-zeile__text', text: z.leer ? ' ' : einr(z) }),
      el('span', { class: 'v09-zeile__tag', text: z.gruppe ? GRUPPEN_KURZ[z.gruppe] : '' })
    ]);
  }
  function initZerlegen(host) {
    var id = 'v09-zerlegen-' + (++nr);
    var gw = 1, gg = 3, zerlegt = false, gelaufen = false, ap = 0, folge = [];
    host.textContent = '';
    var getrWahl = wahl('Getränk', GETRAENKE, function (w) { gw = w; reset('Eingabe geändert. '); });
    getrWahl.setze(gw);
    var geldSel = el('select', { id: id + '-geld', class: 'v09-feld v09-feld--eng' });
    GELD_WERTE.forEach(function (g) { geldSel.appendChild(el('option', { value: String(g), text: geldText(g) })); });
    geldSel.value = String(gg);
    geldSel.addEventListener('change', function () { gg = Number(geldSel.value); reset('Eingabe geändert. '); });
    var zerlegeKnopf = aktion('Zerlegen'), laufKnopf = aktion('Beide laufen lassen', true), vonVorn = aktion('Von vorn', true);
    klick(zerlegeKnopf, function () { if (zerlegt) return; zerlegt = true; gelaufen = false; zeige(true, 'Zerlegt. Die Zeilen stehen jetzt in den Funktionen preis_von und antwort. '); });
    klick(laufKnopf, function () { gelaufen = true; ap = 0; folge = ablauf(gw, gg); zeige(true, 'Beide Fassungen gelaufen. '); });
    vonVorn.addEventListener('click', function () { zerlegt = false; gelaufen = false; ap = 0; zeige(true, 'Von vorn. Es steht wieder nur das lange Programm da. '); });
    var einer = aktion('Ein Schritt'), zurueckSchritt = aktion('Ablauf von vorn', true);
    klick(einer, function () { if (ap >= folge.length) return; ap++; zeige(true); });
    klick(zurueckSchritt, function () { if (ap === 0) return; ap = 0; zeige(true, 'Ablauf von vorn. '); });
    var langHost = el('div', { class: 'v09-prog', role: 'region', 'aria-label': 'Das lange Programm', tabindex: '0' });
    var zerlegtHost = el('div', { class: 'v09-prog', role: 'region', 'aria-label': 'Das zerlegte Programm', tabindex: '0' });
    var langKopf = el('p', { class: 'v09-titel', text: 'Langes Programm' }), zerlegtKopf = el('p', { class: 'v09-titel', text: 'Zerlegtes Programm' });
    var langAus = el('p', { class: 'v09-ausgabe' }), zerlegtAus = el('p', { class: 'v09-ausgabe' });
    var ablaufEl = el('p', { class: 'v09-jetzt' });
    var leerEl = el('p', { class: 'v09-leer', text: 'Noch nicht zerlegt. Drück „Zerlegen“.' });
    var hinweis = el('p', { class: 'v09-hinweis k-small k-muted', text: 'Zum Laufenlassen zerlege zuerst das Programm.' });
    var status = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    var legende = el('ul', { class: 'v09-legende', 'aria-label': 'Die drei Gruppen von Zeilen' });
    GRUPPEN_ID.forEach(function (g) { legende.appendChild(el('li', { class: 'v09-legende__punkt v09-gruppe--' + g, text: GRUPPEN[g] })); });
    function reset(vorsatz) { gelaufen = false; ap = 0; zeige(true, vorsatz); }
    function zeige(ansagen, vorsatz) {
      var k, aktuell = (gelaufen && ap < folge.length) ? folge[ap].zeile : -1;
      langHost.textContent = ''; zerlegtHost.textContent = '';
      for (k = 0; k < LANG.length; k++) langHost.appendChild(codeZeile(LANG[k], k));
      if (zerlegt) {
        var letzter = '';
        for (k = 0; k < ZERLEGT.length; k++) {
          var t = ZERLEGT[k].teil;
          if (t !== 'trenn' && t !== letzter) { zerlegtHost.appendChild(el('div', { class: 'v09-teilkopf', text: TEIL_NAMEN[t] + (t === 'haupt' ? ' (' + hauptZeilen() + ' Zeilen)' : '') })); letzter = t; }
          zerlegtHost.appendChild(codeZeile(ZERLEGT[k], k, k === aktuell ? 'is-jetzt' : ''));
          if (k === aktuell) zerlegtHost.lastChild.querySelector('.v09-zeile__pfeil').textContent = '▶';
          if (k === aktuell) zerlegtHost.lastChild.querySelector('.v09-zeile__tag').textContent = 'als Nächstes';
        }
      }
      zerlegtHost.hidden = !zerlegt; zerlegtKopf.hidden = !zerlegt; leerEl.hidden = zerlegt;
      langAus.hidden = !gelaufen; zerlegtAus.hidden = !(zerlegt && gelaufen);
      if (gelaufen) {
        langAus.textContent = 'Ausgabe: ' + ausgabeLang(gw, gg);
        zerlegtAus.textContent = 'Ausgabe: ' + ausgabeZerlegt(gw, gg);
      }
      ablaufEl.hidden = !(zerlegt && gelaufen);
      if (zerlegt && gelaufen) ablaufEl.textContent = satzAblauf(folge, ap);
      sperre(zerlegeKnopf, zerlegt); sperre(laufKnopf, !zerlegt);
      hinweis.hidden = zerlegt;
      einer.hidden = !(zerlegt && gelaufen); zurueckSchritt.hidden = !(zerlegt && gelaufen);
      if (zerlegt && gelaufen) { sperre(einer, ap >= folge.length); sperre(zurueckSchritt, ap === 0); }
      if (ansagen) status.textContent = (vorsatz || '') + (gelaufen ? 'Lang: ' + ausgabeLang(gw, gg) + '. ' + (zerlegt ? 'Zerlegt: ' + ausgabeZerlegt(gw, gg) + '. ' + satzAblauf(folge, ap) : '') : '');
    }
    zeige(false);
    host.appendChild(el('div', { class: 'v09-zerl' }, [
      el('div', { class: 'v09-zerl__eingabe' }, [
        el('p', { class: 'v09-titel', text: 'Eingaben für den Getränkeautomaten' }), getrWahl.host,
        el('div', { class: 'v09-feldzeile' }, [el('label', { for: id + '-geld', text: 'Geld in Euro' }), geldSel])
      ]),
      el('div', { class: 'v09-aktionen' }, [zerlegeKnopf, laufKnopf, vonVorn]), hinweis, legende,
      el('div', { class: 'v09-zerl__spalten' }, [
        el('div', { class: 'v09-zerl__teil' }, [langKopf, langHost, langAus]),
        el('div', { class: 'v09-zerl__teil' }, [zerlegtKopf, zerlegtHost, leerEl, zerlegtAus])
      ]),
      ablaufEl, el('div', { class: 'v09-aktionen' }, [einer, zurueckSchritt]), status
    ]));
  }

  /* ── spielzeug ────────────────────────────────────────────── */
  function initSpielzeug(host) {
    var id = 'v09-spielzeug-' + (++nr);
    var pid = 'beispiel', z = neuSpielzeug(pid), satz = '';
    host.textContent = '';
    var progWahl = wahl('Programm', PROGRAMM_IDS.map(function (k) { return { wert: k, text: PROGRAMME[k].name }; }), function (w) {
      pid = w; z = neuSpielzeug(pid); satz = ''; zeige(true, PROGRAMME[pid].name + ' geladen. ');
    });
    progWahl.setze(pid);
    var knopfTakt = aktion('Ein Takt'), knopfBefehl = aktion('Ein Befehl'), knopfVorn = aktion('Von vorn', true);
    klick(knopfTakt, function () { var r = takt(z); z = r.zustand; satz = r.satz; zeige(true); });
    klick(knopfBefehl, function () { var r = befehl(z); z = r.zustand; satz = r.satz; zeige(true); });
    knopfVorn.addEventListener('click', function () { z = neuSpielzeug(pid); satz = ''; zeige(true, 'Von vorn. '); });
    var progEl = el('div', { class: 'v09-prog', role: 'region', 'aria-label': 'Das Programm', tabindex: '0' });
    var geholtEl = el('p', { class: 'v09-feldwert', 'aria-label': 'geholter Befehl' });
    var platzEl = el('p', { class: 'v09-feldwert v09-feldwert--zahl', 'aria-label': 'Rechenplatz' });
    var taktEl = el('p', { class: 'v09-feldwert v09-feldwert--zahl', 'aria-label': 'Takte bisher' });
    var lampenEl = el('ul', { class: 'v09-lampen', 'aria-label': 'Die drei Schritte eines Befehls' });
    var lampen = LAMPEN.map(function (n) {
      var li = el('li', { class: 'v09-lampe' }, [el('span', { class: 'v09-lampe__punkt', 'aria-hidden': 'true' }), el('span', { class: 'v09-lampe__wort', text: n })]);
      lampenEl.appendChild(li); return li;
    });
    var zellenEl = el('div', { class: 'v09-zellen', role: 'group', 'aria-label': 'Die vier Zellen' });
    var zellen = ZELLEN.map(function (n) {
      var w = el('span', { class: 'v09-zelle__wert' });
      var c = el('div', { class: 'v09-zelle' }, [el('span', { class: 'v09-zelle__name', text: n }), w]);
      zellenEl.appendChild(c); return w;
    });
    var satzEl = el('p', { class: 'v09-jetzt' });
    var schlussEl = el('p', { class: 'v09-hinweis' });
    var status = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    function zeige(ansagen, vorsatz) {
      var zeilen = PROGRAMME[pid].zeilen, k;
      progEl.textContent = '';
      for (k = 0; k < zeilen.length; k++) {
        var istAktiv = k === z.aktiv && !z.halt, istNaechst = k === z.pc && !z.halt;
        var row = el('div', { class: 'v09-zeile' + (istAktiv ? ' is-jetzt' : '') + (k === z.aktiv && z.halt ? ' is-fertig' : '') }, [
          el('span', { class: 'v09-zeile__nr', 'aria-hidden': 'true', text: String(k + 1) }),
          el('span', { class: 'v09-zeile__pfeil', 'aria-hidden': 'true', text: istNaechst ? '▶' : '' }),
          el('span', { class: 'v09-zeile__text', text: zeilen[k] }),
          el('span', { class: 'v09-zeile__tag', text: istNaechst ? 'nächster Befehl' : (istAktiv ? 'wird bearbeitet' : '') })
        ]);
        if (istNaechst) row.setAttribute('aria-current', 'step');
        progEl.appendChild(row);
      }
      geholtEl.textContent = z.geholt || 'noch nichts geholt';
      geholtEl.classList.toggle('is-leer', !z.geholt);
      platzEl.textContent = String(z.platz);
      taktEl.textContent = String(z.takte);
      lampen.forEach(function (li, j) {
        var an = z.phase === j && z.takte > 0;
        li.classList.toggle('is-an', an);
        li.querySelector('.v09-lampe__punkt').textContent = an ? '●' : '○';
        if (an) li.setAttribute('aria-current', 'true'); else li.removeAttribute('aria-current');
      });
      ZELLEN.forEach(function (n, j) { zellen[j].textContent = String(z.zellen[n]); });
      satzEl.textContent = satz || 'Noch kein Takt gelaufen. Drück „Ein Takt“.';
      schlussEl.textContent = schlussSatz(z); schlussEl.hidden = !z.halt;
      sperre(knopfTakt, z.halt); sperre(knopfBefehl, z.halt);
      if (ansagen) status.textContent = (vorsatz || '') + (satz ? satz + (z.halt ? ' ' + schlussSatz(z) : '') : '');
    }
    zeige(false);
    host.appendChild(el('div', { class: 'v09-spiel' }, [
      el('div', { class: 'v09-spiel__kopf' }, [el('p', { class: 'v09-titel', text: 'Programm wählen' }), progWahl.host]),
      el('div', { class: 'v09-spiel__spalten' }, [
        el('div', { class: 'v09-spiel__links' }, [el('p', { class: 'v09-titel', text: 'Programm (ein Befehl je Zeile)' }), progEl]),
        el('div', { class: 'v09-spiel__rechts' }, [
          el('div', { class: 'v09-feld-gruppe' }, [
            el('p', { class: 'v09-titel', text: 'Prozessor' }), lampenEl,
            el('div', { class: 'v09-werte' }, [
              el('div', { class: 'v09-wert' }, [el('span', { class: 'v09-wert__name', text: 'geholt' }), geholtEl]),
              el('div', { class: 'v09-wert' }, [el('span', { class: 'v09-wert__name', text: 'Rechenplatz' }), platzEl]),
              el('div', { class: 'v09-wert' }, [el('span', { class: 'v09-wert__name', text: 'Takte' }), taktEl])
            ])
          ]),
          el('div', { class: 'v09-feld-gruppe' }, [el('p', { class: 'v09-titel', text: 'Speicher' }), zellenEl])
        ])
      ]),
      el('div', { class: 'v09-aktionen' }, [knopfTakt, knopfBefehl, knopfVorn]),
      satzEl, schlussEl,
      el('p', { class: 'v09-hinweis k-small k-muted', text: 'Im Spielzeug braucht jeder Befehl drei Takte. Im echten Rechner ist das je nach Befehl verschieden.' }), status
    ]));
  }

  function init() {
    var map = { bauteile: initBauteile, zerlegen: initZerlegen, spielzeug: initSpielzeug };
    Object.keys(map).forEach(function (k) {
      Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="' + k + '"]'), function (hostEl) {
        if (hostEl._v09) return;
        hostEl._v09 = true;
        map[k](hostEl);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
