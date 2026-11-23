# Lern-App: Betrieb

Stand: 2026-11-23. Für den Besitzer des Azure-Abos (Visual Studio Subscription, 150 USD Guthaben im Monat) und die Koordination. Architektur: `docs/app/ARCHITEKTUR.md`, Abschnitte 6 und 13.

## 1. Ressourcen

Alle in der Ressourcengruppe `rg-informatik-lernapp`, angelegt durch `infra/main.bicep`:

| Ressource | Name (Muster) | Region | Tarif |
|---|---|---|---|
| Static Web App (Seiten, Login, API) | `lernapp-swa-<6 Zeichen>` | West Europe | Free, ohne Repository-Verknüpfung |
| Cosmos DB for NoSQL | `lernapp-cosmos-<8 Zeichen>` | Germany West Central (Rückfall West Europe) | Serverless, Continuous Backup 7 Tage |
| Storage-Konto (Videos) | `lernappvid<…>` | wie Cosmos | Standard_LRS, StorageV2, TLS 1.2 |
| Key Vault (Sicherung des `BENUTZER_SALT`) | `lernapp-kv-<13 Zeichen>` | wie Cosmos | Standard, RBAC, Soft-Delete 90 Tage, Purge-Schutz (Abschnitt 5) |
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
| Key Vault Standard | ein Geheimnis, einige Dutzend Lesezugriffe je Bereitstellung | unter 0,01 USD | 0,03 USD je 10 000 Vorgänge, keine Grundgebühr (Azure-Preisliste, prices.azure.com, Germany West Central); gelöschte Tresore kosten nichts (learn.microsoft.com/azure/key-vault/general/soft-delete-overview) |
| Ausgehender Verkehr (Videos) | 100 Studierende sehen alles einmal: ca. 11 GB | 0 USD (erste 100 GB im Monat frei) | learn.microsoft.com/azure/networking/design-guide/internet-ingress (Kostentabelle) |
| Tutor (Anthropic) | läuft über das API-Guthaben, nicht über Azure | – | `docs/app/recherche/04-claude-api-tutor.md` |
| **Summe Azure** | | **unter 2 USD** | |

Das Budget zählt Bruttokosten: Das VS-Guthaben ist in Cost Management nicht abgezogen. Die Warnung kann also auslösen, obwohl die Rechnung durch das Guthaben null ist (recherche/02, Abschnitt 5). Das Budget **warnt nur, es stoppt nichts**. Hart greift erst das Ausgabenlimit des VS-Abos (150 USD): Ist das Guthaben verbraucht, schaltet Azure alle Ressourcen des Abos bis zum nächsten Abrechnungsmonat ab, also auch die Lern-App. Deshalb gibt es die Mengenbremse und die Notbremsen unten.

### Hauptrisiko: Bandbreite der Static Web App (100 GB, ohne Zukauf)

Im Free-Tarif sind 100 GB ausgehender Verkehr im Monat enthalten; mehr lässt sich nicht zukaufen (learn.microsoft.com/azure/static-web-apps/quotas: „Overage bandwidth: Unavailable“). Über die SWA laufen Seiten, Precache und Pyodide, nicht die Videos (Storage).

| Vorgang | Menge | Verkehr |
|---|---|---|
| Erstinstallation je Gerät: Pyodide (nur wer „Python offline bereit machen“ wählt oder Python ausführt) | ca. 80 MB | 80 Geräte (40 Studierende × 2): ca. 6,5 GB |
| Erstinstallation je Gerät: Grundausstattung (HTML, CSS, JS, Bilder, Daten) | ca. 11 MB | 80 Geräte: ca. 0,9 GB |
| **jede Bereitstellung** (der Service Worker lädt nur geänderte Dateien neu; die HTML-Seiten ändern sich immer, weil sie die Build-Version tragen) | ca. 5 MB je Gerät | 80 Geräte: ca. 0,4 GB |
| Seitenaufrufe, API | klein | wenige GB |

Grob (Kurs mit rund 40 Studierenden): Erstinstallation ca. 7 GB, danach etwa 0,4 GB je Bereitstellung. Damit sind auch tägliche Bereitstellungen weit unter den 100 GB im Monat; die GitHub Action stellt deshalb bei jedem Push auf `main` bereit (Abschnitt 3). Beobachten: Portal → Static Web App → Überwachung → Metriken, ausgehende Daten (Metrikname im Portal nicht geprüft).

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

