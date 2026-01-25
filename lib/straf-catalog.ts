/**
 * Straf-Katalog für AHK § 9 und § 10 Leistungen
 */

import {
  CourtType,
  StrafLeistungType,
  STRAF_LEISTUNG_LABELS,
  getAvailableLeistungen,
  isTagsatzung,
  isSchriftsatz,
} from './ahk';

export interface StrafCatalogEntry {
  id: string;
  leistungType: StrafLeistungType;
  short: string;
  full: string;
  category: 'AHK_VERHANDLUNG' | 'AHK_SCHRIFTSATZ' | 'RATG';
  isTagsatzung: boolean;
}

/**
 * Detaillierte RATG-Leistungen nach § 10 Abs 2 AHK
 * Jeder Anwendungsfall als separater Eintrag
 */
interface RATGDetailEntry {
  leistungType: StrafLeistungType;
  short: string;
  full: string;
}

const RATG_DETAIL_ENTRIES: RATGDetailEntry[] = [
  // TP 2 RATG - § 10 Abs 2 Z 1
  { leistungType: 'STRAF_RATG_TP2', short: 'TP 2 – Kostenbestimmungsantrag', full: 'TP 2 RATG – Kostenbestimmungsantrag' },
  { leistungType: 'STRAF_RATG_TP2', short: 'TP 2 – Vollmachtsvorlage', full: 'TP 2 RATG – Schriftsatz mit Vollmachtsvorlage' },
  { leistungType: 'STRAF_RATG_TP2', short: 'TP 2 – Rechtsmittelverzicht', full: 'TP 2 RATG – Bekanntgabe Rechtsmittelverzicht' },
  { leistungType: 'STRAF_RATG_TP2', short: 'TP 2 – Rechtsmittelanmeldung', full: 'TP 2 RATG – Rechtsmittelanmeldung' },
  { leistungType: 'STRAF_RATG_TP2', short: 'TP 2 – Kurzer Antrag / Mitteilung', full: 'TP 2 RATG – Ganz kurzer Antrag oder sonstige Mitteilung an das Gericht' },
  { leistungType: 'STRAF_RATG_TP2', short: 'TP 2 – Strafverfahren sonstiges', full: 'TP 2 RATG – Strafverfahren sonstiges' },

  // TP 3A RATG - § 10 Abs 2 Z 2
  { leistungType: 'STRAF_RATG_TP3A', short: 'TP 3A – Antrag (nicht kurz)', full: 'TP 3A RATG – Antrag (nicht dem Umfang oder Inhalt nach ganz kurz)' },
  { leistungType: 'STRAF_RATG_TP3A', short: 'TP 3A – Enthaftungsantrag', full: 'TP 3A RATG – Enthaftungsantrag' },
  { leistungType: 'STRAF_RATG_TP3A', short: 'TP 3A – Antrag auf Akteneinsicht', full: 'TP 3A RATG – Antrag auf Akteneinsicht' },
  { leistungType: 'STRAF_RATG_TP3A', short: 'TP 3A – EV-Antrag an StA', full: 'TP 3A RATG – Antrag an Staatsanwalt im Ermittlungsverfahren' },
  { leistungType: 'STRAF_RATG_TP3A', short: 'TP 3A – EV-Antrag an Gericht', full: 'TP 3A RATG – Antrag an Gericht im Ermittlungsverfahren auf Anordnung/Bewilligung/Entscheidung' },
  { leistungType: 'STRAF_RATG_TP3A', short: 'TP 3A – Strafverfahren sonstiges', full: 'TP 3A RATG – Strafverfahren sonstiges' },

  // TP 3B RATG - § 10 Abs 2 Z 3
  { leistungType: 'STRAF_RATG_TP3B', short: 'TP 3B – Rechtsmittel (sonstig)', full: 'TP 3B RATG – Rechtsmittel in Strafverfahren (nicht in § 9 AHK angeführt)' },
  { leistungType: 'STRAF_RATG_TP3B', short: 'TP 3B – Einspruch Anklageschrift', full: 'TP 3B RATG – Einspruch gegen die Anklageschrift' },
  { leistungType: 'STRAF_RATG_TP3B', short: 'TP 3B – Beschwerde § 87 StPO', full: 'TP 3B RATG – Beschwerde gemäß § 87 StPO' },
  { leistungType: 'STRAF_RATG_TP3B', short: 'TP 3B – Einspruch § 106 StPO', full: 'TP 3B RATG – Einspruch gemäß § 106 StPO' },
  { leistungType: 'STRAF_RATG_TP3B', short: 'TP 3B – Strafverfahren sonstiges', full: 'TP 3B RATG – Strafverfahren sonstiges' },

  // TP 7/2 RATG - § 10 Abs 2 Z 4
  { leistungType: 'STRAF_RATG_TP7_2', short: 'TP 7/2 – Besuch Inhaftierte', full: 'TP 7/2 RATG – Besuch von festgehaltenen oder inhaftierten Personen' },
  { leistungType: 'STRAF_RATG_TP7_2', short: 'TP 7/2 – Vernehmung', full: 'TP 7/2 RATG – Teilnahme an Vernehmungen' },
  { leistungType: 'STRAF_RATG_TP7_2', short: 'TP 7/2 – Aktenstudium (erheblich)', full: 'TP 7/2 RATG – Aktenstudium das nach Art und Umfang das Übliche erheblich übersteigt (§ 2 Abs 2)' },
  { leistungType: 'STRAF_RATG_TP7_2', short: 'TP 7/2 – Akteneinsicht elektronisch', full: 'TP 7/2 RATG – Elektronische Akteneinsicht' },
  { leistungType: 'STRAF_RATG_TP7_2', short: 'TP 7/2 – Strafverfahren sonstiges', full: 'TP 7/2 RATG – Strafverfahren sonstiges' },

  // Zuwarten - § 10 Abs 4
  { leistungType: 'STRAF_ZUWARTEN', short: 'TP 7/2 – Zuwarten', full: 'TP 7/2 RATG – Zuwarten (§ 10 Abs 4 AHK)' },
];

