# Lektionen als MDX schreiben

Stand: 2026-11-23. Gilt für Lektionen, die nach MDX umgezogen sind (bisher V07 als Pilot). Vertrag: `docs/app/ARCHITEKTUR.md`, Abschnitt 15.

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

Der Konverter versucht jeden Block in der lesbarsten Form (Baustein oder Markdown), übersetzt ihn sofort zurück und vergleicht mit dem Original. Passt es nicht, nimmt er die nächste Stufe: HTML-Element mit umgezogenem Inhalt, zuletzt `<Html>`. Das Ergebnis ist deshalb immer gleich dem Original; der Bericht nennt den Anteil, der noch als `<Html>` übrig ist. Stand 2026-11-23: alle 42 Lektionsseiten lassen sich so umziehen, höchstens 11 % einer Seite bleiben roh (V03-Lerneinheit), bei 37 Seiten 0 %.

„Gleich“ heißt (`app/src/lib/mdx/vergleich.mjs`): gleiche Elemente in gleicher Reihenfolge, gleiche Attribute, gleicher Text. Leerraum zählt in `<pre>` und `<textarea>` zeichengenau, im Fließtext als ein Leerzeichen, an Blockgrenzen gar nicht. Python in `<script type="text/x-python">` wird verglichen, wie `aufgaben.js` es liest; JSON nach seinem Wert.

## Prüfen

- `npm run selbsttest`: jede MDX-Lektion lässt sich übersetzen; mit gebautem Stand steht ihr Inhalt genau einmal in der Seite und die Skripte in der richtigen Reihenfolge.
- `npm run pruefen:alles`: wie bisher. Die Browser-Prüfungen unterscheiden nicht, ob eine Seite aus MDX oder aus `site/` kommt.
- Ein Tippfehler in einem Bausteinnamen, eine fehlende Code-Datei oder eine `<Vorhersage>` ohne richtige Antwort bricht den Build mit Dateiname und Zeile ab.

## Noch nicht umgesetzt

- Rahmen der Seite (Inhaltsverzeichnis der Lerneinheit, Aufgabenliste des Labors, Seitenkopf), Video, Bild, Wissens-Ampel, Deep Dive, „Für Dozierende“ und die Aufgabentypen des Labors stehen noch als HTML im MDX. Dafür fehlen Bausteine.
- Prüfung im Build, dass jede Musterlösung ihre Tests besteht und kein Konstrukt vor seiner Einführung vorkommt.
- Vorschau beim Schreiben (`astro dev`) lädt MDX-Änderungen nicht von selbst neu; geprüft wird der gebaute Stand.
