import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { formatINR, amountInWords, computeTotals, isIntraState } from './calculations';

const BRAND = [0, 51, 102];
const LIGHT = [240, 245, 255];
const BLACK = [0, 0, 0];
const GRAY = [100, 100, 100];

function hdr(doc, title, y) {
  doc.setFillColor(...BRAND);
  doc.rect(10, y, 190, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 105, y + 5, { align: 'center' });
  doc.setTextColor(...BLACK);
}

function box(doc, x, y, w, h) {
  doc.setDrawColor(180, 180, 180);
  doc.rect(x, y, w, h);
}

function label(doc, txt, x, y) {
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text(txt, x, y);
}

function val(doc, txt, x, y, bold) {
  doc.setFontSize(7.5);
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.setTextColor(...BLACK);
  doc.text(String(txt ?? ''), x, y);
}


function drawInvoicePage(doc, data, copyLabel) {
  const { seller, buyer, shipTo, header, items, loading, balance, intra, totals } = data;
  const { subtotal, loadingAmt, taxBreakup, totalTax, grandTotal, totalQty, totalNos } = totals;
  let y = 10;

  // IRN / Ack row
  if (header.irn || header.ackNo) {
    doc.setFontSize(6.5);
    doc.setTextColor(...GRAY);
    doc.text(`IRN: ${header.irn || ''}`, 10, y);
    doc.text(`Ack No: ${header.ackNo || ''}   Ack Date: ${header.ackDate || ''}`, 130, y);
    y += 5;
  }

  // Title bar
  doc.setFillColor(...BRAND);
  doc.rect(10, y, 190, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', 105, y + 6.5, { align: 'center' });
  doc.setFontSize(7);
  doc.text(copyLabel, 195, y + 6.5, { align: 'right' });
  y += 9;

  // Seller box left | Invoice meta right
  const sellerBoxH = 38;
  box(doc, 10, y, 120, sellerBoxH);
  box(doc, 130, y, 70, sellerBoxH);

  doc.setTextColor(...BRAND);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(seller.name, 12, y + 6);
  doc.setTextColor(...BLACK);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  const addrLines = doc.splitTextToSize(seller.address, 116);
  doc.text(addrLines, 12, y + 11);
  doc.text(`GSTIN: ${seller.gstin}   PAN: ${seller.pan}`, 12, y + 22);
  doc.text(`State: ${seller.state} (${seller.stateCode})   UDYAM: ${seller.udyam}`, 12, y + 27);
  doc.text(`CIN: ${seller.cin}`, 12, y + 32);
  doc.text(`Email: ${seller.email}`, 12, y + 37);

  const mx = 132;
  label(doc, 'Invoice No.', mx, y + 6);
  val(doc, header.invoiceNo, mx + 22, y + 6, true);
  label(doc, 'Invoice Date', mx, y + 12);
  val(doc, header.invoiceDate, mx + 22, y + 12);
  label(doc, 'e-Way Bill No.', mx, y + 18);
  val(doc, header.ewayBillNo, mx + 28, y + 18);
  label(doc, 'Vehicle No.', mx, y + 24);
  val(doc, header.vehicleNo, mx + 22, y + 24);
  label(doc, 'Destination', mx, y + 30);
  val(doc, header.destination, mx + 22, y + 30);
  label(doc, 'Dispatch Via', mx, y + 36);
  val(doc, header.dispatchedThrough, mx + 22, y + 36);
  y += sellerBoxH;

  // Consignee | Buyer
  const partyH = 28;
  box(doc, 10, y, 120, partyH);
  box(doc, 130, y, 70, partyH);
  doc.setFillColor(...LIGHT);
  doc.rect(10, y, 120, 5, 'F');
  doc.rect(130, y, 70, 5, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND);
  doc.text('CONSIGNEE (Ship To)', 12, y + 3.5);
  doc.text('BUYER (Bill To)', 132, y + 3.5);
  doc.setTextColor(...BLACK);

  const drawParty = (p, x, maxW) => {
    if (!p) return;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(p.name || '', x, y + 10);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(`${p.address || ''}, ${p.city || ''} - ${p.pin || ''}`, maxW);
    doc.text(lines, x, y + 15);
    doc.text(`State: ${p.state || ''} (${p.stateCode || ''})`, x, y + 22);
    doc.text(`GSTIN: ${p.gstin || ''}`, x, y + 26);
  };
  drawParty(shipTo || buyer, 12, 116);
  drawParty(buyer, 132, 66);
  y += partyH;

  // Ref row
  box(doc, 10, y, 190, 10);
  const refFields = [
    ['Del.Note', header.deliveryNoteNo],
    ['Del.Date', header.deliveryNoteDate],
    ['Ref No.', header.referenceNo],
    ['Buyer Order', header.buyerOrderNo],
    ['Payment', header.paymentTerms],
  ];
  let rx = 12;
  refFields.forEach(([l, v]) => {
    label(doc, l + ':', rx, y + 4);
    val(doc, v || '-', rx, y + 9, false);
    rx += 38;
  });
  y += 10;

  // Items table
  const itemRows = items.map((item, i) => [
    i + 1,
    item.description,
    item.hsn,
    `${item.gstRate}%`,
    item.nos || '',
    parseFloat(item.qty || 0).toFixed(3),
    formatINR(item.rate),
    item.unit || 'Kg',
    formatINR((parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0)),
  ]);

  itemRows.push([
    '', { content: 'Sub Total', styles: { fontStyle: 'bold' } },
    '', '', totalNos ? totalNos.toFixed(0) : '',
    totalQty.toFixed(3), '', '',
    { content: formatINR(subtotal), styles: { fontStyle: 'bold' } },
  ]);

  if (loading.enabled && loadingAmt > 0) {
    itemRows.push(['', `Loading on Sale (${loading.pct}%) HSN:996719`, '996719', '18%', '', '', '', '', formatINR(loadingAmt)]);
  }

  taxBreakup.forEach(g => {
    if (intra) {
      itemRows.push(['', `CGST @ ${g.cgstRate}% on HSN ${g.hsn}`, '', '', '', '', '', '', formatINR(g.cgst)]);
      itemRows.push(['', `SGST @ ${g.sgstRate}% on HSN ${g.hsn}`, '', '', '', '', '', '', formatINR(g.sgst)]);
    } else {
      itemRows.push(['', `IGST @ ${g.igstRate}% on HSN ${g.hsn}`, '', '', '', '', '', '', formatINR(g.igst)]);
    }
  });

  itemRows.push([
    '', { content: 'TOTAL', styles: { fontStyle: 'bold' } },
    '', '', '', '', '', '',
    { content: formatINR(grandTotal), styles: { fontStyle: 'bold' } },
  ]);

  doc.autoTable({
    startY: y,
    head: [['Sl', 'Description of Goods', 'HSN', 'GST%', 'Nos', 'Qty(Kg)', 'Rate', 'Per', 'Amount']],
    body: itemRows,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: BRAND, textColor: 255, fontSize: 7, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 55 },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 12, halign: 'center' },
      4: { cellWidth: 12, halign: 'right' },
      5: { cellWidth: 18, halign: 'right' },
      6: { cellWidth: 18, halign: 'right' },
      7: { cellWidth: 12, halign: 'center' },
      8: { cellWidth: 22, halign: 'right' },
    },
    margin: { left: 10, right: 10 },
  });
  y = doc.lastAutoTable.finalY + 2;

  // Amount in words
  box(doc, 10, y, 190, 8);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Amount Chargeable (in words):', 12, y + 5);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.text(amountInWords(grandTotal), 72, y + 5);
  y += 8;

  // HSN-wise tax breakup
  const hsnHead = intra
    ? [['HSN', 'Taxable Value', 'CGST Rate', 'CGST Amt', 'SGST Rate', 'SGST Amt', 'Total Tax']]
    : [['HSN', 'Taxable Value', 'IGST Rate', 'IGST Amt', 'Total Tax']];

  const hsnBody = taxBreakup.map(g => intra
    ? [g.hsn, formatINR(g.taxable), `${g.cgstRate}%`, formatINR(g.cgst), `${g.sgstRate}%`, formatINR(g.sgst), formatINR(g.totalTax)]
    : [g.hsn, formatINR(g.taxable), `${g.igstRate}%`, formatINR(g.igst), formatINR(g.totalTax)]
  );
  const totRow = intra
    ? ['Total', formatINR(taxBreakup.reduce((s, g) => s + g.taxable, 0)), '', formatINR(taxBreakup.reduce((s, g) => s + g.cgst, 0)), '', formatINR(taxBreakup.reduce((s, g) => s + g.sgst, 0)), formatINR(totalTax)]
    : ['Total', formatINR(taxBreakup.reduce((s, g) => s + g.taxable, 0)), '', formatINR(taxBreakup.reduce((s, g) => s + g.igst, 0)), formatINR(totalTax)];
  hsnBody.push(totRow);

  doc.autoTable({
    startY: y,
    head: hsnHead,
    body: hsnBody,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [60, 90, 130], textColor: 255 },
    margin: { left: 10, right: 10 },
  });
  y = doc.lastAutoTable.finalY + 2;

  // Tax in words
  box(doc, 10, y, 190, 7);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Tax Amount (in words):', 12, y + 4.5);
  doc.setFont('helvetica', 'italic');
  doc.text(amountInWords(totalTax), 58, y + 4.5);
  y += 7;

  // Balance
  const prevBal = parseFloat(balance.prevBalance) || 0;
  const netBal = prevBal + grandTotal;
  box(doc, 10, y, 190, 18);
  doc.setFillColor(...LIGHT);
  doc.rect(10, y, 190, 5, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND);
  doc.text('BALANCE / LEDGER', 12, y + 3.5);
  doc.setTextColor(...BLACK);
  doc.setFont('helvetica', 'normal');
  doc.text(`Previous Balance: ${formatINR(prevBal)} ${prevBal >= 0 ? 'Dr' : 'Cr'}`, 12, y + 10);
  doc.text(`Bill Amount: ${formatINR(grandTotal)} Dr`, 80, y + 10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Net Balance: ${formatINR(Math.abs(netBal))} ${netBal >= 0 ? 'Dr' : 'Cr'}`, 148, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Remarks: ${balance.remarks || ''}`, 12, y + 16);
  y += 18;

  // Declaration + Signatory
  const declH = 24;
  box(doc, 10, y, 130, declH);
  box(doc, 140, y, 60, declH);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Declaration:', 12, y + 5);
  doc.setFont('helvetica', 'normal');
  const decl = 'No returns once goods leave premises. Liability ends at dispatch.\n0.5% weight variance allowed. 24% p.a. interest + GST on dues.\nQuality claims within 2 days.';
  doc.text(decl, 12, y + 9);
  doc.text(`Bank: ${seller.bank} | A/c: ${seller.accountNo}`, 12, y + 18);
  doc.text(`IFSC: ${seller.ifsc} | Branch: ${seller.branch}`, 12, y + 22);
  doc.setFont('helvetica', 'bold');
  doc.text('For Sufi Structural Tubes Pvt. Ltd', 142, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorised Signatory', 157, y + 21);
  y += declH + 4;

  // Footer
  doc.setFontSize(6.5);
  doc.setTextColor(...GRAY);
  doc.text(`PAN: ${seller.pan}`, 12, y);
  doc.text('Subject to Pune Jurisdiction | Computer Generated Invoice', 105, y, { align: 'center' });
}

