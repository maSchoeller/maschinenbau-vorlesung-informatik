def medaille(punkte):
    if punkte >= 90:
        name = "Gold"
    elif punkte >= 70:
        name = "Silber"
    elif punkte >= 50:
        name = "Bronze"
    else:
        name = "keine"
    return name

punkte = int(input("Punkte: "))
m = medaille(punkte)
print(f"Medaille: {m}")
