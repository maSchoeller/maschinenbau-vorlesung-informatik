# Ein Tipp beim Zahlenraten.
def hinweis(geraten, geheim):
    if geraten < geheim:
        print("Zu klein")
    elif geraten > geheim:
        print("Zu groß")
    else:
        print("Richtig!")

geheim = random.randint(1, 100)
geraten = int(input("Dein Tipp (1 bis 100): "))
print(hinweis(geraten, geheim))
