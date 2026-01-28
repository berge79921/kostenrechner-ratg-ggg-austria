import { ServiceType, VertretenePartei } from '../types';
import type { ProtokollInfo, DokumentTyp } from './documentExtractor';

export interface MappedLeistung {
  catalogId: string;
  label: string;
  serviceType: ServiceType;
  esMultiplier: number;
  durationHalbeStunden?: number;  // Für Hearings: Dauer in halben Stunden
}

/**
 * Mappt Dokumenttyp + vertretene Partei auf die entsprechende RATG-Leistung.
 * Bei Kläger-Vertretung: Klage TP 2/3A
 * Bei Beklagten-Vertretung: Einspruch/Klagebeantwortung TP 2/3A
 */
export function mapDokumentToLeistung(
  klageArt: string,
  vertretenePartei: VertretenePartei,
  variante: 'tp2' | 'tp3a'
): MappedLeistung {
  const isKlaeger = vertretenePartei === 'klaeger';
  const isTP3A = variante === 'tp3a';
  const esMultiplier = 2; // Default: doppelter ES

  if (isKlaeger) {
    // Wir haben die Klage eingereicht → Klage als Leistung
    return isTP3A
      ? { catalogId: 'tp3a_klage', label: 'Klage (TP 3A)', serviceType: ServiceType.PLEADING_TP3A_I, esMultiplier }
      : { catalogId: 'tp2_klage_kurz', label: 'Klage (TP 2)', serviceType: ServiceType.PLEADING_TP2, esMultiplier };
  } else {
    // Wir vertreten Beklagte → Reaktion auf Klage
    const isMahnklage = klageArt === 'Mahnklage' || klageArt === 'Zahlungsbefehl';
    const label = isMahnklage
      ? (isTP3A ? 'Einspruch (TP 3A)' : 'Einspruch (TP 2)')
      : (isTP3A ? 'Klagebeantwortung (TP 3A)' : 'Klagebeantwortung (TP 2)');

    return isTP3A
      ? { catalogId: 'tp3a_kb', label, serviceType: ServiceType.PLEADING_TP3A_I, esMultiplier }
      : { catalogId: 'tp2_kb_kurz', label, serviceType: ServiceType.PLEADING_TP2, esMultiplier };
  }
}

/**
 * Bestimmt die Standard-Variante basierend auf dem Dokumenttyp.
 * Mahnklagen/Zahlungsbefehle → TP 2 (kurz, Bestreitung)
 * Klagen → TP 3A (ausführlich, Sachvorbringen)
 */
export function getDefaultVariante(klageArt: string): 'tp2' | 'tp3a' {
  const isMahnklage = klageArt === 'Mahnklage' || klageArt === 'Zahlungsbefehl';
  return isMahnklage ? 'tp2' : 'tp3a';
}

/**
 * Mappt Protokoll auf Tagsatzungs-Leistung.
 * Erkennt Instanz aus Gericht (OGH → TP 3C, OLG/LG → TP 3B, sonst → TP 3A)
 */
export function mapProtokollToLeistung(
  protokoll: ProtokollInfo,
  gericht: string
): MappedLeistung {
  const esMultiplier = 2; // Doppelter ES

  // Instanz-Erkennung aus Gericht
  const gerichtLower = gericht.toLowerCase();
  const isOGH = gerichtLower.includes('ogh') || gerichtLower.includes('oberster');
  const is2Instanz = gerichtLower.includes('olg') || gerichtLower.includes('oberlandesgericht');

  if (isOGH) {
    return {
      catalogId: 'tp3c_verhandlung',
      label: `Verhandlung OGH ${protokoll.datum}`,
      serviceType: ServiceType.HEARING_TP3C_II,
      esMultiplier,
      durationHalbeStunden: protokoll.halbeStunden,
    };
  }

  if (is2Instanz) {
    return {
      catalogId: 'tp3b_verhandlung',
      label: `Verhandlung 2. Instanz ${protokoll.datum}`,
      serviceType: ServiceType.HEARING_TP3B_II,
      esMultiplier,
      durationHalbeStunden: protokoll.halbeStunden,
    };
  }

  // Default: 1. Instanz → TP 3A
  return {
    catalogId: 'tp3a_ts',
    label: `Tagsatzung ${protokoll.datum}`,
    serviceType: ServiceType.HEARING_TP3A_II,
    esMultiplier,
    durationHalbeStunden: protokoll.halbeStunden,
  };
}

/**
 * Berechnet halbe Stunden aus Beginn/Ende/Pause.
 * Jede angebrochene halbe Stunde zählt voll.
 */
export function berechneHalbeStunden(
  beginn: string,
  ende: string,
  pauseMinuten: number = 0
): number {
  const [bH, bM] = beginn.split(':').map(Number);
  const [eH, eM] = ende.split(':').map(Number);

  if (isNaN(bH) || isNaN(bM) || isNaN(eH) || isNaN(eM)) {
    return 2; // Fallback: 1 Stunde
  }

  const bruttoMinuten = (eH * 60 + eM) - (bH * 60 + bM);
  const nettoMinuten = Math.max(0, bruttoMinuten - pauseMinuten);

  // Aufrunden auf halbe Stunden
  return Math.ceil(nettoMinuten / 30);
}

/**
 * Mappt Exekutionstitel auf Exekutionsantrag-Leistung.
 * Urteil, Vergleich, Zahlungsbefehl → Exekutionsantrag TP 2
 */
export function mapExekutionTitelToLeistung(
  titelArt: string
): MappedLeistung {
  const esMultiplier = 2; // Doppelter ES per Default

  // Exekutionsantrag ist immer TP 2 (einfacher Schriftsatz)
  // Die Bemessungsgrundlage wird später in der App aus der Kapitalforderung berechnet
  return {
    catalogId: 'ex_antrag',
    label: 'Exekutionsantrag',
    serviceType: ServiceType.PLEADING_TP2,
    esMultiplier,
  };
}

/**
 * Bestimmt Leistung basierend auf Dokumenttyp.
 * Delegiert an mapDokumentToLeistung oder mapProtokollToLeistung.
 */
export function mapDokumentTypToLeistung(
  dokumentTyp: DokumentTyp,
  klageArt: string,
  vertretenePartei: VertretenePartei,
  variante: 'tp2' | 'tp3a',
  protokoll?: ProtokollInfo,
  gericht?: string
): MappedLeistung | null {
  if (dokumentTyp === 'Protokoll' && protokoll) {
    return mapProtokollToLeistung(protokoll, gericht || '');
  }

  if (dokumentTyp === 'Klage' || dokumentTyp === 'Mahnklage' || dokumentTyp === 'Zahlungsbefehl') {
    return mapDokumentToLeistung(klageArt, vertretenePartei, variante);
  }

  return null; // Sonstig: keine automatische Leistung
}
