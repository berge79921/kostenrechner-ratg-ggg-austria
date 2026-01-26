// CSV Import für Kostennoten

import {
  CaseMetadata,
  DEFAULT_CASE_METADATA,
  CaseMode,
  ProcedureType,
  LegalService,
  ServiceType,
  StrafService,
  HaftService,
  HaftBmglStufe,
  HaftLeistungType,
  VStrafService,
  VStrafStufe,
  VStrafLeistungType,
} from '../types';
import type { CourtType, StrafLeistungType } from './ahk';
import type { ExportState } from './csvExport';

export interface ImportResult {
  success: boolean;
  state?: ExportState;
  errors: string[];
  warnings: string[];
}

function unescapeCSV(value: string): string {
  if (!value) return '';
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/""/g, '"');
  }
  return value;
}

function parseBool(value: string): boolean {
  return value === '1' || value.toLowerCase() === 'true';
}

function parseNumber(value: string, defaultVal: number = 0): number {
  if (value === '' || value === null || value === undefined) return defaultVal;
  const num = Number(value);
  return isNaN(num) ? defaultVal : num;
}

function parseOptionalNumber(value: string): number | undefined {
  if (value === '' || value === null || value === undefined) return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}

function parseCivilService(parts: string[]): LegalService | null {
  if (parts.length < 8) return null;
  return {
    id: parts[0],
    date: parts[1],
    label: unescapeCSV(parts[2]),
    type: parts[3] as ServiceType,
    durationHours: parseNumber(parts[4], 1),
    esMultiplier: parseNumber(parts[5], 1),
    includeErv: parseBool(parts[6]),
    isInitiating: parseBool(parts[7]),
    isAuswaerts: parseBool(parts[8] ?? '0'),
    waitingUnits: parseOptionalNumber(parts[9] ?? ''),
    customESRate: parseOptionalNumber(parts[10] ?? ''),
    ervRateOverride: (parts[11] as 'initial' | 'regular' | undefined) || undefined,
    customBmgl: parseOptionalNumber(parts[12] ?? ''),
    customParties: parseOptionalNumber(parts[13] ?? ''),
    verbindung: (parts[14] as LegalService['verbindung']) || undefined,
    is473aZPO: parseBool(parts[15] ?? '0'),
    isRaRaaErforderlich: parseBool(parts[16] ?? '0'),
    tp: parts[17] || undefined,
  };
}

function parseStrafService(parts: string[]): StrafService | null {
  if (parts.length < 8) return null;
  return {
    id: parts[0],
    date: parts[1],
    label: unescapeCSV(parts[2]),
    leistungType: parts[3] as StrafLeistungType,
    durationHalbeStunden: parseNumber(parts[4], 2),
    waitingHalbeStunden: parseNumber(parts[5], 0),
    esMultiplier: parseNumber(parts[6], 1),
    includeErv: parseBool(parts[7]),
    ervRateOverride: (parts[8] as 'initial' | 'regular' | undefined) || undefined,
    customStreitgenossen: parseOptionalNumber(parts[9] ?? ''),
    isFrustriert: parseBool(parts[10] ?? '0'),
    nbUndBerufung: parseBool(parts[11] ?? '0'),
    verteidigerUndPb: parseBool(parts[12] ?? '0'),
  };
}

function parseHaftService(parts: string[]): HaftService | null {
  if (parts.length < 8) return null;
  return {
    id: parts[0],
    date: parts[1],
    label: unescapeCSV(parts[2]),
    leistungType: parts[3] as HaftLeistungType,
    durationHalbeStunden: parseNumber(parts[4], 2),
    waitingHalbeStunden: parseNumber(parts[5], 0),
    esMultiplier: parseNumber(parts[6], 1),
    includeErv: parseBool(parts[7]),
    ervRateOverride: (parts[8] as 'initial' | 'regular' | undefined) || undefined,
    kilometerHin: parseOptionalNumber(parts[9] ?? ''),
    isRueckfahrt: parseBool(parts[10] ?? '0'),
    isFrustriert: parseBool(parts[11] ?? '0'),
  };
}

function parseVStrafService(parts: string[]): VStrafService | null {
  if (parts.length < 8) return null;
  return {
    id: parts[0],
    date: parts[1],
    label: unescapeCSV(parts[2]),
    leistungType: parts[3] as VStrafLeistungType,
    durationHalbeStunden: parseNumber(parts[4], 2),
    waitingHalbeStunden: parseNumber(parts[5], 0),
    esMultiplier: parseNumber(parts[6], 1),
    includeErv: parseBool(parts[7]),
    ervRateOverride: (parts[8] as 'initial' | 'regular' | undefined) || undefined,
    isNurStrafhoehe: parseBool(parts[9] ?? '0'),
  };
}

// Robuster CSV-Parser: behandelt Felder mit Semikolon korrekt
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          // End of quoted field
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ';') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