Schritte: `Pruefen` → `Gruppe` (idempotent) → `Infrastruktur` (Deployment-Name `lernapp-main`; liest vorher das Startdatum eines vorhandenen Budgets aus und gibt es unverändert weiter; stellt fest, wo der Salt liegt, meldet den Fall und prüft am Ende, dass Tresor und SWA denselben Salt haben, Abschnitt 5) → `Videos` (vergleicht MD5 im Blob-Metadatum `md5`, lädt nur Abweichendes; im Trockenlauf nur ein Versuch, bei fehlendem Zugriff eine Warnung) → `Bauen` (`app/` mit `VIDEO_BASIS` aus der Bicep-Ausgabe) → `Ausrollen` (baut das API-Paket in einem Temp-Ordner, siehe unten, und ruft `swa deploy app/dist --api-location <Paket> --swa-config-location app/dist --api-language node --api-version 22 --env production`; der Deployment-Token wird per `az staticwebapp secrets list` geholt, nur in einer Variablen gehalten und über `SWA_CLI_DEPLOYMENT_TOKEN` übergeben) → `Rauchtest` (`api/skripte/rauchtest.mjs`).

**API-Paket:** Hochgeladen wird nicht `api/` selbst, sondern eine Kopie mit nur `host.json`, `package.json`, `package-lock.json`, `src/`, `daten/` und den Laufzeit-Abhängigkeiten (`npm ci --omit=dev`). Lokale Testdaten (`api/.daten/`), `local.settings.json`, `tests/` und `skripte/` sind so nie im Paket, unabhängig davon, ob `swa deploy` die `.funcignore` beachtet. `./infra/bereitstellen.ps1 -Schritt Paket` baut und prüft das Paket ohne Azure und zeigt den Inhalt. `api/daten/aufgaben.json` (Musterlösungen) gehört absichtlich dazu; verwaltete Functions liefern sie nicht als statische Datei aus.

**Grenze des Trockenlaufs:** `what-if` zeigt die App-Einstellungen der SWA nur als „Unsupported“ (sie lassen sich nicht per GET lesen), also weder ihre Werte noch Änderungen daran. Das Geheimnis im Tresor zeigt es mit verdecktem Wert (`"*******"`). Fehler in `listAppSettings()`, `listConnectionStrings()` und der Zusammenführung zeigen sich erst beim echten Deployment. Deshalb prüft das Skript danach die Namen der Einstellungen und den Salt (Schritt `SaltPruefen`). (Geprüft am 2026-11-23 gegen die echte Gruppe.)

Ist Cosmos Serverless in Germany West Central nicht verfügbar (Fehler im what-if oder Deployment): `-DatenRegion westeurope`. Achtung: Die Region eines bestehenden Cosmos-Kontos lässt sich nicht nachträglich ändern; das gilt nur für die Erstanlage.

Erneutes Deployment ist gefahrlos: Einstellungen, die nicht von Bicep stammen (insbesondere `ANTHROPIC_API_KEY`), bleiben erhalten, und der `BENUTZER_SALT` kommt aus dem Tresor bzw. bleibt (Abschnitt 5). Wer `az deployment group create` von Hand aufruft (ohne Skript), schreibt nichts in den Tresor und erzeugt keinen neuen Salt; der vorhandene Salt der SWA bleibt, eine SWA ohne Salt bleibt ohne (das Geheimnis wird dabei gar nicht ausgewertet, `saltSichern ? … : ''` in `swa-einstellungen.bicep`). Den Salt aus dem Tresor zurück holt nur das Skript.

Rauchtest von Hand: `node api/skripte/rauchtest.mjs https://<host> --erwarte-ablage=cosmos [--erwarte-tutor]`.

### Automatische Bereitstellung (GitHub Action)

`.github/workflows/lernapp.yml` baut und prüft bei jedem Pull Request und stellt bei jedem Push auf `main` (Pfade `site/`, `app/`, `api/`) nach Azure bereit; von Hand über Actions → „Lern-App“ → Run workflow. Zwei Jobs: „bauen“ (Bilder aus Git LFS ohne Videos, App bauen, Selbsttest, API-Tests, Prüfung der Ausgabe auf LFS-Zeiger, Videos und Größe, API-Paket; ohne Zugriff auf das Secret) und „bereitstellen“ (nur auf `main`: lädt das Ergebnis des ersten Jobs, stellt bereit, Rauchtest: neue Version online, API antwortet, Cosmos angebunden).

