import { formatINR } from '../utils/calculations';

export default function BalanceForm({ balance, onChange, grandTotal }) {
  const set = (k, v) => onChange({ ...balance, [k]: v });
  const prevBal = parseFloat(balance.prevBalance) || 0;
  const netBal = prevBal + (grandTotal || 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">Previous Balance (Dr = positive)</label>
          <input type="number" step="0.01"
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={balance.prevBalance}
            onChange={e => set('prevBalance', e.target.value)}
            placeholder="0.00" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">Bill Amount (auto)</label>
          <input readOnly
            className="w-full border border-gray-200 rounded px-2 py-1 text-sm bg-gray-100 font-medium"
            value={`₹${formatINR(grandTotal || 0)} Dr`} />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded p-2 flex justify-between items-center">
        <span className="text-sm font-medium text-blue-800">Net Balance</span>
        <span className={`text-sm font-bold ${netBal >= 0 ? 'text-red-600' : 'text-green-600'}`}>
          ₹{formatINR(Math.abs(netBal))} {netBal >= 0 ? 'Dr' : 'Cr'}
        </span>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-0.5">Remarks</label>
        <input
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={balance.remarks}
          onChange={e => set('remarks', e.target.value)}
          placeholder="e.g. TRN BY CUSTOMER" />
      </div>
    </div>
  );
}
