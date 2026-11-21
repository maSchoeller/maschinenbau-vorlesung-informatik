# Zweihandschaltung einer Presse: Hub nur, wenn beide Taster gedrückt,
# die Schutztür zu und der Hydraulikdruck im zulässigen Bereich ist.
# (V04: bool, Vergleiche, and/or/not, if/elif/else)

taster_links = input("Taster links gedrückt? (j/n): ") == "j"
taster_rechts = input("Taster rechts gedrückt? (j/n): ") == "j"
tuer_zu = input("Schutztür geschlossen? (j/n): ") == "j"
druck_bar = float(input("Hydraulikdruck in bar: "))

druck_ok = 150 <= druck_bar <= 210
freigabe = taster_links and taster_rechts and tuer_zu and druck_ok

print("Beide Taster:", taster_links and taster_rechts)
print("Druck im Bereich:", druck_ok)

if freigabe:
    print("Hub freigegeben")
elif not tuer_zu:
    print("Stopp: Schutztür offen")
elif not druck_ok:
    print(f"Stopp: Druck {druck_bar:.1f} bar außerhalb von 150 bis 210 bar")
else:
    print("Warten: bitte beide Taster drücken")
