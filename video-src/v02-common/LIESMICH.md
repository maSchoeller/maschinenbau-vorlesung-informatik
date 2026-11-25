# v02-common: Bausteine für die Videos zu Termin 02 und 03

Gilt für `v02-theorie`, `v02-python`, `v02-beispiel`, `v03-theorie`, `v03-python`, `v03-beispiel`.

- `b02.py`: die neuen Bausteine. Importiert alles aus `v01-common/bausteine.py` (Farben, Schriften, `kopf`, `E`, `show`, `tag`, `chip`, `card`, `TB`, `cpanel`, `code_n`, `lauf_panel`, `plan`, `symbol`, `reveal`, `aktuell`, `run`, `dispatch` …). `v01-common` bleibt unverändert.
- `demo.py`: zeigt jeden neuen Baustein auf einem Standbild. Aufruf `python demo.py`, die Bilder landen in `out/` (nicht im Repository).
- `h.py`: **nicht löschen.** `v05-common/pap.py` (Plan-Symbole, auch für Termin 01) importiert `h` aus diesem Ordner. Die Datei ist eine unveränderte Kopie von `alt/v02-common/h.py`; ohne sie lassen sich auch die Videos von Termin 01 nicht mehr erzeugen.

Jeder Text wird gegen seinen Kasten (`fit`, `TB`) und den Bildrand (`T2`) geprüft, die neuen Bausteine prüfen zusätzlich die Höhe (`imbild`). Ein Überlauf bricht `scan` und `probe` ab.

## Die Bausteine

Zeichenfunktionen mit `d` bekommen ein `ImageDraw` und werden wie in Termin 01 über `E(f, t, tin, lambda d, dy: …)` eingeblendet; `y + dy` nicht vergessen. Funktionen mit `f, t` blenden selbst ein.

### Plan mit Raute

| Baustein | Wozu | Beispiel |
|---|---|---|
| `plan_zweig(items, fs=20, gap=26, mitte=40)` | Plan mit Verzweigung: ja-Weg links, nein-Weg rechts, beide laufen wieder zusammen (Punkt). Rauten dürfen in einem Weg stehen (zwei Rauten = drei Wege), leere Wege sind erlaubt. | `P = plan_zweig([("s", "term", "Start"), ("e", "io", "Eingabe: alter"), ("d", "dec", "alter >= 16?", [("j", "io", 'Ausgabe: "Einlass"')], [("n", "io", 'Ausgabe: "Kein Einlass"')]), ("o", "io", 'Ausgabe: "Der Nächste bitte"'), ("end", "term", "Ende")])` |
| `plan_draw(f, a, D, box, vis, hl, maxzoom)` | ersetzt `plan_draw` aus Termin 01: hervorgehobene Kanten liegen oben, ja/nein größer und in der Farbe des Wegs | `plan_draw(f, 1, P, (60, 104, 580, 520), vis=weg_vis(W), hl=weg_hl(W))` |
| `weg(D, {raute: "ja"/"nein"})` | Schlüssel aller Symbole und Kanten eines Wegs, in Laufreihenfolge | `W = weg(P, {"d": "ja"})` |
| `weg_vis(keys, rest=0.3, a=1)` | `vis` für `plan_draw`: nicht gegangene Wege abblenden (`a` blendet über) | `vis=weg_vis(W, a=show(t, a(2)))` |
| `weg_hl(keys, col=RED, nur=None)` | `hl` für `plan_draw`: der gegangene Weg in Rot | `hl=weg_hl(W)` |
| `zusammen(D, raute)` | die beiden Kanten, die nach der Raute zusammenlaufen | `hl={k: RED for k in zusammen(P, "d")}` |
| `D.reihenfolge` | alle Schlüssel von oben nach unten, für den Aufbau mit `reveal` | `tm = {k: t0 + 0.3 * i for i, k in enumerate(P.reihenfolge)}` |

Schlüssel der Kanten: `a-b` zwischen zwei Symbolen, `d-ja` / `d-nein` aus der Raute (beschriftet), `d-ja-z` / `d-nein-z` vom Wegende in den Zusammenführungspunkt, `d-x` vom Punkt zum nächsten Symbol `x`. Ein leerer Weg hat nur `d-ja` bzw. `d-nein`. In der Raute steht die Python-Schreibweise mit Fragezeichen (`geld >= 1.5?`).

