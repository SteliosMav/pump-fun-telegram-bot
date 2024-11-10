import { Database } from "sqlite3";
import { UserModel } from "../types";

const db = new Database("telegram_bot.db");

db.serialize(() => {
  // First, check if the new columns already exist in the table
  db.all("PRAGMA table_info(users)", (err, rows) => {
    if (err) {
      console.error("Error checking table info:", err.message);
      return;
    }

    const existingColumns = rows.map((row: any) => row.name);

    // Add new columns if they do not already exist
    if (!existingColumns.includes("pumpIntervalInSeconds")) {
      db.run(
        `ALTER TABLE users ADD COLUMN pumpIntervalInSeconds INTEGER DEFAULT 1`,
        (err) => {
          if (err) {
            console.log(
              "Column `pumpIntervalInSeconds` already exists or failed to add:",
              err.message
            );
          } else {
            console.log(
              "Added column `pumpIntervalInSeconds` to `users` table."
            );
          }
        }
      );
    }

    if (!existingColumns.includes("pumpAmount")) {
      db.run(
        `ALTER TABLE users ADD COLUMN pumpAmount REAL DEFAULT 0.0103`,
        (err) => {
          if (err) {
            console.log(
              "Column `pumpAmount` already exists or failed to add:",
              err.message
            );
          } else {
            console.log("Added column `pumpAmount` to `users` table.");
          }
        }
      );
    }

    if (!existingColumns.includes("slippagePercentage")) {
      db.run(
        `ALTER TABLE users ADD COLUMN slippagePercentage REAL DEFAULT 0.25`,
        (err) => {
          if (err) {
            console.log(
              "Column `slippagePercentage` already exists or failed to add:",
              err.message
            );
          } else {
            console.log("Added column `slippagePercentage` to `users` table.");
          }
        }
      );
    }

    if (!existingColumns.includes("priorityFee")) {
      db.run(
        `ALTER TABLE users ADD COLUMN priorityFee REAL DEFAULT 0.01`,
        (err) => {
          if (err) {
            console.log(
              "Column `priorityFee` already exists or failed to add:",
              err.message
            );
          } else {
            console.log("Added column `priorityFee` to `users` table.");
          }
        }
      );
    }
  });
});
