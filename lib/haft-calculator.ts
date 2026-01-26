/**
 * ============================================================================
 * HAFT-CALCULATOR - Kostenberechnung für Haftrecht
 * ============================================================================
 *
 * Rechtsgrundlage: AHK § 9 Abs 1 Z 5 + § 10
 * Stand: 2024
 * ============================================================================
 */

import { HaftService, HaftLeistungType, HaftBmglStufe, TotalResult, CalculatedLine } from '../types';
import { AHK_HAFT_TARIFE } from './ahk';
import { getTariffBase, getKommission } from './tariffs';
import { isHaftTagsatzung } from './haft-catalog';

// BMGL nach Ausgangsverfahren (§ 10 Abs 1 AHK)
export const HAFT_BEMESSUNGSGRUNDLAGEN: Record<HaftBmglStufe, number> = {
  BG: 780000,           // € 7.800
  ER_GH: 1800000,       // € 18.000
  SCHOEFFEN: 2760000,   // € 27.600
  GESCHWORENEN: 3320000, // € 33.200
};

export const HAFT_BMGL_LABELS: Record<HaftBmglStufe, string> = {
  BG: 'Bezirksgericht (€ 7.800)',
  ER_GH: 'Einzelrichter Gerichtshof (€ 18.000)',
  SCHOEFFEN: 'Schöffengericht (€ 27.600)',
  GESCHWORENEN: 'Geschworenengericht (€ 33.200)',
};

// TP 9/4: Reisezeitvergütung pro halbe Stunde
const REISEZEIT_PRO_HALBE_STUNDE = 3390; // € 33,90 in Cents

// TP 9/3: Kilometergeld
const KILOMETERGELD = 50; // € 0,50 in Cents

// ERV-Pauschale
const ERV_INITIAL = 500; // € 5,00
const ERV_REGULAR = 260; // € 2,60

interface HaftCalculationParams {
  bmglStufe: HaftBmglStufe;
  services: HaftService[];
  isVatFree: boolean;
}

/**
 * Berechnet Kosten für eine einzelne Haft-Leistung
 */
