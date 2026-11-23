# Pyodide selbst hosten und offline verfuegbar machen

Stand: Recherche vom 2026-11-22. Projekt nutzt `PYODIDE_VERSION = 'v0.26.4'` (site/assets/js/kurs.js, Z. 8). Die Doku-Seite `stable` zeigt beim Abruf bereits v314.0.8; fuer 0.26.4 wurde die Doku unter `/en/0.26.4/` gelesen.

## Kurz-Fazit

- Kern (immer noetig): 5 Dateien, **13,78 MB** roh.
- Gesamtliste aller Kurs-Pakete (numpy, pandas, matplotlib, requests, sqlite3, jedi, micropip): **83,2 MB** roh. Der Brocken ist "daten" mit 61,2 MB.
- 83 MB sind fuer eine Azure-Static-Web-App und fuer den iPad-Cache unkritisch (siehe Abschnitt 5), sollten aber **nicht ins Git-Repo**, sondern beim Build oder Deploy geholt werden.
- Problem im Code: `micropip.install('jedi')` (kurs.js ca. Z. 523) laedt von **PyPI**, ist also offline nicht verfuegbar. Ersatz: `pyodide.loadPackage('jedi')` (jedi ist im Lock enthalten, Abhaengigkeit parso ebenfalls).

## 1. Kern-Dateien fuer 0.26.4 (Quelle: https://pyodide.org/en/0.26.4/usage/downloading-and-deploying.html)

| Datei | Bytes (roh) | Hinweis |
|---|---|---|
| pyodide.js | 14 761 | Legacy-Loader, im Worker per `importScripts` genutzt (Projekt bleibt dabei) |
| pyodide.asm.js | 1 229 099 | JS-Haelfte des Hauptbinaries |
| pyodide.asm.wasm | 10 088 051 | WASM-Haelfte |
| python_stdlib.zip | 2 341 872 | Stdlib + Pyodide-Laufzeit |
| pyodide-lock.json | 106 335 | Lockfile fuer loadPackage und micropip |

Alternativ `pyodide.mjs` (13 779 B) statt `pyodide.js`, nur bei ES-Modul-Einbindung. `pyodide_py.tar` ist fuer 0.26.4 auf CDN nicht vorhanden (404), die Doku nennt es nicht: **UNBELEGT**, nicht benoetigt.

Gemessen mit `curl -sI` (Content-Length) gegen `https://cdn.jsdelivr.net/pyodide/v0.26.4/full/`. Der Netz-Transfer mit gzip/brotli ist kleiner, aber nicht gemessen.

## 2. Pakete (aufgeloest aus pyodide-lock.json, rekursiv ueber `depends`)

Die Lock-Datei von 0.26.4 enthaelt **keine** Groessenangabe; die Bytes stammen aus HEAD-Requests auf jsDelivr. Vollstaendige Liste mit Dateinamen und Bytes: `docs/app/recherche/03-pyodide-dateien.json`.

- **daten** (61,16 MB): numpy-1.26.4 (11,96 MB), pandas-2.2.0 (23,76 MB), matplotlib-3.5.2 (15,74 MB), fonttools (4,27 MB), pillow (3,04 MB), pytz (1,08 MB), kiwisolver, python-dateutil, six, cycler, pyparsing, packaging, matplotlib-pyodide. Pandas und matplotlib ziehen numpy automatisch mit.
- **netz** (1,41 MB): requests-2.31.0, pyodide-http, urllib3, charset-normalizer, idna, certifi.
- **extras** (6,80 MB): jedi-0.19.1 (4,87 MB), sqlite3-1.0.0.zip (1,45 MB), parso-0.8.4, micropip-0.6.0.
- **kern** (13,78 MB): siehe Abschnitt 1.

Gesamt: 83 153 903 Bytes.

Kurs-Imports (grep ueber site/, ohne Lektionen-Duplikate): matplotlib.pyplot (23 Treffer), numpy (18), pandas (12), requests (6), sqlite3 (23). **scipy** kommt im Kurs nicht vor (nur in der Liste importsOf() in kurs.js). `paho.mqtt` (site/lektionen/v17-*) ist kein Pyodide-Paket und nicht im Lock: wird auch online nicht laufen.

## 3. Eigene Pfade laden (Quelle: https://pyodide.org/en/0.26.4/usage/api/js-api.html)

- `indexURL`: Standard ist die URL, von der pyodide geladen wurde. Ohne Aenderung von `lockFileURL` und `packageBaseUrl` reicht es, `indexURL` auf den eigenen Ordner zu setzen. Dann liegen alle Dateien (Kern, Lock, Wheels/Zips) nebeneinander.
- `lockFileURL` Default: `${indexURL}/pyodide-lock.json`.
- `packageBaseUrl` Default: Verzeichnis der lockFileURL. Die `file_name`-Eintraege im Lock sind relativ dazu.
- `packageCacheDir`: nur Node.js, im Browser ignoriert.

