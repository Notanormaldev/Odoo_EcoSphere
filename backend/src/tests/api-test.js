import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testHealth() {
  try {
    console.log('Testing health endpoint...');
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('Health check passed:', response.data);
  } catch (error) {
    console.error('Health check failed:', error.message);
  }
}

testHealth();
