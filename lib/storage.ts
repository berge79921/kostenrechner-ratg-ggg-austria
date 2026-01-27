// localStorage für persistente Kanzleidaten

import type { KanzleiData } from '../types';

const KANZLEI_STORAGE_KEY = 'kostenrechner_kanzlei';
const HEIMKANZLEI_STORAGE_KEY = 'kostenrechner_heimkanzlei';

// Aktuelle Kanzleidaten (Session)
export function saveKanzleiData(data: KanzleiData): void {
  try {
    localStorage.setItem(KANZLEI_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('localStorage nicht verfügbar:', e);
  }
}

export function loadKanzleiData(): KanzleiData | null {
  try {
    const stored = localStorage.getItem(KANZLEI_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.warn('localStorage nicht verfügbar:', e);
    return null;
  }
}

export function clearKanzleiData(): void {
  try {
    localStorage.removeItem(KANZLEI_STORAGE_KEY);
  } catch (e) {
    console.warn('localStorage nicht verfügbar:', e);
  }
}

// Heimkanzlei (persistente Standard-Kanzlei)
export function saveHeimkanzlei(data: KanzleiData): void {
  try {
    localStorage.setItem(HEIMKANZLEI_STORAGE_KEY, JSON.stringify(data));
    // Auch als aktuelle Kanzlei setzen
    saveKanzleiData(data);
  } catch (e) {
    console.warn('localStorage nicht verfügbar:', e);
  }
}

export function loadHeimkanzlei(): KanzleiData | null {
  try {
    const stored = localStorage.getItem(HEIMKANZLEI_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.warn('localStorage nicht verfügbar:', e);
    return null;
  }
}

export function hasHeimkanzlei(): boolean {
  try {
    return localStorage.getItem(HEIMKANZLEI_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function clearHeimkanzlei(): void {
  try {
    localStorage.removeItem(HEIMKANZLEI_STORAGE_KEY);
  } catch (e) {
    console.warn('localStorage nicht verfügbar:', e);
  }
}
