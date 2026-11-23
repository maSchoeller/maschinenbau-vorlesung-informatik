def tau(T, d):
    return T * 1000 / (3.1416 * d ** 3 / 16)

print(f"{tau(30, 98.8):.2f} MPa")
