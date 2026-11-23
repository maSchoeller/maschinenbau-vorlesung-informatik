# Lektionen als MDX schreiben

Stand: 2026-11-23. Gilt für alle Seiten, deren Quelle MDX ist: die neuen Terminseiten (Referenz: Termin 01 unter `app/inhalte/v01/`) und umgezogene Lektionen (V07). Vertrag: `docs/app/ARCHITEKTUR.md`, Abschnitt 15.

Der Kurs wird auf 20 Termine umgestellt (`KONZEPT.md`, Architektur Abschnitt 16). Neue Terminseiten entstehen direkt als MDX. V11, V12, V13, V15, V20 und V21 sind aus der App genommen und werden nicht umgezogen.

## Wo was liegt

```
app/inhalte/v07/lerneinheit.mdx        Lerneinheit  -> lektionen/v07-funktionen.html
app/inhalte/v07/labor.mdx              Labor        -> lektionen/v07-labor.html
app/inhalte/v07/lerneinheit/*.py|json  Python und JSON der Lerneinheit (Tests, Lösung, Bewertungsschema)
app/inhalte/v07/labor/*.py|json        Python und JSON des Labors (Startcode, Tests, Lösung, Aufgabendaten)
```

Die Adressen der Seiten bleiben, wie sie in `app/kurs.yaml` stehen. Gibt es die MDX-Datei, ist sie die Quelle; die Seite unter `site/lektionen/` entfällt dann. Lektionen ohne MDX kommen weiter aus `site/lektionen/`.

Namen der Code-Dateien: `<Kennung der Aufgabe>.<Rolle>.py`, zum Beispiel `tr-3.tests.py`, `tr-3.solution.py`, `tr-3.vorlage.py` (Startcode im Editor), `w-trace.daten.json`.

## Kopf der Datei

```yaml
---
titel: V07 Zerlegung & Funktionen · Lerneinheit · Informatik Maschinenbau
beschreibung: "Wellen-Rechner aus Bausteinen: …"
body:                       # Attribute von <body>
  data-lesson: V07
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

Diese Zeichen brauchen im Fließtext einen Rückstrich: `\{ \} \< \* \_ \[ \]`. Ein Absatz darf nicht mit `import` oder `export` beginnen (MDX hält das für Code); der Konverter schreibt dann `&#105;mport`.

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

<Quiz id="v07">

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

<Python rolle="tests" datei="labor/tr-3.tests.py" />
<Editor datei="labor/tr-3.vorlage.py" data-lesson="V07" aria-label="Python-Code Aufgabe 3" />
<Daten datei="labor/w-trace.daten.json" />
```

Bei `<Frage>` stehen `antwort="4"` und `tol="0.1"` für Zahlen- und Ausgabefragen. Die Punktzahl rechts oben („2 Punkte“) entsteht aus `punkte`.

### Seitenrahmen, Pläne, Aufgaben (seit Termin 01)

```mdx
<Lerneinheit nr="V01" name="Termin 01" labor="v01-labor.html">     Inhaltsverzeichnis, Fortschritt und <main> entstehen aus den Abschnitten
<Kopf marke="Termin 01 · 1. Semester · Lerneinheit" titel="…">      erster Absatz = Vorspann, Liste = Lernziele, weitere Absätze = kleiner Hinweis
<Video name="v01-theorie" id="video-theorie" titel="…" fehlt="Video folgt. …">   Dateien: assets/video/<name>.mp4, .vtt, -poster.png
<Weiter ziel="v01-labor.html"> … </Weiter>                          „Wie geht es weiter?“ mit Knopf ins Labor
<Dozent titel="Für Dozierende: …"> … </Dozent>                      eingeklappter Ablaufplan

<Plan titel="Pendelstrecke">          Programmablaufplan als Bild, beim Build gezeichnet; die Seite braucht v05.css

```text
Eingabe: strecke
woche = strecke * 2 * tage
Ausgabe: woche
```

</Plan>

<Labor nr="V01" name="Termin 01" lerneinheit="v01-….html">          Aufgabenliste, Auswahl, Werkzeugkasten-Knopf, Blättern
<Werkzeugkasten> <Syntaxkarte id="sk-print" nr="1" titel="…"> … </Syntaxkarte> </Werkzeugkasten>   in der ersten Station
<Aufgabe art="code" id="tr-1" titel="…" data-mode="code"> … </Aufgabe>   art: trace, parsons, gap, code, run, klausur, pap-zeichnen
<Tipps>      nummerierte Liste der gestuften Hinweise
<Schritte>   nummerierte Liste, die ein vorgerechnetes Beispiel erklärt
<Fehlersuche titel="Pizza teilen" fehler="3 4">   Beschreibung, Programm als ```text, danach die Auflösung
```

