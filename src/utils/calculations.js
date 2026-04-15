// Tax and amount calculations

export function calcLineAmount(qty, rate) {
  return Math.round((parseFloat(qty) || 0) * (parseFloat(rate) || 0) * 100) / 100;
}

export function calcLoadingAmount(subtotal, pct) {
  return Math.round((parseFloat(subtotal) || 0) * (parseFloat(pct) || 0) / 100 * 100) / 100;
}

// Determine if intra-state: compare seller stateCode with buyer stateCode
export function isIntraState(sellerStateCode, buyerGstin) {
  if (!buyerGstin || buyerGstin.length < 2) return true;
  return buyerGstin.substring(0, 2) === String(sellerStateCode);
}

// Group items by HSN and compute tax
export function computeTaxBreakup(items, loadingAmt, loadingHsn = '996719', loadingGstRate = 18, intra = true) {
  const groups = {};

  items.forEach(item => {
    const hsn = item.hsn || 'N/A';
    const rate = parseFloat(item.gstRate) || 0;
    const amt = calcLineAmount(item.qty, item.rate);
    if (!groups[hsn]) groups[hsn] = { hsn, gstRate: rate, taxable: 0 };
    groups[hsn].taxable += amt;
  });

  // Loading charges
  if (loadingAmt > 0) {
    const hsn = loadingHsn;
    if (!groups[hsn]) groups[hsn] = { hsn, gstRate: loadingGstRate, taxable: 0 };
    groups[hsn].taxable += loadingAmt;
  }

  return Object.values(groups).map(g => {
    const taxable = Math.round(g.taxable * 100) / 100;
    if (intra) {
      const cgst = Math.round(taxable * (g.gstRate / 2) / 100 * 100) / 100;
      const sgst = cgst;
      return { ...g, taxable, cgstRate: g.gstRate / 2, cgst, sgstRate: g.gstRate / 2, sgst, igst: 0, totalTax: cgst + sgst };
    } else {
      const igst = Math.round(taxable * g.gstRate / 100 * 100) / 100;
      return { ...g, taxable, cgstRate: 0, cgst: 0, sgstRate: 0, sgst: 0, igstRate: g.gstRate, igst, totalTax: igst };
    }
  });
}

export function computeTotals(items, loadingEnabled, loadingPct, loadingHsn, intra) {
  const subtotal = items.reduce((s, i) => s + calcLineAmount(i.qty, i.rate), 0);
  const loadingAmt = loadingEnabled ? calcLoadingAmount(subtotal, loadingPct) : 0;
  const taxBreakup = computeTaxBreakup(items, loadingAmt, loadingHsn, 18, intra);
  const totalTax = taxBreakup.reduce((s, g) => s + g.totalTax, 0);
  const grandTotal = Math.round(subtotal + loadingAmt + totalTax);
  const totalQty = items.reduce((s, i) => s + (parseFloat(i.qty) || 0), 0);
  const totalNos = items.reduce((s, i) => s + (parseFloat(i.nos) || 0), 0);
  return { subtotal, loadingAmt, taxBreakup, totalTax, grandTotal, totalQty, totalNos };
}

// Indian number formatting
export function formatINR(n) {
  if (n === undefined || n === null || isNaN(n)) return '0.00';
  const [int, dec] = Math.abs(n).toFixed(2).split('.');
  const lastThree = int.slice(-3);
  const rest = int.slice(0, -3);
  const formatted = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree : lastThree;
  return (n < 0 ? '-' : '') + formatted + '.' + dec;
}

// Amount in words (Indian system)
const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function numToWords(n) {
  if (n === 0) return '';
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numToWords(n % 100) : '');
}

export function amountInWords(amount) {
  const n = Math.round(amount);
  if (n === 0) return 'INR Zero Only';
  let rem = n;
  const crore = Math.floor(rem / 10000000); rem %= 10000000;
  const lakh = Math.floor(rem / 100000); rem %= 100000;
  const thousand = Math.floor(rem / 1000); rem %= 1000;
  const rest = rem;
  let words = 'INR ';
  if (crore) words += numToWords(crore) + ' Crore ';
  if (lakh) words += numToWords(lakh) + ' Lakh ';
  if (thousand) words += numToWords(thousand) + ' Thousand ';
  if (rest) words += numToWords(rest);
  return words.trim() + ' Only';
}