Größe: Der Einlass-Plan ist im Planraum etwa 525 × 413 groß, der Automat mit drei Wegen etwa 858 × 509. `plan_fit` bricht ab, wenn die Schrift unter 17 px fällt. Für „links klein“ neben Code reicht beim Einlass-Plan eine Box ab etwa 460 px Breite; der Plan mit drei Wegen braucht die halbe Bildhöhe und fast die volle Breite (oder `fs` kleiner, aber nicht unter 17 px Schrift).

Eine einzelne Raute ohne Wege: `symbol(f, a, "dec", "geld >= 1.5?", box)` aus Termin 01. Eine Raute mit kurzen ja/nein-Wegen als Ausblick: `plan_zweig([("d", "dec", "geld >= 1.5?", [], [])])`.

### Wahrheitstabelle

| Baustein | Wozu | Beispiel |
|---|---|---|
| `wahrheitstabelle(f, t, x, y, spalten, zeilen, t_spalten, t_zellen=None, hl=None, hl_a=1, breiten=None, rh=62, size=36, kopf_size=32, trenner=None, farbig="ergebnis")` | Spalten erscheinen nacheinander, Werte füllen sich zeilenweise, Zeilen lassen sich hervorheben. 1/wahr grün, 0/falsch rot, standardmäßig nur in den Ergebnisspalten ab `trenner`. Gibt `(breite, hoehe)` zurück. | `wahrheitstabelle(f, t, x, 200, ["A", "B", "A UND B"], UND, [a(1), a(1), a(4)], [a(3), a(3), zeilenweise(a(5), 0.4, 4)], hl={3} if t > a(5, 0.8) else None, trenner=2)` |
| `zeilenweise(t0, dt, n)` | Zeiten für Zellen, die nacheinander erscheinen | `zeilenweise(a(5), 0.4, 4)` |
| `tabelle_breite(spalten)`, `tabelle_hoehe(n, rh)` | Maße zum Zentrieren | `x = 640 - tabelle_breite(SP) / 2` |

Termin 02 (NICHT) schreibt wahr/falsch in die Tabelle, ab Termin 03 stehen 1 und 0 darin.

### Vergleich mit Ergebnis

| Baustein | Wozu | Beispiel |
|---|---|---|
| `vergleich(d, x, y, links, op, rechts, size=56, unter=None, op_col=None, anchor="l")` | Vergleich groß im Code-Kasten, wie getippt (`>=`, `<=`, `==`); `unter` beschriftet die beiden Seiten. Gibt die Lage von Kasten, Zeichen und Seiten zurück. | `vergleich(d, 640, 300 + dy, "2", ">=", "1.5", 72, unter=("dein Geld", "Preis der Cola"), anchor="m")` |
| `vergleich_mass(links, op, rechts, size)` | Breite und Höhe des Kastens | `bw, bh = vergleich_mass("16", ">=", "16", 44)` |
| `vergleich_zeile(f, t, x, y, links, op, rechts, t_in, t_erg, sprache="python", size=56, unter=None, ergebnis=None)` | Vergleich, dann Pfeil und Ergebnis; das Ergebnis wird nachgerechnet. `sprache`: `"python"` (True/False), `"deutsch"` (wahr/falsch), `"weg"` (ja/nein). | `vergleich_zeile(f, t, 120, 300, "1.5", ">", "1.5", a(3), a(3, 0.5), "deutsch", ergebnis="falsch")` |
| `wert_chip(d, x, y, wert, h=64)` | True/False, wahr/falsch, ja/nein, 1/0 als grüne oder rote Kapsel | `wert_chip(d, 900, 300 + dy, "False")` |
| `durchstreichen(d, x0, y0, x1, y1, col=RED, art="schraeg")` | ein Zeichen oder einen Wert durchstreichen | `durchstreichen(d, ox0 - 8, y + 16, ox1 + 8, y + 80)` |

Für den Haken daneben: `check_circle(d, x, y, r)` aus Termin 01.

### Programmlauf und Markierungen im Code

