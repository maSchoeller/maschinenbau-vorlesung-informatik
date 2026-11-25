/* =============================================================
   app/dozent.js – Seite „Kursübersicht“ für Dozierende (Vertrag Abschnitt 14).
   Zeigt das Gruppenbild aus /api/dozent/uebersicht: Anzahlen je Lektion, Station und Abschnitt.
   Titel und Reihenfolge kommen aus kurs.json; vom Server kommen nur Kennzeichen (id) und Zahlen.
   Die API wird nur gerufen, wenn /api/ich das Konto als Dozent meldet (sonst kein Fehler in der Konsole).
   Alle Texte per textContent.
   ============================================================= */
(function () {
  'use strict';
  var KA = window.KursApp;
  var seite = document.querySelector('.dz');
  if (!KA || !seite) return;

  function $(s) { return seite.querySelector(s); }
  function el(tag, klasse, text) {
    var n = document.createElement(tag);
    if (klasse) n.className = klasse;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function leeren(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function plural(n, eins, viele) { return n + ' ' + (n === 1 ? eins : viele); }
  function prozent(n, von) { return von > 0 ? Math.round((n / von) * 100) : 0; }

  var kurs = null;      /* kurs.json */
  var bild = null;      /* Antwort der API */
  var gewaehlt = null;  /* 'V01' */

  function block(name) {
    $('[data-dz-laedt]').hidden = name !== 'laedt';
    ['gast', 'fremd', 'fehler', 'bild'].forEach(function (b) {
      var n = $('[data-dz-block="' + b + '"]'); if (n) n.hidden = b !== name;
    });
  }

  /* ── Zustände ohne Bild ──────────────────────────────────── */
  function zeigeFremd(s) {
    $('[data-dz-kennung]').textContent = s.benutzerId || '';
    block('fremd');
  }
  function zeigeFehler(e) {
    var text = 'Die Übersicht konnte nicht geladen werden.';
    if (e && e.offline) text = 'Keine Verbindung zum Server. Die Übersicht braucht das Netz.';
    else if (e && e.status === 429) text = 'Zu viele Anfragen in kurzer Zeit. Warte einen Moment.';
    else if (e && e.status === 503) text = 'Der Server ist für die Übersicht noch nicht eingerichtet (Kursstruktur fehlt).';
    $('[data-dz-fehler]').textContent = text;
    block('fehler');
  }

  /* ── Bild ────────────────────────────────────────────────── */
  function lektion(nr) {
    var i;
    for (i = 0; i < bild.lektionen.length; i++) if (bild.lektionen[i].nr === nr) return bild.lektionen[i];
    return null;
  }
  function termin(nr) {
    var i;
    for (i = 0; i < kurs.lektionen.length; i++) if (kurs.lektionen[i].nr === nr) return kurs.lektionen[i];
    return null;
  }
  function uhrzeit(iso) {
    var d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
  }

  /* Vorauswahl: Lektion aus der Adresse (#v07), sonst die späteste, in der mindestens ein Viertel der Konten aktiv ist */
  function vorauswahl() {
    var aus = (location.hash || '').replace('#', '').toUpperCase();
    if (lektion(aus)) return aus;
    var schwelle = Math.max(1, bild.konten / 4), nr = null;
    bild.lektionen.forEach(function (l) { if (l.konten >= schwelle) nr = l.nr; });
    return nr || (bild.lektionen[0] && bild.lektionen[0].nr) || null;
  }

  function fuelleWahl() {
    var sel = $('[data-dz-lektion]');
    leeren(sel);
    bild.lektionen.forEach(function (l) {
      var t = termin(l.nr);
      var o = el('option', null, KA.termin.lang(l.nr) + ' · ' + (t ? t.kurz : '') + ' (' + l.konten + ' aktiv)');
      o.value = l.nr;
      sel.appendChild(o);
    });
    sel.value = gewaehlt;
  }

  /* Balken: eine neutrale Farbe, die Zahl steht immer als Text daneben */
  function balken(n, von) {
    var w = el('span', 'dz-balken');
    var b = el('span', 'dz-balken__spur');
    var f = el('span', 'dz-balken__wert');
    f.style.width = prozent(n, von) + '%';
    b.appendChild(f);
    b.setAttribute('aria-hidden', 'true');
    w.appendChild(b);
    w.appendChild(el('span', 'dz-balken__text', n + ' von ' + von));
    return w;
  }

  function kennzahl(liste, wert, text, zusatz) {
    var d = el('div', 'dz-kennzahl');
    d.appendChild(el('dt', null, text));
    var dd = el('dd');
    dd.appendChild(el('span', 'dz-kennzahl__wert', wert));
    if (zusatz) dd.appendChild(el('span', 'dz-kennzahl__zusatz', zusatz));
    d.appendChild(dd);
    liste.appendChild(d);
  }

  function zeichneLektion() {
    var l = lektion(gewaehlt), t = termin(gewaehlt), N = bild.konten;
    if (!l || !t) return;

    /* 1. Wie weit ist die Gruppe? */
    var z = $('[data-dz-zahlen]');
    leeren(z);
    kennzahl(z, l.konten + ' von ' + N, 'In dieser Lektion aktiv', 'Konten mit Lernstand');
    if (l.teile.A) kennzahl(z, String(l.teile.A.alle), 'Labor (Teil A) vollständig', plural(l.teile.A.begonnen, 'weiteres Konto', 'weitere Konten') + ' mittendrin');
    if (l.teile.B) kennzahl(z, String(l.teile.B.alle), 'Training (Teil B) vollständig', plural(l.teile.B.begonnen, 'weiteres Konto', 'weitere Konten') + ' mittendrin');
    if (l.quiz) kennzahl(z, Math.round(l.quiz.anteil * 100) + ' %', 'Selbstcheck im Schnitt', plural(l.quiz.konten, 'Konto', 'Konten') + ' mit Ergebnis');

    /* 2. Wo hängt es? */
    var titel = {};
    (t.aufgaben || []).forEach(function (a) { titel[a.id] = a; });
    var stationen = l.stationen.filter(function (s) { return !!titel[s.id]; });
    var haenger = stationen.filter(function (s) { return s.begonnen > 0; })
      .sort(function (a, b) { return b.begonnen - a.begonnen; }).slice(0, 3);
    var h = $('[data-dz-haenger]');
    leeren(h);
    if (!stationen.length) h.textContent = 'Diese Lektion hat keine Aufgaben mit automatischer Prüfung.';
    else if (!haenger.length) h.textContent = 'Im Moment hängt niemand an einer begonnenen Aufgabe.';
    else {
      h.appendChild(document.createTextNode('Am häufigsten begonnen, aber nicht gelöst: '));
      haenger.forEach(function (s, i) {
        if (i) h.appendChild(document.createTextNode(', '));
        var a = el('a', null, titel[s.id].titel);
        a.href = KA.url(t.labor) + '#' + encodeURIComponent(s.id);
        h.appendChild(a);
        h.appendChild(document.createTextNode(' (' + s.begonnen + ')'));
      });
      h.appendChild(document.createTextNode('.'));
    }
    var tb = $('[data-dz-aufgaben]');
    leeren(tb);
    stationen.forEach(function (s) {
      var a = titel[s.id], tr = el('tr');
      var th = el('th'); th.scope = 'row';
      var link = el('a', null, a.titel);
      link.href = KA.url(t.labor) + '#' + encodeURIComponent(s.id);
      th.appendChild(link);
      tr.appendChild(th);
      tr.appendChild(el('td', null, a.teil === 'B' ? 'Training' : a.teil === 'A' ? 'Labor' : ''));
      var g = el('td'); g.appendChild(balken(s.geloest, N)); tr.appendChild(g);
      tr.appendChild(el('td', 'dz-zahl', String(s.begonnen)));
      tb.appendChild(tr);
    });
    seite.querySelector('.dz-tabelle').hidden = !stationen.length;

    /* 3. Lerneinheit */
    var q = $('[data-dz-quiz]');   /* das Ergebnis steht oben bei den Kennzahlen; hier nur, wenn es fehlt */
    q.textContent = l.quiz ? '' : 'Zum Selbstcheck liegt noch kein Ergebnis vor.';
    q.hidden = !!l.quiz;
    var abschn = {};
    (t.abschnitte || []).forEach(function (a) { abschn[a.id] = a; });
    var ta = $('[data-dz-abschnitte]');
    leeren(ta);
    l.abschnitte.forEach(function (a) {
      if (!abschn[a.id]) return;
      var tr = el('tr');
      var th = el('th', null, abschn[a.id].titel); th.scope = 'row';
      tr.appendChild(th);
      var td = el('td'); td.appendChild(balken(a.n, N)); tr.appendChild(td);
      ta.appendChild(tr);
    });
  }

  function zeichne() {
    var stand = plural(bild.konten, 'Konto', 'Konten') + ' mit Lernstand · Stand ' + uhrzeit(bild.stand);
    $('[data-dz-stand]').textContent = stand;
    $('[data-dz-mindest]').textContent = String(bild.mindest);
    var wenig = $('[data-dz-wenig]'), inhalt = $('[data-dz-inhalt]'), wahl = seite.querySelector('.dz-wahl');
    if (!bild.genug) {
      wenig.textContent = 'Bisher ' + (bild.konten === 1 ? 'lernt 1 Konto' : 'lernen ' + bild.konten + ' Konten') + ' mit Anmeldung. Zahlen je Lektion gibt es ab '
        + bild.mindest + ' Konten, damit niemand einzeln erkennbar ist.';
      wenig.hidden = false; inhalt.hidden = true; wahl.hidden = true;
      block('bild');
      return;
    }
    wenig.hidden = true; inhalt.hidden = false; wahl.hidden = false;
    if (!gewaehlt || !lektion(gewaehlt)) gewaehlt = vorauswahl();
    fuelleWahl();
    zeichneLektion();
    block('bild');
  }

  /* ── Laden ───────────────────────────────────────────────── */
  function laden() {
    block('laedt');
    KA.konto.status().then(function (s) {
      if (!s || !s.angemeldet) { block('gast'); return null; }
      if (!s.dozent) { zeigeFremd(s); return null; }
      return Promise.all([KA.kurs(), KA.api('dozent/uebersicht')]).then(function (r) {
        kurs = r[0]; bild = r[1];
        zeichne();
      });
    }).catch(zeigeFehler);
  }

  seite.addEventListener('click', function (e) {
    var k = e.target.closest ? e.target.closest('[data-dz-aktion]') : null;
    if (!k) return;
    var aktion = k.getAttribute('data-dz-aktion');
    if (aktion === 'anmelden') KA.konto.anmelden();
    else if (aktion === 'neu') laden();
    else if (aktion === 'kopieren') {
      var text = $('[data-dz-kennung]').textContent, ziel = $('[data-dz-kopiert]');
      var fertig = function (ok) { ziel.textContent = ok ? 'Kopiert.' : 'Kopieren ging nicht. Markiere die Kennung und kopiere sie von Hand.'; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { fertig(true); }, function () { fertig(false); });
      else fertig(false);
    }
  });
  $('[data-dz-lektion]').addEventListener('change', function (e) {
    gewaehlt = e.target.value;
    try { history.replaceState(null, '', '#' + gewaehlt.toLowerCase()); } catch (err) {}
    zeichneLektion();
  });

  laden();
})();
