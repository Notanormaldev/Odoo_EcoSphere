import { getESGQueue } from '../config/bullmq.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

function runBullMQTest() {
  console.log('Testing BullMQ Queue Instantiation...');
  try {
    const queue = getESGQueue();
    if (queue) {
      console.log('Success! BullMQ queue instantiated successfully.');
      console.log('Queue Name:', queue.name);
    } else {
      console.warn('Warning: BullMQ queue was not instantiated.');
    }
  } catch (error) {
    console.error('BullMQ test failed with error:', error.message);
  }
  process.exit();
}

runBullMQTest();
