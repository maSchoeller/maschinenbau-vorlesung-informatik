/* =============================================================
   app/stand.js – gemeinsame Stand-Berechnung für Heute und Lernpfad (Rolle Navigation)
   window.KursStand
     .von(termin)            -> { verstehen:{fertig,gesamt,offenAnker}, labor:{geloest,gesamt,offenAnker}, status, begonnen }
     .alle(termine)          -> Liste der Stände in Kursreihenfolge
     .aktuell(termine, st, heuteDatum) -> { index, wartet } | null (null = alles fertig)
     .offeneAufgaben(termin) -> offene, prüfbare Laborstationen
     .freigabeText(iso)      -> 'ab 03.12.' | ''
     .freigegeben(iso, heute)-> true, wenn kein Datum oder Datum erreicht
   Zählregel: KursApp.fortschritt.termin (kern.js), damit Lektionswähler, Heute und Lernpfad gleich zählen.
   Liest nur über KursSpeicher.sofort (lokal zuerst, wie der Bestand). Texte immer per textContent setzen.
   ============================================================= */
(function () {
  'use strict';
  /* Die Zählregel selbst steht an einer Stelle: KursApp.fortschritt (app/kern.js). */
  var F = window.KursApp.fortschritt;
  function von(t) { return F.termin(t); }
  function offeneAufgaben(t) { return F.offeneAufgaben(t); }

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
