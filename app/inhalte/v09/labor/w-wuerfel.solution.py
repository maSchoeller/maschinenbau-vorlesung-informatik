import random

def bewerte(tipp, wurf):
    if tipp == wurf:
        text = "Treffer"
    else:
        text = "Leider nein, es war " + str(wurf)
    return text

wurf = random.randint(1, 6)
tipp = int(input("Dein Tipp (1 bis 6): "))
text = bewerte(tipp, wurf)
print(text)
