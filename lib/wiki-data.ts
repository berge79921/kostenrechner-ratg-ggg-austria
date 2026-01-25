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
    description: 'Pauschale für elektronischen Rechtsverkehr',
    values: ['€ 2,10 pro ERV-Eingabe']
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

export const DISCLAIMER_TEXT = `Dieser Kalkulator ist experimentell. Es wird keine Haftung für die Richtigkeit der Berechnungen übernommen. Die Ergebnisse dienen ausschließlich zu Informationszwecken und ersetzen keine professionelle Rechtsberatung.`;

export const INTRO_TEXT = `Dieser Kalkulator richtet sich an Praktiker und interessierte Rechtsanwender, um die Kostenlogik der österreichischen Tarife transparent zu machen.`;
