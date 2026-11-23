/* =============================================================
   explorables-v17.js – interaktive Bausteine für V17 „Netzwerke & Industrie 4.0“ (reines JS, kein Framework)
   (A) Zellennetz FZ-3: Gerät wählen, IP dezimal und binär, Netz- und Hostanteil, IP UND Maske Schritt für Schritt.
   (B) Subnetz-Rechner: Präfix /16 bis /30 und IP-Adresse: Maske, Netzadresse, Broadcast, nutzbare Adressen.
   (C) HTTP-Anfrage: URL zerlegen, Anfrage, Antwort (200 oder 404), Statuscodes.
   (D) JSON-Übersetzer: Wert anklicken, Python-Zugriff, Ergebnis und Python-Typ sehen.
   (E) MQTT-Broker: Publish/Subscribe mit Wildcards + und #, eigener Filter.
   (F) PAP: Zellen-Check.
   Der Rechenkern ist ohne DOM per node testbar (module.exports).
   ============================================================= */
(function (root) {
  'use strict';

  /* ── Kern (ohne DOM) ─────────────────────────────────────── */
  function parseIp(s) {
    var m = /^\s*(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\s*$/.exec(String(s));
    if (!m) return null;
    var o = [+m[1], +m[2], +m[3], +m[4]];
    for (var i = 0; i < 4; i++) if (o[i] > 255) return null;
    return ((o[0] * 256 + o[1]) * 256 + o[2]) * 256 + o[3];
  }
  function oktette(n) { return [Math.floor(n / 16777216) % 256, Math.floor(n / 65536) % 256, Math.floor(n / 256) % 256, n % 256]; }
  function ipStr(n) { return oktette(n).join('.'); }
  function maskInt(p) { return p <= 0 ? 0 : ((0xFFFFFFFF << (32 - p)) >>> 0); }
  function und(a, b) { return (a & b) >>> 0; }
  function netzadresse(ip, p) { return und(ip, maskInt(p)); }
  function broadcast(ip, p) { return ((netzadresse(ip, p) | (~maskInt(p) >>> 0)) >>> 0); }
  function nutzbar(p) { return Math.pow(2, 32 - p) - 2; }
  function bits8(o) { var s = o.toString(2); while (s.length < 8) s = '0' + s; return s; }

  /* MQTT: ist der Filter gültig, und passt er auf das Topic? */
  function filterPruefen(f) {
    if (!f) return { ok: false, why: 'Der Filter ist leer.' };
    var ls = f.split('/'), i;
    for (i = 0; i < ls.length; i++) {
      if (ls[i].indexOf('#') >= 0 && (ls[i] !== '#' || i !== ls.length - 1)) return { ok: false, why: 'Das # steht allein und nur als letzte Ebene.' };
      if (ls[i].indexOf('+') >= 0 && ls[i] !== '+') return { ok: false, why: 'Das + steht immer für eine ganze Ebene, nicht für einen Teil davon.' };
    }
    return { ok: true, why: '' };
  }
  function topicPasst(f, t) {
    var fl = f.split('/'), tl = t.split('/'), i, plus = [];
    for (i = 0; i < fl.length; i++) {
      if (fl[i] === '#') {
        return { ok: true, why: tl.length > i ? '# steht für die restlichen Ebenen (' + tl.slice(i).join('/') + ')' + (plus.length ? ', + für ' + plus.join(', ') : '') : '# passt auch auf null weitere Ebenen' };
      }
      if (i >= tl.length) return { ok: false, why: 'Das Topic hat weniger Ebenen als der Filter.' };
      if (fl[i] === '+') { plus.push(tl[i]); continue; }
      if (fl[i] !== tl[i]) return { ok: false, why: 'Ebene ' + (i + 1) + ': ' + tl[i] + ' ist nicht ' + fl[i] + '.' };
    }
    if (fl.length !== tl.length) return { ok: false, why: 'Das Topic hat mehr Ebenen als der Filter (+ steht nur für eine Ebene).' };
    return { ok: true, why: plus.length ? '+ steht für ' + plus.join(', ') : 'Alle Ebenen stimmen genau überein.' };
  }
  function pyRepr(v) {
    if (v === null) return 'None';
    if (v === true) return 'True';
    if (v === false) return 'False';
    if (typeof v === 'string') return "'" + v + "'";
    if (Array.isArray(v)) return '[' + v.map(pyRepr).join(', ') + ']';
    if (typeof v === 'object') return '{' + Object.keys(v).map(function (k) { return "'" + k + "': " + pyRepr(v[k]); }).join(', ') + '}';
    return String(v);
  }
  function pyTyp(v) {
    if (v === null) return 'NoneType';
    if (Array.isArray(v)) return 'list';
    if (typeof v === 'object') return 'dict';
    if (typeof v === 'string') return 'str';
    if (typeof v === 'boolean') return 'bool';
    return Number.isInteger(v) ? 'int' : 'float';
  }
  var core = {
    parseIp: parseIp, oktette: oktette, ipStr: ipStr, maskInt: maskInt, und: und, netzadresse: netzadresse,
    broadcast: broadcast, nutzbar: nutzbar, bits8: bits8, filterPruefen: filterPruefen, topicPasst: topicPasst, pyRepr: pyRepr, pyTyp: pyTyp
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
  function segment(host, label, opts, startIdx, onchange) {
    var wrap = el('div', { class: 'k-field' }, [el('span', { class: 'v17-lbl', text: label })]);
    var seg = el('div', { class: 'k-seg v17-seg', role: 'group', 'aria-label': label });
    var btns = opts.map(function (o, i) {
      var b = el('button', { type: 'button', 'aria-pressed': i === startIdx ? 'true' : 'false', text: o.t });
      b.addEventListener('click', function () { set(i); onchange(i); });
      seg.appendChild(b); return b;
    });
    function set(i) { btns.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); }
    wrap.appendChild(seg); host.appendChild(wrap);
    return { set: set };
  }
  function btn(text, cls, fn) {
    var b = el('button', { type: 'button', class: 'k-btn k-btn--small ' + (cls || ''), text: text });
    b.addEventListener('click', fn); return b;
  }
  /* Bitzeile: label, vier Oktette (Zahlen), netBits = Anzahl der Netz-Bits, verdeckt ab Oktett 'bis' (null = alle sichtbar), akt = hervorgehobenes Oktett */
  function oktettZeile(label, okt, netBits, bis, akt) {
    var row = el('div', { class: 'v17-row' });
    row.appendChild(el('div', { class: 'v17-rl', text: label }));
    var octs = el('div', { class: 'v17-octs' });
    okt.forEach(function (o, i) {
      var sicht = bis === null || i < bis;
      var c = el('div', { class: 'v17-oct' + (akt === i ? ' is-cur' : '') });
      var bw = el('div', { class: 'v17-bits', 'aria-hidden': 'true' });
      var s = bits8(o), k;
      for (k = 0; k < 8; k++) {
        var istNetz = i * 8 + k < netBits;
        bw.appendChild(el('span', { class: 'v17-bit ' + (istNetz ? 'v17-bit--net' : 'v17-bit--host'), text: sicht ? s.charAt(k) : '·' }));
      }
      c.appendChild(bw);
      c.appendChild(el('div', { class: 'v17-dec', text: sicht ? String(o) : '?' }));
      octs.appendChild(c);
    });
    row.appendChild(octs);
    return row;
  }
  function legende() {
    return el('p', { class: 'v17-legend k-small' }, [
      el('span', { class: 'v17-bit v17-bit--net', text: '1' }), ' Netzanteil (gleich für alle Geräte im Netz)   ',
      el('span', { class: 'v17-bit v17-bit--host', text: '0' }), ' Hostanteil (unterscheidet die Geräte)'
    ]);
  }

  /* ══════════════════════════════════════════════════════════
     (A) Zellennetz FZ-3
     ══════════════════════════════════════════════════════════ */
  var NETZ = '192.168.30.0';
  var GERAETE = [
    { id: 'GW', name: 'Gateway', ip: '192.168.30.1', x: 110, y: 42 },
    { id: 'Broker', name: 'MQTT-Broker', ip: '192.168.30.5', x: 320, y: 42 },
    { id: 'SPS', name: 'SPS (Zellensteuerung)', ip: '192.168.30.2', x: 530, y: 42 },
    { id: 'D2', name: 'D2 (Drehmaschine)', ip: '192.168.30.11', x: 80, y: 262 },
    { id: 'F1', name: 'F1 (Fräsmaschine)', ip: '192.168.30.12', x: 240, y: 262 },
    { id: 'M1', name: 'M1 (Messmaschine)', ip: '192.168.30.14', x: 400, y: 262 },
    { id: 'R1', name: 'R1 (Roboter)', ip: '192.168.31.20', x: 560, y: 262 }
  ];
  function initZellennetz(host) {
    var st = { sel: 3, step: 0 };
    var info = el('p', { class: 'k-small k-muted', text: 'Wähle ein Gerät in der Zeichnung oder in der Liste. Die Zahlen unter dem Namen sind der dritte und vierte Teil der Adresse (die Adresse beginnt immer mit 192.168).' });
    host.appendChild(info);
    var ctl = el('div', { class: 'k-controls v17-ctl' });
    var wrapSeg = el('div', { class: 'k-field' }, [el('span', { class: 'v17-lbl', text: 'Gerät' })]);
    var seg = el('div', { class: 'k-seg v17-seg', role: 'group', 'aria-label': 'Gerät wählen' });
    var sbtns = GERAETE.map(function (g, i) {
      var b = el('button', { type: 'button', 'aria-pressed': i === st.sel ? 'true' : 'false', text: g.id });
      b.addEventListener('click', function () { wahl(i); });
      seg.appendChild(b); return b;
    });
    wrapSeg.appendChild(seg); ctl.appendChild(wrapSeg); host.appendChild(ctl);
    var svgWrap = el('div', { class: 'v17-chartwrap' });
    host.appendChild(svgWrap);
    var panel = el('div', { class: 'v17-panel', role: 'status', 'aria-live': 'polite' });
    host.appendChild(panel);

    function wahl(i) {
      st.sel = i; st.step = 0;
      sbtns.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      zeichne();
    }
    function zeichne() {
      var s = sv('svg', { viewBox: '0 0 640 310', class: 'v17-svg', role: 'img', 'aria-label': 'Netzplan der Fertigungszelle FZ-3: In der Mitte der Switch, oben Gateway, Broker und SPS, unten D2, F1, M1 und R1. R1 hat eine Adresse aus dem Netz 192.168.31.x und gehört damit nicht zum Netz 192.168.30.0/24.' });
      s.appendChild(sv('rect', { x: 250, y: 132, width: 140, height: 36, rx: 4, fill: '#F7F8FA', stroke: '#1A1A1A', 'stroke-width': 2 }));
      s.appendChild(sv('text', { x: 320, y: 155, 'text-anchor': 'middle', class: 'v17-axt' }, 'Switch'));
      GERAETE.forEach(function (g, i) {
        var top = g.y < 150, y0 = top ? g.y + 22 : g.y - 22;
        var falsch = g.ip.indexOf('192.168.30.') !== 0;
        s.appendChild(sv('line', { x1: g.x, y1: y0, x2: 320, y2: top ? 132 : 168, stroke: falsch ? '#B00014' : '#6B7280', 'stroke-width': 2, 'stroke-dasharray': falsch ? '6 4' : '0' }));
      });
      GERAETE.forEach(function (g, i) {
        var falsch = g.ip.indexOf('192.168.30.') !== 0, sel = i === st.sel;
        var gg = sv('g', { class: 'v17-node' + (sel ? ' is-sel' : '') + (falsch ? ' is-bad' : ''), 'data-i': i });
        gg.appendChild(sv('rect', { x: g.x - 62, y: g.y - 24, width: 124, height: 48, rx: 6, fill: sel ? '#FFF1F2' : '#fff', stroke: falsch ? '#B00014' : '#1A1A1A', 'stroke-width': sel ? 4 : 2, 'stroke-dasharray': falsch ? '7 4' : '0' }));
        gg.appendChild(sv('text', { x: g.x, y: g.y - 3, 'text-anchor': 'middle', class: 'v17-nid' }, g.id));
        gg.appendChild(sv('text', { x: g.x, y: g.y + 15, 'text-anchor': 'middle', class: 'v17-nip' }, g.ip.split('.').slice(2).join('.')));
        gg.addEventListener('click', function () { wahl(i); });
        s.appendChild(gg);
      });
      clear(svgWrap); svgWrap.appendChild(s);

      var g = GERAETE[st.sel], ip = parseIp(g.ip), mask = maskInt(24), erg = und(ip, mask);
      var okt = oktette(ip), mo = oktette(mask), eo = oktette(erg);
      var fertig = st.step >= 4, imNetz = erg === parseIp(NETZ);
      clear(panel);
      panel.appendChild(el('p', { class: 'v17-ptitle', text: g.name + ': ' + g.ip }));
      panel.appendChild(el('p', { class: 'k-small k-muted', text: 'Netz der Zelle: ' + NETZ + '/24, Netzmaske 255.255.255.0. Die ersten 24 von 32 Bit sind der Netzanteil.' }));
      panel.appendChild(legende());
      panel.appendChild(oktettZeile('IP-Adresse ' + g.ip, okt, 24, null, st.step > 0 && st.step < 4 ? st.step - 1 : -1));
      panel.appendChild(oktettZeile('Netzmaske 255.255.255.0 (/24)', mo, 24, null, st.step > 0 && st.step < 4 ? st.step - 1 : -1));
      panel.appendChild(oktettZeile('IP-Adresse UND Netzmaske = Netzadresse', eo, 24, st.step, st.step > 0 && st.step < 4 ? st.step - 1 : -1));
      var bar = el('div', { class: 'k-presets v17-ctl' });
      var bN = btn(fertig ? 'Fertig' : 'Nächster Schritt (Oktett ' + (st.step + 1) + ')', '', function () { if (st.step < 4) { st.step++; zeichne(); } });
      if (fertig) bN.disabled = true;
      bar.appendChild(bN);
      bar.appendChild(btn('Alles auf einmal', 'k-btn--ghost', function () { st.step = 4; zeichne(); }));
      bar.appendChild(btn('Zurück zum Anfang', 'k-btn--ghost', function () { st.step = 0; zeichne(); }));
      panel.appendChild(bar);
      if (st.step === 0) panel.appendChild(el('p', { text: 'Das UND wirkt Bit für Bit: Eine 1 bleibt nur, wenn in der Adresse und in der Maske eine 1 steht (wie das „and“ aus V04, nur für jedes der 32 Bit). „Nächster Schritt“ rechnet ein Oktett nach dem anderen.' }));
      else if (!fertig) panel.appendChild(el('p', { text: 'Oktett ' + st.step + ': ' + okt[st.step - 1] + ' UND ' + mo[st.step - 1] + ' = ' + eo[st.step - 1] + '. ' + (mo[st.step - 1] === 255 ? 'Die Maske hat nur Einsen, die Adresse bleibt unverändert.' : 'Die Maske hat nur Nullen, das Ergebnis ist 0: Der Hostanteil fällt weg.') }));
      else {
        var v = el('p', { class: 'v17-verdict ' + (imNetz ? 'is-ok' : 'is-bad') });
        v.appendChild(el('strong', { text: imNetz ? 'Im Netz. ' : 'FALSCHES NETZ. ' }));
        v.appendChild(document.createTextNode('Netzadresse ' + ipStr(erg) + (imNetz ? ' = ' : ' ≠ ') + NETZ + (imNetz ? ': ' + g.id + ' gehört zur Zelle, der Hostanteil ist ' + okt[3] + '.' : '. Die SPS (192.168.30.2) kann ' + g.id + ' nicht direkt erreichen: Der Weg führt nur über ein Gateway, und das kennt diese Adresse nicht. Ursache: nach dem Tausch der Robotersteuerung falsch eingetragen, kein Defekt.')));
        panel.appendChild(v);
      }
    }
    zeichne();
  }

  /* ══════════════════════════════════════════════════════════
     (B) Subnetz-Rechner
     ══════════════════════════════════════════════════════════ */
  function initSubnetz(host) {
    var st = { p: 24, ip: '192.168.30.77' };
    var ctl = el('div', { class: 'k-controls v17-ctl' });
    var idIp = nextId('v17-ip-'), idP = nextId('v17-p-');
    var inpIp = el('input', { type: 'text', id: idIp, class: 'v17-text', value: st.ip, inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false', 'aria-describedby': idIp + '-f' });
    ctl.appendChild(el('div', { class: 'k-field' }, [el('label', { class: 'v17-lbl', for: idIp, text: 'IP-Adresse' }), inpIp]));
    var rng = el('input', { type: 'range', id: idP, class: 'v17-range', min: '16', max: '30', step: '1', value: String(st.p) });
    var pOut = el('output', { class: 'v17-out', for: idP, text: '/24' });
    ctl.appendChild(el('div', { class: 'k-field' }, [el('label', { class: 'v17-lbl', for: idP, text: 'Präfix (Anzahl Netz-Bits)' }), el('div', { class: 'v17-rangewrap' }, [rng, pOut])]));
    host.appendChild(ctl);
    var presets = el('div', { class: 'k-presets v17-ctl' });
    function setze(ip, p) { st.ip = ip; st.p = p; inpIp.value = ip; rng.value = String(p); zeichne(); }
    presets.appendChild(btn('D2 im Zellennetz (/24)', 'k-btn--ghost', function () { setze('192.168.30.11', 24); }));
    presets.appendChild(btn('R1 mit /24', 'k-btn--ghost', function () { setze('192.168.31.20', 24); }));
    presets.appendChild(btn('R1 mit /23', 'k-btn--ghost', function () { setze('192.168.31.20', 23); }));
    presets.appendChild(btn('Klausurbeispiel /26', 'k-btn--ghost', function () { setze('192.168.30.77', 26); }));
    host.appendChild(presets);
    var fehler = el('p', { id: idIp + '-f', class: 'v17-err k-small', role: 'alert' });
    host.appendChild(fehler);
    var out = el('div', { class: 'v17-panel', role: 'status', 'aria-live': 'polite' });
    host.appendChild(out);
    inpIp.addEventListener('input', function () { st.ip = inpIp.value; zeichne(); });
    rng.addEventListener('input', function () { st.p = +rng.value; zeichne(); });

    function zeichne() {
      pOut.textContent = '/' + st.p;
      var ip = parseIp(st.ip);
      clear(out);
      if (ip === null) { fehler.textContent = 'Das ist keine gültige IPv4-Adresse: vier Zahlen von 0 bis 255, durch Punkte getrennt.'; return; }
      fehler.textContent = '';
      var p = st.p, m = maskInt(p), net = netzadresse(ip, p), bc = broadcast(ip, p), hb = 32 - p;
      var d2 = parseIp('192.168.30.11'), gleich = netzadresse(d2, p) === net;
      out.appendChild(legende());
      out.appendChild(oktettZeile('IP-Adresse ' + ipStr(ip) + '/' + p, oktette(ip), p, null, -1));
      out.appendChild(oktettZeile('Netzmaske ' + ipStr(m), oktette(m), p, null, -1));
      out.appendChild(oktettZeile('Netzadresse ' + ipStr(net) + ' (alle Hostbits 0)', oktette(net), p, null, -1));
      out.appendChild(oktettZeile('Broadcast ' + ipStr(bc) + ' (alle Hostbits 1)', oktette(bc), p, null, -1));
      var dl = el('dl', { class: 'v13-dl v17-dl' });
      [['Netzmaske', ipStr(m)], ['Netzadresse', ipStr(net)], ['Broadcast-Adresse', ipStr(bc)],
       ['Hostbits', hb + ' (32 − ' + p + ')'],
       ['Nutzbare Adressen', '2^' + hb + ' − 2 = ' + nutzbar(p).toLocaleString('de-DE')],
       ['Erste und letzte nutzbare', ipStr(net + 1) + ' bis ' + ipStr(bc - 1)]].forEach(function (r) {
        dl.appendChild(el('div', {}, [el('dt', { text: r[0] }), el('dd', { text: r[1] })]));
      });
      out.appendChild(dl);
      var v = el('p', { class: 'v17-verdict ' + (gleich ? 'is-ok' : 'is-bad') });
      v.appendChild(el('strong', { text: gleich ? 'Gleiches Subnetz wie D2 (192.168.30.11). ' : 'Anderes Subnetz als D2 (192.168.30.11). ' }));
      v.appendChild(document.createTextNode(gleich ? 'Bei /' + p + ' haben beide dieselbe Netzadresse ' + ipStr(net) + '.' : 'Die Netzadressen unterscheiden sich: D2 liegt in ' + ipStr(netzadresse(d2, p)) + '/' + p + ', diese Adresse in ' + ipStr(net) + '/' + p + '.'));
      out.appendChild(v);
      out.appendChild(el('p', { class: 'k-small k-muted', text: 'Nutzbar sind zwei Adressen weniger als im Netz stecken: Die Netzadresse (alle Hostbits 0) benennt das Netz selbst, der Broadcast (alle Hostbits 1) richtet sich an alle Geräte. Mit Python: ipaddress.ip_network("' + ipStr(ip) + '/' + p + '", strict=False)' }));
    }
    zeichne();
  }

  /* ══════════════════════════════════════════════════════════
     (C) HTTP-Anfrage Schritt für Schritt
     ══════════════════════════════════════════════════════════ */
  /* Host und Pfad dieser Website, wie der Browser sie gerade sieht (kein fest verdrahteter Hostname) */
  var HOST = location.host || 'localhost';
  var PFAD = new URL('../assets/data/v17/api/', location.href).pathname;
  var CODES = [
    { c: '200', n: 'OK', t: 'Alles gut, die Daten stehen in der Antwort.' },
    { c: '401', n: 'Unauthorized', t: 'Du hast dich nicht angemeldet oder das Token stimmt nicht.' },
    { c: '403', n: 'Forbidden', t: 'Der Server kennt dich, aber du darfst das nicht.' },
    { c: '404', n: 'Not Found', t: 'Unter dieser Adresse gibt es nichts (Tippfehler im Pfad?).' },
    { c: '500', n: 'Internal Server Error', t: 'Der Server hat einen Fehler gemacht, nicht du.' }
  ];
  function initHttp(host) {
    var st = { datei: 0, step: 0 };
    var DATEIEN = ['D2.json', 'D9.json'];
    var ctl = el('div', { class: 'k-controls v17-ctl' });
    segment(ctl, 'Angefragte Datei', [{ t: 'D2.json (gibt es)' }, { t: 'D9.json (gibt es nicht)' }], 0, function (i) { st.datei = i; st.step = Math.min(st.step, 3); zeichne(); });
    host.appendChild(ctl);
    var bar = el('div', { class: 'k-presets v17-ctl' });
    var bN = btn('Nächster Schritt', '', function () { if (st.step < 3) { st.step++; zeichne(); } });
    bar.appendChild(bN);
    bar.appendChild(btn('Zurück zum Anfang', 'k-btn--ghost', function () { st.step = 0; zeichne(); }));
    host.appendChild(bar);
    var out = el('div', { class: 'v17-http', role: 'status', 'aria-live': 'polite' });
    host.appendChild(out);
    host.appendChild(el('h4', { class: 'v17-h4', text: 'Statuscodes im Überblick' }));
    var tw = el('div', { class: 'k-tablewrap' });
    var tab = el('table', { class: 'k-plan' });
    tab.appendChild(el('thead', {}, [el('tr', {}, [el('th', { scope: 'col', text: 'Code' }), el('th', { scope: 'col', text: 'Name' }), el('th', { scope: 'col', text: 'Bedeutung' })])]));
    var tb = el('tbody'); tab.appendChild(tb); tw.appendChild(tab); host.appendChild(tw);

    function zeichne() {
      var f = DATEIEN[st.datei], ok = st.datei === 0, step = st.step;
      bN.disabled = step >= 3; bN.textContent = step >= 3 ? 'Fertig' : 'Nächster Schritt';
      clear(out);
      var s1 = el('div', { class: 'v17-hstep is-done' });
      s1.appendChild(el('p', { class: 'v17-hh', text: '1 · Client: Adresse zerlegen' }));
      if (step === 0) s1.appendChild(el('p', { text: 'Dein Python-Programm ruft requests.get("../assets/data/v17/api/' + f + '") auf. Der Browser macht aus der relativen Adresse eine vollständige. „Nächster Schritt“ zeigt die Teile.' }));
      else {
        var url = el('p', { class: 'v17-url' }, [
          el('span', { class: 'v17-u v17-u--schema', text: 'https://' }), el('span', { class: 'v17-u v17-u--host', text: HOST }), el('span', { class: 'v17-u v17-u--pfad', text: PFAD + f })
        ]);
        s1.appendChild(url);
        var ul = el('ul', { class: 'v17-ulist' });
        [['Schema', 'https', 'wie gesprochen wird (HTTP, verschlüsselt)'], ['Host', HOST, 'welcher Rechner antwortet (hier: diese Website)'], ['Pfad', PFAD + f, 'welche Ressource dort gemeint ist']].forEach(function (r) {
          ul.appendChild(el('li', {}, [el('strong', { text: r[0] + ': ' }), el('code', { class: 'k-i', text: r[1] }), ' ' + r[2]]));
        });
        s1.appendChild(ul);
      }
      out.appendChild(s1);
      if (step >= 2) {
        var s2 = el('div', { class: 'v17-hstep is-done' });
        s2.appendChild(el('p', { class: 'v17-hh', text: '2 · Client → Server: Anfrage' }));
        s2.appendChild(el('pre', { class: 'v17-msg', text: 'GET ' + PFAD + f + ' HTTP/1.1\nHost: ' + HOST }));
        s2.appendChild(el('p', { class: 'k-small', text: 'GET heißt „hole mir diese Ressource“. Mehr braucht diese Anfrage nicht; in der Fabrik kämen Kopfzeilen mit Anmeldung (Token) dazu.' }));
        out.appendChild(s2);
      }
      if (step >= 3) {
        var s3 = el('div', { class: 'v17-hstep is-done ' + (ok ? 'is-okbox' : 'is-badbox') });
        s3.appendChild(el('p', { class: 'v17-hh', text: '3 · Server → Client: Antwort' }));
        if (ok) {
          s3.appendChild(el('pre', { class: 'v17-msg', text: 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{"id": "D2", "status": "laeuft",\n "programm": "WELLE_20H6", ...}' }));
          s3.appendChild(el('p', { class: 'v17-py' }, [el('code', { class: 'k-i', text: 'antwort.status_code' }), ' ergibt ', el('strong', { text: '200' }), '; ', el('code', { class: 'k-i', text: 'antwort.json()' }), ' ergibt ein Python-Dictionary.']));
        } else {
          s3.appendChild(el('pre', { class: 'v17-msg', text: 'HTTP/1.1 404 Not Found\nContent-Type: text/html\n\n<html> ... File not found ... </html>' }));
          s3.appendChild(el('p', { class: 'v17-py' }, [el('code', { class: 'k-i', text: 'antwort.status_code' }), ' ergibt ', el('strong', { text: '404' }), '. Der Text ist eine HTML-Fehlerseite, kein JSON: ', el('code', { class: 'k-i', text: 'antwort.json()' }), ' würde mit einem ValueError scheitern. Darum zuerst den Status prüfen.']));
        }
        out.appendChild(s3);
      }
      clear(tb);
      CODES.forEach(function (c) {
        var akt = step >= 3 && c.c === (ok ? '200' : '404');
        tb.appendChild(el('tr', { class: akt ? 'is-cur' : '' }, [el('td', { text: c.c }), el('td', { text: c.n }), el('td', { text: c.t })]));
      });
    }
    zeichne();
  }

  /* ══════════════════════════════════════════════════════════
     (D) JSON-Übersetzer
     ══════════════════════════════════════════════════════════ */
  var JSON_D2 = { id: 'D2', zeit: '2026-11-20T10:15:00+01:00', status: 'laeuft', programm: 'WELLE_20H6', stueckzahl_schicht: 142, drehzahl_1_min: 1450, temperatur_spindel_c: 48.5, werkzeugverschleiss_prozent: { T1: 22, T4: 83 } };
  var JSON_R1 = { id: 'R1', zeit: '2026-11-20T10:15:00+01:00', status: 'gestoert', programm: null, stueckzahl_schicht: 203, meldung: 'Lichtgitter unterbrochen' };
  var JSON_Z = { zelle: 'FZ-3', netz: '192.168.30.0/24', maschinen: [{ id: 'D2', ip: '192.168.30.11', status: 'laeuft' }, { id: 'R1', ip: '192.168.31.20', status: 'gestoert' }] };
  var DATENSAETZE = [
    { t: 'D2.json', v: 'd2', o: JSON_D2, start: ['werkzeugverschleiss_prozent', 'T4'] },
    { t: 'R1.json', v: 'r1', o: JSON_R1, start: ['programm'] },
    { t: 'maschinen.json (Auszug)', v: 'zelle', o: JSON_Z, start: ['maschinen', 1, 'ip'] }
  ];
  var TYPTAB = [
    ['object', '{ ... }', 'dict', 'dict'], ['array', '[ ... ]', 'list', 'list'], ['string', '"laeuft"', 'str', 'str'],
    ['number', '1450', 'int', 'int'], ['number', '48.5', 'float', 'float'], ['boolean', 'true / false', 'bool', 'bool'], ['null', 'null', 'NoneType', 'NoneType']
  ];
  function pfadText(v, pfad) {
    return v + pfad.map(function (k) { return typeof k === 'number' ? '[' + k + ']' : '["' + k + '"]'; }).join('');
  }
  function wertAn(o, pfad) { var x = o; pfad.forEach(function (k) { x = x[k]; }); return x; }
  function initJson(host) {
    var st = { ds: 0, pfad: DATENSAETZE[0].start };
    var ctl = el('div', { class: 'k-controls v17-ctl' });
    segment(ctl, 'JSON-Text', DATENSAETZE, 0, function (i) { st.ds = i; st.pfad = DATENSAETZE[i].start; zeichne(); });
    host.appendChild(ctl);
    host.appendChild(el('p', { class: 'k-small k-muted', text: 'Klicke links auf einen Wert (auch auf eine öffnende Klammer). Rechts steht, wie du ihn in Python erreichst.' }));
    var wrap = el('div', { class: 'v17-two' });
    var left = el('div', { class: 'v17-json', role: 'group', 'aria-label': 'JSON-Text, Werte sind anklickbar' });
    var right = el('div', { class: 'v17-calc', role: 'status', 'aria-live': 'polite' });
    wrap.appendChild(left); wrap.appendChild(right); host.appendChild(wrap);
    host.appendChild(el('h4', { class: 'v17-h4', text: 'JSON und Python im Überblick' }));
    var tw = el('div', { class: 'k-tablewrap' });
    var tab = el('table', { class: 'k-plan' });
    tab.appendChild(el('thead', {}, [el('tr', {}, [el('th', { scope: 'col', text: 'JSON' }), el('th', { scope: 'col', text: 'Beispiel' }), el('th', { scope: 'col', text: 'Python nach json.loads' })])]));
    var tb = el('tbody'); tab.appendChild(tb); tw.appendChild(tab); host.appendChild(tw);

    function samePfad(a, b) { return a.length === b.length && a.every(function (x, i) { return x === b[i]; }); }
    function zeile(ind, kids) { var l = el('div', { class: 'v17-jl' }, kids); l.style.paddingLeft = (ind * 2) + 'ch'; left.appendChild(l); }
    function knopf(text, pfad) {
      var b = el('button', { type: 'button', class: 'v17-jv' + (samePfad(pfad, st.pfad) ? ' is-sel' : ''), text: text, 'aria-pressed': samePfad(pfad, st.pfad) ? 'true' : 'false', 'aria-label': 'Wert ' + text + ' wählen: ' + pfadText(DATENSAETZE[st.ds].v, pfad) });
      b.addEventListener('click', function () { st.pfad = pfad; zeichne(); });
      return b;
    }
    function geh(val, pfad, ind, key, letzt) {
      var vor = key !== null ? '"' + key + '": ' : '';
      if (val !== null && typeof val === 'object') {
        var arr = Array.isArray(val), ks = Object.keys(val);
        zeile(ind, [vor, knopf(arr ? '[' : '{', pfad)]);
        ks.forEach(function (k, i) { geh(val[k], pfad.concat(arr ? +k : k), ind + 1, arr ? null : k, i === ks.length - 1); });
        zeile(ind, [(arr ? ']' : '}') + (letzt ? '' : ',')]);
      } else zeile(ind, [vor, knopf(JSON.stringify(val), pfad), letzt ? '' : ',']);
    }
    function zeichne() {
      var d = DATENSAETZE[st.ds], wert = wertAn(d.o, st.pfad), typ = pyTyp(wert);
      clear(left);
      var ks = Object.keys(d.o);
      zeile(0, ['', knopf('{', [])]);
      ks.forEach(function (k, i) { geh(d.o[k], [k], 1, k, i === ks.length - 1); });
      zeile(0, ['}']);
      clear(right);
      right.appendChild(el('p', { class: 'v17-calc__t', text: 'Python-Zugriff' }));
      right.appendChild(el('p', { class: 'v17-calc__f', text: pfadText(d.v, st.pfad) }));
      right.appendChild(el('p', { class: 'v17-calc__t', text: 'Ergebnis' }));
      right.appendChild(el('p', { class: 'v17-calc__f', text: pyRepr(wert) }));
      right.appendChild(el('p', { class: 'v17-calc__t', text: 'Python-Typ' }));
      right.appendChild(el('p', { class: 'v17-calc__f', text: typ }));
      var hinweis = '';
      if (wert === null) hinweis = 'JSON null wird in Python zu None. Prüfen mit "is None", nicht mit "== 0".';
      else if (typ === 'dict') hinweis = 'Ein JSON-Objekt wird ein Dictionary: weiter mit dem nächsten Schlüssel in eckigen Klammern.';
      else if (typ === 'list') hinweis = 'Ein JSON-Array wird eine Liste: Elemente über die Nummer (ab 0) oder mit einer for-Schleife.';
      else if (st.pfad.length === 0) hinweis = '';
      else hinweis = 'Fehlt ein Schlüssel, gibt es einen KeyError. Mit ' + (st.pfad.length > 1 && typeof st.pfad[st.pfad.length - 2] !== 'number' ? pfadText(d.v, st.pfad.slice(0, -1)) : d.v) + '.get("name", ersatz) bekommst du stattdessen den Ersatzwert.';
      if (hinweis) right.appendChild(el('p', { class: 'k-small k-muted', text: hinweis }));
      clear(tb);
      TYPTAB.forEach(function (r) {
        tb.appendChild(el('tr', { class: r[3] === typ ? 'is-cur' : '' }, [el('td', { text: r[0] }), el('td', { text: r[1] }), el('td', { text: r[2] })]));
      });
    }
    zeichne();
  }

  /* ══════════════════════════════════════════════════════════
     (E) MQTT-Broker
     ══════════════════════════════════════════════════════════ */
  var MELDUNGEN = [
    { b: 'D2 Status', t: 'fz3/D2/status', p: '{"status": "laeuft"}' },
    { b: 'F1 Status', t: 'fz3/F1/status', p: '{"status": "laeuft"}' },
    { b: 'M1 Status', t: 'fz3/M1/status', p: '{"status": "bereit"}' },
    { b: 'R1 Status', t: 'fz3/R1/status', p: '{"status": "gestoert"}' },
    { b: 'D2 Wartung', t: 'fz3/D2/wartung', p: '{"werkzeug": "T4", "aktion": "wechseln"}' }
  ];
  var ABOS = [
    { n: 'Leitstand', f: 'fz3/+/status' },
    { n: 'Instandhaltung', f: 'fz3/D2/#' },
    { n: 'Qualitätssicherung', f: 'fz3/M1/#' },
    { n: 'Eigenes Abo', f: 'fz3/+/wartung', frei: true }
  ];
  function initMqtt(host) {
    var abos = ABOS.map(function (a) { return { n: a.n, f: a.f, frei: !!a.frei }; });
    var timers = [], letzte = null;
    host.appendChild(el('p', { class: 'k-small k-muted', text: 'Wähle eine Meldung, die eine Maschine veröffentlicht (publish). Der Broker leitet sie nur an Abonnenten weiter, deren Filter auf das Topic passt. Den Filter des vierten Abos kannst du selbst ändern.' }));
    var ctl = el('div', { class: 'k-controls v17-ctl' });
    var wrapSeg = el('div', { class: 'k-field' }, [el('span', { class: 'v17-lbl', text: 'Meldung veröffentlichen' })]);
    var seg = el('div', { class: 'k-seg v17-seg', role: 'group', 'aria-label': 'Meldung veröffentlichen' });
    MELDUNGEN.forEach(function (m, i) {
      var b = el('button', { type: 'button', 'aria-pressed': 'false', text: m.b });
      b.addEventListener('click', function () { senden(i); });
      seg.appendChild(b);
    });
    wrapSeg.appendChild(seg); ctl.appendChild(wrapSeg); host.appendChild(ctl);
    var flow = el('div', { class: 'v17-flow' });
    var pubC = el('div', { class: 'v17-card v17-card--pub' });
    var brC = el('div', { class: 'v17-card v17-card--broker' });
    var subs = el('div', { class: 'v17-subs' });
    flow.appendChild(pubC); flow.appendChild(brC); flow.appendChild(subs);
    host.appendChild(flow);
    var live = el('p', { class: 'v17-verdict', role: 'status', 'aria-live': 'polite' });
    host.appendChild(live);
    var cards = abos.map(function (a, i) {
      var c = el('div', { class: 'v17-card v17-card--sub' });
      var head = el('p', { class: 'v17-ch', text: a.n });
      c.appendChild(head);
      var fz;
      if (a.frei) {
        var id = nextId('v17-f-');
        var inp = el('input', { type: 'text', id: id, class: 'v17-text', value: a.f, autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Filter des eigenen Abos' });
        inp.addEventListener('input', function () { a.f = inp.value.trim(); render(false); });
        c.appendChild(el('label', { class: 'v17-lbl', for: id, text: 'abonniert:' })); c.appendChild(inp);
      } else {
        c.appendChild(el('p', { class: 'v17-filter' }, [el('span', { class: 'k-small k-muted', text: 'abonniert: ' }), el('code', { class: 'k-i', text: a.f })]));
      }
      var res = el('p', { class: 'v17-res', 'aria-hidden': 'false' });
      c.appendChild(res);
      subs.appendChild(c);
      return { c: c, res: res };
    });

    function render(zeigeErgebnis) {
      clear(pubC);
      pubC.appendChild(el('p', { class: 'v17-ch', text: 'Maschine (Publisher)' }));
      if (letzte === null) pubC.appendChild(el('p', { class: 'k-small k-muted', text: 'Noch nichts gesendet.' }));
      else {
        var m = MELDUNGEN[letzte];
        pubC.appendChild(el('p', { class: 'v17-filter' }, [el('span', { class: 'k-small k-muted', text: 'Topic: ' }), el('code', { class: 'k-i', text: m.t })]));
        pubC.appendChild(el('p', { class: 'v17-filter' }, [el('span', { class: 'k-small k-muted', text: 'Nachricht: ' }), el('code', { class: 'k-i', text: m.p })]));
      }
      clear(brC);
      brC.appendChild(el('p', { class: 'v17-ch', text: 'Broker 192.168.30.5:1883' }));
      brC.appendChild(el('p', { class: 'k-small k-muted', text: 'vergleicht das Topic mit jedem Abo' }));
      cards.forEach(function (k, i) {
        var a = abos[i], pr = filterPruefen(a.f);
        k.c.classList.remove('is-hit', 'is-miss', 'is-bad');
        clear(k.res);
        if (!pr.ok) { k.c.classList.add('is-bad'); k.res.textContent = 'Ungültiger Filter: ' + pr.why; return; }
        if (!zeigeErgebnis || letzte === null) { k.res.textContent = ''; return; }
        var r = topicPasst(a.f, MELDUNGEN[letzte].t);
        k.c.classList.add(r.ok ? 'is-hit' : 'is-miss');
        k.res.appendChild(el('strong', { text: r.ok ? 'Empfängt die Nachricht. ' : 'Bekommt nichts. ' }));
        k.res.appendChild(document.createTextNode(r.why));
      });
    }
    function senden(i) {
      timers.forEach(clearTimeout); timers = [];
      letzte = i;
      Array.prototype.forEach.call(seg.children, function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      var m = MELDUNGEN[i];
      render(false);
      pubC.classList.add('is-active'); brC.classList.remove('is-active');
      live.className = 'v17-verdict'; live.textContent = 'Publish: ' + m.t + ' geht an den Broker.';
      function stufe2() { pubC.classList.remove('is-active'); brC.classList.add('is-active'); live.textContent = 'Der Broker vergleicht das Topic ' + m.t + ' mit allen Abos.'; }
      function stufe3() {
        brC.classList.remove('is-active'); render(true);
        var an = [], pruef;
        abos.forEach(function (a) { if (filterPruefen(a.f).ok && topicPasst(a.f, m.t).ok) an.push(a.n); });
        live.className = 'v17-verdict ' + (an.length ? 'is-ok' : 'is-bad');
        live.textContent = an.length ? 'Zugestellt an: ' + an.join(', ') + '. Die anderen bekommen nichts.' : 'Kein Abonnent passt: Der Broker verwirft die Nachricht.';
      }
      if (reduced()) { stufe2(); stufe3(); }
      else { timers.push(setTimeout(stufe2, 600)); timers.push(setTimeout(stufe3, 1300)); }
    }
    render(false);
  }

  /* ══════════════════════════════════════════════════════════
     (F) PAP: Zellen-Check
     ══════════════════════════════════════════════════════════ */
  function initPap(host) {
    var K = root.KursPAP;
    if (!K || !K.P) { host.appendChild(el('p', { class: 'k-small k-muted', text: 'Der Programmablaufplan braucht pap-engine.js.' })); return; }
    var P = K.P;
    var spec = [
      P.start(), P.io('Daten holen: maschinen.json'),
      P.iff('Status 200?', [
        P.op('Netz = 192.168.30.0/24'),
        P.whil('weitere Maschine?', [
          P.op('IP der Maschine lesen'),
          P.iff('IP im Netz?', [P.io('id, IP: im Netz')], [P.io('id, IP: FALSCHES NETZ')])
        ])
      ], [P.io('Fehlermeldung ausgeben')]),
      P.end()
    ];
    var d = el('div', { class: 'v17-papbox' });
    d.innerHTML = K.figure(spec, { label: 'Programmablaufplan Zellen-Check: Daten holen, Status prüfen, bei 200 für jede Maschine prüfen, ob die IP im Zellennetz liegt, und im Netz oder falsches Netz ausgeben; sonst Fehlermeldung.' });
    host.appendChild(d);
  }

  function init() {
    var map = { zellennetz: initZellennetz, subnetz: initSubnetz, http: initHttp, json: initJson, mqtt: initMqtt, 'pap-zellencheck': initPap };
    Object.keys(map).forEach(function (k) { Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="' + k + '"]'), map[k]); });
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = core;
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})(typeof window !== 'undefined' ? window : globalThis);
