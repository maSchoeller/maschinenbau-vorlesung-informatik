# Lern-App: Betrieb

Stand: 2026-11-22. Für den Besitzer des Azure-Abos (Visual Studio Subscription, 150 USD Guthaben im Monat) und die Koordination. Architektur: `docs/app/ARCHITEKTUR.md`, Abschnitte 6 und 13.

## 1. Ressourcen

Alle in der Ressourcengruppe `rg-informatik-lernapp`, angelegt durch `infra/main.bicep`:

| Ressource | Name (Muster) | Region | Tarif |
|---|---|---|---|
| Static Web App (Seiten, Login, API) | `lernapp-swa-<6 Zeichen>` | West Europe | Free, ohne Repository-Verknüpfung |
| Cosmos DB for NoSQL | `lernapp-cosmos-<8 Zeichen>` | Germany West Central (Rückfall West Europe) | Serverless, Continuous Backup 7 Tage |
| Storage-Konto (Videos) | `lernappvid<…>` | wie Cosmos | Standard_LRS, StorageV2, TLS 1.2 |
| Budget | `lernapp-budget-monat` | – | 30 in der Abrechnungswährung des Abos (bei einem in Deutschland geführten VS-Abo meist EUR, nicht am Abo geprüft), Warnung bei 50/80/100 % (Ist) und 100 % (Prognose) |

Cosmos-Datenbank `lernapp` mit den Containern `eintraege` (Partition `/benutzerId`), `benutzer`, `geteilt`, `zaehler` (je `/id`; `zaehler` mit 8 Tagen TTL). Indiziert werden nur die abgefragten Felder (`geloescht`, `benutzerId`; `id` und `_ts` sind immer indiziert); `wert` und `code` nie. Löschmarken in `eintraege` verfallen nach 180 Tagen (`ttl` am Dokument). In `zaehler` liegen neben den Tageszählern die Kontozähler `konto:<benutzerId>` (lebende Einträge, Bytes, geteilte Programme; `ttl: -1`, verfallen also nicht).

Grenzen je Konto (atomar über den Kontozähler, auch bei parallelen Anfragen): 5000 lebende Einträge (Löschmarken zählen nicht), 10 MB Eintragswerte, 50 geteilte Programme, 64 KB je Eintrag, 256 KB je Anfrage.

Storage: nur der Container `video` ist anonym lesbar (einzelne Blobs, keine Auflistung). Schlüsselzugriff (Shared Key) ist abgeschaltet; hochgeladen wird mit Entra-Anmeldung (`--auth-mode login`) und der Rolle „Storage Blob Data Contributor“, die das Deployment der angemeldeten Person zuweist. CORS erlaubt GET/HEAD nur von der SWA-Adresse (für den Service Worker, der Videos auf Wunsch offline speichert).

## 2. Kosten (Schätzung)

| Baustein | Annahme | Kosten/Monat | Quelle |
|---|---|---|---|
| Static Web Apps Free | Hosting, Login, verwaltete Functions, 100 GB Bandbreite | 0 USD | learn.microsoft.com/azure/static-web-apps/plans, …/quotas |
| Cosmos DB Serverless | ca. 100 Studierende, 1 bis 2 Mio. RU, unter 1 GB | ca. 0,30 bis 0,80 USD | 0,25 USD je Mio. RU und je GB: learn.microsoft.com/azure/cosmos-db/understand-your-bill |
| Continuous Backup 7 Tage | – | 0 USD (Wiederherstellung kostet 0,15 USD/GB) | learn.microsoft.com/azure/cosmos-db/continuous-backup-restore-introduction#pricing |
| Storage (Videos) | 23 Videos, 106 MB | wenige Cent | Preis je GB nicht belegt |
| Ausgehender Verkehr (Videos) | 100 Studierende sehen alles einmal: ca. 11 GB | 0 USD (erste 100 GB im Monat frei) | learn.microsoft.com/azure/networking/design-guide/internet-ingress (Kostentabelle) |
| Tutor (Anthropic) | läuft über das API-Guthaben, nicht über Azure | – | `docs/app/recherche/04-claude-api-tutor.md` |
| **Summe Azure** | | **unter 2 USD** | |

