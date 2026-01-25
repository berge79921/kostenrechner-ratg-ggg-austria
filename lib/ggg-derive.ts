/**
 * GGG-Ableitung aus RATG-Leistungen
 * Bestimmt automatisch den passenden GGG-Tarifpost basierend auf der hoechsten Instanz.
 */

import { LegalService, ServiceType } from '../types';
import { GGGTarifpost, getGGG, GGGResult } from './ggg';

export type DerivedInstanz = '1. Instanz' | '2. Instanz' | '3. Instanz';

export interface DerivedGGG {
  tarifpost: GGGTarifpost;
  instanz: DerivedInstanz;
  label: string;
}

/**
 * Leitet den GGG-Tarifpost aus den RATG-Leistungen ab.
 * Hoechste Instanz gewinnt: 3. Instanz (TP3C) > 2. Instanz (TP3B) > 1. Instanz (default)
 */
export function deriveGGGTarifpost(services: LegalService[]): GGGTarifpost {
  // 3. Instanz: TP3C -> GGG TP3 lit. a
  const hasTP3C = services.some(s =>
    s.type === ServiceType.PLEADING_TP3C ||
    s.type === ServiceType.HEARING_TP3C_II ||
    s.type === ServiceType.HEARING_TP3C_III
  );
  if (hasTP3C) return 'TP3_LIT_A';

  // 2. Instanz: TP3B -> GGG TP2
  const hasTP3B = services.some(s =>
    s.type === ServiceType.PLEADING_TP3B ||
    s.type === ServiceType.PLEADING_TP3B_IA ||
    s.type === ServiceType.HEARING_TP3B_II
  );
  if (hasTP3B) return 'TP2';

  // 1. Instanz (Default): -> GGG TP1 Z I
  return 'TP1_ZI';
}

/**
 * Leitet den GGG-Tarifpost mit Label aus den RATG-Leistungen ab.
 */
export function deriveGGGWithLabel(services: LegalService[]): DerivedGGG {
  const tarifpost = deriveGGGTarifpost(services);

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
    default:
      instanz = '1. Instanz';
      label = 'TP 1 Z I';
  }

  return { tarifpost, instanz, label };
}

/**
 * Berechnet die GGG-Pauschalgebuehr basierend auf abgeleitetem Tarifpost.
 */
export function calculateDerivedGGG(
  services: LegalService[],
  bmglCents: number,
  streitgenossen: number = 0
): GGGResult & { derivedInfo: DerivedGGG } {
  const derivedInfo = deriveGGGWithLabel(services);
  const result = getGGG(derivedInfo.tarifpost, bmglCents, streitgenossen);

  return {
    ...result,
    derivedInfo
  };
}
