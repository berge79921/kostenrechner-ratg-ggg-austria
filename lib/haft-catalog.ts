/**
 * ============================================================================
 * HAFT-KATALOG - Leistungskatalog für Haftrecht
 * ============================================================================
 *
 * Rechtsgrundlage: AHK § 9 Abs 1 Z 5 + § 10
 * Stand: 2024
 * ============================================================================
 */

import { HaftLeistungType } from '../types';

export interface HaftCatalogEntry {
  type: HaftLeistungType;
  short: string;
  full: string;
  category: HaftCatalogCategory;
  isTagsatzung: boolean;
  hasKilometer?: boolean;
  hasZeit?: boolean;
}

export type HaftCatalogCategory =
  | 'VERHANDLUNG'
  | 'SCHRIFTSATZ'
  | 'BESUCH'
  | 'BARAUSLAGEN';

export const HAFT_CATEGORY_LABELS: Record<HaftCatalogCategory, string> = {
  VERHANDLUNG: 'Verhandlungen (§ 9 Abs 1 Z 5)',
  SCHRIFTSATZ: 'Schriftsätze (§ 10 → RATG)',
  BESUCH: 'Besuche / Kommissionen',
  BARAUSLAGEN: 'Barauslagen (TP 9)',
};

export const HAFT_CATALOG: HaftCatalogEntry[] = [
  // === VERHANDLUNGEN (§ 9 Abs 1 Z 5) ===
  {
    type: 'HAFT_VH_1_INSTANZ',
    short: 'Haftverhandlung 1. Instanz',
    full: 'Verhandlung im Haftverfahren 1. Instanz (§ 9 Abs 1 Z 5 lit a AHK)',
    category: 'VERHANDLUNG',
    isTagsatzung: true,
  },
  {
    type: 'HAFT_GRUNDRECHTSBESCHWERDE',
    short: 'Grundrechtsbeschwerde',
    full: 'Grundrechtsbeschwerde nach GRBG (§ 9 Abs 1 Z 5 lit b AHK)',
    category: 'SCHRIFTSATZ',
    isTagsatzung: false,
  },
  {
    type: 'HAFT_BESCHWERDE_SONST',
    short: 'Sonstige Haftbeschwerde',
    full: 'Sonstige Beschwerden im Haftverfahren (§ 9 Abs 1 Z 5 lit b AHK)',
    category: 'SCHRIFTSATZ',
    isTagsatzung: false,
  },
  {
    type: 'HAFT_VH_2_INSTANZ',
    short: 'Haftverhandlung 2. Instanz',
    full: 'Verhandlung im Haftverfahren 2. Instanz (§ 9 Abs 1 Z 5 lit c AHK)',
    category: 'VERHANDLUNG',
    isTagsatzung: true,
  },

  // === SCHRIFTSÄTZE (§ 10 → RATG) ===
  {
    type: 'HAFT_ANTRAG_TP3A',
    short: 'Enthaftungsantrag (TP 3A)',
    full: 'Antrag auf Enthaftung / Aufhebung der U-Haft (TP 3A RATG)',
    category: 'SCHRIFTSATZ',
    isTagsatzung: false,
  },
  {
    type: 'HAFT_ANTRAG_TP3A',
    short: 'Antrag bedingte Entlassung (TP 3A)',
    full: 'Antrag auf bedingte Entlassung § 46 StGB (TP 3A RATG)',
    category: 'SCHRIFTSATZ',
    isTagsatzung: false,
  },
  {
    type: 'HAFT_ANTRAG_TP3A',
    short: 'Antrag Fußfessel (TP 3A)',
    full: 'Antrag auf elektronisch überwachten Hausarrest (TP 3A RATG)',
    category: 'SCHRIFTSATZ',
    isTagsatzung: false,
  },
  {
    type: 'HAFT_ANTRAG_TP3A',
    short: 'Antrag Haftlockerung (TP 3A)',
    full: 'Antrag auf Haftlockerung / Freigang (TP 3A RATG)',
    category: 'SCHRIFTSATZ',
    isTagsatzung: false,
  },
  {
    type: 'HAFT_BESCHWERDE_TP3B',
    short: 'Haftbeschwerde (TP 3B)',
    full: 'Beschwerde gegen Haftverhängung §§ 87, 106 StPO (TP 3B RATG)',
    category: 'SCHRIFTSATZ',
    isTagsatzung: false,
  },
  {
    type: 'HAFT_BESCHWERDE_TP3B',
    short: 'Beschwerde Haftfortsetzung (TP 3B)',
    full: 'Beschwerde gegen Haftfortsetzungsbeschluss (TP 3B RATG)',
    category: 'SCHRIFTSATZ',
    isTagsatzung: false,
  },
  {
    type: 'HAFT_KURZANTRAG_TP2',
    short: 'Vollmachtsbekanntgabe (TP 2)',
    full: 'Bekanntgabe der Vollmacht, Zustellvollmacht (TP 2 RATG)',
    category: 'SCHRIFTSATZ',
    isTagsatzung: false,
  },
  {
    type: 'HAFT_KURZANTRAG_TP2',
    short: 'Akteneinsicht (TP 2)',
    full: 'Antrag auf Akteneinsicht / Aktenübersendung (TP 2 RATG)',
    category: 'SCHRIFTSATZ',
    isTagsatzung: false,
  },
  {
    type: 'HAFT_KURZANTRAG_TP2',
    short: 'Fristverlängerung (TP 2)',
    full: 'Antrag auf Fristverlängerung (TP 2 RATG)',
    category: 'SCHRIFTSATZ',
    isTagsatzung: false,
  },

  // === BESUCHE / KOMMISSIONEN ===
  {
    type: 'HAFT_BESUCH',
    short: 'Besuch in Haftanstalt (TP 7/2)',
    full: 'Besuch des Mandanten in der Haftanstalt (TP 7/2 RATG – RA/RAA erforderlich)',
    category: 'BESUCH',
    isTagsatzung: true,
  },
  {
    type: 'HAFT_ZUWARTEN',
    short: 'Zuwarten (TP 7/2)',
    full: 'Zuwarten, nicht stattfindende Verhandlung, Beratungszeit (§ 9 Abs 4 AHK → TP 7/2 RATG)',
    category: 'BESUCH',
    isTagsatzung: true,
  },

  // === BARAUSLAGEN (TP 9) ===
  {
    type: 'HAFT_REISEKOSTEN',
    short: 'Fahrtkosten (€ 0,50/km)',
    full: 'Reisekosten nach TP 9/3 RATG (€ 0,50 pro km, Hin- und Rückfahrt)',
    category: 'BARAUSLAGEN',
    isTagsatzung: false,
    hasKilometer: true,
  },
  {
    type: 'HAFT_REISEZEIT',
    short: 'Reisezeit (TP 9/4)',
    full: 'Reisezeitvergütung nach TP 9/4 RATG (pro halbe Stunde € 33,90)',
    category: 'BARAUSLAGEN',
    isTagsatzung: true,
    hasZeit: true,
  },
];

