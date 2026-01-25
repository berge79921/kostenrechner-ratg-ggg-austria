
/**
 * ============================================================================
 * RATG Tarifberechnungen - Rechtsanwaltstarifgesetz
 * ============================================================================
 *
 * Gesetzesquelle: RATG (BGBl. Nr. 189/1969 idF BGBl. II Nr. 456/2024)
 * RIS-Link: https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10002143
 *
 * Letzte Valorisierung: BGBl. II Nr. 131/2023 (ab 01.05.2023)
 *
 * HISTORISCHE TARIFE:
 * Für Berechnungen mit historischen Tarifen kann der optionale `date`-Parameter
 * in getTariffBase() verwendet werden. Siehe lib/tariffs-history.ts for Details.
 *
 * UPDATE-ANLEITUNG bei Gesetzesänderungen:
 * 1. Neue Valorisierungsverordnung im RIS prüfen
 * 2. RATG_CONFIG.VERSION aktualisieren
 * 3. Bracket-Werte in TP1_BRACKETS, TP2_BRACKETS aktualisieren
 * 4. Steigerungs- und Deckelwerte in TARIFF_SPECS aktualisieren
 * 5. Neue Periode in tariffs-history.ts hinzufügen
 * 6. Validierung gegen Referenz-App durchführen
 * ============================================================================
 */

import { getTariffPeriod, getCurrentPeriod, TariffPeriod, THRESHOLDS_TP5_EUR } from './tariffs-history';

export interface TariffResult {
  base: number;
  label: string;
  trace: string;
  version: string;
  /** ID der verwendeten Tarifperiode */
  periodId?: string;
}

// ============================================================================
// RATG KONFIGURATION - Zentrale Parameter mit Gesetzesreferenzen
// ============================================================================

const RATG_CONFIG = {
  /** Datum der aktuellen Fassung (BGBl. II Nr. 131/2023) */
  VERSION: "01.05.2023",

  /** RIS-Link zur aktuellen Fassung */
  RIS_URL: "https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10002143",
};

// ============================================================================
// SCHWELLENWERTE (Bemessungsgrundlage) - RATG Anlage 1
// ============================================================================
// Gesetzesreferenz: RATG Anlage 1, Tarifpost 1-3, Spalte "Bemessungsgrundlage"
// Diese Schwellenwerte gelten for ALLE Tarifposten (TP 1, 2, 3A, 3B, 3C)

const THRESHOLDS_EUR = [40, 70, 110, 180, 360, 730, 1090, 1820, 3630, 5450, 7270, 10170];
const THRESHOLDS_CENTS = THRESHOLDS_EUR.map(v => v * 100);

// ============================================================================
// TARIFPOST 1 (TP 1) - RATG Anlage 1, Tarifpost 1
// ============================================================================
// Gesetzesreferenz: RATG Anlage 1, Tarifpost 1 "Schriftsätze in allen Verfahren"
// Anwendungsbereich: Anzeigen, Ansuchen, Mitteilungen, Anträge auf Kostenbestimmung

const TP1_BRACKETS = {
  // Werte in Cents - Quelle: RATG Anlage 1, TP 1, Anmerkungen 1-12 (ab 01.05.2023)
  ANM_1:  420,   // bis € 40      - RATG TP 1 Anm. 1:  € 4,20
  ANM_2:  590,   // bis € 70      - RATG TP 1 Anm. 2:  € 5,90
  ANM_3:  750,   // bis € 110     - RATG TP 1 Anm. 3:  € 7,50
  ANM_4:  840,   // bis € 180     - RATG TP 1 Anm. 4:  € 8,40
  ANM_5:  920,   // bis € 360     - RATG TP 1 Anm. 5:  € 9,20
  ANM_6:  1110,  // bis € 730     - RATG TP 1 Anm. 6:  € 11,10
  ANM_7:  1480,  // bis € 1.090   - RATG TP 1 Anm. 7:  € 14,80
  ANM_8:  1610,  // bis € 1.820   - RATG TP 1 Anm. 8:  € 16,10
  ANM_9:  1790,  // bis € 3.630   - RATG TP 1 Anm. 9:  € 17,90
  ANM_10: 2150,  // bis € 5.450   - RATG TP 1 Anm. 10: € 21,50
  ANM_11: 2660,  // bis € 7.270   - RATG TP 1 Anm. 11: € 26,60
  ANM_12: 3510,  // bis € 10.170  - RATG TP 1 Anm. 12: € 35,10
};

// ============================================================================
// TARIFPOST 2 (TP 2) - RATG Anlage 1, Tarifpost 2
// ============================================================================
// Gesetzesreferenz: RATG Anlage 1, Tarifpost 2 Abschnitt I "Schriftsätze"
// Anwendungsbereich: Schriftsätze im Zivil-, Exekutions-, außerstreitigen Verfahren

const TP2_BRACKETS = {
  // Werte in Cents - Quelle: RATG Anlage 1, TP 2 Abschn. I, Anmerkungen 1-12 (ab 01.05.2023)
  ANM_1:  1790,   // bis € 40      - RATG TP 2 Anm. 1:  € 17,90
  ANM_2:  2660,   // bis € 70      - RATG TP 2 Anm. 2:  € 26,60
  ANM_3:  3510,   // bis € 110     - RATG TP 2 Anm. 3:  € 35,10
  ANM_4:  3870,   // bis € 180     - RATG TP 2 Anm. 4:  € 38,70
  ANM_5:  4370,   // bis € 360     - RATG TP 2 Anm. 5:  € 43,70
  ANM_6:  5250,   // bis € 730     - RATG TP 2 Anm. 6:  € 52,50
  ANM_7:  6980,   // bis € 1.090   - RATG TP 2 Anm. 7:  € 69,80
  ANM_8:  7860,   // bis € 1.820   - RATG TP 2 Anm. 8:  € 78,60
  ANM_9:  8700,   // bis € 3.630   - RATG TP 2 Anm. 9:  € 87,00
  ANM_10: 10460,  // bis € 5.450   - RATG TP 2 Anm. 10: € 104,60
  ANM_11: 13020,  // bis € 7.270   - RATG TP 2 Anm. 11: € 130,20
  ANM_12: 17380,  // bis € 10.170  - RATG TP 2 Anm. 12: € 173,80
};

// ============================================================================
// TARIFPOST 3A (TP 3A) - RATG Anlage 1, Tarifpost 3A
// ============================================================================
// Gesetzesreferenz: RATG Anlage 1, Tarifpost 3A Abschnitt I "Schriftsätze"
// Anwendungsbereich: Klagen, Klagebeantwortungen, vorbereitende Schriftsätze
// Hinweis: TP 3A = TP 2 × 2 (empirisch aus Referenz-App validiert)

const TP3A_BRACKETS = {
  // Werte in Cents - abgeleitet aus Referenz-App, validiert gegen RATG
  ANM_1:  3510,   // bis € 40      - TP 3A Anm. 1:  € 35,10
  ANM_2:  5250,   // bis € 70      - TP 3A Anm. 2:  € 52,50
  ANM_3:  6980,   // bis € 110     - TP 3A Anm. 3:  € 69,80
  ANM_4:  7680,   // bis € 180     - TP 3A Anm. 4:  € 76,80
  ANM_5:  8700,   // bis € 360     - TP 3A Anm. 5:  € 87,00
  ANM_6:  10460,  // bis € 730     - TP 3A Anm. 6:  € 104,60
  ANM_7:  13910,  // bis € 1.090   - TP 3A Anm. 7:  € 139,10
  ANM_8:  15620,  // bis € 1.820   - TP 3A Anm. 8:  € 156,20
  ANM_9:  17380,  // bis € 3.630   - TP 3A Anm. 9:  € 173,80
  ANM_10: 20820,  // bis € 5.450   - TP 3A Anm. 10: € 208,20
  ANM_11: 26020,  // bis € 7.270   - TP 3A Anm. 11: € 260,20
  ANM_12: 34660,  // bis € 10.170  - TP 3A Anm. 12: € 346,60
};

// ============================================================================
// TARIFPOST 3B (TP 3B) - RATG Anlage 1, Tarifpost 3B
// ============================================================================
// Gesetzesreferenz: RATG Anlage 1, Tarifpost 3B Abschnitt I "Schriftsätze"
// Anwendungsbereich: Berufungen, Revisionen, Rekurse und deren Beantwortungen
// Hinweis: TP 3B = TP 3A × 1,25 (RATG Anlage 1, TP 3B)

