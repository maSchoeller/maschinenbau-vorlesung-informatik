/* =============================================================
   explorables-v11.js – interaktive Bausteine für V11 „Programmieren mit Copilot“ (reines JS, kein Framework)
   (A) import-Schreibweisen: Welche Namen gibt es nach welchem import? (NameError / AttributeError live)
   (B) Was macht pip? Schrittweise: import schlägt fehl, pip holt das Paket aus dem Paketindex.
   (C) Prompt-Bewerter: Kriterien-Checkliste (Eingaben, Ausgaben, Einheiten, Grenzfälle, Beispiele) als Stichwort-Heuristik.
   (D) Passungs-PAP als Prompt: Programmablaufplan (KursPAP) mit vier Testfällen, Pfad leuchtet auf.
   Der Rechenkern ist ohne DOM per node testbar (module.exports).
   ============================================================= */
(function (root) {
  'use strict';

  /* ── Kern (ohne DOM) ─────────────────────────────────────── */
  /* (A) Welche Namen stehen nach einer import-Zeile zur Verfügung? */
  var MATH = { sqrt: '4.0', pi: '3.141592653589793', isclose: '<function isclose>', sin: '<function sin>' };
  var VARIANTEN = [
    { id: 'plain', zeile: 'import math', namen: { math: 'modul' } },
    { id: 'from', zeile: 'from math import sqrt', namen: { sqrt: 'sqrt' } },
    { id: 'als', zeile: 'import math as m', namen: { m: 'modul' } },
    { id: 'fromals', zeile: 'from math import sqrt as wurzel', namen: { wurzel: 'sqrt' } }
  ];
  /* Wertet einen Ausdruck der Form name, name.attr, name(arg) oder name.attr(arg) für eine Variante aus. */
  function evalImport(variante, ausdruck) {
    var v = typeof variante === 'string' ? VARIANTEN.filter(function (x) { return x.id === variante; })[0] : variante;
    var m = /^\s*([A-Za-z_]\w*)(?:\.([A-Za-z_]\w*))?\s*(\(\s*([^)]*?)\s*\))?\s*$/.exec(ausdruck);
    if (!m) return { ok: false, text: 'SyntaxError: Diese Demo versteht nur Ausdrücke wie math.sqrt(16), sqrt(16) oder math.pi.' };
    var name = m[1], attr = m[2], ruf = m[3] !== undefined, arg = m[4];
    if (!Object.prototype.hasOwnProperty.call(v.namen, name)) return { ok: false, text: "NameError: name '" + name + "' is not defined" };
    var art = v.namen[name];
    if (art === 'modul') {
      if (!attr) return { ok: true, text: "<module 'math' (built-in)>" };
      if (!Object.prototype.hasOwnProperty.call(MATH, attr)) return { ok: false, text: "AttributeError: module 'math' has no attribute '" + attr + "'" };
      if (attr === 'pi') return ruf ? { ok: false, text: "TypeError: 'float' object is not callable" } : { ok: true, text: MATH.pi };
      if (attr === 'sqrt') return ruf ? sqrtVon(arg) : { ok: true, text: '<built-in function sqrt>' };
      return { ok: true, text: ruf ? 'TypeError: Diese Demo ruft nur sqrt auf.' : MATH[attr] };
    }
    if (attr) return { ok: false, text: "AttributeError: 'function' object has no attribute '" + attr + "'" };
    return ruf ? sqrtVon(arg) : { ok: true, text: '<built-in function sqrt>' };
  }
  function sqrtVon(arg) {
    var x = parseFloat(String(arg).replace(',', '.'));
    if (arg === '' || isNaN(x)) return { ok: false, text: 'TypeError: sqrt() braucht genau eine Zahl, zum Beispiel sqrt(16).' };
    if (x < 0) return { ok: false, text: 'ValueError: math domain error' };
    var r = Math.sqrt(x);
    return { ok: true, text: /\./.test(String(r)) ? String(r) : r + '.0' };
  }

  /* (C) Prompt-Kriterien (Stichwort-Heuristik; dieselben Muster prüft die Labor-Aufgabe in Python) */
  var KRITERIEN = [
    { id: 'eingaben', name: 'Eingaben', frage: 'Welche Werte bekommt der Code, mit welchen Namen und Datentypen?', re: /\w+\(\s*\w+(?:\s*,\s*\w+)+\s*\)|parameter|eingabe|nimmt|erhält|bekommt|übergeben/i },
    { id: 'ausgaben', name: 'Ausgaben', frage: 'Was kommt heraus: Rückgabewert oder Ausgabe, welcher Typ, welches Format?', re: /rückgabe|zurück|liefert|gibt|ausgabe|return|druckt/i },
    { id: 'einheiten', name: 'Einheiten', frage: 'In welcher Einheit sind Ein- und Ausgaben (mm, m, N, MPa, °C ...)?', re: /\bmm\b|µm|\bcm\b|\bm\b|\bN\b|\bkN\b|\bMPa\b|°C|\bgrad\b|1\/min|\bkg\b|\bs\b|\bmin\b|prozent|%/i },
    { id: 'grenzen', name: 'Grenzfälle', frage: 'Was gilt genau an der Grenze, bei 0, bei leerer Eingabe, bei ungültigen Werten?', re: /grenzfall|genau|gleich|grenz|>=|<=|≥|≤|==|\bnull\b|leer|negativ|ungültig|fehler/i },
    { id: 'beispiele', name: 'Beispiele / Testfälle', frage: 'Welche Eingabe soll welches Ergebnis liefern? Mindestens ein Beispiel vorgeben.', re: /beispiel|testfall|z\.\s?b\.|->|→|erwartet/i }
  ];
  function bewertePrompt(text) {
    var t = String(text || '');
    return KRITERIEN.map(function (k) { return { id: k.id, name: k.name, frage: k.frage, ok: k.re.test(t) }; });
  }

  /* (D) Passung: Pfad durch den PAP je Testfall */
  var FAELLE = [
    { name: 'H7/g6', b: [25.000, 25.021], w: [24.980, 24.993], soll: 'Spielpassung' },
    { name: 'H7/r6', b: [25.000, 25.021], w: [25.028, 25.041], soll: 'Übermaßpassung' },
    { name: 'H7/k6', b: [25.000, 25.021], w: [25.002, 25.015], soll: 'Übergangspassung' },
    { name: 'H7/h6 (Spiel genau 0)', b: [25.000, 25.021], w: [24.987, 25.000], soll: 'Spielpassung' }
  ];
  function passungPfad(f) {
    var d1 = f.b[0] >= f.w[1], d2 = f.b[1] <= f.w[0], pfad = ['start', 'in', 'd1'];
    if (d1) { pfad.push('spiel'); return { art: 'Spielpassung', pfad: pfad, d1: d1, d2: null }; }
    pfad.push('d2');
    if (d2) { pfad.push('ue'); return { art: 'Übermaßpassung', pfad: pfad, d1: d1, d2: d2 }; }
    pfad.push('ug');
    return { art: 'Übergangspassung', pfad: pfad, d1: d1, d2: d2 };
  }
  function passungKanten(pfad, art) {
    var k = [], i;
    for (i = 0; i < pfad.length - 1; i++) {
      var lab = '';
      if (pfad[i] === 'd1') lab = pfad[i + 1] === 'spiel' ? 'ja' : 'nein';
      if (pfad[i] === 'd2') lab = pfad[i + 1] === 'ue' ? 'ja' : 'nein';
      k.push([pfad[i], pfad[i + 1], lab]);
    }
    k.push([pfad[pfad.length - 1], 'end', '']);
    return k;
  }
  var core = { evalImport: evalImport, VARIANTEN: VARIANTEN, KRITERIEN: KRITERIEN, bewertePrompt: bewertePrompt, FAELLE: FAELLE, passungPfad: passungPfad, passungKanten: passungKanten };
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
  function code(t) { return el('code', { class: 'k-i', text: t }); }
  function field(label, input) { var id = 'v11f' + (++uid); input.id = id; return el('div', { class: 'k-field' }, [el('label', { 'for': id, text: label }), input]); }
  function icon(name) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('class', 'k-ic'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false');
    var u = document.createElementNS('http://www.w3.org/2000/svg', 'use'); u.setAttribute('href', '../assets/img/icons.svg#i-' + name);
    s.appendChild(u); return s;
  }
  function player(host, o) {
    var bBack = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Zurück' });
    var bNext = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Nächster Schritt' });
    var bPlay = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Abspielen', 'aria-pressed': 'false' });
    var bReset = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Neu starten' });
    var count = el('span', { class: 'v11-count k-small k-muted', 'aria-hidden': 'true' });
    host.appendChild(el('div', { class: 'k-presets v11-bar', role: 'group', 'aria-label': 'Ablauf steuern' }, [bNext, bBack, bPlay, bReset, count]));
    var timer = null;
    function stop() { if (timer) { clearInterval(timer); timer = null; } bPlay.textContent = 'Abspielen'; bPlay.setAttribute('aria-pressed', 'false'); }
    bNext.addEventListener('click', function () { stop(); o.next(); });
    bBack.addEventListener('click', function () { stop(); o.back(); });
    bReset.addEventListener('click', function () { stop(); o.reset(); });
    bPlay.addEventListener('click', function () {
      if (timer) { stop(); return; }
      if (o.done()) o.reset();
      bPlay.textContent = 'Pause'; bPlay.setAttribute('aria-pressed', 'true');
      timer = setInterval(function () { o.next(); if (o.done()) stop(); }, o.interval || 1500);
    });
    return { stop: stop, count: count, bBack: bBack, bNext: bNext, bPlay: bPlay };
  }

  /* ══════════════════════════════════════════════════════════
     (A) import-Schreibweisen
     ══════════════════════════════════════════════════════════ */
  function initImport(host) {
    var cur = VARIANTEN[0];
    var seg = el('div', { class: 'k-seg v11-seg', role: 'group', 'aria-label': 'import-Zeile wählen' });
    var segBtns = VARIANTEN.map(function (v) {
      var b = el('button', { type: 'button', 'aria-pressed': 'false', text: v.zeile });
      b.addEventListener('click', function () { cur = v; paint(); run(null); });
      seg.appendChild(b); return b;
    });
    var names = el('div', { class: 'v11-names', 'aria-live': 'polite' });
    var modbox = el('div', { class: 'v11-mod' }, [el('p', { class: 'v11-box__t', text: 'Modul math (Werkzeugkiste der Standardbibliothek)' }),
      el('ul', { class: 'v11-chips' }, ['sqrt', 'pi', 'isclose', 'sin'].map(function (n) { return el('li', { text: n }); })),
      el('p', { class: 'k-small k-muted', text: 'Nichts weiter: kein tolerance, kein passung.' })]);
    var mine = el('div', { class: 'v11-mine' }, [el('p', { class: 'v11-box__t', text: 'Dein Programm kennt jetzt diese Namen' }), names]);
    var inp = el('input', { type: 'text', value: 'math.sqrt(16)', autocomplete: 'off', spellcheck: 'false', size: '22' });
    var out = el('p', { class: 'v11-out', role: 'status', 'aria-live': 'polite' });
    var presets = el('div', { class: 'k-presets', role: 'group', 'aria-label': 'Beispiele' });
    ['math.sqrt(16)', 'sqrt(16)', 'm.sqrt(16)', 'wurzel(16)', 'math.pi', 'math.tolerance(16)'].forEach(function (e) {
      var b = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: e });
      b.addEventListener('click', function () { inp.value = e; run(); });
      presets.appendChild(b);
    });
    var go = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Auswerten' });
    go.addEventListener('click', function () { run(); });
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); });
    host.appendChild(el('div', { class: 'k-controls' }, [el('div', { class: 'k-field' }, [el('span', { class: 'v11-lbl', text: 'Oben in deinem Programm steht:' }), seg])]));
    host.appendChild(el('div', { class: 'v11-two' }, [mine, modbox]));
    host.appendChild(el('div', { class: 'k-controls' }, [field('Ausdruck, den du danach schreibst', inp), go]));
    host.appendChild(presets);
    host.appendChild(out);
    function paint() {
      segBtns.forEach(function (b, i) { b.setAttribute('aria-pressed', VARIANTEN[i] === cur ? 'true' : 'false'); });
      names.textContent = '';
      Object.keys(cur.namen).forEach(function (n) {
        var art = cur.namen[n];
        names.appendChild(el('p', { class: 'v11-name' }, [code(n), art === 'modul' ? ' (ganzes Modul: darauf folgt ein Punkt, dann der Name aus dem Modul)' : ' (die eine Funktion sqrt aus math, ohne Punkt)']));
      });
      names.appendChild(el('p', { class: 'k-small k-muted', text: cur.id === 'als' ? 'Der Name math existiert hier nicht: Nur der Zweitname m ist angelegt.' : cur.id === 'fromals' ? 'Der Name sqrt existiert hier nicht: Nur der Zweitname wurzel ist angelegt.' : cur.id === 'from' ? 'Der Name math existiert hier nicht: Nur sqrt wurde geholt.' : 'Der Name sqrt allein existiert hier nicht: Du schreibst math.sqrt.' }));
    }
    function run(first) {
      if (first === null) { out.className = 'v11-out'; out.textContent = 'Wähle einen Ausdruck oder tippe einen eigenen, dann „Auswerten“.'; return; }
      var r = evalImport(cur, inp.value);
      out.className = 'v11-out ' + (r.ok ? 'is-ok' : 'is-bad');
      out.textContent = '>>> ' + inp.value.trim() + '\n' + r.text;
    }
    paint(); run(null);
  }

  /* ══════════════════════════════════════════════════════════
     (B) pip: von der Fehlermeldung zum installierten Paket
     ══════════════════════════════════════════════════════════ */
  var PIP = [
    { ort: 'prog', cmd: 'import requests', msg: 'Dein Programm beginnt mit import requests. Python muss jetzt irgendwo ein Modul mit diesem Namen finden.' },
    { ort: 'std', cmd: 'import requests', msg: 'Suchort 1: die Standardbibliothek, mit der jede Python-Installation kommt (math, statistics, random, csv ...). requests ist nicht dabei.' },
    { ort: 'site', cmd: 'import requests', msg: 'Suchort 2: der Ordner der installierten Zusatzpakete (site-packages). Auf diesem Rechner ist dort noch nichts von requests.' },
    { ort: 'fehler', cmd: 'ModuleNotFoundError: No module named \'requests\'', msg: 'Nichts gefunden: Python bricht mit ModuleNotFoundError ab. Das heißt nicht „kaputt“, sondern „nicht installiert“ (oder der Name ist falsch geschrieben oder erfunden).' },
    { ort: 'term', cmd: '$ pip install requests', msg: 'Jetzt bist du dran, nicht Python: Im Terminal fragst du pip, das Installationsprogramm für Pakete. Beim Programmstart passiert das nie von selbst.' },
    { ort: 'index', cmd: '$ pip install requests', msg: 'pip fragt den Paketindex PyPI (Python Package Index) im Internet: Gibt es requests? Welche Version passt zu deinem Python? Welche anderen Pakete braucht es?' },
    { ort: 'site', cmd: 'Successfully installed requests-2.32.3 ...', msg: 'pip lädt die Dateien herunter und legt sie in site-packages ab, samt den Paketen, die requests selbst braucht. Die Versionsnummer hält fest, welche Fassung du jetzt hast.' },
    { ort: 'prog', cmd: 'import requests   # klappt', msg: 'Jetzt findet Python das Modul im zweiten Suchort. Dasselbe Programm läuft. Auf einem anderen Rechner musst du denselben Schritt noch einmal machen.' }
  ];
  function initPip(host) {
    var s = 0;
    var orte = [['prog', 'Dein Programm', 'import requests'], ['std', 'Standardbibliothek', 'math, statistics, random, csv ...'], ['site', 'Installierte Pakete', 'site-packages auf deinem Rechner'], ['index', 'Paketindex PyPI', 'im Internet, tausende Pakete in vielen Versionen'], ['term', 'Terminal', 'hier tippst du pip-Befehle']];
    var boxes = {};
    var grid = el('div', { class: 'v11-orte' });
    orte.forEach(function (o) {
      var b = el('div', { class: 'v11-ort', 'data-ort': o[0] }, [el('p', { class: 'v11-ort__t', text: o[1] }), el('p', { class: 'k-small k-muted', text: o[2] })]);
      boxes[o[0]] = b; grid.appendChild(b);
    });
    var cmd = el('pre', { class: 'v11-cmd', 'aria-label': 'Aktuelle Zeile' });
    var msg = el('p', { class: 'v11-msg', role: 'status', 'aria-live': 'polite' });
    var pl = player(host, { next: next, back: back, reset: reset, done: function () { return s >= PIP.length - 1; }, interval: 2200 });
    host.appendChild(msg); host.appendChild(cmd); host.appendChild(grid);
    function paint() {
      var st = PIP[s];
      Object.keys(boxes).forEach(function (k) { boxes[k].classList.toggle('is-active', k === st.ort); boxes[k].classList.toggle('is-bad', st.ort === 'fehler' && k === 'prog'); });
      cmd.textContent = st.cmd;
      cmd.className = 'v11-cmd' + (st.ort === 'fehler' ? ' is-bad' : '');
      msg.textContent = 'Schritt ' + (s + 1) + ' von ' + PIP.length + ': ' + st.msg;
      pl.count.textContent = (s + 1) + ' / ' + PIP.length;
      pl.bBack.disabled = s === 0; pl.bNext.disabled = s >= PIP.length - 1;
    }
    function next() { if (s < PIP.length - 1) { s++; paint(); } }
    function back() { if (s > 0) { s--; paint(); } }
    function reset() { s = 0; paint(); }
    paint();
  }

  /* ══════════════════════════════════════════════════════════
     (C) Prompt-Bewerter
     ══════════════════════════════════════════════════════════ */
  var P_VAGUE = 'Schreib mir was für Passungen';
  var P_PAP = 'Schreibe eine Python-Funktion passungsart(bohrung_min, bohrung_max, welle_min, welle_max). Alle Maße sind Kommazahlen in mm. Die Funktion gibt einen Text zurück und druckt nichts.\n\nAblauf:\n1. Wenn bohrung_min >= welle_max: "Spielpassung".\n2. Sonst, wenn bohrung_max <= welle_min: "Übermaßpassung".\n3. Sonst: "Übergangspassung".\n\nGrenzfall: Ist das Spiel genau 0 (bohrung_min gleich welle_max), ist es eine Spielpassung.\nBeispiel: passungsart(25.000, 25.021, 24.987, 25.000) -> "Spielpassung".\nKeine Toleranztabellen, keine Eingabe.';
  function initPrompt(host) {
    var ta = el('textarea', { rows: '9', class: 'v11-ta', 'aria-label': 'Dein Prompt', spellcheck: 'false' });
    ta.value = P_VAGUE;
    var b1 = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Vager Prompt' });
    var b2 = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'PAP als Prompt' });
    var b0 = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Leeren' });
    var list = el('ul', { class: 'v11-krit', 'aria-live': 'polite' });
    var sum = el('p', { class: 'v11-sum', role: 'status' });
    b1.addEventListener('click', function () { ta.value = P_VAGUE; paint(); });
    b2.addEventListener('click', function () { ta.value = P_PAP; paint(); });
    b0.addEventListener('click', function () { ta.value = ''; paint(); ta.focus(); });
    ta.addEventListener('input', paint);
    host.appendChild(el('div', { class: 'k-presets', role: 'group', 'aria-label': 'Beispiel-Prompts laden' }, [b1, b2, b0]));
    host.appendChild(field('Dein Prompt (ändere ihn und beobachte die Liste)', ta));
    host.appendChild(sum); host.appendChild(list);
    host.appendChild(el('p', { class: 'k-small k-muted', text: 'Hinweis: Das ist eine Stichwort-Suche. Sie erkennt, ob du an die fünf Dinge gedacht hast, aber nicht, ob deine Angaben stimmen. Ein „erfüllt“ ersetzt kein Nachdenken.' }));
    function paint() {
      var r = bewertePrompt(ta.value), n = 0;
      list.textContent = '';
      r.forEach(function (k) {
        if (k.ok) n++;
        list.appendChild(el('li', { class: k.ok ? 'is-ok' : 'is-bad' }, [icon(k.ok ? 'done' : 'circle'), el('span', {}, [el('strong', { text: k.name + (k.ok ? ': erwähnt' : ': fehlt') }), el('span', { class: 'k-small k-muted', text: ' ' + k.frage })])]));
      });
      sum.textContent = n + ' von 5 Kriterien erwähnt. ' + (n === 5 ? 'Die KI muss kaum noch raten.' : n >= 3 ? 'Die KI muss an einigen Stellen raten.' : 'Die KI muss fast alles raten: Sie füllt die Lücken mit dem, was am häufigsten vorkommt, nicht mit dem, was du brauchst.');
    }
    paint();
  }

  /* ══════════════════════════════════════════════════════════
     (D) Passungs-PAP mit Testfällen
     ══════════════════════════════════════════════════════════ */
  function passungSpec() {
    var P = root.KursPAP && root.KursPAP.P;
    return [P.start('start'),
      P.io('Eingabe: bohrung_min, bohrung_max,\nwelle_min, welle_max (alle in mm)', 'in'),
      P.iff('bohrung_min >= welle_max?', [P.io('Ausgabe: Spielpassung', 'spiel')], [
        P.iff('bohrung_max <= welle_min?', [P.io('Ausgabe: Übermaßpassung', 'ue')], [P.io('Ausgabe: Übergangspassung', 'ug')], 'd2')], 'd1'),
      P.end('end', 'Ende')];
  }
  function initPassung(host) {
    if (!root.KursPAP || !root.KursPAP.P) { host.appendChild(el('p', { class: 'k-small k-muted', text: 'Der Programmablaufplan braucht pap-engine.js.' })); return; }
    var sel = -1;
    var papHost = el('div', { class: 'pap-wrap v11-pap' });
    papHost.innerHTML = root.KursPAP.svg(passungSpec(), { cls: 'pap--run', label: 'Programmablaufplan Passungsart: vier Maße einlesen; wenn kleinste Bohrung größer oder gleich größte Welle, Spielpassung; sonst wenn größte Bohrung kleiner oder gleich kleinste Welle, Übermaßpassung; sonst Übergangspassung.' });
    var msg = el('p', { class: 'v11-msg', role: 'status', 'aria-live': 'polite' });
    var tab = el('table', { class: 'v11-tab' });
    var seg = el('div', { class: 'k-seg v11-seg', role: 'group', 'aria-label': 'Testfall wählen' });
    var btns = FAELLE.map(function (f, i) {
      var b = el('button', { type: 'button', 'aria-pressed': 'false', text: f.name });
      b.addEventListener('click', function () { sel = i; paint(); });
      seg.appendChild(b); return b;
    });
    host.appendChild(el('div', { class: 'k-controls' }, [el('div', { class: 'k-field' }, [el('span', { class: 'v11-lbl', text: 'Testfall (Bohrung H7 mit Welle …):' }), seg])]));
    host.appendChild(msg);
    host.appendChild(el('div', { class: 'v11-grid' }, [papHost, el('div', {}, [tab])]));
    function fmt(x) { return x.toFixed(3); }
    function edgeEl(f, t, l) { return papHost.querySelector('.pap-e[data-from="' + f + '"][data-to="' + t + '"][data-lab="' + l + '"]'); }
    function nodeEl(id) { return papHost.querySelector('.pap-n[data-id="' + id + '"]'); }
    function paint() {
      Array.prototype.forEach.call(papHost.querySelectorAll('.is-active, .is-on, .is-done, .is-past'), function (n) { n.classList.remove('is-active', 'is-on', 'is-done', 'is-past'); });
      btns.forEach(function (b, i) { b.setAttribute('aria-pressed', i === sel ? 'true' : 'false'); });
      tab.textContent = '';
      if (sel < 0) {
        msg.className = 'v11-msg'; msg.textContent = 'Wähle einen Testfall. Der Pfad durch den Plan leuchtet auf, und die Werte stehen rechts.';
        return;
      }
      var f = FAELLE[sel], r = passungPfad(f), ke = passungKanten(r.pfad, r.art);
      r.pfad.forEach(function (id, i) { var n = nodeEl(id); if (n) n.classList.add(i === r.pfad.length - 1 ? 'is-active' : 'is-done'); });
      ke.forEach(function (e) { var x = edgeEl(e[0], e[1], e[2]); if (x) x.classList.add('is-on'); });
      var rows = [['bohrung_min', fmt(f.b[0])], ['bohrung_max', fmt(f.b[1])], ['welle_min', fmt(f.w[0])], ['welle_max', fmt(f.w[1])],
        ['bohrung_min >= welle_max', fmt(f.b[0]) + ' >= ' + fmt(f.w[1]) + '  →  ' + (r.d1 ? 'ja' : 'nein')]];
      if (r.d2 !== null) rows.push(['bohrung_max <= welle_min', fmt(f.b[1]) + ' <= ' + fmt(f.w[0]) + '  →  ' + (r.d2 ? 'ja' : 'nein')]);
      rows.push(['Ergebnis', r.art]);
      rows.forEach(function (rw) { tab.appendChild(el('tr', {}, [el('th', { scope: 'row', text: rw[0] }), el('td', { text: rw[1] })])); });
      msg.className = 'v11-msg is-on is-ok';
      msg.textContent = f.name + ': ' + r.art + '.' + (sel === 3 ? ' Hier steht die Entscheidung genau auf der Kippe: bohrung_min und welle_max sind beide 25,000. Mit „>“ statt „>=“ in der ersten Raute käme „Übergangspassung“ heraus.' : '');
    }
    paint();
  }

  function init() {
    var map = { 'import-namen': initImport, 'pip-ablauf': initPip, 'prompt-bewerter': initPrompt, 'passung-pap': initPassung };
    Object.keys(map).forEach(function (k) { Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="' + k + '"]'), map[k]); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : globalThis);
