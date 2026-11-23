/* =============================================================
   app/konto.js – Seite „Konto“ (Rolle Konto und Abgleich). Vertrag Abschnitt 7.
   Nutzt KursApp (konto, api, an, melde), KursSpeicher (exportieren/importieren) und KursAbgleich (speicher-azure.js).
   Alle Texte per textContent.
   ============================================================= */
(function () {
  'use strict';
  var KA = window.KursApp, KS = window.KursSpeicher, AB = window.KursAbgleich;
  if (!KA || !KS || !AB) return;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  var stand = null;   /* letzter bekannter KursApp.konto.status() */

  function setze(sel, text) { var n = $(sel); if (n) n.textContent = text || ''; }
  function block(name, an) { var n = $('[data-konto-block="' + name + '"]'); if (n) n.hidden = !an; }

  /* ── Anzeige nach Anmeldestatus ──────────────────────────── */
  function zeige(s) {
    stand = s;
    var drin = !!(s && s.angemeldet);
    var laedt = $('[data-konto-laedt]'); if (laedt) laedt.hidden = true;
    block('gast', !drin); block('konto', drin); block('daten', drin);
    var doz = $('[data-konto-dozent]'); if (doz) doz.hidden = !(drin && s.dozent);
    if (drin) {
      var f = $('#k-name');
      if (f && document.activeElement !== f) f.value = s.anzeigename || '';
      setze('[data-konto-kennung]', s.anzeigename ? 'Angemeldet über GitHub als „' + s.anzeigename + '“.' : 'Angemeldet über GitHub. Du hast noch keinen Anzeigenamen gewählt.');
    } else {
      var a = AB.status(), n = $('[data-konto-offen-gast]');
      if (n) {
        var txt = a.besitzer && a.offen ? 'Auf diesem Gerät warten ' + a.offen + (a.offen === 1 ? ' Änderung' : ' Änderungen') + ' auf den Abgleich. Melde dich mit demselben Konto an, um sie zu übertragen.' : '';
        n.textContent = txt; n.hidden = !txt;
      }
    }
    abgleichZeigen();
  }

  /* ── Abgleich-Status ─────────────────────────────────────── */
  function zeit(iso) {
    if (!iso) return '';
    var d = new Date(iso), jetzt = new Date(), min = Math.round((jetzt - d) / 60000);
    var uhr = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    if (min < 1) return 'gerade eben';
    if (min < 60) return 'vor ' + min + (min === 1 ? ' Minute' : ' Minuten') + ' (' + uhr + ' Uhr)';
    if (d.toDateString() === jetzt.toDateString()) return 'heute um ' + uhr + ' Uhr';
    return 'am ' + d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) + '. um ' + uhr + ' Uhr';
  }
  function abgleichZeigen() {
    var t = $('[data-konto-abgleich]'); if (!t || !stand || !stand.angemeldet) return;
    var a = AB.status(), text, detail = '';
    if (!a.aktiv) {
      text = 'Der Abgleich ist auf dieser Seite noch nicht aktiv.';
      detail = 'Beantworte ggf. die Frage zum bisherigen Arbeitsstand oder lade die Seite neu.';
    } else if (a.grund === 'sitzung') {
      text = 'Deine Sitzung ist abgelaufen. Der Abgleich ist pausiert.';
      detail = 'Deine Änderungen bleiben auf diesem Gerät. Melde dich erneut an, um sie zu übertragen.';
    } else if (a.grund === 'bremse') {
      text = 'Der Abgleich ist für heute pausiert (Tageslimit erreicht).';
      detail = 'Deine Änderungen bleiben auf diesem Gerät und werden später übertragen.';
    } else if (a.grund === 'offline') {
      text = a.offen ? a.offen + (a.offen === 1 ? ' Änderung wartet' : ' Änderungen warten') + ' auf den Abgleich (kein Netz).' : 'Kein Netz. Es wartet nichts auf den Abgleich.';
      detail = a.letzter ? 'Zuletzt abgeglichen: ' + zeit(a.letzter) + '.' : '';
    } else if (a.grund === 'server') {
      text = 'Der Abgleich klappt gerade nicht. Er versucht es automatisch erneut.';
      detail = a.offen ? a.offen + (a.offen === 1 ? ' Änderung wartet' : ' Änderungen warten') + '.' : '';
    } else if (a.zustand === 'laeuft') {
      text = 'Abgleich läuft …';
    } else if (a.offen) {
      text = a.offen + (a.offen === 1 ? ' Änderung wird' : ' Änderungen werden') + ' gleich übertragen.';
    } else {
      text = a.letzter ? 'Alles abgeglichen, zuletzt ' + zeit(a.letzter) + '.' : 'Alles abgeglichen.';
      detail = 'Der Abgleich läuft von selbst: beim Öffnen, kurz nach Änderungen, beim Wechsel in diesen Tab und jede Minute, solange die Seite sichtbar ist.';
    }
    t.textContent = text; setze('[data-konto-abgleich-detail]', detail);
  }

  /* ── Anzeigename ─────────────────────────────────────────── */
  function nameFehler(e) {
    var c = e && e.daten && e.daten.fehler;
    if (e && e.offline) return 'Gerade keine Verbindung. Versuche es später noch einmal.';
    if (c === 'anzeigename-reserviert') return 'Dieser Name ist nicht möglich: Er enthält ein Wort, das Rollen vorbehalten ist (zum Beispiel Dozent, Tutor oder Admin). Nimm einen anderen.';
    if (c === 'anzeigename-ungueltig') return 'Dieser Name passt nicht. Erlaubt sind 2 bis 30 Zeichen: Buchstaben, Ziffern, Leerzeichen sowie - _ und .';
    if (e && e.status === 401) return 'Deine Sitzung ist abgelaufen. Melde dich bitte neu an.';
    if (e && e.status === 429) return 'Heute sind zu viele Anfragen eingegangen. Versuche es morgen noch einmal.';
    return 'Das hat nicht geklappt. Versuche es gleich noch einmal.';
  }
  var nameForm = $('[data-konto-name-form]');
  if (nameForm) nameForm.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var feld = $('#k-name'), wert = feld.value.trim().replace(/\s+/g, ' ');
    var st = $('[data-konto-name-status]'); st.className = 'konto-status';
    if (wert.length < 2 || wert.length > 30 || !/^[\p{L}\p{N} _.\-]+$/u.test(wert)) {
      st.textContent = 'Der Name braucht 2 bis 30 Zeichen: Buchstaben, Ziffern, Leerzeichen sowie - _ und .'; st.className = 'konto-status konto-status--fehler'; feld.focus(); return;
    }
    st.textContent = 'Wird gespeichert …';
    KA.api('ich', { method: 'PUT', body: { anzeigename: wert } }).then(function (d) {
      return KA.konto.status(true).then(function (s) {
        st.textContent = 'Gespeichert: „' + ((d && d.anzeigename) || wert) + '“.'; feld.value = (d && d.anzeigename) || wert; zeige(s);
      });
    }, function (e) { st.textContent = nameFehler(e); st.className = 'konto-status konto-status--fehler'; feld.focus(); });
  });

  /* ── Arbeitsstand sichern / laden ────────────────────────── */
  function dateiStatus(t, fehler) { var n = $('[data-konto-datei-status]'); n.textContent = t; n.className = 'konto-status' + (fehler ? ' konto-status--fehler' : ''); }
  function sichern() {
    var obj = KS.exportieren(), n = Object.keys(obj.eintraege).length, name = AB.dateiname('informatik-arbeitsstand');
    AB.herunterladen(obj, name);
    dateiStatus(n + (n === 1 ? ' Eintrag' : ' Einträge') + ' gesichert in ' + name + '.');
  }
  var dateiEl = $('[data-konto-datei]');
  function laden() { dateiEl.value = ''; dateiEl.click(); }
  if (dateiEl) dateiEl.addEventListener('change', function () {
    var f = dateiEl.files && dateiEl.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      var obj;
      try { obj = JSON.parse(String(r.result)); } catch (e) { dateiStatus('Die Datei konnte nicht gelesen werden (kein gültiges JSON).', true); return; }
      KS.importieren(obj).then(function (z) {
        dateiStatus((z.neu + z.aktualisiert) + ((z.neu + z.aktualisiert) === 1 ? ' Eintrag' : ' Einträge') + ' übernommen (' + z.neu + ' neu, ' + z.aktualisiert + ' aktualisiert' + (z.unveraendert ? ', ' + z.unveraendert + ' schon auf dem neuesten Stand' : '') + ').' +
          (stand && stand.angemeldet ? ' Sie werden jetzt mit deinem Konto abgeglichen.' : ''));
      }, function (e) { dateiStatus(e.message || 'Das Laden ist fehlgeschlagen.', true); });
    };
    r.onerror = function () { dateiStatus('Die Datei konnte nicht gelesen werden.', true); };
    r.readAsText(f);
  });

  /* ── Daten herunterladen ─────────────────────────────────── */
  function datenStatus(t, fehler) { var n = $('[data-konto-daten-status]'); n.textContent = t; n.className = 'konto-status' + (fehler ? ' konto-status--fehler' : ''); }
  function exportieren() {
    datenStatus('Wird geladen …');
    KA.api('konto/export').then(function (d) {
      var name = AB.dateiname('informatik-konto-daten');
      AB.herunterladen(d, name);
      datenStatus('Gespeichert in ' + name + '.');
    }, function (e) { datenStatus(e && e.offline ? 'Gerade keine Verbindung.' : 'Die Daten konnten nicht geladen werden.', true); });
  }

  /* ── Abmelden ────────────────────────────────────────────── */
  function abmelden() {
    datenStatus('');
    AB.jetzt().then(function () {
      var a = AB.status();
      var absaetze = ['Soll dein Lernstand auf diesem Gerät bleiben?'];
      if (a.offen) absaetze.push(a.offen + (a.offen === 1 ? ' Änderung ist' : ' Änderungen sind') + ' noch nicht abgeglichen. Beim Entfernen gehen sie verloren; bleibt der Stand hier, werden sie bei der nächsten Anmeldung mit demselben Konto übertragen.');
      else absaetze.push('Alles ist abgeglichen: In deinem Konto geht nichts verloren. Auf einem fremden oder gemeinsam genutzten Gerät entfernst du den Stand besser.');
      return AB.frage({
        titel: 'Abmelden', absaetze: absaetze, fokus: 0,
        knoepfe: [{ text: 'Stand hier behalten', wert: 'behalten', art: 'primaer' }, { text: 'Stand von diesem Gerät entfernen', wert: 'entfernen', art: 'leise' }, { text: 'Abbrechen', wert: null, art: 'leise' }]
      });
    }).then(function (w) {
      if (!w) return;
      return AB.beenden({ behalten: w === 'behalten', ohneAbgleich: true }).then(function () { KA.konto.abmelden(); });
    });
  }

  /* ── Konto löschen (zweistufig) ──────────────────────────── */
  function loeschen() {
    AB.frage({
      titel: 'Konto und Daten löschen?',
      absaetze: ['Gelöscht werden auf dem Server: dein Lernstand, deine Programme, deine geteilten Links (sie funktionieren danach nicht mehr) und dein Anzeigename. Das lässt sich nicht rückgängig machen.',
        'Der Stand in diesem Browser bleibt, wenn du das nicht ausdrücklich anders willst. Auf deinen anderen Geräten meldest du dich danach bitte ebenfalls ab und entfernst den Stand.'],
      fokus: 1,
      knoepfe: [{ text: 'Weiter', wert: 'weiter', art: 'primaer' }, { text: 'Abbrechen', wert: null, art: 'leise' }]
    }).then(function (w) {
      if (w !== 'weiter') return;
      var inhalt = document.createElement('div');
      var lab = document.createElement('label'); lab.setAttribute('for', 'k-bestaetigung'); lab.textContent = 'Zur Bestätigung tippe das Wort LÖSCHEN:';
      var feld = document.createElement('input'); feld.type = 'text'; feld.id = 'k-bestaetigung'; feld.autocomplete = 'off'; feld.setAttribute('spellcheck', 'false'); feld.className = 'konto-bestaetigung';
      var zeile = document.createElement('p'); zeile.className = 'konto-dialog__zeile';
      var cb = document.createElement('input'); cb.type = 'checkbox'; cb.id = 'k-lokal-weg';
      var cbl = document.createElement('label'); cbl.setAttribute('for', 'k-lokal-weg'); cbl.textContent = 'Auch den Arbeitsstand in diesem Browser entfernen';
      zeile.appendChild(cb); zeile.appendChild(cbl);
      inhalt.appendChild(lab); inhalt.appendChild(feld); inhalt.appendChild(zeile);
      return AB.frage({
        titel: 'Wirklich endgültig löschen?', absaetze: [], inhalt: inhalt,
        pruefen: function () { return feld.value.trim().toLocaleLowerCase('de-DE') === 'löschen'; },
        knoepfe: [{ text: 'Endgültig löschen', wert: 'ja', art: 'primaer', braucht: true }, { text: 'Abbrechen', wert: null, art: 'leise' }]
      }).then(function (w2) {
        if (w2 !== 'ja') return;
        datenStatus('Wird gelöscht …');
        return KA.api('konto', { method: 'DELETE' }).then(function () {
          return AB.beenden({ behalten: !cb.checked, kontoGeloescht: true, ohneAbgleich: true }).then(function () { KA.konto.abmelden(); });
        }, function (e) { datenStatus(e && e.offline ? 'Gerade keine Verbindung. Es wurde nichts gelöscht.' : 'Das Löschen hat nicht geklappt. Es wurde nichts gelöscht.', true); });
      });
    });
  }

  /* ── Knöpfe ──────────────────────────────────────────────── */
  var aktionen = {
    anmelden: function () { KA.konto.anmelden(); }, abmelden: abmelden, sichern: sichern, laden: laden,
    export: exportieren, loeschen: loeschen,
    jetzt: function () { setze('[data-konto-abgleich]', 'Abgleich läuft …'); AB.jetzt().then(function () { abgleichZeigen(); }); }
  };
  $$('[data-konto-aktion]').forEach(function (b) {
    b.addEventListener('click', function () { var f = aktionen[b.getAttribute('data-konto-aktion')]; if (f) f(); });
  });

  KA.an('konto', zeige);
  KA.an('abgleich', abgleichZeigen);
  setInterval(abgleichZeigen, 30000);
  KA.konto.status().then(zeige);
})();
