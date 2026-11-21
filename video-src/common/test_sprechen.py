# -*- coding: utf-8 -*-
"""Tests fuer sprechen.py. Aufruf: video-src/.venv/Scripts/python -m unittest test_sprechen -v  (im Ordner common).
Kein Netzwerk: der ElevenLabs-Aufruf wird durch einen Fake ersetzt."""
import io
import json
import os
import sys
import tempfile
import unittest
import urllib.error
import urllib.request
from pathlib import Path
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sprechen as sp  # noqa: E402

FAELLE = [
    # Ganzzahlen
    ("65535", "fünfundsechzigtausendfünfhundertfünfunddreißig"),
    ("65 535", "fünfundsechzigtausendfünfhundertfünfunddreißig"),
    ("16 777 217", "sechzehn Millionen siebenhundertsiebenundsiebzigtausendzweihundertsiebzehn"),
    ("1.234.567", "eine Million zweihundertvierunddreißigtausendfünfhundertsiebenundsechzig"),
    ("−32768", "minus zweiunddreißigtausendsiebenhundertachtundsechzig"),
    ("-5", "minus fünf"),
    ("von +32767", "von plus zweiunddreißigtausendsiebenhundertsiebenundsechzig"),
    ("0", "null"),
    ("100", "hundert"),
    ("1000", "tausend"),
    ("007", "null null sieben"),
    # Jahre
    ("im Jahr 1989", "im Jahr neunzehnhundertneunundachtzig"),
    ("im Jahr 2025", "im Jahr zweitausendfünfundzwanzig"),
    # Dezimalzahlen
    ("152,8", "hundertzweiundfünfzig Komma acht"),
    ("3.14", "drei Komma eins vier"),
    ("78.53975", "ungefähr achtundsiebzig Komma fünf vier"),
    ("317.8125", "dreihundertsiebzehn Komma acht eins zwei fünf"),
    ("65.535", "fünfundsechzig Komma fünf drei fünf"),  # einzelner Punkt = Dezimal (dokumentierte Regel)
    ("0.30000000000000004", "null Komma drei, dann fünfzehn Nullen und eine Vier"),
    ("0.9999999999999999", "null Komma neun, sechzehnmal die Neun"),
    ("152.78887442346073", "ungefähr hundertzweiundfünfzig Komma sieben neun"),
    ("0.1 + 0.2", "null Komma eins plus null Komma zwei"),
    ("3.13.1", "drei Punkt dreizehn Punkt eins"),
    # Binaer/Hex/Potenz/Exponent
    ("0b1001110001000", "null b eins null null eins eins eins null null null eins null null null"),
    ("0x1388", "null x eins drei acht acht"),
    ("0xFF", "null x F F"),
    ("2**16 - 1", "zwei hoch sechzehn minus eins"),
    ("1e-9", "zehn hoch minus neun"),
    ("2.5e3", "zwei Komma fünf mal zehn hoch drei"),
    ("2ⁿ − 1", "zwei hoch n minus eins"),
    # Einheiten
    ("12000 N", "zwölftausend Newton"),
    ("10 mm", "zehn Millimeter"),
    ("1 mm", "ein Millimeter"),
    ("1,5 mm", "eins Komma fünf Millimeter"),
    ("152.8 MPa", "hundertzweiundfünfzig Komma acht Megapascal"),
    ("5 N/mm²", "fünf Newton pro Quadratmillimeter"),
    ("20 m²", "zwanzig Quadratmeter"),
    ("90°", "neunzig Grad"),
    ("20 °C", "zwanzig Grad Celsius"),
    ("50 %", "fünfzig Prozent"),
    ("1 s", "eine Sekunde"),
    ("21 s", "einundzwanzig Sekunden"),
    ("1 U/min", "eine Umdrehung pro Minute"),
    ("1500 U/min", "tausendfünfhundert Umdrehungen pro Minute"),
    ("8 Bit", "acht Bit"),
    ("1 Byte", "ein Byte"),
    ("2 kg", "zwei Kilogramm"),
    ("3 GPa", "drei Gigapascal"),
    ("5 mal", "fünf mal"),  # "m" ist hier keine Einheit
    # Abkuerzungen
    ("z. B. Stahl", "zum Beispiel Stahl"),
    ("d. h. genau", "das heißt genau"),
    ("u. a. Python", "unter anderem Python"),
    ("ca. 5 mm", "circa fünf Millimeter"),
    ("A bzw. B", "A beziehungsweise B"),
    ("Nr. 5", "Nummer fünf"),
    ("Wir lernen Python usw. Dann weiter.", "Wir lernen Python und so weiter. Dann weiter."),
    # Code in Backticks
    ("Nutze `snake_case`.", "Nutze snake case."),
    ("`math.isclose`", "math punkt isclose"),
    ("Rufe `print()` auf", "Rufe print auf"),
    ("der Operator `//`", "der Operator Doppel-Slash"),
    ("der Operator `%`", "der Operator modulo"),
    ("der Operator `**`", "der Operator hoch"),
    ("der Operator `==`", "der Operator gleich gleich"),
    ("der Operator `!=`", "der Operator ungleich"),
    ("`float(input(...))`", "float von input"),
    ("`kraft_n = 12000`", "kraft n gleich zwölftausend"),
    ("`7 // 2`", "sieben Doppel-Slash zwei"),
    ('`int("2.5")`', "int von Text zwei Punkt fünf"),
    ("`float64`", "float vierundsechzig"),
    # Modulo/Prozent im Fliesstext
    ("7 % 3", "sieben modulo drei"),
    ("50 % davon", "fünfzig Prozent davon"),
    # Lexikon
    ("IEEE 754", "I triple E sieben fünf vier"),
    ("SPS", "S P S"),
    ("CSV", "C S V"),
    ("DHBW", "D H B W"),
    ("float32", "float zweiunddreißig"),
    # Markup
    ("[[0,30000000000000004|null Komma drei, dann viele Nullen]] sagt Python", "null Komma drei, dann viele Nullen sagt Python"),
    ("Wert [[A|B]] und 5", "Wert B und fünf"),
    # ± und Symbole
    ("± 0,05 mm", "plus minus null Komma null fünf Millimeter"),
    ("4 · 10", "vier mal zehn"),
]


