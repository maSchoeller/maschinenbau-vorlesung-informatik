# Lektionen als MDX schreiben

Stand: 2026-11-23. Gilt für alle Seiten, deren Quelle MDX ist: die neuen Terminseiten (Referenz: Termin 01 unter `app/inhalte/v01/`) Alte Lektionen gibt es nicht mehr. Vertrag: `docs/app/ARCHITEKTUR.md`, Abschnitt 15.

Der Kurs wird auf 20 Termine umgestellt (`KONZEPT.md`, Architektur Abschnitt 16). Neue Terminseiten entstehen direkt als MDX. Die Lektionen des alten Kurses sind ersatzlos entfernt.

## Wo was liegt

```
app/inhalte/v01/lerneinheit.mdx        Lerneinheit  -> lektionen/v01-ablauf-und-erste-programme.html
app/inhalte/v01/labor.mdx              Labor        -> lektionen/v01-labor.html
app/inhalte/v01/labor/*.py|json        Python und JSON des Labors (Startcode, Tests, Lösung, Aufgabendaten)
```

Die Adressen der Seiten bleiben, wie sie in `app/kurs.yaml` stehen. Die MDX-Datei ist die Quelle; unter `site/lektionen/` liegt nichts mehr.

Namen der Code-Dateien: `<Kennung der Aufgabe>.<Rolle>.py`, zum Beispiel `tr-1.tests.py`, `tr-1.solution.py`, `tr-1.vorlage.py` (Startcode im Editor), `w-trace.daten.json`.

## Kopf der Datei

```yaml
---
titel: Termin 01 · Erst der Ablauf, dann der Code · Lerneinheit · Informatik Maschinenbau
beschreibung: "Wellen-Rechner aus Bausteinen: …"
body:                       # Attribute von <body>
  data-lesson: V01
  data-page: lerneinheit
stile:                      # Stylesheets in dieser Reihenfolge
  - ../assets/css/dhbw-base.css
  - ../assets/css/kurs.css
skripte:                    # Skripte in dieser Reihenfolge
  - ../assets/js/speicher.js
  - src: ../assets/js/editor.js
    defer: true
---
```

## Markdown

| Du schreibst | Es entsteht |
|---|---|
| Absatz, `### Überschrift`, `- Liste`, `1. Liste`, `**fett**`, `*betont*`, `[Text](ziel.html)` | das übliche HTML ohne Klassen |
| `` `def` `` | `<code class="k-i">def</code>` (Code im Fließtext) |
| ```` ```python ```` … ```` ``` ```` | `<pre><code>…</code></pre>`, also ein ausführbarer Codeblock |
| ```` ```python data-timeout="5000" ```` | dasselbe mit Attributen am `<pre>` (auch `class="k-code"`, `data-run="nach-antwort"`) |
| ```` ```text data-run="no" ```` | `<pre data-run="no">…</pre>` ohne `<code>`: Ausgaben, Tracebacks, Lückentext |

Schlichtes `<code>` ohne Klasse (in Quiz-Erklärungen üblich) schreibst du als HTML: `<code>None</code>`, bei Sonderzeichen `<code>{"a < b"}</code>`.

HTML darf überall stehen, in JSX-Schreibweise: leere Elemente mit Schrägstrich (`<br />`, `<img … />`), Attribute ohne Wert einfach als Name (`hidden`). Ein Element mit Fließtext steht auf einer Zeile (`<p class="k-small k-muted">Text mit *Betonung*</p>`); ein Element um Blöcke bekommt Leerzeilen innen:

```mdx
<div class="k-try">

### Überschrift

Absatz.

</div>
```

Diese Zeichen brauchen im Fließtext einen Rückstrich: `\{ \} \< \* \_ \[ \]`. Ein Absatz darf nicht mit `import` oder `export` beginnen (MDX hält das für Code); dann schreibt man `&#105;mport`.

## Bausteine

