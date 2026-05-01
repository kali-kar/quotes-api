'use strict';

const rateLimit = require('express-rate-limit');
const env = require('../config/env');

/**
 * Rate limiter: 60 requests per minute per IP by default.
 *
 * Redis store can be plugged in here when REDIS_URL is present:
 *   const RedisStore = require('rate-limit-redis');
 *   const { createClient } = require('redis');
 *
 * For now we use the in-memory store (stateless per process).
 * Behind a load-balancer, upgrade to a shared Redis store.
 */
const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,   // Return RateLimit-* headers
  legacyHeaders: false,     // Disable X-RateLimit-* headers
  message: {
    success: false,
    error: 'Too many requests. Please slow down and try again later.',
  },
  skip: (req) => req.path === '/api/v1/health', // Health checks are never rate-limited
});

module.exports = rateLimiter;