class SprechfassungTests(unittest.TestCase):
    def test_faelle(self):
        for eingabe, soll in FAELLE:
            with self.subTest(eingabe=eingabe):
                self.assertEqual(sp.sprechfassung(eingabe), soll)

    def test_mindestens_40_faelle(self):
        self.assertGreaterEqual(len(FAELLE), 40)

    def test_markup_wird_nicht_automatisch_umgewandelt(self):
        self.assertEqual(sp.sprechfassung("[[12000 N|zwölf Kilonewton]]"), "zwölf Kilonewton")

    def test_anzeige(self):
        t = "Python liefert [[0,30000000000000004|null Komma drei, dann viele Nullen]] bei `0.1 + 0.2`."
        self.assertEqual(sp.anzeige(t), "Python liefert 0,30000000000000004 bei 0.1 + 0.2.")

    def test_anzeige_ohne_markup_unveraendert(self):
        self.assertEqual(sp.anzeige("Nennmaß 25 mm"), "Nennmaß 25 mm")

    def test_lexikon_erweiterbar(self):
        sp.lexikon_ergaenzen({"Numpy": "Nampei"})
        try:
            self.assertEqual(sp.sprechfassung("Numpy rechnet"), "Nampei rechnet")
        finally:
            del sp.LEXIKON["Numpy"]

    def test_satz_gemischt(self):
        t = "Eine Kraft von 12000 N auf 10 mm ergibt 152.8 MPa, nicht 0.1 + 0.2."
        self.assertEqual(
            sp.sprechfassung(t),
            "Eine Kraft von zwölftausend Newton auf zehn Millimeter ergibt hundertzweiundfünfzig Komma acht Megapascal, "
            "nicht null Komma eins plus null Komma zwei.",
        )

    def test_keine_ziffern_im_ergebnis(self):
        t = "Bei 8 Bit, 65535, −32768, 0x1388, 2**16, 1e-9 und 3.14 mm bleibt keine Ziffer."
        self.assertNotRegex(sp.sprechfassung(t), r"\d")

    def test_pruefen_mehrdeutig(self):
        self.assertTrue(any("mehrdeutig" in h for h in sp.pruefen("Wert 65.535")))

    def test_pruefen_code_ohne_backticks(self):
        self.assertTrue(any("Code ohne Backticks" in h for h in sp.pruefen("Rufe type() auf")))

    def test_pruefen_akronym(self):
        self.assertTrue(any("XYZ" in h for h in sp.pruefen("Das XYZ ist neu")))
        self.assertEqual(sp.pruefen("Eine SPS und REAL"), [])


