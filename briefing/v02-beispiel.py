# Inkrementalgeber auswerten: 1024 Impulse pro Umdrehung
# (V02: int, // und %, **, bin(), hex())

impulse_pro_umdrehung = 1024
zaehlerstand = 5000

umdrehungen = zaehlerstand // impulse_pro_umdrehung    # ganze Umdrehungen
rest_impulse = zaehlerstand % impulse_pro_umdrehung    # angefangene Umdrehung
winkel_grad = rest_impulse * 360 / impulse_pro_umdrehung

print("Ganze Umdrehungen:", umdrehungen)
print("Rest-Impulse:", rest_impulse)
print("Winkel in Grad:", winkel_grad)
print("Zählerstand binär:", bin(zaehlerstand))
print("Zählerstand hex:", hex(zaehlerstand))

# Ein 16-Bit-Zähler kennt nur 0 bis 2**16 - 1 = 65535
max_16bit = 2 ** 16 - 1
nach_ueberlauf = (max_16bit + 1) % 2 ** 16
print("Größter 16-Bit-Wert:", max_16bit)
print("Ein Impuls weiter:", nach_ueberlauf)
