import { Database } from "sqlite3";

const db = new Database("telegram_bot.db");

db.serialize(() => {
  db.run("PRAGMA foreign_keys=off;"); // Disable foreign key constraints

  // Start a transaction
  db.run("BEGIN TRANSACTION;");

  // Create a new `users_temp` table with the modified column name
  db.run(
    `
    CREATE TABLE IF NOT EXISTS users_temp (
      telegramId INTEGER PRIMARY KEY,
      firstName TEXT NOT NULL,
      isBot BOOLEAN NOT NULL CHECK (isBot IN (0, 1)),
      bumpsCounter INTEGER DEFAULT 0,
      encryptedPrivateKey TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      lastName TEXT,
      username TEXT,
      freePassesTotal INTEGER DEFAULT 0,
      freePassesUsed INTEGER DEFAULT 0,
      bumpIntervalInSeconds INTEGER DEFAULT 1,
      bumpAmount REAL DEFAULT 0.0103,
      slippage REAL DEFAULT 0.25, -- Renamed column
      priorityFee REAL DEFAULT 0.01
    );
    `,
    (err) => {
      if (err) {
        console.error("Error creating users_temp table:", err.message);
        return;
      }
      console.log("Temporary users_temp table created successfully.");
    }
  );

  // Copy data from old `users` table to the new `users_temp` table
  db.run(
    `
    INSERT INTO users_temp (
      telegramId, firstName, isBot, bumpsCounter, encryptedPrivateKey, 
      createdAt, updatedAt, lastName, username, freePassesTotal, 
      freePassesUsed, bumpIntervalInSeconds, bumpAmount, slippage, priorityFee
    )
    SELECT 
      telegramId, firstName, isBot, bumpsCounter, encryptedPrivateKey, 
      createdAt, updatedAt, lastName, username, freePassesTotal, 
      freePassesUsed, bumpIntervalInSeconds, bumpAmount, slippagePercentage, priorityFee
    FROM users;
    `,
    (err) => {
      if (err) {
        console.error("Error copying data to users_temp table:", err.message);
        return;
      }
      console.log("Data copied to users_temp successfully.");
    }
  );

  // Drop the original `users` table
  db.run("DROP TABLE users;", (err) => {
    if (err) {
      console.error("Error dropping the original users table:", err.message);
      return;
    }
    console.log("Original users table dropped successfully.");
  });

  // Rename `users_temp` to `users`
  db.run("ALTER TABLE users_temp RENAME TO users;", (err) => {
    if (err) {
      console.error("Error renaming users_temp to users:", err.message);
      return;
    }
    console.log("users_temp table renamed to users successfully.");
  });

  // Commit the transaction
  db.run("COMMIT;");
  db.run("PRAGMA foreign_keys=on;"); // Re-enable foreign key constraints
});
