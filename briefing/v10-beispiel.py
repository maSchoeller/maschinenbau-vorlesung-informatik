# Mini-Sprachmodell: Bigramme aus Maschinenbau-Sätzen lernen und Text erzeugen
# (V10: String-Methoden vertieft, List Comprehension, einfacher Tokenizer)

import random

text = """Die Welle trägt das Zahnrad. Das Zahnrad treibt die Welle an.
Das Lager stützt die Welle. Die Schraube hält das Lager.
Das Lager braucht Fett. Die Welle braucht eine Passfeder."""


def tokenisiere(text):
    """Zerlegt Text in Kleinbuchstaben-Wörter; der Punkt wird ein eigenes Token."""
    text = text.lower().replace(".", " . ").replace("\n", " ")
    return [wort for wort in text.split(" ") if wort != ""]


tokens = tokenisiere(text)
print(len(tokens), "Tokens:", tokens[:8])

# Training: für jedes Wort merken, welche Wörter darauf folgen
nachfolger = {}
for i in range(len(tokens) - 1):
    wort = tokens[i]
    if wort not in nachfolger:
        nachfolger[wort] = []
    nachfolger[wort].append(tokens[i + 1])

print("Nach 'die' kam:", nachfolger["die"])

# Wahrscheinlichkeiten: Anteil jedes Nachfolgers
liste = nachfolger["die"]
gezaehlt = []
for kandidat in liste:
    if kandidat not in gezaehlt:
        gezaehlt.append(kandidat)
        anteil = liste.count(kandidat) / len(liste)
        print(f"  P({kandidat} | die) = {anteil:.2f}")

# Erzeugen: immer ein zufälliger Nachfolger (häufige kommen öfter dran)
random.seed(4)
wort = "das"
satz = [wort]
for schritt in range(8):
    wort = random.choice(nachfolger[wort])
    satz.append(wort)
    if wort == ".":
        break
print("Erzeugt:", " ".join(satz))
