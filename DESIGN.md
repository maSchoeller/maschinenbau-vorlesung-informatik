# Seitenstruktur und Gestaltungsregeln

Gilt für alle 22 Termine. Ziel: ruhig, übersichtlich, DHBW-Stil – Inhalt statt Kacheln.

## Seitenstruktur pro Termin

Jeder Termin hat zwei Seiten:

**Erklärvideos:** 2–3 pro Termin (je ca. 3 Min, mit Untertiteln): Theorie in der Lerneinheit, Python-Werkzeugkasten und vorgerechnetes Beispiel im Labor (an der jeweiligen Station). Fehlt eine Datei, erscheint „Video folgt“.

### 1. Lerneinheit `lektionen/vXX-<thema>.html` – verstehen
Lineares Lesestück wie ein gutes Lehrbuchkapitel.
1. Warum? – Hook + Wissens-Ampel
2. Theorie – Video, Explorables, Lesetext
3. Ausprobieren – kurze Vorhersage-Snippets direkt im Text
4. Selbstcheck – Quiz im Klausurformat
5. Deep Dive (freiwillig, eingeklappt)
Am Ende ein kurzer Abschnitt „Videos zur Nachbereitung“ (Liste aller Videos des Termins mit Länge und Link), dann ein klarer Übergang: „Weiter ins Programmierlabor →“.
„Für Dozierende“ eingeklappt ganz unten.

### 2. Programmierlabor `lektionen/vXX-labor.html` – selbst programmieren
Arbeitsumgebung wie eine IDE: immer **eine Aufgabe** im Blick statt einer langen Seite.
- Teil A „Im Labor“ (Präsenz): Werkzeugkasten (Syntax-Karten) · Vorgerechnetes Beispiel · Ablauf verfolgen · Zeilen ordnen · Lücken füllen · Erste eigene Aufgabe · Code-Review (KI-Spiegel) · Typische Fehlermeldungen
- Teil B „Training zu Hause“ (~60 Min): gestufte Aufgaben (1 bis 4 Sterne), eine Wiederholungsaufgabe, eine Klausur-Modus-Aufgabe, Notebook-Link

Layout Desktop (≥ 1100 px), drei Spalten:
- links (ca. 260 px, sticky): Aufgabenliste in zwei Gruppen (Im Labor / Training zu Hause) mit Status (Symbole) offen · begonnen · gelöst, Sterne (SVG), Gesamtfortschritt
- Mitte: aktuelle Aufgabe – Titel, Aufgabenstellung, ggf. eingeklappter Werkzeugkasten-Hinweis, Editor, Knöpfe (Ausführen · Prüfen · Tipp · Lösung), Ausgabe/Testergebnisse; unten „← Zurück · Weiter →“
- rechts (ca. 340 px): Befehls-Bibliothek angedockt (nicht als Overlay), einklappbar
Tablet: Bibliothek als Overlay. Mobil: Aufgabenliste als Auswahlmenü oben, Bibliothek als Bottom-Sheet.
Arbeitsfläche ca. 90 % der Fensterbreite (zentriert); die Editor-Spalte bekommt den Zuwachs, Editor mindestens ca. 18 Zeilen hoch.
Jede Aufgabe hat einen Anker (`#a-werkzeugkasten`, `#t-3` …) – Deep-Links und Zurück-Taste funktionieren.

## Gestaltungsregeln

