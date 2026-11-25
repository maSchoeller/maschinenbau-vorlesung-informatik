# Blitzer: Erlaubt sind 50 km/h.
tempo = int(input("Tempo in km/h: "))
if tempo > 70:
    print("Bußgeld")
elif tempo > 50:
    print("Verwarnung")
else:
    print("Alles in Ordnung")
