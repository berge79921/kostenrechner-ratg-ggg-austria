/**
 * ============================================================================
 * RATG Leistungspaket-Berechnung
 * ============================================================================
 *
 * Universelle Berechnungsfunktion für alle Tarifposten mit:
 * - Streitgenossenzuschlag (§ 15 RATG)
 * - Einheitssatz (§ 23 RATG)
 * - ERV-Zuschlag (§ 23a RATG)
 * - Umsatzsteuer (20%)
 *
 * ============================================================================
 */

import { getTariffBase, getESRate, getTariffPeriod, getCurrentPeriod, getTP4Verhandlung, getTP4Wartezeit, getTP4, getTagsatzung, type TagsatzungType } from './tariffs';
import type { TariffPeriod } from './tariffs-history';
import type { TP4Variante, TP4Schriftsatz } from './tariffs';

// ============================================================================
// TYPEN
// ============================================================================

/** Einheitssatz-Optionen */
export type EinheitssatzOption = 'keiner' | 'einfach' | 'doppelt';

/** ERV-Eingabe-Optionen */
export type ERVOption = 'nein' | 'erst' | 'folge';

/** Streitgenossen-Anzahl (0 = keine, 1-8, 9 = 9 oder mehr) */
export type StreitgenossenAnzahl = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** Tarifpost-Typen für Schriftsätze */
export type SchriftsatzType = 'TP1' | 'TP2' | 'TP3A' | 'TP3B' | 'TP3C' | 'TP4' | 'TP5' | 'TP6';

/** Eingabe-Parameter für Leistungspaket */
export interface LeistungspaketInput {
  /** Streitwert in Cents */
  streitwertCents: number;
  /** Tarifpost */
  tarifpost: SchriftsatzType;
  /** Streitgenossen-Anzahl (0-9) */
  streitgenossen: StreitgenossenAnzahl;
  /** Einheitssatz-Option */
  einheitssatz: EinheitssatzOption;
  /** ERV-Eingabe */
  erv: ERVOption;
  /** Umsatzsteuer aktiv? */
  ustAktiv: boolean;
  /** Verbandsklage auf Abhilfe? (für TP3A/B/C Deckel) */
  verbandsklage?: boolean;
  /** Datum für historische Berechnung */
  date?: Date | string;
}

/** Ergebnis-Zeile */
export interface ErgebnisZeile {
  label: string;
  betragCents: number;
}

/** Ergebnis des Leistungspakets */
export interface LeistungspaketErgebnis {
  /** Tarifstufe-Beschreibung */
  tarifstufe: string;
  /** Periode (BGBl) */
  periode: string;
  /** Einzelne Positionen */
  positionen: ErgebnisZeile[];
  /** Entlohnung (Basis) */
  entlohnungCents: number;
  /** Einheitssatz-Betrag */
  einheitssatzCents: number;
  /** Einheitssatz-Prozent (0, 50, 60, 100, 120) */
  einheitssatzProzent: number;
  /** ERV-Zuschlag */
  ervCents: number;
  /** Streitgenossenzuschlag */
  streitgenossenzuschlagCents: number;
  /** Streitgenossenzuschlag-Prozent */
  streitgenossenzuschlagProzent: number;
  /** Summe netto */
  nettoSummeCents: number;
  /** USt-Betrag */
  ustCents: number;
  /** USt-Satz (0 oder 20) */
  ustSatz: number;
  /** Summe brutto */
  bruttoSummeCents: number;
  /** Berechnungs-Trace */
  trace: string;
}

// ============================================================================
// KONSTANTEN
// ============================================================================

/** Streitgenossenzuschlag-Prozentsätze gemäß § 15 RATG */
export const STREITGENOSSEN_ZUSCHLAG: Record<StreitgenossenAnzahl, number> = {
  0: 0,    // keine
  1: 10,   // 1 weiterer
  2: 15,   // 2 weitere
  3: 20,   // 3 weitere
  4: 25,   // 4 weitere
  5: 30,   // 5 weitere
  6: 35,   // 6 weitere
  7: 40,   // 7 weitere
  8: 45,   // 8 weitere
  9: 50,   // 9 oder mehr
};

/** ERV-Beträge gemäß § 23a RATG (in Cents) */
export const ERV_BETRAEGE = {
  erst: 500,   // 5,00 € - erster Schriftsatz
  folge: 260,  // 2,60 € - weitere Schriftsätze
  nein: 0,
} as const;

/** Tarifposten mit ERV-Zuschlag */
export const TARIFPOSTEN_MIT_ERV: SchriftsatzType[] = ['TP1', 'TP2', 'TP3A', 'TP3B', 'TP3C', 'TP4'];

/** Tarifposten mit Einheitssatz */
export const TARIFPOSTEN_MIT_ES: SchriftsatzType[] = ['TP1', 'TP2', 'TP3A', 'TP3B', 'TP3C', 'TP4'];

