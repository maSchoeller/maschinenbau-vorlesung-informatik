# Werkstoffvorschlag für eine Welle nach einem Struktogramm
# (vereinfachte Lehr-Regel, keine Normauslegung)
# (V05: Struktogramm -> Code, verschachtelte Verzweigungen, Eingabe prüfen)

spannung = float(input("Maximale Spannung in MPa: "))
temperatur = float(input("Betriebstemperatur in °C: "))

if spannung <= 0 or temperatur < -50 or temperatur > 600:
    print("Eingabe unplausibel - bitte Werte prüfen")
else:
    if temperatur > 300:
        if spannung <= 200:
            werkstoff = "16Mo3 (warmfest)"
        else:
            werkstoff = "Sonderwerkstoff - Rücksprache Konstruktion"
    else:
        if spannung <= 140:
            werkstoff = "S235JR"
        elif spannung <= 220:
            werkstoff = "C45E"
        else:
            werkstoff = "42CrMo4 (vergütet)"
    print("Empfohlener Werkstoff:", werkstoff)
