

export enum DurationUnit {
  DAYS = 'Tage',
  WEEKS = 'Wochen',
  MONTHS = 'Monate',
}

export interface DeadlineParams {
  startDate: string;
  amount: number;
  unit: DurationUnit;
  useSuspension: boolean;
}

export interface DeadlineResult {
  startDate: Date;
  nominalEnd: Date;
  finalEnd: Date;
  isShifted: boolean;
  shiftReason: string | null;
  suspensionDaysAdded: number;
  trace: string[];
}

// Added missing types for legal cost calculation logic
// used in lib/calculator.ts, lib/catalog.ts and lib/pdfGenerator.ts

export enum ServiceType {
  PLEADING_TP1 = 'PLEADING_TP1',
  PLEADING_TP2 = 'PLEADING_TP2',
  HEARING_TP2_II = 'HEARING_TP2_II',
  HEARING_TP2_II_INSOLVENCY = 'HEARING_TP2_II_INSOLVENCY',
  WAITING_TIME = 'WAITING_TIME',
  CANCELLED_HEARING = 'CANCELLED_HEARING',
  PLEADING_TP3A_I = 'PLEADING_TP3A_I',
  HEARING_TP3A_II = 'HEARING_TP3A_II',
  INSPECTION_TP3A_III = 'INSPECTION_TP3A_III',
  PLEADING_TP3B = 'PLEADING_TP3B',
  PLEADING_TP3B_IA = 'PLEADING_TP3B_IA',
  HEARING_TP3B_II = 'HEARING_TP3B_II',
  PLEADING_TP3C = 'PLEADING_TP3C',
  HEARING_TP3C_II = 'HEARING_TP3C_II',
  HEARING_TP3C_III = 'HEARING_TP3C_III',
  // Fix: Added missing PLEADING_TP5 and PLEADING_TP6 for RATG TP5/6 support
  PLEADING_TP5 = 'PLEADING_TP5',
  PLEADING_TP6 = 'PLEADING_TP6',
  // TP4 Strafsachen - Schriftsätze (6 Varianten)
  PLEADING_TP4_PRIVATANKLAGE_BG = 'PLEADING_TP4_PRIVATANKLAGE_BG',
  PLEADING_TP4_PRIVATANKLAGE_ANDERE = 'PLEADING_TP4_PRIVATANKLAGE_ANDERE',
  PLEADING_TP4_MEDIENGESETZ = 'PLEADING_TP4_MEDIENGESETZ',
  PLEADING_TP4_PRIVATBET_BG = 'PLEADING_TP4_PRIVATBET_BG',
  PLEADING_TP4_PRIVATBET_ANDERE = 'PLEADING_TP4_PRIVATBET_ANDERE',
  PLEADING_TP4_AUSGESCHL_OEFF = 'PLEADING_TP4_AUSGESCHL_OEFF',
  // TP4 Strafsachen - Verhandlungen (6 Varianten)
  HEARING_TP4_PRIVATANKLAGE_BG = 'HEARING_TP4_PRIVATANKLAGE_BG',
  HEARING_TP4_PRIVATANKLAGE_ANDERE = 'HEARING_TP4_PRIVATANKLAGE_ANDERE',
  HEARING_TP4_MEDIENGESETZ = 'HEARING_TP4_MEDIENGESETZ',
  HEARING_TP4_PRIVATBET_BG = 'HEARING_TP4_PRIVATBET_BG',
  HEARING_TP4_PRIVATBET_ANDERE = 'HEARING_TP4_PRIVATBET_ANDERE',
  HEARING_TP4_AUSGESCHL_OEFF = 'HEARING_TP4_AUSGESCHL_OEFF',
}

export interface LegalService {
  id: string;
  date: string;
  label: string;
  type: ServiceType;
  isInitiating?: boolean;
  isAuswaerts?: boolean;
  durationHours: number;
  waitingUnits?: number;
  customESRate?: number;
  esMultiplier: number;
  includeErv: boolean;
  ervRateOverride?: 'initial' | 'regular';
  customBmgl?: number; // Eigener Streitwert für diese Leistung (überschreibt Basispanel)
  customParties?: number; // Eigene Streitgenossen für diese Leistung (überschreibt Basispanel)
  verbindung?: 'keine' | 'vorab' | 'wohnort' | 'andere'; // e.V. Verbindung: keine, Vorabentscheidung (50%), Wohnort (10%), andere (25%)
  is473aZPO?: boolean; // TP 3B Ia: nach § 473a ZPO → Entlohnung halbiert
  isRaRaaErforderlich?: boolean; // TP 7: false = TP 7/1 (Gehilfe), true = TP 7/2 (RA/RAA erforderlich)
  tp?: string; // Tarifpost aus Katalog (z.B. 'TP7', 'TP5', etc.)
}

export enum PleadingSubtype {
  STANDARD = 'standard',
  AUSFUEHRLICH = 'ausfuehrlich',
}

