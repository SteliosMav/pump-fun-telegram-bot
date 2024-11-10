import CryptoJS from "crypto-js";
import { ENCRYPTION_KEY } from "src/constants";
import { User, UserModel } from "./types";
import { Database } from "sqlite3";

export class UserService {
  constructor(private _db: Database) {}

  async create(user: User): Promise<User | null> {
    // Calculate the current date once in ISO format
    const isoDate = new Date().toISOString();

    // Encrypt the private key
    const encryptedPrivateKey = this._encryptPrivateKey(user.privateKey);

    return new Promise((resolve, reject) => {
      this._db.run(
        `INSERT INTO users (
            telegramId, encryptedPrivateKey, firstName, isBot, pumpsCounter, createdAt, updatedAt, lastName, username
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.telegramId,
          encryptedPrivateKey,
          user.firstName,
          user.isBot ? 1 : 0,
          user.bumpsCounter,
          isoDate,
          isoDate,
          user.lastName,
          user.username,
        ],
        (err) => {
          if (err) {
            console.error("Error creating user:", err.message);
            reject(err);
          } else {
            const newUser: User = {
              ...user,
              createdAt: isoDate,
              updatedAt: isoDate,
            };
            resolve(newUser);
          }
        }
      );
    });
  }

  async getUser(telegramId: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this._db.get<UserModel>(
        "SELECT * FROM users WHERE telegramId = ?",
        [telegramId],
        (err, row) => {
          if (err) {
            console.error("Error executing query:", err.message);
            reject(err);
          } else {
            if (row) {
              // Decrypt the private key if the row is found
              const { encryptedPrivateKey, ...userWithoutPrivateKey } = row;
              const privateKey = this._decryptPrivateKey(encryptedPrivateKey);
              const user: User = {
                ...userWithoutPrivateKey,
                privateKey,
              };
              resolve(user);
            } else {
              resolve(null);
            }
          }
        }
      );
    });
  }

  async getPrivateKey(telegramId: number): Promise<string | null> {
    // Return a promise to handle asynchronous behavior
    return new Promise((resolve, reject) => {
      this._db.get<UserModel>(
        "SELECT encryptedPrivateKey FROM users WHERE telegramId = ?",
        [telegramId],
        (err, row) => {
          if (err) {
            console.error("Error executing query:", err.message);
            return reject(err);
          }

          if (row) {
            // Decrypt the private key if the row is found
            const privateKey = this._decryptPrivateKey(row.encryptedPrivateKey);
            resolve(privateKey);
          } else {
            resolve(null); // Resolve as null if user is not found
          }
        }
      );
    });
  }

  async getFreePasses(telegramId: number): Promise<number | null> {
    try {
      // Fetch the user from the database
      const row = await new Promise<UserModel | undefined>(
        (resolve, reject) => {
          this._db.get<UserModel>(
            "SELECT freePassesTotal, freePassesUsed FROM users WHERE telegramId = ?",
            [telegramId],
            (err, row) => {
              if (err) reject(err);
              else resolve(row);
            }
          );
        }
      );

      // If the user is not found, return null
      if (!row) return null;

      // Calculate the free passes left
      const freePassesLeft = row.freePassesTotal - row.freePassesUsed;
      return freePassesLeft;
    } catch (err) {
      console.error("Error in getFreePasses:", err);
      return null;
    }
  }

  async giveFreePass(telegramId: number): Promise<number | null> {
    try {
      // Fetch the user from the database
      const row = await new Promise<UserModel | undefined>(
        (resolve, reject) => {
          this._db.get<UserModel>(
            "SELECT * FROM users WHERE telegramId = ?",
            [telegramId],
            (err, row) => {
              if (err) reject(err);
              else resolve(row);
            }
          );
        }
      );

      // If the user is not found, return null
      if (!row) return null;

      // Update the freePassesTotal
      const updatedFreePassesTotal = row.freePassesTotal + 1;

      // Perform the update query
      await new Promise<void>((resolve, reject) => {
        this._db.run(
          `UPDATE users SET freePassesTotal = ? WHERE telegramId = ?`,
          [updatedFreePassesTotal, telegramId],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Free passes left
      const freePassesLeft = updatedFreePassesTotal - row.freePassesUsed;
      return freePassesLeft;
    } catch (err) {
      console.error("Error in giveFreePass:", err);
      return null;
    }
  }

  private _encryptPrivateKey(privateKey: string) {
    return CryptoJS.AES.encrypt(privateKey, ENCRYPTION_KEY).toString();
  }

  private _decryptPrivateKey(encryptedPrivateKey: string) {
    const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
