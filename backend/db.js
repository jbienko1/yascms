const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '..', 'data.sqlite');
let db;

function getDb() {
  if (!db) {
    db = new sqlite3.Database(dbPath);
  }
  return db;
}

function run(query, params = []) {
  return new Promise((resolve, reject) => {
    getDb().run(query, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function all(query, params = []) {
  return new Promise((resolve, reject) => {
    getDb().all(query, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function get(query, params = []) {
  return new Promise((resolve, reject) => {
    getDb().get(query, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

async function initDb() {
  await run(`
    CREATE TABLE IF NOT EXISTS faq (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 1,
      show_on_home INTEGER DEFAULT 0
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      is_published INTEGER DEFAULT 1
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS kb_articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      category TEXT,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      is_published INTEGER DEFAULT 1,
      show_on_home INTEGER DEFAULT 0
    )
  `);

  // Prosta migracja dla istniejących baz – ignoruje błąd duplikacji kolumny
  try {
    await run('ALTER TABLE faq ADD COLUMN show_on_home INTEGER DEFAULT 0');
  } catch (e) {}
  try {
    await run(
      'ALTER TABLE kb_articles ADD COLUMN show_on_home INTEGER DEFAULT 0'
    );
  } catch (e) {}
  try {
    await run('ALTER TABLE blog_posts ADD COLUMN show_on_home INTEGER DEFAULT 0');
  } catch (e) {}
}

module.exports = {
  getDb,
  run,
  all,
  get,
  initDb
};

