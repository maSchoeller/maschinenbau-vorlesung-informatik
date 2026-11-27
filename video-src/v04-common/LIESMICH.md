# v04-common: Plan mit Rücksprung (Schleife) für die Videos zu Termin 04 und 05

Gilt für `v04-beispiel` (while) und `v05-beispiel` (Zählschleife); gedacht für jedes Video, das einen Plan mit Schleife zeigt.

- `b04.py`: importiert alles aus `v02-common/b02.py` (und damit `v01-common`: `weg_vis`, `weg_hl`, `reveal`, `E`, `kopf`, Symbole aus `v05-common/pap.py`) und ergänzt die Schleife. Die Linienführung entspricht der Lern-App (`site/assets/js/pap-engine.js`, Knoten `while`): **ja** geht unten aus der Raute durch den Rumpf, der **Rücksprung** läuft vom letzten Rumpfsymbol links nach oben und mündet von links in die Linie über der Raute, **nein** geht rechts aus der Raute, an der Schleife vorbei nach unten und führt von rechts in das nächste Symbol. Die Zählschleife ist dieselbe Form mit dem Text `i von 1 bis n?` (die App setzt hinter den Text ebenfalls ein Fragezeichen).
- `demo.py`: drei Standbilder nach `out/` (nicht im Repository). Aufruf `python demo.py`.

Größe: die Pläne sind schmal und hoch (while-Plan etwa 300 × 540, Zählschleife mit sieben Symbolen etwa 324 × 605 im Planraum). `plan_fit` bricht ab, wenn die Schrift unter 17 px fällt; mit `fs=20` braucht der Zählschleifen-Plan eine Box von mindestens etwa 570 px Höhe (z. B. `(60, 100, 560, 576)`), der while-Plan etwa 530 px.

## Bausteine

| Baustein | Wozu |
|---|---|
| `schleife_plan(items, fs=20, gap=22, ret=30, spalt=22)` | baut den Plan; gibt ein `Dia` mit `.reihenfolge`, `.spec`, `.into` zurück |
| `schleife_draw(f, a, D, box, vis=None, hl=None, maxzoom=1.4, bg=BG, label_col=None, marker=None)` | zeichnet in `box` (übermalt sie, also zuerst), gibt `(zoom, cam)` zurück; hervorgehobene Kanten liegen oben, ja/nein werden in der Farbe der Kante gesetzt |
| `schleife_weg(D, {schleife: n})` | Schlüssel eines Laufs mit `n` Durchgängen in Laufreihenfolge (`n = 0`: nein gleich beim ersten Mal) |
| `schleife_marke(D, keys, p)` | Punkt (Planraum) bei Anteil `p` 0..1 der Wegstrecke für `marker=`; läuft durch die Symbole mittig, nie schräg |
| `schleife_route(D, keys)` | die Polylinie dazu |
| `weg_vis(keys, rest, a)`, `weg_hl(keys, col, nur)`, `reveal(t, tm)` | aus `b02`: Weg abblenden, Weg rot, Symbole nacheinander einblenden |

`items`: `(schluessel, "term" | "io" | "proc", text[, opts])`, Schleifen als `(schluessel, "loop", "bedingung?", rumpf_items[, opts])`. Die Schleife darf nicht das letzte Symbol einer Folge sein, der Rumpf endet mit einem normalen Symbol, Schleifen dürfen verschachtelt sein.

**Schlüssel der Kanten** (für Schleife `w`): `a-b` zwischen zwei aufeinanderfolgenden Symbolen (auch `x-w` in die Raute hinein), `w-ja` aus der Raute in das erste Rumpfsymbol (beschriftet), `w-zurueck` der Rücksprung, `w-nein` aus der Raute zum Symbol nach der Schleife (beschriftet). `D.reihenfolge` zählt alle Schlüssel in Aufbau-Reihenfolge auf (Kante vor ihrem Symbol, `w-zurueck` nach dem Rumpf, `w-nein` vor dem Symbol danach).

## Beispiel 1: while (v04-beispiel)

```python
P = schleife_plan([("s", "term", "Start"), ("e", "io", "Eingabe: preis"), ("i", "proc", "summe = 0"),
                   ("w", "loop", "preis != 0?", [("a", "proc", "summe = summe + preis"), ("e2", "io", "Eingabe: preis")]),
                   ("o", "io", 'Ausgabe: "Summe: ... Euro"'), ("end", "term", "Ende")])
# Aufbau: tm = {k: t0 + 0.3 * i for i, k in enumerate(P.reihenfolge)}; vis=reveal(t, tm)
schleife_draw(f, 1.0, P, (60, 100, 560, 576), hl={"w-zurueck": RED})                 # Rücksprung rot
W = schleife_weg(P, {"w": 3})                                                        # Lauf mit 12, 8, 5, dann 0
schleife_draw(f, 1.0, P, (60, 100, 560, 576), vis=weg_vis(W), hl=weg_hl(W), marker=schleife_marke(P, W, ap(t, t0, 6.0)))
schleife_draw(f, 1.0, P, (60, 100, 560, 576), vis=weg_vis(schleife_weg(P, {"w": 0})), hl=weg_hl(schleife_weg(P, {"w": 0})))   # nur die 0
```

## Beispiel 2: Zählschleife (v05-beispiel)

```python
P = schleife_plan([("s", "term", "Start"), ("n", "io", "Eingabe: n"), ("i", "proc", "summe = 0"),
                   ("w", "loop", "i von 1 bis n?", [("e", "io", "Eingabe: minuten"), ("a", "proc", "summe = summe + minuten")]),
                   ("m", "proc", "mittel = summe / n"), ("o", "io", "Ausgabe: mittel"), ("end", "term", "Ende")])
schleife_draw(f, 1.0, P, (60, 100, 560, 576), hl={k: RED for k in ("w", "w-ja", "e", "e-a", "a", "w-zurueck")})
```

Szenenbild beider Pläne: `python demo.py`, dann `out/b04-*.png`.
