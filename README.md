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

## Lokal ansehen

```powershell
python -m http.server 8765 --directory site
```

Dann http://localhost:8765 öffnen. Python im Browser (Pyodide) lädt beim ersten Ausführen einmalig ca. 10 MB aus dem Netz.

## Mediendateien

Videos, Audio und Bilder liegen in **Git LFS**. Vor dem Klonen einmal `git lfs install` ausführen. Der Pages-Workflow checkt LFS-Dateien mit aus, damit die Website die echten Dateien ausliefert.

## Für Studierende: Codespaces

Repository auf GitHub öffnen → *Code* → *Codespaces* → *Create codespace on main*. Python, Jupyter und Copilot sind vorinstalliert. Copilot gibt es kostenlos über GitHub Education (Studierendenstatus über die DHBW).