| Baustein | Wozu | Beispiel |
|---|---|---|
| `code_lauf(d, x, y, w, lines, t, size=24, lh=42, times=None, aktiv=None, grau=None, nums=None)` | Code-Kasten wie in Termin 01; `aktiv` = laufende Zeilen (markiert), `grau` = übersprungene Zeilen. Gibt `CodeGeo` zurück (mit `.h`). | `g = code_lauf(d, 460, 124 + dy, 760, CODE, t, 24, 42, aktiv={2}, grau={4, 5})` |
| `CodeGeo(x, y, w, size, lh, n)` | Lage der Zeichen: `zy(i)`, `zmitte(i)`, `cx(c)`, `zeichen(i, c0, c1)`, `h` | `g = CodeGeo(460, 124, 760, 24, 42, 7)` |
| `spalte(zeile, teil, von_rechts=False)` | Spalten eines Teilstrings | `spalte('if alter >= 16:', ':', True)` |
| `code_markiere(d, g, i, c0, c1, col=RED)` | Rahmen um Zeichen (Doppelpunkt, `f"`, `{preis}`, `:.2f`) | `code_markiere(d, g, 2, *spalte(CODE[2], ":", True))` |
| `code_einrueckung(d, g, i, n=4, col=AMBER)` | die vier Leerzeichen der Einrückung sichtbar machen | `code_einrueckung(d, g, 3)` |
| `code_fluchtlinie(d, g, i0, i1, c=0, col=RED)` | gestrichelte Linie: `if`, `elif`, `else` stehen auf derselben Höhe | `code_fluchtlinie(d, g, 2, 6)` |
| `zeilen_notiz(d, g, i, x, w, text, fill=LIGHTK, col=DARK, size=26, outl=None)` | Etikett rechts neben einer Code-Zeile, mit Linie | `zeilen_notiz(d, g, 1, 740, 480, "32 < 30 ist falsch: nein", LIGHTR, RED, outl=RED)` |

Ein- und Ausgaben zeigt weiter `lauf_panel` aus Termin 01; die Zeilen kommen aus einem echten Lauf (`run(code, eingaben)`), wie in `v01-beispiel`.

### Bildzeichen

| Baustein | Wozu | Beispiel |
|---|---|---|
| `automat(d, x, y, s=1.0, preis="1,50 €", flaschen=6, ausgabe=False, beschriftung="Cola")` | Getränkeautomat, etwa 300 × 440 bei `s=1`; `flaschen=0` = Fach leer, `ausgabe=True` = Flasche im Ausgabefach | `automat(d, 80, 130 + dy, 1.0, flaschen=0)` |
| `muenze(d, cx, cy, r, wert="2 €")` | Münze | `muenze(d, 900, 300 + dy, 46, "1 €")` |
| `aussage_karte(d, x, y, w, h, name, text, col=BLUE, size=34)` | Aussage mit Namen: A, B, NICHT A | `aussage_karte(d, 60, 140 + dy, 560, 92, "A", "„Das Geld reicht“")` |
| `werkzeugkarte(d, x, y, w, h, nr, titel, code=None, untertitel=None, col=RED, code_size=26)` | Karte aus dem Werkzeugkasten; blass dahinter mit `f.el(0.35 * show(t, tin), …)` und `col=GREY` | `werkzeugkarte(d, 60, 350 + dy, 560, 230, 1, "elif", "elif sekunde < 35:", "mehr als zwei Wege")` |
| `wertereihe(d, x, y, w, werte, h=120, size=48)` | Probewerte nebeneinander (darunter, auf der Grenze, darüber) | `wertereihe(d, 60, 470 + dy, 1160, [("1,00 €", "darunter", GREY), ("1,50 €", "auf der Grenze", RED), ("2,00 €", "darüber", GREY)])` |
| `bahn(t, t0, dur, p0, p1)` | weich bewegter Punkt (Raute wandert zum Code, Wörter wandern in die Raute) | `x, y = bahn(t, a(1), 0.8, (200, 300), (700, 160))` |
| `imbild(y0, y1, what)` | Höhenprüfung für eigene Elemente | `imbild(y, y + h, "Ampel")` |

Nicht hier, weil nur ein Video sie braucht: Ampel und Zeitstrahl (v03-python), Museumskasse und Achterbahn-Schild (v03-theorie, v03-python), Stempel wahr/falsch (v02-theorie), Fehlermeldungs-Karten (v02-python). Diese Zeichen gehören in die jeweilige `render.py`.

## Gerüst für eine render.py

Abgeleitet aus `v01-theorie/render.py`. `SRC` kommt unverändert aus `texte.py`; die Bilder folgen `SZENEN`.

