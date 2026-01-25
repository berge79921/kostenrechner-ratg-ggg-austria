/**
 * GGG Gerichtsgebührengesetz - Pauschalgebühren
 * BGBl. II Nr. 51/2025 (ab 01.04.2025)
 *
 * GRENZWERTBEHANDLUNG (§ 32 GGG):
 * - "bis X €" bedeutet: Streitwert <= X (inklusive Grenzwert)
 * - "über X €" bedeutet: Streitwert > X (exklusive Grenzwert)
 * - Bei exakt X € gilt die niedrigere Stufe ("bis X €")
 *
 * RUNDUNG:
 * - Prozentberechnungen werden auf ganze Cent gerundet (kaufmännisch)
 * - Basis wird VOR Addition des Sockels gerundet
 *
 * VALIDIERUNG: 224 Tests gegen BGBl. II Nr. 51/2025 + O3-mini Review (APPROVED)
 */

// =============================================================================
// TYPES
// =============================================================================

export interface GGGResult {
  amount: number;       // Grundbetrag in Cents
  sgzAmount: number;    // Streitgenossenzuschlag in Cents
  total: number;        // Pauschalgebühr gesamt (amount + sgzAmount)
  label: string;        // Tarifstufe (z.B. "über 7.000 bis 35.000 €")
  trace: string;        // Berechnungs-Trace
  version: string;      // "01.04.2025"
}

export type GGGTarifpost =
  | 'TP1_ZI'         // Zivilverfahren 1. Instanz
  | 'TP2'            // Rechtsmittel 2. Instanz
  | 'TP3_LIT_A'      // Rechtsmittel 3. Instanz
  | 'TP3_LIT_B'      // OGH-Klagen § 615 ZPO
  | 'TP4_ZI_LIT_A'   // Exekutionsverfahren
  | 'TP4_ZII_LIT_A'  // Rekurse 2. Instanz (150% von Z I)
  | 'TP4_ZIII_LIT_A';// Revisionsrekurse 3. Instanz (200% von Z I)

export type GGGFixedTarifpost =
  | 'TP1_ZII'        // Dolmetscher (241 €)
  | 'TP3_ANM6'       // § 49 Abs. 2 Z 2a/2b JN (671 €)
  | 'TP4_ZI_LIT_B'   // Europ. Vollstreckungstitel (18 €)
  | 'TP4_ZII_LIT_B'  // Rekurse ohne BG (38 €)
  | 'TP4_ZIII_LIT_B';// Revisionsrekurse ohne BG (57 €)

export type GGGHalfTarifpost =
  | 'TP1_ZI_HALF'    // nach Anm. 2
  | 'TP2_HALF'       // nach Anm. 1a
  | 'TP3_LIT_A_HALF';// nach Anm. 1a

// =============================================================================
// CONSTANTS - BGBl. II Nr. 51/2025 (ab 01.04.2025)
// =============================================================================

const VERSION = "01.04.2025";

// Streitgenossenzuschlag § 19a GGG (identisch zu RATG § 15)
const SGZ_TABLE = [0, 10, 15, 20, 25, 30, 35, 40, 45, 50]; // %, Index = Anzahl SG (max 9+)

// TP 1 Z I - Zivilverfahren 1. Instanz
const TP1_ZI = {
  THRESHOLDS_EUR: [150, 300, 700, 2000, 3500, 7000, 35000, 70000, 140000, 210000, 280000, 350000],
  FEES_CENTS:     [3100, 5900, 8400, 14000, 22400, 41200, 97400, 191400, 382900, 574600, 766100, 957600],
  OVER_350K_BASE_CENTS: 696400,  // 6.964 €
  OVER_350K_PERCENTAGE: 0.012,   // 1,2%
};

// TP 2 - Rechtsmittel 2. Instanz
const TP2 = {
  THRESHOLDS_EUR: [150, 300, 700, 2000, 3500, 7000, 35000, 70000, 140000, 210000, 280000, 350000],
  FEES_CENTS:     [2500, 5400, 9200, 18900, 37400, 74900, 150000, 281500, 563400, 844900, 1126500, 1408300],
  OVER_350K_BASE_CENTS: 1010600, // 10.106 €
  OVER_350K_PERCENTAGE: 0.018,   // 1,8%
};

// TP 3 lit. a - Rechtsmittel 3. Instanz (andere Schwellenwerte!)
const TP3_LIT_A = {
  THRESHOLDS_EUR: [2000, 3500, 7000, 35000, 70000, 140000, 210000, 280000, 350000],
  FEES_CENTS:     [28100, 46900, 93800, 187800, 375400, 751000, 1126500, 1502400, 1877900],
  OVER_350K_BASE_CENTS: 1347700, // 13.477 €
  OVER_350K_PERCENTAGE: 0.024,   // 2,4%
};

