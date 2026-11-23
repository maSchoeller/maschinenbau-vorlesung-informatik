/* =============================================================
   app/stand.js – gemeinsame Stand-Berechnung für Heute und Lernpfad (Rolle Navigation)
   window.KursStand
     .von(termin)            -> { verstehen:{fertig,gesamt,offenAnker}, labor:{geloest,gesamt,offenAnker}, status, begonnen }
     .alle(termine)          -> Liste der Stände in Kursreihenfolge
     .aktuell(termine, st, heuteDatum) -> { index, wartet } | null (null = alles fertig)
     .offeneAufgaben(termin) -> offene, prüfbare Laborstationen
     .freigabeText(iso)      -> 'ab 03.12.' | ''
     .freigegeben(iso, heute)-> true, wenn kein Datum oder Datum erreicht
   Liest nur über KursSpeicher.sofort (lokal zuerst, wie der Bestand). Texte immer per textContent setzen.
   ============================================================= */
(function () {
  'use strict';
  var KS = window.KursSpeicher;

  function lesen(nr, k) {
    try { return (KS && KS.sofort.lesen(KS.pfad(nr, k))) || {}; } catch (e) { return {}; }
  }
  function istFreiwillig(a) { return /freiwillig/i.test(a.titel || ''); }
  function anzahl(o) { return Object.keys(o || {}).length; }

  /* Pflichtabschnitte zählen; „Deep Dive (freiwillig)“ zählt nicht für „fertig“. */
  function von(t) {
    var done = lesen(t.nr, 'done'), aufg = lesen(t.nr, 'aufg'), beg = lesen(t.nr, 'begonnen'), ges = lesen(t.nr, 'gesehen');
    var pflicht = (t.abschnitte || []).filter(function (a) { return !istFreiwillig(a); });
    var fertigA = pflicht.filter(function (a) { return !!done[a.id]; }).length;
    var offenA = pflicht.filter(function (a) { return !done[a.id]; })[0];

    var stationen = offeneAufgaben(t, aufg, beg);
    var pruefbar = (t.aufgaben || []).filter(function (a) { return (a.pruefbar || []).length; });
    /* Zählung wie im Labor und in KursApp.fortschritt: je prüfbarem Teil (data-id), nicht je Station */
    var ids = [];
    pruefbar.forEach(function (a) { a.pruefbar.forEach(function (i) { if (ids.indexOf(i) < 0) ids.push(i); }); });
    var geloest = ids.filter(function (i) { return !!aufg[i]; }).length;
    var hatLabor = !!t.labor && ids.length > 0;

    var verstehenFertig = pflicht.length === 0 || fertigA === pflicht.length;
    var laborFertig = !hatLabor || geloest === ids.length;
    var gearbeitet = anzahl(done) + anzahl(aufg) + anzahl(beg) > 0;
    var begonnen = gearbeitet || anzahl(ges) > 0;
    var status = (verstehenFertig && laborFertig && (pflicht.length || hatLabor)) ? 'fertig' : (begonnen ? 'begonnen' : 'offen');
    return {
      nr: t.nr,
      verstehen: { fertig: fertigA, gesamt: pflicht.length, offenAnker: offenA ? (offenA.anker || offenA.id) : null, ganz: verstehenFertig },
      labor: { geloest: geloest, gesamt: ids.length, offenAnker: stationen.length ? stationen[0].id : null, ganz: laborFertig, vorhanden: hatLabor },
      begonnen: begonnen,
      gearbeitet: gearbeitet,
      status: status
    };
  }

  /* Stationen mit prüfbaren Teilen, die noch nicht ganz gelöst sind; Teil B (Training) zuerst für Wiederholung */
  function offeneAufgaben(t, aufg, beg) {
    aufg = aufg || lesen(t.nr, 'aufg'); beg = beg || lesen(t.nr, 'begonnen');
    return (t.aufgaben || []).filter(function (a) {
      return (a.pruefbar || []).length && !a.pruefbar.every(function (i) { return !!aufg[i]; });
    }).map(function (a) {
      var angefangen = a.pruefbar.some(function (i) { return !!aufg[i] || !!beg[i]; });
      return { id: a.id, titel: a.titel, teil: a.teil, sterne: a.sterne, minuten: a.minuten, angefangen: angefangen };
    });
  }

  function alle(termine) { return (termine || []).map(von); }

  function heuteIso(d) {
    d = d || new Date();
    function z(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
  }
  function freigegeben(iso, heute) { return !iso || String(iso) <= (heute || heuteIso()); }
  function freigabeText(iso) {
    var m = /^\d{4}-(\d\d)-(\d\d)$/.exec(iso || '');
    return m ? 'ab ' + m[2] + '.' + m[1] + '.' : '';
  }

  /* Aktuelle Lektion: dort, wo du zuletzt gearbeitet hast (höchste Lektion mit Abschnitten, Aufgaben oder Versuchen).
     Ist sie fertig, die nächste (wartet: true, solange deren Freigabedatum noch nicht erreicht ist).
     Noch nichts getan: die erste Lektion. Alles fertig: null.
     Offene Aufgaben früherer Lektionen kommen als Warm-up wieder vor. */
  function aktuell(termine, st, heute) {
    var hoechste = -1;
    st.forEach(function (s, i) { if (s.gearbeitet) hoechste = i; });
    if (hoechste < 0) return { index: 0, wartet: !freigegeben(termine[0].freigabe, heute) };
    if (st[hoechste].status !== 'fertig') return { index: hoechste, wartet: false };
    var n = hoechste + 1;
    if (n >= termine.length) return null;
    return { index: n, wartet: !freigegeben(termine[n].freigabe, heute) };
  }

  window.KursStand = {
    von: von, alle: alle, aktuell: aktuell, offeneAufgaben: offeneAufgaben,
    freigabeText: freigabeText, freigegeben: freigegeben, heuteIso: heuteIso
  };
})();
