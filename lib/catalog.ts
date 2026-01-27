

import { ServiceType, ProcedureType } from '../types';

export type CatalogCategory = 'SCHRIFTSAETZE' | 'TERMINE' | 'ENTSCHAEDIGUNG';

export interface CatalogEntry {
  id: string;
  type: ServiceType;
  short: string;
  full: string;
  category: CatalogCategory;
  tp: string; // TP1, TP2, TP3A, etc.
  procedureTypes?: ProcedureType[]; // Für welche Verfahrensarten gilt dieser Eintrag? Leer = alle
  defaultEsMultiplier?: number; // Default ES: 1 = einfach, 2 = doppelt. Wenn nicht gesetzt, wird nach Typ bestimmt
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
  // I. In allen Verfahren
  { id: 'tp1_anzeige', type: ServiceType.PLEADING_TP1, short: 'Anzeige / Urkundenvorlage', full: 'TP 1 - Anzeige / Urkundenvorlage / Mitteilung', category: 'SCHRIFTSAETZE', tp: 'TP1' },
  { id: 'tp1_ansuchen', type: ServiceType.PLEADING_TP1, short: 'Ansuchen (Auskunft/Einsicht)', full: 'TP 1 - Ansuchen (Auskunft/Akten/Abschriften)', category: 'SCHRIFTSAETZE', tp: 'TP1' },
  { id: 'tp1_antrag', type: ServiceType.PLEADING_TP1, short: 'Antrag (Frist/TS/Zustellung)', full: 'TP 1 - Frist / Tagsatzung / Zustellung', category: 'SCHRIFTSAETZE', tp: 'TP1' },
  { id: 'tp1_kosten', type: ServiceType.PLEADING_TP1, short: 'Kostenbestimmungsantrag', full: 'TP 1 - Antrag auf Kostenbestimmung', category: 'SCHRIFTSAETZE', tp: 'TP1' },
  { id: 'tp1_vollmacht', type: ServiceType.PLEADING_TP1, short: 'Vollmachtswiderruf', full: 'TP 1 - Widerruf / Kündigung Vollmacht', category: 'SCHRIFTSAETZE', tp: 'TP1' },
  { id: 'tp1_zuruecknahme', type: ServiceType.PLEADING_TP1, short: 'Zurücknahme / Verzicht', full: 'TP 1 - Zurücknahme Antrag/RM / Verzicht', category: 'SCHRIFTSAETZE', tp: 'TP1' },
  { id: 'tp1_eirag', type: ServiceType.PLEADING_TP1, short: 'Einvernehmen § 5 EIRAG', full: 'TP 1 - Nachweis/Widerruf Einvernehmen § 5 Abs 2 EIRAG', category: 'SCHRIFTSAETZE', tp: 'TP1' },
  // II. Zivilprozess
  { id: 'tp1_kurator', type: ServiceType.PLEADING_TP1, short: 'Antrag Kuratorbestellung', full: 'TP 1 - Antrag Kuratorbestellung', category: 'SCHRIFTSAETZE', tp: 'TP1', procedureTypes: [ProcedureType.ZIVILPROZESS] },
  { id: 'tp1_nebenint', type: ServiceType.PLEADING_TP1, short: 'Beitritt Nebenintervenient', full: 'TP 1 - Beitritt Nebenintervenient', category: 'SCHRIFTSAETZE', tp: 'TP1', procedureTypes: [ProcedureType.ZIVILPROZESS] },
  { id: 'tp1_bmgl_aenderung', type: ServiceType.PLEADING_TP1, short: 'Änderung BMGL §§ 7, 8', full: 'TP 1 - Antrag Änderung BMGL §§ 7, 8 RATG', category: 'SCHRIFTSAETZE', tp: 'TP1', procedureTypes: [ProcedureType.ZIVILPROZESS] },
  { id: 'tp1_bmgl_aeusserung', type: ServiceType.PLEADING_TP1, short: 'Äußerung BMGL-Änderung', full: 'TP 1 - Äußerung zu Antrag BMGL-Änderung', category: 'SCHRIFTSAETZE', tp: 'TP1', procedureTypes: [ProcedureType.ZIVILPROZESS] },
  { id: 'tp1_klagerueck', type: ServiceType.PLEADING_TP1, short: 'Klagerücknahme', full: 'TP 1 - Klagerücknahme', category: 'SCHRIFTSAETZE', tp: 'TP1', procedureTypes: [ProcedureType.ZIVILPROZESS] },
  { id: 'tp1_einspruch', type: ServiceType.PLEADING_TP1, short: 'Einspruch (bloße Erhebung)', full: 'TP 1 - Einspruch gegen ZB (bloße Erhebung)', category: 'SCHRIFTSAETZE', tp: 'TP1', procedureTypes: [ProcedureType.ZIVILPROZESS] },
  { id: 'tp1_fortsetzung', type: ServiceType.PLEADING_TP1, short: 'Fortsetzungsantrag', full: 'TP 1 - Fortsetzungsantrag / Aufnahme § 398 ZPO', category: 'SCHRIFTSAETZE', tp: 'TP1', procedureTypes: [ProcedureType.ZIVILPROZESS] },
  { id: 'tp1_berichtigung', type: ServiceType.PLEADING_TP1, short: 'Urteilsberichtigung', full: 'TP 1 - Antrag Urteilsberichtigung', category: 'SCHRIFTSAETZE', tp: 'TP1', procedureTypes: [ProcedureType.ZIVILPROZESS] },
  { id: 'tp1_berufanm', type: ServiceType.PLEADING_TP1, short: 'Berufungsanmeldung (schriftl.)', full: 'TP 1 - Schriftliche Berufungsanmeldung', category: 'SCHRIFTSAETZE', tp: 'TP1', procedureTypes: [ProcedureType.ZIVILPROZESS, ProcedureType.AUSSERSTREIT] },
  { id: 'tp1_bb_antrag', type: ServiceType.PLEADING_TP1, short: 'BB (nur Antrag mündl. VH)', full: 'TP 1 - Berufungsbeantwortung (nur Antrag mündl. VH)', category: 'SCHRIFTSAETZE', tp: 'TP1', procedureTypes: [ProcedureType.ZIVILPROZESS] },
  // III. Insolvenzverfahren
  { id: 'tp1_inso', type: ServiceType.PLEADING_TP1, short: 'Insolvenzeröffnungsantrag', full: 'TP 1 - Antrag Eröffnung Insolvenz', category: 'SCHRIFTSAETZE', tp: 'TP1', procedureTypes: [ProcedureType.INSOLVENZ] },

