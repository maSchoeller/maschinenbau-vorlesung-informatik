/* =============================================================
   explorables-v06.js – interaktive Bausteine für Termin 06 (Hexadezimalsystem, Schleife in Schleife, XOR)
     data-explorable="hexfarbe"       „Hex-Farbmischer“: drei Regler Rot, Grün, Blau (0 bis 255) mit Zahlfeld, Farbcode als Eingabefeld;
                                      je Byte zwei Vierergruppen mit Hex-Ziffer, der Farbcode und die Farbfläche, die Farbe immer auch als Text
     data-explorable="doppelschleife" „Schleife in Schleife“: Grenzen für i und j mit Plus und Minus, Schalter „Würfelpaare“,
                                      die zwei for-Zeilen, Tabelle i, j, Durchläufe und ein Raster, das sich Zelle für Zelle füllt
     data-explorable="xorschrift"     „XOR-Geheimschrift“: ein Wort aus 1 bis 6 Buchstaben, ein Schlüssel von 0 bis 31 (fünf Schalter oder Zahl),
                                      je Buchstabe Zahl, 5 Bit, Schlüssel und XOR-Ergebnis; „Noch einmal mit demselben Schlüssel“ ergibt das Wort
   Eigenständig wie alle explorables-vNN.js: keine Bibliothek, Texte per textContent.
   Der Rechenkern steht oben und ist ohne Browser prüfbar (module.exports, app/skripte/tests/explorables-v06.test.mjs).
   Meldungstexte ohne Gedankenstrich. Zustand steht immer auch als Wort, Zeichen oder Linienstärke da, nie nur als Farbe.
   ============================================================= */
