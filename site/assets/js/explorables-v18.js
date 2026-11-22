/* =============================================================
   explorables-v18.js – interaktive Bausteine für V18 „IT-Sicherheit für Ingenieure“ (reines JS, kein Framework)
   (A) Hash-Labor: zwei Texte, live SHA-256, abweichende Hex-Stellen und Bits.
   (B) Fingerabdruck einer Datei: Datei im Browser hashen, mit dem Soll-Wert vergleichen (Firmware R1).
   (C) Block für Block: wie sha256_datei eine Datei in Blöcke zerlegt und per update einmischt.
   (D) Drei Fälle: Prüfsumme gegen Signatur.
   (E) CRA-Zeitstrahl mit Heute-Marke.
   (F) „Darf das in den Prompt?“ und (G) Schutzziel-Zuordnung (gleicher Baustein).
   (H) Zonen und Firewall am Gateway der Zelle.
   (I) PAP: Firmware prüfen (KursPAP.figure).
   Der Rechenkern (SHA-256 ohne DOM) ist per node testbar (module.exports).
   ============================================================= */
(function (root) {
  'use strict';

  /* ── Kern (ohne DOM): SHA-256 synchron, Hex, Bitvergleich ───── */
  var K256 = [], H256 = [];
  (function () {
    var p = [], n = 2, i, ok;
    while (p.length < 64) {
      ok = true;
      for (i = 0; i < p.length; i++) { if (n % p[i] === 0) { ok = false; break; } }
      if (ok) p.push(n);
      n++;
    }
    for (i = 0; i < 64; i++) K256.push(Math.floor((Math.pow(p[i], 1 / 3) % 1) * 4294967296) >>> 0);
    for (i = 0; i < 8; i++) H256.push(Math.floor((Math.sqrt(p[i]) % 1) * 4294967296) >>> 0);
  })();
  function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }
  function sha256Sync(data) {
    var l = data.length, total = ((l + 9 + 63) >> 6) << 6, buf = new Uint8Array(total), dv, h = H256.slice(), w = new Array(64), b, i, a, c, d, e, f, g, hh, bb, s0, s1, t1, t2, ch, maj;
    buf.set(data); buf[l] = 0x80;
    dv = new DataView(buf.buffer);
    dv.setUint32(total - 8, Math.floor(l / 536870912));
    dv.setUint32(total - 4, (l << 3) >>> 0);
    for (b = 0; b < total; b += 64) {
      for (i = 0; i < 16; i++) w[i] = dv.getUint32(b + i * 4);
      for (i = 16; i < 64; i++) {
        s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
      }
      a = h[0]; bb = h[1]; c = h[2]; d = h[3]; e = h[4]; f = h[5]; g = h[6]; hh = h[7];
      for (i = 0; i < 64; i++) {
        s1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        ch = (e & f) ^ (~e & g);
        t1 = (hh + s1 + ch + K256[i] + w[i]) >>> 0;
        s0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        maj = (a & bb) ^ (a & c) ^ (bb & c);
        t2 = (s0 + maj) >>> 0;
        hh = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = bb; bb = a; a = (t1 + t2) >>> 0;
      }
      h[0] = (h[0] + a) >>> 0; h[1] = (h[1] + bb) >>> 0; h[2] = (h[2] + c) >>> 0; h[3] = (h[3] + d) >>> 0;
      h[4] = (h[4] + e) >>> 0; h[5] = (h[5] + f) >>> 0; h[6] = (h[6] + g) >>> 0; h[7] = (h[7] + hh) >>> 0;
    }
    var out = new Uint8Array(32), o = new DataView(out.buffer);
    for (i = 0; i < 8; i++) o.setUint32(i * 4, h[i]);
    return out;
  }
  function toHex(u8) {
    var s = '', i, x;
    for (i = 0; i < u8.length; i++) { x = u8[i].toString(16); s += x.length < 2 ? '0' + x : x; }
    return s;
  }
  function utf8(s) { return new TextEncoder().encode(s); }
  /* sha256: Promise<Hex>. Bevorzugt crypto.subtle, sonst der JS-Kern. */
  function sha256Hex(u8) {
    var c = root.crypto;
    if (c && c.subtle && typeof c.subtle.digest === 'function') {
      return c.subtle.digest('SHA-256', u8).then(function (buf) { return toHex(new Uint8Array(buf)); });
    }
    return Promise.resolve(toHex(sha256Sync(u8)));
  }
  function popcnt(n) { var c = 0; while (n) { c += n & 1; n >>= 1; } return c; }
  function bitDiff(hexA, hexB) {
    var n = Math.min(hexA.length, hexB.length), c = 0, i;
    for (i = 0; i < n; i++) c += popcnt(parseInt(hexA.charAt(i), 16) ^ parseInt(hexB.charAt(i), 16));
    return c;
  }
  function hexDiffCount(hexA, hexB) {
    var n = Math.min(hexA.length, hexB.length), c = 0, i;
    for (i = 0; i < n; i++) if (hexA.charAt(i) !== hexB.charAt(i)) c++;
    return c;
  }
  /* Soll-Wert normalisieren wie in Python: strip, lower, nur die erste Spalte */
  function sollNorm(s) { var t = String(s).trim().toLowerCase(); return t ? t.split(/\s+/)[0] : ''; }
  var core = { sha256Sync: sha256Sync, toHex: toHex, bitDiff: bitDiff, hexDiffCount: hexDiffCount, sollNorm: sollNorm, popcnt: popcnt };

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
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  var uid = 0;
  function nextId(p) { uid++; return p + uid; }
  function icon(id) { return typeof root.KIcon === 'function' ? root.KIcon(id) : document.createTextNode(''); }
  function btn(text, cls, fn, ic) {
    var b = el('button', { type: 'button', class: 'k-btn k-btn--small ' + (cls || '') });
    if (ic) b.appendChild(icon(ic));
    b.appendChild(document.createTextNode(text));
    b.addEventListener('click', fn);
    return b;
  }
  /* Hex-Zeile in Achtergruppen; abweichende Zeichen fett, unterstrichen und hinterlegt (nie nur Farbe) */
  function hexZeile(hex, other) {
    var wrap = el('span', { class: 'v18-hex' }), g, i, grp, ch;
    for (g = 0; g < hex.length; g += 8) {
      grp = el('span', { class: 'v18-hg' });
      for (i = g; i < Math.min(g + 8, hex.length); i++) {
        ch = hex.charAt(i);
        if (other && other.charAt(i) !== ch) grp.appendChild(el('mark', { class: 'v18-d', text: ch }));
        else grp.appendChild(document.createTextNode(ch));
      }
      wrap.appendChild(grp);
    }
    return wrap;
  }
  function verdict(kind, titel, text) {
    var v = el('div', { class: 'v18-verdict is-' + kind });
    var p = el('p', { class: 'v18-vh' });
    p.appendChild(icon(kind === 'ok' ? 'check' : kind === 'bad' ? 'x' : 'info'));
    p.appendChild(el('strong', { text: ' ' + titel }));
    v.appendChild(p);
    if (text) v.appendChild(el('p', { text: text }));
    return v;
  }
  function setVerdict(box, kind, titel, text) { clear(box); box.appendChild(verdict(kind, titel, text)); }

  /* ══════════════════════════════════════════════════════════
     (A) Hash-Labor
     ══════════════════════════════════════════════════════════ */
  function initHashLabor(host) {
    var token = 0;
    host.appendChild(el('p', { class: 'k-small k-muted', text: 'Ändere einen der beiden Texte, auch nur um ein Zeichen. Unten siehst du, wie viel vom Fingerabdruck sich dabei ändert.' }));
    var idA = nextId('v18-ta-'), idB = nextId('v18-tb-');
    var inA = el('input', { type: 'text', id: idA, class: 'v18-text', value: 'Drehzahl 1450', autocomplete: 'off', spellcheck: 'false' });
    var inB = el('input', { type: 'text', id: idB, class: 'v18-text', value: 'Drehzahl 1451', autocomplete: 'off', spellcheck: 'false' });
    var ctl = el('div', { class: 'v18-two' }, [
      el('div', { class: 'k-field' }, [el('label', { for: idA, text: 'Text A' }), inA]),
      el('div', { class: 'k-field' }, [el('label', { for: idB, text: 'Text B' }), inB])
    ]);
    host.appendChild(ctl);
    var pre = el('div', { class: 'k-presets v18-ctl' });
    [['Drehzahl 1450 / 1451', 'Drehzahl 1450', 'Drehzahl 1451'], ['Ein Leerzeichen mehr', 'abc', 'abc '], ['Groß und klein', 'Welle', 'welle'], ['Beide gleich', 'Flansch 80', 'Flansch 80']].forEach(function (p) {
      pre.appendChild(btn(p[0], 'k-btn--ghost', function () { inA.value = p[1]; inB.value = p[2]; rechne(); }));
    });
    host.appendChild(pre);
    var out = el('div', { class: 'v18-hashout' });
    var rowA = el('div', { class: 'v18-hrow' }), rowB = el('div', { class: 'v18-hrow' });
    out.appendChild(rowA); out.appendChild(rowB);
    host.appendChild(out);
    var res = el('div', { class: 'v18-result', role: 'status', 'aria-live': 'polite' });
    host.appendChild(res);

    function zeile(row, name, text, hex, other) {
      clear(row);
      row.appendChild(el('p', { class: 'v18-hl', text: 'SHA-256 von Text ' + name + ' (' + utf8(text).length + ' Bytes)' }));
      row.appendChild(hexZeile(hex, other));
    }
    function rechne() {
      var my = ++token, a = inA.value, b = inB.value;
      Promise.all([sha256Hex(utf8(a)), sha256Hex(utf8(b))]).then(function (h) {
        if (my !== token) return;
        var same = h[0] === h[1];
        zeile(rowA, 'A', a, h[0], same ? null : h[1]);
        zeile(rowB, 'B', b, h[1], same ? null : h[0]);
        if (same) {
          setVerdict(res, 'ok', '0 von 256 Bit verschieden.', a === b ? 'Gleicher Text, gleicher Fingerabdruck: die Hashfunktion ist deterministisch.' : 'Die Texte sehen verschieden aus, haben aber gleiche Bytes.');
        } else {
          var bits = bitDiff(h[0], h[1]), hx = hexDiffCount(h[0], h[1]);
          setVerdict(res, bits + ' von 256 Bit verschieden (' + Math.round(bits / 2.56) + ' %).', hx + ' von 64 Hex-Zeichen sind anders (im Fingerabdruck markiert). Schon ein einziges Zeichen mehr oder weniger verändert etwa die Hälfte der Bits: der Lawineneffekt. Einen „ähnlichen“ Text erkennst du am Hash nicht.');
        }
      });
    }
    inA.addEventListener('input', rechne); inB.addEventListener('input', rechne);
    rechne();
  }

  /* ══════════════════════════════════════════════════════════
     (B) Fingerabdruck einer Datei
     ══════════════════════════════════════════════════════════ */
  function initDatei(host) {
    var base = host.getAttribute('data-base') || '../assets/data/v18/';
    var st = { name: '', size: 0, ist: '', token: 0 };
    host.appendChild(el('p', { class: 'k-small k-muted', text: 'Die Datei bleibt in deinem Browser, nichts wird hochgeladen. Du kannst eine beliebige Datei wählen, oder die beiden Firmware-Dateien von R1 prüfen: die Original-Datei vom Hersteller und die Datei vom USB-Stick des Servicetechnikers.' }));
    var fileIn = el('input', { type: 'file', class: 'k-sr', tabindex: '-1', 'aria-hidden': 'true' });
    var bar = el('div', { class: 'k-presets v18-ctl' });
    var bFile = btn('Eigene Datei wählen', 'k-btn--ghost', function () { fileIn.click(); });
    var bOrig = btn('Original-Firmware hashen', 'k-btn--ghost', function () { holen('R1_fw_3.2.1.bin'); });
    var bUsb = btn('Datei vom USB-Stick hashen', 'k-btn--ghost', function () { holen('R1_fw_3.2.1_usb.bin'); });
    [bFile, bOrig, bUsb].forEach(function (b) { bar.appendChild(b); });
    bar.appendChild(fileIn);
    host.appendChild(bar);
    var idS = nextId('v18-soll-');
    var sollIn = el('input', { type: 'text', id: idS, class: 'v18-text v18-text--wide', autocomplete: 'off', spellcheck: 'false', placeholder: 'SHA-256 des Herstellers (64 Hex-Zeichen)' });
    host.appendChild(el('div', { class: 'k-field v18-sollwrap' }, [el('label', { for: idS, text: 'Soll-Wert (Prüfsumme des Herstellers, von der Download-Seite)' }), sollIn]));
    var sollBar = el('div', { class: 'k-presets v18-ctl' });
    sollBar.appendChild(btn('Soll-Wert von R1_fw_3.2.1.bin.sha256 laden', 'k-btn--link', ladeSoll));
    host.appendChild(sollBar);
    var info = el('div', { class: 'v18-fileinfo' });
    host.appendChild(info);
    var res = el('div', { class: 'v18-result', role: 'status', 'aria-live': 'polite' });
    host.appendChild(res);
    var hint = el('p', { class: 'k-small k-muted', text: 'Noch keine Datei gewählt.' });
    info.appendChild(hint);

    function ladeSoll() {
      fetch(base + 'R1_fw_3.2.1.bin.sha256').then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      }).then(function (t) { sollIn.value = sollNorm(t); zeige(); }).catch(function (e) {
        setVerdict(res, 'info', 'Soll-Wert nicht ladbar.', 'Die Datei R1_fw_3.2.1.bin.sha256 konnte nicht gelesen werden (' + e.message + '). Du kannst den Wert auch von Hand eintragen.');
      });
    }
    function hashe(name, u8) {
      var my = ++st.token;
      setVerdict(res, 'info', 'Berechne SHA-256 von ' + name + ' ...', '');
      sha256Hex(u8).then(function (hex) {
        if (my !== st.token) return;
        st.name = name; st.size = u8.length; st.ist = hex;
        zeige();
      });
    }
    function holen(name) {
      setVerdict(res, 'info', 'Lade ' + name + ' ...', '');
      fetch(base + name).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.arrayBuffer();
      }).then(function (buf) { hashe(name, new Uint8Array(buf)); }).catch(function (e) {
        setVerdict(res, 'bad', 'Datei nicht ladbar.', name + ' konnte nicht geholt werden (' + e.message + '). Öffne die Seite über den Kurs-Server, nicht direkt als Datei.');
      });
    }
    fileIn.addEventListener('change', function () {
      var f = fileIn.files && fileIn.files[0];
      if (!f) return;
      var fr = new FileReader();
      fr.onload = function () { hashe(f.name, new Uint8Array(fr.result)); };
      fr.onerror = function () { setVerdict(res, 'bad', 'Datei nicht lesbar.', 'Der Browser konnte die Datei nicht lesen.'); };
      fr.readAsArrayBuffer(f);
    });
    sollIn.addEventListener('input', zeige);

    function zeige() {
      clear(info);
      if (!st.ist) { info.appendChild(hint); if (sollNorm(sollIn.value)) setVerdict(res, 'info', 'Noch keine Datei geprüft.', 'Wähle eine Datei oder einen der beiden Firmware-Knöpfe.'); return; }
      var soll = sollNorm(sollIn.value);
      var dl = el('dl', { class: 'v18-dl' });
      dl.appendChild(el('dt', { text: 'Datei' })); dl.appendChild(el('dd', { text: st.name + ' (' + st.size + ' Bytes)' }));
      dl.appendChild(el('dt', { text: 'Berechnet (ist)' })); dl.appendChild(el('dd', {}, [hexZeile(st.ist, soll.length === 64 ? soll : null)]));
      dl.appendChild(el('dt', { text: 'Soll (nach strip und lower)' })); dl.appendChild(el('dd', {}, [soll ? hexZeile(soll, st.ist) : document.createTextNode('noch leer')]));
      info.appendChild(dl);
      if (!soll) { setVerdict(res, 'info', 'Soll-Wert fehlt.', 'Trage die Prüfsumme des Herstellers ein oder lade sie mit dem Knopf. Ohne Soll-Wert gibt es nichts zu vergleichen.'); return; }
      if (st.ist === soll) setVerdict(res, 'ok', 'OK: Prüfsumme stimmt.', 'Die Datei ist bitgenau die, deren Prüfsumme der Hersteller veröffentlicht hat. Vorausgesetzt, der Soll-Wert stammt von einem vertrauenswürdigen zweiten Weg.');
      else {
        var extra = soll.length !== 64 ? ' Hinweis: Ein SHA-256-Wert hat 64 Hex-Zeichen, dein Soll-Wert hat ' + soll.length + '.' : ' Der Fingerabdruck weicht in ' + bitDiff(st.ist, soll) + ' von 256 Bit ab.';
        setVerdict(res, 'bad', 'ABWEICHUNG: nicht einspielen!', 'Die Datei ist nicht die Original-Datei (oder der Soll-Wert ist falsch eingetragen).' + extra);
      }
    }
    ladeSoll();
  }

  /* ══════════════════════════════════════════════════════════
     (C) Block für Block
     ══════════════════════════════════════════════════════════ */
  var CODE = [
    'def sha256_datei(pfad):',
    '    h = hashlib.sha256()',
    '    with open(pfad, "rb") as datei:',
    '        while True:',
    '            block = datei.read(4)   # sonst meist 4096',
    '            if not block:',
    '                break',
    '            h.update(block)',
    '    return h.hexdigest()'
  ];
  function pyBytes(u8) {
    var s = '', i, c;
    for (i = 0; i < u8.length; i++) {
      c = u8[i];
      if (c === 39) s += "\\'"; else if (c === 92) s += '\\\\';
      else if (c >= 32 && c < 127) s += String.fromCharCode(c);
      else s += '\\x' + (c < 16 ? '0' : '') + c.toString(16);
    }
    return "b'" + s + "'";
  }
  function baueSchritte(daten, bl) {
    var steps = [], pos = 0, mixed = 0, blk;
    steps.push({ line: 1, read: 0, mixed: 0, blk: null, note: 'h = hashlib.sha256(): Ein neuer Hash-Zustand entsteht. Es ist noch nichts eingemischt, hexdigest() würde jetzt den Fingerabdruck der leeren Datei liefern.' });
    steps.push({ line: 2, read: 0, mixed: 0, blk: null, note: 'open(pfad, "rb"): Die Datei wird binär geöffnet. Gelesen wird noch nichts, die Datei wird nicht auf einmal in den Speicher geholt.' });
    while (true) {
      blk = daten.slice(pos, pos + bl);
      pos += blk.length;
      steps.push({ line: 4, read: pos, mixed: mixed, blk: blk, note: 'block = datei.read(' + bl + '): Die nächsten ' + (blk.length ? blk.length + ' Bytes werden gelesen: ' + pyBytes(blk) + '.' : 'Bytes: Es sind keine mehr da, der Block ist leer (b\'\').') });
      if (!blk.length) {
        steps.push({ line: 5, read: pos, mixed: mixed, blk: blk, note: 'if not block: Ein leerer Block gilt als „falsch“, not block ist True. Die Datei ist zu Ende.' });
        steps.push({ line: 6, read: pos, mixed: mixed, blk: blk, note: 'break: Die Schleife endet.' });
        steps.push({ line: 8, read: pos, mixed: mixed, blk: blk, fin: true, note: 'return h.hexdigest(): Der Zustand nach allen Blöcken ist der Fingerabdruck der ganzen Datei. Er ist derselbe, als hättest du die Datei mit einem einzigen Aufruf gehasht.' });
        break;
      }
      steps.push({ line: 5, read: pos, mixed: mixed, blk: blk, note: 'if not block: Der Block ist nicht leer, not block ist False. Die Schleife läuft weiter.' });
      mixed = pos;
      steps.push({ line: 7, read: pos, mixed: mixed, blk: blk, note: 'h.update(block): Die ' + blk.length + ' Bytes werden in den inneren Zustand eingemischt. Jeder Block verändert den ganzen Zustand.' });
    }
    return steps;
  }
  function initBloecke(host) {
    var TEXT = 'Welle 20H6', BL = 4, daten = utf8(TEXT), steps = baueSchritte(daten, BL), i = 0, timer = null;
    host.appendChild(el('p', { class: 'k-small k-muted', text: 'Die Mini-Datei enthält die zehn Bytes „' + TEXT + '“. Gelesen wird in Blöcken zu ' + BL + ' Bytes (in echt sind es meist 4096). Schritt für Schritt siehst du, welche Zeile gerade läuft, was in block steht und wie sich der Zustand ändert.' }));
    var bar = el('div', { class: 'k-presets v18-ctl' });
    var bBack = btn('Zurück', 'k-btn--ghost', function () { stop(); gehe(i - 1); }, 'chevron-left');
    var bNext = btn('Schritt', '', function () { stop(); gehe(i + 1); }, 'chevron-right');
    var bPlay = btn('Abspielen', 'k-btn--ghost', function () { if (timer) stop(); else start(); }, 'play');
    var bReset = btn('Von vorn', 'k-btn--ghost', function () { stop(); gehe(0); }, 'skip-start');
    [bBack, bNext, bPlay, bReset].forEach(function (b) { bar.appendChild(b); });
    host.appendChild(bar);
    var grid = el('div', { class: 'v18-bcols' });
    var left = el('div', { class: 'v18-bleft' }), right = el('div', { class: 'v18-bright' });
    grid.appendChild(left); grid.appendChild(right);
    host.appendChild(grid);
    var bytesBox = el('div', { class: 'v18-bytes', role: 'img' });
    var blockLine = el('p', { class: 'v18-line' });
    var stateBox = el('div', { class: 'v18-state' });
    var cnt = el('p', { class: 'v18-line' });
    left.appendChild(el('p', { class: 'v18-hl', text: 'Die Datei in Blöcken' }));
    left.appendChild(bytesBox); left.appendChild(cnt); left.appendChild(blockLine);
    left.appendChild(el('p', { class: 'v18-hl', text: 'Innerer Zustand (so sähe hexdigest() jetzt aus)' }));
    left.appendChild(stateBox);
    var note = el('p', { class: 'v18-note', role: 'status', 'aria-live': 'polite' });
    left.appendChild(note);
    var code = el('div', { class: 'k-code v18-code', role: 'group', 'aria-label': 'Funktion sha256_datei, aktive Zeile hervorgehoben' });
    var lines = CODE.map(function (t, k) {
      var d = el('div', { class: 'v18-cl' }, [el('span', { class: 'v18-cn', 'aria-hidden': 'true', text: String(k + 1) }), el('span', { class: 'v18-ct', text: t })]);
      code.appendChild(d); return d;
    });
    right.appendChild(el('p', { class: 'v18-hl', text: 'Die Funktion sha256_datei' }));
    right.appendChild(code);

    function stop() { if (timer) { clearInterval(timer); timer = null; } setPlay(); }
    function setPlay() {
      clear(bPlay); bPlay.appendChild(icon(timer ? 'pause' : 'play')); bPlay.appendChild(document.createTextNode(timer ? 'Pause' : 'Abspielen'));
    }
    function start() {
      if (i >= steps.length - 1) gehe(0);
      timer = setInterval(function () { if (i >= steps.length - 1) { stop(); return; } gehe(i + 1); }, 1500);
      setPlay();
    }
    function gehe(n) {
      i = Math.max(0, Math.min(steps.length - 1, n));
      var s = steps[i], k, cell, grp, b0;
      bBack.disabled = i === 0; bNext.disabled = i === steps.length - 1;
      lines.forEach(function (d, j) { d.classList.toggle('is-act', j === s.line); if (j === s.line) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current'); });
      clear(bytesBox);
      var blockStart = s.blk ? s.read - s.blk.length : -1;
      for (b0 = 0; b0 < daten.length; b0 += BL) {
        grp = el('span', { class: 'v18-bg' });
        for (k = b0; k < Math.min(b0 + BL, daten.length); k++) {
          var inBlk = s.blk && k >= blockStart && k < s.read;
          cell = el('span', { class: 'v18-by' + (k < s.mixed ? ' is-mixed' : '') + (inBlk ? ' is-cur' : ''), title: 'Byte ' + k });
          cell.appendChild(el('span', { class: 'v18-bc', text: TEXT.charAt(k) === ' ' ? '␣' : TEXT.charAt(k) }));
          cell.appendChild(el('span', { class: 'v18-bh', text: daten[k].toString(16) }));
          grp.appendChild(cell);
        }
        bytesBox.appendChild(grp);
      }
      bytesBox.setAttribute('aria-label', 'Zehn Bytes in Blöcken zu vier. Eingemischt: ' + s.mixed + ' von ' + daten.length + (s.blk && s.blk.length ? '. Aktueller Block: ' + pyBytes(s.blk) : ''));
      cnt.textContent = 'Eingemischt (dunkel hinterlegt): ' + s.mixed + ' von ' + daten.length + ' Bytes. Gelesen: ' + s.read + '. Umrandet: der Block in der Hand.';
      blockLine.textContent = 'block = ' + (s.blk ? pyBytes(s.blk) : '(noch nicht gelesen)');
      clear(stateBox);
      stateBox.appendChild(hexZeile(toHex(sha256Sync(daten.slice(0, s.mixed))), null));
      note.textContent = 'Schritt ' + (i + 1) + ' von ' + steps.length + '. ' + s.note;
      stateBox.classList.toggle('is-fin', !!s.fin);
    }
    setPlay();
    gehe(0);
  }

  /* ══════════════════════════════════════════════════════════
     (D) Drei Fälle: Prüfsumme gegen Signatur
     ══════════════════════════════════════════════════════════ */
  var FAELLE = [
    { b: 'Übertragungsfehler', hop: 2, tag: 'Bitfehler', serverBad: false, sumBad: false,
      story: 'Beim Kopieren auf den kaputten USB-Stick kippt ein Bit. Niemand will etwas Böses, die Datei ist trotzdem falsch.',
      summe: { ok: true, t: 'Die berechnete Prüfsumme passt nicht zum Soll-Wert der Hersteller-Website. Genau dafür sind Prüfsummen gedacht: Zufallsfehler erkennen.' },
      sig: { ok: true, t: 'Die Signatur passt nicht zur veränderten Datei, das Gerät lehnt sie ab.' } },
    { b: 'Angreifer tauscht nur die Datei', hop: 2, tag: 'Angreifer', serverBad: false, sumBad: false,
      story: 'Jemand tauscht die Datei auf dem Weg zum Stick gegen eine verfälschte aus. Den Soll-Wert holt der Techniker von der Hersteller-Website per HTTPS, also über einen zweiten Weg.',
      summe: { ok: true, t: 'Die Prüfsumme der gefälschten Datei ist eine andere als der Soll-Wert von der Website. Es fällt auf, aber nur, weil der Soll-Wert nicht vom selben Stick stammt.' },
      sig: { ok: true, t: 'Die Fälschung hat keine gültige Signatur des Herstellers, das Gerät lehnt sie ab.' } },
    { b: 'Datei und Prüfsumme getauscht', hop: 1, tag: 'Server gehackt', serverBad: true, sumBad: true,
      story: 'Der Download-Server wird gehackt. Der Angreifer ersetzt die Firmware und gleich die veröffentlichte Prüfsumme dazu. Der Techniker lädt beides vom Server.',
      summe: { ok: false, t: 'Die Prüfsumme passt zur gefälschten Datei, denn der Angreifer hat sie passend dazu neu berechnet. Der Vergleich meldet „OK“: die Prüfsumme ist hier wertlos.' },
      sig: { ok: true, t: 'Eine Signatur kann der Angreifer nicht neu berechnen: Dazu bräuchte er den privaten Schlüssel des Herstellers. Das Gerät prüft mit dem öffentlichen Schlüssel und lehnt die Fälschung ab.' } }
  ];
  function initFaelle(host) {
    var cur = 0;
    host.appendChild(el('p', { class: 'k-small k-muted', text: 'Die Firmware geht vom Hersteller über einen Download-Server und den USB-Stick des Technikers zum Roboter R1. Wähle einen Fall und sieh, was die Prüfsumme und was die Signatur bemerkt.' }));
    var ctl = el('div', { class: 'k-controls v18-ctl' });
    var wrap = el('div', { class: 'k-field' }, [el('span', { class: 'v18-lbl', text: 'Fall' })]);
    var seg = el('div', { class: 'k-seg v18-seg', role: 'group', 'aria-label': 'Fall wählen' });
    var btns = FAELLE.map(function (f, i) {
      var b = el('button', { type: 'button', 'aria-pressed': i === 0 ? 'true' : 'false', text: String.fromCharCode(97 + i) + ') ' + f.b });
      b.addEventListener('click', function () { cur = i; zeichne(); });
      seg.appendChild(b); return b;
    });
    wrap.appendChild(seg); ctl.appendChild(wrap); host.appendChild(ctl);
    var story = el('p', { class: 'v18-story', role: 'status', 'aria-live': 'polite' });
    host.appendChild(story);
    var svgWrap = el('div', { class: 'v18-chartwrap' });
    host.appendChild(svgWrap);
    var res = el('div', { class: 'v18-two v18-twores' });
    host.appendChild(res);

    function zeichne() {
      var f = FAELLE[cur], X = [0, 170, 340, 510], W = 130, i;
      btns.forEach(function (b, j) { b.setAttribute('aria-pressed', j === cur ? 'true' : 'false'); });
      story.textContent = String.fromCharCode(97 + cur) + ') ' + f.story;
      var s = sv('svg', { viewBox: '0 0 640 215', class: 'v18-svg', role: 'img', 'aria-label': 'Weg der Firmware: Hersteller, Download-Server, USB-Stick, Roboter R1. ' + (f.hop === 2 ? 'Zwischen Server und Stick wird die Datei verändert (' + f.tag + ').' : 'Der Download-Server ist gehackt: Datei und Prüfsumme sind gefälscht.') });
      var defs = sv('defs'), m = sv('marker', { id: 'v18-arr', viewBox: '0 0 10 10', refX: 9, refY: 5, markerUnits: 'userSpaceOnUse', markerWidth: 12, markerHeight: 12, orient: 'auto-start-reverse' });
      m.appendChild(sv('path', { d: 'M0 0 L10 5 L0 10 z', fill: '#1A1A1A' })); defs.appendChild(m);
      var m2 = sv('marker', { id: 'v18-arr-bad', viewBox: '0 0 10 10', refX: 9, refY: 5, markerUnits: 'userSpaceOnUse', markerWidth: 12, markerHeight: 12, orient: 'auto-start-reverse' });
      m2.appendChild(sv('path', { d: 'M0 0 L10 5 L0 10 z', fill: '#9B1213' })); defs.appendChild(m2);
      s.appendChild(defs);
      var names = ['Hersteller', 'Server', 'USB-Stick', 'R1'];
      for (i = 0; i < 3; i++) {
        var bad = i === f.hop;
        s.appendChild(sv('line', { x1: X[i] + W + 2, y1: 60, x2: X[i + 1] - 4, y2: 60, stroke: bad ? '#9B1213' : '#1A1A1A', 'stroke-width': bad ? 4 : 2, 'stroke-dasharray': bad ? '7 5' : '0', 'marker-end': 'url(#' + (bad ? 'v18-arr-bad' : 'v18-arr') + ')' }));
      }
      names.forEach(function (n, k) {
        var nodeBad = (k === 1 && f.serverBad);
        s.appendChild(sv('rect', { x: X[k], y: 30, width: W, height: 60, rx: 6, fill: nodeBad ? '#FDF0F1' : '#fff', stroke: nodeBad ? '#9B1213' : '#1A1A1A', 'stroke-width': nodeBad ? 4 : 2, 'stroke-dasharray': nodeBad ? '7 4' : '0' }));
        s.appendChild(sv('text', { x: X[k] + W / 2, y: 66, 'text-anchor': 'middle', class: 'v18-nid' }, n));
      });
      /* Datei- und Prüfsummen-Zustand unter den Knoten */
      var fileState = ['echt', f.serverBad ? 'falsch' : 'echt', 'falsch', ''];
      var sumState = ['echt', f.sumBad ? 'falsch' : 'echt', '', ''];
      for (i = 0; i < 3; i++) {
        s.appendChild(sv('text', { x: X[i] + W / 2, y: 116, 'text-anchor': 'middle', class: 'v18-st' + (fileState[i] === 'falsch' ? ' is-bad' : '') }, 'Datei: ' + fileState[i]));
        if (sumState[i]) s.appendChild(sv('text', { x: X[i] + W / 2, y: 138, 'text-anchor': 'middle', class: 'v18-st' + (sumState[i] === 'falsch' ? ' is-bad' : '') }, 'Summe: ' + sumState[i]));
      }
      /* Markierung am betroffenen Hop */
      var mx = f.hop === 2 ? (X[1] + W + X[2]) / 2 : X[1] + W / 2;
      s.appendChild(sv('text', { x: mx, y: f.hop === 2 ? 24 : 18, 'text-anchor': 'middle', class: 'v18-tag' }, '! ' + f.tag));
      /* zweiter Weg für den Soll-Wert (Fälle a, b) */
      if (cur < 2) {
        s.appendChild(sv('path', { d: 'M 65 150 L 65 198 L 575 198 L 575 126', fill: 'none', stroke: '#164B8C', 'stroke-width': 2, 'stroke-dasharray': '2 4', 'marker-end': 'url(#v18-arr)' }));
        s.appendChild(sv('text', { x: 320, y: 190, 'text-anchor': 'middle', class: 'v18-st2' }, 'Soll-Wert per HTTPS von der Hersteller-Website (zweiter Weg)'));
      } else {
        s.appendChild(sv('text', { x: 320, y: 196, 'text-anchor': 'middle', class: 'v18-st2' }, 'Soll-Wert kommt vom selben, gehackten Server: kein zweiter Weg'));
      }
      s.appendChild(sv('text', { x: X[3] + W / 2, y: 116, 'text-anchor': 'middle', class: 'v18-st' }, 'prüft'));
      clear(svgWrap); svgWrap.appendChild(s);

      clear(res);
      var a = el('div', { class: 'v18-resbox' });
      a.appendChild(el('p', { class: 'v18-hl', text: 'Prüfsumme (SHA-256, Soll-Wert getrennt)' }));
      a.appendChild(verdict(f.summe.ok ? 'ok' : 'bad', f.summe.ok ? 'Erkannt.' : 'NICHT erkannt.', f.summe.t));
      var b = el('div', { class: 'v18-resbox' });
      b.appendChild(el('p', { class: 'v18-hl', text: 'Digitale Signatur (Prüfung im Gerät)' }));
      b.appendChild(verdict(f.sig.ok ? 'ok' : 'bad', f.sig.ok ? 'Erkannt.' : 'NICHT erkannt.', f.sig.t));
      res.appendChild(a); res.appendChild(b);
    }
    zeichne();
  }

  /* ══════════════════════════════════════════════════════════
     (E) CRA-Zeitstrahl
     ══════════════════════════════════════════════════════════ */
  var ZEIT = [
    { d: '20.11.2024', t: 'CRA im Amtsblatt der EU veröffentlicht', tag: 'CRA', past: true,
      x: 'Die Verordnung (EU) 2024/2847, der Cyber Resilience Act, wird im Amtsblatt der EU veröffentlicht. Damit steht der Text fest, die Pflichten gelten aber noch nicht.' },
    { d: '10.12.2024', t: 'CRA in Kraft getreten', tag: 'CRA', past: true,
      x: 'Die Verordnung ist in Kraft. Ab jetzt laufen die Übergangsfristen: Die einzelnen Teile gelten nacheinander, nicht alle auf einmal.' },
    { d: '11.06.2026', t: 'Regeln für Konformitätsbewertungsstellen', tag: 'CRA', past: true,
      x: 'Seit diesem Tag gelten die Regeln für die Konformitätsbewertungsstellen (Kapitel IV). Das sind die Stellen, die später bei „wichtigen“ und „kritischen“ Produkten prüfen. Für dich im Betrieb ist das noch weit weg, es ist der Aufbau der Prüf-Infrastruktur.' },
    { d: '11.09.2026', t: 'Meldepflichten der Hersteller (Art. 14)', tag: 'CRA', past: true,
      x: 'Seit diesem Tag müssen Hersteller aktiv ausgenutzte Schwachstellen und schwere Sicherheitsvorfälle melden. Frühwarnung innerhalb von 24 Stunden, Meldung innerhalb von 72 Stunden, Abschlussbericht spätestens 14 Tage nach Verfügbarkeit einer Korrektur (bei einem schweren Vorfall: Abschlussbericht innerhalb eines Monats). Gemeldet wird über die zentrale Meldeplattform an das zuständige CSIRT (in Deutschland das BSI) und an die ENISA.' },
    { heute: true, d: '22.11.2026', t: 'Heute (Stand dieser Seite)' },
    { d: '14.01.2027', t: 'Maschinenverordnung (EU) 2023/1230 gilt', tag: 'Maschinen', past: false,
      x: 'Die Maschinenverordnung löst die Maschinenrichtlinie 2006/42/EG ab. Für Maschinenbauer wichtig: Sicherheitsrelevante Software und Daten müssen gegen unbeabsichtigte oder absichtliche Veränderung geschützt sein (Schutz gegen Korrumpierung, Anhang III, Abschnitt 1.1.9). Die Firmware-Prüfung aus dieser Lerneinheit ist genau so ein Schutz.' },
    { d: '11.12.2027', t: 'CRA gilt vollständig', tag: 'CRA', past: false,
      x: 'Ab diesem Tag gilt die Verordnung vollständig: alle Pflichten aus Anhang I (keine bekannten ausnutzbaren Schwachstellen bei Auslieferung, sichere Voreinstellungen, Sicherheitsupdates, Schutz der Integrität von Daten, Programmen und Konfiguration, SBOM, Meldeweg für Schwachstellen). Neue Produkte mit digitalen Elementen brauchen die CE-Kennzeichnung auch für die Cybersicherheit. Der Unterstützungszeitraum mit Sicherheitsupdates beträgt mindestens 5 Jahre, außer das Produkt wird erwartbar kürzer genutzt.' }
  ];
  function initZeitstrahl(host) {
    host.appendChild(el('p', { class: 'k-small k-muted', text: 'Klicke oder drücke Enter auf ein Datum: Du siehst, was ab dann gilt. „Gilt schon“ und „kommt noch“ beziehen sich auf den Stand 22.11.2026. Die Zeile „Heute“ liegt zwischen den Terminen.' }));
    var ol = el('ol', { class: 'v18-tl' });
    host.appendChild(ol);
    ZEIT.forEach(function (z) {
      var li = el('li', { class: 'v18-tli' + (z.heute ? ' is-today' : (z.past ? ' is-past' : ' is-future')) });
      if (z.heute) {
        li.appendChild(el('p', { class: 'v18-today' }, [el('strong', { text: z.d }), ' ' + z.t]));
        ol.appendChild(li); return;
      }
      var id = nextId('v18-tlx-');
      var b = el('button', { type: 'button', class: 'v18-tlb', 'aria-expanded': 'false', 'aria-controls': id });
      b.appendChild(el('span', { class: 'v18-tld', text: z.d }));
      b.appendChild(el('span', { class: 'v18-tlt', text: z.t }));
      b.appendChild(el('span', { class: 'v18-tlg' + (z.tag === 'Maschinen' ? ' is-m' : ''), text: z.tag === 'Maschinen' ? 'Maschinenverordnung' : 'CRA' }));
      var st = el('span', { class: 'v18-tls' });
      if (z.past) st.appendChild(icon('check'));
      st.appendChild(document.createTextNode(z.past ? ' gilt schon' : ' kommt noch'));
      b.appendChild(st);
      var body = el('div', { class: 'v18-tlbody', id: id, hidden: '' }, [el('p', { text: z.x })]);
      b.addEventListener('click', function () {
        var open = b.getAttribute('aria-expanded') === 'true';
        Array.prototype.forEach.call(ol.querySelectorAll('.v18-tlb'), function (o) { o.setAttribute('aria-expanded', 'false'); o.parentNode.querySelector('.v18-tlbody').hidden = true; });
        if (!open) { b.setAttribute('aria-expanded', 'true'); body.hidden = false; }
      });
      li.appendChild(b); li.appendChild(body); ol.appendChild(li);
    });
  }

  /* ══════════════════════════════════════════════════════════
     (F) „Darf das in den Prompt?“ und (G) Schutzziele: Zuordnung
     ══════════════════════════════════════════════════════════ */
  var ZUORD = {
    schutzziele: {
      lead: 'Ordne jeden Vorfall dem Schutzziel zu, das er verletzt. Bei einem Treffer bekommst du die Begründung, sonst die richtige Zuordnung.',
      punkte: 'Treffer beim ersten Versuch',
      opts: ['Vertraulichkeit', 'Integrität', 'Verfügbarkeit', 'Authentizität'],
      items: [
        { t: 'Eine manipulierte Firmware wird auf R1 eingespielt.', c: 1, r: 'Integrität heißt: Daten und Programme sind unverändert und vollständig. Hier wurde das Programm der Steuerung verändert.' },
        { t: 'Die CAD-Daten des neuen Flansches landen in einem öffentlichen Chat.', c: 0, r: 'Vertraulichkeit heißt: Nur Berechtigte kommen an die Daten. Hier haben Unbefugte Zugriff auf ein Geschäftsgeheimnis.' },
        { t: 'Ein Verschlüsselungstrojaner legt das Leitsystem der Halle lahm.', c: 2, r: 'Verfügbarkeit heißt: Systeme und Daten sind nutzbar, wenn man sie braucht. In der Fertigung steht dann die Produktion. (Die Daten sind nicht unbedingt gelesen oder verändert, sondern gesperrt.)' },
        { t: 'Eine gefälschte Update-Mail „vom Hersteller“ enthält den Link zu einer Schad-Firmware.', c: 3, r: 'Authentizität heißt: Stammt es wirklich von dem, der es zu sein vorgibt? Hier täuscht ein Fremder den Hersteller als Absender vor.' }
      ]
    },
    prompt: {
      lead: 'Du willst eine KI-Chat-Anwendung im Netz nutzen, die nicht über einen Firmenvertrag freigegeben ist. Entscheide bei jeder Anfrage: unverändert senden, erst anonymisieren oder gar nicht senden.',
      punkte: 'richtig beim ersten Versuch',
      opts: ['ok', 'erst anonymisieren', 'gehört nicht hinein'],
      items: [
        { t: 'Log-Auszug von R1 mit Seriennummer und interner IP-Adresse („R1 SN 4711-22, 192.168.30.20: Lichtgitter unterbrochen“), damit die KI die Meldung erklärt.', c: 1, r: 'Die Meldung selbst ist harmlos, aber Seriennummer und interne IP-Adresse verraten Gerät und Netzaufbau. Ersetze sie durch Platzhalter („Roboter SN-XXX, IP-XXX“) und frage dann.' },
        { t: 'Das NC-Programm WELLE_20H6.nc eines Kunden, damit die KI es optimiert.', c: 2, r: 'NC-Programme enthalten Geometrie und Fertigungswissen, oft des Kunden. Das ist ein Geschäftsgeheimnis und gehört nicht in einen öffentlichen Chat. Erlaubt nur mit freigegebenem Unternehmenswerkzeug und Zustimmung.' },
        { t: '„Wie berechne ich die SHA-256-Prüfsumme einer Datei in Python?“', c: 0, r: 'Eine allgemeine Fachfrage ohne Firmen- oder Personendaten. Das ist genau die Art Anfrage, für die KI-Chats da sind.' },
        { t: 'Der Schichtplan der Halle 2 mit den Namen aller Mitarbeitenden, damit die KI eine Tabelle formatiert.', c: 1, r: 'Namen sind personenbezogene Daten (DSGVO). Ersetze sie durch „Mitarbeiter A, B, C“, dann kannst du die Formatierung erfragen.' },
        { t: 'Eine Fehlermeldung des Python-Programms („TypeError: Strings must be encoded before hashing“) ohne weitere Firmendaten.', c: 0, r: 'Die Meldung enthält keine vertraulichen Angaben. Prüfe nur, ob im mitgesendeten Code keine Pfade, Namen oder Zugangsdaten stehen.' },
        { t: 'Das Admin-Passwort der Robotersteuerung, damit die KI ein Anmelde-Skript schreibt.', c: 2, r: 'Zugangsdaten gehören nie in einen Prompt, auch nicht „nur zum Testen“. Nimm im Skript einen Platzhalter und trage das Passwort lokal ein.' },
        { t: 'Eine Messreihe aus 50 Durchmessern in mm ohne Kunden- und Bauteilbezug, damit die KI Mittelwert und Streuung erklärt.', c: 0, r: 'Die Reihe ist anonymisiert: Ohne Bezug zu Kunde, Bauteil oder Zeichnung verrät sie nichts. So sieht ein sauberer Prompt aus.' },
        { t: 'Das CAD-Modell des neuen Flansches FLANSCH_80, damit die KI Verbesserungen vorschlägt.', c: 2, r: 'Unveröffentlichte Konstruktionsdaten sind das Kernwissen der Firma. Sie gehören nicht in einen öffentlichen Dienst, auch nicht „nur dieses eine Mal“.' }
      ]
    }
  };
  function initZuordnung(host) {
    var def = ZUORD[host.getAttribute('data-set')];
    if (!def) return;
    var first = {}, richtig = 0, beantwortet = 0;
    host.appendChild(el('p', { class: 'k-small k-muted', text: def.lead }));
    var list = el('div', { class: 'v18-zlist' });
    host.appendChild(list);
    var score = el('p', { class: 'v18-score', role: 'status', 'aria-live': 'polite' });
    host.appendChild(score);
    def.items.forEach(function (it, idx) {
      var gid = nextId('v18-z-');
      var fs = el('fieldset', { class: 'v18-zitem' });
      fs.appendChild(el('legend', { class: 'v18-zq', text: (idx + 1) + '. ' + it.t }));
      var row = el('div', { class: 'v18-zopts' });
      var fb = el('div', { class: 'v18-zfb', role: 'status', 'aria-live': 'polite' });
      var bs = def.opts.map(function (o, k) {
        var b = el('button', { type: 'button', class: 'v18-zb', 'aria-pressed': 'false' });
        b.appendChild(el('span', { text: o }));
        b.addEventListener('click', function () { wahl(k); });
        row.appendChild(b); return b;
      });
      function wahl(k) {
        var ok = k === it.c;
        if (first[idx] === undefined) { first[idx] = ok; beantwortet++; if (ok) richtig++; }
        bs.forEach(function (b, j) {
          b.setAttribute('aria-pressed', j === k ? 'true' : 'false');
          b.classList.toggle('is-right', j === it.c);
          b.classList.toggle('is-wrong', j === k && !ok);
          var old = b.querySelector('.k-ic'); if (old) old.remove();
          if (j === it.c) b.insertBefore(icon('check'), b.firstChild);
          else if (j === k) b.insertBefore(icon('x'), b.firstChild);
        });
        clear(fb);
        fb.appendChild(verdict(ok ? 'ok' : 'bad', ok ? 'Richtig: ' + def.opts[it.c] + '.' : 'Nicht ganz. Richtig ist: ' + def.opts[it.c] + '.', it.r));
        score.textContent = richtig + ' von ' + def.items.length + ' ' + def.punkte + ' (' + beantwortet + ' von ' + def.items.length + ' beantwortet).';
      }
      fs.appendChild(row); fs.appendChild(fb); list.appendChild(fs);
    });
  }

  /* ══════════════════════════════════════════════════════════
     (H) Zonen und Firewall am Gateway
     ══════════════════════════════════════════════════════════ */
  var REGELN = [
    { b: 'Büro-PC → R1', von: 'buero', nach: 'R1', ok: false, was: 'Büro-PC will auf den Roboter R1 zugreifen (beliebiger Port).', warum: 'Der Roboter muss vom Büro aus nicht erreichbar sein. Was nicht gebraucht wird, bleibt zu: So kann ein Schädling im Büro-Netz nicht bis zur Anlage durchgreifen.' },
    { b: 'Auswertungs-PC → Broker, Port 8883', von: 'buero', nach: 'Broker', ok: true, was: 'Auswertungs-PC im Büro liest per MQTT mit TLS (Port 8883) vom Broker 192.168.30.5.', warum: 'Dieser Weg wird gebraucht (Maschinendaten auswerten) und er ist verschlüsselt. Also gibt es eine gezielte Ausnahme genau für diese Verbindung.' },
    { b: 'Auswertungs-PC → Broker, Port 1883', von: 'buero', nach: 'Broker', ok: false, was: 'Auswertungs-PC im Büro liest per MQTT ohne Verschlüsselung (Port 1883) vom Broker.', warum: 'Unverschlüsselt über die Zellengrenze: Jeder auf dem Weg könnte Meldungen mitlesen oder verändern. Für den Weg aus der Zelle heraus gilt Port 8883 mit TLS.' },
    { b: 'Hersteller-Service → R1 direkt', von: 'fern', nach: 'R1', ok: false, was: 'Der Servicetechniker des Herstellers will aus dem Internet direkt auf R1 zugreifen.', warum: 'Fernwartung läuft nur über einen eigenen, gesicherten Zugang mit Anmeldung (zum Beispiel VPN) und nur, solange der Service gebraucht wird. Ein offenes Fenster ins Internet ist keine Fernwartung.' },
    { b: 'D2 → Broker, Port 1883 (in der Zelle)', von: 'D2', nach: 'Broker', ok: true, was: 'Die Drehmaschine D2 meldet ihren Status per MQTT (Port 1883) an den Broker.', warum: 'Der Verkehr bleibt im Zellennetz 192.168.30.0/24 und läuft nicht über die Firewall. Auch innen gilt: Nur die Geräte der Zelle dürfen hinein, und die Zelle hat keine Standard-Passwörter.' }
  ];
  function initZonen(host) {
    var cur = 0;
    host.appendChild(el('p', { class: 'k-small k-muted', text: 'Die Firewall am Gateway (192.168.30.1) trennt die Zone Zellennetz von Büro-Netz und Internet. Wähle eine Verbindung und sieh, ob sie durchgelassen wird. Das sind Beispiel-Regeln: Welche Regeln im Betrieb gelten, legen IT und OT gemeinsam fest.' }));
    var ctl = el('div', { class: 'k-controls v18-ctl' });
    var wrap = el('div', { class: 'k-field' }, [el('span', { class: 'v18-lbl', text: 'Verbindung' })]);
    var seg = el('div', { class: 'k-seg v18-seg', role: 'group', 'aria-label': 'Verbindung wählen' });
    var btns = REGELN.map(function (r, i) {
      var b = el('button', { type: 'button', 'aria-pressed': i === 0 ? 'true' : 'false', text: r.b });
      b.addEventListener('click', function () { cur = i; zeichne(); });
      seg.appendChild(b); return b;
    });
    wrap.appendChild(seg); ctl.appendChild(wrap); host.appendChild(ctl);
    var svgWrap = el('div', { class: 'v18-chartwrap' });
    host.appendChild(svgWrap);
    var res = el('div', { class: 'v18-resbox', role: 'status', 'aria-live': 'polite' });
    host.appendChild(res);
    var P = { buero: [70, 170], fern: [70, 60], D2: [455, 190], Broker: [455, 70], R1: [575, 190], SPS: [575, 70], F1: [455, 130], M1: [575, 130] };
    var Z = [['Broker', 'Broker', 455, 70], ['SPS', 'SPS', 575, 70], ['F1', 'F1', 455, 130], ['M1', 'M1', 575, 130], ['D2', 'D2', 455, 190], ['R1', 'R1', 575, 190]];

    function zeichne() {
      var r = REGELN[cur];
      btns.forEach(function (b, j) { b.setAttribute('aria-pressed', j === cur ? 'true' : 'false'); });
      var s = sv('svg', { viewBox: '0 0 640 250', class: 'v18-svg', role: 'img', 'aria-label': 'Netz mit drei Zonen: links Internet und Büro-Netz, in der Mitte die Firewall am Gateway, rechts das Zellennetz mit Broker, SPS, F1, M1, D2 und R1. Gewählt: ' + r.b + ', ' + (r.ok ? 'durchgelassen' : 'blockiert') + '.' });
      var defs = sv('defs'), mk = sv('marker', { id: 'v18-zarr', viewBox: '0 0 10 10', refX: 9, refY: 5, markerUnits: 'userSpaceOnUse', markerWidth: 12, markerHeight: 12, orient: 'auto' });
      mk.appendChild(sv('path', { d: 'M0 0 L10 5 L0 10 z', fill: r.ok ? '#0B6B3A' : '#9B1213' })); defs.appendChild(mk); s.appendChild(defs);
      s.appendChild(sv('rect', { x: 380, y: 28, width: 252, height: 208, rx: 6, fill: '#F7F8FA', stroke: '#1A1A1A', 'stroke-width': 2 }));
      s.appendChild(sv('text', { x: 392, y: 48, class: 'v18-axt' }, 'Zellennetz 192.168.30.0/24'));
      s.appendChild(sv('rect', { x: 8, y: 28, width: 232, height: 208, rx: 6, fill: '#fff', stroke: '#6B7280', 'stroke-width': 2, 'stroke-dasharray': '6 4' }));
      s.appendChild(sv('text', { x: 20, y: 48, class: 'v18-axt' }, 'Büro-Netz und Internet'));
      /* Firewall */
      s.appendChild(sv('rect', { x: 290, y: 28, width: 24, height: 208, fill: '#1A1A1A' }));
      s.appendChild(sv('text', { x: 302, y: 140, transform: 'rotate(-90 302 140)', 'text-anchor': 'middle', class: 'v18-fw' }, 'Firewall 192.168.30.1'));
      function node(x, y, label, bad, w) {
        w = w || 90;
        s.appendChild(sv('rect', { x: x - w / 2, y: y - 17, width: w, height: 34, rx: 5, fill: '#fff', stroke: bad ? '#9B1213' : '#1A1A1A', 'stroke-width': 2 }));
        s.appendChild(sv('text', { x: x, y: y + 5, 'text-anchor': 'middle', class: 'v18-nid' }, label));
      }
      node(P.buero[0] + 30, P.buero[1], 'Büro-PC', false, 110);
      node(P.fern[0] + 30, P.fern[1], 'Hersteller-Service', false, 150);
      Z.forEach(function (z) { node(z[2], z[3], z[1], false, 84); });
      /* gewählter Weg */
      var from = r.von === 'D2' ? P.D2 : (r.von === 'buero' ? [P.buero[0] + 85, P.buero[1]] : [P.fern[0] + 105, P.fern[1]]);
      var to = P[r.nach];
      var col = r.ok ? '#0B6B3A' : '#9B1213', d;
      if (r.von === 'D2') d = 'M ' + (P.D2[0]) + ' ' + (P.D2[1] - 18) + ' L ' + (P.Broker[0]) + ' ' + (P.Broker[1] + 18);
      else if (r.ok) d = 'M ' + from[0] + ' ' + from[1] + ' L 300 ' + from[1] + ' L ' + (to[0] - 44) + ' ' + to[1];
      else d = 'M ' + from[0] + ' ' + from[1] + ' L 280 ' + from[1];
      s.appendChild(sv('path', { d: d, fill: 'none', stroke: col, 'stroke-width': 4, 'stroke-dasharray': r.ok ? '0' : '8 5', 'marker-end': r.ok ? 'url(#v18-zarr)' : 'none' }));
      if (!r.ok) {
        var bx = 278, by = from[1];
        s.appendChild(sv('circle', { cx: bx, cy: by, r: 14, fill: '#fff', stroke: col, 'stroke-width': 3 }));
        s.appendChild(sv('path', { d: 'M ' + (bx - 6) + ' ' + (by - 6) + ' L ' + (bx + 6) + ' ' + (by + 6) + ' M ' + (bx + 6) + ' ' + (by - 6) + ' L ' + (bx - 6) + ' ' + (by + 6), stroke: col, 'stroke-width': 3, fill: 'none' }));
      }
      clear(svgWrap); svgWrap.appendChild(s);
      clear(res);
      res.appendChild(el('p', { text: r.was }));
      res.appendChild(verdict(r.ok ? 'ok' : 'bad', r.ok ? 'Erlaubt: wird durchgelassen.' : 'Blockiert.', r.warum));
    }
    zeichne();
  }

  /* ══════════════════════════════════════════════════════════
     (I) PAP: Firmware prüfen
     ══════════════════════════════════════════════════════════ */
  function initPap(host) {
    var K = root.KursPAP;
    if (!K || !K.P) { host.appendChild(el('p', { class: 'k-small k-muted', text: 'Der Programmablaufplan braucht pap-engine.js.' })); return; }
    var P = K.P;
    var spec = [
      P.start(),
      P.io('Soll-Prüfsumme vom Hersteller lesen'),
      P.whil('weitere Datei?', [
        P.io('Name der nächsten Datei lesen'),
        P.sub('ist = sha256_datei(datei)'),
        P.iff('ist == soll?', [P.io('Ausgabe: OK, einspielen')], [P.io('Ausgabe: ABWEICHUNG, nicht einspielen, melden')])
      ]),
      P.end()
    ];
    var d = el('div', { class: 'v18-papbox' });
    d.innerHTML = K.figure(spec, { label: 'Programmablaufplan Firmware prüfen: Soll-Prüfsumme lesen, dann für jede Datei die Prüfsumme mit dem Unterprogramm sha256_datei berechnen und mit dem Soll-Wert vergleichen. Bei Gleichheit „OK, einspielen“, sonst „ABWEICHUNG, nicht einspielen, melden“.' });
    host.appendChild(d);
  }

  function init() {
    var map = { 'hash-labor': initHashLabor, datei: initDatei, bloecke: initBloecke, faelle: initFaelle, zeitstrahl: initZeitstrahl, zuordnung: initZuordnung, zonen: initZonen, 'pap-firmware': initPap };
    Object.keys(map).forEach(function (k) { Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="' + k + '"]'), map[k]); });
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = core;
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})(typeof window !== 'undefined' ? window : globalThis);
