// Gemini 2.5 Flash Lite via OpenRouter für Exekutionstitel-Extraktion

export interface ExtractedExekutionData {
  betreibenderName: string;
  betreibenderStrasse: string;
  betreibenderPlz: string;
  betreibenderOrt: string;
  betreibenderLand: string;
  verpflichteterName: string;
  verpflichteterStrasse: string;
  verpflichteterPlz: string;
  verpflichteterOrt: string;
  verpflichteterLand: string;
  verpflichteterGeburtsdatum: string;
  titelArt: string;
  titelGericht: string;
  titelGZ: string;
  titelDatum: string;
  vollstreckbarkeitDatum: string;
  kapitalforderung: number;
  zinsenProzent: number;
  zinsenAb: string;
  kosten: number;
  // Kanzlei/Vertreter (falls im Dokument)
  kanzleiName?: string;
  kanzleiStrasse?: string;
  kanzleiPlz?: string;
  kanzleiOrt?: string;
}

const EXTRACTION_PROMPT = `Extrahiere aus diesem österreichischen Exekutionstitel (Zahlungsbefehl/Urteil/Vergleich) folgende Daten.

WICHTIG: Antworte NUR mit validem JSON, ohne Markdown-Formatierung, ohne \`\`\`json Tags.

{
  "betreibenderName": "Name der klagenden/betreibenden Partei",
  "betreibenderStrasse": "Nur Straße und Hausnummer",
  "betreibenderPlz": "Postleitzahl (4-5 Ziffern)",
  "betreibenderOrt": "Ort/Stadt",
  "betreibenderLand": "Land (z.B. Österreich, Italien, Deutschland) - leer wenn österreichisch",
  "verpflichteterName": "Name der beklagten/verpflichteten Partei",
  "verpflichteterStrasse": "Nur Straße und Hausnummer",
  "verpflichteterPlz": "Postleitzahl (4-5 Ziffern)",
  "verpflichteterOrt": "Ort/Stadt",
  "verpflichteterLand": "Land - leer wenn österreichisch",
  "verpflichteterGeburtsdatum": "TT.MM.JJJJ oder leer wenn nicht angegeben",
  "titelArt": "Zahlungsbefehl|Urteil|Vergleich|Beschluss",
  "titelGericht": "Name des Gerichts z.B. LG Wien",
  "titelGZ": "Geschäftszahl z.B. 3 Cg 165/25v",
  "titelDatum": "Datum des Titels (Urteilsdatum, Vergleichsdatum, Zahlungsbefehlsdatum) TT.MM.JJJJ",
  "vollstreckbarkeitDatum": "Datum der Vollstreckbarkeitsbestätigung TT.MM.JJJJ",
  "kapitalforderung": 25000.00,
  "zinsenProzent": 4.0,
  "zinsenAb": "TT.MM.JJJJ",
  "kosten": 2444.40,
  "kanzleiName": "Name des Vertreters/Rechtsanwalts der klagenden Partei oder leer",
  "kanzleiStrasse": "Straße der Kanzlei oder leer",
  "kanzleiPlz": "PLZ der Kanzlei oder leer",
  "kanzleiOrt": "Ort der Kanzlei oder leer"
}

Regeln:
- Bei Zahlungsbefehl: Klagende Partei = Betreibende Partei, Beklagte = Verpflichtete
- Geburtsdatum nur wenn im Dokument angegeben (z.B. "geb. 07.01.1940")
- titelDatum: Das Datum an dem der Titel erlassen wurde (steht meist im Kopf des Dokuments, z.B. "Zahlungsbefehl vom 08.12.2025" oder "Urteil vom 15.01.2026")
- vollstreckbarkeitDatum: Das Datum der Vollstreckbarkeitsbestätigung (oft am Ende des Dokuments mit Stempel/Vermerk)
- Kosten sind die im Titel bestimmten Kosten (Pauschalgebühr + Anwaltskosten)
- Zahlen ohne Tausendertrennzeichen, Dezimalpunkt statt Komma
- Kanzlei: "vertreten durch" oder "Klagevertreter" im Dokument suchen
- Bei ausländischen Adressen: Land explizit angeben (z.B. "Italien")
- Bei österreichischen Adressen: Land leer lassen`;

