
/**
 * Logik zur Ermittlung der Bemessungsgrundlage (Streitwert)
 * gemäß §§ 9, 10 RATG und §§ 5, 9, 10, 13, 22 AHK.
 */

export interface ValuationParams {
  monthly?: number;
  rent?: number;
  type?: 'small' | 'mid' | 'large' | 'A' | 'B' | 'C';
  kfz?: boolean;
  media?: boolean;
  intensity?: 'simple' | 'average' | 'significant';
  assetValue?: number; // Wert verfallener Gegenstände oder zivilrechtlicher Anspruch
  years?: number;
  courtType?: 'BG' | 'LG_SINGLE' | 'LG_PANEL' | 'LG_JURY' | 'ND' | 'RM';
  vStrafCategory?: 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5' | 'Z6';
  isRMStrafhoeheOnly?: boolean; // § 13 Abs 4: Nur Strafhöhe bekämpft?
  sumPenalties?: number; // § 13 Abs 2: Summe angedrohter Strafen
}

export function calculateValuation(category: string, params: ValuationParams): number {
  let result = 0;

  // Hilfsfunktion für § 13 AHK Logik
  const getVStrafBase = (sum: number) => {
    if (sum <= 730) return 2120;
    if (sum <= 2180) return 10610;
    return 21220;
  };

  switch (category) {
    // --- RATG ZIVIL ---
    // § 9 Abs 1 RATG: Unterhalt - Das Dreifache der Jahresleistung (36 Monate)
    case 'p9_1': result = (params.monthly || 0) * 36; break;
    
    // § 10 Z 1 RATG: Besitzstörung. Regelfall 800 €, KFZ/Parken 40 €
    case 'p10_1': result = params.kfz ? 40 : 800; break;
    
    // § 10 Z 2 RATG: Bestandsachen (Miete/Pacht)
    // A: Bestehen/Zinshöhe -> Einjahreswert (12 Monate)
    // B: Räumung -> 1.500 € (fix)
    // C: Kündigung -> 1.000 € (fix)
    case 'p10_2':
      if (params.type === 'A') result = (params.monthly || 0) * 12;
      else if (params.type === 'B') result = 1500;
      else if (params.type === 'C') result = 1000;
      else result = 1500; // Default Räumung
      break;
      
    case 'p10_3': result = 36000; break;
    
    // § 10 Z 6a RATG: Arbeitsrecht (z.B. Kündigungsanfechtung)
    // Oft 36 Monate oder gedeckelter Wert. Standardwert 24.000 € falls nicht bezifferbar.
    case 'p10_6a': 
      if (params.monthly && params.monthly > 0) result = params.monthly * 36; 
      else result = 24000; 
      break;

    // --- RATG STRAF (§ 10 Abs 1) ---
    case 'p10_straf':
      if (params.courtType === 'BG') result = 7800;
      else if (params.courtType === 'LG_SINGLE') result = 18000;
      else if (params.courtType === 'LG_PANEL') result = 27600;
      else if (params.courtType === 'LG_JURY') result = 33200;
      else result = 18000;
      break;

    // --- AHK STRAF (§ 9, 10, 22) ---
    case 'ahk_9':
      if (params.courtType === 'BG') result = 2120;
      else if (params.courtType === 'LG_SINGLE') result = 10610;
      else if (params.courtType === 'LG_PANEL' || params.courtType === 'LG_JURY' || params.courtType === 'RM') result = 21220;
      else result = 10610;
      break;
    
    case 'ahk_10':
      if (params.assetValue && params.assetValue > 0) result = params.assetValue;
      else {
        if (params.courtType === 'BG') result = 2120;
        else if (params.courtType === 'LG_SINGLE') result = 10610;
        else result = 21220;
      }
      break;

    case 'ahk_22': result = 10610; break;

    // --- AHK VERWALTUNGSSTRAF (§ 13) ---
    case 'ahk_13':
      let baseVal = getVStrafBase(params.sumPenalties || 0);
      baseVal += (params.assetValue || 0);
      result = baseVal;
      break;

    // --- AHK ZIVIL (§ 5) ---
    case 'ahk_5_1': result = 5500; break;
    case 'ahk_5_2': result = 9300; break;
    case 'ahk_5_3': result = 17300; break;
    case 'ahk_5_4': 
      result = params.type === 'large' ? 286700 : params.type === 'mid' ? 34600 : 9300; 
      break;
    case 'ahk_5_5': result = 57000; break;
    
    // AHK § 5 Z 6: Bestandsachen -> Dreijahreswert (36 Monate)
    case 'ahk_5_6': result = (params.monthly || 0) * 36; if (result === 0) result = 9300; break;
    
    case 'ahk_5_7': result = 9300; break;
    
    // AHK § 5 Z 8: Dienstrecht -> Dreijahreswert (36 Monate)
    case 'ahk_5_8': result = (params.monthly || 0) * 36; break;
    
    case 'ahk_5_9': result = 17300; break;
    case 'ahk_5_10': result = 5500; break;
    case 'ahk_5_11': result = 17300; break;
    case 'ahk_5_12': result = 17300; break;
    case 'ahk_5_13': result = 17300; break;
    case 'ahk_5_14': result = 57000; break;
    case 'ahk_5_15': result = 7200; break;
    case 'ahk_5_16': result = 17300; break;
    case 'ahk_5_17': result = 34600; break;
    case 'ahk_5_18': result = 57000; break;
    case 'ahk_5_19': result = 14000; break;
    case 'ahk_5_20': result = 7200; break;
    case 'ahk_5_21': result = params.assetValue || 0; break;
    case 'ahk_5_22': result = 11000; break;
    case 'ahk_5_23': result = 14000; break;
    case 'ahk_5_24': result = 7200; break;
    case 'ahk_5_25': result = 9300; break;
    case 'ahk_5_26': result = 14000; break;
    case 'ahk_5_27': result = 9300; break;
    case 'ahk_5_28': result = 17300; break;
    case 'ahk_5_29': result = 57000; break;
    case 'ahk_5_30': result = 14000; break;
    case 'ahk_5_31': result = params.assetValue || 0; break;
    case 'ahk_5_32': result = 17300; break;
    case 'ahk_5_33': result = 9300; break;
    case 'ahk_5_34': result = params.intensity === 'significant' ? 55500 : 21200; break;
    case 'ahk_5_35': result = 34600; break;
    case 'ahk_5_36': result = 21200; break;
    case 'ahk_5_37': result = 21200; break;

    default: result = 0;
  }

  return result;
}

