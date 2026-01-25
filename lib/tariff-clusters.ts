/**
 * ============================================================================
 * RATG Tarifpost-Cluster
 * ============================================================================
 *
 * Strukturierte Einteilung aller Tarifposten in drei Hauptkategorien:
 * 1. SCHREIBEN - Schriftsätze und schriftliche Eingaben
 * 2. TERMINE - Tagsatzungen, Verhandlungen, Besprechungen
 * 3. ENTSCHÄDIGUNG - Reise- und Zeitentschädigung (TP9)
 *
 * ============================================================================
 */

// ============================================================================
// CLUSTER-TYPEN
// ============================================================================

export type ClusterType = 'SCHREIBEN' | 'TERMINE' | 'ENTSCHAEDIGUNG';

export interface TarifpostDefinition {
  /** Tarifpost-Kürzel (z.B. 'TP1', 'TP3A') */
  id: string;
  /** Vollständiger Name */
  name: string;
  /** Kurzbeschreibung */
  description: string;
  /** Cluster-Zugehörigkeit */
  cluster: ClusterType;
  /** Untertyp innerhalb des Clusters */
  subtype: string;
  /** Berechnungsart */
  calculationType: 'streitwert' | 'fix' | 'zeit' | 'strecke';
  /** Einheitssatz anwendbar? */
  einheitssatz: 'voll' | 'einfach' | 'keine';
  /** ERV-Zuschlag möglich? */
  ervMoeglich: boolean;
}

// ============================================================================
// CLUSTER 1: SCHREIBEN (Schriftsätze)
// ============================================================================

export const CLUSTER_SCHREIBEN: TarifpostDefinition[] = [
  {
    id: 'TP1',
    name: 'Tarifpost 1',
    description: 'Einfache Schriftsätze (Anzeigen, Ansuchen, Mitteilungen)',
    cluster: 'SCHREIBEN',
    subtype: 'Schriftsatz',
    calculationType: 'streitwert',
    einheitssatz: 'voll',
    ervMoeglich: true,
  },
  {
    id: 'TP2',
    name: 'Tarifpost 2',
    description: 'Schriftsätze im Zivil-, Exekutions-, Außerstreitverfahren',
    cluster: 'SCHREIBEN',
    subtype: 'Schriftsatz',
    calculationType: 'streitwert',
    einheitssatz: 'voll',
    ervMoeglich: true,
  },
  {
    id: 'TP3A',
    name: 'Tarifpost 3A',
    description: 'Klagen, Klagebeantwortungen, vorbereitende Schriftsätze',
    cluster: 'SCHREIBEN',
    subtype: 'Schriftsatz',
    calculationType: 'streitwert',
    einheitssatz: 'voll',
    ervMoeglich: true,
  },
  {
    id: 'TP3B',
    name: 'Tarifpost 3B',
    description: 'Berufungen, Revisionen, Rekurse (1,25×)',
    cluster: 'SCHREIBEN',
    subtype: 'Schriftsatz',
    calculationType: 'streitwert',
    einheitssatz: 'voll',
    ervMoeglich: true,
  },
  {
    id: 'TP3C',
    name: 'Tarifpost 3C',
    description: 'Rechtsmittel an OGH, VfGH, VwGH, EuGH (1,5×)',
    cluster: 'SCHREIBEN',
    subtype: 'Schriftsatz',
    calculationType: 'streitwert',
    einheitssatz: 'voll',
    ervMoeglich: true,
  },
  {
    id: 'TP4',
    name: 'Tarifpost 4',
    description: 'Strafsachen (Privatanklage, Mediengesetz, Privatbeteiligte)',
    cluster: 'SCHREIBEN',
    subtype: 'Schriftsatz',
    calculationType: 'fix',
    einheitssatz: 'einfach',  // Nur einfacher ES in Strafsachen!
    ervMoeglich: true,
  },
  {
    id: 'TP5',
    name: 'Tarifpost 5',
    description: 'Einfache Schreiben',
    cluster: 'SCHREIBEN',
    subtype: 'Einfaches Schreiben',
    calculationType: 'streitwert',
    einheitssatz: 'keine',
    ervMoeglich: false,
  },
  {
    id: 'TP6',
    name: 'Tarifpost 6',
    description: 'Andere Briefe (= TP5 × 2)',
    cluster: 'SCHREIBEN',
    subtype: 'Anderer Brief',
    calculationType: 'streitwert',
    einheitssatz: 'keine',
    ervMoeglich: false,
  },
];

// ============================================================================
// CLUSTER 2: TERMINE (Tagsatzungen, Verhandlungen, Besprechungen)
// ============================================================================

