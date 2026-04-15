import { useState } from 'react';
import { saveBuyer } from '../utils/storage';

const STATES = [
  { name: 'Andhra Pradesh', code: '37' }, { name: 'Arunachal Pradesh', code: '12' },
  { name: 'Assam', code: '18' }, { name: 'Bihar', code: '10' },
  { name: 'Chhattisgarh', code: '22' }, { name: 'Goa', code: '30' },
  { name: 'Gujarat', code: '24' }, { name: 'Haryana', code: '06' },
  { name: 'Himachal Pradesh', code: '02' }, { name: 'Jharkhand', code: '20' },
  { name: 'Karnataka', code: '29' }, { name: 'Kerala', code: '32' },
  { name: 'Madhya Pradesh', code: '23' }, { name: 'Maharashtra', code: '27' },
  { name: 'Manipur', code: '14' }, { name: 'Meghalaya', code: '17' },
  { name: 'Mizoram', code: '15' }, { name: 'Nagaland', code: '13' },
  { name: 'Odisha', code: '21' }, { name: 'Punjab', code: '03' },
  { name: 'Rajasthan', code: '08' }, { name: 'Sikkim', code: '11' },
  { name: 'Tamil Nadu', code: '33' }, { name: 'Telangana', code: '36' },
  { name: 'Tripura', code: '16' }, { name: 'Uttar Pradesh', code: '09' },
  { name: 'Uttarakhand', code: '05' }, { name: 'West Bengal', code: '19' },
  { name: 'Delhi', code: '07' }, { name: 'Jammu & Kashmir', code: '01' },
];

const emptyBuyer = { id: '', name: '', address: '', city: '', state: 'Maharashtra', stateCode: '27', pin: '', gstin: '' };

export default function BuyerForm({ buyer, shipTo, onChange, onShipToChange, buyers }) {
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [diffShipTo, setDiffShipTo] = useState(false);
  const [newBuyer, setNewBuyer] = useState(emptyBuyer);

  const filtered = buyers.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    (b.gstin || '').toLowerCase().includes(search.toLowerCase())
  );

  const selectBuyer = (b) => {
    onChange(b);
    if (!diffShipTo) onShipToChange(null);
    setSearch(b.name);
    setShowNew(false);
  };

  const handleStateChange = (stateName, target) => {
    const found = STATES.find(s => s.name === stateName);
    target({ ...newBuyer, state: stateName, stateCode: found?.code || '' });
  };

  const saveNew = () => {
    const b = { ...newBuyer, id: Date.now().toString() };
    saveBuyer(b);
    onChange(b);
    if (!diffShipTo) onShipToChange(null);
    setShowNew(false);
    setSearch(b.name);
  };

  const setField = (k, v) => setNewBuyer(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <input
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Search buyer by name or GSTIN..."
          value={search}
          onChange={e => { setSearch(e.target.value); setShowNew(false); }}
        />
        {search && filtered.length > 0 && (
          <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto text-sm">
            {filtered.map(b => (
              <li key={b.id} className="px-3 py-2 hover:bg-blue-50 cursor-pointer" onMouseDown={() => selectBuyer(b)}>
                <div className="font-medium">{b.name}</div>
                <div className="text-xs text-gray-400">{b.gstin} | {b.city}, {b.state}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Selected buyer display */}
      {buyer?.name && !showNew && (
        <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs">
          <div className="font-semibold text-blue-800">{buyer.name}</div>
          <div className="text-gray-600">{buyer.address}, {buyer.city} - {buyer.pin}</div>
          <div className="text-gray-600">GSTIN: {buyer.gstin} | State: {buyer.state} ({buyer.stateCode})</div>
        </div>
      )}

      <button
        className="text-xs text-blue-600 hover:underline"
        onClick={() => { setShowNew(!showNew); setNewBuyer(emptyBuyer); }}
      >
        {showNew ? '— Cancel' : '+ Add New Buyer'}
      </button>

      {showNew && (
        <div className="border border-gray-200 rounded p-3 space-y-2 bg-gray-50">
          <div className="grid grid-cols-2 gap-2">
            {[['name', 'Company Name'], ['address', 'Address'], ['city', 'City'], ['pin', 'PIN'], ['gstin', 'GSTIN']].map(([k, lbl]) => (
              <div key={k} className={k === 'address' ? 'col-span-2' : ''}>
                <label className="block text-xs text-gray-500 mb-0.5">{lbl}</label>
                <input className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={newBuyer[k]} onChange={e => setField(k, e.target.value)} />
              </div>
            ))}
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">State</label>
              <select className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={newBuyer.state}
                onChange={e => handleStateChange(e.target.value, setNewBuyer)}>
                {STATES.map(s => <option key={s.code} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-0.5">State Code</label>
              <input className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-100"
                value={newBuyer.stateCode} readOnly />
            </div>
          </div>
          <button onClick={saveNew}
            className="w-full bg-blue-600 text-white text-sm py-1.5 rounded hover:bg-blue-700">
            Save Buyer
          </button>
        </div>
      )}

      {/* Ship To toggle */}
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={diffShipTo} onChange={e => {
          setDiffShipTo(e.target.checked);
          if (!e.target.checked) onShipToChange(null);
        }} />
        <span>Ship To is different from Bill To</span>
      </label>

      {diffShipTo && (
        <div className="border border-orange-200 rounded p-3 space-y-2 bg-orange-50">
          <div className="text-xs font-semibold text-orange-700 mb-1">Ship To (Consignee)</div>
          <div className="grid grid-cols-2 gap-2">
            {[['name', 'Name'], ['address', 'Address'], ['city', 'City'], ['pin', 'PIN'], ['gstin', 'GSTIN'], ['stateCode', 'State Code']].map(([k, lbl]) => (
              <div key={k} className={k === 'address' ? 'col-span-2' : ''}>
                <label className="block text-xs text-gray-500 mb-0.5">{lbl}</label>
                <input className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={shipTo?.[k] || ''}
                  onChange={e => onShipToChange({ ...(shipTo || {}), [k]: e.target.value })} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
