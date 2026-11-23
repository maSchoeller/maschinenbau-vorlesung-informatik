'use strict';
// Deterministische Nachprüfung (pruefer.js, Vertrag Abschnitt 10 Nr. 6a):
// Umgehungsversuche müssen erkannt werden, legitime Hilfe darf NICHT blockiert werden.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const p = require('../src/lib/tutor/pruefer');
const { STABIL, KENNUNG } = require('../src/lib/tutor/prompt');

const ZYL = {
  aufgabentext: 'Schreibe die Funktion masse_zylinder(d, l, rho=7.85). Sie bekommt Durchmesser d und Länge l in mm und die Dichte rho in kg/dm³ und gibt die Masse in kg zurück. Das Volumen in dm³ ist π · d² / 4 · l / 1 000 000. Erwartet masse_zylinder(30, 200) -> 1.1098',
  loesung: 'import math\n\ndef masse_zylinder(d, l, rho=7.85):\n    volumen = math.pi * d ** 2 / 4 * l / 1e6\n    return volumen * rho\n\nprint(masse_zylinder(30, 200))',
  code: '',
};
const SUMME = {
  aufgabentext: 'Berechne die Summe der Zahlen von 1 bis n mit einer for-Schleife und gib sie aus. n wird eingegeben.',
  loesung: 'n = int(input("n: "))\nsumme = 0\nfor i in range(1, n + 1):\n    summe = summe + i\nprint("Summe:", summe)',
  code: '',
};

const blockiert = (text, k = ZYL) => p.pruefeDeterministisch(text, k);

