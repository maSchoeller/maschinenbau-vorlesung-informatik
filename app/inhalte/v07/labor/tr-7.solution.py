def wurzel(a, tol=1e-9):
    x = a
    while abs(x * x - a) > tol:
        x = (x + a / x) / 2
    return x

print(wurzel(2))