export async function extractExekutionDataFromPDF(
  pdfBase64: string,
  apiKey: string
): Promise<ExtractedExekutionData> {
  // OpenRouter API mit Gemini 2.5 Flash Lite
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://kostenrechner.local',
      'X-Title': 'Kostenrechner RATG/GGG'
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash-lite-preview-09-2025',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: EXTRACTION_PROMPT },
          {
            type: 'image_url',
            image_url: {
              url: `data:application/pdf;base64,${pdfBase64}`
            }
          }
        ]
      }],
      temperature: 0.1,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Fehler: ${response.status} - ${error}`);
  }

  const result = await response.json();
  const text = result.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error('Keine Antwort erhalten');
  }

  // JSON aus Antwort extrahieren (falls in Markdown eingebettet)
  let jsonStr = text.trim();
  if (jsonStr.startsWith('```')) {
    const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) jsonStr = match[1].trim();
  }

  try {
    return JSON.parse(jsonStr) as ExtractedExekutionData;
  } catch {
    throw new Error(`JSON-Parsing fehlgeschlagen: ${jsonStr.substring(0, 200)}...`);
  }
}

// ============================================================================
// ZIVILPROZESS - Klage/Mahnklage/Zahlungsbefehl/Protokoll Extraktion
// ============================================================================

// Einzelne Partei-Info (für Arrays)
export interface ParteiInfo {
  nummer: number;
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  land?: string;
  geburtsdatum?: string;
  firmenbuchNr?: string;
}

// Vertreter-Info (für Arrays)
export interface VertreterInfo {
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  code?: string;  // R-Code
}

// Protokoll-spezifische Daten
export interface ProtokollInfo {
  datum: string;              // "16.6.2025"
  beginn: string;             // "14:00"
  ende: string;               // "15:58"
  dauerMinuten: number;       // 118 (ohne Pausen)
  pauseMinuten: number;       // Falls Pause vermerkt
  halbeStunden: number;       // 4 (aufgerundet)
  richterName: string;        // "Mag. Jan Wannenmacher"
  protokollArt: 'Tagsatzung' | 'Verhandlung' | 'Sonstig';
}

export type DokumentTyp = 'Klage' | 'Mahnklage' | 'Zahlungsbefehl' | 'Protokoll' | 'Sonstig';

export interface ExtractedZivilprozessData {
  // Dokumenttyp
  dokumentTyp: DokumentTyp;

  // NEU: Arrays für mehrere Parteien
  klaeger: ParteiInfo[];
  beklagte: ParteiInfo[];
  klagevertreter: VertreterInfo[];
  beklagtenvertreter: VertreterInfo[];

  // Verfahren
  klageGericht: string;
  klageGZ: string;
  einbringungsDatum: string;
  fallcode: string;
  klagegegenstand: string;
  streitwert: number;

  // Forderung (nur bei Klage/Mahnklage/ZB)
  kapitalforderung: number;
  nebenforderung: number;
  zinsenProzent: number;
  zinsenAb: string;

  // Protokoll-spezifisch (nur wenn dokumentTyp === 'Protokoll')
  protokoll?: ProtokollInfo;

  // Legacy-Felder für Abwärtskompatibilität (werden aus Arrays befüllt)
  klaegerName: string;
  klaegerStrasse: string;
  klaegerPlz: string;
  klaegerOrt: string;
  klaegerLand: string;
  klaegerGeburtsdatum: string;
  klagevertreterName: string;
  klagevertreterStrasse: string;
  klagevertreterPlz: string;
  klagevertreterOrt: string;
  klagevertreterCode: string;
  klageArt: string;
  beklagterName?: string;
  beklagterStrasse?: string;
  beklagterPlz?: string;
  beklagterOrt?: string;
}

