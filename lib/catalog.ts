

import { ServiceType } from '../types';

export type CatalogCategory = 'SCHRIFTSAETZE' | 'TERMINE' | 'ENTSCHAEDIGUNG';

export interface CatalogEntry {
  id: string;
  type: ServiceType;
  short: string;
  full: string;
  category: CatalogCategory;
  tp: string; // TP1, TP2, TP3A, etc.
}

export const CATEGORY_LABELS: Record<CatalogCategory, string> = {
  SCHRIFTSAETZE: 'Schriftsätze',
  TERMINE: 'Termine / Tagsatzungen',
  ENTSCHAEDIGUNG: 'Entschädigung (TP 9)'
};

export const SERVICE_CATALOG: CatalogEntry[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // SCHRIFTSÄTZE
  // ═══════════════════════════════════════════════════════════════════════════

  // --- TP 1 Schriftsätze (einfache) ---
  { id: 'tp1_anzeige', type: ServiceType.PLEADING_TP1, short: 'Anzeige / Urkundenvorlage', full: 'TP 1 - Anzeige / Urkundenvorlage', category: 'SCHRIFTSAETZE', tp: 'TP1' },
  { id: 'tp1_ansuchen', type: ServiceType.PLEADING_TP1, short: 'Ansuchen (Auskunft/Einsicht)', full: 'TP 1 - Ansuchen (Auskunft/Akten)', category: 'SCHRIFTSAETZE', tp: 'TP1' },
  { id: 'tp1_antrag', type: ServiceType.PLEADING_TP1, short: 'Antrag (Frist/TS/Zustellung)', full: 'TP 1 - Frist / Tagsatzung / Zustellung', category: 'SCHRIFTSAETZE', tp: 'TP1' },
  { id: 'tp1_kosten', type: ServiceType.PLEADING_TP1, short: 'Kostenbestimmungsantrag', full: 'TP 1 - Antrag auf Kostenbestimmung', category: 'SCHRIFTSAETZE', tp: 'TP1' },
  { id: 'tp1_vollmacht', type: ServiceType.PLEADING_TP1, short: 'Vollmachtswiderruf', full: 'TP 1 - Widerruf / Kündigung Vollmacht', category: 'SCHRIFTSAETZE', tp: 'TP1' },
  { id: 'tp1_zuruecknahme', type: ServiceType.PLEADING_TP1, short: 'Zurücknahme / Verzicht', full: 'TP 1 - Zurücknahme / Verzicht', category: 'SCHRIFTSAETZE', tp: 'TP1' },
  { id: 'tp1_kurator', type: ServiceType.PLEADING_TP1, short: 'Antrag Kuratorbestellung', full: 'TP 1 - Antrag Kuratorbestellung', category: 'SCHRIFTSAETZE', tp: 'TP1' },
  { id: 'tp1_nebenint', type: ServiceType.PLEADING_TP1, short: 'Beitritt Nebenintervenient', full: 'TP 1 - Beitritt Nebenintervenient', category: 'SCHRIFTSAETZE', tp: 'TP1' },
  { id: 'tp1_klagerueck', type: ServiceType.PLEADING_TP1, short: 'Klagerücknahme', full: 'TP 1 - Klagerücknahme', category: 'SCHRIFTSAETZE', tp: 'TP1' },
  { id: 'tp1_einspruch', type: ServiceType.PLEADING_TP1, short: 'Einspruch (bloße Erhebung)', full: 'TP 1 - Einspruch gegen Zahlungsbefehl', category: 'SCHRIFTSAETZE', tp: 'TP1' },
  { id: 'tp1_fortsetzung', type: ServiceType.PLEADING_TP1, short: 'Fortsetzungsantrag', full: 'TP 1 - Fortsetzungsantrag (§ 398 ZPO)', category: 'SCHRIFTSAETZE', tp: 'TP1' },
  { id: 'tp1_berichtigung', type: ServiceType.PLEADING_TP1, short: 'Urteilsberichtigung', full: 'TP 1 - Antrag Urteilsberichtigung', category: 'SCHRIFTSAETZE', tp: 'TP1' },
  { id: 'tp1_berufanm', type: ServiceType.PLEADING_TP1, short: 'Berufungsanmeldung (schriftl.)', full: 'TP 1 - Schriftliche Berufungsanmeldung', category: 'SCHRIFTSAETZE', tp: 'TP1' },
  { id: 'tp1_ex_vollzug', type: ServiceType.PLEADING_TP1, short: 'Vollzugsantrag (Ex)', full: 'TP 1 - Vollzugsantrag (§ 249a EO)', category: 'SCHRIFTSAETZE', tp: 'TP1' },
  { id: 'tp1_ex_einstellung', type: ServiceType.PLEADING_TP1, short: 'Einstellungsantrag (Ex)', full: 'TP 1 - Einstellung / Einschränkung', category: 'SCHRIFTSAETZE', tp: 'TP1' },
  { id: 'tp1_inso', type: ServiceType.PLEADING_TP1, short: 'Insolvenzeröffnungsantrag', full: 'TP 1 - Antrag Eröffnung Insolvenz', category: 'SCHRIFTSAETZE', tp: 'TP1' },

  // --- TP 2 Schriftsätze ---
  { id: 'tp2_klage_kurz', type: ServiceType.PLEADING_TP2, short: 'Klage (kurz/Bestreitung)', full: 'TP 2 - Klage (kurz / Saldo / Kaufpreis)', category: 'SCHRIFTSAETZE', tp: 'TP2' },
  { id: 'tp2_kb_kurz', type: ServiceType.PLEADING_TP2, short: 'KB / Einspruch (Bestreitung)', full: 'TP 2 - KB / Widerspruch / Einspruch', category: 'SCHRIFTSAETZE', tp: 'TP2' },
  { id: 'tp2_aufkuend', type: ServiceType.PLEADING_TP2, short: 'Aufkündigung (nur Gründe)', full: 'TP 2 - Aufkündigung § 567 ZPO', category: 'SCHRIFTSAETZE', tp: 'TP2' },
  { id: 'tp2_sonstig_zp', type: ServiceType.PLEADING_TP2, short: 'Sonstiger Schriftsatz (ZP)', full: 'TP 2 - Sonstiger Schriftsatz ZP', category: 'SCHRIFTSAETZE', tp: 'TP2' },
  { id: 'tp2_ex', type: ServiceType.PLEADING_TP2, short: 'Schriftsatz (Exekution)', full: 'TP 2 - Schriftsatz Exekution', category: 'SCHRIFTSAETZE', tp: 'TP2' },
  { id: 'tp2_grundbuch', type: ServiceType.PLEADING_TP2, short: 'Grundbuch / Register (kurz)', full: 'TP 2 - Grundbuch / Register (kurz)', category: 'SCHRIFTSAETZE', tp: 'TP2' },
  { id: 'tp2_ausserstr', type: ServiceType.PLEADING_TP2, short: 'Äußerung (kurz/Bestreitung)', full: 'TP 2 - Äußerung AußStr (kurz)', category: 'SCHRIFTSAETZE', tp: 'TP2' },
  { id: 'tp2_inso', type: ServiceType.PLEADING_TP2, short: 'Gläubigerschriftsatz (Inso)', full: 'TP 2 - Gläubigerschriftsatz Insolvenz', category: 'SCHRIFTSAETZE', tp: 'TP2' },

  // --- TP 3A Schriftsätze (ausführlich) ---
  { id: 'tp3a_klage', type: ServiceType.PLEADING_TP3A_I, short: 'Klage (ausführlich)', full: 'TP 3A - Klage (ausführlich)', category: 'SCHRIFTSAETZE', tp: 'TP3A' },
  { id: 'tp3a_kb', type: ServiceType.PLEADING_TP3A_I, short: 'Klagebeantwortung (ausf.)', full: 'TP 3A - KB / Widerspruch (ausführlich)', category: 'SCHRIFTSAETZE', tp: 'TP3A' },
  { id: 'tp3a_aufkuend', type: ServiceType.PLEADING_TP3A_I, short: 'Aufkündigung / Einwendung', full: 'TP 3A - Aufkündigung / Einwendung', category: 'SCHRIFTSAETZE', tp: 'TP3A' },
  { id: 'tp3a_vorbereitung', type: ServiceType.PLEADING_TP3A_I, short: 'Vorbereitender Schriftsatz', full: 'TP 3A - Vorbereitungsschriftsatz', category: 'SCHRIFTSAETZE', tp: 'TP3A' },
  { id: 'tp3a_beweis', type: ServiceType.PLEADING_TP3A_I, short: 'Beweissicherung Antrag', full: 'TP 3A - Antrag Beweissicherung', category: 'SCHRIFTSAETZE', tp: 'TP3A' },
  { id: 'tp3a_ev', type: ServiceType.PLEADING_TP3A_I, short: 'Einstweilige Verfügung', full: 'TP 3A - EV (Antrag/Äußerung/Widerspruch)', category: 'SCHRIFTSAETZE', tp: 'TP3A' },
  { id: 'tp3a_kostenrekurs', type: ServiceType.PLEADING_TP3A_I, short: 'Kostenrekurs', full: 'TP 3A - Kostenrekurs / Beantwortung', category: 'SCHRIFTSAETZE', tp: 'TP3A' },
  { id: 'tp3a_ausserstr', type: ServiceType.PLEADING_TP3A_I, short: 'Einleitender Antrag (AußStr)', full: 'TP 3A - Einleitender Antrag AußStr', category: 'SCHRIFTSAETZE', tp: 'TP3A' },
  { id: 'tp3a_inso', type: ServiceType.PLEADING_TP3A_I, short: 'Sanierung / Restrukturierung', full: 'TP 3A - Sanierung / Restrukturierung', category: 'SCHRIFTSAETZE', tp: 'TP3A' },

  // --- TP 3B Schriftsätze (Rechtsmittel 2. Instanz) ---
  { id: 'tp3b_berufung', type: ServiceType.PLEADING_TP3B, short: 'Berufung / Rekurs', full: 'TP 3B - Berufung / Rekurs / Beschwerde', category: 'SCHRIFTSAETZE', tp: 'TP3B' },
  { id: 'tp3b_bb', type: ServiceType.PLEADING_TP3B, short: 'Berufungsbeantwortung', full: 'TP 3B - Berufungs-/Rekursbeantwortung', category: 'SCHRIFTSAETZE', tp: 'TP3B' },
  { id: 'tp3b_anschluss', type: ServiceType.PLEADING_TP3B_IA, short: 'Anschluss-RM (§ 473a ZPO)', full: 'TP 3B - Schriftsatz § 473a ZPO', category: 'SCHRIFTSAETZE', tp: 'TP3B' },

  // --- TP 3C Schriftsätze (OGH / EuGH) ---
  { id: 'tp3c_revision', type: ServiceType.PLEADING_TP3C, short: 'Revision / Revisionsrekurs', full: 'TP 3C - Revision / Revisionsrekurs', category: 'SCHRIFTSAETZE', tp: 'TP3C' },
  { id: 'tp3c_rb', type: ServiceType.PLEADING_TP3C, short: 'Revisionsbeantwortung', full: 'TP 3C - Revisions-/Revisionsrekursbeantw.', category: 'SCHRIFTSAETZE', tp: 'TP3C' },
  { id: 'tp3c_verband', type: ServiceType.PLEADING_TP3C, short: 'Verbandsklage Schriftsatz', full: 'TP 3C - Verbandsklage Schriftsatz', category: 'SCHRIFTSAETZE', tp: 'TP3C' },

  // --- TP 4 Strafsachen Schriftsätze ---
  { id: 'tp4_pa_bg', type: ServiceType.PLEADING_TP4_PRIVATANKLAGE_BG, short: 'Privatanklage (BG)', full: 'TP 4 - Privatanklage BG (€ 6.000)', category: 'SCHRIFTSAETZE', tp: 'TP4' },
  { id: 'tp4_pa_andere', type: ServiceType.PLEADING_TP4_PRIVATANKLAGE_ANDERE, short: 'Privatanklage (andere)', full: 'TP 4 - Privatanklage andere (€ 11.000)', category: 'SCHRIFTSAETZE', tp: 'TP4' },
  { id: 'tp4_medien', type: ServiceType.PLEADING_TP4_MEDIENGESETZ, short: 'Mediengesetz', full: 'TP 4 - Mediengesetz (€ 11.000)', category: 'SCHRIFTSAETZE', tp: 'TP4' },
  { id: 'tp4_privbet_bg', type: ServiceType.PLEADING_TP4_PRIVATBET_BG, short: 'Privatbeteiligter (BG)', full: 'TP 4 - Privatbeteiligter BG (€ 3.000)', category: 'SCHRIFTSAETZE', tp: 'TP4' },
  { id: 'tp4_privbet_andere', type: ServiceType.PLEADING_TP4_PRIVATBET_ANDERE, short: 'Privatbeteiligter (andere)', full: 'TP 4 - Privatbeteiligter andere (€ 6.000)', category: 'SCHRIFTSAETZE', tp: 'TP4' },
  { id: 'tp4_ausgeschl', type: ServiceType.PLEADING_TP4_AUSGESCHL_OEFF, short: 'Ausgeschl. Öffentlichkeit', full: 'TP 4 - Ausgeschlossene Öffentlichkeit', category: 'SCHRIFTSAETZE', tp: 'TP4' },

  // --- TP 5 Einfaches Schreiben ---
  // Fix: Use correct ServiceType PLEADING_TP5
  { id: 'tp5_schreiben', type: ServiceType.PLEADING_TP5, short: 'Einfaches Schreiben', full: 'TP 5 - Einfaches Schreiben (kein Erkenntnis)', category: 'SCHRIFTSAETZE', tp: 'TP5' },

  // --- TP 6 Anderer Brief ---
  // Fix: Use correct ServiceType PLEADING_TP6
  { id: 'tp6_brief', type: ServiceType.PLEADING_TP6, short: 'Anderer Brief', full: 'TP 6 - Anderer Brief / Korrespondenz', category: 'SCHRIFTSAETZE', tp: 'TP6' },

  // ═══════════════════════════════════════════════════════════════════════════
  // TERMINE / TAGSATZUNGEN
  // ═══════════════════════════════════════════════════════════════════════════

  // --- TP 2 Tagsatzungen ---
  { id: 'tp2_ts_erstreckt', type: ServiceType.HEARING_TP2_II, short: 'TS erstreckt', full: 'TP 2 - Erstreckte Tagsatzung', category: 'TERMINE', tp: 'TP2' },
  { id: 'tp2_ts_vu', type: ServiceType.HEARING_TP2_II, short: 'TS VU/Vergleich/Anerkenntnis', full: 'TP 2 - TS VU / Vergleich / Anerkenntnis', category: 'TERMINE', tp: 'TP2' },
  { id: 'tp2_ts_vergleich', type: ServiceType.HEARING_TP2_II, short: 'TS nur Vergleichszweck', full: 'TP 2 - TS Vergleichszweck', category: 'TERMINE', tp: 'TP2' },
  { id: 'tp2_ts_inso', type: ServiceType.HEARING_TP2_II_INSOLVENCY, short: 'TS Insolvenz (Std.)', full: 'TP 2 - Gläubigervertreter TS Insolvenz', category: 'TERMINE', tp: 'TP2' },

  // --- TP 3A Tagsatzungen ---
  { id: 'tp3a_ts', type: ServiceType.HEARING_TP3A_II, short: 'Tagsatzung (Std.)', full: 'TP 3A - Tagsatzung (pro Stunde)', category: 'TERMINE', tp: 'TP3A' },
  { id: 'tp3a_befund', type: ServiceType.INSPECTION_TP3A_III, short: 'Befundaufnahme SV (Std.)', full: 'TP 3A - Befundaufnahme SV (pro Stunde)', category: 'TERMINE', tp: 'TP3A' },

  // --- TP 3B Verhandlung (2. Instanz) ---
  { id: 'tp3b_verhandlung', type: ServiceType.HEARING_TP3B_II, short: 'Verhandlung 2. Instanz (Std.)', full: 'TP 3B - Mündliche Verhandlung (pro Stunde)', category: 'TERMINE', tp: 'TP3B' },

  // --- TP 3C Verhandlungen (OGH / EuGH) ---
  { id: 'tp3c_verhandlung', type: ServiceType.HEARING_TP3C_II, short: 'Verhandlung OGH (Std.)', full: 'TP 3C - Verhandlung OGH (pro Stunde)', category: 'TERMINE', tp: 'TP3C' },
  { id: 'tp3c_eugh', type: ServiceType.HEARING_TP3C_III, short: 'EuGH-Verhandlung (Std.)', full: 'TP 3C - EuGH Vorabentscheidung (pro Stunde)', category: 'TERMINE', tp: 'TP3C' },
  { id: 'tp3c_verband_vh', type: ServiceType.HEARING_TP3C_II, short: 'Verbandsklage Verhandlung (Std.)', full: 'TP 3C - Verbandsklage Verhandlung', category: 'TERMINE', tp: 'TP3C' },

  // --- TP 4 Strafsachen Verhandlungen ---
  { id: 'tp4_pa_bg_vh', type: ServiceType.HEARING_TP4_PRIVATANKLAGE_BG, short: 'VH Privatanklage (BG)', full: 'TP 4 - Verhandlung Privatanklage BG', category: 'TERMINE', tp: 'TP4' },
  { id: 'tp4_pa_andere_vh', type: ServiceType.HEARING_TP4_PRIVATANKLAGE_ANDERE, short: 'VH Privatanklage (andere)', full: 'TP 4 - Verhandlung Privatanklage andere', category: 'TERMINE', tp: 'TP4' },
  { id: 'tp4_medien_vh', type: ServiceType.HEARING_TP4_MEDIENGESETZ, short: 'VH Mediengesetz', full: 'TP 4 - Verhandlung Mediengesetz', category: 'TERMINE', tp: 'TP4' },
  { id: 'tp4_privbet_bg_vh', type: ServiceType.HEARING_TP4_PRIVATBET_BG, short: 'VH Privatbeteiligter (BG)', full: 'TP 4 - Verhandlung Privatbeteiligter BG', category: 'TERMINE', tp: 'TP4' },
  { id: 'tp4_privbet_andere_vh', type: ServiceType.HEARING_TP4_PRIVATBET_ANDERE, short: 'VH Privatbeteiligter (andere)', full: 'TP 4 - Verhandlung Privatbeteiligter andere', category: 'TERMINE', tp: 'TP4' },
  { id: 'tp4_ausgeschl_vh', type: ServiceType.HEARING_TP4_AUSGESCHL_OEFF, short: 'VH Ausgeschl. Öffentlichkeit', full: 'TP 4 - Verhandlung Ausgeschl. Öffentl.', category: 'TERMINE', tp: 'TP4' },

  // --- TP 7 Kommission ---
  { id: 'tp7_kommission', type: ServiceType.HEARING_TP3A_II, short: 'Kommission (Std.)', full: 'TP 7 - Kommission (pro Stunde)', category: 'TERMINE', tp: 'TP7' },

  // --- TP 8 Besprechung ---
  { id: 'tp8_besprechung', type: ServiceType.HEARING_TP3A_II, short: 'Besprechung (Std.)', full: 'TP 8 - Besprechung mit Partei/Gegner', category: 'TERMINE', tp: 'TP8' },

  // --- Zuwarten / Abberaumung ---
  { id: 'zuwarten_tp2', type: ServiceType.WAITING_TIME, short: 'Zuwarten (TP 2)', full: 'TP 2 Anm 2 - Zeit des Zuwartens', category: 'TERMINE', tp: 'TP2' },
  { id: 'zuwarten_tp3', type: ServiceType.WAITING_TIME, short: 'Zuwarten (TP 3)', full: 'TP 3 Anm 2 - Zeit des Zuwartens', category: 'TERMINE', tp: 'TP3' },
  { id: 'abberaumt_tp2', type: ServiceType.CANCELLED_HEARING, short: 'Abberaumte TS (TP 2)', full: 'TP 2 Anm 3 - TS abberaumt', category: 'TERMINE', tp: 'TP2' },
  { id: 'abberaumt_tp3', type: ServiceType.CANCELLED_HEARING, short: 'Abberaumte TS (TP 3)', full: 'TP 3 Anm 3 - TS abberaumt', category: 'TERMINE', tp: 'TP3' },

  // ═══════════════════════════════════════════════════════════════════════════
  // ENTSCHÄDIGUNG (TP 9)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- TP 9 Entschädigung ---
  { id: 'tp9_weg_z1', type: ServiceType.PLEADING_TP1, short: 'Weg (Z 1-4)', full: 'TP 9 Z 1-4 - Wegentschädigung', category: 'ENTSCHAEDIGUNG', tp: 'TP9' },
  { id: 'tp9_zeit_z4', type: ServiceType.PLEADING_TP1, short: 'Zeit (Z 4)', full: 'TP 9 Z 4 - Zeitversäumnis', category: 'ENTSCHAEDIGUNG', tp: 'TP9' },
  { id: 'tp9_versaeumnis', type: ServiceType.PLEADING_TP1, short: 'Versäumnis', full: 'TP 9 - Versäumnisentschädigung', category: 'ENTSCHAEDIGUNG', tp: 'TP9' },
];

// Gruppierter Katalog nach Kategorie und TP
export function getGroupedCatalog(): Record<CatalogCategory, Record<string, CatalogEntry[]>> {
  const grouped: Record<CatalogCategory, Record<string, CatalogEntry[]>> = {
    SCHRIFTSAETZE: {},
    TERMINE: {},
    ENTSCHAEDIGUNG: {}
  };

  for (const entry of SERVICE_CATALOG) {
    if (!grouped[entry.category][entry.tp]) {
      grouped[entry.category][entry.tp] = [];
    }
    grouped[entry.category][entry.tp].push(entry);
  }

  return grouped;
}