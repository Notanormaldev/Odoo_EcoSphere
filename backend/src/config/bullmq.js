import { Queue, Worker } from 'bullmq';
import { config } from './env.js';

const connection = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password
};

let esgQueue = null;

export const getESGQueue = () => {
  if (esgQueue) return esgQueue;

  try {
    esgQueue = new Queue('esg-tasks', { connection });
    console.log('✅ BullMQ Task Queue Initialized');
  } catch (error) {
    console.error('❌ Failed to initialize task queue:', error.message);
  }

  return esgQueue;
};