Konkret im Worker (kurs.js):

```js
var PYODIDE_VERSION = 'v0.26.4';
var PYODIDE_BASE = '/pyodide/' + PYODIDE_VERSION + '/';   // eigener Pfad statt cdn.jsdelivr.net
// Worker: importScripts(m.base + 'pyodide.js'); self.loadPyodide({ indexURL: m.base })
```

Ordnerstruktur im Deploy:

```
site/pyodide/v0.26.4/pyodide.js
site/pyodide/v0.26.4/pyodide.asm.js
site/pyodide/v0.26.4/pyodide.asm.wasm
site/pyodide/v0.26.4/python_stdlib.zip
site/pyodide/v0.26.4/pyodide-lock.json
site/pyodide/v0.26.4/*.whl  (bzw. *.zip fuer sqlite3)
```

Die Wheel-Dateien kommen aus dem Dist-Archiv `pyodide-0.26.4.tar.bz2` (Doku: "The full distribution ... adds .whl files"). Download-Befehl (ohne Projektbindung, in Scratch-Ordner):

```bash
V=0.26.4
B=https://cdn.jsdelivr.net/pyodide/v$V/full
# Kern
for f in pyodide.js pyodide.asm.js pyodide.asm.wasm python_stdlib.zip pyodide-lock.json; do curl -fL -o "$f" "$B/$f"; done
# Pakete: Dateinamen aus 03-pyodide-dateien.json (Feld "datei")
node -e 'const j=require("./03-pyodide-dateien.json");for(const g in j.gruppen)for(const x of j.gruppen[g])console.log(x.datei)' | while read f; do curl -fL -o "$f" "$B/$f"; done
```

Hinweis: Das Dist-Tar (`pyodide-0.26.4.tar.bz2`) waere die offizielle Quelle fuer Wheels, Dateinamen aus dem Lock sind aber ebenfalls von jsDelivr abrufbar. Ob dieselben Dateinamen im Dist-Tar liegen: nicht geprueft, UNBELEGT.

## 4. Pakete offline nachladen

- `pyodide.loadPackage(['numpy','pandas'])` nutzt den Lock und laedt von `packageBaseUrl`. Abhaengigkeiten werden aufgeloest.
- `pyodide.loadPackagesFromImports(code)` laedt nur aus der Distribution, nicht von PyPI (Doku).
- `micropip.install(...)` ist Standard-PyPI (Doku, Abschnitt "micropip.install"). Index-Url per `index_urls` aenderbar. **Im Projekt nicht verwenden, wenn Offline wichtig ist.**
- Jedi-Ersatz in kurs.js (Z. 522-523):

```js
pyodide.loadPackage('micropip').then(function () {
  return pyodide.loadPackage(['jedi']);          // statt micropip.install('jedi')
}).then(function () {
  return pyodide.runPythonAsync(JEDI_PY.join('\n'));   // "import micropip" entfaellt
})
```

Ob loadPackage('jedi') ohne Netz den Lock sauber aufloest, ist nicht im Browser getestet: UNBELEGT bis zum Test.

## 5. Service-Worker-Cache

Quelle: https://developer.mozilla.org/en-US/docs/Web/API/Cache (Cache-API) und https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist

Vorschlag (Cache-First, versionierter Name):

```js
const PY_CACHE = 'pyodide-v0.26.4';
const PY_BASE = '/pyodide/v0.26.4/';
// Liste aus dem Build-Schritt (Datei aus 03-pyodide-dateien.json), nicht von Hand
const KERN = ['pyodide.js','pyodide.asm.js','pyodide.asm.wasm','python_stdlib.zip','pyodide-lock.json'];

async function pyodideCachePut(names) {
  const cache = await caches.open(PY_CACHE);
  for (const n of names) {
    const url = PY_BASE + n;
    if (await cache.match(url)) continue;
    const res = await fetch(url);
    if (!res.ok) throw new Error(n + ' ' + res.status);  // nicht still ueberspringen
    await cache.put(url, res.clone());
  }
}
self.addEventListener('fetch', e => {
  if (!e.request.url.includes(PY_BASE)) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
```