```mdx
<Begriff e="Ein Bit ist die kleinste Informationseinheit: 0 oder 1.">Bit</Begriff>

<Icon n="head" />

<Hinweis art="merke">        merke · achtung · warum (anderer Titel: titel="…")

Text des Hinweises.

</Hinweis>

<Abschnitt id="warum" nr="1" titel="Warum?">     Abschnitt der Lerneinheit; zusatz="(freiwillig)", kopf="h-aus"
…
</Abschnitt>

<Station id="t-3" titel="Toleranzprüfung als Funktion" teil="B" sterne="2" min="8">   Station im Labor
…
</Station>

<Vorhersage>

Welchen Wert hat `y` in der letzten Zeile?

- 10
- [x] None
- Fehlermeldung

<code>None</code>. Die Funktion zeigt 10 an, gibt aber nichts zurück.

</Vorhersage>

Eine `<Vorhersage>` ohne Codeblock im selben Kasten (`.k-try`), etwa vor einem `<Plan>`, löst beim Klick sofort auf und speichert den Stand. Mit Codeblock wird erst nach dem Ausführen aufgelöst.

<Quiz id="v01">

<Frage id="t4" typ="mc" punkte="2" titel="T4 · Welche Regel ist verletzt?">

Text der Frage, auch mit Codeblock.

- DRY: Die Formel steht zweimal im Code.
- [x] SRP: Die Funktion hat mehrere Aufgaben.

<Erklaerung>

Rechnen, Ausgeben und Bewerten sind drei Aufgaben.

</Erklaerung>

</Frage>

</Quiz>

<Explorable name="baum" titel="Vom Problem zu den Bausteinen">

Einleitung in einem Absatz.

<Ohne>

Text für Browser ohne JavaScript.

</Ohne>

</Explorable>

<Python rolle="tests" datei="labor/tr-1.tests.py" />
<Editor datei="labor/tr-1.vorlage.py" data-lesson="V01" aria-label="Python-Code Aufgabe 1" />
<Daten datei="labor/w-trace.daten.json" />
```

Bei `<Frage>` stehen `antwort="4"` und `tol="0.1"` für Zahlen- und Ausgabefragen. Die Punktzahl rechts oben („2 Punkte“) entsteht aus `punkte`.

### Seitenrahmen, Pläne, Aufgaben (seit Termin 01)

```mdx
<Lerneinheit nr="V01" name="Termin 01" labor="v01-labor.html">     Inhaltsverzeichnis, Fortschritt und <main> entstehen aus den Abschnitten
<Kopf marke="Termin 01 · 1. Semester · Lerneinheit" titel="…">      erster Absatz = Vorspann, Liste = Lernziele, weitere Absätze = kleiner Hinweis
<Video name="v01-theorie" id="video-theorie" titel="…" fehlt="Video folgt. …">   Dateien: assets/video/<name>.mp4, .vtt, -poster.png; fehlt die .mp4 beim Build, steht nur der Platzhalter da (kein <video>, keine Anfragen)
<Weiter ziel="v01-labor.html"> … </Weiter>                          „Wie geht es weiter?“ mit Knopf ins Labor
<Dozent titel="Für Dozierende: …"> … </Dozent>                      eingeklappter Ablaufplan

<Plan titel="Pendelstrecke">          Programmablaufplan als Bild, beim Build gezeichnet; die Seite braucht v05.css

```text
Eingabe: strecke
woche = strecke * 2 * tage
Ausgabe: woche
```

</Plan>

<Labor nr="V01" name="Termin 01" lerneinheit="v01-….html" zuhause="45">          zuhause = Minuten für „Teil B (45 Min, Pflicht)“, ohne Angabe „(Pflicht)“. Aufgabenliste, Auswahl, Werkzeugkasten-Knopf, Blättern
<Werkzeugkasten> <Syntaxkarte id="sk-print" nr="1" titel="…"> … </Syntaxkarte> </Werkzeugkasten>   in der ersten Station
<Aufgabe art="code" id="tr-1" titel="…" data-mode="code"> … </Aufgabe>   art: trace, parsons, gap, code, run, klausur, pap-zeichnen
<Tipps>      nummerierte Liste der gestuften Hinweise
<Schritte>   nummerierte Liste, die ein vorgerechnetes Beispiel erklärt
<Fehlersuche titel="Pizza teilen" fehler="3 4">   Beschreibung, Programm als ```text, danach die Auflösung
<Knobel id="kn-1" titel="…">   freiwillige Knobelaufgabe, ganz am Ende des Labors (siehe „Knobelaufgaben (freiwillig)“ unten)
```

Eine Zeile je Symbol im `<Plan>`: „Eingabe: …“ und „Ausgabe: …“ werden Parallelogramme, alles andere ein Rechteck; Start und Ende kommen von selbst. Eine Verzweigung schreibst du als `Entscheidung: bedingung?` und darunter eingerückt (zwei Leerzeichen je Ebene) die Zweige `ja:` und `nein:` mit ihren Schritten; ein Zweig darf fehlen, und in einem Zweig darf wieder eine Entscheidung stehen:

````mdx
<Plan titel="Bestanden?">

```text
Eingabe: punkte
Entscheidung: punkte >= 50?
  ja:
    Ausgabe: "bestanden"
  nein:
    Ausgabe: "nicht bestanden"
