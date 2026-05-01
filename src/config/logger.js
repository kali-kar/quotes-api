'use strict';

const pino = require('pino');
const env = require('./env');

const logger = pino({
  level: env.isProd ? 'info' : 'debug',
  ...(env.isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
  base: {
    service: 'quotes-api',
    env: env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

module.exports = logger;
