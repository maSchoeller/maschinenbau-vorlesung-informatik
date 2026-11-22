/* =============================================================
   explorables-v16.js – interaktive Bausteine für V16 „Rechner & Betriebssystem kompakt“ (reines JS, kein Framework)
   (A) Speicherhierarchie auf menschliches Maß: Zugriffszeiten, logarithmische Balken, „wenn 1 ns eine Sekunde wäre“.
   (B) Task-Manager-Simulator „Warum ruckelt mein CAD?“: vereinfachtes Modell mit Kernbalken, RAM, GPU, Datenträger, Netz, Diagnose.
   (C) Scheduler: Zeitscheiben von vier Prozessen auf einem oder zwei Kernen; ein Thread läuft nie auf zwei Kernen gleichzeitig.
   (D) Dateibaum der Fertigungszelle FZ-3: absolute und relative Pfade, pathlib-Teile.
   (E) PAP der Log-Suche (KursPAP.figure).
   Der Rechenkern ist ohne DOM per node testbar (module.exports).
   ============================================================= */
(function (root) {
  'use strict';

  /* ── Kern (ohne DOM) ─────────────────────────────────────── */
  function fmt(x, st) {
    try { return Number(x).toLocaleString('de-DE', { minimumFractionDigits: st, maximumFractionDigits: st }); }
    catch (e) { return String(x); }
  }

  /* (A) Speicherhierarchie: Größenordnungen, alle Werte „ca.“ */
  var STUFEN = [
    { id: 'l1', name: 'Register und L1-Cache', ns: 1, real: 'ca. 1 ns', mensch: 'ca. 1 Sekunde', groesse: 'einige KB bis MB', preis: 'sehr teuer je Byte', bleibt: 'flüchtig',
      text: 'Direkt im Prozessor. Hier rechnet die CPU. Winzig klein, dafür fast ohne Wartezeit.' },
    { id: 'ram', name: 'Arbeitsspeicher (RAM)', ns: 100, real: 'ca. 100 ns', mensch: 'knapp 2 Minuten', groesse: 'einige GB (8 bis 64)', preis: 'teuer je Byte', bleibt: 'flüchtig',
      text: 'Hier liegen die laufenden Programme und ihre Daten. Strom aus heißt: alles weg.' },
    { id: 'ssd', name: 'SSD (NVMe)', ns: 100000, real: 'ca. 100 µs', mensch: 'gut 1 Tag', groesse: 'einige hundert GB bis TB', preis: 'mittel', bleibt: 'dauerhaft',
      text: 'Massenspeicher aus Flash-Chips ohne bewegte Teile. Dauerhaft, aber rund tausendmal langsamer als der RAM.' },
    { id: 'netz', name: 'Datei vom Netzlaufwerk', ns: 1000000, real: 'ca. 1 ms und mehr je Zugriff', mensch: 'knapp 2 Wochen und mehr', groesse: 'beliebig (Server)', preis: 'geteilt, günstig je Byte', bleibt: 'dauerhaft',
      text: 'Ein Ordner auf einem anderen Rechner. Jeder Zugriff geht durch das Netzwerk und braucht mindestens eine Antwortzeit.' },
    { id: 'hdd', name: 'Festplatte (HDD)', ns: 10000000, real: 'ca. 10 ms', mensch: 'ca. 4 Monate', groesse: 'einige TB', preis: 'günstig je Byte', bleibt: 'dauerhaft',
      text: 'Magnetscheiben mit Schreib-Lese-Kopf: Der Kopf muss mechanisch an die richtige Stelle. Billig und groß, aber langsam.' }
  ];
  /* Position (0..1) eines Balkens auf der logarithmischen Skala 1 ns bis 100 ms */
  function balkenAnteil(ns) { return Math.max(0.02, Math.log10(ns) / 8); }
  function faktor(ns, ref) { return ns / ref; }

  /* (B) Task-Manager-Modell (stark vereinfacht, Größenordnungen) */
  var OS_GB = 3.0, ANDERE_GB = 3.2, CAD_BASIS_GB = 2.0, CAD_JE_TEIL_GB = 0.0035;
  var S_JE_TEIL = 0.004;            // s Neuberechnung je Teil auf einem Kern
  var MB_JE_TEIL = 0.5;             // Dateigröße je Teil
  var GPU_LEIST = { onboard: 700, workstation: 20000 };   // Teile, die flüssig (60 Bilder/s) gezeichnet werden
  function simuliere(p) {
    var teile = p.teile, ram = p.ram, kerne = p.kerne;
    var bedarf = OS_GB + CAD_BASIS_GB + teile * CAD_JE_TEIL_GB + (p.andere ? ANDERE_GB : 0);
    var swap = Math.max(0, bedarf - ram);
    var benutzt = Math.min(bedarf, ram);
    var ramProz = benutzt / ram * 100;
    var kernLast = [], i;
    for (i = 0; i < kerne; i++) kernLast.push(0);
    kernLast[0] = swap > 0 ? 55 : 100;          // wartet der Kern auf die Auslagerung, ist er nicht voll ausgelastet
    if (p.andere && kerne > 1) { kernLast[1] = 3; if (kerne > 2) kernLast[2] = 1; }
    var summe = 0; kernLast.forEach(function (x) { summe += x; });
    var cpuGesamt = summe / kerne;
    var faktorSwap = 1 + Math.min(swap, 8) * 0.5;
    var neuberechnung = teile * S_JE_TEIL * faktorSwap;           // s
    var mb = teile * MB_JE_TEIL;
    var oeffnen = p.netz ? (mb / 100 + teile * 0.003) : (mb / 1500 + teile * 0.0001);   // s
    var leist = GPU_LEIST[p.gpu];
    var fps = Math.min(60, 60 * leist / teile);
    var gpuLast = Math.min(100, 100 * teile / leist);
    var traeger = swap > 0 ? 100 : (p.netz ? 2 : 4);
    var netzLast = p.netz ? 35 : 0;
    var befunde = [];
    function add(id, stufe, titel, text, massnahme) { befunde.push({ id: id, stufe: stufe, titel: titel, text: text, massnahme: massnahme }); }
    // Reihenfolge = Priorität bei gleicher Stufe
    if (swap > 0) add('ram', 2, 'Arbeitsspeicher voll: Auslagerung', 'Das Betriebssystem lagert ' + fmt(swap, 1) + ' GB auf den Datenträger aus. Der ist ca. 1000-mal langsamer als RAM, der Datenträger steht bei 100 %.', 'Andere Programme schließen, Teile unterdrücken, mehr RAM einbauen.');
    else if (ramProz >= 90) add('ram', 1, 'Arbeitsspeicher fast voll', 'Es sind ' + fmt(ramProz, 0) + ' % belegt. Noch keine Auslagerung, aber wenig Reserve.', 'Andere Programme schließen oder RAM erweitern, bevor die Baugruppe wächst.');
    if (fps < 25) add('gpu', 2, 'Grafikkarte überfordert', 'Nur ca. ' + fmt(fps, 0) + ' Bilder pro Sekunde beim Drehen, die GPU steht bei 100 %.', 'Workstation-Grafikkarte mit zertifiziertem Treiber oder vereinfachte Darstellung.');
    else if (fps < 50) add('gpu', 1, 'Grafik am Limit', 'Ca. ' + fmt(fps, 0) + ' Bilder pro Sekunde: spürbar, aber noch nutzbar.', 'Vereinfachte Darstellung oder stärkere Grafikkarte.');
    if (neuberechnung > 3) add('kern', 2, 'Ein Kern am Anschlag: Neuberechnung', 'Die Neuberechnung des Feature-Baums läuft größtenteils nacheinander und belegt genau einen Kern (ca. ' + fmt(neuberechnung, 1) + ' s). Weitere Kerne helfen nicht, die Gesamtanzeige bleibt bei ' + fmt(cpuGesamt, 0) + ' %.', 'Baugruppe vereinfachen (Teile unterdrücken, Unterbaugruppen), höherer Takt pro Kern statt mehr Kerne.');
    else if (neuberechnung > 1) add('kern', 1, 'Einzelkern spürbar', 'Neuberechnung ca. ' + fmt(neuberechnung, 1) + ' s auf einem Kern.', 'Bei größeren Baugruppen vereinfachen. Mehr Kerne bringen hier nichts.');
    if (oeffnen > 8) add('netz', 2, p.netz ? 'Netzlaufwerk bremst das Laden' : 'Laden dauert lange', 'Das Öffnen braucht ca. ' + fmt(oeffnen, 0) + ' s: ' + (p.netz ? 'rund ' + fmt(teile, 0) + ' Dateien, jede mit eigener Antwortzeit im Netz.' : 'sehr viele Daten.'), p.netz ? 'Lokal arbeiten: Kopie auf der SSD oder PDM-Cache nutzen.' : 'Baugruppe vereinfachen.');
    else if (oeffnen > 3) add('netz', 1, 'Laden dauert merklich', 'Das Öffnen braucht ca. ' + fmt(oeffnen, 1) + ' s.', p.netz ? 'Lokal arbeiten, falls möglich.' : 'Akzeptabel.');
    befunde.sort(function (a, b) { return b.stufe - a.stufe; });
    return { bedarf: bedarf, benutzt: benutzt, ramProz: ramProz, swap: swap, kernLast: kernLast, cpuGesamt: cpuGesamt,
      neuberechnung: neuberechnung, oeffnen: oeffnen, fps: fps, gpuLast: gpuLast, traeger: traeger, netzLast: netzLast, befunde: befunde };
  }

  /* (C) Scheduler (Round-Robin, Zeitscheiben) */
  var PROZESSE = [
    { id: 'C', name: 'CAD', bereit: function () { return true; } },
    { id: 'B', name: 'Browser', bereit: function (t) { return t % 3 !== 2; } },
    { id: 'V', name: 'Virenscanner', bereit: function () { return true; } },
    { id: 'T', name: 'Teams', bereit: function (t) { return t % 2 === 0; } }
  ];
  function threadsFuer(cadThreads) {
    var th = [];
    PROZESSE.forEach(function (p) {
      var n = p.id === 'C' ? cadThreads : 1, i;
      for (i = 1; i <= n; i++) th.push({ proz: p.id, nr: i, bereit: p.bereit });
    });
    return th;
  }
  /* Ergebnis: Feld [tick][kern] = {proz, nr} oder null */
  function schedule(kerne, cadThreads, ticks) {
    var th = threadsFuer(cadThreads), ptr = 0, out = [], t, k;
    for (t = 0; t < ticks; t++) {
      var row = [], gewaehlt = 0, i = 0, last = ptr;
      for (k = 0; k < kerne; k++) row.push(null);
      for (i = 0; i < th.length && gewaehlt < kerne; i++) {
        var idx = (ptr + i) % th.length;
        if (th[idx].bereit(t)) { row[gewaehlt] = { proz: th[idx].proz, nr: th[idx].nr }; gewaehlt++; last = idx + 1; }
      }
      ptr = last % th.length;
      out.push(row);
    }
    return out;
  }
  function anteil(plan, ticks, proz) {
    var n = 0, ges = 0, t, k;
    for (t = 0; t < ticks; t++) for (k = 0; k < plan[t].length; k++) { ges++; if (plan[t][k] && plan[t][k].proz === proz) n++; }
    return ges ? n / ges : 0;
  }
  function maxGleichzeitig(plan, ticks, proz) {
    var m = 0, t, k;
    for (t = 0; t < ticks; t++) { var c = 0; for (k = 0; k < plan[t].length; k++) if (plan[t][k] && plan[t][k].proz === proz) c++; if (c > m) m = c; }
    return m;
  }

  /* (D) Dateibaum der Zelle FZ-3 und pathlib-Teile */
  var LOGS = ['2026-11-16.log', '2026-11-17.log', '2026-11-18.log', '2026-11-19.log', '2026-11-20.log'];
  var BAUM = { name: 'zelle', kind: 'dir', kids: [
    { name: 'LIESMICH.txt', kind: 'file', info: 'Kurzbeschreibung der Zelle (Text)' },
    { name: 'maschinen', kind: 'dir', kids: ['D2', 'F1', 'M1', 'R1'].map(function (m) {
      return { name: m, kind: 'dir', kids: [{ name: 'logs', kind: 'dir', kids: LOGS.map(function (l) { return { name: l, kind: 'file', info: 'Logdatei von ' + m + ' (Zeit;Stufe;Meldung)' }; }) }] };
    }) },
    { name: 'messprotokolle', kind: 'dir', kids: [{ name: 'M1_D2_KW47.csv', kind: 'file', info: 'Messprotokoll der Messmaschine (CSV mit Semikolon)' }] },
    { name: 'nc-programme', kind: 'dir', kids: [
      { name: 'FLANSCH_80.nc', kind: 'file', info: 'NC-Programm für die Fräsmaschine' },
      { name: 'WELLE_20H6.nc', kind: 'file', info: 'NC-Programm für die Drehmaschine' },
      { name: 'alt', kind: 'dir', kids: [{ name: 'WELLE_20H6_v1.nc', kind: 'file', info: 'Ältere Version des Drehprogramms' }] }
    ] }
  ] };
  var ARBEITSVZ_WIN = 'C:\\Users\\anna\\projekte\\fz3', ARBEITSVZ_LIN = '/home/anna/projekte/fz3';
  /* Teile eines relativen Pfads (Liste von Namen) wie pathlib */
  function pfadTeile(teile) {
    var n = teile.length, name = teile[n - 1], punkt = name.lastIndexOf('.');
    var stem = punkt > 0 ? name.slice(0, punkt) : name, suffix = punkt > 0 ? name.slice(punkt) : '';
    var parent = n > 1 ? teile.slice(0, n - 1) : [];
    var parent2 = n > 2 ? teile.slice(0, n - 2) : [];
    return {
      rel: teile.join('/'), relWin: teile.join('\\'),
      abs_win: ARBEITSVZ_WIN + '\\' + teile.join('\\'), abs_lin: ARBEITSVZ_LIN + '/' + teile.join('/'),
      name: name, stem: stem, suffix: suffix,
      parent: parent.length ? parent.join('/') : '.',
      parent2: parent2.length ? parent2.join('/') : '.',
      parent2name: parent2.length ? parent2[parent2.length - 1] : ''
    };
  }
  function alleDateien(k, pfad, acc) {
    pfad = pfad || []; acc = acc || [];
    var p = pfad.concat([k.name]);
    if (k.kind === 'file') acc.push(p); else k.kids.forEach(function (c) { alleDateien(c, p, acc); });
    return acc;
  }

  var core = { fmt: fmt, STUFEN: STUFEN, balkenAnteil: balkenAnteil, faktor: faktor, simuliere: simuliere, PROZESSE: PROZESSE, schedule: schedule, anteil: anteil,
    maxGleichzeitig: maxGleichzeitig, BAUM: BAUM, pfadTeile: pfadTeile, alleDateien: alleDateien };
  if (typeof module !== 'undefined' && module.exports) module.exports = core;
  if (typeof document === 'undefined') return;

  /* ── DOM-Helfer ──────────────────────────────────────────── */
  var uid = 0;
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { if (k === 'class') n.className = attrs[k]; else if (k === 'text') n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (c) { n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function code(t) { return el('code', { class: 'k-i', text: t }); }
  function nextId(p) { uid++; return p + uid; }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function field(label, input) { var id = nextId('v16f'); input.id = id; return el('div', { class: 'k-field' }, [el('label', { 'for': id, text: label }), input]); }
  function seg(label, opts, cur, onPick) {
    var g = el('div', { class: 'k-seg v16-seg', role: 'group', 'aria-label': label }), btns = [];
    opts.forEach(function (o) {
      var b = el('button', { type: 'button', 'aria-pressed': String(o.v === cur), text: o.t });
      b.addEventListener('click', function () { btns.forEach(function (x, i) { x.setAttribute('aria-pressed', String(opts[i].v === o.v)); }); onPick(o.v); });
      btns.push(b); g.appendChild(b);
    });
    return g;
  }
  function labelled(text, node) { return el('div', { class: 'v16-ctl' }, [el('span', { class: 'v16-lbl', text: text }), node]); }
  function reduced() { return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches; }

  /* ══════════════════════════════════════════════════════════
     (A) Speicherhierarchie
     ══════════════════════════════════════════════════════════ */
  function initSpeicher(host) {
    var cur = 1, rows = [];
    var list = el('ul', { class: 'v16-hier', role: 'list' });
    STUFEN.forEach(function (s, i) {
      var fill = el('span', { class: 'v16-bar__fill' });
      fill.style.width = Math.round(balkenAnteil(s.ns) * 100) + '%';
      var btn = el('button', { type: 'button', class: 'v16-row', 'aria-pressed': String(i === cur) }, [
        el('span', { class: 'v16-row__n', text: s.name }),
        el('span', { class: 'v16-bar', 'aria-hidden': 'true' }, [fill]),
        el('span', { class: 'v16-row__t', text: s.real })
      ]);
      btn.addEventListener('click', function () { cur = i; paint(); });
      rows.push(btn); list.appendChild(el('li', {}, [btn]));
    });
    var detail = el('div', { class: 'v16-detail', 'aria-live': 'polite' });
    var rg = el('input', { type: 'range', min: '0', max: String(STUFEN.length - 1), step: '1', value: String(cur) });
    rg.addEventListener('input', function () { cur = +rg.value; paint(); });
    var rgField = field('Stufe wählen (Schieber)', rg);
    host.appendChild(el('p', { class: 'k-small k-muted', text: 'Die Balken sind logarithmisch: Jede Skalenstufe ist zehnmal so lang wie die davor. Alle Zeiten sind Größenordnungen („ca.“), echte Geräte weichen ab.' }));
    host.appendChild(list); host.appendChild(rgField); host.appendChild(detail);
    function paint() {
      var s = STUFEN[cur], ram = STUFEN[1];
      rows.forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === cur)); });
      rg.value = String(cur);
      clear(detail);
      detail.appendChild(el('h4', { class: 'v16-detail__t', text: s.name }));
      detail.appendChild(el('p', { text: s.text }));
      var dl = el('dl', { class: 'v16-dl' });
      [['Zugriffszeit real', s.real], ['Wenn 1 ns eine Sekunde wäre', s.mensch], ['Typische Größe', s.groesse], ['Preis', s.preis], ['Bei Strom aus', s.bleibt]].forEach(function (x) {
        dl.appendChild(el('div', {}, [el('dt', { text: x[0] }), el('dd', { text: x[1] })]));
      });
      detail.appendChild(dl);
      var f = s.ns / ram.ns;
      var satz = s.id === 'ram' ? 'Das ist die Bezugsgröße: Alles andere vergleichen wir mit dem RAM.'
        : f < 1 ? 'Ca. ' + fmt(1 / f, 0) + '-mal schneller als der RAM, aber viel kleiner.' : 'Ca. ' + fmt(f, 0) + '-mal langsamer als der RAM.';
      detail.appendChild(el('p', { class: 'v16-detail__f', text: satz }));
    }
    paint();
  }

  /* ══════════════════════════════════════════════════════════
     (B) Task-Manager-Simulator
     ══════════════════════════════════════════════════════════ */
  function initTaskmanager(host) {
    var p, teileOut, outNode;
    var START = { teile: 2000, ram: 16, kerne: 8, netz: true, gpu: 'workstation', andere: true };
    function build() {
      p = Object.assign({}, START);
      clear(host);
      host.appendChild(el('p', { class: 'k-small k-muted', text: 'Vereinfachtes Modell, keine Messung: Die Zahlen zeigen Größenordnungen und die Richtung der Wirkung. Dein Rechner und dein CAD-Programm verhalten sich im Detail anders.' }));
      var ti = el('input', { type: 'range', min: '100', max: '6000', step: '100', value: String(p.teile) });
      teileOut = el('output', { class: 'v16-val' });
      ti.addEventListener('input', function () { p.teile = +ti.value; paint(); });
      var f = field('Baugruppengröße (Teile)', ti); f.appendChild(teileOut);
      var ctl = el('div', { class: 'v16-tmctl' }, [
        f,
        labelled('Arbeitsspeicher', seg('Arbeitsspeicher', [{ v: 8, t: '8 GB' }, { v: 16, t: '16 GB' }, { v: 32, t: '32 GB' }], p.ram, function (v) { p.ram = v; paint(); })),
        labelled('Prozessorkerne', seg('Prozessorkerne', [{ v: 4, t: '4' }, { v: 8, t: '8' }, { v: 16, t: '16' }], p.kerne, function (v) { p.kerne = v; paint(); })),
        labelled('Speicherort der Baugruppe', seg('Speicherort', [{ v: false, t: 'Lokale SSD' }, { v: true, t: 'Netzlaufwerk' }], p.netz, function (v) { p.netz = v; paint(); })),
        labelled('Grafik', seg('Grafik', [{ v: 'onboard', t: 'Onboard' }, { v: 'workstation', t: 'Workstation-GPU' }], p.gpu, function (v) { p.gpu = v; paint(); })),
        labelled('Andere Programme offen (Browser, Teams, Mail)', seg('Andere Programme', [{ v: true, t: 'Ja' }, { v: false, t: 'Nein' }], p.andere, function (v) { p.andere = v; paint(); }))
      ]);
      outNode = el('div', { class: 'v16-tm' });
      var reset = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Zurück zum ruckelnden CAD (Startzustand)' });
      reset.addEventListener('click', build);
      host.appendChild(el('div', { class: 'v16-tmwrap' }, [ctl, outNode]));
      host.appendChild(reset);
      paint();
    }
    function meter(label, proz, text, schwer) {
      var fill = el('span', { class: 'v16-meter__fill' + (schwer ? ' is-' + schwer : '') });
      fill.style.width = Math.max(0, Math.min(100, proz)) + '%';
      return el('div', { class: 'v16-meter' }, [
        el('div', { class: 'v16-meter__h' }, [el('span', { text: label }), el('strong', { text: text })]),
        el('div', { class: 'v16-meter__bar', role: 'img', 'aria-label': label + ': ' + text }, [fill])
      ]);
    }
    function paint() {
      var r = simuliere(p);
      teileOut.textContent = fmt(p.teile, 0) + ' Teile (Datei ca. ' + fmt(p.teile * MB_JE_TEIL / 1000, 1) + ' GB)';
      var o = outNode; clear(o);
      // CPU
      var cpu = el('div', { class: 'v16-block' }, [el('h4', { text: 'CPU' }), meter('Gesamt', r.cpuGesamt, fmt(r.cpuGesamt, 0) + ' %', '')]);
      var cores = el('div', { class: 'v16-cores' });
      r.kernLast.forEach(function (l, i) {
        var f = el('span', { class: 'v16-core__fill' + (l >= 90 ? ' is-voll' : '') }); f.style.height = Math.max(2, l) + '%';
        cores.appendChild(el('div', { class: 'v16-core', role: 'img', 'aria-label': 'Kern ' + (i + 1) + ': ' + l + ' %' }, [el('span', { class: 'v16-core__bar' }, [f]), el('span', { class: 'v16-core__n', text: 'K' + (i + 1) }), el('span', { class: 'v16-core__v', text: l + ' %' })]));
      });
      cpu.appendChild(cores);
      // RAM
      var ramB = el('div', { class: 'v16-block' }, [el('h4', { text: 'Arbeitsspeicher' }),
        meter('Belegung', r.ramProz, fmt(r.benutzt, 1) + ' von ' + p.ram + ' GB (' + fmt(r.ramProz, 0) + ' %)', r.swap > 0 ? 'bad' : r.ramProz >= 90 ? 'warn' : ''),
        el('p', { class: 'v16-small', text: r.swap > 0 ? 'Auslagerung: ' + fmt(r.swap, 1) + ' GB liegen auf dem Datenträger.' : 'Keine Auslagerung.' })]);
      var gpuB = el('div', { class: 'v16-block' }, [el('h4', { text: 'GPU' }), meter('Auslastung', r.gpuLast, fmt(r.gpuLast, 0) + ' %', r.gpuLast >= 100 ? 'bad' : ''),
        el('p', { class: 'v16-small', text: 'Drehen: ca. ' + fmt(r.fps, 0) + ' Bilder pro Sekunde' })]);
      var dat = el('div', { class: 'v16-block' }, [el('h4', { text: 'Datenträger und Netzwerk' }), meter('Datenträger (SSD)', r.traeger, r.traeger + ' %', r.traeger >= 100 ? 'bad' : ''),
        meter('Netzwerk', r.netzLast, p.netz ? 'ca. ' + r.netzLast + ' %' : '0 %', ''),
        el('p', { class: 'v16-small', text: 'Baugruppe öffnen: ca. ' + fmt(r.oeffnen, r.oeffnen < 10 ? 1 : 0) + ' s, Neuberechnung: ca. ' + fmt(r.neuberechnung, 1) + ' s' })]);
      o.appendChild(el('div', { class: 'v16-tmgrid' }, [cpu, ramB, gpuB, dat]));
      // Diagnose
      var d = el('div', { class: 'v16-diag', 'aria-live': 'polite' });
      d.appendChild(el('h4', { text: 'Diagnose' }));
      if (!r.befunde.length) d.appendChild(el('p', { text: 'Kein Engpass erkennbar: Die Werte liegen in einem unkritischen Bereich. Mach die Baugruppe größer und beobachte, was zuerst kippt.' }));
      else {
        var b0 = r.befunde[0];
        d.appendChild(el('p', { class: 'v16-diag__main' }, [el('strong', { text: (b0.stufe === 2 ? 'Größter Engpass: ' : 'Auffälligster Punkt: ') + b0.titel + '. ' }), document.createTextNode(b0.text + ' ')]));
        d.appendChild(el('p', {}, [el('strong', { text: 'Maßnahme: ' }), document.createTextNode(b0.massnahme)]));
        if (r.befunde.length > 1) {
          var ul = el('ul', { class: 'v16-diag__more' });
          r.befunde.slice(1).forEach(function (b) { ul.appendChild(el('li', {}, [el('strong', { text: b.titel + ': ' }), document.createTextNode(b.massnahme)])); });
          d.appendChild(el('p', { class: 'v16-small', text: 'Weitere Auffälligkeiten:' })); d.appendChild(ul);
        }
      }
      if (p.kerne >= 8 && r.kernLast[0] >= 90 && r.cpuGesamt < 20) d.appendChild(el('p', { class: 'v16-note', text: 'Gesamt nur ' + fmt(r.cpuGesamt, 0) + ' %, aber ein Kern bei 100 %: Die Gesamtanzeige verdeckt den Engpass. Schau im Task-Manager auf die einzelnen Kerne (Leistung, CPU, Rechtsklick auf das Diagramm, „Logische Prozessoren“).' }));
      o.appendChild(d);
    }
    build();
  }

  /* ══════════════════════════════════════════════════════════
     (C) Scheduler
     ══════════════════════════════════════════════════════════ */
  function initScheduler(host) {
    var TICKS = 12, st = { kerne: 1, cad: 1, shown: 0 }, timer = null;
    var gridHost = el('div', { class: 'v16-sched', role: 'img' });
    var info = el('p', { class: 'v16-sched__info', role: 'status', 'aria-live': 'polite' });
    var stats = el('p', { class: 'k-small', 'aria-live': 'polite' });
    var bNext = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Nächste Zeitscheibe' });
    var bPlay = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Abspielen', 'aria-pressed': 'false' });
    var bReset = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Neu starten' });
    function stop() { if (timer) { clearInterval(timer); timer = null; } bPlay.textContent = 'Abspielen'; bPlay.setAttribute('aria-pressed', 'false'); }
    function step() { if (st.shown < TICKS) { st.shown++; paint(); } else stop(); }
    bNext.addEventListener('click', function () { stop(); step(); });
    bPlay.addEventListener('click', function () {
      if (timer) { stop(); return; }
      if (st.shown >= TICKS) { st.shown = 0; paint(); }
      bPlay.textContent = 'Pause'; bPlay.setAttribute('aria-pressed', 'true');
      timer = setInterval(step, reduced() ? 400 : 900);
    });
    bReset.addEventListener('click', function () { stop(); st.shown = 0; paint(); });
    function setCfg(k, v) { st[k] = v; stop(); st.shown = 0; paint(); }
    host.appendChild(el('div', { class: 'v16-schedctl' }, [
      labelled('Kerne im Prozessor', seg('Kerne', [{ v: 1, t: '1 Kern' }, { v: 2, t: '2 Kerne' }], st.kerne, function (v) { setCfg('kerne', v); })),
      labelled('CAD-Neuberechnung', seg('Threads des CAD', [{ v: 1, t: '1 Thread (nacheinander)' }, { v: 2, t: '2 Threads (aufteilbar)' }], st.cad, function (v) { setCfg('cad', v); }))
    ]));
    host.appendChild(el('div', { class: 'k-presets v16-ctrlbar' }, [bNext, bPlay, bReset]));
    host.appendChild(gridHost); host.appendChild(info); host.appendChild(stats);
    function paint() {
      var plan = schedule(st.kerne, st.cad, TICKS), t, k;
      clear(gridHost);
      gridHost.setAttribute('aria-label', 'Zeitplan: Zeile je Kern, Spalte je Zeitscheibe; ' + st.shown + ' von ' + TICKS + ' Zeitscheiben gezeigt');
      var tbl = el('table', { class: 'v16-sched__t' });
      var head = el('tr', {}, [el('th', { scope: 'col', text: '' })]);
      for (t = 0; t < TICKS; t++) head.appendChild(el('th', { scope: 'col', class: t === st.shown - 1 ? 'is-now' : '', text: String(t + 1) }));
      tbl.appendChild(head);
      for (k = 0; k < st.kerne; k++) {
        var tr = el('tr', {}, [el('th', { scope: 'row', text: 'Kern ' + (k + 1) })]);
        for (t = 0; t < TICKS; t++) {
          var c = plan[t][k], td;
          if (t >= st.shown) td = el('td', { class: 'v16-cell is-leer', text: '' });
          else if (!c) td = el('td', { class: 'v16-cell is-idle', text: '–', title: 'Leerlauf' });
          else td = el('td', { class: 'v16-cell v16-p-' + c.proz, text: c.proz + (c.proz === 'C' && st.cad > 1 ? c.nr : ''), title: PROZESSE.filter(function (x) { return x.id === c.proz; })[0].name });
          tr.appendChild(td);
        }
        tbl.appendChild(tr);
      }
      gridHost.appendChild(tbl);
      var leg = el('ul', { class: 'v16-legend' });
      PROZESSE.forEach(function (pr) { leg.appendChild(el('li', {}, [el('span', { class: 'v16-cell v16-p-' + pr.id, text: pr.id }), document.createTextNode(' ' + pr.name)])); });
      gridHost.appendChild(leg);
      if (st.shown === 0) info.textContent = 'Drücke „Nächste Zeitscheibe“. Das Betriebssystem teilt reihum (Round Robin) jedem bereiten Thread ein Stück Rechenzeit zu. Der Browser und Teams sind nicht in jeder Scheibe bereit.';
      else {
        var tt = st.shown - 1, was = [];
        plan[tt].forEach(function (c, i) { was.push('Kern ' + (i + 1) + ': ' + (c ? PROZESSE.filter(function (x) { return x.id === c.proz; })[0].name + (c.proz === 'C' && st.cad > 1 ? ' (Thread ' + c.nr + ')' : '') : 'Leerlauf')); });
        info.textContent = 'Zeitscheibe ' + st.shown + ': ' + was.join(', ') + '.';
      }
      if (st.shown > 0) {
        var a = anteil(plan, st.shown, 'C'), mg = maxGleichzeitig(plan, st.shown, 'C');
        stats.textContent = 'CAD hat bisher ' + fmt(a * 100, 0) + ' % der Rechenzeit. Höchstens ' + mg + ' CAD-Feld' + (mg > 1 ? 'er' : '') + ' in einer Spalte' +
          (st.cad === 1 && st.kerne === 2 ? ': Ein einzelner Thread läuft nie auf zwei Kernen gleichzeitig, der zweite Kern hilft dem CAD nicht, er rechnet für die anderen Programme.' : st.cad === 2 && st.kerne === 2 ? ': Zwei Threads können zugleich auf zwei Kernen laufen. Das setzt voraus, dass das Programm seine Arbeit aufteilen kann.' : '.');
      } else stats.textContent = '';
    }
    paint();
  }

  /* ══════════════════════════════════════════════════════════
     (D) Dateibaum FZ-3
     ══════════════════════════════════════════════════════════ */
  function initDateibaum(host) {
    var detail = el('div', { class: 'v16-detail', 'aria-live': 'polite' });
    var tree = el('div', { class: 'v16-tree', role: 'group', 'aria-label': 'Ordnerbaum der Zelle FZ-3' });
    var selected = null;
    function row(k, pfad, depth) {
      var p = pfad.concat([k.name]), li = el('div', { class: 'v16-node' });
      var btn = el('button', { type: 'button', class: 'v16-item v16-item--' + k.kind, 'aria-expanded': k.kind === 'dir' ? String(depth < 1) : null, 'data-pfad': p.join('/') });
      btn.style.paddingLeft = (8 + depth * 18) + 'px';
      btn.setAttribute('aria-label', (k.kind === 'dir' ? 'Ordner ' : 'Datei ') + k.name);
      btn.appendChild(el('span', { class: 'v16-item__sym', 'aria-hidden': 'true' }));
      btn.appendChild(el('span', { text: k.name }));
      if (btn.getAttribute('aria-expanded') === null) btn.removeAttribute('aria-expanded');
      li.appendChild(btn);
      if (k.kind === 'dir') {
        var box = el('div', { class: 'v16-kids' });
        box.hidden = depth >= 1;
        k.kids.forEach(function (c) { box.appendChild(row(c, p, depth + 1)); });
        li.appendChild(box);
        btn.addEventListener('click', function () {
          var open = btn.getAttribute('aria-expanded') !== 'true';
          btn.setAttribute('aria-expanded', String(open)); box.hidden = !open;
          show(p, true);
        });
      } else btn.addEventListener('click', function () { show(p, false); });
      return li;
    }
    tree.appendChild(row(BAUM, [], 0));
    // Wurzel startet geöffnet, nur die Unterordner sind zu
    var first = tree.querySelector('.v16-kids'); if (first) first.hidden = false;
    var rootBtn = tree.querySelector('.v16-item'); if (rootBtn) { rootBtn.setAttribute('aria-expanded', 'true'); }
    function show(p, ordner) {
      clear(detail);
      tree.querySelectorAll('.v16-item').forEach(function (b) { b.classList.toggle('is-sel', b.getAttribute('data-pfad') === p.join('/')); });
      var t = pfadTeile(p);
      detail.appendChild(el('h4', { class: 'v16-detail__t', text: (ordner ? 'Ordner ' : 'Datei ') + p[p.length - 1] }));
      var dl = el('dl', { class: 'v16-dl v16-dl--pfad' });
      function add(k, v) { dl.appendChild(el('div', {}, [el('dt', { text: k }), el('dd', {}, [el('code', { class: 'k-i', text: v })])])); }
      add('Absolut (Windows)', t.abs_win); add('Absolut (Linux, macOS)', t.abs_lin);
      add('Relativ ab Arbeitsverzeichnis', t.rel);
      detail.appendChild(dl);
      detail.appendChild(el('p', { class: 'k-small k-muted', text: 'Angenommenes Arbeitsverzeichnis: ' + ARBEITSVZ_WIN + ' (Windows) bzw. ' + ARBEITSVZ_LIN + ' (Linux).' }));
      detail.appendChild(el('p', { class: 'v16-detail__f' }, [document.createTextNode('In Python: '), code('p = Path("' + t.rel + '")')]));
      var tb = el('table', { class: 'v16-tab' });
      tb.appendChild(el('tr', {}, [el('th', { scope: 'col', text: 'Ausdruck' }), el('th', { scope: 'col', text: 'Ergebnis' })]));
      [['p.name', t.name], ['p.stem', t.stem], ['p.suffix', t.suffix], ['p.parent', t.parent], ['p.parent.parent.name', t.parent2name]].forEach(function (x) {
        var wert = x[0] === 'p.parent' ? 'Path("' + x[1] + '")' : '"' + x[1] + '"';
        tb.appendChild(el('tr', {}, [el('td', { text: x[0] }), el('td', { text: wert })]));
      });
      detail.appendChild(tb);
      if (t.parent2name === '') detail.appendChild(el('p', { class: 'k-small k-muted', text: 'Zwei Ordner nach oben endet der relative Pfad: Path(".") hat den Namen "" (leer).' }));
      else if (!ordner && p[1] === 'maschinen' && p.length >= 5) detail.appendChild(el('p', { class: 'k-small k-muted', text: 'Bei Logdateien ist ' + t.parent2name + ' die Maschine: genau der Ausdruck, den das Labor-Beispiel benutzt.' }));
    }
    host.appendChild(el('div', { class: 'v16-two' }, [tree, detail]));
    host.insertBefore(el('p', { class: 'k-small k-muted', text: 'Klicke Ordner an, um sie auf- und zuzuklappen, und eine Datei, um ihren Pfad zu sehen.' }), host.firstChild);
    show(['zelle', 'maschinen', 'D2', 'logs', '2026-11-16.log'], false);
    var sel = tree.querySelector('[data-pfad="zelle/maschinen/D2/logs/2026-11-16.log"]');
    // Pfad zur Startdatei aufklappen
    ['zelle/maschinen', 'zelle/maschinen/D2', 'zelle/maschinen/D2/logs'].forEach(function (pp) {
      var b = tree.querySelector('[data-pfad="' + pp + '"]');
      if (b && b.getAttribute('aria-expanded') === 'false') { b.setAttribute('aria-expanded', 'true'); b.nextSibling.hidden = false; }
    });
    if (sel) sel.classList.add('is-sel');
  }

  /* ══════════════════════════════════════════════════════════
     (E) PAP der Log-Suche
     ══════════════════════════════════════════════════════════ */
  function initPap(host) {
    var K = root.KursPAP;
    if (!K || !K.P) { host.appendChild(el('p', { class: 'k-small k-muted', text: 'Der Programmablaufplan braucht pap-engine.js.' })); return; }
    var P = K.P;
    var spec = [
      P.start(), P.op('fehler = 0'),
      P.whil('weitere Log-Datei?', [
        P.whil('weitere Zeile in der Datei?', [
          P.iff('Stufe == ERROR?', [P.op('fehler = fehler + 1')], [])
        ])
      ]),
      P.io('Ausgabe: fehler'), P.end()
    ];
    var d = el('div', { class: 'v16-papbox' });
    d.innerHTML = K.figure(spec, { label: 'Programmablaufplan der Log-Suche: Zähler auf null, äußere Schleife über alle Log-Dateien, innere Schleife über alle Zeilen, Verzweigung Stufe gleich ERROR erhöht den Zähler, danach Ausgabe.' });
    host.appendChild(d);
  }

  function init() {
    var map = { speicher: initSpeicher, taskmanager: initTaskmanager, scheduler: initScheduler, dateibaum: initDateibaum, 'pap-logsuche': initPap };
    Object.keys(map).forEach(function (k) { Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="' + k + '"]'), map[k]); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : globalThis);
