/**
 * Wiki-Daten mit verifizierten RIS-Links (Stand: Jänner 2026)
 */

export const RIS_LINKS = {
  RATG: 'https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10002143',
  RATG_ANLAGE1: 'https://www.ris.bka.gv.at/NormDokument.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10002143&Anlage=1',
  RATG_15: 'https://www.ris.bka.gv.at/NormDokument.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10002143&Paragraf=15',
  GGG: 'https://ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10002667',
  GGG_TARIF: 'https://www.ris.bka.gv.at/NormDokument.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10002667&Anlage=1',
  StPO: 'https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10002326',
  StPO_381: 'https://www.ris.bka.gv.at/NormDokument.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10002326&Paragraf=381',
  ZPO: 'https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10001699',
  AHK: 'https://www.oerak.at/fileadmin/user_upload/Gesetzestexte/AHK/AHK_01102024.pdf',
  OERAK_GESETZE: 'https://www.oerak.at/kammer/gesetzestexte/',
} as const;

export interface TarifpostInfo {
  id: string;
  name: string;
  description: string;
  examples: string[];
  level: string;
}

export const RATG_TARIFPOSTEN: TarifpostInfo[] = [
  {
    id: 'TP1',
    name: 'Tarifpost 1',
    description: 'Anzeigen, einfache Mitteilungen, Urgenzschreiben',
    examples: ['Vollmachtsbekanntgabe', 'Urgenz', 'Anzeige eines Termins'],
    level: 'Einfach'
  },
  {
    id: 'TP2',
    name: 'Tarifpost 2',
    description: 'Mahnklagen, einfache Anträge, Schriftsätze ohne Sachvortrag',
    examples: ['Mahnklage', 'Antrag auf Kostenbestimmung', 'Einspruch'],
    level: 'Standard'
  },
  {
    id: 'TP3A',
    name: 'Tarifpost 3A',
    description: 'Klagen, Berufungen in 1./2. Instanz mit Sachvortrag',
    examples: ['Klage', 'Berufung an LG', 'Klagebeantwortung'],
    level: 'Qualifiziert'
  },
  {
    id: 'TP3B',
    name: 'Tarifpost 3B',
    description: 'Berufungen an LG als Rechtsmittelgericht, OLG',
    examples: ['Berufung an OLG', 'Berufungsbeantwortung'],
    level: 'Rechtsmittel'
  },
  {
    id: 'TP3C',
    name: 'Tarifpost 3C',
    description: 'Revisionen an den OGH',
    examples: ['Ordentliche Revision', 'Außerordentliche Revision', 'Revisionsbeantwortung'],
    level: 'Höchstgericht'
  },
  {
    id: 'TP5',
    name: 'Tarifpost 5',
    description: 'Kurze Briefe (streitwertabhängig)',
    examples: ['Kurze Mitteilungen an Partei', 'Einfache Korrespondenz'],
    level: 'Briefe'
  },
  {
    id: 'TP6',
    name: 'Tarifpost 6',
    description: 'Andere Briefe (Fixbeträge)',
    examples: ['Ausführliche Schreiben', 'Briefe mit Sachdarstellung'],
    level: 'Briefe'
  },
  {
    id: 'TP7',
    name: 'Tarifpost 7',
    description: 'Kommissionen (pro ½ Stunde)',
    examples: ['Erhebungen bei Gericht/Behörde', 'Intervention bei Exekution', 'Außergerichtliche Augenscheine'],
    level: 'Kommissionen'
  }
];

export interface RatgParagraphInfo {
  paragraph: string;
  title: string;
  description: string;
  risLink?: string;
  values?: string[];
}

