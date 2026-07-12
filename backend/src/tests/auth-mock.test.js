import bcrypt from 'bcryptjs';

describe('User Model Hashing & Password Comparison', () => {
  it('should hash a password and verify it correctly using bcrypt', async () => {
    const rawPassword = 'password123';
    const hash = await bcrypt.hash(rawPassword, 12);

    expect(hash).not.toBe(rawPassword);
    
    const isValid = await bcrypt.compare(rawPassword, hash);
    expect(isValid).toBe(true);

    const isInvalid = await bcrypt.compare('wrongpassword', hash);
    expect(isInvalid).toBe(false);
  });
});
