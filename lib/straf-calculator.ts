/**
 * ============================================================================
 * Straf-Calculator - AHK §§ 9-10 Kostenberechnung
 * ============================================================================
 */

import {
  CourtType,
  StrafLeistungType,
  AHK_TARIFE,
  AHK_HAFT_TARIFE,
  STRAF_BEMESSUNGSGRUNDLAGEN,
  STRAF_LEISTUNG_LABELS,
  calculateStrafTagsatzung,
  calculateStrafStreitgenossen,
  calculateErfolgszuschlag,
  calculateNbBerufungZuschlag,
  isTagsatzung,
  TagsatzungTarif,
} from './ahk';
import { getTariffBase, getESRate, getKommission } from './tariffs';
import { StrafService, CalculatedLine, TotalResult } from '../types';

export interface StrafCalculationParams {
  courtType: CourtType;
  services: StrafService[];
  streitgenossen: number; // Anzahl weitere Personen (30% pro Person)
  erfolgszuschlagProzent: number; // 0-50%
  isVatFree: boolean;
  haftAusgangsverfahren?: CourtType; // Für Haft: welches Ausgangsverfahren (für RATG-Bemessungsgrundlage)
}

/**
 * Berechnet die Kosten für Strafverfahren nach AHK §§ 9-10
 */
export function calculateStrafCosts(params: StrafCalculationParams): TotalResult {
  const {
    courtType,
    services,
    streitgenossen,
    erfolgszuschlagProzent,
    isVatFree,
    haftAusgangsverfahren,
  } = params;

  const lines: CalculatedLine[] = [];
  const currentVatRate = isVatFree ? 0 : 20;

  // Bemessungsgrundlage für RATG-Leistungen
  let bmglCents = STRAF_BEMESSUNGSGRUNDLAGEN[courtType];
  if (courtType === 'HAFT' && haftAusgangsverfahren) {
    bmglCents = STRAF_BEMESSUNGSGRUNDLAGEN[haftAusgangsverfahren];
  }

  // ES-Rate für RATG-Leistungen
  const esRate = getESRate(bmglCents);

  // Sammle Basis für Streitgenossen und Erfolgszuschlag
  let totalBasisFuerZuschlaege = 0;

  services.forEach(s => {
    const result = calculateSingleStrafLeistung(
      s,
      courtType,
      bmglCents,
      esRate,
      currentVatRate
    );

    lines.push(...result.lines);
    totalBasisFuerZuschlaege += result.basisBetrag;
  });

  // Streitgenossenzuschlag (30% pro Person, kein Limit)
  if (streitgenossen > 0 && totalBasisFuerZuschlaege > 0) {
    const sg = calculateStrafStreitgenossen(totalBasisFuerZuschlaege, streitgenossen);
    if (sg.amount > 0) {
      lines.push({
        date: services[0]?.date || new Date().toISOString().split('T')[0],
        label: `Streitgenossenzuschlag (${sg.percent}%)`,
        section: '§ 10 Abs 3 AHK',
        interval: `${streitgenossen} × 30%`,
        vatRate: currentVatRate,
        amountCents: sg.amount,
        bmglCents: totalBasisFuerZuschlaege,
        calculationTrace: sg.trace,
        serviceId: 'straf_sg',
      });
    }
  }

  // Erfolgszuschlag (0-50%)
  if (erfolgszuschlagProzent > 0 && totalBasisFuerZuschlaege > 0) {
    const erfolg = calculateErfolgszuschlag(totalBasisFuerZuschlaege, erfolgszuschlagProzent);
    if (erfolg.amount > 0) {
      lines.push({
        date: services[0]?.date || new Date().toISOString().split('T')[0],
        label: `Erfolgszuschlag (${erfolgszuschlagProzent}%)`,
        section: '§ 10 AHK',
        interval: 'Freispruch/Einstellung',
        vatRate: currentVatRate,
        amountCents: erfolg.amount,
        bmglCents: totalBasisFuerZuschlaege,
        calculationTrace: erfolg.trace,
        serviceId: 'straf_erfolg',
      });
    }
  }

  // Zusammenfassung
  const taxableNetCents = lines.filter(l => l.vatRate > 0).reduce((sum, l) => sum + l.amountCents, 0);
  const vatCents = Math.round(taxableNetCents * 0.20);
  const nonTaxableCents = lines.filter(l => l.vatRate === 0).reduce((sum, l) => sum + l.amountCents, 0);

  return {
    lines,
    netCents: taxableNetCents,
    vatCents,
    gggCents: nonTaxableCents,
    totalCents: taxableNetCents + vatCents + nonTaxableCents,
  };
}

