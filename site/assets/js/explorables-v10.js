/* =============================================================
   explorables-v10.js – interaktive Bausteine für V10 „Wie funktioniert KI?“ (reines JS, kein Framework)
   (A) Mini-Sprachmodell: Korpus wählen/ergänzen, Tokens, Nachfolger-Tabelle (Zählung, Wahrscheinlichkeit mit
       Temperatur), Text Wort für Wort erzeugen (Zufallsband, Seed, Kontextfenster 1 oder 2 Wörter), Faktencheck.
   (B) Tokenizer-Spielplatz: Zeichen, Wörter, Teilwörter (greedy, Vokabular editierbar).
   (C) List Comprehension Schritt für Schritt: Kurzform und gleichwertige Schleife nebeneinander.
   (D) Ablauf „Text erzeugen“ als Programmablaufplan (KursPAP) mit Code und Zustand.
   Der Rechenkern ist ohne DOM per node testbar (module.exports).
   ============================================================= */
(function (root) {
  'use strict';

  /* ── Kern (ohne DOM) ─────────────────────────────────────── */
  /* Text in Tokens: Kleinbuchstaben, Satzzeichen als eigenes Token (wie tokenisiere() im Labor) */
  function tokenize(text) {
    var t = String(text).toLowerCase().replace(/([.,;:!?])/g, ' $1 ').replace(/\s+/g, ' ').trim();
    return t ? t.split(' ') : [];
  }
  /* Bigramm- (k = 1) oder Trigramm-Tabelle (k = 2): Kontext -> { words, counts } in Reihenfolge des ersten Auftretens */
  function train(tokens, k) {
    var tab = Object.create(null), keys = [], i, key, nxt, e, j;
    for (i = k; i < tokens.length; i++) {
      key = tokens.slice(i - k, i).join(' ');
      nxt = tokens[i];
      if (!tab[key]) { tab[key] = { words: [], counts: [] }; keys.push(key); }
      e = tab[key];
      j = e.words.indexOf(nxt);
      if (j < 0) { e.words.push(nxt); e.counts.push(1); } else e.counts[j]++;
    }
    return { tab: tab, keys: keys, k: k };
  }
  function sum(a) { var s = 0; a.forEach(function (x) { s += x; }); return s; }
  /* Wahrscheinlichkeiten mit Temperatur: p^(1/T), normiert. T <= 0.05 gilt als „immer das häufigste Wort“. */
  function probs(counts, T) {
    var tot = sum(counts), p = counts.map(function (c) { return c / tot; }), m, n, e, s;
    if (T <= 0.05) {
      m = Math.max.apply(null, p);
      n = p.filter(function (x) { return x === m; }).length;
      return p.map(function (x) { return x === m ? 1 / n : 0; });
    }
    e = p.map(function (x) { return Math.pow(x, 1 / T); });
    s = sum(e);
    return e.map(function (x) { return x / s; });
  }
  /* Zufallsgenerator mit Seed (mulberry32): gleicher Seed, gleiche Folge */
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  /* Würfelband: r in [0,1) wählt das Stück, in das r fällt */
  function pick(p, r) {
    var acc = 0, i;
    for (i = 0; i < p.length; i++) { acc += p[i]; if (r < acc) return i; }
    for (i = p.length - 1; i >= 0; i--) if (p[i] > 0) return i;
    return 0;
  }
  /* Kontext für den nächsten Zug: bei Kontextfenster 2 die letzten zwei Wörter, sonst (oder als Rückfall) das letzte Wort */
  function context(models, order, sent) {
    var key, m;
    if (order >= 2 && sent.length >= 2) {
      key = sent.slice(-2).join(' ');
      if (models[2].tab[key]) return { key: key, entry: models[2].tab[key], order: 2 };
    }
    key = sent[sent.length - 1];
    m = models[1].tab[key];
    return m ? { key: key, entry: m, order: 1 } : null;
  }
  /* Eine kleine Faktentabelle, gegen die erzeugte Sätze geprüft werden (nur Richtwerte, vereinfacht) */
  var MOMENT = { m8: 25, m10: 49, m12: 86 };
  var NORM = { passfeder: 6885, lager: 625, schraube: 933, sicherungsring: 471 };
  function checkFacts(text) {
    var t = String(text).toLowerCase(), m;
    m = /schraube (m\d+) braucht (\d+) nm/.exec(t);
    if (m && MOMENT[m[1]] !== undefined) {
      var soll = MOMENT[m[1]], ist = parseInt(m[2], 10), M = m[1].toUpperCase();
      return ist === soll
        ? { ok: true, text: 'Faktencheck: stimmt. Für eine Schraube ' + M + ' (Festigkeitsklasse 8.8) gibt die Tabelle ' + soll + ' Nm an.' }
        : { ok: false, text: 'Faktencheck: falsch. Für ' + M + ' (8.8) gibt die Tabelle ' + soll + ' Nm an, das Modell sagt ' + ist + ' Nm. Der Satz klingt trotzdem sicher und flüssig.' };
    }
    m = /(passfeder|lager|schraube|sicherungsring) ist in din (\d+) genormt/.exec(t);
    if (m && NORM[m[1]] !== undefined) {
      var s2 = NORM[m[1]], i2 = parseInt(m[2], 10), N = m[1].charAt(0).toUpperCase() + m[1].slice(1);
      return i2 === s2
        ? { ok: true, text: 'Faktencheck: stimmt. ' + N + ': DIN ' + s2 + '.' }
        : { ok: false, text: 'Faktencheck: falsch. ' + N + ' ist in DIN ' + s2 + ' genormt, nicht in DIN ' + i2 + '. Die Nummer gibt es wirklich, sie gehört nur zu einem anderen Bauteil.' };
    }
    return null;
  }
  /* Teilwörter: für jedes Wort das längste passende Stück aus dem Vokabular, sonst ein einzelnes Zeichen */
  var WORTRE = /[A-Za-zÄÖÜäöüß0-9]+|[^\sA-Za-zÄÖÜäöüß0-9]/g;
  function parseVocab(text) {
    var seen = Object.create(null), out = [];
    String(text).split(/[,\n]/).forEach(function (s) {
      s = s.trim().toLowerCase();
      if (s && !seen[s]) { seen[s] = 1; out.push(s); }
    });
    return out;
  }
  function subwords(text, vocab) {
    var res = [], words = String(text).match(WORTRE) || [];
    var maxLen = 0;
    vocab.forEach(function (v) { if (v.length > maxLen) maxLen = v.length; });
    words.forEach(function (w) {
      var i = 0, low = w.toLowerCase(), l, found;
      while (i < w.length) {
        found = null;
        for (l = Math.min(maxLen, w.length - i); l >= 1; l--) {
          if (vocab.indexOf(low.substr(i, l)) >= 0) { found = l; break; }
        }
        if (found) { res.push({ s: w.substr(i, found), id: vocab.indexOf(low.substr(i, found)) + 1, known: true }); i += found; }
        else { res.push({ s: w.charAt(i), id: 1000 + w.charCodeAt(i), known: false }); i += 1; }
      }
    });
    return res;
  }
  /* Python-Schreibweise für die List-Comprehension-Anzeige */
  function pyv(x) { return typeof x === 'string' ? "'" + x + "'" : String(x); }
  var LC = [
    { id: 'quad', title: 'Quadrate berechnen', list: 'zahlen', v: 'x', items: [1, 2, 3, 4], expr: 'x * x', cond: null, f: function (x) { return x * x; } },
    { id: 'upper', title: 'Texte umwandeln', list: 'woerter', v: 'w', items: ['welle', 'lager', 'zahnrad'], expr: 'w.upper()', cond: null, f: function (w) { return w.toUpperCase(); } },
    { id: 'tol', title: 'Filtern: Werte außerhalb der Toleranz', list: 'messungen', v: 'd', items: [12.004, 11.998, 12.019, 12.011], expr: 'd', cond: 'd < 12.000 or d > 12.018', test: function (d) { return d < 12.000 || d > 12.018; }, f: function (d) { return d; } },
    { id: 'leer', title: 'Filtern: leere Tokens entfernen', list: 'woerter', v: 'w', items: ['das', 'zahnrad', '', 'treibt', '', '.'], expr: 'w', cond: 'w != ""', test: function (w) { return w !== ''; }, f: function (w) { return w; } }
  ];
  function lcLoopCode(d) {
    var lines = ['ergebnis = []', 'for ' + d.v + ' in ' + d.list + ':'];
    if (d.cond) lines.push('    if ' + d.cond + ':');
    lines.push((d.cond ? '        ' : '    ') + 'ergebnis.append(' + d.expr + ')');
    return lines;
  }
  function lcSteps(d) {
    var st = [], res = [], i, it, ok, out, hasIf = !!d.cond, ifLine = 3, appLine = hasIf ? 4 : 3;
    st.push({ line: 1, active: '', i: -1, res: [], msg: 'Zuerst entsteht eine leere Ergebnisliste. Bei der Kurzform passiert das unsichtbar, die eckigen Klammern legen sie an.' });
    for (i = 0; i < d.items.length; i++) {
      it = d.items[i];
      st.push({ line: 2, active: 'for', i: i, res: res.slice(), msg: 'Das nächste Element: ' + d.v + ' ist jetzt ' + pyv(it) + ' (Index ' + i + ').' });
      ok = hasIf ? d.test(it) : true;
      if (hasIf) {
        st.push({ line: ifLine, active: 'if', i: i, res: res.slice(), cond: ok, msg: 'Bedingung ' + d.cond + ' mit ' + d.v + ' = ' + pyv(it) + ': ' + (ok ? 'wahr, das Element wird übernommen.' : 'falsch, das Element wird übersprungen und kommt nicht in die Ergebnisliste.') });
      }
      if (ok) {
        out = d.f(it);
        res.push(out);
        st.push({ line: appLine, active: 'expr', i: i, res: res.slice(), added: true, msg: 'Der Ausdruck ' + d.expr + ' ergibt ' + pyv(out) + '. Das Ergebnis wird hinten an die Ergebnisliste angehängt.' });
      }
    }
    st.push({ line: 0, active: '', i: d.items.length, res: res.slice(), done: true, msg: 'Kein Element mehr übrig. Ergebnis: [' + res.map(pyv).join(', ') + ']. Die Kurzform liefert genau dasselbe wie die Schleife.' });
    return st;
  }
  /* Ablauf „Text erzeugen“ aus dem Labor-Beispiel (seed 4): fester Weg, aus dem Modell abgeleitet */
  var BEISPIEL_TEXT = 'Die Welle trägt das Zahnrad. Das Zahnrad treibt die Welle an.\nDas Lager stützt die Welle. Die Schraube hält das Lager.\nDas Lager braucht Fett. Die Welle braucht eine Passfeder.';
  var BEISPIEL_SEQ = ['das', 'zahnrad', 'treibt', 'die', 'schraube', 'hält', 'das', 'zahnrad', '.'];
  function erzeugSteps(model, seq, maxSchritte) {
    var st = [], sentence = [seq[0]], prevLoop = ['init', 'loop', ''], k, from, e, parts, w;
    st.push({ nodes: ['init'], edges: [['start', 'init', '']], lines: [1, 2], wort: seq[0], satz: sentence.slice(), schritt: 0, msg: 'Startwort setzen: wort = "' + seq[0] + '" und satz = ["' + seq[0] + '"]. Noch ist nichts gezogen.' });
    for (k = 1; k < seq.length; k++) {
      from = seq[k - 1]; w = seq[k]; e = model.tab[from];
      parts = e.words.map(function (x, j) { return x + ' (' + e.counts[j] + 'x)'; }).join(', ');
      st.push({ nodes: ['loop'], edges: [prevLoop], lines: [3], wort: from, satz: sentence.slice(), schritt: k - 1, msg: 'Prüfen: wort ist „' + from + '“, also kein Punkt, und erst ' + (k - 1) + ' von ' + maxSchritte + ' Wörtern sind gezogen. Antwort: ja, weitermachen.' });
      sentence.push(w);
      st.push({ nodes: ['zieh', 'app'], edges: [['loop', 'zieh', 'ja'], ['zieh', 'app', '']], lines: [4, 5], wort: w, satz: sentence.slice(), schritt: k, msg: 'Im Training folgte auf „' + from + '“: ' + parts + '. Zufällig gezogen: „' + w + '“. Das Wort wird an satz angehängt.' });
      prevLoop = ['app', 'loop', ''];
    }
    st.push({ nodes: ['loop'], edges: [prevLoop], lines: [6, 7], wort: '.', satz: sentence.slice(), schritt: seq.length - 1, msg: 'Prüfen: wort ist ".", der Punkt ist erreicht. Antwort: nein, die Schleife endet. (Im Code erledigt das if mit break.)' });
    st.push({ nodes: ['loop', 'out', 'end'], edges: [['loop', 'out', 'nein'], ['out', 'end', '']], lines: [8], wort: '.', satz: sentence.slice(), schritt: seq.length - 1, done: true, msg: 'Ausgabe: die Wörter von satz, mit Leerzeichen verbunden: ' + sentence.join(' ') });
    return st;
  }
  var core = { tokenize: tokenize, train: train, probs: probs, mulberry32: mulberry32, pick: pick, context: context, checkFacts: checkFacts, parseVocab: parseVocab, subwords: subwords, LC: LC, lcSteps: lcSteps, lcLoopCode: lcLoopCode, erzeugSteps: erzeugSteps, BEISPIEL_TEXT: BEISPIEL_TEXT, BEISPIEL_SEQ: BEISPIEL_SEQ };
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
  function field(label, input) { var id = 'v10f' + (++uid); input.id = id; return el('div', { class: 'k-field' }, [el('label', { 'for': id, text: label }), input]); }
  function reduced() { return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function dec(x, n) { return x.toFixed(n).replace('.', ','); }
  function pct(p) { var v = p * 100; return (v >= 9.95 || v === 0 ? v.toFixed(0) : v.toFixed(1).replace('.', ',')) + ' %'; }
  function player(host, o) {
    var bBack = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Zurück' });
    var bNext = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Nächster Schritt' });
    var bPlay = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Abspielen', 'aria-pressed': 'false' });
    var bReset = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Neu starten' });
    var count = el('span', { class: 'v10-count k-small k-muted', 'aria-hidden': 'true' });
    host.appendChild(el('div', { class: 'k-presets v10-bar-ctl', role: 'group', 'aria-label': 'Ablauf steuern' }, [bNext, bBack, bPlay, bReset, count]));
    var timer = null;
    function stop() { if (timer) { clearInterval(timer); timer = null; } bPlay.textContent = 'Abspielen'; bPlay.setAttribute('aria-pressed', 'false'); }
    bNext.addEventListener('click', function () { stop(); o.next(); });
    bBack.addEventListener('click', function () { stop(); o.back(); });
    bReset.addEventListener('click', function () { stop(); o.reset(); });
    bPlay.addEventListener('click', function () {
      if (timer) { stop(); return; }
      if (o.done()) o.reset();
      bPlay.textContent = 'Pause'; bPlay.setAttribute('aria-pressed', 'true');
      timer = setInterval(function () { o.next(); if (o.done()) stop(); }, o.interval || 1100);
    });
    return { stop: stop, count: count, bBack: bBack, bNext: bNext, bPlay: bPlay };
  }

  /* ══════════════════════════════════════════════════════════
     (A) Mini-Sprachmodell
     ══════════════════════════════════════════════════════════ */
  var PRESETS = [
    { id: 'welle', name: 'Welle und Lager', text: BEISPIEL_TEXT, start: 'das', seed: 4 },
    { id: 'moment', name: 'Anzugsmomente', text: 'Die Schraube M8 braucht 25 Nm. Die Schraube M10 braucht 49 Nm. Die Schraube M12 braucht 86 Nm.\nDie Schraube M8 hält das Lager. Die Schraube M12 hält das Lager.', start: 'die', seed: 2 },
    { id: 'normen', name: 'Normen', text: 'Die Passfeder ist in DIN 6885 genormt. Das Lager ist in DIN 625 genormt.\nDie Schraube ist in DIN 933 genormt. Der Sicherungsring ist in DIN 471 genormt.', start: 'die', seed: 4 }
  ];
  function initMiniLM(host) {
    var S = { tokens: [], models: null, vocab: [], order: 1, T: 1, seed: 4, maxLen: 8, sent: [], rng: null, last: null, done: false, reason: '', timer: null, preset: 0 };
    var presetBox = el('div', { class: 'k-presets', role: 'group', 'aria-label': 'Trainingstext wählen' });
    var presetBtns = PRESETS.map(function (p, i) {
      var b = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: p.name, 'aria-pressed': i === 0 ? 'true' : 'false' });
      b.addEventListener('click', function () { S.preset = i; ta.value = p.text; if (p.seed !== undefined) { S.seed = p.seed; seedIn.value = String(p.seed); } presetBtns.forEach(function (x, j) { x.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); retrain(true); });
      presetBox.appendChild(b); return b;
    });
    var ta = el('textarea', { class: 'v10-corpus', 'aria-label': 'Trainingstext, du kannst eigene Sätze ergänzen', spellcheck: 'false' });
    ta.value = PRESETS[0].text;
    var bTrain = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Modell trainieren' });
    var stats = el('p', { class: 'v10-stats', role: 'status', 'aria-live': 'polite' });
    var tokBox = el('ul', { class: 'v10-chips', 'aria-label': 'Tokens des Trainingstextes' });

    var startSel = el('select');
    var seg = el('div', { class: 'k-seg', role: 'group', 'aria-label': 'Kontextfenster' });
    var b1 = el('button', { type: 'button', 'aria-pressed': 'true', text: '1 Wort' });
    var b2 = el('button', { type: 'button', 'aria-pressed': 'false', text: '2 Wörter' });
    seg.appendChild(b1); seg.appendChild(b2);
    var tIn = el('input', { type: 'range', min: '0.1', max: '3', step: '0.1', value: '1' });
    var tOut = el('output', { class: 'k-small' });
    var mIn = el('input', { type: 'range', min: '3', max: '20', step: '1', value: '8' });
    var mOut = el('output', { class: 'k-small' });
    var seedIn = el('input', { type: 'number', min: '0', max: '99999', step: '1', value: '4' });
    var bDice = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Neu würfeln' });
    var bStep = el('button', { type: 'button', class: 'k-btn k-btn--small', text: 'Ein Wort ziehen' });
    var bPlay = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: 'Abspielen', 'aria-pressed': 'false' });
    var bRestart = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', text: 'Neu starten' });
    var sentBox = el('ul', { class: 'v10-chips v10-chips--sentence', 'aria-label': 'Erzeugter Text' });
    var msg = el('p', { class: 'v10-msg', role: 'status', 'aria-live': 'polite' });
    var band = el('div', { class: 'v10-band', role: 'img', 'aria-label': 'Würfelband' });
    var fact = el('p', { class: 'v10-fact', role: 'status', 'aria-live': 'polite', hidden: '' });
    var ctxSel = el('select');
    var tbody = el('tbody');
    var ctxNote = el('p', { class: 'v10-note k-muted' });

    var n0 = ++uid;
    tIn.id = 'v10t' + n0; mIn.id = 'v10m' + n0;
    var ctl = el('div', { class: 'v10-ctl' }, [
      el('div', { class: 'v10-row' }, [field('Startwort', startSel), el('div', { class: 'k-field' }, [el('span', { class: 'v10-lbl', text: 'Kontextfenster' }), seg])]),
      el('div', { class: 'k-field' }, [el('label', { 'for': tIn.id, text: 'Temperatur T' }), tIn, tOut]),
      el('div', { class: 'k-field' }, [el('label', { 'for': mIn.id, text: 'Höchstens so viele neue Wörter' }), mIn, mOut]),
      el('div', { class: 'v10-row' }, [field('Seed (Startwert des Zufalls)', seedIn), bDice]),
      el('div', { class: 'k-presets', role: 'group', 'aria-label': 'Text erzeugen' }, [bStep, bPlay, bRestart])
    ]);

    host.appendChild(el('h4', { class: 'v10-h', text: '1. Trainingstext' }));
    host.appendChild(el('p', { class: 'k-small k-muted v10-note', text: 'Wähle einen Text oder ändere ihn: Du kannst eigene Sätze ergänzen. Nach jeder Änderung lernt das Modell neu.' }));
    host.appendChild(presetBox);
    host.appendChild(ta);
    host.appendChild(el('div', { class: 'k-presets' }, [bTrain]));
    host.appendChild(stats);
    host.appendChild(el('h4', { class: 'v10-h', text: '2. Tokens' }));
    host.appendChild(tokBox);
    var tableHost = el('div', { class: 'v10-tablewrap' }, [
      el('table', { class: 'v10-table' }, [
        el('caption', { class: 'k-sr', text: 'Nachfolger des gewählten Kontexts mit Zählung und Wahrscheinlichkeit' }),
        el('thead', {}, [el('tr', {}, [el('th', { scope: 'col', text: 'Nachfolger' }), el('th', { scope: 'col', text: 'Zählung' }), el('th', { scope: 'col', text: 'Wahrscheinlichkeit bei T' })])]),
        tbody])
    ]);
    host.appendChild(el('div', { class: 'v10-grid' }, [
      el('div', {}, [el('h4', { class: 'v10-h', text: '3. Text erzeugen' }), ctl, el('p', { class: 'v10-lbl', text: 'Erzeugter Text' }), sentBox, msg, band, fact]),
      el('div', {}, [el('h4', { class: 'v10-h', text: '4. Nachfolger-Tabelle' }), field('Kontext (Wort davor)', ctxSel), ctxNote, tableHost])
    ]));

    /* Modell */
    function retrain(resetStart) {
      stopPlay();
      S.tokens = core.tokenize(ta.value);
      S.models = { 1: core.train(S.tokens, 1), 2: core.train(S.tokens, 2) };
      var seen = Object.create(null); S.vocab = [];
      S.tokens.forEach(function (t) { if (!seen[t]) { seen[t] = 1; S.vocab.push(t); } });
      var ok = S.tokens.length >= 2;
      stats.textContent = '';
      if (ok) {
        stats.appendChild(document.createTextNode('Das Modell hat '));
        [[S.tokens.length, ' Tokens'], [S.vocab.length, ' verschiedene Wörter (Vokabular)'], [S.models[1].keys.length, ' Kontexte']].forEach(function (x, i) {
          stats.appendChild(el('strong', { text: String(x[0]) })); stats.appendChild(document.createTextNode(x[1] + (i < 2 ? ', ' : ' gelernt.')));
        });
      } else stats.textContent = 'Zu wenig Text: Das Modell braucht mindestens zwei Tokens.';
      [startSel, b1, b2, tIn, mIn, seedIn, bDice, bStep, bPlay, bRestart, ctxSel].forEach(function (n) { n.disabled = !ok; });
      var prev = startSel.value, def = PRESETS[S.preset] && ta.value === PRESETS[S.preset].text ? PRESETS[S.preset].start : null;
      startSel.textContent = '';
      S.vocab.forEach(function (w) { startSel.appendChild(el('option', { value: w, text: w })); });
      if (resetStart && def && S.vocab.indexOf(def) >= 0) startSel.value = def;
      else if (S.vocab.indexOf(prev) >= 0) startSel.value = prev;
      tokBox.textContent = '';
      S.tokens.slice(0, 60).forEach(function (t) { tokBox.appendChild(el('li', { class: 'v10-chip v10-chip--tok', text: t })); });
      if (S.tokens.length > 60) tokBox.appendChild(el('li', { class: 'v10-chip', text: '… und ' + (S.tokens.length - 60) + ' weitere' }));
      restart();
    }
    function ctxOpts() {
      var keys = S.models ? S.models[S.order].keys.slice() : [];
      var c = ok2() ? core.context(S.models, S.order, S.sent) : null;
      if (c && keys.indexOf(c.key) < 0) keys.push(c.key);
      return keys;
    }
    function ok2() { return S.tokens.length >= 2 && S.sent.length > 0; }
    function restart() {
      stopPlay();
      S.sent = S.tokens.length >= 2 ? [startSel.value] : [];
      S.rng = core.mulberry32(S.seed); S.last = null; S.done = false; S.reason = '';
      fact.hidden = true; fact.textContent = '';
      msg.className = 'v10-msg'; msg.textContent = '';
      render();
    }
    function step() {
      if (S.done || !S.sent.length) return;
      var c = core.context(S.models, S.order, S.sent);
      if (!c) { S.done = true; S.reason = 'Zu „' + S.sent[S.sent.length - 1] + '“ hat das Modell keinen Nachfolger gelernt (es stand im Text ganz am Ende). Der Text endet hier.'; render(); return; }
      var p = core.probs(c.entry.counts, S.T), r = S.rng(), idx = core.pick(p, r), w = c.entry.words[idx];
      S.last = { key: c.key, order: c.order, idx: idx, r: r, p: p, entry: c.entry, word: w };
      S.sent.push(w);
      if (w === '.') { S.done = true; S.reason = 'Der Punkt ist gezogen: Der Satz ist zu Ende.'; }
      else if (S.sent.length - 1 >= S.maxLen) { S.done = true; S.reason = 'Die Höchstlänge von ' + S.maxLen + ' neuen Wörtern ist erreicht.'; }
      render();
    }
    function render() {
      /* erzeugter Text */
      sentBox.textContent = '';
      S.sent.forEach(function (w, i) {
        var cur = i === S.sent.length - 1 && i > 0;
        sentBox.appendChild(el('li', { class: 'v10-chip' + (cur ? ' is-cur is-new' : ''), text: w }));
      });
      /* Meldung, Band */
      band.textContent = ''; band.className = 'v10-band';
      var L = S.last;
      if (L) {
        var parts = L.entry.words.map(function (w, i) { return w + ' (' + pct(L.p[i]) + ')'; }).join(', ');
        msg.textContent = 'Nach „' + L.key + '“ gibt es ' + L.entry.words.length + ' Nachfolger: ' + parts + '. Zufallszahl ' + dec(L.r, 2) + ' führt zu „' + L.word + '“.' + (S.done ? ' ' + S.reason : '');
        msg.className = 'v10-msg is-on' + (S.done ? ' is-ok' : '');
        L.entry.words.forEach(function (w, i) {
          if (L.p[i] <= 0) return;
          var sg = el('span', { class: 'v10-band__seg' + (i === L.idx ? ' is-drawn' : ''), title: w + ': ' + pct(L.p[i]), text: L.p[i] > 0.12 ? w : '' });
          sg.style.flex = '0 0 ' + (L.p[i] * 100) + '%';
          band.appendChild(sg);
        });
        var mk = el('span', { class: 'v10-band__mark', 'data-r': dec(L.r, 2), 'aria-hidden': 'true' });
        mk.style.left = (L.r * 100) + '%';
        band.appendChild(mk);
        band.setAttribute('aria-label', 'Würfelband: Zufallszahl ' + dec(L.r, 2) + ' fällt auf „' + L.word + '“');
      } else if (S.done) {
        msg.textContent = S.reason; msg.className = 'v10-msg is-on';
        band.className = 'v10-band v10-band--empty'; band.textContent = 'kein Zug';
      } else {
        msg.textContent = S.sent.length ? 'Startwort „' + S.sent[0] + '“. Drück „Ein Wort ziehen“: Das Modell würfelt den Nachfolger.' : '';
        msg.className = 'v10-msg' + (S.sent.length ? ' is-on' : '');
        band.className = 'v10-band v10-band--empty'; band.textContent = 'Hier erscheint gleich das Würfelband des ersten Zugs.';
      }
      /* Faktencheck */
      if (S.done && S.sent.length > 1) {
        var f = core.checkFacts(S.sent.join(' '));
        if (f) { fact.hidden = false; fact.textContent = f.text; fact.className = 'v10-fact ' + (f.ok ? 'is-ok' : 'is-bad'); } else fact.hidden = true;
      } else fact.hidden = true;
      /* Tabelle */
      var opts = ctxOpts(), c = S.sent.length ? core.context(S.models, S.order, S.sent) : null;
      var showKey = S.userPick || (S.last ? S.last.key : (c ? c.key : (opts[0] || '')));
      ctxSel.textContent = '';
      opts.forEach(function (k) { ctxSel.appendChild(el('option', { value: k, text: k })); });
      if (opts.indexOf(showKey) >= 0) ctxSel.value = showKey;
      drawTable(ctxSel.value);
      tOut.textContent = 'T = ' + dec(S.T, 1) + (S.T < 0.5 ? ' (fast immer das häufigste Wort)' : S.T > 1.5 ? ' (Nachfolger fast gleich wahrscheinlich)' : S.T === 1 ? ' (so wie gelernt)' : '');
      mOut.textContent = String(S.maxLen);
      bStep.disabled = S.done || S.tokens.length < 2;
    }
    function drawTable(key) {
      tbody.textContent = '';
      var entry = null;
      if (S.models) entry = S.models[S.order].tab[key] || S.models[1].tab[key] || null;
      if (!entry) { ctxNote.textContent = 'Zu diesem Kontext gibt es keine Nachfolger.'; return; }
      var tot = sum(entry.counts), p = core.probs(entry.counts, S.T), mx = Math.max.apply(null, entry.counts);
      ctxNote.textContent = 'Nach „' + key + '“ kam im Training ' + tot + 'x ein Wort: ' + entry.words.length + ' verschiedene.';
      var order = entry.words.map(function (w, i) { return i; }).sort(function (a, b) { return entry.counts[b] - entry.counts[a] || a - b; });
      var drawnWord = S.last && S.last.key === key ? S.last.word : null;
      order.forEach(function (i) {
        var tr = el('tr', { class: drawnWord === entry.words[i] ? 'is-drawn' : '' }, [
          el('td', { class: 'v10-w', text: entry.words[i] }),
          td(meter(entry.counts[i] / mx, String(entry.counts[i]), false)),
          td(meter(p[i], pct(p[i]), true))
        ]);
        tbody.appendChild(tr);
      });
    }
    function td(n) { return el('td', {}, [n]); }
    function meter(frac, text, isP) {
      var b = el('span', { class: 'v10-meter__bar', 'aria-hidden': 'true' }, [el('span')]);
      b.firstChild.style.width = Math.max(0, Math.min(1, frac)) * 100 + '%';
      return el('div', { class: 'v10-meter' + (isP ? ' v10-meter--p' : '') }, [b, el('span', { class: 'v10-meter__t', text: text })]);
    }
    function stopPlay() { if (S.timer) { clearInterval(S.timer); S.timer = null; } bPlay.textContent = 'Abspielen'; bPlay.setAttribute('aria-pressed', 'false'); }
    function play() {
      if (S.timer) { stopPlay(); return; }
      if (S.done) restart();
      bPlay.textContent = 'Pause'; bPlay.setAttribute('aria-pressed', 'true');
      S.timer = setInterval(function () { step(); if (S.done) stopPlay(); }, reduced() ? 400 : 900);
    }

    var deb = null;
    ta.addEventListener('input', function () { clearTimeout(deb); deb = setTimeout(function () { presetBtns.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); }); S.preset = -1; retrain(false); }, 300); });
    bTrain.addEventListener('click', function () { retrain(false); });
    startSel.addEventListener('change', function () { S.userPick = null; restart(); });
    function setOrder(o) { S.order = o; S.userPick = null; b1.setAttribute('aria-pressed', o === 1 ? 'true' : 'false'); b2.setAttribute('aria-pressed', o === 2 ? 'true' : 'false'); restart(); }
    b1.addEventListener('click', function () { setOrder(1); });
    b2.addEventListener('click', function () { setOrder(2); });
    tIn.addEventListener('input', function () { S.T = parseFloat(tIn.value); render(); });
    mIn.addEventListener('input', function () { S.maxLen = parseInt(mIn.value, 10); render(); });
    seedIn.addEventListener('input', function () { var v = parseInt(seedIn.value, 10); if (!isNaN(v)) { S.seed = v; restart(); } });
    bDice.addEventListener('click', function () { S.seed = 1 + Math.floor(Math.random() * 9999); seedIn.value = String(S.seed); restart(); play(); });
    bStep.addEventListener('click', function () { stopPlay(); S.userPick = null; step(); });
    bPlay.addEventListener('click', function () { S.userPick = null; play(); });
    bRestart.addEventListener('click', function () { S.userPick = null; restart(); });
    ctxSel.addEventListener('change', function () { S.userPick = ctxSel.value; drawTable(ctxSel.value); });
    retrain(true);
  }

  /* ══════════════════════════════════════════════════════════
     (B) Tokenizer-Spielplatz
     ══════════════════════════════════════════════════════════ */
  var DEFAULT_VOCAB = 'wellen, dicht, ring, lager, schild, schraube, zahn, rad, dreh, moment, der, die, das, im, sitzt, in, und, ein, stahl, zug, kraft, en, er, ung, .';
  function initTokenizer(host) {
    var mode = 'sub';
    var inp = el('input', { type: 'text', class: 'v10-tokin', value: 'Der Wellendichtring sitzt im Lagerschild.', 'aria-label': 'Text, der in Tokens zerlegt wird', autocomplete: 'off', spellcheck: 'false' });
    var seg = el('div', { class: 'k-seg', role: 'group', 'aria-label': 'Zerlegung wählen' });
    var modes = [['zeichen', 'Zeichen'], ['woerter', 'Wörter'], ['sub', 'Teilwörter']];
    var mbtn = {};
    modes.forEach(function (m) {
      var b = el('button', { type: 'button', 'aria-pressed': m[0] === mode ? 'true' : 'false', text: m[1] });
      b.addEventListener('click', function () { mode = m[0]; Object.keys(mbtn).forEach(function (k) { mbtn[k].setAttribute('aria-pressed', k === mode ? 'true' : 'false'); }); vocabWrap.hidden = mode !== 'sub'; render(); });
      mbtn[m[0]] = b; seg.appendChild(b);
    });
    var ex = el('div', { class: 'k-presets', role: 'group', 'aria-label': 'Beispiele' });
    ['Der Wellendichtring sitzt im Lagerschild.', 'Wellendichtring', 'Drehmomentschlüssel', 'Zahnradwelle'].forEach(function (t) {
      var b = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', text: t.length > 20 ? 'Satz mit Wellendichtring' : t });
      b.addEventListener('click', function () { inp.value = t; render(); });
      ex.appendChild(b);
    });
    var vocab = el('textarea', { class: 'v10-vocab', 'aria-label': 'Vokabular der Teilwörter, durch Kommas getrennt', spellcheck: 'false' });
    vocab.value = DEFAULT_VOCAB;
    var vocabWrap = el('div', {}, [el('p', { class: 'v10-lbl', text: 'Vokabular der Teilwörter (änderbar, durch Kommas getrennt)' }), vocab,
      el('p', { class: 'k-small k-muted v10-note', text: 'Der Tokenizer nimmt an jeder Stelle das längste Stück aus dieser Liste. Streich „dicht“ heraus und schau, was aus „Wellendichtring“ wird. Gestrichelte Stücke sind einzelne Zeichen, die nicht im Vokabular stehen.' })]);
    var box = el('ul', { class: 'v10-chips', 'aria-label': 'Tokens' });
    var sumP = el('p', { class: 'v10-msg is-on', role: 'status', 'aria-live': 'polite' });
    var ids = el('p', { class: 'v10-ids' });
    host.appendChild(field('Text', inp));
    host.appendChild(el('div', { class: 'k-controls' }, [el('div', { class: 'k-field' }, [el('span', { class: 'v10-lbl', text: 'Zerlegung' }), seg])]));
    host.appendChild(ex);
    host.appendChild(vocabWrap);
    host.appendChild(el('h4', { class: 'v10-h', text: 'Tokens' }));
    host.appendChild(box); host.appendChild(sumP); host.appendChild(ids);
    function render() {
      var text = inp.value, toks = [], i;
      if (mode === 'zeichen') {
        for (i = 0; i < text.length; i++) toks.push({ s: text.charAt(i) === ' ' ? '␣' : text.charAt(i), id: 1000 + text.charCodeAt(i), known: true });
      } else if (mode === 'woerter') {
        (text.match(WORTRE) || []).forEach(function (x, j) { toks.push({ s: x, id: j + 1, known: true }); });
      } else toks = core.subwords(text, core.parseVocab(vocab.value));
      box.textContent = '';
      toks.slice(0, 120).forEach(function (t) { box.appendChild(el('li', { class: 'v10-chip v10-chip--tok' + (t.known ? '' : ' is-single'), text: t.s, title: t.known ? '' : 'nicht im Vokabular: einzelnes Zeichen' })); });
      var n = text.length;
      sumP.textContent = n + ' Zeichen werden zu ' + toks.length + ' Token' + (toks.length === 1 ? '' : 's') + (toks.length ? ' (im Schnitt ' + dec(n / toks.length, 1) + ' Zeichen je Token).' : '.') + (mode === 'sub' ? ' Das Modell kennt später nur die Nummern.' : '');
      ids.textContent = mode === 'sub' ? 'Token-Nummern: ' + toks.map(function (t) { return t.id; }).join(', ') : '';
      ids.hidden = mode !== 'sub';
    }
    inp.addEventListener('input', render); vocab.addEventListener('input', render);
    render();
  }

  /* ══════════════════════════════════════════════════════════
     (C) List Comprehension Schritt für Schritt
     ══════════════════════════════════════════════════════════ */
  function initListComp(host) {
    var cur = 0, steps, s = 0, d;
    var seg = el('div', { class: 'k-seg v10-seg-col', role: 'group', 'aria-label': 'Beispiel wählen' });
    var sbtn = LC.map(function (x, i) {
      var b = el('button', { type: 'button', 'aria-pressed': i === 0 ? 'true' : 'false', text: x.title });
      b.addEventListener('click', function () { choose(i); });
      seg.appendChild(b); return b;
    });
    host.appendChild(el('div', { class: 'k-controls' }, [el('div', { class: 'k-field' }, [el('span', { class: 'v10-lbl', text: 'Beispiel' }), seg])]));
    var pl = player(host, { next: next, back: back, reset: reset, done: function () { return s >= steps.length - 1; }, interval: 1200 });
    var msg = el('p', { class: 'v10-msg', role: 'status', 'aria-live': 'polite' });
    var comp = el('pre', { class: 'v10-comp', 'aria-label': 'Die Kurzform' });
    var cells = el('ul', { class: 'v10-cells', 'aria-label': 'Die Eingabeliste' });
    var res = el('ul', { class: 'v10-cells', 'aria-label': 'Die Ergebnisliste' });
    var codeBox = el('ol', { class: 'v10-code', 'aria-label': 'Gleichwertige Schleife' });
    host.appendChild(msg);
    host.appendChild(el('div', { class: 'v10-lc-grid' }, [
      el('div', {}, [el('p', { class: 'v10-reslabel', text: 'Kurzform (List Comprehension)' }), comp, el('p', { class: 'v10-reslabel', text: 'Eingabeliste' }), cells, el('p', { class: 'v10-reslabel', text: 'Ergebnisliste' }), res]),
      el('div', {}, [el('p', { class: 'v10-reslabel', text: 'Dasselbe als Schleife mit append' }), codeBox])
    ]));
    function choose(i) {
      cur = i; d = LC[i]; steps = core.lcSteps(d); s = 0; pl.stop();
      sbtn.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      codeBox.textContent = '';
      core.lcLoopCode(d).forEach(function (l, k) { codeBox.appendChild(el('li', { 'data-ln': String(k + 1) }, [el('code', { text: l })])); });
      paint();
    }
    function paint() {
      var st = steps[s];
      comp.textContent = '';
      comp.appendChild(document.createTextNode('ergebnis = ['));
      var pe = el('b', { text: d.expr }), pf = el('b', { text: 'for ' + d.v + ' in ' + d.list });
      if (st.active === 'expr') pe.className = 'is-active';
      if (st.active === 'for') pf.className = 'is-active';
      comp.appendChild(pe); comp.appendChild(document.createTextNode(' ')); comp.appendChild(pf);
      if (d.cond) { var pi = el('b', { text: 'if ' + d.cond }); if (st.active === 'if') pi.className = 'is-active'; comp.appendChild(document.createTextNode(' ')); comp.appendChild(pi); }
      comp.appendChild(document.createTextNode(']'));
      cells.textContent = '';
      d.items.forEach(function (it, i) {
        var c = el('li', { class: 'v10-cell' }, [el('span', { class: 'v10-cell__val', text: it === '' ? "''" : pyv(it) }), el('span', { class: 'v10-cell__pos', text: String(i) })]);
        if (i === st.i) c.classList.add('is-sel');
        else if (i < st.i || st.done) {
          c.classList.add('is-past');
          if (d.cond && !d.test(it)) c.classList.add('is-skip');
        }
        cells.appendChild(c);
      });
      res.textContent = '';
      st.res.forEach(function (x, i) {
        var c = el('li', { class: 'v10-cell' + (st.added && i === st.res.length - 1 ? ' is-new' : '') }, [el('span', { class: 'v10-cell__val', text: x === '' ? "''" : pyv(x) }), el('span', { class: 'v10-cell__pos', text: String(i) })]);
        res.appendChild(c);
      });
      if (!st.res.length) res.appendChild(el('li', { class: 'v10-cell' }, [el('span', { class: 'v10-cell__val', text: '[ ]' })]));
      Array.prototype.forEach.call(codeBox.children, function (li) { li.classList.toggle('is-active', li.getAttribute('data-ln') === String(st.line)); });
      msg.textContent = 'Schritt ' + (s + 1) + ' von ' + steps.length + ': ' + st.msg;
      msg.className = 'v10-msg is-on' + (st.done ? ' is-ok' : '');
      pl.count.textContent = (s + 1) + ' / ' + steps.length;
      pl.bBack.disabled = s === 0; pl.bNext.disabled = s >= steps.length - 1;
    }
    function next() { if (s < steps.length - 1) { s++; paint(); } }
    function back() { if (s > 0) { s--; paint(); } }
    function reset() { s = 0; paint(); }
    choose(0);
  }

  /* ══════════════════════════════════════════════════════════
     (D) Ablauf „Text erzeugen“ als PAP
     ══════════════════════════════════════════════════════════ */
  var ERZEUG_CODE = ['wort = "das"', 'satz = [wort]', 'for schritt in range(8):', '    wort = random.choice(nachfolger[wort])', '    satz.append(wort)', '    if wort == ".":', '        break', 'print(" ".join(satz))'];
  function erzeugSpec() {
    var P = root.KursPAP && root.KursPAP.P;
    return [P.start('start'), P.op('wort = "das"\nsatz = [wort]', 'init'),
      P.whil('kein Punkt und\nweniger als 8 Wörter\ngezogen?', [
        P.op('wort = zufälliger\nNachfolger von wort', 'zieh'),
        P.op('wort an satz\nanhängen', 'app')], 'loop'),
      P.io('Ausgabe: satz', 'out'), P.end('end', 'Ende')];
  }
  function initErzeugen(host) {
    if (!root.KursPAP || !root.KursPAP.P) { host.appendChild(el('p', { class: 'k-small k-muted', text: 'Der Programmablaufplan braucht pap-engine.js.' })); return; }
    var model = core.train(core.tokenize(BEISPIEL_TEXT), 1), steps = core.erzeugSteps(model, BEISPIEL_SEQ, 8), s = 0;
    var msg = el('p', { class: 'v10-msg', role: 'status', 'aria-live': 'polite' });
    var papHost = el('div', { class: 'pap-wrap v10-pap' });
    var codeBox = el('ol', { class: 'v10-code', 'aria-label': 'Python-Code zum Ablauf' });
    ERZEUG_CODE.forEach(function (l, i) { codeBox.appendChild(el('li', { 'data-ln': String(i + 1) }, [el('code', { text: l })])); });
    var vars = el('dl', { class: 'v10-vars' });
    var sent = el('ul', { class: 'v10-chips v10-chips--sentence', 'aria-label': 'Der Satz bisher' });
    var pl = player(host, { next: next, back: back, reset: reset, done: function () { return s >= steps.length - 1; }, interval: 1300 });
    host.appendChild(msg);
    host.appendChild(el('div', { class: 'v10-pgrid' }, [papHost, el('div', { class: 'v10-right' }, [sent, codeBox, vars])]));
    papHost.innerHTML = root.KursPAP.svg(erzeugSpec(), { cls: 'pap--run', label: 'Programmablaufplan Text erzeugen: Startwort setzen, solange kein Punkt gezogen und die Höchstlänge nicht erreicht ist einen zufälligen Nachfolger ziehen und anhängen, danach den Satz ausgeben.' });
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
      sent.textContent = '';
      st.satz.forEach(function (w, i) { sent.appendChild(el('li', { class: 'v10-chip' + (i === st.satz.length - 1 && i > 0 ? ' is-cur' : ''), text: w })); });
      Array.prototype.forEach.call(codeBox.children, function (li) { li.classList.toggle('is-active', st.lines.indexOf(parseInt(li.getAttribute('data-ln'), 10)) >= 0); });
      vars.textContent = '';
      [['wort', '"' + st.wort + '"'], ['satz', '[' + st.satz.map(function (w) { return '"' + w + '"'; }).join(', ') + ']'], ['gezogen', st.schritt + ' von 8']].forEach(function (p) { vars.appendChild(el('dt', { text: p[0] })); vars.appendChild(el('dd', { text: p[1] })); });
      msg.textContent = 'Schritt ' + (s + 1) + ' von ' + steps.length + ': ' + st.msg;
      msg.className = 'v10-msg is-on' + (st.done ? ' is-ok' : '');
      pl.count.textContent = (s + 1) + ' / ' + steps.length;
      pl.bBack.disabled = s === 0; pl.bNext.disabled = s >= steps.length - 1;
    }
    function next() { if (s < steps.length - 1) { s++; paint(); } }
    function back() { if (s > 0) { s--; paint(); } }
    function reset() { s = 0; paint(); }
    paint();
  }

  /* ══════════════════════════════════════════════════════════
     (E) Selbstcheck-Haken für Papieraufgaben
     ══════════════════════════════════════════════════════════ */
  function initCheck(host) {
    var cb = host.querySelector('input[type="checkbox"]'), task = host.closest('[data-a]');
    var A = root.KursAufgaben, lesson = document.body.getAttribute('data-lesson') || 'V10';
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
    var map = { minilm: initMiniLM, tokenizer: initTokenizer, listcomp: initListComp, 'pap-erzeugen': initErzeugen, check: initCheck };
    Object.keys(map).forEach(function (k) { Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="' + k + '"]'), map[k]); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : globalThis);
