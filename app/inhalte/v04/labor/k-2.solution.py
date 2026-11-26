# Genau zwei von drei Tastern gedrückt? Jeder Taster ist 0 (nicht gedrückt) oder 1 (gedrückt).
a = int(input("Taster A (0 oder 1): "))
b = int(input("Taster B (0 oder 1): "))
c = int(input("Taster C (0 oder 1): "))
if a + b + c == 2:
    print("Ja")
else:
    print("Nein")
