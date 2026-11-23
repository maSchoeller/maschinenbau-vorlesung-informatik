/* =============================================================
   app/suche.js – Suchdialog (Rolle Navigation)
   Öffnen: Knopf in der Kopfzeile oder Strg+K / Cmd+K (die Hülle sendet KursApp-Ereignis 'suche').
   Daten: app/daten/suche.json, erst beim ersten Öffnen geladen (liegt im Precache, geht also offline).
   Bedienung: Pfeil auf/ab, Enter, Esc. Fokus kehrt zum Auslöser zurück. Leere Suche: die 22 Lektionen.
   ============================================================= */
(function () {
  'use strict';
  var A = window.KursApp;
  if (!A) return;

  var GRUPPEN = [
    { id: 'lektion', name: 'Lektionen', typen: ['lektion'], max: 8 },
    { id: 'aufgabe', name: 'Abschnitte und Aufgaben', typen: ['abschnitt', 'aufgabe'], max: 8 },
    { id: 'bibliothek', name: 'Bibliothek', typen: ['bibliothek'], max: 6 },
    { id: 'glossar', name: 'Glossar', typen: ['glossar'], max: 6 }
  ];

  var dlg = null, feld = null, liste = null, status = null, hinweis = null;
  var daten = null, laedt = null, ladefehler = false;
  var opener = null, aktiv = -1, optionen = [], zeit = null;

  function el(tag, attr, kinder) {
    var e = document.createElement(tag);
    Object.keys(attr || {}).forEach(function (k) {
      if (k === 'text') e.textContent = attr[k];
      else if (attr[k] != null) e.setAttribute(k, attr[k]);
    });
    (kinder || []).forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }

  /* Umlaute, Akzente, ß und Groß-/Kleinschreibung einebnen */
  function norm(s) {
    return String(s == null ? '' : s).toLowerCase().replace(/ß/g, 'ss').normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  /* Die Python-Themen einer Lektion (kurs.json) zählen zum Text des Lektionseintrags: „numpy“ findet V13 */
  function lektionenAnreichern(d, k) {
    var py = {};
    ((k && k.termine) || []).forEach(function (t) { if (t.python && t.python.length) py[t.nr] = t.python.join(' '); });
    (d.eintraege || []).forEach(function (e) {
      if (e.typ === 'lektion' && py[e.lektion]) e.text = (e.text ? e.text + ' ' : '') + py[e.lektion];
    });
  }

  function aufbereiten(d) {
    return (d.eintraege || []).map(function (e) {
      return { e: e, t: norm(e.titel), x: norm(e.text), l: norm(e.lektion || '') };
    });
  }

  /* Punkte je Suchwort: Titel vor Text, Wortanfang vor Teilwort */
  function punkte(w, z) {
    var p = 0, i;
    if (z.t === w) p = 100;
    else if (z.t.indexOf(w) === 0) p = 70;
    else {
      i = z.t.indexOf(w);
      if (i > 0 && /[^a-z0-9]/.test(z.t.charAt(i - 1))) p = 50;
      else if (i > 0) p = 22;
    }
    if (!p && z.l && z.l === w) p = 40;              /* „v07“ findet die Lektion */
    if (!p) {
      i = z.x.indexOf(w);
      if (i === 0 || (i > 0 && /[^a-z0-9]/.test(z.x.charAt(i - 1)))) p = 10;
      else if (i > 0) p = 4;
    }
    return p;
  }

  function suchen(q) {
    var worte = norm(q).trim().split(/\s+/).filter(Boolean);
    var leer = !worte.length;
    var proGruppe = {};
    GRUPPEN.forEach(function (g) { proGruppe[g.id] = []; });
    daten.forEach(function (z, i) {
      var gruppe = null;
      GRUPPEN.forEach(function (g) { if (g.typen.indexOf(z.e.typ) >= 0) gruppe = g; });
      if (!gruppe) return;
      if (leer && gruppe.id !== 'lektion') return;   /* leere Suche: nur die 22 Lektionen */
      var summe = 0;
      for (var k = 0; k < worte.length; k++) {
        var p = punkte(worte[k], z);
        var alt = worte[k].replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u');   /* „zaehler“ findet „Zähler“ */
        if (alt !== worte[k]) p = Math.max(p, punkte(alt, z));
        if (!p) return;           /* jedes Suchwort muss irgendwo vorkommen */
        summe += p;
      }
      if (!worte.length) summe = 1000 - i;   /* leere Suche: Kursreihenfolge */
      proGruppe[gruppe.id].push({ z: z, s: summe - Math.min(z.t.length, 60) / 100 });
    });
    return GRUPPEN.map(function (g) {
      var l = proGruppe[g.id];
      if (worte.length) l.sort(function (a, b) { return b.s - a.s; });
      return { g: g, treffer: l.slice(0, worte.length ? g.max : 22), gesamt: l.length };
    }).filter(function (r) { return r.treffer.length; });
  }

  function leeren() { liste.textContent = ''; optionen = []; aktiv = -1; feld.removeAttribute('aria-activedescendant'); }

  function zeichnen() {
    leeren();
    if (ladefehler) {
      liste.appendChild(el('p', { class: 'suche-leer', text: 'Die Suche konnte nicht geladen werden. Beim ersten Mal braucht sie eine Verbindung.' }));
      status.textContent = '';
      return;
    }
    if (!daten) { liste.appendChild(el('p', { class: 'suche-leer', text: 'Suche wird geladen …' })); return; }
    var q = feld.value;
    var ergebnis = suchen(q);
    var n = 0;
    ergebnis.forEach(function (r, gi) {
      var kopfId = 'suche-g-' + r.g.id;
      var gruppe = el('div', { role: 'group', 'aria-labelledby': kopfId, class: 'suche-gruppe' }, [
        el('div', { id: kopfId, class: 'suche-gruppe__name', text: r.g.name })
      ]);
      r.treffer.forEach(function (t) {
        var id = 'suche-o-' + n++;
        var e = t.z.e;
        var a = el('a', { id: id, role: 'option', class: 'suche-treffer', href: A.url(e.url), tabindex: '-1', 'aria-selected': 'false' }, [
          el('span', { class: 'suche-treffer__titel', text: e.titel }),
          e.text ? el('span', { class: 'suche-treffer__text', text: e.text }) : null
        ]);
        a.addEventListener('mousemove', function () { setzeAktiv(optionen.indexOf(a), false); });
        optionen.push(a);
        gruppe.appendChild(a);
      });
      liste.appendChild(gruppe);
    });
    if (!n) {
      liste.appendChild(el('p', { class: 'suche-leer', text: 'Nichts gefunden zu „' + q.trim() + '“. Versuche ein kürzeres oder anderes Wort.' }));
    } else if (optionen.length && q.trim()) {
      setzeAktiv(0, false);
    }
    var text = !q.trim() ? 'Alle ' + n + ' Lektionen' : (n ? n + ' Treffer' : 'Keine Treffer');
    clearTimeout(zeit);
    zeit = setTimeout(function () { status.textContent = text; }, 250);
  }

  function setzeAktiv(i, scrollen) {
    if (aktiv >= 0 && optionen[aktiv]) { optionen[aktiv].setAttribute('aria-selected', 'false'); optionen[aktiv].classList.remove('is-aktiv'); }
    aktiv = i;
    if (i >= 0 && optionen[i]) {
      optionen[i].setAttribute('aria-selected', 'true');
      optionen[i].classList.add('is-aktiv');
      feld.setAttribute('aria-activedescendant', optionen[i].id);
      if (scrollen !== false) optionen[i].scrollIntoView({ block: 'nearest' });
    } else feld.removeAttribute('aria-activedescendant');
  }

  function bauen() {
    if (dlg) return;
    status = el('p', { class: 'suche-status np-sr', role: 'status', 'aria-live': 'polite' });
    feld = el('input', {
      type: 'search', class: 'suche-feld', id: 'suche-feld', role: 'combobox', 'aria-expanded': 'true', 'aria-controls': 'suche-liste',
      'aria-autocomplete': 'list', 'aria-label': 'Suchbegriff', autocomplete: 'off', spellcheck: 'false', placeholder: 'Lektion, Aufgabe, Begriff …'
    });
    liste = el('div', { id: 'suche-liste', class: 'suche-liste', role: 'listbox', 'aria-label': 'Treffer' });
    var zu = el('button', { type: 'button', class: 'suche-zu', 'aria-label': 'Suche schließen' }, [A.icon('x')]);
    hinweis = el('p', { class: 'suche-fuss k-small', text: 'Pfeil auf und ab wählt, Enter öffnet, Esc schließt.' });
    dlg = el('dialog', { class: 'suche', 'aria-label': 'Suche im Kurs' }, [
      el('div', { class: 'suche-kopf' }, [A.icon('search'), feld, zu]),
      liste, hinweis, status
    ]);
    document.body.appendChild(dlg);

    zu.addEventListener('click', schliessen);
    feld.addEventListener('input', zeichnen);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) schliessen(); });   /* Klick auf den Hintergrund */
    dlg.addEventListener('close', function () {
      var ziel = opener && opener.focus && document.contains(opener) ? opener : document.querySelector('[data-app-aktion="suche"]');
      if (ziel && ziel.focus) ziel.focus();
      opener = null;
    });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); if (optionen.length) setzeAktiv((aktiv + 1) % optionen.length); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (optionen.length) setzeAktiv(aktiv <= 0 ? optionen.length - 1 : aktiv - 1); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); schliessen(); }
      else if (e.key === 'Enter' && aktiv >= 0 && optionen[aktiv] && (e.target === feld)) { e.preventDefault(); optionen[aktiv].click(); }
    });
    liste.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a.suche-treffer');
      if (a) setTimeout(schliessen, 0);   /* gleiche Seite mit Anker: Dialog zu */
    });
  }

  function laden() {
    if (daten || laedt) return laedt;
    var kurs = A.kurs ? A.kurs().then(function (k) { return k; }, function () { return null; }) : Promise.resolve(null);
    laedt = fetch(A.url('app/daten/suche.json'), { credentials: 'same-origin' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (d) {
      return kurs.then(function (k) { lektionenAnreichern(d, k); return d; });
    }).then(function (d) {
      daten = aufbereiten(d); ladefehler = false;
    }).catch(function () {
      ladefehler = true; laedt = null;
    }).then(function () { if (dlg && dlg.open) zeichnen(); });
    return laedt;
  }

  function oeffnen() {
    bauen();
    if (dlg.open) { feld.focus(); feld.select(); return; }
    opener = document.activeElement && document.activeElement !== document.body ? document.activeElement : document.querySelector('[data-app-aktion="suche"]');
    feld.value = '';
    dlg.showModal();
    feld.focus();
    zeichnen();
    laden();
  }
  function schliessen() { if (dlg && dlg.open) dlg.close(); }

  A.an('suche', oeffnen);
})();