(function () {
  'use strict';

  /* ── Rechenkern: Hex und Farbe (ohne DOM) ─────────────────── */
  var HEX = '0123456789ABCDEF';
  function klemme(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
  function bytGueltig(z) { return typeof z === 'number' && isFinite(z) && z === Math.floor(z) && z >= 0 && z <= 255; }
  function vier(n) { var s = n.toString(2); while (s.length < 4) s = '0' + s; return s; }
  /* ein Byte: zwei Vierergruppen, je Gruppe die Hex-Ziffer; 226 ergibt 1110 0010, E und 2 */
  function byteHex(z) {
    var hoch = z >> 4, tief = z & 15;
    return {
      zahl: z, bits: vier(hoch) + vier(tief), gruppen: [vier(hoch), vier(tief)], ziffern: [HEX.charAt(hoch), HEX.charAt(tief)],
      hex: HEX.charAt(hoch) + HEX.charAt(tief),
      satz: vier(hoch) + ' ist ' + HEX.charAt(hoch) + ', ' + vier(tief) + ' ist ' + HEX.charAt(tief) + '.'
    };
  }
  function farbcode(r, g, b) { return '#' + byteHex(r).hex + byteHex(g).hex + byteHex(b).hex; }
  /* Die Farbe als Text, damit sie nie nur als Fläche da ist */
  function farbText(r, g, b) { return 'Rot ' + r + ', Grün ' + g + ', Blau ' + b; }
  function farbWort(r, g, b) {
    var c = farbcode(r, g, b);
    if (c === '#FFFFFF') return 'Weiß: alle drei Bytes sind FF, alle Bits an.';
    if (c === '#000000') return 'Schwarz: alle drei Bytes sind 00, alle Bits aus.';
    if (c === '#FF0000') return 'Reines Rot: nur das Rot-Byte ist FF.';
    if (c === '#00FF00') return 'Reines Grün: nur das Grün-Byte ist FF.';
    if (c === '#0000FF') return 'Reines Blau: nur das Blau-Byte ist FF.';
    if (c === '#E2001A') return 'Das Rot der DHBW.';
    if (r === g && g === b) return 'Ein Grau: alle drei Bytes sind gleich.';
    return '';
  }
  var MELDUNG_CODE = 'Ein Farbcode hat sechs Hex-Ziffern: 0 bis 9 und A bis F, zum Beispiel E2001A.';
  /* Farbcode prüfen: mit oder ohne #, Groß- und Kleinschreibung egal, genau sechs Hex-Ziffern */
  function pruefeFarbcode(text) {
    var t = String(text === undefined || text === null ? '' : text).replace(/\s+/g, '');
    if (t.charAt(0) === '#') t = t.slice(1);
    if (!/^[0-9a-fA-F]+$/.test(t)) return { ok: false, meldung: MELDUNG_CODE };
    if (t.length !== 6) return { ok: false, meldung: t.length < 6 ? 'Es fehlen noch Ziffern. ' + MELDUNG_CODE : 'Das sind zu viele Ziffern. ' + MELDUNG_CODE };
    t = t.toUpperCase();
    return { ok: true, r: parseInt(t.slice(0, 2), 16), g: parseInt(t.slice(2, 4), 16), b: parseInt(t.slice(4, 6), 16), code: '#' + t };
  }
  function pruefeKanal(text) {
    var t = String(text === undefined || text === null ? '' : text).replace(/\s+/g, '');
    if (t === '' || !/^\d+$/.test(t)) return { ok: false, meldung: 'Gib eine ganze Zahl von 0 bis 255 ein.' };
    var n = Number(t);
    if (n > 255) return { ok: false, meldung: 'Ein Byte reicht von 0 bis 255.' };
    return { ok: true, zahl: n };
  }
  var KANAELE = ['Rot', 'Grün', 'Blau'];
  /* alles, was der Baustein zeigt, für drei Zahlen */
  function ansichtFarbe(r, g, b) {
    var w = [r, g, b], k = w.map(byteHex);
    return {
      werte: w, kanaele: k, code: farbcode(r, g, b), text: farbText(r, g, b), wort: farbWort(r, g, b),
      satz: 'Farbcode ' + farbcode(r, g, b) + '. ' + farbText(r, g, b) + '.' + (farbWort(r, g, b) ? ' ' + farbWort(r, g, b) : '')
    };
  }

  /* ── Rechenkern: Schleife in Schleife (ohne DOM) ──────────── */
  var GRENZE_MAX = 6, GRENZE_MIN = 1;
  /* Einstellungen: Grenzen (letzter Wert von i und j) oder Würfelmodus (6 und 6, Summe 7) */
  function einstellung(a, b, wuerfel) {
    if (wuerfel) { a = 6; b = 6; }
    return { a: klemme(a, GRENZE_MIN, GRENZE_MAX), b: klemme(b, GRENZE_MIN, GRENZE_MAX), wuerfel: !!wuerfel };
  }
  function durchlaeufeInnen(a, b) { return a * b; }
  function rechnungInnen(a, b) { return a + ' mal ' + b + ' = ' + (a * b) + ' Durchläufe des inneren Rumpfs'; }
  function zeilenText(c) {
    var z = [];
    if (c.wuerfel) z.push({ ein: 0, text: 'anzahl = 0', art: 'start' });
    z.push({ ein: 0, text: 'for i in range(1, ' + (c.a + 1) + '):', art: 'i' });
    z.push({ ein: 1, text: 'for j in range(1, ' + (c.b + 1) + '):', art: 'j' });
    if (c.wuerfel) {
      z.push({ ein: 2, text: 'if i + j == 7:', art: 'if' });
      z.push({ ein: 3, text: 'anzahl = anzahl + 1', art: 'rumpf' });
      z.push({ ein: 0, text: 'print(anzahl)', art: 'ende' });
    } else z.push({ ein: 2, text: 'print(i, j)', art: 'rumpf' });
    return z;
  }
  /* Alle Durchläufe des inneren Rumpfs in der richtigen Reihenfolge */
  function durchlaeufe(c) {
    var r = [], n = 0, treffer = 0, i, j;
    for (i = 1; i <= c.a; i++) {
      for (j = 1; j <= c.b; j++) {
        n++;
        var tr = c.wuerfel && i + j === 7;
        if (tr) treffer++;
        r.push({ nr: n, i: i, j: j, neuesI: j === 1, treffer: tr, trefferBisher: treffer });
      }
    }
    return r;
  }
  function trefferGesamt(c) { return durchlaeufe(c).filter(function (d) { return d.treffer; }).length; }
  /* Satz zum Stand nach p Durchläufen (0 = am Anfang) */
  function satzSchleife(c, p) {
    var d = durchlaeufe(c);
    if (p <= 0) return 'Noch kein Durchlauf. Als Nächstes: i ist 1, j ist 1.';
    var e = d[Math.min(p, d.length) - 1];
    var s = 'Durchlauf ' + e.nr + ': i ist ' + e.i + ', j ist ' + e.j + '.';
    if (e.j === 1 && e.i > 1) s = 'Durchlauf ' + e.nr + ': i ist ' + e.i + ', und j beginnt wieder bei 1.';
    if (c.wuerfel && e.treffer) s += ' Summe 7: Treffer ' + e.trefferBisher + '.';
    if (p >= d.length) s += ' Beide Schleifen sind zu Ende' + (c.wuerfel ? ': ' + trefferGesamt(c) + ' Würfelpaare haben die Summe 7.' : '.');
    return s;
  }
  /* Welche Zeilen sind nach p Durchläufen aktiv? */
  function aktiveZeilen(c, p) {
    if (p <= 0) return [];
    var d = durchlaeufe(c), e = d[Math.min(p, d.length) - 1], z = zeilenText(c), r = [];
    z.forEach(function (x, k) {
      if (x.art === 'i' && e.neuesI) r.push(k);
      else if (x.art === 'j') r.push(k);
      else if (x.art === 'if') r.push(k);
      else if (x.art === 'ende' && p >= d.length) r.push(k);
      else if (x.art === 'rumpf' && (!c.wuerfel || e.treffer)) r.push(k);
    });
    return r;
  }

  /* ── Rechenkern: XOR-Geheimschrift (ohne DOM) ─────────────── */
  var A_BIS_Z = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function zahlVon(buchstabe) { return A_BIS_Z.indexOf(buchstabe) + 1; }
  /* 1 bis 26 sind Buchstaben, alles andere (0 und 27 bis 31) bekommt ein Fragezeichen */
  function buchstabeVon(zahl) { return zahl >= 1 && zahl <= 26 ? A_BIS_Z.charAt(zahl - 1) : '?'; }
  function fuenf(n) { var s = n.toString(2); while (s.length < 5) s = '0' + s; return s; }
  /* XOR spaltenweise: jede Stelle für sich, genau eins von beiden ergibt 1 */
  function xorBits(a, b) {
    var r = '';
    for (var k = 0; k < a.length; k++) r += a.charAt(k) !== b.charAt(k) ? '1' : '0';
    return r;
  }
  function xorZahl(a, b) { return parseInt(xorBits(fuenf(a), fuenf(b)), 2); }
  function keinBuchstabe(z) { return 'Für ' + z + ' gibt es keinen Buchstaben. Er bleibt als Zahl stehen.'; }
  /* Eine Spalte: Zahl, Bits, Schlüssel, Ergebnis */
  function spalte(zahl, schluessel) {
    var e = xorZahl(zahl, schluessel);
    return {
      zahl: zahl, buchstabe: buchstabeVon(zahl), bits: fuenf(zahl), schluesselBits: fuenf(schluessel),
      ergebnis: e, ergebnisBits: fuenf(e), ergebnisBuchstabe: buchstabeVon(e), hatBuchstabe: e >= 1 && e <= 26
    };
  }
  /* Wort verschlüsseln: xor5('HALLO', 13) ergibt die Spalten, Geheimtext ELAAB */
  function xor5(wort, schluessel) {
    var s = [], k;
    for (k = 0; k < wort.length; k++) s.push(spalte(zahlVon(wort.charAt(k)), schluessel));
    return {
      wort: wort, schluessel: schluessel, spalten: s,
      zahlen: s.map(function (x) { return x.ergebnis; }),
      text: s.map(function (x) { return x.ergebnisBuchstabe; }).join('')
    };
  }
  /* Noch einmal mit demselben Schlüssel, aber mit den Zahlen des Geheimtextes (so geht es immer, auch bei 0 und 27 bis 31) */
  function nocheinmal(ergebnis) {
    var s = ergebnis.zahlen.map(function (z) { return spalte(z, ergebnis.schluessel); });
    return { schluessel: ergebnis.schluessel, spalten: s, zahlen: s.map(function (x) { return x.ergebnis; }), text: s.map(function (x) { return x.ergebnisBuchstabe; }).join('') };
  }
  var MELDUNG_WORT = 'Schreib 1 bis 6 Buchstaben von A bis Z. Umlaute und Zahlen gehen nicht.';
  function pruefeWort(text) {
    var t = String(text === undefined || text === null ? '' : text).replace(/\s+/g, '');
    if (t === '') return { ok: false, meldung: MELDUNG_WORT };
    t = t.toUpperCase();
    if (!/^[A-Z]+$/.test(t)) return { ok: false, meldung: MELDUNG_WORT };
    if (t.length > 6) return { ok: false, meldung: 'Das Wort ist zu lang. ' + MELDUNG_WORT };
    return { ok: true, wort: t };
  }
  function pruefeSchluessel(text) {
    var t = String(text === undefined || text === null ? '' : text).replace(/\s+/g, '');
    if (t === '' || !/^\d+$/.test(t)) return { ok: false, meldung: 'Der Schlüssel ist eine ganze Zahl von 0 bis 31.' };
    var n = Number(t);
    if (n > 31) return { ok: false, meldung: 'Fünf Bit reichen nur von 0 bis 31.' };
    return { ok: true, zahl: n };
  }
  function schluesselHinweis(k) { return k === 0 ? 'Dieser Schlüssel ändert nichts.' : ''; }
  function satzXor(e, zweite) {
    var s = 'Wort ' + e.wort + ', Schlüssel ' + e.schluessel + ' (' + fuenf(e.schluessel) + '). Ergebnis als Zahlen: ' + e.zahlen.join(', ') + ', als Buchstaben: ' + e.text + '.';
    if (zweite) s += ' Noch einmal mit demselben Schlüssel ergibt ' + zweite.text + '.';
    return s;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      HEX: HEX, KANAELE: KANAELE, klemme: klemme, bytGueltig: bytGueltig, byteHex: byteHex, farbcode: farbcode, farbText: farbText, farbWort: farbWort,
      pruefeFarbcode: pruefeFarbcode, pruefeKanal: pruefeKanal, ansichtFarbe: ansichtFarbe, MELDUNG_CODE: MELDUNG_CODE,
      GRENZE_MAX: GRENZE_MAX, GRENZE_MIN: GRENZE_MIN, einstellung: einstellung, durchlaeufeInnen: durchlaeufeInnen, rechnungInnen: rechnungInnen,
      zeilenText: zeilenText, durchlaeufe: durchlaeufe, trefferGesamt: trefferGesamt, satzSchleife: satzSchleife, aktiveZeilen: aktiveZeilen,
      zahlVon: zahlVon, buchstabeVon: buchstabeVon, fuenf: fuenf, xorBits: xorBits, xorZahl: xorZahl, keinBuchstabe: keinBuchstabe, spalte: spalte, xor5: xor5,
      nocheinmal: nocheinmal, pruefeWort: pruefeWort, pruefeSchluessel: pruefeSchluessel, schluesselHinweis: schluesselHinweis, satzXor: satzXor
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
  function aktion(text, leise) { return el('button', { type: 'button', class: 'v06-aktion' + (leise ? ' v06-aktion--leise' : ''), text: text }); }
  function sperre(b, aus) { b.setAttribute('aria-disabled', aus ? 'true' : 'false'); b.classList.toggle('is-aus', !!aus); }
  function schalterKnopf(text, fn) {
    var b = el('button', { type: 'button', class: 'v06-schalter', role: 'switch', 'aria-checked': 'false' });
    var z = el('span', { class: 'v06-schalter__zustand', 'aria-hidden': 'true' });
    b.appendChild(el('span', { class: 'v06-schalter__name', text: text }));
    b.appendChild(el('span', { class: 'v06-schalter__hebel', 'aria-hidden': 'true' }));
    b.appendChild(z);
    b.addEventListener('click', fn);
    return { knopf: b, zustand: z };
  }
  function setzeSchalter(s, an) {
    s.knopf.setAttribute('aria-checked', an ? 'true' : 'false');
    s.knopf.classList.toggle('is-an', !!an);
    s.zustand.textContent = an ? 'an' : 'aus';
  }
  function stepper(label, wert, lo, hi, fn) {
    var minus = el('button', { type: 'button', class: 'v06-knopf v06-stufe', text: '−', 'aria-label': label + ' verkleinern' });
    var plus = el('button', { type: 'button', class: 'v06-knopf v06-stufe', text: '+', 'aria-label': label + ' vergrößern' });
    var zeigt = el('output', { class: 'v06-stufe__wert', 'aria-label': label });
    var w = wert, gesperrt = false;
    function setze(x) { w = klemme(x, lo, hi); zeigt.textContent = String(w); sperre(minus, w <= lo); sperre(plus, w >= hi); }
    minus.addEventListener('click', function () { if (!gesperrt && w > lo) { setze(w - 1); fn(w); } });
    plus.addEventListener('click', function () { if (!gesperrt && w < hi) { setze(w + 1); fn(w); } });
    setze(wert);
    return { zeile: el('div', { class: 'v06-stufen', role: 'group', 'aria-label': label }, [el('span', { class: 'v06-stufen__name', text: label }), minus, zeigt, plus]), setze: setze, sperre: function (aus) { gesperrt = !!aus; sperre(minus, aus || w <= lo); sperre(plus, aus || w >= hi); } };
  }

  /* ── hexfarbe ─────────────────────────────────────────────── */
  function initHexfarbe(host) {
    var id = 'v06-hex-' + (++nr);
    var w = [226, 0, 26];
    host.textContent = '';
    var regler = [], zahlfelder = [], bytBloecke = [];
    var kanalMeld = el('p', { class: 'v06-meldung', role: 'alert', hidden: '' });
    var reglerHost = el('div', { class: 'v06-kanaele' });
    KANAELE.forEach(function (name, k) {
      var r = el('input', { type: 'range', id: id + '-r' + k, class: 'v06-regler', min: '0', max: '255', step: '1', 'aria-label': name + ', Regler von 0 bis 255' });
      var f = el('input', { type: 'number', id: id + '-n' + k, class: 'v06-feld v06-feld--eng', min: '0', max: '255', step: '1', inputmode: 'numeric', 'aria-label': name + ', Zahl von 0 bis 255' });
      r.value = String(w[k]); f.value = String(w[k]);
      r.addEventListener('input', function () { w[k] = Number(r.value); f.value = r.value; f.removeAttribute('aria-invalid'); kanalMeld.hidden = true; zeige(true, ''); });
      f.addEventListener('input', function () {
        var p = pruefeKanal(f.value);
        if (p.ok) { w[k] = p.zahl; r.value = String(p.zahl); f.removeAttribute('aria-invalid'); kanalMeld.hidden = true; zeige(true, ''); }
        else { f.setAttribute('aria-invalid', 'true'); kanalMeld.textContent = p.meldung; kanalMeld.hidden = false; }
      });
      f.addEventListener('change', function () { f.value = String(w[k]); f.removeAttribute('aria-invalid'); kanalMeld.hidden = true; });
      regler.push(r); zahlfelder.push(f);
      reglerHost.appendChild(el('div', { class: 'v06-kanal' }, [
        el('label', { class: 'v06-kanal__name', for: id + '-r' + k, text: name }), r, f
      ]));
    });
    var codeFeld = el('input', { type: 'text', id: id + '-code', class: 'v06-feld v06-feld--code', maxlength: '9', autocomplete: 'off', spellcheck: 'false', 'aria-describedby': id + '-codehilfe' });
    var codeMeld = el('p', { class: 'v06-meldung', role: 'alert', hidden: '' });
    codeFeld.addEventListener('input', function () {
      var p = pruefeFarbcode(codeFeld.value);
      if (p.ok) {
        w = [p.r, p.g, p.b]; codeFeld.removeAttribute('aria-invalid'); codeMeld.hidden = true; zeige(true, '', true);
      } else { codeFeld.setAttribute('aria-invalid', 'true'); codeMeld.textContent = p.meldung; codeMeld.hidden = false; }
    });
    codeFeld.addEventListener('change', function () { codeFeld.value = farbcode(w[0], w[1], w[2]); codeFeld.removeAttribute('aria-invalid'); codeMeld.hidden = true; });
    var codeZeile = el('div', { class: 'v06-feldzeile' }, [el('label', { for: id + '-code', text: 'Farbcode eintippen' }), codeFeld,
      el('p', { id: id + '-codehilfe', class: 'k-small k-muted', text: 'Sechs Hex-Ziffern, zum Beispiel E2001A. Groß oder klein ist egal.' })]);
    var blockHost = el('div', { class: 'v06-bytebloecke' });
    KANAELE.forEach(function (name) {
      var tit = el('p', { class: 'v06-byte__titel' });
      var zahlEl = el('p', { class: 'v06-byte__zahl' });
      var gr = [0, 1].map(function () {
        var bitsEl = el('code', { class: 'v06-gruppe__bits' });
        var hexEl = el('strong', { class: 'v06-gruppe__hex' });
        var pf = el('span', { class: 'v06-gruppe__pfeil', 'aria-hidden': 'true', text: '→' });
        return { bits: bitsEl, hex: hexEl, el: el('div', { class: 'v06-gruppe' }, [bitsEl, pf, hexEl]) };
      });
      var satz = el('p', { class: 'v06-byte__satz' });
      var b = el('div', { class: 'v06-byte', role: 'group', 'aria-label': 'Byte ' + name }, [tit, zahlEl, el('div', { class: 'v06-gruppen' }, [gr[0].el, gr[1].el]), satz]);
      bytBloecke.push({ tit: tit, zahl: zahlEl, gr: gr, satz: satz, name: name });
      blockHost.appendChild(b);
    });
    var codeGross = el('strong', { class: 'v06-codegross' });
    var fl = el('span', { class: 'v06-flaeche', role: 'img' });
    var farbEl = el('p', { class: 'v06-farbtext' });
    var wortEl = el('p', { class: 'v06-hinweis' });
    var status = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    function zeige(ansagen, vorsatz, vomCode) {
      var a = ansichtFarbe(w[0], w[1], w[2]);
      for (var k = 0; k < 3; k++) {
        if (document.activeElement !== regler[k]) regler[k].value = String(w[k]);
        if (document.activeElement !== zahlfelder[k]) zahlfelder[k].value = String(w[k]);
        var bb = bytBloecke[k], kk = a.kanaele[k];
        bb.tit.textContent = KANAELE[k] + ': Byte ' + kk.hex;
        bb.zahl.textContent = 'Dezimal ' + kk.zahl;
        [0, 1].forEach(function (g) { bb.gr[g].bits.textContent = kk.gruppen[g]; bb.gr[g].hex.textContent = kk.ziffern[g]; });
        bb.satz.textContent = kk.satz;
      }
      if (!vomCode) codeFeld.value = a.code;
      codeGross.textContent = a.code;
      fl.style.backgroundColor = 'rgb(' + w[0] + ',' + w[1] + ',' + w[2] + ')';
      fl.setAttribute('aria-label', 'Farbfläche: ' + a.text);
      farbEl.textContent = a.text;
      wortEl.textContent = a.wort; wortEl.hidden = !a.wort;
      if (ansagen) status.textContent = (vorsatz || '') + a.satz;
    }
    zeige(false);
    host.appendChild(el('div', { class: 'v06-hexfarbe' }, [
      el('div', { class: 'v06-hexfarbe__links' }, [
        el('p', { class: 'v06-titel', text: 'Drei Regler, je von 0 bis 255' }), reglerHost, kanalMeld,
        codeZeile, codeMeld
      ]),
      el('div', { class: 'v06-hexfarbe__rechts' }, [
        el('p', { class: 'v06-titel', text: 'Farbcode' }), el('p', { class: 'v06-codezeile' }, [codeGross, fl]), farbEl, wortEl,
        el('p', { class: 'v06-titel', text: 'Die drei Bytes in Vierergruppen' }), blockHost, status
      ])
    ]));
  }

  /* ── doppelschleife ───────────────────────────────────────── */
  function initDoppelschleife(host) {
    var a = 3, b = 4, wuerfel = false, p = 0, c = einstellung(a, b, wuerfel), d = durchlaeufe(c);
    host.textContent = '';
    var sI = stepper('Grenze für i', a, GRENZE_MIN, GRENZE_MAX, function (x) { a = x; reset('Grenze für i ist ' + x + '. '); });
    var sJ = stepper('Grenze für j', b, GRENZE_MIN, GRENZE_MAX, function (x) { b = x; reset('Grenze für j ist ' + x + '. '); });
    var sw = schalterKnopf('Würfelpaare (6 mal 6) mit Summe 7', function () { wuerfel = !wuerfel; reset(wuerfel ? 'Würfelmodus an. ' : 'Würfelmodus aus. '); });
    var codeEl = el('div', { class: 'v06-prog', role: 'region', 'aria-label': 'Das Programm, die zuletzt ausgeführten Zeilen sind markiert', tabindex: '0' });
    var einer = aktion('Ein Schritt'), ende = aktion('Bis zum Ende'), zurueck = aktion('Von vorn', true);
    var jetzt = el('p', { class: 'v06-jetzt' });
    var rechnungEl = el('p', { class: 'v06-rechnung' });
    var rasterHost = el('div', { class: 'v06-raster-host', tabindex: '0', role: 'region', 'aria-label': 'Raster: Zeilen sind i, Spalten sind j' });
    var tabelleHost = el('div', { class: 'v06-tabelle-host', tabindex: '0', role: 'region', 'aria-label': 'Durchläufe des inneren Rumpfs' });
    var zaehlerEl = el('p', { class: 'v06-zaehler', hidden: '' });
    var status = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    function zeige(ansagen, vorsatz) {
      var zl = zeilenText(c), akt = aktiveZeilen(c, p), fertig = p >= d.length;
      codeEl.textContent = '';
      zl.forEach(function (z, k) {
        var r = el('div', { class: 'v06-zeile' + (akt.indexOf(k) >= 0 ? ' is-jetzt' : ''), }, [
          el('span', { class: 'v06-zeile__nr', 'aria-hidden': 'true', text: String(k + 1) }),
          el('span', { class: 'v06-zeile__text', text: new Array(z.ein + 1).join('    ') + z.text })
        ]);
        if (akt.indexOf(k) >= 0) r.setAttribute('aria-current', 'true');
        codeEl.appendChild(r);
      });
      /* Raster */
      var cur = p > 0 ? d[p - 1] : null, zeilen = [], i, j;
      var kopf = [el('th', { scope: 'col', class: 'v06-raster__ecke', text: 'i \\ j' })];
      for (j = 1; j <= c.b; j++) kopf.push(el('th', { scope: 'col', text: 'j ' + j }));
      for (i = 1; i <= c.a; i++) {
        var zellen = [el('th', { scope: 'row', text: 'i ' + i })];
        for (j = 1; j <= c.b; j++) {
          var idx = (i - 1) * c.b + (j - 1), e = d[idx], getan = idx < p, jetztZ = cur && cur.i === i && cur.j === j;
          var cls = 'v06-zelle' + (getan ? ' is-getan' : '') + (jetztZ ? ' is-jetzt' : '') + (getan && e.treffer ? ' is-treffer' : '');
          var txt = getan ? String(e.nr) : '';
          var z = el('td', { class: cls }, [el('span', { class: 'v06-zelle__nr', text: txt })]);
          if (getan && e.treffer) z.appendChild(el('span', { class: 'v06-zelle__marke', text: 'Summe 7' }));
          if (jetztZ) z.setAttribute('aria-current', 'true');
          z.setAttribute('aria-label', 'i ' + i + ', j ' + j + ': ' + (getan ? 'Durchlauf ' + e.nr + (e.treffer ? ', Summe 7' : '') : 'noch nicht dran'));
          zellen.push(z);
        }
        zeilen.push(el('tr', {}, zellen));
      }
      rasterHost.textContent = '';
      rasterHost.appendChild(el('table', { class: 'v06-raster' }, [
        el('caption', { class: 'k-sr', text: 'Raster der Durchläufe. Die Zeilen sind die Werte von i, die Spalten die Werte von j. In jeder erledigten Zelle steht die Nummer des Durchlaufs.' }),
        el('thead', {}, [el('tr', {}, kopf)]), el('tbody', {}, zeilen)
      ]));
      /* Tabelle */
      var tz = [], q;
      for (q = 1; q <= p; q++) {
        var x = d[q - 1];
        var tr = el('tr', { class: q === p ? 'is-jetzt' : '' }, [el('th', { scope: 'row', text: String(x.nr) }), el('td', { text: String(x.i) }), el('td', { text: String(x.j) })].concat(c.wuerfel ? [el('td', { text: x.treffer ? 'ja' : 'nein' })] : []));
        if (q === p) tr.setAttribute('aria-current', 'true');
        tz.push(tr);
      }
      var sp = ['Durchlauf', 'i', 'j'].concat(c.wuerfel ? ['i + j ist 7'] : []);
      tabelleHost.textContent = '';
      tabelleHost.appendChild(el('table', { class: 'k-types v06-tabelle' }, [
        el('caption', { class: 'k-sr', text: 'Die Werte von i und j bei jedem Durchlauf des inneren Rumpfs; die letzte Zeile ist markiert' }),
        el('thead', {}, [el('tr', {}, sp.map(function (t) { return el('th', { scope: 'col', text: t }); }))]),
        el('tbody', {}, tz.length ? tz : [el('tr', {}, [el('td', { colspan: String(sp.length), text: 'Noch kein Durchlauf.' })])])
      ]));
      rechnungEl.textContent = rechnungInnen(c.a, c.b) + '.';
      zaehlerEl.hidden = !c.wuerfel;
      zaehlerEl.textContent = c.wuerfel ? 'Treffer bisher: ' + (cur ? cur.trefferBisher : 0) + ' (Würfelpaare mit Summe 7)' : '';
      jetzt.textContent = p === 0 ? 'Noch kein Durchlauf.' : (fertig ? 'Fertig: Beide Schleifen sind zu Ende.' : 'Zuletzt: Durchlauf ' + p + ' von ' + d.length + '.');
      setzeSchalter(sw, wuerfel);
      sI.sperre(wuerfel); sJ.sperre(wuerfel);
      sperre(einer, fertig); sperre(ende, fertig); sperre(zurueck, p === 0);
      if (ansagen) status.textContent = (vorsatz || '') + satzSchleife(c, p);
    }
    function reset(vorsatz) {
      c = einstellung(a, b, wuerfel); d = durchlaeufe(c); p = 0;
      if (wuerfel) { sI.setze(6); sJ.setze(6); sI.sperre(true); sJ.sperre(true); } else { sI.setze(a); sJ.setze(b); }
      zeige(!!vorsatz, vorsatz ? vorsatz + 'Das Programm steht am Anfang. ' : '');
    }
    einer.addEventListener('click', function () { if (p >= d.length) return; p++; zeige(true); });
    ende.addEventListener('click', function () { if (p >= d.length) return; p = d.length; zeige(true); });
    zurueck.addEventListener('click', function () { if (p === 0) return; p = 0; zeige(true, 'Von vorn. '); });
    reset('');
    host.appendChild(el('div', { class: 'v06-doppel' }, [
      el('div', { class: 'v06-doppel__links' }, [
        el('p', { class: 'v06-titel', text: 'Grenzen einstellen' }), sI.zeile, sJ.zeile,
        el('div', { class: 'v06-schalterreihe' }, [sw.knopf]), codeEl, rechnungEl,
        el('div', { class: 'v06-aktionen' }, [einer, ende, zurueck]), jetzt, zaehlerEl
      ]),
      el('div', { class: 'v06-doppel__rechts' }, [
        el('p', { class: 'v06-titel', text: 'Raster: Zeilen i, Spalten j' }), rasterHost,
        el('p', { class: 'v06-titel', text: 'Durchläufe' }), tabelleHost, status
      ])
    ]));
  }

  /* ── xorschrift ───────────────────────────────────────────── */
  function initXorschrift(host) {
    var id = 'v06-xor-' + (++nr);
    var wort = 'HALLO', key = 13, zweite = false;
    host.textContent = '';
    var wortFeld = el('input', { type: 'text', id: id + '-wort', class: 'v06-feld v06-feld--wort', maxlength: '8', autocomplete: 'off', spellcheck: 'false', 'aria-describedby': id + '-wortHilfe' });
    wortFeld.value = wort;
    var wortMeld = el('p', { class: 'v06-meldung', role: 'alert', hidden: '' });
    var schlFeld = el('input', { type: 'number', id: id + '-schl', class: 'v06-feld v06-feld--eng', min: '0', max: '31', step: '1', inputmode: 'numeric' });
    schlFeld.value = String(key);
    var schlMeld = el('p', { class: 'v06-meldung', role: 'alert', hidden: '' });
    var kipp = [];
    var kippHost = el('div', { class: 'v06-kippreihe', role: 'group', 'aria-label': 'Fünf Schalter für den Schlüssel, links der Stellenwert 16, rechts 1' });
    [16, 8, 4, 2, 1].forEach(function (wert, pos) {
      var bt = el('button', { type: 'button', class: 'v06-bit', role: 'switch', 'aria-checked': 'false', 'aria-label': 'Schlüssel, Stellenwert ' + wert });
      var zf = el('span', { class: 'v06-bit__ziffer' });
      bt.appendChild(el('span', { class: 'v06-bit__wert', text: String(wert) }));
      bt.appendChild(el('span', { class: 'v06-bit__hebel', 'aria-hidden': 'true' }));
      bt.appendChild(zf);
      bt.addEventListener('click', function () { key = key ^ wert; zweite = false; schlMeld.hidden = true; schlFeld.removeAttribute('aria-invalid'); zeige(true, 'Schalter ' + wert + ((key & wert) ? ' an. ' : ' aus. ')); });
      kipp.push({ b: bt, z: zf, wert: wert });
      kippHost.appendChild(bt);
    });
    wortFeld.addEventListener('input', function () {
      var pw = pruefeWort(wortFeld.value);
      if (pw.ok) { wort = pw.wort; zweite = false; wortFeld.removeAttribute('aria-invalid'); wortMeld.hidden = true; zeige(true, ''); }
      else { wortFeld.setAttribute('aria-invalid', 'true'); wortMeld.textContent = pw.meldung; wortMeld.hidden = false; }
    });
    wortFeld.addEventListener('change', function () { wortFeld.value = wort; wortFeld.removeAttribute('aria-invalid'); wortMeld.hidden = true; });
    schlFeld.addEventListener('input', function () {
      var ps = pruefeSchluessel(schlFeld.value);
      if (ps.ok) { key = ps.zahl; zweite = false; schlFeld.removeAttribute('aria-invalid'); schlMeld.hidden = true; zeige(true, ''); }
      else { schlFeld.setAttribute('aria-invalid', 'true'); schlMeld.textContent = ps.meldung; schlMeld.hidden = false; }
    });
    schlFeld.addEventListener('change', function () { schlFeld.value = String(key); schlFeld.removeAttribute('aria-invalid'); schlMeld.hidden = true; });
    var nochmal = aktion('Noch einmal mit demselben Schlüssel'), zurueck = aktion('Zurück zum Wort', true);
    nochmal.addEventListener('click', function () { if (zweite) return; zweite = true; zeige(true, ''); });
    zurueck.addEventListener('click', function () { if (!zweite) return; zweite = false; zeige(true, 'Zurück zum Wort. '); });
    var schlHinweis = el('p', { class: 'v06-hinweis' });
    var tabHost = el('div', { class: 'v06-xor-host', tabindex: '0', role: 'region', 'aria-label': 'Verschlüsselung Buchstabe für Buchstabe' });
    var keineMeld = el('p', { class: 'v06-hinweis' });
    var ergebnisEl = el('p', { class: 'v06-rechnung' });
    var status = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    function zelle(t, cls, tag) { return el(tag || 'td', { class: cls || '', text: t }); }
    function baueBlock(titel, spalten, mitBuchstabe) {
      var zeilen = [];
      zeilen.push(el('tr', {}, [el('th', { scope: 'row', text: mitBuchstabe ? 'Buchstabe' : 'Buchstabe (oder ?)' })].concat(spalten.map(function (s) { return zelle(s.buchstabe, 'v06-xor__buch'); }))));
      zeilen.push(el('tr', {}, [el('th', { scope: 'row', text: 'Zahl' })].concat(spalten.map(function (s) { return zelle(String(s.zahl)); }))));
      zeilen.push(el('tr', {}, [el('th', { scope: 'row', text: 'Bits' })].concat(spalten.map(function (s) { return zelle(s.bits, 'v06-xor__bits'); }))));
      zeilen.push(el('tr', {}, [el('th', { scope: 'row', text: 'Schlüssel' })].concat(spalten.map(function (s) { return zelle(s.schluesselBits, 'v06-xor__bits v06-xor__schl'); }))));
      zeilen.push(el('tr', { class: 'v06-xor__ergebnis' }, [el('th', { scope: 'row', text: 'XOR, Bits' })].concat(spalten.map(function (s) { return zelle(s.ergebnisBits, 'v06-xor__bits'); }))));
      zeilen.push(el('tr', { class: 'v06-xor__ergebnis' }, [el('th', { scope: 'row', text: 'XOR, Zahl' })].concat(spalten.map(function (s) { return zelle(String(s.ergebnis)); }))));
      zeilen.push(el('tr', { class: 'v06-xor__ergebnis' }, [el('th', { scope: 'row', text: 'XOR, Buchstabe' })].concat(spalten.map(function (s) { return zelle(s.ergebnisBuchstabe, s.hatBuchstabe ? 'v06-xor__buch' : 'v06-xor__buch is-kein'); }))));
      return el('table', { class: 'k-types v06-xor' }, [
        el('caption', { text: titel }),
        el('tbody', {}, zeilen)
      ]);
    }
    function zeige(ansagen, vorsatz) {
      var e = xor5(wort, key), z2 = zweite ? nocheinmal(e) : null;
      kipp.forEach(function (x) {
        var on = (key & x.wert) !== 0;
        x.b.setAttribute('aria-checked', on ? 'true' : 'false'); x.b.classList.toggle('is-an', on); x.z.textContent = on ? '1' : '0';
      });
      if (document.activeElement !== schlFeld) schlFeld.value = String(key);
      if (document.activeElement !== wortFeld) wortFeld.value = wort;
      schlHinweis.textContent = schluesselHinweis(key); schlHinweis.hidden = !schlHinweis.textContent;
      tabHost.textContent = '';
      tabHost.appendChild(baueBlock('Wort ' + wort + ' mit dem Schlüssel ' + fuenf(key) + ' verschlüsselt', e.spalten, true));
      var kein = e.spalten.filter(function (s) { return !s.hatBuchstabe; });
      var kz = kein.length ? kein[0].ergebnis : null;
      keineMeld.textContent = kein.length ? keinBuchstabe(kz) : ''; keineMeld.hidden = !kein.length;
      ergebnisEl.textContent = 'Geheimtext: ' + e.text + ' (Zahlen ' + e.zahlen.join(', ') + ')';
      if (z2) {
        tabHost.appendChild(baueBlock('Noch einmal mit demselben Schlüssel verknüpft: Das Wort ist zurück', z2.spalten, false));
        ergebnisEl.textContent += '. Danach: ' + z2.text;
      }
      sperre(nochmal, zweite); sperre(zurueck, !zweite);
      if (ansagen) status.textContent = (vorsatz || '') + satzXor(e, z2) + (kein.length ? ' ' + keinBuchstabe(kz) : '') + (key === 0 ? ' ' + schluesselHinweis(0) : '');
    }
    zeige(false);
    host.appendChild(el('div', { class: 'v06-xorbau' }, [
      el('div', { class: 'v06-xorbau__oben' }, [
        el('div', {}, [
          el('div', { class: 'v06-feldzeile' }, [el('label', { for: id + '-wort', text: 'Wort aus 1 bis 6 Buchstaben' }), wortFeld,
            el('p', { id: id + '-wortHilfe', class: 'k-small k-muted', text: 'A bis Z. A ist 1, B ist 2, bis Z ist 26.' })]), wortMeld
        ]),
        el('div', {}, [
          el('p', { class: 'v06-titel', text: 'Schlüssel: fünf Schalter' }), kippHost,
          el('div', { class: 'v06-feldzeile' }, [el('label', { for: id + '-schl', text: 'oder als Zahl von 0 bis 31' }), schlFeld]), schlMeld, schlHinweis
        ])
      ]),
      el('div', { class: 'v06-aktionen' }, [nochmal, zurueck]),
      tabHost, keineMeld, ergebnisEl, status
    ]));
  }

  function init() {
    var map = { hexfarbe: initHexfarbe, doppelschleife: initDoppelschleife, xorschrift: initXorschrift };
    Object.keys(map).forEach(function (k) {
      Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="' + k + '"]'), function (host) {
        if (host._v06) return;
        host._v06 = true;
        map[k](host);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
