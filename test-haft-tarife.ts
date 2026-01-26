/**
 * Umfassender Test: Haft-Tarife vs. Zivilrecht-Tarife
 *
 * Vergleicht alle RATG-basierten Haft-Leistungen mit den Zivilrecht-Pendants
 * für alle 4 BMGL-Stufen des Haftrechts.
 */

import { getTariffBase, getKommission } from './lib/tariffs';
import { HAFT_BEMESSUNGSGRUNDLAGEN } from './lib/haft-calculator';

// BMGL-Stufen im Haftrecht
const BMGL_STUFEN = [
  { stufe: 'BG', label: 'Bezirksgericht', cents: 780000 },           // € 7.800
  { stufe: 'ER_GH', label: 'Einzelrichter GH', cents: 1800000 },     // € 18.000
  { stufe: 'SCHOEFFEN', label: 'Schöffengericht', cents: 2760000 },  // € 27.600
  { stufe: 'GESCHWORENEN', label: 'Geschworenengericht', cents: 3320000 }, // € 33.200
];

// ES-Raten
const getEsRate = (bmglCents: number) => bmglCents <= 1017000 ? 0.6 : 0.5;

// Formatierung
const formatEuro = (cents: number) => `€ ${(cents / 100).toFixed(2).replace('.', ',')}`;

console.log('='.repeat(80));
console.log('HAFT-TARIFE TEST - Vergleich mit Zivilrecht');
console.log('='.repeat(80));
console.log('');

// ============================================================================
// TEST 1: TP 3A (Enthaftungsantrag vs. Klage/Antrag Zivil)
// ============================================================================
console.log('─'.repeat(80));
console.log('TEST 1: TP 3A - Enthaftungsantrag (Haft) vs. Klage (Zivil)');
console.log('─'.repeat(80));

for (const bmgl of BMGL_STUFEN) {
  const result = getTariffBase(bmgl.cents, 'TP3A');
  const esRate = getEsRate(bmgl.cents);

  // Ohne ES
  const nettoOhneES = result.base;

  // Mit einfachem ES
  const esMult1 = Math.round(result.base * esRate);
  const nettoMitES1 = result.base + esMult1;

  // Mit doppeltem ES
  const esMult2 = Math.round(result.base * esRate * 2);
  const nettoMitES2 = result.base + esMult2;

  console.log(`\n${bmgl.label} (BMGL ${formatEuro(bmgl.cents)}):`);
  console.log(`  Tarifstufe: ${result.label}`);
  console.log(`  Entlohnung: ${formatEuro(result.base)}`);
  console.log(`  ES-Rate: ${Math.round(esRate * 100)}%`);
  console.log(`  - ohne ES:      Netto ${formatEuro(nettoOhneES)}, Brutto ${formatEuro(nettoOhneES + Math.round(nettoOhneES * 0.2))}`);
  console.log(`  - einfach ES:   Netto ${formatEuro(nettoMitES1)}, Brutto ${formatEuro(nettoMitES1 + Math.round(nettoMitES1 * 0.2))}`);
  console.log(`  - doppelt ES:   Netto ${formatEuro(nettoMitES2)}, Brutto ${formatEuro(nettoMitES2 + Math.round(nettoMitES2 * 0.2))}`);
}

// ============================================================================
// TEST 2: TP 3B (Haftbeschwerde vs. Berufung/Rekurs Zivil)
// ============================================================================
console.log('\n' + '─'.repeat(80));
console.log('TEST 2: TP 3B - Haftbeschwerde (Haft) vs. Berufung/Rekurs (Zivil)');
console.log('─'.repeat(80));

for (const bmgl of BMGL_STUFEN) {
  const result = getTariffBase(bmgl.cents, 'TP3B');
  const esRate = getEsRate(bmgl.cents);

  const esMult1 = Math.round(result.base * esRate);
  const nettoMitES1 = result.base + esMult1;

  const esMult2 = Math.round(result.base * esRate * 2);
  const nettoMitES2 = result.base + esMult2;

  console.log(`\n${bmgl.label} (BMGL ${formatEuro(bmgl.cents)}):`);
  console.log(`  Tarifstufe: ${result.label}`);
  console.log(`  Entlohnung: ${formatEuro(result.base)}`);
  console.log(`  ES-Rate: ${Math.round(esRate * 100)}%`);
  console.log(`  - ohne ES:      Netto ${formatEuro(result.base)}, Brutto ${formatEuro(result.base + Math.round(result.base * 0.2))}`);
  console.log(`  - einfach ES:   Netto ${formatEuro(nettoMitES1)}, Brutto ${formatEuro(nettoMitES1 + Math.round(nettoMitES1 * 0.2))}`);
  console.log(`  - doppelt ES:   Netto ${formatEuro(nettoMitES2)}, Brutto ${formatEuro(nettoMitES2 + Math.round(nettoMitES2 * 0.2))}`);
}

