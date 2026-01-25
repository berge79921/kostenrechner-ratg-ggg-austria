/**
 * ============================================================================
 * RATG Historische Tarifstände
 * ============================================================================
 *
 * Perioden:
 * - PERIOD_2016: 01.01.2016 - 30.04.2023 (BGBl. II Nr. 12/2016)
 * - PERIOD_2023: ab 01.05.2023 (BGBl. II Nr. 131/2023)
 *
 * HINWEIS: Die Valorisierung der Bracket-Werte (TP 1, 2, 3A, 3B, 3C) ist
 * unabhängig von den Bemessungsgrundlagen-Änderungen in § 10 RATG.
 *
 * BGBl. I Nr. 19/2020 änderte § 10 Bemessungsgrundlagen (z.B. Besitzstörung),
 * aber NICHT die Tarifpost-Brackets. Die Bracket-Valorisierung erfolgte erst
 * mit BGBl. II Nr. 131/2023.
 * ============================================================================
 */

// ============================================================================
// INTERFACES
// ============================================================================

export interface TariffPeriod {
  /** Eindeutige ID der Periode */
  id: string;
  /** Gültig ab (YYYY-MM-DD) */
  validFrom: string;
  /** Gültig bis (YYYY-MM-DD), null = aktuell gültig */
  validTo: string | null;
  /** BGBl-Referenz */
  bgbl: string;
  /** RIS-Link */
  risUrl?: string;
  /** Schwellenwerte in EUR (gleich für alle Perioden) */
  thresholds: number[];
  /** Bracket-Werte in Cents für jede Tarifpost (Anm. 1-12) */
  brackets: {
    TP1: number[];
    TP2: number[];
    TP3A: number[];
    TP3B: number[];
    TP3C: number[];
    TP5: number[];
    TP6: number[];
  };
  /** Steigerungs- und Deckelwerte */
  specs: {
    TP1: { step: number; vt_factor: number; max: number; max_vk?: number };
    TP2: { step: number; vt_factor: number; max: number; max_vk?: number };
    TP3A: { step: number; vt_factor: number; max: number; max_vk?: number };
    TP3B: { step: number; vt_factor: number; max: number; max_vk?: number };
    TP3C: { step: number; vt_factor: number; max: number; max_vk?: number };
    TP5: { step: number; vt_factor: number; max: number; max_vk?: number };
    TP6: { step: number; vt_factor: number; max: number; max_vk?: number };
  };
  /** TP7 Kommission - max pro halbe Stunde in Cents */
  tp7: {
    /** TP7/1 max pro ½ Std (= TP6, gedeckelt) */
    tp71_max: number;
    /** TP7/2 max pro ½ Std (= TP7/1 × 2, gedeckelt) */
    tp72_max: number;
  };
  /** TP9/4 Wegzeit in Cents */
  tp94: {
    /** Betrag je angefangene Stunde */
    perHour: number;
  };
  /** TP9/1/c Reiseentschädigung in Cents */
  tp91c: {
    /** Betrag je angefangene Stunde */
    perHour: number;
  };
  /** TP8 Besprechungen */
  tp8: {
    /** Schwellenwerte in EUR für TP8 (anders als TP1-TP6!) */
    thresholds: number[];
    /** Bracket-Werte in Cents (bis zu den Schwellenwerten) */
    brackets: number[];
    /** Steigerung Segment 1: 1.820 bis 20.670 EUR, je 1.450 EUR */
    step1: number;
    /** Steigerung Segment 2: 20.670 bis 21.800 EUR */
    step2: number;
    /** Steigerung Segment 3: über 21.800 EUR, je 1.450 EUR */
    step3: number;
    /** Maximum pro halbe Stunde */
    max: number;
    /** Maximum für Kurzform (unter 10 Min) */
    maxKurz: number;
  };
  /** TP4 Strafsachen - fixe Basiswerte in Cents */
  tp4: {
    /** Anm. 1: Anklage BG (Vergehen Bezirksgericht) */
    anklageBG: number;
    /** Anm. 2: Anklage andere / Mediengesetz */
    anklageAndere: number;
    /** Anm. 3: Wartezeit BG (pro ½ Std nach erster ½ Std) */
    wartezeitBG: number;
    /** Anm. 4: Wartezeit andere (pro ½ Std nach erster ½ Std) */
    wartezeitAndere: number;
    /** Anm. 5: Abberaumung andere */
    abberaumungAndere: number;
  };
  /** ERV-Zuschlag gemäß § 23a RATG (konstant seit 2008) */
  erv: {
    /** Ersteinbringung: 5,00 € */
    erst: number;
    /** Folgeeinbringung: 2,60 € */
    folge: number;
  };
  /** Abberaumung TP2/TP3 - Maximalbeträge in Cents */
  abberaumung: {
    /** TP2 (BG): max 11,90 € valorisiert */
    tp2Max: number;
    /** TP3: max 35,10 € valorisiert */
    tp3Max: number;
  };
}

