/* =============================================================
   app/lernpfad.js – Stand und Hervorhebung auf dem statisch gerenderten Lernpfad (Rolle Navigation)
   Ohne JavaScript bleibt die Liste vollständig benutzbar; hier kommen nur Stand, „Jetzt dran“
   und das Ausblenden bereits erreichter Freigabedaten dazu.
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

  function zeichnen(termine) {
    var S = window.KursStand;
    var st = S.alle(termine);
    var akt = S.aktuell(termine, st);
    var heute = S.heuteIso();

    termine.forEach(function (t, i) {
      var li = document.getElementById(t.nr.toLowerCase());
      if (!li) return;
      var s = st[i];
      var marke = li.querySelector('[data-stand]');
      if (marke) {
        marke.className = 'np-stand np-stand--' + s.status;
        marke.textContent = '';
        marke.appendChild(A.icon(TEXT[s.status].icon));
        var sp = document.createElement('span'); sp.textContent = TEXT[s.status].text; marke.appendChild(sp);
      }
      var z = li.querySelector('[data-zahlen]');
      if (z) {
        var teile = [];
        if (s.verstehen.gesamt) teile.push(s.verstehen.fertig + ' von ' + plural(s.verstehen.gesamt, 'Abschnitt', 'Abschnitten'));
        if (s.labor.vorhanden) teile.push(s.labor.geloest + ' von ' + plural(s.labor.gesamt, 'Aufgabe', 'Aufgaben') + ' gelöst');
        z.textContent = s.begonnen ? teile.join(' · ') : '';
      }
      var frei = li.querySelector('[data-frei]');
      if (frei) frei.hidden = S.freigegeben(t.freigabe, heute);
      var ist = akt && akt.index === i;
      li.classList.toggle('is-aktuell', !!ist);
      if (ist) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      var kopf = li.querySelector('.lp-aktuell');
      if (ist && !kopf) {
        kopf = document.createElement('p');
        kopf.className = 'lp-aktuell';
        li.querySelector('.lp-text').insertBefore(kopf, li.querySelector('h3'));
      }
      if (kopf) {
        if (ist) kopf.textContent = akt.wartet ? 'Als Nächstes' : 'Jetzt dran';
        else kopf.parentNode.removeChild(kopf);
      }
    });

    var sprung = seite.querySelector('[data-lp-sprung]');
    if (sprung) {
      sprung.textContent = '';
      if (akt) {
        var a = document.createElement('a');
        a.href = '#' + termine[akt.index].nr.toLowerCase();
        a.textContent = 'Zu deiner aktuellen Lektion: ' + termine[akt.index].nr + ' · ' + termine[akt.index].kurz;
        sprung.appendChild(a);
        sprung.hidden = false;
      } else sprung.hidden = true;
    }
    return akt ? document.getElementById(termine[akt.index].nr.toLowerCase()) : null;
  }

  var erstes = true;
  function start() {
    A.kurs().then(function (d) {
      var termine = d.termine || [];
      var ziel = zeichnen(termine);
      if (erstes) {
        erstes = false;
        /* Beim Öffnen die aktuelle Lektion in den Blick holen, außer ein Anker wurde ausdrücklich angesteuert */
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
        if (KS && KS.abonnieren) KS.abonnieren('inf-mb/', function () { clearTimeout(zeit); zeit = setTimeout(function () { zeichnen(termine); }, 400); });
      } catch (e) { /* egal */ }
    }).catch(function () { /* ohne Daten bleibt die statische Liste */ });
  }

  if (document.readyState === 'complete') start();
  else document.addEventListener('DOMContentLoaded', start);
})();