- `cache.addAll()` ist atomar: schlaegt eine Datei fehl, wird nichts gespeichert. Der Loop oben ist lesbarer und kann einzeln fortsetzen (Quelle: Service-Worker-Spec, auf der MDN-Seite nicht ausdruecklich; UNBELEGT im Detail).
- `cache.put()` lehnt 206-Responses ab (Spec). Range-Requests sind nicht noetig, also kein Problem.
- Die Groessen-Angabe im Lock fehlt in 0.26.4; Content-Length ist ein Richtwert.
- Cache-Eintraege laufen nicht ab und werden nur bei Loeschung entfernt (MDN). Versionierter Cache-Name plus Alt-Cache-Loeschung in `activate` ist noetig.
- **MIME-Type**: Fuer `WebAssembly.instantiateStreaming` braucht die .wasm-Datei `application/wasm` (Emscripten-Doku, Pyodide-Doku sagt nur "correct WASM MIME type", UNBELEGT welche Stelle genau). jsDelivr liefert `python_stdlib.zip` ebenfalls als `application/wasm` aus. Fuer den Cache unkritisch, weil als ArrayBuffer geladen. Azure-SWA-Standard-MIME fuer .wasm und .zip: **UNBELEGT**, nach dem Deploy mit `curl -sI https://<host>/pyodide/v0.26.4/pyodide.asm.wasm` pruefen.
- Kompression: Der Server komprimiert (Azure SWA/jsDelivr). Das wird nicht gemessen: UNBELEGT wie viel Transfer sich spart.

Empfehlung fuer den Alltag: Kern beim ersten Besuch vorcachen; die Daten-Gruppe (61 MB) erst bei Bedarf oder ueber einen Button "Offline-Paket laden" in den Cache holen. Damit ist der erste Start schnell, und die Daten sind offline, sobald sie einmal geladen wurden.

## 6. Speichergrenzen und Persistenz (Quellen)

- **Chrome/Edge**: bis 60 % der Platte pro Origin, bis 80 % gesamt (https://web.dev/articles/storage-for-the-web, https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria). Inkognito deutlich weniger (~5 %).
- **Firefox**: Best-Effort 10 % der Platte oder 10 GiB (kleinerer Wert), Persistent 50 % bis 8 TiB (MDN).
- **Safari**: laut MDN etwa 60 % der Platte pro Origin fuer Browser-Apps und Home-Screen-Web-Apps. Aeltere Safari-Versionen: anfangs 1 GiB, dann Nachfrage in 200-MB-Schritten (web.dev, dort als nicht offiziell belegt).
- **navigator.storage.persist()**: liefert `true`, wenn Persistenz gewaehrt wird; Browser entscheidet selbst (MDN). Safari und Chromium entscheiden automatisch anhand der Nutzerinteraktion, ohne Dialog. Firefox fragt nach (MDN, web.dev).
- **Safari 7-Tage-Regel** (https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/): Safari loescht nach 7 Tagen ohne Nutzerinteraktion mit der Site den gesamten script-schreibbaren Speicher (IndexedDB, localStorage, Service-Worker-Registrierungen und Cache). **Ausnahme**: Auf dem Home-Bildschirm installierte Web-Apps haben einen eigenen Tageszaehler, der mit der tatsaechlichen Nutzung der App zurueckgesetzt wird.
- Konsequenz fuer iPad: Die PWA muss zum Home-Bildschirm hinzugefuegt werden, sonst gilt die 7-Tage-Regel fuer den Pyodide-Cache. Im Kurs-Hinweis dazu schreiben. `navigator.storage.persist()` zusaetzlich aufrufen, ist aber keine Garantie.
- Die 83 MB liegen weit unter dem Safari-Limit von 1 GiB (aeltere Versionen), also kein Quota-Problem.

## 7. Offene Punkte / UNBELEGT

- pyodide 0.26.4 mit `pyodide.js` in der Worker-Variante ohne Netz: nicht getestet.
- Ob `loadPackage('jedi')` ohne Netz den Lock fehlerfrei aufloest: nicht getestet.
- Azure-SWA-MIME-Typen fuer .wasm und .zip: nicht belegt.
- Ob jedi aus dem Lock dieselbe Version wie der aktuelle micropip-Install liefert: nicht geprueft (Lock hat jedi-0.19.1).
- Groessen ohne gzip/brotli. Netz-Transfer nicht gemessen.
- Pyodide-Doku-Stable zeigt v314.0.8. Das Projekt laeuft auf 0.26.4. Ein Versions-Upgrade waere eine eigene Entscheidung (Paket-Dateinamen aendern sich pro Version).
- Ob Azure Static Web Apps Free-Tarif Groessenlimits fuer einzelne Dateien oder Gesamtdeploy hat: UNBELEGT in dieser Recherche (nicht geprueft).

## Quellen

- https://pyodide.org/en/0.26.4/usage/downloading-and-deploying.html
- https://pyodide.org/en/0.26.4/usage/loading-packages.html
- https://pyodide.org/en/0.26.4/usage/api/js-api.html
- https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide-lock.json
- https://developer.mozilla.org/en-US/docs/Web/API/Cache
- https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist
- https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- https://web.dev/articles/storage-for-the-web
- https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/
