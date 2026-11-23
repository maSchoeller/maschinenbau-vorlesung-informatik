# infra/

- `main.bicep`, `main.bicepparam`: Ressourcengruppen-Deployment (Static Web App Free, Cosmos DB Serverless, Storage für Videos, Key Vault für den Salt, App-Einstellungen, Budget).
- `module/cosmos.bicep`: Konto, Datenbank `lernapp`, vier Container mit sparsamer Indexierung.
- `module/swa-einstellungen.bicep`: App-Einstellungen zusammenführen, ohne `ANTHROPIC_API_KEY` zu überschreiben; Salt aus dem Tresor bzw. Erstsicherung in den Tresor.
- `bereitstellen.ps1`: Bereitstellung in Schritten (`-Schritt`, Trockenlauf mit `-WhatIf`, Salt-Abgleich mit `-Schritt SaltPruefen`).
- `salt-fall.ps1`, `salt-fall.test.ps1`: Fallunterscheidung für den Salt (Tresor, SWA, neu) und ihr Test ohne Azure (`pwsh ./infra/salt-fall.test.ps1`).
- Automatische Bereitstellung von App und API: `.github/workflows/lernapp.yml` (siehe `docs/app/BETRIEB.md`, Abschnitt 3). Infrastruktur und Videos bleiben bei `bereitstellen.ps1`.

Anleitung, Kosten, Einstellungen und Fehlersuche: `docs/app/BETRIEB.md`.
Prüfen ohne Azure: `az bicep build --file infra/main.bicep` und `az bicep lint --file infra/main.bicep`.