export function importFromCSV(csv: string): ImportResult {
  const lines = csv.split(/\r?\n/).filter(l => l.trim());
  const errors: string[] = [];
  const warnings: string[] = [];

  if (lines.length === 0) {
    return { success: false, errors: ['Leere Datei'], warnings };
  }

  // Validiere Header
  const headerParts = parseCSVLine(lines[0]);
  if (headerParts[0] !== 'KOSTENNOTE' || headerParts[1] !== 'VERSION') {
    return { success: false, errors: ['Ungültiges Dateiformat: Header fehlt oder beschädigt'], warnings };
  }

  const fileVersion = headerParts[2];
  if (fileVersion !== '1.0') {
    warnings.push(`Datei-Version ${fileVersion} - aktuelle Version ist 1.0`);
  }

  // Initialize state
  const state: ExportState = {
    metadata: { ...DEFAULT_CASE_METADATA },
    caseMode: CaseMode.CIVIL,
    isVatFree: false,
    bmgl: 25000,
    procedureType: ProcedureType.ZIVILPROZESS,
    additionalParties: 0,
    autoGgg: true,
    manualGgg: 0,
    isVerbandsklage: false,
    services: [],
    courtType: 'BG' as CourtType,
    strafServices: [],
    strafStreitgenossen: 0,
    erfolgszuschlagProzent: 0,
    haftBmglStufe: 'ER_GH',
    haftServices: [],
    vstrafStufe: 'Z2',
    vstrafVerfallswert: 0,
    vstrafServices: [],
    vstrafStreitgenossen: 0,
    vstrafErfolgszuschlag: 0,
  };

  // Parse lines
  for (let i = 1; i < lines.length; i++) {
    const parts = parseCSVLine(lines[i]);
    const type = parts[0];

    if (type === 'META') {
      const key = parts[1] as keyof CaseMetadata;
      const value = unescapeCSV(parts[2] ?? '');
      if (key in state.metadata) {
        (state.metadata as unknown as Record<string, string>)[key] = value;
      }
    } else if (type === 'STATE') {
      const key = parts[1];
      const value = parts[2] ?? '';
      switch (key) {
        case 'caseMode':
          state.caseMode = value as CaseMode;
          break;
        case 'isVatFree':
          state.isVatFree = parseBool(value);
          break;
        case 'bmgl':
          state.bmgl = parseNumber(value, 25000);
          break;
        case 'procedureType':
          state.procedureType = value as ProcedureType;
          break;
        case 'additionalParties':
          state.additionalParties = parseNumber(value, 0);
          break;
        case 'autoGgg':
          state.autoGgg = parseBool(value);
          break;
        case 'manualGgg':
          state.manualGgg = parseNumber(value, 0);
          break;
        case 'isVerbandsklage':
          state.isVerbandsklage = parseBool(value);
          break;
        case 'courtType':
          state.courtType = value as CourtType;
          break;
        case 'strafStreitgenossen':
          state.strafStreitgenossen = parseNumber(value, 0);
          break;
        case 'erfolgszuschlagProzent':
          state.erfolgszuschlagProzent = parseNumber(value, 0);
          break;
        case 'haftBmglStufe':
          state.haftBmglStufe = value as HaftBmglStufe;
          break;
        case 'vstrafStufe':
          state.vstrafStufe = value as VStrafStufe;
          break;
        case 'vstrafVerfallswert':
          state.vstrafVerfallswert = parseNumber(value, 0);
          break;
        case 'vstrafStreitgenossen':
          state.vstrafStreitgenossen = parseNumber(value, 0);
          break;
        case 'vstrafErfolgszuschlag':
          state.vstrafErfolgszuschlag = parseNumber(value, 0);
          break;
        default:
          warnings.push(`Unbekannter State-Schlüssel: ${key}`);
      }
    } else if (type === 'SERVICE') {
      const mode = parts[1];
      const serviceParts = parts.slice(2);

      if (mode === 'CIVIL') {
        const service = parseCivilService(serviceParts);
        if (service) {
          state.services.push(service);
        } else {
          warnings.push(`Zeile ${i + 1}: Ungültiger CIVIL Service`);
        }
      } else if (mode === 'CRIMINAL') {
        const service = parseStrafService(serviceParts);
        if (service) {
          state.strafServices.push(service);
        } else {
          warnings.push(`Zeile ${i + 1}: Ungültiger CRIMINAL Service`);
        }
      } else if (mode === 'DETENTION') {
        const service = parseHaftService(serviceParts);
        if (service) {
          state.haftServices.push(service);
        } else {
          warnings.push(`Zeile ${i + 1}: Ungültiger DETENTION Service`);
        }
      } else if (mode === 'VSTRAF') {
        const service = parseVStrafService(serviceParts);
        if (service) {
          state.vstrafServices.push(service);
        } else {
          warnings.push(`Zeile ${i + 1}: Ungültiger VSTRAF Service`);
        }
      }
    }
  }

  return { success: true, state, errors, warnings };
}
