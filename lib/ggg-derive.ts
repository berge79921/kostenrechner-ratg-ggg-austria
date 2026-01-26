/**
 * GGG-Ableitung aus RATG-Leistungen
 * Bestimmt automatisch den passenden GGG-Tarifpost basierend auf:
 * 1. Verfahrensart (Zivilprozess vs Exekutionsverfahren)
 * 2. Hoechster Instanz der Leistungen
 */

import { LegalService, ServiceType, ProcedureType } from '../types';
import { GGGTarifpost, getGGG, GGGResult } from './ggg';

export type DerivedInstanz = '1. Instanz' | '2. Instanz' | '3. Instanz';

export interface DerivedGGG {
  tarifpost: GGGTarifpost;
  instanz: DerivedInstanz;
  label: string;
}

/**
 * Leitet den GGG-Tarifpost aus den RATG-Leistungen und dem Verfahrenstyp ab.
 *
 * Zivilprozess/Außerstreit/Insolvenz:
 *   3. Instanz (TP3C) → GGG TP 3 lit. a
 *   2. Instanz (TP3B) → GGG TP 2
 *   1. Instanz → GGG TP 1 Z I
 *
 * Exekutionsverfahren:
 *   3. Instanz (TP3C) → GGG TP 4 Z III lit. a (200% von Z I)
 *   2. Instanz (TP3B) → GGG TP 4 Z II lit. a (150% von Z I)
 *   1. Instanz → GGG TP 4 Z I lit. a
 */
export function deriveGGGTarifpost(services: LegalService[], procedureType: ProcedureType = ProcedureType.ZIVILPROZESS): GGGTarifpost {
  // String-basierter Vergleich für enum alias compatibility (EXEKUTION === EXECUTION)
  const isExekution = String(procedureType) === String(ProcedureType.EXEKUTION);

  // 3. Instanz: TP3C
  const hasTP3C = services.some(s =>
    s.type === ServiceType.PLEADING_TP3C ||
    s.type === ServiceType.HEARING_TP3C_II ||
    s.type === ServiceType.HEARING_TP3C_III
  );
  if (hasTP3C) {
    return isExekution ? 'TP4_ZIII_LIT_A' : 'TP3_LIT_A';
  }

  // 2. Instanz: TP3B
  const hasTP3B = services.some(s =>
    s.type === ServiceType.PLEADING_TP3B ||
    s.type === ServiceType.PLEADING_TP3B_IA ||
    s.type === ServiceType.HEARING_TP3B_II
  );
  if (hasTP3B) {
    return isExekution ? 'TP4_ZII_LIT_A' : 'TP2';
  }

  // 1. Instanz (Default)
  return isExekution ? 'TP4_ZI_LIT_A' : 'TP1_ZI';
}

/**
 * Leitet den GGG-Tarifpost mit Label aus den RATG-Leistungen und Verfahrenstyp ab.
 */
export function deriveGGGWithLabel(services: LegalService[], procedureType: ProcedureType = ProcedureType.ZIVILPROZESS): DerivedGGG {
  const tarifpost = deriveGGGTarifpost(services, procedureType);
  const isExekution = String(procedureType) === String(ProcedureType.EXEKUTION);

  let instanz: DerivedInstanz;
  let label: string;

  switch (tarifpost) {
    case 'TP3_LIT_A':
      instanz = '3. Instanz';
      label = 'TP 3 lit. a';
      break;
    case 'TP2':
      instanz = '2. Instanz';
      label = 'TP 2';
      break;
    case 'TP4_ZIII_LIT_A':
      instanz = '3. Instanz';
      label = 'TP 4 Z III lit. a';
      break;
    case 'TP4_ZII_LIT_A':
      instanz = '2. Instanz';
      label = 'TP 4 Z II lit. a';
      break;
    case 'TP4_ZI_LIT_A':
      instanz = '1. Instanz';
      label = 'TP 4 Z I lit. a';
      break;
    default:
      instanz = '1. Instanz';
      label = isExekution ? 'TP 4 Z I lit. a' : 'TP 1 Z I';
  }

  return { tarifpost, instanz, label };
}

/**
 * Berechnet die GGG-Pauschalgebuehr basierend auf abgeleitetem Tarifpost.
 */
export function calculateDerivedGGG(
  services: LegalService[],
  bmglCents: number,
  streitgenossen: number = 0,
  procedureType: ProcedureType = ProcedureType.ZIVILPROZESS
): GGGResult & { derivedInfo: DerivedGGG } {
  const derivedInfo = deriveGGGWithLabel(services, procedureType);
  const result = getGGG(derivedInfo.tarifpost, bmglCents, streitgenossen);

  return {
    ...result,
    derivedInfo
  };
}
