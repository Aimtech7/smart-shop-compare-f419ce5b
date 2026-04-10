/**
 * Auto-generates a product code based on category, make, type, model, and specs.
 *
 * Format: {CAT}-{MAKE}-{TYPE}-{MODEL}-{SPECS}-{SEQ}
 * Example: ELEC-SAM-PHN-S24U-R8I5-001
 */

const CATEGORY_PREFIX: Record<string, string> = {
  'Electronics': 'ELEC',
  'Fashion': 'FASH',
  'Home & Garden': 'HOME',
  'Sports': 'SPRT',
  'Beauty': 'BEAU',
  'Audio': 'AUDI',
  'Toys & Games': 'TOYS',
  'Accessories': 'ACCS',
  'Automotive': 'AUTO',
};

const MAKE_PREFIX: Record<string, string> = {
  'Samsung': 'SAM',
  'Apple': 'APL',
  'Sony': 'SNY',
  'Nike': 'NKE',
  'Adidas': 'ADD',
  'LG': 'LG',
  'HP': 'HP',
  'Dell': 'DEL',
  'Lenovo': 'LNV',
  'Bose': 'BSE',
  'Dyson': 'DYS',
  'JBL': 'JBL',
  'Canon': 'CAN',
  'Xiaomi': 'XIA',
  'Huawei': 'HUA',
  'Google': 'GOO',
  'Microsoft': 'MSF',
  'Asus': 'ASU',
  'Acer': 'ACR',
};

const TYPE_PREFIX: Record<string, string> = {
  'Phone': 'PHN',
  'Laptop': 'LPT',
  'Tablet': 'TBL',
  'TV': 'TV',
  'Headphones': 'HDP',
  'Speaker': 'SPK',
  'Camera': 'CAM',
  'Watch': 'WCH',
  'Shirt': 'SHT',
  'Shoes': 'SHO',
  'Dress': 'DRS',
  'Jacket': 'JKT',
  'Pants': 'PNT',
  'Furniture': 'FRN',
  'Appliance': 'APP',
  'Supplement': 'SUP',
  'Skincare': 'SKC',
  'Makeup': 'MKP',
  'Console': 'CON',
  'Toy': 'TOY',
};

/** Abbreviate a string to up to N uppercase chars */
function abbreviate(str: string, maxLen = 4): string {
  if (!str) return 'GEN';
  const cleaned = str.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return cleaned.slice(0, maxLen) || 'GEN';
}

/** Parse specs string into a short code */
function encodeSpecs(specs: string): string {
  if (!specs) return '';
  const codes: string[] = [];

  // RAM
  const ramMatch = specs.match(/(\d+)\s*GB?\s*RAM/i);
  if (ramMatch) codes.push(`R${ramMatch[1]}`);

  // Processor
  const procMatch = specs.match(/core\s*i(\d)/i) || specs.match(/i(\d)[-\s]/i);
  if (procMatch) codes.push(`I${procMatch[1]}`);

  const ryzenMatch = specs.match(/ryzen\s*(\d)/i);
  if (ryzenMatch) codes.push(`RZ${ryzenMatch[1]}`);

  const m_match = specs.match(/\bM(\d)\b/i);
  if (m_match) codes.push(`M${m_match[1]}`);

  // Storage
  const storMatch = specs.match(/(\d+)\s*(?:GB|TB)\s*(?:SSD|HDD|Storage|ROM)/i);
  if (storMatch) {
    const isT = /TB/i.test(specs);
    codes.push(`S${storMatch[1]}${isT ? 'T' : 'G'}`);
  }

  // Screen size
  const scrMatch = specs.match(/(\d+\.?\d*)\s*(?:inch|")/i);
  if (scrMatch) codes.push(`D${scrMatch[1].replace('.', '')}`);

  // Color
  const colorMatch = specs.match(/\b(Black|White|Silver|Gold|Blue|Red|Green|Pink|Gray|Grey)\b/i);
  if (colorMatch) codes.push(colorMatch[1].slice(0, 2).toUpperCase());

  // Size (clothing)
  const sizeMatch = specs.match(/\b(XS|S|M|L|XL|XXL|XXXL|\d+)\b/i);
  if (sizeMatch && !ramMatch && !storMatch) codes.push(sizeMatch[1].toUpperCase());

  return codes.join('') || '';
}

let counter = 0;

export function generateProductCode(params: {
  category: string;
  make: string;
  type: string;
  model: string;
  specs?: string;
}): string {
  const { category, make, type, model, specs } = params;

  const catCode = CATEGORY_PREFIX[category] || abbreviate(category, 4);
  const makeCode = MAKE_PREFIX[make] || abbreviate(make, 3);
  const typeCode = TYPE_PREFIX[type] || abbreviate(type, 3);
  const modelCode = abbreviate(model, 4);
  const specCode = encodeSpecs(specs || '');

  counter++;
  const seq = String(counter).padStart(3, '0');

  const parts = [catCode, makeCode, typeCode, modelCode];
  if (specCode) parts.push(specCode);
  parts.push(seq);

  return parts.join('-');
}

export function resetCodeCounter() {
  counter = 0;
}

export const CATEGORIES = Object.keys(CATEGORY_PREFIX);
export const MAKES = Object.keys(MAKE_PREFIX);
export const TYPES = Object.keys(TYPE_PREFIX);
