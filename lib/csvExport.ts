// CSV Export für Kostennoten

import {
  CaseMetadata,
  CaseMode,
  ProcedureType,
  LegalService,
  StrafService,
  HaftService,
  HaftBmglStufe,
  VStrafService,
  VStrafStufe,
} from '../types';
import type { CourtType } from './ahk';

export interface ExportState {
  metadata: CaseMetadata;
  // Common
  caseMode: CaseMode;
  isVatFree: boolean;
  // Civil
  bmgl: number;
  procedureType: ProcedureType;
  additionalParties: number;
  autoGgg: boolean;
  manualGgg: number;
  isVerbandsklage: boolean;
  services: LegalService[];
  // Criminal
  courtType: CourtType;
  strafServices: StrafService[];
  strafStreitgenossen: number;
  erfolgszuschlagProzent: number;
  // Detention
  haftBmglStufe: HaftBmglStufe;
  haftServices: HaftService[];
  // VStraf
  vstrafStufe: VStrafStufe;
  vstrafVerfallswert: number;
  vstrafServices: VStrafService[];
  vstrafStreitgenossen: number;
  vstrafErfolgszuschlag: number;
}

function escapeCSV(value: string): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(';') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function serializeService(s: LegalService): string {
  return [
    s.id,
    s.date,
    escapeCSV(s.label),
    s.type,
    s.durationHours,
    s.esMultiplier,
    s.includeErv ? '1' : '0',
    s.isInitiating ? '1' : '0',
    s.isAuswaerts ? '1' : '0',
    s.waitingUnits ?? 0,
    s.customESRate ?? '',
    s.ervRateOverride ?? '',
    s.customBmgl ?? '',
    s.customParties ?? '',
    s.verbindung ?? '',
    s.is473aZPO ? '1' : '0',
    s.isRaRaaErforderlich ? '1' : '0',
    s.tp ?? '',
  ].join(';');
}

function serializeStrafService(s: StrafService): string {
  return [
    s.id,
    s.date,
    escapeCSV(s.label),
    s.leistungType,
    s.durationHalbeStunden,
    s.waitingHalbeStunden,
    s.esMultiplier,
    s.includeErv ? '1' : '0',
    s.ervRateOverride ?? '',
    s.customStreitgenossen ?? '',
    s.isFrustriert ? '1' : '0',
    s.nbUndBerufung ? '1' : '0',
    s.verteidigerUndPb ? '1' : '0',
  ].join(';');
}

function serializeHaftService(s: HaftService): string {
  return [
    s.id,
    s.date,
    escapeCSV(s.label),
    s.leistungType,
    s.durationHalbeStunden,
    s.waitingHalbeStunden,
    s.esMultiplier,
    s.includeErv ? '1' : '0',
    s.ervRateOverride ?? '',
    s.kilometerHin ?? '',
    s.isRueckfahrt ? '1' : '0',
    s.isFrustriert ? '1' : '0',
  ].join(';');
}

function serializeVStrafService(s: VStrafService): string {
  return [
    s.id,
    s.date,
    escapeCSV(s.label),
    s.leistungType,
    s.durationHalbeStunden,
    s.waitingHalbeStunden,
    s.esMultiplier,
    s.includeErv ? '1' : '0',
    s.ervRateOverride ?? '',
    s.isNurStrafhoehe ? '1' : '0',
  ].join(';');
}

export function exportToCSV(state: ExportState): string {
  const lines: string[] = [];

  // Header
  lines.push(`KOSTENNOTE;VERSION;1.0;ERSTELLT;${state.metadata.erstelltAm}`);

  // Metadata
  const metaFields = [
    'geschaeftszahl', 'gericht',
    'parteiName', 'parteiStrasse', 'parteiPlz', 'parteiOrt',
    'kanzleiName', 'kanzleiStrasse', 'kanzleiPlz', 'kanzleiOrt',
    'erstelltAm', 'version'
  ] as const;
  for (const key of metaFields) {
    lines.push(`META;${key};${escapeCSV(state.metadata[key])}`);
  }

  // Common state
  lines.push(`STATE;caseMode;${state.caseMode}`);
  lines.push(`STATE;isVatFree;${state.isVatFree ? '1' : '0'}`);

  // Civil state
  lines.push(`STATE;bmgl;${state.bmgl}`);
  lines.push(`STATE;procedureType;${state.procedureType}`);
  lines.push(`STATE;additionalParties;${state.additionalParties}`);
  lines.push(`STATE;autoGgg;${state.autoGgg ? '1' : '0'}`);
  lines.push(`STATE;manualGgg;${state.manualGgg}`);
  lines.push(`STATE;isVerbandsklage;${state.isVerbandsklage ? '1' : '0'}`);

  // Criminal state
  lines.push(`STATE;courtType;${state.courtType}`);
  lines.push(`STATE;strafStreitgenossen;${state.strafStreitgenossen}`);
  lines.push(`STATE;erfolgszuschlagProzent;${state.erfolgszuschlagProzent}`);

  // Detention state
  lines.push(`STATE;haftBmglStufe;${state.haftBmglStufe}`);

  // VStraf state
  lines.push(`STATE;vstrafStufe;${state.vstrafStufe}`);
  lines.push(`STATE;vstrafVerfallswert;${state.vstrafVerfallswert}`);
  lines.push(`STATE;vstrafStreitgenossen;${state.vstrafStreitgenossen}`);
  lines.push(`STATE;vstrafErfolgszuschlag;${state.vstrafErfolgszuschlag}`);

  // Services
  for (const s of state.services) {
    lines.push(`SERVICE;CIVIL;${serializeService(s)}`);
  }
  for (const s of state.strafServices) {
    lines.push(`SERVICE;CRIMINAL;${serializeStrafService(s)}`);
  }
  for (const s of state.haftServices) {
    lines.push(`SERVICE;DETENTION;${serializeHaftService(s)}`);
  }
  for (const s of state.vstrafServices) {
    lines.push(`SERVICE;VSTRAF;${serializeVStrafService(s)}`);
  }

  return lines.join('\n');
}

export function generateFilename(metadata: CaseMetadata): string {
  if (metadata.geschaeftszahl) {
    // Ersetze / und andere ungültige Zeichen
    const sanitized = metadata.geschaeftszahl
      .replace(/\//g, '-')
      .replace(/[\\:*?"<>|]/g, '_');
    return `Kostennote_${sanitized}.csv`;
  }
  return `Kostennote_${metadata.erstelltAm}.csv`;
}
