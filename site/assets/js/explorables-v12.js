/* =============================================================
   explorables-v12.js – interaktive Bausteine für V12 „Testen & Debuggen“ (reines JS, kein Framework)
   (A) Grenzwerte: Zahlenstrahl mit Bereichen, Testpunkte setzen, Abdeckung und Fehler-Mutanten.
   (B) Traceback lesen: mehrstufiger Traceback über Funktionsaufrufe, von unten nach oben.
   (C) Fehlerart bestimmen: Syntax-, Laufzeit- oder Logikfehler.
   (D) Debugger (schematisch): Haltepunkt, Weiter, Schritt über, hinein, heraus, Variablen, Aufrufliste.
   (E) Debug-Zyklus: Test scheitert, Hypothese, Beobachten, Korrigieren, Test erneut.
   (F) PAP der Funktion zustand: Pfad durch die Rauten, Testfälle je Pfad und Grenze (braucht KursPAP).
   Der Rechenkern ist ohne DOM per node testbar (module.exports).
   ============================================================= */
(function (root) {
  'use strict';

  /* ── Kern (ohne DOM) ─────────────────────────────────────── */

  /* Spezifikation: Messwerte unter -40 oder über 200 sind Sensorfehler; unter 70 normal; 70 bis einschließlich 85 Warnung; darüber abschalten */
  function zustandRef(t) {
    if (t < -40 || t > 200) return 'sensorfehler';
    if (t < 70) return 'normal';
    if (t <= 85) return 'warnung';
    return 'abschalten';
  }

  /* Fehlerhafte Varianten (Mutanten): je eine Änderung gegenüber der richtigen Funktion */
  var MUTANTEN = [
    { id: 'm1', zeile: 'if t <= 70:', was: 'Grenze 70: <= statt <', f: function (t) { if (t < -40 || t > 200) return 'sensorfehler'; if (t <= 70) return 'normal'; if (t <= 85) return 'warnung'; return 'abschalten'; } },
    { id: 'm2', zeile: 'elif t < 85:', was: 'Grenze 85: < statt <= (der KI-Fehler aus dem Beispiel)', f: function (t) { if (t < -40 || t > 200) return 'sensorfehler'; if (t < 70) return 'normal'; if (t < 85) return 'warnung'; return 'abschalten'; } },
    { id: 'm3', zeile: 'if t < -40 or t >= 200:', was: 'Grenze 200: >= statt >', f: function (t) { if (t < -40 || t >= 200) return 'sensorfehler'; if (t < 70) return 'normal'; if (t <= 85) return 'warnung'; return 'abschalten'; } },
    { id: 'm4', zeile: 'if t <= -40 or t > 200:', was: 'Grenze -40: <= statt <', f: function (t) { if (t <= -40 || t > 200) return 'sensorfehler'; if (t < 70) return 'normal'; if (t <= 85) return 'warnung'; return 'abschalten'; } },
    { id: 'm5', zeile: 'if t < 7:', was: 'Tippfehler: 7 statt 70', f: function (t) { if (t < -40 || t > 200) return 'sensorfehler'; if (t < 7) return 'normal'; if (t <= 85) return 'warnung'; return 'abschalten'; } },
    { id: 'm6', zeile: 'elif t <= 90:', was: 'Grenze verschoben: 90 statt 85', f: function (t) { if (t < -40 || t > 200) return 'sensorfehler'; if (t < 70) return 'normal'; if (t <= 90) return 'warnung'; return 'abschalten'; } },
    { id: 'm7', zeile: 'if t < -40:', was: 'Bereichsende vergessen: kein Sensorfehler über 200', f: function (t) { if (t < -40) return 'sensorfehler'; if (t < 70) return 'normal'; if (t <= 85) return 'warnung'; return 'abschalten'; } },
    { id: 'm8', zeile: 'return "warnug"', was: 'Tippfehler im Rückgabetext', f: function (t) { var r = zustandRef(t); return r === 'warnung' ? 'warnug' : r; } }
  ];

  var GRENZEN = [
    { b: -40, links: 'Sensorfehler', rechts: 'normal', zuLinks: false },
    { b: 70, links: 'normal', rechts: 'Warnung', zuLinks: false },
    { b: 85, links: 'Warnung', rechts: 'abschalten', zuLinks: true },
    { b: 200, links: 'abschalten', rechts: 'Sensorfehler', zuLinks: true }
  ];
  var BEREICHE = [
    { id: 'sensor-u', name: 'Sensorfehler (unten)', von: -Infinity, bis: -40, vonZu: true, bisZu: false },
    { id: 'normal', name: 'normal', von: -40, bis: 70, vonZu: true, bisZu: false },
    { id: 'warnung', name: 'Warnung', von: 70, bis: 85, vonZu: true, bisZu: true },
    { id: 'abschalten', name: 'abschalten', von: 85, bis: 200, vonZu: false, bisZu: true },
    { id: 'sensor-o', name: 'Sensorfehler (oben)', von: 200, bis: Infinity, vonZu: false, bisZu: false }
  ];
  function inBereich(b, p) {
    var u = b.vonZu ? p >= b.von : p > b.von, o = b.bisZu ? p <= b.bis : p < b.bis;
    return u && o;
  }
  /* Welche Seite einer Grenze deckt der Punkt p ab (Abstand höchstens 1)? 'links', 'rechts' oder null */
  function seite(g, p) {
    var b = g.b;
    if (g.zuLinks) { if (p >= b - 1 && p <= b) return 'links'; if (p > b && p <= b + 1) return 'rechts'; }
    else { if (p >= b - 1 && p < b) return 'links'; if (p >= b && p <= b + 1) return 'rechts'; }
    return null;
  }
  /* Auswertung einer Menge von Testpunkten */
  function auswerten(punkte) {
    var res = { bereiche: [], grenzen: [], mutanten: [], nBereiche: 0, nSeiten: 0, nMut: 0 };
    BEREICHE.forEach(function (b) {
      var hit = punkte.filter(function (p) { return inBereich(b, p); });
      res.bereiche.push({ id: b.id, name: b.name, punkte: hit });
      if (hit.length) res.nBereiche++;
    });
    GRENZEN.forEach(function (g) {
      var l = punkte.filter(function (p) { return seite(g, p) === 'links'; });
      var r = punkte.filter(function (p) { return seite(g, p) === 'rechts'; });
      res.grenzen.push({ g: g, links: l, rechts: r });
      if (l.length) res.nSeiten++;
      if (r.length) res.nSeiten++;
    });
    MUTANTEN.forEach(function (m) {
      var durch = null, i;
      for (i = 0; i < punkte.length; i++) { if (m.f(punkte[i]) !== zustandRef(punkte[i])) { durch = punkte[i]; break; } }
      res.mutanten.push({ m: m, durch: durch });
      if (durch !== null) res.nMut++;
    });
    return res;
  }

  /* (B) Tracebacks über mehrere Funktionsaufrufe */
  var SZENARIEN = {
    typ: {
      titel: 'TypeError in einer Aufrufkette',
      datei: 'lager.py',
      code: [
        'def zustand(t):',
        '    if t < 70:',
        '        return "normal"',
        '    elif t <= 85:',
        '        return "warnung"',
        '    return "abschalten"',
        '',
        'def melde(sensor, wert):',
        '    text = zustand(wert)',
        '    return sensor + ": " + text + " bei " + wert + " °C"',
        '',
        'def alle_melden(messungen):',
        '    for sensor, wert in messungen:',
        '        print(melde(sensor, wert))',
        '',
        'alle_melden([("Lager 1", 62.5), ("Lager 2", 88.0)])'
      ],
      frames: [
        { name: '<module>', zeile: 16, text: 'alle_melden([("Lager 1", 62.5), ("Lager 2", 88.0)])' },
        { name: 'alle_melden', zeile: 14, text: 'print(melde(sensor, wert))' },
        { name: 'melde', zeile: 10, text: 'return sensor + ": " + text + " bei " + wert + " °C"' }
      ],
      fehler: 'TypeError: can only concatenate str (not "float") to str',
      schritte: [
        'Letzte Zeile zuerst: Die Fehlerart ist TypeError (die Typen passen nicht zusammen). Die Meldung sagt genauer: Beim Zusammenkleben mit + steht ein Text links und eine Kommazahl (float) rechts. Das ist das WAS.',
        'Die Zeile darüber ist die Fehlerstelle, das WO: Funktion melde, Zeile 10. Genau dort ist Python gestolpert. In dieser Zeile steht + zwischen Texten, und wert ist die Kommazahl 62.5.',
        'Jetzt nach oben: Wer hat melde aufgerufen? alle_melden, in Zeile 14, mit sensor und wert aus der Liste. Das ist das WIE KAM ES DAZU. Die Funktion zustand taucht nicht auf: Sie hat ohne Fehler geantwortet.',
        'Ganz oben steht, womit alles begann: Das Hauptprogramm ruft in Zeile 16 alle_melden auf. Der Weg: Hauptprogramm, alle_melden, melde. Die Ursache liegt hier in Zeile 10: Die Zahl muss zuerst in Text umgewandelt werden, zum Beispiel mit str(wert) oder einem f-String.'
      ]
    },
    wert: {
      titel: 'ValueError beim Einlesen',
      datei: 'mittel.py',
      code: [
        'def lese_wert(text):',
        '    return float(text)',
        '',
        'def mittelwert(texte):',
        '    summe = 0.0',
        '    for text in texte:',
        '        summe = summe + lese_wert(text)',
        '    return summe / len(texte)',
        '',
        'daten = ["62,5", "64,0", "63,5"]',
        'print(mittelwert(daten))'
      ],
      frames: [
        { name: '<module>', zeile: 11, text: 'print(mittelwert(daten))' },
        { name: 'mittelwert', zeile: 7, text: 'summe = summe + lese_wert(text)' },
        { name: 'lese_wert', zeile: 2, text: 'return float(text)' }
      ],
      fehler: "ValueError: could not convert string to float: '62,5'",
      schritte: [
        'Letzte Zeile zuerst: ValueError, und die Meldung nennt den Text, an dem float scheitert: \'62,5\'. Der Text hat ein Komma. Das ist das WAS (V09: float kennt nur den Dezimalpunkt).',
        'Die Zeile darüber ist die Fehlerstelle: lese_wert, Zeile 2, dort steht float(text). Hier ist es gescheitert, aber lese_wert ist unschuldig: Es hat nur einen Text bekommen, den es nicht kennt.',
        'Wer hat lese_wert aufgerufen? mittelwert, Zeile 7, beim ersten Durchlauf der Schleife. Die Funktion hat den Text einfach weitergereicht.',
        'Das Hauptprogramm hat die Liste mit den Kommazahlen-Texten übergeben (Zeile 11). Die Ursache liegt also an der Quelle der Daten: Entweder macht lese_wert aus dem Komma einen Punkt (replace), oder die Daten kommen richtig an. Der Fehler zeigt die Stelle, nicht immer die Ursache.'
      ]
    },
    pruef: {
      titel: 'AssertionError aus einem Test',
      datei: 'test_lager.py',
      code: [
        'def zustand(t):',
        '    if t < 70:',
        '        return "normal"',
        '    elif t < 85:',
        '        return "warnung"',
        '    return "abschalten"',
        '',
        'def test_grenzen():',
        '    assert zustand(69.9) == "normal"',
        '    assert zustand(85) == "warnung", "85 °C gehört noch zur Warnung"',
        '',
        'test_grenzen()'
      ],
      frames: [
        { name: '<module>', zeile: 12, text: 'test_grenzen()' },
        { name: 'test_grenzen', zeile: 10, text: 'assert zustand(85) == "warnung", "85 °C gehört noch zur Warnung"' }
      ],
      fehler: 'AssertionError: 85 °C gehört noch zur Warnung',
      schritte: [
        'Letzte Zeile zuerst: AssertionError heißt „eine Behauptung (assert) war falsch“. Nach dem Doppelpunkt steht die Meldung, die du selbst hinter das Komma geschrieben hast. Das ist das WAS: Ein Test ist gescheitert.',
        'Die Zeile darüber zeigt den scheiternden Test: test_grenzen, Zeile 10. Erwartet war „warnung“, bekommen hat der Test etwas anderes. Der Traceback nennt die Stelle des Tests, nicht die des Fehlers im Programm.',
        'Ganz oben: Zeile 12 hat den Test gestartet. Die Funktion zustand erscheint nirgends im Traceback: Sie hat ohne Absturz geantwortet, nur falsch. Die Ursache suchst du jetzt selbst: Hypothese „Grenze 85“, Zeile 4 vergleicht mit < statt <=. Der Traceback meldet nur, dass der Test scheitert, das Debuggen findet den Fehler. Darum schreibst du eine Meldung hinter das Komma: Sie schickt dich in die richtige Richtung.'
      ]
    }
  };

  /* (C) Fehlerart bestimmen */
  var FEHLERARTEN = [
    { code: 'if t > 85\n    print("abschalten")', art: 'syntax', ausgabe: 'SyntaxError: expected \':\'', erkl: 'Hinter der Bedingung fehlt der Doppelpunkt. Python meldet das, bevor das Programm überhaupt anläuft: Syntaxfehler. Die Meldung nennt die Zeile.' },
    { code: 'werte = []\nmittel = sum(werte) / len(werte)', art: 'laufzeit', ausgabe: 'ZeroDivisionError: division by zero', erkl: 'Das Programm startet, aber bei der Division durch len(werte), also 0, bricht es ab: Laufzeitfehler mit Traceback. Die Spezifikation hat den Fall „leere Liste“ vergessen.' },
    { code: 'def zustand(t):\n    if t < 70:\n        return "normal"\n    elif t < 85:\n        return "warnung"\n    return "abschalten"\nprint(zustand(85))', art: 'logik', ausgabe: 'abschalten   (erwartet: warnung)', erkl: 'Das Programm läuft ohne Fehlermeldung durch und gibt ein falsches Ergebnis aus. Das ist ein Logikfehler (hier < statt <=). Nur ein Test oder dein Kopf findet ihn, Python meldet nichts.' },
    { code: 'print(zustand(20))', art: 'laufzeit', ausgabe: "NameError: name 'zustand' is not defined", erkl: 'Die Funktion wurde nie definiert (oder falsch geschrieben). Das merkt Python erst, wenn die Zeile drankommt: Laufzeitfehler (NameError).' },
    { code: 'v_kmh = 36\nv_ms = v_kmh * 3.6\nprint(v_ms)', art: 'logik', ausgabe: '129.6   (erwartet: 10.0)', erkl: 'Von km/h in m/s rechnest du durch 3,6, nicht mal 3,6. Kein Absturz, kein Traceback, nur ein falscher Wert um den Faktor 12,96. Das ist ein Logikfehler.' },
    { code: 'def pruefe(t):\n    if t < 70:\n    return "normal"', art: 'syntax', ausgabe: 'IndentationError: expected an indented block after \'if\' statement on line 2', erkl: 'Nach der Bedingung muss der Block eingerückt sein. Python bemerkt das schon beim Einlesen des Programms: Syntaxfehler (IndentationError ist eine Art davon).' }
  ];
  var ART_NAME = { syntax: 'Syntaxfehler', laufzeit: 'Laufzeitfehler', logik: 'Logikfehler' };

  /* (D) Debugger-Schema: der Ablauf des Programms mit dem KI-Fehler, Zustand für Zustand */
  var DBG_CODE = [
    'def zustand(t):',
    '    if t < 70:',
    '        return "normal"',
    '    elif t < 85:',
    '        return "warnung"',
    '    return "abschalten"',
    '',
    'messwerte = [62.0, 85.0]',
    'for w in messwerte:',
    '    s = zustand(w)',
    '    print(w, s)'
  ];
  function debugTrace() {
    var st = [];
    var out = [];
    var g = { messwerte: null, w: null, s: null };
    function push(line, depth, lokal, msg) {
      st.push({ line: line, depth: depth, lokal: lokal ? Object.keys(lokal).map(function (k) { return [k, lokal[k]]; }) : [],
        globals: [['messwerte', g.messwerte === null ? '-' : g.messwerte], ['w', g.w === null ? '-' : g.w], ['s', g.s === null ? '-' : g.s]],
        out: out.slice(), msg: msg });
    }
    push(1, 0, null, 'Das Programm ist angehalten, bevor Zeile 1 läuft. Die Funktion wird jetzt nur definiert, noch nicht ausgeführt.');
    push(8, 0, null, 'Die Funktion zustand ist definiert. Jetzt wird die Liste der Messwerte angelegt.');
    g.messwerte = '[62.0, 85.0]';
    push(9, 0, null, 'Die Liste ist da (Fenster „Variablen“). Die Schleife beginnt.');
    [62.0, 85.0].forEach(function (w, i) {
      var ws = w.toFixed(1), erg = w < 70 ? 'normal' : (w < 85 ? 'warnung' : 'abschalten');
      g.w = ws;
      push(10, 0, null, 'Durchlauf ' + (i + 1) + ': w ist ' + ws + '. Gleich wird zustand(' + ws + ') aufgerufen. Schritt über führt den ganzen Aufruf in einem Schritt aus, Schritt hinein springt in die Funktion.');
      push(2, 1, { t: ws }, 'Du bist in der Funktion. Im Fenster „Variablen“ gibt es jetzt die lokale Variable t = ' + ws + ', und die Aufrufliste zeigt zwei Ebenen: zustand und darunter das Hauptprogramm.');
      if (w < 70) {
        push(3, 1, { t: ws }, 't < 70 ist wahr: Die Funktion gibt „normal“ zurück.');
      } else {
        push(4, 1, { t: ws }, 't < 70 ist falsch, weiter mit dem elif. ' + (w < 85 ? 'Jetzt prüft Zeile 4: ' + ws + ' < 85 ist wahr.' : 'Hier ist die Stelle: ' + ws + ' < 85 ist FALSCH, obwohl die Spezifikation sagt „bis einschließlich 85“. Hypothese bestätigt: Die Grenze gehört zur Warnung, aber der Vergleich schließt sie aus.'));
        if (w < 85) push(5, 1, { t: ws }, 'Die Funktion gibt „warnung“ zurück.');
        else push(6, 1, { t: ws }, 'Zeile 5 wurde übersprungen. Die Funktion gibt „abschalten“ zurück. Erwartet war „warnung“.');
      }
      g.s = '"' + erg + '"';
      push(11, 0, null, 'Zurück im Hauptprogramm: s ist ' + g.s + '. Das Ergebnis der Funktion steht jetzt in der Variablen.');
      out.push(ws + ' ' + erg);
      if (i === 0) push(9, 0, null, 'Die Ausgabe steht rechts im Terminal. Die Schleife geht zum nächsten Messwert.');
    });
    push(0, 0, null, 'Das Programm ist zu Ende. Im Terminal steht „85.0 abschalten“, erwartet war „85.0 warnung“. Mit dem Debugger hast du die Stelle gesehen: Zeile 4.');
    st[st.length - 1].fertig = true;
    return st;
  }
  /* Nächster Zustand bei Befehl cmd ab Zustand i; bp = Menge der Haltepunkt-Zeilen */
  function debugNext(tr, i, cmd, bp) {
    var cur = tr[i], j;
    if (cur.fertig) return i;
    if (cmd === 'into') return i + 1;
    if (cmd === 'over') { for (j = i + 1; j < tr.length; j++) if (tr[j].depth <= cur.depth || tr[j].fertig) return j; return tr.length - 1; }
    if (cmd === 'out') { for (j = i + 1; j < tr.length; j++) if (tr[j].depth < cur.depth || tr[j].fertig) return j; return tr.length - 1; }
    for (j = i + 1; j < tr.length; j++) if (tr[j].fertig || bp.indexOf(tr[j].line) >= 0) return j;
    return tr.length - 1;
  }

  /* (E) Debug-Zyklus */
  var ZYKLUS = [
    { station: 0, titel: 'Test scheitert', code: 'assert zustand(85) == "warnung", "Grenzwert 85 °C falsch eingeordnet"', text: 'Der Test von Hand (V12) meldet: AssertionError. Du weißt jetzt, dass es einen Fehler gibt und bei welchem Eingabewert. Das ist der Startpunkt, nicht die Lösung.' },
    { station: 1, titel: 'Hypothese aufstellen', code: '# Vermutung: Bei genau 85 gilt t < 85 nicht mehr.\n# Der Vergleich in Zeile 4 schließt die Grenze aus.', text: 'Rate nicht wild, sondern formuliere eine Vermutung, die sich prüfen lässt: Was ist die wahrscheinliche Ursache? Ein Satz genügt, am besten aufschreiben.' },
    { station: 2, titel: 'Beobachten', code: 'def zustand(t):\n    if t < 70:\n        return "normal"\n    print("t =", t, " t < 85 ist", t < 85)   # Beobachtung\n    elif t < 85:', text: 'Mach sichtbar, was wirklich passiert: mit print an der verdächtigen Stelle, mit dem Schritt-für-Schritt-Visualisierer oder dem Debugger. Hier zeigt die Beobachtung „t = 85, t < 85 ist False“: Die Vermutung stimmt.' },
    { station: 3, titel: 'Korrigieren', code: 'elif t <= 85:      # vorher: elif t < 85:', text: 'Ändere nur das, was die Beobachtung nahelegt, und nur eine Sache auf einmal. Entferne danach die print-Zeilen zum Beobachten wieder.' },
    { station: 0, titel: 'Test erneut', code: 'Alle 9 Tests bestanden', text: 'Alle Tests laufen noch einmal, nicht nur der eine. Eine Korrektur kann an anderer Stelle etwas kaputt machen. Bestehen alle, bist du fertig, sonst beginnt der Zyklus von vorn.' }
  ];

  /* (F) PAP der Funktion zustand */
  function papPfad(t) {
    if (t < -40 || t > 200) return ['s', 'in', 'r1', 'sf', 'e'];
    if (t < 70) return ['s', 'in', 'r1', 'r2', 'o1', 'e'];
    if (t <= 85) return ['s', 'in', 'r1', 'r2', 'r3', 'o2', 'e'];
    return ['s', 'in', 'r1', 'r2', 'r3', 'o3', 'e'];
  }
  var PFAD_FAELLE = [
    { pfad: 'Sensorfehler', typ: [-100, 300], grenz: [-40.1, 200.1] },
    { pfad: 'normal', typ: [20], grenz: [-40, 69.9] },
    { pfad: 'Warnung', typ: [77], grenz: [70, 85] },
    { pfad: 'abschalten', typ: [150], grenz: [85.1, 200] }
  ];

  var core = { zustandRef: zustandRef, MUTANTEN: MUTANTEN, GRENZEN: GRENZEN, BEREICHE: BEREICHE, auswerten: auswerten, SZENARIEN: SZENARIEN, FEHLERARTEN: FEHLERARTEN, DBG_CODE: DBG_CODE, debugTrace: debugTrace, debugNext: debugNext, ZYKLUS: ZYKLUS, papPfad: papPfad, PFAD_FAELLE: PFAD_FAELLE };
  if (typeof module !== 'undefined' && module.exports) module.exports = core;
  if (typeof document === 'undefined') return;

  /* ── Hilfen (DOM) ────────────────────────────────────────── */
  var uid = 0;
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { if (k === 'class') n.className = attrs[k]; else if (k === 'text') n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (c) { n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function svgEl(tag, attrs, text) {
    var n = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function btn(text, cls, fn) { var b = el('button', { type: 'button', class: 'k-btn k-btn--small ' + (cls || ''), text: text }); if (fn) b.addEventListener('click', fn); return b; }
  function fmt(x) { return String(x).replace('.', ','); }
  function codeList(lines, cls) {
    var ol = el('ol', { class: 'v12-code ' + (cls || ''), 'aria-label': 'Programmcode mit Zeilennummern' });
    lines.forEach(function (l, i) { ol.appendChild(el('li', { 'data-ln': String(i + 1) }, [el('code', { text: l || ' ' })])); });
    return ol;
  }

  /* ══════════════════════════════════════════════════════════
     (A) Grenzwerte
     ══════════════════════════════════════════════════════════ */
  function initGrenzen(host) {
    var punkte = [], VMIN = -80, VMAX = 240, X0 = 20, XW = 800;
    function X(v) { return X0 + (v - VMIN) / (VMAX - VMIN) * XW; }
    var strip = svgEl('svg', { viewBox: '0 0 840 156', class: 'v12-strip', role: 'img', 'aria-label': 'Zahlenstrahl der Lagertemperatur von minus 80 bis 240 Grad mit den Bereichen Sensorfehler, normal, Warnung, abschalten, Sensorfehler' });
    var farben = [['sensor-u', VMIN, -40, 'v12-r--sensor', 'Sensor-fehler'], ['normal', -40, 70, 'v12-r--normal', 'normal'], ['warnung', 70, 85, 'v12-r--warn', 'Warn-ung'], ['abschalten', 85, 200, 'v12-r--aus', 'abschalten'], ['sensor-o', 200, VMAX, 'v12-r--sensor', 'Sensor-fehler']];
    farben.forEach(function (f) {
      strip.appendChild(svgEl('rect', { x: X(f[1]), y: 60, width: X(f[2]) - X(f[1]), height: 46, class: 'v12-r ' + f[3] }));
      var cx = (X(f[1]) + X(f[2])) / 2;
      if (f[4].indexOf('-') >= 0) {
        var tl = f[4].split('-');
        strip.appendChild(svgEl('text', { x: cx, y: 93, 'text-anchor': 'middle', class: 'v12-rt v12-rt--s' }, tl[0] + '-'));
        strip.appendChild(svgEl('text', { x: cx, y: 102, 'text-anchor': 'middle', class: 'v12-rt v12-rt--s' }, tl[1]));
      } else strip.appendChild(svgEl('text', { x: cx, y: 100, 'text-anchor': 'middle', class: 'v12-rt' }, f[4]));
    });
    GRENZEN.forEach(function (g) {
      var tief = g.b === 85;
      strip.appendChild(svgEl('line', { x1: X(g.b), x2: X(g.b), y1: 54, y2: tief ? 134 : 112, class: 'v12-grenze' }));
      strip.appendChild(svgEl('text', { x: X(g.b), y: tief ? 148 : 126, 'text-anchor': 'middle', class: 'v12-gt' }, (g.b < 0 ? '−' + (-g.b) : g.b) + ' °C'));
    });
    var pg = svgEl('g', {}); strip.appendChild(pg);
    var inp = el('input', { type: 'text', value: '', size: '8', autocomplete: 'off', inputmode: 'decimal', 'aria-label': 'Testwert in Grad Celsius' });
    var lbl = el('label', { class: 'v12-in' }, [el('span', { text: 'Testwert in °C ' }), inp]);
    var addB = btn('Punkt hinzufügen', '', function () { add(inp.value); });
    var bar = el('div', { class: 'k-presets v12-bar', role: 'group', 'aria-label': 'Testpunkte setzen' }, [lbl, addB,
      btn('Nur typische Werte', 'k-btn--ghost', function () { setPts([20, 77, 150, -100, 300]); }),
      btn('Die 9 Tests aus dem Beispiel', 'k-btn--ghost', function () { setPts([20, 69.9, 70, 85, 85.1, -40, -40.1, 200, 200.1]); }),
      btn('Alle löschen', 'k-btn--link', function () { setPts([]); })]);
    var chips = el('ul', { class: 'v12-chips', 'aria-label': 'Deine Testpunkte' });
    var sum = el('p', { class: 'v12-msg', role: 'status', 'aria-live': 'polite' });
    var abd = el('div', { class: 'v12-abd' });
    var mut = el('ol', { class: 'v12-muts' });
    var fehl = el('p', { class: 'v12-err', role: 'alert' });
    host.appendChild(el('p', { class: 'v12-lbl', text: 'Die Spezifikation als Zahlenstrahl (klicke in den Streifen, um einen ganzzahligen Testpunkt zu setzen, oder tippe einen Wert ein, zum Beispiel 69,9):' }));
    host.appendChild(el('div', { class: 'v12-stripwrap' }, [strip]));
    host.appendChild(bar);
    host.appendChild(fehl);
    host.appendChild(chips);
    host.appendChild(sum);
    host.appendChild(el('div', { class: 'v12-two' }, [
      el('div', {}, [el('h4', { class: 'v12-h', text: 'Was ist abgedeckt?' }), abd]),
      el('div', {}, [el('h4', { class: 'v12-h', text: 'Welche fehlerhaften Varianten (Mutanten) findest du?' }), mut])
    ]));
    function parse(txt) {
      var s = String(txt).trim().replace(',', '.').replace('−', '-');
      if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
      return parseFloat(s);
    }
    function add(txt) {
      var v = parse(txt);
      fehl.textContent = '';
      if (v === null) { fehl.textContent = 'Das ist keine Zahl. Beispiele: 85, 69,9, -40.'; return; }
      if (v < VMIN || v > VMAX) { fehl.textContent = 'Der Zahlenstrahl reicht von -80 bis 240 °C.'; return; }
      if (punkte.indexOf(v) >= 0) { fehl.textContent = 'Diesen Testpunkt gibt es schon.'; return; }
      if (punkte.length >= 30) { fehl.textContent = 'Mehr als 30 Testpunkte brauchst du hier nicht.'; return; }
      punkte.push(v); punkte.sort(function (a, b) { return a - b; }); inp.value = ''; paint();
    }
    function setPts(a) { punkte = a.slice().sort(function (x, y) { return x - y; }); fehl.textContent = ''; paint(); }
    strip.addEventListener('click', function (e) {
      var r = strip.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * 840;
      var v = Math.round((px - X0) / XW * (VMAX - VMIN) + VMIN);
      if (v < VMIN || v > VMAX) return;
      if (punkte.indexOf(v) < 0) { punkte.push(v); punkte.sort(function (a, b) { return a - b; }); fehl.textContent = ''; paint(); }
    });
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); add(inp.value); } });
    function paint() {
      var a = auswerten(punkte), i;
      while (pg.firstChild) pg.removeChild(pg.firstChild);
      var lastX = -1e9, lvl = 0;
      punkte.forEach(function (p) {
        var x = X(p);
        lvl = (x - lastX < 30) ? (lvl + 1) % 3 : 0; lastX = x;
        var cy = 78;
        pg.appendChild(svgEl('line', { x1: x, x2: x, y1: 20 + lvl * 13 + 4, y2: cy - 7, class: 'v12-stiel' }));
        pg.appendChild(svgEl('circle', { cx: x, cy: cy, r: 6.5, class: 'v12-pkt' }));
        pg.appendChild(svgEl('text', { x: x, y: 20 + lvl * 13, 'text-anchor': 'middle', class: 'v12-pt' }, fmt(p)));
      });
      chips.textContent = '';
      punkte.forEach(function (p) {
        var li = el('li', { class: 'v12-chip' });
        li.appendChild(el('span', { text: fmt(p) + ' → ' + zustandRef(p) }));
        var x = el('button', { type: 'button', class: 'v12-x', 'aria-label': 'Testpunkt ' + fmt(p) + ' entfernen', text: '×' });
        x.addEventListener('click', function () { punkte = punkte.filter(function (q) { return q !== p; }); paint(); });
        li.appendChild(x); chips.appendChild(li);
      });
      if (!punkte.length) chips.appendChild(el('li', { class: 'v12-none', text: 'Noch kein Testpunkt gesetzt.' }));
      /* Abdeckung */
      abd.textContent = '';
      var ul1 = el('ul', { class: 'v12-list' });
      a.bereiche.forEach(function (b) { ul1.appendChild(el('li', { class: b.punkte.length ? 'is-ok' : 'is-open' }, [el('span', { text: b.name + ': ' }), el('strong', { text: b.punkte.length ? 'abgedeckt (' + b.punkte.map(fmt).join(', ') + ')' : 'fehlt' })])); });
      abd.appendChild(el('p', { class: 'v12-sub', text: 'Bereiche (Äquivalenzklassen): ein Vertreter genügt' }));
      abd.appendChild(ul1);
      abd.appendChild(el('p', { class: 'v12-sub', text: 'Grenzen: beide Seiten, höchstens 1 °C von der Grenze entfernt' }));
      var ul2 = el('ul', { class: 'v12-list' });
      a.grenzen.forEach(function (g) {
        var b = g.g.b < 0 ? '−' + (-g.g.b) : String(g.g.b);
        ul2.appendChild(el('li', { class: g.links.length && g.rechts.length ? 'is-ok' : 'is-open' }, [
          el('span', { text: 'Grenze ' + b + ' °C, ' }),
          el('span', { text: 'davor (' + g.g.links + '): ' }), el('strong', { text: g.links.length ? g.links.map(fmt).join(', ') : 'fehlt' }),
          el('span', { text: '; dahinter (' + g.g.rechts + '): ' }), el('strong', { text: g.rechts.length ? g.rechts.map(fmt).join(', ') : 'fehlt' })]));
      });
      abd.appendChild(ul2);
      /* Mutanten */
      mut.textContent = '';
      a.mutanten.forEach(function (m) {
        mut.appendChild(el('li', { class: 'v12-mut ' + (m.durch !== null ? 'is-found' : 'is-open') }, [
          el('code', { text: m.m.zeile }), el('span', { class: 'v12-mut__was', text: m.m.was + ': ' }),
          el('strong', { text: m.durch !== null ? 'gefunden durch ' + fmt(m.durch) + ' (Test schlägt fehl)' : 'unentdeckt (alle deine Tests bestehen)' })]));
      });
      sum.textContent = punkte.length
        ? 'Du hast ' + punkte.length + ' Testpunkte. Bereiche abgedeckt: ' + a.nBereiche + ' von 5. Grenzseiten abgedeckt: ' + a.nSeiten + ' von 8. Gefundene Mutanten: ' + a.nMut + ' von ' + MUTANTEN.length + '.' + (a.nMut === MUTANTEN.length ? ' Alle gefunden: Das ist eine gute Testmenge.' : '')
        : 'Setze Testpunkte, um zu sehen, welche Fehler sie finden.';
    }
    paint();
  }

  /* ══════════════════════════════════════════════════════════
     (B) Traceback lesen
     ══════════════════════════════════════════════════════════ */
  function initTraceback(host) {
    var keys = Object.keys(SZENARIEN), cur = keys[0], step = 0;
    var sel = el('div', { class: 'k-presets v12-bar', role: 'group', 'aria-label': 'Beispiel wählen' });
    var tb = el('div', { class: 'v12-tb', role: 'group', 'aria-label': 'Traceback, von unten nach oben lesen' });
    var codeBox = el('div', {});
    var msg = el('p', { class: 'v12-msg is-on', role: 'status', 'aria-live': 'polite' });
    var bar = el('div', { class: 'k-presets v12-bar' });
    var bNext = btn('Nächste Zeile lesen (von unten nach oben)', '', function () { if (step < maxStep()) { step++; paint(); } });
    var bBack = btn('Zurück', 'k-btn--ghost', function () { if (step > 0) { step--; paint(); } });
    var bReset = btn('Neu beginnen', 'k-btn--link', function () { step = 0; paint(); });
    bar.appendChild(bNext); bar.appendChild(bBack); bar.appendChild(bReset);
    keys.forEach(function (k) {
      var b = btn(SZENARIEN[k].titel, 'k-btn--ghost', function () { cur = k; step = 0; paint(); });
      b.setAttribute('data-k', k); sel.appendChild(b);
    });
    host.appendChild(sel);
    host.appendChild(bar);
    host.appendChild(msg);
    host.appendChild(el('div', { class: 'v12-grid' }, [el('div', {}, [el('p', { class: 'v12-lbl', text: 'Was Python ausgibt (klicke eine Zeile an):' }), tb]), el('div', {}, [el('p', { class: 'v12-lbl', text: 'Das Programm:' }), codeBox])]));
    /* Schritt 0: nichts gelesen; 1: Fehlerzeile; 2: Fehlerstelle (unterster Eintrag); 3 bis n+1: die Aufrufer nach oben */
    function maxStep() { return SZENARIEN[cur].frames.length + 1; }
    function paint() {
      var S = SZENARIEN[cur], n = S.frames.length, ol, k;
      Array.prototype.forEach.call(sel.children, function (b) { var on = b.getAttribute('data-k') === cur; b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.classList.toggle('is-sel', on); });
      tb.textContent = '';
      tb.appendChild(el('div', { class: 'v12-tbl v12-tbl--head', text: 'Traceback (most recent call last):' }));
      S.frames.forEach(function (f, i) {
        var mine = n - i + 1;                   /* Schritt, in dem dieser Eintrag gelesen wird */
        var box = el('button', { type: 'button', class: 'v12-fr' + (step >= mine ? ' is-read' : '') + (step === mine ? ' is-now' : '') }, [
          el('span', { class: 'v12-fr__a', text: 'File "' + S.datei + '", line ' + f.zeile + ', in ' + f.name }),
          el('span', { class: 'v12-fr__b', text: f.text })]);
        box.addEventListener('click', function () { step = mine; paint(); });
        tb.appendChild(box);
      });
      var last = el('button', { type: 'button', class: 'v12-fr v12-fr--err' + (step >= 1 ? ' is-read' : '') + (step === 1 ? ' is-now' : '') }, [el('span', { class: 'v12-fr__a', text: S.fehler })]);
      last.addEventListener('click', function () { step = 1; paint(); });
      tb.appendChild(last);
      codeBox.textContent = '';
      ol = codeList(S.code);
      codeBox.appendChild(ol);
      if (step >= 1) {
        var fr = S.frames[step === 1 ? n - 1 : n - (step - 1)];
        if (fr && ol.children[fr.zeile - 1]) ol.children[fr.zeile - 1].classList.add('is-active');
        for (k = 2; k < step; k++) { var f2 = S.frames[n - (k - 1)]; if (f2 && ol.children[f2.zeile - 1]) ol.children[f2.zeile - 1].classList.add('is-visited'); }
      }
      msg.className = 'v12-msg is-on';
      msg.textContent = step === 0
        ? 'Ein Traceback hat unten die Fehlerzeile und darüber einen Eintrag je Funktionsaufruf, der zum Fehler geführt hat. Lies von unten nach oben: Klick auf „Nächste Zeile lesen“ oder auf eine Zeile. Die zugehörige Codezeile leuchtet rechts auf.'
        : 'Schritt ' + step + ' von ' + (n + 1) + ': ' + S.schritte[step - 1];
      bBack.disabled = step === 0; bNext.disabled = step >= n + 1;
    }
    paint();
  }

  /* ══════════════════════════════════════════════════════════
     (C) Fehlerart bestimmen
     ══════════════════════════════════════════════════════════ */
  function initFehlerart(host) {
    var i = 0, gewaehlt = [];
    var codeBox = el('pre', { class: 'v12-fa-code' });
    var opts = el('div', { class: 'k-presets v12-bar', role: 'group', 'aria-label': 'Fehlerart wählen' });
    var res = el('p', { class: 'v12-res', role: 'status', 'aria-live': 'polite' });
    var ausg = el('pre', { class: 'v12-fa-out', 'aria-label': 'Ausgabe von Python' });
    var head = el('p', { class: 'v12-lbl' });
    var weiter = btn('Nächstes Beispiel', 'k-btn', function () { if (i < FEHLERARTEN.length - 1) { i++; } else { i = 0; gewaehlt = []; } paint(); });
    ['syntax', 'laufzeit', 'logik'].forEach(function (a) { var b = btn(ART_NAME[a], 'k-btn--ghost', function () { if (gewaehlt[i] === undefined) { gewaehlt[i] = a; paint(); } }); b.setAttribute('data-a', a); opts.appendChild(b); });
    host.appendChild(head); host.appendChild(codeBox); host.appendChild(el('p', { class: 'v12-lbl', text: 'Welche Fehlerart ist das?' })); host.appendChild(opts);
    host.appendChild(res); host.appendChild(ausg); host.appendChild(el('div', { class: 'k-presets v12-bar' }, [weiter]));
    function paint() {
      var F = FEHLERARTEN[i], a = gewaehlt[i], richtig = gewaehlt.filter(function (g, k) { return g !== undefined && g === FEHLERARTEN[k].art; }).length;
      head.textContent = 'Beispiel ' + (i + 1) + ' von ' + FEHLERARTEN.length + ' · richtig bisher: ' + richtig;
      codeBox.textContent = F.code;
      Array.prototype.forEach.call(opts.children, function (b) { b.disabled = a !== undefined; });
      if (a === undefined) { res.className = 'v12-res'; res.textContent = ''; ausg.textContent = ''; ausg.className = 'v12-fa-out'; }
      else {
        var ok = a === F.art;
        res.className = 'v12-res is-on ' + (ok ? 'is-ok' : 'is-bad');
        res.textContent = (ok ? 'Richtig: ' : 'Nicht ganz, es ist ein ') + ART_NAME[F.art] + '. ' + F.erkl;
        ausg.textContent = F.ausgabe; ausg.className = 'v12-fa-out is-on';
      }
      weiter.textContent = i < FEHLERARTEN.length - 1 ? 'Nächstes Beispiel' : 'Von vorn beginnen';
    }
    paint();
  }

  /* ══════════════════════════════════════════════════════════
     (D) Debugger (schematisch)
     ══════════════════════════════════════════════════════════ */
  function initDebugger(host) {
    var tr = debugTrace(), i = -1, bp = [10];
    var ol = codeList(DBG_CODE, 'v12-code--dbg');
    var gutter = el('ol', { class: 'v12-gut', 'aria-label': 'Haltepunkte, Zeile anklicken' });
    DBG_CODE.forEach(function (l, k) {
      var b = el('button', { type: 'button', class: 'v12-bp', 'aria-label': 'Haltepunkt in Zeile ' + (k + 1) + ' umschalten', 'aria-pressed': 'false', 'data-ln': String(k + 1) });
      b.addEventListener('click', function () { var p = bp.indexOf(k + 1); if (p >= 0) bp.splice(p, 1); else bp.push(k + 1); paint(); });
      gutter.appendChild(el('li', {}, [b]));
    });
    var localDl = el('dl', { class: 'v12-vars' }), globDl = el('dl', { class: 'v12-vars' });
    var stackUl = el('ul', { class: 'v12-stack' });
    var term = el('pre', { class: 'v12-term', 'aria-label': 'Terminal' });
    var msg = el('p', { class: 'v12-msg is-on', role: 'status', 'aria-live': 'polite' });
    var bStart = btn('Debuggen starten (F5)', '', function () { go('start'); });
    var bCont = btn('Weiter (F5)', 'k-btn--ghost', function () { go('cont'); });
    var bOver = btn('Schritt über (F10)', 'k-btn--ghost', function () { go('over'); });
    var bInto = btn('Schritt hinein (F11)', 'k-btn--ghost', function () { go('into'); });
    var bOut = btn('Schritt heraus (Umschalt+F11)', 'k-btn--ghost', function () { go('out'); });
    var bReset = btn('Neu starten', 'k-btn--link', function () { i = -1; paint(); });
    host.appendChild(el('div', { class: 'k-presets v12-bar', role: 'group', 'aria-label': 'Debugger-Befehle (wie die Symbolleiste in VS Code)' }, [bStart, bCont, bOver, bInto, bOut, bReset]));
    host.appendChild(msg);
    host.appendChild(el('div', { class: 'v12-grid v12-grid--dbg' }, [
      el('div', {}, [el('p', { class: 'v12-lbl', text: 'Editor (roter Punkt = Haltepunkt):' }), el('div', { class: 'v12-edwrap' }, [gutter, ol])]),
      el('div', { class: 'v12-side' }, [
        el('p', { class: 'v12-lbl', text: 'Variablen, lokal (nur in der Funktion):' }), localDl,
        el('p', { class: 'v12-lbl', text: 'Variablen, global (Hauptprogramm):' }), globDl,
        el('p', { class: 'v12-lbl', text: 'Aufrufliste:' }), stackUl,
        el('p', { class: 'v12-lbl', text: 'Terminal:' }), term])
    ]));
    function go(cmd) {
      if (cmd === 'start') { var j; if (i >= 0) return; i = tr.length - 1; for (j = 0; j < tr.length; j++) { if (bp.indexOf(tr[j].line) >= 0) { i = j; break; } } }
      else if (i < 0) return;
      else i = debugNext(tr, i, cmd, bp);
      paint();
    }
    function paint() {
      var s = i >= 0 ? tr[i] : null, k;
      Array.prototype.forEach.call(ol.children, function (li) { li.classList.remove('is-active'); });
      Array.prototype.forEach.call(gutter.querySelectorAll('.v12-bp'), function (b) { var on = bp.indexOf(+b.getAttribute('data-ln')) >= 0; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      localDl.textContent = ''; globDl.textContent = ''; stackUl.textContent = ''; term.textContent = '';
      if (!s) {
        msg.textContent = 'Das Programm läuft noch nicht. Der Haltepunkt (roter Punkt) steht in Zeile 10. Du kannst ihn per Klick auf den Rand verschieben oder löschen. Dann „Debuggen starten“.';
        [bCont, bOver, bInto, bOut].forEach(function (b) { b.disabled = true; }); bStart.disabled = false;
        return;
      }
      bStart.disabled = true;
      [bCont, bOver, bInto, bOut].forEach(function (b) { b.disabled = !!s.fertig; });
      if (s.line && ol.children[s.line - 1]) ol.children[s.line - 1].classList.add('is-active');
      if (s.lokal.length) s.lokal.forEach(function (p) { localDl.appendChild(el('dt', { text: p[0] })); localDl.appendChild(el('dd', { text: p[1] })); }); else localDl.appendChild(el('dd', { class: 'v12-none', text: '(keine, du bist im Hauptprogramm)' }));
      s.globals.forEach(function (p) { globDl.appendChild(el('dt', { text: p[0] })); globDl.appendChild(el('dd', { text: p[1] })); });
      if (s.depth === 1) stackUl.appendChild(el('li', { class: 'is-top', text: 'zustand, Zeile ' + s.line })), stackUl.appendChild(el('li', { text: '<module> (Hauptprogramm), Zeile 10' }));
      else if (!s.fertig) stackUl.appendChild(el('li', { class: 'is-top', text: '<module> (Hauptprogramm), Zeile ' + s.line }));
      else stackUl.appendChild(el('li', { class: 'v12-none', text: '(beendet)' }));
      term.textContent = s.out.length ? s.out.join('\n') : ' ';
      msg.textContent = s.msg;
      msg.className = 'v12-msg is-on' + (s.fertig ? ' is-bad' : '');
    }
    paint();
  }

  /* ══════════════════════════════════════════════════════════
     (E) Debug-Zyklus
     ══════════════════════════════════════════════════════════ */
  function initZyklus(host) {
    var s = 0;
    /* Stationen im Kreis: 0 Test, 1 Hypothese, 2 Beobachten, 3 Korrigieren */
    var svg = svgEl('svg', { viewBox: '0 0 440 240', class: 'v12-cyc', role: 'img', 'aria-label': 'Debug-Zyklus: Test scheitert, Hypothese aufstellen, Beobachten, Korrigieren, danach Test erneut' });
    var pos = [[220, 34], [370, 120], [220, 206], [70, 120]];
    var names = ['Test', 'Hypothese', 'Beobachten', 'Korrigieren'];
    var arrows = [[[260, 44], [335, 98]], [[352, 148], [262, 196]], [[178, 196], [88, 148]], [[88, 92], [178, 46]]];
    var defs = svgEl('defs', {}); var mk = svgEl('marker', { id: 'v12-ah', viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' });
    mk.appendChild(svgEl('path', { d: 'M0,0 L10,5 L0,10 z', class: 'v12-ahp' })); defs.appendChild(mk); svg.appendChild(defs);
    arrows.forEach(function (a) { svg.appendChild(svgEl('path', { d: 'M' + a[0][0] + ',' + a[0][1] + ' L' + a[1][0] + ',' + a[1][1], class: 'v12-arr', 'marker-end': 'url(#v12-ah)' })); });
    var gs = pos.map(function (p, k) {
      var g = svgEl('g', { class: 'v12-nd', 'data-k': String(k) });
      g.appendChild(svgEl('rect', { x: p[0] - 62, y: p[1] - 20, width: 124, height: 40, rx: 4 }));
      g.appendChild(svgEl('text', { x: p[0], y: p[1] + 5, 'text-anchor': 'middle' }, names[k]));
      svg.appendChild(g); return g;
    });
    var titel = el('h4', { class: 'v12-h' });
    var text = el('p', { class: 'v12-msg is-on', role: 'status', 'aria-live': 'polite' });
    var code = el('pre', { class: 'v12-fa-code' });
    var bar = el('div', { class: 'k-presets v12-bar' }, [btn('Nächster Schritt', '', function () { if (s < ZYKLUS.length - 1) { s++; paint(); } }), btn('Zurück', 'k-btn--ghost', function () { if (s > 0) { s--; paint(); } }), btn('Neu beginnen', 'k-btn--link', function () { s = 0; paint(); })]);
    host.appendChild(bar);
    host.appendChild(el('div', { class: 'v12-grid v12-grid--cyc' }, [svg, el('div', {}, [titel, text, code])]));
    function paint() {
      var z = ZYKLUS[s];
      gs.forEach(function (g, k) { g.classList.toggle('is-active', k === z.station); });
      titel.textContent = 'Schritt ' + (s + 1) + ' von ' + ZYKLUS.length + ': ' + z.titel;
      text.textContent = z.text; code.textContent = z.code;
      bar.children[0].disabled = s >= ZYKLUS.length - 1; bar.children[1].disabled = s === 0;
    }
    paint();
  }

  /* ══════════════════════════════════════════════════════════
     (F) PAP der Funktion zustand: Pfade und Testfälle
     ══════════════════════════════════════════════════════════ */
  function papSpec() {
    var P = root.KursPAP.P;
    return [
      P.start('s'),
      P.io('Eingabe: t', 'in'),
      P.iff('t < -40 or t > 200?', [P.io('Ausgabe: "sensorfehler"', 'sf')], [
        P.iff('t < 70?', [P.io('Ausgabe: "normal"', 'o1')], [
          P.iff('t <= 85?', [P.io('Ausgabe: "warnung"', 'o2')], [P.io('Ausgabe: "abschalten"', 'o3')], 'r3')
        ], 'r2')
      ], 'r1'),
      P.end('e')
    ];
  }
  function initPapPfade(host) {
    if (!root.KursPAP) { host.appendChild(el('p', { class: 'k-small k-muted', text: 'Für dieses Explorable wird die PAP-Engine benötigt.' })); return; }
    var papHost = el('div', { class: 'v12-pap' });
    papHost.innerHTML = root.KursPAP.figure(papSpec(), { cls: 'pap--run', label: 'Programmablaufplan der Funktion zustand: Eingabe t, drei Rauten nacheinander (Sensorfehler, kleiner als 70, kleiner gleich 85), vier mögliche Ausgaben.' });
    var inp = el('input', { type: 'text', value: '85', size: '7', autocomplete: 'off', inputmode: 'decimal', 'aria-label': 'Wert für t in Grad Celsius' });
    var go = btn('Pfad zeigen', '', function () { show(parse(inp.value)); });
    var res = el('p', { class: 'v12-msg is-on', role: 'status', 'aria-live': 'polite' });
    var table = el('table', { class: 'k-types v12-tab' });
    function parse(t) { var s = String(t).trim().replace(',', '.'); return /^-?\d+(\.\d+)?$/.test(s) ? parseFloat(s) : null; }
    var thead = el('thead', {}, [el('tr', {}, [el('th', { scope: 'col', text: 'Pfad durch den PAP' }), el('th', { scope: 'col', text: 'Typischer Wert' }), el('th', { scope: 'col', text: 'Grenzwerte' })])]);
    var tb = el('tbody');
    PFAD_FAELLE.forEach(function (f) {
      var tr = el('tr'); tr.appendChild(el('th', { scope: 'row', text: f.pfad }));
      [f.typ, f.grenz].forEach(function (list) {
        var td = el('td');
        list.forEach(function (v) { var b = btn(fmt(v), 'k-btn--ghost v12-val', function () { inp.value = String(v); show(v); }); td.appendChild(b); td.appendChild(document.createTextNode(' ')); });
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
    table.appendChild(thead); table.appendChild(tb);
    host.appendChild(el('div', { class: 'k-presets v12-bar', role: 'group', 'aria-label': 'Wert für t wählen' }, [el('label', { class: 'v12-in' }, [el('span', { text: 't = ' }), inp, el('span', { text: ' °C ' })]), go]));
    host.appendChild(res);
    host.appendChild(el('div', { class: 'v12-grid v12-grid--pap' }, [papHost, el('div', {}, [el('p', { class: 'v12-lbl', text: 'Aus dem PAP abgeleitete Testfälle (Wert anklicken, Pfad ansehen):' }), table])]));
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); show(parse(inp.value)); } });
    function node(id) { return papHost.querySelector('.pap-n[data-id="' + id + '"]'); }
    function show(t) {
      Array.prototype.forEach.call(papHost.querySelectorAll('.is-active, .is-done'), function (n) { n.classList.remove('is-active', 'is-done'); });
      if (t === null) { res.textContent = 'Das ist keine Zahl. Beispiele: 85, 69,9, -40.'; return; }
      var p = papPfad(t);
      p.forEach(function (id, k) { var n = node(id); if (n) n.classList.add(k === p.length - 2 ? 'is-active' : 'is-done'); });
      res.textContent = 't = ' + fmt(t) + ' °C: Der Pfad läuft durch ' + (p.filter(function (id) { return /^r/.test(id); }).length) + ' Raute' + (p.filter(function (id) { return /^r/.test(id); }).length === 1 ? '' : 'n') + ' und endet bei der Ausgabe „' + zustandRef(t) + '“.';
    }
    show(85);
  }

  /* ── Initialisierung ──────────────────────────────────────── */
  function init() {
    var map = { grenzen: initGrenzen, traceback: initTraceback, fehlerart: initFehlerart, 'debugger': initDebugger, zyklus: initZyklus, 'pap-pfade': initPapPfade };
    Object.keys(map).forEach(function (k) { Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="' + k + '"]'), map[k]); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : globalThis);
