def hinweis(geraten, geheim):
    if geraten < geheim:
        return "Zu klein"
    elif geraten > geheim:
        return "Zu groß"
    else:
        return "Richtig!"

# Schreib die Funktion computer_raet(geheim).
# Sie gibt die Zahl der Versuche zurück.
