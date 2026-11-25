# Drei Stäbe: Welches Dreieck entsteht?
a = int(input("Stab 1 in cm: "))
b = int(input("Stab 2 in cm: "))
c = int(input("Stab 3 in cm: "))
# Ab hier entscheidest du.
ab = a + b
ac = a + c
bc = b + c
if ab <= c or ac <= b:
    print("Kein Dreieck")
elif bc <= a:
    print("Kein Dreieck")
elif a == b and b == c:
    print("Gleichseitig")
elif a == b or a == c:
    print("Gleichschenklig")
elif b == c:
    print("Gleichschenklig")
else:
    print("Ungleichseitig")
