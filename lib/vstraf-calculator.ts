/**
 * ============================================================================
 * V-Straf-Calculator - AHK § 13 Kostenberechnung Verwaltungsstrafsachen
 * ============================================================================
 *
 * Rechtsgrundlage: AHK § 13
 * - Abs 1: BMGL nach angedrohter Geldstrafe
 * - Abs 3: Verfallswert erhöht BMGL
 * - Abs 4: Bei Rechtsmitteln nur wegen Strafhöhe → reduzierter Tarif
 */

import {
  AHK_TARIFE,
  calculateStrafTagsatzung,
  calculateStrafStreitgenossen,
  calculateErfolgszuschlag,
} from './ahk';
import { getTariffBase, getESRate, getKommission } from './tariffs';
import { VStrafService, VStrafLeistungType, VStrafStufe, CalculatedLine, TotalResult } from '../types';
import {
  VSTRAF_BEMESSUNGSGRUNDLAGEN,
  VSTRAF_LEISTUNG_LABELS,
  getVStrafCourtType,
  isVStrafTagsatzung,
  isNurStrafhoehe,
  VStrafCourtType,
} from './vstraf-catalog';

export interface VStrafCalculationParams {
  stufe: VStrafStufe;
  verfallswert: number;  // In Cents, wird zu BMGL addiert (§ 13 Abs 3)
  services: VStrafService[];
  streitgenossen: number;
  erfolgszuschlagProzent: number;
  isVatFree: boolean;
}

/**
 * Berechnet die Kosten für Verwaltungsstrafsachen nach AHK § 13
 */
