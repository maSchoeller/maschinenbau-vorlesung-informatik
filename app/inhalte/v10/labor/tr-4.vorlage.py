import random

def hinweis(geraten, geheim):
    if geraten < geheim:
        return "Zu klein"
    elif geraten > geheim:
        return "Zu groß"
    else:
        return "Richtig!"

versuche = 0
geraten = 0
geheim = random.randint(1, 100)
while geraten != geheim
    geheim = random.randint(1, 100)
    geraten = int(input("Dein Tipp (1 bis 100): "))
    versuche = versuche + 1
    print(hinweis(geraten, geheim))
print(f"Versuche: {versuche}")
