# Drei Wertungen: Gewertet wird die mittlere.
a = int(input("Wertung 1: "))
b = int(input("Wertung 2: "))
c = int(input("Wertung 3: "))
# Ab hier entscheidest du.
if a <= b and b <= c:
    mitte = b
elif c <= b and b <= a:
    mitte = b
elif b <= a and a <= c:
    mitte = a
elif c <= a and a <= b:
    mitte = a
else:
    mitte = c
print("Gewertet:", mitte)
