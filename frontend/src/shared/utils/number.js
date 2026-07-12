/**
 * Format numbers with comma separation and optional decimal points
 * @param {number} num 
 * @param {number} decimals 
 * @returns {string}
 */
export const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined) return '—';
  return Number(num).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Format co2 value to appropriate unit
 * @param {number} valueInKg 
 * @returns {string}
 */
export const formatCO2 = (valueInKg) => {
  if (valueInKg === null || valueInKg === undefined) return '—';
  if (valueInKg >= 1000) {
    return `${formatNumber(valueInKg / 1000, 1)} t`;
  }
  return `${formatNumber(valueInKg, 0)} kg`;
};