Das Budget zählt Bruttokosten: Das VS-Guthaben ist in Cost Management nicht abgezogen. Die Warnung kann also auslösen, obwohl die Rechnung durch das Guthaben null ist (recherche/02, Abschnitt 5). Das Budget **warnt nur, es stoppt nichts**. Hart greift erst das Ausgabenlimit des VS-Abos (150 USD): Ist das Guthaben verbraucht, schaltet Azure alle Ressourcen des Abos bis zum nächsten Abrechnungsmonat ab, also auch die Lern-App. Deshalb gibt es die Mengenbremse und die Notbremsen unten.

### Hauptrisiko: Bandbreite der Static Web App (100 GB, ohne Zukauf)

Im Free-Tarif sind 100 GB ausgehender Verkehr im Monat enthalten; mehr lässt sich nicht zukaufen (learn.microsoft.com/azure/static-web-apps/quotas: „Overage bandwidth: Unavailable“). Über die SWA laufen Seiten, Precache und Pyodide, nicht die Videos (Storage).

| Vorgang | Menge | Verkehr |
|---|---|---|
| Erstinstallation je Gerät: Pyodide | ca. 83 MB (recherche/03) | 200 Geräte (100 Studierende × 2): ca. 17 GB |
| Erstinstallation je Gerät: Precache (HTML, CSS, JS, Bilder, Daten) | ca. 26 MB | 200 Geräte: ca. 5 GB |
| **jede Bereitstellung** (neue Build-Version, Precache wird neu geladen) | ca. 26 MB je Gerät | 200 Geräte: ca. 5 GB |
| Seitenaufrufe, API | klein | wenige GB |

Grob: Erstinstallation ca. 22 GB, danach etwa 5 GB je Bereitstellung. Mehr als etwa 12 Bereitstellungen im Monat bei voll installiertem Kurs sprengen die 100 GB. Deshalb: gesammelt ausrollen (z. B. einmal je Termin), die GitHub-Action ist nur von Hand auslösbar. Wunsch an die PWA-Rolle: Precache je Datei versionieren, damit nur Geänderte neu geladen werden (siehe `uebergaben/api.md`). Beobachten: Portal → Static Web App → Überwachung → Metriken, ausgehende Daten (Metrikname im Portal nicht geprüft).

### Kostenbremsen in der API

