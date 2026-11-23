# Recherche 01: Azure Static Web Apps (Free) mit verwalteten Functions

Stand der Recherche: 2026-11-22. Quellen sind Microsoft-Learn-Seiten (offiziell), sofern nicht anders markiert. "UNBELEGT" = nicht durch eine Quelle belegt.

## Kurzfazit

- Free-Tarif: 250 MB pro App, 15.000 Dateien, 100 GB Bandbreite/Monat, 3 Preview-Umgebungen, 2 Custom Domains. Keine Bandbreiten-Mehrkosten (Overage "Unavailable"). Quelle: https://learn.microsoft.com/azure/static-web-apps/quotas
- Managed Functions: nur HTTP-Trigger, Request-Limit 45 s, Node-Runtime laut offizieller Tabelle `node:20` und `node:22` (Linux, Functions 4.x). Node 26 und 24 sind dort NICHT gelistet (UNBELEGT, ob SWA sie akzeptiert). Empfehlung: `node:22`.
- GitHub-Login ist vorkonfiguriert und im Free-Tarif ohne eigene OAuth-App nutzbar. Jeder GitHub-Account kann sich anmelden. Zugriffsbeschraenkung nur ueber `allowedRoles` plus Einladungen (Free: 25 Einladungen) oder eigene Logik in der Function.
- Deployment ohne GitHub Action: `swa deploy` mit Deployment-Token. Achtung: Default-`--env` ist `preview`, fuer Produktion `--env production` angeben.
- Kostenrisiko: Free-Tarif selbst kostenlos. Cosmos DB Serverless wird separat abgerechnet (Preise/Kosten UNBELEGT in dieser Recherche, nicht geprueft).

## 1. Managed Functions

**Runtime festlegen** (`staticwebapp.config.json`):
```json
{ "platform": { "apiRuntime": "node:22" } }
```
Quelle: https://learn.microsoft.com/azure/static-web-apps/configuration#platform und https://learn.microsoft.com/azure/static-web-apps/languages-runtimes#api

Offizielle Node-Werte fuer SWA-API: `node:20`, `node:22` (Functions 4.x, Linux). Node 26/24 fuer SWA: UNBELEGT.

