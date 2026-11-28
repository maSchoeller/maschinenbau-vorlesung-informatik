# PAP-Engine, PAP-Editor und Aufgabentyp „PAP zeichnen“

Dateien:

| Datei | Zweck |
|---|---|
| `site/assets/js/pap-engine.js` | `window.KursPAP`: Baum, Layout, SVG, Beschreibung, Baum ↔ Python (ohne DOM per node nutzbar) |
| `site/assets/js/pap-editor.js` | `window.KursPAPEditor`: Editor-Baustein, Seite `pap-editor.html`, Aufgabentyp |
| `site/assets/css/pap-editor.css` | Stile (enthält die PAP-Grundregeln, braucht kein `v05.css`) |
| `site/pap-editor.html` | Editor-Seite mit Demo-Aufgabe |
| `site/assets/js/explorables-v05.js` | Bausteine von Termin 05 (`byte`, `range`, `summe`), nutzt die Engine nicht; der alte PAP-Baukasten der früheren V05 ist entfernt, die Beispieldaten `wSpec`, `wRun`, `fehlerSpec` gibt es nicht mehr |

`explorables-v06.js` (Bausteine von Termin 06: `hexfarbe`, `doppelschleife`, `xorschrift`) nutzt die Engine nicht; die alte Fassung mit eigener PAP-Zeichnung (`papKopf`, `papFuss`, `papZaehl`) ist ersetzt. Die Plan-Regeln kommen aus `v05.css`, `v06.css` enthält nur `.v06-…`-Regeln.

## 1. Engine in drei Zeilen

```js
KursPAP.svg(spec, {label, cls, minw, badges}) / .figure(spec, opts) / .exportSvg(spec, {title, scale})   // SPEC -> SVG-Text
KursPAP.toPap(baum) / .toText(baum) / .parseCode(python, {erweitert:true}) / .marks(baum) / .fromJson(json)  // Baum <-> Python, Einfügestellen
KursPAP.P.start/end/io/op/sub/conn/iff/whil/repeat(...)   // SPEC-Knoten; Baum-Knoten: nIn nOut nOp nCall nIf nWhile nFor nRepeat
```

Seiten mit eigenem Explorable laden `<script src="…/pap-engine.js"></script>` und zeichnen z. B.:

```js
host.innerHTML = KursPAP.figure([
  KursPAP.P.start(),
  KursPAP.P.op('summe = 0'),
  KursPAP.P.whil('summe < 100?', [KursPAP.P.op('summe = summe + 7')]),
  KursPAP.P.io('Ausgabe: summe'),
  KursPAP.P.end()
]);
```

### Knotenarten (SPEC)

`start` · `end` · `io` (Parallelogramm, `shape:'op'` macht ein Rechteck) · `op` · `sub` (Unterprogramm, Rechteck mit Doppellinien) · `conn` (Übergangsstelle) · `if` (`yes`/`no`) · `while` (kopfgesteuert: Raute oben, `ja` nach unten durch den Rumpf `body`, Rückführung links in die Linie über der Raute, `nein` rechts hinaus) · `repeat` (fußgesteuert: erst `body`, dann Raute; `ja` führt links zurück vor den Rumpf, `nein` weiter).

### Baum-Knoten (Editor, Baukasten)

`{id, k, v}` mit `k`: `in` (`typ`: `float`/`int`/`str`, `prompt`), `out`, `op`, `call`, `if` (`yes`, `no`), `while`, `for`, `repeat` (`body`), `def` (`body`, `ret`; ab Termin 07, siehe „Funktion“ unten).

| Symbol | Python |
|---|---|
| Eingabe | `x = float(input("x: "))`, `int(...)`, oder nur `input(...)` |
| Ausgabe | `print(…)` |
| Operation | Anweisung |
| Unterprogramm | Funktionsaufruf, z. B. `abs(-3)` |
| Verzweigung | `if`; Raute direkt im Nein-Zweig → `elif`; sonst `else:` |
| Schleife kopfgesteuert | `while bedingung:` |
| Zählschleife | `for i in range(1, 6):` (im PAP eine Raute mit Rückführung; sie zeigt „i von 1 bis 5?“: `range(a, b)` wird zu „von a bis b − 1“ mit ausgerechneter Zahl, `range(a, n + 1)` zu „von a bis n“, `range(b)` zu „von 0 bis b − 1“; mit Schrittweite (ab Termin 06) wird `range(2, 20, 3)` zu „i von 2 bis 19, Schritt 3“, `range(0, hoehe + 1, abstand)` zu „y von 0 bis hoehe, Schritt abstand“ und `range(5, 0, -1)` zu „i von 5 bis 1, Schritt −1“ („bis“ heißt „nicht weiter als“; bei negativem Schritt nur mit Zahlen), alles andere bleibt wie getippt) |
| Schleife fußgesteuert | `while True:` … `if not bedingung: break` (die Bedingung ist die Wiederholungsbedingung: `ja` = zurück) |
| Funktion (ab Termin 07) | `def name(parameter):` mit eingerücktem Rumpf, zuletzt `return wert`; siehe unten |

