import { LegalService, ServiceType, CalculatedLine, TotalResult } from '../types';
import { getTariffBase, getESRate, getGGGResult, getTP4, getTP4Verhandlung, TP4Variante, getTagsatzung, TagsatzungType } from './tariffs';
import { deriveGGGTarifpost, deriveGGGWithLabel } from './ggg-derive';
import { getGGG } from './ggg';

// Helper: Map ServiceType to TagsatzungType for HEARING calculations
function getTagsatzungTypeFromService(serviceType: ServiceType): TagsatzungType | null {
  if (serviceType === ServiceType.HEARING_TP2_II || serviceType === ServiceType.HEARING_TP2_II_INSOLVENCY) return 'TP2';
  if (serviceType === ServiceType.HEARING_TP3A_II) return 'TP3A';
  if (serviceType === ServiceType.HEARING_TP3B_II) return 'TP3B';
  if (serviceType === ServiceType.HEARING_TP3C_II || serviceType === ServiceType.HEARING_TP3C_III) return 'TP3C';
  return null;
}

export function calculateCosts(
  bmglCents: number, 
  services: LegalService[], 
  manualGggCents: number, 
  isVatFree: boolean,
  additionalParties: number,
  autoCalculateGGG: boolean,
  isVerbandsklage: boolean = false
): TotalResult {
  const lines: CalculatedLine[] = [];
  const currentVatRate = isVatFree ? 0 : 20;

  const partySurchargePercent = additionalParties === 1 ? 10 :
                                additionalParties === 2 ? 15 :
                                additionalParties === 3 ? 20 :
                                additionalParties === 4 ? 25 :
                                additionalParties === 5 ? 30 :
                                additionalParties >= 9 ? 50 : 0;

  // 1. GGG (Pauschalgebühr) - Immer USt-frei (vatRate: 0)
  if (services.length > 0 || manualGggCents > 0) {
    if (autoCalculateGGG) {
      const initiatingService = services.find(s => s.isInitiating) || services[0] || { date: new Date().toISOString() };
      // Dynamische GGG-Ableitung aus RATG-Leistungen (hoechste Instanz gewinnt)
      const derivedTP = deriveGGGTarifpost(services);
      const derivedInfo = deriveGGGWithLabel(services);
      const ggg = getGGG(derivedTP, bmglCents, partySurchargePercent);
      lines.push({
        date: initiatingService.date,
        label: `Pauschalgebühr (GGG ${derivedInfo.label})`,
        section: `GGG ${derivedInfo.label}`,
        interval: `${derivedInfo.instanz} - ${ggg.label}`,
        vatRate: 0,
        amountCents: ggg.total,
        bmglCents: bmglCents,
        calculationTrace: ggg.trace,
        serviceId: 'ggg'
      });
    } else if (manualGggCents > 0) {
      lines.push({
        date: services[0]?.date || new Date().toISOString(),
        label: "Pauschalgebühr (Manuell)",
        section: "Tarifpost 1 GGG",
        interval: "-",
        vatRate: 0,
        amountCents: manualGggCents * 100,
        bmglCents: bmglCents,
        calculationTrace: "Manuelle Eingabe",
        serviceId: 'ggg'
      });
    }
  }

  services.forEach(s => {
    // Service-spezifische Bemessungsgrundlage (customBmgl überschreibt Basis)
    const serviceBmglCents = s.customBmgl ? s.customBmgl * 100 : bmglCents;
    const serviceESRate = getESRate(serviceBmglCents);

    // Service-spezifische Streitgenossen (customParties überschreibt Basis)
    const serviceParties = s.customParties ?? additionalParties;
    const servicePartySurchargePercent = serviceParties === 1 ? 10 :
                                          serviceParties === 2 ? 15 :
                                          serviceParties === 3 ? 20 :
                                          serviceParties === 4 ? 25 :
                                          serviceParties === 5 ? 30 :
                                          serviceParties >= 9 ? 50 : 0;

    // Bei HEARINGs: durationHours = Anzahl halbe Stunden (nicht ganze Stunden!)
    const isHearing = s.type.includes('HEARING');
    const halbeStundenDauer = isHearing ? (s.durationHours || 2) : (s.durationHours || 1) * 2;
    const ganzeStundenDauer = Math.ceil(halbeStundenDauer / 2);

    let tpType: 'TP1' | 'TP2' | 'TP3A' | 'TP3B' | 'TP3C' | 'TP5' | 'TP6' = 'TP3A';
    let sectionLabel = "TP 3A Abs I";
    let baseESFactor = serviceESRate;

    const isPleading = s.type.startsWith('PLEADING');

    // Mapping der Tarifposten
    if (s.type === ServiceType.PLEADING_TP1) {
      tpType = 'TP1';
      sectionLabel = "TP 1";
      baseESFactor = serviceESRate;
    } else if (s.type === ServiceType.PLEADING_TP2 || s.type === ServiceType.HEARING_TP2_II || s.type === ServiceType.HEARING_TP2_II_INSOLVENCY || s.type === ServiceType.WAITING_TIME || s.type === ServiceType.CANCELLED_HEARING) {
      tpType = 'TP2';
      sectionLabel = "TP 2";
      baseESFactor = serviceESRate;
    } else if (s.type === ServiceType.PLEADING_TP3B || s.type === ServiceType.PLEADING_TP3B_IA || s.type === ServiceType.HEARING_TP3B_II) {
      tpType = 'TP3B';
      sectionLabel = s.type === ServiceType.HEARING_TP3B_II ? "TP 3B Abs II" : "TP 3B Abs I";
      baseESFactor = serviceESRate;
    } else if (s.type === ServiceType.PLEADING_TP3C || s.type === ServiceType.HEARING_TP3C_II || s.type === ServiceType.HEARING_TP3C_III) {
      tpType = 'TP3C';
      sectionLabel = s.type.includes('HEARING') ? "TP 3C Abs II" : "TP 3C Abs I";
      baseESFactor = serviceESRate;
    } else if (s.type === ServiceType.PLEADING_TP5) {
      tpType = 'TP5';
      sectionLabel = "TP 5";
      baseESFactor = 0;
    } else if (s.type === ServiceType.PLEADING_TP6) {
      tpType = 'TP6';
      sectionLabel = "TP 6";
      baseESFactor = 0;
    }

    // --- TP4 Strafsachen - FIXE Bemessungsgrundlagen (§ 10 RATG) ---
    const isTP4 = s.type.toString().includes('TP4');
    if (isTP4) {
      // TP4 verwendet fixe BG, nicht den eingegebenen Streitwert
      // Nur einfacher ES moeglich (§ 23 Abs 9 RATG)
      baseESFactor = 0.5; // Einfacher ES bei Strafsachen

      let tp4Variante: TP4Variante;
      const isHearing = s.type.toString().includes('HEARING');

      // Variante bestimmen
      if (s.type === ServiceType.PLEADING_TP4_PRIVATANKLAGE_BG || s.type === ServiceType.HEARING_TP4_PRIVATANKLAGE_BG) {
        tp4Variante = 'ANKLAGE_BG';
        sectionLabel = isHearing ? "TP 4/I/1a Verhandlung" : "TP 4/I/1a Schriftsatz";
      } else if (s.type === ServiceType.PLEADING_TP4_PRIVATANKLAGE_ANDERE || s.type === ServiceType.HEARING_TP4_PRIVATANKLAGE_ANDERE) {
        tp4Variante = 'ANKLAGE_ANDERE';
        sectionLabel = isHearing ? "TP 4/I/1b Verhandlung" : "TP 4/I/1b Schriftsatz";
      } else if (s.type === ServiceType.PLEADING_TP4_MEDIENGESETZ || s.type === ServiceType.HEARING_TP4_MEDIENGESETZ) {
        tp4Variante = 'MEDIENGESETZ';
        sectionLabel = isHearing ? "TP 4/I/2 Verhandlung" : "TP 4/I/2 Schriftsatz";
      } else if (s.type === ServiceType.PLEADING_TP4_PRIVATBET_BG || s.type === ServiceType.HEARING_TP4_PRIVATBET_BG) {
        tp4Variante = 'PRIV_BG';
        sectionLabel = isHearing ? "TP 4/II Verhandlung" : "TP 4/II Schriftsatz";
      } else if (s.type === ServiceType.PLEADING_TP4_PRIVATBET_ANDERE || s.type === ServiceType.HEARING_TP4_PRIVATBET_ANDERE) {
        tp4Variante = 'PRIV_ANDERE';
        sectionLabel = isHearing ? "TP 4/II Verhandlung" : "TP 4/II Schriftsatz";
      } else {
        // AUSGESCHL_OEFF - verwendet Streitwert (variabel)
        tp4Variante = 'ANKLAGE_ANDERE'; // Fallback
        sectionLabel = isHearing ? "TP 4/III Verhandlung" : "TP 4/III Schriftsatz";
      }

      let tp4Result;
      if (isHearing) {
        // Bei HEARINGs ist durationHours bereits in halben Stunden
        tp4Result = getTP4Verhandlung(tp4Variante, halbeStundenDauer, false, s.date);
      } else {
        tp4Result = getTP4(tp4Variante, 'ANKLAGE', undefined, s.date);
      }

      const tp4Amount = tp4Result.amount;
      const tp4Trace = tp4Result.trace;

      // TP4 direkt ausgeben und weitere Verarbeitung ueberspringen
      lines.push({
        date: s.date,
        label: s.label,
        section: sectionLabel,
        interval: tp4Result.label,
        vatRate: currentVatRate,
        amountCents: tp4Amount,
        bmglCents: serviceBmglCents,
        calculationTrace: tp4Trace,
        serviceId: s.id
      });

      // ES nur wenn esMultiplier > 0 (bei TP4 max. einfacher ES)
      if (s.esMultiplier > 0) {
        const effectiveESRate = 0.5 * s.esMultiplier; // Einfacher ES = 50%
        const esAmount = Math.round(tp4Amount * effectiveESRate);
        lines.push({
          date: s.date,
          label: `Einheitssatz ${(effectiveESRate * 100).toFixed(0)}% (§ 23 Abs 9)`,
          section: "§ 23 RATG",
          interval: "Strafsachen: nur einfacher ES",
          vatRate: currentVatRate,
          amountCents: esAmount,
          bmglCents: serviceBmglCents,
          calculationTrace: `TP4 Strafsachen: max. einfacher ES (§ 23 Abs 9 RATG)`,
          serviceId: s.id
        });
      }

      // ERV-Beitrag bei Schriftsaetzen
      if (isPleading && s.includeErv) {
        const isInitialRate = s.ervRateOverride === 'initial' || (s.ervRateOverride === undefined && s.isInitiating);
        const ervAmount = isInitialRate ? 500 : 260;
        lines.push({
          date: s.date,
          label: "ERV-Beitrag (§ 23a RATG)",
          section: "§ 23a RATG",
          interval: "-",
          vatRate: currentVatRate,
          amountCents: ervAmount,
          bmglCents: 0,
          calculationTrace: isInitialRate ? "Ersteinbringungssatz: 5,00 €" : "Regulärer Satz: 2,60 €",
          serviceId: s.id
        });
      }

      return; // TP4 abgeschlossen, keine Standard-Verarbeitung
    }

    // --- HEARING-Verarbeitung (ES auf Entlohnung + Wartezeit) ---
    const tsType = getTagsatzungTypeFromService(s.type);
    if (tsType) {
      // HEARING: Berechnung via getTagsatzung (Entlohnung + Wartezeit)
      const halbeStundenWartezeit = s.waitingUnits || 0;
      const tsResult = getTagsatzung(serviceBmglCents, tsType, halbeStundenDauer, halbeStundenWartezeit, s.date);
      const tariff = getTariffBase(serviceBmglCents, tsType);

      // 1. Entlohnung
      lines.push({
        date: s.date,
        label: s.label,
        section: `${tsType} Abs II`,
        interval: tariff.label,
        vatRate: currentVatRate,
        amountCents: tsResult.entlohnung,
        bmglCents: serviceBmglCents,
        calculationTrace: `Entlohnung (${halbeStundenDauer} × ½ Std): ${(tsResult.entlohnung / 100).toFixed(2)} €`,
        serviceId: s.id
      });

      // 2. Wartezeit (falls > 0)
      if (tsResult.wartezeit > 0) {
        lines.push({
          date: s.date,
          label: `Wartezeit (${halbeStundenWartezeit} × ½ Std)`,
          section: `${tsType} Wartezeit`,
          interval: tariff.label,
          vatRate: currentVatRate,
          amountCents: tsResult.wartezeit,
          bmglCents: serviceBmglCents,
          calculationTrace: `Wartezeit: ${halbeStundenWartezeit} × ½ Std (1. frei) = ${(tsResult.wartezeit / 100).toFixed(2)} €`,
          serviceId: s.id
        });
      }

      // 3. ES auf (Entlohnung + Wartezeit)
      const basisFuerES = tsResult.entlohnung + tsResult.wartezeit;
      const baseRate = s.customESRate !== undefined ? s.customESRate : serviceESRate;
      const effectiveESRate = baseRate * s.esMultiplier;
      const esAmount = Math.round(basisFuerES * effectiveESRate);

      if (s.esMultiplier > 0) {
        lines.push({
          date: s.date,
          label: `Einheitssatz ${(effectiveESRate * 100).toFixed(0)}%`,
          section: "§ 23 RATG",
          interval: tariff.label,
          vatRate: currentVatRate,
          amountCents: esAmount,
          bmglCents: serviceBmglCents,
          calculationTrace: `ES auf (Entlohnung + Wartezeit): ${s.esMultiplier}x ${(baseRate * 100).toFixed(0)}% von ${(basisFuerES / 100).toFixed(2)} €`,
          serviceId: s.id
        });
      }

      // 4. Streitgenossen auf (Entlohnung + Wartezeit + ES)
      const verdienst = basisFuerES + esAmount;
      if (servicePartySurchargePercent > 0) {
        const surchargeAmount = Math.round(verdienst * (servicePartySurchargePercent / 100));
        lines.push({
          date: s.date,
          label: `${servicePartySurchargePercent}% Streitgenossenzuschlag`,
          section: "§ 15 RATG",
          interval: `${serviceParties} weitere Pers.`,
          vatRate: currentVatRate,
          amountCents: surchargeAmount,
          bmglCents: serviceBmglCents,
          calculationTrace: `${servicePartySurchargePercent}% von ${(verdienst / 100).toFixed(2)} €`,
          serviceId: s.id
        });
      }

      return; // HEARING abgeschlossen, keine Standard-Verarbeitung
    }

    const tariff = getTariffBase(serviceBmglCents, tpType === 'TP5' || tpType === 'TP6' ? tpType : (tpType as any));
    let finalBaseAmountCents = tariff.base;
    let trace = tariff.trace;

    // --- TP 3C & 3B Schriftsatz-Deckel (Verbandsklage Abs IV / III) ---
    if (isVerbandsklage) {
      if (s.type === ServiceType.PLEADING_TP3C) {
        const vkCap = 318260;
        if (finalBaseAmountCents > vkCap) {
          finalBaseAmountCents = vkCap;
          trace += `\n(Gekappt gem. TP 3C Abs IV: 3.182,60 €)`;
        }
      } else if (s.type === ServiceType.PLEADING_TP3B || s.type === ServiceType.PLEADING_TP3B_IA) {
        const vkCap = 265150;
        if (finalBaseAmountCents > vkCap) {
          finalBaseAmountCents = vkCap;
          trace += `\n(Gekappt gem. TP 3B Abs III: 2.651,50 €)`;
        }
      }
    }

    // --- TP 3B Ia (50% rule) - entweder via ServiceType ODER via is473aZPO Flag ---
    if (s.type === ServiceType.PLEADING_TP3B_IA || (s.type === ServiceType.PLEADING_TP3B && s.is473aZPO)) {
      finalBaseAmountCents = Math.round(finalBaseAmountCents * 0.5);
      sectionLabel = "TP 3B Abs Ia";
      trace += `\nHalbe Entlohnung gem. TP 3B Abs Ia (§ 473a ZPO)`;
    }

    // --- TP 3C & 3B Verhandlung (Stundenlogik inkl. Abs IV Caps) ---
    if (s.type === ServiceType.HEARING_TP3B_II || s.type === ServiceType.HEARING_TP3C_II || s.type === ServiceType.HEARING_TP3C_III) {
      const isTP3C = s.type.includes('TP3C');
      let capFirst = isTP3C ? 3115580 : 2596320;
      let capSubsequent = isTP3C ? 1557800 : 1298180;

      if (isVerbandsklage) {
        capFirst = isTP3C ? 318260 : 265150;
        capSubsequent = isTP3C ? 159130 : 132580;
      }

      const firstHourAmount = Math.min(tariff.base, capFirst);
      // Bei HEARINGs: ganzeStundenDauer bereits berechnet aus halben Stunden
      const hours = ganzeStundenDauer;
      let totalAmount = firstHourAmount;
      trace = `Stundenlogik ${isTP3C ? 'TP 3C' : 'TP 3B'} (${halbeStundenDauer} × ½ Std = ${hours} Std):\n1. Std: ${(firstHourAmount/100).toFixed(2)} € (Deckel ${(capFirst/100).toFixed(2)})`;

      if (hours > 1) {
        const subsequentHourlyRate = Math.min(Math.round(tariff.base / 2), capSubsequent);
        totalAmount += (hours - 1) * subsequentHourlyRate;
        trace += `\n${hours-1} x Folgestd: ${(subsequentHourlyRate/100).toFixed(2)} € (Deckel ${(capSubsequent/100).toFixed(2)})`;
      }

      if (s.type === ServiceType.HEARING_TP3C_III) {
        totalAmount *= 2;
        sectionLabel = "TP 3C Abs III (EuGH)";
        trace += `\nEU-Verdoppelung gem. TP 3C Abs III`;
      }

      finalBaseAmountCents = totalAmount;
    }

    if (isVerbandsklage && s.type === ServiceType.PLEADING_TP3A_I) {
      const vkCap = 212370;
      if (finalBaseAmountCents > vkCap) {
        finalBaseAmountCents = vkCap;
        trace += `\n(Gekappt gem. TP 3A Abs IV: 2.123,70 €)`;
      }
    }

    if (s.type === ServiceType.HEARING_TP3A_II || s.type === ServiceType.INSPECTION_TP3A_III) {
      sectionLabel = s.type === ServiceType.HEARING_TP3A_II ? "TP 3A Abs II" : "TP 3A Abs III";
      let capFirst = 1386020;
      let capSubsequent = 693020;
      if (isVerbandsklage) {
        capFirst = 212370;
        capSubsequent = 106190;
      }
      const firstHourAmount = Math.min(tariff.base, capFirst);
      // Bei HEARINGs: ganzeStundenDauer bereits berechnet aus halben Stunden
      const hours = ganzeStundenDauer;
      let totalAmount = firstHourAmount;
      trace = `Stundenlogik TP 3A (${halbeStundenDauer} × ½ Std = ${hours} Std):\n1. Std: ${(firstHourAmount/100).toFixed(2)} € (Deckel ${(capFirst/100).toFixed(2)})`;
      if (hours > 1) {
        const subsequentHourlyRate = Math.min(Math.round(tariff.base / 2), capSubsequent);
        totalAmount += (hours - 1) * subsequentHourlyRate;
        trace += `\n${hours-1} x Folgestd: ${(subsequentHourlyRate/100).toFixed(2)} € (Deckel ${(capSubsequent/100).toFixed(2)})`;
      }
      finalBaseAmountCents = totalAmount;
    }

    const isUnderTP3 = s.type === ServiceType.WAITING_TIME || s.type === ServiceType.CANCELLED_HEARING;
    if (isUnderTP3) {
      const units = s.waitingUnits || 1;
      const isTP3Leistung = s.label.includes('TP3') || s.id.includes('tp3');
      
      if (s.type === ServiceType.WAITING_TIME) {
        const cap = isTP3Leistung ? 1790 : 600;
        const ratePerUnit = Math.min(Math.round(tariff.base * 0.25), cap); 
        finalBaseAmountCents = units * ratePerUnit;
        trace = `Zuwarten: ${units} x ${(ratePerUnit/100).toFixed(2)} € (${isTP3Leistung ? 'TP 3 Anm 2' : 'TP 2 Anm 15'} Deckel)`;
        sectionLabel = isTP3Leistung ? "TP 3 Anmerkung 2" : "TP 2 Anmerkung 2";
      } else {
        const cap = isTP3Leistung ? 3510 : 1190;
        finalBaseAmountCents = Math.min(Math.round(tariff.base * 0.5), cap); 
        trace = `Abberaumt: ${(finalBaseAmountCents/100).toFixed(2)} € (${isTP3Leistung ? 'TP 3 Anm 3' : 'TP 2 Anm 3'} Deckel)`;
        sectionLabel = isTP3Leistung ? "TP 3 Anmerkung 3" : "TP 2 Anmerkung 3";
      }
    }

    if (s.type === ServiceType.HEARING_TP2_II) {
      sectionLabel = "TP 2 Abs II";
    }

    // 1. Basisleistung (Steuerpflichtig)
    lines.push({
      date: s.date,
      label: s.label,
      section: sectionLabel,
      interval: tariff.label,
      vatRate: currentVatRate,
      amountCents: finalBaseAmountCents,
      bmglCents: serviceBmglCents,
      calculationTrace: trace,
      serviceId: s.id
    });

    let currentBlockVerdienst = finalBaseAmountCents;

    // 2. Verbindungsgebühr (e.V.) - nur für Schriftsätze
    const verbindungPercent = s.verbindung === 'vorab' ? 50 : s.verbindung === 'wohnort' ? 10 : s.verbindung === 'andere' ? 25 : 0;
    if (verbindungPercent > 0 && isPleading) {
      const verbindungAmount = Math.round(finalBaseAmountCents * verbindungPercent / 100);
      lines.push({
        date: s.date,
        label: `Verbindungsgebühr ${verbindungPercent}%`,
        section: "§ 23 RATG",
        interval: s.verbindung === 'vorab' ? 'Vorabentscheidung' : s.verbindung === 'wohnort' ? 'e.V. Wohnort' : 'e.V. andere',
        vatRate: currentVatRate,
        amountCents: verbindungAmount,
        bmglCents: serviceBmglCents,
        calculationTrace: `${verbindungPercent}% von ${(finalBaseAmountCents/100).toFixed(2)} €`,
        serviceId: s.id
      });
      currentBlockVerdienst += verbindungAmount;
    }

    // 3. Einheitssatz (ES) auf (Entlohnung + Verbindung)
    const baseRate = s.customESRate !== undefined ? s.customESRate : baseESFactor;
    const effectiveESRate = baseRate * s.esMultiplier;
    const esAmount = Math.round(currentBlockVerdienst * effectiveESRate);

    if (s.esMultiplier > 0 && baseESFactor > 0) {
      lines.push({
        date: s.date,
        label: `Einheitssatz ${(effectiveESRate * 100).toFixed(0)}%`,
        section: "§ 23 RATG",
        interval: tariff.label,
        vatRate: currentVatRate,
        amountCents: esAmount,
        bmglCents: serviceBmglCents,
        calculationTrace: `${s.esMultiplier}x ${(baseRate*100).toFixed(0)}% von ${(currentBlockVerdienst/100).toFixed(2)} €`,
        serviceId: s.id
      });
      currentBlockVerdienst += esAmount;
    }

    // 4. Streitgenossenzuschlag auf (Entlohnung + Verbindung + ES)
    if (servicePartySurchargePercent > 0) {
      const surchargeAmount = Math.round(currentBlockVerdienst * (servicePartySurchargePercent / 100));
      lines.push({
        date: s.date,
        label: `${servicePartySurchargePercent}% Streitgenossenzuschlag`,
        section: "§ 15 RATG",
        interval: `${serviceParties} weitere Pers.`,
        vatRate: currentVatRate,
        amountCents: surchargeAmount,
        bmglCents: serviceBmglCents,
        calculationTrace: `${servicePartySurchargePercent}% von ${(currentBlockVerdienst/100).toFixed(2)} € (10-Cent-Rundung)`,
        serviceId: s.id
      });
    }

    // 4. ERV-Beitrag gemäß § 23a RATG (Steuerpflichtig gemäß User-Vorgabe)
    if (isPleading && s.includeErv) {
      // Manuelle Auswahl oder automatische Ermittlung basierend auf isInitiating
      const isInitialRate = s.ervRateOverride === 'initial' || (s.ervRateOverride === undefined && s.isInitiating);
      const ervAmount = isInitialRate ? 500 : 260; // 5,00 € vs 2,60 €
      lines.push({
        date: s.date,
        label: "ERV-Beitrag (§ 23a RATG)",
        section: "§ 23a RATG",
        interval: "-",
        vatRate: currentVatRate, 
        amountCents: ervAmount,
        bmglCents: 0,
        calculationTrace: isInitialRate ? "Ersteinbringungssatz: 5,00 €" : "Regulärer Satz (Folge/Übernahme): 2,60 €",
        serviceId: s.id
      });
    }
  });

  // Zusammenfassung
  // Honorar + ERV (Netto-Bemessung) - Alle Positionen außer GGG
  const netSumCents = lines.filter(l => l.serviceId !== 'ggg').reduce((sum, l) => sum + l.amountCents, 0);
  // GGG (Barauslagen) - Nur Positionen mit serviceId 'ggg'
  const gggSumCents = lines.filter(l => l.serviceId === 'ggg').reduce((sum, l) => sum + l.amountCents, 0);
  // USt nur auf steuerpflichtige Honorar-Zeilen berechnen (vatRate > 0)
  const taxableSumCents = lines.filter(l => l.vatRate > 0).reduce((sum, l) => sum + l.amountCents, 0);
  const vatSumCents = Math.round(taxableSumCents * 0.20);
  
  return {
    lines,
    netCents: netSumCents,
    vatCents: vatSumCents,
    gggCents: gggSumCents,
    totalCents: netSumCents + vatSumCents + gggSumCents
  };
}

export function formatEuro(cents: number): string {
  return (cents / 100).toLocaleString('de-AT', {
    style: 'currency',
    currency: 'EUR',
  });
}