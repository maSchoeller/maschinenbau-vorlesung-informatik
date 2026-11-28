# Schraube: Die Funktion schraube(d, l) gibt Kopf und Schaft als einen Körper zurück.
# Die Werkzeuge: zylinder(durchmesser, laenge) ist ein Zylinder,
# verschiebe(körper, dx, dy, dz) setzt ihn um dx nach rechts, dy nach hinten und dz nach oben,
# vereinige(a, b) hängt zwei Körper zusammen, zeige(körper) zeigt ihn.
from bauteil3d import *

# Hier fehlt die Funktion schraube(d, l).

gross = schraube(10, 40)
klein = verschiebe(schraube(6, 25), 40, 0, 0)
zeige(vereinige(gross, klein))
