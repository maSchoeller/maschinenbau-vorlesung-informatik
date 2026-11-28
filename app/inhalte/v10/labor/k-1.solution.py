def hinweis(geraten, geheim):
    if geraten < geheim:
        return "Zu klein"
    elif geraten > geheim:
        return "Zu groß"
    else:
        return "Richtig!"

def computer_raet(geheim):
    unten = 1
    oben = 100
    tipp = 0
    versuche = 0
    while tipp != geheim:
        tipp = int((unten + oben) / 2)
        versuche = versuche + 1
        antwort = hinweis(tipp, geheim)
        if antwort == "Zu klein":
            unten = tipp + 1
        elif antwort == "Zu groß":
            oben = tipp - 1
    return versuche
