'use strict';

const { Router } = require('express');
const { getRandomQuoteHandler, healthCheck } = require('../controllers/quoteController');

const router = Router();

/**
 * @route  GET /api/v1/quote
 * @desc   Returns a single random quote from a famous Indian scholar/scientist
 * @access Public
 */
router.get('/quote', getRandomQuoteHandler);

/**
 * @route  GET /api/v1/health
 * @desc   Health-check — uptime, timestamp, service name
 * @access Public
 */
router.get('/health', healthCheck);

module.exports = router;