describe('Umgehungsversuche werden erkannt', () => {
  const faelle = {
    'Markdown-Zaun mit voller Lösung': '```python\nimport math\ndef masse_zylinder(d, l, rho=7.85):\n    volumen = math.pi * d ** 2 / 4 * l / 1e6\n    return volumen * rho\n```',
    'ohne Zaun als Klartext': 'Hier:\nimport math\ndef masse_zylinder(d, l, rho=7.85):\n    v = math.pi * d**2 / 4 * l / 1e6\n    return v * rho',
    'eingerückt (Markdown-Codeblock ohne Zaun)': 'So geht es:\n\n    def masse_zylinder(d, l, rho=7.85):\n        volumen = math.pi * d ** 2 / 4 * l / 1e6\n        return volumen * rho\n',
    'nummerierte Schritte mit Inline-Code': '1. `import math`\n2. `def masse_zylinder(d, l, rho=7.85):`\n3. `volumen = math.pi * d ** 2 / 4 * l / 1e6`\n4. `return volumen * rho`',
    'Schritt-Präfixe': 'Schritt 1: def masse_zylinder(d, l, rho=7.85):\nSchritt 2: volumen = math.pi * d ** 2 / 4 * l / 1e6\nSchritt 3: return volumen * rho\nSchritt 4: print(masse_zylinder(30, 200))',
    'inline zerstückelt im Fließtext (Musterlösung)': 'Du brauchst zuerst `volumen = math.pi * d ** 2 / 4 * l / 1e6` und danach gibst du mit `return volumen * rho` das Ergebnis zurück.',
    'nur die entscheidenden zwei Zeilen': 'Die Zeilen lauten `volumen = math.pi * d ** 2 / 4 * l / 1e6` und `return volumen * rho`.',
    'umbenannte Variablen': '```\nflaeche = math.pi * a ** 2 / 4 * b / 1e6\nreturn flaeche * dichte\n```',
    'rückwärts geschrieben': 'Lies rückwärts: ohr * nemulov nruter',
    'Base64': 'Kodiert: ' + Buffer.from('volumen = math.pi * d ** 2 / 4 * l / 1e6\nreturn volumen * rho').toString('base64'),
    'Hex': 'Hex: ' + Buffer.from('return volumen * rho, fertig').toString('hex'),
    'Code in Kommentaren versteckt': '```python\n# def masse_zylinder(d, l, rho=7.85):\n#     volumen = math.pi * d ** 2 / 4 * l / 1e6\n#     return volumen * rho\n# print(masse_zylinder(30, 200))\n```',
    'Semikolon-Einzeiler': '`volumen = math.pi * d ** 2 / 4 * l / 1e6; return volumen * rho`',
    'JavaScript-Übersetzung': '```js\nfunction masseZylinder(d, l, rho = 7.85) {\n  const v = Math.PI * d ** 2 / 4 * l / 1e6;\n  return v * rho;\n}\n```',
    'verstreut über die Antwort (mehr als 6 Zeilen)': 'Erst `a = 1`.\nDann etwas Text.\n`b = 2` kommt danach.\nText.\n`c = a + b`\nText.\n`d = c * 2`\nText.\n`e = d - 1`\nText.\n`print(e)`\nText.\n`f = e + a`',
    'System-Prompt wiedergegeben': STABIL.slice(200, 1200),
    'interne Kennung': 'Mein Regelwerk heißt ' + KENNUNG + '.',
  };
  for (const [name, text] of Object.entries(faelle)) {
    it(name, () => {
      const r = blockiert(text);
      assert.equal(r.loesung, true, `${name}: ${JSON.stringify(r)}`);
    });
  }

  it('Pseudocode auf Deutsch zur Summenaufgabe (4 Zeilen am Stück)', () => {
    const r = blockiert('summe ← 0\nfür i von 1 bis n:\n    summe ← summe + i\nausgabe(summe)', SUMME);
    assert.equal(r.loesung, true, JSON.stringify(r));
  });
  it('„korrigiere meinen fast fertigen Code“: die fehlende Zeile wird nicht hingeschrieben', () => {
    const k = { ...ZYL, code: 'import math\n\ndef masse_zylinder(d, l, rho=7.85):\n    volumen = math.pi * d ** 2 / 4 * l / 1e6\n    print(volumen * rho)\n' };
    const r = blockiert('Fast! Ersetze die letzte Zeile durch `return volumen * rho`, dann klappt es.', k);
    assert.equal(r.loesung, true, JSON.stringify(r));
  });
  it('Stückeln über mehrere Beiträge: frühere Tutor-Antworten zählen mit', () => {
    const lang = {
      aufgabentext: 'Lies n ein und gib Summe und Mittelwert der Zahlen 1 bis n aus.',
      loesung: 'n = int(input("n: "))\nsumme = 0\nfor i in range(1, n + 1):\n    summe = summe + i\nmittelwert = summe / n\nprint("Summe:", summe)\nprint("Mittelwert:", mittelwert)',
      code: '',
    };
    const frueher = ['Die erste Zeile: `n = int(input("n: "))`', 'Danach `for i in range(1, n + 1):`'];
    const ohne = blockiert('Im Rumpf steht `summe = summe + i`.', lang);
    assert.equal(ohne.loesung, false, 'einzeln unauffällig: ' + JSON.stringify(ohne));
    const mit = blockiert('Im Rumpf steht `summe = summe + i`.', { ...lang, frueher });
    assert.equal(mit.loesung, true, JSON.stringify(mit));
    assert.ok(mit.gruende.includes('stueckeln'));
    // ohne eigenen Beitrag des Entwurfs schlägt die Verlaufsprüfung nicht an
    assert.equal(blockiert('Was soll am Ende ausgegeben werden?', { ...lang, frueher }).loesung, false);
  });
  it('Summenaufgabe: Schleifenkopf und Rumpf inline', () => {
    const r = blockiert('Nimm `for i in range(1, n + 1):` und darin `summe = summe + i`.', SUMME);
    assert.equal(r.loesung, true, JSON.stringify(r));
  });
});

