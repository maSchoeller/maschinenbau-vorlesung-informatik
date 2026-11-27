zahl = 0
for i in range(1, 9):
    bit = int(input(f"Bit {i}: "))
    zahl = zahl * 2 + bit
print(f"Dezimal: {zahl}")