Einmalig einrichten (PowerShell, angemeldet mit `az` und `gh`; `<swa-name>` aus der Ausgabe von `-Schritt Infrastruktur`):

```powershell
# Secret: Deployment-Token der Static Web App (geht direkt von Azure zu GitHub, wird nicht angezeigt)
az staticwebapp secrets list -n <swa-name> -g rg-informatik-lernapp --query properties.apiKey -o tsv | gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN

# Variablen (nicht geheim): Video-Adresse und Hostname der App
gh variable set VIDEO_BASIS --body "https://<storage>.blob.core.windows.net/video"
gh variable set SWA_HOSTNAME --body "<name>.azurestaticapps.net"
```

Was die Action bewusst nicht tut, bleibt bei `infra/bereitstellen.ps1`:
- **Infrastruktur, Salt, Key Vault** (`-Schritt Infrastruktur`, `-Schritt SaltPruefen`): selten und heikel, deshalb nicht automatisch und ohne Azure-Anmeldung in der Action.
- **Videos hochladen** (`-Schritt Videos`): Nach einem neuen Video einmal lokal ausführen. Fehlt ein Video im Speicher, warnt der Lauf (Zusammenfassung und gelbe Hinweise); die Seite zeigt dort „Video folgt“.

**Was der Token kann:** Wer ihn hat, kann die komplette App einschließlich der API ersetzen und käme über eigenen API-Code an alle App-Einstellungen (Cosmos-Verbindung, Salt, Tutor-Schlüssel). Er liegt deshalb nur als Secret in GitHub, und nur der Job „bereitstellen“ bekommt ihn; dieser Job führt keinen Code aus dem Repository und keine npm-Pakete aus. Bei Verdacht sofort erneuern mit `az staticwebapp secrets reset-api-key -n <swa-name> -g rg-informatik-lernapp`, den Befehl oben erneut ausführen und danach den Cosmos-Schlüssel und den Anthropic-Schlüssel rotieren. Pull Requests aus Forks bekommen weder Secret noch Variablen und werden nur gebaut und geprüft.

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
| `BENUTZER_SALT` | einmalig beim Erstdeployment erzeugt; gesichert im Key Vault (Geheimnis `benutzer-salt`), von dort bei jedem Deployment bestätigt bzw. zurückgeschrieben | Schlüssel für die pseudonymen Kennungen. **Nicht ändern**: Mit neuem Salt verlieren alle ihre Daten (neue benutzerId) |
| `ANTHROPIC_API_KEY` | Besitzer per CLI | Tutor an/aus |
| `TUTOR_MODELL` | Bicep (`claude-haiku-5-5`) | Modell-ID |
| `TUTOR_LIMIT_NUTZER_TAG` / `TUTOR_LIMIT_KURS_TAG` | Bicep (40 / 600; ohne Einstellung 40 / 1500) | Kontingente, Tag nach deutscher Zeit |
| `TUTOR_PRUEFER` | Bicep (`an`) | zweite Prüfung jeder Antwort |
| `APP_VERSION` | optional | Version in `/api/status` |
| `KURS_CODE` | Besitzer per CLI (nicht in Bicep, nicht ins Repository) | Tutor nur nach einmaliger Freischaltung mit diesem Code (Groß-/Kleinschreibung und Leerzeichen egal; am besten drei Wörter). Ohne Wert: keine Freischaltung. `az staticwebapp appsettings set -n <swa> -g rg-informatik-lernapp --setting-names KURS_CODE="…"` |
| `DOZENT_IDS` | Besitzer per CLI (nicht in Bicep, nicht ins Repository) | Wer die Kursübersicht (`dozent.html`) sehen darf: pseudonyme Kennungen, getrennt durch Komma. Einrichten: mit dem eigenen GitHub-Konto anmelden, `dozent.html` öffnen, die angezeigte Kennung kopieren, dann `az staticwebapp appsettings set -n <swa> -g rg-informatik-lernapp --setting-names DOZENT_IDS="<kennung>"`. Ohne Wert sieht niemand die Übersicht. Die Kennung hängt am Salt und am GitHub-Konto; sie ist kein Geheimnis, gehört aber nicht ins Repository |

Bicep-verwaltete Werte ändert man in `infra/main.bicepparam` und deployt erneut; ein per CLI geänderter Tutor-Grenzwert würde beim nächsten Deployment auf den Bicep-Wert zurückgesetzt.

| `MENGE_LIMIT_NUTZER_TAG` / `MENGE_LIMIT_KURS_TAG` / `MENGE_LIMIT_ANONYM_TAG` | optional, per CLI | Mengenbremse (Standard 5000 / 200000 / 50000), Abschnitt 2 |