export const RATG_PARAGRAPHEN: RatgParagraphInfo[] = [
  {
    paragraph: '§ 15',
    title: 'Streitgenossen',
    description: 'Zuschlag bei Vertretung mehrerer Parteien auf derselben Seite',
    risLink: RIS_LINKS.RATG_15,
    values: ['+10% (2 Pers.)', '+15% (3)', '+20% (4)', '+25% (5)', '+30% (6-9)', '+50% (10+)']
  },
  {
    paragraph: '§ 23',
    title: 'Einheitssatz',
    description: 'Pauschale für Nebenleistungen (Konferenzen, Aktenstudium)',
    values: ['60% bis € 10.170 BMGL', '50% über € 10.170 BMGL']
  },
  {
    paragraph: '§ 23a',
    title: 'ERV-Beitrag',
    description: 'Erhöhung der Entlohnung im elektronischen Rechtsverkehr',
    values: [
      '€ 5,00 verfahrenseinleitend',
      '€ 2,60 weitere Schriftsätze',
      '€ 9,50 GB/FB mit Urkunden'
    ]
  }
];

export interface GggTarifpostInfo {
  id: string;
  name: string;
  description: string;
  examples: string[];
  minFee: string;
}

export const GGG_TARIFPOSTEN: GggTarifpostInfo[] = [
  {
    id: 'TP1',
    name: 'TP 1',
    description: 'Klagen und verfahrenseinleitende Anträge (1. Instanz)',
    examples: ['Klage', 'Antrag auf einstw. Verfügung', 'Mahnklage'],
    minFee: 'ab € 26,00'
  },
  {
    id: 'TP2',
    name: 'TP 2',
    description: 'Rechtsmittel an die 2. Instanz',
    examples: ['Berufung', 'Rekurs'],
    minFee: 'ab € 33,00'
  },
  {
    id: 'TP3',
    name: 'TP 3',
    description: 'Rechtsmittel an die 3. Instanz (OGH)',
    examples: ['Revision', 'Revisionsrekurs', 'Außerordentliche Revision'],
    minFee: 'ab € 40,00'
  },
  {
    id: 'TP4',
    name: 'TP 4',
    description: 'Exekutionsanträge',
    examples: ['Fahrnisexekution', 'Forderungsexekution', 'Zwangsversteigerung'],
    minFee: 'ab € 23,00'
  }
];

// GGG Gebührentabelle TP1 (Stand April 2025)
export const GGG_GEBUEHREN_TP1 = [
  { bis: 150, gebuehr: 26 },
  { bis: 300, gebuehr: 50 },
  { bis: 700, gebuehr: 71 },
  { bis: 2000, gebuehr: 119 },
  { bis: 3500, gebuehr: 190 },
  { bis: 7000, gebuehr: 350 },
  { bis: 35000, gebuehr: 827 },
  { bis: 70000, gebuehr: 1626 },
  { bis: 140000, gebuehr: 3252 },
  { bis: 210000, gebuehr: 4880 },
  { bis: 280000, gebuehr: 6506 },
  { bis: 350000, gebuehr: 8132 },
];

export interface AhkSection {
  id: string;
  title: string;
  paragraph: string;
  description: string;
  items: { name: string; value: string }[];
}

export const AHK_SECTIONS: AhkSection[] = [
  {
    id: 'straf',
    title: 'Strafverteidigung',
    paragraph: '§§ 9-10 AHK',
    description: 'Honorarrahmen für Strafverteidigung (Stand: 1.10.2024)',
    items: [
      { name: 'Hauptverhandlung BG', value: '€ 500 – € 1.500' },
      { name: 'Hauptverhandlung LG (Einzelrichter)', value: '€ 800 – € 2.500' },
      { name: 'Hauptverhandlung LG (Schöffen)', value: '€ 1.500 – € 4.000' },
      { name: 'Hauptverhandlung LG (Geschworene)', value: '€ 2.500 – € 8.000' },
      { name: 'Berufung / Beschwerde', value: '€ 800 – € 3.000' },
      { name: 'Nichtigkeitsbeschwerde', value: '€ 1.500 – € 5.000' }
    ]
  },
  {
    id: 'vstraf',
    title: 'Verwaltungsstrafrecht',
    paragraph: '§ 13 AHK',
    description: 'Verwaltungsstrafverfahren und -beschwerden',
    items: [
      { name: 'Einspruch / Stellungnahme', value: '€ 300 – € 1.000' },
      { name: 'Verhandlung VwBehörde', value: '€ 400 – € 1.500' },
      { name: 'Beschwerde an BVwG/LVwG', value: '€ 600 – € 2.000' },
      { name: 'Verhandlung BVwG/LVwG', value: '€ 600 – € 2.000' }
    ]
  },
  {
    id: 'zivil',
    title: 'Zivilsachen (außergerichtlich)',
    paragraph: '§ 5 AHK',
    description: 'Für Fälle außerhalb des RATG-Anwendungsbereichs',
    items: [
      { name: 'Beratung (Erstgespräch)', value: '€ 150 – € 400' },
      { name: 'Schriftsatz (einfach)', value: '€ 300 – € 800' },
      { name: 'Schriftsatz (komplex)', value: '€ 600 – € 2.000' },
      { name: 'Stundensatz', value: '€ 200 – € 500' }
    ]
  }
];

