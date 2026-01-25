
import React, { useState } from 'react';
import {
  X, Calculator, Info, ChevronRight, Home, Users, Heart, Briefcase, FileText, Activity,
  Globe, ShieldAlert, Building2, Gavel, Scale, Award, Zap, Hammer, ShieldCheck, Search,
  Trees, Fish, Droplets, Landmark, UserPlus, FileSignature, History, Ban, Map, Construction,
  Flame, Mail, BadgeCheck, ScrollText, Key, LandPlot, LifeBuoy, Euro, Shield, Lock, UserCheck,
  AlertCircle, TrendingUp, ScaleIcon, Clock, Car, Sparkles
} from 'lucide-react';
import { calculateValuation, getValuationDisclaimer, ValuationParams } from '../lib/valuation';

interface ValuationModalProps {
  onClose: () => void;
  onApply: (value: number) => void;
  mode: 'civil' | 'criminal';
}

type Framework = 'RATG' | 'AHK_ZIVIL' | 'STRAF' | 'V_STRAF';

export const ValuationModal: React.FC<ValuationModalProps> = ({ onClose, onApply, mode }) => {
  const [framework, setFramework] = useState<Framework>(mode === 'civil' ? 'RATG' : 'STRAF');
  const [category, setCategory] = useState<string | null>(null);
  const [params, setParams] = useState<ValuationParams>({ sumPenalties: 0, assetValue: 0, monthly: 0, kfz: false, type: 'A' });
  const [searchTerm, setSearchTerm] = useState('');

  const ratgCategories = [
    { id: 'p9_1', icon: <Heart />, label: 'Unterhalt (§ 9)', desc: '36 Monatsleistungen', group: 'Zivilrecht' },
    { id: 'p10_1', icon: <Activity />, label: 'Besitzstörung (§ 10 Z 1)', desc: '800 € / 40 € (KFZ)', group: 'Zivilrecht' },
    { id: 'p10_2', icon: <Home />, label: 'Miete / Räumung (§ 10 Z 2)', desc: 'Bestandsachen', group: 'Zivilrecht' },
    { id: 'p10_3', icon: <Globe />, label: 'IP / Wettbewerb (§ 10 Z 3)', desc: '36.000 €', group: 'Wirtschaft' },
    { id: 'p10_6a', icon: <Briefcase />, label: 'Arbeitsrecht (§ 10 Z 6a)', desc: '24.000 € / 36 Mon.', group: 'Arbeitsrecht' },
  ];

  const ahkZivilCategories = [
    { id: 'ahk_5_1', icon: <Euro />, label: 'Abgabensachen (Z 1)', desc: '5.500 €', group: 'Verwaltung' },
    { id: 'ahk_5_2', icon: <UserPlus />, label: 'Adoption (Z 2)', desc: '9.300 €', group: 'Familie' },
    { id: 'ahk_5_3', icon: <Trees />, label: 'Agrarsachen (Z 3)', desc: '17.300 €', group: 'Verwaltung' },
    { id: 'ahk_5_4', icon: <Construction />, label: 'Bausachen (Z 4)', desc: '9.3k / 34k / 286k', group: 'Immobilien' },
    { id: 'ahk_5_5', icon: <Flame />, label: 'Bergrecht (Z 5)', desc: '57.000 €', group: 'Wirtschaft' },
    { id: 'ahk_5_6', icon: <Home />, label: 'Bestandsachen (Z 6)', desc: '36 Monatsmieten', group: 'Immobilien' },
    { id: 'ahk_5_7', icon: <Map />, label: 'Dienstbarkeiten (Z 7)', desc: '9.300 €', group: 'Immobilien' },
    { id: 'ahk_5_8', icon: <Briefcase />, label: 'Dienstrecht (Z 8)', desc: '3 Jahresbezüge', group: 'Arbeit' },
    { id: 'ahk_5_9', icon: <Zap />, label: 'Elektrizität (Z 9)', desc: '17.300 €', group: 'Verwaltung' },
    { id: 'ahk_5_10', icon: <Hammer />, label: 'Enteignung (Z 10)', desc: '5.500 €', group: 'Verwaltung' },
    { id: 'ahk_5_11', icon: <Fish />, label: 'Fischerei (Z 11)', desc: '17.300 €', group: 'Verwaltung' },
    { id: 'ahk_5_12', icon: <Trees />, label: 'Forstrecht (Z 12)', desc: '17.300 €', group: 'Verwaltung' },
    { id: 'ahk_5_13', icon: <Building2 />, label: 'Gewerbesachen (Z 13)', desc: '17.300 €', group: 'Wirtschaft' },
    { id: 'ahk_5_14', icon: <Award />, label: 'IP / Marken (Z 14)', desc: '57.000 €', group: 'Wirtschaft' },
    { id: 'ahk_5_15', icon: <TrendingUp />, label: 'Grenzberichtigung (Z 15)', desc: '7.200 €', group: 'Immobilien' },
    { id: 'ahk_5_16', icon: <ShieldAlert />, label: 'Insolvenz (Z 16)', desc: '17.300 €', group: 'Wirtschaft' },
    { id: 'ahk_5_17', icon: <Gavel />, label: 'Jagdrecht (Z 17)', desc: '34.600 €', group: 'Verwaltung' },
    { id: 'ahk_5_18', icon: <Ban />, label: 'Kartellrecht (Z 18)', desc: '57.000 €', group: 'Wirtschaft' },
    { id: 'ahk_5_19', icon: <ShieldCheck />, label: 'KFG / Führerschein (Z 19)', desc: '14.000 €', group: 'Verwaltung' },
    { id: 'ahk_5_20', icon: <ScrollText />, label: 'Letztwillige Verf. (Z 20)', desc: '7.200 €', group: 'Familie' },
    { id: 'ahk_5_21', icon: <LandPlot />, label: 'Liegenschaften (Z 21)', desc: 'Verkehrswert', group: 'Immobilien' },
    { id: 'ahk_5_22', icon: <Mail />, label: 'Mediensachen (Z 22)', desc: '11.000 €', group: 'Wirtschaft' },
    { id: 'ahk_5_23', icon: <Users />, label: 'Personenstand (Z 23)', desc: '14.000 €', group: 'Familie' },
    { id: 'ahk_5_24', icon: <Heart />, label: 'Pflegschaft (Z 24)', desc: '7.200 €', group: 'Familie' },
    { id: 'ahk_5_25', icon: <BadgeCheck />, label: 'Erwachsenenschutz (Z 25)', desc: '9.300 €', group: 'Familie' },
    { id: 'ahk_5_26', icon: <Landmark />, label: 'Staatsbürgerschaft (Z 26)', desc: '14.000 €', group: 'Verwaltung' },
    { id: 'ahk_5_27', icon: <LifeBuoy />, label: 'Todeserklärung (Z 27)', desc: '9.300 €', group: 'Familie' },
    { id: 'ahk_5_28', icon: <Droplets />, label: 'Umweltschutz (Z 28)', desc: '17.300 €', group: 'Verwaltung' },
    { id: 'ahk_5_29', icon: <FileSignature />, label: 'Urheberrecht (Z 29)', desc: '57.000 €', group: 'Wirtschaft' },
    { id: 'ahk_5_30', icon: <Users />, label: 'Vereinswesen (Z 30)', desc: '14.000 €', group: 'Wirtschaft' },
    { id: 'ahk_5_31', icon: <Key />, label: 'Verlassenschaft (Z 31)', desc: 'Vermögenswert', group: 'Familie' },
    { id: 'ahk_5_32', icon: <Droplets />, label: 'Wasserrecht (Z 32)', desc: '17.300 €', group: 'Verwaltung' },
    { id: 'ahk_5_33', icon: <Building2 />, label: 'WEG-Sachen (Z 33)', desc: '9.300 €', group: 'Immobilien' },
    { id: 'ahk_5_34', icon: <ScaleIcon />, label: 'Auffangwert (Z 34)', desc: '21k / 55k €', group: 'Sonstiges' },
    { id: 'ahk_5_35', icon: <Gavel />, label: 'Verwaltungsgerichte (Z 35)', desc: '34.600 €', group: 'Verwaltung' },
    { id: 'ahk_5_36', icon: <ShieldCheck />, label: 'Patientenverfügung (Z 36)', desc: '21.200 €', group: 'Familie' },
    { id: 'ahk_5_37', icon: <ShieldCheck />, label: 'Vorsorgevollmacht (Z 37)', desc: '21.200 €', group: 'Familie' },
  ];

  const currentCategories = (
    framework === 'RATG' ? ratgCategories :
    framework === 'AHK_ZIVIL' ? ahkZivilCategories : []
  ).filter(c => 
    c.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.id.includes(searchTerm)
  );

  const handleApply = () => {
    const val = calculateValuation(category!, params);
    onApply(val);
  };

  const needsMonthlyInput = (catId: string) => {
    if (catId === 'p10_2') return params.type === 'A';
    return ['p9_1', 'ahk_5_6', 'ahk_5_8', 'p10_6a'].includes(catId);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-3xl transition-opacity animate-in fade-in duration-500" onClick={onClose}></div>
      
      <div className="relative w-full max-w-5xl bg-white/80 rounded-[3rem] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col border border-white/50 max-h-[95vh] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent blur-sm"></div>

        {/* Header Section */}
        <div className="p-10 pb-6 shrink-0 relative z-10">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-1">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                Streitwert<span className="text-blue-600">Ermittler</span>
              </h2>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Smart Valuation Engine 2.0</span>
              </div>
            </div>
            <button onClick={onClose} className="p-3 rounded-full bg-white/50 hover:bg-white text-slate-400 hover:text-slate-900 transition-all shadow-sm border border-slate-200">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation - Better Visual Hierarchy */}
          <div className="flex p-1.5 bg-slate-200/30 rounded-[1.75rem] border border-slate-300/20 backdrop-blur-md mb-6">
            {['RATG', 'AHK ZIVIL', 'STRAF', 'V-STRAF'].map((label) => (
              <button
                key={label}
                onClick={() => { setFramework(label.replace(' ', '_') as Framework); setCategory(null); }}
                className={`flex-1 py-3.5 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest transition-all duration-500 ${
                  framework === label.replace(' ', '_') || (label === 'V-STRAF' && framework === 'V_STRAF')
                  ? 'bg-white text-slate-900 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] scale-100 ring-1 ring-slate-200' 
                  : 'text-slate-400 hover:text-slate-600 scale-95 opacity-70'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {!category && (
            <div className="relative group animate-in fade-in slide-in-from-top-2 duration-700">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
              <input
                placeholder="Suche Ziffer, Begriff oder Norm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/40 border border-slate-200 rounded-[1.5rem] pl-16 pr-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all placeholder:text-slate-300"
              />
            </div>
          )}
        </div>

        {/* Content Area - Full 37 Ziffern Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-10 relative z-10">
          {!category ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {currentCategories.map((c, i) => (
                <button
                  key={c.id}
                  style={{ animationDelay: `${i * 20}ms` }}
                  onClick={() => { setCategory(c.id); setParams({ ...params, kfz: false, type: 'A' }); }}
                  className="group p-5 rounded-[2rem] bg-white/60 border border-white hover:bg-white hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] hover:scale-[1.03] transition-all flex items-center gap-4 text-left animate-in fade-in slide-in-from-bottom-2"
                >
                  <div className="h-12 w-12 rounded-2xl bg-slate-100/50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner group-hover:shadow-blue-200 group-hover:-rotate-3">
                    {React.cloneElement(c.icon as React.ReactElement<any>, { className: "h-5 w-5" })}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-black text-slate-800 truncate leading-tight">{c.label}</div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate mt-0.5">{c.desc}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500">
              <button 
                onClick={() => setCategory(null)} 
                className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-100 shadow-sm"
              >
                ← Zurück zur Auswahl
              </button>

              {/* Info Disclaimer */}
              <div className="bg-blue-50/50 p-6 rounded-[2.5rem] border border-blue-100/50 flex gap-5 items-start">
                <div className="p-3 rounded-2xl bg-blue-100 text-blue-600">
                  <Info className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold leading-relaxed text-slate-600 pt-1 italic">
                  {getValuationDisclaimer(category)}
                </p>
              </div>

              {/* Possession Disturbance Selection (User's Favorite Feature) */}
              {category === 'p10_1' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: false, label: 'Regelfall', desc: 'Allgemein § 10 Z 1', icon: <Building2 />, color: 'blue' },
                    { id: true, label: 'Parkstörung', desc: 'KFZ § 10 Z 1A', icon: <Car />, color: 'indigo' }
                  ].map(item => (
                    <button
                      key={String(item.id)}
                      onClick={() => setParams({...params, kfz: item.id})}
                      className={`p-8 rounded-[2.5rem] text-left transition-all border-4 flex items-center gap-6 ${params.kfz === item.id ? 'bg-white border-blue-600 shadow-2xl scale-[1.02]' : 'bg-slate-50/50 border-transparent text-slate-400 hover:bg-white hover:border-slate-200'}`}
                    >
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${params.kfz === item.id ? 'bg-blue-600 text-white' : 'bg-white shadow-sm'}`}>
                        {React.cloneElement(item.icon as React.ReactElement<any>, { className: "h-6 w-6" })}
                      </div>
                      <div>
                        <div className={`text-xl font-black leading-tight ${params.kfz === item.id ? 'text-slate-900' : ''}`}>{item.label}</div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mt-1">{item.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Monthly Input - High-End Premium Look */}
              {needsMonthlyInput(category) && (
                <div className="bg-white p-8 rounded-[3rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-focus-within:opacity-10 transition-opacity">
                    <Sparkles className="h-24 w-24 text-blue-600" />
                  </div>
                  <div className="flex justify-between items-center mb-6 px-1">
                    <label className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-500">Monatlicher Betrag (€)</label>
                    <div className="bg-blue-50 px-4 py-2 rounded-full border border-blue-100 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Faktor: {category === 'p10_2' ? 'x12' : 'x36'}</span>
                    </div>
                  </div>
                  <div className="relative">
                    <Euro className="absolute left-6 top-1/2 -translate-y-1/2 h-10 w-10 text-slate-200 group-focus-within:text-blue-200 transition-colors" />
                    <input
                      type="number"
                      placeholder="0,00"
                      value={params.monthly || ''}
                      onChange={(e) => setParams({...params, monthly: parseFloat(e.target.value) || 0})}
                      className="w-full bg-slate-50 border-none rounded-[2rem] pl-20 pr-12 py-8 text-5xl font-black outline-none focus:ring-8 focus:ring-blue-100 transition-all text-slate-900 placeholder:text-slate-200"
                    />
                  </div>
                </div>
              )}

              {/* Special Input for Property/Asset Values */}
              {(category === 'ahk_5_21' || category === 'ahk_5_31' || category === 'ahk_10' || category === 'ahk_5_4') && (
                <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                  <label className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6 block">Wert des Objekts / Vermögen (€)</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Geldwert..."
                      value={params.assetValue || ''}
                      onChange={(e) => setParams({...params, assetValue: parseFloat(e.target.value) || 0})}
                      className="w-full bg-slate-50 border-none rounded-[2rem] px-8 py-8 text-4xl font-black outline-none focus:ring-8 focus:ring-blue-100 transition-all text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* RESULT ZONE - The "WOW" Factor */}
              <div className="p-14 text-center bg-[#0f172a] rounded-[4rem] relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border-4 border-slate-800">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-indigo-600/10 to-transparent"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 blur-[60px] rounded-full"></div>
                <div className="relative z-10 space-y-4">
                  <p className="text-[11px] text-blue-400 font-black uppercase tracking-[0.6em] mb-4">Berechneter Übernahmewert</p>
                  <div className="text-[8rem] font-black text-white leading-none tracking-tighter flex items-baseline justify-center gap-4">
                    <span className="drop-shadow-[0_10px_20px_rgba(59,130,246,0.4)]">
                      {calculateValuation(category, params).toLocaleString('de-AT')}
                    </span>
                    <span className="text-4xl font-black text-slate-500 tracking-normal">€</span>
                  </div>
                </div>
              </div>

              {/* Main Action Button - Apple Pill Style */}
              <button
                onClick={handleApply}
                className="w-full py-10 rounded-[2.5rem] font-black text-white text-2xl bg-blue-600 hover:bg-blue-500 transition-all shadow-[0_20px_60px_-10px_rgba(37,99,235,0.4)] active:scale-[0.98] border-b-8 border-blue-800 hover:translate-y-1 hover:border-b-2"
              >
                In Kalkulator übernehmen
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
};
