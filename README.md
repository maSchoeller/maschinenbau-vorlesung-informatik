# Maschinenbau-Vorlesung Informatik

Interaktive Vorlesungs-Website für das Modul **Informatik (T4MB1006)** im Studiengang Maschinenbau, DHBW Stuttgart, Campus Horb (1. Studienjahr).

Leitidee: *KI schreibt Code – Ingenieure spezifizieren, prüfen und verantworten.*

- **Lern-App:** https://nice-wave-051f81f03.3.azurestaticapps.net (installierbar, offline nutzbar, mit Konto, Werkbank und Tutor)
- **Konzept** (Leitsatz, zwei Stränge, 20 Termine, Klausur): [KONZEPT.md](KONZEPT.md), Herleitung und Zuordnung des alten Materials: `KONZEPT-MIGRATION.md`. Der Kursplan für die App steht in `app/kurs.yaml` ([Architektur, Abschnitt 16](docs/app/ARCHITEKTUR.md))
- **Seitenstruktur und Gestaltungsregeln:** [DESIGN.md](DESIGN.md)
- **Lern-App: Architektur und Betrieb:** [docs/app/ARCHITEKTUR.md](docs/app/ARCHITEKTUR.md), [docs/app/BETRIEB.md](docs/app/BETRIEB.md)

## Aufbau

| Ordner | Inhalt |
|---|---|
| `site/` | Die Inhalte: Lektionsseiten, Werkzeuge, Skripte, Medien (statisches HTML, für sich allein lauffähig). Quelle für die Lern-App. |
| `app/` | Lern-App: Build-Schicht über `site/` (Astro) mit gemeinsamer Hülle, Navigation, Konto, Werkbank, Offline-Betrieb. `npm run build`, Gesamtprüfung `npm run pruefen:alles`. |
| `api/` | Azure Functions: Abgleich, Konto, geteilte Programme, Tutor |
| `infra/` | Azure-Infrastruktur (Bicep) und `bereitstellen.ps1` |
| `site/lektionen/` | Pro Termin eine **Lerneinheit** (`vXX-<thema>.html`) und ein **Programmierlabor** (`vXX-labor.html`), solange die Lektion nicht umgezogen ist |
| `app/inhalte/` | Nach MDX umgezogene Lektionen (bisher V07): `vXX/lerneinheit.mdx`, `vXX/labor.mdx` und der Python-Code der Aufgaben als Dateien. Anleitung: [docs/app/INHALTE.md](docs/app/INHALTE.md) |
| `site/notebooks/` | Jupyter-Notebooks zur Vertiefung |
| `site/assets/data/bibliothek.json` | Befehls-Bibliothek (wird aus `tools/editor-build/bibliothek-quelle/` erzeugt und dabei getestet) |
| `video-src/` | Quellen der Erklärvideos (Sprechertext, Render-Skripte) |
| `tools/editor-build/` | Build des Code-Editors (CodeMirror 6) → `site/assets/vendor/codemirror.bundle.js` |
| `.devcontainer/` | GitHub Codespaces mit Python, Jupyter und GitHub Copilot |

## Erklärvideos

Die Videos (Quellen in `video-src/`) werden mit ElevenLabs vertont (Modell `eleven_v3`, Stimme Theo Teacher). Workflow: **Sprechertext → Markup → `sprechfassung()` → `tts()` → Untertitel aus `anzeige()`**. Den Text schreibst du einmal so, wie er auf dem Bildschirm stehen soll (Ziffern, Einheiten, Code in Backticks); wo die Automatik falsch liegt, setzt du `[[Anzeige|Sprechweise]]`. `video-src/common/sprechen.py` macht daraus die Sprechfassung (Zahlen und Einheiten ausgeschrieben, englische Begriffe bleiben englisch, Code wird gesprochen), `tts(text, "audio/s1.mp3")` vertont sie (Schlüssel in `ELEVENLABS_API_KEY`, max. 3000 Zeichen je Aufruf) und legt den gesendeten Text als `s1.sprech.txt` daneben; Untertitel/VTT entstehen immer aus `anzeige(text)`. Kostenlose Vorschau: `python sprechen.py "Text"` bzw. `python sprechfassungen_erzeugen.py` (schreibt `video-src/SPRECHFASSUNGEN.md` mit PRÜFEN-Markierungen). Tests: `video-src/.venv/Scripts/python -m unittest test_sprechen` im Ordner `video-src/common`. Abhängigkeiten: `video-src/requirements.txt`.

## Lokal ansehen

```powershell
python -m http.server 8765 --directory site
```

Dann http://localhost:8765 öffnen. Python im Browser (Pyodide) lädt beim ersten Ausführen einmalig ca. 10 MB aus dem Netz.

Das zeigt die Inhalte ohne die Hülle der Lern-App. Die App selbst lokal bauen und starten: siehe [docs/app/WERKZEUGE.md](docs/app/WERKZEUGE.md).

## Veröffentlichen

Jeder Push auf `main` wird von der GitHub Action `.github/workflows/lernapp.yml` gebaut, geprüft und nach Azure ausgerollt; Pull Requests werden gebaut und geprüft. Neue Videos einmal mit `./infra/bereitstellen.ps1 -Schritt Videos` in den Azure-Speicher laden. Einzelheiten: [docs/app/BETRIEB.md](docs/app/BETRIEB.md).

## Mediendateien

Videos, Audio und Bilder liegen in **Git LFS**. Vor dem Klonen einmal `git lfs install` ausführen. Die GitHub Action holt die Bilder aus LFS; die Videos liegen im Azure-Speicher.

## Für Studierende: Codespaces

Repository auf GitHub öffnen → *Code* → *Codespaces* → *Create codespace on main*. Python, Jupyter und Copilot sind vorinstalliert. Copilot gibt es kostenlos über GitHub Education (Studierendenstatus über die DHBW).