// RATG Tariftabelle (Auszug, Stand Mai 2023)
export const RATG_TARIFE = [
  { bis: 150, tp1: 11.70, tp2: 17.90, tp3a: 35.10, tp3b: 43.30, tp3c: 52.50 },
  { bis: 300, tp1: 17.50, tp2: 26.60, tp3a: 52.50, tp3b: 65.00, tp3c: 78.60 },
  { bis: 700, tp1: 23.20, tp2: 35.10, tp3a: 69.80, tp3b: 86.60, tp3c: 104.60 },
  { bis: 1500, tp1: 25.50, tp2: 38.70, tp3a: 76.80, tp3b: 95.50, tp3c: 115.00 },
  { bis: 3000, tp1: 29.00, tp2: 43.70, tp3a: 87.00, tp3b: 108.30, tp3c: 130.20 },
  { bis: 7000, tp1: 34.80, tp2: 52.50, tp3a: 104.60, tp3b: 129.70, tp3c: 156.20 },
  { bis: 10170, tp1: 46.30, tp2: 69.80, tp3a: 139.10, tp3b: 173.10, tp3c: 208.20 },
  { bis: 36340, tp1: 115.50, tp2: 173.80, tp3a: 346.60, tp3b: 433.20, tp3c: 519.60 },
];

// Tagsatzungstarife (pro Stunde, Stand Mai 2023)
export const RATG_TAGSATZUNG = [
  { bis: 150, tp2: 26.90, tp3a: 52.70, tp3b: 65.00, tp3c: 78.80 },
  { bis: 300, tp2: 39.90, tp3a: 78.80, tp3b: 97.50, tp3c: 117.90 },
  { bis: 700, tp2: 52.70, tp3a: 104.70, tp3b: 129.90, tp3c: 156.90 },
  { bis: 1500, tp2: 58.10, tp3a: 115.20, tp3b: 143.30, tp3c: 172.50 },
  { bis: 3000, tp2: 65.60, tp3a: 130.50, tp3b: 162.50, tp3c: 195.30 },
  { bis: 7000, tp2: 78.80, tp3a: 156.90, tp3b: 194.60, tp3c: 234.30 },
  { bis: 10170, tp2: 104.70, tp3a: 208.60, tp3b: 259.70, tp3c: 312.30 },
  { bis: 36340, tp2: 260.70, tp3a: 519.90, tp3b: 649.80, tp3c: 779.40 },
];

// TP 4 Strafgerichtliches Verfahren (Privatanklage, Mediengesetz) - Stand 1.5.2023
export const RATG_TP4 = {
  // Grundbeträge
  anklageBG: 184.60,      // Vergehen BG-Zuständigkeit
  anklageSonstige: 307.60, // sonstige Vergehen / Medienanträge
  // Abgeleitete Beträge
  beweisantraegeVoll: 307.60,    // = Anklage sonstige
  beweisantraegeHalb: 153.80,    // kurze/einfache oder Folgeanträge
  rechtsmittelAnmeldung: 30.76,  // 1/10 von Anklage
  berufungNichtigkeit: 461.40,   // 1,5× Anklage
  // Verhandlungen
  hvErsteHalbeStunde: 307.60,    // = Anklage
  hvWeitereHalbeStunde: 153.80,  // Hälfte
  hv2InstanzErste: 461.40,       // 1,5× Anklage
  hv2InstanzWeitere: 153.80,     // Hälfte von Anklage
  // Wartezeit pro ½h (nach erster ½h)
  wartezeitBG: 9.20,
  wartezeitSonstige: 17.90,
  // Abberaumung
  abberaumungBG: 17.90,
  abberaumungSonstige: 35.10,
  // Privatbeteiligte: jeweils die Hälfte
};