- **Mengenbremse** (alle Routen außer Tutor und Status): je Konto und Tag 5000 Punkte, kursweit 200 000, anonyme Abrufe geteilter Programme kursweit 50 000. Ein Punkt ist eine Anfrage oder angefangene 16 KB in Anfrage und Antwort. Ein Tab, der jede Minute abgleicht, braucht an einem langen Tag ca. 600 Punkte. Danach 429 `mengenbremse` bis Mitternacht (deutsche Zeit). Einstellungen `MENGE_LIMIT_NUTZER_TAG`, `MENGE_LIMIT_KURS_TAG`, `MENGE_LIMIT_ANONYM_TAG` (nicht von Bicep verwaltet; per `az staticwebapp appsettings set` änderbar, bleiben beim Deployment erhalten). Gezählt wird gesammelt je Function-Instanz (je 50 Punkte ein Schreibvorgang), die Grenze ist also auf etwa 50 Punkte je Instanz genau.
- Grobe Obergrenze bei Missbrauch (Schätzung, nicht gemessen): Ist die Kursgrenze jeden Tag ausgeschöpft und kostet ein Punkt etwa 10 RU, sind das 2 Mio. RU am Tag, ca. 0,50 USD am Tag bzw. 15 USD im Monat. Der Preis dafür: Mit etwa 40 Missbrauchskonten lässt sich der Abgleich des Kurses für einen Tag blockieren (die App arbeitet lokal weiter und gleicht am nächsten Tag ab).
- **Speichergrenzen je Konto** (5000 lebende Einträge, 10 MB Werte, 50 geteilte Programme): atomar über den Kontozähler `konto:<benutzerId>` im Container `zaehler` (bedingtes Patch), auch bei parallelen Anfragen. Bekannte Unschärfe: Ist die Grenze erreicht, zählt der Server höchstens alle 10 Minuten nach; Reservierungen, die in diesem Moment noch nicht geschrieben sind, gehen dabei verloren. Ein Konto kann die Grenze so einmalig um die Menge gleichzeitig laufender Anfragen überschreiten (begrenzt durch die Mengenbremse), danach greift sie wieder.
- Tutor: eigene Kontingente (40 je Konto, im Kurs 600 je Tag laut `infra/main.bicepparam`, ohne Einstellung 1500) und das Ausgabenlimit in der Anthropic-Konsole (Abschnitt 4).
- **Betriebsrisiko Wegwerf-Konten:** Anmelden kann sich jedes GitHub-Konto. Ohne Freischaltung reichen bei einem Kurskontingent von 600 Fragen 15 Konten, um den Tutor für den ganzen Kurs bis Mitternacht zu sperren. Deshalb vor dem Semester `KURS_CODE` setzen (Abschnitt 5) und den Code in der Vorlesung bzw. im Moodle-Kurs nennen: Der Tutor verlangt dann einmal je Konto den Kurscode (höchstens 10 Versuche je Konto und Tag). Wird der Code weitergegeben, einen neuen setzen; bereits freigeschaltete Konten bleiben freigeschaltet. Die Mengenbremse bleibt bewusst kursweit (Kostenschutz, siehe oben); sie trifft nur den Abgleich, die App arbeitet lokal weiter.

### Videos aus dem öffentlichen Storage

Die Videos (ca. 108 MB) sind ohne Login abrufbar. Die ersten 100 GB ausgehender Verkehr im Monat sind frei, danach wird nach Menge abgerechnet. Ein Skript, das die Videos sehr oft abruft, verursacht Kosten; eine Begrenzung gibt es dafür nicht (bewusst akzeptiert, das Budget warnt). Notbremse siehe Abschnitt 6.

## 3. Bereitstellen

Voraussetzungen: PowerShell 7, `az` (angemeldet: `az login`, richtiges Abo: `az account set --subscription <Name>`), Node 22 in `.werkzeuge/node22`, SWA-CLI in `.werkzeuge/node_modules/.bin`, Videos per Git LFS geladen (`git lfs pull`).

```powershell
# 1. Trockenlauf: zeigt, was angelegt würde (az deployment group what-if), legt nichts an
./infra/bereitstellen.ps1 -BudgetEmail <adresse> -WhatIf

# 2. Alles (Gruppe, Bicep, Videos, Bauen, Ausrollen, Rauchtest)
./infra/bereitstellen.ps1 -BudgetEmail <adresse>

# Einzelne Schritte, z. B. nach Inhaltsänderungen:
./infra/bereitstellen.ps1 -Schritt Bauen,Ausrollen,Rauchtest
./infra/bereitstellen.ps1 -Schritt Videos          # nur neue oder geänderte Videos
```

Schritte: `Pruefen` → `Gruppe` (idempotent) → `Infrastruktur` (Deployment-Name `lernapp-main`; liest vorher das Startdatum eines vorhandenen Budgets aus und gibt es unverändert weiter) → `Videos` (vergleicht MD5 im Blob-Metadatum `md5`, lädt nur Abweichendes; im Trockenlauf nur ein Versuch, bei fehlendem Zugriff eine Warnung) → `Bauen` (`app/` mit `VIDEO_BASIS` aus der Bicep-Ausgabe) → `Ausrollen` (baut das API-Paket in einem Temp-Ordner, siehe unten, und ruft `swa deploy app/dist --api-location <Paket> --swa-config-location app/dist --api-language node --api-version 22 --env production`; der Deployment-Token wird per `az staticwebapp secrets list` geholt, nur in einer Variablen gehalten und über `SWA_CLI_DEPLOYMENT_TOKEN` übergeben) → `Rauchtest` (`api/skripte/rauchtest.mjs`).

