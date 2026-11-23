# Briefing: neue Lektion nach dem Muster von V03

> **Stand 2026-11-23:** Lektionen ziehen nach MDX um. Ist eine Lektion umgezogen (bisher V07), liegt ihre Quelle unter `app/inhalte/vXX/` und nicht mehr unter `site/lektionen/`; geschrieben und geprüft wird sie nach `docs/app/INHALTE.md`. Dieses Briefing gilt unverändert für Lektionen, die noch unter `site/lektionen/` liegen.

Repo-Wurzel: dieses Verzeichnis. Website in `site/`. Verbindlich: `KONZEPT.md` (Tabelle „22 Termine“: Informatik-Strang, Python-Strang, Hook), `DESIGN.md` (Seitenstruktur, Gestaltungsregeln, keine Emojis, SVG-Icons aus `site/assets/img/icons.svg` / `assets/js/icons.js`).

**Vorlage:** V03 ist fertig und vom Dozenten abgenommen. Baue die neue Lektion strukturell exakt so: `site/lektionen/v03-fliesskommazahlen.html` (Lerneinheit) und `site/lektionen/v03-labor.html` (Programmierlabor), `site/notebooks/V03-Fliesskommazahlen.ipynb`. Gleiche Bausteine, Klassen, Skripte, Abschnittsfolge, Labor-Stationen (Werkzeugkasten · Vorgerechnetes Beispiel · Ablauf verfolgen · Zeilen ordnen · Lücken füllen · Erste eigene Aufgabe · Code-Review · Typische Fehlermeldungen) und Training zu Hause (6–8 gestufte Aufgaben inkl. 1 Wiederholung früherer Konzepte – entfällt bei V01 – und 1 Klausur-Modus-Aufgabe), „Videos zur Nachbereitung“, „Für Dozierende“ mit Ablaufplan 135 Min.

**Nur Konzepte verwenden, die bis zu dieser Lektion eingeführt sind** (Python-Strang-Spalte). Beispiel: In V01 gibt es noch keine Typumwandlung (V03), kein `**` (V02), kein if (V04). `input()` liefert in V01/V02 nur Text.

**Didaktische Pflichtregeln (DESIGN.md 12–15):** Jeder Python-Codeblock ist ausführbar (automatisch; Ausgaben/Tracebacks/Pseudocode mit `data-run="no"`, input-Code mit `data-stdin`), einzelne Ausdrücke zeigen ihr Ergebnis wie in der Konsole. Kein Code vor seiner Einführung (abstrakt bleiben, kurz einführen oder auf die Labor-Station verlinken). Abläufe (Speicher, Zuweisung, Verzweigung, Schleife, Aufrufstapel) mit Animation bzw. „Schritt für Schritt“-Visualisierer (`KursViz`) sichtbar machen. Kein Vorwissen voraussetzen: jeden Fachbegriff beim ersten Auftreten erklären, gern als `<abbr class="k-begriff" data-erklaerung="…">Begriff</abbr>`.

**Dateizuständigkeit:** Du legst nur Dateien deiner Lektion an: `site/lektionen/vXX-<thema>.html`, `site/lektionen/vXX-labor.html`, `site/notebooks/VXX-<Thema>.ipynb`, optional `site/assets/js/explorables-vXX.js` und `site/assets/css/vXX.css` für lektionsspezifische Explorables. NICHT ändern: gemeinsame CSS/JS-Dateien, `index.html`, `bibliothek.html`, `assets/data/bibliothek.json`, V03-Dateien, `site/assets/video/`, `site/assets/img/`. Brauchst du dort eine Änderung (z. B. Fehler in gemeinsamem JS, fehlender Bibliothekseintrag), beschreibe sie im Bericht statt sie selbst zu machen.

**Videos und Bilder** entstehen parallel. Binde mit festen Namen und dem bestehenden „Video folgt“-Fallback ein:
- Lerneinheit Theorie: `../assets/video/vXX-theorie.mp4` (+ `vXX-theorie-poster.png`, `vXX-theorie.vtt`)
- Labor Werkzeugkasten: `vXX-python.mp4` (+ `-poster.png`, `.vtt`)
- Labor Vorgerechnetes Beispiel: `vXX-beispiel.mp4` (+ `-poster.png`, `.vtt`)
- Hook-Bild: `../assets/img/vXX-hook.png` und `.webp` (per `<picture>`, onerror ausblenden)

**Vorgerechnetes Beispiel:** Nutze exakt den Code aus `briefing/vXX-beispiel.py` (das Video erklärt genau diesen Code).

**Qualität:** Deutsch, Du-Ansprache, fachlich exakt. Jede Musterlösung muss ihre Tests bestehen – prüfe lokal mit Python per Skript. Selbstcheck im Stil der Probeklausur (https://raw.githubusercontent.com/maSchoeller/maschinenbau-vorlsung-25_26/main/klausur/Probeklausur-Grundlagen-Informatik.html, nur das Nötige lesen). Vorjahresskripte zum Wiederverwenden von Fachinhalt: https://raw.githubusercontent.com/maSchoeller/maschinenbau-vorlsung-25_26/main/lessons/<Ordner>/<Ordner>_skript.md (V01-Binaeres-Zahlensystem).

**Prüfen:** eigener Port (siehe Auftrag) `python -m http.server <port> --directory site` im Hintergrund, im eingebauten Browser Lerneinheit und Labor bei 1600 px und 375 px ansehen, je eine Code-Aufgabe, einen Parsons und den Selbstcheck durchspielen, Konsole ohne JS-Fehler (404 für noch fehlende Videos/Bilder sind ok), Emoji-Scan = 0. Server-Prozess danach wirklich beenden. Nicht committen.

**Bericht:** max. 10 Zeilen.
