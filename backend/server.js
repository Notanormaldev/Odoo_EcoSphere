import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import dotenv from 'dotenv';

dotenv.config();

import { config } from './src/config/env.js';
import { connectDB } from './src/config/database.js';
import { connectRedis } from './src/config/redis.js';
import { configurePassport } from './src/config/passport.js';
import { errorHandler, notFound } from './src/middleware/errorHandler.js';
import {
  globalLimiter,
  authLimiter,
  chatbotLimiter,
  reportLimiter,
  xssSanitiser,
} from './src/middleware/rateLimiter.js';

// Routes
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import departmentRoutes from './src/routes/departmentRoutes.js';
import environmentalRoutes from './src/routes/environmentalRoutes.js';
import socialRoutes from './src/routes/socialRoutes.js';
import governanceRoutes from './src/routes/governanceRoutes.js';
import gamificationRoutes from './src/routes/gamificationRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';
import chatbotRoutes from './src/routes/chatbotRoutes.js';

import { logger } from './src/utils/logger.js';

const app = express();

// Trust proxy headers for accurate client IP resolution behind Render load balancers
app.set('trust proxy', 1);

// ─── Security & Core Middleware ──────────────────────────────────────────────

/**
 * Helmet — sets security-critical HTTP headers.
 *  • X-Content-Type-Options: nosniff         — prevents MIME sniffing
 *  • X-Frame-Options: DENY                   — prevents clickjacking
 *  • Strict-Transport-Security               — enforces HTTPS in production
 *  • Content-Security-Policy                 — restricts resource origins to block XSS
 */
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc:     ["'self'"],
      scriptSrc:      ["'self'"],                          // no inline scripts
      styleSrc:       ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc:        ["'self'", 'https://fonts.gstatic.com'],
      imgSrc:         ["'self'", 'data:', 'https://ik.imagekit.io'],
      connectSrc:     ["'self'"],
      objectSrc:      ["'none'"],                          // blocks Flash/plugin injection
      frameSrc:       ["'none'"],                          // blocks iframe embedding
      upgradeInsecureRequests: [],
    },
  },
  xssFilter: true,                   // X-XSS-Protection header (older browsers)
  noSniff: true,                     // X-Content-Type-Options: nosniff
  frameguard: { action: 'deny' },    // X-Frame-Options: DENY (clickjacking)
  hsts: config.nodeEnv === 'production'
    ? { maxAge: 31536000, includeSubDomains: true, preload: true }
    : false,                         // only enforce HSTS in production
}));

app.use(cors({
  origin: config.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));       // reduced from 10mb — blocks payload bloat attacks
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// XSS input sanitiser — strips <script>, javascript:, iframe and inline event attrs
// from req.body, req.query, req.params on every request
app.use(xssSanitiser);

// ─── Rate Limiting ───────────────────────────────────────────────────────────

app.use('/api/',             globalLimiter);     // 500 req / 15 min for all API routes
app.use('/api/auth/login',   authLimiter);       // 10 req / 15 min — brute-force protection
app.use('/api/auth/register', authLimiter);      // 10 req / 15 min — registration spam
app.use('/api/chatbot/chat', chatbotLimiter);    // 30 req / 15 min — Gemini API quota protection
app.use('/api/reports',      reportLimiter);     // 10 req / 60 min — bulk CSV scraping prevention

// ─── Passport ────────────────────────────────────────────────────────────────
configurePassport();
app.use(passport.initialize());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/environmental', environmentalRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/governance', governanceRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.nodeEnv,
  });
});

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from 'fs';

// Serve React production build static files if built
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // Direct favicon.ico request fallback (prevents returning SPA index.html)
  app.get('/favicon.ico', (req, res) => {
    const faviconPath = path.join(distPath, 'favicon.svg');
    if (fs.existsSync(faviconPath)) {
      res.setHeader('Content-Type', 'image/svg+xml');
      return res.sendFile(faviconPath);
    }
    res.status(404).end();
  });

  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ─── 404 & Error Handler ─────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
    connectRedis();

    app.listen(config.port, () => {
      logger.info(`EcoSphere API running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Health check: http://localhost:${config.port}/health`);
    });
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', err);
  process.exit(1);
});

startServer();

export default app;