/** Tarifposten mit nur einfachem ES (Strafsachen) */
export const TARIFPOSTEN_NUR_EINFACH_ES: SchriftsatzType[] = ['TP4'];

/**
 * TP4 Bemessungsgrundlagen je Variante (§ 10 RATG)
 * Diese bestimmen die ES-Rate:
 * - ≤ 10.170 € → ES 60%/120%
 * - > 10.170 € → ES 50%/100%
 */
const TP4_BEMESSUNGSGRUNDLAGE_CENTS = 1100000; // Fallback: 11.000 € für generische Funktion

const TP4_BEMESSUNGSGRUNDLAGEN: Record<string, number> = {
  // Abschnitt I: Privatanklage / Mediengesetz
  'ANKLAGE_BG': 600000,       // 6.000 € → ES 60%
  'ANKLAGE_ANDERE': 1100000,  // 11.000 € → ES 50%
  'MEDIENGESETZ': 1100000,    // 11.000 € → ES 50%
  // Abschnitt II: Privatbeteiligte
  'PRIV_BG': 300000,          // 3.000 € → ES 60%
  'PRIV_ANDERE': 600000,      // 6.000 € → ES 60%
};

/**
 * Ermittelt die gesetzliche Bemessungsgrundlage für eine TP4-Variante.
 */
function getTP4Bemessungsgrundlage(variante: string): number {
  return TP4_BEMESSUNGSGRUNDLAGEN[variante] || 600000; // Fallback: 6.000 €
}

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

/**
 * Ermittelt den Einheitssatz-Prozentsatz basierend auf Streitwert und Option.
 *
 * ES-Rate gemäß § 23 RATG:
 * - Streitwert ≤ 10.170 € → 60% (einfach) / 120% (doppelt)
 * - Streitwert > 10.170 € → 50% (einfach) / 100% (doppelt)
 *
 * Bei TP4 Strafsachen: Bemessungsgrundlage 11.000 € → immer 50%, nur einfach!
 */
export function getEinheitssatzProzent(
  streitwertCents: number,
  option: EinheitssatzOption,
  tarifpost: SchriftsatzType
): number {
  if (option === 'keiner') return 0;

  // TP4: Nur einfacher ES möglich (§ 23 Abs 9 RATG)
  // Bemessungsgrundlage 11.000 € (> 10.170) → ES-Rate = 50%
  if (TARIFPOSTEN_NUR_EINFACH_ES.includes(tarifpost)) {
    // Immer 50% bei TP4, unabhängig vom Streitwert und option
    return getESRate(TP4_BEMESSUNGSGRUNDLAGE_CENTS) * 100; // = 50%
  }

  // TP5, TP6: Kein ES
  if (!TARIFPOSTEN_MIT_ES.includes(tarifpost)) {
    return 0;
  }

  // TP1, TP2, TP3A, TP3B, TP3C: ES basierend auf Streitwert
  const basisRate = getESRate(streitwertCents); // 0.6 (≤10.170) oder 0.5 (>10.170)
  const faktor = option === 'doppelt' ? 2 : 1;
  return basisRate * 100 * faktor; // 60/120% oder 50/100%
}

/**
 * Formatiert einen Cent-Betrag als Euro-String.
 */
