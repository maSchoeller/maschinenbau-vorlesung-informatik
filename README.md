# Maschinenbau-Vorlesung Informatik

Interaktive Vorlesungs-Website für das Modul **Informatik (T4MB1006)** im Studiengang Maschinenbau, DHBW Stuttgart, Campus Horb (1. Studienjahr).

Leitidee: *KI schreibt Code – Ingenieure spezifizieren, prüfen und verantworten.*

- **Website:** https://maschoeller.github.io/maschinenbau-vorlesung-informatik/
- **Konzept** (Leitidee, Wissens-Ampel, 22 Termine, Ablauf): [KONZEPT.md](KONZEPT.md)
- **Seitenstruktur und Gestaltungsregeln:** [DESIGN.md](DESIGN.md)

## Aufbau

| Ordner | Inhalt |
|---|---|
| `site/` | Die Website (statisch, kein Build-Schritt). Wird per GitHub Actions auf GitHub Pages veröffentlicht. |
| `site/lektionen/` | Pro Termin eine **Lerneinheit** (`vXX-<thema>.html`) und ein **Programmierlabor** (`vXX-labor.html`) |
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

## Mediendateien

Videos, Audio und Bilder liegen in **Git LFS**. Vor dem Klonen einmal `git lfs install` ausführen. Der Pages-Workflow checkt LFS-Dateien mit aus, damit die Website die echten Dateien ausliefert.

## Für Studierende: Codespaces

Repository auf GitHub öffnen → *Code* → *Codespaces* → *Create codespace on main*. Python, Jupyter und Copilot sind vorinstalliert. Copilot gibt es kostenlos über GitHub Education (Studierendenstatus über die DHBW).
