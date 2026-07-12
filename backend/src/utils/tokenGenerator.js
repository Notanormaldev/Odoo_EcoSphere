import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * Generate Access and Refresh JWT Tokens
 * @param {string} userId 
 * @returns {object}
 */
export const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
  const refreshToken = jwt.sign({ id: userId }, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
  });
  return { accessToken, refreshToken };
};