### Salt: wo er liegt, wie er gesichert und wiederhergestellt wird

**Ablage.** Der Salt liegt an zwei Stellen: als App-Einstellung `BENUTZER_SALT` der SWA (die API liest ihn dort) und als Geheimnis `benutzer-salt` im Key Vault `lernapp-kv-<…>` derselben Ressourcengruppe (die Sicherung). Der Tresor übersteht das Löschen oder Neuanlegen der SWA; ein gelöschter Tresor bleibt 90 Tage wiederherstellbar, und dank Purge-Schutz kann ihn in dieser Zeit niemand endgültig löschen, auch kein Administrator. Quelle der Wahrheit: **1. Tresor, 2. vorhandene SWA-Einstellung, 3. neuer Zufallswert nur beim echten Erstdeployment.** Eine Kopie im Passwortmanager ist nicht mehr nötig; wer eine Zweitsicherung außerhalb von Azure will, kann sie zusätzlich anlegen (`az keyvault secret show --vault-name <tresor> -n benutzer-salt --query value -o tsv | Set-Clipboard`, in den Passwortmanager einfügen, danach `Set-Clipboard -Value ' '`). Achtung: Bei eingeschaltetem Zwischenablageverlauf (Win+V) oder geräteübergreifender Zwischenablage bleibt der Wert dort gespeichert; dann den Eintrag im Verlauf löschen oder die Funktion vorher ausschalten.

**Ablauf bei jedem `-Schritt Infrastruktur`** (`infra/bereitstellen.ps1`, Entscheidung in `infra/salt-fall.ps1`): Das Skript liest Tresor und SWA, vergleicht die Werte nur im Speicher (SHA-256), gibt nur Fall, Längen und „gleich ja/nein“ aus und setzt danach die Deployment-Parameter:

| Lage | Fall | Was passiert |
|---|---|---|
| SWA hat Salt, noch kein Tresor (Umstellung jetzt) | `sichern` | Tresor wird angelegt, der vorhandene Salt der SWA wird als Geheimnis gesichert; die SWA bleibt unverändert |
| Tresor und SWA gleich (Folgedeployment) | `unveraendert` | nichts ändert sich, keine neue Geheimnis-Version |
| SWA gelöscht/neu angelegt oder Einstellung fehlt, Tresor hat ihn | `wiederherstellen` | Salt kommt aus dem Tresor zurück in die SWA |
| SWA-Einstellung weicht ab (überschrieben) | `abweichung` | Tresor gewinnt, die SWA bekommt den Tresorwert; deutliche WARNUNG (ohne Werte) |
| Tresor gelöscht (Soft-Delete) | `tresor-geloescht` | **Abbruch** mit Anleitung (unten); kein neuer Tresor, kein neuer Salt |
| Geheimnis gelöscht (Soft-Delete; erkannt, wenn `az keyvault secret list-deleted` mit der vorhandenen Rolle klappt) | `geheimnis-geloescht` | **Abbruch**: `az keyvault secret recover --vault-name <tresor> -n benutzer-salt` (Rolle „Key Vault Secrets Officer“ nötig), dann erneut |
| Geheimnis fehlt, gelöschte Geheimnisse aber nicht abfragbar, SWA hat Salt | `sichern` (mit Warnung) | wie `sichern`. Ist `benutzer-salt` doch soft-deleted, lehnt Key Vault den Schreibvorgang ab, das Deployment scheitert, nichts geht verloren (die SWA-Einstellungen hängen vom Geheimnis ab und werden dann nicht geschrieben); dann `secret recover` wie oben |
| Geheimnis fehlt, Löschstatus nicht abfragbar, SWA ohne Salt | `geheimnis-unklar` | **Abbruch**; mit „Key Vault Secrets Officer“ `az keyvault secret list-deleted --vault-name <tresor> --query [].name` prüfen und ggf. wiederherstellen. `-NeuenSaltErlauben` hilft hier nicht |
| Tresor nicht lesbar (Rolle fehlt oder wirkt noch nicht, z. B. nach `az keyvault recover`; Dienstprinzipal; Geheimnis deaktiviert) | `erhalten` | Deployment ohne jede Salt-Änderung (nichts gesichert, nichts überschrieben, kein neuer Salt, auch nicht mit `-NeuenSaltErlauben`); es legt die Leserolle an. Hat die SWA ihren Salt, danach `-Schritt SaltPruefen`; hat sie keinen (API 503), in einigen Minuten `-Schritt Infrastruktur` erneut (Fall `wiederherstellen`). **Rolle nicht von Hand zuweisen**, siehe unten |
| weder Tresor noch SWA (echtes Erstdeployment) | `erstdeployment` | neuer Salt, erst im Tresor gesichert, dann in die SWA geschrieben |
| SWA oder leerer Tresor existieren, aber nirgends ein Salt (auch kein gelöschtes Geheimnis) | `kein-salt` | **Abbruch**; nur wenn sicher kein alter Salt mehr existiert: erneut mit `-NeuenSaltErlauben` |
| wie `kein-salt`, aber mit `-NeuenSaltErlauben` | `neu` | neuer Salt, erst im Tresor gesichert, dann in die SWA geschrieben; WARNUNG: alle vorhandenen Daten in Cosmos verwaisen |