const TP3B_BRACKETS = {
  // Werte in Cents - TP 3A × 1,25 (gerundet auf 10 Cent)
  ANM_1:  4390,   // bis € 40      - TP 3B Anm. 1:  € 43,90
  ANM_2:  6540,   // bis € 70      - TP 3B Anm. 2:  € 65,40
  ANM_3:  8730,   // bis € 110     - TP 3B Anm. 3:  € 87,30
  ANM_4:  9600,   // bis € 180     - TP 3B Anm. 4:  € 96,00
  ANM_5:  10880,  // bis € 360     - TP 3B Anm. 5:  € 108,80
  ANM_6:  13020,  // bis € 730     - TP 3B Anm. 6:  € 130,20
  ANM_7:  17390,  // bis € 1.090   - TP 3B Anm. 7:  € 173,90
  ANM_8:  19530,  // bis € 1.820   - TP 3B Anm. 8:  € 195,30
  ANM_9:  21690,  // bis € 3.630   - TP 3B Anm. 9:  € 216,90
  ANM_10: 26030,  // bis € 5.450   - TP 3B Anm. 10: € 260,30
  ANM_11: 32530,  // bis € 7.270   - TP 3B Anm. 11: € 325,30
  ANM_12: 43320,  // bis € 10.170  - TP 3B Anm. 12: € 433,20
};

// ============================================================================
// TARIFPOST 3C (TP 3C) - RATG Anlage 1, Tarifpost 3C
// ============================================================================
// Gesetzesreferenz: RATG Anlage 1, Tarifpost 3C Abschnitt I "Schriftsätze"
// Anwendungsbereich: Rechtsmittel an OGH, VfGH, VwGH, EuGH
// Hinweis: TP 3C = TP 3A × 1,5 (RATG Anlage 1, TP 3C)

const TP3C_BRACKETS = {
  // Werte in Cents - TP 3A × 1,5 (gerundet auf 10 Cent)
  ANM_1:  5270,   // bis € 40      - TP 3C Anm. 1:  € 52,70
  ANM_2:  7860,   // bis € 70      - TP 3C Anm. 2:  € 78,60
  ANM_3:  10470,  // bis € 110     - TP 3C Anm. 3:  € 104,70
  ANM_4:  11520,  // bis € 180     - TP 3C Anm. 4:  € 115,20
  ANM_5:  13050,  // bis € 360     - TP 3C Anm. 5:  € 130,50
  ANM_6:  15620,  // bis € 730     - TP 3C Anm. 6:  € 156,20
  ANM_7:  20870,  // bis € 1.090   - TP 3C Anm. 7:  € 208,70
  ANM_8:  23430,  // bis € 1.820   - TP 3C Anm. 8:  € 234,30
  ANM_9:  26020,  // bis € 3.630   - TP 3C Anm. 9:  € 260,20
  ANM_10: 31230,  // bis € 5.450   - TP 3C Anm. 10: € 312,30
  ANM_11: 39030,  // bis € 7.270   - TP 3C Anm. 11: € 390,30
  ANM_12: 51960,  // bis € 10.170  - TP 3C Anm. 12: € 519,60
};

// ============================================================================
// STEIGERUNGSLOGIK ÜBER € 10.170 - RATG Anlage 1
// ============================================================================
// Gesetzesreferenz: RATG Anlage 1, TP 1-3, Zeile "über 10.170"

const ESCALATION = {
  /** Schwelle 1: über € 10.170 bis € 34.820 - RATG Anlage 1 "je 1.450 EUR" */
  SEGMENT_1_START: 1017000,  // 10.170 EUR in Cents
  SEGMENT_1_END:   3482000,  // 34.820 EUR in Cents
  STEP_INTERVAL:   145000,   // 1.450 EUR in Cents - RATG "je 1.450"

  /** Schwelle 2: über € 34.820 bis € 36.340 - RATG Anlage 1 "zusätzlicher Schritt" */
  SEGMENT_2_END:   3634000,  // 36.340 EUR in Cents
  SEGMENT_2_STEP:  152000,   // 1.520 EUR (36.340 - 34.820) in Cents

  /** Schwelle 3: über € 36.340 bis € 363.360 - RATG Anlage 1 "vT vom Mehrbetrag" */
  VT_SEGMENT_END:  36336000, // 363.360 EUR in Cents

  /** Schwelle 4: über € 363.360 - RATG Anlage 1 "halber vT-Satz" */
  VT_HALVING_FACTOR: 0.5,    // vT-Satz halbiert sich über 363.360 EUR
};

// ============================================================================
// TARIFSPEZIFIKATIONEN - Steigerung und Deckelung je Tarifpost
// ============================================================================

const TARIFF_SPECS = {
  'TP1': {
    /** Steigerung pro 1.450 EUR - RATG TP 1 Anm. 1: € 4,20 */
    step: 420,
    /** vT-Faktor for Mehrbetrag über 36.340 - RATG TP 1: 0,1 vT */
    vt_factor: 0.1,
    vt_label: '0,1',
    /** Höchstbetrag - RATG TP 1 Anm. 13: € 312,20 */
    max: 31220,
    /** Höchstbetrag Verbandsklage - RATG TP 1 Abs IV: € 225,20 */
    max_verbandsklage: 22520,
  },
  'TP2': {
    /** Steigerung pro 1.450 EUR - RATG TP 2 Anm. 1: € 17,90 */
    step: 1790,
    /** vT-Faktor for Mehrbetrag über 36.340 - RATG TP 2: 0,5 vT */
    vt_factor: 0.5,
    vt_label: '0,5',
    /** Höchstbetrag - RATG TP 2 Anm. 13: € 1.558,20 */
    max: 155820,
    /** Höchstbetrag Verbandsklage - RATG TP 2 Abs III: € 1.068,70 */
    max_verbandsklage: 106870,
  },
  'TP3A': {
    /** Steigerung pro 1.450 EUR - RATG TP 3A: € 35,10 (validiert) */
    step: 3510,
    /** vT-Faktor for Mehrbetrag über 36.340 - RATG TP 3A: 1 vT */
    vt_factor: 1.0,
    vt_label: '1',
    /** Höchstbetrag - RATG TP 3A Abs IV: € 20.770,60 */
    max: 2077060,
    /** Höchstbetrag Verbandsklage - RATG TP 3A Abs IV: € 2.123,70 */
    max_verbandsklage: 212370,
  },
  'TP3B': {
    /** Steigerung pro 1.450 EUR - RATG TP 3B: € 43,70 (validiert) */
    step: 4370,
    /** vT-Faktor for Mehrbetrag über 36.340 - RATG TP 3B: 1,25 vT */
    vt_factor: 1.25,
    vt_label: '1,25',
    /** Höchstbetrag - RATG TP 3B: € 25.963,20 (validiert) */
    max: 2596320,
    /** Höchstbetrag Verbandsklage - RATG TP 3B Abs III: € 2.651,50 */
    max_verbandsklage: 265150,
  },
  // Fix: Changed second occurrence of duplicate key 'TP3B' to 'TP3C'
  'TP3C': {
    /** Steigerung pro 1.450 EUR - RATG TP 3C: € 52,50 (validiert) */
    step: 5250,
    /** vT-Faktor for Mehrbetrag über 36.340 - RATG TP 3C: 1,5 vT */
    vt_factor: 1.5,
    vt_label: '1,5',
    /** Höchstbetrag - RATG TP 3C: € 31.155,80 (validiert) */
    max: 3115580,
    /** Höchstbetrag Verbandsklage - RATG TP 3C Abs IV: € 3.182,60 */
    max_verbandsklage: 318260,
  },
} as const;

// ============================================================================
// EINHEITSSATZ - § 23 RATG
// ============================================================================
// Gesetzesreferenz: § 23 RATG "Einheitssatz"

const EINHEITSSATZ = {
  /** Einheitssatz bis € 10.170 - § 23 Abs 1 RATG: 60% */
  RATE_LOW: 0.6,
  /** Einheitssatz über € 10.170 - § 23 Abs 1 RATG: 50% */
  RATE_HIGH: 0.5,
  /** Schwelle for Wechsel - § 23 Abs 1 RATG */
  THRESHOLD: 1017000,  // 10.170 EUR in Cents (korrigiert von 10170)
};

