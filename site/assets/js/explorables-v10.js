/* =============================================================
   explorables-v10.js – interaktive Bausteine für Termin 10 (Speicher, Zeichen als Zahlen, Zahlenraten mit der Mitte)
     data-explorable="treppe"    „Speicher-Treppe“: vier Stufen (Speicher im Prozessor, Arbeitsspeicher, SSD, Festplatte) als Balken,
                                 Länge = Größe ungefähr (Maßstab Logarithmus). Ein Klick lässt einen Wartebalken in Zeitlupe laufen
                                 (Arbeitsspeicher = 1 Sekunde). Davor steht die Zeit als „?“. Der Baustein rechnet nichts.
     data-explorable="zeichen"   „Zeichen sind Zahlen“: bis zu 8 Zeichen (Buchstaben, Ziffern, Leerzeichen), je Zeichen eine Karte mit
                                 der ASCII-Zahl, Knopf „Groß und klein tauschen“ (nur Buchstaben, plus oder minus 32)
     data-explorable="halbieren" „Immer die Mitte“: geheime Zahl von 1 bis 100, Tipp oder „Die Mitte tippen“, Streifen mit dem Bereich,
                                 der noch möglich ist, Zähler und letzte Tipps. Die geheime Zahl steht erst nach dem Treffer da.
   Eigenständig wie alle explorables-vNN.js: keine Bibliothek, Texte per textContent.
   Der Rechenkern steht oben und ist ohne Browser prüfbar (module.exports, app/skripte/tests/explorables-v10.test.mjs).
   Im Ausgangszustand steht keine Lösung: keine Zeiten der Treppe, keine Zeichentabelle, keine Halbierungsfolge, keine Höchstzahl.
   Meldungstexte ohne Gedankenstrich. Zustand steht immer auch als Wort, Zeichen oder Linienstärke da, nie nur als Farbe.
   ============================================================= */