Kein Ablauf schreibt einen neuen Salt, solange irgendwo noch der alte existiert oder existieren könnte, und ein neuer Salt kommt erst in die SWA, wenn er im Tresor steht (`dependsOn` in `swa-einstellungen.bicep`). Nach dem Deployment prüft das Skript, dass Tresor und SWA denselben Salt haben (nur „ja/nein“ und Längen). Es wartet dafür bis gut 10 Minuten auf die Leserolle; bleibt der Tresor unlesbar, gibt es nur eine Warnung (kein Vergleich möglich, `Alle` läuft weiter), abgebrochen wird nur bei echter Abweichung oder fehlendem Salt. Von Hand: `./infra/bereitstellen.ps1 -Schritt SaltPruefen`. Die Fallunterscheidung ist ohne Azure testbar: `pwsh ./infra/salt-fall.test.ps1`.

**Regelmäßig prüfen:** Wird `BENUTZER_SALT` per `az staticwebapp appsettings set/delete` überschrieben, fällt das erst beim nächsten Abgleich auf; Konten aus der Zwischenzeit gehören zum falschen Salt. `-Schritt Ausrollen` macht deshalb vorher eine Kurzprüfung (ein Lesezugriff, nur Warnung). Vor einem Ausrollen über die GitHub Action (die Azure nicht liest) und nach jeder Arbeit an den App-Einstellungen: `./infra/bereitstellen.ps1 -Schritt SaltPruefen`.