// TP 5 Einfache Schreiben (Stand 1.5.2023, BGBl. II Nr. 131/2023)
export const RATG_TP5_BRIEFE = [
  { bis: 70, tp5: 4.20 },
  { bis: 180, tp5: 5.60 },
  { bis: 360, tp5: 6.30 },
  { bis: 730, tp5: 7.50 },
  { bis: 1820, tp5: 9.20 },
  { bis: 2910, tp5: 10.80 },
  // Über € 2.910: +€ 3,30 pro angefangene € 1.450
  { bis: 4360, tp5: 14.10 },   // 10,80 + 3,30
  { bis: 5810, tp5: 17.40 },   // 14,10 + 3,30
  { bis: 7260, tp5: 20.70 },
  { bis: 8710, tp5: 24.00 },
  { bis: 10160, tp5: 27.30 },
  { bis: 11610, tp5: 30.60 },
  { bis: 13060, tp5: 33.90 },
  { bis: 14510, tp5: 37.20 },
  { bis: 15960, tp5: 40.50 },
  { bis: 17410, tp5: 43.80 },
  { bis: 18860, tp5: 47.10 },
  { bis: 20310, tp5: 50.40 },
  { bis: 21760, tp5: 53.70 },
  { bis: 23210, tp5: 57.00 },
  { bis: 24660, tp5: 60.30 },
  { bis: 26110, tp5: 63.60 },
  { bis: 27560, tp5: 66.90 },
  { bis: 29010, tp5: 70.20 },
  { bis: 30460, tp5: 73.50 },
  { bis: 31910, tp5: 76.80 },
  { bis: 33360, tp5: 80.10 },
  { bis: 34810, tp5: 83.40 },
  { bis: 36260, tp5: 86.70 },
  { bis: 37710, tp5: 90.00 },
  { bis: 39160, tp5: 93.30 },
  { bis: 40610, tp5: 96.60 },
  { bis: 42060, tp5: 99.90 },
  { bis: 43510, tp5: 103.20 },
  // Maximum: € 104,60
];
export const RATG_TP5_FORMEL = {
  basisBis: 2910,
  basisWert: 10.80,
  zuschlagPro: 1450,
  zuschlagWert: 3.30,
  maximum: 104.60,
};

// TP 6 Andere Briefe = Doppelte von TP 5 (Stand 1.5.2023)
// Maximum: € 208,20
export const RATG_TP6_MAXIMUM = 208.20;

// TP 7 Kommissionen (pro ½ Stunde, Stand 1.5.2023)
export const RATG_TP7 = {
  // Gehilfe: wie TP 6 (= 2× TP 5), max € 208,20/½h
  gehilfeMaximum: 208.20,
  // RA/RAA: Doppelte von TP 6 (= 4× TP 5), max € 416,10/½h
  raRaaMaximum: 416.10,
  // Plus: Zeitversäumnis nach TP 9 Z 4 + Massenbeförderungsmittel
};

