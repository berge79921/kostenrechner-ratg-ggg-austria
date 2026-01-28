import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Building2, User, Scale, Calendar, Trash2, Printer, Gavel, Save, RotateCcw, Home, Plus, Landmark } from 'lucide-react';
import type { CaseMetadata, KanzleiData, ExekutionMetadata, TitelArt, ZivilprozessMetadata, KlageArt, VerfahrensStatus, ProcedureType, Drittschuldner, DrittschuldnerTyp } from '../types';
import { DEFAULT_EXEKUTION_METADATA, DEFAULT_ZIVILPROZESS_METADATA, BEKANNTE_DRITTSCHULDNER } from '../types';
import { loadHeimkanzlei, saveHeimkanzlei, hasHeimkanzlei } from '../lib/storage';

// Druckoptionen für PDF-Export
export interface PrintOptions {
  printTiteldaten: boolean;
  printExekutionsdaten: boolean;
  printKanzlei: boolean;
}

interface Props {
  metadata: CaseMetadata;
  onChange: (metadata: CaseMetadata) => void;
  onKanzleiChange: (data: KanzleiData) => void;
  procedureType?: ProcedureType;
  onClearExekution?: () => void;
  onClearZivilprozess?: () => void;
  onClearKanzlei?: () => void;
  onClearTiteldaten?: () => void;
  // Druckoptionen
  printOptions?: PrintOptions;
  onPrintOptionsChange?: (options: PrintOptions) => void;
}

