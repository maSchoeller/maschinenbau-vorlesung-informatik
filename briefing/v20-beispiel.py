# Parametrischer Flansch als Klasse: Maße prüfen, Masse berechnen, 3D-Vorschau
# (V20: class, __init__, Attribute, Methoden)
# Hilfsmodul bauteil3d.py (im Labor mitgeliefert) erzeugt das Dreiecksnetz.

import math
import bauteil3d


class Flansch:
    """Kreisförmiger Flansch mit Mittelloch und Bohrungen auf einem Lochkreis (Maße in mm)."""

    def __init__(self, d_aussen, d_innen, dicke, lochkreis, n, d_bohrung):
        self.d_aussen = d_aussen
        self.d_innen = d_innen
        self.dicke = dicke
        self.lochkreis = lochkreis
        self.n = n
        self.d_bohrung = d_bohrung

    def ist_gueltig(self):
        """Bohrungen dürfen weder ins Mittelloch noch über den Rand ragen."""
        rand_aussen = (self.lochkreis + self.d_bohrung) / 2 < self.d_aussen / 2
        rand_innen = (self.lochkreis - self.d_bohrung) / 2 > self.d_innen / 2
        return rand_aussen and rand_innen

    def volumen(self):
        """Volumen in mm³ (Kreisring minus Bohrungen)."""
        ring = math.pi / 4 * (self.d_aussen ** 2 - self.d_innen ** 2) * self.dicke
        bohrungen = self.n * math.pi / 4 * self.d_bohrung ** 2 * self.dicke
        return ring - bohrungen

    def masse(self, dichte=7.85):
        """Masse in kg, Dichte in g/cm³ (Standard: Stahl)."""
        return self.volumen() / 1000 * dichte / 1000

    def mesh(self):
        return bauteil3d.flansch(self.d_aussen, self.d_innen, self.dicke,
                                 self.lochkreis, self.n, self.d_bohrung)


f = Flansch(120, 40, 15, 90, 6, 11)
print("Gültig:", f.ist_gueltig())
print(f"Volumen: {f.volumen() / 1000:.1f} cm³, Masse: {f.masse():.2f} kg")

f.n = 8                                  # Attribut ändern: acht statt sechs Bohrungen
print(f"Mit {f.n} Bohrungen: {f.masse():.2f} kg")

zu_gross = Flansch(120, 40, 15, 110, 6, 14)
print("Lochkreis 110 mm, Bohrung 14 mm gültig?", zu_gross.ist_gueltig())

bauteil3d.zeige(f.mesh(), "Flansch DN40")
