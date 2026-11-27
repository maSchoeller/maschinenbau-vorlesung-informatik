import random

def hinweis(geraten, geheim):
    if geraten < geheim:
        return "Zu klein"
    elif geraten > geheim:
        return "Zu groß"
    else:
        return "Richtig!"

def spiel():
    geheim = random.randint(1, 100)
    geraten = 0
    versuche = 0
    while geraten != geheim and versuche < 7:
        geraten = int(input("Dein Tipp (1 bis 100): "))
        versuche = versuche + 1
        print(hinweis(geraten, geheim))
    if geraten == geheim:
        print(f"Gewonnen! Versuche: {versuche}")
    else:
        print(f"Verloren, die Zahl war {geheim}")

spiel()