  // --- TP 2 Schriftsätze ---
  // Zivilprozess - Klagen (kurze Darstellung)
  { id: 'tp2_klage_kurz', type: ServiceType.PLEADING_TP2, short: 'Klage (kurz/Bestreitung)', full: 'TP 2 - Klage (kurz / Saldo / Kaufpreis)', category: 'SCHRIFTSAETZE', tp: 'TP2' },
  { id: 'tp2_saldoklage', type: ServiceType.PLEADING_TP2, short: 'Saldoklage', full: 'TP 2 - Saldoklage (kurze Darstellung)', category: 'SCHRIFTSAETZE', tp: 'TP2' },
  { id: 'tp2_darlehensklage', type: ServiceType.PLEADING_TP2, short: 'Darlehensklage', full: 'TP 2 - Darlehensklage (kurze Darstellung)', category: 'SCHRIFTSAETZE', tp: 'TP2' },
  { id: 'tp2_kaufpreisklage', type: ServiceType.PLEADING_TP2, short: 'Kaufpreisklage', full: 'TP 2 - Kaufpreisklage bewegliche Sachen', category: 'SCHRIFTSAETZE', tp: 'TP2' },
  { id: 'tp2_entgeltklage', type: ServiceType.PLEADING_TP2, short: 'Entgeltklage (Arbeit/Dienst)', full: 'TP 2 - Entgeltklage Arbeit/Dienste', category: 'SCHRIFTSAETZE', tp: 'TP2' },
  { id: 'tp2_praemienklage', type: ServiceType.PLEADING_TP2, short: 'Versicherungsprämien', full: 'TP 2 - Klage Versicherungsprämien/Beiträge', category: 'SCHRIFTSAETZE', tp: 'TP2' },
  { id: 'tp2_bestandzins', type: ServiceType.PLEADING_TP2, short: 'Bestandzins (Miete)', full: 'TP 2 - Klage auf Bestandzins', category: 'SCHRIFTSAETZE', tp: 'TP2' },
  { id: 'tp2_549_klage', type: ServiceType.PLEADING_TP2, short: 'Klage/Antrag § 549 ZPO', full: 'TP 2 - Klage/Antrag § 549 ZPO (Unterlassung)', category: 'SCHRIFTSAETZE', tp: 'TP2' },
  { id: 'tp2_wechselmandat', type: ServiceType.PLEADING_TP2, short: 'Wechselmandatsklage', full: 'TP 2 - Wechselmandatsklage', category: 'SCHRIFTSAETZE', tp: 'TP2' },
  { id: 'tp2_scheck', type: ServiceType.PLEADING_TP2, short: 'Scheckklage (Rückgriff)', full: 'TP 2 - Scheckrechtliche Rückgriffsklage', category: 'SCHRIFTSAETZE', tp: 'TP2' },
  // Zivilprozess - Beitrittserklärungen § 628 ZPO (Sammelklage)
  { id: 'tp2_beitritt_628', type: ServiceType.PLEADING_TP2, short: 'Beitrittserklärung § 628', full: 'TP 2 - Beitrittserklärung § 628 ZPO', category: 'SCHRIFTSAETZE', tp: 'TP2' },
  { id: 'tp2_aeusserung_628', type: ServiceType.PLEADING_TP2, short: 'Äußerung Beitritt § 628', full: 'TP 2 - Äußerung zu Beitritt § 628 ZPO', category: 'SCHRIFTSAETZE', tp: 'TP2' },
  // Zivilprozess - KB/Einspruch/Einwendungen (kurz)
  { id: 'tp2_kb_kurz', type: ServiceType.PLEADING_TP2, short: 'KB / Einspruch (Bestreitung)', full: 'TP 2 - KB / Widerspruch / Einspruch (kurz)', category: 'SCHRIFTSAETZE', tp: 'TP2' },
  { id: 'tp2_aufkuend', type: ServiceType.PLEADING_TP2, short: 'Aufkündigung (nur Gründe)', full: 'TP 2 - Aufkündigung § 567 ZPO (kurz)', category: 'SCHRIFTSAETZE', tp: 'TP2' },
  { id: 'tp2_sonstig_zp', type: ServiceType.PLEADING_TP2, short: 'Sonstiger Schriftsatz (ZP)', full: 'TP 2 - Sonstiger Schriftsatz ZP', category: 'SCHRIFTSAETZE', tp: 'TP2' },
  // Andere Verfahren
  { id: 'tp2_ex', type: ServiceType.PLEADING_TP2, short: 'Schriftsatz (Exekution)', full: 'TP 2 - Schriftsatz Exekution', category: 'SCHRIFTSAETZE', tp: 'TP2' },
  { id: 'tp2_grundbuch', type: ServiceType.PLEADING_TP2, short: 'Grundbuch / Register (kurz)', full: 'TP 2 - Grundbuch / Register (kurz)', category: 'SCHRIFTSAETZE', tp: 'TP2' },
  { id: 'tp2_ausserstr', type: ServiceType.PLEADING_TP2, short: 'Äußerung (kurz/Bestreitung)', full: 'TP 2 - Äußerung AußStr (kurz)', category: 'SCHRIFTSAETZE', tp: 'TP2', procedureTypes: [ProcedureType.AUSSERSTREIT] },
  { id: 'tp2_inso', type: ServiceType.PLEADING_TP2, short: 'Gläubigerschriftsatz (Inso)', full: 'TP 2 - Gläubigerschriftsatz Insolvenz', category: 'SCHRIFTSAETZE', tp: 'TP2', procedureTypes: [ProcedureType.INSOLVENZ] },

