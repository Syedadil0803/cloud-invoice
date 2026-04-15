import { formatINR, amountInWords, isIntraState } from '../utils/calculations';

export default function InvoicePreview({ seller, buyer, shipTo, header, items, loading, balance, totals }) {
  const intra = isIntraState(seller.stateCode, buyer?.gstin);
  const { subtotal, loadingAmt, taxBreakup, totalTax, grandTotal, totalQty, totalNos } = totals;
  const prevBal = parseFloat(balance.prevBalance) || 0;
  const netBal = prevBal + grandTotal;

  return (
    <div className="bg-white text-[10px] font-sans p-4 shadow-lg border border-gray-300 min-h-[297mm]" style={{ width: '210mm', minHeight: '297mm', fontSize: '9px' }}>
      {/* IRN row */}
      {(header.irn || header.ackNo) && (
        <div className="text-[8px] text-gray-500 flex justify-between mb-1">
          <span>IRN: {header.irn}</span>
          <span>Ack No: {header.ackNo} | Ack Date: {header.ackDate}</span>
        </div>
      )}

      {/* Title */}
      <div className="bg-blue-900 text-white text-center py-1.5 font-bold text-sm relative mb-0">
        TAX INVOICE
        <span className="absolute right-2 text-[8px] font-normal top-1/2 -translate-y-1/2">ORIGINAL FOR RECIPIENT</span>
      </div>

      {/* Seller + Invoice Meta */}
      <div className="flex border border-gray-300">
        <div className="flex-1 p-2 border-r border-gray-300">
          <div className="font-bold text-blue-900 text-[10px]">{seller.name}</div>
          <div className="text-gray-600 mt-0.5 leading-tight">{seller.address}</div>
          <div className="mt-0.5">GSTIN: <b>{seller.gstin}</b> | PAN: {seller.pan}</div>
          <div>State: {seller.state} ({seller.stateCode}) | UDYAM: {seller.udyam}</div>
          <div>CIN: {seller.cin}</div>
          <div>Email: {seller.email}</div>
        </div>
        <div className="w-48 p-2 text-[8.5px]">
          <Row label="Invoice No." value={<b>{header.invoiceNo}</b>} />
          <Row label="Invoice Date" value={header.invoiceDate} />
          <Row label="e-Way Bill No." value={header.ewayBillNo} />
          <Row label="Vehicle No." value={header.vehicleNo} />
          <Row label="Destination" value={header.destination} />
          <Row label="Dispatch Via" value={header.dispatchedThrough} />
        </div>
      </div>

      {/* Consignee + Buyer */}
      <div className="flex border-x border-b border-gray-300">
        <div className="flex-1 p-2 border-r border-gray-300">
          <div className="font-bold text-blue-800 text-[8px] mb-0.5">CONSIGNEE (Ship To)</div>
          <PartyBlock party={shipTo || buyer} />
        </div>
        <div className="w-48 p-2">
          <div className="font-bold text-blue-800 text-[8px] mb-0.5">BUYER (Bill To)</div>
          <PartyBlock party={buyer} />
        </div>
      </div>

      {/* Ref row */}
      <div className="flex border-x border-b border-gray-300 text-[8px] divide-x divide-gray-200">
        {[
          ['Del.Note', header.deliveryNoteNo],
          ['Del.Date', header.deliveryNoteDate],
          ['Ref No.', header.referenceNo],
          ['Buyer Order', header.buyerOrderNo],
          ['Payment', header.paymentTerms],
        ].map(([l, v]) => (
          <div key={l} className="flex-1 px-1.5 py-1">
            <div className="text-gray-400">{l}</div>
            <div className="font-medium">{v || '-'}</div>
          </div>
        ))}
      </div>

      {/* Items table */}
      <table className="w-full border-collapse border border-gray-300 mt-0 text-[8px]">
        <thead>
          <tr className="bg-blue-900 text-white">
            {['Sl', 'Description of Goods', 'HSN', 'GST%', 'Nos', 'Qty(Kg)', 'Rate', 'Per', 'Amount'].map(h => (
              <th key={h} className="border border-blue-700 px-1 py-1 text-left font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const amt = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
            return (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="border border-gray-200 px-1 py-0.5 text-center">{i + 1}</td>
                <td className="border border-gray-200 px-1 py-0.5">{item.description}</td>
                <td className="border border-gray-200 px-1 py-0.5 text-center">{item.hsn}</td>
                <td className="border border-gray-200 px-1 py-0.5 text-center">{item.gstRate}%</td>
                <td className="border border-gray-200 px-1 py-0.5 text-right">{item.nos}</td>
                <td className="border border-gray-200 px-1 py-0.5 text-right">{parseFloat(item.qty || 0).toFixed(3)}</td>
                <td className="border border-gray-200 px-1 py-0.5 text-right">{formatINR(item.rate)}</td>
                <td className="border border-gray-200 px-1 py-0.5 text-center">{item.unit || 'Kg'}</td>
                <td className="border border-gray-200 px-1 py-0.5 text-right">{formatINR(amt)}</td>
              </tr>
            );
          })}
          {/* Subtotal */}
          <tr className="bg-gray-50 font-semibold">
            <td className="border border-gray-200 px-1 py-0.5" colSpan={4}>Sub Total</td>
            <td className="border border-gray-200 px-1 py-0.5 text-right">{totalNos ? totalNos.toFixed(0) : ''}</td>
            <td className="border border-gray-200 px-1 py-0.5 text-right">{totalQty.toFixed(3)}</td>
            <td className="border border-gray-200 px-1 py-0.5" colSpan={2}></td>
            <td className="border border-gray-200 px-1 py-0.5 text-right">{formatINR(subtotal)}</td>
          </tr>
          {/* Loading */}
          {loading.enabled && loadingAmt > 0 && (
            <tr>
              <td className="border border-gray-200 px-1 py-0.5" colSpan={8}>Loading on Sale ({loading.pct}%) HSN: 996719</td>
              <td className="border border-gray-200 px-1 py-0.5 text-right">{formatINR(loadingAmt)}</td>
            </tr>
          )}
          {/* Tax rows */}
          {taxBreakup.map((g, i) => intra ? (
            <React.Fragment key={i}>
              <tr>
                <td className="border border-gray-200 px-1 py-0.5" colSpan={8}>CGST @ {g.cgstRate}% on HSN {g.hsn}</td>
                <td className="border border-gray-200 px-1 py-0.5 text-right">{formatINR(g.cgst)}</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-1 py-0.5" colSpan={8}>SGST @ {g.sgstRate}% on HSN {g.hsn}</td>
                <td className="border border-gray-200 px-1 py-0.5 text-right">{formatINR(g.sgst)}</td>
              </tr>
            </React.Fragment>
          ) : (
            <tr key={i}>
              <td className="border border-gray-200 px-1 py-0.5" colSpan={8}>IGST @ {g.igstRate}% on HSN {g.hsn}</td>
              <td className="border border-gray-200 px-1 py-0.5 text-right">{formatINR(g.igst)}</td>
            </tr>
          ))}
          {/* Grand Total */}
          <tr className="bg-blue-900 text-white font-bold">
            <td className="border border-blue-700 px-1 py-1" colSpan={8}>TOTAL</td>
            <td className="border border-blue-700 px-1 py-1 text-right">₹{formatINR(grandTotal)}</td>
          </tr>
        </tbody>
      </table>

      {/* Amount in words */}
      <div className="border-x border-b border-gray-300 px-2 py-1 text-[8px]">
        <span className="font-semibold">Amount Chargeable (in words): </span>
        <span className="italic">{amountInWords(grandTotal)}</span>
      </div>

      {/* HSN breakup */}
      <table className="w-full border-collapse border border-gray-300 mt-1 text-[8px]">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-1 py-0.5 text-left">HSN</th>
            <th className="border border-gray-300 px-1 py-0.5 text-right">Taxable</th>
            {intra ? (
              <>
                <th className="border border-gray-300 px-1 py-0.5 text-right">CGST%</th>
                <th className="border border-gray-300 px-1 py-0.5 text-right">CGST</th>
                <th className="border border-gray-300 px-1 py-0.5 text-right">SGST%</th>
                <th className="border border-gray-300 px-1 py-0.5 text-right">SGST</th>
              </>
            ) : (
              <>
                <th className="border border-gray-300 px-1 py-0.5 text-right">IGST%</th>
                <th className="border border-gray-300 px-1 py-0.5 text-right">IGST</th>
              </>
            )}
            <th className="border border-gray-300 px-1 py-0.5 text-right">Total Tax</th>
          </tr>
        </thead>
        <tbody>
          {taxBreakup.map((g, i) => (
            <tr key={i}>
              <td className="border border-gray-200 px-1 py-0.5">{g.hsn}</td>
              <td className="border border-gray-200 px-1 py-0.5 text-right">{formatINR(g.taxable)}</td>
              {intra ? (
                <>
                  <td className="border border-gray-200 px-1 py-0.5 text-right">{g.cgstRate}%</td>
                  <td className="border border-gray-200 px-1 py-0.5 text-right">{formatINR(g.cgst)}</td>
                  <td className="border border-gray-200 px-1 py-0.5 text-right">{g.sgstRate}%</td>
                  <td className="border border-gray-200 px-1 py-0.5 text-right">{formatINR(g.sgst)}</td>
                </>
              ) : (
                <>
                  <td className="border border-gray-200 px-1 py-0.5 text-right">{g.igstRate}%</td>
                  <td className="border border-gray-200 px-1 py-0.5 text-right">{formatINR(g.igst)}</td>
                </>
              )}
              <td className="border border-gray-200 px-1 py-0.5 text-right font-semibold">{formatINR(g.totalTax)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tax in words */}
      <div className="border-x border-b border-gray-300 px-2 py-1 text-[8px]">
        <span className="font-semibold">Tax Amount (in words): </span>
        <span className="italic">{amountInWords(totalTax)}</span>
      </div>

      {/* Balance */}
      <div className="border border-gray-300 mt-1 p-2 text-[8.5px]">
        <div className="font-bold text-blue-800 mb-1">BALANCE / LEDGER</div>
        <div className="flex gap-6">
          <span>Previous Balance: <b>{formatINR(prevBal)}</b> {prevBal >= 0 ? 'Dr' : 'Cr'}</span>
          <span>Bill Amount: <b>{formatINR(grandTotal)}</b> Dr</span>
          <span className="ml-auto font-bold">Net Balance: <span className={netBal >= 0 ? 'text-red-600' : 'text-green-600'}>{formatINR(Math.abs(netBal))} {netBal >= 0 ? 'Dr' : 'Cr'}</span></span>
        </div>
        {balance.remarks && <div className="mt-0.5 text-gray-600">Remarks: {balance.remarks}</div>}
      </div>

      {/* Declaration + Bank + Signatory */}
      <div className="flex border border-t-0 border-gray-300 text-[8px]">
        <div className="flex-1 p-2 border-r border-gray-300">
          <div className="font-bold mb-0.5">Declaration:</div>
          <div className="text-gray-600 leading-tight">No returns once goods leave premises. Liability ends at dispatch.<br />
            0.5% weight variance allowed. 24% p.a. interest + GST on dues.<br />
            Quality claims within 2 days.</div>
          <div className="mt-1 font-medium">Bank: {seller.bank} | A/c: {seller.accountNo}</div>
          <div>IFSC: {seller.ifsc} | Branch: {seller.branch}</div>
        </div>
        <div className="w-44 p-2 flex flex-col justify-between">
          <div className="font-bold text-blue-900">For Sufi Structural Tubes Pvt. Ltd</div>
          <div className="text-right text-gray-500 mt-4">Authorised Signatory</div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[7.5px] text-gray-400 mt-1 border-t border-gray-200 pt-1">
        PAN: {seller.pan} | Subject to Pune Jurisdiction | Computer Generated Invoice
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex gap-1 border-b border-gray-100 py-0.5">
      <span className="text-gray-400 w-20 shrink-0">{label}:</span>
      <span className="font-medium">{value || '-'}</span>
    </div>
  );
}

function PartyBlock({ party }) {
  if (!party?.name) return <div className="text-gray-400 italic">Not selected</div>;
  return (
    <div>
      <div className="font-bold">{party.name}</div>
      <div className="text-gray-600 leading-tight">{party.address}, {party.city} - {party.pin}</div>
      <div>State: {party.state} ({party.stateCode})</div>
      <div>GSTIN: {party.gstin}</div>
    </div>
  );
}

// Need React for Fragment
import React from 'react';
