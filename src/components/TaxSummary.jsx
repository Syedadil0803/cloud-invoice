import { formatINR, amountInWords } from '../utils/calculations';

export default function TaxSummary({ totals, intra, loading }) {
  const { subtotal, loadingAmt, taxBreakup, totalTax, grandTotal } = totals;

  return (
    <div className="space-y-3">
      {/* Loading charges */}
      <div className="flex items-center gap-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={loading.enabled}
            onChange={e => loading.onToggle(e.target.checked)} />
          <span className="font-medium">Loading on Sale</span>
          <span className="text-xs text-gray-500">(HSN: 996719, 18% GST)</span>
        </label>
        {loading.enabled && (
          <div className="flex items-center gap-1 ml-auto">
            <input type="number" step="0.01"
              className="w-16 border border-gray-300 rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={loading.pct}
              onChange={e => loading.onPctChange(e.target.value)} />
            <span className="text-sm text-gray-500">%</span>
            <span className="text-sm font-medium ml-2">= ₹{formatINR(loadingAmt)}</span>
          </div>
        )}
      </div>

      {/* Totals summary */}
      <div className="bg-gray-50 border border-gray-200 rounded p-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>₹{formatINR(subtotal)}</span>
        </div>
        {loading.enabled && loadingAmt > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Loading Charges ({loading.pct}%)</span>
            <span>₹{formatINR(loadingAmt)}</span>
          </div>
        )}
        <div className="border-t border-gray-200 pt-1 mt-1">
          {taxBreakup.map((g, i) => (
            <div key={i}>
              {intra ? (
                <>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>CGST {g.cgstRate}% (HSN {g.hsn})</span>
                    <span>₹{formatINR(g.cgst)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>SGST {g.sgstRate}% (HSN {g.hsn})</span>
                    <span>₹{formatINR(g.sgst)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>IGST {g.igstRate}% (HSN {g.hsn})</span>
                  <span>₹{formatINR(g.igst)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Total Tax</span>
          <span>₹{formatINR(totalTax)}</span>
        </div>
        <div className="flex justify-between font-bold text-base border-t border-gray-300 pt-1 mt-1">
          <span>Grand Total</span>
          <span className="text-blue-800">₹{formatINR(grandTotal)}</span>
        </div>
        <div className="text-xs text-gray-500 italic">{amountInWords(grandTotal)}</div>
      </div>

      {/* HSN-wise breakup table */}
      <div>
        <div className="text-xs font-semibold text-gray-600 mb-1">HSN-wise Tax Breakup</div>
        <table className="w-full text-xs border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 px-2 py-1 text-left">HSN</th>
              <th className="border border-gray-200 px-2 py-1 text-right">Taxable</th>
              {intra ? (
                <>
                  <th className="border border-gray-200 px-2 py-1 text-right">CGST%</th>
                  <th className="border border-gray-200 px-2 py-1 text-right">CGST</th>
                  <th className="border border-gray-200 px-2 py-1 text-right">SGST%</th>
                  <th className="border border-gray-200 px-2 py-1 text-right">SGST</th>
                </>
              ) : (
                <>
                  <th className="border border-gray-200 px-2 py-1 text-right">IGST%</th>
                  <th className="border border-gray-200 px-2 py-1 text-right">IGST</th>
                </>
              )}
              <th className="border border-gray-200 px-2 py-1 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {taxBreakup.map((g, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-2 py-1">{g.hsn}</td>
                <td className="border border-gray-200 px-2 py-1 text-right">{formatINR(g.taxable)}</td>
                {intra ? (
                  <>
                    <td className="border border-gray-200 px-2 py-1 text-right">{g.cgstRate}%</td>
                    <td className="border border-gray-200 px-2 py-1 text-right">{formatINR(g.cgst)}</td>
                    <td className="border border-gray-200 px-2 py-1 text-right">{g.sgstRate}%</td>
                    <td className="border border-gray-200 px-2 py-1 text-right">{formatINR(g.sgst)}</td>
                  </>
                ) : (
                  <>
                    <td className="border border-gray-200 px-2 py-1 text-right">{g.igstRate}%</td>
                    <td className="border border-gray-200 px-2 py-1 text-right">{formatINR(g.igst)}</td>
                  </>
                )}
                <td className="border border-gray-200 px-2 py-1 text-right font-medium">{formatINR(g.totalTax)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
