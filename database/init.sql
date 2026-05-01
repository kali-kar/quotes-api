-- quotes-api: Schema definition
-- Run via: sqlite3 database/quotes.db < database/init.sql
-- (The Node app auto-runs this on first boot via database.js)

PRAGMA journal_mode = WAL;
PRAGMA synchronous  = NORMAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS quotes (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  quote  TEXT    NOT NULL,
  author TEXT    NOT NULL
);