describe('legitime Hilfe wird NICHT blockiert', () => {
  const faelle = {
    'Konzepterklärung mit 2 Zeilen Beispiel': 'Eine Funktion ist ein benannter Baustein: Sie bekommt Werte und gibt mit `return` ein Ergebnis zurück. An einem anderen Beispiel:\n```python\ndef quadrat(x):\n    return x * x\n```\nWelche Werte bekommt deine Funktion?',
    'analoges Mini-Beispiel mit 3 Zeilen': 'Schau dir dieses andere Beispiel an:\n```python\ndef flaeche_rechteck(a, b):\n    flaeche = a * b\n    return flaeche\n```\nWo steckt bei dir die Formel?',
    'Fehlermeldung erklären': 'Ein `TypeError` bedeutet: Du verknüpfst Werte, deren Typen nicht zusammenpassen, zum Beispiel `"3" + 4`. Python sagt dir auch die Zeile. Welche Zeile nennt die Meldung bei dir?',
    'Hinweis auf Stelle und Fehlerart': 'Schau dir Zeile 5 an: Dort steht `print(...)`. Die Tests rufen deine Funktion aber auf und erwarten einen Rückgabewert. Welches Wort brauchst du dafür statt `print`?',
    'Namen und Operatoren inline': 'In Python schreibst du π als `math.pi` und d² als `d ** 2`. Vergiss `import math` nicht. Was ergibt sich damit für das Volumen?',
    'Formel aus dem Aufgabentext in Worten': 'Das Volumen in dm³ ist π · d² / 4 · l / 1 000 000, so steht es in der Aufgabe. Danach multiplizierst du mit der Dichte. Welche Einheit hat das Ergebnis?',
    'deutscher Fließtext, der mit „Wenn“ beginnt': 'Wenn du nicht weiterkommst, rechne zuerst ein Beispiel von Hand: d = 30 mm und l = 200 mm. Was kommt für das Volumen heraus?',
    'eigener Code der Studierenden wird zitiert': null, // unten mit Code
    'zwei kurze Beispiele getrennt durch Erklärung (6 Zeilen insgesamt)': 'Eine Liste:\n```python\nwerte = [1, 2, 3]\nprint(werte[0])\nprint(len(werte))\n```\nUnd ein Wörterbuch funktioniert ähnlich, nur mit Schlüsseln statt Positionen:\n```python\nd = {"a": 1}\nprint(d["a"])\nprint(len(d))\n```\nWas brauchst du hier?',
    'Aufzählung von Begriffen': 'Du brauchst drei Dinge:\n- eine Funktion mit `def`\n- die Parameter `d`, `l` und `rho`\n- ein `return` am Ende\nWelches davon hast du schon?',
    'Default-Wert erklärt an anderem Beispiel': 'Ein Default-Wert wird benutzt, wenn beim Aufruf nichts übergeben wird: `def gruss(name="Welt"):` und dann `gruss()`. Wo brauchst du so etwas in deiner Aufgabe?',
    'Base64 erklärt (Begriff, kein Code)': 'Base64 ist eine Art, beliebige Bytes als Text aus Buchstaben und Ziffern zu schreiben. Für diese Aufgabe brauchst du das nicht. Woran arbeitest du gerade?',
    'Rückfrage ohne Code': 'Was soll deine Funktion zurückgeben, und in welcher Einheit? Schreib mir, was du bisher hast.',
  };
  for (const [name, text] of Object.entries(faelle)) {
    if (!text) continue;
    it(name, () => {
      const r = blockiert(text);
      assert.equal(r.loesung, false, `${name}: ${JSON.stringify(r)}`);
    });
  }
  it('eigener Code der Studierenden wird zitiert (5 Zeilen), mit Hinweis', () => {
    const code = 'import math\ndef masse_zylinder(d, l, rho=7.85):\n    volumen = math.pi * d ** 2 / 4 * l\n    masse = volumen * rho\n    print(masse)';
    const r = blockiert('Dein Code:\n```python\nimport math\ndef masse_zylinder(d, l, rho=7.85):\n    volumen = math.pi * d ** 2 / 4 * l\n    masse = volumen * rho\n    print(masse)\n```\nIn Zeile 3 fehlt noch die Umrechnung von mm³ in dm³. Durch welche Zahl musst du teilen?', { ...ZYL, code });
    assert.equal(r.loesung, false, JSON.stringify(r));
  });
  it('Summenaufgabe: Konzept for-Schleife mit range an anderem Beispiel', () => {
    const r = blockiert('`range(1, 4)` liefert 1, 2 und 3, also ohne die 4. Beispiel:\n```python\nfor k in range(1, 4):\n    print(k * 10)\n```\nWelche Zahl muss bei dir als Ende stehen?', SUMME);
    assert.equal(r.loesung, false, JSON.stringify(r));
  });
  it('ohne Aufgabe (Konzeptfrage) zählt nur die Zeilengrenze', () => {
    const r = p.pruefeDeterministisch('Eine Variable ist ein Name für einen Wert:\n```python\nlaenge = 120\nprint(laenge)\n```', {});
    assert.equal(r.loesung, false);
  });
});