  // --- TP 3A Schriftsätze (ausführlich) ---
  // Zivilprozess
  { id: 'tp3a_klage', type: ServiceType.PLEADING_TP3A_I, short: 'Klage (ausführlich)', full: 'TP 3A - Klage (ausführlich)', category: 'SCHRIFTSAETZE', tp: 'TP3A' },
  { id: 'tp3a_kb', type: ServiceType.PLEADING_TP3A_I, short: 'Klagebeantwortung (ausf.)', full: 'TP 3A - KB / Widerspruch (ausführlich)', category: 'SCHRIFTSAETZE', tp: 'TP3A' },
  { id: 'tp3a_einspruch', type: ServiceType.PLEADING_TP3A_I, short: 'Einspruch (ausführlich)', full: 'TP 3A - Einspruch gegen ZB (ausführlich)', category: 'SCHRIFTSAETZE', tp: 'TP3A' },
  { id: 'tp3a_widerspruch_vu', type: ServiceType.PLEADING_TP3A_I, short: 'Widerspruch VU (ausf.)', full: 'TP 3A - Widerspruch gegen Versäumungsurteil', category: 'SCHRIFTSAETZE', tp: 'TP3A' },
  { id: 'tp3a_einwendungen_za', type: ServiceType.PLEADING_TP3A_I, short: 'Einwendungen Zahlungsauftrag', full: 'TP 3A - Einwendungen gegen Zahlungsauftrag', category: 'SCHRIFTSAETZE', tp: 'TP3A' },
  { id: 'tp3a_einwendungen_549', type: ServiceType.PLEADING_TP3A_I, short: 'Einwendungen § 549 ZPO', full: 'TP 3A - Einwendungen Unterlassungsauftrag § 549', category: 'SCHRIFTSAETZE', tp: 'TP3A' },
  { id: 'tp3a_aufkuend', type: ServiceType.PLEADING_TP3A_I, short: 'Aufkündigung / Einwendung', full: 'TP 3A - Aufkündigung / Einwendung § 567', category: 'SCHRIFTSAETZE', tp: 'TP3A' },
  { id: 'tp3a_vorbereitung', type: ServiceType.PLEADING_TP3A_I, short: 'Vorbereitender Schriftsatz', full: 'TP 3A - Vorbereitungsschriftsatz § 257 Abs 3', category: 'SCHRIFTSAETZE', tp: 'TP3A' },
  { id: 'tp3a_beweis', type: ServiceType.PLEADING_TP3A_I, short: 'Beweissicherung Antrag', full: 'TP 3A - Antrag Beweissicherung', category: 'SCHRIFTSAETZE', tp: 'TP3A' },
  { id: 'tp3a_ev', type: ServiceType.PLEADING_TP3A_I, short: 'Einstweilige Verfügung', full: 'TP 3A - EV (Antrag/Äußerung/Widerspruch)', category: 'SCHRIFTSAETZE', tp: 'TP3A' },
  { id: 'tp3a_kostenrekurs', type: ServiceType.PLEADING_TP3A_I, short: 'Kostenrekurs', full: 'TP 3A - Kostenrekurs / Beantwortung', category: 'SCHRIFTSAETZE', tp: 'TP3A' },
  // Exekutionsverfahren
  { id: 'tp3a_vollstreckbarerklarung', type: ServiceType.PLEADING_TP3A_I, short: 'Vollstreckbarerklärung ausl.', full: 'TP 3A - Vollstreckbarerklärung ausländischer Titel', category: 'SCHRIFTSAETZE', tp: 'TP3A', procedureTypes: [ProcedureType.EXEKUTION] },
  { id: 'tp3a_widerspruch_vollstreckbar', type: ServiceType.PLEADING_TP3A_I, short: 'Widerspruch Vollstreckbarerklärung', full: 'TP 3A - Widerspruch gegen Vollstreckbarerklärung', category: 'SCHRIFTSAETZE', tp: 'TP3A', procedureTypes: [ProcedureType.EXEKUTION] },
  // Außerstreitiges Verfahren
  { id: 'tp3a_ausserstr', type: ServiceType.PLEADING_TP3A_I, short: 'Einleitender Antrag (AußStr)', full: 'TP 3A - Einleitender Antrag AußStr', category: 'SCHRIFTSAETZE', tp: 'TP3A', procedureTypes: [ProcedureType.AUSSERSTREIT] },
  { id: 'tp3a_ausserstr_aeusserung', type: ServiceType.PLEADING_TP3A_I, short: 'Äußerung (AußStr, ausf.)', full: 'TP 3A - Äußerung zu verfahrenseinl. Antrag', category: 'SCHRIFTSAETZE', tp: 'TP3A', procedureTypes: [ProcedureType.AUSSERSTREIT] },
  { id: 'tp3a_ausserstr_aufgetragen', type: ServiceType.PLEADING_TP3A_I, short: 'Aufgetragener Schriftsatz', full: 'TP 3A - Aufgetragener Schriftsatz mit Sachvorbringen', category: 'SCHRIFTSAETZE', tp: 'TP3A', procedureTypes: [ProcedureType.AUSSERSTREIT] },
  // Insolvenz- und Restrukturierungsverfahren
  { id: 'tp3a_inso', type: ServiceType.PLEADING_TP3A_I, short: 'Sanierung / Restrukturierung', full: 'TP 3A - Sanierung / Restrukturierung', category: 'SCHRIFTSAETZE', tp: 'TP3A', procedureTypes: [ProcedureType.INSOLVENZ] },
  { id: 'tp3a_absonderung', type: ServiceType.PLEADING_TP3A_I, short: 'Absonderungs-/Aussonderungsrecht', full: 'TP 3A - Absonderungs-/Aussonderungsrecht', category: 'SCHRIFTSAETZE', tp: 'TP3A', procedureTypes: [ProcedureType.INSOLVENZ] },

