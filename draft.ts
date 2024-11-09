import { SOLANA_PAYER_PRIVATE_KEY } from "src/constants";
import { UserService } from "src/users/user.service";

const userService = new UserService();

const encrypted = userService.encryptPrivateKey(SOLANA_PAYER_PRIVATE_KEY);
const decrypted = userService.decryptPrivateKey(encrypted);
console.log("Original: ", SOLANA_PAYER_PRIVATE_KEY);
console.log("Encrypted: ", encrypted);
console.log("Decrypted: ", decrypted);
const shouldBeEqual = decrypted === SOLANA_PAYER_PRIVATE_KEY;
console.log("Decrypted equals original: ", shouldBeEqual);

// import sqlite3 from "sqlite3";
// const db = new sqlite3.Database("./bot_database.db"); // Creates a file-based database

// interface User {
//   telegramId: number;
//   firstName: string;
//   isBot: boolean;
//   pumpsCounter: number;
//   createdAt: string; // Stored as ISO 8601 text or integer timestamp
//   updatedAt: string; // Stored as ISO 8601 text or integer timestamp
//   lastName?: string;
//   username?: string;
// }

// db.serialize(() => {
//   db.run(`
//     CREATE TABLE IF NOT EXISTS users (
//       telegramId INTEGER PRIMARY KEY,
//       firstName TEXT NOT NULL,
//       isBot BOOLEAN NOT NULL CHECK (isBot IN (0, 1)), -- Stored as 0 (false) or 1 (true)
//       pumpsCounter INTEGER DEFAULT 0,
//       encryptedPrivateKey TEXT NOT NULL,
//       createdAt TEXT DEFAULT (datetime('now')), -- SQLite current timestamp as ISO 8601
//       updatedAt TEXT DEFAULT (datetime('now')),
//       lastName TEXT,
//       username TEXT
//     )
//   `);
// });

console.log("Hello World!");
