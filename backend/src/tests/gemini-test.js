import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function runGeminiTest() {
  const apiKey = process.env.GOOGLE_GEMINI_API;
  console.log('Testing Google Gemini connection via LangChain...');

  if (!apiKey) {
    console.error('Failure: GOOGLE_GEMINI_API key is not configured in .env file.');
    process.exit(1);
  }

  try {
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.0-flash',
      apiKey: apiKey,
      temperature: 0.7,
    });

    const messages = [
      new SystemMessage('You are a helpful assistant.'),
      new HumanMessage('Hello, say active to confirm connection.'),
    ];

    console.log('Invoking model...');
    const response = await model.invoke(messages);
    console.log('Gemini reply:', response.content);
  } catch (error) {
    console.error('Gemini connection test failed with error:', error.message);
  }
  process.exit();
}

runGeminiTest();
