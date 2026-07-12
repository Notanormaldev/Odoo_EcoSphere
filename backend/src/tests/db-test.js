import { connectDB } from '../config/database.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function runDBTest() {
  console.log('Testing MongoDB connection and User schema...');
  try {
    await connectDB();
    console.log('Fetching database administrator user...');
    const admin = await User.findOne({ role: 'admin' });

    if (admin) {
      console.log(`Success! Found admin user: ${admin.name} (${admin.email})`);
    } else {
      console.warn('MongoDB Connected, but no admin user found. Run the seed script.');
    }
  } catch (error) {
    console.error('MongoDB database connection verification failed:', error.message);
  }
  process.exit();
}

runDBTest();
