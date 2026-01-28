import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TotalResult, ProcedureType, CaseMode, CaseMetadata, ExekutionMetadata, ZivilprozessMetadata, Drittschuldner } from '../types';
import { formatEuro } from './calculator';

// Druckoptionen für PDF-Export
export interface PrintOptions {
  printTiteldaten: boolean;
  printExekutionsdaten: boolean;
  printKanzlei: boolean;
}

export interface PDFOptions {
  results: TotalResult;
  bmgl: number;
  additionalParties: number;
  isVatFree: boolean;
  showSubtotals: boolean;
  procedureType: ProcedureType;
  caseMode: CaseMode;
  // Haft-spezifisch
  haftBmglStufe?: string;
  haftBmglLabel?: string;
  // Straf-spezifisch
  courtType?: string;
  courtTypeLabel?: string;
  // V-Straf-spezifisch
  vstrafStufe?: string;
  vstrafStufeLabel?: string;
  vstrafVerfallswert?: number;
  // Falldaten für Header
  caseMetadata?: CaseMetadata;
  // Exekution-Daten
  exekutionMetadata?: ExekutionMetadata;
  // Zivilprozess-Daten (eingehende Klage)
  zivilprozessMetadata?: ZivilprozessMetadata;
  // Druckoptionen
  printOptions?: PrintOptions;
  // Tagsatzungs-Variante (für Verhandlung zum Einkreisen)
  tagsatzungVariante?: boolean;
  tagsatzungDatum?: string;
  // Tagsatzungs-Berechnungsdaten (TP 3A Basis, ES-Faktor)
  tp3aBasis?: number;  // in Cents
  esMultiplier?: number;  // 1 = einfach, 2 = doppelt
  isAuswaerts?: boolean;  // auswärts = doppelter ES
}

