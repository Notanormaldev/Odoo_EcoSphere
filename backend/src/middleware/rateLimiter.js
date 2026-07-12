import rateLimit from 'express-rate-limit';

export const createLimiter = (maxRequests, windowMinutes = 15) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: `Too many requests. Please wait ${windowMinutes} minutes and try again.`
    }
  });
};