Eine Zeile je Symbol im `<Plan>`: „Eingabe: …“ und „Ausgabe: …“ werden Parallelogramme, alles andere ein Rechteck; Start und Ende kommen von selbst. `<Station … data-seen="manual">` zählt erst als angesehen, wenn die Fehlersuche aufgelöst wurde. Vorbelegte Eingaben eines Codeblocks mit mehreren Zeilen: ```` ```python data-stdin="40\n10" ````.

Regeln für neue Terminseiten (Vorgaben vom 2026-11-23):

- **Interaktive Bausteine:** Jeder Termin bekommt wenige, einfache Bausteine zum Ausprobieren (Regler, Schritt-Knopf, Schalter), je Kerninhalt höchstens einen. Sie liegen als `site/assets/js/explorables-vNN.js` mit `site/assets/css/vNN.css` und werden mit `<Explorable name="…">` eingebunden. Der Rechenkern steht oben in der Datei und wird ohne Browser getestet (`app/skripte/tests/termin01.test.mjs` als Muster).
- **Fragen werden gemischt:** `kurs.js` ordnet Quizfragen, ihre Antworten und die Antworten einer `<Vorhersage>` bei jedem Aufruf zufällig an. Deshalb keine Nummern im Titel einer Frage und keine Formulierungen wie „die erste Antwort“ oder „keine der oben genannten“.
- **Plan zuerst:** Jede Programmieraufgabe zeigt oder verlangt einen Plan. Die drei Klausurformen (Plan zeichnen, Plan in Code übertragen, Code lesen) kommen in jedem Labor vor.
- **Jede Musterlösung besteht ihre Tests:** `node skripte/pruefe-loesungen.mjs <Ausgabeordner>` lässt die Lösungen aller Aufgaben der neuen Terminseiten im Browser gegen ihre Tests laufen (auch Lückentexte und gezeichnete Pläne) und ist Teil von `npm run pruefen:alles`.

`<Html>{`…`}</Html>` gibt HTML unverändert aus. Das benutzt nur der Konverter für Stellen, die er nicht umziehen konnte; neu schreibt man so nichts.

Die genaue Ausgabe jedes Bausteins steht in `app/src/lib/mdx/bausteine.mjs` (kurz, ein Baustein je Funktion). Ein neuer Baustein ist eine Funktion dort, die Knoten mit `h('div', {class: '…'}, kinder)` zurückgibt.

## Eine Lektion umziehen

```bash
cd app
node skripte/html-nach-mdx.mjs lektionen/v08-datenstrukturen.html lektionen/v08-labor.html             # nur Bericht
node skripte/html-nach-mdx.mjs lektionen/v08-datenstrukturen.html lektionen/v08-labor.html --schreiben # schreibt app/inhalte/v08/
node skripte/html-nach-mdx.mjs --alle                                                                  # Bericht über alle Lektionen
npm run selbsttest      # solange die alte Seite noch daneben liegt: MDX und Original müssen gleich sein
git rm ../site/lektionen/v08-datenstrukturen.html ../site/lektionen/v08-labor.html
```

Der Konverter versucht jeden Block in der lesbarsten Form (Baustein oder Markdown), übersetzt ihn sofort zurück und vergleicht mit dem Original. Passt es nicht, nimmt er die nächste Stufe: HTML-Element mit umgezogenem Inhalt, zuletzt `<Html>`. Das Ergebnis ist deshalb immer gleich dem Original; der Bericht nennt den Anteil, der noch als `<Html>` übrig ist. Stand 2026-11-23 (vor dem Entfernen der sechs entfallenen Lektionen gemessen): alle 42 Lektionsseiten lassen sich so umziehen, höchstens 11 % einer Seite bleiben roh (V03-Lerneinheit), bei 37 Seiten 0 %.

„Gleich“ heißt (`app/src/lib/mdx/vergleich.mjs`): gleiche Elemente in gleicher Reihenfolge, gleiche Attribute, gleicher Text. Leerraum zählt in `<pre>` und `<textarea>` zeichengenau, im Fließtext als ein Leerzeichen, an Blockgrenzen gar nicht. Python in `<script type="text/x-python">` wird verglichen, wie `aufgaben.js` es liest; JSON nach seinem Wert.

## Prüfen

- `npm run selbsttest`: jede MDX-Lektion lässt sich übersetzen; mit gebautem Stand steht ihr Inhalt genau einmal in der Seite und die Skripte in der richtigen Reihenfolge.
- `npm run pruefen:alles`: wie bisher. Die Browser-Prüfungen unterscheiden nicht, ob eine Seite aus MDX oder aus `site/` kommt.
- Ein Tippfehler in einem Bausteinnamen, eine fehlende Code-Datei oder eine `<Vorhersage>` ohne richtige Antwort bricht den Build mit Dateiname und Zeile ab.

## Noch nicht umgesetzt

- Der Konverter kennt die Bausteine für Seitenrahmen, Video, Plan und Aufgaben noch nicht; umgezogene Altseiten (V07) haben diese Teile deshalb als HTML im MDX.
- Prüfung, dass kein Konstrukt vor seiner Einführung vorkommt.
- Vorschau beim Schreiben (`astro dev`) lädt MDX-Änderungen nicht von selbst neu; geprüft wird der gebaute Stand.