export interface SpecialTariff {
  /** Bezeichnung */
  name: string;
  /** Gesetzesreferenz */
  paragraph: string;
  /** BGBl-Referenz */
  bgbl: string;
  /** Gültig ab (YYYY-MM-DD) */
  validFrom: string;
  /** Gültig bis (YYYY-MM-DD), null = unbefristet */
  validTo: string | null;
  /** Bemessungsgrundlage in Cents */
  bemessungsgrundlage: number;
  /** Streitwert für Kostenberechnung in Cents */
  streitwert: number;
}

// ============================================================================
// SCHWELLENWERTE
// ============================================================================

// TP1-TP3C: 12 Schwellen (Anm. 1-12)
const THRESHOLDS_EUR = [40, 70, 110, 180, 360, 730, 1090, 1820, 3630, 5450, 7270, 10170];

// TP5/TP6: NUR 6 Schwellen! (komplett andere Struktur als TP1-TP3)
// Quelle: RATG Anlage 1, Tarifpost 5 (Stand 1.5.2023)
export const THRESHOLDS_TP5_EUR = [70, 180, 360, 730, 1820, 2910];

// ============================================================================
// PERIODE 2016: 01.01.2016 - 30.04.2023
// ============================================================================
// Quelle: BGBl. II Nr. 12/2016 (Valorisierung ab 01.01.2016)
// Letzte Periode vor der Valorisierung vom 01.05.2023

