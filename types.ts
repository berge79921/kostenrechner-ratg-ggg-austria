

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
  vollzugsgebuehr?: import('./lib/vollzugsgebuehren').VollzugsgebuehrType; // Vollzugsgebühr § 455 EO (nur Exekution)
  catalogId?: string; // ID aus dem Katalog für Vollzugsgebühr-Erkennung
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
  VSTRAF = 'VSTRAF',       // Verwaltungsstrafsachen (§ 13 AHK)
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

// ============================================================================
// VERWALTUNGSSTRAFSACHEN - AHK § 13
// ============================================================================

// BMGL-Stufe nach § 13 Abs 1 AHK
export type VStrafStufe =
  | 'Z1'    // bis € 730 → BG
  | 'Z2'    // bis € 2.180 → ER_GH
  | 'Z3'    // € 2.180-4.360 → SCHOEFFEN
  | 'Z4'    // über € 4.360 / + Haft → GESCHWORENEN
  | 'Z5'    // Finanzstrafverfahren → SCHOEFFEN
  | 'Z6A'   // Disziplinarverfahren leicht → BG
  | 'Z6B'   // Disziplinarverfahren mittel → ER_GH
  | 'Z6C';  // Disziplinarverfahren schwer → SCHOEFFEN

// Leistungstypen (analog Straf, § 9 sinngemäß)
export type VStrafLeistungType =
  // Verhandlungen
  | 'VSTRAF_VH_1_INSTANZ'        // VH 1. Instanz
  | 'VSTRAF_BERUFUNG_VH_VOLL'    // Berufungs-VH (volle Anfechtung)
  | 'VSTRAF_BERUFUNG_VH_STRAFE'  // Berufungs-VH (nur Strafhöhe, § 13 Abs 4)
  // Schriftsätze
  | 'VSTRAF_BESCHWERDE_VOLL'     // Beschwerde (volle Anfechtung)
  | 'VSTRAF_BESCHWERDE_STRAFE'   // Beschwerde nur Strafhöhe (§ 13 Abs 4)
  // RATG (§ 10 sinngemäß)
  | 'VSTRAF_RATG_TP2'            // TP 2 - Kurze Anträge
  | 'VSTRAF_RATG_TP3A'           // TP 3A - Anträge
  | 'VSTRAF_RATG_TP3B'           // TP 3B - Beschwerden
  | 'VSTRAF_RATG_TP7_2'          // TP 7/2 - Kommission
  | 'VSTRAF_ZUWARTEN';           // Zuwarten

export interface VStrafService {
  id: string;
  date: string;
  label: string;
  leistungType: VStrafLeistungType;
  durationHalbeStunden: number;  // Dauer in halben Stunden
  waitingHalbeStunden: number;   // Wartezeit in halben Stunden
  esMultiplier: number;          // 0-4
  includeErv: boolean;
  ervRateOverride?: 'initial' | 'regular';
  isNurStrafhoehe?: boolean;     // § 13 Abs 4: nur Strafhöhe → reduzierter Tarif
}

// ============================================================================
// KOSTENNOTE EXPORT/IMPORT - Falldaten
// ============================================================================

// Exekutions-spezifische Metadaten (nur bei ProcedureType.EXEKUTION)
export type TitelArt = 'Zahlungsbefehl' | 'Urteil' | 'Vergleich' | 'Beschluss' | 'Sonstig';

// ============================================================================
// DRITTSCHULDNER - § 294 EO (Forderungsexekution)
// ============================================================================

export type DrittschuldnerTyp = 'PVA' | 'Bank' | 'Arbeitgeber' | 'Sonstig';

export interface Drittschuldner {
  id: string;
  typ: DrittschuldnerTyp;
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  iban?: string;
  bic?: string;
  rechtsgrund?: string;  // z.B. "Pension", "Gehalt", "Kontoguthaben"
}

export interface BekannteDrittschuldner {
  id: string;
  typ: DrittschuldnerTyp;
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  iban?: string;
  bic?: string;
}

