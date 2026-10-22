const app = require('./app');
const env = require('./config/env');
const { pool } = require('./config/db');

const PORT = env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log('\n======================================================');
  console.log('🚀 TutaPass API Server Running Successfully');
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
  console.log('⚡ AI Engine: Google Gemini Flash with fallback');
  console.log('======================================================\n');

  // Verify PostgreSQL (Neon) connection
  try {
    await pool.query('ALTER TABLE syllabi ADD COLUMN IF NOT EXISTS source_url TEXT;');
    await pool.query(
      `UPDATE syllabi
       SET source_url = 'https://learn.microsoft.com/credentials/certifications/resources/study-guides/az-900'
       WHERE code = 'AZ-900' AND (source_url IS NULL OR source_url = '');`
    );
    const res = await pool.query('SELECT NOW() as current_time');
    console.log('✓ PostgreSQL (Neon) Connected:', res.rows[0].current_time);
  } catch (err) {
    console.warn('⚠️ Warning: DB connection check failed:', err.message);
  }
});

module.exports = server;