// ============================================================================
// TEST 3: TP 2 (Kurzantrag Haft vs. Mahnklage/Antrag Zivil)
// ============================================================================
console.log('\n' + '─'.repeat(80));
console.log('TEST 3: TP 2 - Kurzantrag (Haft) vs. Mahnklage/Antrag (Zivil)');
console.log('─'.repeat(80));

for (const bmgl of BMGL_STUFEN) {
  const result = getTariffBase(bmgl.cents, 'TP2');
  const esRate = getEsRate(bmgl.cents);

  const esMult1 = Math.round(result.base * esRate);
  const nettoMitES1 = result.base + esMult1;

  console.log(`\n${bmgl.label} (BMGL ${formatEuro(bmgl.cents)}):`);
  console.log(`  Tarifstufe: ${result.label}`);
  console.log(`  Entlohnung: ${formatEuro(result.base)}`);
  console.log(`  ES-Rate: ${Math.round(esRate * 100)}%`);
  console.log(`  - ohne ES:      Netto ${formatEuro(result.base)}, Brutto ${formatEuro(result.base + Math.round(result.base * 0.2))}`);
  console.log(`  - einfach ES:   Netto ${formatEuro(nettoMitES1)}, Brutto ${formatEuro(nettoMitES1 + Math.round(nettoMitES1 * 0.2))}`);
}

// ============================================================================
// TEST 4: TP 7/2 (Besuch Haftanstalt vs. Kommission Zivil)
// ============================================================================
console.log('\n' + '─'.repeat(80));
console.log('TEST 4: TP 7/2 - Besuch Haftanstalt (Haft) vs. Kommission (Zivil)');
console.log('─'.repeat(80));

for (const bmgl of BMGL_STUFEN) {
  // Test mit verschiedenen Dauern
  for (const halbeStunden of [1, 2, 4]) {
    const result = getKommission(bmgl.cents, halbeStunden, 0, true); // mitRA = true für TP 7/2

    console.log(`\n${bmgl.label} (BMGL ${formatEuro(bmgl.cents)}), ${halbeStunden} × ½ Std.:`);
    console.log(`  Kommission TP 7/2: ${formatEuro(result.kommission)}`);
    console.log(`  Pro ½ Std.: ${formatEuro(result.kommission / halbeStunden)}`);
    console.log(`  Brutto: ${formatEuro(result.kommission + Math.round(result.kommission * 0.2))}`);
  }
}

// ============================================================================
// TEST 5: AHK § 9 Z 5 Fixsätze (nur Haft - kein Zivil-Pendant)
// ============================================================================
console.log('\n' + '─'.repeat(80));
console.log('TEST 5: AHK § 9 Z 5 Fixsätze (Haft-spezifisch)');
console.log('─'.repeat(80));

const AHK_FIXSAETZE = [
  { type: 'HAFT_VH_1_INSTANZ', label: 'Haftverhandlung 1. Instanz', first: 36400, subsequent: 18200 },
  { type: 'HAFT_VH_2_INSTANZ', label: 'Haftverhandlung 2. Instanz', first: 56400, subsequent: 28200 },
  { type: 'HAFT_GRUNDRECHTSBESCHWERDE', label: 'Grundrechtsbeschwerde', fixed: 78600 },
  { type: 'HAFT_BESCHWERDE_SONST', label: 'Sonstige Haftbeschwerde', fixed: 56400 },
];

