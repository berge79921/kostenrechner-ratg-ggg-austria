import React, { useState } from 'react';
import { AlertTriangle, Briefcase, GraduationCap, Scale, FileText, Calculator, Users, Download, BookOpen, Building2, Gavel, Lock, ChevronRight, ChevronDown, Save, Upload, List, Plus } from 'lucide-react';
import { DISCLAIMER_TEXT, INTRO_TEXT, TUTORIAL_SECTIONS } from '../../lib/wiki-data';

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
            <span><strong className="text-white">Neue Kostennote</strong> – Klicken Sie auf "Neue Kostennote" in der Listenansicht</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">2</span>
            <span><strong className="text-white">Modus wählen</strong> – Zivil, Straf, Haft oder V-Straf</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">3</span>
            <span><strong className="text-white">Streitwert/BMGL</strong> – Die Bemessungsgrundlage eingeben</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">4</span>
            <span><strong className="text-white">Leistungen hinzufügen</strong> – Aus dem Katalog auswählen</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">5</span>
            <span><strong className="text-white">PDF exportieren</strong> – Kostenverzeichnis herunterladen</span>
          </li>
        </ol>
      </div>

      {/* Features */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Kalkulator-Features</p>
        <div className="grid md:grid-cols-2 gap-3">
          <FeatureCard icon={<List className="h-4 w-4" />} title="Multi-Kostennoten" desc="Beliebig viele Kostennoten verwalten" />
          <FeatureCard icon={<Save className="h-4 w-4" />} title="Auto-Speichern" desc="Alle Daten im Browser gespeichert" />
          <FeatureCard icon={<Calculator className="h-4 w-4" />} title="Automatische Berechnung" desc="RATG, AHK & GGG korrekt angewendet" />
          <FeatureCard icon={<Users className="h-4 w-4" />} title="Streitgenossen" desc="§ 15 RATG automatisch berechnet" />
          <FeatureCard icon={<FileText className="h-4 w-4" />} title="Einheitssatz" desc="60% / 50% nach § 23 RATG" />
          <FeatureCard icon={<Download className="h-4 w-4" />} title="PDF-Export" desc="Vollständiges Kostenverzeichnis" />
          <FeatureCard icon={<Upload className="h-4 w-4" />} title="CSV Import/Export" desc="Daten sichern und wiederherstellen" />
          <FeatureCard icon={<Gavel className="h-4 w-4" />} title="4 Rechtsbereiche" desc="Zivil, Straf, Haft, V-Straf" />
        </div>
      </div>

      {/* Tutorial */}
      <TutorialSection />

      {/* Wiki-Navigation */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">In dieser Dokumentation</p>
        <div className="grid md:grid-cols-3 gap-3">
          <NavCard icon={<Scale className="h-5 w-5" />} title="RATG" desc="Rechtsanwaltstarif" color="blue" />
          <NavCard icon={<Building2 className="h-5 w-5" />} title="GGG" desc="Gerichtsgebühren" color="emerald" />
          <NavCard icon={<Gavel className="h-5 w-5" />} title="AHK" desc="Autonome Honorarkriterien" color="red" />
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
    <div className="flex-shrink-0 text-blue-400">{icon}</div>
    <div>
      <div className="font-medium text-white text-sm">{title}</div>
      <div className="text-xs text-slate-500">{desc}</div>
    </div>
  </div>
);

const NavCard: React.FC<{ icon: React.ReactNode; title: string; desc: string; color: string }> = ({ icon, title, desc, color }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    red: 'bg-red-500/10 border-red-500/20 text-red-400'
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="mb-2">{icon}</div>
      <div className="font-bold text-white text-sm">{title}</div>
      <div className="text-xs text-slate-400">{desc}</div>
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

// Tutorial Section mit aufklappbaren Bereichen
const TutorialSection: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const sectionIcons: Record<string, React.ReactNode> = {
    overview: <BookOpen className="h-4 w-4" />,
    civil: <Scale className="h-4 w-4" />,
    criminal: <Gavel className="h-4 w-4" />,
    detention: <Lock className="h-4 w-4" />,
    vstraf: <Building2 className="h-4 w-4" />,
    export: <Download className="h-4 w-4" />,
    metadata: <FileText className="h-4 w-4" />,
  };

  const sectionColors: Record<string, string> = {
    overview: 'blue',
    civil: 'blue',
    criminal: 'red',
    detention: 'amber',
    vstraf: 'orange',
    export: 'emerald',
    metadata: 'violet',
  };

  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Tutorial</p>
      <div className="space-y-2">
        {TUTORIAL_SECTIONS.map((section) => {
          const isOpen = openSection === section.id;
          const color = sectionColors[section.id] || 'blue';
          const colorClasses: Record<string, { border: string; bg: string; text: string }> = {
            blue: { border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400' },
            red: { border: 'border-red-500/30', bg: 'bg-red-500/10', text: 'text-red-400' },
            amber: { border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-400' },
            orange: { border: 'border-orange-500/30', bg: 'bg-orange-500/10', text: 'text-orange-400' },
            emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
            violet: { border: 'border-violet-500/30', bg: 'bg-violet-500/10', text: 'text-violet-400' },
          };
          const colors = colorClasses[color];

          return (
            <div key={section.id} className={`rounded-xl border ${isOpen ? colors.border : 'border-white/10'} overflow-hidden transition-all`}>
              <button
                onClick={() => setOpenSection(isOpen ? null : section.id)}
                className={`w-full flex items-center justify-between px-4 py-3 ${isOpen ? colors.bg : 'bg-white/5 hover:bg-white/10'} transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <span className={isOpen ? colors.text : 'text-slate-400'}>{sectionIcons[section.id]}</span>
                  <span className={`font-bold ${isOpen ? 'text-white' : 'text-slate-300'}`}>{section.title}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                )}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-3">
                  {section.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 pt-3 border-t border-white/5">
                      <span className={`flex-shrink-0 h-5 w-5 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center text-[10px] font-bold`}>
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-medium text-white text-sm">{step.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WelcomeTab;
