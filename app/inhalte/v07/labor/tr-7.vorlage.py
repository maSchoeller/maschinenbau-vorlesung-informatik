# Wiederholung V06: Newton-Verfahren als Funktion

# Schreibe wurzel(a, tol=1e-9): Quadratwurzel von a (a > 0) nach Newton.
#   Start x = a, wiederhole x = (x + a / x) / 2, solange abs(x * x - a) größer als tol ist.
#   Rückgabe: die Wurzel (nicht die Schrittzahl).

