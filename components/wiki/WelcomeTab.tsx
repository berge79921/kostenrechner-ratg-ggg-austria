import React from 'react';
import { AlertTriangle, Briefcase, GraduationCap, Scale } from 'lucide-react';
import { DISCLAIMER_TEXT, INTRO_TEXT } from '../../lib/wiki-data';

export const WelcomeTab: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Disclaimer */}
      <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-amber-300 mb-1">Experimenteller Status</h3>
            <p className="text-sm text-amber-200/80">{DISCLAIMER_TEXT}</p>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="grid md:grid-cols-5 gap-8 items-center">
        <div className="md:col-span-3 space-y-4">
          <h2 className="text-4xl font-black text-white tracking-tight leading-tight">
            Transparenz im<br />Tarifwesen.
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed">{INTRO_TEXT}</p>
        </div>
        <div className="md:col-span-2 flex justify-center">
          <div className="relative w-48 h-48">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-violet-500/20 border border-white/10"></div>
            <div className="absolute inset-4 flex items-center justify-center">
              <Scale className="h-24 w-24 text-blue-500/40" strokeWidth={1} />
            </div>
          </div>
        </div>
      </div>

      {/* Zielgruppen */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Zielgruppen</p>
        <div className="grid md:grid-cols-3 gap-4">
          <TargetCard icon={<Briefcase className="h-5 w-5" />} title="Praktiker" desc="Tariflogik verstehen" color="blue" />
          <TargetCard icon={<GraduationCap className="h-5 w-5" />} title="Studenten" desc="Prüfungsvorbereitung" color="emerald" />
          <TargetCard icon={<Scale className="h-5 w-5" />} title="Rechtsanwender" desc="Kostenlogik nachvollziehen" color="violet" />
        </div>
      </div>

      {/* Quick Start */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <h3 className="font-bold text-white mb-4">Quick Start</h3>
        <ol className="space-y-3 text-sm text-slate-400">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">1</span>
            <span><strong className="text-white">Streitwert eingeben</strong> – Die Bemessungsgrundlage</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">2</span>
            <span><strong className="text-white">Leistung wählen</strong> – Aus dem Katalog auswählen</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">3</span>
            <span><strong className="text-white">PDF exportieren</strong> – Kostenverzeichnis herunterladen</span>
          </li>
        </ol>
      </div>
    </div>
  );
};

const TargetCard: React.FC<{ icon: React.ReactNode; title: string; desc: string; color: string }> = ({ icon, title, desc, color }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400'
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <div className="mb-3">{icon}</div>
      <h4 className="font-bold text-white mb-1">{title}</h4>
      <p className="text-sm text-slate-400">{desc}</p>
    </div>
  );
};

export default WelcomeTab;
