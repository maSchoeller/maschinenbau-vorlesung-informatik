# 3D-Vorschau

Wiederverwendbare Vorschau für Bauteile, die ein Python-Programm als Dreiecksnetz (Mesh) berechnet. Drehbar, zoombar, mit Maßangabe und STL-Export. Alles läuft im Browser; three.js liegt lokal (r160, `site/assets/vendor/three/`, kein CDN) und wird erst beim ersten Aufruf geladen. Dafür muss die Seite über einen Server laufen (ES-Module, nicht über `file://`).

Demo: `site/werkzeuge/3d-vorschau.html` (Daten aus `site/assets/data/3d-demo.json`, erzeugt mit `bauteil3d.py`).

## Mesh-Format

```json
{"name": "Flansch", "vertices": [[x, y, z], ...], "faces": [[i, j, k], ...]}
```

Einheit Millimeter, z zeigt nach oben, Dreiecke gegen den Uhrzeigersinn von außen gesehen (Normalen nach außen).

## JavaScript

Einbinden (Pfade je nach Seitentiefe):

```html
<link rel="stylesheet" href="../assets/css/vorschau3d.css">
<script src="../assets/js/vorschau3d.js"></script>
```

| Aufruf | Wirkung |
| --- | --- |
| `Vorschau3D.zeige(container, mesh)` | Baut die Ansicht in `container` (Element oder Selektor). `mesh` darf auch ein JSON-Text sein. Gibt ein Handle mit `zuruecksetzen()`, `entsorgen()`, `stl()` zurück. Ein erneuter Aufruf im selben Container ersetzt die Ansicht. |
| `Vorschau3D.stl(mesh)` | ASCII-STL als Text (braucht kein three.js). |

Bedienung: Maus ziehen = drehen, Mausrad = zoomen, rechte Taste = verschieben; Touch: ein Finger dreht, zwei zoomen; Tastatur (Ansicht fokussieren): Pfeile drehen (mit Shift grober), `+` und `-` zoomen, `0` oder Pos1 setzt zurück. Dazu die Knöpfe „Ansicht zurücksetzen“ und „STL herunterladen“ (Dateiname aus `mesh.name`), darunter Abmessungen der Bounding Box und Dreieckszahl. Die Ansicht ist `role="img"` mit Name und Maßen im `aria-label`. Ohne WebGL oder bei nicht ladbarer Bibliothek erscheint ein Hinweis; Maße und STL-Download bleiben nutzbar.

## Python: `bauteil3d.py`

Reine Standardbibliothek, läuft in Pyodide und normalem Python (`site/assets/py/bauteil3d.py`). Alle Teile haben ihre Achse in z und beginnen bei z = 0.

| Funktion | Ergebnis |
| --- | --- |
| `zylinder(d, l, segmente=48)` | Vollzylinder |
| `ring(d_aussen, d_innen, l)` | Hohlzylinder |
| `welle(absaetze)` | Gestufte Welle aus `[(Durchmesser, Länge), ...]` |
| `flansch(d_aussen, d_innen, dicke, lochkreis, n_bohrungen, d_bohrung)` | Flansch mit echten Bohrungen (`lochkreis` = Lochkreisdurchmesser) |
| `verschiebe(mesh, dx, dy, dz)` | Kopie, verschoben |
| `vereinige(mesh1, mesh2, ..., name=)` | Meshes zusammenhängen (keine boolesche Vereinigung) |
| `volumen(mesh)`, `abmessungen(mesh)` | Volumen in mm³, Bounding Box (x, y, z) |
| `zeige(mesh, name=None)` | Sendet das Mesh per `kursausgabe.zeige('3d', json)` an die Vorschau; ohne Modul `kursausgabe` nur ein Hinweis mit den Maßen |

Die Netze sind geschlossen (jede Kante in genau zwei Dreiecken) und das Volumen ist positiv und entspricht dem Sollvolumen des facettierten Körpers.

## Beispiel für V20: Klasse `Flansch`

```python
import bauteil3d

class Flansch:
    def __init__(self, d_aussen, d_innen, dicke, lochkreis, n, d_bohrung):
        self.d_aussen = d_aussen
        self.d_innen = d_innen
        self.dicke = dicke
        self.lochkreis = lochkreis
        self.n = n
        self.d_bohrung = d_bohrung

    def mesh(self):
        return bauteil3d.flansch(self.d_aussen, self.d_innen, self.dicke,
                                 self.lochkreis, self.n, self.d_bohrung)

f = Flansch(120, 40, 15, 90, 6, 11)
bauteil3d.zeige(f.mesh(), "Flansch DN40")
```

Ausgabe im Labor: die Vorschau erscheint unter der Textausgabe, mit „STL herunterladen“. Aufgabenidee: Studierende ändern `n` oder `lochkreis` und sehen sofort die Wirkung; ungültige Maße (Bohrung ragt über den Rand) lösen einen `ValueError` mit verständlicher Meldung aus.

## Anbindung an den Python-Runner

Nachricht vom Worker: `{type: 'rich', art: '3d', daten: <Mesh>}`; der Main-Thread ruft `Vorschau3D.zeige(container, daten)` auf (siehe `SCHNITTSTELLEN.md`, Abschnitt 3).

## three.js aktualisieren

`npm pack three@<version>`, `build/three.module.min.js` und `examples/jsm/controls/OrbitControls.js` nach `site/assets/vendor/three/` kopieren, in `OrbitControls.js` den Import `from 'three'` auf `from './three.module.min.js'` ändern, `VERSION.md` und `LICENSE` nachziehen.
