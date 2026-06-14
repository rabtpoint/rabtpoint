const ALIASES = {
  britain: 'United Kingdom',
  uk: 'United Kingdom',
  england: 'United Kingdom',
  scotland: 'United Kingdom',
  wales: 'United Kingdom',
  'united kingdom': 'United Kingdom',
  america: 'United States',
  usa: 'United States',
  us: 'United States',
  'united states': 'United States',
  uae: 'United Arab Emirates',
  dubai: 'United Arab Emirates'
};

const DISPLAY_NAMES = {
  'United Kingdom': 'Britain',
  'United States': 'America',
  India: 'India',
  'United Arab Emirates': 'UAE'
};

export const normalizeCountry = (input = '', fallback = '') => {
  const raw = String(input).trim();
  if (!raw) return fallback || '';

  const stripped = raw.replace(/^trend\s+in\s+/i, '').trim();
  const key = stripped.toLowerCase();

  if (ALIASES[key]) return ALIASES[key];

  const aliasMatch = Object.entries(ALIASES).find(([alias]) => key.includes(alias));
  if (aliasMatch) return aliasMatch[1];

  return stripped
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

export const countryDisplayLabel = (country = '') => DISPLAY_NAMES[country] || country;

export const trendLabelForCountry = (country = '') => {
  const label = countryDisplayLabel(country);
  return label ? `Trend in ${label}` : 'Trend in Britain';
};

export const countryMatchRegex = (country = '') => {
  const normalized = normalizeCountry(country);
  const variants = new Set([normalized]);

  Object.entries(ALIASES).forEach(([alias, value]) => {
    if (value === normalized) variants.add(alias);
  });

  Object.entries(DISPLAY_NAMES).forEach(([canonical, display]) => {
    if (canonical === normalized) variants.add(display);
  });

  const pattern = [...variants]
    .filter(Boolean)
    .map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');

  return new RegExp(`^(${pattern})$`, 'i');
};
