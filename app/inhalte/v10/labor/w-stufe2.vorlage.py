import random

def hinweis(geraten, geheim):
    if geraten < geheim:
        return "Zu klein"
    elif geraten > geheim:
        return "Zu groß"
    else:
        return "Richtig!"

# Zieh die Zufallszahl von 1 bis 100 und speichere sie in geheim.
# Setze geraten auf 0, damit die Schleife starten kann.
# Solange geraten nicht geheim ist:
#     lies einen Tipp ein
#     zeig den Hinweis
