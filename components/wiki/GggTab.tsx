import React from 'react';
import { ExternalLink, Building2 } from 'lucide-react';
import { RIS_LINKS, GGG_TARIFPOSTEN, GGG_GEBUEHREN_TP1 } from '../../lib/wiki-data';

export const GggTab: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="grid md:grid-cols-5 gap-8 items-start">
        <div className="md:col-span-3 space-y-4">
          <h2 className="text-3xl font-black text-white tracking-tight">
            Gerichtsgebühren-<br />gesetz (GGG)
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Pauschalgebühren für Einleitungs- und Rechtsmittelschriften im Zivilprozess.
            Die Höhe richtet sich nach dem Streitwert.
          </p>
          <p className="text-sm text-slate-500">Stand: April 2025</p>
        </div>
        <div className="md:col-span-2 flex justify-center">
          <div className="relative w-40 h-40">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20"></div>
            <div className="absolute inset-4 flex items-center justify-center">
              <Building2 className="h-20 w-20 text-emerald-500/40" strokeWidth={1} />
            </div>
          </div>
        </div>
      </div>

      {/* RIS Link */}
      <a
        href={RIS_LINKS.GGG}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors group"
      >
        <span className="font-medium text-emerald-300">GGG im RIS öffnen</span>
        <ExternalLink className="h-4 w-4 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </a>

      {/* Tarifposten */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Tarifposten</p>
        <div className="grid md:grid-cols-2 gap-4">
          {GGG_TARIFPOSTEN.map((tp) => (
            <div key={tp.id} className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs font-mono font-bold text-emerald-400 mb-1">{tp.name}</div>
                  <h4 className="font-bold text-white">{tp.description}</h4>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-white">{tp.minFee}</div>
                </div>
              </div>
              <div className="space-y-1">
                {tp.examples.map((ex, i) => (
                  <div key={i} className="text-sm text-slate-500">{ex}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gebührentabelle */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Gebührenstaffel TP 1 (Auszug)</p>
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left p-4 font-bold text-white">Streitwert bis</th>
                <th className="text-right p-4 font-bold text-white">Gebühr</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {GGG_GEBUEHREN_TP1.map((row, i) => (
                <tr key={i} className="hover:bg-white/5">
                  <td className="p-4 font-mono text-slate-300">€ {row.bis.toLocaleString('de-AT')}</td>
                  <td className="p-4 text-right font-mono text-emerald-400">€ {row.gebuehr.toLocaleString('de-AT', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
              <tr className="bg-emerald-500/10">
                <td className="p-4 font-mono text-slate-300">über € 350.000</td>
                <td className="p-4 text-right text-sm text-slate-400">€ 5.916 + 1,2% vom SW</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Streitgenossen */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <h3 className="font-bold text-white mb-3">Mehrparteien-Zuschlag</h3>
        <p className="text-sm text-slate-400 mb-4">
          Bei mehreren Streitgenossen erhöhen sich die Gerichtsgebühren entsprechend § 19a GGG.
        </p>
        <div className="flex flex-wrap gap-2">
          {['+10%', '+15%', '+20%', '+25%', '+30%', '+50%'].map((z, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-sm font-mono text-slate-300">
              {z}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GggTab;
