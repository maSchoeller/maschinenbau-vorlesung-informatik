# editor-build

Baut die gebündelte Editor-Bibliothek und die Daten der Befehls-Bibliothek für die Vorlesungs-Website.
Zur Laufzeit gibt es keinen CDN-Zugriff für den Editor: alles liegt unter `site/assets/`.

## 1. CodeMirror-Bundle

```
cd tools/editor-build
npm install        # exakte Versionen aus package.json (ältere, stabile CodeMirror-6-Releases)
npm run build      # esbuild -> site/assets/vendor/codemirror.bundle.js
```

- Ergebnis: eine IIFE-Datei, die `window.CM` setzt (`CM.state`, `CM.view`, `CM.commands`, `CM.language`,
  `CM.autocomplete`, `CM.search`, `CM.highlight`, `CM.python`, `CM.pythonLanguage`).
- `package.json` pinnt `@codemirror/state`, `view`, `language` und `@lezer/highlight` zusätzlich per `overrides`,
  damit nur **eine** Instanz von `@codemirror/state` im Bundle landet (`npm ls @codemirror/state` zeigt nur „deduped“).
- Versionen ändern: `package.json` anpassen, `npm install`, `npm run build`, danach den Editor in `lektionen/v03-*.html` testen.

## 2. Befehls-Bibliothek (`site/assets/data/bibliothek.json`)

```
python tools/editor-build/bibliothek-quelle/bauen.py
```

- Quellen: `bibliothek-quelle/teil1.py` (V01–V03), `teil2.py` (V04–V07), `teil3.py` (V08–V09 + Stichworte ab V10).
- Das Skript **führt jedes Codebeispiel aus** (Beispiel, Transfer, Fehlerbeispiele) und bricht bei Fehlern ab.
  Die Fehlermeldungen in `typische_fehler` sind die echten letzten Traceback-Zeilen der lokalen Python-Version;
  Pyodide (Python 3.12) kann in Details abweichen (z. B. „Did you mean …“-Hinweise).
- Beispiele mit `lauffaehig: false` (z. B. `input`) bekommen im Browser keinen „Ausprobieren“-Knopf.
- Eintragsschema: `id, name, kategorie, eingefuehrt, ampel, kurz, syntax, erklaerung, beispiel, beispiel_ausgabe,
  wann_nutzen, transfer[{situation, code}], typische_fehler[{beschreibung, code, meldung}], verwandt[ids],
  bezeichner[], lauffaehig, suchbegriffe[]`. `bezeichner` steuert Hover/Vorschläge:
  `".append"` = Methode, `"math.sqrt"` = Modul-Mitglied, `"print"` = Name, `"//"` = Operator.
  Stichwort-Einträge (ab V10) haben nur `id, name, kategorie, eingefuehrt, ampel, kurz, syntax, verwandt, stichwort: true`.

## Einbindung auf einer Seite

```html
<script src="../assets/js/editor.js" defer></script>
```

`editor.js` lädt Stylesheet (`editor.css`), Bundle und Daten selbst relativ zur eigenen URL.
`textarea.py-editor` und die Code-Felder der Runner (`.k-runner__code`) werden automatisch zu Editoren;
`data-assist="off"` (Textarea oder Vorfahre) schaltet den Klausur-Modus ein, `data-lesson="V03"` bestimmt den Lernstand.
Jedi für die echte Vervollständigung wird beim ersten Fokus über den Pyodide-Worker aus `kurs.js` nachgeladen
(`KursPy.ensureJedi()`, `KursPy.rpc(...)`), ohne Jedi bleibt es bei der Grund-Vervollständigung.
