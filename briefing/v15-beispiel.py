# Prozessfähigkeit zweier Drehmaschinen: Cp, Cpk und eine einfache Regelkarte
# (V15: pandas read_csv, Filtern, groupby, describe)
# Datei: wellen.csv, Soll 20,000 mm, Toleranz +-0,020 mm

import pandas as pd

OSG = 20.020        # obere Spezifikationsgrenze in mm
USG = 19.980        # untere Spezifikationsgrenze in mm

df = pd.read_csv("wellen.csv")
print(df.head(3))
print(df["durchmesser_mm"].describe().round(4))

# Je Maschine: Mittelwert und Standardabweichung
kennwerte = df.groupby("maschine")["durchmesser_mm"].agg(["mean", "std", "count"])
kennwerte["Cp"] = (OSG - USG) / (6 * kennwerte["std"])
kennwerte["bis_oben"] = OSG - kennwerte["mean"]
kennwerte["bis_unten"] = kennwerte["mean"] - USG
kennwerte["Cpk"] = kennwerte[["bis_oben", "bis_unten"]].min(axis=1) / (3 * kennwerte["std"])
print(kennwerte[["mean", "std", "count", "Cp", "Cpk"]].round(4))

# Ausschuss: Teile außerhalb der Toleranz
ausschuss = df[(df["durchmesser_mm"] > OSG) | (df["durchmesser_mm"] < USG)]
print("Teile außerhalb Toleranz:", len(ausschuss))

# Regelkarte (Mittelwertkarte) für D2: Stichproben-Mittelwerte gegen Eingriffsgrenzen
d2 = df[df["maschine"] == "D2"]
mittel = d2.groupby("stichprobe")["durchmesser_mm"].mean()
anfang = d2[d2["stichprobe"] <= 15]                # ruhige Anfangsphase als Bezug
mitte = anfang["durchmesser_mm"].mean()
sigma_x = anfang["durchmesser_mm"].std() / 5 ** 0.5   # Streuung von 5er-Mittelwerten
oeg = mitte + 3 * sigma_x                          # obere Eingriffsgrenze
ueg = mitte - 3 * sigma_x                          # untere Eingriffsgrenze
auffaellig = mittel[(mittel > oeg) | (mittel < ueg)]
print(f"Mittellinie {mitte:.4f} mm, OEG {oeg:.4f} mm, UEG {ueg:.4f} mm")
print("Stichproben außerhalb der Eingriffsgrenzen:", list(auffaellig.index))