// ============================================================================
// ERV-BEITRAG - § 23a RATG
// ============================================================================
// Gesetzesreferenz: § 23a RATG "Elektronischer Rechtsverkehr"

const ERV = {
  /** Einleitender Schriftsatz - § 23a Abs 1 RATG: € 5,00 */
  INITIAL: 500,
  /** Weitere Schriftsätze - § 23a Abs 1 RATG: € 2,60 */
  SUBSEQUENT: 260,
  /** Grundbuch/Firmenbuch - § 23a Abs 2 RATG: € 9,50 */
  GRUNDBUCH: 950,
};

// ============================================================================
// BRACKET MATRIX - Zusammengefasst for externe Verwendung
// ============================================================================

const BRACKET_ARRAYS = {
  TP1:  Object.values(TP1_BRACKETS),
  TP2:  Object.values(TP2_BRACKETS),
  TP3A: Object.values(TP3A_BRACKETS),
  TP3B: Object.values(TP3B_BRACKETS),
  TP3C: Object.values(TP3C_BRACKETS),
};

// ============================================================================
// HAUPTBERECHNUNGSFUNKTION
// ============================================================================

/**
 * Berechnet den Tarif-Basisbetrag for eine gegebene Bemessungsgrundlage und Tarifpost.
 *
 * @param cents Bemessungsgrundlage in Cents
 * @param type Tarifpost (TP1, TP2, TP3A, TP3B, TP3C, TP5, TP6)
 * @param date Optional: Datum for historische Berechnung (Date oder ISO-String YYYY-MM-DD)
 * @returns TariffResult mit Basisbetrag, Label, Trace und Version
 */
export function getTariffBase(
  cents: number,
  type: 'TP1' | 'TP2' | 'TP3A' | 'TP3B' | 'TP3C' | 'TP5' | 'TP6',
  date?: Date | string
): TariffResult {
  const bmglCents = Math.round(cents);

  // Periode ermitteln: mit Datum = historisch, ohne = aktuell
  const period: TariffPeriod = date ? getTariffPeriod(date) : getCurrentPeriod();
  const periodLabel = `${period.bgbl}`;

  // TP5 und TP6 haben ANDERE Schwellenwerte → separate Logik
  if (type === 'TP5' || type === 'TP6') {
    return calculateTP5TP6(bmglCents, type, period, periodLabel);
  }

  // TP1-TP3C: Standard-Logik mit 12 Schwellenwerten
  const brackets = period.brackets[type];
  const spec = period.specs[type];
  const thresholdsCents = period.thresholds.map(v => v * 100);

  // 1. Bereich: Brackets bis € 10.170 (Anm. 1-12)
  for (let i = 0; i < thresholdsCents.length; i++) {
    if (bmglCents <= thresholdsCents[i]) {
      const amount = brackets[i];
      return {
        base: amount,
        label: `bis ${period.thresholds[i].toLocaleString('de-AT')} €`,
        trace: `RATG ${type} (${periodLabel})\nAnm. ${i + 1}: bis ${period.thresholds[i].toLocaleString('de-AT')} €\nBetrag: ${(amount / 100).toFixed(2).replace('.', ',')} €`,
        version: period.validFrom,
        periodId: period.id
      };
    }
  }

  // 2. Bereich: über € 10.170 - Steigerungslogik
  const sockel = brackets[11];  // Anm. 12 = Sockel for Steigerung
  let trace = `RATG ${type} (${periodLabel})\nAnm. 12 (Sockel): ${(sockel / 100).toFixed(2).replace('.', ',')} €`;
  let currentBase = sockel;

  // Segment 1: € 10.170 bis € 34.820 (max 17 Schritte à € 1.450)
  if (bmglCents > ESCALATION.SEGMENT_1_START) {
    const excess = Math.min(bmglCents, ESCALATION.SEGMENT_1_END) - ESCALATION.SEGMENT_1_START;
    const steps = Math.ceil(excess / ESCALATION.STEP_INTERVAL);
    const amount = steps * spec.step;
    currentBase += amount;
    trace += `\nüber 10.170 bis 34.820 €: ${steps} × ${(spec.step / 100).toFixed(2).replace('.', ',')} € = ${(amount / 100).toFixed(2).replace('.', ',')} €`;
  }

  // Segment 2: € 34.820 bis € 36.340 (zusätzlicher Schritt)
  if (bmglCents > ESCALATION.SEGMENT_1_END) {
    const excess = Math.min(bmglCents, ESCALATION.SEGMENT_2_END) - ESCALATION.SEGMENT_1_END;
    const steps = Math.ceil(excess / ESCALATION.SEGMENT_2_STEP);
    const amount = steps * spec.step;
    currentBase += amount;
    trace += `\nüber 34.820 bis 36.340 €: ${steps} × ${(spec.step / 100).toFixed(2).replace('.', ',')} € = ${(amount / 100).toFixed(2).replace('.', ',')} €`;
  }

  // Segment 3+4: über € 36.340 (vT-Zuschläge)
  if (bmglCents > ESCALATION.SEGMENT_2_END) {
    trace += `\nSockel (36.340 €): ${(currentBase / 100).toFixed(2).replace('.', ',')} €`;

    // vT-Zuschlag bis € 363.360
    const excessVT1 = Math.min(bmglCents, ESCALATION.VT_SEGMENT_END) - ESCALATION.SEGMENT_2_END;
    const rawSurcharge1 = excessVT1 * 0.001 * spec.vt_factor;
    let totalVT = rawSurcharge1;
    trace += `\nüber 36.340 bis 363.360 €: ${spec.vt_factor} vT von ${(excessVT1 / 100).toLocaleString('de-AT')} €`;

    // vT-Zuschlag über € 363.360 (halber Satz)
    if (bmglCents > ESCALATION.VT_SEGMENT_END) {
      const excessVT2 = bmglCents - ESCALATION.VT_SEGMENT_END;
      const factor2 = spec.vt_factor * ESCALATION.VT_HALVING_FACTOR;
      const rawSurcharge2 = excessVT2 * 0.001 * factor2;
      totalVT += rawSurcharge2;
      trace += `\nüber 363.360 €: ${factor2.toFixed(2).replace('.', ',')} vT von ${(excessVT2 / 100).toLocaleString('de-AT')} €`;
    }

    // Rundung auf 10 Cent
    const roundedTotalVT = Math.round(totalVT / 10) * 10;
    currentBase += roundedTotalVT;
    trace += `\nvT-Zuschlag: ${(roundedTotalVT / 100).toFixed(2).replace('.', ',')} €`;
  }

  // Deckelung (Anm. 13)
  const finalAmount = Math.min(spec.max, currentBase);
  if (currentBase > spec.max) {
    trace += `\n(Gekappt auf Anm. 13 Höchstbetrag: ${(spec.max / 100).toFixed(2).replace('.', ',')} €)`;
  }

  // Berechne genaues Bracket-Label
  let bracketLabel: string;
  if (bmglCents > ESCALATION.SEGMENT_2_END) {
    bracketLabel = `über 36.340 €`;
  } else if (bmglCents > ESCALATION.SEGMENT_1_END) {
    bracketLabel = `über 34.820 € bis 36.340 €`;
  } else {
    // Segment 1: € 10.170 bis € 34.820 (Schritte à € 1.450)
    const excess = bmglCents - ESCALATION.SEGMENT_1_START;
    const stepNum = Math.ceil(excess / ESCALATION.STEP_INTERVAL);
    const lowerBound = 10170 + ((stepNum - 1) * 1450);
    const upperBound = 10170 + (stepNum * 1450);
    bracketLabel = `über ${lowerBound.toLocaleString('de-AT')} € bis ${upperBound.toLocaleString('de-AT')} €`;
  }

  return {
    base: finalAmount,
    label: bracketLabel,
    trace,
    version: period.validFrom,
    periodId: period.id
  };
}

// ============================================================================
// TP5/TP6 BERECHNUNG - Separate Logik (andere Schwellenwerte!)
// ============================================================================
// RATG Anlage 1, Tarifpost 5 (Einfache Schreiben) und TP 6 (Andere Briefe)
// Schwellenwerte: 70, 180, 360, 730, 1.820, 2.910 EUR (NUR 6 Brackets!)
// Steigerung: ab 2.910 EUR, +step je 1.450 EUR

