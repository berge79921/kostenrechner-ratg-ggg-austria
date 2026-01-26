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
 * Berechnet Kosten für eine einzelne Haft-Leistung - gibt MEHRERE Zeilen zurück (Entlohnung, ES, ERV separat)
 */
function calculateHaftLines(
  service: HaftService,
  bmglCents: number
): CalculatedLine[] {
  const { leistungType, durationHalbeStunden, esMultiplier, includeErv, ervRateOverride, kilometerHin, isRueckfahrt } = service;
  const lines: CalculatedLine[] = [];

  let baseAmount = 0;
  let baseTrace = '';
  let section = '';

  // === AHK § 9 Abs 1 Z 5 - Fixe Tarife ===
  if (leistungType === 'HAFT_VH_1_INSTANZ') {
    const tarif = AHK_HAFT_TARIFE.vh1Instanz;
    const firstHalf = tarif.firstHalf;
    const subsequent = durationHalbeStunden > 1 ? (durationHalbeStunden - 1) * tarif.subsequentHalf : 0;
    baseAmount = firstHalf + subsequent;
    section = '§ 9 Abs 1 Z 5 lit a AHK';
    baseTrace = `${durationHalbeStunden} × ½ Std. (€ ${(tarif.firstHalf / 100).toFixed(2)} + ${Math.max(0, durationHalbeStunden - 1)} × € ${(tarif.subsequentHalf / 100).toFixed(2)})`;
  }
  else if (leistungType === 'HAFT_VH_2_INSTANZ') {
    const tarif = AHK_HAFT_TARIFE.vh2Instanz;
    const firstHalf = tarif.firstHalf;
    const subsequent = durationHalbeStunden > 1 ? (durationHalbeStunden - 1) * tarif.subsequentHalf : 0;
    baseAmount = firstHalf + subsequent;
    section = '§ 9 Abs 1 Z 5 lit c AHK';
    baseTrace = `${durationHalbeStunden} × ½ Std. (€ ${(tarif.firstHalf / 100).toFixed(2)} + ${Math.max(0, durationHalbeStunden - 1)} × € ${(tarif.subsequentHalf / 100).toFixed(2)})`;
  }
  else if (leistungType === 'HAFT_GRUNDRECHTSBESCHWERDE') {
    baseAmount = AHK_HAFT_TARIFE.grundrechtsbeschwerde;
    section = '§ 9 Abs 1 Z 5 lit b AHK';
    baseTrace = `Pauschale Grundrechtsbeschwerde`;
  }
  else if (leistungType === 'HAFT_BESCHWERDE_SONST') {
    baseAmount = AHK_HAFT_TARIFE.sonstigeBeschwerde;
    section = '§ 9 Abs 1 Z 5 lit b AHK';
    baseTrace = `Pauschale sonstige Beschwerde`;
  }
  // === § 10 AHK → RATG Anwendung ===
  else if (leistungType === 'HAFT_BESUCH' || leistungType === 'HAFT_ZUWARTEN') {
    const kommission = getKommission(bmglCents, durationHalbeStunden, 0, true);
    baseAmount = kommission.kommission;
    section = 'TP 7/2 RATG (§ 10 AHK)';
    baseTrace = `${durationHalbeStunden} × ½ Std. Kommission`;
  }
  else if (leistungType === 'HAFT_ANTRAG_TP3A') {
    const tariff = getTariffBase(bmglCents, 'TP3A');
    baseAmount = tariff.base;
    section = 'TP 3A RATG (§ 10 AHK)';
    baseTrace = `Tarif ${tariff.label}`;
  }
  else if (leistungType === 'HAFT_BESCHWERDE_TP3B') {
    const tariff = getTariffBase(bmglCents, 'TP3B');
    baseAmount = tariff.base;
    section = 'TP 3B RATG (§ 10 AHK)';
    baseTrace = `Tarif ${tariff.label}`;
  }
  else if (leistungType === 'HAFT_KURZANTRAG_TP2') {
    const tariff = getTariffBase(bmglCents, 'TP2');
    baseAmount = tariff.base;
    section = 'TP 2 RATG (§ 10 AHK)';
    baseTrace = `Tarif ${tariff.label}`;
  }
  // === BARAUSLAGEN ===
  else if (leistungType === 'HAFT_REISEKOSTEN') {
    const km = (kilometerHin ?? 0) * (isRueckfahrt ? 2 : 1);
    baseAmount = km * KILOMETERGELD;
    section = 'TP 9/3 RATG';
    baseTrace = `${km} km × € 0,50`;
  }
  else if (leistungType === 'HAFT_REISEZEIT') {
    baseAmount = durationHalbeStunden * REISEZEIT_PRO_HALBE_STUNDE;
    section = 'TP 9/4 RATG';
    baseTrace = `${durationHalbeStunden} × ½ Std × € 33,90`;
  }

  // Zeile 1: Basis-Entlohnung
  lines.push({
    date: service.date,
    label: `${service.label} – Entlohnung`,
    section,
    interval: '',
    vatRate: 20,
    amountCents: baseAmount,
    bmglCents,
    calculationTrace: baseTrace,
    serviceId: service.id,
  });

  // === Einheitssatz (separate Zeile) ===
  const isRatgKommission = ['HAFT_BESUCH', 'HAFT_ZUWARTEN'].includes(leistungType);
  const isRatgSchriftsatz = ['HAFT_ANTRAG_TP3A', 'HAFT_BESCHWERDE_TP3B', 'HAFT_KURZANTRAG_TP2'].includes(leistungType);
  const isAhkSchriftsatz = ['HAFT_GRUNDRECHTSBESCHWERDE', 'HAFT_BESCHWERDE_SONST'].includes(leistungType);
  const isAhkTagsatzung = ['HAFT_VH_1_INSTANZ', 'HAFT_VH_2_INSTANZ'].includes(leistungType);

  if ((isRatgKommission || isRatgSchriftsatz || isAhkSchriftsatz || isAhkTagsatzung) && esMultiplier > 0) {
    const esBaseRate = bmglCents <= 1017000 ? 0.6 : 0.5;
    const esMultiplierCapped = (isAhkSchriftsatz || isAhkTagsatzung || isRatgKommission) ? Math.min(esMultiplier, 1) : esMultiplier;
    const esPercent = esMultiplierCapped * esBaseRate * 100;

    if (esPercent > 0) {
      const esAmount = Math.round(baseAmount * esPercent / 100);
      const esLabel = esMultiplierCapped === 1 ? 'einfach' : esMultiplierCapped === 2 ? 'doppelt' : esMultiplierCapped === 3 ? 'dreifach' : 'vierfach';

      lines.push({
        date: service.date,
        label: `${service.label} – ES ${esLabel} (${Math.round(esPercent)}%)`,
        section: '§ 23 RATG',
        interval: '',
        vatRate: 20,
        amountCents: esAmount,
        bmglCents,
        calculationTrace: `${Math.round(esPercent)}% von € ${(baseAmount / 100).toFixed(2)}`,
        serviceId: service.id,
      });
    }
  }

  // === ERV-Pauschale (separate Zeile) ===
  if (includeErv) {
    const ervAmount = ervRateOverride === 'regular' ? ERV_REGULAR : ERV_INITIAL;
    const ervLabel = ervRateOverride === 'regular' ? 'Regulär' : 'Erstmals';

    lines.push({
      date: service.date,
      label: `${service.label} – ERV-Beitrag (${ervLabel})`,
      section: '§ 23a RATG',
      interval: '',
      vatRate: 20,
      amountCents: ervAmount,
      bmglCents,
      calculationTrace: `ERV-Pauschale ${ervLabel}`,
      serviceId: service.id,
    });
  }

  return lines;
}

/**
 * Berechnet alle Haft-Kosten
 */
export function calculateHaftCosts(params: HaftCalculationParams): TotalResult {
  const { bmglStufe, services, isVatFree } = params;
  const bmglCents = HAFT_BEMESSUNGSGRUNDLAGEN[bmglStufe];

  const lines: CalculatedLine[] = [];

  for (const service of services) {
    const serviceLines = calculateHaftLines(service, bmglCents);
    lines.push(...serviceLines);
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
