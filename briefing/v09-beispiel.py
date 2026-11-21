# Eigene Smartphone-Messung auswerten: Bremsen mit dem Fahrrad (phyphox-Export)
# (V09: Strings split/strip/replace, with open, csv-Modul, try/except)
# Datei: bremsen-kaputt.csv (Semikolon als Trennzeichen, Dezimalkomma, einige kaputte Zeilen)

import csv


def zahl(text):
    """Wandelt '1,234E-01' (Dezimalkomma) in eine float-Zahl um."""
    return float(text.strip().replace(",", "."))


zeiten = []
werte_y = []          # Beschleunigung in Fahrtrichtung (y) in m/s²
kaputt = 0

with open("bremsen-kaputt.csv", encoding="utf-8") as datei:
    leser = csv.reader(datei, delimiter=";")
    kopf = next(leser)                       # erste Zeile: Spaltennamen
    for zeile in leser:
        try:
            t = zahl(zeile[0])
            a = zahl(zeile[2])
        except (ValueError, IndexError):
            kaputt = kaputt + 1              # Zeile überspringen, aber mitzählen
            continue
        zeiten.append(t)
        werte_y.append(a)

print("Spalte:", kopf[2])
print(f"Gültige Zeilen: {len(werte_y)}, übersprungen: {kaputt}")

spitze = werte_y[0]                          # stärkste Verzögerung = kleinster Wert
t_spitze = zeiten[0]
for i in range(len(werte_y)):
    if werte_y[i] < spitze:
        spitze = werte_y[i]
        t_spitze = zeiten[i]
mittel = sum(werte_y) / len(werte_y)
print(f"Spitzenwert: {spitze:.2f} m/s² bei t = {t_spitze:.2f} s")
print(f"Mittelwert über die ganze Fahrt: {mittel:.2f} m/s²")

with open("auswertung.txt", "w", encoding="utf-8") as aus:
    aus.write(f"Spitzenverzoegerung;{spitze:.2f}\n")
    aus.write(f"Zeitpunkt;{t_spitze:.2f}\n")
print("Auswertung gespeichert in auswertung.txt")
