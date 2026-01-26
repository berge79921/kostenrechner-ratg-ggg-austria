import React from 'react';
import { Calculator, Scale, Gavel, Users, Lock, Building2 } from 'lucide-react';

interface Example {
  id: string;
  title: string;
  category: 'zivil' | 'straf' | 'haft' | 'vstraf';
  description: string;
  scenario: string;
  params: {
    bmgl: number;
    bmglLabel?: string;
    leistungen: string[];
    streitgenossen?: number;
    gerichtstyp?: string;
  };
  breakdown: {
    label: string;
    value: string;
    detail?: string;
  }[];
  total: {
    netto: number;
    ust: number;
    ggg: number;
    brutto: number;
  };
}

const EXAMPLES: Example[] = [
  // ==================== ZIVILRECHT ====================
  {
    id: 'mahnklage-5k',
    title: 'Mahnklage € 5.000',
    category: 'zivil',
    description: 'Einfache Geldforderung beim Bezirksgericht',
    scenario: 'Ein Unternehmer klagt eine offene Rechnung über € 5.000 ein. Mahnklage mit ERV-Einbringung.',
    params: {
      bmgl: 5000,
      leistungen: ['Mahnklage (TP 2)', 'ES 60%', 'ERV']
    },
    breakdown: [
      { label: 'Tarifsatz TP 2', value: '€ 104,60', detail: 'RATG Anl. 1, Stufe 8 (bis € 7.270)' },
      { label: 'Einheitssatz 60%', value: '€ 62,76', detail: '§ 23 RATG (bis € 10.170)' },
      { label: 'ERV-Beitrag', value: '€ 2,10', detail: '§ 23a RATG (verfahrenseinl.)' },
    ],
    // Netto: 104,60 + 62,76 + 2,10 = 169,46 | USt: 33,89 | GGG TP1 ZI: 412 | Brutto: 615,35
    total: { netto: 16946, ust: 3389, ggg: 41200, brutto: 61535 }
  },
  {
    id: 'klage-25k',
    title: 'Klage € 25.000',
    category: 'zivil',
    description: 'Schadenersatzklage beim Landesgericht',
    scenario: 'Klage auf Schadenersatz wegen Vertragsverletzung. Streitwert € 25.000, qualifizierter Schriftsatz (TP 2).',
    params: {
      bmgl: 25000,
      leistungen: ['Klage (TP 2)', 'ES 50%', 'ERV']
    },
    breakdown: [
      { label: 'Tarifsatz TP 2', value: '€ 370,70', detail: 'RATG Anl. 1, Stufe 11 (bis € 36.340)' },
      { label: 'Einheitssatz 50%', value: '€ 185,35', detail: '§ 23 RATG (über € 10.170)' },
      { label: 'ERV-Beitrag', value: '€ 2,10', detail: '§ 23a RATG (verfahrenseinl.)' },
    ],
    // Netto: 370,70 + 185,35 + 2,10 = 558,15 | USt: 111,63 | GGG TP1 ZI: 974 | Brutto: 1.643,78
    total: { netto: 55815, ust: 11163, ggg: 97400, brutto: 164378 }
  },
  {
    id: 'tagsatzung-lg',
    title: 'Streitverhandlung LG (2 Stunden)',
    category: 'zivil',
    description: 'Tagsatzung mit Beweisaufnahme beim Landesgericht',
    scenario: 'Streitverhandlung in einem Zivilprozess. Streitwert € 35.000, Dauer 2 Stunden (= 4 halbe Stunden).',
    params: {
      bmgl: 35000,
      leistungen: ['Tagsatzung TP 3A (2h)', 'ES doppelt']
    },
    breakdown: [
      { label: 'Entlohnung (4 ½h)', value: '€ 1.467,60', detail: 'RATG Anl. 2, TP 3A bei € 35.000' },
      { label: 'Einheitssatz 100%', value: '€ 1.467,60', detail: '§ 23 RATG (doppelt = 2× 50%)' },
    ],
    // Netto: 2.935,20 | USt: 587,04 | Brutto: 3.522,24 (keine GGG bei Tagsatzung)
    total: { netto: 293520, ust: 58704, ggg: 0, brutto: 352224 }
  },

  // ==================== STRAFRECHT ====================
  {
    id: 'hv-schoeffengericht-konkret',
    title: 'Hauptverhandlung Schöffengericht',
    category: 'straf',
    description: 'Betrugsverfahren § 146 StGB, 3 Stunden HV',
    scenario: 'Verteidigung in einem Betrugsverfahren vor dem Schöffengericht (BMGL € 27.600). Hauptverhandlung dauert 3 Stunden (= 6 halbe Stunden).',
    params: {
      bmgl: 27600,
      bmglLabel: 'Schöffengericht',
      gerichtstyp: 'Schöffengericht',
      leistungen: ['HV Schöffengericht (3h)', 'ES einfach']
    },
    breakdown: [
      { label: 'Erste ½ Stunde', value: '€ 540,00', detail: 'AHK § 9 Abs 1 Z 3 lit a' },
      { label: '5 weitere ½ Stunden', value: '€ 1.350,00', detail: '5 × € 270,00' },
      { label: 'Einheitssatz 50% (einfach)', value: '€ 945,00', detail: '§ 23 RATG sinngemäß' },
    ],
    // Netto: 540 + 1350 + 945 = 2.835 | USt: 567 | Brutto: 3.402
    total: { netto: 283500, ust: 56700, ggg: 0, brutto: 340200 }
  },
  {
    id: 'berufung-einzelrichter',
    title: 'Berufung Einzelrichter LG',
    category: 'straf',
    description: 'Berufung gegen Urteil des Einzelrichters am LG',
    scenario: 'Schriftliche Berufung (volle Anfechtung) gegen ein Urteil des Einzelrichters am Landesgericht. BMGL € 18.000.',
    params: {
      bmgl: 18000,
      bmglLabel: 'Einzelrichter Gerichtshof',
      gerichtstyp: 'Einzelrichter LG',
      leistungen: ['Berufung (voll)', 'ES doppelt', 'ERV']
    },
    breakdown: [
      { label: 'Berufung (volle Anfechtung)', value: '€ 1.188,00', detail: 'AHK § 9 Abs 1 Z 2 lit a' },
      { label: 'Einheitssatz 100% (doppelt)', value: '€ 1.188,00', detail: '§ 23 RATG sinngemäß (2× 50%)' },
      { label: 'ERV-Beitrag', value: '€ 2,10', detail: '§ 23a RATG' },
    ],
    // Netto: 1188 + 1188 + 2,10 = 2.378,10 | USt: 475,62 | Brutto: 2.853,72
    total: { netto: 237810, ust: 47562, ggg: 0, brutto: 285372 }
  },
  {
    id: 'nichtigkeitsbeschwerde-geschworenen',
    title: 'Nichtigkeitsbeschwerde + Berufung',
    category: 'straf',
    description: 'Rechtsmittel gegen Geschworenenurteil',
    scenario: 'Nichtigkeitsbeschwerde und Berufung gegen ein Urteil des Geschworenengerichts. BMGL € 33.200. Mit +20% Zuschlag für NB+Berufung kombiniert.',
    params: {
      bmgl: 33200,
      bmglLabel: 'Geschworenengericht',
      gerichtstyp: 'Geschworenengericht',
      leistungen: ['Nichtigkeitsbeschwerde', '+20% Zuschlag', 'ES vierfach', 'ERV']
    },
    breakdown: [
      { label: 'Nichtigkeitsbeschwerde', value: '€ 1.860,00', detail: 'AHK § 9 Abs 1 Z 4 lit b' },
      { label: '+20% NB+Berufung Zuschlag', value: '€ 372,00', detail: 'AHK § 9 Abs 2' },
      { label: 'Einheitssatz 200% (vierfach)', value: '€ 4.464,00', detail: '§ 23 RATG (4× 50%)' },
      { label: 'ERV-Beitrag', value: '€ 2,10', detail: '§ 23a RATG' },
    ],
    // Netto: 1860 + 372 + 4464 + 2,10 = 6.698,10 | USt: 1.339,62 | Brutto: 8.037,72
    total: { netto: 669810, ust: 133962, ggg: 0, brutto: 803772 }
  },

  // ==================== HAFTRECHT ====================
  {
    id: 'haft-vh-1-instanz',
    title: 'Haftverhandlung 1. Instanz',
    category: 'haft',
    description: 'Haftprüfung beim LG, 1,5 Stunden',
    scenario: 'Haftverhandlung zur Prüfung der Untersuchungshaft. Dauer 1,5 Stunden (= 3 halbe Stunden).',
    params: {
      bmgl: 0,
      bmglLabel: 'Fixsatz',
      gerichtstyp: 'Haftverfahren',
      leistungen: ['Haftverhandlung 1. Instanz (1,5h)', 'ES einfach']
    },
    breakdown: [
      { label: 'Erste ½ Stunde', value: '€ 364,00', detail: 'AHK § 9 Abs 1 Z 5 lit a' },
      { label: '2 weitere ½ Stunden', value: '€ 364,00', detail: '2 × € 182,00' },
      { label: 'Einheitssatz 50% (einfach)', value: '€ 364,00', detail: '§ 23 RATG (max einfach bei Haft)' },
    ],
    // Netto: 364 + 364 + 364 = 1.092 | USt: 218,40 | Brutto: 1.310,40
    total: { netto: 109200, ust: 21840, ggg: 0, brutto: 131040 }
  },
  {
    id: 'haft-besuch-anstalt',
    title: 'Besuch in Haftanstalt',
    category: 'haft',
    description: '2 Stunden Besprechung mit Mandant in U-Haft',
    scenario: 'Besuch des inhaftierten Mandanten in der Justizanstalt. Dauer 2 Stunden (= 4 halbe Stunden). RATG TP 7/2 mit BMGL nach Ausgangsverfahren Schöffengericht (€ 27.600).',
    params: {
      bmgl: 27600,
      bmglLabel: 'Schöffengericht',
      gerichtstyp: 'Haftverfahren',
      leistungen: ['Besuch TP 7/2 (2h)', 'ES einfach']
    },
    breakdown: [
      { label: 'TP 7/2 Kommission (4 × ½h)', value: '€ 1.127,20', detail: '4 × € 281,80 (RATG Stufe 11)' },
      { label: 'Einheitssatz 50% (einfach)', value: '€ 563,60', detail: '§ 23 RATG (max einfach bei TP 7)' },
    ],
    // Netto: 1127,20 + 563,60 = 1.690,80 | USt: 338,16 | Brutto: 2.028,96
    total: { netto: 169080, ust: 33816, ggg: 0, brutto: 202896 }
  },
  {
    id: 'haft-grundrechtsbeschwerde',
    title: 'Grundrechtsbeschwerde an OLG',
    category: 'haft',
    description: 'GRBG-Beschwerde gegen Haftverhängung',
    scenario: 'Grundrechtsbeschwerde gemäß GRBG gegen die Verhängung der Untersuchungshaft. Pauschaltarif nach AHK.',
    params: {
      bmgl: 0,
      bmglLabel: 'Fixsatz',
      gerichtstyp: 'Haftverfahren',
      leistungen: ['Grundrechtsbeschwerde', 'ES einfach', 'ERV']
    },
    breakdown: [
      { label: 'Grundrechtsbeschwerde', value: '€ 786,00', detail: 'AHK § 9 Abs 1 Z 5 lit b (Fixsatz)' },
      { label: 'Einheitssatz 50% (einfach)', value: '€ 393,00', detail: '§ 23 RATG (max einfach bei Haft)' },
      { label: 'ERV-Beitrag', value: '€ 2,10', detail: '§ 23a RATG' },
    ],
    // Netto: 786 + 393 + 2,10 = 1.181,10 | USt: 236,22 | Brutto: 1.417,32
    total: { netto: 118110, ust: 23622, ggg: 0, brutto: 141732 }
  },
  {
    id: 'haft-enthaftungsantrag',
    title: 'Enthaftungsantrag TP 3A',
    category: 'haft',
    description: 'Antrag auf Aufhebung der U-Haft',
    scenario: 'Enthaftungsantrag nach § 176 StPO. RATG TP 3A mit BMGL nach Ausgangsverfahren Einzelrichter LG (€ 18.000).',
    params: {
      bmgl: 18000,
      bmglLabel: 'Einzelrichter GH',
      gerichtstyp: 'Haftverfahren',
      leistungen: ['Enthaftungsantrag TP 3A', 'ES doppelt', 'ERV']
    },
    breakdown: [
      { label: 'TP 3A Antrag', value: '€ 557,20', detail: 'RATG Anl. 1, Stufe 11 (BMGL € 18.000)' },
      { label: 'Einheitssatz 100% (doppelt)', value: '€ 557,20', detail: '§ 23 RATG (2× 50%)' },
      { label: 'ERV-Beitrag', value: '€ 2,10', detail: '§ 23a RATG' },
    ],
    // Netto: 557,20 + 557,20 + 2,10 = 1.116,50 | USt: 223,30 | Brutto: 1.339,80
    total: { netto: 111650, ust: 22330, ggg: 0, brutto: 133980 }
  },

  // ==================== VERWALTUNGSSTRAFSACHEN ====================
  {
    id: 'vstraf-fuehrerschein',
    title: 'Führerscheinentzug 1,6 Promille',
    category: 'vstraf',
    description: 'Beschwerde + VH gegen Strafe € 2.000 (§ 99 Abs 1 StVO)',
    scenario: 'Lenken mit 1,6 Promille (§ 99 Abs 1 lit a StVO). Strafrahmen € 1.600 – € 5.900, verhängte Strafe € 2.000. → § 13 Abs 1 Z 2 AHK (bis € 2.180) → BMGL € 18.000. Beschwerde + Verhandlung vor dem LVwG (1,5h).',
    params: {
      bmgl: 18000,
      bmglLabel: '§ 13 Z 2 (bis € 2.180)',
      gerichtstyp: 'LVwG',
      leistungen: ['Beschwerde an LVwG', 'VH LVwG (1,5h)']
    },
    breakdown: [
      { label: 'Beschwerde (volle Anfechtung)', value: '€ 1.188,00', detail: '§ 13 AHK → § 9 Z 2 sinngemäß' },
      { label: 'ES Beschwerde (doppelt)', value: '€ 1.188,00', detail: '§ 23 RATG (2× 50%)' },
      { label: 'ERV Beschwerde', value: '€ 2,10', detail: '§ 23a RATG' },
      { label: 'VH 1,5h (3 × ½h)', value: '€ 792,00', detail: '€ 396 + 2 × € 198 (§ 9 Z 2)' },
      { label: 'ES Verhandlung (einfach)', value: '€ 396,00', detail: '§ 23 RATG (max einfach bei VH)' },
    ],
    // Beschwerde Netto: 1188 + 1188 + 2,10 = 2.378,10
    // VH Netto: 792 + 396 = 1.188
    // Gesamt Netto: 3.566,10 | USt: 713,22 | Brutto: 4.279,32
    total: { netto: 356610, ust: 71322, ggg: 0, brutto: 427932 }
  },
  {
    id: 'vstraf-finanzstraf',
    title: 'Finanzstrafverfahren',
    category: 'vstraf',
    description: 'Verhandlung vor Spruchsenat (§ 13 Z 5)',
    scenario: 'Finanzstrafverfahren wegen Abgabenhinterziehung. § 13 Abs 1 Z 5 AHK → BMGL € 27.600 (wie Schöffengericht). Verhandlung vor dem Spruchsenat 2 Stunden.',
    params: {
      bmgl: 27600,
      bmglLabel: '§ 13 Z 5 Finanzstraf',
      gerichtstyp: 'Spruchsenat',
      leistungen: ['Verhandlung Spruchsenat (2h)', 'ES einfach']
    },
    breakdown: [
      { label: 'Erste ½ Stunde', value: '€ 540,00', detail: '§ 13 AHK → § 9 Z 3 sinngemäß' },
      { label: '3 weitere ½ Stunden', value: '€ 810,00', detail: '3 × € 270,00' },
      { label: 'Einheitssatz 50% (einfach)', value: '€ 675,00', detail: '§ 23 RATG (max einfach bei VH)' },
    ],
    // Netto: 540 + 810 + 675 = 2.025 | USt: 405 | Brutto: 2.430
    total: { netto: 202500, ust: 40500, ggg: 0, brutto: 243000 }
  },
  {
    id: 'vstraf-nur-strafhoehe',
    title: 'Beschwerde nur Strafhöhe',
    category: 'vstraf',
    description: 'Reduzierte Tarife nach § 13 Abs 4',
    scenario: 'Beschwerde nur wegen der Höhe der Geldstrafe (nicht gegen Schuldspruch). Strafe € 1.500 → Z 2 (BMGL € 18.000). Reduzierter Tarif nach § 13 Abs 4 AHK.',
    params: {
      bmgl: 18000,
      bmglLabel: '§ 13 Z 2 + Abs 4',
      gerichtstyp: 'LVwG',
      leistungen: ['Beschwerde nur Strafhöhe', 'ES doppelt', 'ERV']
    },
    breakdown: [
      { label: 'Beschwerde (nur Strafhöhe)', value: '€ 590,00', detail: '§ 13 Abs 4 → § 9 Z 2 lit b (nur Strafe)' },
      { label: 'Einheitssatz 100% (doppelt)', value: '€ 590,00', detail: '§ 23 RATG (2× 50%)' },
      { label: 'ERV-Beitrag', value: '€ 2,10', detail: '§ 23a RATG' },
    ],
    // Netto: 590 + 590 + 2,10 = 1.182,10 | USt: 236,42 | Brutto: 1.418,52
    total: { netto: 118210, ust: 23642, ggg: 0, brutto: 141852 }
  },
  {
    id: 'vstraf-disziplinar',
    title: 'Disziplinarverfahren (mittel)',
    category: 'vstraf',
    description: 'Beamtendisziplinarverfahren Z 6',
    scenario: 'Disziplinarverfahren gegen Beamten mit Entlassungsdrohung (mittelschwer). § 13 Abs 1 Z 6 → mittlere Stufe → BMGL € 18.000 (wie Einzelrichter GH). Verhandlung 2h.',
    params: {
      bmgl: 18000,
      bmglLabel: '§ 13 Z 6 Disziplinar',
      gerichtstyp: 'Disziplinarkommission',
      leistungen: ['Verhandlung (2h)', 'ES einfach']
    },
    breakdown: [
      { label: 'Erste ½ Stunde', value: '€ 396,00', detail: '§ 13 AHK → § 9 Z 2 sinngemäß' },
      { label: '3 weitere ½ Stunden', value: '€ 594,00', detail: '3 × € 198,00' },
      { label: 'Einheitssatz 50% (einfach)', value: '€ 495,00', detail: '§ 23 RATG (max einfach bei VH)' },
    ],
    // Netto: 396 + 594 + 495 = 1.485 | USt: 297 | Brutto: 1.782
    total: { netto: 148500, ust: 29700, ggg: 0, brutto: 178200 }
  },
];