function calculateHaftLine(
  service: HaftService,
  bmglCents: number
): CalculatedLine {
  const { leistungType, durationHalbeStunden, esMultiplier, includeErv, ervRateOverride, kilometerHin, isRueckfahrt } = service;

  let amountCents = 0;
  let trace = '';
  let section = '';

  // === AHK § 9 Abs 1 Z 5 - Fixe Tarife ===
  if (leistungType === 'HAFT_VH_1_INSTANZ') {
    // a) Verhandlungen 1. Instanz: € 364 erste ½h, € 182 weitere
    const tarif = AHK_HAFT_TARIFE.vh1Instanz;
    const firstHalf = tarif.firstHalf;
    const subsequent = durationHalbeStunden > 1 ? (durationHalbeStunden - 1) * tarif.subsequentHalf : 0;
    amountCents = firstHalf + subsequent;
    section = '§ 9 Abs 1 Z 5 lit a AHK';
    trace = `1. halbe Stunde: € ${(firstHalf / 100).toFixed(2)}`;
    if (durationHalbeStunden > 1) {
      trace += `\n${durationHalbeStunden - 1} weitere ½ Std × € ${(tarif.subsequentHalf / 100).toFixed(2)} = € ${(subsequent / 100).toFixed(2)}`;
    }
    trace += `\nGesamt: € ${(amountCents / 100).toFixed(2)}`;
  }
  else if (leistungType === 'HAFT_VH_2_INSTANZ') {
    // c) Verhandlungen 2. Instanz: € 564 erste ½h, € 282 weitere
    const tarif = AHK_HAFT_TARIFE.vh2Instanz;
    const firstHalf = tarif.firstHalf;
    const subsequent = durationHalbeStunden > 1 ? (durationHalbeStunden - 1) * tarif.subsequentHalf : 0;
    amountCents = firstHalf + subsequent;
    section = '§ 9 Abs 1 Z 5 lit c AHK';
    trace = `1. halbe Stunde: € ${(firstHalf / 100).toFixed(2)}`;
    if (durationHalbeStunden > 1) {
      trace += `\n${durationHalbeStunden - 1} weitere ½ Std × € ${(tarif.subsequentHalf / 100).toFixed(2)} = € ${(subsequent / 100).toFixed(2)}`;
    }
    trace += `\nGesamt: € ${(amountCents / 100).toFixed(2)}`;
  }
  else if (leistungType === 'HAFT_GRUNDRECHTSBESCHWERDE') {
    // b) Grundrechtsbeschwerde: € 786
    amountCents = AHK_HAFT_TARIFE.grundrechtsbeschwerde;
    section = '§ 9 Abs 1 Z 5 lit b AHK';
    trace = `Grundrechtsbeschwerde: € ${(amountCents / 100).toFixed(2)}`;
  }
  else if (leistungType === 'HAFT_BESCHWERDE_SONST') {
    // b) Sonstige Beschwerden: € 564
    amountCents = AHK_HAFT_TARIFE.sonstigeBeschwerde;
    section = '§ 9 Abs 1 Z 5 lit b AHK';
    trace = `Sonstige Beschwerde (Haft): € ${(amountCents / 100).toFixed(2)}`;
  }

  // === § 10 AHK → RATG Anwendung ===
  else if (leistungType === 'HAFT_BESUCH' || leistungType === 'HAFT_ZUWARTEN') {
    // TP 7/2 RATG - Kommissionen (RA/RAA erforderlich)
    // getKommission(cents, halbeStunden, wegStunden, mitRA)
    const kommission = getKommission(bmglCents, durationHalbeStunden, 0, true);
    amountCents = kommission.kommission; // nur Kommission, keine Wegzeit bei Haft-Besuchen
    section = 'TP 7/2 RATG (§ 10 AHK)';
    trace = `TP 7/2 Kommission: € ${(kommission.kommission / 100).toFixed(2)} (${durationHalbeStunden} × ½ Std.)`;
  }
  else if (leistungType === 'HAFT_ANTRAG_TP3A') {
    // TP 3A RATG
    const tariff = getTariffBase(bmglCents, 'TP3A');
    amountCents = tariff.base;
    section = 'TP 3A RATG (§ 10 AHK)';
    trace = `Tarif TP 3A: € ${(tariff.base / 100).toFixed(2)} (BMGL € ${(bmglCents / 100).toFixed(2)})`;
  }
  else if (leistungType === 'HAFT_BESCHWERDE_TP3B') {
    // TP 3B RATG
    const tariff = getTariffBase(bmglCents, 'TP3B');
    amountCents = tariff.base;
    section = 'TP 3B RATG (§ 10 AHK)';
    trace = `Tarif TP 3B: € ${(tariff.base / 100).toFixed(2)} (BMGL € ${(bmglCents / 100).toFixed(2)})`;
  }
  else if (leistungType === 'HAFT_KURZANTRAG_TP2') {
    // TP 2 RATG
    const tariff = getTariffBase(bmglCents, 'TP2');
    amountCents = tariff.base;
    section = 'TP 2 RATG (§ 10 AHK)';
    trace = `Tarif TP 2: € ${(tariff.base / 100).toFixed(2)} (BMGL € ${(bmglCents / 100).toFixed(2)})`;
  }

  // === BARAUSLAGEN ===
  else if (leistungType === 'HAFT_REISEKOSTEN') {
    // TP 9/3: € 0,50/km
    const km = (kilometerHin ?? 0) * (isRueckfahrt ? 2 : 1);
    amountCents = km * KILOMETERGELD;
    section = 'TP 9/3 RATG';
    trace = `${km} km × € 0,50 = € ${(amountCents / 100).toFixed(2)}`;
    if (isRueckfahrt && kilometerHin) {
      trace = `${kilometerHin} km × 2 (Hin + Rück) × € 0,50 = € ${(amountCents / 100).toFixed(2)}`;
    }
  }
  else if (leistungType === 'HAFT_REISEZEIT') {
    // TP 9/4: € 33,90 pro halbe Stunde
    amountCents = durationHalbeStunden * REISEZEIT_PRO_HALBE_STUNDE;
    section = 'TP 9/4 RATG';
    trace = `${durationHalbeStunden} × ½ Std × € 33,90 = € ${(amountCents / 100).toFixed(2)}`;
  }

  // === Einheitssatz ===
  // RATG-Leistungen (Kommissionen + Schriftsätze): 0-4× (keiner bis vierfach)
  // AHK-Schriftsätze: max 1× (keiner oder einfach)
  const isRatgLeistung = ['HAFT_BESUCH', 'HAFT_ZUWARTEN', 'HAFT_ANTRAG_TP3A', 'HAFT_BESCHWERDE_TP3B', 'HAFT_KURZANTRAG_TP2'].includes(leistungType);
  const isAhkSchriftsatz = ['HAFT_GRUNDRECHTSBESCHWERDE', 'HAFT_BESCHWERDE_SONST'].includes(leistungType);

  if ((isRatgLeistung || isAhkSchriftsatz) && esMultiplier > 0) {
    // ES-Rate: 60% bis € 10.170, sonst 50%
    const esBaseRate = bmglCents <= 1017000 ? 0.6 : 0.5;
    // AHK-Schriftsätze: max einfacher ES
    const esMultiplierCapped = isAhkSchriftsatz ? Math.min(esMultiplier, 1) : esMultiplier;
    const esPercent = esMultiplierCapped * esBaseRate * 100;

    if (esPercent > 0) {
      const esAmount = Math.round(amountCents * esPercent / 100);
      const esLabel = esMultiplierCapped === 1 ? 'einfach' : esMultiplierCapped === 2 ? 'doppelt' : esMultiplierCapped === 3 ? 'dreifach' : 'vierfach';
      trace += `\nEinheitssatz ${esLabel} (${Math.round(esPercent)}%): € ${(esAmount / 100).toFixed(2)}`;
      amountCents += esAmount;
      trace += `\nGesamt mit ES: € ${(amountCents / 100).toFixed(2)}`;
    }
  }

  // === ERV-Pauschale (basierend auf ervRateOverride) ===
  if (includeErv) {
    // 'regular' = € 2,60, 'initial' oder undefined = € 5,00
    const ervAmount = ervRateOverride === 'regular' ? ERV_REGULAR : ERV_INITIAL;
    const ervLabel = ervRateOverride === 'regular' ? 'Regulär' : 'Erstmals';
    trace += `\nERV-Pauschale (${ervLabel}): € ${(ervAmount / 100).toFixed(2)}`;
    amountCents += ervAmount;
  }

  return {
    date: service.date,
    label: service.label,
    section,
    interval: '',
    vatRate: 20,
    amountCents,
    bmglCents,
    calculationTrace: trace,
    serviceId: service.id,
  };
}

/**
 * Berechnet alle Haft-Kosten
 */
export function calculateHaftCosts(params: HaftCalculationParams): TotalResult {
  const { bmglStufe, services, isVatFree } = params;
  const bmglCents = HAFT_BEMESSUNGSGRUNDLAGEN[bmglStufe];

  const lines: CalculatedLine[] = [];

  for (const service of services) {
    const line = calculateHaftLine(service, bmglCents);
    lines.push(line);
  }

  // Summen
  const netCents = lines.reduce((sum, l) => sum + l.amountCents, 0);
  const vatCents = isVatFree ? 0 : Math.round(netCents * 0.20);

  return {
    lines,
    netCents,
    vatCents,
    gggCents: 0, // Haftverfahren: keine GGG
    totalCents: netCents + vatCents,
  };
}
