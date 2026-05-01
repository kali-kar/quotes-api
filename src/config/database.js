'use strict';

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const env = require('./env');
const logger = require('./logger');

let db = null;

/**
 * Returns a singleton SQLite database connection.
 * Creates the database file and schema if they don't exist.
 */
function getDb() {
  if (db) return db;

  const dbPath = path.resolve(env.DB_PATH);
  const dbDir = path.dirname(dbPath);

  // Ensure the directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = new Database(dbPath, {
    verbose: env.isDev ? (msg) => logger.debug({ sql: msg }, 'SQLite query') : null,
  });

  // Enable WAL mode for better concurrent read performance
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');

  _ensureSchema(db);

  logger.info({ dbPath }, 'SQLite database connected');
  return db;
}

/**
 * Creates the quotes table if it doesn't already exist.
 */
function _ensureSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS quotes (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      quote  TEXT    NOT NULL,
      author TEXT    NOT NULL
    );
  `);
}

/**
 * Gracefully close the DB connection (used on SIGTERM/SIGINT).
 */
function closeDb() {
  if (db) {
    db.close();
    db = null;
    logger.info('SQLite database connection closed');
  }
}

module.exports = { getDb, closeDb };
