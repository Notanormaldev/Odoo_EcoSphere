import { isValidEmail, isValidObjectId, isStrongPassword } from '../utils/validators.js';

describe('Format Validators Helper', () => {
  it('should validate email addresses correctly', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
  });

  it('should validate MongoDB ObjectId formats correctly', () => {
    expect(isValidObjectId('60c72b2f9b1d8e1f8c8d8f9a')).toBe(true);
    expect(isValidObjectId('invalid-id')).toBe(false);
  });

  it('should validate strong password requirements correctly', () => {
    expect(isStrongPassword('Password123')).toBe(true);
    expect(isStrongPassword('weak')).toBe(false);
  });
});