export const CLUSTER_TERMINE: TarifpostDefinition[] = [
  {
    id: 'TP2_TAG',
    name: 'Tarifpost 2 Tagsatzung',
    description: 'Tagsatzung im Zivil-, Exekutions-, Außerstreitverfahren',
    cluster: 'TERMINE',
    subtype: 'Tagsatzung',
    calculationType: 'streitwert',
    einheitssatz: 'voll',
    ervMoeglich: false,
  },
  {
    id: 'TP3A_TAG',
    name: 'Tarifpost 3A Tagsatzung',
    description: 'Tagsatzung (Klagen, etc.)',
    cluster: 'TERMINE',
    subtype: 'Tagsatzung',
    calculationType: 'streitwert',
    einheitssatz: 'voll',
    ervMoeglich: false,
  },
  {
    id: 'TP3B_TAG',
    name: 'Tarifpost 3B Tagsatzung',
    description: 'Tagsatzung (Berufungen, etc.) (1,25×)',
    cluster: 'TERMINE',
    subtype: 'Tagsatzung',
    calculationType: 'streitwert',
    einheitssatz: 'voll',
    ervMoeglich: false,
  },
  {
    id: 'TP3C_TAG',
    name: 'Tarifpost 3C Tagsatzung',
    description: 'Tagsatzung (OGH, VfGH, etc.) (1,5×)',
    cluster: 'TERMINE',
    subtype: 'Tagsatzung',
    calculationType: 'streitwert',
    einheitssatz: 'voll',
    ervMoeglich: false,
  },
  {
    id: 'TP4_VH',
    name: 'Tarifpost 4 Verhandlung',
    description: 'Hauptverhandlung / Verhandlung 2. Instanz in Strafsachen',
    cluster: 'TERMINE',
    subtype: 'Verhandlung',
    calculationType: 'fix',
    einheitssatz: 'einfach',  // Nur einfacher ES in Strafsachen!
    ervMoeglich: false,
  },
  {
    id: 'TP7',
    name: 'Tarifpost 7 Kommission',
    description: 'Kommission (TP7/1 ohne RA, TP7/2 mit RA)',
    cluster: 'TERMINE',
    subtype: 'Kommission',
    calculationType: 'streitwert',
    einheitssatz: 'keine',
    ervMoeglich: false,
  },
  {
    id: 'TP8',
    name: 'Tarifpost 8 Besprechung',
    description: 'Besprechungen (Standard und Kurzform)',
    cluster: 'TERMINE',
    subtype: 'Besprechung',
    calculationType: 'streitwert',
    einheitssatz: 'keine',
    ervMoeglich: false,
  },
];

// ============================================================================
// CLUSTER 3: ENTSCHÄDIGUNG (TP9)
// ============================================================================

export const CLUSTER_ENTSCHAEDIGUNG: TarifpostDefinition[] = [
  {
    id: 'TP9_1_C',
    name: 'Tarifpost 9/1/c',
    description: 'Reiseentschädigung (Weg)',
    cluster: 'ENTSCHAEDIGUNG',
    subtype: 'Weg',
    calculationType: 'strecke',
    einheitssatz: 'keine',
    ervMoeglich: false,
  },
  {
    id: 'TP9_4',
    name: 'Tarifpost 9/4',
    description: 'Zeitversäumnis (Wegzeit)',
    cluster: 'ENTSCHAEDIGUNG',
    subtype: 'Zeitversäumnis',
    calculationType: 'zeit',
    einheitssatz: 'keine',
    ervMoeglich: false,
  },
];

// ============================================================================
// ALLE CLUSTER ZUSAMMENGEFASST
// ============================================================================

export const ALL_TARIFPOSTEN: TarifpostDefinition[] = [
  ...CLUSTER_SCHREIBEN,
  ...CLUSTER_TERMINE,
  ...CLUSTER_ENTSCHAEDIGUNG,
];

export const CLUSTERS = {
  SCHREIBEN: CLUSTER_SCHREIBEN,
  TERMINE: CLUSTER_TERMINE,
  ENTSCHAEDIGUNG: CLUSTER_ENTSCHAEDIGUNG,
} as const;

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

/**
 * Gibt alle Tarifposten eines Clusters zurück.
 */
export function getCluster(type: ClusterType): TarifpostDefinition[] {
  return CLUSTERS[type];
}

/**
 * Findet eine Tarifpost-Definition anhand der ID.
 */
export function getTarifpostById(id: string): TarifpostDefinition | undefined {
  return ALL_TARIFPOSTEN.find(tp => tp.id === id);
}

/**
 * Gibt alle Tarifposten zurück, bei denen Einheitssatz anwendbar ist.
 */
export function getTarifpostenMitES(): TarifpostDefinition[] {
  return ALL_TARIFPOSTEN.filter(tp => tp.einheitssatz !== 'keine');
}

/**
 * Gibt alle Tarifposten zurück, bei denen ERV-Zuschlag möglich ist.
 */
export function getTarifpostenMitERV(): TarifpostDefinition[] {
  return ALL_TARIFPOSTEN.filter(tp => tp.ervMoeglich);
}
