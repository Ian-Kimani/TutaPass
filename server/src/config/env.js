const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const PORT = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!DATABASE_URL) {
  console.warn('⚠️ Warning: DATABASE_URL is not set in server/.env');
}

if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_key_here') {
  console.warn('⚠️ Warning: GEMINI_API_KEY is not configured or using placeholder in server/.env');
}

module.exports = {
  PORT,
  DATABASE_URL,
  GEMINI_API_KEY,
};
