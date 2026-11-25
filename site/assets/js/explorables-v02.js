/* =============================================================
   explorables-v02.js – interaktive Bausteine für Termin 02 (Wahr oder falsch: Programme, die entscheiden)
     data-explorable="vergleich"   „Reicht das Geld?“: Regler für das Geld, fünf Knöpfe für das Vergleichszeichen
     data-explorable="weiche"      Plan mit Raute als Daten, Wert per Knopfgruppe wählen, der gegangene Weg leuchtet
                                   data-plan="automat" (Standard, Termin 02) oder data-plan="ampel" (Termin 03)
   Die Seite von Termin 03 lädt diese Datei mit (für „weiche“); kopiert wird nichts.
   Eigenständig wie alle explorables-vNN.js: keine Bibliothek außer pap-engine.js, Texte per textContent.
   Der Rechenkern steht oben und ist ohne Browser prüfbar (module.exports).
   Schreibweisen: im Satz wahr/falsch, in Python True/False, am Ausgang der Raute ja/nein;
   Beträge mit Komma und Euro-Zeichen (2,00 €), Code mit Punkt (2.0 >= 1.5).
   ============================================================= */
(function () {
  'use strict';

  /* ── Rechenkern (ohne DOM) ────────────────────────────────── */
  var PREIS = 1.5;
  /* Die sieben Beträge des Reglers: 0 bis 3 Euro in Schritten von 0,50 (alles Vielfache von 0,5, also exakt) */
  var BETRAEGE = [0, 0.5, 1, 1.5, 2, 2.5, 3];
  var OPERATOREN = ['<', '>', '<=', '>=', '=='];
  var OP_WORT = { '<': 'kleiner als', '>': 'größer als', '<=': 'kleiner oder gleich', '>=': 'größer oder gleich', '==': 'gleich' };

  /* Betrag wie im Deutschen: 2 -> "2,00 €" */
  function euro(x) { return x.toFixed(2).replace('.', ',') + ' €'; }
  /* Zahl wie im Python-Code: 2 -> "2.0", 1.5 -> "1.5"; ganze Zahlen (ganzzahlig = true) ohne Nachkommastelle: 32 -> "32" */
  function py(x, ganzzahlig) { return ganzzahlig ? String(x) : (Number.isInteger(x) ? x.toFixed(1) : String(x)); }
  function vergleiche(a, op, b) {
    switch (op) {
      case '<': return a < b;
      case '>': return a > b;
      case '<=': return a <= b;
      case '>=': return a >= b;
      case '==': return a === b;
    }
    throw new Error('Unbekanntes Vergleichszeichen: ' + op);
  }
  function wort(w) { return w ? 'wahr' : 'falsch'; }
  function pyBool(w) { return w ? 'True' : 'False'; }
  /* Die Aussage „geld OP preis“ mit Zahlen */
  function aussage(geld, op, preis) {
    var w = vergleiche(geld, op, preis === undefined ? PREIS : preis);
    return { code: py(geld) + ' ' + op + ' ' + py(preis === undefined ? PREIS : preis), wahr: w, wort: wort(w), python: pyBool(w) };
  }
  /* Bei welchen Vergleichszeichen ist die Aussage für diesen Betrag wahr? */
  function wahrBei(geld, preis) {
    return OPERATOREN.filter(function (op) { return vergleiche(geld, op, preis === undefined ? PREIS : preis); });
  }
  /* Für jeden der sieben Beträge: ist die Aussage mit diesem Zeichen wahr? */
  function punkte(op, preis) {
    return BETRAEGE.map(function (b) { return { betrag: b, wahr: vergleiche(b, op, preis === undefined ? PREIS : preis) }; });
  }
  function satzVergleich(geld, op, preis) {
    var a = aussage(geld, op, preis);
    return 'Dein Geld ' + euro(geld) + ', Preis ' + euro(preis === undefined ? PREIS : preis) + ', Zeichen ' + OP_WORT[op] + ': ' +
      'Die Aussage ' + a.code + ' ist ' + a.wort + '. Python schreibt ' + a.python + '.';
  }

  /* Pläne als Daten. Eine Folge ist eine Liste von Knoten; „if“ hat ja und nein (Listen, können leer sein).
     Dieselben Knoten ergeben den Plan (planSpec) und den gegangenen Weg (gehe). */
  var PLAENE = {
    automat: {
      titel: 'Plan des Getränkeautomaten',
      eingabe: 'geld', eingabeName: 'Eingeworfenes Geld', ganzzahlig: false,
      werte: [0.5, 1, 1.5, 2, 3], knopf: euro,
      knoten: [
        { id: 's', t: 'start' },
        { id: 'e1', t: 'io', text: 'Eingabe: geld' },
        { id: 'f1', t: 'if', links: 'geld', op: '>=', rechts: 1.5,
          ja: [{ id: 'a1', t: 'io', text: 'Ausgabe: "Cola kommt"', ausgabe: 'Cola kommt' }],
          nein: [{ id: 'a2', t: 'io', text: 'Ausgabe: "Zu wenig Geld"', ausgabe: 'Zu wenig Geld' }] },
        { id: 'a3', t: 'io', text: 'Ausgabe: "Danke"', ausgabe: 'Danke' },
        { id: 'e', t: 'end' }
      ]
    },
    ampel: {
      titel: 'Plan der Ampel',
      eingabe: 'sekunde', eingabeName: 'Sekunde im Umlauf', ganzzahlig: true,
      werte: [10, 29, 30, 32, 35, 50], knopf: function (x) { return String(x); },
      knoten: [
        { id: 's', t: 'start' },
        { id: 'e1', t: 'io', text: 'Eingabe: sekunde' },
        { id: 'f1', t: 'if', links: 'sekunde', op: '<', rechts: 30,
          ja: [{ id: 'a1', t: 'io', text: 'Ausgabe: "Grün"', ausgabe: 'Grün' }],
          nein: [
            { id: 'f2', t: 'if', links: 'sekunde', op: '<', rechts: 35,
              ja: [{ id: 'a2', t: 'io', text: 'Ausgabe: "Gelb"', ausgabe: 'Gelb' }],
              nein: [{ id: 'a3', t: 'io', text: 'Ausgabe: "Rot"', ausgabe: 'Rot' }] }
          ] },
        { id: 'e', t: 'end' }
      ]
    }
  };

  /* Der Weg durch den Plan für einen Eingabewert.
     -> { besucht: [ids in Reihenfolge], kanten: [{von, nach, label}], fragen: [{text, wahr, weg}], ausgaben: [Text] }
     Eine Kante von einer Raute trägt ja oder nein, alle anderen ''. Gefragt wird von oben nach unten;
     was nicht auf dem Weg liegt, wird nicht gefragt. */
  function gehe(plan, wert) {
    var r = { besucht: [], kanten: [], fragen: [], ausgaben: [] }, prev = null, prevLabel = '';
    function besuche(id) {
      if (prev !== null) r.kanten.push({ von: prev, nach: id, label: prevLabel });
      r.besucht.push(id); prev = id; prevLabel = '';
    }
    function lauf(folge) {
      folge.forEach(function (n) {
        besuche(n.id);
        if (n.t === 'if') {
          var w = vergleiche(wert, n.op, n.rechts);
          r.fragen.push({ text: py(wert, plan.ganzzahlig) + ' ' + n.op + ' ' + py(n.rechts, plan.ganzzahlig), wahr: w, weg: w ? 'ja' : 'nein' });
          prevLabel = w ? 'ja' : 'nein';
          lauf(w ? n.ja : n.nein);
        } else if (n.ausgabe !== undefined) r.ausgaben.push(n.ausgabe);
      });
    }
    lauf(plan.knoten);
    return r;
  }
  /* Der Plan für pap-engine.js (P = window.KursPAP.P) */
  function planSpec(P, plan) {
    function conv(folge) {
      return folge.map(function (n) {
        if (n.t === 'start') return P.start(n.id);
        if (n.t === 'end') return P.end(n.id);
        if (n.t === 'io') return P.io(n.text, n.id);
        if (n.t === 'if') return P.iff(n.links + ' ' + n.op + ' ' + py(n.rechts, plan.ganzzahlig) + '?', conv(n.ja), conv(n.nein), n.id);
        throw new Error('Unbekannte Knotenart: ' + n.t);
      });
    }
    return conv(plan.knoten);
  }
  function satzWeiche(plan, wert) {
    var g = gehe(plan, wert), teile = [plan.eingabeName + ' ' + plan.knopf(wert) + '.'];
    g.fragen.forEach(function (f) { teile.push(f.text + ' ist ' + wort(f.wahr) + ': Weg ' + f.weg + '.'); });
    teile.push('Ausgabe: ' + g.ausgaben.join(', dann ') + '.');
    return teile.join(' ');
  }
  /* Plan für die Seite wählen: data-plan, sonst nach der Lektion (Termin 03 zeigt die Ampel) */
  function planName(angabe, lektion) {
    if (angabe && PLAENE[angabe]) return angabe;
    return lektion === 'V03' ? 'ampel' : 'automat';
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      PREIS: PREIS, BETRAEGE: BETRAEGE, OPERATOREN: OPERATOREN, OP_WORT: OP_WORT, PLAENE: PLAENE,
      euro: euro, py: py, vergleiche: vergleiche, aussage: aussage, wahrBei: wahrBei, punkte: punkte, satzVergleich: satzVergleich,
      gehe: gehe, planSpec: planSpec, satzWeiche: satzWeiche, planName: planName
    };
  }
  if (typeof document === 'undefined') return;

  /* ── DOM-Hilfen ───────────────────────────────────────────── */
  var nr = 0;
  function el(tag, attrs, kinder) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kinder || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  /* Knopfgruppe mit „gedrückt“-Zustand; jeder Knopf mindestens 44 px hoch (kurs.css .k-chip) */
  function knopfgruppe(label, eintraege, aktiv, fn) {
    var gruppe = el('div', { class: 'v02-knoepfe', role: 'group', 'aria-label': label }), knoepfe = [];
    eintraege.forEach(function (e) {
      var b = el('button', { type: 'button', class: 'v02-knopf' + (e.code ? ' is-code' : ''), 'aria-pressed': 'false', text: e.text });
      if (e.aria) b.setAttribute('aria-label', e.aria);
      b.addEventListener('click', function () { setze(e.wert); fn(e.wert); });
      knoepfe.push({ b: b, wert: e.wert });
      gruppe.appendChild(b);
    });
    function setze(wert) { knoepfe.forEach(function (k) { k.b.setAttribute('aria-pressed', k.wert === wert ? 'true' : 'false'); }); }
    setze(aktiv);
    return gruppe;
  }

  /* ── 1. Reicht das Geld? ──────────────────────────────────── */
  function initVergleich(host) {
    var geld = 2, op = '>=';
    host.textContent = '';
    var id = 'v02-r' + (++nr);
    var ausGeld = el('output', { for: id, text: euro(geld) });
    var regler = el('input', { type: 'range', id: id, min: '0', max: '3', step: '0.5', value: String(geld) });
    var feld = el('div', { class: 'k-field v02-geld' }, [el('label', { for: id }, ['Dein Geld: ', ausGeld]), regler]);
    var preis = el('p', { class: 'v02-preis' }, ['Preis der Cola (fest): ', el('strong', { text: euro(PREIS) })]);
    var code = el('code', { class: 'v02-aussage__code' });
    var wortEl = el('strong', { class: 'v02-aussage__wort' });
    var pyEl = el('code', { class: 'v02-aussage__py' });
    var ergebnis = el('div', { class: 'v02-aussage' }, [
      el('p', { class: 'v02-aussage__zeile' }, ['Aussage: ', code]),
      wortEl,
      el('p', { class: 'v02-aussage__zeile' }, ['In Python: ', pyEl])
    ]);
    var liste = el('ul', { class: 'v02-punkte' });
    var punkteKopf = el('p', { class: 'v02-punkte__kopf' });
    var status = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    var zeichen = knopfgruppe('Vergleichszeichen', OPERATOREN.map(function (o) { return { wert: o, text: o, code: true, aria: OP_WORT[o] + ' (' + o + ')' }; }), op, function (w) { op = w; zeige(true); });
    function zeige(ansagen) {
      var a = aussage(geld, op);
      ausGeld.textContent = euro(geld);
      code.textContent = a.code;
      wortEl.textContent = a.wort;
      wortEl.className = 'v02-aussage__wort ' + (a.wahr ? 'is-wahr' : 'is-falsch');
      pyEl.textContent = a.python;
      punkteKopf.textContent = 'Mit dem Zeichen ' + op + ' ist die Aussage bei diesen Beträgen wahr (gefüllt) oder falsch (leer):';
      liste.textContent = '';
      punkte(op).forEach(function (p) {
        var li = el('li', { class: 'v02-punkt ' + (p.wahr ? 'is-wahr' : 'is-falsch') + (p.betrag === geld ? ' is-jetzt' : '') }, [
          el('span', { class: 'v02-punkt__kreis', 'aria-hidden': 'true' }),
          el('span', { class: 'v02-punkt__betrag', text: euro(p.betrag) }),
          el('span', { class: 'k-sr', text: ': ' + wort(p.wahr) + (p.betrag === geld ? ' (dein Geld)' : '') })
        ]);
        liste.appendChild(li);
      });
      if (ansagen) status.textContent = satzVergleich(geld, op);
    }
    regler.addEventListener('input', function () { geld = Number(regler.value); zeige(true); });
    zeige(false);
    host.appendChild(el('div', { class: 'v02-vergleich' }, [
      el('div', { class: 'v02-vergleich__links' }, [
        feld, preis,
        el('div', { class: 'v02-zeichen' }, [el('p', { class: 'v02-titel', text: 'Vergleichszeichen' }), zeichen])
      ]),
      el('div', { class: 'v02-vergleich__rechts' }, [ergebnis]),
      el('div', { class: 'v02-vergleich__unten' }, [punkteKopf, liste]),
      status
    ]));
  }

  /* ── 2. Die Weiche: der Plan, der gegangene Weg ───────────── */
  function initWeiche(host) {
    var K = window.KursPAP;
    if (!K) { host.textContent = 'Der Programmablaufplan konnte nicht geladen werden.'; return; }
    var P = K.P || K;
    var plan = PLAENE[planName(host.getAttribute('data-plan'), document.body && document.body.getAttribute('data-lesson'))];
    var wert = plan.werte[3];   /* automat: 2,00 €, ampel: Sekunde 32 */
    host.textContent = '';
    var bild = el('div', { class: 'pap-wrap v02-weiche__plan' });
    bild.innerHTML = K.svg(planSpec(P, plan), { label: plan.titel + ': ' + K.describe(planSpec(P, plan)), cls: 'pap--run v02-pap', minw: 0.6 });
    var knoepfe = knopfgruppe(plan.eingabeName, plan.werte.map(function (w) { return { wert: w, text: plan.knopf(w), aria: plan.eingabeName + ' ' + plan.knopf(w) }; }), wert, function (w) { wert = w; zeige(true); });
    var fragen = el('ul', { class: 'v02-fragen' }), ausgaben = el('ul', { class: 'v02-ausgaben' });
    var status = el('p', { class: 'k-sr', role: 'status', 'aria-live': 'polite' });
    function zeige(ansagen) {
      var g = gehe(plan, wert);
      Array.prototype.forEach.call(bild.querySelectorAll('.pap-n'), function (k) {
        var an = g.besucht.indexOf(k.getAttribute('data-id')) >= 0;
        k.classList.toggle('is-weg', an);
        k.classList.toggle('is-nebenweg', !an);
      });
      Array.prototype.forEach.call(bild.querySelectorAll('.pap-e'), function (k) {
        var von = k.getAttribute('data-from'), nach = k.getAttribute('data-to'), lab = k.getAttribute('data-lab') || '';
        var an = g.kanten.some(function (x) { return x.von === von && x.nach === nach && x.label === lab; });
        k.classList.toggle('is-weg', an);
        k.classList.toggle('is-nebenweg', !an);
      });
      fragen.textContent = '';
      g.fragen.forEach(function (f) {
        fragen.appendChild(el('li', { class: f.wahr ? 'is-wahr' : 'is-falsch' }, [el('code', { class: 'k-i', text: f.text }), ' ist ' + wort(f.wahr) + ': Weg ' + f.weg]));
      });
      ausgaben.textContent = '';
      g.ausgaben.forEach(function (a) { ausgaben.appendChild(el('li', {}, [el('code', { class: 'k-i', text: a })])); });
      if (ansagen) status.textContent = satzWeiche(plan, wert);
    }
    zeige(false);
    host.appendChild(el('div', { class: 'v02-weiche' }, [
      bild,
      el('div', { class: 'v02-weiche__seite' }, [
        el('p', { class: 'v02-titel', text: plan.eingabeName }),
        knoepfe,
        el('p', { class: 'v02-titel', text: 'Gestellte Fragen' }), fragen,
        el('p', { class: 'v02-titel', text: 'Ausgabe' }), ausgaben,
        status
      ])
    ]));
  }

  function init() {
    var map = { vergleich: initVergleich, weiche: initWeiche };
    Object.keys(map).forEach(function (k) {
      Array.prototype.forEach.call(document.querySelectorAll('[data-explorable="' + k + '"]'), function (host) {
        if (host._v02) return;
        host._v02 = true;
        map[k](host);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
