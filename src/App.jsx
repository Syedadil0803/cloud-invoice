import { useState, useEffect, useMemo } from 'react';
import HeaderForm from './components/HeaderForm';
import BuyerForm from './components/BuyerForm';
import ItemsTable from './components/ItemsTable';
import TaxSummary from './components/TaxSummary';
import BalanceForm from './components/BalanceForm';
import SettingsForm from './components/SettingsForm';
import InvoicePreview from './components/InvoicePreview';
import { generatePDF } from './utils/pdfGenerator';
import { getSettings, saveSettings, getBuyers, getItems, getVehicles, saveVehicle, saveDraft, loadDraft } from './utils/storage';
import { computeTotals, isIntraState } from './utils/calculations';

const today = () => new Date().toISOString().split('T')[0];

function makeDefaultState(settings) {
  const num = (settings.lastInvoiceNumber || 1239) + 1;
  return {
    header: {
      invoiceNo: `${settings.invoicePrefix || 'SUFI/25-26/'}${num}`,
      invoiceDate: today(),
      deliveryNoteNo: '',
      deliveryNoteDate: '',
      referenceNo: '',
      buyerOrderNo: '',
      paymentTerms: 'Credit 30 Days',
      dispatchedThrough: '',
      destination: '',
      vehicleNo: '',
      ewayBillNo: '',
      irn: '',
      ackNo: '',
      ackDate: '',
      approxDistance: '',
      validUpto: '',
      transporterId: '',
      transporterName: '',
      transportDocNo: '',
      transportDocDate: '',
      cewbNo: '',
    },
    buyer: null,
    shipTo: null,
    items: [{ id: 1, description: '', hsn: '', gstRate: 18, nos: '', qty: '', rate: '', unit: 'Kg' }],
    loading: { enabled: false, pct: '0.50' },
    balance: { prevBalance: '', remarks: '' },
  };
}

const SECTIONS = ['Header Info', 'Buyer / Consignee', 'Line Items', 'Tax & Charges', 'Balance', 'Settings'];

