import { useState, useRef, useCallback, useMemo } from 'react';
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle, Scale, Zap, Clock, Users } from 'lucide-react';
import { extractZivilprozessDataFromPDF, fileToBase64, type ExtractedZivilprozessData, type ParteiInfo } from '../lib/documentExtractor';
import type { VertretenePartei, ServiceType } from '../types';
import { mapDokumentToLeistung, mapDokumentTypToLeistung, getDefaultVariante, type MappedLeistung } from '../lib/leistungMapper';

export interface LeistungToAdd {
  catalogId: string;
  label: string;
  serviceType: ServiceType;
  esMultiplier: number;
  durationHalbeStunden?: number;  // Für Hearings: Dauer in halben Stunden
}

// Ausgewählte Parteien (für Streitgenossenschaften)
export interface SelectedParties {
  klaeger: number[];   // Array der Partei-Nummern
  beklagte: number[];
}

interface Props {
  onDataExtracted: (
    data: ExtractedZivilprozessData,
    vertretenePartei: VertretenePartei,
    leistung?: LeistungToAdd,
    selectedParties?: SelectedParties
  ) => void;
  apiKey: string;
}

type Status = 'idle' | 'uploading' | 'extracting' | 'success' | 'error';

export function ZivilprozessUpload({ onDataExtracted, apiKey }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedZivilprozessData | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  // Welche Partei vertreten wir? Default: Beklagte (häufigster Fall bei eingehender Klage)
  const [vertretenePartei, setVertretenePartei] = useState<VertretenePartei>('beklagte');
  // Multi-Partei-Auswahl (für Streitgenossenschaften)
  const [selectedKlaeger, setSelectedKlaeger] = useState<number[]>([]);
  const [selectedBeklagte, setSelectedBeklagte] = useState<number[]>([]);
  // Checkboxen für Übernahme
  const [includeGegner, setIncludeGegner] = useState(true);
  const [includeVerfahren, setIncludeVerfahren] = useState(true);
  const [includeForderung, setIncludeForderung] = useState(true);
  // Leistung übernehmen (ersetzt Einspruch/KB)
  const [addLeistung, setAddLeistung] = useState(true);
  const [leistungVariante, setLeistungVariante] = useState<'tp2' | 'tp3a'>('tp2');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parteien-Arrays aus extrahierten Daten (mit Fallback auf Legacy-Felder)
  const klaegerList: ParteiInfo[] = useMemo(() => {
    if (!extractedData) return [];
    if (extractedData.klaeger && extractedData.klaeger.length > 0) {
      return extractedData.klaeger;
    }
    // Fallback: Legacy-Felder → einzelne Partei
    if (extractedData.klaegerName) {
      return [{
        nummer: 1,
        name: extractedData.klaegerName,
        strasse: extractedData.klaegerStrasse || '',
        plz: extractedData.klaegerPlz || '',
        ort: extractedData.klaegerOrt || '',
        land: extractedData.klaegerLand,
        geburtsdatum: extractedData.klaegerGeburtsdatum,
      }];
    }
    return [];
  }, [extractedData]);

  const beklagteList: ParteiInfo[] = useMemo(() => {
    if (!extractedData) return [];
    if (extractedData.beklagte && extractedData.beklagte.length > 0) {
      return extractedData.beklagte;
    }
    // Fallback: Legacy-Felder → einzelne Partei
    if (extractedData.beklagterName) {
      return [{
        nummer: 1,
        name: extractedData.beklagterName,
        strasse: extractedData.beklagterStrasse || '',
        plz: extractedData.beklagterPlz || '',
        ort: extractedData.beklagterOrt || '',
      }];
    }
    return [];
  }, [extractedData]);

  // Multi-Party: Mehrere Parteien auf einer Seite?
  const hasMultipleKlaeger = klaegerList.length > 1;
  const hasMultipleBeklagte = beklagteList.length > 1;

  // Protokoll erkannt?
  const isProtokoll = extractedData?.dokumentTyp === 'Protokoll';
  const protokollInfo = extractedData?.protokoll;

  // Erkannte Leistung basierend auf Dokumenttyp, vertretener Partei und Variante
  const erkannteLeistung: MappedLeistung | null = useMemo(() => {
    if (!extractedData) return null;
    // Neuer Dispatcher: unterstützt Klage/Mahnklage/ZB + Protokoll
    return mapDokumentTypToLeistung(
      extractedData.dokumentTyp || 'Sonstig',
      extractedData.klageArt,
      vertretenePartei,
      leistungVariante,
      extractedData.protokoll,
      extractedData.klageGericht
    );
  }, [extractedData, vertretenePartei, leistungVariante]);

  // Automatisch passende Variante setzen wenn Dokumenttyp erkannt wird
  const handlePartyChange = useCallback((party: VertretenePartei) => {
    setVertretenePartei(party);
    if (extractedData) {
      setLeistungVariante(getDefaultVariante(extractedData.klageArt));
    }
  }, [extractedData]);

  // Partei-Auswahl bei Multi-Partei (Checkbox-Handler)
  const toggleKlaegerSelection = useCallback((nummer: number) => {
    setSelectedKlaeger(prev => {
      if (prev.includes(nummer)) {
        // Mindestens eine Partei muss ausgewählt bleiben
        if (prev.length === 1) return prev;
        return prev.filter(n => n !== nummer);
      }
      return [...prev, nummer];
    });
  }, []);

  const toggleBeklagteSelection = useCallback((nummer: number) => {
    setSelectedBeklagte(prev => {
      if (prev.includes(nummer)) {
        // Mindestens eine Partei muss ausgewählt bleiben
        if (prev.length === 1) return prev;
        return prev.filter(n => n !== nummer);
      }
      return [...prev, nummer];
    });
  }, []);

  // Single-Party-Auswahl bei nur einer Partei auf einer Seite (Radio-Handler)
  const selectSingleKlaeger = useCallback((nummer: number) => {
    setSelectedKlaeger([nummer]);
  }, []);

  const selectSingleBeklagter = useCallback((nummer: number) => {
    setSelectedBeklagte([nummer]);
  }, []);

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
      const data = await extractZivilprozessDataFromPDF(base64, apiKey);
      setExtractedData(data);
      // Automatisch passende Variante setzen
      setLeistungVariante(getDefaultVariante(data.klageArt));
      // Default-Auswahl für Parteien setzen
      if (data.klaeger && data.klaeger.length > 0) {
        setSelectedKlaeger([data.klaeger[0].nummer]);
      } else if (data.klaegerName) {
        setSelectedKlaeger([1]);
      }
      if (data.beklagte && data.beklagte.length > 0) {
        setSelectedBeklagte([data.beklagte[0].nummer]);
      } else if (data.beklagterName) {
        setSelectedBeklagte([1]);
      }
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraktion fehlgeschlagen');
      setStatus('error');
    }
  };

  const handleApply = () => {
    if (extractedData) {
      // Daten je nach Checkbox-Status übernehmen
      const dataToApply: ExtractedZivilprozessData = {
        // Dokumenttyp + Arrays (neu)
        dokumentTyp: extractedData.dokumentTyp,
        klaeger: includeGegner ? extractedData.klaeger : [],
        beklagte: extractedData.beklagte,
        klagevertreter: includeGegner ? extractedData.klagevertreter : [],
        beklagtenvertreter: extractedData.beklagtenvertreter,
        protokoll: extractedData.protokoll,
        // Kläger-Daten (Legacy, aus Dokument)
        klaegerName: includeGegner ? extractedData.klaegerName : '',
        klaegerStrasse: includeGegner ? extractedData.klaegerStrasse : '',
        klaegerPlz: includeGegner ? extractedData.klaegerPlz : '',
        klaegerOrt: includeGegner ? extractedData.klaegerOrt : '',
        klaegerLand: includeGegner ? extractedData.klaegerLand : '',
        klaegerGeburtsdatum: includeGegner ? extractedData.klaegerGeburtsdatum : '',
        // Klagevertreter-Daten (Legacy, aus Dokument)
        klagevertreterName: includeGegner ? extractedData.klagevertreterName : '',
        klagevertreterStrasse: includeGegner ? extractedData.klagevertreterStrasse : '',
        klagevertreterPlz: includeGegner ? extractedData.klagevertreterPlz : '',
        klagevertreterOrt: includeGegner ? extractedData.klagevertreterOrt : '',
        klagevertreterCode: includeGegner ? extractedData.klagevertreterCode : '',
        // Verfahren
        klageArt: includeVerfahren ? extractedData.klageArt : '',
        klageGericht: includeVerfahren ? extractedData.klageGericht : '',
        klageGZ: includeVerfahren ? extractedData.klageGZ : '',
        einbringungsDatum: includeVerfahren ? extractedData.einbringungsDatum : '',
        fallcode: includeVerfahren ? extractedData.fallcode : '',
        klagegegenstand: includeVerfahren ? extractedData.klagegegenstand : '',
        // Forderung
        streitwert: includeForderung ? extractedData.streitwert : 0,
        kapitalforderung: includeForderung ? extractedData.kapitalforderung : 0,
        nebenforderung: includeForderung ? extractedData.nebenforderung : 0,
        zinsenProzent: includeForderung ? extractedData.zinsenProzent : 0,
        zinsenAb: includeForderung ? extractedData.zinsenAb : '',
        // Beklagte-Daten (Legacy, aus Dokument)
        beklagterName: extractedData.beklagterName,
        beklagterStrasse: extractedData.beklagterStrasse,
        beklagterPlz: extractedData.beklagterPlz,
        beklagterOrt: extractedData.beklagterOrt,
      };
      // Leistung mitgeben wenn aktiviert (inkl. durationHalbeStunden für Protokolle)
      const leistungToAdd: LeistungToAdd | undefined = addLeistung && erkannteLeistung ? {
        ...erkannteLeistung,
        durationHalbeStunden: erkannteLeistung.durationHalbeStunden,
      } : undefined;
      // Ausgewählte Parteien mitgeben
      const selectedParties: SelectedParties = {
        klaeger: selectedKlaeger,
        beklagte: selectedBeklagte,
      };
      onDataExtracted(dataToApply, vertretenePartei, leistungToAdd, selectedParties);
      // Reset
      setFile(null);
      setExtractedData(null);
      setStatus('idle');
      setSelectedKlaeger([]);
      setSelectedBeklagte([]);
    }
  };

  const handleClear = () => {
    setFile(null);
    setExtractedData(null);
    setStatus('idle');
    setError(null);
  };

  const formatCurrency = (n: number) => n.toLocaleString('de-AT', { minimumFractionDigits: 2 }) + ' EUR';

  return (
    <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-4 mb-4">
      <h3 className="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">
        <Scale className="h-4 w-4" />
        Dokument hochladen (Klage/ZB/Protokoll)
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
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-slate-300 hover:border-blue-400 hover:bg-blue-500/5'
          }`}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
          <p className="text-sm text-slate-600">
            Klage, Zahlungsbefehl oder Protokoll hier ablegen
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
            <FileText className="h-5 w-5 text-blue-600" />
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
          className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Daten extrahieren
        </button>
      )}

      {/* Loading */}
      {status === 'extracting' && (
        <div className="flex items-center justify-center gap-2 py-4 text-blue-600">
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

          {/* 0. PARTEI-AUSWAHL: Wen vertreten wir? */}
          <div className="border border-purple-200 rounded-lg p-3 bg-purple-50/50">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-purple-600" />
              <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Wir vertreten:</p>
              {(hasMultipleKlaeger || hasMultipleBeklagte) && (
                <span className="text-xs text-purple-500 font-normal">(Streitgenossenschaft)</span>
              )}
            </div>

            {/* Kläger-Seite */}
            <div className="mb-3">
              <p className="text-xs font-semibold text-slate-600 mb-1">Kläger:</p>
              {klaegerList.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Keine Kläger erkannt</p>
              ) : hasMultipleKlaeger ? (
                // MEHRERE KLÄGER → Checkboxen
                <div className="space-y-1 ml-2">
                  {klaegerList.map((k) => (
                    <label key={k.nummer} className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedKlaeger.includes(k.nummer)}
                        onChange={() => toggleKlaegerSelection(k.nummer)}
                        className="w-4 h-4 mt-0.5 text-purple-500 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-slate-700">
                        <strong>{k.nummer}.</strong> {k.name}
                        {k.geburtsdatum && <span className="text-xs text-slate-500 ml-1">(geb. {k.geburtsdatum})</span>}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                // EIN KLÄGER → Radio
                <label className="flex items-center gap-2 cursor-pointer ml-2">
                  <input
                    type="radio"
                    name="vertretenePartei"
                    checked={vertretenePartei === 'klaeger' && selectedKlaeger.includes(klaegerList[0]?.nummer || 1)}
                    onChange={() => {
                      handlePartyChange('klaeger');
                      selectSingleKlaeger(klaegerList[0]?.nummer || 1);
                    }}
                    className="w-4 h-4 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-700">
                    {klaegerList[0]?.name || extractedData.klaegerName}
                    {klaegerList[0]?.geburtsdatum && <span className="text-xs text-slate-500 ml-1">(geb. {klaegerList[0].geburtsdatum})</span>}
                  </span>
                </label>
              )}
            </div>

            {/* Beklagte-Seite */}
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-1">Beklagte:</p>
              {beklagteList.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Keine Beklagten erkannt</p>
              ) : hasMultipleBeklagte ? (
                // MEHRERE BEKLAGTE → Checkboxen
                <div className="space-y-1 ml-2">
                  {beklagteList.map((b) => (
                    <label key={b.nummer} className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBeklagte.includes(b.nummer)}
                        onChange={() => toggleBeklagteSelection(b.nummer)}
                        className="w-4 h-4 mt-0.5 text-purple-500 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-slate-700">
                        <strong>{b.nummer}.</strong> {b.name}
                        {b.geburtsdatum && <span className="text-xs text-slate-500 ml-1">(geb. {b.geburtsdatum})</span>}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                // EIN BEKLAGTER → Radio
                <label className="flex items-center gap-2 cursor-pointer ml-2">
                  <input
                    type="radio"
                    name="vertretenePartei"
                    checked={vertretenePartei === 'beklagte' && selectedBeklagte.includes(beklagteList[0]?.nummer || 1)}
                    onChange={() => {
                      handlePartyChange('beklagte');
                      selectSingleBeklagter(beklagteList[0]?.nummer || 1);
                    }}
                    className="w-4 h-4 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-700">
                    {beklagteList[0]?.name || extractedData.beklagterName}
                  </span>
                </label>
              )}
            </div>

            {/* Hinweis bei Multi-Select */}
            {(hasMultipleKlaeger || hasMultipleBeklagte) && (
              <p className="text-xs text-purple-600 mt-2 border-t border-purple-100 pt-2">
                Wählen Sie alle Parteien aus, die Sie vertreten. Nicht-vertretene Gegner werden als Streitgenossen gezählt.
              </p>
            )}
          </div>

          {/* 1. GEGNER (Kläger wenn wir Beklagte, Beklagte wenn wir Kläger) */}
          <div className="border border-red-200 rounded-lg p-3 bg-red-50/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-red-700 uppercase tracking-wider">
                {vertretenePartei === 'beklagte' ? 'Kläger (Gegner)' : 'Beklagte (Gegner)'}
              </p>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeGegner}
                  onChange={(e) => setIncludeGegner(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-red-500 focus:ring-red-500"
                />
                <span className="text-xs text-slate-600">übernehmen</span>
              </label>
            </div>
            <div className={includeGegner ? '' : 'opacity-40'}>
              {vertretenePartei === 'beklagte' ? (
                <>
                  <p className="font-medium text-slate-800 text-sm">{extractedData.klaegerName}</p>
                  {extractedData.klaegerGeburtsdatum && (
                    <p className="text-slate-500 text-xs">geb. {extractedData.klaegerGeburtsdatum}</p>
                  )}
                  <p className="text-slate-600 text-xs">
                    {extractedData.klaegerStrasse}, {extractedData.klaegerPlz} {extractedData.klaegerOrt}
                    {extractedData.klaegerLand && ` (${extractedData.klaegerLand})`}
                  </p>
                  {extractedData.klagevertreterName && (
                    <p className="text-slate-600 text-xs mt-1">
                      vertr. durch: {extractedData.klagevertreterName}
                      {extractedData.klagevertreterCode && ` (${extractedData.klagevertreterCode})`}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="font-medium text-slate-800 text-sm">{extractedData.beklagterName || '(nicht extrahiert)'}</p>
                  <p className="text-slate-600 text-xs">
                    {[extractedData.beklagterStrasse, extractedData.beklagterPlz, extractedData.beklagterOrt].filter(Boolean).join(', ')}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* 2. VERFAHREN */}
          <div className="border border-amber-200 rounded-lg p-3 bg-amber-50/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Verfahren</p>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeVerfahren}
                  onChange={(e) => setIncludeVerfahren(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-xs text-slate-600">übernehmen</span>
              </label>
            </div>
            <div className={`space-y-1 text-sm ${includeVerfahren ? '' : 'opacity-40'}`}>
              <p className="font-medium text-slate-800">
                {extractedData.klageArt} {extractedData.klageGericht} {extractedData.klageGZ}
              </p>
              <p className="text-slate-600 text-xs">
                Eingebracht: {extractedData.einbringungsDatum}
                {extractedData.fallcode && ` | Fallcode: ${extractedData.fallcode}`}
              </p>
              {extractedData.klagegegenstand && (
                <p className="text-slate-500 text-xs italic">{extractedData.klagegegenstand}</p>
              )}
            </div>
          </div>

          {/* 2a. PROTOKOLL-INFO (nur wenn Protokoll erkannt) */}
          {isProtokoll && protokollInfo && (
            <div className="border border-cyan-200 rounded-lg p-3 bg-cyan-50/50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-cyan-600" />
                <p className="text-xs font-bold text-cyan-700 uppercase tracking-wider">Verhandlung/Tagsatzung</p>
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-medium text-slate-800">
                  {protokollInfo.protokollArt || 'Tagsatzung'} am {protokollInfo.datum}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span>Beginn: {protokollInfo.beginn}</span>
                  <span>Ende: {protokollInfo.ende}</span>
                  {protokollInfo.pauseMinuten > 0 && (
                    <span className="text-amber-600">Pause: {protokollInfo.pauseMinuten} Min</span>
                  )}
                </div>
                <div className="mt-2 p-2 bg-cyan-100/50 rounded flex items-center gap-3">
                  <Clock className="h-5 w-5 text-cyan-700" />
                  <div>
                    <p className="text-sm font-bold text-cyan-800">
                      {protokollInfo.halbeStunden} halbe Stunden
                    </p>
                    <p className="text-xs text-cyan-600">
                      = {(protokollInfo.halbeStunden / 2).toFixed(1)} Std. Verhandlungsdauer (netto {protokollInfo.dauerMinuten} Min)
                    </p>
                  </div>
                </div>
                {protokollInfo.richterName && (
                  <p className="text-xs text-slate-500 mt-1">Richter: {protokollInfo.richterName}</p>
                )}
              </div>
            </div>
          )}

          {/* 3. FORDERUNG → BMGL (nur bei Klage/Mahnklage, nicht bei Protokoll) */}
          {!isProtokoll && (
          <div className="border border-emerald-200 rounded-lg p-3 bg-emerald-50/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Forderung → BMGL</p>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeForderung}
                  onChange={(e) => setIncludeForderung(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-600">übernehmen</span>
              </label>
            </div>
            <div className={`space-y-1 text-sm ${includeForderung ? '' : 'opacity-40'}`}>
              <p className="font-medium text-slate-800">
                Kapital: {formatCurrency(extractedData.kapitalforderung)}
              </p>
              {extractedData.nebenforderung > 0 && (
                <p className="text-slate-600 text-xs">
                  + Nebenforderung: {formatCurrency(extractedData.nebenforderung)}
                </p>
              )}
              <p className="text-slate-600 text-xs">
                + {extractedData.zinsenProzent}% Zinsen seit {extractedData.zinsenAb}
              </p>
            </div>
          </div>
          )}

          {/* LEISTUNG ÜBERNEHMEN - für beide Parteien */}
          <div className="border border-indigo-200 rounded-lg p-3 bg-indigo-50/50">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={addLeistung}
                onChange={(e) => setAddLeistung(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-indigo-700 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                Leistung übernehmen
              </span>
            </label>

            {addLeistung && erkannteLeistung && (
              <>
                {/* Erkannte Leistung */}
                <div className="mt-2 ml-6 p-2 bg-white rounded border border-indigo-100">
                  <p className="text-sm font-medium text-indigo-800">{erkannteLeistung.label}</p>
                  <p className="text-xs text-slate-500">
                    {isProtokoll && protokollInfo ? (
                      <>Datum: {protokollInfo.datum} | Dauer: {erkannteLeistung.durationHalbeStunden} × ½h | ES: {erkannteLeistung.esMultiplier}× doppelt</>
                    ) : (
                      <>Datum: {extractedData.einbringungsDatum} | ES: {erkannteLeistung.esMultiplier}× doppelt</>
                    )}
                  </p>
                </div>

                {/* TP-Varianten-Auswahl (nur bei Klage/Mahnklage/ZB, nicht bei Protokoll) */}
                {!isProtokoll && (
                <div className="mt-2 ml-6 space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="leistungVariante"
                      checked={leistungVariante === 'tp2'}
                      onChange={() => setLeistungVariante('tp2')}
                      className="w-3.5 h-3.5 text-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-700">
                      <strong>TP 2</strong> – einfach (Bestreitung, kurze Ausführung)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="leistungVariante"
                      checked={leistungVariante === 'tp3a'}
                      onChange={() => setLeistungVariante('tp3a')}
                      className="w-3.5 h-3.5 text-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-700">
                      <strong>TP 3A</strong> – umfangreich (Sachvorbringen, Einwendungen)
                    </span>
                  </label>
                </div>
                )}
              </>
            )}
          </div>

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
        <p className="text-xs text-blue-600 mt-2">
          OpenRouter API-Key erforderlich (VITE_OPENROUTER_API_KEY in .env.local)
        </p>
      )}
    </div>
  );
}
