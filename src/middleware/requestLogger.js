'use strict';

const logger = require('../config/logger');

/**
 * Minimal, allocation-efficient request/response logger.
 * Logs method, url, status, and response time in milliseconds.
 */
function requestLogger(req, res, next) {
  const startTime = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;

    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: parseFloat(durationMs.toFixed(3)),
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };

    if (res.statusCode >= 500) {
      logger.error(logData, 'request completed with server error');
    } else if (res.statusCode >= 400) {
      logger.warn(logData, 'request completed with client error');
    } else {
      logger.info(logData, 'request completed');
    }
  });

  next();
}

module.exports = requestLogger;
