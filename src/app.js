'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const env = require('./config/env');
const rateLimiter = require('./middleware/rateLimiter');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const quoteRoutes = require('./routes/quoteRoutes');
const { sendError } = require('./utils/response');

function createApp() {
  const app = express();

  // ── Trust proxy (required when behind Render/Nginx/Heroku load balancers)
  app.set('trust proxy', 1);

  // ── Security headers
  app.use(helmet());

  // ── CORS
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(','),
      methods: ['GET', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // ── Body parsing (kept lean — API is read-only)
  app.use(express.json({ limit: '16kb' }));

  // ── Request logging (pino)
  app.use(requestLogger);

  // ── Rate limiting (applied globally before routes)
  app.use(rateLimiter);

  // ── API routes
  app.use('/api/v1', quoteRoutes);

  // ── Root — friendly redirect hint
  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Quotes API is running. Visit /api/v1/quote for a random quote.',
      endpoints: {
        randomQuote: '/api/v1/quote',
        health: '/api/v1/health',
      },
    });
  });

  // ── 404 — catch-all for unmatched routes
  app.use((req, res) => {
    sendError(res, `Route ${req.method} ${req.originalUrl} not found.`, 404);
  });

  // ── Central error handler (must be last)
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