for (const ahk of AHK_FIXSAETZE) {
  console.log(`\n${ahk.label}:`);

  if (ahk.fixed) {
    // Schriftsatz - mit ES-Optionen
    const esRate = 0.6; // Fixsätze verwenden immer 60%
    const ohneES = ahk.fixed;
    const mitES = ahk.fixed + Math.round(ahk.fixed * esRate);

    console.log(`  Pauschale: ${formatEuro(ahk.fixed)}`);
    console.log(`  - ohne ES:    Netto ${formatEuro(ohneES)}, Brutto ${formatEuro(ohneES + Math.round(ohneES * 0.2))}`);
    console.log(`  - einfach ES: Netto ${formatEuro(mitES)}, Brutto ${formatEuro(mitES + Math.round(mitES * 0.2))}`);
  } else {
    // Tagsatzung - mit Dauer
    for (const halbeStunden of [1, 2, 4]) {
      const entlohnung = ahk.first! + (halbeStunden > 1 ? (halbeStunden - 1) * ahk.subsequent! : 0);
      console.log(`  ${halbeStunden} × ½ Std.: ${formatEuro(entlohnung)} (Brutto ${formatEuro(entlohnung + Math.round(entlohnung * 0.2))})`);
    }
  }
}

// ============================================================================
// TEST 6: ERV-Beitrag Berechnung
// ============================================================================
console.log('\n' + '─'.repeat(80));
console.log('TEST 6: ERV-Beitrag (§ 23a RATG)');
console.log('─'.repeat(80));

const ERV_INITIAL = 500;  // € 5,00
const ERV_REGULAR = 260;  // € 2,60

console.log(`\nERV Erstmals: ${formatEuro(ERV_INITIAL)}`);
console.log(`ERV Regulär:  ${formatEuro(ERV_REGULAR)}`);

// Beispielrechnung TP 3B mit ERV
const bmglTest = 2760000; // € 27.600 (Schöffengericht)
const tp3bResult = getTariffBase(bmglTest, 'TP3B');
const esRate = getEsRate(bmglTest);
const entlohnung = tp3bResult.base;
const es2x = Math.round(entlohnung * esRate * 2);
const netto = entlohnung + es2x + ERV_INITIAL;
const ust = Math.round(netto * 0.2);
const brutto = netto + ust;

console.log(`\nBeispiel: TP 3B Haftbeschwerde (BMGL € 27.600, doppelt ES, ERV Erstmals):`);
console.log(`  Entlohnung:     ${formatEuro(entlohnung)}`);
console.log(`  ES 100%:        ${formatEuro(es2x)}`);
console.log(`  ERV-Beitrag:    ${formatEuro(ERV_INITIAL)}`);
console.log(`  ─────────────────────`);
console.log(`  Summe netto:    ${formatEuro(netto)}`);
console.log(`  20% USt:        ${formatEuro(ust)}`);
console.log(`  ─────────────────────`);
console.log(`  Summe brutto:   ${formatEuro(brutto)}`);

// ============================================================================
// TEST 7: Vollständiger Vergleich - Erwartete Werte
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('ZUSAMMENFASSUNG: Erwartete Werte für Vergleich');
console.log('='.repeat(80));

console.log(`
┌─────────────────────────────────────────────────────────────────────────────────┐
│ BMGL-STUFE        │ TP 2         │ TP 3A        │ TP 3B        │ TP 7/2 (1×½h) │
├─────────────────────────────────────────────────────────────────────────────────┤`);

for (const bmgl of BMGL_STUFEN) {
  const tp2 = getTariffBase(bmgl.cents, 'TP2');
  const tp3a = getTariffBase(bmgl.cents, 'TP3A');
  const tp3b = getTariffBase(bmgl.cents, 'TP3B');
  const tp72 = getKommission(bmgl.cents, 1, 0, true);

  const label = bmgl.label.padEnd(17);
  const tp2Val = formatEuro(tp2.base).padStart(12);
  const tp3aVal = formatEuro(tp3a.base).padStart(12);
  const tp3bVal = formatEuro(tp3b.base).padStart(12);
  const tp72Val = formatEuro(tp72.kommission).padStart(13);

  console.log(`│ ${label} │${tp2Val} │${tp3aVal} │${tp3bVal} │${tp72Val} │`);
}

console.log(`└─────────────────────────────────────────────────────────────────────────────────┘`);

console.log(`
Diese Werte müssen 1:1 mit den Zivilrecht-Karten übereinstimmen!

Prüfung:
1. Öffne den Kalkulator im Browser
2. Wähle "Zivil" Tab, setze BMGL auf jeweiligen Wert
3. Füge entsprechende Leistung hinzu (TP 2, TP 3A, TP 3B, TP 7)
4. Vergleiche die Entlohnung

Dann:
5. Wähle "Haft" Tab, setze BMGL-Stufe
6. Füge entsprechende Haft-Leistung hinzu
7. Werte müssen identisch sein
`);

console.log('='.repeat(80));
console.log('TEST ABGESCHLOSSEN');
console.log('='.repeat(80));