const TP5_ESCALATION = {
  THRESHOLD_START: 291000,  // 2.910 EUR in Cents
  STEP_INTERVAL: 145000,    // 1.450 EUR in Cents
};

function calculateTP5TP6(
  bmglCents: number,
  type: 'TP5' | 'TP6',
  period: TariffPeriod,
  periodLabel: string
): TariffResult {
  const brackets = period.brackets[type];
  const spec = period.specs[type];
  const thresholdsCents = THRESHOLDS_TP5_EUR.map(v => v * 100);

  // 1. Bereich: Brackets bis € 2.910 (6 Brackets)
  for (let i = 0; i < thresholdsCents.length; i++) {
    if (bmglCents <= thresholdsCents[i]) {
      const amount = brackets[i];
      return {
        base: amount,
        label: `bis ${THRESHOLDS_TP5_EUR[i].toLocaleString('de-AT')} €`,
        trace: `RATG ${type} (${periodLabel})\nbis ${THRESHOLDS_TP5_EUR[i].toLocaleString('de-AT')} €\nBetrag: ${(amount / 100).toFixed(2).replace('.', ',')} €`,
        version: period.validFrom,
        periodId: period.id
      };
    }
  }

  // 2. Bereich: über € 2.910 - Steigerungslogik
  const sockel = brackets[5];  // Letzter Bracket = Sockel for Steigerung
  let trace = `RATG ${type} (${periodLabel})\nSockel (bis 2.910 €): ${(sockel / 100).toFixed(2).replace('.', ',')} €`;
  let currentBase = sockel;

  // Steigerung: +step je angefangene 1.450 EUR über 2.910 EUR
  const excess = bmglCents - TP5_ESCALATION.THRESHOLD_START;
  const steps = Math.ceil(excess / TP5_ESCALATION.STEP_INTERVAL);
  const amount = steps * spec.step;
  currentBase += amount;
  trace += `\nüber 2.910 €: ${steps} × ${(spec.step / 100).toFixed(2).replace('.', ',')} € = ${(amount / 100).toFixed(2).replace('.', ',')} €`;

  // Deckelung (Maximum)
  const finalAmount = Math.min(spec.max, currentBase);
  if (currentBase > spec.max) {
    trace += `\n(Gekappt auf Höchstbetrag: ${(spec.max / 100).toFixed(2).replace('.', ',')} €)`;
  }

  trace += `\nGesamt: ${(finalAmount / 100).toFixed(2).replace('.', ',')} €`;

  return {
    base: finalAmount,
    label: `über 2.910 €`,
    trace,
    version: period.validFrom,
    periodId: period.id
  };
}

// ============================================================================
// TP7 KOMMISSION - Außerkanzleigeschäfte
// ============================================================================
// RATG Anlage 1, Tarifpost 7
// TP7/1: = TP6 pro halbe Stunde (Gehilfe)
// TP7/2: = TP7/1 × 2 pro halbe Stunde (RA/RAA erforderlich)

export interface KommissionResult {
  /** Entlohnung for Kommission in Cents */
  kommission: number;
  /** Wegzeit-Entschädigung in Cents */
  wegzeit: number;
  /** Gesamtbetrag in Cents */
  total: number;
  /** Detaillierte Berechnung */
  trace: string;
  /** Tarifperiode */
  periodId: string;
}

/**
 * Berechnet die Kommissionsentlohnung (TP7/1 oder TP7/2) inkl. Wegzeit (TP9/4).
 *
 * @param cents Bemessungsgrundlage (Streitwert) in Cents
 * @param halbeStunden Anzahl der (angefangenen) halben Stunden
 * @param wegStunden Anzahl der (angefangenen) ganzen Stunden Wegzeit
 * @param mitRA true = TP7/2 (RA/RAA erforderlich), false = TP7/1
 * @param date Optional: Datum for historische Berechnung
 * @returns KommissionResult mit Kommission, Wegzeit und Gesamtbetrag
 */
export function getKommission(
  cents: number,
  halbeStunden: number,
  wegStunden: number,
  mitRA: boolean = false,
  date?: Date | string
): KommissionResult {
  const period = date ? getTariffPeriod(date) : getCurrentPeriod();
  const periodLabel = period.bgbl;

  // TP6-Basis berechnen
  const tp6Result = getTariffBase(cents, 'TP6', date);
  const tp6Base = tp6Result.base;

  // TP7/1 = TP6, gedeckelt auf max
  const tp71ProHalb = Math.min(tp6Base, period.tp7.tp71_max);

  // TP7/2 = TP7/1 × 2, gedeckelt auf max
  const tp72ProHalb = Math.min(tp6Base * 2, period.tp7.tp72_max);

  // Kommission berechnen
  const proHalb = mitRA ? tp72ProHalb : tp71ProHalb;
  const kommission = proHalb * halbeStunden;
  const tpLabel = mitRA ? 'TP7/2' : 'TP7/1';

  // Wegzeit (TP9/4) - kein Maximum
  const wegzeit = period.tp94.perHour * wegStunden;

  // Trace erstellen
  let trace = `RATG ${tpLabel} Kommission (${periodLabel})\n`;
  trace += `Streitwert: ${(cents / 100).toLocaleString('de-AT')} €\n`;
  trace += `TP6-Basis: ${(tp6Base / 100).toFixed(2).replace('.', ',')} €\n`;

  if (mitRA) {
    trace += `TP7/2 (RA erforderlich): ${(tp72ProHalb / 100).toFixed(2).replace('.', ',')} € × ${halbeStunden} ½ Std = ${(kommission / 100).toFixed(2).replace('.', ',')} €\n`;
  } else {
    trace += `TP7/1: ${(tp71ProHalb / 100).toFixed(2).replace('.', ',')} € × ${halbeStunden} ½ Std = ${(kommission / 100).toFixed(2).replace('.', ',')} €\n`;
  }

  trace += `TP9/4 Wegzeit: ${(period.tp94.perHour / 100).toFixed(2).replace('.', ',')} € × ${wegStunden} Std = ${(wegzeit / 100).toFixed(2).replace('.', ',')} €`;
  trace += `\nGesamt: ${((kommission + wegzeit) / 100).toFixed(2).replace('.', ',')} €`;

  return {
    kommission,
    wegzeit,
    total: kommission + wegzeit,
    trace,
    periodId: period.id
  };
}

/**
 * Berechnet nur die Wegzeit-Entschädigung (TP9/4).
 *
 * @param wegStunden Anzahl der (angefangenen) ganzen Stunden
 * @param date Optional: Datum for historische Berechnung
 * @returns Wegzeit in Cents
 */
export function getWegzeit(wegStunden: number, date?: Date | string): number {
  const period = date ? getTariffPeriod(date) : getCurrentPeriod();
  return period.tp94.perHour * wegStunden;
}

/**
 * Berechnet die Reiseentschädigung (TP9/1/c).
 *
 * @param stunden Anzahl der (angefangenen) ganzen Stunden
 * @param date Optional: Datum for historische Berechnung
 * @returns Reiseentschädigung in Cents
 */
export function getReiseentschaedigung(stunden: number, date?: Date | string): number {
  const period = date ? getTariffPeriod(date) : getCurrentPeriod();
  return period.tp91c.perHour * stunden;
}

// ============================================================================
// TAGSATZUNG (TP2, TP3A, TP3B, TP3C) - Zivilverfahren
// ============================================================================
// RATG Anlage 1, Tarifpost 2/3 Abschnitt II "Tagsatzungen"
// Entlohnung: 1. Stunde (= 2 ½ Std) = volle Basis, jede weitere angefangene Stunde = ½ Basis
// Wartezeit: 1. ½ Std frei, danach ¼ TP2-Basis pro weitere ½ Std, mit Maximum:
//   - TP2 (BG): max 9,20 € pro ½ Std (= tp4.wartezeitBG)
//   - TP3A/B/C: max 17,90 € pro ½ Std (= tp4.wartezeitAndere)

export type TagsatzungType = 'TP2' | 'TP3A' | 'TP3B' | 'TP3C';

export interface TagsatzungResult {
  /** Entlohnung pro halbe Stunde in Cents */
  proHalbeStunde: number;
  /** Entlohnung gesamt in Cents */
  entlohnung: number;
  /** Wartezeit-Entschädigung in Cents */
  wartezeit: number;
  /** Gesamtbetrag (Entlohnung + Wartezeit) in Cents */
  netto: number;
  /** Detaillierte Berechnung */
  trace: string;
  /** Tarifperiode */
  periodId: string;
}