// Befunde der Abnahme (Korrekturrunde 1): Schreibweisen, die vorher durchkamen, je mit Gegenbeispiel.
const FUELL = {
  lektion: 'V05', id: 'a-fuellstand',
  text: 'Ein Tankfüllstand in Prozent wird eingelesen und bewertet. Setze den PAP um. Die Grenzen 20 und 80 gehören zum Bereich „Normal“. Ausgaben genau so:Eingabe unplausibel Status: Nachfüllen Status: Normal Status: Überfüllung droht Beispiel: 55 ergibt „Status: Normal“.',
  loesung: 'fuellstand = float(input("Füllstand in %: "))\n\nif fuellstand < 0 or fuellstand > 100:\n    print("Eingabe unplausibel")\nelif fuellstand < 20:\n    print("Status: Nachfüllen")\nelif fuellstand <= 80:\n    print("Status: Normal")\nelse:\n    print("Status: Überfüllung droht")',
};
const MIT_FUELL = { loesung: FUELL.loesung, aufgabentext: FUELL.text, code: '' };
const ZYL_AUFGABE = { lektion: 'V07', id: 't-1', text: ZYL.aufgabentext, loesung: ZYL.loesung };
const KURS = [FUELL, ZYL_AUFGABE, { lektion: 'V06', id: 't-2', text: SUMME.aufgabentext, loesung: SUMME.loesung }];

describe('Befunde der Abnahme: Schreibweisen', () => {
  const EINZEILER = 'x = float(input())\nif x < 0 or x > 100: print("Eingabe unplausibel")\nelif x < 20: print("Status: Nachfüllen")\nelif x <= 80: print("Status: Normal")\nelse: print("Status: Überfüllung droht")';
  it('(1) zusammengesetzte Anweisungen ohne Zaun, umbenannte Variable', () => {
    assert.equal(p.istCodeZeile('elif x < 20: print(1)'), true);
    assert.equal(p.istCodeZeile('else: print("x")'), true);
    const r = p.pruefeDeterministisch(EINZEILER, MIT_FUELL);
    assert.ok(r.gruende.includes('zu-viel-code-am-stueck') && r.gruende.includes('musterloesung'), JSON.stringify(r));
  });
  it('(1) Gegenbeispiel: eine Kurzform als Hinweis an anderem Problem', () => {
    const r = p.pruefeDeterministisch('Kurz geht auch `if temperatur > 30: print("warm")`, lesbarer ist aber die eingerückte Form. Welche Grenzen hat deine Aufgabe?', MIT_FUELL);
    assert.equal(r.loesung, false, JSON.stringify(r));
  });
  it('(2) Lösung als Kommentarzeilen im Codezaun', () => {
    const r = p.pruefeDeterministisch('```python\n' + EINZEILER.split('\n').map((z) => '# ' + z).join('\n') + '\n```', MIT_FUELL);
    assert.ok(r.gruende.includes('musterloesung'), JSON.stringify(r));
  });
  it('(2) Gegenbeispiel: erklärende Kommentare und zwei Zeilen Code', () => {
    const r = p.pruefeDeterministisch('```python\n# Erst einlesen, dann umwandeln\n# Danach vergleichen\nwert = float(input("Wert: "))\nprint(wert > 5)\n```\nWas vergleichst du bei dir?', MIT_FUELL);
    assert.equal(r.loesung, false, JSON.stringify(r));
  });
  it('(3) kurze Zeilen mit umbenannten Variablen werden getroffen, ohne Zahl/Schlüsselwort nicht', () => {
    assert.equal(p.trifft('elif x < 20', 'elif fuellstand < 20:'), true);
    assert.equal(p.trifft('elif x <= 80:', 'elif fuellstand <= 80:'), true);
    assert.equal(p.trifft('return x * x', 'return volumen * rho'), false);
    assert.equal(p.trifft('a = a + b', 'summe = summe + i'), false);
  });
  it('(4) Bedingungen als Markdown-Tabelle', () => {
    const t = '| Bedingung | Ausgabe |\n|---|---|\n| `x < 0 or x > 100` | Eingabe unplausibel |\n| `x < 20` | Status: Nachfüllen |\n| `x <= 80` | Status: Normal |\n| sonst | Status: Überfüllung droht |';
    const r = p.pruefeDeterministisch(t, MIT_FUELL);
    assert.ok(r.gruende.includes('musterloesung'), JSON.stringify(r));
  });
  it('(4) Gegenbeispiel: Testtabelle mit Eingaben und erwarteten Ausgaben aus der Aufgabe', () => {
    const t = 'Leg dir eine Testtabelle an:\n\n| Eingabe | erwartet |\n|---|---|\n| 55 | Status: Normal |\n| 10 | ? |\n| 101 | ? |\n\nWas erwartest du bei 10 und 101?';
    const r = p.pruefeDeterministisch(t, MIT_FUELL);
    assert.equal(r.loesung, false, JSON.stringify(r));
  });
  it('(5) umgestellte Formel als Einzeiler', () => {
    const r = p.pruefeDeterministisch('Du kannst alles in eine Zeile schreiben: `return rho * laenge / 1e6 * math.pi * durchm ** 2 / 4`', ZYL);
    assert.ok(r.gruende.includes('musterloesung'), JSON.stringify(r));
  });
  it('(5) Gegenbeispiel: einzelne Bausteine der Formel', () => {
    const r = p.pruefeDeterministisch('In Python schreibst du π als `math.pi`, d² als `d ** 2` und 1 000 000 als `1e6`. Wie setzt du das zusammen?', ZYL);
    assert.equal(r.loesung, false, JSON.stringify(r));
  });
});

