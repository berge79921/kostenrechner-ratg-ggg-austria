/**
 * ============================================================================
 * AHK - Autonome Honorarkriterien für Strafsachen
 * ============================================================================
 *
 * Rechtsgrundlage: AHK der österreichischen Rechtsanwaltskammern
 * §§ 9-10: Straf- und Disziplinarsachen
 *
 * Stand: 2024
 * ============================================================================
 */

// ============================================================================
// GERICHTSTYPEN - § 9 Abs 1 Z 1-5
// ============================================================================

export type CourtType =
  | 'BG'           // Z 1: Bezirksgericht
  | 'ER_GH'        // Z 2: Einzelrichter Gerichtshof (außer § 61/1/5 StPO)
  | 'SCHOEFFEN'    // Z 3: Schöffengericht / Einzelrichter § 61/1/5 StPO
  | 'GESCHWORENEN' // Z 4: Geschworenengericht
  | 'HAFT';        // Z 5: Haftverfahren

export const COURT_TYPE_LABELS: Record<CourtType, string> = {
  BG: 'Bezirksgericht',
  ER_GH: 'Einzelrichter Gerichtshof',
  SCHOEFFEN: 'Schöffengericht / ER § 61',
  GESCHWORENEN: 'Geschworenengericht',
  HAFT: 'Haftverfahren',
};

// ============================================================================
// § 10 Abs 1: FIXE BEMESSUNGSGRUNDLAGEN für RATG-Anwendung
// ============================================================================

export const STRAF_BEMESSUNGSGRUNDLAGEN: Record<CourtType, number> = {
  BG: 780000,           // € 7.800 in Cents
  ER_GH: 1800000,       // € 18.000 in Cents
  SCHOEFFEN: 2760000,   // € 27.600 in Cents
  GESCHWORENEN: 3320000, // € 33.200 in Cents
  HAFT: 1800000,        // Default € 18.000 (variiert je nach Ausgangsverfahren)
};

// ============================================================================
// § 9 Abs 1: AHK TARIFE (alle Werte in Cents)
// ============================================================================

export interface TagsatzungTarif {
  firstHalf: number;      // 1. halbe Stunde
  subsequentHalf: number; // jede weitere halbe Stunde
}

export interface AHKTarife {
  // Hauptverhandlung 1. Instanz
  hv1Instanz: TagsatzungTarif;

  // Berufung (Schriftsatz)
  berufungVoll?: number;    // Volle Berufung (BG, ER_GH)
  berufungStrafe?: number;  // Berufung nur Strafe (BG, ER_GH)
  berufung?: number;        // Berufung allgemein (Schöffen, Geschworenen)

  // Berufungsverhandlung
  berufungVhVoll?: TagsatzungTarif;   // BG, ER_GH
  berufungVhStrafe?: TagsatzungTarif; // BG, ER_GH
  berufungVh?: TagsatzungTarif;       // Schöffen, Geschworenen

  // Nichtigkeitsbeschwerde (nur Schöffen, Geschworenen)
  nichtigkeitsbeschwerde?: number;
  gerichtstagNb?: TagsatzungTarif;
}

export const AHK_TARIFE: Record<Exclude<CourtType, 'HAFT'>, AHKTarife> = {
  // Z 1: Bezirksgericht
  BG: {
    hv1Instanz: { firstHalf: 23800, subsequentHalf: 11900 },
    berufungVoll: 71400,
    berufungStrafe: 35200,
    berufungVhVoll: { firstHalf: 46800, subsequentHalf: 23400 },
    berufungVhStrafe: { firstHalf: 35200, subsequentHalf: 17600 },
  },

  // Z 2: Einzelrichter Gerichtshof
  ER_GH: {
    hv1Instanz: { firstHalf: 39600, subsequentHalf: 19800 },
    berufungVoll: 118800,
    berufungStrafe: 59000,
    berufungVhVoll: { firstHalf: 78600, subsequentHalf: 39300 },
    berufungVhStrafe: { firstHalf: 59000, subsequentHalf: 29500 },
  },

  // Z 3: Schöffengericht / Einzelrichter § 61
  SCHOEFFEN: {
    hv1Instanz: { firstHalf: 54000, subsequentHalf: 27000 },
    berufung: 80800,
    berufungVh: { firstHalf: 80800, subsequentHalf: 40400 },
    nichtigkeitsbeschwerde: 162000,
    gerichtstagNb: { firstHalf: 107600, subsequentHalf: 53800 },
  },

  // Z 4: Geschworenengericht
  GESCHWORENEN: {
    hv1Instanz: { firstHalf: 62000, subsequentHalf: 31000 },
    berufung: 92800,
    berufungVh: { firstHalf: 92800, subsequentHalf: 46400 },
    nichtigkeitsbeschwerde: 186000,
    gerichtstagNb: { firstHalf: 123600, subsequentHalf: 61800 },
  },
};

