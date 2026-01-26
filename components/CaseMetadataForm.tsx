import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Building2 } from 'lucide-react';
import type { CaseMetadata, KanzleiData } from '../types';

interface Props {
  metadata: CaseMetadata;
  onChange: (metadata: CaseMetadata) => void;
  onKanzleiChange: (data: KanzleiData) => void;
}

export const CaseMetadataForm: React.FC<Props> = ({ metadata, onChange, onKanzleiChange }) => {
  const [isOpen, setIsOpen] = useState(false);

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

  const inputClass = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50";
  const labelClass = "text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block";

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
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2 p-4 bg-slate-800/30 border border-white/10 rounded-xl space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Linke Spalte: Fall + Partei */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Fall</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Geschäftszahl</label>
                  <input
                    type="text"
                    value={metadata.geschaeftszahl}
                    onChange={(e) => updateField('geschaeftszahl', e.target.value)}
                    placeholder="1 Cg 123/24k"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Gericht</label>
                  <input
                    type="text"
                    value={metadata.gericht}
                    onChange={(e) => updateField('gericht', e.target.value)}
                    placeholder="LG Wien"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Partei</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className={labelClass}>Name</label>
                    <input
                      type="text"
                      value={metadata.parteiName}
                      onChange={(e) => updateField('parteiName', e.target.value)}
                      placeholder="Max Mustermann GmbH"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Straße</label>
                    <input
                      type="text"
                      value={metadata.parteiStrasse}
                      onChange={(e) => updateField('parteiStrasse', e.target.value)}
                      placeholder="Musterstraße 1"
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={labelClass}>PLZ</label>
                      <input
                        type="text"
                        value={metadata.parteiPlz}
                        onChange={(e) => updateField('parteiPlz', e.target.value)}
                        placeholder="1010"
                        className={inputClass}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className={labelClass}>Ort</label>
                      <input
                        type="text"
                        value={metadata.parteiOrt}
                        onChange={(e) => updateField('parteiOrt', e.target.value)}
                        placeholder="Wien"
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
              </div>

              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Name</label>
                  <input
                    type="text"
                    value={metadata.kanzleiName}
                    onChange={(e) => updateField('kanzleiName', e.target.value)}
                    placeholder="RA Dr. Maria Beispiel"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Straße</label>
                  <input
                    type="text"
                    value={metadata.kanzleiStrasse}
                    onChange={(e) => updateField('kanzleiStrasse', e.target.value)}
                    placeholder="Kanzleigasse 5"
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
                      placeholder="1010"
                      className={inputClass}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Ort</label>
                    <input
                      type="text"
                      value={metadata.kanzleiOrt}
                      onChange={(e) => updateField('kanzleiOrt', e.target.value)}
                      placeholder="Wien"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseMetadataForm;
