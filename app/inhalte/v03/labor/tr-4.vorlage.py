# Blitzer: Erlaubt sind 50 km/h.
tempo = int(input("Tempo in km/h: "))
if tempo > 50:
    print("Verwarnung")
elif tempo > 70:
    print("Bußgeld")
else:
    print("Alles in Ordnung)
