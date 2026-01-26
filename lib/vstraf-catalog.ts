/**
 * V-Straf-Katalog für AHK § 13 Verwaltungsstrafsachen
 * BMGL basiert auf angedrohter Geldstrafe, Tarife aus § 9 sinngemäß
 */

import { VStrafStufe, VStrafLeistungType } from '../types';
import { CourtType } from './ahk';

// BMGL nach § 13 Abs 1 AHK
export const VSTRAF_BEMESSUNGSGRUNDLAGEN: Record<VStrafStufe, number> = {
  Z1: 780000,      // € 7.800 (bis € 730)
  Z2: 1800000,     // € 18.000 (bis € 2.180)
  Z3: 2760000,     // € 27.600 (€ 2.180-4.360)
  Z4: 3320000,     // € 33.200 (über € 4.360 / + Haft)
  Z5: 2760000,     // € 27.600 (Finanzstrafverfahren)
  Z6A: 780000,     // € 7.800 (Disziplinar leicht)
  Z6B: 1800000,    // € 18.000 (Disziplinar mittel)
  Z6C: 2760000,    // € 27.600 (Disziplinar schwer)
};

export const VSTRAF_STUFE_LABELS: Record<VStrafStufe, string> = {
  Z1: 'Geldstrafe bis € 730 (Z 1)',
  Z2: 'Geldstrafe bis € 2.180 (Z 2)',
  Z3: 'Geldstrafe € 2.180 – € 4.360 (Z 3)',
  Z4: 'Geldstrafe über € 4.360 / + Haft (Z 4)',
  Z5: 'Finanzstrafverfahren (Z 5)',
  Z6A: 'Disziplinarverfahren leicht (Z 6)',
  Z6B: 'Disziplinarverfahren mittel (Z 6)',
  Z6C: 'Disziplinarverfahren schwer (Z 6)',
};

// V-Straf CourtType (ohne HAFT)
export type VStrafCourtType = 'BG' | 'ER_GH' | 'SCHOEFFEN' | 'GESCHWORENEN';

// Mappt V-Straf-Stufe → CourtType für AHK_TARIFE
export function getVStrafCourtType(stufe: VStrafStufe): VStrafCourtType {
  switch (stufe) {
    case 'Z1':
    case 'Z6A':
      return 'BG';
    case 'Z2':
    case 'Z6B':
      return 'ER_GH';
    case 'Z3':
    case 'Z5':
    case 'Z6C':
      return 'SCHOEFFEN';
    case 'Z4':
      return 'GESCHWORENEN';
  }
}

// Leistungsbezeichnungen
export const VSTRAF_LEISTUNG_LABELS: Record<VStrafLeistungType, string> = {
  // Verhandlungen
  VSTRAF_VH_1_INSTANZ: 'Verhandlung 1. Instanz',
  VSTRAF_BERUFUNG_VH_VOLL: 'Berufungsverhandlung (volle Anfechtung)',
  VSTRAF_BERUFUNG_VH_STRAFE: 'Berufungsverhandlung (nur Strafhöhe)',
  // Schriftsätze
  VSTRAF_BESCHWERDE_VOLL: 'Beschwerde (volle Anfechtung)',
  VSTRAF_BESCHWERDE_STRAFE: 'Beschwerde (nur Strafhöhe)',
  // RATG
  VSTRAF_RATG_TP2: 'TP 2 RATG – Kurze Anträge',
  VSTRAF_RATG_TP3A: 'TP 3A RATG – Anträge',
  VSTRAF_RATG_TP3B: 'TP 3B RATG – Beschwerden',
  VSTRAF_RATG_TP7_2: 'TP 7/2 RATG – Kommission',
  VSTRAF_ZUWARTEN: 'TP 7/2 RATG – Zuwarten',
};

export interface VStrafCatalogEntry {
  id: string;
  leistungType: VStrafLeistungType;
  short: string;
  full: string;
  category: 'VERHANDLUNG' | 'SCHRIFTSATZ' | 'RATG';
  isTagsatzung: boolean;
  isNurStrafhoehe?: boolean;
}

// Detaillierte Einträge für RATG-Leistungen
interface RATGDetailEntry {
  leistungType: VStrafLeistungType;
  short: string;
  full: string;
}

const RATG_DETAIL_ENTRIES: RATGDetailEntry[] = [
  // TP 2 RATG
  { leistungType: 'VSTRAF_RATG_TP2', short: 'TP 2 – Kostenbestimmungsantrag', full: 'TP 2 RATG – Kostenbestimmungsantrag' },
  { leistungType: 'VSTRAF_RATG_TP2', short: 'TP 2 – Vollmachtsvorlage', full: 'TP 2 RATG – Schriftsatz mit Vollmachtsvorlage' },
  { leistungType: 'VSTRAF_RATG_TP2', short: 'TP 2 – Kurzer Antrag', full: 'TP 2 RATG – Kurzer Antrag oder Mitteilung' },

  // TP 3A RATG
  { leistungType: 'VSTRAF_RATG_TP3A', short: 'TP 3A – Antrag', full: 'TP 3A RATG – Antrag (nicht kurz)' },
  { leistungType: 'VSTRAF_RATG_TP3A', short: 'TP 3A – Akteneinsicht', full: 'TP 3A RATG – Antrag auf Akteneinsicht' },

  // TP 3B RATG
  { leistungType: 'VSTRAF_RATG_TP3B', short: 'TP 3B – Rechtsmittel', full: 'TP 3B RATG – Rechtsmittel' },

  // TP 7/2 RATG
  { leistungType: 'VSTRAF_RATG_TP7_2', short: 'TP 7/2 – Kommission', full: 'TP 7/2 RATG – Kommission (Zeitgebühr)' },
  { leistungType: 'VSTRAF_RATG_TP7_2', short: 'TP 7/2 – Aktenstudium', full: 'TP 7/2 RATG – Aktenstudium (erheblich)' },
  { leistungType: 'VSTRAF_RATG_TP7_2', short: 'TP 7/2 – Teilnahme Vernehmung', full: 'TP 7/2 RATG – Teilnahme an Vernehmung' },

  // Zuwarten
  { leistungType: 'VSTRAF_ZUWARTEN', short: 'TP 7/2 – Zuwarten', full: 'TP 7/2 RATG – Zuwarten' },
];