const PERIOD_2016: TariffPeriod = {
  id: "PERIOD_2016",
  validFrom: "2016-01-01",
  validTo: "2023-04-30",
  bgbl: "BGBl. II Nr. 12/2016",
  risUrl: "https://www.ris.bka.gv.at/Dokumente/BgblAuth/BGBLA_2016_II_12/BGBLA_2016_II_12.html",
  thresholds: THRESHOLDS_EUR,
  brackets: {
    // TP 1 Brackets (Cents) - RATG Anlage 1, Tarifpost 1, Anm. 1-12
    TP1: [350, 490, 620, 700, 760, 920, 1230, 1340, 1490, 1790, 2210, 2920],
    // TP 2 Brackets (Cents) - RATG Anlage 1, Tarifpost 2, Anm. 1-12
    TP2: [1490, 2210, 2920, 3220, 3640, 4370, 5810, 6550, 7250, 8710, 10850, 14480],
    // TP 3A = TP 2 × 2 (korrigiert nach User-Validierung)
    TP3A: [2920, 4370, 5810, 6400, 7250, 8710, 11580, 13010, 14480, 17340, 21680, 28880],
    // TP 3B = TP 3A × 1,25 (korrigiert nach User-Validierung)
    TP3B: [3650, 5460, 7260, 8000, 9060, 10850, 14480, 16260, 18070, 21680, 27100, 36100],
    // TP 3C = TP 3A × 1,5 (korrigiert nach User-Validierung)
    TP3C: [4380, 6560, 8720, 9600, 10880, 13010, 17370, 19520, 21680, 26010, 32520, 43300],
    // TP 5 - ACHTUNG: Andere Schwellenwerte! (70, 180, 360, 730, 1820, 2910) - nur 6 Brackets!
    // Werte für 2016: User-validiert (50€=3.50, max=87.10)
    TP5: [350, 470, 530, 620, 770, 900],
    // TP 6 = TP 5 × 2
    TP6: [700, 940, 1060, 1240, 1540, 1800],
  },
  specs: {
    TP1:  { step: 350,  vt_factor: 0.1,  max: 26010,   max_vk: 18770 },
    TP2:  { step: 1490, vt_factor: 0.5,  max: 129850,  max_vk: 89010 },
    TP3A: { step: 2920, vt_factor: 1.0,  max: 1730880, max_vk: 176840 },
    TP3B: { step: 3640, vt_factor: 1.25, max: 2163600, max_vk: 220800 },
    TP3C: { step: 4370, vt_factor: 1.5,  max: 2596310, max_vk: 265220 },
    // TP5: Steigerung ab 2.910 EUR (nicht 10.170!), step=270 Cents (2016), max=8710 (87.10€)
    TP5:  { step: 270,  vt_factor: 0,    max: 8710,    max_vk: 6290 },
    // TP6 = TP5 × 2, max=17350 (173.50€ - User-validiert)
    TP6:  { step: 540,  vt_factor: 0,    max: 17350,   max_vk: 12520 },
  },
  // TP7 Kommission (2016-2023) - max = TP6 max
  tp7: {
    tp71_max: 17350,  // 173,50 € max pro ½ Std (= TP6 max 2016)
    tp72_max: 34700,  // 347,00 € max pro ½ Std (= TP7/1 max × 2)
  },
  // TP9/4 Wegzeit (2016-2023)
  tp94: {
    perHour: 2820,    // 28,20 € je angefangene Stunde (kein Maximum)
  },
  // TP9/1/c Reiseentschädigung (2016-2023)
  tp91c: {
    perHour: 1490,    // 14,90 € je angefangene Stunde
  },
  // TP8 Besprechungen (2016-2023)
  tp8: {
    thresholds: [70, 180, 360, 730, 1820],  // Schwellenwerte für Brackets
    brackets: [1230, 1790, 2380, 2920, 4370],  // 12,30 / 17,90 / 23,80 / 29,20 / 43,70 €
    step1: 920,   // 9,20 € je 1.450 EUR (1.820 bis 20.670)
    step2: 920,   // 9,20 € (20.670 bis 21.800)
    step3: 490,   // 4,90 € je 1.450 EUR (über 21.800)
    max: 57740,   // 577,40 € max pro ½ Std
    maxKurz: 23100,  // 231,00 € max für Kurzform
  },
  // TP4 Strafsachen (2016-2023) - fixe Basiswerte
  tp4: {
    anklageBG: 15380,        // 153,80 € (Anm. 1)
    anklageAndere: 25630,    // 256,30 € (Anm. 2)
    wartezeitBG: 760,        // 7,60 € (Anm. 3)
    wartezeitAndere: 1490,   // 14,90 € (Anm. 4)
    abberaumungAndere: 2920, // 29,20 € (Anm. 5)
  },
  // ERV-Zuschlag § 23a RATG (konstant seit 2008)
  erv: {
    erst: 500,   // 5,00 € Ersteinbringung
    folge: 260,  // 2,60 € Folgeeinbringung
  },
  // Abberaumung TP2/TP3 (2016-2023)
  abberaumung: {
    tp2Max: 990,   // 9,90 € (TP2 Anm. 3)
    tp3Max: 2920,  // 29,20 € (TP3 Anm. 3)
  },
};

// ============================================================================
// PERIODE 2023: ab 01.05.2023
// ============================================================================
// Quelle: BGBl. II Nr. 131/2023 (Valorisierung ab 01.05.2023)
// Aktuell gültige Periode