def _fake_resp(daten=b"MP3DATA"):
    r = mock.MagicMock()
    r.read.return_value = daten
    r.__enter__.return_value = r
    return r


class TtsTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.mp3 = Path(self.tmp.name) / "audio" / "s1.mp3"

    def tearDown(self):
        self.tmp.cleanup()

    def test_request_und_dateien(self):
        with mock.patch("urllib.request.urlopen", return_value=_fake_resp()) as uo:
            sp.tts("Es sind 12000 N.", self.mp3, api_key="KEY")
        rq = uo.call_args[0][0]
        self.assertIn("/v1/text-to-speech/TIKjTeWOFujJEvXK1qIU?output_format=mp3_44100_128", rq.full_url)
        self.assertEqual(rq.get_header("Xi-api-key"), "KEY")
        body = json.loads(rq.data.decode("utf-8"))
        self.assertEqual(body["text"], "Es sind zwölftausend Newton.")
        self.assertEqual(body["model_id"], "eleven_v3")
        self.assertEqual(body["language_code"], "de")
        self.assertEqual(body["voice_settings"], {"stability": 0.5, "similarity_boost": 0.75})
        self.assertEqual(self.mp3.read_bytes(), b"MP3DATA")
        self.assertEqual((self.mp3.parent / "s1.sprech.txt").read_text(encoding="utf-8"), "Es sind zwölftausend Newton.")

    def test_ohne_sprechfassung(self):
        with mock.patch("urllib.request.urlopen", return_value=_fake_resp()) as uo:
            sp.tts("Es sind 12000 N.", self.mp3, sprechfassung_anwenden=False, api_key="K")
        self.assertEqual(json.loads(uo.call_args[0][0].data)["text"], "Es sind 12000 N.")

    def test_zu_lang(self):
        with mock.patch("urllib.request.urlopen") as uo:
            with self.assertRaisesRegex(ValueError, "3000"):
                sp.tts("a " * 2000, self.mp3, api_key="K")
        uo.assert_not_called()

    def test_ohne_schluessel(self):
        with mock.patch.dict(os.environ, {}, clear=False):
            os.environ.pop("ELEVENLABS_API_KEY", None)
            with self.assertRaisesRegex(RuntimeError, "ELEVENLABS_API_KEY"):
                sp.tts("Hallo", self.mp3)

    def test_schluessel_aus_umgebung(self):
        with mock.patch.dict(os.environ, {"ELEVENLABS_API_KEY": "ENV"}):
            with mock.patch("urllib.request.urlopen", return_value=_fake_resp()) as uo:
                sp.tts("Hallo", self.mp3)
        self.assertEqual(uo.call_args[0][0].get_header("Xi-api-key"), "ENV")

    def test_retry_bei_429(self):
        fehler = urllib.error.HTTPError("u", 429, "Too Many", {}, io.BytesIO(b"x"))
        with mock.patch("time.sleep") as sl, mock.patch("urllib.request.urlopen", side_effect=[fehler, _fake_resp()]) as uo:
            sp.tts("Hallo", self.mp3, api_key="K")
        self.assertEqual(uo.call_count, 2)
        sl.assert_called_once()

    def test_kein_retry_bei_401(self):
        fehler = urllib.error.HTTPError("u", 401, "Unauthorized", {}, io.BytesIO(b"bad key"))
        with mock.patch("time.sleep"), mock.patch("urllib.request.urlopen", side_effect=fehler) as uo:
            with self.assertRaisesRegex(RuntimeError, "401"):
                sp.tts("Hallo", self.mp3, api_key="K")
        self.assertEqual(uo.call_count, 1)

    def test_retry_gibt_auf(self):
        fehler = urllib.error.HTTPError("u", 503, "Unavailable", {}, io.BytesIO(b""))
        with mock.patch("time.sleep"), mock.patch("urllib.request.urlopen", side_effect=fehler) as uo:
            with self.assertRaisesRegex(RuntimeError, "503"):
                sp.tts("Hallo", self.mp3, api_key="K", versuche=3)
        self.assertEqual(uo.call_count, 3)
        self.assertFalse(self.mp3.exists())


if __name__ == "__main__":
    unittest.main(verbosity=2)
