'use strict';

const { getRandomQuote } = require('../services/quoteService');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../config/logger');

/**
 * GET /api/v1/quote
 * Returns a random quote from the database.
 */
async function getRandomQuoteHandler(req, res, next) {
  try {
    const quote = getRandomQuote();

    if (!quote) {
      return sendError(res, 'No quotes found in the database.', 404);
    }

    return sendSuccess(res, { quote });
  } catch (err) {
    logger.error({ err }, 'Failed to fetch random quote');
    return next(err);
  }
}

/**
 * GET /api/v1/health
 * Health-check endpoint — used by Render's health probe and uptime monitors.
 */
async function healthCheck(req, res) {
  return sendSuccess(res, {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'quotes-api',
  });
}

module.exports = { getRandomQuoteHandler, healthCheck };