export const HAFT_LEISTUNG_LABELS: Record<HaftLeistungType, string> = {
  HAFT_VH_1_INSTANZ: 'Haftverhandlung 1. Instanz',
  HAFT_GRUNDRECHTSBESCHWERDE: 'Grundrechtsbeschwerde',
  HAFT_BESCHWERDE_SONST: 'Sonstige Haftbeschwerde',
  HAFT_VH_2_INSTANZ: 'Haftverhandlung 2. Instanz',
  HAFT_BESUCH: 'Besuch in Haftanstalt (TP 7/2)',
  HAFT_ANTRAG_TP3A: 'Enthaftungsantrag (TP 3A)',
  HAFT_BESCHWERDE_TP3B: 'Haftbeschwerde (TP 3B)',
  HAFT_KURZANTRAG_TP2: 'Kurzantrag (TP 2)',
  HAFT_ZUWARTEN: 'Zuwarten (TP 7/2)',
  HAFT_REISEKOSTEN: 'Fahrtkosten',
  HAFT_REISEZEIT: 'Reisezeit',
};

/**
 * Gruppiert Katalog nach Kategorie
 */
export function getGroupedHaftCatalog(): Record<HaftCatalogCategory, HaftCatalogEntry[]> {
  const grouped: Record<HaftCatalogCategory, HaftCatalogEntry[]> = {
    VERHANDLUNG: [],
    SCHRIFTSATZ: [],
    BESUCH: [],
    BARAUSLAGEN: [],
  };

  for (const entry of HAFT_CATALOG) {
    grouped[entry.category].push(entry);
  }

  return grouped;
}

/**
 * Default-Werte für neue Haft-Leistungen
 */
export function getDefaultHaftService(type: HaftLeistungType): {
  durationHalbeStunden: number;
  waitingHalbeStunden: number;
  esMultiplier: number;
  includeErv: boolean;
} {
  // Verhandlungen: 2 halbe Stunden (= 1 Stunde), einfacher ES
  if (type.includes('VH_')) {
    return {
      durationHalbeStunden: 2,
      waitingHalbeStunden: 0,
      esMultiplier: 1,
      includeErv: false,
    };
  }

  // Besuch: 2 halbe Stunden, KEIN ES
  if (type === 'HAFT_BESUCH' || type === 'HAFT_ZUWARTEN') {
    return {
      durationHalbeStunden: 2,
      waitingHalbeStunden: 0,
      esMultiplier: 0,
      includeErv: false,
    };
  }

  // Reisezeit: Dauer variabel, KEIN ES
  if (type === 'HAFT_REISEZEIT') {
    return {
      durationHalbeStunden: 2,
      waitingHalbeStunden: 0,
      esMultiplier: 0,
      includeErv: false,
    };
  }

  // Schriftsätze: einfacher ES, ERV ja
  if (type === 'HAFT_GRUNDRECHTSBESCHWERDE' || type === 'HAFT_BESCHWERDE_SONST' ||
      type === 'HAFT_ANTRAG_TP3A' || type === 'HAFT_BESCHWERDE_TP3B') {
    return {
      durationHalbeStunden: 0,
      waitingHalbeStunden: 0,
      esMultiplier: 1,
      includeErv: true,
    };
  }

  // TP 2 Kurzanträge: KEIN ES
  if (type === 'HAFT_KURZANTRAG_TP2') {
    return {
      durationHalbeStunden: 0,
      waitingHalbeStunden: 0,
      esMultiplier: 0,
      includeErv: true,
    };
  }

  // Barauslagen: keine Dauer, kein ES
  return {
    durationHalbeStunden: 0,
    waitingHalbeStunden: 0,
    esMultiplier: 0,
    includeErv: false,
  };
}

/**
 * Prüft ob Leistung eine Tagsatzung/Verhandlung ist
 */
export function isHaftTagsatzung(type: HaftLeistungType): boolean {
  const entry = HAFT_CATALOG.find(e => e.type === type);
  return entry?.isTagsatzung ?? false;
}

/**
 * Prüft ob Leistung Kilometer-Eingabe benötigt
 */
export function hasHaftKilometer(type: HaftLeistungType): boolean {
  const entry = HAFT_CATALOG.find(e => e.type === type);
  return entry?.hasKilometer ?? false;
}