```

</Plan>
````
 `<Station … data-seen="manual">` zählt erst als angesehen, wenn die Fehlersuche aufgelöst wurde. Vorbelegte Eingaben eines Codeblocks mit mehreren Zeilen: ```` ```python data-stdin="40\n10" ```` (bei Aufgaben `data-inputs="40|10"`). Sie gelten nur im Modus „vorab eintragen“; in der Voreinstellung „im Terminal“ tippen die Studierenden die Eingaben beim Lauf selbst. Texte auf den Seiten beschreiben deshalb das Tippen im Terminal, nicht das Feld.

Regeln für neue Terminseiten (Vorgaben vom 2026-11-23):

- **Interaktive Bausteine:** Jeder Termin bekommt wenige, einfache Bausteine zum Ausprobieren (Regler, Schritt-Knopf, Schalter), je Kerninhalt höchstens einen. Sie liegen als `site/assets/js/explorables-vNN.js` mit `site/assets/css/vNN.css` und werden mit `<Explorable name="…">` eingebunden. Der Rechenkern steht oben in der Datei und wird ohne Browser getestet (`app/skripte/tests/termin01.test.mjs` als Muster).
- **Fragen werden gemischt:** `kurs.js` ordnet Quizfragen, ihre Antworten und die Antworten einer `<Vorhersage>` bei jedem Aufruf zufällig an. Deshalb keine Nummern im Titel einer Frage und keine Formulierungen wie „die erste Antwort“ oder „keine der oben genannten“.
- **Plan zuerst, wenn der Ablauf neu ist:** Ein neuer Ablauf wird zuerst als Plan gezeichnet oder gezeigt, dann programmiert. Nicht jede Programmieraufgabe muss mit einem Plan beginnen (Festlegung des Dozenten, 2026-11-24). Die drei Klausurformen (Plan zeichnen, Plan in Code übertragen, Code lesen) kommen in jedem Labor vor.
- **Jede Musterlösung besteht ihre Tests:** `node skripte/pruefe-loesungen.mjs <Ausgabeordner>` lässt die Lösungen aller Aufgaben der neuen Terminseiten im Browser gegen ihre Tests laufen (auch Lückentexte und gezeichnete Pläne) und ist Teil von `npm run pruefen:alles`.

`<Html>{`…`}</Html>` gibt HTML unverändert aus. Das braucht man nur im Ausnahmefall; neu schreibt man so nichts.

Die genaue Ausgabe jedes Bausteins steht in `app/src/lib/mdx/bausteine.mjs` (kurz, ein Baustein je Funktion). Ein neuer Baustein ist eine Funktion dort, die Knoten mit `h('div', {class: '…'}, kinder)` zurückgibt.

