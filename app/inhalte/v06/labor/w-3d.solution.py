from bauteil3d import *
reihe = zylinder(10, 30)
for x in range(25, 101, 25):
    reihe = vereinige(reihe, verschiebe(zylinder(10, 30), x))
zeige(reihe)