const PERIOD_2023: TariffPeriod = {
  id: "PERIOD_2023",
  validFrom: "2023-05-01",
  validTo: null,  // Aktuell gültig
  bgbl: "BGBl. II Nr. 131/2023",
  risUrl: "https://www.ris.bka.gv.at/Dokumente/BgblAuth/BGBLA_2023_II_131/BGBLA_2023_II_131.html",
  thresholds: THRESHOLDS_EUR,
  brackets: {
    // TP 1 Brackets (Cents) - RATG Anlage 1, Tarifpost 1, Anm. 1-12 (ab 01.05.2023)
    TP1: [420, 590, 750, 840, 920, 1110, 1480, 1610, 1790, 2150, 2660, 3510],
    // TP 2 Brackets (Cents) - RATG Anlage 1, Tarifpost 2, Anm. 1-12 (ab 01.05.2023)
    TP2: [1790, 2660, 3510, 3870, 4370, 5250, 6980, 7860, 8700, 10460, 13020, 17380],
    // TP 3A (validiert gegen Referenz-App)
    TP3A: [3510, 5250, 6980, 7680, 8700, 10460, 13910, 15620, 17380, 20820, 26020, 34660],
    // TP 3B = TP 3A × 1,25 (validiert)
    TP3B: [4390, 6540, 8730, 9600, 10880, 13020, 17390, 19530, 21690, 26030, 32530, 43320],
    // TP 3C = TP 3A × 1,5 (validiert)
    TP3C: [5270, 7860, 10470, 11520, 13050, 15620, 20870, 23430, 26020, 31230, 39030, 51960],
    // TP 5 - ACHTUNG: Andere Schwellenwerte! (70, 180, 360, 730, 1820, 2910) - nur 6 Brackets!
    // Quelle: RATG Anlage 1, TP5 (ab 1.5.2023): bis 70=4,20 / bis 180=5,60 / bis 360=6,30 /
    //         bis 730=7,50 / bis 1820=9,20 / bis 2910=10,80
    TP5: [420, 560, 630, 750, 920, 1080],
    // TP 6 = TP 5 × 2
    TP6: [840, 1120, 1260, 1500, 1840, 2160],
  },
  specs: {
    TP1:  { step: 420,  vt_factor: 0.1,  max: 31220,   max_vk: 22520 },
    TP2:  { step: 1790, vt_factor: 0.5,  max: 155820,  max_vk: 106870 },
    TP3A: { step: 3510, vt_factor: 1.0,  max: 2077060, max_vk: 212370 },
    TP3B: { step: 4370, vt_factor: 1.25, max: 2596320, max_vk: 265150 },
    TP3C: { step: 5250, vt_factor: 1.5,  max: 3115580, max_vk: 318260 },
    // TP5: Steigerung ab 2.910 EUR, step=330 Cents (2023), max=10460 (104,60 EUR)
    TP5:  { step: 330,  vt_factor: 0,    max: 10460,   max_vk: 7540 },
    // TP6 = TP5 × 2, max=20820 (208,20 EUR)
    TP6:  { step: 660,  vt_factor: 0,    max: 20820,   max_vk: 15080 },
  },
  // TP7 Kommission (ab 2023) - max = TP6 max
  tp7: {
    tp71_max: 20820,  // 208,20 € max pro ½ Std (= TP6 max 2023)
    tp72_max: 41640,  // 416,40 € max pro ½ Std (= TP7/1 max × 2)
  },
  // TP9/4 Wegzeit (ab 2023)
  tp94: {
    perHour: 3390,    // 33,90 € je angefangene Stunde (kein Maximum)
  },
  // TP9/1/c Reiseentschädigung (ab 2023)
  tp91c: {
    perHour: 1790,    // 17,90 € je angefangene Stunde
  },
  // TP8 Besprechungen (ab 2023)
  tp8: {
    thresholds: [70, 180, 360, 730, 1820],  // Schwellenwerte für Brackets
    brackets: [1480, 2150, 2850, 3510, 5250],  // 14,80 / 21,50 / 28,50 / 35,10 / 52,50 €
    step1: 1110,  // 11,10 € je 1.450 EUR (1.820 bis 20.670)
    step2: 1110,  // 11,10 € (20.670 bis 21.800)
    step3: 590,   // 5,90 € je 1.450 EUR (über 21.800)
    max: 69290,   // 692,90 € max pro ½ Std
    maxKurz: 27740,  // 277,40 € max für Kurzform
  },
  // TP4 Strafsachen (ab 2023) - fixe Basiswerte
  tp4: {
    anklageBG: 18460,        // 184,60 € (Anm. 1)
    anklageAndere: 30760,    // 307,60 € (Anm. 2)
    wartezeitBG: 920,        // 9,20 € (Anm. 3)
    wartezeitAndere: 1790,   // 17,90 € (Anm. 4)
    abberaumungAndere: 3510, // 35,10 € (Anm. 5)
  },
  // ERV-Zuschlag § 23a RATG (konstant seit 2008)
  erv: {
    erst: 500,   // 5,00 € Ersteinbringung
    folge: 260,  // 2,60 € Folgeeinbringung
  },
  // Abberaumung TP2/TP3 (ab 2023)
  abberaumung: {
    tp2Max: 1190,  // 11,90 € (TP2 Anm. 3)
    tp3Max: 3510,  // 35,10 € (TP3 Anm. 3)
  },
};

