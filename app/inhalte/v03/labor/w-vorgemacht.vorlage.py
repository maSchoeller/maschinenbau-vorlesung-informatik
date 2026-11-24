# Getränkeautomat mit drei Wegen
geld = float(input("Eingeworfen in Euro: "))
if geld < 1.5:
    print("Zu wenig Geld")
elif geld > 1.5:
    rueckgeld = geld - 1.5
    print(f"Rückgeld: {rueckgeld:.2f} Euro")
else:
    print("Passt genau")
