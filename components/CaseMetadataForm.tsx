import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Building2, User, Scale, Calendar, Trash2, Printer } from 'lucide-react';
import type { CaseMetadata, KanzleiData, ExekutionMetadata, TitelArt, ProcedureType } from '../types';
import { DEFAULT_EXEKUTION_METADATA } from '../types';

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
  printOptions,
  onPrintOptionsChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const isExekution = procedureType === 'Exekutionsverfahren';

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

  const inputClass = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50";
  const labelClass = "text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block";

  const exekution = metadata.exekution || DEFAULT_EXEKUTION_METADATA;

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
                {isExekution && onClearExekution && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onClearExekution();
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                    title="Alle Daten löschen"
                  >
                    <Trash2 className="h-3 w-3" />
                    Löschen
                  </button>
                )}
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
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Kanzlei</span>
                <span className="text-[10px] text-slate-500">(wird gespeichert)</span>
                {onPrintOptionsChange && (
                  <label className="flex items-center gap-1 ml-auto cursor-pointer" title="Im PDF drucken">
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
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default CaseMetadataForm;