interface ExamplesTabProps {
  onLoadExample?: (example: Example) => void;
}

export const ExamplesTab: React.FC<ExamplesTabProps> = ({ onLoadExample }) => {
  const formatEuro = (cents: number) => {
    return new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(cents / 100);
  };

  const zivilExamples = EXAMPLES.filter(e => e.category === 'zivil');
  const strafExamples = EXAMPLES.filter(e => e.category === 'straf');
  const haftExamples = EXAMPLES.filter(e => e.category === 'haft');
  const vstrafExamples = EXAMPLES.filter(e => e.category === 'vstraf');

  const categoryConfig = {
    zivil: { icon: <Scale className="h-4 w-4" />, color: 'blue', label: 'Zivilrecht (RATG)' },
    straf: { icon: <Gavel className="h-4 w-4" />, color: 'red', label: 'Strafrecht (AHK §§ 9-10)' },
    haft: { icon: <Lock className="h-4 w-4" />, color: 'amber', label: 'Haftrecht (AHK § 9 Z 5 + § 10)' },
    vstraf: { icon: <Building2 className="h-4 w-4" />, color: 'orange', label: 'Verwaltungsstrafsachen (AHK § 13)' },
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="grid md:grid-cols-5 gap-8 items-start">
        <div className="md:col-span-3 space-y-4">
          <h2 className="text-3xl font-black text-white tracking-tight">
            Beispiel-<br />berechnungen
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Praxisnahe Berechnungsbeispiele mit konkreten Zahlen.
            Jedes Beispiel zeigt den kompletten Berechnungsweg nach RATG und AHK.
          </p>
        </div>
        <div className="md:col-span-2 flex justify-center">
          <div className="relative w-40 h-40">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/20"></div>
            <div className="absolute inset-4 flex items-center justify-center">
              <Calculator className="h-20 w-20 text-violet-500/40" strokeWidth={1} />
            </div>
          </div>
        </div>
      </div>

      {/* Zivilrecht */}
      <ExampleSection
        examples={zivilExamples}
        config={categoryConfig.zivil}
        formatEuro={formatEuro}
      />

      {/* Strafrecht */}
      <ExampleSection
        examples={strafExamples}
        config={categoryConfig.straf}
        formatEuro={formatEuro}
      />

      {/* Haftrecht */}
      <ExampleSection
        examples={haftExamples}
        config={categoryConfig.haft}
        formatEuro={formatEuro}
      />

      {/* Verwaltungsstrafsachen */}
      <ExampleSection
        examples={vstrafExamples}
        config={categoryConfig.vstraf}
        formatEuro={formatEuro}
      />

      {/* Hinweise */}
      <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-6">
        <h3 className="font-bold text-amber-300 mb-3">Hinweise zu den Beispielen</h3>
        <ul className="space-y-2 text-sm text-amber-200/80">
          <li className="flex items-start gap-2">
            <span className="text-amber-400">•</span>
            <span>Alle Beträge basieren auf aktuellen Tarifen (RATG BGBl. II Nr. 131/2023, GGG BGBl. II Nr. 51/2025, AHK Stand Oktober 2024)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400">•</span>
            <span>Zivilrecht: TP 2 für Klagen/Schriftsätze, TP 3A für Tagsatzungen</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400">•</span>
            <span>Strafrecht/Haft/V-Straf: AHK-Tarife sind verbindliche Sätze für Kostenersatz</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400">•</span>
            <span>Einheitssatz bei Verhandlungen/Kommissionen: maximal einfach (50% bzw. 60%)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400">•</span>
            <span>V-Straf: BMGL nach § 13 Abs 1 richtet sich nach der angedrohten Geldstrafe</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

const ExampleSection: React.FC<{
  examples: Example[];
  config: { icon: React.ReactNode; color: string; label: string };
  formatEuro: (cents: number) => string;
}> = ({ examples, config, formatEuro }) => {
  if (examples.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-${config.color}-400`}>{config.icon}</span>
        <p className={`text-[10px] font-black uppercase tracking-widest text-${config.color}-400`}>
          {config.label}
        </p>
      </div>
      <div className="space-y-4">
        {examples.map((example) => (
          <ExampleCard key={example.id} example={example} formatEuro={formatEuro} />
        ))}
      </div>
    </div>
  );
};

const ExampleCard: React.FC<{ example: Example; formatEuro: (cents: number) => string }> = ({ example, formatEuro }) => {
  const [expanded, setExpanded] = React.useState(false);

  const colorMap: Record<string, { badge: string; total: string }> = {
    zivil: { badge: 'bg-blue-500/20 text-blue-400', total: 'bg-blue-500/20' },
    straf: { badge: 'bg-red-500/20 text-red-400', total: 'bg-red-500/20' },
    haft: { badge: 'bg-amber-500/20 text-amber-400', total: 'bg-amber-500/20' },
    vstraf: { badge: 'bg-orange-500/20 text-orange-400', total: 'bg-orange-500/20' },
  };

  const colors = colorMap[example.category];

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-start justify-between text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors.badge}`}>
              {example.category === 'vstraf' ? 'V-Straf' : example.category}
            </span>
            {example.params.bmglLabel && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-400">
                {example.params.bmglLabel}
              </span>
            )}
            {example.params.streitgenossen && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-400">
                <Users className="h-3 w-3" /> +{example.params.streitgenossen}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-white mb-1">{example.title}</h3>
          <p className="text-sm text-slate-400">{example.description}</p>
        </div>
        <div className="text-right ml-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Brutto</div>
          <div className="text-xl font-black text-white">{formatEuro(example.total.brutto)}</div>
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-white/10 p-5 space-y-4 bg-black/20">
          {/* Scenario */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Sachverhalt</div>
            <p className="text-sm text-slate-300">{example.scenario}</p>
          </div>

          {/* BMGL Info */}
          {example.params.bmgl > 0 && (
            <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">BMGL</div>
                <div className="font-mono font-bold text-white">{formatEuro(example.params.bmgl * 100)}</div>
              </div>
              {example.params.gerichtstyp && (
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Gerichtstyp</div>
                  <div className="text-sm font-bold text-slate-300">{example.params.gerichtstyp}</div>
                </div>
              )}
            </div>
          )}

          {/* Breakdown */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Berechnungsweg</div>
            <div className="space-y-2">
              {example.breakdown.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    {item.detail && <div className="text-xs text-slate-500">{item.detail}</div>}
                  </div>
                  <div className="font-mono text-sm text-blue-400">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-white/10">
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Netto</div>
              <div className="font-mono font-bold text-white">{formatEuro(example.total.netto)}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">USt 20%</div>
              <div className="font-mono font-bold text-white">{formatEuro(example.total.ust)}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">GGG</div>
              <div className="font-mono font-bold text-emerald-400">{formatEuro(example.total.ggg)}</div>
            </div>
            <div className={`${colors.total} rounded-xl p-3`}>
              <div className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-1">Gesamt</div>
              <div className="font-mono font-bold text-white">{formatEuro(example.total.brutto)}</div>
            </div>
          </div>

          {/* Leistungen Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {example.params.leistungen.map((l, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-slate-300">
                {l}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamplesTab;