  // --- TP 3B Schriftsätze (Rechtsmittel 2. Instanz) ---
  { id: 'tp3b_berufung', type: ServiceType.PLEADING_TP3B, short: 'Berufung / Rekurs', full: 'TP 3B - Berufung / Rekurs / Beschwerde', category: 'SCHRIFTSAETZE', tp: 'TP3B' },
  { id: 'tp3b_bb', type: ServiceType.PLEADING_TP3B, short: 'Berufungsbeantwortung', full: 'TP 3B - Berufungs-/Rekursbeantwortung', category: 'SCHRIFTSAETZE', tp: 'TP3B' },
  { id: 'tp3b_anschluss', type: ServiceType.PLEADING_TP3B_IA, short: 'Anschluss-RM (§ 473a ZPO)', full: 'TP 3B - Schriftsatz § 473a ZPO', category: 'SCHRIFTSAETZE', tp: 'TP3B' },

  // --- TP 3C Schriftsätze (OGH / EuGH) - Zivilprozess ---
  { id: 'tp3c_revision', type: ServiceType.PLEADING_TP3C, short: 'Revision / Revisionsrekurs', full: 'TP 3C - Revision / Revisionsrekurs', category: 'SCHRIFTSAETZE', tp: 'TP3C', procedureTypes: [ProcedureType.ZIVILPROZESS, ProcedureType.AUSSERSTREIT, ProcedureType.INSOLVENZ] },
  { id: 'tp3c_rb', type: ServiceType.PLEADING_TP3C, short: 'Revisionsbeantwortung', full: 'TP 3C - Revisions-/Revisionsrekursbeantw.', category: 'SCHRIFTSAETZE', tp: 'TP3C', procedureTypes: [ProcedureType.ZIVILPROZESS, ProcedureType.AUSSERSTREIT, ProcedureType.INSOLVENZ] },
  { id: 'tp3c_verband', type: ServiceType.PLEADING_TP3C, short: 'Verbandsklage Schriftsatz', full: 'TP 3C - Verbandsklage Schriftsatz', category: 'SCHRIFTSAETZE', tp: 'TP3C', procedureTypes: [ProcedureType.ZIVILPROZESS] },