// Z 5: Haftverfahren (separate Struktur)
export interface HaftTarife {
  vh1Instanz: TagsatzungTarif;
  grundrechtsbeschwerde: number;
  sonstigeBeschwerde: number;
  vh2Instanz: TagsatzungTarif;
}

export const AHK_HAFT_TARIFE: HaftTarife = {
  vh1Instanz: { firstHalf: 36400, subsequentHalf: 18200 },
  grundrechtsbeschwerde: 78600,
  sonstigeBeschwerde: 56400,
  vh2Instanz: { firstHalf: 56400, subsequentHalf: 28200 },
};

// ============================================================================
// LEISTUNGSTYPEN für Strafsachen
// ============================================================================

export type StrafLeistungType =
  // § 9 AHK - Hauptverhandlungen
  | 'STRAF_HV_1_INSTANZ'
  | 'STRAF_KONTRADIKTORISCHE_VERNEHMUNG' // Abs 1a

  // § 9 AHK - Berufung (BG, ER_GH)
  | 'STRAF_BERUFUNG_VOLL'
  | 'STRAF_BERUFUNG_STRAFE'
  | 'STRAF_BERUFUNG_VH_VOLL'
  | 'STRAF_BERUFUNG_VH_STRAFE'

  // § 9 AHK - Berufung (Schöffen, Geschworenen)
  | 'STRAF_BERUFUNG'
  | 'STRAF_BERUFUNG_VH'

  // § 9 AHK - Nichtigkeitsbeschwerde (nur Schöffen, Geschworenen)
  | 'STRAF_NICHTIGKEITSBESCHWERDE'
  | 'STRAF_GERICHTSTAG_NB'

  // § 9 AHK - Haftverfahren
  | 'STRAF_HAFT_VH_1'
  | 'STRAF_HAFT_GRUNDRECHTSBESCHWERDE'
  | 'STRAF_HAFT_BESCHWERDE_SONST'
  | 'STRAF_HAFT_VH_2'

  // § 10 AHK - RATG Leistungen
  | 'STRAF_RATG_TP2'    // Kurze Anträge, Vollmacht, RM-Verzicht
  | 'STRAF_RATG_TP3A'   // Anträge, Enthaftung, EV-Anträge
  | 'STRAF_RATG_TP3B'   // Einspruch Anklageschrift, Beschwerden
  | 'STRAF_RATG_TP7_2'  // Besuche, Vernehmungen, Aktenstudium
  | 'STRAF_ZUWARTEN';   // § 10 Abs 4

// ============================================================================
// BERECHNUNGSFUNKTIONEN
// ============================================================================

/**
 * Berechnet Tagsatzung (Verhandlung) nach AHK § 9
 */
export function calculateStrafTagsatzung(
  tarif: TagsatzungTarif,
  halbeStunden: number
): { amount: number; trace: string } {
  if (halbeStunden <= 0) {
    return { amount: 0, trace: 'Keine Dauer angegeben' };
  }

  const firstHalf = tarif.firstHalf;
  const subsequent = halbeStunden > 1 ? (halbeStunden - 1) * tarif.subsequentHalf : 0;
  const total = firstHalf + subsequent;

  let trace = `1. halbe Stunde: ${(firstHalf / 100).toFixed(2)} €`;
  if (halbeStunden > 1) {
    trace += `\n${halbeStunden - 1} weitere ½ Std × ${(tarif.subsequentHalf / 100).toFixed(2)} € = ${(subsequent / 100).toFixed(2)} €`;
  }
  trace += `\nGesamt: ${(total / 100).toFixed(2)} €`;

  return { amount: total, trace };
}

