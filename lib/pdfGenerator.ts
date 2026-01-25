import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TotalResult, ProcedureType } from '../types';
import { formatEuro } from './calculator';

export function generateKostenverzeichnisPDF(
  results: TotalResult, 
  bmgl: number, 
  additionalParties: number,
  isVatFree: boolean,
  showSubtotals: boolean,
  procedureType: ProcedureType
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('KOSTENVERZEICHNIS', 14, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-AT')}`, 14, 30);
  
  // Case Parameter Box
  doc.setDrawColor(200);
  doc.line(14, 35, pageWidth - 14, 35);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Verfahrensart:', 14, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(`${procedureType}`, 65, 42);

  doc.setFont('helvetica', 'bold');
  doc.text('Bemessungsgrundlage:', 14, 48);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formatEuro(bmgl * 100)}`, 65, 48);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Streitgenossen (§ 15):', 14, 54);
  doc.setFont('helvetica', 'normal');
  doc.text(`${additionalParties} weitere Person(en)`, 65, 54);

  doc.setFont('helvetica', 'bold');
  doc.text('Steuer-Status:', 14, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(isVatFree ? 'Umsatzsteuerfrei (Netto)' : 'Regel-USt (20%)', 65, 60);

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
    startY: 70,
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
