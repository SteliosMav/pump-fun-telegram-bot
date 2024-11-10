import { Database } from "sqlite3";

const db = new Database("telegram_bot.db");

db.serialize(() => {
  // --- Table Initialization & Column Creation ---

  // Create the users table if it doesn't already exist
  db.run(
    `
    CREATE TABLE IF NOT EXISTS users (
      telegramId INTEGER PRIMARY KEY,
      firstName TEXT NOT NULL,
      isBot BOOLEAN NOT NULL CHECK (isBot IN (0, 1)), -- Stored as 0 (false) or 1 (true)
      bumpsCounter INTEGER DEFAULT 0,
      encryptedPrivateKey TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')), -- SQLite current timestamp as ISO 8601
      updatedAt TEXT DEFAULT (datetime('now')),
      lastName TEXT,
      username TEXT,
      -- New fields added in migration 1 and 2
      freePassesTotal INTEGER DEFAULT 0,
      freePassesUsed INTEGER DEFAULT 0,
      bumpIntervalInSeconds INTEGER DEFAULT 1,
      bumpAmount REAL DEFAULT 0.0103,
      slippagePercentage REAL DEFAULT 0.25,
      priorityFee REAL DEFAULT 0.01
    )
  `,
    (err) => {
      if (err) {
        console.error(
          "Error creating or updating the users table:",
          err.message
        );
      } else {
        console.log(
          "Users table created or already exists, and columns initialized."
        );
      }
    }
  );
});
