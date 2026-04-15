import { saveSettings } from '../utils/storage';

export default function SettingsForm({ settings, onUpdate }) {
  const setSeller = (k, v) => {
    const updated = { ...settings, seller: { ...settings.seller, [k]: v } };
    onUpdate(updated);
    saveSettings(updated);
  };

  const setPrefix = (v) => {
    const updated = { ...settings, invoicePrefix: v };
    onUpdate(updated);
    saveSettings(updated);
  };

  const fields = [
    ['name', 'Company Name'],
    ['address', 'Address'],
    ['state', 'State'],
    ['stateCode', 'State Code'],
    ['gstin', 'GSTIN'],
    ['pan', 'PAN'],
    ['udyam', 'UDYAM No.'],
    ['cin', 'CIN'],
    ['email', 'Email'],
    ['bank', 'Bank Name'],
    ['accountNo', 'Account No.'],
    ['ifsc', 'IFSC Code'],
    ['branch', 'Branch'],
  ];

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-500 mb-0.5">Invoice Prefix</label>
        <input className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={settings.invoicePrefix}
          onChange={e => setPrefix(e.target.value)} />
      </div>
      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Seller Details</div>
      <div className="grid grid-cols-2 gap-2">
        {fields.map(([k, lbl]) => (
          <div key={k} className={k === 'name' || k === 'address' ? 'col-span-2' : ''}>
            <label className="block text-xs text-gray-500 mb-0.5">{lbl}</label>
            <input className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={settings.seller[k] || ''}
              onChange={e => setSeller(k, e.target.value)} />
          </div>
        ))}
      </div>
    </div>
  );
}
