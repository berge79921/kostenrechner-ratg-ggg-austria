import React from 'react';
import { ExternalLink, FileText } from 'lucide-react';
import { RIS_LINKS, RATG_TARIFPOSTEN, RATG_PARAGRAPHEN } from '../../lib/wiki-data';

export const RatgTab: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="grid md:grid-cols-5 gap-8 items-start">
        <div className="md:col-span-3 space-y-4">
          <h2 className="text-3xl font-black text-white tracking-tight">
            Rechtsanwalts-<br />tarifgesetz (RATG)
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Das RATG regelt die Entlohnung für anwaltliche Leistungen in Zivilsachen.
            Die Tarife richten sich nach Streitwert und Komplexität der Leistung.
          </p>
          <p className="text-sm text-slate-500">Stand: Mai 2023 (BGBl. II Nr. 131/2023)</p>
        </div>
        <div className="md:col-span-2 flex justify-center">
          <div className="relative w-40 h-40">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/20"></div>
            <div className="absolute inset-4 flex items-center justify-center">
              <FileText className="h-20 w-20 text-blue-500/40" strokeWidth={1} />
            </div>
          </div>
        </div>
      </div>

      {/* RIS Link */}
      <a
        href={RIS_LINKS.RATG}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors group"
      >
        <span className="font-medium text-blue-300">RATG im RIS öffnen</span>
        <ExternalLink className="h-4 w-4 text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </a>

      {/* Wichtige Paragraphen */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Wichtige Bestimmungen</p>
        <div className="grid md:grid-cols-3 gap-4">
          {RATG_PARAGRAPHEN.map((p) => (
            <div key={p.paragraph} className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-blue-400">{p.paragraph}</span>
                {p.risLink && (
                  <a href={p.risLink} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-400">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <h4 className="font-bold text-white mb-2">{p.title}</h4>
              <p className="text-sm text-slate-400 mb-3">{p.description}</p>
              {p.values && (
                <div className="space-y-1">
                  {p.values.map((v, i) => (
                    <div key={i} className="text-xs text-slate-500 font-mono">{v}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tarifposten */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Tarifposten</p>
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left p-4 font-bold text-white">TP</th>
                <th className="text-left p-4 font-bold text-white hidden md:table-cell">Beschreibung</th>
                <th className="text-right p-4 font-bold text-white">Niveau</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {RATG_TARIFPOSTEN.map((tp) => (
                <tr key={tp.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <span className="font-mono font-bold text-blue-400">{tp.id}</span>
                    <div className="text-xs text-slate-500 md:hidden mt-1">{tp.description}</div>
                  </td>
                  <td className="p-4 text-slate-400 hidden md:table-cell">{tp.description}</td>
                  <td className="p-4 text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-slate-300">{tp.level}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Einheitssatz Info */}
      <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-6">
        <h3 className="font-bold text-amber-300 mb-3">Einheitssatz (§ 23 RATG)</h3>
        <p className="text-sm text-amber-200/80 mb-4">
          Pauschaler Zuschlag für Nebenleistungen wie Aktenstudium und Besprechungen.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-black/20 rounded-xl p-4">
            <div className="text-2xl font-black text-amber-400 mb-1">60%</div>
            <div className="text-sm text-amber-200/60">bis € 10.170 BMGL</div>
          </div>
          <div className="bg-black/20 rounded-xl p-4">
            <div className="text-2xl font-black text-amber-400 mb-1">50%</div>
            <div className="text-sm text-amber-200/60">über € 10.170 BMGL</div>
          </div>
        </div>
      </div>

      {/* Anlage 1 Link */}
      <a
        href={RIS_LINKS.RATG_ANLAGE1}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
      >
        <span className="font-medium text-slate-300">RATG Anlage 1 (Tariftabellen) im RIS</span>
        <ExternalLink className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </a>
    </div>
  );
};

export default RatgTab;
