/* app/tutor.js – Tutor-Panel der Lern-App (Vertrag Abschnitt 10, Oberfläche)
 *
 * Füllt das Panel der Hülle (KursApp.panel, id 'tutor'), sobald es geöffnet wird.
 * Kontext der Seite wird nur gelesen, Bestandsskripte bleiben unverändert:
 *   Lektion  KursApp.seite.lektion
 *   Labor    sichtbare .l-task (bzw. location.hash), Code aus deren Editor (KursEditor/textarea),
 *            letzte Ausgabe aus .a-out / .a-results derselben Aufgabe
 *   Lerneinheit: nur die Lektion
 * Was mitgeschickt wird, steht sichtbar unter dem Eingabefeld (Code abschaltbar).
 * Antworten werden selbst gerendert (nur textContent, kein innerHTML mit Modelltext).
 * Verlauf je Seite in sessionStorage; der Server speichert ihn nicht.
 */
(function () {
  'use strict';
  var A = window.KursApp;
  if (!A || !A.panel || window.KursTutor) return;

  var ID = 'tutor';
  var MAX_FRAGE = 1500, MAX_CODE = 6000, MAX_AUSGABE = 2000, MAX_VERLAUF = 8;
  var SCHLUESSEL = 'inf-mb-app:tutor:' + location.pathname;
  var SCHLUESSEL_CODE = 'inf-mb-app:tutor:code-mitschicken';
  var SCHLUESSEL_REST = 'inf-mb-app:tutor:rest';   /* seitenübergreifend: das Kontingent gilt je Tag, nicht je Seite */

  /* ── Speicher (sessionStorage, Ausfälle still hinnehmen) ─────────── */
  function lesen(k, std) { try { var v = JSON.parse(sessionStorage.getItem(k) || 'null'); return v === null ? std : v; } catch (e) { return std; } }
  function schreiben(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var zustand = lesen(SCHLUESSEL, null) || {};
  var verlauf = Array.isArray(zustand.verlauf) ? zustand.verlauf.filter(function (b) { return b && (b.rolle === 'nutzer' || b.rolle === 'tutor') && typeof b.text === 'string'; }) : [];
  var restGespeichert = lesen(SCHLUESSEL_REST, null);
  var gleicherTag = restGespeichert && restGespeichert.tag === heute();
  var rest = gleicherTag && typeof restGespeichert.heute === 'number' ? restGespeichert.heute : null;
  var erschoepft = Boolean(gleicherTag && restGespeichert.erschoepft);   /* 429 heute: Senden bleibt aus */
  var codeMitschicken = lesen(SCHLUESSEL_CODE, true) !== false;
  function sichern() {
    schreiben(SCHLUESSEL, { verlauf: verlauf.slice(-30) });
    schreiben(SCHLUESSEL_REST, rest === null && !erschoepft ? null : { heute: rest, erschoepft: erschoepft, tag: heute() });
  }
  function keineFragenMehr() { return erschoepft || rest === 0; }
  function heute() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }

  /* ── DOM-Helfer ───────────────────────────────────────────────── */
  function el(tag, attr, kinder) {
    var e = document.createElement(tag);
    if (attr) Object.keys(attr).forEach(function (k) {
      if (k === 'text') e.textContent = attr[k];
      else if (k === 'class') e.className = attr[k];
      else if (attr[k] === true) e.setAttribute(k, '');
      else if (attr[k] !== false && attr[k] != null) e.setAttribute(k, attr[k]);
    });
    (kinder || []).forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }

  /* ── Kontext der Seite ────────────────────────────────────────── */
  var letzteAufgabe = null;   /* .a-task, in der zuletzt getippt wurde */
  document.addEventListener('focusin', function (ev) {
    var t = ev.target && ev.target.closest && ev.target.closest('.a-task');
    if (t && t.querySelector('textarea.py-editor')) letzteAufgabe = t;
  });

  function sichtbareAufgabe() {
    var s = document.querySelector('.l-task:not([hidden])');
    if (s && s.id) return s;
    var h = (location.hash || '').slice(1);
    if (h && /^[a-z0-9-]{1,40}$/.test(h)) { var x = document.getElementById(h); if (x && x.classList.contains('l-task')) return x; }
    return null;
  }
  function codeVon(ta) {
    try { if (window.KursEditor && window.KursEditor.getValue) { var v = window.KursEditor.getValue(ta); if (typeof v === 'string') return v; } } catch (e) {}
    return ta.value || '';
  }
  function ausgabeVon(aTask) {
    var teile = [];
    var out = aTask.querySelector('.a-out');
    if (out && !out.hidden && out.textContent.trim()) teile.push(out.textContent.trim());
    var erg = aTask.querySelector('.a-results');
    if (erg && erg.textContent.trim()) teile.push(erg.textContent.trim());
    return teile.join('\n');
  }

  /** Code und Ausgabe einer .a-task in den Kontext übernehmen (nur mit Schalter an). */
  function codeUebernehmen(k, aTask) {
    var ta = aTask.querySelector('textarea.py-editor');
    if (!ta || !codeMitschicken) return;
    var code = codeVon(ta);
    if (code.trim()) k.code = code.slice(0, MAX_CODE);
    var aus = ausgabeVon(aTask);
    if (aus) k.ausgabe = aus.slice(-MAX_AUSGABE);
  }

  /** {kontext (für den Server), beschreibung (für die Anzeige), hatCode} */
  function kontextErmitteln() {
    var s = A.seite || {};
    var k = {};
    if (s.lektion) k.lektion = s.lektion;
    if (s.art === 'labor' || s.art === 'lerneinheit') k.seite = s.art;
    /* Lerneinheit: die Aufgabe, an der zuletzt gearbeitet wurde (data-id), sonst nur die Lektion */
    if (s.art === 'lerneinheit' && s.lektion && letzteAufgabe && document.contains(letzteAufgabe)) {
      var did = letzteAufgabe.getAttribute('data-id') || '';
      if (/^[a-z0-9][a-z0-9-]{0,39}$/.test(did)) {
        k.aufgabe = did;
        codeUebernehmen(k, letzteAufgabe);
        return {
          kontext: k, hatCode: true,
          beschreibung: codeMitschicken ? 'Deine zuletzt bearbeitete Aufgabe, dein Code und die letzte Ausgabe werden mitgeschickt.' : 'Deine zuletzt bearbeitete Aufgabe wird mitgeschickt, dein Code nicht.'
        };
      }
    }
    if (s.art !== 'labor' || !s.lektion) {
      return { kontext: k, hatCode: false, beschreibung: s.lektion ? 'Lektion ' + s.lektion + ' wird mitgeschickt.' : 'Nur deine Frage wird mitgeschickt.' };
    }
    var task = sichtbareAufgabe();
    if (!task) return { kontext: k, hatCode: false, beschreibung: 'Lektion ' + s.lektion + ' wird mitgeschickt.' };
    k.aufgabe = task.id;
    var titel = task.getAttribute('data-title') || '';
    var aTask = (letzteAufgabe && task.contains(letzteAufgabe)) ? letzteAufgabe : null;
    if (!aTask) { var ta0 = task.querySelector('.a-task textarea.py-editor'); aTask = ta0 ? ta0.closest('.a-task') : null; }
    var ta = aTask ? aTask.querySelector('textarea.py-editor') : null;
    var name = 'Aufgabe ' + task.id + (titel ? ' (' + titel + ')' : '');
    if (!ta) return { kontext: k, hatCode: false, beschreibung: name + ' wird mitgeschickt.' };
    codeUebernehmen(k, aTask);
    return {
      kontext: k, hatCode: true,
      beschreibung: codeMitschicken ? name + ', dein Code und die letzte Ausgabe werden mitgeschickt.' : name + ' wird mitgeschickt, dein Code nicht.'
    };
  }

  /* ── Formatierung der Antworten (sicher, nur Text-Knoten) ─────── */
  function inline(text, ziel) {
    var re = /`([^`\n]+)`|\*\*([^*\n]+)\*\*/g, pos = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > pos) ziel.appendChild(document.createTextNode(text.slice(pos, m.index)));
      if (m[1] !== undefined) ziel.appendChild(el('code', { class: 'k-i', text: m[1] }));
      else ziel.appendChild(el('strong', { text: m[2] }));
      pos = re.lastIndex;
    }
    if (pos < text.length) ziel.appendChild(document.createTextNode(text.slice(pos)));
  }
  function kopierKnopf(code) {
    var label = el('span', { text: 'Kopieren' });
    var b = el('button', { type: 'button', class: 'k-copy__btn', 'aria-label': 'Code kopieren' }, [label]);
    b.addEventListener('click', function () {
      var fertig = function (ok) {
        b.setAttribute('data-state', ok ? 'done' : 'fail');
        label.textContent = ok ? 'Kopiert' : 'Nicht möglich';
        statusSagen(ok ? 'Code in die Zwischenablage kopiert.' : 'Kopieren nicht möglich.');
        setTimeout(function () { label.textContent = 'Kopieren'; b.removeAttribute('data-state'); }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(function () { fertig(true); }, function () { fertig(false); });
      else fertig(false);
    });
    return b;
  }
  function absatz(text, ziel) {
    var zeilen = text.split('\n');
    var liste = zeilen.every(function (z) { return /^\s*([-*•]|\d{1,2}[.)])\s+/.test(z); });
    if (liste && zeilen.length > 1) {
      var ol = /^\s*\d/.test(zeilen[0]);
      var l = el(ol ? 'ol' : 'ul');
      zeilen.forEach(function (z) { var li = el('li'); inline(z.replace(/^\s*([-*•]|\d{1,2}[.)])\s+/, ''), li); l.appendChild(li); });
      ziel.appendChild(l);
      return;
    }
    var p = el('p');
    zeilen.forEach(function (z, i) { if (i) p.appendChild(el('br')); inline(z.replace(/^#{1,4}\s+/, ''), p); });
    ziel.appendChild(p);
  }
  function formatieren(text) {
    var frag = document.createDocumentFragment();
    /* split mit Gruppe: [text, sprache(auf), code, sprache(zu), text, …] → Rest 0 Text, 1 Sprache, 2 Code, 3 übergehen */
    var teile = String(text).split(/^[ \t]*```[ \t]*([\w+-]*)[^\n]*$/m);
    var sprache = '';
    teile.forEach(function (t, i) {
      if (i % 4 === 1) { sprache = (t || '').toLowerCase(); return; }
      if (i % 4 === 3) return;
      if (i % 4 === 2) {
        var code = t.replace(/^\n/, '').replace(/\n$/, '');
        /* Python-Beispiele macht kurs.js wie überall ausführbar (DESIGN Regel 12);
           Ausgaben, Tracebacks und andere Sprachen bleiben reiner Text (data-run="no"). */
        var python = (sprache === '' || sprache === 'python' || sprache === 'py') && !/^Traceback|^\s*File "/m.test(code);
        var pre = el('pre', { class: 'k-code', 'data-run': python ? null : 'no' }, [el('code', { text: code })]);
        frag.appendChild(el('div', { class: 'k-copy tutor-code' }, [
          el('div', { class: 'k-copy__bar' }, [el('span', { text: python ? 'Python' : (sprache || 'Text') }), kopierKnopf(code)]),
          pre
        ]));
      } else {
        t.split(/\n[ \t]*\n/).forEach(function (abs) { if (abs.trim()) absatz(abs.trim(), frag); });
      }
    });
    return frag;
  }

  /* ── Aufbau des Panels ────────────────────────────────────────── */
  var wurzel, liste, status, form, eingabe, senden, kontextZeile, kontextText, schalter, restZeile, sperre, leer;
  var laeuft = false, offeneFrage = null;

  function aufbauen() {
    wurzel = el('div', { class: 'tutor' });
    wurzel.appendChild(el('p', { class: 'tutor-hinweis', text: 'Der Tutor hilft dir beim Denken. Lösungen verrät er nicht.' }));
    leer = el('p', { class: 'tutor-leer', text: 'Frag zum Beispiel: „Was bedeutet diese Fehlermeldung?“, „Wie fange ich bei dieser Aufgabe an?“ oder „Was macht return?“' });
    wurzel.appendChild(leer);
    liste = el('ol', { class: 'tutor-verlauf', role: 'log', 'aria-label': 'Gespräch mit dem Tutor' });
    wurzel.appendChild(liste);
    /* Statuszeile steht in der klebenden Eingabe direkt über dem Feld, damit Meldung und
       „Nochmal versuchen“ auch bei langem Verlauf sichtbar sind. */
    status = el('div', { class: 'tutor-status', role: 'status', 'aria-live': 'polite' });
    /* Sperre (anmelden, nicht eingerichtet) steht unten an der Stelle der Eingabe, damit sie auch bei langem Verlauf sichtbar ist */
    sperre = el('div', { class: 'tutor-sperre', hidden: true });
    wurzel.appendChild(sperre);

    form = el('form', { class: 'tutor-form', novalidate: true });
    var lab = el('label', { class: 'tutor-label', for: 'tutor-frage', text: 'Deine Frage' });
    eingabe = el('textarea', { id: 'tutor-frage', class: 'tutor-eingabe', rows: '3', maxlength: String(MAX_FRAGE), autofocus: true, 'aria-describedby': 'tutor-tasten tutor-kontext' });
    var tasten = el('span', { id: 'tutor-tasten', class: 'tutor-klein', text: 'Enter sendet, Umschalt+Enter macht eine neue Zeile.' });
    senden = el('button', { type: 'submit', class: 'k-btn k-btn--small tutor-senden', text: 'Senden' });
    schalter = el('input', { type: 'checkbox', id: 'tutor-code-schalter', class: 'tutor-schalter' });
    schalter.checked = codeMitschicken;
    kontextText = el('span', { id: 'tutor-kontext' });
    kontextZeile = el('div', { class: 'tutor-kontext' }, [
      el('label', { class: 'tutor-schalter-label', for: 'tutor-code-schalter' }, [schalter, el('span', { text: 'Code mitschicken' })]),
      kontextText
    ]);
    restZeile = el('span', { class: 'tutor-rest', 'aria-live': 'polite' });
    var neu = el('button', { type: 'button', class: 'tutor-neu', text: 'Neues Gespräch' });
    form.appendChild(status);
    form.appendChild(lab);
    form.appendChild(eingabe);
    form.appendChild(el('div', { class: 'tutor-leiste' }, [tasten, senden]));
    form.appendChild(kontextZeile);
    form.appendChild(el('div', { class: 'tutor-fuss' }, [restZeile, neu]));
    form.appendChild(el('p', { class: 'tutor-klein tutor-datenschutz', text: 'Fragen gehen an einen KI-Dienst (Anthropic). Bitte keine persönlichen Daten eingeben.' }));
    wurzel.appendChild(form);

    form.addEventListener('submit', function (ev) { ev.preventDefault(); abschicken(); });
    eingabe.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' && !ev.shiftKey && !ev.isComposing && !ev.altKey && !ev.ctrlKey && !ev.metaKey) { ev.preventDefault(); abschicken(); }
    });
    eingabe.addEventListener('focus', kontextZeigen);
    schalter.addEventListener('change', function () { codeMitschicken = schalter.checked; schreiben(SCHLUESSEL_CODE, codeMitschicken); kontextZeigen(); });
    neu.addEventListener('click', function () {
      verlauf = []; offeneFrage = null; sichern(); zeichneVerlauf(); statusLeeren();
      statusSagen('Neues Gespräch begonnen.');
      eingabe.focus();
    });
    zeichneVerlauf();
    restZeigen();
  }

  function kontextZeigen() {
    if (!kontextText) return;
    var k = kontextErmitteln();
    kontextText.textContent = k.beschreibung;
    schalter.parentNode.hidden = !k.hatCode;
  }
  function restZeigen() {
    if (!restZeile) return;
    restZeile.textContent = rest === null ? '' : rest === 1 ? 'Heute noch 1 Frage' : 'Heute noch ' + rest + ' Fragen';
  }

  function beitragElement(b, offen) {
    var li = el('li', { class: 'tutor-beitrag tutor-beitrag--' + b.rolle + (offen ? ' tutor-beitrag--offen' : '') });
    li.appendChild(el('span', { class: 'tutor-sr',text: b.rolle === 'tutor' ? 'Tutor: ' : 'Du: ' }));
    var inhalt = el('div', { class: 'tutor-text' });
    if (b.rolle === 'tutor') inhalt.appendChild(formatieren(b.text));
    else b.text.split('\n').forEach(function (z, i) { if (i) inhalt.appendChild(el('br')); inhalt.appendChild(document.createTextNode(z)); });
    li.appendChild(inhalt);
    return li;
  }
  function zeichneVerlauf() {
    if (!liste) return;
    while (liste.firstChild) liste.removeChild(liste.firstChild);
    verlauf.forEach(function (b) { liste.appendChild(beitragElement(b)); });
    if (offeneFrage) liste.appendChild(beitragElement({ rolle: 'nutzer', text: offeneFrage }, true));
    leer.hidden = verlauf.length > 0 || !!offeneFrage;
    nachUnten();
  }
  function nachUnten() {
    var box = A.panel.element();
    if (box) requestAnimationFrame(function () { box.scrollTop = box.scrollHeight; });
  }

  /* ── Status und Zustände ──────────────────────────────────────── */
  function statusLeeren() { while (status.firstChild) status.removeChild(status.firstChild); status.className = 'tutor-status'; }
  function statusSagen(text, art, aktion) {
    statusLeeren();
    if (!text) return;
    status.className = 'tutor-status' + (art ? ' tutor-status--' + art : '');
    if (art === 'fehler') status.appendChild(A.icon('x'));
    status.appendChild(el('span', { text: text }));
    if (aktion) {
      var b = el('button', { type: 'button', class: 'k-btn k-btn--ghost k-btn--small', text: aktion.text });
      b.addEventListener('click', aktion.fn);
      status.appendChild(b);
    }
  }

  /** Ganzer Bereich gesperrt (nicht angemeldet, nicht eingerichtet): Formular aus, Erklärung an. */
  function sperren(art) {
    while (sperre.firstChild) sperre.removeChild(sperre.firstChild);
    if (!art) { sperre.hidden = true; form.hidden = false; return; }
    sperre.hidden = false;
    form.hidden = true;
    leer.hidden = true;
    if (art === 'anmelden') {
      sperre.appendChild(el('p', { text: 'Für den Tutor brauchst du ein Konto. Jede Frage geht an einen KI-Dienst, und die Zahl der Fragen je Tag ist begrenzt.' }));
      sperre.appendChild(el('p', { class: 'tutor-klein', text: 'Lernen, Python und dein Fortschritt funktionieren auch ohne Anmeldung.' }));
      var b = el('button', { type: 'button', class: 'k-btn tutor-anmelden' }, [A.icon('user'), el('span', { text: 'Mit GitHub anmelden' })]);
      b.addEventListener('click', function () { A.konto.anmelden(); });
      sperre.appendChild(b);
      var akt = document.activeElement;
      if (A.panel.id() === ID && (!akt || akt === document.body || (akt.closest && akt.closest('.app-panel')))) b.focus();
    } else if (art === 'nicht-eingerichtet') {
      sperre.appendChild(el('p', { text: 'Der Tutor ist noch nicht eingerichtet. Sobald er freigeschaltet ist, kannst du hier Fragen stellen.' }));
    }
  }

  function istOffline() { return navigator.onLine === false; }
  function netzPruefen() {
    if (!form || form.hidden) return;
    if (istOffline()) {
      senden.disabled = true;
      statusSagen('Du bist offline. Der Tutor braucht eine Verbindung.', 'hinweis');
    } else {
      senden.disabled = laeuft || keineFragenMehr();
      if (status.className.indexOf('tutor-status--hinweis') >= 0) statusLeeren();
      if (keineFragenMehr() && !laeuft && !status.firstChild) kontingentZeigen();
    }
  }
  function kontingentZeigen(meldung) {
    statusSagen(meldung || 'Für heute sind keine Fragen mehr übrig. Morgen geht es weiter.', 'kontingent');
  }

  function kontoPruefen() {
    return A.konto.status().then(function (s) {
      if (!s || !s.angemeldet) {
        sperren(istOffline() ? null : 'anmelden');
        if (istOffline()) netzPruefen();
      } else if (sperre && !sperre.hidden && sperre.querySelector('.tutor-anmelden')) {
        sperren(null);
        zeichneVerlauf();
      }
      return s;
    }, function () { return null; });
  }

  /* ── Senden ───────────────────────────────────────────────────── */
  function abschicken(wiederholen) {
    if (laeuft) return;
    var text = wiederholen ? offeneFrage : eingabe.value.trim();
    if (!text) { statusSagen('Schreib zuerst eine Frage.', 'hinweis'); eingabe.focus(); return; }
    if (text.length > MAX_FRAGE) { statusSagen('Deine Frage ist zu lang (höchstens ' + MAX_FRAGE + ' Zeichen).', 'fehler'); return; }
    if (istOffline()) { netzPruefen(); return; }
    if (keineFragenMehr()) { kontingentZeigen(); return; }
    offeneFrage = text;
    if (!wiederholen) eingabe.value = '';
    zeichneVerlauf();
    var k = kontextErmitteln();
    kontextText.textContent = k.beschreibung;
    var body = {
      verlauf: verlauf.slice(-(MAX_VERLAUF - 1)).concat([{ rolle: 'nutzer', text: text }]),
      kontext: k.kontext
    };
    laeuft = true;
    senden.disabled = true;
    wurzel.setAttribute('aria-busy', 'true');
    statusSagen('Der Tutor überlegt …', 'laeuft');
    A.api('tutor', { method: 'POST', body: body }).then(function (d) {
      verlauf.push({ rolle: 'nutzer', text: text });
      verlauf.push({ rolle: 'tutor', text: String(d && d.antwort || '') });
      offeneFrage = null;
      if (d && d.rest && typeof d.rest.heute === 'number') rest = d.rest.heute;
      erschoepft = false;
      sichern();
      zeichneVerlauf();
      restZeigen();
      statusLeeren();
    }, function (e) {
      var f = (e && e.daten && e.daten.fehler) || '';
      var meldung = (e && e.daten && e.daten.meldung) || '';
      var nochmal = { text: 'Nochmal versuchen', fn: function () { abschicken(true); } };
      if (e && e.offline) statusSagen('Keine Verbindung zum Server. Prüfe dein Netz.', 'fehler', nochmal);
      else if (e.status === 401) { offeneFrage = null; eingabe.value = text; zeichneVerlauf(); sperren('anmelden'); }
      else if (e.status === 503 && f === 'nicht-eingerichtet') { offeneFrage = null; zeichneVerlauf(); sperren('nicht-eingerichtet'); }
      else if (e.status === 429) {
        /* Frage zurück ins Feld (nicht verloren), Senden bis morgen aus */
        offeneFrage = null; eingabe.value = text; zeichneVerlauf();
        if (e.daten && e.daten.rest && typeof e.daten.rest.heute === 'number') rest = e.daten.rest.heute;
        erschoepft = true; sichern(); restZeigen();
        kontingentZeigen(meldung);
      } else if (e.status === 400) {
        offeneFrage = null; eingabe.value = text; zeichneVerlauf();
        statusSagen(meldung || 'Die Frage konnte nicht gesendet werden.', 'fehler');
      } else statusSagen(meldung || 'Der Tutor ist gerade nicht erreichbar.', 'fehler', nochmal);
      nachUnten();
    }).then(function () {
      laeuft = false;
      wurzel.removeAttribute('aria-busy');
      netzPruefen();
      if (!form.hidden && document.activeElement !== eingabe && wurzel.contains(document.activeElement) === false) eingabe.focus();
    });
  }

  /* ── Anbindung an die Hülle ───────────────────────────────────── */
  A.an('panel', function (d) {
    if (!d || d.id !== ID || !d.offen || !d.element) return;
    if (!wurzel) aufbauen();
    if (wurzel.parentNode !== d.element) {
      while (d.element.firstChild) d.element.removeChild(d.element.firstChild);
      d.element.appendChild(wurzel);
    }
    kontextZeigen();
    netzPruefen();
    kontoPruefen();
    nachUnten();
    /* Die Hülle fokussiert das erste Eingabefeld im Panel; das kann der Editor eines Beispiels im
       Verlauf sein. Deshalb gleich danach auf die Frage setzen. */
    setTimeout(function () {
      if (A.panel.id() !== ID) return;
      var ziel = form.hidden ? sperre.querySelector('button') : eingabe;
      if (ziel) { try { ziel.focus({ preventScroll: true }); } catch (e) { ziel.focus(); } }
    }, 0);
  });
  A.an('netz', netzPruefen);
  A.an('konto', function () { if (wurzel && A.panel.id() === ID) kontoPruefen(); });
  window.addEventListener('online', netzPruefen);
  window.addEventListener('offline', netzPruefen);
  window.addEventListener('hashchange', function () { if (wurzel && A.panel.id() === ID) kontextZeigen(); });

  window.KursTutor = { kontext: function () { return kontextErmitteln(); } };
})();
