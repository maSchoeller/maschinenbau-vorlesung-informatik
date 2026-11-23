/* =============================================================
   app/heute.js – Seite „Heute“ (Rolle Navigation)
   Rangfolge: 1 Weiter, wo du warst · 2 aktuelle Lektion · 3 Warm-up · 4 ein dezenter Hinweis.
   Ohne Stand bleibt der statisch gerenderte Einstieg („Starte mit V01“) stehen.
   Liest den Stand über KursStand (stand.js), die letzte Seite aus inf-mb/app/zuletzt.
   ============================================================= */
(function () {
  'use strict';
  var A = window.KursApp, KS = window.KursSpeicher;
  var wurzel = document.querySelector('[data-heute]');
  if (!A || !wurzel) return;

  var HINWEIS_SCHLUESSEL = 'inf-mb-app:heute-hinweise';
  var termine = null, hinweis = null, kontoStatus;

  function el(tag, attr, kinder) {
    var e = document.createElement(tag);
    Object.keys(attr || {}).forEach(function (k) {
      if (k === 'text') e.textContent = attr[k];
      else if (attr[k] != null && attr[k] !== false) e.setAttribute(k, attr[k] === true ? '' : attr[k]);
    });
    (kinder || []).forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function ic(id) { return A.icon(id); }
  function plural(n, e, m) { return n + ' ' + (n === 1 ? e : m); }

  var STAND = {
    offen: { icon: 'circle', text: 'Offen' },
    begonnen: { icon: 'half', text: 'Begonnen' },
    fertig: { icon: 'done', text: 'Fertig' }
  };
  function standMarke(s) {
    return el('span', { class: 'np-stand np-stand--' + s }, [ic(STAND[s].icon), el('span', { text: STAND[s].text })]);
  }

  /* ── Hinweise wegklicken (nur dieses Gerät) ─────────────── */
  function weggeklickt() {
    try { return JSON.parse(localStorage.getItem(HINWEIS_SCHLUESSEL)) || {}; } catch (e) { return {}; }
  }
  function wegmerken(id) {
    var w = weggeklickt(); w[id] = 1;
    try { localStorage.setItem(HINWEIS_SCHLUESSEL, JSON.stringify(w)); } catch (e) { /* gesperrt: Hinweis kommt wieder */ }
  }
  function installiert() {
    try { return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true; } catch (e) { return false; }
  }

  /* ── Zuletzt besucht ────────────────────────────────────── */
  function zuletzt() {
    var z = null;
    try { z = KS && KS.sofort.lesen('inf-mb/app/zuletzt'); } catch (e) { z = null; }
    if (!z || typeof z.url !== 'string') return null;
    /* nur Seiten dieser App: relativer Pfad, .html, optionaler Anker */
    if (!/^[a-z0-9][a-z0-9\/_.-]*\.html(#[A-Za-z0-9_:.-]*)?$/i.test(z.url)) return null;
    /* nur Lerneinheiten und Labore taugen als „Weiter“; Navigationsseiten (Glossar, Lernpfad, Konto …) nicht */
    if (!z.lektion && !/^lektionen\//.test(z.url)) return null;
    return z;
  }
  function zeitText(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    var heute = new Date();
    var gleich = d.toDateString() === heute.toDateString();
    var uhr = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    return gleich ? 'heute um ' + uhr + ' Uhr' : 'am ' + d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) + '. um ' + uhr + ' Uhr';
  }

  /* ── Bausteine ──────────────────────────────────────────── */
  function weiterBlock(z, primaer) {
    var titel = String(z.titel || 'Zuletzt geöffnete Seite').replace(/\s*·\s*Informatik Maschinenbau\s*$/, '');
    var meta = [z.lektion ? 'Lektion ' + z.lektion : '', zeitText(z.zeit)].filter(Boolean).join(' · ');
    return el('section', { class: 'np-block', 'aria-labelledby': 'h-weiter' }, [
      el('h2', { id: 'h-weiter', text: 'Weiter, wo du warst' }),
      el('a', { class: 'k-btn np-gross' + (primaer ? '' : ' k-btn--ghost'), href: A.url(z.url) }, [el('span', { class: 'np-gross__text', text: titel }), ic('chevron-right')]),
      meta ? el('p', { class: 'k-small k-muted np-meta', text: 'Zuletzt geöffnet: ' + meta }) : null
    ]);
  }

  function schritt(nr, name, stand, text, linkText, href, primaer, naechster) {
    var li = el('li', { class: 'np-schritt' + (naechster ? ' is-naechster' : '') }, [
      el('span', { class: 'np-schritt__nr', 'aria-hidden': 'true', text: String(nr) }),
      el('div', { class: 'np-schritt__text' }, [
        el('h3', { text: name }),
        el('p', { class: 'k-small' }, [standMarke(stand), el('span', { class: 'k-muted', text: ' · ' + text })])
      ]),
      el('a', { class: 'k-btn' + (primaer ? '' : ' k-btn--ghost'), href: href }, [el('span', { text: linkText }), ic('chevron-right')])
    ]);
    return li;
  }

  function lektionBlock(t, s, wartet, primaerHier) {
    var v = s.verstehen, l = s.labor;
    var vStand = v.ganz ? (v.gesamt ? 'fertig' : 'offen') : (v.fertig ? 'begonnen' : 'offen');
    var lStand = !l.vorhanden ? 'offen' : (l.ganz ? 'fertig' : (l.geloest || hatLaborBeginn(t) ? 'begonnen' : 'offen'));
    var vText = v.gesamt ? v.fertig + ' von ' + plural(v.gesamt, 'Abschnitt', 'Abschnitten') + ' abgehakt' : 'Lerneinheit';
    var lText = l.vorhanden ? l.geloest + ' von ' + plural(l.gesamt, 'Aufgabe', 'Aufgaben') + ' gelöst' : 'zu dieser Lektion gibt es kein Labor';

    var vAnker = v.offenAnker && v.fertig ? '#' + v.offenAnker : '';
    var vLink = t.lerneinheit + vAnker;
    var vKnopf = v.ganz ? 'Nochmal lesen' : (v.fertig ? 'Weiter lesen' : 'Verstehen starten');
    var lAnker = l.offenAnker && (l.geloest || hatLaborBeginn(t)) ? '#' + l.offenAnker : '';
    var lLink = (t.labor || t.lerneinheit) + lAnker;
    var lKnopf = !l.vorhanden ? 'Zur Lerneinheit' : (l.ganz ? 'Labor wiederholen' : (l.geloest || lAnker ? 'Weiter im Labor' : 'Labor starten'));

    /* nächster Schritt: Verstehen, solange nicht fertig; danach Labor */
    var naechsterIstVerstehen = !v.ganz;
    var li = [
      schritt(1, 'Verstehen', vStand, vText, vKnopf, A.url(vLink), primaerHier && naechsterIstVerstehen, naechsterIstVerstehen),
      l.vorhanden ? schritt(2, 'Labor', lStand, lText, lKnopf, A.url(lLink), primaerHier && !naechsterIstVerstehen, !naechsterIstVerstehen && !l.ganz) : null
    ];
    return el('section', { class: 'np-block', 'aria-labelledby': 'h-lektion' }, [
      el('p', { class: 'np-kicker', text: wartet ? 'Als Nächstes' : 'Jetzt dran' }),
      el('h2', { id: 'h-lektion', text: t.nr + ' · ' + t.kurz }),
      el('p', { class: 'np-hook', text: t.hook }),
      wartet ? el('p', { class: 'k-small k-muted', text: 'Diese Lektion ist erst ' + window.KursStand.freigabeText(t.freigabe).replace(/^ab /, 'ab dem ') + ' freigegeben. Du kannst schon hineinschauen.' }) : null,
      el('ol', { class: 'np-schritte' }, li)
    ]);
  }
  function hatLaborBeginn(t) {
    try { var b = KS.sofort.lesen(KS.pfad(t.nr, 'begonnen')) || {}; return Object.keys(b).length > 0; } catch (e) { return false; }
  }

  function fertigBlock() {
    return el('section', { class: 'np-block', 'aria-labelledby': 'h-lektion' }, [
      el('h2', { id: 'h-lektion', text: 'Alle 22 Lektionen sind abgeschlossen' }),
      el('p', { text: 'Stark. Jetzt lohnt sich die Wiederholung vor der Klausur.' }),
      el('a', { class: 'k-btn', href: A.url('klausurtrainer.html') }, [el('span', { text: 'Zum Klausurtrainer' }), ic('chevron-right')])
    ]);
  }

  /* Warm-up: bis zu drei offene Aufgaben aus früheren, begonnenen Lektionen.
     Je Lektion höchstens zwei (die besten), danach über alle Lektionen ranken: angefangen vor neu,
     Training (Teil B) vor Labor, leichter vor schwerer; bei Gleichstand die nähere Lektion zuerst. */
  function warmupWahl(aktIndex, st) {
    var kandidaten = [];
    for (var i = aktIndex - 1; i >= 0; i--) {
      if (!st[i].begonnen || st[i].status === 'fertig') continue;
      var offen = window.KursStand.offeneAufgaben(termine[i]);
      offen.map(function (a, k) { return { a: a, k: k, t: termine[i], nah: aktIndex - i, rang: warmupRang(a) }; })
        .sort(function (x, y) { return x.rang - y.rang || x.k - y.k; })
        .slice(0, 2).forEach(function (c) { kandidaten.push(c); });
    }
    kandidaten.sort(function (x, y) { return x.rang - y.rang || x.nah - y.nah || x.k - y.k; });
    return kandidaten.slice(0, 3);
  }
  function warmupRang(a) { return (a.angefangen ? 0 : 10) + (a.teil === 'B' ? 0 : 5) + (a.sterne || 0); }
  function warmupBlock(liste) {
    if (!liste.length) return null;
    return el('section', { class: 'np-block', 'aria-labelledby': 'h-warmup' }, [
      el('h2', { id: 'h-warmup', text: 'Warm-up' }),
      el('p', { class: 'k-muted', text: 'Kurz wiederholen, was du schon angefangen hast.' }),
      el('ul', { class: 'np-warmup' }, liste.map(function (w) {
        var meta = [w.a.teil === 'B' ? 'Training' : 'Labor', w.a.minuten ? 'ca. ' + w.a.minuten + ' Min' : '', w.a.sterne ? 'Stufe ' + w.a.sterne + ' von 4' : ''].filter(Boolean).join(' · ');
        return el('li', {}, [
          el('a', { class: 'np-aufgabe', href: A.url(w.t.labor + '#' + w.a.id) }, [
            el('span', { class: 'np-aufgabe__lektion', text: w.t.nr }),
            el('span', { class: 'np-aufgabe__text' }, [el('strong', { text: w.a.titel }), el('span', { class: 'k-small k-muted', text: meta })]),
            ic('chevron-right')
          ])
        ]);
      }))
    ]);
  }

  /* Hinweis: höchstens einer, wegklickbar */
  function hinweisBlock(h) {
    if (!h) return null;
    var live = el('span', { class: 'np-sr', 'aria-live': 'polite' });
    var box = el('aside', { class: 'np-hinweis', 'aria-label': 'Hinweis' });
    var zu = el('button', { type: 'button', class: 'np-hinweis__zu', 'aria-label': 'Hinweis ausblenden' }, [ic('x')]);
    zu.addEventListener('click', function () {
      wegmerken(h.id);
      /* der Fokus würde mit der Box verschwinden: zur Überschrift der Seite, damit Tastaturnutzer nicht oben landen */
      var ziel = document.querySelector('main h1') || document.querySelector('h1');
      if (ziel) { if (!ziel.hasAttribute('tabindex')) ziel.setAttribute('tabindex', '-1'); ziel.focus({ preventScroll: true }); }
      hinweis = null;
      box.textContent = '';
      live.textContent = 'Hinweis ausgeblendet.';
      box.appendChild(live);
      setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 1500);
    });
    box.appendChild(el('p', {}, [el('span', { text: h.text + ' ' }), el('a', { href: A.url(h.ziel || 'konto.html') }, [h.link])]));
    box.appendChild(zu);
    return box;
  }
  function hinweisWaehlen() {
    var w = weggeklickt();
    if (kontoStatus === false && !w.konto) return { id: 'konto', text: 'Mit einem Konto bleibt dein Stand auf allen deinen Geräten gleich.', link: 'Konto öffnen' };
    if (!installiert() && !w.installieren) return { id: 'installieren', text: 'Du kannst den Kurs als App installieren und auch ohne Netz lernen.', link: 'So geht es', ziel: 'konto.html#offline' };
    return null;
  }

  /* ── Zusammenbau ─────────────────────────────────────────── */
  function zeichnen() {
    var S = window.KursStand;
    var st = S.alle(termine);
    var z = zuletzt();
    var irgendwas = z || st.some(function (s) { return s.begonnen; });
    if (!irgendwas) { wurzel.removeAttribute('data-laedt'); return; }   /* erster Besuch: statischer Einstieg bleibt */

    var akt = S.aktuell(termine, st);
    var teile = [];
    if (z) teile.push(weiterBlock(z, !!akt));
    if (akt) {
      teile.push(lektionBlock(termine[akt.index], st[akt.index], akt.wartet, !z));
    } else {
      teile.push(fertigBlock());
    }
    teile.push(warmupBlock(warmupWahl(akt ? akt.index : termine.length, st)));
    teile.push(hinweisBlock(hinweis));
    wurzel.textContent = '';
    teile.forEach(function (t) { if (t) wurzel.appendChild(t); });
    wurzel.removeAttribute('data-laedt');
  }

  function start() {
    var sicherheit = setTimeout(function () { wurzel.removeAttribute('data-laedt'); }, 2500);
    A.kurs().then(function (d) {
      termine = d.termine || [];
      clearTimeout(sicherheit);
      hinweis = null;
      zeichnen();
      /* Konto-Status danach nachladen; nur der Hinweis hängt daran */
      var weiter = A.konto && A.konto.status ? A.konto.status() : Promise.resolve(null);
      return weiter.then(function (k) { kontoStatus = k ? !!k.angemeldet : undefined; }, function () { kontoStatus = undefined; });
    }).then(function () {
      if (!termine) return;
      hinweis = hinweisWaehlen();
      zeichnen();
    }).catch(function () {
      clearTimeout(sicherheit);
      wurzel.removeAttribute('data-laedt');
    });

    /* Änderungen von außen (anderes Gerät, anderer Tab) übernehmen */
    var zeit = null;
    function neu() { clearTimeout(zeit); zeit = setTimeout(function () { if (termine) zeichnen(); }, 400); }
    try { if (KS && KS.abonnieren) KS.abonnieren('inf-mb/', neu); } catch (e) { /* egal */ }
    A.an('konto', function (k) { kontoStatus = !!(k && k.angemeldet); hinweis = hinweisWaehlen(); neu(); });
  }

  /* Die deferred Skripte (stand.js) sind erst bei DOMContentLoaded alle da */
  if (document.readyState === 'complete') start();
  else document.addEventListener('DOMContentLoaded', start);
})();
