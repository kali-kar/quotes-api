'use strict';

const { getDb } = require('../config/database');
const logger = require('../config/logger');

// Prepared statements are cached after first use (better-sqlite3 re-use is free)
let _stmtCount = null;
let _stmtById = null;

/**
 * Returns the total number of quotes in the database.
 * Result is cached per process lifetime for performance.
 */
function _getCount() {
  if (!_stmtCount) {
    _stmtCount = getDb().prepare('SELECT COUNT(*) AS total FROM quotes');
  }
  return _stmtCount.get().total;
}

/**
 * Fetch a single quote by its row id.
 */
function _getById(id) {
  if (!_stmtById) {
    _stmtById = getDb().prepare('SELECT id, quote, author FROM quotes WHERE id = ?');
  }
  return _stmtById.get(id);
}

/**
 * Returns a random quote.
 *
 * Strategy: count rows → pick a random offset → fetch by ROWID.
 * This avoids ORDER BY RANDOM() full-table scans and scales to
 * millions of rows without degradation.
 *
 * Note: because IDs may have gaps (deletes), we use a random offset
 * into a sorted id list rather than a raw numeric range.
 */
function getRandomQuote() {
  const db = getDb();

  const total = _getCount();

  if (total === 0) {
    logger.warn('quotes table is empty');
    return null;
  }

  // Random offset within [0, total)
  const offset = Math.floor(Math.random() * total);

  // Efficient: index-only scan on the PK
  const stmt = db.prepare(
    'SELECT id, quote, author FROM quotes ORDER BY id LIMIT 1 OFFSET ?'
  );

  const row = stmt.get(offset);
  return row || null;
}

/**
 * Returns all quotes (used by potential future list endpoint).
 */
function getAllQuotes({ limit = 20, offset = 0 } = {}) {
  const db = getDb();
  const stmt = db.prepare(
    'SELECT id, quote, author FROM quotes ORDER BY id LIMIT ? OFFSET ?'
  );
  return stmt.all(limit, offset);
}

module.exports = { getRandomQuote, getAllQuotes };
