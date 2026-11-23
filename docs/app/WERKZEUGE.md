# Lern-App: Werkzeuge und Arbeitsregeln für Agenten

Projektwurzel (Git-Worktree, nicht verlassen):
`C:/_Data/01_sourcecode/github/maschinenbau-vorlesung-informatik/.claude/worktrees/interactive-learning-platform-c684cf`
In Git Bash: `/c/_Data/01_sourcecode/github/maschinenbau-vorlesung-informatik/.claude/worktrees/interactive-learning-platform-c684cf`

## Node 22 verwenden (wichtig)

Global ist Node 26 installiert. Damit **hängt der SWA-Emulator** (geprüft), und Azure führt die API mit Node 22 aus. Deshalb gilt für alles in `app/`, `api/`, `tests/`: **Node 22.23.5 aus `.werkzeuge/node22`** benutzen. In jedem Bash-Aufruf zuerst:

```bash
W=/c/_Data/01_sourcecode/github/maschinenbau-vorlesung-informatik/.claude/worktrees/interactive-learning-platform-c684cf
export PATH="$W/.werkzeuge/node22:$W/.werkzeuge/node_modules/.bin:$PATH"
node -v   # muss v22.23.5 zeigen
```

(Der Pfad muss in der Form `/c/...` stehen, nicht `C:/...`, sonst greift er in Git Bash nicht.)
In PowerShell: `$env:PATH = "<Wurzel>\.werkzeuge\node22;<Wurzel>\.werkzeuge\node_modules\.bin;" + $env:PATH`.

Vorhanden:
- `swa` (Azure Static Web Apps CLI 2.1.0) in `.werkzeuge/node_modules/.bin`
- `func` (Azure Functions Core Tools 4.15.2), global
- `az` (Azure CLI 2.88, angemeldet), global. **Agenten legen keine Azure-Ressourcen an und stellen nichts bereit**; das macht die Koordination.
- `python` 3.13, `gh`, `git`

## Lokaler Emulator (geprüft, funktioniert so)

```bash
cd "$W" && swa start app/dist --api-location api --port <PORT> --api-port <API_PORT>
```

- Start dauert 10 bis 30 Sekunden. Als Hintergrundprozess starten und mit kurzen `curl -m 3`-Aufrufen auf `http://localhost:<PORT>/api/status` warten. Keine langen Warteschleifen in einem Befehl (Zeitlimit).
- Anmeldung im Emulator: `http://localhost:<PORT>/.auth/login/github` zeigt ein Formular für eine Testidentität; `/.auth/me` liefert sie; die API bekommt `x-ms-client-principal`.
- Programmiermodell v4 (`@azure/functions` 4.x, `app.http(...)`), Wildcard-Routen wie `eintraege/{*pfad}` funktionieren (geprüft, auch mit `:` und `/` im Pfad).
- `api/local.settings.json` (nicht in Git) mit `FUNCTIONS_WORKER_RUNTIME=node` und den lokalen Einstellungen (`ABLAGE=datei` oder `speicher`, `BENUTZER_SALT=lokal-test`).
- **Jeder Agent benutzt nur die ihm zugewiesenen Ports und beendet am Ende alle von ihm gestarteten Prozesse** (PowerShell: Prozesse zu den eigenen Ports per `Get-NetTCPConnection -LocalPort <PORT> -State Listen` ermitteln und `Stop-Process`). Port 8765 gehört einem fremden Prozess, nicht anfassen.

## Browser-Tests

Playwright mit Chromium (im Projekt installieren, `npx playwright install chromium`). Nur 1440×900 (Desktop) und 1024×768 (Tablet). Kein Handy.

## Regeln

- Nicht committen, nicht pushen, keinen Branch wechseln, kein `git stash`, kein `git checkout` auf Dateien anderer. Nur Dateien im eigenen Zuständigkeitsbereich ändern (siehe `docs/app/ARCHITEKTUR.md`, Abschnitt 2). Wünsche an andere Bereiche nach `docs/app/uebergaben/<rolle>.md`.
- Mediendateien unter `site/assets/video` und `site/assets/img` liegen in Git LFS; nicht verändern.
- Nichts nach außen senden außer Paket-Downloads (npm) und den dokumentierten Fremddateien (Pyodide von jsdelivr, Schriften aus npm-Paketen). Keine Schlüssel, Tokens oder Passwörter anlegen, lesen oder ausgeben.
- Der Rechner ist begrenzt belastbar: keine parallelen Builds oder Browser im selben Agenten, Prozesse nach Gebrauch beenden.
- Abschlussbericht: höchstens 25 Zeilen. Was gebaut wurde, was geprüft wurde (mit Ergebnis), was offen oder unsicher ist, Wünsche an andere Bereiche. Ehrlich: Nicht Geprüftes als nicht geprüft benennen.
