import { connectRedis, blacklistToken, isTokenBlacklisted } from '../config/redis.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function runRedisTest() {
  console.log('Testing Redis connection and blacklist logic...');
  try {
    connectRedis();

    const mockToken = 'mock_jwt_token_for_validation_purposes';
    const duration = 10; // seconds

    console.log(`Blacklisting mock token for ${duration}s...`);
    await blacklistToken(mockToken, duration);

    console.log('Checking blacklist state...');
    const isBlacklisted = await isTokenBlacklisted(mockToken);

    if (isBlacklisted) {
      console.log('Success! Token is correctly identified as blacklisted.');
    } else {
      console.error('Failure: Token was not blacklisted in Redis store.');
    }
  } catch (error) {
    console.error('Redis verification failed with error:', error.message);
  }
  process.exit();
}

runRedisTest();
