// localStorage für persistente Kanzleidaten

import type { KanzleiData } from '../types';

const KANZLEI_STORAGE_KEY = 'kostenrechner_kanzlei';

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
