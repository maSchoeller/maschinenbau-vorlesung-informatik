# V05 neu: Problemanalyse & Programmablaufplan (verbindliche Vorgabe)

Entscheidung des Dozenten: **Programmablaufplan (PAP) nach DIN 66001 / ISO 5807 statt Struktogramm.** Leichter von Hand zu zeichnen, in der Klausur gefordert. Das Struktogramm (Nassi-Shneiderman) kommt nur noch als kurzer Vergleich vor (ein Absatz plus kleines Bild, gern im Deep Dive).

- Titel: **V05 Problemanalyse & Programmablaufplan** · Hook: **„Der PAP wird zum Prompt“** (ein sauberer PAP ist eine eindeutige Spezifikation – für dich, für Kollegen und für die KI).
- Python-Strang V05 (unverändert): PAP → Code, verschachtelte Verzweigungen, `elif`, Eingabe auf Plausibilität prüfen. Erlaubt ist nur, was bis V04 eingeführt ist plus diese Punkte. **Keine Schleifen, kein `def`, kein `try/except`.** Rücksprünge im PAP (Schleifen) nur als Ausblick auf V06.
- Dateien: `site/lektionen/v05-programmablaufplan.html` (per `git mv` aus `v05-struktogramm.html`), `site/lektionen/v05-labor.html`, `site/notebooks/V05-Programmablaufplan.ipynb` (per `git mv`).

## Symbole (nur diese, in dieser Benennung)
| Symbol | Form | Bedeutung | Python |
|---|---|---|---|
| Grenzstelle | Oval / Rechteck mit Halbkreis-Enden, Text „Start“ bzw. „Ende“ | Beginn und Ende des Ablaufs | – |
| Operation | Rechteck | Verarbeitung, Rechnung, Zuweisung | `werkstoff = "C45E"` |
| Ein-/Ausgabe | Parallelogramm | Daten einlesen oder ausgeben | `input()`, `print()` |
| Verzweigung | Raute mit Frage, Ausgänge mit „ja“/„nein“ beschriftet | Entscheidung | `if` / `else`, Kette → `elif` |
| Ablauflinie | Linie mit Pfeilspitze | Reihenfolge; Vorzugsrichtung oben → unten, links → rechts | – |
| Übergangsstelle | kleiner Kreis mit Nummer | Linie wird an anderer Stelle (z. B. nächste Seite) fortgesetzt, vermeidet Kreuzungen | – |
| Unterprogramm | Rechteck mit doppelten senkrechten Seitenlinien | nur erwähnen (kommt in V07 mit `def`) | – |

Zeichenregeln (als Merke-Kasten): genau ein Start, mindestens ein Ende · jede Raute hat einen Eingang und beschriftete Ausgänge · Zweige laufen wieder zusammen (Linie mündet mit Pfeil in Linie) · Linien kreuzen sich nicht (sonst Übergangsstelle) · Text im Symbol kurz und eindeutig, Bedingung als Frage („spannung ≤ 140?“) · Pfeile immer zeichnen.

Übersetzungsregeln PAP → Python: Parallelogramm → `input`/`print` · Rechteck → Zuweisung/Rechnung · Raute → `if … :` (ja-Zweig) / `else:` (nein-Zweig) · Raute direkt im nein-Zweig einer Raute → `elif` · Raute innerhalb eines Zweigs → verschachteltes `if` (eine Stufe tiefer eingerückt) · Zusammenführung der Linien → Ende der Einrückung.

Testfälle je Pfad: jeder Weg von Start zu Ende ist ein Testfall; dazu Grenzwerte an jeder Raute (genau 140, 140.1 …). Beim Werkstoffbeispiel gibt es **6 Pfade**: unplausibel · >300 °C & ≤200 MPa · >300 °C & >200 MPa · ≤300 °C & ≤140 · ≤300 °C & ≤220 · ≤300 °C & >220.

## Vorgerechnetes Beispiel
Exakt der Code aus `briefing/v05-beispiel.py` (Werkstoffvorschlag für eine Welle), jetzt als PAP gezeichnet: Start → Parallelogramm „spannung einlesen“ → Parallelogramm „temperatur einlesen“ → Raute „Eingabe unplausibel?“ (ja → Ausgabe „unplausibel“ → Ende) → nein → Raute „temperatur > 300?“ → ja: Raute „spannung ≤ 200?“ (ja „16Mo3“, nein „Sonderwerkstoff“) · nein: Rauten-Kette ≤140 / ≤220 / sonst → Zusammenführung → Parallelogramm „Werkstoff ausgeben“ → Ende.

## Explorables / Interaktion (Lerneinheit)
1. **Symbol-Lexikon**: die sechs Symbole groß, Klick zeigt Bedeutung + passende Python-Zeile.
2. **PAP läuft ab**: Eingaben wählen (Schieberegler/Felder für Spannung, Temperatur), eine Marke wandert animiert entlang der Ablauflinien, aktive Symbole und der gerade genommene Ausgang sind rot hervorgehoben, daneben wird die passende Python-Zeile markiert. Schritt-Knopf und Abspielen.
3. **PAP-Baukasten**: vorgegebenes PAP-Gerüst mit Lücken; Studierende wählen Symbolart und Text (z. B. Bedingung, Werte) – rechts entsteht live der Python-Code, der direkt ausführbar ist.
4. **Fehler im PAP finden** (Selbstcheck oder Ausprobieren): PAP mit typischen Fehlern (unbeschrifteter Rauten-Ausgang, offener Zweig ohne Ende, Rechteck statt Parallelogramm für Eingabe) – anklicken.

Labor zusätzlich: PAP gegeben → Code (mehrfach), Code gegeben → fehlende PAP-Symbole/Texte ergänzen, Testfälle je Pfad aufschreiben, Klausur-Modus „PAP gegeben → Code von Hand“, Training: einen PAP auf Papier zeichnen und mit Musterlösung (SVG, eingeklappt) vergleichen. Selbstcheck enthält „Code schreiben im Klausurstil: PAP gegeben“.

## Darstellung
PAPs als **inline-SVG** (skaliert, `role="img"` + `aria-label` mit dem Ablauf in Worten), Strich dunkelgrau 1.5–2 px, Füllung weiß bzw. sehr helles Grau, „ja/nein“ klein an den Ausgängen, aktive Elemente in DHBW-Rot #E2001A. Lesbar bei 375 px (ggf. horizontal scrollbar nur innerhalb der Grafik oder vereinfachte Mobilversion). Keine Emojis.

## Videos (gleicher Inhalt)
- `v05-theorie`: Warum ein Plan vor dem Code (Problemanalyse: Eingabe – Verarbeitung – Ausgabe), die Symbole, der Werkstoff-PAP entsteht Schritt für Schritt, eine Marke läuft einen Pfad ab, „Der PAP wird zum Prompt“.
- `v05-python`: Übersetzungsregeln PAP → Python an kleinen Beispielen (if/else, elif-Kette, verschachteltes if, Plausibilitätsprüfung mit `or`).
- `v05-beispiel`: Werkstoff-PAP neben dem Code aus `briefing/v05-beispiel.py`, Zeile für Zeile übersetzt, dann die 6 Testfälle je Pfad.