export const CaseMetadataForm: React.FC<Props> = ({
  metadata,
  onChange,
  onKanzleiChange,
  procedureType,
  onClearExekution,
  onClearZivilprozess,
  onClearKanzlei,
  onClearTiteldaten,
  printOptions,
  onPrintOptionsChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [heimkanzleiSaved, setHeimkanzleiSaved] = useState(false);

  const isExekution = procedureType === 'Exekutionsverfahren';
  const isZivilprozess = procedureType === 'Zivilprozess' && !!metadata.zivilprozess;

  // Default print options (alle aktiv)
  const print = printOptions || { printTiteldaten: true, printExekutionsdaten: true, printKanzlei: true };

  const updatePrintOption = (key: keyof PrintOptions, value: boolean) => {
    if (onPrintOptionsChange) {
      onPrintOptionsChange({ ...print, [key]: value });
    }
  };


  const updateField = (field: keyof CaseMetadata, value: string) => {
    const updated = { ...metadata, [field]: value };
    onChange(updated);

    // Wenn Kanzleidaten geändert werden, separat speichern
    if (field.startsWith('kanzlei')) {
      onKanzleiChange({
        kanzleiName: updated.kanzleiName,
        kanzleiStrasse: updated.kanzleiStrasse,
        kanzleiPlz: updated.kanzleiPlz,
        kanzleiOrt: updated.kanzleiOrt,
      });
    }
  };

  const updateExekutionField = <K extends keyof ExekutionMetadata>(field: K, value: ExekutionMetadata[K]) => {
    const exekution = metadata.exekution || DEFAULT_EXEKUTION_METADATA;
    onChange({
      ...metadata,
      exekution: { ...exekution, [field]: value },
    });
  };

  const updateZivilprozessField = <K extends keyof ZivilprozessMetadata>(field: K, value: ZivilprozessMetadata[K]) => {
    const zivilprozess = metadata.zivilprozess || DEFAULT_ZIVILPROZESS_METADATA;
    onChange({
      ...metadata,
      zivilprozess: { ...zivilprozess, [field]: value },
    });
  };

  // Heimkanzlei speichern
  const handleSaveHeimkanzlei = () => {
    const kanzleiData: KanzleiData = {
      kanzleiName: metadata.kanzleiName,
      kanzleiStrasse: metadata.kanzleiStrasse,
      kanzleiPlz: metadata.kanzleiPlz,
      kanzleiOrt: metadata.kanzleiOrt,
    };
    saveHeimkanzlei(kanzleiData);
    setHeimkanzleiSaved(true);
    setTimeout(() => setHeimkanzleiSaved(false), 2000);
  };

  // Heimkanzlei laden
  const handleLoadHeimkanzlei = () => {
    const heimkanzlei = loadHeimkanzlei();
    if (heimkanzlei) {
      onChange({
        ...metadata,
        kanzleiName: heimkanzlei.kanzleiName,
        kanzleiStrasse: heimkanzlei.kanzleiStrasse,
        kanzleiPlz: heimkanzlei.kanzleiPlz,
        kanzleiOrt: heimkanzlei.kanzleiOrt,
      });
      onKanzleiChange(heimkanzlei);
    }
  };

  // Prüfen ob Kanzleidaten vorhanden
  const hasKanzleiData = metadata.kanzleiName || metadata.kanzleiStrasse || metadata.kanzleiPlz || metadata.kanzleiOrt;

  const inputClass = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50";
  const labelClass = "text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block";

  const exekution = metadata.exekution || DEFAULT_EXEKUTION_METADATA;
  const zivilprozess = metadata.zivilprozess || DEFAULT_ZIVILPROZESS_METADATA;

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl hover:bg-slate-800/70 transition-colors"
      >
        <div className="flex items-center gap-3">
          <FileText className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-300">Falldaten</span>
          {metadata.geschaeftszahl && (
            <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
              {metadata.geschaeftszahl}
            </span>
          )}
          {isExekution && exekution.verpflichteterName && (
            <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
              vs. {exekution.verpflichteterName}
            </span>
          )}
          {isZivilprozess && (zivilprozess.klaegerName || zivilprozess.beklagterName) && (
            <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
              vs. {zivilprozess.vertretenePartei === 'klaeger' ? zivilprozess.beklagterName : zivilprozess.klaegerName}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <form className="mt-2 p-4 bg-slate-800/30 border border-white/10 rounded-xl space-y-4" autoComplete="off" onSubmit={(e) => e.preventDefault()}>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Linke Spalte: Titeldaten + Partei */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    {isExekution ? 'Titeldaten' : 'Fall'}
                  </span>
                  {onPrintOptionsChange && (
                    <label className="flex items-center gap-1 ml-2 cursor-pointer" title="Im PDF drucken">
                      <input
                        type="checkbox"
                        checked={print.printTiteldaten}
                        onChange={(e) => updatePrintOption('printTiteldaten', e.target.checked)}
                        className="w-3 h-3 rounded border-slate-500 text-blue-500 focus:ring-blue-500/50"
                      />
                      <Printer className="h-3 w-3 text-slate-500" />
                    </label>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {onClearTiteldaten && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClearTiteldaten();
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-slate-300 hover:bg-slate-500/10 rounded transition-colors"
                      title="Falldaten leeren"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Leeren
                    </button>
                  )}
                  {isExekution && onClearExekution && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClearExekution();
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                      title="Exekutionsdaten leeren"
                    >
                      <Trash2 className="h-3 w-3" />
                      Exekution
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Geschäftszahl</label>
                  <input
                    type="text"
                    value={metadata.geschaeftszahl}
                    onChange={(e) => updateField('geschaeftszahl', e.target.value)}
                    placeholder="z.B. 1 C 1/26a"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Gericht</label>
                  <input
                    type="text"
                    value={metadata.gericht}
                    onChange={(e) => updateField('gericht', e.target.value)}
                    placeholder="z.B. BG Innere Stadt"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {isExekution ? 'Betreibende Partei' : 'Partei'}
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className={labelClass}>Name</label>
                    <input
                      type="text"
                      value={metadata.parteiName}
                      onChange={(e) => updateField('parteiName', e.target.value)}
                      placeholder="z.B. Firma ABC GmbH"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Straße</label>
                    <input
                      type="text"
                      value={metadata.parteiStrasse}
                      onChange={(e) => updateField('parteiStrasse', e.target.value)}
                      placeholder="z.B. Beispielgasse 1"
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className={labelClass}>PLZ</label>
                      <input
                        type="text"
                        value={metadata.parteiPlz}
                        onChange={(e) => updateField('parteiPlz', e.target.value)}
                        placeholder="z.B. 1010"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Ort</label>
                      <input
                        type="text"
                        value={metadata.parteiOrt}
                        onChange={(e) => updateField('parteiOrt', e.target.value)}
                        placeholder="z.B. Wien"
                        className={inputClass}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className={labelClass}>Land</label>
                      <input
                        type="text"
                        value={metadata.parteiLand}
                        onChange={(e) => updateField('parteiLand', e.target.value)}
                        placeholder="z.B. Österreich"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rechte Spalte: Kanzlei */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Kanzlei</span>
                  <span className="text-[10px] text-slate-500">(wird gespeichert)</span>
                  {onPrintOptionsChange && (
                    <label className="flex items-center gap-1 cursor-pointer" title="Im PDF drucken">
                      <input
                        type="checkbox"
                        checked={print.printKanzlei}
                        onChange={(e) => updatePrintOption('printKanzlei', e.target.checked)}
                        className="w-3 h-3 rounded border-slate-500 text-emerald-500 focus:ring-emerald-500/50"
                      />
                      <Printer className="h-3 w-3 text-slate-500" />
                    </label>
                  )}
                </div>
                {/* Kanzlei-Aktionen */}
                <div className="flex items-center gap-1">
                  {hasHeimkanzlei() && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLoadHeimkanzlei();
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded transition-colors"
                      title="Heimkanzlei laden"
                    >
                      <Home className="h-3 w-3" />
                    </button>
                  )}
                  {hasKanzleiData && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSaveHeimkanzlei();
                        }}
                        className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                          heimkanzleiSaved
                            ? 'text-green-400 bg-green-500/10'
                            : 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10'
                        }`}
                        title="Als Heimkanzlei speichern"
                      >
                        <Save className="h-3 w-3" />
                        {heimkanzleiSaved ? '✓' : ''}
                      </button>
                      {onClearKanzlei && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onClearKanzlei();
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-slate-300 hover:bg-slate-500/10 rounded transition-colors"
                          title="Kanzleidaten leeren"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Name</label>
                  <input
                    type="text"
                    value={metadata.kanzleiName}
                    onChange={(e) => updateField('kanzleiName', e.target.value)}
                    placeholder="z.B. RA Dr. Muster"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Straße</label>
                  <input
                    type="text"
                    value={metadata.kanzleiStrasse}
                    onChange={(e) => updateField('kanzleiStrasse', e.target.value)}
                    placeholder="z.B. Kanzleistraße 1"
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>PLZ</label>
                    <input
                      type="text"
                      value={metadata.kanzleiPlz}
                      onChange={(e) => updateField('kanzleiPlz', e.target.value)}
                      placeholder="z.B. 1010"
                      className={inputClass}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Ort</label>
                    <input
                      type="text"
                      value={metadata.kanzleiOrt}
                      onChange={(e) => updateField('kanzleiOrt', e.target.value)}
                      placeholder="z.B. Wien"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Exekutions-spezifische Felder */}
          {isExekution && (
            <div className="mt-6 pt-4 border-t border-amber-500/20 space-y-4">
              {/* Exekutionsdaten Header mit Druck-Checkbox */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Exekutionsdaten</span>
                {onPrintOptionsChange && (
                  <label className="flex items-center gap-1 cursor-pointer" title="Im PDF drucken">
                    <input
                      type="checkbox"
                      checked={print.printExekutionsdaten}
                      onChange={(e) => updatePrintOption('printExekutionsdaten', e.target.checked)}
                      className="w-3 h-3 rounded border-slate-500 text-amber-500 focus:ring-amber-500/50"
                    />
                    <Printer className="h-3 w-3 text-slate-500" />
                    <span className="text-[10px] text-slate-500">drucken</span>
                  </label>
                )}
              </div>

              {/* Exekutionstitel */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Scale className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Exekutionstitel</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className={labelClass}>Art</label>
                    <select
                      value={exekution.titelArt}
                      onChange={(e) => updateExekutionField('titelArt', e.target.value as TitelArt)}
                      className={inputClass}
                    >
                      <option value="Zahlungsbefehl">Zahlungsbefehl</option>
                      <option value="Urteil">Urteil</option>
                      <option value="Vergleich">Vergleich</option>
                      <option value="Beschluss">Beschluss</option>
                      <option value="Sonstig">Sonstig</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Titelgericht</label>
                    <input
                      type="text"
                      value={exekution.titelGericht}
                      onChange={(e) => updateExekutionField('titelGericht', e.target.value)}
                      placeholder="z.B. BG Innere Stadt"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Titel-GZ</label>
                    <input
                      type="text"
                      value={exekution.titelGZ}
                      onChange={(e) => updateExekutionField('titelGZ', e.target.value)}
                      placeholder="z.B. 1 C 1/25a"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Titel-Datum</label>
                    <input
                      type="text"
                      value={exekution.titelDatum}
                      onChange={(e) => updateExekutionField('titelDatum', e.target.value)}
                      placeholder="z.B. 01.01.2026"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className={labelClass}>Vollstreckbar seit</label>
                  <input
                    type="text"
                    value={exekution.vollstreckbarkeitDatum}
                    onChange={(e) => updateExekutionField('vollstreckbarkeitDatum', e.target.value)}
                    placeholder="z.B. 15.01.2026"
                    className={`${inputClass} max-w-[200px]`}
                  />
                </div>
              </div>

              {/* Verpflichtete Partei */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-red-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-red-400">Verpflichtete Partei</span>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Name</label>
                    <input
                      type="text"
                      value={exekution.verpflichteterName}
                      onChange={(e) => updateExekutionField('verpflichteterName', e.target.value)}
                      placeholder="z.B. Johann Muster"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Geburtsdatum</label>
                    <input
                      type="text"
                      value={exekution.verpflichteterGeburtsdatum}
                      onChange={(e) => updateExekutionField('verpflichteterGeburtsdatum', e.target.value)}
                      placeholder="z.B. 01.01.1980"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Straße</label>
                    <input
                      type="text"
                      value={exekution.verpflichteterStrasse}
                      onChange={(e) => updateExekutionField('verpflichteterStrasse', e.target.value)}
                      placeholder="z.B. Musterweg 5/3"
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className={labelClass}>PLZ</label>
                      <input
                        type="text"
                        value={exekution.verpflichteterPlz}
                        onChange={(e) => updateExekutionField('verpflichteterPlz', e.target.value)}
                        placeholder="z.B. 1010"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Ort</label>
                      <input
                        type="text"
                        value={exekution.verpflichteterOrt}
                        onChange={(e) => updateExekutionField('verpflichteterOrt', e.target.value)}
                        placeholder="z.B. Wien"
                        className={inputClass}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className={labelClass}>Land</label>
                      <input
                        type="text"
                        value={exekution.verpflichteterLand}
                        onChange={(e) => updateExekutionField('verpflichteterLand', e.target.value)}
                        placeholder="z.B. Österreich"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Forderung */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-green-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-green-400">Forderung aus Titel</span>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  <div>
                    <label className={labelClass}>Kapital (€)</label>
                    <input
                      type="number"
                      value={exekution.kapitalforderung || ''}
                      onChange={(e) => updateExekutionField('kapitalforderung', parseFloat(e.target.value) || 0)}
                      placeholder="z.B. 5000"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Zinsen %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={exekution.zinsenProzent || ''}
                      onChange={(e) => updateExekutionField('zinsenProzent', parseFloat(e.target.value) || 0)}
                      placeholder="z.B. 4"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Zinsen seit</label>
                    <input
                      type="text"
                      value={exekution.zinsenAb}
                      onChange={(e) => updateExekutionField('zinsenAb', e.target.value)}
                      placeholder="z.B. 01.01.2025"
                      className={inputClass}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Kosten (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={exekution.kostenAusTitel || ''}
                      onChange={(e) => updateExekutionField('kostenAusTitel', parseFloat(e.target.value) || 0)}
                      placeholder="z.B. 500.00"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Drittschuldner (§ 294 EO) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Drittschuldner (§ 294 EO)</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const newDs: Drittschuldner = {
                        id: crypto.randomUUID(),
                        typ: 'Bank',
                        name: '',
                        strasse: '',
                        plz: '',
                        ort: '',
                      };
                      updateExekutionField('drittschuldner', [...(exekution.drittschuldner || []), newDs]);
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded transition-colors"
                    title="Drittschuldner hinzufügen"
                  >
                    <Plus className="h-3 w-3" />
                    Hinzufügen
                  </button>
                </div>

                {/* Schnellauswahl bekannter Drittschuldner */}
                <div className="mb-3">
                  <label className={labelClass}>Schnellauswahl</label>
                  <select
                    value=""
                    onChange={(e) => {
                      const selected = BEKANNTE_DRITTSCHULDNER.find(d => d.id === e.target.value);
                      if (selected) {
                        const newDs: Drittschuldner = {
                          id: crypto.randomUUID(),
                          typ: selected.typ,
                          name: selected.name,
                          strasse: selected.strasse,
                          plz: selected.plz,
                          ort: selected.ort,
                          iban: selected.iban,
                          bic: selected.bic,
                          rechtsgrund: selected.typ === 'PVA' ? 'Pension' : 'Kontoguthaben',
                        };
                        updateExekutionField('drittschuldner', [...(exekution.drittschuldner || []), newDs]);
                      }
                    }}
                    className={inputClass}
                  >
                    <option value="">-- Bekannte Drittschuldner --</option>
                    <optgroup label="Pensionsversicherung">
                      {BEKANNTE_DRITTSCHULDNER.filter(d => d.typ === 'PVA').map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Banken">
                      {BEKANNTE_DRITTSCHULDNER.filter(d => d.typ === 'Bank').map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Liste der Drittschuldner */}
                {(exekution.drittschuldner || []).map((ds, index) => (
                  <div key={ds.id} className="mb-3 p-3 bg-slate-800/40 border border-cyan-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-cyan-300">Drittschuldner {index + 1}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const updated = (exekution.drittschuldner || []).filter(d => d.id !== ds.id);
                          updateExekutionField('drittschuldner', updated);
                        }}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Entfernen"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className={labelClass}>Typ</label>
                        <select
                          value={ds.typ}
                          onChange={(e) => {
                            const updated = (exekution.drittschuldner || []).map(d =>
                              d.id === ds.id ? { ...d, typ: e.target.value as DrittschuldnerTyp } : d
                            );
                            updateExekutionField('drittschuldner', updated);
                          }}
                          className={inputClass}
                        >
                          <option value="Bank">Bank</option>
                          <option value="PVA">PVA</option>
                          <option value="Arbeitgeber">Arbeitgeber</option>
                          <option value="Sonstig">Sonstig</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className={labelClass}>Name</label>
                        <input
                          type="text"
                          value={ds.name}
                          onChange={(e) => {
                            const updated = (exekution.drittschuldner || []).map(d =>
                              d.id === ds.id ? { ...d, name: e.target.value } : d
                            );
                            updateExekutionField('drittschuldner', updated);
                          }}
                          placeholder="Name des Drittschuldners"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Rechtsgrund</label>
                        <input
                          type="text"
                          value={ds.rechtsgrund || ''}
                          onChange={(e) => {
                            const updated = (exekution.drittschuldner || []).map(d =>
                              d.id === ds.id ? { ...d, rechtsgrund: e.target.value } : d
                            );
                            updateExekutionField('drittschuldner', updated);
                          }}
                          placeholder="z.B. Gehalt, Pension"
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      <div className="col-span-2">
                        <label className={labelClass}>Straße</label>
                        <input
                          type="text"
                          value={ds.strasse}
                          onChange={(e) => {
                            const updated = (exekution.drittschuldner || []).map(d =>
                              d.id === ds.id ? { ...d, strasse: e.target.value } : d
                            );
                            updateExekutionField('drittschuldner', updated);
                          }}
                          placeholder="Straße"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>PLZ</label>
                        <input
                          type="text"
                          value={ds.plz}
                          onChange={(e) => {
                            const updated = (exekution.drittschuldner || []).map(d =>
                              d.id === ds.id ? { ...d, plz: e.target.value } : d
                            );
                            updateExekutionField('drittschuldner', updated);
                          }}
                          placeholder="PLZ"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Ort</label>
                        <input
                          type="text"
                          value={ds.ort}
                          onChange={(e) => {
                            const updated = (exekution.drittschuldner || []).map(d =>
                              d.id === ds.id ? { ...d, ort: e.target.value } : d
                            );
                            updateExekutionField('drittschuldner', updated);
                          }}
                          placeholder="Ort"
                          className={inputClass}
                        />
                      </div>
                    </div>
                    {ds.typ === 'Bank' && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <label className={labelClass}>IBAN</label>
                          <input
                            type="text"
                            value={ds.iban || ''}
                            onChange={(e) => {
                              const updated = (exekution.drittschuldner || []).map(d =>
                                d.id === ds.id ? { ...d, iban: e.target.value } : d
                              );
                              updateExekutionField('drittschuldner', updated);
                            }}
                            placeholder="z.B. AT66 3225 0000 0070 6036"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>BIC</label>
                          <input
                            type="text"
                            value={ds.bic || ''}
                            onChange={(e) => {
                              const updated = (exekution.drittschuldner || []).map(d =>
                                d.id === ds.id ? { ...d, bic: e.target.value } : d
                              );
                              updateExekutionField('drittschuldner', updated);
                            }}
                            placeholder="z.B. RLNWATWWGTD"
                            className={inputClass}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Hinweis wenn keine Drittschuldner */}
                {(!exekution.drittschuldner || exekution.drittschuldner.length === 0) && (
                  <div className="text-xs text-slate-500 italic">
                    Noch keine Drittschuldner angelegt. Wählen Sie aus der Schnellauswahl oder fügen Sie manuell hinzu.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Zivilprozess-spezifische Felder */}
          {isZivilprozess && (
            <div className="mt-6 pt-4 border-t border-blue-500/20 space-y-4">
              {/* Header mit Löschen-Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gavel className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Klage-/Verfahrensdaten</span>
                </div>
                {onClearZivilprozess && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onClearZivilprozess();
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-slate-300 hover:bg-slate-500/10 rounded transition-colors"
                    title="Zivilprozessdaten leeren"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Leeren
                  </button>
                )}
              </div>

              {/* GEGNER: Dynamisch basierend auf vertretenePartei */}
              {/* Wenn wir Kläger vertreten → Beklagte ist Gegner */}
              {/* Wenn wir Beklagte vertreten → Kläger ist Gegner */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-red-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                    {zivilprozess.vertretenePartei === 'klaeger' ? 'Beklagte (Gegner)' : 'Kläger (Gegner)'}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {zivilprozess.vertretenePartei === 'klaeger' ? (
                    // Wir vertreten Kläger → Zeige Beklagten-Daten als Gegner
                    <>
                      <div>
                        <label className={labelClass}>Name</label>
                        <input
                          type="text"
                          value={zivilprozess.beklagterName}
                          onChange={(e) => updateZivilprozessField('beklagterName', e.target.value)}
                          placeholder="z.B. Hildegard Pfeffer"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Geburtsdatum</label>
                        <input
                          type="text"
                          value={zivilprozess.beklagterGeburtsdatum}
                          onChange={(e) => updateZivilprozessField('beklagterGeburtsdatum', e.target.value)}
                          placeholder="z.B. 01.01.1970"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Straße</label>
                        <input
                          type="text"
                          value={zivilprozess.beklagterStrasse}
                          onChange={(e) => updateZivilprozessField('beklagterStrasse', e.target.value)}
                          placeholder="z.B. Musterstraße 1"
                          className={inputClass}
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className={labelClass}>PLZ</label>
                          <input
                            type="text"
                            value={zivilprozess.beklagterPlz}
                            onChange={(e) => updateZivilprozessField('beklagterPlz', e.target.value)}
                            placeholder="PLZ"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Ort</label>
                          <input
                            type="text"
                            value={zivilprozess.beklagterOrt}
                            onChange={(e) => updateZivilprozessField('beklagterOrt', e.target.value)}
                            placeholder="Ort"
                            className={inputClass}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className={labelClass}>Land</label>
                          <input
                            type="text"
                            value={zivilprozess.beklagterLand}
                            onChange={(e) => updateZivilprozessField('beklagterLand', e.target.value)}
                            placeholder="z.B. Österreich"
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    // Wir vertreten Beklagte → Zeige Kläger-Daten als Gegner
                    <>
                      <div>
                        <label className={labelClass}>Name</label>
                        <input
                          type="text"
                          value={zivilprozess.klaegerName}
                          onChange={(e) => updateZivilprozessField('klaegerName', e.target.value)}
                          placeholder="z.B. Peter Kolar"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Geburtsdatum</label>
                        <input
                          type="text"
                          value={zivilprozess.klaegerGeburtsdatum}
                          onChange={(e) => updateZivilprozessField('klaegerGeburtsdatum', e.target.value)}
                          placeholder="z.B. 12.01.1966"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Straße</label>
                        <input
                          type="text"
                          value={zivilprozess.klaegerStrasse}
                          onChange={(e) => updateZivilprozessField('klaegerStrasse', e.target.value)}
                          placeholder="z.B. Via Delle Stadio 12"
                          className={inputClass}
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className={labelClass}>PLZ</label>
                          <input
                            type="text"
                            value={zivilprozess.klaegerPlz}
                            onChange={(e) => updateZivilprozessField('klaegerPlz', e.target.value)}
                            placeholder="PLZ"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Ort</label>
                          <input
                            type="text"
                            value={zivilprozess.klaegerOrt}
                            onChange={(e) => updateZivilprozessField('klaegerOrt', e.target.value)}
                            placeholder="Ort"
                            className={inputClass}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className={labelClass}>Land</label>
                          <input
                            type="text"
                            value={zivilprozess.klaegerLand}
                            onChange={(e) => updateZivilprozessField('klaegerLand', e.target.value)}
                            placeholder="z.B. Italien"
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* GEGNERVERTRETER: Dynamisch basierend auf vertretenePartei */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-orange-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                    {zivilprozess.vertretenePartei === 'klaeger' ? 'Beklagtenvertreter' : 'Klagevertreter'}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {zivilprozess.vertretenePartei === 'klaeger' ? (
                    // Wir vertreten Kläger → Zeige Beklagtenvertreter
                    <>
                      <div>
                        <label className={labelClass}>Name</label>
                        <input
                          type="text"
                          value={zivilprozess.beklagtenvertreterName}
                          onChange={(e) => updateZivilprozessField('beklagtenvertreterName', e.target.value)}
                          placeholder="z.B. RA Dr. Muster"
                          className={inputClass}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className={labelClass}>R-Code</label>
                          <input
                            type="text"
                            value={zivilprozess.beklagtenvertreterCode}
                            onChange={(e) => updateZivilprozessField('beklagtenvertreterCode', e.target.value)}
                            placeholder="z.B. R123456"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Zeichen</label>
                          <input
                            type="text"
                            value={zivilprozess.beklagtenvertreterZeichen}
                            onChange={(e) => updateZivilprozessField('beklagtenvertreterZeichen', e.target.value)}
                            placeholder="z.B. Pfe/25"
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Straße</label>
                        <input
                          type="text"
                          value={zivilprozess.beklagtenvertreterStrasse}
                          onChange={(e) => updateZivilprozessField('beklagtenvertreterStrasse', e.target.value)}
                          placeholder="Kanzleistraße"
                          className={inputClass}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className={labelClass}>PLZ</label>
                          <input
                            type="text"
                            value={zivilprozess.beklagtenvertreterPlz}
                            onChange={(e) => updateZivilprozessField('beklagtenvertreterPlz', e.target.value)}
                            placeholder="PLZ"
                            className={inputClass}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className={labelClass}>Ort</label>
                          <input
                            type="text"
                            value={zivilprozess.beklagtenvertreterOrt}
                            onChange={(e) => updateZivilprozessField('beklagtenvertreterOrt', e.target.value)}
                            placeholder="Ort"
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    // Wir vertreten Beklagte → Zeige Klagevertreter
                    <>
                      <div>
                        <label className={labelClass}>Name</label>
                        <input
                          type="text"
                          value={zivilprozess.klagevertreterName}
                          onChange={(e) => updateZivilprozessField('klagevertreterName', e.target.value)}
                          placeholder="z.B. RA Dr. Muster"
                          className={inputClass}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className={labelClass}>R-Code</label>
                          <input
                            type="text"
                            value={zivilprozess.klagevertreterCode}
                            onChange={(e) => updateZivilprozessField('klagevertreterCode', e.target.value)}
                            placeholder="z.B. R210380"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Zeichen</label>
                          <input
                            type="text"
                            value={zivilprozess.klagevertreterZeichen}
                            onChange={(e) => updateZivilprozessField('klagevertreterZeichen', e.target.value)}
                            placeholder="z.B. KoP/25"
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Straße</label>
                        <input
                          type="text"
                          value={zivilprozess.klagevertreterStrasse}
                          onChange={(e) => updateZivilprozessField('klagevertreterStrasse', e.target.value)}
                          placeholder="Kanzleistraße"
                          className={inputClass}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className={labelClass}>PLZ</label>
                          <input
                            type="text"
                            value={zivilprozess.klagevertreterPlz}
                            onChange={(e) => updateZivilprozessField('klagevertreterPlz', e.target.value)}
                            placeholder="PLZ"
                            className={inputClass}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className={labelClass}>Ort</label>
                          <input
                            type="text"
                            value={zivilprozess.klagevertreterOrt}
                            onChange={(e) => updateZivilprozessField('klagevertreterOrt', e.target.value)}
                            placeholder="Ort"
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Verfahren */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Scale className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Verfahren</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className={labelClass}>Art</label>
                    <select
                      value={zivilprozess.klageArt}
                      onChange={(e) => updateZivilprozessField('klageArt', e.target.value as KlageArt)}
                      className={inputClass}
                    >
                      <option value="Mahnklage">Mahnklage</option>
                      <option value="Klage">Klage</option>
                      <option value="Zahlungsbefehl">Zahlungsbefehl</option>
                      <option value="Sonstig">Sonstig</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Gericht</label>
                    <input
                      type="text"
                      value={zivilprozess.klageGericht}
                      onChange={(e) => updateZivilprozessField('klageGericht', e.target.value)}
                      placeholder="z.B. LGZ Wien"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>GZ</label>
                    <input
                      type="text"
                      value={zivilprozess.klageGZ}
                      onChange={(e) => updateZivilprozessField('klageGZ', e.target.value)}
                      placeholder="z.B. 3 Cg 165/25 v"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Fallcode</label>
                    <input
                      type="text"
                      value={zivilprozess.fallcode}
                      onChange={(e) => updateZivilprozessField('fallcode', e.target.value)}
                      placeholder="z.B. 12A"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className={labelClass}>Einbringungsdatum</label>
                    <input
                      type="text"
                      value={zivilprozess.einbringungsDatum}
                      onChange={(e) => updateZivilprozessField('einbringungsDatum', e.target.value)}
                      placeholder="z.B. 04.12.2025"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Status</label>
                    <select
                      value={zivilprozess.verfahrensStatus}
                      onChange={(e) => updateZivilprozessField('verfahrensStatus', e.target.value as VerfahrensStatus)}
                      className={inputClass}
                    >
                      <option value="offen">Offen</option>
                      <option value="ZB_erlassen">ZB erlassen</option>
                      <option value="zugestellt">Zugestellt</option>
                      <option value="Einspruch">Einspruch</option>
                      <option value="streitig">Streitig</option>
                      <option value="abgeschlossen">Abgeschlossen</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Zustellungsdatum</label>
                    <input
                      type="text"
                      value={zivilprozess.zustellungsDatum || ''}
                      onChange={(e) => updateZivilprozessField('zustellungsDatum', e.target.value)}
                      placeholder="z.B. 12.12.2025"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className={labelClass}>Klagegegenstand</label>
                  <input
                    type="text"
                    value={zivilprozess.klagegegenstand}
                    onChange={(e) => updateZivilprozessField('klagegegenstand', e.target.value)}
                    placeholder="z.B. Restzahlung aus Anerkenntnis"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Forderung */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-green-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-green-400">Forderung (= BMGL)</span>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  <div>
                    <label className={labelClass}>Kapital (€)</label>
                    <input
                      type="number"
                      value={zivilprozess.kapitalforderung || ''}
                      onChange={(e) => updateZivilprozessField('kapitalforderung', parseFloat(e.target.value) || 0)}
                      placeholder="z.B. 25000"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Nebenforderung</label>
                    <input
                      type="number"
                      value={zivilprozess.nebenforderung || ''}
                      onChange={(e) => updateZivilprozessField('nebenforderung', parseFloat(e.target.value) || 0)}
                      placeholder="z.B. 0"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Zinsen %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={zivilprozess.zinsenProzent || ''}
                      onChange={(e) => updateZivilprozessField('zinsenProzent', parseFloat(e.target.value) || 0)}
                      placeholder="z.B. 4"
                      className={inputClass}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Zinsen seit</label>
                    <input
                      type="text"
                      value={zivilprozess.zinsenAb}
                      onChange={(e) => updateZivilprozessField('zinsenAb', e.target.value)}
                      placeholder="z.B. 01.04.2025"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default CaseMetadataForm;
