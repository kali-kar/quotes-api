'use strict';

const http = require('http');
const createApp = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const { closeDb } = require('./config/database');

const app = createApp();
const server = http.createServer(app);

server.listen(env.PORT, () => {
  logger.info(
    {
      port: env.PORT,
      env: env.NODE_ENV,
    },
    `Quotes API server listening on port ${env.PORT}`
  );
});

// ── Graceful shutdown ────────────────────────────────────────────────────────
const SHUTDOWN_TIMEOUT_MS = 10_000;

function shutdown(signal) {
  logger.info({ signal }, 'Shutdown signal received. Closing gracefully…');

  const forceExit = setTimeout(() => {
    logger.error('Graceful shutdown timed out — forcing exit');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  forceExit.unref(); // Don't keep the event loop alive just for this

  server.close(() => {
    logger.info('HTTP server closed');
    closeDb();
    logger.info('Shutdown complete');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception — shutting down');
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled promise rejection — shutting down');
  shutdown('unhandledRejection');
});

module.exports = server; // exported for testing