### Ablauf verfolgen (`art="trace"`): Daten und Schalter

Die Daten stehen in einer JSON-Datei (`<Daten datei="labor/w-trace.daten.json" />`): `code` (Zeilen des Programms), `vars` (Spalten der Tabelle) und `steps`. Je Schritt: `line` (Zeile, die ausgeführt wird), `set` (Variable und neuer Wert, die Studierende eintragen), `out` (Ausgabe der Zeile), `hint` (Hinweis nach einem Fehlversuch). Verglichen wird als Text; Leerraum am Rand und doppelte Leerzeichen zählen nicht, Groß- und Kleinschreibung schon (`True`, nicht `true`). Zwei Schalter (seit Termin 02), beide optional; ohne sie verhält sich die Aufgabe wie in Termin 01:

| Schalter | Wo | Wirkung |
|---|---|---|
| `frage` | an einem Schritt | Text, der statt des festen Starttextes („Zeile N wird ausgeführt. Was steht danach … Typen beachten: Text steht in Anführungszeichen.“) über der Tabelle steht, solange der Schritt offen ist. Ohne eigenen `hint` lautet der Hinweis nach einem Fehlversuch dann „Geh die Zeile nochmal durch.“ (ohne den Satz zu den Typen). |
| `sprache: "plan"` oder `"tabelle"` | an der ganzen Aufgabe | Die Zeilen sind ein Plan oder eine Tabelle, kein Python: Der Block heißt „Plan“ bzw. „Tabelle“ statt „Python“, hat keinen Kopieren-Knopf, und der Satz „Typen beachten …“ entfällt. |
| `typhinweis: false` | an der ganzen Aufgabe | Lässt den festen Satz „Typen beachten: Text steht in Anführungszeichen.“ weg, wenn die Werte keinen Text enthalten (Zahlen, True, False). Ohne diesen Schalter und ohne `frage` bleibt er (Termin 01). |
| `ausgabe: false` | an der ganzen Aufgabe | Die Spalte „Ausgabe“ und das Ausgabefeld entfallen; `out` in den Schritten wird nicht gefragt. Gedacht für Entscheidungen (Weg oder Wert der Bedingung) und für Wahrheitstabellen. |

Anführungszeichen: Der Vergleich entfernt sie nicht. Wer `"nein"` statt `nein` tippt, bekommt „Noch nicht richtig“. Deshalb sagt jede Aufgabe, die Wörter oder Wahrheitswerte abfragt, in der Aufgabenstellung und im `hint` jedes solchen Schritts „ohne Anführungszeichen“, und die `frage` nennt es, weil sie den festen Text mit dem Typ-Hinweis ersetzt. Beispiel (Entscheidung abfragen, ohne Ausgabe):

```json
{
 "code": ["geld = 2.0", "if geld >= 1.5:", "    print(\"Cola\")"],
 "vars": ["geld", "Bedingung", "Weg"],
 "ausgabe": false,
 "steps": [
  { "line": 1, "set": { "geld": "2.0" }, "frage": "Zeile 1 wird ausgeführt. Trag den Wert von geld ein." },
  { "line": 2, "set": { "Bedingung": "True" }, "frage": "Zeile 2: Wie lautet die Bedingung? Trag True oder False ein, ohne Anführungszeichen.", "hint": "Ohne Anführungszeichen, und True mit großem T." },
  { "line": 3, "set": { "Weg": "ja" }, "frage": "Welchen Weg nimmt der Plan? Trag ja oder nein ein, ohne Anführungszeichen." }
 ]
}
```

Wahrheitstabelle als Ablauf: eine Zeile der Tabelle je Schritt, `vars` sind die Hilfsspalte und das Ergebnis, `ausgabe: false`, und jeder Schritt hat eine `frage` („Zeile A = 0, B = 1: Trag in beide Felder 0 oder 1 ein, ohne Anführungszeichen.“); die Spalte „Zeile“ zeigt dann 1 bis 4. Der Stand (`ablauf:<aufgabe>`) wird mit beiden Schaltern wie sonst gespeichert; der Fingerabdruck `f` enthält `frage` und `ausgabe`. Geprüft in `app/skripte/pruefe-stand.mjs` (Teil „schalter“, mit einer Probeaufgabe).