export interface CalculatedLine {
  date: string;
  label: string;
  section: string;
  interval: string;
  vatRate: number;
  amountCents: number;
  bmglCents: number;
  calculationTrace: string;
  serviceId: string;
}

export interface TotalResult {
  lines: CalculatedLine[];
  netCents: number;
  vatCents: number;
  gggCents: number;
  totalCents: number;
}

export enum ProcedureType {
  ZIVILPROZESS = 'Zivilprozess',
  EXEKUTION = 'Exekutionsverfahren',
  AUSSERSTREIT = 'Außerstreitverfahren',
  INSOLVENZ = 'Insolvenzverfahren',
  // Aliases for reference design compatibility
  CIVIL = 'Zivilprozess',
  EXECUTION = 'Exekutionsverfahren',
  NON_CONTENTIOUS = 'Außerstreitverfahren',
  INSOLVENCY = 'Insolvenzverfahren',
  OTHER = 'Sonstiges',
}

// ============================================================================
// STRAFVERFAHREN - AHK §§ 9-10
// ============================================================================

export enum CaseMode {
  CIVIL = 'CIVIL',
  CRIMINAL = 'CRIMINAL',
  DETENTION = 'DETENTION', // Haftrecht (§ 10 AHK)
}

// Re-export AHK types
export type { CourtType, StrafLeistungType, TagsatzungTarif } from './lib/ahk';

export interface StrafService {
  id: string;
  date: string;
  label: string;
  leistungType: import('./lib/ahk').StrafLeistungType;
  durationHalbeStunden: number; // Dauer in halben Stunden (für Tagsatzungen)
  waitingHalbeStunden: number; // Wartezeit in halben Stunden
  esMultiplier: number; // 0 = keiner, 1 = einfach, 2 = doppelt
  includeErv: boolean;
  ervRateOverride?: 'initial' | 'regular';
  // Straf-spezifisch
  customStreitgenossen?: number; // Eigene Streitgenossen für diese Leistung (30% × n)
  isFrustriert?: boolean; // Frustrierte Tagsatzung
  nbUndBerufung?: boolean; // § 9 Abs 2: +20% bei NB + Berufung kombiniert
  verteidigerUndPb?: boolean; // § 10 Abs 5: auch PB-Vertreter für dieselbe Person
}

// ============================================================================
// HAFTRECHT - AHK § 9 Abs 1 Z 5 + § 10
// ============================================================================

export type HaftLeistungType =
  // § 9 Abs 1 Z 5 AHK - Haftverfahren
  | 'HAFT_VH_1_INSTANZ'         // a) Verhandlungen 1. Instanz
  | 'HAFT_GRUNDRECHTSBESCHWERDE' // b) Grundrechtsbeschwerde
  | 'HAFT_BESCHWERDE_SONST'      // b) Sonstige Beschwerden
  | 'HAFT_VH_2_INSTANZ'          // c) Verhandlungen 2. Instanz
  // § 10 AHK - RATG Anwendung
  | 'HAFT_BESUCH'                // TP 7/2 - Besuch in Haftanstalt
  | 'HAFT_ANTRAG_TP3A'           // TP 3A - Enthaftungsantrag, EV-Antrag
  | 'HAFT_BESCHWERDE_TP3B'       // TP 3B - Beschwerden §§ 87, 106 StPO
  | 'HAFT_KURZANTRAG_TP2'        // TP 2 - Kurze Anträge
  | 'HAFT_ZUWARTEN'              // TP 7/2 - Zuwarten (§ 9 Abs 4)
  // Barauslagen
  | 'HAFT_REISEKOSTEN'           // TP 9/3 - €0,50/km
  | 'HAFT_REISEZEIT';            // TP 9/4 - Reisezeit pro halbe Stunde

export type HaftBmglStufe =
  | 'BG'           // € 7.800 - Bezirksgericht
  | 'ER_GH'        // € 18.000 - Einzelrichter Gerichtshof
  | 'SCHOEFFEN'    // € 27.600 - Schöffengericht
  | 'GESCHWORENEN'; // € 33.200 - Geschworenengericht

export interface HaftService {
  id: string;
  date: string;
  label: string;
  leistungType: HaftLeistungType;
  durationHalbeStunden: number; // Dauer in halben Stunden
  waitingHalbeStunden: number;  // Wartezeit in halben Stunden
  esMultiplier: number;         // 0 = keiner, 1-4 = einfach bis vierfach
  includeErv: boolean;
  ervRateOverride?: 'initial' | 'regular'; // initial = € 5,00, regular = € 2,60
  // Haft-spezifisch
  kilometerHin?: number;        // Entfernung Kanzlei → Haftanstalt (einfach)
  isRueckfahrt?: boolean;       // Mit Rückfahrt (verdoppelt km)
  isFrustriert?: boolean;       // Frustrierte Verhandlung
}