const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { sendSuccess } = require('./utils/apiResponse');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Base Health Check Route
app.get('/api/health', (req, res) => {
  return sendSuccess(res, {
    status: 'TutaPass API is online',
    architecture: 'PERN Stack + Google Gemini 3.8 Flash',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Mount All Feature REST Routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