// Bekannte Drittschuldner (Dropdown-Vorauswahl)
export const BEKANNTE_DRITTSCHULDNER: BekannteDrittschuldner[] = [
  // PVA
  {
    id: 'pva',
    typ: 'PVA',
    name: 'Pensionsversicherungsanstalt',
    strasse: 'Friedrich-Hillegeist-Straße 1',
    plz: '1021',
    ort: 'Wien',
  },
  // Banken (5 Demo, nur Raiffeisen mit vollständigen Daten)
  {
    id: 'raiffeisen_wienerwald',
    typ: 'Bank',
    name: 'Raiffeisenbank Wienerwald eGen',
    strasse: 'Hauptstraße 62',
    plz: '3021',
    ort: 'Pressbaum',
    iban: 'AT66 3225 0000 0070 6036',
    bic: 'RLNWATWWGTD',
  },
  {
    id: 'erste_bank',
    typ: 'Bank',
    name: 'Erste Bank der oesterreichischen Sparkassen AG',
    strasse: 'Am Belvedere 1',
    plz: '1100',
    ort: 'Wien',
  },
  {
    id: 'bank_austria',
    typ: 'Bank',
    name: 'UniCredit Bank Austria AG',
    strasse: 'Rothschildplatz 1',
    plz: '1020',
    ort: 'Wien',
  },
  {
    id: 'bawag',
    typ: 'Bank',
    name: 'BAWAG P.S.K. Bank für Arbeit und Wirtschaft und Österreichische Postsparkasse AG',
    strasse: 'Wiedner Gürtel 11',
    plz: '1100',
    ort: 'Wien',
  },
  {
    id: 'raiffeisen_noe_wien',
    typ: 'Bank',
    name: 'Raiffeisen Landesbank Niederösterreich-Wien AG',
    strasse: 'Friedrich-Wilhelm-Raiffeisen-Platz 1',
    plz: '1020',
    ort: 'Wien',
  },
];

export interface FruehereKosten {
  gericht: string;
  gz: string;
  betrag: number;
}

export interface ExekutionMetadata {
  // Verpflichtete Partei (Schuldner)
  verpflichteterName: string;
  verpflichteterStrasse: string;
  verpflichteterPlz: string;
  verpflichteterOrt: string;
  verpflichteterLand: string;          // z.B. "Österreich", "Italien"
  verpflichteterGeburtsdatum: string;  // TT.MM.JJJJ
  verpflichteterFirmenbuchNr?: string; // bei juristischen Personen

  // Exekutionstitel
  titelArt: TitelArt;
  titelGericht: string;                // z.B. "LG Wiener Neustadt"
  titelGZ: string;                     // z.B. "56 Cg 50/23p"
  titelDatum: string;                  // TT.MM.JJJJ
  vollstreckbarkeitDatum: string;      // TT.MM.JJJJ

  // Forderung aus Titel
  kapitalforderung: number;            // in Euro
  zinsenProzent: number;               // z.B. 4 oder 8
  zinsenBasis: number;                 // Betrag für Zinsen
  zinsenAb: string;                    // Datum TT.MM.JJJJ
  kostenAusTitel: number;              // Kosten aus dem Titel

  // Frühere Exekutionen (optional)
  fruehereKosten: FruehereKosten[];

  // Drittschuldner (§ 294 EO)
  drittschuldner: Drittschuldner[];
}

export const DEFAULT_EXEKUTION_METADATA: ExekutionMetadata = {
  verpflichteterName: '',
  verpflichteterStrasse: '',
  verpflichteterPlz: '',
  verpflichteterOrt: '',
  verpflichteterLand: '',
  verpflichteterGeburtsdatum: '',
  titelArt: 'Zahlungsbefehl',
  titelGericht: '',
  titelGZ: '',
  titelDatum: '',
  vollstreckbarkeitDatum: '',
  kapitalforderung: 0,
  zinsenProzent: 4,
  zinsenBasis: 0,
  zinsenAb: '',
  kostenAusTitel: 0,
  fruehereKosten: [],
  drittschuldner: [],
};

