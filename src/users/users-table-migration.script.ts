import { Database } from "sqlite3";

const db = new Database("telegram_bot.db");

db.serialize(() => {
  // Check if new columns already exist, then add them only if they don't
  db.get("PRAGMA table_info(users)", (err, rows) => {
    if (err) {
      console.error("Error checking table info:", err.message);
      return;
    }

    // Adding the new fields: `freePassesTotal` and `freePassesUsed`
    db.run(
      `ALTER TABLE users ADD COLUMN freePassesTotal INTEGER DEFAULT 0`,
      (err) => {
        if (err) {
          console.log(
            "Column `freePassesTotal` already exists or failed to add:",
            err.message
          );
        } else {
          console.log("Added column `freePassesTotal` to `users` table.");
        }
      }
    );

    db.run(
      `ALTER TABLE users ADD COLUMN freePassesUsed INTEGER DEFAULT 0`,
      (err) => {
        if (err) {
          console.log(
            "Column `freePassesUsed` already exists or failed to add:",
            err.message
          );
        } else {
          console.log("Added column `freePassesUsed` to `users` table.");
        }
      }
    );
  });
});
