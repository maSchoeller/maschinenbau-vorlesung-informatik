def quersumme(n):
    summe = 0
    while n > 0:
        letzte = n % 10
        summe = summe + letzte
        n = int(n / 10)
    return summe

zahl = int(input("Zahl: "))
print("Quersumme:", quersumme(zahl))
