import React from 'react';
import { Play, Calculator, ArrowRight, Scale, Gavel, FileText, Users } from 'lucide-react';

interface Example {
  id: string;
  title: string;
  category: 'zivil' | 'straf';
  description: string;
  scenario: string;
  params: {
    bmgl: number;
    leistungen: string[];
    streitgenossen?: number;
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
  {
    id: 'mahnklage-5k',
    title: 'Mahnklage € 5.000',
    category: 'zivil',
    description: 'Einfache Geldforderung beim Bezirksgericht',
    scenario: 'Ein Unternehmer klagt eine offene Rechnung über € 5.000 ein. Mahnklage mit ERV-Einbringung.',
    params: {
      bmgl: 5000,
      leistungen: ['Mahnklage (TP 2)']
    },
    breakdown: [
      { label: 'Tarifsatz TP 2', value: '€ 52,50', detail: 'RATG Anl. 1, bis € 7.000' },
      { label: 'Einheitssatz 60%', value: '€ 31,50', detail: '§ 23 RATG' },
      { label: 'ERV-Beitrag', value: '€ 5,00', detail: '§ 23a RATG (verfahrenseinl.)' },
    ],
    total: { netto: 8610, ust: 1722, ggg: 11900, brutto: 22232 }
  },
  {
    id: 'klage-25k',
    title: 'Klage € 25.000',
    category: 'zivil',
    description: 'Schadenersatzklage beim Landesgericht',
    scenario: 'Klage auf Schadenersatz wegen Vertragsverletzung. Streitwert € 25.000, qualifizierter Schriftsatz (TP 3A).',
    params: {
      bmgl: 25000,
      leistungen: ['Klage (TP 3A)']
    },
    breakdown: [
      { label: 'Tarifsatz TP 3A', value: '€ 208,80', detail: 'RATG Anl. 1, bis € 36.340' },
      { label: 'Einheitssatz 50%', value: '€ 104,40', detail: '§ 23 RATG (über € 10.170)' },
      { label: 'ERV-Beitrag', value: '€ 5,00', detail: '§ 23a RATG (verfahrenseinl.)' },
    ],
    total: { netto: 31530, ust: 6306, ggg: 35000, brutto: 72836 }
  },
  {
    id: 'berufung-streitgenossen',
    title: 'Berufung mit 3 Klägern',
    category: 'zivil',
    description: 'Berufung an OLG mit Streitgenossenzuschlag',
    scenario: 'Drei Kläger berufen gemeinsam gegen ein Urteil. Streitwert € 50.000, TP 3B mit 20% Zuschlag.',
    params: {
      bmgl: 50000,
      leistungen: ['Berufung (TP 3B)'],
      streitgenossen: 2
    },
    breakdown: [
      { label: 'Tarifsatz TP 3B', value: '€ 519,30', detail: 'RATG Anl. 1, bis € 72.680' },
      { label: 'Streitgenossenzuschlag +20%', value: '€ 103,86', detail: '§ 15 RATG (3 Parteien)' },
      { label: 'Einheitssatz 50%', value: '€ 311,58', detail: '§ 23 RATG' },
      { label: 'ERV-Beitrag', value: '€ 5,00', detail: '§ 23a RATG (verfahrenseinl.)' },
    ],
    total: { netto: 93684, ust: 18737, ggg: 97400, brutto: 209821 }
  },
  {
    id: 'revision-ogh',
    title: 'Revision an OGH',
    category: 'zivil',
    description: 'Außerordentliche Revision € 100.000',
    scenario: 'Revision gegen OLG-Entscheidung. Streitwert € 100.000, höchste Tarifstufe TP 3C.',
    params: {
      bmgl: 100000,
      leistungen: ['Revision (TP 3C)']
    },
    breakdown: [
      { label: 'Tarifsatz TP 3C', value: '€ 779,40', detail: 'RATG Anl. 1, bis € 145.360' },
      { label: 'Einheitssatz 50%', value: '€ 389,70', detail: '§ 23 RATG' },
      { label: 'ERV-Beitrag', value: '€ 5,00', detail: '§ 23a RATG (verfahrenseinl.)' },
    ],
    total: { netto: 117120, ust: 23424, ggg: 162600, brutto: 303144 }
  },
  {
    id: 'tagsatzung-lg',
    title: 'Streitverhandlung LG',
    category: 'zivil',
    description: '3-stündige Tagsatzung beim Landesgericht',
    scenario: 'Streitverhandlung in einem Zivilprozess. Streitwert € 35.000, Dauer 3 Stunden.',
    params: {
      bmgl: 35000,
      leistungen: ['Tagsatzung TP 3A (3h)']
    },
    breakdown: [
      { label: '1. Stunde (TP 3A)', value: '€ 243,60', detail: 'RATG Anl. 2' },
      { label: '2. Stunde (halber Satz)', value: '€ 121,80', detail: 'RATG Anl. 2' },
      { label: '3. Stunde (halber Satz)', value: '€ 121,80', detail: 'RATG Anl. 2' },
      { label: 'Einheitssatz 50%', value: '€ 243,60', detail: '§ 23 RATG' },
    ],
    total: { netto: 73080, ust: 14616, ggg: 0, brutto: 87696 }
  },
  {
    id: 'hv-schoeffengericht',
    title: 'Hauptverhandlung Schöffengericht',
    category: 'straf',
    description: 'Strafverteidigung vor dem Schöffensenat',
    scenario: 'Verteidigung in einem Betrugsverfahren vor dem Schöffengericht. Halbtägige Hauptverhandlung.',
    params: {
      bmgl: 0,
      leistungen: ['Hauptverhandlung Schöffengericht']
    },
    breakdown: [
      { label: 'HV Schöffengericht (AHK)', value: '€ 1.500 – € 4.000', detail: '§ 10 AHK' },
      { label: 'Vorbereitung', value: 'nach Aufwand', detail: 'Stundensatz € 200-500' },
    ],
    total: { netto: 250000, ust: 50000, ggg: 0, brutto: 300000 }
  },
  {
    id: 'nichtigkeitsbeschwerde',
    title: 'Nichtigkeitsbeschwerde OGH',
    category: 'straf',
    description: 'Rechtsmittel gegen Schuldspruch',
    scenario: 'Einbringung einer Nichtigkeitsbeschwerde und Berufung gegen ein Urteil des Landesgerichts.',
    params: {
      bmgl: 0,
      leistungen: ['Nichtigkeitsbeschwerde + Berufung']
    },
    breakdown: [
      { label: 'Nichtigkeitsbeschwerde (AHK)', value: '€ 1.500 – € 5.000', detail: '§ 10 AHK' },
      { label: 'Berufung wegen Strafe', value: '€ 800 – € 3.000', detail: '§ 10 AHK' },
    ],
    total: { netto: 400000, ust: 80000, ggg: 0, brutto: 480000 }
  },
  {
    id: 'vollpaket-zivilprozess',
    title: 'Vollständiger Zivilprozess 1. Instanz',
    category: 'zivil',
    description: 'Klage + Replik + 2 Tagsatzungen',
    scenario: 'Kompletter Prozess: Klage, Replik auf Klagebeantwortung, vorbereitende Tagsatzung (1h), Streitverhandlung (2h). Streitwert € 20.000.',
    params: {
      bmgl: 20000,
      leistungen: ['Klage (TP 3A)', 'Replik (TP 2)', 'Tagsatzung 1h', 'Tagsatzung 2h']
    },
    breakdown: [
      { label: 'Klage TP 3A + ES', value: '€ 299,52', detail: 'Tarifsatz + 60% ES + ERV' },
      { label: 'Replik TP 2 + ES', value: '€ 126,42', detail: 'Tarifsatz + 60% ES + ERV' },
      { label: 'Vorb. Tagsatzung 1h + ES', value: '€ 264,96', detail: 'TP 3A Tagsatzung' },
      { label: 'Streitverhandlung 2h + ES', value: '€ 397,44', detail: '1h voll + 1h halb + ES' },
    ],
    total: { netto: 108834, ust: 21767, ggg: 19000, brutto: 149601 }
  }
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

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="grid md:grid-cols-5 gap-8 items-start">
        <div className="md:col-span-3 space-y-4">
          <h2 className="text-3xl font-black text-white tracking-tight">
            Beispiel-<br />berechnungen
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Praxisnahe Berechnungsbeispiele zum Nachvollziehen der Kostenlogik.
            Jedes Beispiel zeigt den kompletten Berechnungsweg.
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

      {/* Zivilrecht Beispiele */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Scale className="h-4 w-4 text-blue-400" />
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Zivilrecht (RATG)</p>
        </div>
        <div className="space-y-4">
          {zivilExamples.map((example) => (
            <ExampleCard key={example.id} example={example} formatEuro={formatEuro} />
          ))}
        </div>
      </div>

      {/* Strafrecht Beispiele */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Gavel className="h-4 w-4 text-red-400" />
          <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Strafrecht (AHK)</p>
        </div>
        <div className="space-y-4">
          {strafExamples.map((example) => (
            <ExampleCard key={example.id} example={example} formatEuro={formatEuro} />
          ))}
        </div>
      </div>

      {/* Hinweise */}
      <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-6">
        <h3 className="font-bold text-amber-300 mb-3">Hinweise zu den Beispielen</h3>
        <ul className="space-y-2 text-sm text-amber-200/80">
          <li className="flex items-start gap-2">
            <span className="text-amber-400">•</span>
            <span>Alle Beträge sind Richtwerte basierend auf den aktuellen Tarifen (RATG Stand Mai 2023, GGG Stand April 2025)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400">•</span>
            <span>Die tatsächlichen Kosten können je nach Verfahrensdetails abweichen</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400">•</span>
            <span>AHK-Honorare sind Rahmenbeträge – die konkrete Vereinbarung ist maßgeblich</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400">•</span>
            <span>Gerichtsgebühren (GGG) fallen nur bei Einleitungs- und Rechtsmittelschriften an</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

const ExampleCard: React.FC<{ example: Example; formatEuro: (cents: number) => string }> = ({ example, formatEuro }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-start justify-between text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              example.category === 'zivil' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {example.category}
            </span>
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
            <div className="bg-blue-500/20 rounded-xl p-3">
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
