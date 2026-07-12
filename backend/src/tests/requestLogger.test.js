import { jest } from '@jest/globals';
import { requestLogger } from '../middleware/requestLogger.js';

describe('Request Logger Middleware', () => {
  it('should call next() and attach event listener on res finish', () => {
    const req = { method: 'GET', originalUrl: '/api/health' };
    const res = {
      statusCode: 200,
      on: jest.fn((event, callback) => {
        expect(event).toBe('finish');
        expect(typeof callback).toBe('function');
      })
    };
    const next = jest.fn();

    requestLogger(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.on).toHaveBeenCalled();
  });
});
