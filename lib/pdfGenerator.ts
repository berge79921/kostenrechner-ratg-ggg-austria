import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TotalResult, ProcedureType, CaseMode, CaseMetadata, ExekutionMetadata } from '../types';
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
  // Druckoptionen
  printOptions?: PrintOptions;
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
  const caseMode = options?.caseMode ?? CaseMode.CIVIL;
  const meta = options?.caseMetadata;
  const print = options?.printOptions || { printTiteldaten: true, printExekutionsdaten: true, printKanzlei: true };

  let yPos = 20;

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

    // Zwei-Spalten: Partei / Kanzlei - nur wenn entsprechende Druckoption aktiv
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

  // Summary Logic
  const finalY = (doc as any).lastAutoTable.finalY + 12;
  const rightAlignX = pageWidth - 14;
  const labelX = pageWidth - 95;

  doc.setDrawColor(200);
  doc.line(labelX, finalY - 4, rightAlignX, finalY - 4);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Verdienst Netto:', labelX, finalY);
  doc.text(formatEuro(results.netCents), rightAlignX, finalY, { align: 'right' });

  doc.text(`Umsatzsteuer (${isVatFree ? '0' : '20'}%):`, labelX, finalY + 7);
  doc.text(formatEuro(results.vatCents), rightAlignX, finalY + 7, { align: 'right' });

  doc.text('Barauslagen / GGG:', labelX, finalY + 14);
  doc.text(formatEuro(results.gggCents), rightAlignX, finalY + 14, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('GESAMTSUMME:', labelX, finalY + 25);
  doc.text(formatEuro(results.totalCents), rightAlignX, finalY + 25, { align: 'right' });

  // Legal Disclaimer
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150);
  doc.text('Dies ist eine softwaregenerierte Kostenaufstellung auf Basis der RATG/GGG Logik. Keine Gewähr für Fehlerfreiheit.', 14, doc.internal.pageSize.getHeight() - 10);

  // Trigger Download
  doc.save(`Kostenverzeichnis_${new Date().toISOString().split('T')[0]}.pdf`);
}
