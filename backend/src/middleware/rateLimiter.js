import rateLimit from 'express-rate-limit';

/**
 * Generic factory: create a rate limiter with a given cap and window.
 * @param {number} maxRequests   - Max requests per window
 * @param {number} windowMinutes - Window size in minutes (default 15)
 */
export const createLimiter = (maxRequests, windowMinutes = 15) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,   // Return RateLimit-* headers (RFC 6585)
    legacyHeaders: false,     // Disable X-RateLimit-* legacy headers
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: `Too many requests. Please wait ${windowMinutes} minute(s) and try again.`,
        retryAfter: `${windowMinutes}m`,
      });
    },
  });
};

// ─── Named Limiters ────────────────────────────────────────────────────────────

/** General API limiter: 500 req / 15 min */
export const globalLimiter = createLimiter(500, 15);

/** Strict auth limiter: 10 req / 15 min — blocks credential stuffing */
export const authLimiter = createLimiter(10, 15);

/** EcoBot AI limiter: 30 req / 15 min — prevents abuse of Gemini quota */
export const chatbotLimiter = createLimiter(30, 15);

/** Report export limiter: 10 req / 60 min — prevents bulk CSV scraping */
export const reportLimiter = createLimiter(10, 60);

// ─── XSS / Script-Injection Sanitiser ──────────────────────────────────────────

/**
 * Recursively strip common XSS patterns from any value (string, object, array).
 */
const sanitiseValue = (value) => {
  if (typeof value === 'string') {
    return value
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')  // strip <script> blocks
      .replace(/javascript\s*:/gi, '')                        // strip js: protocol
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')           // strip inline event handlers
      .replace(/on\w+\s*=/gi, '')                             // strip loose event attrs
      .replace(/<iframe[\s\S]*?>/gi, '')                      // strip iframes
      .replace(/<!--[\s\S]*?-->/g, '')                        // strip HTML comments
      .trim();
  }
  if (Array.isArray(value)) return value.map(sanitiseValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, sanitiseValue(v)])
    );
  }
  return value;
};

/**
 * Express middleware: sanitise req.body, req.query, and req.params
 * to prevent stored / reflected XSS attacks.
 */
export const xssSanitiser = (req, _res, next) => {
  if (req.body)   req.body   = sanitiseValue(req.body);
  if (req.query)  req.query  = sanitiseValue(req.query);
  if (req.params) req.params = sanitiseValue(req.params);
  next();
};
