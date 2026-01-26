/**
 * Vollzugsgebühren nach § 455 EO
 * BGBl. I Nr. 86/2021, valorisiert ab 1.4.2025 (BGBl. II Nr. 51/2025)
 */

export type VollzugsgebuehrType =
  | 'KEINE'
  | 'FAHRNISEXEKUTION'        // Z 3: 7,50 €
  | 'FORDERUNGSEXEKUTION'     // Z 3: 7,50 €
  | 'HERAUSGABE'              // Z 5: 9,00 €
  | 'VERMOEGENSRECHTE'        // Z 4: 20,00 €
  | 'ZWANGSVERWALTUNG'        // Z 1: 20,00 €
  | 'ZWANGSVERSTEIGERUNG'     // Z 2: 20,00 €
  | 'RAEUMUNGSEXEKUTION';     // Z 6: 30,00 €

export interface VollzugsgebuehrInfo {
  type: VollzugsgebuehrType;
  label: string;
  shortLabel: string;
  amountCents: number;
  paragraph: string;
}

/**
 * Vollzugsgebühren-Tabelle nach § 455 EO
 * Stand: BGBl. II Nr. 51/2025 (ab 1.4.2025)
 */
export const VOLLZUGSGEBUEHREN: Record<VollzugsgebuehrType, VollzugsgebuehrInfo> = {
  KEINE: {
    type: 'KEINE',
    label: 'Keine Vollzugsgebühr',
    shortLabel: 'Keine',
    amountCents: 0,
    paragraph: ''
  },
  FAHRNISEXEKUTION: {
    type: 'FAHRNISEXEKUTION',
    label: 'Fahrnisexekution (§ 455 Z 3 EO)',
    shortLabel: 'Fahrnis § 249 EO',
    amountCents: 750,
    paragraph: '§ 455 Z 3 EO'
  },
  FORDERUNGSEXEKUTION: {
    type: 'FORDERUNGSEXEKUTION',
    label: 'Forderungsexekution (§ 455 Z 3 EO)',
    shortLabel: 'Forderung § 294 EO',
    amountCents: 750,
    paragraph: '§ 455 Z 3 EO'
  },
  HERAUSGABE: {
    type: 'HERAUSGABE',
    label: 'Herausgabe/Leistung bewegl. Sachen (§ 455 Z 5 EO)',
    shortLabel: 'Herausgabe',
    amountCents: 900,
    paragraph: '§ 455 Z 5 EO'
  },
  VERMOEGENSRECHTE: {
    type: 'VERMOEGENSRECHTE',
    label: 'Vermögensrechte (§ 455 Z 4 EO)',
    shortLabel: 'Vermögensrechte',
    amountCents: 2000,
    paragraph: '§ 455 Z 4 EO'
  },
  ZWANGSVERWALTUNG: {
    type: 'ZWANGSVERWALTUNG',
    label: 'Zwangsverwaltung Liegenschaft (§ 455 Z 1 EO)',
    shortLabel: 'Zwangsverwaltung',
    amountCents: 2000,
    paragraph: '§ 455 Z 1 EO'
  },
  ZWANGSVERSTEIGERUNG: {
    type: 'ZWANGSVERSTEIGERUNG',
    label: 'Zwangsversteigerung Liegenschaft (§ 455 Z 2 EO)',
    shortLabel: 'Zwangsversteigerung',
    amountCents: 2000,
    paragraph: '§ 455 Z 2 EO'
  },
  RAEUMUNGSEXEKUTION: {
    type: 'RAEUMUNGSEXEKUTION',
    label: 'Räumungsexekution (§ 455 Z 6 EO)',
    shortLabel: 'Räumung',
    amountCents: 3000,
    paragraph: '§ 455 Z 6 EO'
  }
};

/**
 * Dropdown-Optionen für die UI
 */
export const VOLLZUGSGEBUEHR_OPTIONS: { value: VollzugsgebuehrType; label: string; amount: string }[] = [
  { value: 'KEINE', label: 'Keine Vollzugsgebühr', amount: '' },
  { value: 'FAHRNISEXEKUTION', label: 'Fahrnisexekution § 249 EO', amount: '7,50 €' },
  { value: 'FORDERUNGSEXEKUTION', label: 'Forderungsexekution § 294 EO', amount: '7,50 €' },
  { value: 'HERAUSGABE', label: 'Herausgabe/Leistung bewegl. Sachen', amount: '9,00 €' },
  { value: 'VERMOEGENSRECHTE', label: 'Vermögensrechte', amount: '20,00 €' },
  { value: 'ZWANGSVERWALTUNG', label: 'Zwangsverwaltung Liegenschaft', amount: '20,00 €' },
  { value: 'ZWANGSVERSTEIGERUNG', label: 'Zwangsversteigerung Liegenschaft', amount: '20,00 €' },
  { value: 'RAEUMUNGSEXEKUTION', label: 'Räumungsexekution', amount: '30,00 €' }
];

/**
 * Berechnet die Vollzugsgebühr für einen Service
 */
export function getVollzugsgebuehr(type: VollzugsgebuehrType): VollzugsgebuehrInfo {
  return VOLLZUGSGEBUEHREN[type] || VOLLZUGSGEBUEHREN.KEINE;
}

/**
 * Prüft ob ein Service-Typ ein Exekutionsantrag ist (für Vollzugsgebühr-Dropdown)
 */
export function isExekutionsantragService(serviceId: string): boolean {
  const exekutionsIds = [
    'ex_antrag',
    'ex_fahrnisex',
    'ex_forderungsex',
    'ex_zwangsversteigerung',
    'ex_zwangsverwaltung',
    'ex_vollzugsantrag'
  ];
  return exekutionsIds.includes(serviceId);
}
