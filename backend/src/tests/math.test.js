import { safeDivide, calculatePercentage } from '../utils/math.js';

describe('Math Helper Utility', () => {
  it('should safely divide two numbers and prevent division by zero', () => {
    expect(safeDivide(10, 2)).toBe(5);
    expect(safeDivide(10, 0)).toBe(0);
    expect(safeDivide(0, 10)).toBe(0);
  });

  it('should correctly calculate percentages bounded between 0 and 100', () => {
    expect(calculatePercentage(50, 100)).toBe(50);
    expect(calculatePercentage(150, 100)).toBe(100);
    expect(calculatePercentage(-10, 100)).toBe(0);
    expect(calculatePercentage(5, 0)).toBe(0);
  });
});
