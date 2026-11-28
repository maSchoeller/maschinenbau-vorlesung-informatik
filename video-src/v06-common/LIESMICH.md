# v06-common: Plan mit der Raute in der Raute für das Video v06-beispiel (Kino)

`b06.py` importiert alles aus `v04-common/b04.py` und ergänzt:

- `kino_plan()`: der Plan des Kino-Programms von Hand gesetzt (Raute in der Raute, `platz == 1?` im inneren Rumpf; `b04.schleife_plan` kennt keine Entscheidung im Rumpf). Gibt ein `Dia` mit `.reihenfolge` (Aufbau-Reihenfolge aller Symbole und Kanten) und `.into` zurück.
- `kino_weg(P, [[1, 0, 1], [1, 1, 0]])`: Schlüssel eines Laufs (je Reihe die Plätze), für `weg_vis` und `weg_hl`.
- `kino_draw(f, a, P, box, vis=None, hl=None, minschrift=14)`: wie `schleife_draw`, aber mit kleinerer Mindestschrift (der Plan hat 12 Symbole und ist 718 px hoch; mit 17 px Mindestschrift passt er nicht in die Bildhöhe).

Kanten: `a-b` zwischen Symbolen, `wi-wj`, `wj-e`, `d-a` (ja), `d-nein` und `a-m` laufen in einem Punkt zusammen, `wj-zurueck` (innerer Rücksprung), `wj-nein` (inneres nein, zugleich äußerer Rücksprung), `wi-nein` (äußeres nein).
