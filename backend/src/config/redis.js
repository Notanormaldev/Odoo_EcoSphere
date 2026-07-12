import Redis from 'ioredis';
import { config } from './env.js';

let redisClient = null;

export const connectRedis = () => {
  if (redisClient) return redisClient;

  redisClient = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    tls: {},
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: true,
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis Connected');
  });

  redisClient.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
  });

  redisClient.on('reconnecting', () => {
    console.warn('⚠️  Redis reconnecting...');
  });

  return redisClient;
};

export const getRedisClient = () => {
  if (!redisClient) {
    return connectRedis();
  }
  return redisClient;
};

// Token blacklisting helpers
export const blacklistToken = async (token, expiresInSeconds) => {
  const client = getRedisClient();
  await client.setex(`bl:${token}`, expiresInSeconds, 'blacklisted');
};

export const isTokenBlacklisted = async (token) => {
  const client = getRedisClient();
  const result = await client.get(`bl:${token}`);
  return result !== null;
};

// Cache helpers
export const setCache = async (key, value, expiresInSeconds = 300) => {
  const client = getRedisClient();
  await client.setex(key, expiresInSeconds, JSON.stringify(value));
};

export const getCache = async (key) => {
  const client = getRedisClient();
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
};

export const deleteCache = async (key) => {
  const client = getRedisClient();
  await client.del(key);
};
