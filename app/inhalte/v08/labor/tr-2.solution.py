def ist_gerade(zahl):
    if zahl % 2 == 0:
        return True
    else:
        return False

n = int(input("Bis wohin? "))
anzahl = 0
for i in range(1, n + 1):
    if ist_gerade(i):
        anzahl = anzahl + 1
print("Gerade Zahlen:", anzahl)
