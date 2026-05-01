'use strict';

/**
 * Seed script: populates the quotes table with 25 quotes
 * from famous Indian scholars and scientists.
 *
 * Run: node database/seed.js
 * (Also called automatically by `npm run setup`)
 */

require('dotenv').config();

const path = require('path');
const fs   = require('fs');

// Resolve DB path from env (mirrors src/config/env.js without importing the logger)
const DB_PATH = path.resolve(process.env.DB_PATH || './database/quotes.db');
const DB_DIR  = path.dirname(DB_PATH);

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const Database = require('better-sqlite3');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Ensure table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS quotes (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    quote  TEXT    NOT NULL,
    author TEXT    NOT NULL
  );
`);

const QUOTES = [
  // A.P.J. Abdul Kalam
  {
    author: 'A.P.J. Abdul Kalam',
    quote:
      'Dream is not that which you see while sleeping; it is something that does not let you sleep.',
  },
  {
    author: 'A.P.J. Abdul Kalam',
    quote:
      'You have to dream before your dreams can come true.',
  },
  {
    author: 'A.P.J. Abdul Kalam',
    quote:
      'Don\'t take rest after your first victory, because if you fail in second, more lips are waiting to say that your first victory was just luck.',
  },

  // C.V. Raman
  {
    author: 'C.V. Raman',
    quote:
      'Success can come to you by courageous devotion to the task lying in front of you.',
  },
  {
    author: 'C.V. Raman',
    quote:
      'The essence of the scientific spirit is to ask questions and not to be satisfied with anything but a precise, definite, quantitative answer.',
  },

  // Vikram Sarabhai
  {
    author: 'Vikram Sarabhai',
    quote:
      'There are some who question the relevance of space activities in a developing nation. To us, there is no ambiguity of purpose.',
  },
  {
    author: 'Vikram Sarabhai',
    quote:
      'We do not have the fantasy of competing with the economically advanced nations in the exploration of the moon or the planets. But we are convinced that if we are to play a meaningful role nationally, and in the community of nations, we must be second to none in the application of advanced technologies to the real problems of man and society.',
  },

  // Homi J. Bhabha
  {
    author: 'Homi J. Bhabha',
    quote:
      'No power can stop an idea whose time has come. I tell you, nuclear energy is not five years away. It is not ten years away. It is here, now.',
  },
  {
    author: 'Homi J. Bhabha',
    quote:
      'Science and the arts are expressions of the human mind, and I see little difference between them.',
  },

  // Srinivasa Ramanujan
  {
    author: 'Srinivasa Ramanujan',
    quote:
      'An equation for me has no meaning unless it expresses a thought of God.',
  },
  {
    author: 'Srinivasa Ramanujan',
    quote:
      'I have not trodden through the conventional regular course which is followed in a university course, but I am striking out a new path for myself.',
  },

  // Jagadish Chandra Bose
  {
    author: 'Jagadish Chandra Bose',
    quote:
      'The study of nature is the search for truth. The investigator who has the most rigid scientific methods discovers new truths.',
  },
  {
    author: 'Jagadish Chandra Bose',
    quote:
      'All things that exist have a physical basis — even the phenomenon of life itself.',
  },

  // Satyendra Nath Bose
  {
    author: 'Satyendra Nath Bose',
    quote:
      'Science should be used for the welfare of humanity, not for its destruction.',
  },

  // Subrahmanyan Chandrasekhar
  {
    author: 'Subrahmanyan Chandrasekhar',
    quote:
      'The pursuit of science has often been compared to the scaling of mountains, high and not so high. But who amongst us can hope, even in imagination, to scale the Everest and reach its summit when the sky is blue and the air is still?',
  },
  {
    author: 'Subrahmanyan Chandrasekhar',
    quote:
      'There is no permanent place in the world for ugly mathematics.',
  },

  // Meghnad Saha
  {
    author: 'Meghnad Saha',
    quote:
      'Pure science and its practical applications are but two aspects of man\'s effort to understand and to command nature.',
  },

  // Har Gobind Khorana
  {
    author: 'Har Gobind Khorana',
    quote:
      'The desire to understand life at the molecular level has always been my central motivation in science.',
  },

  // Prasanta Chandra Mahalanobis
  {
    author: 'Prasanta Chandra Mahalanobis',
    quote:
      'Statistics is the science of learning from experience, especially experience that arrives a little bit at a time.',
  },

  // Birbal Sahni
  {
    author: 'Birbal Sahni',
    quote:
      'The fossil record is the autobiography of life written on stone — patient in its truth and boundless in its scope.',
  },

  // Swami Vivekananda (scholar / philosopher)
  {
    author: 'Swami Vivekananda',
    quote:
      'Arise, awake, and stop not until the goal is reached.',
  },
  {
    author: 'Swami Vivekananda',
    quote:
      'Take up one idea. Make that one idea your life — think of it, dream of it, live on that idea. Let the brain, muscles, nerves, every part of your body be full of that idea, and just leave every other idea alone.',
  },

  // Rabindranath Tagore (poet / scholar)
  {
    author: 'Rabindranath Tagore',
    quote:
      'You can\'t cross the sea merely by standing and staring at the water.',
  },
  {
    author: 'Rabindranath Tagore',
    quote:
      'The highest education is that which does not merely give us information but makes our life in harmony with all existence.',
  },

  // Aryabhata
  {
    author: 'Aryabhata',
    quote:
      'Just as a boat in the water, the Earth floats in space — held not by ropes, but by the laws of the universe.',
  },
];

// Use a transaction for atomic, fast bulk insert
const insertMany = db.transaction((quotes) => {
  const stmt = db.prepare(
    'INSERT INTO quotes (quote, author) VALUES (@quote, @author)'
  );

  let inserted = 0;
  for (const row of quotes) {
    // Skip exact duplicates that may already be seeded
    const exists = db
      .prepare('SELECT 1 FROM quotes WHERE quote = ? LIMIT 1')
      .get(row.quote);
    if (!exists) {
      stmt.run(row);
      inserted++;
    }
  }
  return inserted;
});

const inserted = insertMany(QUOTES);
const total    = db.prepare('SELECT COUNT(*) AS n FROM quotes').get().n;

console.log(`✅  Seed complete — ${inserted} new row(s) inserted. Total in DB: ${total}`);
db.close();
