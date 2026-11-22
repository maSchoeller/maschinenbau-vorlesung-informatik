/* =============================================================
   explorables-v21.js – Projektwerkstatt V21
   (1) Überblick Meilensteine V14–V21: liest den Stand der Projektseite (inf-mb/projekt/meilenstein:<id>),
       Titel und Anzahl der Punkte aus ../projekt.html (Fallback: feste Titel), nur lesen.
   (2) Fertig-Check zum Abhaken: inf-mb/v21/fertig-check  ({id: true/false})
   (3) Probe-Uhr für die Präsentation (5 Teile, 5 Minuten)
   (4) Links auf noch nicht veröffentlichte Labore (data-v21-pruefen) werden zu Text „folgt“.
   ============================================================= */
(function () {
  'use strict';
  var S = window.KursSpeicher;
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; }
  function laden(pfad) {
    if (!S || !S.laden) return Promise.resolve(undefined);
    try { return S.laden(pfad).then(function (w) { return w; }, function () { return undefined; }); }
    catch (e) { return Promise.resolve(undefined); }
  }
  function speichern(pfad, wert) {
    if (!S || !S.speichern) return;
    try { S.speichern(pfad, wert); } catch (e) { /* ohne Speicher weiter */ }
  }

  /* ── (1) Überblick Meilensteine ─────────────────────────── */
  var MILES_FALLBACK = [
    { id: 'v14', t: 'V14 · Thema und PAP' },
    { id: 'v15', t: 'V15 · Daten, Eingaben und Testfälle von Hand' },
    { id: 'v16', t: 'V16 · Grundgerüst mit Funktionen' },
    { id: 'v17', t: 'V17 · Kernrechnung und Tests bestehen' },
    { id: 'v18', t: 'V18 · Eingaben prüfen und Fehler abfangen' },
    { id: 'v19', t: 'V19 · Ausgabe und Diagramm' },
    { id: 'v20', t: 'V20 · Feinschliff und Code-Review im Team' },
    { id: 'v21', t: 'V21 · Fertigstellen und Präsentation vorbereiten' }
  ];
  function ausProjektseite(html) {
    var re = /\{\s*id:\s*'(v\d+)',\s*t:\s*'((?:[^'\\]|\\.)*)'[\s\S]*?p:\s*\[([\s\S]*?)\]\s*\}/g, m, out = [];
    while ((m = re.exec(html))) {
      var n = (m[3].match(/'(?:[^'\\]|\\.)*'/g) || []).length;
      out.push({ id: m[1], t: m[2].replace(/\\'/g, "'"), n: n });
    }
    return out.length ? out : null;
  }
  function uebersicht() {
    var host = $('v21-uebersicht');
    if (!host) return;
    var quelle = (window.fetch ? fetch('../projekt.html').then(function (r) { return r.ok ? r.text() : ''; }).then(ausProjektseite, function () { return null; }) : Promise.resolve(null));
    quelle.then(function (miles) {
      miles = miles || MILES_FALLBACK;
      return Promise.all(miles.map(function (m) { return laden('inf-mb/projekt/meilenstein:' + m.id); })).then(function (staende) {
        host.textContent = '';
        miles.forEach(function (m, i) {
          var w = staende[i], ok = 0, n = m.n;
          if (w && w.length !== undefined) { w.forEach(function (v) { if (v) ok++; }); if (!n) n = w.length; }
          var li = el('li', 'v21-ms'), a = el('a', 'v21-ms__t', m.t), st = el('span', 'v21-ms__stand');
          a.href = '../projekt.html#ms-' + m.id;
          if (n) {
            st.textContent = ok + ' von ' + n;
            if (ok === n) li.classList.add('is-done'); else if (ok > 0) li.classList.add('is-part');
          } else st.textContent = 'noch nichts abgehakt';
          var bar = el('span', 'v21-ms__bar'), fill = el('span', 'v21-ms__fill');
          fill.style.width = (n ? Math.round(100 * ok / n) : 0) + '%';
          bar.setAttribute('aria-hidden', 'true'); bar.appendChild(fill);
          if (li.classList.contains('is-done')) { var ic = window.KIcon ? window.KIcon('check') : null; if (ic) { ic.classList.add('v21-ms__ic'); st.insertBefore(ic, st.firstChild); } }
          li.appendChild(a); li.appendChild(bar); li.appendChild(st);
          host.appendChild(li);
        });
      });
    }).catch(function () { host.textContent = ''; host.appendChild(el('li', 'k-muted', 'Der Stand konnte nicht geladen werden. Die Meilensteine stehen auf der Projektseite.')); });
  }

  /* ── (2) Fertig-Check ───────────────────────────────────── */
  var CHECK = [
    { g: 'Läuft frisch', p: [
      ['f1', 'Alle Dateien liegen in einem Projektordner: Hauptprogramm, Modul mit den Funktionen, Daten, Tests'],
      ['f2', 'Dateien werden mit relativen Pfaden geöffnet (kein C:\\Users\\… im Code)'],
      ['f3', 'Nach einem frischen Start in einem leeren Ordner läuft das Programm ohne Fehler'],
      ['f4', 'Benötigte Pakete (zum Beispiel pandas, matplotlib) sind in der README notiert']] },
    { g: 'Tests', p: [
      ['t1', 'Alle Testfälle von Hand bestehen, auch die Grenzfälle'],
      ['t2', 'Nach der letzten Änderung wurden alle Tests noch einmal ausgeführt (Regressionstest)'],
      ['t3', 'Mindestens drei Fehleingaben werden abgefangen, mit verständlicher Meldung auf Deutsch']] },
    { g: 'PAP und Dokumentation', p: [
      ['p1', 'PAP passt zum Code, wie er heute läuft, und ist als SVG oder PNG exportiert'],
      ['p2', 'README: Zweck, Bedienung, Eingaben und Ausgaben mit Einheiten, Grenzen des Modells'],
      ['p3', 'KI-Protokoll: mindestens ein Copilot-Fehler, wie gefunden und wie behoben'],
      ['p4', 'Beide können jede Zeile des Codes erklären, auch die von Copilot']] },
    { g: 'Präsentation', p: [
      ['v1', 'Demo-Daten und eine Fehleingabe für die Live-Demo bereitgelegt'],
      ['v2', 'Einen von Hand gerechneten Testfall für die Präsentation ausgewählt'],
      ['v3', 'Fünf Minuten mit der Uhr geprobt, beide Personen sprechen']] }
  ];
  var PFAD_CHECK = 'inf-mb/v21/fertig-check';
  function fertigCheck() {
    var host = $('v21-check'), sum = $('v21-summe'), reset = $('v21-check-reset');
    if (!host) return;
    var stand = {}, boxen = [];
    var gesamt = 0; CHECK.forEach(function (g) { gesamt += g.p.length; });
    function zaehle() {
      var ok = 0; CHECK.forEach(function (g) { g.p.forEach(function (p) { if (stand[p[0]]) ok++; }); });
      sum.textContent = ok === gesamt ? 'Alle ' + gesamt + ' Punkte abgehakt. Euer Werkzeug ist bereit für V22.' : ok + ' von ' + gesamt + ' Punkten abgehakt.';
      sum.classList.toggle('is-done', ok === gesamt);
    }
    function baue() {
      host.textContent = '';
      CHECK.forEach(function (g) {
        var grp = el('div', 'v21-gruppe'), h = el('h4', 'v21-gruppe__t', g.g), ul = el('ul', 'v21-liste');
        g.p.forEach(function (p) {
          var li = el('li'), lab = el('label', 'v21-chk'), cb = el('input'), sp = el('span', null, p[1]);
          cb.type = 'checkbox'; cb.checked = !!stand[p[0]]; cb.setAttribute('data-id', p[0]);
          cb.addEventListener('change', function () { stand[p[0]] = cb.checked; speichern(PFAD_CHECK, stand); zaehle(); });
          boxen.push(cb);
          lab.appendChild(cb); lab.appendChild(sp); li.appendChild(lab); ul.appendChild(li);
        });
        grp.appendChild(h); grp.appendChild(ul); host.appendChild(grp);
      });
      zaehle();
    }
    if (reset) reset.addEventListener('click', function () {
      if (!window.confirm('Alle Haken im Fertig-Check entfernen?')) return;
      stand = {}; boxen.forEach(function (cb) { cb.checked = false; }); speichern(PFAD_CHECK, stand); zaehle();
    });
    laden(PFAD_CHECK).then(function (w) { if (w && typeof w === 'object') stand = w; baue(); });
  }

  /* ── (3) Probe-Uhr ──────────────────────────────────────── */
  var PHASEN = [['Problem', 45], ['PAP', 45], ['Live-Demo mit Fehleingabe', 120], ['Testfall von Hand', 45], ['Was hat die KI falsch gemacht?', 45]];
  function fmt(s) { var neg = s < 0; s = Math.abs(Math.round(s)); return (neg ? '+' : '') + Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function uhr() {
    var zeit = $('v21-uhr-zeit'), phase = $('v21-uhr-phase'), leiste = $('v21-uhr-leiste'), start = $('v21-uhr-start'), reset = $('v21-uhr-reset'), ansage = $('v21-uhr-ansage');
    if (!zeit) return;
    var TOTAL = 0; PHASEN.forEach(function (p) { TOTAL += p[1]; });
    var lis = PHASEN.map(function (p) {
      var li = el('li', 'v21-uhr__teil'); li.style.flexGrow = String(p[1]);
      li.appendChild(el('span', 'v21-uhr__name', p[0]));
      li.appendChild(el('span', 'v21-uhr__dauer', p[1] + ' s'));
      leiste.appendChild(li); return li;
    });
    var laeuft = false, verstrichen = 0, t0 = 0, timer = null, letzte = -1;
    function index(t) { var acc = 0; for (var i = 0; i < PHASEN.length; i++) { acc += PHASEN[i][1]; if (t < acc) return i; } return PHASEN.length; }
    function zeige() {
      var t = verstrichen + (laeuft ? (Date.now() - t0) / 1000 : 0);
      var rest = TOTAL - t, i = index(t);
      zeit.textContent = fmt(rest);
      zeit.classList.toggle('is-over', rest < 0);
      var acc = 0;
      lis.forEach(function (li, k) {
        li.classList.toggle('is-done', k < i); li.classList.toggle('is-active', k === i);
        li.setAttribute('aria-current', k === i ? 'step' : 'false');
        acc += PHASEN[k][1];
      });
      if (i < PHASEN.length) {
        var ende = 0; for (var k = 0; k <= i; k++) ende += PHASEN[k][1];
        phase.textContent = (laeuft || t > 0 ? 'Jetzt: ' : 'Bereit: ') + PHASEN[i][0] + ' (noch ' + Math.ceil(ende - t) + ' s)';
      } else phase.textContent = 'Zeit um. In V22 würde jetzt die Fragerunde beginnen.';
      if (laeuft && i !== letzte) {
        ansage.textContent = i < PHASEN.length ? 'Jetzt: ' + PHASEN[i][0] + ', ' + PHASEN[i][1] + ' Sekunden.' : 'Die fünf Minuten sind um.';
        letzte = i;
      }
    }
    function stopp() { if (timer) { clearInterval(timer); timer = null; } }
    start.addEventListener('click', function () {
      if (laeuft) { verstrichen += (Date.now() - t0) / 1000; laeuft = false; stopp(); start.textContent = 'Weiter'; }
      else { t0 = Date.now(); laeuft = true; timer = setInterval(zeige, 250); start.textContent = 'Pause'; }
      zeige();
    });
    reset.addEventListener('click', function () { stopp(); laeuft = false; verstrichen = 0; letzte = -1; start.textContent = 'Start'; ansage.textContent = ''; zeige(); });
    zeige();
  }

  /* ── (4) Links auf noch fehlende Labore ─────────────────── */
  function pruefeLinks() {
    if (!window.fetch || location.protocol === 'file:') return;
    var cache = {};
    Array.prototype.forEach.call(document.querySelectorAll('a[data-v21-pruefen]'), function (a) {
      var url = a.getAttribute('href').split('#')[0];
      if (!cache[url]) cache[url] = fetch(url, { method: 'HEAD' }).then(function (r) { return r.ok; }, function () { return true; });
      cache[url].then(function (ok) {
        if (ok) return;
        var sp = el('span', 'k-muted', a.textContent + ' (folgt)');
        a.parentNode.replaceChild(sp, a);
      });
    });
  }

  function init() { uebersicht(); fertigCheck(); uhr(); pruefeLinks(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') uebersicht(); });
})();