**Node-Programmiermodell v4** (`@azure/functions` 4.x): In SWA-Doku wird v4 im Add-API-Tutorial verwendet (https://learn.microsoft.com/azure/static-web-apps/add-api#create-the-api). Ob jede Feinheit von v4 in managed Functions laeuft: UNBELEGT, nur HTTP-Trigger sind belegt.

**Minimalbeispiel** `api/src/functions/eintraege.js`:
```javascript
const { app } = require('@azure/functions');

app.http('eintraege', {
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  authLevel: 'anonymous',
  route: 'eintraege/{id}',   // Route-Parameter: belegt (Beispiel products/{id})
  handler: async (request, context) => {
    const id = request.params.id;
    const user = JSON.parse(Buffer.from(request.headers.get('x-ms-client-principal') || '', 'base64').toString('utf8') || 'null');
    return { status: 200, jsonBody: { id, user: user?.userDetails ?? null } };
  },
});
```
Quellen: https://learn.microsoft.com/azure/azure-functions/functions-reference-node#programming-model (Beispiel `app.http`, `request.query`), https://learn.microsoft.com/azure/azure-functions/functions-bindings-http-webhook-trigger#usage (Route-Parameter).

Catch-all `/api/eintraege/{*pfad}`: UNBELEGT (Syntax nicht gepruefte Quelle). Empfehlung: eigene Functions fuer feste Pfadtiefen anlegen, oder `route: 'eintraege/{*pfad}'` nur nach Test mit `swa start` pruefen.

**package.json** (`api/`):
```json
{
  "name": "api",
  "version": "1.0.0",
  "main": "src/functions/*.js",
  "dependencies": { "@azure/functions": "^4.0.0" }
}
```
`main` mit Muster `src/functions/*.js` entspricht dem Functions-v4-Muster (Quelle: https://learn.microsoft.com/azure/azure-functions/functions-reference-node#programming-model). Exakte `@azure/functions`-Version: UNBELEGT, mit `npm install @azure/functions` die aktuelle Version ermitteln.

**host.json**: Inhalt nicht belegt (UNBELEGT). Minimal ueblicher Inhalt waere `{"version":"2.0"}`, hier nicht per Quelle bestaetigt.

**Limits (managed):**
- Nur HTTP-Trigger, keine Timer/Queue. Quelle: https://learn.microsoft.com/azure/static-web-apps/apis-functions#constraints
- Max. 45 s pro API-Request. Quelle: https://learn.microsoft.com/azure/static-web-apps/apis-overview#constraints
- Keine WebSockets. Quelle: gleiche Seite.
- Request-Body-Limit im Free-Tarif: 30 MB. Quelle: https://learn.microsoft.com/azure/static-web-apps/quotas
- Reservierte App-Setting-Praefixe inkl. `FUNCTIONS_`. Damit ist `FUNCTIONS_REQUEST_BODY_SIZE_LIMIT` in managed Functions nicht setzbar (Ableitung aus der Liste, Quelle: https://learn.microsoft.com/azure/static-web-apps/apis-functions#constraints).
- Antwort-Streaming: Node-Streams sind in Functions v4 belegt (`app.setup({ enableHttpStream: true })`, Functions Runtime 4.28+, `@azure/functions` 4.3.0+; https://learn.microsoft.com/azure/azure-functions/node-http-stream). Ob managed SWA-Functions das unterstuetzen: UNBELEGT. Vor Verwendung testen.
- Zeitlimit Functions allgemein (Consumption): UNBELEGT in dieser Recherche.

## 2. Authentifizierung

**Routen** (belegt, https://learn.microsoft.com/azure/static-web-apps/authentication-authorization#set-up-sign-in):
- Login GitHub: `/.auth/login/github`
- Login Entra: `/.auth/login/aad`
- Logout: `/.auth/logout`
- Benutzerdaten: `/.auth/me` (liefert `{ "clientPrincipal": {...} }` oder `null`; https://learn.microsoft.com/azure/static-web-apps/user-information#direct-access-endpoint)

**Rueckkehr nach Login:** `/.auth/login/github?post_login_redirect_uri=https://<host>/seite` (absolute URL, belegt).

**Nur GitHub erlauben** (Entra blockieren, belegt, https://learn.microsoft.com/azure/static-web-apps/authentication-authorization#block-an-authentication-provider):
```json
{
  "routes": [
    { "route": "/.auth/login/aad", "statusCode": 404 }
  ]
}
```
Hinweis: Dokumentation nutzt diese Form mit `routes` als Array. Der gleiche Eintrag soll laut Doku auch im Single-Objekt-Format funktionieren; nur das Array-Format ist hier verwendet.

**Header in der Function:** `x-ms-client-principal` ist Base64 eines JSON-Objekts (belegt: https://learn.microsoft.com/azure/static-web-apps/user-information#api-functions). Felder laut Doku: `identityProvider`, `userId`, `userDetails`, `userRoles`. Im Header fehlt `claims` (belegt).

Dekodierung in Node 22:
```javascript
const raw = request.headers.get('x-ms-client-principal');
const principal = raw ? JSON.parse(Buffer.from(raw, 'base64').toString('utf8')) : null;
// principal = { identityProvider: 'github', userId, userDetails, userRoles: [...] }
```

**userId stabil?** Laut Doku ist `userId` pro App eindeutig, gilt pro Ressource (andere SWA = andere ID) und bleibt fuer die Lebensdauer des Users stabil. Wer entfernt und wieder hinzugefuegt wird, bekommt eine neue ID (belegt: https://learn.microsoft.com/azure/static-web-apps/user-information#client-principal-data). Konsequenz: `userId` nicht als dauerhaften Schluessel ueber App-Grenzen oder Neuanlage hinweg verwenden. Fuer Datenzuordnung besser `identityProvider` + `userDetails` (GitHub-Login) oder die ID zusammen mit App-Umgebung verwenden. Stabilitaet ueber eine Neuanlage der Ressource: belegt als "nicht".

**Free-Tarif-Einschraenkung:** Im Free-Tarif ist GitHub vorkonfiguriert (kein eigenes OAuth-Setup). Eigene Registrierung ("custom registrations") erst Standard. Quelle: https://learn.microsoft.com/azure/static-web-apps/plans#features

## 3. staticwebapp.config.json

**Belegte Eigenschaften** (https://learn.microsoft.com/azure/static-web-apps/configuration):
- `routes[]`: `route`, `methods`, `rewrite`, `redirect`, `statusCode`, `headers`, `allowedRoles`. Regeln werden in Reihenfolge ausgewertet, erste Uebereinstimmung gewinnt.
- `allowedRoles`: OR-Verknuepfung. Eingebaute Rollen `anonymous` und `authenticated`. Eigene Rollen per Einladung zuweisen.
- `responseOverrides`: Status 400, 401, 403, 404 (Beispiel 401 zu 302 Redirect).
- `globalHeaders`: gilt fuer jede Antwort, nicht fuer API-Antworten; Route-Header ueberschreiben globale Header.
- `mimeTypes`: als Abschnitt belegt, Syntax nicht im Detail geprueft. UNBELEGT fuer `.wasm`, `.webmanifest`, `.whl`, `.zip`.
- `navigationFallback`: `rewrite` plus optional `exclude` (Muster belegt).
- Limits: max. 20 KB Datei, max. 50 verschiedene Rollen.

**Beispiel fuer Multi-Page-Site ohne SPA-Fallback, oeffentliche Seiten, /api/*:**

Eigenschaften zusammengefasst (Beispielstruktur, Syntax laut Doku):
```json
{
  "platform": { "apiRuntime": "node:22" },
  "routes": [
    {
      "route": "/sw.js",
      "headers": { "Cache-Control": "no-cache, no-store, must-revalidate" }
    },
    {
      "route": "/app/*",
      "allowedRoles": ["authenticated"]
    },
    {
      "route": "/api/*",
      "allowedRoles": ["authenticated"]
    },
    { "route": "/.auth/login/aad", "statusCode": 404 }
  ],
  "responseOverrides": {
    "401": { "statusCode": 302, "redirect": "/.auth/login/github" }
  },
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff"
  },
  "mimeTypes": {
    ".wasm": "application/wasm",
    ".webmanifest": "application/manifest+json"
  }
}
```
Anmerkungen:
- Kein `navigationFallback`, damit unbekannte Pfade 404 liefern (belegt: https://learn.microsoft.com/azure/static-web-apps/configuration#example-configuration-file).
- `/api/*` mit `allowedRoles` schuetzt die API nur auf Routing-Ebene. Functions muessen zusaetzlich `x-ms-client-principal` pruefen (belegt in der Doku: https://learn.microsoft.com/azure/static-web-apps/configuration#routes).
- `Cache-Control` fuer `/sw.js`: Route-Header ueberschreiben `globalHeaders` (belegt).
- Der `mimeTypes`-Block und das `.whl`/`.zip`-Mapping: UNBELEGT, vor Deployment pruefen.
- `/app/*` mit Wildcard-Ende: belegt (Muster am Ende). Folgt Ausschluss-Regel "Wildcard nur am Ende" (belegt).
- Die `401`-Override-Zeile ist belegt; `/.auth/login/github` als Redirect-Ziel nach Doku-Beispiel `/login` angelehnt.
- Pyodide-Wheels laden direkt von `cdn.jsdelivr.net` oder aehnlich (Client-seitig), kein SWA-Thema.

**Lokaler Test vor Deploy:** `swa start` (siehe Abschnitt 6).

## 4. Limits Free-Tarif (belegt, https://learn.microsoft.com/azure/static-web-apps/quotas und https://learn.microsoft.com/azure/static-web-apps/plans)

| Merkmal | Free |
|---|---|
| Max. App-Groesse | 250 MB (Gesamt je App inkl. Umgebungen: 500 MB) |
| Dateien | 15.000 |
| Bandbreite/Monat | 100 GB, Overage nicht verfuegbar |
| Apps pro Abo | 10 |
| Preview-Umgebungen | 3 |
| Custom Domains | 2 |
| Einladungen (Rollen) | 25 |
| Rollen per Function | nicht verfuegbar |
| Private Endpoint / IP-Filter | nicht verfuegbar |
| SLA | keine |
| Auth-Provider | vorkonfiguriert |
| Request-Size | 30 MB |

Abweichend: Die Plan-Tabelle gibt Staging-Umgebungen mit "3 per app" an, Quota-Tabelle "Preview environments 3". Konsistent.

**Regionen:** Bei Anlage waehlt man die Region der Functions. Verfuegbare Regionen-Liste: UNBELEGT (nicht abgerufen). Verwende im Portal oder mit `az staticwebapp create --location ...` die angebotene Region, Westeuropa-Verfuegbarkeit ist nicht belegt. Hinweis: Flex-Consumption-Functions sind laut Q&A in West Europe noch nicht verfuegbar (Quelle: https://learn.microsoft.com/answers/a/1897586). Das betrifft SWA managed functions nicht direkt. Quelle: https://learn.microsoft.com/azure/static-web-apps/faq#how-do-i-ensure-my-app-is-deployed-to-a-specific-azure-region

**Speicherbedarf:** 250 MB je Umgebung reicht fuer statische Vorlesungsseiten mit Pyodide wohl, wenn Pyodide selbst nicht hochgeladen wird. Bei Pyodide-Hosting in der App kann die Groesse kritisch werden (UNBELEGT, Groesse nicht ermittelt).

**Free-Plan ist Hobby/Entwicklung:** Die Doku nennt "For personal projects" fuer Free und "For production apps" fuer Standard (https://learn.microsoft.com/azure/static-web-apps/plans#features). Fuer Studierende in Produktion Standard in Erwaegung ziehen.

## 5. Deployment ohne GitHub Action (SWA CLI)

Belegt (https://learn.microsoft.com/azure/static-web-apps/static-web-apps-cli-deploy und https://learn.microsoft.com/azure/static-web-apps/static-web-apps-cli):

Installation (Dev-Abhaengigkeit, nicht global):
```bash
npm install -D @azure/static-web-apps-cli
```
Alternativ `npx @azure/static-web-apps-cli ...`.

Anmeldung und Deployment-Token:
```bash
npx swa login --resource-group <RG> --app-name <SWA-NAME> --subscription-id <SUB-ID>
```
Laut Doku nutzt `swa login` die bestehende Anmeldung oder oeffnet einen Browser. Bestehende `az login`-Session wird im Quick-Start nicht explizit als Quelle genutzt, sondern `swa login` selbst. Beziehung zu `az login`: UNBELEGT.

Deployment mit Token aus Umgebungsvariable:
```bash
SWA_CLI_DEPLOYMENT_TOKEN=<TOKEN> npx swa deploy ./site --api-location ./api --env production
```
Deployment mit Token als Option:
```bash
npx swa deploy ./site --api-location ./api --deployment-token <TOKEN> --env production
```
Token anzeigen:
```bash
npx swa deploy --print-token
```
Wichtig: Default-`--env` ist `preview` (belegt, Optionsliste). Produktion nur mit `--env production`.

Statischer Ordner `./site` muss `staticwebapp.config.json` enthalten (belegt: "add one under your outputLocation folder", https://learn.microsoft.com/azure/static-web-apps/static-web-apps-cli-deploy#deploy-a-front-end-app-with-an-api).

Konfigurationsdatei `swa-cli.config.json` (optional, belegt):
```json
{
  "configurations": {
    "app": {
      "appLocation": "site",
      "apiLocation": "api",
      "outputLocation": ".",
      "deploy": { "outputLocation": "." }
    }
  }
}
```
Dann nur `npx swa deploy --env production` oder `npx swa deploy app --env production`. `appLocation` und `outputLocation` (relativ) sind belegt; dass `outputLocation` relativ zu `appLocation` sein muss, ist belegt.

**Bekannte Probleme:**
- Windows: Community-Berichte zu IPv6 vs. IPv4 bei `localhost`. Quelle (Community): https://github.com/Azure/static-web-apps-cli/issues/598 (nicht offiziell, Lage nicht gelesen). Workaround: Registry-Einstellung zur IPv4-Praeferenz (UNBELEGT im Detail).
- Node 20.13+ bricht laut GitHub-Issue `swa start` (Aenderung im http-Modul). Quelle (Community): https://github.com/Azure/static-web-apps-cli/issues/598 bzw. Suchergebnis. UNBELEGT, ob aktuell behoben.
- Deploy-Fehler mit CLI 2.0.3 und Node 15-20 unter Windows (Q&A 2025, keine Loesung gefunden): https://learn.microsoft.com/en-us/answers/questions/2168033/how-to-resolve-node-error-when-deploying-azure-sta (Titel "How to resolve Node error when deploying azure static web app"; Inhalt nicht vollstaendig gelesen).
- Die Quota-/Deploy-Frage "Deployment ohne GitHub Action" ist im Prinzip vom Token-Zugriff abhaengig.

## 6. Lokale Emulation

**Befehl** (belegt, https://learn.microsoft.com/azure/static-web-apps/add-api#run-the-frontend-and-api-locally und https://learn.microsoft.com/azure/static-web-apps/static-web-apps-cli#swa-start):
```bash
npx swa start ./site --api-location ./api
```
Standardport: `http://localhost:4280` (belegt, https://learn.microsoft.com/azure/static-web-apps/static-web-apps-cli-overview#how-it-works).

**Auth-Emulator:** `http://localhost:4280/.auth/login/github` oeffnet eine Seite, auf der man Benutzername, Rollen und Claims frei setzt (belegt, https://learn.microsoft.com/azure/static-web-apps/local-development#authorization-and-authentication-emulation). `/.auth/logout` beendet die Sitzung. `/.auth/me` liefert den Mock-Principal.

**Functions Core Tools:** Die CLI startet Core Tools automatisch, wenn installiert nicht noetig (belegt: Fussnote auf overview-Seite). Vorhandene Version des Entwicklungsrechners: Functions Core Tools 4.15.2. Mindestversion fuer Streaming: 4.0.5530 (belegt).

**Node-Version:**
- Offizielle SWA-CLI-Doku (Install): "SWA CLI only supports Node versions 16 and below" (belegt: https://learn.microsoft.com/azure/static-web-apps/static-web-apps-cli-install).
- Community meldet Probleme mit Node 18 und 20.13+ (nicht offiziell).
- Node 26 fuer Functions: laut Doku Preview nur Linux, nicht Windows (belegt: https://learn.microsoft.com/azure/azure-functions/functions-reference-node#programming-model). Auf Windows also Node 26 fuer `func` NICHT nutzen.
- Empfehlung fuer den Entwicklungsrechner (Windows 11, Node 26 installiert): nvm-windows mit Node 20.12.2 oder 22 fuer `swa start`/`func` testen. Verbindliche Kombination: UNBELEGT. Die offizielle Angabe "16 und darunter" steht im Widerspruch zu Community-Erfahrungen; zuerst mit Node 20.12.2 testen, dann mit 16 als Fallback.
- Nicht-verifiziert: welche Node-Version Core Tools 4.15.2 exakt erwartet (UNBELEGT).

**Ports:** SWA-Emulator 4280 (belegt). Functions-Host Standard 7071 (belegt im Beispiel https://learn.microsoft.com/azure/static-web-apps/static-web-apps-cli#swa-start). Dev-Server der Front-End-App bei Bedarf: `swa start http://localhost:3000 --api-location ./api`.

## 7. Spaeter: GitHub Actions (vorgebaute App, Git LFS)

Quelle: https://learn.microsoft.com/azure/static-web-apps/build-configuration#skip-building-the-app und https://learn.microsoft.com/azure/static-web-apps/faq#how-do-i-deploy-an-app-that-uses-git-large-file-storage-lfs

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches: [main]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true
          lfs: true
      - name: Build and deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: upload
          app_location: site
          api_location: api
          output_location: ""
          skip_app_build: true
```
Hinweise:
- `skip_app_build: true` und `output_location: ''` sind belegt. Dann ist `app_location` das Ausgabeverzeichnis, und `staticwebapp.config.json` muss darin liegen (belegt).
- Fuer die API: `api_location: api` und `skip_api_build` nur verwenden, wenn die API vorab gebaut wird (belegt).
- `actions/checkout@v4`: Version nicht gegen Doku geprueft; die FAQ-Seite nennt `@v2` (historisch). Aktuelle Version: UNBELEGT.
- Linux-Runner noetig, weil der Build-Motor in einem Linux-Docker-Container laeuft (belegt: FAQ).

## 8. Offene Punkte / UNBELEGT

1. Node 26 und 24 als `apiRuntime` fuer SWA-managed Functions: nicht offiziell gelistet, UNBELEGT.
2. Antwort-Streaming in managed Functions: UNBELEGT.
3. Catch-all-Route `{*pfad}` in SWA-Routing und Functions: UNBELEGT.
4. `mimeTypes`-Syntax und Eintraege fuer `.whl`/`.zip`: UNBELEGT.
5. Region westeurope fuer SWA managed Functions: UNBELEGT.
6. Node-Version fuer `swa start` (offiziell <= 16, Community: 20.12.2 funktioniert, 20.13+ nicht): Konflikt, UNBELEGT was aktuell gilt.
7. Kosten Cosmos DB Serverless und Gesamtbudget unter 30 USD: UNBELEGT (nicht Teil dieser Recherche).
8. Zeitlimits Functions allgemein (Consumption): UNBELEGT.
9. Groesse Pyodide-Dateien im Verhaeltnis zu 250 MB Limit: UNBELEGT.
10. `actions/checkout`-Version: UNBELEGT.

## Quellenliste (offiziell, sofern nicht anders markiert)

- https://learn.microsoft.com/azure/static-web-apps/configuration
- https://learn.microsoft.com/azure/static-web-apps/languages-runtimes
- https://learn.microsoft.com/azure/static-web-apps/authentication-authorization
- https://learn.microsoft.com/azure/static-web-apps/authentication-custom
- https://learn.microsoft.com/azure/static-web-apps/user-information
- https://learn.microsoft.com/azure/static-web-apps/quotas
- https://learn.microsoft.com/azure/static-web-apps/plans
- https://learn.microsoft.com/azure/static-web-apps/apis-overview
- https://learn.microsoft.com/azure/static-web-apps/apis-functions
- https://learn.microsoft.com/azure/static-web-apps/add-api
- https://learn.microsoft.com/azure/static-web-apps/static-web-apps-cli
- https://learn.microsoft.com/azure/static-web-apps/static-web-apps-cli-deploy
- https://learn.microsoft.com/azure/static-web-apps/static-web-apps-cli-install
- https://learn.microsoft.com/azure/static-web-apps/static-web-apps-cli-overview
- https://learn.microsoft.com/azure/static-web-apps/local-development
- https://learn.microsoft.com/azure/static-web-apps/build-configuration
- https://learn.microsoft.com/azure/static-web-apps/faq
- https://learn.microsoft.com/azure/azure-functions/functions-reference-node
- https://learn.microsoft.com/azure/azure-functions/node-http-stream
- https://learn.microsoft.com/azure/azure-functions/functions-bindings-http-webhook-trigger
- Community (nicht offiziell): https://github.com/Azure/static-web-apps-cli/issues/598