/**
 * Berechnet die Tagsatzungsentlohnung (TP2, TP3A, TP3B, TP3C).
 *
 * @param cents Bemessungsgrundlage (Streitwert) in Cents
 * @param type Tarifpost (TP2, TP3A, TP3B, TP3C)
 * @param halbeStundenDauer Anzahl der (angefangenen) halben Stunden Dauer
 * @param halbeStundenWartezeit Anzahl der halben Stunden Wartezeit (1. ist frei)
 * @param date Optional: Datum for historische Berechnung
 * @returns TagsatzungResult mit Entlohnung, Wartezeit und Netto
 */
export function getTagsatzung(
  cents: number,
  type: TagsatzungType,
  halbeStundenDauer: number,
  halbeStundenWartezeit: number = 0,
  date?: Date | string
): TagsatzungResult {
  const period = date ? getTariffPeriod(date) : getCurrentPeriod();
  const periodLabel = period.bgbl;

  // Tarifpost-Basis for Streitwert berechnen
  const basisResult = getTariffBase(cents, type, date);
  const basis = basisResult.base;
  const halbesBasis = Math.round(basis / 2 / 10) * 10; // auf 10 Cent gerundet

  // Entlohnung: 1. Stunde = Basis, jede weitere angefangene Stunde = ½ Basis
  // (1-2 ½ Std = Basis, 3-4 ½ Std = Basis + ½ Basis, 5-6 ½ Std = Basis + 2×½ Basis, ...)
  const ganzeStunden = Math.ceil(halbeStundenDauer / 2);
  const weitereStunden = ganzeStunden - 1;
  const entlohnung = basis + weitereStunden * halbesBasis;

  // Wartezeit: 1. ½ Std ist frei, danach ¼ TP2-Basis pro weitere ½ Std (mit Maximum)
  // TP2: max 9,20 € (= tp4.wartezeitBG), TP3A/B/C: max 17,90 € (= tp4.wartezeitAndere)
  const weitereHalbeStundenWartezeit = Math.max(0, halbeStundenWartezeit - 1);

  // ¼ der TP2-Basis berechnen (for den Streitwert)
  const tp2Basis = getTariffBase(cents, 'TP2', date).base;
  const viertelTP2 = Math.round(tp2Basis / 4 / 10) * 10;

  // Maximum je nach Tarifpost
  const wartezeitMax = type === 'TP2' ? period.tp4.wartezeitBG : period.tp4.wartezeitAndere;
  const wartezeitProHalbe = Math.min(viertelTP2, wartezeitMax);
  const wartezeit = weitereHalbeStundenWartezeit * wartezeitProHalbe;

  const netto = entlohnung + wartezeit;

  // Trace erstellen
  let trace = `RATG ${type} Tagsatzung (${periodLabel})\n`;
  trace += `Streitwert: ${(cents / 100).toLocaleString('de-AT')} €\n`;
  trace += `${type} Basis: ${(basis / 100).toFixed(2).replace('.', ',')} € (1. Std)\n`;
  trace += `${type} weitere ½ Std: ${(halbesBasis / 100).toFixed(2).replace('.', ',')} €\n`;
  trace += `\nEntlohnung (${halbeStundenDauer} ½ Std = ${ganzeStunden} Std):\n`;
  trace += `  1. Stunde: ${(basis / 100).toFixed(2).replace('.', ',')} €\n`;
  if (weitereStunden > 0) {
    trace += `  + ${weitereStunden} weitere Std × ${(halbesBasis / 100).toFixed(2).replace('.', ',')} € = ${(weitereStunden * halbesBasis / 100).toFixed(2).replace('.', ',')} €\n`;
  }
  trace += `  = ${(entlohnung / 100).toFixed(2).replace('.', ',')} €\n`;
  trace += `\nWartezeit (¼ TP2, max ${(wartezeitMax / 100).toFixed(2).replace('.', ',')} €):\n`;
  trace += `  ${halbeStundenWartezeit} × ½ Std (1. frei) → ${weitereHalbeStundenWartezeit} weitere\n`;
  trace += `  ¼ TP2 = ${(viertelTP2 / 100).toFixed(2).replace('.', ',')} € → gedeckelt: ${(wartezeitProHalbe / 100).toFixed(2).replace('.', ',')} €\n`;
  trace += `  ${weitereHalbeStundenWartezeit} × ${(wartezeitProHalbe / 100).toFixed(2).replace('.', ',')} € = ${(wartezeit / 100).toFixed(2).replace('.', ',')} €\n`;
  trace += `\nNetto: ${(netto / 100).toFixed(2).replace('.', ',')} €`;

  return {
    proHalbeStunde: basis,
    entlohnung,
    wartezeit,
    netto,
    trace,
    periodId: period.id
  };
}

/**
 * Berechnet die Wartezeit-Entschädigung for Tagsatzungen (Zivilverfahren).
 * 1. halbe Stunde ist frei, danach ¼ TP2-Basis pro weitere ½ Std (mit Maximum).
 *
 * @param cents Bemessungsgrundlage (Streitwert) in Cents
 * @param type Tarifpost (TP2, TP3A, TP3B, TP3C)
 * @param halbeStundenWartezeit Gesamte Wartezeit in halben Stunden (1. ist frei)
 * @param date Optional: Datum for historische Berechnung
 * @returns Wartezeit in Cents
 */
export function getTagsatzungWartezeit(
  cents: number,
  type: TagsatzungType,
  halbeStundenWartezeit: number,
  date?: Date | string
): number {
  const period = date ? getTariffPeriod(date) : getCurrentPeriod();
  const weitereHalbeStunden = Math.max(0, halbeStundenWartezeit - 1);

  // ¼ der TP2-Basis berechnen
  const tp2Basis = getTariffBase(cents, 'TP2', date).base;
  const viertelTP2 = Math.round(tp2Basis / 4 / 10) * 10;

  // Maximum: TP2 = 9,20 €, TP3A/B/C = 17,90 €
  const wartezeitMax = type === 'TP2' ? period.tp4.wartezeitBG : period.tp4.wartezeitAndere;
  const wartezeitProHalbe = Math.min(viertelTP2, wartezeitMax);

  return weitereHalbeStunden * wartezeitProHalbe;
}

/**
 * Berechnet die Abberaumungs-Entschädigung for Tagsatzungen (TP2/TP3).
 * RATG Anlage 1, TP2/TP3 Anmerkung 3:
 * "Ist der Rechtsanwalt erschienen, von deren Abberaumung er nicht rechtzeitig
 * verständigt wurde, gebührt die Hälfte der Entlohnung nach TP2, jedoch nie mehr als..."
 *
 * @param cents Bemessungsgrundlage (Streitwert) in Cents
 * @param type Tarifpost (TP2, TP3A, TP3B, TP3C)
 * @param date Optional: Datum for historische Berechnung
 * @returns Abberaumungs-Entschädigung in Cents
 */
export function getTagsatzungAbberaumung(
  cents: number,
  type: TagsatzungType,
  date?: Date | string
): number {
  const period = date ? getTariffPeriod(date) : getCurrentPeriod();

  // ½ der TP2-Basis berechnen
  const tp2Basis = getTariffBase(cents, 'TP2', date).base;
  const halbTP2 = Math.round(tp2Basis / 2 / 10) * 10;

  // Maximum: TP2 = 11,90 €, TP3 = 35,10 € (2023)
  const maxCents = type === 'TP2' ? period.abberaumung.tp2Max : period.abberaumung.tp3Max;

  return Math.min(halbTP2, maxCents);
}

// ============================================================================
// TP4 STRAFSACHEN - Privatanklage / Mediengesetz / Privatbeteiligte
// ============================================================================
// RATG Anlage 1, Tarifpost 4
// Fixe Basiswerte (nicht streitwertabhängig!)
// Abschnitt I: Privatanklage und Mediengesetz
// Abschnitt II: Privatbeteiligte (= 0,5 × Abschnitt I)
//
// WICHTIG - Einheitssatz (ES) bei TP4:
// - Maximal EINFACHER Einheitssatz (nicht 60%/50% wie bei TP1-TP3)
// - § 23 Abs 9 RATG: "In Strafsachen gebührt nur der einfache Einheitssatz"
//
// ERV-Zuschlag bei TP4 (§ 23a RATG):
// - keine: kein ERV-Zuschlag
// - erst:  € 5,00 (erster Schriftsatz)
// - folge: € 2,60 (weitere Schriftsätze)