`parseCode(src)` ohne Option verhält sich wie der V05-Baukasten (nur Zuweisung, `print`, `float(input())`, `if`/`elif`/`else`). Mit `{erweitert:true}` kommen `while`, `for … in …`, `int(input())`, `input()` und Aufrufe dazu. Blockköpfe wie `try` und `with` werden mit Zeilennummer abgelehnt; `def` ist ab Termin 07 erlaubt (Regeln unten).

### Funktion (`def`, ab Termin 07)

Ein Block der obersten Ebene. Knoten `{k:'def', v:'name(parameter)', body:[…], ret:'wert'}`: `v` ist der Funktionskopf, `body` der Rumpf aus den bekannten Symbolen, `ret` der Rückgabewert (leer heißt: kein `return`). Der Rückgabewert steht im eigenen Feld, nicht als Symbol im Rumpf; ein `return` mitten in einer Verzweigung ist deshalb im Editor nicht zeichenbar.

- **Code:** `toText` setzt alle Funktionen vor das Hauptprogramm (jede durch eine Leerzeile getrennt), egal wo der Block im Baum steht. Ein leerer Rumpf ohne Rückgabe ergibt `pass`, ein leerer Kopf die Lücke `pass  # Lücke: Funktionskopf eintragen`. Der Aufruf im Hauptplan ist ein `call`-Symbol (Unterprogramm), z. B. `ms = kmh_in_ms(kmh)`.
- **Zeichnung:** Der Hauptplan enthält keine `def`-Knoten. Jede Funktion bekommt einen eigenen kleinen Plan: Start-Oval mit dem Kopf (`kmh_in_ms(v)`), der Rumpf, am Ende ein Oval „Rückgabe wert“ (ohne `ret` das normale „Ende“). `toPapAll(baum)` liefert `[{def, spec}]` (Hauptplan zuerst), `svgAll`, `exportSvgAll`, `describeAll` und `marksAll` arbeiten über alle Pläne; im Editor stehen die Pläne untereinander, die Funktionen mit Überschrift. Ohne Funktion ändert sich nichts: ein Plan, dieselbe Ausgabe wie bisher.
- **Nummern:** Erst die Symbole des Hauptplans, dann die der Funktionen; die Funktion selbst (Start-Oval) trägt eine Nummer. Ein Klick auf das Rückgabe-Oval wählt die Funktion.
- **Einfügen:** Das Symbol „Funktion“ erscheint im Einfügemenü nur an Stellen der obersten Ebene (nie in Verzweigung, Schleife oder Funktion). Im Plan einer Funktion sind die Einfügestellen `{parent: def.id, slot: 'body'}`. Mit „Nach oben/unten“ sortieren sich Funktionen nur untereinander; Symbole kommen nicht aus einer Funktion in den Hauptplan und umgekehrt.
- **Parser:** `parseCode(src, {erweitert:true})` liest `def name(parameter):` nur auf Einrückung 0, höchstens zwei Parameter, ohne Standardwerte. `return` ist nur als letzte Zeile des Rumpfs erlaubt und wird zu `ret`. Fehler tragen die Zeilennummer („Zeile 3: return steht nur am Ende der Funktion.“). Aufrufe einer vorher definierten Funktion (`x = f(y)` oder `f(y)`) werden `call`-Symbole.
- **Freischalten:** Aufgaben tragen `data-erlaubt="def,op,out"` (Kennung `def`). Ohne `data-erlaubt` gilt die ganze Liste, der freie Editor kennt das Symbol immer; die Aufgaben der Termine 01 bis 06 nennen ihre Symbole und bleiben unverändert.
- **Im Text:** `<Plan>` kennt `Unterprogramm: aufruf` (Rechteck mit Doppellinien), als erste Zeile `Funktion: name(parameter)` (Start-Oval mit Namen) und als letzte Zeile `Rückgabe: wert` (Ende-Oval „Rückgabe wert“). Der Plan einer Funktion ist ein eigener `<Plan>`.

## 2. Editor-Seite

`site/pap-editor.html`: Name, Speichern, Neu, Vorlagen, gespeicherte PAPs; Plan (Plus-Marken zwischen den Symbolen und in leeren Zweigen); Bedienfeld unter dem Plan (Text, Datentyp, Hoch/Runter, Davor/Danach einfügen, In Zweig/Schleife einfügen, Löschen); Python-Code live mit Ausführen/Schritt für Schritt (Runner und Editor aus `kurs.js`/`editor.js`); „Code → PAP“; Export SVG und PNG; Hilfe zu den Symbolen; Demo-Aufgabe.