  // ═══════════════════════════════════════════════════════════════════════════
  // EXEKUTIONSVERFAHREN (GGG TP 4)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- 1. Instanz (GGG TP 4 Z I) ---
  // Exekutionsantrag und Einwendungen (erstinstanzliches Rechtsmittel) = doppelt ES per Default
  { id: 'ex_antrag', type: ServiceType.PLEADING_TP2, short: 'Exekutionsantrag', full: 'GGG TP 4 Z I - Exekutionsantrag', category: 'SCHRIFTSAETZE', tp: 'TP2', procedureTypes: [ProcedureType.EXEKUTION], defaultEsMultiplier: 2 },
  { id: 'ex_fahrnisex', type: ServiceType.PLEADING_TP2, short: 'Fahrnisexekution', full: 'GGG TP 4 Z I - Fahrnisexekution § 249 EO', category: 'SCHRIFTSAETZE', tp: 'TP2', procedureTypes: [ProcedureType.EXEKUTION], defaultEsMultiplier: 2 },
  { id: 'ex_forderungsex', type: ServiceType.PLEADING_TP2, short: 'Forderungsexekution', full: 'GGG TP 4 Z I - Forderungsexekution § 294 EO', category: 'SCHRIFTSAETZE', tp: 'TP2', procedureTypes: [ProcedureType.EXEKUTION], defaultEsMultiplier: 2 },
  { id: 'ex_zwangsversteigerung', type: ServiceType.PLEADING_TP3A_I, short: 'Zwangsversteigerung', full: 'GGG TP 4 Z I - Zwangsversteigerung §§ 133 ff EO', category: 'SCHRIFTSAETZE', tp: 'TP3A', procedureTypes: [ProcedureType.EXEKUTION], defaultEsMultiplier: 2 },
  { id: 'ex_zwangsverwaltung', type: ServiceType.PLEADING_TP3A_I, short: 'Zwangsverwaltung', full: 'GGG TP 4 Z I - Zwangsverwaltung §§ 97 ff EO', category: 'SCHRIFTSAETZE', tp: 'TP3A', procedureTypes: [ProcedureType.EXEKUTION], defaultEsMultiplier: 2 },
  { id: 'ex_widerspruch', type: ServiceType.PLEADING_TP3A_I, short: 'Widerspruch § 37 EO', full: 'GGG TP 4 Z I - Widerspruch § 37 EO', category: 'SCHRIFTSAETZE', tp: 'TP3A', procedureTypes: [ProcedureType.EXEKUTION], defaultEsMultiplier: 2 },
  { id: 'ex_impugnation', type: ServiceType.PLEADING_TP3A_I, short: 'Impugnationsklage § 36 EO', full: 'GGG TP 4 Z I - Impugnationsklage § 36 EO', category: 'SCHRIFTSAETZE', tp: 'TP3A', procedureTypes: [ProcedureType.EXEKUTION], defaultEsMultiplier: 2 },
  { id: 'ex_opposition', type: ServiceType.PLEADING_TP3A_I, short: 'Oppositionsklage § 35 EO', full: 'GGG TP 4 Z I - Oppositionsklage § 35 EO', category: 'SCHRIFTSAETZE', tp: 'TP3A', procedureTypes: [ProcedureType.EXEKUTION], defaultEsMultiplier: 2 },
  // Einwendungen § 68 EO = erstinstanzliches Rechtsmittel gegen Exekutionsbewilligung = doppelt ES
  { id: 'ex_einwendungen', type: ServiceType.PLEADING_TP2, short: 'Einwendungen § 68 EO', full: 'GGG TP 4 Z I - Einwendungen gegen Exekutionsbewilligung', category: 'SCHRIFTSAETZE', tp: 'TP2', procedureTypes: [ProcedureType.EXEKUTION], defaultEsMultiplier: 2 },
  { id: 'ex_aeusserung', type: ServiceType.PLEADING_TP2, short: 'Äußerung zu Einwendungen', full: 'GGG TP 4 Z I - Äußerung zu Einwendungen', category: 'SCHRIFTSAETZE', tp: 'TP2', procedureTypes: [ProcedureType.EXEKUTION], defaultEsMultiplier: 2 },
  { id: 'ex_vollzugsantrag', type: ServiceType.PLEADING_TP1, short: 'Vollzugsantrag § 249a EO', full: 'GGG TP 4 Z I - Vollzugsantrag § 249a EO', category: 'SCHRIFTSAETZE', tp: 'TP1', procedureTypes: [ProcedureType.EXEKUTION] },
  { id: 'ex_einstellung', type: ServiceType.PLEADING_TP1, short: 'Einstellungsantrag', full: 'GGG TP 4 Z I - Einstellung / Einschränkung', category: 'SCHRIFTSAETZE', tp: 'TP1', procedureTypes: [ProcedureType.EXEKUTION] },
  { id: 'ex_aufschiebung', type: ServiceType.PLEADING_TP2, short: 'Aufschiebungsantrag § 42 EO', full: 'GGG TP 4 Z I - Aufschiebungsantrag § 42 EO', category: 'SCHRIFTSAETZE', tp: 'TP2', procedureTypes: [ProcedureType.EXEKUTION], defaultEsMultiplier: 2 },
  { id: 'ex_drittschuldner', type: ServiceType.PLEADING_TP2, short: 'Drittschuldnererklärung', full: 'GGG TP 4 Z I - Drittschuldnererklärung', category: 'SCHRIFTSAETZE', tp: 'TP2', procedureTypes: [ProcedureType.EXEKUTION] },