/** Varianten for TP4 */
export type TP4Variante =
  | 'ANKLAGE_BG'        // Abschnitt I Z 1 lit a - Vergehen Bezirksgericht
  | 'ANKLAGE_ANDERE'    // Abschnitt I Z 1 lit b - sonstige Vergehen
  | 'MEDIENGESETZ'      // Abschnitt I Z 2 - Anträge nach Mediengesetz
  | 'PRIV_BG'           // Abschnitt II lit a - Privatbeteiligte BG
  | 'PRIV_ANDERE';      // Abschnitt II lit b - Privatbeteiligte andere

/** Schriftsatzarten for TP4 */
export type TP4Schriftsatz =
  | 'ANKLAGE'           // Z 1 - Anklage (= 1× Basis)
  | 'BEWEISANTRAG'      // Z 3 - Beweisanträge, andere Eingaben (= 1× Basis)
  | 'KURZE_EINGABE'     // Z 3 - kurze/einfache Eingaben (= 0,5× Basis)
  | 'RM_ANMELDUNG'      // Z 4 lit a - Rechtsmittelanmeldung (= 0,1× Basis)
  | 'BESCHWERDE_UA'     // Z 4 lit b - Beschwerden, Einsprüche, etc. (= 1× Basis)
  | 'RM_AUSFUEHRUNG'    // Z 4 lit c - Berufung, Nichtigkeitsbeschwerde (= 1,5× Basis)
  | 'KOSTENBESCHWERDE'; // Z 4 lit d - Kostenbeschwerde (= TP2, max. Basis)

export interface TP4Result {
  /** Entlohnung in Cents */
  amount: number;
  /** Beschreibung */
  label: string;
  /** Detaillierte Berechnung */
  trace: string;
  /** Tarifperiode */
  periodId: string;
}

/**
 * Berechnet die Entlohnung for TP4 Strafsachen.
 *
 * @param variante Art des Verfahrens (Anklage BG/andere, Mediengesetz, Privatbeteiligte)
 * @param schriftsatz Art des Schriftsatzes
 * @param kostenbeschwerdeStreitwert Optional: Streitwert in Cents for Kostenbeschwerde (§ 11)
 * @param date Optional: Datum for historische Berechnung
 * @returns TP4Result mit Entlohnung und Trace
 */
export function getTP4(
  variante: TP4Variante,
  schriftsatz: TP4Schriftsatz,
  kostenbeschwerdeStreitwert?: number,
  date?: Date | string
): TP4Result {
  const period = date ? getTariffPeriod(date) : getCurrentPeriod();
  const periodLabel = period.bgbl;

  // Basiswert ermitteln
  let basis: number;
  let varianteLabel: string;
  const isPrivatbeteiligt = variante === 'PRIV_BG' || variante === 'PRIV_ANDERE';

  switch (variante) {
    case 'ANKLAGE_BG':
      basis = period.tp4.anklageBG;
      varianteLabel = 'Privatanklage BG (Abschn. I Z 1 lit a)';
      break;
    case 'ANKLAGE_ANDERE':
      basis = period.tp4.anklageAndere;
      varianteLabel = 'Privatanklage andere (Abschn. I Z 1 lit b)';
      break;
    case 'MEDIENGESETZ':
      basis = period.tp4.anklageAndere;
      varianteLabel = 'Mediengesetz (Abschn. I Z 2)';
      break;
    case 'PRIV_BG':
      // 0,5× Abschn. I, gerundet auf 10 Cent
      basis = Math.round(period.tp4.anklageBG / 2 / 10) * 10;
      varianteLabel = 'Privatbeteiligte BG (Abschn. II lit a)';
      break;
    case 'PRIV_ANDERE':
      // 0,5× Abschn. I, gerundet auf 10 Cent
      basis = Math.round(period.tp4.anklageAndere / 2 / 10) * 10;
      varianteLabel = 'Privatbeteiligte andere (Abschn. II lit b)';
      break;
  }

  // Schriftsatz-Faktor und Berechnung
  let amount: number;
  let schriftsatzLabel: string;
  let faktorInfo: string;

  switch (schriftsatz) {
    case 'ANKLAGE':
      amount = basis;
      schriftsatzLabel = 'Anklage';
      faktorInfo = '1× Basis';
      break;
    case 'BEWEISANTRAG':
      amount = basis;
      schriftsatzLabel = 'Beweisantrag / sonstige Eingabe';
      faktorInfo = '1× Basis';
      break;
    case 'KURZE_EINGABE':
      // 0,5× Basis, gerundet auf 10 Cent
      amount = Math.round(basis / 2 / 10) * 10;
      schriftsatzLabel = 'Kurze/einfache Eingabe';
      faktorInfo = '0,5× Basis';
      break;
    case 'RM_ANMELDUNG':
      // 0,1× Basis, gerundet auf 10 Cent
      amount = Math.round(basis / 10 / 10) * 10;
      schriftsatzLabel = 'Rechtsmittelanmeldung';
      faktorInfo = '0,1× Basis (gerundet auf 10 Cent)';
      break;
    case 'BESCHWERDE_UA':
      amount = basis;
      schriftsatzLabel = 'Beschwerde / Einspruch / Wiedereinsetzung';
      faktorInfo = '1× Basis';
      break;
    case 'RM_AUSFUEHRUNG':
      // 1,5× Basis, gerundet auf 10 Cent
      amount = Math.round(basis * 1.5 / 10) * 10;
      schriftsatzLabel = 'Berufungsausführung / Nichtigkeitsbeschwerde';
      faktorInfo = '1,5× Basis';
      break;
    case 'KOSTENBESCHWERDE':
      // TP2 berechnen, aber max. Basis
      if (kostenbeschwerdeStreitwert !== undefined) {
        const tp2Result = getTariffBase(kostenbeschwerdeStreitwert, 'TP2', date);
        amount = Math.min(tp2Result.base, basis);
        schriftsatzLabel = 'Kostenbeschwerde';
        faktorInfo = `TP2 (${(tp2Result.base / 100).toFixed(2).replace('.', ',')} €), max. Basis`;
      } else {
        // Ohne Streitwert: Basis verwenden
        amount = basis;
        schriftsatzLabel = 'Kostenbeschwerde (ohne SW)';
        faktorInfo = 'Basis (kein SW angegeben)';
      }
      break;
  }

  const trace = `RATG TP4 Strafsachen (${periodLabel})\n` +
    `Variante: ${varianteLabel}\n` +
    `Basis: ${(basis / 100).toFixed(2).replace('.', ',')} €${isPrivatbeteiligt ? ' (= 0,5× Abschn. I)' : ''}\n` +
    `Schriftsatz: ${schriftsatzLabel} (${faktorInfo})\n` +
    `Betrag: ${(amount / 100).toFixed(2).replace('.', ',')} €`;

  return {
    amount,
    label: `${varianteLabel} - ${schriftsatzLabel}`,
    trace,
    periodId: period.id
  };
}

/**
 * Berechnet die Verhandlungsentlohnung for TP4 Strafsachen.
 *
 * @param variante Art des Verfahrens
 * @param halbeStunden Anzahl der (angefangenen) halben Stunden
 * @param isZweiteInstanz true = Verhandlung 2. Instanz (Z 6), false = Hauptverhandlung (Z 5)
 * @param date Optional: Datum for historische Berechnung
 * @returns TP4Result mit Entlohnung und Trace
 */
