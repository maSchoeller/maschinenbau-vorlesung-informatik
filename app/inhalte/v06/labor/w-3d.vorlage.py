# Säulenreihe: 5 Säulen, Abstand 25 mm, die erste steht bei x = 0.
# Die Werkzeuge: zylinder(10, 30) ist eine Säule (Durchmesser 10, Höhe 30), verschiebe(säule, x) setzt sie
# um x mm nach rechts, vereinige(a, b) hängt zwei Körper zusammen, zeige(körper) zeigt ihn.
from bauteil3d import *
reihe = zylinder(10, 30)
# Hier fehlen die Schleife und ihr Rumpf.
zeige(reihe)