  // --- 2. Instanz (GGG TP 4 Z II) - Rechtsmittel = doppelt ES ---
  { id: 'ex_rekurs', type: ServiceType.PLEADING_TP3B, short: 'Rekurs (Exekution)', full: 'GGG TP 4 Z II - Rekurs im Exekutionsverfahren', category: 'SCHRIFTSAETZE', tp: 'TP3B', procedureTypes: [ProcedureType.EXEKUTION], defaultEsMultiplier: 2 },
  { id: 'ex_rekursbeantwortung', type: ServiceType.PLEADING_TP3B, short: 'Rekursbeantwortung (Exek.)', full: 'GGG TP 4 Z II - Rekursbeantwortung', category: 'SCHRIFTSAETZE', tp: 'TP3B', procedureTypes: [ProcedureType.EXEKUTION], defaultEsMultiplier: 2 },

  // --- 3. Instanz (GGG TP 4 Z III) - Rechtsmittel = doppelt ES ---
  { id: 'ex_revisionsrekurs', type: ServiceType.PLEADING_TP3C, short: 'Revisionsrekurs (Exekution)', full: 'GGG TP 4 Z III - Revisionsrekurs', category: 'SCHRIFTSAETZE', tp: 'TP3C', procedureTypes: [ProcedureType.EXEKUTION], defaultEsMultiplier: 2 },
  { id: 'ex_revisionsrekurs_beantwortung', type: ServiceType.PLEADING_TP3C, short: 'Revisionsrekursbeantw. (Exek.)', full: 'GGG TP 4 Z III - Revisionsrekursbeantwortung', category: 'SCHRIFTSAETZE', tp: 'TP3C', procedureTypes: [ProcedureType.EXEKUTION], defaultEsMultiplier: 2 },

  // ═══════════════════════════════════════════════════════════════════════════

  // HINWEIS: TP 4 Strafsachen (Privatanklage, Mediengesetz, Privatbeteiligte)
  // werden im Straf-Modus separat behandelt und nicht im Zivil-Katalog angezeigt.

  // --- TP 5 Einfaches Schreiben ---
  // Fix: Use correct ServiceType PLEADING_TP5
  { id: 'tp5_schreiben', type: ServiceType.PLEADING_TP5, short: 'Einfaches Schreiben', full: 'TP 5 - Einfaches Schreiben (kein Erkenntnis)', category: 'SCHRIFTSAETZE', tp: 'TP5' },

  // --- TP 6 Anderer Brief ---
  // Fix: Use correct ServiceType PLEADING_TP6
  { id: 'tp6_brief', type: ServiceType.PLEADING_TP6, short: 'Anderer Brief', full: 'TP 6 - Anderer Brief / Korrespondenz', category: 'SCHRIFTSAETZE', tp: 'TP6' },

  // ═══════════════════════════════════════════════════════════════════════════
  // TERMINE / TAGSATZUNGEN
  // ═══════════════════════════════════════════════════════════════════════════

  // --- TP 2 Tagsatzungen (Zivilprozess) ---
  { id: 'tp2_ts_erstreckt', type: ServiceType.HEARING_TP2_II, short: 'TS erstreckt', full: 'TP 2 - Erstreckte Tagsatzung', category: 'TERMINE', tp: 'TP2', procedureTypes: [ProcedureType.ZIVILPROZESS, ProcedureType.AUSSERSTREIT] },
  { id: 'tp2_ts_vu', type: ServiceType.HEARING_TP2_II, short: 'TS VU/Vergleich/Anerkenntnis', full: 'TP 2 - TS VU / Vergleich / Anerkenntnis', category: 'TERMINE', tp: 'TP2', procedureTypes: [ProcedureType.ZIVILPROZESS, ProcedureType.AUSSERSTREIT] },
  { id: 'tp2_ts_vergleich', type: ServiceType.HEARING_TP2_II, short: 'TS nur Vergleichszweck', full: 'TP 2 - TS Vergleichszweck', category: 'TERMINE', tp: 'TP2', procedureTypes: [ProcedureType.ZIVILPROZESS, ProcedureType.AUSSERSTREIT] },
  { id: 'tp2_ts_inso', type: ServiceType.HEARING_TP2_II_INSOLVENCY, short: 'TS Insolvenz (Std.)', full: 'TP 2 - Gläubigervertreter TS Insolvenz', category: 'TERMINE', tp: 'TP2', procedureTypes: [ProcedureType.INSOLVENZ] },

