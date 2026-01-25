import React, { useState } from 'react';
import { ExternalLink, FileText, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { RIS_LINKS, RATG_TARIFPOSTEN, RATG_PARAGRAPHEN, RATG_TARIFE, RATG_TAGSATZUNG, RATG_TP_DETAILS, RATG_FORMELN, RATG_RUNDUNG, RATG_TP5_BRIEFE, RATG_TP6_BRIEFE, RATG_TP7_KOMMISSIONEN, RATG_TP567_HINWEISE } from '../../lib/wiki-data';

export const RatgTab: React.FC = () => {
  const [showFullTarif, setShowFullTarif] = useState(false);
  const [showTagsatzung, setShowTagsatzung] = useState(false);
  const [showTpDetails, setShowTpDetails] = useState(false);
  const [showFormeln1, setShowFormeln1] = useState(false);
  const [showFormeln2, setShowFormeln2] = useState(false);
  const [showTp567, setShowTp567] = useState(false);

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

      {/* Rundungsregel */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-mono text-slate-500 mb-1">{RATG_RUNDUNG.paragraph}</div>
          <p className="text-sm text-slate-400">{RATG_RUNDUNG.text}</p>
        </div>
      </div>

      {/* Detaillierte TP Beschreibungen */}
      <div>
        <button
          onClick={() => setShowTpDetails(!showTpDetails)}
          className="flex items-center justify-between w-full mb-4"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tarifposten im Detail</p>
          {showTpDetails ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
        </button>
        {showTpDetails && (
          <div className="space-y-3">
            {Object.entries(RATG_TP_DETAILS).map(([tp, data]) => (
              <div key={tp} className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono font-bold text-blue-400">{tp}</span>
                  <span className="text-sm text-slate-400">{data.kurz}</span>
                </div>
                <ul className="space-y-1 text-xs text-slate-500">
                  {data.details.map((d, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tariftabelle Schriftsätze - Streitwerte bis € 36.340 */}
      <div>
        <button
          onClick={() => setShowFullTarif(!showFullTarif)}
          className="flex items-center justify-between w-full mb-4"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tariftabelle Schriftsätze (Anlage 1)</p>
          {showFullTarif ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
        </button>
        {showFullTarif && (
          <div className="rounded-2xl border border-white/10 overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-left p-3 font-bold text-white">Streitwert bis</th>
                  <th className="text-right p-3 font-bold text-slate-400">TP 1</th>
                  <th className="text-right p-3 font-bold text-slate-400">TP 2</th>
                  <th className="text-right p-3 font-bold text-blue-400">TP 3A</th>
                  <th className="text-right p-3 font-bold text-blue-400">TP 3B</th>
                  <th className="text-right p-3 font-bold text-blue-400">TP 3C</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {RATG_TARIFE.map((row, i) => (
                  <tr key={i} className="hover:bg-white/5">
                    <td className="p-3 font-mono text-slate-300">€ {row.bis.toLocaleString('de-AT')}</td>
                    <td className="p-3 text-right font-mono text-slate-500">€ {row.tp1.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono text-slate-400">€ {row.tp2.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono text-blue-400">€ {row.tp3a.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono text-blue-400">€ {row.tp3b.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono text-blue-400">€ {row.tp3c.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Berechnungsformeln: Streitwerte € 36.340 bis € 363.360 */}
      <div>
        <button
          onClick={() => setShowFormeln1(!showFormeln1)}
          className="flex items-center justify-between w-full mb-4"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Streitwerte € 36.340 – € 363.360</p>
          {showFormeln1 ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
        </button>
        {showFormeln1 && (
          <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-4">
            <p className="text-sm text-violet-200/70 mb-3">
              Basisbetrag bei € 36.340 + Zuschlag pro € 1.000 Mehrwert
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-violet-500/20">
                    <th className="text-left p-2 text-violet-400"></th>
                    <th className="text-right p-2 text-violet-400">TP 1</th>
                    <th className="text-right p-2 text-violet-400">TP 2</th>
                    <th className="text-right p-2 text-violet-400">TP 3A</th>
                    <th className="text-right p-2 text-violet-400">TP 3B</th>
                    <th className="text-right p-2 text-violet-400">TP 3C</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  <tr className="border-b border-violet-500/10">
                    <td className="p-2 text-slate-400">Basis € 36.340</td>
                    <td className="p-2 text-right text-slate-300">€ 92,20</td>
                    <td className="p-2 text-right text-slate-300">€ 413,00</td>
                    <td className="p-2 text-right text-slate-300">€ 814,40</td>
                    <td className="p-2 text-right text-slate-300">€ 1.016,20</td>
                    <td className="p-2 text-right text-slate-300">€ 1.219,60</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-slate-400">+ pro € 1.000</td>
                    <td className="p-2 text-right text-violet-400">× 0,10</td>
                    <td className="p-2 text-right text-violet-400">× 0,50</td>
                    <td className="p-2 text-right text-violet-400">× 1,00</td>
                    <td className="p-2 text-right text-violet-400">× 1,25</td>
                    <td className="p-2 text-right text-violet-400">× 1,50</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Berechnungsformeln: Streitwerte über € 363.360 */}
      <div>
        <button
          onClick={() => setShowFormeln2(!showFormeln2)}
          className="flex items-center justify-between w-full mb-4"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Streitwerte über € 363.360</p>
          {showFormeln2 ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
        </button>
        {showFormeln2 && (
          <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-4">
            <p className="text-sm text-indigo-200/70 mb-3">
              Reduzierte Multiplikatoren, gedeckelt durch Maximalbeträge
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-indigo-500/20">
                    <th className="text-left p-2 text-indigo-400"></th>
                    <th className="text-right p-2 text-indigo-400">TP 1</th>
                    <th className="text-right p-2 text-indigo-400">TP 2</th>
                    <th className="text-right p-2 text-indigo-400">TP 3A</th>
                    <th className="text-right p-2 text-indigo-400">TP 3B</th>
                    <th className="text-right p-2 text-indigo-400">TP 3C</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  <tr className="border-b border-indigo-500/10">
                    <td className="p-2 text-slate-400">Basis € 363.360</td>
                    <td className="p-2 text-right text-slate-300">€ 124,90</td>
                    <td className="p-2 text-right text-slate-300">€ 576,50</td>
                    <td className="p-2 text-right text-slate-300">€ 1.141,40</td>
                    <td className="p-2 text-right text-slate-300">€ 1.425,00</td>
                    <td className="p-2 text-right text-slate-300">€ 1.710,10</td>
                  </tr>
                  <tr className="border-b border-indigo-500/10">
                    <td className="p-2 text-slate-400">+ pro € 1.000</td>
                    <td className="p-2 text-right text-indigo-400">× 0,05</td>
                    <td className="p-2 text-right text-indigo-400">× 0,25</td>
                    <td className="p-2 text-right text-indigo-400">× 0,50</td>
                    <td className="p-2 text-right text-indigo-400">× 0,625</td>
                    <td className="p-2 text-right text-indigo-400">× 0,75</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-slate-400">Maximum</td>
                    <td className="p-2 text-right text-amber-400">€ 260,10</td>
                    <td className="p-2 text-right text-amber-400">€ 1.298,50</td>
                    <td className="p-2 text-right text-amber-400">€ 17.308,80</td>
                    <td className="p-2 text-right text-amber-400">€ 21.636,00</td>
                    <td className="p-2 text-right text-amber-400">€ 25.963,10</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="text-xs text-slate-500 mt-3">
              <p>• Die Tarifsätze sind auf volle 10 Cent zu runden (§ 1 Abs. 1 zweiter Satz)</p>
            </div>
          </div>
        )}
      </div>

      {/* Tariftabelle Tagsatzungen */}
      <div>
        <button
          onClick={() => setShowTagsatzung(!showTagsatzung)}
          className="flex items-center justify-between w-full mb-4"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tariftabelle Tagsatzungen (Anlage 2)</p>
          {showTagsatzung ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
        </button>
        {showTagsatzung && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 overflow-hidden overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="text-left p-3 font-bold text-white">Streitwert bis</th>
                    <th className="text-right p-3 font-bold text-slate-400">TP 2</th>
                    <th className="text-right p-3 font-bold text-violet-400">TP 3A</th>
                    <th className="text-right p-3 font-bold text-violet-400">TP 3B</th>
                    <th className="text-right p-3 font-bold text-violet-400">TP 3C</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {RATG_TAGSATZUNG.map((row, i) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="p-3 font-mono text-slate-300">€ {row.bis.toLocaleString('de-AT')}</td>
                      <td className="p-3 text-right font-mono text-slate-400">€ {row.tp2.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono text-violet-400">€ {row.tp3a.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono text-violet-400">€ {row.tp3b.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono text-violet-400">€ {row.tp3c.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-xs text-slate-500 px-2">
              <p>• Angaben pro Stunde Verhandlungsdauer</p>
              <p>• Ab der 2. Stunde nur halber Satz</p>
              <p>• Einheitssatz zusätzlich auf Gesamtsumme</p>
            </div>
          </div>
        )}
      </div>

      {/* TP 5, 6, 7 - Briefe und Kommissionen */}
      <div>
        <button
          onClick={() => setShowTp567(!showTp567)}
          className="flex items-center justify-between w-full mb-4"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">TP 5, 6, 7 – Briefe & Kommissionen</p>
          {showTp567 ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
        </button>
        {showTp567 && (
          <div className="space-y-6">
            {/* TP 5 und TP 6 Tabelle */}
            <div className="rounded-2xl border border-white/10 overflow-hidden overflow-x-auto">
              <div className="bg-white/5 p-3 border-b border-white/10">
                <span className="font-bold text-white">TP 5 & TP 6 – Briefe</span>
                <span className="text-xs text-slate-500 ml-2">(streitwertabhängig)</span>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="text-left p-3 font-bold text-white">Streitwert bis</th>
                    <th className="text-right p-3 font-bold text-emerald-400">TP 5 (kurz)</th>
                    <th className="text-right p-3 font-bold text-teal-400">TP 6 (andere)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {RATG_TP5_BRIEFE.slice(0, 12).map((row, i) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="p-3 font-mono text-slate-300">€ {row.bis.toLocaleString('de-AT')}</td>
                      <td className="p-3 text-right font-mono text-emerald-400">€ {row.tp5.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono text-teal-400">€ {RATG_TP6_BRIEFE[i]?.tp6.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-white/5">
                    <td colSpan={3} className="p-2 text-center text-xs text-slate-500">
                      ... weitere Stufen bis € 43.510
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* TP 7 Tabelle */}
            <div className="rounded-2xl border border-white/10 overflow-hidden overflow-x-auto">
              <div className="bg-white/5 p-3 border-b border-white/10">
                <span className="font-bold text-white">TP 7 – Kommissionen</span>
                <span className="text-xs text-slate-500 ml-2">(pro ½ Stunde)</span>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="text-left p-3 font-bold text-white">Streitwert bis</th>
                    <th className="text-right p-3 font-bold text-orange-400">RA-Gehilfe</th>
                    <th className="text-right p-3 font-bold text-red-400">RA / RAA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {RATG_TP7_KOMMISSIONEN.slice(0, 10).map((row, i) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="p-3 font-mono text-slate-300">€ {row.bis.toLocaleString('de-AT')}</td>
                      <td className="p-3 text-right font-mono text-orange-400">€ {row.gehilfe.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono text-red-400">€ {row.raRaa.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-white/5">
                    <td colSpan={3} className="p-2 text-center text-xs text-slate-500">
                      ... weitere Stufen bis € 21.760
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Hinweise */}
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 space-y-3">
              <h4 className="font-bold text-amber-300 text-sm">Hinweise zu TP 5, 6, 7</h4>
              <ul className="space-y-1.5 text-xs text-amber-200/80">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span>{RATG_TP567_HINWEISE.zuschlag}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span>{RATG_TP567_HINWEISE.keinES}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span>{RATG_TP567_HINWEISE.keinDoppelES}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span>{RATG_TP567_HINWEISE.briefeAusnahme}</span>
                </li>
              </ul>
              <div className="pt-2 border-t border-amber-500/20">
                <h5 className="font-bold text-amber-300 text-xs mb-2">TP 7 Details:</h5>
                <ul className="space-y-1 text-xs text-amber-200/70">
                  {RATG_TP567_HINWEISE.tp7Details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-500/60">–</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
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