Im Plan-Zeichner (`art="pap-zeichnen"`) darf in der Raute ein Fragezeichen stehen („alter >= 16?“); der erzeugte Code lässt es weg (Test: `app/skripte/tests/pap-engine.test.mjs`).

### Knobelaufgaben (freiwillig)

Wunsch des Dozenten (2026-11-24): Je Termin gibt es 1 bis 2 sehr anspruchsvolle, freiwillige Aufgaben für alle, die mit dem Labor schneller fertig sind. Sie dürfen für die Schwächeren kein Nachteil sein und nichts nach Pflicht aussehen lassen; die Zielgruppe hat Angst vor dem Fach.

**Schreibweise:** ein `<Knobel>` je Aufgabe, ganz am Ende von `<Labor>` (nach allen `<Station>`). Darin genau eine `<Aufgabe>`. Station `kn-1`, Aufgabe `k-1`; die zweite `kn-2` und `k-2`. Der Baustein schreibt Kennzeichnung, Einleitungssatz und alle Merkmale selbst; du setzt nichts davon von Hand.

````mdx
<Knobel id="kn-1" titel="Münzen wechseln">

<Aufgabe art="code" id="k-1" data-mode="programm" data-inputs="87">

<div class="a-task__text">

Ein Automat zahlt Wechselgeld nur in Münzen zu 50, 20, 10, 5, 2 und 1 Cent aus. Das Programm liest einen Betrag in Cent ein und gibt aus, wie viele Münzen mindestens nötig sind. Beispiel: 87 Cent sind 50 + 20 + 10 + 5 + 2, also 5 Münzen.

</div>

<Editor datei="labor/k-1.vorlage.py" aria-label="Python-Code: Münzen wechseln" />

<Python rolle="tests" datei="labor/k-1.tests.py" />

<Python rolle="solution" datei="labor/k-1.solution.py" />

<Tipps>

1. Fang bei der größten Münze an: Wie oft passt sie in den Betrag?
2. Mit `//` und `%` bekommst du Anzahl und Rest.

</Tipps>

</Aufgabe>

</Knobel>
````

**Dateien** (neben `labor.mdx`, im Ordner `labor/`): `k-1.vorlage.py`, `k-1.tests.py`, `k-1.solution.py`, bei Bedarf `k-1.daten.json`; für die zweite `k-2.…`. Aufbau wie bei jeder Code-Aufgabe (Vorbild `w-eigene`). Die Aufgabe bekommt kein `titel`: Die Station zeigt ihn schon, sonst steht er zweimal untereinander.

**Regeln für Autorinnen und Autoren:**

- **Nur bekannter Stoff:** nur Sprachmittel, die bis einschließlich dieses Termins eingeführt sind (`python:` in `kurs.yaml`, Termine davor mitgezählt). Keine Bibliotheken, nichts aus späteren Terminen. Wer vorgreifen muss, nimmt eine andere Aufgabe.
- **Nichts baut darauf auf:** Keine Pflichtaufgabe, Lerneinheit, kein Quiz, keine Probeklausur und kein späterer Termin setzt eine Knobelaufgabe voraus oder verweist darauf. Sie ist nie klausurrelevant.
- **Ton:** Du-Form, ruhig, ohne Ausrufezeichen. Keine Wertung („für Profis“, „für die Besten“, „schwer“), keine Sterne, keine Minutenangabe (`<Knobel>` lässt sie bewusst nicht zu). Der feste Satz oben auf der Aufgabe („Diese Aufgaben sind eine Zugabe …“) kommt vom Baustein; wiederhole ihn nicht.
- **Anspruchsvoll, aber fair:** Der Aufgabentext sagt klar, was herauskommen soll, mit einem Beispiel. Tipps dürfen stufenweise helfen. Die Tests nennen bei einem Fehler, was erwartet wurde (wie bei den anderen Aufgaben). Die Musterlösung besteht alle Tests, die Vorlage besteht sie noch nicht (`pruefe-loesungen.mjs` prüft beides).
- **Höchstens 2 je Termin**, Kennungen nur `kn-1`/`kn-2` und `k-1`/`k-2`. Die Kennungen `k-1`, `k-2` sind für Knobelaufgaben reserviert; in einer `<Station>` brechen sie den Build ab. Bleibt eine Kennung stabil, bleibt auch der gespeicherte Stand erhalten.
- Der Build bricht mit Meldung ab, wenn `<Knobel>` nicht ganz am Ende steht, mehr als 2 sind, die Kennungen nicht passen, `teil`, `sterne`, `min` oder `extra` gesetzt sind oder `data-count` an der Aufgabe steht.