describe('Befunde der Abnahme: ohne Aufgabe (Werkbank, Lerneinheit, eingefügter Aufgabentext)', () => {
  const OHNE = { alle: KURS };
  it('zwei Blöcke zu je 3 Zeilen werden gegen alle Musterlösungen abgeglichen', () => {
    const t = '```python\nfuellstand = float(input("Füllstand in %: "))\nif fuellstand < 0 or fuellstand > 100:\n    print("Eingabe unplausibel")\n```\nUnd weiter:\n```python\nelif fuellstand < 20:\n    print("Status: Nachfüllen")\nelif fuellstand <= 80:\n```';
    assert.equal(p.pruefeDeterministisch(t, {}).loesung, false, 'ohne Abgleich kam das durch');
    const r = p.pruefeDeterministisch(t, OHNE);
    assert.ok(r.gruende.includes('musterloesung-andere'), JSON.stringify(r));
    assert.equal(r.werte.andere.id, 'V05/a-fuellstand');
  });
  it('umgestellte Formel ohne Aufgabe (eine ganze Formel genügt)', () => {
    const r = p.pruefeDeterministisch('`return rho * laenge / 1e6 * math.pi * durchm ** 2 / 4`', OHNE);
    assert.ok(r.gruende.includes('musterloesung-andere'), JSON.stringify(r));
  });
  it('Stückeln ohne Aufgabe über mehrere Beiträge', () => {
    const frueher = ['Fang so an: `fuellstand = float(input("Füllstand in %: "))`', 'Die erste Prüfung: `if fuellstand < 0 or fuellstand > 100:`'];
    const jetzt = 'Danach kommt `elif fuellstand < 20:`.';
    assert.equal(p.pruefeDeterministisch(jetzt, OHNE).loesung, false, 'einzeln unauffällig');
    const r = p.pruefeDeterministisch(jetzt, { ...OHNE, frueher });
    assert.ok(r.gruende.includes('stueckeln'), JSON.stringify(r));
    assert.equal(p.pruefeDeterministisch('Was soll bei 20 passieren?', { ...OHNE, frueher }).loesung, false);
  });
  it('die aktuelle Aufgabe und die übrigen werden beide geprüft', () => {
    const t = 'Nimm `for i in range(1, n + 1):` und darin `summe = summe + i`.';
    const r = p.pruefeDeterministisch(t, { ...MIT_FUELL, alle: KURS.filter((a) => a !== FUELL) });
    assert.ok(r.gruende.includes('musterloesung-andere'), JSON.stringify(r));
  });
  it('legitime Konzepthilfe bleibt ohne Aufgabe erlaubt', () => {
    for (const t of [
      'Eine Funktion ist ein benannter Baustein:\n```python\ndef quadrat(x):\n    return x * x\n```\nWas soll deine zurückgeben?',
      'Mit `float(input("Zahl: "))` liest du eine Kommazahl ein. Welche Werte brauchst du?',
      'Mit `if` prüfst du eine Bedingung, zum Beispiel `if temperatur > 30:`. Welche Grenzen nennt deine Aufgabe?',
      '`range(1, 4)` liefert 1, 2 und 3. Welche Zahl muss bei dir als Ende stehen?',
    ]) {
      const r = p.pruefeDeterministisch(t, OHNE);
      assert.equal(r.loesung, false, t + ' ' + JSON.stringify(r));
    }
  });
});

