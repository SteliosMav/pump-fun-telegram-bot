import { Database } from "sqlite3";

const db = new Database("telegram_bot.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      telegramId INTEGER PRIMARY KEY,
      firstName TEXT NOT NULL,
      isBot BOOLEAN NOT NULL CHECK (isBot IN (0, 1)), -- Stored as 0 (false) or 1 (true)
      pumpsCounter INTEGER DEFAULT 0,
      encryptedPrivateKey TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')), -- SQLite current timestamp as ISO 8601
      updatedAt TEXT DEFAULT (datetime('now')),
      lastName TEXT,
      username TEXT
    )
  `);
});