/**
 * Kurzbezeichnungen für UI-Karten (Fallback für Nicht-RATG-Leistungen)
 */
const SHORT_LABELS: Partial<Record<StrafLeistungType, string>> = {};

export type StrafCatalogCategory = 'AHK_VERHANDLUNG' | 'AHK_SCHRIFTSATZ' | 'RATG';

export const STRAF_CATEGORY_LABELS: Record<StrafCatalogCategory, string> = {
  AHK_VERHANDLUNG: 'AHK § 9 - Verhandlungen',
  AHK_SCHRIFTSATZ: 'AHK § 9 - Schriftsätze',
  RATG: 'RATG § 10 AHK – Strafsachen/Sonstiges',
};

/**
 * Generiert den Katalog für einen bestimmten Gerichtstyp
 */
export function getStrafCatalog(courtType: CourtType): StrafCatalogEntry[] {
  const available = getAvailableLeistungen(courtType);
  const result: StrafCatalogEntry[] = [];

  for (const leistungType of available) {
    const isTs = isTagsatzung(leistungType);
    const isRATG = leistungType.startsWith('STRAF_RATG') || leistungType === 'STRAF_ZUWARTEN';

    let category: StrafCatalogCategory;
    if (isRATG) {
      category = 'RATG';
    } else if (isTs) {
      category = 'AHK_VERHANDLUNG';
    } else {
      category = 'AHK_SCHRIFTSATZ';
    }

    if (isRATG) {
      // RATG: Verwende detaillierte Einträge
      const detailEntries = RATG_DETAIL_ENTRIES.filter(e => e.leistungType === leistungType);
      for (let i = 0; i < detailEntries.length; i++) {
        const detail = detailEntries[i];
        result.push({
          id: `${leistungType.toLowerCase()}_${i}`,
          leistungType: detail.leistungType,
          short: detail.short,
          full: detail.full,
          category,
          isTagsatzung: false,
        });
      }
    } else {
      // Nicht-RATG: Standard-Eintrag
      const fullLabel = STRAF_LEISTUNG_LABELS[leistungType];
      const shortLabel = SHORT_LABELS[leistungType] || fullLabel;
      result.push({
        id: leistungType.toLowerCase(),
        leistungType,
        short: shortLabel,
        full: fullLabel,
        category,
        isTagsatzung: isTs,
      });
    }
  }

  return result;
}

/**
 * Gruppiert Katalog nach Kategorien
 */
export function getGroupedStrafCatalog(courtType: CourtType): Record<StrafCatalogCategory, StrafCatalogEntry[]> {
  const catalog = getStrafCatalog(courtType);

  const grouped: Record<StrafCatalogCategory, StrafCatalogEntry[]> = {
    AHK_VERHANDLUNG: [],
    AHK_SCHRIFTSATZ: [],
    RATG: [],
  };

  for (const entry of catalog) {
    grouped[entry.category].push(entry);
  }

  return grouped;
}

/**
 * Findet einen Katalog-Eintrag nach ID
 */
export function findStrafCatalogEntry(
  courtType: CourtType,
  leistungType: StrafLeistungType
): StrafCatalogEntry | undefined {
  return getStrafCatalog(courtType).find(e => e.leistungType === leistungType);
}

/**
 * Default-Werte für eine neue Straf-Leistung
 */
export function getDefaultStrafService(leistungType: StrafLeistungType): {
  durationHalbeStunden: number;
  waitingHalbeStunden: number;
  esMultiplier: number;
  includeErv: boolean;
} {
  const isTs = isTagsatzung(leistungType);

  return {
    durationHalbeStunden: isTs ? 2 : 0, // 1 Stunde = 2 halbe Stunden
    waitingHalbeStunden: 0, // Keine Wartezeit als Default
    esMultiplier: 1, // Einfacher ES als Default
    includeErv: !isTs, // ERV nur bei Schriftsätzen
  };
}