interface SingleLeistungResult {
  lines: CalculatedLine[];
  basisBetrag: number; // Für Streitgenossen/Erfolgszuschlag
}

/**
 * Berechnet eine einzelne Straf-Leistung
 */
function calculateSingleStrafLeistung(
  service: StrafService,
  courtType: CourtType,
  bmglCents: number,
  esRate: number,
  vatRate: number
): SingleLeistungResult {
  const lines: CalculatedLine[] = [];
  let basisBetrag = 0;

  const label = STRAF_LEISTUNG_LABELS[service.leistungType];

  // =========================================================================
  // AHK § 9 LEISTUNGEN (fixe Tarife)
  // =========================================================================

  if (service.leistungType.startsWith('STRAF_') && !service.leistungType.startsWith('STRAF_RATG') && service.leistungType !== 'STRAF_ZUWARTEN') {
    const ahkResult = calculateAHKLeistung(service, courtType);

    if (ahkResult) {
      lines.push({
        date: service.date,
        label: service.label || label,
        section: `AHK § 9`,
        interval: getCourtLabel(courtType),
        vatRate,
        amountCents: ahkResult.amount,
        bmglCents: 0, // Kein Streitwert bei AHK
        calculationTrace: ahkResult.trace,
        serviceId: service.id,
      });
      basisBetrag += ahkResult.amount;

      // NB + Berufung Zuschlag (§ 9 Abs 2)
      if (service.nbUndBerufung && (service.leistungType === 'STRAF_NICHTIGKEITSBESCHWERDE' || service.leistungType === 'STRAF_GERICHTSTAG_NB')) {
        const nbZuschlag = calculateNbBerufungZuschlag(ahkResult.amount);
        lines.push({
          date: service.date,
          label: 'Zuschlag NB + Berufung (+20%)',
          section: 'AHK § 9 Abs 2',
          interval: '-',
          vatRate,
          amountCents: nbZuschlag.amount,
          bmglCents: 0,
          calculationTrace: nbZuschlag.trace,
          serviceId: service.id,
        });
        basisBetrag += nbZuschlag.amount;
      }

      // Einheitssatz (sinngemäß § 23 RATG)
      if (service.esMultiplier > 0) {
        const effectiveESRate = esRate * service.esMultiplier;
        const esAmount = Math.round(ahkResult.amount * effectiveESRate);
        lines.push({
          date: service.date,
          label: `Einheitssatz ${(effectiveESRate * 100).toFixed(0)}%`,
          section: '§ 23 RATG (sinngemäß)',
          interval: '-',
          vatRate,
          amountCents: esAmount,
          bmglCents: 0,
          calculationTrace: `${service.esMultiplier}× ES auf ${(ahkResult.amount / 100).toFixed(2)} €`,
          serviceId: service.id,
        });
        basisBetrag += esAmount;
      }

      // ERV
      if (service.includeErv && !isTagsatzung(service.leistungType)) {
        const ervAmount = service.ervRateOverride === 'initial' ? 500 : 260;
        lines.push({
          date: service.date,
          label: 'ERV-Beitrag (§ 23a RATG)',
          section: '§ 23a RATG',
          interval: '-',
          vatRate,
          amountCents: ervAmount,
          bmglCents: 0,
          calculationTrace: service.ervRateOverride === 'initial' ? 'Ersteinbringung: 5,00 €' : 'Folgeschriftsatz: 2,60 €',
          serviceId: service.id,
        });
      }

      return { lines, basisBetrag };
    }
  }

  // =========================================================================
  // RATG LEISTUNGEN (§ 10 AHK)
  // =========================================================================

  if (service.leistungType.startsWith('STRAF_RATG') || service.leistungType === 'STRAF_ZUWARTEN') {
    const ratgResult = calculateRATGStrafLeistung(service, bmglCents, esRate, vatRate);
    lines.push(...ratgResult.lines);
    basisBetrag += ratgResult.basisBetrag;
    return { lines, basisBetrag };
  }

  return { lines, basisBetrag };
}

/**
 * Berechnet eine AHK § 9 Leistung
 */
