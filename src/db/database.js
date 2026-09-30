const Database = require("better-sqlite3");
const path = require("node:path");
const fs = require("node:fs");

const DATABASE_PATH = process.env.DATABASE_PATH || "./data/catatan.db";

// Pastikan folder untuk file database sudah ada
const dbDir = path.dirname(DATABASE_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DATABASE_PATH);
db.pragma("journal_mode = WAL");

// Buat tabel kalau belum ada
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

module.exports = db;
