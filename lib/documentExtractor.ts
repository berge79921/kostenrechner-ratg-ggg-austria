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