function calculateAHKLeistung(
  service: StrafService,
  courtType: CourtType
): { amount: number; trace: string } | null {
  const { leistungType, durationHalbeStunden } = service;

  // Haftverfahren
  if (courtType === 'HAFT') {
    const haftTarife = AHK_HAFT_TARIFE;

    switch (leistungType) {
      case 'STRAF_HAFT_VH_1':
        return calculateStrafTagsatzung(haftTarife.vh1Instanz, durationHalbeStunden);
      case 'STRAF_HAFT_VH_2':
        return calculateStrafTagsatzung(haftTarife.vh2Instanz, durationHalbeStunden);
      case 'STRAF_HAFT_GRUNDRECHTSBESCHWERDE':
        return { amount: haftTarife.grundrechtsbeschwerde, trace: `Grundrechtsbeschwerde: ${(haftTarife.grundrechtsbeschwerde / 100).toFixed(2)} €` };
      case 'STRAF_HAFT_BESCHWERDE_SONST':
        return { amount: haftTarife.sonstigeBeschwerde, trace: `Sonstige Beschwerde: ${(haftTarife.sonstigeBeschwerde / 100).toFixed(2)} €` };
    }
    return null;
  }

  // Andere Gerichte
  const tarife = AHK_TARIFE[courtType];
  if (!tarife) return null;

  switch (leistungType) {
    // Hauptverhandlung
    case 'STRAF_HV_1_INSTANZ':
    case 'STRAF_KONTRADIKTORISCHE_VERNEHMUNG':
      return calculateStrafTagsatzung(tarife.hv1Instanz, durationHalbeStunden);

    // Berufung (BG, ER_GH)
    case 'STRAF_BERUFUNG_VOLL':
      if (tarife.berufungVoll) {
        return { amount: tarife.berufungVoll, trace: `Berufung (voll): ${(tarife.berufungVoll / 100).toFixed(2)} €` };
      }
      break;
    case 'STRAF_BERUFUNG_STRAFE':
      if (tarife.berufungStrafe) {
        return { amount: tarife.berufungStrafe, trace: `Berufung (nur Strafe): ${(tarife.berufungStrafe / 100).toFixed(2)} €` };
      }
      break;
    case 'STRAF_BERUFUNG_VH_VOLL':
      if (tarife.berufungVhVoll) {
        return calculateStrafTagsatzung(tarife.berufungVhVoll, durationHalbeStunden);
      }
      break;
    case 'STRAF_BERUFUNG_VH_STRAFE':
      if (tarife.berufungVhStrafe) {
        return calculateStrafTagsatzung(tarife.berufungVhStrafe, durationHalbeStunden);
      }
      break;

    // Berufung (Schöffen, Geschworenen)
    case 'STRAF_BERUFUNG':
      if (tarife.berufung) {
        return { amount: tarife.berufung, trace: `Berufung: ${(tarife.berufung / 100).toFixed(2)} €` };
      }
      break;
    case 'STRAF_BERUFUNG_VH':
      if (tarife.berufungVh) {
        return calculateStrafTagsatzung(tarife.berufungVh, durationHalbeStunden);
      }
      break;

    // Nichtigkeitsbeschwerde (nur Schöffen, Geschworenen)
    case 'STRAF_NICHTIGKEITSBESCHWERDE':
      if (tarife.nichtigkeitsbeschwerde) {
        return { amount: tarife.nichtigkeitsbeschwerde, trace: `Nichtigkeitsbeschwerde: ${(tarife.nichtigkeitsbeschwerde / 100).toFixed(2)} €` };
      }
      break;
    case 'STRAF_GERICHTSTAG_NB':
      if (tarife.gerichtstagNb) {
        return calculateStrafTagsatzung(tarife.gerichtstagNb, durationHalbeStunden);
      }
      break;
  }

  return null;
}

/**
 * Berechnet eine RATG-Leistung nach § 10 AHK
 */
