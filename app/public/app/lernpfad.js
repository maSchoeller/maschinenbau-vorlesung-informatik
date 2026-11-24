/* =============================================================
   app/lernpfad.js – Stand und Hervorhebung auf dem statisch gerenderten Lernpfad (Rolle Navigation)
   Der Lernpfad zeigt die 20 Termine des Plans. Stand gibt es zu den Lektionen mit Seiten: Jedes
   Element mit data-nr="V01" (eigene Seiten eines Termins; Material aus stoff gibt es zurzeit nicht) bekommt Stand
   und Zahlen. Eine Lektion kann bei mehreren Terminen stehen. Ohne JavaScript bleibt die Liste
   vollständig benutzbar.
   ============================================================= */
(function () {
  'use strict';
  var A = window.KursApp, KS = window.KursSpeicher;
  var seite = document.querySelector('.lp');
  if (!A || !seite) return;

  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function plural(n, e, m) { return n + ' ' + (n === 1 ? e : m); }
  var TEXT = {
    offen: { icon: 'circle', text: 'Offen' },
    begonnen: { icon: 'half', text: 'Begonnen' },
    fertig: { icon: 'done', text: 'Fertig' }
  };

  function zeichnen(lektionen) {
    var S = window.KursStand;
    var st = S.alle(lektionen);
    var akt = S.aktuell(lektionen, st);
    var heute = S.heuteIso();

    lektionen.forEach(function (t, i) {
      var s = st[i];
      $$('[data-nr="' + t.nr + '"]', seite).forEach(function (ort) {
        var marke = ort.querySelector('[data-stand]');
        if (marke) {
          marke.className = 'np-stand np-stand--' + s.status;
          marke.textContent = '';
          marke.appendChild(A.icon(TEXT[s.status].icon));
          var sp = document.createElement('span'); sp.textContent = TEXT[s.status].text; marke.appendChild(sp);
        }
        var z = ort.querySelector('[data-zahlen]');
        if (z) {
          var teile = [];
          if (s.verstehen.gesamt) teile.push(s.verstehen.fertig + ' von ' + plural(s.verstehen.gesamt, 'Abschnitt', 'Abschnitten'));
          if (s.labor.vorhanden) teile.push(s.labor.geloest + ' von ' + plural(s.labor.gesamt, 'Aufgabe', 'Aufgaben') + ' gelöst');
          z.textContent = s.begonnen ? teile.join(' · ') : '';
        }
      });
    });

    /* Freigabedaten, die schon erreicht sind, ausblenden */
    $$('[data-frei]', seite).forEach(function (n) { n.hidden = S.freigegeben(n.getAttribute('data-frei'), heute); });

    /* „Jetzt dran“: der erste Termin, bei dem die aktuelle Lektion steht */
    var aktNr = akt ? lektionen[akt.index].nr : null;
    var ort = aktNr ? seite.querySelector('[data-nr="' + aktNr + '"]') : null;
    var ziel = ort ? ort.closest('.lp-station') : null;
    $$('.lp-station', seite).forEach(function (li) {
      var ist = li === ziel;
      li.classList.toggle('is-aktuell', ist);
      if (ist) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      var kopf = li.querySelector('.lp-aktuell');
      if (ist && !kopf) {
        kopf = document.createElement('p');
        kopf.className = 'lp-aktuell';
        var text = li.querySelector('.lp-text');
        text.insertBefore(kopf, text.firstChild);
      }
      if (kopf) {
        if (ist) kopf.textContent = akt.wartet ? 'Als Nächstes' : 'Jetzt dran';
        else kopf.parentNode.removeChild(kopf);
      }
    });

    var sprung = seite.querySelector('[data-lp-sprung]');
    if (sprung) {
      sprung.textContent = '';
      if (ziel) {
        var a = document.createElement('a');
        a.href = '#' + ziel.id;
        a.textContent = 'Zu deinem Stand: Termin ' + ziel.getAttribute('data-termin') + ' (' + aktNr + ' · ' + lektionen[akt.index].kurz + ')';
        sprung.appendChild(a);
        sprung.hidden = false;
      } else sprung.hidden = true;
    }
    return ziel;
  }

  var erstes = true;
  function start() {
    A.kurs().then(function (d) {
      var lektionen = d.lektionen || [];
      var ziel = zeichnen(lektionen);
      if (erstes) {
        erstes = false;
        /* Beim Öffnen den aktuellen Termin in den Blick holen, außer ein Anker wurde ausdrücklich angesteuert */
        if (ziel && !location.hash) {
          var r = ziel.getBoundingClientRect();
          if (r.top < 120 || r.bottom > window.innerHeight - 20) {
            var ruhig = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            ziel.scrollIntoView({ block: 'center', behavior: ruhig ? 'auto' : 'smooth' });
          }
        }
      }
      var zeit = null;
      try {
        if (KS && KS.abonnieren) KS.abonnieren('inf-mb/', function () { clearTimeout(zeit); zeit = setTimeout(function () { zeichnen(lektionen); }, 400); });
      } catch (e) { /* egal */ }
    }).catch(function () { /* ohne Daten bleibt die statische Liste */ });
  }

  if (document.readyState === 'complete') start();
  else document.addEventListener('DOMContentLoaded', start);
})();
