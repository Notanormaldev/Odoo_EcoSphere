import dotenv from 'dotenv';
dotenv.config();

export const config = {
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || 'ecosphere_jwt_access_secret_production_key_987654321',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'ecosphere_jwt_refresh_secret_production_key_123456789',
  jwtExpiresIn: '15m',
  jwtRefreshExpiresIn: '7d',
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  brevoApiKey: process.env.BREVO_API_KEY,
  googleEmail: process.env.GOOGLE_EMAIL,
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
    password: process.env.REDIS_PASSWORD,
  },
  imagekit: {
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  },
  geminiApiKey: process.env.GOOGLE_GEMINI_API,
  nodeEnv: process.env.NODE_ENVIRONMENT || process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: process.env.CLIENT_URL || (process.env.RENDER ? 'https://odoo-ecosphere.onrender.com' : 'http://localhost:5173'),
  sessionSecret: process.env.SESSION_SECRET || 'ecosphere_secret',
};
