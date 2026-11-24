/* =============================================================
   app/pwa.js – Service Worker, Installation, Offline-Einstellungen (Architektur-Vertrag, Abschnitt 9). Rolle PWA.
   - registriert sw.js, meldet Netz-Status (Kopfzeile + KursApp.sende('netz')), zeigt „Neue Version verfügbar“
   - füllt [data-pwa-einstellungen] (Konto-Seite): Installieren, Python offline, Speicher, Offline-Daten löschen
   - auf Lektionsseiten im Abschnitt Videos: „Videos dieser Lektion offline speichern“
   Klassisches JavaScript, kein Framework. Texte nur über textContent.
   ============================================================= */
(function () {
  'use strict';
  var KA = window.KursApp;
  if (!KA || window.KursPwa) return;

  var WURZEL = KA.wurzel;
  var VIDEO_CACHE = 'kurs-videos-v1';
  var hatSW = 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1');
  var hatCaches = 'caches' in window;
  var installPrompt = null;
  var registrierung = null;

  /* ── kleine Helfer ───────────────────────────────────────── */
  function el(tag, attr, kinder) {
    var n = document.createElement(tag);
    Object.keys(attr || {}).forEach(function (k) {
      if (k === 'class') n.className = attr[k];
      else if (k === 'text') n.textContent = attr[k];
      else n.setAttribute(k, attr[k]);
    });
    (kinder || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function mb(b) {
    if (b >= 1073741824) return (b / 1073741824).toFixed(1).replace('.', ',') + ' GB';
    if (b >= 1048576) return (b / 1048576).toFixed(b >= 10485760 ? 0 : 1).replace('.', ',') + ' MB';
    return Math.max(1, Math.round(b / 1024)) + ' KB';
  }
  function bild(id) { try { return KA.icon(id); } catch (e) { return null; } }

  /* ── Meta-Angaben für iPad/iPhone zur Laufzeit (Layout bleibt unberührt) ─── */
  (function metas() {
    var m = { 'apple-mobile-web-app-capable': 'yes', 'mobile-web-app-capable': 'yes', 'apple-mobile-web-app-title': 'Informatik', 'apple-mobile-web-app-status-bar-style': 'default' };
    Object.keys(m).forEach(function (n) {
      if (document.querySelector('meta[name="' + n + '"]')) return;
      var t = document.createElement('meta'); t.name = n; t.content = m[n]; document.head.appendChild(t);
    });
  })();

  /* ── Netz-Status ─────────────────────────────────────────── */
  var netzAnzeige = null;
  function netzZeigen() {
    var slot = document.querySelector('[data-app-slot="status"]');
    var offline = navigator.onLine === false;
    if (!slot) return;
    if (offline && !netzAnzeige) {
      netzAnzeige = el('span', { class: 'pwa-netz', 'data-pwa-netz': '' }, [bild('cloud-off'), el('span', { text: 'Offline' })]);
      slot.insertBefore(netzAnzeige, slot.firstChild);
    } else if (!offline && netzAnzeige) {
      if (netzAnzeige.parentNode) netzAnzeige.parentNode.removeChild(netzAnzeige);
      netzAnzeige = null;
    }
  }
  KA.an('netz', netzZeigen);
  window.addEventListener('online', netzZeigen);
  window.addEventListener('offline', netzZeigen);
  if (navigator.onLine === false) { KA.sende('netz', { online: false }); netzZeigen(); }

  /* ── Service Worker: Registrierung und Update-Hinweis ───── */
  var neuLaden = false, hinweisGezeigt = false;
  function updateHinweis(reg) {
    if (hinweisGezeigt) return;
    hinweisGezeigt = true;
    KA.melde('Neue Version verfügbar – neu laden', { art: 'info', aktion: { text: 'Neu laden', fn: function () {
      neuLaden = true;
      if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' }); else location.reload();
    } } });
  }
  function beobachten(reg) {
    if (!reg) return;
    if (reg.waiting && navigator.serviceWorker.controller) updateHinweis(reg);
    reg.addEventListener('updatefound', function () {
      var w = reg.installing;
      if (!w) return;
      w.addEventListener('statechange', function () {
        if (w.state === 'installed' && navigator.serviceWorker.controller) updateHinweis(reg);
      });
    });
  }
  var swBereit = null;   /* Promise<registration> */
  if (hatSW) {
    var hatteSteuerung = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (neuLaden) location.reload();
      else if (hatteSteuerung) KA.melde('Neue Version aktiv – neu laden, damit alles zusammenpasst.', { art: 'info', aktion: { text: 'Neu laden', fn: function () { location.reload(); } } });
      hatteSteuerung = true;
    });
    swBereit = new Promise(function (ok) {
      function los() {
        navigator.serviceWorker.register(WURZEL + 'sw.js', { scope: WURZEL }).then(function (reg) {
          /* blockierter Service Worker (Richtlinie, Testbrowser): register liefert u. U. nichts */
          if (!reg) { ok(null); return; }
          registrierung = reg; beobachten(reg); ok(reg);
          var zuletzt = Date.now();
          document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'visible' && Date.now() - zuletzt > 30 * 60 * 1000) { zuletzt = Date.now(); reg.update().catch(function () {}); }
          });
        }, function (e) { if (window.console) console.warn('Service Worker nicht registriert:', e); ok(null); });
      }
      if (document.readyState === 'complete') setTimeout(los, 300); else window.addEventListener('load', function () { setTimeout(los, 300); });
    });
  }

  /* Status des Service Workers (Version, Größe des Precache, Lücken) per Nachricht */
  function swStatus() {
    return new Promise(function (ok) {
      var c = hatSW && navigator.serviceWorker.controller;
      if (!c) return ok(null);
      var kanal = new MessageChannel(), t = setTimeout(function () { ok(null); }, 2500);
      kanal.port1.onmessage = function (e) { clearTimeout(t); ok(e.data); };
      try { c.postMessage({ type: 'STATUS' }, [kanal.port2]); } catch (e) { clearTimeout(t); ok(null); }
    });
  }

  /* ── Installation ────────────────────────────────────────── */
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); installPrompt = e; KA.sende('pwa-install', { moeglich: true }); });
  window.addEventListener('appinstalled', function () { installPrompt = null; KA.sende('pwa-install', { moeglich: false, installiert: true }); });
  function istInstalliert() { return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true; }
  function istApple() { return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }

  /* ── Einstellungen auf der Konto-Seite ───────────────────── */
  var fortschrittsLauf = null;   /* AbortController des laufenden Python-Downloads */

  function laden(url, abbruch, fortschritt) {
    return fetch(url, { signal: abbruch.signal, credentials: 'same-origin' }).then(function (r) {
      if (!r.ok) throw new Error(url.split('/').pop() + ': HTTP ' + r.status);
      var typ = r.headers.get('content-type') || '';
      if (!r.body || !r.body.getReader) return r.blob().then(function (b) { fortschritt(b.size); return { blob: b, typ: typ }; });
      var reader = r.body.getReader(), teile = [];
      return (function lesen() {
        return reader.read().then(function (x) {
          if (x.done) return { blob: new Blob(teile, { type: typ }), typ: typ };
          teile.push(x.value); fortschritt(x.value.length);
          return lesen();
        });
      })();
    });
  }

  function einstellungen(wurzel) {
    var h = wurzel.previousElementSibling;
    var brauchtUeberschrift = !(h && /^H[1-6]$/.test(h.tagName) && /offline/i.test(h.textContent));
    var box = el('section', { class: 'pwa-box', 'aria-labelledby': 'pwa-h' });
    box.appendChild(el('h2', { id: 'pwa-h', class: brauchtUeberschrift ? 'pwa-titel' : 'pwa-titel pwa-titel--leise', text: 'Offline nutzen' }));
    var status = el('p', { class: 'pwa-status', role: 'status', 'aria-live': 'polite', text: 'Prüfe Offline-Stand…' });
    box.appendChild(status);

    /* a) Installieren */
    var inst = el('div', { class: 'pwa-zeile' });
    box.appendChild(inst);
    function installZeigen() {
      inst.textContent = '';
      if (istInstalliert()) { inst.appendChild(el('p', { class: 'pwa-text', text: 'Die App ist auf diesem Gerät installiert.' })); return; }
      if (installPrompt) {
        var b = el('button', { type: 'button', class: 'k-btn k-btn--small' }, [bild('check'), 'Als App installieren']);
        b.addEventListener('click', function () {
          var p = installPrompt; installPrompt = null; installZeigen();
          p.prompt(); (p.userChoice || Promise.resolve()).then(function () { installZeigen(); });
        });
        inst.appendChild(b);
        inst.appendChild(el('span', { class: 'pwa-text', text: 'Eigenes Fenster, Start vom Home-Bildschirm oder aus dem Startmenü.' }));
      } else if (istApple()) {
        inst.appendChild(el('p', { class: 'pwa-text', text: 'Auf dem iPad: Teilen, dann „Zum Home-Bildschirm“. Installiert bleibt der Offline-Speicher dauerhaft erhalten.' }));
      } else {
        inst.appendChild(el('p', { class: 'pwa-text', text: 'Zum Installieren nutzt du das Menü deines Browsers („App installieren“ oder „Zur Startseite hinzufügen“), sobald es angeboten wird.' }));
      }
    }
    installZeigen();
    KA.an('pwa-install', installZeigen);

    /* b) Python offline */
    var py = el('div', { class: 'pwa-block' });
    box.appendChild(py);
    var pakete = pythonBlock(py);

    /* c) Einzelheiten hinter „Mehr“ (Weniger ist mehr): Pakete, Speicher, Offline-Daten löschen */
    var mehr = el('details', { class: 'pwa-mehr' }, [el('summary', { text: 'Mehr' })]);
    box.appendChild(mehr);
    if (pakete) mehr.appendChild(pakete);
    var sp = el('div', { class: 'pwa-block' });
    mehr.appendChild(sp);
    speicherBlock(sp, status);

    wurzel.appendChild(box);

    /* Status des Service Workers */
    var nachfragen = 0, gescheitert = false;
    function statusZeigen() {
      if (gescheitert) return;
      if (!hatSW) { status.textContent = 'Ohne Netz geht die App in diesem Browser oder auf dieser Adresse nicht (nötig: https).'; return; }
      swStatus().then(function (s) {
        if (gescheitert) return;   /* Einrichtung gescheitert: die Meldung bleibt stehen */
        if (s && s.meta) {
          var luecken = (s.meta.fehlend || []).length;
          status.textContent = 'Die Seiten sind auf diesem Gerät gespeichert' + (luecken ? '; einige fehlen noch und kommen beim Besuchen dazu.' : ' und funktionieren auch ohne Netz.');
        } else {
          status.textContent = 'Die App richtet sich gerade für die Nutzung ohne Netz ein.';
          if (nachfragen++ < 40) setTimeout(statusZeigen, 1500);
        }
      });
    }
    statusZeigen();
    if (swBereit) swBereit.then(function (reg) {
      if (!reg) { if (hatSW) { gescheitert = true; status.textContent = 'Die App konnte sich in diesem Browser nicht für die Nutzung ohne Netz einrichten.'; } return; }
      navigator.serviceWorker.ready.then(function () { setTimeout(statusZeigen, 400); });
      navigator.serviceWorker.addEventListener('controllerchange', function () { setTimeout(statusZeigen, 400); });
    });
  }

  function pythonBlock(py) {
    py.appendChild(el('h3', { class: 'pwa-unter', text: 'Python offline' }));
    var text = el('p', { class: 'pwa-text', text: 'Lädt Python mit allem, was der Kurs braucht, auf dieses Gerät. Danach laufen auch Diagramme ohne Netz.' });
    py.appendChild(text);
    var liste = el('ul', { class: 'pwa-liste' });
    var zeile = el('div', { class: 'pwa-zeile' });
    var knopf = el('button', { type: 'button', class: 'k-btn k-btn--small' }, [bild('sync'), el('span', { text: 'Python offline bereit machen' })]);
    var stopp = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', hidden: '' }, ['Abbrechen']);
    var fort = el('progress', { class: 'pwa-fortschritt', max: '100', value: '0', hidden: '', 'aria-label': 'Fortschritt Python offline' });
    var meld = el('p', { class: 'pwa-text', role: 'status', 'aria-live': 'polite' });
    zeile.appendChild(knopf); zeile.appendChild(stopp);
    py.appendChild(zeile); py.appendChild(fort); py.appendChild(meld);

    var daten = null, cacheName = null, schonDa = {};
    function gruppenZeigen() {
      liste.textContent = '';
      daten.gruppen.forEach(function (g) {
        var da = g.dateien.filter(function (d) { return schonDa[d.datei]; }).length;
        var voll = da === g.dateien.length;
        var li = el('li', { class: 'pwa-gruppe' + (voll ? ' ist-da' : '') }, [
          el('span', { class: 'pwa-gruppe__name', text: g.titel }),
          el('span', { class: 'pwa-gruppe__hilfe', text: g.hilfe }),
          el('span', { class: 'pwa-gruppe__gr', text: mb(g.bytes) }),
          el('span', { class: 'pwa-gruppe__stand', text: voll ? 'bereit' : (da ? da + ' von ' + g.dateien.length : 'nicht geladen') })
        ]);
        liste.appendChild(li);
      });
      var fehlt = daten.gruppen.reduce(function (s, g) { return s + g.dateien.filter(function (d) { return !schonDa[d.datei]; }).reduce(function (a, d) { return a + d.bytes; }, 0); }, 0);
      knopf.disabled = false;
      knopf.querySelector('span').textContent = fehlt ? 'Python offline bereit machen (' + mb(fehlt) + ')' : 'Python ist offline bereit';
      knopf.disabled = !fehlt;
    }
    function cacheLesen() {
      return caches.open(cacheName).then(function (c) { return c.keys(); }).then(function (ks) {
        schonDa = {};
        ks.forEach(function (r) { schonDa[new URL(r.url).pathname.split('/').pop()] = true; });
      });
    }
    if (!hatCaches) { py.hidden = true; return null; }
    fetch(WURZEL + 'pyodide/gruppen.json', { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error('keine Pyodide-Dateien'); return r.json(); }).then(function (d) {
      daten = d; cacheName = 'kurs-pyodide-' + d.version;
      return cacheLesen();
    }).then(gruppenZeigen).catch(function () {
      liste.textContent = '';
      text.textContent = navigator.onLine === false ? 'Python-Pakete lassen sich nur mit Netz vorab laden.' : 'In dieser Ausgabe lädt Python seine Dateien beim Ausführen aus dem Internet. Ein Offline-Paket gibt es hier nicht.';
      zeile.hidden = true;
    });

    knopf.addEventListener('click', function () {
      if (!daten || fortschrittsLauf) return;
      var ctl = new AbortController(); fortschrittsLauf = ctl;
      var offen = [], gesamt = 0;
      daten.gruppen.forEach(function (g) { g.dateien.forEach(function (d) { if (!schonDa[d.datei]) { offen.push(d); gesamt += d.bytes; } }); });
      var geladen = 0, nr = 0;
      knopf.disabled = true; stopp.hidden = false; fort.hidden = false; fort.value = 0; meld.textContent = 'Lade 0 von ' + offen.length + ' Dateien…';
      caches.open(cacheName).then(function (cache) {
        return offen.reduce(function (kette, d) {
          return kette.then(function () {
            var url = WURZEL + 'pyodide/' + d.datei;
            return laden(url, ctl, function (n) { geladen += n; fort.value = Math.min(100, Math.round(geladen / gesamt * 100)); })
              .then(function (x) { return cache.put(url, new Response(x.blob, { status: 200, headers: { 'content-type': x.typ || 'application/octet-stream' } })); })
              .then(function () { nr++; schonDa[d.datei] = true; meld.textContent = 'Lade ' + nr + ' von ' + offen.length + ' Dateien (' + mb(geladen) + ' von ' + mb(gesamt) + ')…'; });
          });
        }, Promise.resolve());
      }).then(function () {
        meld.textContent = 'Fertig: Python läuft jetzt auch ohne Netz, mit numpy, pandas und Diagrammen.';
        KA.melde('Python ist offline bereit.', { art: 'ok' });
      }, function (e) {
        meld.textContent = (e && e.name === 'AbortError') ? 'Abgebrochen. Was schon geladen ist, bleibt gespeichert.' : 'Das Laden ist fehlgeschlagen (' + (e && e.message ? e.message : 'Netz') + '). Du kannst es erneut versuchen, bereits geladene Dateien bleiben gespeichert.';
      }).then(function () {
        fortschrittsLauf = null; stopp.hidden = true; fort.hidden = true; gruppenZeigen(); KA.sende('pwa-speicher', {});
      });
    });
    stopp.addEventListener('click', function () { if (fortschrittsLauf) fortschrittsLauf.abort(); });
    return liste;
  }

  function speicherBlock(sp, status) {
    sp.appendChild(el('h3', { class: 'pwa-unter', text: 'Speicher auf diesem Gerät' }));
    var beleg = el('p', { class: 'pwa-text', text: 'Belegter Speicher wird ermittelt…' });
    var dauer = el('p', { class: 'pwa-text' });
    var z1 = el('div', { class: 'pwa-zeile' });
    var persBtn = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost', hidden: '' }, ['Speicher dauerhaft sichern']);
    var delBtn = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost' }, ['Offline-Daten löschen']);
    var delMeld = el('p', { class: 'pwa-text', role: 'status', 'aria-live': 'polite' });
    z1.appendChild(persBtn); z1.appendChild(delBtn);
    [beleg, dauer, z1, delMeld].forEach(function (n) { sp.appendChild(n); });

    function messen() {
      if (!(navigator.storage && navigator.storage.estimate)) { beleg.textContent = 'Dein Browser meldet keine Speicherbelegung.'; return; }
      navigator.storage.estimate().then(function (e) {
        beleg.textContent = 'Belegt: ' + mb(e.usage || 0) + (e.quota ? ' von etwa ' + mb(e.quota) + ' verfügbar' : '') + '. Das schließt Seiten, Python-Pakete und gespeicherte Videos ein.';
      }, function () { beleg.textContent = 'Die Speicherbelegung ist nicht abrufbar.'; });
    }
    function dauerhaft() {
      if (!(navigator.storage && navigator.storage.persisted)) return;
      navigator.storage.persisted().then(function (p) {
        dauer.textContent = p ? 'Der Speicher ist dauerhaft gesichert: Der Browser räumt ihn nicht von sich aus auf.' : 'Der Speicher ist nicht dauerhaft gesichert: Der Browser darf ihn bei Platzmangel (oder auf dem iPad nach 7 Tagen ohne Nutzung im Browser) leeren.';
        persBtn.hidden = !!p || !navigator.storage.persist;
      });
    }
    persBtn.addEventListener('click', function () {
      navigator.storage.persist().then(function (ok) {
        dauerhaft();
        KA.melde(ok ? 'Speicher ist jetzt dauerhaft gesichert.' : 'Dein Browser hat die dauerhafte Sicherung nicht gewährt. Installiere die App oder nutze sie regelmäßig.', { art: ok ? 'ok' : 'info' });
      });
    });
    var bestaetigen = false;
    delBtn.addEventListener('click', function () {
      if (!bestaetigen) {
        bestaetigen = true; delBtn.textContent = 'Wirklich löschen?';
        delMeld.textContent = 'Gelöscht werden gespeicherte Seiten, Python-Pakete und Videos auf diesem Gerät. Dein Lernstand und deine Programme bleiben erhalten. Noch einmal klicken zum Bestätigen.';
        setTimeout(function () { bestaetigen = false; delBtn.textContent = 'Offline-Daten löschen'; }, 8000);
        return;
      }
      bestaetigen = false; delBtn.textContent = 'Offline-Daten löschen';
      var weg = hatCaches ? caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k.indexOf('kurs-') === 0; }).map(function (k) { return caches.delete(k); })); }) : Promise.resolve();
      var abmelden = hatSW ? navigator.serviceWorker.getRegistrations().then(function (rs) { return Promise.all(rs.map(function (r) { return r.unregister(); })); }) : Promise.resolve();
      Promise.all([weg, abmelden]).then(function () {
        delMeld.textContent = 'Die Offline-Daten sind gelöscht. Beim nächsten Seitenaufruf richtet sich die App neu ein (mit Netz).';
        status.textContent = 'Offline-Speicher: leer.';
        messen();
        KA.sende('pwa-geloescht', {});
      });
    });
    KA.an('pwa-speicher', messen);
    messen(); dauerhaft();
  }

  /* ── Videos einer Lektion offline speichern ──────────────── */
  function videoBlock() {
    if (!hatCaches) return;
    /* Anker: Abschnitt id="videos" (Videoliste) oder, auf den Terminseiten, das erste Erklärvideo (Baustein <Video>) */
    var abschnitt = document.getElementById('videos');
    var figuren = Array.prototype.slice.call(document.querySelectorAll('figure.k-video'));
    var anker = figuren.filter(function (f) { return f.offsetParent !== null; })[0] || figuren[0];
    if (!abschnitt && !anker) return;
    var urls = [];
    Array.prototype.forEach.call(document.querySelectorAll('video source[src], video[src]'), function (v) {
      try { var u = new URL(v.getAttribute('src'), location.href).href; if (urls.indexOf(u) < 0) urls.push(u); } catch (e) {}
    });
    if (!urls.length) return;

    var box = el('div', { class: 'pwa-video' });
    var titel = el('p', { class: 'pwa-video__titel', text: 'Videos dieser Lektion offline speichern' });
    var info = el('p', { class: 'pwa-text', 'aria-live': 'polite', role: 'status' });
    var zeile = el('div', { class: 'pwa-zeile' });
    var speichern = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--ghost' }, [bild('sync'), el('span', { text: 'Offline speichern' })]);
    var entfernen = el('button', { type: 'button', class: 'k-btn k-btn--small k-btn--link', hidden: '' }, ['Wieder entfernen']);
    var fort = el('progress', { class: 'pwa-fortschritt', max: '100', value: '0', hidden: '', 'aria-label': 'Fortschritt Videos speichern' });
    zeile.appendChild(speichern); zeile.appendChild(entfernen);
    [titel, info, zeile, fort].forEach(function (n) { box.appendChild(n); });
    if (abschnitt) {
      var einfuegen = abschnitt.querySelector('.k-video-list');
      if (einfuegen && einfuegen.parentNode) einfuegen.parentNode.insertBefore(box, einfuegen); else abschnitt.appendChild(box);
    } else anker.parentNode.insertBefore(box, anker.nextSibling);

    var groessen = null;
    function schluessel(u) { var x = new URL(u); x.search = ''; x.hash = ''; return x.href; }
    function stand() {
      return caches.open(VIDEO_CACHE).then(function (c) {
        return Promise.all(urls.map(function (u) { return c.match(schluessel(u)); })).then(function (rs) {
          var da = rs.filter(Boolean).length;
          return Promise.all(rs.map(function (r) { return r ? r.blob().then(function (b) { return b.size; }) : 0; })).then(function (gr) { return { da: da, bytes: gr.reduce(function (a, b) { return a + b; }, 0) }; });
        });
      });
    }
    function groessenLesen() {
      if (groessen || navigator.onLine === false) return Promise.resolve(groessen);
      return Promise.all(urls.map(function (u) {
        return fetch(u, { method: 'HEAD' }).then(function (r) { return r.ok ? parseInt(r.headers.get('content-length') || '0', 10) || 0 : -1; }, function () { return 0; });
      })).then(function (g) { groessen = g; return g; });
    }
    function anzeigen() {
      stand().then(function (s) {
        if (s.da === urls.length) {
          info.textContent = (urls.length === 1 ? 'Das Video ist' : 'Alle ' + urls.length + ' Videos sind') + ' offline gespeichert (' + mb(s.bytes) + ').';
          speichern.hidden = true; entfernen.hidden = false;
        } else {
          speichern.hidden = false; entfernen.hidden = s.da === 0;
          return groessenLesen().then(function (g) {
            var ok = (g || []).filter(function (x) { return x > 0; }), summe = ok.reduce(function (a, b) { return a + b; }, 0);
            var verfuegbar = g ? ok.length : urls.length;
            if (g && !verfuegbar) { info.textContent = 'Die Videos dieser Lektion sind noch nicht veröffentlicht.'; speichern.hidden = true; return; }
            info.textContent = verfuegbar + (verfuegbar === 1 ? ' Video' : ' Videos') + (summe ? ', zusammen etwa ' + mb(summe) : '') + (s.da ? ' (' + s.da + ' schon gespeichert)' : '') + '. Spulen funktioniert auch offline.';
          });
        }
      });
    }
    var laeuft = false;
    speichern.addEventListener('click', function () {
      if (laeuft) return; laeuft = true;
      speichern.disabled = true; fort.hidden = false; fort.value = 0;
      var abbruch = new AbortController(), gesamt = 0, geladen = 0, fertig = 0, fehlt = 0, nichtErlaubt = false;
      (groessen || []).forEach(function (g) { if (g > 0) gesamt += g; });
      caches.open(VIDEO_CACHE).then(function (cache) {
        return urls.reduce(function (kette, u) {
          return kette.then(function () {
            return cache.match(schluessel(u)).then(function (vorhanden) {
              if (vorhanden) { fertig++; return; }
              info.textContent = 'Speichere Video ' + (fertig + fehlt + 1) + ' von ' + urls.length + '…';
              return laden(u, abbruch, function (n) { geladen += n; if (gesamt) fort.value = Math.min(100, Math.round(geladen / gesamt * 100)); })
                .then(function (x) { return cache.put(schluessel(u), new Response(x.blob, { status: 200, headers: { 'content-type': x.typ || 'video/mp4' } })); })
                .then(function () { fertig++; }, function (e) {
                  fehlt++; if (e && /HTTP 404/.test(e.message)) return;
                  if (e instanceof TypeError) nichtErlaubt = true;
                });
            });
          });
        }, Promise.resolve());
      }).then(function () {
        var sw = hatSW && navigator.serviceWorker.controller;
        if (nichtErlaubt) KA.melde('Ein Video konnte nicht gespeichert werden (Netz oder Server).', { art: 'fehler' });
        else if (fertig) KA.melde(fertig === 1 ? 'Video offline gespeichert.' : fertig + ' Videos offline gespeichert.' + (sw ? '' : ' Lade die Seite einmal neu, damit sie offline abspielbar sind.'), { art: 'ok' });
      }, function () { KA.melde('Speichern fehlgeschlagen.', { art: 'fehler' }); }).then(function () {
        laeuft = false; speichern.disabled = false; fort.hidden = true; anzeigen();
      });
    });
    entfernen.addEventListener('click', function () {
      caches.open(VIDEO_CACHE).then(function (c) { return Promise.all(urls.map(function (u) { return c.delete(schluessel(u)); })); }).then(function () {
        KA.melde('Offline gespeicherte Videos entfernt.', { art: 'info' }); anzeigen();
      });
    });
    anzeigen();
  }

  /* ── Start ───────────────────────────────────────────────── */
  function start() {
    var w = document.querySelector('[data-pwa-einstellungen]');
    if (w && !w.hasAttribute('data-pwa-fertig')) { w.setAttribute('data-pwa-fertig', ''); einstellungen(w); }
    videoBlock();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

  window.KursPwa = { registrierung: function () { return registrierung; }, status: swStatus, bereit: function () { return swBereit || Promise.resolve(null); } };
})();