function calculateRATGStrafLeistung(
  service: StrafService,
  bmglCents: number,
  esRate: number,
  vatRate: number
): SingleLeistungResult {
  const lines: CalculatedLine[] = [];
  let basisBetrag = 0;

  const { leistungType, durationHalbeStunden, esMultiplier, includeErv, ervRateOverride } = service;
  const label = STRAF_LEISTUNG_LABELS[leistungType];

  // Bestimme RATG-Tarifpost
  let tpType: 'TP2' | 'TP3A' | 'TP3B' | 'TP7' = 'TP3A';
  let tpLabel = 'TP 3A';

  switch (leistungType) {
    case 'STRAF_RATG_TP2':
      tpType = 'TP2';
      tpLabel = 'TP 2';
      break;
    case 'STRAF_RATG_TP3A':
      tpType = 'TP3A';
      tpLabel = 'TP 3A';
      break;
    case 'STRAF_RATG_TP3B':
      tpType = 'TP3B';
      tpLabel = 'TP 3B';
      break;
    case 'STRAF_RATG_TP7_2':
    case 'STRAF_ZUWARTEN':
      // TP 7/2 = TP 3A mit Faktor 0.5 (vereinfacht)
      // Fix: Set tpType to 'TP7' so that the mapping in getTariffBase works correctly and passes type check
      tpType = 'TP7';
      tpLabel = 'TP 7/2';
      break;
  }

  // Hole RATG-Tarif
  let baseAmount = 0;
  let tariffLabel = '';
  let traceText = '';

  // TP 7/2: Kommission (Zeitgebühr pro halbe Stunde)
  if (leistungType === 'STRAF_RATG_TP7_2' || leistungType === 'STRAF_ZUWARTEN') {
    const halbeStunden = Math.max(1, durationHalbeStunden || 1);
    const kommResult = getKommission(bmglCents, halbeStunden, 0, true);
    baseAmount = kommResult.kommission;
    tariffLabel = `BMGL € ${(bmglCents / 100).toLocaleString('de-AT')}`;
    traceText = `${tpLabel} (${halbeStunden} × ½ Std.) bei ${tariffLabel}: ${(baseAmount / 100).toFixed(2)} €`;
  } else {
    // TP2, TP3A, TP3B: Schriftsätze
    const tariff = getTariffBase(bmglCents, tpType as 'TP2' | 'TP3A' | 'TP3B');
    baseAmount = tariff.base;
    tariffLabel = tariff.label;
    traceText = `${tpLabel} bei ${(bmglCents / 100).toFixed(2)} €: ${(baseAmount / 100).toFixed(2)} €`;
  }

  lines.push({
    date: service.date,
    label: service.label || label,
    section: `RATG ${tpLabel} (§ 10 AHK)`,
    interval: tariffLabel,
    vatRate,
    amountCents: baseAmount,
    bmglCents,
    calculationTrace: traceText,
    serviceId: service.id,
  });
  basisBetrag += baseAmount;

  // Einheitssatz
  // TP 7/2 und Zuwarten: max einfacher ES
  const isZeitgebuehr = leistungType === 'STRAF_RATG_TP7_2' || leistungType === 'STRAF_ZUWARTEN';
  const cappedEsMultiplier = isZeitgebuehr ? Math.min(esMultiplier, 1) : esMultiplier;

  if (cappedEsMultiplier > 0) {
    const effectiveESRate = esRate * cappedEsMultiplier;
    const esAmount = Math.round(baseAmount * effectiveESRate);
    lines.push({
      date: service.date,
      label: `Einheitssatz ${(effectiveESRate * 100).toFixed(0)}%`,
      section: '§ 23 RATG',
      interval: tariffLabel,
      vatRate,
      amountCents: esAmount,
      bmglCents,
      calculationTrace: `${cappedEsMultiplier}× ES auf ${(baseAmount / 100).toFixed(2)} €`,
      serviceId: service.id,
    });
    basisBetrag += esAmount;
  }

  // ERV
  if (includeErv) {
    const ervAmount = ervRateOverride === 'initial' ? 500 : 260;
    lines.push({
      date: service.date,
      label: 'ERV-Beitrag (§ 23a RATG)',
      section: '§ 23a RATG',
      interval: '-',
      vatRate,
      amountCents: ervAmount,
      bmglCents: 0,
      calculationTrace: ervRateOverride === 'initial' ? 'Ersteinbringung: 5,00 €' : 'Folgeschriftsatz: 2,60 €',
      serviceId: service.id,
    });
  }

  return { lines, basisBetrag };
}

function getCourtLabel(courtType: CourtType): string {
  const labels: Record<CourtType, string> = {
    BG: 'Bezirksgericht',
    ER_GH: 'Einzelrichter GH',
    SCHOEFFEN: 'Schöffengericht',
    GESCHWORENEN: 'Geschworenengericht',
    HAFT: 'Haftverfahren',
  };
  return labels[courtType];
}

export { formatEuro } from './calculator';