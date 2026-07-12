import { slugify } from '../utils/slugify.js';

describe('Slugify Utility', () => {
  it('should convert strings to lowercase and replace spaces with hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('  Hello World  ')).toBe('hello-world');
    expect(slugify('Zero Waste Week!')).toBe('zero-waste-week');
    expect(slugify('COMMUTE-factor-2024')).toBe('commute-factor-2024');
    expect(slugify(null)).toBe('');
  });
});
