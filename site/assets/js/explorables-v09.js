/* =============================================================
   explorables-v09.js – interaktive Bausteine für V09 „Dateien & Fehler“ (reines JS, kein Framework)
   (A) Textkodierung: Zeichen werden Bytes (UTF-8 oder Latin-1) und wieder Zeichen: warum „ä“ kaputt aussieht.
   (B) CSV-Zeile zerlegen: strip → split → Feld wählen → replace → float, Schritt für Schritt.
   (C) try/except: Sprung in den except-Block (ValueError, IndexError, nicht gefangener Fehler).
   (D) Datei Zeile für Zeile lesen: Programmablaufplan (KursPAP) + Code + Zeilen der Datei.
   Der Rechenkern ist ohne DOM per node testbar (module.exports).
   ============================================================= */
(function (root) {
  'use strict';

  /* ── Kern (ohne DOM) ─────────────────────────────────────── */
  /* Text so schreiben, wie Python ihn mit repr() druckt (einfache Anführungszeichen, \n sichtbar) */
  function reprStr(s) {
    return "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + "'";
  }
  function reprList(a) { return '[' + a.map(reprStr).join(', ') + ']'; }
  /* Zahl so schreiben, wie Python sie druckt (für die hier vorkommenden Werte genügt das) */
  function reprNum(x) { var s = String(x); return /^-?\d+$/.test(s) ? s + '.0' : s; }
  /* float(text) wie Python (nur die hier relevanten Formen): gibt {ok, v} oder {ok:false} */
  function pyFloat(text) {
    var t = String(text).trim();
    if (!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(t)) return { ok: false };
    return { ok: true, v: parseFloat(t) };
  }
  var TRAENNER = [';', ','];

  /* (B) Schritte beim Zerlegen einer CSV-Zeile. opt: {trenn, spalte, replace} */
  function zerlegeSchritte(roh, opt) {
    var trenn = opt.trenn, sp = opt.spalte, mitRep = opt.replace !== false;
    var st = [], s1, felder, text, text2, f;
    st.push({ code: 'zeile', ausdruck: 'zeile', wert: reprStr(roh), art: 'text', msg: 'So liefert Python die Zeile aus der Datei: ein Text, und am Ende steht noch der Zeilenumbruch \\n.' });
    s1 = roh.trim();
    st.push({ code: 'zeile.strip()', ausdruck: 'zeile.strip()', wert: reprStr(s1), art: 'text', msg: 'strip() schneidet Leerzeichen und Zeilenumbruch an beiden Enden ab. Der Text in der Mitte bleibt, wie er ist.' });
    felder = s1.split(trenn);
    st.push({ code: 'zeile.strip().split(' + reprStr(trenn) + ')', ausdruck: 'felder = ...split(' + reprStr(trenn) + ')', felder: felder, art: 'felder',
      msg: 'split(' + reprStr(trenn) + ') zerschneidet den Text an jedem Trennzeichen und liefert eine Liste (V08) aus ' + felder.length + ' Texten.' +
        (felder.length !== 5 ? ' Die Datei hat aber fünf Spalten: Hier stimmt das Trennzeichen nicht oder die Zeile ist kaputt.' : '') });
    if (sp >= felder.length) {
      st.push({ code: 'felder[' + sp + ']', ausdruck: 'felder[' + sp + ']', fehler: 'IndexError: list index out of range', art: 'fehler', sel: sp,
        msg: 'Die Liste hat nur ' + felder.length + ' Elemente (Index 0 bis ' + (felder.length - 1) + '). Index ' + sp + ' gibt es nicht: IndexError. Das Programm bricht hier ab, wenn kein try/except dahinter steht.' });
      return st;
    }
    text = felder[sp];
    st.push({ code: 'felder[' + sp + ']', ausdruck: 'text = felder[' + sp + ']', wert: reprStr(text), art: 'text', sel: sp, felder: felder,
      msg: 'Mit dem Index (V08) holst du die gesuchte Spalte. Bei phyphox ist Spalte 0 die Zeit und Spalte 2 die Beschleunigung in y-Richtung. Noch ist es ein Text, keine Zahl.' });
    text2 = mitRep ? text.replace(/,/g, '.') : text;
    if (mitRep) st.push({ code: 'text.replace(",", ".")', ausdruck: 'text = text.replace(",", ".")', wert: reprStr(text2), art: 'text',
      msg: text2 === text ? 'replace ersetzt jedes Komma durch einen Punkt. Hier steht kein Komma im Text, also ändert sich nichts.' : 'replace ersetzt jedes Komma durch einen Punkt: Python kennt als Dezimaltrenner nur den Punkt (V03).' });
    f = pyFloat(text2);
    if (f.ok) st.push({ code: 'float(text)', ausdruck: 'zahl = float(text)', wert: reprNum(f.v), art: 'zahl',
      msg: 'float() macht aus dem Text eine Kommazahl (V03). Jetzt kannst du rechnen: ' + reprNum(f.v) + ' m/s².' });
    else st.push({ code: 'float(text)', ausdruck: 'zahl = float(text)', fehler: 'ValueError: could not convert string to float: ' + reprStr(text2), art: 'fehler',
      msg: 'float() kann ' + reprStr(text2) + ' nicht in eine Zahl umwandeln: ValueError.' + (mitRep ? '' : ' Das Dezimalkomma ist der Grund: Ohne replace(",", ".") scheitert float bei jeder Zeile.') });
    return st;
  }

  /* (C) Schritte des try/except-Beispiels */
  var TRY_ZEILEN = {
    ok: ['4,94', '0,10', '-3,78'],
    wert: ['5,04', '0,07', 'Fehler'],
    kurz: ['5,02', '0,09']
  };
  var TRY_CODE_BASIS = ['kaputt = 0', 'try:', '    t = zahl(zeile[0])', '    a = zahl(zeile[2])', '    print("ok:", t, a)', null, '    kaputt = kaputt + 1', '    print("kaputte Zeile")', 'print("weiter, kaputt =", kaputt)'];
  function tryCode(beide) {
    var c = TRY_CODE_BASIS.slice();
    c[5] = beide ? 'except (ValueError, IndexError):' : 'except ValueError:';
    return c;
  }
  function zahlTxt(t) { var f = pyFloat(String(t).replace(',', '.')); return f.ok ? f : null; }
  function trySteps(szenario, beide) {
    var z = TRY_ZEILEN[szenario], st = [], v = { kaputt: null, t: null, a: null }, out = [];
    function snap(line, msg, extra) {
      var o = { line: line, msg: msg, vars: { kaputt: v.kaputt, t: v.t, a: v.a }, out: out.slice(), skipped: [], mode: '' };
      if (extra) Object.keys(extra).forEach(function (k) { o[k] = extra[k]; });
      st.push(o);
    }
    snap(1, 'Der Zähler für kaputte Zeilen startet bei 0.'); v.kaputt = 0; st[0].vars.kaputt = 0;
    snap(2, 'try: heißt „versuch es“. Python führt den eingerückten Block aus. Geht alles gut, wird der except-Block ganz übersprungen.', { mode: 'try' });
    var t = zahlTxt(z[0]);
    if (!t) { return finish(1, 'ValueError: could not convert string to float: ' + reprStr(z[0])); }
    v.t = t.v;
    snap(3, 't = zahl(zeile[0]): Aus ' + reprStr(z[0]) + ' wird die Zahl ' + reprNum(t.v) + '.', { mode: 'try' });
    if (2 >= z.length) return finish(2, 'IndexError: list index out of range', 'Die Zeile hat nur ' + z.length + ' Spalten, zeile[2] gibt es nicht.');
    var a = zahlTxt(z[2]);
    if (!a) return finish(2, 'ValueError: could not convert string to float: ' + reprStr(z[2]), 'Aus ' + reprStr(z[2]) + ' lässt sich keine Zahl machen.');
    v.a = a.v;
    snap(4, 'a = zahl(zeile[2]): Aus ' + reprStr(z[2]) + ' wird ' + reprNum(a.v) + '.', { mode: 'try' });
    out.push('ok: ' + reprNum(t.v) + ' ' + reprNum(a.v));
    snap(5, 'print gibt die Werte aus. Der Block ist ohne Fehler zu Ende: Der except-Block wird übersprungen.', { mode: 'try', skipped: [6, 7, 8] });
    snap(9, 'Das Programm läuft nach dem try/except normal weiter.', { skipped: [6, 7, 8] });
    return st;

    function finish(nr, fehler, grund) {
      var bad = nr + 2;  /* Zeile im Code, in der der Fehler auftritt (3 oder 4) */
      var uebersprungen = [];
      for (var k = bad + 1; k <= 5; k++) uebersprungen.push(k);
      var fangen = fehler.indexOf('ValueError') === 0 || beide;
      snap(bad, 'In dieser Zeile passiert der Fehler. ' + (grund || '') + ' Python löst eine Ausnahme aus: ' + fehler, { mode: 'fehler', fehler: fehler, skipped: uebersprungen });
      if (fangen) {
        snap(6, 'Python springt sofort in den passenden except-Block. Er fängt ' + (fehler.split(':')[0]) + ' ab. ' + (uebersprungen.length === 1 ? 'Die Zeile ' + uebersprungen[0] + ' des try-Blocks wird nicht mehr ausgeführt.' : 'Die Zeilen ' + uebersprungen.join(' und ') + ' des try-Blocks werden nicht mehr ausgeführt.'), { mode: 'except', skipped: uebersprungen });
        v.kaputt = 1;
        snap(7, 'Der Zähler wird um 1 erhöht.', { mode: 'except', skipped: uebersprungen });
        out.push('kaputte Zeile');
        snap(8, 'Die Meldung kommt: Das Programm ist nicht abgestürzt, es hat den Fehler behandelt.', { mode: 'except', skipped: uebersprungen });
        snap(9, 'Das Programm läuft nach dem try/except normal weiter, der Zähler steht auf 1.', { skipped: uebersprungen });
      } else {
        snap(6, 'Der Block sagt except ValueError, aber der Fehler ist ein ' + fehler.split(':')[0] + '. Die Art passt nicht, also fängt dieser except-Block ihn nicht.', { mode: 'unpassend', skipped: uebersprungen });
        st.push({ line: 0, msg: 'Das Programm bricht ab. Python druckt den Traceback, die letzte Zeile nennt die Fehlerart: ' + fehler, vars: { kaputt: v.kaputt, t: v.t, a: v.a }, out: out.slice(), skipped: [], mode: 'abbruch', fehler: fehler, ende: true });
      }
      return st;
    }
  }

  /* (D) Schritte beim Einlesen einer kleinen Datei */
  var DATEI_ZEILEN = ['0,00;-0,06', '0,02;-0,31', '0,04;Fehler', '0,06;-2,10', '0,08;', '0,10;-3,78'];
  function dateiSteps(zeilen) {
    var st = [], werte = [], kaputt = 0, i;
    function snap(line, nodes, edges, i, msg, extra) {
      var o = { line: line, nodes: nodes, edges: edges, i: i, msg: msg, werte: werte.slice(), kaputt: kaputt };
      if (extra) Object.keys(extra).forEach(function (k) { o[k] = extra[k]; });
      st.push(o);
    }
    var prev;
    snap(1, ['init'], [['start', 'init', '']], -1, 'Zuerst startet der Zähler für kaputte Zeilen bei 0, und die Liste werte ist leer (Kopfzeile schon gelesen).');
    prev = ['init', 'loop', ''];
    for (i = 0; i < zeilen.length; i++) {
      var teile = zeilen[i].split(';'), f = zahlTxt(teile[1] === undefined ? '' : teile[1]);
      snap(3, ['loop', 'nxt'], [prev, ['loop', 'nxt', 'ja']], i, 'Es ist noch eine Zeile übrig: ' + reprStr(zeilen[i]) + ' (Zeile ' + (i + 1) + ' von ' + zeilen.length + ' nach der Kopfzeile).');
      snap(5, ['chk'], [['nxt', 'chk', '']], i, 'Versuch: Lässt sich ' + reprStr(teile[1] === undefined ? '' : teile[1]) + ' in eine Zahl umwandeln? ' + (f ? 'Ja.' : 'Nein, das gibt einen ValueError.'), { ok: !!f, test: true });
      if (f) {
        werte.push(f.v);
        snap(6, ['ok'], [['chk', 'ok', 'ja']], i, 'Die Umwandlung gelingt: ' + reprNum(f.v) + ' wird an die Liste werte angehängt.', { ok: true });
        prev = ['ok', 'loop', ''];
      } else {
        kaputt = kaputt + 1;
        snap(8, ['bad'], [['chk', 'bad', 'nein']], i, 'Der except-Block läuft: Der Zähler kaputt steht jetzt auf ' + kaputt + '. Die Zeile wird übersprungen, das Programm läuft weiter.', { ok: false });
        prev = ['bad', 'loop', ''];
      }
    }
    snap(9, ['loop', 'out', 'end'], [prev, ['loop', 'out', 'nein'], ['out', 'end', '']], zeilen.length, 'Keine Zeile mehr übrig: Die Schleife endet. Es gibt ' + werte.length + ' gültige Werte und ' + kaputt + ' kaputte Zeilen.', { done: true });
    return st;
  }

  /* (A) Kodierung */
  function utf8Bytes(s) {
    var b = [], i, c, cp;
    for (i = 0; i < s.length; i++) {
      cp = s.codePointAt(i);
      if (cp > 0xFFFF) i++;
      if (cp < 0x80) b.push(cp);
      else if (cp < 0x800) b.push(0xC0 | (cp >> 6), 0x80 | (cp & 63));
      else if (cp < 0x10000) b.push(0xE0 | (cp >> 12), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
      else b.push(0xF0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
    }
    return b;
  }
  /* Windows-1252: wie Latin-1, aber 0x80 bis 0x9F belegt mit Zeichen wie € und Š */
  var CP_HOCH = '€�‚ƒ„…†‡ˆ‰Š‹Œ�Ž��‘’“”•–—˜™š›œ�žŸ';
  function cp1252Bytes(s) {
    var b = [], bad = [], i, c, k;
    for (i = 0; i < s.length; i++) {
      c = s.charCodeAt(i);
      if (c < 0x80 || (c >= 0xA0 && c < 256)) b.push(c);
      else { k = CP_HOCH.indexOf(s.charAt(i)); if (k >= 0 && s.charAt(i) !== '�') b.push(0x80 + k); else { b.push(63); bad.push(s.charAt(i)); } }
    }
    return { bytes: b, nichtDarstellbar: bad };
  }
  function hex2(n) { return (n < 16 ? '0' : '') + n.toString(16).toUpperCase(); }
  function hex2l(n) { return '0x' + (n < 16 ? '0' : '') + n.toString(16); }
  /* UTF-8 lesen: {ok, text} oder {ok:false, pos, byte, grund} wie Python */
  function utf8Lesen(b) {
    var i = 0, out = '', c, n, k, cp;
    while (i < b.length) {
      c = b[i];
      if (c < 0x80) { out += String.fromCharCode(c); i++; continue; }
      if (c >= 0xC2 && c <= 0xDF) n = 1; else if (c >= 0xE0 && c <= 0xEF) n = 2; else if (c >= 0xF0 && c <= 0xF4) n = 3; else return { ok: false, pos: i, byte: c, grund: 'invalid start byte' };
      cp = c & (0xFF >> (n + 2));
      for (k = 1; k <= n; k++) {
        if (i + k >= b.length) return { ok: false, pos: i, byte: c, grund: 'unexpected end of data' };
        if ((b[i + k] & 0xC0) !== 0x80) return { ok: false, pos: i, byte: c, grund: 'invalid continuation byte' };
        cp = (cp << 6) | (b[i + k] & 63);
      }
      out += String.fromCodePoint(cp); i += n + 1;
    }
    return { ok: true, text: out };
  }
  function cp1252Lesen(b) { return b.map(function (x) { return x >= 0x80 && x < 0xA0 ? CP_HOCH.charAt(x - 0x80) : String.fromCharCode(x); }).join(''); }
  function kodierung(text, speichern, lesen) {
    var bytes = [], hinweis = '';
    if (speichern === 'utf8') bytes = utf8Bytes(text);
    else { var l = cp1252Bytes(text); bytes = l.bytes; if (l.nichtDarstellbar.length) hinweis = 'Windows-1252 kennt nur 256 Zeichen: ' + l.nichtDarstellbar.join(' ') + ' wird zu „?“ (Python würde einen UnicodeEncodeError melden).'; }
    var res;
    if (lesen === 'utf8') {
      var r = utf8Lesen(bytes);
      res = r.ok ? { text: r.text } : { fehler: "UnicodeDecodeError: 'utf-8' codec can't decode byte " + hex2l(r.byte) + ' in position ' + r.pos + ': ' + r.grund };
    } else res = { text: cp1252Lesen(bytes) };
    return { bytes: bytes, hinweis: hinweis, ergebnis: res };
  }

  var core = { reprStr: reprStr, reprList: reprList, reprNum: reprNum, pyFloat: pyFloat, zerlegeSchritte: zerlegeSchritte, trySteps: trySteps, tryCode: tryCode, dateiSteps: dateiSteps, DATEI_ZEILEN: DATEI_ZEILEN, kodierung: kodierung, utf8Bytes: utf8Bytes, utf8Lesen: utf8Lesen };
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
  function field(label, input) { var id = 'v09f' + (++uid); input.id = id; return el('div', { class: 'k-field' }, [el('label', { 'for': id, text: label }), input]); }
  function select(opts, val) {
    var s = el('select', {});
    opts.forEach(function (o) { var op = el('option', { value: o[0], text: o[1] }); if (o[0] === val) op.selected = true; s.appendChild(op); });
    return s;
  }
  function player(host, o) {
    var bBack = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Zurück' });
    var bNext = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Nächster Schritt' });
    var bPlay = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Abspielen', 'aria-pressed': 'false' });
    var bReset = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Neu starten' });
    var count = el('span', { class: 'v09-count k-small k-muted', 'aria-hidden': 'true' });
    host.appendChild(el('div', { class: 'k-presets v09-bar', role: 'group', 'aria-label': 'Ablauf steuern' }, [bNext, bBack, bPlay, bReset, count]));
    var timer = null;
    function stop() { if (timer) { clearInterval(timer); timer = null; } bPlay.textContent = 'Abspielen'; bPlay.setAttribute('aria-pressed', 'false'); }
    bNext.addEventListener('click', function () { stop(); o.next(); });
    bBack.addEventListener('click', function () { stop(); o.back(); });
    bReset.addEventListener('click', function () { stop(); o.reset(); });
    bPlay.addEventListener('click', function () {
      if (timer) { stop(); return; }
      if (o.done()) o.reset();
      bPlay.textContent = 'Pause'; bPlay.setAttribute('aria-pressed', 'true');
      timer = setInterval(function () { o.next(); if (o.done()) stop(); }, o.interval || 1300);
    });
    return { stop: stop, count: count, bBack: bBack, bNext: bNext };
  }
  function setMsg(p, text, cls) { p.className = 'v09-msg is-on' + (cls ? ' ' + cls : ''); p.textContent = text; }

  /* ══════════════════════════════════════════════════════════
     (A) Textkodierung
     ══════════════════════════════════════════════════════════ */
  function initKodierung(host) {
    var tIn = el('input', { type: 'text', value: 'Größe 3 m/s²', size: '22', autocomplete: 'off', spellcheck: 'false' });
    var sSel = select([['utf8', 'UTF-8'], ['cp1252', 'Windows-1252 (alt, Latin-1-Verwandter)']], 'utf8');
    var lSel = select([['utf8', 'UTF-8'], ['cp1252', 'Windows-1252 (alt, Latin-1-Verwandter)']], 'cp1252');
    var bytesBox = el('p', { class: 'v09-bytes', 'aria-label': 'Die Bytes der Datei' });
    var res = el('p', { class: 'v09-res', role: 'status', 'aria-live': 'polite' });
    var note = el('p', { class: 'v09-msg', role: 'status', 'aria-live': 'polite' });
    host.appendChild(el('div', { class: 'k-controls' }, [field('Text in der Datei', tIn), field('Gespeichert als', sSel), field('Gelesen als', lSel)]));
    host.appendChild(el('p', { class: 'v09-lbl' }, ['Bytes in der Datei (Hexadezimal, V02):']));
    host.appendChild(bytesBox);
    host.appendChild(el('p', { class: 'v09-lbl' }, ['Was das Programm beim Lesen daraus macht:']));
    host.appendChild(res);
    host.appendChild(note);
    function upd() {
      var k = kodierung(tIn.value, sSel.value, lSel.value);
      bytesBox.textContent = '';
      k.bytes.forEach(function (b) { bytesBox.appendChild(el('span', { class: 'v09-byte' + (b >= 128 ? ' is-hi' : ''), text: hex2(b) })); });
      if (k.ergebnis.fehler) { res.className = 'v09-res is-bad'; res.textContent = k.ergebnis.fehler; }
      else {
        var gleich = k.ergebnis.text === tIn.value;
        res.className = 'v09-res ' + (gleich ? 'is-ok' : 'is-bad');
        res.textContent = k.ergebnis.text;
      }
      var m;
      if (sSel.value === lSel.value) m = 'Gleiche Kodierung beim Speichern und Lesen: Der Text kommt unverändert zurück. So soll es sein. Deshalb schreiben und lesen wir in diesem Kurs immer mit encoding="utf-8".';
      else if (sSel.value === 'utf8') m = 'In UTF-8 brauchen Umlaute zwei Bytes (zum Beispiel C3 B6 für ö). Windows-1252 liest jedes Byte einzeln als ein Zeichen: C3 wird „Ã“, B6 wird „¶“. Das ist der klassische „Ã¶“-Salat.';
      else m = 'In Windows-1252 (und Latin-1) ist ö ein einzelnes Byte (F6). UTF-8 erwartet dort aber den Anfang einer Mehrbyte-Folge, findet sie nicht und meldet einen UnicodeDecodeError. Das passiert bei alten Dateien oder Exporten, die du aus Excel mit „CSV (Trennzeichen-getrennt)“ speicherst.';
      if (k.hinweis) m += ' ' + k.hinweis;
      setMsg(note, m, '');
    }
    [tIn, sSel, lSel].forEach(function (c) { c.addEventListener('input', upd); c.addEventListener('change', upd); });
    upd();
  }

  /* ══════════════════════════════════════════════════════════
     (B) CSV-Zeile zerlegen
     ══════════════════════════════════════════════════════════ */
  var ZEILEN = [
    ['bremsen', 'Bremsen: Semikolon, Dezimalkomma', '4,940000E+00;-1,260731E-01;-3,777725E+00;3,835629E-01;3,799239E+00\n', ';'],
    ['wasch', 'Waschmaschine: Komma, Dezimalpunkt', '1.000000E-02,2.586069E-01,2.916015E-02,-6.552941E-03,2.603282E-01\n', ','],
    ['fehler', 'kaputte Zeile (Text statt Zahl)', '2,400000E+00;1,045510E-01;Fehler;-4,365308E-01;4,491179E-01\n', ';'],
    ['kurz', 'kaputte Zeile (nur zwei Spalten)', '5,020000E+00;9,305883E-02\n', ';']
  ];
  function initZerlegen(host) {
    var zSel = select(ZEILEN.map(function (z) { return [z[0], z[1]]; }), 'bremsen');
    var tSel = select([[';', 'Semikolon ;'], [',', 'Komma ,']], ';');
    var cb = el('input', { type: 'checkbox', checked: 'checked' });
    var cbLab = el('label', { class: 'v09-cb' }, [cb, ' replace(",", ".") verwenden']);
    var msg = el('p', { class: 'v09-msg', role: 'status', 'aria-live': 'polite' });
    var stage = el('ol', { class: 'v09-stage', 'aria-label': 'Die Zwischenergebnisse' });
    var steps = [], s = 0;
    host.appendChild(el('div', { class: 'k-controls' }, [field('Zeile aus der Datei', zSel), field('Trennzeichen im split', tSel), el('div', { class: 'k-field' }, [cbLab])]));
    var pl = player(host, { next: next, back: back, reset: reset, done: function () { return s >= steps.length - 1; } });
    host.appendChild(msg);
    host.appendChild(stage);
    function build(resetPos) {
      var z = ZEILEN.filter(function (x) { return x[0] === zSel.value; })[0];
      steps = zerlegeSchritte(z[2], { trenn: tSel.value, spalte: 2, replace: cb.checked });
      if (resetPos) s = 0;
      if (s > steps.length - 1) s = steps.length - 1;
      paint();
    }
    function paint() {
      stage.textContent = '';
      var k, st, li, res;
      for (k = 0; k <= s; k++) {
        st = steps[k];
        li = el('li', { class: 'v09-stg' + (k === s ? ' is-active' : ' is-past') + (st.fehler ? ' is-bad' : '') });
        li.appendChild(el('code', { class: 'v09-stg__code', text: st.ausdruck }));
        res = el('div', { class: 'v09-stg__val' });
        if (st.felder) {
          st.felder.forEach(function (f, i) {
            res.appendChild(el('span', { class: 'v09-chip' + (st.sel === i && k === s ? ' is-sel' : '') }, [el('span', { class: 'v09-chip__i', text: String(i) }), el('span', { class: 'v09-chip__t', text: f })]));
          });
        } else if (st.fehler) res.appendChild(el('code', { class: 'v09-err', text: st.fehler }));
        else res.appendChild(el('code', { text: st.wert }));
        li.appendChild(res);
        stage.appendChild(li);
      }
      var st2 = steps[s];
      setMsg(msg, 'Schritt ' + (s + 1) + ' von ' + steps.length + ': ' + st2.msg, st2.fehler ? 'is-bad' : (st2.art === 'zahl' ? 'is-ok' : ''));
      pl.count.textContent = (s + 1) + ' / ' + steps.length;
      pl.bBack.disabled = s === 0; pl.bNext.disabled = s >= steps.length - 1;
    }
    function next() { if (s < steps.length - 1) { s++; paint(); } }
    function back() { if (s > 0) { s--; paint(); } }
    function reset() { s = 0; paint(); }
    zSel.addEventListener('change', function () {
      var z = ZEILEN.filter(function (x) { return x[0] === zSel.value; })[0];
      tSel.value = z[3]; pl.stop(); build(true);
    });
    tSel.addEventListener('change', function () { pl.stop(); build(true); });
    cb.addEventListener('change', function () { pl.stop(); build(true); });
    build(true);
  }

  /* ══════════════════════════════════════════════════════════
     (C) try/except
     ══════════════════════════════════════════════════════════ */
  function initTry(host) {
    var zSel = select([['ok', 'Zeile ist in Ordnung: 4,94 ; 0,10 ; -3,78'], ['wert', 'Text statt Zahl: 5,04 ; 0,07 ; Fehler'], ['kurz', 'Zeile zu kurz: 5,02 ; 0,09']], 'ok');
    var cb = el('input', { type: 'checkbox' });
    var cbLab = el('label', { class: 'v09-cb' }, [cb, ' except fängt auch IndexError']);
    var msg = el('p', { class: 'v09-msg', role: 'status', 'aria-live': 'polite' });
    var codeBox = el('ol', { class: 'v09-code', 'aria-label': 'Python-Code mit try und except' });
    var vars = el('dl', { class: 'v09-vars' });
    var outBox = el('pre', { class: 'v09-out', 'aria-label': 'Ausgabe des Programms', 'data-run': 'no' });
    var steps = [], s = 0, code = [];
    host.appendChild(el('div', { class: 'k-controls' }, [field('Die Zeile aus der Datei (Liste zeile)', zSel), el('div', { class: 'k-field' }, [cbLab])]));
    var pl = player(host, { next: next, back: back, reset: reset, done: function () { return s >= steps.length - 1; } });
    host.appendChild(msg);
    host.appendChild(el('div', { class: 'v09-grid' }, [codeBox, el('div', { class: 'v09-right' }, [vars, outBox])]));
    function build() { code = tryCode(cb.checked); steps = trySteps(zSel.value, cb.checked); s = 0; renderCode(); paint(); }
    function renderCode() {
      codeBox.textContent = '';
      code.forEach(function (l, i) { codeBox.appendChild(el('li', { 'data-ln': String(i + 1) }, [el('code', { text: l })])); });
    }
    function paint() {
      var st = steps[s];
      Array.prototype.forEach.call(codeBox.children, function (li) {
        var n = Number(li.getAttribute('data-ln'));
        li.className = (n === st.line ? 'is-active ' : '') + (st.skipped.indexOf(n) >= 0 ? 'is-skipped ' : '') + (st.mode === 'fehler' && n === st.line ? 'is-err' : '');
      });
      vars.textContent = '';
      [['kaputt', st.vars.kaputt === null ? '–' : String(st.vars.kaputt)], ['t', st.vars.t === null ? '–' : reprNum(st.vars.t)], ['a', st.vars.a === null ? '–' : reprNum(st.vars.a)]].forEach(function (p) {
        vars.appendChild(el('dt', { text: p[0] })); vars.appendChild(el('dd', { text: p[1] }));
      });
      var o = st.out.join('\n');
      if (st.ende) o += (o ? '\n' : '') + 'Traceback (most recent call last):\n  ...\n' + st.fehler;
      outBox.textContent = o || '(noch nichts ausgegeben)';
      outBox.className = 'v09-out' + (st.ende ? ' is-bad' : '');
      setMsg(msg, 'Schritt ' + (s + 1) + ' von ' + steps.length + ': ' + st.msg, st.ende || st.mode === 'fehler' ? 'is-bad' : (st.mode === 'except' ? '' : ''));
      pl.count.textContent = (s + 1) + ' / ' + steps.length;
      pl.bBack.disabled = s === 0; pl.bNext.disabled = s >= steps.length - 1;
    }
    function next() { if (s < steps.length - 1) { s++; paint(); } }
    function back() { if (s > 0) { s--; paint(); } }
    function reset() { s = 0; paint(); }
    zSel.addEventListener('change', function () { pl.stop(); build(); });
    cb.addEventListener('change', function () { pl.stop(); build(); });
    build();
  }

  /* ══════════════════════════════════════════════════════════
     (D) Datei lesen, Programmablaufplan live
     ══════════════════════════════════════════════════════════ */
  var DATEI_CODE = ['kaputt = 0', 'werte = []', 'for zeile in leser:', '    try:', '        a = zahl(zeile[1])', '        werte.append(a)', '    except ValueError:', '        kaputt = kaputt + 1', 'print(len(werte), kaputt)'];
  function dateiSpec() {
    var P = root.KursPAP && root.KursPAP.P;
    return [P.start('start'), P.op('kaputt = 0\nwerte = [ ]', 'init'),
      P.whil('noch eine Zeile\nin der Datei übrig?', [
        P.op('zeile = nächste\nZeile lesen', 'nxt'),
        P.iff('Umwandlung\ngelingt?', [P.op('Wert an werte\nanhängen', 'ok')], [P.op('kaputt =\nkaputt + 1', 'bad')], 'chk')], 'loop'),
      P.io('Ausgabe: Anzahl\ngültig und kaputt', 'out'), P.end('end', 'Ende')];
  }
  function initDatei(host) {
    if (!root.KursPAP || !root.KursPAP.P) { host.appendChild(el('p', { class: 'k-small k-muted', text: 'Der Programmablaufplan braucht pap-engine.js.' })); return; }
    var steps = dateiSteps(DATEI_ZEILEN), s = 0;
    var msg = el('p', { class: 'v09-msg', role: 'status', 'aria-live': 'polite' });
    var papHost = el('div', { class: 'pap-wrap v09-pap' });
    var cells = el('ol', { class: 'v09-rows', 'aria-label': 'Die Zeilen der Datei' });
    var codeBox = el('ol', { class: 'v09-code', 'aria-label': 'Python-Code der Schleife' });
    DATEI_CODE.forEach(function (l, i) { codeBox.appendChild(el('li', { 'data-ln': String(i + 1) }, [el('code', { text: l })])); });
    var vars = el('dl', { class: 'v09-vars' });
    var right = el('div', { class: 'v09-right' }, [cells, codeBox, vars]);
    var pl = player(host, { next: next, back: back, reset: reset, done: function () { return s >= steps.length - 1; }, interval: 1200 });
    host.appendChild(msg);
    host.appendChild(el('div', { class: 'v09-grid v09-grid--pap' }, [papHost, right]));
    papHost.innerHTML = root.KursPAP.svg(dateiSpec(), { cls: 'pap--run', label: 'Programmablaufplan zum Einlesen einer Datei: Zähler und Liste anlegen, solange eine Zeile übrig ist die Zeile lesen, prüfen ob die Umwandlung gelingt, bei ja den Wert merken, bei nein den Zähler kaputt erhöhen, am Ende ausgeben.' });
    function edgeEl(f, t, l) { return papHost.querySelector('.pap-e[data-from="' + f + '"][data-to="' + t + '"][data-lab="' + l + '"]'); }
    function nodeEl(id) { return papHost.querySelector('.pap-n[data-id="' + id + '"]'); }
    function paint() {
      var st = steps[s], k;
      Array.prototype.forEach.call(papHost.querySelectorAll('.is-active, .is-on, .is-done, .is-past'), function (n) { n.classList.remove('is-active', 'is-on', 'is-done', 'is-past'); });
      for (k = 0; k < s; k++) {
        steps[k].nodes.forEach(function (id) { var n = nodeEl(id); if (n) n.classList.add('is-done'); });
        steps[k].edges.forEach(function (e) { var x = edgeEl(e[0], e[1], e[2]); if (x) x.classList.add('is-past'); });
      }
      st.nodes.forEach(function (id) { var n = nodeEl(id); if (n) { n.classList.remove('is-done'); n.classList.add('is-active'); } });
      st.edges.forEach(function (e) { var x = edgeEl(e[0], e[1], e[2]); if (x) { x.classList.remove('is-past'); x.classList.add('is-on'); } });
      cells.textContent = '';
      DATEI_ZEILEN.forEach(function (z, i) {
        var li = el('li', { class: 'v09-row' }, [el('code', { text: z })]);
        if (i === st.i) li.classList.add('is-sel');
        else if (i < st.i) {
          var f = zahlTxt((z.split(';')[1]) || '');
          li.classList.add(f ? 'is-ok' : 'is-bad');
        }
        cells.appendChild(li);
      });
      Array.prototype.forEach.call(codeBox.children, function (li) { li.classList.toggle('is-active', li.getAttribute('data-ln') === String(st.line)); });
      vars.textContent = '';
      [['werte', '[' + st.werte.map(reprNum).join(', ') + ']'], ['kaputt', String(st.kaputt)]].forEach(function (p) { vars.appendChild(el('dt', { text: p[0] })); vars.appendChild(el('dd', { text: p[1] })); });
      setMsg(msg, 'Schritt ' + (s + 1) + ' von ' + steps.length + ': ' + st.msg, st.done ? 'is-ok' : (st.ok === false ? 'is-bad' : ''));
      pl.count.textContent = (s + 1) + ' / ' + steps.length;
      pl.bBack.disabled = s === 0; pl.bNext.disabled = s >= steps.length - 1;
    }
    function next() { if (s < steps.length - 1) { s++; paint(); } }
    function back() { if (s > 0) { s--; paint(); } }
    function reset() { s = 0; paint(); }
    paint();
  }

  /* ── Selbstcheck-Haken für Papieraufgaben ─────────────────── */
  function initCheck(host) {
    var cb = host.querySelector('input[type="checkbox"]'), task = host.closest('[data-a]');
    var A = root.KursAufgaben, lesson = document.body.getAttribute('data-lesson') || 'V09';
    if (!cb || !task) return;
    var sv = A ? A.store.solved(lesson) : {};
    if (sv[task.getAttribute('data-id')]) cb.checked = true;
    cb.addEventListener('change', function () {
      if (!cb.checked || !A) return;
      A.store.setSolved(lesson, task.getAttribute('data-id'));
      task.classList.add('is-solved');
      A.update();
    });
  }

  function init() {
    var map = { kodierung: initKodierung, zerlegen: initZerlegen, 'try': initTry, datei: initDatei, check: initCheck };
    Object.keys(map).forEach(function (k) { Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="' + k + '"]'), map[k]); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : globalThis);
