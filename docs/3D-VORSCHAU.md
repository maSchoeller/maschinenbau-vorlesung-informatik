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

## Beispiel: Aufgabe mit 3D-Vorschau (Termin 06)

Eine Code-Aufgabe lädt das Modul über `data-files` ins Arbeitsverzeichnis; der Pfad ist relativ zur Lektionsseite (`../assets/py/bauteil3d.py`). Die Labor-Seite muss `kurs.js` einbinden. Ohne `data-files` meldet der Lauf „ModuleNotFoundError … import vergessen?“, was dann in die Irre führt.

```mdx
<Aufgabe art="code" id="w-3d" data-mode="code" data-files="../assets/py/bauteil3d.py">

<Editor datei="labor/w-3d.vorlage.py" aria-label="Python-Code: Säulenreihe" />

<Python rolle="tests" datei="labor/w-3d.tests.py" />

<Python rolle="solution" datei="labor/w-3d.solution.py" />

</Aufgabe>
```

`w-3d.vorlage.py` (so liegt sie in `app/inhalte/v06/labor/`):

```python
# Säulenreihe: 5 Säulen, Abstand 25 mm, die erste steht bei x = 0.
# Die Werkzeuge: zylinder(10, 30) ist eine Säule (Durchmesser 10, Höhe 30), verschiebe(säule, x) setzt sie
# um x mm nach rechts, vereinige(a, b) hängt zwei Körper zusammen, zeige(körper) zeigt ihn.
from bauteil3d import *
reihe = zylinder(10, 30)
# Hier fehlen die Schleife und ihr Rumpf.
zeige(reihe)
```

`w-3d.tests.py`:

```python
def test_abmessungen():
    """Die Reihe ist 110 mm lang"""
    assert abs(abmessungen(reihe)[0] - 110) < 0.5

def test_volumen():
    """Fünf Säulen mit dem Volumen des facettierten Zylinders"""
    assert abs(volumen(reihe) - 5 * volumen(zylinder(10, 30))) < 1
```

Nur mit `data-mode="code"` laufen die Tests im selben Namensraum wie der Schülercode (bei `programm` bleibt der Namensraum leer und sie enden mit NameError). Sie dürfen `reihe`, `abmessungen` und `volumen` direkt nutzen. Vergleiche das Volumen mit dem facettierten Sollwert (`volumen(zylinder(...))`), nicht mit π · r² · l (2 349,5 statt 2 356,2 mm³ je Säule, rund 0,3 % Unterschied). Im Testmodus wird die Vorschau ohne Handler verworfen, ohne Fehler. Der erste Lauf lädt Pyodide (rund 10 MB; `bauteil3d` braucht nur `json` und `math`). Die Schreibweise der Aufgaben steht in `docs/app/INHALTE.md`.

## Anbindung an den Python-Runner

Nachricht vom Worker: `{type: 'rich', art: '3d', daten: <Mesh>}`; der Main-Thread ruft `Vorschau3D.zeige(container, daten)` auf (siehe `SCHNITTSTELLEN.md`, Abschnitt 3).

## three.js aktualisieren

`npm pack three@<version>`, `build/three.module.min.js` und `examples/jsm/controls/OrbitControls.js` nach `site/assets/vendor/three/` kopieren, in `OrbitControls.js` den Import `from 'three'` auf `from './three.module.min.js'` ändern, `VERSION.md` und `LICENSE` nachziehen.