Speicherung über `KursSpeicher` (Pfade `inf-mb/pap-editor/datei:<Name>` und `inf-mb/pap-editor/entwurf`). Ist `window.KursSpeicher` nicht da, speichert der Editor in `localStorage` (`dhbw-inf-mb:pap-editor`) oder im Arbeitsspeicher.

Tastatur: Tab in den Plan, ↑/↓ Symbol wechseln, Enter Text bearbeiten, `+` oder Einfg danach einfügen (Umschalt: davor), Alt+↑/↓ verschieben (läuft in Verzweigungen und Schleifen hinein und wieder heraus), Entf löschen, Strg+Z / Strg+Y.

## 3. Aufgabentyp „PAP zeichnen“

Einbinden (Reihenfolge wie in den Laboren, `pap-engine.js` vor `pap-editor.js`):

```html
<link rel="stylesheet" href="../assets/css/pap-editor.css">
…
<script src="../assets/js/pap-engine.js"></script>
<script src="../assets/js/pap-editor.js"></script>   <!-- nach kurs.js und aufgaben.js -->
```

Kopierfertiges Beispiel (in einem `.l-task` eines Labors oder frei auf einer Seite):

```html
<div class="a-task k-pap-aufgabe" data-a="pap-zeichnen" data-id="summe-gerade" data-timeout="8000"
     data-erlaubt="in,out,op,if,while,repeat,for,call">
  <div class="a-task__head"><h3 class="a-task__title">Summe der geraden Zahlen</h3></div>
  <p>Zeichne einen PAP, der n einliest und die Summe der geraden Zahlen von 1 bis n ausgibt.</p>

  <!-- optional: Start-PAP (Baum als JSON) -->
  <script type="application/json" data-role="start">{"baum":[{"k":"in","v":"n","typ":"int"},{"k":"op","v":"summe = 0"}]}</script>

  <!-- Tests: wie bei Code-Aufgaben (data-role="tests"): test_*-Funktionen, run_program([...]), zeilen(), zahlen() -->
  <script type="text/x-python" data-role="tests">
def test_n10():
    """n = 10: Summe 30"""
    assert zahlen(run_program(["10"]))[-1] == 30
  </script>

  <!-- optional: Musterlösung (PAP als JSON), erst nach einem Prüfversuch sichtbar -->
  <script type="application/json" data-role="solution">{"baum":[{"k":"in","v":"n","typ":"int"},{"k":"op","v":"summe = 0"},{"k":"for","v":"i in range(1, n + 1)","body":[{"k":"if","v":"i % 2 == 0","yes":[{"k":"op","v":"summe = summe + i"}],"no":[]}]},{"k":"out","v":"summe"}]}</script>

  <ol class="a-hints"><li>Tipp 1 …</li><li>Tipp 2 …</li></ol>
</div>
```

Attribute: `data-id` (Pflicht, eindeutig je Lektion), `data-timeout` (ms, Standard 8000), `data-erlaubt` (Liste der angebotenen Symbolarten, Standard alle: `in,out,op,if,while,repeat,for,call`).

Ablauf: „Prüfen“ erzeugt aus dem PAP den Python-Code und führt die Tests aus (`KursAufgaben.runPython('test', …)`, Modus `programm`). Das Ergebnis erscheint wie bei Code-Aufgaben (Banner, Testliste, Fehlermeldungen). Leerer Plan oder leere Symbole werden vorher gemeldet. Bei Erfolg wird die Aufgabe über `KursAufgaben.store.setSolved(...)` als gelöst vermerkt (Abzeichen „gelöst“, Fortschritt und Aufgabenliste im Labor aktualisieren sich). „Begonnen“ setzt die erste Änderung. Der Stand des Plans liegt unter `inf-mb/<lektion>/pap:<data-id>` im `KursSpeicher` (Lektion kleingeschrieben). Der erzeugte Code ist unter „Erzeugten Python-Code ansehen und ausführen“ als normaler Runner erreichbar.

Tests prüfen das Verhalten des erzeugten Programms (Ausgaben bei bestimmten Eingaben), nicht die Form des Plans. Für die Eingaben kennt `run_program` nur die Liste der `input()`-Antworten; Zahlen liest `zahlen(text)` aus der Ausgabe. Tipp: Eingabeaufforderungen ohne Ziffern wählen, sonst stören sie `zahlen()`.

## 4. Änderungen an anderen Dateien

- `site/assets/js/explorables-v05.js`: Engine-Teil und Baum-Kern entfernt, nutzt `KursPAP`; Ausgabe (SVG, Code, Baukasten) in einem Vergleichstest gegen die alte Fassung identisch.
- `site/lektionen/v05-programmablaufplan.html`, `v05-labor.html`: Skript-Tag `pap-engine.js` vor `explorables-v05.js`.
- `aufgaben.js`, `labor.js`, `kurs.js`: unverändert (die Aufgabe nutzt die vorhandene API `KursAufgaben.runPython/store/update`).
