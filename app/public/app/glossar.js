/* =============================================================
   app/glossar.js – Filterfeld des Glossars (Rolle Navigation)
   Die Liste ist statisch gerendert und ohne Skript lesbar. Hier: sofort filtern, ohne Server.
   Umlaute, Akzente und Groß-/Kleinschreibung werden toleriert (ä = a, ß = ss).
   ============================================================= */
(function () {
  'use strict';
  var feld = document.getElementById('gl-filter');
  var liste = document.querySelector('[data-gl-liste]');
  if (!feld || !liste) return;

  function norm(s) {
    return String(s).toLowerCase().replace(/ß/g, 'ss').normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  var zahl = document.getElementById('gl-zahl');
  var leer = document.querySelector('[data-gl-leer]');
  var gesamt = parseInt(zahl.getAttribute('data-gesamt'), 10) || 0;
  var eintraege = Array.prototype.slice.call(liste.querySelectorAll('.gl-eintrag')).map(function (e) {
    return { el: e, begriff: norm(e.querySelector('dt').textContent), alles: norm(e.textContent) };
  });
  var gruppen = Array.prototype.slice.call(liste.querySelectorAll('.gl-gruppe'));
  var buchstaben = {};
  Array.prototype.forEach.call(document.querySelectorAll('.gl-buchstaben a'), function (a) { buchstaben[a.getAttribute('data-b')] = a.parentNode; });

  function filtern() {
    var q = norm(feld.value).trim();
    var worte = q ? q.split(/\s+/) : [];
    var treffer = 0;
    eintraege.forEach(function (e) {
      var ok = worte.every(function (w) {
        var alt = w.replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u');   /* „zaehler“ findet „Zähler“ */
        return e.alles.indexOf(w) >= 0 || (alt !== w && e.alles.indexOf(alt) >= 0);
      });
      e.el.hidden = !ok;
      if (ok) treffer++;
    });
    gruppen.forEach(function (g) {
      var sichtbar = !!g.querySelector('.gl-eintrag:not([hidden])');
      g.hidden = !sichtbar;
      var li = buchstaben[g.getAttribute('data-b')];
      if (li) li.hidden = !sichtbar;
    });
    leer.hidden = treffer > 0;
    zahl.textContent = q ? treffer + ' von ' + gesamt + ' Begriffen' : gesamt + ' Begriffe';
  }

  /* Treffer nach Begriff vor Erklärungstreffern ist bei einer Liste A–Z nicht nötig: die Reihenfolge bleibt alphabetisch. */
  feld.disabled = false;
  feld.addEventListener('input', filtern);
  feld.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && feld.value) { feld.value = ''; filtern(); e.stopPropagation(); }
  });
  filtern();

  /* Anker aus der Suche (glossar.html#g-…) hervorheben: das übernimmt :target im CSS.
     Ist der Begriff durch einen alten Filter ausgeblendet, gibt es keinen Filter beim Laden – nichts zu tun. */
})();