// ============================================================================
// ZIVILPROZESS - Klagen (wir können Kläger ODER Beklagte vertreten)
// ============================================================================

export type KlageArt = 'Mahnklage' | 'Klage' | 'Zahlungsbefehl' | 'Sonstig';
export type VerfahrensStatus = 'offen' | 'ZB_erlassen' | 'zugestellt' | 'Einspruch' | 'streitig' | 'abgeschlossen';
export type VertretenePartei = 'klaeger' | 'beklagte';

export interface ZivilprozessMetadata {
  // Welche Partei vertreten wir?
  vertretenePartei: VertretenePartei;

  // Kläger (aus Dokument)
  klaegerName: string;
  klaegerStrasse: string;
  klaegerPlz: string;
  klaegerOrt: string;
  klaegerLand: string;              // z.B. "Italien"
  klaegerGeburtsdatum: string;      // TT.MM.JJJJ

  // Klagevertreter (Anwalt des Klägers)
  klagevertreterName: string;
  klagevertreterStrasse: string;
  klagevertreterPlz: string;
  klagevertreterOrt: string;
  klagevertreterCode: string;       // R-Code z.B. "R210380"
  klagevertreterZeichen: string;    // Aktenzeichen z.B. "KoP/Pfeffer25"

  // Beklagte (aus Dokument)
  beklagterName: string;
  beklagterStrasse: string;
  beklagterPlz: string;
  beklagterOrt: string;
  beklagterLand: string;
  beklagterGeburtsdatum: string;

  // Beklagtenvertreter (Anwalt der Beklagten)
  beklagtenvertreterName: string;
  beklagtenvertreterStrasse: string;
  beklagtenvertreterPlz: string;
  beklagtenvertreterOrt: string;
  beklagtenvertreterCode: string;
  beklagtenvertreterZeichen: string;

  // Verfahren
  klageArt: KlageArt;
  klageGericht: string;             // z.B. "LGZ Wien"
  gerichtsabteilung: string;        // z.B. "003"
  klageGZ: string;                  // z.B. "3 Cg 165/25 v"
  einbringungsDatum: string;        // TT.MM.JJJJ
  fallcode: string;                 // z.B. "12A"
  klagegegenstand: string;          // Kurzbeschreibung

  // Forderung
  kapitalforderung: number;         // in Euro
  nebenforderung: number;           // in Euro
  zinsenProzent: number;
  zinsenAb: string;                 // TT.MM.JJJJ

  // Status
  verfahrensStatus: VerfahrensStatus;
  zustellungsDatum?: string;        // Wann Klage zugestellt
  einspruchsfrist?: string;         // Fristende für Einspruch/KB
}

export const DEFAULT_ZIVILPROZESS_METADATA: ZivilprozessMetadata = {
  vertretenePartei: 'beklagte',
  klaegerName: '',
  klaegerStrasse: '',
  klaegerPlz: '',
  klaegerOrt: '',
  klaegerLand: '',
  klaegerGeburtsdatum: '',
  klagevertreterName: '',
  klagevertreterStrasse: '',
  klagevertreterPlz: '',
  klagevertreterOrt: '',
  klagevertreterCode: '',
  klagevertreterZeichen: '',
  beklagterName: '',
  beklagterStrasse: '',
  beklagterPlz: '',
  beklagterOrt: '',
  beklagterLand: '',
  beklagterGeburtsdatum: '',
  beklagtenvertreterName: '',
  beklagtenvertreterStrasse: '',
  beklagtenvertreterPlz: '',
  beklagtenvertreterOrt: '',
  beklagtenvertreterCode: '',
  beklagtenvertreterZeichen: '',
  klageArt: 'Mahnklage',
  klageGericht: '',
  gerichtsabteilung: '',
  klageGZ: '',
  einbringungsDatum: '',
  fallcode: '',
  klagegegenstand: '',
  kapitalforderung: 0,
  nebenforderung: 0,
  zinsenProzent: 4,
  zinsenAb: '',
  verfahrensStatus: 'offen',
};