(function () {
  'use strict';

  var MINUS = '−';
  function ganz(text) {
    var t = String(text === undefined || text === null ? '' : text).trim();
    return /^\d+$/.test(t) ? Number(t) : null;
  }

  /* ── Rechenkern: Speicher-Treppe ──────────────────────────── */
  /* Größe in Byte nur für den Maßstab (Mitte des typischen Bereichs, ungefähr); Zeitlupe: Arbeitsspeicher gleich 1 Sekunde.
     SSD: 100 µs geteilt durch 100 ns ist 1000, also 1000 Sekunden, rund 17 Minuten. Festplatte: 10 ms geteilt durch 100 ns ist 100 000 Sekunden, rund 28 Stunden. */
  var STUFEN = [
    { schluessel: 'prozessor', name: 'Speicher im Prozessor', groesse: 'einige KB bis einige MB', byte: 1e6, sekunden: 0.01, zeit: '0,01 Sekunden', lauf: 10, gerafft: false },
    { schluessel: 'ram', name: 'Arbeitsspeicher', groesse: '8 bis 32 GB', byte: 16e9, sekunden: 1, zeit: '1 Sekunde', lauf: 1000, gerafft: false },
    { schluessel: 'ssd', name: 'SSD', groesse: '0,5 bis 2 TB', byte: 1e12, sekunden: 1000, zeit: 'rund 17 Minuten', lauf: 4000, gerafft: true },
    { schluessel: 'hdd', name: 'Festplatte', groesse: '1 bis 4 TB', byte: 2e12, sekunden: 100000, zeit: 'rund 28 Stunden', lauf: 6000, gerafft: true }
  ];
  /* Maßstab: 1 KB (10^3) bis 10 TB (10^13), jeder beschriftete Teilstrich ist tausendmal so viel wie der davor */
  var LOG_VON = 3, LOG_BIS = 13;
  var TEILSTRICHE = [{ log: 3, text: 'KB' }, { log: 6, text: 'MB' }, { log: 9, text: 'GB' }, { log: 12, text: 'TB' }];
  function anteil(byte) { return (Math.log(byte) / Math.LN10 - LOG_VON) / (LOG_BIS - LOG_VON); }
  function balkenAnteil(i) { return anteil(STUFEN[i].byte); }
  function teilstrichAnteil(t) { return (t.log - LOG_VON) / (LOG_BIS - LOG_VON); }
  /* Wie lange der Wartebalken im Browser läuft; ohne Bewegung (reduzierte Bewegung) steht er sofort voll da */
  function laufMs(i, reduziert) { return reduziert ? 0 : STUFEN[i].lauf; }
  function zeitlupeText(i) { return 'In Zeitlupe: ' + STUFEN[i].zeit; }
  function geraffText(i) { return STUFEN[i].gerafft ? 'Der Balken läuft schneller als die Zeitlupe.' : 'Der Balken läuft in der Zeit der Zeitlupe.'; }
  function satzStufe(i) {
    var s = STUFEN[i];
    return s.name + ', Größe ungefähr ' + s.groesse + '. ' + zeitlupeText(i) + '. ' + geraffText(i);
  }
  var TREPPE_START = 'Noch keine Stufe angeklickt. Die Zeit zeigt „?“.';

  /* ── Rechenkern: Zeichen als Zahlen ───────────────────────── */
  var MAX_ZEICHEN = 8;
  var MELDUNG_UNBEKANNT = 'Dieses Zeichen kennt der Baustein nicht.';
  var MELDUNG_LANG = 'Der Baustein nimmt höchstens ' + MAX_ZEICHEN + ' Zeichen.';
  function istBuchstabe(c) { return (c >= 65 && c <= 90) || (c >= 97 && c <= 122); }
  /* Nur Leerzeichen (32), Ziffern (48 bis 57), A bis Z (65 bis 90), a bis z (97 bis 122) */
  function kennt(c) { return c === 32 || (c >= 48 && c <= 57) || istBuchstabe(c); }
  function codeVon(zeichen) { return String(zeichen).charCodeAt(0); }
  function zeichenVon(code) { return String.fromCharCode(code); }
  function benennung(zeichen) { return zeichen === ' ' ? 'Leerzeichen' : zeichen; }
  /* Prüft die Eingabe; bei Erfolg die Karten (Zeichen und Zahl) */
  function pruefeZeichen(text) {
    var t = String(text === undefined || text === null ? '' : text), k, c, karten = [];
    for (k = 0; k < t.length; k++) {
      c = t.charCodeAt(k);
      if (!kennt(c) || (t.charAt(k) !== String.fromCharCode(c))) return { ok: false, meldung: MELDUNG_UNBEKANNT, karten: [] };
    }
    if (t.length > MAX_ZEICHEN) return { ok: false, meldung: MELDUNG_LANG, karten: [] };
    for (k = 0; k < t.length; k++) karten.push({ zeichen: t.charAt(k), code: t.charCodeAt(k), name: benennung(t.charAt(k)) });
    return { ok: true, meldung: '', karten: karten };
  }
  /* Groß und klein tauschen: nur Buchstaben, plus oder minus 32; Ziffern und Leerzeichen bleiben */
  function tausche(text) {
    var t = String(text), s = '', k, c;
    for (k = 0; k < t.length; k++) {
      c = t.charCodeAt(k);
      if (c >= 65 && c <= 90) c += 32; else if (c >= 97 && c <= 122) c -= 32;
      s += String.fromCharCode(c);
    }
    return s;
  }
  /* Je Zeichen die Änderung des Codes beim Tauschen: +32, −32 oder 0 */
  function aenderung(zeichen) {
    var c = codeVon(zeichen);
    if (c >= 65 && c <= 90) return 32;
    if (c >= 97 && c <= 122) return -32;
    return 0;
  }
  function satzZeichen(karten) {
    if (!karten.length) return 'Noch keine Zeichen.';
    return karten.map(function (k) { return k.name + ' ist ' + k.code; }).join(', ') + '.';
  }

  /* ── Rechenkern: Immer die Mitte ──────────────────────────── */
  var VON = 1, BIS = 100;
  var MELDUNG_TIPP = 'Schreib eine ganze Zahl von ' + VON + ' bis ' + BIS + '.';
  var SPIEL_START = 'Noch kein Tipp. Die Zahl liegt zwischen ' + VON + ' und ' + BIS + '.';
  function neuesSpiel(geheim) { return { geheim: geheim, unten: VON, oben: BIS, versuche: 0, tipps: [], fertig: false }; }
  function zufallZahl(zufall) { return VON + Math.floor((zufall === undefined ? Math.random() : zufall) * (BIS - VON + 1)); }
  /* In Python: int((unten + oben) / 2) */
  function mitte(s) { return Math.floor((s.unten + s.oben) / 2); }
  function pruefeTipp(text) {
    var n = ganz(text);
    if (n === null || n < VON || n > BIS) return { ok: false, meldung: MELDUNG_TIPP };
    return { ok: true, zahl: n };
  }
  /* Ein Tipp: neuer Zustand mit Hinweis; der Bereich schrumpft nur, wenn der Tipp ihn wirklich enger macht */
  function tippe(s, n) {
    if (s.fertig) return { zustand: s, hinweis: '', ignoriert: true };
    var hinweis = n === s.geheim ? 'Richtig!' : (n < s.geheim ? 'Zu klein' : 'Zu groß');
    var unten = s.unten, oben = s.oben;
    if (hinweis === 'Zu klein') unten = Math.max(unten, n + 1);
    if (hinweis === 'Zu groß') oben = Math.min(oben, n - 1);
    var tipps = s.tipps.concat([{ zahl: n, hinweis: hinweis }]);
    return {
      zustand: { geheim: s.geheim, unten: unten, oben: oben, versuche: s.versuche + 1, tipps: tipps, fertig: hinweis === 'Richtig!' },
      hinweis: hinweis, ignoriert: false
    };
  }
  /* Wie viele Zahlen noch möglich sind (nur für den Streifen, nicht als Zahl angezeigt) */
  function spanne(s) { return s.fertig ? 1 : s.oben - s.unten + 1; }
  function streifen(s) {
    var gesamt = BIS - VON + 1;
    return { links: (s.unten - VON) / gesamt, breite: (s.oben - s.unten + 1) / gesamt };
  }
  /* Spielt „immer die Mitte“ für eine geheime Zahl, gibt die Versuche zurück (nur für den Test, der Baustein zeigt es nicht) */
  function spieleMitte(geheim) {
    var s = neuesSpiel(geheim), r;
    while (!s.fertig) { r = tippe(s, mitte(s)); s = r.zustand; }
    return s.versuche;
  }
  function versuchWort(n, dativ) { return n === 1 ? '1 Versuch' : n + (dativ ? ' Versuchen' : ' Versuche'); }
  function satzSpiel(s) {
    if (!s.tipps.length) return SPIEL_START;
    var l = s.tipps[s.tipps.length - 1];
    if (s.fertig) return 'Tipp ' + l.zahl + ': Richtig! Gefunden nach ' + versuchWort(s.versuche, true) + '.';
    return 'Tipp ' + l.zahl + ': ' + l.hinweis + '. Versuche: ' + s.versuche + '. Die Zahl liegt zwischen ' + s.unten + ' und ' + s.oben + '.';
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      MINUS: MINUS, ganz: ganz, versuchWort: versuchWort,
      STUFEN: STUFEN, TEILSTRICHE: TEILSTRICHE, anteil: anteil, balkenAnteil: balkenAnteil, teilstrichAnteil: teilstrichAnteil, laufMs: laufMs,
      zeitlupeText: zeitlupeText, geraffText: geraffText, satzStufe: satzStufe, TREPPE_START: TREPPE_START,
      MAX_ZEICHEN: MAX_ZEICHEN, MELDUNG_UNBEKANNT: MELDUNG_UNBEKANNT, MELDUNG_LANG: MELDUNG_LANG, kennt: kennt, codeVon: codeVon, zeichenVon: zeichenVon,
      benennung: benennung, pruefeZeichen: pruefeZeichen, tausche: tausche, aenderung: aenderung, satzZeichen: satzZeichen,
      VON: VON, BIS: BIS, MELDUNG_TIPP: MELDUNG_TIPP, SPIEL_START: SPIEL_START, neuesSpiel: neuesSpiel, zufallZahl: zufallZahl, mitte: mitte,
      pruefeTipp: pruefeTipp, tippe: tippe, spanne: spanne, streifen: streifen, spieleMitte: spieleMitte, satzSpiel: satzSpiel
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
  function aktion(text, leise) { return el('button', { type: 'button', class: 'v10-aktion' + (leise ? ' v10-aktion--leise' : ''), text: text }); }
  function sperre(b, aus) { b.setAttribute('aria-disabled', aus ? 'true' : 'false'); b.classList.toggle('is-aus', !!aus); }
  function reduziert() {
    try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
  }
  function prozent(x) { return (Math.round(x * 1000) / 10) + '%'; }

  /* ── treppe ───────────────────────────────────────────────── */
  function initTreppe(host) {
    var gewaehlt = -1, gesehen = [false, false, false, false], timer = null, reihen = [];
    host.textContent = '';
    var skala = el('div', { class: 'v10-skala', 'aria-hidden': 'true' });
    TEILSTRICHE.forEach(function (t) {
      skala.appendChild(el('span', { class: 'v10-skala__strich', style: 'left:' + prozent(teilstrichAnteil(t)), text: t.text }));
    });
    var hinweis = el('p', { class: 'v10-hinweis k-small k-muted', text: 'Die Länge zeigt die Größe, ungefähr. Jeder Teilstrich ist tausendmal so viel wie der davor.' });
    var liste = el('div', { class: 'v10-treppe', role: 'group', 'aria-label': 'Die vier Speicherstufen' });
    var status = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    var satz = el('p', { class: 'v10-jetzt', text: TREPPE_START });
    STUFEN.forEach(function (s, i) {
      var knopf = el('button', { type: 'button', class: 'v10-stufe', 'aria-pressed': 'false' }, [el('span', { class: 'v10-stufe__name', text: s.name })]);
      var gBalken = el('span', { class: 'v10-balken__fuell', style: 'width:' + prozent(balkenAnteil(i)) });
      var gTrack = el('span', { class: 'v10-balken', role: 'img', 'aria-label': 'Größe ungefähr ' + s.groesse }, [gBalken]);
      var gText = el('span', { class: 'v10-groesse', text: 'ungefähr ' + s.groesse });
      var wFuell = el('span', { class: 'v10-warte__fuell' });
      var wTrack = el('span', { class: 'v10-warte', role: 'img', 'aria-label': 'Wartebalken' }, [wFuell]);
      var zeit = el('span', { class: 'v10-zeit is-leer', text: '?' });
      var zeile = el('div', { class: 'v10-reihe' }, [
        knopf,
        el('div', { class: 'v10-reihe__groesse' }, [gTrack, gText]),
        el('div', { class: 'v10-reihe__warte' }, [wTrack, zeit])
      ]);
      knopf.addEventListener('click', function () { waehle(i); });
      reihen.push({ knopf: knopf, fuell: wFuell, zeit: zeit, zeile: zeile });
      liste.appendChild(zeile);
    });
    function zeigeZeit(i) {
      var r = reihen[i];
      if (gesehen[i]) { r.zeit.textContent = STUFEN[i].zeit; r.zeit.classList.remove('is-leer'); r.zeit.classList.remove('is-laeuft'); }
      else { r.zeit.textContent = '?'; r.zeit.classList.add('is-leer'); r.zeit.classList.remove('is-laeuft'); }
    }
    function waehle(i) {
      if (timer) { clearTimeout(timer); timer = null; }
      var k;
      /* Ein vorher laufender Balken, der nicht zu Ende kam, gilt als nicht gesehen */
      for (k = 0; k < reihen.length; k++) {
        reihen[k].knopf.setAttribute('aria-pressed', k === i ? 'true' : 'false');
        reihen[k].zeile.classList.toggle('is-an', k === i);
        if (k !== i) {
          reihen[k].fuell.style.transition = 'none';
          reihen[k].fuell.style.width = gesehen[k] ? '100%' : '0%';
          zeigeZeit(k);
        }
      }
      gewaehlt = i;
      var r = reihen[i], ms = laufMs(i, reduziert());
      gesehen[i] = false; zeigeZeit(i);
      r.fuell.style.transition = 'none'; r.fuell.style.width = '0%';
      void r.fuell.offsetWidth;
      function fertig() {
        timer = null; gesehen[i] = true; zeigeZeit(i);
        r.fuell.style.transition = 'none'; r.fuell.style.width = '100%';
        satz.textContent = satzStufe(i); status.textContent = satzStufe(i);
      }
      if (ms === 0) { fertig(); return; }
      r.zeit.textContent = 'läuft'; r.zeit.classList.add('is-leer'); r.zeit.classList.add('is-laeuft');
      satz.textContent = s_laeuft(i); status.textContent = s_laeuft(i);
      r.fuell.style.transition = 'width ' + ms + 'ms linear';
      r.fuell.style.width = '100%';
      timer = setTimeout(fertig, ms + 30);
    }
    function s_laeuft(i) { return STUFEN[i].name + ': Der Wartebalken läuft.' + (STUFEN[i].gerafft ? ' Er läuft schneller als die Zeitlupe.' : ''); }
    var skalaZeile = el('div', { class: 'v10-reihe v10-reihe--skala' }, [el('span', { 'aria-hidden': 'true' }), el('div', { class: 'v10-reihe__groesse' }, [skala]), el('span', { 'aria-hidden': 'true' })]);
    host.appendChild(el('div', { class: 'v10-treppe-wrap' }, [hinweis, skalaZeile, liste, satz, status]));
    /* Ausgangszustand: nichts gewählt, nichts läuft */
    void gewaehlt;
  }

  /* ── zeichen ──────────────────────────────────────────────── */
  function initZeichen(host) {
    var id = 'v10-zeichen-' + (++nr);
    var vorher = null;
    host.textContent = '';
    var feld = el('input', { type: 'text', id: id + '-feld', class: 'v10-feld v10-feld--mittel', autocomplete: 'off', spellcheck: 'false', autocapitalize: 'off', 'aria-describedby': id + '-hilfe ' + id + '-meld', 'aria-label': 'Deine Zeichen' });
    var tauschen = aktion('Groß und klein tauschen');
    var meld = el('p', { id: id + '-meld', class: 'v10-meldung', role: 'alert', hidden: '' });
    var hilfe = el('p', { id: id + '-hilfe', class: 'k-small k-muted', text: 'Bis zu ' + MAX_ZEICHEN + ' Zeichen: Buchstaben, Ziffern und Leerzeichen.' });
    var karten = el('ul', { class: 'v10-karten', 'aria-label': 'Die Zahlen zu deinen Zeichen' });
    var leer = el('p', { class: 'v10-leer k-muted', text: 'Noch keine Zeichen.' });
    var tauschSatz = el('p', { class: 'v10-hinweis', hidden: '' });
    var status = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    function zeige(ansagen, vorsatz, wechsel) {
      var p = pruefeZeichen(feld.value);
      karten.textContent = '';
      if (!p.ok) {
        feld.setAttribute('aria-invalid', 'true'); meld.textContent = p.meldung; meld.hidden = false;
      } else {
        feld.removeAttribute('aria-invalid'); meld.hidden = true;
      }
      p.karten.forEach(function (k) {
        var d = wechsel ? -aenderung(k.zeichen) : 0; /* das Zeichen ist schon das getauschte: A wurde zu a (+32) */
        var li = el('li', { class: 'v10-karte' }, [
          el('span', { class: 'v10-karte__zeichen', text: k.zeichen === ' ' ? '␣' : k.zeichen, 'aria-hidden': 'true' }),
          el('span', { class: 'v10-karte__code', text: String(k.code) }),
          el('span', { class: 'v10-karte__name', text: k.name === 'Leerzeichen' ? 'Leerzeichen' : 'Zeichen ' + k.zeichen })
        ]);
        li.setAttribute('aria-label', k.name + ' hat die Zahl ' + k.code);
        if (d) li.appendChild(el('span', { class: 'v10-karte__aend', text: (d > 0 ? '+' : MINUS) + '32' }));
        karten.appendChild(li);
      });
      leer.hidden = !(p.ok && p.karten.length === 0);
      tauschSatz.hidden = !wechsel || !p.karten.length;
      if (wechsel && p.karten.length) tauschSatz.textContent = 'Getauscht: Vorher stand „' + vorher + '“ da.';
      sperre(tauschen, !p.ok || !p.karten.length);
      if (ansagen) status.textContent = (vorsatz || '') + (p.ok ? satzZeichen(p.karten) : p.meldung);
    }
    feld.addEventListener('input', function () { zeige(true, '', false); });
    tauschen.addEventListener('click', function () {
      if (tauschen.getAttribute('aria-disabled') === 'true') return;
      vorher = feld.value; feld.value = tausche(feld.value); zeige(true, 'Getauscht. ', true);
    });
    zeige(false);
    host.appendChild(el('div', { class: 'v10-zeichen' }, [
      el('div', { class: 'v10-feldzeile' }, [el('label', { for: id + '-feld', text: 'Deine Zeichen' }), feld]),
      hilfe, meld,
      el('div', { class: 'v10-aktionen' }, [tauschen]),
      tauschSatz, karten, leer, status
    ]));
  }

  /* ── halbieren ────────────────────────────────────────────── */
  function initHalbieren(host) {
    var id = 'v10-halbieren-' + (++nr);
    var s = neuesSpiel(zufallZahl());
    host.textContent = '';
    var feld = el('input', { type: 'text', id: id + '-feld', class: 'v10-feld v10-feld--eng', inputmode: 'numeric', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Dein Tipp', 'aria-describedby': id + '-meld' });
    var tipp = aktion('Tipp'), mitteKnopf = aktion('Die Mitte tippen', true), neu = aktion('Neue Zahl', true);
    var meld = el('p', { id: id + '-meld', class: 'v10-meldung', role: 'alert', hidden: '' });
    var zaehler = el('p', { class: 'v10-zaehler' });
    var bandFuell = el('span', { class: 'v10-band__fuell' });
    var band = el('div', { class: 'v10-band', role: 'img' }, [bandFuell]);
    var enden = el('div', { class: 'v10-enden', 'aria-hidden': 'true' }, [el('span', { text: String(VON) }), el('span', { text: String(BIS) })]);
    var bereichEl = el('p', { class: 'v10-jetzt' });
    var liste = el('ol', { class: 'v10-tipps', 'aria-label': 'Deine letzten Tipps' });
    var ergebnis = el('p', { class: 'v10-treffer', hidden: '' });
    var status = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    function zeige(ansagen, vorsatz) {
      var st = streifen(s);
      bandFuell.style.left = prozent(st.links); bandFuell.style.width = prozent(st.breite);
      band.setAttribute('aria-label', s.fertig ? 'Die Zahl ist gefunden.' : 'Die Zahl liegt noch zwischen ' + s.unten + ' und ' + s.oben + '.');
      zaehler.textContent = 'Versuche: ' + s.versuche;
      bereichEl.textContent = s.fertig ? 'Gefunden.' : (s.tipps.length ? 'Die Zahl liegt zwischen ' + s.unten + ' und ' + s.oben + '.' : 'Die Zahl liegt zwischen ' + VON + ' und ' + BIS + '.');
      liste.textContent = '';
      s.tipps.slice(-6).reverse().forEach(function (t) {
        liste.appendChild(el('li', { class: 'v10-tipps__zeile' + (t.hinweis === 'Richtig!' ? ' is-treffer' : '') }, [el('span', { class: 'v10-tipps__zahl', text: String(t.zahl) }), el('span', { class: 'v10-tipps__hinweis', text: t.hinweis })]));
      });
      ergebnis.hidden = !s.fertig;
      if (s.fertig) ergebnis.textContent = 'Die Zahl war ' + s.geheim + '. Du hast ' + versuchWort(s.versuche) + ' gebraucht.';
      sperre(tipp, s.fertig); sperre(mitteKnopf, s.fertig); feld.disabled = s.fertig;
      if (ansagen) status.textContent = (vorsatz || '') + satzSpiel(s) + (s.fertig ? ' Die Zahl war ' + s.geheim + '.' : '');
    }
    function gib(zahl) {
      if (s.fertig) return;
      var r = tippe(s, zahl); s = r.zustand; feld.value = ''; zeige(true, '');
    }
    function tippen() {
      if (s.fertig) return;
      var p = pruefeTipp(feld.value);
      if (!p.ok) { feld.setAttribute('aria-invalid', 'true'); meld.textContent = p.meldung; meld.hidden = false; return; }
      feld.removeAttribute('aria-invalid'); meld.hidden = true; gib(p.zahl);
    }
    tipp.addEventListener('click', function () { if (tipp.getAttribute('aria-disabled') === 'true') return; tippen(); });
    mitteKnopf.addEventListener('click', function () {
      if (s.fertig) return;
      feld.removeAttribute('aria-invalid'); meld.hidden = true; gib(mitte(s));
    });
    neu.addEventListener('click', function () {
      s = neuesSpiel(zufallZahl()); feld.value = ''; feld.removeAttribute('aria-invalid'); meld.hidden = true; zeige(true, 'Neue Zahl gewählt. ');
      status.textContent = 'Neue Zahl gewählt. ' + SPIEL_START;
    });
    feld.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); tippen(); } });
    feld.addEventListener('input', function () { feld.removeAttribute('aria-invalid'); meld.hidden = true; });
    zeige(false);
    host.appendChild(el('div', { class: 'v10-halbieren' }, [
      el('div', { class: 'v10-halbieren__links' }, [
        el('div', { class: 'v10-feldzeile' }, [el('label', { for: id + '-feld', text: 'Dein Tipp (' + VON + ' bis ' + BIS + ')' }), feld]),
        meld,
        el('div', { class: 'v10-aktionen' }, [tipp, mitteKnopf, neu]),
        zaehler, ergebnis
      ]),
      el('div', { class: 'v10-halbieren__rechts' }, [
        el('p', { class: 'v10-titel', text: 'Hier kann die Zahl noch liegen' }), band, enden, bereichEl,
        el('p', { class: 'v10-titel', text: 'Deine letzten Tipps' }), liste, status
      ])
    ]));
  }

  function init() {
    var map = { treppe: initTreppe, zeichen: initZeichen, halbieren: initHalbieren };
    Object.keys(map).forEach(function (k) {
      Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="' + k + '"]'), function (host) {
        if (host._v10) return;
        host._v10 = true;
        map[k](host);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
