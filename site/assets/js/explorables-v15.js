/* =============================================================
   explorables-v15.js – interaktive Bausteine für V15 „Datenanalyse“ (reines JS, kein Framework)
   (A) Anatomie eines DataFrames: Index, Spalten, Series, Maske, Filtern – Schritt für Schritt.
   (B) groupby als Aufteilen – Anwenden – Zusammenführen.
   (C) Cp/Cpk-Rechner: Mittelwert und Standardabweichung per Schieberegler, Normalverteilung, ppm, Bewertung.
   (D) Regelkarte (x-quer-Karte) für die Drehmaschinen D1 und D2 mit Eingriffs- und Toleranzgrenzen.
   (E) PAP: Regelkarte prüfen (Schleife mit Verzweigung) und Cpk bewerten (verschachtelte Verzweigung).
   Der Rechenkern ist ohne DOM per node testbar (module.exports).
   Daten: site/assets/data/v15/wellen.csv (Stichprobenmittel je Maschine, Grenzen aus den Stichproben 1 bis 15).
   ============================================================= */
(function (root) {
  'use strict';

  /* ── Kern (ohne DOM) ─────────────────────────────────────── */
  var USG = 19.980, OSG = 20.020;
  /* Stichprobenmittel (5 Teile je Stichprobe), Stichprobe 1 bis 25; Grenzen aus den Stichproben 1 bis 15 */
  var MASCHINEN = {
    D1: {
      name: 'D1', mitte: 20.00018, oeg: 20.00610, ueg: 19.99426,
      mittel: [19.99974, 19.99994, 20.00112, 19.99668, 19.99934, 19.99916, 20.00122, 20.00038, 20.00140, 20.00004, 20.00078, 20.00274, 20.00164, 19.99820, 20.00036, 19.99920, 19.99882, 20.00348, 20.00024, 20.00070, 19.99596, 19.99952, 19.99942, 20.00240, 20.00052]
    },
    D2: {
      name: 'D2', mitte: 20.00535, oeg: 20.01176, ueg: 19.99894,
      mittel: [20.00540, 20.00594, 20.00188, 20.00992, 20.00464, 20.00626, 20.00368, 20.00576, 20.00344, 20.00324, 20.00574, 20.00470, 20.00608, 20.00772, 20.00584, 20.00630, 20.01028, 20.00384, 20.00520, 20.01184, 20.01004, 20.00980, 20.00872, 20.01538, 20.01830]
    }
  };
  var RUN = 7;      /* Run-Regel: so viele Punkte in Folge auf einer Seite der Mittellinie */

  function mittelwert(a) { var t = 0; a.forEach(function (x) { t += x; }); return t / a.length; }
  function stdev(a) { var m = mittelwert(a), t = 0; a.forEach(function (x) { t += (x - m) * (x - m); }); return Math.sqrt(t / (a.length - 1)); }
  function cp(usg, osg, s) { return (osg - usg) / (6 * s); }
  function cpk(usg, osg, mu, s) { return Math.min(osg - mu, mu - usg) / (3 * s); }
  /* Komplementäre Fehlerfunktion (Numerical Recipes, relative Abweichung < 1,2e-7) */
  function erfc(z) {
    var a = Math.abs(z), t = 1 / (1 + 0.5 * a);
    var r = t * Math.exp(-a * a - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
    return z >= 0 ? r : 2 - r;
  }
  function phi(z) { return 0.5 * erfc(-z / Math.SQRT2); }                         /* Verteilungsfunktion N(0,1) */
  function pdf(x, mu, s) { var z = (x - mu) / s; return Math.exp(-0.5 * z * z) / (s * Math.sqrt(2 * Math.PI)); }
  /* Anteil außerhalb [usg, osg] bei Normalverteilung, in ppm: unten, oben, gesamt */
  function ppm(usg, osg, mu, s) {
    var u = phi((usg - mu) / s) * 1e6, o = (1 - phi((osg - mu) / s)) * 1e6;
    return { unten: u, oben: o, gesamt: u + o };
  }
  function bewertung(c) {
    var r = Math.round(c * 100) / 100;
    if (r >= 1.67) return { stufe: 'sehr', text: 'sehr fähig (üblich für Neuprozesse, oft Automobilindustrie)', ok: true };
    if (r >= 1.33) return { stufe: 'faehig', text: 'fähig', ok: true };
    if (r >= 1.0) return { stufe: 'bedingt', text: 'bedingt fähig', ok: false };
    return { stufe: 'nicht', text: 'nicht fähig', ok: false };
  }
  /* Regelkarte: welche Stichproben (Index ab 1) liegen außerhalb der Eingriffsgrenzen / der Warngrenzen; Run-Regel */
  function pruefe(m, bis) {
    var sx = (m.oeg - m.mitte) / 3, aus = [], warn = [], run = [], lauf = 0, seite = 0, i, x, s, maxLauf = 0;
    for (i = 0; i < bis; i++) {
      x = m.mittel[i];
      if (x > m.oeg || x < m.ueg) aus.push(i + 1);
      else if (x > m.mitte + 2 * sx || x < m.mitte - 2 * sx) warn.push(i + 1);
      s = x > m.mitte ? 1 : -1;
      lauf = (s === seite) ? lauf + 1 : 1; seite = s;
      if (lauf >= RUN) run.push(i + 1);
      if (lauf > maxLauf) maxLauf = lauf;
    }
    return { aus: aus, warn: warn, run: run, lauf: lauf, seite: seite, maxLauf: maxLauf, sx: sx };
  }
  function fmt(x, st) {
    try { return Number(x).toLocaleString('de-DE', { minimumFractionDigits: st, maximumFractionDigits: st }); }
    catch (e) { return String(x); }
  }
  function fmtPpm(p) {
    if (p < 0.5) return '< 1';
    if (p < 10) return fmt(p, 1);
    return fmt(Math.round(p), 0);
  }
  var core = {
    USG: USG, OSG: OSG, MASCHINEN: MASCHINEN, RUN: RUN, mittelwert: mittelwert, stdev: stdev, cp: cp, cpk: cpk,
    erfc: erfc, phi: phi, pdf: pdf, ppm: ppm, bewertung: bewertung, pruefe: pruefe, fmt: fmt
  };

  /* ── DOM-Helfer ──────────────────────────────────────────── */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { if (k === 'class') n.className = attrs[k]; else if (k === 'text') n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (c) { n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  var NS = 'http://www.w3.org/2000/svg';
  function sv(tag, attrs, text) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function reduced() { return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches; }
  var uid = 0;
  function nextId(p) { uid++; return p + uid; }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function icon(name) { return (typeof window !== 'undefined' && window.KIcon) ? window.KIcon(name) : document.createTextNode(''); }
  function segment(host, label, opts, startIdx, onchange) {
    var wrap = el('div', { class: 'k-field' }, [el('span', { class: 'v15-lbl', text: label })]);
    var seg = el('div', { class: 'k-seg v15-seg', role: 'group', 'aria-label': label });
    var btns = opts.map(function (o, i) {
      var b = el('button', { type: 'button', 'aria-pressed': i === startIdx ? 'true' : 'false', text: o });
      b.addEventListener('click', function () { set(i); onchange(i); });
      seg.appendChild(b); return b;
    });
    function set(i) { btns.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); }
    wrap.appendChild(seg); host.appendChild(wrap);
    return { set: set };
  }
  function checkbox(host, label, checked, onchange) {
    var id = nextId('v15-c-');
    var inp = el('input', { type: 'checkbox', id: id });
    inp.checked = !!checked;
    inp.addEventListener('change', function () { onchange(inp.checked); });
    host.appendChild(el('label', { class: 'v15-check', for: id }, [inp, el('span', { text: label })]));
    return inp;
  }
  function btn(text, cls, fn) {
    var b = el('button', { type: 'button', class: cls || 'k-btn k-btn--ghost k-btn--small', text: text });
    b.addEventListener('click', fn); return b;
  }
  /* Tabelle: cols = Spaltenüberschriften, rows = [{idx, cells[], cls, cellCls[]}], opts: {hiCol, idxHead, caption} */
  function tabelle(cols, rows, opts) {
    opts = opts || {};
    var t = el('table', { class: 'v15-tab' });
    if (opts.caption) t.appendChild(el('caption', { class: 'k-sr', text: opts.caption }));
    var tr = el('tr'); tr.appendChild(el('th', { scope: 'col', class: 'v15-idx', text: opts.idxHead || '' }));
    cols.forEach(function (c, j) { tr.appendChild(el('th', { scope: 'col', class: opts.hiCol === j ? 'is-hi' : (opts.newCol === j ? 'is-new' : ''), text: c })); });
    t.appendChild(el('thead', {}, [tr]));
    var tb = el('tbody');
    rows.forEach(function (r) {
      var row = el('tr', { class: r.cls || '' });
      row.appendChild(el('th', { scope: 'row', class: 'v15-idx', text: String(r.idx) }));
      r.cells.forEach(function (c, j) { row.appendChild(el('td', { class: (opts.hiCol === j ? 'is-hi ' : '') + (opts.newCol === j ? 'is-new ' : '') + (r.cellCls && r.cellCls[j] ? r.cellCls[j] : ''), text: String(c) })); });
      tb.appendChild(row);
    });
    t.appendChild(tb);
    return el('div', { class: 'k-tablewrap v15-tabwrap' }, [t]);
  }

  /* ══════════════════════════════════════════════════════════
     (A) Anatomie eines DataFrames
     ══════════════════════════════════════════════════════════ */
  var DF_COLS = ['stichprobe', 'maschine', 'schicht', 'teil', 'durchmesser_mm'];
  var DF_ROWS = [
    [2, [1, 'D1', 'Früh', 3, '19.9998']], [3, [1, 'D1', 'Früh', 4, '19.9977']], [4, [1, 'D1', 'Früh', 5, '20.0007']],
    [5, [1, 'D2', 'Früh', 1, '20.0059']], [6, [1, 'D2', 'Früh', 2, '20.0115']], [7, [1, 'D2', 'Früh', 3, '20.0008']]
  ];
  var DF_STEPS = [
    { knopf: 'df', code: 'df', typ: 'DataFrame: 6 Zeilen × 5 Spalten (Ausschnitt aus wellen.csv)',
      text: 'Ein <strong>DataFrame</strong> ist eine Tabelle. Jede Spalte hat einen Namen (oben), jede Zeile eine Nummer, den <strong>Index</strong> (links, ohne Überschrift). Hier siehst du sechs Zeilen aus der Mitte der Datei, deshalb beginnt der Index bei 2.' },
    { knopf: 'Spalte', code: 'df["durchmesser_mm"]', typ: 'Series (Name: durchmesser_mm, dtype: float64)',
      text: 'Mit einem Spaltennamen in <em>einer</em> eckigen Klammer holst du eine einzelne Spalte. Das Ergebnis ist eine <strong>Series</strong>: eine Spalte mit Index, ohne weitere Spalten. Mit ihr rechnest du direkt, zum Beispiel <code>.mean()</code>.' },
    { knopf: 'Zwei Spalten', code: 'df[["maschine", "durchmesser_mm"]]', typ: 'DataFrame: 6 Zeilen × 2 Spalten',
      text: 'Die <em>doppelte</em> Klammer ist eine Liste von Spaltennamen. Das Ergebnis ist wieder ein DataFrame, nur mit weniger Spalten. Merke: einfache Klammer mit einem Namen gibt eine Series, doppelte Klammer mit einer Liste gibt einen DataFrame.' },
    { knopf: 'Maske', code: 'maske = df["maschine"] == "D2"', typ: 'Series aus True und False (dtype: bool)',
      text: 'Der Vergleich <code>== "D2"</code> wird für <em>jede Zeile</em> einzeln ausgewertet. Heraus kommt eine Series aus <code>True</code> und <code>False</code>, die <strong>Maske</strong>: Sie sagt für jede Zeile, ob sie die Bedingung erfüllt. Noch wurde nichts herausgefiltert.' },
    { knopf: 'Filtern', code: 'df[maske]', typ: 'DataFrame: 3 Zeilen × 5 Spalten',
      text: 'Mit der Maske in der Klammer behält <code>df[maske]</code> nur die Zeilen, bei denen <code>True</code> steht. Die anderen fallen weg. Beachte den Index: Er behält die alten Nummern (5, 6, 7), er wird nicht neu gezählt.' }
  ];
  function initDataFrame(host) {
    var z = { s: 0 };
    var codeEl = el('pre', { class: 'v15-codeline', 'aria-label': 'Python-Zeile' });
    var typEl = el('p', { class: 'v15-typ' });
    var out = el('div', { class: 'v15-out' });
    var txt = el('p', { class: 'v15-text', role: 'status', 'aria-live': 'polite' });
    var ctl = el('div', { class: 'k-controls v15-ctl' });
    var seg = segment(ctl, 'Ausdruck', DF_STEPS.map(function (s) { return s.knopf; }), 0, function (i) { gehe(i); });
    var nav = el('div', { class: 'k-presets v15-ctl' });
    var bZ = btn('Zurück', 'k-btn k-btn--ghost k-btn--small', function () { gehe(Math.max(0, z.s - 1)); });
    var bW = btn('Weiter', 'k-btn k-btn--small', function () { gehe(Math.min(DF_STEPS.length - 1, z.s + 1)); });
    nav.appendChild(bZ); nav.appendChild(bW);
    host.appendChild(ctl); host.appendChild(nav); host.appendChild(codeEl); host.appendChild(typEl); host.appendChild(out); host.appendChild(txt);

    function alleZeilen(extra) { return DF_ROWS.map(function (r) { return { idx: r[0], cells: r[1].slice(), cls: extra ? extra(r) : '' }; }); }
    function gehe(i) {
      z.s = i; seg.set(i);
      bZ.disabled = i === 0; bW.disabled = i === DF_STEPS.length - 1;
      var st = DF_STEPS[i];
      codeEl.textContent = st.code; typEl.textContent = 'Typ: ' + st.typ; txt.innerHTML = st.text;
      clear(out);
      var isD2 = function (r) { return r[1][1] === 'D2'; };
      if (i === 0) out.appendChild(tabelle(DF_COLS, alleZeilen(), { caption: 'DataFrame df, sechs Zeilen' }));
      else if (i === 1) {
        out.appendChild(tabelle(DF_COLS, alleZeilen(), { hiCol: 4, caption: 'df mit hervorgehobener Spalte durchmesser_mm' }));
        out.appendChild(el('p', { class: 'v15-pfeil', text: 'ergibt die Series:' }));
        out.appendChild(tabelle(['durchmesser_mm'], DF_ROWS.map(function (r) { return { idx: r[0], cells: [r[1][4]] }; }), { hiCol: 0, caption: 'Series durchmesser_mm' }));
      } else if (i === 2) {
        out.appendChild(tabelle(DF_COLS, alleZeilen(), { caption: 'df, Auswahl zweier Spalten folgt' }));
        out.appendChild(el('p', { class: 'v15-pfeil', text: 'ergibt den DataFrame:' }));
        out.appendChild(tabelle(['maschine', 'durchmesser_mm'], DF_ROWS.map(function (r) { return { idx: r[0], cells: [r[1][1], r[1][4]] }; }), { caption: 'DataFrame mit den Spalten maschine und durchmesser_mm' }));
      } else if (i === 3) {
        out.appendChild(tabelle(DF_COLS.concat(['maske']), DF_ROWS.map(function (r) { return { idx: r[0], cells: r[1].concat([isD2(r) ? 'True' : 'False']), cellCls: ['', '', '', '', '', isD2(r) ? 'is-true' : 'is-false'] }; }), { newCol: 5, caption: 'df mit der Maske als zusätzlicher Spalte' }));
      } else {
        var t = tabelle(DF_COLS.concat(['maske']), DF_ROWS.map(function (r) { return { idx: r[0], cells: r[1].concat([isD2(r) ? 'True' : 'False']), cls: isD2(r) ? '' : 'is-weg', cellCls: ['', '', '', '', '', isD2(r) ? 'is-true' : 'is-false'] }; }), { caption: 'df, Zeilen mit False fallen weg' });
        var weg = t.querySelectorAll('tr.is-weg');
        if (!reduced()) { Array.prototype.forEach.call(weg, function (r) { r.classList.remove('is-weg'); r.classList.add('is-vor'); }); setTimeout(function () { Array.prototype.forEach.call(weg, function (r) { r.classList.remove('is-vor'); r.classList.add('is-weg'); }); }, 120); }
        out.appendChild(t);
        out.appendChild(el('p', { class: 'v15-pfeil', text: 'ergibt:' }));
        out.appendChild(tabelle(DF_COLS, DF_ROWS.filter(isD2).map(function (r) { return { idx: r[0], cells: r[1] }; }), { caption: 'Gefilterter DataFrame: nur Maschine D2' }));
      }
    }
    gehe(0);
  }

  /* ══════════════════════════════════════════════════════════
     (B) groupby: Aufteilen – Anwenden – Zusammenführen
     ══════════════════════════════════════════════════════════ */
  var GB_ROWS = [[0, 'D1', 20.0006], [5, 'D2', 20.0059], [1, 'D1', 19.9999], [6, 'D2', 20.0115], [2, 'D1', 19.9998], [7, 'D2', 20.0008]];
  var GB_FUNK = [
    { n: 'mean', f: function (a) { return mittelwert(a); }, ganz: false, wort: 'Mittelwert' },
    { n: 'min', f: function (a) { return Math.min.apply(null, a); }, ganz: false, wort: 'kleinster Wert' },
    { n: 'max', f: function (a) { return Math.max.apply(null, a); }, ganz: false, wort: 'größter Wert' },
    { n: 'count', f: function (a) { return a.length; }, ganz: true, wort: 'Anzahl' }
  ];
  var GB_SCHRITTE = ['Tabelle', 'Aufteilen', 'Anwenden', 'Zusammenführen'];
  function initGroupby(host) {
    var z = { s: 0, f: 0 };
    var ctl = el('div', { class: 'k-controls v15-ctl' });
    var segS = segment(ctl, 'Schritt', GB_SCHRITTE, 0, function (i) { z.s = i; zeichne(); });
    var segF = segment(ctl, 'Funktion', GB_FUNK.map(function (f) { return f.n; }), 0, function (i) { z.f = i; zeichne(); });
    var nav = el('div', { class: 'k-presets v15-ctl' });
    var bZ = btn('Zurück', 'k-btn k-btn--ghost k-btn--small', function () { z.s = Math.max(0, z.s - 1); zeichne(); });
    var bW = btn('Weiter', 'k-btn k-btn--small', function () { z.s = Math.min(3, z.s + 1); zeichne(); });
    nav.appendChild(bZ); nav.appendChild(bW);
    var codeEl = el('pre', { class: 'v15-codeline', 'aria-label': 'Python-Zeile' });
    var out = el('div', { class: 'v15-out' });
    var txt = el('p', { class: 'v15-text', role: 'status', 'aria-live': 'polite' });
    host.appendChild(ctl); host.appendChild(nav); host.appendChild(codeEl); host.appendChild(out); host.appendChild(txt);
    var TEXTE = [
      'Ausgangslage: sechs Messwerte, die Maschinen D1 und D2 gemischt. Du willst wissen: Wie sieht es <em>je Maschine</em> aus? Das ist die Frage, die <code>groupby("maschine")</code> beantwortet.',
      '<strong>1. Aufteilen (split):</strong> pandas sortiert die Zeilen nach dem Wert der Spalte <code>maschine</code> in Gruppen: alle D1-Zeilen zusammen, alle D2-Zeilen zusammen. Die Zeilen selbst bleiben unverändert.',
      '<strong>2. Anwenden (apply):</strong> Die gewählte Funktion wird auf jede Gruppe <em>einzeln</em> angewendet, hier auf die Spalte <code>durchmesser_mm</code>: Aus je drei Werten wird ein Wert.',
      '<strong>3. Zusammenführen (combine):</strong> Die Ergebnisse der Gruppen werden zu einer neuen Series zusammengesetzt. Ihr Index sind die Gruppennamen (D1, D2). Aus sechs Zeilen sind zwei geworden.'
    ];
    function wert(f, a) { var v = f.f(a); return f.ganz ? String(v) : fmt(v, 4).replace(',', '.'); }
    function zeichne() {
      segS.set(z.s); bZ.disabled = z.s === 0; bW.disabled = z.s === 3;
      var f = GB_FUNK[z.f];
      codeEl.textContent = 'df.groupby("maschine")["durchmesser_mm"].' + f.n + '()' + (f.ganz ? '' : '.round(4)');
      txt.innerHTML = TEXTE[z.s] + (z.s >= 2 ? ' (Funktion: ' + f.wort + '.)' : '');
      clear(out);
      var cols = ['maschine', 'durchmesser_mm'];
      var rows = GB_ROWS.map(function (r) { return { idx: r[0], cells: [r[1], r[2].toFixed(4)] }; });
      if (z.s === 0) { out.appendChild(tabelle(cols, rows, { caption: 'Messwerte beider Maschinen, gemischt' })); return; }
      var gruppen = el('div', { class: 'v15-gruppen' });
      ['D1', 'D2'].forEach(function (g) {
        var teil = GB_ROWS.filter(function (r) { return r[1] === g; });
        var zeilen = teil.map(function (r) { return { idx: r[0], cells: [r[1], r[2].toFixed(4)] }; });
        var spalte = el('div', { class: 'v15-gruppe' }, [el('p', { class: 'v15-gruppe__t', text: 'Gruppe ' + g })]);
        if (z.s === 3) {
          spalte.appendChild(el('p', { class: 'v15-gruppe__w', text: f.n + ' = ' + wert(f, teil.map(function (r) { return r[2]; })) }));
        } else {
          spalte.appendChild(tabelle(cols, zeilen, { caption: 'Gruppe ' + g }));
          if (z.s === 2) spalte.appendChild(el('p', { class: 'v15-gruppe__w', text: f.n + ' = ' + wert(f, teil.map(function (r) { return r[2]; })) }));
        }
        gruppen.appendChild(spalte);
      });
      out.appendChild(gruppen);
      if (z.s === 3) {
        out.appendChild(el('p', { class: 'v15-pfeil', text: 'zusammengeführt zur Series (Index: maschine):' }));
        out.appendChild(tabelle(['durchmesser_mm'], ['D1', 'D2'].map(function (g) {
          return { idx: g, cells: [wert(f, GB_ROWS.filter(function (r) { return r[1] === g; }).map(function (r) { return r[2]; }))] };
        }), { idxHead: 'maschine', hiCol: 0, caption: 'Ergebnis von groupby' }));
      }
    }
    zeichne();
  }

  /* ══════════════════════════════════════════════════════════
     (C) Cp/Cpk-Rechner
     ══════════════════════════════════════════════════════════ */
  function initCpk(host) {
    var z = { mu: 20.0001, s: 0.0042 };
    var ctl = el('div', { class: 'k-controls v15-ctl' });
    var idM = nextId('v15-mu-'), idS = nextId('v15-s-');
    var sM = el('input', { type: 'range', id: idM, min: '19.985', max: '20.015', step: '0.0001', value: String(z.mu), 'aria-describedby': idM + '-o' });
    var oM = el('output', { id: idM + '-o', class: 'v15-o', 'aria-live': 'polite' });
    var sS = el('input', { type: 'range', id: idS, min: '0.003', max: '0.015', step: '0.00005', value: String(z.s), 'aria-describedby': idS + '-o' });
    var oS = el('output', { id: idS + '-o', class: 'v15-o', 'aria-live': 'polite' });
    ctl.appendChild(el('div', { class: 'k-field' }, [el('label', { for: idM, text: 'Mittelwert μ in mm' }), sM, oM]));
    ctl.appendChild(el('div', { class: 'k-field' }, [el('label', { for: idS, text: 'Standardabweichung σ in mm' }), sS, oS]));
    host.appendChild(ctl);
    var pre = el('div', { class: 'k-presets v15-ctl' }, [
      btn('Drehmaschine D1', 'k-btn k-btn--ghost k-btn--small', function () { setze(20.0001, 0.0042); }),
      btn('Drehmaschine D2', 'k-btn k-btn--ghost k-btn--small', function () { setze(20.0072, 0.00625); }),
      btn('D2 nachgestellt (μ zentriert)', 'k-btn k-btn--ghost k-btn--small', function () { setze(20.0000, 0.00625); })
    ]);
    host.appendChild(pre);
    var chart = el('div', { class: 'v15-chartwrap' });
    var calc = el('div', { class: 'v15-calc' });
    var verdict = el('div', { class: 'v15-verdict', role: 'status', 'aria-live': 'polite' });
    host.appendChild(chart); host.appendChild(verdict); host.appendChild(calc);
    sM.addEventListener('input', function () { z.mu = parseFloat(sM.value); zeichne(); });
    sS.addEventListener('input', function () { z.s = parseFloat(sS.value); zeichne(); });
    function setze(mu, s) { z.mu = mu; z.s = s; sM.value = String(mu); sS.value = String(s); zeichne(); }

    function zeichne() {
      oM.textContent = fmt(z.mu, 4) + ' mm'; oS.textContent = fmt(z.s, 5) + ' mm';
      var W = 640, H = 270, ml = 16, mr = 16, mt = 26, mb = 44, pw = W - ml - mr, ph = H - mt - mb;
      var x0 = 19.960, x1 = 20.040, ymax = 140;
      var px = function (x) { return ml + (x - x0) / (x1 - x0) * pw; };
      var py = function (y) { return mt + ph - Math.min(y, ymax) / ymax * ph; };
      var s = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'v15-svg', role: 'img', 'aria-label': 'Glockenkurve der Durchmesser mit Mittelwert ' + fmt(z.mu, 4) + ' mm und Standardabweichung ' + fmt(z.s, 4) + ' mm. Die Toleranzgrenzen liegen bei 19,980 und 20,020 mm. Flächen außerhalb sind rot schraffiert.' });
      var defs = sv('defs'); var pat = sv('pattern', { id: 'v15-schraff', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' });
      pat.appendChild(sv('rect', { width: 6, height: 6, fill: '#FBE3E6' })); pat.appendChild(sv('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: '#B00014', 'stroke-width': 2 }));
      defs.appendChild(pat); s.appendChild(defs);
      var N = 160, i, x, pts = [], teil = { u: [], m: [], o: [] };
      for (i = 0; i <= N; i++) { x = x0 + (x1 - x0) * i / N; pts.push([x, pdf(x, z.mu, z.s)]); }
      function flaeche(a, b, fill) {
        var d = 'M' + px(a) + ',' + py(0), k, xx;
        var n = 60;
        for (k = 0; k <= n; k++) { xx = a + (b - a) * k / n; d += ' L' + px(xx) + ',' + py(pdf(xx, z.mu, z.s)); }
        d += ' L' + px(b) + ',' + py(0) + ' Z';
        s.appendChild(sv('path', { d: d, fill: fill, stroke: 'none' }));
      }
      flaeche(x0, USG, 'url(#v15-schraff)'); flaeche(USG, OSG, '#E5E7EB'); flaeche(OSG, x1, 'url(#v15-schraff)');
      s.appendChild(sv('polyline', { points: pts.map(function (p) { return px(p[0]) + ',' + py(p[1]); }).join(' '), fill: 'none', stroke: '#1A1A1A', 'stroke-width': 2.4, 'stroke-linejoin': 'round' }));
      s.appendChild(sv('line', { x1: ml, x2: ml + pw, y1: py(0), y2: py(0), stroke: '#6B7280' }));
      [[USG, 'USG'], [OSG, 'OSG']].forEach(function (g) {
        s.appendChild(sv('line', { x1: px(g[0]), x2: px(g[0]), y1: mt - 4, y2: py(0), stroke: '#B00014', 'stroke-width': 2, 'stroke-dasharray': '6 4' }));
        s.appendChild(sv('text', { x: px(g[0]), y: mt - 8, 'text-anchor': 'middle', class: 'v15-lim' }, g[1] + ' ' + fmt(g[0], 3)));
      });
      s.appendChild(sv('line', { x1: px(z.mu), x2: px(z.mu), y1: py(pdf(z.mu, z.mu, z.s)), y2: py(0), stroke: '#1A1A1A', 'stroke-width': 1.6 }));
      s.appendChild(sv('text', { x: px(z.mu), y: py(0) + 16, 'text-anchor': 'middle', class: 'v15-tick' }, 'μ'));
      [19.97, 19.98, 19.99, 20.00, 20.01, 20.02, 20.03].forEach(function (t) {
        s.appendChild(sv('line', { x1: px(t), x2: px(t), y1: py(0), y2: py(0) + 4, stroke: '#6B7280' }));
        if (t !== 19.98 && t !== 20.02) s.appendChild(sv('text', { x: px(t), y: py(0) + 17, 'text-anchor': 'middle', class: 'v15-tick' }, fmt(t, 2)));
      });
      s.appendChild(sv('text', { x: ml + pw / 2, y: H - 6, 'text-anchor': 'middle', class: 'v15-axt' }, 'Durchmesser d in mm'));
      clear(chart); chart.appendChild(s);

      var c1 = cp(USG, OSG, z.s), c2 = cpk(USG, OSG, z.mu, z.s), p = ppm(USG, OSG, z.mu, z.s), b = bewertung(c2);
      clear(verdict);
      verdict.className = 'v15-verdict ' + (b.ok ? 'is-ok' : (b.stufe === 'bedingt' ? 'is-warn' : 'is-bad'));
      var h = el('p', { class: 'v15-verdict__h' }); h.appendChild(icon(b.ok ? 'check' : 'x'));
      h.appendChild(document.createTextNode(' Cpk = ' + fmt(c2, 2) + ': ' + b.text + '.'));
      verdict.appendChild(h);
      var rest = c2 < 0 ? 'Der Mittelwert liegt außerhalb der Toleranz: Mehr als die Hälfte der Teile ist Ausschuss.' : (c1 - c2 > 0.15 ? 'Cp ist deutlich größer als Cpk: Die Streuung würde passen, aber die Mitte ist verschoben. Zentrieren hilft.' : (Math.abs(c1 - c2) <= 0.15 ? 'Cp und Cpk liegen nah beieinander: Der Prozess liegt mittig, nur die Streuung entscheidet.' : ''));
      verdict.appendChild(el('p', { text: 'Erwartet außerhalb der Toleranz: ' + fmtPpm(p.gesamt) + ' ppm (' + fmt(p.gesamt / 1e4, 3) + ' %), davon ' + fmtPpm(p.oben) + ' ppm über OSG und ' + fmtPpm(p.unten) + ' ppm unter USG. ' + rest }));
      clear(calc);
      var dl = el('dl', { class: 'v15-dl' });
      [['Cp', fmt(c1, 2)], ['Cpk', fmt(c2, 2)], ['außerhalb', fmtPpm(p.gesamt) + ' ppm'], ['Richtwert', 'Kunde fordert oft 1,33']].forEach(function (a) { dl.appendChild(el('div', {}, [el('dt', { text: a[0] }), el('dd', { text: a[1] })])); });
      calc.appendChild(dl);
      calc.appendChild(el('p', { class: 'v15-formel', text: 'Cp = (OSG − USG) / (6σ) = (' + fmt(OSG, 3) + ' − ' + fmt(USG, 3) + ') / (6 · ' + fmt(z.s, 5) + ') = ' + fmt(c1, 2) }));
      calc.appendChild(el('p', { class: 'v15-formel', text: 'Cpk = min(OSG − μ; μ − USG) / (3σ) = min(' + fmt(OSG - z.mu, 4) + '; ' + fmt(z.mu - USG, 4) + ') / (3 · ' + fmt(z.s, 5) + ') = ' + fmt(c2, 2) }));
    }
    zeichne();
  }

  /* ══════════════════════════════════════════════════════════
     (D) Regelkarte
     ══════════════════════════════════════════════════════════ */
  function initRegelkarte(host) {
    var z = { m: 'D2', n: 0, tol: true, warn: false };
    var ctl = el('div', { class: 'k-controls v15-ctl' });
    var segM = segment(ctl, 'Maschine', ['D1', 'D2'], 1, function (i) { z.m = i === 0 ? 'D1' : 'D2'; z.n = 0; zeichne(); });
    var cbT = checkbox(ctl, 'Toleranzgrenzen zeigen', z.tol, function (v) { z.tol = v; zeichne(); });
    var cbW = checkbox(ctl, 'Warngrenzen ±2σ zeigen', z.warn, function (v) { z.warn = v; zeichne(); });
    host.appendChild(ctl);
    var nav = el('div', { class: 'k-presets v15-ctl' });
    var bN = btn('Nächste Stichprobe', 'k-btn k-btn--small', function () { z.n = Math.min(25, z.n + 1); zeichne(); });
    var bA = btn('Alle 25', 'k-btn k-btn--ghost k-btn--small', function () { z.n = 25; zeichne(); });
    var bR = btn('Von vorn', 'k-btn k-btn--ghost k-btn--small', function () { z.n = 0; zeichne(); });
    nav.appendChild(bN); nav.appendChild(bA); nav.appendChild(bR);
    host.appendChild(nav);
    var chart = el('div', { class: 'v15-chartwrap' });
    var msg = el('div', { class: 'v15-verdict', role: 'status', 'aria-live': 'polite' });
    host.appendChild(chart); host.appendChild(msg);

    function zeichne() {
      var m = MASCHINEN[z.m], pr = pruefe(m, z.n), sx = pr.sx;
      bN.disabled = z.n >= 25; bR.disabled = z.n === 0;
      var ymin = z.tol ? 19.975 : 19.990, ymax = z.tol ? 20.025 : 20.020, step = 0.005;
      var W = 640, H = 330, ml = 94, mr = 74, mt = 14, mb = 46, pw = W - ml - mr, ph = H - mt - mb;
      var px = function (k) { return ml + (k - 1) / 24 * pw; };
      var py = function (y) { return mt + ph - (y - ymin) / (ymax - ymin) * ph; };
      var s = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'v15-svg', role: 'img', 'aria-label': 'Regelkarte der Stichprobenmittel der Maschine ' + m.name + ': ' + z.n + ' von 25 Stichproben eingetragen. Mittellinie ' + fmt(m.mitte, 4) + ' mm, obere Eingriffsgrenze ' + fmt(m.oeg, 4) + ' mm, untere ' + fmt(m.ueg, 4) + ' mm. ' + (pr.aus.length ? 'Außerhalb der Eingriffsgrenzen: Stichprobe ' + pr.aus.join(', ') + '.' : 'Bisher kein Punkt außerhalb der Eingriffsgrenzen.') });
      s.appendChild(sv('rect', { x: ml, y: mt, width: pw, height: ph, fill: '#fff', stroke: '#9CA3AF' }));
      var t;
      for (t = Math.ceil(ymin / step - 1e-9) * step; t <= ymax + 1e-9; t += step) {
        s.appendChild(sv('line', { x1: ml, x2: ml + pw, y1: py(t), y2: py(t), stroke: '#E5E7EB' }));
        s.appendChild(sv('text', { x: ml - 6, y: py(t) + 4, 'text-anchor': 'end', class: 'v15-tick' }, fmt(t, 3)));
      }
      [1, 5, 10, 15, 20, 25].forEach(function (k) { s.appendChild(sv('text', { x: px(k), y: mt + ph + 16, 'text-anchor': 'middle', class: 'v15-tick' }, String(k))); });
      function linie(y, dash, farbe, name, w) {
        s.appendChild(sv('line', { x1: ml, x2: ml + pw, y1: py(y), y2: py(y), stroke: farbe, 'stroke-width': w || 1.6, 'stroke-dasharray': dash || '' }));
        s.appendChild(sv('text', { x: ml + pw + 6, y: py(y) + 4, class: 'v15-lim', fill: farbe === '#6B7280' ? '#4B5563' : farbe }, name));
      }
      if (z.tol) { linie(OSG, '8 4', '#B00014', 'OSG', 2); linie(USG, '8 4', '#B00014', 'USG', 2); }
      if (z.warn) { linie(m.mitte + 2 * sx, '2 4', '#6B7280', '+2σ', 1.3); linie(m.mitte - 2 * sx, '2 4', '#6B7280', '−2σ', 1.3); }
      linie(m.oeg, '', '#1A1A1A', 'OEG', 1.8); linie(m.ueg, '', '#1A1A1A', 'UEG', 1.8);
      linie(m.mitte, '10 3 2 3', '#1A1A1A', 'Mitte', 1.4);
      var k, pts = [];
      for (k = 1; k <= z.n; k++) pts.push(px(k) + ',' + py(m.mittel[k - 1]));
      if (pts.length > 1) s.appendChild(sv('polyline', { points: pts.join(' '), fill: 'none', stroke: '#6B7280', 'stroke-width': 1.2 }));
      for (k = 1; k <= z.n; k++) {
        var x = px(k), y = py(m.mittel[k - 1]), aus = pr.aus.indexOf(k) >= 0, wa = pr.warn.indexOf(k) >= 0, ru = pr.run.indexOf(k) >= 0;
        if (aus) { s.appendChild(sv('rect', { x: x - 6, y: y - 6, width: 12, height: 12, fill: '#E2001A', stroke: '#7A0010', 'stroke-width': 1.5, transform: 'rotate(45 ' + x + ' ' + y + ')' })); s.appendChild(sv('text', { x: x, y: y - 11, 'text-anchor': 'middle', class: 'v15-bad' }, String(k))); }
        else if (ru) s.appendChild(sv('polygon', { points: (x - 6) + ',' + (y + 5) + ' ' + (x + 6) + ',' + (y + 5) + ' ' + x + ',' + (y - 7), fill: '#B00014' }));
        else if (wa && z.warn) s.appendChild(sv('circle', { cx: x, cy: y, r: 5, fill: '#fff', stroke: '#1A1A1A', 'stroke-width': 2 }));
        else s.appendChild(sv('circle', { cx: x, cy: y, r: 3.6, fill: k === z.n ? '#E2001A' : '#1A1A1A' }));
      }
      s.appendChild(sv('text', { x: ml + pw / 2, y: H - 6, 'text-anchor': 'middle', class: 'v15-axt' }, 'Stichprobe Nr.'));
      s.appendChild(sv('text', { transform: 'translate(12 ' + (mt + ph / 2) + ') rotate(-90)', 'text-anchor': 'middle', class: 'v15-axt' }, 'Stichprobenmittel x̄ in mm'));
      clear(chart); chart.appendChild(s);

      clear(msg);
      var schlecht = pr.aus.length > 0 || pr.run.length > 0;
      msg.className = 'v15-verdict ' + (z.n === 0 ? '' : (schlecht ? 'is-bad' : 'is-ok'));
      if (z.n === 0) { msg.appendChild(el('p', { text: 'Maschine ' + m.name + ': Mittellinie ' + fmt(m.mitte, 5) + ' mm, Eingriffsgrenzen ' + fmt(m.ueg, 5) + ' bis ' + fmt(m.oeg, 5) + ' mm (aus den Stichproben 1 bis 15). Drücke „Nächste Stichprobe“.' })); return; }
      var cur = m.mittel[z.n - 1];
      var h = el('p', { class: 'v15-verdict__h' }); h.appendChild(icon(schlecht ? 'x' : 'check'));
      h.appendChild(document.createTextNode(' Stichprobe ' + z.n + ': x̄ = ' + fmt(cur, 5) + ' mm. ' + (pr.aus.indexOf(z.n) >= 0 ? (cur > m.oeg ? 'Über der oberen Eingriffsgrenze: eingreifen!' : 'Unter der unteren Eingriffsgrenze: eingreifen!') : 'Innerhalb der Eingriffsgrenzen.')));
      msg.appendChild(h);
      var ul = el('ul', { class: 'v15-liste' });
      pr.aus.forEach(function (k) {
        var v = m.mittel[k - 1];
        ul.appendChild(el('li', { text: 'Stichprobe ' + k + ': ' + fmt(v, 5) + ' mm liegt ' + (v > m.oeg ? 'über der oberen Eingriffsgrenze (' + fmt(m.oeg, 5) + ' mm).' : 'unter der unteren Eingriffsgrenze (' + fmt(m.ueg, 5) + ' mm).') }));
      });
      pr.run.forEach(function (k) { ul.appendChild(el('li', { text: 'Stichprobe ' + k + ': ' + RUN + ' Punkte in Folge auf einer Seite der Mittellinie (Run-Regel).' })); });
      if (ul.childNodes.length) msg.appendChild(ul);
      msg.appendChild(el('p', { class: 'k-small', text: 'Folge auf einer Seite der Mittellinie: ' + pr.lauf + ' Punkt' + (pr.lauf === 1 ? '' : 'e') + ' ' + (pr.seite > 0 ? 'über' : 'unter') + ' der Mitte (die Run-Regel meldet ab ' + RUN + ').' + (z.warn && pr.warn.length ? ' Zwischen ±2σ und ±3σ: Stichprobe ' + pr.warn.join(', ') + ' (ein Hinweis, noch kein Alarm).' : '') }));
      if (z.tol && schlecht) msg.appendChild(el('p', { class: 'k-small', text: 'Vergleich: Die Toleranz (' + fmt(USG, 3) + ' bis ' + fmt(OSG, 3) + ' mm) ist viel weiter als die Eingriffsgrenzen. Die Regelkarte meldet die Veränderung des Prozesses, auch wenn die Mittelwerte noch weit innerhalb der Toleranz liegen.' }));
    }
    zeichne();
  }

  /* ══════════════════════════════════════════════════════════
     (E) PAP: Regelkarte prüfen, Cpk bewerten
     ══════════════════════════════════════════════════════════ */
  function initPap(host) {
    var K = root.KursPAP;
    if (!K || !K.P) { host.appendChild(el('p', { class: 'k-small k-muted', text: 'Der Programmablaufplan braucht pap-engine.js.' })); return; }
    var P = K.P, art = host.getAttribute('data-pap') || 'regelkarte', spec, label;
    if (art === 'bewertung') {
      spec = [
        P.start(), P.io('Eingabe: cpk'),
        P.iff('cpk ≥ 1,67?', [P.io('Ausgabe: sehr fähig')], [
          P.iff('cpk ≥ 1,33?', [P.io('Ausgabe: fähig')], [
            P.iff('cpk ≥ 1,0?', [P.io('Ausgabe: bedingt fähig')], [P.io('Ausgabe: nicht fähig')])
          ])
        ]),
        P.end()
      ];
      label = 'Programmablaufplan: Cpk einlesen und in drei verschachtelten Verzweigungen bewerten: ab 1,67 sehr fähig, ab 1,33 fähig, ab 1,0 bedingt fähig, sonst nicht fähig.';
    } else {
      spec = [
        P.start(), P.op('mitte, oeg, ueg bestimmen'), P.op('auffaellig = [ ]'),
        P.whil('weitere Stichprobe nr?', [
          P.op('m = mittel[nr]'),
          P.iff('m > oeg oder m < ueg?', [P.op('nr + 1 an auffaellig anhängen')], [])
        ]),
        P.io('Ausgabe: auffaellig'), P.end()
      ];
      label = 'Programmablaufplan: Mittellinie und Eingriffsgrenzen bestimmen, leere Liste anlegen; in einer Schleife über alle Stichproben das Mittel holen und prüfen, ob es außerhalb der Grenzen liegt, und dann die Nummer der Stichprobe in die Liste aufnehmen; am Ende die Liste ausgeben.';
    }
    var d = el('div', { class: 'v15-papbox' });
    d.innerHTML = K.figure(spec, { label: label });
    host.appendChild(d);
  }

  function init() {
    var map = { dataframe: initDataFrame, groupby: initGroupby, cpk: initCpk, regelkarte: initRegelkarte, 'pap-v15': initPap };
    Object.keys(map).forEach(function (k) { Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="' + k + '"]'), map[k]); });
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = core;
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})(typeof window !== 'undefined' ? window : globalThis);
