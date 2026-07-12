import { calculateCO2Equivalent, getDefaultEmissionFactor } from '../utils/co2Calculator.js';

describe('CO2 Calculator Utility', () => {
  it('should correctly calculate CO2 equivalents', () => {
    expect(calculateCO2Equivalent(100, 0.5)).toBe(50);
    expect(calculateCO2Equivalent(0, 0.5)).toBe(0);
    expect(calculateCO2Equivalent(100, 0)).toBe(0);
    expect(calculateCO2Equivalent(10.25, 2.5)).toBe(25.625);
  });

  it('should return default factors for common fuel types', () => {
    expect(getDefaultEmissionFactor('Electricity')).toBe(0.85);
    expect(getDefaultEmissionFactor('Diesel')).toBe(2.68);
    expect(getDefaultEmissionFactor('NonExistentFuel')).toBe(1.0);
  });
});