function drawEwayBill(doc, data) {
  const { seller, buyer, shipTo, header, items, intra, totals } = data;
  const { subtotal, loadingAmt, taxBreakup, grandTotal } = totals;
  doc.addPage();
  let y = 10;

  doc.setFillColor(...BRAND);
  doc.rect(10, y, 190, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('e-WAY BILL', 105, y + 6.5, { align: 'center' });
  y += 9;

  // Meta grid
  box(doc, 10, y, 190, 28);
  const col1 = [
    ['e-Way Bill No.', header.ewayBillNo || 'N/A'],
    ['Doc No. / Date', `${header.invoiceNo} / ${header.invoiceDate}`],
    ['IRN', header.irn || 'N/A'],
    ['Ack No. / Date', `${header.ackNo || ''} / ${header.ackDate || ''}`],
    ['Mode', '1 - Road'],
  ];
  const col2 = [
    ['Supply Type', 'Outward - Supply'],
    ['Transaction Type', 'Regular'],
    ['Approx Distance', header.approxDistance || 'N/A'],
    ['Valid Upto', header.validUpto || 'N/A'],
    ['Generated By', seller.gstin],
  ];
  col1.forEach(([l, v], i) => {
    label(doc, l + ':', 12, y + 6 + i * 5);
    val(doc, v, 44, y + 6 + i * 5, false);
  });
  col2.forEach(([l, v], i) => {
    label(doc, l + ':', 105, y + 6 + i * 5);
    val(doc, v, 135, y + 6 + i * 5, false);
  });
  y += 28;

  hdr(doc, 'ADDRESS DETAILS', y); y += 7;
  box(doc, 10, y, 95, 30);
  box(doc, 105, y, 95, 30);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('FROM (Dispatch From)', 12, y + 5);
  doc.text('TO (Ship To)', 107, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(seller.name, 12, y + 10);
  doc.text(doc.splitTextToSize(seller.address, 90), 12, y + 15);
  doc.text(`GSTIN: ${seller.gstin}`, 12, y + 27);
  const toParty = shipTo || buyer;
  doc.text(toParty?.name || '', 107, y + 10);
  doc.text(doc.splitTextToSize(`${toParty?.address || ''}, ${toParty?.city || ''}`, 90), 107, y + 15);
  doc.text(`GSTIN: ${toParty?.gstin || ''}`, 107, y + 27);
  y += 30;

  hdr(doc, 'GOODS DETAILS', y); y += 7;
  doc.autoTable({
    startY: y,
    head: [['HSN', 'Product Name & Description', 'Quantity', 'Taxable Amt', 'Tax Rate']],
    body: items.map(item => [
      item.hsn,
      item.description,
      `${parseFloat(item.qty || 0).toFixed(3)} ${item.unit || 'Kg'}`,
      formatINR((parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0)),
      intra ? `CGST ${item.gstRate / 2}% + SGST ${item.gstRate / 2}%` : `IGST ${item.gstRate}%`,
    ]),
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: BRAND, textColor: 255 },
    margin: { left: 10, right: 10 },
  });
  y = doc.lastAutoTable.finalY + 2;

  box(doc, 10, y, 190, 10);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  const cgstTot = taxBreakup.reduce((s, g) => s + (g.cgst || 0), 0);
  const sgstTot = taxBreakup.reduce((s, g) => s + (g.sgst || 0), 0);
  const igstTot = taxBreakup.reduce((s, g) => s + (g.igst || 0), 0);
  doc.text(`Tot. Taxable Amt: ${formatINR(subtotal + loadingAmt)}`, 12, y + 6);
  if (intra) {
    doc.text(`CGST: ${formatINR(cgstTot)}`, 75, y + 6);
    doc.text(`SGST: ${formatINR(sgstTot)}`, 115, y + 6);
  } else {
    doc.text(`IGST: ${formatINR(igstTot)}`, 75, y + 6);
  }
  doc.text(`Total Inv Amt: ${formatINR(grandTotal)}`, 155, y + 6);
  y += 10;

  hdr(doc, 'TRANSPORTATION DETAILS', y); y += 7;
  box(doc, 10, y, 190, 18);
  label(doc, 'Transporter ID:', 12, y + 6);
  val(doc, header.transporterId || '', 42, y + 6, false);
  label(doc, 'Transporter Name:', 12, y + 12);
  val(doc, header.transporterName || header.dispatchedThrough || '', 46, y + 12, false);
  label(doc, 'Doc No.:', 105, y + 6);
  val(doc, header.transportDocNo || '', 122, y + 6, false);
  label(doc, 'Doc Date:', 105, y + 12);
  val(doc, header.transportDocDate || header.invoiceDate || '', 122, y + 12, false);
  y += 18;

  hdr(doc, 'VEHICLE DETAILS', y); y += 7;
  doc.autoTable({
    startY: y,
    head: [['Vehicle No.', 'From', 'CEWB No.']],
    body: [[header.vehicleNo || '', 'PUNE', header.cewbNo || '']],
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: BRAND, textColor: 255 },
    margin: { left: 10, right: 10 },
  });
}

export function generatePDF(formData) {
  const { seller, buyer, shipTo, header, items, loading, balance } = formData;
  const intra = isIntraState(seller.stateCode, buyer?.gstin);
  const totals = computeTotals(items, loading.enabled, loading.pct, '996719', intra);
  const data = { seller, buyer, shipTo, header, items, loading, balance, intra, totals };

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  drawInvoicePage(doc, data, 'ORIGINAL FOR RECIPIENT');
  drawEwayBill(doc, data);
  doc.addPage();
  drawInvoicePage(doc, data, 'DUPLICATE FOR TRANSPORTER');

  const invoiceNo = (header.invoiceNo || 'SUFI').replace(/\//g, '-');
  doc.save(`${invoiceNo}.pdf`);
}
