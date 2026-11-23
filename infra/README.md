# infra/

- `main.bicep`, `main.bicepparam`: Ressourcengruppen-Deployment (Static Web App Free, Cosmos DB Serverless, Storage für Videos, App-Einstellungen, Budget).
- `module/cosmos.bicep`: Konto, Datenbank `lernapp`, vier Container mit sparsamer Indexierung.
- `module/swa-einstellungen.bicep`: App-Einstellungen zusammenführen, ohne Salt und `ANTHROPIC_API_KEY` zu überschreiben.
- `bereitstellen.ps1`: Bereitstellung in Schritten (`-Schritt`, Trockenlauf mit `-WhatIf`).
- `github-action-beispiel.yml`: vorbereiteter Workflow, noch nicht aktiv.

Anleitung, Kosten, Einstellungen und Fehlersuche: `docs/app/BETRIEB.md`.
Prüfen ohne Azure: `az bicep build --file infra/main.bicep` und `az bicep lint --file infra/main.bicep`.
