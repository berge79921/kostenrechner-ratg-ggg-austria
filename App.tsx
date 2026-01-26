
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Scale,
  Plus,
  Trash2,
  Download,
  Info,
  X,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Gavel,
  Euro,
  FileText,
  Users,
  Layers,
  ShieldCheck,
  Clock,
  Mail,
  RefreshCcw,
  Settings2,
  Award,
  Building2,
  Calculator
} from 'lucide-react';
import { GlassCard } from './components/GlassCard';
import {
  ServiceType,
  LegalService,
  ProcedureType,
  CalculatedLine,
  CaseMode,
  StrafService
} from './types';
import { calculateCosts, formatEuro } from './lib/calculator';
import { SERVICE_CATALOG, getGroupedCatalog, CATEGORY_LABELS, CatalogCategory } from './lib/catalog';
import { generateKostenverzeichnisPDF } from './lib/pdfGenerator';
import { deriveGGGWithLabel } from './lib/ggg-derive';
import { getGGG } from './lib/ggg';
import { getTariffBase, getTagsatzung, TagsatzungType, getKommission } from './lib/tariffs';
// Straf-Imports
import {
  CourtType,
  StrafLeistungType,
  COURT_TYPE_LABELS,
  STRAF_LEISTUNG_LABELS,
  STRAF_BEMESSUNGSGRUNDLAGEN,
  AHK_TARIFE,
  AHK_HAFT_TARIFE,
  getAvailableLeistungen,
  isTagsatzung as isStrafTagsatzung
} from './lib/ahk';
import { calculateStrafCosts } from './lib/straf-calculator';
import { getStrafCatalog, getGroupedStrafCatalog, STRAF_CATEGORY_LABELS, getDefaultStrafService } from './lib/straf-catalog';
// Haft-Imports
import { HaftService, HaftLeistungType, HaftBmglStufe, VStrafService, VStrafLeistungType, VStrafStufe } from './types';
import { calculateHaftCosts, HAFT_BEMESSUNGSGRUNDLAGEN, HAFT_BMGL_LABELS } from './lib/haft-calculator';
import { HAFT_CATALOG, HAFT_CATEGORY_LABELS, HAFT_LEISTUNG_LABELS, getGroupedHaftCatalog, getDefaultHaftService, isHaftTagsatzung, hasHaftKilometer } from './lib/haft-catalog';
// V-Straf-Imports
import { calculateVStrafCosts } from './lib/vstraf-calculator';
import { VSTRAF_BEMESSUNGSGRUNDLAGEN, VSTRAF_STUFE_LABELS, VSTRAF_LEISTUNG_LABELS, VSTRAF_CATEGORY_LABELS, getGroupedVStrafCatalog, getDefaultVStrafService, isVStrafTagsatzung, VStrafCatalogCategory, getVStrafCourtType, VStrafCourtType } from './lib/vstraf-catalog';
import { ValuationModal } from './components/ValuationModal';
import { ProWikiModal } from './components/ProWikiModal';
import { BookOpen, Lock, Upload, Save, ArrowLeft, List } from 'lucide-react';
// CSV Export/Import
import { CaseMetadata, DEFAULT_CASE_METADATA, KanzleiData, AppView, SavedKostennote, KostennoteState, DEFAULT_KOSTENNOTE_STATE } from './types';
import { exportToCSV, generateFilename, ExportState, exportAllKostennoten, generateArchiveFilename } from './lib/csvExport';
import { importFromCSV, importMultipleKostennoten } from './lib/csvImport';
import { saveKanzleiData, loadKanzleiData } from './lib/storage';
import { loadAllKostennoten, saveAllKostennoten, saveKostennote, deleteKostennote as deleteKostennoteFromStore, createNewKostennote } from './lib/kostennotenStore';
import { CaseMetadataForm } from './components/CaseMetadataForm';
import { KostennotenList } from './components/KostennotenList';

// Helper: Map ServiceType to TagsatzungType
function getTagsatzungType(serviceType: ServiceType): TagsatzungType | null {
  if (serviceType === ServiceType.HEARING_TP2_II || serviceType === ServiceType.HEARING_TP2_II_INSOLVENCY) return 'TP2';
  if (serviceType === ServiceType.HEARING_TP3A_II) return 'TP3A';
  if (serviceType === ServiceType.HEARING_TP3B_II) return 'TP3B';
  if (serviceType === ServiceType.HEARING_TP3C_II || serviceType === ServiceType.HEARING_TP3C_III) return 'TP3C';
  return null;
}

