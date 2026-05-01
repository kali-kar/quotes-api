'use strict';

const logger = require('../config/logger');
const env = require('../config/env');

/**
 * Central Express error-handling middleware.
 * Must be registered LAST in app.js (4-argument signature).
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(
    {
      err: {
        message: err.message,
        stack: err.stack,
        code: err.code,
      },
      method: req.method,
      url: req.originalUrl,
      statusCode,
    },
    'Unhandled error'
  );

  const body = {
    success: false,
    error: message,
  };

  // Expose stack trace only in development
  if (env.isDev && err.stack) {
    body.stack = err.stack;
  }

  return res.status(statusCode).json(body);
}

module.exports = errorHandler;