const ZIVILPROZESS_EXTRACTION_PROMPT = `Du extrahierst Daten aus österreichischen Gerichtsdokumenten (Klage, Mahnklage, Zahlungsbefehl oder Protokoll).
Antworte NUR mit validem JSON, ohne Markdown-Formatierung, ohne \`\`\`json Tags.

DOKUMENTTYP ERKENNEN:
- "Klage" / "Mahnklage" / "Zahlungsbefehl": Enthält Klagebegehren, Forderung, "Klagende Partei"
- "Protokoll": Enthält "PROTOKOLL" im Titel, Beginn/Ende-Zeiten, "Anwesend:", Zeugenaussagen

PARTEIEN als ARRAYS extrahieren:
- Kläger können nummeriert sein ("1. Kläger", "Klagende Partei") oder einzeln
- Beklagte können nummeriert sein ("1. Beklagte Partei", "2. Beklagte Partei", "3. Beklagte")
- Jede Partei: {nummer, name, strasse, plz, ort, land?, geburtsdatum?, firmenbuchNr?}
- Vertreter: Suche "vertreten durch" nach jeder Partei

BEI PROTOKOLL ZUSÄTZLICH:
- Beginn/Ende aus "Beginn: HH:MM Uhr" und "Ende: HH:MM Uhr"
- Pausen erkennen: "Pause von HH:MM bis HH:MM" (in Minuten umrechnen)
- dauerMinuten = (Ende - Beginn) - Pausen
- halbeStunden = Math.ceil(dauerMinuten / 30)

{
  "dokumentTyp": "Klage|Mahnklage|Zahlungsbefehl|Protokoll|Sonstig",
  "klaeger": [
    {"nummer": 1, "name": "Raiffeisenbank Wienerwald eGen", "strasse": "Hauptstraße 62", "plz": "3021", "ort": "Pressbaum", "firmenbuchNr": "99135m"}
  ],
  "beklagte": [
    {"nummer": 1, "name": "Amalgergasse 7 Immobilienentwicklung GmbH", "strasse": "Rielgasse 22", "plz": "1230", "ort": "Wien", "firmenbuchNr": "419808s"},
    {"nummer": 2, "name": "Ing. Thomas Alfred Bauer", "strasse": "Rielgasse 22", "plz": "1230", "ort": "Wien"},
    {"nummer": 3, "name": "Hans Peter Bauer", "strasse": "Rielgasse 22", "plz": "1230", "ort": "Wien"}
  ],
  "klagevertreter": [
    {"name": "Fellner Wratzfeld & Partner Rechtsanwälte GmbH", "strasse": "Schottenring 12", "plz": "1010", "ort": "Wien"}
  ],
  "beklagtenvertreter": [
    {"name": "Mag. Bernhard KONECNY", "strasse": "Maderstraße 1/12", "plz": "1040", "ort": "Wien"},
    {"name": "DI Mag. Reinhard BERGER, MBA", "strasse": "Weigelspergergasse 2", "plz": "3380", "ort": "Pöchlarn"},
    {"name": "Mag. Michael Lang", "strasse": "Zedlitzgasse 3", "plz": "1010", "ort": "Wien"}
  ],
  "klageGericht": "Handelsgericht Wien",
  "klageGZ": "51 Cg 132/24d",
  "einbringungsDatum": "16.6.2025",
  "fallcode": "",
  "klagegegenstand": "Darlehen/Kredit/Bürgschaft",
  "streitwert": 2000000,
  "kapitalforderung": 2000000,
  "nebenforderung": 0,
  "zinsenProzent": 0,
  "zinsenAb": "",
  "protokoll": {
    "datum": "16.6.2025",
    "beginn": "14:00",
    "ende": "15:58",
    "pauseMinuten": 0,
    "dauerMinuten": 118,
    "halbeStunden": 4,
    "richterName": "Mag. Jan Wannenmacher",
    "protokollArt": "Tagsatzung"
  }
}

Regeln:
- "protokoll" NUR wenn dokumentTyp === "Protokoll", sonst weglassen
- Geschäftszahl vollständig inkl. Prüfbuchstabe (z.B. "51 Cg 132/24d")
- Bei "Wegen: EUR X samt Anhang" → streitwert = X
- Zahlen ohne Tausendertrennzeichen, Dezimalpunkt statt Komma
- Bei österreichischen Adressen: land leer lassen
- Bei ausländischen Adressen: land explizit angeben (z.B. "Italien")
- Vertreter-Index korrespondiert mit Partei-Nummer (1. Beklagter → beklagtenvertreter[0])
- R-Code bei "Teilnehmercode" oder "Code:" → nur Nummer (z.B. "R210380")`;