1. **Höchstens eine Rahmen-Ebene.** Keine Karte in einer Karte, keine Box in einer Box. Abschnitte trennt Weißraum und eine Überschrift, nicht ein Rahmen.
2. **Karten nur für anklickbare Dinge** (Lernpfad-Stationen, Aufgaben in der Liste). Inhalte stehen frei auf der Seite.
3. **Genau drei Hinweis-Typen**: Merke · Achtung · Warum muss ich das wissen? – jeweils linke Linie (3 px) + sehr heller Hintergrund, kein umlaufender Rahmen, kein Schatten.
4. **Rot sparsam**: Links, aktiver Zustand, ein primärer Knopf pro Bereich, Akzentlinien. Erfolg = Grün, Fehler = dunkles Rot mit Symbol (nicht nur Farbe).
5. **Keine Emojis; Icons nur als SVG aus dem zentralen Sprite** (`assets/img/icons.svg`, Nutzung per `<use href=…#i-…>` oder `KIcon()` aus `assets/js/icons.js`; Raster 24, Strich 1.75, `currentColor`, `aria-hidden`, Text daneben bleibt). Keine Deko-Icons.
6. **Typografie**: h1 2rem, h2 1.5rem, h3 1.125rem; Fließtext 1.0625rem, Zeilenlänge max. 93 Zeichen; Medien (Video, Explorables, Code) dürfen breiter sein.
7. **Abstände**: zwischen Abschnitten 64 px, zwischen Blöcken 24 px. Kein Abschnitt beginnt mit einer Liste von Badges.
8. **Code** ist der einzige dunkle Block. Jeder Codeblock und jeder Editor hat oben rechts einen **Kopieren-Knopf** (Symbol + „Kopieren“ → „Kopiert“ mit Haken-Icon, per aria-live angesagt). Optional Sprach-Label „Python“.
9. **Knöpfe**: primär (rot gefüllt) höchstens einer pro Bereich, sonst sekundär (Kontur) oder Textlink.
10. **Nummerierung**: Abschnitte ja (1, 2, 3), Unter-Nummern (3.1, 3.2) nein.
11. **Mobil zuerst prüfen**: 375 px ohne horizontales Scrollen, Bedienelemente ≥ 44 px.

## Didaktische Regeln für Code

12. **Jeder angezeigte Python-Code ist ausführbar** – auch Syntax-Karten, Beispiele im Lesetext und Bibliothekseinträge: Editor mit Highlighting und Autovervollständigung, „Ausführen“, „Zurücksetzen“, „Schritt für Schritt“, Kopieren. Einzelne Ausdrücke zeigen ihr Ergebnis wie in der Python-Konsole (`int("42")` → `42`). Enthält der Code `input()`, erscheint ein Feld für die Eingaben. Nicht ausführbar sind nur Ausgaben, Tracebacks und Pseudocode/Programmablaufpläne – sie tragen `data-run="no"`.
13. **Kein Code vor seiner Einführung.** Eine Lerneinheit zeigt nur Python-Konstrukte, die laut Python-Strang (KONZEPT.md) bis zu diesem Termin eingeführt sind. Braucht die Theorie trotzdem ein neues Konstrukt, gilt eins von dreien: (a) abstrakt bleiben (Worte, Grafik, Animation statt Code), (b) das Konstrukt in ein, zwei Sätzen kurz einführen, (c) auf die Labor-Station verlinken, an der es eingeführt wird („Das schauen wir uns im Labor genauer an →“). Fremde Module und noch nicht eingeführte Konstrukte (z. B. `def`, `struct`, Schleifen vor V06) gehören höchstens in den Deep Dive, dort mit Hinweis.
14. **Mechanismen sichtbar machen.** Wo ein Ablauf im Rechner passiert (Speicher, Zuweisung, Verzweigung, Schleife, Funktionsaufruf und Aufrufstapel, Listen und Referenzen), zeigt eine kleine schrittweise Animation oder der Schritt-für-Schritt-Visualisierer, was passiert. Lieber eine anschauliche Animation als ein weiterer Absatz Text.
15. **Kein Vorwissen voraussetzen.** Zielgruppe sind Maschinenbau-Studierende ohne jeden Informatik-Unterricht. Jeder Fachbegriff (Bit, Byte, Binär, Speicher, Prozessor, Interpreter, Datentyp, Variable, Syntax, Bibliothek/Modul …) wird bei seinem ersten Auftreten in einer Lerneinheit bzw. einem Labor erklärt – entweder im Satz selbst oder als Begriffs-Hinweis: `<abbr class="k-begriff" data-erklaerung="Ein Bit ist die kleinste Informationseinheit: 0 oder 1, wie ein Schalter aus oder an.">Bit</abbr>`. Der Hinweis erscheint per Klick/Fokus/Hover als kleines Popover (1–2 Sätze, Alltagsvergleich aus der Technik), auch auf dem Handy. Begriffe aus früheren Lektionen dürfen erneut einen Hinweis bekommen – lieber einmal zu oft als einmal zu wenig.