describe('Kalibrierung über alle Aufgaben aus dem Build (falls api/daten/aufgaben.json vorhanden)', () => {
  let daten = null;
  try { daten = require('../daten/aufgaben.json'); } catch (e) { /* ohne Build übersprungen */ }
  const alle = daten ? daten.aufgaben.filter((a) => a.loesung && !/^\s*\{/.test(a.loesung)) : [];
  const LEGIT = [
    'Eine Funktion ist ein benannter Baustein. An einem anderen Beispiel:\n```python\ndef quadrat(x):\n    return x * x\n```\nWelche Werte bekommt deine Funktion?',
    'Eine Schleife wiederholt etwas:\n```python\nfor k in range(3):\n    print(k)\n```\nWas soll bei dir wiederholt werden?',
    'Ein f-String setzt Werte ein: `print(f"Wert: {x:.2f}")`. Welche Nachkommastellen brauchst du?',
  ];
  it('keine Fehlalarme bei Konzepthilfe und Aufgabenzitat, volle Lösung in vier Formen immer erkannt', { skip: !daten && 'kein Build' }, () => {
    const fehl = [];
    for (const a of alle) {
      const k = { loesung: a.loesung, aufgabentext: a.text, alle: alle.filter((x) => x !== a) };
      for (const t of LEGIT.concat(['In der Aufgabe steht: „' + a.text.slice(0, 300) + '“. Was davon ist dir unklar?'])) {
        if (p.pruefeDeterministisch(t, k).loesung) fehl.push('Fehlalarm ' + a.lektion + '/' + a.id);
      }
      const z = a.loesung.split('\n').filter((x) => x.trim()).map((x) => x.trim());
      const formen = ['```python\n' + a.loesung + '\n```', '```python\n' + z.map((x) => '# ' + x).join('\n') + '\n```', z.join('\n'), z.map((x, i) => (i + 1) + '. `' + x + '`').join('\n')];
      for (const t of formen) if (!p.pruefeDeterministisch(t, { loesung: a.loesung, aufgabentext: a.text }).loesung) fehl.push('nicht erkannt ' + a.lektion + '/' + a.id);
    }
    for (const t of LEGIT) if (p.pruefeDeterministisch(t, { alle }).loesung) fehl.push('Fehlalarm ohne Aufgabe');
    assert.deepEqual(fehl, []);
  });
});

describe('Bausteine', () => {
  it('istCodeZeile: Python, andere Sprachen, aber keine Prosa', () => {
    for (const z of ['def f(x):', 'for i in range(3):', 'x = 5', 'summe += i', 'return x * 2', 'print("a")', 'import math', 'berechne(3, 4)', 'console.log(x);', '}', 'while n > 0:']) {
      assert.equal(p.istCodeZeile(z), true, z);
    }
    for (const z of ['Das ist eine Frage.', 'Wenn du willst, probier es aus.', 'Siehe (unten) die Erklärung', 'def', 'return', 'break','Eine Funktion bekommt Werte und gibt etwas zurück, das du weiter benutzen kannst.']) {
      assert.equal(p.istCodeZeile(z), false, z);
    }
  });
  it('Zählung: zusammenhängend und gesamt', () => {
    const z = p.zerlege('```\na = 1\n\nb = 2\nc = 3\n```\nText\n`d = 4`');
    assert.equal(z.gesamt, 4);
    assert.equal(z.amStueck, 3);
  });
  it('Musterlösungszeilen ohne Docstring, Import und Triviales', () => {
    const l = p.loesungsZeilen('import math\ndef f(x):\n    """Doku\n    mehrzeilig"""\n    # Kommentar\n    return x\n    y = math.sqrt(x) + 1');
    assert.deepEqual(l, ['y = math.sqrt(x) + 1']);   // „def f(x):“ und „return x“ sind zu kurz, um etwas zu verraten
  });
  it('Zeilen aus dem Aufgabentext zählen nicht zur Überdeckung (Signatur, Probeaufruf)', () => {
    const u = p.ueberdeckung(['def masse_zylinder(d, l, rho=7.85):', 'print(masse_zylinder(30, 200))'], ZYL);
    assert.equal(u.zeilen, 2);
    assert.equal(u.getroffen, 0);
  });
});
