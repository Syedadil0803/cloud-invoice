import Autocomplete from './Autocomplete';

const PAYMENT_TERMS = ['ADV', 'Credit 7 Days', 'Credit 15 Days', 'Credit 30 Days', 'Against Delivery', 'LC'];

export default function HeaderForm({ header, onChange, vehicles }) {
  const set = (k, v) => onChange({ ...header, [k]: v });
  const vehicleSuggestions = vehicles.map(v => v.vehicleNo);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">Invoice No.</label>
          <input className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={header.invoiceNo} onChange={e => set('invoiceNo', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">Invoice Date</label>
          <input type="date" className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={header.invoiceDate} onChange={e => set('invoiceDate', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">Delivery Note No.</label>
          <input className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={header.deliveryNoteNo} onChange={e => set('deliveryNoteNo', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">Delivery Note Date</label>
          <input type="date" className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={header.deliveryNoteDate} onChange={e => set('deliveryNoteDate', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">Reference No.</label>
          <input className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={header.referenceNo} onChange={e => set('referenceNo', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">Buyer's Order No.</label>
          <input className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={header.buyerOrderNo} onChange={e => set('buyerOrderNo', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">Mode/Terms of Payment</label>
          <select className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={header.paymentTerms} onChange={e => set('paymentTerms', e.target.value)}>
            {PAYMENT_TERMS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">Dispatched Through</label>
          <input className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={header.dispatchedThrough} onChange={e => set('dispatchedThrough', e.target.value)} placeholder="e.g. RD" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">Destination</label>
          <input className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={header.destination} onChange={e => set('destination', e.target.value)} placeholder="e.g. NIMGAON" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">Motor Vehicle No.</label>
          <Autocomplete
            value={header.vehicleNo}
            onChange={v => set('vehicleNo', v)}
            suggestions={vehicleSuggestions}
            placeholder="e.g. MH12AB1234"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">e-Way Bill No.</label>
          <input className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={header.ewayBillNo} onChange={e => set('ewayBillNo', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">IRN (optional)</label>
          <input className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={header.irn} onChange={e => set('irn', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">Ack No.</label>
          <input className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={header.ackNo} onChange={e => set('ackNo', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-0.5">Ack Date</label>
          <input type="date" className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={header.ackDate} onChange={e => set('ackDate', e.target.value)} />
        </div>
      </div>
    </div>
  );
}