export interface CaseMetadata {
  // Fall-Identifikation
  geschaeftszahl: string;      // z.B. "1 Cg 123/24k"
  gericht: string;             // z.B. "LG Wien"
  // Vertretene Partei (= Betreibende Partei bei Exekution)
  parteiName: string;
  parteiStrasse: string;
  parteiPlz: string;
  parteiOrt: string;
  parteiLand: string;                // z.B. "Österreich", "Italien"
  // Kanzlei (eigene Daten)
  kanzleiName: string;
  kanzleiStrasse: string;
  kanzleiPlz: string;
  kanzleiOrt: string;
  // Meta
  erstelltAm: string;          // ISO date YYYY-MM-DD
  version: string;             // CSV format version
  // Exekution-spezifisch (nur bei ProcedureType.EXEKUTION)
  exekution?: ExekutionMetadata;
  // Zivilprozess-spezifisch (eingehende Klage, wir sind Beklagte)
  zivilprozess?: ZivilprozessMetadata;
}

export const DEFAULT_CASE_METADATA: CaseMetadata = {
  geschaeftszahl: '',
  gericht: '',
  parteiName: '',
  parteiStrasse: '',
  parteiPlz: '',
  parteiOrt: '',
  parteiLand: '',
  kanzleiName: '',
  kanzleiStrasse: '',
  kanzleiPlz: '',
  kanzleiOrt: '',
  erstelltAm: new Date().toISOString().split('T')[0],
  version: '1.0',
};

// Kanzleidaten für localStorage-Persistenz
export interface KanzleiData {
  kanzleiName: string;
  kanzleiStrasse: string;
  kanzleiPlz: string;
  kanzleiOrt: string;
}

// ============================================================================
// MULTI-KOSTENNOTEN-VERWALTUNG
// ============================================================================

export type AppView = 'list' | 'editor';

// Alle Berechnungsdaten einer Kostennote
export interface KostennoteState {
  caseMode: CaseMode;
  isVatFree: boolean;
  // Civil
  bmgl: number;
  procedureType: ProcedureType;
  additionalParties: number;
  autoGgg: boolean;
  manualGgg: number;
  isVerbandsklage: boolean;
  services: LegalService[];
  // Criminal
  courtType: import('./lib/ahk').CourtType;
  strafServices: StrafService[];
  strafStreitgenossen: number;
  erfolgszuschlagProzent: number;
  // Detention
  haftBmglStufe: HaftBmglStufe;
  haftServices: HaftService[];
  // VStraf
  vstrafStufe: VStrafStufe;
  vstrafVerfallswert: number;
  vstrafServices: VStrafService[];
  vstrafStreitgenossen: number;
  vstrafErfolgszuschlag: number;
  // Globale ES-Einstellung (beeinflusst ALLE Leistungen)
  mitES: boolean;             // true = ES aktiv, false = Einzelabrechnung
  auswaerts: boolean;         // true = doppelt, false = einfach (nur relevant wenn mitES=true)
}

// Gespeicherte Kostennote mit Metadaten
export interface SavedKostennote {
  id: string;                    // UUID
  createdAt: string;             // ISO date
  updatedAt: string;             // ISO date
  metadata: CaseMetadata;
  state: KostennoteState;
}

// Default-State für neue Kostennote
export const DEFAULT_KOSTENNOTE_STATE: KostennoteState = {
  caseMode: CaseMode.CIVIL,
  isVatFree: false,
  bmgl: 0,
  procedureType: ProcedureType.ZIVILPROZESS,
  additionalParties: 0,
  autoGgg: true,
  manualGgg: 0,
  isVerbandsklage: false,
  services: [],
  courtType: 'BG',
  strafServices: [],
  strafStreitgenossen: 0,
  erfolgszuschlagProzent: 0,
  haftBmglStufe: 'ER_GH',
  haftServices: [],
  vstrafStufe: 'Z2',
  vstrafVerfallswert: 0,
  vstrafServices: [],
  vstrafStreitgenossen: 0,
  vstrafErfolgszuschlag: 0,
  mitES: true,              // Default: mit ES
  auswaerts: true,          // Default: auswärts (doppelt)
};