/**
 * Berechnet Streitgenossenzuschlag nach § 10 Abs 3: 30% pro Person, KEIN LIMIT
 */
export function calculateStrafStreitgenossen(
  basisCents: number,
  anzahlWeitere: number
): { amount: number; percent: number; trace: string } {
  if (anzahlWeitere <= 0) {
    return { amount: 0, percent: 0, trace: 'Kein Streitgenossenzuschlag' };
  }

  const percent = anzahlWeitere * 30;
  const amount = Math.round(basisCents * percent / 100);

  return {
    amount,
    percent,
    trace: `${anzahlWeitere} weitere Person(en) × 30% = ${percent}% von ${(basisCents / 100).toFixed(2)} € = ${(amount / 100).toFixed(2)} €`
  };
}

/**
 * Berechnet Erfolgszuschlag nach § 10 (0-50%)
 */
export function calculateErfolgszuschlag(
  basisCents: number,
  prozent: number
): { amount: number; trace: string } {
  if (prozent <= 0 || prozent > 50) {
    return { amount: 0, trace: prozent > 50 ? 'Max 50% Erfolgszuschlag' : 'Kein Erfolgszuschlag' };
  }

  const amount = Math.round(basisCents * prozent / 100);
  return {
    amount,
    trace: `Erfolgszuschlag ${prozent}% von ${(basisCents / 100).toFixed(2)} € = ${(amount / 100).toFixed(2)} €`
  };
}

/**
 * Berechnet Zuschlag für NB + Berufung kombiniert (§ 9 Abs 2): +20%
 */
export function calculateNbBerufungZuschlag(
  nbBasisCents: number
): { amount: number; trace: string } {
  const amount = Math.round(nbBasisCents * 0.20);
  return {
    amount,
    trace: `NB + Berufung kombiniert: +20% von ${(nbBasisCents / 100).toFixed(2)} € = ${(amount / 100).toFixed(2)} €`
  };
}

/**
 * Prüft ob Nichtigkeitsbeschwerde verfügbar ist für Gerichtstyp
 */
export function hasNichtigkeitsbeschwerde(courtType: CourtType): boolean {
  return courtType === 'SCHOEFFEN' || courtType === 'GESCHWORENEN';
}

/**
 * Prüft ob volle/Strafe-Berufung Unterscheidung gilt (BG, ER_GH)
 */
export function hasBerufungUnterscheidung(courtType: CourtType): boolean {
  return courtType === 'BG' || courtType === 'ER_GH';
}

/**
 * Gibt verfügbare Leistungstypen für einen Gerichtstyp zurück
 */
export function getAvailableLeistungen(courtType: CourtType): StrafLeistungType[] {
  const common: StrafLeistungType[] = [
    'STRAF_RATG_TP2',
    'STRAF_RATG_TP3A',
    'STRAF_RATG_TP3B',
    'STRAF_RATG_TP7_2',
    'STRAF_ZUWARTEN',
  ];

  if (courtType === 'HAFT') {
    return [
      'STRAF_HAFT_VH_1',
      'STRAF_HAFT_GRUNDRECHTSBESCHWERDE',
      'STRAF_HAFT_BESCHWERDE_SONST',
      'STRAF_HAFT_VH_2',
      ...common,
    ];
  }

  const base: StrafLeistungType[] = [
    'STRAF_HV_1_INSTANZ',
    'STRAF_KONTRADIKTORISCHE_VERNEHMUNG',
  ];

  if (hasBerufungUnterscheidung(courtType)) {
    // BG, ER_GH: volle vs. Strafe-Berufung
    return [
      ...base,
      'STRAF_BERUFUNG_VOLL',
      'STRAF_BERUFUNG_STRAFE',
      'STRAF_BERUFUNG_VH_VOLL',
      'STRAF_BERUFUNG_VH_STRAFE',
      ...common,
    ];
  } else {
    // Schöffen, Geschworenen: einheitliche Berufung + NB
    return [
      ...base,
      'STRAF_BERUFUNG',
      'STRAF_BERUFUNG_VH',
      'STRAF_NICHTIGKEITSBESCHWERDE',
      'STRAF_GERICHTSTAG_NB',
      ...common,
    ];
  }
}

