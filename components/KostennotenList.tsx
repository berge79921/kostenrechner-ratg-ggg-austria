import React, { useRef } from 'react';
import { Plus, Upload, Download, Edit2, Trash2, Scale, Gavel, Lock, Building2, FileText } from 'lucide-react';
import type { SavedKostennote } from '../types';
import { CaseMode } from '../types';
import { GlassCard } from './GlassCard';

interface Props {
  kostennoten: SavedKostennote[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  onImport: (file: File) => void;
  onExportAll: () => void;
}

const MODE_CONFIG = {
  [CaseMode.CIVIL]: { icon: Scale, color: 'blue', label: 'Zivil' },
  [CaseMode.CRIMINAL]: { icon: Gavel, color: 'red', label: 'Straf' },
  [CaseMode.DETENTION]: { icon: Lock, color: 'amber', label: 'Haft' },
  [CaseMode.VSTRAF]: { icon: Building2, color: 'orange', label: 'V-Straf' },
};

export const KostennotenList: React.FC<Props> = ({
  kostennoten,
  onEdit,
  onDelete,
  onNew,
  onImport,
  onExportAll,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  const formatDate = (isoDate: string) => {
    try {
      return new Date(isoDate).toLocaleDateString('de-AT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return isoDate;
    }
  };

  const getDisplayName = (k: SavedKostennote) => {
    if (k.metadata.geschaeftszahl) return k.metadata.geschaeftszahl;
    if (k.metadata.parteiName) return k.metadata.parteiName;
    return `Kostennote vom ${formatDate(k.createdAt)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header mit Aktionen */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Alle Kostennoten</h2>
          <p className="text-slate-400 text-sm mt-1">
            {kostennoten.length === 0
              ? 'Noch keine Kostennoten vorhanden'
              : `${kostennoten.length} Kostennote${kostennoten.length !== 1 ? 'n' : ''}`}
          </p>
        </div>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all border border-white/10 cursor-pointer">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">CSV importieren</span>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {kostennoten.length > 0 && (
            <button
              onClick={onExportAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white font-medium transition-all"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Alle exportieren</span>
            </button>
          )}
          <button
            onClick={onNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus className="h-4 w-4" />
            <span>Neue Kostennote</span>
          </button>
        </div>
      </div>

      {/* Liste */}
      {kostennoten.length === 0 ? (
        <GlassCard variant="dark" className="text-center py-16">
          <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-400 mb-2">Keine Kostennoten</h3>
          <p className="text-slate-500 mb-6">
            Erstellen Sie eine neue Kostennote oder importieren Sie eine CSV-Datei.
          </p>
          <div className="flex gap-3 justify-center">
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all border border-white/10 cursor-pointer">
              <Upload className="h-4 w-4" /> CSV importieren
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <button
              onClick={onNew}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all"
            >
              <Plus className="h-4 w-4" /> Neue Kostennote
            </button>
          </div>
        </GlassCard>
      ) : (
        <GlassCard variant="dark" className="!p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 px-4 py-3">
                  Datum
                </th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 px-4 py-3">
                  Geschäftsfall
                </th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 px-4 py-3 hidden md:table-cell">
                  Gericht
                </th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 px-4 py-3 hidden sm:table-cell">
                  Modus
                </th>
                <th className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500 px-4 py-3">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody>
              {kostennoten.map((k, idx) => {
                const mode = MODE_CONFIG[k.state.caseMode] || MODE_CONFIG[CaseMode.CIVIL];
                const Icon = mode.icon;
                return (
                  <tr
                    key={k.id}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                      idx % 2 === 0 ? 'bg-white/[0.02]' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-slate-400">
                        {formatDate(k.updatedAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onEdit(k.id)}
                        className="text-left hover:text-blue-400 transition-colors"
                      >
                        <span className="text-sm font-medium text-white block">
                          {getDisplayName(k)}
                        </span>
                        {k.metadata.parteiName && k.metadata.geschaeftszahl && (
                          <span className="text-xs text-slate-500">
                            {k.metadata.parteiName}
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-slate-400">
                        {k.metadata.gericht || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold bg-${mode.color}-500/10 text-${mode.color}-400 border border-${mode.color}-500/20`}
                      >
                        <Icon className="h-3 w-3" />
                        {mode.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => onEdit(k.id)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 transition-all"
                          title="Bearbeiten"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Kostennote "${getDisplayName(k)}" wirklich löschen?`)) {
                              onDelete(k.id);
                            }
                          }}
                          className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                          title="Löschen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </GlassCard>
      )}
    </div>
  );
};

export default KostennotenList;