// TP 4, 5, 6, 7 Hinweise
export const RATG_TP4567_HINWEISE = {
  // TP 4
  tp4Privatbeteiligte: 'Privatbeteiligte: jeweils die Hälfte der Sätze',
  tp4Wartezeit: 'Wartezeit: erst ab ½h Wartezeit, dann pro weitere ½h',
  tp4Beratungszeit: 'Beratungszeit des Gerichtshofs zählt zur Wartezeit',
  // TP 5 & 6
  zuschlagInfo: 'Information aus Akten od. mit Partei: +50% (Hälfte zusätzlich)',
  briefeAusnahme: 'Briefe mit Rechtsgutachten oder Verträgen: nicht im Tarif',
  keinES: 'Kein Einheitssatz zu TP 5, 6, 8 und 9',
  // TP 7
  tp7Abs1: 'Abs. 1: Geschäfte außerhalb Kanzlei durch Gehilfen → niedrigere Gebühr; höhere nur wenn RA/RAA erforderlich',
  tp7Abs2: 'Abs. 2: Exekutionsvollzug → im Regelfall RA/RAA-Satz (außer nicht erforderlich)',
  tp7Abs3: 'Abs. 3: RA/RAA-Satz auch für: Aktenstudium bei Behörden, Kommissionen zum Referenten, außergerichtliche Augenscheine etc.',
  tp7Nebenkosten: 'Zusätzlich: Zeitversäumnis nach TP 9 Z 4 + Massenbeförderungsmittel',
};

// GGG Tarife alle Tarifposten (Stand April 2025)
export const GGG_ALLE_TARIFE = {
  tp1: [ // Einleitungsschriften 1. Instanz
    { bis: 150, gebuehr: 26 },
    { bis: 300, gebuehr: 50 },
    { bis: 700, gebuehr: 71 },
    { bis: 2000, gebuehr: 119 },
    { bis: 3500, gebuehr: 190 },
    { bis: 7000, gebuehr: 350 },
    { bis: 35000, gebuehr: 827 },
    { bis: 70000, gebuehr: 1626 },
    { bis: 140000, gebuehr: 3252 },
    { bis: 210000, gebuehr: 4880 },
    { bis: 280000, gebuehr: 5506 },
    { bis: 350000, gebuehr: 8132 },
  ],
  tp2: [ // Rechtsmittel 2. Instanz
    { bis: 150, gebuehr: 33 },
    { bis: 300, gebuehr: 63 },
    { bis: 700, gebuehr: 90 },
    { bis: 2000, gebuehr: 150 },
    { bis: 3500, gebuehr: 240 },
    { bis: 7000, gebuehr: 441 },
    { bis: 35000, gebuehr: 1042 },
    { bis: 70000, gebuehr: 2049 },
    { bis: 140000, gebuehr: 4098 },
    { bis: 210000, gebuehr: 6149 },
    { bis: 280000, gebuehr: 8198 },
    { bis: 350000, gebuehr: 10247 },
  ],
  tp3: [ // Rechtsmittel 3. Instanz (OGH)
    { bis: 150, gebuehr: 40 },
    { bis: 300, gebuehr: 77 },
    { bis: 700, gebuehr: 110 },
    { bis: 2000, gebuehr: 183 },
    { bis: 3500, gebuehr: 293 },
    { bis: 7000, gebuehr: 539 },
    { bis: 35000, gebuehr: 1273 },
    { bis: 70000, gebuehr: 2504 },
    { bis: 140000, gebuehr: 5008 },
    { bis: 210000, gebuehr: 7514 },
    { bis: 280000, gebuehr: 10018 },
    { bis: 350000, gebuehr: 12522 },
  ]
};

// Berechnungsformeln für höhere Streitwerte (RATG § 1 Abs. 1)
export const RATG_FORMELN = {
  // Stufe 1: Streitwerte über € 36.340 bis € 363.360
  stufe1: {
    basis: 36340,
    obergrenze: 363360,
    basisTarife: { tp1: 92.20, tp2: 413.00, tp3a: 814.40, tp3b: 1016.20, tp3c: 1219.60 },
    multiplikatoren: { tp1: 0.10, tp2: 0.50, tp3a: 1.00, tp3b: 1.25, tp3c: 1.50 },
    // Pro € 1.000 über Basis werden diese Zuschläge addiert
    zuschlagPro1000: { tp1: 0.10, tp2: 0.50, tp3a: 1.00, tp3b: 1.25, tp3c: 1.50 },
  },
  // Stufe 2: Streitwerte über € 363.360
  stufe2: {
    basis: 363360,
    basisTarife: { tp1: 124.90, tp2: 576.50, tp3a: 1141.40, tp3b: 1425.00, tp3c: 1710.10 },
    multiplikatoren: { tp1: 0.05, tp2: 0.25, tp3a: 0.50, tp3b: 0.625, tp3c: 0.75 },
    // Maximale Verdienstansätze (Deckelung)
    maxTarife: { tp1: 260.10, tp2: 1298.50, tp3a: 17308.80, tp3b: 21636.00, tp3c: 25963.10 },
    // Bei diesen Streitwerten wird Maximum erreicht
    maxBeiStreitwert: { tp1: 3067360, tp2: 3251360, tp3a: 32698160, tp3b: 32700960, tp3c: 32700693 },
  },
};

