import jwt from 'jsonwebtoken';
import { generateTokens } from '../utils/tokenGenerator.js';

describe('Token Generator Utility', () => {
  it('should correctly generate access and refresh tokens containing the user ID', () => {
    const userId = 'user123_test';
    const { accessToken, refreshToken } = generateTokens(userId);

    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();

    // Verify token content matches user ID
    const decodedAccess = jwt.decode(accessToken);
    const decodedRefresh = jwt.decode(refreshToken);

    expect(decodedAccess.id).toBe(userId);
    expect(decodedRefresh.id).toBe(userId);
  });
});
