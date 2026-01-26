import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { extractExekutionDataFromPDF, fileToBase64, type ExtractedExekutionData } from '../lib/documentExtractor';

interface Props {
  onDataExtracted: (data: ExtractedExekutionData) => void;
  apiKey: string;
}

type Status = 'idle' | 'uploading' | 'extracting' | 'success' | 'error';

export function ExekutionUpload({ onDataExtracted, apiKey }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedExekutionData | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  // Checkboxen für Übernahme - alle standardmäßig aktiv
  const [includeTiteldaten, setIncludeTiteldaten] = useState(true);
  const [includeExekution, setIncludeExekution] = useState(true);
  const [includeKanzlei, setIncludeKanzlei] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (f.type !== 'application/pdf') {
      setError('Nur PDF-Dateien werden unterstützt');
      return;
    }
    setFile(f);
    setError(null);
    setExtractedData(null);
    setStatus('idle');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleExtract = async () => {
    if (!file || !apiKey) return;

    setStatus('extracting');
    setError(null);

    try {
      const base64 = await fileToBase64(file);
      const data = await extractExekutionDataFromPDF(base64, apiKey);
      setExtractedData(data);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraktion fehlgeschlagen');
      setStatus('error');
    }
  };

  const handleApply = () => {
    if (extractedData) {
      // Daten je nach Checkbox-Status übernehmen
      const dataToApply: ExtractedExekutionData = {
        // Titeldaten (Betreibende Partei, GZ, Gericht)
        betreibenderName: includeTiteldaten ? extractedData.betreibenderName : '',
        betreibenderStrasse: includeTiteldaten ? extractedData.betreibenderStrasse : '',
        betreibenderPlz: includeTiteldaten ? extractedData.betreibenderPlz : '',
        betreibenderOrt: includeTiteldaten ? extractedData.betreibenderOrt : '',
        betreibenderLand: includeTiteldaten ? extractedData.betreibenderLand : '',
        // Exekutionsdaten (Verpflichtete Partei, Titel, Forderung)
        verpflichteterName: includeExekution ? extractedData.verpflichteterName : '',
        verpflichteterStrasse: includeExekution ? extractedData.verpflichteterStrasse : '',
        verpflichteterPlz: includeExekution ? extractedData.verpflichteterPlz : '',
        verpflichteterOrt: includeExekution ? extractedData.verpflichteterOrt : '',
        verpflichteterLand: includeExekution ? extractedData.verpflichteterLand : '',
        verpflichteterGeburtsdatum: includeExekution ? extractedData.verpflichteterGeburtsdatum : '',
        titelArt: includeExekution ? extractedData.titelArt : '',
        titelGericht: includeExekution ? extractedData.titelGericht : '',
        titelGZ: includeExekution ? extractedData.titelGZ : '',
        titelDatum: includeExekution ? extractedData.titelDatum : '',
        vollstreckbarkeitDatum: includeExekution ? extractedData.vollstreckbarkeitDatum : '',
        kapitalforderung: includeExekution ? extractedData.kapitalforderung : 0,
        zinsenProzent: includeExekution ? extractedData.zinsenProzent : 0,
        zinsenAb: includeExekution ? extractedData.zinsenAb : '',
        kosten: includeExekution ? extractedData.kosten : 0,
        // Kanzleidaten
        kanzleiName: includeKanzlei ? extractedData.kanzleiName : undefined,
        kanzleiStrasse: includeKanzlei ? extractedData.kanzleiStrasse : undefined,
        kanzleiPlz: includeKanzlei ? extractedData.kanzleiPlz : undefined,
        kanzleiOrt: includeKanzlei ? extractedData.kanzleiOrt : undefined,
      };
      onDataExtracted(dataToApply);
      // Reset
      setFile(null);
      setExtractedData(null);
      setStatus('idle');
    }
  };

  const handleClear = () => {
    setFile(null);
    setExtractedData(null);
    setStatus('idle');
    setError(null);
  };

  const formatCurrency = (n: number) => n.toLocaleString('de-AT', { minimumFractionDigits: 2 }) + ' €';

  return (
    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-xl rounded-2xl border border-amber-500/20 p-4 mb-4">
      <h3 className="text-sm font-bold text-amber-700 mb-3 flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Exekutionstitel hochladen
      </h3>

      {/* Drop Zone */}
      {!file && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragOver
              ? 'border-amber-500 bg-amber-500/10'
              : 'border-slate-300 hover:border-amber-400 hover:bg-amber-500/5'
          }`}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
          <p className="text-sm text-slate-600">
            Vollstreckbaren Zahlungsbefehl, Urteil oder Vergleich hier ablegen
          </p>
          <p className="text-xs text-slate-400 mt-1">oder klicken zum Auswählen</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
          />
        </div>
      )}

      {/* Selected File */}
      {file && (
        <div className="bg-white/50 rounded-lg p-3 flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">
              {file.name}
            </span>
            <span className="text-xs text-slate-400">
              ({(file.size / 1024).toFixed(0)} KB)
            </span>
          </div>
          <button onClick={handleClear} className="p-1 hover:bg-slate-200 rounded">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Extract Button */}
      {file && !extractedData && status !== 'extracting' && (
        <button
          onClick={handleExtract}
          disabled={!apiKey}
          className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Daten extrahieren
        </button>
      )}

      {/* Loading */}
      {status === 'extracting' && (
        <div className="flex items-center justify-center gap-2 py-4 text-amber-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Dokument wird gescannt...</span>
        </div>
      )}

      {/* Extracted Data Preview */}
      {extractedData && (
        <div className="bg-white/70 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-semibold">Daten erfolgreich extrahiert</span>
          </div>

          {/* 1. TITELDATEN (Betreibende Partei) */}
          <div className="border border-blue-200 rounded-lg p-3 bg-blue-50/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Titeldaten</p>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTiteldaten}
                  onChange={(e) => setIncludeTiteldaten(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-600">übernehmen</span>
              </label>
            </div>
            <div className={includeTiteldaten ? '' : 'opacity-40'}>
              <p className="font-medium text-slate-800 text-sm">{extractedData.betreibenderName}</p>
              <p className="text-slate-600 text-xs">
                {extractedData.betreibenderStrasse}, {extractedData.betreibenderPlz} {extractedData.betreibenderOrt}
                {extractedData.betreibenderLand && ` (${extractedData.betreibenderLand})`}
              </p>
            </div>
          </div>

          {/* 2. EXEKUTIONSDATEN (Verpflichtete Partei, Titel, Forderung) */}
          <div className="border border-amber-200 rounded-lg p-3 bg-amber-50/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Exekutionsdaten</p>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeExekution}
                  onChange={(e) => setIncludeExekution(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-xs text-slate-600">übernehmen</span>
              </label>
            </div>
            <div className={`space-y-2 text-sm ${includeExekution ? '' : 'opacity-40'}`}>
              {/* Verpflichtete Partei */}
              <div>
                <p className="text-xs text-slate-500">Verpflichtete Partei</p>
                <p className="font-medium text-slate-800">{extractedData.verpflichteterName}</p>
                <p className="text-slate-600 text-xs">
                  {extractedData.verpflichteterStrasse}, {extractedData.verpflichteterPlz} {extractedData.verpflichteterOrt}
                  {extractedData.verpflichteterLand && ` (${extractedData.verpflichteterLand})`}
                </p>
                {extractedData.verpflichteterGeburtsdatum && (
                  <p className="text-slate-500 text-xs">geb. {extractedData.verpflichteterGeburtsdatum}</p>
                )}
              </div>
              {/* Exekutionstitel */}
              <div className="pt-1 border-t border-amber-200">
                <p className="text-xs text-slate-500">Exekutionstitel</p>
                <p className="font-medium text-slate-800">
                  {extractedData.titelArt} {extractedData.titelGericht} {extractedData.titelGZ}
                </p>
                <p className="text-slate-600 text-xs">
                  vom {extractedData.titelDatum} • vollstreckbar seit {extractedData.vollstreckbarkeitDatum}
                </p>
              </div>
              {/* Forderung */}
              <div className="pt-1 border-t border-amber-200">
                <p className="text-xs text-slate-500">Forderung</p>
                <p className="font-medium text-slate-800">
                  {formatCurrency(extractedData.kapitalforderung)} + {extractedData.zinsenProzent}% Zinsen seit {extractedData.zinsenAb}
                </p>
                <p className="text-slate-600 text-xs">
                  Kosten: {formatCurrency(extractedData.kosten)}
                </p>
              </div>
            </div>
          </div>

          {/* 3. KANZLEI */}
          {extractedData.kanzleiName && (
            <div className="border border-emerald-200 rounded-lg p-3 bg-emerald-50/50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Klagevertreter/Kanzlei</p>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeKanzlei}
                    onChange={(e) => setIncludeKanzlei(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-600">übernehmen</span>
                </label>
              </div>
              <div className={includeKanzlei ? '' : 'opacity-40'}>
                <p className="font-medium text-slate-800 text-sm">{extractedData.kanzleiName}</p>
                {(extractedData.kanzleiStrasse || extractedData.kanzleiOrt) && (
                  <p className="text-slate-600 text-xs">
                    {extractedData.kanzleiStrasse}{extractedData.kanzleiStrasse && extractedData.kanzleiPlz ? ', ' : ''}{extractedData.kanzleiPlz} {extractedData.kanzleiOrt}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleApply}
              className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
            >
              Übernehmen
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* No API Key Warning */}
      {!apiKey && file && (
        <p className="text-xs text-amber-600 mt-2">
          OpenRouter API-Key erforderlich (VITE_OPENROUTER_API_KEY in .env.local)
        </p>
      )}
    </div>
  );
}
