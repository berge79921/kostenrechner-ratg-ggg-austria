import React from 'react';
import { ExternalLink, Gavel, Shield, FileText } from 'lucide-react';
import { RIS_LINKS, AHK_SECTIONS } from '../../lib/wiki-data';

export const AhkTab: React.FC = () => {
  const iconMap: Record<string, React.ReactNode> = {
    straf: <Gavel className="h-5 w-5" />,
    vstraf: <Shield className="h-5 w-5" />,
    zivil: <FileText className="h-5 w-5" />
  };

  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    straf: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' },
    vstraf: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
    zivil: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' }
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="grid md:grid-cols-5 gap-8 items-start">
        <div className="md:col-span-3 space-y-4">
          <h2 className="text-3xl font-black text-white tracking-tight">
            Autonome Honorar-<br />kriterien (AHK)
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Die AHK sind Empfehlungen der Rechtsanwaltskammer für Honorare außerhalb
            des RATG, insbesondere für Strafverteidigung und Verwaltungsstrafrecht.
          </p>
          <p className="text-sm text-slate-500">Stand: 1. Oktober 2024</p>
        </div>
        <div className="md:col-span-2 flex justify-center">
          <div className="relative w-40 h-40">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/20"></div>
            <div className="absolute inset-4 flex items-center justify-center">
              <Gavel className="h-20 w-20 text-red-500/40" strokeWidth={1} />
            </div>
          </div>
        </div>
      </div>

      {/* AHK PDF Link */}
      <a
        href={RIS_LINKS.AHK}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors group"
      >
        <span className="font-medium text-red-300">AHK (PDF) bei ÖRAK öffnen</span>
        <ExternalLink className="h-4 w-4 text-red-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </a>

      {/* Hinweis */}
      <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-6">
        <h3 className="font-bold text-amber-300 mb-2">Hinweis zur Verbindlichkeit</h3>
        <p className="text-sm text-amber-200/80">
          Die AHK sind keine verbindlichen Tarife, sondern Empfehlungen.
          Die tatsächliche Honorierung ist frei vereinbar. Die Spannen dienen der Orientierung.
        </p>
      </div>

      {/* AHK Sections */}
      <div className="space-y-6">
        {AHK_SECTIONS.map((section) => {
          const colors = colorMap[section.id];
          return (
            <div key={section.id} className={`rounded-2xl ${colors.bg} border ${colors.border} p-6`}>
              <div className="flex items-start gap-4 mb-4">
                <div className={`flex-shrink-0 h-10 w-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center ${colors.text}`}>
                  {iconMap[section.id]}
                </div>
                <div>
                  <div className={`text-xs font-mono font-bold ${colors.text} mb-1`}>{section.paragraph}</div>
                  <h3 className="font-bold text-white">{section.title}</h3>
                  <p className="text-sm text-slate-400">{section.description}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3 mt-4">
                {section.items.map((item, i) => (
                  <div key={i} className="bg-black/20 rounded-xl p-4">
                    <div className="text-sm font-medium text-slate-300 mb-1">{item.name}</div>
                    <div className="font-mono font-bold text-white">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* StPO Link */}
      <a
        href={RIS_LINKS.StPO_381}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
      >
        <span className="font-medium text-slate-300">§ 381 StPO (Kostenersatz Strafverfahren) im RIS</span>
        <ExternalLink className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </a>

      {/* ÖRAK Gesetzestexte */}
      <a
        href={RIS_LINKS.OERAK_GESETZE}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
      >
        <span className="font-medium text-slate-300">Weitere Gesetzestexte bei ÖRAK</span>
        <ExternalLink className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </a>
    </div>
  );
};

export default AhkTab;