export function getTP4Verhandlung(
  variante: TP4Variante,
  halbeStunden: number,
  isZweiteInstanz: boolean = false,
  date?: Date | string
): TP4Result {
  const period = date ? getTariffPeriod(date) : getCurrentPeriod();
  const periodLabel = period.bgbl;

  // Basiswert ermitteln
  let basis: number;
  let varianteLabel: string;
  const isPrivatbeteiligt = variante === 'PRIV_BG' || variante === 'PRIV_ANDERE';

  switch (variante) {
    case 'ANKLAGE_BG':
      basis = period.tp4.anklageBG;
      varianteLabel = 'Privatanklage BG';
      break;
    case 'ANKLAGE_ANDERE':
      basis = period.tp4.anklageAndere;
      varianteLabel = 'Privatanklage andere';
      break;
    case 'MEDIENGESETZ':
      basis = period.tp4.anklageAndere;
      varianteLabel = 'Mediengesetz';
      break;
    case 'PRIV_BG':
      // 0,5× Abschn. I, gerundet auf 10 Cent
      basis = Math.round(period.tp4.anklageBG / 2 / 10) * 10;
      varianteLabel = 'Privatbeteiligte BG';
      break;
    case 'PRIV_ANDERE':
      // 0,5× Abschn. I, gerundet auf 10 Cent
      basis = Math.round(period.tp4.anklageAndere / 2 / 10) * 10;
      varianteLabel = 'Privatbeteiligte andere';
      break;
  }

  // 1. Instanz (Z 5): 1. ½ Std = 1× Basis, weitere = 0,5× Basis
  // 2. Instanz (Z 6): 1. ½ Std = 1,5× Basis, weitere = 0,5× (1,5× Basis) = 0,75× Basis
  // "die Hälfte dieser Entlohnung" bezieht sich auf die 1. ½ Std!
  const ersteHalbeStunde = isZweiteInstanz ? Math.round(basis * 1.5 / 10) * 10 : basis;
  const weitereHalbeStunde = Math.round(ersteHalbeStunde / 2 / 10) * 10;

  let amount: number;
  if (halbeStunden <= 1) {
    amount = ersteHalbeStunde;
  } else {
    amount = ersteHalbeStunde + (halbeStunden - 1) * weitereHalbeStunde;
  }

  const verhandlungsTyp = isZweiteInstanz ? 'Verhandlung 2. Instanz (Z 6)' : 'Hauptverhandlung (Z 5)';

  const weitereFaktor = isZweiteInstanz ? '0,5× (1,5× Basis) = 0,75× Basis' : '0,5× Basis';
  const trace = `RATG TP4 ${verhandlungsTyp} (${periodLabel})\n` +
    `Variante: ${varianteLabel}\n` +
    `Basis: ${(basis / 100).toFixed(2).replace('.', ',')} €${isPrivatbeteiligt ? ' (= 0,5× Abschn. I)' : ''}\n` +
    `1. ½ Std: ${(ersteHalbeStunde / 100).toFixed(2).replace('.', ',')} € (${isZweiteInstanz ? '1,5×' : '1×'} Basis)\n` +
    `Weitere ½ Std: ${(weitereHalbeStunde / 100).toFixed(2).replace('.', ',')} € (${weitereFaktor})\n` +
    `Dauer: ${halbeStunden} × ½ Std\n` +
    `Gesamt: ${(amount / 100).toFixed(2).replace('.', ',')} €`;

  return {
    amount,
    label: `${varianteLabel} - ${verhandlungsTyp}`,
    trace,
    periodId: period.id
  };
}

/**
 * Berechnet die Wartezeit-Entschädigung for TP4 Strafsachen.
 * 1. halbe Stunde ist frei, danach Anm. 3 (BG) oder Anm. 4 (andere) pro weitere ½ Std.
 *
 * @param variante Art des Verfahrens
 * @param halbeStundenWartezeit Gesamte Wartezeit in halben Stunden (1. ist frei)
 * @param date Optional: Datum for historische Berechnung
 * @returns Wartezeit in Cents
 */
export function getTP4Wartezeit(
  variante: TP4Variante,
  halbeStundenWartezeit: number,
  date?: Date | string
): number {
  const period = date ? getTariffPeriod(date) : getCurrentPeriod();

  // 1. ½ Std ist frei
  const weitereHalbeStunden = Math.max(0, halbeStundenWartezeit - 1);

  // BG-Varianten: Anm. 3 (9,20 €), andere: Anm. 4 (17,90 €)
  const isBG = variante === 'ANKLAGE_BG' || variante === 'PRIV_BG';
  const proHalbeStunde = isBG ? period.tp4.wartezeitBG : period.tp4.wartezeitAndere;

  return proHalbeStunde * weitereHalbeStunden;
}

/**
 * Berechnet die Abberaumungs-Entschädigung for TP4 Strafsachen.
 *
 * @param variante Art des Verfahrens
 * @param date Optional: Datum for historische Berechnung
 * @returns Abberaumungs-Entschädigung in Cents
 */
export function getTP4Abberaumung(
  variante: TP4Variante,
  date?: Date | string
): number {
  const period = date ? getTariffPeriod(date) : getCurrentPeriod();

  // BG-Varianten: Anm. 4 (= wartezeitAndere), andere: Anm. 5
  const isBG = variante === 'ANKLAGE_BG' || variante === 'PRIV_BG';
  return isBG ? period.tp4.wartezeitAndere : period.tp4.abberaumungAndere;
}

// ============================================================================
// TP8 BESPRECHUNGEN
// ============================================================================
// RATG Anlage 1, Tarifpost 8
// Eigene Schwellenwerte und Steigerungslogik!
// TP8 Standard: pro halbe Stunde
// TP8 Kurzform: unter 10 Minuten = 40% von Standard, aufgerundet auf 10 Cent

export interface BesprechungResult {
  /** Entlohnung pro halbe Stunde in Cents */
  proHalbeStunde: number;
  /** Gesamtentlohnung in Cents */
  total: number;
  /** Detaillierte Berechnung */
  trace: string;
  /** Tarifperiode */
  periodId: string;
}

// TP8 Segment-Grenzen in Cents
const TP8_SEGMENTS = {
  SEGMENT1_START: 182000,   // 1.820 EUR
  SEGMENT1_END: 2067000,    // 20.670 EUR
  SEGMENT2_END: 2180000,    // 21.800 EUR
  STEP_INTERVAL: 145000,    // 1.450 EUR
};

/**
 * Berechnet die Besprechungsentlohnung (TP8).
 *
 * @param cents Bemessungsgrundlage (Streitwert) in Cents
 * @param halbeStunden Anzahl der (angefangenen) halben Stunden
 * @param date Optional: Datum for historische Berechnung
 * @returns BesprechungResult mit Entlohnung and Trace
 */
export function getBesprechung(
  cents: number,
  halbeStunden: number,
  date?: Date | string
): BesprechungResult {
  const period = date ? getTariffPeriod(date) : getCurrentPeriod();
  const periodLabel = period.bgbl;
  const tp8 = period.tp8;
  const bmglCents = Math.round(cents);

  let proHalb = 0;
  let trace = `RATG TP8 Besprechung (${periodLabel})\nStreitwert: ${(bmglCents / 100).toLocaleString('de-AT')} €\n`;

  // 1. Bracket-Bereich (bis 1.820 EUR)
  const thresholdsCents = tp8.thresholds.map(t => t * 100);
  let foundBracket = false;

  for (let i = 0; i < thresholdsCents.length; i++) {
    if (bmglCents <= thresholdsCents[i]) {
      proHalb = tp8.brackets[i];
      trace += `Bracket bis ${tp8.thresholds[i].toLocaleString('de-AT')} €: ${(proHalb / 100).toFixed(2).replace('.', ',')} €`;
      foundBracket = true;
      break;
    }
  }

  // 2. Steigerungsbereich (über 1.820 EUR)
  if (!foundBracket) {
    // Sockel = letzter Bracket (bis 1.820 EUR)
    proHalb = tp8.brackets[tp8.brackets.length - 1];
    trace += `Sockel (bis 1.820 €): ${(proHalb / 100).toFixed(2).replace('.', ',')} €`;

    // Segment 1: 1.820 bis 20.670 EUR
    if (bmglCents > TP8_SEGMENTS.SEGMENT1_START) {
      const excess = Math.min(bmglCents, TP8_SEGMENTS.SEGMENT1_END) - TP8_SEGMENTS.SEGMENT1_START;
      const steps = Math.ceil(excess / TP8_SEGMENTS.STEP_INTERVAL);
      const amount = steps * tp8.step1;
      proHalb += amount;
      trace += `\n1.820 → 20.670 €: ${steps} × ${(tp8.step1 / 100).toFixed(2).replace('.', ',')} € = ${(amount / 100).toFixed(2).replace('.', ',')} €`;
    }

    // Segment 2: 20.670 bis 21.800 EUR (ein zusätzlicher Schritt)
    if (bmglCents > TP8_SEGMENTS.SEGMENT1_END) {
      const excess = Math.min(bmglCents, TP8_SEGMENTS.SEGMENT2_END) - TP8_SEGMENTS.SEGMENT1_END;
      const steps = Math.ceil(excess / TP8_SEGMENTS.STEP_INTERVAL);
      const amount = steps * tp8.step2;
      proHalb += amount;
      trace += `\n20.670 → 21.800 €: ${steps} × ${(tp8.step2 / 100).toFixed(2).replace('.', ',')} € = ${(amount / 100).toFixed(2).replace('.', ',')} €`;
    }

    // Segment 3: über 21.800 EUR
    if (bmglCents > TP8_SEGMENTS.SEGMENT2_END) {
      const excess = bmglCents - TP8_SEGMENTS.SEGMENT2_END;
      const steps = Math.ceil(excess / TP8_SEGMENTS.STEP_INTERVAL);
      const amount = steps * tp8.step3;
      proHalb += amount;
      trace += `\nüber 21.800 €: ${steps} × ${(tp8.step3 / 100).toFixed(2).replace('.', ',')} € = ${(amount / 100).toFixed(2).replace('.', ',')} €`;
    }
  }

  // Maximum anwenden
  if (proHalb > tp8.max) {
    trace += `\n(Gekappt auf max ${(tp8.max / 100).toFixed(2).replace('.', ',')} €)`;
    proHalb = tp8.max;
  }

  const total = proHalb * halbeStunden;
  trace += `\nTP8 pro ½ Std: ${(proHalb / 100).toFixed(2).replace('.', ',')} €`;
  trace += `\nGesamt (${halbeStunden} × ½ Std): ${(total / 100).toFixed(2).replace('.', ',')} €`;

  return {
    proHalbeStunde: proHalb,
    total,
    trace,
    periodId: period.id
  };
}

