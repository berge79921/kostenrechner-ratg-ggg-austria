import React from 'react';
import { ExternalLink, Scale, Building2, Gavel, FileText, BookOpen } from 'lucide-react';
import { RIS_LINKS } from '../../lib/wiki-data';

interface LinkItem {
  title: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  color: string;
}

const LINKS: LinkItem[] = [
  {
    title: 'RATG - Rechtsanwaltstarifgesetz',
    description: 'Tarife für anwaltliche Leistungen in Zivilsachen',
    url: RIS_LINKS.RATG,
    icon: <Scale className="h-5 w-5" />,
    color: 'blue'
  },
  {
    title: 'RATG Anlage 1 - Tariftabellen',
    description: 'Detaillierte Tariftabellen nach Streitwert',
    url: RIS_LINKS.RATG_ANLAGE1,
    icon: <FileText className="h-5 w-5" />,
    color: 'blue'
  },
  {
    title: 'GGG - Gerichtsgebührengesetz',
    description: 'Pauschalgebühren für Klagen und Rechtsmittel',
    url: RIS_LINKS.GGG,
    icon: <Building2 className="h-5 w-5" />,
    color: 'emerald'
  },
  {
    title: 'ZPO - Zivilprozessordnung',
    description: 'Verfahrensrecht für Zivilsachen',
    url: RIS_LINKS.ZPO,
    icon: <BookOpen className="h-5 w-5" />,
    color: 'violet'
  },
  {
    title: 'StPO - Strafprozessordnung',
    description: 'Verfahrensrecht für Strafsachen',
    url: RIS_LINKS.StPO,
    icon: <Gavel className="h-5 w-5" />,
    color: 'red'
  },
  {
    title: '§ 381 StPO - Kostenersatz',
    description: 'Kostenersatz im Strafverfahren',
    url: RIS_LINKS.StPO_381,
    icon: <Gavel className="h-5 w-5" />,
    color: 'red'
  },
  {
    title: 'AHK - Allgemeine Honorar-Kriterien',
    description: 'Honorarempfehlungen der ÖRAK (PDF)',
    url: RIS_LINKS.AHK,
    icon: <FileText className="h-5 w-5" />,
    color: 'amber'
  },
  {
    title: 'ÖRAK Gesetzestexte',
    description: 'Übersicht aller relevanten Gesetze bei der Rechtsanwaltskammer',
    url: RIS_LINKS.OERAK_GESETZE,
    icon: <BookOpen className="h-5 w-5" />,
    color: 'slate'
  }
];

export const LinksTab: React.FC = () => {
  const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
    slate: { bg: 'bg-white/5', border: 'border-white/10', text: 'text-slate-400' }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-3xl font-black text-white tracking-tight">Gesetzeslinks</h2>
        <p className="text-slate-400">
          Direkte Links zu den relevanten Rechtstexten im RIS (Rechtsinformationssystem des Bundes)
          und bei der ÖRAK (Österreichischer Rechtsanwaltskammertag).
        </p>
      </div>

      <div className="grid gap-4">
        {LINKS.map((link, i) => {
          const colors = colorClasses[link.color];
          return (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-4 p-4 rounded-xl ${colors.bg} border ${colors.border} hover:bg-opacity-75 transition-colors group`}
            >
              <div className={`flex-shrink-0 h-10 w-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center ${colors.text}`}>
                {link.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white">{link.title}</div>
                <div className="text-sm text-slate-400 truncate">{link.description}</div>
              </div>
              <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </a>
          );
        })}
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <h3 className="font-bold text-white mb-2">Über das RIS</h3>
        <p className="text-sm text-slate-400">
          Das Rechtsinformationssystem des Bundes (RIS) ist die offizielle Plattform für
          die Veröffentlichung von Bundesgesetzen, Verordnungen und Rechtsprechung in Österreich.
          Alle Links führen zur tagesaktuellen, konsolidierten Fassung der jeweiligen Rechtsvorschrift.
        </p>
      </div>
    </div>
  );
};

export default LinksTab;