export function calculateVStrafCosts(params: VStrafCalculationParams): TotalResult {
  const {
    stufe,
    verfallswert,
    services,
    streitgenossen,
    erfolgszuschlagProzent,
    isVatFree,
  } = params;

  const lines: CalculatedLine[] = [];
  const currentVatRate = isVatFree ? 0 : 20;

  // BMGL = Basis nach Stufe + Verfallswert (§ 13 Abs 3)
  const baseBmgl = VSTRAF_BEMESSUNGSGRUNDLAGEN[stufe];
  const bmglCents = baseBmgl + verfallswert;

  // CourtType für AHK_TARIFE
  const courtType = getVStrafCourtType(stufe);

  // ES-Rate für RATG-Leistungen
  const esRate = getESRate(bmglCents);

  // Sammle Basis für Streitgenossen und Erfolgszuschlag
  let totalBasisFuerZuschlaege = 0;

  services.forEach(s => {
    const result = calculateSingleVStrafLeistung(
      s,
      courtType,
      bmglCents,
      esRate,
      currentVatRate
    );

    lines.push(...result.lines);
    totalBasisFuerZuschlaege += result.basisBetrag;
  });

  // Streitgenossenzuschlag (30% pro Person)
  if (streitgenossen > 0 && totalBasisFuerZuschlaege > 0) {
    const sg = calculateStrafStreitgenossen(totalBasisFuerZuschlaege, streitgenossen);
    if (sg.amount > 0) {
      lines.push({
        date: services[0]?.date || new Date().toISOString().split('T')[0],
        label: `Streitgenossenzuschlag (${sg.percent}%)`,
        section: '§ 13 AHK iVm § 10 Abs 3 AHK',
        interval: `${streitgenossen} × 30%`,
        vatRate: currentVatRate,
        amountCents: sg.amount,
        bmglCents: totalBasisFuerZuschlaege,
        calculationTrace: sg.trace,
        serviceId: 'vstraf_sg',
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
        section: '§ 13 AHK',
        interval: 'Erfolg',
        vatRate: currentVatRate,
        amountCents: erfolg.amount,
        bmglCents: totalBasisFuerZuschlaege,
        calculationTrace: erfolg.trace,
        serviceId: 'vstraf_erfolg',
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
  basisBetrag: number;
}

/**
 * Berechnet eine einzelne V-Straf-Leistung
 */
function calculateSingleVStrafLeistung(
  service: VStrafService,
  courtType: VStrafCourtType,
  bmglCents: number,
  esRate: number,
  vatRate: number
): SingleLeistungResult {
  const lines: CalculatedLine[] = [];
  let basisBetrag = 0;

  const label = VSTRAF_LEISTUNG_LABELS[service.leistungType];
  const { leistungType, durationHalbeStunden, esMultiplier, includeErv, ervRateOverride, isNurStrafhoehe: serviceNurStrafhoehe } = service;

  // Prüfe ob "nur Strafhöhe" (§ 13 Abs 4)
  const nurStrafhoehe = serviceNurStrafhoehe || isNurStrafhoehe(leistungType);

  // =========================================================================
  // VERHANDLUNGEN (§ 13 → § 9 sinngemäß)
  // =========================================================================

  if (isVStrafTagsatzung(leistungType)) {
    const tarife = AHK_TARIFE[courtType];
    if (!tarife) return { lines, basisBetrag };

    let tagsatzungResult: { amount: number; trace: string } | null = null;

    // Wähle Tarif basierend auf Leistungstyp
    if (leistungType === 'VSTRAF_VH_1_INSTANZ') {
      // VH 1. Instanz → hv1Instanz Tarif
      tagsatzungResult = calculateStrafTagsatzung(tarife.hv1Instanz, durationHalbeStunden);
    } else if (leistungType === 'VSTRAF_BERUFUNG_VH_VOLL') {
      // Berufungs-VH (voll) → berufungVhVoll oder berufungVh
      const berufungTarif = tarife.berufungVhVoll || tarife.berufungVh;
      if (berufungTarif) {
        tagsatzungResult = calculateStrafTagsatzung(berufungTarif, durationHalbeStunden);
      }
    } else if (leistungType === 'VSTRAF_BERUFUNG_VH_STRAFE') {
      // Berufungs-VH nur Strafhöhe (§ 13 Abs 4) → berufungVhStrafe oder reduziert
      const strafeTarif = tarife.berufungVhStrafe || tarife.berufungVh;
      if (strafeTarif) {
        tagsatzungResult = calculateStrafTagsatzung(strafeTarif, durationHalbeStunden);
      }
    }

    if (tagsatzungResult) {
      lines.push({
        date: service.date,
        label: service.label || label,
        section: `§ 13 AHK (§ 9 sinngemäß)`,
        interval: getCourtLabel(courtType),
        vatRate,
        amountCents: tagsatzungResult.amount,
        bmglCents: 0,
        calculationTrace: tagsatzungResult.trace + (nurStrafhoehe ? ' (nur Strafhöhe)' : ''),
        serviceId: service.id,
      });
      basisBetrag += tagsatzungResult.amount;

      // Einheitssatz
      if (esMultiplier > 0) {
        const cappedEs = Math.min(esMultiplier, 1); // Max einfach für VH
        const effectiveESRate = esRate * cappedEs;
        const esAmount = Math.round(tagsatzungResult.amount * effectiveESRate);
        lines.push({
          date: service.date,
          label: `Einheitssatz ${(effectiveESRate * 100).toFixed(0)}%`,
          section: '§ 23 RATG (sinngemäß)',
          interval: '-',
          vatRate,
          amountCents: esAmount,
          bmglCents: 0,
          calculationTrace: `${cappedEs}× ES auf ${(tagsatzungResult.amount / 100).toFixed(2)} €`,
          serviceId: service.id,
        });
        basisBetrag += esAmount;
      }
    }

    return { lines, basisBetrag };
  }

  // =========================================================================
  // SCHRIFTSÄTZE (§ 13 → § 9 sinngemäß)
  // =========================================================================

  if (leistungType === 'VSTRAF_BESCHWERDE_VOLL' || leistungType === 'VSTRAF_BESCHWERDE_STRAFE') {
    const tarife = AHK_TARIFE[courtType];
    if (!tarife) return { lines, basisBetrag };

    // Beschwerde → berufungVoll oder berufungStrafe oder berufung
    let beschwerdeAmount: number;
    if (nurStrafhoehe && tarife.berufungStrafe) {
      beschwerdeAmount = tarife.berufungStrafe;
    } else if (tarife.berufungVoll) {
      beschwerdeAmount = tarife.berufungVoll;
    } else if (tarife.berufung) {
      beschwerdeAmount = tarife.berufung;
    } else {
      // Fallback: TP 3B
      const tp3b = getTariffBase(bmglCents, 'TP3B');
      beschwerdeAmount = tp3b.base;
    }

    lines.push({
      date: service.date,
      label: service.label || label,
      section: `§ 13 AHK (§ 9 sinngemäß)`,
      interval: getCourtLabel(courtType),
      vatRate,
      amountCents: beschwerdeAmount,
      bmglCents: 0,
      calculationTrace: `Beschwerde ${nurStrafhoehe ? '(nur Strafhöhe)' : '(voll)'}: ${(beschwerdeAmount / 100).toFixed(2)} €`,
      serviceId: service.id,
    });
    basisBetrag += beschwerdeAmount;

    // Einheitssatz (bis vierfach für Schriftsätze)
    if (esMultiplier > 0) {
      const effectiveESRate = esRate * esMultiplier;
      const esAmount = Math.round(beschwerdeAmount * effectiveESRate);
      lines.push({
        date: service.date,
        label: `Einheitssatz ${(effectiveESRate * 100).toFixed(0)}%`,
        section: '§ 23 RATG (sinngemäß)',
        interval: '-',
        vatRate,
        amountCents: esAmount,
        bmglCents: 0,
        calculationTrace: `${esMultiplier}× ES auf ${(beschwerdeAmount / 100).toFixed(2)} €`,
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

  // =========================================================================
  // RATG LEISTUNGEN (§ 10 sinngemäß)
  // =========================================================================

  if (leistungType.startsWith('VSTRAF_RATG') || leistungType === 'VSTRAF_ZUWARTEN') {
    let tpType: 'TP2' | 'TP3A' | 'TP3B' = 'TP3A';
    let tpLabel = 'TP 3A';

    switch (leistungType) {
      case 'VSTRAF_RATG_TP2':
        tpType = 'TP2';
        tpLabel = 'TP 2';
        break;
      case 'VSTRAF_RATG_TP3A':
        tpType = 'TP3A';
        tpLabel = 'TP 3A';
        break;
      case 'VSTRAF_RATG_TP3B':
        tpType = 'TP3B';
        tpLabel = 'TP 3B';
        break;
      case 'VSTRAF_RATG_TP7_2':
      case 'VSTRAF_ZUWARTEN':
        tpLabel = 'TP 7/2';
        break;
    }

    let baseAmount = 0;
    let tariffLabel = '';
    let traceText = '';

    // TP 7/2: Kommission
    if (leistungType === 'VSTRAF_RATG_TP7_2' || leistungType === 'VSTRAF_ZUWARTEN') {
      const halbeStunden = Math.max(1, durationHalbeStunden || 1);
      const kommResult = getKommission(bmglCents, halbeStunden, 0, true);
      baseAmount = kommResult.kommission;
      tariffLabel = `BMGL € ${(bmglCents / 100).toLocaleString('de-AT')}`;
      traceText = `${tpLabel} (${halbeStunden} × ½ Std.) bei ${tariffLabel}: ${(baseAmount / 100).toFixed(2)} €`;
    } else {
      // TP2, TP3A, TP3B
      const tariff = getTariffBase(bmglCents, tpType);
      baseAmount = tariff.base;
      tariffLabel = tariff.label;
      traceText = `${tpLabel} bei ${(bmglCents / 100).toFixed(2)} €: ${(baseAmount / 100).toFixed(2)} €`;
    }

    lines.push({
      date: service.date,
      label: service.label || label,
      section: `RATG ${tpLabel} (§ 13 AHK)`,
      interval: tariffLabel,
      vatRate,
      amountCents: baseAmount,
      bmglCents,
      calculationTrace: traceText,
      serviceId: service.id,
    });
    basisBetrag += baseAmount;

    // Einheitssatz (TP 7/2: max einfach)
    const isZeitgebuehr = leistungType === 'VSTRAF_RATG_TP7_2' || leistungType === 'VSTRAF_ZUWARTEN';
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

  return { lines, basisBetrag };
}

function getCourtLabel(courtType: VStrafCourtType): string {
  const labels: Record<VStrafCourtType, string> = {
    BG: 'Bezirksgericht',
    ER_GH: 'Einzelrichter GH',
    SCHOEFFEN: 'Schöffengericht',
    GESCHWORENEN: 'Geschworenengericht',
  };
  return labels[courtType];
}

export { formatEuro } from './calculator';