  // --- TP 3A Tagsatzungen (Zivilprozess) ---
  { id: 'tp3a_ts', type: ServiceType.HEARING_TP3A_II, short: 'Tagsatzung (Std.)', full: 'TP 3A - Tagsatzung (pro Stunde)', category: 'TERMINE', tp: 'TP3A', procedureTypes: [ProcedureType.ZIVILPROZESS, ProcedureType.AUSSERSTREIT, ProcedureType.INSOLVENZ] },
  { id: 'tp3a_befund', type: ServiceType.INSPECTION_TP3A_III, short: 'Befundaufnahme SV (Std.)', full: 'TP 3A - Befundaufnahme SV (pro Stunde)', category: 'TERMINE', tp: 'TP3A', procedureTypes: [ProcedureType.ZIVILPROZESS, ProcedureType.AUSSERSTREIT] },

  // --- TP 3B Verhandlung 2. Instanz (Zivilprozess) ---
  { id: 'tp3b_verhandlung', type: ServiceType.HEARING_TP3B_II, short: 'Verhandlung 2. Instanz (Std.)', full: 'TP 3B - Mündliche Verhandlung (pro Stunde)', category: 'TERMINE', tp: 'TP3B', procedureTypes: [ProcedureType.ZIVILPROZESS, ProcedureType.AUSSERSTREIT, ProcedureType.INSOLVENZ] },

  // --- TP 3C Verhandlungen OGH (Zivilprozess) ---
  { id: 'tp3c_verhandlung', type: ServiceType.HEARING_TP3C_II, short: 'Verhandlung OGH (Std.)', full: 'TP 3C - Verhandlung OGH (pro Stunde)', category: 'TERMINE', tp: 'TP3C', procedureTypes: [ProcedureType.ZIVILPROZESS, ProcedureType.AUSSERSTREIT, ProcedureType.INSOLVENZ] },
  { id: 'tp3c_eugh', type: ServiceType.HEARING_TP3C_III, short: 'EuGH-Verhandlung (Std.)', full: 'TP 3C - EuGH Vorabentscheidung (pro Stunde)', category: 'TERMINE', tp: 'TP3C', procedureTypes: [ProcedureType.ZIVILPROZESS] },
  { id: 'tp3c_verband_vh', type: ServiceType.HEARING_TP3C_II, short: 'Verbandsklage Verhandlung (Std.)', full: 'TP 3C - Verbandsklage Verhandlung', category: 'TERMINE', tp: 'TP3C', procedureTypes: [ProcedureType.ZIVILPROZESS] },

  // --- Exekutionsverfahren Termine (GGG TP 4) ---
  { id: 'ex_ts_impugnation', type: ServiceType.HEARING_TP3A_II, short: 'TS Impugnationsklage (Std.)', full: 'GGG TP 4 - Tagsatzung Impugnationsklage', category: 'TERMINE', tp: 'TP3A', procedureTypes: [ProcedureType.EXEKUTION] },
  { id: 'ex_ts_opposition', type: ServiceType.HEARING_TP3A_II, short: 'TS Oppositionsklage (Std.)', full: 'GGG TP 4 - Tagsatzung Oppositionsklage', category: 'TERMINE', tp: 'TP3A', procedureTypes: [ProcedureType.EXEKUTION] },
  { id: 'ex_ts_versteigerung', type: ServiceType.HEARING_TP3A_II, short: 'Versteigerungstermin (Std.)', full: 'GGG TP 4 - Versteigerungstermin', category: 'TERMINE', tp: 'TP3A', procedureTypes: [ProcedureType.EXEKUTION] },
  { id: 'ex_verh_rekurs', type: ServiceType.HEARING_TP3B_II, short: 'Rekursverhandlung (Std.)', full: 'GGG TP 4 Z II - Rekursverhandlung', category: 'TERMINE', tp: 'TP3B', procedureTypes: [ProcedureType.EXEKUTION] },

  // --- TP 4 Strafsachen Verhandlungen (nur für Straf-Modus, hier nicht angezeigt) ---
  // Diese werden im Straf-Modus separat behandelt und nicht im Zivil-Katalog angezeigt

  // --- TP 7 Kommission ---
  { id: 'tp7_kommission', type: ServiceType.HEARING_TP3A_II, short: 'Kommission (Std.)', full: 'TP 7 - Kommission (pro Stunde)', category: 'TERMINE', tp: 'TP7' },