**Was die Plattform daraus macht** (alles vom Baustein und den Skripten, nichts davon schreibst du): eigene Gruppe „Knobelaufgaben (freiwillig)“ am Ende der Aufgabenliste, auf der Station die Kennzeichnung „Knobelaufgabe · freiwillig“ und der feste Einleitungssatz. Status (offen, begonnen, gelöst) und Bearbeitung (`code:k-1` …) werden gezeigt und gespeichert wie bei jeder Aufgabe (`aufg`, `begonnen`, kein neues Format). Gezählt werden sie **nirgends**: nicht in „x von y gelöst“ und „x/11“, nicht im Abschluss von Labor und Termin, nicht in Fortschritt, Heute und Lernpfad, nicht in der Kursübersicht der Dozierenden, nicht in der Zeitangabe des Labors. „Weiter“ nach der letzten Pflichtaufgabe führt nicht in die Knobelaufgaben, sondern nennt sie in einem Satz mit Verweis. Technik: `docs/app/ARCHITEKTUR.md`, 4.4b.

### Bearbeitungen werden von selbst gespeichert

Alle Aufgaben mit Kennung (`<Aufgabe id="…">`, `<Frage id="…">` in einem `<Quiz id="…">`), Fehlersuchen und Vorhersagen speichern, was Studierende bearbeitet haben, und stellen es beim Öffnen wieder her (bei Konto auch auf anderen Geräten). Für neue Termine ist nichts zu tun. Zwei Regeln: Die Kennung einer Aufgabe oder Frage bleibt stabil (ändert sie sich, ist der Stand weg). Wer den Text einer Lückenaufgabe, der Zeilen oder des Ablaufs ändert, macht gespeicherte Stände damit unbrauchbar; sie werden verworfen und die Aufgabe beginnt von vorn. Fehlersuche und Vorhersage haben keine Kennung und werden an ihrem Inhalt erkannt. Schlüssel und Formate: `docs/app/ARCHITEKTUR.md`, 4.4a.

## Eine Lektion umziehen

Entfällt. Der Konverter `html-nach-mdx.mjs` und das Umziehen alter Lektionen gibt es nicht mehr; jeder Termin wird neu als MDX geschrieben (Vorbild: `app/inhalte/v01/`).

## Prüfen

- `npm run selbsttest`: jede MDX-Lektion lässt sich übersetzen; mit gebautem Stand steht ihr Inhalt genau einmal in der Seite und die Skripte in der richtigen Reihenfolge.
- `npm run pruefen:alles`: wie bisher. Die Browser-Prüfungen unterscheiden nicht, ob eine Seite aus MDX oder aus `site/` kommt.
- Ein Tippfehler in einem Bausteinnamen, eine fehlende Code-Datei oder eine `<Vorhersage>` ohne richtige Antwort bricht den Build mit Dateiname und Zeile ab.

## Noch nicht umgesetzt

- Prüfung, dass kein Konstrukt vor seiner Einführung vorkommt.
- Vorschau beim Schreiben (`astro dev`) lädt MDX-Änderungen nicht von selbst neu; geprüft wird der gebaute Stand.