// Detaillierte Tarifpost-Beschreibungen (aus Handtarif)
export const RATG_TP_DETAILS: Record<string, { kurz: string; details: string[] }> = {
  TP1: {
    kurz: 'Kurze Schriftsätze und Anträge',
    details: [
      'Kurze Schriftsätze und Anträge',
      'Kostenbestimmungsanträge',
      'Vollmachtsbekanntgaben',
      'Urgenzschreiben',
    ],
  },
  TP2: {
    kurz: 'Einfache Klagen, Tagsatzungen',
    details: [
      'Einfache Klagen und Schriftsätze',
      'Kurze verfahrenseinleitende Anträge und kurze Äußerungen dazu',
      'Exekutionsbewilligungsanträge',
      'Tagsatzungen (ohne Beweisaufnahme)',
      'Kurze Grundbuch- und Firmenbucheingaben',
    ],
  },
  TP3A: {
    kurz: 'Qualifizierte Schriftsätze mit Sachvortrag',
    details: [
      'Klagen, Klagebeantwortungen',
      'Verfahrenseinleitende Schriftsätze und Äußerungen dazu',
      'Vorbereitende und aufgetragene Schriftsätze mit Sachvorbringen',
      'Streitverhandlungen, Tagsatzungen mit Beweisaufnahme',
      'Exekutionsbewilligungsanträge (Vollstreckbarerklärungsanträge) auf Grund ausländischer Titel',
      'Kostenrekurse und Kostenrekursbeantwortungen',
      'Anträge auf Erlassung einstweiliger Verfügungen, Äußerungen dazu und Widersprüche',
      'Befundaufnahmen durch Sachverständige (bei Beiziehung über Gerichtsauftrag)',
    ],
  },
  TP3B: {
    kurz: 'Rechtsmittel 2. Instanz',
    details: [
      'Berufungen, Berufungsbeantwortungen',
      'Rekurse und Rekursbeantwortungen (außer an OGH und Kostenrekurse)',
      'Beschwerden',
      'Berufungsverhandlungen (siehe § 23 Abs. 9)',
      'Schriftsätze nach § 473a ZPO: die Hälfte von TP 3B',
    ],
  },
  TP3C: {
    kurz: 'Rechtsmittel 3. Instanz (OGH)',
    details: [
      'Revisionen, Revisionsbeantwortungen',
      'Revisionsrekurse, Revisionsrekursbeantwortungen',
      'Rekurse und Rekursbeantwortungen an OGH',
      'Verhandlungen beim OGH',
      'Parteianträge nach Art. 139 Abs. 1 Z. 4, Art. 139a, Art. 140 Abs. 1 Z. 1 lit. d und Art. 140a B-VG',
    ],
  },
};

// Rundungsregel § 1 Abs. 1 zweiter Satz RATG
export const RATG_RUNDUNG = {
  text: 'Die sich aufgrund von im Tarif angeordneten Rechenoperationen ergebenden Tarifsätze sind auf volle 10 Cent auf- oder abzurunden.',
  paragraph: '§ 1 Abs. 1 zweiter Satz RATG',
};

export const DISCLAIMER_TEXT = `Dieser Kalkulator ist experimentell. Es wird keine Haftung für die Richtigkeit der Berechnungen übernommen. Die Ergebnisse dienen ausschließlich zu Informationszwecken und ersetzen keine professionelle Rechtsberatung.`;

export const INTRO_TEXT = `Dieser Kalkulator richtet sich an Praktiker und interessierte Rechtsanwender, um die Kostenlogik der österreichischen Tarife transparent zu machen.`;
