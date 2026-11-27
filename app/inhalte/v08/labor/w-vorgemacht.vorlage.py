# Fingerspiel: Ist die Summe gerade, gewinnt Anna, sonst Ben
def ist_gerade(n):
    if n % 2 == 0:
        return True
    else:
        return False

def sieger(summe):
    if ist_gerade(summe):
        return "Anna"
    else:
        return "Ben"

anna = int(input("Finger von Anna: "))
ben = int(input("Finger von Ben: "))
wer = sieger(anna + ben)
print("Sieger:", wer)
