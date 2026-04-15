import { useState } from 'react';
import { saveItem } from '../utils/storage';
import { formatINR } from '../utils/calculations';

const emptyItem = { description: '', hsn: '', gstRate: 18, unit: 'Kg', defaultRate: '' };

export default function ItemsTable({ items, onChange, savedItems }) {
  const [newItemModal, setNewItemModal] = useState(null); // index of row being edited
  const [newItemData, setNewItemData] = useState(emptyItem);
  const [descSearch, setDescSearch] = useState({});

  const updateRow = (i, field, value) => {
    const updated = items.map((row, idx) => idx === i ? { ...row, [field]: value } : row);
    onChange(updated);
  };

  const addRow = () => onChange([...items, { id: Date.now(), description: '', hsn: '', gstRate: 18, nos: '', qty: '', rate: '', unit: 'Kg' }]);

  const deleteRow = (i) => onChange(items.filter((_, idx) => idx !== i));

  const duplicateRow = (i) => {
    const copy = { ...items[i], id: Date.now() };
    const updated = [...items];
    updated.splice(i + 1, 0, copy);
    onChange(updated);
  };

  const selectSavedItem = (i, saved) => {
    updateRow(i, 'description', saved.description);
    const updated = items.map((row, idx) => idx === i
      ? { ...row, description: saved.description, hsn: saved.hsn, gstRate: saved.gstRate, unit: saved.unit, rate: saved.defaultRate || row.rate }
      : row
    );
    onChange(updated);
    setDescSearch(p => ({ ...p, [i]: '' }));
  };

  const saveNewItem = (i) => {
    const item = { ...newItemData, id: Date.now().toString() };
    saveItem(item);
    const updated = items.map((row, idx) => idx === i
      ? { ...row, description: item.description, hsn: item.hsn, gstRate: item.gstRate, unit: item.unit, rate: item.defaultRate || row.rate }
      : row
    );
    onChange(updated);
    setNewItemModal(null);
    setNewItemData(emptyItem);
  };

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-blue-800 text-white">
              <th className="px-1 py-1.5 text-left w-6">#</th>
              <th className="px-1 py-1.5 text-left min-w-[140px]">Description</th>
              <th className="px-1 py-1.5 text-left w-16">HSN</th>
              <th className="px-1 py-1.5 text-left w-12">GST%</th>
              <th className="px-1 py-1.5 text-left w-12">Nos</th>
              <th className="px-1 py-1.5 text-left w-16">Qty</th>
              <th className="px-1 py-1.5 text-left w-16">Rate</th>
              <th className="px-1 py-1.5 text-left w-10">Unit</th>
              <th className="px-1 py-1.5 text-right w-20">Amount</th>
              <th className="px-1 py-1.5 w-16">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const amt = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
              const suggestions = savedItems.filter(s =>
                s.description.toLowerCase().includes((descSearch[i] || item.description || '').toLowerCase())
              );
              return (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-1 py-1 text-center text-gray-500">{i + 1}</td>
                  <td className="px-1 py-1 relative">
                    <input
                      className="w-full border border-gray-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                      value={item.description}
                      onChange={e => { updateRow(i, 'description', e.target.value); setDescSearch(p => ({ ...p, [i]: e.target.value })); }}
                      placeholder="Search or type..."
                    />
                    {descSearch[i] && suggestions.length > 0 && (
                      <ul className="absolute z-50 left-0 top-full w-56 bg-white border border-gray-200 rounded shadow-lg max-h-36 overflow-y-auto">
                        {suggestions.map(s => (
                          <li key={s.id} className="px-2 py-1 hover:bg-blue-50 cursor-pointer text-xs"
                            onMouseDown={() => selectSavedItem(i, s)}>
                            <div className="font-medium">{s.description}</div>
                            <div className="text-gray-400">HSN: {s.hsn} | {s.gstRate}%</div>
                          </li>
                        ))}
                        <li className="px-2 py-1 text-blue-600 hover:bg-blue-50 cursor-pointer text-xs border-t"
                          onMouseDown={() => { setNewItemModal(i); setNewItemData({ ...emptyItem, description: descSearch[i] }); setDescSearch(p => ({ ...p, [i]: '' })); }}>
                          + Save as new item
                        </li>
                      </ul>
                    )}
                  </td>
                  <td className="px-1 py-1">
                    <input className="w-full border border-gray-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                      value={item.hsn} onChange={e => updateRow(i, 'hsn', e.target.value)} />
                  </td>
                  <td className="px-1 py-1">
                    <input type="number" className="w-full border border-gray-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                      value={item.gstRate} onChange={e => updateRow(i, 'gstRate', e.target.value)} />
                  </td>
                  <td className="px-1 py-1">
                    <input type="number" className="w-full border border-gray-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                      value={item.nos} onChange={e => updateRow(i, 'nos', e.target.value)} />
                  </td>
                  <td className="px-1 py-1">
                    <input type="number" className="w-full border border-gray-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                      value={item.qty} onChange={e => updateRow(i, 'qty', e.target.value)} />
                  </td>
                  <td className="px-1 py-1">
                    <input type="number" className="w-full border border-gray-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                      value={item.rate} onChange={e => updateRow(i, 'rate', e.target.value)} />
                  </td>
                  <td className="px-1 py-1">
                    <input className="w-full border border-gray-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                      value={item.unit} onChange={e => updateRow(i, 'unit', e.target.value)} />
                  </td>
                  <td className="px-1 py-1 text-right font-medium">{formatINR(amt)}</td>
                  <td className="px-1 py-1">
                    <div className="flex gap-0.5 justify-center">
                      <button onClick={() => duplicateRow(i)} className="text-blue-500 hover:text-blue-700 px-1" title="Duplicate">⧉</button>
                      <button onClick={() => deleteRow(i)} className="text-red-400 hover:text-red-600 px-1" title="Delete">✕</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button onClick={addRow}
        className="text-sm text-blue-600 border border-blue-300 rounded px-3 py-1 hover:bg-blue-50">
        + Add Item
      </button>

      {/* New Item Modal */}
      {newItemModal !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-5 w-80 space-y-3">
            <h3 className="font-semibold text-gray-800">Save New Item</h3>
            {[['description', 'Description'], ['hsn', 'HSN Code'], ['unit', 'Unit']].map(([k, lbl]) => (
              <div key={k}>
                <label className="block text-xs text-gray-500 mb-0.5">{lbl}</label>
                <input className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={newItemData[k]} onChange={e => setNewItemData(p => ({ ...p, [k]: e.target.value }))} />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">GST Rate %</label>
                <input type="number" className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={newItemData.gstRate} onChange={e => setNewItemData(p => ({ ...p, gstRate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Default Rate</label>
                <input type="number" className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={newItemData.defaultRate} onChange={e => setNewItemData(p => ({ ...p, defaultRate: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => saveNewItem(newItemModal)}
                className="flex-1 bg-blue-600 text-white text-sm py-1.5 rounded hover:bg-blue-700">Save</button>
              <button onClick={() => setNewItemModal(null)}
                className="flex-1 border border-gray-300 text-sm py-1.5 rounded hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