**Rollen nie von Hand zuweisen:** `main.bicep` legt „Key Vault Secrets User“ (und „Storage Blob Data Contributor“) unter einem festen Namen (`guid(...)`) an. Eine gleiche Zuweisung (Bereich, Person, Rolle) per `az role assignment create` bekommt einen zufälligen Namen, und das nächste Deployment scheitert dann mit `RoleAssignmentExists` (learn.microsoft.com/azure/azure-resource-manager/bicep/bicep-functions-resource#getroleassignmentname). Ist der Tresor nicht lesbar, legt das Deployment die Rolle selbst an (Fall `erhalten`). Wurde doch von Hand zugewiesen: `az role assignment delete --assignee <objekt-id> --role "Key Vault Secrets User" --scope <tresor-id>`, dann erneut deployen.

**Tresor versehentlich gelöscht:** Das Skript bricht ab. Wiederherstellen, dann normal bereitstellen:

```powershell
az keyvault list-deleted --resource-type vault -o table          # Name und geplantes Löschdatum
az keyvault recover -n <tresor>                                  # Ressourcengruppe muss existieren (sonst zuerst -Schritt Gruppe)
./infra/bereitstellen.ps1 -Schritt Infrastruktur -BudgetEmail <adresse>
```

Der Tresor kommt mit dem Geheimnis zurück, aber ohne Rollenzuweisungen (learn.microsoft.com/azure/key-vault/general/soft-delete-overview); das Skript erkennt das (Fall `erhalten`), das Deployment legt die Rolle neu an, und `-Schritt SaltPruefen` bestätigt nach einigen Minuten den Abgleich. Hatte die SWA keinen Salt mehr, holt ihn ein zweiter Lauf von `-Schritt Infrastruktur` nach einigen Minuten aus dem Tresor zurück (Fall `wiederherstellen`). Hat die SWA ihren Salt noch, ist ohnehin nichts verloren: Sie dient dann als Quelle, falls das Geheimnis im wiederhergestellten Tresor fehlen sollte (Fall `sichern`). Einen neuen Tresor mit neuem Namen anzulegen ist nicht vorgesehen; der Name ist bis zum Ablauf der 90 Tage reserviert.

**Wie die Werte geschützt sind:** Den Tresorwert übergibt das Skript nur für die Dauer des Deployments über die Umgebungsvariable `LERNAPP_SALT_TRESOR` an den sicheren Bicep-Parameter `saltAusTresor` (`@secure()`: wird nicht im Deployment-Verlauf gespeichert und nicht protokolliert, learn.microsoft.com/azure/azure-resource-manager/templates/parameters#secure-parameters); auf keiner Befehlszeile, in keiner Ausgabe. Die Bicep-Dateien haben keine Ausgaben mit Geheimnissen; das Geheimnis schreibt das Modul `swa-einstellungen` als Ressource `Microsoft.KeyVault/vaults/secrets` nur im Fall `sichern`/`erstdeployment` (jeder Schreibvorgang wäre eine neue Version).

**Wer Zugriff hat:** Der Tresor schützt den Salt vor Verlust, nicht vor den eigenen Administratoren. Aus dem Tresor lesen geht nur mit einer Datenrolle (RBAC-Modell): Das Deployment gibt der bereitstellenden Person „Key Vault Secrets User“ (nur lesen). Aber: Wer Besitzer oder Mitwirkender auf Abo oder Ressourcengruppe ist, liest den Salt ohnehin über die SWA-Einstellungen (`listAppSettings`), kann über ARM eine neue Version des Geheimnisses schreiben (die dann im Fall `abweichung` gegen die SWA gewinnt) und könnte den Tresor auf Zugriffsrichtlinien umstellen und sich so Lesezugriff geben (`enableRbacAuthorization` ändern erfordert nur `Microsoft.KeyVault/vaults/write`, enthalten in Contributor und Owner; learn.microsoft.com/azure/key-vault/general/access-control-default); Besitzer können sich zudem die Datenrolle selbst zuweisen. Der eigentliche Schutz ist also die Rollenvergabe auf Abo- und Gruppenebene (Stand 2026-11-23: auf `rg-informatik-lernapp` nur der Besitzer). Endgültig löschen kann den Tresor während der 90 Tage niemand. Öffentlicher Netzzugriff ist an, weil vom Entwicklungsrechner mit wechselnder IP bereitgestellt wird; ohne Entra-Anmeldung und Rolle ist trotzdem nichts lesbar.

**Wie das Überschreiben der übrigen Einstellungen verhindert wird:** `staticSites/config/appsettings` ersetzt beim Deployment die ganze Liste. Das Modul `infra/module/swa-einstellungen.bicep` liest deshalb zuerst die vorhandenen Einstellungen (`listAppSettings()`) und schreibt `union({BENUTZER_SALT: Kandidat} nur beim Erstdeployment, vorhanden, {BENUTZER_SALT: Tresorwert} falls übergeben, {COSMOS_VERBINDUNG, Tutor-Werte})`. Bei gleichen Schlüsseln gewinnt das spätere Objekt: Vorhandenes schlägt den Kandidaten, der Tresor schlägt Vorhandenes, Bicep-verwaltete Werte schlagen alles. Eine frisch angelegte SWA kann ohne `properties` antworten (`listAppSettings().?properties ?? {}`). Namen prüfen (keine Werte): `az staticwebapp appsettings list -n <swa-name> -g rg-informatik-lernapp --query "keys(properties)"`.

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
- Kursübersicht für Dozierende (`GET /api/dozent/uebersicht`, Architekturvertrag Abschnitt 14): liefert nur Anzahlen über alle Konten (gelöst, begonnen, abgehakt, Mittel im Selbstcheck), nie Kennungen, nie Code; unter 5 Konten mit Lernstand gar keine Zahlen je Lektion. Der Datenschutztext auf der Kontoseite nennt das.
- Gesamtexport für den Dozenten (z. B. vor dem Aufräumen): Cosmos-Daten im Portal (Data Explorer) oder per Skript mit einem nur lesenden Schlüssel (`az cosmosdb keys list --type read-only-keys`, Wert nirgends ablegen).

## 8. Aufräumen nach dem Semester

1. Ankündigen, dass Studierende ihre Daten exportieren können (Frist).
2. Optional Gesamtexport (Abschnitt 7).
3. Alles entfernen: `az group delete -n rg-informatik-lernapp --yes` (löscht SWA, Datenbank, Videos und Budget endgültig; Cosmos-Wiederherstellung eines gelöschten Kontos ist nur innerhalb des Backup-Fensters möglich). Der Key Vault ist danach nur soft-deleted: Er und der Salt bleiben 90 Tage wiederherstellbar, kosten nichts und lassen sich wegen des Purge-Schutzes nicht vorher endgültig löschen.
4. Den Anthropic-Schlüssel in der Konsole widerrufen.
5. Für das nächste Semester neu bereitstellen: neues Konto, leere Datenbank. Innerhalb der 90 Tage bricht das Skript in derselben Ressourcengruppe ab (`tresor-geloescht`, der Tresorname ist reserviert). Dann entweder den Tresor wiederherstellen (`az keyvault recover -n <tresor>` nach `-Schritt Gruppe`; der alte Salt wird weiterverwendet, bei leerer Datenbank unschädlich, aber dieselbe Person bekommt wieder dieselbe pseudonyme Kennung) oder eine andere Ressourcengruppe wählen (`-Ressourcengruppe <neu>`: neuer Tresor, neuer Salt).

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
| `/api/*` → 503 `nicht-eingerichtet` | `BENUTZER_SALT` fehlt in der SWA: `-Schritt Infrastruktur` holt ihn aus dem Tresor zurück (Fall `wiederherstellen`). Nie von Hand einen neuen setzen |
| Infrastruktur bricht mit „Abbruch zum Schutz des Salts“ ab | Fall und Anleitung stehen in der Meldung; Übersicht in Abschnitt 5 |
| `SaltPruefen`: Tresor `unlesbar` (Warnung) | Rolle „Key Vault Secrets User“ fehlt oder wirkt noch nicht (1 bis 8 Minuten): später erneut `-Schritt SaltPruefen`; fehlt sie dauerhaft, `-Schritt Infrastruktur` (legt sie an). Angemeldet als Dienstprinzipal: keine Leserolle, als Person anmelden. Geheimnis deaktiviert: steht im Grund, `az keyvault secret set-attributes --vault-name <tresor> -n benutzer-salt --enabled true`. Rolle nicht von Hand zuweisen (Abschnitt 5) |
| `SaltPruefen`: gleicher Salt NEIN | `-Schritt Infrastruktur` erneut (Tresor gewinnt). Liegt der Fall `abweichung` vor, wurde die SWA-Einstellung überschrieben: Konten aus der Zwischenzeit gehören zum falschen Salt |
| Deployment: `RoleAssignmentExists` | Eine Rolle wurde von Hand unter anderem Namen zugewiesen; diese Zuweisung löschen (`az role assignment delete --assignee <objekt-id> --role "<rolle>" --scope <ressourcen-id>`), dann erneut |
| Deployment (Fall `sichern`): Geheimnis „is currently in a deleted but recoverable state“ | `benutzer-salt` ist soft-deleted; nichts verloren, SWA unverändert. `az keyvault secret recover --vault-name <tresor> -n benutzer-salt` (Rolle „Key Vault Secrets Officer“), dann erneut |
| `/api/*` → 503 `ueberlastet` | Cosmos drosselt (429) oder war nicht erreichbar; Serverless schafft bis 5000 RU/s je Container. Das SDK wiederholt höchstens 8 s, dann 503. Wiederholt sich das, Kostenanalyse und Logs prüfen |
| `/api/*` → 429 `mengenbremse` | Tagesgrenze eines Kontos oder des Kurses erreicht (Abschnitt 2). Bei echtem Bedarf `MENGE_LIMIT_*` anheben; sonst Missbrauch prüfen |
| `/api/*` → 404 für alle Routen | API nicht mit ausgerollt (`--api-location api`) oder Laufzeit falsch: `staticwebapp.config.json` braucht `"platform": {"apiRuntime": "node:22"}` |
| Login klappt, API meldet 401 | Cookies blockiert oder Anfrage an eine andere Adresse als die SWA; `/.auth/me` prüfen |
| 403 `anbieter-nicht-erlaubt` | Anmeldung nicht über GitHub (z. B. `/.auth/login/aad`); die Routenregel muss Entra sperren |
| Videos laden nicht | `VIDEO_BASIS` beim Bauen nicht gesetzt, Blob fehlt (`-Schritt Videos`), oder CORS-Ursprung passt nicht (nur `https://<standard-host>`; für eine eigene Domain in `main.bicep` ergänzen) |
| `-Schritt Videos` meldet keinen Zugriff | Rolle „Storage Blob Data Contributor“ fehlt oder wirkt noch nicht (1 bis 8 Minuten): warten bzw. `-Schritt Infrastruktur` als Person (nicht als Dienstprinzipal) ausführen, das legt sie an. Von Hand nur für eine andere Person als die bereitstellende (sonst `RoleAssignmentExists` beim nächsten Deployment): `az role assignment create --assignee <objekt-id> --role "Storage Blob Data Contributor" --scope <storage-id>` |
| Tutor: 503 `nicht-eingerichtet` | `ANTHROPIC_API_KEY` fehlt (Abschnitt 4) |
| Tutor: 429 `kursbudget` | Tageskontingent des Kurses erreicht; `tutorLimitKursTag` in `main.bicepparam` anheben |
| Deployment: Fehler beim Budget | Neues Budget: Startdatum muss im laufenden Monat liegen (Standard). Vorhandenes Budget: Startdatum darf sich nicht ändern; `LERNAPP_BUDGET_START` muss dem vorhandenen entsprechen (das Skript liest es aus). Berechtigung „Cost Management Contributor“ nötig. Nicht in Azure geprüft |

Logs: Portal → Static Web App → Funktionen bzw. Application Insights (nicht eingerichtet; bei Bedarf über das Portal verknüpfen). Die API loggt nur Fehlerart und Status, keine Inhalte und keine Benutzerdaten.

## 11. Erst in Azure prüfbar

Lokal getestet sind alle Routen gegen die Arbeitsspeicher-Ablage und gegen die Cosmos-Umsetzung mit nachgebildetem Client (mit einstellbarer Verzögerung und Fehlern 429/408/503, `api/tests/robustheit.test.js`). Erst nach der Bereitstellung prüfbar:
- Cosmos-Abfragen und -Fehlercodes gegen das echte SDK und Konto (bedingtes Patch für die Zähler, `ARRAY_CONTAINS` in der Partition, IfMatch bei Replace, 404 beim Lesen) sowie die RU-Kosten.
- Serverless und Continuous Backup in Germany West Central.
- `listAppSettings()`-Zusammenführung beim Erst- und beim Folgedeployment (erwartet: Salt bleibt, `ANTHROPIC_API_KEY` bleibt). Der Trockenlauf deckt das nicht ab (Abschnitt 3).
- Salt-Sicherung: erstes Anlegen von Tresor und Geheimnis über ARM ohne Datenrolle (Fall `sichern`), Wirksamwerden der Rolle „Key Vault Secrets User“ (Schritt `SaltPruefen` wartet bis gut 10 Minuten, danach nur Warnung), ob `az keyvault secret list-deleted` mit „Key Vault Secrets User“ klappt (Learn nennt dafür nur die Berechtigung „list“; klappt es nicht, gilt der Löschstatus als unklar), Reihenfolge Geheimnis vor App-Einstellungen (`dependsOn`), Folgedeployment ohne neue Geheimnis-Version (`az keyvault secret list-versions --vault-name <tresor> -n benutzer-salt --query "length(@)"` bleibt 1). Die Fallunterscheidung selbst ist ohne Azure getestet (`infra/salt-fall.test.ps1`), die Fälle `wiederherstellen`, `abweichung` und `tresor-geloescht` in Azure nicht.
- Die partitionsübergreifende Abfrage des Gruppenbilds (`ARRAY_CONTAINS(@pfade, c.pfad)` über alle Konten, feste Liste von höchstens 88 Pfaden) gegen das echte Konto: Ergebnis und RU-Kosten. Sie läuft höchstens alle 30 Sekunden je Function-Instanz und nur für Dozierende.
- Budget-Folgedeployment mit ausgelesenem Startdatum (`az rest` auf `Microsoft.Consumption/budgets`).
- Bedingtes Patch mit mehreren Feldern (`FROM c WHERE c.n <= … AND c.b <= …`) für die Kontozähler, Ablauf der Löschmarken über `ttl` am Dokument, Filter `c._ts >= @s`.
- Wie viele Function-Instanzen SWA Free parallel startet (bestimmt die Genauigkeit der Mengenbremse).
- Verhalten verwalteter Functions mit Node 22 und Wildcard-Route `eintraege/{*pfad}` hinter dem SWA-Routing.
- CORS und Range-Anfragen der Videos vom Storage-Konto.
- Ob Azure Static Web Apps fremde Ziele in `post_login_redirect_uri` ablehnt (die App erzeugt nur noch Pfade der eigenen Herkunft; der Emulator nimmt jede Adresse an).