  // --- TP 8 Besprechung ---
  { id: 'tp8_besprechung', type: ServiceType.HEARING_TP3A_II, short: 'Besprechung (Std.)', full: 'TP 8 - Besprechung mit Partei/Gegner', category: 'TERMINE', tp: 'TP8' },

  // --- Zuwarten / Abberaumung ---
  { id: 'zuwarten_tp2', type: ServiceType.WAITING_TIME, short: 'Zuwarten (TP 2)', full: 'TP 2 Anm 2 - Zeit des Zuwartens', category: 'TERMINE', tp: 'TP2', procedureTypes: [ProcedureType.ZIVILPROZESS, ProcedureType.AUSSERSTREIT] },
  { id: 'zuwarten_tp3', type: ServiceType.WAITING_TIME, short: 'Zuwarten (TP 3)', full: 'TP 3 Anm 2 - Zeit des Zuwartens', category: 'TERMINE', tp: 'TP3', procedureTypes: [ProcedureType.ZIVILPROZESS, ProcedureType.AUSSERSTREIT, ProcedureType.EXEKUTION] },
  { id: 'abberaumt_tp2', type: ServiceType.CANCELLED_HEARING, short: 'Abberaumte TS (TP 2)', full: 'TP 2 Anm 3 - TS abberaumt', category: 'TERMINE', tp: 'TP2', procedureTypes: [ProcedureType.ZIVILPROZESS, ProcedureType.AUSSERSTREIT] },
  { id: 'abberaumt_tp3', type: ServiceType.CANCELLED_HEARING, short: 'Abberaumte TS (TP 3)', full: 'TP 3 Anm 3 - TS abberaumt', category: 'TERMINE', tp: 'TP3', procedureTypes: [ProcedureType.ZIVILPROZESS, ProcedureType.AUSSERSTREIT, ProcedureType.EXEKUTION] },

  // ═══════════════════════════════════════════════════════════════════════════
  // ENTSCHÄDIGUNG (TP 9)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- TP 9 Entschädigung ---
  { id: 'tp9_weg_z1', type: ServiceType.PLEADING_TP1, short: 'Weg (Z 1-4)', full: 'TP 9 Z 1-4 - Wegentschädigung', category: 'ENTSCHAEDIGUNG', tp: 'TP9' },
  { id: 'tp9_zeit_z4', type: ServiceType.PLEADING_TP1, short: 'Zeit (Z 4)', full: 'TP 9 Z 4 - Zeitversäumnis', category: 'ENTSCHAEDIGUNG', tp: 'TP9' },
  { id: 'tp9_versaeumnis', type: ServiceType.PLEADING_TP1, short: 'Versäumnis', full: 'TP 9 - Versäumnisentschädigung', category: 'ENTSCHAEDIGUNG', tp: 'TP9' },
];

// Tarifposten die für alle Verfahrensarten gelten (auch ohne explizite procedureTypes)
const UNIVERSAL_TPS = ['TP1', 'TP5', 'TP6', 'TP7', 'TP8', 'TP9'];

// Katalog nach Verfahrensart filtern
export function getFilteredCatalog(procedureType: ProcedureType): CatalogEntry[] {
  // String-basierter Vergleich für Exekution (da EXEKUTION und EXECUTION denselben Wert haben)
  const isExekution = String(procedureType) === String(ProcedureType.EXEKUTION);

  return SERVICE_CATALOG.filter(entry => {
    // Wenn explizit procedureTypes definiert sind, diese prüfen
    if (entry.procedureTypes && entry.procedureTypes.length > 0) {
      return entry.procedureTypes.some(pt =>
        // String-basierter Vergleich für enum alias compatibility
        String(pt) === String(procedureType)
      );
    }

    // Universelle Tarifposten (TP1, TP5, TP6, TP7, TP8, TP9) gelten für alle
    if (UNIVERSAL_TPS.includes(entry.tp)) {
      return true;
    }

    // TP2, TP3A, TP3B, TP3C ohne procedureTypes:
    // Bei Exekution ausblenden (da eigene Exekution-Einträge existieren)
    if (isExekution) {
      return false;
    }

    // Für alle anderen Verfahrensarten: Standardeinträge anzeigen
    return true;
  });
}

// Gruppierter Katalog nach Kategorie und TP (gefiltert nach Verfahrensart)
export function getGroupedCatalog(procedureType?: ProcedureType): Record<CatalogCategory, Record<string, CatalogEntry[]>> {
  const grouped: Record<CatalogCategory, Record<string, CatalogEntry[]>> = {
    SCHRIFTSAETZE: {},
    TERMINE: {},
    ENTSCHAEDIGUNG: {}
  };

  const entries = procedureType ? getFilteredCatalog(procedureType) : SERVICE_CATALOG;

  for (const entry of entries) {
    if (!grouped[entry.category][entry.tp]) {
      grouped[entry.category][entry.tp] = [];
    }
    grouped[entry.category][entry.tp].push(entry);
  }

  return grouped;
}