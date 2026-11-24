# Treffpunkt: Lea und Mia fahren gleichzeitig los, aufeinander zu.
abstand = float(input("Abstand in km: "))
lea = float(input("Tempo von Lea in km/h: "))
mia = float(input("Tempo von Mia in km/h: "))
stunden = abstand / (lea + mia)
minuten = stunden * 60
strecke_lea = lea * stunden
print("Treffen nach:", minuten, "Minuten")
print("Lea ist gefahren:", strecke_lea, "km")
