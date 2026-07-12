/**
 * Safe division utility to prevent division by zero
 * @param {number} numerator 
 * @param {number} denominator 
 * @returns {number}
 */
export const safeDivide = (numerator, denominator) => {
  if (!denominator) return 0;
  return Number(numerator) / Number(denominator);
};

/**
 * Calculate percentage
 * @param {number} value 
 * @param {number} total 
 * @returns {number}
 */
export const calculatePercentage = (value, total) => {
  return Math.min(100, Math.max(0, safeDivide(value, total) * 100));
};