// ============================================================================
// LEISTUNGS-LABELS
// ============================================================================

export const STRAF_LEISTUNG_LABELS: Record<StrafLeistungType, string> = {
  STRAF_HV_1_INSTANZ: 'Hauptverhandlung 1. Instanz',
  STRAF_KONTRADIKTORISCHE_VERNEHMUNG: 'Kontradiktorische Vernehmung',
  STRAF_BERUFUNG_VOLL: 'Berufung (voll)',
  STRAF_BERUFUNG_STRAFE: 'Berufung (nur Strafe)',
  STRAF_BERUFUNG_VH_VOLL: 'Berufungsverhandlung (voll)',
  STRAF_BERUFUNG_VH_STRAFE: 'Berufungsverhandlung (nur Strafe)',
  STRAF_BERUFUNG: 'Berufung',
  STRAF_BERUFUNG_VH: 'Berufungsverhandlung',
  STRAF_NICHTIGKEITSBESCHWERDE: 'Nichtigkeitsbeschwerde',
  STRAF_GERICHTSTAG_NB: 'Gerichtstag Nichtigkeitsbeschwerde',
  STRAF_HAFT_VH_1: 'Haftverhandlung 1. Instanz',
  STRAF_HAFT_GRUNDRECHTSBESCHWERDE: 'Grundrechtsbeschwerde',
  STRAF_HAFT_BESCHWERDE_SONST: 'Sonstige Beschwerde (Haft)',
  STRAF_HAFT_VH_2: 'Haftverhandlung 2. Instanz',
  // § 10 Abs 2 AHK - RATG Strafsachen
  STRAF_RATG_TP2: 'TP 2 RATG – Strafsachen (Kostenantrag, Vollmacht, RM-Verzicht/-Anmeldung, kurze Anträge)',
  STRAF_RATG_TP3A: 'TP 3A RATG – Strafsachen (Anträge, Enthaftung, EV-Anträge an StA/Gericht)',
  STRAF_RATG_TP3B: 'TP 3B RATG – Strafsachen (Einspruch Anklageschrift, Beschwerden §§ 87, 106 StPO)',
  STRAF_RATG_TP7_2: 'TP 7/2 RATG – Strafsachen (Besuch, Vernehmung, Aktenstudium)',
  STRAF_ZUWARTEN: 'TP 7/2 RATG – Zuwarten (§ 10 Abs 4)',
};

/**
 * Prüft ob Leistung eine Tagsatzung ist (mit Dauer)
 */
export function isTagsatzung(leistung: StrafLeistungType): boolean {
  return [
    'STRAF_HV_1_INSTANZ',
    'STRAF_KONTRADIKTORISCHE_VERNEHMUNG',
    'STRAF_BERUFUNG_VH_VOLL',
    'STRAF_BERUFUNG_VH_STRAFE',
    'STRAF_BERUFUNG_VH',
    'STRAF_GERICHTSTAG_NB',
    'STRAF_HAFT_VH_1',
    'STRAF_HAFT_VH_2',
    'STRAF_ZUWARTEN',
  ].includes(leistung);
}

/**
 * Prüft ob Leistung ein Schriftsatz ist (ohne Dauer)
 */
export function isSchriftsatz(leistung: StrafLeistungType): boolean {
  return [
    'STRAF_BERUFUNG_VOLL',
    'STRAF_BERUFUNG_STRAFE',
    'STRAF_BERUFUNG',
    'STRAF_NICHTIGKEITSBESCHWERDE',
    'STRAF_HAFT_GRUNDRECHTSBESCHWERDE',
    'STRAF_HAFT_BESCHWERDE_SONST',
    'STRAF_RATG_TP2',
    'STRAF_RATG_TP3A',
    'STRAF_RATG_TP3B',
    'STRAF_RATG_TP7_2',
  ].includes(leistung);
}
