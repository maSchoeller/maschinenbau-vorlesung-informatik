# 1 Million Messpunkte: Effektivwert einer Schwingung - Schleife gegen NumPy
# (V13: NumPy-Arrays, Vektorisierung, Zeit messen)

import math
import time
import numpy as np

N = 1_000_000                   # 1 Mio. Messpunkte, Abtastrate 100 kHz -> 10 s Messung
f = 50.0                        # Hz
A = 2.0                         # Amplitude in mm/s (Schwinggeschwindigkeit)

# Variante 1: Python-Schleife über eine Liste
start = time.perf_counter()
werte = []
for i in range(N):
    t = i / 100_000
    werte.append(A * math.sin(2 * math.pi * f * t))
summe = 0.0
for v in werte:
    summe = summe + v * v
rms_schleife = math.sqrt(summe / N)
dauer_schleife = time.perf_counter() - start

# Variante 2: NumPy - eine Rechnung für das ganze Array
start = time.perf_counter()
t = np.arange(N) / 100_000
v = A * np.sin(2 * np.pi * f * t)
rms_numpy = np.sqrt(np.mean(v ** 2))
dauer_numpy = time.perf_counter() - start

print(f"Effektivwert Schleife: {rms_schleife:.4f} mm/s in {dauer_schleife:.3f} s")
print(f"Effektivwert NumPy:    {rms_numpy:.4f} mm/s in {dauer_numpy:.3f} s")
print(f"Theorie A/sqrt(2):     {A / math.sqrt(2):.4f} mm/s")
print(f"NumPy ist etwa {dauer_schleife / dauer_numpy:.0f}-mal schneller")
