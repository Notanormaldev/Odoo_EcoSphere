import { config } from '../config/env.js';

export const logger = {
  info: (message, ...args) => {
    if (config.nodeEnv !== 'test') {
      console.log(`[INFO] ${new Date().toISOString()}: ${message}`, ...args);
    }
  },
  error: (message, error, ...args) => {
    if (config.nodeEnv !== 'test') {
      console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error, ...args);
    }
  },
  warn: (message, ...args) => {
    if (config.nodeEnv !== 'test') {
      console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, ...args);
    }
  },
  debug: (message, ...args) => {
    if (config.nodeEnv === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()}: ${message}`, ...args);
    }
  }
};