export function getValuationDisclaimer(category: string): string {
  if (category === 'p9_1') return '§ 9 Abs 1 RATG: Unterhaltssachen werden mit dem Dreifachen der Jahresleistung (36 Monate) bewertet.';
  if (category === 'p10_1') return '§ 10 Z 1 RATG: Besitzstörung. Standardbemessung 800 €. Bei einfachen Störungen durch Abstellen von KFZ (Parkstörung) nur 40 € Streitwert für Kosten.';
  if (category === 'ahk_5_6') return '§ 5 Z 6 AHK: Bestandsachen werden mit dem Dreifachen des Jahreswertes (36 Monate) bewertet.';
  if (category === 'ahk_5_8') return '§ 5 Z 8 AHK: Dienstrechtliche Sachen werden mit dem Dreifachen der Jahresbezüge (36 Monate) bewertet.';
  if (category === 'p10_2') return '§ 10 Z 2 RATG: Bestandsachen. Mietzins/Bestandrecht = 12 Monate. Räumung = 1.500 €, Kündigung = 1.000 €.';
  if (category === 'ahk_13') return '§ 13 AHK: Verwaltungsstrafsachen. Bemessung richtet sich nach Strafhöhe (§ 9) + Wert des Verfalls (§ 13 Abs 3).';
  if (category.startsWith('ahk_5_')) return '§ 5 AHK: Autonome Honorarkriterien für Zivilsachen.';
  return 'Ermittlung der Bemessungsgrundlage nach gesetzlichen oder autonomen Kriterien.';
}
