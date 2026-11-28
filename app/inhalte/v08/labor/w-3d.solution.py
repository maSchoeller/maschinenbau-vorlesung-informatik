from bauteil3d import *

def schraube(d, l):
    kopf = zylinder(2 * d, d)
    schaft = verschiebe(zylinder(d, l), 0, 0, d)
    return vereinige(kopf, schaft)

gross = schraube(10, 40)
klein = verschiebe(schraube(6, 25), 40, 0, 0)
zeige(vereinige(gross, klein))
