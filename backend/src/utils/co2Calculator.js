/**
 * Utility to calculate CO2 equivalent based on quantity and factor
 * @param {number} quantity 
 * @param {number} factor 
 * @returns {number}
 */
export const calculateCO2Equivalent = (quantity, factor) => {
  if (!quantity || !factor) return 0;
  return Number((quantity * factor).toFixed(3));
};

/**
 * Map fuel types to default emission factors if not set in DB
 * @param {string} type 
 * @returns {number}
 */
export const getDefaultEmissionFactor = (type) => {
  const factors = {
    Electricity: 0.85, // kg CO2e / kWh
    'Natural Gas': 2.02, // kg CO2e / m3
    Petrol: 2.31, // kg CO2e / liter
    Diesel: 2.68, // kg CO2e / liter
    Flight: 0.15, // kg CO2e / km
    Water: 0.34, // kg CO2e / m3
    Waste: 0.45, // kg CO2e / kg
  };
  return factors[type] || 1.0;
};
