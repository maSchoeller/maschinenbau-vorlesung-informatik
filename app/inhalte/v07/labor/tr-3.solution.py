def toleranz_ok(mass, nenn, tol):
    if abs(mass - nenn) <= tol:
        return True
    else:
        return False

print(toleranz_ok(25.03, 25.0, 0.05))
