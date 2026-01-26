// localStorage CRUD für mehrere Kostennoten

import type { SavedKostennote } from '../types';

const KOSTENNOTEN_KEY = 'kostenrechner_kostennoten';

export function loadAllKostennoten(): SavedKostennote[] {
  try {
    const stored = localStorage.getItem(KOSTENNOTEN_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    // Sortiere nach updatedAt (neueste zuerst)
    return (parsed as SavedKostennote[]).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (e) {
    console.warn('Fehler beim Laden der Kostennoten:', e);
    return [];
  }
}

export function saveAllKostennoten(kostennoten: SavedKostennote[]): void {
  try {
    localStorage.setItem(KOSTENNOTEN_KEY, JSON.stringify(kostennoten));
  } catch (e) {
    console.error('Fehler beim Speichern der Kostennoten:', e);
  }
}

export function saveKostennote(kostennote: SavedKostennote): void {
  const all = loadAllKostennoten();
  const index = all.findIndex(k => k.id === kostennote.id);
  if (index >= 0) {
    all[index] = kostennote;
  } else {
    all.unshift(kostennote); // Neu an den Anfang
  }
  saveAllKostennoten(all);
}

export function deleteKostennote(id: string): void {
  const all = loadAllKostennoten();
  const filtered = all.filter(k => k.id !== id);
  saveAllKostennoten(filtered);
}

export function getKostennote(id: string): SavedKostennote | null {
  const all = loadAllKostennoten();
  return all.find(k => k.id === id) || null;
}

export function createNewKostennote(
  metadata: Partial<SavedKostennote['metadata']>,
  state: SavedKostennote['state']
): SavedKostennote {
  const now = new Date().toISOString().split('T')[0];
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    metadata: {
      geschaeftszahl: '',
      gericht: '',
      parteiName: '',
      parteiStrasse: '',
      parteiPlz: '',
      parteiOrt: '',
      kanzleiName: '',
      kanzleiStrasse: '',
      kanzleiPlz: '',
      kanzleiOrt: '',
      erstelltAm: now,
      version: '1.0',
      ...metadata,
    },
    state,
  };
}
