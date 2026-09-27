/**
 * Utility formatters for the UI.
 */

/** Format a number with commas and fixed decimals */
export function formatNumber(n, decimals = 1) {
  if (n == null || isNaN(n)) return '—';
  return n.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Format tonnes per month */
export function formatTpm(n) {
  return `${formatNumber(n, 0)} t/mo`;
}

/** Format currency (INR-style) */
export function formatCurrency(n) {
  if (n == null || isNaN(n)) return '—';
  const prefix = n < 0 ? '−₹' : '₹';
  return `${prefix}${formatNumber(Math.abs(n), 0)}`;
}

/** Format CO2 equivalent */
export function formatCo2(n) {
  if (n == null || isNaN(n)) return '—';
  return `${formatNumber(n, 2)} tCO₂e`;
}

/**
 * Default composition presets per waste type.
 * These are typical ranges — user can edit from here.
 */
export const COMPOSITION_PRESETS = {
  flyash: { SiO2: 52, Al2O3: 26, Fe2O3: 8, CaO: 9, Other: 5 },
  slag: { SiO2: 35, Al2O3: 12, Fe2O3: 1, CaO: 40, Other: 12 },
  tailings: { SiO2: 60, Al2O3: 15, Fe2O3: 10, CaO: 5, Other: 10 },
};

/** Default moisture presets per waste type */
export const MOISTURE_PRESETS = {
  flyash: 12,
  slag: 5,
  tailings: 18,
};

/** Preset site locations */
export const SITE_PRESETS = [
  { label: 'NTPC Ramagundam (Telangana)', lat: 18.76, lng: 79.45 },
  { label: 'Tata Steel Jamshedpur (Jharkhand)', lat: 22.80, lng: 86.20 },
  { label: 'Vedanta Lanjigarh (Odisha)', lat: 19.70, lng: 83.38 },
  { label: 'JSW Bellary (Karnataka)', lat: 15.14, lng: 76.92 },
];