// TP 3 lit. b - OGH § 615 ZPO (linearer Tarif)
const TP3_LIT_B = {
  PERCENTAGE: 0.05,      // 5% vom Streitwert
  MIN_CENTS: 723900,     // min 7.239 €
};

// TP 4 Z I lit. a - Exekutionsverfahren (andere Schwellenwerte!)
const TP4_ZI_LIT_A = {
  THRESHOLDS_EUR: [150, 300, 700, 2000, 3500, 7000, 35000, 70000],
  FEES_CENTS:     [3400, 6200, 7400, 9800, 12300, 18500, 24600, 36900],
  OVER_70K_BASE_CENTS: 36900,    // 369 €
  OVER_70K_PROMILLE: 2.7,        // 2,7‰
};

// Fixbeträge
const FIXED_FEES = {
  TP1_ZII: 24100,        // 241 € Dolmetscher
  TP3_ANM6: 67100,       // 671 € § 49 Abs. 2 Z 2a/2b JN
  TP4_ZI_LIT_B: 1800,    // 18 € Europ. Vollstreckungstitel
  TP4_ZII_LIT_B: 3800,   // 38 € Rekurse ohne BG
  TP4_ZIII_LIT_B: 5700,  // 57 € Revisionsrekurse ohne BG
};

// TP 4 Multiplikatoren
const TP4_MULTIPLIERS = {
  ZII: 1.5,  // 150% von Z I
  ZIII: 2.0, // 200% von Z I
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getSGZPercent(streitgenossen: number): number {
  return SGZ_TABLE[Math.min(Math.max(0, streitgenossen), 9)];
}

function formatLabel(thresholds: number[], index: number, bmglEUR: number): string {
  if (index === -1) {
    // Über höchster Schwelle
    const lastThreshold = thresholds[thresholds.length - 1];
    return `über ${lastThreshold.toLocaleString('de-AT')} €`;
  }
  if (index === 0) {
    return `bis ${thresholds[0].toLocaleString('de-AT')} €`;
  }
  return `über ${thresholds[index - 1].toLocaleString('de-AT')} bis ${thresholds[index].toLocaleString('de-AT')} €`;
}

function findBracketIndex(thresholds: number[], bmglEUR: number): number {
  for (let i = 0; i < thresholds.length; i++) {
    if (bmglEUR <= thresholds[i]) {
      return i;
    }
  }
  return -1; // Über höchster Schwelle
}

// =============================================================================
// MAIN FUNCTIONS
// =============================================================================

/**
 * Berechnet GGG Pauschalgebühr für streitwertabhängige Tarifposten.
 */
export function getGGG(
  tarifpost: GGGTarifpost,
  bmglCents: number,
  streitgenossen: number = 0
): GGGResult {
  if (bmglCents < 0) {
    throw new Error(`Ungültige Bemessungsgrundlage: ${bmglCents}`);
  }

  const bmglEUR = bmglCents / 100;
  let amount = 0;
  let label = "";
  let trace = "";

  switch (tarifpost) {
    case 'TP1_ZI': {
      const idx = findBracketIndex(TP1_ZI.THRESHOLDS_EUR, bmglEUR);
      if (idx >= 0) {
        amount = TP1_ZI.FEES_CENTS[idx];
        label = formatLabel(TP1_ZI.THRESHOLDS_EUR, idx, bmglEUR);
      } else {
        // Über 350.000 €: 1,2% + 6.964 €
        amount = Math.round(bmglCents * TP1_ZI.OVER_350K_PERCENTAGE) + TP1_ZI.OVER_350K_BASE_CENTS;
        label = formatLabel(TP1_ZI.THRESHOLDS_EUR, -1, bmglEUR);
        trace = `1,2% × ${bmglEUR.toLocaleString('de-AT')} € + 6.964 €`;
      }
      break;
    }

    case 'TP2': {
      const idx = findBracketIndex(TP2.THRESHOLDS_EUR, bmglEUR);
      if (idx >= 0) {
        amount = TP2.FEES_CENTS[idx];
        label = formatLabel(TP2.THRESHOLDS_EUR, idx, bmglEUR);
      } else {
        // Über 350.000 €: 1,8% + 10.106 €
        amount = Math.round(bmglCents * TP2.OVER_350K_PERCENTAGE) + TP2.OVER_350K_BASE_CENTS;
        label = formatLabel(TP2.THRESHOLDS_EUR, -1, bmglEUR);
        trace = `1,8% × ${bmglEUR.toLocaleString('de-AT')} € + 10.106 €`;
      }
      break;
    }

    case 'TP3_LIT_A': {
      const idx = findBracketIndex(TP3_LIT_A.THRESHOLDS_EUR, bmglEUR);
      if (idx >= 0) {
        amount = TP3_LIT_A.FEES_CENTS[idx];
        label = formatLabel(TP3_LIT_A.THRESHOLDS_EUR, idx, bmglEUR);
      } else {
        // Über 350.000 €: 2,4% + 13.477 €
        amount = Math.round(bmglCents * TP3_LIT_A.OVER_350K_PERCENTAGE) + TP3_LIT_A.OVER_350K_BASE_CENTS;
        label = formatLabel(TP3_LIT_A.THRESHOLDS_EUR, -1, bmglEUR);
        trace = `2,4% × ${bmglEUR.toLocaleString('de-AT')} € + 13.477 €`;
      }
      break;
    }

    case 'TP3_LIT_B': {
      // 5% vom Streitwert, mindestens 7.239 €
      const calculated = Math.round(bmglCents * TP3_LIT_B.PERCENTAGE);
      amount = Math.max(calculated, TP3_LIT_B.MIN_CENTS);
      label = `5% vom Streitwert${calculated < TP3_LIT_B.MIN_CENTS ? ' (Mindestgebühr)' : ''}`;
      trace = `5% × ${bmglEUR.toLocaleString('de-AT')} € = ${(calculated / 100).toLocaleString('de-AT')} €`;
      if (calculated < TP3_LIT_B.MIN_CENTS) {
        trace += ` → Mindestgebühr 7.239 €`;
      }
      break;
    }

    case 'TP4_ZI_LIT_A': {
      const idx = findBracketIndex(TP4_ZI_LIT_A.THRESHOLDS_EUR, bmglEUR);
      if (idx >= 0) {
        amount = TP4_ZI_LIT_A.FEES_CENTS[idx];
        label = formatLabel(TP4_ZI_LIT_A.THRESHOLDS_EUR, idx, bmglEUR);
      } else {
        // Über 70.000 €: 369 € + 2,7‰ vom Mehrbetrag
        const mehrbetragCents = bmglCents - 7000000; // 70.000 € in Cents
        const promillePartCents = Math.round(mehrbetragCents * TP4_ZI_LIT_A.OVER_70K_PROMILLE / 1000);
        amount = TP4_ZI_LIT_A.OVER_70K_BASE_CENTS + promillePartCents;
        label = `über 70.000 €`;
        trace = `369 € + 2,7‰ × ${(mehrbetragCents / 100).toLocaleString('de-AT')} €`;
      }
      break;
    }

    case 'TP4_ZII_LIT_A': {
      // 150% von TP4 Z I lit. a
      const baseResult = getGGG('TP4_ZI_LIT_A', bmglCents, 0);
      amount = Math.round(baseResult.amount * TP4_MULTIPLIERS.ZII);
      label = baseResult.label + ' (150%)';
      trace = `150% × ${(baseResult.amount / 100).toLocaleString('de-AT')} €`;
      break;
    }

    case 'TP4_ZIII_LIT_A': {
      // 200% von TP4 Z I lit. a
      const baseResult = getGGG('TP4_ZI_LIT_A', bmglCents, 0);
      amount = Math.round(baseResult.amount * TP4_MULTIPLIERS.ZIII);
      label = baseResult.label + ' (200%)';
      trace = `200% × ${(baseResult.amount / 100).toLocaleString('de-AT')} €`;
      break;
    }

    default:
      throw new Error(`Unbekannter Tarifpost: ${tarifpost}`);
  }

  // SGZ berechnen
  const sgzPercent = getSGZPercent(streitgenossen);
  const sgzAmount = Math.round(amount * sgzPercent / 100);
  const total = amount + sgzAmount;

  // Trace erweitern (einheitliches Format)
  const baseTrace = trace || `${tarifpost}: ${(amount / 100).toLocaleString('de-AT')} € (${label})`;
  const fullTrace = sgzPercent > 0
    ? `${baseTrace}\n+ SGZ ${sgzPercent}% (${streitgenossen} Streitgenossen): ${(sgzAmount / 100).toLocaleString('de-AT')} €\n= Gesamt: ${(total / 100).toLocaleString('de-AT')} €`
    : baseTrace;

  return {
    amount,
    sgzAmount,
    total,
    label,
    trace: fullTrace,
    version: VERSION,
  };
}

/**
 * Berechnet GGG Fixbetrag (ohne Bemessungsgrundlage).
 */
export function getGGGFixed(
  tarifpost: GGGFixedTarifpost,
  streitgenossen: number = 0
): GGGResult {
  let amount: number;
  let label: string;

  switch (tarifpost) {
    case 'TP1_ZII':
      amount = FIXED_FEES.TP1_ZII;
      label = 'Dolmetscher (fix)';
      break;
    case 'TP3_ANM6':
      amount = FIXED_FEES.TP3_ANM6;
      label = '§ 49 Abs. 2 Z 2a/2b JN (fix)';
      break;
    case 'TP4_ZI_LIT_B':
      amount = FIXED_FEES.TP4_ZI_LIT_B;
      label = 'Europ. Vollstreckungstitel (fix)';
      break;
    case 'TP4_ZII_LIT_B':
      amount = FIXED_FEES.TP4_ZII_LIT_B;
      label = 'Rekurse ohne BG (fix)';
      break;
    case 'TP4_ZIII_LIT_B':
      amount = FIXED_FEES.TP4_ZIII_LIT_B;
      label = 'Revisionsrekurse ohne BG (fix)';
      break;
    default:
      throw new Error(`Unbekannter fixer Tarifpost: ${tarifpost}`);
  }

  // SGZ berechnen
  const sgzPercent = getSGZPercent(streitgenossen);
  const sgzAmount = Math.round(amount * sgzPercent / 100);
  const total = amount + sgzAmount;

  const trace = sgzPercent > 0
    ? `${tarifpost}: ${(amount / 100).toLocaleString('de-AT')} € (${label})\n+ SGZ ${sgzPercent}% (${streitgenossen} Streitgenossen): ${(sgzAmount / 100).toLocaleString('de-AT')} €\n= Gesamt: ${(total / 100).toLocaleString('de-AT')} €`
    : `${tarifpost}: ${(amount / 100).toLocaleString('de-AT')} € (${label})`;

  return {
    amount,
    sgzAmount,
    total,
    label,
    trace,
    version: VERSION,
  };
}

/**
 * Berechnet Hälfte-Variante (nach Anmerkung 1a/2).
 */
export function getGGGHalf(
  tarifpost: GGGHalfTarifpost,
  bmglCents: number,
  streitgenossen: number = 0
): GGGResult {
  let baseTarifpost: GGGTarifpost;
  let halfLabel: string;

  switch (tarifpost) {
    case 'TP1_ZI_HALF':
      baseTarifpost = 'TP1_ZI';
      halfLabel = 'nach Anm. 2';
      break;
    case 'TP2_HALF':
      baseTarifpost = 'TP2';
      halfLabel = 'nach Anm. 1a';
      break;
    case 'TP3_LIT_A_HALF':
      baseTarifpost = 'TP3_LIT_A';
      halfLabel = 'nach Anm. 1a';
      break;
    default:
      throw new Error(`Unbekannter Hälfte-Tarifpost: ${tarifpost}`);
  }

  // Basis berechnen (ohne SGZ)
  const baseResult = getGGG(baseTarifpost, bmglCents, 0);
  const halfAmount = Math.round(baseResult.amount / 2);

  // SGZ auf Hälfte berechnen
  const sgzPercent = getSGZPercent(streitgenossen);
  const sgzAmount = Math.round(halfAmount * sgzPercent / 100);
  const total = halfAmount + sgzAmount;

  const trace = sgzPercent > 0
    ? `${tarifpost}: ${(baseResult.amount / 100).toLocaleString('de-AT')} € ÷ 2 = ${(halfAmount / 100).toLocaleString('de-AT')} € (${halfLabel})\n+ SGZ ${sgzPercent}% (${streitgenossen} Streitgenossen): ${(sgzAmount / 100).toLocaleString('de-AT')} €\n= Gesamt: ${(total / 100).toLocaleString('de-AT')} €`
    : `${tarifpost}: ${(baseResult.amount / 100).toLocaleString('de-AT')} € ÷ 2 = ${(halfAmount / 100).toLocaleString('de-AT')} € (${halfLabel})`;

  return {
    amount: halfAmount,
    sgzAmount,
    total,
    label: `${baseResult.label} (Hälfte ${halfLabel})`,
    trace,
    version: VERSION,
  };
}

// =============================================================================
// EXPORTS FOR TESTING
// =============================================================================

export const GGG_CONFIG = {
  VERSION,
  TP1_ZI,
  TP2,
  TP3_LIT_A,
  TP3_LIT_B,
  TP4_ZI_LIT_A,
  FIXED_FEES,
  TP4_MULTIPLIERS,
  SGZ_TABLE,
};
