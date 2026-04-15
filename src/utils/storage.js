// localStorage helpers
export const KEYS = {
  BUYERS: 'sufi_buyers',
  ITEMS: 'sufi_items',
  VEHICLES: 'sufi_vehicles',
  SETTINGS: 'sufi_settings',
  DRAFTS: 'sufi_drafts',
};

export const DEFAULT_SELLER = {
  name: 'Sufi Structural Tubes Pvt. Ltd (2025-26)',
  address: 'SN. 1/249, Aautade Handewadi, Opp. Mayuri Weigh Bridge, Tal. Haveli Dist. Pune 412308',
  state: 'Maharashtra',
  stateCode: '27',
  gstin: '27AALCS0191A1ZL',
  udyam: 'UDYAM-MH-26-0035883 (Medium)',
  cin: 'U27107PN2007PTC130456',
  pan: 'AALCS0191A',
  email: 'sufistpl@gmail.com / ahmed.c@sufigroup.co',
  bank: 'ICICI Bank CC',
  accountNo: '091551000010',
  ifsc: 'ICIC0000915',
  branch: 'Viman Nagar - Pune',
};

export const DEFAULT_SETTINGS = {
  seller: DEFAULT_SELLER,
  lastInvoiceNumber: 1239,
  invoicePrefix: 'SUFI/25-26/',
};

export function getSettings() {
  try {
    const s = localStorage.getItem(KEYS.SETTINGS);
    return s ? { ...DEFAULT_SETTINGS, ...JSON.parse(s) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

export function saveSettings(settings) {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export function getBuyers() {
  try { return JSON.parse(localStorage.getItem(KEYS.BUYERS)) || []; }
  catch { return []; }
}

export function saveBuyer(buyer) {
  const buyers = getBuyers();
  const idx = buyers.findIndex(b => b.id === buyer.id);
  if (idx >= 0) buyers[idx] = buyer;
  else buyers.push({ ...buyer, id: buyer.id || Date.now().toString() });
  localStorage.setItem(KEYS.BUYERS, JSON.stringify(buyers));
}

export function getItems() {
  try { return JSON.parse(localStorage.getItem(KEYS.ITEMS)) || []; }
  catch { return []; }
}

export function saveItem(item) {
  const items = getItems();
  const idx = items.findIndex(i => i.id === item.id);
  if (idx >= 0) items[idx] = item;
  else items.push({ ...item, id: item.id || Date.now().toString() });
  localStorage.setItem(KEYS.ITEMS, JSON.stringify(items));
}

export function getVehicles() {
  try { return JSON.parse(localStorage.getItem(KEYS.VEHICLES)) || []; }
  catch { return []; }
}

export function saveVehicle(vehicleNo) {
  if (!vehicleNo) return;
  const vehicles = getVehicles();
  if (!vehicles.find(v => v.vehicleNo === vehicleNo)) {
    vehicles.push({ vehicleNo, from: 'PUNE' });
    localStorage.setItem(KEYS.VEHICLES, JSON.stringify(vehicles));
  }
}

export function saveDraft(draft) {
  localStorage.setItem(KEYS.DRAFTS, JSON.stringify(draft));
}

export function loadDraft() {
  try { return JSON.parse(localStorage.getItem(KEYS.DRAFTS)); }
  catch { return null; }
}
