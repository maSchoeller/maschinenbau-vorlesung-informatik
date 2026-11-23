def pruefe_drehzahl(n, n_max=3000):
    if n <= n_max:
        return "ok"
    else:
        return "Überdrehzahl"

n = int(input("Drehzahl n in 1/min: "))
print("Ergebnis:", pruefe_drehzahl(n))