export type VStrafCatalogCategory = 'VERHANDLUNG' | 'SCHRIFTSATZ' | 'RATG';

export const VSTRAF_CATEGORY_LABELS: Record<VStrafCatalogCategory, string> = {
  VERHANDLUNG: '§ 13 AHK – Verhandlungen',
  SCHRIFTSATZ: '§ 13 AHK – Schriftsätze',
  RATG: 'RATG – Sonstiges',
};

// Prüft ob Leistung eine Tagsatzung ist
export function isVStrafTagsatzung(leistungType: VStrafLeistungType): boolean {
  return [
    'VSTRAF_VH_1_INSTANZ',
    'VSTRAF_BERUFUNG_VH_VOLL',
    'VSTRAF_BERUFUNG_VH_STRAFE',
  ].includes(leistungType);
}

// Prüft ob Leistung ein Schriftsatz ist
export function isVStrafSchriftsatz(leistungType: VStrafLeistungType): boolean {
  return [
    'VSTRAF_BESCHWERDE_VOLL',
    'VSTRAF_BESCHWERDE_STRAFE',
  ].includes(leistungType);
}

// Prüft ob Leistung eine "nur Strafhöhe" Variante ist (§ 13 Abs 4)
export function isNurStrafhoehe(leistungType: VStrafLeistungType): boolean {
  return [
    'VSTRAF_BERUFUNG_VH_STRAFE',
    'VSTRAF_BESCHWERDE_STRAFE',
  ].includes(leistungType);
}

/**
 * Generiert den Katalog für V-Straf
 */
export function getVStrafCatalog(): VStrafCatalogEntry[] {
  const result: VStrafCatalogEntry[] = [];

  // Verhandlungen
  const verhandlungen: VStrafLeistungType[] = [
    'VSTRAF_VH_1_INSTANZ',
    'VSTRAF_BERUFUNG_VH_VOLL',
    'VSTRAF_BERUFUNG_VH_STRAFE',
  ];
  for (const lt of verhandlungen) {
    result.push({
      id: lt.toLowerCase(),
      leistungType: lt,
      short: VSTRAF_LEISTUNG_LABELS[lt],
      full: VSTRAF_LEISTUNG_LABELS[lt],
      category: 'VERHANDLUNG',
      isTagsatzung: true,
      isNurStrafhoehe: isNurStrafhoehe(lt),
    });
  }

  // Schriftsätze
  const schriftsaetze: VStrafLeistungType[] = [
    'VSTRAF_BESCHWERDE_VOLL',
    'VSTRAF_BESCHWERDE_STRAFE',
  ];
  for (const lt of schriftsaetze) {
    result.push({
      id: lt.toLowerCase(),
      leistungType: lt,
      short: VSTRAF_LEISTUNG_LABELS[lt],
      full: VSTRAF_LEISTUNG_LABELS[lt],
      category: 'SCHRIFTSATZ',
      isTagsatzung: false,
      isNurStrafhoehe: isNurStrafhoehe(lt),
    });
  }

  // RATG Einträge
  for (let i = 0; i < RATG_DETAIL_ENTRIES.length; i++) {
    const detail = RATG_DETAIL_ENTRIES[i];
    result.push({
      id: `${detail.leistungType.toLowerCase()}_${i}`,
      leistungType: detail.leistungType,
      short: detail.short,
      full: detail.full,
      category: 'RATG',
      isTagsatzung: false,
    });
  }

  return result;
}

/**
 * Gruppiert Katalog nach Kategorien
 */
export function getGroupedVStrafCatalog(): Record<VStrafCatalogCategory, VStrafCatalogEntry[]> {
  const catalog = getVStrafCatalog();
  const grouped: Record<VStrafCatalogCategory, VStrafCatalogEntry[]> = {
    VERHANDLUNG: [],
    SCHRIFTSATZ: [],
    RATG: [],
  };

  for (const entry of catalog) {
    grouped[entry.category].push(entry);
  }

  return grouped;
}

/**
 * Default-Werte für eine neue V-Straf-Leistung
 */
export function getDefaultVStrafService(leistungType: VStrafLeistungType): {
  durationHalbeStunden: number;
  waitingHalbeStunden: number;
  esMultiplier: number;
  includeErv: boolean;
} {
  const isTs = isVStrafTagsatzung(leistungType);

  return {
    durationHalbeStunden: isTs ? 2 : 1, // 1 Stunde für VH, 30min für RATG
    waitingHalbeStunden: 0,
    esMultiplier: 1,
    includeErv: !isTs, // ERV nur bei Schriftsätzen
  };
}