export function formatEuro(cents: number): string {
  return (cents / 100).toLocaleString('de-AT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).replace('.', ',') + ' €';
}

/**
 * Formatiert einen Cent-Betrag als Euro-String ohne Währungssymbol.
 */
export function formatEuroValue(cents: number): string {
  return (cents / 100).toLocaleString('de-AT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).replace('.', ',');
}

// ============================================================================
// HAUPTFUNKTION
// ============================================================================

/**
 * Berechnet ein vollständiges Leistungspaket.
 */
export function calculateLeistungspaket(input: LeistungspaketInput): LeistungspaketErgebnis {
  const {
    streitwertCents,
    tarifpost,
    streitgenossen,
    einheitssatz,
    erv,
    ustAktiv,
    verbandsklage = false,
    date,
  } = input;

  const period = date ? getTariffPeriod(date) : getCurrentPeriod();
  const positionen: ErgebnisZeile[] = [];
  let trace = `RATG Leistungspaket (${period.bgbl})\n`;
  trace += `Tarifpost: ${tarifpost}\n`;
  trace += `Streitwert: ${formatEuro(streitwertCents)}\n\n`;

  // 1. Entlohnung (Basis)
  let entlohnungCents: number;
  let tarifstufe: string;

  if (tarifpost === 'TP4') {
    // TP4 ist fix, nicht streitwertabhängig
    // Hier müsste getTP4() aufgerufen werden - für jetzt Platzhalter
    const tp4Result = getTariffBase(streitwertCents, 'TP2', date); // Fallback
    entlohnungCents = tp4Result.base;
    tarifstufe = 'Fixbetrag';
  } else if (tarifpost === 'TP5' || tarifpost === 'TP6') {
    const result = getTariffBase(streitwertCents, tarifpost, date);
    entlohnungCents = result.base;
    tarifstufe = result.label;
  } else {
    const result = getTariffBase(streitwertCents, tarifpost, date);
    entlohnungCents = result.base;
    tarifstufe = result.label;

    // Verbandsklage-Deckel
    if (verbandsklage) {
      const caps: Record<string, number> = {
        'TP3A': 212370,  // 2.123,70 €
        'TP3B': 265150,  // 2.651,50 €
        'TP3C': 318260,  // 3.182,60 €
      };
      if (caps[tarifpost] && entlohnungCents > caps[tarifpost]) {
        entlohnungCents = caps[tarifpost];
        tarifstufe += ' (VK-Deckel)';
      }
    }
  }

  positionen.push({ label: 'Entlohnung', betragCents: entlohnungCents });
  trace += `Entlohnung: ${formatEuro(entlohnungCents)}\n`;

  // 2. Einheitssatz
  const esProzent = getEinheitssatzProzent(streitwertCents, einheitssatz, tarifpost);
  const esCents = Math.round(entlohnungCents * esProzent / 100);

  if (esCents > 0) {
    positionen.push({ label: `Einheitssatz ${esProzent}%`, betragCents: esCents });
    trace += `Einheitssatz ${esProzent}%: ${formatEuro(esCents)}\n`;
  }

  // Zwischensumme für Streitgenossenzuschlag
  const basisFuerSgz = entlohnungCents + esCents;

  // 3. Streitgenossenzuschlag (§ 15 RATG)
  const sgzProzent = STREITGENOSSEN_ZUSCHLAG[streitgenossen];
  const sgzCents = Math.round(basisFuerSgz * sgzProzent / 100);

  if (sgzCents > 0) {
    positionen.push({ label: `Streitgenossenzuschlag ${sgzProzent}%`, betragCents: sgzCents });
    trace += `Streitgenossenzuschlag ${sgzProzent}%: ${formatEuro(sgzCents)}\n`;
  }

  // 4. ERV-Zuschlag (§ 23a RATG)
  let ervCents = 0;
  if (TARIFPOSTEN_MIT_ERV.includes(tarifpost) && erv !== 'nein') {
    ervCents = ERV_BETRAEGE[erv];
    positionen.push({
      label: `Erhöhungsbetrag für ERV`,
      betragCents: ervCents
    });
    trace += `ERV-Zuschlag (${erv === 'erst' ? 'Erst' : 'Folge'}): ${formatEuro(ervCents)}\n`;
  }

  // 5. Summe netto
  const nettoSummeCents = entlohnungCents + esCents + sgzCents + ervCents;
  trace += `\nSumme netto: ${formatEuro(nettoSummeCents)}\n`;

  // 6. Umsatzsteuer
  const ustSatz = ustAktiv ? 20 : 0;
  const ustCents = ustAktiv ? Math.round(nettoSummeCents * 0.20) : 0;

  if (ustCents > 0) {
    positionen.push({ label: `${ustSatz}% USt.`, betragCents: ustCents });
    trace += `${ustSatz}% USt.: ${formatEuro(ustCents)}\n`;
  }

  // 7. Summe brutto
  const bruttoSummeCents = nettoSummeCents + ustCents;
  trace += `\nSumme brutto: ${formatEuro(bruttoSummeCents)}`;

  return {
    tarifstufe,
    periode: period.bgbl,
    positionen,
    entlohnungCents,
    einheitssatzCents: esCents,
    einheitssatzProzent: esProzent,
    ervCents,
    streitgenossenzuschlagCents: sgzCents,
    streitgenossenzuschlagProzent: sgzProzent,
    nettoSummeCents,
    ustCents,
    ustSatz,
    bruttoSummeCents,
    trace,
  };
}

// ============================================================================
// DROPDOWN-OPTIONEN FÜR UI
// ============================================================================

/** Streitgenossen-Dropdown-Optionen */
export const STREITGENOSSEN_OPTIONS = [
  { value: 0 as StreitgenossenAnzahl, label: 'keine' },
  { value: 1 as StreitgenossenAnzahl, label: '1 (10%)' },
  { value: 2 as StreitgenossenAnzahl, label: '2 (15%)' },
  { value: 3 as StreitgenossenAnzahl, label: '3 (20%)' },
  { value: 4 as StreitgenossenAnzahl, label: '4 (25%)' },
  { value: 5 as StreitgenossenAnzahl, label: '5 (30%)' },
  { value: 6 as StreitgenossenAnzahl, label: '6 (35%)' },
  { value: 7 as StreitgenossenAnzahl, label: '7 (40%)' },
  { value: 8 as StreitgenossenAnzahl, label: '8 (45%)' },
  { value: 9 as StreitgenossenAnzahl, label: '9+ (50%)' },
] as const;

/** Einheitssatz-Dropdown-Optionen */
export const EINHEITSSATZ_OPTIONS = [
  { value: 'keiner' as EinheitssatzOption, label: 'keiner' },
  { value: 'einfach' as EinheitssatzOption, label: 'einfach' },
  { value: 'doppelt' as EinheitssatzOption, label: 'doppelt' },
] as const;

/** ERV-Dropdown-Optionen */
export const ERV_OPTIONS = [
  { value: 'nein' as ERVOption, label: 'nein' },
  { value: 'erst' as ERVOption, label: 'Erst' },
  { value: 'folge' as ERVOption, label: 'Folge' },
] as const;

// ============================================================================
// TP4 VERHANDLUNG LEISTUNGSPAKET
// ============================================================================
// TP4 Strafsachen: Bemessungsgrundlage VARIANTEN-ABHÄNGIG!
// - PRIV_ANDERE: 6.000 € → ES 60%/120%
// - ANKLAGE_ANDERE: 11.000 € → ES 50%/100%
// ES angewendet auf Entlohnung + Wartezeit

/** TP4 Verhandlung Eingabe-Parameter */
export interface TP4VerhandlungInput {
  /** TP4-Variante */
  variante: TP4Variante;
  /** Dauer in halben Stunden */
  halbeStundenDauer: number;
  /** Wartezeit in halben Stunden (1. ist frei) */
  halbeStundenWartezeit: number;
  /** 2. Instanz? (sonst 1. Instanz) */
  isZweiteInstanz?: boolean;
  /** Streitgenossen-Anzahl (0-9) */
  streitgenossen: StreitgenossenAnzahl;
  /** Einheitssatz-Option */
  einheitssatz: EinheitssatzOption;
  /** Umsatzsteuer aktiv? */
  ustAktiv: boolean;
  /** Datum für historische Berechnung */
  date?: Date | string;
}

/** TP4 Verhandlung Ergebnis */
export interface TP4VerhandlungErgebnis {
  /** Periode (BGBl) */
  periode: string;
  /** Einzelne Positionen */
  positionen: ErgebnisZeile[];
  /** Entlohnung (Verhandlung) */
  entlohnungCents: number;
  /** Wartezeit */
  wartezeitCents: number;
  /** Basis für ES (Entlohnung + Wartezeit) */
  basisFuerESCents: number;
  /** Einheitssatz-Betrag */
  einheitssatzCents: number;
  /** Einheitssatz-Prozent (0, 60, 120) */
  einheitssatzProzent: number;
  /** Streitgenossenzuschlag */
  streitgenossenzuschlagCents: number;
  /** Streitgenossenzuschlag-Prozent */
  streitgenossenzuschlagProzent: number;
  /** Summe netto */
  nettoSummeCents: number;
  /** USt-Betrag */
  ustCents: number;
  /** USt-Satz (0 oder 20) */
  ustSatz: number;
  /** Summe brutto */
  bruttoSummeCents: number;
  /** Berechnungs-Trace */
  trace: string;
}

/**
 * Berechnet ein TP4 Verhandlungs-Leistungspaket.
 *
 * WICHTIG: Bemessungsgrundlage ist VARIANTEN-ABHÄNGIG!
 * - PRIV_ANDERE: 6.000 € → ES 60% (einfach) / 120% (doppelt)
 * - ANKLAGE_ANDERE: 11.000 € → ES 50% (einfach) / 100% (doppelt)
 * ES wird auf (Entlohnung + Wartezeit) angewendet.
 */
export function calculateTP4VerhandlungPaket(input: TP4VerhandlungInput): TP4VerhandlungErgebnis {
  const {
    variante,
    halbeStundenDauer,
    halbeStundenWartezeit,
    isZweiteInstanz = false,
    streitgenossen,
    einheitssatz,
    ustAktiv,
    date,
  } = input;

  const period = date ? getTariffPeriod(date) : getCurrentPeriod();
  const positionen: ErgebnisZeile[] = [];
  let trace = `RATG TP4 Verhandlung Leistungspaket (${period.bgbl})\n`;
  trace += `Variante: ${variante}\n`;
  trace += `Instanz: ${isZweiteInstanz ? '2. Instanz' : '1. Instanz'}\n\n`;

  // 1. Entlohnung (Verhandlung)
  const vhResult = getTP4Verhandlung(variante, halbeStundenDauer, isZweiteInstanz, date);
  const entlohnungCents = vhResult.amount;
  positionen.push({ label: `Entlohnung (${halbeStundenDauer} ½ Std)`, betragCents: entlohnungCents });
  trace += `Entlohnung: ${formatEuro(entlohnungCents)}\n`;

  // 2. Wartezeit (1. ½ Std frei)
  const wartezeitCents = getTP4Wartezeit(variante, halbeStundenWartezeit, date);
  if (wartezeitCents > 0) {
    positionen.push({ label: `Wartezeit (${halbeStundenWartezeit} ½ Std, 1. frei)`, betragCents: wartezeitCents });
    trace += `Wartezeit: ${formatEuro(wartezeitCents)}\n`;
  }

  // 3. Basis für Einheitssatz = Entlohnung + Wartezeit
  const basisFuerESCents = entlohnungCents + wartezeitCents;
  trace += `\nBasis für ES (Entlohnung + Wartezeit): ${formatEuro(basisFuerESCents)}\n`;

  // 4. Einheitssatz - basierend auf varianten-spezifischer Bemessungsgrundlage!
  // PRIV_ANDERE: 6.000 € → ES 60%/120%
  // ANKLAGE_ANDERE: 11.000 € → ES 50%/100%
  const bemessungsgrundlage = getTP4Bemessungsgrundlage(variante);
  const basisRate = getESRate(bemessungsgrundlage);

  let esProzent: number;
  if (einheitssatz === 'keiner') {
    esProzent = 0;
  } else {
    const faktor = einheitssatz === 'doppelt' ? 2 : 1;
    esProzent = basisRate * 100 * faktor;
  }

  const esCents = Math.round(basisFuerESCents * esProzent / 100);
  if (esCents > 0) {
    positionen.push({ label: `Einheitssatz ${esProzent}%`, betragCents: esCents });
    trace += `Einheitssatz ${esProzent}%: ${formatEuro(esCents)}\n`;
    trace += `  (Bemessungsgrundlage ${variante}: ${formatEuro(bemessungsgrundlage)} → ES-Rate ${basisRate * 100}%)\n`;
  }

  // 5. Streitgenossenzuschlag (§ 15 RATG)
  // SGZ auf (Entlohnung + Wartezeit + ES)
  const basisFuerSGZ = basisFuerESCents + esCents;
  const sgzProzent = STREITGENOSSEN_ZUSCHLAG[streitgenossen];
  const sgzCents = Math.round(basisFuerSGZ * sgzProzent / 100);

  if (sgzCents > 0) {
    positionen.push({ label: `Streitgenossenzuschlag ${sgzProzent}%`, betragCents: sgzCents });
    trace += `Streitgenossenzuschlag ${sgzProzent}%: ${formatEuro(sgzCents)}\n`;
  }

  // 6. Summe netto
  const nettoSummeCents = basisFuerESCents + esCents + sgzCents;
  trace += `\nSumme netto: ${formatEuro(nettoSummeCents)}\n`;

  // 7. Umsatzsteuer
  const ustSatz = ustAktiv ? 20 : 0;
  const ustCents = ustAktiv ? Math.round(nettoSummeCents * 0.20) : 0;

  if (ustCents > 0) {
    positionen.push({ label: `${ustSatz}% USt.`, betragCents: ustCents });
    trace += `${ustSatz}% USt.: ${formatEuro(ustCents)}\n`;
  }

  // 8. Summe brutto
  const bruttoSummeCents = nettoSummeCents + ustCents;
  trace += `\nSumme brutto: ${formatEuro(bruttoSummeCents)}`;

  return {
    periode: period.bgbl,
    positionen,
    entlohnungCents,
    wartezeitCents,
    basisFuerESCents,
    einheitssatzCents: esCents,
    einheitssatzProzent: esProzent,
    streitgenossenzuschlagCents: sgzCents,
    streitgenossenzuschlagProzent: sgzProzent,
    nettoSummeCents,
    ustCents,
    ustSatz,
    bruttoSummeCents,
    trace,
  };
}

// ============================================================================
// TP4 SCHRIFTSATZ LEISTUNGSPAKET
// ============================================================================
// TP4 Strafsachen Schriftsätze: Bemessungsgrundlage VARIANTEN-ABHÄNGIG!
// - PRIV_ANDERE: 6.000 € → ES 60%
// - ANKLAGE_ANDERE: 11.000 € → ES 50%
// Bei TP4 nur einfacher ES möglich! (§ 23 Abs 9 RATG)
// Reihenfolge: Entlohnung → ES → SGZ → ERV → Netto → USt → Brutto
// WICHTIG: ERV ist NICHT im Streitgenossenzuschlag enthalten!

/** TP4 Schriftsatz Eingabe-Parameter */
export interface TP4SchriftsatzInput {
  /** TP4-Variante */
  variante: TP4Variante;
  /** Schriftsatzart */
  schriftsatz: TP4Schriftsatz;
  /** Streitgenossen-Anzahl (0-9) */
  streitgenossen: StreitgenossenAnzahl;
  /** Einheitssatz-Option (nur einfach möglich bei TP4!) */
  einheitssatz: EinheitssatzOption;
  /** ERV-Eingabe */
  erv: ERVOption;
  /** Umsatzsteuer aktiv? */
  ustAktiv: boolean;
  /** Streitwert für Kostenbeschwerde (optional) */
  kostenbeschwerdeStreitwert?: number;
  /** Datum für historische Berechnung */
  date?: Date | string;
}

/** TP4 Schriftsatz Ergebnis */
export interface TP4SchriftsatzErgebnis {
  /** Periode (BGBl) */
  periode: string;
  /** Einzelne Positionen */
  positionen: ErgebnisZeile[];
  /** Entlohnung */
  entlohnungCents: number;
  /** Einheitssatz-Betrag */
  einheitssatzCents: number;
  /** Einheitssatz-Prozent (0, 60, 120) */
  einheitssatzProzent: number;
  /** Streitgenossenzuschlag */
  streitgenossenzuschlagCents: number;
  /** Streitgenossenzuschlag-Prozent */
  streitgenossenzuschlagProzent: number;
  /** ERV-Zuschlag */
  ervCents: number;
  /** Summe netto */
  nettoSummeCents: number;
  /** USt-Betrag */
  ustCents: number;
  /** USt-Satz (0 oder 20) */
  ustSatz: number;
  /** Summe brutto */
  bruttoSummeCents: number;
  /** Berechnungs-Trace */
  trace: string;
}

/**
 * Berechnet ein TP4 Schriftsatz-Leistungspaket.
 *
 * WICHTIG bei TP4 Strafsachen:
 * - Bemessungsgrundlage VARIANTEN-ABHÄNGIG (PRIV_ANDERE: 6.000€, ANKLAGE_ANDERE: 11.000€)
 * - ES-Rate: ≤10.170€ → 60%, >10.170€ → 50%
 * - Nur einfacher ES möglich! (§ 23 Abs 9 RATG)
 * - ES wird auf Entlohnung angewendet
 * - SGZ auf (Entlohnung + ES)
 * - ERV kommt NACH SGZ und ist NICHT im SGZ enthalten!
 *
 * Reihenfolge: Entlohnung → ES → SGZ → ERV → Netto → USt → Brutto
 */
export function calculateTP4SchriftsatzPaket(input: TP4SchriftsatzInput): TP4SchriftsatzErgebnis {
  const {
    variante,
    schriftsatz,
    streitgenossen,
    einheitssatz,
    erv,
    ustAktiv,
    kostenbeschwerdeStreitwert,
    date,
  } = input;

  const period = date ? getTariffPeriod(date) : getCurrentPeriod();
  const positionen: ErgebnisZeile[] = [];
  let trace = `RATG TP4 Schriftsatz Leistungspaket (${period.bgbl})\n`;
  trace += `Variante: ${variante}\n`;
  trace += `Schriftsatz: ${schriftsatz}\n\n`;

  // 1. Entlohnung (getTP4)
  const tp4Result = getTP4(variante, schriftsatz, kostenbeschwerdeStreitwert, date);
  const entlohnungCents = tp4Result.amount;
  positionen.push({ label: `Entlohnung (${schriftsatz})`, betragCents: entlohnungCents });
  trace += `1. Entlohnung: ${formatEuro(entlohnungCents)}\n`;

  // 2. Einheitssatz - basierend auf varianten-spezifischer Bemessungsgrundlage!
  // PRIV_ANDERE: 6.000 € → ES 60%
  // ANKLAGE_ANDERE: 11.000 € → ES 50%
  // WICHTIG: Bei TP4 Strafsachen nur EINFACHER ES möglich! (§ 23 Abs 9 RATG)
  const bemessungsgrundlage = getTP4Bemessungsgrundlage(variante);
  const basisRate = getESRate(bemessungsgrundlage);

  let esProzent: number;
  if (einheitssatz === 'keiner') {
    esProzent = 0;
  } else {
    // § 23 Abs 9 RATG: "In Strafsachen gebührt nur der einfache Einheitssatz"
    esProzent = basisRate * 100; // Immer einfacher ES bei TP4 Schriftsätzen!
  }

  const esCents = Math.round(entlohnungCents * esProzent / 100);
  if (esCents > 0) {
    positionen.push({ label: `Einheitssatz ${esProzent}%`, betragCents: esCents });
    trace += `2. Einheitssatz ${esProzent}%: ${formatEuro(esCents)}\n`;
    trace += `   (Bemessungsgrundlage ${variante}: ${formatEuro(bemessungsgrundlage)} → ES-Rate ${basisRate * 100}%)\n`;
  }

  // 3. Streitgenossenzuschlag (§ 15 RATG)
  // SGZ auf (Entlohnung + ES) - NICHT auf ERV!
  const basisFuerSGZ = entlohnungCents + esCents;
  const sgzProzent = STREITGENOSSEN_ZUSCHLAG[streitgenossen];
  const sgzCents = Math.round(basisFuerSGZ * sgzProzent / 100);

  if (sgzCents > 0) {
    positionen.push({ label: `Streitgenossenzuschlag ${sgzProzent}%`, betragCents: sgzCents });
    trace += `3. Streitgenossenzuschlag ${sgzProzent}%: ${formatEuro(sgzCents)}\n`;
    trace += `   (auf Entlohnung + ES = ${formatEuro(basisFuerSGZ)})\n`;
  }

  // 4. ERV-Zuschlag (§ 23a RATG) - NACH SGZ, NICHT im SGZ enthalten!
  let ervCents = 0;
  if (erv !== 'nein') {
    ervCents = ERV_BETRAEGE[erv];
    positionen.push({ label: `Erhöhungsbetrag ERV (${erv === 'erst' ? 'Erst' : 'Folge'})`, betragCents: ervCents });
    trace += `4. ERV-Zuschlag: ${formatEuro(ervCents)} (NICHT im SGZ!)\n`;
  }

  // 5. Summe netto
  const nettoSummeCents = entlohnungCents + esCents + sgzCents + ervCents;
  trace += `\n5. Summe netto: ${formatEuro(nettoSummeCents)}\n`;

  // 6. Umsatzsteuer
  const ustSatz = ustAktiv ? 20 : 0;
  const ustCents = ustAktiv ? Math.round(nettoSummeCents * 0.20) : 0;

  if (ustCents > 0) {
    positionen.push({ label: `${ustSatz}% USt.`, betragCents: ustCents });
    trace += `6. ${ustSatz}% USt.: ${formatEuro(ustCents)}\n`;
  }

  // 7. Summe brutto
  const bruttoSummeCents = nettoSummeCents + ustCents;
  trace += `\n7. Summe brutto: ${formatEuro(bruttoSummeCents)}`;

  return {
    periode: period.bgbl,
    positionen,
    entlohnungCents,
    einheitssatzCents: esCents,
    einheitssatzProzent: esProzent,
    streitgenossenzuschlagCents: sgzCents,
    streitgenossenzuschlagProzent: sgzProzent,
    ervCents,
    nettoSummeCents,
    ustCents,
    ustSatz,
    bruttoSummeCents,
    trace,
  };
}

// ============================================================================
// TAGSATZUNG LEISTUNGSPAKET (TP2, TP3A, TP3B, TP3C)
// ============================================================================
// Zivilverfahren Verhandlungen (Tagsatzungen)
// Reihenfolge: Entlohnung → Wartezeit → ES (auf 1+2) → SGZ (auf 1+2+3) → Netto → USt → Brutto
// ES-Rate basiert auf Streitwert: ≤10.170€ → 60%/120%, >10.170€ → 50%/100%

/** Tagsatzung (Verhandlung) Eingabe-Parameter */
export interface TagsatzungPaketInput {
  /** Streitwert in Cents */
  streitwertCents: number;
  /** Tarifpost */
  tarifpost: TagsatzungType;
  /** Dauer in halben Stunden */
  halbeStundenDauer: number;
  /** Wartezeit in halben Stunden (1. ist frei) */
  halbeStundenWartezeit: number;
  /** Streitgenossen-Anzahl (0-9) */
  streitgenossen: StreitgenossenAnzahl;
  /** Einheitssatz-Option */
  einheitssatz: EinheitssatzOption;
  /** Umsatzsteuer aktiv? */
  ustAktiv: boolean;
  /** Verbandsklage auf Abhilfe? (für TP3A/B/C Deckel) */
  verbandsklage?: boolean;
  /** Datum für historische Berechnung */
  date?: Date | string;
}

/** Tagsatzung (Verhandlung) Ergebnis */
export interface TagsatzungPaketErgebnis {
  /** Periode (BGBl) */
  periode: string;
  /** Einzelne Positionen */
  positionen: ErgebnisZeile[];
  /** Entlohnung (Verhandlung) */
  entlohnungCents: number;
  /** Wartezeit */
  wartezeitCents: number;
  /** Basis für ES (Entlohnung + Wartezeit) */
  basisFuerESCents: number;
  /** Einheitssatz-Betrag */
  einheitssatzCents: number;
  /** Einheitssatz-Prozent (0, 50, 60, 100, 120) */
  einheitssatzProzent: number;
  /** Streitgenossenzuschlag */
  streitgenossenzuschlagCents: number;
  /** Streitgenossenzuschlag-Prozent */
  streitgenossenzuschlagProzent: number;
  /** Summe netto */
  nettoSummeCents: number;
  /** USt-Betrag */
  ustCents: number;
  /** USt-Satz (0 oder 20) */
  ustSatz: number;
  /** Summe brutto */
  bruttoSummeCents: number;
  /** Berechnungs-Trace */
  trace: string;
}

/**
 * Berechnet ein Tagsatzung-Leistungspaket (TP2, TP3A, TP3B, TP3C).
 *
 * Reihenfolge:
 * 1. Entlohnung (Verhandlung)
 * 2. Wartezeit (1. ½ Std frei)
 * 3. ES auf (Entlohnung + Wartezeit)
 * 4. SGZ auf (Entlohnung + Wartezeit + ES)
 * 5. Netto
 * 6. USt
 * 7. Brutto
 *
 * ES-Rate basiert auf Streitwert:
 * - ≤ 10.170 € → 60% (einfach) / 120% (doppelt)
 * - > 10.170 € → 50% (einfach) / 100% (doppelt)
 */
export function calculateTagsatzungPaket(input: TagsatzungPaketInput): TagsatzungPaketErgebnis {
  const {
    streitwertCents,
    tarifpost,
    halbeStundenDauer,
    halbeStundenWartezeit,
    streitgenossen,
    einheitssatz,
    ustAktiv,
    verbandsklage = false,
    date,
  } = input;

  const period = date ? getTariffPeriod(date) : getCurrentPeriod();
  const positionen: ErgebnisZeile[] = [];
  let trace = `RATG ${tarifpost} Tagsatzung Leistungspaket (${period.bgbl})\n`;
  trace += `Streitwert: ${formatEuro(streitwertCents)}\n\n`;

  // 1. Entlohnung + Wartezeit via getTagsatzung()
  const tsResult = getTagsatzung(streitwertCents, tarifpost, halbeStundenDauer, halbeStundenWartezeit, date);
  let entlohnungCents = tsResult.entlohnung;
  const wartezeitCents = tsResult.wartezeit;

  // Verbandsklage-Deckel für TP3A/B/C
  if (verbandsklage) {
    const caps: Record<string, number> = {
      'TP3A': 212370,  // 2.123,70 €
      'TP3B': 265150,  // 2.651,50 €
      'TP3C': 318260,  // 3.182,60 €
    };
    if (caps[tarifpost] && entlohnungCents > caps[tarifpost]) {
      entlohnungCents = caps[tarifpost];
      trace += `(Verbandsklage-Deckel angewendet)\n`;
    }
  }

  positionen.push({ label: `Entlohnung (${halbeStundenDauer} ½ Std)`, betragCents: entlohnungCents });
  trace += `1. Entlohnung: ${formatEuro(entlohnungCents)}\n`;

  // 2. Wartezeit
  if (wartezeitCents > 0) {
    positionen.push({ label: `Wartezeit (${halbeStundenWartezeit} ½ Std, 1. frei)`, betragCents: wartezeitCents });
    trace += `2. Wartezeit: ${formatEuro(wartezeitCents)}\n`;
  }

  // 3. Basis für Einheitssatz = Entlohnung + Wartezeit
  const basisFuerESCents = entlohnungCents + wartezeitCents;
  trace += `\n   Basis für ES (1+2): ${formatEuro(basisFuerESCents)}\n`;

  // 4. Einheitssatz - basierend auf Streitwert
  // ES-Rate: ≤10.170€ → 60%/120%, >10.170€ → 50%/100%
  const basisRate = getESRate(streitwertCents);

  let esProzent: number;
  if (einheitssatz === 'keiner') {
    esProzent = 0;
  } else {
    const faktor = einheitssatz === 'doppelt' ? 2 : 1;
    esProzent = basisRate * 100 * faktor;
  }

  const esCents = Math.round(basisFuerESCents * esProzent / 100);
  if (esCents > 0) {
    positionen.push({ label: `Einheitssatz ${esProzent}%`, betragCents: esCents });
    trace += `3. Einheitssatz ${esProzent}%: ${formatEuro(esCents)}\n`;
    trace += `   (Streitwert ${formatEuro(streitwertCents)} → ES-Rate ${basisRate * 100}%)\n`;
  }

  // 5. Streitgenossenzuschlag (§ 15 RATG)
  // SGZ auf (Entlohnung + Wartezeit + ES)
  const basisFuerSGZ = basisFuerESCents + esCents;
  const sgzProzent = STREITGENOSSEN_ZUSCHLAG[streitgenossen];
  const sgzCents = Math.round(basisFuerSGZ * sgzProzent / 100);

  if (sgzCents > 0) {
    positionen.push({ label: `Streitgenossenzuschlag ${sgzProzent}%`, betragCents: sgzCents });
    trace += `4. Streitgenossenzuschlag ${sgzProzent}%: ${formatEuro(sgzCents)}\n`;
    trace += `   (auf 1+2+3 = ${formatEuro(basisFuerSGZ)})\n`;
  }

  // 6. Summe netto
  const nettoSummeCents = basisFuerESCents + esCents + sgzCents;
  trace += `\n5. Summe netto: ${formatEuro(nettoSummeCents)}\n`;

  // 7. Umsatzsteuer
  const ustSatz = ustAktiv ? 20 : 0;
  const ustCents = ustAktiv ? Math.round(nettoSummeCents * 0.20) : 0;

  if (ustCents > 0) {
    positionen.push({ label: `${ustSatz}% USt.`, betragCents: ustCents });
    trace += `6. ${ustSatz}% USt.: ${formatEuro(ustCents)}\n`;
  }

  // 8. Summe brutto
  const bruttoSummeCents = nettoSummeCents + ustCents;
  trace += `\n7. Summe brutto: ${formatEuro(bruttoSummeCents)}`;

  return {
    periode: period.bgbl,
    positionen,
    entlohnungCents,
    wartezeitCents,
    basisFuerESCents,
    einheitssatzCents: esCents,
    einheitssatzProzent: esProzent,
    streitgenossenzuschlagCents: sgzCents,
    streitgenossenzuschlagProzent: sgzProzent,
    nettoSummeCents,
    ustCents,
    ustSatz,
    bruttoSummeCents,
    trace,
  };
}