// InfoModal Component
function InfoModal({ line, onClose }: { line: CalculatedLine | null, onClose: () => void }) {
  if (!line) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <GlassCard className="max-w-xl w-full !p-0 shadow-2xl border-white/20 overflow-hidden" variant="dark">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-blue-500/10">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-blue-400" />
            <h3 className="text-xl font-bold tracking-tight text-white">Kalkulations-Details</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Position</span>
              <p className="text-lg font-bold text-white leading-tight">{line.label}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Datum</span>
              <p className="text-sm font-mono text-slate-300">{new Date(line.date).toLocaleDateString('de-AT')}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Bemessungsgrundlage</span>
               <p className="font-mono text-sm text-amber-400 font-bold">{formatEuro(line.bmglCents)}</p>
            </div>
            <div>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Norm / Gesetz</span>
               <p className="font-mono text-sm text-blue-300">{line.section}</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Berechnungsweg</span>
            <p className="font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">{line.calculationTrace}</p>
          </div>
          <div className="flex justify-between items-center pt-4">
            <span className="text-sm font-bold text-slate-400">Position Netto</span>
            <span className="text-2xl font-black text-blue-400">{formatEuro(line.amountCents)}</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

const App: React.FC = () => {
  // --- State ---
  const [caseMode, setCaseMode] = useState<CaseMode>(CaseMode.CIVIL);
  const [bmgl, setBmgl] = useState<number>(25000);
  const [services, setServices] = useState<LegalService[]>([]);
  const [procedureType, setProcedureType] = useState<ProcedureType>(ProcedureType.ZIVILPROZESS);
  const [additionalParties, setAdditionalParties] = useState<number>(0);
  const [isVatFree, setIsVatFree] = useState<boolean>(false);
  const [manualGgg, setManualGgg] = useState<number>(0);
  const [autoGgg, setAutoGgg] = useState<boolean>(true);
  const [showSubtotals, setShowSubtotals] = useState<boolean>(true);
  const [isVerbandsklage, setIsVerbandsklage] = useState<boolean>(false);
  const [activeInfo, setActiveInfo] = useState<CalculatedLine | null>(null);
  const [showCatalog, setShowCatalog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openServiceDropdown, setOpenServiceDropdown] = useState<string | null>(null);

  // --- Straf-State ---
  const [courtType, setCourtType] = useState<CourtType>('BG');
  const [strafServices, setStrafServices] = useState<StrafService[]>([]);
  const [strafStreitgenossen, setStrafStreitgenossen] = useState<number>(0);
  const [erfolgszuschlagProzent, setErfolgszuschlagProzent] = useState<number>(0);
  const [showStrafCatalog, setShowStrafCatalog] = useState(false);
  const [strafSearchTerm, setStrafSearchTerm] = useState("");
  const [openStrafServiceDropdown, setOpenStrafServiceDropdown] = useState<string | null>(null);
  const [showValuationModal, setShowValuationModal] = useState(false);
  const [showWiki, setShowWiki] = useState(false);

  // --- Haft-State ---
  const [haftBmglStufe, setHaftBmglStufe] = useState<HaftBmglStufe>('ER_GH');
  const [haftServices, setHaftServices] = useState<HaftService[]>([]);
  const [showHaftCatalog, setShowHaftCatalog] = useState(false);
  const [haftSearchTerm, setHaftSearchTerm] = useState("");
  const [openHaftServiceDropdown, setOpenHaftServiceDropdown] = useState<string | null>(null);

  // --- V-Straf-State ---
  const [vstrafStufe, setVstrafStufe] = useState<VStrafStufe>('Z2');
  const [vstrafVerfallswert, setVstrafVerfallswert] = useState<number>(0);
  const [vstrafServices, setVstrafServices] = useState<VStrafService[]>([]);
  const [vstrafStreitgenossen, setVstrafStreitgenossen] = useState<number>(0);
  const [vstrafErfolgszuschlag, setVstrafErfolgszuschlag] = useState<number>(0);
  const [showVstrafCatalog, setShowVstrafCatalog] = useState(false);
  const [vstrafSearchTerm, setVstrafSearchTerm] = useState("");
  const [openVstrafServiceDropdown, setOpenVstrafServiceDropdown] = useState<string | null>(null);

  // --- CSV Export/Import State ---
  const [caseMetadata, setCaseMetadata] = useState<CaseMetadata>(() => {
    // Initialisiere mit Default, Kanzleidaten werden in useEffect geladen
    return { ...DEFAULT_CASE_METADATA, erstelltAm: new Date().toISOString().split('T')[0] };
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Multi-Kostennoten State ---
  const [view, setView] = useState<AppView>('list');
  const [kostennoten, setKostennoten] = useState<SavedKostennote[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Lade Kostennoten aus localStorage beim Start
  useEffect(() => {
    const loaded = loadAllKostennoten();
    setKostennoten(loaded);
    // Lade auch Kanzleidaten
    const savedKanzlei = loadKanzleiData();
    if (savedKanzlei) {
      setCaseMetadata(prev => ({ ...prev, ...savedKanzlei }));
    }
  }, []);

  // Handler für Kanzleidaten-Änderung (speichert in localStorage)
  const handleKanzleiChange = (data: KanzleiData) => {
    saveKanzleiData(data);
  };

  // State aus aktiver Kostennote laden
  const loadKostennoteState = (k: SavedKostennote) => {
    setCaseMetadata(k.metadata);
    setCaseMode(k.state.caseMode);
    setIsVatFree(k.state.isVatFree);
    setBmgl(k.state.bmgl);
    setProcedureType(k.state.procedureType);
    setAdditionalParties(k.state.additionalParties);
    setAutoGgg(k.state.autoGgg);
    setManualGgg(k.state.manualGgg);
    setIsVerbandsklage(k.state.isVerbandsklage);
    setServices(k.state.services);
    setCourtType(k.state.courtType);
    setStrafServices(k.state.strafServices);
    setStrafStreitgenossen(k.state.strafStreitgenossen);
    setErfolgszuschlagProzent(k.state.erfolgszuschlagProzent);
    setHaftBmglStufe(k.state.haftBmglStufe);
    setHaftServices(k.state.haftServices);
    setVstrafStufe(k.state.vstrafStufe);
    setVstrafVerfallswert(k.state.vstrafVerfallswert);
    setVstrafServices(k.state.vstrafServices);
    setVstrafStreitgenossen(k.state.vstrafStreitgenossen);
    setVstrafErfolgszuschlag(k.state.vstrafErfolgszuschlag);
  };

  // Aktuellen State als Kostennote speichern
  const saveCurrentKostennote = () => {
    if (!activeId) return;
    const now = new Date().toISOString().split('T')[0];
    const updated: SavedKostennote = {
      id: activeId,
      createdAt: kostennoten.find(k => k.id === activeId)?.createdAt || now,
      updatedAt: now,
      metadata: caseMetadata,
      state: {
        caseMode,
        isVatFree,
        bmgl,
        procedureType,
        additionalParties,
        autoGgg,
        manualGgg,
        isVerbandsklage,
        services,
        courtType,
        strafServices,
        strafStreitgenossen,
        erfolgszuschlagProzent,
        haftBmglStufe,
        haftServices,
        vstrafStufe,
        vstrafVerfallswert,
        vstrafServices,
        vstrafStreitgenossen,
        vstrafErfolgszuschlag,
      },
    };
    saveKostennote(updated);
    setKostennoten(prev => prev.map(k => k.id === activeId ? updated : k));
  };

  // Auto-Save (debounced)
  useEffect(() => {
    if (!activeId || view !== 'editor') return;
    const timeout = setTimeout(() => {
      saveCurrentKostennote();
    }, 1000);
    return () => clearTimeout(timeout);
  }, [caseMode, isVatFree, bmgl, procedureType, additionalParties, autoGgg, manualGgg, isVerbandsklage, services, courtType, strafServices, strafStreitgenossen, erfolgszuschlagProzent, haftBmglStufe, haftServices, vstrafStufe, vstrafVerfallswert, vstrafServices, vstrafStreitgenossen, vstrafErfolgszuschlag, caseMetadata]);

  // Handlers für Kostennoten-Verwaltung
  const handleNewKostennote = () => {
    const savedKanzlei = loadKanzleiData();
    const now = new Date().toISOString().split('T')[0];
    const newK = createNewKostennote(
      savedKanzlei ? { ...savedKanzlei, erstelltAm: now } : { erstelltAm: now },
      { ...DEFAULT_KOSTENNOTE_STATE }
    );
    saveKostennote(newK);
    setKostennoten(prev => [newK, ...prev]);
    loadKostennoteState(newK);
    setActiveId(newK.id);
    setView('editor');
  };

  const handleEditKostennote = (id: string) => {
    const k = kostennoten.find(k => k.id === id);
    if (k) {
      loadKostennoteState(k);
      setActiveId(id);
      setView('editor');
    }
  };

  const handleDeleteKostennote = (id: string) => {
    deleteKostennoteFromStore(id);
    setKostennoten(prev => prev.filter(k => k.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setView('list');
    }
  };

  const handleBackToList = () => {
    saveCurrentKostennote();
    setActiveId(null);
    setView('list');
  };

  const handleImportKostennoten = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const result = importMultipleKostennoten(csv);
      if (result.success && result.kostennoten.length > 0) {
        // Merge mit existierenden (neue IDs generieren falls Duplikate)
        const existingIds = new Set(kostennoten.map(k => k.id));
        const newKostennoten = result.kostennoten.map(k => {
          if (existingIds.has(k.id)) {
            return { ...k, id: crypto.randomUUID() };
          }
          return k;
        });
        const merged = [...newKostennoten, ...kostennoten];
        setKostennoten(merged);
        saveAllKostennoten(merged);
        alert(`${result.kostennoten.length} Kostennote(n) importiert (${result.version} Format)`);
      } else {
        alert('Import fehlgeschlagen:\n' + result.errors.join('\n'));
      }
    };
    reader.readAsText(file);
  };

  const handleExportAllKostennoten = () => {
    const csv = exportAllKostennoten(kostennoten);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = generateArchiveFilename();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- Calculations ---
  const results = useMemo(() => {
    if (caseMode === CaseMode.VSTRAF) {
      return calculateVStrafCosts({
        stufe: vstrafStufe,
        verfallswert: vstrafVerfallswert,
        services: vstrafServices,
        streitgenossen: vstrafStreitgenossen,
        erfolgszuschlagProzent: vstrafErfolgszuschlag,
        isVatFree,
      });
    }
    if (caseMode === CaseMode.DETENTION) {
      return calculateHaftCosts({
        bmglStufe: haftBmglStufe,
        services: haftServices,
        isVatFree,
      });
    }
    if (caseMode === CaseMode.CRIMINAL) {
      return calculateStrafCosts({
        courtType,
        services: strafServices,
        streitgenossen: strafStreitgenossen,
        erfolgszuschlagProzent,
        isVatFree,
      });
    }
    return calculateCosts(
      bmgl * 100,
      services,
      manualGgg,
      isVatFree,
      additionalParties,
      autoGgg,
      isVerbandsklage,
      procedureType
    );
  }, [caseMode, bmgl, services, manualGgg, isVatFree, additionalParties, autoGgg, isVerbandsklage, procedureType, courtType, strafServices, strafStreitgenossen, erfolgszuschlagProzent, haftBmglStufe, haftServices, vstrafStufe, vstrafVerfallswert, vstrafServices, vstrafStreitgenossen, vstrafErfolgszuschlag]);

  // --- Tariff Info ---
  const tariffInfo = useMemo(() => {
    const tariff = getTariffBase(bmgl * 100, 'TP3A');
    return {
      label: tariff.label,
      version: tariff.version
    };
  }, [bmgl]);

  const gggInfo = useMemo(() => {
    if (!autoGgg || services.length === 0) return null;

    const partySurchargePercent = additionalParties === 1 ? 10 :
                                  additionalParties === 2 ? 15 :
                                  additionalParties === 3 ? 20 :
                                  additionalParties === 4 ? 25 :
                                  additionalParties === 5 ? 30 :
                                  additionalParties >= 9 ? 50 : 0;

    const derived = deriveGGGWithLabel(services, procedureType);
    const result = getGGG(derived.tarifpost, bmgl * 100, partySurchargePercent);

    return {
      tarifpost: derived.label,
      instanz: derived.instanz,
      amount: result.total,
      bracketLabel: result.label
    };
  }, [services, bmgl, additionalParties, autoGgg, procedureType]);

  // --- Handlers ---
  const addService = (entry: any) => {
    const isHearing = entry.type.includes('HEARING');
    const isTP5or6or8or9 = ['TP5', 'TP6', 'TP8', 'TP9'].includes(entry.tp);
    const isTP7 = entry.tp === 'TP7';
    // ES-Defaults: TP5,6,8,9 = 0 (kein ES), TP7 = max 1 (einfach), andere = 2 (doppelt)
    const defaultEsMultiplier = isTP5or6or8or9 ? 0 : (isTP7 ? 1 : ((entry.type === ServiceType.PLEADING_TP3A_I || entry.type === ServiceType.PLEADING_TP3B || isHearing) ? 2 : 1));
    const newService: LegalService = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      label: entry.short,
      type: entry.type,
      tp: entry.tp, // Tarifpost aus Katalog
      // Bei HEARINGs: durationHours = Anzahl halbe Stunden (2 = 1 Stunde), sonst 1
      durationHours: isHearing ? 2 : 1,
      esMultiplier: defaultEsMultiplier,
      includeErv: entry.type.startsWith('PLEADING'),
      isInitiating: services.length === 0,
      waitingUnits: 0,
      isAuswaerts: false,
      isRaRaaErforderlich: isTP7 ? true : undefined, // TP7: Default = RA/RAA erforderlich (TP 7/2)
    };
    setServices([...services, newService]);
    setShowCatalog(false);
    setSearchTerm("");
  };

  const removeService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const updateService = (id: string, updates: Partial<LegalService>) => {
    setServices(services.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const moveServiceUp = (id: string) => {
    const index = services.findIndex(s => s.id === id);
    if (index > 0) {
      const newServices = [...services];
      [newServices[index - 1], newServices[index]] = [newServices[index], newServices[index - 1]];
      setServices(newServices);
    }
  };

  const moveServiceDown = (id: string) => {
    const index = services.findIndex(s => s.id === id);
    if (index < services.length - 1) {
      const newServices = [...services];
      [newServices[index], newServices[index + 1]] = [newServices[index + 1], newServices[index]];
      setServices(newServices);
    }
  };

  const sortServicesByDate = () => {
    const sorted = [...services].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setServices(sorted);
  };

  const filteredCatalog = SERVICE_CATALOG.filter(c =>
    c.full.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.short.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.tp.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedCatalog = getGroupedCatalog();

  // --- Straf-Handlers ---
  const addStrafService = (leistungType: StrafLeistungType) => {
    const defaults = getDefaultStrafService(leistungType);
    const newService: StrafService = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      label: STRAF_LEISTUNG_LABELS[leistungType],
      leistungType,
      durationHalbeStunden: defaults.durationHalbeStunden,
      waitingHalbeStunden: defaults.waitingHalbeStunden,
      esMultiplier: defaults.esMultiplier,
      includeErv: defaults.includeErv,
      customStreitgenossen: undefined,
      isFrustriert: false,
    };
    setStrafServices([...strafServices, newService]);
    setShowStrafCatalog(false);
    setStrafSearchTerm("");
  };

  const removeStrafService = (id: string) => {
    setStrafServices(strafServices.filter(s => s.id !== id));
  };

  const updateStrafService = (id: string, updates: Partial<StrafService>) => {
    setStrafServices(strafServices.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const moveStrafServiceUp = (id: string) => {
    const index = strafServices.findIndex(s => s.id === id);
    if (index > 0) {
      const newServices = [...strafServices];
      [newServices[index - 1], newServices[index]] = [newServices[index], newServices[index - 1]];
      setStrafServices(newServices);
    }
  };

  const moveStrafServiceDown = (id: string) => {
    const index = strafServices.findIndex(s => s.id === id);
    if (index < strafServices.length - 1) {
      const newServices = [...strafServices];
      [newServices[index], newServices[index + 1]] = [newServices[index + 1], newServices[index]];
      setStrafServices(newServices);
    }
  };

  const sortStrafServicesByDate = () => {
    const sorted = [...strafServices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setStrafServices(sorted);
  };

  const strafCatalog = useMemo(() => getStrafCatalog(courtType), [courtType]);
  const groupedStrafCatalog = useMemo(() => getGroupedStrafCatalog(courtType), [courtType]);

  const filteredStrafCatalog = strafCatalog.filter(c =>
    c.full.toLowerCase().includes(strafSearchTerm.toLowerCase()) ||
    c.short.toLowerCase().includes(strafSearchTerm.toLowerCase())
  );

  // Straf-Info für Anzeige
  const strafBmgl = STRAF_BEMESSUNGSGRUNDLAGEN[courtType];

  // --- Haft-Handlers ---
  const addHaftService = (leistungType: HaftLeistungType) => {
    const defaults = getDefaultHaftService(leistungType);
    const newService: HaftService = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      label: HAFT_LEISTUNG_LABELS[leistungType],
      leistungType,
      durationHalbeStunden: defaults.durationHalbeStunden,
      waitingHalbeStunden: defaults.waitingHalbeStunden,
      esMultiplier: defaults.esMultiplier,
      includeErv: defaults.includeErv,
      kilometerHin: 0,
      isRueckfahrt: true,
      isFrustriert: false,
    };
    setHaftServices([...haftServices, newService]);
    setShowHaftCatalog(false);
    setHaftSearchTerm("");
  };

  const removeHaftService = (id: string) => {
    setHaftServices(haftServices.filter(s => s.id !== id));
  };

  const updateHaftService = (id: string, updates: Partial<HaftService>) => {
    setHaftServices(haftServices.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const moveHaftServiceUp = (id: string) => {
    const index = haftServices.findIndex(s => s.id === id);
    if (index > 0) {
      const newServices = [...haftServices];
      [newServices[index - 1], newServices[index]] = [newServices[index], newServices[index - 1]];
      setHaftServices(newServices);
    }
  };

  const moveHaftServiceDown = (id: string) => {
    const index = haftServices.findIndex(s => s.id === id);
    if (index < haftServices.length - 1) {
      const newServices = [...haftServices];
      [newServices[index], newServices[index + 1]] = [newServices[index + 1], newServices[index]];
      setHaftServices(newServices);
    }
  };

  const sortHaftServicesByDate = () => {
    const sorted = [...haftServices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setHaftServices(sorted);
  };

  const groupedHaftCatalog = useMemo(() => getGroupedHaftCatalog(), []);

  const filteredHaftCatalog = HAFT_CATALOG.filter(c =>
    c.full.toLowerCase().includes(haftSearchTerm.toLowerCase()) ||
    c.short.toLowerCase().includes(haftSearchTerm.toLowerCase())
  );

  // Haft-BMGL für Anzeige
  const haftBmgl = HAFT_BEMESSUNGSGRUNDLAGEN[haftBmglStufe];

  // --- V-Straf-Handlers ---
  const addVstrafService = (leistungType: VStrafLeistungType, label?: string) => {
    const defaults = getDefaultVStrafService(leistungType);
    const newService: VStrafService = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      label: label || VSTRAF_LEISTUNG_LABELS[leistungType],
      leistungType,
      durationHalbeStunden: defaults.durationHalbeStunden,
      waitingHalbeStunden: defaults.waitingHalbeStunden,
      esMultiplier: defaults.esMultiplier,
      includeErv: defaults.includeErv,
      isNurStrafhoehe: leistungType.includes('_STRAFE'),
    };
    setVstrafServices([...vstrafServices, newService]);
    setShowVstrafCatalog(false);
    setVstrafSearchTerm("");
  };

  const removeVstrafService = (id: string) => {
    setVstrafServices(vstrafServices.filter(s => s.id !== id));
  };

  const updateVstrafService = (id: string, updates: Partial<VStrafService>) => {
    setVstrafServices(vstrafServices.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const moveVstrafServiceUp = (id: string) => {
    const index = vstrafServices.findIndex(s => s.id === id);
    if (index > 0) {
      const newServices = [...vstrafServices];
      [newServices[index - 1], newServices[index]] = [newServices[index], newServices[index - 1]];
      setVstrafServices(newServices);
    }
  };

  const moveVstrafServiceDown = (id: string) => {
    const index = vstrafServices.findIndex(s => s.id === id);
    if (index < vstrafServices.length - 1) {
      const newServices = [...vstrafServices];
      [newServices[index], newServices[index + 1]] = [newServices[index + 1], newServices[index]];
      setVstrafServices(newServices);
    }
  };

  const sortVstrafServicesByDate = () => {
    const sorted = [...vstrafServices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setVstrafServices(sorted);
  };

  const groupedVstrafCatalog = useMemo(() => getGroupedVStrafCatalog(), []);

  const vstrafCatalog = useMemo(() => {
    const all: { id: string; leistungType: VStrafLeistungType; short: string; full: string; category: VStrafCatalogCategory }[] = [];
    (Object.values(groupedVstrafCatalog) as { id: string; leistungType: VStrafLeistungType; short: string; full: string; category: VStrafCatalogCategory }[][]).forEach(entries => all.push(...entries));
    return all;
  }, [groupedVstrafCatalog]);

  const filteredVstrafCatalog = vstrafCatalog.filter(c =>
    c.full.toLowerCase().includes(vstrafSearchTerm.toLowerCase()) ||
    c.short.toLowerCase().includes(vstrafSearchTerm.toLowerCase())
  );

  // V-Straf-BMGL für Anzeige (inkl. Verfallswert)
  const vstrafBmgl = VSTRAF_BEMESSUNGSGRUNDLAGEN[vstrafStufe] + vstrafVerfallswert;

  // --- CSV Export/Import Handlers ---
  const handleExportCSV = () => {
    const state: ExportState = {
      metadata: { ...caseMetadata, erstelltAm: new Date().toISOString().split('T')[0] },
      caseMode,
      isVatFree,
      bmgl,
      procedureType,
      additionalParties,
      autoGgg,
      manualGgg,
      isVerbandsklage,
      services,
      courtType,
      strafServices,
      strafStreitgenossen,
      erfolgszuschlagProzent,
      haftBmglStufe,
      haftServices,
      vstrafStufe,
      vstrafVerfallswert,
      vstrafServices,
      vstrafStreitgenossen,
      vstrafErfolgszuschlag,
    };
    const csv = exportToCSV(state);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = generateFilename(state.metadata);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const result = importFromCSV(csv);

      if (!result.success) {
        alert('Import fehlgeschlagen:\n' + result.errors.join('\n'));
        return;
      }

      if (result.warnings.length > 0) {
        console.warn('Import-Warnungen:', result.warnings);
      }

      const s = result.state!;

      // Restore all state
      setCaseMetadata(s.metadata);
      setCaseMode(s.caseMode);
      setIsVatFree(s.isVatFree);

      // Civil
      setBmgl(s.bmgl);
      setProcedureType(s.procedureType);
      setAdditionalParties(s.additionalParties);
      setAutoGgg(s.autoGgg);
      setManualGgg(s.manualGgg);
      setIsVerbandsklage(s.isVerbandsklage);
      setServices(s.services);

      // Criminal
      setCourtType(s.courtType);
      setStrafServices(s.strafServices);
      setStrafStreitgenossen(s.strafStreitgenossen);
      setErfolgszuschlagProzent(s.erfolgszuschlagProzent);

      // Detention
      setHaftBmglStufe(s.haftBmglStufe);
      setHaftServices(s.haftServices);

      // VStraf
      setVstrafStufe(s.vstrafStufe);
      setVstrafVerfallswert(s.vstrafVerfallswert);
      setVstrafServices(s.vstrafServices);
      setVstrafStreitgenossen(s.vstrafStreitgenossen);
      setVstrafErfolgszuschlag(s.vstrafErfolgszuschlag);
    };
    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    // Bestimme die korrekten Werte je nach Modus
    const effectiveBmgl = caseMode === CaseMode.VSTRAF
      ? vstrafBmgl / 100  // vstrafBmgl ist in Cents
      : caseMode === CaseMode.DETENTION
        ? haftBmgl / 100  // haftBmgl ist in Cents
        : caseMode === CaseMode.CRIMINAL
          ? strafBmgl / 100  // strafBmgl ist in Cents
          : bmgl;

    const haftBmglLabels: Record<string, string> = {
      'BG': 'Bezirksgericht',
      'ER_GH': 'Einzelrichter Gerichtshof',
      'SCHOEFFEN': 'Schöffengericht',
      'GESCHWORENEN': 'Geschworenengericht',
    };

    generateKostenverzeichnisPDF(
      results,
      effectiveBmgl,
      additionalParties,
      isVatFree,
      showSubtotals,
      procedureType,
      {
        caseMode,
        haftBmglStufe: haftBmglStufe,
        haftBmglLabel: haftBmglLabels[haftBmglStufe],
        courtType: courtType,
        courtTypeLabel: COURT_TYPE_LABELS[courtType],
        vstrafStufe: vstrafStufe,
        vstrafStufeLabel: VSTRAF_STUFE_LABELS[vstrafStufe],
        vstrafVerfallswert: vstrafVerfallswert,
        caseMetadata: caseMetadata,
      }
    );
  };

  return (
    <div className="min-h-screen w-full px-4 py-8 md:px-8 lg:py-16 text-slate-900 overflow-x-hidden">
      <InfoModal line={activeInfo} onClose={() => setActiveInfo(null)} />
      {showValuationModal && (
        <ValuationModal
          mode={caseMode === CaseMode.CIVIL ? 'civil' : 'criminal'}
          onClose={() => setShowValuationModal(false)}
          onApply={(value) => {
            setBmgl(value);
            setShowValuationModal(false);
          }}
        />
      )}

      {/* Pro-Wiki Modal */}
      <ProWikiModal
        isOpen={showWiki}
        onClose={() => setShowWiki(false)}
      />

      {/* Dynamic Background - GPU optimiert */}
      <div className="fixed inset-0 -z-20 bg-slate-950">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/15 blur-[120px] rounded-full animate-blob will-change-transform"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/15 blur-[120px] rounded-full animate-blob animation-delay-2000 will-change-transform"></div>
      </div>

      <div className="mx-auto max-w-7xl space-y-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1 text-[10px] font-black tracking-[0.2em] text-blue-400 border border-blue-500/20 uppercase backdrop-blur-md">
              <Scale className="h-3 w-3" /> Tarifstand Mai 2023 / April 2025
            </div>
            <h1 className="text-6xl font-black text-white tracking-tighter">
              Kosten<span className="text-blue-500">Kalkulator</span>
            </h1>

            {/* Zivil/Straf Mode Switch - nur im Editor */}
            {view === 'editor' && (
              <div className="flex p-1.5 gap-1 bg-slate-800/80 rounded-2xl border border-white/10 w-fit">
                <button
                  onClick={() => setCaseMode(CaseMode.CIVIL)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    caseMode === CaseMode.CIVIL
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Scale className="h-4 w-4" />
                  Zivilrecht
                </button>
                <button
                  onClick={() => setCaseMode(CaseMode.CRIMINAL)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    caseMode === CaseMode.CRIMINAL
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Gavel className="h-4 w-4" />
                  Strafrecht
                </button>
                <button
                  onClick={() => setCaseMode(CaseMode.DETENTION)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    caseMode === CaseMode.DETENTION
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Lock className="h-4 w-4" />
                  Haftrecht
                </button>
                <button
                  onClick={() => setCaseMode(CaseMode.VSTRAF)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    caseMode === CaseMode.VSTRAF
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  V-Straf
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            {view === 'editor' ? (
              <>
                <button
                  onClick={handleBackToList}
                  className="flex items-center gap-2 px-4 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/10"
                >
                  <ArrowLeft className="h-5 w-5" /> Zurück
                </button>
                <button
                  onClick={() => setShowWiki(true)}
                  className="flex items-center gap-2 px-4 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/10"
                >
                  <BookOpen className="h-5 w-5" /> Wiki
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-600/20"
                >
                  <Download className="h-5 w-5" /> PDF Export
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowWiki(true)}
                className="flex items-center gap-2 px-4 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/10"
              >
                <BookOpen className="h-5 w-5" /> Wiki
              </button>
            )}
          </div>
        </header>

        {/* LISTE oder EDITOR */}
        {view === 'list' ? (
          <KostennotenList
            kostennoten={kostennoten}
            onEdit={handleEditKostennote}
            onDelete={handleDeleteKostennote}
            onNew={handleNewKostennote}
            onImport={handleImportKostennoten}
            onExportAll={handleExportAllKostennoten}
          />
        ) : (
          <>
            {/* Falldaten-Formular */}
            <CaseMetadataForm
              metadata={caseMetadata}
              onChange={setCaseMetadata}
              onKanzleiChange={handleKanzleiChange}
            />

            <div className="grid gap-8 lg:grid-cols-12">
          {/* Settings & Service Cards - Left Column (scrollable) */}
          <div className="lg:col-span-5 space-y-6">
            <GlassCard variant="light" title={caseMode === CaseMode.CRIMINAL ? "Strafverfahren" : caseMode === CaseMode.DETENTION ? "Haftverfahren" : caseMode === CaseMode.VSTRAF ? "Verwaltungsstrafsachen" : "Zivilverfahren"} className={`ring-1 ${caseMode === CaseMode.CRIMINAL ? 'ring-red-500/30' : caseMode === CaseMode.DETENTION ? 'ring-amber-500/30' : caseMode === CaseMode.VSTRAF ? 'ring-orange-500/30' : 'ring-white/20'}`}>
              <div className="space-y-6">

                {/* === STRAF-MODUS === */}
                {caseMode === CaseMode.CRIMINAL && (
                  <>
                    {/* Gerichtstyp */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 flex items-center gap-2">
                        <Building2 className="h-3 w-3" /> Gerichtstyp (§ 9 AHK)
                      </label>
                      <select
                        value={courtType}
                        onChange={(e) => {
                          setCourtType(e.target.value as CourtType);
                          // Karten bleiben bestehen, nur Gerichtstyp ändert sich
                        }}
                        className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl px-4 py-4 font-bold text-slate-800 appearance-none outline-none focus:ring-2 focus:ring-red-500/20 transition-all cursor-pointer"
                      >
                        <option value="BG">Bezirksgericht</option>
                        <option value="ER_GH">Einzelrichter Gerichtshof</option>
                        <option value="SCHOEFFEN">Schöffengericht / ER § 61</option>
                        <option value="GESCHWORENEN">Geschworenengericht</option>
                        <option value="HAFT">Haftverfahren</option>
                      </select>
                    </div>

                    {/* Streitgenossen (30% × n, KEIN LIMIT) */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 flex items-center gap-2">
                        <Users className="h-3 w-3" /> Streitgenossen (§ 10 Abs 3)
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setStrafStreitgenossen(Math.max(0, strafStreitgenossen - 1))}
                          className="w-10 h-10 rounded-xl bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 font-bold text-lg shadow-sm active:scale-95 transition-transform"
                        >−</button>
                        <input
                          type="number"
                          min="0"
                          value={strafStreitgenossen}
                          onChange={e => setStrafStreitgenossen(Math.max(0, Number(e.target.value)))}
                          className="w-20 bg-slate-100/50 border border-slate-200 rounded-xl px-3 py-3 text-lg font-bold text-center shadow-sm"
                        />
                        <button
                          onClick={() => setStrafStreitgenossen(strafStreitgenossen + 1)}
                          className="w-10 h-10 rounded-xl bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 font-bold text-lg shadow-sm active:scale-95 transition-transform"
                        >+</button>
                        <span className="text-sm font-bold text-slate-500 ml-2">
                          +{strafStreitgenossen * 30}%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">30% pro weiterer Person, kein Limit</p>
                    </div>

                    {/* Erfolgszuschlag (0-50%) */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 flex items-center gap-2">
                        <Award className="h-3 w-3" /> Erfolgszuschlag (§ 10)
                      </label>
                      <div className="space-y-2">
                        <input
                          type="range"
                          min="0"
                          max="50"
                          step="5"
                          value={erfolgszuschlagProzent}
                          onChange={e => setErfolgszuschlagProzent(Number(e.target.value))}
                          className="w-full accent-red-500"
                        />
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">0%</span>
                          <span className="text-lg font-black text-red-600">{erfolgszuschlagProzent}%</span>
                          <span className="text-slate-400">50%</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Bei Freispruch/Einstellung</p>
                    </div>

                    {/* Umsatzsteuer Toggle */}
                    <div className="pt-4 border-t border-slate-200/50">
                      <button
                        onClick={() => setIsVatFree(!isVatFree)}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 ${isVatFree ? 'bg-amber-500/10 border-amber-500/30 text-amber-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
                      >
                        <div className="flex items-center gap-3 text-left">
                          <div className={`p-2 rounded-xl ${isVatFree ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                            <ShieldCheck className="h-4 w-4" />
                          </div>
                          <div className="text-[10px] font-black uppercase tracking-wider leading-none">Umsatzsteuerfrei</div>
                        </div>
                      </button>
                    </div>

                    {/* Tarif-Info Footer Straf */}
                    <div className="pt-4 border-t border-slate-200/50 space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                        <Info className="h-3 w-3" />
                        <span>AHK § 10 Info</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Gerichtstyp</span>
                        <span className="font-mono font-bold text-slate-700">{COURT_TYPE_LABELS[courtType]}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Fixe Bemessungsgrundlage</span>
                        <span className="font-mono font-bold text-red-600">{formatEuro(strafBmgl)}</span>
                      </div>
                      {strafStreitgenossen > 0 && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Streitgenossenzuschlag</span>
                          <span className="font-mono font-bold text-amber-600">+{strafStreitgenossen * 30}%</span>
                        </div>
                      )}
                      {erfolgszuschlagProzent > 0 && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Erfolgszuschlag</span>
                          <span className="font-mono font-bold text-emerald-600">+{erfolgszuschlagProzent}%</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* === HAFT-MODUS === */}
                {caseMode === CaseMode.DETENTION && (
                  <>
                    {/* BMGL-Stufe nach Ausgangsverfahren */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest block mb-2 flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5" /> Ausgangsverfahren (§ 10 Abs 1 AHK)
                      </label>
                      <select
                        value={haftBmglStufe}
                        onChange={(e) => setHaftBmglStufe(e.target.value as HaftBmglStufe)}
                        className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-4 font-bold text-slate-900 appearance-none outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all cursor-pointer shadow-sm"
                      >
                        <option value="BG">Bezirksgericht (€ 7.800)</option>
                        <option value="ER_GH">Einzelrichter Gerichtshof (€ 18.000)</option>
                        <option value="SCHOEFFEN">Schöffengericht (€ 27.600)</option>
                        <option value="GESCHWORENEN">Geschworenengericht (€ 33.200)</option>
                      </select>
                    </div>

                    {/* Haft-Tarifübersicht */}
                    <div className="space-y-4">
                      {/* RATG Tarife für Haftrecht - DYNAMISCH nach BMGL */}
                      {(() => {
                        // Berechne die korrekten RATG-Tarife für die aktuelle BMGL
                        const tp72Result = getKommission(haftBmgl, 1, 0, true); // TP 7/2: mitRA=true
                        const tp3aResult = getTariffBase(haftBmgl, 'TP3A');
                        const tp3bResult = getTariffBase(haftBmgl, 'TP3B');
                        const tp2Result = getTariffBase(haftBmgl, 'TP2');

                        return (
                          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-200/50 shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[10px] font-black uppercase tracking-widest text-blue-800">RATG Tarife (§ 10 AHK)</span>
                              <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">BMGL € {(haftBmgl / 100).toLocaleString('de-AT')}</span>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-700">Besuch Haftanstalt (TP 7/2)</span>
                                <span className="font-mono font-bold text-blue-900">€ {(tp72Result.kommission / 100).toFixed(2).replace('.', ',')} / ½h</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-700">Enthaftungsantrag (TP 3A)</span>
                                <span className="font-mono font-bold text-blue-900">€ {(tp3aResult.base / 100).toFixed(2).replace('.', ',')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-700">Haftbeschwerde (TP 3B)</span>
                                <span className="font-mono font-bold text-blue-900">€ {(tp3bResult.base / 100).toFixed(2).replace('.', ',')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-700">Kurzantrag (TP 2)</span>
                                <span className="font-mono font-bold text-blue-900">€ {(tp2Result.base / 100).toFixed(2).replace('.', ',')}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* AHK § 9 Z 5 Fixsätze - IMMER GLEICH für Haftverfahren */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-300/50 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">§ 9 Z 5 AHK Fixsätze</span>
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded">Haft-spezifisch</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-700">Haftverhandlung 1. Instanz</span>
                            <span className="font-mono font-bold text-amber-900">€ 364 / € 182</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-700">Grundrechtsbeschwerde</span>
                            <span className="font-mono font-bold text-amber-900">€ 786</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-700">Sonstige Haftbeschwerde</span>
                            <span className="font-mono font-bold text-amber-900">€ 564</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-700">Haftverhandlung 2. Instanz</span>
                            <span className="font-mono font-bold text-amber-900">€ 564 / € 282</span>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-amber-200/50 text-[10px] text-amber-700 italic">
                          Diese Sätze gelten fix für alle Haftverfahren unabhängig vom Ausgangsverfahren.
                        </div>
                      </div>

                      {/* Barauslagen */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 shadow-sm">
                        <div className="mb-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Barauslagen (TP 9)</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-700">Kilometergeld (TP 9/3)</span>
                            <span className="font-mono font-bold text-slate-800">€ 0,50 / km</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-700">Reisezeit (TP 9/4)</span>
                            <span className="font-mono font-bold text-slate-800">€ 33,90 / ½h</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* === V-STRAF-MODUS === */}
                {caseMode === CaseMode.VSTRAF && (
                  <>
                    {/* Strafdrohung (§ 13 Abs 1 AHK) */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest block mb-2 flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5" /> Strafdrohung (§ 13 Abs 1 AHK)
                      </label>
                      <select
                        value={vstrafStufe}
                        onChange={(e) => setVstrafStufe(e.target.value as VStrafStufe)}
                        className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-4 font-bold text-slate-900 appearance-none outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all cursor-pointer shadow-sm"
                      >
                        <optgroup label="Verwaltungsübertretungen">
                          <option value="Z1">bis € 730 (Z 1)</option>
                          <option value="Z2">bis € 2.180 (Z 2)</option>
                          <option value="Z3">€ 2.180 – € 4.360 (Z 3)</option>
                          <option value="Z4">über € 4.360 / + Haft (Z 4)</option>
                        </optgroup>
                        <optgroup label="Sonderverfahren">
                          <option value="Z5">Finanzstrafverfahren (Z 5)</option>
                        </optgroup>
                        <optgroup label="Disziplinarverfahren (Z 6)">
                          <option value="Z6A">Leicht</option>
                          <option value="Z6B">Mittel</option>
                          <option value="Z6C">Schwer</option>
                        </optgroup>
                      </select>
                    </div>

                    {/* Verfallswert (§ 13 Abs 3) */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest block mb-2 flex items-center gap-2">
                        <Euro className="h-3.5 w-3.5" /> Verfallswert (§ 13 Abs 3)
                      </label>
                      <div className="relative">
                        <Euro className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="number"
                          value={vstrafVerfallswert / 100}
                          onChange={(e) => setVstrafVerfallswert(Math.round(parseFloat(e.target.value || '0') * 100))}
                          className="w-full bg-white border border-slate-300 rounded-2xl pl-10 pr-4 py-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all"
                          min={0}
                          placeholder="0"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">Erhöht die Bemessungsgrundlage um diesen Betrag</span>
                    </div>

                    {/* Streitgenossen */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest block mb-2 flex items-center gap-2">
                        <Users className="h-3.5 w-3.5" /> Streitgenossen (§ 10 Abs 3)
                      </label>
                      <input
                        type="number"
                        value={vstrafStreitgenossen}
                        onChange={(e) => setVstrafStreitgenossen(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all"
                        min={0}
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">+30% pro weiterer Person</span>
                    </div>

                    {/* Erfolgszuschlag */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest block mb-2 flex items-center gap-2">
                        <Award className="h-3.5 w-3.5" /> Erfolgszuschlag (%)
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min={0}
                          max={50}
                          step={5}
                          value={vstrafErfolgszuschlag}
                          onChange={(e) => setVstrafErfolgszuschlag(parseInt(e.target.value))}
                          className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-orange-500"
                          style={{ background: `linear-gradient(to right, #f97316 ${vstrafErfolgszuschlag * 2}%, #e2e8f0 ${vstrafErfolgszuschlag * 2}%)` }}
                        />
                        <span className="w-16 text-right font-mono font-black text-orange-600 text-lg">{vstrafErfolgszuschlag}%</span>
                      </div>
                    </div>

                    {/* UST-frei Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-200/50 flex items-center justify-center">
                          <span className="text-lg font-black text-slate-600">%</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-800">UST-Befreiung</span>
                          <p className="text-[10px] text-slate-500">Kleinunternehmer / Auslandsverrechnung</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsVatFree(!isVatFree)}
                        className={`relative w-14 h-8 rounded-full transition-all duration-300 ${isVatFree ? 'bg-orange-500' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${isVatFree ? 'translate-x-6' : ''}`}></div>
                      </button>
                    </div>

                    {/* V-Straf-Tarifübersicht */}
                    <div className="space-y-4">
                      {(() => {
                        const courtType = getVStrafCourtType(vstrafStufe);
                        const tp72Result = getKommission(vstrafBmgl, 1, 0, true);
                        const tp3aResult = getTariffBase(vstrafBmgl, 'TP3A');
                        const tp3bResult = getTariffBase(vstrafBmgl, 'TP3B');

                        return (
                          <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/50 shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[10px] font-black uppercase tracking-widest text-orange-800">§ 13 AHK Tarife</span>
                              <span className="text-[10px] font-mono font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded">BMGL € {(vstrafBmgl / 100).toLocaleString('de-AT')}</span>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-700">Verhandlung (TP 7/2)</span>
                                <span className="font-mono font-bold text-orange-900">€ {(tp72Result.kommission / 100).toFixed(2).replace('.', ',')} / ½h</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-700">Anträge (TP 3A)</span>
                                <span className="font-mono font-bold text-orange-900">€ {(tp3aResult.base / 100).toFixed(2).replace('.', ',')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-700">Beschwerden (TP 3B)</span>
                                <span className="font-mono font-bold text-orange-900">€ {(tp3bResult.base / 100).toFixed(2).replace('.', ',')}</span>
                              </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-orange-200/50 text-[10px] text-orange-700 italic">
                              Stufe: {VSTRAF_STUFE_LABELS[vstrafStufe]}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </>
                )}

                {caseMode === CaseMode.CIVIL && (
                  <>
                    {/* === ZIVIL-MODUS (BESTEHEND) === */}
                    {/* Bemessungsgrundlage */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bemessungsgrundlage (€)</label>
                        <button
                          onClick={() => setShowValuationModal(true)}
                          className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border transition-all flex items-center gap-1.5 bg-amber-500 text-white border-amber-400 hover:bg-amber-600"
                        >
                          <Calculator className="h-2.5 w-2.5" />
                          Ermitteln (§§ 9, 10)
                        </button>
                      </div>
                      <div className="relative">
                        <Euro className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                          type="number"
                          value={bmgl}
                          onChange={(e) => setBmgl(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 font-black text-slate-800 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">Eur</div>
                      </div>
                    </div>

                {/* GGG Auto/Manual Toggle */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Pauschalgebühr (GGG)</label>
                    <button
                      onClick={() => setAutoGgg(!autoGgg)}
                      className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border transition-all flex items-center gap-1.5 ${autoGgg ? 'bg-blue-500 text-white border-blue-400' : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                    >
                      <RefreshCcw className={`h-2.5 w-2.5 ${autoGgg ? 'animate-spin-slow' : ''}`} />
                      {autoGgg ? 'Auto' : 'Manuell'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={autoGgg ? (gggInfo?.amount ? gggInfo.amount / 100 : 0) : manualGgg}
                      onChange={(e) => { setManualGgg(Number(e.target.value)); setAutoGgg(false); }}
                      disabled={autoGgg}
                      className={`w-full border rounded-2xl px-4 py-3 font-bold transition-all ${autoGgg ? 'bg-blue-50/50 border-blue-200 text-blue-600' : 'bg-slate-100/50 border-slate-200 text-slate-800'}`}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">Eur</div>
                  </div>
                  {autoGgg && gggInfo && (
                    <div className="mt-2 text-[10px] text-blue-600 font-bold">
                      {gggInfo.instanz} → {gggInfo.tarifpost}
                    </div>
                  )}
                </div>

                {/* Streitgenossen */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 flex items-center gap-2">
                    <Users className="h-3 w-3" /> Streitgenossen (§ 15)
                  </label>
                  <select
                    value={additionalParties}
                    onChange={(e) => setAdditionalParties(parseInt(e.target.value))}
                    className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl px-4 py-4 font-bold text-slate-800 appearance-none outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                  >
                    <option value={0}>Kein Zuschlag</option>
                    <option value={1}>1 weitere Person (+10%)</option>
                    <option value={2}>2 weitere Personen (+15%)</option>
                    <option value={3}>3 weitere Personen (+20%)</option>
                    <option value={4}>4 weitere Personen (+25%)</option>
                    <option value={5}>5 weitere Personen (+30%)</option>
                    <option value={9}>9+ weitere Personen (+50%)</option>
                  </select>
                </div>

                {/* Toggle Buttons */}
                <div className="pt-4 border-t border-slate-200/50 space-y-3">
                  <button
                    onClick={() => setIsVerbandsklage(!isVerbandsklage)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 ${isVerbandsklage ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className={`p-2 rounded-xl ${isVerbandsklage ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        <Scale className="h-4 w-4" />
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-wider leading-none">Verbandsklage (§§ 623 ff.)</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowSubtotals(!showSubtotals)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 ${showSubtotals ? 'bg-blue-500/10 border-blue-500/30 text-blue-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className={`p-2 rounded-xl ${showSubtotals ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        <Layers className="h-4 w-4" />
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-wider leading-none">Zwischensummen</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setIsVatFree(!isVatFree)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 ${isVatFree ? 'bg-amber-500/10 border-amber-500/30 text-amber-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className={`p-2 rounded-xl ${isVatFree ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-wider leading-none">Umsatzsteuerfrei</div>
                    </div>
                  </button>
                </div>

                {/* Tarif-Info Footer */}
                <div className="mt-4 p-4 bg-slate-100 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-widest">
                    <Info className="h-4 w-4" />
                    <span>Tarif-Info</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-medium">RATG Tarifstufe</span>
                    <span className="font-mono font-bold text-slate-800">{tariffInfo.label}</span>
                  </div>
                  {gggInfo && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 font-medium">GGG ({gggInfo.instanz})</span>
                      <span className="font-mono font-bold text-blue-700">{gggInfo.tarifpost} {formatEuro(gggInfo.amount)}</span>
                    </div>
                  )}
                  {!gggInfo && autoGgg && services.length === 0 && (
                    <div className="text-sm text-slate-500 italic">
                      GGG wird berechnet sobald Leistungen hinzugefügt werden
                    </div>
                  )}
                </div>
                  </>
                )}
              </div>
            </GlassCard>

            {/* Service Cards Header - Zivil */}
            {caseMode === CaseMode.CIVIL && services.length > 0 && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {services.length} Leistung{services.length !== 1 ? 'en' : ''}
                </span>
                {services.length > 1 && (
                  <button
                    onClick={sortServicesByDate}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all"
                    title="Nach Datum sortieren (neueste zuerst)"
                  >
                    <ArrowUpDown className="h-3 w-3" />
                    Nach Datum
                  </button>
                )}
              </div>
            )}
            {/* Service Cards - Zivil (nur wenn nicht Straf-Modus) */}
            {caseMode === CaseMode.CIVIL && (
            <div className="space-y-3">
              {services.map((s, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === services.length - 1;
                return (
                <GlassCard key={s.id} className="!p-4 relative group/item" variant="light">
                  {/* Action Buttons: Move + Delete */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 z-20">
                    {services.length > 1 && (
                      <>
                        <button
                          onClick={() => moveServiceUp(s.id)}
                          disabled={isFirst}
                          className={`p-1 rounded-lg border transition-colors ${isFirst ? 'text-slate-300 bg-slate-100 border-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-blue-600 bg-white/40 border-white/40 hover:border-blue-300'}`}
                          title="Nach oben"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => moveServiceDown(s.id)}
                          disabled={isLast}
                          className={`p-1 rounded-lg border transition-colors ${isLast ? 'text-slate-300 bg-slate-100 border-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-blue-600 bg-white/40 border-white/40 hover:border-blue-300'}`}
                          title="Nach unten"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => removeService(s.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors bg-white/40 p-1 rounded-lg border border-white/40"
                      title="Löschen"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3 relative z-10">
                    {/* Header: Date + Type Badge */}
                    <div className="flex items-center gap-2 pr-24">
                      <input
                        type="date"
                        value={s.date}
                        onChange={e => updateService(s.id, { date: e.target.value })}
                        className="bg-white/40 border-none rounded-lg px-2 py-1 text-[11px] font-bold shadow-sm w-28"
                      />
                      {/* TP Badge - Blau für Schriftsätze, Amber für Termine, Grün für Entschädigung */}
                      {(() => {
                        const catalogEntry = SERVICE_CATALOG.find(cat => cat.short === s.label);
                        const isTermin = catalogEntry?.category === 'TERMINE' || s.type.includes('HEARING');
                        const isEntschaedigung = catalogEntry?.category === 'ENTSCHAEDIGUNG';
                        const badgeColor = isTermin ? 'bg-amber-500' : isEntschaedigung ? 'bg-emerald-500' : 'bg-blue-500';
                        return (
                          <span className={`px-2 py-1 rounded-lg ${badgeColor} text-white text-[10px] font-black shrink-0`}>
                            {catalogEntry?.tp || 'TP?'}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Service Select - Custom Dropdown (eigene Zeile) */}
                    <div className="relative">
                          <button
                            onClick={() => setOpenServiceDropdown(openServiceDropdown === s.id ? null : s.id)}
                            className="w-full bg-slate-800 border-none rounded-xl px-3 py-2 text-sm font-bold text-white text-left cursor-pointer pr-8 shadow-lg ring-1 ring-white/10 hover:bg-slate-700 transition-colors"
                          >
                            {s.label || 'Leistung wählen...'}
                          </button>
                          <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none transition-transform ${openServiceDropdown === s.id ? 'rotate-180' : ''}`} />

                          {/* Custom Dropdown */}
                          {openServiceDropdown === s.id && (
                            <div className="absolute top-full left-0 right-0 z-50 mt-2 p-3 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl backdrop-blur-3xl max-h-[400px] overflow-y-auto custom-scrollbar">
                              {/* Schriftsätze */}
                              <div className="text-[11px] font-black text-blue-400 uppercase tracking-widest px-2 py-1 mb-1">
                                Schriftsätze
                              </div>
                              {SERVICE_CATALOG.filter(c => c.category === 'SCHRIFTSAETZE').map(cat => (
                                <button
                                  key={cat.id}
                                  onClick={() => {
                                    updateService(s.id, {
                                      label: cat.short,
                                      type: cat.type,
                                      esMultiplier: (cat.type === ServiceType.PLEADING_TP3A_I || cat.type === ServiceType.PLEADING_TP3B || cat.type.includes('HEARING')) ? 2 : 1,
                                      includeErv: cat.type.startsWith('PLEADING')
                                    });
                                    setOpenServiceDropdown(null);
                                  }}
                                  className="w-full text-left p-2 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                  <span className="text-sm font-medium text-white/90 hover:text-blue-400">
                                    <span className="text-blue-400 font-bold">{cat.tp}</span> - {cat.short}
                                  </span>
                                </button>
                              ))}

                              {/* Termine */}
                              <div className="text-[11px] font-black text-amber-400 uppercase tracking-widest px-2 py-1 mt-3 mb-1">
                                Termine / Tagsatzungen
                              </div>
                              {SERVICE_CATALOG.filter(c => c.category === 'TERMINE').map(cat => (
                                <button
                                  key={cat.id}
                                  onClick={() => {
                                    updateService(s.id, {
                                      label: cat.short,
                                      type: cat.type,
                                      esMultiplier: (cat.type === ServiceType.PLEADING_TP3A_I || cat.type === ServiceType.PLEADING_TP3B || cat.type.includes('HEARING')) ? 2 : 1,
                                      includeErv: cat.type.startsWith('PLEADING')
                                    });
                                    setOpenServiceDropdown(null);
                                  }}
                                  className="w-full text-left p-2 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                  <span className="text-sm font-medium text-white/90 hover:text-amber-400">
                                    <span className="text-amber-400 font-bold">{cat.tp}</span> - {cat.short}
                                  </span>
                                </button>
                              ))}

                              {/* Entschädigung */}
                              <div className="text-[11px] font-black text-emerald-400 uppercase tracking-widest px-2 py-1 mt-3 mb-1">
                                Entschädigung (TP 9)
                              </div>
                              {SERVICE_CATALOG.filter(c => c.category === 'ENTSCHAEDIGUNG').map(cat => (
                                <button
                                  key={cat.id}
                                  onClick={() => {
                                    updateService(s.id, {
                                      label: cat.short,
                                      type: cat.type,
                                      esMultiplier: (cat.type === ServiceType.PLEADING_TP3A_I || cat.type === ServiceType.PLEADING_TP3B || cat.type.includes('HEARING')) ? 2 : 1,
                                      includeErv: cat.type.startsWith('PLEADING')
                                    });
                                    setOpenServiceDropdown(null);
                                  }}
                                  className="w-full text-left p-2 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                  <span className="text-sm font-medium text-white/90 hover:text-emerald-400">
                                    <span className="text-emerald-400 font-bold">{cat.tp}</span> - {cat.short}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                    {/* Label Input - Compact */}
                    <input
                      type="text"
                      value={s.label}
                      onChange={e => updateService(s.id, { label: e.target.value })}
                      className="w-full bg-slate-900/5 border-none rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 shadow-inner"
                      placeholder="Bezeichnung..."
                    />

                    {/* HEARING-spezifische Felder */}
                    {s.type.includes('HEARING') && (() => {
                      const tsType = getTagsatzungType(s.type);
                      const serviceBmgl = (s.customBmgl ?? bmgl) * 100;
                      const serviceParties = s.customParties ?? additionalParties;
                      // durationHours bei HEARINGs = Anzahl halbe Stunden (nicht ganze Stunden!)
                      const halbeStundenDauer = s.durationHours || 2;
                      const halbeStundenWartezeit = s.waitingUnits || 0;

                      // TP7 Kommissionen: Sonderbehandlung
                      const isTP7 = s.tp === 'TP7';
                      const isTP8 = s.tp === 'TP8';
                      // TP7 hat max. einfachen ES, TP8 keinen ES
                      const tp7MaxES = isTP7 ? 1 : (isTP8 ? 0 : 2);

                      // Berechnung
                      const tsResult = tsType ? getTagsatzung(serviceBmgl, tsType, halbeStundenDauer, halbeStundenWartezeit) : null;
                      const tariffInfo = tsType ? getTariffBase(serviceBmgl, tsType) : null;

                      // 1. Entlohnung + Wartezeit = Basis für ES
                      let entlohnung = tsResult?.entlohnung || 0;

                      // TP7: Eigene Berechnung basierend auf TP 7/1 (Gehilfe) oder TP 7/2 (RA/RAA)
                      // TP 7/1 = TP6-Rate, TP 7/2 = 2× TP6-Rate
                      if (isTP7) {
                        // TP7 Tarife aus wiki-data.ts nutzen (vereinfacht: lookup)
                        const tp7Tabelle = [
                          { bis: 70, gehilfe: 840, raRaa: 1680 },
                          { bis: 180, gehilfe: 1120, raRaa: 2240 },
                          { bis: 360, gehilfe: 1260, raRaa: 2520 },
                          { bis: 730, gehilfe: 1500, raRaa: 3000 },
                          { bis: 1820, gehilfe: 1840, raRaa: 3680 },
                          { bis: 2910, gehilfe: 2160, raRaa: 4320 },
                          { bis: 4360, gehilfe: 2820, raRaa: 5640 },
                          { bis: 5810, gehilfe: 3480, raRaa: 6960 },
                          { bis: 7260, gehilfe: 4140, raRaa: 8280 },
                          { bis: 8710, gehilfe: 4800, raRaa: 9600 },
                          { bis: 10160, gehilfe: 5460, raRaa: 10920 },
                          { bis: 36260, gehilfe: 17340, raRaa: 34680 },
                          { bis: 43510, gehilfe: 20640, raRaa: 41280 },
                          { bis: Infinity, gehilfe: 20820, raRaa: 41610 }, // Maximum
                        ];
                        const row = tp7Tabelle.find(r => serviceBmgl <= r.bis * 100) || tp7Tabelle[tp7Tabelle.length - 1];
                        const ratePerHalf = s.isRaRaaErforderlich ? row.raRaa : row.gehilfe;
                        entlohnung = ratePerHalf * halbeStundenDauer;
                      }

                      const wartezeit = tsResult?.wartezeit || 0;
                      const basisFuerES = entlohnung + wartezeit;

                      // 2. ES-Zuschlag auf (Entlohnung + Wartezeit)
                      // TP7: max. einfacher ES, TP8: kein ES
                      const effectiveEsMultiplier = Math.min(s.esMultiplier, tp7MaxES);
                      const esRate = effectiveEsMultiplier === 0 ? 0 : effectiveEsMultiplier === 1 ? (serviceBmgl <= 1017000 ? 0.6 : 0.5) : (serviceBmgl <= 1017000 ? 1.2 : 1.0);
                      const esZuschlag = Math.round(basisFuerES * esRate);

                      // 3. Zwischensumme = Basis + ES
                      const zwischensumme = basisFuerES + esZuschlag;

                      // 4. Streitgenossen-Zuschlag auf Zwischensumme
                      const sgPercent = serviceParties === 1 ? 10 : serviceParties === 2 ? 15 : serviceParties === 3 ? 20 : serviceParties === 4 ? 25 : serviceParties === 5 ? 30 : serviceParties >= 9 ? 50 : 0;
                      const sgZuschlag = Math.round(zwischensumme * sgPercent / 100);

                      // 5. Netto = Zwischensumme + SG
                      const nettoSumme = zwischensumme + sgZuschlag;
                      const ust = Math.round(nettoSumme * 0.2);
                      const bruttoSumme = nettoSumme + ust;

                      return (
                        <div className="space-y-4 pt-2">
                          {/* Eingabefelder Grid */}
                          <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-3 items-center">
                            {/* Streitwert */}
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Streitwert</label>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-500 font-bold">€</span>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={(s.customBmgl ?? bmgl).toLocaleString('de-AT')}
                                onChange={e => {
                                  const raw = e.target.value.replace(/\./g, '').replace(/,/g, '');
                                  updateService(s.id, { customBmgl: Number(raw) || bmgl });
                                }}
                                className="w-28 bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-sm font-bold text-right text-slate-700 shadow-[0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.8)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 outline-none transition-all"
                              />
                            </div>

                            {/* Dauer (in halben Stunden) */}
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Dauer</label>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateService(s.id, { durationHours: Math.max(1, halbeStundenDauer - 1) })}
                                className="w-9 h-9 rounded-xl bg-gradient-to-b from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border border-slate-300/50 flex items-center justify-center text-slate-600 font-bold text-lg shadow-[0_2px_4px_rgba(0,0,0,0.08)] active:shadow-inner active:scale-95 transition-all"
                              >−</button>
                              <input
                                type="number"
                                min="1"
                                value={halbeStundenDauer}
                                onChange={e => updateService(s.id, { durationHours: Math.max(1, Number(e.target.value)) })}
                                className="w-14 bg-white border border-slate-200/80 rounded-xl px-2 py-2 text-sm font-bold text-center text-slate-700 shadow-[0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.8)]"
                              />
                              <button
                                onClick={() => updateService(s.id, { durationHours: halbeStundenDauer + 1 })}
                                className="w-9 h-9 rounded-xl bg-gradient-to-b from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border border-slate-300/50 flex items-center justify-center text-slate-600 font-bold text-lg shadow-[0_2px_4px_rgba(0,0,0,0.08)] active:shadow-inner active:scale-95 transition-all"
                              >+</button>
                              <span className="text-sm text-slate-600 font-bold ml-1">½ Std.</span>
                            </div>

                            {/* Wartezeit (in halben Stunden) */}
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Wartezeit</label>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateService(s.id, { waitingUnits: Math.max(0, halbeStundenWartezeit - 1) })}
                                className="w-9 h-9 rounded-xl bg-gradient-to-b from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border border-slate-300/50 flex items-center justify-center text-slate-600 font-bold text-lg shadow-[0_2px_4px_rgba(0,0,0,0.08)] active:shadow-inner active:scale-95 transition-all"
                              >−</button>
                              <input
                                type="number"
                                min="0"
                                value={halbeStundenWartezeit}
                                onChange={e => updateService(s.id, { waitingUnits: Math.max(0, Number(e.target.value)) })}
                                className="w-14 bg-white border border-slate-200/80 rounded-xl px-2 py-2 text-sm font-bold text-center text-slate-700 shadow-[0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.8)]"
                              />
                              <button
                                onClick={() => updateService(s.id, { waitingUnits: halbeStundenWartezeit + 1 })}
                                className="w-9 h-9 rounded-xl bg-gradient-to-b from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border border-slate-300/50 flex items-center justify-center text-slate-600 font-bold text-lg shadow-[0_2px_4px_rgba(0,0,0,0.08)] active:shadow-inner active:scale-95 transition-all"
                              >+</button>
                              <span className="text-sm text-slate-600 font-bold ml-1">½ Std.</span>
                            </div>

                            {/* Streitgenossen */}
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5" /> Streitgenossen
                            </label>
                            <select
                              value={serviceParties}
                              onChange={e => updateService(s.id, { customParties: parseInt(e.target.value) })}
                              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 shadow-sm cursor-pointer focus:ring-2 focus:ring-blue-500/20 outline-none"
                            >
                              <option value={0}>Kein Zuschlag</option>
                              <option value={1}>+1 Person (+10%)</option>
                              <option value={2}>+2 Personen (+15%)</option>
                              <option value={3}>+3 Personen (+20%)</option>
                              <option value={4}>+4 Personen (+25%)</option>
                              <option value={5}>+5 Personen (+30%)</option>
                              <option value={9}>+9 Personen (+50%)</option>
                            </select>
                          </div>

                          {/* TP7 Toggle: RA/RAA erforderlich (TP 7/1 vs TP 7/2) */}
                          {isTP7 && (
                            <div className="space-y-2">
                              <button
                                onClick={() => updateService(s.id, { isRaRaaErforderlich: !s.isRaRaaErforderlich })}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${s.isRaRaaErforderlich ? 'bg-blue-50 border-blue-300' : 'bg-slate-100 border-slate-200'}`}
                              >
                                <div className="flex items-center gap-2 text-left">
                                  <div className={`w-5 h-5 rounded-md flex items-center justify-center ${s.isRaRaaErforderlich ? 'bg-blue-600 text-white' : 'bg-slate-300'}`}>
                                    {s.isRaRaaErforderlich && <span className="text-xs font-bold">✓</span>}
                                  </div>
                                  <span className={`text-xs font-bold uppercase tracking-wide ${s.isRaRaaErforderlich ? 'text-slate-700' : 'text-slate-500'}`}>RA/RAA erforderlich</span>
                                </div>
                                <span className={`text-[10px] font-black px-2 py-1 rounded ${s.isRaRaaErforderlich ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                                  {s.isRaRaaErforderlich ? 'TP 7/2' : 'TP 7/1'}
                                </span>
                              </button>
                              <div className="text-[11px] text-slate-600 px-1">
                                {s.isRaRaaErforderlich
                                  ? 'TP 7/2: Exekutionsvollzug, Aktenstudium bei Behörden, außergerichtl. Augenscheine, Besuch in Haftanstalt'
                                  : 'TP 7/1: Geschäfte durch Gehilfen (niedrigerer Satz)'}
                              </div>
                            </div>
                          )}

                          {/* ES Multiplier für Tagsatzungen */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Einheitssatz</span>
                              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${isTP8 ? 'text-red-700 bg-red-100 border-red-300' : isTP7 ? 'text-blue-700 bg-blue-100 border-blue-300' : 'text-blue-600 bg-blue-50 border-blue-100'}`}>
                                {isTP8 ? 'KEINER' : effectiveEsMultiplier === 0 ? 'keiner' : effectiveEsMultiplier === 1 ? 'einfach' : 'doppelt'}
                              </span>
                            </div>
                            {isTP8 ? (
                              <div className="flex p-3 bg-red-50/50 rounded-xl border border-red-200/50 text-xs text-red-600">
                                Kein Einheitssatz bei TP 8 (§ 23 Abs. 1 RATG)
                              </div>
                            ) : (
                            <div className="flex p-1 gap-1 bg-slate-200/60 rounded-xl shadow-inner">
                              {[
                                { val: 0, label: 'keiner' },
                                { val: 1, label: 'einfach' },
                                ...(isTP7 ? [] : [{ val: 2, label: 'doppelt' }])
                              ].map((opt) => (
                                <button
                                  key={opt.val}
                                  onClick={() => updateService(s.id, { esMultiplier: opt.val })}
                                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${s.esMultiplier === opt.val ? 'text-blue-700 bg-white shadow-sm ring-1 ring-blue-500/20' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                            )}
                            {isTP7 && (
                              <div className="text-[11px] text-slate-600 font-medium px-1">
                                TP 7: Max. einfacher Einheitssatz (§ 23 Abs. 1 RATG)
                              </div>
                            )}
                          </div>

                          {/* ERGEBNIS-SEKTION */}
                          {tsResult && tariffInfo && (
                            <div className="mt-2 p-4 bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl border border-blue-200/50 space-y-3">
                              <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                Ergebnis {tsType} RATG
                              </div>

                              <div className="space-y-2">
                                {/* Tarifstufe */}
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500">Tarifstufe</span>
                                  <span className="font-mono text-xs font-bold text-slate-700">{tariffInfo.label}</span>
                                </div>

                                {/* 1. Entlohnung */}
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500">Entlohnung ({halbeStundenDauer} × ½ Std.)</span>
                                  <span className="font-mono text-xs font-bold text-slate-700">{formatEuro(entlohnung)}</span>
                                </div>

                                {/* 2. Wartezeit (falls vorhanden) */}
                                {halbeStundenWartezeit > 0 && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-500">Wartezeit ({halbeStundenWartezeit} × ½ Std.)</span>
                                    <span className="font-mono text-xs font-bold text-slate-700">{formatEuro(wartezeit)}</span>
                                  </div>
                                )}

                                {/* 3. ES-Zuschlag (auf Entlohnung + Wartezeit) */}
                                {s.esMultiplier > 0 && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-500">+ ES ({s.esMultiplier === 1 ? 'einfach' : 'doppelt'})</span>
                                    <span className="font-mono text-xs font-bold text-slate-700">{formatEuro(esZuschlag)}</span>
                                  </div>
                                )}

                                {/* 4. Streitgenossen-Zuschlag */}
                                {sgPercent > 0 && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-500">+ § 15 Zuschlag ({sgPercent}%)</span>
                                    <span className="font-mono text-xs font-bold text-amber-600">{formatEuro(sgZuschlag)}</span>
                                  </div>
                                )}
                              </div>

                              <div className="border-t border-blue-200/50 pt-3 space-y-2">
                                {/* 5. Summe Netto */}
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-600 font-medium">Summe netto</span>
                                  <span className="font-mono text-sm font-bold text-slate-800">{formatEuro(nettoSumme)}</span>
                                </div>

                                {/* 6. USt */}
                                {!isVatFree && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-500">20% USt.</span>
                                    <span className="font-mono text-xs font-bold text-slate-600">{formatEuro(ust)}</span>
                                  </div>
                                )}

                                {/* 7. Summe Brutto */}
                                <div className="flex justify-between items-center pt-1">
                                  <span className="text-sm font-bold text-blue-700">Summe brutto</span>
                                  <span className="font-mono text-lg font-black text-blue-700">{formatEuro(isVatFree ? nettoSumme : bruttoSumme)}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* SCHRIFTSATZ-spezifische Felder (NICHT für HEARINGs) */}
                    {!s.type.includes('HEARING') && (() => {
                      const serviceBmgl = (s.customBmgl ?? bmgl) * 100;
                      const serviceParties = s.customParties ?? additionalParties;
                      const sgPercent = serviceParties === 1 ? 10 : serviceParties === 2 ? 15 : serviceParties === 3 ? 20 : serviceParties === 4 ? 25 : serviceParties === 5 ? 30 : serviceParties >= 9 ? 50 : 0;

                      // Tarif-Typ ermitteln
                      const isTP3B = s.type === ServiceType.PLEADING_TP3B || s.type === ServiceType.PLEADING_TP3B_IA;
                      const isTP3C = s.type === ServiceType.PLEADING_TP3C;
                      const isTP1 = s.type === ServiceType.PLEADING_TP1;
                      const isTP2 = s.type === ServiceType.PLEADING_TP2;
                      const isTP5 = s.type === ServiceType.PLEADING_TP5;
                      const isTP6 = s.type === ServiceType.PLEADING_TP6;
                      // TP 5, 6, 8, 9: KEIN Einheitssatz erlaubt
                      const isKeinES = isTP5 || isTP6 || s.tp === 'TP8' || s.tp === 'TP9';

                      // Fix: Map correct TP type based on ServiceType
                      let tpType: 'TP1' | 'TP2' | 'TP3A' | 'TP3B' | 'TP3C' | 'TP5' | 'TP6' = 'TP3A';
                      if (isTP1) tpType = 'TP1';
                      else if (isTP2) tpType = 'TP2';
                      else if (isTP3B) tpType = 'TP3B';
                      else if (isTP3C) tpType = 'TP3C';
                      else if (isTP5) tpType = 'TP5';
                      else if (isTP6) tpType = 'TP6';

                      const tariffInfo = getTariffBase(serviceBmgl, tpType);

                      // Berechnung wie Referenz-App
                      // Bei § 473a ZPO (TP 3B Ia): Entlohnung halbieren
                      let entlohnung = tariffInfo.base;
                      if (isTP3B && s.is473aZPO) {
                        entlohnung = Math.round(entlohnung / 2);
                      }

                      const verbindungPercent = s.verbindung === 'vorab' ? 50 : s.verbindung === 'wohnort' ? 10 : s.verbindung === 'andere' ? 25 : 0;
                      const verbindungBetrag = Math.round(entlohnung * verbindungPercent / 100);
                      const basisFuerES = entlohnung + verbindungBetrag;

                      // ES-Rate: Bei TP3B kann auch 3x (180%/150%) und 4x (240%/200%) vorkommen
                      // WICHTIG: TP 5, 6, 8, 9 haben KEINEN Einheitssatz
                      // TP 7 hat max. EINFACHEN Einheitssatz
                      const baseEsRate = serviceBmgl <= 1017000 ? 0.6 : 0.5;
                      const effectiveEsMultiplier = isKeinES ? 0 : (s.tp === 'TP7' ? Math.min(s.esMultiplier, 1) : s.esMultiplier);
                      const esRate = effectiveEsMultiplier === 0 ? 0 : baseEsRate * effectiveEsMultiplier;
                      const esZuschlag = Math.round(basisFuerES * esRate);

                      const basisFuerSG = entlohnung + verbindungBetrag + esZuschlag;
                      const sgZuschlag = Math.round(basisFuerSG * sgPercent / 100);
                      const ervBetrag = s.includeErv ? (s.ervRateOverride === 'initial' || (s.ervRateOverride === undefined && s.isInitiating) ? 500 : 260) : 0;
                      const nettoSumme = entlohnung + verbindungBetrag + esZuschlag + sgZuschlag + ervBetrag;
                      const ust = Math.round(nettoSumme * 0.2);
                      const bruttoSumme = nettoSumme + ust;

                      // Einheitssatz-Optionen:
                      // - TP 5, 6, 8, 9: KEIN Einheitssatz (nur "keiner")
                      // - TP 7: max. einfacher ES (keiner/einfach)
                      // - TP3C: nur keiner/einfach
                      // - TP3B: hat 5 Optionen
                      // - TP3A/2/1: hat 3 Optionen
                      const esOptions = isKeinES
                        ? [{ val: 0, label: 'keiner' }]
                        : s.tp === 'TP7'
                          ? [{ val: 0, label: 'keiner' }, { val: 1, label: 'einfach' }]
                          : isTP3C
                            ? [{ val: 0, label: 'keiner' }, { val: 1, label: 'einfach' }]
                            : isTP3B
                              ? [{ val: 0, label: 'keiner' }, { val: 1, label: 'einfach' }, { val: 2, label: 'doppelt' }, { val: 3, label: 'dreifach' }, { val: 4, label: 'vierfach' }]
                              : [{ val: 0, label: 'keiner' }, { val: 1, label: 'einfach' }, { val: 2, label: 'doppelt' }];

                      const esLabel = s.esMultiplier === 0 ? 'keiner' : s.esMultiplier === 1 ? 'einfach' : s.esMultiplier === 2 ? 'doppelt' : s.esMultiplier === 3 ? 'dreifach' : 'vierfach';

                      return (
                        <div className="space-y-4 pt-2">
                          {/* Eingabefelder Grid */}
                          <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-3 items-center">
                            {/* Streitwert */}
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Streitwert</label>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400 font-medium">€</span>
                              <input
                                type="number"
                                value={s.customBmgl ?? bmgl}
                                onChange={e => updateService(s.id, { customBmgl: Number(e.target.value) || bmgl })}
                                className="w-28 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-right shadow-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                              />
                            </div>

                            {/* Verbindung (e.V.) */}
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Verbindung</label>
                            <select
                              value={s.verbindung || 'keine'}
                              onChange={e => updateService(s.id, { verbindung: e.target.value as 'keine' | 'vorab' | 'wohnort' | 'andere' })}
                              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 shadow-sm cursor-pointer focus:ring-2 focus:ring-blue-500/20 outline-none"
                            >
                              <option value="keine">keine</option>
                              <option value="wohnort">e.V. Wohnort (10%)</option>
                              <option value="andere">e.V. andere (25%)</option>
                              <option value="vorab">Vorabentscheidung (50%)</option>
                            </select>

                            {/* Streitgenossen */}
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5" /> Streitgenossen
                            </label>
                            <select
                              value={serviceParties}
                              onChange={e => updateService(s.id, { customParties: parseInt(e.target.value) })}
                              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 shadow-sm cursor-pointer focus:ring-2 focus:ring-blue-500/20 outline-none"
                            >
                              <option value={0}>Kein Zuschlag</option>
                              <option value={1}>1 (+10%)</option>
                              <option value={2}>2 (+15%)</option>
                              <option value={3}>3 (+20%)</option>
                              <option value={4}>4 (+25%)</option>
                              <option value={5}>5 (+30%)</option>
                              <option value={9}>9+ (+50%)</option>
                            </select>
                          </div>

                          {/* § 473a ZPO Toggle - nur für TP3B */}
                          {isTP3B && (
                            <div className="space-y-2">
                              <button
                                onClick={() => updateService(s.id, { is473aZPO: !s.is473aZPO })}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${s.is473aZPO ? 'bg-amber-500/10 border-amber-500/30 text-amber-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
                              >
                                <div className="flex items-center gap-2 text-left">
                                  <div className={`w-5 h-5 rounded-md flex items-center justify-center ${s.is473aZPO ? 'bg-amber-500 text-white' : 'bg-slate-200'}`}>
                                    {s.is473aZPO && <span className="text-xs font-bold">✓</span>}
                                  </div>
                                  <span className="text-xs font-bold uppercase tracking-wide">nach § 473a ZPO (Ia)</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">Entlohnung /2</span>
                              </button>
                            </div>
                          )}

                          {/* Einheitssatz */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Einheitssatz</span>
                              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${isKeinES ? 'text-red-600 bg-red-50 border-red-200' : 'text-blue-600 bg-blue-50 border-blue-100'}`}>
                                {isKeinES ? 'KEINER' : esLabel}
                              </span>
                            </div>
                            {isKeinES ? (
                              <div className="flex p-3 bg-red-50/50 rounded-xl border border-red-200/50 text-xs text-red-600">
                                Kein Einheitssatz bei TP {tpType.replace('TP', '')} (§ 23 Abs. 1 RATG)
                              </div>
                            ) : (
                            <div className="flex p-1 gap-1 bg-slate-200/60 rounded-xl shadow-inner">
                              {esOptions.map((opt) => (
                                <button
                                  key={opt.val}
                                  onClick={() => updateService(s.id, { esMultiplier: opt.val })}
                                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${s.esMultiplier === opt.val ? 'text-blue-700 bg-white shadow-sm ring-1 ring-blue-500/20' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                            )}
                          </div>

                          {/* ERV Toggle */}
                          {s.type.startsWith('PLEADING') && (
                            <div className="space-y-2">
                              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                                <Mail className="h-3.5 w-3.5" /> ERV-Beitrag (§ 23a)
                              </span>
                              <div className="flex p-1 gap-1 bg-slate-200/60 rounded-xl shadow-inner">
                                {[
                                  { val: false, label: 'Aus', rate: null },
                                  { val: true, label: 'Regulär', rate: 'regular' as const },
                                  { val: true, label: 'Erstmals', rate: 'initial' as const }
                                ].map((opt, idx) => {
                                  const isSelected = (opt.val === s.includeErv) && (opt.val === false || (s.ervRateOverride === opt.rate || (s.ervRateOverride === undefined && opt.rate === (s.isInitiating ? 'initial' : 'regular'))));
                                  return (
                                    <button
                                      key={idx}
                                      onClick={() => updateService(s.id, { includeErv: opt.val, ervRateOverride: opt.rate || undefined })}
                                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${isSelected ? 'text-blue-700 bg-white shadow-sm ring-1 ring-blue-500/20' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                                    >
                                      {opt.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* ERGEBNIS-SEKTION */}
                          <div className="mt-2 p-4 bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl border border-blue-200/50 space-y-3">
                            <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                              {/* Fix: Label dynamically reflects selected TP */}
                              Schriftsatz {tpType.replace('TP', 'TP ')} RATG - Ergebnis
                            </div>

                            <div className="space-y-2">
                              {/* Tarifstufe */}
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">Tarifstufe</span>
                                <span className="font-mono text-xs font-bold text-slate-700">{tariffInfo.label}</span>
                              </div>

                              {/* 1. Entlohnung */}
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">Entlohnung</span>
                                <span className="font-mono text-xs font-bold text-slate-700">{formatEuro(entlohnung)}</span>
                              </div>

                              {/* 2. Verbindungsgebühr (falls vorhanden) */}
                              {verbindungPercent > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500">Verbindungsgebühr {verbindungPercent}%</span>
                                  <span className="font-mono text-xs font-bold text-slate-700">{formatEuro(verbindungBetrag)}</span>
                                </div>
                              )}

                              {/* 3. Einheitssatz (falls vorhanden) */}
                              {s.esMultiplier > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500">Einheitssatz {(esRate * 100).toFixed(0)}%</span>
                                  <span className="font-mono text-xs font-bold text-slate-700">{formatEuro(esZuschlag)}</span>
                                </div>
                              )}

                              {/* 4. Streitgenossenzuschlag (falls vorhanden) */}
                              {sgPercent > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500">Streitgenossenzuschlag {sgPercent}%</span>
                                  <span className="font-mono text-xs font-bold text-amber-600">{formatEuro(sgZuschlag)}</span>
                                </div>
                              )}

                              {/* 5. ERV (falls vorhanden) */}
                              {ervBetrag > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500">ERV-Beitrag</span>
                                  <span className="font-mono text-xs font-bold text-slate-700">{formatEuro(ervBetrag)}</span>
                                </div>
                              )}
                            </div>

                            <div className="border-t border-blue-200/50 pt-3 space-y-2">
                              {/* 6. Summe Netto */}
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-600 font-medium">Summe netto</span>
                                <span className="font-mono text-sm font-bold text-slate-800">{formatEuro(nettoSumme)}</span>
                              </div>

                              {/* 7. USt */}
                              {!isVatFree && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500">20% USt.</span>
                                  <span className="font-mono text-xs font-bold text-slate-600">{formatEuro(ust)}</span>
                                </div>
                              )}

                              {/* 8. Summe Brutto */}
                              <div className="flex justify-between items-center pt-1">
                                <span className="text-sm font-bold text-blue-700">Summe brutto</span>
                                <span className="font-mono text-lg font-black text-blue-700">{formatEuro(isVatFree ? nettoSumme : bruttoSumme)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </GlassCard>
              );
              })}

              {/* Add Service Button - Compact */}
              <div className="relative">
                <button
                  onClick={() => setShowCatalog(!showCatalog)}
                  className="w-full py-4 rounded-2xl border-2 border-dashed border-white/20 text-white/50 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest group"
                >
                  <Plus className="h-4 w-4 group-hover:scale-125 transition-transform" /> Leistung Hinzufügen
                </button>

                {showCatalog && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-2 p-3 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl backdrop-blur-3xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="relative mb-3">
                      <input
                        autoFocus
                        placeholder="Suchen (z.B. TP3A, Klage, Berufung...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-3 pr-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                    <div className="max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                      {searchTerm ? (
                        // Gefilterte Ansicht bei Suche
                        <div className="space-y-0.5">
                          {filteredCatalog.map(entry => {
                            const isTermin = entry.category === 'TERMINE';
                            const isEntschaedigung = entry.category === 'ENTSCHAEDIGUNG';
                            const badgeColor = isTermin ? 'bg-amber-500' : isEntschaedigung ? 'bg-emerald-500' : 'bg-blue-500';
                            const hoverColor = isTermin ? 'group-hover:text-amber-400' : isEntschaedigung ? 'group-hover:text-emerald-400' : 'group-hover:text-blue-400';
                            return (
                              <button
                                key={entry.id}
                                onClick={() => addService(entry)}
                                className="w-full text-left p-2 rounded-lg hover:bg-white/10 transition-colors group flex items-center gap-2"
                              >
                                <span className={`px-2 py-1 rounded-lg ${badgeColor} text-white text-[10px] font-black shrink-0`}>
                                  {entry.tp}
                                </span>
                                <span className={`text-sm font-medium text-white/90 ${hoverColor} transition-colors truncate`}>
                                  {entry.short}
                                </span>
                              </button>
                            );
                          })}
                          {filteredCatalog.length === 0 && (
                            <div className="text-center py-4 text-slate-500 text-sm">Keine Treffer</div>
                          )}
                        </div>
                      ) : (
                        // Gruppierte Ansicht ohne Suche
                        <div className="space-y-4">
                          {/* Schriftsätze */}
                          <div>
                            <div className="text-[11px] font-black text-blue-400 uppercase tracking-widest px-2 py-2 mb-1 sticky top-0 bg-slate-900">
                              Schriftsätze
                            </div>
                            <div className="space-y-0.5">
                              {(['TP1', 'TP2', 'TP3A', 'TP3B', 'TP3C', 'TP4', 'TP5', 'TP6'] as const).map(tp => {
                                const entries = SERVICE_CATALOG.filter(c => c.category === 'SCHRIFTSAETZE' && c.tp === tp);
                                if (entries.length === 0) return null;
                                return (
                                  <div key={tp} className="mb-1">
                                    {entries.map(entry => (
                                      <button
                                        key={entry.id}
                                        onClick={() => addService(entry)}
                                        className="w-full text-left p-2 rounded-lg hover:bg-white/10 transition-colors group flex items-center gap-2"
                                      >
                                        <span className="px-2 py-1 rounded-lg bg-blue-500 text-white text-[10px] font-black shrink-0">
                                          {entry.tp}
                                        </span>
                                        <span className="text-sm font-medium text-white/90 group-hover:text-blue-400">
                                          {entry.short}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Termine */}
                          <div>
                            <div className="text-[11px] font-black text-amber-400 uppercase tracking-widest px-2 py-2 mb-1 sticky top-0 bg-slate-900">
                              Termine / Tagsatzungen
                            </div>
                            <div className="space-y-0.5">
                              {(['TP2', 'TP3A', 'TP3B', 'TP3C', 'TP4', 'TP7', 'TP8', 'TP3'] as const).map(tp => {
                                const entries = SERVICE_CATALOG.filter(c => c.category === 'TERMINE' && c.tp === tp);
                                if (entries.length === 0) return null;
                                return (
                                  <div key={tp} className="mb-1">
                                    {entries.map(entry => (
                                      <button
                                        key={entry.id}
                                        onClick={() => addService(entry)}
                                        className="w-full text-left p-2 rounded-lg hover:bg-white/10 transition-colors group flex items-center gap-2"
                                      >
                                        <span className="px-2 py-1 rounded-lg bg-amber-500 text-white text-[10px] font-black shrink-0">
                                          {entry.tp}
                                        </span>
                                        <span className="text-sm font-medium text-white/90 group-hover:text-amber-400">
                                          {entry.short}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Entschädigung */}
                          <div>
                            <div className="text-[11px] font-black text-emerald-400 uppercase tracking-widest px-2 py-2 mb-1 sticky top-0 bg-slate-900">
                              Entschädigung (TP 9)
                            </div>
                            <div className="space-y-0.5">
                              {SERVICE_CATALOG.filter(c => c.category === 'ENTSCHAEDIGUNG').map(entry => (
                                <button
                                  key={entry.id}
                                  onClick={() => addService(entry)}
                                  className="w-full text-left p-2 rounded-lg hover:bg-white/10 transition-colors group flex items-center gap-2"
                                >
                                  <span className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-black shrink-0">
                                    {entry.tp}
                                  </span>
                                  <span className="text-sm font-medium text-white/90 group-hover:text-emerald-400">
                                    {entry.short}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Straf-Service Cards Header */}
            {caseMode === CaseMode.CRIMINAL && strafServices.length > 0 && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {strafServices.length} Leistung{strafServices.length !== 1 ? 'en' : ''}
                </span>
                {strafServices.length > 1 && (
                  <button
                    onClick={sortStrafServicesByDate}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-300 transition-all"
                    title="Nach Datum sortieren (neueste zuerst)"
                  >
                    <ArrowUpDown className="h-3 w-3" />
                    Nach Datum
                  </button>
                )}
              </div>
            )}
            {/* Straf-Service Cards (nur im Straf-Modus) */}
            {caseMode === CaseMode.CRIMINAL && (
            <div className="space-y-3">
              {strafServices.map((s, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === strafServices.length - 1;
                // Berechnung für diese Leistung
                const isTagsatzungLeistung = isStrafTagsatzung(s.leistungType);
                const isAHK = !s.leistungType.startsWith('STRAF_RATG') && s.leistungType !== 'STRAF_ZUWARTEN';
                const serviceSG = s.customStreitgenossen ?? strafStreitgenossen;
                const sgPercent = serviceSG * 30; // 30% pro Person, kein Limit

                // AHK § 9 Tarife für diese Leistung
                const ahkTarife = courtType !== 'HAFT' ? (AHK_TARIFE as any)[courtType] : null;
                const haftTarife = courtType === 'HAFT' ? AHK_HAFT_TARIFE : null;

                // Berechne Entlohnung basierend auf Leistungstyp
                let entlohnung = 0;
                let tarifLabel = '';
                let firstHalf = 0;
                let subsequentHalf = 0;

                if (isAHK && isTagsatzungLeistung) {
                  // AHK-Tagsatzung
                  if (courtType === 'HAFT') {
                    if (s.leistungType === 'STRAF_HAFT_VH_1') {
                      firstHalf = haftTarife!.vh1Instanz.firstHalf;
                      subsequentHalf = haftTarife!.vh1Instanz.subsequentHalf;
                    } else if (s.leistungType === 'STRAF_HAFT_VH_2') {
                      firstHalf = haftTarife!.vh2Instanz.firstHalf;
                      subsequentHalf = haftTarife!.vh2Instanz.subsequentHalf;
                    }
                  } else if (ahkTarife) {
                    if (s.leistungType === 'STRAF_HV_1_INSTANZ' || s.leistungType === 'STRAF_KONTRADIKTORISCHE_VERNEHMUNG') {
                      firstHalf = ahkTarife.hv1Instanz.firstHalf;
                      subsequentHalf = ahkTarife.hv1Instanz.subsequentHalf;
                    } else if (s.leistungType === 'STRAF_BERUFUNG_VH_VOLL' && ahkTarife.berufungVhVoll) {
                      firstHalf = ahkTarife.berufungVhVoll.firstHalf;
                      subsequentHalf = ahkTarife.berufungVhVoll.subsequentHalf;
                    } else if (s.leistungType === 'STRAF_BERUFUNG_VH_STRAFE' && ahkTarife.berufungVhStrafe) {
                      firstHalf = ahkTarife.berufungVhStrafe.firstHalf;
                      subsequentHalf = ahkTarife.berufungVhStrafe.subsequentHalf;
                    } else if (s.leistungType === 'STRAF_BERUFUNG_VH' && ahkTarife.berufungVh) {
                      firstHalf = ahkTarife.berufungVh.firstHalf;
                      subsequentHalf = ahkTarife.berufungVh.subsequentHalf;
                    } else if (s.leistungType === 'STRAF_GERICHTSTAG_NB' && ahkTarife.gerichtstagNb) {
                      firstHalf = ahkTarife.gerichtstagNb.firstHalf;
                      subsequentHalf = ahkTarife.gerichtstagNb.subsequentHalf;
                    }
                  }

                  // Bei frustrierter Tagsatzung: nur 1. halbe Stunde
                  if (s.isFrustriert) {
                    entlohnung = firstHalf;
                  } else {
                    entlohnung = firstHalf + (s.durationHalbeStunden > 1 ? (s.durationHalbeStunden - 1) * subsequentHalf : 0);
                  }
                  tarifLabel = `AHK § 9 - ${COURT_TYPE_LABELS[courtType]}`;
                }

                // Wartezeit-Berechnung (bei frustriert: keine Wartezeit)
                const wartezeit = (s.isFrustriert || s.waitingHalbeStunden <= 0) ? 0 : s.waitingHalbeStunden * subsequentHalf;

                // Basis für ES und SG
                const basisFuerES = entlohnung + wartezeit;

                // ES-Rate: Bei Straf einfach oder doppelt (basierend auf fixer BMGL)
                // Bei frustriert: kein ES (keine Verhandlung = kein Einheitssatz)
                const strafEsRate = strafBmgl <= 1017000 ? 0.6 : 0.5;
                const esRate = (s.isFrustriert || s.esMultiplier === 0) ? 0 : strafEsRate * s.esMultiplier;
                const esZuschlag = Math.round(basisFuerES * esRate);

                // Zwischensumme für SG
                const zwischensumme = basisFuerES + esZuschlag;

                // Streitgenossen-Zuschlag (30% × n)
                const sgZuschlag = Math.round(zwischensumme * sgPercent / 100);

                // Netto
                const nettoSumme = zwischensumme + sgZuschlag;
                const ust = isVatFree ? 0 : Math.round(nettoSumme * 0.2);
                const bruttoSumme = nettoSumme + ust;

                // ES-Label
                const esLabel = s.esMultiplier === 0 ? 'keiner' : s.esMultiplier === 1 ? 'einfach' : 'doppelt';

                return (
                <GlassCard key={s.id} className="!p-4 relative group/item ring-1 ring-red-500/20" variant="light">
                  {/* Action Buttons: Move + Delete */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 z-20">
                    {strafServices.length > 1 && (
                      <>
                        <button
                          onClick={() => moveStrafServiceUp(s.id)}
                          disabled={isFirst}
                          className={`p-1 rounded-lg border transition-colors ${isFirst ? 'text-slate-300 bg-slate-100 border-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-red-600 bg-white/40 border-white/40 hover:border-red-300'}`}
                          title="Nach oben"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => moveStrafServiceDown(s.id)}
                          disabled={isLast}
                          className={`p-1 rounded-lg border transition-colors ${isLast ? 'text-slate-300 bg-slate-100 border-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-red-600 bg-white/40 border-white/40 hover:border-red-300'}`}
                          title="Nach unten"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => removeStrafService(s.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors bg-white/40 p-1 rounded-lg border border-white/40"
                      title="Löschen"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3 relative z-10">
                    {/* Header: Date + Category Badge + Gericht */}
                    <div className="flex items-center gap-2 pr-24 flex-wrap">
                      <input
                        type="date"
                        value={s.date}
                        onChange={e => updateStrafService(s.id, { date: e.target.value })}
                        className="bg-white/40 border-none rounded-lg px-2 py-1 text-[11px] font-bold shadow-sm w-28"
                      />
                      <span className={`px-2 py-1 rounded-lg ${isAHK ? 'bg-red-500' : 'bg-orange-500'} text-white text-[10px] font-black shrink-0`}>
                        {isAHK ? (isTagsatzungLeistung ? 'AHK VH' : 'AHK SS') : 'RATG'}
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-slate-600 text-white text-[10px] font-bold shrink-0">
                        {COURT_TYPE_LABELS[courtType]}
                      </span>
                    </div>

                    {/* Leistungs-Label - Editierbar */}
                    <input
                      type="text"
                      value={s.label}
                      onChange={e => updateStrafService(s.id, { label: e.target.value })}
                      className="w-full bg-slate-900/5 border-none rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 shadow-inner"
                      placeholder="Bezeichnung..."
                    />

                    {/* TAGSATZUNG-spezifische Felder */}
                    {isTagsatzungLeistung && (
                      <div className="space-y-4 pt-2">
                        {/* Eingabefelder Grid - besser ausgerichtet */}
                        <div className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-3 items-center">
                          {/* Frustrierte Tagsatzung */}
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Frustriert</label>
                          <button
                            onClick={() => {
                              const newFrustriert = !s.isFrustriert;
                              // Bei Frustriert: Dauer und Wartezeit auf 0
                              if (newFrustriert) {
                                updateStrafService(s.id, { isFrustriert: true, durationHalbeStunden: 0, waitingHalbeStunden: 0 });
                              } else {
                                updateStrafService(s.id, { isFrustriert: false, durationHalbeStunden: 2 }); // Default 1 Stunde
                              }
                            }}
                            className={`w-24 py-2 rounded-xl text-xs font-bold transition-all ${s.isFrustriert ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-600'}`}
                          >
                            {s.isFrustriert ? 'Ja' : 'Nein'}
                          </button>

                          {/* Dauer (in halben Stunden) */}
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Dauer</label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateStrafService(s.id, { durationHalbeStunden: Math.max(1, s.durationHalbeStunden - 1) })}
                              className="w-9 h-9 rounded-xl bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 font-bold text-lg shadow-sm active:scale-95 transition-transform"
                            >−</button>
                            <input
                              type="number"
                              min="1"
                              value={s.durationHalbeStunden}
                              onChange={e => updateStrafService(s.id, { durationHalbeStunden: Math.max(1, Number(e.target.value)) })}
                              className="w-14 bg-white border border-slate-200 rounded-xl px-2 py-2 text-sm font-bold text-center shadow-sm"
                            />
                            <button
                              onClick={() => updateStrafService(s.id, { durationHalbeStunden: s.durationHalbeStunden + 1 })}
                              className="w-9 h-9 rounded-xl bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 font-bold text-lg shadow-sm active:scale-95 transition-transform"
                            >+</button>
                            <span className="text-xs text-slate-500 font-bold ml-1 w-12">½ Std.</span>
                          </div>

                          {/* Wartezeit (in halben Stunden) */}
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Wartezeit</label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateStrafService(s.id, { waitingHalbeStunden: Math.max(0, (s.waitingHalbeStunden || 0) - 1) })}
                              className="w-9 h-9 rounded-xl bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 font-bold text-lg shadow-sm active:scale-95 transition-transform"
                            >−</button>
                            <input
                              type="number"
                              min="0"
                              value={s.waitingHalbeStunden || 0}
                              onChange={e => updateStrafService(s.id, { waitingHalbeStunden: Math.max(0, Number(e.target.value)) })}
                              className="w-14 bg-white border border-slate-200 rounded-xl px-2 py-2 text-sm font-bold text-center shadow-sm"
                            />
                            <button
                              onClick={() => updateStrafService(s.id, { waitingHalbeStunden: (s.waitingHalbeStunden || 0) + 1 })}
                              className="w-9 h-9 rounded-xl bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 font-bold text-lg shadow-sm active:scale-95 transition-transform"
                            >+</button>
                            <span className="text-xs text-slate-500 font-bold ml-1 w-12">½ Std.</span>
                          </div>

                          {/* Streitgenossen (30% × n) */}
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" /> Streitgenossen
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateStrafService(s.id, { customStreitgenossen: Math.max(0, serviceSG - 1) })}
                              className="w-9 h-9 rounded-xl bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 font-bold text-lg shadow-sm active:scale-95 transition-transform"
                            >−</button>
                            <input
                              type="number"
                              min="0"
                              value={serviceSG}
                              onChange={e => updateStrafService(s.id, { customStreitgenossen: Math.max(0, Number(e.target.value)) })}
                              className="w-14 bg-white border border-slate-200 rounded-xl px-2 py-2 text-sm font-bold text-center shadow-sm"
                            />
                            <button
                              onClick={() => updateStrafService(s.id, { customStreitgenossen: serviceSG + 1 })}
                              className="w-9 h-9 rounded-xl bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 font-bold text-lg shadow-sm active:scale-95 transition-transform"
                            >+</button>
                            <span className="text-xs text-slate-500 font-bold ml-1">+{sgPercent}%</span>
                          </div>
                        </div>

                        {/* Einheitssatz */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Einheitssatz</span>
                            <span className="text-[10px] font-black text-red-600 uppercase bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                              {esLabel}
                            </span>
                          </div>
                          <div className="flex p-1 gap-1 bg-slate-200/60 rounded-xl shadow-inner">
                            {[
                              { val: 0, label: 'keiner' },
                              { val: 1, label: 'einfach' },
                              { val: 2, label: 'doppelt' }
                            ].map((opt) => (
                              <button
                                key={opt.val}
                                onClick={() => updateStrafService(s.id, { esMultiplier: opt.val })}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${s.esMultiplier === opt.val ? 'text-red-700 bg-white shadow-sm ring-1 ring-red-500/20' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* NB + Berufung Zuschlag (nur für NB-Leistungen) */}
                        {(s.leistungType === 'STRAF_NICHTIGKEITSBESCHWERDE' || s.leistungType === 'STRAF_GERICHTSTAG_NB') && (
                          <button
                            onClick={() => updateStrafService(s.id, { nbUndBerufung: !s.nbUndBerufung })}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${s.nbUndBerufung ? 'bg-red-500/10 border-red-500/30 text-red-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
                          >
                            <div className="flex items-center gap-2 text-left">
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center ${s.nbUndBerufung ? 'bg-red-500 text-white' : 'bg-slate-200'}`}>
                                {s.nbUndBerufung && <span className="text-xs font-bold">✓</span>}
                              </div>
                              <span className="text-xs font-bold uppercase tracking-wide">NB + Berufung (§ 9 Abs 2)</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">+20%</span>
                          </button>
                        )}

                        {/* ERGEBNIS-SEKTION */}
                        {entlohnung > 0 && (
                          <div className="mt-2 p-4 bg-gradient-to-br from-red-50 to-slate-50 rounded-2xl border border-red-200/50 space-y-3">
                            <div className="text-[10px] font-black text-red-600 uppercase tracking-widest">
                              Ergebnis AHK § 9 - {COURT_TYPE_LABELS[courtType]}
                            </div>

                            <div className="space-y-2">
                              {/* Tarifstufe */}
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">Tarifstufe</span>
                                <span className="font-mono text-xs font-bold text-slate-700">{tarifLabel}</span>
                              </div>

                              {/* 1. Entlohnung */}
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">
                                  {s.isFrustriert ? 'Frustrierte Tagsatzung (1. ½ Std.)' : `Entlohnung (${s.durationHalbeStunden} × ½ Std.)`}
                                </span>
                                <span className="font-mono text-xs font-bold text-slate-700">{formatEuro(entlohnung)}</span>
                              </div>

                              {/* 2. Wartezeit (falls vorhanden) */}
                              {s.waitingHalbeStunden > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500">Wartezeit ({s.waitingHalbeStunden} × ½ Std.)</span>
                                  <span className="font-mono text-xs font-bold text-slate-700">{formatEuro(wartezeit)}</span>
                                </div>
                              )}

                              {/* 3. ES-Zuschlag */}
                              {s.esMultiplier > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500">+ ES ({esLabel} = {(esRate * 100).toFixed(0)}%)</span>
                                  <span className="font-mono text-xs font-bold text-slate-700">{formatEuro(esZuschlag)}</span>
                                </div>
                              )}

                              {/* 4. Streitgenossen-Zuschlag */}
                              {sgPercent > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500">+ Streitgenossen ({sgPercent}%)</span>
                                  <span className="font-mono text-xs font-bold text-amber-600">{formatEuro(sgZuschlag)}</span>
                                </div>
                              )}
                            </div>

                            <div className="border-t border-red-200/50 pt-3 space-y-2">
                              {/* 5. Summe Netto */}
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-600 font-medium">Summe netto</span>
                                <span className="font-mono text-sm font-bold text-slate-800">{formatEuro(nettoSumme)}</span>
                              </div>

                              {/* 6. USt */}
                              {!isVatFree && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500">20% USt.</span>
                                  <span className="font-mono text-xs font-bold text-slate-600">{formatEuro(ust)}</span>
                                </div>
                              )}

                              {/* 7. Summe Brutto */}
                              <div className="flex justify-between items-center pt-1">
                                <span className="text-sm font-bold text-red-700">Summe brutto</span>
                                <span className="font-mono text-lg font-black text-red-700">{formatEuro(bruttoSumme)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* AHK-SCHRIFTSATZ-spezifische Felder (Berufung, NB, etc.) */}
                    {!isTagsatzungLeistung && isAHK && (() => {
                      // Berechnung für Schriftsätze
                      const ssServiceSG = s.customStreitgenossen ?? strafStreitgenossen;
                      const ssSgPercent = ssServiceSG * 30;

                      // Schriftsatz-Basisbetrag aus AHK-Tarifen
                      let ssBasisbetrag = 0;
                      let ssLabel = '';

                      if (courtType === 'HAFT') {
                        if (s.leistungType === 'STRAF_HAFT_GRUNDRECHTSBESCHWERDE') {
                          ssBasisbetrag = AHK_HAFT_TARIFE.grundrechtsbeschwerde;
                          ssLabel = 'Grundrechtsbeschwerde';
                        } else if (s.leistungType === 'STRAF_HAFT_BESCHWERDE_SONST') {
                          ssBasisbetrag = AHK_HAFT_TARIFE.sonstigeBeschwerde;
                          ssLabel = 'Sonstige Beschwerde';
                        }
                      } else if (ahkTarife) {
                        if (s.leistungType === 'STRAF_BERUFUNG_VOLL' && ahkTarife.berufungVoll) {
                          ssBasisbetrag = ahkTarife.berufungVoll;
                          ssLabel = 'Berufung (voll)';
                        } else if (s.leistungType === 'STRAF_BERUFUNG_STRAFE' && ahkTarife.berufungStrafe) {
                          ssBasisbetrag = ahkTarife.berufungStrafe;
                          ssLabel = 'Berufung (nur Strafe)';
                        } else if (s.leistungType === 'STRAF_BERUFUNG' && ahkTarife.berufung) {
                          ssBasisbetrag = ahkTarife.berufung;
                          ssLabel = 'Berufung';
                        } else if (s.leistungType === 'STRAF_NICHTIGKEITSBESCHWERDE' && ahkTarife.nichtigkeitsbeschwerde) {
                          ssBasisbetrag = ahkTarife.nichtigkeitsbeschwerde;
                          ssLabel = 'Nichtigkeitsbeschwerde';
                        }
                      }

                      // NB + Berufung Zuschlag (+20%)
                      const ssNbZuschlag = s.nbUndBerufung ? Math.round(ssBasisbetrag * 0.2) : 0;

                      // Basis für ES
                      const ssBasisFuerES = ssBasisbetrag + ssNbZuschlag;

                      // ES-Zuschlag (analog TP 3B: bis zu 4× ES)
                      const ssBaseEsRate = strafBmgl <= 1017000 ? 0.6 : 0.5;
                      const ssEsRate = s.esMultiplier * ssBaseEsRate;
                      const ssEsZuschlag = Math.round(ssBasisFuerES * ssEsRate);

                      // Zwischensumme für SG
                      const ssZwischensumme = ssBasisFuerES + ssEsZuschlag;

                      // Streitgenossen-Zuschlag
                      const ssSgZuschlag = Math.round(ssZwischensumme * ssSgPercent / 100);

                      // ERV
                      const ssErv = s.includeErv ? 260 : 0;

                      // Netto
                      const ssNetto = ssZwischensumme + ssSgZuschlag + ssErv;
                      const ssUst = isVatFree ? 0 : Math.round(ssNetto * 0.2);
                      const ssBrutto = ssNetto + ssUst;

                      const ssEsLabels = ['keiner', 'einfach', 'doppelt', 'dreifach', 'vierfach'];
                      const ssEsLabel = ssEsLabels[s.esMultiplier] || 'keiner';

                      return (
                      <div className="space-y-4 pt-2">
                        {/* Streitgenossen (30% × n) */}
                        <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-3 items-center">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" /> Streitgenossen
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateStrafService(s.id, { customStreitgenossen: Math.max(0, ssServiceSG - 1) })}
                              className="w-9 h-9 rounded-xl bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 font-bold text-lg shadow-sm active:scale-95 transition-transform"
                            >−</button>
                            <input
                              type="number"
                              min="0"
                              value={ssServiceSG}
                              onChange={e => updateStrafService(s.id, { customStreitgenossen: Math.max(0, Number(e.target.value)) })}
                              className="w-14 bg-white border border-slate-200 rounded-xl px-2 py-2 text-sm font-bold text-center shadow-sm"
                            />
                            <button
                              onClick={() => updateStrafService(s.id, { customStreitgenossen: ssServiceSG + 1 })}
                              className="w-9 h-9 rounded-xl bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 font-bold text-lg shadow-sm active:scale-95 transition-transform"
                            >+</button>
                            <span className="text-xs text-slate-500 font-bold ml-1">+{ssSgPercent}%</span>
                          </div>
                        </div>

                        {/* Einheitssatz für Schriftsätze (analog TP 3B RATG) */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Einheitssatz</span>
                            <span className="text-[10px] font-black text-red-600 uppercase bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                              {ssEsLabel}
                            </span>
                          </div>
                          <div className="flex p-1 gap-1 bg-slate-200/60 rounded-xl shadow-inner">
                            {[
                              { val: 0, label: 'keiner' },
                              { val: 1, label: '1×' },
                              { val: 2, label: '2×' },
                              { val: 3, label: '3×' },
                              { val: 4, label: '4×' }
                            ].map((opt) => (
                              <button
                                key={opt.val}
                                onClick={() => updateStrafService(s.id, { esMultiplier: opt.val })}
                                className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-all duration-200 ${s.esMultiplier === opt.val ? 'text-red-700 bg-white shadow-sm ring-1 ring-red-500/20' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* ERV Toggle */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" /> ERV-Beitrag
                          </span>
                          <div className="flex p-1 gap-1 bg-slate-200/60 rounded-xl shadow-inner">
                            {[
                              { val: false, label: 'Aus' },
                              { val: true, label: 'An' }
                            ].map((opt, idx) => (
                              <button
                                key={idx}
                                onClick={() => updateStrafService(s.id, { includeErv: opt.val })}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${s.includeErv === opt.val ? 'text-red-700 bg-white shadow-sm ring-1 ring-red-500/20' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* NB + Berufung Zuschlag (nur für NB-Leistungen) */}
                        {(s.leistungType === 'STRAF_NICHTIGKEITSBESCHWERDE') && (
                          <button
                            onClick={() => updateStrafService(s.id, { nbUndBerufung: !s.nbUndBerufung })}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${s.nbUndBerufung ? 'bg-red-500/10 border-red-500/30 text-red-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
                          >
                            <div className="flex items-center gap-2 text-left">
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center ${s.nbUndBerufung ? 'bg-red-500 text-white' : 'bg-slate-200'}`}>
                                {s.nbUndBerufung && <span className="text-xs font-bold">✓</span>}
                              </div>
                              <span className="text-xs font-bold uppercase tracking-wide">NB + Berufung (§ 9 Abs 2)</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">+20%</span>
                          </button>
                        )}

                        {/* ERGEBNIS-SEKTION für Schriftsätze */}
                        {ssBasisbetrag > 0 && (
                          <div className="mt-2 p-4 bg-gradient-to-br from-red-50 to-slate-50 rounded-2xl border border-red-200/50 space-y-3">
                            <div className="text-[10px] font-black text-red-600 uppercase tracking-widest">
                              Ergebnis AHK § 9 - {ssLabel}
                            </div>

                            <div className="space-y-2">
                              {/* Tarifstufe */}
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">Tarifstufe</span>
                                <span className="font-mono text-xs font-bold text-slate-700">AHK § 9 - {COURT_TYPE_LABELS[courtType]}</span>
                              </div>

                              {/* 1. Entlohnung */}
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">Entlohnung ({ssLabel})</span>
                                <span className="font-mono text-xs font-bold text-slate-700">{formatEuro(ssBasisbetrag)}</span>
                              </div>

                              {/* 2. NB + Berufung Zuschlag */}
                              {s.nbUndBerufung && ssNbZuschlag > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500">+ NB + Berufung (+20%)</span>
                                  <span className="font-mono text-xs font-bold text-slate-700">{formatEuro(ssNbZuschlag)}</span>
                                </div>
                              )}

                              {/* 3. ES-Zuschlag */}
                              {s.esMultiplier > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500">+ ES ({ssEsLabel} = {(ssEsRate * 100).toFixed(0)}%)</span>
                                  <span className="font-mono text-xs font-bold text-slate-700">{formatEuro(ssEsZuschlag)}</span>
                                </div>
                              )}

                              {/* 4. Streitgenossen-Zuschlag */}
                              {ssSgPercent > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500">+ Streitgenossen ({ssSgPercent}%)</span>
                                  <span className="font-mono text-xs font-bold text-amber-600">{formatEuro(ssSgZuschlag)}</span>
                                </div>
                              )}

                              {/* 5. ERV */}
                              {s.includeErv && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500">+ ERV-Beitrag</span>
                                  <span className="font-mono text-xs font-bold text-slate-700">{formatEuro(ssErv)}</span>
                                </div>
                              )}
                            </div>

                            <div className="border-t border-red-200/50 pt-3 space-y-2">
                              {/* 6. Summe Netto */}
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-600 font-medium">Summe netto</span>
                                <span className="font-mono text-sm font-bold text-slate-800">{formatEuro(ssNetto)}</span>
                              </div>

                              {/* 7. USt */}
                              {!isVatFree && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500">20% USt.</span>
                                  <span className="font-mono text-xs font-bold text-slate-600">{formatEuro(ssUst)}</span>
                                </div>
                              )}

                              {/* 8. Summe Brutto */}
                              <div className="flex justify-between items-center pt-1">
                                <span className="text-sm font-bold text-red-700">Summe brutto</span>
                                <span className="font-mono text-lg font-black text-red-700">{formatEuro(ssBrutto)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      );
                    })()}

                    {/* RATG-Leistungen (§ 10 AHK) - TP2, TP3A, TP3B, Zuwarten */}
                    {!isTagsatzungLeistung && !isAHK && (() => {
                      // RATG-Berechnung basierend auf fixer Bemessungsgrundlage
                      const ratgServiceSG = s.customStreitgenossen ?? strafStreitgenossen;
                      const ratgSgPercent = ratgServiceSG * 30;

                      // Bestimme RATG-Tarifpost
                      let ratgTp: 'TP2' | 'TP3A' | 'TP3B' | null = null;
                      let ratgLabel = '';
                      let isTP72 = s.leistungType === 'STRAF_RATG_TP7_2';
                      let isZeitgebuehr = isTP72 || s.leistungType === 'STRAF_ZUWARTEN';

                      if (s.leistungType === 'STRAF_RATG_TP2') {
                        ratgTp = 'TP2';
                        ratgLabel = 'TP 2 (Kostenantrag, Vollmacht, kurze Anträge)';
                      } else if (s.leistungType === 'STRAF_RATG_TP3A') {
                        ratgTp = 'TP3A';
                        ratgLabel = 'TP 3A (Anträge, Enthaftung, EV-Anträge)';
                      } else if (s.leistungType === 'STRAF_RATG_TP3B') {
                        ratgTp = 'TP3B';
                        ratgLabel = 'TP 3B (Einspruch, Beschwerden)';
                      } else if (s.leistungType === 'STRAF_ZUWARTEN') {
                        ratgTp = 'TP3A'; // Zuwarten basiert auf TP3A/2
                        ratgLabel = 'Zuwarten (§ 10 Abs 4)';
                      } else if (isTP72) {
                        ratgLabel = 'TP 7/2 (Besuch, Vernehmung, Aktenstudium)';
                      }

                      // RATG-Basisbetrag aus Tarif
                      let ratgBasisbetrag = 0;
                      const halbeStunden = s.durationHalbeStunden || 1;

                      if (isTP72) {
                        // TP 7/2: Zeitgebühr pro halbe Stunde (RA erforderlich)
                        const kommResult = getKommission(strafBmgl, halbeStunden, 0, true);
                        ratgBasisbetrag = kommResult.kommission;
                        ratgLabel = `TP 7/2 (${halbeStunden} × ½ Std.)`;
                      } else if (ratgTp) {
                        const tariff = getTariffBase(strafBmgl, ratgTp);
                        ratgBasisbetrag = tariff.base;

                        // Zuwarten: halber Satz TP3A pro halbe Stunde
                        if (s.leistungType === 'STRAF_ZUWARTEN') {
                          const zuwartenHalbeStunden = s.durationHalbeStunden || 1;
                          ratgBasisbetrag = Math.round((tariff.base / 2) * zuwartenHalbeStunden);
                          ratgLabel = `Zuwarten (${zuwartenHalbeStunden} × ½ Std)`;
                        }
                      }

                      // ES-Zuschlag - TP 7/2 + Zuwarten: max einfach, andere: bis zu 4× ES
                      const ratgBaseEsRate = strafBmgl <= 1017000 ? 0.6 : 0.5;
                      const ratgEsMultiplierCapped = isZeitgebuehr ? Math.min(s.esMultiplier, 1) : s.esMultiplier;
                      const ratgEsRate = ratgEsMultiplierCapped * ratgBaseEsRate;
                      const ratgEsZuschlag = Math.round(ratgBasisbetrag * ratgEsRate);

                      // Zwischensumme für SG
                      const ratgZwischensumme = ratgBasisbetrag + ratgEsZuschlag;

                      // Streitgenossen-Zuschlag
                      const ratgSgZuschlag = Math.round(ratgZwischensumme * ratgSgPercent / 100);

                      // ERV
                      const ratgErv = s.includeErv ? 260 : 0;

                      // Netto
                      const ratgNetto = ratgZwischensumme + ratgSgZuschlag + ratgErv;
                      const ratgUst = isVatFree ? 0 : Math.round(ratgNetto * 0.2);
                      const ratgBrutto = ratgNetto + ratgUst;

                      const ratgEsLabels = ['keiner', 'einfach', 'doppelt', 'dreifach', 'vierfach'];
                      const ratgEsLabel = ratgEsLabels[ratgEsMultiplierCapped] || 'keiner';

                      return (
                      <div className="space-y-4 pt-2">
                        {/* Zeitgebühren (TP 7/2, Zuwarten): Dauer in halben Stunden */}
                        {isZeitgebuehr && (
                          <div className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-3 items-center">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Dauer</label>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateStrafService(s.id, { durationHalbeStunden: Math.max(1, s.durationHalbeStunden - 1) })}
                                className="w-9 h-9 rounded-xl bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 font-bold text-lg shadow-sm active:scale-95 transition-transform"
                              >−</button>
                              <input
                                type="number"
                                min="1"
                                value={s.durationHalbeStunden}
                                onChange={e => updateStrafService(s.id, { durationHalbeStunden: Math.max(1, Number(e.target.value)) })}
                                className="w-14 bg-white border border-slate-200 rounded-xl px-2 py-2 text-sm font-bold text-center shadow-sm"
                              />
                              <button
                                onClick={() => updateStrafService(s.id, { durationHalbeStunden: s.durationHalbeStunden + 1 })}
                                className="w-9 h-9 rounded-xl bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 font-bold text-lg shadow-sm active:scale-95 transition-transform"
                              >+</button>
                              <span className="text-xs text-slate-500 font-bold ml-1 w-12">½ Std.</span>
                            </div>
                          </div>
                        )}

                        {/* Streitgenossen (30% × n) */}
                        <div className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-3 items-center">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" /> Streitgenossen
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateStrafService(s.id, { customStreitgenossen: Math.max(0, ratgServiceSG - 1) })}
                              className="w-9 h-9 rounded-xl bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 font-bold text-lg shadow-sm active:scale-95 transition-transform"
                            >−</button>
                            <input
                              type="number"
                              min="0"
                              value={ratgServiceSG}
                              onChange={e => updateStrafService(s.id, { customStreitgenossen: Math.max(0, Number(e.target.value)) })}
                              className="w-14 bg-white border border-slate-200 rounded-xl px-2 py-2 text-sm font-bold text-center shadow-sm"
                            />
                            <button
                              onClick={() => updateStrafService(s.id, { customStreitgenossen: ratgServiceSG + 1 })}
                              className="w-9 h-9 rounded-xl bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 font-bold text-lg shadow-sm active:scale-95 transition-transform"
                            >+</button>
                            <span className="text-xs text-slate-500 font-bold ml-1">+{ratgSgPercent}%</span>
                          </div>
                        </div>

                        {/* Einheitssatz - TP 7/2/Zuwarten: max einfach, andere: bis 4× */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Einheitssatz</span>
                            <span className="text-[10px] font-black text-orange-600 uppercase bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                              {ratgEsLabel}
                            </span>
                          </div>
                          <div className="flex p-1 gap-1 bg-slate-200/60 rounded-xl shadow-inner">
                            {(isZeitgebuehr
                              ? [{ val: 0, label: 'keiner' }, { val: 1, label: 'einfach' }]
                              : [
                                  { val: 0, label: 'keiner' },
                                  { val: 1, label: '1×' },
                                  { val: 2, label: '2×' },
                                  { val: 3, label: '3×' },
                                  { val: 4, label: '4×' }
                                ]
                            ).map((opt) => (
                              <button
                                key={opt.val}
                                onClick={() => updateStrafService(s.id, { esMultiplier: opt.val })}
                                className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-all duration-200 ${s.esMultiplier === opt.val ? 'text-orange-700 bg-white shadow-sm ring-1 ring-orange-500/20' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                          {isZeitgebuehr && (
                            <div className="text-[11px] text-slate-500 px-1">
                              TP 7/Zuwarten: Max. einfacher Einheitssatz
                            </div>
                          )}
                        </div>

                        {/* ERV Toggle */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" /> ERV-Beitrag
                          </span>
                          <div className="flex p-1 gap-1 bg-slate-200/60 rounded-xl shadow-inner">
                            {[
                              { val: false, label: 'Aus' },
                              { val: true, label: 'An' }
                            ].map((opt, idx) => (
                              <button
                                key={idx}
                                onClick={() => updateStrafService(s.id, { includeErv: opt.val })}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${s.includeErv === opt.val ? 'text-orange-700 bg-white shadow-sm ring-1 ring-orange-500/20' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* ERGEBNIS-SEKTION für RATG */}
                        {ratgBasisbetrag > 0 && (
                          <div className="mt-2 p-4 bg-gradient-to-br from-orange-50 to-slate-50 rounded-2xl border border-orange-200/50 space-y-3">
                            <div className="text-[10px] font-black text-orange-600 uppercase tracking-widest">
                              Ergebnis RATG (§ 10 AHK) - {ratgLabel}
                            </div>

                            <div className="space-y-2">
                              {/* Tarifstufe */}
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">Bemessungsgrundlage</span>
                                <span className="font-mono text-xs font-bold text-slate-700">{formatEuro(strafBmgl)} ({COURT_TYPE_LABELS[courtType]})</span>
                              </div>

                              {/* 1. Entlohnung */}
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">Entlohnung ({ratgLabel})</span>
                                <span className="font-mono text-xs font-bold text-slate-700">{formatEuro(ratgBasisbetrag)}</span>
                              </div>

                              {/* 2. ES-Zuschlag */}
                              {s.esMultiplier > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500">+ ES ({ratgEsLabel} = {(ratgEsRate * 100).toFixed(0)}%)</span>
                                  <span className="font-mono text-xs font-bold text-slate-700">{formatEuro(ratgEsZuschlag)}</span>
                                </div>
                              )}

                              {/* 3. Streitgenossen-Zuschlag */}
                              {ratgSgPercent > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500">+ Streitgenossen ({ratgSgPercent}%)</span>
                                  <span className="font-mono text-xs font-bold text-amber-600">{formatEuro(ratgSgZuschlag)}</span>
                                </div>
                              )}

                              {/* 4. ERV */}
                              {s.includeErv && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500">+ ERV-Beitrag</span>
                                  <span className="font-mono text-xs font-bold text-slate-700">{formatEuro(ratgErv)}</span>
                                </div>
                              )}
                            </div>

                            <div className="border-t border-orange-200/50 pt-3 space-y-2">
                              {/* 5. Summe Netto */}
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-600 font-medium">Summe netto</span>
                                <span className="font-mono text-sm font-bold text-slate-800">{formatEuro(ratgNetto)}</span>
                              </div>

                              {/* 6. USt */}
                              {!isVatFree && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500">20% USt.</span>
                                  <span className="font-mono text-xs font-bold text-slate-600">{formatEuro(ratgUst)}</span>
                                </div>
                              )}

                              {/* 7. Summe Brutto */}
                              <div className="flex justify-between items-center pt-1">
                                <span className="text-sm font-bold text-orange-700">Summe brutto</span>
                                <span className="font-mono text-lg font-black text-orange-700">{formatEuro(ratgBrutto)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      );
                    })()}
                  </div>
                </GlassCard>
                );
              })}

              {/* Add Straf-Service Button */}
              <div className="relative">
                <button
                  onClick={() => setShowStrafCatalog(!showStrafCatalog)}
                  className="w-full py-4 rounded-2xl border-2 border-dashed border-red-500/30 text-red-400/70 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest group"
                >
                  <Plus className="h-4 w-4 group-hover:scale-125 transition-transform" /> Straf-Leistung Hinzufügen
                </button>

                {showStrafCatalog && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-2 p-3 rounded-2xl bg-slate-900 border border-red-500/20 shadow-2xl backdrop-blur-3xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="relative mb-3">
                      <input
                        autoFocus
                        placeholder="Suchen (z.B. Hauptverhandlung, Berufung...)"
                        value={strafSearchTerm}
                        onChange={(e) => setStrafSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-3 pr-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-red-500/30"
                      />
                    </div>
                    <div className="max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                      {strafSearchTerm ? (
                        <div className="space-y-0.5">
                          {filteredStrafCatalog.map(entry => (
                            <button
                              key={entry.id}
                              onClick={() => addStrafService(entry.leistungType)}
                              className="w-full text-left p-2 rounded-lg hover:bg-white/10 transition-colors group flex items-center gap-2"
                            >
                              <span className={`px-2 py-1 rounded-lg ${entry.category === 'AHK_VERHANDLUNG' ? 'bg-red-500' : entry.category === 'AHK_SCHRIFTSATZ' ? 'bg-red-400' : 'bg-orange-500'} text-white text-[10px] font-black shrink-0`}>
                                {entry.category === 'AHK_VERHANDLUNG' ? 'VH' : entry.category === 'AHK_SCHRIFTSATZ' ? 'SS' : 'RATG'}
                              </span>
                              <span className="text-sm font-medium text-white/90 group-hover:text-red-400 transition-colors truncate">
                                {entry.short}
                              </span>
                            </button>
                          ))}
                          {filteredStrafCatalog.length === 0 && (
                            <div className="text-center py-4 text-slate-500 text-sm">Keine Treffer</div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* AHK Verhandlungen */}
                          {groupedStrafCatalog.AHK_VERHANDLUNG.length > 0 && (
                            <div>
                              <div className="text-[11px] font-black text-red-400 uppercase tracking-widest px-2 py-2 mb-1 sticky top-0 bg-slate-900">
                                {STRAF_CATEGORY_LABELS.AHK_VERHANDLUNG}
                              </div>
                              <div className="space-y-0.5">
                                {groupedStrafCatalog.AHK_VERHANDLUNG.map(entry => (
                                  <button
                                    key={entry.id}
                                    onClick={() => addStrafService(entry.leistungType)}
                                    className="w-full text-left p-2 rounded-lg hover:bg-white/10 transition-colors group flex items-center gap-2"
                                  >
                                    <span className="px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-black shrink-0">VH</span>
                                    <span className="text-sm font-medium text-white/90 group-hover:text-red-400">{entry.short}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* AHK Schriftsätze */}
                          {groupedStrafCatalog.AHK_SCHRIFTSATZ.length > 0 && (
                            <div>
                              <div className="text-[11px] font-black text-red-300 uppercase tracking-widest px-2 py-2 mb-1 sticky top-0 bg-slate-900">
                                {STRAF_CATEGORY_LABELS.AHK_SCHRIFTSATZ}
                              </div>
                              <div className="space-y-0.5">
                                {groupedStrafCatalog.AHK_SCHRIFTSATZ.map(entry => (
                                  <button
                                    key={entry.id}
                                    onClick={() => addStrafService(entry.leistungType)}
                                    className="w-full text-left p-2 rounded-lg hover:bg-white/10 transition-colors group flex items-center gap-2"
                                  >
                                    <span className="px-2 py-1 rounded-lg bg-red-400 text-white text-[10px] font-black shrink-0">SS</span>
                                    <span className="text-sm font-medium text-white/90 group-hover:text-red-300">{entry.short}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* RATG Leistungen */}
                          {groupedStrafCatalog.RATG.length > 0 && (
                            <div>
                              <div className="text-[11px] font-black text-orange-400 uppercase tracking-widest px-2 py-2 mb-1 sticky top-0 bg-slate-900">
                                {STRAF_CATEGORY_LABELS.RATG}
                              </div>
                              <div className="space-y-0.5">
                                {groupedStrafCatalog.RATG.map(entry => (
                                  <button
                                    key={entry.id}
                                    onClick={() => addStrafService(entry.leistungType)}
                                    className="w-full text-left p-2 rounded-lg hover:bg-white/10 transition-colors group flex items-center gap-2"
                                  >
                                    <span className="px-2 py-1 rounded-lg bg-orange-500 text-white text-[10px] font-black shrink-0">RATG</span>
                                    <span className="text-sm font-medium text-white/90 group-hover:text-orange-400">{entry.short}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Haft-Service Cards (nur im Haft-Modus) */}
            {caseMode === CaseMode.DETENTION && haftServices.length > 0 && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {haftServices.length} Leistung{haftServices.length !== 1 ? 'en' : ''}
                </span>
                {haftServices.length > 1 && (
                  <button
                    onClick={sortHaftServicesByDate}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:text-amber-600 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition-all"
                    title="Nach Datum sortieren (neueste zuerst)"
                  >
                    <ArrowUpDown className="h-3 w-3" />
                    Nach Datum
                  </button>
                )}
              </div>
            )}
            {caseMode === CaseMode.DETENTION && (
            <div className="space-y-3">
              {haftServices.map((s, idx) => {
                const catalogEntry = HAFT_CATALOG.find(e => e.type === s.leistungType);
                const hasKm = hasHaftKilometer(s.leistungType);
                const isFirst = idx === 0;
                const isLast = idx === haftServices.length - 1;

                // Kategorisierung der Leistungen
                const isAHKTagsatzung = ['HAFT_VH_1_INSTANZ', 'HAFT_VH_2_INSTANZ'].includes(s.leistungType);
                const isAHKSchriftsatz = ['HAFT_GRUNDRECHTSBESCHWERDE', 'HAFT_BESCHWERDE_SONST'].includes(s.leistungType);
                const isRATGKommission = ['HAFT_BESUCH', 'HAFT_ZUWARTEN'].includes(s.leistungType);
                const isRATGSchriftsatz = ['HAFT_ANTRAG_TP3A', 'HAFT_BESCHWERDE_TP3B', 'HAFT_KURZANTRAG_TP2'].includes(s.leistungType);
                const isBarauslagen = ['HAFT_REISEKOSTEN', 'HAFT_REISEZEIT'].includes(s.leistungType);

                // Hat Dauer: Tagsatzungen und Kommissionen
                const hasDuration = isAHKTagsatzung || isRATGKommission;
                // Ist Schriftsatz (OHNE Dauer)
                const isSchriftsatz = isAHKSchriftsatz || isRATGSchriftsatz;
                // Braucht RATG-Tarif
                const needsRATGTarif = isRATGKommission || isRATGSchriftsatz;

                // Berechnung
                const currentBmgl = haftBmgl;
                let entlohnung = 0;
                let tariffLabel = '';
                let tpLabel = '';

                // AHK § 9 Abs 1 Z 5 Tarife (Fixsätze)
                if (s.leistungType === 'HAFT_VH_1_INSTANZ') {
                  const first = 36400;
                  const sub = s.durationHalbeStunden > 1 ? (s.durationHalbeStunden - 1) * 18200 : 0;
                  entlohnung = first + sub;
                  tpLabel = '§ 9 Z 5 lit a AHK';
                  tariffLabel = 'AHK Fixsatz';
                } else if (s.leistungType === 'HAFT_VH_2_INSTANZ') {
                  const first = 56400;
                  const sub = s.durationHalbeStunden > 1 ? (s.durationHalbeStunden - 1) * 28200 : 0;
                  entlohnung = first + sub;
                  tpLabel = '§ 9 Z 5 lit c AHK';
                  tariffLabel = 'AHK Fixsatz';
                } else if (s.leistungType === 'HAFT_GRUNDRECHTSBESCHWERDE') {
                  entlohnung = 78600;
                  tpLabel = '§ 9 Z 5 lit b AHK';
                  tariffLabel = 'AHK Fixsatz';
                } else if (s.leistungType === 'HAFT_BESCHWERDE_SONST') {
                  entlohnung = 56400;
                  tpLabel = '§ 9 Z 5 lit b AHK';
                  tariffLabel = 'AHK Fixsatz';
                }
                // RATG TP 7/2 - Besuch / Zuwarten (mit getKommission)
                else if (s.leistungType === 'HAFT_BESUCH' || s.leistungType === 'HAFT_ZUWARTEN') {
                  const kommResult = getKommission(currentBmgl, s.durationHalbeStunden, 0, true);
                  entlohnung = kommResult.kommission;
                  tpLabel = 'TP 7/2 RATG';
                  tariffLabel = `BMGL € ${(currentBmgl / 100).toLocaleString('de-AT')}`;
                }
                // RATG TP 3A - Anträge (mit getTariffBase)
                else if (s.leistungType === 'HAFT_ANTRAG_TP3A') {
                  const tariffResult = getTariffBase(currentBmgl, 'TP3A');
                  entlohnung = tariffResult.base;
                  tpLabel = 'TP 3A RATG';
                  tariffLabel = tariffResult.label;
                }
                // RATG TP 3B - Beschwerden (mit getTariffBase)
                else if (s.leistungType === 'HAFT_BESCHWERDE_TP3B') {
                  const tariffResult = getTariffBase(currentBmgl, 'TP3B');
                  entlohnung = tariffResult.base;
                  tpLabel = 'TP 3B RATG';
                  tariffLabel = tariffResult.label;
                }
                // RATG TP 2 - Kurzanträge (mit getTariffBase)
                else if (s.leistungType === 'HAFT_KURZANTRAG_TP2') {
                  const tariffResult = getTariffBase(currentBmgl, 'TP2');
                  entlohnung = tariffResult.base;
                  tpLabel = 'TP 2 RATG';
                  tariffLabel = tariffResult.label;
                }
                // Barauslagen
                else if (s.leistungType === 'HAFT_REISEKOSTEN') {
                  const km = (s.kilometerHin ?? 0) * (s.isRueckfahrt ? 2 : 1);
                  entlohnung = km * 50;
                  tpLabel = 'TP 9/3 RATG';
                  tariffLabel = `${km} km × € 0,50`;
                } else if (s.leistungType === 'HAFT_REISEZEIT') {
                  entlohnung = s.durationHalbeStunden * 3390;
                  tpLabel = 'TP 9/4 RATG';
                  tariffLabel = `${s.durationHalbeStunden} × € 33,90`;
                }

                // ES-Rate berechnen
                // - RATG-Schriftsätze: 0-4x (keiner bis vierfach)
                // - RATG-Kommissionen (TP 7/2): 0-1x (keiner oder einfach)
                // - AHK-Schriftsätze: 0-1x (keiner oder einfach)
                // - AHK-Tagsatzungen: 0-1x (keiner oder einfach)
                const esBaseRate = currentBmgl <= 1017000 ? 0.6 : 0.5; // 60% bis € 10.170, sonst 50%
                const esMultiplierCapped = (isAHKSchriftsatz || isAHKTagsatzung || isRATGKommission) ? Math.min(s.esMultiplier, 1) : s.esMultiplier; // AHK + TP7 max einfach
                const esRate = (needsRATGTarif || isAHKSchriftsatz || isAHKTagsatzung) ? esMultiplierCapped * esBaseRate : 0;
                const esZuschlag = Math.round(entlohnung * esRate);

                // ERV-Berechnung (basierend auf ervRateOverride)
                const ervAmount = s.includeErv
                  ? (s.ervRateOverride === 'regular' ? 260 : 500)  // regular = € 2,60, initial/default = € 5,00
                  : 0;
                const nettoSumme = entlohnung + esZuschlag + ervAmount;
                const ust = Math.round(nettoSumme * 0.2);

                return (
                <GlassCard key={s.id} className="!p-4 relative group/item" variant="light">
                  {/* Action Buttons: Move + Delete */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 z-20">
                    {haftServices.length > 1 && (
                      <>
                        <button
                          onClick={() => moveHaftServiceUp(s.id)}
                          disabled={isFirst}
                          className={`p-1.5 rounded-lg border transition-colors ${isFirst ? 'text-slate-300 bg-slate-100 border-slate-200 cursor-not-allowed' : 'text-slate-500 hover:text-blue-600 bg-white/60 border-slate-200 hover:border-blue-300'}`}
                          title="Nach oben"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => moveHaftServiceDown(s.id)}
                          disabled={isLast}
                          className={`p-1.5 rounded-lg border transition-colors ${isLast ? 'text-slate-300 bg-slate-100 border-slate-200 cursor-not-allowed' : 'text-slate-500 hover:text-blue-600 bg-white/60 border-slate-200 hover:border-blue-300'}`}
                          title="Nach unten"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => removeHaftService(s.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors bg-white/60 p-1.5 rounded-lg border border-slate-200"
                      title="Löschen"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3 relative z-10">
                    {/* Header: Date + Type Badge */}
                    <div className="flex items-center gap-2 pr-24">
                      <input
                        type="date"
                        value={s.date}
                        onChange={e => updateHaftService(s.id, { date: e.target.value })}
                        className="bg-white/60 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 shadow-sm w-28"
                      />
                      <span className={`px-2 py-1 rounded-lg text-white text-[10px] font-black shrink-0 ${
                        (isAHKTagsatzung || isAHKSchriftsatz) ? 'bg-amber-600' : isBarauslagen ? 'bg-slate-600' : 'bg-blue-500'
                      }`}>
                        {(isAHKTagsatzung || isAHKSchriftsatz) ? '§9 AHK' : catalogEntry?.category === 'BESUCH' ? 'TP 7/2' : catalogEntry?.category === 'BARAUSLAGEN' ? 'TP 9' : tpLabel || 'RATG'}
                      </span>
                    </div>

                    {/* Service Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenHaftServiceDropdown(openHaftServiceDropdown === s.id ? null : s.id)}
                        className="w-full bg-slate-800 border-none rounded-xl px-3 py-2 text-sm font-bold text-white text-left cursor-pointer pr-8 shadow-lg ring-1 ring-white/10 hover:bg-slate-700 transition-colors"
                      >
                        {s.label || 'Leistung wählen...'}
                      </button>
                      <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none transition-transform ${openHaftServiceDropdown === s.id ? 'rotate-180' : ''}`} />

                      {openHaftServiceDropdown === s.id && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-2 p-3 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl backdrop-blur-3xl max-h-[400px] overflow-y-auto custom-scrollbar">
                          {(Object.entries(groupedHaftCatalog) as [string, typeof HAFT_CATALOG][]).map(([cat, entries]) => (
                            entries.length > 0 && (
                              <div key={cat}>
                                <div className={`text-[11px] font-black uppercase tracking-widest px-2 py-1 mb-1 mt-2 first:mt-0 ${
                                  cat === 'VERHANDLUNG' ? 'text-amber-400' :
                                  cat === 'SCHRIFTSATZ' ? 'text-blue-400' :
                                  cat === 'BESUCH' ? 'text-emerald-400' : 'text-slate-400'
                                }`}>
                                  {HAFT_CATEGORY_LABELS[cat as keyof typeof HAFT_CATEGORY_LABELS]}
                                </div>
                                {entries.map(entry => (
                                  <button
                                    key={entry.type}
                                    onClick={() => {
                                      const defaults = getDefaultHaftService(entry.type);
                                      updateHaftService(s.id, {
                                        leistungType: entry.type,
                                        label: entry.short,
                                        durationHalbeStunden: defaults.durationHalbeStunden,
                                        esMultiplier: defaults.esMultiplier,
                                        includeErv: defaults.includeErv,
                                      });
                                      setOpenHaftServiceDropdown(null);
                                    }}
                                    className="w-full text-left p-2 rounded-lg hover:bg-white/10 transition-colors"
                                  >
                                    <span className="text-sm font-medium text-white/90 hover:text-amber-400">
                                      {entry.short}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Label Input */}
                    <input
                      type="text"
                      value={s.label}
                      onChange={e => updateHaftService(s.id, { label: e.target.value })}
                      className="w-full bg-slate-900/5 border-none rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 shadow-inner"
                      placeholder="Bezeichnung..."
                    />

                    {/* Eingabefelder für Tagsatzungen und Kommissionen (mit DAUER) */}
                    {hasDuration && (
                      <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-3 items-center">
                          {/* Dauer */}
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Dauer</label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateHaftService(s.id, { durationHalbeStunden: Math.max(1, s.durationHalbeStunden - 1) })}
                              className="w-9 h-9 rounded-xl bg-gradient-to-b from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border border-slate-300/50 flex items-center justify-center text-slate-700 font-bold text-lg shadow-[0_2px_4px_rgba(0,0,0,0.08)] active:shadow-inner active:scale-95 transition-all"
                            >−</button>
                            <input
                              type="number"
                              min="1"
                              value={s.durationHalbeStunden}
                              onChange={e => updateHaftService(s.id, { durationHalbeStunden: Math.max(1, Number(e.target.value)) })}
                              className="w-14 bg-white border border-slate-200/80 rounded-xl px-2 py-2 text-sm font-bold text-center text-slate-800 shadow-[0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.8)]"
                            />
                            <button
                              onClick={() => updateHaftService(s.id, { durationHalbeStunden: s.durationHalbeStunden + 1 })}
                              className="w-9 h-9 rounded-xl bg-gradient-to-b from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border border-slate-300/50 flex items-center justify-center text-slate-700 font-bold text-lg shadow-[0_2px_4px_rgba(0,0,0,0.08)] active:shadow-inner active:scale-95 transition-all"
                            >+</button>
                            <span className="text-sm text-slate-700 font-bold ml-1">½ Std.</span>
                          </div>
                        </div>

                        {/* Einheitssatz für RATG Kommissionen (TP 7/2) und AHK Tagsatzungen - nur einfach möglich */}
                        {(isRATGKommission || isAHKTagsatzung) && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Einheitssatz</span>
                              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${
                                isAHKTagsatzung ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-blue-100 text-blue-800 border-blue-200'
                              }`}>
                                {s.esMultiplier === 0 ? 'keiner' : 'einfach'}
                              </span>
                            </div>
                            <div className="flex p-1 gap-1 bg-slate-200/60 rounded-xl shadow-inner">
                              {[{ val: 0, label: 'keiner' }, { val: 1, label: 'einfach' }].map((opt) => (
                                <button
                                  key={opt.val}
                                  onClick={() => updateHaftService(s.id, { esMultiplier: opt.val })}
                                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                                    s.esMultiplier === opt.val
                                      ? (isAHKTagsatzung ? 'text-amber-800 bg-white shadow-sm ring-1 ring-amber-500/20' : 'text-blue-800 bg-white shadow-sm ring-1 ring-blue-500/20')
                                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Ergebnis-Box für Tagsatzungen/Kommissionen */}
                        <div className="mt-2 p-4 bg-gradient-to-br from-amber-50 to-slate-50 rounded-2xl border border-amber-200/50 space-y-3">
                          <div className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                            {isAHKTagsatzung ? tpLabel : 'RATG Entlohnung'}
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-600">Entlohnung ({s.durationHalbeStunden} × ½ Std.)</span>
                              <span className="font-mono text-xs font-bold text-slate-800">{formatEuro(entlohnung)}</span>
                            </div>
                            {(isRATGKommission || isAHKTagsatzung) && esZuschlag > 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-600">Einheitssatz {Math.round(esRate * 100)}%</span>
                                <span className="font-mono text-xs font-bold text-slate-800">{formatEuro(esZuschlag)}</span>
                              </div>
                            )}
                          </div>
                          <div className="border-t border-amber-200/50 pt-3 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-700 font-medium">Summe netto</span>
                              <span className="font-mono text-sm font-bold text-slate-900">{formatEuro((isRATGKommission || isAHKTagsatzung) ? entlohnung + esZuschlag : entlohnung)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-600">+ 20% USt</span>
                              <span className="font-mono text-xs font-bold text-slate-700">{formatEuro(Math.round(((isRATGKommission || isAHKTagsatzung) ? entlohnung + esZuschlag : entlohnung) * 0.2))}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-amber-200/30">
                              <span className="text-xs text-slate-700 font-bold">Brutto</span>
                              <span className="font-mono text-base font-black text-amber-700">{formatEuro(((isRATGKommission || isAHKTagsatzung) ? entlohnung + esZuschlag : entlohnung) + Math.round(((isRATGKommission || isAHKTagsatzung) ? entlohnung + esZuschlag : entlohnung) * 0.2))}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Schriftsätze (ohne DAUER) - AHK und RATG */}
                    {isSchriftsatz && (
                      <div className="space-y-4 pt-2">
                        {/* Einheitssatz - RATG: alle Optionen, AHK: nur keiner/einfach */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Einheitssatz</span>
                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${
                              isAHKSchriftsatz ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-blue-100 text-blue-800 border-blue-200'
                            }`}>
                              {s.esMultiplier === 0 ? 'keiner' : s.esMultiplier === 1 ? 'einfach' : s.esMultiplier === 2 ? 'doppelt' : s.esMultiplier === 3 ? 'dreifach' : 'vierfach'}
                            </span>
                          </div>
                          <div className="flex p-1 gap-1 bg-slate-200/60 rounded-xl shadow-inner">
                            {(isAHKSchriftsatz
                              ? [{ val: 0, label: 'keiner' }, { val: 1, label: 'einfach' }]
                              : [
                                  { val: 0, label: 'keiner' },
                                  { val: 1, label: 'einfach' },
                                  { val: 2, label: 'doppelt' },
                                  { val: 3, label: 'dreifach' },
                                  { val: 4, label: 'vierfach' }
                                ]
                            ).map((opt) => (
                              <button
                                key={opt.val}
                                onClick={() => updateHaftService(s.id, { esMultiplier: opt.val })}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                                  s.esMultiplier === opt.val
                                    ? (isAHKSchriftsatz ? 'text-amber-800 bg-white shadow-sm ring-1 ring-amber-500/20' : 'text-blue-800 bg-white shadow-sm ring-1 ring-blue-500/20')
                                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* ERV-Beitrag */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-slate-500" />
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">ERV-Beitrag (§ 23a)</span>
                          </div>
                          <div className="flex p-1 gap-1 bg-slate-200/60 rounded-xl shadow-inner">
                            {[
                              { val: 'none', label: 'Aus' },
                              { val: 'regular', label: 'Regulär' },
                              { val: 'initial', label: 'Erstmals' }
                            ].map((opt) => (
                              <button
                                key={opt.val}
                                onClick={() => updateHaftService(s.id, {
                                  includeErv: opt.val !== 'none',
                                  ervRateOverride: opt.val === 'none' ? undefined : opt.val as 'initial' | 'regular'
                                })}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                                  (opt.val === 'none' && !s.includeErv) ||
                                  (opt.val === 'regular' && s.includeErv && s.ervRateOverride === 'regular') ||
                                  (opt.val === 'initial' && s.includeErv && (s.ervRateOverride === 'initial' || !s.ervRateOverride))
                                    ? 'text-blue-800 bg-white shadow-sm ring-1 ring-blue-500/20'
                                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Ergebnis-Box für Schriftsätze - wie Zivilrecht */}
                        <div className="mt-2 p-4 bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl border border-blue-200/50 space-y-3">
                          <div className="text-[10px] font-black text-blue-700 uppercase tracking-widest">
                            {isAHKSchriftsatz ? `${tpLabel} - Ergebnis` : `Schriftsatz ${tpLabel} - Ergebnis`}
                          </div>
                          <div className="space-y-2">
                            {needsRATGTarif && (
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-600">Tarifstufe</span>
                                <span className="font-mono text-xs font-bold text-slate-800">{tariffLabel}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-600">Entlohnung</span>
                              <span className="font-mono text-xs font-bold text-slate-800">{formatEuro(entlohnung)}</span>
                            </div>
                            {esZuschlag > 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-600">Einheitssatz {Math.round(esRate * 100)}%</span>
                                <span className="font-mono text-xs font-bold text-slate-800">{formatEuro(esZuschlag)}</span>
                              </div>
                            )}
                            {s.includeErv && (
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-600">ERV-Beitrag</span>
                                <span className="font-mono text-xs font-bold text-slate-800">{formatEuro(ervAmount)}</span>
                              </div>
                            )}
                          </div>
                          <div className="border-t border-blue-200/50 pt-3 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-700 font-medium">Summe netto</span>
                              <span className="font-mono text-sm font-bold text-slate-900">{formatEuro(nettoSumme)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-600">20% USt.</span>
                              <span className="font-mono text-xs font-bold text-slate-700">{formatEuro(ust)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-blue-200/30">
                              <span className="text-xs text-slate-700 font-bold">Summe brutto</span>
                              <span className="font-mono text-base font-black text-blue-700">{formatEuro(nettoSumme + ust)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Kilometer-Eingabe für Reisekosten */}
                    {hasKm && (
                      <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-3 items-center">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Kilometer</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              value={s.kilometerHin ?? 0}
                              onChange={e => updateHaftService(s.id, { kilometerHin: Math.max(0, Number(e.target.value)) })}
                              className="w-20 bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-sm font-bold text-center text-slate-800 shadow-[0_2px_4px_rgba(0,0,0,0.06)]"
                            />
                            <span className="text-sm text-slate-700 font-bold">km</span>
                          </div>
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Richtung</label>
                          <button
                            onClick={() => updateHaftService(s.id, { isRueckfahrt: !s.isRueckfahrt })}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                              s.isRueckfahrt
                                ? 'bg-amber-500 text-white border border-amber-400'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {s.isRueckfahrt ? '↔ Hin + Rückfahrt' : '→ Nur Hinfahrt'}
                          </button>
                        </div>
                        {/* Ergebnis */}
                        <div className="p-4 bg-gradient-to-br from-amber-50 to-slate-50 rounded-2xl border border-amber-200/50">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-700">{(s.kilometerHin ?? 0) * (s.isRueckfahrt ? 2 : 1)} km × € 0,50</span>
                            <span className="font-mono text-base font-black text-amber-700">{formatEuro(entlohnung)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reisezeit */}
                    {s.leistungType === 'HAFT_REISEZEIT' && (
                      <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-3 items-center">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Reisezeit</label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateHaftService(s.id, { durationHalbeStunden: Math.max(1, s.durationHalbeStunden - 1) })}
                              className="w-9 h-9 rounded-xl bg-gradient-to-b from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border border-slate-300/50 flex items-center justify-center text-slate-700 font-bold text-lg shadow-[0_2px_4px_rgba(0,0,0,0.08)] active:shadow-inner active:scale-95 transition-all"
                            >−</button>
                            <input
                              type="number"
                              min="1"
                              value={s.durationHalbeStunden}
                              onChange={e => updateHaftService(s.id, { durationHalbeStunden: Math.max(1, Number(e.target.value)) })}
                              className="w-14 bg-white border border-slate-200/80 rounded-xl px-2 py-2 text-sm font-bold text-center text-slate-800 shadow-[0_2px_4px_rgba(0,0,0,0.06)]"
                            />
                            <button
                              onClick={() => updateHaftService(s.id, { durationHalbeStunden: s.durationHalbeStunden + 1 })}
                              className="w-9 h-9 rounded-xl bg-gradient-to-b from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border border-slate-300/50 flex items-center justify-center text-slate-700 font-bold text-lg shadow-[0_2px_4px_rgba(0,0,0,0.08)] active:shadow-inner active:scale-95 transition-all"
                            >+</button>
                            <span className="text-sm text-slate-700 font-bold ml-1">½ Std.</span>
                          </div>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-amber-50 to-slate-50 rounded-2xl border border-amber-200/50">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-700">{s.durationHalbeStunden} × € 33,90 (TP 9/4)</span>
                            <span className="font-mono text-base font-black text-amber-700">{formatEuro(entlohnung)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </GlassCard>
                );
              })}

              {/* Add Haft-Service Button */}
              <div className="relative">
                <button
                  onClick={() => setShowHaftCatalog(!showHaftCatalog)}
                  className="w-full py-4 rounded-2xl border-2 border-dashed border-amber-500/30 text-amber-400/70 hover:text-amber-400 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest group"
                >
                  <Plus className="h-4 w-4 group-hover:scale-125 transition-transform" /> Haft-Leistung Hinzufügen
                </button>

                {showHaftCatalog && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-2 p-3 rounded-2xl bg-slate-900 border border-amber-500/20 shadow-2xl backdrop-blur-3xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="relative mb-3">
                      <input
                        autoFocus
                        placeholder="Suchen (z.B. Besuch, Grundrechtsbeschwerde...)"
                        value={haftSearchTerm}
                        onChange={(e) => setHaftSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-3 pr-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                    </div>
                    {haftSearchTerm ? (
                      <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-1">
                        {filteredHaftCatalog.map(entry => (
                          <button
                            key={entry.type}
                            onClick={() => addHaftService(entry.type)}
                            className="w-full text-left p-2 rounded-lg hover:bg-white/10 transition-colors group"
                          >
                            <span className="text-sm font-medium text-white/90 group-hover:text-amber-400">{entry.short}</span>
                            <span className="text-xs text-slate-500 block">{entry.full}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                        {(Object.entries(groupedHaftCatalog) as [string, typeof HAFT_CATALOG][]).map(([cat, entries]) => (
                          entries.length > 0 && (
                            <div key={cat}>
                              <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2 px-2">
                                {HAFT_CATEGORY_LABELS[cat as keyof typeof HAFT_CATEGORY_LABELS]}
                              </p>
                              <div className="space-y-1">
                                {entries.map((entry) => (
                                  <button
                                    key={entry.type}
                                    onClick={() => addHaftService(entry.type)}
                                    className="w-full text-left p-2 rounded-lg hover:bg-white/10 transition-colors group flex items-center gap-2"
                                  >
                                    <span className={`px-2 py-1 rounded-lg text-white text-[10px] font-black shrink-0 ${
                                      entry.category === 'VERHANDLUNG' ? 'bg-amber-600' :
                                      entry.category === 'SCHRIFTSATZ' ? 'bg-blue-500' :
                                      entry.category === 'BESUCH' ? 'bg-emerald-500' :
                                      'bg-slate-500'
                                    }`}>
                                      {entry.category === 'VERHANDLUNG' ? 'VH' :
                                       entry.category === 'SCHRIFTSATZ' ? 'SS' :
                                       entry.category === 'BESUCH' ? 'TP7' :
                                       'BAR'}
                                    </span>
                                    <span className="text-sm font-medium text-white/90 group-hover:text-amber-400">{entry.short}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            )}

            {/* === V-STRAF SERVICE CARDS === */}
            {caseMode === CaseMode.VSTRAF && (
            <div className="space-y-3">
              {vstrafServices.map((s, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === vstrafServices.length - 1;

                // Kategorisierung
                const isVH = isVStrafTagsatzung(s.leistungType);
                const isSchriftsatz = s.leistungType.includes('BESCHWERDE');
                const isRATG = s.leistungType.startsWith('VSTRAF_RATG') || s.leistungType === 'VSTRAF_ZUWARTEN';

                const hasDuration = isVH || s.leistungType === 'VSTRAF_RATG_TP7_2' || s.leistungType === 'VSTRAF_ZUWARTEN';

                // Berechnung
                const currentBmgl = vstrafBmgl;
                let entlohnung = 0;
                let tariffLabel = '';
                let tpLabel = '';

                const courtType = getVStrafCourtType(vstrafStufe);
                const tarife = AHK_TARIFE[courtType];

                if (isVH && tarife) {
                  if (s.leistungType === 'VSTRAF_VH_1_INSTANZ') {
                    const t = tarife.hv1Instanz;
                    entlohnung = t.firstHalf + Math.max(0, s.durationHalbeStunden - 1) * t.subsequentHalf;
                    tpLabel = '§ 13 AHK';
                  } else if (s.leistungType === 'VSTRAF_BERUFUNG_VH_VOLL' || s.leistungType === 'VSTRAF_BERUFUNG_VH_STRAFE') {
                    const t = tarife.berufungVhVoll || tarife.berufungVh;
                    if (t) {
                      entlohnung = t.firstHalf + Math.max(0, s.durationHalbeStunden - 1) * t.subsequentHalf;
                    }
                    tpLabel = '§ 13 AHK';
                  }
                  tariffLabel = VSTRAF_STUFE_LABELS[vstrafStufe];
                } else if (s.leistungType === 'VSTRAF_BESCHWERDE_VOLL' || s.leistungType === 'VSTRAF_BESCHWERDE_STRAFE') {
                  if (tarife) {
                    if (s.isNurStrafhoehe && tarife.berufungStrafe) {
                      entlohnung = tarife.berufungStrafe;
                    } else if (tarife.berufungVoll) {
                      entlohnung = tarife.berufungVoll;
                    } else if (tarife.berufung) {
                      entlohnung = tarife.berufung;
                    } else {
                      const tp3b = getTariffBase(currentBmgl, 'TP3B');
                      entlohnung = tp3b.base;
                    }
                  }
                  tpLabel = '§ 13 AHK';
                  tariffLabel = VSTRAF_STUFE_LABELS[vstrafStufe];
                } else if (s.leistungType === 'VSTRAF_RATG_TP7_2' || s.leistungType === 'VSTRAF_ZUWARTEN') {
                  const kommResult = getKommission(currentBmgl, s.durationHalbeStunden, 0, true);
                  entlohnung = kommResult.kommission;
                  tpLabel = 'TP 7/2 RATG';
                  tariffLabel = `BMGL € ${(currentBmgl / 100).toLocaleString('de-AT')}`;
                } else if (s.leistungType === 'VSTRAF_RATG_TP3A') {
                  const tariffResult = getTariffBase(currentBmgl, 'TP3A');
                  entlohnung = tariffResult.base;
                  tpLabel = 'TP 3A RATG';
                  tariffLabel = tariffResult.label;
                } else if (s.leistungType === 'VSTRAF_RATG_TP3B') {
                  const tariffResult = getTariffBase(currentBmgl, 'TP3B');
                  entlohnung = tariffResult.base;
                  tpLabel = 'TP 3B RATG';
                  tariffLabel = tariffResult.label;
                } else if (s.leistungType === 'VSTRAF_RATG_TP2') {
                  const tariffResult = getTariffBase(currentBmgl, 'TP2');
                  entlohnung = tariffResult.base;
                  tpLabel = 'TP 2 RATG';
                  tariffLabel = tariffResult.label;
                }

                // ES-Rate berechnen
                const esBaseRate = currentBmgl <= 1017000 ? 0.6 : 0.5;
                const isZeitgebuehr = s.leistungType === 'VSTRAF_RATG_TP7_2' || s.leistungType === 'VSTRAF_ZUWARTEN';
                const esMultiplierCapped = (isVH || isZeitgebuehr) ? Math.min(s.esMultiplier, 1) : s.esMultiplier;
                const esRate = esMultiplierCapped * esBaseRate;
                const esZuschlag = Math.round(entlohnung * esRate);

                // ERV
                const ervAmount = s.includeErv
                  ? (s.ervRateOverride === 'regular' ? 260 : 500)
                  : 0;
                const nettoSumme = entlohnung + esZuschlag + ervAmount;
                const ust = Math.round(nettoSumme * 0.2);

                return (
                <GlassCard key={s.id} className="!p-4 relative group/item" variant="light">
                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 z-20">
                    {vstrafServices.length > 1 && (
                      <>
                        <button
                          onClick={() => moveVstrafServiceUp(s.id)}
                          disabled={isFirst}
                          className={`p-1.5 rounded-lg border transition-colors ${isFirst ? 'text-slate-300 bg-slate-100 border-slate-200 cursor-not-allowed' : 'text-slate-500 hover:text-orange-600 bg-white/60 border-slate-200 hover:border-orange-300'}`}
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => moveVstrafServiceDown(s.id)}
                          disabled={isLast}
                          className={`p-1.5 rounded-lg border transition-colors ${isLast ? 'text-slate-300 bg-slate-100 border-slate-200 cursor-not-allowed' : 'text-slate-500 hover:text-orange-600 bg-white/60 border-slate-200 hover:border-orange-300'}`}
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => removeVstrafService(s.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors bg-white/60 p-1.5 rounded-lg border border-slate-200"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3 relative z-10">
                    {/* Header */}
                    <div className="flex items-center gap-2 pr-24">
                      <input
                        type="date"
                        value={s.date}
                        onChange={e => updateVstrafService(s.id, { date: e.target.value })}
                        className="bg-white/60 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 shadow-sm w-28"
                      />
                      <span className={`px-2 py-1 rounded-lg text-white text-[10px] font-black shrink-0 ${
                        isVH || isSchriftsatz ? 'bg-orange-600' : 'bg-blue-500'
                      }`}>
                        {isVH || isSchriftsatz ? '§13 AHK' : tpLabel || 'RATG'}
                      </span>
                      {s.isNurStrafhoehe && (
                        <span className="px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-[10px] font-bold">
                          nur Strafhöhe
                        </span>
                      )}
                    </div>

                    {/* Service Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenVstrafServiceDropdown(openVstrafServiceDropdown === s.id ? null : s.id)}
                        className="w-full bg-slate-800 border-none rounded-xl px-3 py-2 text-sm font-bold text-white text-left cursor-pointer pr-8 shadow-lg ring-1 ring-white/10 hover:bg-slate-700 transition-colors"
                      >
                        {s.label || 'Leistung wählen...'}
                      </button>
                      <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none transition-transform ${openVstrafServiceDropdown === s.id ? 'rotate-180' : ''}`} />

                      {openVstrafServiceDropdown === s.id && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-2 p-3 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl backdrop-blur-3xl max-h-[400px] overflow-y-auto custom-scrollbar">
                          {(Object.entries(groupedVstrafCatalog) as [VStrafCatalogCategory, typeof vstrafCatalog][]).map(([cat, entries]) => (
                            entries.length > 0 && (
                              <div key={cat}>
                                <div className={`text-[11px] font-black uppercase tracking-widest px-2 py-1 mb-1 mt-2 first:mt-0 ${
                                  cat === 'VERHANDLUNG' ? 'text-orange-400' :
                                  cat === 'SCHRIFTSATZ' ? 'text-blue-400' : 'text-slate-400'
                                }`}>
                                  {VSTRAF_CATEGORY_LABELS[cat]}
                                </div>
                                {entries.map(entry => (
                                  <button
                                    key={entry.id}
                                    onClick={() => {
                                      const defaults = getDefaultVStrafService(entry.leistungType);
                                      updateVstrafService(s.id, {
                                        leistungType: entry.leistungType,
                                        label: entry.short,
                                        durationHalbeStunden: defaults.durationHalbeStunden,
                                        esMultiplier: defaults.esMultiplier,
                                        includeErv: defaults.includeErv,
                                        isNurStrafhoehe: entry.leistungType.includes('_STRAFE'),
                                      });
                                      setOpenVstrafServiceDropdown(null);
                                    }}
                                    className="w-full text-left p-2 rounded-lg hover:bg-white/10 transition-colors"
                                  >
                                    <span className="text-sm font-medium text-white/90 group-hover:text-orange-400">{entry.short}</span>
                                    <span className="text-xs text-slate-500 block">{entry.full}</span>
                                  </button>
                                ))}
                              </div>
                            )
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Dauer für VH und TP 7/2 */}
                    {hasDuration && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span className="text-xs text-slate-600 font-bold">Dauer:</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateVstrafService(s.id, { durationHalbeStunden: Math.max(1, s.durationHalbeStunden - 1) })}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold"
                          >-</button>
                          <input
                            type="number"
                            min={1}
                            value={s.durationHalbeStunden}
                            onChange={e => updateVstrafService(s.id, { durationHalbeStunden: Math.max(1, Number(e.target.value)) })}
                            className="w-12 bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold text-center text-slate-800"
                          />
                          <button
                            onClick={() => updateVstrafService(s.id, { durationHalbeStunden: s.durationHalbeStunden + 1 })}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold"
                          >+</button>
                          <span className="text-sm text-slate-500 ml-1">½ Std.</span>
                        </div>
                      </div>
                    )}

                    {/* ES Auswahl */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600 font-bold flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-slate-400" /> Einheitssatz
                      </span>
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map(mult => {
                          const maxMult = (isVH || isZeitgebuehr) ? 1 : 4;
                          const disabled = mult > maxMult;
                          return (
                            <button
                              key={mult}
                              disabled={disabled}
                              onClick={() => updateVstrafService(s.id, { esMultiplier: mult })}
                              className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                                disabled ? 'bg-slate-100 text-slate-300 cursor-not-allowed' :
                                s.esMultiplier === mult
                                  ? 'bg-orange-500 text-white shadow-lg'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'
                              }`}
                            >
                              {mult}×
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* ERV Toggle */}
                    {!isVH && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-200/50">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-xs text-slate-700 font-bold">ERV-Beitrag</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {s.includeErv && (
                            <select
                              value={s.ervRateOverride || 'initial'}
                              onChange={e => updateVstrafService(s.id, { ervRateOverride: e.target.value as 'initial' | 'regular' })}
                              className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-bold"
                            >
                              <option value="initial">€ 5,00</option>
                              <option value="regular">€ 2,60</option>
                            </select>
                          )}
                          <button
                            onClick={() => updateVstrafService(s.id, { includeErv: !s.includeErv })}
                            className={`relative w-10 h-6 rounded-full transition-all ${s.includeErv ? 'bg-orange-500' : 'bg-slate-200'}`}
                          >
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${s.includeErv ? 'translate-x-4' : ''}`}></div>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Kosten-Zusammenfassung */}
                    <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200/50 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">{tpLabel} Entlohnung</span>
                        <span className="font-mono font-bold text-slate-800">{formatEuro(entlohnung)}</span>
                      </div>
                      {esZuschlag > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">+ ES {(esRate * 100).toFixed(0)}%</span>
                          <span className="font-mono font-bold text-slate-700">{formatEuro(esZuschlag)}</span>
                        </div>
                      )}
                      {ervAmount > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">+ ERV-Beitrag</span>
                          <span className="font-mono font-bold text-slate-700">{formatEuro(ervAmount)}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-orange-200/50 flex justify-between">
                        <span className="text-sm font-bold text-slate-700">Netto</span>
                        <span className="font-mono text-lg font-black text-orange-700">{formatEuro(nettoSumme)}</span>
                      </div>
                      {!isVatFree && (
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>+ 20% USt</span>
                          <span className="font-mono">{formatEuro(ust)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
                );
              })}

              {/* Add V-Straf Service Button */}
              <div className="relative">
                <button
                  onClick={() => setShowVstrafCatalog(!showVstrafCatalog)}
                  className="w-full py-4 rounded-2xl border-2 border-dashed border-orange-500/30 text-orange-400/70 hover:text-orange-400 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest group"
                >
                  <Plus className="h-4 w-4 group-hover:scale-125 transition-transform" /> V-Straf Leistung Hinzufügen
                </button>

                {showVstrafCatalog && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-2 p-3 rounded-2xl bg-slate-900 border border-orange-500/20 shadow-2xl backdrop-blur-3xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="relative mb-3">
                      <input
                        autoFocus
                        placeholder="Suchen (z.B. Verhandlung, Beschwerde...)"
                        value={vstrafSearchTerm}
                        onChange={(e) => setVstrafSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-3 pr-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-orange-500/30"
                      />
                    </div>
                    {vstrafSearchTerm ? (
                      <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-1">
                        {filteredVstrafCatalog.map(entry => (
                          <button
                            key={entry.id}
                            onClick={() => addVstrafService(entry.leistungType, entry.short)}
                            className="w-full text-left p-2 rounded-lg hover:bg-white/10 transition-colors group"
                          >
                            <span className="text-sm font-medium text-white/90 group-hover:text-orange-400">{entry.short}</span>
                            <span className="text-xs text-slate-500 block">{entry.full}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                        {(Object.entries(groupedVstrafCatalog) as [VStrafCatalogCategory, typeof vstrafCatalog][]).map(([cat, entries]) => (
                          entries.length > 0 && (
                            <div key={cat}>
                              <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-2 px-2">
                                {VSTRAF_CATEGORY_LABELS[cat]}
                              </p>
                              <div className="space-y-1">
                                {entries.map((entry) => (
                                  <button
                                    key={entry.id}
                                    onClick={() => addVstrafService(entry.leistungType, entry.short)}
                                    className="w-full text-left p-2 rounded-lg hover:bg-white/10 transition-colors group flex items-center gap-2"
                                  >
                                    <span className={`px-2 py-1 rounded-lg text-white text-[10px] font-black shrink-0 ${
                                      cat === 'VERHANDLUNG' ? 'bg-orange-600' :
                                      cat === 'SCHRIFTSATZ' ? 'bg-blue-500' :
                                      'bg-slate-500'
                                    }`}>
                                      {cat === 'VERHANDLUNG' ? 'VH' : cat === 'SCHRIFTSATZ' ? 'SS' : 'RATG'}
                                    </span>
                                    <span className="text-sm font-medium text-white/90 group-hover:text-orange-400">{entry.short}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sort Button */}
              {vstrafServices.length > 1 && (
                <button
                  onClick={sortVstrafServicesByDate}
                  className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-400 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowUpDown className="h-3 w-3" />
                  Nach Datum sortieren
                </button>
              )}
            </div>
            )}
          </div>

          {/* Kostenverzeichnis - Right Column (sticky) */}
          <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-8 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto custom-scrollbar">
            <GlassCard variant="dark" title="Kostenverzeichnis">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-separate border-spacing-y-1">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">
                      <th className="pb-4 pl-2">Datum</th>
                      <th className="pb-4">Leistung</th>
                      <th className="pb-4">Gesetz</th>
                      <th className="pb-4 text-center">Info</th>
                      <th className="pb-4 pr-2 text-right">Betrag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const rows: React.ReactNode[] = [];
                      let currentServiceId = '';
                      let currentSubtotal = 0;

                      if (results.lines.length === 0) {
                        rows.push(
                          <tr key="empty">
                            <td colSpan={5} className="py-16 text-center">
                              <FileText className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                              <p className="text-slate-500 font-bold">Noch keine Leistungen hinzugefügt.</p>
                            </td>
                          </tr>
                        );
                      } else {
                        results.lines.forEach((line, i) => {
                          if (showSubtotals && currentServiceId !== '' && line.serviceId !== currentServiceId) {
                            rows.push(
                              <tr key={`subtotal-${currentServiceId}`} className="bg-white/5">
                                <td colSpan={4} className="py-2 pl-2 text-right">
                                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest mr-4">Zwischensumme Block:</span>
                                </td>
                                <td className="py-2 pr-2 text-right font-bold text-blue-300/60 font-mono text-xs border-t border-white/10">
                                  {formatEuro(currentSubtotal)}
                                </td>
                              </tr>
                            );
                            currentSubtotal = 0;
                          }
                          currentServiceId = line.serviceId || '';
                          currentSubtotal += line.amountCents;

                          rows.push(
                            <tr key={i} className="group hover:bg-white/5 transition-colors">
                              <td className="py-4 pl-2 font-mono text-[11px] text-slate-500">
                                {new Date(line.date).toLocaleDateString('de-AT')}
                              </td>
                              <td className="py-4">
                                <div className={`font-bold tracking-tight ${["Tarifpost 1 GGG", "§ 23a RATG"].includes(line.section) ? 'text-blue-400' : line.section.includes('§ 15') ? 'text-amber-400' : 'text-white/90'}`}>
                                  {line.label}
                                </div>
                              </td>
                              <td className="py-4">
                                <span className="px-2 py-0.5 rounded-lg bg-white/5 text-slate-400 text-[10px] font-black border border-white/10">
                                  {line.section}
                                </span>
                              </td>
                              <td className="py-4 text-center">
                                <button
                                  onClick={() => setActiveInfo(line)}
                                  className="p-1.5 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-all"
                                >
                                  <Info className="h-4 w-4" />
                                </button>
                              </td>
                              <td className="py-4 pr-2 text-right font-bold text-white font-mono">
                                {formatEuro(line.amountCents)}
                              </td>
                            </tr>
                          );

                          if (showSubtotals && i === results.lines.length - 1) {
                            rows.push(
                              <tr key={`subtotal-final-${currentServiceId}`} className="bg-white/5">
                                <td colSpan={4} className="py-2 pl-2 text-right">
                                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest mr-4">Zwischensumme Block:</span>
                                </td>
                                <td className="py-2 pr-2 text-right font-bold text-blue-300/60 font-mono text-xs border-t border-white/10">
                                  {formatEuro(currentSubtotal)}
                                </td>
                              </tr>
                            );
                          }
                        });
                      }
                      return rows;
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Summary Section */}
              <div className="mt-8 pt-8 border-t border-white/20 space-y-4">
                <div className="flex justify-between items-center px-4">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Netto-Bemessung (Honorar + ERV)</span>
                  <span className="font-bold text-white text-lg font-mono">{formatEuro(results.netCents)}</span>
                </div>
                <div className="flex justify-between items-center px-4">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Umsatzsteuer (20%)</span>
                  <span className="font-bold text-white text-lg font-mono">{formatEuro(results.vatCents)}</span>
                </div>
                <div className="flex justify-between items-center px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Pauschalgebühren (GGG)</span>
                    <button
                      onClick={() => {
                        const gggLine = results.lines.find(l => l.section.includes("GGG"));
                        if (gggLine) setActiveInfo(gggLine);
                      }}
                      className="p-1.5 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-all"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="font-bold text-blue-400 text-lg font-mono">{formatEuro(results.gggCents)}</span>
                </div>

                {/* Grand Total */}
                <div className="relative p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600/40 to-slate-900 border border-blue-400/40 flex justify-between items-center shadow-2xl mt-8 overflow-hidden group">
                  <div className="absolute inset-0 bg-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-300 block mb-1">Gesamtsumme Brutto</span>
                    <span className="text-5xl font-black text-white tracking-tighter font-mono drop-shadow-[0_0_15px_rgba(96,165,250,0.3)]">{formatEuro(results.totalCents)}</span>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="bg-white/10 p-5 rounded-full border border-white/20 hover:bg-white/20 transition-all active:scale-95 shadow-lg"
                  >
                    <Download className="h-8 w-8 text-white" />
                  </button>
                </div>
              </div>
            </GlassCard>

            {/* Footer Info */}
            <div className="flex gap-4 p-5 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-md">
              <Settings2 className="h-5 w-5 text-slate-500 shrink-0" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                Rechtsgrundlage: RATG/AHK & GGG 2025. Alle Berechnungen inkl. 10-Cent-Rundung für vT-Zuschläge (§ 15 GGG / RATG) und steuerpflichtigem ERV-Beitrag (§ 23a RATG).
              </p>
            </div>
          </div>
        </div>
          </>
        )}
      </div>

      <style>{`
        .animate-blob { animation: blob 20s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 4s; }
        .animate-spin-slow { animation: spin 3s linear infinite; }
        .will-change-transform { will-change: transform; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(20px, -30px) scale(1.05); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default App;