export async function extractZivilprozessDataFromPDF(
  pdfBase64: string,
  apiKey: string
): Promise<ExtractedZivilprozessData> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://kostenrechner.local',
      'X-Title': 'Kostenrechner RATG/GGG'
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash-lite-preview-09-2025',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: ZIVILPROZESS_EXTRACTION_PROMPT },
          {
            type: 'image_url',
            image_url: {
              url: `data:application/pdf;base64,${pdfBase64}`
            }
          }
        ]
      }],
      temperature: 0.1,
      max_tokens: 2048  // Erhöht für mehrere Parteien
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Fehler: ${response.status} - ${error}`);
  }

  const result = await response.json();
  const text = result.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error('Keine Antwort erhalten');
  }

  // JSON aus Antwort extrahieren (falls in Markdown eingebettet)
  let jsonStr = text.trim();
  if (jsonStr.startsWith('```')) {
    const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) jsonStr = match[1].trim();
  }

  try {
    const raw = JSON.parse(jsonStr);
    return normalizeExtractedData(raw);
  } catch {
    throw new Error(`JSON-Parsing fehlgeschlagen: ${jsonStr.substring(0, 200)}...`);
  }
}

/** Normalisiert LLM-Ausgabe und befüllt Legacy-Felder für Abwärtskompatibilität */
function normalizeExtractedData(raw: Record<string, unknown>): ExtractedZivilprozessData {
  // Arrays sicherstellen
  const klaeger = Array.isArray(raw.klaeger) ? raw.klaeger as ParteiInfo[] : [];
  const beklagte = Array.isArray(raw.beklagte) ? raw.beklagte as ParteiInfo[] : [];
  const klagevertreter = Array.isArray(raw.klagevertreter) ? raw.klagevertreter as VertreterInfo[] : [];
  const beklagtenvertreter = Array.isArray(raw.beklagtenvertreter) ? raw.beklagtenvertreter as VertreterInfo[] : [];

  // Erster Kläger für Legacy-Felder
  const erstKlaeger = klaeger[0] || {} as ParteiInfo;
  const erstKlagevertreter = klagevertreter[0] || {} as VertreterInfo;
  const erstBeklagter = beklagte[0] || {} as ParteiInfo;

  // DokumentTyp-Mapping
  const dokumentTyp = (raw.dokumentTyp as DokumentTyp) || 'Sonstig';
  const klageArt = dokumentTyp === 'Protokoll' ? 'Sonstig' : dokumentTyp;

  return {
    // Neue Array-Felder
    dokumentTyp,
    klaeger,
    beklagte,
    klagevertreter,
    beklagtenvertreter,

    // Verfahren
    klageGericht: (raw.klageGericht as string) || '',
    klageGZ: (raw.klageGZ as string) || '',
    einbringungsDatum: (raw.einbringungsDatum as string) || '',
    fallcode: (raw.fallcode as string) || '',
    klagegegenstand: (raw.klagegegenstand as string) || '',
    streitwert: Number(raw.streitwert) || 0,

    // Forderung
    kapitalforderung: Number(raw.kapitalforderung) || Number(raw.streitwert) || 0,
    nebenforderung: Number(raw.nebenforderung) || 0,
    zinsenProzent: Number(raw.zinsenProzent) || 0,
    zinsenAb: (raw.zinsenAb as string) || '',

    // Protokoll (optional)
    protokoll: raw.protokoll as ProtokollInfo | undefined,

    // Legacy-Felder aus erstem Kläger
    klaegerName: erstKlaeger.name || '',
    klaegerStrasse: erstKlaeger.strasse || '',
    klaegerPlz: erstKlaeger.plz || '',
    klaegerOrt: erstKlaeger.ort || '',
    klaegerLand: erstKlaeger.land || '',
    klaegerGeburtsdatum: erstKlaeger.geburtsdatum || '',

    // Legacy-Felder aus erstem Klagevertreter
    klagevertreterName: erstKlagevertreter.name || '',
    klagevertreterStrasse: erstKlagevertreter.strasse || '',
    klagevertreterPlz: erstKlagevertreter.plz || '',
    klagevertreterOrt: erstKlagevertreter.ort || '',
    klagevertreterCode: erstKlagevertreter.code || '',

    // Legacy klageArt
    klageArt,

    // Legacy-Felder aus erstem Beklagten
    beklagterName: erstBeklagter.name || '',
    beklagterStrasse: erstBeklagter.strasse || '',
    beklagterPlz: erstBeklagter.plz || '',
    beklagterOrt: erstBeklagter.ort || '',
  };
}

// Konvertiere File zu Base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Entferne data:application/pdf;base64, Prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