**API-Paket:** Hochgeladen wird nicht `api/` selbst, sondern eine Kopie mit nur `host.json`, `package.json`, `package-lock.json`, `src/`, `daten/` und den Laufzeit-Abhängigkeiten (`npm ci --omit=dev`). Lokale Testdaten (`api/.daten/`), `local.settings.json`, `tests/` und `skripte/` sind so nie im Paket, unabhängig davon, ob `swa deploy` die `.funcignore` beachtet. `./infra/bereitstellen.ps1 -Schritt Paket` baut und prüft das Paket ohne Azure und zeigt den Inhalt. `api/daten/aufgaben.json` (Musterlösungen) gehört absichtlich dazu; verwaltete Functions liefern sie nicht als statische Datei aus.

**Grenze des Trockenlaufs:** `what-if` wertet das Modul `swa-einstellungen` nicht aus (bekanntes Verhalten bei verschachtelten Deployments, deren Parameter `reference()` enthalten; Azure/arm-template-whatif#157). Fehler in `listAppSettings()`, `listConnectionStrings()` und der Zusammenführung zeigen sich erst beim echten Deployment. Deshalb nach dem Erstdeployment die Namen der Einstellungen prüfen (das Skript zeigt sie an).

Ist Cosmos Serverless in Germany West Central nicht verfügbar (Fehler im what-if oder Deployment): `-DatenRegion westeurope`. Achtung: Die Region eines bestehenden Cosmos-Kontos lässt sich nicht nachträglich ändern; das gilt nur für die Erstanlage.

Erneutes Deployment ist gefahrlos: Einstellungen, die nicht von Bicep stammen (insbesondere `ANTHROPIC_API_KEY`), und der vorhandene `BENUTZER_SALT` bleiben erhalten (siehe Abschnitt 5).

Rauchtest von Hand: `node api/skripte/rauchtest.mjs https://<host> --erwarte-ablage=cosmos [--erwarte-tutor]`.

Später per GitHub Action: `infra/github-action-beispiel.yml` (bewusst nicht aktiv; Hinweise im Kopf der Datei).

## 4. API-Schlüssel für den Tutor setzen (Besitzer)

1. In der Anthropic-Konsole einen eigenen Schlüssel nur für die Lern-App anlegen und dort ein **monatliches Ausgabenlimit** setzen (z. B. 30 USD), damit Missbrauch nie mehr kostet als geplant.
2. Schlüssel setzen, ohne ihn in die Shell-Historie zu schreiben:

```powershell
$k = Read-Host 'ANTHROPIC_API_KEY' -MaskInput
az staticwebapp appsettings set -n <swa-name> -g rg-informatik-lernapp --setting-names "ANTHROPIC_API_KEY=$k" -o none
Remove-Variable k
```

`<swa-name>` steht in der Ausgabe des Schritts Infrastruktur (oder `az staticwebapp list -g rg-informatik-lernapp --query [].name -o tsv`). Prüfen: `https://<host>/api/status` zeigt `"tutor": true`. Tutor abschalten: `az staticwebapp appsettings delete -n <swa-name> -g rg-informatik-lernapp --setting-names ANTHROPIC_API_KEY`.

## 5. Einstellungen

| Name | Herkunft | Bedeutung |
|---|---|---|
| `COSMOS_VERBINDUNG` | Bicep (aus `listConnectionStrings`, nie als Ausgabe) | Verbindung zur Datenbank. Fehlt sie, antwortet die API mit 503 |
| `COSMOS_DATENBANK` | Bicep | `lernapp` |
| `BENUTZER_SALT` | einmalig beim Erstdeployment erzeugt, danach nie überschrieben | Schlüssel für die pseudonymen Kennungen. **Nicht ändern**: Mit neuem Salt verlieren alle ihre Daten (neue benutzerId) |
| `ANTHROPIC_API_KEY` | Besitzer per CLI | Tutor an/aus |
| `TUTOR_MODELL` | Bicep (`claude-haiku-5-5`) | Modell-ID |
| `TUTOR_LIMIT_NUTZER_TAG` / `TUTOR_LIMIT_KURS_TAG` | Bicep (40 / 600; ohne Einstellung 40 / 1500) | Kontingente, Tag nach deutscher Zeit |
| `TUTOR_PRUEFER` | Bicep (`an`) | zweite Prüfung jeder Antwort |
| `APP_VERSION` | optional | Version in `/api/status` |
| `KURS_CODE` | Besitzer per CLI (nicht in Bicep, nicht ins Repository) | Tutor nur nach einmaliger Freischaltung mit diesem Code (Groß-/Kleinschreibung und Leerzeichen egal; am besten drei Wörter). Ohne Wert: keine Freischaltung. `az staticwebapp appsettings set -n <swa> -g rg-informatik-lernapp --setting-names KURS_CODE="…"` |

Bicep-verwaltete Werte ändert man in `infra/main.bicepparam` und deployt erneut; ein per CLI geänderter Tutor-Grenzwert würde beim nächsten Deployment auf den Bicep-Wert zurückgesetzt.

| `MENGE_LIMIT_NUTZER_TAG` / `MENGE_LIMIT_KURS_TAG` / `MENGE_LIMIT_ANONYM_TAG` | optional, per CLI | Mengenbremse (Standard 5000 / 200000 / 50000), Abschnitt 2 |

**Salt sichern:** Der Salt existiert nur in den SWA-Einstellungen. Wird die SWA gelöscht oder neu angelegt, würfelt das nächste Deployment einen neuen, und alle Daten in Cosmos passen zu keinem Konto mehr. Deshalb nach dem Erstdeployment den Wert einmal in den Passwortmanager des Besitzers übernehmen (nicht ins Repository, nicht in ein Ticket):

```powershell
az staticwebapp appsettings list -n <swa-name> -g rg-informatik-lernapp --query properties.BENUTZER_SALT -o tsv | Set-Clipboard
```

Wiederherstellen bei einer neu angelegten SWA, **vor** dem Schritt Infrastruktur (Vorhandenes gewinnt in der Zusammenführung, der Wert bleibt also):

```powershell
$s = Read-Host 'BENUTZER_SALT' -MaskInput
az staticwebapp appsettings set -n <swa-name> -g rg-informatik-lernapp --setting-names "BENUTZER_SALT=$s" -o none
Remove-Variable s
```

**Wie das Überschreiben verhindert wird:** `staticSites/config/appsettings` ersetzt beim Deployment die ganze Liste. Das Modul `infra/module/swa-einstellungen.bicep` liest deshalb zuerst die vorhandenen Einstellungen (`listAppSettings()`) und schreibt `union({BENUTZER_SALT: neuer Kandidat}, vorhanden, {COSMOS_VERBINDUNG, Tutor-Werte})`. Bei gleichen Schlüsseln gewinnt das spätere Objekt: Vorhandenes schlägt den neuen Salt-Kandidaten, Bicep-verwaltete Werte schlagen Vorhandenes. Beim Erstdeployment ist die Liste leer (auch ohne `properties` in der Antwort: `listAppSettings().?properties ?? {}`), der Kandidat (zwei `newGuid()`) wird zum Salt. Nach dem ersten Deployment prüfen (nur Namen, keine Werte): `az staticwebapp appsettings list -n <swa-name> -g rg-informatik-lernapp --query "keys(properties)"`.

**Produktionserkennung der API** (`api/src/lib/umgebung.js`): Lokal ist nur, wer `ABLAGE=datei` oder `ABLAGE=speicher` setzt und nicht auf der Azure-Plattform läuft (`WEBSITE_INSTANCE_ID` fehlt). Alles andere gilt als Produktion: Dort ist `COSMOS_VERBINDUNG` Pflicht (sonst 503 `ablage-fehlt`) und `BENUTZER_SALT` Pflicht (sonst 503 `nicht-eingerichtet`); `/api/status` meldet dann `ok: false`.

## 6. Budgetwarnung

E-Mails gehen an die beim Deployment angegebene Adresse, sobald die Ist-Kosten 50 %, 80 % oder 100 % von 30 (Abrechnungswährung) erreichen, und wenn die Prognose 100 % übersteigt (meist innerhalb einer Stunde nach der Auswertung). Das Budget beginnt am Ersten des Monats des Erstdeployments; spätere Deployments übernehmen dieses Startdatum (`bereitstellen.ps1` liest es per `az rest` aus und setzt `LERNAPP_BUDGET_START`). Wer `az deployment group create` von Hand aufruft, setzt `$env:LERNAPP_BUDGET_START = 'JJJJ-MM-01'` auf das vorhandene Startdatum. Ansehen: Portal → Kostenverwaltung → Budgets, oder `az consumption budget list -g rg-informatik-lernapp -o table`. Betrag in der Abrechnungswährung gegenprüfen: Portal → Kostenverwaltung → Kostenanalyse.

**Notbremsen** (bei einer Warnung zuerst Kostenanalyse nach Ressource ansehen):

| Kostentreiber | Notbremse | Rückweg |
|---|---|---|
| Tutor (Anthropic) | `ANTHROPIC_API_KEY` entfernen (Abschnitt 4) | Schlüssel wieder setzen |
| Cosmos (RU) | Mengenbremse verschärfen, z. B. `az staticwebapp appsettings set ... --setting-names MENGE_LIMIT_KURS_TAG=20000`; härter: `az staticwebapp appsettings delete ... --setting-names COSMOS_VERBINDUNG` (die API antwortet dann mit 503, die App arbeitet lokal weiter) | `-Schritt Infrastruktur` setzt `COSMOS_VERBINDUNG` wieder |
| Videos (Storage-Verkehr) | Container privat stellen: `az storage container set-permission -n video --account-name <storage> --public-access off --auth-mode login` (Videos laden dann nicht mehr) | `-Schritt Infrastruktur` stellt `publicAccess: Blob` wieder her |
| SWA-Bandbreite | kostet nichts extra; bei Erschöpfung ist die Seite gedrosselt bzw. nicht erreichbar. Weniger ausrollen | – |

## 7. Daten exportieren und löschen

- Studierende selbst: Kontoseite „Meine Daten herunterladen“ (`GET /api/konto/export`) und „Konto und Daten löschen“ (`DELETE /api/konto`, löscht Einträge, geteilte Programme und Profil endgültig; Backups verfallen nach 7 Tagen).
- Nach dem Löschen bleiben nur: die Tageszähler der Kontingente (pseudonyme Kennung und Anzahl, verfallen nach 8 Tagen; sonst ließe sich ein Tageskontingent durch Löschen erneuern) und ein Löschvermerk (Zeitpunkt, verfällt nach 30 Tagen). Der Vermerk sorgt dafür, dass andere, noch angemeldete Geräte ihren alten Stand nicht wieder hochladen: Einträge, die vor dem Löschen geändert wurden, lehnt der Server ab (`konto-geloescht`). Neu Geschriebenes wird angenommen. **Abweichung vom Architekturvertrag** (Abschnitt 6 nennt „Tutor-Zähler“ beim Löschen): von der Koordination zu bestätigen.
- Gespeichert werden nur: pseudonyme Kennung (HMAC aus GitHub-Kennung und Salt), Anzeigename, Lernstand, Programme, geteilte Schnappschüsse, Tages- und Kontozähler. Keine Namen, E-Mails, GitHub-Logins. Logs enthalten keine Inhalte.
- Anzeigenamen sind frei gewählt und nicht geprüft; Rollenwörter (Prof, Dozent, Tutor, Admin, DHBW …) lehnt die API ab. Wer als Dozent teilen will, wählt einen Namen ohne diese Wörter.
- Gesamtexport für den Dozenten (z. B. vor dem Aufräumen): Cosmos-Daten im Portal (Data Explorer) oder per Skript mit einem nur lesenden Schlüssel (`az cosmosdb keys list --type read-only-keys`, Wert nirgends ablegen).

## 8. Aufräumen nach dem Semester

1. Ankündigen, dass Studierende ihre Daten exportieren können (Frist).
2. Optional Gesamtexport (Abschnitt 7).
3. Alles entfernen: `az group delete -n rg-informatik-lernapp --yes` (löscht SWA, Datenbank, Videos und Budget endgültig; Cosmos-Wiederherstellung eines gelöschten Kontos ist nur innerhalb des Backup-Fensters möglich).
4. Den Anthropic-Schlüssel in der Konsole widerrufen.
5. Für das nächste Semester neu bereitstellen: neues Konto, neuer Salt, leere Datenbank.

Alternativ nur die Daten leeren und die App weiterlaufen lassen: Container `eintraege`, `geteilt`, `benutzer`, `zaehler` im Data Explorer löschen und per `-Schritt Infrastruktur` neu anlegen lassen.

## 9. Wiederherstellung (Cosmos Continuous Backup, 7 Tage)

Point-in-Time-Restore legt ein **neues** Konto an (das alte bleibt unverändert):

```powershell
az cosmosdb restorable-database-account list --account-name <cosmos-konto> -o table   # Instanz-ID und frühester Zeitpunkt
az cosmosdb restore -g rg-informatik-lernapp --account-name <cosmos-konto> `
  --target-database-account-name <neues-konto> --restore-timestamp 2026-12-01T10:00:00Z --location germanywestcentral
```

Danach die App auf das neue Konto umstellen: `$env:LERNAPP_COSMOS_KONTO = '<neues-konto>'; ./infra/bereitstellen.ps1 -Schritt Infrastruktur -BudgetEmail <adresse>` (setzt `COSMOS_VERBINDUNG` neu; Salt und Tutor-Schlüssel bleiben) und `/api/status` prüfen. Die Variable bei jedem späteren Deployment wieder setzen, sonst zeigt die App zurück auf das alte Konto. Kosten: 0,15 USD je GB und Wiederherstellung. Quelle: learn.microsoft.com/azure/cosmos-db/restore-account-continuous-backup.

## 10. Fehlersuche

| Symptom | Ursache und Abhilfe |
|---|---|
| `/api/status` → `ok:false, ablage:'fehlt'` | `COSMOS_VERBINDUNG` fehlt: `-Schritt Infrastruktur` erneut ausführen, Namen der Einstellungen prüfen |
| `/api/*` → 503 `nicht-eingerichtet` | `BENUTZER_SALT` fehlt (sollte nie passieren; nie von Hand neu setzen, wenn schon Daten existieren) |
| `/api/*` → 503 `ueberlastet` | Cosmos drosselt (429) oder war nicht erreichbar; Serverless schafft bis 5000 RU/s je Container. Das SDK wiederholt höchstens 8 s, dann 503. Wiederholt sich das, Kostenanalyse und Logs prüfen |
| `/api/*` → 429 `mengenbremse` | Tagesgrenze eines Kontos oder des Kurses erreicht (Abschnitt 2). Bei echtem Bedarf `MENGE_LIMIT_*` anheben; sonst Missbrauch prüfen |
| `/api/*` → 404 für alle Routen | API nicht mit ausgerollt (`--api-location api`) oder Laufzeit falsch: `staticwebapp.config.json` braucht `"platform": {"apiRuntime": "node:22"}` |
| Login klappt, API meldet 401 | Cookies blockiert oder Anfrage an eine andere Adresse als die SWA; `/.auth/me` prüfen |
| 403 `anbieter-nicht-erlaubt` | Anmeldung nicht über GitHub (z. B. `/.auth/login/aad`); die Routenregel muss Entra sperren |
| Videos laden nicht | `VIDEO_BASIS` beim Bauen nicht gesetzt, Blob fehlt (`-Schritt Videos`), oder CORS-Ursprung passt nicht (nur `https://<standard-host>`; für eine eigene Domain in `main.bicep` ergänzen) |
| `-Schritt Videos` meldet keinen Zugriff | Rolle „Storage Blob Data Contributor“ fehlt oder wirkt noch nicht (1 bis 8 Minuten). Manuell: `az role assignment create --assignee <objekt-id> --role "Storage Blob Data Contributor" --scope <storage-id>` |
| Tutor: 503 `nicht-eingerichtet` | `ANTHROPIC_API_KEY` fehlt (Abschnitt 4) |
| Tutor: 429 `kursbudget` | Tageskontingent des Kurses erreicht; `tutorLimitKursTag` in `main.bicepparam` anheben |
| Deployment: Fehler beim Budget | Neues Budget: Startdatum muss im laufenden Monat liegen (Standard). Vorhandenes Budget: Startdatum darf sich nicht ändern; `LERNAPP_BUDGET_START` muss dem vorhandenen entsprechen (das Skript liest es aus). Berechtigung „Cost Management Contributor“ nötig. Nicht in Azure geprüft |

Logs: Portal → Static Web App → Funktionen bzw. Application Insights (nicht eingerichtet; bei Bedarf über das Portal verknüpfen). Die API loggt nur Fehlerart und Status, keine Inhalte und keine Benutzerdaten.

## 11. Erst in Azure prüfbar

Lokal getestet sind alle Routen gegen die Arbeitsspeicher-Ablage und gegen die Cosmos-Umsetzung mit nachgebildetem Client (mit einstellbarer Verzögerung und Fehlern 429/408/503, `api/tests/robustheit.test.js`). Erst nach der Bereitstellung prüfbar:
- Cosmos-Abfragen und -Fehlercodes gegen das echte SDK und Konto (bedingtes Patch für die Zähler, `ARRAY_CONTAINS` in der Partition, IfMatch bei Replace, 404 beim Lesen) sowie die RU-Kosten.
- Serverless und Continuous Backup in Germany West Central.
- `listAppSettings()`-Zusammenführung beim Erst- und beim Folgedeployment (erwartet: Salt bleibt, `ANTHROPIC_API_KEY` bleibt). Der Trockenlauf deckt das nicht ab (Abschnitt 3).
- Budget-Folgedeployment mit ausgelesenem Startdatum (`az rest` auf `Microsoft.Consumption/budgets`).
- Bedingtes Patch mit mehreren Feldern (`FROM c WHERE c.n <= … AND c.b <= …`) für die Kontozähler, Ablauf der Löschmarken über `ttl` am Dokument, Filter `c._ts >= @s`.
- Wie viele Function-Instanzen SWA Free parallel startet (bestimmt die Genauigkeit der Mengenbremse).
- Verhalten verwalteter Functions mit Node 22 und Wildcard-Route `eintraege/{*pfad}` hinter dem SWA-Routing.
- CORS und Range-Anfragen der Videos vom Storage-Konto.
- Ob Azure Static Web Apps fremde Ziele in `post_login_redirect_uri` ablehnt (die App erzeugt nur noch Pfade der eigenen Herkunft; der Emulator nimmt jede Adresse an).
