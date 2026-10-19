const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === 'your_key_here') {
  console.log('Error: GEMINI_API_KEY is missing or set to placeholder in server/.env.');
  console.log('Please add your actual Gemini API key to server/.env and run again.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function testAI() {
  const models = ['gemini-3.8-flash', 'gemini-2.5-flash'];
  let lastError = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: 'Hello! Respond with: Ready',
      });

      if (response && response.text) {
        console.log({ status: "TutaPass AI is online!" });
        return;
      }
    } catch (err) {
      lastError = err;
      // Continue to next model fallback
    }
  }

  console.error('Failed to communicate with Gemini API:', lastError?.message || lastError);
  process.exit(1);
}

testAI();
