# Ein Tipp beim Zahlenraten.
import random

# Für das Spiel in Termin 10 muss hinweis den Text zurückgeben: darum return statt print.
def hinweis(geraten, geheim):
    if geraten < geheim:
        return "Zu klein"
    elif geraten > geheim:
        return "Zu groß"
    else:
        return "Richtig!"

geheim = random.randint(1, 100)
geraten = int(input("Dein Tipp (1 bis 100): "))
print(hinweis(geraten, geheim))