```python
"""Termin 02, Video 1: Wahr oder falsch: Aussagen und Vergleiche (Automat, Aussage, Vergleich, Grenzfall, NICHT).
Aufruf: python render.py [text|zeiten|scan|probe [Ordner]|stills t1 t2 ..]
Vertonung (tts) sowie full und mux startet nur der Orchestrator."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "v01-common"))
sys.path.insert(0, os.path.join(HERE, "..", "v02-common"))
from b02 import *
from texte import SRC

NAME = "v02-theorie"; LABEL = "DHBW · Informatik · Termin 02 · Wahr oder falsch"
SECS = make_secs(SRC)
AT = {i: zeiten(SECS, i) for i in range(1, len(SECS) + 1)}

# ---------------------------------------------------------------- Fachwerte (nachgerechnet)
PREIS = 1.5
assert (2 >= PREIS) is True and (1 >= PREIS) is False and (1.5 >= PREIS) is True and (1.5 > PREIS) is False

# ---------------------------------------------------------------- 1 <Thema der Szene>
def sc1(f, t, ct):
    a = lambda k, fr=0.0: AT[1](ct, k, fr)          # a(k, anteil): Zeitpunkt im Satz k (ab 0) dieser Szene
    kopf(f, t, "Stimmt der Satz?")
    E(f, t, 0.4, lambda d, dy: automat(d, 80, 130 + dy, 1.0, "1,50 €"))
    E(f, t, a(1, 0.2), lambda d, dy: aussage_karte(d, 460, 150 + dy, 760, 96, "A", "„Das Geld reicht“"))
    E(f, t, a(1, 0.6), lambda d, dy: (muenze(d, 520, 330 + dy, 44, "2 €"), wert_chip(d, 600, 298 + dy, "wahr")))
    E(f, t, a(2, 0.4), lambda d, dy: (muenze(d, 520, 450 + dy, 44, "1 €"), wert_chip(d, 600, 418 + dy, "falsch")))
    E(f, t, a(3, 0.3), lambda d, dy: tag(d, 60, 590 + dy, 1160, 72, "Aussage: wahr oder falsch, dazwischen nichts", RED, WHITE, 36))

# ---------------------------------------------------------------- 2 <Thema der Szene>
def sc2(f, t, ct):
    a = lambda k, fr=0.0: AT[2](ct, k, fr)
    kopf(f, t, "Aus dem Satz wird ein Vergleich")
    E(f, t, a(2, 0.2), lambda d, dy: vergleich(d, 640, 180 + dy, "2", ">=", "1.5", 72,
                                                unter=("dein Geld", "Preis der Cola"), anchor="m"))
    # ... sc3, sc4, sc5 nach SZENEN

SCENES = {1: sc1, 2: sc2}          # alle Szenen eintragen: {1: sc1, 2: sc2, 3: sc3, 4: sc4, 5: sc5}
assert len(SRC) == len(SCENES)

def poster(path):
    f = Frame()
    def fn(d, dy):
        d.rectangle((0, 0, 24, H), fill=RED)
        T2(d, 90, 110, "Termin 02 · Informatik", F(34, 600), GREY)
        T2(d, 90, 160, "Wahr oder falsch", F(96, 700), DARK)
        T2(d, 90, 300, "Aussagen und Vergleiche", F(40, 400), GREY)
        tag(d, 90, 560, 560, 70, "Den Grenzfall prüfst du immer mit", RED, WHITE, 34)
        T2(d, 1220, 694, LABEL, F(16, 400), GREY, "ra")
    f.el(1, fn)
    f.el(1, lambda d, dy: vergleich(d, 90, 380, "2", ">=", "1.5", 64))
    f.img.save(path)

if __name__ == "__main__":
    dispatch(HERE, SRC, SECS, SCENES, LABEL, poster, NAME)
```

Hinweise:

- `LABEL` nach dem Muster `DHBW · Informatik · Termin 02 · <Titel>`, für die drei Videos von Termin 03 entsprechend `Termin 03`.
- `a(k, anteil)`: Ein Element erscheint in dem Satz, in dem es genannt wird. `python render.py zeiten` zeigt die Satzzeiten. Liegt `audio/s1.mp3 …` vor, richten sie sich nach dem Ton, sonst schätzt das Gerüst sie (14 Zeichen je Sekunde).
- Plan und Code nebeneinander: zuerst `plan_draw` (übermalt seine Box), dann `code_lauf`. Für Plan und Code gilt dieselbe Markierung: Raute `d` ↔ Zeile mit `if`, ja-Weg ↔ eingerückte Zeile darunter.
- Code, der im Bild steht, wird mit `run(...)` ausgeführt und die Ausgabe per `assert` geprüft (wie in `v01-beispiel`).
- Prüfen: `python render.py probe out/probe` und die Standbilder ansehen; `scan` muss ohne Abbruch durchlaufen.