export function generateKostenverzeichnisPDF(
  results: TotalResult,
  bmgl: number,
  additionalParties: number,
  isVatFree: boolean,
  showSubtotals: boolean,
  procedureType: ProcedureType,
  options?: Partial<PDFOptions>
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const caseMode = options?.caseMode ?? CaseMode.CIVIL;
  const meta = options?.caseMetadata;
  const print = options?.printOptions || { printTiteldaten: true, printExekutionsdaten: true, printKanzlei: true };

  let yPos = 20;

  // --- Kanzlei-Header (dezent, oben rechts auf erster Seite) ---
  if (meta?.kanzleiName && print.printKanzlei) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100);
    const kanzleiLines: string[] = [meta.kanzleiName];
    if (meta.kanzleiStrasse) kanzleiLines.push(meta.kanzleiStrasse);
    const kanzleiOrt = [meta.kanzleiPlz, meta.kanzleiOrt].filter(Boolean).join(' ');
    if (kanzleiOrt) kanzleiLines.push(kanzleiOrt);

    // Rechtsbündig oben
    kanzleiLines.forEach((line, i) => {
      doc.text(line, pageWidth - 14, 10 + (i * 4), { align: 'right' });
    });
    doc.setTextColor(0);
    // Startposition etwas nach unten wenn Kanzlei-Header vorhanden
    yPos = Math.max(20, 10 + kanzleiLines.length * 4 + 6);
  }

  // --- Falldaten-Header (wenn vorhanden) ---
  if (meta && (meta.geschaeftszahl || meta.parteiName || meta.kanzleiName)) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('KOSTENVERZEICHNIS', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Geschäftszahl und Datum (immer drucken wenn vorhanden)
    doc.setFontSize(10);
    if (meta.geschaeftszahl) {
      doc.text(`GZ: ${meta.geschaeftszahl}`, 14, yPos);
    }
    doc.setFont('helvetica', 'normal');
    doc.text(`Datum: ${new Date().toLocaleDateString('de-AT')}`, pageWidth - 14, yPos, { align: 'right' });
    yPos += 6;

    // Gericht (immer drucken wenn vorhanden)
    if (meta.gericht) {
      doc.text(`Gericht: ${meta.gericht}`, 14, yPos);
      yPos += 8;
    }

    // === ZIVILPROZESS: Dynamisch basierend auf vertretenePartei ===
    const zivil = options?.zivilprozessMetadata;
    const isZivilprozess = procedureType === ProcedureType.ZIVILPROZESS && zivil;

    if (isZivilprozess && print.printExekutionsdaten) {
      const wirSindKlaeger = zivil.vertretenePartei === 'klaeger';

      // --- 1. KLÄGER + KLAGEVERTRETER ---
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Kläger:', 14, yPos);

      // Klagevertreter: Wenn wir Kläger sind → unsere Kanzlei, sonst aus zivil
      const kvName = wirSindKlaeger ? meta.kanzleiName : zivil.klagevertreterName;
      const kvStrasse = wirSindKlaeger ? meta.kanzleiStrasse : zivil.klagevertreterStrasse;
      const kvPlz = wirSindKlaeger ? meta.kanzleiPlz : zivil.klagevertreterPlz;
      const kvOrt = wirSindKlaeger ? meta.kanzleiOrt : zivil.klagevertreterOrt;
      const kvCode = wirSindKlaeger ? '' : zivil.klagevertreterCode;

      if (kvName && print.printKanzlei) doc.text('Klagevertreter:', pageWidth / 2 + 5, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      // Kläger - Name (immer aus zivil)
      if (zivil.klaegerName) doc.text(zivil.klaegerName, 14, yPos);
      // Klagevertreter - Name
      if (kvName && print.printKanzlei) doc.text(kvName, pageWidth / 2 + 5, yPos);
      yPos += 5;

      // Kläger - Straße
      if (zivil.klaegerStrasse) doc.text(zivil.klaegerStrasse, 14, yPos);
      // Klagevertreter - Straße
      if (kvStrasse && print.printKanzlei) doc.text(kvStrasse, pageWidth / 2 + 5, yPos);
      yPos += 5;

      // Kläger - PLZ/Ort
      const klaegerOrtStr = [zivil.klaegerPlz, zivil.klaegerOrt].filter(Boolean).join(' ');
      if (klaegerOrtStr) {
        const ortMitLand = zivil.klaegerLand ? `${klaegerOrtStr} (${zivil.klaegerLand})` : klaegerOrtStr;
        doc.text(ortMitLand, 14, yPos);
      }
      // Klagevertreter - PLZ/Ort + R-Code
      const kvOrtStr = [kvPlz, kvOrt].filter(Boolean).join(' ');
      if ((kvOrtStr || kvCode) && print.printKanzlei) {
        const kvText = [kvOrtStr, kvCode ? `(${kvCode})` : ''].filter(Boolean).join(' ');
        doc.text(kvText, pageWidth / 2 + 5, yPos);
      }
      yPos += 5;

      // Kläger - Geburtsdatum
      if (zivil.klaegerGeburtsdatum) {
        doc.text(`geb. ${zivil.klaegerGeburtsdatum}`, 14, yPos);
        yPos += 5;
      }

      yPos += 3;

      // --- 2. BEKLAGTE + BEKLAGTENVERTRETER ---
      // Beklagte: Name aus zivil (oder meta.parteiName wenn wir Beklagte sind)
      const beklName = zivil.beklagterName || (wirSindKlaeger ? '' : meta.parteiName);
      const beklStrasse = zivil.beklagterStrasse || (wirSindKlaeger ? '' : meta.parteiStrasse);
      const beklPlz = zivil.beklagterPlz || (wirSindKlaeger ? '' : meta.parteiPlz);
      const beklOrt = zivil.beklagterOrt || (wirSindKlaeger ? '' : meta.parteiOrt);
      const beklLand = zivil.beklagterLand || (wirSindKlaeger ? '' : meta.parteiLand);
      const beklGeb = zivil.beklagterGeburtsdatum || '';

      // Beklagtenvertreter: Wenn wir Beklagte sind → unsere Kanzlei, sonst aus zivil
      const bvName = wirSindKlaeger ? zivil.beklagtenvertreterName : meta.kanzleiName;
      const bvStrasse = wirSindKlaeger ? zivil.beklagtenvertreterStrasse : meta.kanzleiStrasse;
      const bvPlz = wirSindKlaeger ? zivil.beklagtenvertreterPlz : meta.kanzleiPlz;
      const bvOrt = wirSindKlaeger ? zivil.beklagtenvertreterOrt : meta.kanzleiOrt;
      const bvCode = wirSindKlaeger ? zivil.beklagtenvertreterCode : '';

      const showBeklagte = print.printTiteldaten && beklName;
      const showBeklagtenvertreter = print.printKanzlei && bvName;

      if (showBeklagte || showBeklagtenvertreter) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        if (showBeklagte) doc.text('Beklagte:', 14, yPos);
        if (showBeklagtenvertreter) doc.text('Beklagtenvertreter:', pageWidth / 2 + 5, yPos);
        yPos += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        // Beklagte - Name
        if (showBeklagte) doc.text(beklName, 14, yPos);
        // Beklagtenvertreter - Name
        if (showBeklagtenvertreter) doc.text(bvName, pageWidth / 2 + 5, yPos);
        yPos += 5;

        if (showBeklagte && beklStrasse) doc.text(beklStrasse, 14, yPos);
        if (showBeklagtenvertreter && bvStrasse) doc.text(bvStrasse, pageWidth / 2 + 5, yPos);
        yPos += 5;

        const beklOrtStr = [beklPlz, beklOrt].filter(Boolean).join(' ');
        const beklOrtMitLand = beklLand ? `${beklOrtStr} (${beklLand})` : beklOrtStr;
        const bvOrtStr = [bvPlz, bvOrt].filter(Boolean).join(' ');
        if (showBeklagte && beklOrtStr) doc.text(beklOrtMitLand, 14, yPos);
        if (showBeklagtenvertreter) {
          const bvText = [bvOrtStr, bvCode ? `(${bvCode})` : ''].filter(Boolean).join(' ');
          if (bvText) doc.text(bvText, pageWidth / 2 + 5, yPos);
        }
        yPos += 5;

        // Beklagte - Geburtsdatum
        if (showBeklagte && beklGeb) {
          doc.text(`geb. ${beklGeb}`, 14, yPos);
          yPos += 5;
        }
      }

      yPos += 3;

      // --- 3. VERFAHREN + FORDERUNG ---
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Verfahren:', 14, yPos);
      doc.text('Forderung:', pageWidth / 2 + 5, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      // Verfahren - Art + GZ
      const verfahrenText = [zivil.klageArt, zivil.klageGZ].filter(Boolean).join(' ');
      if (verfahrenText) doc.text(verfahrenText, 14, yPos);
      // Forderung - Kapital
      const kapitalText = zivil.kapitalforderung > 0 ? `Kapital: ${formatEuro(zivil.kapitalforderung * 100)}` : '';
      if (kapitalText) doc.text(kapitalText, pageWidth / 2 + 5, yPos);
      yPos += 5;

      // Verfahren - Einbringungsdatum
      if (zivil.einbringungsDatum || zivil.fallcode) {
        const datumText = [
          zivil.einbringungsDatum ? `Eingebracht: ${zivil.einbringungsDatum}` : '',
          zivil.fallcode ? `Fallcode: ${zivil.fallcode}` : ''
        ].filter(Boolean).join(' | ');
        doc.text(datumText, 14, yPos);
      }
      // Forderung - Zinsen
      if (zivil.zinsenProzent > 0 && zivil.zinsenAb) {
        doc.text(`+ ${zivil.zinsenProzent}% Zinsen seit ${zivil.zinsenAb}`, pageWidth / 2 + 5, yPos);
      }
      yPos += 5;

      // Verfahren - Klagegegenstand
      if (zivil.klagegegenstand) {
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(zivil.klagegegenstand, 14, yPos);
        doc.setTextColor(0);
        doc.setFontSize(10);
        yPos += 5;
      }

      // Trennlinie nach Zivilprozessdaten
      yPos += 3;
      doc.setDrawColor(200);
      doc.line(14, yPos, pageWidth - 14, yPos);
      yPos += 8;

    } else if (!isZivilprozess) {
      // === NICHT-ZIVILPROZESS: Standard-Layout (Partei + Kanzlei) ===
      const showPartei = print.printTiteldaten && meta.parteiName;
      const showKanzlei = print.printKanzlei && meta.kanzleiName;

      if (showPartei || showKanzlei) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        if (showPartei) doc.text('Partei:', 14, yPos);
        if (showKanzlei) doc.text('Vertreten durch:', pageWidth / 2 + 5, yPos);
        yPos += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        // Partei
        if (showPartei && meta.parteiName) doc.text(meta.parteiName, 14, yPos);
        // Kanzlei
        if (showKanzlei && meta.kanzleiName) doc.text(meta.kanzleiName, pageWidth / 2 + 5, yPos);
        yPos += 5;

        if (showPartei && meta.parteiStrasse) doc.text(meta.parteiStrasse, 14, yPos);
        if (showKanzlei && meta.kanzleiStrasse) doc.text(meta.kanzleiStrasse, pageWidth / 2 + 5, yPos);
        yPos += 5;

        const parteiOrt = [meta.parteiPlz, meta.parteiOrt].filter(Boolean).join(' ');
        const parteiOrtMitLand = meta.parteiLand ? `${parteiOrt} (${meta.parteiLand})` : parteiOrt;
        const kanzleiOrt = [meta.kanzleiPlz, meta.kanzleiOrt].filter(Boolean).join(' ');
        if (showPartei && parteiOrt) doc.text(parteiOrtMitLand, 14, yPos);
        if (showKanzlei && kanzleiOrt) doc.text(kanzleiOrt, pageWidth / 2 + 5, yPos);
        yPos += 8;
      }

      // Trennlinie
      doc.setDrawColor(200);
      doc.line(14, yPos, pageWidth - 14, yPos);
      yPos += 8;
    }

    // --- Exekution-spezifische Daten (nur wenn printExekutionsdaten aktiv) ---
    const exek = options?.exekutionMetadata;
    if (exek && procedureType === ProcedureType.EXEKUTION && print.printExekutionsdaten) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Verpflichtete Partei:', 14, yPos);
      doc.text('Exekutionstitel:', pageWidth / 2 + 5, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      // Verpflichtete Partei - Name
      if (exek.verpflichteterName) doc.text(exek.verpflichteterName, 14, yPos);
      // Titel - Art + Gericht (mit Umbruch wenn zu lang)
      const titelArtGericht = [exek.titelArt, exek.titelGericht].filter(Boolean).join(' ');
      let titelExtraLines = 0;
      if (titelArtGericht) {
        const maxWidth = pageWidth - 14 - (pageWidth / 2 + 5); // verfügbare Breite rechte Spalte
        const titelLines = doc.splitTextToSize(titelArtGericht, maxWidth);
        doc.text(titelLines, pageWidth / 2 + 5, yPos);
        titelExtraLines = titelLines.length - 1; // Anzahl zusätzlicher Zeilen
      }
      yPos += 5;

      // Verpflichtete Partei - Straße
      if (exek.verpflichteterStrasse) doc.text(exek.verpflichteterStrasse, 14, yPos);
      // Falls Titel mehrzeilig war, Platz lassen
      if (titelExtraLines > 0) {
        yPos += titelExtraLines * 5;
      }
      // Titel - GZ
      if (exek.titelGZ) doc.text(exek.titelGZ, pageWidth / 2 + 5, yPos);
      yPos += 5;

      // Verpflichtete Partei - PLZ/Ort
      const verpfOrt = [exek.verpflichteterPlz, exek.verpflichteterOrt].filter(Boolean).join(' ');
      if (verpfOrt) {
        const ortMitLand = exek.verpflichteterLand ? `${verpfOrt} (${exek.verpflichteterLand})` : verpfOrt;
        doc.text(ortMitLand, 14, yPos);
      }
      // Titel - Datum
      if (exek.titelDatum) doc.text(`vom ${exek.titelDatum}`, pageWidth / 2 + 5, yPos);
      yPos += 5;

      // Verpflichtete Partei - Geburtsdatum
      if (exek.verpflichteterGeburtsdatum) {
        doc.text(`geb. ${exek.verpflichteterGeburtsdatum}`, 14, yPos);
      }
      // Titel - Vollstreckbarkeit
      if (exek.vollstreckbarkeitDatum) {
        doc.text(`vollstreckbar seit ${exek.vollstreckbarkeitDatum}`, pageWidth / 2 + 5, yPos);
      }
      yPos += 5;

      // Forderung
      yPos += 2;
      doc.setFont('helvetica', 'bold');
      doc.text('Forderung aus Titel:', 14, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');

      const kapitalText = exek.kapitalforderung > 0 ? formatEuro(exek.kapitalforderung * 100) : '';
      const zinsenText = exek.zinsenProzent > 0 && exek.zinsenAb
        ? ` + ${exek.zinsenProzent}% Zinsen seit ${exek.zinsenAb}`
        : '';
      if (kapitalText) doc.text(`Kapital: ${kapitalText}${zinsenText}`, 14, yPos);
      yPos += 5;

      if (exek.kostenAusTitel > 0) {
        doc.text(`Kosten aus Titel: ${formatEuro(exek.kostenAusTitel * 100)}`, 14, yPos);
        yPos += 5;
      }

      // Trennlinie nach Exekutionsdaten
      yPos += 3;
      doc.setDrawColor(200);
      doc.line(14, yPos, pageWidth - 14, yPos);
      yPos += 8;
    }
  } else {
    // Standard-Header ohne Falldaten
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('KOSTENVERZEICHNIS', 14, 22);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-AT')}`, 14, 30);

    // Case Parameter Box
    doc.setDrawColor(200);
    doc.line(14, 35, pageWidth - 14, 35);

    yPos = 42;
  }

  // Verfahrensart
  doc.setFont('helvetica', 'bold');
  doc.text('Verfahrensart:', 14, yPos);
  doc.setFont('helvetica', 'normal');
  if (caseMode === CaseMode.VSTRAF) {
    doc.text('Verwaltungsstrafsachen (§ 13 AHK)', 65, yPos);
  } else if (caseMode === CaseMode.DETENTION) {
    doc.text('Haftverfahren (§ 9 Abs 1 Z 5 AHK)', 65, yPos);
  } else if (caseMode === CaseMode.CRIMINAL) {
    doc.text(`Strafverfahren - ${options?.courtTypeLabel || 'Gerichtshof'}`, 65, yPos);
  } else {
    doc.text(`${procedureType}`, 65, yPos);
  }
  yPos += 6;

  // Bemessungsgrundlage
  doc.setFont('helvetica', 'bold');
  doc.text('Bemessungsgrundlage:', 14, yPos);
  doc.setFont('helvetica', 'normal');
  if (caseMode === CaseMode.VSTRAF) {
    const verfallText = options?.vstrafVerfallswert && options.vstrafVerfallswert > 0
      ? ` + Verfallswert ${formatEuro(options.vstrafVerfallswert)}`
      : '';
    doc.text(`${formatEuro(bmgl * 100)} (§ 13 Abs 1 AHK${verfallText})`, 65, yPos);
  } else if (caseMode === CaseMode.DETENTION) {
    doc.text(`${formatEuro(bmgl * 100)} (§ 10 Abs 1 AHK - ${options?.haftBmglLabel || 'Gerichtshof'})`, 65, yPos);
  } else if (caseMode === CaseMode.CRIMINAL) {
    doc.text(`${formatEuro(bmgl * 100)} (§ 10 Abs 1 AHK - ${options?.courtTypeLabel || 'Gerichtshof'})`, 65, yPos);
  } else {
    doc.text(`${formatEuro(bmgl * 100)}`, 65, yPos);
  }
  yPos += 6;

  // Streitgenossen - nur bei Zivil
  if (caseMode === CaseMode.CIVIL) {
    doc.setFont('helvetica', 'bold');
    doc.text('Streitgenossen (§ 15):', 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${additionalParties} weitere Person(en)`, 65, yPos);
    yPos += 6;
  }

  // Steuer-Status
  doc.setFont('helvetica', 'bold');
  doc.text('Steuer-Status:', 14, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(isVatFree ? 'Umsatzsteuerfrei (Netto)' : 'Regel-USt (20%)', 65, yPos);
  yPos += 6;

  // Rechtsgrundlage für Haft/Straf/V-Straf
  if (caseMode === CaseMode.DETENTION || caseMode === CaseMode.CRIMINAL || caseMode === CaseMode.VSTRAF) {
    doc.setFont('helvetica', 'bold');
    doc.text('Rechtsgrundlage:', 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text('AHK (Autonome Honorarkriterien) + RATG', 65, yPos);
    yPos += 6;
  }

  // Strafdrohung für V-Straf
  if (caseMode === CaseMode.VSTRAF && options?.vstrafStufeLabel) {
    doc.setFont('helvetica', 'bold');
    doc.text('Strafdrohung:', 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(options.vstrafStufeLabel, 65, yPos);
    yPos += 6;
  }

  // Table Data Preparation
  const tableData: any[][] = [];
  let currentServiceId = '';
  let currentSubtotal = 0;

  results.lines.forEach((line, index) => {
    // Inject subtotal rows if block changes
    if (showSubtotals && currentServiceId !== '' && line.serviceId !== currentServiceId) {
      tableData.push([
        { 
          content: `Zwischensumme für Block`, 
          colSpan: 3, 
          styles: { halign: 'right', fontStyle: 'italic', textColor: [100, 100, 100], fillColor: [248, 250, 252] } 
        },
        { 
          content: formatEuro(currentSubtotal), 
          styles: { halign: 'right', fontStyle: 'italic', textColor: [100, 100, 100], fillColor: [248, 250, 252] } 
        }
      ]);
      currentSubtotal = 0;
    }

    currentServiceId = line.serviceId || '';
    currentSubtotal += line.amountCents;

    tableData.push([
      new Date(line.date).toLocaleDateString('de-AT'),
      line.label,
      line.section,
      formatEuro(line.amountCents)
    ]);

    // Handle last block subtotal
    if (showSubtotals && index === results.lines.length - 1) {
      tableData.push([
        { 
          content: `Zwischensumme für Block`, 
          colSpan: 3, 
          styles: { halign: 'right', fontStyle: 'italic', textColor: [100, 100, 100], fillColor: [248, 250, 252] } 
        },
        { 
          content: formatEuro(currentSubtotal), 
          styles: { halign: 'right', fontStyle: 'italic', textColor: [100, 100, 100], fillColor: [248, 250, 252] } 
        }
      ]);
    }
  });

  // Bei Tagsatzungs-Variante: "A. BEREITS ERBRACHTE LEISTUNGEN" als Überschrift
  const isTagsatzungVariante = options?.tagsatzungVariante === true;
  if (isTagsatzungVariante) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('A. BEREITS ERBRACHTE LEISTUNGEN', 14, yPos + 4);
    yPos += 4;
  }

  // Table Generation using autoTable direct function call (ESM safe)
  autoTable(doc, {
    startY: yPos + 8,
    head: [['Datum', 'Leistung / Position', 'Gesetzliche Basis', 'Betrag']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 45 },
      3: { cellWidth: 35, halign: 'right' }
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      font: 'helvetica',
      valign: 'middle'
    },
    margin: { left: 14, right: 14 }
  });

  let summaryY = (doc as any).lastAutoTable.finalY + 12;
  const bottomMargin = 25;

  // ====== TAGSATZUNGS-VARIANTE: B. Zwischensumme + C. Varianten-Tabelle ======
  if (isTagsatzungVariante) {
    const tp3aBasis = options?.tp3aBasis || 0;
    const esMultiplier = options?.esMultiplier ?? 2;  // Default: doppelter ES (0 = Einzelabrechnung)
    const isAuswaerts = options?.isAuswaerts ?? true;
    const tagsatzungDatum = options?.tagsatzungDatum || new Date().toLocaleDateString('de-AT');

    // Honorar netto = alle Honorar-Zeilen inkl. ERV (ohne GGG/Barauslagen)
    // ERV ist USt-pflichtig und bereits in netCents enthalten (§ 23a RATG)
    const honorarNettoCents = results.netCents;

    // B. ZWISCHENSUMME
    const zwischensummeHeight = 40;
    if (summaryY + zwischensummeHeight > pageHeight - bottomMargin) {
      doc.addPage();
      summaryY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('B. ZWISCHENSUMME (bisher)', 14, summaryY);
    summaryY += 6;

    // GGG-Pauschalgebühren (ohne USt!)
    const gggCents = results.gggCents;

    autoTable(doc, {
      startY: summaryY,
      head: [['Position', 'Betrag']],
      body: [
        ['Honorar netto inkl. ERV (A)', formatEuro(honorarNettoCents)],
        ['Pauschalgebühr GGG (ohne USt)', formatEuro(gggCents)],
      ],
      theme: 'plain',
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9 },
      columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 50, halign: 'right' } },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 14, right: 14 }
    });

    summaryY = (doc as any).lastAutoTable.finalY + 12;

    // C. TAGSATZUNG VARIANTEN (1-6 Stunden)
    const variantenHeight = 100;
    if (summaryY + variantenHeight > pageHeight - bottomMargin) {
      doc.addPage();
      summaryY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`C. TAGSATZUNG VOM ${tagsatzungDatum} – VARIANTEN ZUM EINKREISEN`, 14, summaryY);
    summaryY += 6;

    // Berechnung der Varianten (1-6 Stunden)
    // TP 3A II: 1. Stunde = Basis, jede weitere = Basis/2
    // ES-Berechnung nach RATG § 23:
    // - esMultiplier = 0: Einzelabrechnung (kein ES)
    // - esMultiplier = 1: Einfacher ES (50%)
    // - esMultiplier = 2: Doppelter ES (100%, bei auswärts +50% pro weitere Std)
    const berechnungen: { stunden: number; tagBasis: number; tagWeitere: number; es: number; esProz: number }[] = [];
    const hatES = esMultiplier > 0;
    const basisESProz = esMultiplier === 2 ? 100 : (esMultiplier === 1 ? 50 : 0);
    // Aufschlag nur bei doppeltem ES + auswärts
    const aufschlagProStd = (esMultiplier === 2 && isAuswaerts) ? 50 : 0;

    for (let std = 1; std <= 6; std++) {
      const tagBasis = tp3aBasis;  // 1. Stunde
      const tagWeitere = (std - 1) * Math.round(tp3aBasis / 2);  // weitere Stunden
      // ES: Basis-% + Aufschlag pro weitere Stunde (nur bei doppelt + auswärts)
      const esProz = hatES ? (basisESProz + (std - 1) * aufschlagProStd) : 0;
      const esBase = tagBasis + tagWeitere;
      const es = hatES ? Math.round(esBase * esProz / 100) : 0;
      berechnungen.push({ stunden: std, tagBasis, tagWeitere, es, esProz });
    }

    // Varianten-Tabelle Header
    const variantenHead = [
      '',
      '1 Std', '2 Std', '3 Std', '4 Std', '5 Std', '6 Std'
    ];

    // Berechnung der Zeilen
    const variantenBody: any[][] = [];

    // Zeile: Bisheriges Honorar (netto)
    variantenBody.push([
      'Bisheriges Honorar (netto)',
      ...berechnungen.map(() => formatEuro(honorarNettoCents))
    ]);

    // Zeile: Tagsatzung 1. Std
    variantenBody.push([
      `Tagsatzung ${tagsatzungDatum}, 1. Std`,
      ...berechnungen.map(b => formatEuro(b.tagBasis))
    ]);

    // Zeile: Tagsatzung weitere Std
    variantenBody.push([
      `Tagsatzung ${tagsatzungDatum}, weitere Std`,
      ...berechnungen.map(b => b.tagWeitere > 0 ? formatEuro(b.tagWeitere) : '—')
    ]);

    // Zeile: ES (nur wenn ES aktiv)
    if (hatES) {
      const esTyp = esMultiplier === 2 ? 'doppelt' : 'einfach';
      const esLabel = (esMultiplier === 2 && isAuswaerts) ? `ES (${esTyp}, auswärts)` : `ES (${esTyp})`;
      variantenBody.push([
        esLabel,
        ...berechnungen.map(b => `${formatEuro(b.es)} (${b.esProz}%)`)
      ]);
    } else {
      // Einzelabrechnung - kein ES
      variantenBody.push([
        { content: 'Einzelabrechnung (kein ES)', styles: { textColor: [150, 150, 150], fontStyle: 'italic' } },
        ...berechnungen.map(() => ({ content: '—', styles: { textColor: [150, 150, 150] } }))
      ]);
    }

    // Zeile: = Honorar gesamt (netto)
    variantenBody.push([
      { content: '= Honorar gesamt (netto)', styles: { fontStyle: 'bold' } },
      ...berechnungen.map(b => {
        const gesamt = honorarNettoCents + b.tagBasis + b.tagWeitere + b.es;
        return { content: formatEuro(gesamt), styles: { fontStyle: 'bold' } };
      })
    ]);

    // Zeile: + 20% USt
    variantenBody.push([
      '+ 20% USt',
      ...berechnungen.map(b => {
        const gesamt = honorarNettoCents + b.tagBasis + b.tagWeitere + b.es;
        const ust = Math.round(gesamt * 0.2);
        return formatEuro(ust);
      })
    ]);

    // Zeile: = RECHNUNGSBETRAG BRUTTO (Honorar)
    variantenBody.push([
      { content: '= Honorar brutto', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
      ...berechnungen.map(b => {
        const gesamt = honorarNettoCents + b.tagBasis + b.tagWeitere + b.es;
        const brutto = Math.round(gesamt * 1.2);
        return { content: formatEuro(brutto), styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } };
      })
    ]);

    // ERV ist bereits in Honorar netto enthalten und wird MIT USt berechnet (§ 23a RATG)
    // Daher keine separate ERV-Zeile hier!

    // Zeile: + Pauschalgebühr GGG (ohne USt!)
    if (gggCents > 0) {
      variantenBody.push([
        '+ Pauschalgebühr GGG',
        ...berechnungen.map(() => formatEuro(gggCents))
      ]);
    }

    // Zeile: = GESAMTSUMME (Honorar brutto + GGG, ERV bereits in Honorar enthalten)
    variantenBody.push([
      { content: '= GESAMTSUMME', styles: { fontStyle: 'bold', fillColor: [30, 41, 59], textColor: [255, 255, 255] } },
      ...berechnungen.map(b => {
        const gesamt = honorarNettoCents + b.tagBasis + b.tagWeitere + b.es;
        const brutto = Math.round(gesamt * 1.2);
        const gesamtsumme = brutto + gggCents;  // ERV bereits in brutto enthalten (mit USt)
        return { content: formatEuro(gesamtsumme), styles: { fontStyle: 'bold', fillColor: [30, 41, 59], textColor: [255, 255, 255] } };
      })
    ]);

    autoTable(doc, {
      startY: summaryY,
      head: [variantenHead],
      body: variantenBody,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8, halign: 'center' },
      columnStyles: {
        0: { cellWidth: 55 },
        1: { cellWidth: 22, halign: 'right' },
        2: { cellWidth: 22, halign: 'right' },
        3: { cellWidth: 22, halign: 'right' },
        4: { cellWidth: 22, halign: 'right' },
        5: { cellWidth: 22, halign: 'right' },
        6: { cellWidth: 22, halign: 'right' },
      },
      styles: { fontSize: 7, cellPadding: 2, font: 'helvetica' },
      margin: { left: 14, right: 14 }
    });

    summaryY = (doc as any).lastAutoTable.finalY + 8;

    // Hinweis zum Einkreisen
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100);
    doc.text('Tatsächliche Dauer bitte einkreisen. GGG-Pauschalgebühren werden vom Gericht vorgeschrieben.', 14, summaryY);
    doc.setTextColor(0);

  } else {
    // ====== STANDARD-MODUS: Normale Zusammenfassung ======
    const summaryHeight = 45;
    if (summaryY + summaryHeight > pageHeight - bottomMargin) {
      doc.addPage();
      summaryY = 20;
    }

    const rightAlignX = pageWidth - 14;
    const labelX = pageWidth - 95;

    doc.setDrawColor(200);
    doc.line(labelX, summaryY - 4, rightAlignX, summaryY - 4);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Verdienst Netto:', labelX, summaryY);
    doc.text(formatEuro(results.netCents), rightAlignX, summaryY, { align: 'right' });

    doc.text(`Umsatzsteuer (${isVatFree ? '0' : '20'}%):`, labelX, summaryY + 7);
    doc.text(formatEuro(results.vatCents), rightAlignX, summaryY + 7, { align: 'right' });

    doc.text('Barauslagen / GGG:', labelX, summaryY + 14);
    doc.text(formatEuro(results.gggCents), rightAlignX, summaryY + 14, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('GESAMTSUMME:', labelX, summaryY + 25);
    doc.text(formatEuro(results.totalCents), rightAlignX, summaryY + 25, { align: 'right' });
  }

  // --- Seitennummerierung + Disclaimer auf allen Seiten ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Legal Disclaimer (nur auf letzter Seite)
    if (i === totalPages) {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150);
      doc.text('Dies ist eine softwaregenerierte Kostenaufstellung auf Basis der RATG/GGG Logik. Keine Gewähr für Fehlerfreiheit.', 14, pageHeight - 15);
    }

    // Seitennummer (auf allen Seiten, zentriert unten)
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120);
    const pageNumText = totalPages > 1 ? `Seite ${i} von ${totalPages}` : '';
    if (pageNumText) {
      doc.text(pageNumText, pageWidth / 2, pageHeight - 8, { align: 'center' });
    }
  }

  // Trigger Download
  doc.save(`Kostenverzeichnis_${new Date().toISOString().split('T')[0]}.pdf`);
}

// ============================================================================
// FALLÜBERSICHT PDF - Exekutionsverfahren (McKinsey Style - dezent, professionell)
// ============================================================================

export interface FalluebersichtOptions {
  caseMetadata: CaseMetadata;
  exekutionMetadata: ExekutionMetadata;
  bmgl?: number;
  results?: TotalResult;
  isVatFree?: boolean;
  additionalParties?: number;
}

export function generateFalluebersichtPDF(options: FalluebersichtOptions) {
  const { caseMetadata: meta, exekutionMetadata: exek, bmgl } = options;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const leftMargin = 14;
  const rightMargin = pageWidth - 14;
  const colMid = pageWidth / 2 + 5;

  let yPos = 20;

  // === HEADER ===
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('FALLÜBERSICHT', leftMargin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Datum: ${new Date().toLocaleDateString('de-AT')}`, rightMargin, yPos, { align: 'right' });
  yPos += 6;

  // Geschäftszahl + Gericht
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  if (meta.geschaeftszahl) {
    doc.text(`GZ: ${meta.geschaeftszahl}`, leftMargin, yPos);
  }
  doc.setFont('helvetica', 'normal');
  if (meta.gericht) {
    doc.text(meta.gericht, rightMargin, yPos, { align: 'right' });
  }
  yPos += 4;

  // Trennlinie
  doc.setDrawColor(60);
  doc.setLineWidth(0.5);
  doc.line(leftMargin, yPos, rightMargin, yPos);
  yPos += 10;

  // === Hilfsfunktionen ===
  const sectionTitle = (title: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(title, leftMargin, yPos);
    doc.setTextColor(0);
    yPos += 5;
  };

  const labelValue = (label: string, value: string, x: number = leftMargin) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(label, x, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value || '—', x + 35, yPos);
    yPos += 5;
  };

  const thinLine = () => {
    doc.setDrawColor(180);
    doc.setLineWidth(0.2);
    doc.line(leftMargin, yPos, rightMargin, yPos);
    yPos += 6;
  };

  // === PARTEIEN (2 Spalten) ===
  sectionTitle('BETREIBENDE PARTEI');
  const yBetreibend = yPos;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  if (meta.parteiName) doc.text(meta.parteiName, leftMargin, yPos);
  yPos += 5;
  if (meta.parteiStrasse) doc.text(meta.parteiStrasse, leftMargin, yPos);
  yPos += 5;
  const parteiOrt = [meta.parteiPlz, meta.parteiOrt].filter(Boolean).join(' ');
  if (parteiOrt) doc.text(parteiOrt, leftMargin, yPos);
  yPos += 5;

  // Vertreter
  if (meta.kanzleiName) {
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('vertreten durch:', leftMargin, yPos);
    yPos += 4;
    doc.setTextColor(0);
    doc.setFontSize(9);
    doc.text(meta.kanzleiName, leftMargin, yPos);
    yPos += 4;
    const kanzleiOrt = [meta.kanzleiPlz, meta.kanzleiOrt].filter(Boolean).join(' ');
    if (meta.kanzleiStrasse) { doc.text(meta.kanzleiStrasse, leftMargin, yPos); yPos += 4; }
    if (kanzleiOrt) { doc.text(kanzleiOrt, leftMargin, yPos); yPos += 4; }
  }

  // Rechte Spalte: Verpflichtete Partei
  let yRight = yBetreibend;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text('VERPFLICHTETE PARTEI', colMid, yRight - 5);
  doc.setTextColor(0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  if (exek.verpflichteterName) doc.text(exek.verpflichteterName, colMid, yRight);
  yRight += 5;
  if (exek.verpflichteterStrasse) doc.text(exek.verpflichteterStrasse, colMid, yRight);
  yRight += 5;
  const verpfOrt = [exek.verpflichteterPlz, exek.verpflichteterOrt].filter(Boolean).join(' ');
  if (verpfOrt) doc.text(verpfOrt, colMid, yRight);
  yRight += 5;
  if (exek.verpflichteterGeburtsdatum) {
    doc.setFontSize(9);
    doc.text(`geb. ${exek.verpflichteterGeburtsdatum}`, colMid, yRight);
    yRight += 5;
  }

  yPos = Math.max(yPos, yRight) + 6;
  thinLine();

  // === EXEKUTIONSTITEL + FORDERUNG (2 Spalten) ===
  sectionTitle('EXEKUTIONSTITEL');
  const yTitel = yPos;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`${exek.titelArt || '—'}`, leftMargin, yPos);
  yPos += 5;
  doc.text(`${exek.titelGericht || '—'} ${exek.titelGZ || ''}`, leftMargin, yPos);
  yPos += 5;
  if (exek.titelDatum) doc.text(`vom ${exek.titelDatum}`, leftMargin, yPos);
  yPos += 5;
  if (exek.vollstreckbarkeitDatum) {
    doc.setTextColor(100);
    doc.text(`vollstreckbar seit ${exek.vollstreckbarkeitDatum}`, leftMargin, yPos);
    doc.setTextColor(0);
    yPos += 5;
  }

  // Rechte Spalte: Forderung
  yRight = yTitel;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text('FORDERUNG', colMid, yRight - 5);
  doc.setTextColor(0);

  doc.setFont('helvetica', 'normal');
  if (exek.kapitalforderung > 0) {
    doc.text(`Kapital: ${formatEuro(exek.kapitalforderung * 100)}`, colMid, yRight);
    yRight += 5;
  }
  if (exek.zinsenProzent > 0 && exek.zinsenAb) {
    doc.text(`+ ${exek.zinsenProzent}% Zinsen seit ${exek.zinsenAb}`, colMid, yRight);
    yRight += 5;
  }
  if (exek.kostenAusTitel > 0) {
    doc.text(`Kosten aus Titel: ${formatEuro(exek.kostenAusTitel * 100)}`, colMid, yRight);
    yRight += 5;
  }

  yPos = Math.max(yPos, yRight) + 6;
  thinLine();

  // === DRITTSCHULDNER ===
  const drittschuldner = exek.drittschuldner || [];
  if (drittschuldner.length > 0) {
    sectionTitle('DRITTSCHULDNER (§ 294 EO)');

    drittschuldner.forEach((ds: Drittschuldner, index: number) => {
      if (yPos > pageHeight - 40) { doc.addPage(); yPos = 20; }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`${index + 1}. ${ds.name}`, leftMargin, yPos);
      doc.setFont('helvetica', 'normal');
      if (ds.rechtsgrund) {
        doc.setTextColor(100);
        doc.text(`(${ds.rechtsgrund})`, leftMargin + 80, yPos);
        doc.setTextColor(0);
      }
      yPos += 5;

      doc.setFontSize(9);
      const dsAddr = [ds.strasse, [ds.plz, ds.ort].filter(Boolean).join(' ')].filter(Boolean).join(', ');
      doc.text(dsAddr, leftMargin + 4, yPos);
      yPos += 5;

      if (ds.typ === 'Bank' && ds.iban) {
        doc.setTextColor(100);
        doc.text(`IBAN: ${ds.iban}${ds.bic ? ' | BIC: ' + ds.bic : ''}`, leftMargin + 4, yPos);
        doc.setTextColor(0);
        yPos += 5;
      }
    });
    yPos += 2;
    thinLine();
  }

  // === KOSTENVERZEICHNIS ===
  const results = options.results;
  const isVatFree = options.isVatFree ?? false;

  if (results && results.lines.length > 0) {
    if (yPos > pageHeight - 100) { doc.addPage(); yPos = 20; }

    sectionTitle('KOSTENVERZEICHNIS');

    // Parameter
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    if (bmgl && bmgl > 0) {
      doc.text(`Bemessungsgrundlage: ${formatEuro(bmgl * 100)}`, leftMargin, yPos);
      yPos += 5;
    }
    yPos += 3;

    // Kosten-Tabelle (wie Kostenverzeichnis)
    const tableData: any[][] = [];
    results.lines.forEach((line) => {
      tableData.push([
        new Date(line.date).toLocaleDateString('de-AT'),
        line.label,
        line.section,
        formatEuro(line.amountCents)
      ]);
    });

    autoTable(doc, {
      startY: yPos,
      head: [['Datum', 'Leistung / Position', 'Gesetzl. Basis', 'Betrag']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [50, 50, 50],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 40 },
        3: { cellWidth: 30, halign: 'right' }
      },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { left: leftMargin, right: 14 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 8;

    // Zusammenfassung (rechtsbündig, wie Kostenverzeichnis)
    const summaryX = pageWidth - 90;

    doc.setDrawColor(150);
    doc.line(summaryX, yPos - 2, rightMargin, yPos - 2);
    yPos += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Verdienst Netto:', summaryX, yPos);
    doc.text(formatEuro(results.netCents), rightMargin, yPos, { align: 'right' });
    yPos += 5;

    doc.text(`Umsatzsteuer (${isVatFree ? '0' : '20'}%):`, summaryX, yPos);
    doc.text(formatEuro(results.vatCents), rightMargin, yPos, { align: 'right' });
    yPos += 5;

    doc.text('Barauslagen / GGG:', summaryX, yPos);
    doc.text(formatEuro(results.gggCents), rightMargin, yPos, { align: 'right' });
    yPos += 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('GESAMTSUMME:', summaryX, yPos);
    doc.text(formatEuro(results.totalCents), rightMargin, yPos, { align: 'right' });
  }

  // === FOOTER ===
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150);
    doc.text('Fallübersicht | RATG/GGG Kostenrechner', leftMargin, pageHeight - 10);
    if (totalPages > 1) {
      doc.text(`Seite ${i}/${totalPages}`, rightMargin, pageHeight - 10, { align: 'right' });
    }
  }

  // Download
  const filename = meta.geschaeftszahl
    ? `Falluebersicht_${meta.geschaeftszahl.replace(/[\/\s]/g, '_')}.pdf`
    : `Falluebersicht_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

// ============================================================================
// FALLÜBERSICHT PDF - Zivilprozess (McKinsey Style)
// ============================================================================

export interface ZivilprozessFalluebersichtOptions {
  caseMetadata: CaseMetadata;
  zivilprozessMetadata: ZivilprozessMetadata;
  bmgl?: number;
  results?: TotalResult;
  isVatFree?: boolean;
  additionalParties?: number;
}

export function generateZivilprozessFalluebersichtPDF(options: ZivilprozessFalluebersichtOptions) {
  const { caseMetadata: meta, zivilprozessMetadata: zivil, bmgl } = options;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const leftMargin = 14;
  const rightMargin = pageWidth - 14;
  const colMid = pageWidth / 2 + 5;

  let yPos = 20;

  // === HEADER ===
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('FALLÜBERSICHT', leftMargin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Datum: ${new Date().toLocaleDateString('de-AT')}`, rightMargin, yPos, { align: 'right' });
  yPos += 6;

  // Geschäftszahl + Gericht
  const gz = zivil.klageGZ || meta.geschaeftszahl;
  const gericht = zivil.klageGericht || meta.gericht;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  if (gz) doc.text(`GZ: ${gz}`, leftMargin, yPos);
  doc.setFont('helvetica', 'normal');
  if (gericht) doc.text(gericht, rightMargin, yPos, { align: 'right' });
  yPos += 4;

  // Trennlinie
  doc.setDrawColor(60);
  doc.setLineWidth(0.5);
  doc.line(leftMargin, yPos, rightMargin, yPos);
  yPos += 10;

  // === Hilfsfunktionen ===
  const sectionTitle = (title: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(title, leftMargin, yPos);
    doc.setTextColor(0);
    yPos += 5;
  };

  const thinLine = () => {
    doc.setDrawColor(180);
    doc.setLineWidth(0.2);
    doc.line(leftMargin, yPos, rightMargin, yPos);
    yPos += 6;
  };

  // Bestimme wer Gegner ist
  const wirSindKlaeger = zivil.vertretenePartei === 'klaeger';

  // === KLÄGER + KLAGEVERTRETER (2 Spalten) ===
  sectionTitle('KLÄGER');
  const yKlaeger = yPos;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  if (zivil.klaegerName) doc.text(zivil.klaegerName, leftMargin, yPos);
  yPos += 5;
  if (zivil.klaegerStrasse) doc.text(zivil.klaegerStrasse, leftMargin, yPos);
  yPos += 5;
  const klaegerOrt = [zivil.klaegerPlz, zivil.klaegerOrt].filter(Boolean).join(' ');
  if (klaegerOrt) {
    const ortMitLand = zivil.klaegerLand ? `${klaegerOrt} (${zivil.klaegerLand})` : klaegerOrt;
    doc.text(ortMitLand, leftMargin, yPos);
    yPos += 5;
  }
  if (zivil.klaegerGeburtsdatum) {
    doc.setFontSize(9);
    doc.text(`geb. ${zivil.klaegerGeburtsdatum}`, leftMargin, yPos);
    yPos += 5;
  }

  // Rechte Spalte: Klagevertreter
  let yRight = yKlaeger;
  const kvName = wirSindKlaeger ? meta.kanzleiName : zivil.klagevertreterName;
  const kvStrasse = wirSindKlaeger ? meta.kanzleiStrasse : zivil.klagevertreterStrasse;
  const kvPlz = wirSindKlaeger ? meta.kanzleiPlz : zivil.klagevertreterPlz;
  const kvOrt = wirSindKlaeger ? meta.kanzleiOrt : zivil.klagevertreterOrt;
  const kvCode = wirSindKlaeger ? '' : zivil.klagevertreterCode;

  if (kvName) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text('KLAGEVERTRETER', colMid, yRight - 5);
    doc.setTextColor(0);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(kvName, colMid, yRight);
    yRight += 5;
    if (kvStrasse) { doc.text(kvStrasse, colMid, yRight); yRight += 5; }
    const kvOrtStr = [kvPlz, kvOrt].filter(Boolean).join(' ');
    if (kvOrtStr) {
      const kvText = kvCode ? `${kvOrtStr} (${kvCode})` : kvOrtStr;
      doc.text(kvText, colMid, yRight);
      yRight += 5;
    }
  }

  yPos = Math.max(yPos, yRight) + 6;
  thinLine();

  // === BEKLAGTE + BEKLAGTENVERTRETER (2 Spalten) ===
  sectionTitle('BEKLAGTE');
  const yBeklagte = yPos;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  if (zivil.beklagterName) doc.text(zivil.beklagterName, leftMargin, yPos);
  yPos += 5;
  if (zivil.beklagterStrasse) doc.text(zivil.beklagterStrasse, leftMargin, yPos);
  yPos += 5;
  const beklagterOrt = [zivil.beklagterPlz, zivil.beklagterOrt].filter(Boolean).join(' ');
  if (beklagterOrt) {
    const ortMitLand = zivil.beklagterLand ? `${beklagterOrt} (${zivil.beklagterLand})` : beklagterOrt;
    doc.text(ortMitLand, leftMargin, yPos);
    yPos += 5;
  }
  if (zivil.beklagterGeburtsdatum) {
    doc.setFontSize(9);
    doc.text(`geb. ${zivil.beklagterGeburtsdatum}`, leftMargin, yPos);
    yPos += 5;
  }

  // Rechte Spalte: Beklagtenvertreter
  yRight = yBeklagte;
  const bvName = wirSindKlaeger ? zivil.beklagtenvertreterName : meta.kanzleiName;
  const bvStrasse = wirSindKlaeger ? zivil.beklagtenvertreterStrasse : meta.kanzleiStrasse;
  const bvPlz = wirSindKlaeger ? zivil.beklagtenvertreterPlz : meta.kanzleiPlz;
  const bvOrt = wirSindKlaeger ? zivil.beklagtenvertreterOrt : meta.kanzleiOrt;
  const bvCode = wirSindKlaeger ? zivil.beklagtenvertreterCode : '';

  if (bvName) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text('BEKLAGTENVERTRETER', colMid, yRight - 5);
    doc.setTextColor(0);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(bvName, colMid, yRight);
    yRight += 5;
    if (bvStrasse) { doc.text(bvStrasse, colMid, yRight); yRight += 5; }
    const bvOrtStr = [bvPlz, bvOrt].filter(Boolean).join(' ');
    if (bvOrtStr) {
      const bvText = bvCode ? `${bvOrtStr} (${bvCode})` : bvOrtStr;
      doc.text(bvText, colMid, yRight);
      yRight += 5;
    }
  }

  yPos = Math.max(yPos, yRight) + 6;
  thinLine();

  // === VERFAHREN + FORDERUNG (2 Spalten) ===
  sectionTitle('VERFAHREN');
  const yVerfahren = yPos;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(zivil.klageArt || '—', leftMargin, yPos);
  yPos += 5;
  if (zivil.einbringungsDatum) {
    doc.text(`Eingebracht: ${zivil.einbringungsDatum}`, leftMargin, yPos);
    yPos += 5;
  }
  if (zivil.fallcode) {
    doc.text(`Fallcode: ${zivil.fallcode}`, leftMargin, yPos);
    yPos += 5;
  }
  if (zivil.verfahrensStatus && zivil.verfahrensStatus !== 'offen') {
    doc.setTextColor(100);
    doc.text(`Status: ${zivil.verfahrensStatus}`, leftMargin, yPos);
    doc.setTextColor(0);
    yPos += 5;
  }
  if (zivil.klagegegenstand) {
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(zivil.klagegegenstand, leftMargin, yPos);
    doc.setTextColor(0);
    yPos += 5;
  }

  // Rechte Spalte: Forderung
  yRight = yVerfahren;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text('FORDERUNG (= BMGL)', colMid, yRight - 5);
  doc.setTextColor(0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  if (zivil.kapitalforderung > 0) {
    doc.text(`Kapital: ${formatEuro(zivil.kapitalforderung * 100)}`, colMid, yRight);
    yRight += 5;
  }
  if (zivil.nebenforderung > 0) {
    doc.text(`Nebenforderung: ${formatEuro(zivil.nebenforderung * 100)}`, colMid, yRight);
    yRight += 5;
  }
  if (zivil.zinsenProzent > 0 && zivil.zinsenAb) {
    doc.text(`+ ${zivil.zinsenProzent}% Zinsen seit ${zivil.zinsenAb}`, colMid, yRight);
    yRight += 5;
  }

  // Gesamtstreitwert
  const streitwert = (zivil.kapitalforderung || 0) + (zivil.nebenforderung || 0);
  if (streitwert > 0) {
    yRight += 2;
    doc.setFont('helvetica', 'bold');
    doc.text(`Streitwert: ${formatEuro(streitwert * 100)}`, colMid, yRight);
    yRight += 5;
  }

  yPos = Math.max(yPos, yRight) + 6;
  thinLine();

  // === KOSTENVERZEICHNIS ===
  const results = options.results;
  const isVatFree = options.isVatFree ?? false;
  const effectiveBmgl = bmgl || streitwert;

  if (results && results.lines.length > 0) {
    if (yPos > pageHeight - 100) { doc.addPage(); yPos = 20; }

    sectionTitle('KOSTENVERZEICHNIS');

    // Parameter
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    if (effectiveBmgl > 0) {
      doc.text(`Bemessungsgrundlage: ${formatEuro(effectiveBmgl * 100)}`, leftMargin, yPos);
      yPos += 5;
    }
    if (options.additionalParties && options.additionalParties > 0) {
      doc.text(`Streitgenossen: ${options.additionalParties} (§ 15 RATG)`, leftMargin, yPos);
      yPos += 5;
    }
    yPos += 3;

    // Kosten-Tabelle
    const tableData: any[][] = [];
    results.lines.forEach((line) => {
      tableData.push([
        new Date(line.date).toLocaleDateString('de-AT'),
        line.label,
        line.section,
        formatEuro(line.amountCents)
      ]);
    });

    autoTable(doc, {
      startY: yPos,
      head: [['Datum', 'Leistung / Position', 'Gesetzl. Basis', 'Betrag']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [50, 50, 50],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 40 },
        3: { cellWidth: 30, halign: 'right' }
      },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { left: leftMargin, right: 14 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 8;

    // Zusammenfassung (rechtsbündig)
    const summaryX = pageWidth - 90;

    doc.setDrawColor(150);
    doc.line(summaryX, yPos - 2, rightMargin, yPos - 2);
    yPos += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Verdienst Netto:', summaryX, yPos);
    doc.text(formatEuro(results.netCents), rightMargin, yPos, { align: 'right' });
    yPos += 5;

    doc.text(`Umsatzsteuer (${isVatFree ? '0' : '20'}%):`, summaryX, yPos);
    doc.text(formatEuro(results.vatCents), rightMargin, yPos, { align: 'right' });
    yPos += 5;

    doc.text('Barauslagen / GGG:', summaryX, yPos);
    doc.text(formatEuro(results.gggCents), rightMargin, yPos, { align: 'right' });
    yPos += 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('GESAMTSUMME:', summaryX, yPos);
    doc.text(formatEuro(results.totalCents), rightMargin, yPos, { align: 'right' });
  }

  // === FOOTER ===
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150);
    doc.text('Fallübersicht | RATG/GGG Kostenrechner', leftMargin, pageHeight - 10);
    if (totalPages > 1) {
      doc.text(`Seite ${i}/${totalPages}`, rightMargin, pageHeight - 10, { align: 'right' });
    }
  }

  // Download
  const filename = gz
    ? `Falluebersicht_${gz.replace(/[\/\s]/g, '_')}.pdf`
    : `Falluebersicht_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
