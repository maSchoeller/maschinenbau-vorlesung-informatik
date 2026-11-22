# Auftrag für eine Lektions-Session (je Lektion eine Session, mehrere laufen parallel)

Du baust **genau eine Lektion VXX** der Vorlesungs-Website fertig und veröffentlichst sie. Andere Sessions bauen gleichzeitig die übrigen Lektionen – halte dich strikt an deine Dateien.

## Lesen
1. Deinen Lektionsabschnitt und die allgemeinen Regeln in `briefing/NACHTLAUF-V07-V22.md` (Inhalte sind mit dem Dozenten Marvin abgestimmt).
2. `briefing/UEBERGABE.md`, `KONZEPT.md` (Python-Strang: nur bis zu deiner Lektion eingeführte Konstrukte), `DESIGN.md` (Regeln 1–15), `briefing/LEKTION-BRIEF.md`, `briefing/v05-pap-konzept.md`.
3. Infrastruktur, die du nutzt (nicht änderst): `docs/PAP-EDITOR.md`, `docs/LABOR-ERWEITERUNGEN.md`, `docs/3D-VORSCHAU.md`, `docs/ARCHITEKTUR-BACKEND.md` (Speicherschicht).
4. **Vorlage:** die neuesten fertigen Lektionen V07–V11 (`site/lektionen/v07-*` … `v11-*`) – gleiche Bausteine, Klassen, Skripte, Abschnittsfolge, Labor-Stationen, Training, „Videos zur Nachbereitung“, „Für Dozierende“.
5. Vorgerechnetes Beispiel: `briefing/vXX-beispiel.py` (für V12–V20 vorhanden und geprüft, exakt verwenden; V21/V22 haben keins).

## Arbeitsweise
- Du (Opus) koordinierst und prüfst; Umsetzung durch **Sonnet-Subagenten** (`model: sonnet`) mit klarer Dateizuständigkeit, Bericht je max. 10 Zeilen.
- **Jede Lektion enthält einen PAP-Anteil** (mindestens eine Aufgabe mit dem PAP-Editor bzw. Aufgabentyp „PAP zeichnen“ oder ein PAP zum Code).
- **Zwischenstände sichern:** nach jedem größeren Schritt WIP-Commit auf deinem Branch und `git push origin HEAD` (eigener Branch, nicht `main`) – falls das Nutzungslimit zuschlägt, geht nichts verloren.

## Deine Dateien
Nur: `site/lektionen/vXX-*.html`, `site/notebooks/VXX-*.ipynb`, `site/assets/js/explorables-vXX.js`, `site/assets/css/vXX.css`, eigene Daten unter `site/data/vXX/`, `video-src/vXX-*`, `site/assets/video/vXX-*`, dazu **nur deine eigene Station** in `site/index.html` (freischalten, Titel, Link) und **neue eigene Einträge** in der Befehls-Bibliothek (`site/assets/data/bibliothek.json` + Quelle unter `tools/editor-build/bibliothek-quelle/`, nur anhängen). Hook-Bild `site/assets/img/vXX-hook.*` liegt schon vor.
**Nicht ändern:** gemeinsame JS/CSS (`editor.js`, `aufgaben.js`, `kurs.js`, `labor.js`, Speicherschicht, PAP-Engine/-Editor, 3D-Vorschau …), andere Lektionen, `KONZEPT.md`, `DESIGN.md`, `UEBERGABE.md`. Brauchst du dort eine Änderung oder findest einen Fehler: in `briefing/berichte/vXX.md` beschreiben und, wenn möglich, lektionsintern umgehen.

## Videos
ElevenLabs-Credits sind aufgebraucht: **keine Vertonung**. Für alle drei Videos (`vXX-theorie`, `-python`, `-beispiel`) Szenen, Texte, Sprechfassungen und `render.py` fertig vorbereiten (Pipeline wie V07–V11, PAP-Grafiken mit `video-src/v05-common/pap.py`), damit später nur noch vertont und gerendert werden muss. Die Seiten zeigen „Video folgt“.

## Prüfen
Musterlösungen bestehen ihre Tests (Skript), Lerneinheit + Labor bei 1600/375 px ohne horizontales Scrollen, Konsole ohne JS-Fehler, je eine Code-Aufgabe, Parsons, Selbstcheck und PAP-Aufgabe durchspielen, Emoji-Scan = 0. Eigener Port (`81XX`, XX = Lektionsnummer), eigener Browser-Tab, Cache mit `?v=…` umgehen, Server danach beenden.

## Veröffentlichen (vom Dozenten erlaubt, sobald die Prüfung grün ist)
`git fetch origin && git rebase origin/main` (Konflikte in `index.html`/`bibliothek.json`: beide Seiten behalten), Musterlösungs-Tests erneut, `git push origin HEAD:main` (bei Ablehnung erneut fetch/rebase/push), Deploy mit `gh run watch` abwarten, online prüfen (Seiten 200, Station auf der Startseite freigeschaltet). Kein Force-Push. Commit-Trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Abschluss
`briefing/berichte/vXX.md` (max. 30 Zeilen: was gebaut, eigene Entscheidungen, offene Fragen an Marvin, bekannte Mängel, vorbereitete Videos) mit veröffentlichen. Abschlussbericht im Chat max. 10 Zeilen.
