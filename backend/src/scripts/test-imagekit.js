import { getImageKit } from '../config/imagekit.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

function runImageKitTest() {
  console.log('Testing ImageKit instantiation...');
  try {
    const ik = getImageKit();
    if (ik) {
      console.log('Success! ImageKit initialized successfully.');
      console.log('Public Key configured:', process.env.IMAGEKIT_PUBLIC_KEY ? 'Yes' : 'No');
      console.log('URL Endpoint:', process.env.IMAGEKIT_URL_ENDPOINT);
    } else {
      console.warn('Warning: ImageKit was not instantiated. Keys are missing.');
    }
  } catch (error) {
    console.error('ImageKit test failed with error:', error.message);
  }
  process.exit();
}

runImageKitTest();
