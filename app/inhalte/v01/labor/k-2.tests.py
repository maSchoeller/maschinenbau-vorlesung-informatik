def _pruefe(abstand, lea, mia, minuten, km):
    z = zahlen(run_program([str(abstand), str(lea), str(mia)]))
    assert len(z) >= 2 and abs(z[-2] - minuten) < 0.01 and abs(z[-1] - km) < 0.01, "Bei %s km Abstand, Lea mit %s km/h und Mia mit %s km/h sollen zuerst %s Minuten und dann %s km ausgegeben werden. Dein Programm gibt zuletzt aus:\n%s" % (abstand, lea, mia, minuten, km, ausgabe_text(z[-2:]))

def test_beispiel():
    """20 km, Lea 15 km/h, Mia 25 km/h: 30.0 Minuten, 7.5 km"""
    _pruefe(20, 15, 25, 30.0, 7.5)

def test_gleich_schnell():
    """10 km, beide 20 km/h: 15.0 Minuten, 5.0 km"""
    _pruefe(10, 20, 20, 15.0, 5.0)

def test_lange_fahrt():
    """36 km, Lea 12 km/h, Mia 6 km/h: 120.0 Minuten, 24.0 km"""
    _pruefe(36, 12, 6, 120.0, 24.0)

def test_eine_stunde():
    """7 km, Lea 3 km/h, Mia 4 km/h: 60.0 Minuten, 3.0 km"""
    _pruefe(7, 3, 4, 60.0, 3.0)