// ============================================================================
// TARIFF_PERIODS Array (chronologisch sortiert)
// ============================================================================

export const TARIFF_PERIODS: TariffPeriod[] = [
  PERIOD_2016,
  PERIOD_2023,
];

// ============================================================================
// SONDERTARIFE - § 10 RATG Bemessungsgrundlagen
// ============================================================================

export const SPECIAL_TARIFFS: Record<string, SpecialTariff> = {
  /**
   * Besitzstörungsklage - § 10 Z 1/1a RATG
   * Befristet auf 01.01.2026 bis 31.12.2033 (BGBl. I Nr. 112/2025)
   */
  BESITZSTOERUNG: {
    name: "Besitzstörungsklage",
    paragraph: "§ 10 Z 1/1a RATG",
    bgbl: "BGBl. I Nr. 112/2025",
    validFrom: "2026-01-01",
    validTo: "2033-12-31",
    bemessungsgrundlage: 80000,  // € 800
    streitwert: 4000,            // € 40 für Kostenberechnung
  },
};

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

/**
 * Ermittelt die gültige Tarifperiode für ein Datum.
 *
 * @param date Datum (Date-Objekt oder ISO-String YYYY-MM-DD)
 * @returns Passende TariffPeriod
 * @throws Error wenn keine passende Periode gefunden
 */
export function getTariffPeriod(date?: Date | string): TariffPeriod {
  // Default: Aktuelle Periode
  if (!date) {
    return PERIOD_2023;
  }

  const targetDate = typeof date === 'string' ? date : date.toISOString().split('T')[0];

  // Perioden sind chronologisch sortiert, suche von hinten nach vorne
  for (let i = TARIFF_PERIODS.length - 1; i >= 0; i--) {
    const period = TARIFF_PERIODS[i];
    if (targetDate >= period.validFrom) {
      if (!period.validTo || targetDate <= period.validTo) {
        return period;
      }
    }
  }

  // Fallback auf älteste Periode für Daten vor 2016
  return PERIOD_2016;
}

/**
 * Gibt die aktuelle (neueste) Tarifperiode zurück.
 */
export function getCurrentPeriod(): TariffPeriod {
  return TARIFF_PERIODS[TARIFF_PERIODS.length - 1];
}

/**
 * Prüft ob ein Sondertarif für ein Datum gültig ist.
 *
 * @param tariffKey Key des Sondertarifs (z.B. "BESITZSTOERUNG")
 * @param date Datum (Date-Objekt oder ISO-String)
 * @returns SpecialTariff oder null wenn nicht gültig
 */
export function getSpecialTariff(tariffKey: string, date?: Date | string): SpecialTariff | null {
  const tariff = SPECIAL_TARIFFS[tariffKey];
  if (!tariff) return null;

  const targetDate = date
    ? (typeof date === 'string' ? date : date.toISOString().split('T')[0])
    : new Date().toISOString().split('T')[0];

  if (targetDate < tariff.validFrom) return null;
  if (tariff.validTo && targetDate > tariff.validTo) return null;

  return tariff;
}

/**
 * Listet alle verfügbaren Tarifperioden.
 */
export function listPeriods(): { id: string; validFrom: string; validTo: string | null; bgbl: string }[] {
  return TARIFF_PERIODS.map(p => ({
    id: p.id,
    validFrom: p.validFrom,
    validTo: p.validTo,
    bgbl: p.bgbl,
  }));
}

// ============================================================================
// EXPORTIERTE KONSTANTEN
// ============================================================================

export { PERIOD_2016, PERIOD_2023, THRESHOLDS_EUR };