/**
 * Berechnet die Kurzform-Besprechung (TP8, unter 10 Minuten).
 * = 40% von TP8 Standard, aufgerundet auf 10 Cent
 * Bei Standard-Maximum → Kurzform-Maximum
 *
 * @param cents Bemessungsgrundlage (Streitwert) in Cents
 * @param date Optional: Datum for historische Berechnung
 * @returns BesprechungResult mit Entlohnung und Trace
 */
export function getBesprechungKurz(
  cents: number,
  date?: Date | string
): BesprechungResult {
  const period = date ? getTariffPeriod(date) : getCurrentPeriod();
  const periodLabel = period.bgbl;

  // TP8 Standard berechnen
  const standard = getBesprechung(cents, 1, date);

  let final: number;
  let trace = `RATG TP8 Kurzform unter 10 Min (${periodLabel})\n`;
  trace += `Streitwert: ${(cents / 100).toLocaleString('de-AT')} €\n`;
  trace += `TP8 Standard: ${(standard.proHalbeStunde / 100).toFixed(2).replace('.', ',')} €\n`;

  // Wenn Standard-Maximum erreicht → Kurzform-Maximum
  if (standard.proHalbeStunde >= period.tp8.max) {
    final = period.tp8.maxKurz;
    trace += `Standard max erreicht → Kurzform max: ${(final / 100).toFixed(2).replace('.', ',')} €`;
  } else {
    // 40% berechnen und auf 10 Cent aufrunden
    const raw = standard.proHalbeStunde * 0.4;
    const aufgerundet = Math.ceil(raw / 10) * 10;
    final = Math.min(aufgerundet, period.tp8.maxKurz);

    trace += `40% davon: ${(raw / 100).toFixed(2).replace('.', ',')} €\n`;
    trace += `Aufgerundet: ${(aufgerundet / 100).toFixed(2).replace('.', ',')} €`;

    if (aufgerundet > period.tp8.maxKurz) {
      trace += `\n(Gekappt auf max ${(period.tp8.maxKurz / 100).toFixed(2).replace('.', ',')} €)`;
    }
  }

  return {
    proHalbeStunde: final,
    total: final,  // Kurzform ist immer 1x
    trace,
    periodId: period.id
  };
}

// ============================================================================
// GGG PAUSCHALGEBÜHREN - Gerichtsgebührengesetz
// ============================================================================
// Gesetzesreferenz: GGG Tarifpost 1 (BGBl. I Nr. 43/2024)
// RIS-Link: https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10002695

const GGG_CONFIG = {
  VERSION: "01.04.2025",

  // GGG TP 1 Schwellenwerte (EUR) - GGG Anlage, Tarifpost 1
  THRESHOLDS_EUR: [150, 300, 700, 2000, 3500, 7000, 35000, 70000, 140000, 210000, 280000, 350000],

  // GGG TP 1 Pauschalgebühren (Cents) - GGG Anlage, Tarifpost 1
  FEES_CENTS: [3100, 5900, 8400, 14000, 22400, 41200, 97400, 191400, 382900, 574600, 766100, 957600],

  // Basis über € 350.000 - GGG TP 1 Zeile 13
  BASE_ABOVE_350K: 696400,  // € 6.964,00

  // Prozentsatz über € 350.000 - GGG TP 1: 1,2%
  PERCENTAGE_ABOVE_350K: 0.012,
};

/**
 * Berechnet die GGG Pauschalgebühr (Tarifpost 1 Zivilprozess).
 */
export function getGGGResult(
  bmglCents: number,
  dateStr: string,
  partySurchargePercent: number = 0
): { amount: number; label: string; trace: string; version: string } {
  const version = GGG_CONFIG.VERSION;
  const bmglEUR = bmglCents / 100;

  let baseAmountCents = 0;
  let label = "";

  if (bmglEUR <= 350000) {
    for (let i = 0; i < GGG_CONFIG.THRESHOLDS_EUR.length; i++) {
      if (bmglEUR <= GGG_CONFIG.THRESHOLDS_EUR[i]) {
        baseAmountCents = GGG_CONFIG.FEES_CENTS[i];
        label = `bis ${GGG_CONFIG.THRESHOLDS_EUR[i].toLocaleString('de-AT')} €`;
        break;
      }
    }
  } else {
    const percentagePartCents = Math.round(bmglCents * GGG_CONFIG.PERCENTAGE_ABOVE_350K);
    baseAmountCents = GGG_CONFIG.BASE_ABOVE_350K + percentagePartCents;
    label = `über 350.000 €`;
  }

  const surchargeCents = Math.round((baseAmountCents * partySurchargePercent / 100) / 10) * 10;
  const total = baseAmountCents + surchargeCents;

  return {
    amount: total,
    label,
    trace: `GGG TP 1 (${label}, Stand ${version}): ${(baseAmountCents / 100).toFixed(2).replace('.', ',')} €\n` +
           `+ ${partySurchargePercent}% Streitgenossenzuschlag (§ 15 GGG): ${(surchargeCents / 100).toFixed(2).replace('.', ',')} €`,
    version
  };
}

// ============================================================================
// EINHEITSSATZ FUNKTION - § 23 RATG
// ============================================================================

/**
 * Ermittelt den Einheitssatz basierend auf der Bemessungsgrundlage.
 *
 * @param cents Bemessungsgrundlage in Cents
 * @returns Einheitssatz (0.6 bis € 10.170, sonst 0.5)
 */
export function getESRate(cents: number): number {
  return cents <= EINHEITSSATZ.THRESHOLD ? EINHEITSSATZ.RATE_LOW : EINHEITSSATZ.RATE_HIGH;
}

// ============================================================================
// EXPORTIERTE KONSTANTEN FÜR EXTERNE VERWENDUNG
// ============================================================================

export {
  RATG_CONFIG,
  THRESHOLDS_EUR,
  THRESHOLDS_CENTS,
  TP1_BRACKETS,
  TP2_BRACKETS,
  TP3A_BRACKETS,
  TP3B_BRACKETS,
  TP3C_BRACKETS,
  TARIFF_SPECS,
  ESCALATION,
  EINHEITSSATZ,
  ERV,
  GGG_CONFIG,
};

// Re-export History-Module for historische Berechnungen
export {
  getTariffPeriod,
  getCurrentPeriod,
  listPeriods,
  getSpecialTariff,
  TARIFF_PERIODS,
  SPECIAL_TARIFFS,
  PERIOD_2016,
  PERIOD_2023,
} from './tariffs-history';

export type { TariffPeriod, SpecialTariff } from './tariffs-history';
