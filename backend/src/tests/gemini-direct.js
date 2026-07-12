import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function runDirectGeminiTest() {
  const apiKey = process.env.GOOGLE_GEMINI_API;
  console.log('Testing direct Gemini REST API endpoint...');

  if (!apiKey) {
    console.error('Failure: GOOGLE_GEMINI_API key is not configured in .env file.');
    process.exit(1);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [
              { text: 'Say active to confirm connection.' }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Gemini REST API Success! Reply:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Gemini REST API Failed with error:', error.response?.data || error.message);
  }
  process.exit();
}

runDirectGeminiTest();
