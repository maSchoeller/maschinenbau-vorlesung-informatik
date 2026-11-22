/* =============================================================
   probeklausur.js – Probeklausur 2026/27 (site/probeklausur-2026-27.html)
   - Druckkopien der Code-Musterlösungen (schlichte <pre>, nur im Druck sichtbar)
   - PAP zu B1 (Aufgabe) und B2 (Musterlösung) über window.KursPAP
   - Umschalter Aufgabenblatt / Mit Musterlösung, Drucken
   - Selbstbewertung je Aufgabe, Summe live, Speicherung über window.KursSpeicher
   Wird nach kurs.js geladen; läuft vor dem DOMContentLoaded von kurs.js, damit die
   Druckkopien entstehen, bevor die Codeblöcke zu Editoren werden.
   ============================================================= */
(function () {
  'use strict';

  var PFAD_PUNKTE = 'inf-mb/probeklausur-2026-27/punkte';
  var PFAD_ANSICHT = 'inf-mb/probeklausur-2026-27/ansicht';
  var BESTANDEN = 45, GESAMT = 90;

  var root = document.getElementById('pk');
  if (!root) return;

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* ── Speicher (mit Rückfall, falls KursSpeicher fehlt) ───── */
  var S = window.KursSpeicher;
  function lesen(pfad) {
    try { if (S && S.sofort) return S.sofort.lesen(pfad); } catch (e) { /* ohne Speicher weiter */ }
    try { var t = window.localStorage.getItem('dhbw-inf-mb:' + pfad); return t ? JSON.parse(t) : undefined; } catch (e2) { return undefined; }
  }
  function schreiben(pfad, wert) {
    try { if (S && S.sofort) { S.sofort.schreiben(pfad, wert); return; } } catch (e) { /* ohne Speicher weiter */ }
    try { window.localStorage.setItem('dhbw-inf-mb:' + pfad, JSON.stringify(wert)); } catch (e2) { /* ohne Speicher weiter */ }
  }
  function loeschen(pfad) {
    try { if (S && S.sofort) { S.sofort.loeschen(pfad); return; } } catch (e) { /* ohne Speicher weiter */ }
    try { window.localStorage.removeItem('dhbw-inf-mb:' + pfad); } catch (e2) { /* ohne Speicher weiter */ }
  }

  /* ── 1. Druckkopien der ausführbaren Musterlösungs-Codeblöcke ── */
  // Im Druck erscheint jeder Code als schlichter heller Text. Der Editor (kurs.js) ersetzt die <pre>
  // später durch einen Runner; die Druckkopie bleibt davor stehen. Alles ab „# Kontrolle“ gehört nur
  // zur Bildschirm-Probe und kommt nicht in den Druck.
  $$('.pk-loesung pre').forEach(function (pre) {
    if (pre.hasAttribute('data-pk') || pre.getAttribute('data-run') === 'no' || pre.classList.contains('pk-druck')) return;
    var code = pre.querySelector('code');
    if (!code) return;
    var text = code.textContent.replace(/^\n+/, '').replace(/\s+$/, '');
    text = text.replace(/\n+# Kontrolle[\s\S]*$/, '');
    var kopie = document.createElement('pre');
    kopie.className = 'pk-druck';
    kopie.setAttribute('data-run', 'no');
    kopie.setAttribute('aria-hidden', 'true');
    var c = document.createElement('code');
    c.textContent = text;
    kopie.appendChild(c);
    pre.parentNode.insertBefore(kopie, pre);
  });

  /* ── 2. PAPs zeichnen ─────────────────────────────────────── */
  function papB1(P) {
    return [
      P.start(),
      P.op('abweichungen = 0'),
      P.op('i = 1'),
      P.whil('i <= 5?', [
        P.io('Eingabe: p (Druck in bar)'),
        P.iff('p > 10?',
          [P.io('Ausgabe: i, "Überdruck"'), P.op('abweichungen = abweichungen + 1')],
          [P.iff('p < 2?',
            [P.io('Ausgabe: i, "Unterdruck"'), P.op('abweichungen = abweichungen + 1')],
            [P.io('Ausgabe: i, "ok"')])]),
        P.op('i = i + 1')
      ]),
      P.io('Ausgabe: "Abweichungen:", abweichungen'),
      P.end()
    ];
  }
  var B2_CODE = [
    't = float(input("Starttemperatur in °C: "))',
    'minuten = 0',
    'while t > 40:',
    '    t = t - 0.1 * (t - 20)',
    '    minuten = minuten + 1',
    'if minuten > 30:',
    '    print("Zu langsam:", minuten, "min")',
    'else:',
    '    print("Abgekühlt nach", minuten, "min")',
    ''
  ].join('\n');

  function zeichne() {
    var K = window.KursPAP;
    $$('[data-pk-pap]').forEach(function (fig) {
      var host = $('.pk-pap__host', fig);
      if (!host) return;
      if (!K) { host.textContent = 'Der Programmablaufplan konnte nicht geladen werden.'; return; }
      var spec, label;
      if (fig.getAttribute('data-pk-pap') === 'b1') {
        spec = papB1(K.P);
        label = 'Programmablaufplan der Druckprüfung (Aufgabe B1)';
      } else {
        var r = K.parseCode(B2_CODE, { erweitert: true });
        spec = K.toPap(r.nodes);
        label = 'Programmablaufplan zum Abkühlprogramm (Musterlösung B2)';
      }
      host.innerHTML = K.figure(spec, { label: label, badges: false, minw: 0.6 });
    });
  }
  zeichne();

  /* ── 3. Ansicht: Aufgabenblatt / Mit Musterlösung ─────────── */
  var radios = $$('input[name="pk-ansicht"]');
  var bewertung = $('#pk-bewertung');
  var hinweis = $('#pk-druckhinweis');

  function setzeAnsicht(wert, merken) {
    if (wert !== 'loesung') wert = 'aufgabe';
    root.setAttribute('data-ansicht', wert);
    radios.forEach(function (r) { r.checked = (r.value === wert); });
    if (bewertung) bewertung.hidden = (wert !== 'loesung');
    $$('.pk-selbst').forEach(function (e) { e.hidden = (wert !== 'loesung'); });
    if (hinweis) hinweis.textContent = wert === 'loesung'
      ? 'Gedruckt wird die Ansicht mit Musterlösung und Punkteschema.'
      : 'Gedruckt wird das Aufgabenblatt ohne Lösungen.';
    if (merken) schreiben(PFAD_ANSICHT, wert);
  }
  radios.forEach(function (r) {
    r.addEventListener('change', function () { if (r.checked) setzeAnsicht(r.value, true); });
  });
  var btnDruck = $('#pk-drucken');
  if (btnDruck) btnDruck.addEventListener('click', function () { window.print(); });

  /* ── 4. Selbstbewertung ───────────────────────────────────── */
  var aufgaben = $$('.pk-aufgabe');
  var stand = {};
  var gespeichert = lesen(PFAD_PUNKTE);
  if (gespeichert && typeof gespeichert === 'object') stand = gespeichert;
  var felder = {};

  aufgaben.forEach(function (a) {
    var id = a.getAttribute('data-aufgabe'), max = parseInt(a.getAttribute('data-max'), 10);
    var inputId = 'pk-erreicht-' + id.toLowerCase();
    var zeile = document.createElement('div');
    zeile.className = 'pk-selbst';
    zeile.hidden = true;
    var lab = document.createElement('label');
    lab.setAttribute('for', inputId);
    lab.textContent = 'Erreicht in ' + id + ': ';
    var inp = document.createElement('input');
    inp.type = 'number'; inp.id = inputId; inp.min = '0'; inp.max = String(max); inp.step = '1';
    inp.setAttribute('inputmode', 'numeric');
    var von = document.createElement('span');
    von.textContent = ' von ' + max + ' Punkten';
    zeile.appendChild(lab); zeile.appendChild(inp); zeile.appendChild(von);
    a.appendChild(zeile);
    felder[id] = { inp: inp, max: max };
    if (typeof stand[id] === 'number') inp.value = String(stand[id]);
    inp.addEventListener('input', function () {
      var t = inp.value.trim();
      if (t === '') { delete stand[id]; }
      else {
        var n = Math.round(Number(t));
        if (isNaN(n)) { delete stand[id]; }
        else {
          n = Math.max(0, Math.min(max, n));
          stand[id] = n;
          if (String(n) !== t) inp.value = String(n);
        }
      }
      sichern(); summe();
    });
  });

  function sichern() {
    if (Object.keys(stand).length) schreiben(PFAD_PUNKTE, stand); else loeschen(PFAD_PUNKTE);
  }
  function summe() {
    var s = 0, n = 0;
    Object.keys(stand).forEach(function (k) { if (felder[k]) { s += stand[k]; n += 1; } });
    var wert = $('#pk-summe-wert'), urteil = $('#pk-urteil');
    if (wert) wert.textContent = String(s);
    if (!urteil) return;
    var rest = n < aufgaben.length ? ' · ' + n + ' von ' + aufgaben.length + ' Aufgaben bewertet' : '';
    if (!n) urteil.textContent = 'Bestanden ab ' + BESTANDEN + ' Punkten (50 %).';
    else if (s >= BESTANDEN) urteil.textContent = 'Bestanden (ab ' + BESTANDEN + ' Punkten)' + rest;
    else urteil.textContent = 'Noch nicht bestanden: ' + (BESTANDEN - s) + ' Punkte fehlen (ab ' + BESTANDEN + ' bestanden)' + rest;
    urteil.setAttribute('data-ok', s >= BESTANDEN && n ? 'ja' : 'nein');
  }
  var reset = $('#pk-zuruecksetzen');
  if (reset) reset.addEventListener('click', function () {
    stand = {};
    Object.keys(felder).forEach(function (k) { felder[k].inp.value = ''; });
    sichern(); summe();
  });

  /* ── Start ────────────────────────────────────────────────── */
  var ansicht = lesen(PFAD_ANSICHT);
  setzeAnsicht(ansicht === 'loesung' ? 'loesung' : 'aufgabe', false);
  summe();
})();