export default function App() {
  const [settings, setSettings] = useState(getSettings);
  const [form, setForm] = useState(() => makeDefaultState(getSettings()));
  const [buyers, setBuyers] = useState(getBuyers);
  const [savedItems, setSavedItems] = useState(getItems);
  const [vehicles, setVehicles] = useState(getVehicles);
  const [openSection, setOpenSection] = useState('Header Info');
  const [generating, setGenerating] = useState(false);

  // Refresh localStorage lists when items/buyers saved
  const refreshLists = () => {
    setBuyers(getBuyers());
    setSavedItems(getItems());
    setVehicles(getVehicles());
  };

  const intra = useMemo(() =>
    isIntraState(settings.seller.stateCode, form.buyer?.gstin),
    [settings.seller.stateCode, form.buyer?.gstin]
  );

  const totals = useMemo(() =>
    computeTotals(form.items, form.loading.enabled, form.loading.pct, '996719', intra),
    [form.items, form.loading.enabled, form.loading.pct, intra]
  );

  const handleNewInvoice = () => {
    const s = getSettings();
    setForm(makeDefaultState(s));
  };

  const handleLoadDraft = () => {
    const draft = loadDraft();
    if (draft) setForm(draft);
    else alert('No draft found.');
  };

  const handleSaveDraft = () => {
    saveDraft(form);
    alert('Draft saved.');
  };

  const handleGeneratePDF = async () => {
    if (!form.buyer?.name) { alert('Please select a buyer first.'); return; }
    if (!form.items.some(i => i.description)) { alert('Please add at least one item.'); return; }
    setGenerating(true);
    try {
      // Save vehicle if new
      if (form.header.vehicleNo) saveVehicle(form.header.vehicleNo);
      // Bump invoice number
      const newNum = (settings.lastInvoiceNumber || 1239) + 1;
      const updated = { ...settings, lastInvoiceNumber: newNum };
      saveSettings(updated);
      setSettings(updated);
      refreshLists();
      generatePDF({
        seller: settings.seller,
        buyer: form.buyer,
        shipTo: form.shipTo,
        header: form.header,
        items: form.items,
        loading: form.loading,
        balance: form.balance,
      });
    } catch (e) {
      console.error(e);
      alert('PDF generation failed: ' + e.message);
    }
    setGenerating(false);
  };

  const setHeader = (h) => setForm(f => ({ ...f, header: h }));
  const setBuyer = (b) => { setForm(f => ({ ...f, buyer: b })); refreshLists(); };
  const setShipTo = (s) => setForm(f => ({ ...f, shipTo: s }));
  const setItems = (items) => setForm(f => ({ ...f, items }));
  const setLoading = (l) => setForm(f => ({ ...f, loading: l }));
  const setBalance = (b) => setForm(f => ({ ...f, balance: b }));

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* Top bar */}
      <div className="bg-blue-900 text-white px-4 py-2 flex items-center gap-3 shadow-md shrink-0">
        <div className="font-bold text-lg tracking-tight">Cloud Invoice</div>
        <div className="flex-1" />
        <button onClick={handleNewInvoice}
          className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition">
          New Invoice
        </button>
        <button onClick={handleLoadDraft}
          className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition">
          Load Draft
        </button>
        <button onClick={handleSaveDraft}
          className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition">
          Save Draft
        </button>
        <button onClick={handleGeneratePDF} disabled={generating}
          className="text-sm bg-green-500 hover:bg-green-400 disabled:opacity-50 px-4 py-1.5 rounded font-semibold transition">
          {generating ? 'Generating...' : '⬇ Generate PDF'}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — form */}
        <div className="w-[420px] shrink-0 overflow-y-auto bg-white border-r border-gray-200 p-3 space-y-2">
          {SECTIONS.map(section => (
            <div key={section} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                className={`w-full text-left px-3 py-2 text-sm font-semibold flex justify-between items-center transition
                  ${openSection === section ? 'bg-blue-800 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setOpenSection(openSection === section ? null : section)}
              >
                <span>{section}</span>
                <span className="text-xs">{openSection === section ? '▲' : '▼'}</span>
              </button>
              {openSection === section && (
                <div className="p-3">
                  {section === 'Header Info' && (
                    <HeaderForm header={form.header} onChange={setHeader} vehicles={vehicles} />
                  )}
                  {section === 'Buyer / Consignee' && (
                    <BuyerForm
                      buyer={form.buyer}
                      shipTo={form.shipTo}
                      onChange={setBuyer}
                      onShipToChange={setShipTo}
                      buyers={buyers}
                    />
                  )}
                  {section === 'Line Items' && (
                    <ItemsTable items={form.items} onChange={setItems} savedItems={savedItems} />
                  )}
                  {section === 'Tax & Charges' && (
                    <TaxSummary
                      totals={totals}
                      intra={intra}
                      loading={{
                        enabled: form.loading.enabled,
                        pct: form.loading.pct,
                        onToggle: (v) => setLoading({ ...form.loading, enabled: v }),
                        onPctChange: (v) => setLoading({ ...form.loading, pct: v }),
                      }}
                    />
                  )}
                  {section === 'Balance' && (
                    <BalanceForm balance={form.balance} onChange={setBalance} grandTotal={totals.grandTotal} />
                  )}
                  {section === 'Settings' && (
                    <SettingsForm settings={settings} onUpdate={setSettings} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right panel — live preview */}
        <div className="flex-1 overflow-auto bg-gray-300 p-4">
          <div className="text-xs text-gray-500 mb-2 text-center">
            Live Preview — {intra ? '🟢 Intra-State (CGST + SGST)' : '🔵 Inter-State (IGST)'}
          </div>
          <div style={{ transform: 'scale(0.72)', transformOrigin: 'top center' }}>
            <InvoicePreview
              seller={settings.seller}
              buyer={form.buyer}
              shipTo={form.shipTo}
              header={form.header}
              items={form.items}
              loading={form.loading}
              balance={form.balance}
              totals={totals}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
