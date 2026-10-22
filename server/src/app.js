const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { sendSuccess } = require('./utils/apiResponse');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Normalize double or multiple slashes (e.g. //syllabus -> /syllabus)
app.use((req, res, next) => {
  if (req.url.includes('//')) {
    req.url = req.url.replace(/\/{2,}/g, '/');
  }
  next();
});

// Base Health Check Route (supports both /health and /api/health)
app.get(['/health', '/api/health'], (req, res) => {
  return sendSuccess(res, {
    status: 'TutaPass API is online',
    architecture: 'PERN Stack + Google Gemini 2.5 Flash',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Mount All Feature REST Routes at BOTH /api and root / for maximum deployment compatibility
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
